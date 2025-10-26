import React, { useState, useRef } from 'react';
import { Upload, File, X, Download, Eye, Trash2, CheckCircle, AlertCircle, FileText, Image as ImageIcon, FileSpreadsheet } from 'lucide-react';
import { documentService } from '../services/documentService';
import { DocumentMetadata } from '../services/documentMetadataService';

interface EmployeeDocumentUploadProps {
    companyId: string;
    employeeId: string;
    existingDocuments: DocumentMetadata[];
    onUploadComplete?: (url: string, metadata: DocumentMetadata) => void;
    onDocumentDelete?: (path: string) => void;
    className?: string;
}

const EmployeeDocumentUpload: React.FC<EmployeeDocumentUploadProps> = ({
    companyId,
    employeeId,
    existingDocuments,
    onUploadComplete,
    onDocumentDelete,
    className = ''
}) => {
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [documentType, setDocumentType] = useState<string>('id-document');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const maxFileSize = 10 * 1024 * 1024; // 10MB
    const allowedFileTypes = [
        '.pdf',
        '.doc',
        '.docx',
        '.jpg',
        '.jpeg',
        '.png',
        '.gif'
    ];

    const documentTypeOptions = [
        { value: 'id-document', label: 'ID Document' },
        { value: 'passport', label: 'Passport' },
        { value: 'drivers-license', label: 'Driver\'s License' },
        { value: 'degree-certificate', label: 'Degree/Certificate' },
        { value: 'resume-cv', label: 'Resume/CV' },
        { value: 'reference-letter', label: 'Reference Letter' },
        { value: 'contract-agreement', label: 'Contract/Agreement' },
        { value: 'bank-statement', label: 'Bank Statement' },
        { value: 'tax-document', label: 'Tax Document' },
        { value: 'other-document', label: 'Other Document' }
    ];

    const getDocumentTypePrefix = (documentType: string): string => {
        switch (documentType) {
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

    const validateFile = (file: File): string | null => {
        if (file.size > maxFileSize) {
            return `File size exceeds ${formatFileSize(maxFileSize)}`;
        }

        const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
        if (!allowedFileTypes.includes(fileExtension)) {
            return `File type ${fileExtension} is not allowed`;
        }

        return null;
    };

    const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (files && files.length > 0) {
            await uploadFile(files[0]);
        }
    };

    const uploadFile = async (file: File) => {
        const validationError = validateFile(file);
        if (validationError) {
            setError(validationError);
            return;
        }

        setUploading(true);
        setError(null);
        setSuccess(null);
        setUploadProgress(0);

        try {
            // Simulate upload progress
            const progressInterval = setInterval(() => {
                setUploadProgress(prev => Math.min(prev + 10, 90));
            }, 200);

            // Upload file using document service
            const result = await documentService.uploadDocument(
                file,
                companyId,
                employeeId,
                documentType,
                'employee'
            );

            clearInterval(progressInterval);
            setUploadProgress(100);

            if (result.success && result.downloadURL) {
                // Create descriptive name with document type prefix
                const documentTypePrefix = getDocumentTypePrefix(documentType);
                const descriptiveName = `${documentTypePrefix} - ${file.name}`;
                
                // Create metadata from upload result
                const metadata: DocumentMetadata = {
                    name: descriptiveName,
                    originalName: file.name,
                    size: file.size,
                    type: file.type,
                    lastModified: new Date(),
                    downloadURL: result.downloadURL,
                    path: `hris/${companyId}/${employeeId}/${documentType}/${file.name}`,
                    documentType: documentType
                };

                setSuccess('Document uploaded successfully!');
                onUploadComplete?.(result.downloadURL, metadata);

                // Reset after 3 seconds
                setTimeout(() => {
                    setSuccess(null);
                    setUploadProgress(0);
                    if (fileInputRef.current) {
                        fileInputRef.current.value = '';
                    }
                }, 3000);
            } else {
                throw new Error(result.error || 'Upload failed');
            }
        } catch (error: any) {
            setError(error.message || 'Upload failed');
            setUploadProgress(0);
        } finally {
            setUploading(false);
        }
    };

    const handleDrop = async (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        setIsDragging(false);

        const files = event.dataTransfer.files;
        if (files && files.length > 0) {
            await uploadFile(files[0]);
        }
    };

    const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    const handleDeleteDocument = async (publicId: string) => {
        if (window.confirm('Are you sure you want to delete this document?')) {
            try {
                const result = await documentService.deleteDocument(publicId);
                if (result.success) {
                    onDocumentDelete?.(publicId);
                    setSuccess('Document deleted successfully!');
                    setTimeout(() => setSuccess(null), 3000);
                } else {
                    setError(result.error || 'Delete failed');
                }
            } catch (error: any) {
                setError(error.message || 'Delete failed');
            }
        }
    };

    const formatFileSize = (bytes: number): string => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
    };

    const getFileIcon = (type: string) => {
        if (type.includes('pdf')) return <FileText className="h-6 w-6 text-red-500" />;
        if (type.includes('image')) return <ImageIcon className="h-6 w-6 text-blue-500" />;
        if (type.includes('spreadsheet') || type.includes('excel')) return <FileSpreadsheet className="h-6 w-6 text-green-500" />;
        if (type.includes('word') || type.includes('document')) return <FileText className="h-6 w-6 text-blue-600" />;
        return <File className="h-6 w-6 text-gray-500" />;
    };

    return (
        <div className={`space-y-4 ${className}`}>
            {/* Document Type Selection */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Document Type
                </label>
                <select
                    value={documentType}
                    onChange={(e) => setDocumentType(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={uploading}
                >
                    {documentTypeOptions.map(option => (
                        <option key={option.value} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </select>
            </div>

            {/* Upload Area */}
            <div
                className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${isDragging
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-300 hover:border-blue-400'
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
                    {isDragging ? 'Drop file here' : 'Upload Your Document'}
                </p>

                <p className="text-sm text-gray-500 mb-4">
                    Drag and drop a file here, or click to select
                </p>

                <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                    {uploading ? 'Uploading...' : 'Choose File'}
                </button>

                <p className="text-xs text-gray-400 mt-2">
                    Max file size: {formatFileSize(maxFileSize)} • Allowed: PDF, DOC, DOCX, JPG, PNG
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
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
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
                    <h3 className="text-lg font-medium text-gray-900">My Uploaded Documents</h3>
                    <div className="space-y-2">
                        {existingDocuments.map((doc, index) => (
                            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                                <div className="flex items-center gap-3">
                                    {getFileIcon(doc.type)}
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
                                        onClick={() => handleDeleteDocument(doc.publicId || doc.path)}
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

export default EmployeeDocumentUpload;
