import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Textarea } from '../../../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../components/ui/tabs';
import {
    DollarSign,
    CreditCard,
    TrendingUp,
    Download,
    Upload,
    FileText,
    Calendar,
    CheckCircle,
    Clock,
    AlertCircle,
    Plus,
    Eye,
    Edit,
    Trash2,
    Banknote,
    Receipt,
    PieChart,
    BarChart3,
    LineChart,
    Target,
    Award,
    Gift,
    Shield,
    Heart,
    Home,
    Car,
    Utensils,
    Wifi,
    Phone,
    Laptop,
    XCircle
} from 'lucide-react';
import { PayrollRecord, PayPeriod, Allowance, Deduction, FinancialRequest, BenefitsEnrollment, Beneficiary } from '../types';

// Mock data - replace with actual API calls
const mockPayrollRecords: PayrollRecord[] = [
    {
        id: 'pr-001',
        employeeId: 'emp-001',
        payPeriod: {
            id: 'pp-001',
            startDate: new Date('2024-12-01'),
            endDate: new Date('2024-12-15'),
            payDate: new Date('2024-12-20'),
            type: 'biweekly',
            status: 'paid'
        },
        baseSalary: 3125.00,
        overtime: 250.00,
        bonuses: 500.00,
        allowances: [
            {
                id: 'allow-001',
                name: 'Transportation Allowance',
                amount: 200.00,
                type: 'fixed',
                taxable: true
            },
            {
                id: 'allow-002',
                name: 'Meal Allowance',
                amount: 150.00,
                type: 'fixed',
                taxable: false
            }
        ],
        deductions: [
            {
                id: 'deduct-001',
                name: 'Federal Tax',
                amount: 450.00,
                type: 'tax'
            },
            {
                id: 'deduct-002',
                name: 'State Tax',
                amount: 180.00,
                type: 'tax'
            },
            {
                id: 'deduct-003',
                name: 'Health Insurance',
                amount: 120.00,
                type: 'insurance'
            },
            {
                id: 'deduct-004',
                name: '401k Contribution',
                amount: 250.00,
                type: 'other'
            }
        ],
        grossPay: 3875.00,
        netPay: 2875.00,
        paymentStatus: 'paid',
        paymentDate: new Date('2024-12-20'),
        paymentMethod: 'bank_transfer',
        currency: 'USD',
        createdAt: new Date('2024-12-20'),
        updatedAt: new Date('2024-12-20')
    },
    {
        id: 'pr-002',
        employeeId: 'emp-001',
        payPeriod: {
            id: 'pp-002',
            startDate: new Date('2024-11-16'),
            endDate: new Date('2024-11-30'),
            payDate: new Date('2024-12-05'),
            type: 'biweekly',
            status: 'paid'
        },
        baseSalary: 3125.00,
        overtime: 0.00,
        bonuses: 0.00,
        allowances: [
            {
                id: 'allow-001',
                name: 'Transportation Allowance',
                amount: 200.00,
                type: 'fixed',
                taxable: true
            },
            {
                id: 'allow-002',
                name: 'Meal Allowance',
                amount: 150.00,
                type: 'fixed',
                taxable: false
            }
        ],
        deductions: [
            {
                id: 'deduct-001',
                name: 'Federal Tax',
                amount: 450.00,
                type: 'tax'
            },
            {
                id: 'deduct-002',
                name: 'State Tax',
                amount: 180.00,
                type: 'tax'
            },
            {
                id: 'deduct-003',
                name: 'Health Insurance',
                amount: 120.00,
                type: 'insurance'
            },
            {
                id: 'deduct-004',
                name: '401k Contribution',
                amount: 250.00,
                type: 'other'
            }
        ],
        grossPay: 3475.00,
        netPay: 2475.00,
        paymentStatus: 'paid',
        paymentDate: new Date('2024-12-05'),
        paymentMethod: 'bank_transfer',
        currency: 'USD',
        createdAt: new Date('2024-12-05'),
        updatedAt: new Date('2024-12-05')
    }
];

const mockFinancialRequests: FinancialRequest[] = [
    {
        id: 'fr-001',
        employeeId: 'emp-001',
        requestType: 'advance',
        amount: 1000.00,
        reason: 'Emergency medical expenses',
        status: 'approved',
        approvedBy: 'manager-001',
        approvedAt: new Date('2024-12-08'),
        paidAt: new Date('2024-12-10'),
        createdAt: new Date('2024-12-05'),
        updatedAt: new Date('2024-12-10')
    },
    {
        id: 'fr-002',
        employeeId: 'emp-001',
        requestType: 'reimbursement',
        amount: 250.00,
        reason: 'Business travel expenses',
        status: 'pending',
        createdAt: new Date('2024-12-12'),
        updatedAt: new Date('2024-12-12')
    }
];

const mockBenefitsEnrollments: BenefitsEnrollment[] = [
    {
        id: 'be-001',
        employeeId: 'emp-001',
        benefitType: 'Health Insurance',
        provider: 'Blue Cross Blue Shield',
        enrollmentStatus: 'active',
        contribution: 120.00,
        employerContribution: 480.00,
        effectiveDate: new Date('2024-01-01'),
        coverage: 'Family',
        beneficiaries: [
            {
                id: 'ben-001',
                name: 'John Doe',
                relationship: 'Self',
                percentage: 100
            }
        ]
    },
    {
        id: 'be-002',
        employeeId: 'emp-001',
        benefitType: 'Dental Insurance',
        provider: 'Delta Dental',
        enrollmentStatus: 'active',
        contribution: 25.00,
        employerContribution: 75.00,
        effectiveDate: new Date('2024-01-01'),
        coverage: 'Individual'
    },
    {
        id: 'be-003',
        employeeId: 'emp-001',
        benefitType: '401k Retirement',
        provider: 'Fidelity',
        enrollmentStatus: 'active',
        contribution: 250.00,
        employerContribution: 125.00,
        effectiveDate: new Date('2024-01-01'),
        coverage: 'Individual'
    }
];

export default function PayrollCompensation() {
    const [payrollRecords, setPayrollRecords] = useState<PayrollRecord[]>(mockPayrollRecords);
    const [financialRequests, setFinancialRequests] = useState<FinancialRequest[]>(mockFinancialRequests);
    const [benefitsEnrollments, setBenefitsEnrollments] = useState<BenefitsEnrollment[]>(mockBenefitsEnrollments);
    const [showRequestForm, setShowRequestForm] = useState(false);
    const [loading, setLoading] = useState(false);
    const [selectedPeriod, setSelectedPeriod] = useState<string>('current');

    // Form state
    const [formData, setFormData] = useState({
        requestType: '',
        amount: '',
        reason: '',
        attachments: [] as File[]
    });

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'paid': return 'bg-green-100 text-green-800';
            case 'processed': return 'bg-blue-100 text-blue-800';
            case 'pending': return 'bg-yellow-100 text-yellow-800';
            case 'approved': return 'bg-green-100 text-green-800';
            case 'rejected': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'paid': return <CheckCircle className="h-4 w-4 text-green-600" />;
            case 'processed': return <Clock className="h-4 w-4 text-blue-600" />;
            case 'pending': return <Clock className="h-4 w-4 text-yellow-600" />;
            case 'approved': return <CheckCircle className="h-4 w-4 text-green-600" />;
            case 'rejected': return <AlertCircle className="h-4 w-4 text-red-600" />;
            default: return <Clock className="h-4 w-4 text-gray-600" />;
        }
    };

    const formatCurrency = (amount: number, currency: string = 'USD') => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currency
        }).format(amount);
    };

    const formatDate = (date: Date) => {
        return new Intl.DateTimeFormat('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        }).format(date);
    };

    const getBenefitIcon = (benefitType: string) => {
        switch (benefitType.toLowerCase()) {
            case 'health insurance': return <Heart className="h-4 w-4" />;
            case 'dental insurance': return <Shield className="h-4 w-4" />;
            case '401k retirement': return <Target className="h-4 w-4" />;
            case 'life insurance': return <Shield className="h-4 w-4" />;
            case 'vision insurance': return <Eye className="h-4 w-4" />;
            default: return <Gift className="h-4 w-4" />;
        }
    };

    const getAllowanceIcon = (name: string) => {
        const lowerName = name.toLowerCase();
        if (lowerName.includes('transport')) return <Car className="h-4 w-4" />;
        if (lowerName.includes('meal')) return <Utensils className="h-4 w-4" />;
        if (lowerName.includes('phone')) return <Phone className="h-4 w-4" />;
        if (lowerName.includes('internet') || lowerName.includes('wifi')) return <Wifi className="h-4 w-4" />;
        if (lowerName.includes('laptop') || lowerName.includes('computer')) return <Laptop className="h-4 w-4" />;
        if (lowerName.includes('housing') || lowerName.includes('rent')) return <Home className="h-4 w-4" />;
        return <Banknote className="h-4 w-4" />;
    };

    const handleSubmitRequest = async () => {
        if (!formData.requestType || !formData.amount || !formData.reason) {
            alert('Please fill in all required fields');
            return;
        }

        setLoading(true);
        try {
            const newRequest: FinancialRequest = {
                id: `fr-${Date.now()}`,
                employeeId: 'emp-001',
                requestType: formData.requestType as any,
                amount: parseFloat(formData.amount),
                reason: formData.reason,
                status: 'pending',
                createdAt: new Date(),
                updatedAt: new Date()
            };

            setFinancialRequests(prev => [newRequest, ...prev]);
            setShowRequestForm(false);
            setFormData({
                requestType: '',
                amount: '',
                reason: '',
                attachments: []
            });
        } catch (error) {
            console.error('Error submitting financial request:', error);
        } finally {
            setLoading(false);
        }
    };

    const currentPayroll = payrollRecords[0];
    const totalAllowances = currentPayroll?.allowances.reduce((sum, allowance) => sum + allowance.amount, 0) || 0;
    const totalDeductions = currentPayroll?.deductions.reduce((sum, deduction) => sum + deduction.amount, 0) || 0;
    const totalBenefits = benefitsEnrollments.reduce((sum, benefit) => sum + benefit.contribution, 0);
    const totalEmployerBenefits = benefitsEnrollments.reduce((sum, benefit) => sum + benefit.employerContribution, 0);

    return (
        <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 p-6">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-foreground">Payroll & Compensation</h1>
                        <p className="text-muted-foreground mt-2">
                            View your salary, benefits, and payment history
                        </p>
                    </div>
                    <Button onClick={() => setShowRequestForm(true)}>
                        <Plus className="h-4 w-4 mr-2" />
                        New Request
                    </Button>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Current Salary</CardTitle>
                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{formatCurrency(75000 / 24)}</div>
                            <p className="text-xs text-muted-foreground">Per pay period</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Net Pay</CardTitle>
                            <TrendingUp className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{formatCurrency(currentPayroll?.netPay || 0)}</div>
                            <p className="text-xs text-muted-foreground">Last payment</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Benefits</CardTitle>
                            <Gift className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{formatCurrency(totalBenefits)}</div>
                            <p className="text-xs text-muted-foreground">Monthly contribution</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Pending Requests</CardTitle>
                            <Clock className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {financialRequests.filter(req => req.status === 'pending').length}
                            </div>
                            <p className="text-xs text-muted-foreground">Awaiting approval</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Main Content */}
                <Tabs defaultValue="payslips" className="space-y-4">
                    <TabsList className="grid w-full grid-cols-4">
                        <TabsTrigger value="payslips">Payslips</TabsTrigger>
                        <TabsTrigger value="benefits">Benefits</TabsTrigger>
                        <TabsTrigger value="requests">Financial Requests</TabsTrigger>
                        <TabsTrigger value="reports">Reports</TabsTrigger>
                    </TabsList>

                    <TabsContent value="payslips" className="space-y-4">
                        {/* Current Pay Period */}
                        {currentPayroll && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center space-x-2">
                                        <Receipt className="h-5 w-5" />
                                        <span>Current Pay Period</span>
                                    </CardTitle>
                                    <CardDescription>
                                        {formatDate(currentPayroll.payPeriod.startDate)} - {formatDate(currentPayroll.payPeriod.endDate)}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {/* Earnings */}
                                        <div className="space-y-4">
                                            <h3 className="text-lg font-semibold">Earnings</h3>
                                            <div className="space-y-2">
                                                <div className="flex justify-between">
                                                    <span>Base Salary</span>
                                                    <span>{formatCurrency(currentPayroll.baseSalary)}</span>
                                                </div>
                                                {currentPayroll.overtime > 0 && (
                                                    <div className="flex justify-between">
                                                        <span>Overtime</span>
                                                        <span>{formatCurrency(currentPayroll.overtime)}</span>
                                                    </div>
                                                )}
                                                {currentPayroll.bonuses > 0 && (
                                                    <div className="flex justify-between">
                                                        <span>Bonuses</span>
                                                        <span>{formatCurrency(currentPayroll.bonuses)}</span>
                                                    </div>
                                                )}
                                                {currentPayroll.allowances.map((allowance) => (
                                                    <div key={allowance.id} className="flex justify-between">
                                                        <span className="flex items-center space-x-1">
                                                            {getAllowanceIcon(allowance.name)}
                                                            <span>{allowance.name}</span>
                                                        </span>
                                                        <span>{formatCurrency(allowance.amount)}</span>
                                                    </div>
                                                ))}
                                                <div className="border-t pt-2">
                                                    <div className="flex justify-between font-semibold">
                                                        <span>Gross Pay</span>
                                                        <span>{formatCurrency(currentPayroll.grossPay)}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Deductions */}
                                        <div className="space-y-4">
                                            <h3 className="text-lg font-semibold">Deductions</h3>
                                            <div className="space-y-2">
                                                {currentPayroll.deductions.map((deduction) => (
                                                    <div key={deduction.id} className="flex justify-between">
                                                        <span>{deduction.name}</span>
                                                        <span className="text-red-600">-{formatCurrency(deduction.amount)}</span>
                                                    </div>
                                                ))}
                                                <div className="border-t pt-2">
                                                    <div className="flex justify-between font-semibold">
                                                        <span>Total Deductions</span>
                                                        <span className="text-red-600">-{formatCurrency(totalDeductions)}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="border-t mt-6 pt-4">
                                        <div className="flex justify-between items-center">
                                            <div>
                                                <h3 className="text-xl font-bold">Net Pay</h3>
                                                <p className="text-sm text-muted-foreground">
                                                    Paid on {formatDate(currentPayroll.paymentDate)} via {currentPayroll.paymentMethod.replace('_', ' ')}
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-3xl font-bold text-green-600">
                                                    {formatCurrency(currentPayroll.netPay)}
                                                </div>
                                                <Badge className={getStatusColor(currentPayroll.paymentStatus)}>
                                                    {getStatusIcon(currentPayroll.paymentStatus)}
                                                    <span className="ml-1">{currentPayroll.paymentStatus}</span>
                                                </Badge>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex justify-end space-x-2 mt-4">
                                        <Button variant="outline" size="sm">
                                            <Eye className="h-4 w-4 mr-2" />
                                            View Details
                                        </Button>
                                        <Button variant="outline" size="sm">
                                            <Download className="h-4 w-4 mr-2" />
                                            Download PDF
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Pay History */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center space-x-2">
                                    <Calendar className="h-5 w-5" />
                                    <span>Pay History</span>
                                </CardTitle>
                                <CardDescription>
                                    Your recent payment records
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {payrollRecords.map((record) => (
                                        <div key={record.id} className="flex items-center justify-between p-4 border rounded-lg">
                                            <div className="flex items-start space-x-4">
                                                <div className="flex-shrink-0 mt-1">
                                                    {getStatusIcon(record.paymentStatus)}
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex items-center space-x-3">
                                                        <h3 className="text-lg font-semibold">
                                                            {formatDate(record.payPeriod.startDate)} - {formatDate(record.payPeriod.endDate)}
                                                        </h3>
                                                        <Badge className={getStatusColor(record.paymentStatus)}>
                                                            {record.paymentStatus}
                                                        </Badge>
                                                    </div>
                                                    <p className="text-sm text-muted-foreground mt-1">
                                                        Paid on {formatDate(record.paymentDate)} • {record.paymentMethod.replace('_', ' ')}
                                                    </p>
                                                    <div className="flex items-center space-x-4 mt-2 text-sm text-muted-foreground">
                                                        <span>Gross: {formatCurrency(record.grossPay)}</span>
                                                        <span>Deductions: {formatCurrency(totalDeductions)}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-xl font-bold text-green-600">
                                                    {formatCurrency(record.netPay)}
                                                </div>
                                                <div className="flex items-center space-x-2 mt-2">
                                                    <Button size="sm" variant="outline">
                                                        <Eye className="h-4 w-4" />
                                                    </Button>
                                                    <Button size="sm" variant="outline">
                                                        <Download className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="benefits" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center space-x-2">
                                    <Gift className="h-5 w-5" />
                                    <span>Benefits Enrollment</span>
                                </CardTitle>
                                <CardDescription>
                                    Your current benefits and coverage
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {benefitsEnrollments.map((benefit) => (
                                        <div key={benefit.id} className="flex items-center justify-between p-4 border rounded-lg">
                                            <div className="flex items-start space-x-4">
                                                <div className="flex-shrink-0 mt-1">
                                                    {getBenefitIcon(benefit.benefitType)}
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex items-center space-x-3">
                                                        <h3 className="text-lg font-semibold">{benefit.benefitType}</h3>
                                                        <Badge className={getStatusColor(benefit.enrollmentStatus)}>
                                                            {benefit.enrollmentStatus}
                                                        </Badge>
                                                    </div>
                                                    <p className="text-sm text-muted-foreground mt-1">
                                                        Provider: {benefit.provider} • Coverage: {benefit.coverage}
                                                    </p>
                                                    <p className="text-sm text-muted-foreground mt-1">
                                                        Effective: {formatDate(benefit.effectiveDate)}
                                                    </p>
                                                    {benefit.beneficiaries && benefit.beneficiaries.length > 0 && (
                                                        <div className="mt-2">
                                                            <p className="text-sm font-medium">Beneficiaries:</p>
                                                            {benefit.beneficiaries.map((beneficiary) => (
                                                                <p key={beneficiary.id} className="text-sm text-muted-foreground">
                                                                    {beneficiary.name} ({beneficiary.relationship}) - {beneficiary.percentage}%
                                                                </p>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-sm text-muted-foreground">
                                                    <div>Your Contribution: {formatCurrency(benefit.contribution)}</div>
                                                    <div>Employer Contribution: {formatCurrency(benefit.employerContribution)}</div>
                                                </div>
                                                <div className="flex items-center space-x-2 mt-2">
                                                    <Button size="sm" variant="outline">
                                                        <Eye className="h-4 w-4" />
                                                    </Button>
                                                    <Button size="sm" variant="outline">
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="requests" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center space-x-2">
                                    <FileText className="h-5 w-5" />
                                    <span>Financial Requests</span>
                                </CardTitle>
                                <CardDescription>
                                    Your salary advances, loans, and reimbursements
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {financialRequests.map((request) => (
                                        <div key={request.id} className="flex items-center justify-between p-4 border rounded-lg">
                                            <div className="flex items-start space-x-4">
                                                <div className="flex-shrink-0 mt-1">
                                                    {getStatusIcon(request.status)}
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex items-center space-x-3">
                                                        <h3 className="text-lg font-semibold capitalize">
                                                            {request.requestType} Request
                                                        </h3>
                                                        <Badge className={getStatusColor(request.status)}>
                                                            {request.status}
                                                        </Badge>
                                                    </div>
                                                    <p className="text-sm text-muted-foreground mt-1">
                                                        Amount: {formatCurrency(request.amount)}
                                                    </p>
                                                    <p className="text-sm text-muted-foreground mt-1">
                                                        Reason: {request.reason}
                                                    </p>
                                                    <div className="flex items-center space-x-4 mt-2 text-xs text-muted-foreground">
                                                        <span>Submitted: {formatDate(request.createdAt)}</span>
                                                        {request.approvedAt && (
                                                            <span>Approved: {formatDate(request.approvedAt)}</span>
                                                        )}
                                                        {request.paidAt && (
                                                            <span>Paid: {formatDate(request.paidAt)}</span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <Button size="sm" variant="outline">
                                                    <Eye className="h-4 w-4" />
                                                </Button>
                                                {request.status === 'pending' && (
                                                    <Button size="sm" variant="outline">
                                                        Cancel
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="reports" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center space-x-2">
                                    <BarChart3 className="h-5 w-5" />
                                    <span>Compensation Reports</span>
                                </CardTitle>
                                <CardDescription>
                                    Detailed reports and analytics
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="text-center py-8">
                                    <BarChart3 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                                    <p className="text-muted-foreground">Reports and analytics coming soon</p>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>

                {/* Financial Request Form Modal */}
                {showRequestForm && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-background rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-2xl font-bold">New Financial Request</h2>
                                <Button variant="outline" onClick={() => setShowRequestForm(false)}>
                                    <XCircle className="h-4 w-4" />
                                </Button>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <Label htmlFor="requestType">Request Type *</Label>
                                    <Select
                                        value={formData.requestType}
                                        onValueChange={(value) => setFormData(prev => ({ ...prev, requestType: value }))}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select request type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="advance">Salary Advance</SelectItem>
                                            <SelectItem value="loan">Loan</SelectItem>
                                            <SelectItem value="reimbursement">Expense Reimbursement</SelectItem>
                                            <SelectItem value="allowance">Allowance Request</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div>
                                    <Label htmlFor="amount">Amount *</Label>
                                    <Input
                                        id="amount"
                                        type="number"
                                        placeholder="0.00"
                                        value={formData.amount}
                                        onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="reason">Reason *</Label>
                                    <Textarea
                                        id="reason"
                                        placeholder="Please provide a detailed reason for your request..."
                                        value={formData.reason}
                                        onChange={(e) => setFormData(prev => ({ ...prev, reason: e.target.value }))}
                                        rows={3}
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="attachments">Attachments (Optional)</Label>
                                    <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-4 text-center">
                                        <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                                        <p className="text-sm text-muted-foreground mb-2">
                                            Upload supporting documents
                                        </p>
                                        <Button variant="outline" size="sm">
                                            <Upload className="h-4 w-4 mr-2" />
                                            Choose Files
                                        </Button>
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end space-x-2 mt-6">
                                <Button variant="outline" onClick={() => setShowRequestForm(false)}>
                                    Cancel
                                </Button>
                                <Button onClick={handleSubmitRequest} disabled={loading}>
                                    {loading ? (
                                        <>
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                            Submitting...
                                        </>
                                    ) : (
                                        'Submit Request'
                                    )}
                                </Button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
