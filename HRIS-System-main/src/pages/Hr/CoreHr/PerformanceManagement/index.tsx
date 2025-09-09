import React, { useState, useEffect } from 'react';
import {
  TrendingUp, Target, Users, Award, BarChart3, Calendar, Star,
  AlertTriangle, Plus, Filter, Download, Eye, Edit, User, X,
  Save, Loader2, Search, CheckCircle, AlertCircle, Settings,
  Upload, FileText, Clock, Zap, Activity, PieChart
} from 'lucide-react';

// Firebase imports
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  doc,
  query,
  orderBy,
  where,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../../../../config/firebase'; // Adjust path as needed

// Import Employee Service
import { getEmployeeService, IEmployeeService } from '../../../../services/employeeService';
import { Employee } from '../CoreHr/EmployeeManagement/types';

interface PerformanceReview {
  id: string;
  employeeId: string;
  name: string;
  department: string;
  position: string;
  rating: number;
  feedback: string;
  goals: string;
  nextSteps: string;
  status: string;
  completedGoals: number;
  totalGoals: number;
  email?: string;
  hireDate?: string;
  lastReviewDate?: string;
  createdAt?: any;
  updatedAt?: any;
  reviewHistory?: Array<{
    date: string;
    rating: number;
    status: string;
  }>;
}

const departments = ['All Departments', 'Engineering', 'Marketing', 'Sales', 'HR', 'Finance'];
const performanceStatuses = ['All Statuses', 'Exceeding', 'Meeting', 'Needs Improvement'];

// Employee Drawer Component
const EmployeeDrawer = ({ open, onOpenChange, employee, onEditReview }) => {
  if (!employee) return null;

  return (
    <div className={`fixed inset-0 z-50 transition-opacity ${open ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
      <div className="absolute inset-0 bg-black/50" onClick={() => onOpenChange(false)} />
      <div className={`fixed right-0 top-0 h-full w-96 bg-white shadow-xl transform transition-transform duration-300 ${open ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="p-6 border-b">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Employee Details</h2>
            <button onClick={() => onOpenChange(false)} className="p-2 hover:bg-gray-100 rounded-full">
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
              <User className="h-8 w-8 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">{employee.name}</h3>
              <p className="text-gray-600">{employee.position}</p>
              <p className="text-sm text-gray-500">{employee.department}</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-500">Email</label>
              <p className="text-sm">{employee.email}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Hire Date</label>
              <p className="text-sm">{employee.hireDate}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Last Review</label>
              <p className="text-sm">{employee.lastReviewDate}</p>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-2">Current Rating</h4>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold">{employee.rating}</span>
              <div className="flex gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 ${i < Math.floor(employee.rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                  />
                ))}
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-2">Performance Feedback</h4>
            <p className="text-sm text-gray-600">{employee.feedback}</p>
          </div>

          <div>
            <h4 className="font-semibold mb-2">Goals & Progress</h4>
            <p className="text-sm text-gray-600 mb-2">{employee.goals}</p>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">{employee.completedGoals}/{employee.totalGoals}</span>
              <div className="flex-1 h-2 bg-gray-200 rounded-full">
                <div
                  className="h-full bg-blue-500 rounded-full"
                  style={{ width: `${(employee.completedGoals / employee.totalGoals) * 100}%` }}
                />
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-2">Next Steps</h4>
            <p className="text-sm text-gray-600">{employee.nextSteps}</p>
          </div>

          {employee.reviewHistory && employee.reviewHistory.length > 0 && (
            <div>
              <h4 className="font-semibold mb-2">Review History</h4>
              <div className="space-y-2">
                {employee.reviewHistory.map((review, index) => (
                  <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                    <span className="text-sm">{review.date}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{review.rating}</span>
                      <span className={`text-xs px-2 py-1 rounded ${review.status === 'Exceeding' ? 'bg-green-100 text-green-800' :
                        review.status === 'Meeting' ? 'bg-blue-100 text-blue-800' :
                          'bg-orange-100 text-orange-800'
                        }`}>
                        {review.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <button
            onClick={() => onEditReview(employee)}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2"
          >
            <Edit className="h-4 w-4" />
            Edit Review
          </button>
        </div>
      </div>
    </div>
  );
};

export default function PerformanceManagement() {
  // State management
  const [selectedDepartment, setSelectedDepartment] = useState('All Departments');
  const [selectedStatus, setSelectedStatus] = useState('All Statuses');
  const [selectedEmployee, setSelectedEmployee] = useState('All Employees');
  const [searchQuery, setSearchQuery] = useState('');
  const [performanceReviews, setPerformanceReviews] = useState<PerformanceReview[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [employeeService, setEmployeeService] = useState<IEmployeeService | null>(null);

  // Dialog states
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [editingReview, setEditingReview] = useState<PerformanceReview | null>(null);
  const [selectedEmployeeForDrawer, setSelectedEmployeeForDrawer] = useState<PerformanceReview | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Form state
  const [reviewForm, setReviewForm] = useState({
    employeeId: '',
    rating: 5,
    feedback: '',
    goals: '',
    nextSteps: '',
    completedGoals: 0,
    totalGoals: 10
  });

  const [formValidation, setFormValidation] = useState({
    employeeId: true,
    feedback: true,
    goals: true
  });

  // Initialize Employee Service
  useEffect(() => {
    const initializeService = async () => {
      try {
        const service = await getEmployeeService();
        setEmployeeService(service);
      } catch (error) {
        console.error('Failed to initialize employee service:', error);
        setError('Failed to initialize employee service. Please refresh the page.');
      }
    };

    initializeService();
  }, []);

  // Load employees using Employee Service
  const fetchEmployees = async () => {
    if (!employeeService) return;

    try {
      setError('');
      const employeesList = await employeeService.getEmployees();
      console.log('Fetched employees:', employeesList); // Debug log
      setEmployees(employeesList);
    } catch (err) {
      console.error('Error fetching employees:', err);
      setError('Failed to load employees. Please check your connection.');
    }
  };

  // Load performance reviews from Firebase
  const fetchPerformanceReviews = async () => {
    try {
      setLoading(true);
      setError('');

      const reviewsRef = collection(db, 'performance_reviews');
      const reviewsQuery = query(reviewsRef, orderBy('createdAt', 'desc'));
      const reviewsSnapshot = await getDocs(reviewsQuery);

      const reviewsList: PerformanceReview[] = reviewsSnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          // Convert Firestore timestamps to readable dates
          createdAt: data.createdAt?.toDate?.() || new Date(),
          updatedAt: data.updatedAt?.toDate?.() || new Date(),
          lastReviewDate: data.lastReviewDate || new Date().toISOString().split('T')[0]
        } as PerformanceReview;
      });

      console.log('Fetched performance reviews:', reviewsList); // Debug log
      setPerformanceReviews(reviewsList);
    } catch (err) {
      setError('Failed to load performance reviews. Please try again.');
      console.error('Error fetching reviews:', err);
    } finally {
      setLoading(false);
    }
  };

  // Load data when employee service is ready
  useEffect(() => {
    if (employeeService) {
      const loadData = async () => {
        await Promise.all([
          fetchEmployees(),
          fetchPerformanceReviews()
        ]);
      };

      loadData();
    }
  }, [employeeService]);

  // Clear success/error messages after 5 seconds
  useEffect(() => {
    if (success || error) {
      const timer = setTimeout(() => {
        setSuccess('');
        setError('');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [success, error]);

  // Filter logic
  const filteredPerformanceReviews = performanceReviews.filter(review => {
    const matchesDepartment = selectedDepartment === 'All Departments' || review.department === selectedDepartment;
    const matchesStatus = selectedStatus === 'All Statuses' || review.status === selectedStatus;
    const matchesEmployee = selectedEmployee === 'All Employees' || review.name === selectedEmployee;
    const matchesSearch = searchQuery === '' ||
      review.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      review.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
      review.position.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesDepartment && matchesStatus && matchesEmployee && matchesSearch;
  });

  // Form validation
  const validateForm = (form: typeof reviewForm): boolean => {
    const validation = {
      employeeId: form.employeeId !== '',
      feedback: form.feedback.trim() !== '',
      goals: form.goals.trim() !== ''
    };

    setFormValidation(validation);
    return Object.values(validation).every(Boolean);
  };

  // Get performance status based on rating
  const getPerformanceStatus = (rating: number): string => {
    if (rating >= 4.5) return 'Exceeding';
    if (rating >= 3.5) return 'Meeting';
    return 'Needs Improvement';
  };

  // Handle form submission
  const handleSubmitReview = async () => {
    if (!validateForm(reviewForm)) {
      setError('Please fill in all required fields.');
      return;
    }

    try {
      setSubmitting(true);
      setError('');

      // Get employee details using the service
      const selectedEmployeeData = employees.find(emp => emp.id.toString() === reviewForm.employeeId);
      if (!selectedEmployeeData) {
        setError('Selected employee not found.');
        return;
      }

      const reviewData = {
        employeeId: reviewForm.employeeId,
        name: selectedEmployeeData.name,
        department: selectedEmployeeData.department,
        position: selectedEmployeeData.role, // Map role to position
        email: selectedEmployeeData.email,
        hireDate: selectedEmployeeData.hireDate,
        rating: reviewForm.rating,
        feedback: reviewForm.feedback,
        goals: reviewForm.goals,
        nextSteps: reviewForm.nextSteps,
        status: getPerformanceStatus(reviewForm.rating),
        completedGoals: reviewForm.completedGoals,
        totalGoals: reviewForm.totalGoals,
        lastReviewDate: new Date().toISOString().split('T')[0],
        updatedAt: serverTimestamp()
      };

      if (editingReview) {
        // Update existing review
        const reviewRef = doc(db, 'performance_reviews', editingReview.id);
        await updateDoc(reviewRef, reviewData);

        setPerformanceReviews(prev => prev.map(review =>
          review.id === editingReview.id
            ? { ...review, ...reviewData, id: editingReview.id }
            : review
        ));
        setSuccess('Performance review updated successfully!');
      } else {
        // Add new review
        const reviewsRef = collection(db, 'performance_reviews');
        const docRef = await addDoc(reviewsRef, {
          ...reviewData,
          createdAt: serverTimestamp()
        });

        const newReview: PerformanceReview = {
          ...reviewData,
          id: docRef.id,
          createdAt: new Date(),
          updatedAt: new Date()
        } as PerformanceReview;

        setPerformanceReviews(prev => [newReview, ...prev]);
        setSuccess('Performance review added successfully!');
      }

      // Reset form and close dialog
      setReviewForm({
        employeeId: '',
        rating: 5,
        feedback: '',
        goals: '',
        nextSteps: '',
        completedGoals: 0,
        totalGoals: 10
      });
      setEditingReview(null);
      setReviewDialogOpen(false);

    } catch (err) {
      setError('Failed to save performance review. Please try again.');
      console.error('Error saving review:', err);
    } finally {
      setSubmitting(false);
    }
  };

  // Handle edit review
  const handleEditReview = (review: PerformanceReview) => {
    setEditingReview(review);
    setReviewForm({
      employeeId: review.employeeId,
      rating: review.rating,
      feedback: review.feedback,
      goals: review.goals,
      nextSteps: review.nextSteps,
      completedGoals: review.completedGoals,
      totalGoals: review.totalGoals
    });
    setReviewDialogOpen(true);
    setDrawerOpen(false);
  };

  // Handle view employee details
  const handleViewEmployee = (review: PerformanceReview) => {
    setSelectedEmployeeForDrawer(review);
    setDrawerOpen(true);
  };

  // Export performance data
  const handleExportReport = async () => {
    try {
      const csvData = filteredPerformanceReviews.map(review => ({
        Name: review.name,
        Department: review.department,
        Position: review.position,
        Rating: review.rating,
        Status: review.status,
        'Goals Progress': `${review.completedGoals}/${review.totalGoals}`,
        'Last Review': review.lastReviewDate,
        Feedback: review.feedback.replace(/,/g, ';'), // Replace commas to avoid CSV issues
        Goals: review.goals.replace(/,/g, ';'),
        'Next Steps': review.nextSteps.replace(/,/g, ';')
      }));

      // Convert to CSV
      const headers = Object.keys(csvData[0] || {});
      const csvContent = [
        headers.join(','),
        ...csvData.map(row => headers.map(header => `"${row[header]}"`).join(','))
      ].join('\n');

      // Download CSV
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `performance_report_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setSuccess('Performance report exported successfully!');
    } catch (err) {
      setError('Failed to export report. Please try again.');
      console.error('Error exporting report:', err);
    }
  };

  // Summary stats
  const totalEmployees = performanceReviews.length;
  const averageRating = totalEmployees > 0
    ? (performanceReviews.reduce((sum, review) => sum + review.rating, 0) / totalEmployees).toFixed(1)
    : '0';
  const exceedingCount = performanceReviews.filter(review => review.status === 'Exceeding').length;
  const needsImprovementCount = performanceReviews.filter(review => review.status === 'Needs Improvement').length;
  const totalGoals = performanceReviews.reduce((sum, review) => sum + review.totalGoals, 0);
  const completedGoals = performanceReviews.reduce((sum, review) => sum + review.completedGoals, 0);

  return (
    <div className="p-8 min-h-screen animate-fade-in">
      {/* Success/Error Alerts */}
      {success && (
        <div className="mb-6 p-4 border border-success/20 bg-success/10 text-success rounded-lg flex items-center gap-2 animate-slide-in">
          <CheckCircle className="h-4 w-4" />
          <span>{success}</span>
        </div>
      )}

      {error && (
        <div className="mb-6 p-4 border border-destructive/20 bg-destructive/10 text-destructive rounded-lg flex items-center gap-2 animate-slide-in">
          <AlertCircle className="h-4 w-4" />
          <span>{error}</span>
        </div>
      )}

      {/* Header Section */}
      <div className="mb-8 animate-slide-in">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-xl shadow-soft">
              <TrendingUp className="h-7 w-7 text-primary" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gradient mb-1">
                Performance Management
              </h1>
              <p className="text-muted-foreground">Track employee performance, goals, and development</p>
            </div>
          </div>
          <div className="flex gap-3">
            <button 
              onClick={handleExportReport}
              className="flex items-center gap-2 px-4 py-2 bg-muted/50 hover:bg-muted/80 rounded-lg transition-colors shadow-soft hover:shadow-soft-lg"
            >
              <Download className="h-4 w-4" />
              Export
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-muted/50 hover:bg-muted/80 rounded-lg transition-colors shadow-soft hover:shadow-soft-lg">
              <Upload className="h-4 w-4" />
              Import
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-muted/50 hover:bg-muted/80 rounded-lg transition-colors shadow-soft hover:shadow-soft-lg">
              <Settings className="h-4 w-4" />
              Settings
            </button>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8 animate-fade-in">
        <div className="card-modern group hover:scale-105 bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-primary/10 rounded-xl group-hover:bg-primary/20 transition-colors">
                <FileText className="h-6 w-6 text-primary" />
              </div>
              <div className="flex items-center gap-1 text-sm text-success">
                <TrendingUp className="h-4 w-4" />
                <span className="font-medium">+5%</span>
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Total Reviews</p>
              <p className="text-3xl font-bold text-primary">{totalEmployees}</p>
              <p className="text-xs text-muted-foreground">Performance evaluations</p>
            </div>
          </div>
        </div>

        <div className="card-modern group hover:scale-105 bg-gradient-to-br from-success/5 to-success/10 border-success/20">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-success/10 rounded-xl group-hover:bg-success/20 transition-colors">
                <Star className="h-6 w-6 text-success" />
              </div>
              <div className="flex items-center gap-1 text-sm text-success">
                <TrendingUp className="h-4 w-4" />
                <span className="font-medium">+0.2</span>
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Average Rating</p>
              <p className="text-3xl font-bold text-success">{averageRating}</p>
              <p className="text-xs text-muted-foreground">Out of 5.0 stars</p>
            </div>
          </div>
        </div>

        <div className="card-modern group hover:scale-105 bg-gradient-to-br from-secondary/5 to-secondary/10 border-secondary/20">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-secondary/10 rounded-xl group-hover:bg-secondary/20 transition-colors">
                <Award className="h-6 w-6 text-secondary" />
              </div>
              <div className="flex items-center gap-1 text-sm text-success">
                <Zap className="h-4 w-4" />
                <span className="font-medium">Top</span>
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Exceeding</p>
              <p className="text-3xl font-bold text-secondary">{exceedingCount}</p>
              <p className="text-xs text-muted-foreground">High performers</p>
            </div>
          </div>
        </div>

        <div className="card-modern group hover:scale-105 bg-gradient-to-br from-warning/5 to-warning/10 border-warning/20">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-warning/10 rounded-xl group-hover:bg-warning/20 transition-colors">
                <AlertTriangle className="h-6 w-6 text-warning" />
              </div>
              <div className="flex items-center gap-1 text-sm text-warning">
                <Clock className="h-4 w-4" />
                <span className="font-medium">Focus</span>
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Needs Improvement</p>
              <p className="text-3xl font-bold text-warning">{needsImprovementCount}</p>
              <p className="text-xs text-muted-foreground">Requires attention</p>
            </div>
          </div>
        </div>

        <div className="card-modern group hover:scale-105 bg-gradient-to-br from-info/5 to-info/10 border-info/20">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-info/10 rounded-xl group-hover:bg-info/20 transition-colors">
                <Target className="h-6 w-6 text-info" />
              </div>
              <div className="flex items-center gap-1 text-sm text-success">
                <Activity className="h-4 w-4" />
                <span className="font-medium">{totalGoals > 0 ? Math.round((completedGoals / totalGoals) * 100) : 0}%</span>
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Goals Progress</p>
              <p className="text-3xl font-bold text-info">{completedGoals}/{totalGoals}</p>
              <p className="text-xs text-muted-foreground">Objectives completed</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="card-modern mb-8">
        <div className="p-6">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div className="flex items-center gap-4 flex-1">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search employees..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-input rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
                />
              </div>
              <div className="flex gap-2">
                <select
                  value={selectedDepartment}
                  onChange={(e) => setSelectedDepartment(e.target.value)}
                  className="px-3 py-2 border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  {departments.map(dept => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="px-3 py-2 border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  {performanceStatuses.map(status => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setEditingReview(null);
                  setReviewForm({
                    employeeId: '',
                    rating: 5,
                    feedback: '',
                    goals: '',
                    nextSteps: '',
                    completedGoals: 0,
                    totalGoals: 10
                  });
                  setReviewDialogOpen(true);
                }}
                className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg shadow-soft hover:shadow-soft-lg transition-all duration-200"
              >
                <Plus className="h-4 w-4" />
                Add Review
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Performance Table */}
      <div className="card-modern overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading performance reviews...</p>
            </div>
          </div>
        ) : filteredPerformanceReviews.length === 0 ? (
          <div className="text-center py-12">
            <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-lg font-medium text-muted-foreground mb-2">No performance reviews found</p>
            <p className="text-sm text-muted-foreground mb-4">Get started by adding your first performance review</p>
            <button
              onClick={() => {
                setEditingReview(null);
                setReviewForm({
                  employeeId: '',
                  rating: 5,
                  feedback: '',
                  goals: '',
                  nextSteps: '',
                  completedGoals: 0,
                  totalGoals: 10
                });
                setReviewDialogOpen(true);
              }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg shadow-soft hover:shadow-soft-lg transition-all duration-200"
            >
              <Plus className="h-4 w-4" />
              Add First Review
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="table-modern">
              <thead>
                <tr>
                  <th className="text-left">Employee</th>
                  <th className="text-left">Performance</th>
                  <th className="text-left">Goals Progress</th>
                  <th className="text-left">Status</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredPerformanceReviews.map((review) => (
                  <tr key={review.id} className="group">
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-lg">
                          <User className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <div className="font-semibold text-foreground">{review.name}</div>
                          <div className="text-sm text-muted-foreground">{review.position} • {review.department}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl font-bold text-foreground">{review.rating}</span>
                          <div className="flex gap-1">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`h-4 w-4 ${i < Math.floor(review.rating) ? 'text-warning fill-current' : 'text-muted-foreground/30'}`}
                              />
                            ))}
                          </div>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Last reviewed: {review.lastReviewDate ? new Date(review.lastReviewDate).toLocaleDateString() : 'N/A'}
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">{review.completedGoals}/{review.totalGoals} goals</span>
                          <span className="text-xs text-muted-foreground">
                            {Math.round((review.completedGoals / review.totalGoals) * 100)}%
                          </span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2">
                          <div
                            className={`h-2 rounded-full transition-all duration-300 ${
                              (review.completedGoals / review.totalGoals) >= 0.8 ? 'bg-success' :
                              (review.completedGoals / review.totalGoals) >= 0.6 ? 'bg-warning' : 'bg-destructive'
                            }`}
                            style={{ width: `${(review.completedGoals / review.totalGoals) * 100}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="flex items-center gap-2">
                        {review.status === 'Exceeding' && <Award className="h-4 w-4 text-success" />}
                        {review.status === 'Meeting' && <CheckCircle className="h-4 w-4 text-info" />}
                        {review.status === 'Needs Improvement' && <AlertTriangle className="h-4 w-4 text-warning" />}
                        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${
                          review.status === 'Exceeding' ? 'bg-success/10 text-success border-success/20' :
                          review.status === 'Meeting' ? 'bg-info/10 text-info border-info/20' :
                          'bg-warning/10 text-warning border-warning/20'
                        }`}>
                          {review.status}
                        </span>
                      </div>
                    </td>
                    <td>
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleViewEmployee(review)}
                          className="p-2 hover:bg-info/10 text-info rounded-lg transition-colors"
                          title="View Details"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleEditReview(review)}
                          className="p-2 hover:bg-primary/10 text-primary rounded-lg transition-colors"
                          title="Edit Review"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Employee Details Drawer */}
      <EmployeeDrawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        employee={selectedEmployeeForDrawer}
        onEditReview={handleEditReview}
      />

      {/* Add/Edit Review Dialog */}
      {reviewDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setReviewDialogOpen(false)} />
          <div className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold">
                {editingReview ? 'Edit Performance Review' : 'Add Performance Review'}
              </h2>
            </div>
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-600">Employee *</label>
                  <select
                    value={reviewForm.employeeId}
                    onChange={(e) => setReviewForm({ ...reviewForm, employeeId: e.target.value })}
                    disabled={!!editingReview}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${!formValidation.employeeId ? 'border-red-500' : 'border-gray-300'}`}
                  >
                    <option value="">Select employee</option>
                    {employees.map(emp => (
                      <option key={emp.id} value={emp.id.toString()}>
                        {emp.name} - {emp.department} ({emp.role})
                      </option>
                    ))}
                  </select>
                  {employees.length === 0 && (
                    <p className="text-xs text-amber-600 mt-1">
                      No employees found. Please add employees in Employee Management first.
                    </p>
                  )}
                  {!formValidation.employeeId && (
                    <p className="text-xs text-red-500">Please select an employee</p>
                  )}
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-600">Rating (1-5)</label>
                  <select
                    value={reviewForm.rating.toString()}
                    onChange={(e) => setReviewForm({ ...reviewForm, rating: parseFloat(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {[1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5].map(rating => (
                      <option key={rating} value={rating.toString()}>
                        {rating} Stars
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-600">Completed Goals</label>
                  <input
                    type="number"
                    min="0"
                    max={reviewForm.totalGoals}
                    value={reviewForm.completedGoals}
                    onChange={(e) => setReviewForm({ ...reviewForm, completedGoals: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-600">Total Goals</label>
                  <input
                    type="number"
                    min="1"
                    value={reviewForm.totalGoals}
                    onChange={(e) => setReviewForm({ ...reviewForm, totalGoals: parseInt(e.target.value) || 10 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-600">Performance Feedback *</label>
                <textarea
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none h-24 ${!formValidation.feedback ? 'border-red-500' : 'border-gray-300'}`}
                  placeholder="Provide detailed feedback on employee performance..."
                  value={reviewForm.feedback}
                  onChange={(e) => setReviewForm({ ...reviewForm, feedback: e.target.value })}
                />
                {!formValidation.feedback && (
                  <p className="text-xs text-red-500">Please provide performance feedback</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-600">Goals & Objectives *</label>
                <textarea
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none h-20 ${!formValidation.goals ? 'border-red-500' : 'border-gray-300'}`}
                  placeholder="Set goals and objectives for the next period..."
                  value={reviewForm.goals}
                  onChange={(e) => setReviewForm({ ...reviewForm, goals: e.target.value })}
                />
                {!formValidation.goals && (
                  <p className="text-xs text-red-500">Please set goals and objectives</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-600">Next Steps</label>
                <textarea
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none h-20"
                  placeholder="Outline action items and next steps..."
                  value={reviewForm.nextSteps}
                  onChange={(e) => setReviewForm({ ...reviewForm, nextSteps: e.target.value })}
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  onClick={() => {
                    setReviewDialogOpen(false);
                    setEditingReview(null);
                    setReviewForm({
                      employeeId: '',
                      rating: 5,
                      feedback: '',
                      goals: '',
                      nextSteps: '',
                      completedGoals: 0,
                      totalGoals: 10
                    });
                    setFormValidation({ employeeId: true, feedback: true, goals: true });
                  }}
                >
                  Cancel
                </button>
                <button
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 transition-colors disabled:opacity-50"
                  onClick={handleSubmitReview}
                  disabled={submitting}
                >
                  {submitting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  {editingReview ? 'Update Review' : 'Submit Review'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}