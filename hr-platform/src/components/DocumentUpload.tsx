import React, { useState, useRef } from 'react';
import { Upload, File, X, Download, Eye, Trash2, CheckCircle, AlertCircle } from 'lucide-react';
import { firebaseStorageService, DocumentMetadata } from '../services/firebaseStorageService';

interface DocumentUploadProps {
  companyId: string;
  employeeId?: string;
  documentType: string;
  onUploadComplete?: (downloadURL: string, metadata: DocumentMetadata) => void;
  onUploadError?: (error: string) => void;
  maxFileSize?: number; // in bytes
  allowedFileTypes?: string[];
  existingDocuments?: DocumentMetadata[];
  onDocumentDelete?: (path: string) => void;
  className?: string;
}

const DocumentUpload: React.FC<DocumentUploadProps> = ({
  companyId,
  employeeId,
  documentType,
  onUploadComplete,
  onUploadError,
  maxFileSize = 10 * 1024 * 1024, // 10MB default
  allowedFileTypes = ['.pdf', '.doc', '.docx', '.jpg', '.jpeg', '.png', '.txt'],
  existingDocuments = [],
  onDocumentDelete,
  className = ''
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const validateFile = (file: File): string | null => {
    // Check file size
    if (file.size > maxFileSize) {
      return `File size must be less than ${formatFileSize(maxFileSize)}`;
    }

    // Check file type
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!allowedFileTypes.includes(fileExtension)) {
      return `File type not allowed. Allowed types: ${allowedFileTypes.join(', ')}`;
    }

    return null;
  };

  const handleFileUpload = async (file: File) => {
    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      onUploadError?.(validationError);
      return;
    }

    setUploading(true);
    setError(null);
    setSuccess(null);
    setUploadProgress(0);

    try {
      // Generate storage path
      const storagePath = employeeId 
        ? firebaseStorageService.generateEmployeeDocumentPath(companyId, employeeId, documentType, file.name)
        : firebaseStorageService.generateCompanyDocumentPath(companyId, documentType, file.name);

      // Upload file
      const result = await firebaseStorageService.uploadDocument(file, storagePath, {
        employeeId: employeeId || 'company',
        documentType: documentType,
        uploadedBy: 'hr-user'
      });

      if (result.success && result.downloadURL) {
        // Create metadata from upload result
        const metadataResult = {
          success: true,
          metadata: {
            name: file.name,
            size: file.size,
            type: file.type,
            lastModified: new Date(),
            downloadURL: result.downloadURL,
            path: storagePath
          }
        };
        
        if (metadataResult.success && metadataResult.metadata) {
          setSuccess('Document uploaded successfully!');
          onUploadComplete?.(result.downloadURL, metadataResult.metadata);
        } else {
          throw new Error('Failed to get document metadata');
        }
      } else {
        throw new Error(result.error || 'Upload failed');
      }

    } catch (error: any) {
      const errorMessage = error.message || 'Upload failed';
      setError(errorMessage);
      onUploadError?.(errorMessage);
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    setIsDragging(false);
    
    const file = event.dataTransfer.files[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDeleteDocument = async (path: string) => {
    if (window.confirm('Are you sure you want to delete this document?')) {
      try {
        const result = await firebaseStorageService.deleteDocument(path);
        if (result.success) {
          onDocumentDelete?.(path);
          setSuccess('Document deleted successfully!');
        } else {
          setError(result.error || 'Delete failed');
        }
      } catch (error: any) {
        setError(error.message || 'Delete failed');
      }
    }
  };

  const getFileIcon = (type: string) => {
    if (type.includes('pdf')) return '📄';
    if (type.includes('image')) return '🖼️';
    if (type.includes('word') || type.includes('document')) return '📝';
    return '📁';
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Upload Area */}
      <div
        className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
          isDragging 
            ? 'border-primary bg-primary/5' 
            : 'border-gray-300 hover:border-primary/50'
        } ${uploading ? 'opacity-50 pointer-events-none' : ''}`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <input
          ref={fileInputRef}
          type="file"
          onChange={handleFileSelect}
          accept={allowedFileTypes.join(',')}
          className="hidden"
        />
        
        <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        
        <p className="text-lg font-medium text-gray-900 mb-2">
          {isDragging ? 'Drop file here' : 'Upload Document'}
        </p>
        
        <p className="text-sm text-gray-500 mb-4">
          Drag and drop a file here, or click to select
        </p>
        
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="btn-primary"
        >
          {uploading ? 'Uploading...' : 'Choose File'}
        </button>
        
        <p className="text-xs text-gray-400 mt-2">
          Max file size: {formatFileSize(maxFileSize)} • Allowed: {allowedFileTypes.join(', ')}
        </p>
      </div>

      {/* Upload Progress */}
      {uploading && (
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Uploading...</span>
            <span>{uploadProgress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-primary h-2 rounded-full transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        </div>
      )}

      {/* Status Messages */}
      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700">
          <AlertCircle className="h-5 w-5" />
          <span>{error}</span>
          <button onClick={() => setError(null)} className="ml-auto">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {success && (
        <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700">
          <CheckCircle className="h-5 w-5" />
          <span>{success}</span>
          <button onClick={() => setSuccess(null)} className="ml-auto">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Existing Documents */}
      {existingDocuments.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-lg font-medium text-gray-900">Existing Documents</h3>
          <div className="space-y-2">
            {existingDocuments.map((doc, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{getFileIcon(doc.type)}</span>
                  <div>
                    <p className="font-medium text-gray-900">{doc.name}</p>
                    <p className="text-sm text-gray-500">
                      {formatFileSize(doc.size)} • {new Date(doc.lastModified).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => window.open(doc.downloadURL, '_blank')}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="View Document"
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                  
                  <button
                    onClick={() => window.open(doc.downloadURL, '_blank')}
                    className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                    title="Download Document"
                  >
                    <Download className="h-4 w-4" />
                  </button>
                  
                  <button
                    onClick={() => handleDeleteDocument(doc.path)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete Document"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentUpload;

