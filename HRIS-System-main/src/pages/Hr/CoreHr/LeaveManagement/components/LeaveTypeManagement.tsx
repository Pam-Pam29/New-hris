import React, { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import {
  Calendar,
  Clock,
  Users,
  FileText,
  Plus,
  Eye,
  Download,
  Filter,
  Search,
  CheckCircle,
  XCircle,
  AlertTriangle,
  User,
  Loader2,
  X,
  RefreshCw
} from 'lucide-react';

// Import the Firebase service
import { leaveService, LeaveRequest, LeaveType, Employee } from './services/leaveService';

// Simple inline components for missing UI elements
const Input = ({ className = "", ...props }: React.InputHTMLAttributes<HTMLInputElement>) => (
  <input
    className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
    {...props}
  />
);

const Label = ({ className = "", ...props }: React.LabelHTMLAttributes<HTMLLabelElement>) => (
  <label className={`text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 ${className}`} {...props} />
);

const Textarea = ({ className = "", ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement>) => (
  <textarea
    className={`flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
    {...props}
  />
);

const Alert = ({ className = "", ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={`relative w-full rounded-lg border p-4 [&>svg~*]:pl-7 [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-foreground ${className}`} {...props} />
);

const AlertDescription = ({ className = "", ...props }: React.HTMLAttributes<HTMLParagraphElement>) => (
  <div className={`text-sm [&_p]:leading-relaxed ${className}`} {...props} />
);

// Leave Details Modal Component
const LeaveDetailsModal = ({
  open,
  onClose,
  request,
  onApprove,
  onReject,
  loading
}: {
  open: boolean;
  onClose: () => void;
  request: LeaveRequest | null;
  onApprove: () => void;
  onReject: () => void;
  loading: boolean;
}) => {
  if (!open || !request) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-background rounded-lg shadow-lg max-w-2xl w-full m-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-full">
              <FileText className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold">Leave Request Details</h2>
              <p className="text-sm text-muted-foreground">Request #{request.id}</p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Employee Info */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium text-muted-foreground">Employee</Label>
              <p className="text-sm mt-1 font-medium">{request.employeeName}</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-muted-foreground">Department</Label>
              <p className="text-sm mt-1">{request.department}</p>
            </div>
          </div>

          {/* Leave Details */}
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Leave Type</Label>
                <p className="text-sm mt-1 font-medium">{request.type}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Total Days</Label>
                <p className="text-sm mt-1 font-medium">{request.totalDays} days</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Start Date</Label>
                <p className="text-sm mt-1">{new Date(request.startDate).toLocaleDateString()}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-muted-foreground">End Date</Label>
                <p className="text-sm mt-1">{new Date(request.endDate).toLocaleDateString()}</p>
              </div>
            </div>
          </div>

          {/* Reason */}
          <div>
            <Label className="text-sm font-medium text-muted-foreground">Reason</Label>
            <div className="mt-1 p-3 bg-muted/50 rounded-lg">
              <p className="text-sm">{request.reason}</p>
            </div>
          </div>

          {/* Status and Approval Info */}
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Status</Label>
                <div className="mt-1">
                  <Badge
                    className={
                      request.status === 'Pending' ? 'bg-yellow-100 text-yellow-800 border-yellow-200' :
                        request.status === 'Approved' ? 'bg-green-100 text-green-800 border-green-200' :
                          request.status === 'Rejected' ? 'bg-red-100 text-red-800 border-red-200' :
                            'bg-gray-100 text-gray-800 border-gray-200'
                    }
                  >
                    {request.status}
                  </Badge>
                </div>
              </div>
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Submitted Date</Label>
                <p className="text-sm mt-1">{new Date(request.submittedDate).toLocaleDateString()}</p>
              </div>
            </div>

            {request.approver && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Approver</Label>
                  <p className="text-sm mt-1">{request.approver}</p>
                </div>
                {request.approvedDate && (
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Decision Date</Label>
                    <p className="text-sm mt-1">{new Date(request.approvedDate).toLocaleDateString()}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        {request.status === 'Pending' && (
          <div className="flex gap-3 p-6 border-t">
            <Button
              className="flex-1 bg-green-600 hover:bg-green-700 text-white"
              onClick={onApprove}
              disabled={loading}
            >
              {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <CheckCircle className="h-4 w-4 mr-2" />}
              Approve
            </Button>
            <Button
              className="flex-1 bg-red-600 hover:bg-red-700 text-white"
              onClick={onReject}
              disabled={loading}
            >
              {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <XCircle className="h-4 w-4 mr-2" />}
              Reject
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

// Leave Type Management Component
const LeaveTypeManagement = ({
  leaveTypes,
  onUpdate,
  loading,
  onRefresh
}: {
  leaveTypes: LeaveType[];
  onUpdate: (types: LeaveType[]) => void;
  loading: boolean;
  onRefresh: () => void;
}) => {
  const [types, setTypes] = useState<LeaveType[]>(leaveTypes);
  const [newType, setNewType] = useState({ name: '', daysAllowed: 0, color: '#3B82F6' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setTypes(leaveTypes);
  }, [leaveTypes]);

  const addLeaveType = async () => {
    if (!newType.name || newType.daysAllowed <= 0) return;

    setSaving(true);
    try {
      const createdType = await leaveService.createLeaveType({
        name: newType.name,
        daysAllowed: newType.daysAllowed,
        color: newType.color
      });

      const updatedTypes = [...types, createdType];
      setTypes(updatedTypes);
      onUpdate(updatedTypes);
      setNewType({ name: '', daysAllowed: 0, color: '#3B82F6' });
    } catch (error) {
      console.error('Error adding leave type:', error);
    } finally {
      setSaving(false);
    }
  };

  const removeLeaveType = async (id: string) => {
    if (!confirm('Are you sure you want to delete this leave type?')) return;

    setSaving(true);
    try {
      await leaveService.deleteLeaveType(id);
      const updatedTypes = types.filter(type => type.id !== id);
      setTypes(updatedTypes);
      onUpdate(updatedTypes);
    } catch (error) {
      console.error('Error removing leave type:', error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Manage Leave Types</h3>
        <Button variant="outline" onClick={onRefresh} disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Add New Leave Type */}
      <div className="space-y-4">
        <div className="grid grid-cols-3 gap-4">
          <div>
            <Label>Leave Type Name</Label>
            <Input
              value={newType.name}
              onChange={(e) => setNewType(prev => ({ ...prev, name: e.target.value }))}
              placeholder="e.g., Annual Leave"
              disabled={saving}
            />
          </div>
          <div>
            <Label>Days Allowed</Label>
            <Input
              type="number"
              value={newType.daysAllowed || ''}
              onChange={(e) => setNewType(prev => ({ ...prev, daysAllowed: parseInt(e.target.value) || 0 }))}
              placeholder="21"
              disabled={saving}
            />
          </div>
          <div>
            <Label>Color</Label>
            <Input
              type="color"
              value={newType.color}
              onChange={(e) => setNewType(prev => ({ ...prev, color: e.target.value }))}
              disabled={saving}
            />
          </div>
        </div>
        <Button onClick={addLeaveType} className="bg-blue-600 hover:bg-blue-700" disabled={saving}>
          {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Plus className="h-4 w-4 mr-2" />}
          Add Leave Type
        </Button>
      </div>

      {/* Current Leave Types */}
      <div className="space-y-2">
        <h4 className="font-medium">Current Leave Types</h4>
        {types.map((type) => (
          <div key={type.id} className="flex items-center justify-between p-3 border rounded-lg">
            <div className="flex items-center gap-3">
              <div
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: type.color }}
              />
              <span className="font-medium">{type.name}</span>
              <span className="text-sm text-muted-foreground">({type.daysAllowed} days)</span>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => removeLeaveType(type.id!)}
              className="text-red-600 hover:text-red-700"
              disabled={saving}
            >
              Remove
            </Button>
          </div>
        ))}
        {types.length === 0 && (
          <p className="text-muted-foreground text-center py-4">No leave types configured</p>
        )}
      </div>
    </div>
  );
};

export default function LeaveManagement() {
  // State management
  const [requests, setRequests] = useState<LeaveRequest[]>([]);
  const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Filter states
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Dialog states
  const [selectedRequest, setSelectedRequest] = useState<LeaveRequest | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [leaveTypeDialogOpen, setLeaveTypeDialogOpen] = useState(false);
  const [addLeaveDialogOpen, setAddLeaveDialogOpen] = useState(false);

  // Form state
  const [newLeaveForm, setNewLeaveForm] = useState({
    employeeId: 'NONE',
    type: 'NONE',
    startDate: '',
    endDate: '',
    reason: ''
  });

  // Load initial data
  useEffect(() => {
    loadData();
  }, []);

  // Clear messages after 5 seconds
  useEffect(() => {
    if (success || error) {
      const timer = setTimeout(() => {
        setSuccess('');
        setError('');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [success, error]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [requestsData, leaveTypesData, employeesData] = await Promise.all([
        leaveService.getLeaveRequests(),
        leaveService.getLeaveTypes(),
        leaveService.getEmployees()
      ]);

      setRequests(requestsData);
      setLeaveTypes(leaveTypesData);
      setEmployees(employeesData);
    } catch (error) {
      console.error('Error loading data:', error);
      setError('Failed to load data. Please try refreshing the page.');
    } finally {
      setLoading(false);
    }
  };

  const refreshData = async () => {
    await loadData();
  };

  // Calculate total days between dates
  const calculateDays = (start: string, end: string): number => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  };

  // Filter requests
  const filteredRequests = useMemo(() => {
    return requests.filter(request => {
      const matchesStatus = statusFilter === 'ALL' || request.status === statusFilter;
      const matchesType = typeFilter === 'ALL' || request.type === typeFilter;
      const matchesSearch = !searchQuery ||
        request.employeeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        request.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
        request.type.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesStatus && matchesType && matchesSearch;
    });
  }, [requests, statusFilter, typeFilter, searchQuery]);

  // Handle approve request
  const handleApprove = async () => {
    if (!selectedRequest) return;

    setActionLoading(true);
    try {
      await leaveService.approveLeaveRequest(selectedRequest.id!, 'HR Manager');

      // Update local state
      setRequests(prev => prev.map(req =>
        req.id === selectedRequest.id
          ? { ...req, status: 'Approved' as const, approver: 'HR Manager', approvedDate: new Date().toISOString().split('T')[0] }
          : req
      ));

      setSuccess(`Leave request approved for ${selectedRequest.employeeName}`);
      setDetailsOpen(false);
    } catch (error) {
      setError('Failed to approve leave request');
    } finally {
      setActionLoading(false);
    }
  };

  // Handle reject request
  const handleReject = async () => {
    if (!selectedRequest) return;

    setActionLoading(true);
    try {
      await leaveService.rejectLeaveRequest(selectedRequest.id!, 'HR Manager');

      // Update local state
      setRequests(prev => prev.map(req =>
        req.id === selectedRequest.id
          ? { ...req, status: 'Rejected' as const, approver: 'HR Manager', approvedDate: new Date().toISOString().split('T')[0] }
          : req
      ));

      setSuccess(`Leave request rejected for ${selectedRequest.employeeName}`);
      setDetailsOpen(false);
    } catch (error) {
      setError('Failed to reject leave request');
    } finally {
      setActionLoading(false);
    }
  };

  // Handle add new leave request
  const handleAddLeave = async () => {
    if (newLeaveForm.employeeId === 'NONE' || newLeaveForm.type === 'NONE' || !newLeaveForm.startDate || !newLeaveForm.endDate) {
      setError('Please fill in all required fields');
      return;
    }

    setActionLoading(true);
    try {
      const selectedEmployee = employees.find(emp => emp.id === newLeaveForm.employeeId);
      const totalDays = calculateDays(newLeaveForm.startDate, newLeaveForm.endDate);

      const newRequest = await leaveService.createLeaveRequest({
        employeeId: newLeaveForm.employeeId,
        employeeName: selectedEmployee?.name || 'Unknown Employee',
        department: selectedEmployee?.department || 'Unknown',
        type: newLeaveForm.type,
        startDate: newLeaveForm.startDate,
        endDate: newLeaveForm.endDate,
        status: 'Pending',
        reason: newLeaveForm.reason,
        submittedDate: new Date().toISOString().split('T')[0],
        approver: '',
        approvedDate: '',
        totalDays
      });

      setRequests(prev => [newRequest, ...prev]);
      setSuccess(`Leave request submitted for ${newRequest.employeeName}`);
      setAddLeaveDialogOpen(false);
      setNewLeaveForm({ employeeId: 'NONE', type: 'NONE', startDate: '', endDate: '', reason: '' });
    } catch (error) {
      setError('Failed to submit leave request');
    } finally {
      setActionLoading(false);
    }
  };

  // Summary statistics
  const totalRequests = requests.length;
  const pendingRequests = requests.filter(r => r.status === 'Pending').length;
  const approvedRequests = requests.filter(r => r.status === 'Approved').length;
  const rejectedRequests = requests.filter(r => r.status === 'Rejected').length;

  if (loading) {
    return (
      <div className="p-8 min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-violet-600" />
          <p className="text-muted-foreground">Loading leave management data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Success/Error Messages */}
      {success && (
        <Alert className="mb-6 border-green-200 bg-green-50 text-green-800">
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert className="mb-6 border-red-200 bg-red-50 text-red-800">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-violet-100 dark:bg-violet-900/30 rounded-lg">
              <Calendar className="h-6 w-6 text-violet-600 dark:text-violet-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-violet-600 to-blue-600 bg-clip-text text-transparent">
                Leave Management
              </h1>
              <p className="text-muted-foreground text-sm">Manage employee leave requests and policies</p>
            </div>
          </div>
          <Button variant="outline" onClick={refreshData} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh Data
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/20 dark:to-blue-900/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Total Requests</p>
                <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{totalRequests}</p>
              </div>
              <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                <FileText className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-950/20 dark:to-yellow-900/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Pending</p>
                <p className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">{pendingRequests}</p>
              </div>
              <div className="p-3 bg-yellow-100 dark:bg-yellow-900/30 rounded-full">
                <Clock className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/20 dark:to-green-900/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Approved</p>
                <p className="text-3xl font-bold text-green-600 dark:text-green-400">{approvedRequests}</p>
              </div>
              <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-full">
                <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950/20 dark:to-red-900/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Rejected</p>
                <p className="text-3xl font-bold text-red-600 dark:text-red-400">{rejectedRequests}</p>
              </div>
              <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-full">
                <XCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Actions and Filters */}
      <Card className="mb-8 border-0 shadow-lg bg-card/50 backdrop-blur-sm">
        <CardHeader>
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold">Filters & Actions</h3>
            </div>
            <div className="flex gap-2">
              <Button
                className="bg-violet-600 hover:bg-violet-700 text-white"
                onClick={() => setAddLeaveDialogOpen(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Leave Request
              </Button>
              <Button
                className="bg-blue-600 hover:bg-blue-700 text-white"
                onClick={() => setLeaveTypeDialogOpen(true)}
              >
                Manage Leave Types
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by employee, department, or leave type..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Status Filter */}
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full lg:w-48">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Statuses</SelectItem>
                <SelectItem value="Pending">Pending</SelectItem>
                <SelectItem value="Approved">Approved</SelectItem>
                <SelectItem value="Rejected">Rejected</SelectItem>
                <SelectItem value="Cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>

            {/* Type Filter */}
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full lg:w-48">
                <SelectValue placeholder="All Leave Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Leave Types</SelectItem>
                {leaveTypes.map((type) => (
                  <SelectItem key={type.id} value={type.name}>{type.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Leave Requests Table */}
      <Card className="mb-8 border-0 shadow-lg bg-card/50 backdrop-blur-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold">Leave Requests</h3>
              <span className="text-sm text-muted-foreground">({filteredRequests.length} requests)</span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border/50">
                  <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Employee</th>
                  <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Department</th>
                  <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Leave Type</th>
                  <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Dates</th>
                  <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Days</th>
                  <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Status</th>
                  <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Submitted</th>
                  <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {filteredRequests.map((request) => (
                  <tr key={request.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-muted rounded-full">
                          <User className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <span className="font-medium">{request.employeeName}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">{request.department}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{
                            backgroundColor: leaveTypes.find(type => type.name === request.type)?.color || '#6B7280'
                          }}
                        />
                        <span>{request.type}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm">
                        <div>{new Date(request.startDate).toLocaleDateString()}</div>
                        <div className="text-muted-foreground">to {new Date(request.endDate).toLocaleDateString()}</div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-medium">{request.totalDays}</span>
                    </td>
                    <td className="px-4 py-3">
                      <Badge
                        className={
                          request.status === 'Pending' ? 'bg-yellow-100 text-yellow-800 border-yellow-200' :
                            request.status === 'Approved' ? 'bg-green-100 text-green-800 border-green-200' :
                              request.status === 'Rejected' ? 'bg-red-100 text-red-800 border-red-200' :
                                'bg-gray-100 text-gray-800 border-gray-200'
                        }
                      >
                        {request.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      {new Date(request.submittedDate).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedRequest(request);
                            setDetailsOpen(true);
                          }}
                          className="hover:bg-blue-50 hover:border-blue-200 hover:text-blue-700"
                        >
                          <Eye className="h-3 w-3 mr-1" />
                          View
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            // Handle download functionality
                            console.log('Download request for:', request.id);
                          }}
                          className="hover:bg-green-50 hover:border-green-200 hover:text-green-700"
                        >
                          <Download className="h-3 w-3 mr-1" />
                          Export
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredRequests.length === 0 && (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No leave requests found</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Leave Details Modal */}
      <LeaveDetailsModal
        open={detailsOpen}
        onClose={() => setDetailsOpen(false)}
        request={selectedRequest}
        onApprove={handleApprove}
        onReject={handleReject}
        loading={actionLoading}
      />

      {/* Leave Type Management Dialog */}
      <Dialog open={leaveTypeDialogOpen} onOpenChange={setLeaveTypeDialogOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Manage Leave Types</DialogTitle>
          </DialogHeader>
          <LeaveTypeManagement
            leaveTypes={leaveTypes}
            onUpdate={setLeaveTypes}
            loading={loading}
            onRefresh={refreshData}
          />
        </DialogContent>
      </Dialog>

      {/* Add Leave Request Dialog */}
      <Dialog open={addLeaveDialogOpen} onOpenChange={setAddLeaveDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add New Leave Request</DialogTitle>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-muted-foreground">Employee *</Label>
                <Select
                  value={newLeaveForm.employeeId}
                  onValueChange={(value) => setNewLeaveForm(prev => ({ ...prev, employeeId: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select employee" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="NONE">Select employee</SelectItem>
                    {employees.map(employee => (
                      <SelectItem key={employee.id} value={employee.id!}>
                        <div className="flex flex-col">
                          <span className="font-medium">{employee.name}</span>
                          <span className="text-sm text-muted-foreground">{employee.department} - {employee.position}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-muted-foreground">Leave Type *</Label>
                <Select
                  value={newLeaveForm.type}
                  onValueChange={(value) => setNewLeaveForm(prev => ({ ...prev, type: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select leave type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="NONE">Select leave type</SelectItem>
                    {leaveTypes.map(type => (
                      <SelectItem key={type.id} value={type.name}>
                        <div className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: type.color }}
                          />
                          <span>{type.name}</span>
                          <span className="text-sm text-muted-foreground">({type.daysAllowed} days allowed)</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-muted-foreground">Start Date *</Label>
                <Input
                  type="date"
                  value={newLeaveForm.startDate}
                  onChange={(e) => setNewLeaveForm(prev => ({ ...prev, startDate: e.target.value }))}
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-muted-foreground">End Date *</Label>
                <Input
                  type="date"
                  value={newLeaveForm.endDate}
                  onChange={(e) => setNewLeaveForm(prev => ({ ...prev, endDate: e.target.value }))}
                  min={newLeaveForm.startDate || new Date().toISOString().split('T')[0]}
                />
              </div>
            </div>

            {/* Show calculated days */}
            {newLeaveForm.startDate && newLeaveForm.endDate && (
              <div className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium">
                    Total Days: {calculateDays(newLeaveForm.startDate, newLeaveForm.endDate)} days
                  </span>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label className="text-sm font-medium text-muted-foreground">Reason</Label>
              <Textarea
                value={newLeaveForm.reason}
                onChange={(e) => setNewLeaveForm(prev => ({ ...prev, reason: e.target.value }))}
                placeholder="Please provide a reason for this leave request..."
                className="resize-none h-24"
              />
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setAddLeaveDialogOpen(false);
                  setNewLeaveForm({ employeeId: 'NONE', type: 'NONE', startDate: '', endDate: '', reason: '' });
                }}
              >
                Cancel
              </Button>
              <Button
                className="bg-violet-600 hover:bg-violet-700 text-white"
                onClick={handleAddLeave}
                disabled={actionLoading}
              >
                {actionLoading ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Plus className="h-4 w-4 mr-2" />
                )}
                Submit Request
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}