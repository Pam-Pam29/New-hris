# 📊 Late Arrivals & Absence Tracking - Complete Guide

## 🎯 Overview

The HR platform now has **automated late arrival and absence detection** that tracks employees in real-time.

---

## 🔍 How It Works

### **Automatic Status Detection**

The system automatically categorizes employees into:

| Status | Criteria | Color | Action |
|--------|----------|-------|--------|
| **Present** | Clocked in before 9:00 AM | 🟢 Green | None needed |
| **Late** | Clocked in 9:01 - 9:30 AM | 🟡 Yellow | Monitor |
| **Absent** | No clock-in after 11:00 AM (2 hours late) | 🔴 Red | Contact employee |

### **Configurable Settings**

```typescript
// Default settings (can be customized)
{
  expectedClockInTime: '09:00',      // When employees should arrive
  lateThresholdMinutes: 30,          // 30 min late = Late status
  absentThresholdMinutes: 120,       // 2 hours late = Absent status
  trackWeekends: false,              // Don't track Sat/Sun
  workDays: [1,2,3,4,5]             // Monday to Friday
}
```

---

## 📊 **What HR Can See**

### **1. Real-Time Statistics Dashboard**

```
┌─────────────────────────────────────────────┐
│ ATTENDANCE TRACKING                         │
├─────────────────────────────────────────────┤
│ Total: 50  Present: 45  Late: 3  Absent: 2  │
│ Attendance Rate: 96%                        │
└─────────────────────────────────────────────┘
```

### **2. Late Arrivals List**

```
┌────────────────────────────────────────────┐
│ ⚠️ LATE ARRIVALS (3)                       │
├────────────────────────────────────────────┤
│ John Doe                                   │
│ Expected: 09:00 | Actual: 09:25            │
│                           [25 min late]    │
├────────────────────────────────────────────┤
│ Jane Smith                                 │
│ Expected: 09:00 | Actual: 09:15            │
│                           [15 min late]    │
└────────────────────────────────────────────┘
```

### **3. Absent Employees List**

```
┌────────────────────────────────────────────┐
│ ❌ ABSENT EMPLOYEES (2)                    │
├────────────────────────────────────────────┤
│ Mike Johnson                               │
│ Expected: 09:00 | No clock-in recorded    │
│                    [Send Reminder]         │
├────────────────────────────────────────────┤
│ Sarah Williams                             │
│ Expected: 09:00 | No clock-in recorded    │
│                    [Send Reminder]         │
└────────────────────────────────────────────┘
```

---

## 🚀 **How to Use in HR Platform**

### **Method 1: Add to Time Management Page**

Add this to `hr-platform/src/pages/Hr/CoreHr/TimeManagement/index.tsx`:

```typescript
// Import at top
import { LateAbsenceTracker } from '../../../components/LateAbsenceTracker';

// Add before or after the statistics cards
<LateAbsenceTracker />
```

### **Method 2: Use the Service Directly**

```typescript
import { getAttendanceTrackingService } from './services/attendanceTrackingService';

// Get late employees for today
const service = getAttendanceTrackingService();
const lateToday = await service.getLateEmployees('2025-10-01');

console.log('Late employees:', lateToday);
// Shows: [{ employeeName: 'John Doe', minutesLate: 25, ... }]

// Get absent employees
const absentToday = await service.getAbsentEmployees('2025-10-01');
console.log('Absent employees:', absentToday);

// Get full statistics
const stats = await service.getAttendanceStats('2025-10-01');
console.log('Attendance stats:', stats);
// Shows: { total: 50, present: 45, late: 3, absent: 2, rate: 96% }
```

---

## 📈 **Advanced Features**

### **1. Weekly Attendance Report**

```typescript
const service = getAttendanceTrackingService();

// Get week starting from Monday
const report = await service.getWeeklyAttendanceReport('2025-10-01');

console.log('Weekly report:', report);
// Shows attendance stats for each day of the week
```

### **2. Custom Settings for Different Departments**

```typescript
// For office workers
const officeService = getAttendanceTrackingService({
    expectedClockInTime: '09:00',
    lateThresholdMinutes: 15
});

// For shift workers
const shiftService = getAttendanceTrackingService({
    expectedClockInTime: '07:00',
    lateThresholdMinutes: 10,
    trackWeekends: true
});
```

### **3. Real-Time Monitoring**

```typescript
// Auto-refresh every 5 minutes
useEffect(() => {
    const interval = setInterval(async () => {
        const absent = await service.getAbsentEmployees(today);
        if (absent.length > 0) {
            // Send alert to HR manager
            console.warn('⚠️ Absent employees:', absent.length);
        }
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(interval);
}, []);
```

---

## 🎯 **How Absence Detection Works**

### **Logic Flow:**

```
Check Time: 11:00 AM (2 hours after expected 9:00 AM)

For each employee:
  ├─ Has time entry for today?
  │  ├─ YES → Check clock-in time
  │  │  ├─ Before 9:00 AM → Present ✅
  │  │  ├─ 9:01 - 9:30 AM → Late ⚠️
  │  │  └─ After 9:30 AM → Very Late ⚠️⚠️
  │  │
  │  └─ NO → Check current time
  │     ├─ Before 11:00 AM → Not absent yet
  │     └─ After 11:00 AM → Absent ❌
```

### **Example Timeline:**

```
9:00 AM - Expected clock-in time
9:01 AM - Employee still not in → No alert yet
9:30 AM - Still not in → No alert yet
11:00 AM - Still not in → MARKED AS ABSENT ❌
         - Appears in HR's absent list
         - HR can send reminder
```

---

## 🔔 **Automated Alerts (Future Enhancement)**

You can add automatic notifications:

```typescript
// Auto-notify HR of absences
async function checkAndNotifyAbsences() {
    const service = getAttendanceTrackingService();
    const today = new Date().toISOString().split('T')[0];
    const absent = await service.getAbsentEmployees(today);

    if (absent.length > 0) {
        // Send email/SMS to HR
        await sendHRAlert({
            type: 'absence',
            count: absent.length,
            employees: absent.map(e => e.employeeName)
        });
    }
}

// Run at 11:00 AM daily
scheduleDaily('11:00', checkAndNotifyAbsences);
```

---

## 📊 **HR Dashboard Integration**

### **Add to Dashboard:**

```typescript
// In HR Dashboard.tsx
import { getAttendanceTrackingService } from '../services/attendanceTrackingService';

const Dashboard = () => {
    const [todayStats, setTodayStats] = useState(null);

    useEffect(() => {
        const loadStats = async () => {
            const service = getAttendanceTrackingService();
            const today = new Date().toISOString().split('T')[0];
            const stats = await service.getAttendanceStats(today);
            setTodayStats(stats);
        };
        loadStats();
    }, []);

    return (
        <div>
            {/* Show quick stats */}
            <div className="grid grid-cols-4 gap-4">
                <StatCard 
                    title="Present" 
                    value={todayStats?.present} 
                    color="green" 
                />
                <StatCard 
                    title="Late" 
                    value={todayStats?.late} 
                    color="yellow" 
                />
                <StatCard 
                    title="Absent" 
                    value={todayStats?.absent} 
                    color="red" 
                />
                <StatCard 
                    title="Rate" 
                    value={`${todayStats?.attendanceRate}%`} 
                    color="blue" 
                />
            </div>
        </div>
    );
};
```

---

## 🧪 **Testing the Tracking**

### **Test in Browser Console:**

```javascript
// Initialize service
const service = getAttendanceTrackingService();

// Get today's date
const today = new Date().toISOString().split('T')[0];

// Check late employees
const late = await service.getLateEmployees(today);
console.log('Late employees:', late);

// Check absent employees
const absent = await service.getAbsentEmployees(today);
console.log('Absent employees:', absent);

// Get full statistics
const stats = await service.getAttendanceStats(today);
console.log('Attendance stats:', stats);
```

### **Expected Output:**

```javascript
Late employees: [
  {
    employeeId: 'emp-001',
    employeeName: 'John Doe',
    status: 'late',
    clockInTime: '09:25',
    expectedTime: '09:00',
    minutesLate: 25,
    date: '2025-10-01'
  }
]

Absent employees: [
  {
    employeeId: 'emp-002',
    employeeName: 'Jane Smith',
    status: 'absent',
    expectedTime: '09:00',
    reason: 'No clock-in recorded',
    date: '2025-10-01'
  }
]

Attendance stats: {
  total: 50,
  present: 45,
  late: 3,
  absent: 2,
  onLeave: 0,
  attendanceRate: 96
}
```

---

## 🎨 **Visual Indicators for HR**

### **Dashboard Badges:**

```typescript
// In HR Time Management, show urgent badges
{stats.absent > 0 && (
    <Badge variant="destructive" className="animate-pulse">
        {stats.absent} Absent Now!
    </Badge>
)}

{stats.late > 5 && (
    <Badge variant="outline" className="bg-yellow-100">
        {stats.late} Late Arrivals
    </Badge>
)}
```

### **Color Coding:**

- 🟢 **Green** = On time (before 9:00 AM)
- 🟡 **Yellow** = Late (9:01 - 9:30 AM)
- 🔴 **Red** = Absent (no clock-in by 11:00 AM)

---

## 📝 **Usage Examples**

### **Example 1: Daily Attendance Check**

```typescript
// HR opens dashboard at 11:00 AM
const service = getAttendanceTrackingService();
const today = new Date().toISOString().split('T')[0];

// Get all statuses
const statuses = await service.getAttendanceStatusForDate(today);

// Filter and act
const absent = statuses.filter(s => s.status === 'absent');
if (absent.length > 0) {
    console.log('⚠️ Action required: Contact these employees:');
    absent.forEach(emp => {
        console.log(`- ${emp.employeeName} (No clock-in)`);
    });
}
```

### **Example 2: Late Arrival Report**

```typescript
// Generate report of chronic late arrivals
const service = getAttendanceTrackingService();
const lastWeek = await service.getWeeklyAttendanceReport('2025-09-24');

const latePatterns = lastWeek.map(day => ({
    date: day.date,
    lateCount: day.stats.late
}));

console.log('Late arrival patterns:', latePatterns);
// Use this to identify employees who are frequently late
```

---

## 🔔 **Integration with Notifications**

Automatically notify HR when:

```typescript
import { getTimeNotificationService } from './services/timeNotificationService';

async function autoNotifyAbsences() {
    const attendanceService = getAttendanceTrackingService();
    const notifService = await getTimeNotificationService();
    const today = new Date().toISOString().split('T')[0];
    
    const absent = await attendanceService.getAbsentEmployees(today);
    
    if (absent.length > 0) {
        // Notify HR
        await notifService.createNotification({
            type: 'absence_alert',
            title: 'Absent Employees Alert',
            message: `${absent.length} employees are absent today`,
            priority: 'high',
            sentToHr: true
        });
    }
}

// Run at 11:00 AM daily
```

---

## 🎯 **Key Features**

### ✅ **What's Included:**

1. **Automatic Detection**
   - Compares all employees vs actual clock-ins
   - Real-time status updates
   - Configurable thresholds

2. **Visual Tracking**
   - Color-coded status badges
   - Separate cards for late/absent
   - Statistics overview

3. **Smart Logic**
   - Doesn't mark as absent too early
   - Handles weekends/holidays
   - Considers work schedules

4. **HR Actions**
   - Send reminders to absent employees
   - Review late arrival patterns
   - Export reports

---

## 📱 **Quick Implementation**

### **Add to Your HR Time Management Page:**

```typescript
// In hr-platform/src/pages/Hr/CoreHr/TimeManagement/index.tsx

// 1. Import the component
import { LateAbsenceTracker } from '../../../components/LateAbsenceTracker';

// 2. Add anywhere in your return JSX (after header is good):
return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 p-6">
        <div className="max-w-7xl mx-auto space-y-6">
            {/* Header */}
            ...

            {/* ADD THIS: Late & Absence Tracker */}
            <LateAbsenceTracker />

            {/* Rest of your page */}
            ...
        </div>
    </div>
);
```

**That's it!** The tracker will show:
- Late arrivals with minutes late
- Absent employees with send reminder button
- Real-time statistics
- Color-coded visual indicators

---

## 🧪 **Testing**

### **Test Scenario 1: Late Arrival**

```javascript
// Create an employee who clocks in late
const service = await getTimeTrackingService();

await service.clockIn('emp-late', 'Late Employee', {
    latitude: 40.7128,
    longitude: -74.0060,
    address: 'Office',
    timestamp: new Date('2025-10-01T09:25:00') // 25 min late
});

// Check tracking
const attendanceService = getAttendanceTrackingService();
const late = await attendanceService.getLateEmployees('2025-10-01');
console.log('Late employees:', late);
// Should show: Late Employee - 25 min late
```

### **Test Scenario 2: Absence**

```javascript
// Get all employees
const employeeService = await getEmployeeService();
const allEmployees = await employeeService.getEmployees();

// Get time entries for today
const timeService = await getTimeTrackingService();
const todayEntries = await timeService.getTimeEntries();

// Compare
const employeesWhoDidNotClockIn = allEmployees.filter(emp => 
    !todayEntries.some(entry => entry.employeeId === emp.id.toString())
);

console.log('Did not clock in:', employeesWhoDidNotClockIn.map(e => e.name));
// These are your absent employees!
```

---

## 📊 **Reports You Can Generate**

### **Daily Absence Report**

```typescript
async function generateDailyAbsenceReport(date: string) {
    const service = getAttendanceTrackingService();
    const absent = await service.getAbsentEmployees(date);
    
    return {
        date,
        totalAbsent: absent.length,
        employees: absent.map(e => ({
            name: e.employeeName,
            id: e.employeeId,
            expectedTime: e.expectedTime
        }))
    };
}
```

### **Late Arrival Trends**

```typescript
async function getLateArrivalTrends(startDate: string, days: number) {
    const service = getAttendanceTrackingService();
    const trends = [];
    
    for (let i = 0; i < days; i++) {
        const date = new Date(startDate);
        date.setDate(date.getDate() + i);
        const dateStr = date.toISOString().split('T')[0];
        
        const late = await service.getLateEmployees(dateStr);
        trends.push({
            date: dateStr,
            count: late.length,
            employees: late.map(e => e.employeeName)
        });
    }
    
    return trends;
}
```

---

## 🎯 **Quick Summary**

### **What You Get:**

✅ **Automatic Detection**
- System automatically detects who's late/absent
- No manual work needed
- Real-time updates

✅ **Clear Visual Indicators**
- Color-coded status badges
- Separate sections for late/absent
- Easy to see at a glance

✅ **Actionable Data**
- List of late employees with minutes
- List of absent employees
- Send reminder buttons
- Export capabilities

✅ **Configurable**
- Set expected time (default: 9:00 AM)
- Set late threshold (default: 30 min)
- Set absent threshold (default: 2 hours)
- Configure work days

---

## 🚀 **Next Steps**

### **Option 1: Add Visual Tracker (Recommended)**
```typescript
// Just add one line to your HR time management page:
<LateAbsenceTracker />
```

### **Option 2: Use in Dashboard**
```typescript
// Show quick stats in main HR dashboard
const stats = await getAttendanceTrackingService().getAttendanceStats(today);
```

### **Option 3: Custom Implementation**
```typescript
// Use the service directly for custom UI
const late = await service.getLateEmployees(date);
const absent = await service.getAbsentEmployees(date);
```

---

## 📞 **Support**

**Files Created:**
- ✅ `hr-platform/src/services/attendanceTrackingService.ts` - Core logic
- ✅ `hr-platform/src/components/LateAbsenceTracker.tsx` - Ready-to-use UI

**To Use:**
Just import and add `<LateAbsenceTracker />` to your HR page!

---

**Your late/absence tracking is ready!** 🎉  
**Just add the component and it works!** ✨


