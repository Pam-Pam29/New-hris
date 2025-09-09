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
  X
} from 'lucide-react';

// FIXED: Update import path to match your service file location
import {
  leaveRequestService,
  leaveTypeService,
  employeeService,
  dataTransforms,
  handleFirebaseError,
  initializeDefaultData
} from './services/leaveService'; // Relative path from your component

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

interface LeaveRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  department: string;
  type: string;
  startDate: string;
  endDate: string;
  status: 'Pending' | 'Approved' | 'Rejected' | 'Cancelled';
  reason: string;
  submittedDate: any; // Firestore timestamp
  approver: string;
  approvedDate: string;
  totalDays: number;
}

interface LeaveType {
  id: string;
  name: string;
  daysAllowed: number;
  color: string;
}

interface Employee {
  id: string;
  name: string;
  department: string;
  position: string;
}

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

  // Handle Firestore timestamp
  const formatDate = (date: any) => {
    if (!date) return '';
    if (typeof date === 'string') return new Date(date).toLocaleDateString();
    if (date.toDate) return date.toDate().toLocaleDateString();
    return new Date(date).toLocaleDateString();
  };

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
                <p className="text-sm mt-1">{formatDate(request.startDate)}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-muted-foreground">End Date</Label>
                <p className="text-sm mt-1">{formatDate(request.endDate)}</p>
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
                <p className="text-sm mt-1">{formatDate(request.submittedDate)}</p>
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
  loading
}: {
  leaveTypes: LeaveType[];
  onUpdate: () => void;
  loading: boolean;
}) => {
  const [types] = useState<LeaveType[]>(leaveTypes);
  const [newType, setNewType] = useState({ name: '', daysAllowed: 0, color: '#3B82F6' });
  const [isAddingType, setIsAddingType] = useState(false);

  const addLeaveType = async () => {
    if (!newType.name || newType.daysAllowed <= 0) return;

    setIsAddingType(true);
    try {
      await leaveTypeService.add({
        name: newType.name,
        daysAllowed: newType.daysAllowed,
        color: newType.color
      });

      setNewType({ name: '', daysAllowed: 0, color: '#3B82F6' });
      onUpdate(); // Refresh the data
    } catch (error) {
      console.error('Error adding leave type:', error);
    } finally {
      setIsAddingType(false);
    }
  };

  const removeLeaveType = async (id: string) => {
    try {
      await leaveTypeService.delete(id);
      onUpdate(); // Refresh the data
    } catch (error) {
      console.error('Error removing leave type:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Manage Leave Types</h3>

        {/* Add New Leave Type */}
        <div className="space-y-4 mb-6">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label>Leave Type Name</Label>
              <Input
                value={newType.name}
                onChange={(e) => setNewType(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., Annual Leave"
                disabled={isAddingType}
              />
            </div>
            <div>
              <Label>Days Allowed</Label>
              <Input
                type="number"
                value={newType.daysAllowed || ''}
                onChange={(e) => setNewType(prev => ({ ...prev, daysAllowed: parseInt(e.target.value) || 0 }))}
                placeholder="21"
                disabled={isAddingType}
              />
            </div>
            <div>
              <Label>Color</Label>
              <Input
                type="color"
                value={newType.color}
                onChange={(e) => setNewType(prev => ({ ...prev, color: e.target.value }))}
                disabled={isAddingType}
              />
            </div>
          </div>
          <Button
            onClick={addLeaveType}
            className="bg-blue-600 hover:bg-blue-700"
            disabled={isAddingType || loading}
          >
            {isAddingType ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Plus className="h-4 w-4 mr-2" />
            )}
            Add Leave Type
          </Button>
        </div>

        {/* Current Leave Types */}
        <div className="space-y-2">
          <h4 className="font-medium">Current Leave Types</h4>
          {loading ? (
            <div className="flex justify-center py-4">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : (
            types.map((type) => (
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
                  onClick={() => removeLeaveType(type.id)}
                  className="text-red-600 hover:text-red-700"
                >
                  Remove
                </Button>
              </div>
            ))
          )}
        </div>
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
  const [actionLoading, setActionLoading] = useState(false);

  // Form state
  const [newLeaveForm, setNewLeaveForm] = useState({
    employeeId: 'NONE',
    type: 'NONE',
    startDate: '',
    endDate: '',
    reason: ''
  });

  // Initialize Firebase data and set up real-time listeners
  useEffect(() => {
    let unsubscribeRequests: (() => void) | undefined;
    let unsubscribeTypes: (() => void) | undefined;
    let unsubscribeEmployees: (() => void) | undefined;

    const initializeData = async () => {
      try {
        setLoading(true);

        // Initialize default data if needed
        await initializeDefaultData();

        // Set up real-time listeners
        unsubscribeRequests = leaveRequestService.subscribe((requests) => {
          setRequests(requests);
        });

        unsubscribeTypes = leaveTypeService.subscribe((types) => {
          setLeaveTypes(types);
        });

        unsubscribeEmployees = employeeService.subscribe((employees) => {
          setEmployees(employees);
        });

        setLoading(false);
      } catch (error) {
        console.error('Error initializing data:', error);
        setError(handleFirebaseError(error));
        setLoading(false);
      }
    };

    initializeData();

    // Cleanup listeners on unmount
    return () => {
      if (unsubscribeRequests) unsubscribeRequests();
      if (unsubscribeTypes) unsubscribeTypes();
      if (unsubscribeEmployees) unsubscribeEmployees();
    };
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

  // Calculate total days between dates
  const calculateDays = (start: string, end: string): number => {
    return dataTransforms.calculateDays(start, end);
  };

  // Format date for display
  const formatRequestDate = (date: any): string => {
    if (!date) return '';
    if (typeof date === 'string') return new Date(date).toLocaleDateString();
    if (date.toDate) return date.toDate().toLocaleDateString();
    return new Date(date).toLocaleDateString();
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
      await leaveRequestService.approve(selectedRequest.id, 'HR Manager');
      setSuccess(`Leave request approved for ${selectedRequest.employeeName}`);
      setDetailsOpen(false);
    } catch (error) {
      setError(handleFirebaseError(error));
    } finally {
      setActionLoading(false);
    }
  };

  // Handle reject request
  const handleReject = async () => {
    if (!selectedRequest) return;

    setActionLoading(true);
    try {
      await leaveRequestService.reject(selectedRequest.id, 'HR Manager');
      setSuccess(`Leave request rejected for ${selectedRequest.employeeName}`);
      setDetailsOpen(false);
    } catch (error) {
      setError(handleFirebaseError(error));
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
      const requestData = dataTransforms.formatLeaveRequest(newLeaveForm, selectedEmployee);

      await leaveRequestService.add(requestData);
      setSuccess(`Leave request submitted for ${requestData.employeeName}`);
      setAddLeaveDialogOpen(false);
      setNewLeaveForm({ employeeId: 'NONE', type: 'NONE', startDate: '', endDate: '', reason: '' });
    } catch (error) {
      setError(handleFirebaseError(error));
    } finally {
      setActionLoading(false);
    }
  };

  // Handle leave type updates
  const handleLeaveTypeUpdate = () => {
    // The real-time listener will automatically update the data
  };

  // Summary statistics
  const totalRequests = requests.length;
  const pendingRequests = requests.filter(r => r.status === 'Pending').length;
  const approvedRequests = requests.filter(r => r.status === 'Approved').length;
  const rejectedRequests = requests.filter(r => r.status === 'Rejected').length;

  if (loading) {
    return (
      <div className="p-8 min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Loading leave management data...</p>
          </div>
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
        <div className="flex items-center gap-3 mb-2">
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
                disabled={actionLoading}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Leave Request
              </Button>
              <Button
                className="bg-blue-600 hover:bg-blue-700 text-white"
                onClick={() => setLeaveTypeDialogOpen(true)}
                disabled={actionLoading}
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
      <Card className="border-0 shadow-lg bg-card/50 backdrop-blur-sm">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-muted-foreground" />
            <h3 className="text-lg font-semibold">Leave Requests ({filteredRequests.length})</h3>
          </div>
        </CardHeader>
        <CardContent>
          {filteredRequests.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-lg font-medium text-muted-foreground mb-2">No leave requests found</p>
              <p className="text-sm text-muted-foreground">
                {requests.length === 0 ? 'No requests have been submitted yet.' : 'Try adjusting your filters.'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-muted">
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Employee</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Type</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Duration</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Status</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Submitted</th>
                    <th className="text-right py-3 px-4 font-medium text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRequests.map((request) => (
                    <tr key={request.id} className="border-b border-muted/50 hover:bg-muted/30 transition-colors">
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                            <User className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                          </div>
                          <div>
                            <p className="font-medium">{request.employeeName}</p>
                            <p className="text-sm text-muted-foreground">{request.department}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{
                              backgroundColor: leaveTypes.find(t => t.name === request.type)?.color || '#3B82F6'
                            }}
                          />
                          <span className="font-medium">{request.type}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div>
                          <p className="font-medium">{request.totalDays} days</p>
                          <p className="text-sm text-muted-foreground">
                            {formatRequestDate(request.startDate)} - {formatRequestDate(request.endDate)}
                          </p>
                        </div>
                      </td>
                      <td className="py-4 px-4">
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
                      <td className="py-4 px-4 text-sm text-muted-foreground">
                        {formatRequestDate(request.submittedDate)}
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex justify-end gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedRequest(request);
                              setDetailsOpen(true);
                            }}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Leave Details Modal */}
      <LeaveDetailsModal
        open={detailsOpen}
        onClose={() => {
          setDetailsOpen(false);
          setSelectedRequest(null);
        }}
        request={selectedRequest}
        onApprove={handleApprove}
        onReject={handleReject}
        loading={actionLoading}
      />

      {/* Leave Type Management Dialog */}
      <Dialog open={leaveTypeDialogOpen} onOpenChange={setLeaveTypeDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Leave Type Management</DialogTitle>
          </DialogHeader>
          <LeaveTypeManagement
            leaveTypes={leaveTypes}
            onUpdate={handleLeaveTypeUpdate}
            loading={loading}
          />
        </DialogContent>
      </Dialog>

      {/* Add Leave Request Dialog */}
      <Dialog open={addLeaveDialogOpen} onOpenChange={setAddLeaveDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add New Leave Request</DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Employee</Label>
                <Select
                  value={newLeaveForm.employeeId}
                  onValueChange={(value) => setNewLeaveForm(prev => ({ ...prev, employeeId: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Employee" />
                  </SelectTrigger>
                  <SelectContent>
                    {employees.map((employee) => (
                      <SelectItem key={employee.id} value={employee.id}>
                        {employee.name} - {employee.department}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Leave Type</Label>
                <Select
                  value={newLeaveForm.type}
                  onValueChange={(value) => setNewLeaveForm(prev => ({ ...prev, type: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Leave Type" />
                  </SelectTrigger>
                  <SelectContent>
                    {leaveTypes.map((type) => (
                      <SelectItem key={type.id} value={type.name}>
                        {type.name} ({type.daysAllowed} days allowed)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Start Date</Label>
                <Input
                  type="date"
                  value={newLeaveForm.startDate}
                  onChange={(e) => setNewLeaveForm(prev => ({ ...prev, startDate: e.target.value }))}
                />
              </div>
              <div>
                <Label>End Date</Label>
                <Input
                  type="date"
                  value={newLeaveForm.endDate}
                  onChange={(e) => setNewLeaveForm(prev => ({ ...prev, endDate: e.target.value }))}
                />
              </div>
            </div>

            {newLeaveForm.startDate && newLeaveForm.endDate && (
              <div className="p-4 bg-muted/50 rounded-lg">
                <p className="text-sm font-medium">
                  Total Days: {calculateDays(newLeaveForm.startDate, newLeaveForm.endDate)} days
                </p>
              </div>
            )}

            <div>
              <Label>Reason</Label>
              <Textarea
                value={newLeaveForm.reason}
                onChange={(e) => setNewLeaveForm(prev => ({ ...prev, reason: e.target.value }))}
                placeholder="Please provide a reason for the leave request..."
                rows={4}
              />
            </div>

            <div className="flex gap-3">
              <Button
                className="flex-1 bg-violet-600 hover:bg-violet-700 text-white"
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
              <Button
                variant="outline"
                onClick={() => setAddLeaveDialogOpen(false)}
                disabled={actionLoading}
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}