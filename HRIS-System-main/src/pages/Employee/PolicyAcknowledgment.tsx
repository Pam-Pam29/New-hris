import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { Badge } from '../../components/ui/badge';
import {
    Shield,
    CheckCircle,
    AlertCircle,
    Loader,
    FileText,
    ExternalLink
} from 'lucide-react';
import { onboardingService } from './services/onboardingService';

interface PolicyAcknowledgmentProps {
    employeeId: string;
    progress: any;
    onComplete: (data: string[]) => void;
    onError: (error: string) => void;
}

interface Policy {
    id: string;
    title: string;
    description: string;
    required: boolean;
    version: string;
    acknowledged: boolean;
}

const PolicyAcknowledgment: React.FC<PolicyAcknowledgmentProps> = ({
    employeeId,
    progress,
    onComplete,
    onError
}) => {
    const [policies, setPolicies] = useState<Policy[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isCompleting, setIsCompleting] = useState(false);

    useEffect(() => {
        loadPolicies();
    }, []);

    const loadPolicies = async () => {
        try {
            const companyPolicies = await onboardingService.getCompanyPolicies();
            const policyItems: Policy[] = companyPolicies.map(policy => ({
                ...policy,
                acknowledged: false
            }));
            setPolicies(policyItems);
        } catch (error) {
            onError('Failed to load company policies');
        } finally {
            setIsLoading(false);
        }
    };

    const toggleAcknowledgment = (policyId: string) => {
        setPolicies(prev => prev.map(policy => {
            if (policy.id === policyId) {
                return { ...policy, acknowledged: !policy.acknowledged };
            }
            return policy;
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const requiredPolicies = policies.filter(policy => policy.required);
        const unacknowledgedRequired = requiredPolicies.filter(policy => !policy.acknowledged);

        if (unacknowledgedRequired.length > 0) {
            onError(`Please acknowledge all required policies: ${unacknowledgedRequired.map(policy => policy.title).join(', ')}`);
            return;
        }

        setIsCompleting(true);

        try {
            const acknowledgedPolicies = policies
                .filter(policy => policy.acknowledged)
                .map(policy => policy.id);

            onComplete(acknowledgedPolicies);
        } catch (error) {
            onError('Failed to save policy acknowledgments');
        } finally {
            setIsCompleting(false);
        }
    };

    const openPolicyDocument = (policyId: string) => {
        // In a real implementation, this would open the policy document
        console.log(`Opening policy document: ${policyId}`);
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-8">
                <div className="text-center">
                    <Loader className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
                    <p>Loading company policies...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                        <Shield className="h-5 w-5" />
                        <span>Company Policies</span>
                    </CardTitle>
                    <CardDescription>
                        Please review and acknowledge the company policies. Required policies must be acknowledged to continue.
                    </CardDescription>
                </CardHeader>

                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Policy List */}
                        <div className="space-y-4">
                            {policies.map((policy) => (
                                <div key={policy.id} className="border rounded-lg p-4 space-y-4">
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-start space-x-3 flex-1">
                                            <FileText className="w-5 h-5 text-blue-600 mt-1" />
                                            <div className="flex-1">
                                                <div className="flex items-center space-x-2 mb-2">
                                                    <h4 className="font-medium text-gray-900">{policy.title}</h4>
                                                    {policy.required && (
                                                        <Badge variant="destructive">Required</Badge>
                                                    )}
                                                    <Badge variant="outline">v{policy.version}</Badge>
                                                </div>
                                                <p className="text-sm text-gray-600 mb-3">{policy.description}</p>

                                                <div className="flex items-center space-x-4">
                                                    <button
                                                        type="button"
                                                        onClick={() => openPolicyDocument(policy.id)}
                                                        className="text-sm text-blue-600 hover:text-blue-800 flex items-center space-x-1"
                                                    >
                                                        <ExternalLink className="w-4 h-4" />
                                                        <span>Read Policy Document</span>
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                                        <input
                                            type="checkbox"
                                            id={`policy-${policy.id}`}
                                            checked={policy.acknowledged}
                                            onChange={() => toggleAcknowledgment(policy.id)}
                                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                        />
                                        <label htmlFor={`policy-${policy.id}`} className="text-sm text-gray-700">
                                            I have read and acknowledge the {policy.title} (Version {policy.version})
                                        </label>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Summary */}
                        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                            <h4 className="font-medium text-blue-900 mb-2">Acknowledgment Summary</h4>
                            <div className="text-sm text-blue-800 space-y-1">
                                <p>• Total policies: {policies.length}</p>
                                <p>• Required policies: {policies.filter(p => p.required).length}</p>
                                <p>• Acknowledged: {policies.filter(p => p.acknowledged).length}</p>
                                <p>• Remaining: {policies.filter(p => !p.acknowledged).length}</p>
                            </div>
                        </div>

                        {/* Important Notice */}
                        <Alert className="border-yellow-200 bg-yellow-50">
                            <AlertCircle className="h-4 w-4 text-yellow-600" />
                            <AlertDescription className="text-yellow-800">
                                <strong>Important:</strong> By acknowledging these policies, you agree to comply with
                                all company rules and regulations. Failure to comply may result in disciplinary action.
                            </AlertDescription>
                        </Alert>

                        {/* Submit Button */}
                        <div className="flex justify-end">
                            <Button
                                type="submit"
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
                    </form>
                </CardContent>
            </Card>
        </div>
    );
};

export default PolicyAcknowledgment;





