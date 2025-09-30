import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import {
    Search,
    Users,
    UserPlus,
    Download,
    CheckCircle,
    AlertCircle,
    Clock,
    Eye,
    ExternalLink,
    User,
    Mail,
    Phone,
    Building,
    Calendar,
    MapPin
} from 'lucide-react';

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
    const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);

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

    const handleViewDetails = (employee: Employee) => {
        setSelectedEmployee(employee);
        setIsDialogOpen(true);
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'approved':
                return <Badge className="bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 mr-1" />Approved</Badge>;
            case 'pending_review':
                return <Badge className="bg-yellow-100 text-yellow-800"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
            case 'needs_update':
                return <Badge className="bg-red-100 text-red-800"><AlertCircle className="h-3 w-3 mr-1" />Needs Update</Badge>;
            default:
                return <Badge variant="outline">Draft</Badge>;
        }
    };

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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 hover:shadow-lg transition-all duration-300">
                    <CardContent className="p-8">
                        <div className="flex items-center space-x-6">
                            <div className="p-4 bg-blue-500 rounded-xl shadow-md">
                                <Users className="h-8 w-8 text-white" />
                            </div>
                            <div>
                                <p className="text-3xl font-bold text-blue-900">{stats.total}</p>
                                <p className="text-base text-blue-700 font-medium">Total Employees</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-green-50 to-emerald-100 border-green-200 hover:shadow-lg transition-all duration-300">
                    <CardContent className="p-8">
                        <div className="flex items-center space-x-6">
                            <div className="p-4 bg-green-500 rounded-xl shadow-md">
                                <CheckCircle className="h-8 w-8 text-white" />
                            </div>
                            <div>
                                <p className="text-3xl font-bold text-green-900">{stats.approved}</p>
                                <p className="text-base text-green-700 font-medium">Approved Profiles</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-yellow-50 to-orange-100 border-yellow-200 hover:shadow-lg transition-all duration-300">
                    <CardContent className="p-8">
                        <div className="flex items-center space-x-6">
                            <div className="p-4 bg-yellow-500 rounded-xl shadow-md">
                                <Clock className="h-8 w-8 text-white" />
                            </div>
                            <div>
                                <p className="text-3xl font-bold text-yellow-900">{stats.pendingReview}</p>
                                <p className="text-base text-yellow-700 font-medium">Pending Review</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-red-50 to-rose-100 border-red-200 hover:shadow-lg transition-all duration-300">
                    <CardContent className="p-8">
                        <div className="flex items-center space-x-6">
                            <div className="p-4 bg-red-500 rounded-xl shadow-md">
                                <AlertCircle className="h-8 w-8 text-white" />
                            </div>
                            <div>
                                <p className="text-3xl font-bold text-red-900">{stats.needsUpdate}</p>
                                <p className="text-base text-red-700 font-medium">Needs Update</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Filters and Search */}
            <Card className="bg-gradient-to-r from-gray-50 to-blue-50 border-gray-200 shadow-lg">
                <CardContent className="p-8">
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

            {/* Employee Table */}
            <Card className="bg-white shadow-lg border-0">
                <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
                    <CardTitle className="text-2xl font-bold text-gray-800">Employee Directory</CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Employee ID</TableHead>
                                <TableHead>Name</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredEmployees.map((employee) => (
                                <TableRow key={employee.id}>
                                    <TableCell className="font-mono text-sm">{employee.id}</TableCell>
                                    <TableCell className="font-medium">
                                        {employee.personalInfo.firstName} {employee.personalInfo.lastName}
                                    </TableCell>
                                    <TableCell>{employee.contactInfo.workEmail}</TableCell>
                                    <TableCell>{getStatusBadge(employee.profileStatus.status)}</TableCell>
                                    <TableCell>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleViewDetails(employee)}
                                        >
                                            <Eye className="h-4 w-4 mr-2" />
                                            View Details
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

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

            {/* Employee Details Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Employee Details</DialogTitle>
                        <DialogDescription>
                            View detailed information for {selectedEmployee?.personalInfo.firstName} {selectedEmployee?.personalInfo.lastName}
                        </DialogDescription>
                    </DialogHeader>

                    {selectedEmployee && (
                        <div className="space-y-6">
                            {/* Basic Information */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-3">
                                    <div className="flex items-center space-x-3">
                                        <User className="h-4 w-4 text-muted-foreground" />
                                        <div>
                                            <p className="text-sm font-medium">Full Name</p>
                                            <p className="text-sm text-muted-foreground">
                                                {selectedEmployee.personalInfo.firstName} {selectedEmployee.personalInfo.lastName}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center space-x-3">
                                        <Mail className="h-4 w-4 text-muted-foreground" />
                                        <div>
                                            <p className="text-sm font-medium">Work Email</p>
                                            <p className="text-sm text-muted-foreground">{selectedEmployee.contactInfo.workEmail}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center space-x-3">
                                        <Phone className="h-4 w-4 text-muted-foreground" />
                                        <div>
                                            <p className="text-sm font-medium">Phone</p>
                                            <p className="text-sm text-muted-foreground">{selectedEmployee.contactInfo.phone}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <div className="flex items-center space-x-3">
                                        <Building className="h-4 w-4 text-muted-foreground" />
                                        <div>
                                            <p className="text-sm font-medium">Department</p>
                                            <p className="text-sm text-muted-foreground">{selectedEmployee.workInfo.department}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center space-x-3">
                                        <User className="h-4 w-4 text-muted-foreground" />
                                        <div>
                                            <p className="text-sm font-medium">Position</p>
                                            <p className="text-sm text-muted-foreground">{selectedEmployee.workInfo.position}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center space-x-3">
                                        <Calendar className="h-4 w-4 text-muted-foreground" />
                                        <div>
                                            <p className="text-sm font-medium">Hire Date</p>
                                            <p className="text-sm text-muted-foreground">
                                                {new Date(selectedEmployee.workInfo.hireDate).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Status and Performance */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm font-medium mb-2">Profile Status</p>
                                    <div className="flex items-center space-x-2">
                                        {getStatusBadge(selectedEmployee.profileStatus.status)}
                                        <span className="text-sm text-muted-foreground">
                                            {selectedEmployee.profileStatus.completeness}% complete
                                        </span>
                                    </div>
                                </div>

                                {selectedEmployee.performanceScore && (
                                    <div>
                                        <p className="text-sm font-medium mb-2">Performance Score</p>
                                        <div className="flex items-center space-x-2">
                                            <span className="text-lg font-semibold">{selectedEmployee.performanceScore}/100</span>
                                            <div className="flex-1 bg-gray-200 rounded-full h-2">
                                                <div
                                                    className="bg-blue-600 h-2 rounded-full"
                                                    style={{ width: `${selectedEmployee.performanceScore}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Actions */}
                            <div className="flex justify-end space-x-2 pt-4 border-t">
                                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                                    Close
                                </Button>
                                <Button>
                                    <ExternalLink className="h-4 w-4 mr-2" />
                                    View Full Profile
                                </Button>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}

export default HrEmployeeManagement;
