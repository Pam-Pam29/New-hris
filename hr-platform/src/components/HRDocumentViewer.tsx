import React, { useState, useEffect } from 'react';
import { File, Download, Eye, FileText, Image as ImageIcon, FileSpreadsheet, Trash2, AlertCircle, CheckCircle } from 'lucide-react';
import { hrDocumentService } from '../services/hrDocumentService';
import { DocumentMetadata } from '../services/documentMetadataService';

interface HRDocumentViewerProps {
    companyId: string;
    employeeId: string;
    employeeName: string;
    className?: string;
}

const HRDocumentViewer: React.FC<HRDocumentViewerProps> = ({
    companyId,
    employeeId,
    employeeName,
    className = ''
}) => {
    const [documents, setDocuments] = useState<DocumentMetadata[]>([]);
    const [groupedDocuments, setGroupedDocuments] = useState<{ [key: string]: DocumentMetadata[] }>({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        loadEmployeeDocuments();
    }, [companyId, employeeId]);

    const loadEmployeeDocuments = async () => {
        setLoading(true);
        setError(null);

        try {
            const result = await hrDocumentService.listEmployeeDocuments(companyId, employeeId);

            if (result.success && result.documents) {
                setDocuments(result.documents);

                // Group documents by type
                const grouped = await hrDocumentService.getDocumentsByType(companyId, employeeId);
                setGroupedDocuments(grouped);
            } else {
                setError(result.error || 'Failed to load documents');
                setDocuments([]);
                setGroupedDocuments({});
            }
        } catch (err) {
            console.error('Error loading employee documents:', err);
            setError('Failed to load documents due to a network or server error.');
            setDocuments([]);
            setGroupedDocuments({});
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
        if (type.includes('image')) return <ImageIcon className="h-6 w-6 text-blue-500" />;
        if (type.includes('spreadsheet') || type.includes('excel')) return <FileSpreadsheet className="h-6 w-6 text-green-500" />;
        if (type.includes('word') || type.includes('document')) return <FileText className="h-6 w-6 text-blue-600" />;
        return <File className="h-6 w-6 text-gray-500" />;
    };

    const getDocumentTypeLabel = (type: string): string => {
        switch (type) {
            case 'id-document':
                return 'ID Documents';
            case 'passport':
                return 'Passport Documents';
            case 'drivers-license':
                return 'Driver\'s License';
            case 'degree-certificate':
                return 'Educational Documents';
            case 'resume-cv':
                return 'Resume/CV';
            case 'reference-letter':
                return 'Reference Letters';
            case 'contract-agreement':
                return 'Contracts/Agreements';
            case 'bank-statement':
                return 'Bank Statements';
            case 'tax-document':
                return 'Tax Documents';
            case 'other-document':
                return 'Other Documents';
            default:
                return 'Documents';
        }
    };

    const handleViewDocument = (document: DocumentMetadata) => {
        const url = hrDocumentService.getDocumentUrl(document);
        if (url) {
            window.open(url, '_blank');
        }
    };

    const handleDownloadDocument = (document: DocumentMetadata) => {
        const url = hrDocumentService.getDocumentUrl(document);
        if (url) {
            const link = document.createElement('a');
            link.href = url;
            link.download = document.originalName || document.name;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    };

    if (loading) {
        return (
            <div className={`space-y-4 ${className}`}>
                <div className="flex items-center justify-center p-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <span className="ml-3 text-gray-600">Loading documents...</span>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className={`space-y-4 ${className}`}>
                <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                    <AlertCircle className="h-5 w-5" />
                    <span>{error}</span>
                </div>
            </div>
        );
    }

    if (documents.length === 0) {
        return (
            <div className={`space-y-4 ${className}`}>
                <div className="text-center p-8 text-gray-500">
                    <File className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                    <p className="text-lg font-medium">No documents found</p>
                    <p className="text-sm">This employee hasn't uploaded any documents yet.</p>
                </div>
            </div>
        );
    }

    return (
        <div className={`space-y-6 ${className}`}>
            {/* Summary */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-blue-600" />
                    <span className="font-medium text-blue-900">
                        {documents.length} document{documents.length !== 1 ? 's' : ''} found for {employeeName}
                    </span>
                </div>
            </div>

            {/* Documents grouped by type */}
            {Object.entries(groupedDocuments).map(([type, docs]) => (
                <div key={type} className="space-y-3">
                    <h3 className="text-lg font-medium text-gray-900 border-b border-gray-200 pb-2">
                        {getDocumentTypeLabel(type)}
                        <span className="ml-2 text-sm font-normal text-gray-500">({docs.length} document{docs.length !== 1 ? 's' : ''})</span>
                    </h3>

                    <div className="grid gap-3">
                        {docs.map((doc, index) => (
                            <div key={index} className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                                <div className="flex items-center gap-3 flex-1">
                                    {getFileIcon(doc.type)}
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium text-gray-900 truncate">{doc.name}</p>
                                        <p className="text-sm text-gray-500">
                                            {formatFileSize(doc.size)} • {new Date(doc.lastModified).toLocaleDateString()}
                                        </p>
                                        {doc.originalName && doc.originalName !== doc.name && (
                                            <p className="text-xs text-gray-400 truncate">
                                                Original: {doc.originalName}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 ml-4">
                                    <button
                                        onClick={() => handleViewDocument(doc)}
                                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                        title="View Document"
                                    >
                                        <Eye className="h-4 w-4" />
                                    </button>

                                    <button
                                        onClick={() => handleDownloadDocument(doc)}
                                        className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                        title="Download Document"
                                    >
                                        <Download className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default HRDocumentViewer;
