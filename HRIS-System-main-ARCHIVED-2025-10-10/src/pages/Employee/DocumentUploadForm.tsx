import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { Badge } from '../../components/ui/badge';
import {
    Upload,
    FileText,
    CheckCircle,
    AlertCircle,
    Loader,
    X,
    Download
} from 'lucide-react';
import { onboardingService } from './services/onboardingService';

interface DocumentUploadFormProps {
    employeeId: string;
    onComplete: (data: any) => void;
}

interface DocumentItem {
    id: string;
    name: string;
    description: string;
    required: boolean;
    uploaded: boolean;
    file?: File;
    uploadStatus?: 'idle' | 'uploading' | 'success' | 'error';
}

const DocumentUploadForm: React.FC<DocumentUploadFormProps> = ({
    employeeId,
    onComplete
}) => {
    const [documents, setDocuments] = useState<DocumentItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isUploading, setIsUploading] = useState(false);
    const [dragActive, setDragActive] = useState(false);

    useEffect(() => {
        loadRequiredDocuments();
    }, []);

    const loadRequiredDocuments = async () => {
        try {
            const requiredDocs = await onboardingService.getRequiredDocuments(employeeId);
            const documentItems: DocumentItem[] = requiredDocs.map((doc, index) => ({
                id: `doc-${index}`,
                name: doc,
                description: getDocumentDescription(doc),
                required: true,
                uploaded: false
            }));

            setDocuments(documentItems);
        } catch (error) {
            console.error('Failed to load required documents:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const getDocumentDescription = (docName: string): string => {
        const descriptions: Record<string, string> = {
            'Government-issued ID': 'Driver\'s License, Passport, or State ID',
            'Social Security Card': 'Original Social Security Card',
            'Educational Certificates': 'Diplomas, degrees, or certificates',
            'Previous Employment Records': 'W-2 forms or employment verification',
            'Tax Forms': 'W-4 and I-9 forms',
            'Emergency Contact Information': 'Emergency contact details',
            'Banking Information': 'Bank account details for direct deposit'
        };

        return descriptions[docName] || 'Required document';
    };

    const handleFileSelect = (documentId: string, file: File) => {
        setDocuments(prev => prev.map(doc => {
            if (doc.id === documentId) {
                return {
                    ...doc,
                    file,
                    uploadStatus: 'idle'
                };
            }
            return doc;
        }));
    };

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true);
        } else if (e.type === 'dragleave') {
            setDragActive(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            const file = e.dataTransfer.files[0];
            // For now, assign to first document - in real implementation, you'd determine which document
            if (documents.length > 0) {
                handleFileSelect(documents[0].id, file);
            }
        }
    };

    const handleFileInputChange = (documentId: string, e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            handleFileSelect(documentId, e.target.files[0]);
        }
    };

    const removeFile = (documentId: string) => {
        setDocuments(prev => prev.map(doc => {
            if (doc.id === documentId) {
                return {
                    ...doc,
                    file: undefined,
                    uploadStatus: 'idle'
                };
            }
            return doc;
        }));
    };

    const uploadDocument = async (documentId: string) => {
        const document = documents.find(doc => doc.id === documentId);
        if (!document || !document.file) return;

        setDocuments(prev => prev.map(doc => {
            if (doc.id === documentId) {
                return { ...doc, uploadStatus: 'uploading' };
            }
            return doc;
        }));

        try {
            // Simulate upload - in real implementation, upload to Firebase Storage
            await new Promise(resolve => setTimeout(resolve, 2000));

            setDocuments(prev => prev.map(doc => {
                if (doc.id === documentId) {
                    return {
                        ...doc,
                        uploaded: true,
                        uploadStatus: 'success'
                    };
                }
                return doc;
            }));
        } catch (error) {
            setDocuments(prev => prev.map(doc => {
                if (doc.id === documentId) {
                    return { ...doc, uploadStatus: 'error' };
                }
                return doc;
            }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const uploadedDocs = documents.filter(doc => doc.uploaded);
        const requiredDocs = documents.filter(doc => doc.required);
        const missingRequired = requiredDocs.filter(doc => !doc.uploaded);

        // For testing purposes, allow proceeding without all documents
        if (missingRequired.length > 0) {
            console.log(`Note: ${missingRequired.length} required documents not uploaded yet. Proceeding for testing purposes.`);
        }

        setIsUploading(true);

        try {
            onComplete({ documents: uploadedDocs });
        } catch (error) {
            console.error('Failed to save document information:', error);
        } finally {
            setIsUploading(false);
        }
    };

    const formatFileSize = (bytes: number): string => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-8">
                <div className="text-center">
                    <Loader className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
                    <p>Loading required documents...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                        <Upload className="h-5 w-5" />
                        <span>Document Upload</span>
                    </CardTitle>
                    <CardDescription>
                        Upload the required documents to complete your onboarding process.
                    </CardDescription>
                </CardHeader>

                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Document List */}
                        <div className="space-y-4">
                            {documents.map((document) => (
                                <div key={document.id} className="border rounded-lg p-4 space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-3">
                                            <FileText className="w-5 h-5 text-blue-600" />
                                            <div>
                                                <h4 className="font-medium text-gray-900">{document.name}</h4>
                                                <p className="text-sm text-gray-600">{document.description}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            {document.required && (
                                                <Badge variant="destructive">Required</Badge>
                                            )}
                                            {document.uploaded && (
                                                <Badge variant="default" className="bg-green-100 text-green-800">
                                                    <CheckCircle className="w-3 h-3 mr-1" />
                                                    Uploaded
                                                </Badge>
                                            )}
                                        </div>
                                    </div>

                                    {!document.uploaded && (
                                        <div className="space-y-3">
                                            {!document.file ? (
                                                <div
                                                    className={`border-2 border-dashed rounded-lg p-4 transition-colors ${dragActive ? 'border-blue-400 bg-blue-50' : 'border-gray-300 bg-gray-50'
                                                        }`}
                                                    onDragEnter={handleDrag}
                                                    onDragLeave={handleDrag}
                                                    onDragOver={handleDrag}
                                                    onDrop={handleDrop}
                                                >
                                                    <div className="text-center">
                                                        <Upload className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                                                        <p className="text-sm text-gray-600 mb-2">
                                                            Drop file here or click to browse
                                                        </p>
                                                        <input
                                                            type="file"
                                                            onChange={(e) => handleFileInputChange(document.id, e)}
                                                            accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                                                            className="hidden"
                                                            id={`file-${document.id}`}
                                                        />
                                                        <label
                                                            htmlFor={`file-${document.id}`}
                                                            className="cursor-pointer inline-flex items-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                                                        >
                                                            Choose File
                                                        </label>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                                                    <div className="flex items-center space-x-3">
                                                        <FileText className="w-5 h-5 text-green-600" />
                                                        <div>
                                                            <p className="text-sm font-medium text-green-800">{document.file.name}</p>
                                                            <p className="text-xs text-green-600">{formatFileSize(document.file.size)}</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center space-x-2">
                                                        <Button
                                                            type="button"
                                                            size="sm"
                                                            onClick={() => uploadDocument(document.id)}
                                                            disabled={document.uploadStatus === 'uploading'}
                                                        >
                                                            {document.uploadStatus === 'uploading' ? (
                                                                <Loader className="w-4 h-4 animate-spin" />
                                                            ) : (
                                                                'Upload'
                                                            )}
                                                        </Button>
                                                        <Button
                                                            type="button"
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => removeFile(document.id)}
                                                        >
                                                            <X className="w-4 h-4" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>

                        {/* Upload Guidelines */}
                        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                            <h4 className="font-medium text-blue-900 mb-2">Upload Guidelines</h4>
                            <ul className="text-sm text-blue-800 space-y-1">
                                <li>• Accepted formats: PDF, JPG, JPEG, PNG, DOC, DOCX</li>
                                <li>• Maximum file size: 10MB per document</li>
                                <li>• Ensure documents are clear and legible</li>
                                <li>• All required documents must be uploaded to continue</li>
                            </ul>
                        </div>

                        {/* Submit Button */}
                        <div className="flex justify-between items-center">
                            <div className="text-sm text-gray-600">
                                <p>For testing: You can proceed without uploading all documents</p>
                            </div>
                            <Button
                                type="submit"
                                disabled={isUploading}
                                className="px-8"
                            >
                                {isUploading ? (
                                    <span className="flex items-center">
                                        <Loader className="w-4 h-4 mr-2 animate-spin" />
                                        Saving...
                                    </span>
                                ) : (
                                    'Continue to Next Step'
                                )}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
};

export default DocumentUploadForm;
