import { db } from '../config/firebase';
import { collection, query, where, getDocs, addDoc, deleteDoc, doc } from 'firebase/firestore';

export interface DocumentMetadata {
    name: string;
    originalName?: string;
    size: number;
    type: string;
    lastModified: Date;
    downloadURL: string;
    path: string;
    publicId?: string;
    companyId?: string;
    employeeId?: string;
    documentType?: string;
    uploadedBy?: string;
    uploadedAt?: string;
}

class DocumentMetadataService {
    private collectionName = 'documentMetadata';

    /**
     * Save document metadata to Firestore
     */
    async saveDocumentMetadata(metadata: Omit<DocumentMetadata, 'lastModified'> & { lastModified?: Date }): Promise<{ success: boolean; error?: string }> {
        try {
            const docData = {
                ...metadata,
                lastModified: metadata.lastModified || new Date(),
                createdAt: new Date()
            };

            await addDoc(collection(db, this.collectionName), docData);

            console.log('✅ [Document Metadata] Saved to Firestore:', metadata.name);
            return { success: true };
        } catch (error: any) {
            console.error('❌ [Document Metadata] Failed to save:', error);
            return {
                success: false,
                error: error.message || 'Failed to save metadata'
            };
        }
    }

    /**
     * Get all documents for an employee
     */
    async getEmployeeDocuments(companyId: string, employeeId: string): Promise<{ success: boolean; documents?: DocumentMetadata[]; error?: string }> {
        try {
            const q = query(
                collection(db, this.collectionName),
                where('companyId', '==', companyId),
                where('employeeId', '==', employeeId)
            );

            const querySnapshot = await getDocs(q);
            const documents: DocumentMetadata[] = [];

            querySnapshot.forEach((doc) => {
                const data = doc.data();
                documents.push({
                    ...data,
                    id: doc.id,
                    lastModified: data.lastModified?.toDate ? data.lastModified.toDate() : new Date(data.lastModified)
                } as DocumentMetadata);
            });

            console.log('✅ [Document Metadata] Retrieved documents:', documents.length);
            return {
                success: true,
                documents: documents
            };
        } catch (error: any) {
            console.error('❌ [Document Metadata] Failed to retrieve:', error);
            return {
                success: false,
                error: error.message || 'Failed to retrieve documents'
            };
        }
    }

    /**
     * Delete document metadata from Firestore
     */
    async deleteDocumentMetadata(publicId: string): Promise<{ success: boolean; error?: string }> {
        try {
            const q = query(
                collection(db, this.collectionName),
                where('publicId', '==', publicId)
            );

            const querySnapshot = await getDocs(q);

            if (!querySnapshot.empty) {
                await deleteDoc(querySnapshot.docs[0].ref);
                console.log('✅ [Document Metadata] Deleted from Firestore');
            }

            return { success: true };
        } catch (error: any) {
            console.error('❌ [Document Metadata] Failed to delete:', error);
            return {
                success: false,
                error: error.message || 'Failed to delete metadata'
            };
        }
    }
}

export const documentMetadataService = new DocumentMetadataService();
export default documentMetadataService;

