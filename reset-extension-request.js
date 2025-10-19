// Reset Extension Request Fields - For Testing
// This script resets the extension request on a goal so you can test the approval flow again

const admin = require('firebase-admin');

// Initialize Firebase Admin
try {
    const serviceAccount = require('./hr-platform/serviceAccountKey.json');
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
} catch (error) {
    console.log('⚠️ Using default credentials');
    admin.initializeApp();
}

const db = admin.firestore();

async function resetExtensionRequest(goalId) {
    try {
        const goalRef = db.collection('performanceGoals').doc(goalId);

        await goalRef.update({
            extensionRequested: false,
            extensionApproved: admin.firestore.FieldValue.delete(),
            extensionApprovedBy: admin.firestore.FieldValue.delete(),
            extensionApprovedDate: admin.firestore.FieldValue.delete(),
            extensionRequestDate: admin.firestore.FieldValue.delete(),
            extensionRequestReason: admin.firestore.FieldValue.delete(),
            requestedNewDeadline: admin.firestore.FieldValue.delete(),
            extensionRejectionReason: admin.firestore.FieldValue.delete(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });

        console.log('✅ Extension request fields reset for goal:', goalId);
        console.log('📝 You can now submit a new extension request for testing');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error resetting extension request:', error);
        process.exit(1);
    }
}

// Get goal ID from command line or use the one from logs
const goalId = process.argv[2] || 'DKWevfv7zPcfTtPPc19x';

console.log('🔄 Resetting extension request for goal:', goalId);
resetExtensionRequest(goalId);











