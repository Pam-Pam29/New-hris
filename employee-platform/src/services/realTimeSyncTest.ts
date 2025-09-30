import { 
    collection, 
    doc, 
    setDoc, 
    getDocs,
    query,
    limit,
    addDoc,
    onSnapshot
} from 'firebase/firestore';
import { db } from '../config/firebase';

// Test real-time synchronization between HR and Employee platforms
export async function testRealTimeSync() {
    console.log('🔄 Testing Real-Time Synchronization...');

    const results = {
        leaveRequests: false,
        policies: false,
        notifications: false,
        employees: false,
        performanceGoals: false
    };

    try {
        // Test 1: Leave Requests
        console.log('Test 1: Leave Requests Synchronization');
        try {
            const testLeaveRequest = {
                employeeId: 'sync-test-employee',
                leaveType: 'annual-leave',
                startDate: new Date(),
                endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
                reason: 'Real-time sync test',
                status: 'pending',
                submittedAt: new Date()
            };
            
            const leaveRequestRef = await addDoc(collection(db, 'leaveRequests'), testLeaveRequest);
            console.log(`✅ Created leave request: ${leaveRequestRef.id}`);
            
            // Verify we can read it back
            const leaveRequestsQuery = query(collection(db, 'leaveRequests'), limit(5));
            const leaveRequestsSnapshot = await getDocs(leaveRequestsQuery);
            console.log(`✅ Read ${leaveRequestsSnapshot.docs.length} leave requests`);
            
            results.leaveRequests = true;
        } catch (error) {
            console.error('❌ Leave requests test failed:', error);
        }

        // Test 2: Policies
        console.log('Test 2: Policies Synchronization');
        try {
            const testPolicy = {
                title: 'Real-Time Sync Test Policy',
                description: 'Testing policy synchronization between platforms',
                content: 'This policy is created to test real-time synchronization.',
                category: 'Test',
                effectiveDate: new Date(),
                isActive: true,
                requiresAcknowledgment: true,
                version: '1.0',
                createdAt: new Date(),
                updatedAt: new Date()
            };
            
            const policyRef = doc(collection(db, 'policies'), 'sync-test-policy');
            await setDoc(policyRef, testPolicy);
            console.log(`✅ Created policy: sync-test-policy`);
            
            // Verify we can read it back
            const policiesQuery = query(collection(db, 'policies'), limit(5));
            const policiesSnapshot = await getDocs(policiesQuery);
            console.log(`✅ Read ${policiesSnapshot.docs.length} policies`);
            
            results.policies = true;
        } catch (error) {
            console.error('❌ Policies test failed:', error);
        }

        // Test 3: Notifications
        console.log('Test 3: Notifications Synchronization');
        try {
            const testNotification = {
                employeeId: 'sync-test-employee',
                title: 'Real-Time Sync Test',
                message: 'Testing notification synchronization between platforms',
                type: 'info',
                category: 'test',
                isRead: false,
                createdAt: new Date()
            };
            
            const notificationRef = await addDoc(collection(db, 'notifications'), testNotification);
            console.log(`✅ Created notification: ${notificationRef.id}`);
            
            // Verify we can read it back
            const notificationsQuery = query(collection(db, 'notifications'), limit(5));
            const notificationsSnapshot = await getDocs(notificationsQuery);
            console.log(`✅ Read ${notificationsSnapshot.docs.length} notifications`);
            
            results.notifications = true;
        } catch (error) {
            console.error('❌ Notifications test failed:', error);
        }

        // Test 4: Performance Goals
        console.log('Test 4: Performance Goals Synchronization');
        try {
            const testGoal = {
                employeeId: 'sync-test-employee',
                title: 'Real-Time Sync Test Goal',
                description: 'Testing performance goal synchronization',
                targetValue: 100,
                currentValue: 0,
                status: 'in-progress',
                dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
                createdAt: new Date(),
                updatedAt: new Date()
            };
            
            const goalRef = await addDoc(collection(db, 'performanceGoals'), testGoal);
            console.log(`✅ Created performance goal: ${goalRef.id}`);
            
            // Verify we can read it back
            const goalsQuery = query(collection(db, 'performanceGoals'), limit(5));
            const goalsSnapshot = await getDocs(goalsQuery);
            console.log(`✅ Read ${goalsSnapshot.docs.length} performance goals`);
            
            results.performanceGoals = true;
        } catch (error) {
            console.error('❌ Performance goals test failed:', error);
        }

        // Test 5: Real-time listener test
        console.log('Test 5: Real-time Listener Test');
        try {
            let listenerCalled = false;
            const unsubscribe = onSnapshot(
                query(collection(db, 'notifications'), limit(1)),
                (snapshot) => {
                    console.log('✅ Real-time listener triggered');
                    listenerCalled = true;
                }
            );

            // Wait a moment for the listener to initialize
            await new Promise(resolve => setTimeout(resolve, 1000));
            unsubscribe();

            if (listenerCalled) {
                console.log('✅ Real-time listeners are working');
            } else {
                console.log('⚠️ Real-time listeners may need more time to initialize');
            }
        } catch (error) {
            console.error('❌ Real-time listener test failed:', error);
        }

        console.log('🎉 Real-Time Synchronization Test Complete!');
        console.log('Results:', results);
        
        return {
            success: true,
            results,
            summary: `All systems: ${Object.values(results).every(Boolean) ? 'Working' : 'Some issues detected'}`
        };

    } catch (error) {
        console.error('❌ Real-time sync test failed:', error);
        return {
            success: false,
            error: error.message || 'Unknown error',
            results
        };
    }
}

// Function to create sample data for testing
export async function createSyncTestData() {
    console.log('📝 Creating sample data for sync testing...');
    
    try {
        // Create sample employee
        const employeeData = {
            id: 'sync-test-employee',
            employeeId: 'EMP-SYNC-001',
            personalInfo: {
                firstName: 'Sync',
                lastName: 'Test',
                dateOfBirth: new Date('1990-01-01')
            },
            contactInfo: {
                personalEmail: 'sync.test@example.com',
                workEmail: 'sync.test@company.com'
            },
            workInfo: {
                position: 'Test Developer',
                department: 'Testing',
                hireDate: new Date()
            },
            createdAt: new Date(),
            updatedAt: new Date()
        };

        await setDoc(doc(collection(db, 'employees'), 'sync-test-employee'), employeeData);
        console.log('✅ Created test employee');

        // Create sample leave types
        const leaveTypes = [
            {
                id: 'annual-leave',
                name: 'Annual Leave',
                description: 'Regular vacation days',
                maxDaysPerYear: 25,
                isActive: true,
                color: '#3B82F6'
            },
            {
                id: 'sick-leave',
                name: 'Sick Leave',
                description: 'Medical leave',
                maxDaysPerYear: 10,
                isActive: true,
                color: '#EF4444'
            }
        ];

        for (const leaveType of leaveTypes) {
            await setDoc(doc(collection(db, 'leaveTypes'), leaveType.id), leaveType);
        }
        console.log('✅ Created test leave types');

        console.log('🎉 Sample data created successfully!');
        return true;
    } catch (error) {
        console.error('❌ Failed to create sample data:', error);
        return false;
    }
}
