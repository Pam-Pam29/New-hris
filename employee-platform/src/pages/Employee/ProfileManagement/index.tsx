import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Textarea } from '../../../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '../../../components/ui/avatar';
import { Badge } from '../../../components/ui/badge';
import {
    User,
    Mail,
    Phone,
    MapPin,
    Building,
    CreditCard,
    Users,
    Award,
    Camera,
    Edit,
    Save,
    X,
    Plus,
    Trash2,
    Upload,
    Download,
    Eye,
    Shield,
    Heart,
    Briefcase,
    GraduationCap,
    Star
} from 'lucide-react';
import { EmployeeProfile, PersonalInfo, ContactInfo, BankingInfo, Skill, EmergencyContact, Document } from '../types';

// Get employee profile from Firebase
const getEmployeeProfile = async (employeeId: string): Promise<EmployeeProfile | null> => {
    try {
        const { doc, getDoc } = await import('firebase/firestore');
        const { db } = await import('../../../config/firebase');

        const employeeRef = doc(db, 'employees', employeeId);
        const employeeDoc = await getDoc(employeeRef);

        if (!employeeDoc.exists()) {
            return null;
        }

        const data = employeeDoc.data();
        return {
            id: employeeId,
            personalInfo: data.personalInfo || {
                firstName: 'John',
                lastName: 'Doe',
                middleName: 'Michael',
                dateOfBirth: new Date('1990-05-15'),
                gender: 'male',
                nationality: 'US',
                maritalStatus: 'single',
                nationalId: '123-45-6789',
                passportNumber: 'N12345678',
                driverLicense: 'DL123456789'
            },
            contactInfo: data.contactInfo || {
                email: 'john.doe@company.com',
                workEmail: 'john.doe@company.com',
                phone: '+1 (555) 123-4567',
                workPhone: '+1 (555) 123-4568',
                address: {
                    street: '123 Main Street',
                    city: 'New York',
                    state: 'NY',
                    postalCode: '10001',
                    country: 'USA'
                },
                emergencyContact: {
                    id: 'ec-001',
                    name: 'Jane Doe',
                    relationship: 'Sister',
                    phone: '+1 (555) 987-6543',
                    email: 'jane.doe@email.com',
                    address: '456 Oak Avenue, New York, NY 10002',
                    isPrimary: true
                }
            },
            bankingInfo: data.bankingInfo || {
                bankName: 'Chase Bank',
                accountNumber: '****1234',
                routingNumber: '021000021',
                accountType: 'checking',
                swiftCode: 'CHASUS33',
                iban: 'US64SVBKUS6S3300958879'
            },
            documents: data.documents || [
                {
                    id: 'doc-001',
                    name: 'Driver\'s License',
                    type: 'identity',
                    category: 'identity_verification',
                    url: '/documents/drivers-license.pdf',
                    uploadedAt: new Date('2024-01-15'),
                    status: 'approved',
                    required: true
                },
                {
                    id: 'doc-002',
                    name: 'Passport',
                    type: 'identity',
                    category: 'identity_verification',
                    url: '/documents/passport.pdf',
                    uploadedAt: new Date('2024-01-15'),
                    status: 'approved',
                    required: true
                }
            ],
            skills: data.skills || [
                {
                    id: 'skill-001',
                    name: 'React',
                    category: 'Frontend Development',
                    level: 'advanced',
                    certified: true,
                    certificationDate: new Date('2023-06-15'),
                    expiryDate: new Date('2025-06-15')
                },
                {
                    id: 'skill-002',
                    name: 'TypeScript',
                    category: 'Programming Languages',
                    level: 'intermediate',
                    certified: false
                },
                {
                    id: 'skill-003',
                    name: 'Project Management',
                    category: 'Management',
                    level: 'beginner',
                    certified: true,
                    certificationDate: new Date('2023-03-20')
                }
            ],
            emergencyContacts: data.emergencyContacts || [
                {
                    id: 'ec-001',
                    name: 'Jane Doe',
                    relationship: 'Sister',
                    phone: '+1 (555) 987-6543',
                    email: 'jane.doe@email.com',
                    address: '456 Oak Avenue, New York, NY 10002',
                    isPrimary: true
                },
                {
                    id: 'ec-002',
                    name: 'Robert Smith',
                    relationship: 'Friend',
                    phone: '+1 (555) 456-7890',
                    email: 'robert.smith@email.com',
                    isPrimary: false
                }
            ],
            createdAt: data.createdAt?.toDate() || new Date('2024-01-15'),
            updatedAt: data.updatedAt?.toDate() || new Date('2024-12-10')
        };
    } catch (error) {
        console.error('Error getting employee profile:', error);
        return null;
    }
};

export default function ProfileManagement() {
    const [profile, setProfile] = useState<EmployeeProfile | null>(null);
    const [editing, setEditing] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState<any>({});
    const [employeeId] = useState('EMP123456ABC'); // This would come from auth context

    // Load employee profile on component mount
    useEffect(() => {
        const loadProfile = async () => {
            setLoading(true);
            try {
                const employeeProfile = await getEmployeeProfile(employeeId);
                if (employeeProfile) {
                    setProfile(employeeProfile);
                }
            } catch (error) {
                console.error('Error loading profile:', error);
            } finally {
                setLoading(false);
            }
        };

        loadProfile();
    }, [employeeId]);

    const handleEdit = (section: string) => {
        if (!profile) return;

        setEditing(section);
        // Initialize form data with current values
        switch (section) {
            case 'personal':
                setFormData(profile.personalInfo);
                break;
            case 'contact':
                setFormData(profile.contactInfo);
                break;
            case 'banking':
                setFormData(profile.bankingInfo);
                break;
            default:
                setFormData({});
        }
    };

    const handleSave = async (section: string) => {
        if (!profile) return;

        setLoading(true);
        try {
            // ✅ Use employeeDashboardService for real-time sync
            const { getEmployeeDashboardService } = await import('../services/employeeDashboardService');
            const service = await getEmployeeDashboardService();

            const updateData: any = {};

            // Update profile based on section
            switch (section) {
                case 'personal':
                    updateData.personalInfo = { ...profile.personalInfo, ...formData };
                    break;
                case 'contact':
                    updateData.contactInfo = { ...profile.contactInfo, ...formData };
                    break;
                case 'banking':
                    updateData.bankingInfo = { ...profile.bankingInfo, ...formData };
                    break;
            }

            console.log('📝 Updating profile via sync service:', updateData);
            const updatedProfile = await service.updateEmployeeProfile(employeeId, updateData);

            setProfile(updatedProfile);
            setEditing(null);
            setFormData({});
            console.log('✅ Profile updated successfully');
        } catch (error) {
            console.error('❌ Error saving profile:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        setEditing(null);
        setFormData({});
    };

    const handleInputChange = (field: string, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleAddSkill = () => {
        if (!profile) return;

        const newSkill: Skill = {
            id: `skill-${Date.now()}`,
            name: '',
            category: '',
            level: 'beginner',
            certified: false
        };
        setProfile(prev => prev ? ({
            ...prev,
            skills: [...prev.skills, newSkill]
        }) : null);
    };

    const handleUpdateSkill = (skillId: string, updates: Partial<Skill>) => {
        if (!profile) return;

        setProfile(prev => prev ? ({
            ...prev,
            skills: prev.skills.map(skill =>
                skill.id === skillId ? { ...skill, ...updates } : skill
            )
        }) : null);
    };

    const handleDeleteSkill = (skillId: string) => {
        if (!profile) return;

        setProfile(prev => prev ? ({
            ...prev,
            skills: prev.skills.filter(skill => skill.id !== skillId)
        }) : null);
    };

    const handleAddEmergencyContact = () => {
        if (!profile) return;

        const newContact: EmergencyContact = {
            id: `ec-${Date.now()}`,
            name: '',
            relationship: '',
            phone: '',
            isPrimary: false
        };
        setProfile(prev => prev ? ({
            ...prev,
            emergencyContacts: [...prev.emergencyContacts, newContact]
        }) : null);
    };

    const handleUpdateEmergencyContact = (contactId: string, updates: Partial<EmergencyContact>) => {
        if (!profile) return;

        setProfile(prev => prev ? ({
            ...prev,
            emergencyContacts: prev.emergencyContacts.map(contact =>
                contact.id === contactId ? { ...contact, ...updates } : contact
            )
        }) : null);
    };

    const handleDeleteEmergencyContact = (contactId: string) => {
        if (!profile) return;

        setProfile(prev => prev ? ({
            ...prev,
            emergencyContacts: prev.emergencyContacts.filter(contact => contact.id !== contactId)
        }) : null);
    };

    const getSkillLevelColor = (level: string) => {
        switch (level) {
            case 'beginner': return 'bg-gray-100 text-gray-800';
            case 'intermediate': return 'bg-blue-100 text-blue-800';
            case 'advanced': return 'bg-green-100 text-green-800';
            case 'expert': return 'bg-purple-100 text-purple-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const formatDate = (date: Date) => {
        return new Intl.DateTimeFormat('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        }).format(date);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 p-6">
                <div className="max-w-6xl mx-auto space-y-6">
                    <div className="flex items-center justify-center h-64">
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                            <p className="text-muted-foreground">Loading profile...</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (!profile) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 p-6">
                <div className="max-w-6xl mx-auto space-y-6">
                    <div className="flex items-center justify-center h-64">
                        <div className="text-center">
                            <p className="text-muted-foreground">No profile found</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 p-6">
            <div className="max-w-6xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-foreground">Profile Management</h1>
                        <p className="text-muted-foreground mt-2">
                            Manage your personal information, skills, and emergency contacts
                        </p>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Badge variant="outline">
                            Last updated: {formatDate(profile.updatedAt)}
                        </Badge>
                    </div>
                </div>

                {/* Profile Overview */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                            <User className="h-5 w-5" />
                            <span>Profile Overview</span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center space-x-6">
                            <div className="relative">
                                <Avatar className="h-24 w-24">
                                    <AvatarImage src={profile.personalInfo.profilePhoto} />
                                    <AvatarFallback className="text-lg">
                                        {profile.personalInfo.firstName[0]}{profile.personalInfo.lastName[0]}
                                    </AvatarFallback>
                                </Avatar>
                                <Button
                                    size="sm"
                                    className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full"
                                    variant="outline"
                                >
                                    <Camera className="h-4 w-4" />
                                </Button>
                            </div>
                            <div className="flex-1">
                                <h2 className="text-2xl font-bold">
                                    {profile.personalInfo.firstName} {profile.personalInfo.lastName}
                                </h2>
                                <p className="text-muted-foreground">
                                    {profile.contactInfo.email}
                                </p>
                                <div className="flex items-center space-x-4 mt-2">
                                    <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                                        <Phone className="h-4 w-4" />
                                        <span>{profile.contactInfo.phone}</span>
                                    </div>
                                    <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                                        <MapPin className="h-4 w-4" />
                                        <span>{profile.contactInfo.address.city}, {profile.contactInfo.address.state}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Main Content */}
                <Tabs defaultValue="personal" className="space-y-4">
                    <TabsList className="grid w-full grid-cols-4">
                        <TabsTrigger value="personal">Personal Info</TabsTrigger>
                        <TabsTrigger value="contact">Contact & Address</TabsTrigger>
                        <TabsTrigger value="banking">Banking Info</TabsTrigger>
                        <TabsTrigger value="skills">Skills & Certifications</TabsTrigger>
                    </TabsList>

                    <TabsContent value="personal" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center justify-between">
                                    <div className="flex items-center space-x-2">
                                        <User className="h-5 w-5" />
                                        <span>Personal Information</span>
                                    </div>
                                    {editing !== 'personal' && (
                                        <Button variant="outline" size="sm" onClick={() => handleEdit('personal')}>
                                            <Edit className="h-4 w-4 mr-2" />
                                            Edit
                                        </Button>
                                    )}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {editing === 'personal' ? (
                                    <div className="space-y-4">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <Label htmlFor="firstName">First Name</Label>
                                                <Input
                                                    id="firstName"
                                                    value={formData.firstName || ''}
                                                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                                                />
                                            </div>
                                            <div>
                                                <Label htmlFor="lastName">Last Name</Label>
                                                <Input
                                                    id="lastName"
                                                    value={formData.lastName || ''}
                                                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <Label htmlFor="middleName">Middle Name</Label>
                                            <Input
                                                id="middleName"
                                                value={formData.middleName || ''}
                                                onChange={(e) => handleInputChange('middleName', e.target.value)}
                                            />
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <Label htmlFor="dateOfBirth">Date of Birth</Label>
                                                <Input
                                                    id="dateOfBirth"
                                                    type="date"
                                                    value={formData.dateOfBirth ? new Date(formData.dateOfBirth).toISOString().split('T')[0] : ''}
                                                    onChange={(e) => handleInputChange('dateOfBirth', new Date(e.target.value))}
                                                />
                                            </div>
                                            <div>
                                                <Label htmlFor="gender">Gender</Label>
                                                <Select
                                                    value={formData.gender || ''}
                                                    onValueChange={(value) => handleInputChange('gender', value)}
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select gender" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="male">Male</SelectItem>
                                                        <SelectItem value="female">Female</SelectItem>
                                                        <SelectItem value="other">Other</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <Label htmlFor="nationality">Nationality</Label>
                                                <Input
                                                    id="nationality"
                                                    value={formData.nationality || ''}
                                                    onChange={(e) => handleInputChange('nationality', e.target.value)}
                                                />
                                            </div>
                                            <div>
                                                <Label htmlFor="maritalStatus">Marital Status</Label>
                                                <Select
                                                    value={formData.maritalStatus || ''}
                                                    onValueChange={(value) => handleInputChange('maritalStatus', value)}
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select status" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="single">Single</SelectItem>
                                                        <SelectItem value="married">Married</SelectItem>
                                                        <SelectItem value="divorced">Divorced</SelectItem>
                                                        <SelectItem value="widowed">Widowed</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <Label htmlFor="nationalId">National ID</Label>
                                                <Input
                                                    id="nationalId"
                                                    value={formData.nationalId || ''}
                                                    onChange={(e) => handleInputChange('nationalId', e.target.value)}
                                                />
                                            </div>
                                            <div>
                                                <Label htmlFor="passportNumber">Passport Number</Label>
                                                <Input
                                                    id="passportNumber"
                                                    value={formData.passportNumber || ''}
                                                    onChange={(e) => handleInputChange('passportNumber', e.target.value)}
                                                />
                                            </div>
                                        </div>
                                        <div className="flex justify-end space-x-2">
                                            <Button variant="outline" onClick={handleCancel}>
                                                <X className="h-4 w-4 mr-2" />
                                                Cancel
                                            </Button>
                                            <Button onClick={() => handleSave('personal')} disabled={loading}>
                                                {loading ? (
                                                    <>
                                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                                        Saving...
                                                    </>
                                                ) : (
                                                    <>
                                                        <Save className="h-4 w-4 mr-2" />
                                                        Save Changes
                                                    </>
                                                )}
                                            </Button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-4">
                                            <div>
                                                <Label className="text-sm font-medium text-muted-foreground">Full Name</Label>
                                                <p className="text-lg font-semibold">
                                                    {profile.personalInfo.firstName} {profile.personalInfo.middleName} {profile.personalInfo.lastName}
                                                </p>
                                            </div>
                                            <div>
                                                <Label className="text-sm font-medium text-muted-foreground">Date of Birth</Label>
                                                <p className="text-lg font-semibold">{formatDate(profile.personalInfo.dateOfBirth)}</p>
                                            </div>
                                            <div>
                                                <Label className="text-sm font-medium text-muted-foreground">Gender</Label>
                                                <p className="text-lg font-semibold capitalize">{profile.personalInfo.gender}</p>
                                            </div>
                                        </div>
                                        <div className="space-y-4">
                                            <div>
                                                <Label className="text-sm font-medium text-muted-foreground">Nationality</Label>
                                                <p className="text-lg font-semibold">{profile.personalInfo.nationality}</p>
                                            </div>
                                            <div>
                                                <Label className="text-sm font-medium text-muted-foreground">Marital Status</Label>
                                                <p className="text-lg font-semibold capitalize">{profile.personalInfo.maritalStatus}</p>
                                            </div>
                                            <div>
                                                <Label className="text-sm font-medium text-muted-foreground">National ID</Label>
                                                <p className="text-lg font-semibold">{profile.personalInfo.nationalId}</p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="contact" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center justify-between">
                                    <div className="flex items-center space-x-2">
                                        <Mail className="h-5 w-5" />
                                        <span>Contact Information</span>
                                    </div>
                                    {editing !== 'contact' && (
                                        <Button variant="outline" size="sm" onClick={() => handleEdit('contact')}>
                                            <Edit className="h-4 w-4 mr-2" />
                                            Edit
                                        </Button>
                                    )}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {editing === 'contact' ? (
                                    <div className="space-y-4">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <Label htmlFor="email">Personal Email</Label>
                                                <Input
                                                    id="email"
                                                    type="email"
                                                    value={formData.email || ''}
                                                    onChange={(e) => handleInputChange('email', e.target.value)}
                                                />
                                            </div>
                                            <div>
                                                <Label htmlFor="workEmail">Work Email</Label>
                                                <Input
                                                    id="workEmail"
                                                    type="email"
                                                    value={formData.workEmail || ''}
                                                    onChange={(e) => handleInputChange('workEmail', e.target.value)}
                                                />
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <Label htmlFor="phone">Personal Phone</Label>
                                                <Input
                                                    id="phone"
                                                    value={formData.phone || ''}
                                                    onChange={(e) => handleInputChange('phone', e.target.value)}
                                                />
                                            </div>
                                            <div>
                                                <Label htmlFor="workPhone">Work Phone</Label>
                                                <Input
                                                    id="workPhone"
                                                    value={formData.workPhone || ''}
                                                    onChange={(e) => handleInputChange('workPhone', e.target.value)}
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-4">
                                            <h3 className="text-lg font-semibold">Address</h3>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                    <Label htmlFor="street">Street Address</Label>
                                                    <Input
                                                        id="street"
                                                        value={formData.address?.street || ''}
                                                        onChange={(e) => handleInputChange('address', { ...formData.address, street: e.target.value })}
                                                    />
                                                </div>
                                                <div>
                                                    <Label htmlFor="city">City</Label>
                                                    <Input
                                                        id="city"
                                                        value={formData.address?.city || ''}
                                                        onChange={(e) => handleInputChange('address', { ...formData.address, city: e.target.value })}
                                                    />
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                <div>
                                                    <Label htmlFor="state">State</Label>
                                                    <Input
                                                        id="state"
                                                        value={formData.address?.state || ''}
                                                        onChange={(e) => handleInputChange('address', { ...formData.address, state: e.target.value })}
                                                    />
                                                </div>
                                                <div>
                                                    <Label htmlFor="postalCode">Postal Code</Label>
                                                    <Input
                                                        id="postalCode"
                                                        value={formData.address?.postalCode || ''}
                                                        onChange={(e) => handleInputChange('address', { ...formData.address, postalCode: e.target.value })}
                                                    />
                                                </div>
                                                <div>
                                                    <Label htmlFor="country">Country</Label>
                                                    <Input
                                                        id="country"
                                                        value={formData.address?.country || ''}
                                                        onChange={(e) => handleInputChange('address', { ...formData.address, country: e.target.value })}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex justify-end space-x-2">
                                            <Button variant="outline" onClick={handleCancel}>
                                                <X className="h-4 w-4 mr-2" />
                                                Cancel
                                            </Button>
                                            <Button onClick={() => handleSave('contact')} disabled={loading}>
                                                {loading ? (
                                                    <>
                                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                                        Saving...
                                                    </>
                                                ) : (
                                                    <>
                                                        <Save className="h-4 w-4 mr-2" />
                                                        Save Changes
                                                    </>
                                                )}
                                            </Button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-6">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-4">
                                                <div>
                                                    <Label className="text-sm font-medium text-muted-foreground">Personal Email</Label>
                                                    <p className="text-lg font-semibold">{profile.contactInfo.email}</p>
                                                </div>
                                                <div>
                                                    <Label className="text-sm font-medium text-muted-foreground">Work Email</Label>
                                                    <p className="text-lg font-semibold">{profile.contactInfo.workEmail}</p>
                                                </div>
                                                <div>
                                                    <Label className="text-sm font-medium text-muted-foreground">Personal Phone</Label>
                                                    <p className="text-lg font-semibold">{profile.contactInfo.phone}</p>
                                                </div>
                                                <div>
                                                    <Label className="text-sm font-medium text-muted-foreground">Work Phone</Label>
                                                    <p className="text-lg font-semibold">{profile.contactInfo.workPhone || 'Not provided'}</p>
                                                </div>
                                            </div>
                                            <div className="space-y-4">
                                                <div>
                                                    <Label className="text-sm font-medium text-muted-foreground">Address</Label>
                                                    <p className="text-lg font-semibold">
                                                        {profile.contactInfo.address.street}<br />
                                                        {profile.contactInfo.address.city}, {profile.contactInfo.address.state} {profile.contactInfo.address.postalCode}<br />
                                                        {profile.contactInfo.address.country}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="banking" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center justify-between">
                                    <div className="flex items-center space-x-2">
                                        <CreditCard className="h-5 w-5" />
                                        <span>Banking Information</span>
                                    </div>
                                    {editing !== 'banking' && (
                                        <Button variant="outline" size="sm" onClick={() => handleEdit('banking')}>
                                            <Edit className="h-4 w-4 mr-2" />
                                            Edit
                                        </Button>
                                    )}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {editing === 'banking' ? (
                                    <div className="space-y-4">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <Label htmlFor="bankName">Bank Name</Label>
                                                <Input
                                                    id="bankName"
                                                    value={formData.bankName || ''}
                                                    onChange={(e) => handleInputChange('bankName', e.target.value)}
                                                />
                                            </div>
                                            <div>
                                                <Label htmlFor="accountNumber">Account Number</Label>
                                                <Input
                                                    id="accountNumber"
                                                    value={formData.accountNumber || ''}
                                                    onChange={(e) => handleInputChange('accountNumber', e.target.value)}
                                                />
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <Label htmlFor="routingNumber">Routing Number</Label>
                                                <Input
                                                    id="routingNumber"
                                                    value={formData.routingNumber || ''}
                                                    onChange={(e) => handleInputChange('routingNumber', e.target.value)}
                                                />
                                            </div>
                                            <div>
                                                <Label htmlFor="accountType">Account Type</Label>
                                                <Select
                                                    value={formData.accountType || ''}
                                                    onValueChange={(value) => handleInputChange('accountType', value)}
                                                >
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
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <Label htmlFor="swiftCode">SWIFT Code</Label>
                                                <Input
                                                    id="swiftCode"
                                                    value={formData.swiftCode || ''}
                                                    onChange={(e) => handleInputChange('swiftCode', e.target.value)}
                                                />
                                            </div>
                                            <div>
                                                <Label htmlFor="iban">IBAN</Label>
                                                <Input
                                                    id="iban"
                                                    value={formData.iban || ''}
                                                    onChange={(e) => handleInputChange('iban', e.target.value)}
                                                />
                                            </div>
                                        </div>
                                        <div className="flex justify-end space-x-2">
                                            <Button variant="outline" onClick={handleCancel}>
                                                <X className="h-4 w-4 mr-2" />
                                                Cancel
                                            </Button>
                                            <Button onClick={() => handleSave('banking')} disabled={loading}>
                                                {loading ? (
                                                    <>
                                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                                        Saving...
                                                    </>
                                                ) : (
                                                    <>
                                                        <Save className="h-4 w-4 mr-2" />
                                                        Save Changes
                                                    </>
                                                )}
                                            </Button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-4">
                                            <div>
                                                <Label className="text-sm font-medium text-muted-foreground">Bank Name</Label>
                                                <p className="text-lg font-semibold">{profile.bankingInfo.bankName}</p>
                                            </div>
                                            <div>
                                                <Label className="text-sm font-medium text-muted-foreground">Account Number</Label>
                                                <p className="text-lg font-semibold">{profile.bankingInfo.accountNumber}</p>
                                            </div>
                                            <div>
                                                <Label className="text-sm font-medium text-muted-foreground">Account Type</Label>
                                                <p className="text-lg font-semibold capitalize">{profile.bankingInfo.accountType}</p>
                                            </div>
                                        </div>
                                        <div className="space-y-4">
                                            <div>
                                                <Label className="text-sm font-medium text-muted-foreground">Routing Number</Label>
                                                <p className="text-lg font-semibold">{profile.bankingInfo.routingNumber || 'Not provided'}</p>
                                            </div>
                                            <div>
                                                <Label className="text-sm font-medium text-muted-foreground">SWIFT Code</Label>
                                                <p className="text-lg font-semibold">{profile.bankingInfo.swiftCode || 'Not provided'}</p>
                                            </div>
                                            <div>
                                                <Label className="text-sm font-medium text-muted-foreground">IBAN</Label>
                                                <p className="text-lg font-semibold">{profile.bankingInfo.iban || 'Not provided'}</p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="skills" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center justify-between">
                                    <div className="flex items-center space-x-2">
                                        <Award className="h-5 w-5" />
                                        <span>Skills & Certifications</span>
                                    </div>
                                    <Button variant="outline" size="sm" onClick={handleAddSkill}>
                                        <Plus className="h-4 w-4 mr-2" />
                                        Add Skill
                                    </Button>
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {profile.skills.map((skill) => (
                                        <div key={skill.id} className="flex items-center justify-between p-4 border rounded-lg">
                                            <div className="flex-1">
                                                <div className="flex items-center space-x-3">
                                                    <h3 className="text-lg font-semibold">{skill.name}</h3>
                                                    <Badge className={getSkillLevelColor(skill.level)}>
                                                        {skill.level}
                                                    </Badge>
                                                    {skill.certified && (
                                                        <Badge variant="outline" className="text-green-600">
                                                            <Shield className="h-3 w-3 mr-1" />
                                                            Certified
                                                        </Badge>
                                                    )}
                                                </div>
                                                <p className="text-sm text-muted-foreground mt-1">{skill.category}</p>
                                                {skill.certified && skill.certificationDate && (
                                                    <p className="text-xs text-muted-foreground mt-1">
                                                        Certified: {formatDate(skill.certificationDate)}
                                                        {skill.expiryDate && ` • Expires: ${formatDate(skill.expiryDate)}`}
                                                    </p>
                                                )}
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <Button size="sm" variant="outline">
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                                <Button size="sm" variant="outline" onClick={() => handleDeleteSkill(skill.id)}>
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Emergency Contacts */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center justify-between">
                                    <div className="flex items-center space-x-2">
                                        <Users className="h-5 w-5" />
                                        <span>Emergency Contacts</span>
                                    </div>
                                    <Button variant="outline" size="sm" onClick={handleAddEmergencyContact}>
                                        <Plus className="h-4 w-4 mr-2" />
                                        Add Contact
                                    </Button>
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {profile.emergencyContacts.map((contact) => (
                                        <div key={contact.id} className="flex items-center justify-between p-4 border rounded-lg">
                                            <div className="flex-1">
                                                <div className="flex items-center space-x-3">
                                                    <h3 className="text-lg font-semibold">{contact.name}</h3>
                                                    <Badge variant="outline">{contact.relationship}</Badge>
                                                    {contact.isPrimary && (
                                                        <Badge variant="default" className="bg-blue-600">
                                                            Primary
                                                        </Badge>
                                                    )}
                                                </div>
                                                <div className="space-y-1 mt-2">
                                                    <p className="text-sm text-muted-foreground">
                                                        <Phone className="h-3 w-3 inline mr-1" />
                                                        {contact.phone}
                                                    </p>
                                                    {contact.email && (
                                                        <p className="text-sm text-muted-foreground">
                                                            <Mail className="h-3 w-3 inline mr-1" />
                                                            {contact.email}
                                                        </p>
                                                    )}
                                                    {contact.address && (
                                                        <p className="text-sm text-muted-foreground">
                                                            <MapPin className="h-3 w-3 inline mr-1" />
                                                            {contact.address}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <Button size="sm" variant="outline">
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                                <Button size="sm" variant="outline" onClick={() => handleDeleteEmergencyContact(contact.id)}>
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}
