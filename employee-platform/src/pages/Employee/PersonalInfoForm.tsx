import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Alert, AlertDescription } from '../../components/ui/alert';
import {
    User,
    Mail,
    Phone,
    MapPin,
    Calendar,
    AlertCircle,
    Loader
} from 'lucide-react';
import { PersonalInfo } from './services/onboardingService';

interface PersonalInfoFormProps {
    employeeId: string;
    progress: any;
    onComplete: (data: PersonalInfo) => void;
    onError: (error: string) => void;
}

const PersonalInfoForm: React.FC<PersonalInfoFormProps> = ({
    employeeId,
    progress,
    onComplete,
    onError
}) => {
    const [formData, setFormData] = useState<PersonalInfo>({
        firstName: '',
        lastName: '',
        middleName: '',
        dateOfBirth: new Date(),
        gender: '',
        maritalStatus: '',
        nationality: '',
        phoneNumber: '',
        personalEmail: '',
        address: {
            street: '',
            city: '',
            state: '',
            zipCode: '',
            country: ''
        }
    });

    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!formData.firstName.trim()) {
            newErrors.firstName = 'First name is required';
        }

        if (!formData.lastName.trim()) {
            newErrors.lastName = 'Last name is required';
        }

        if (!formData.dateOfBirth) {
            newErrors.dateOfBirth = 'Date of birth is required';
        }

        if (!formData.gender) {
            newErrors.gender = 'Gender is required';
        }

        if (!formData.maritalStatus) {
            newErrors.maritalStatus = 'Marital status is required';
        }

        if (!formData.nationality) {
            newErrors.nationality = 'Nationality is required';
        }

        if (!formData.phoneNumber.trim()) {
            newErrors.phoneNumber = 'Phone number is required';
        }

        if (!formData.personalEmail.trim()) {
            newErrors.personalEmail = 'Personal email is required';
        } else if (!/\S+@\S+\.\S+/.test(formData.personalEmail)) {
            newErrors.personalEmail = 'Invalid email format';
        }

        if (!formData.address.street.trim()) {
            newErrors.street = 'Street address is required';
        }

        if (!formData.address.city.trim()) {
            newErrors.city = 'City is required';
        }

        if (!formData.address.state.trim()) {
            newErrors.state = 'State is required';
        }

        if (!formData.address.zipCode.trim()) {
            newErrors.zipCode = 'ZIP code is required';
        }

        if (!formData.address.country.trim()) {
            newErrors.country = 'Country is required';
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
            onError('Failed to save personal information');
        } finally {
            setIsLoading(false);
        }
    };

    const handleInputChange = (field: string, value: any) => {
        if (field.includes('.')) {
            const [parent, child] = field.split('.');
            setFormData(prev => ({
                ...prev,
                [parent]: {
                    ...prev[parent as keyof PersonalInfo],
                    [child]: value
                }
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [field]: value
            }));
        }

        // Clear error when user starts typing
        if (errors[field]) {
            setErrors(prev => ({
                ...prev,
                [field]: ''
            }));
        }
    };

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                        <User className="h-5 w-5" />
                        <span>Personal Information</span>
                    </CardTitle>
                    <CardDescription>
                        Please provide your personal details. This information will be used to create your employee profile.
                    </CardDescription>
                </CardHeader>

                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Basic Information */}
                        <div className="space-y-4">
                            <h4 className="font-medium text-gray-900">Basic Information</h4>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="firstName">First Name *</Label>
                                    <Input
                                        id="firstName"
                                        value={formData.firstName}
                                        onChange={(e) => handleInputChange('firstName', e.target.value)}
                                        placeholder="Enter your first name"
                                        className={errors.firstName ? 'border-red-500' : ''}
                                    />
                                    {errors.firstName && (
                                        <p className="text-sm text-red-600">{errors.firstName}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="middleName">Middle Name</Label>
                                    <Input
                                        id="middleName"
                                        value={formData.middleName}
                                        onChange={(e) => handleInputChange('middleName', e.target.value)}
                                        placeholder="Enter your middle name"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="lastName">Last Name *</Label>
                                    <Input
                                        id="lastName"
                                        value={formData.lastName}
                                        onChange={(e) => handleInputChange('lastName', e.target.value)}
                                        placeholder="Enter your last name"
                                        className={errors.lastName ? 'border-red-500' : ''}
                                    />
                                    {errors.lastName && (
                                        <p className="text-sm text-red-600">{errors.lastName}</p>
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="dateOfBirth">Date of Birth *</Label>
                                    <Input
                                        id="dateOfBirth"
                                        type="date"
                                        value={formData.dateOfBirth.toISOString().split('T')[0]}
                                        onChange={(e) => handleInputChange('dateOfBirth', new Date(e.target.value))}
                                        className={errors.dateOfBirth ? 'border-red-500' : ''}
                                    />
                                    {errors.dateOfBirth && (
                                        <p className="text-sm text-red-600">{errors.dateOfBirth}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="gender">Gender *</Label>
                                    <Select value={formData.gender} onValueChange={(value) => handleInputChange('gender', value)}>
                                        <SelectTrigger className={errors.gender ? 'border-red-500' : ''}>
                                            <SelectValue placeholder="Select gender" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="male">Male</SelectItem>
                                            <SelectItem value="female">Female</SelectItem>
                                            <SelectItem value="other">Other</SelectItem>
                                            <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    {errors.gender && (
                                        <p className="text-sm text-red-600">{errors.gender}</p>
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="maritalStatus">Marital Status *</Label>
                                    <Select value={formData.maritalStatus} onValueChange={(value) => handleInputChange('maritalStatus', value)}>
                                        <SelectTrigger className={errors.maritalStatus ? 'border-red-500' : ''}>
                                            <SelectValue placeholder="Select marital status" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="single">Single</SelectItem>
                                            <SelectItem value="married">Married</SelectItem>
                                            <SelectItem value="divorced">Divorced</SelectItem>
                                            <SelectItem value="widowed">Widowed</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    {errors.maritalStatus && (
                                        <p className="text-sm text-red-600">{errors.maritalStatus}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="nationality">Nationality *</Label>
                                    <Input
                                        id="nationality"
                                        value={formData.nationality}
                                        onChange={(e) => handleInputChange('nationality', e.target.value)}
                                        placeholder="Enter your nationality"
                                        className={errors.nationality ? 'border-red-500' : ''}
                                    />
                                    {errors.nationality && (
                                        <p className="text-sm text-red-600">{errors.nationality}</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Contact Information */}
                        <div className="space-y-4">
                            <h4 className="font-medium text-gray-900">Contact Information</h4>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="phoneNumber">Phone Number *</Label>
                                    <Input
                                        id="phoneNumber"
                                        value={formData.phoneNumber}
                                        onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                                        placeholder="Enter your phone number"
                                        className={errors.phoneNumber ? 'border-red-500' : ''}
                                    />
                                    {errors.phoneNumber && (
                                        <p className="text-sm text-red-600">{errors.phoneNumber}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="personalEmail">Personal Email *</Label>
                                    <Input
                                        id="personalEmail"
                                        type="email"
                                        value={formData.personalEmail}
                                        onChange={(e) => handleInputChange('personalEmail', e.target.value)}
                                        placeholder="Enter your personal email"
                                        className={errors.personalEmail ? 'border-red-500' : ''}
                                    />
                                    {errors.personalEmail && (
                                        <p className="text-sm text-red-600">{errors.personalEmail}</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Address Information */}
                        <div className="space-y-4">
                            <h4 className="font-medium text-gray-900">Address Information</h4>

                            <div className="space-y-2">
                                <Label htmlFor="street">Street Address *</Label>
                                <Input
                                    id="street"
                                    value={formData.address.street}
                                    onChange={(e) => handleInputChange('address.street', e.target.value)}
                                    placeholder="Enter your street address"
                                    className={errors.street ? 'border-red-500' : ''}
                                />
                                {errors.street && (
                                    <p className="text-sm text-red-600">{errors.street}</p>
                                )}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="city">City *</Label>
                                    <Input
                                        id="city"
                                        value={formData.address.city}
                                        onChange={(e) => handleInputChange('address.city', e.target.value)}
                                        placeholder="Enter your city"
                                        className={errors.city ? 'border-red-500' : ''}
                                    />
                                    {errors.city && (
                                        <p className="text-sm text-red-600">{errors.city}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="state">State/Province *</Label>
                                    <Input
                                        id="state"
                                        value={formData.address.state}
                                        onChange={(e) => handleInputChange('address.state', e.target.value)}
                                        placeholder="Enter your state"
                                        className={errors.state ? 'border-red-500' : ''}
                                    />
                                    {errors.state && (
                                        <p className="text-sm text-red-600">{errors.state}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="zipCode">ZIP/Postal Code *</Label>
                                    <Input
                                        id="zipCode"
                                        value={formData.address.zipCode}
                                        onChange={(e) => handleInputChange('address.zipCode', e.target.value)}
                                        placeholder="Enter your ZIP code"
                                        className={errors.zipCode ? 'border-red-500' : ''}
                                    />
                                    {errors.zipCode && (
                                        <p className="text-sm text-red-600">{errors.zipCode}</p>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="country">Country *</Label>
                                <Input
                                    id="country"
                                    value={formData.address.country}
                                    onChange={(e) => handleInputChange('address.country', e.target.value)}
                                    placeholder="Enter your country"
                                    className={errors.country ? 'border-red-500' : ''}
                                />
                                {errors.country && (
                                    <p className="text-sm text-red-600">{errors.country}</p>
                                )}
                            </div>
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

export default PersonalInfoForm;

