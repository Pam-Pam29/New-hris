/**
 * Clean All Firebase Data (Preserves Collections)
 * This script deletes all documents from all collections but keeps the collection structure
 */

const admin = require('firebase-admin');
const serviceAccount = require('../hr-platform/serviceAccountKey.json');

// Initialize Firebase Admin
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

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
    'meetingSchedules'
];

async function deleteCollection(collectionName) {
    const collectionRef = db.collection(collectionName);
    const snapshot = await collectionRef.get();

    if (snapshot.empty) {
        console.log(`📋 ${collectionName}: Already empty (0 documents)`);
        return 0;
    }

    console.log(`🗑️  ${collectionName}: Deleting ${snapshot.size} documents...`);

    const batch = db.batch();
    let count = 0;

    snapshot.docs.forEach((doc) => {
        batch.delete(doc.ref);
        count++;
    });

    await batch.commit();
    console.log(`✅ ${collectionName}: Deleted ${count} documents`);
    return count;
}

async function cleanAllData() {
    console.log('\n🧹 STARTING DATA CLEANUP...\n');
    console.log('='.repeat(60));

    let totalDeleted = 0;
    const results = [];

    for (const collection of COLLECTIONS) {
        try {
            const deleted = await deleteCollection(collection);
            totalDeleted += deleted;
            results.push({ collection, deleted, status: 'success' });
        } catch (error) {
            console.error(`❌ ${collection}: Error - ${error.message}`);
            results.push({ collection, deleted: 0, status: 'error', error: error.message });
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




