import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Textarea } from '../../../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../components/ui/tabs';
import { Calendar } from '../../../components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '../../../components/ui/popover';
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

export default function LeaveManagement() {
    const [employeeId] = useState('EMP123456ABC'); // This would come from auth context
    const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([]);
    const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
    const [leaveBalances, setLeaveBalances] = useState<LeaveBalance[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    // Form state
    const [showRequestForm, setShowRequestForm] = useState(false);
    const [selectedLeaveType, setSelectedLeaveType] = useState('');
    const [startDate, setStartDate] = useState<Date>();
    const [endDate, setEndDate] = useState<Date>();
    const [reason, setReason] = useState('');

    // Load data on component mount
    useEffect(() => {
        loadData();
    }, [employeeId]);

    const loadData = async () => {
        setLoading(true);
        try {
            const [types, requests, balances] = await Promise.all([
                leaveService.getLeaveTypes(),
                leaveService.getEmployeeLeaveRequests(employeeId),
                leaveService.getEmployeeLeaveBalances(employeeId)
            ]);

            setLeaveTypes(types);
            setLeaveRequests(requests);
            setLeaveBalances(balances);
        } catch (err) {
            setError('Failed to load leave data');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmitRequest = async () => {
        if (!selectedLeaveType || !startDate || !endDate || !reason) {
            setError('Please fill in all required fields');
            return;
        }

        if (endDate < startDate) {
            setError('End date must be after start date');
            return;
        }

        setSubmitting(true);
        setError('');

        try {
            const selectedType = leaveTypes.find(lt => lt.id === selectedLeaveType);
            if (!selectedType) {
                setError('Invalid leave type selected');
                return;
            }

            const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;

            const success = await leaveService.submitLeaveRequest({
                employeeId,
                leaveTypeId: selectedLeaveType,
                leaveTypeName: selectedType.name,
                startDate,
                endDate,
                totalDays,
                reason
            });

            if (success) {
                setShowRequestForm(false);
                setSelectedLeaveType('');
                setStartDate(undefined);
                setEndDate(undefined);
                setReason('');
                await loadData(); // Reload data
            } else {
                setError('Failed to submit leave request');
            }
        } catch (err) {
            setError('Failed to submit leave request');
            console.error(err);
        } finally {
            setSubmitting(false);
        }
    };

    const handleCancelRequest = async (requestId: string) => {
        try {
            const success = await leaveService.cancelLeaveRequest(requestId);
            if (success) {
                await loadData(); // Reload data
            }
        } catch (err) {
            console.error('Failed to cancel request:', err);
        }
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

    const getLeaveBalance = (leaveTypeId: string) => {
        return leaveBalances.find(balance => balance.leaveTypeId === leaveTypeId);
    };

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
                            Request time off and track your leave balances
                        </p>
                    </div>
                    <Button onClick={() => setShowRequestForm(true)} className="flex items-center space-x-2">
                        <Plus className="h-4 w-4" />
                        <span>Request Leave</span>
                    </Button>
                </div>

                {error && (
                    <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}

                <Tabs defaultValue="balances" className="w-full">
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="balances">Leave Balances</TabsTrigger>
                        <TabsTrigger value="requests">My Requests</TabsTrigger>
                        <TabsTrigger value="calendar">Calendar</TabsTrigger>
                    </TabsList>

                    {/* Leave Balances */}
                    <TabsContent value="balances" className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {leaveTypes.map(leaveType => {
                                const balance = getLeaveBalance(leaveType.id);
                                return (
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
                                            {balance ? (
                                                <div className="space-y-2">
                                                    <div className="flex justify-between">
                                                        <span className="text-sm text-muted-foreground">Total Days:</span>
                                                        <span className="font-medium">{balance.totalDays}</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="text-sm text-muted-foreground">Used:</span>
                                                        <span className="font-medium text-red-600">{balance.usedDays}</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="text-sm text-muted-foreground">Remaining:</span>
                                                        <span className="font-medium text-green-600">{balance.remainingDays}</span>
                                                    </div>
                                                    <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
                                                        <div
                                                            className="bg-blue-600 h-2 rounded-full"
                                                            style={{
                                                                width: `${(balance.usedDays / balance.totalDays) * 100}%`
                                                            }}
                                                        />
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="text-center py-4">
                                                    <p className="text-sm text-muted-foreground">No balance data available</p>
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>
                                );
                            })}
                        </div>
                    </TabsContent>

                    {/* Leave Requests */}
                    <TabsContent value="requests" className="space-y-4">
                        <div className="space-y-4">
                            {leaveRequests.map(request => (
                                <Card key={request.id}>
                                    <CardContent className="pt-6">
                                        <div className="flex items-center justify-between">
                                            <div className="space-y-1">
                                                <div className="flex items-center space-x-2">
                                                    <h3 className="font-semibold">{request.leaveTypeName}</h3>
                                                    {getStatusBadge(request.status)}
                                                </div>
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
                                                {request.status === 'pending' && (
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => handleCancelRequest(request.id)}
                                                    >
                                                        Cancel
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}

                            {leaveRequests.length === 0 && (
                                <Card>
                                    <CardContent className="pt-6">
                                        <div className="text-center py-8">
                                            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                            <h3 className="text-lg font-semibold mb-2">No Leave Requests</h3>
                                            <p className="text-muted-foreground mb-4">
                                                You haven't submitted any leave requests yet.
                                            </p>
                                            <Button onClick={() => setShowRequestForm(true)}>
                                                Request Leave
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            )}
                        </div>
                    </TabsContent>

                    {/* Calendar */}
                    <TabsContent value="calendar" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>Leave Calendar</CardTitle>
                                <CardDescription>
                                    View your approved leave dates
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="text-center py-8">
                                    <CalendarIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                    <p className="text-muted-foreground">Calendar view coming soon</p>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>

                {/* Leave Request Form */}
                {showRequestForm && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <Card className="w-full max-w-md mx-4">
                            <CardHeader>
                                <CardTitle>Request Leave</CardTitle>
                                <CardDescription>
                                    Submit a new leave request
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <Label htmlFor="leaveType">Leave Type</Label>
                                    <Select value={selectedLeaveType} onValueChange={setSelectedLeaveType}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select leave type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {leaveTypes.map(type => (
                                                <SelectItem key={type.id} value={type.id}>
                                                    {type.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="startDate">Start Date</Label>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <Button variant="outline" className="w-full justify-start text-left">
                                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                                    {startDate ? format(startDate, 'PPP') : 'Select date'}
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0">
                                                <Calendar
                                                    mode="single"
                                                    selected={startDate}
                                                    onSelect={setStartDate}
                                                    initialFocus
                                                />
                                            </PopoverContent>
                                        </Popover>
                                    </div>

                                    <div>
                                        <Label htmlFor="endDate">End Date</Label>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <Button variant="outline" className="w-full justify-start text-left">
                                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                                    {endDate ? format(endDate, 'PPP') : 'Select date'}
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0">
                                                <Calendar
                                                    mode="single"
                                                    selected={endDate}
                                                    onSelect={setEndDate}
                                                    initialFocus
                                                />
                                            </PopoverContent>
                                        </Popover>
                                    </div>
                                </div>

                                <div>
                                    <Label htmlFor="reason">Reason</Label>
                                    <Textarea
                                        id="reason"
                                        placeholder="Enter reason for leave..."
                                        value={reason}
                                        onChange={(e) => setReason(e.target.value)}
                                    />
                                </div>

                                <div className="flex space-x-2">
                                    <Button
                                        onClick={handleSubmitRequest}
                                        disabled={submitting}
                                        className="flex-1"
                                    >
                                        {submitting ? (
                                            <>
                                                <Loader className="mr-2 h-4 w-4 animate-spin" />
                                                Submitting...
                                            </>
                                        ) : (
                                            'Submit Request'
                                        )}
                                    </Button>
                                    <Button
                                        variant="outline"
                                        onClick={() => setShowRequestForm(false)}
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