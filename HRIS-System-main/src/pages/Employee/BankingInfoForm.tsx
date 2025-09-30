import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Alert, AlertDescription } from '../../components/ui/alert';
import {
    CreditCard,
    Banknote,
    AlertCircle,
    Loader,
    Shield
} from 'lucide-react';
import { BankingInfo } from './services/onboardingService';

interface BankingInfoFormProps {
    employeeId: string;
    progress: any;
    onComplete: (data: BankingInfo) => void;
    onError: (error: string) => void;
}

const BankingInfoForm: React.FC<BankingInfoFormProps> = ({
    employeeId,
    progress,
    onComplete,
    onError
}) => {
    const [formData, setFormData] = useState<BankingInfo>({
        bankName: '',
        accountNumber: '',
        routingNumber: '',
        accountType: 'checking',
        accountHolderName: '',
        isPrimary: true
    });

    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!formData.bankName.trim()) {
            newErrors.bankName = 'Bank name is required';
        }

        if (!formData.accountNumber.trim()) {
            newErrors.accountNumber = 'Account number is required';
        } else if (formData.accountNumber.length < 8) {
            newErrors.accountNumber = 'Account number must be at least 8 digits';
        }

        if (!formData.routingNumber.trim()) {
            newErrors.routingNumber = 'Routing number is required';
        } else if (formData.routingNumber.length !== 9) {
            newErrors.routingNumber = 'Routing number must be exactly 9 digits';
        }

        if (!formData.accountHolderName.trim()) {
            newErrors.accountHolderName = 'Account holder name is required';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setIsLoading(true);

        try {
            onComplete(formData);
        } catch (error) {
            onError('Failed to save banking information');
        } finally {
            setIsLoading(false);
        }
    };

    const handleInputChange = (field: keyof BankingInfo, value: any) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));

        // Clear error when user starts typing
        if (errors[field]) {
            setErrors(prev => ({
                ...prev,
                [field]: ''
            }));
        }
    };

    const formatAccountNumber = (value: string) => {
        // Remove all non-digits
        const digits = value.replace(/\D/g, '');
        // Limit to 17 digits (typical max for account numbers)
        return digits.slice(0, 17);
    };

    const formatRoutingNumber = (value: string) => {
        // Remove all non-digits
        const digits = value.replace(/\D/g, '');
        // Limit to 9 digits
        return digits.slice(0, 9);
    };

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                        <CreditCard className="h-5 w-5" />
                        <span>Banking Information</span>
                    </CardTitle>
                    <CardDescription>
                        Provide your banking information for direct deposit. This information is encrypted and secure.
                    </CardDescription>
                </CardHeader>

                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Security Notice */}
                        <Alert className="border-blue-200 bg-blue-50">
                            <Shield className="h-4 w-4 text-blue-600" />
                            <AlertDescription className="text-blue-800">
                                <strong>Security Notice:</strong> Your banking information is encrypted and stored securely.
                                Only authorized payroll personnel can access this information.
                            </AlertDescription>
                        </Alert>

                        {/* Bank Information */}
                        <div className="space-y-4">
                            <h4 className="font-medium text-gray-900">Bank Details</h4>

                            <div className="space-y-2">
                                <Label htmlFor="bankName">Bank Name *</Label>
                                <Input
                                    id="bankName"
                                    value={formData.bankName}
                                    onChange={(e) => handleInputChange('bankName', e.target.value)}
                                    placeholder="Enter your bank name"
                                    className={errors.bankName ? 'border-red-500' : ''}
                                />
                                {errors.bankName && (
                                    <p className="text-sm text-red-600">{errors.bankName}</p>
                                )}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="routingNumber">Routing Number *</Label>
                                    <Input
                                        id="routingNumber"
                                        value={formData.routingNumber}
                                        onChange={(e) => handleInputChange('routingNumber', formatRoutingNumber(e.target.value))}
                                        placeholder="9-digit routing number"
                                        maxLength={9}
                                        className={errors.routingNumber ? 'border-red-500' : ''}
                                    />
                                    {errors.routingNumber && (
                                        <p className="text-sm text-red-600">{errors.routingNumber}</p>
                                    )}
                                    <p className="text-xs text-gray-500">
                                        Found on your checks or bank statement
                                    </p>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="accountType">Account Type *</Label>
                                    <Select value={formData.accountType} onValueChange={(value) => handleInputChange('accountType', value)}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select account type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="checking">Checking</SelectItem>
                                            <SelectItem value="savings">Savings</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </div>

                        {/* Account Information */}
                        <div className="space-y-4">
                            <h4 className="font-medium text-gray-900">Account Information</h4>

                            <div className="space-y-2">
                                <Label htmlFor="accountHolderName">Account Holder Name *</Label>
                                <Input
                                    id="accountHolderName"
                                    value={formData.accountHolderName}
                                    onChange={(e) => handleInputChange('accountHolderName', e.target.value)}
                                    placeholder="Name as it appears on the account"
                                    className={errors.accountHolderName ? 'border-red-500' : ''}
                                />
                                {errors.accountHolderName && (
                                    <p className="text-sm text-red-600">{errors.accountHolderName}</p>
                                )}
                                <p className="text-xs text-gray-500">
                                    Must match the name on your bank account
                                </p>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="accountNumber">Account Number *</Label>
                                <Input
                                    id="accountNumber"
                                    value={formData.accountNumber}
                                    onChange={(e) => handleInputChange('accountNumber', formatAccountNumber(e.target.value))}
                                    placeholder="Enter your account number"
                                    className={errors.accountNumber ? 'border-red-500' : ''}
                                />
                                {errors.accountNumber && (
                                    <p className="text-sm text-red-600">{errors.accountNumber}</p>
                                )}
                                <p className="text-xs text-gray-500">
                                    Found on your checks or bank statement
                                </p>
                            </div>
                        </div>

                        {/* Verification */}
                        <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                            <h4 className="font-medium text-yellow-900 mb-2">Important Information</h4>
                            <ul className="text-sm text-yellow-800 space-y-1">
                                <li>• Double-check your routing and account numbers</li>
                                <li>• Incorrect information may delay your pay</li>
                                <li>• You can update this information later in your profile</li>
                                <li>• Contact HR if you need assistance</li>
                            </ul>
                        </div>

                        {/* Submit Button */}
                        <div className="flex justify-end">
                            <Button
                                type="submit"
                                disabled={isLoading}
                                className="px-8"
                            >
                                {isLoading ? (
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

export default BankingInfoForm;



