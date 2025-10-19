import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import {
    Calendar,
    Clock,
    FileText,
    DollarSign,
    TrendingUp,
    CheckCircle,
    AlertCircle,
    User,
    Star,
    Zap
} from 'lucide-react';
import { DashboardStats, EmployeeProfile, LeaveBalance, Notification } from './types';
// Removed old component imports - now using imported pages instead

// Firebase Services
import { getEmployeeService } from '../../services/employeeService';
import { getComprehensiveDataFlowService } from '../../services/comprehensiveDataFlowService';
import { getTimeTrackingService, TimeEntry } from '../../services/timeTrackingService';
import { getPayrollService } from '../../services/payrollService';
import { useCompany } from '../../context/CompanyContext';
import { useAuth } from '../../context/AuthContext';

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

// Helper function to calculate profile completeness
const calculateRealProfileCompleteness = async (profile: any): Promise<number> => {
    try {
        const dataFlowService = await getComprehensiveDataFlowService();
        return (dataFlowService as any).calculateProfileCompleteness?.(profile) || 85;
    } catch {
        // Fallback calculation if service method not available
        let completeness = 0;
        const fields = [
            profile?.personalInfo?.firstName,
            profile?.personalInfo?.lastName,
            profile?.personalInfo?.dateOfBirth,
            profile?.contactInfo?.email,
            profile?.contactInfo?.phone,
            profile?.workInfo?.position,
            profile?.workInfo?.department,
            profile?.bankingInfo?.bankName,
            profile?.skills?.length > 0,
            profile?.contactInfo?.address?.city
        ];
        completeness = fields.filter(Boolean).length;
        return Math.round((completeness / fields.length) * 100);
    }
};

export default function EmployeeDashboard() {
    const { currentEmployee } = useAuth(); // Get logged-in employee from auth context
    const { companyId, company } = useCompany(); // Get company context for multi-tenancy
    const [stats, setStats] = useState<DashboardStats>({
        totalEmployees: 0,
        activeEmployees: 0,
        pendingRequests: 0,
        upcomingEvents: 0,
        recentActivities: []
    });
    const [profile, setProfile] = useState<EmployeeProfile | null>(mockEmployeeProfile); // Start with mock, update from Firebase
    const [leaveBalances, setLeaveBalances] = useState<LeaveBalance[]>([]);
    const [timeEntriesToday, setTimeEntriesToday] = useState<TimeEntry[]>([]);
    const [recentPayslips, setRecentPayslips] = useState<any[]>([]);
    const [isClockedIn, setIsClockedIn] = useState(false);
    const [latestPayslipAmount, setLatestPayslipAmount] = useState<number>(0);
    const [profileCompleteness, setProfileCompleteness] = useState<number>(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Get employee ID from authenticated user
    const currentEmployeeId = currentEmployee?.employeeId || '';

    console.log('👤 [Dashboard] Current employee:', currentEmployee?.firstName, currentEmployee?.lastName, '(' + currentEmployeeId + ')');

    useEffect(() => {
        const loadDashboardData = async () => {
            // Wait for authentication and company to load
            if (!currentEmployeeId) {
                console.log('⏳ [Dashboard] Waiting for employee authentication...');
                return;
            }

            if (!companyId) {
                console.log('⏳ [Dashboard] Waiting for company to load...');
                return;
            }

            try {
                setLoading(true);
                setError(null);

                console.log(`📊 [Dashboard] Loading dashboard for ${company?.displayName || 'company'}, employee:`, currentEmployeeId);

                // Load all data in parallel for better performance
                const dataFlowService = await getComprehensiveDataFlowService();
                const timeService = await getTimeTrackingService();
                const payrollService = await getPayrollService();

                // Array to collect all activities
                let allActivities: any[] = [];

                // Load employee profile
                try {
                    const employeeProfile = await dataFlowService.getEmployeeProfile(currentEmployeeId);
                    if (employeeProfile) {
                        setProfile(employeeProfile as any);

                        // Use stored profile completeness from profileStatus
                        const storedCompleteness = (employeeProfile as any).profileStatus?.completeness;
                        if (storedCompleteness) {
                            setProfileCompleteness(storedCompleteness);
                            console.log('✅ Loaded employee profile, completeness from profile:', storedCompleteness + '%');
                        } else {
                            // Fallback: calculate if not stored
                            const completeness = await calculateRealProfileCompleteness(employeeProfile);
                            setProfileCompleteness(completeness);
                            console.log('✅ Loaded employee profile, calculated completeness:', completeness + '%');
                        }
                    }
                } catch (err) {
                    console.log('⚠️ Using mock profile data');
                    // Use mock profile's stored completeness or calculate
                    const storedCompleteness = (profile as any)?.profileStatus?.completeness;
                    if (storedCompleteness) {
                        setProfileCompleteness(storedCompleteness);
                    } else {
                        const completeness = await calculateRealProfileCompleteness(profile);
                        setProfileCompleteness(completeness);
                    }
                }

                // Load leave data (filtered by company for multi-tenancy)
                try {
                    const leaveTypes = await dataFlowService.getLeaveTypes();
                    const leaveRequests = await dataFlowService.getLeaveRequests(currentEmployeeId, companyId || undefined);

                    // Calculate real leave balances (match employee platform's LeaveBalance type)
                    const balances: LeaveBalance[] = leaveTypes.map(type => {
                        const usedDays = leaveRequests
                            .filter(r => r.leaveTypeId === type.id && (r.status === 'approved'))
                            .reduce((sum, r) => sum + r.totalDays, 0);

                        const pendingDays = leaveRequests
                            .filter(r => r.leaveTypeId === type.id && r.status === 'pending')
                            .reduce((sum, r) => sum + r.totalDays, 0);

                        const totalEntitlement = type.maxDays || 15;

                        return {
                            id: type.id,
                            employeeId: currentEmployeeId,
                            leaveTypeId: type.id,
                            leaveTypeName: type.name,
                            totalEntitlement: totalEntitlement,
                            used: usedDays,
                            pending: pendingDays,
                            remaining: totalEntitlement - usedDays - pendingDays,
                            accrued: totalEntitlement,
                            year: new Date().getFullYear()
                        };
                    });
                    setLeaveBalances(balances.length > 0 ? balances : mockLeaveBalances);
                    console.log('✅ Loaded leave balances:', balances.length);

                    // Build activities from leave requests
                    const leaveActivities = leaveRequests.slice(0, 3).map(request => ({
                        id: request.id,
                        type: 'leave_request' as const,
                        title: `Leave Request - ${request.status}`,
                        description: `${request.leaveTypeName} (${request.totalDays} days)`,
                        timestamp: request.submittedAt || new Date(),
                        status: request.status.toLowerCase(),
                        employeeId: currentEmployeeId
                    }));
                    allActivities = [...allActivities, ...leaveActivities];

                    // Count pending requests
                    const pendingCount = leaveRequests.filter(r => r.status === 'pending').length;

                    setStats(prev => ({
                        ...prev,
                        pendingRequests: pendingCount
                    }));

                    console.log('✅ Loaded leave requests:', leaveRequests.length, 'pending:', pendingCount);
                } catch (err) {
                    console.error('⚠️ Error loading leave data, using fallback:', err);
                    setLeaveBalances(mockLeaveBalances);
                }

                // Load time entries for today
                try {
                    const timeEntries = await timeService.getTimeEntries(currentEmployeeId);
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);

                    const todayEntries = timeEntries.filter(entry => {
                        const entryDate = new Date(entry.clockIn);
                        entryDate.setHours(0, 0, 0, 0);
                        return entryDate.getTime() === today.getTime();
                    });

                    setTimeEntriesToday(todayEntries);

                    // Check if currently clocked in
                    const activeEntry = todayEntries.find(e => e.status === 'active');
                    setIsClockedIn(!!activeEntry);
                    console.log('✅ Loaded time entries for today:', todayEntries.length, 'Clocked in:', !!activeEntry);

                    // Add time entries to activities
                    const timeActivities = timeEntries.slice(0, 2).map(entry => ({
                        id: entry.id,
                        type: 'time_entry' as const,
                        title: entry.status === 'active' ? 'Currently Clocked In' : 'Time Entry Completed',
                        description: `${new Date(entry.clockIn).toLocaleTimeString()}${entry.clockOut ? ' - ' + new Date(entry.clockOut).toLocaleTimeString() : ' (In Progress)'}`,
                        timestamp: new Date(entry.createdAt),
                        status: entry.status === 'active' ? 'pending' : 'completed',
                        employeeId: currentEmployeeId
                    }));
                    allActivities = [...allActivities, ...timeActivities];
                } catch (err) {
                    console.log('⚠️ No time entries found');
                }

                // Load recent payroll
                try {
                    const payrollRecords = await payrollService.getMyPayrollRecords(currentEmployeeId);
                    setRecentPayslips(payrollRecords.slice(0, 3));

                    // Get latest payslip amount
                    if (payrollRecords.length > 0) {
                        setLatestPayslipAmount(payrollRecords[0].netPay || 0);
                    }
                    console.log('✅ Loaded payroll records:', payrollRecords.length);

                    // Add payroll to activities
                    if (payrollRecords.length > 0) {
                        const payrollActivity = {
                            id: payrollRecords[0].id,
                            type: 'document_upload' as const,
                            title: 'New Payslip Available',
                            description: `Net Pay: ₦${payrollRecords[0].netPay?.toLocaleString() || 0}`,
                            timestamp: new Date(payrollRecords[0].createdAt),
                            status: 'completed',
                            employeeId: currentEmployeeId
                        };
                        allActivities = [...allActivities, payrollActivity];
                    }
                } catch (err) {
                    console.log('⚠️ No payroll records found');
                }

                // Sort all activities by timestamp and update state
                allActivities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
                setStats(prev => ({
                    ...prev,
                    recentActivities: allActivities.slice(0, 5)
                }));

                setLoading(false);
                console.log('✅ Dashboard data loaded successfully');
                console.log('📋 Total activities:', allActivities.length);
            } catch (err) {
                console.error('❌ Error loading dashboard data:', err);
                setError(null); // Don't show error, fallback to mock data
                setLeaveBalances(mockLeaveBalances);
                setLoading(false);
            }
        };

        loadDashboardData();
    }, [currentEmployeeId, companyId]); // Re-load when company changes for multi-tenancy

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
                            Welcome back, {profile?.personalInfo.firstName || 'User'}!
                        </h1>
                        <p className="text-muted-foreground mt-2">
                            Here's what's happening with your account today.
                        </p>
                    </div>
                    {/* Clock Status Indicator */}
                    {isClockedIn && (
                        <Badge className="bg-green-500 text-white px-4 py-2 text-sm flex items-center gap-2">
                            <Clock className="h-4 w-4 animate-pulse" />
                            Currently Clocked In
                        </Badge>
                    )}
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card className="hover:shadow-lg transition-shadow border-l-4 border-l-primary">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Leave Balance</CardTitle>
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-primary">
                                {leaveBalances.reduce((sum, b) => sum + b.remaining, 0) || 0}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                                Days remaining this year
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="hover:shadow-lg transition-shadow border-l-4 border-l-warning">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Pending Requests</CardTitle>
                            <AlertCircle className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-warning">{stats.pendingRequests}</div>
                            <p className="text-xs text-muted-foreground mt-1">
                                Awaiting approval
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="hover:shadow-lg transition-shadow border-l-4 border-l-success">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Profile Status</CardTitle>
                            <CheckCircle className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-success">{profileCompleteness}%</div>
                            <p className="text-xs text-muted-foreground mt-1">
                                Profile complete
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Quick Actions */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Quick Actions</CardTitle>
                        <CardDescription>Access your most common tasks</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                            <Link to="/time">
                                <Button
                                    variant="outline"
                                    className="h-40 w-full flex flex-col items-center justify-center gap-4 hover:bg-accent hover:border-primary transition-all p-6"
                                >
                                    <Clock className="h-12 w-12 text-primary" />
                                    <span className="text-base font-medium">Clock In/Out</span>
                                </Button>
                            </Link>

                            <Link to="/leave">
                                <Button
                                    variant="outline"
                                    className="h-40 w-full flex flex-col items-center justify-center gap-4 hover:bg-accent hover:border-primary transition-all p-6"
                                >
                                    <Calendar className="h-12 w-12 text-primary" />
                                    <span className="text-base font-medium">Request Leave</span>
                                </Button>
                            </Link>

                            <Link to="/profile">
                                <Button
                                    variant="outline"
                                    className="h-40 w-full flex flex-col items-center justify-center gap-4 hover:bg-accent hover:border-primary transition-all p-6"
                                >
                                    <User className="h-12 w-12 text-primary" />
                                    <span className="text-base font-medium">My Profile</span>
                                </Button>
                            </Link>

                            <Link to="/payroll">
                                <Button
                                    variant="outline"
                                    className="h-40 w-full flex flex-col items-center justify-center gap-4 hover:bg-accent hover:border-primary transition-all p-6"
                                >
                                    <DollarSign className="h-12 w-12 text-primary" />
                                    <span className="text-base font-medium">View Payslip</span>
                                </Button>
                            </Link>
                        </div>
                    </CardContent>
                </Card>

                {/* Recent Activities */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Clock className="h-5 w-5" />
                            Recent Activities
                        </CardTitle>
                        <CardDescription>
                            Your latest updates and requests
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {stats.recentActivities.length > 0 ? (
                            stats.recentActivities.map((activity, index) => (
                                <div key={`${activity.type}-${activity.id}-${index}`} className="flex items-start gap-3 p-4 rounded-lg border hover:bg-muted/50 transition-colors">
                                    <div className="flex-shrink-0 mt-0.5">
                                        {getActivityIcon(activity.type)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-foreground">
                                            {activity.title}
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                            {activity.description}
                                        </p>
                                        <div className="flex items-center gap-2 mt-2">
                                            <Badge className={getStatusColor(activity.status)}>
                                                {activity.status}
                                            </Badge>
                                            <span className="text-xs text-muted-foreground">
                                                {formatDate(activity.timestamp)}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-8 text-muted-foreground">
                                <Clock className="h-12 w-12 mx-auto mb-3 opacity-50" />
                                <p>No recent activities</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
