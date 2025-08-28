import React, { useState } from 'react';
import { Button } from '../../../../components/ui/button';
import { Card, CardContent, CardHeader } from '../../../../components/ui/card';
import { TypographyH2, TypographyH3 } from '../../../../components/ui/typography';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../../components/ui/select';
import { Badge } from '../../../../components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../../../components/ui/dialog';

import {
  TrendingUp,
  Target,
  Users,
  Award,
  BarChart3,
  Calendar,
  Star,
  AlertTriangle,
  Plus,
  Filter,
  Download,
  Eye,
  Edit,
  User
} from 'lucide-react';

// Mock data
const mockEmployees = [
  { id: 1, name: 'Jane Doe', department: 'Engineering', position: 'Senior Developer', rating: 4.8, goals: 3, completed: 2, status: 'Exceeding' },
  { id: 2, name: 'John Smith', department: 'Marketing', position: 'Marketing Manager', rating: 4.2, goals: 4, completed: 3, status: 'Meeting' },
  { id: 3, name: 'Mary Johnson', department: 'Sales', position: 'Sales Representative', rating: 3.9, goals: 3, completed: 1, status: 'Needs Improvement' },
  { id: 4, name: 'David Wilson', department: 'HR', position: 'HR Specialist', rating: 4.5, goals: 2, completed: 2, status: 'Exceeding' },
  { id: 5, name: 'Sarah Brown', department: 'Finance', position: 'Financial Analyst', rating: 4.1, goals: 3, completed: 2, status: 'Meeting' },
];

const mockGoals = [
  { id: 1, employee: 'Jane Doe', goal: 'Complete advanced React certification', deadline: '2025-08-15', progress: 75, status: 'In Progress' },
  { id: 2, employee: 'John Smith', goal: 'Increase social media engagement by 25%', deadline: '2025-07-30', progress: 60, status: 'In Progress' },
  { id: 3, employee: 'Mary Johnson', goal: 'Achieve 120% of sales quota', deadline: '2025-08-31', progress: 45, status: 'In Progress' },
  { id: 4, employee: 'David Wilson', goal: 'Implement new employee onboarding system', deadline: '2025-07-20', progress: 100, status: 'Completed' },
];

const departments = ['All Departments', 'Engineering', 'Marketing', 'Sales', 'HR', 'Finance'];
const performanceStatuses = ['All Statuses', 'Exceeding', 'Meeting', 'Needs Improvement'];

export default function PerformanceManagement() {
  const [selectedDepartment, setSelectedDepartment] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [selectedEmployee, setSelectedEmployee] = useState<string | null>(null);

  // Review dialog state
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [reviewForm, setReviewForm] = useState({
    employee: '',
    rating: 5,
    feedback: '',
    goals: '',
    nextSteps: ''
  });

  // Filter logic
  const filteredEmployees = mockEmployees.filter(emp =>
    (!selectedDepartment || selectedDepartment === 'All Departments' || emp.department === selectedDepartment) &&
    (!selectedStatus || selectedStatus === 'All Statuses' || emp.status === selectedStatus) &&
    (!selectedEmployee || emp.name === selectedEmployee)
  );

  // Summary stats
  const totalEmployees = mockEmployees.length;
  const averageRating = (mockEmployees.reduce((sum, emp) => sum + emp.rating, 0) / totalEmployees).toFixed(1);
  const exceedingCount = mockEmployees.filter(emp => emp.status === 'Exceeding').length;
  const needsImprovementCount = mockEmployees.filter(emp => emp.status === 'Needs Improvement').length;
  const totalGoals = mockGoals.length;
  const completedGoals = mockGoals.filter(goal => goal.status === 'Completed').length;

  return (
    <div className="p-8 min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Header Section */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
            <TrendingUp className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <TypographyH2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Performance Management
            </TypographyH2>
            <p className="text-muted-foreground text-sm">Track employee performance, goals, and development</p>
          </div>
        </div>
      </div>

      {/* Filters Section */}
      <Card className="mb-8 border-0 shadow-lg bg-card/50 backdrop-blur-sm">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <TypographyH3 className="text-lg font-semibold">Performance Filters</TypographyH3>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 items-end">
            <div className="flex-1 space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Department</label>
              <Select value={selectedDepartment || "all"} onValueChange={(value) => setSelectedDepartment(value === "all" ? null : value)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="All Departments" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Departments</SelectItem>
                  {departments.slice(1).map(dept => <SelectItem key={dept} value={dept}>{dept}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1 space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Performance Status</label>
              <Select value={selectedStatus || "all"} onValueChange={(value) => setSelectedStatus(value === "all" ? null : value)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  {performanceStatuses.slice(1).map(status => <SelectItem key={status} value={status}>{status}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1 space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Employee</label>
              <Select value={selectedEmployee || "all"} onValueChange={(value) => setSelectedEmployee(value === "all" ? null : value)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="All Employees" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Employees</SelectItem>
                  {mockEmployees.map(emp => <SelectItem key={emp.id} value={emp.name}>{emp.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white px-6">
              <Download className="h-4 w-4 mr-2" />
              Export Report
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
        <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/20 dark:to-blue-900/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Total Employees</p>
                <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{totalEmployees}</p>
              </div>
              <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/20 dark:to-green-900/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Average Rating</p>
                <p className="text-3xl font-bold text-green-600 dark:text-green-400">{averageRating}</p>
              </div>
              <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-full">
                <Star className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/20 dark:to-purple-900/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Exceeding Goals</p>
                <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">{exceedingCount}</p>
              </div>
              <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-full">
                <Award className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950/20 dark:to-orange-900/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Needs Improvement</p>
                <p className="text-3xl font-bold text-orange-600 dark:text-orange-400">{needsImprovementCount}</p>
              </div>
              <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-full">
                <AlertTriangle className="h-6 w-6 text-orange-600 dark:text-orange-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-950/20 dark:to-indigo-900/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Goals Completed</p>
                <p className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">{completedGoals}/{totalGoals}</p>
              </div>
              <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-full">
                <Target className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Table */}
      <Card className="mb-8 border-0 shadow-lg bg-card/50 backdrop-blur-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
              <TypographyH3 className="text-lg font-semibold">Employee Performance Overview</TypographyH3>
            </div>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white" onClick={() => setReviewDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Review
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border/50">
                  <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Employee</th>
                  <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Department</th>
                  <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Position</th>
                  <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Rating</th>
                  <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Goals Progress</th>
                  <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Status</th>
                  <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {filteredEmployees.map((emp) => (
                  <tr key={emp.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-muted rounded-full">
                          <User className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <span className="font-medium">{emp.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">{emp.department}</td>
                    <td className="px-4 py-3">{emp.position}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{emp.rating}</span>
                        <div className="flex gap-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-3 w-3 ${i < Math.floor(emp.rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                            />
                          ))}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">{emp.completed}/{emp.goals}</span>
                        <div className="w-20 h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-blue-500 rounded-full transition-all duration-300"
                            style={{ width: `${(emp.completed / emp.goals) * 100}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <Badge
                        className={
                          emp.status === 'Exceeding' ? 'bg-green-100 text-green-800 border-green-200 px-3 py-1' :
                            emp.status === 'Meeting' ? 'bg-blue-100 text-blue-800 border-blue-200 px-3 py-1' :
                              'bg-orange-100 text-orange-800 border-orange-200 px-3 py-1'
                        }
                      >
                        {emp.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" className="hover:bg-blue-50 hover:border-blue-200 hover:text-blue-700">
                          <Eye className="h-3 w-3 mr-1" />
                          View
                        </Button>
                        <Button size="sm" variant="outline" className="hover:bg-green-50 hover:border-green-200 hover:text-green-700">
                          <Edit className="h-3 w-3 mr-1" />
                          Edit
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Goals Tracking */}
      <Card className="border-0 shadow-lg bg-card/50 backdrop-blur-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-muted-foreground" />
              <TypographyH3 className="text-lg font-semibold">Goals & Objectives Tracking</TypographyH3>
            </div>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white">
              <Plus className="h-4 w-4 mr-2" />
              Add Goal
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {mockGoals.map((goal) => (
              <Card key={goal.id} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-card to-card/80">
                <CardContent className="p-8">
                  {/* Header with Employee Name and Status */}
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex-1 pr-6">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                          <User className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                        </div>
                        <h4 className="font-semibold text-lg text-foreground">{goal.employee}</h4>
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed pr-4">{goal.goal}</p>
                    </div>
                    <Badge
                      className={
                        goal.status === 'Completed' ? 'bg-green-100 text-green-800 border-green-200 px-3 py-1' :
                          'bg-blue-100 text-blue-800 border-blue-200 px-3 py-1'
                      }
                    >
                      {goal.status}
                    </Badge>
                  </div>

                  {/* Progress Section */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-muted-foreground">Progress</span>
                      <span className="text-lg font-bold text-foreground">{goal.progress}%</span>
                    </div>
                    <div className="w-full h-3 bg-muted rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${goal.status === 'Completed' ? 'bg-green-500' : 'bg-blue-500'
                          }`}
                        style={{ width: `${goal.progress}%` }}
                      />
                    </div>

                    {/* Deadline */}
                    <div className="flex items-center gap-3 pt-2">
                      <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-full">
                        <Calendar className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Deadline</p>
                        <p className="text-sm font-medium text-foreground">{goal.deadline}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Add Review Dialog */}
      <Dialog open={reviewDialogOpen} onOpenChange={setReviewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">Add Performance Review</DialogTitle>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Employee</label>
                <Select value={reviewForm.employee} onValueChange={(value) => setReviewForm({ ...reviewForm, employee: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select employee" />
                  </SelectTrigger>
                  <SelectContent>
                    {mockEmployees.map(emp => <SelectItem key={emp.id} value={emp.name}>{emp.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Rating (1-5)</label>
                <Select value={reviewForm.rating.toString()} onValueChange={(value) => setReviewForm({ ...reviewForm, rating: parseInt(value) })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5].map(rating => <SelectItem key={rating} value={rating.toString()}>{rating}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Performance Feedback</label>
              <textarea
                className="w-full p-3 border border-border rounded-md resize-none h-24 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Provide detailed feedback on employee performance..."
                value={reviewForm.feedback}
                onChange={(e) => setReviewForm({ ...reviewForm, feedback: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Goals & Objectives</label>
              <textarea
                className="w-full p-3 border border-border rounded-md resize-none h-20 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Set goals and objectives for the next period..."
                value={reviewForm.goals}
                onChange={(e) => setReviewForm({ ...reviewForm, goals: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Next Steps</label>
              <textarea
                className="w-full p-3 border border-border rounded-md resize-none h-20 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Outline action items and next steps..."
                value={reviewForm.nextSteps}
                onChange={(e) => setReviewForm({ ...reviewForm, nextSteps: e.target.value })}
              />
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button variant="outline" onClick={() => setReviewDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                className="bg-blue-600 hover:bg-blue-700 text-white"
                onClick={() => {
                  // Handle form submission here
                  console.log('Review submitted:', reviewForm);
                  setReviewDialogOpen(false);
                  setReviewForm({ employee: '', rating: 5, feedback: '', goals: '', nextSteps: '' });
                }}
              >
                Submit Review
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
