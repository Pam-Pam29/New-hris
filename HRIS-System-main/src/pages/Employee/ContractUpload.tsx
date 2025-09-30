import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Alert, AlertDescription } from '../../components/ui/alert';
import {
    Upload,
    FileText,
    CheckCircle,
    AlertCircle,
    Loader,
    X,
    Download
} from 'lucide-react';
import { contractService, ContractUploadValidation, ContractUploadResult } from './services/contractService';

interface ContractUploadProps {
    employeeId: string;
    onComplete: (data: any) => void;
    onError: (error: string) => void;
}

const ContractUploadForm: React.FC<ContractUploadProps> = ({
    employeeId,
    onComplete,
    onError
}) => {
    const [uploadedFile, setUploadedFile] = useState<File | null>(null);
    const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
    const [validationRules, setValidationRules] = useState<ContractUploadValidation | null>(null);
    const [dragActive, setDragActive] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        loadValidationRules();
    }, []);

    const loadValidationRules = async () => {
        try {
            const rules = await contractService.getUploadValidationRules();
            setValidationRules(rules);
        } catch (error) {
            onError('Unable to load upload requirements');
        }
    };

    const validateFile = (file: File): string | null => {
        if (!validationRules) return null;

        // Check file type
        const fileExtension = file.name.split('.').pop()?.toLowerCase();
        if (!fileExtension || !validationRules.allowedFormats.includes(fileExtension)) {
            return `File must be one of: ${validationRules.allowedFormats.map(f => f.toUpperCase()).join(', ')}`;
        }

        // Check file size
        const fileSizeMB = file.size / (1024 * 1024);
        if (fileSizeMB > validationRules.maxFileSize) {
            return `File size must be less than ${validationRules.maxFileSize}MB`;
        }

        return null;
    };

    const handleFileSelect = (file: File) => {
        const validationError = validateFile(file);
        if (validationError) {
            setError(validationError);
            return;
        }

        setUploadedFile(file);
        setError('');
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
            handleFileSelect(e.dataTransfer.files[0]);
        }
    };

    const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            handleFileSelect(e.target.files[0]);
        }
    };

    const handleUpload = async () => {
        if (!uploadedFile) return;

        setUploadStatus('uploading');
        setError('');

        try {
            const result: ContractUploadResult = await contractService.uploadSignedContract(employeeId, uploadedFile);

            if (result.success) {
                setUploadStatus('success');
                // Auto-advance to next step after successful upload
                setTimeout(() => {
                    onComplete({ signedContractId: result.documentId });
                }, 2000);
            } else {
                setUploadStatus('error');
                setError(result.message || 'Upload failed');
            }
        } catch (error: any) {
            setUploadStatus('error');
            setError('Unable to upload contract. Please try again.');
        }
    };

    const removeFile = () => {
        setUploadedFile(null);
        setError('');
        setUploadStatus('idle');
    };

    const formatFileSize = (bytes: number): string => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                        <Upload className="h-5 w-5" />
                        <span>Upload Your Signed Contract</span>
                    </CardTitle>
                    <CardDescription>
                        Upload the signed copy of your employment contract
                    </CardDescription>
                </CardHeader>

                <CardContent className="space-y-6">
                    {/* Upload Area */}
                    <div
                        className={`relative border-2 border-dashed rounded-lg p-8 transition-colors ${dragActive
                                ? 'border-blue-400 bg-blue-50'
                                : uploadedFile
                                    ? 'border-green-300 bg-green-50'
                                    : 'border-gray-300 bg-gray-50'
                            }`}
                        onDragEnter={handleDrag}
                        onDragLeave={handleDrag}
                        onDragOver={handleDrag}
                        onDrop={handleDrop}
                    >
                        <div className="text-center">
                            {!uploadedFile ? (
                                <>
                                    <Upload className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                                    <p className="text-sm text-gray-600 mb-2">
                                        Drop your signed contract here, or click to browse
                                    </p>
                                    <input
                                        type="file"
                                        onChange={handleFileInputChange}
                                        accept={validationRules?.allowedFormats.map(f => `.${f}`).join(',')}
                                        className="hidden"
                                        id="contract-upload"
                                    />
                                    <label
                                        htmlFor="contract-upload"
                                        className="cursor-pointer inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                    >
                                        <FileText className="w-4 h-4 mr-2" />
                                        Choose File
                                    </label>
                                </>
                            ) : (
                                <div className="space-y-4">
                                    <div className="flex items-center justify-center space-x-2">
                                        <CheckCircle className="w-8 h-8 text-green-600" />
                                        <span className="text-lg font-medium text-green-800">
                                            File Selected
                                        </span>
                                    </div>

                                    <div className="bg-white p-4 rounded-lg border">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center space-x-3">
                                                <FileText className="w-8 h-8 text-blue-600" />
                                                <div className="text-left">
                                                    <p className="font-medium text-gray-900">{uploadedFile.name}</p>
                                                    <p className="text-sm text-gray-500">
                                                        {formatFileSize(uploadedFile.size)}
                                                    </p>
                                                </div>
                                            </div>
                                            <button
                                                onClick={removeFile}
                                                className="text-red-600 hover:text-red-800 p-1"
                                            >
                                                <X className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Validation Rules */}
                    {validationRules && (
                        <div className="bg-blue-50 p-4 rounded-lg">
                            <h4 className="font-medium text-blue-900 mb-2">Upload Requirements:</h4>
                            <ul className="text-sm text-blue-800 space-y-1">
                                <li>• Accepted formats: {validationRules.allowedFormats.map(f => f.toUpperCase()).join(', ')}</li>
                                <li>• Maximum file size: {validationRules.maxFileSize}MB</li>
                                <li>• Please ensure all pages are included and signatures are visible</li>
                                <li>• PDF format is recommended for best quality</li>
                            </ul>
                        </div>
                    )}

                    {/* Error Display */}
                    {error && (
                        <Alert variant="destructive">
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}

                    {/* Upload Button */}
                    {uploadedFile && uploadStatus !== 'success' && (
                        <Button
                            onClick={handleUpload}
                            disabled={uploadStatus === 'uploading'}
                            className="w-full"
                        >
                            {uploadStatus === 'uploading' ? (
                                <span className="flex items-center justify-center">
                                    <Loader className="w-4 h-4 mr-2 animate-spin" />
                                    Uploading Contract...
                                </span>
                            ) : (
                                'Upload Signed Contract'
                            )}
                        </Button>
                    )}

                    {/* Success Message */}
                    {uploadStatus === 'success' && (
                        <Alert className="border-green-200 bg-green-50">
                            <CheckCircle className="h-4 w-4 text-green-600" />
                            <AlertDescription className="text-green-800">
                                ✓ Contract uploaded successfully! Moving to next step...
                            </AlertDescription>
                        </Alert>
                    )}

                    {/* Checklist */}
                    <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                        <h4 className="font-medium text-yellow-900 mb-2">Checklist before uploading:</h4>
                        <ul className="text-sm text-yellow-800 space-y-1">
                            <li className="flex items-center space-x-2">
                                <CheckCircle className="w-4 h-4 text-green-600" />
                                <span>Contract has been signed on all required pages</span>
                            </li>
                            <li className="flex items-center space-x-2">
                                <CheckCircle className="w-4 h-4 text-green-600" />
                                <span>Signatures are clear and legible</span>
                            </li>
                            <li className="flex items-center space-x-2">
                                <CheckCircle className="w-4 h-4 text-green-600" />
                                <span>All pages are included in the document</span>
                            </li>
                            <li className="flex items-center space-x-2">
                                <CheckCircle className="w-4 h-4 text-green-600" />
                                <span>Document is in PDF format (recommended)</span>
                            </li>
                        </ul>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default ContractUploadForm;



