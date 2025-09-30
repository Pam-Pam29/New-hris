import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Textarea } from '../../../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../components/ui/tabs';
import { Progress } from '../../../components/ui/progress';
import {
    Calendar,
    Clock,
    CheckCircle,
    XCircle,
    Plus,
    User,
    Video,
    MapPin,
    Loader,
    Target,
    TrendingUp,
    Edit,
    Trash2
} from 'lucide-react';
import { usePerformanceMeetings, usePerformanceGoals, usePerformanceReviews } from '../../../hooks/useRealTimeSync';
import { PerformanceMeeting, PerformanceGoal, PerformanceReview, normalizeMeetingStatus, getMeetingStatusInfo, formatMeetingDate } from '../../../types/performanceManagement';
import { performanceSyncService } from '../../../services/performanceSyncService';
import { googleMeetService } from '../../../services/googleMeetService';
import { meetingNotificationService } from '../../../services/meetingNotificationService';
import { hrAvailabilityService } from '../../../services/hrAvailabilityService';

export default function PerformanceManagement() {
    const [employeeId] = useState(() => {
        const savedEmployeeId = localStorage.getItem('currentEmployeeId');
        return savedEmployeeId || 'EMP123456ABC';
    });
    const [employeeName, setEmployeeName] = useState<string>('');
    const [availableTimeSlots, setAvailableTimeSlots] = useState<{ startTime: string; endTime: string; }[]>([]);
    const [loadingSlots, setLoadingSlots] = useState(false);

    // Helper function to display unit correctly
    const formatUnit = (unit: string) => {
        if (unit === 'percentage') return '%';
        if (unit === 'number') return '';
        if (unit === 'hours') return 'hrs';
        return unit;
    };
    const [showScheduleForm, setShowScheduleForm] = useState(false);
    const [showGoalForm, setShowGoalForm] = useState(false);
    const [showGoalView, setShowGoalView] = useState(false);
    const [viewingGoal, setViewingGoal] = useState<PerformanceGoal | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [editingGoal, setEditingGoal] = useState<PerformanceGoal | null>(null);
    
    // Form state for meetings
    const [meetingForm, setMeetingForm] = useState({
        title: '',
        description: '',
        meetingType: 'one-on-one' as const,
        scheduledDate: '',
        scheduledTime: '',
        duration: 60,
        location: '',
        meetingLink: ''
    });

    // Form state for goals
    const [goalForm, setGoalForm] = useState({
        title: '',
        description: '',
        category: 'performance' as const,
        targetValue: 100,
        currentValue: 0,
        unit: 'percentage' as const,
        startDate: '',
        endDate: '',
        priority: 'medium' as const
    });

    // Real-time sync
    const { data: allMeetings, loading: meetingsLoading } = usePerformanceMeetings();
    const { data: allGoals, loading: goalsLoading } = usePerformanceGoals(employeeId);
    const { data: allReviews, loading: reviewsLoading } = usePerformanceReviews(employeeId);
    const loading = meetingsLoading || goalsLoading || reviewsLoading;
    
    // Filter data for this employee
    const meetings = ((allMeetings as PerformanceMeeting[]) || []).filter(
        meeting => meeting.employeeId === employeeId
    );
    const goals = (allGoals as PerformanceGoal[]) || [];
    const reviews = (allReviews as PerformanceReview[]) || [];

    // Load employee name
    useEffect(() => {
        const loadEmployeeName = async () => {
            try {
                const { getComprehensiveDataFlowService } = await import('../../../services/comprehensiveDataFlowService');
                const dataFlowService = await getComprehensiveDataFlowService();
                const allEmployees = await dataFlowService.getAllEmployees();
                const profile = allEmployees.find(emp => emp.id === employeeId || emp.employeeId === employeeId);
                if (profile) {
                    const fullName = `${profile.personalInfo.firstName} ${profile.personalInfo.lastName}`;
                    setEmployeeName(fullName);
                }
            } catch (error) {
                console.error('Failed to load employee name:', error);
            }
        };
        loadEmployeeName();
    }, [employeeId]);

    // Load available time slots when date changes
    useEffect(() => {
        const loadAvailableSlots = async () => {
            if (!meetingForm.scheduledDate) {
                setAvailableTimeSlots([]);
                return;
            }

            setLoadingSlots(true);
            try {
                const selectedDate = new Date(meetingForm.scheduledDate);
                const slots = await hrAvailabilityService.getAvailableTimeSlotsForDate(selectedDate);
                setAvailableTimeSlots(slots);
                console.log('📅 Available time slots loaded:', slots);
            } catch (error) {
                console.error('Failed to load available slots:', error);
                setAvailableTimeSlots([]);
            } finally {
                setLoadingSlots(false);
            }
        };

        loadAvailableSlots();
    }, [meetingForm.scheduledDate]);

    // Start meeting notification checker
    useEffect(() => {
        // Request notification permission on mount
        meetingNotificationService.requestNotificationPermission();

        // Start checking for upcoming meetings
        meetingNotificationService.startMeetingChecker(employeeId, (meeting) => {
            console.log('⏰ Meeting starting soon:', meeting);
            // The notification is already sent by the service
        });

        // Cleanup on unmount
        return () => {
            meetingNotificationService.stopMeetingChecker();
        };
    }, [employeeId]);

    const handleScheduleMeeting = async () => {
        if (!meetingForm.title || !meetingForm.scheduledDate || !meetingForm.scheduledTime) {
            alert('Please fill in all required fields');
            return;
        }

        if (!meetingForm.meetingLink) {
            alert('Please provide a meeting link (Google Meet, Zoom, Teams, etc.)');
            return;
        }

        setSubmitting(true);
        try {
            const scheduledDateTime = new Date(`${meetingForm.scheduledDate}T${meetingForm.scheduledTime}`);
            
            await performanceSyncService.scheduleMeeting({
                employeeId,
                employeeName: employeeName || 'Unknown Employee',
                title: meetingForm.title,
                description: meetingForm.description,
                meetingType: meetingForm.meetingType,
                scheduledDate: scheduledDateTime,
                duration: meetingForm.duration,
                location: meetingForm.location,
                meetingLink: meetingForm.meetingLink,
                createdBy: 'employee'
            });

            setShowScheduleForm(false);
            setMeetingForm({
                title: '',
                description: '',
                meetingType: 'one-on-one',
                scheduledDate: '',
                scheduledTime: '',
                duration: 60,
                location: '',
                meetingLink: ''
            });
        } catch (error) {
            console.error('Failed to schedule meeting:', error);
            alert('Failed to schedule meeting');
        } finally {
            setSubmitting(false);
        }
    };

    const handleCreateGoal = async () => {
        if (!goalForm.title || !goalForm.startDate || !goalForm.endDate) {
            alert('Please fill in all required fields');
            return;
        }

        setSubmitting(true);
        try {
            const goalData = {
                employeeId,
                employeeName: employeeName || 'Unknown Employee',
                title: goalForm.title,
                description: goalForm.description,
                category: goalForm.category,
                targetValue: goalForm.targetValue,
                currentValue: goalForm.currentValue,
                unit: goalForm.unit,
                startDate: new Date(goalForm.startDate),
                endDate: new Date(goalForm.endDate),
                status: 'in_progress' as const,
                progress: (goalForm.currentValue / goalForm.targetValue) * 100,
                priority: goalForm.priority
            };

            if (editingGoal) {
                await performanceSyncService.updateGoal(editingGoal.id, goalData);
            } else {
                await performanceSyncService.createGoal(goalData);
            }

            setShowGoalForm(false);
            setEditingGoal(null);
            setGoalForm({
                title: '',
                description: '',
                category: 'performance',
                targetValue: 100,
                currentValue: 0,
                unit: 'percentage',
                startDate: '',
                endDate: '',
                priority: 'medium'
            });
        } catch (error) {
            console.error('Failed to save goal:', error);
            alert('Failed to save goal');
        } finally {
            setSubmitting(false);
        }
    };

    const handleViewGoal = (goal: PerformanceGoal) => {
        setViewingGoal(goal);
        setShowGoalView(true);
    };

    const handleEditGoal = (goal: PerformanceGoal) => {
        setEditingGoal(goal);
        
        // Convert dates to string format for input fields
        let startDateStr = '';
        let endDateStr = '';
        
        if (goal.startDate) {
            const startDate = goal.startDate instanceof Date 
                ? goal.startDate 
                : (goal.startDate as any).toDate 
                    ? (goal.startDate as any).toDate() 
                    : new Date(goal.startDate);
            startDateStr = startDate.toISOString().split('T')[0];
        }
        
        if (goal.endDate) {
            const endDate = goal.endDate instanceof Date 
                ? goal.endDate 
                : (goal.endDate as any).toDate 
                    ? (goal.endDate as any).toDate() 
                    : new Date(goal.endDate);
            endDateStr = endDate.toISOString().split('T')[0];
        }
        
        setGoalForm({
            title: goal.title,
            description: goal.description,
            category: goal.category,
            targetValue: goal.targetValue,
            currentValue: goal.currentValue,
            unit: goal.unit,
            startDate: startDateStr,
            endDate: endDateStr,
            priority: goal.priority
        });
        setShowGoalForm(true);
        
        console.log('📝 Editing goal with dates:', { startDate: startDateStr, endDate: endDateStr });
    };

    const handleDeleteGoal = async (goalId: string) => {
        if (!confirm('Are you sure you want to delete this goal?')) return;
        
        try {
            await performanceSyncService.deleteGoal(goalId);
        } catch (error) {
            console.error('Failed to delete goal:', error);
        }
    };

    const handleCancelMeeting = async (meetingId: string) => {
        try {
            await performanceSyncService.cancelMeeting(meetingId);
        } catch (error) {
            console.error('Failed to cancel meeting:', error);
        }
    };

    const getStatusBadge = (status: string) => {
        const statusInfo = getMeetingStatusInfo(status);
        return (
            <Badge variant={statusInfo.variant} className={`${statusInfo.bgColor} ${statusInfo.color}`}>
                {statusInfo.text}
            </Badge>
        );
    };

    const getGoalStatusBadge = (status: string) => {
        const statusColors = {
            not_started: 'bg-gray-100 text-gray-600',
            in_progress: 'bg-blue-100 text-blue-600',
            completed: 'bg-green-100 text-green-600',
            cancelled: 'bg-red-100 text-red-600'
        };
        return (
            <Badge className={statusColors[status as keyof typeof statusColors] || statusColors.in_progress}>
                {status.replace('_', ' ').toUpperCase()}
            </Badge>
        );
    };

    if (loading) {
        return (
            <div className="p-6">
                <div className="max-w-7xl mx-auto">
                    <div className="flex items-center justify-center h-64">
                        <Loader className="h-8 w-8 animate-spin text-blue-600" />
                        <span className="ml-2">Loading performance data...</span>
                    </div>
                </div>
            </div>
        );
    }

    const pendingMeetings = meetings.filter(m => normalizeMeetingStatus(m.status) === 'pending');
    const approvedMeetings = meetings.filter(m => normalizeMeetingStatus(m.status) === 'approved');
    const activeGoals = goals.filter(g => g.status === 'in_progress');
    const completedGoals = goals.filter(g => g.status === 'completed');

    return (
        <div className="p-6">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-foreground">Performance Management</h1>
                        <p className="text-muted-foreground mt-2">Track your goals and schedule performance meetings</p>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center">
                                <Target className="h-4 w-4 text-blue-600" />
                                <div className="ml-2">
                                    <p className="text-sm font-medium text-muted-foreground">Active Goals</p>
                                    <p className="text-2xl font-bold">{activeGoals.length}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center">
                                <CheckCircle className="h-4 w-4 text-green-600" />
                                <div className="ml-2">
                                    <p className="text-sm font-medium text-muted-foreground">Completed</p>
                                    <p className="text-2xl font-bold">{completedGoals.length}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center">
                                <Calendar className="h-4 w-4 text-purple-600" />
                                <div className="ml-2">
                                    <p className="text-sm font-medium text-muted-foreground">Meetings</p>
                                    <p className="text-2xl font-bold">{approvedMeetings.length}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center">
                                <Clock className="h-4 w-4 text-yellow-600" />
                                <div className="ml-2">
                                    <p className="text-sm font-medium text-muted-foreground">Pending</p>
                                    <p className="text-2xl font-bold">{pendingMeetings.length}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <Tabs defaultValue="goals" className="space-y-6">
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="goals">Goals ({goals.length})</TabsTrigger>
                        <TabsTrigger value="meetings">Meetings ({meetings.length})</TabsTrigger>
                        <TabsTrigger value="reviews">Reviews ({reviews.length})</TabsTrigger>
                    </TabsList>

                    {/* Goals Tab */}
                    <TabsContent value="goals" className="space-y-4">
                        <div className="flex justify-end">
                            <Button
                                onClick={() => {
                                    setEditingGoal(null);
                                    setShowGoalForm(true);
                                }}
                                className="bg-blue-600 hover:bg-blue-700"
                            >
                                <Plus className="h-4 w-4 mr-2" />
                                Create Goal
                            </Button>
                        </div>

                        {goals.length === 0 ? (
                            <Card>
                                <CardContent className="pt-12 pb-12">
                                    <div className="text-center">
                                        <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                        <h3 className="text-lg font-semibold mb-2">No Goals Yet</h3>
                                        <p className="text-muted-foreground mb-4">Create your first performance goal</p>
                                        <Button onClick={() => setShowGoalForm(true)}>
                                            <Plus className="h-4 w-4 mr-2" />
                                            Create Goal
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {goals.map(goal => (
                                    <Card key={goal.id}>
                                        <CardHeader>
                                            <div className="flex items-center justify-between">
                                                <CardTitle className="text-lg">{goal.title}</CardTitle>
                                                {getGoalStatusBadge(goal.status)}
                                            </div>
                                            <CardDescription>{goal.description}</CardDescription>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            <div>
                                                <div className="flex justify-between text-sm mb-2">
                                                    <span>Progress</span>
                                                    <span className="font-medium">{goal.progress}%</span>
                                                </div>
                                                <Progress value={goal.progress} className="h-2" />
                                            </div>
                                            <div className="grid grid-cols-2 gap-2 text-sm">
                                                <div>
                                                    <p className="text-muted-foreground">Current</p>
                                                    <p className="font-medium">{goal.currentValue}{formatUnit(goal.unit)}</p>
                                                </div>
                                                <div>
                                                    <p className="text-muted-foreground">Target</p>
                                                    <p className="font-medium">{goal.targetValue}{formatUnit(goal.unit)}</p>
                                                </div>
                                            </div>
                                            <div className="flex space-x-2">
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => handleViewGoal(goal)}
                                                    className="flex-1"
                                                >
                                                    <Calendar className="h-4 w-4 mr-1" />
                                                    View
                                                </Button>
                                                {goal.status !== 'completed' && goal.status !== 'cancelled' && (
                                                    <>
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            onClick={() => handleEditGoal(goal)}
                                                            className="flex-1"
                                                        >
                                                            <Edit className="h-4 w-4 mr-1" />
                                                            Edit
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            variant="destructive"
                                                            onClick={() => handleDeleteGoal(goal.id)}
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </>
                                                )}
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </TabsContent>

                    {/* Meetings Tab */}
                    <TabsContent value="meetings" className="space-y-4">
                        <div className="flex justify-end">
                            <Button
                                onClick={() => setShowScheduleForm(true)}
                                className="bg-blue-600 hover:bg-blue-700"
                            >
                                <Plus className="h-4 w-4 mr-2" />
                                Schedule Meeting
                            </Button>
                        </div>

                        <Tabs defaultValue="upcoming" className="space-y-4">
                            <TabsList className="grid w-full grid-cols-3">
                                <TabsTrigger value="upcoming">Upcoming ({approvedMeetings.length})</TabsTrigger>
                                <TabsTrigger value="pending">Pending ({pendingMeetings.length})</TabsTrigger>
                                <TabsTrigger value="all">All ({meetings.length})</TabsTrigger>
                            </TabsList>

                            <TabsContent value="upcoming" className="space-y-4">
                                {approvedMeetings.length === 0 ? (
                                    <Card>
                                        <CardContent className="pt-12 pb-12">
                                            <div className="text-center">
                                                <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                                <h3 className="text-lg font-semibold mb-2">No Upcoming Meetings</h3>
                                                <p className="text-muted-foreground">Schedule a meeting with your manager</p>
                                            </div>
                                        </CardContent>
                                    </Card>
                                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {approvedMeetings.map(meeting => (
                                            <Card key={meeting.id}>
                                                <CardHeader>
                                                    <div className="flex items-center justify-between">
                                                        <CardTitle className="text-lg">{meeting.title}</CardTitle>
                                                        {getStatusBadge(meeting.status)}
                                                    </div>
                                                    <CardDescription>{meeting.description}</CardDescription>
                                                </CardHeader>
                                                <CardContent className="space-y-2">
                                                    <div className="flex items-center text-sm text-muted-foreground">
                                                        <Calendar className="h-4 w-4 mr-2" />
                                                        {formatMeetingDate(meeting.scheduledDate)}
                                                    </div>
                                                    <div className="flex items-center text-sm text-muted-foreground">
                                                        <Clock className="h-4 w-4 mr-2" />
                                                        {meeting.duration} minutes
                                                    </div>
                                                    {meeting.location && (
                                                        <div className="flex items-center text-sm text-muted-foreground">
                                                            <MapPin className="h-4 w-4 mr-2" />
                                                            {meeting.location}
                                                        </div>
                                                    )}
                                                    {meeting.meetingLink && (() => {
                                                        const meetingDate = meeting.scheduledDate instanceof Date 
                                                            ? meeting.scheduledDate 
                                                            : (meeting.scheduledDate as any).toDate 
                                                                ? (meeting.scheduledDate as any).toDate() 
                                                                : new Date(meeting.scheduledDate);
                                                        const now = new Date();
                                                        const fifteenMinutesBefore = new Date(meetingDate.getTime() - 15 * 60000);
                                                        const canJoin = now >= fifteenMinutesBefore;

                                                        if (canJoin) {
                                                            return (
                                                                <a href={meeting.meetingLink} target="_blank" rel="noopener noreferrer" className="block">
                                                                    <Button size="sm" variant="outline" className="w-full mt-2">
                                                                        <Video className="h-4 w-4 mr-2" />
                                                                        Join Meeting
                                                                    </Button>
                                                                </a>
                                                            );
                                                        } else {
                                                            const timeUntil = Math.ceil((fifteenMinutesBefore.getTime() - now.getTime()) / 60000);
                                                            return (
                                                                <div className="mt-2 p-3 bg-gray-100 rounded-lg text-center">
                                                                    <p className="text-xs text-gray-600">
                                                                        🔒 Meeting link available {timeUntil} minutes before meeting
                                                                    </p>
                                                                </div>
                                                            );
                                                        }
                                                    })()}
                                                </CardContent>
                                            </Card>
                                        ))}
                                    </div>
                                )}
                            </TabsContent>

                            <TabsContent value="pending" className="space-y-4">
                                {pendingMeetings.length === 0 ? (
                                    <Card>
                                        <CardContent className="pt-12 pb-12">
                                            <div className="text-center">
                                                <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
                                                <h3 className="text-lg font-semibold mb-2">No Pending Meetings</h3>
                                                <p className="text-muted-foreground">All requests have been reviewed</p>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {pendingMeetings.map(meeting => (
                                            <Card key={meeting.id}>
                                                <CardHeader>
                                                    <div className="flex items-center justify-between">
                                                        <CardTitle className="text-lg">{meeting.title}</CardTitle>
                                                        {getStatusBadge(meeting.status)}
                                                    </div>
                                                    <CardDescription>{meeting.description}</CardDescription>
                                                </CardHeader>
                                                <CardContent className="space-y-2">
                                                    <div className="flex items-center text-sm text-muted-foreground">
                                                        <Calendar className="h-4 w-4 mr-2" />
                                                        {formatMeetingDate(meeting.scheduledDate)}
                                                    </div>
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => handleCancelMeeting(meeting.id)}
                                                        className="w-full"
                                                    >
                                                        <XCircle className="h-4 w-4 mr-2" />
                                                        Cancel Request
                                                    </Button>
                                                </CardContent>
                                            </Card>
                                        ))}
                                    </div>
                                )}
                            </TabsContent>

                            <TabsContent value="all" className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {meetings.map(meeting => {
                                        const status = normalizeMeetingStatus(meeting.status);
                                        const isRejected = status === 'rejected';
                                        
                                        return (
                                            <Card key={meeting.id} className={isRejected ? 'border-red-300 bg-red-50' : ''}>
                                                <CardHeader>
                                                    <div className="flex items-center justify-between">
                                                        <CardTitle className="text-lg">{meeting.title}</CardTitle>
                                                        {getStatusBadge(meeting.status)}
                                                    </div>
                                                    {meeting.description && (
                                                        <CardDescription>{meeting.description}</CardDescription>
                                                    )}
                                                </CardHeader>
                                                <CardContent className="space-y-2">
                                                    <div className="flex items-center text-sm text-muted-foreground">
                                                        <Calendar className="h-4 w-4 mr-2" />
                                                        {formatMeetingDate(meeting.scheduledDate)}
                                                    </div>
                                                    <div className="flex items-center text-sm text-muted-foreground">
                                                        <Clock className="h-4 w-4 mr-2" />
                                                        {meeting.duration} minutes
                                                    </div>
                                                    
                                                    {/* Show rejection reason if rejected */}
                                                    {isRejected && meeting.rejectionReason && (
                                                        <div className="mt-3 p-3 bg-red-100 border border-red-300 rounded-lg">
                                                            <p className="text-sm font-semibold text-red-900 mb-1">❌ Meeting Rejected</p>
                                                            <p className="text-sm text-red-800">Reason: {meeting.rejectionReason}</p>
                                                        </div>
                                                    )}
                                                    
                                                    {/* Show meeting link ONLY for approved meetings */}
                                                    {status === 'approved' && meeting.meetingLink && (() => {
                                                        const meetingDate = meeting.scheduledDate instanceof Date 
                                                            ? meeting.scheduledDate 
                                                            : (meeting.scheduledDate as any).toDate 
                                                                ? (meeting.scheduledDate as any).toDate() 
                                                                : new Date(meeting.scheduledDate);
                                                        const now = new Date();
                                                        const fifteenMinutesBefore = new Date(meetingDate.getTime() - 15 * 60000);
                                                        const canJoin = now >= fifteenMinutesBefore;

                                                        if (canJoin) {
                                                            return (
                                                                <a href={meeting.meetingLink} target="_blank" rel="noopener noreferrer" className="block">
                                                                    <Button size="sm" variant="outline" className="w-full mt-2">
                                                                        <Video className="h-4 w-4 mr-2" />
                                                                        Join Meeting
                                                                    </Button>
                                                                </a>
                                                            );
                                                        } else {
                                                            const timeUntil = Math.ceil((fifteenMinutesBefore.getTime() - now.getTime()) / 60000);
                                                            return (
                                                                <div className="mt-2 p-3 bg-gray-100 rounded-lg text-center">
                                                                    <p className="text-xs text-gray-600">
                                                                        🔒 Meeting link available {timeUntil} minutes before meeting
                                                                    </p>
                                                                </div>
                                                            );
                                                        }
                                                    })()}
                                                    
                                                    {/* Show cancel button for pending meetings */}
                                                    {status === 'pending' && (
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            onClick={() => handleCancelMeeting(meeting.id)}
                                                            className="w-full mt-2"
                                                        >
                                                            <XCircle className="h-4 w-4 mr-2" />
                                                            Cancel Request
                                                        </Button>
                                                    )}
                                                </CardContent>
                                            </Card>
                                        );
                                    })}
                                </div>
                            </TabsContent>
                        </Tabs>
                    </TabsContent>

                    {/* Reviews Tab */}
                    <TabsContent value="reviews" className="space-y-4">
                        {reviews.length === 0 ? (
                            <Card>
                                <CardContent className="pt-12 pb-12">
                                    <div className="text-center">
                                        <Edit className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                        <h3 className="text-lg font-semibold mb-2">No Reviews Yet</h3>
                                        <p className="text-muted-foreground">Your performance reviews will appear here</p>
                                    </div>
                                </CardContent>
                            </Card>
                        ) : (
                            <div className="space-y-4">
                                {reviews.map(review => (
                                    <Card key={review.id}>
                                        <CardHeader>
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <CardTitle>Performance Review - {review.reviewPeriod}</CardTitle>
                                                    <CardDescription>By: {review.reviewerName}</CardDescription>
                                                </div>
                                                <Badge className={
                                                    review.status === 'acknowledged' ? 'bg-green-100 text-green-600' :
                                                    'bg-blue-100 text-blue-600'
                                                }>
                                                    {review.status.toUpperCase()}
                                                </Badge>
                                            </div>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            <div>
                                                <p className="text-sm font-medium mb-2">Overall Rating</p>
                                                <div className="flex space-x-1 mb-2">
                                                    {[1, 2, 3, 4, 5].map(star => (
                                                        <span key={star} className={star <= review.overallRating ? 'text-yellow-400 text-3xl' : 'text-gray-300 text-3xl'}>
                                                            ★
                                                        </span>
                                                    ))}
                                                    <span className="ml-3 text-xl font-bold text-gray-900">({review.overallRating}/5)</span>
                                                </div>
                                            </div>

                                            {review.strengths.length > 0 && (
                                                <div>
                                                    <p className="text-sm font-medium mb-2">✨ Strengths</p>
                                                    <ul className="space-y-1">
                                                        {review.strengths.map((strength, idx) => (
                                                            <li key={idx} className="text-sm text-muted-foreground pl-4 border-l-2 border-green-400">
                                                                {strength}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}

                                            {review.areasForImprovement.length > 0 && (
                                                <div>
                                                    <p className="text-sm font-medium mb-2">📈 Areas for Improvement</p>
                                                    <ul className="space-y-1">
                                                        {review.areasForImprovement.map((area, idx) => (
                                                            <li key={idx} className="text-sm text-muted-foreground pl-4 border-l-2 border-orange-400">
                                                                {area}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}

                                            {review.goals.length > 0 && (
                                                <div>
                                                    <p className="text-sm font-medium mb-2">🎯 Goals for Next Period</p>
                                                    <ul className="space-y-1">
                                                        {review.goals.map((goal, idx) => (
                                                            <li key={idx} className="text-sm text-muted-foreground pl-4 border-l-2 border-blue-400">
                                                                {goal}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}

                                            {review.comments && (
                                                <div>
                                                    <p className="text-sm font-medium mb-2">💬 Additional Comments</p>
                                                    <p className="text-sm text-muted-foreground bg-gray-50 p-3 rounded">
                                                        {review.comments}
                                                    </p>
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </TabsContent>
                </Tabs>

                {/* Schedule Meeting Form */}
                {showScheduleForm && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                        <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto my-4">
                            <CardHeader>
                                <CardTitle>Schedule Performance Meeting</CardTitle>
                                <CardDescription>Request a meeting with your manager</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <Label htmlFor="title">Meeting Title *</Label>
                                    <Input
                                        id="title"
                                        value={meetingForm.title}
                                        onChange={(e) => setMeetingForm(prev => ({ ...prev, title: e.target.value }))}
                                        placeholder="e.g., Quarterly Performance Review"
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="description">Description</Label>
                                    <Textarea
                                        id="description"
                                        value={meetingForm.description}
                                        onChange={(e) => setMeetingForm(prev => ({ ...prev, description: e.target.value }))}
                                        placeholder="What would you like to discuss?"
                                        rows={3}
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="meetingType">Meeting Type</Label>
                                    <Select 
                                        value={meetingForm.meetingType} 
                                        onValueChange={(value: any) => setMeetingForm(prev => ({ ...prev, meetingType: value }))}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="one-on-one">One-on-One</SelectItem>
                                            <SelectItem value="performance-review">Performance Review</SelectItem>
                                            <SelectItem value="goal-setting">Goal Setting</SelectItem>
                                            <SelectItem value="feedback">Feedback Session</SelectItem>
                                            <SelectItem value="development">Development Discussion</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="scheduledDate">Date *</Label>
                                        <Input
                                            id="scheduledDate"
                                            type="date"
                                            value={meetingForm.scheduledDate}
                                            onChange={(e) => setMeetingForm(prev => ({ ...prev, scheduledDate: e.target.value }))}
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="scheduledTime">Time *</Label>
                                        <Input
                                            id="scheduledTime"
                                            type="time"
                                            value={meetingForm.scheduledTime}
                                            onChange={(e) => setMeetingForm(prev => ({ ...prev, scheduledTime: e.target.value }))}
                                        />
                                    </div>
                                </div>

                                {/* Show available time slots */}
                                {meetingForm.scheduledDate && (
                                    <div className="col-span-2">
                                        <Label>✅ HR Available Time Slots for {new Date(meetingForm.scheduledDate).toLocaleDateString()}</Label>
                                        {loadingSlots ? (
                                            <p className="text-sm text-gray-500 mt-2">Loading available slots...</p>
                                        ) : availableTimeSlots.length > 0 ? (
                                            <div className="grid grid-cols-4 gap-2 mt-2">
                                                {availableTimeSlots.map((slot, idx) => {
                                                    const isSelected = meetingForm.scheduledTime === slot.startTime;
                                                    return (
                                                        <button
                                                            key={idx}
                                                            type="button"
                                                            onClick={() => setMeetingForm(prev => ({ ...prev, scheduledTime: slot.startTime }))}
                                                            className={`px-3 py-2 text-sm rounded-lg border transition-all ${
                                                                isSelected 
                                                                    ? 'bg-blue-600 text-white border-blue-600' 
                                                                    : 'bg-white text-gray-700 border-gray-300 hover:border-blue-400 hover:bg-blue-50'
                                                            }`}
                                                        >
                                                            {slot.startTime} - {slot.endTime}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        ) : (
                                            <p className="text-sm text-orange-600 mt-2">
                                                ⚠️ No available slots for this date. HR may be unavailable or fully booked. Please choose another date.
                                            </p>
                                        )}
                                    </div>
                                )}

                                <div>
                                    <Label htmlFor="duration">Duration</Label>
                                    <Select 
                                        value={meetingForm.duration.toString()} 
                                        onValueChange={(value) => setMeetingForm(prev => ({ ...prev, duration: parseInt(value) }))}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="30">30 minutes</SelectItem>
                                            <SelectItem value="60">1 hour</SelectItem>
                                            <SelectItem value="90">1.5 hours</SelectItem>
                                            <SelectItem value="120">2 hours</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div>
                                    <Label htmlFor="location">Location (optional)</Label>
                                    <Input
                                        id="location"
                                        value={meetingForm.location}
                                        onChange={(e) => setMeetingForm(prev => ({ ...prev, location: e.target.value }))}
                                        placeholder="e.g., Conference Room A"
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="meetingLink">Meeting Link *</Label>
                                    <p className="text-xs text-blue-600 mb-2">
                                        💡 Create a meeting link first (Google Meet, Zoom, Teams) and paste it here. Create just before the meeting time to ensure it's fresh.
                                    </p>
                                    <Input
                                        id="meetingLink"
                                        value={meetingForm.meetingLink}
                                        onChange={(e) => setMeetingForm(prev => ({ ...prev, meetingLink: e.target.value }))}
                                        placeholder="https://meet.google.com/xxx-xxxx-xxx"
                                        required
                                    />
                                    <p className="text-xs text-gray-500 mt-1">
                                        💡 <a href="https://meet.google.com/new" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline font-medium">
                                            Click to create Google Meet
                                        </a> (copy the link from URL bar before joining, or use Zoom/Teams link)
                                    </p>
                                </div>

                                <div className="flex space-x-3 pt-4">
                                    <Button
                                        onClick={handleScheduleMeeting}
                                        disabled={submitting}
                                        className="flex-1 bg-blue-600 hover:bg-blue-700"
                                    >
                                        {submitting ? <Loader className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
                                        {submitting ? 'Scheduling...' : 'Schedule Meeting'}
                                    </Button>
                                    <Button
                                        variant="outline"
                                        onClick={() => setShowScheduleForm(false)}
                                        className="flex-1"
                                    >
                                        Cancel
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}

                {/* Goal Form */}
                {showGoalForm && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                        <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto my-4">
                            <CardHeader>
                                <CardTitle>{editingGoal ? 'Edit Goal' : 'Create Performance Goal'}</CardTitle>
                                <CardDescription>Set and track your performance objectives</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <Label htmlFor="goalTitle">Goal Title *</Label>
                                    <Input
                                        id="goalTitle"
                                        value={goalForm.title}
                                        onChange={(e) => setGoalForm(prev => ({ ...prev, title: e.target.value }))}
                                        placeholder="e.g., Complete 5 Major Projects"
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="goalDescription">Description</Label>
                                    <Textarea
                                        id="goalDescription"
                                        value={goalForm.description}
                                        onChange={(e) => setGoalForm(prev => ({ ...prev, description: e.target.value }))}
                                        placeholder="Describe your goal and how you'll achieve it..."
                                        rows={3}
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="category">Category</Label>
                                        <Select 
                                            value={goalForm.category} 
                                            onValueChange={(value: any) => setGoalForm(prev => ({ ...prev, category: value }))}
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="performance">Performance</SelectItem>
                                                <SelectItem value="development">Development</SelectItem>
                                                <SelectItem value="behavioral">Behavioral</SelectItem>
                                                <SelectItem value="technical">Technical</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div>
                                        <Label htmlFor="priority">Priority</Label>
                                        <Select 
                                            value={goalForm.priority} 
                                            onValueChange={(value: any) => setGoalForm(prev => ({ ...prev, priority: value }))}
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
                                </div>

                                <div className="grid grid-cols-3 gap-4">
                                    <div>
                                        <Label htmlFor="targetValue">Target Value *</Label>
                                        <Input
                                            id="targetValue"
                                            type="number"
                                            value={goalForm.targetValue}
                                            onChange={(e) => setGoalForm(prev => ({ ...prev, targetValue: parseInt(e.target.value) || 0 }))}
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="currentValue">Current Value</Label>
                                        <Input
                                            id="currentValue"
                                            type="number"
                                            value={goalForm.currentValue}
                                            onChange={(e) => setGoalForm(prev => ({ ...prev, currentValue: parseInt(e.target.value) || 0 }))}
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="unit">Unit</Label>
                                        <Select 
                                            value={goalForm.unit} 
                                            onValueChange={(value: any) => setGoalForm(prev => ({ ...prev, unit: value }))}
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="percentage">%</SelectItem>
                                                <SelectItem value="number">Number</SelectItem>
                                                <SelectItem value="hours">Hours</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="startDate">
                                            Start Date * 
                                            {editingGoal && <span className="text-xs text-green-600 ml-2">(already set)</span>}
                                        </Label>
                                        <Input
                                            id="startDate"
                                            type="date"
                                            value={goalForm.startDate}
                                            onChange={(e) => setGoalForm(prev => ({ ...prev, startDate: e.target.value }))}
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="endDate">
                                            End Date * 
                                            {editingGoal && <span className="text-xs text-green-600 ml-2">(already set)</span>}
                                        </Label>
                                        <Input
                                            id="endDate"
                                            type="date"
                                            value={goalForm.endDate}
                                            onChange={(e) => setGoalForm(prev => ({ ...prev, endDate: e.target.value }))}
                                        />
                                    </div>
                                </div>

                                <div className="flex space-x-3 pt-4">
                                    <Button
                                        onClick={handleCreateGoal}
                                        disabled={submitting}
                                        className="flex-1 bg-blue-600 hover:bg-blue-700"
                                    >
                                        {submitting ? <Loader className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
                                        {submitting ? 'Saving...' : (editingGoal ? 'Update Goal' : 'Create Goal')}
                                    </Button>
                                    <Button
                                        variant="outline"
                                        onClick={() => {
                                            setShowGoalForm(false);
                                            setEditingGoal(null);
                                        }}
                                        className="flex-1"
                                    >
                                        Cancel
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}

                {/* View Goal (Read-Only) */}
                {showGoalView && viewingGoal && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                        <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto my-4">
                            <CardHeader>
                                <CardTitle>{viewingGoal.title}</CardTitle>
                                <CardDescription>Goal Details</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <Label className="text-muted-foreground">Description</Label>
                                    <p className="mt-1">{viewingGoal.description || 'No description provided'}</p>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label className="text-muted-foreground">Category</Label>
                                        <p className="mt-1 capitalize">{viewingGoal.category}</p>
                                    </div>
                                    <div>
                                        <Label className="text-muted-foreground">Priority</Label>
                                        <Badge className={
                                            viewingGoal.priority === 'high' ? 'bg-red-100 text-red-600' :
                                            viewingGoal.priority === 'medium' ? 'bg-yellow-100 text-yellow-600' :
                                            'bg-gray-100 text-gray-600'
                                        }>
                                            {viewingGoal.priority.toUpperCase()}
                                        </Badge>
                                    </div>
                                </div>

                                <div>
                                    <Label className="text-muted-foreground">Progress</Label>
                                    <div className="mt-2">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-2xl font-bold text-blue-600">{viewingGoal.progress}%</span>
                                            <span className="text-sm text-muted-foreground">
                                                {viewingGoal.currentValue} / {viewingGoal.targetValue}{formatUnit(viewingGoal.unit)}
                                            </span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-3">
                                            <div 
                                                className="bg-blue-600 h-3 rounded-full transition-all" 
                                                style={{ width: `${viewingGoal.progress}%` }}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label className="text-muted-foreground">Start Date</Label>
                                        <p className="mt-1">
                                            {viewingGoal.startDate instanceof Date 
                                                ? viewingGoal.startDate.toLocaleDateString()
                                                : (viewingGoal.startDate as any).toDate 
                                                    ? (viewingGoal.startDate as any).toDate().toLocaleDateString()
                                                    : new Date(viewingGoal.startDate).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <div>
                                        <Label className="text-muted-foreground">End Date</Label>
                                        <p className="mt-1">
                                            {viewingGoal.endDate instanceof Date 
                                                ? viewingGoal.endDate.toLocaleDateString()
                                                : (viewingGoal.endDate as any).toDate 
                                                    ? (viewingGoal.endDate as any).toDate().toLocaleDateString()
                                                    : new Date(viewingGoal.endDate).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>

                                <div>
                                    <Label className="text-muted-foreground">Status</Label>
                                    <Badge className={
                                        viewingGoal.status === 'completed' ? 'bg-green-100 text-green-600' :
                                        viewingGoal.status === 'in-progress' ? 'bg-blue-100 text-blue-600' :
                                        viewingGoal.status === 'not-started' ? 'bg-gray-100 text-gray-600' :
                                        'bg-red-100 text-red-600'
                                    }>
                                        {viewingGoal.status.toUpperCase().replace('-', ' ')}
                                    </Badge>
                                </div>

                                <div className="flex space-x-3 pt-4">
                                    {viewingGoal.status !== 'completed' && viewingGoal.status !== 'cancelled' && (
                                        <Button
                                            onClick={() => {
                                                setShowGoalView(false);
                                                handleEditGoal(viewingGoal);
                                            }}
                                            className="flex-1 bg-blue-600 hover:bg-blue-700"
                                        >
                                            <Edit className="mr-2 h-4 w-4" />
                                            Edit Goal
                                        </Button>
                                    )}
                                    <Button
                                        variant="outline"
                                        onClick={() => {
                                            setShowGoalView(false);
                                            setViewingGoal(null);
                                        }}
                                        className="flex-1"
                                    >
                                        Close
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