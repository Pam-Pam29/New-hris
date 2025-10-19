# HR Time Management - Firebase Integration Guide

## 🎯 Overview

The HR platform time management page needs to be updated to integrate with Firebase for real-time synchronization with the employee platform.

## 📝 Current State

**File**: `hr-platform/src/pages/Hr/CoreHr/TimeManagement/index.tsx`

Currently uses:
- Local `getTimeService()` from `./services/timeService.ts` 
- `AttendanceRecord` type
- Manual attendance management
- No real-time sync
- No adjustment request handling

## 🔄 Changes Needed

### 1. Import Firebase Services

Replace the imports at the top:

```typescript
// ADD these imports
import { getTimeTrackingService, TimeEntry, TimeAdjustmentRequest } from '../../../services/timeTrackingService';
import { getTimeNotificationService, TimeNotification } from '../../../services/timeNotificationService';
```

### 2. Add State for New Features

Add these state variables:

```typescript
// After existing state declarations
const [adjustmentRequests, setAdjustmentRequests] = useState<TimeAdjustmentRequest[]>([]);
const [notifications, setNotifications] = useState<TimeNotification[]>([]);
const [showNotifications, setShowNotifications] = useState(false);
const [selectedRequest, setSelectedRequest] = useState<TimeAdjustmentRequest | null>(null);
const [showApprovalDialog, setShowApprovalDialog] = useState(false);
const [approvalNotes, setApprovalNotes] = useState('');
```

### 3. Set Up Real-Time Subscriptions

Replace the existing useEffect that loads data with:

```typescript
useEffect(() => {
    let unsubscribeEntries: (() => void) | undefined;
    let unsubscribeRequests: (() => void) | undefined;
    let unsubscribeNotifs: (() => void) | undefined;

    const setupServices = async () => {
        try {
            const timeService = await getTimeTrackingService();
            const notifService = await getTimeNotificationService();

            console.log('📡 HR: Setting up real-time subscriptions...');

            // Subscribe to ALL time entries (all employees)
            unsubscribeEntries = timeService.subscribeToTimeEntries(
                (entries) => {
                    console.log('📊 HR: Time entries updated:', entries.length);
                    // Convert to AttendanceRecord format
                    const records: AttendanceRecord[] = entries.map(entry => {
                        const clockInDate = new Date(entry.clockIn);
                        const clockInTime = clockInDate.toTimeString().slice(0, 5);
                        
                        let clockOutTime = '';
                        if (entry.clockOut) {
                            const clockOutDate = new Date(entry.clockOut);
                            clockOutTime = clockOutDate.toTimeString().slice(0, 5);
                        }

                        // Determine status based on clock-in time
                        let status: 'Present' | 'Late' | 'Absent' = 'Present';
                        if (clockInTime > '09:30') {
                            status = 'Late';
                        } else if (clockInTime > '10:00') {
                            status = 'Absent';
                        }

                        return {
                            id: entry.id,
                            employee: entry.employeeName,
                            employeeId: entry.employeeId,
                            employeeName: entry.employeeName,
                            date: clockInDate.toISOString().split('T')[0],
                            clockIn: clockInTime,
                            clockOut: clockOutTime,
                            status,
                            notes: entry.notes,
                            reason: ''
                        };
                    });
                    
                    setAttendanceRecords(records);
                    setFilteredAttendanceRecords(records);
                }
            );

            // Subscribe to pending adjustment requests
            unsubscribeRequests = timeService.subscribeToAdjustmentRequests(
                (requests) => {
                    const pending = requests.filter(r => r.status === 'pending');
                    setAdjustmentRequests(pending);
                    console.log('📝 HR: Pending adjustment requests:', pending.length);
                },
                'pending'
            );

            // Subscribe to HR notifications
            unsubscribeNotifs = notifService.subscribeToHrNotifications(
                (notifs) => {
                    setNotifications(notifs);
                    console.log('🔔 HR: Notifications updated:', notifs.length);
                }
            );

            console.log('✅ HR: Real-time sync initialized successfully');
        } catch (error) {
            console.error('❌ HR: Failed to initialize services:', error);
        }
    };

    setupServices();

    return () => {
        unsubscribeEntries?.();
        unsubscribeRequests?.();
        unsubscribeNotifs?.();
    };
}, []);
```

### 4. Add Adjustment Approval Handlers

Add these functions:

```typescript
const handleApproveAdjustment = async (request: TimeAdjustmentRequest) => {
    try {
        const timeService = await getTimeTrackingService();
        const notifService = await getTimeNotificationService();

        console.log('✅ HR: Approving adjustment request...');
        
        // Approve the request (this also updates the time entry automatically)
        await timeService.approveAdjustmentRequest(
            request.id,
            'HR Manager', // TODO: Get from auth context
            approvalNotes || 'Approved'
        );

        // Send notification to employee
        await notifService.notifyAdjustmentApproved(
            request.employeeId,
            request.employeeName,
            request.id,
            'HR Manager'
        );

        toast({
            title: 'Adjustment Approved',
            description: `Time adjustment for ${request.employeeName} has been approved`,
            duration: 3500
        });

        console.log('✅ HR: Adjustment approved successfully');
        setShowApprovalDialog(false);
        setSelectedRequest(null);
        setApprovalNotes('');
    } catch (error) {
        console.error('❌ HR: Approval failed:', error);
        toast({
            title: 'Error',
            description: 'Failed to approve adjustment request',
            variant: 'destructive'
        });
    }
};

const handleRejectAdjustment = async (request: TimeAdjustmentRequest, reason: string) => {
    try {
        const timeService = await getTimeTrackingService();
        const notifService = await getTimeNotificationService();

        console.log('❌ HR: Rejecting adjustment request...');

        await timeService.rejectAdjustmentRequest(
            request.id,
            'HR Manager', // TODO: Get from auth context
            reason
        );

        await notifService.notifyAdjustmentRejected(
            request.employeeId,
            request.employeeName,
            request.id,
            'HR Manager',
            reason
        );

        toast({
            title: 'Adjustment Rejected',
            description: `Time adjustment for ${request.employeeName} has been rejected`,
            duration: 3500
        });

        console.log('✅ HR: Adjustment rejected successfully');
        setShowApprovalDialog(false);
        setSelectedRequest(null);
        setApprovalNotes('');
    } catch (error) {
        console.error('❌ HR: Rejection failed:', error);
        toast({
            title: 'Error',
            description: 'Failed to reject adjustment request',
            variant: 'destructive'
        });
    }
};
```

### 5. Add Pending Requests Section to UI

Add this section after the statistics cards:

```tsx
{/* Pending Adjustment Requests */}
{adjustmentRequests.length > 0 && (
    <Card className="border-yellow-200 bg-yellow-50">
        <CardHeader>
            <div className="flex items-center justify-between">
                <CardTitle className="flex items-center space-x-2 text-yellow-800">
                    <AlertTriangle className="h-5 w-5" />
                    <span>Pending Adjustment Requests</span>
                    <Badge variant="destructive">{adjustmentRequests.length}</Badge>
                </CardTitle>
            </div>
        </CardHeader>
        <CardContent>
            <div className="space-y-3">
                {adjustmentRequests.map((request) => (
                    <div key={request.id} className="p-4 bg-white border rounded-lg">
                        <div className="flex items-start justify-between">
                            <div className="flex-1">
                                <div className="flex items-center space-x-2 mb-2">
                                    <User className="h-4 w-4 text-muted-foreground" />
                                    <p className="font-semibold">{request.employeeName}</p>
                                    <Badge variant="outline" className="text-xs">
                                        {request.reason.replace('_', ' ')}
                                    </Badge>
                                </div>
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <p className="text-muted-foreground">Original Times</p>
                                        <p className="font-mono">
                                            {new Date(request.originalClockIn).toLocaleTimeString()} - 
                                            {request.originalClockOut ? new Date(request.originalClockOut).toLocaleTimeString() : 'N/A'}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-muted-foreground">Requested Times</p>
                                        <p className="font-mono text-blue-600">
                                            {new Date(request.requestedClockIn).toLocaleTimeString()} - 
                                            {request.requestedClockOut ? new Date(request.requestedClockOut).toLocaleTimeString() : 'N/A'}
                                        </p>
                                    </div>
                                </div>
                                {request.reasonText && (
                                    <p className="text-sm text-muted-foreground mt-2">
                                        <strong>Reason:</strong> {request.reasonText}
                                    </p>
                                )}
                                {request.notes && (
                                    <p className="text-sm text-muted-foreground">
                                        <strong>Notes:</strong> {request.notes}
                                    </p>
                                )}
                            </div>
                            <div className="flex flex-col space-y-2">
                                <Button
                                    size="sm"
                                    className="bg-green-600 hover:bg-green-700"
                                    onClick={() => {
                                        setSelectedRequest(request);
                                        setShowApprovalDialog(true);
                                    }}
                                >
                                    <CheckCircle className="h-4 w-4 mr-1" />
                                    Approve
                                </Button>
                                <Button
                                    size="sm"
                                    variant="destructive"
                                    onClick={() => {
                                        setSelectedRequest(request);
                                        const reason = prompt('Reason for rejection:');
                                        if (reason) {
                                            handleRejectAdjustment(request, reason);
                                        }
                                    }}
                                >
                                    <XCircle className="h-4 w-4 mr-1" />
                                    Reject
                                </Button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </CardContent>
    </Card>
)}
```

### 6. Add Approval Dialog

Add this dialog before the closing divs:

```tsx
{/* Approval Dialog */}
<Dialog open={showApprovalDialog} onOpenChange={setShowApprovalDialog}>
    <DialogContent>
        <DialogHeader>
            <DialogTitle>Approve Time Adjustment</DialogTitle>
            <DialogDescription>
                Review and approve the time adjustment request
            </DialogDescription>
        </DialogHeader>
        
        {selectedRequest && (
            <div className="space-y-4 py-4">
                <div className="space-y-2">
                    <Label>Employee</Label>
                    <p className="font-semibold">{selectedRequest.employeeName}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <Label>Original Clock In</Label>
                        <p className="font-mono">
                            {new Date(selectedRequest.originalClockIn).toLocaleString()}
                        </p>
                    </div>
                    <div>
                        <Label>Requested Clock In</Label>
                        <p className="font-mono text-blue-600">
                            {new Date(selectedRequest.requestedClockIn).toLocaleString()}
                        </p>
                    </div>
                </div>

                <div>
                    <Label>Approval Notes (Optional)</Label>
                    <Textarea
                        value={approvalNotes}
                        onChange={(e) => setApprovalNotes(e.target.value)}
                        placeholder="Add any notes about this approval..."
                        rows={3}
                    />
                </div>
            </div>
        )}

        <DialogFooter>
            <Button variant="outline" onClick={() => setShowApprovalDialog(false)}>
                Cancel
            </Button>
            <Button
                className="bg-green-600 hover:bg-green-700"
                onClick={() => selectedRequest && handleApproveAdjustment(selectedRequest)}
            >
                Approve Request
            </Button>
        </DialogFooter>
    </DialogContent>
</Dialog>
```

### 7. Add Notification Badge to Header

Add notification bell icon similar to employee platform:

```tsx
{/* In header section */}
<Button
    variant="outline"
    size="sm"
    className="relative"
    onClick={() => setShowNotifications(!showNotifications)}
>
    <Bell className="h-4 w-4" />
    {notifications.filter(n => !n.read).length > 0 && (
        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
            {notifications.filter(n => !n.read).length}
        </span>
    )}
</Button>
```

## 🔄 Benefits of These Changes

1. **Real-Time Sync**: HR sees employee clock-ins/outs instantly
2. **Adjustment Workflow**: Clear process for reviewing and approving adjustments
3. **Notifications**: HR gets notified of new adjustment requests
4. **Automatic Updates**: Time entries update automatically when approved
5. **Audit Trail**: Complete history of all actions
6. **Better UX**: Pending requests clearly visible with one-click approval

## 🧪 Testing Steps

### Test 1: See Employee Clock-In
1. Employee clocks in on their platform
2. HR platform should show the entry within 1-2 seconds
3. Check Firebase console to verify data

### Test 2: Approve Adjustment
1. Employee submits adjustment request
2. HR sees it in "Pending Adjustment Requests" section
3. Click "Approve" button
4. Employee should get notification instantly
5. Time entry should be updated

### Test 3: Reject Adjustment
1. Click "Reject" on a request
2. Enter rejection reason
3. Employee should get notification with reason

## ⚠️ Important Notes

1. **Keep Existing Functionality**: Don't remove existing attendance management features
2. **Use Both Systems**: Firebase for real-time sync, existing system for manual entry
3. **Error Handling**: All Firebase calls have try-catch blocks
4. **Console Logs**: Added for debugging
5. **HR Manager Name**: Currently hardcoded, should be from auth context

## 📊 Statistics Updates

The existing dashboard statistics will automatically update with the new data since they use the same `attendanceRecords` state.

## 🎯 Success Criteria

When complete, HR platform should:
- ✅ See all employee time entries in real-time
- ✅ Get notifications for new clock-ins
- ✅ See pending adjustment requests
- ✅ Approve/reject requests with one click
- ✅ Automatically notify employees of decisions
- ✅ Update time entries when requests approved
- ✅ Show notification badge with count

## 💡 Tips

1. Test with browser console open to see logs
2. Use Firebase console to monitor data
3. Test with multiple employees
4. Test rejection flow thoroughly
5. Check notifications on both sides

---

**Status**: Ready to implement  
**Estimated Time**: 20-30 minutes  
**Complexity**: Medium



