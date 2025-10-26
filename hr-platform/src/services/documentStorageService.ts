import {
    getFirebaseStorage,
    isFirebaseConfigured
} from '../config/firebase';
import {
    ref,
    uploadBytes,
    getDownloadURL,
    deleteObject,
    listAll,
    getMetadata,
    UploadResult,
    StorageReference
} from 'firebase/storage';

export interface DocumentMetadata {
    name: string;
    size: number;
    type: string;
    lastModified: Date;
    downloadURL: string;
    path: string;
}

export interface UploadProgress {
    bytesTransferred: number;
    totalBytes: number;
    percentage: number;
}

class DocumentStorageService {
    private storage: any = null;
    private initialized = false;
    private initPromise: Promise<void> | null = null;

    constructor() {
        // Initialize storage synchronously on construction
        this.initializeSyncStorage();
    }

    private initializeSyncStorage() {
        try {
            // Get storage immediately
            this.storage = getFirebaseStorage();
            this.initialized = true;
            console.log('✅ Document Storage Service initialized with Firebase Storage');
        } catch (error) {
            console.error('❌ Failed to initialize document storage:', error);
            this.initialized = false;
        }
    }

    private async ensureInitialized() {
        if (!this.initialized) {
            this.initializeSyncStorage();
        }
        return this.initialized;
    }

    /**
     * Upload a document to Firebase Storage
     */
    async uploadDocument(
        file: File,
        path: string,
        metadata?: Record<string, string>
    ): Promise<{ success: boolean; downloadURL?: string; error?: string }> {
        try {
            await this.ensureInitialized();

            if (!this.initialized || !this.storage) {
                throw new Error('Document storage not initialized');
            }

            console.log('📄 [Document Storage] Uploading document:', {
                fileName: file.name,
                fileSize: file.size,
                fileType: file.type,
                path: path
            });

            // Create storage reference
            const storageRef = ref(this.storage, path);

            // Upload file with metadata
            const uploadMetadata = {
                contentType: file.type,
                customMetadata: {
                    originalName: file.name,
                    uploadedAt: new Date().toISOString(),
                    ...metadata
                }
            };

            const uploadResult: UploadResult = await uploadBytes(storageRef, file, uploadMetadata);

            // Get download URL
            const downloadURL = await getDownloadURL(uploadResult.ref);

            console.log('✅ [Document Storage] Document uploaded successfully:', {
                fileName: file.name,
                downloadURL: downloadURL
            });

            return {
                success: true,
                downloadURL: downloadURL
            };

        } catch (error: any) {
            console.error('❌ [Document Storage] Upload failed:', error);
            return {
                success: false,
                error: error.message || 'Upload failed'
            };
        }
    }

    /**
     * Get download URL for a document
     */
    async getDownloadURL(path: string): Promise<{ success: boolean; downloadURL?: string; error?: string }> {
        try {
            if (!this.initialized || !this.storage) {
                throw new Error('Document storage not initialized');
            }

            const storageRef = ref(this.storage, path);
            const downloadURL = await getDownloadURL(storageRef);

            return {
                success: true,
                downloadURL: downloadURL
            };

        } catch (error: any) {
            console.error('❌ [Document Storage] Failed to get download URL:', error);
            return {
                success: false,
                error: error.message || 'Failed to get download URL'
            };
        }
    }

    /**
     * Delete a document from storage
     */
    async deleteDocument(path: string): Promise<{ success: boolean; error?: string }> {
        try {
            if (!this.initialized || !this.storage) {
                throw new Error('Document storage not initialized');
            }

            const storageRef = ref(this.storage, path);
            await deleteObject(storageRef);

            console.log('✅ [Document Storage] Document deleted successfully:', path);

            return {
                success: true
            };

        } catch (error: any) {
            console.error('❌ [Document Storage] Delete failed:', error);
            return {
                success: false,
                error: error.message || 'Delete failed'
            };
        }
    }

    /**
     * List all documents in a folder
     */
    async listDocuments(folderPath: string): Promise<{ success: boolean; documents?: DocumentMetadata[]; error?: string }> {
        try {
            await this.ensureInitialized();

            if (!this.initialized || !this.storage) {
                throw new Error('Document storage not initialized');
            }

            const folderRef = ref(this.storage, folderPath);
            const result = await listAll(folderRef);

            const documents: DocumentMetadata[] = [];

            // Get metadata for each document
            for (const itemRef of result.items) {
                try {
                    const metadata = await getMetadata(itemRef);
                    const downloadURL = await getDownloadURL(itemRef);

                    documents.push({
                        name: metadata.name,
                        size: metadata.size,
                        type: metadata.contentType || 'unknown',
                        lastModified: new Date(metadata.updated),
                        downloadURL: downloadURL,
                        path: itemRef.fullPath
                    });
                } catch (error) {
                    console.warn('⚠️ [Document Storage] Failed to get metadata for:', itemRef.fullPath);
                }
            }

            console.log('✅ [Document Storage] Listed documents:', {
                folderPath: folderPath,
                documentCount: documents.length
            });

            return {
                success: true,
                documents: documents
            };

        } catch (error: any) {
            console.error('❌ [Document Storage] List documents failed:', error);
            return {
                success: false,
                error: error.message || 'Failed to list documents'
            };
        }
    }

    /**
     * Get document metadata
     */
    async getDocumentMetadata(path: string): Promise<{ success: boolean; metadata?: DocumentMetadata; error?: string }> {
        try {
            if (!this.initialized || !this.storage) {
                throw new Error('Document storage not initialized');
            }

            const storageRef = ref(this.storage, path);
            const metadata = await getMetadata(storageRef);
            const downloadURL = await getDownloadURL(storageRef);

            const documentMetadata: DocumentMetadata = {
                name: metadata.name,
                size: metadata.size,
                type: metadata.contentType || 'unknown',
                lastModified: new Date(metadata.updated),
                downloadURL: downloadURL,
                path: storageRef.fullPath
            };

            return {
                success: true,
                metadata: documentMetadata
            };

        } catch (error: any) {
            console.error('❌ [Document Storage] Get metadata failed:', error);
            return {
                success: false,
                error: error.message || 'Failed to get metadata'
            };
        }
    }

    /**
     * Generate a secure path for employee documents
     */
    generateEmployeeDocumentPath(
        companyId: string,
        employeeId: string,
        documentType: string,
        fileName: string
    ): string {
        // Clean the fileName to remove special characters
        const cleanFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');

        return `companies/${companyId}/employees/${employeeId}/${documentType}/${cleanFileName}`;
    }

    /**
     * Generate a secure path for company documents
     */
    generateCompanyDocumentPath(
        companyId: string,
        documentType: string,
        fileName: string
    ): string {
        const cleanFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');

        return `companies/${companyId}/documents/${documentType}/${cleanFileName}`;
    }

    /**
     * Check if storage is available
     */
    isAvailable(): boolean {
        return this.initialized && this.storage !== null;
    }
}

// Create and export a singleton instance
export const documentStorageService = new DocumentStorageService();
export default documentStorageService;

