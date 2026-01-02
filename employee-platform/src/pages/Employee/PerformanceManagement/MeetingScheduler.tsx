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
import { useCompany } from '../../../context/CompanyContext';
import { useAuth } from '../../../context/AuthContext';
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
    Trash2,
    AlertTriangle
} from 'lucide-react';
import { usePerformanceMeetings, usePerformanceGoals, usePerformanceReviews } from '../../../hooks/useRealTimeSync';
import { PerformanceMeeting, PerformanceGoal, PerformanceReview, normalizeMeetingStatus, getMeetingStatusInfo, formatMeetingDate } from '../../../types/performanceManagement';
import { performanceSyncService } from '../../../services/performanceSyncService';
import { GoalStatusBadge, AtRiskBadge } from '../../../components/GoalStatusBadge';
import { goalOverdueService } from '../../../services/goalOverdueService';

export default function PerformanceManagement() {
    const { companyId } = useCompany();
    const { currentEmployee } = useAuth();

    const [employeeId] = useState(() => {
        return currentEmployee?.employeeId || localStorage.getItem('currentEmployeeId') || 'EMP123456ABC';
    });
    const [employeeName, setEmployeeName] = useState<string>(currentEmployee?.firstName + ' ' + currentEmployee?.lastName || '');

    // Helper function to display unit correctly
    const formatUnit = (unit: string) => {
        if (unit === 'percentage') return '%';
        if (unit === 'number') return '';
        if (unit === 'hours') return 'hrs';
        return unit;
    };
    const [showGoalForm, setShowGoalForm] = useState(false);
    const [showGoalView, setShowGoalView] = useState(false);
    const [viewingGoal, setViewingGoal] = useState<PerformanceGoal | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [editingGoal, setEditingGoal] = useState<PerformanceGoal | null>(null);

    // Extension request states
    const [showExtensionRequest, setShowExtensionRequest] = useState(false);
    const [extensionGoal, setExtensionGoal] = useState<PerformanceGoal | null>(null);
    const [extensionForm, setExtensionForm] = useState({
        newDeadline: '',
        reason: ''
    });

    // Extension decision acknowledgment
    const [showExtensionDecision, setShowExtensionDecision] = useState(false);
    const [decisionGoal, setDecisionGoal] = useState<PerformanceGoal | null>(null);

    // Completion celebration states
    const [showCompletionCelebration, setShowCompletionCelebration] = useState(false);
    const [completedGoalInfo, setCompletedGoalInfo] = useState<{
        title: string;
        daysEarly: number;
        completedDate: string;
    } | null>(null);

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
    const { data: allMeetings, loading: meetingsLoading } = usePerformanceMeetings(employeeId, companyId);
    const { data: allGoals, loading: goalsLoading } = usePerformanceGoals(employeeId, companyId);
    const { data: allReviews, loading: reviewsLoading } = usePerformanceReviews(employeeId, companyId);
    const loading = meetingsLoading || goalsLoading || reviewsLoading;

    // Filter data for this employee
    const meetings = ((allMeetings as PerformanceMeeting[]) || []).filter(
        meeting => meeting.employeeId === employeeId
    );
    const goals = (allGoals as PerformanceGoal[]) || [];
    const reviews = (allReviews as PerformanceReview[]) || [];

    // Check for overdue goals on mount (only for this employee)
    useEffect(() => {
        const checkOverdueGoals = async () => {
            try {
                await goalOverdueService.checkAndUpdateOverdueGoals(employeeId);
                console.log('✅ Checked for overdue goals');
            } catch (error) {
                console.error('Failed to check overdue goals:', error);
            }
        };
        checkOverdueGoals();
    }, [employeeId]);

    // Load employee name and HR booking page URL
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
    }, [employeeId, companyId]);

    // Check for extension decisions that need acknowledgment
    useEffect(() => {
        const goalWithDecision = goals.find(goal =>
            goal.extensionRequested === true &&
            (goal.extensionApproved === true || goal.extensionApproved === false) &&
            !goal.extensionDecisionAcknowledged
        );

        if (goalWithDecision && !showExtensionDecision) {
            setDecisionGoal(goalWithDecision);
            setShowExtensionDecision(true);
        }
    }, [goals, showExtensionDecision]);


    const handleCreateGoal = async () => {
        if (!goalForm.title || !goalForm.startDate || !goalForm.endDate) {
            alert('Please fill in all required fields');
            return;
        }

        setSubmitting(true);
        try {
            if (!companyId) {
                alert('Company ID is required. Please refresh the page.');
                setSubmitting(false);
                return;
            }

            const goalData = {
                companyId: companyId!, // Ensure companyId is included
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

            let result: any;
            if (editingGoal) {
                result = await performanceSyncService.updateGoal(editingGoal.id, goalData);
            } else {
                result = await performanceSyncService.createGoal(goalData);
            }

            // Check if goal was auto-completed
            if (result && result.completed) {
                setCompletedGoalInfo({
                    title: goalForm.title,
                    daysEarly: result.daysEarly || 0,
                    completedDate: new Date().toLocaleDateString()
                });
                setShowCompletionCelebration(true);
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
            category: goal.category as any,
            targetValue: goal.targetValue,
            currentValue: goal.currentValue,
            unit: goal.unit as any,
            startDate: startDateStr,
            endDate: endDateStr,
            priority: goal.priority as any
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

    const handleRequestExtension = (goal: PerformanceGoal) => {
        setExtensionGoal(goal);

        // Auto-fill with +7 days from current deadline
        const currentDeadline = goal.endDate instanceof Date
            ? goal.endDate
            : (goal.endDate as any).toDate();
        const suggestedDeadline = new Date(currentDeadline);
        suggestedDeadline.setDate(suggestedDeadline.getDate() + 7);

        setExtensionForm({
            newDeadline: suggestedDeadline.toISOString().split('T')[0],
            reason: ''
        });
        setShowExtensionRequest(true);
    };

    const handleSubmitExtension = async () => {
        if (!extensionGoal || !extensionForm.newDeadline || !extensionForm.reason) {
            alert('Please fill in all fields');
            return;
        }

        setSubmitting(true);
        try {
            await goalOverdueService.requestExtension(
                extensionGoal.id,
                new Date(extensionForm.newDeadline),
                extensionForm.reason,
                employeeId
            );

            alert('✅ Extension request submitted! Your manager will review it.');
            setShowExtensionRequest(false);
            setExtensionGoal(null);
            setExtensionForm({ newDeadline: '', reason: '' });
        } catch (error) {
            console.error('Failed to request extension:', error);
            alert('❌ Failed to submit extension request');
        } finally {
            setSubmitting(false);
        }
    };

    const handleAcknowledgeDecision = async () => {
        if (!decisionGoal) return;

        setSubmitting(true);
        try {
            const { db } = await import('../../../config/firebase');
            const { doc, updateDoc } = await import('firebase/firestore');

            await updateDoc(doc(db, 'performanceGoals', decisionGoal.id), {
                extensionDecisionAcknowledged: true
            });

            setShowExtensionDecision(false);
            setDecisionGoal(null);
        } catch (error) {
            console.error('Failed to acknowledge decision:', error);
            alert('❌ Failed to acknowledge. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };


    const getStatusBadge = (status: string) => {
        const statusInfo = getMeetingStatusInfo(status);
        return (
            <Badge className={`${statusInfo.bgColor} ${statusInfo.color} border-0`}>
                {statusInfo.text}
            </Badge>
        );
    };

    // Calculate days until due for at-risk badge
    const getDaysUntilDue = (goal: PerformanceGoal): number => {
        const endDate = goal.endDate instanceof Date
            ? goal.endDate
            : (goal.endDate as any).toDate();
        const now = new Date();
        const diffTime = endDate.getTime() - now.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
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

    const activeGoals = goals.filter(g => g.status === 'in_progress');
    const completedGoals = goals.filter(g => g.status === 'completed');
    const overdueGoals = goals.filter(g => g.status === 'overdue');
    const atRiskGoals = activeGoals.filter(g => {
        const daysUntilDue = getDaysUntilDue(g);
        return daysUntilDue <= 7 && daysUntilDue > 0 && g.progress < 80;
    });

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
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
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
                                <p className="text-xs text-muted-foreground mt-1">In progress</p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex flex-col">
                                <div className="flex items-center mb-2">
                                    <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                                    <p className="text-2xl font-bold text-green-600">{completedGoals.length}</p>
                                </div>
                                <p className="text-sm font-medium text-gray-700">
                                    Completed Goal{completedGoals.length !== 1 ? 's' : ''}
                                </p>
                                <p className="text-xs text-muted-foreground mt-1">Achieved</p>
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
                                    {overdueGoals.length > 0 ? 'Needs attention!' : 'None'}
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className={atRiskGoals.length > 0 ? 'border-2 border-amber-200 bg-amber-50' : ''}>
                        <CardContent className="pt-6">
                            <div className="flex flex-col">
                                <div className="flex items-center mb-2">
                                    <Clock className={`h-5 w-5 ${atRiskGoals.length > 0 ? 'text-amber-600' : 'text-gray-400'} mr-2`} />
                                    <p className={`text-2xl font-bold ${atRiskGoals.length > 0 ? 'text-amber-600' : 'text-gray-600'}`}>
                                        {atRiskGoals.length}
                                    </p>
                                </div>
                                <p className={`text-sm font-medium ${atRiskGoals.length > 0 ? 'text-amber-700' : 'text-gray-700'}`}>
                                    At Risk Goal{atRiskGoals.length !== 1 ? 's' : ''}
                                </p>
                                <p className={`text-xs mt-1 ${atRiskGoals.length > 0 ? 'text-amber-600 font-medium' : 'text-muted-foreground'}`}>
                                    {atRiskGoals.length > 0 ? 'Due soon' : 'None'}
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <Tabs defaultValue="goals" className="space-y-6">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="goals">Goals ({goals.length})</TabsTrigger>
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
                                {goals.map(goal => {
                                    const daysUntilDue = getDaysUntilDue(goal);
                                    const isAtRisk = daysUntilDue <= 7 && daysUntilDue > 0 && goal.progress < 80 && goal.status !== 'overdue';
                                    const isOverdue = goal.status === 'overdue';
                                    const isCompleted = goal.status === 'completed';

                                    return (
                                        <Card key={goal.id} className={
                                            isCompleted ? 'border-2 border-green-200 bg-green-50/30' :
                                                isOverdue ? 'border-2 border-red-200 bg-red-50/30' :
                                                    isAtRisk ? 'border-2 border-amber-200 bg-amber-50/30' : ''
                                        }>
                                            <CardHeader>
                                                <div className="flex items-center justify-between flex-wrap gap-2">
                                                    <CardTitle className="text-lg">{goal.title}</CardTitle>
                                                    <div className="flex items-center gap-2">
                                                        <GoalStatusBadge goal={goal} showDetails={false} />
                                                        {isAtRisk && <AtRiskBadge daysUntilDue={daysUntilDue} />}
                                                    </div>
                                                </div>
                                                <CardDescription>{goal.description}</CardDescription>

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
                                                                Completed on: {goal.completedDate instanceof Date
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
                                                            ⚠️ This goal is {goal.daysOverdue} day{goal.daysOverdue !== 1 ? 's' : ''} overdue
                                                        </p>

                                                        {/* Extension Status Display */}
                                                        {goal.extensionRequested && goal.extensionApproved === true ? (
                                                            <div className="mt-2 p-2 bg-green-100 border border-green-300 rounded">
                                                                <p className="text-xs text-green-800 font-semibold flex items-center gap-1">
                                                                    ✅ Extension Approved!
                                                                </p>
                                                                <p className="text-xs text-green-700 mt-1">
                                                                    New deadline: {goal.requestedNewDeadline ?
                                                                        (goal.requestedNewDeadline instanceof Date ?
                                                                            goal.requestedNewDeadline.toLocaleDateString() :
                                                                            (goal.requestedNewDeadline as any).toDate?.().toLocaleDateString() || 'Updated'
                                                                        ) : 'Updated'}
                                                                </p>
                                                            </div>
                                                        ) : goal.extensionRequested && goal.extensionApproved === false ? (
                                                            <div className="mt-2 p-2 bg-orange-100 border border-orange-300 rounded">
                                                                <p className="text-xs text-orange-800 font-semibold flex items-center gap-1">
                                                                    ❌ Extension Request Rejected
                                                                </p>
                                                                {goal.extensionRejectionReason && (
                                                                    <p className="text-xs text-orange-700 mt-1">
                                                                        Reason: {goal.extensionRejectionReason}
                                                                    </p>
                                                                )}
                                                                <Button
                                                                    size="sm"
                                                                    variant="outline"
                                                                    onClick={() => handleRequestExtension(goal)}
                                                                    className="mt-2 w-full bg-white hover:bg-orange-50 border-orange-400 text-orange-700 text-xs"
                                                                >
                                                                    <Clock className="h-3 w-3 mr-1" />
                                                                    Request Another Extension
                                                                </Button>
                                                            </div>
                                                        ) : goal.extensionRequested ? (
                                                            <p className="text-xs text-amber-700 mt-1 flex items-center gap-1">
                                                                ⏳ Extension request pending manager approval
                                                            </p>
                                                        ) : (
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                onClick={() => handleRequestExtension(goal)}
                                                                className="mt-2 bg-white hover:bg-red-50 border-red-300 text-red-700"
                                                            >
                                                                <Clock className="h-3 w-3 mr-1" />
                                                                Request Extension
                                                            </Button>
                                                        )}
                                                    </div>
                                                )}
                                            </CardHeader>
                                            <CardContent className="space-y-4">
                                                <div>
                                                    <div className="flex justify-between text-sm mb-2">
                                                        <span>Progress</span>
                                                        <span className="font-medium">{goal.progress}%</span>
                                                    </div>
                                                    <Progress
                                                        value={goal.progress}
                                                        className={`h-2 ${isCompleted ? '[&>div]:bg-green-500' : ''}`}
                                                    />
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
                                    );
                                })}
                            </div>
                        )}
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
                                            value={goalForm.targetValue ?? ''}
                                            onChange={(e) => {
                                                const val = e.target.value;
                                                if (val === '') {
                                                    setGoalForm(prev => ({ ...prev, targetValue: undefined }));
                                                } else {
                                                    const num = parseInt(val);
                                                    if (!isNaN(num)) {
                                                        setGoalForm(prev => ({ ...prev, targetValue: num }));
                                                    }
                                                }
                                            }}
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="currentValue">Current Value</Label>
                                        <Input
                                            id="currentValue"
                                            type="number"
                                            value={goalForm.currentValue ?? ''}
                                            onChange={(e) => {
                                                const val = e.target.value;
                                                if (val === '') {
                                                    setGoalForm(prev => ({ ...prev, currentValue: undefined }));
                                                } else {
                                                    const num = parseInt(val);
                                                    if (!isNaN(num)) {
                                                        setGoalForm(prev => ({ ...prev, currentValue: num }));
                                                    }
                                                }
                                            }}
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
                                    <GoalStatusBadge goal={viewingGoal} showDetails={true} />
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

                {/* Extension Request Modal */}
                {showExtensionRequest && extensionGoal && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                        <Card className="w-full max-w-lg">
                            <CardHeader>
                                <CardTitle className="text-red-700">Request Deadline Extension</CardTitle>
                                <CardDescription>
                                    Request more time to complete: {extensionGoal.title}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {/* Current Status */}
                                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                                    <div className="grid grid-cols-2 gap-2 text-sm">
                                        <div>
                                            <p className="text-red-700 font-medium">Current Deadline:</p>
                                            <p className="text-red-900">
                                                {extensionGoal.endDate instanceof Date
                                                    ? extensionGoal.endDate.toLocaleDateString()
                                                    : (extensionGoal.endDate as any).toDate
                                                        ? (extensionGoal.endDate as any).toDate().toLocaleDateString()
                                                        : new Date(extensionGoal.endDate).toLocaleDateString()}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-red-700 font-medium">Days Overdue:</p>
                                            <p className="text-red-900 font-bold">{extensionGoal.daysOverdue || 0} days</p>
                                        </div>
                                        <div>
                                            <p className="text-red-700 font-medium">Progress:</p>
                                            <p className="text-red-900">{extensionGoal.progress}%</p>
                                        </div>
                                        <div>
                                            <p className="text-red-700 font-medium">Target:</p>
                                            <p className="text-red-900">{extensionGoal.targetValue}{formatUnit(extensionGoal.unit)}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* New Deadline */}
                                <div>
                                    <Label htmlFor="extensionDeadline">Requested New Deadline *</Label>
                                    <Input
                                        id="extensionDeadline"
                                        type="date"
                                        value={extensionForm.newDeadline}
                                        onChange={(e) => setExtensionForm(prev => ({ ...prev, newDeadline: e.target.value }))}
                                        min={new Date().toISOString().split('T')[0]}
                                    />
                                    <p className="text-xs text-gray-500 mt-1">
                                        💡 Choose a realistic deadline you can meet
                                    </p>
                                </div>

                                {/* Reason */}
                                <div>
                                    <Label htmlFor="extensionReason">Reason for Extension *</Label>
                                    <Textarea
                                        id="extensionReason"
                                        value={extensionForm.reason}
                                        onChange={(e) => setExtensionForm(prev => ({ ...prev, reason: e.target.value }))}
                                        placeholder="Explain why you need more time..."
                                        rows={4}
                                    />
                                    <p className="text-xs text-gray-500 mt-1">
                                        💡 Be specific about challenges faced and your plan to complete
                                    </p>
                                </div>

                                {/* Info Box */}
                                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                    <p className="text-sm text-blue-800">
                                        <strong>📋 What happens next:</strong>
                                    </p>
                                    <ul className="text-xs text-blue-700 mt-2 space-y-1 list-disc list-inside">
                                        <li>Your manager will review this request</li>
                                        <li>You'll be notified of their decision</li>
                                        <li>If approved, your deadline will be updated</li>
                                        <li>If denied, you should prioritize completing this goal</li>
                                    </ul>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex space-x-3 pt-4">
                                    <Button
                                        onClick={handleSubmitExtension}
                                        disabled={submitting || !extensionForm.newDeadline || !extensionForm.reason}
                                        className="flex-1 bg-blue-600 hover:bg-blue-700"
                                    >
                                        {submitting ? (
                                            <>
                                                <Loader className="mr-2 h-4 w-4 animate-spin" />
                                                Submitting...
                                            </>
                                        ) : (
                                            <>
                                                <CheckCircle className="mr-2 h-4 w-4" />
                                                Submit Request
                                            </>
                                        )}
                                    </Button>
                                    <Button
                                        variant="outline"
                                        onClick={() => {
                                            setShowExtensionRequest(false);
                                            setExtensionGoal(null);
                                            setExtensionForm({ newDeadline: '', reason: '' });
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

                {/* Extension Decision Acknowledgment Modal */}
                {showExtensionDecision && decisionGoal && (
                    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[60] p-4">
                        <Card className={`w-full max-w-lg border-4 ${decisionGoal.extensionApproved
                            ? 'border-green-400 bg-green-50'
                            : 'border-orange-400 bg-orange-50'
                            }`}>
                            <CardHeader className="text-center">
                                <div className="mx-auto mb-4 w-16 h-16 rounded-full flex items-center justify-center ${decisionGoal.extensionApproved ? 'bg-green-100' : 'bg-orange-100'}">
                                    <span className="text-4xl">
                                        {decisionGoal.extensionApproved ? '✅' : '❌'}
                                    </span>
                                </div>
                                <CardTitle className={`text-2xl ${decisionGoal.extensionApproved ? 'text-green-800' : 'text-orange-800'
                                    }`}>
                                    Extension Request {decisionGoal.extensionApproved ? 'Approved!' : 'Rejected'}
                                </CardTitle>
                                <CardDescription className="text-base mt-2">
                                    Goal: <strong>{decisionGoal.title}</strong>
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {decisionGoal.extensionApproved ? (
                                    /* Approved */
                                    <div className="p-4 bg-green-100 border-2 border-green-300 rounded-lg">
                                        <p className="text-green-900 font-semibold mb-3">
                                            🎉 Good news! Your extension has been approved.
                                        </p>
                                        <div className="space-y-2 text-sm">
                                            <div className="flex justify-between">
                                                <span className="text-green-700 font-medium">New Deadline:</span>
                                                <span className="text-green-900 font-bold">
                                                    {decisionGoal.requestedNewDeadline ?
                                                        (decisionGoal.requestedNewDeadline instanceof Date ?
                                                            decisionGoal.requestedNewDeadline.toLocaleDateString('en-US', {
                                                                weekday: 'short',
                                                                month: 'short',
                                                                day: 'numeric',
                                                                year: 'numeric'
                                                            }) :
                                                            (decisionGoal.requestedNewDeadline as any).toDate?.().toLocaleDateString('en-US', {
                                                                weekday: 'short',
                                                                month: 'short',
                                                                day: 'numeric',
                                                                year: 'numeric'
                                                            }) || 'Updated'
                                                        ) : 'Updated'}
                                                </span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-green-700 font-medium">Current Progress:</span>
                                                <span className="text-green-900">{decisionGoal.progress}%</span>
                                            </div>
                                        </div>
                                        <p className="text-green-700 text-sm mt-3 italic">
                                            💪 You've got this! Make the most of this extra time.
                                        </p>
                                    </div>
                                ) : (
                                    /* Rejected */
                                    <div className="p-4 bg-orange-100 border-2 border-orange-300 rounded-lg">
                                        <p className="text-orange-900 font-semibold mb-3">
                                            Your extension request was not approved.
                                        </p>
                                        {decisionGoal.extensionRejectionReason && (
                                            <div className="mb-3">
                                                <p className="text-orange-700 font-medium text-sm mb-1">Manager's Feedback:</p>
                                                <div className="p-3 bg-white border border-orange-200 rounded">
                                                    <p className="text-orange-900 text-sm italic">
                                                        "{decisionGoal.extensionRejectionReason}"
                                                    </p>
                                                </div>
                                            </div>
                                        )}
                                        <div className="space-y-2 text-sm">
                                            <div className="flex justify-between">
                                                <span className="text-orange-700 font-medium">Days Overdue:</span>
                                                <span className="text-orange-900 font-bold">{decisionGoal.daysOverdue || 0} days</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-orange-700 font-medium">Current Progress:</span>
                                                <span className="text-orange-900">{decisionGoal.progress}%</span>
                                            </div>
                                        </div>
                                        <div className="mt-3 p-2 bg-orange-50 border border-orange-200 rounded">
                                            <p className="text-orange-800 text-xs">
                                                💡 <strong>Next Steps:</strong> Please prioritize this goal. You can request another extension if circumstances change significantly.
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {/* Acknowledgment Button */}
                                <div className="pt-2">
                                    <Button
                                        onClick={handleAcknowledgeDecision}
                                        disabled={submitting}
                                        className={`w-full ${decisionGoal.extensionApproved
                                            ? 'bg-green-600 hover:bg-green-700'
                                            : 'bg-orange-600 hover:bg-orange-700'
                                            } text-white text-lg py-6`}
                                    >
                                        {submitting ? (
                                            <>
                                                <Loader className="mr-2 h-5 w-5 animate-spin" />
                                                Processing...
                                            </>
                                        ) : (
                                            <>
                                                <CheckCircle className="mr-2 h-5 w-5" />
                                                Okay, I Understand
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}

                {/* Completion Celebration Modal */}
                {showCompletionCelebration && completedGoalInfo && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                        <Card className="w-full max-w-md border-4 border-green-400 bg-gradient-to-br from-green-50 to-blue-50">
                            <CardContent className="pt-12 pb-12">
                                <div className="text-center space-y-6">
                                    {/* Trophy Icon */}
                                    <div className="flex justify-center">
                                        <div className="relative">
                                            <CheckCircle className="h-24 w-24 text-green-600 animate-bounce" />
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <span className="text-4xl">🎉</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Title */}
                                    <div>
                                        <h2 className="text-3xl font-bold text-green-900 mb-2">
                                            🏆 Goal Achieved!
                                        </h2>
                                        <p className="text-xl font-semibold text-gray-800">
                                            {completedGoalInfo.title}
                                        </p>
                                    </div>

                                    {/* Stats */}
                                    <div className="bg-white rounded-lg p-4 border-2 border-green-200">
                                        <div className="grid grid-cols-2 gap-4 text-sm">
                                            <div>
                                                <p className="text-gray-600">Completed On</p>
                                                <p className="font-semibold text-green-800">
                                                    {completedGoalInfo.completedDate}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-gray-600">Status</p>
                                                <p className="font-semibold text-green-800">
                                                    {completedGoalInfo.daysEarly > 0
                                                        ? `${completedGoalInfo.daysEarly} day${completedGoalInfo.daysEarly !== 1 ? 's' : ''} early! ✨`
                                                        : completedGoalInfo.daysEarly < 0
                                                            ? `${Math.abs(completedGoalInfo.daysEarly)} day${Math.abs(completedGoalInfo.daysEarly) !== 1 ? 's' : ''} late`
                                                            : 'On time! 🎯'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Motivational Message */}
                                    <div className="p-4 bg-gradient-to-r from-green-100 to-blue-100 rounded-lg">
                                        <p className="text-lg font-medium text-green-900">
                                            🎊 Excellent work!
                                        </p>
                                        <p className="text-sm text-gray-700 mt-1">
                                            Your manager has been notified of this achievement.
                                        </p>
                                    </div>

                                    {/* Close Button */}
                                    <Button
                                        onClick={() => {
                                            setShowCompletionCelebration(false);
                                            setCompletedGoalInfo(null);
                                        }}
                                        className="w-full bg-green-600 hover:bg-green-700 text-white text-lg py-6"
                                    >
                                        <CheckCircle className="mr-2 h-5 w-5" />
                                        Awesome! Continue
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