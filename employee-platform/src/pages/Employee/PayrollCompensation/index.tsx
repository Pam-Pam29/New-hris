import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Textarea } from '../../../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '../../../components/ui/alert';
import { useCompany } from '../../../context/CompanyContext';
import { useAuth } from '../../../context/AuthContext';
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
import { PayrollRecord, PayPeriod, Allowance, Deduction, BenefitsEnrollment, Beneficiary } from '../types';
import { getPayrollService, FinancialRequest } from '../../../services/payrollService';

// Mock data - REPLACED WITH FIREBASE (keeping for reference only)
const mockPayrollRecords: any[] = [
    {
        id: 'pr-001',
        employeeId: 'emp-001',
        employeeName: 'John Doe',
        department: 'Engineering',
        position: 'Software Developer',
        payPeriod: {
            startDate: new Date('2024-12-01'),
            endDate: new Date('2024-12-15'),
            payDate: new Date('2024-12-20'),
            type: 'biweekly'
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
        totalDeductions: 1000.00,
        netPay: 2875.00,
        paymentStatus: 'paid',
        paymentDate: new Date('2024-12-20'),
        paymentMethod: 'bank_transfer',
        currency: 'NGN',
        createdAt: new Date('2024-12-20'),
        updatedAt: new Date('2024-12-20')
    },
    {
        id: 'pr-002',
        employeeId: 'emp-001',
        employeeName: 'John Doe',
        department: 'Engineering',
        position: 'Software Developer',
        payPeriod: {
            startDate: new Date('2024-11-16'),
            endDate: new Date('2024-11-30'),
            payDate: new Date('2024-12-05'),
            type: 'biweekly'
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
        totalDeductions: 1000.00,
        netPay: 2475.00,
        paymentStatus: 'paid',
        paymentDate: new Date('2024-12-05'),
        paymentMethod: 'bank_transfer',
        currency: 'NGN',
        createdAt: new Date('2024-12-05'),
        updatedAt: new Date('2024-12-05')
    }
];

const mockFinancialRequests: FinancialRequest[] = [
    {
        id: 'fr-001',
        employeeId: 'emp-001',
        employeeName: 'John Doe',
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
        employeeName: 'John Doe',
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
    const { companyId } = useCompany();
    const { currentEmployee } = useAuth();

    const [payrollRecords, setPayrollRecords] = useState<PayrollRecord[]>([]);
    const [financialRequests, setFinancialRequests] = useState<FinancialRequest[]>([]);
    const [benefitsEnrollments, setBenefitsEnrollments] = useState<BenefitsEnrollment[]>([]);
    const [showRequestForm, setShowRequestForm] = useState(false);
    const [loading, setLoading] = useState(true);
    const [selectedPeriod, setSelectedPeriod] = useState<string>('current');
    const [error, setError] = useState<string | null>(null);
    const [expandedPayslips, setExpandedPayslips] = useState<Set<string>>(new Set());
    const [selectedPayslipForPDF, setSelectedPayslipForPDF] = useState<PayrollRecord | null>(null);
    const [selectedRequest, setSelectedRequest] = useState<FinancialRequest | null>(null);
    const [showRequestDetails, setShowRequestDetails] = useState(false);

    // Get current employee ID from auth context
    const currentEmployeeId = currentEmployee?.employeeId || '';

    // Load payroll data from Firebase
    useEffect(() => {
        const fetchPayrollData = async () => {
            try {
                setLoading(true);
                setError(null);

                const payrollService = await getPayrollService();

                // Fetch my payroll records
                console.log('📊 Loading payroll for employee:', currentEmployeeId);
                const records = await payrollService.getMyPayrollRecords(currentEmployeeId);
                setPayrollRecords(records as any); // Type assertion for unified types
                console.log('✅ Loaded', records.length, 'payroll records');

                // Fetch my financial requests
                const requests = await payrollService.getMyFinancialRequests(currentEmployeeId);
                setFinancialRequests(requests as any); // Type assertion for unified types
                console.log('💰 Loaded', requests.length, 'financial requests');

                // Fetch my benefits
                const benefits = await payrollService.getMyBenefits(currentEmployeeId);
                setBenefitsEnrollments(benefits as any); // Type assertion for unified types
                console.log('🎁 Loaded', benefits.length, 'benefits');

                setLoading(false);
            } catch (err) {
                console.error('❌ Error loading payroll data:', err);
                setError('Failed to load payroll data. Please try again.');
                setLoading(false);
            }
        };

        fetchPayrollData();
    }, [currentEmployeeId]);

    // Form state
    const [formData, setFormData] = useState({
        requestType: '',
        amount: '',
        reason: '',
        attachments: [] as File[],
        repaymentType: 'full' as 'full' | 'installments',
        installmentMonths: 1,
        repaymentMethod: 'salary_deduction' as 'salary_deduction' | 'bank_transfer' | 'cash' | 'mobile_money'
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

    const formatDate = (date: Date | string | undefined) => {
        if (!date) return 'N/A';
        const dateObj = typeof date === 'string' ? new Date(date) : date;
        return new Intl.DateTimeFormat('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        }).format(dateObj);
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

    const togglePayslipExpansion = (payslipId: string) => {
        setExpandedPayslips(prev => {
            const newSet = new Set(prev);
            if (newSet.has(payslipId)) {
                newSet.delete(payslipId);
            } else {
                newSet.add(payslipId);
            }
            return newSet;
        });
    };

    const downloadPayslipPDF = (record: PayrollRecord) => {
        const payslipHTML = `<!DOCTYPE html>
<html><head><meta charset="UTF-8"><title>Payslip</title>
<style>body{font-family:Arial,sans-serif;padding:40px;max-width:800px;margin:0 auto}.header{text-align:center;border-bottom:3px solid #2563eb;padding-bottom:20px;margin-bottom:30px}.company{font-size:24px;font-weight:bold;color:#1e40af}.title{font-size:18px;color:# 64748b;margin-top:5px}.section{margin:20px 0}.section-title{font-size:16px;font-weight:bold;color:#1e40af;border-bottom:2px solid #e5e7eb;padding-bottom:5px;margin-bottom:10px}.info-row{display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid #f1f5f9}.label{color:#64748b;font-weight:500}.value{font-weight:600}.total-row{background:#f1f5f9;padding:12px;margin:10px 0;font-size:18px;font-weight:bold}.net-pay{background:#dcfce7;color:#166534;padding:15px;text-align:center;font-size:24px;font-weight:bold;margin-top:20px;border-radius:8px}.footer{text-align:center;margin-top:40px;padding-top:20px;border-top:2px solid #e5e7eb;color:#94a3b8;font-size:12px}</style>
</head><body>
<div class="header"><div class="company">HRIS Company</div><div class="title">PAYSLIP</div></div>
<div class="section"><div class="section-title">Employee Information</div>
<div class="info-row"><span class="label">Name:</span><span class="value">${record.employeeName}</span></div>
<div class="info-row"><span class="label">Employee ID:</span><span class="value">${record.employeeId}</span></div>
<div class="info-row"><span class="label">Department:</span><span class="value">${record.department}</span></div>
<div class="info-row"><span class="label">Position:</span><span class="value">${record.position}</span></div></div>
<div class="section"><div class="section-title">Pay Period</div>
<div class="info-row"><span class="label">Period:</span><span class="value">${formatDate(record.payPeriod.startDate)} - ${formatDate(record.payPeriod.endDate)}</span></div>
<div class="info-row"><span class="label">Pay Date:</span><span class="value">${formatDate(record.payPeriod.payDate)}</span></div>
<div class="info-row"><span class="label">Status:</span><span class="value">${record.paymentStatus.toUpperCase()}</span></div></div>
<div class="section"><div class="section-title">Earnings</div>
<div class="info-row"><span class="label">Base Salary:</span><span class="value">${formatCurrency(record.baseSalary, 'NGN')}</span></div>
${record.overtime > 0 ? `<div class="info-row"><span class="label">Overtime:</span><span class="value">${formatCurrency(record.overtime, 'NGN')}</span></div>` : ''}
${record.bonuses > 0 ? `<div class="info-row"><span class="label">Bonuses:</span><span class="value">${formatCurrency(record.bonuses, 'NGN')}</span></div>` : ''}
${record.allowances.map(a => `<div class="info-row"><span class="label">${a.name}:</span><span class="value">${formatCurrency(a.amount, 'NGN')}</span></div>`).join('')}
<div class="total-row">Gross Pay: ${formatCurrency(record.grossPay, 'NGN')}</div></div>
<div class="section"><div class="section-title">Deductions</div>
${record.deductions.map(d => `<div class="info-row"><span class="label">${d.name}${d.description ? ` (${d.description})` : ''}:</span><span class="value">-${formatCurrency(d.amount, 'NGN')}</span></div>`).join('')}
<div class="total-row">Total Deductions: -${formatCurrency((record as any).totalDeductions || record.deductions.reduce((sum, d) => sum + d.amount, 0), 'NGN')}</div></div>
<div class="net-pay">NET PAY: ${formatCurrency(record.netPay, 'NGN')}</div>
<div class="footer"><p>This is a system-generated payslip. No signature required.</p><p>Generated on ${new Date().toLocaleDateString()}</p></div>
</body></html>`;

        const blob = new Blob([payslipHTML], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Payslip_${record.employeeName.replace(/\s/g, '_')}_${formatDate(record.payPeriod.payDate).replace(/\s/g, '_')}.html`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        console.log('📥 Payslip downloaded');
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

        // Validate repayment for loans
        if ((formData.requestType === 'loan' || formData.requestType === 'advance') &&
            formData.repaymentType === 'installments' &&
            formData.installmentMonths < 1) {
            alert('Please specify number of months for installment repayment');
            return;
        }

        setLoading(true);
        try {
            const payrollService = await getPayrollService();

            // Get employee name (would come from auth context in production)
            const employeeName = 'Current Employee'; // TODO: Get from auth context

            const amount = parseFloat(formData.amount);
            const newRequest: any = {
                employeeId: currentEmployeeId,
                employeeName,
                requestType: formData.requestType as any,
                amount,
                reason: formData.reason,
                status: 'pending' as const
            };

            // Add repayment info for loans and advances
            if (formData.requestType === 'loan' || formData.requestType === 'advance') {
                newRequest.repaymentType = formData.repaymentType;
                if (formData.repaymentType === 'installments') {
                    newRequest.installmentMonths = formData.installmentMonths;
                    newRequest.installmentAmount = Math.ceil(amount / formData.installmentMonths);
                } else {
                    newRequest.installmentMonths = 1;
                    newRequest.installmentAmount = amount;
                }
                newRequest.remainingBalance = amount;
                newRequest.amountRecovered = 0;
            }

            console.log('💰 Submitting financial request:', newRequest);
            await payrollService.createFinancialRequest(newRequest);

            // Refresh requests
            const requests = await payrollService.getMyFinancialRequests(currentEmployeeId);
            setFinancialRequests(requests);

            setShowRequestForm(false);
            setFormData({
                requestType: '',
                amount: '',
                reason: '',
                attachments: [],
                repaymentType: 'full',
                installmentMonths: 1,
                repaymentMethod: 'salary_deduction'
            });

            console.log('✅ Financial request submitted successfully');
        } catch (error) {
            console.error('❌ Error submitting financial request:', error);
            alert('Failed to submit request. Please try again.');
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
        <div className="min-h-screen bg-gradient-to-br from-green-50 via-background to-blue-50 p-6">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
                            <DollarSign className="h-8 w-8 text-primary" />
                            My Payroll & Compensation
                        </h1>
                        <p className="text-muted-foreground mt-1">
                            View your payslips, benefits, and submit financial requests (₦)
                        </p>
                    </div>
                    <Button onClick={() => setShowRequestForm(true)} className="bg-primary hover:bg-primary/90">
                        <Plus className="h-4 w-4 mr-2" />
                        New Financial Request
                    </Button>
                </div>

                {/* Loading State */}
                {loading && (
                    <div className="flex justify-center items-center p-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                    </div>
                )}

                {/* Error State */}
                {error && (
                    <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Error</AlertTitle>
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}

                {/* Quick Stats */}
                {!loading && (
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
                            <CardContent className="p-6">
                                <div className="flex items-center gap-4">
                                    <div className="bg-green-500/10 p-3 rounded-xl">
                                        <DollarSign className="h-6 w-6 text-green-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">Base Salary</p>
                                        <h3 className="text-2xl font-bold text-green-600">
                                            {currentPayroll ? formatCurrency(currentPayroll.baseSalary, 'NGN') : '₦0.00'}
                                        </h3>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
                            <CardContent className="p-6">
                                <div className="flex items-center gap-4">
                                    <div className="bg-blue-500/10 p-3 rounded-xl">
                                        <TrendingUp className="h-6 w-6 text-blue-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">Gross Pay</p>
                                        <h3 className="text-2xl font-bold text-blue-600">
                                            {currentPayroll ? formatCurrency(currentPayroll.grossPay, 'NGN') : '₦0.00'}
                                        </h3>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
                            <CardContent className="p-6">
                                <div className="flex items-center gap-4">
                                    <div className="bg-purple-500/10 p-3 rounded-xl">
                                        <Receipt className="h-6 w-6 text-purple-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">Net Pay</p>
                                        <h3 className="text-2xl font-bold text-purple-600">
                                            {currentPayroll ? formatCurrency(currentPayroll.netPay, 'NGN') : '₦0.00'}
                                        </h3>
                                        <p className="text-xs text-muted-foreground">Last payment</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
                            <CardContent className="p-6">
                                <div className="flex items-center gap-4">
                                    <div className="bg-orange-500/10 p-3 rounded-xl">
                                        <Clock className="h-6 w-6 text-orange-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">Pending Requests</p>
                                        <h3 className="text-2xl font-bold text-orange-600">
                                            {financialRequests.filter(req => req.status === 'pending').length}
                                        </h3>
                                        <p className="text-xs text-muted-foreground">Awaiting approval</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}

                {/* Main Content */}
                {!loading && !error && (
                    <Tabs defaultValue="payslips" className="space-y-4">
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="payslips">My Payslips</TabsTrigger>
                            <TabsTrigger value="requests">Financial Requests</TabsTrigger>
                        </TabsList>

                        <TabsContent value="payslips" className="space-y-4">
                            {/* No Payroll Records */}
                            {payrollRecords.length === 0 ? (
                                <Card className="border-0 shadow-md">
                                    <CardContent className="p-12">
                                        <div className="flex flex-col items-center gap-4 text-center">
                                            <Receipt className="h-16 w-16 text-muted-foreground" />
                                            <div>
                                                <h3 className="text-xl font-semibold mb-2">No Payslips Available</h3>
                                                <p className="text-muted-foreground">
                                                    Your payslips will appear here once HR processes your payroll.
                                                </p>
                                                <p className="text-sm text-muted-foreground mt-2">
                                                    Contact HR if you believe this is an error.
                                                </p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ) : (
                                <>
                                    {/* Current Pay Period */}
                                    {currentPayroll && (
                                        <Card className="border-0 shadow-md">
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

                                                <div className="border-t mt-6 pt-4 bg-green-50 p-4 rounded-lg">
                                                    <div className="flex justify-between items-center">
                                                        <div>
                                                            <h3 className="text-2xl font-bold text-green-700">Net Pay</h3>
                                                            <p className="text-sm text-green-600">
                                                                {currentPayroll.paymentDate ?
                                                                    `Paid on ${formatDate(currentPayroll.paymentDate)}` :
                                                                    'Payment pending'}{currentPayroll.paymentMethod ? ` • ${currentPayroll.paymentMethod.replace('_', ' ')}` : ''}
                                                            </p>
                                                        </div>
                                                        <div className="text-right">
                                                            <div className="text-3xl font-bold text-green-700">
                                                                {formatCurrency(currentPayroll.netPay, 'NGN')}
                                                            </div>
                                                            <Badge className={getStatusColor(currentPayroll.paymentStatus)}>
                                                                {getStatusIcon(currentPayroll.paymentStatus)}
                                                                <span className="ml-1 capitalize">{currentPayroll.paymentStatus}</span>
                                                            </Badge>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex justify-end space-x-2 mt-4">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => togglePayslipExpansion(currentPayroll.id)}
                                                    >
                                                        <Eye className="h-4 w-4 mr-2" />
                                                        {expandedPayslips.has(currentPayroll.id) ? 'Hide Details' : 'View Details'}
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => downloadPayslipPDF(currentPayroll)}
                                                    >
                                                        <Download className="h-4 w-4 mr-2" />
                                                        Download
                                                    </Button>
                                                </div>

                                                {/* Expandable Breakdown */}
                                                {expandedPayslips.has(currentPayroll.id) && (
                                                    <div className="mt-4 p-4 bg-muted/30 rounded-lg space-y-4 border-t-2">
                                                        {/* Earnings Breakdown */}
                                                        <div>
                                                            <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
                                                                <TrendingUp className="h-4 w-4 text-green-600" />
                                                                Earnings Breakdown
                                                            </h4>
                                                            <div className="space-y-2 pl-6">
                                                                <div className="flex justify-between text-sm">
                                                                    <span className="text-muted-foreground">Base Salary:</span>
                                                                    <span className="font-medium">{formatCurrency(currentPayroll.baseSalary, 'NGN')}</span>
                                                                </div>
                                                                {currentPayroll.overtime > 0 && (
                                                                    <div className="flex justify-between text-sm">
                                                                        <span className="text-muted-foreground">Overtime:</span>
                                                                        <span className="font-medium text-green-600">+{formatCurrency(currentPayroll.overtime, 'NGN')}</span>
                                                                    </div>
                                                                )}
                                                                {currentPayroll.bonuses > 0 && (
                                                                    <div className="flex justify-between text-sm">
                                                                        <span className="text-muted-foreground">Bonuses:</span>
                                                                        <span className="font-medium text-green-600">+{formatCurrency(currentPayroll.bonuses, 'NGN')}</span>
                                                                    </div>
                                                                )}
                                                                {currentPayroll.allowances.map((allowance) => (
                                                                    <div key={allowance.id} className="flex justify-between text-sm items-center">
                                                                        <span className="text-muted-foreground flex items-center gap-2">
                                                                            {getAllowanceIcon(allowance.name)}
                                                                            {allowance.name} {allowance.taxable && <span className="text-xs text-orange-600">(Taxable)</span>}
                                                                        </span>
                                                                        <span className="font-medium text-green-600">+{formatCurrency(allowance.amount, 'NGN')}</span>
                                                                    </div>
                                                                ))}
                                                                <div className="flex justify-between text-sm pt-2 border-t font-bold">
                                                                    <span>Gross Pay:</span>
                                                                    <span className="text-green-700">{formatCurrency(currentPayroll.grossPay, 'NGN')}</span>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {/* Deductions Breakdown */}
                                                        <div>
                                                            <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
                                                                <AlertCircle className="h-4 w-4 text-red-600" />
                                                                Deductions Breakdown
                                                            </h4>
                                                            <div className="space-y-2 pl-6">
                                                                {currentPayroll.deductions.map((deduction) => (
                                                                    <div key={deduction.id} className="space-y-1">
                                                                        <div className="flex justify-between text-sm items-start">
                                                                            <div className="flex-1">
                                                                                <span className="text-muted-foreground">{deduction.name}</span>
                                                                                {deduction.description && (
                                                                                    <p className="text-xs text-muted-foreground/70 mt-0.5">{deduction.description}</p>
                                                                                )}
                                                                            </div>
                                                                            <span className="font-medium text-red-600">-{formatCurrency(deduction.amount, 'NGN')}</span>
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                                <div className="flex justify-between text-sm pt-2 border-t font-bold">
                                                                    <span>Total Deductions:</span>
                                                                    <span className="text-red-700">-{formatCurrency((currentPayroll as any).totalDeductions || currentPayroll.deductions.reduce((sum, d) => sum + d.amount, 0), 'NGN')}</span>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {/* Net Pay Summary */}
                                                        <div className="p-3 bg-green-100 rounded-lg border border-green-300">
                                                            <div className="flex justify-between items-center">
                                                                <span className="font-bold text-green-900">Final Net Pay:</span>
                                                                <span className="text-2xl font-bold text-green-700">{formatCurrency(currentPayroll.netPay, 'NGN')}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                            </CardContent>
                                        </Card>
                                    )}

                                    {/* Pay History */}
                                    {payrollRecords.length > 1 && (
                                        <Card className="border-0 shadow-md">
                                            <CardHeader>
                                                <CardTitle className="flex items-center space-x-2">
                                                    <Calendar className="h-5 w-5" />
                                                    <span>Pay History</span>
                                                </CardTitle>
                                                <CardDescription>
                                                    Your previous payment records
                                                </CardDescription>
                                            </CardHeader>
                                            <CardContent>
                                                <div className="space-y-3">
                                                    {payrollRecords.slice(1).map((record) => (
                                                        <div key={record.id} className="border rounded-lg hover:bg-muted/30 transition-colors">
                                                            <div className="flex items-center justify-between p-4">
                                                                <div className="flex items-start space-x-4">
                                                                    <div className="flex-shrink-0 mt-1">
                                                                        {getStatusIcon(record.paymentStatus)}
                                                                    </div>
                                                                    <div className="flex-1">
                                                                        <div className="flex items-center space-x-3">
                                                                            <h3 className="font-semibold">
                                                                                {formatDate(record.payPeriod.startDate)} - {formatDate(record.payPeriod.endDate)}
                                                                            </h3>
                                                                            <Badge className={getStatusColor(record.paymentStatus)}>
                                                                                {record.paymentStatus}
                                                                            </Badge>
                                                                        </div>
                                                                        <p className="text-sm text-muted-foreground mt-1">
                                                                            {record.paymentDate ? `Paid on ${formatDate(record.paymentDate)}` : 'Payment pending'}{record.paymentMethod ? ` • ${record.paymentMethod.replace('_', ' ')}` : ''}
                                                                        </p>
                                                                        <div className="flex items-center gap-4 mt-2 text-sm">
                                                                            <span className="text-muted-foreground">Gross: {formatCurrency(record.grossPay, 'NGN')}</span>
                                                                            <span className="text-red-600">Deductions: -{formatCurrency((record as any).totalDeductions || record.deductions.reduce((sum, d) => sum + d.amount, 0), 'NGN')}</span>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                <div className="text-right">
                                                                    <div className="text-xl font-bold text-green-600">
                                                                        {formatCurrency(record.netPay, 'NGN')}
                                                                    </div>
                                                                    <div className="flex items-center gap-2 mt-2">
                                                                        <Button
                                                                            size="sm"
                                                                            variant="outline"
                                                                            onClick={() => togglePayslipExpansion(record.id)}
                                                                        >
                                                                            <Eye className="h-4 w-4" />
                                                                        </Button>
                                                                        <Button
                                                                            size="sm"
                                                                            variant="outline"
                                                                            onClick={() => downloadPayslipPDF(record)}
                                                                        >
                                                                            <Download className="h-4 w-4" />
                                                                        </Button>
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            {/* Expandable Details for History Item */}
                                                            {expandedPayslips.has(record.id) && (
                                                                <div className="px-4 pb-4">
                                                                    <div className="p-4 bg-muted/20 rounded-lg space-y-3 border-t">
                                                                        <div className="grid grid-cols-2 gap-4 text-sm">
                                                                            <div>
                                                                                <span className="text-muted-foreground">Base Salary:</span>
                                                                                <p className="font-medium">{formatCurrency(record.baseSalary, 'NGN')}</p>
                                                                            </div>
                                                                            {record.overtime > 0 && (
                                                                                <div>
                                                                                    <span className="text-muted-foreground">Overtime:</span>
                                                                                    <p className="font-medium text-green-600">+{formatCurrency(record.overtime, 'NGN')}</p>
                                                                                </div>
                                                                            )}
                                                                        </div>

                                                                        {record.allowances.length > 0 && (
                                                                            <div>
                                                                                <p className="text-xs font-semibold mb-2">Allowances:</p>
                                                                                {record.allowances.map(a => (
                                                                                    <div key={a.id} className="flex justify-between text-xs mb-1 pl-3">
                                                                                        <span className="text-muted-foreground">{a.name}</span>
                                                                                        <span className="text-green-600">+{formatCurrency(a.amount, 'NGN')}</span>
                                                                                    </div>
                                                                                ))}
                                                                            </div>
                                                                        )}

                                                                        {record.deductions.length > 0 && (
                                                                            <div>
                                                                                <p className="text-xs font-semibold mb-2">Deductions:</p>
                                                                                {record.deductions.map(d => (
                                                                                    <div key={d.id} className="mb-1 pl-3">
                                                                                        <div className="flex justify-between text-xs">
                                                                                            <span className="text-muted-foreground">{d.name}</span>
                                                                                            <span className="text-red-600">-{formatCurrency(d.amount, 'NGN')}</span>
                                                                                        </div>
                                                                                        {d.description && (
                                                                                            <p className="text-xs text-muted-foreground/60 italic">{d.description}</p>
                                                                                        )}
                                                                                    </div>
                                                                                ))}
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            </CardContent>
                                        </Card>
                                    )}
                                </>
                            )}
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

                                                        {/* Repayment Progress for Loans/Advances */}
                                                        {(request.requestType === 'loan' || request.requestType === 'advance') &&
                                                            (request as any).remainingBalance !== undefined &&
                                                            request.status !== 'pending' && request.status !== 'rejected' && (
                                                                <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                                                                    <div className="flex items-center justify-between mb-2">
                                                                        <span className="text-xs font-semibold text-blue-900">Repayment Progress</span>
                                                                        <span className="text-xs font-bold text-blue-700">
                                                                            {Math.round(((request as any).amountRecovered || 0) / request.amount * 100)}% Recovered
                                                                        </span>
                                                                    </div>
                                                                    <div className="w-full bg-blue-200 rounded-full h-2 mb-2">
                                                                        <div
                                                                            className="bg-blue-600 h-2 rounded-full transition-all"
                                                                            style={{ width: `${Math.min(((request as any).amountRecovered || 0) / request.amount * 100, 100)}%` }}
                                                                        ></div>
                                                                    </div>
                                                                    <div className="flex justify-between text-xs text-blue-800">
                                                                        <span>Recovered: {formatCurrency((request as any).amountRecovered || 0, 'NGN')}</span>
                                                                        <span>Remaining: {formatCurrency((request as any).remainingBalance || request.amount, 'NGN')}</span>
                                                                    </div>
                                                                    {(request as any).repaymentType === 'installments' && (request as any).installmentMonths && (
                                                                        <p className="text-xs text-blue-700 mt-2">
                                                                            📅 {formatCurrency((request as any).installmentAmount || 0, 'NGN')}/month for {(request as any).installmentMonths} months
                                                                        </p>
                                                                    )}
                                                                    {(request as any).linkedPayrollIds && (request as any).linkedPayrollIds.length > 0 && (
                                                                        <p className="text-xs text-blue-700 mt-1">
                                                                            💼 Deducted from {(request as any).linkedPayrollIds.length} payslip(s)
                                                                        </p>
                                                                    )}
                                                                </div>
                                                            )}

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
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => {
                                                            setSelectedRequest(request);
                                                            setShowRequestDetails(true);
                                                        }}
                                                    >
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
                )}

                {/* Financial Request Details Dialog */}
                {showRequestDetails && selectedRequest && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-background rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-2xl font-bold">Financial Request Details</h2>
                                <Button variant="outline" onClick={() => setShowRequestDetails(false)}>
                                    <XCircle className="h-4 w-4" />
                                </Button>
                            </div>

                            <div className="space-y-4">
                                {/* Status Badge */}
                                <div className="flex items-center gap-3">
                                    <Badge className={getStatusColor(selectedRequest.status)} style={{ fontSize: '14px', padding: '8px 16px' }}>
                                        {selectedRequest.status.toUpperCase()}
                                    </Badge>
                                    <span className="text-sm text-muted-foreground">
                                        Request Type: <span className="font-semibold capitalize">{selectedRequest.requestType}</span>
                                    </span>
                                </div>

                                {/* Amount */}
                                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                                    <p className="text-sm text-muted-foreground mb-1">Requested Amount</p>
                                    <p className="text-3xl font-bold text-green-700">{formatCurrency(selectedRequest.amount, 'NGN')}</p>
                                </div>

                                {/* Reason */}
                                <div>
                                    <Label className="text-sm font-semibold">Reason</Label>
                                    <div className="mt-2 p-3 bg-muted rounded-md">
                                        <p className="text-sm">{selectedRequest.reason}</p>
                                    </div>
                                </div>

                                {/* Repayment Info */}
                                {(selectedRequest.requestType === 'loan' || selectedRequest.requestType === 'advance') &&
                                    (selectedRequest as any).repaymentType && (
                                        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                                            <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
                                                <Calendar className="h-4 w-4 text-blue-600" />
                                                Repayment Plan
                                            </h3>
                                            <div className="grid grid-cols-2 gap-3 text-sm">
                                                <div>
                                                    <p className="text-muted-foreground">Repayment Type:</p>
                                                    <p className="font-medium">
                                                        {(selectedRequest as any).repaymentType === 'full' ? 'Full Amount (Next Salary)' : 'Monthly Installments'}
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-muted-foreground">Repayment Method:</p>
                                                    <p className="font-medium capitalize">
                                                        {(selectedRequest as any).repaymentMethod?.replace('_', ' ') || 'Salary Deduction'}
                                                    </p>
                                                </div>
                                                {(selectedRequest as any).repaymentType === 'installments' && (
                                                    <>
                                                        <div>
                                                            <p className="text-muted-foreground">Duration:</p>
                                                            <p className="font-medium">{(selectedRequest as any).installmentMonths} months</p>
                                                        </div>
                                                        <div>
                                                            <p className="text-muted-foreground">Per Month:</p>
                                                            <p className="font-medium text-blue-700">{formatCurrency((selectedRequest as any).installmentAmount || 0, 'NGN')}</p>
                                                        </div>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                {/* Timeline */}
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <Label className="text-xs text-muted-foreground">Submitted</Label>
                                        <p className="font-medium">{formatDate(selectedRequest.createdAt)}</p>
                                    </div>
                                    {selectedRequest.approvedAt && (
                                        <div>
                                            <Label className="text-xs text-muted-foreground">Approved</Label>
                                            <p className="font-medium text-green-600">{formatDate(selectedRequest.approvedAt)}</p>
                                        </div>
                                    )}
                                    {selectedRequest.paidAt && (
                                        <div>
                                            <Label className="text-xs text-muted-foreground">Paid</Label>
                                            <p className="font-medium text-blue-600">{formatDate(selectedRequest.paidAt)}</p>
                                        </div>
                                    )}
                                    {selectedRequest.approvedBy && (
                                        <div>
                                            <Label className="text-xs text-muted-foreground">Approved By</Label>
                                            <p className="font-medium">{selectedRequest.approvedBy}</p>
                                        </div>
                                    )}
                                </div>

                                {/* Attachments */}
                                {selectedRequest.attachments && selectedRequest.attachments.length > 0 && (
                                    <div>
                                        <Label className="text-sm font-semibold">Attachments</Label>
                                        <div className="mt-2 space-y-2">
                                            {selectedRequest.attachments.map((attachment, index) => (
                                                <div key={index} className="flex items-center gap-2 p-2 bg-muted rounded-md">
                                                    <FileText className="h-4 w-4" />
                                                    <span className="text-sm">Attachment {index + 1}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="flex justify-end space-x-2 mt-6">
                                <Button variant="outline" onClick={() => setShowRequestDetails(false)}>
                                    Close
                                </Button>
                            </div>
                        </div>
                    </div>
                )}

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
                                    <Label htmlFor="amount">Amount (₦) *</Label>
                                    <Input
                                        id="amount"
                                        type="number"
                                        placeholder="Enter amount in Naira"
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

                                {/* Repayment Options for Loans and Advances */}
                                {(formData.requestType === 'loan' || formData.requestType === 'advance') && (
                                    <div className="border rounded-lg p-4 bg-blue-50">
                                        <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
                                            <Calendar className="h-4 w-4" />
                                            Repayment Plan
                                        </h3>

                                        <div className="space-y-3">
                                            <div>
                                                <Label>How would you like to repay? *</Label>
                                                <Select
                                                    value={formData.repaymentType}
                                                    onValueChange={(value: 'full' | 'installments') =>
                                                        setFormData(prev => ({ ...prev, repaymentType: value }))
                                                    }
                                                >
                                                    <SelectTrigger className="bg-white">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="full">Full Amount (Next Salary)</SelectItem>
                                                        <SelectItem value="installments">Monthly Installments</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>

                                            {formData.repaymentType === 'installments' && (
                                                <div>
                                                    <Label htmlFor="installmentMonths">Number of Months *</Label>
                                                    <Input
                                                        id="installmentMonths"
                                                        type="number"
                                                        min="1"
                                                        max="12"
                                                        placeholder="Enter number of months (1-12)"
                                                        value={formData.installmentMonths}
                                                        onChange={(e) => setFormData(prev => ({
                                                            ...prev,
                                                            installmentMonths: parseInt(e.target.value) || 1
                                                        }))}
                                                        className="bg-white"
                                                    />
                                                    {formData.amount && formData.installmentMonths > 0 && (
                                                        <p className="text-sm text-muted-foreground mt-2">
                                                            ₦{Math.ceil(parseFloat(formData.amount) / formData.installmentMonths).toLocaleString()}/month
                                                            for {formData.installmentMonths} months
                                                        </p>
                                                    )}
                                                </div>
                                            )}

                                            {formData.repaymentType === 'full' && (
                                                <Alert>
                                                    <AlertCircle className="h-4 w-4" />
                                                    <AlertDescription className="text-xs">
                                                        The full amount will be deducted from your next salary payment.
                                                    </AlertDescription>
                                                </Alert>
                                            )}
                                        </div>
                                    </div>
                                )}

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
