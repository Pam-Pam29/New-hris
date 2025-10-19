import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Badge } from '../../components/ui/badge';
import { Progress } from '../../components/ui/progress';
import { Separator } from '../../components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { User, Mail, Phone, MapPin, Calendar, Edit, Save, X, Building, Briefcase, CreditCard, Users, Shield, ArrowLeft, Heart, GraduationCap, FileText, Upload, Download, Eye } from 'lucide-react';
import { getComprehensiveDataFlowService, EmployeeProfile } from '../../services/comprehensiveDataFlowService';
import { Link, useLocation } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { useAuth } from '../../context/AuthContext';

// Use the EmployeeProfile interface from the service
type ComprehensiveProfile = EmployeeProfile;

export default function EmployeeProfilePage() {
    const { currentEmployee } = useAuth(); // Get logged-in employee from auth context
    const [profile, setProfile] = useState<ComprehensiveProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(false);
    const [editData, setEditData] = useState<Partial<ComprehensiveProfile>>({});
    const [activeTab, setActiveTab] = useState('personal');

    const currentEmployeeId = currentEmployee?.employeeId || '';

    // Load profile data on component mount and when employee changes
    useEffect(() => {
        const loadProfile = async () => {
            if (!currentEmployeeId) {
                console.log('⏳ [Profile] Waiting for employee authentication...');
                return;
            }

            try {
                setLoading(true);
                const dataFlowService = await getComprehensiveDataFlowService();

                console.log('📋 [Profile] Loading profile for employee:', currentEmployeeId);

                // Load the employee's profile directly
                const employeeProfile = await dataFlowService.getEmployeeProfile(currentEmployeeId);

                if (employeeProfile) {
                    console.log('✅ [Profile] Loaded profile for:', employeeProfile.personalInfo?.firstName, employeeProfile.personalInfo?.lastName);

                    // Set profile directly - the service already returns the correct format
                    setProfile(employeeProfile as any);
                } else {
                    console.warn('⚠️ [Profile] Employee profile not found for:', currentEmployeeId);
                    setProfile(null);
                }

                setLoading(false);
            } catch (error) {
                console.error('Error loading profile:', error);
                console.error('Error details:', {
                    message: error instanceof Error ? error.message : 'Unknown error',
                    stack: error instanceof Error ? error.stack : undefined
                });
                setLoading(false);
            }
        };

        loadProfile();
    }, [currentEmployeeId]); // Reload when employee changes (login/logout)

    const handleEdit = () => {
        setEditData(profile || {});
        setEditing(true);
    };

    const handleSave = async () => {
        if (profile && editData) {
            try {
                const dataFlowService = await getComprehensiveDataFlowService();

                console.log('Saving profile with ID:', profile.id);
                console.log('Profile data:', profile);
                console.log('Edit data:', editData);
                console.log('Date of birth in editData:', editData.personalInfo?.dateOfBirth, typeof editData.personalInfo?.dateOfBirth);
                console.log('Hire date in editData:', editData.workInfo?.hireDate, typeof editData.workInfo?.hireDate);
                console.log('All employees before save:', await dataFlowService.getAllEmployees());

                // Convert profile changes to comprehensive format
                const profileUpdates = {
                    personalInfo: {
                        firstName: editData.personalInfo?.firstName || profile.personalInfo.firstName,
                        lastName: editData.personalInfo?.lastName || profile.personalInfo.lastName,
                        middleName: editData.personalInfo?.middleName || profile.personalInfo.middleName,
                        dateOfBirth: editData.personalInfo?.dateOfBirth ?
                            (editData.personalInfo.dateOfBirth instanceof Date ? editData.personalInfo.dateOfBirth : new Date(editData.personalInfo.dateOfBirth)) :
                            (profile.personalInfo.dateOfBirth ?
                                (profile.personalInfo.dateOfBirth instanceof Date ? profile.personalInfo.dateOfBirth : new Date(profile.personalInfo.dateOfBirth)) :
                                new Date()),
                        gender: editData.personalInfo?.gender || profile.personalInfo.gender,
                        maritalStatus: editData.personalInfo?.maritalStatus || profile.personalInfo.maritalStatus,
                        nationality: editData.personalInfo?.nationality || profile.personalInfo.nationality,
                        identificationNumber: editData.personalInfo?.identificationNumber || profile.personalInfo.identificationNumber
                    },
                    contactInfo: {
                        personalEmail: editData.contactInfo?.personalEmail || profile.contactInfo.personalEmail,
                        workEmail: editData.contactInfo?.workEmail || profile.contactInfo.workEmail,
                        personalPhone: editData.contactInfo?.personalPhone || profile.contactInfo.personalPhone,
                        workPhone: editData.contactInfo?.workPhone || profile.contactInfo.workPhone,
                        address: {
                            street: editData.contactInfo?.address?.street || profile.contactInfo.address.street,
                            city: editData.contactInfo?.address?.city || profile.contactInfo.address.city,
                            state: editData.contactInfo?.address?.state || profile.contactInfo.address.state,
                            zipCode: editData.contactInfo?.address?.zipCode || profile.contactInfo.address.zipCode,
                            country: editData.contactInfo?.address?.country || profile.contactInfo.address.country
                        },
                        emergencyContacts: editData.contactInfo?.emergencyContacts || profile.contactInfo.emergencyContacts
                    },
                    workInfo: {
                        position: editData.workInfo?.position || profile.workInfo.position,
                        department: editData.workInfo?.department || profile.workInfo.department,
                        hireDate: editData.workInfo?.hireDate ?
                            (editData.workInfo.hireDate instanceof Date ? editData.workInfo.hireDate : new Date(editData.workInfo.hireDate)) :
                            (profile.workInfo.hireDate ?
                                (profile.workInfo.hireDate instanceof Date ? profile.workInfo.hireDate : new Date(profile.workInfo.hireDate)) :
                                new Date()),
                        employmentType: editData.workInfo?.employmentType || profile.workInfo.employmentType,
                        workLocation: editData.workInfo?.workLocation || profile.workInfo.workLocation,
                        workSchedule: editData.workInfo?.workSchedule || profile.workInfo.workSchedule,
                        salary: {
                            baseSalary: editData.workInfo?.salary?.baseSalary || profile.workInfo.salary?.baseSalary || 0,
                            currency: editData.workInfo?.salary?.currency || profile.workInfo.salary?.currency || 'USD',
                            payFrequency: editData.workInfo?.salary?.payFrequency || profile.workInfo.salary?.payFrequency || 'Monthly'
                        }
                    },
                    bankingInfo: {
                        bankName: editData.bankingInfo?.bankName || profile.bankingInfo.bankName,
                        accountNumber: editData.bankingInfo?.accountNumber || profile.bankingInfo.accountNumber,
                        routingNumber: editData.bankingInfo?.routingNumber || profile.bankingInfo.routingNumber,
                        accountType: editData.bankingInfo?.accountType || profile.bankingInfo.accountType,
                        salaryPaymentMethod: editData.bankingInfo?.salaryPaymentMethod || profile.bankingInfo.salaryPaymentMethod
                    },
                    skills: (editData.skills || profile.skills || []).map((skill: any) => ({
                        ...skill,
                        certificationDate: skill.certificationDate ?
                            (skill.certificationDate instanceof Date ? skill.certificationDate : new Date(skill.certificationDate)) :
                            undefined,
                        expiryDate: skill.expiryDate ?
                            (skill.expiryDate instanceof Date ? skill.expiryDate : new Date(skill.expiryDate)) :
                            undefined
                    })),
                    familyInfo: {
                        spouse: editData.familyInfo?.spouse || profile.familyInfo.spouse || undefined,
                        dependents: (editData.familyInfo?.dependents || profile.familyInfo.dependents || []).map((dependent: any) => ({
                            ...dependent,
                            dateOfBirth: dependent.dateOfBirth ?
                                (dependent.dateOfBirth instanceof Date ? dependent.dateOfBirth : new Date(dependent.dateOfBirth)) :
                                new Date()
                        })),
                        beneficiaries: editData.familyInfo?.beneficiaries || profile.familyInfo.beneficiaries || []
                    }
                };

                // Update the profile in the data flow service
                console.log('Calling updateEmployeeProfile with:', profile.id, profileUpdates);
                console.log('Converted date of birth:', profileUpdates.personalInfo.dateOfBirth);
                console.log('Converted hire date:', profileUpdates.workInfo.hireDate);
                await dataFlowService.updateEmployeeProfile(profile.id, profileUpdates);
                console.log('updateEmployeeProfile completed successfully');

                // Update local state
                const updatedProfile = { ...profile, ...editData };
                setProfile(updatedProfile);
                setEditing(false);
                setEditData({});

                // Save the employee ID to localStorage for persistence
                localStorage.setItem('currentEmployeeId', profile.id);

                console.log('Profile updated successfully');
                console.log('All employees after save:', await dataFlowService.getAllEmployees());

                // Reload the profile to see if it persisted
                const reloadedProfile = await dataFlowService.getEmployeeProfile(profile.id);
                console.log('Reloaded profile after save:', reloadedProfile);
                if (reloadedProfile) {
                    console.log('Reloaded date of birth:', reloadedProfile.personalInfo?.dateOfBirth, typeof reloadedProfile.personalInfo?.dateOfBirth);
                    console.log('Reloaded hire date:', reloadedProfile.workInfo?.hireDate, typeof reloadedProfile.workInfo?.hireDate);
                }
            } catch (error) {
                console.error('Error saving profile:', error);
            }
        }
    };

    const handleCancel = () => {
        setEditing(false);
        setEditData({});
    };

    const handleInputChange = (field: string, value: any) => {
        console.log('🔄 handleInputChange called:', field, value);
        if (field === 'personalInfo' && value.dateOfBirth) {
            console.log('📅 Date of birth change:', value.dateOfBirth, typeof value.dateOfBirth);
        }
        if (field === 'workInfo' && value.hireDate) {
            console.log('📅 Hire date change:', value.hireDate, typeof value.hireDate);
        }
        setEditData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleBankingInfoChange = (field: string, value: string) => {
        setEditData(prev => ({
            ...prev,
            bankingInfo: {
                ...prev.bankingInfo!,
                [field]: value
            }
        }));
    };

    const handleEmergencyContactChange = (contactIndex: number, field: string, value: string) => {
        const newContacts = [...(editData.contactInfo?.emergencyContacts || profile?.contactInfo.emergencyContacts || [])];
        newContacts[contactIndex] = { ...newContacts[contactIndex], [field]: value };
        setEditData(prev => ({
            ...prev,
            contactInfo: {
                ...prev.contactInfo!,
                emergencyContacts: newContacts
            }
        }));
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 p-6">
                <div className="max-w-4xl mx-auto space-y-6">
                    <div className="text-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                        <h2 className="text-xl font-semibold">Loading Profile...</h2>
                        <p className="text-muted-foreground">Please wait while we load your profile information.</p>
                    </div>
                </div>
            </div>
        );
    }

    if (!profile) {
        console.log('Profile is null, showing loading state');
        return (
            <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 p-6">
                <div className="max-w-4xl mx-auto space-y-6">
                    <div className="text-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                        <h2 className="text-xl font-semibold">Loading Profile...</h2>
                        <p className="text-muted-foreground">Please wait while we load your profile information.</p>
                    </div>
                </div>
            </div>
        );
    }

    const currentData = editing ? { ...profile, ...editData } : profile;

    return (
        <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 p-6">
            <div className="max-w-4xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <div className="flex items-center space-x-4 mb-2">
                            <Link
                                to="/dashboard"
                                className="flex items-center space-x-2 text-muted-foreground hover:text-foreground transition-colors"
                            >
                                <ArrowLeft className="h-4 w-4" />
                                <span className="text-sm">Back to Dashboard</span>
                            </Link>
                        </div>
                        <h1 className="text-3xl font-bold text-foreground">
                            Employee Profile
                        </h1>
                        <p className="text-muted-foreground mt-2">
                            Comprehensive employee information management system.
                        </p>
                        <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-3">
                            <div className="flex items-start space-x-2">
                                <Shield className="h-4 w-4 text-blue-600 mt-0.5" />
                                <div>
                                    <p className="text-sm font-medium text-blue-900">Complete Your Profile Setup</p>
                                    <p className="text-xs text-blue-700 mt-1">
                                        Fill out all profile tabs and upload required documents in the Documents tab to access the full employee portal.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="flex space-x-2">
                        {editing ? (
                            <>
                                <Button onClick={handleSave} className="flex items-center space-x-2">
                                    <Save className="h-4 w-4" />
                                    <span>Save Changes</span>
                                </Button>
                                <Button variant="secondary" onClick={handleCancel} className="flex items-center space-x-2">
                                    <X className="h-4 w-4" />
                                    <span>Cancel</span>
                                </Button>
                            </>
                        ) : (
                            <Button onClick={handleEdit} className="flex items-center space-x-2">
                                <Edit className="h-4 w-4" />
                                <span>Edit Profile</span>
                            </Button>
                        )}
                    </div>
                </div>

                {/* Profile Status */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                            <span>Profile Status</span>
                            <Badge
                                variant={currentData?.profileStatus?.status === 'approved' ? 'default' : 'secondary'}
                                className="capitalize"
                            >
                                {currentData?.profileStatus?.status?.replace('_', ' ') || 'Draft'}
                            </Badge>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="flex items-center space-x-4">
                                <div className="flex-1">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-sm font-medium">Profile Completeness</span>
                                        <span className="text-sm text-muted-foreground">{currentData?.profileStatus?.completeness || 0}%</span>
                                    </div>
                                    <Progress value={currentData?.profileStatus?.completeness || 0} className="h-2" />
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                                <div>
                                    <span className="text-muted-foreground">Last Updated:</span>
                                    <p className="font-medium">{currentData?.profileStatus?.lastUpdated ?
                                        (currentData.profileStatus.lastUpdated instanceof Date && !isNaN(currentData.profileStatus.lastUpdated.getTime()) ?
                                            currentData.profileStatus.lastUpdated.toLocaleDateString() :
                                            (typeof currentData.profileStatus.lastUpdated === 'string' ?
                                                (() => {
                                                    const date = new Date(currentData.profileStatus.lastUpdated);
                                                    return !isNaN(date.getTime()) ? date.toLocaleDateString() : 'Never';
                                                })() : 'Never')) : 'Never'}</p>
                                </div>
                                <div>
                                    <span className="text-muted-foreground">Updated By:</span>
                                    <p className="font-medium">{currentData?.profileStatus?.updatedBy || 'N/A'}</p>
                                </div>
                                <div>
                                    <span className="text-muted-foreground">Employee ID:</span>
                                    <p className="font-medium">{currentData?.employeeId || currentData?.id || 'N/A'}</p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Comprehensive Profile Tabs */}
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid w-full grid-cols-7">
                        <TabsTrigger value="personal" className="flex items-center space-x-2">
                            <User className="h-4 w-4" />
                            <span className="hidden sm:inline">Personal</span>
                        </TabsTrigger>
                        <TabsTrigger value="work" className="flex items-center space-x-2">
                            <Briefcase className="h-4 w-4" />
                            <span className="hidden sm:inline">Work</span>
                        </TabsTrigger>
                        <TabsTrigger value="contact" className="flex items-center space-x-2">
                            <Phone className="h-4 w-4" />
                            <span className="hidden sm:inline">Contact</span>
                        </TabsTrigger>
                        <TabsTrigger value="banking" className="flex items-center space-x-2">
                            <CreditCard className="h-4 w-4" />
                            <span className="hidden sm:inline">Banking</span>
                        </TabsTrigger>
                        <TabsTrigger value="family" className="flex items-center space-x-2">
                            <Heart className="h-4 w-4" />
                            <span className="hidden sm:inline">Family</span>
                        </TabsTrigger>
                        <TabsTrigger value="skills" className="flex items-center space-x-2">
                            <GraduationCap className="h-4 w-4" />
                            <span className="hidden sm:inline">Skills</span>
                        </TabsTrigger>
                        <TabsTrigger value="documents" className="flex items-center space-x-2">
                            <FileText className="h-4 w-4" />
                            <span className="hidden sm:inline">Documents</span>
                        </TabsTrigger>
                    </TabsList>

                    {/* Personal Information Tab */}
                    <TabsContent value="personal" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center space-x-2">
                                    <User className="h-5 w-5" />
                                    <span>Personal Information</span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>First Name</Label>
                                        {editing ? (
                                            <Input
                                                value={editData.personalInfo?.firstName || currentData.personalInfo?.firstName || ''}
                                                onChange={(e) => handleInputChange('personalInfo', { ...editData.personalInfo, firstName: e.target.value })}
                                                placeholder="Enter first name"
                                            />
                                        ) : (
                                            <p className="text-sm py-2">{currentData.personalInfo?.firstName || 'N/A'}</p>
                                        )}
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Last Name</Label>
                                        {editing ? (
                                            <Input
                                                value={editData.personalInfo?.lastName || currentData.personalInfo?.lastName || ''}
                                                onChange={(e) => handleInputChange('personalInfo', { ...editData.personalInfo, lastName: e.target.value })}
                                                placeholder="Enter last name"
                                            />
                                        ) : (
                                            <p className="text-sm py-2">{currentData.personalInfo?.lastName || 'N/A'}</p>
                                        )}
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Middle Name</Label>
                                        {editing ? (
                                            <Input
                                                value={editData.personalInfo?.middleName || currentData.personalInfo?.middleName || ''}
                                                onChange={(e) => handleInputChange('personalInfo', { ...editData.personalInfo, middleName: e.target.value })}
                                                placeholder="Enter middle name"
                                            />
                                        ) : (
                                            <p className="text-sm py-2">{currentData.personalInfo?.middleName || 'N/A'}</p>
                                        )}
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Date of Birth</Label>
                                        {editing ? (
                                            <Input
                                                type="date"
                                                value={editData.personalInfo?.dateOfBirth ?
                                                    (editData.personalInfo.dateOfBirth instanceof Date && !isNaN(editData.personalInfo.dateOfBirth.getTime()) ?
                                                        editData.personalInfo.dateOfBirth.toISOString().split('T')[0] :
                                                        (typeof editData.personalInfo.dateOfBirth === 'string' ? editData.personalInfo.dateOfBirth : '')) :
                                                    (currentData.personalInfo?.dateOfBirth instanceof Date && !isNaN(currentData.personalInfo.dateOfBirth.getTime()) ?
                                                        currentData.personalInfo.dateOfBirth.toISOString().split('T')[0] :
                                                        (typeof currentData.personalInfo?.dateOfBirth === 'string' ? currentData.personalInfo.dateOfBirth : ''))}
                                                onChange={(e) => handleInputChange('personalInfo', { ...editData.personalInfo, dateOfBirth: e.target.value ? new Date(e.target.value) : new Date() })}
                                            />
                                        ) : (
                                            <p className="text-sm py-2">{currentData.personalInfo?.dateOfBirth ?
                                                (currentData.personalInfo.dateOfBirth instanceof Date && !isNaN(currentData.personalInfo.dateOfBirth.getTime()) ?
                                                    currentData.personalInfo.dateOfBirth.toLocaleDateString() :
                                                    (typeof currentData.personalInfo.dateOfBirth === 'string' ? currentData.personalInfo.dateOfBirth : 'N/A')) : 'N/A'}</p>
                                        )}
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Gender</Label>
                                        {editing ? (
                                            <Select
                                                value={editData.personalInfo?.gender || currentData.personalInfo?.gender || ''}
                                                onValueChange={(value) => handleInputChange('personalInfo', { ...editData.personalInfo, gender: value })}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select gender" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="Male">Male</SelectItem>
                                                    <SelectItem value="Female">Female</SelectItem>
                                                    <SelectItem value="Other">Other</SelectItem>
                                                    <SelectItem value="Prefer not to say">Prefer not to say</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        ) : (
                                            <p className="text-sm py-2">{currentData.personalInfo?.gender || 'N/A'}</p>
                                        )}
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Marital Status</Label>
                                        {editing ? (
                                            <Select
                                                value={editData.personalInfo?.maritalStatus || currentData.personalInfo?.maritalStatus || ''}
                                                onValueChange={(value) => handleInputChange('personalInfo', { ...editData.personalInfo, maritalStatus: value })}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select marital status" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="Single">Single</SelectItem>
                                                    <SelectItem value="Married">Married</SelectItem>
                                                    <SelectItem value="Divorced">Divorced</SelectItem>
                                                    <SelectItem value="Widowed">Widowed</SelectItem>
                                                    <SelectItem value="Separated">Separated</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        ) : (
                                            <p className="text-sm py-2">{currentData.personalInfo?.maritalStatus || 'N/A'}</p>
                                        )}
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Nationality</Label>
                                        {editing ? (
                                            <div className="space-y-2">
                                                <Select
                                                    value={editData.personalInfo?.nationality || currentData.personalInfo?.nationality || ''}
                                                    onValueChange={(value) => handleInputChange('personalInfo', { ...editData.personalInfo, nationality: value })}
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select nationality" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="American">American</SelectItem>
                                                        <SelectItem value="Canadian">Canadian</SelectItem>
                                                        <SelectItem value="British">British</SelectItem>
                                                        <SelectItem value="Australian">Australian</SelectItem>
                                                        <SelectItem value="German">German</SelectItem>
                                                        <SelectItem value="French">French</SelectItem>
                                                        <SelectItem value="Spanish">Spanish</SelectItem>
                                                        <SelectItem value="Italian">Italian</SelectItem>
                                                        <SelectItem value="Chinese">Chinese</SelectItem>
                                                        <SelectItem value="Japanese">Japanese</SelectItem>
                                                        <SelectItem value="Indian">Indian</SelectItem>
                                                        <SelectItem value="Brazilian">Brazilian</SelectItem>
                                                        <SelectItem value="Mexican">Mexican</SelectItem>
                                                        <SelectItem value="Nigerian">Nigerian</SelectItem>
                                                        <SelectItem value="Other">Other</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                {(editData.personalInfo?.nationality === 'Other' || currentData.personalInfo?.nationality === 'Other') && (
                                                    <Input
                                                        value={editData.personalInfo?.otherNationality || currentData.personalInfo?.otherNationality || ''}
                                                        onChange={(e) => handleInputChange('personalInfo', { ...editData.personalInfo, otherNationality: e.target.value })}
                                                        placeholder="Please specify nationality"
                                                    />
                                                )}
                                            </div>
                                        ) : (
                                            <p className="text-sm py-2">
                                                {currentData.personalInfo?.nationality === 'Other' && currentData.personalInfo?.otherNationality
                                                    ? currentData.personalInfo.otherNationality
                                                    : currentData.personalInfo?.nationality || 'N/A'}
                                            </p>
                                        )}
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Identification Number</Label>
                                        {editing ? (
                                            <Input
                                                value={editData.personalInfo?.identificationNumber || currentData.personalInfo?.identificationNumber || ''}
                                                onChange={(e) => handleInputChange('personalInfo', { ...editData.personalInfo, identificationNumber: e.target.value })}
                                                placeholder="Enter ID number (SSN/Passport)"
                                            />
                                        ) : (
                                            <p className="text-sm py-2 font-mono">{currentData.personalInfo?.identificationNumber || 'N/A'}</p>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Work Information Tab */}
                    <TabsContent value="work" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center space-x-2">
                                    <Briefcase className="h-5 w-5" />
                                    <span>Work Information</span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Position</Label>
                                        {editing ? (
                                            <Input
                                                value={editData.workInfo?.position || currentData.workInfo?.position || ''}
                                                onChange={(e) => handleInputChange('workInfo', { ...editData.workInfo, position: e.target.value })}
                                                placeholder="Enter position"
                                            />
                                        ) : (
                                            <p className="text-sm py-2">{currentData.workInfo?.position || 'N/A'}</p>
                                        )}
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label>Department</Label>
                                    {editing ? (
                                        <Select
                                            value={editData.workInfo?.department || currentData.workInfo?.department || ''}
                                            onValueChange={(value) => handleInputChange('workInfo', { ...editData.workInfo, department: value })}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select department" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Human Resources">Human Resources</SelectItem>
                                                <SelectItem value="Information Technology">Information Technology</SelectItem>
                                                <SelectItem value="Finance">Finance</SelectItem>
                                                <SelectItem value="Marketing">Marketing</SelectItem>
                                                <SelectItem value="Sales">Sales</SelectItem>
                                                <SelectItem value="Operations">Operations</SelectItem>
                                                <SelectItem value="Customer Service">Customer Service</SelectItem>
                                                <SelectItem value="Legal">Legal</SelectItem>
                                                <SelectItem value="Engineering">Engineering</SelectItem>
                                                <SelectItem value="Product Management">Product Management</SelectItem>
                                                <SelectItem value="Quality Assurance">Quality Assurance</SelectItem>
                                                <SelectItem value="Research & Development">Research & Development</SelectItem>
                                                <SelectItem value="Administration">Administration</SelectItem>
                                                <SelectItem value="Security">Security</SelectItem>
                                                <SelectItem value="Facilities">Facilities</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    ) : (
                                        <p className="text-sm py-2">{currentData.workInfo?.department || 'N/A'}</p>
                                    )}
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Hire Date</Label>
                                        {editing ? (
                                            <Input
                                                type="date"
                                                value={editData.workInfo?.hireDate ?
                                                    (editData.workInfo.hireDate instanceof Date && !isNaN(editData.workInfo.hireDate.getTime()) ?
                                                        editData.workInfo.hireDate.toISOString().split('T')[0] :
                                                        (typeof editData.workInfo.hireDate === 'string' ? editData.workInfo.hireDate : '')) :
                                                    (currentData.workInfo?.hireDate instanceof Date && !isNaN(currentData.workInfo.hireDate.getTime()) ?
                                                        currentData.workInfo.hireDate.toISOString().split('T')[0] :
                                                        (typeof currentData.workInfo?.hireDate === 'string' ? currentData.workInfo.hireDate : ''))}
                                                onChange={(e) => handleInputChange('workInfo', { ...editData.workInfo, hireDate: e.target.value ? new Date(e.target.value) : new Date() })}
                                            />
                                        ) : (
                                            <p className="text-sm py-2">{currentData.workInfo?.hireDate ?
                                                (currentData.workInfo.hireDate instanceof Date && !isNaN(currentData.workInfo.hireDate.getTime()) ?
                                                    currentData.workInfo.hireDate.toLocaleDateString() :
                                                    (typeof currentData.workInfo.hireDate === 'string' ? currentData.workInfo.hireDate : 'N/A')) : 'N/A'}</p>
                                        )}
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Employment Type</Label>
                                        {editing ? (
                                            <Select
                                                value={editData.workInfo?.employmentType || currentData.workInfo?.employmentType || ''}
                                                onValueChange={(value) => handleInputChange('workInfo', { ...editData.workInfo, employmentType: value })}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select employment type" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="Full-time">Full-time</SelectItem>
                                                    <SelectItem value="Part-time">Part-time</SelectItem>
                                                    <SelectItem value="Contract">Contract</SelectItem>
                                                    <SelectItem value="Intern">Intern</SelectItem>
                                                    <SelectItem value="Temporary">Temporary</SelectItem>
                                                    <SelectItem value="Freelance">Freelance</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        ) : (
                                            <p className="text-sm py-2">{currentData.workInfo?.employmentType || 'N/A'}</p>
                                        )}
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Work Location</Label>
                                        {editing ? (
                                            <Select
                                                value={editData.workInfo?.workLocation || currentData.workInfo?.workLocation || ''}
                                                onValueChange={(value) => handleInputChange('workInfo', { ...editData.workInfo, workLocation: value })}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select work location" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="Office">Office</SelectItem>
                                                    <SelectItem value="Remote">Remote</SelectItem>
                                                    <SelectItem value="Hybrid">Hybrid</SelectItem>
                                                    <SelectItem value="Field">Field</SelectItem>
                                                    <SelectItem value="Client Site">Client Site</SelectItem>
                                                    <SelectItem value="Home Office">Home Office</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        ) : (
                                            <p className="text-sm py-2">{currentData.workInfo?.workLocation || 'N/A'}</p>
                                        )}
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Work Schedule</Label>
                                        {editing ? (
                                            <Select
                                                value={editData.workInfo?.workSchedule || currentData.workInfo?.workSchedule || ''}
                                                onValueChange={(value) => handleInputChange('workInfo', { ...editData.workInfo, workSchedule: value })}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select work schedule" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="Full-time (40 hours/week)">Full-time (40 hours/week)</SelectItem>
                                                    <SelectItem value="Part-time (20 hours/week)">Part-time (20 hours/week)</SelectItem>
                                                    <SelectItem value="Part-time (30 hours/week)">Part-time (30 hours/week)</SelectItem>
                                                    <SelectItem value="Flexible Hours">Flexible Hours</SelectItem>
                                                    <SelectItem value="Shift Work">Shift Work</SelectItem>
                                                    <SelectItem value="Compressed Work Week">Compressed Work Week</SelectItem>
                                                    <SelectItem value="9/80 Schedule">9/80 Schedule</SelectItem>
                                                    <SelectItem value="4/10 Schedule">4/10 Schedule</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        ) : (
                                            <p className="text-sm py-2">{currentData.workInfo?.workSchedule || 'N/A'}</p>
                                        )}
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <h4 className="font-medium">Salary Information</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div>
                                            <Label>Base Salary</Label>
                                            {editing ? (
                                                <Input
                                                    type="number"
                                                    value={editData.workInfo?.salary?.baseSalary || currentData.workInfo?.salary?.baseSalary || ''}
                                                    onChange={(e) => handleInputChange('workInfo', {
                                                        ...editData.workInfo,
                                                        salary: { ...editData.workInfo?.salary, baseSalary: parseFloat(e.target.value) || 0 }
                                                    })}
                                                    placeholder="Enter base salary"
                                                />
                                            ) : (
                                                <p className="text-sm py-2">{currentData.workInfo?.salary?.baseSalary ? `₦${currentData.workInfo.salary.baseSalary.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : 'N/A'}</p>
                                            )}
                                        </div>
                                        <div>
                                            <Label>Currency</Label>
                                            {editing ? (
                                                <Select
                                                    value={editData.workInfo?.salary?.currency || currentData.workInfo?.salary?.currency || 'NGN'}
                                                    onValueChange={(value) => handleInputChange('workInfo', {
                                                        ...editData.workInfo,
                                                        salary: { ...editData.workInfo?.salary, currency: value }
                                                    })}
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select currency" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="NGN">NGN - Nigerian Naira</SelectItem>
                                                        <SelectItem value="USD">USD - US Dollar</SelectItem>
                                                        <SelectItem value="EUR">EUR - Euro</SelectItem>
                                                        <SelectItem value="GBP">GBP - British Pound</SelectItem>
                                                        <SelectItem value="CAD">CAD - Canadian Dollar</SelectItem>
                                                        <SelectItem value="AUD">AUD - Australian Dollar</SelectItem>
                                                        <SelectItem value="JPY">JPY - Japanese Yen</SelectItem>
                                                        <SelectItem value="CHF">CHF - Swiss Franc</SelectItem>
                                                        <SelectItem value="CNY">CNY - Chinese Yuan</SelectItem>
                                                        <SelectItem value="INR">INR - Indian Rupee</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            ) : (
                                                <p className="text-sm py-2">{currentData.workInfo?.salary?.currency || 'NGN'}</p>
                                            )}
                                        </div>
                                        <div>
                                            <Label>Pay Frequency</Label>
                                            {editing ? (
                                                <Select
                                                    value={editData.workInfo?.salary?.payFrequency || currentData.workInfo?.salary?.payFrequency || 'Monthly'}
                                                    onValueChange={(value) => handleInputChange('workInfo', {
                                                        ...editData.workInfo,
                                                        salary: { ...editData.workInfo?.salary, payFrequency: value }
                                                    })}
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select pay frequency" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="Daily">Daily</SelectItem>
                                                        <SelectItem value="Weekly">Weekly</SelectItem>
                                                        <SelectItem value="Bi-weekly">Bi-weekly</SelectItem>
                                                        <SelectItem value="Monthly">Monthly</SelectItem>
                                                        <SelectItem value="Quarterly">Quarterly</SelectItem>
                                                        <SelectItem value="Semi-annually">Semi-annually</SelectItem>
                                                        <SelectItem value="Annually">Annually</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            ) : (
                                                <p className="text-sm py-2">{currentData.workInfo?.salary?.payFrequency || 'Monthly'}</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Contact Information Tab */}
                    <TabsContent value="contact" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center space-x-2">
                                    <Phone className="h-5 w-5" />
                                    <span>Contact Information</span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {/* Contact Details */}
                                <div className="space-y-4">
                                    <h4 className="font-medium">Contact Details</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label>Personal Email</Label>
                                            {editing ? (
                                                <Input
                                                    value={editData.contactInfo?.personalEmail || currentData.contactInfo?.personalEmail || ''}
                                                    onChange={(e) => handleInputChange('contactInfo', { ...editData.contactInfo, personalEmail: e.target.value })}
                                                    placeholder="Enter personal email"
                                                />
                                            ) : (
                                                <div className="flex items-center space-x-2 text-sm py-2">
                                                    <Mail className="h-4 w-4 text-muted-foreground" />
                                                    <span>{currentData.contactInfo?.personalEmail || 'N/A'}</span>
                                                </div>
                                            )}
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Work Email</Label>
                                            {editing ? (
                                                <Input
                                                    value={editData.contactInfo?.workEmail || currentData.contactInfo?.workEmail || ''}
                                                    onChange={(e) => handleInputChange('contactInfo', { ...editData.contactInfo, workEmail: e.target.value })}
                                                    placeholder="Enter work email"
                                                />
                                            ) : (
                                                <div className="flex items-center space-x-2 text-sm py-2">
                                                    <Mail className="h-4 w-4 text-muted-foreground" />
                                                    <span>{currentData.contactInfo?.workEmail || 'N/A'}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label>Personal Phone</Label>
                                            {editing ? (
                                                <Input
                                                    value={editData.contactInfo?.personalPhone || currentData.contactInfo?.personalPhone || ''}
                                                    onChange={(e) => handleInputChange('contactInfo', { ...editData.contactInfo, personalPhone: e.target.value })}
                                                    placeholder="Enter personal phone"
                                                />
                                            ) : (
                                                <div className="flex items-center space-x-2 text-sm py-2">
                                                    <Phone className="h-4 w-4 text-muted-foreground" />
                                                    <span>{currentData.contactInfo?.personalPhone || 'N/A'}</span>
                                                </div>
                                            )}
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Work Phone</Label>
                                            {editing ? (
                                                <Input
                                                    value={editData.contactInfo?.workPhone || currentData.contactInfo?.workPhone || ''}
                                                    onChange={(e) => handleInputChange('contactInfo', { ...editData.contactInfo, workPhone: e.target.value })}
                                                    placeholder="Enter work phone"
                                                />
                                            ) : (
                                                <div className="flex items-center space-x-2 text-sm py-2">
                                                    <Phone className="h-4 w-4 text-muted-foreground" />
                                                    <span>{currentData.contactInfo?.workPhone || 'N/A'}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Address */}
                                <div className="space-y-4">
                                    <h4 className="font-medium">Address</h4>
                                    <div className="space-y-2">
                                        <Label>Street Address</Label>
                                        {editing ? (
                                            <Input
                                                value={editData.contactInfo?.address?.street || currentData.contactInfo?.address?.street || ''}
                                                onChange={(e) => handleInputChange('contactInfo', {
                                                    ...editData.contactInfo,
                                                    address: { ...editData.contactInfo?.address, street: e.target.value }
                                                })}
                                                placeholder="Enter street address"
                                            />
                                        ) : (
                                            <div className="flex items-center space-x-2 text-sm py-2">
                                                <MapPin className="h-4 w-4 text-muted-foreground" />
                                                <span>{currentData.contactInfo?.address?.street || 'N/A'}</span>
                                            </div>
                                        )}
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div>
                                            <Label>City</Label>
                                            {editing ? (
                                                <Input
                                                    value={editData.contactInfo?.address?.city || currentData.contactInfo?.address?.city || ''}
                                                    onChange={(e) => handleInputChange('contactInfo', {
                                                        ...editData.contactInfo,
                                                        address: { ...editData.contactInfo?.address, city: e.target.value }
                                                    })}
                                                    placeholder="Enter city"
                                                />
                                            ) : (
                                                <p className="text-sm py-2">{currentData.contactInfo?.address?.city || 'N/A'}</p>
                                            )}
                                        </div>
                                        <div>
                                            <Label>State</Label>
                                            {editing ? (
                                                <Input
                                                    value={editData.contactInfo?.address?.state || currentData.contactInfo?.address?.state || ''}
                                                    onChange={(e) => handleInputChange('contactInfo', {
                                                        ...editData.contactInfo,
                                                        address: { ...editData.contactInfo?.address, state: e.target.value }
                                                    })}
                                                    placeholder="Enter state"
                                                />
                                            ) : (
                                                <p className="text-sm py-2">{currentData.contactInfo?.address?.state || 'N/A'}</p>
                                            )}
                                        </div>
                                        <div>
                                            <Label>ZIP Code</Label>
                                            {editing ? (
                                                <Input
                                                    value={editData.contactInfo?.address?.zipCode || currentData.contactInfo?.address?.zipCode || ''}
                                                    onChange={(e) => handleInputChange('contactInfo', {
                                                        ...editData.contactInfo,
                                                        address: { ...editData.contactInfo?.address, zipCode: e.target.value }
                                                    })}
                                                    placeholder="Enter ZIP code"
                                                />
                                            ) : (
                                                <p className="text-sm py-2">{currentData.contactInfo?.address?.zipCode || 'N/A'}</p>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Emergency Contacts */}
                                <div className="space-y-4">
                                    <h4 className="font-medium">Emergency Contacts</h4>
                                    {currentData.contactInfo?.emergencyContacts?.map((contact, index) => (
                                        <div key={index} className="border rounded-lg p-4 space-y-3">
                                            <div className="flex items-center justify-between">
                                                <h5 className="font-medium flex items-center space-x-2">
                                                    <Shield className="h-4 w-4" />
                                                    <span>{contact.name}</span>
                                                    {contact.isPrimary && (
                                                        <Badge variant="default" className="text-xs">Primary</Badge>
                                                    )}
                                                </h5>
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                    <Label>Relationship</Label>
                                                    <p className="text-sm py-2">{contact.relationship}</p>
                                                </div>
                                                <div>
                                                    <Label>Phone</Label>
                                                    <div className="flex items-center space-x-2 text-sm py-2">
                                                        <Phone className="h-4 w-4 text-muted-foreground" />
                                                        <span>{contact.phone}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Email</Label>
                                                <div className="flex items-center space-x-2 text-sm py-2">
                                                    <Mail className="h-4 w-4 text-muted-foreground" />
                                                    <span>{contact.email}</span>
                                                </div>
                                            </div>
                                            {contact.address && (
                                                <div className="space-y-2">
                                                    <Label>Address</Label>
                                                    <div className="flex items-center space-x-2 text-sm py-2">
                                                        <MapPin className="h-4 w-4 text-muted-foreground" />
                                                        <span>{contact.address}</span>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                    {(!currentData.contactInfo?.emergencyContacts || currentData.contactInfo.emergencyContacts.length === 0) && (
                                        <p className="text-sm text-muted-foreground">No emergency contacts added yet.</p>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Banking Information Tab */}
                    <TabsContent value="banking" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center space-x-2">
                                    <CreditCard className="h-5 w-5" />
                                    <span>Banking & Financial Information</span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {/* Banking Details */}
                                <div className="space-y-4">
                                    <h4 className="font-medium">Banking Details</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label>Bank Name</Label>
                                            {editing ? (
                                                <Input
                                                    value={editData.bankingInfo?.bankName || currentData.bankingInfo?.bankName || ''}
                                                    onChange={(e) => handleInputChange('bankingInfo', { ...editData.bankingInfo, bankName: e.target.value })}
                                                    placeholder="Enter bank name"
                                                />
                                            ) : (
                                                <p className="text-sm py-2">{currentData.bankingInfo?.bankName || 'N/A'}</p>
                                            )}
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label>Account Number</Label>
                                            {editing ? (
                                                <Input
                                                    value={editData.bankingInfo?.accountNumber || currentData.bankingInfo?.accountNumber || ''}
                                                    onChange={(e) => handleInputChange('bankingInfo', { ...editData.bankingInfo, accountNumber: e.target.value })}
                                                    placeholder="Enter account number"
                                                />
                                            ) : (
                                                <p className="text-sm py-2 font-mono">{currentData.bankingInfo?.accountNumber || 'N/A'}</p>
                                            )}
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Routing Number</Label>
                                            {editing ? (
                                                <Input
                                                    value={editData.bankingInfo?.routingNumber || currentData.bankingInfo?.routingNumber || ''}
                                                    onChange={(e) => handleInputChange('bankingInfo', { ...editData.bankingInfo, routingNumber: e.target.value })}
                                                    placeholder="Enter routing number"
                                                />
                                            ) : (
                                                <p className="text-sm py-2 font-mono">{currentData.bankingInfo?.routingNumber || 'N/A'}</p>
                                            )}
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Salary Payment Method</Label>
                                        {editing ? (
                                            <Select
                                                value={editData.bankingInfo?.salaryPaymentMethod || currentData.bankingInfo?.salaryPaymentMethod || ''}
                                                onValueChange={(value) => handleInputChange('bankingInfo', { ...editData.bankingInfo, salaryPaymentMethod: value })}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select payment method" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="Direct Deposit">Direct Deposit</SelectItem>
                                                    <SelectItem value="Check">Check</SelectItem>
                                                    <SelectItem value="Wire Transfer">Wire Transfer</SelectItem>
                                                    <SelectItem value="Cash">Cash</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        ) : (
                                            <p className="text-sm py-2">{currentData.bankingInfo?.salaryPaymentMethod || 'N/A'}</p>
                                        )}
                                    </div>
                                </div>

                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Family Information Tab */}
                    <TabsContent value="family" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center space-x-2">
                                    <Heart className="h-5 w-5" />
                                    <span>Family Information & Beneficiaries</span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {/* Spouse Information */}
                                <div className="space-y-4">
                                    <h4 className="font-medium">Spouse Information</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <Label>Name</Label>
                                            {editing ? (
                                                <Input
                                                    value={editData.familyInfo?.spouse?.name || currentData.familyInfo?.spouse?.name || ''}
                                                    onChange={(e) => handleInputChange('familyInfo', {
                                                        ...editData.familyInfo,
                                                        spouse: { ...editData.familyInfo?.spouse, name: e.target.value }
                                                    })}
                                                    placeholder="Enter spouse name"
                                                />
                                            ) : (
                                                <p className="text-sm py-2">{currentData.familyInfo?.spouse?.name || 'N/A'}</p>
                                            )}
                                        </div>
                                        <div>
                                            <Label>Occupation</Label>
                                            {editing ? (
                                                <Input
                                                    value={editData.familyInfo?.spouse?.occupation || currentData.familyInfo?.spouse?.occupation || ''}
                                                    onChange={(e) => handleInputChange('familyInfo', {
                                                        ...editData.familyInfo,
                                                        spouse: { ...editData.familyInfo?.spouse, occupation: e.target.value }
                                                    })}
                                                    placeholder="Enter occupation"
                                                />
                                            ) : (
                                                <p className="text-sm py-2">{currentData.familyInfo?.spouse?.occupation || 'N/A'}</p>
                                            )}
                                        </div>
                                        <div>
                                            <Label>Phone</Label>
                                            {editing ? (
                                                <Input
                                                    value={editData.familyInfo?.spouse?.phone || currentData.familyInfo?.spouse?.phone || ''}
                                                    onChange={(e) => handleInputChange('familyInfo', {
                                                        ...editData.familyInfo,
                                                        spouse: { ...editData.familyInfo?.spouse, phone: e.target.value }
                                                    })}
                                                    placeholder="Enter phone number"
                                                />
                                            ) : (
                                                <p className="text-sm py-2">{currentData.familyInfo?.spouse?.phone || 'N/A'}</p>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Dependents */}
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <h4 className="font-medium">Dependents</h4>
                                        {editing && (
                                            <Button
                                                type="button"
                                                variant="secondary"
                                                size="sm"
                                                onClick={() => {
                                                    const newDependents = [...(currentData.familyInfo?.dependents || []), {
                                                        name: '',
                                                        relationship: '',
                                                        dateOfBirth: new Date()
                                                    }];
                                                    handleInputChange('familyInfo', {
                                                        ...editData.familyInfo,
                                                        dependents: newDependents
                                                    });
                                                }}
                                            >
                                                Add Dependent
                                            </Button>
                                        )}
                                    </div>
                                    {currentData.familyInfo?.dependents?.map((dependent, index) => (
                                        <div key={index} className="border rounded-lg p-4 space-y-3">
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                <div>
                                                    <Label>Name</Label>
                                                    {editing ? (
                                                        <Input
                                                            value={editData.familyInfo?.dependents?.[index]?.name || dependent.name || ''}
                                                            onChange={(e) => {
                                                                const newDependents = [...(editData.familyInfo?.dependents || currentData.familyInfo?.dependents || [])];
                                                                newDependents[index] = { ...newDependents[index], name: e.target.value };
                                                                handleInputChange('familyInfo', {
                                                                    ...editData.familyInfo,
                                                                    dependents: newDependents
                                                                });
                                                            }}
                                                            placeholder="Enter name"
                                                        />
                                                    ) : (
                                                        <p className="text-sm py-2">{dependent.name}</p>
                                                    )}
                                                </div>
                                                <div>
                                                    <Label>Relationship</Label>
                                                    {editing ? (
                                                        <Input
                                                            value={editData.familyInfo?.dependents?.[index]?.relationship || dependent.relationship || ''}
                                                            onChange={(e) => {
                                                                const newDependents = [...(editData.familyInfo?.dependents || currentData.familyInfo?.dependents || [])];
                                                                newDependents[index] = { ...newDependents[index], relationship: e.target.value };
                                                                handleInputChange('familyInfo', {
                                                                    ...editData.familyInfo,
                                                                    dependents: newDependents
                                                                });
                                                            }}
                                                            placeholder="Enter relationship"
                                                        />
                                                    ) : (
                                                        <p className="text-sm py-2">{dependent.relationship}</p>
                                                    )}
                                                </div>
                                                <div>
                                                    <Label>Date of Birth</Label>
                                                    {editing ? (
                                                        <Input
                                                            type="date"
                                                            value={editData.familyInfo?.dependents?.[index]?.dateOfBirth ?
                                                                (editData.familyInfo.dependents[index].dateOfBirth instanceof Date && !isNaN(editData.familyInfo.dependents[index].dateOfBirth.getTime()) ?
                                                                    editData.familyInfo.dependents[index].dateOfBirth.toISOString().split('T')[0] :
                                                                    (typeof editData.familyInfo.dependents[index].dateOfBirth === 'string' ? editData.familyInfo.dependents[index].dateOfBirth : '')) :
                                                                (dependent.dateOfBirth instanceof Date && !isNaN(dependent.dateOfBirth.getTime()) ?
                                                                    dependent.dateOfBirth.toISOString().split('T')[0] :
                                                                    (typeof dependent.dateOfBirth === 'string' ? dependent.dateOfBirth : ''))}
                                                            onChange={(e) => {
                                                                const newDependents = [...(editData.familyInfo?.dependents || currentData.familyInfo?.dependents || [])];
                                                                newDependents[index] = { ...newDependents[index], dateOfBirth: e.target.value ? new Date(e.target.value) : new Date() };
                                                                handleInputChange('familyInfo', {
                                                                    ...editData.familyInfo,
                                                                    dependents: newDependents
                                                                });
                                                            }}
                                                        />
                                                    ) : (
                                                        <p className="text-sm py-2">{dependent.dateOfBirth ?
                                                            (dependent.dateOfBirth instanceof Date && !isNaN(dependent.dateOfBirth.getTime()) ?
                                                                dependent.dateOfBirth.toLocaleDateString() :
                                                                (typeof dependent.dateOfBirth === 'string' ? dependent.dateOfBirth : 'N/A')) : 'N/A'}</p>
                                                    )}
                                                </div>
                                            </div>
                                            {editing && (
                                                <div className="flex justify-end">
                                                    <Button
                                                        type="button"
                                                        variant="destructive"
                                                        size="sm"
                                                        onClick={() => {
                                                            const newDependents = (editData.familyInfo?.dependents || currentData.familyInfo?.dependents || []).filter((_, i) => i !== index);
                                                            handleInputChange('familyInfo', {
                                                                ...editData.familyInfo,
                                                                dependents: newDependents
                                                            });
                                                        }}
                                                    >
                                                        Remove
                                                    </Button>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                    {(!currentData.familyInfo?.dependents || currentData.familyInfo.dependents.length === 0) && (
                                        <p className="text-sm text-muted-foreground">No dependents added yet.</p>
                                    )}
                                </div>

                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Skills Tab */}
                    <TabsContent value="skills" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center space-x-2">
                                    <GraduationCap className="h-5 w-5" />
                                    <span>Skills & Certifications</span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <h4 className="font-medium">Skills & Certifications</h4>
                                        {editing && (
                                            <Button
                                                type="button"
                                                variant="secondary"
                                                size="sm"
                                                onClick={() => {
                                                    const newSkills = [...(currentData.skills || []), {
                                                        name: '',
                                                        level: 'Beginner',
                                                        certified: false,
                                                        certificationDate: undefined,
                                                        expiryDate: undefined
                                                    }];
                                                    handleInputChange('skills', newSkills);
                                                }}
                                            >
                                                Add Skill
                                            </Button>
                                        )}
                                    </div>
                                    {currentData.skills?.map((skill, index) => (
                                        <div key={index} className="border rounded-lg p-4 space-y-3">
                                            <div className="flex items-center justify-between">
                                                <div className="flex-1">
                                                    {editing ? (
                                                        <Input
                                                            value={editData.skills?.[index]?.name || skill.name || ''}
                                                            onChange={(e) => {
                                                                const newSkills = [...(editData.skills || currentData.skills || [])];
                                                                newSkills[index] = { ...newSkills[index], name: e.target.value };
                                                                handleInputChange('skills', newSkills);
                                                            }}
                                                            placeholder="Enter skill name"
                                                            className="font-medium"
                                                        />
                                                    ) : (
                                                        <h4 className="font-medium">{skill.name}</h4>
                                                    )}
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    {editing ? (
                                                        <Select
                                                            value={editData.skills?.[index]?.level || skill.level || 'Beginner'}
                                                            onValueChange={(value) => {
                                                                const newSkills = [...(editData.skills || currentData.skills || [])];
                                                                newSkills[index] = { ...newSkills[index], level: value };
                                                                handleInputChange('skills', newSkills);
                                                            }}
                                                        >
                                                            <SelectTrigger className="w-32">
                                                                <SelectValue />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                <SelectItem value="Beginner">Beginner</SelectItem>
                                                                <SelectItem value="Intermediate">Intermediate</SelectItem>
                                                                <SelectItem value="Advanced">Advanced</SelectItem>
                                                                <SelectItem value="Expert">Expert</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                    ) : (
                                                        <Badge variant={skill.level === 'Expert' ? 'default' : skill.level === 'Advanced' ? 'secondary' : 'secondary'}>
                                                            {skill.level}
                                                        </Badge>
                                                    )}
                                                    {editing ? (
                                                        <div className="flex items-center space-x-2">
                                                            <input
                                                                type="checkbox"
                                                                checked={editData.skills?.[index]?.certified || skill.certified || false}
                                                                onChange={(e) => {
                                                                    const newSkills = [...(editData.skills || currentData.skills || [])];
                                                                    newSkills[index] = { ...newSkills[index], certified: e.target.checked };
                                                                    handleInputChange('skills', newSkills);
                                                                }}
                                                                className="rounded"
                                                            />
                                                            <Label className="text-sm">Certified</Label>
                                                        </div>
                                                    ) : (
                                                        skill.certified && (
                                                            <Badge variant="default" className="bg-green-600">
                                                                Certified
                                                            </Badge>
                                                        )
                                                    )}
                                                </div>
                                            </div>
                                            {(editing ? (editData.skills?.[index]?.certified || skill.certified) : skill.certified) && (
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                                    <div>
                                                        <Label>Certification Date</Label>
                                                        {editing ? (
                                                            <Input
                                                                type="date"
                                                                value={editData.skills?.[index]?.certificationDate ?
                                                                    (editData.skills[index].certificationDate instanceof Date && !isNaN(editData.skills[index].certificationDate.getTime()) ?
                                                                        editData.skills[index].certificationDate.toISOString().split('T')[0] :
                                                                        (typeof editData.skills[index].certificationDate === 'string' ? editData.skills[index].certificationDate : '')) :
                                                                    (skill.certificationDate instanceof Date && !isNaN(skill.certificationDate.getTime()) ?
                                                                        skill.certificationDate.toISOString().split('T')[0] :
                                                                        (typeof skill.certificationDate === 'string' ? skill.certificationDate : ''))}
                                                                onChange={(e) => {
                                                                    const newSkills = [...(editData.skills || currentData.skills || [])];
                                                                    newSkills[index] = { ...newSkills[index], certificationDate: e.target.value ? new Date(e.target.value) : undefined };
                                                                    handleInputChange('skills', newSkills);
                                                                }}
                                                            />
                                                        ) : (
                                                            <p className="text-sm py-2">{skill.certificationDate ?
                                                                (skill.certificationDate instanceof Date && !isNaN(skill.certificationDate.getTime()) ?
                                                                    skill.certificationDate.toLocaleDateString() :
                                                                    (typeof skill.certificationDate === 'string' ? skill.certificationDate : 'N/A')) : 'N/A'}</p>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <Label>Expiry Date</Label>
                                                        {editing ? (
                                                            <Input
                                                                type="date"
                                                                value={editData.skills?.[index]?.expiryDate ?
                                                                    (editData.skills[index].expiryDate instanceof Date && !isNaN(editData.skills[index].expiryDate.getTime()) ?
                                                                        editData.skills[index].expiryDate.toISOString().split('T')[0] :
                                                                        (typeof editData.skills[index].expiryDate === 'string' ? editData.skills[index].expiryDate : '')) :
                                                                    (skill.expiryDate instanceof Date && !isNaN(skill.expiryDate.getTime()) ?
                                                                        skill.expiryDate.toISOString().split('T')[0] :
                                                                        (typeof skill.expiryDate === 'string' ? skill.expiryDate : ''))}
                                                                onChange={(e) => {
                                                                    const newSkills = [...(editData.skills || currentData.skills || [])];
                                                                    newSkills[index] = { ...newSkills[index], expiryDate: e.target.value ? new Date(e.target.value) : undefined };
                                                                    handleInputChange('skills', newSkills);
                                                                }}
                                                            />
                                                        ) : (
                                                            <p className="text-sm py-2">{skill.expiryDate ?
                                                                (skill.expiryDate instanceof Date && !isNaN(skill.expiryDate.getTime()) ?
                                                                    skill.expiryDate.toLocaleDateString() :
                                                                    (typeof skill.expiryDate === 'string' ? skill.expiryDate : 'N/A')) : 'N/A'}</p>
                                                        )}
                                                    </div>
                                                </div>
                                            )}
                                            {editing && (
                                                <div className="flex justify-end">
                                                    <Button
                                                        type="button"
                                                        variant="destructive"
                                                        size="sm"
                                                        onClick={() => {
                                                            const newSkills = (editData.skills || currentData.skills || []).filter((_, i) => i !== index);
                                                            handleInputChange('skills', newSkills);
                                                        }}
                                                    >
                                                        Remove
                                                    </Button>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                    {(!currentData.skills || currentData.skills.length === 0) && (
                                        <p className="text-sm text-muted-foreground">No skills added yet.</p>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Documents Tab */}
                    <TabsContent value="documents" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center space-x-2">
                                    <FileText className="h-5 w-5" />
                                    <span>Required Documents</span>
                                </CardTitle>
                                <div className="mt-4">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-sm font-medium">Document Upload Progress</span>
                                        <span className="text-sm text-muted-foreground">0/8 Required</span>
                                    </div>
                                    <Progress value={0} className="h-2" />
                                    <p className="text-xs text-muted-foreground mt-1">
                                        Upload all required documents to access the employee portal
                                    </p>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-6">
                                    {/* Authentication Flow Notice */}
                                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                        <div className="flex items-start space-x-3">
                                            <Shield className="h-5 w-5 text-blue-600 mt-0.5" />
                                            <div>
                                                <h4 className="font-medium text-blue-900">Document Upload Required</h4>
                                                <p className="text-sm text-blue-700 mt-1">
                                                    As part of your employee setup process, you must upload all required documents before accessing the employee portal.
                                                    This ensures compliance and completes your account verification.
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Upload Section */}
                                    <div className="border-2 border-dashed border-primary/20 rounded-lg p-6 text-center bg-primary/5">
                                        <Upload className="h-12 w-12 mx-auto text-primary mb-4" />
                                        <h3 className="text-lg font-medium text-gray-900 mb-2">Upload Required Documents</h3>
                                        <p className="text-gray-500 mb-4">Upload all required documents to access the employee portal</p>
                                        <div className="space-y-2">
                                            <input
                                                type="file"
                                                multiple
                                                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                                                className="hidden"
                                                id="file-upload"
                                                onChange={(e) => {
                                                    const files = Array.from(e.target.files || []);
                                                    console.log('Files selected:', files);
                                                    // TODO: Implement file upload logic
                                                }}
                                            />
                                            <label
                                                htmlFor="file-upload"
                                                className="inline-flex items-center px-6 py-3 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-primary/90 cursor-pointer"
                                            >
                                                <Upload className="h-4 w-4 mr-2" />
                                                Choose Files to Upload
                                            </label>
                                        </div>
                                        <p className="text-xs text-gray-400 mt-2">
                                            Supported formats: PDF, DOC, DOCX, JPG, PNG (Max 10MB each)
                                        </p>
                                    </div>

                                    {/* Required Documents */}
                                    <div className="space-y-4">
                                        <h4 className="font-medium text-gray-900 flex items-center">
                                            <Shield className="h-4 w-4 mr-2 text-red-500" />
                                            Required Documents
                                        </h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {/* Personal Documents */}
                                            <div className="space-y-3">
                                                <h5 className="font-medium text-gray-700">Personal Documents</h5>
                                                <div className="space-y-2">
                                                    <div className="flex items-center justify-between p-3 border border-red-200 rounded-lg bg-red-50">
                                                        <div className="flex items-center space-x-3">
                                                            <FileText className="h-5 w-5 text-red-500" />
                                                            <div>
                                                                <p className="text-sm font-medium">Government ID</p>
                                                                <p className="text-xs text-red-600">Required - Not uploaded</p>
                                                            </div>
                                                        </div>
                                                        <div className="flex space-x-1">
                                                            <button className="p-1 text-red-400 hover:text-red-600">
                                                                <Upload className="h-4 w-4" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center justify-between p-3 border border-red-200 rounded-lg bg-red-50">
                                                        <div className="flex items-center space-x-3">
                                                            <FileText className="h-5 w-5 text-red-500" />
                                                            <div>
                                                                <p className="text-sm font-medium">Passport/Visa</p>
                                                                <p className="text-xs text-red-600">Required - Not uploaded</p>
                                                            </div>
                                                        </div>
                                                        <div className="flex space-x-1">
                                                            <button className="p-1 text-red-400 hover:text-red-600">
                                                                <Upload className="h-4 w-4" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Work Documents */}
                                            <div className="space-y-3">
                                                <h5 className="font-medium text-gray-700">Work Documents</h5>
                                                <div className="space-y-2">
                                                    <div className="flex items-center justify-between p-3 border border-red-200 rounded-lg bg-red-50">
                                                        <div className="flex items-center space-x-3">
                                                            <FileText className="h-5 w-5 text-red-500" />
                                                            <div>
                                                                <p className="text-sm font-medium">Employment Contract</p>
                                                                <p className="text-xs text-red-600">Required - Not uploaded</p>
                                                            </div>
                                                        </div>
                                                        <div className="flex space-x-1">
                                                            <button className="p-1 text-red-400 hover:text-red-600">
                                                                <Upload className="h-4 w-4" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center justify-between p-3 border border-red-200 rounded-lg bg-red-50">
                                                        <div className="flex items-center space-x-3">
                                                            <FileText className="h-5 w-5 text-red-500" />
                                                            <div>
                                                                <p className="text-sm font-medium">Resume/CV</p>
                                                                <p className="text-xs text-red-600">Required - Not uploaded</p>
                                                            </div>
                                                        </div>
                                                        <div className="flex space-x-1">
                                                            <button className="p-1 text-red-400 hover:text-red-600">
                                                                <Upload className="h-4 w-4" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Educational Documents */}
                                    <div className="space-y-4">
                                        <h4 className="font-medium text-gray-900 flex items-center">
                                            <GraduationCap className="h-4 w-4 mr-2 text-orange-500" />
                                            Educational Documents
                                        </h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="flex items-center justify-between p-3 border border-orange-200 rounded-lg bg-orange-50">
                                                <div className="flex items-center space-x-3">
                                                    <FileText className="h-5 w-5 text-orange-500" />
                                                    <div>
                                                        <p className="text-sm font-medium">Degree Certificate</p>
                                                        <p className="text-xs text-orange-600">Required - Not uploaded</p>
                                                    </div>
                                                </div>
                                                <div className="flex space-x-1">
                                                    <button className="p-1 text-orange-400 hover:text-orange-600">
                                                        <Upload className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            </div>
                                            <div className="flex items-center justify-between p-3 border border-orange-200 rounded-lg bg-orange-50">
                                                <div className="flex items-center space-x-3">
                                                    <FileText className="h-5 w-5 text-orange-500" />
                                                    <div>
                                                        <p className="text-sm font-medium">Transcript</p>
                                                        <p className="text-xs text-orange-600">Required - Not uploaded</p>
                                                    </div>
                                                </div>
                                                <div className="flex space-x-1">
                                                    <button className="p-1 text-orange-400 hover:text-orange-600">
                                                        <Upload className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Additional Documents */}
                                    <div className="space-y-4">
                                        <h4 className="font-medium text-gray-900 flex items-center">
                                            <FileText className="h-4 w-4 mr-2 text-blue-500" />
                                            Additional Documents
                                        </h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="flex items-center justify-between p-3 border border-blue-200 rounded-lg bg-blue-50">
                                                <div className="flex items-center space-x-3">
                                                    <FileText className="h-5 w-5 text-blue-500" />
                                                    <div>
                                                        <p className="text-sm font-medium">Professional Certificates</p>
                                                        <p className="text-xs text-blue-600">Optional - Not uploaded</p>
                                                    </div>
                                                </div>
                                                <div className="flex space-x-1">
                                                    <button className="p-1 text-blue-400 hover:text-blue-600">
                                                        <Upload className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            </div>
                                            <div className="flex items-center justify-between p-3 border border-blue-200 rounded-lg bg-blue-50">
                                                <div className="flex items-center space-x-3">
                                                    <FileText className="h-5 w-5 text-blue-500" />
                                                    <div>
                                                        <p className="text-sm font-medium">Reference Letters</p>
                                                        <p className="text-xs text-blue-600">Optional - Not uploaded</p>
                                                    </div>
                                                </div>
                                                <div className="flex space-x-1">
                                                    <button className="p-1 text-blue-400 hover:text-blue-600">
                                                        <Upload className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Document Completion Status */}
                                    <div className="bg-gray-50 rounded-lg p-4">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <h4 className="font-medium text-gray-900">Document Completion Status</h4>
                                                <p className="text-sm text-gray-600">Complete document upload to access the employee portal</p>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-2xl font-bold text-gray-900">0%</div>
                                                <div className="text-sm text-gray-500">Complete</div>
                                            </div>
                                        </div>
                                        <div className="mt-4">
                                            <div className="flex items-center space-x-2 text-sm text-gray-600">
                                                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                                                <span>8 required documents pending - Portal access restricted</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}
