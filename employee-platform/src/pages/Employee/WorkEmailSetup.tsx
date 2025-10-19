import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Alert, AlertDescription } from '../../components/ui/alert';
import {
    Mail,
    CheckCircle,
    AlertCircle,
    Loader,
    Copy,
    ExternalLink
} from 'lucide-react';
import { onboardingService } from './services/onboardingService';

interface WorkEmailSetupProps {
    employeeId: string;
    onComplete: (data: any) => void;
}

const WorkEmailSetup: React.FC<WorkEmailSetupProps> = ({
    employeeId,
    onComplete
}) => {
    const [workEmail, setWorkEmail] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [isCompleting, setIsCompleting] = useState(false);

    useEffect(() => {
        // Generate a mock work email for testing
        setWorkEmail('john.doe@company.com');
    }, []);

    const generateWorkEmail = async () => {
        if (!progress?.personalInfo) {
            onError('Personal information is required to generate work email');
            return;
        }

        setIsGenerating(true);
        try {
            const email = await onboardingService.generateWorkEmail(progress.personalInfo);
            setWorkEmail(email);
        } catch (error) {
            onError('Failed to generate work email');
        } finally {
            setIsGenerating(false);
        }
    };

    const handleContinue = async () => {
        if (!workEmail) {
            console.error('Work email is required');
            return;
        }

        setIsCompleting(true);
        try {
            onComplete({ workEmail });
        } catch (error) {
            console.error('Failed to save work email:', error);
        } finally {
            setIsCompleting(false);
        }
    };

    const copyToClipboard = async () => {
        try {
            await navigator.clipboard.writeText(workEmail);
            // You could add a toast notification here
        } catch (error) {
            console.error('Failed to copy to clipboard:', error);
        }
    };

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                        <Mail className="h-5 w-5" />
                        <span>Work Email Setup</span>
                    </CardTitle>
                    <CardDescription>
                        Your company email address has been generated. You'll use this for all work-related communications.
                    </CardDescription>
                </CardHeader>

                <CardContent className="space-y-6">
                    {isGenerating ? (
                        <div className="text-center py-8">
                            <Loader className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
                            <p>Generating your work email address...</p>
                        </div>
                    ) : workEmail ? (
                        <>
                            {/* Work Email Display */}
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                                <div className="text-center space-y-4">
                                    <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                                        <Mail className="w-8 h-8 text-blue-600" />
                                    </div>

                                    <div>
                                        <h3 className="text-lg font-semibold text-blue-900 mb-2">
                                            Your Work Email Address
                                        </h3>
                                        <div className="bg-white border border-blue-300 rounded-lg p-4 inline-block">
                                            <p className="text-xl font-mono text-blue-800">{workEmail}</p>
                                        </div>
                                    </div>

                                    <div className="flex justify-center space-x-3">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={copyToClipboard}
                                            className="text-blue-600 border-blue-300 hover:bg-blue-50"
                                        >
                                            <Copy className="w-4 h-4 mr-2" />
                                            Copy Email
                                        </Button>
                                    </div>
                                </div>
                            </div>

                            {/* Important Information */}
                            <Alert className="border-yellow-200 bg-yellow-50">
                                <AlertCircle className="h-4 w-4 text-yellow-600" />
                                <AlertDescription className="text-yellow-800">
                                    <strong>Important:</strong> After onboarding, you'll login using this work email
                                    instead of your Employee ID. Please save this information securely.
                                </AlertDescription>
                            </Alert>

                            {/* Email Features */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="p-4 border rounded-lg">
                                    <h4 className="font-medium text-gray-900 mb-2">Email Features</h4>
                                    <ul className="text-sm text-gray-600 space-y-1">
                                        <li className="flex items-center space-x-2">
                                            <CheckCircle className="w-4 h-4 text-green-500" />
                                            <span>Professional email address</span>
                                        </li>
                                        <li className="flex items-center space-x-2">
                                            <CheckCircle className="w-4 h-4 text-green-500" />
                                            <span>Company domain access</span>
                                        </li>
                                        <li className="flex items-center space-x-2">
                                            <CheckCircle className="w-4 h-4 text-green-500" />
                                            <span>Calendar integration</span>
                                        </li>
                                        <li className="flex items-center space-x-2">
                                            <CheckCircle className="w-4 h-4 text-green-500" />
                                            <span>File sharing capabilities</span>
                                        </li>
                                    </ul>
                                </div>

                                <div className="p-4 border rounded-lg">
                                    <h4 className="font-medium text-gray-900 mb-2">Next Steps</h4>
                                    <ul className="text-sm text-gray-600 space-y-1">
                                        <li>• Complete the remaining onboarding steps</li>
                                        <li>• Your email will be activated after onboarding</li>
                                        <li>• You'll receive login credentials via email</li>
                                        <li>• Contact IT support if you need assistance</li>
                                    </ul>
                                </div>
                            </div>

                            {/* Continue Button */}
                            <div className="flex justify-end">
                                <Button
                                    onClick={handleContinue}
                                    disabled={isCompleting}
                                    className="px-8"
                                >
                                    {isCompleting ? (
                                        <span className="flex items-center">
                                            <Loader className="w-4 h-4 mr-2 animate-spin" />
                                            Saving...
                                        </span>
                                    ) : (
                                        'Continue to Next Step'
                                    )}
                                </Button>
                            </div>
                        </>
                    ) : (
                        <div className="text-center py-8">
                            <div className="text-center">
                                <Loader className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
                                <p>Generating work email...</p>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default WorkEmailSetup;
