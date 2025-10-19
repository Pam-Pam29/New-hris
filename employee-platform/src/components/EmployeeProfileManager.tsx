import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Progress } from './ui/progress';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { useToast } from '../hooks/use-toast';
import {
    User,
    Mail,
    Phone,
    MapPin,
    Calendar,
    CreditCard,
    Building,
    TrendingUp,
    Save,
    Edit,
    CheckCircle,
    AlertCircle
} from 'lucide-react';
import { getComprehensiveHRDataFlowService, ComprehensiveEmployeeProfile } from '../services/comprehensiveHRDataFlow';

interface EmployeeProfileManagerProps {
    employeeId: string;
    mode: 'employee' | 'hr'; // Different views for employee vs HR
}

export function EmployeeProfileManager({ employeeId, mode }: EmployeeProfileManagerProps) {
    console.log('EmployeeProfileManager: Component rendered with employeeId:', employeeId, 'mode:', mode);

    const [profile, setProfile] = useState<ComprehensiveEmployeeProfile | null>(null);
    const [editing, setEditing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState<Partial<ComprehensiveEmployeeProfile>>({});
    const { toast } = useToast();

    useEffect(() => {
        let unsubscribe: (() => void) | null = null;

        const initializeProfile = async () => {
            try {
                console.log('EmployeeProfileManager: Initializing profile for employee:', employeeId);
                const dataFlowService = await getComprehensiveHRDataFlowService();

                // Subscribe to real-time profile updates
                console.log('EmployeeProfileManager: About to subscribe to profile updates...');
                unsubscribe = dataFlowService.subscribeToEmployeeUpdates(employeeId, (updatedProfile) => {
                    console.log('EmployeeProfileManager: Received profile data:', updatedProfile);
                    console.log('EmployeeProfileManager: Setting profile and stopping loading...');
                    setProfile(updatedProfile);
                    setLoading(false);
                });
                console.log('EmployeeProfileManager: Subscription created, waiting for data...');
            } catch (error) {
                console.error('EmployeeProfileManager: Error initializing profile:', error);
                setLoading(false);
            }
        };

        initializeProfile();

        return () => {
            if (unsubscribe) {
                unsubscribe();
            }
        };
    }, [employeeId]);

    const handleEdit = () => {
        if (profile) {
            setFormData(profile);
            setEditing(true);
        }
    };

    const handleSave = async () => {
        try {
            setSaving(true);
            const dataFlowService = await getComprehensiveHRDataFlowService();

            await dataFlowService.updateEmployeeProfile(employeeId, formData);

            setEditing(false);
            toast({
                title: "Success",
                description: "Profile updated successfully",
            });
        } catch (error) {
            console.error('Error updating profile:', error);
            toast({
                title: "Error",
                description: "Failed to update profile",
                variant: "destructive"
            });
        } finally {
            setSaving(false);
        }
    };

    const handleCancel = () => {
        setFormData({});
        setEditing(false);
    };

    const handleInputChange = (field: string, value: any, section?: string) => {
        if (section) {
            setFormData(prev => ({
                ...prev,
                [section]: {
                    ...prev[section as keyof ComprehensiveEmployeeProfile],
                    [field]: value
                }
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [field]: value
            }));
        }
    };

    const getCompletenessColor = (percentage: number) => {
        if (percentage >= 90) return 'bg-green-500';
        if (percentage >= 70) return 'bg-yellow-500';
        return 'bg-red-500';
    };

    const getCompletenessStatus = (percentage: number) => {
        if (percentage >= 90) return 'Excellent';
        if (percentage >= 70) return 'Good';
        if (percentage >= 50) return 'Needs Improvement';
        return 'Incomplete';
    };

    console.log('EmployeeProfileManager: Render check - loading:', loading, 'profile:', !!profile, 'profile data:', profile);

    if (loading) {
        console.log('EmployeeProfileManager: Showing loading state');
        return (
            <Card>
                <CardContent className="p-6">
                    <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (!profile) {
        console.log('EmployeeProfileManager: Showing "Profile not found" state');
        return (
            <Card>
                <CardContent className="p-6">
                    <div className="text-center text-muted-foreground">
                        <AlertCircle className="h-8 w-8 mx-auto mb-2" />
                        <p>Profile not found</p>
                        <p>Debug: loading={loading.toString()}, profile={profile ? 'exists' : 'null'}</p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    const currentData = editing ? formData : profile;
    const completeness = profile.profileStatus?.completeness || 0;

    console.log('EmployeeProfileManager: About to render profile content');
    console.log('EmployeeProfileManager: currentData:', currentData);
    console.log('EmployeeProfileManager: completeness:', completeness);

    return (
        <div className="space-y-6">
            {/* Profile Header */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                                <User className="h-8 w-8 text-primary" />
                            </div>
                            <div>
                                <CardTitle className="text-2xl">
                                    {currentData.personalInfo?.firstName} {currentData.personalInfo?.lastName}
                                </CardTitle>
                                <p className="text-muted-foreground">
                                    {currentData.workInfo?.position} • {currentData.workInfo?.department}
                                </p>
                            </div>
                        </div>

                        {mode === 'employee' && (
                            <div className="flex items-center space-x-4">
                                <div className="text-right">
                                    <div className="flex items-center space-x-2 mb-1">
                                        <span className="text-sm font-medium">Profile Completeness</span>
                                        <Badge
                                            variant={completeness >= 90 ? 'default' : completeness >= 70 ? 'secondary' : 'destructive'}
                                        >
                                            {completeness}%
                                        </Badge>
                                    </div>
                                    <div className="w-32">
                                        <Progress
                                            value={completeness}
                                            className="h-2"
                                        />
                                    </div>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        {getCompletenessStatus(completeness)}
                                    </p>
                                </div>

                                <Button
                                    onClick={editing ? handleSave : handleEdit}
                                    disabled={saving}
                                    className="flex items-center space-x-2"
                                >
                                    {editing ? (
                                        saving ? (
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                        ) : (
                                            <Save className="h-4 w-4" />
                                        )
                                    ) : (
                                        <Edit className="h-4 w-4" />
                                    )}
                                    <span>{editing ? (saving ? 'Saving...' : 'Save Changes') : 'Edit Profile'}</span>
                                </Button>

                                {editing && (
                                    <Button variant="outline" onClick={handleCancel}>
                                        Cancel
                                    </Button>
                                )}
                            </div>
                        )}
                    </div>
                </CardHeader>
            </Card>

            {/* Profile Sections */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Personal Information */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                            <User className="h-5 w-5" />
                            <span>Personal Information</span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="firstName">First Name</Label>
                                <Input
                                    id="firstName"
                                    value={currentData.personalInfo?.firstName || ''}
                                    onChange={(e) => handleInputChange('firstName', e.target.value, 'personalInfo')}
                                    disabled={!editing}
                                />
                            </div>
                            <div>
                                <Label htmlFor="lastName">Last Name</Label>
                                <Input
                                    id="lastName"
                                    value={currentData.personalInfo?.lastName || ''}
                                    onChange={(e) => handleInputChange('lastName', e.target.value, 'personalInfo')}
                                    disabled={!editing}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="dateOfBirth">Date of Birth</Label>
                                <Input
                                    id="dateOfBirth"
                                    type="date"
                                    value={currentData.personalInfo?.dateOfBirth ?
                                        new Date(currentData.personalInfo.dateOfBirth).toISOString().split('T')[0] : ''}
                                    onChange={(e) => handleInputChange('dateOfBirth', new Date(e.target.value), 'personalInfo')}
                                    disabled={!editing}
                                />
                            </div>
                            <div>
                                <Label htmlFor="gender">Gender</Label>
                                <Input
                                    id="gender"
                                    value={currentData.personalInfo?.gender || ''}
                                    onChange={(e) => handleInputChange('gender', e.target.value, 'personalInfo')}
                                    disabled={!editing}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="nationality">Nationality</Label>
                                <Input
                                    id="nationality"
                                    value={currentData.personalInfo?.nationality || ''}
                                    onChange={(e) => handleInputChange('nationality', e.target.value, 'personalInfo')}
                                    disabled={!editing}
                                />
                            </div>
                            <div>
                                <Label htmlFor="maritalStatus">Marital Status</Label>
                                <Input
                                    id="maritalStatus"
                                    value={currentData.personalInfo?.maritalStatus || ''}
                                    onChange={(e) => handleInputChange('maritalStatus', e.target.value, 'personalInfo')}
                                    disabled={!editing}
                                />
                            </div>
                        </div>

                        <div>
                            <Label htmlFor="ssn">SSN</Label>
                            <Input
                                id="ssn"
                                value={currentData.personalInfo?.ssn || ''}
                                onChange={(e) => handleInputChange('ssn', e.target.value, 'personalInfo')}
                                disabled={!editing}
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Contact Information */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                            <Mail className="h-5 w-5" />
                            <span>Contact Information</span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <Label htmlFor="personalEmail">Personal Email</Label>
                            <Input
                                id="personalEmail"
                                type="email"
                                value={currentData.contactInfo?.personalEmail || ''}
                                onChange={(e) => handleInputChange('personalEmail', e.target.value, 'contactInfo')}
                                disabled={!editing}
                            />
                        </div>

                        <div>
                            <Label htmlFor="workEmail">Work Email</Label>
                            <Input
                                id="workEmail"
                                type="email"
                                value={currentData.contactInfo?.workEmail || ''}
                                onChange={(e) => handleInputChange('workEmail', e.target.value, 'contactInfo')}
                                disabled={!editing}
                            />
                        </div>

                        <div>
                            <Label htmlFor="personalPhone">Personal Phone</Label>
                            <Input
                                id="personalPhone"
                                type="tel"
                                value={currentData.contactInfo?.personalPhone || ''}
                                onChange={(e) => handleInputChange('personalPhone', e.target.value, 'contactInfo')}
                                disabled={!editing}
                            />
                        </div>

                        <div>
                            <Label htmlFor="street">Street Address</Label>
                            <Input
                                id="street"
                                value={currentData.contactInfo?.address?.street || ''}
                                onChange={(e) => handleInputChange('street', e.target.value, 'contactInfo.address')}
                                disabled={!editing}
                            />
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                            <div>
                                <Label htmlFor="city">City</Label>
                                <Input
                                    id="city"
                                    value={currentData.contactInfo?.address?.city || ''}
                                    onChange={(e) => handleInputChange('city', e.target.value, 'contactInfo.address')}
                                    disabled={!editing}
                                />
                            </div>
                            <div>
                                <Label htmlFor="state">State</Label>
                                <Input
                                    id="state"
                                    value={currentData.contactInfo?.address?.state || ''}
                                    onChange={(e) => handleInputChange('state', e.target.value, 'contactInfo.address')}
                                    disabled={!editing}
                                />
                            </div>
                            <div>
                                <Label htmlFor="zipCode">Zip Code</Label>
                                <Input
                                    id="zipCode"
                                    value={currentData.contactInfo?.address?.zipCode || ''}
                                    onChange={(e) => handleInputChange('zipCode', e.target.value, 'contactInfo.address')}
                                    disabled={!editing}
                                />
                            </div>
                        </div>

                        <div>
                            <Label htmlFor="country">Country</Label>
                            <Input
                                id="country"
                                value={currentData.contactInfo?.address?.country || ''}
                                onChange={(e) => handleInputChange('country', e.target.value, 'contactInfo.address')}
                                disabled={!editing}
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Banking Information */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                            <CreditCard className="h-5 w-5" />
                            <span>Banking Information</span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <Label htmlFor="bankName">Bank Name</Label>
                            <Input
                                id="bankName"
                                value={currentData.bankingInfo?.bankName || ''}
                                onChange={(e) => handleInputChange('bankName', e.target.value, 'bankingInfo')}
                                disabled={!editing}
                            />
                        </div>

                        <div>
                            <Label htmlFor="accountNumber">Account Number</Label>
                            <Input
                                id="accountNumber"
                                value={currentData.bankingInfo?.accountNumber || ''}
                                onChange={(e) => handleInputChange('accountNumber', e.target.value, 'bankingInfo')}
                                disabled={!editing}
                            />
                        </div>

                        <div>
                            <Label htmlFor="accountType">Account Type</Label>
                            <Input
                                id="accountType"
                                value={currentData.bankingInfo?.accountType || ''}
                                onChange={(e) => handleInputChange('accountType', e.target.value, 'bankingInfo')}
                                disabled={!editing}
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Work Information */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                            <Building className="h-5 w-5" />
                            <span>Work Information</span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <Label htmlFor="employeeId">Employee ID</Label>
                            <Input
                                id="employeeId"
                                value={currentData.employeeId || ''}
                                disabled // Employee ID should not be editable
                            />
                        </div>

                        <div>
                            <Label htmlFor="department">Department</Label>
                            <Input
                                id="department"
                                value={currentData.workInfo?.department || ''}
                                onChange={(e) => handleInputChange('department', e.target.value, 'workInfo')}
                                disabled={!editing}
                            />
                        </div>

                        <div>
                            <Label htmlFor="position">Position</Label>
                            <Input
                                id="position"
                                value={currentData.workInfo?.position || ''}
                                onChange={(e) => handleInputChange('position', e.target.value, 'workInfo')}
                                disabled={!editing}
                            />
                        </div>

                        <div>
                            <Label htmlFor="hireDate">Hire Date</Label>
                            <Input
                                id="hireDate"
                                type="date"
                                value={currentData.workInfo?.hireDate ?
                                    new Date(currentData.workInfo.hireDate).toISOString().split('T')[0] : ''}
                                onChange={(e) => handleInputChange('hireDate', new Date(e.target.value), 'workInfo')}
                                disabled={!editing}
                            />
                        </div>

                        <div>
                            <Label htmlFor="employmentType">Employment Type</Label>
                            <Input
                                id="employmentType"
                                value={currentData.workInfo?.employmentType || ''}
                                onChange={(e) => handleInputChange('employmentType', e.target.value, 'workInfo')}
                                disabled={!editing}
                            />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Emergency Contact */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                        <Phone className="h-5 w-5" />
                        <span>Emergency Contact</span>
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="emergencyName">Contact Name</Label>
                            <Input
                                id="emergencyName"
                                value={currentData.contactInfo?.emergencyContacts?.[0]?.name || ''}
                                onChange={(e) => handleInputChange('name', e.target.value, 'contactInfo.emergencyContacts.0')}
                                disabled={!editing}
                            />
                        </div>
                        <div>
                            <Label htmlFor="emergencyPhone">Contact Phone</Label>
                            <Input
                                id="emergencyPhone"
                                type="tel"
                                value={currentData.contactInfo?.emergencyContacts?.[0]?.phone || ''}
                                onChange={(e) => handleInputChange('phone', e.target.value, 'contactInfo.emergencyContacts.0')}
                                disabled={!editing}
                            />
                        </div>
                    </div>

                    <div>
                        <Label htmlFor="emergencyRelationship">Relationship</Label>
                        <Input
                            id="emergencyRelationship"
                            value={currentData.contactInfo?.emergencyContacts?.[0]?.relationship || ''}
                            onChange={(e) => handleInputChange('relationship', e.target.value, 'contactInfo.emergencyContacts.0')}
                            disabled={!editing}
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Profile Statistics (HR View) */}
            {mode === 'hr' && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                            <TrendingUp className="h-5 w-5" />
                            <span>Profile Statistics</span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="text-center">
                                <div className="text-2xl font-bold text-primary">{completeness}%</div>
                                <div className="text-sm text-muted-foreground">Completeness</div>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-bold text-green-600">
                                    {profile.profileStatus?.lastUpdated ?
                                        Math.floor((new Date().getTime() - new Date(profile.profileStatus.lastUpdated).getTime()) / (1000 * 60 * 60 * 24)) : 0}
                                </div>
                                <div className="text-sm text-muted-foreground">Days Since Update</div>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-bold text-blue-600">
                                    {profile.documents?.length || 0}
                                </div>
                                <div className="text-sm text-muted-foreground">Documents</div>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-bold text-purple-600">
                                    {profile.skills?.length || 0}
                                </div>
                                <div className="text-sm text-muted-foreground">Skills</div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
