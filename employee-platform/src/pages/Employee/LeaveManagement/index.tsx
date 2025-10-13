import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Textarea } from '../../../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../components/ui/tabs';
import { Alert, AlertDescription } from '../../../components/ui/alert';
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
    Loader
} from 'lucide-react';
import { format } from 'date-fns';
import { leaveService, LeaveRequest, LeaveType, LeaveBalance } from '../services/leaveService';
import { useLeaveRequests, useLeaveTypes } from '../../../hooks/useRealTimeSync';
import { normalizeLeaveStatus, formatLeaveDateRange, getStatusDisplayInfo } from '../../../types/leaveManagement';
import { LeaveSyncService } from '../../../services/leaveSyncService';
import { useCompany } from '../../../context/CompanyContext';
import { useAuth } from '../../../context/AuthContext';

export default function LeaveManagement() {
    const { companyId } = useCompany();
    const { currentEmployee } = useAuth();

    // Get employee ID from auth context
    const [employeeId] = useState(() => {
        return currentEmployee?.employeeId || localStorage.getItem('currentEmployeeId') || 'EMP123456ABC';
    });
    const [employeeName, setEmployeeName] = useState<string>('');
    const [leaveBalances, setLeaveBalances] = useState<LeaveBalance[]>([]);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    // Initialize sync service
    const leaveSyncService = new LeaveSyncService();

    // Form state
    const [showRequestForm, setShowRequestForm] = useState(false);
    const [selectedLeaveType, setSelectedLeaveType] = useState('');
    const [startDate, setStartDate] = useState<Date>();
    const [endDate, setEndDate] = useState<Date>();
    const [reason, setReason] = useState('');

    // Use real-time sync for leave data (filtered by company and employee)
    const { data: allLeaveRequests, loading: requestsLoading } = useLeaveRequests(employeeId, companyId || undefined);
    const { data: leaveTypes, loading: typesLoading } = useLeaveTypes(companyId || undefined);
    const loading = requestsLoading || typesLoading;

    // Filter requests for this employee (double-check client-side)
    const leaveRequests = (allLeaveRequests as LeaveRequest[])?.filter((request: LeaveRequest) =>
        request.employeeId === employeeId
    ) || [];


    // Load employee name from profile
    useEffect(() => {
        const loadEmployeeName = async () => {
            try {
                const { getComprehensiveDataFlowService } = await import('../../../services/comprehensiveDataFlowService');
                const dataFlowService = await getComprehensiveDataFlowService();
                const profile = await dataFlowService.getEmployeeProfile(employeeId);
                if (profile) {
                    const fullName = `${profile.personalInfo.firstName} ${profile.personalInfo.lastName}`;
                    setEmployeeName(fullName);
                    console.log('📝 Employee name loaded:', fullName);
                }
            } catch (error) {
                console.error('Failed to load employee name:', error);
            }
        };
        loadEmployeeName();
    }, [employeeId]);

    // Load leave balances (still using legacy service for now)
    useEffect(() => {
        loadLeaveBalances();
    }, [employeeId]);

    const loadLeaveBalances = async () => {
        try {
            const balances = await leaveService.getEmployeeLeaveBalances(employeeId);
            setLeaveBalances(balances);
        } catch (err) {
            console.error('Failed to load leave balances:', err);
        }
    };

    // Use unified date formatting function
    const formatDateRange = formatLeaveDateRange;

    const handleSubmitRequest = async () => {
        if (!selectedLeaveType || !startDate || !endDate || !reason) {
            setError('Please fill in all required fields');
            return;
        }

        setSubmitting(true);

        try {
            const selectedType = (leaveTypes as LeaveType[]).find((lt: LeaveType) => lt.id === selectedLeaveType);
            if (!selectedType) {
                setError('Invalid leave type selected');
                return;
            }

            const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;

            // ✅ Use leaveSyncService for real-time sync
            console.log('📝 Submitting leave request via sync service...');
            const requestId = await leaveSyncService.submitLeaveRequest({
                employeeId,
                employeeName: employeeName || currentEmployee?.firstName + ' ' + currentEmployee?.lastName || 'Unknown Employee',
                companyId: companyId || '', // ✅ Include companyId for multi-tenancy
                leaveTypeId: selectedLeaveType,
                leaveTypeName: selectedType.name,
                startDate,
                endDate,
                totalDays,
                reason
            });

            console.log('✅ Leave request submitted successfully:', requestId);
            setShowRequestForm(false);
            setSelectedLeaveType('');
            setStartDate(undefined);
            setEndDate(undefined);
            setReason('');
            await loadLeaveBalances(); // Reload balances (requests update via real-time sync)

            // Show success message
            setError(''); // Clear any previous errors
        } catch (err) {
            setError('Failed to submit leave request');
            console.error('❌ Error submitting leave request:', err);
        } finally {
            setSubmitting(false);
        }
    };

    const handleCancelRequest = async (requestId: string) => {
        try {
            // ✅ Use leaveSyncService for real-time sync
            console.log('🚫 Cancelling leave request via sync service...');
            await leaveSyncService.cancelLeaveRequest(requestId);
            console.log('✅ Leave request cancelled successfully');
            await loadLeaveBalances(); // Reload balances (requests update via real-time sync)
        } catch (err) {
            console.error('❌ Failed to cancel request:', err);
        }
    };

    const getStatusBadge = (status: string) => {
        const statusInfo = getStatusDisplayInfo(status);
        const normalizedStatus = normalizeLeaveStatus(status);

        const iconMap = {
            pending: Clock,
            approved: CheckCircle,
            rejected: XCircle,
            cancelled: AlertCircle
        };

        const Icon = iconMap[normalizedStatus];

        return (
            <Badge variant={statusInfo.variant} className={`flex items-center gap-1 ${statusInfo.bgColor} ${statusInfo.color}`}>
                <Icon className="h-3 w-3" />
                {statusInfo.text}
            </Badge>
        );
    };

    if (loading) {
        return (
            <div className="p-6">
                <div className="max-w-7xl mx-auto">
                    <div className="flex items-center justify-center h-64">
                        <Loader className="h-8 w-8 animate-spin text-blue-600" />
                        <span className="ml-2">Loading leave data...</span>
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
                        <p className="text-muted-foreground mt-2">Manage your leave requests and track your balances</p>
                    </div>
                    <Button
                        onClick={() => setShowRequestForm(true)}
                        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
                    >
                        <Plus className="h-5 w-5" />
                        Request Leave
                    </Button>
                </div>

                {/* Error Alert */}
                {error && (
                    <Alert variant="destructive" className="border-red-200 bg-red-50">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription className="text-red-800">{error}</AlertDescription>
                    </Alert>
                )}

                <Tabs defaultValue="requests" className="space-y-6">
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="requests">
                            My Requests ({leaveRequests.filter(req => normalizeLeaveStatus(req.status) === 'pending').length})
                        </TabsTrigger>
                        <TabsTrigger value="balances">
                            Leave Balances
                        </TabsTrigger>
                        <TabsTrigger value="history">
                            History ({leaveRequests.filter(req => normalizeLeaveStatus(req.status) !== 'pending').length})
                        </TabsTrigger>
                    </TabsList>

                    {/* Leave Requests - Only Pending */}
                    <TabsContent value="requests" className="space-y-6">
                        {leaveRequests.filter(req => normalizeLeaveStatus(req.status) === 'pending').length === 0 ? (
                            <Card className="border-dashed border-2 border-gray-300">
                                <CardContent className="pt-12 pb-12">
                                    <div className="text-center space-y-4">
                                        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                                            <FileText className="h-8 w-8 text-blue-600" />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-semibold text-gray-900">No Leave Requests</h3>
                                            <p className="text-gray-500">You haven't submitted any leave requests yet.</p>
                                        </div>
                                        <Button
                                            onClick={() => setShowRequestForm(true)}
                                            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                                        >
                                            <Plus className="h-4 w-4 mr-2" />
                                            Submit Your First Request
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {leaveRequests.filter(req => normalizeLeaveStatus(req.status) === 'pending').map(request => (
                                    <Card key={request.id}>
                                        <CardHeader className="pb-4">
                                            <div className="flex items-center justify-between">
                                                <CardTitle className="text-xl font-semibold text-gray-900">
                                                    {request.leaveTypeName}
                                                </CardTitle>
                                                {getStatusBadge(request.status)}
                                            </div>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            <div className="space-y-3">
                                                <div className="flex items-center space-x-2 text-sm text-gray-600">
                                                    <CalendarIcon className="h-4 w-4" />
                                                    <span>{formatDateRange(request.startDate, request.endDate)}</span>
                                                </div>
                                                <div className="flex items-center space-x-2 text-sm text-gray-600">
                                                    <Clock className="h-4 w-4" />
                                                    <span>{request.totalDays} day{request.totalDays !== 1 ? 's' : ''}</span>
                                                </div>
                                                <div className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">
                                                    <strong>Reason:</strong> {request.reason}
                                                </div>
                                            </div>
                                            {request.status?.toLowerCase() === 'pending' && (
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleCancelRequest(request.id)}
                                                    className="w-full border-red-200 text-red-600 hover:bg-red-50"
                                                >
                                                    <XCircle className="h-4 w-4 mr-2" />
                                                    Cancel Request
                                                </Button>
                                            )}
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </TabsContent>

                    {/* Leave Balances */}
                    <TabsContent value="balances" className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {(leaveTypes as LeaveType[]).map((type: LeaveType) => {
                                // Calculate used days from approved requests
                                const usedDays = leaveRequests
                                    .filter(req => req.leaveTypeId === type.id && normalizeLeaveStatus(req.status) === 'approved')
                                    .reduce((sum, req) => sum + req.totalDays, 0);

                                const remainingDays = type.maxDays - usedDays;

                                return (
                                    <Card key={type.id}>
                                        <CardHeader className="pb-4">
                                            <CardTitle className="text-xl font-semibold text-gray-900">
                                                {type.name}
                                            </CardTitle>
                                            <CardDescription className="text-gray-600">Available leave balance</CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="space-y-4">
                                                <div className="flex justify-between items-center py-2 px-3 bg-blue-50 rounded-lg">
                                                    <span className="text-sm font-medium text-gray-700">Total Days</span>
                                                    <span className="font-bold text-blue-600">{type.maxDays}</span>
                                                </div>
                                                <div className="flex justify-between items-center py-2 px-3 bg-orange-50 rounded-lg">
                                                    <span className="text-sm font-medium text-gray-700">Used Days</span>
                                                    <span className="font-bold text-orange-600">{usedDays}</span>
                                                </div>
                                                <div className="flex justify-between items-center py-2 px-3 bg-green-50 rounded-lg">
                                                    <span className="text-sm font-medium text-gray-700">Remaining</span>
                                                    <span className="font-bold text-green-600">{remainingDays}</span>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                );
                            })}
                        </div>
                    </TabsContent>

                    {/* History - Only show approved, rejected, or cancelled requests */}
                    <TabsContent value="history" className="space-y-4">
                        {leaveRequests.filter(req => normalizeLeaveStatus(req.status) !== 'pending').length === 0 ? (
                            <Card className="border-dashed border-2 border-gray-300">
                                <CardContent className="pt-12 pb-12">
                                    <div className="text-center space-y-4">
                                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
                                            <Clock className="h-8 w-8 text-gray-400" />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-semibold text-gray-900">No History</h3>
                                            <p className="text-gray-500">You don't have any processed leave requests yet.</p>
                                            <p className="text-sm text-gray-400 mt-2">Approved, rejected, or cancelled requests will appear here.</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {leaveRequests.filter(req => normalizeLeaveStatus(req.status) !== 'pending').map(request => (
                                    <Card key={request.id}>
                                        <CardHeader className="pb-3">
                                            <div className="flex items-center justify-between">
                                                <CardTitle className="text-lg">{request.leaveTypeName}</CardTitle>
                                                {getStatusBadge(request.status)}
                                            </div>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="space-y-2">
                                                <p className="text-sm text-muted-foreground">
                                                    {formatDateRange(request.startDate, request.endDate)}
                                                </p>
                                                <p className="text-sm text-muted-foreground">
                                                    {request.totalDays} day{request.totalDays !== 1 ? 's' : ''}
                                                </p>
                                                <p className="text-sm">{request.reason}</p>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </TabsContent>
                </Tabs>

                {/* Leave Request Form Modal */}
                {showRequestForm && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                        <Card className="w-full max-w-lg">
                            <CardHeader>
                                <CardTitle>Request Leave</CardTitle>
                                <CardDescription>Submit a new leave request</CardDescription>
                            </CardHeader>
                            <CardContent className="p-6 space-y-6">
                                <div>
                                    <Label htmlFor="leaveType" className="text-sm font-medium text-gray-700 mb-2 block">
                                        Leave Type
                                    </Label>
                                    <Select value={selectedLeaveType} onValueChange={setSelectedLeaveType}>
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder="Select leave type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {(leaveTypes as LeaveType[]).map((type: LeaveType) => (
                                                <SelectItem key={type.id} value={type.id}>
                                                    {type.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="startDate" className="text-sm font-medium text-gray-700 mb-2 block">
                                            Start Date
                                        </Label>
                                        <Input
                                            id="startDate"
                                            type="date"
                                            value={startDate ? startDate.toISOString().split('T')[0] : ''}
                                            onChange={(e) => setStartDate(e.target.value ? new Date(e.target.value) : undefined)}
                                        />
                                    </div>

                                    <div>
                                        <Label htmlFor="endDate" className="text-sm font-medium text-gray-700 mb-2 block">
                                            End Date
                                        </Label>
                                        <Input
                                            id="endDate"
                                            type="date"
                                            value={endDate ? endDate.toISOString().split('T')[0] : ''}
                                            onChange={(e) => setEndDate(e.target.value ? new Date(e.target.value) : undefined)}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <Label htmlFor="reason" className="text-sm font-medium text-gray-700 mb-2 block">
                                        Reason for Leave
                                    </Label>
                                    <Textarea
                                        id="reason"
                                        placeholder="Please provide a reason for your leave request..."
                                        value={reason}
                                        onChange={(e) => setReason(e.target.value)}
                                        rows={3}
                                    />
                                </div>

                                <div className="flex space-x-3 pt-4">
                                    <Button
                                        onClick={handleSubmitRequest}
                                        disabled={submitting}
                                        className="flex-1 bg-blue-600 hover:bg-blue-700"
                                    >
                                        {submitting ? <Loader className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
                                        {submitting ? 'Submitting...' : 'Submit Request'}
                                    </Button>
                                    <Button
                                        variant="outline"
                                        onClick={() => setShowRequestForm(false)}
                                        className="flex-1"
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