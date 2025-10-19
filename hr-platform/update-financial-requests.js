// Script to update existing financial requests with repayment info
// Run this once to fix old requests that don't have the new fields

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, doc, updateDoc } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: "AIzaSyD8t3s5VGQxm9yP7rK1wL3nJ4mH6fE8oB0",
    authDomain: "hris-system-baa22.firebaseapp.com",
    projectId: "hris-system-baa22",
    storageBucket: "hris-system-baa22.firebasestorage.app",
    messagingSenderId: "563898942372",
    appId: "1:563898942372:web:8c5ebae1dfaf072858b731",
    measurementId: "G-1DJP5DJX92"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function updateFinancialRequests() {
    try {
        console.log('🔍 Fetching financial requests...');
        const requestsRef = collection(db, 'financial_requests');
        const snapshot = await getDocs(requestsRef);

        console.log(`📊 Found ${snapshot.docs.length} requests`);

        for (const docSnap of snapshot.docs) {
            const request = docSnap.data();
            const requestId = docSnap.id;

            // Only update loans and advances that are paid/approved but missing repayment info
            if ((request.requestType === 'loan' || request.requestType === 'advance') &&
                (request.status === 'paid' || request.status === 'approved')) {

                // Check if already has the new fields
                if (!request.repaymentType) {
                    const updates = {
                        repaymentType: 'full', // Default to full repayment
                        installmentMonths: 1,
                        installmentAmount: request.amount,
                        amountRecovered: 0,
                        remainingBalance: request.amount,
                        linkedPayrollIds: []
                    };

                    console.log(`🔧 Updating request ${requestId}:`, {
                        employeeId: request.employeeId,
                        type: request.requestType,
                        amount: request.amount,
                        status: request.status
                    });

                    await updateDoc(doc(db, 'financial_requests', requestId), updates);
                    console.log(`✅ Updated ${requestId}`);
                } else {
                    console.log(`⏭️ Skipping ${requestId} - already has repayment info`);
                }
            }
        }

        console.log('✅ All requests updated!');
        console.log('🔄 Please refresh your HR Payroll page to see the changes');
    } catch (error) {
        console.error('❌ Error updating requests:', error);
    }
}

updateFinancialRequests();

