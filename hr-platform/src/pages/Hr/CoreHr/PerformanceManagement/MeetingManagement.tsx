import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../../components/ui/card';
import { Button } from '../../../../components/ui/button';
import { Badge } from '../../../../components/ui/badge';
import { Input } from '../../../../components/ui/input';
import { Label } from '../../../../components/ui/label';
import { Textarea } from '../../../../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../../components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../../components/ui/tabs';
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
    AlertTriangle,
    ThumbsUp,
    ThumbsDown
} from 'lucide-react';
import { usePerformanceMeetings, usePerformanceGoals, usePerformanceReviews } from '../../../../hooks/useRealTimeSync';
import { PerformanceMeeting, PerformanceGoal, PerformanceReview, normalizeMeetingStatus, getMeetingStatusInfo, formatMeetingDate } from '../../../../types/performanceManagement';
import { performanceSyncService } from '../../../../services/performanceSyncService';
import { googleMeetService } from '../../../../services/googleMeetService';
import { meetingNotificationService } from '../../../../services/meetingNotificationService';
import { Progress } from '../../../../components/ui/progress';
import { useEffect } from 'react';
import { goalOverdueService } from '../../../../services/goalOverdueService';
import { GoalStatusBadge } from '../../../../components/GoalStatusBadge';
import { useCompany } from '../../../../context/CompanyContext';

export default function MeetingManagement() {
    const { companyId, company } = useCompany();
    // Helper function to display unit correctly
    const formatUnit = (unit: string) => {
        if (unit === 'percentage') return '%';
        if (unit === 'number') return '';
        if (unit === 'hours') return 'hrs';
        return unit;
    };

    const [showScheduleForm, setShowScheduleForm] = useState(false);
    const [showApprovalModal, setShowApprovalModal] = useState(false);
    const [showReviewForm, setShowReviewForm] = useState(false);
    const [showGoalForm, setShowGoalForm] = useState(false);
    const [showGoalView, setShowGoalView] = useState(false);
    const [viewingGoal, setViewingGoal] = useState<PerformanceGoal | null>(null);
    const [selectedMeeting, setSelectedMeeting] = useState<PerformanceMeeting | null>(null);
    const [approvalAction, setApprovalAction] = useState<'approve' | 'reject'>('approve');
    const [rejectionReason, setRejectionReason] = useState('');
    const [submitting, setSubmitting] = useState(false);

    // Extension request states
    const [showExtensionApproval, setShowExtensionApproval] = useState(false);
    const [selectedExtensionGoal, setSelectedExtensionGoal] = useState<PerformanceGoal | null>(null);
    const [extensionAction, setExtensionAction] = useState<'approve' | 'reject'>('approve');
    const [extensionRejectionReason, setExtensionRejectionReason] = useState('');

    // Form state for HR to schedule meetings
    const [formData, setFormData] = useState({
        employeeId: '',
        employeeName: '',
        title: '',
        description: '',
        meetingType: 'one-on-one' as const,
        scheduledDate: '',
        scheduledTime: '',
        duration: 60,
        location: '',
        meetingLink: ''
    });

    // Form state for performance reviews
    const [reviewForm, setReviewForm] = useState({
        employeeId: '',
        employeeName: '',
        reviewPeriod: '',
        overallRating: 3,
        strengths: '',
        areasForImprovement: '',
        goals: '',
        comments: ''
    });

    // Form state for creating goals for employees
    const [goalForm, setGoalForm] = useState({
        employeeId: '',
        employeeName: '',
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

    // Employee list for selection
    const [employees, setEmployees] = useState<Array<{ id: string; name: string; employeeId: string }>>([]);
    const [loadingEmployees, setLoadingEmployees] = useState(false);

    // Real-time sync for meetings, goals, and reviews
    const { data: allMeetings, loading: meetingsLoading } = usePerformanceMeetings();
    const { data: allGoals, loading: goalsLoading } = usePerformanceGoals();
    const { data: allReviews, loading: reviewsLoading } = usePerformanceReviews();
    const loading = meetingsLoading || goalsLoading || reviewsLoading;

    const meetings = (allMeetings as PerformanceMeeting[]) || [];
    const goals = (allGoals as PerformanceGoal[]) || [];
    const reviews = (allReviews as PerformanceReview[]) || [];

    // Load employees for selection
    useEffect(() => {
        const loadEmployees = async () => {
            setLoadingEmployees(true);
            try {
                const { getComprehensiveDataFlowService } = await import('../../../../services/comprehensiveDataFlowService');
                const dataFlowService = await getComprehensiveDataFlowService();
                const allEmployees = await dataFlowService.getAllEmployees();

                const employeeList = allEmployees.map(emp => ({
                    id: emp.id || emp.employeeId,
                    employeeId: emp.employeeId || emp.id,
                    name: `${emp.personalInfo?.firstName || ''} ${emp.personalInfo?.lastName || ''}`.trim() || emp.employeeId
                })).filter(emp => emp.id); // Filter out any invalid entries

                setEmployees(employeeList);
                console.log('✅ Loaded employees for selection:', employeeList.length);
            } catch (error) {
                console.error('Failed to load employees:', error);
            } finally {
                setLoadingEmployees(false);
            }
        };
        loadEmployees();
    }, []);

    // Start meeting notification checker for HR
    useEffect(() => {
        // Request notification permission on mount
        meetingNotificationService.requestNotificationPermission();

        // Start checking for upcoming meetings
        meetingNotificationService.startMeetingChecker((meeting) => {
            console.log('⏰ Meeting starting soon:', meeting);
            // The notification is already sent by the service
        });

        // Cleanup on unmount
        return () => {
            meetingNotificationService.stopMeetingChecker();
        };
    }, []);

    const handleScheduleMeeting = async () => {
        if (!formData.employeeId || !formData.employeeName || !formData.title || !formData.scheduledDate || !formData.scheduledTime) {
            alert('Please fill in all required fields');
            return;
        }

        if (!formData.meetingLink) {
            alert('Please provide a meeting link (Google Meet, Zoom, Teams, etc.)');
            return;
        }

        setSubmitting(true);
        try {
            const scheduledDateTime = new Date(`${formData.scheduledDate}T${formData.scheduledTime}`);

            await performanceSyncService.scheduleMeeting({
                companyId: companyId!, // Multi-tenancy
                employeeId: formData.employeeId,
                employeeName: formData.employeeName,
                title: formData.title,
                description: formData.description,
                meetingType: formData.meetingType,
                scheduledDate: scheduledDateTime,
                duration: formData.duration,
                location: formData.location,
                meetingLink: formData.meetingLink,
                managerName: 'HR Manager',
                createdBy: 'hr'
            });

            setShowScheduleForm(false);
            setFormData({
                employeeId: '',
                employeeName: '',
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

    const handleApproveMeeting = async () => {
        if (!selectedMeeting) return;

        setSubmitting(true);
        try {
            await performanceSyncService.approveMeeting(selectedMeeting.id, 'HR Manager');
            setShowApprovalModal(false);
            setSelectedMeeting(null);
        } catch (error) {
            console.error('Failed to approve meeting:', error);
        } finally {
            setSubmitting(false);
        }
    };

    const handleRejectMeeting = async () => {
        if (!selectedMeeting) return;

        setSubmitting(true);
        try {
            await performanceSyncService.rejectMeeting(selectedMeeting.id, 'HR Manager', rejectionReason);
            setShowApprovalModal(false);
            setSelectedMeeting(null);
            setRejectionReason('');
        } catch (error) {
            console.error('Failed to reject meeting:', error);
        } finally {
            setSubmitting(false);
        }
    };

    const handleCreateReview = async () => {
        if (!reviewForm.employeeId || !reviewForm.employeeName || !reviewForm.reviewPeriod) {
            alert('Please fill in all required fields');
            return;
        }

        setSubmitting(true);
        try {
            await performanceSyncService.createReview({
                companyId: companyId!, // Multi-tenancy
                employeeId: reviewForm.employeeId,
                employeeName: reviewForm.employeeName,
                reviewerId: 'hr-001',
                reviewerName: 'HR Manager',
                reviewPeriod: reviewForm.reviewPeriod,
                overallRating: reviewForm.overallRating,
                strengths: reviewForm.strengths.split('\n').filter(s => s.trim()),
                areasForImprovement: reviewForm.areasForImprovement.split('\n').filter(s => s.trim()),
                goals: reviewForm.goals.split('\n').filter(g => g.trim()),
                comments: reviewForm.comments,
                status: 'submitted'
            });

            setShowReviewForm(false);
            setReviewForm({
                employeeId: '',
                employeeName: '',
                reviewPeriod: '',
                overallRating: 3,
                strengths: '',
                areasForImprovement: '',
                goals: '',
                comments: ''
            });
        } catch (error) {
            console.error('Failed to create review:', error);
            alert('Failed to create review');
        } finally {
            setSubmitting(false);
        }
    };

    const handleApproveExtension = async () => {
        if (!selectedExtensionGoal) return;

        setSubmitting(true);
        try {
            await goalOverdueService.approveExtension(selectedExtensionGoal.id, 'HR Manager');
            alert(`✅ Extension approved! New deadline: ${selectedExtensionGoal.requestedNewDeadline instanceof Date ? selectedExtensionGoal.requestedNewDeadline.toLocaleDateString() : 'Updated'}`);
            setShowExtensionApproval(false);
            setSelectedExtensionGoal(null);
        } catch (error) {
            console.error('Failed to approve extension:', error);
            alert('❌ Failed to approve extension');
        } finally {
            setSubmitting(false);
        }
    };

    const handleRejectExtension = async () => {
        if (!selectedExtensionGoal || !extensionRejectionReason) {
            alert('Please provide a reason for rejection');
            return;
        }

        setSubmitting(true);
        try {
            await goalOverdueService.rejectExtension(selectedExtensionGoal.id, extensionRejectionReason);
            alert('✅ Extension request rejected. Employee has been notified.');
            setShowExtensionApproval(false);
            setSelectedExtensionGoal(null);
            setExtensionRejectionReason('');
        } catch (error) {
            console.error('Failed to reject extension:', error);
            alert('❌ Failed to reject extension');
        } finally {
            setSubmitting(false);
        }
    };

    const handleCreateGoalForEmployee = async () => {
        if (!goalForm.employeeId || !goalForm.employeeName || !goalForm.title || !goalForm.startDate || !goalForm.endDate) {
            alert('Please fill in all required fields');
            return;
        }

        setSubmitting(true);
        try {
            await performanceSyncService.createGoalForEmployee({
                companyId: companyId!, // Multi-tenancy
                employeeId: goalForm.employeeId,
                employeeName: goalForm.employeeName,
                title: goalForm.title,
                description: goalForm.description,
                category: goalForm.category,
                targetValue: goalForm.targetValue,
                currentValue: goalForm.currentValue,
                unit: goalForm.unit,
                startDate: new Date(goalForm.startDate),
                endDate: new Date(goalForm.endDate),
                status: 'in_progress',
                progress: (goalForm.currentValue / goalForm.targetValue) * 100,
                priority: goalForm.priority
            });

            setShowGoalForm(false);
            setGoalForm({
                employeeId: '',
                employeeName: '',
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
            console.error('Failed to create goal:', error);
            alert('Failed to create goal');
        } finally {
            setSubmitting(false);
        }
    };

    const openApprovalModal = (meeting: PerformanceMeeting, action: 'approve' | 'reject') => {
        setSelectedMeeting(meeting);
        setApprovalAction(action);
        setRejectionReason('');
        setShowApprovalModal(true);
    };

    const getStatusBadge = (status: string) => {
        const statusInfo = getMeetingStatusInfo(status);
        return (
            <Badge variant={statusInfo.variant} className={`${statusInfo.bgColor} ${statusInfo.color}`}>
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
                        <span className="ml-2">Loading meetings...</span>
                    </div>
                </div>
            </div>
        );
    }

    const pendingMeetings = meetings.filter(m => normalizeMeetingStatus(m.status) === 'pending');
    const approvedMeetings = meetings.filter(m => normalizeMeetingStatus(m.status) === 'approved');
    const rejectedMeetings = meetings.filter(m => normalizeMeetingStatus(m.status) === 'rejected');

    // Filter extension requests and overdue goals
    // Debug: Log all goals with extension requests
    const goalsWithExtension = goals.filter(g => g.extensionRequested === true);
    console.log('🔍 Goals with extensionRequested:', goalsWithExtension.map(g => ({
        id: g.id,
        title: g.title,
        extensionRequested: g.extensionRequested,
        extensionApproved: g.extensionApproved,
        extensionApprovedType: typeof g.extensionApproved
    })));

    const extensionRequests = goals.filter(g => {
        const hasRequest = g.extensionRequested === true;
        const notApproved = g.extensionApproved !== true; // Simplified: just check it's not explicitly true

        console.log(`🔍 Goal ${g.id}: hasRequest=${hasRequest}, notApproved=${notApproved}, extensionApproved=${g.extensionApproved}`);

        return hasRequest && notApproved;
    });

    const overdueGoals = goals.filter(g => g.status === 'overdue');
    const activeGoals = goals.filter(g => g.status === 'in_progress');
    const completedGoals = goals.filter(g => g.status === 'completed');

    console.log('📊 Extension Requests Count:', extensionRequests.length);
    console.log('📊 All Goals:', goals.length);
    console.log('📊 Overdue Goals:', overdueGoals.length);

    return (
        <div className="p-6">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-foreground">Performance Management</h1>
                        <p className="text-muted-foreground mt-2">Manage goals, meetings, and performance reviews</p>
                    </div>
                    <div className="flex space-x-2">
                        <Button
                            onClick={() => setShowGoalForm(true)}
                            variant="outline"
                            className="flex items-center gap-2"
                        >
                            <Target className="h-4 w-4" />
                            Set Goal
                        </Button>
                        <Button
                            onClick={() => setShowReviewForm(true)}
                            variant="outline"
                            className="flex items-center gap-2"
                        >
                            <Edit className="h-4 w-4" />
                            Write Review
                        </Button>
                        <Button
                            onClick={() => setShowScheduleForm(true)}
                            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
                        >
                            <Plus className="h-5 w-5" />
                            Schedule Meeting
                        </Button>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                    <Card className={pendingMeetings.length > 0 ? 'border-l-4 border-l-yellow-500' : ''}>
                        <CardContent className="pt-6">
                            <div className="flex flex-col">
                                <div className="flex items-center mb-2">
                                    <Clock className="h-5 w-5 text-yellow-600 mr-2" />
                                    <p className="text-2xl font-bold text-yellow-600">{pendingMeetings.length}</p>
                                </div>
                                <p className="text-sm font-medium text-gray-700">
                                    Pending Meeting{pendingMeetings.length !== 1 ? 's' : ''}
                                </p>
                                <p className="text-xs text-muted-foreground mt-1">
                                    {pendingMeetings.length > 0 ? 'Awaiting review' : 'None pending'}
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className={approvedMeetings.length > 0 ? 'border-l-4 border-l-green-500' : ''}>
                        <CardContent className="pt-6">
                            <div className="flex flex-col">
                                <div className="flex items-center mb-2">
                                    <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                                    <p className="text-2xl font-bold text-green-600">{approvedMeetings.length}</p>
                                </div>
                                <p className="text-sm font-medium text-gray-700">
                                    Approved Meeting{approvedMeetings.length !== 1 ? 's' : ''}
                                </p>
                                <p className="text-xs text-muted-foreground mt-1">Scheduled</p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className={overdueGoals.length > 0 ? 'border-2 border-red-200 bg-red-50' : ''}>
                        <CardContent className="pt-6">
                            <div className="flex flex-col">
                                <div className="flex items-center mb-2">
                                    <AlertTriangle className={`h-5 w-5 ${overdueGoals.length > 0 ? 'text-red-600 animate-pulse' : 'text-gray-400'} mr-2`} />
                                    <p className={`text-2xl font-bold ${overdueGoals.length > 0 ? 'text-red-600' : 'text-gray-600'}`}>
                                        {overdueGoals.length}
                                    </p>
                                </div>
                                <p className={`text-sm font-medium ${overdueGoals.length > 0 ? 'text-red-700' : 'text-gray-700'}`}>
                                    Overdue Goal{overdueGoals.length !== 1 ? 's' : ''}
                                </p>
                                <p className={`text-xs mt-1 ${overdueGoals.length > 0 ? 'text-red-600 font-medium' : 'text-muted-foreground'}`}>
                                    {overdueGoals.length > 0 ? 'Team needs help' : 'None'}
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className={extensionRequests.length > 0 ? 'border-2 border-orange-200 bg-orange-50' : ''}>
                        <CardContent className="pt-6">
                            <div className="flex flex-col">
                                <div className="flex items-center mb-2">
                                    <TrendingUp className={`h-5 w-5 ${extensionRequests.length > 0 ? 'text-orange-600 animate-pulse' : 'text-gray-400'} mr-2`} />
                                    <p className={`text-2xl font-bold ${extensionRequests.length > 0 ? 'text-orange-600' : 'text-gray-600'}`}>
                                        {extensionRequests.length}
                                    </p>
                                </div>
                                <p className={`text-sm font-medium ${extensionRequests.length > 0 ? 'text-orange-700' : 'text-gray-700'}`}>
                                    Extension Request{extensionRequests.length !== 1 ? 's' : ''}
                                </p>
                                <p className={`text-xs mt-1 ${extensionRequests.length > 0 ? 'text-orange-600 font-medium' : 'text-muted-foreground'}`}>
                                    {extensionRequests.length > 0 ? 'Needs approval' : 'None pending'}
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex flex-col">
                                <div className="flex items-center mb-2">
                                    <Target className="h-5 w-5 text-blue-600 mr-2" />
                                    <p className="text-2xl font-bold text-blue-600">{activeGoals.length}</p>
                                </div>
                                <p className="text-sm font-medium text-gray-700">
                                    Active Goal{activeGoals.length !== 1 ? 's' : ''}
                                </p>
                                <p className="text-xs text-muted-foreground mt-1">Team progress</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Extension Requests Alert */}
                {extensionRequests.length > 0 && (
                    <Card className="border-2 border-orange-300 bg-orange-50">
                        <CardContent className="pt-6">
                            <div className="flex items-start gap-4">
                                <AlertTriangle className="h-6 w-6 text-orange-600 animate-pulse flex-shrink-0 mt-1" />
                                <div className="flex-1">
                                    <h3 className="font-semibold text-orange-900 text-lg">
                                        🔔 {extensionRequests.length} Extension Request{extensionRequests.length !== 1 ? 's' : ''} Pending Your Review
                                    </h3>
                                    <p className="text-sm text-orange-700 mt-1">
                                        Employees are requesting deadline extensions. Please review and approve/reject:
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Main Tabs: Goals, Meetings, Reviews, and Extension Requests */}
                <Tabs defaultValue="goals" className="space-y-6">
                    <TabsList className="grid w-full grid-cols-4">
                        <TabsTrigger value="goals">Goals ({goals.length})</TabsTrigger>
                        <TabsTrigger value="meetings">Meetings ({meetings.length})</TabsTrigger>
                        <TabsTrigger value="reviews">Reviews ({reviews.length})</TabsTrigger>
                        <TabsTrigger value="extensions" className={extensionRequests.length > 0 ? 'bg-orange-100 text-orange-700' : ''}>
                            Extension Requests ({extensionRequests.length})
                        </TabsTrigger>
                    </TabsList>

                    {/* Goals Tab */}
                    <TabsContent value="goals" className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {goals.map(goal => {
                                const isCompleted = goal.status === 'completed';
                                const isOverdue = goal.status === 'overdue';

                                return (
                                    <Card key={goal.id} className={
                                        isCompleted ? 'border-2 border-green-200 bg-green-50/30' :
                                            isOverdue ? 'border-2 border-red-200 bg-red-50/30' : ''
                                    }>
                                        <CardHeader>
                                            <div className="flex items-center justify-between flex-wrap gap-2">
                                                <CardTitle className="text-lg">{goal.title}</CardTitle>
                                                <GoalStatusBadge goal={goal} showDetails={false} />
                                            </div>
                                            <CardDescription className="line-clamp-2">{goal.description}</CardDescription>

                                            {/* Completion Celebration */}
                                            {isCompleted && (
                                                <div className="mt-2 p-3 bg-green-100 border border-green-200 rounded-lg">
                                                    <p className="text-sm text-green-800 font-medium flex items-center gap-2">
                                                        🎉 Goal Achieved!
                                                        {goal.completedEarly && goal.daysEarlyOrLate && goal.daysEarlyOrLate > 0 && (
                                                            <span className="text-xs">
                                                                ✨ {goal.daysEarlyOrLate} day{goal.daysEarlyOrLate !== 1 ? 's' : ''} early!
                                                            </span>
                                                        )}
                                                    </p>
                                                    {goal.completedDate && (
                                                        <p className="text-xs text-green-700 mt-1">
                                                            Completed: {goal.completedDate instanceof Date
                                                                ? goal.completedDate.toLocaleDateString()
                                                                : (goal.completedDate as any).toDate?.().toLocaleDateString() || 'Recently'}
                                                        </p>
                                                    )}
                                                </div>
                                            )}

                                            {/* Overdue Warning */}
                                            {isOverdue && (
                                                <div className="mt-2 p-3 bg-red-100 border border-red-200 rounded-lg">
                                                    <p className="text-sm text-red-800 font-medium">
                                                        ⚠️ {goal.daysOverdue} day{goal.daysOverdue !== 1 ? 's' : ''} overdue
                                                    </p>
                                                    <p className="text-xs text-red-700 mt-1">
                                                        Employee: {goal.employeeName || goal.employeeId}
                                                    </p>
                                                </div>
                                            )}
                                        </CardHeader>
                                        <CardContent className="space-y-3">
                                            <div className="flex items-center space-x-2">
                                                <User className="h-4 w-4 text-blue-600" />
                                                <p className="text-sm font-medium">{goal.employeeName || goal.employeeId}</p>
                                            </div>
                                            <div>
                                                <div className="flex justify-between text-sm mb-2">
                                                    <span>Progress</span>
                                                    <span className="font-medium">{goal.progress}%</span>
                                                </div>
                                                <div className="w-full bg-gray-200 rounded-full h-2">
                                                    <div
                                                        className={`h-2 rounded-full ${isCompleted ? 'bg-green-600' : 'bg-blue-600'}`}
                                                        style={{ width: `${goal.progress}%` }}
                                                    />
                                                </div>
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
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => {
                                                    setViewingGoal(goal);
                                                    setShowGoalView(true);
                                                }}
                                                className={`w-full mt-3 ${isCompleted ? 'bg-green-50 border-green-300 hover:bg-green-100 text-green-700' : ''}`}
                                            >
                                                <Calendar className="h-4 w-4 mr-2" />
                                                View Details
                                            </Button>
                                        </CardContent>
                                    </Card>
                                );
                            })}
                        </div>
                    </TabsContent>

                    {/* Meetings Tab */}
                    <TabsContent value="meetings" className="space-y-4">
                        <Tabs defaultValue="pending" className="space-y-4">
                            <TabsList className="grid w-full grid-cols-3">
                                <TabsTrigger value="pending">Pending ({pendingMeetings.length})</TabsTrigger>
                                <TabsTrigger value="approved">Approved ({approvedMeetings.length})</TabsTrigger>
                                <TabsTrigger value="rejected">Rejected ({rejectedMeetings.length})</TabsTrigger>
                            </TabsList>

                            {/* Pending Meetings */}
                            <TabsContent value="pending" className="space-y-4">
                                {pendingMeetings.length === 0 ? (
                                    <Card>
                                        <CardContent className="pt-12 pb-12">
                                            <div className="text-center">
                                                <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
                                                <h3 className="text-lg font-semibold mb-2">No Pending Meetings</h3>
                                                <p className="text-muted-foreground">All meeting requests have been reviewed</p>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ) : (
                                    <div className="space-y-4">
                                        {pendingMeetings.map(meeting => (
                                            <Card key={meeting.id}>
                                                <CardContent className="pt-6">
                                                    <div className="flex items-center justify-between">
                                                        <div className="space-y-2 flex-1">
                                                            <div className="flex items-center space-x-2">
                                                                <h3 className="font-semibold text-lg">{meeting.title}</h3>
                                                                {getStatusBadge(meeting.status)}
                                                            </div>
                                                            <div className="flex items-center space-x-2">
                                                                <User className="h-4 w-4 text-blue-600" />
                                                                <p className="text-sm font-medium">{meeting.employeeName}</p>
                                                                <span className="text-xs text-muted-foreground">({meeting.employeeId})</span>
                                                            </div>
                                                            <p className="text-sm text-muted-foreground">{meeting.description}</p>
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
                                                        </div>
                                                        <div className="flex flex-col space-y-2">
                                                            <Button
                                                                size="sm"
                                                                onClick={() => openApprovalModal(meeting, 'approve')}
                                                                className="bg-green-600 hover:bg-green-700"
                                                            >
                                                                <CheckCircle className="h-4 w-4 mr-1" />
                                                                Approve
                                                            </Button>
                                                            <Button
                                                                size="sm"
                                                                variant="destructive"
                                                                onClick={() => openApprovalModal(meeting, 'reject')}
                                                            >
                                                                <XCircle className="h-4 w-4 mr-1" />
                                                                Reject
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        ))}
                                    </div>
                                )}
                            </TabsContent>

                            {/* Approved Meetings */}
                            <TabsContent value="approved" className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {approvedMeetings.map(meeting => (
                                        <Card key={meeting.id}>
                                            <CardHeader>
                                                <div className="flex items-center justify-between">
                                                    <CardTitle className="text-lg">{meeting.title}</CardTitle>
                                                    {getStatusBadge(meeting.status)}
                                                </div>
                                            </CardHeader>
                                            <CardContent className="space-y-2">
                                                <div className="flex items-center space-x-2">
                                                    <User className="h-4 w-4 text-green-600" />
                                                    <p className="text-sm font-medium">{meeting.employeeName}</p>
                                                </div>
                                                <p className="text-xs text-muted-foreground">ID: {meeting.employeeId}</p>
                                                <div className="flex items-center text-sm text-muted-foreground">
                                                    <Calendar className="h-4 w-4 mr-2" />
                                                    {formatMeetingDate(meeting.scheduledDate)}
                                                </div>
                                                <div className="flex items-center text-sm text-muted-foreground">
                                                    <Clock className="h-4 w-4 mr-2" />
                                                    {meeting.duration} minutes
                                                </div>
                                                {meeting.meetingLink && (() => {
                                                    const meetingDate = meeting.scheduledDate instanceof Date
                                                        ? meeting.scheduledDate
                                                        : (meeting.scheduledDate as any).toDate
                                                            ? (meeting.scheduledDate as any).toDate()
                                                            : new Date(meeting.scheduledDate);
                                                    const now = new Date();
                                                    const fifteenMinutesBefore = new Date(meetingDate.getTime() - 15 * 60000);
                                                    const meetingEndTime = new Date(meetingDate.getTime() + (meeting.duration || 60) * 60000);

                                                    const canJoin = now >= fifteenMinutesBefore && now <= meetingEndTime;
                                                    const meetingEnded = now > meetingEndTime;

                                                    if (meetingEnded) {
                                                        return (
                                                            <div className="mt-3 p-3 bg-red-50 rounded-lg text-center border border-red-200">
                                                                <p className="text-xs text-red-600 font-medium">
                                                                    ⏰ Meeting ended
                                                                </p>
                                                            </div>
                                                        );
                                                    } else if (canJoin) {
                                                        return (
                                                            <a href={meeting.meetingLink} target="_blank" rel="noopener noreferrer" className="block mt-3">
                                                                <Button size="sm" variant="outline" className="w-full">
                                                                    <Video className="h-4 w-4 mr-2" />
                                                                    Join Meeting
                                                                </Button>
                                                            </a>
                                                        );
                                                    } else {
                                                        const timeUntil = Math.ceil((fifteenMinutesBefore.getTime() - now.getTime()) / 60000);
                                                        return (
                                                            <div className="mt-3 p-3 bg-gray-100 rounded-lg text-center">
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
                            </TabsContent>

                            {/* Rejected Meetings */}
                            <TabsContent value="rejected" className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {rejectedMeetings.map(meeting => (
                                        <Card key={meeting.id}>
                                            <CardHeader>
                                                <div className="flex items-center justify-between">
                                                    <CardTitle className="text-lg">{meeting.title}</CardTitle>
                                                    {getStatusBadge(meeting.status)}
                                                </div>
                                            </CardHeader>
                                            <CardContent className="space-y-2">
                                                <div className="flex items-center space-x-2">
                                                    <User className="h-4 w-4 text-red-600" />
                                                    <p className="text-sm font-medium">{meeting.employeeName}</p>
                                                </div>
                                                <p className="text-xs text-muted-foreground">ID: {meeting.employeeId}</p>
                                                <div className="flex items-center text-sm text-muted-foreground">
                                                    <Calendar className="h-4 w-4 mr-2" />
                                                    {formatMeetingDate(meeting.scheduledDate)}
                                                </div>
                                                {meeting.rejectionReason && (
                                                    <p className="text-sm text-red-600 mt-2">
                                                        Reason: {meeting.rejectionReason}
                                                    </p>
                                                )}
                                            </CardContent>
                                        </Card>
                                    ))}
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
                                        <p className="text-muted-foreground mb-4">Write performance reviews for your team</p>
                                        <Button onClick={() => setShowReviewForm(true)}>
                                            <Plus className="h-4 w-4 mr-2" />
                                            Write Review
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {reviews.map(review => (
                                    <Card key={review.id}>
                                        <CardHeader>
                                            <div className="flex items-center justify-between">
                                                <CardTitle className="text-lg">{review.employeeName}</CardTitle>
                                                <Badge className={
                                                    review.status === 'acknowledged' ? 'bg-green-100 text-green-600' :
                                                        review.status === 'submitted' ? 'bg-blue-100 text-blue-600' :
                                                            'bg-gray-100 text-gray-600'
                                                }>
                                                    {review.status.toUpperCase()}
                                                </Badge>
                                            </div>
                                            <CardDescription>{review.reviewPeriod}</CardDescription>
                                        </CardHeader>
                                        <CardContent className="space-y-3">
                                            <div>
                                                <p className="text-sm font-medium mb-1">Overall Rating</p>
                                                <div className="flex space-x-1">
                                                    {[1, 2, 3, 4, 5].map(star => (
                                                        <span key={star} className={star <= review.overallRating ? 'text-yellow-400' : 'text-gray-300'}>
                                                            ★
                                                        </span>
                                                    ))}
                                                    <span className="ml-2 text-sm text-muted-foreground">({review.overallRating}/5)</span>
                                                </div>
                                            </div>
                                            {review.strengths.length > 0 && (
                                                <div>
                                                    <p className="text-sm font-medium">Strengths:</p>
                                                    <ul className="text-sm text-muted-foreground list-disc list-inside">
                                                        {review.strengths.slice(0, 2).map((strength, idx) => (
                                                            <li key={idx}>{strength}</li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}
                                            <p className="text-xs text-muted-foreground">
                                                By: {review.reviewerName}
                                            </p>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </TabsContent>

                    {/* Extension Requests Tab */}
                    <TabsContent value="extensions" className="space-y-4">
                        {extensionRequests.length === 0 ? (
                            <Card>
                                <CardContent className="pt-12 pb-12">
                                    <div className="text-center">
                                        <CheckCircle className="h-12 w-12 text-green-400 mx-auto mb-4" />
                                        <h3 className="text-lg font-semibold mb-2">No Pending Extension Requests</h3>
                                        <p className="text-muted-foreground">All extension requests have been reviewed</p>
                                    </div>
                                </CardContent>
                            </Card>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {extensionRequests.map(goal => {
                                    const currentDeadline = goal.endDate instanceof Date
                                        ? goal.endDate
                                        : (goal.endDate as any).toDate();
                                    const requestedDeadline = goal.requestedNewDeadline instanceof Date
                                        ? goal.requestedNewDeadline
                                        : (goal.requestedNewDeadline as any)?.toDate?.() || currentDeadline;

                                    return (
                                        <Card key={goal.id} className="border-2 border-orange-200 bg-orange-50/30">
                                            <CardHeader>
                                                <div className="flex items-center justify-between">
                                                    <CardTitle className="text-lg">{goal.title}</CardTitle>
                                                    <Badge className="bg-orange-100 text-orange-700 border-orange-300">
                                                        ⏳ EXTENSION REQUESTED
                                                    </Badge>
                                                </div>
                                                <CardDescription className="text-gray-700">
                                                    <strong>Employee:</strong> {goal.employeeName || goal.employeeId}
                                                </CardDescription>
                                            </CardHeader>
                                            <CardContent className="space-y-4">
                                                {/* Current Status */}
                                                <div className="grid grid-cols-2 gap-3 p-3 bg-white rounded-lg border border-orange-200">
                                                    <div>
                                                        <p className="text-xs text-gray-600">Current Deadline</p>
                                                        <p className="font-semibold text-red-700">
                                                            {currentDeadline.toLocaleDateString()}
                                                        </p>
                                                    </div>
                                                    <div>
                                                        <p className="text-xs text-gray-600">Days Overdue</p>
                                                        <p className="font-semibold text-red-700">
                                                            {goal.daysOverdue || 0} days
                                                        </p>
                                                    </div>
                                                    <div>
                                                        <p className="text-xs text-gray-600">Progress</p>
                                                        <p className="font-semibold">{goal.progress}%</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-xs text-gray-600">Target</p>
                                                        <p className="font-semibold">{goal.targetValue}{formatUnit(goal.unit)}</p>
                                                    </div>
                                                </div>

                                                {/* Extension Request Details */}
                                                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                                    <p className="text-sm font-semibold text-blue-900 mb-2">📋 Extension Request:</p>
                                                    <div className="space-y-2">
                                                        <div>
                                                            <p className="text-xs text-blue-700">Requested New Deadline:</p>
                                                            <p className="font-semibold text-blue-900">
                                                                {requestedDeadline.toLocaleDateString()}
                                                                <span className="text-xs text-blue-600 ml-2">
                                                                    (+{Math.ceil((requestedDeadline.getTime() - currentDeadline.getTime()) / (1000 * 60 * 60 * 24))} days)
                                                                </span>
                                                            </p>
                                                        </div>
                                                        <div>
                                                            <p className="text-xs text-blue-700">Reason:</p>
                                                            <p className="text-sm text-gray-700 italic bg-white p-2 rounded border border-blue-100">
                                                                "{goal.extensionRequestReason || 'No reason provided'}"
                                                            </p>
                                                        </div>
                                                        <div>
                                                            <p className="text-xs text-blue-700">Requested On:</p>
                                                            <p className="text-sm text-gray-700">
                                                                {goal.extensionRequestDate ?
                                                                    (goal.extensionRequestDate instanceof Date
                                                                        ? goal.extensionRequestDate.toLocaleDateString()
                                                                        : (goal.extensionRequestDate as any).toDate().toLocaleDateString())
                                                                    : 'Recently'}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Action Buttons */}
                                                <div className="flex space-x-2">
                                                    <Button
                                                        size="sm"
                                                        onClick={() => {
                                                            setSelectedExtensionGoal(goal);
                                                            setExtensionAction('approve');
                                                            setShowExtensionApproval(true);
                                                        }}
                                                        className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                                                    >
                                                        <ThumbsUp className="h-4 w-4 mr-1" />
                                                        Approve Extension
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="destructive"
                                                        onClick={() => {
                                                            setSelectedExtensionGoal(goal);
                                                            setExtensionAction('reject');
                                                            setShowExtensionApproval(true);
                                                        }}
                                                        className="flex-1"
                                                    >
                                                        <ThumbsDown className="h-4 w-4 mr-1" />
                                                        Reject Request
                                                    </Button>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    );
                                })}
                            </div>
                        )}
                    </TabsContent>
                </Tabs>

                {/* Schedule Meeting Form (HR can schedule for employees) */}
                {showScheduleForm && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                        <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto my-4">
                            <CardHeader>
                                <CardTitle>Schedule Performance Meeting</CardTitle>
                                <CardDescription>Schedule a meeting for an employee</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="employeeId">Employee ID *</Label>
                                        <Input
                                            id="employeeId"
                                            value={formData.employeeId}
                                            onChange={(e) => setFormData(prev => ({ ...prev, employeeId: e.target.value }))}
                                            placeholder="e.g., EMP001"
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="employeeName">Employee Name *</Label>
                                        <Input
                                            id="employeeName"
                                            value={formData.employeeName}
                                            onChange={(e) => setFormData(prev => ({ ...prev, employeeName: e.target.value }))}
                                            placeholder="e.g., John Doe"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <Label htmlFor="title">Meeting Title *</Label>
                                    <Input
                                        id="title"
                                        value={formData.title}
                                        onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                                        placeholder="e.g., Quarterly Performance Review"
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="description">Description</Label>
                                    <Textarea
                                        id="description"
                                        value={formData.description}
                                        onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                                        placeholder="Meeting agenda and topics..."
                                        rows={3}
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="meetingType">Meeting Type</Label>
                                    <Select
                                        value={formData.meetingType}
                                        onValueChange={(value: any) => setFormData(prev => ({ ...prev, meetingType: value }))}
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
                                            value={formData.scheduledDate}
                                            onChange={(e) => setFormData(prev => ({ ...prev, scheduledDate: e.target.value }))}
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="scheduledTime">Time *</Label>
                                        <Input
                                            id="scheduledTime"
                                            type="time"
                                            value={formData.scheduledTime}
                                            onChange={(e) => setFormData(prev => ({ ...prev, scheduledTime: e.target.value }))}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <Label htmlFor="duration">Duration</Label>
                                    <Select
                                        value={formData.duration.toString()}
                                        onValueChange={(value) => setFormData(prev => ({ ...prev, duration: parseInt(value) }))}
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
                                        value={formData.location}
                                        onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
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
                                        value={formData.meetingLink}
                                        onChange={(e) => setFormData(prev => ({ ...prev, meetingLink: e.target.value }))}
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

                {/* Approval/Rejection Modal */}
                {showApprovalModal && selectedMeeting && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                        <Card className="w-full max-w-md">
                            <CardHeader>
                                <CardTitle>
                                    {approvalAction === 'approve' ? 'Approve Meeting' : 'Reject Meeting'}
                                </CardTitle>
                                <CardDescription>
                                    {approvalAction === 'approve'
                                        ? 'Confirm meeting approval'
                                        : 'Provide a reason for rejection'}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <p className="text-sm"><strong>Employee:</strong> {selectedMeeting.employeeName}</p>
                                    <p className="text-sm"><strong>Title:</strong> {selectedMeeting.title}</p>
                                    <p className="text-sm"><strong>Date:</strong> {formatMeetingDate(selectedMeeting.scheduledDate)}</p>
                                    <p className="text-sm"><strong>Duration:</strong> {selectedMeeting.duration} minutes</p>
                                </div>

                                {approvalAction === 'reject' && (
                                    <div>
                                        <Label htmlFor="rejectionReason">Reason for Rejection</Label>
                                        <Textarea
                                            id="rejectionReason"
                                            value={rejectionReason}
                                            onChange={(e) => setRejectionReason(e.target.value)}
                                            placeholder="Please provide a reason..."
                                            rows={3}
                                        />
                                    </div>
                                )}

                                <div className="flex space-x-2">
                                    <Button
                                        onClick={approvalAction === 'approve' ? handleApproveMeeting : handleRejectMeeting}
                                        disabled={submitting}
                                        className={`flex-1 ${approvalAction === 'approve' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}`}
                                    >
                                        {submitting ? (
                                            <>
                                                <Loader className="mr-2 h-4 w-4 animate-spin" />
                                                Processing...
                                            </>
                                        ) : (
                                            `${approvalAction === 'approve' ? 'Approve' : 'Reject'} Meeting`
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

                {/* Performance Review Form */}
                {showReviewForm && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                        <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto my-4">
                            <CardHeader>
                                <CardTitle>Write Performance Review</CardTitle>
                                <CardDescription>Provide feedback and set goals for the employee</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label>Employee ID *</Label>
                                        <Input
                                            value={reviewForm.employeeId}
                                            onChange={(e) => setReviewForm(prev => ({ ...prev, employeeId: e.target.value }))}
                                            placeholder="e.g., EMP001"
                                        />
                                    </div>
                                    <div>
                                        <Label>Employee Name *</Label>
                                        <Input
                                            value={reviewForm.employeeName}
                                            onChange={(e) => setReviewForm(prev => ({ ...prev, employeeName: e.target.value }))}
                                            placeholder="e.g., John Doe"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <Label>Review Period *</Label>
                                    <Input
                                        value={reviewForm.reviewPeriod}
                                        onChange={(e) => setReviewForm(prev => ({ ...prev, reviewPeriod: e.target.value }))}
                                        placeholder="e.g., Q4 2025"
                                    />
                                </div>

                                <div>
                                    <Label>Overall Rating (1-5) *</Label>
                                    <div className="flex items-center space-x-4">
                                        <Input
                                            type="number"
                                            min="1"
                                            max="5"
                                            value={reviewForm.overallRating}
                                            onChange={(e) => setReviewForm(prev => ({ ...prev, overallRating: Math.min(5, Math.max(1, parseInt(e.target.value) || 3)) }))}
                                            className="w-20"
                                        />
                                        <div className="flex space-x-1">
                                            {[1, 2, 3, 4, 5].map(star => (
                                                <span key={star} className={star <= reviewForm.overallRating ? 'text-yellow-400 text-2xl' : 'text-gray-300 text-2xl'}>
                                                    ★
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <Label>Strengths (one per line)</Label>
                                    <Textarea
                                        value={reviewForm.strengths}
                                        onChange={(e) => setReviewForm(prev => ({ ...prev, strengths: e.target.value }))}
                                        placeholder="List employee's strengths..."
                                        rows={3}
                                    />
                                </div>

                                <div>
                                    <Label>Areas for Improvement (one per line)</Label>
                                    <Textarea
                                        value={reviewForm.areasForImprovement}
                                        onChange={(e) => setReviewForm(prev => ({ ...prev, areasForImprovement: e.target.value }))}
                                        placeholder="List areas where employee can improve..."
                                        rows={3}
                                    />
                                </div>

                                <div>
                                    <Label>Goals for Next Period (one per line)</Label>
                                    <Textarea
                                        value={reviewForm.goals}
                                        onChange={(e) => setReviewForm(prev => ({ ...prev, goals: e.target.value }))}
                                        placeholder="Set goals for the next review period..."
                                        rows={3}
                                    />
                                </div>

                                <div>
                                    <Label>Additional Comments</Label>
                                    <Textarea
                                        value={reviewForm.comments}
                                        onChange={(e) => setReviewForm(prev => ({ ...prev, comments: e.target.value }))}
                                        placeholder="Any additional feedback..."
                                        rows={3}
                                    />
                                </div>

                                <div className="flex space-x-3 pt-4">
                                    <Button
                                        onClick={handleCreateReview}
                                        disabled={submitting}
                                        className="flex-1 bg-blue-600 hover:bg-blue-700"
                                    >
                                        {submitting ? <Loader className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
                                        {submitting ? 'Submitting...' : 'Submit Review'}
                                    </Button>
                                    <Button
                                        variant="outline"
                                        onClick={() => setShowReviewForm(false)}
                                        className="flex-1"
                                    >
                                        Cancel
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}

                {/* Add Goal for Employee Form */}
                {showGoalForm && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                        <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto my-4">
                            <CardHeader>
                                <CardTitle>Set Goal for Employee</CardTitle>
                                <CardDescription>Create a performance goal for an employee</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {/* Employee Selection */}
                                <div>
                                    <Label>Assign Goal To *</Label>
                                    <Select
                                        value={goalForm.employeeId}
                                        onValueChange={(value) => {
                                            const selectedEmployee = employees.find(emp => emp.employeeId === value);
                                            if (selectedEmployee) {
                                                setGoalForm(prev => ({
                                                    ...prev,
                                                    employeeId: selectedEmployee.employeeId,
                                                    employeeName: selectedEmployee.name
                                                }));
                                            }
                                        }}
                                        disabled={loadingEmployees}
                                    >
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder={loadingEmployees ? "Loading employees..." : "Select an employee..."} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {employees.map((employee) => (
                                                <SelectItem key={employee.employeeId} value={employee.employeeId}>
                                                    <div className="flex items-center justify-between w-full">
                                                        <span className="font-medium">{employee.name}</span>
                                                        <span className="text-xs text-muted-foreground ml-2">({employee.employeeId})</span>
                                                    </div>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {goalForm.employeeId && (
                                        <p className="text-xs text-muted-foreground mt-1">
                                            ✓ Selected: <strong>{goalForm.employeeName}</strong> ({goalForm.employeeId})
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <Label>Goal Title *</Label>
                                    <Input
                                        value={goalForm.title}
                                        onChange={(e) => setGoalForm(prev => ({ ...prev, title: e.target.value }))}
                                        placeholder="e.g., Complete 10 Major Projects"
                                    />
                                </div>

                                <div>
                                    <Label>Description</Label>
                                    <Textarea
                                        value={goalForm.description}
                                        onChange={(e) => setGoalForm(prev => ({ ...prev, description: e.target.value }))}
                                        placeholder="Describe the goal and expected outcomes..."
                                        rows={3}
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label>Category</Label>
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
                                        <Label>Priority</Label>
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
                                        <Label>Target Value *</Label>
                                        <Input
                                            type="number"
                                            value={goalForm.targetValue}
                                            onChange={(e) => setGoalForm(prev => ({ ...prev, targetValue: parseInt(e.target.value) || 0 }))}
                                        />
                                    </div>
                                    <div>
                                        <Label>Current Value</Label>
                                        <Input
                                            type="number"
                                            value={goalForm.currentValue}
                                            onChange={(e) => setGoalForm(prev => ({ ...prev, currentValue: parseInt(e.target.value) || 0 }))}
                                        />
                                    </div>
                                    <div>
                                        <Label>Unit</Label>
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
                                        <Label>Start Date *</Label>
                                        <Input
                                            type="date"
                                            value={goalForm.startDate}
                                            onChange={(e) => setGoalForm(prev => ({ ...prev, startDate: e.target.value }))}
                                        />
                                    </div>
                                    <div>
                                        <Label>End Date *</Label>
                                        <Input
                                            type="date"
                                            value={goalForm.endDate}
                                            onChange={(e) => setGoalForm(prev => ({ ...prev, endDate: e.target.value }))}
                                        />
                                    </div>
                                </div>

                                <div className="flex space-x-3 pt-4">
                                    <Button
                                        onClick={handleCreateGoalForEmployee}
                                        disabled={submitting}
                                        className="flex-1 bg-blue-600 hover:bg-blue-700"
                                    >
                                        {submitting ? <Loader className="mr-2 h-4 w-4 animate-spin" /> : <Target className="mr-2 h-4 w-4" />}
                                        {submitting ? 'Creating...' : 'Create Goal'}
                                    </Button>
                                    <Button
                                        variant="outline"
                                        onClick={() => setShowGoalForm(false)}
                                        className="flex-1"
                                    >
                                        Cancel
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}

                {/* View Goal */}
                {showGoalView && viewingGoal && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                        <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto my-4">
                            <CardHeader>
                                <CardTitle>{viewingGoal.title}</CardTitle>
                                <CardDescription>
                                    Employee: {viewingGoal.employeeName} ({viewingGoal.employeeId})
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <Label className="text-muted-foreground">Description</Label>
                                    <p className="mt-1">{viewingGoal.description || 'No description provided'}</p>
                                </div>

                                <div className="grid grid-cols-3 gap-4">
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
                                    <div>
                                        <Label className="text-muted-foreground">Status</Label>
                                        <Badge className={
                                            viewingGoal.status === 'completed' ? 'bg-green-100 text-green-600' :
                                                viewingGoal.status === 'in_progress' ? 'bg-blue-100 text-blue-600' :
                                                    viewingGoal.status === 'not_started' ? 'bg-gray-100 text-gray-600' :
                                                        'bg-red-100 text-red-600'
                                        }>
                                            {viewingGoal.status.toUpperCase().replace('-', ' ')}
                                        </Badge>
                                    </div>
                                </div>

                                <div>
                                    <Label className="text-muted-foreground">Progress</Label>
                                    <div className="mt-2">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-3xl font-bold text-blue-600">{viewingGoal.progress}%</span>
                                            <span className="text-sm text-muted-foreground">
                                                {viewingGoal.currentValue} / {viewingGoal.targetValue}{formatUnit(viewingGoal.unit)}
                                            </span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-4">
                                            <div
                                                className="bg-blue-600 h-4 rounded-full transition-all"
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

                                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                                    <div className="flex items-start space-x-3">
                                        <div className="text-blue-600 text-xl">💡</div>
                                        <div>
                                            <h4 className="font-semibold text-blue-900 mb-1">HR Note</h4>
                                            <p className="text-sm text-blue-800">
                                                This is an employee's goal. You can view their progress and provide feedback during performance reviews.
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex space-x-3 pt-4">
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

                {/* Extension Approval/Rejection Modal */}
                {showExtensionApproval && selectedExtensionGoal && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                        <Card className="w-full max-w-lg">
                            <CardHeader>
                                <CardTitle className={extensionAction === 'approve' ? 'text-green-700' : 'text-red-700'}>
                                    {extensionAction === 'approve' ? 'Approve' : 'Reject'} Extension Request
                                </CardTitle>
                                <CardDescription>
                                    Employee: {selectedExtensionGoal.employeeName || selectedExtensionGoal.employeeId}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {/* Goal Details */}
                                <div className="p-3 bg-gray-50 border rounded-lg">
                                    <p className="font-semibold text-gray-900 mb-2">{selectedExtensionGoal.title}</p>
                                    <div className="grid grid-cols-2 gap-2 text-sm">
                                        <div>
                                            <p className="text-gray-600">Current Deadline:</p>
                                            <p className="font-medium text-red-700">
                                                {selectedExtensionGoal.endDate instanceof Date
                                                    ? selectedExtensionGoal.endDate.toLocaleDateString()
                                                    : (selectedExtensionGoal.endDate as any).toDate().toLocaleDateString()}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-gray-600">Requested Deadline:</p>
                                            <p className="font-medium text-blue-700">
                                                {selectedExtensionGoal.requestedNewDeadline instanceof Date
                                                    ? selectedExtensionGoal.requestedNewDeadline.toLocaleDateString()
                                                    : (selectedExtensionGoal.requestedNewDeadline as any)?.toDate?.().toLocaleDateString() || 'N/A'}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-gray-600">Days Overdue:</p>
                                            <p className="font-medium text-red-700">{selectedExtensionGoal.daysOverdue || 0}</p>
                                        </div>
                                        <div>
                                            <p className="text-gray-600">Progress:</p>
                                            <p className="font-medium">{selectedExtensionGoal.progress}%</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Employee's Reason */}
                                <div>
                                    <Label>Employee's Reason:</Label>
                                    <div className="mt-1 p-3 bg-blue-50 border border-blue-200 rounded">
                                        <p className="text-sm text-gray-700 italic">
                                            "{selectedExtensionGoal.extensionRequestReason || 'No reason provided'}"
                                        </p>
                                    </div>
                                </div>

                                {/* Rejection Reason (only if rejecting) */}
                                {extensionAction === 'reject' && (
                                    <div>
                                        <Label htmlFor="rejectionReason">Reason for Rejection *</Label>
                                        <Textarea
                                            id="rejectionReason"
                                            value={extensionRejectionReason}
                                            onChange={(e) => setExtensionRejectionReason(e.target.value)}
                                            placeholder="Explain why you're rejecting this extension request..."
                                            rows={3}
                                        />
                                    </div>
                                )}

                                {/* Confirmation Message */}
                                <div className={`p-3 ${extensionAction === 'approve' ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'} border rounded-lg`}>
                                    <p className={`text-sm font-medium ${extensionAction === 'approve' ? 'text-green-900' : 'text-red-900'}`}>
                                        {extensionAction === 'approve'
                                            ? '✅ Approving will update the goal\'s deadline and reset it to "In Progress"'
                                            : '❌ Rejecting will keep the goal as "Overdue". The employee will be notified.'}
                                    </p>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex space-x-3 pt-4">
                                    <Button
                                        onClick={extensionAction === 'approve' ? handleApproveExtension : handleRejectExtension}
                                        disabled={submitting || (extensionAction === 'reject' && !extensionRejectionReason)}
                                        className={`flex-1 ${extensionAction === 'approve' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'} text-white`}
                                    >
                                        {submitting ? (
                                            <>
                                                <Loader className="mr-2 h-4 w-4 animate-spin" />
                                                Processing...
                                            </>
                                        ) : (
                                            <>
                                                {extensionAction === 'approve' ? <ThumbsUp className="mr-2 h-4 w-4" /> : <ThumbsDown className="mr-2 h-4 w-4" />}
                                                {extensionAction === 'approve' ? 'Approve Extension' : 'Reject Request'}
                                            </>
                                        )}
                                    </Button>
                                    <Button
                                        variant="outline"
                                        onClick={() => {
                                            setShowExtensionApproval(false);
                                            setSelectedExtensionGoal(null);
                                            setExtensionRejectionReason('');
                                        }}
                                        disabled={submitting}
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
