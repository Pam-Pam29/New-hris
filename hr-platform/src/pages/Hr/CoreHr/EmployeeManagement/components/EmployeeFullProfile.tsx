import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    User,
    Mail,
    Phone,
    MapPin,
    Building,
    CreditCard,
    Users,
    Award,
    Briefcase,
    GraduationCap,
    Star,
    Calendar,
    Shield,
    FileText,
    Heart
} from 'lucide-react';
import type { Employee } from '../types';

interface EmployeeFullProfileProps {
    employee: Employee;
}

export const EmployeeFullProfile: React.FC<EmployeeFullProfileProps> = ({ employee }) => {
    const formatDate = (date: Date | string) => {
        if (typeof date === 'string') return date;
        return date.toLocaleDateString();
    };

    const getSkillLevelColor = (level: string) => {
        switch (level) {
            case 'beginner': return 'bg-yellow-100 text-yellow-800';
            case 'intermediate': return 'bg-blue-100 text-blue-800';
            case 'advanced': return 'bg-green-100 text-green-800';
            case 'expert': return 'bg-purple-100 text-purple-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <Card>
                <CardHeader>
                    <div className="flex items-center space-x-4">
                        <Avatar className="w-20 h-20">
                            <AvatarImage src={employee.avatar} alt={employee.name} />
                            <AvatarFallback className="text-lg">
                                {employee.name.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                            <CardTitle className="text-2xl">{employee.name}</CardTitle>
                            <CardDescription className="text-lg">
                                {employee.role} • {employee.department}
                            </CardDescription>
                            <div className="flex items-center space-x-4 mt-2">
                                <Badge variant={employee.status === 'active' ? 'default' : 'secondary'}>
                                    {employee.status}
                                </Badge>
                                <Badge variant="outline">{employee.employmentType}</Badge>
                                {employee.employeeId && (
                                    <Badge variant="outline">ID: {employee.employeeId}</Badge>
                                )}
                            </div>
                        </div>
                    </div>
                </CardHeader>
            </Card>

            {/* Tabs */}
            <Tabs defaultValue="personal" className="w-full">
                <TabsList className="grid w-full grid-cols-5">
                    <TabsTrigger value="personal">Personal</TabsTrigger>
                    <TabsTrigger value="contact">Contact</TabsTrigger>
                    <TabsTrigger value="employment">Employment</TabsTrigger>
                    <TabsTrigger value="skills">Skills</TabsTrigger>
                    <TabsTrigger value="emergency">Emergency</TabsTrigger>
                </TabsList>

                {/* Personal Information */}
                <TabsContent value="personal" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center space-x-2">
                                <User className="h-5 w-5" />
                                <span>Personal Information</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {employee.personalInfo ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">Full Name</label>
                                        <p className="text-sm">
                                            {employee.personalInfo.firstName} {employee.personalInfo.middleName} {employee.personalInfo.lastName}
                                        </p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">Date of Birth</label>
                                        <p className="text-sm">{formatDate(employee.personalInfo.dateOfBirth)}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">Gender</label>
                                        <p className="text-sm capitalize">{employee.personalInfo.gender}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">Nationality</label>
                                        <p className="text-sm">{employee.personalInfo.nationality}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">Marital Status</label>
                                        <p className="text-sm capitalize">{employee.personalInfo.maritalStatus}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">National ID</label>
                                        <p className="text-sm">{employee.personalInfo.nationalId}</p>
                                    </div>
                                    {employee.personalInfo.passportNumber && (
                                        <div>
                                            <label className="text-sm font-medium text-gray-500">Passport Number</label>
                                            <p className="text-sm">{employee.personalInfo.passportNumber}</p>
                                        </div>
                                    )}
                                    {employee.personalInfo.driverLicense && (
                                        <div>
                                            <label className="text-sm font-medium text-gray-500">Driver's License</label>
                                            <p className="text-sm">{employee.personalInfo.driverLicense}</p>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">Name</label>
                                        <p className="text-sm">{employee.name}</p>
                                    </div>
                                    {employee.dob && (
                                        <div>
                                            <label className="text-sm font-medium text-gray-500">Date of Birth</label>
                                            <p className="text-sm">{employee.dob}</p>
                                        </div>
                                    )}
                                    {employee.gender && (
                                        <div>
                                            <label className="text-sm font-medium text-gray-500">Gender</label>
                                            <p className="text-sm capitalize">{employee.gender}</p>
                                        </div>
                                    )}
                                    {employee.nationalId && (
                                        <div>
                                            <label className="text-sm font-medium text-gray-500">National ID</label>
                                            <p className="text-sm">{employee.nationalId}</p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Contact Information */}
                <TabsContent value="contact" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center space-x-2">
                                <Mail className="h-5 w-5" />
                                <span>Contact Information</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {employee.contactInfo ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">Personal Email</label>
                                        <p className="text-sm">{employee.contactInfo.email}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">Work Email</label>
                                        <p className="text-sm">{employee.contactInfo.workEmail}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">Phone</label>
                                        <p className="text-sm">{employee.contactInfo.phone}</p>
                                    </div>
                                    {employee.contactInfo.workPhone && (
                                        <div>
                                            <label className="text-sm font-medium text-gray-500">Work Phone</label>
                                            <p className="text-sm">{employee.contactInfo.workPhone}</p>
                                        </div>
                                    )}
                                    <div className="md:col-span-2">
                                        <label className="text-sm font-medium text-gray-500">Address</label>
                                        <p className="text-sm">
                                            {employee.contactInfo.address.street}<br />
                                            {employee.contactInfo.address.city}, {employee.contactInfo.address.state} {employee.contactInfo.address.postalCode}<br />
                                            {employee.contactInfo.address.country}
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {employee.email && (
                                        <div>
                                            <label className="text-sm font-medium text-gray-500">Email</label>
                                            <p className="text-sm">{employee.email}</p>
                                        </div>
                                    )}
                                    {employee.workEmail && (
                                        <div>
                                            <label className="text-sm font-medium text-gray-500">Work Email</label>
                                            <p className="text-sm">{employee.workEmail}</p>
                                        </div>
                                    )}
                                    {employee.phone && (
                                        <div>
                                            <label className="text-sm font-medium text-gray-500">Phone</label>
                                            <p className="text-sm">{employee.phone}</p>
                                        </div>
                                    )}
                                    {employee.address && (
                                        <div>
                                            <label className="text-sm font-medium text-gray-500">Address</label>
                                            <p className="text-sm">{employee.address}</p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Banking Information */}
                    {employee.bankingInfo && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center space-x-2">
                                    <CreditCard className="h-5 w-5" />
                                    <span>Banking Information</span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">Bank Name</label>
                                        <p className="text-sm">{employee.bankingInfo.bankName}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">Account Type</label>
                                        <p className="text-sm capitalize">{employee.bankingInfo.accountType}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">Account Number</label>
                                        <p className="text-sm">****{employee.bankingInfo.accountNumber.slice(-4)}</p>
                                    </div>
                                    {employee.bankingInfo.routingNumber && (
                                        <div>
                                            <label className="text-sm font-medium text-gray-500">Routing Number</label>
                                            <p className="text-sm">****{employee.bankingInfo.routingNumber.slice(-4)}</p>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </TabsContent>

                {/* Employment Information */}
                <TabsContent value="employment" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center space-x-2">
                                <Briefcase className="h-5 w-5" />
                                <span>Employment Information</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium text-gray-500">Position</label>
                                    <p className="text-sm">{employee.role}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-500">Department</label>
                                    <p className="text-sm">{employee.department}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-500">Employment Type</label>
                                    <p className="text-sm">{employee.employmentType}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-500">Status</label>
                                    <Badge variant={employee.status === 'active' ? 'default' : 'secondary'}>
                                        {employee.status}
                                    </Badge>
                                </div>
                                {employee.dateStarted && (
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">Start Date</label>
                                        <p className="text-sm">{employee.dateStarted}</p>
                                    </div>
                                )}
                                {employee.manager && (
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">Manager</label>
                                        <p className="text-sm">{employee.manager}</p>
                                    </div>
                                )}
                                {employee.location && (
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">Location</label>
                                        <p className="text-sm">{employee.location}</p>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Skills */}
                <TabsContent value="skills" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center space-x-2">
                                <Award className="h-5 w-5" />
                                <span>Skills & Certifications</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {employee.skills && employee.skills.length > 0 ? (
                                <div className="space-y-4">
                                    {employee.skills.map((skill) => (
                                        <div key={skill.id} className="border rounded-lg p-4">
                                            <div className="flex items-center justify-between mb-2">
                                                <h4 className="font-medium">{skill.name}</h4>
                                                <Badge className={getSkillLevelColor(skill.level)}>
                                                    {skill.level}
                                                </Badge>
                                            </div>
                                            <p className="text-sm text-gray-600 mb-2">{skill.category}</p>
                                            {skill.certified && (
                                                <div className="flex items-center space-x-2">
                                                    <Shield className="h-4 w-4 text-green-600" />
                                                    <span className="text-sm text-green-600">Certified</span>
                                                    {skill.certificationDate && (
                                                        <span className="text-sm text-gray-500">
                                                            • {formatDate(skill.certificationDate)}
                                                        </span>
                                                    )}
                                                    {skill.expiryDate && (
                                                        <span className="text-sm text-gray-500">
                                                            • Expires: {formatDate(skill.expiryDate)}
                                                        </span>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-gray-500 text-center py-8">No skills recorded</p>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Emergency Contacts */}
                <TabsContent value="emergency" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center space-x-2">
                                <Heart className="h-5 w-5" />
                                <span>Emergency Contacts</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {employee.emergencyContacts && employee.emergencyContacts.length > 0 ? (
                                <div className="space-y-4">
                                    {employee.emergencyContacts.map((contact) => (
                                        <div key={contact.id} className="border rounded-lg p-4">
                                            <div className="flex items-center justify-between mb-2">
                                                <h4 className="font-medium">{contact.name}</h4>
                                                {contact.isPrimary && (
                                                    <Badge variant="default">Primary</Badge>
                                                )}
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                                                <div>
                                                    <span className="text-gray-500">Relationship: </span>
                                                    <span>{contact.relationship}</span>
                                                </div>
                                                <div>
                                                    <span className="text-gray-500">Phone: </span>
                                                    <span>{contact.phone}</span>
                                                </div>
                                                {contact.email && (
                                                    <div>
                                                        <span className="text-gray-500">Email: </span>
                                                        <span>{contact.email}</span>
                                                    </div>
                                                )}
                                                {contact.address && (
                                                    <div>
                                                        <span className="text-gray-500">Address: </span>
                                                        <span>{contact.address}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : employee.emergencyContact ? (
                                <div className="border rounded-lg p-4">
                                    <h4 className="font-medium mb-2">{employee.emergencyContact.name}</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                                        <div>
                                            <span className="text-gray-500">Relationship: </span>
                                            <span>{employee.emergencyContact.relationship}</span>
                                        </div>
                                        <div>
                                            <span className="text-gray-500">Phone: </span>
                                            <span>{employee.emergencyContact.phone}</span>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <p className="text-gray-500 text-center py-8">No emergency contacts recorded</p>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
};

