import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../config/firebase';

export async function clearFirebaseCollections() {
    if (!db) {
        console.log('🚫 Firebase not initialized, nothing to clear');
        return;
    }

    const collectionsToClean = [
        'employees',
        'leaveTypes',
        'leaveRequests',
        'policies',
        'notifications',
        'performanceGoals',
        'performanceReviews',
        'meetingSchedules'
    ];

    console.log('🧹 Starting Firebase data cleanup...');

    for (const collectionName of collectionsToClean) {
        try {
            const collectionRef = collection(db, collectionName);
            const snapshot = await getDocs(collectionRef);

            if (snapshot.empty) {
                console.log(`✅ ${collectionName}: Already empty`);
                continue;
            }

            const deletePromises = snapshot.docs.map(docSnapshot =>
                deleteDoc(doc(db, collectionName, docSnapshot.id))
            );

            await Promise.all(deletePromises);
            console.log(`🗑️ ${collectionName}: Deleted ${snapshot.docs.length} documents`);
        } catch (error) {
            console.warn(`⚠️ ${collectionName}: Error clearing collection`, error);
        }
    }

    console.log('✨ Firebase cleanup completed!');
}

export async function clearSpecificEmployee(employeeId: string) {
    if (!db) {
        console.log('🚫 Firebase not initialized');
        return;
    }

    try {
        const employeeDoc = doc(db, 'employees', employeeId);
        await deleteDoc(employeeDoc);
        console.log(`🗑️ Deleted employee profile: ${employeeId}`);
    } catch (error) {
        console.warn(`⚠️ Error deleting employee ${employeeId}:`, error);
    }
}

