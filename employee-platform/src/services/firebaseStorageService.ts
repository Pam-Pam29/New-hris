import { getStorage, ref, uploadBytes, getDownloadURL, listAll, deleteObject, getMetadata } from 'firebase/storage';
import { storage } from '../config/firebase';

export interface DocumentMetadata {
  name: string;
  size: number;
  type: string;
  lastModified: Date;
  downloadURL: string;
  path: string;
}

class FirebaseStorageService {
  /**
   * Upload a document to Firebase Storage
   */
  async uploadDocument(
    file: File,
    path: string,
    metadata?: Record<string, string>
  ): Promise<{ success: boolean; downloadURL?: string; error?: string }> {
    try {
      console.log('📄 [Firebase Storage] Uploading document:', {
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        path: path
      });

      const storageRef = ref(storage, path);
      
      // Upload file with metadata
      const uploadMetadata = {
        contentType: file.type,
        customMetadata: metadata
      };

      await uploadBytes(storageRef, file, uploadMetadata);
      
      // Get download URL
      const downloadURL = await getDownloadURL(storageRef);

      console.log('✅ [Firebase Storage] Document uploaded successfully:', {
        fileName: file.name,
        downloadURL: downloadURL
      });

      return {
        success: true,
        downloadURL: downloadURL
      };
    } catch (error: any) {
      console.error('❌ [Firebase Storage] Upload failed:', error);
      return {
        success: false,
        error: error.message || 'Upload failed'
      };
    }
  }

  /**
   * Delete a document
   */
  async deleteDocument(path: string): Promise<{ success: boolean; error?: string }> {
    try {
      const storageRef = ref(storage, path);
      await deleteObject(storageRef);

      console.log('✅ [Firebase Storage] Document deleted successfully:', path);
      return { success: true };
    } catch (error: any) {
      console.error('❌ [Firebase Storage] Delete failed:', error);
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
      const storageRef = ref(storage, folderPath);
      const result = await listAll(storageRef);

      const documents: DocumentMetadata[] = [];

      for (const itemRef of result.items) {
        try {
          const [downloadURL, metadata] = await Promise.all([
            getDownloadURL(itemRef),
            getMetadata(itemRef)
          ]);

          documents.push({
            name: itemRef.name,
            size: metadata.size,
            type: metadata.contentType || 'unknown',
            lastModified: new Date(metadata.updated),
            downloadURL: downloadURL,
            path: itemRef.fullPath
          });
        } catch (err) {
          console.warn('Failed to get metadata for:', itemRef.fullPath, err);
        }
      }

      console.log('✅ [Firebase Storage] Listed documents:', {
        folderPath: folderPath,
        documentCount: documents.length
      });

      return {
        success: true,
        documents: documents
      };
    } catch (error: any) {
      console.error('❌ [Firebase Storage] List documents failed:', error);
      return {
        success: false,
        error: error.message || 'Failed to list documents'
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
    const cleanFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
    const timestamp = Date.now();
    
    return `companies/${companyId}/employees/${employeeId}/${documentType}/${timestamp}_${cleanFileName}`;
  }
}

export const firebaseStorageService = new FirebaseStorageService();
export default firebaseStorageService;

