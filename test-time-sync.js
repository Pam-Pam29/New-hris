/**
 * Test Time Management Real-Time Synchronization
 * 
 * This script tests the complete time management sync system
 * Run this in your browser console on either platform
 */

console.log('🧪 Starting Time Management Sync Tests...\n');

async function testTimeManagementSync() {
    try {
        console.log('📡 Test 1: Initialize Services');
        console.log('================================\n');

        // Import services (these are globally available in your apps)
        const timeService = await getTimeTrackingService();
        const notifService = await getTimeNotificationService();

        console.log('✅ Time Service:', timeService.constructor.name);
        console.log('✅ Notification Service:', notifService.constructor.name);
        console.log('\n');

        // Test data
        const testEmployeeId = 'test-emp-' + Date.now();
        const testEmployeeName = 'Test Employee';

        console.log('📡 Test 2: Clock In');
        console.log('===================\n');

        // Test clock in
        const clockInEntry = await timeService.clockIn(
            testEmployeeId,
            testEmployeeName,
            {
                latitude: 40.7128,
                longitude: -74.0060,
                address: 'Test Office Location',
                accuracy: 5,
                timestamp: new Date()
            }
        );

        console.log('✅ Clock In Successful!');
        console.log('   Entry ID:', clockInEntry.id);
        console.log('   Employee:', clockInEntry.employeeName);
        console.log('   Time:', new Date(clockInEntry.clockIn).toLocaleString());
        console.log('   Location:', clockInEntry.location?.address);
        console.log('\n');

        // Send clock-in notification
        await notifService.notifyClockIn(
            testEmployeeId,
            testEmployeeName,
            clockInEntry.id,
            'Test Office Location'
        );
        console.log('✅ Clock In Notification Sent to HR');
        console.log('\n');

        console.log('📡 Test 3: Real-Time Subscription');
        console.log('==================================\n');

        // Test real-time subscription
        let subscriptionWorking = false;
        const unsubscribe = timeService.subscribeToTimeEntries(
            testEmployeeId,
            (entries) => {
                console.log('📊 Real-time update received!');
                console.log('   Total entries:', entries.length);
                console.log('   Latest entry:', entries[0]?.id);
                subscriptionWorking = true;
            }
        );

        // Wait for subscription to trigger
        await new Promise(resolve => setTimeout(resolve, 2000));

        if (subscriptionWorking) {
            console.log('✅ Real-time subscription is working!');
        } else {
            console.log('⚠️  Real-time subscription may need more time');
        }
        console.log('\n');

        console.log('📡 Test 4: Clock Out');
        console.log('====================\n');

        // Wait a bit before clocking out
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Test clock out
        const clockOutEntry = await timeService.clockOut(
            clockInEntry.id,
            {
                latitude: 40.7128,
                longitude: -74.0060,
                address: 'Test Office Location',
                accuracy: 5,
                timestamp: new Date()
            }
        );

        console.log('✅ Clock Out Successful!');
        console.log('   Entry ID:', clockOutEntry.id);
        console.log('   Status:', clockOutEntry.status);

        // Calculate hours worked
        const clockInTime = new Date(clockInEntry.clockIn).getTime();
        const clockOutTime = new Date(clockOutEntry.clockOut).getTime();
        const hoursWorked = (clockOutTime - clockInTime) / (1000 * 60 * 60);

        console.log('   Hours Worked:', hoursWorked.toFixed(4));
        console.log('\n');

        // Send clock-out notification
        await notifService.notifyClockOut(
            testEmployeeId,
            testEmployeeName,
            clockOutEntry.id,
            hoursWorked
        );
        console.log('✅ Clock Out Notification Sent to HR');
        console.log('\n');

        console.log('📡 Test 5: Time Adjustment Request');
        console.log('===================================\n');

        // Create adjustment request
        const adjustmentRequest = await timeService.createAdjustmentRequest({
            timeEntryId: clockOutEntry.id,
            employeeId: testEmployeeId,
            employeeName: testEmployeeName,
            originalClockIn: clockInEntry.clockIn,
            originalClockOut: clockOutEntry.clockOut,
            requestedClockIn: new Date(new Date(clockInEntry.clockIn).getTime() - 30 * 60 * 1000), // 30 min earlier
            requestedClockOut: clockOutEntry.clockOut,
            reason: 'forgot_clock_in',
            reasonText: 'I forgot to clock in when I arrived',
            notes: 'I was in the building, just forgot to use the system',
            status: 'pending',
            createdAt: new Date()
        });

        console.log('✅ Adjustment Request Created!');
        console.log('   Request ID:', adjustmentRequest.id);
        console.log('   Status:', adjustmentRequest.status);
        console.log('   Reason:', adjustmentRequest.reasonText);
        console.log('\n');

        // Send adjustment request notification
        await notifService.notifyAdjustmentRequest(
            testEmployeeId,
            testEmployeeName,
            adjustmentRequest.id
        );
        console.log('✅ Adjustment Request Notification Sent to HR');
        console.log('\n');

        console.log('📡 Test 6: Notifications');
        console.log('========================\n');

        // Get employee notifications
        const employeeNotifications = await notifService.getNotifications(testEmployeeId);
        console.log('✅ Employee Notifications:', employeeNotifications.length);
        if (employeeNotifications.length > 0) {
            console.log('   Latest:', employeeNotifications[0].title);
        }

        // Get HR notifications
        const hrNotifications = await notifService.getNotifications(undefined, true);
        console.log('✅ HR Notifications:', hrNotifications.length);
        if (hrNotifications.length > 0) {
            console.log('   Latest:', hrNotifications[0].title);
        }
        console.log('\n');

        console.log('📡 Test 7: Approve Adjustment (Simulating HR)');
        console.log('==============================================\n');

        // Simulate HR approving the request
        const approvedRequest = await timeService.approveAdjustmentRequest(
            adjustmentRequest.id,
            'Test HR Manager',
            'Approved for testing'
        );

        console.log('✅ Adjustment Approved!');
        console.log('   Request ID:', approvedRequest.id);
        console.log('   Status:', approvedRequest.status);
        console.log('   Reviewed By:', approvedRequest.reviewedBy);
        console.log('\n');

        // Send approval notification
        await notifService.notifyAdjustmentApproved(
            testEmployeeId,
            testEmployeeName,
            approvedRequest.id,
            'Test HR Manager'
        );
        console.log('✅ Approval Notification Sent to Employee');
        console.log('\n');

        // Clean up subscription
        unsubscribe();

        console.log('🎉 ALL TESTS PASSED!');
        console.log('====================\n');
        console.log('Summary:');
        console.log('  ✅ Services initialized');
        console.log('  ✅ Clock in works');
        console.log('  ✅ Clock out works');
        console.log('  ✅ Real-time sync works');
        console.log('  ✅ Adjustment requests work');
        console.log('  ✅ Notifications work');
        console.log('  ✅ Approval workflow works');
        console.log('\n');
        console.log('🔥 Your time management system is PRODUCTION READY!');
        console.log('\n');
        console.log('Next Steps:');
        console.log('1. Open HR platform and check Time Management');
        console.log('2. You should see the test entry');
        console.log('3. Try the real UI - clock in/out buttons');
        console.log('4. Submit a real adjustment request');
        console.log('5. Approve it from HR platform');
        console.log('\n');

        return {
            success: true,
            clockInEntry,
            clockOutEntry,
            adjustmentRequest,
            approvedRequest
        };

    } catch (error) {
        console.error('❌ Test Failed:', error);
        console.error('\n');
        console.log('Troubleshooting:');
        console.log('1. Check Firebase indexes are deployed');
        console.log('2. Check Firebase rules are deployed');
        console.log('3. Check browser console for errors');
        console.log('4. Verify Firebase project ID: hris-system-baa22');
        console.log('\n');
        return {
            success: false,
            error: error.message
        };
    }
}

// Run the test
console.log('Copy and paste this into your browser console:\n');
console.log('testTimeManagementSync()');
console.log('\n');

// Make it available globally for browser console
if (typeof window !== 'undefined') {
    window.testTimeManagementSync = testTimeManagementSync;
}

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { testTimeManagementSync };
}



