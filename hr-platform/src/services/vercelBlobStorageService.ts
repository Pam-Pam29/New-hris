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

class VercelBlobStorageService {
    private baseUrl: string;

    constructor() {
        // Use the current deployed HR platform URL for API calls
        this.baseUrl = window.location.origin;
    }

    /**
     * Upload a document using Vercel Blob Storage
     */
    async uploadDocument(
        file: File,
        path: string,
        metadata?: Record<string, string>
    ): Promise<{ success: boolean; downloadURL?: string; error?: string }> {
        try {
            console.log('📄 [Vercel Blob] Uploading document:', {
                fileName: file.name,
                fileSize: file.size,
                fileType: file.type,
                path: path
            });

            // Create FormData for file upload
            const formData = new FormData();
            formData.append('file', file);
            formData.append('path', path);

            // Add metadata if provided
            if (metadata) {
                formData.append('metadata', JSON.stringify(metadata));
            }

            // Upload to Vercel Blob via API route
            const response = await fetch(`${this.baseUrl}/api/upload-document`, {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Upload failed: ${response.status} - ${errorText}`);
            }

            const result = await response.json();

            if (result.success) {
                console.log('✅ [Vercel Blob] Document uploaded successfully:', {
                    fileName: file.name,
                    downloadURL: result.downloadURL
                });

                return {
                    success: true,
                    downloadURL: result.downloadURL
                };
            } else {
                throw new Error(result.error || 'Upload failed');
            }

        } catch (error: any) {
            console.error('❌ [Vercel Blob] Upload failed:', error);
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
            const response = await fetch(`${this.baseUrl}/api/get-document-url`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ path }),
            });

            if (!response.ok) {
                throw new Error(`Failed to get download URL: ${response.status}`);
            }

            const result = await response.json();

            if (result.success) {
                return {
                    success: true,
                    downloadURL: result.downloadURL
                };
            } else {
                throw new Error(result.error || 'Failed to get download URL');
            }

        } catch (error: any) {
            console.error('❌ [Vercel Blob] Failed to get download URL:', error);
            return {
                success: false,
                error: error.message || 'Failed to get download URL'
            };
        }
    }

    /**
     * Delete a document
     */
    async deleteDocument(path: string): Promise<{ success: boolean; error?: string }> {
        try {
            const response = await fetch(`${this.baseUrl}/api/delete-document`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ path }),
            });

            if (!response.ok) {
                throw new Error(`Delete failed: ${response.status}`);
            }

            const result = await response.json();

            if (result.success) {
                console.log('✅ [Vercel Blob] Document deleted successfully:', path);
                return { success: true };
            } else {
                throw new Error(result.error || 'Delete failed');
            }

        } catch (error: any) {
            console.error('❌ [Vercel Blob] Delete failed:', error);
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
            const response = await fetch(`${this.baseUrl}/api/list-documents`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ folderPath }),
            });

            if (!response.ok) {
                throw new Error(`List documents failed: ${response.status}`);
            }

            const result = await response.json();

            if (result.success) {
                console.log('✅ [Vercel Blob] Listed documents:', {
                    folderPath: folderPath,
                    documentCount: result.documents?.length || 0
                });

                return {
                    success: true,
                    documents: result.documents || []
                };
            } else {
                throw new Error(result.error || 'Failed to list documents');
            }

        } catch (error: any) {
            console.error('❌ [Vercel Blob] List documents failed:', error);
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
            const response = await fetch(`${this.baseUrl}/api/get-document-metadata`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ path }),
            });

            if (!response.ok) {
                throw new Error(`Get metadata failed: ${response.status}`);
            }

            const result = await response.json();

            if (result.success) {
                return {
                    success: true,
                    metadata: result.metadata
                };
            } else {
                throw new Error(result.error || 'Failed to get metadata');
            }

        } catch (error: any) {
            console.error('❌ [Vercel Blob] Get metadata failed:', error);
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
        const timestamp = Date.now();

        return `companies/${companyId}/employees/${employeeId}/${documentType}/${timestamp}_${cleanFileName}`;
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
        const timestamp = Date.now();

        return `companies/${companyId}/documents/${documentType}/${timestamp}_${cleanFileName}`;
    }

    /**
     * Check if storage is available
     */
    isAvailable(): boolean {
        return true; // Vercel Blob is always available when deployed
    }
}

// Create and export a singleton instance
export const vercelBlobStorageService = new VercelBlobStorageService();
export default vercelBlobStorageService;


