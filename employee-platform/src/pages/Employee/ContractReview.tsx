import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { Badge } from '../../components/ui/badge';
import {
    Download,
    FileText,
    CheckCircle,
    Clock,
    AlertCircle,
    Building,
    Calendar,
    DollarSign,
    Users,
    Briefcase,
    ArrowRight
} from 'lucide-react';
import { contractService, ContractData } from './services/contractService';
import { format } from 'date-fns';

interface ContractReviewProps {
    employeeId: string;
    onComplete: (data: any) => void;
    onError: (error: string) => void;
}

const ContractReviewForm: React.FC<ContractReviewProps> = ({
    employeeId,
    onComplete,
    onError
}) => {
    const [contract, setContract] = useState<ContractData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isDownloading, setIsDownloading] = useState(false);
    const [isReviewed, setIsReviewed] = useState(false);

    useEffect(() => {
        loadContract();
    }, [employeeId]);

    const loadContract = async () => {
        try {
            const contractData = await contractService.getEmployeeContract(employeeId);
            if (contractData) {
                setContract(contractData);
            } else {
                onError('Unable to load contract');
            }
        } catch (error) {
            onError('Unable to load contract');
        } finally {
            setIsLoading(false);
        }
    };

    const downloadContract = async () => {
        if (!contract) return;

        setIsDownloading(true);
        try {
            console.log('📄 [Contract] Starting contract download for:', employeeId);
            const contractBlob = await contractService.downloadContract(employeeId);

            if (!contractBlob || contractBlob.size === 0) {
                throw new Error('Contract document is empty');
            }

            console.log('📄 [Contract] Contract blob created, size:', contractBlob.size);

            const url = window.URL.createObjectURL(contractBlob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `Employment_Contract_${employeeId}.txt`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);

            console.log('✅ [Contract] Contract downloaded successfully');
        } catch (error) {
            console.error('❌ [Contract] Download error:', error);
            onError(`Unable to download contract: ${error instanceof Error ? error.message : 'Unknown error'}`);
        } finally {
            setIsDownloading(false);
        }
    };

    const handleContractReviewed = async () => {
        try {
            const success = await contractService.markContractReviewed(employeeId);
            if (success) {
                setIsReviewed(true);
                onComplete({ contractReviewed: true });
            } else {
                onError('Failed to mark contract as reviewed');
            }
        } catch (error) {
            onError('Failed to mark contract as reviewed');
        }
    };

    const formatCurrency = (amount: number, currency: string = 'USD') => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currency
        }).format(amount);
    };

    const getStatusBadge = (status: string) => {
        const statusConfig = {
            draft: { variant: 'secondary' as const, label: 'Draft' },
            pending_review: { variant: 'default' as const, label: 'Pending Review' },
            signed: { variant: 'default' as const, label: 'Signed' },
            executed: { variant: 'default' as const, label: 'Executed' }
        };

        const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.draft;
        return <Badge variant={config.variant}>{config.label}</Badge>;
    };

    if (isLoading) {
        return (
            <Card>
                <CardContent className="flex items-center justify-center py-8">
                    <div className="text-center">
                        <Clock className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
                        <p>Loading your contract...</p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (!contract) {
        return (
            <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                    No contract found for your employee ID. Please contact HR for assistance.
                </AlertDescription>
            </Alert>
        );
    }

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="flex items-center space-x-2">
                                <FileText className="h-5 w-5" />
                                <span>Your Employment Contract</span>
                            </CardTitle>
                            <CardDescription>
                                Please review your employment contract carefully before proceeding
                            </CardDescription>
                        </div>
                        {getStatusBadge(contract.status)}
                    </div>
                </CardHeader>

                <CardContent className="space-y-6">
                    {/* Contract Summary */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-blue-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                            <Briefcase className="h-5 w-5 text-blue-600" />
                            <div>
                                <p className="text-sm font-medium text-blue-900">Position</p>
                                <p className="text-sm text-blue-700">{contract.position}</p>
                            </div>
                        </div>

                        <div className="flex items-center space-x-3">
                            <Building className="h-5 w-5 text-blue-600" />
                            <div>
                                <p className="text-sm font-medium text-blue-900">Department</p>
                                <p className="text-sm text-blue-700">{contract.department}</p>
                            </div>
                        </div>

                        <div className="flex items-center space-x-3">
                            <Calendar className="h-5 w-5 text-blue-600" />
                            <div>
                                <p className="text-sm font-medium text-blue-900">Start Date</p>
                                <p className="text-sm text-blue-700">
                                    {format(contract.effectiveDate, 'MMM dd, yyyy')}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center space-x-3">
                            <DollarSign className="h-5 w-5 text-blue-600" />
                            <div>
                                <p className="text-sm font-medium text-blue-900">Salary</p>
                                <p className="text-sm text-blue-700">
                                    {formatCurrency(contract.terms.salary, contract.terms.currency)}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Contract Terms */}
                    <div className="space-y-4">
                        <h4 className="font-semibold text-gray-900">Contract Terms</h4>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="p-4 border rounded-lg">
                                <h5 className="font-medium mb-2">Working Hours</h5>
                                <p className="text-sm text-gray-600">{contract.terms.workingHours}</p>
                            </div>

                            <div className="p-4 border rounded-lg">
                                <h5 className="font-medium mb-2">Probation Period</h5>
                                <p className="text-sm text-gray-600">{contract.terms.probationPeriod} months</p>
                            </div>
                        </div>

                        {contract.terms.benefits.length > 0 && (
                            <div className="p-4 border rounded-lg">
                                <h5 className="font-medium mb-2">Benefits</h5>
                                <ul className="text-sm text-gray-600 space-y-1">
                                    {contract.terms.benefits.map((benefit, index) => (
                                        <li key={index} className="flex items-center space-x-2">
                                            <CheckCircle className="h-4 w-4 text-green-500" />
                                            <span>{benefit}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>

                    {/* Contract Document Viewer */}
                    <div className="space-y-4">
                        <h4 className="font-semibold text-gray-900">Contract Document</h4>

                        <div className="border rounded-lg p-4 bg-white">
                            <div className="w-full h-96 border-0 rounded bg-gray-100 flex items-center justify-center">
                                <div className="text-center">
                                    <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                                    <p className="text-gray-600 mb-4">Contract Document Preview</p>
                                    <p className="text-sm text-gray-500">
                                        Click "Download Contract" to get your employment contract (.txt file)
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-3">
                            <Button
                                onClick={downloadContract}
                                disabled={isDownloading}
                                className="flex items-center space-x-2"
                            >
                                <Download className="h-4 w-4" />
                                <span>{isDownloading ? 'Downloading...' : 'Download Contract'}</span>
                            </Button>

                            {!isReviewed && (
                                <Button
                                    onClick={handleContractReviewed}
                                    className="flex items-center space-x-2 bg-green-600 hover:bg-green-700"
                                >
                                    <CheckCircle className="h-4 w-4" />
                                    <span>I have reviewed my contract</span>
                                </Button>
                            )}
                        </div>
                    </div>

                    {/* Instructions */}
                    <Alert>
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                            <strong>Next Step:</strong> Please download, print, and sign this contract in the signature section.
                            <br />
                            <strong>Instructions:</strong>
                            <br />• Download the contract document
                            <br />• Print it out
                            <br />• Sign in the "Employee Signature" section
                            <br />• Scan or take a photo of the signed contract
                            <br />• Upload the signed copy in the next step
                        </AlertDescription>
                    </Alert>

                    {isReviewed && (
                        <div className="space-y-4">
                            <Alert className="border-green-200 bg-green-50">
                                <CheckCircle className="h-4 w-4 text-green-600" />
                                <AlertDescription className="text-green-800">
                                    ✓ Contract reviewed successfully! You can now proceed to upload your signed contract.
                                </AlertDescription>
                            </Alert>

                            <div className="flex justify-end">
                                <Button
                                    onClick={() => onComplete({ contractReviewed: true })}
                                    className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700"
                                >
                                    <span>Continue to Next Step</span>
                                    <ArrowRight className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default ContractReviewForm;
