import { getFirebaseDb } from '../config/firebase';
import { collection, addDoc, getDocs, query, where, deleteDoc, doc, updateDoc } from 'firebase/firestore';

export interface DocumentMetadata {
    id?: string; // Firestore document ID
    companyId: string;
    employeeId: string;
    uploadedBy: 'employee' | 'hr';
    documentType: string; // e.g., 'personal-documents', 'contracts', 'id-proof'
    fileName: string;
    fileSize: number; // in bytes
    fileType: string; // MIME type
    publicId: string; // Cloudinary public ID
    secureUrl: string; // Cloudinary secure URL
    uploadedAt: Date;
    metadata?: Record<string, any>; // Additional custom metadata
}

class DocumentMetadataService {
    private collectionName = 'documentMetadata';

    async saveDocumentMetadata(metadata: Omit<DocumentMetadata, 'id' | 'uploadedAt'>): Promise<{ success: boolean; id?: string; error?: string }> {
        try {
            const db = getFirebaseDb();
            const docRef = await addDoc(collection(db, this.collectionName), {
                ...metadata,
                uploadedAt: new Date(),
            });
            return { success: true, id: docRef.id };
        } catch (error: any) {
            console.error('❌ [Document Metadata] Failed to save:', error);
            return { success: false, error: error.message };
        }
    }

    async getEmployeeDocuments(companyId: string, employeeId: string): Promise<{ success: boolean; documents?: DocumentMetadata[]; error?: string }> {
        try {
            const db = getFirebaseDb();
            const q = query(
                collection(db, this.collectionName),
                where('companyId', '==', companyId),
                where('employeeId', '==', employeeId)
            );
            const querySnapshot = await getDocs(q);
            const documents: DocumentMetadata[] = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            } as DocumentMetadata));
            return { success: true, documents };
        } catch (error: any) {
            console.error('❌ [Document Metadata] Failed to retrieve:', error);
            return { success: false, error: error.message };
        }
    }

    async deleteDocumentMetadata(id: string): Promise<{ success: boolean; error?: string }> {
        try {
            const db = getFirebaseDb();
            await deleteDoc(doc(db, this.collectionName, id));
            return { success: true };
        } catch (error: any) {
            console.error('❌ [Document Metadata] Failed to delete:', error);
            return { success: false, error: error.message };
        }
    }

    async updateDocumentMetadata(id: string, updates: Partial<DocumentMetadata>): Promise<{ success: boolean; error?: string }> {
        try {
            const db = getFirebaseDb();
            await updateDoc(doc(db, this.collectionName, id), updates);
            return { success: true };
        } catch (error: any) {
            console.error('❌ [Document Metadata] Failed to update:', error);
            return { success: false, error: error.message };
        }
    }

    // Real-time listener for document updates
    async subscribeToEmployeeDocuments(
        companyId: string,
        employeeId: string,
        callback: (documents: DocumentMetadata[]) => void
    ): Promise<() => void> {
        try {
            const db = getFirebaseDb();
            const q = query(
                collection(db, this.collectionName),
                where('companyId', '==', companyId),
                where('employeeId', '==', employeeId)
            );

            // Note: For real-time updates, you would use onSnapshot instead of getDocs
            // This is a simplified version for now
            const querySnapshot = await getDocs(q);
            const documents: DocumentMetadata[] = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            } as DocumentMetadata));

            callback(documents);

            // Return unsubscribe function (simplified for now)
            return () => { };
        } catch (error: any) {
            console.error('❌ [Document Metadata] Failed to subscribe:', error);
            callback([]);
            return () => { };
        }
    }
}

export const documentMetadataService = new DocumentMetadataService();