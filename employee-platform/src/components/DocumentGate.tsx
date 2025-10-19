import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Progress } from './ui/progress';
import { Button } from './ui/button';
import { FileText, Upload, Shield, CheckCircle, AlertCircle } from 'lucide-react';

interface DocumentGateProps {
    uploadedDocuments: number;
    requiredDocuments: number;
    onUploadClick: () => void;
    isComplete: boolean;
}

export default function DocumentGate({
    uploadedDocuments,
    requiredDocuments,
    onUploadClick,
    isComplete
}: DocumentGateProps) {
    const progress = (uploadedDocuments / requiredDocuments) * 100;
    const remaining = requiredDocuments - uploadedDocuments;

    if (isComplete) {
        return null; // Allow access to dashboard
    }

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <Card className="w-full max-w-2xl">
                <CardHeader className="text-center">
                    <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                        <Shield className="h-8 w-8 text-primary" />
                    </div>
                    <CardTitle className="text-2xl">Profile Setup Required</CardTitle>
                    <p className="text-gray-600 mt-2">
                        Complete your profile setup and document upload to access the employee portal
                    </p>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Progress Section */}
                    <div className="text-center">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium">Document Upload Progress</span>
                            <span className="text-sm text-muted-foreground">
                                {uploadedDocuments}/{requiredDocuments} Complete
                            </span>
                        </div>
                        <Progress value={progress} className="h-3 mb-2" />
                        <p className="text-xs text-muted-foreground">
                            {remaining} documents remaining
                        </p>
                    </div>

                    {/* Status Message */}
                    <div className={`rounded-lg p-4 ${isComplete
                        ? 'bg-green-50 border border-green-200'
                        : 'bg-orange-50 border border-orange-200'
                        }`}>
                        <div className="flex items-center space-x-3">
                            {isComplete ? (
                                <CheckCircle className="h-5 w-5 text-green-600" />
                            ) : (
                                <AlertCircle className="h-5 w-5 text-orange-600" />
                            )}
                            <div>
                                <h4 className={`font-medium ${isComplete ? 'text-green-900' : 'text-orange-900'
                                    }`}>
                                    {isComplete ? 'Profile Setup Complete!' : 'Profile Setup Required'}
                                </h4>
                                <p className={`text-sm mt-1 ${isComplete ? 'text-green-700' : 'text-orange-700'
                                    }`}>
                                    {isComplete
                                        ? 'You can now access the employee portal.'
                                        : 'Complete your profile and upload documents to continue.'
                                    }
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Required Documents List */}
                    <div className="space-y-3">
                        <h4 className="font-medium text-gray-900">Required Documents</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {[
                                'Government ID',
                                'Passport/Visa',
                                'Employment Contract',
                                'Resume/CV',
                                'Degree Certificate',
                                'Transcript',
                                'Professional Certificates',
                                'Reference Letters'
                            ].map((doc, index) => (
                                <div key={index} className="flex items-center space-x-3 p-3 border rounded-lg">
                                    <FileText className="h-4 w-4 text-gray-400" />
                                    <span className="text-sm text-gray-700">{doc}</span>
                                    <div className="ml-auto">
                                        {index < uploadedDocuments ? (
                                            <CheckCircle className="h-4 w-4 text-green-500" />
                                        ) : (
                                            <div className="w-4 h-4 border-2 border-gray-300 rounded-full" />
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Action Button */}
                    <div className="text-center">
                        <Button
                            onClick={onUploadClick}
                            className="w-full md:w-auto"
                            size="lg"
                        >
                            <FileText className="h-4 w-4 mr-2" />
                            {uploadedDocuments > 0 ? 'Continue Profile Setup' : 'Start Profile Setup'}
                        </Button>
                    </div>

                    {/* Authentication Flow Info */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <h4 className="font-medium text-blue-900 mb-2">Authentication Process</h4>
                        <div className="text-sm text-blue-700 space-y-1">
                            <p>• You received your Employee ID after job offer acceptance</p>
                            <p>• Complete your profile information in all tabs first</p>
                            <p>• Upload all required documents in the Documents tab</p>
                            <p>• Work email will be generated after document completion</p>
                            <p>• Future logins will use your work email</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
