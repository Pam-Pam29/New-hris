import { cloudinaryStorageService } from './cloudinaryStorageService';
import { documentMetadataService, DocumentMetadata } from './documentMetadataService';

class DocumentService {
    /**
     * Upload a document with metadata tracking
     */
    async uploadDocument(
        file: File,
        companyId: string,
        employeeId: string,
        documentType: string,
        uploadedBy: string
    ): Promise<{ success: boolean; downloadURL?: string; error?: string }> {
        try {
            // Generate folder path
            const folderPath = cloudinaryStorageService.generateEmployeeDocumentPath(
                companyId,
                employeeId,
                documentType,
                file.name
            );

            // Upload to Cloudinary
            const uploadResult = await cloudinaryStorageService.uploadDocument(file, folderPath, {
                employeeId,
                documentType,
                uploadedBy
            });

            if (!uploadResult.success) {
                return uploadResult;
            }

            // Create descriptive name with document type prefix
            const getDocumentTypePrefix = (docType: string): string => {
                switch (docType) {
                    case 'id-document':
                        return 'ID';
                    case 'passport':
                        return 'Passport';
                    case 'drivers-license':
                        return 'Driver\'s License';
                    case 'degree-certificate':
                        return 'Education';
                    case 'resume-cv':
                        return 'Resume/CV';
                    case 'reference-letter':
                        return 'Reference';
                    case 'contract-agreement':
                        return 'Contract';
                    case 'bank-statement':
                        return 'Bank Statement';
                    case 'tax-document':
                        return 'Tax';
                    case 'other-document':
                        return 'Other';
                    default:
                        return 'Document';
                }
            };

            const documentTypePrefix = getDocumentTypePrefix(documentType);
            const descriptiveName = `${documentTypePrefix} - ${file.name}`;

            // Store document info in localStorage for temporary listing
            const documentInfo = {
                id: uploadResult.publicId || Date.now().toString(),
                name: descriptiveName,
                originalName: file.name,
                size: file.size,
                type: file.type,
                downloadURL: uploadResult.downloadURL!,
                publicId: uploadResult.publicId,
                companyId,
                employeeId,
                documentType,
                uploadedBy,
                uploadedAt: new Date().toISOString(),
                lastModified: new Date().toISOString()
            };

            // Save metadata to Firestore for cross-platform access
            const metadataResult = await documentMetadataService.saveDocumentMetadata({
                companyId,
                employeeId,
                uploadedBy,
                documentType,
                fileName: file.name,
                fileSize: file.size,
                fileType: file.type,
                publicId: uploadResult.publicId || '',
                secureUrl: uploadResult.downloadURL || '',
                uploadedAt: new Date(),
                metadata: {
                    originalName: file.name,
                    descriptiveName: descriptiveName
                }
            });

            if (metadataResult.success) {
                console.log('✅ [Document Service] Metadata saved to Firestore:', metadataResult.id);
            } else {
                console.warn('⚠️ [Document Service] Failed to save metadata to Firestore:', metadataResult.error);
            }

            // Also store in localStorage for temporary backup
            const storageKey = `documents_${companyId}_${employeeId}`;
            const existingDocs = JSON.parse(localStorage.getItem(storageKey) || '[]');
            existingDocs.push(documentInfo);
            localStorage.setItem(storageKey, JSON.stringify(existingDocs));

            console.log('✅ [Document Service] Upload successful - Document stored in Cloudinary');
            console.log('📄 [Document Service] Document URL:', uploadResult.downloadURL);
            console.log('📄 [Document Service] Public ID:', uploadResult.publicId);
            console.log('📄 [Document Service] Document info stored in localStorage for listing');

            return {
                success: true,
                downloadURL: uploadResult.downloadURL
            };
        } catch (error: any) {
            console.error('❌ [Document Service] Upload failed:', error);
            return {
                success: false,
                error: error.message || 'Upload failed'
            };
        }
    }

    /**
     * List all documents for an employee
     * Reads from localStorage since Firestore metadata is disabled
     */
    async listDocuments(companyId: string, employeeId: string): Promise<{ success: boolean; documents?: DocumentMetadata[]; error?: string }> {
        try {
            // Try to get documents from Firestore first
            const firestoreResult = await documentMetadataService.getEmployeeDocuments(companyId, employeeId);

            if (firestoreResult.success && firestoreResult.documents) {
                console.log('📄 [Document Service] Found documents in Firestore:', firestoreResult.documents.length);

                // Convert Firestore documents to our format
                const documents: DocumentMetadata[] = firestoreResult.documents.map(doc => {
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
            console.warn('⚠️ [Document Service] Firestore failed, falling back to localStorage');
            const storageKey = `documents_${companyId}_${employeeId}`;
            const storedDocs = localStorage.getItem(storageKey);

            if (!storedDocs) {
                console.log('📄 [Document Service] No documents found in localStorage');
                return {
                    success: true,
                    documents: []
                };
            }

            const documents = JSON.parse(storedDocs);
            console.log('📄 [Document Service] Found documents in localStorage:', documents.length);

            return {
                success: true,
                documents: documents as DocumentMetadata[]
            };
        } catch (error: any) {
            console.error('❌ [Document Service] Failed to list documents:', error);
            return {
                success: false,
                error: error.message || 'Failed to list documents'
            };
        }
    }

    /**
     * Delete a document
     */
    async deleteDocument(publicId: string): Promise<{ success: boolean; error?: string }> {
        try {
            // Delete from Cloudinary
            await cloudinaryStorageService.deleteDocument(publicId);

            // Delete metadata from Firestore
            await documentMetadataService.deleteDocumentMetadata(publicId);

            return { success: true };
        } catch (error: any) {
            console.error('❌ [Document Service] Delete failed:', error);
            return {
                success: false,
                error: error.message || 'Delete failed'
            };
        }
    }
}

export const documentService = new DocumentService();
export default documentService;

