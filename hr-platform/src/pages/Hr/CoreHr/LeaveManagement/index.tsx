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
  Users,
  Edit
} from 'lucide-react';
import { format } from 'date-fns';
import { leaveRequestService, leaveTypeService, LeaveRequest, LeaveType } from './services/leaveService';
import { doc, updateDoc } from 'firebase/firestore';
import { getFirebaseDb } from '../../../../config/firebase';
import { useLeaveRequests, useLeaveTypes } from '../../../../hooks/useRealTimeSync';
import { normalizeLeaveStatus, formatLeaveDateRange, formatLeaveDate, getStatusDisplayInfo } from '../../../../types/leaveManagement';

export default function HRLeaveManagement() {
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
  const [editingLeaveType, setEditingLeaveType] = useState<string | null>(null);

  // Use real-time sync for leave data
  const { data: leaveRequests, loading: requestsLoading } = useLeaveRequests();
  const { data: leaveTypes, loading: typesLoading } = useLeaveTypes();
  const loading = requestsLoading || typesLoading;

  // Type the real-time sync data properly
  const typedLeaveRequests = (leaveRequests as LeaveRequest[]) || [];
  const typedLeaveTypes = (leaveTypes as LeaveType[]) || [];

  // Use unified date formatting functions
  const formatDateRange = formatLeaveDateRange;
  const formatSafeDate = formatLeaveDate;


  const handleApproveRequest = async () => {
    if (!selectedRequest) return;

    setSubmitting(true);
    try {
      console.log('🔄 Approving leave request:', selectedRequest.id);
      await leaveRequestService.approve(
        selectedRequest.id,
        'HR Manager' // This would come from auth context
      );

      setShowApprovalModal(false);
      setSelectedRequest(null);
      setApprovalComments('');
      // Real-time sync will automatically update the data
      console.log('✅ Leave request approved - real-time sync will update the UI');
    } catch (err) {
      setError('Failed to approve leave request');
      console.error('❌ Approval error:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleRejectRequest = async () => {
    if (!selectedRequest) return;

    setSubmitting(true);
    try {
      console.log('🔄 Rejecting leave request:', selectedRequest.id);
      await leaveRequestService.reject(
        selectedRequest.id,
        'HR Manager' // This would come from auth context
      );

      setShowApprovalModal(false);
      setSelectedRequest(null);
      setApprovalComments('');
      // Real-time sync will automatically update the data
      console.log('✅ Leave request rejected - real-time sync will update the UI');
    } catch (err) {
      setError('Failed to reject leave request');
      console.error('❌ Rejection error:', err);
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
      if (editingLeaveType) {
        // Update existing leave type
        await leaveTypeService.update(editingLeaveType, {
          ...leaveTypeForm,
          daysAllowed: leaveTypeForm.maxDays
        });
        console.log('✅ Leave type updated successfully');
      } else {
        // Create new leave type
        await leaveTypeService.add({
          ...leaveTypeForm,
          daysAllowed: leaveTypeForm.maxDays
        });
        console.log('✅ Leave type created successfully');
      }

      setShowLeaveTypeModal(false);
      setEditingLeaveType(null);
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
    } catch (err) {
      setError(editingLeaveType ? 'Failed to update leave type' : 'Failed to create leave type');
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
    const statusInfo = getStatusDisplayInfo(status);
    const normalizedStatus = normalizeLeaveStatus(status);
    
    const iconMap = {
      pending: Clock,
      approved: CheckCircle,
      rejected: XCircle,
      cancelled: XCircle
    };
    
    const Icon = iconMap[normalizedStatus];

    return (
      <Badge variant={statusInfo.variant} className={`flex items-center space-x-1 ${statusInfo.bgColor} ${statusInfo.color}`}>
        <Icon className="h-3 w-3" />
        <span>{statusInfo.text}</span>
      </Badge>
    );
  };

  // Use unified status filtering functions
  const getPendingRequests = () => {
    return typedLeaveRequests.filter(req => {
      const status = normalizeLeaveStatus(req.status);
      return status === 'pending';
    });
  };

  const getApprovedRequests = () => {
    return typedLeaveRequests.filter(req => {
      const status = normalizeLeaveStatus(req.status);
      return status === 'approved';
    });
  };

  const getRejectedRequests = () => {
    return typedLeaveRequests.filter(req => {
      const status = normalizeLeaveStatus(req.status);
      return status === 'rejected';
    });
  };



  if (loading) {
    return (
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
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
    <div className="p-6">
      <div className="max-w-7xl mx-auto space-y-6">
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
              onClick={() => setShowLeaveTypeModal(true)}
              className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700"
            >
              <Settings className="h-4 w-4" />
              <span>Manage Leave Types</span>
            </Button>
            <Button 
              variant="outline"
              className="flex items-center space-x-2"
            >
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
                        <div className="flex items-center space-x-2 mb-2">
                          <User className="h-4 w-4 text-blue-600" />
                          <p className="text-sm font-medium text-gray-900">
                            {request.employeeName || request.employeeId}
                          </p>
                        </div>
                        <p className="text-xs text-muted-foreground mb-2">
                          ID: {request.employeeId}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {formatDateRange(request.startDate, request.endDate)}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {request.totalDays} day{request.totalDays !== 1 ? 's' : ''}
                        </p>
                        <p className="text-sm">{request.reason}</p>
                      </div>
                      <div className="text-right space-y-2">
                        <p className="text-xs text-muted-foreground">
                          Submitted: {formatSafeDate(request.submittedAt)}
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
                        <div className="flex items-center space-x-2 mb-2">
                          <User className="h-4 w-4 text-green-600" />
                          <p className="text-sm font-medium text-gray-900">
                            {request.employeeName || request.employeeId}
                          </p>
                        </div>
                        <p className="text-xs text-muted-foreground mb-2">
                          ID: {request.employeeId}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {formatDateRange(request.startDate, request.endDate)}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {request.totalDays} day{request.totalDays !== 1 ? 's' : ''}
                        </p>
                        <p className="text-sm">{request.reason}</p>
                      </div>
                      <div className="text-right space-y-2">
                        <p className="text-xs text-muted-foreground">
                          Approved: {formatSafeDate(request.reviewedAt)}
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
                        <div className="flex items-center space-x-2 mb-2">
                          <User className="h-4 w-4 text-red-600" />
                          <p className="text-sm font-medium text-gray-900">
                            {request.employeeName || request.employeeId}
                          </p>
                        </div>
                        <p className="text-xs text-muted-foreground mb-2">
                          ID: {request.employeeId}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {formatDateRange(request.startDate, request.endDate)}
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
                          Rejected: {formatSafeDate(request.reviewedAt)}
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
              {typedLeaveTypes.map(leaveType => (
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
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setLeaveTypeForm({
                            name: leaveType.name,
                            description: leaveType.description || '',
                            maxDays: leaveType.maxDays,
                            accrualRate: leaveType.accrualRate,
                            carryForward: leaveType.carryForward !== false,
                            requiresApproval: leaveType.requiresApproval !== false,
                            color: leaveType.color || '#3B82F6'
                          });
                          setEditingLeaveType(leaveType.id);
                          setShowLeaveTypeModal(true);
                        }}
                        className="w-full mt-4"
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Edit Leave Type
                      </Button>
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
                  <p className="text-sm"><strong>Dates:</strong> {formatDateRange(selectedRequest.startDate, selectedRequest.endDate)}</p>
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
                <CardTitle>{editingLeaveType ? 'Edit Leave Type' : 'Create Leave Type'}</CardTitle>
                <CardDescription>
                  {editingLeaveType ? 'Update leave type details' : 'Add a new leave type for employees'}
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
                    <Label htmlFor="maxDays">Max Days (per year)</Label>
                    <Input
                      id="maxDays"
                      type="number"
                      value={leaveTypeForm.maxDays}
                      onChange={(e) => {
                        const maxDays = parseInt(e.target.value) || 0;
                        const calculatedAccrualRate = parseFloat((maxDays / 12).toFixed(2));
                        setLeaveTypeForm(prev => ({ 
                          ...prev, 
                          maxDays,
                          accrualRate: calculatedAccrualRate
                        }));
                      }}
                    />
                  </div>

                  <div>
                    <Label htmlFor="accrualRate">Accrual Rate (days/month)</Label>
                    <p className="text-xs text-gray-500 mb-2">Auto-calculated: {leaveTypeForm.maxDays} days ÷ 12 months = {leaveTypeForm.accrualRate.toFixed(2)} days/month</p>
                    <Input
                      id="accrualRate"
                      type="number"
                      step="0.01"
                      value={leaveTypeForm.accrualRate}
                      onChange={(e) => setLeaveTypeForm(prev => ({ ...prev, accrualRate: parseFloat(e.target.value) || 0 }))}
                      className="bg-gray-50"
                    />
                    <p className="text-xs text-blue-600 mt-1">💡 This is auto-calculated but you can override it if needed</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <Label htmlFor="carryForward" className="text-base font-medium">Carry Forward</Label>
                      <p className="text-sm text-gray-600">Allow unused days to carry to next year</p>
                    </div>
                    <input
                      id="carryForward"
                      type="checkbox"
                      checked={leaveTypeForm.carryForward}
                      onChange={(e) => setLeaveTypeForm(prev => ({ ...prev, carryForward: e.target.checked }))}
                      className="h-5 w-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <Label htmlFor="requiresApproval" className="text-base font-medium">Requires Approval</Label>
                      <p className="text-sm text-gray-600">Manager approval required for this leave type</p>
                    </div>
                    <input
                      id="requiresApproval"
                      type="checkbox"
                      checked={leaveTypeForm.requiresApproval}
                      onChange={(e) => setLeaveTypeForm(prev => ({ ...prev, requiresApproval: e.target.checked }))}
                      className="h-5 w-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
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
                        {editingLeaveType ? 'Updating...' : 'Creating...'}
                      </>
                    ) : (
                      editingLeaveType ? 'Update Leave Type' : 'Create Leave Type'
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowLeaveTypeModal(false);
                      setEditingLeaveType(null);
                      setLeaveTypeForm({
                        name: '',
                        description: '',
                        maxDays: 20,
                        accrualRate: 1.67,
                        carryForward: true,
                        requiresApproval: true,
                        color: '#3B82F6'
                      });
                    }}
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