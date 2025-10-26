/**
 * Clean All Firebase Data (Client SDK Version)
 * This script deletes all documents from all collections but keeps the collection structure
 */

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, deleteDoc, doc } from 'firebase/firestore';

// Firebase configuration (from hr-platform/src/config/firebase.ts)
const firebaseConfig = {
    apiKey: "AIzaSyDXSGZkJy5YI02vkqmYmS4PXRVPxBVP_iQ",
    authDomain: "hrplatform-3ab86.firebaseapp.com",
    projectId: "hrplatform-3ab86",
    storageBucket: "hrplatform-3ab86.firebasestorage.app",
    messagingSenderId: "653523738283",
    appId: "1:653523738283:web:e2bf2dac62e7e1a3bdc05a",
    measurementId: "G-KCFZ9P55ZM"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Collections to clean
const COLLECTIONS = [
    'companies',
    'employees',
    'jobPostings',
    'jobApplications',
    'candidates',
    'interviews',
    'leaveTypes',
    'leaveRequests',
    'leaveBalances',
    'timeEntries',
    'attendanceRecords',
    'payrollRecords',
    'assets',
    'assetAssignments',
    'policies',
    'policyAcknowledgments',
    'performanceGoals',
    'performanceReviews',
    'performanceMeetings',
    'notifications',
    'meetingSchedules',
    'departments'
];

async function deleteCollection(collectionName) {
    const collectionRef = collection(db, collectionName);
    const snapshot = await getDocs(collectionRef);

    if (snapshot.empty) {
        console.log(`📋 ${collectionName}: Already empty (0 documents)`);
        return 0;
    }

    console.log(`🗑️  ${collectionName}: Deleting ${snapshot.size} documents...`);

    let count = 0;

    // Delete documents one by one (client SDK limitation)
    for (const docSnapshot of snapshot.docs) {
        await deleteDoc(doc(db, collectionName, docSnapshot.id));
        count++;
    }

    console.log(`✅ ${collectionName}: Deleted ${count} documents`);
    return count;
}

async function cleanAllData() {
    console.log('\n🧹 STARTING DATA CLEANUP...\n');
    console.log('='.repeat(60));

    let totalDeleted = 0;
    const results = [];

    for (const collectionName of COLLECTIONS) {
        try {
            const deleted = await deleteCollection(collectionName);
            totalDeleted += deleted;
            results.push({ collection: collectionName, deleted, status: 'success' });
        } catch (error) {
            console.error(`❌ ${collectionName}: Error - ${error.message}`);
            results.push({ collection: collectionName, deleted: 0, status: 'error', error: error.message });
        }
    }

    console.log('\n' + '='.repeat(60));
    console.log('\n📊 CLEANUP SUMMARY:\n');

    results.forEach(({ collection, deleted, status, error }) => {
        if (status === 'success') {
            console.log(`  ✅ ${collection.padEnd(25)} ${deleted} documents deleted`);
        } else {
            console.log(`  ❌ ${collection.padEnd(25)} Error: ${error}`);
        }
    });

    console.log('\n' + '='.repeat(60));
    console.log(`\n🎉 TOTAL DELETED: ${totalDeleted} documents`);
    console.log('\n✅ All collections preserved (structure intact)');
    console.log('✅ Ready for fresh data!\n');
}

// Run cleanup
cleanAllData()
    .then(() => {
        console.log('✅ Cleanup completed successfully!');
        process.exit(0);
    })
    .catch((error) => {
        console.error('❌ Cleanup failed:', error);
        process.exit(1);
    });











