import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { useToast } from '../hooks/use-toast';
import { getComprehensiveDataFlowService } from '../services/comprehensiveDataFlowService';
import { clearFirebaseCollections, clearSpecificEmployee } from '../utils/clearFirebaseData';
import { UserPlus, Trash2, Database } from 'lucide-react';

const CreateTestProfile: React.FC = () => {
    const [formData, setFormData] = useState({
        employeeId: '',
        firstName: '',
        lastName: '',
        email: '',
        position: '',
        department: ''
    });
    const [isCreating, setIsCreating] = useState(false);
    const [isClearing, setIsClearing] = useState(false);
    const { toast } = useToast();

    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const createProfile = async () => {
        if (!formData.employeeId || !formData.firstName || !formData.lastName) {
            toast({
                title: "Missing Information",
                description: "Please fill in Employee ID, First Name, and Last Name",
                variant: "destructive"
            });
            return;
        }

        setIsCreating(true);
        try {
            const service = await getComprehensiveDataFlowService();

            const profileData = {
                personalInfo: {
                    firstName: formData.firstName,
                    lastName: formData.lastName,
                    dateOfBirth: new Date('1990-01-01') // Default date
                },
                contactInfo: {
                    personalEmail: formData.email,
                    workEmail: formData.email,
                    personalPhone: '+1234567890',
                    workPhone: '+1234567890',
                    address: {
                        street: '123 Test St',
                        city: 'Test City',
                        state: 'CA',
                        zipCode: '12345',
                        country: 'USA'
                    },
                    emergencyContacts: []
                },
                workInfo: {
                    position: formData.position || 'Test Position',
                    department: formData.department || 'Test Department',
                    hireDate: new Date(),
                    employmentType: 'Full-time',
                    workLocation: 'Office',
                    workSchedule: '9-5',
                    salary: {
                        baseSalary: 50000,
                        currency: 'USD',
                        payFrequency: 'Monthly'
                    }
                },
                bankingInfo: {
                    bankName: 'Test Bank',
                    accountNumber: '****1234',
                    routingNumber: '123456789',
                    accountType: 'Checking',
                    salaryPaymentMethod: 'Direct Deposit',
                    taxInformation: {
                        exemptions: 1
                    }
                },
                skills: [],
                familyInfo: {
                    dependents: [],
                    beneficiaries: []
                }
            };

            await service.updateEmployeeProfile(formData.employeeId, profileData);

            toast({
                title: "Success!",
                description: `Profile created for ${formData.firstName} ${formData.lastName} (ID: ${formData.employeeId})`
            });

            // Clear form
            setFormData({
                employeeId: '',
                firstName: '',
                lastName: '',
                email: '',
                position: '',
                department: ''
            });

        } catch (error) {
            console.error('Error creating profile:', error);
            toast({
                title: "Error",
                description: "Failed to create profile. Check console for details.",
                variant: "destructive"
            });
        } finally {
            setIsCreating(false);
        }
    };

    const clearAllData = async () => {
        setIsClearing(true);
        try {
            await clearFirebaseCollections();
            toast({
                title: "Data Cleared",
                description: "All Firebase collections have been cleared"
            });
        } catch (error) {
            console.error('Error clearing data:', error);
            toast({
                title: "Error",
                description: "Failed to clear data. Check console for details.",
                variant: "destructive"
            });
        } finally {
            setIsClearing(false);
        }
    };

    return (
        <Card className="w-full max-w-2xl">
            <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                    <UserPlus className="w-5 h-5" />
                    <span>Create Test Profile</span>
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="employeeId">Employee ID *</Label>
                        <Input
                            id="employeeId"
                            value={formData.employeeId}
                            onChange={(e) => handleInputChange('employeeId', e.target.value)}
                            placeholder="e.g., EMP001"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="firstName">First Name *</Label>
                        <Input
                            id="firstName"
                            value={formData.firstName}
                            onChange={(e) => handleInputChange('firstName', e.target.value)}
                            placeholder="John"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="lastName">Last Name *</Label>
                        <Input
                            id="lastName"
                            value={formData.lastName}
                            onChange={(e) => handleInputChange('lastName', e.target.value)}
                            placeholder="Doe"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            type="email"
                            value={formData.email}
                            onChange={(e) => handleInputChange('email', e.target.value)}
                            placeholder="john.doe@company.com"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="position">Position</Label>
                        <Input
                            id="position"
                            value={formData.position}
                            onChange={(e) => handleInputChange('position', e.target.value)}
                            placeholder="Software Developer"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="department">Department</Label>
                        <Input
                            id="department"
                            value={formData.department}
                            onChange={(e) => handleInputChange('department', e.target.value)}
                            placeholder="Engineering"
                        />
                    </div>
                </div>

                <div className="flex justify-between pt-4">
                    <Button
                        variant="destructive"
                        onClick={clearAllData}
                        disabled={isClearing}
                        className="flex items-center space-x-2"
                    >
                        <Trash2 className="w-4 h-4" />
                        <span>{isClearing ? 'Clearing...' : 'Clear All Data'}</span>
                    </Button>

                    <Button
                        onClick={createProfile}
                        disabled={isCreating}
                        className="flex items-center space-x-2"
                    >
                        <UserPlus className="w-4 h-4" />
                        <span>{isCreating ? 'Creating...' : 'Create Profile'}</span>
                    </Button>
                </div>

                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center space-x-2">
                        <Database className="w-5 h-5 text-blue-600" />
                        <span className="font-medium text-blue-800">Testing Instructions</span>
                    </div>
                    <ul className="text-blue-700 text-sm mt-2 space-y-1">
                        <li>1. Clear all data first to start fresh</li>
                        <li>2. Create a test profile with the form above</li>
                        <li>3. Open both HR Dashboard (port 3001) and Employee Dashboard (port 3002)</li>
                        <li>4. Test real-time sync by editing the profile in either platform</li>
                        <li>5. Check browser console for Firebase connection status</li>
                    </ul>
                </div>
            </CardContent>
        </Card>
    );
};

export default CreateTestProfile;

