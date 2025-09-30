import { 
    collection, 
    doc, 
    setDoc, 
    getDocs,
    query,
    limit,
    addDoc
} from 'firebase/firestore';
import { db } from '../config/firebase';

// Debug function specifically for notifications
export async function debugNotificationsCollection() {
    try {
        console.log('🔍 Debugging Notifications Collection...');

        // Test 1: Try to read existing notifications
        console.log('Test 1: Reading existing notifications...');
        const notificationsQuery = query(collection(db, 'notifications'), limit(5));
        const notificationsSnapshot = await getDocs(notificationsQuery);
        console.log(`Found ${notificationsSnapshot.docs.length} existing notifications`);

        // Test 2: Try to create a simple notification
        console.log('Test 2: Creating a test notification...');
        const testNotification = {
            employeeId: 'debug-test-employee',
            title: 'Debug Test Notification',
            message: 'This is a test notification for debugging',
            type: 'info',
            category: 'debug',
            isRead: false,
            createdAt: new Date(),
            updatedAt: new Date()
        };

        // Try using addDoc (auto-generated ID)
        const docRef = await addDoc(collection(db, 'notifications'), testNotification);
        console.log(`✅ Created notification with ID: ${docRef.id}`);

        // Test 3: Try to read the notification we just created
        console.log('Test 3: Reading the notification we just created...');
        const newNotificationsQuery = query(collection(db, 'notifications'), limit(5));
        const newNotificationsSnapshot = await getDocs(newNotificationsQuery);
        console.log(`Found ${newNotificationsSnapshot.docs.length} notifications after creation`);

        // Log the data we found
        newNotificationsSnapshot.docs.forEach((doc, index) => {
            console.log(`Notification ${index + 1}:`, {
                id: doc.id,
                data: doc.data()
            });
        });

        return {
            success: true,
            existingCount: notificationsSnapshot.docs.length,
            newCount: newNotificationsSnapshot.docs.length,
            createdId: docRef.id
        };

    } catch (error) {
        console.error('❌ Notifications collection debug failed:', error);
        return {
            success: false,
            error: error.message || 'Unknown error'
        };
    }
}

// Function to create a simple notification for testing
export async function createSimpleNotification() {
    try {
        const notification = {
            employeeId: 'test-employee',
            title: 'Simple Test Notification',
            message: 'This is a simple test notification',
            type: 'info',
            category: 'test',
            isRead: false,
            createdAt: new Date()
        };

        const docRef = await addDoc(collection(db, 'notifications'), notification);
        console.log(`✅ Created simple notification: ${docRef.id}`);
        return docRef.id;
    } catch (error) {
        console.error('❌ Failed to create simple notification:', error);
        throw error;
    }
}
