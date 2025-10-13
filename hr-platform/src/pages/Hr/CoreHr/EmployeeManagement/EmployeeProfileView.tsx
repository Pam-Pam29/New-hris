import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../components/ui/card';
import { Button } from '../../../../components/ui/button';
import { Badge } from '../../../../components/ui/badge';
import { Separator } from '../../../../components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../../components/ui/tabs';
import {
    ArrowLeft,
    Edit,
    Download,
    Printer,
    Mail,
    Phone,
    MapPin,
    Calendar,
    User,
    Briefcase,
    GraduationCap,
    Heart,
    Shield,
    Clock,
    DollarSign,
    FileText,
    Award,
    Users
} from 'lucide-react';
import { getComprehensiveDataFlowService } from '../../../../services/comprehensiveDataFlowService';

interface EmployeeProfile {
    employeeId: string;
    personalInfo: {
        firstName: string;
        lastName: string;
        middleName?: string;
        dateOfBirth: Date | string | null;
        gender?: string;
        maritalStatus?: string;
        nationality?: string;
        otherNationality?: string;
        identificationNumber?: string;
    };
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
        }>;
    };
    workInfo: {
        position: string;
        department: string;
        hireDate: Date | string | null;
        employmentType: string;
        workLocation: string;
        workSchedule: string;
        salary: {
            baseSalary: number;
            currency: string;
            payFrequency: string;
        };
    };
    bankingInfo: {
        bankName: string;
        accountNumber: string;
        routingNumber: string;
        salaryPaymentMethod: string;
    };
    skills: Array<{
        name: string;
        level: string;
        certified: boolean;
        certificationDate?: Date;
        expiryDate?: Date;
        issuer?: string;
    }>;
    familyInfo: {
        spouse: {
            name: string;
            occupation: string;
            phone: string;
        };
        dependents: Array<{
            name: string;
            relationship: string;
            dateOfBirth: Date | string;
        }>;
    };
    profileStatus: {
        completeness: number;
        lastUpdated: Date | string;
        updatedBy: string;
        status: string;
    };
    documents: Array<{
        id: string;
        name: string;
        type: string;
        uploadedAt: Date | string;
        size: number;
        url: string;
    }>;
    createdAt: Date | string;
    updatedAt: Date | string;
}

export default function EmployeeProfileView() {
    const { employeeId } = useParams<{ employeeId: string }>();
    const navigate = useNavigate();
    const [profile, setProfile] = useState<EmployeeProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadProfile = async () => {
            try {
                setLoading(true);
                const service = await getComprehensiveDataFlowService();
                const employeeProfile = await service.getEmployeeProfile(employeeId!);

                if (employeeProfile) {
                    console.log('Loaded profile data:', employeeProfile);
                    console.log('Date of birth:', employeeProfile.personalInfo?.dateOfBirth);
                    console.log('Hire date:', employeeProfile.workInfo?.hireDate);
                    setProfile(employeeProfile);
                } else {
                    setError('Employee profile not found');
                }
            } catch (err) {
                console.error('Error loading profile:', err);
                setError('Failed to load employee profile');
            } finally {
                setLoading(false);
            }
        };

        if (employeeId) {
            loadProfile();
        }
    }, [employeeId]);

    const formatDate = (date: Date | string | null | any) => {
        console.log('formatDate called with:', date, 'type:', typeof date);

        if (!date || date === null) return 'N/A';

        // Handle different date formats
        let dateObj: Date;

        if (date instanceof Date) {
            console.log('Date object detected');
            // Check if it's a valid date
            if (isNaN(date.getTime())) {
                console.log('Invalid Date object detected, returning N/A');
                return 'N/A';
            }
            dateObj = date;
        } else if (typeof date === 'string') {
            console.log('String date detected:', date);
            // Handle string dates
            if (date === 'Invalid Date' || date === 'N/A') return 'N/A';
            dateObj = new Date(date);
        } else if (date && typeof date === 'object') {
            console.log('Object date detected:', date);
            console.log('Object keys:', Object.keys(date));
            console.log('Object values:', Object.values(date));

            // Handle empty objects
            if (Object.keys(date).length === 0) {
                console.log('Empty object detected, returning N/A');
                return 'N/A';
            }

            // Handle serverTimestamp placeholders
            if (date._methodName === 'serverTimestamp') {
                console.log('ServerTimestamp placeholder detected, returning N/A');
                return 'N/A';
            }

            // Handle Firestore timestamp objects
            if (date.toDate && typeof date.toDate === 'function') {
                console.log('Firestore timestamp detected');
                dateObj = date.toDate();
            } else if (date.seconds) {
                console.log('Timestamp with seconds detected');
                dateObj = new Date(date.seconds * 1000);
            } else if (date._seconds) {
                console.log('Timestamp with _seconds detected');
                dateObj = new Date(date._seconds * 1000);
            } else if (date.nanoseconds !== undefined) {
                console.log('Timestamp with nanoseconds detected');
                dateObj = new Date(date.seconds * 1000 + date.nanoseconds / 1000000);
            } else if (date.constructor && date.constructor.name === 'Timestamp') {
                console.log('Firestore Timestamp object detected');
                dateObj = date.toDate();
            } else {
                console.log('Unknown object type, trying to convert to string first:', JSON.stringify(date));
                // Try to convert the object to a string and then to Date
                const dateString = JSON.stringify(date);
                if (dateString && dateString !== '{}') {
                    dateObj = new Date(dateString);
                } else {
                    console.log('Cannot convert object to date, returning N/A');
                    return 'N/A';
                }
            }
        } else {
            console.log('Unknown type, returning N/A');
            return 'N/A';
        }

        // Check if the date is valid
        if (isNaN(dateObj.getTime())) {
            console.log('Invalid date object, returning N/A');
            return 'N/A';
        }

        const formatted = dateObj.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        console.log('Formatted date:', formatted);
        return formatted;
    };

    const formatCurrency = (amount: number, currency: string = 'NGN') => {
        if (currency === 'NGN') {
            return `₦${amount.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
        } else if (currency === 'USD') {
            return `$${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
        } else {
            return new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: currency
            }).format(amount);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case 'active': return 'bg-green-100 text-green-800';
            case 'inactive': return 'bg-red-100 text-red-800';
            case 'on leave': return 'bg-yellow-100 text-yellow-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-2 text-gray-600">Loading employee profile...</p>
                </div>
            </div>
        );
    }

    if (error || !profile) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <div className="text-red-500 text-6xl mb-4">⚠️</div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Profile Not Found</h3>
                    <p className="text-gray-600 mb-4">{error || 'Employee profile could not be loaded'}</p>
                    <Button onClick={() => navigate('/hr/employee-management')}>
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Employee Directory
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate('/hr/employee-management')}
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Directory
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">
                            {profile.personalInfo?.firstName} {profile.personalInfo?.lastName}
                        </h1>
                        <p className="text-gray-600">{profile.workInfo?.position} • {profile.workInfo?.department}</p>
                    </div>
                </div>
                <div className="flex items-center space-x-2">
                    <Badge className={getStatusColor(profile.profileStatus?.status || 'active')}>
                        {profile.profileStatus?.status || 'Active'}
                    </Badge>
                    <Button variant="outline" size="sm">
                        <Edit className="w-4 h-4 mr-2" />
                        Edit Profile
                    </Button>
                    <Button variant="outline" size="sm">
                        <Download className="w-4 h-4 mr-2" />
                        Export
                    </Button>
                    <Button variant="outline" size="sm">
                        <Printer className="w-4 h-4 mr-2" />
                        Print
                    </Button>
                </div>
            </div>

            {/* Profile Completeness */}
            <Card>
                <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-lg font-semibold">Profile Completeness</h3>
                            <p className="text-sm text-gray-600">Last updated: {formatDate(profile.profileStatus?.lastUpdated)}</p>
                        </div>
                        <div className="text-right">
                            <div className="text-2xl font-bold text-blue-600">
                                {profile.profileStatus?.completeness || 0}%
                            </div>
                            <div className="w-32 bg-gray-200 rounded-full h-2 mt-2">
                                <div
                                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                    style={{ width: `${profile.profileStatus?.completeness || 0}%` }}
                                ></div>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Main Content Tabs */}
            <Tabs defaultValue="personal" className="space-y-6">
                <TabsList className="grid w-full grid-cols-7 gap-1 sm:grid-cols-7 md:grid-cols-7 lg:grid-cols-7">
                    <TabsTrigger value="personal" className="text-xs px-2">Personal</TabsTrigger>
                    <TabsTrigger value="work" className="text-xs px-2">Work</TabsTrigger>
                    <TabsTrigger value="contact" className="text-xs px-2">Contact</TabsTrigger>
                    <TabsTrigger value="banking" className="text-xs px-2">Banking</TabsTrigger>
                    <TabsTrigger value="skills" className="text-xs px-2">Skills</TabsTrigger>
                    <TabsTrigger value="family" className="text-xs px-2">Family</TabsTrigger>
                    <TabsTrigger value="documents" className="text-xs px-2">Documents</TabsTrigger>
                </TabsList>

                {/* Personal Information Tab */}
                <TabsContent value="personal" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <User className="w-5 h-5 mr-2" />
                                Personal Information
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium text-gray-500">Full Name</label>
                                    <p className="text-lg">{profile.personalInfo?.firstName} {profile.personalInfo?.lastName}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-500">Date of Birth</label>
                                    <p className="text-lg">{formatDate(profile.personalInfo?.dateOfBirth)}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-500">Gender</label>
                                    <p className="text-lg">{profile.personalInfo?.gender || 'N/A'}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-500">Marital Status</label>
                                    <p className="text-lg">{profile.personalInfo?.maritalStatus || 'N/A'}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-500">Nationality</label>
                                    <p className="text-lg">{profile.personalInfo?.nationality || 'N/A'}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-500">Identification Number</label>
                                    <p className="text-lg">{profile.personalInfo?.identificationNumber || 'N/A'}</p>
                                </div>
                                {profile.personalInfo?.otherNationality && (
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">Other Nationality</label>
                                        <p className="text-lg">{profile.personalInfo.otherNationality}</p>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Work Information Tab */}
                <TabsContent value="work" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <Briefcase className="w-5 h-5 mr-2" />
                                Work Information
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium text-gray-500">Position</label>
                                    <p className="text-lg">{profile.workInfo?.position || 'N/A'}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-500">Department</label>
                                    <p className="text-lg">{profile.workInfo?.department || 'N/A'}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-500">Hire Date</label>
                                    <p className="text-lg">{formatDate(profile.workInfo?.hireDate)}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-500">Employment Type</label>
                                    <p className="text-lg">{profile.workInfo?.employmentType || 'N/A'}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-500">Work Location</label>
                                    <p className="text-lg">{profile.workInfo?.workLocation || 'N/A'}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-500">Work Schedule</label>
                                    <p className="text-lg">{profile.workInfo?.workSchedule || 'N/A'}</p>
                                </div>
                            </div>

                            <Separator />

                            <div>
                                <h4 className="text-lg font-semibold mb-3 flex items-center">
                                    <DollarSign className="w-5 h-5 mr-2" />
                                    Compensation
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">Base Salary</label>
                                        <p className="text-lg font-semibold">
                                            {profile.workInfo?.salary?.baseSalary ?
                                                formatCurrency(profile.workInfo.salary.baseSalary, profile.workInfo.salary.currency) :
                                                'N/A'
                                            }
                                        </p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">Currency</label>
                                        <p className="text-lg">{profile.workInfo?.salary?.currency || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">Pay Frequency</label>
                                        <p className="text-lg">{profile.workInfo?.salary?.payFrequency || 'N/A'}</p>
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
                            <CardTitle className="flex items-center">
                                <Phone className="w-5 h-5 mr-2" />
                                Contact Information
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <h4 className="text-lg font-semibold mb-3">Email Addresses</h4>
                                    <div className="space-y-2">
                                        <div className="flex items-center">
                                            <Mail className="w-4 h-4 mr-2 text-gray-500" />
                                            <div>
                                                <p className="text-sm text-gray-500">Personal</p>
                                                <p className="font-medium">{profile.contactInfo?.personalEmail || 'N/A'}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center">
                                            <Mail className="w-4 h-4 mr-2 text-gray-500" />
                                            <div>
                                                <p className="text-sm text-gray-500">Work</p>
                                                <p className="font-medium">{profile.contactInfo?.workEmail || 'N/A'}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <h4 className="text-lg font-semibold mb-3">Phone Numbers</h4>
                                    <div className="space-y-2">
                                        <div className="flex items-center">
                                            <Phone className="w-4 h-4 mr-2 text-gray-500" />
                                            <div>
                                                <p className="text-sm text-gray-500">Personal</p>
                                                <p className="font-medium">{profile.contactInfo?.personalPhone || 'N/A'}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center">
                                            <Phone className="w-4 h-4 mr-2 text-gray-500" />
                                            <div>
                                                <p className="text-sm text-gray-500">Work</p>
                                                <p className="font-medium">{profile.contactInfo?.workPhone || 'N/A'}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <Separator />

                            <div>
                                <h4 className="text-lg font-semibold mb-3 flex items-center">
                                    <MapPin className="w-5 h-5 mr-2" />
                                    Address
                                </h4>
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <p className="text-sm text-gray-500">Street Address</p>
                                    <p className="font-medium">{profile.contactInfo?.address?.street || 'N/A'}</p>
                                    <div className="mt-2 grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
                                        <div>
                                            <span className="text-gray-500">City: </span>
                                            <span>{profile.contactInfo?.address?.city || 'N/A'}</span>
                                        </div>
                                        <div>
                                            <span className="text-gray-500">State: </span>
                                            <span>{profile.contactInfo?.address?.state || 'N/A'}</span>
                                        </div>
                                        <div>
                                            <span className="text-gray-500">ZIP: </span>
                                            <span>{profile.contactInfo?.address?.zipCode || 'N/A'}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <Separator />

                            <div>
                                <h4 className="text-lg font-semibold mb-3 flex items-center">
                                    <Users className="w-5 h-5 mr-2" />
                                    Emergency Contacts
                                </h4>
                                <div className="space-y-3">
                                    {profile.contactInfo?.emergencyContacts?.length > 0 ? (
                                        profile.contactInfo.emergencyContacts.map((contact, index) => (
                                            <div key={index} className="bg-gray-50 p-4 rounded-lg">
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                                    <div>
                                                        <p className="font-medium">{contact.name}</p>
                                                        <p className="text-sm text-gray-500">{contact.relationship}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-sm">{contact.phone}</p>
                                                        <p className="text-sm text-gray-500">{contact.email}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-gray-500 italic">No emergency contacts on file</p>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Banking Information Tab */}
                <TabsContent value="banking" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <DollarSign className="w-5 h-5 mr-2" />
                                Banking Information
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="text-sm font-medium text-gray-500">Bank Name</label>
                                    <p className="text-lg">{profile.bankingInfo?.bankName || 'N/A'}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-500">Account Number</label>
                                    <p className="text-lg font-mono">{profile.bankingInfo?.accountNumber || 'N/A'}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-500">Routing Number</label>
                                    <p className="text-lg font-mono">{profile.bankingInfo?.routingNumber || 'N/A'}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-500">Salary Payment Method</label>
                                    <p className="text-lg">{profile.bankingInfo?.salaryPaymentMethod || 'N/A'}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Skills Tab */}
                <TabsContent value="skills" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <GraduationCap className="w-5 h-5 mr-2" />
                                Skills & Certifications
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {profile.skills?.length > 0 ? (
                                    profile.skills.map((skill, index) => (
                                        <div key={index} className="border rounded-lg p-4">
                                            <div className="flex items-center justify-between mb-2">
                                                <h4 className="font-semibold text-lg">{skill.name}</h4>
                                                <div className="flex items-center gap-2">
                                                    <Badge variant="outline">{skill.level}</Badge>
                                                    {skill.certified && (
                                                        <Badge variant="default" className="bg-green-100 text-green-800">
                                                            Certified
                                                        </Badge>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm text-gray-600">
                                                <div>
                                                    <span className="font-medium">Issuer: </span>
                                                    {skill.issuer || 'N/A'}
                                                </div>
                                                {skill.certified && skill.certificationDate && (
                                                    <div>
                                                        <span className="font-medium">Certified: </span>
                                                        {formatDate(skill.certificationDate)}
                                                    </div>
                                                )}
                                                {skill.certified && skill.expiryDate && (
                                                    <div>
                                                        <span className="font-medium">Expires: </span>
                                                        {formatDate(skill.expiryDate)}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-gray-500 italic text-center py-8">No skills or certifications on file</p>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Family Information Tab */}
                <TabsContent value="family" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <Heart className="w-5 h-5 mr-2" />
                                Family Information
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div>
                                <h4 className="text-lg font-semibold mb-3">Spouse Information</h4>
                                {profile.familyInfo?.spouse?.name ? (
                                    <div className="bg-gray-50 p-4 rounded-lg">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <p className="text-sm text-gray-500">Name</p>
                                                <p className="font-medium">{profile.familyInfo.spouse.name}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-500">Occupation</p>
                                                <p className="font-medium">{profile.familyInfo.spouse.occupation || 'N/A'}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-500">Phone</p>
                                                <p className="font-medium">{profile.familyInfo.spouse.phone || 'N/A'}</p>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <p className="text-gray-500 italic">No spouse information on file</p>
                                )}
                            </div>

                            <Separator />

                            <div>
                                <h4 className="text-lg font-semibold mb-3">Dependents</h4>
                                <div className="space-y-3">
                                    {profile.familyInfo?.dependents?.length > 0 ? (
                                        profile.familyInfo.dependents.map((dependent, index) => (
                                            <div key={index} className="bg-gray-50 p-4 rounded-lg">
                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                                                    <div>
                                                        <p className="font-medium">{dependent.name}</p>
                                                        <p className="text-sm text-gray-500">{dependent.relationship}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-sm">
                                                            <span className="font-medium">Date of Birth: </span>
                                                            {formatDate(dependent.dateOfBirth)}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-gray-500 italic">No dependents on file</p>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Documents Tab */}
                <TabsContent value="documents" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <FileText className="w-5 h-5 mr-2" />
                                Employee Documents
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {profile.documents && profile.documents.length > 0 ? (
                                <div className="space-y-4">
                                    <div className="grid gap-4">
                                        {profile.documents.map((doc) => (
                                            <div key={doc.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                                                <div className="flex items-center space-x-3">
                                                    <div className="p-2 bg-blue-100 rounded-lg">
                                                        <FileText className="w-5 h-5 text-blue-600" />
                                                    </div>
                                                    <div>
                                                        <h4 className="font-medium text-gray-900">{doc.name}</h4>
                                                        <p className="text-sm text-gray-500">
                                                            {doc.type} • {(doc.size / 1024).toFixed(1)} KB •
                                                            {formatDate(doc.uploadedAt)}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <Button variant="outline" size="sm">
                                                        <Download className="w-4 h-4 mr-2" />
                                                        Download
                                                    </Button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-8">
                                    <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No Documents Uploaded</h3>
                                    <p className="text-gray-600">This employee hasn't uploaded any documents yet.</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
