import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Progress } from './ui/progress';
import {
    Target,
    Calendar,
    Clock,
    CheckCircle,
    AlertCircle,
    Plus,
    Star,
    Edit,
    Trash2
} from 'lucide-react';
import { format } from 'date-fns';

interface PerformanceGoal {
    id: string;
    employeeId: string;
    title: string;
    description: string;
    category: string;
    targetValue: number;
    currentValue: number;
    unit: string;
    startDate: Date;
    endDate: Date;
    status: 'not_started' | 'in_progress' | 'completed' | 'overdue';
    priority: 'low' | 'medium' | 'high';
    createdBy: string;
    createdAt: Date;
}

interface PerformanceReview {
    id: string;
    employeeId: string;
    employeeName: string;
    reviewerId: string;
    reviewerName: string;
    reviewType: 'annual' | 'quarterly' | 'monthly' | 'probation';
    reviewPeriod: string;
    overallRating: number;
    strengths: string[];
    areasForImprovement: string[];
    goals: string[];
    comments: string;
    status: 'draft' | 'submitted' | 'approved' | 'completed';
    createdAt: Date;
    submittedAt?: Date;
    approvedAt?: Date;
}

interface MeetingSchedule {
    id: string;
    employeeId: string;
    employeeName: string;
    managerId: string;
    managerName: string;
    meetingType: 'performance_review' | 'one_on_one' | 'career_development' | 'goal_setting';
    title: string;
    description: string;
    scheduledDate: Date;
    duration: number; // in minutes
    location: string;
    status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled';
    agenda?: string;
    notes?: string;
    createdBy: string;
    createdAt: Date;
}

interface PerformanceManagementSystemProps {
    isHR?: boolean;
    employeeId?: string;
}

export function PerformanceManagementSystem({ isHR = false, employeeId = 'emp-001' }: PerformanceManagementSystemProps) {
    const [goals, setGoals] = useState<PerformanceGoal[]>([]);
    const [reviews, setReviews] = useState<PerformanceReview[]>([]);
    const [meetings, setMeetings] = useState<MeetingSchedule[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState(isHR ? 'overview' : 'goals');
    const [employees, setEmployees] = useState<any[]>([]);

    // Form states
    const [showNewGoal, setShowNewGoal] = useState(false);
    const [showNewMeeting, setShowNewMeeting] = useState(false);
    const [editingGoal, setEditingGoal] = useState<PerformanceGoal | null>(null);
    const [showEditGoal, setShowEditGoal] = useState(false);

    // New goal form
    const [newGoal, setNewGoal] = useState({
        title: '',
        description: '',
        category: 'Performance',
        targetValue: 100,
        currentValue: 0,
        unit: 'percentage',
        startDate: new Date(),
        endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days from now
        priority: 'medium' as 'low' | 'medium' | 'high'
    });

    // New meeting form
    const [newMeeting, setNewMeeting] = useState({
        meetingType: 'one_on_one' as 'performance_review' | 'one_on_one' | 'career_development' | 'goal_setting',
        title: '',
        description: '',
        scheduledDate: new Date(),
        duration: 60,
        location: '',
        agenda: ''
    });

    // Load data
    useEffect(() => {
        loadPerformanceData();
    }, [isHR, employeeId]);

    const loadPerformanceData = async () => {
        try {
            // Load employee data for HR view
            if (isHR) {
                const sampleEmployees = [
                    { id: 'emp-001', name: 'John Doe', department: 'Engineering', position: 'Senior Developer' },
                    { id: 'emp-002', name: 'Jane Smith', department: 'Marketing', position: 'Marketing Manager' },
                    { id: 'emp-003', name: 'Mike Johnson', department: 'Sales', position: 'Sales Representative' },
                    { id: 'emp-004', name: 'Sarah Wilson', department: 'HR', position: 'HR Specialist' },
                    { id: 'emp-005', name: 'David Brown', department: 'Engineering', position: 'Frontend Developer' }
                ];
                setEmployees(sampleEmployees);
            }

            // Sample data - in real implementation, this would come from Firebase
            const sampleGoals: PerformanceGoal[] = [
                {
                    id: 'goal-001',
                    employeeId: 'emp-001',
                    title: 'Complete React Training',
                    description: 'Complete advanced React.js training course',
                    category: 'Learning & Development',
                    targetValue: 100,
                    currentValue: 75,
                    unit: 'percentage',
                    startDate: new Date('2024-01-01'),
                    endDate: new Date('2024-03-31'),
                    status: 'in_progress',
                    priority: 'high',
                    createdBy: 'Manager',
                    createdAt: new Date('2024-01-01')
                },
                {
                    id: 'goal-002',
                    employeeId: 'emp-001',
                    title: 'Increase Code Quality Score',
                    description: 'Improve code quality metrics by 20%',
                    category: 'Performance',
                    targetValue: 90,
                    currentValue: 85,
                    unit: 'percentage',
                    startDate: new Date('2024-01-01'),
                    endDate: new Date('2024-06-30'),
                    status: 'in_progress',
                    priority: 'high',
                    createdBy: 'Manager',
                    createdAt: new Date('2024-01-01')
                },
                {
                    id: 'goal-003',
                    employeeId: 'emp-002',
                    title: 'Launch Marketing Campaign',
                    description: 'Launch Q2 marketing campaign for new product',
                    category: 'Project Delivery',
                    targetValue: 100,
                    currentValue: 60,
                    unit: 'percentage',
                    startDate: new Date('2024-01-01'),
                    endDate: new Date('2024-03-31'),
                    status: 'in_progress',
                    priority: 'high',
                    createdBy: 'Manager',
                    createdAt: new Date('2024-01-01')
                },
                {
                    id: 'goal-004',
                    employeeId: 'emp-003',
                    title: 'Increase Sales Target',
                    description: 'Achieve 150% of quarterly sales target',
                    category: 'Sales',
                    targetValue: 150,
                    currentValue: 120,
                    unit: 'percentage',
                    startDate: new Date('2024-01-01'),
                    endDate: new Date('2024-03-31'),
                    status: 'in_progress',
                    priority: 'high',
                    createdBy: 'Manager',
                    createdAt: new Date('2024-01-01')
                },
                {
                    id: 'goal-005',
                    employeeId: 'emp-004',
                    title: 'Employee Engagement Survey',
                    description: 'Conduct quarterly employee engagement survey',
                    category: 'HR Operations',
                    targetValue: 100,
                    currentValue: 100,
                    unit: 'percentage',
                    startDate: new Date('2024-01-01'),
                    endDate: new Date('2024-02-28'),
                    status: 'completed',
                    priority: 'medium',
                    createdBy: 'Manager',
                    createdAt: new Date('2024-01-01')
                },
                {
                    id: 'goal-006',
                    employeeId: 'emp-005',
                    title: 'UI/UX Design Course',
                    description: 'Complete advanced UI/UX design course',
                    category: 'Learning & Development',
                    targetValue: 100,
                    currentValue: 40,
                    unit: 'percentage',
                    startDate: new Date('2024-01-01'),
                    endDate: new Date('2024-06-30'),
                    status: 'in_progress',
                    priority: 'medium',
                    createdBy: 'Manager',
                    createdAt: new Date('2024-01-01')
                }
            ];

            const sampleReviews: PerformanceReview[] = [
                {
                    id: 'review-001',
                    employeeId: 'emp-001',
                    employeeName: 'John Doe',
                    reviewerId: 'mgr-001',
                    reviewerName: 'Jane Manager',
                    reviewType: 'quarterly',
                    reviewPeriod: 'Q1 2024',
                    overallRating: 4.2,
                    strengths: ['Strong technical skills', 'Good team collaboration', 'Reliable and punctual'],
                    areasForImprovement: ['Communication skills', 'Leadership development'],
                    goals: ['Complete React training', 'Improve code quality', 'Take on more leadership roles'],
                    comments: 'John has shown excellent progress this quarter...',
                    status: 'completed',
                    createdAt: new Date('2024-01-01'),
                    submittedAt: new Date('2024-01-15'),
                    approvedAt: new Date('2024-01-20')
                }
            ];

            const sampleMeetings: MeetingSchedule[] = [
                {
                    id: 'meeting-001',
                    employeeId: 'emp-001',
                    employeeName: 'John Doe',
                    managerId: 'mgr-001',
                    managerName: 'Jane Manager',
                    meetingType: 'performance_review',
                    title: 'Q2 Performance Review',
                    description: 'Quarterly performance review meeting',
                    scheduledDate: new Date('2024-04-15'),
                    duration: 90,
                    location: 'Conference Room A',
                    status: 'scheduled',
                    agenda: 'Review Q2 goals, discuss achievements, set Q3 objectives',
                    createdBy: 'Manager',
                    createdAt: new Date('2024-04-01')
                },
                {
                    id: 'meeting-002',
                    employeeId: 'emp-001',
                    employeeName: 'John Doe',
                    managerId: 'mgr-001',
                    managerName: 'Jane Manager',
                    meetingType: 'one_on_one',
                    title: 'Weekly 1-on-1',
                    description: 'Regular check-in meeting',
                    scheduledDate: new Date('2024-04-22'),
                    duration: 30,
                    location: 'Manager Office',
                    status: 'confirmed',
                    agenda: 'Discuss current projects, any blockers, career development',
                    createdBy: 'Manager',
                    createdAt: new Date('2024-04-01')
                }
            ];

            setGoals(sampleGoals);
            setReviews(sampleReviews);
            setMeetings(sampleMeetings);
            setLoading(false);
        } catch (error) {
            console.error('Error loading performance data:', error);
            setLoading(false);
        }
    };

    const handleCreateGoal = () => {
        const goal: PerformanceGoal = {
            id: `goal-${Date.now()}`,
            employeeId,
            ...newGoal,
            status: 'not_started',
            createdBy: isHR ? 'HR Manager' : 'Employee',
            createdAt: new Date()
        };
        setGoals(prev => [...prev, goal]);
        setShowNewGoal(false);
        setNewGoal({
            title: '',
            description: '',
            category: 'Performance',
            targetValue: 100,
            currentValue: 0,
            unit: 'percentage',
            startDate: new Date(),
            endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
            priority: 'medium'
        });
    };

    const handleEditGoal = (goal: PerformanceGoal) => {
        setEditingGoal(goal);
        setShowEditGoal(true);
    };

    const handleUpdateGoal = () => {
        if (!editingGoal) return;

        const updatedGoals = goals.map(goal =>
            goal.id === editingGoal.id
                ? {
                    ...editingGoal,
                    status: editingGoal.currentValue >= editingGoal.targetValue ? 'completed' :
                        editingGoal.currentValue > 0 ? 'in_progress' : 'not_started'
                }
                : goal
        );

        setGoals(updatedGoals);
        setShowEditGoal(false);
        setEditingGoal(null);
    };

    const handleDeleteGoal = (goalId: string) => {
        setGoals(goals.filter(goal => goal.id !== goalId));
    };

    const handleScheduleMeeting = () => {
        const meeting: MeetingSchedule = {
            id: `meeting-${Date.now()}`,
            employeeId,
            employeeName: 'John Doe', // In real implementation, get from user context
            managerId: 'mgr-001',
            managerName: 'Jane Manager', // In real implementation, get from user context
            ...newMeeting,
            status: 'scheduled',
            createdBy: isHR ? 'HR Manager' : 'Employee',
            createdAt: new Date()
        };
        setMeetings(prev => [...prev, meeting]);
        setShowNewMeeting(false);
        setNewMeeting({
            meetingType: 'one_on_one',
            title: '',
            description: '',
            scheduledDate: new Date(),
            duration: 60,
            location: '',
            agenda: ''
        });
    };

    const handleConfirmMeeting = (meetingId: string) => {
        setMeetings(prev => prev.map(meeting =>
            meeting.id === meetingId
                ? { ...meeting, status: 'confirmed' as const }
                : meeting
        ));
    };

    const handleCompleteMeeting = (meetingId: string) => {
        setMeetings(prev => prev.map(meeting =>
            meeting.id === meetingId
                ? { ...meeting, status: 'completed' as const }
                : meeting
        ));
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'completed': return 'bg-green-100 text-green-800';
            case 'confirmed': return 'bg-blue-100 text-blue-800';
            case 'scheduled': return 'bg-yellow-100 text-yellow-800';
            case 'cancelled': return 'bg-red-100 text-red-800';
            case 'in_progress': return 'bg-blue-100 text-blue-800';
            case 'not_started': return 'bg-gray-100 text-gray-800';
            case 'overdue': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'high': return 'bg-red-100 text-red-800';
            case 'medium': return 'bg-yellow-100 text-yellow-800';
            case 'low': return 'bg-green-100 text-green-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const filteredGoals = isHR ? goals : goals.filter(goal => goal.employeeId === employeeId);
    const filteredReviews = isHR ? reviews : reviews.filter(review => review.employeeId === employeeId);
    const filteredMeetings = isHR ? meetings : meetings.filter(meeting =>
        meeting.employeeId === employeeId || meeting.managerId === employeeId
    );

    const completedGoals = filteredGoals.filter(goal => goal.status === 'completed');
    const inProgressGoals = filteredGoals.filter(goal => goal.status === 'in_progress');
    const upcomingMeetings = filteredMeetings.filter(meeting =>
        meeting.status === 'scheduled' || meeting.status === 'confirmed'
    );

    if (loading) {
        return (
            <div className="space-y-6">
                <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Loading performance data...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold">Performance Management</h2>
                    <p className="text-muted-foreground">
                        {isHR ? 'Manage employee performance goals and reviews' : 'Track your performance goals and schedule meetings'}
                    </p>
                </div>
                <div className="flex space-x-2">
                    <Button variant="outline" onClick={() => setShowNewMeeting(true)}>
                        <Calendar className="h-4 w-4 mr-2" />
                        Schedule Meeting
                    </Button>
                    {!isHR && (
                        <Button onClick={() => setShowNewGoal(true)}>
                            <Plus className="h-4 w-4 mr-2" />
                            New Goal
                        </Button>
                    )}
                </div>
            </div>

            {/* Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 hover:shadow-lg transition-all duration-300">
                    <CardContent className="p-6">
                        <div className="flex items-center space-x-4">
                            <div className="p-3 bg-blue-500 rounded-lg shadow-md">
                                <Target className="h-6 w-6 text-white" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-blue-900">{goals.length}</p>
                                <p className="text-sm text-blue-700 font-medium">Total Goals</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-green-50 to-emerald-100 border-green-200 hover:shadow-lg transition-all duration-300">
                    <CardContent className="p-6">
                        <div className="flex items-center space-x-4">
                            <div className="p-3 bg-green-500 rounded-lg shadow-md">
                                <CheckCircle className="h-6 w-6 text-white" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-green-900">
                                    {goals.filter(g => g.status === 'completed').length}
                                </p>
                                <p className="text-sm text-green-700 font-medium">Completed</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-yellow-50 to-orange-100 border-yellow-200 hover:shadow-lg transition-all duration-300">
                    <CardContent className="p-6">
                        <div className="flex items-center space-x-4">
                            <div className="p-3 bg-yellow-500 rounded-lg shadow-md">
                                <Clock className="h-6 w-6 text-white" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-yellow-900">
                                    {goals.filter(g => g.status === 'in_progress').length}
                                </p>
                                <p className="text-sm text-yellow-700 font-medium">In Progress</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-purple-50 to-indigo-100 border-purple-200 hover:shadow-lg transition-all duration-300">
                    <CardContent className="p-6">
                        <div className="flex items-center space-x-4">
                            <div className="p-3 bg-purple-500 rounded-lg shadow-md">
                                <Calendar className="h-6 w-6 text-white" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-purple-900">
                                    {upcomingMeetings.length}
                                </p>
                                <p className="text-sm text-purple-700 font-medium">Upcoming Meetings</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="goals">Goals</TabsTrigger>
                    <TabsTrigger value="meetings">Meetings</TabsTrigger>
                    <TabsTrigger value="reviews">Reviews</TabsTrigger>
                </TabsList>

                {/* Overview Tab */}
                <TabsContent value="overview" className="space-y-6">
                    {isHR ? (
                        <>
                            {/* Employee Performance Table */}
                            <Card className="bg-white shadow-lg border-0">
                                <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
                                    <CardTitle className="text-2xl font-bold text-gray-800">Employee Performance Overview</CardTitle>
                                </CardHeader>
                                <CardContent className="p-6">
                                    <div className="space-y-6">
                                        {employees.map((employee) => {
                                            const employeeGoals = goals.filter(g => g.employeeId === employee.id);
                                            const completedGoals = employeeGoals.filter(g => g.status === 'completed').length;
                                            const totalGoals = employeeGoals.length;
                                            const avgProgress = totalGoals > 0 ?
                                                Math.round(employeeGoals.reduce((sum, goal) => sum + (goal.currentValue / goal.targetValue) * 100, 0) / totalGoals) : 0;

                                            return (
                                                <div key={employee.id} className="border-2 border-gray-100 rounded-xl p-6 space-y-4 bg-gradient-to-r from-white to-gray-50 hover:shadow-lg hover:border-blue-200 transition-all duration-300">
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center space-x-4">
                                                            <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-md">
                                                                <Star className="h-6 w-6 text-white" />
                                                            </div>
                                                            <div>
                                                                <h4 className="font-medium text-lg">{employee.name}</h4>
                                                                <p className="text-sm text-muted-foreground">
                                                                    {employee.position} • {employee.department}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center space-x-4">
                                                            <div className="text-center">
                                                                <p className="text-2xl font-bold text-blue-900">{avgProgress}%</p>
                                                                <p className="text-xs text-muted-foreground">Avg Progress</p>
                                                            </div>
                                                            <div className="text-center">
                                                                <p className="text-2xl font-bold text-green-900">{completedGoals}/{totalGoals}</p>
                                                                <p className="text-xs text-muted-foreground">Goals Completed</p>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {employeeGoals.length > 0 && (
                                                        <div className="space-y-3">
                                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                                {employeeGoals.slice(0, 2).map((goal) => (
                                                                    <div key={goal.id} className="bg-white rounded-lg p-4 border border-gray-100">
                                                                        <div className="flex items-center justify-between mb-2">
                                                                            <span className="font-medium text-sm">{goal.title}</span>
                                                                            <div className="flex items-center space-x-2">
                                                                                <Badge className={getStatusColor(goal.status)}>
                                                                                    {goal.status.replace('_', ' ')}
                                                                                </Badge>
                                                                                {isHR && (
                                                                                    <div className="flex items-center space-x-1">
                                                                                        <Button
                                                                                            size="sm"
                                                                                            variant="outline"
                                                                                            onClick={() => handleEditGoal(goal)}
                                                                                        >
                                                                                            <Edit className="h-3 w-3" />
                                                                                        </Button>
                                                                                        <Button
                                                                                            size="sm"
                                                                                            variant="outline"
                                                                                            onClick={() => handleDeleteGoal(goal.id)}
                                                                                        >
                                                                                            <Trash2 className="h-3 w-3" />
                                                                                        </Button>
                                                                                    </div>
                                                                                )}
                                                                            </div>
                                                                        </div>
                                                                        <div className="space-y-1">
                                                                            <div className="flex items-center justify-between text-xs">
                                                                                <span>{goal.currentValue}/{goal.targetValue} {goal.unit}</span>
                                                                                <span>{Math.round((goal.currentValue / goal.targetValue) * 100)}%</span>
                                                                            </div>
                                                                            <Progress value={(goal.currentValue / goal.targetValue) * 100} className="h-2" />
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                            {employeeGoals.length > 2 && (
                                                                <p className="text-xs text-muted-foreground text-center">
                                                                    +{employeeGoals.length - 2} more goals
                                                                </p>
                                                            )}
                                                        </div>
                                                    )}

                                                    {employeeGoals.length === 0 && (
                                                        <div className="text-center py-4 text-muted-foreground">
                                                            <p className="text-sm">No performance goals assigned</p>
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </CardContent>
                            </Card>
                        </>
                    ) : (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Goals Overview */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Goals Overview</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {filteredGoals.slice(0, 5).map((goal) => (
                                        <div key={goal.id} className="space-y-2">
                                            <div className="flex items-center justify-between">
                                                <span className="font-medium">{goal.title}</span>
                                                <div className="flex items-center space-x-2">
                                                    <Badge className={getStatusColor(goal.status)}>
                                                        {goal.status.replace('_', ' ')}
                                                    </Badge>
                                                    <Badge className={getPriorityColor(goal.priority)}>
                                                        {goal.priority}
                                                    </Badge>
                                                </div>
                                            </div>
                                            <div className="space-y-1">
                                                <div className="flex items-center justify-between text-sm">
                                                    <span>{goal.currentValue}/{goal.targetValue} {goal.unit}</span>
                                                    <span>{Math.round((goal.currentValue / goal.targetValue) * 100)}%</span>
                                                </div>
                                                <Progress value={(goal.currentValue / goal.targetValue) * 100} className="h-2" />
                                            </div>
                                        </div>
                                    ))}
                                </CardContent>
                            </Card>

                            {/* Upcoming Meetings */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Upcoming Meetings</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        {upcomingMeetings.slice(0, 5).map((meeting) => (
                                            <div key={meeting.id} className="flex items-center justify-between p-3 border rounded-lg">
                                                <div>
                                                    <p className="font-medium">{meeting.title}</p>
                                                    <p className="text-sm text-muted-foreground">
                                                        {format(meeting.scheduledDate, 'MMM dd, yyyy')} • {meeting.duration} min
                                                    </p>
                                                </div>
                                                <Badge className={getStatusColor(meeting.status)}>
                                                    {meeting.status}
                                                </Badge>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    )}
                </TabsContent>

                {/* Goals Tab */}
                <TabsContent value="goals" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Performance Goals</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {filteredGoals.map((goal) => (
                                    <div key={goal.id} className="border rounded-lg p-4 space-y-3">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center space-x-3">
                                                <div className="p-2 bg-blue-100 rounded-lg">
                                                    <Target className="h-5 w-5 text-blue-600" />
                                                </div>
                                                <div>
                                                    <h4 className="font-medium">{goal.title}</h4>
                                                    <p className="text-sm text-muted-foreground">
                                                        {goal.category} • {goal.priority} priority
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <Badge className={getStatusColor(goal.status)}>
                                                    {goal.status.replace('_', ' ')}
                                                </Badge>
                                                <Badge className={getPriorityColor(goal.priority)}>
                                                    {goal.priority}
                                                </Badge>
                                                {isHR && (
                                                    <div className="flex items-center space-x-1">
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            onClick={() => handleEditGoal(goal)}
                                                        >
                                                            <Edit className="h-4 w-4" />
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            onClick={() => handleDeleteGoal(goal.id)}
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <p className="text-sm text-muted-foreground">{goal.description}</p>
                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between text-sm">
                                                <span>Progress: {goal.currentValue}/{goal.targetValue} {goal.unit}</span>
                                                <span>{Math.round((goal.currentValue / goal.targetValue) * 100)}%</span>
                                            </div>
                                            <Progress value={(goal.currentValue / goal.targetValue) * 100} className="h-2" />
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                            <div>
                                                <Label>Start Date</Label>
                                                <p>{goal.startDate.toLocaleDateString()}</p>
                                            </div>
                                            <div>
                                                <Label>End Date</Label>
                                                <p>{goal.endDate.toLocaleDateString()}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Meetings Tab */}
                <TabsContent value="meetings" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Meeting Schedule</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {filteredMeetings.map((meeting) => (
                                    <div key={meeting.id} className="border rounded-lg p-4 space-y-3">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center space-x-3">
                                                <div className="p-2 bg-purple-100 rounded-lg">
                                                    <Calendar className="h-5 w-5 text-purple-600" />
                                                </div>
                                                <div>
                                                    <h4 className="font-medium">{meeting.title}</h4>
                                                    <p className="text-sm text-muted-foreground">
                                                        {meeting.meetingType.replace('_', ' ')} • {meeting.duration} minutes
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <Badge className={getStatusColor(meeting.status)}>
                                                    {meeting.status}
                                                </Badge>
                                                {meeting.status === 'scheduled' && (
                                                    <Button size="sm" variant="outline" onClick={() => handleConfirmMeeting(meeting.id)}>
                                                        Confirm
                                                    </Button>
                                                )}
                                                {meeting.status === 'confirmed' && (
                                                    <Button size="sm" onClick={() => handleCompleteMeeting(meeting.id)}>
                                                        Complete
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                        <p className="text-sm text-muted-foreground">{meeting.description}</p>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                                            <div>
                                                <Label>Scheduled Date</Label>
                                                <p>{format(meeting.scheduledDate, 'MMM dd, yyyy HH:mm')}</p>
                                            </div>
                                            <div>
                                                <Label>Location</Label>
                                                <p>{meeting.location}</p>
                                            </div>
                                            <div>
                                                <Label>Duration</Label>
                                                <p>{meeting.duration} minutes</p>
                                            </div>
                                        </div>
                                        {meeting.agenda && (
                                            <div className="space-y-2">
                                                <Label>Agenda</Label>
                                                <p className="text-sm text-muted-foreground">{meeting.agenda}</p>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Reviews Tab */}
                <TabsContent value="reviews" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Performance Reviews</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {filteredReviews.map((review) => (
                                    <div key={review.id} className="border rounded-lg p-4 space-y-3">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center space-x-3">
                                                <div className="p-2 bg-green-100 rounded-lg">
                                                    <Star className="h-5 w-5 text-green-600" />
                                                </div>
                                                <div>
                                                    <h4 className="font-medium">{review.reviewType.replace('_', ' ')} Review</h4>
                                                    <p className="text-sm text-muted-foreground">
                                                        {review.reviewPeriod} • Reviewed by {review.reviewerName}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <div className="flex items-center space-x-1">
                                                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                                    <span className="font-medium">{review.overallRating}/5</span>
                                                </div>
                                                <Badge className={getStatusColor(review.status)}>
                                                    {review.status}
                                                </Badge>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <Label>Strengths</Label>
                                                <ul className="text-sm text-muted-foreground space-y-1">
                                                    {review.strengths.map((strength, index) => (
                                                        <li key={index} className="flex items-center space-x-2">
                                                            <CheckCircle className="h-3 w-3 text-green-500" />
                                                            <span>{strength}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                            <div>
                                                <Label>Areas for Improvement</Label>
                                                <ul className="text-sm text-muted-foreground space-y-1">
                                                    {review.areasForImprovement.map((area, index) => (
                                                        <li key={index} className="flex items-center space-x-2">
                                                            <AlertCircle className="h-3 w-3 text-yellow-500" />
                                                            <span>{area}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        </div>
                                        {review.comments && (
                                            <div className="space-y-2">
                                                <Label>Comments</Label>
                                                <p className="text-sm text-muted-foreground">{review.comments}</p>
                                            </div>
                                        )}
                                        <div className="flex items-center justify-between text-sm">
                                            <span>Submitted: {review.submittedAt?.toLocaleDateString() || 'Not submitted'}</span>
                                            <span>Approved: {review.approvedAt?.toLocaleDateString() || 'Not approved'}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            {/* New Goal Modal */}
            {showNewGoal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <Card className="w-full max-w-md">
                        <CardHeader>
                            <CardTitle>Create New Goal</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label>Title</Label>
                                <Input
                                    value={newGoal.title}
                                    onChange={(e) => setNewGoal(prev => ({ ...prev, title: e.target.value }))}
                                    placeholder="Goal title"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Description</Label>
                                <Textarea
                                    value={newGoal.description}
                                    onChange={(e) => setNewGoal(prev => ({ ...prev, description: e.target.value }))}
                                    placeholder="Goal description"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Category</Label>
                                    <Select value={newGoal.category} onValueChange={(value) => setNewGoal(prev => ({ ...prev, category: value }))}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Performance">Performance</SelectItem>
                                            <SelectItem value="Learning & Development">Learning & Development</SelectItem>
                                            <SelectItem value="Career">Career</SelectItem>
                                            <SelectItem value="Personal">Personal</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Priority</Label>
                                    <Select value={newGoal.priority} onValueChange={(value: 'low' | 'medium' | 'high') => setNewGoal(prev => ({ ...prev, priority: value }))}>
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
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Target Value</Label>
                                    <Input
                                        type="number"
                                        value={newGoal.targetValue}
                                        onChange={(e) => setNewGoal(prev => ({ ...prev, targetValue: parseInt(e.target.value) }))}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Unit</Label>
                                    <Select value={newGoal.unit} onValueChange={(value) => setNewGoal(prev => ({ ...prev, unit: value }))}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="percentage">Percentage</SelectItem>
                                            <SelectItem value="days">Days</SelectItem>
                                            <SelectItem value="hours">Hours</SelectItem>
                                            <SelectItem value="tasks">Tasks</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Start Date</Label>
                                    <Input
                                        type="date"
                                        value={newGoal.startDate.toISOString().split('T')[0]}
                                        onChange={(e) => setNewGoal(prev => ({ ...prev, startDate: new Date(e.target.value) }))}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>End Date</Label>
                                    <Input
                                        type="date"
                                        value={newGoal.endDate.toISOString().split('T')[0]}
                                        onChange={(e) => setNewGoal(prev => ({ ...prev, endDate: new Date(e.target.value) }))}
                                    />
                                </div>
                            </div>
                            <div className="flex space-x-2">
                                <Button onClick={handleCreateGoal} className="flex-1">Create Goal</Button>
                                <Button variant="outline" onClick={() => setShowNewGoal(false)}>Cancel</Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Edit Goal Modal */}
            {showEditGoal && editingGoal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <Card className="w-full max-w-md">
                        <CardHeader>
                            <CardTitle>Edit Goal</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label>Title</Label>
                                <Input
                                    value={editingGoal.title}
                                    onChange={(e) => setEditingGoal(prev => prev ? { ...prev, title: e.target.value } : null)}
                                    placeholder="Goal title"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Description</Label>
                                <Textarea
                                    value={editingGoal.description}
                                    onChange={(e) => setEditingGoal(prev => prev ? { ...prev, description: e.target.value } : null)}
                                    placeholder="Goal description"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Category</Label>
                                    <Select value={editingGoal.category} onValueChange={(value) => setEditingGoal(prev => prev ? { ...prev, category: value } : null)}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Performance">Performance</SelectItem>
                                            <SelectItem value="Learning & Development">Learning & Development</SelectItem>
                                            <SelectItem value="Career">Career</SelectItem>
                                            <SelectItem value="Personal">Personal</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Priority</Label>
                                    <Select value={editingGoal.priority} onValueChange={(value: 'low' | 'medium' | 'high') => setEditingGoal(prev => prev ? { ...prev, priority: value } : null)}>
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
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Target Value</Label>
                                    <Input
                                        type="number"
                                        value={editingGoal.targetValue}
                                        onChange={(e) => setEditingGoal(prev => prev ? { ...prev, targetValue: parseInt(e.target.value) } : null)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Current Value</Label>
                                    <Input
                                        type="number"
                                        value={editingGoal.currentValue}
                                        onChange={(e) => setEditingGoal(prev => prev ? { ...prev, currentValue: parseInt(e.target.value) } : null)}
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Unit</Label>
                                    <Select value={editingGoal.unit} onValueChange={(value) => setEditingGoal(prev => prev ? { ...prev, unit: value } : null)}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="percentage">Percentage</SelectItem>
                                            <SelectItem value="days">Days</SelectItem>
                                            <SelectItem value="hours">Hours</SelectItem>
                                            <SelectItem value="tasks">Tasks</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Status</Label>
                                    <Select value={editingGoal.status} onValueChange={(value: 'not_started' | 'in_progress' | 'completed' | 'overdue') => setEditingGoal(prev => prev ? { ...prev, status: value } : null)}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="not_started">Not Started</SelectItem>
                                            <SelectItem value="in_progress">In Progress</SelectItem>
                                            <SelectItem value="completed">Completed</SelectItem>
                                            <SelectItem value="overdue">Overdue</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Start Date</Label>
                                    <Input
                                        type="date"
                                        value={editingGoal.startDate.toISOString().split('T')[0]}
                                        onChange={(e) => setEditingGoal(prev => prev ? { ...prev, startDate: new Date(e.target.value) } : null)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>End Date</Label>
                                    <Input
                                        type="date"
                                        value={editingGoal.endDate.toISOString().split('T')[0]}
                                        onChange={(e) => setEditingGoal(prev => prev ? { ...prev, endDate: new Date(e.target.value) } : null)}
                                    />
                                </div>
                            </div>
                            <div className="flex space-x-2">
                                <Button onClick={handleUpdateGoal} className="flex-1">Update Goal</Button>
                                <Button variant="outline" onClick={() => { setShowEditGoal(false); setEditingGoal(null); }}>Cancel</Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* New Meeting Modal */}
            {showNewMeeting && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <Card className="w-full max-w-md">
                        <CardHeader>
                            <CardTitle>Schedule Meeting</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label>Meeting Type</Label>
                                <Select value={newMeeting.meetingType} onValueChange={(value: 'performance_review' | 'one_on_one' | 'career_development' | 'goal_setting') => setNewMeeting(prev => ({ ...prev, meetingType: value }))}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="performance_review">Performance Review</SelectItem>
                                        <SelectItem value="one_on_one">1-on-1 Meeting</SelectItem>
                                        <SelectItem value="career_development">Career Development</SelectItem>
                                        <SelectItem value="goal_setting">Goal Setting</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Title</Label>
                                <Input
                                    value={newMeeting.title}
                                    onChange={(e) => setNewMeeting(prev => ({ ...prev, title: e.target.value }))}
                                    placeholder="Meeting title"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Description</Label>
                                <Textarea
                                    value={newMeeting.description}
                                    onChange={(e) => setNewMeeting(prev => ({ ...prev, description: e.target.value }))}
                                    placeholder="Meeting description"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Date & Time</Label>
                                    <Input
                                        type="datetime-local"
                                        value={newMeeting.scheduledDate.toISOString().slice(0, 16)}
                                        onChange={(e) => setNewMeeting(prev => ({ ...prev, scheduledDate: new Date(e.target.value) }))}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Duration (minutes)</Label>
                                    <Input
                                        type="number"
                                        value={newMeeting.duration}
                                        onChange={(e) => setNewMeeting(prev => ({ ...prev, duration: parseInt(e.target.value) }))}
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label>Location</Label>
                                <Input
                                    value={newMeeting.location}
                                    onChange={(e) => setNewMeeting(prev => ({ ...prev, location: e.target.value }))}
                                    placeholder="Meeting location"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Agenda</Label>
                                <Textarea
                                    value={newMeeting.agenda}
                                    onChange={(e) => setNewMeeting(prev => ({ ...prev, agenda: e.target.value }))}
                                    placeholder="Meeting agenda"
                                />
                            </div>
                            <div className="flex space-x-2">
                                <Button onClick={handleScheduleMeeting} className="flex-1">Schedule Meeting</Button>
                                <Button variant="outline" onClick={() => setShowNewMeeting(false)}>Cancel</Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
}

export default PerformanceManagementSystem;