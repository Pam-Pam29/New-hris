import { DocumentMetadata } from './documentMetadataService';
import { documentMetadataService } from './documentMetadataService';

// HR Document Service for viewing employee documents
class HRDocumentService {
    /**
     * List all documents for a specific employee
     * This service reads from localStorage where employee documents are stored
     */
    async listEmployeeDocuments(companyId: string, employeeId: string): Promise<{ success: boolean; documents?: DocumentMetadata[]; error?: string }> {
        try {
            // Read from Firestore
            const result = await documentMetadataService.getEmployeeDocuments(companyId, employeeId);

            if (result.success && result.documents) {
                console.log(`📄 [HR Document Service] Found ${result.documents.length} documents for employee ${employeeId} in Firestore`);

                // Convert Firestore documents to our display format
                const documents: DocumentMetadata[] = result.documents.map(doc => {
                    // Handle date conversion safely
                    let lastModified = new Date();
                    if (doc.uploadedAt) {
                        if (doc.uploadedAt instanceof Date) {
                            lastModified = doc.uploadedAt;
                        } else if (typeof doc.uploadedAt === 'string') {
                            lastModified = new Date(doc.uploadedAt);
                        } else if (doc.uploadedAt.seconds) {
                            // Handle Firestore Timestamp
                            lastModified = new Date(doc.uploadedAt.seconds * 1000);
                        }
                    }

                    return {
                        id: doc.id,
                        name: doc.metadata?.descriptiveName || doc.fileName,
                        originalName: doc.fileName,
                        size: doc.fileSize,
                        type: doc.fileType,
                        lastModified: lastModified,
                        downloadURL: doc.secureUrl,
                        path: `hris/${companyId}/${employeeId}/${doc.documentType}/${doc.fileName}`,
                        publicId: doc.publicId,
                        companyId: doc.companyId,
                        employeeId: doc.employeeId,
                        documentType: doc.documentType,
                        uploadedBy: doc.uploadedBy,
                        uploadedAt: doc.uploadedAt
                    };
                });

                return {
                    success: true,
                    documents
                };
            }

            // Fallback to localStorage if Firestore fails
            console.warn('⚠️ [HR Document Service] Firestore failed, checking localStorage');
            const storageKey = `documents_${companyId}_${employeeId}`;
            const storedDocs = localStorage.getItem(storageKey);

            if (!storedDocs) {
                console.log('📄 [HR Document Service] No documents found for employee:', employeeId);
                return {
                    success: true,
                    documents: []
                };
            }

            const documents = JSON.parse(storedDocs);
            console.log(`📄 [HR Document Service] Found ${documents.length} documents for employee ${employeeId} in localStorage`);

            return {
                success: true,
                documents: documents as DocumentMetadata[]
            };
        } catch (error: any) {
            console.error('❌ [HR Document Service] Failed to list employee documents:', error);
            return {
                success: false,
                error: error.message || 'Failed to list employee documents'
            };
        }
    }

    /**
     * Get document URL for viewing/downloading
     */
    getDocumentUrl(document: DocumentMetadata): string {
        return document.downloadURL || '';
    }

    /**
     * Check if document exists
     */
    async documentExists(companyId: string, employeeId: string, documentId: string): Promise<boolean> {
        try {
            const result = await this.listEmployeeDocuments(companyId, employeeId);
            if (result.success && result.documents) {
                return result.documents.some(doc => doc.id === documentId || doc.publicId === documentId);
            }
            return false;
        } catch (error) {
            console.error('❌ [HR Document Service] Error checking document existence:', error);
            return false;
        }
    }

    /**
     * Get document by ID
     */
    async getDocumentById(companyId: string, employeeId: string, documentId: string): Promise<DocumentMetadata | null> {
        try {
            const result = await this.listEmployeeDocuments(companyId, employeeId);
            if (result.success && result.documents) {
                return result.documents.find(doc => doc.id === documentId || doc.publicId === documentId) || null;
            }
            return null;
        } catch (error) {
            console.error('❌ [HR Document Service] Error getting document by ID:', error);
            return null;
        }
    }

    /**
     * Group documents by type for better organization
     */
    async getDocumentsByType(companyId: string, employeeId: string): Promise<{ [key: string]: DocumentMetadata[] }> {
        try {
            const result = await this.listEmployeeDocuments(companyId, employeeId);
            if (result.success && result.documents) {
                const grouped: { [key: string]: DocumentMetadata[] } = {};

                result.documents.forEach(doc => {
                    const type = doc.documentType || 'other';
                    if (!grouped[type]) {
                        grouped[type] = [];
                    }
                    grouped[type].push(doc);
                });

                return grouped;
            }
            return {};
        } catch (error) {
            console.error('❌ [HR Document Service] Error grouping documents by type:', error);
            return {};
        }
    }
}

export const hrDocumentService = new HRDocumentService();
export default hrDocumentService;
