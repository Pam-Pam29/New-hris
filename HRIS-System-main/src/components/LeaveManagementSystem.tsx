import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Calendar } from './ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import {
    Calendar as CalendarIcon,
    Clock,
    CheckCircle,
    XCircle,
    AlertCircle,
    Plus,
    Filter,
    Download,
    Eye,
    Edit,
    Trash2,
    User,
    CalendarDays,
    TrendingUp,
    TrendingDown
} from 'lucide-react';
import { format } from 'date-fns';

interface LeaveType {
    id: string;
    name: string;
    maxDays: number;
    carryOver: boolean;
    requiresApproval: boolean;
    requiresDocumentation: boolean;
    color: string;
    isActive: boolean;
    description: string;
}

interface LeaveRequest {
    id: string;
    employeeId: string;
    employeeName: string;
    leaveTypeId: string;
    leaveTypeName: string;
    startDate: Date;
    endDate: Date;
    totalDays: number;
    reason: string;
    status: 'pending' | 'approved' | 'rejected' | 'cancelled';
    submittedAt: Date;
    reviewedAt?: Date;
    reviewedBy?: string;
    comments?: string;
    attachments?: string[];
}

interface LeaveBalance {
    employeeId: string;
    leaveTypeId: string;
    leaveTypeName: string;
    totalDays: number;
    usedDays: number;
    pendingDays: number;
    remainingDays: number;
    carryOverDays: number;
    expiryDate?: Date;
}

interface LeaveManagementSystemProps {
    isHR?: boolean;
    employeeId?: string;
}

export function LeaveManagementSystem({ isHR = false, employeeId = 'emp-001' }: LeaveManagementSystemProps) {
    const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([]);
    const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
    const [leaveBalances, setLeaveBalances] = useState<LeaveBalance[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState(isHR ? 'overview' : 'requests');

    // Form states
    const [showNewLeaveType, setShowNewLeaveType] = useState(false);
    const [showNewRequest, setShowNewRequest] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState<LeaveRequest | null>(null);

    // New leave type form
    const [newLeaveType, setNewLeaveType] = useState({
        name: '',
        maxDays: 20,
        carryOver: true,
        requiresApproval: true,
        requiresDocumentation: false,
        color: '#3B82F6',
        description: ''
    });

    // New leave request form
    const [newRequest, setNewRequest] = useState({
        leaveTypeId: '',
        startDate: new Date(),
        endDate: new Date(),
        reason: ''
    });

    // Load data
    useEffect(() => {
        loadLeaveData();
    }, [isHR, employeeId]);

    const loadLeaveData = async () => {
        try {
            // Sample data - in real implementation, this would come from Firebase
            const sampleLeaveTypes: LeaveType[] = [
                {
                    id: 'lt-001',
                    name: 'Annual Leave',
                    maxDays: 20,
                    carryOver: true,
                    requiresApproval: true,
                    requiresDocumentation: false,
                    color: '#10B981',
                    isActive: true,
                    description: 'Annual vacation leave'
                },
                {
                    id: 'lt-002',
                    name: 'Sick Leave',
                    maxDays: 10,
                    carryOver: false,
                    requiresApproval: false,
                    requiresDocumentation: true,
                    color: '#F59E0B',
                    isActive: true,
                    description: 'Medical leave for illness'
                },
                {
                    id: 'lt-003',
                    name: 'Personal Leave',
                    maxDays: 5,
                    carryOver: false,
                    requiresApproval: true,
                    requiresDocumentation: false,
                    color: '#8B5CF6',
                    isActive: true,
                    description: 'Personal time off'
                }
            ];

            const sampleRequests: LeaveRequest[] = [
                {
                    id: 'lr-001',
                    employeeId: 'emp-001',
                    employeeName: 'John Doe',
                    leaveTypeId: 'lt-001',
                    leaveTypeName: 'Annual Leave',
                    startDate: new Date('2024-02-01'),
                    endDate: new Date('2024-02-05'),
                    totalDays: 5,
                    reason: 'Family vacation',
                    status: 'pending',
                    submittedAt: new Date('2024-01-15'),
                    attachments: []
                },
                {
                    id: 'lr-002',
                    employeeId: 'emp-002',
                    employeeName: 'Jane Smith',
                    leaveTypeId: 'lt-002',
                    leaveTypeName: 'Sick Leave',
                    startDate: new Date('2024-01-20'),
                    endDate: new Date('2024-01-22'),
                    totalDays: 3,
                    reason: 'Flu symptoms',
                    status: 'approved',
                    submittedAt: new Date('2024-01-19'),
                    reviewedAt: new Date('2024-01-19'),
                    reviewedBy: 'HR Manager',
                    attachments: ['medical-cert.pdf']
                }
            ];

            const sampleBalances: LeaveBalance[] = [
                {
                    employeeId: 'emp-001',
                    leaveTypeId: 'lt-001',
                    leaveTypeName: 'Annual Leave',
                    totalDays: 20,
                    usedDays: 5,
                    pendingDays: 3,
                    remainingDays: 12,
                    carryOverDays: 0,
                    expiryDate: new Date('2024-12-31')
                },
                {
                    employeeId: 'emp-001',
                    leaveTypeId: 'lt-002',
                    leaveTypeName: 'Sick Leave',
                    totalDays: 10,
                    usedDays: 2,
                    pendingDays: 0,
                    remainingDays: 8,
                    carryOverDays: 0
                }
            ];

            setLeaveTypes(sampleLeaveTypes);
            setLeaveRequests(sampleRequests);
            setLeaveBalances(sampleBalances);
            setLoading(false);
        } catch (error) {
            console.error('Error loading leave data:', error);
            setLoading(false);
        }
    };

    const handleCreateLeaveType = () => {
        const newType: LeaveType = {
            id: `lt-${Date.now()}`,
            ...newLeaveType
        };
        setLeaveTypes(prev => [...prev, newType]);
        setShowNewLeaveType(false);
        setNewLeaveType({
            name: '',
            maxDays: 20,
            carryOver: true,
            requiresApproval: true,
            requiresDocumentation: false,
            color: '#3B82F6',
            description: ''
        });
    };

    const handleSubmitLeaveRequest = () => {
        const totalDays = Math.ceil((newRequest.endDate.getTime() - newRequest.startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
        const leaveType = leaveTypes.find(lt => lt.id === newRequest.leaveTypeId);

        if (!leaveType) return;

        const newLeaveRequest: LeaveRequest = {
            id: `lr-${Date.now()}`,
            employeeId,
            employeeName: 'John Doe', // In real implementation, get from user context
            leaveTypeId: newRequest.leaveTypeId,
            leaveTypeName: leaveType.name,
            startDate: newRequest.startDate,
            endDate: newRequest.endDate,
            totalDays,
            reason: newRequest.reason,
            status: leaveType.requiresApproval ? 'pending' : 'approved',
            submittedAt: new Date(),
            attachments: []
        };

        setLeaveRequests(prev => [...prev, newLeaveRequest]);
        setShowNewRequest(false);
        setNewRequest({
            leaveTypeId: '',
            startDate: new Date(),
            endDate: new Date(),
            reason: ''
        });
    };

    const handleApproveRequest = (requestId: string) => {
        setLeaveRequests(prev => prev.map(req =>
            req.id === requestId
                ? { ...req, status: 'approved' as const, reviewedAt: new Date(), reviewedBy: 'HR Manager' }
                : req
        ));
    };

    const handleRejectRequest = (requestId: string) => {
        setLeaveRequests(prev => prev.map(req =>
            req.id === requestId
                ? { ...req, status: 'rejected' as const, reviewedAt: new Date(), reviewedBy: 'HR Manager' }
                : req
        ));
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'approved': return 'bg-green-100 text-green-800';
            case 'rejected': return 'bg-red-100 text-red-800';
            case 'pending': return 'bg-yellow-100 text-yellow-800';
            case 'cancelled': return 'bg-gray-100 text-gray-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const filteredRequests = isHR
        ? leaveRequests
        : leaveRequests.filter(req => req.employeeId === employeeId);

    const pendingRequests = filteredRequests.filter(req => req.status === 'pending');

    if (loading) {
        return (
            <div className="space-y-6">
                <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Loading leave data...</p>
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
                        {isHR ? 'Manage employee leave requests and policies' : 'Request and track your leave'}
                    </p>
                </div>
                <div className="flex space-x-2">
                    {isHR && (
                        <>
                            <Button variant="outline" onClick={() => setShowNewLeaveType(true)}>
                                <Plus className="h-4 w-4 mr-2" />
                                New Leave Type
                            </Button>
                            <Button variant="outline">
                                <Download className="h-4 w-4 mr-2" />
                                Export
                            </Button>
                        </>
                    )}
                    {!isHR && (
                        <Button onClick={() => setShowNewRequest(true)}>
                            <Plus className="h-4 w-4 mr-2" />
                            Request Leave
                        </Button>
                    )}
                </div>
            </div>

            {/* Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center space-x-4">
                            <div className="p-2 bg-blue-100 rounded-lg">
                                <CalendarIcon className="h-6 w-6 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">{filteredRequests.length}</p>
                                <p className="text-sm text-muted-foreground">Total Requests</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center space-x-4">
                            <div className="p-2 bg-yellow-100 rounded-lg">
                                <Clock className="h-6 w-6 text-yellow-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">{pendingRequests.length}</p>
                                <p className="text-sm text-muted-foreground">Pending</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center space-x-4">
                            <div className="p-2 bg-green-100 rounded-lg">
                                <CheckCircle className="h-6 w-6 text-green-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">
                                    {filteredRequests.filter(req => req.status === 'approved').length}
                                </p>
                                <p className="text-sm text-muted-foreground">Approved</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center space-x-4">
                            <div className="p-2 bg-purple-100 rounded-lg">
                                <TrendingUp className="h-6 w-6 text-purple-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">
                                    {leaveBalances.reduce((sum, bal) => sum + bal.remainingDays, 0)}
                                </p>
                                <p className="text-sm text-muted-foreground">Days Remaining</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="requests">Requests</TabsTrigger>
                    <TabsTrigger value="balance">Balance</TabsTrigger>
                    {isHR && <TabsTrigger value="types">Leave Types</TabsTrigger>}
                </TabsList>

                {/* Overview Tab */}
                <TabsContent value="overview" className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Leave Balance Overview */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Leave Balance</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {leaveBalances.map((balance) => (
                                    <div key={balance.leaveTypeId} className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <span className="font-medium">{balance.leaveTypeName}</span>
                                            <span className="text-sm text-muted-foreground">
                                                {balance.remainingDays}/{balance.totalDays} days
                                            </span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-2">
                                            <div
                                                className="bg-blue-600 h-2 rounded-full"
                                                style={{ width: `${(balance.remainingDays / balance.totalDays) * 100}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>

                        {/* Recent Requests */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Recent Requests</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {filteredRequests.slice(0, 5).map((request) => (
                                        <div key={request.id} className="flex items-center justify-between p-3 border rounded-lg">
                                            <div>
                                                <p className="font-medium">{request.leaveTypeName}</p>
                                                <p className="text-sm text-muted-foreground">
                                                    {format(request.startDate, 'MMM dd')} - {format(request.endDate, 'MMM dd')}
                                                </p>
                                            </div>
                                            <Badge className={getStatusColor(request.status)}>
                                                {request.status}
                                            </Badge>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                {/* Requests Tab */}
                <TabsContent value="requests" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Leave Requests</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {filteredRequests.map((request) => (
                                    <div key={request.id} className="border rounded-lg p-4 space-y-3">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center space-x-3">
                                                <div className="p-2 bg-blue-100 rounded-lg">
                                                    <CalendarIcon className="h-5 w-5 text-blue-600" />
                                                </div>
                                                <div>
                                                    <h4 className="font-medium">{request.leaveTypeName}</h4>
                                                    <p className="text-sm text-muted-foreground">
                                                        {format(request.startDate, 'MMM dd, yyyy')} - {format(request.endDate, 'MMM dd, yyyy')}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <Badge className={getStatusColor(request.status)}>
                                                    {request.status}
                                                </Badge>
                                                {isHR && request.status === 'pending' && (
                                                    <div className="flex space-x-1">
                                                        <Button size="sm" variant="outline" onClick={() => handleApproveRequest(request.id)}>
                                                            <CheckCircle className="h-4 w-4" />
                                                        </Button>
                                                        <Button size="sm" variant="outline" onClick={() => handleRejectRequest(request.id)}>
                                                            <XCircle className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                                            <div>
                                                <Label>Total Days</Label>
                                                <p>{request.totalDays} days</p>
                                            </div>
                                            <div>
                                                <Label>Submitted</Label>
                                                <p>{format(request.submittedAt, 'MMM dd, yyyy')}</p>
                                            </div>
                                            <div>
                                                <Label>Reason</Label>
                                                <p>{request.reason}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Balance Tab */}
                <TabsContent value="balance" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Leave Balance Details</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-6">
                                {leaveBalances.map((balance) => (
                                    <div key={balance.leaveTypeId} className="border rounded-lg p-4 space-y-4">
                                        <div className="flex items-center justify-between">
                                            <h4 className="font-medium">{balance.leaveTypeName}</h4>
                                            <Badge variant="outline">{balance.remainingDays} days left</Badge>
                                        </div>
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                            <div>
                                                <Label>Total Days</Label>
                                                <p className="font-medium">{balance.totalDays}</p>
                                            </div>
                                            <div>
                                                <Label>Used Days</Label>
                                                <p className="font-medium text-red-600">{balance.usedDays}</p>
                                            </div>
                                            <div>
                                                <Label>Pending Days</Label>
                                                <p className="font-medium text-yellow-600">{balance.pendingDays}</p>
                                            </div>
                                            <div>
                                                <Label>Remaining Days</Label>
                                                <p className="font-medium text-green-600">{balance.remainingDays}</p>
                                            </div>
                                        </div>
                                        {balance.expiryDate && (
                                            <div className="text-sm text-muted-foreground">
                                                Expires: {format(balance.expiryDate, 'MMM dd, yyyy')}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Leave Types Tab (HR Only) */}
                {isHR && (
                    <TabsContent value="types" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Leave Types</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {leaveTypes.map((type) => (
                                        <div key={type.id} className="border rounded-lg p-4 space-y-3">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center space-x-3">
                                                    <div
                                                        className="w-4 h-4 rounded-full"
                                                        style={{ backgroundColor: type.color }}
                                                    ></div>
                                                    <h4 className="font-medium">{type.name}</h4>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <Badge variant={type.isActive ? "default" : "secondary"}>
                                                        {type.isActive ? "Active" : "Inactive"}
                                                    </Badge>
                                                    <Button size="sm" variant="outline">
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                                                <div>
                                                    <Label>Max Days</Label>
                                                    <p>{type.maxDays} days</p>
                                                </div>
                                                <div>
                                                    <Label>Carry Over</Label>
                                                    <p>{type.carryOver ? "Yes" : "No"}</p>
                                                </div>
                                                <div>
                                                    <Label>Requires Approval</Label>
                                                    <p>{type.requiresApproval ? "Yes" : "No"}</p>
                                                </div>
                                            </div>
                                            {type.description && (
                                                <p className="text-sm text-muted-foreground">{type.description}</p>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                )}
            </Tabs>

            {/* New Leave Type Modal */}
            {showNewLeaveType && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <Card className="w-full max-w-md">
                        <CardHeader>
                            <CardTitle>Create New Leave Type</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label>Name</Label>
                                <Input
                                    value={newLeaveType.name}
                                    onChange={(e) => setNewLeaveType(prev => ({ ...prev, name: e.target.value }))}
                                    placeholder="e.g., Annual Leave"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Max Days</Label>
                                <Input
                                    type="number"
                                    value={newLeaveType.maxDays}
                                    onChange={(e) => setNewLeaveType(prev => ({ ...prev, maxDays: parseInt(e.target.value) }))}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Description</Label>
                                <Textarea
                                    value={newLeaveType.description}
                                    onChange={(e) => setNewLeaveType(prev => ({ ...prev, description: e.target.value }))}
                                    placeholder="Leave type description"
                                />
                            </div>
                            <div className="flex items-center space-x-4">
                                <label className="flex items-center space-x-2">
                                    <input
                                        type="checkbox"
                                        checked={newLeaveType.carryOver}
                                        onChange={(e) => setNewLeaveType(prev => ({ ...prev, carryOver: e.target.checked }))}
                                    />
                                    <span className="text-sm">Allow Carry Over</span>
                                </label>
                                <label className="flex items-center space-x-2">
                                    <input
                                        type="checkbox"
                                        checked={newLeaveType.requiresApproval}
                                        onChange={(e) => setNewLeaveType(prev => ({ ...prev, requiresApproval: e.target.checked }))}
                                    />
                                    <span className="text-sm">Requires Approval</span>
                                </label>
                            </div>
                            <div className="flex space-x-2">
                                <Button onClick={handleCreateLeaveType} className="flex-1">Create</Button>
                                <Button variant="outline" onClick={() => setShowNewLeaveType(false)}>Cancel</Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* New Leave Request Modal */}
            {showNewRequest && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <Card className="w-full max-w-md">
                        <CardHeader>
                            <CardTitle>Request Leave</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label>Leave Type</Label>
                                <Select value={newRequest.leaveTypeId} onValueChange={(value) => setNewRequest(prev => ({ ...prev, leaveTypeId: value }))}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select leave type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {leaveTypes.filter(lt => lt.isActive).map((type) => (
                                            <SelectItem key={type.id} value={type.id}>
                                                {type.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Start Date</Label>
                                    <Input
                                        type="date"
                                        value={newRequest.startDate.toISOString().split('T')[0]}
                                        onChange={(e) => setNewRequest(prev => ({ ...prev, startDate: new Date(e.target.value) }))}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>End Date</Label>
                                    <Input
                                        type="date"
                                        value={newRequest.endDate.toISOString().split('T')[0]}
                                        onChange={(e) => setNewRequest(prev => ({ ...prev, endDate: new Date(e.target.value) }))}
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label>Reason</Label>
                                <Textarea
                                    value={newRequest.reason}
                                    onChange={(e) => setNewRequest(prev => ({ ...prev, reason: e.target.value }))}
                                    placeholder="Reason for leave"
                                />
                            </div>
                            <div className="flex space-x-2">
                                <Button onClick={handleSubmitLeaveRequest} className="flex-1">Submit Request</Button>
                                <Button variant="outline" onClick={() => setShowNewRequest(false)}>Cancel</Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
}

export default LeaveManagementSystem;