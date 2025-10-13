import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import {
    Search,
    Filter,
    Users,
    UserPlus,
    Download,
    Upload,
    CheckCircle,
    AlertCircle,
    Clock,
    TrendingUp,
    Eye,
    Edit
} from 'lucide-react';
import EmployeeProfileSummary from './EmployeeProfileSummary';

interface Employee {
    id: string;
    personalInfo: {
        firstName: string;
        lastName: string;
        dateOfBirth?: string;
    };
    contactInfo: {
        personalEmail: string;
        workEmail: string;
        phone: string;
    };
    workInfo: {
        position: string;
        department: string;
        hireDate: string;
    };
    profileStatus: {
        completeness: number;
        status: 'draft' | 'pending_review' | 'approved' | 'needs_update';
        lastUpdated: string;
    };
    leaveBalance?: {
        total: number;
        used: number;
        remaining: number;
    };
    performanceScore?: number;
    recentActivity?: Array<{
        type: string;
        description: string;
        timestamp: string;
    }>;
}

export function HrEmployeeManagement() {
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedDepartment, setSelectedDepartment] = useState('all');
    const [selectedStatus, setSelectedStatus] = useState('all');
    const [activeTab, setActiveTab] = useState('overview');

    // Sample data - in real implementation, this would come from the data flow service
    useEffect(() => {
        const sampleEmployees: Employee[] = [
            {
                id: 'emp-001',
                personalInfo: {
                    firstName: 'John',
                    lastName: 'Doe',
                    dateOfBirth: '1990-05-15'
                },
                contactInfo: {
                    personalEmail: 'john.doe@email.com',
                    workEmail: 'john.doe@company.com',
                    phone: '+1 (555) 123-4567'
                },
                workInfo: {
                    position: 'Senior Software Developer',
                    department: 'Engineering',
                    hireDate: '2022-01-15'
                },
                profileStatus: {
                    completeness: 85,
                    status: 'approved',
                    lastUpdated: new Date().toISOString()
                },
                leaveBalance: {
                    total: 20,
                    used: 8,
                    remaining: 12
                },
                performanceScore: 92,
                recentActivity: [
                    {
                        type: 'profile_update',
                        description: 'Updated personal information',
                        timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
                    },
                    {
                        type: 'leave_request',
                        description: 'Submitted vacation request',
                        timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
                    }
                ]
            },
            {
                id: 'emp-002',
                personalInfo: {
                    firstName: 'Jane',
                    lastName: 'Smith',
                    dateOfBirth: '1988-08-22'
                },
                contactInfo: {
                    personalEmail: 'jane.smith@email.com',
                    workEmail: 'jane.smith@company.com',
                    phone: '+1 (555) 987-6543'
                },
                workInfo: {
                    position: 'Marketing Manager',
                    department: 'Marketing',
                    hireDate: '2021-06-10'
                },
                profileStatus: {
                    completeness: 65,
                    status: 'needs_update',
                    lastUpdated: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
                },
                leaveBalance: {
                    total: 20,
                    used: 15,
                    remaining: 5
                },
                performanceScore: 78,
                recentActivity: [
                    {
                        type: 'policy_acknowledgment',
                        description: 'Acknowledged new company policy',
                        timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
                    }
                ]
            },
            {
                id: 'emp-003',
                personalInfo: {
                    firstName: 'Mike',
                    lastName: 'Johnson',
                    dateOfBirth: '1992-03-18'
                },
                contactInfo: {
                    personalEmail: 'mike.johnson@email.com',
                    workEmail: 'mike.johnson@company.com',
                    phone: '+1 (555) 456-7890'
                },
                workInfo: {
                    position: 'HR Specialist',
                    department: 'Human Resources',
                    hireDate: '2023-02-01'
                },
                profileStatus: {
                    completeness: 45,
                    status: 'draft',
                    lastUpdated: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
                },
                leaveBalance: {
                    total: 20,
                    used: 2,
                    remaining: 18
                },
                performanceScore: 85,
                recentActivity: [
                    {
                        type: 'profile_update',
                        description: 'Started profile setup',
                        timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
                    }
                ]
            }
        ];

        setEmployees(sampleEmployees);
        setLoading(false);
    }, []);

    // Filter employees based on search and filters
    const filteredEmployees = employees.filter(employee => {
        const matchesSearch =
            employee.personalInfo.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            employee.personalInfo.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            employee.workInfo.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
            employee.contactInfo.workEmail.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesDepartment = selectedDepartment === 'all' || employee.workInfo.department === selectedDepartment;
        const matchesStatus = selectedStatus === 'all' || employee.profileStatus.status === selectedStatus;

        return matchesSearch && matchesDepartment && matchesStatus;
    });

    // Get unique departments
    const departments = Array.from(new Set(employees.map(emp => emp.workInfo.department)));

    // Calculate statistics
    const stats = {
        total: employees.length,
        approved: employees.filter(emp => emp.profileStatus.status === 'approved').length,
        pendingReview: employees.filter(emp => emp.profileStatus.status === 'pending_review').length,
        needsUpdate: employees.filter(emp => emp.profileStatus.status === 'needs_update').length,
        averageCompleteness: Math.round(employees.reduce((sum, emp) => sum + emp.profileStatus.completeness, 0) / employees.length),
        averagePerformance: Math.round(employees.reduce((sum, emp) => sum + (emp.performanceScore || 0), 0) / employees.length)
    };

    if (loading) {
        return (
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold">Employee Management</h2>
                </div>
                <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Loading employee data...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold">Employee Management</h2>
                    <p className="text-muted-foreground">Manage employee profiles and track completion status</p>
                </div>
                <div className="flex space-x-2">
                    <Button variant="outline">
                        <Download className="h-4 w-4 mr-2" />
                        Export
                    </Button>
                    <Button>
                        <UserPlus className="h-4 w-4 mr-2" />
                        Add Employee
                    </Button>
                </div>
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center space-x-4">
                            <div className="p-2 bg-blue-100 rounded-lg">
                                <Users className="h-6 w-6 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">{stats.total}</p>
                                <p className="text-sm text-muted-foreground">Total Employees</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center space-x-4">
                            <div className="p-2 bg-green-100 rounded-lg">
                                <CheckCircle className="h-6 w-6 text-green-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">{stats.approved}</p>
                                <p className="text-sm text-muted-foreground">Approved Profiles</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center space-x-4">
                            <div className="p-2 bg-yellow-100 rounded-lg">
                                <Clock className="h-6 w-6 text-yellow-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">{stats.pendingReview}</p>
                                <p className="text-sm text-muted-foreground">Pending Review</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center space-x-4">
                            <div className="p-2 bg-red-100 rounded-lg">
                                <AlertCircle className="h-6 w-6 text-red-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">{stats.needsUpdate}</p>
                                <p className="text-sm text-muted-foreground">Needs Update</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Filters and Search */}
            <Card>
                <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search employees by name, position, or email..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <select
                                value={selectedDepartment}
                                onChange={(e) => setSelectedDepartment(e.target.value)}
                                className="px-3 py-2 border border-input bg-background rounded-md text-sm"
                            >
                                <option value="all">All Departments</option>
                                {departments.map(dept => (
                                    <option key={dept} value={dept}>{dept}</option>
                                ))}
                            </select>
                            <select
                                value={selectedStatus}
                                onChange={(e) => setSelectedStatus(e.target.value)}
                                className="px-3 py-2 border border-input bg-background rounded-md text-sm"
                            >
                                <option value="all">All Status</option>
                                <option value="approved">Approved</option>
                                <option value="pending_review">Pending Review</option>
                                <option value="needs_update">Needs Update</option>
                                <option value="draft">Draft</option>
                            </select>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Employee Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredEmployees.map(employee => (
                    <EmployeeProfileSummary
                        key={employee.id}
                        employeeId={employee.id}
                        profile={employee}
                        leaveBalance={employee.leaveBalance}
                        performanceScore={employee.performanceScore}
                        recentActivity={employee.recentActivity}
                    />
                ))}
            </div>

            {filteredEmployees.length === 0 && (
                <Card>
                    <CardContent className="p-12 text-center">
                        <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                        <h3 className="text-lg font-semibold mb-2">No employees found</h3>
                        <p className="text-muted-foreground">
                            Try adjusting your search criteria or filters to find employees.
                        </p>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}

export default HrEmployeeManagement;
