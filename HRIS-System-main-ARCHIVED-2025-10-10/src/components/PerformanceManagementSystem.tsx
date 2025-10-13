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
    Star
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

    // Form states
    const [showNewGoal, setShowNewGoal] = useState(false);
    const [showNewMeeting, setShowNewMeeting] = useState(false);

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
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center space-x-4">
                            <div className="p-2 bg-blue-100 rounded-lg">
                                <Target className="h-6 w-6 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">{filteredGoals.length}</p>
                                <p className="text-sm text-muted-foreground">Total Goals</p>
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
                                <p className="text-2xl font-bold">{completedGoals.length}</p>
                                <p className="text-sm text-muted-foreground">Completed</p>
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
                                <p className="text-2xl font-bold">{inProgressGoals.length}</p>
                                <p className="text-sm text-muted-foreground">In Progress</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center space-x-4">
                            <div className="p-2 bg-purple-100 rounded-lg">
                                <Calendar className="h-6 w-6 text-purple-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">{upcomingMeetings.length}</p>
                                <p className="text-sm text-muted-foreground">Upcoming Meetings</p>
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