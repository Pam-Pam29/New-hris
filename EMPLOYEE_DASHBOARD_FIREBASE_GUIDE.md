# 🔧 Employee Dashboard Firebase Integration Guide

**File:** `employee-platform/src/pages/Employee/Dashboard.tsx`  
**Current State:** Uses mock data  
**Target State:** Real-time Firebase data

---

## 📋 Changes Required

### Step 1: Add Firebase Service Imports

**Add after line 27:**
```typescript
// Firebase Services
import { getEmployeeService } from '../../services/employeeService';
import { getLeaveService } from '../../services/leaveService';
import { getDataFlowService } from '../../services/dataFlowService';
```

### Step 2: Replace Mock Data with Firebase State

**Replace lines 162-166:**
```typescript
// BEFORE (Mock):
const [stats] = useState<DashboardStats>(mockDashboardStats);
const [profile] = useState<EmployeeProfile>(mockEmployeeProfile);
const [leaveBalances] = useState<LeaveBalance[]>(mockLeaveBalances);
const [notifications] = useState<Notification[]>(mockNotifications);
const [loading, setLoading] = useState(true);

// AFTER (Firebase):
const [stats, setStats] = useState<DashboardStats>({
    totalEmployees: 0,
    activeEmployees: 0,
    pendingRequests: 0,
    upcomingEvents: 0,
    recentActivities: []
});
const [profile, setProfile] = useState<EmployeeProfile | null>(null);
const [leaveBalances, setLeaveBalances] = useState<LeaveBalance[]>([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState<string | null>(null);

const currentEmployeeId = 'emp-001'; // TODO: Get from auth context
```

### Step 3: Load Real Data from Firebase

**Replace lines 168-175 (useEffect):**
```typescript
useEffect(() => {
    const loadDashboardData = async () => {
        try {
            setLoading(true);
            setError(null);

            // Load employee profile
            const employeeService = await getEmployeeService();
            const employees = await employeeService.getEmployees();
            const currentEmployee = employees.find(e => e.id === currentEmployeeId);
            
            if (currentEmployee) {
                // Map employee data to EmployeeProfile interface
                setProfile({
                    id: currentEmployee.id,
                    personalInfo: {
                        firstName: currentEmployee.firstName || '',
                        lastName: currentEmployee.lastName || '',
                        dateOfBirth: currentEmployee.dateOfBirth || new Date(),
                        gender: currentEmployee.gender || 'other',
                        nationality: currentEmployee.nationality || '',
                        maritalStatus: currentEmployee.maritalStatus || 'single',
                        nationalId: currentEmployee.nationalId || ''
                    },
                    contactInfo: {
                        email: currentEmployee.email || '',
                        workEmail: currentEmployee.workEmail || currentEmployee.email || '',
                        phone: currentEmployee.phone || '',
                        address: {
                            street: '',
                            city: '',
                            state: '',
                            postalCode: '',
                            country: ''
                        },
                        emergencyContact: {
                            id: 'ec-001',
                            name: '',
                            relationship: '',
                            phone: '',
                            isPrimary: true
                        }
                    },
                    bankingInfo: {
                        bankName: '',
                        accountNumber: '',
                        accountType: 'checking'
                    },
                    workInfo: {
                        employeeId: currentEmployee.id,
                        position: currentEmployee.position || '',
                        department: currentEmployee.department || '',
                        hireDate: currentEmployee.hireDate || new Date(),
                        employmentType: 'full_time',
                        workLocation: 'office',
                        reportsTo: currentEmployee.reportsTo || '',
                        salary: {
                            amount: 0,
                            currency: 'USD',
                            payFrequency: 'monthly'
                        }
                    }
                });
            }

            // Load leave balances
            const leaveService = await getLeaveService();
            const leaveTypes = await leaveService.getLeaveTypes();
            const balances: LeaveBalance[] = leaveTypes.map(type => ({
                id: type.id,
                type: type.name,
                total: type.defaultDays || 0,
                used: 0, // TODO: Calculate from leave requests
                remaining: type.defaultDays || 0,
                accrued: type.defaultDays || 0,
                year: new Date().getFullYear()
            }));
            setLeaveBalances(balances);

            // Load recent activities (from leave requests)
            const leaveRequests = await leaveService.getMyLeaveRequests(currentEmployeeId);
            const activities = leaveRequests.slice(0, 5).map(request => ({
                id: request.id,
                type: 'leave_request' as const,
                title: `Leave Request ${request.status}`,
                description: `${request.leaveType} leave for ${request.duration} days`,
                timestamp: request.submittedAt || new Date(),
                status: request.status.toLowerCase(),
                employeeId: currentEmployeeId
            }));

            // Update stats
            setStats({
                totalEmployees: 1,
                activeEmployees: 1,
                pendingRequests: leaveRequests.filter(r => r.status === 'Pending').length,
                upcomingEvents: 0,
                recentActivities: activities
            });

            setLoading(false);
        } catch (err) {
            console.error('Error loading dashboard data:', err);
            setError('Failed to load dashboard data. Please try again.');
            setLoading(false);
        }
    };

    loadDashboardData();
}, [currentEmployeeId]);
```

### Step 4: Remove Mock Notifications Panel

**Delete lines 560-593** (Notifications Panel section)

**Why:** Notifications are now in the header via NotificationSystem component!

**Replace with:**
```typescript
{/* Notifications are now in the header */}
```

### Step 5: Add Error Handling UI

**Add after line 213 (after loading check):**
```typescript
if (error) {
    return (
        <div className="flex items-center justify-center min-h-screen">
            <Card className="w-96">
                <CardHeader>
                    <CardTitle className="text-destructive">Error Loading Dashboard</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground mb-4">{error}</p>
                    <Button onClick={() => window.location.reload()}>
                        Retry
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}

if (!profile) {
    return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
                <p className="text-muted-foreground">No profile data found</p>
                <Button className="mt-4" onClick={() => window.location.reload()}>
                    Reload
                </Button>
            </div>
        </div>
    );
}
```

### Step 6: Update Leave Balance Display

**Update line 250:**
```typescript
// BEFORE:
<div className="text-2xl font-bold">{leaveBalances[0]?.remaining || 0}</div>

// AFTER:
<div className="text-2xl font-bold">
    {leaveBalances.reduce((sum, b) => sum + b.remaining, 0)}
</div>
```

### Step 7: Update Pending Requests Display

**Update line 267:**
```typescript
// BEFORE:
<div className="text-2xl font-bold">{stats.pendingRequests}</div>

// AFTER (already correct, but ensure it's using stats from Firebase):
<div className="text-2xl font-bold">{stats.pendingRequests}</div>
```

---

## 🧪 Testing the Changes

### 1. Start the development server:
```bash
cd employee-platform
npm run dev
```

### 2. Open http://localhost:3002

### 3. Verify:
- ✅ Employee name shows correctly in header
- ✅ Leave balances load from Firebase
- ✅ Recent activities show leave requests
- ✅ No errors in console
- ✅ Loading spinner shows while data loads
- ✅ No mock data visible

### 4. Check Firebase Console:
- Employees collection has data
- Leave types collection exists
- Leave requests collection has entries

---

## 🎨 Optional Enhancements

### Add Quick Action Widgets

**Add after line 300 (after quick stats):**
```typescript
{/* Quick Actions */}
<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
    <Card className="hover:shadow-lg transition-shadow cursor-pointer">
        <CardHeader>
            <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                Request Leave
            </CardTitle>
            <CardDescription>
                Submit a new leave request
            </CardDescription>
        </CardHeader>
        <CardContent>
            <Button className="w-full" onClick={() => window.location.href = '/employee/leave'}>
                Create Request
            </Button>
        </CardContent>
    </Card>

    <Card className="hover:shadow-lg transition-shadow cursor-pointer">
        <CardHeader>
            <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" />
                Clock In/Out
            </CardTitle>
            <CardDescription>
                Track your time
            </CardDescription>
        </CardHeader>
        <CardContent>
            <Button className="w-full" onClick={() => window.location.href = '/employee/time'}>
                Manage Time
            </Button>
        </CardContent>
    </Card>
</div>
```

---

## 🔄 Before & After

### Before (Mock Data):
```typescript
const [profile] = useState<EmployeeProfile>(mockEmployeeProfile);  // ❌ Static
const [leaveBalances] = useState<LeaveBalance[]>(mockLeaveBalances);  // ❌ Static
const [notifications] = useState<Notification[]>(mockNotifications);  // ❌ Static
```

### After (Firebase):
```typescript
const [profile, setProfile] = useState<EmployeeProfile | null>(null);  // ✅ Dynamic
const [leaveBalances, setLeaveBalances] = useState<LeaveBalance[]>([]);  // ✅ Live
// Notifications removed (now in header)  // ✅ Deduplicated
```

---

## ✅ Checklist

- [ ] Import Firebase services
- [ ] Replace mock state with Firebase state
- [ ] Add currentEmployeeId constant
- [ ] Implement loadDashboardData useEffect
- [ ] Add error handling
- [ ] Remove notifications panel (redundant)
- [ ] Update leave balance calculation
- [ ] Test Firebase connection
- [ ] Verify data loads correctly
- [ ] Add quick action widgets (optional)

---

## 🚀 Next Steps

After implementing:
1. Test with real Firebase data
2. Verify all features work
3. Check mobile responsive
4. Polish UI/UX
5. Ship to production!

---

**Estimated Implementation Time:** 1-2 hours

**This completes the Employee Dashboard Firebase integration!**














