/**
 * BULK UPDATE SCRIPT: Add companyId to ALL existing data
 * 
 * This script updates ALL collections in Firebase to include companyId
 * Run this ONCE after creating your first company
 * 
 * Usage: node add-company-id-to-all-data.js <companyId>
 * Example: node add-company-id-to-all-data.js QZDV70m6tV7VZExQlwlK
 */

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, doc, updateDoc } from 'firebase/firestore';

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyCHvcIcFr5IbYtx52hB0Yy_GzfiWWz8wTY",
    authDomain: "hris-1c75d.firebaseapp.com",
    projectId: "hris-1c75d",
    storageBucket: "hris-1c75d.firebasestorage.app",
    messagingSenderId: "422308244798",
    appId: "1:422308244798:web:e08f2c60de10e8dda79d66"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// ALL collections that need companyId
const collectionsToUpdate = [
    // Core HR
    'employees',
    'employeeProfiles',

    // Recruitment & Hiring
    'job_postings',
    'recruitment_candidates',
    'interviews',
    'job_applications',
    'candidates',

    // Leave Management
    'leaveRequests',
    'leaveBalances',
    'leaveTypes',

    // Performance Management
    'performanceGoals',
    'performanceReviews',
    'performanceMeetings',
    'meetingSchedules',

    // Time Management
    'timeEntries',
    'attendance',
    'timeTracking',
    'schedules',
    'workSchedules',
    'shiftTemplates',
    'timeAdjustmentRequests',
    'timeNotifications',

    // Payroll
    'payroll',
    'payroll_records',
    'financial_requests',

    // Asset Management
    'assets',
    'assetAssignments',
    'assetRequests',
    'maintenanceRecords',

    // Policy Management
    'policies',
    'policyAcknowledgments',

    // Onboarding
    'onboardingChecklists',

    // Other
    'notifications',
    'activityLogs',
    'hrAvailability',
    'hrSettings',
    'employeeDashboardData'
];

async function addCompanyIdToAllData(companyId) {
    console.log('🚀 BULK UPDATE: Adding companyId to ALL collections\n');
    console.log(`Company ID: ${companyId}\n`);
    console.log('─'.repeat(60));

    let totalUpdated = 0;
    let totalSkipped = 0;
    let totalErrors = 0;

    for (const collectionName of collectionsToUpdate) {
        try {
            console.log(`\n📁 Processing: ${collectionName}`);

            const snapshot = await getDocs(collection(db, collectionName));

            if (snapshot.empty) {
                console.log(`   ⏭️  Empty collection (0 documents)`);
                continue;
            }

            let updated = 0;
            let skipped = 0;

            for (const docSnap of snapshot.docs) {
                const data = docSnap.data();

                if (!data.companyId) {
                    try {
                        await updateDoc(doc(db, collectionName, docSnap.id), {
                            companyId: companyId
                        });
                        updated++;
                    } catch (error) {
                        console.error(`   ❌ Error updating ${docSnap.id}:`, error.message);
                        totalErrors++;
                    }
                } else {
                    skipped++;
                }
            }

            console.log(`   ✅ Updated: ${updated} documents`);
            console.log(`   ⏭️  Skipped: ${skipped} documents (already have companyId)`);

            totalUpdated += updated;
            totalSkipped += skipped;

        } catch (error) {
            console.error(`   ❌ Error accessing ${collectionName}:`, error.message);
            totalErrors++;
        }
    }

    console.log('\n' + '─'.repeat(60));
    console.log('\n📊 SUMMARY:');
    console.log(`   ✅ Total Updated: ${totalUpdated} documents`);
    console.log(`   ⏭️  Total Skipped: ${totalSkipped} documents`);
    console.log(`   ❌ Total Errors: ${totalErrors}`);
    console.log('\n✅ Bulk update complete!\n');

    process.exit(0);
}

// Get company ID from command line
const companyId = process.argv[2];

if (!companyId) {
    console.error('❌ Error: No company ID provided!\n');
    console.error('Usage: node add-company-id-to-all-data.js <companyId>');
    console.error('\nExample:');
    console.error('  node add-company-id-to-all-data.js QZDV70m6tV7VZExQlwlK');
    console.error('\nYour company IDs:');
    console.error('  Acme:     QZDV70m6tV7VZExQlwlK');
    console.error('  TechCorp: Vyn4zrzcSnUT7et0ldcm');
    console.error('  Globex:   ng1xv08qsBL9FtNXLQBx\n');
    process.exit(1);
}

console.log('\n⚠️  WARNING: This will update ALL existing data in Firebase!');
console.log(`All data will be assigned to company ID: ${companyId}\n`);
console.log('Press Ctrl+C to cancel, or wait 5 seconds to continue...\n');

setTimeout(() => {
    addCompanyIdToAllData(companyId);
}, 5000);





