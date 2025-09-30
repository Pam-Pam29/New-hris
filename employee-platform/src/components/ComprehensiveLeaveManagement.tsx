import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Textarea } from './ui/textarea';
import { Progress } from './ui/progress';
import { Separator } from './ui/separator';
import { useToast } from '../hooks/use-toast';
import {
    Calendar,
    Plus,
    Clock,
    CheckCircle,
    XCircle,
    AlertCircle,
    FileText,
    Upload,
    Download,
    Filter,
    Search,
    MoreHorizontal,
    Eye,
    Edit,
    Trash2,
    CalendarDays,
    TrendingUp,
    Users,
    BarChart3
} from 'lucide-react';
import {
    getComprehensiveHRDataFlowService,
    LeaveType,
    LeaveRequest,
    LeaveBalance
} from '../services/comprehensiveHRDataFlow';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from './ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from './ui/select';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from './ui/table';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from './ui/dropdown-menu';

interface ComprehensiveLeaveManagementProps {
    employeeId: string;
    mode: 'employee' | 'hr';
}

export function ComprehensiveLeaveManagement({ employeeId, mode }: ComprehensiveLeaveManagementProps) {
    const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([]);
    const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
    const [leaveBalances, setLeaveBalances] = useState<LeaveBalance[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'overview' | 'request' | 'history' | 'types' | 'analytics'>('overview');

    // Request form state
    const [isRequestDialogOpen, setIsRequestDialogOpen] = useState(false);
    const [requestForm, setRequestForm] = useState({
        leaveTypeId: '',
        startDate: '',
        endDate: '',
        reason: '',
        urgencyLevel: 'medium' as 'low' | 'medium' | 'high',
        businessImpact: '',
        coverageArrangements: '',
        attachments: [] as File[]
    });

    // Leave type form state (HR only)
    const [isTypeDialogOpen, setIsTypeDialogOpen] = useState(false);
    const [typeForm, setTypeForm] = useState({
        name: '',
        description: '',
        maxDaysPerYear: 20,
        color: '#3B82F6',
        requiresApproval: true,
        requiresDocumentation: false,
        carryOverEnabled: false,
        maxCarryOverDays: 5,
        accrualEnabled: false,
        accrualRate: 1.67
    });

    const [filters, setFilters] = useState({
        status: 'all',
        leaveType: 'all',
        dateRange: 'all'
    });

    const { toast } = useToast();

    useEffect(() => {
        initializeLeaveData();
    }, [employeeId, mode]);

    const initializeLeaveData = async () => {
        try {
            setLoading(true);
            const dataFlowService = await getComprehensiveHRDataFlowService();

            // Load leave types
            const types = await dataFlowService.getLeaveTypes();
            setLeaveTypes(types);

            // Load leave requests
            const requests = mode === 'hr'
                ? await dataFlowService.getLeaveRequests()
                : await dataFlowService.getLeaveRequests(employeeId);
            setLeaveRequests(requests);

            // Load leave balances
            const balances = mode === 'hr'
                ? await dataFlowService.getLeaveBalances()
                : await dataFlowService.getLeaveBalances(employeeId);
            setLeaveBalances(balances);

            setLoading(false);
        } catch (error) {
            console.error('Error initializing leave data:', error);
            setLoading(false);
            toast({
                title: "Error",
                description: "Failed to load leave data",
                variant: "destructive"
            });
        }
    };

    const handleSubmitLeaveRequest = async () => {
        try {
            if (!requestForm.leaveTypeId || !requestForm.startDate || !requestForm.endDate || !requestForm.reason) {
                toast({
                    title: "Validation Error",
                    description: "Please fill in all required fields",
                    variant: "destructive"
                });
                return;
            }

            const startDate = new Date(requestForm.startDate);
            const endDate = new Date(requestForm.endDate);
            const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;

            const selectedLeaveType = leaveTypes.find(lt => lt.id === requestForm.leaveTypeId);
            if (!selectedLeaveType) {
                toast({
                    title: "Error",
                    description: "Selected leave type not found",
                    variant: "destructive"
                });
                return;
            }

            // Check leave balance
            const balance = leaveBalances.find(b => b.leaveTypeId === requestForm.leaveTypeId);
            if (balance && balance.remainingDays < totalDays) {
                toast({
                    title: "Insufficient Balance",
                    description: `You only have ${balance.remainingDays} days remaining for ${selectedLeaveType.name}`,
                    variant: "destructive"
                });
                return;
            }

            const dataFlowService = await getComprehensiveHRDataFlowService();

            const newRequest: Omit<LeaveRequest, 'id' | 'submittedAt'> = {
                employeeId,
                employeeName: 'Current Employee', // In real app, get from profile
                employeeDepartment: 'Engineering', // In real app, get from profile
                leaveTypeId: requestForm.leaveTypeId,
                leaveTypeName: selectedLeaveType.name,
                startDate,
                endDate,
                totalDays,
                reason: requestForm.reason,
                status: 'pending',
                urgencyLevel: requestForm.urgencyLevel,
                businessImpact: requestForm.businessImpact,
                coverageArrangements: requestForm.coverageArrangements
            };

            await dataFlowService.createLeaveRequest(newRequest);

            toast({
                title: "Success",
                description: "Leave request submitted successfully",
            });

            setIsRequestDialogOpen(false);
            setRequestForm({
                leaveTypeId: '',
                startDate: '',
                endDate: '',
                reason: '',
                urgencyLevel: 'medium',
                businessImpact: '',
                coverageArrangements: '',
                attachments: []
            });

            // Refresh data
            initializeLeaveData();
        } catch (error) {
            console.error('Error submitting leave request:', error);
            toast({
                title: "Error",
                description: "Failed to submit leave request",
                variant: "destructive"
            });
        }
    };

    const handleCreateLeaveType = async () => {
        try {
            if (!typeForm.name || !typeForm.description) {
                toast({
                    title: "Validation Error",
                    description: "Please fill in all required fields",
                    variant: "destructive"
                });
                return;
            }

            const dataFlowService = await getComprehensiveHRDataFlowService();

            const newLeaveType: Omit<LeaveType, 'id' | 'createdAt' | 'updatedAt'> = {
                name: typeForm.name,
                description: typeForm.description,
                maxDaysPerYear: typeForm.maxDaysPerYear,
                color: typeForm.color,
                isActive: true,
                requiresApproval: typeForm.requiresApproval,
                requiresDocumentation: typeForm.requiresDocumentation,
                carryOverRules: {
                    enabled: typeForm.carryOverEnabled,
                    maxCarryOverDays: typeForm.maxCarryOverDays,
                    expiryMonths: 12
                },
                accrualRules: {
                    enabled: typeForm.accrualEnabled,
                    accrualRate: typeForm.accrualRate,
                    maxAccrualDays: typeForm.maxDaysPerYear,
                    startAccrualAfterMonths: 0
                },
                applicableRoles: [],
                applicableDepartments: [],
                createdBy: employeeId
            };

            await dataFlowService.createLeaveType(newLeaveType);

            toast({
                title: "Success",
                description: "Leave type created successfully",
            });

            setIsTypeDialogOpen(false);
            setTypeForm({
                name: '',
                description: '',
                maxDaysPerYear: 20,
                color: '#3B82F6',
                requiresApproval: true,
                requiresDocumentation: false,
                carryOverEnabled: false,
                maxCarryOverDays: 5,
                accrualEnabled: false,
                accrualRate: 1.67
            });

            // Refresh data
            initializeLeaveData();
        } catch (error) {
            console.error('Error creating leave type:', error);
            toast({
                title: "Error",
                description: "Failed to create leave type",
                variant: "destructive"
            });
        }
    };

    const handleApproveRequest = async (requestId: string) => {
        try {
            const dataFlowService = await getComprehensiveHRDataFlowService();
            await dataFlowService.approveLeaveRequest(requestId, employeeId, 'Approved by HR');

            toast({
                title: "Success",
                description: "Leave request approved",
            });

            initializeLeaveData();
        } catch (error) {
            console.error('Error approving leave request:', error);
            toast({
                title: "Error",
                description: "Failed to approve leave request",
                variant: "destructive"
            });
        }
    };

    const handleRejectRequest = async (requestId: string, reason: string) => {
        try {
            const dataFlowService = await getComprehensiveHRDataFlowService();
            await dataFlowService.rejectLeaveRequest(requestId, employeeId, reason);

            toast({
                title: "Success",
                description: "Leave request rejected",
            });

            initializeLeaveData();
        } catch (error) {
            console.error('Error rejecting leave request:', error);
            toast({
                title: "Error",
                description: "Failed to reject leave request",
                variant: "destructive"
            });
        }
    };

    const getStatusBadge = (status: LeaveRequest['status']) => {
        switch (status) {
            case 'approved':
                return <Badge className="bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 mr-1" />Approved</Badge>;
            case 'rejected':
                return <Badge className="bg-red-100 text-red-800"><XCircle className="h-3 w-3 mr-1" />Rejected</Badge>;
            case 'cancelled':
                return <Badge variant="outline"><XCircle className="h-3 w-3 mr-1" />Cancelled</Badge>;
            default:
                return <Badge className="bg-yellow-100 text-yellow-800"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
        }
    };

    const getUrgencyBadge = (urgency: LeaveRequest['urgencyLevel']) => {
        switch (urgency) {
            case 'high':
                return <Badge variant="destructive">High</Badge>;
            case 'medium':
                return <Badge variant="secondary">Medium</Badge>;
            case 'low':
                return <Badge variant="outline">Low</Badge>;
        }
    };

    const calculateTotalDays = () => {
        if (requestForm.startDate && requestForm.endDate) {
            const start = new Date(requestForm.startDate);
            const end = new Date(requestForm.endDate);
            return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
        }
        return 0;
    };

    const getFilteredRequests = () => {
        let filtered = leaveRequests;

        if (filters.status !== 'all') {
            filtered = filtered.filter(req => req.status === filters.status);
        }

        if (filters.leaveType !== 'all') {
            filtered = filtered.filter(req => req.leaveTypeId === filters.leaveType);
        }

        return filtered;
    };

    if (loading) {
        return (
            <div className="space-y-6">
                <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Loading leave management data...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold">Leave Management</h2>
                    <p className="text-muted-foreground">
                        {mode === 'employee'
                            ? 'Manage your leave requests and view balances'
                            : 'Manage employee leave requests and leave types'
                        }
                    </p>
                </div>
                <div className="flex space-x-2">
                    {mode === 'hr' && (
                        <Dialog open={isTypeDialogOpen} onOpenChange={setIsTypeDialogOpen}>
                            <DialogTrigger asChild>
                                <Button variant="outline">
                                    <Plus className="h-4 w-4 mr-2" />
                                    Add Leave Type
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl">
                                <DialogHeader>
                                    <DialogTitle>Create New Leave Type</DialogTitle>
                                    <DialogDescription>
                                        Configure a new leave type for employees to use
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <Label htmlFor="typeName">Leave Type Name</Label>
                                            <Input
                                                id="typeName"
                                                value={typeForm.name}
                                                onChange={(e) => setTypeForm(prev => ({ ...prev, name: e.target.value }))}
                                                placeholder="e.g., Annual Leave"
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="maxDays">Max Days Per Year</Label>
                                            <Input
                                                id="maxDays"
                                                type="number"
                                                value={typeForm.maxDaysPerYear}
                                                onChange={(e) => setTypeForm(prev => ({ ...prev, maxDaysPerYear: parseInt(e.target.value) }))}
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <Label htmlFor="typeDescription">Description</Label>
                                        <Textarea
                                            id="typeDescription"
                                            value={typeForm.description}
                                            onChange={(e) => setTypeForm(prev => ({ ...prev, description: e.target.value }))}
                                            placeholder="Describe this leave type..."
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <Label htmlFor="typeColor">Color</Label>
                                            <Input
                                                id="typeColor"
                                                type="color"
                                                value={typeForm.color}
                                                onChange={(e) => setTypeForm(prev => ({ ...prev, color: e.target.value }))}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Options</Label>
                                            <div className="space-y-2">
                                                <label className="flex items-center space-x-2">
                                                    <input
                                                        type="checkbox"
                                                        checked={typeForm.requiresApproval}
                                                        onChange={(e) => setTypeForm(prev => ({ ...prev, requiresApproval: e.target.checked }))}
                                                    />
                                                    <span className="text-sm">Requires Approval</span>
                                                </label>
                                                <label className="flex items-center space-x-2">
                                                    <input
                                                        type="checkbox"
                                                        checked={typeForm.requiresDocumentation}
                                                        onChange={(e) => setTypeForm(prev => ({ ...prev, requiresDocumentation: e.target.checked }))}
                                                    />
                                                    <span className="text-sm">Requires Documentation</span>
                                                </label>
                                                <label className="flex items-center space-x-2">
                                                    <input
                                                        type="checkbox"
                                                        checked={typeForm.carryOverEnabled}
                                                        onChange={(e) => setTypeForm(prev => ({ ...prev, carryOverEnabled: e.target.checked }))}
                                                    />
                                                    <span className="text-sm">Allow Carry Over</span>
                                                </label>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex justify-end space-x-2">
                                        <Button variant="outline" onClick={() => setIsTypeDialogOpen(false)}>
                                            Cancel
                                        </Button>
                                        <Button onClick={handleCreateLeaveType}>
                                            Create Leave Type
                                        </Button>
                                    </div>
                                </div>
                            </DialogContent>
                        </Dialog>
                    )}

                    <Dialog open={isRequestDialogOpen} onOpenChange={setIsRequestDialogOpen}>
                        <DialogTrigger asChild>
                            <Button>
                                <Plus className="h-4 w-4 mr-2" />
                                Request Leave
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                            <DialogHeader>
                                <DialogTitle>Submit Leave Request</DialogTitle>
                                <DialogDescription>
                                    Fill in the details for your leave request
                                </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                                <div>
                                    <Label htmlFor="leaveType">Leave Type</Label>
                                    <Select
                                        value={requestForm.leaveTypeId}
                                        onValueChange={(value) => setRequestForm(prev => ({ ...prev, leaveTypeId: value }))}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select leave type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {leaveTypes.map((type) => (
                                                <SelectItem key={type.id} value={type.id}>
                                                    <div className="flex items-center space-x-2">
                                                        <div
                                                            className="w-3 h-3 rounded-full"
                                                            style={{ backgroundColor: type.color }}
                                                        />
                                                        <span>{type.name}</span>
                                                    </div>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="startDate">Start Date</Label>
                                        <Input
                                            id="startDate"
                                            type="date"
                                            value={requestForm.startDate}
                                            onChange={(e) => setRequestForm(prev => ({ ...prev, startDate: e.target.value }))}
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="endDate">End Date</Label>
                                        <Input
                                            id="endDate"
                                            type="date"
                                            value={requestForm.endDate}
                                            onChange={(e) => setRequestForm(prev => ({ ...prev, endDate: e.target.value }))}
                                        />
                                    </div>
                                </div>

                                {requestForm.startDate && requestForm.endDate && (
                                    <div className="p-3 bg-blue-50 rounded-lg">
                                        <p className="text-sm text-blue-800">
                                            Total days requested: <strong>{calculateTotalDays()}</strong>
                                        </p>
                                    </div>
                                )}

                                <div>
                                    <Label htmlFor="reason">Reason for Leave</Label>
                                    <Textarea
                                        id="reason"
                                        value={requestForm.reason}
                                        onChange={(e) => setRequestForm(prev => ({ ...prev, reason: e.target.value }))}
                                        placeholder="Please provide a reason for your leave request..."
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="urgency">Urgency Level</Label>
                                    <Select
                                        value={requestForm.urgencyLevel}
                                        onValueChange={(value: 'low' | 'medium' | 'high') =>
                                            setRequestForm(prev => ({ ...prev, urgencyLevel: value }))
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="low">Low</SelectItem>
                                            <SelectItem value="medium">Medium</SelectItem>
                                            <SelectItem value="high">High</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div>
                                    <Label htmlFor="coverage">Coverage Arrangements</Label>
                                    <Textarea
                                        id="coverage"
                                        value={requestForm.coverageArrangements}
                                        onChange={(e) => setRequestForm(prev => ({ ...prev, coverageArrangements: e.target.value }))}
                                        placeholder="How will your responsibilities be covered during your absence?"
                                    />
                                </div>

                                <div className="flex justify-end space-x-2">
                                    <Button variant="outline" onClick={() => setIsRequestDialogOpen(false)}>
                                        Cancel
                                    </Button>
                                    <Button onClick={handleSubmitLeaveRequest}>
                                        Submit Request
                                    </Button>
                                </div>
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex space-x-1 bg-muted p-1 rounded-lg">
                {[
                    { id: 'overview', label: 'Overview', icon: BarChart3 },
                    { id: 'request', label: 'Requests', icon: FileText },
                    { id: 'history', label: 'History', icon: Clock },
                    ...(mode === 'hr' ? [
                        { id: 'types', label: 'Leave Types', icon: Calendar },
                        { id: 'analytics', label: 'Analytics', icon: TrendingUp }
                    ] : [])
                ].map((tab) => (
                    <Button
                        key={tab.id}
                        variant={activeTab === tab.id ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => setActiveTab(tab.id as any)}
                        className="flex items-center space-x-2"
                    >
                        <tab.icon className="h-4 w-4" />
                        <span>{tab.label}</span>
                    </Button>
                ))}
            </div>

            {/* Overview Tab */}
            {activeTab === 'overview' && (
                <div className="space-y-6">
                    {/* Leave Balances */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center space-x-2">
                                <CalendarDays className="h-5 w-5" />
                                <span>Leave Balances</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {leaveBalances.map((balance) => {
                                    const leaveType = leaveTypes.find(lt => lt.id === balance.leaveTypeId);
                                    const usagePercentage = (balance.usedDays / balance.totalEntitlement) * 100;

                                    return (
                                        <Card key={balance.id} className="border-l-4" style={{ borderLeftColor: leaveType?.color || '#3B82F6' }}>
                                            <CardContent className="p-4">
                                                <div className="flex items-center justify-between mb-2">
                                                    <h4 className="font-semibold">{balance.leaveTypeName}</h4>
                                                    <Badge variant="outline">{balance.year}</Badge>
                                                </div>

                                                <div className="space-y-2">
                                                    <div className="flex justify-between text-sm">
                                                        <span>Used: {balance.usedDays}</span>
                                                        <span>Remaining: {balance.remainingDays}</span>
                                                    </div>

                                                    <Progress value={usagePercentage} className="h-2" />

                                                    <div className="flex justify-between text-xs text-muted-foreground">
                                                        <span>Total: {balance.totalEntitlement}</span>
                                                        {balance.pendingDays > 0 && (
                                                            <span>Pending: {balance.pendingDays}</span>
                                                        )}
                                                    </div>

                                                    {balance.carryOverDays > 0 && (
                                                        <div className="text-xs text-blue-600">
                                                            Carried over: {balance.carryOverDays} days
                                                        </div>
                                                    )}
                                                </div>
                                            </CardContent>
                                        </Card>
                                    );
                                })}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Recent Requests */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center space-x-2">
                                <Clock className="h-5 w-5" />
                                <span>Recent Leave Requests</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {leaveRequests.slice(0, 5).map((request) => (
                                    <div key={request.id} className="flex items-center justify-between p-3 border rounded-lg">
                                        <div className="flex items-center space-x-3">
                                            <div
                                                className="w-3 h-3 rounded-full"
                                                style={{ backgroundColor: leaveTypes.find(lt => lt.id === request.leaveTypeId)?.color || '#3B82F6' }}
                                            />
                                            <div>
                                                <p className="font-medium">{request.leaveTypeName}</p>
                                                <p className="text-sm text-muted-foreground">
                                                    {new Date(request.startDate).toLocaleDateString()} - {new Date(request.endDate).toLocaleDateString()}
                                                    ({request.totalDays} days)
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            {getUrgencyBadge(request.urgencyLevel)}
                                            {getStatusBadge(request.status)}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Requests Tab */}
            {activeTab === 'request' && (
                <div className="space-y-6">
                    {/* Filters */}
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center space-x-4">
                                <div className="flex-1">
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            placeholder="Search requests..."
                                            className="pl-10"
                                        />
                                    </div>
                                </div>
                                <Select
                                    value={filters.status}
                                    onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}
                                >
                                    <SelectTrigger className="w-40">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Status</SelectItem>
                                        <SelectItem value="pending">Pending</SelectItem>
                                        <SelectItem value="approved">Approved</SelectItem>
                                        <SelectItem value="rejected">Rejected</SelectItem>
                                    </SelectContent>
                                </Select>
                                <Select
                                    value={filters.leaveType}
                                    onValueChange={(value) => setFilters(prev => ({ ...prev, leaveType: value }))}
                                >
                                    <SelectTrigger className="w-40">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Types</SelectItem>
                                        {leaveTypes.map((type) => (
                                            <SelectItem key={type.id} value={type.id}>
                                                {type.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Requests Table */}
                    <Card>
                        <CardContent className="p-0">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        {mode === 'hr' && <TableHead>Employee</TableHead>}
                                        <TableHead>Leave Type</TableHead>
                                        <TableHead>Dates</TableHead>
                                        <TableHead>Days</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Urgency</TableHead>
                                        <TableHead>Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {getFilteredRequests().map((request) => (
                                        <TableRow key={request.id}>
                                            {mode === 'hr' && (
                                                <TableCell>
                                                    <div>
                                                        <p className="font-medium">{request.employeeName}</p>
                                                        <p className="text-sm text-muted-foreground">{request.employeeDepartment}</p>
                                                    </div>
                                                </TableCell>
                                            )}
                                            <TableCell>
                                                <div className="flex items-center space-x-2">
                                                    <div
                                                        className="w-3 h-3 rounded-full"
                                                        style={{ backgroundColor: leaveTypes.find(lt => lt.id === request.leaveTypeId)?.color || '#3B82F6' }}
                                                    />
                                                    <span>{request.leaveTypeName}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="text-sm">
                                                    <p>{new Date(request.startDate).toLocaleDateString()}</p>
                                                    <p className="text-muted-foreground">to {new Date(request.endDate).toLocaleDateString()}</p>
                                                </div>
                                            </TableCell>
                                            <TableCell>{request.totalDays}</TableCell>
                                            <TableCell>{getStatusBadge(request.status)}</TableCell>
                                            <TableCell>{getUrgencyBadge(request.urgencyLevel)}</TableCell>
                                            <TableCell>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="sm">
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem>
                                                            <Eye className="h-4 w-4 mr-2" />
                                                            View Details
                                                        </DropdownMenuItem>
                                                        {mode === 'hr' && request.status === 'pending' && (
                                                            <>
                                                                <DropdownMenuItem
                                                                    onClick={() => handleApproveRequest(request.id)}
                                                                >
                                                                    <CheckCircle className="h-4 w-4 mr-2" />
                                                                    Approve
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem
                                                                    onClick={() => handleRejectRequest(request.id, 'Rejected by HR')}
                                                                >
                                                                    <XCircle className="h-4 w-4 mr-2" />
                                                                    Reject
                                                                </DropdownMenuItem>
                                                            </>
                                                        )}
                                                        {mode === 'employee' && request.status === 'pending' && (
                                                            <DropdownMenuItem>
                                                                <Trash2 className="h-4 w-4 mr-2" />
                                                                Cancel Request
                                                            </DropdownMenuItem>
                                                        )}
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Leave Types Tab (HR Only) */}
            {activeTab === 'types' && mode === 'hr' && (
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Leave Types Configuration</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {leaveTypes.map((type) => (
                                    <Card key={type.id} className="border-l-4" style={{ borderLeftColor: type.color }}>
                                        <CardContent className="p-4">
                                            <div className="flex items-center justify-between mb-2">
                                                <h4 className="font-semibold">{type.name}</h4>
                                                <Badge variant={type.isActive ? 'default' : 'secondary'}>
                                                    {type.isActive ? 'Active' : 'Inactive'}
                                                </Badge>
                                            </div>

                                            <p className="text-sm text-muted-foreground mb-3">{type.description}</p>

                                            <div className="space-y-2 text-sm">
                                                <div className="flex justify-between">
                                                    <span>Max Days/Year:</span>
                                                    <span className="font-medium">{type.maxDaysPerYear}</span>
                                                </div>

                                                <div className="flex items-center space-x-2">
                                                    {type.requiresApproval && (
                                                        <Badge variant="outline" className="text-xs">Approval Required</Badge>
                                                    )}
                                                    {type.requiresDocumentation && (
                                                        <Badge variant="outline" className="text-xs">Docs Required</Badge>
                                                    )}
                                                </div>

                                                {type.carryOverRules.enabled && (
                                                    <div className="text-xs text-blue-600">
                                                        Carry over: {type.carryOverRules.maxCarryOverDays} days
                                                    </div>
                                                )}
                                            </div>

                                            <div className="flex justify-end mt-3">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="sm">
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem>
                                                            <Edit className="h-4 w-4 mr-2" />
                                                            Edit
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem>
                                                            <Users className="h-4 w-4 mr-2" />
                                                            View Usage
                                                        </DropdownMenuItem>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem className="text-red-600">
                                                            <Trash2 className="h-4 w-4 mr-2" />
                                                            Deactivate
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
}

export default ComprehensiveLeaveManagement;

