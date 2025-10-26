import React, { useState, useEffect } from 'react';
import { File, Download, Eye, FileText, Image, FileSpreadsheet } from 'lucide-react';
import { documentService } from '../services/documentService';
import { DocumentMetadata } from '../services/documentMetadataService';

interface DocumentViewerProps {
    companyId: string;
    employeeId: string;
    className?: string;
}

const DocumentViewer: React.FC<DocumentViewerProps> = ({
    companyId,
    employeeId,
    className = ''
}) => {
    const [documents, setDocuments] = useState<DocumentMetadata[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        loadDocuments();
    }, [companyId, employeeId]);

    const loadDocuments = async () => {
        setLoading(true);
        setError(null);

        try {
            const result = await documentService.listDocuments(companyId, employeeId);

            if (result.success && result.documents) {
                setDocuments(result.documents);
            } else {
                setError(result.error || 'Failed to load documents');
            }
        } catch (err: any) {
            setError(err.message || 'Failed to load documents');
        } finally {
            setLoading(false);
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
        if (type.includes('image')) return <Image className="h-6 w-6 text-blue-500" />;
        if (type.includes('spreadsheet') || type.includes('excel')) return <FileSpreadsheet className="h-6 w-6 text-green-500" />;
        if (type.includes('word') || type.includes('document')) return <FileText className="h-6 w-6 text-blue-600" />;
        return <File className="h-6 w-6 text-gray-500" />;
    };

    const handleViewDocument = (doc: DocumentMetadata) => {
        window.open(doc.downloadURL, '_blank');
    };

    const handleDownloadDocument = (doc: DocumentMetadata) => {
        const link = document.createElement('a');
        link.href = doc.downloadURL;
        link.download = doc.name;
        link.target = '_blank';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    if (loading) {
        return (
            <div className={`flex items-center justify-center p-8 ${className}`}>
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                <span className="ml-3 text-gray-600">Loading documents...</span>
            </div>
        );
    }

    if (error) {
        return (
            <div className={`p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 ${className}`}>
                <p className="font-medium">Error loading documents</p>
                <p className="text-sm mt-1">{error}</p>
            </div>
        );
    }

    if (documents.length === 0) {
        return (
            <div className={`text-center p-8 bg-gray-50 rounded-lg ${className}`}>
                <File className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <p className="text-gray-600 font-medium">No documents available</p>
                <p className="text-sm text-gray-500 mt-1">Your HR team hasn't uploaded any documents yet.</p>
            </div>
        );
    }

    return (
        <div className={`space-y-4 ${className}`}>
            <h3 className="text-lg font-semibold text-gray-900">My Documents</h3>

            <div className="grid gap-3">
                {documents.map((doc, index) => (
                    <div
                        key={index}
                        className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
                    >
                        <div className="flex items-center gap-3 flex-1">
                            {getFileIcon(doc.type)}
                            <div className="flex-1 min-w-0">
                                <p className="font-medium text-gray-900 truncate">{doc.name}</p>
                                <p className="text-sm text-gray-500">
                                    {formatFileSize(doc.size)} • {new Date(doc.lastModified).toLocaleDateString('en-US', {
                                        year: 'numeric',
                                        month: 'short',
                                        day: 'numeric'
                                    })}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => handleViewDocument(doc)}
                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                title="View Document"
                            >
                                <Eye className="h-5 w-5" />
                            </button>

                            <button
                                onClick={() => handleDownloadDocument(doc)}
                                className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                title="Download Document"
                            >
                                <Download className="h-5 w-5" />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default DocumentViewer;

