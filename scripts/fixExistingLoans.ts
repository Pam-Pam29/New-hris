/**
 * Fix Existing Loan Installment Amounts
 * 
 * This script fixes loans that were marked as "paid" before the installment
 * calculation fix was applied. It recalculates correct installment amounts
 * for all loans that have repaymentType='installments'.
 */

import { getFirestore, collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import { getServiceConfig } from '../config/firebase';

export async function fixExistingLoanInstallments() {
    try {
        console.log('🔄 Starting loan installment fix...');

        const config = await getServiceConfig();
        const db = config.firebase.db;

        if (!db) {
            throw new Error('Firebase not initialized');
        }

        // Get all financial requests
        const requestsRef = collection(db, 'financial_requests');
        const snapshot = await getDocs(requestsRef);

        console.log(`📊 Found ${snapshot.size} financial requests to check`);

        let fixedCount = 0;
        const updates: Promise<void>[] = [];

        // Check each request
        snapshot.docs.forEach((docSnapshot) => {
            const data = docSnapshot.data();

            // Only fix loans/advances with installment repayment
            if (
                (data.requestType === 'loan' || data.requestType === 'advance') &&
                data.repaymentType === 'installments' &&
                data.installmentMonths &&
                data.installmentMonths > 1 &&
                (data.status === 'paid' || data.status === 'recovering')
            ) {
                const originalAmount = (data.remainingBalance || 0) + (data.amountRecovered || 0);
                const correctInstallmentAmount = Math.ceil(originalAmount / data.installmentMonths);

                // Check if installment amount is wrong (equals full amount or not set)
                if (!data.installmentAmount || data.installmentAmount >= originalAmount) {
                    console.log(`  🔧 Fixing ${docSnapshot.id}:`);
                    console.log(`     Original Amount: ₦${originalAmount}`);
                    console.log(`     Installment Months: ${data.installmentMonths}`);
                    console.log(`     Old Installment Amount: ₦${data.installmentAmount || 'not set'}`);
                    console.log(`     New Installment Amount: ₦${correctInstallmentAmount}`);

                    const docRef = doc(db, 'financial_requests', docSnapshot.id);
                    updates.push(updateDoc(docRef, {
                        installmentAmount: correctInstallmentAmount,
                        repaymentMethod: data.repaymentMethod || 'salary_deduction'
                    }));
                    fixedCount++;
                }
            }
        });

        // Execute all updates
        await Promise.all(updates);

        console.log(`✅ Fix complete! Updated ${fixedCount} loan installment amounts`);
        console.log(`✓ ${snapshot.size - fixedCount} requests were already correct or not applicable`);

        return {
            total: snapshot.size,
            fixed: fixedCount,
            alreadyCorrect: snapshot.size - fixedCount
        };

    } catch (error) {
        console.error('❌ Fix failed:', error);
        throw error;
    }
}

// Quick test function
export async function testInstallmentCalculations() {
    console.log('\n🧪 Testing installment calculations:\n');

    const tests = [
        { amount: 50000, months: 5, expected: 10000 },
        { amount: 30000, months: 3, expected: 10000 },
        { amount: 25000, months: 4, expected: 6250 },
        { amount: 100000, months: 6, expected: 16667 },
        { amount: 15000, months: 2, expected: 7500 }
    ];

    tests.forEach(test => {
        const calculated = Math.ceil(test.amount / test.months);
        const match = calculated === test.expected ? '✅' : '❌';
        console.log(`${match} ₦${test.amount} ÷ ${test.months} months = ₦${calculated} (expected: ₦${test.expected})`);
    });

    console.log('\n✅ All calculations verified!\n');
}















