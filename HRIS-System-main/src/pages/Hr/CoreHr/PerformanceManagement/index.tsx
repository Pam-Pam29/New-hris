import React, { useState, useEffect } from 'react';
import {
  TrendingUp, Target, Users, Award, BarChart3, Calendar, Star,
  AlertTriangle, Plus, Filter, Download, Eye, Edit, User, X,
  Save, Loader2, Search, CheckCircle, AlertCircle
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
    <div className="p-8 min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      {/* Success/Error Alerts */}
      {success && (
        <div className="mb-6 p-4 border border-green-200 bg-green-50 text-green-800 rounded-lg flex items-center gap-2">
          <CheckCircle className="h-4 w-4" />
          <span>{success}</span>
        </div>
      )}

      {error && (
        <div className="mb-6 p-4 border border-red-200 bg-red-50 text-red-800 rounded-lg flex items-center gap-2">
          <AlertCircle className="h-4 w-4" />
          <span>{error}</span>
        </div>
      )}

      {/* Header Section */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-blue-100 rounded-lg">
            <TrendingUp className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Performance Management
            </h2>
            <p className="text-gray-600 text-sm">Track employee performance, goals, and development</p>
          </div>
        </div>
      </div>



      {/* Filters Section */}
      <div className="mb-8 bg-white/50 backdrop-blur-sm rounded-lg border border-gray-200 shadow-lg">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-600" />
            <h3 className="text-lg font-semibold">Performance Filters</h3>
          </div>
        </div>
        <div className="p-6">
          <div className="flex flex-col lg:flex-row gap-4 items-end">
            <div className="flex-1 space-y-2">
              <label className="text-sm font-medium text-gray-600">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by name, department, or position..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            <div className="flex-1 space-y-2">
              <label className="text-sm font-medium text-gray-600">Department</label>
              <select
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {departments.map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
            </div>
            <div className="flex-1 space-y-2">
              <label className="text-sm font-medium text-gray-600">Performance Status</label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {performanceStatuses.map(status => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </div>
            <div className="flex-1 space-y-2">
              <label className="text-sm font-medium text-gray-600">Employee</label>
              <select
                value={selectedEmployee}
                onChange={(e) => setSelectedEmployee(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="All Employees">All Employees</option>
                {performanceReviews.map(emp => (
                  <option key={emp.id} value={emp.name}>{emp.name}</option>
                ))}
              </select>
            </div>
            <button
              onClick={handleExportReport}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg flex items-center gap-2 transition-colors"
            >
              <Download className="h-4 w-4" />
              Export Report
            </button>
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200 shadow-lg hover:shadow-xl transition-all duration-300">
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Total Reviews</p>
                <p className="text-3xl font-bold text-blue-600">{totalEmployees}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg border border-green-200 shadow-lg hover:shadow-xl transition-all duration-300">
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Average Rating</p>
                <p className="text-3xl font-bold text-green-600">{averageRating}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <Star className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg border border-purple-200 shadow-lg hover:shadow-xl transition-all duration-300">
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Exceeding</p>
                <p className="text-3xl font-bold text-purple-600">{exceedingCount}</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <Award className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg border border-orange-200 shadow-lg hover:shadow-xl transition-all duration-300">
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Needs Improvement</p>
                <p className="text-3xl font-bold text-orange-600">{needsImprovementCount}</p>
              </div>
              <div className="p-3 bg-orange-100 rounded-full">
                <AlertTriangle className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-lg border border-indigo-200 shadow-lg hover:shadow-xl transition-all duration-300">
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Goals Completed</p>
                <p className="text-3xl font-bold text-indigo-600">{completedGoals}/{totalGoals}</p>
              </div>
              <div className="p-3 bg-indigo-100 rounded-full">
                <Target className="h-6 w-6 text-indigo-600" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Performance Table */}
      <div className="mb-8 bg-white/50 backdrop-blur-sm rounded-lg border border-gray-200 shadow-lg">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-gray-600" />
              <h3 className="text-lg font-semibold">Employee Performance Overview</h3>
            </div>
            <button
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
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
            >
              <Plus className="h-4 w-4" />
              Add Review
            </button>
          </div>
        </div>
        <div className="p-6">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
          ) : filteredPerformanceReviews.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No performance reviews found.</p>
              <p className="text-sm text-gray-400">Add a review to get started.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="px-4 py-3 text-left font-semibold text-gray-600">Employee</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-600">Department</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-600">Position</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-600">Rating</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-600">Goals Progress</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-600">Status</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-600">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredPerformanceReviews.map((review) => (
                    <tr key={review.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-gray-100 rounded-full">
                            <User className="h-4 w-4 text-gray-600" />
                          </div>
                          <span className="font-medium">{review.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">{review.department}</td>
                      <td className="px-4 py-3">{review.position}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{review.rating}</span>
                          <div className="flex gap-1">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`h-3 w-3 ${i < Math.floor(review.rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                              />
                            ))}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-600">{review.completedGoals}/{review.totalGoals}</span>
                          <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-blue-500 rounded-full transition-all duration-300"
                              style={{ width: `${(review.completedGoals / review.totalGoals) * 100}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-3 py-1 text-xs rounded-full ${review.status === 'Exceeding' ? 'bg-green-100 text-green-800' :
                            review.status === 'Meeting' ? 'bg-blue-100 text-blue-800' :
                              'bg-orange-100 text-orange-800'
                            }`}
                        >
                          {review.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <button
                            className="px-3 py-1 text-xs border border-blue-200 text-blue-700 rounded hover:bg-blue-50 flex items-center gap-1 transition-colors"
                            onClick={() => handleViewEmployee(review)}
                          >
                            <Eye className="h-3 w-3" />
                            View
                          </button>
                          <button
                            className="px-3 py-1 text-xs border border-green-200 text-green-700 rounded hover:bg-green-50 flex items-center gap-1 transition-colors"
                            onClick={() => handleEditReview(review)}
                          >
                            <Edit className="h-3 w-3" />
                            Edit
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