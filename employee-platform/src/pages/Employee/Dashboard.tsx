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
    const [profile, setProfile] = useState<EmployeeProfile | null>(null);
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
                    const leaveTypes = await dataFlowService.getLeaveTypes(companyId || undefined);
                    const leaveRequests = await dataFlowService.getLeaveRequests(currentEmployeeId, companyId || undefined);

                    console.log('📊 [Dashboard] Leave types loaded:', leaveTypes.length);
                    console.log('📊 [Dashboard] Leave types (raw):', leaveTypes.map(t => ({ 
                        id: t.id || 'NO-ID', 
                        name: t.name, 
                        maxDays: t.maxDays || t.daysAllowed,
                        isActive: t.isActive 
                    })));

                    // Deduplicate leave types - keep unique by ID (in case same leave type appears multiple times)
                    // Use a Map to ensure we only keep one per ID, but also allow types without IDs
                    const uniqueLeaveTypesMap = new Map<string, typeof leaveTypes[0]>();
                    leaveTypes.forEach(type => {
                        if (type.id) {
                            // If has ID, use it for deduplication
                            if (!uniqueLeaveTypesMap.has(type.id)) {
                                uniqueLeaveTypesMap.set(type.id, type);
                            }
                        } else {
                            // If no ID, use name as key (fallback)
                            const key = type.name || `no-id-${uniqueLeaveTypesMap.size}`;
                            if (!uniqueLeaveTypesMap.has(key)) {
                                uniqueLeaveTypesMap.set(key, type);
                            }
                        }
                    });
                    const uniqueLeaveTypes = Array.from(uniqueLeaveTypesMap.values());

                    console.log('📊 [Dashboard] Total leave types loaded:', leaveTypes.length);
                    console.log('📊 [Dashboard] Unique leave types (after deduplication):', uniqueLeaveTypes.length);
                    console.log('📊 [Dashboard] Leave type details:', uniqueLeaveTypes.map(t => ({ 
                        id: t.id, 
                        name: t.name, 
                        maxDays: t.maxDays 
                    })));

                    // Try to get actual leave balances from Firebase first
                    const balanceMap = new Map<string, {
                        id: string;
                        employeeId: string;
                        leaveTypeId: string;
                        leaveTypeName: string;
                        totalEntitlement: number;
                        used: number;
                        pending: number;
                        remaining: number;
                        accrued: number;
                        year: number;
                    }>();

                    try {
                        const actualBalances = await dataFlowService.getLeaveBalances(currentEmployeeId, companyId || undefined);
                        if (actualBalances && actualBalances.length > 0) {
                            console.log('✅ [Dashboard] Using actual leave balances from Firebase');
                            actualBalances.forEach(bal => {
                                const key = bal.leaveTypeId || bal.leaveTypeName || `${bal.employeeId}_${bal.id}`;
                                const relatedType = uniqueLeaveTypes.find(t => t.id === bal.leaveTypeId || t.name === bal.leaveTypeName);
                                const totalDays = bal.totalDays ?? relatedType?.maxDays ?? relatedType?.daysAllowed ?? 0;
                                const usedDays = bal.usedDays ?? 0;
                                const pendingDays = bal.pendingDays ?? 0;
                                const storedRemaining = bal.remainingDays ?? 0;
                                const calculatedRemaining = totalDays - usedDays - pendingDays;
                                const remaining = storedRemaining > 0 ? storedRemaining : calculatedRemaining;

                                balanceMap.set(key, {
                                    id: bal.id || `${bal.employeeId}_${key}`,
                                    employeeId: bal.employeeId,
                                    leaveTypeId: key,
                                    leaveTypeName: relatedType?.name || bal.leaveTypeName || 'Unknown',
                                    totalEntitlement: totalDays,
                                    used: usedDays,
                                    pending: pendingDays,
                                    remaining: remaining,
                                    accrued: bal.accruedDays || totalDays,
                                    year: bal.year || new Date().getFullYear()
                                });
                            });
                        }
                    } catch (balanceError) {
                        console.warn('⚠️ [Dashboard] Could not load actual balances, calculating from types:', balanceError);
                    }

                    // Ensure every leave type has a balance entry and sync entitlements/remaining totals
                    uniqueLeaveTypes.forEach(type => {
                        const key = type.id || type.name || `type-${type.color}-${type.maxDays}`;
                        const totalEntitlement = Number(type.maxDays ?? (type as any).daysAllowed ?? 0) || 0;

                        // Aggregate used/pending days from existing leave requests as a fallback
                        const typeRequests = leaveRequests.filter(r =>
                            r.leaveTypeId === type.id ||
                            r.leaveTypeName === type.name ||
                            r.leaveTypeId === key
                        );
                        const usedDaysFromRequests = typeRequests
                            .filter(r => r.status === 'approved' || r.status === 'Approved')
                            .reduce((sum, r) => sum + (r.totalDays || 0), 0);
                        const pendingDaysFromRequests = typeRequests
                            .filter(r => r.status === 'pending' || r.status === 'Pending')
                            .reduce((sum, r) => sum + (r.totalDays || 0), 0);

                        const existingBalance = balanceMap.get(key);
                        if (existingBalance) {
                            const used = existingBalance.used ?? usedDaysFromRequests;
                            const pending = existingBalance.pending ?? pendingDaysFromRequests;
                            const remaining = Math.max(0, (totalEntitlement || existingBalance.totalEntitlement || 0) - used - pending);
                            balanceMap.set(key, {
                                ...existingBalance,
                                leaveTypeId: key,
                                leaveTypeName: type.name || existingBalance.leaveTypeName || 'Unknown',
                                totalEntitlement: totalEntitlement || existingBalance.totalEntitlement || 0,
                                used,
                                pending,
                                remaining,
                                accrued: existingBalance.accrued || totalEntitlement || existingBalance.totalEntitlement || 0,
                                year: existingBalance.year || new Date().getFullYear()
                            });
                        } else {
                            const remaining = Math.max(0, totalEntitlement - usedDaysFromRequests - pendingDaysFromRequests);
                            balanceMap.set(key, {
                                id: `${key}_${currentEmployeeId}`,
                                employeeId: currentEmployeeId,
                                leaveTypeId: key,
                                leaveTypeName: type.name || 'Unknown',
                                totalEntitlement,
                                used: usedDaysFromRequests,
                                pending: pendingDaysFromRequests,
                                remaining,
                                accrued: totalEntitlement,
                                year: new Date().getFullYear()
                            });
                        }
                    });

                    // Get merged balances
                    const mergedBalancesArray = Array.from(balanceMap.values());
                    const mergedBalances = mergedBalancesArray;
                    const normalizeTypeKey = (balance: typeof mergedBalances[number]) => {
                        const rawName = balance.leaveTypeName || '';
                        const simplifiedName = rawName
                            .toLowerCase()
                            .replace(/\(.*?\)/g, '')
                            .replace(/-.*/g, '')
                            .trim();
                        const rawId = (balance.leaveTypeId || '').toLowerCase();
                        return simplifiedName || rawId || balance.id;
                    };

                    const clampedBalances = mergedBalances.map(balance => ({
                        ...balance,
                        remaining: Math.max(
                            0,
                            Math.min(
                                balance.totalEntitlement,
                                balance.remaining ?? 0
                            )
                        ),
                        used: Math.min(balance.totalEntitlement, balance.used ?? 0),
                        pending: Math.min(balance.totalEntitlement, balance.pending ?? 0)
                    }));

                    // Deduplicate balances that may exist multiple times per leave type
                    const dedupedBalanceMap = new Map<string, typeof clampedBalances[number]>();
                    clampedBalances.forEach(balance => {
                        const key = normalizeTypeKey(balance);
                        if (!dedupedBalanceMap.has(key)) {
                            dedupedBalanceMap.set(key, balance);
                        } else {
                            const existing = dedupedBalanceMap.get(key)!;
                            dedupedBalanceMap.set(key, {
                                ...existing,
                                totalEntitlement: Math.max(existing.totalEntitlement, balance.totalEntitlement),
                                used: Math.max(existing.used, balance.used),
                                pending: Math.max(existing.pending, balance.pending),
                                remaining: Math.max(existing.remaining, balance.remaining),
                                accrued: Math.max(existing.accrued ?? 0, balance.accrued ?? 0)
                            });
                        }
                    });

                    const finalBalances = Array.from(dedupedBalanceMap.values()).map(balance => {
                        const totalEntitlement = balance.totalEntitlement ?? 0;
                        const used = Math.min(totalEntitlement, balance.used ?? 0);
                        const pending = Math.min(totalEntitlement - used, balance.pending ?? 0);
                        const remaining = Math.max(0, totalEntitlement - used - pending);
                        return {
                            ...balance,
                            totalEntitlement,
                            used,
                            pending,
                            remaining
                        };
                    });

                    setLeaveBalances(finalBalances);
                    const totalRemaining = finalBalances.reduce((sum, b) => sum + (b.remaining || 0), 0);
                    console.log('✅ [Dashboard] Loaded leave balances:', finalBalances.length);
                    console.log('📊 [Dashboard] Total remaining days (calculated):', totalRemaining);
                    console.log('📊 [Dashboard] Balance breakdown:', finalBalances.map(b => ({
                        name: b.leaveTypeName,
                        total: b.totalEntitlement,
                        used: b.used,
                        pending: b.pending,
                        remaining: b.remaining
                    })));

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
                    console.error('⚠️ Error loading leave data:', err);
                    setLeaveBalances([]);
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
                setError('Failed to load dashboard data');
                setLeaveBalances([]);
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
                            <CardTitle className="text-sm font-medium">Total Leave Balance</CardTitle>
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-primary">
                                {leaveBalances.reduce((sum, b) => sum + (b.remaining || 0), 0)}
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
