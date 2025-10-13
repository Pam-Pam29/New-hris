import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Badge } from '../../components/ui/badge';
import { Progress } from '../../components/ui/progress';
import { Separator } from '../../components/ui/separator';
import { User, Mail, Phone, MapPin, Calendar, Edit, Save, X, Building, Briefcase, CreditCard, Users, Shield, ArrowLeft, Heart, GraduationCap, FileText } from 'lucide-react';
import { getDataFlowService, EmployeeProfileData } from '../../services/dataFlowService';
import { Link } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';

// Comprehensive employee profile interface
interface ComprehensiveProfile {
    id: string;
    // Personal Information
    personalInfo: {
        firstName: string;
        lastName: string;
        middleName?: string;
        dateOfBirth: string;
        gender?: string;
        maritalStatus?: string;
        nationality?: string;
        ssn?: string;
        passportNumber?: string;
    };
    // Contact Information
    contactInfo: {
        personalEmail: string;
        workEmail: string;
        personalPhone: string;
        workPhone: string;
        address: {
            street: string;
            city: string;
            state: string;
            zipCode: string;
            country: string;
        };
        emergencyContacts: Array<{
            name: string;
            relationship: string;
            phone: string;
            email: string;
            isPrimary: boolean;
            address?: string;
        }>;
    };
    // Work Information
    workInfo: {
        employeeId: string;
        position: string;
        department: string;
        managerId?: string;
        hireDate: string;
        employmentType: string;
        workLocation: string;
        workSchedule: string;
        salary: {
            baseSalary: number;
            currency: string;
            payFrequency: string;
        };
    };
    // Banking & Financial Information
    bankingInfo: {
        bankName: string;
        accountNumber: string;
        routingNumber: string;
        accountType: string;
        salaryPaymentMethod: string;
        taxInformation: {
            federalTaxId?: string;
            stateTaxId?: string;
            exemptions: number;
        };
    };
    // Skills & Certifications
    skills: Array<{
        name: string;
        level: string;
        certified: boolean;
        certificationDate?: string;
        expiryDate?: string;
    }>;
    // Family Information & Beneficiaries
    familyInfo: {
        spouse?: {
            name: string;
            occupation: string;
            employer?: string;
            phone?: string;
            email?: string;
        };
        dependents: Array<{
            name: string;
            relationship: string;
            dateOfBirth: string;
            ssn?: string;
        }>;
        beneficiaries: Array<{
            name: string;
            relationship: string;
            percentage: number;
            contactInfo: string;
        }>;
    };
    // Profile Management
    profileStatus: {
        completeness: number;
        lastUpdated: string;
        updatedBy: string;
        status: 'draft' | 'pending_review' | 'approved' | 'needs_update';
    };
}

export default function EmployeeProfilePage() {
    const [profile, setProfile] = useState<ComprehensiveProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(false);
    const [editData, setEditData] = useState<Partial<ComprehensiveProfile>>({});
    const [activeTab, setActiveTab] = useState('personal');

    // Load profile data on component mount
    useEffect(() => {
        let unsubscribe: (() => void) | null = null;

        const loadProfile = async () => {
            try {
                const dataFlowService = await getDataFlowService();

                // Create comprehensive sample profile
                const comprehensiveProfile: ComprehensiveProfile = {
                    id: 'emp-001',
                    personalInfo: {
                        firstName: 'John',
                        lastName: 'Doe',
                        middleName: 'Michael',
                        dateOfBirth: '1990-05-15',
                        gender: 'Male',
                        maritalStatus: 'Married',
                        nationality: 'American',
                        ssn: '***-**-1234',
                        passportNumber: 'US123456789'
                    },
                    contactInfo: {
                        personalEmail: 'john.doe@email.com',
                        workEmail: 'john.doe@company.com',
                        personalPhone: '+1 (555) 123-4567',
                        workPhone: '+1 (555) 987-6543',
                        address: {
                            street: '123 Main Street',
                            city: 'New York',
                            state: 'NY',
                            zipCode: '10001',
                            country: 'USA'
                        },
                        emergencyContacts: [
                            {
                                name: 'Jane Doe',
                                relationship: 'Spouse',
                                phone: '+1 (555) 987-6543',
                                email: 'jane.doe@email.com',
                                isPrimary: true,
                                address: '123 Main Street, New York, NY 10001'
                            },
                            {
                                name: 'Robert Smith',
                                relationship: 'Father',
                                phone: '+1 (555) 456-7890',
                                email: 'robert.smith@email.com',
                                isPrimary: false,
                                address: '456 Oak Avenue, Boston, MA 02101'
                            }
                        ]
                    },
                    workInfo: {
                        employeeId: 'EMP-001',
                        position: 'Senior Software Developer',
                        department: 'Engineering',
                        managerId: 'MGR-001',
                        hireDate: '2022-01-15',
                        employmentType: 'Full-time',
                        workLocation: 'New York Office',
                        workSchedule: 'Monday-Friday, 9 AM - 5 PM',
                        salary: {
                            baseSalary: 95000,
                            currency: 'USD',
                            payFrequency: 'Bi-weekly'
                        }
                    },
                    bankingInfo: {
                        bankName: 'First National Bank',
                        accountNumber: '****1234',
                        routingNumber: '021000021',
                        accountType: 'Checking',
                        salaryPaymentMethod: 'Direct Deposit',
                        taxInformation: {
                            federalTaxId: '12-3456789',
                            stateTaxId: '12-3456789',
                            exemptions: 3
                        }
                    },
                    skills: [
                        {
                            name: 'JavaScript',
                            level: 'Expert',
                            certified: true,
                            certificationDate: '2021-03-15',
                            expiryDate: '2024-03-15'
                        },
                        {
                            name: 'React',
                            level: 'Advanced',
                            certified: true,
                            certificationDate: '2021-06-20',
                            expiryDate: '2024-06-20'
                        },
                        {
                            name: 'TypeScript',
                            level: 'Advanced',
                            certified: false,
                        },
                        {
                            name: 'Node.js',
                            level: 'Intermediate',
                            certified: true,
                            certificationDate: '2022-01-10',
                            expiryDate: '2025-01-10'
                        }
                    ],
                    familyInfo: {
                        spouse: {
                            name: 'Jane Doe',
                            occupation: 'Marketing Manager',
                            employer: 'ABC Marketing Corp',
                            phone: '+1 (555) 987-6543',
                            email: 'jane.doe@email.com'
                        },
                        dependents: [
                            {
                                name: 'Sarah Doe',
                                relationship: 'Daughter',
                                dateOfBirth: '2015-08-20',
                                ssn: '***-**-5678'
                            },
                            {
                                name: 'Michael Doe',
                                relationship: 'Son',
                                dateOfBirth: '2018-03-12',
                                ssn: '***-**-9012'
                            }
                        ],
                        beneficiaries: [
                            {
                                name: 'Jane Doe',
                                relationship: 'Spouse',
                                percentage: 80,
                                contactInfo: '+1 (555) 987-6543'
                            },
                            {
                                name: 'Sarah Doe',
                                relationship: 'Daughter',
                                percentage: 20,
                                contactInfo: 'In care of Jane Doe'
                            }
                        ]
                    },
                    profileStatus: {
                        completeness: 85,
                        lastUpdated: new Date().toISOString(),
                        updatedBy: 'emp-001',
                        status: 'approved'
                    }
                };

                setProfile(comprehensiveProfile);
                setLoading(false);
            } catch (error) {
                console.error('Error loading profile:', error);
                setLoading(false);
            }
        };

        loadProfile();

        return () => {
            if (unsubscribe) {
                unsubscribe();
            }
        };
    }, []);

    const handleEdit = () => {
        setEditData(profile || {});
        setEditing(true);
    };

    const handleSave = async () => {
        if (profile && editData) {
            try {
                const dataFlowService = await getDataFlowService();

                // Convert SimpleProfile changes to EmployeeProfileData format
                const profileUpdates: Partial<EmployeeProfileData> = {
                    personalInfo: {
                        firstName: editData.personalInfo?.firstName || profile.personalInfo.firstName,
                        lastName: editData.personalInfo?.lastName || profile.personalInfo.lastName,
                        dateOfBirth: editData.personalInfo?.dateOfBirth ? new Date(editData.personalInfo.dateOfBirth) : undefined
                    },
                    contactInfo: {
                        personalEmail: editData.contactInfo?.personalEmail || profile.contactInfo.personalEmail,
                        phone: editData.contactInfo?.personalPhone || profile.contactInfo.personalPhone,
                        address: {
                            street: editData.contactInfo?.address?.street || profile.contactInfo.address.street,
                            city: editData.contactInfo?.address?.city || profile.contactInfo.address.city,
                            state: editData.contactInfo?.address?.state || profile.contactInfo.address.state,
                            zipCode: editData.contactInfo?.address?.zipCode || profile.contactInfo.address.zipCode,
                            country: 'USA'
                        }
                    },
                    bankingInfo: editData.bankingInfo ? {
                        bankName: editData.bankingInfo.bankName || profile.bankingInfo.bankName,
                        accountNumber: editData.bankingInfo.accountNumber || profile.bankingInfo.accountNumber,
                        routingNumber: editData.bankingInfo.routingNumber || profile.bankingInfo.routingNumber,
                        accountType: editData.bankingInfo.accountType || profile.bankingInfo.accountType,
                        salaryPaymentMethod: 'direct_deposit'
                    } : undefined
                };

                // Update the profile in the data flow service
                await dataFlowService.updateEmployeeProfile('emp-001', profileUpdates);

                // Update local state
                const updatedProfile = { ...profile, ...editData };
                setProfile(updatedProfile);
                setEditing(false);
                setEditData({});
            } catch (error) {
                console.error('Error saving profile:', error);
            }
        }
    };

    const handleCancel = () => {
        setEditing(false);
        setEditData({});
    };

    const handleInputChange = (field: string, value: string) => {
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
        return (
            <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 p-6">
                <div className="max-w-4xl mx-auto space-y-6">
                    <Card>
                        <CardContent className="p-6">
                            <div className="text-center">
                                <User className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                                <h2 className="text-xl font-semibold mb-2">Profile Not Found</h2>
                                <p className="text-muted-foreground">We couldn't load your profile information.</p>
                            </div>
                        </CardContent>
                    </Card>
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
                    </div>
                    <div className="flex space-x-2">
                        {editing ? (
                            <>
                                <Button onClick={handleSave} className="flex items-center space-x-2">
                                    <Save className="h-4 w-4" />
                                    <span>Save Changes</span>
                                </Button>
                                <Button variant="outline" onClick={handleCancel} className="flex items-center space-x-2">
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
                                    <p className="font-medium">{currentData?.profileStatus?.lastUpdated ? new Date(currentData.profileStatus.lastUpdated).toLocaleDateString() : 'Never'}</p>
                                </div>
                                <div>
                                    <span className="text-muted-foreground">Updated By:</span>
                                    <p className="font-medium">{currentData?.profileStatus?.updatedBy || 'N/A'}</p>
                                </div>
                                <div>
                                    <span className="text-muted-foreground">Employee ID:</span>
                                    <p className="font-medium">{currentData?.workInfo?.employeeId || 'N/A'}</p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Comprehensive Profile Tabs */}
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid w-full grid-cols-6">
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
                                        <p className="text-sm py-2">{currentData.personalInfo?.firstName || 'N/A'}</p>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Last Name</Label>
                                        <p className="text-sm py-2">{currentData.personalInfo?.lastName || 'N/A'}</p>
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Middle Name</Label>
                                        <p className="text-sm py-2">{currentData.personalInfo?.middleName || 'N/A'}</p>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Date of Birth</Label>
                                        <p className="text-sm py-2">{currentData.personalInfo?.dateOfBirth || 'N/A'}</p>
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Gender</Label>
                                        <p className="text-sm py-2">{currentData.personalInfo?.gender || 'N/A'}</p>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Marital Status</Label>
                                        <p className="text-sm py-2">{currentData.personalInfo?.maritalStatus || 'N/A'}</p>
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Nationality</Label>
                                        <p className="text-sm py-2">{currentData.personalInfo?.nationality || 'N/A'}</p>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>SSN</Label>
                                        <p className="text-sm py-2 font-mono">{currentData.personalInfo?.ssn || 'N/A'}</p>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label>Passport Number</Label>
                                    <p className="text-sm py-2 font-mono">{currentData.personalInfo?.passportNumber || 'N/A'}</p>
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
                                        <Label>Employee ID</Label>
                                        <p className="text-sm py-2 font-mono">{currentData.workInfo?.employeeId || 'N/A'}</p>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Position</Label>
                                        <p className="text-sm py-2">{currentData.workInfo?.position || 'N/A'}</p>
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Department</Label>
                                        <p className="text-sm py-2">{currentData.workInfo?.department || 'N/A'}</p>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Manager ID</Label>
                                        <p className="text-sm py-2 font-mono">{currentData.workInfo?.managerId || 'N/A'}</p>
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Hire Date</Label>
                                        <p className="text-sm py-2">{currentData.workInfo?.hireDate || 'N/A'}</p>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Employment Type</Label>
                                        <p className="text-sm py-2">{currentData.workInfo?.employmentType || 'N/A'}</p>
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Work Location</Label>
                                        <p className="text-sm py-2">{currentData.workInfo?.workLocation || 'N/A'}</p>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Work Schedule</Label>
                                        <p className="text-sm py-2">{currentData.workInfo?.workSchedule || 'N/A'}</p>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <h4 className="font-medium">Salary Information</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div>
                                            <Label>Base Salary</Label>
                                            <p className="text-sm py-2">{currentData.workInfo?.salary?.baseSalary ? `$${currentData.workInfo.salary.baseSalary.toLocaleString()}` : 'N/A'}</p>
                                        </div>
                                        <div>
                                            <Label>Currency</Label>
                                            <p className="text-sm py-2">{currentData.workInfo?.salary?.currency || 'N/A'}</p>
                                        </div>
                                        <div>
                                            <Label>Pay Frequency</Label>
                                            <p className="text-sm py-2">{currentData.workInfo?.salary?.payFrequency || 'N/A'}</p>
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
                                            <div className="flex items-center space-x-2 text-sm py-2">
                                                <Mail className="h-4 w-4 text-muted-foreground" />
                                                <span>{currentData.contactInfo?.personalEmail || 'N/A'}</span>
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Work Email</Label>
                                            <div className="flex items-center space-x-2 text-sm py-2">
                                                <Mail className="h-4 w-4 text-muted-foreground" />
                                                <span>{currentData.contactInfo?.workEmail || 'N/A'}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label>Personal Phone</Label>
                                            <div className="flex items-center space-x-2 text-sm py-2">
                                                <Phone className="h-4 w-4 text-muted-foreground" />
                                                <span>{currentData.contactInfo?.personalPhone || 'N/A'}</span>
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Work Phone</Label>
                                            <div className="flex items-center space-x-2 text-sm py-2">
                                                <Phone className="h-4 w-4 text-muted-foreground" />
                                                <span>{currentData.contactInfo?.workPhone || 'N/A'}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Address */}
                                <div className="space-y-4">
                                    <h4 className="font-medium">Address</h4>
                                    <div className="space-y-2">
                                        <Label>Street Address</Label>
                                        <div className="flex items-center space-x-2 text-sm py-2">
                                            <MapPin className="h-4 w-4 text-muted-foreground" />
                                            <span>{currentData.contactInfo?.address?.street || 'N/A'}</span>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div>
                                            <Label>City</Label>
                                            <p className="text-sm py-2">{currentData.contactInfo?.address?.city || 'N/A'}</p>
                                        </div>
                                        <div>
                                            <Label>State</Label>
                                            <p className="text-sm py-2">{currentData.contactInfo?.address?.state || 'N/A'}</p>
                                        </div>
                                        <div>
                                            <Label>ZIP Code</Label>
                                            <p className="text-sm py-2">{currentData.contactInfo?.address?.zipCode || 'N/A'}</p>
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
                                            <p className="text-sm py-2">{currentData.bankingInfo?.bankName || 'N/A'}</p>
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Account Type</Label>
                                            <p className="text-sm py-2">{currentData.bankingInfo?.accountType || 'N/A'}</p>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label>Account Number</Label>
                                            <p className="text-sm py-2 font-mono">{currentData.bankingInfo?.accountNumber || 'N/A'}</p>
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Routing Number</Label>
                                            <p className="text-sm py-2 font-mono">{currentData.bankingInfo?.routingNumber || 'N/A'}</p>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Salary Payment Method</Label>
                                        <p className="text-sm py-2">{currentData.bankingInfo?.salaryPaymentMethod || 'N/A'}</p>
                                    </div>
                                </div>

                                {/* Tax Information */}
                                <div className="space-y-4">
                                    <h4 className="font-medium">Tax Information</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label>Federal Tax ID</Label>
                                            <p className="text-sm py-2 font-mono">{currentData.bankingInfo?.taxInformation?.federalTaxId || 'N/A'}</p>
                                        </div>
                                        <div className="space-y-2">
                                            <Label>State Tax ID</Label>
                                            <p className="text-sm py-2 font-mono">{currentData.bankingInfo?.taxInformation?.stateTaxId || 'N/A'}</p>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Tax Exemptions</Label>
                                        <p className="text-sm py-2">{currentData.bankingInfo?.taxInformation?.exemptions || 'N/A'}</p>
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
                                {currentData.familyInfo?.spouse && (
                                    <div className="space-y-4">
                                        <h4 className="font-medium">Spouse Information</h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <Label>Name</Label>
                                                <p className="text-sm py-2">{currentData.familyInfo.spouse.name}</p>
                                            </div>
                                            <div>
                                                <Label>Occupation</Label>
                                                <p className="text-sm py-2">{currentData.familyInfo.spouse.occupation}</p>
                                            </div>
                                            <div>
                                                <Label>Employer</Label>
                                                <p className="text-sm py-2">{currentData.familyInfo.spouse.employer || 'N/A'}</p>
                                            </div>
                                            <div>
                                                <Label>Phone</Label>
                                                <p className="text-sm py-2">{currentData.familyInfo.spouse.phone || 'N/A'}</p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Dependents */}
                                <div className="space-y-4">
                                    <h4 className="font-medium">Dependents</h4>
                                    {currentData.familyInfo?.dependents?.map((dependent, index) => (
                                        <div key={index} className="border rounded-lg p-4 space-y-3">
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                <div>
                                                    <Label>Name</Label>
                                                    <p className="text-sm py-2">{dependent.name}</p>
                                                </div>
                                                <div>
                                                    <Label>Relationship</Label>
                                                    <p className="text-sm py-2">{dependent.relationship}</p>
                                                </div>
                                                <div>
                                                    <Label>Date of Birth</Label>
                                                    <p className="text-sm py-2">{dependent.dateOfBirth}</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    {(!currentData.familyInfo?.dependents || currentData.familyInfo.dependents.length === 0) && (
                                        <p className="text-sm text-muted-foreground">No dependents added yet.</p>
                                    )}
                                </div>

                                {/* Beneficiaries */}
                                <div className="space-y-4">
                                    <h4 className="font-medium">Beneficiaries</h4>
                                    {currentData.familyInfo?.beneficiaries?.map((beneficiary, index) => (
                                        <div key={index} className="border rounded-lg p-4 space-y-3">
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                <div>
                                                    <Label>Name</Label>
                                                    <p className="text-sm py-2">{beneficiary.name}</p>
                                                </div>
                                                <div>
                                                    <Label>Relationship</Label>
                                                    <p className="text-sm py-2">{beneficiary.relationship}</p>
                                                </div>
                                                <div>
                                                    <Label>Percentage</Label>
                                                    <p className="text-sm py-2">{beneficiary.percentage}%</p>
                                                </div>
                                            </div>
                                            <div>
                                                <Label>Contact Information</Label>
                                                <p className="text-sm py-2">{beneficiary.contactInfo}</p>
                                            </div>
                                        </div>
                                    ))}
                                    {(!currentData.familyInfo?.beneficiaries || currentData.familyInfo.beneficiaries.length === 0) && (
                                        <p className="text-sm text-muted-foreground">No beneficiaries added yet.</p>
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
                                    {currentData.skills?.map((skill, index) => (
                                        <div key={index} className="border rounded-lg p-4 space-y-3">
                                            <div className="flex items-center justify-between">
                                                <h4 className="font-medium">{skill.name}</h4>
                                                <div className="flex items-center space-x-2">
                                                    <Badge variant={skill.level === 'Expert' ? 'default' : skill.level === 'Advanced' ? 'secondary' : 'outline'}>
                                                        {skill.level}
                                                    </Badge>
                                                    {skill.certified && (
                                                        <Badge variant="default" className="bg-green-600">
                                                            Certified
                                                        </Badge>
                                                    )}
                                                </div>
                                            </div>
                                            {skill.certified && (
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                                    <div>
                                                        <Label>Certification Date</Label>
                                                        <p className="text-sm py-2">{skill.certificationDate}</p>
                                                    </div>
                                                    <div>
                                                        <Label>Expiry Date</Label>
                                                        <p className="text-sm py-2">{skill.expiryDate}</p>
                                                    </div>
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
                </Tabs>
            </div>
        </div>
    );
}
