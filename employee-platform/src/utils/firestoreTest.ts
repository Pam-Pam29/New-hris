// Test utility to verify Firestore document metadata collection
import { db } from '../config/firebase';
import { collection, addDoc, getDocs } from 'firebase/firestore';

export const testFirestoreDocumentMetadata = async () => {
    try {
        console.log('🧪 [Firestore Test] Testing document metadata collection...');

        // Test reading from documentMetadata collection
        const testQuery = await getDocs(collection(db, 'documentMetadata'));
        console.log('✅ [Firestore Test] Successfully read documentMetadata collection:', testQuery.size, 'documents');

        // Test writing to documentMetadata collection
        const testDoc = await addDoc(collection(db, 'documentMetadata'), {
            test: true,
            timestamp: new Date(),
            employeeId: 'TEST'
        });
        console.log('✅ [Firestore Test] Successfully wrote to documentMetadata collection:', testDoc.id);

        return { success: true };
    } catch (error: any) {
        console.error('❌ [Firestore Test] Failed:', error);
        return { success: false, error: error.message };
    }
};
