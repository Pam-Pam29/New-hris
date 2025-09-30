import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../../components/ui/card';
import { Button } from '../../../../components/ui/button';
import { Badge } from '../../../../components/ui/badge';
import { Input } from '../../../../components/ui/input';
import { Label } from '../../../../components/ui/label';
import { Textarea } from '../../../../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../../components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../../components/ui/tabs';
import { Alert, AlertDescription } from '../../../../components/ui/alert';
import {
  Calendar as CalendarIcon,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Plus,
  Filter,
  Search,
  Download,
  Upload,
  FileText,
  User,
  Mail,
  Phone,
  MapPin,
  TrendingUp,
  BarChart3,
  PieChart,
  Loader,
  Settings,
  Users
} from 'lucide-react';
import { format } from 'date-fns';
import { leaveService, LeaveRequest, LeaveType, LeaveBalance } from '../../../Employee/services/leaveService';

export default function HRLeaveManagement() {
  const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([]);
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [selectedRequest, setSelectedRequest] = useState<LeaveRequest | null>(null);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [showLeaveTypeModal, setShowLeaveTypeModal] = useState(false);
  const [approvalAction, setApprovalAction] = useState<'approve' | 'reject'>('approve');
  const [approvalComments, setApprovalComments] = useState('');

  // Leave type form state
  const [leaveTypeForm, setLeaveTypeForm] = useState({
    name: '',
    description: '',
    maxDays: 20,
    accrualRate: 1.67,
    carryForward: true,
    requiresApproval: true,
    color: '#3B82F6'
  });

  // Load data on component mount
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [types, requests] = await Promise.all([
        leaveService.getLeaveTypes(),
        leaveService.getAllLeaveRequests()
      ]);

      setLeaveTypes(types);
      setLeaveRequests(requests);
    } catch (err) {
      setError('Failed to load leave data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveRequest = async () => {
    if (!selectedRequest) return;

    setSubmitting(true);
    try {
      const success = await leaveService.approveLeaveRequest(
        selectedRequest.id,
        'HR Manager', // This would come from auth context
        approvalComments
      );

      if (success) {
        setShowApprovalModal(false);
        setSelectedRequest(null);
        setApprovalComments('');
        await loadData();
      } else {
        setError('Failed to approve leave request');
      }
    } catch (err) {
      setError('Failed to approve leave request');
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleRejectRequest = async () => {
    if (!selectedRequest) return;

    setSubmitting(true);
    try {
      const success = await leaveService.rejectLeaveRequest(
        selectedRequest.id,
        'HR Manager', // This would come from auth context
        approvalComments
      );

      if (success) {
        setShowApprovalModal(false);
        setSelectedRequest(null);
        setApprovalComments('');
        await loadData();
      } else {
        setError('Failed to reject leave request');
      }
    } catch (err) {
      setError('Failed to reject leave request');
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateLeaveType = async () => {
    if (!leaveTypeForm.name || !leaveTypeForm.description) {
      setError('Please fill in all required fields');
      return;
    }

    setSubmitting(true);
    try {
      const success = await leaveService.createLeaveType(leaveTypeForm);

      if (success) {
        setShowLeaveTypeModal(false);
        setLeaveTypeForm({
          name: '',
          description: '',
          maxDays: 20,
          accrualRate: 1.67,
          carryForward: true,
          requiresApproval: true,
          color: '#3B82F6'
        });
        await loadData();
      } else {
        setError('Failed to create leave type');
      }
    } catch (err) {
      setError('Failed to create leave type');
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const openApprovalModal = (request: LeaveRequest, action: 'approve' | 'reject') => {
    setSelectedRequest(request);
    setApprovalAction(action);
    setApprovalComments('');
    setShowApprovalModal(true);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { variant: 'secondary', text: 'Pending', icon: Clock },
      approved: { variant: 'default', text: 'Approved', icon: CheckCircle },
      rejected: { variant: 'destructive', text: 'Rejected', icon: XCircle },
      cancelled: { variant: 'outline', text: 'Cancelled', icon: XCircle }
    };
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    const Icon = config.icon;
    return (
      <Badge variant={config.variant as any} className="flex items-center space-x-1">
        <Icon className="h-3 w-3" />
        <span>{config.text}</span>
      </Badge>
    );
  };

  const getPendingRequests = () => leaveRequests.filter(req => req.status === 'pending');
  const getApprovedRequests = () => leaveRequests.filter(req => req.status === 'approved');
  const getRejectedRequests = () => leaveRequests.filter(req => req.status === 'rejected');

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 p-6">
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <Loader className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
              <p>Loading leave management...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Leave Management</h1>
            <p className="text-muted-foreground mt-2">
              Manage employee leave requests and leave types
            </p>
          </div>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              onClick={() => setShowLeaveTypeModal(true)}
              className="flex items-center space-x-2"
            >
              <Settings className="h-4 w-4" />
              <span>Manage Leave Types</span>
            </Button>
            <Button className="flex items-center space-x-2">
              <Download className="h-4 w-4" />
              <span>Export Report</span>
            </Button>
          </div>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <div className="ml-2">
                  <p className="text-sm font-medium text-muted-foreground">Pending</p>
                  <p className="text-2xl font-bold">{getPendingRequests().length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <div className="ml-2">
                  <p className="text-sm font-medium text-muted-foreground">Approved</p>
                  <p className="text-2xl font-bold">{getApprovedRequests().length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <XCircle className="h-4 w-4 text-red-600" />
                <div className="ml-2">
                  <p className="text-sm font-medium text-muted-foreground">Rejected</p>
                  <p className="text-2xl font-bold">{getRejectedRequests().length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <Users className="h-4 w-4 text-blue-600" />
                <div className="ml-2">
                  <p className="text-sm font-medium text-muted-foreground">Total Requests</p>
                  <p className="text-2xl font-bold">{leaveRequests.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="pending" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="pending">Pending ({getPendingRequests().length})</TabsTrigger>
            <TabsTrigger value="approved">Approved ({getApprovedRequests().length})</TabsTrigger>
            <TabsTrigger value="rejected">Rejected ({getRejectedRequests().length})</TabsTrigger>
            <TabsTrigger value="types">Leave Types</TabsTrigger>
          </TabsList>

          {/* Pending Requests */}
          <TabsContent value="pending" className="space-y-4">
            <div className="space-y-4">
              {getPendingRequests().map(request => (
                <Card key={request.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <h3 className="font-semibold">{request.leaveTypeName}</h3>
                          {getStatusBadge(request.status)}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Employee: {request.employeeId}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {format(request.startDate, 'MMM dd')} - {format(request.endDate, 'MMM dd, yyyy')}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {request.totalDays} day{request.totalDays !== 1 ? 's' : ''}
                        </p>
                        <p className="text-sm">{request.reason}</p>
                      </div>
                      <div className="text-right space-y-2">
                        <p className="text-xs text-muted-foreground">
                          Submitted: {format(request.submittedAt, 'MMM dd, yyyy')}
                        </p>
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            onClick={() => openApprovalModal(request, 'approve')}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => openApprovalModal(request, 'reject')}
                          >
                            <XCircle className="h-4 w-4 mr-1" />
                            Reject
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {getPendingRequests().length === 0 && (
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center py-8">
                      <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">No Pending Requests</h3>
                      <p className="text-muted-foreground">
                        All leave requests have been processed.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* Approved Requests */}
          <TabsContent value="approved" className="space-y-4">
            <div className="space-y-4">
              {getApprovedRequests().map(request => (
                <Card key={request.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <h3 className="font-semibold">{request.leaveTypeName}</h3>
                          {getStatusBadge(request.status)}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Employee: {request.employeeId}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {format(request.startDate, 'MMM dd')} - {format(request.endDate, 'MMM dd, yyyy')}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {request.totalDays} day{request.totalDays !== 1 ? 's' : ''}
                        </p>
                        <p className="text-sm">{request.reason}</p>
                      </div>
                      <div className="text-right space-y-2">
                        <p className="text-xs text-muted-foreground">
                          Approved: {request.reviewedAt ? format(request.reviewedAt, 'MMM dd, yyyy') : 'N/A'}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          By: {request.reviewedBy || 'N/A'}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Rejected Requests */}
          <TabsContent value="rejected" className="space-y-4">
            <div className="space-y-4">
              {getRejectedRequests().map(request => (
                <Card key={request.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <h3 className="font-semibold">{request.leaveTypeName}</h3>
                          {getStatusBadge(request.status)}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Employee: {request.employeeId}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {format(request.startDate, 'MMM dd')} - {format(request.endDate, 'MMM dd, yyyy')}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {request.totalDays} day{request.totalDays !== 1 ? 's' : ''}
                        </p>
                        <p className="text-sm">{request.reason}</p>
                        {request.comments && (
                          <p className="text-sm text-red-600">Reason: {request.comments}</p>
                        )}
                      </div>
                      <div className="text-right space-y-2">
                        <p className="text-xs text-muted-foreground">
                          Rejected: {request.reviewedAt ? format(request.reviewedAt, 'MMM dd, yyyy') : 'N/A'}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          By: {request.reviewedBy || 'N/A'}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Leave Types */}
          <TabsContent value="types" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {leaveTypes.map(leaveType => (
                <Card key={leaveType.id}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{leaveType.name}</CardTitle>
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: leaveType.color }}
                      />
                    </div>
                    <CardDescription>{leaveType.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Max Days:</span>
                        <span className="font-medium">{leaveType.maxDays}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Accrual Rate:</span>
                        <span className="font-medium">{leaveType.accrualRate} days/month</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Carry Forward:</span>
                        <span className="font-medium">{leaveType.carryForward ? 'Yes' : 'No'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Requires Approval:</span>
                        <span className="font-medium">{leaveType.requiresApproval ? 'Yes' : 'No'}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {/* Approval Modal */}
        {showApprovalModal && selectedRequest && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <Card className="w-full max-w-md mx-4">
              <CardHeader>
                <CardTitle>
                  {approvalAction === 'approve' ? 'Approve' : 'Reject'} Leave Request
                </CardTitle>
                <CardDescription>
                  {approvalAction === 'approve'
                    ? 'Are you sure you want to approve this leave request?'
                    : 'Are you sure you want to reject this leave request?'}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <p className="text-sm"><strong>Employee:</strong> {selectedRequest.employeeId}</p>
                  <p className="text-sm"><strong>Leave Type:</strong> {selectedRequest.leaveTypeName}</p>
                  <p className="text-sm"><strong>Dates:</strong> {format(selectedRequest.startDate, 'MMM dd')} - {format(selectedRequest.endDate, 'MMM dd, yyyy')}</p>
                  <p className="text-sm"><strong>Days:</strong> {selectedRequest.totalDays}</p>
                  <p className="text-sm"><strong>Reason:</strong> {selectedRequest.reason}</p>
                </div>

                <div>
                  <Label htmlFor="comments">Comments</Label>
                  <Textarea
                    id="comments"
                    placeholder={`Enter comments for ${approvalAction}...`}
                    value={approvalComments}
                    onChange={(e) => setApprovalComments(e.target.value)}
                  />
                </div>

                <div className="flex space-x-2">
                  <Button
                    onClick={approvalAction === 'approve' ? handleApproveRequest : handleRejectRequest}
                    disabled={submitting}
                    className={`flex-1 ${approvalAction === 'approve' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}`}
                  >
                    {submitting ? (
                      <>
                        <Loader className="mr-2 h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      `${approvalAction === 'approve' ? 'Approve' : 'Reject'} Request`
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setShowApprovalModal(false)}
                    disabled={submitting}
                  >
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Leave Type Modal */}
        {showLeaveTypeModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <Card className="w-full max-w-md mx-4">
              <CardHeader>
                <CardTitle>Create Leave Type</CardTitle>
                <CardDescription>
                  Add a new leave type for employees
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    placeholder="e.g., Annual Leave"
                    value={leaveTypeForm.name}
                    onChange={(e) => setLeaveTypeForm(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe this leave type..."
                    value={leaveTypeForm.description}
                    onChange={(e) => setLeaveTypeForm(prev => ({ ...prev, description: e.target.value }))}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="maxDays">Max Days</Label>
                    <Input
                      id="maxDays"
                      type="number"
                      value={leaveTypeForm.maxDays}
                      onChange={(e) => setLeaveTypeForm(prev => ({ ...prev, maxDays: parseInt(e.target.value) || 0 }))}
                    />
                  </div>

                  <div>
                    <Label htmlFor="accrualRate">Accrual Rate (days/month)</Label>
                    <Input
                      id="accrualRate"
                      type="number"
                      step="0.01"
                      value={leaveTypeForm.accrualRate}
                      onChange={(e) => setLeaveTypeForm(prev => ({ ...prev, accrualRate: parseFloat(e.target.value) || 0 }))}
                    />
                  </div>
                </div>

                <div className="flex space-x-2">
                  <Button
                    onClick={handleCreateLeaveType}
                    disabled={submitting}
                    className="flex-1"
                  >
                    {submitting ? (
                      <>
                        <Loader className="mr-2 h-4 w-4 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      'Create Leave Type'
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setShowLeaveTypeModal(false)}
                    disabled={submitting}
                  >
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}