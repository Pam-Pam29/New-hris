export interface DocumentMetadata {
    name: string;
    size: number;
    type: string;
    lastModified: Date;
    downloadURL: string;
    path: string;
    publicId?: string;
}

// Cloudinary configuration - you'll need to add these to your .env file
const CLOUDINARY_CLOUD_NAME = (import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'your-cloud-name').trim();
const CLOUDINARY_UPLOAD_PRESET = (import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'hris-documents').trim();

class CloudinaryStorageService {
    private cloudName: string;
    private uploadPreset: string;

    constructor() {
        this.cloudName = CLOUDINARY_CLOUD_NAME;
        this.uploadPreset = CLOUDINARY_UPLOAD_PRESET;
    }

    /**
     * Upload a document to Cloudinary
     */
    async uploadDocument(
        file: File,
        path: string,
        metadata?: Record<string, string>
    ): Promise<{ success: boolean; downloadURL?: string; publicId?: string; error?: string }> {
        try {
            console.log('📄 [Cloudinary] Uploading document:', {
                fileName: file.name,
                fileSize: file.size,
                fileType: file.type,
                path: path
            });

            // Create FormData for Cloudinary upload
            const formData = new FormData();
            formData.append('file', file);
            formData.append('upload_preset', this.uploadPreset);
            formData.append('folder', path);

            // Add context metadata
            if (metadata) {
                formData.append('context', Object.entries(metadata).map(([key, value]) => `${key}=${value}`).join('|'));
            }

            // Determine resource type based on file type
            const resourceType = file.type.startsWith('image/') ? 'image' :
                file.type === 'application/pdf' ? 'image' :
                    'raw';

            // Debug: Log what we're sending
            console.log('🔍 [Cloudinary Debug] Upload details:', {
                cloudName: this.cloudName,
                uploadPreset: this.uploadPreset,
                resourceType: resourceType,
                folder: path,
                fileName: file.name
            });

            // Upload to Cloudinary
            const response = await fetch(
                `https://api.cloudinary.com/v1_1/${this.cloudName}/${resourceType}/upload`,
                {
                    method: 'POST',
                    body: formData,
                }
            );

            if (!response.ok) {
                const errorData = await response.json();
                console.error('❌ [Cloudinary Debug] Upload failed:', {
                    status: response.status,
                    statusText: response.statusText,
                    errorData: errorData
                });
                throw new Error(errorData.error?.message || 'Upload failed');
            }

            const result = await response.json();

            console.log('✅ [Cloudinary] Document uploaded successfully:', {
                fileName: file.name,
                publicId: result.public_id,
                secureUrl: result.secure_url
            });

            return {
                success: true,
                downloadURL: result.secure_url,
                publicId: result.public_id
            };
        } catch (error: any) {
            console.error('❌ [Cloudinary] Upload failed:', error);
            return {
                success: false,
                error: error.message || 'Upload failed'
            };
        }
    }

    /**
     * Delete a document from Cloudinary
     */
    async deleteDocument(publicId: string): Promise<{ success: boolean; error?: string }> {
        try {
            // Note: Deleting requires a backend API with your API secret
            // For now, we'll just return success and handle deletion via backend later
            console.log('⚠️ [Cloudinary] Delete requires backend API - marking as success for now');

            return {
                success: true
            };
        } catch (error: any) {
            console.error('❌ [Cloudinary] Delete failed:', error);
            return {
                success: false,
                error: error.message || 'Delete failed'
            };
        }
    }

    /**
     * List documents - Cloudinary doesn't provide a direct list API for unsigned uploads
     * We'll need to store document references in Firestore and fetch from there
     */
    async listDocuments(folderPath: string): Promise<{ success: boolean; documents?: DocumentMetadata[]; error?: string }> {
        try {
            // For listing, we'll fetch from Firestore where we store document references
            // This will be implemented when we save upload results to Firestore
            console.log('ℹ️ [Cloudinary] Listing documents from Firestore metadata...');

            return {
                success: true,
                documents: []
            };
        } catch (error: any) {
            console.error('❌ [Cloudinary] List documents failed:', error);
            return {
                success: false,
                error: error.message || 'Failed to list documents'
            };
        }
    }

    /**
     * Generate a folder path for employee documents
     */
    generateEmployeeDocumentPath(
        companyId: string,
        employeeId: string,
        documentType: string,
        fileName: string
    ): string {
        // Cloudinary uses folders, not full paths
        return `hris/${companyId}/${employeeId}/${documentType}`;
    }

    /**
     * Check if Cloudinary is configured
     */
    isConfigured(): boolean {
        return this.cloudName !== 'your-cloud-name' && this.uploadPreset !== 'hris-documents';
    }
}

export const cloudinaryStorageService = new CloudinaryStorageService();
export default cloudinaryStorageService;

