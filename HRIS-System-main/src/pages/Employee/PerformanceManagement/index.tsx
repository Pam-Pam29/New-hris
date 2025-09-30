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
    Target,
    TrendingUp,
    Award,
    Calendar,
    Users,
    Star,
    CheckCircle,
    Clock,
    AlertCircle,
    Plus,
    Edit,
    Trash2,
    Eye,
    MessageSquare,
    BarChart3,
    PieChart,
    LineChart,
    Trophy,
    Medal,
    Zap,
    BookOpen,
    User,
    Mail,
    Phone,
    MapPin,
    FileText,
    Download,
    Upload
} from 'lucide-react';
import { PerformanceGoal, Milestone, PerformanceReview, SelfAssessment, ManagerAssessment, PeerReview, CompetencyRating } from '../types';

// Mock data - replace with actual API calls
const mockPerformanceGoals: PerformanceGoal[] = [
    {
        id: 'goal-001',
        employeeId: 'emp-001',
        title: 'Complete React Project',
        description: 'Develop and deploy a new React-based dashboard for the company',
        category: 'performance',
        targetValue: 100,
        currentValue: 75,
        unit: 'percentage',
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-12-31'),
        status: 'in_progress',
        progress: 75,
        milestones: [
            {
                id: 'milestone-001',
                title: 'Project Planning',
                description: 'Complete project requirements and architecture design',
                targetDate: new Date('2024-02-15'),
                completed: true,
                completedAt: new Date('2024-02-10')
            },
            {
                id: 'milestone-002',
                title: 'Development Phase 1',
                description: 'Complete core functionality development',
                targetDate: new Date('2024-06-30'),
                completed: true,
                completedAt: new Date('2024-06-25')
            },
            {
                id: 'milestone-003',
                title: 'Development Phase 2',
                description: 'Complete advanced features and testing',
                targetDate: new Date('2024-09-30'),
                completed: false
            },
            {
                id: 'milestone-004',
                title: 'Deployment',
                description: 'Deploy to production and user training',
                targetDate: new Date('2024-12-31'),
                completed: false
            }
        ],
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-12-10')
    },
    {
        id: 'goal-002',
        employeeId: 'emp-001',
        title: 'Improve Code Quality',
        description: 'Achieve 95% code coverage and reduce technical debt',
        category: 'development',
        targetValue: 95,
        currentValue: 88,
        unit: 'percentage',
        startDate: new Date('2024-06-01'),
        endDate: new Date('2024-12-31'),
        status: 'in_progress',
        progress: 88,
        milestones: [
            {
                id: 'milestone-005',
                title: 'Code Review Process',
                description: 'Implement comprehensive code review process',
                targetDate: new Date('2024-07-15'),
                completed: true,
                completedAt: new Date('2024-07-10')
            },
            {
                id: 'milestone-006',
                title: 'Testing Framework',
                description: 'Set up automated testing framework',
                targetDate: new Date('2024-08-30'),
                completed: true,
                completedAt: new Date('2024-08-25')
            },
            {
                id: 'milestone-007',
                title: 'Code Coverage Target',
                description: 'Achieve 95% code coverage',
                targetDate: new Date('2024-12-31'),
                completed: false
            }
        ],
        createdAt: new Date('2024-06-01'),
        updatedAt: new Date('2024-12-10')
    }
];

const mockPerformanceReviews: PerformanceReview[] = [
    {
        id: 'review-001',
        employeeId: 'emp-001',
        reviewPeriod: 'Q4 2024',
        reviewType: 'quarterly',
        status: 'in_progress',
        selfAssessment: {
            id: 'self-001',
            employeeId: 'emp-001',
            reviewId: 'review-001',
            achievements: [
                'Successfully completed React dashboard project',
                'Improved code quality metrics by 15%',
                'Mentored 2 junior developers'
            ],
            challenges: [
                'Balancing multiple project deadlines',
                'Learning new technologies while maintaining existing code'
            ],
            goals: [
                'Complete advanced React certification',
                'Lead a major project from start to finish',
                'Improve team collaboration skills'
            ],
            skills: [
                'React/TypeScript development',
                'Project management',
                'Code review and mentoring'
            ],
            feedback: 'Overall, I feel I have grown significantly this quarter and am ready for more challenging responsibilities.',
            submittedAt: new Date('2024-12-05')
        },
        managerAssessment: {
            id: 'manager-001',
            managerId: 'manager-001',
            reviewId: 'review-001',
            performanceRating: 4.2,
            goalAchievement: 4.0,
            competencies: [
                {
                    competency: 'Technical Skills',
                    rating: 4.5,
                    comments: 'Excellent technical skills, consistently delivers high-quality code'
                },
                {
                    competency: 'Communication',
                    rating: 4.0,
                    comments: 'Good communication skills, could improve in presenting technical concepts to non-technical stakeholders'
                },
                {
                    competency: 'Teamwork',
                    rating: 4.3,
                    comments: 'Works well with team members, good mentor to junior developers'
                },
                {
                    competency: 'Problem Solving',
                    rating: 4.1,
                    comments: 'Strong problem-solving abilities, approaches challenges systematically'
                }
            ],
            feedback: 'John has shown excellent growth this quarter. His technical skills are outstanding and he has become a valuable mentor to junior team members.',
            recommendations: [
                'Consider taking on a leadership role in the next project',
                'Continue mentoring junior developers',
                'Work on presentation skills for technical concepts'
            ],
            submittedAt: new Date('2024-12-08')
        },
        peerReviews: [
            {
                id: 'peer-001',
                reviewerId: 'emp-002',
                revieweeId: 'emp-001',
                reviewId: 'review-001',
                rating: 4.3,
                feedback: 'John is a great team player and always willing to help. His code reviews are thorough and constructive.',
                submittedAt: new Date('2024-12-07')
            },
            {
                id: 'peer-002',
                reviewerId: 'emp-003',
                revieweeId: 'emp-001',
                reviewId: 'review-001',
                rating: 4.1,
                feedback: 'Very knowledgeable and approachable. Sometimes takes on too much work but always delivers quality results.',
                submittedAt: new Date('2024-12-06')
            }
        ],
        overallRating: 4.2,
        strengths: [
            'Strong technical skills',
            'Excellent mentor',
            'Reliable and consistent',
            'Good problem solver'
        ],
        areasForImprovement: [
            'Presentation skills',
            'Time management',
            'Delegation skills'
        ],
        developmentPlan: 'Focus on leadership development and presentation skills. Consider taking on a project lead role.',
        createdAt: new Date('2024-12-01'),
        updatedAt: new Date('2024-12-08'),
        completedAt: new Date('2024-12-08')
    }
];

export default function PerformanceManagement() {
    const [goals, setGoals] = useState<PerformanceGoal[]>(mockPerformanceGoals);
    const [reviews, setReviews] = useState<PerformanceReview[]>(mockPerformanceReviews);
    const [showGoalForm, setShowGoalForm] = useState(false);
    const [loading, setLoading] = useState(false);
    const [selectedGoal, setSelectedGoal] = useState<PerformanceGoal | null>(null);

    // Form state
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        category: '',
        targetValue: '',
        unit: '',
        startDate: '',
        endDate: ''
    });

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'completed': return 'bg-green-100 text-green-800';
            case 'in_progress': return 'bg-blue-100 text-blue-800';
            case 'not_started': return 'bg-gray-100 text-gray-800';
            case 'overdue': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'completed': return <CheckCircle className="h-4 w-4 text-green-600" />;
            case 'in_progress': return <Clock className="h-4 w-4 text-blue-600" />;
            case 'not_started': return <AlertCircle className="h-4 w-4 text-gray-600" />;
            case 'overdue': return <AlertCircle className="h-4 w-4 text-red-600" />;
            default: return <AlertCircle className="h-4 w-4 text-gray-600" />;
        }
    };

    const getCategoryIcon = (category: string) => {
        switch (category) {
            case 'performance': return <Target className="h-4 w-4" />;
            case 'development': return <BookOpen className="h-4 w-4" />;
            case 'behavioral': return <Users className="h-4 w-4" />;
            default: return <Target className="h-4 w-4" />;
        }
    };

    const formatDate = (date: Date) => {
        return new Intl.DateTimeFormat('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        }).format(date);
    };

    const getRatingColor = (rating: number) => {
        if (rating >= 4.5) return 'text-green-600';
        if (rating >= 4.0) return 'text-blue-600';
        if (rating >= 3.0) return 'text-yellow-600';
        return 'text-red-600';
    };

    const getRatingIcon = (rating: number) => {
        if (rating >= 4.5) return <Trophy className="h-4 w-4" />;
        if (rating >= 4.0) return <Medal className="h-4 w-4" />;
        if (rating >= 3.0) return <Star className="h-4 w-4" />;
        return <AlertCircle className="h-4 w-4" />;
    };

    const handleSubmitGoal = async () => {
        if (!formData.title || !formData.description || !formData.category) {
            alert('Please fill in all required fields');
            return;
        }

        setLoading(true);
        try {
            const newGoal: PerformanceGoal = {
                id: `goal-${Date.now()}`,
                employeeId: 'emp-001',
                title: formData.title,
                description: formData.description,
                category: formData.category as any,
                targetValue: parseFloat(formData.targetValue) || 100,
                currentValue: 0,
                unit: formData.unit || 'percentage',
                startDate: new Date(formData.startDate),
                endDate: new Date(formData.endDate),
                status: 'not_started',
                progress: 0,
                milestones: [],
                createdAt: new Date(),
                updatedAt: new Date()
            };

            setGoals(prev => [newGoal, ...prev]);
            setShowGoalForm(false);
            setFormData({
                title: '',
                description: '',
                category: '',
                targetValue: '',
                unit: '',
                startDate: '',
                endDate: ''
            });
        } catch (error) {
            console.error('Error submitting goal:', error);
        } finally {
            setLoading(false);
        }
    };

    const totalGoals = goals.length;
    const completedGoals = goals.filter(goal => goal.status === 'completed').length;
    const inProgressGoals = goals.filter(goal => goal.status === 'in_progress').length;
    const averageProgress = goals.length > 0 ? goals.reduce((sum, goal) => sum + goal.progress, 0) / goals.length : 0;

    return (
        <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 p-6">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-foreground">Performance Management</h1>
                        <p className="text-muted-foreground mt-2">
                            Track your goals, reviews, and development progress
                        </p>
                    </div>
                    <Button onClick={() => setShowGoalForm(true)}>
                        <Plus className="h-4 w-4 mr-2" />
                        New Goal
                    </Button>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Goals</CardTitle>
                            <Target className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{totalGoals}</div>
                            <p className="text-xs text-muted-foreground">Active goals</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Completed</CardTitle>
                            <CheckCircle className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{completedGoals}</div>
                            <p className="text-xs text-muted-foreground">Goals achieved</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
                            <Clock className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{inProgressGoals}</div>
                            <p className="text-xs text-muted-foreground">Active goals</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Average Progress</CardTitle>
                            <TrendingUp className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{averageProgress.toFixed(1)}%</div>
                            <p className="text-xs text-muted-foreground">Overall progress</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Main Content */}
                <Tabs defaultValue="goals" className="space-y-4">
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="goals">Goals & Milestones</TabsTrigger>
                        <TabsTrigger value="reviews">Performance Reviews</TabsTrigger>
                        <TabsTrigger value="development">Development Plan</TabsTrigger>
                    </TabsList>

                    <TabsContent value="goals" className="space-y-4">
                        {/* Goals Overview */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center space-x-2">
                                    <Target className="h-5 w-5" />
                                    <span>Performance Goals</span>
                                </CardTitle>
                                <CardDescription>
                                    Your current goals and progress tracking
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-6">
                                    {goals.map((goal) => (
                                        <div key={goal.id} className="space-y-4">
                                            <div className="flex items-start justify-between">
                                                <div className="flex items-start space-x-4">
                                                    <div className="flex-shrink-0 mt-1">
                                                        {getCategoryIcon(goal.category)}
                                                    </div>
                                                    <div className="flex-1">
                                                        <div className="flex items-center space-x-3">
                                                            <h3 className="text-lg font-semibold">{goal.title}</h3>
                                                            <Badge className={getStatusColor(goal.status)}>
                                                                {getStatusIcon(goal.status)}
                                                                <span className="ml-1">{goal.status.replace('_', ' ')}</span>
                                                            </Badge>
                                                        </div>
                                                        <p className="text-sm text-muted-foreground mt-1">
                                                            {goal.description}
                                                        </p>
                                                        <div className="flex items-center space-x-4 mt-2 text-xs text-muted-foreground">
                                                            <span>Start: {formatDate(goal.startDate)}</span>
                                                            <span>End: {formatDate(goal.endDate)}</span>
                                                            <span>Progress: {goal.currentValue}/{goal.targetValue} {goal.unit}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <Button size="sm" variant="outline" onClick={() => setSelectedGoal(goal)}>
                                                        <Eye className="h-4 w-4" />
                                                    </Button>
                                                    <Button size="sm" variant="outline">
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </div>

                                            {/* Progress Bar */}
                                            <div className="space-y-2">
                                                <div className="flex justify-between text-sm">
                                                    <span>Progress</span>
                                                    <span>{goal.progress}%</span>
                                                </div>
                                                <Progress value={goal.progress} className="h-2" />
                                            </div>

                                            {/* Milestones */}
                                            {goal.milestones.length > 0 && (
                                                <div className="space-y-2">
                                                    <h4 className="text-sm font-medium">Milestones</h4>
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                                        {goal.milestones.map((milestone) => (
                                                            <div key={milestone.id} className="flex items-center space-x-2 p-2 border rounded">
                                                                <div className="flex-shrink-0">
                                                                    {milestone.completed ? (
                                                                        <CheckCircle className="h-4 w-4 text-green-600" />
                                                                    ) : (
                                                                        <Clock className="h-4 w-4 text-gray-400" />
                                                                    )}
                                                                </div>
                                                                <div className="flex-1 min-w-0">
                                                                    <p className="text-sm font-medium">{milestone.title}</p>
                                                                    <p className="text-xs text-muted-foreground">
                                                                        Due: {formatDate(milestone.targetDate)}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="reviews" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center space-x-2">
                                    <Star className="h-5 w-5" />
                                    <span>Performance Reviews</span>
                                </CardTitle>
                                <CardDescription>
                                    Your performance reviews and feedback
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-6">
                                    {reviews.map((review) => (
                                        <div key={review.id} className="space-y-4">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <h3 className="text-lg font-semibold">
                                                        {review.reviewPeriod} - {review.reviewType.charAt(0).toUpperCase() + review.reviewType.slice(1)} Review
                                                    </h3>
                                                    <p className="text-sm text-muted-foreground">
                                                        Overall Rating: <span className={`font-semibold ${getRatingColor(review.overallRating)}`}>
                                                            {review.overallRating}/5.0
                                                        </span>
                                                    </p>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <Badge className={getStatusColor(review.status)}>
                                                        {review.status.replace('_', ' ')}
                                                    </Badge>
                                                    <Button size="sm" variant="outline">
                                                        <Eye className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </div>

                                            {/* Manager Assessment */}
                                            {review.managerAssessment && (
                                                <div className="p-4 border rounded-lg">
                                                    <h4 className="font-semibold mb-2">Manager Assessment</h4>
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                        <div>
                                                            <p className="text-sm text-muted-foreground">Performance Rating</p>
                                                            <p className="text-lg font-semibold">{review.managerAssessment.performanceRating}/5.0</p>
                                                        </div>
                                                        <div>
                                                            <p className="text-sm text-muted-foreground">Goal Achievement</p>
                                                            <p className="text-lg font-semibold">{review.managerAssessment.goalAchievement}/5.0</p>
                                                        </div>
                                                    </div>
                                                    <p className="text-sm mt-2">{review.managerAssessment.feedback}</p>
                                                </div>
                                            )}

                                            {/* Competencies */}
                                            {review.managerAssessment?.competencies && (
                                                <div className="space-y-2">
                                                    <h4 className="font-semibold">Competency Ratings</h4>
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                                        {review.managerAssessment.competencies.map((competency, index) => (
                                                            <div key={index} className="flex items-center justify-between p-2 border rounded">
                                                                <span className="text-sm">{competency.competency}</span>
                                                                <div className="flex items-center space-x-1">
                                                                    <span className={`text-sm font-semibold ${getRatingColor(competency.rating)}`}>
                                                                        {competency.rating}/5.0
                                                                    </span>
                                                                    {getRatingIcon(competency.rating)}
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Peer Reviews */}
                                            {review.peerReviews && review.peerReviews.length > 0 && (
                                                <div className="space-y-2">
                                                    <h4 className="font-semibold">Peer Reviews</h4>
                                                    <div className="space-y-2">
                                                        {review.peerReviews.map((peerReview) => (
                                                            <div key={peerReview.id} className="p-3 border rounded">
                                                                <div className="flex items-center justify-between mb-2">
                                                                    <span className="text-sm font-medium">Peer Review</span>
                                                                    <div className="flex items-center space-x-1">
                                                                        <span className={`text-sm font-semibold ${getRatingColor(peerReview.rating)}`}>
                                                                            {peerReview.rating}/5.0
                                                                        </span>
                                                                        {getRatingIcon(peerReview.rating)}
                                                                    </div>
                                                                </div>
                                                                <p className="text-sm text-muted-foreground">{peerReview.feedback}</p>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Development Plan */}
                                            <div className="p-4 border rounded-lg bg-muted/50">
                                                <h4 className="font-semibold mb-2">Development Plan</h4>
                                                <p className="text-sm">{review.developmentPlan}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="development" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center space-x-2">
                                    <BookOpen className="h-5 w-5" />
                                    <span>Development Plan</span>
                                </CardTitle>
                                <CardDescription>
                                    Your personal development and learning journey
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="text-center py-8">
                                    <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                                    <p className="text-muted-foreground">Development plan features coming soon</p>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>

                {/* Goal Form Modal */}
                {showGoalForm && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-background rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-2xl font-bold">New Performance Goal</h2>
                                <Button variant="outline" onClick={() => setShowGoalForm(false)}>
                                    <XCircle className="h-4 w-4" />
                                </Button>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <Label htmlFor="title">Goal Title *</Label>
                                    <Input
                                        id="title"
                                        placeholder="Enter goal title"
                                        value={formData.title}
                                        onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="description">Description *</Label>
                                    <Textarea
                                        id="description"
                                        placeholder="Describe your goal in detail..."
                                        value={formData.description}
                                        onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                                        rows={3}
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="category">Category *</Label>
                                        <Select
                                            value={formData.category}
                                            onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select category" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="performance">Performance</SelectItem>
                                                <SelectItem value="development">Development</SelectItem>
                                                <SelectItem value="behavioral">Behavioral</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div>
                                        <Label htmlFor="unit">Unit</Label>
                                        <Select
                                            value={formData.unit}
                                            onValueChange={(value) => setFormData(prev => ({ ...prev, unit: value }))}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select unit" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="percentage">Percentage</SelectItem>
                                                <SelectItem value="count">Count</SelectItem>
                                                <SelectItem value="hours">Hours</SelectItem>
                                                <SelectItem value="days">Days</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <Label htmlFor="targetValue">Target Value</Label>
                                        <Input
                                            id="targetValue"
                                            type="number"
                                            placeholder="100"
                                            value={formData.targetValue}
                                            onChange={(e) => setFormData(prev => ({ ...prev, targetValue: e.target.value }))}
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="startDate">Start Date</Label>
                                        <Input
                                            id="startDate"
                                            type="date"
                                            value={formData.startDate}
                                            onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="endDate">End Date</Label>
                                        <Input
                                            id="endDate"
                                            type="date"
                                            value={formData.endDate}
                                            onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end space-x-2 mt-6">
                                <Button variant="outline" onClick={() => setShowGoalForm(false)}>
                                    Cancel
                                </Button>
                                <Button onClick={handleSubmitGoal} disabled={loading}>
                                    {loading ? (
                                        <>
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                            Creating...
                                        </>
                                    ) : (
                                        'Create Goal'
                                    )}
                                </Button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}



