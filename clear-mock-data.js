// Script to clear mock data and test Firebase connection
// Run this after updating Firebase security rules

const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, deleteDoc, doc, writeBatch } = require('firebase/firestore');

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyC6ovwlhX4Mr8WpHoS045wLxHA7t8fRXPI",
    authDomain: "hris-system-baa22.firebaseapp.com",
    projectId: "hris-system-baa22",
    storageBucket: "hris-system-baa22.appspot.com",
    messagingSenderId: "123456789",
    appId: "1:123456789:web:abcdef123456"
};

async function clearAllData() {
    try {
        console.log('🔥 Initializing Firebase...');
        const app = initializeApp(firebaseConfig);
        const db = getFirestore(app);

        console.log('✅ Firebase initialized successfully');

        const collectionsToClear = [
            'employees',
            'leaveTypes',
            'leaveRequests',
            'policies',
            'performanceGoals',
            'performanceReviews',
            'meetingSchedules',
            'notifications',
            'assets'
        ];

        console.log('🧹 Starting data cleanup...');

        for (const collectionName of collectionsToClear) {
            try {
                console.log(`\n📁 Checking collection: ${collectionName}`);
                const collectionRef = collection(db, collectionName);
                const snapshot = await getDocs(collectionRef);

                if (snapshot.empty) {
                    console.log(`✅ ${collectionName}: Already empty`);
                    continue;
                }

                console.log(`🗑️ ${collectionName}: Found ${snapshot.size} documents, deleting...`);

                // Delete in batches
                const batch = writeBatch(db);
                snapshot.docs.forEach((document) => {
                    batch.delete(document.ref);
                });

                await batch.commit();
                console.log(`✅ ${collectionName}: Deleted ${snapshot.size} documents`);

            } catch (error) {
                console.error(`❌ Error clearing ${collectionName}:`, error.message);
            }
        }

        console.log('\n🎉 Data cleanup completed successfully!');
        console.log('💡 You can now create test profiles in the employee platform');

    } catch (error) {
        console.error('❌ Error during cleanup:', error);
        console.log('\n🔧 Troubleshooting:');
        console.log('1. Make sure Firebase security rules allow read/write access');
        console.log('2. Check your internet connection');
        console.log('3. Verify Firebase project ID is correct');
    }
}

// Run the cleanup
clearAllData();


