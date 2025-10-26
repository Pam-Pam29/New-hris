/**
 * Migration Script: Update All Payroll Records Currency to NGN
 * 
 * This script updates all existing payroll records in Firebase
 * from USD (or any other currency) to NGN (Nigerian Naira)
 * 
 * Usage (from hr-platform or employee-platform):
 * 1. Import this in a component temporarily
 * 2. Call migrateCurrencyToNGN() 
 * 3. Remove the import after migration is complete
 */

import { getFirestore, collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import { getServiceConfig } from '../config/firebase';

export async function migrateCurrencyToNGN() {
    try {
        console.log('🔄 Starting currency migration to NGN...');

        const config = await getServiceConfig();
        const db = config.firebase.db;

        if (!db) {
            throw new Error('Firebase not initialized');
        }

        // Get all payroll records
        const payrollRef = collection(db, 'payroll_records');
        const snapshot = await getDocs(payrollRef);

        console.log(`📊 Found ${snapshot.size} payroll records to check`);

        let updatedCount = 0;
        const updates: Promise<void>[] = [];

        // Update each record
        snapshot.docs.forEach((docSnapshot) => {
            const data = docSnapshot.data();

            // Only update if currency is not NGN
            if (data.currency !== 'NGN') {
                console.log(`  - Updating ${docSnapshot.id}: ${data.currency} → NGN`);
                const docRef = doc(db, 'payroll_records', docSnapshot.id);
                updates.push(updateDoc(docRef, { currency: 'NGN' }));
                updatedCount++;
            }
        });

        // Execute all updates
        await Promise.all(updates);

        console.log(`✅ Migration complete! Updated ${updatedCount} records to NGN`);
        console.log(`✓ ${snapshot.size - updatedCount} records were already using NGN`);

        return {
            total: snapshot.size,
            updated: updatedCount,
            alreadyNGN: snapshot.size - updatedCount
        };

    } catch (error) {
        console.error('❌ Migration failed:', error);
        throw error;
    }
}

// Also migrate financial requests if they have currency field
export async function migrateFinancialRequestsCurrencyToNGN() {
    try {
        console.log('🔄 Starting financial requests currency migration to NGN...');

        const config = await getServiceConfig();
        const db = config.firebase.db;

        if (!db) {
            throw new Error('Firebase not initialized');
        }

        // Get all financial requests
        const requestsRef = collection(db, 'financial_requests');
        const snapshot = await getDocs(requestsRef);

        console.log(`📊 Found ${snapshot.size} financial requests to check`);

        let updatedCount = 0;
        const updates: Promise<void>[] = [];

        // Update each record if it has a currency field
        snapshot.docs.forEach((docSnapshot) => {
            const data = docSnapshot.data();

            // Only update if currency field exists and is not NGN
            if (data.currency && data.currency !== 'NGN') {
                console.log(`  - Updating ${docSnapshot.id}: ${data.currency} → NGN`);
                const docRef = doc(db, 'financial_requests', docSnapshot.id);
                updates.push(updateDoc(docRef, { currency: 'NGN' }));
                updatedCount++;
            }
        });

        // Execute all updates
        await Promise.all(updates);

        console.log(`✅ Financial requests migration complete! Updated ${updatedCount} records`);

        return {
            total: snapshot.size,
            updated: updatedCount
        };

    } catch (error) {
        console.error('❌ Financial requests migration failed:', error);
        throw error;
    }
}

// Run both migrations
export async function migrateAllCurrencyToNGN() {
    console.log('🚀 Starting full currency migration to NGN...\n');

    const payrollResults = await migrateCurrencyToNGN();
    console.log('');
    const requestResults = await migrateFinancialRequestsCurrencyToNGN();

    console.log('\n📈 Final Summary:');
    console.log(`  Payroll Records: ${payrollResults.updated}/${payrollResults.total} updated`);
    console.log(`  Financial Requests: ${requestResults.updated}/${requestResults.total} updated`);
    console.log('\n✅ All currency migrations completed successfully!');

    return {
        payroll: payrollResults,
        requests: requestResults
    };
}















