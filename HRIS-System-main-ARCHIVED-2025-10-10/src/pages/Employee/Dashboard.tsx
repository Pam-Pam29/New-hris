import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import {
    Calendar,
    Clock,
    FileText,
    DollarSign,
    Bell,
    Settings,
    TrendingUp,
    CheckCircle,
    AlertCircle,
    User,
    Phone,
    Mail,
    MapPin,
    Star
} from 'lucide-react';
import { DashboardStats, EmployeeProfile, LeaveBalance, Notification } from './types';
import { NotificationSystem } from '../../components/NotificationSystem';
import { SimpleProfileManager } from '../../components/SimpleProfileManager';
import { LeaveManagementSystem } from '../../components/LeaveManagementSystem';
import { PolicyManagementSystem } from '../../components/PolicyManagementSystem';
import { PerformanceManagementSystem } from '../../components/PerformanceManagementSystem';

// Mock data - replace with actual API calls
const mockDashboardStats: DashboardStats = {
    totalEmployees: 1,
    activeEmployees: 1,
    pendingRequests: 3,
    upcomingEvents: 2,
    recentActivities: [
        {
            id: '1',
            type: 'leave_request',
            title: 'Leave Request Submitted',
            description: 'Annual leave request for Dec 15-20, 2024',
            timestamp: new Date('2024-12-10T10:30:00'),
            status: 'pending',
            employeeId: 'emp-001'
        },
        {
            id: '2',
            type: 'time_entry',
            title: 'Time Entry Updated',
            description: 'Clock out time adjusted for Dec 9, 2024',
            timestamp: new Date('2024-12-09T18:45:00'),
            status: 'completed',
            employeeId: 'emp-001'
        },
        {
            id: '3',
            type: 'document_upload',
            title: 'Document Uploaded',
            description: 'Tax form W-4 uploaded successfully',
            timestamp: new Date('2024-12-08T14:20:00'),
            status: 'completed',
            employeeId: 'emp-001'
        }
    ]
};

const mockEmployeeProfile: EmployeeProfile = {
    id: 'emp-001',
    personalInfo: {
        firstName: 'John',
        lastName: 'Doe',
        dateOfBirth: new Date('1990-05-15'),
        gender: 'male',
        nationality: 'US',
        maritalStatus: 'single',
        nationalId: '123-45-6789'
    },
    contactInfo: {
        email: 'john.doe@company.com',
        workEmail: 'john.doe@company.com',
        phone: '+1 (555) 123-4567',
        address: {
            street: '123 Main St',
            city: 'New York',
            state: 'NY',
            postalCode: '10001',
            country: 'USA'
        },
        emergencyContact: {
            id: 'ec-001',
            name: 'Jane Doe',
            relationship: 'Sister',
            phone: '+1 (555) 987-6543',
            isPrimary: true
        }
    },
    bankingInfo: {
        bankName: 'Chase Bank',
        accountNumber: '****1234',
        accountType: 'checking'
    },
    documents: [],
    skills: [],
    emergencyContacts: [],
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-12-10')
};

const mockLeaveBalances: LeaveBalance[] = [
    {
        id: 'lb-001',
        employeeId: 'emp-001',
        leaveTypeId: 'lt-001',
        leaveTypeName: 'Annual Leave',
        totalEntitlement: 20,
        used: 8,
        remaining: 12,
        pending: 2,
        accrued: 20,
        year: 2024
    },
    {
        id: 'lb-002',
        employeeId: 'emp-001',
        leaveTypeId: 'lt-002',
        leaveTypeName: 'Sick Leave',
        totalEntitlement: 10,
        used: 2,
        remaining: 8,
        pending: 0,
        accrued: 10,
        year: 2024
    }
];

const mockNotifications: Notification[] = [
    {
        id: 'notif-001',
        employeeId: 'emp-001',
        type: 'info',
        title: 'Payroll Update',
        message: 'Your December 2024 payslip is now available',
        read: false,
        createdAt: new Date('2024-12-10T09:00:00'),
        actionUrl: '/employee/payroll',
        actionText: 'View Payslip'
    },
    {
        id: 'notif-002',
        employeeId: 'emp-001',
        type: 'warning',
        title: 'Document Expiry',
        message: 'Your driver\'s license expires in 30 days',
        read: false,
        createdAt: new Date('2024-12-09T14:30:00'),
        actionUrl: '/employee/documents',
        actionText: 'Update Document'
    }
];

export default function EmployeeDashboard() {
    const [stats] = useState<DashboardStats>(mockDashboardStats);
    const [profile] = useState<EmployeeProfile>(mockEmployeeProfile);
    const [leaveBalances] = useState<LeaveBalance[]>(mockLeaveBalances);
    const [notifications] = useState<Notification[]>(mockNotifications);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Simulate API loading
        const timer = setTimeout(() => {
            setLoading(false);
        }, 1000);

        return () => clearTimeout(timer);
    }, []);

    const getActivityIcon = (type: string) => {
        switch (type) {
            case 'leave_request': return <Calendar className="h-4 w-4" />;
            case 'time_entry': return <Clock className="h-4 w-4" />;
            case 'document_upload': return <FileText className="h-4 w-4" />;
            case 'policy_acknowledgment': return <CheckCircle className="h-4 w-4" />;
            case 'performance_review': return <Star className="h-4 w-4" />;
            default: return <Clock className="h-4 w-4" />;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending': return 'bg-yellow-100 text-yellow-800';
            case 'completed': return 'bg-green-100 text-green-800';
            case 'failed': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const formatDate = (date: Date) => {
        return new Intl.DateTimeFormat('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }).format(date);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 p-6">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-foreground">
                            Welcome back, {profile.personalInfo.firstName}!
                        </h1>
                        <p className="text-muted-foreground mt-2">
                            Here's what's happening with your account today.
                        </p>
                    </div>
                    <div className="flex items-center space-x-4">
                        <NotificationSystem employeeId="emp-001" />
                        <Button variant="outline" size="sm">
                            <Settings className="h-4 w-4 mr-2" />
                            Settings
                        </Button>
                    </div>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Leave Balance</CardTitle>
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{leaveBalances[0]?.remaining || 0}</div>
                            <p className="text-xs text-muted-foreground">
                                Days remaining this year
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Pending Requests</CardTitle>
                            <AlertCircle className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.pendingRequests}</div>
                            <p className="text-xs text-muted-foreground">
                                Awaiting approval
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Upcoming Events</CardTitle>
                            <Clock className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.upcomingEvents}</div>
                            <p className="text-xs text-muted-foreground">
                                This week
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Performance Score</CardTitle>
                            <TrendingUp className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">4.2</div>
                            <p className="text-xs text-muted-foreground">
                                Out of 5.0
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Main Content */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column - Profile & Quick Actions */}
                    <div className="space-y-6">
                        {/* Profile Card */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center space-x-2">
                                    <User className="h-5 w-5" />
                                    <span>Profile Overview</span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center space-x-4">
                                    <Avatar className="h-16 w-16">
                                        <AvatarImage src={profile.personalInfo.profilePhoto} />
                                        <AvatarFallback>
                                            {profile.personalInfo.firstName[0]}{profile.personalInfo.lastName[0]}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <h3 className="font-semibold">
                                            {profile.personalInfo.firstName} {profile.personalInfo.lastName}
                                        </h3>
                                        <p className="text-sm text-muted-foreground">Software Engineer</p>
                                        <p className="text-sm text-muted-foreground">Engineering Department</p>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <div className="flex items-center space-x-2 text-sm">
                                        <Mail className="h-4 w-4 text-muted-foreground" />
                                        <span>{profile.contactInfo.email}</span>
                                    </div>
                                    <div className="flex items-center space-x-2 text-sm">
                                        <Phone className="h-4 w-4 text-muted-foreground" />
                                        <span>{profile.contactInfo.phone}</span>
                                    </div>
                                    <div className="flex items-center space-x-2 text-sm">
                                        <MapPin className="h-4 w-4 text-muted-foreground" />
                                        <span>{profile.contactInfo.address.city}, {profile.contactInfo.address.state}</span>
                                    </div>
                                </div>

                                <Button className="w-full" variant="outline">
                                    <User className="h-4 w-4 mr-2" />
                                    Edit Profile
                                </Button>
                            </CardContent>
                        </Card>

                        {/* Leave Balances */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center space-x-2">
                                    <Calendar className="h-5 w-5" />
                                    <span>Leave Balances</span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {leaveBalances.map((balance) => (
                                    <div key={balance.id} className="space-y-2">
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm font-medium">{balance.leaveTypeName}</span>
                                            <span className="text-sm text-muted-foreground">
                                                {balance.remaining}/{balance.totalEntitlement}
                                            </span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-2">
                                            <div
                                                className="bg-primary h-2 rounded-full"
                                                style={{ width: `${(balance.remaining / balance.totalEntitlement) * 100}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                ))}
                                <Button className="w-full" variant="outline" size="sm">
                                    <Calendar className="h-4 w-4 mr-2" />
                                    Request Leave
                                </Button>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Center Column - Main Dashboard */}
                    <div className="lg:col-span-2 space-y-6">
                        <Tabs defaultValue="overview" className="space-y-4">
                            <TabsList className="grid w-full grid-cols-6">
                                <TabsTrigger value="overview">Overview</TabsTrigger>
                                <TabsTrigger value="profile">Profile</TabsTrigger>
                                <TabsTrigger value="leave">Leave</TabsTrigger>
                                <TabsTrigger value="policies">Policies</TabsTrigger>
                                <TabsTrigger value="performance">Performance</TabsTrigger>
                                <TabsTrigger value="time">Time</TabsTrigger>
                            </TabsList>

                            <TabsContent value="overview" className="space-y-4">
                                {/* TEST CONTENT */}
                                <div style={{ padding: '20px', border: '2px solid blue', backgroundColor: 'lightgreen' }}>
                                    <h1>OVERVIEW TAB TEST</h1>
                                    <p>This is in the Overview tab!</p>
                                </div>

                                {/* Recent Activities */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center space-x-2">
                                            <Clock className="h-5 w-5" />
                                            <span>Recent Activities</span>
                                        </CardTitle>
                                        <CardDescription>
                                            Your latest activities and updates
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        {stats.recentActivities.map((activity) => (
                                            <div key={activity.id} className="flex items-start space-x-3 p-3 rounded-lg border">
                                                <div className="flex-shrink-0">
                                                    {getActivityIcon(activity.type)}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium text-foreground">
                                                        {activity.title}
                                                    </p>
                                                    <p className="text-sm text-muted-foreground">
                                                        {activity.description}
                                                    </p>
                                                    <div className="flex items-center space-x-2 mt-2">
                                                        <Badge className={getStatusColor(activity.status)}>
                                                            {activity.status}
                                                        </Badge>
                                                        <span className="text-xs text-muted-foreground">
                                                            {formatDate(activity.timestamp)}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </CardContent>
                                </Card>

                                {/* Quick Actions */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Quick Actions</CardTitle>
                                        <CardDescription>
                                            Common tasks and shortcuts
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                            <Button variant="outline" className="h-20 flex flex-col space-y-2">
                                                <Clock className="h-6 w-6" />
                                                <span className="text-xs">Clock In/Out</span>
                                            </Button>
                                            <Button variant="outline" className="h-20 flex flex-col space-y-2">
                                                <Calendar className="h-6 w-6" />
                                                <span className="text-xs">Request Leave</span>
                                            </Button>
                                            <Button variant="outline" className="h-20 flex flex-col space-y-2">
                                                <FileText className="h-6 w-6" />
                                                <span className="text-xs">Upload Document</span>
                                            </Button>
                                            <Button variant="outline" className="h-20 flex flex-col space-y-2">
                                                <DollarSign className="h-6 w-6" />
                                                <span className="text-xs">View Payslip</span>
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            <TabsContent value="profile" className="space-y-4">
                                {console.log('Profile tab content is rendering!')}
                                <div style={{ padding: '20px', border: '2px solid red', backgroundColor: 'yellow' }}>
                                    <h1>PROFILE TAB TEST</h1>
                                    <p>This should be visible!</p>
                                    <button onClick={() => console.log('Simple button clicked!')}>
                                        Click Me!
                                    </button>
                                </div>

                                {/* Test EmployeeProfileManager with error boundary */}
                                <div style={{ padding: '20px', border: '2px solid green', backgroundColor: 'lightblue' }}>
                                    <h2>Testing EmployeeProfileManager:</h2>
                                    <p>Console should show debug messages...</p>
                                    <SimpleProfileManager employeeId="emp-001" mode="employee" />
                                </div>
                            </TabsContent>

                            <TabsContent value="leave" className="space-y-4">
                                <LeaveManagementSystem employeeId="emp-001" mode="employee" />
                            </TabsContent>

                            <TabsContent value="policies" className="space-y-4">
                                <PolicyManagementSystem employeeId="emp-001" mode="employee" />
                            </TabsContent>

                            <TabsContent value="performance" className="space-y-4">
                                <PerformanceManagementSystem employeeId="emp-001" mode="employee" />
                            </TabsContent>

                            <TabsContent value="time" className="space-y-4">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Time Management</CardTitle>
                                        <CardDescription>
                                            Track your work hours and attendance
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-center py-8">
                                            <Clock className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                                            <p className="text-muted-foreground">Time management features coming soon</p>
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>

                        </Tabs>
                    </div>
                </div>

                {/* Notifications Panel */}
                {notifications.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center space-x-2">
                                <Bell className="h-5 w-5" />
                                <span>Notifications</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {notifications.map((notification) => (
                                    <div key={notification.id} className="flex items-start space-x-3 p-3 rounded-lg border">
                                        <div className={`flex-shrink-0 w-2 h-2 rounded-full mt-2 ${notification.read ? 'bg-gray-300' : 'bg-blue-500'
                                            }`} />
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-foreground">
                                                {notification.title}
                                            </p>
                                            <p className="text-sm text-muted-foreground">
                                                {notification.message}
                                            </p>
                                            <div className="flex items-center space-x-2 mt-2">
                                                <span className="text-xs text-muted-foreground">
                                                    {formatDate(notification.createdAt)}
                                                </span>
                                                {notification.actionUrl && (
                                                    <Button variant="link" size="sm" className="h-auto p-0">
                                                        {notification.actionText}
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
}
