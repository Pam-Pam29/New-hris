import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../../components/ui/card';
import { TypographyH2 } from '../../../components/ui/typography';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Badge } from '../../../components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '../../../components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../components/ui/table';
import { Label } from '../../../components/ui/label';
import { Textarea } from '../../../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select';
import { Alert, AlertDescription, AlertTitle } from '../../../components/ui/alert';
import { useToast } from '../../../hooks/use-toast';
import {
  DollarSign,
  Users,
  TrendingUp,
  Calendar,
  Download,
  Plus,
  Search,
  Filter,
  FileText,
  AlertCircle,
  Eye,
  Edit,
  Trash2,
  CheckCircle2,
  Building,
  Briefcase,
  X,
  Car,
  Utensils,
  Home,
  Phone,
  Wifi,
  GraduationCap,
  Banknote
} from 'lucide-react';

// Import Firebase services and types
import { getServiceConfig, initializeFirebase } from '../../../config/firebase';
import {
  PayrollRecord,
  Allowance,
  Deduction,
  PayPeriod,
  FinancialRequest,
  calculateGrossPay,
  calculateTotalDeductions,
  calculateNetPay,
  getPayrollService as getPayrollServiceImport
} from '../../../services/payrollService';
import { getComprehensiveDataFlowService } from '../../../services/comprehensiveDataFlowService';
import { Employee } from '../CoreHr/EmployeeManagement/types';
import { vercelEmailService } from '../../../services/vercelEmailService';
import { useCompany } from '../../../context/CompanyContext';

// Use the singleton from service
const getPayrollService = getPayrollServiceImport;

export default function Payroll() {
  const { companyId } = useCompany();
  const [payrollRecords, setPayrollRecords] = useState<PayrollRecord[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // State for dialogs
  const [addPayrollOpen, setAddPayrollOpen] = useState(false);
  const [viewPayrollOpen, setViewPayrollOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [selectedPayroll, setSelectedPayroll] = useState<PayrollRecord | null>(null);
  const [payrollToDelete, setPayrollToDelete] = useState<string | null>(null);

  // Enhanced Form states with allowances and deductions
  const [payrollForm, setPayrollForm] = useState({
    employeeId: '',
    employeeName: '',
    department: '',
    position: '',
    baseSalary: 0,
    overtime: 0,
    bonuses: 0,
    allowances: [] as Allowance[],
    deductions: [] as Deduction[],
    payPeriod: {
      startDate: '',
      endDate: '',
      payDate: '',
      type: 'monthly' as 'weekly' | 'biweekly' | 'monthly' | 'semimonthly'
    },
    paymentMethod: 'bank_transfer' as 'bank_transfer' | 'check' | 'cash',
    currency: 'NGN', // Default to Nigerian Naira
    notes: ''
  });

  // Financial Requests
  const [financialRequests, setFinancialRequests] = useState<FinancialRequest[]>([]);
  const [showRequestDetails, setShowRequestDetails] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<FinancialRequest | null>(null);

  const { toast } = useToast();

  // State for department data
  const [departmentData, setDepartmentData] = useState<{ [key: string]: { count: number, total: number, average: number } }>({});

  // State for status counts
  const [statusCounts, setStatusCounts] = useState<{ [key: string]: number }>({});

  // Fetch data on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Get payroll service
        const payrollService = await getPayrollService();

        // Fetch employees for dropdown (filtered by company)
        const dataFlowService = await getComprehensiveDataFlowService();
        // Use subscribeToAllEmployees with companyId filter
        let employeeProfiles: any[] = [];
        if (companyId) {
          await new Promise<void>((resolve) => {
            const unsubscribe = dataFlowService.subscribeToAllEmployees((employees) => {
              employeeProfiles = employees;
              unsubscribe();
              resolve();
            }, companyId);
          });
          console.log(`👥 Payroll: Loaded ${employeeProfiles.length} employees for company`);
        } else {
          employeeProfiles = await dataFlowService.getAllEmployees();
        }

        // Convert to Employee format (comprehensive field checking)
        const employeesData: Employee[] = employeeProfiles.map((profile: any) => {
          // Check ALL possible locations for job title/position
          const jobTitle = profile.role ||
            profile.jobInfo?.jobTitle ||
            profile.jobInfo?.position ||
            profile.jobInfo?.role ||
            profile.position ||
            profile.workInfo?.jobTitle ||
            profile.workInfo?.position ||
            profile.workInfo?.role ||
            profile.employmentInfo?.jobTitle ||
            profile.employmentInfo?.position ||
            'Employee';

          // Debug logging for Victoria
          if (profile.name?.includes('Victoria') || profile.employeeId === 'EMP001') {
            console.log('🔍 Victoria\'s profile in Payroll:', {
              name: profile.name,
              employeeId: profile.employeeId,
              extractedJobTitle: jobTitle,
              'profile.role': profile.role,
              'profile.position': profile.position,
              'profile.workInfo?.jobTitle': profile.workInfo?.jobTitle,
              'profile.jobInfo?.jobTitle': profile.jobInfo?.jobTitle
            });
          }

          return {
            id: profile.id || profile.employeeId,
            employeeId: profile.employeeId || profile.id,
            name: profile.name || `${profile.personalInfo?.firstName || ''} ${profile.personalInfo?.lastName || ''}`.trim(),
            email: profile.email || profile.contactInfo?.email || profile.personalInfo?.email,
            role: jobTitle,
            department: profile.department || profile.jobInfo?.department || profile.workInfo?.department || 'General',
            employmentType: profile.employmentType || profile.workInfo?.employmentType || profile.jobInfo?.employmentType || 'Full-time',
            status: profile.status || 'active',
            dateStarted: profile.dateStarted || profile.workInfo?.startDate,
            companyId: companyId || ''
          };
        });

        setEmployees(employeesData);
        console.log('👥 Loaded', employeesData.length, 'employees');

        // Fetch payroll records
        const recordsData = await payrollService.getPayrollRecords();
        setPayrollRecords(recordsData);
        console.log('📊 Loaded', recordsData.length, 'payroll records');

        // Fetch financial requests
        const requestsData = await payrollService.getFinancialRequests();
        setFinancialRequests(requestsData);
        console.log('💰 Loaded', requestsData.length, 'financial requests');

        // Get active payroll records (not archived)
        const paidRecords = await payrollService.getPayrollRecordsByStatus('paid');
        const pendingRecords = await payrollService.getPayrollRecordsByStatus('pending');
        const processingRecords = await payrollService.getPayrollRecordsByStatus('processing');

        // Set status counts
        setStatusCounts({
          paid: paidRecords.length,
          pending: pendingRecords.length,
          processing: processingRecords.length
        });

        // Process department data
        const deptData: { [key: string]: { count: number, total: number, average: number } } = {};

        // Group by department
        recordsData.forEach(record => {
          if (!deptData[record.department]) {
            deptData[record.department] = {
              count: 0,
              total: 0,
              average: 0
            };
          }

          deptData[record.department].count++;
          deptData[record.department].total += record.grossPay;
        });

        // Calculate averages
        Object.keys(deptData).forEach(dept => {
          deptData[dept].average = deptData[dept].total / deptData[dept].count;
        });

        setDepartmentData(deptData);
        setLoading(false);
      } catch (err) {
        console.error('❌ Error fetching payroll data:', err);
        setError('Failed to load payroll data. Please try again.');
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Handle deleting a payroll record
  const handleDeletePayroll = async (id: string) => {
    try {
      const payrollService = await getPayrollService();
      await payrollService.deletePayrollRecord(id);

      // Update local state
      setPayrollRecords(prev => prev.filter(record => record.id !== id));

      // Refresh status counts
      const paidRecords = await payrollService.getPayrollRecordsByStatus('paid');
      const pendingRecords = await payrollService.getPayrollRecordsByStatus('pending');
      const processingRecords = await payrollService.getPayrollRecordsByStatus('processing');

      setStatusCounts({
        paid: paidRecords.length,
        pending: pendingRecords.length,
        processing: processingRecords.length
      });

      // Refresh department data
      const recordsData = await payrollService.getPayrollRecords();
      const deptData: { [key: string]: { count: number, total: number, average: number } } = {};

      // Group by department
      recordsData.forEach(record => {
        if (!deptData[record.department]) {
          deptData[record.department] = {
            count: 0,
            total: 0,
            average: 0
          };
        }

        deptData[record.department].count++;
        deptData[record.department].total += record.grossPay;
      });

      // Calculate averages
      Object.keys(deptData).forEach(dept => {
        deptData[dept].average = deptData[dept].total / deptData[dept].count;
      });

      setDepartmentData(deptData);

      toast({
        title: 'Success',
        description: 'Payroll record deleted successfully',
      });
    } catch (err) {
      console.error('Error deleting payroll record:', err);
      toast({
        title: 'Error',
        description: 'Failed to delete payroll record',
        variant: 'destructive',
      });
    }
  };

  // Helper Functions for Allowances & Deductions
  const addAllowance = () => {
    const newAllowance: Allowance = {
      id: `allow-${Date.now()}`,
      name: '',
      amount: 0,
      type: 'fixed',
      taxable: true,
      description: ''
    };
    setPayrollForm(prev => ({
      ...prev,
      allowances: [...prev.allowances, newAllowance]
    }));
  };

  const removeAllowance = (id: string) => {
    setPayrollForm(prev => ({
      ...prev,
      allowances: prev.allowances.filter(a => a.id !== id)
    }));
  };

  const updateAllowance = (id: string, field: keyof Allowance, value: any) => {
    setPayrollForm(prev => ({
      ...prev,
      allowances: prev.allowances.map(a =>
        a.id === id ? { ...a, [field]: value } : a
      )
    }));
  };

  const addDeduction = () => {
    const newDeduction: Deduction = {
      id: `deduct-${Date.now()}`,
      name: '',
      amount: 0,
      type: 'tax',
      description: ''
    };
    setPayrollForm(prev => ({
      ...prev,
      deductions: [...prev.deductions, newDeduction]
    }));
  };

  const removeDeduction = (id: string) => {
    setPayrollForm(prev => ({
      ...prev,
      deductions: prev.deductions.filter(d => d.id !== id)
    }));
  };

  const updateDeduction = (id: string, field: keyof Deduction, value: any) => {
    setPayrollForm(prev => ({
      ...prev,
      deductions: prev.deductions.map(d =>
        d.id === id ? { ...d, [field]: value } : d
      )
    }));
  };

  const resetForm = () => {
    setPayrollForm({
      employeeId: '',
      employeeName: '',
      department: '',
      position: '',
      baseSalary: 0,
      overtime: 0,
      bonuses: 0,
      allowances: [],
      deductions: [],
      payPeriod: {
        startDate: '',
        endDate: '',
        payDate: '',
        type: 'monthly'
      },
      paymentMethod: 'bank_transfer',
      currency: 'NGN', // Default to Nigerian Naira
      notes: ''
    });
  };

  // Calculate pay period end date and pay date based on start date and type
  const calculatePayPeriodDates = (startDate: string, type: 'weekly' | 'biweekly' | 'monthly' | 'semimonthly') => {
    if (!startDate) return { endDate: '', payDate: '' };

    const start = new Date(startDate);
    let end = new Date(start);
    let pay = new Date(start);

    switch (type) {
      case 'weekly':
        end.setDate(start.getDate() + 6); // 7 days total
        pay.setDate(end.getDate() + 3); // Pay 3 days after period ends
        break;
      case 'biweekly':
        end.setDate(start.getDate() + 13); // 14 days total
        pay.setDate(end.getDate() + 3); // Pay 3 days after period ends
        break;
      case 'semimonthly':
        // 1st-15th or 16th-end of month
        if (start.getDate() === 1) {
          end = new Date(start.getFullYear(), start.getMonth(), 15);
        } else {
          end = new Date(start.getFullYear(), start.getMonth() + 1, 0); // Last day of month
        }
        pay = new Date(end);
        pay.setDate(end.getDate() + 2); // Pay 2 days after period ends
        break;
      case 'monthly':
        end = new Date(start.getFullYear(), start.getMonth() + 1, 0); // Last day of month
        pay = new Date(end);
        pay.setDate(end.getDate() + 3); // Pay 3 days after period ends
        break;
    }

    return {
      endDate: end.toISOString().split('T')[0],
      payDate: pay.toISOString().split('T')[0]
    };
  };

  // Auto-add financial request deductions
  const autoAddFinancialDeductions = async (employeeId: string) => {
    try {
      console.log('💰 Auto-adding financial deductions for employee:', employeeId);

      const payrollService = await getPayrollService();
      const requests = await payrollService.getFinancialRequestsByEmployee(employeeId);

      console.log('📋 Total financial requests found:', requests.length);
      console.log('📋 All requests:', requests);

      // Filter for approved/paid requests that need recovery
      const pendingRecovery = requests.filter((req: any) => {
        const isLoanOrAdvance = req.requestType === 'loan' || req.requestType === 'advance';
        const isPaidOrRecovering = req.status === 'paid' || req.status === 'recovering';
        const hasBalance = req.remainingBalance && req.remainingBalance > 0;

        console.log(`  - ${req.requestType} (${req.status}): isLoanOrAdvance=${isLoanOrAdvance}, isPaidOrRecovering=${isPaidOrRecovering}, hasBalance=${hasBalance}, remainingBalance=${req.remainingBalance}`);

        return isLoanOrAdvance && isPaidOrRecovering && hasBalance;
      });

      console.log('🔍 Found', pendingRecovery.length, 'financial requests for recovery');
      console.log('🔍 Pending recovery details:', pendingRecovery);

      const autoDeductions: typeof payrollForm.deductions = [];

      for (const request of pendingRecovery) {
        const req = request as any;

        // Log all loan details for debugging
        console.log(`  📋 Loan ${req.id} details:`, {
          requestType: req.requestType,
          amount: req.amount,
          remainingBalance: req.remainingBalance,
          amountRecovered: req.amountRecovered,
          repaymentType: req.repaymentType,
          installmentMonths: req.installmentMonths,
          installmentAmount: req.installmentAmount,
          repaymentMethod: req.repaymentMethod
        });

        // Calculate the correct deduction amount
        let deductAmount = 0;

        if (req.repaymentType === 'installments' && req.installmentMonths && req.installmentMonths > 0) {
          // For installments: calculate monthly installment
          const monthsRemaining = req.installmentMonths - Math.floor((req.amountRecovered || 0) / (req.installmentAmount || 1));

          if (req.installmentAmount && req.installmentAmount > 0 && req.installmentAmount < req.remainingBalance) {
            // Use the set installment amount
            deductAmount = req.installmentAmount;
          } else {
            // Recalculate based on original loan amount
            const originalAmount = (req.remainingBalance || 0) + (req.amountRecovered || 0);
            deductAmount = Math.ceil(originalAmount / req.installmentMonths);
          }

          // Don't deduct more than remaining balance
          deductAmount = Math.min(deductAmount, req.remainingBalance || 0);

          console.log(`  ✅ Installment calculation: ₦${req.remainingBalance + (req.amountRecovered || 0)} ÷ ${req.installmentMonths} months = ₦${deductAmount}/month`);
        } else {
          // For full repayment: deduct entire remaining balance
          deductAmount = req.remainingBalance || 0;
          console.log(`  ⚠️ Full repayment (installmentMonths: ${req.installmentMonths}, repaymentType: ${req.repaymentType})`);
        }

        console.log(`  💰 Final deduction: ₦${deductAmount} (remaining: ₦${req.remainingBalance}, type: ${req.repaymentType})`);

        autoDeductions.push({
          id: `fin-req-${req.id}`,
          name: `${req.requestType === 'loan' ? 'Loan' : 'Advance'} Repayment`,
          amount: deductAmount,
          type: 'loan',
          description: `${req.repaymentType === 'installments'
            ? `Installment ${Math.floor((req.amountRecovered || 0) / deductAmount) + 1}/${req.installmentMonths || '?'}`
            : 'Full repayment'} - ${req.reason.substring(0, 50)}${req.reason.length > 50 ? '...' : ''}`
        });
      }

      if (autoDeductions.length > 0) {
        console.log('✅ Adding', autoDeductions.length, 'auto-deductions to form:', autoDeductions);

        setPayrollForm(prev => ({
          ...prev,
          deductions: [...prev.deductions, ...autoDeductions]
        }));

        toast({
          title: "Auto-added Deductions",
          description: `${autoDeductions.length} financial request deduction(s) added automatically.`,
        });
      } else {
        console.log('ℹ️ No financial deductions to add');
      }
    } catch (error) {
      console.error('❌ Error fetching financial deductions:', error);
      toast({
        title: "Error",
        description: "Failed to load financial deductions",
        variant: "destructive"
      });
    }
  };

  // Auto-populate employee data when employee is selected
  const handleEmployeeSelect = async (employeeId: string) => {
    console.log('🎯 handleEmployeeSelect called with ID:', employeeId);
    console.log('🔍 Searching in employees:', employees.length);

    const employee = employees.find(e => e.id === employeeId || e.employeeId === employeeId);

    if (!employee) {
      console.error('❌ Employee not found for ID:', employeeId);
      console.log('📋 Available employee IDs:', employees.map(e => ({ id: e.id, employeeId: e.employeeId, name: e.name })));
      return;
    }

    console.log('✅ Selected employee:', employee);

    // Get full employee profile with all data
    const dataFlowService = await getComprehensiveDataFlowService();
    const fullProfile = await dataFlowService.getEmployeeProfile(employeeId);

    console.log('🔍 Full employee profile loaded:', fullProfile);

    const empAny = fullProfile as any;

    // Extract base salary from employee profile (check FULL profile)
    const baseSalary = empAny.workInfo?.salary?.baseSalary ||
      empAny.jobInfo?.salary?.baseSalary ||
      empAny.salary?.baseSalary ||
      empAny.baseSalary ||
      empAny.compensationInfo?.baseSalary ||
      empAny.compensation?.baseSalary ||
      empAny.salaryInfo?.baseSalary ||
      0;

    // Extract hire/start date
    const hireDate = empAny.workInfo?.hireDate ||
      empAny.jobInfo?.hireDate ||
      empAny.dateStarted ||
      empAny.startDate ||
      empAny.hireDate ||
      empAny.employmentInfo?.startDate ||
      '';

    console.log('💰 Full profile salary check:', {
      'workInfo.salary': empAny.workInfo?.salary,
      'workInfo.salary.baseSalary': empAny.workInfo?.salary?.baseSalary,
      'salary': empAny.salary,
      'baseSalary direct': empAny.baseSalary,
      'extractedSalary': baseSalary
    });

    console.log('📅 Full profile hire date check:', {
      'workInfo.hireDate': empAny.workInfo?.hireDate,
      'dateStarted': empAny.dateStarted,
      'extractedHireDate': hireDate
    });

    // Force Nigerian Naira for all payroll (Nigerian HRIS system)
    const currency = 'NGN'; // Always use Nigerian Naira regardless of profile settings

    console.log('💵 Currency:', currency, '(forced to NGN for Nigerian payroll)');

    // Auto-populate basic info, salary, and currency
    setPayrollForm(prev => ({
      ...prev,
      employeeId: employee.employeeId || employee.id,
      employeeName: employee.name,
      department: employee.department || '',
      position: employee.role || '',
      baseSalary: baseSalary,
      currency: currency
    }));

    // Always auto-calculate pay period (use current month as default)
    const firstOfMonth = new Date();
    firstOfMonth.setDate(1);
    const startDate = firstOfMonth.toISOString().split('T')[0];
    const { endDate, payDate } = calculatePayPeriodDates(startDate, payrollForm.payPeriod.type);

    setPayrollForm(prev => ({
      ...prev,
      payPeriod: {
        ...prev.payPeriod,
        startDate,
        endDate,
        payDate
      }
    }));

    console.log('📅 Auto-set pay period:', { startDate, endDate, payDate });

    // Auto-add standard deductions based on employment type and salary
    setTimeout(() => {
      autoAddStandardDeductionsWithSalary(employee, baseSalary);
    }, 100);

    // Auto-add financial request deductions (loans/advances)
    setTimeout(() => {
      autoAddFinancialDeductions(employee.employeeId || employee.id);
    }, 500);
  };

  // Auto-add Nigerian statutory deductions
  const autoAddStandardDeductionsWithSalary = (employee: Employee, salary: number) => {
    const baseSalary = salary || 3000; // Use extracted or default
    const standardDeductions: Deduction[] = [];

    // Get employment type
    const employmentType = employee.employmentType?.toLowerCase() || 'full-time';

    console.log('💼 Employment Type:', employmentType, '| Base Salary:', baseSalary);
    console.log('🇳🇬 Applying Nigerian tax system');

    // Nigerian statutory deductions (applied to all employees)
    standardDeductions.push({
      id: `deduct-${Date.now()}-1`,
      name: 'PAYE (Pay As You Earn)',
      amount: Math.round(baseSalary * 0.07), // 7% PAYE
      type: 'tax',
      description: 'Nigerian income tax'
    });

    standardDeductions.push({
      id: `deduct-${Date.now()}-2`,
      name: 'Pension (Employee)',
      amount: Math.round(baseSalary * 0.08), // 8% employee pension
      type: 'retirement',
      description: 'Employee pension contribution (8%)'
    });

    standardDeductions.push({
      id: `deduct-${Date.now()}-3`,
      name: 'NHF (National Housing Fund)',
      amount: Math.round(baseSalary * 0.025), // 2.5% NHF
      type: 'other',
      description: 'National Housing Fund contribution (2.5%)'
    });

    setPayrollForm(prev => ({
      ...prev,
      deductions: standardDeductions
    }));

    console.log('✅ Auto-added 3 Nigerian statutory deductions (PAYE, Pension, NHF)');
  };

  // Auto-update end date and pay date when start date or type changes
  const handleStartDateChange = (startDate: string) => {
    const { endDate, payDate } = calculatePayPeriodDates(startDate, payrollForm.payPeriod.type);
    setPayrollForm({
      ...payrollForm,
      payPeriod: {
        ...payrollForm.payPeriod,
        startDate,
        endDate,
        payDate
      }
    });
  };

  const handlePayPeriodTypeChange = (type: 'weekly' | 'biweekly' | 'monthly' | 'semimonthly') => {
    const { endDate, payDate } = calculatePayPeriodDates(payrollForm.payPeriod.startDate, type);
    setPayrollForm({
      ...payrollForm,
      payPeriod: {
        ...payrollForm.payPeriod,
        type,
        endDate,
        payDate
      }
    });
  };

  // Format currency based on type
  const formatCurrency = (amount: number, currency?: string) => {
    const curr = currency || payrollForm.currency || 'NGN';
    if (curr === 'NGN') {
      return `₦${amount.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    } else if (curr === 'USD') {
      return `$${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    } else {
      return `${curr} ${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
  };

  // Calculate totals from form
  const calculateFormTotals = () => {
    const grossPay = calculateGrossPay(payrollForm as any);
    const totalDeductions = calculateTotalDeductions(payrollForm as any);
    const netPay = calculateNetPay(payrollForm as any);
    return { grossPay, totalDeductions, netPay };
  };

  // Handle adding a new payroll record
  const handleAddPayroll = async () => {
    try {
      // Validation
      if (!payrollForm.employeeId || !payrollForm.employeeName || !payrollForm.payPeriod.startDate) {
        toast({
          title: 'Validation Error',
          description: 'Please fill in all required fields',
          variant: 'destructive',
        });
        return;
      }

      const payrollService = await getPayrollService();

      // Calculate totals
      const { grossPay, totalDeductions, netPay } = calculateFormTotals();

      // Create payroll record
      const payrollToAdd = {
        employeeId: payrollForm.employeeId,
        employeeName: payrollForm.employeeName,
        department: payrollForm.department,
        position: payrollForm.position,
        payPeriod: {
          id: `pp-${Date.now()}`,
          startDate: new Date(payrollForm.payPeriod.startDate),
          endDate: new Date(payrollForm.payPeriod.endDate),
          payDate: new Date(payrollForm.payPeriod.payDate),
          type: payrollForm.payPeriod.type,
          status: 'open' as const
        },
        baseSalary: payrollForm.baseSalary,
        overtime: payrollForm.overtime,
        bonuses: payrollForm.bonuses,
        allowances: payrollForm.allowances,
        deductions: payrollForm.deductions,
        grossPay,
        totalDeductions,
        netPay,
        paymentStatus: 'pending' as const,
        paymentDate: null,
        paymentMethod: payrollForm.paymentMethod,
        currency: payrollForm.currency,
        notes: payrollForm.notes
      };

      console.log('📝 Creating payroll record:', payrollToAdd);
      const payrollId = await payrollService.createPayrollRecord(payrollToAdd);

      // Update financial requests that had deductions applied
      const financialDeductions = payrollForm.deductions.filter(d => d.id.startsWith('fin-req-'));
      for (const deduction of financialDeductions) {
        const requestId = deduction.id.replace('fin-req-', '');
        try {
          // Get the request to update
          const requests = await payrollService.getFinancialRequestsByEmployee(payrollForm.employeeId);
          const request = requests.find(r => r.id === requestId);

          if (request) {
            const req = request as any;
            const amountRecovered = (req.amountRecovered || 0) + deduction.amount;
            const remainingBalance = (req.remainingBalance || request.amount) - deduction.amount;
            const linkedPayrollIds = [...(req.linkedPayrollIds || []), payrollId];

            await payrollService.updateFinancialRequest(requestId, {
              amountRecovered,
              remainingBalance,
              linkedPayrollIds,
              status: remainingBalance <= 0 ? 'completed' : 'recovering',
              recoveryStartDate: req.recoveryStartDate || new Date(),
              recoveryCompleteDate: remainingBalance <= 0 ? new Date() : undefined
            } as any);

            console.log(`✅ Updated financial request ${requestId}: ₦${amountRecovered} recovered, ₦${remainingBalance} remaining`);
          }
        } catch (error) {
          console.error(`❌ Error updating financial request ${requestId}:`, error);
        }
      }

      // Refresh payroll records list
      const recordsData = await payrollService.getPayrollRecords();
      setPayrollRecords(recordsData);

      // Refresh status counts
      const paidRecords = await payrollService.getPayrollRecordsByStatus('paid');
      const pendingRecords = await payrollService.getPayrollRecordsByStatus('pending');
      const processingRecords = await payrollService.getPayrollRecordsByStatus('processing');

      setStatusCounts({
        paid: paidRecords.length,
        pending: pendingRecords.length,
        processing: processingRecords.length
      });

      // Refresh department data
      const deptData: { [key: string]: { count: number, total: number, average: number } } = {};
      recordsData.forEach(record => {
        if (!deptData[record.department]) {
          deptData[record.department] = {
            count: 0,
            total: 0,
            average: 0
          };
        }
        deptData[record.department].count++;
        deptData[record.department].total += record.grossPay;
      });
      Object.keys(deptData).forEach(dept => {
        deptData[dept].average = deptData[dept].total / deptData[dept].count;
      });
      setDepartmentData(deptData);

      // Send payslip available email notification
      const emailResult = await vercelEmailService.sendPayslipAvailable({
        employeeName: payrollForm.employeeName,
        email: 'employee@company.com', // This should come from employee data
        payPeriod: `${payrollForm.payPeriod.startDate} to ${payrollForm.payPeriod.endDate}`,
        companyName: 'Your Company'
      });

      if (emailResult.success) {
        console.log('✅ Payslip available email sent successfully');
      } else {
        console.warn('⚠️ Failed to send payslip available email:', emailResult.error);
        // Don't throw error - email failure shouldn't break the payroll creation process
      }

      // Close dialog and reset form
      setAddPayrollOpen(false);
      resetForm();

      toast({
        title: '✅ Success',
        description: `Payroll record created for ${payrollForm.employeeName}`,
      });
    } catch (err) {
      console.error('❌ Error adding payroll record:', err);
      toast({
        title: 'Error',
        description: 'Failed to add payroll record. Please try again.',
        variant: 'destructive',
      });
    }
  };

  // View payroll details
  const viewPayroll = (payroll: PayrollRecord) => {
    setSelectedPayroll(payroll);
    setViewPayrollOpen(true);
  };

  // Update payroll status
  const handleUpdatePayrollStatus = async (id: string, paymentStatus: PayrollRecord['paymentStatus']) => {
    try {
      const payrollService = await getPayrollService();

      const updateData: Partial<PayrollRecord> = { paymentStatus };

      // If marking as paid, set payment date
      if (paymentStatus === 'paid') {
        updateData.paymentDate = new Date();
      }

      await payrollService.updatePayrollRecord(id, updateData);

      // Update local state
      setPayrollRecords(prev =>
        prev.map(record =>
          record.id === id ? { ...record, ...updateData } : record
        )
      );

      // If we're viewing this record, update the selected record too
      if (selectedPayroll && selectedPayroll.id === id) {
        setSelectedPayroll({ ...selectedPayroll, ...updateData });
      }

      // Refresh status counts
      const paidRecords = await payrollService.getPayrollRecordsByStatus('paid');
      const pendingRecords = await payrollService.getPayrollRecordsByStatus('pending');
      const processingRecords = await payrollService.getPayrollRecordsByStatus('processing');

      setStatusCounts({
        paid: paidRecords.length,
        pending: pendingRecords.length,
        processing: processingRecords.length
      });

      toast({
        title: '✅ Success',
        description: `Payroll status updated to ${paymentStatus}`,
      });
    } catch (err) {
      console.error('❌ Error updating payroll status:', err);
      toast({
        title: 'Error',
        description: 'Failed to update payroll status',
        variant: 'destructive',
      });
    }
  };

  // Calculate total payroll amount
  const totalPayroll = payrollRecords.reduce((sum, record) => sum + record.netPay, 0);

  // Calculate average salary
  const averageSalary = payrollRecords.length > 0
    ? payrollRecords.reduce((sum, record) => sum + record.baseSalary, 0) / payrollRecords.length
    : 0;

  // Calculate pending financial requests
  const pendingFinancialRequests = financialRequests.filter(req => req.status === 'pending').length;

  return (
    <div className="p-6 md:p-8 min-h-screen bg-gradient-to-br from-blue-50 via-background to-purple-50">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
            <DollarSign className="h-8 w-8 text-primary" />
            Payroll Management
          </h1>
          <p className="text-muted-foreground mt-1">Manage employee payroll with Nigerian tax system (₦)</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button size="sm" onClick={() => setAddPayrollOpen(true)} className="bg-primary hover:bg-primary/90">
            <Plus className="mr-2 h-4 w-4" />
            Create Payroll
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
        <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="bg-blue-500/10 p-3 rounded-xl">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Payroll Records</p>
                <h3 className="text-2xl font-bold">{payrollRecords.length}</h3>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="bg-green-500/10 p-3 rounded-xl">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Payroll</p>
                <h3 className="text-2xl font-bold text-green-600">₦{totalPayroll.toLocaleString()}</h3>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="bg-purple-500/10 p-3 rounded-xl">
                <TrendingUp className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Average Salary</p>
                <h3 className="text-2xl font-bold text-purple-600">₦{Math.round(averageSalary).toLocaleString()}</h3>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="bg-orange-500/10 p-3 rounded-xl">
                <CheckCircle2 className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Payment Status</p>
                <div className="flex flex-wrap gap-1 mt-2">
                  <Badge className="bg-green-100 text-green-700 text-xs">
                    Paid: {statusCounts.paid || 0}
                  </Badge>
                  <Badge className="bg-yellow-100 text-yellow-700 text-xs">
                    Pending: {statusCounts.pending || 0}
                  </Badge>
                  <Badge className="bg-blue-100 text-blue-700 text-xs">
                    Processing: {statusCounts.processing || 0}
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content - Payroll Records Table */}
      <Card className="border-0 shadow-xl">
        <CardHeader>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <CardTitle className="text-2xl">Payroll Records</CardTitle>
              <CardDescription className="mt-1">
                View and manage all employee payroll records
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Input
                placeholder="Search employees..."
                className="max-w-xs"
              />
              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center p-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          ) : error ? (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="font-semibold">Employee</TableHead>
                    <TableHead className="font-semibold">Department</TableHead>
                    <TableHead className="font-semibold">Pay Period</TableHead>
                    <TableHead className="font-semibold">Gross Pay</TableHead>
                    <TableHead className="font-semibold">Deductions</TableHead>
                    <TableHead className="font-semibold">Net Pay</TableHead>
                    <TableHead className="font-semibold">Status</TableHead>
                    <TableHead className="font-semibold text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payrollRecords.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-12">
                        <div className="flex flex-col items-center gap-2">
                          <FileText className="h-12 w-12 text-muted-foreground" />
                          <p className="text-muted-foreground">No payroll records found</p>
                          <Button onClick={() => setAddPayrollOpen(true)} size="sm" className="mt-2">
                            <Plus className="h-4 w-4 mr-2" />
                            Create First Payroll Record
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    payrollRecords.map((record) => (
                      <TableRow key={record.id} className="hover:bg-muted/30">
                        <TableCell>
                          <div className="font-medium">{record.employeeName}</div>
                          <div className="text-sm text-muted-foreground">{record.position}</div>
                        </TableCell>
                        <TableCell>{record.department}</TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {new Date(record.payPeriod.startDate).toLocaleDateString()} -
                            {new Date(record.payPeriod.endDate).toLocaleDateString()}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Pay: {new Date(record.payPeriod.payDate).toLocaleDateString()}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">₦{record.grossPay.toLocaleString()}</div>
                          {record.allowances.length > 0 && (
                            <div className="text-xs text-green-600">
                              +₦{record.allowances.reduce((sum, a) => sum + a.amount, 0).toLocaleString()} allowances
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="font-medium text-red-600">-₦{record.totalDeductions.toLocaleString()}</div>
                          {record.deductions.length > 0 && (
                            <div className="text-xs text-muted-foreground">
                              {record.deductions.length} items
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="font-bold text-green-600">₦{record.netPay.toLocaleString()}</div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={record.paymentStatus === 'paid' ? 'success' :
                              record.paymentStatus === 'pending' ? 'warning' :
                                record.paymentStatus === 'processing' ? 'secondary' : 'destructive'}
                          >
                            {record.paymentStatus.charAt(0).toUpperCase() + record.paymentStatus.slice(1)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            {record.paymentStatus === 'pending' && (
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-blue-600 hover:text-blue-700 border-blue-300"
                                onClick={() => handleUpdatePayrollStatus(record.id, 'paid')}
                              >
                                <CheckCircle2 className="h-3 w-3 mr-1" />
                                Mark Paid
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => viewPayroll(record)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-destructive hover:text-destructive"
                              onClick={() => {
                                setPayrollToDelete(record.id);
                                setDeleteConfirmOpen(true);
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Financial Requests Section */}
      <Card className="border-0 shadow-xl mt-6">
        <CardHeader>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <CardTitle className="text-2xl flex items-center gap-2">
                <Banknote className="h-6 w-6 text-primary" />
                Financial Requests
              </CardTitle>
              <CardDescription className="mt-1">
                Manage employee salary advances, loans, reimbursements, and allowances
              </CardDescription>
            </div>
            <Badge className="bg-orange-100 text-orange-700">
              {pendingFinancialRequests} Pending
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center p-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          ) : financialRequests.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 text-center">
              <FileText className="h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Financial Requests</h3>
              <p className="text-muted-foreground">Employees can submit requests for advances, loans, or reimbursements</p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="font-semibold">Employee</TableHead>
                    <TableHead className="font-semibold">Request Type</TableHead>
                    <TableHead className="font-semibold">Amount</TableHead>
                    <TableHead className="font-semibold">Reason</TableHead>
                    <TableHead className="font-semibold">Date</TableHead>
                    <TableHead className="font-semibold">Status</TableHead>
                    <TableHead className="font-semibold text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {financialRequests.map((request) => (
                    <TableRow key={request.id} className="hover:bg-muted/30">
                      <TableCell>
                        <div className="font-medium">{request.employeeId}</div>
                        <div className="text-xs text-muted-foreground">ID: {request.employeeId}</div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="capitalize">
                          {request.requestType.replace('_', ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="font-bold text-green-600">₦{request.amount.toLocaleString()}</div>
                      </TableCell>
                      <TableCell>
                        <div className="max-w-xs truncate text-sm">{request.reason}</div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">{new Date(request.createdAt).toLocaleDateString()}</div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            request.status === 'approved' ? 'success' :
                              request.status === 'pending' ? 'warning' :
                                request.status === 'rejected' ? 'destructive' : 'secondary'
                          }
                        >
                          {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          {request.status === 'pending' && (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-green-600 hover:text-green-700 border-green-300"
                                onClick={async () => {
                                  try {
                                    const payrollService = await getPayrollService();
                                    await payrollService.updateFinancialRequest(request.id, {
                                      status: 'approved',
                                      approvedAt: new Date(),
                                      approvedBy: 'HR Manager' // TODO: Get current user
                                    });
                                    toast({
                                      title: "Request Approved",
                                      description: `Financial request for ₦${request.amount.toLocaleString()} has been approved.`,
                                    });
                                    // Refresh requests
                                    const requestsData = await payrollService.getFinancialRequests();
                                    setFinancialRequests(requestsData);
                                  } catch (error) {
                                    toast({
                                      title: "Error",
                                      description: "Failed to approve request",
                                      variant: "destructive"
                                    });
                                  }
                                }}
                              >
                                <CheckCircle2 className="h-3 w-3 mr-1" />
                                Approve
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-red-600 hover:text-red-700 border-red-300"
                                onClick={async () => {
                                  try {
                                    const payrollService = await getPayrollService();
                                    await payrollService.updateFinancialRequest(request.id, {
                                      status: 'rejected'
                                    });
                                    toast({
                                      title: "Request Rejected",
                                      description: "Financial request has been rejected.",
                                    });
                                    // Refresh requests
                                    const requestsData = await payrollService.getFinancialRequests();
                                    setFinancialRequests(requestsData);
                                  } catch (error) {
                                    toast({
                                      title: "Error",
                                      description: "Failed to reject request",
                                      variant: "destructive"
                                    });
                                  }
                                }}
                              >
                                <X className="h-3 w-3 mr-1" />
                                Reject
                              </Button>
                            </>
                          )}
                          {request.status === 'approved' && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-blue-600 hover:text-blue-700 border-blue-300"
                              onClick={async () => {
                                try {
                                  const payrollService = await getPayrollService();

                                  // Calculate installment amount (preserve existing if already set)
                                  const req = request as any;
                                  let installmentAmount = req.installmentAmount; // Use existing if available

                                  // Only recalculate if not set or equals full amount (needs recalculation)
                                  if (!installmentAmount || installmentAmount >= request.amount) {
                                    if (req.repaymentType === 'installments' && req.installmentMonths && req.installmentMonths > 1) {
                                      installmentAmount = Math.ceil(request.amount / req.installmentMonths);
                                    } else {
                                      installmentAmount = request.amount; // Full repayment
                                    }
                                  }

                                  console.log('💰 Marking as paid:', {
                                    amount: request.amount,
                                    repaymentType: req.repaymentType,
                                    installmentMonths: req.installmentMonths,
                                    existingInstallmentAmount: req.installmentAmount,
                                    calculatedInstallmentAmount: installmentAmount
                                  });

                                  await payrollService.updateFinancialRequest(request.id, {
                                    status: 'paid',
                                    paidAt: new Date(),
                                    remainingBalance: request.amount,  // Initialize with full amount
                                    amountRecovered: 0,
                                    installmentAmount: installmentAmount,
                                    repaymentMethod: req.repaymentMethod || 'salary_deduction',
                                    repaymentType: req.repaymentType || 'full',
                                    installmentMonths: req.installmentMonths || 1
                                  } as any);

                                  toast({
                                    title: "Request Marked as Paid",
                                    description: `₦${request.amount.toLocaleString()} has been marked as paid. It will be auto-deducted from next payroll (₦${installmentAmount.toLocaleString()} per payroll).`,
                                  });

                                  // Refresh requests
                                  const requestsData = await payrollService.getFinancialRequests();
                                  setFinancialRequests(requestsData);
                                } catch (error) {
                                  console.error('❌ Error marking as paid:', error);
                                  toast({
                                    title: "Error",
                                    description: "Failed to mark as paid",
                                    variant: "destructive"
                                  });
                                }
                              }}
                            >
                              <DollarSign className="h-3 w-3 mr-1" />
                              Mark Paid
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedRequest(request);
                              setShowRequestDetails(true);
                            }}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Enhanced Add Payroll Dialog */}
      <Dialog open={addPayrollOpen} onOpenChange={(open) => {
        if (open) {
          console.log('📝 Opening payroll dialog');
          console.log('👥 Available employees:', employees.length);
          console.log('📋 Employees data:', employees);
        }
        setAddPayrollOpen(open);
      }}>
        <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create Payroll Record</DialogTitle>
            <DialogDescription>
              Create a detailed payroll record with earnings, allowances, and deductions.
            </DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="basic">Basic Info</TabsTrigger>
              <TabsTrigger value="earnings">Earnings</TabsTrigger>
              <TabsTrigger value="allowances">Allowances</TabsTrigger>
              <TabsTrigger value="deductions">Deductions</TabsTrigger>
            </TabsList>

            {/* Basic Info Tab */}
            <TabsContent value="basic" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="employeeSelect">Select Employee *</Label>
                {loading ? (
                  <div className="flex items-center justify-center p-4 border rounded-md">
                    <p className="text-sm text-muted-foreground">Loading employees...</p>
                  </div>
                ) : employees.length === 0 ? (
                  <div className="flex items-center justify-center p-4 border rounded-md border-yellow-300 bg-yellow-50">
                    <p className="text-sm text-yellow-700">No employees found. Please add employees first.</p>
                  </div>
                ) : (
                  <Select
                    value={payrollForm.employeeId}
                    onValueChange={handleEmployeeSelect}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Choose an employee to create payroll for..." />
                    </SelectTrigger>
                    <SelectContent>
                      {employees.map((employee) => (
                        <SelectItem
                          key={employee.id}
                          value={employee.employeeId || employee.id}
                        >
                          <div className="flex items-center justify-between w-full">
                            <span className="font-medium">{employee.name}</span>
                            <span className="text-xs text-muted-foreground ml-4">
                              {employee.department} • {employee.employmentType || 'Full-time'}
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
                {!loading && employees.length > 0 && (
                  <p className="text-xs text-muted-foreground">
                    {employees.length} employee{employees.length !== 1 ? 's' : ''} available
                  </p>
                )}
                <p className="text-xs text-muted-foreground">
                  💡 Department, position, and tax deductions will be auto-populated based on employee type
                </p>
              </div>

              {payrollForm.employeeId && (
                <Alert className="bg-blue-50 border-blue-200">
                  <Users className="h-4 w-4 text-blue-600" />
                  <AlertTitle className="text-blue-900">Employee Selected</AlertTitle>
                  <AlertDescription className="text-blue-800">
                    <div className="grid grid-cols-2 gap-2 mt-2 text-sm">
                      <div><strong>Name:</strong> {payrollForm.employeeName}</div>
                      <div><strong>Department:</strong> {payrollForm.department}</div>
                      <div><strong>Position:</strong> {payrollForm.position}</div>
                      <div><strong>Employee ID:</strong> {payrollForm.employeeId}</div>
                    </div>
                  </AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label>Pay Period * (Auto-calculated)</Label>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="startDate" className="text-xs">Start Date *</Label>
                    <Input
                      id="startDate"
                      type="date"
                      value={payrollForm.payPeriod.startDate}
                      onChange={(e) => handleStartDateChange(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="endDate" className="text-xs">End Date (Auto)</Label>
                    <Input
                      id="endDate"
                      type="date"
                      value={payrollForm.payPeriod.endDate}
                      disabled
                      className="bg-muted cursor-not-allowed"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="payDate" className="text-xs">Pay Date (Auto)</Label>
                    <Input
                      id="payDate"
                      type="date"
                      value={payrollForm.payPeriod.payDate}
                      disabled
                      className="bg-muted cursor-not-allowed"
                    />
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  💡 End date and pay date are calculated automatically based on the start date and pay period type
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="payPeriodType">Pay Period Type *</Label>
                  <Select
                    value={payrollForm.payPeriod.type}
                    onValueChange={(value: any) => handlePayPeriodTypeChange(value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="weekly">Weekly (7 days)</SelectItem>
                      <SelectItem value="biweekly">Bi-weekly (14 days)</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="semimonthly">Semi-monthly (1st-15th, 16th-end)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="paymentMethod">Payment Method</Label>
                  <Select
                    value={payrollForm.paymentMethod}
                    onValueChange={(value: any) => setPayrollForm({ ...payrollForm, paymentMethod: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select method" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                      <SelectItem value="check">Check</SelectItem>
                      <SelectItem value="cash">Cash</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-blue-900">Currency</span>
                  <span className="text-lg font-bold text-blue-700">
                    {payrollForm.currency === 'NGN' ? '₦ Nigerian Naira (NGN)' :
                      payrollForm.currency === 'USD' ? '$ US Dollar (USD)' :
                        payrollForm.currency || 'NGN'}
                  </span>
                </div>
                <p className="text-xs text-blue-600 mt-1">Auto-detected from employee profile</p>
              </div>
            </TabsContent>

            {/* Earnings Tab */}
            <TabsContent value="earnings" className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="baseSalary">Base Salary (₦)</Label>
                  <Input
                    id="baseSalary"
                    type="number"
                    value={payrollForm.baseSalary}
                    onChange={(e) => setPayrollForm({ ...payrollForm, baseSalary: parseFloat(e.target.value) || 0 })}
                    placeholder="0.00"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="overtime">Overtime (₦)</Label>
                  <Input
                    id="overtime"
                    type="number"
                    value={payrollForm.overtime}
                    onChange={(e) => setPayrollForm({ ...payrollForm, overtime: parseFloat(e.target.value) || 0 })}
                    placeholder="0.00"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bonuses">Bonuses (₦)</Label>
                  <Input
                    id="bonuses"
                    type="number"
                    value={payrollForm.bonuses}
                    onChange={(e) => setPayrollForm({ ...payrollForm, bonuses: parseFloat(e.target.value) || 0 })}
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-green-900">Gross Pay (Calculated)</span>
                  <span className="text-2xl font-bold text-green-700">
                    {formatCurrency(calculateFormTotals().grossPay, 'NGN')}
                  </span>
                </div>
                <p className="text-xs text-green-600">
                  Base + Overtime + Bonuses + Allowances
                </p>
              </div>
            </TabsContent>

            {/* Allowances Tab */}
            <TabsContent value="allowances" className="space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-medium">Allowances</h3>
                  <p className="text-sm text-muted-foreground">Add monthly allowances for the employee</p>
                </div>
                <Button onClick={addAllowance} size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Allowance
                </Button>
              </div>

              {payrollForm.allowances.length === 0 ? (
                <div className="text-center p-8 border-2 border-dashed rounded-lg">
                  <Banknote className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                  <p className="text-muted-foreground">No allowances added yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {payrollForm.allowances.map((allowance) => (
                    <Card key={allowance.id} className="p-4">
                      <div className="grid grid-cols-12 gap-3 items-end">
                        <div className="col-span-4 space-y-1">
                          <Label className="text-xs">Name</Label>
                          <Input
                            value={allowance.name}
                            onChange={(e) => updateAllowance(allowance.id, 'name', e.target.value)}
                            placeholder="Transportation"
                          />
                        </div>
                        <div className="col-span-2 space-y-1">
                          <Label className="text-xs">Amount (₦)</Label>
                          <Input
                            type="number"
                            value={allowance.amount}
                            onChange={(e) => updateAllowance(allowance.id, 'amount', parseFloat(e.target.value) || 0)}
                            placeholder="0.00"
                          />
                        </div>
                        <div className="col-span-2 space-y-1">
                          <Label className="text-xs">Type</Label>
                          <Select
                            value={allowance.type}
                            onValueChange={(value) => updateAllowance(allowance.id, 'type', value)}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="fixed">Fixed</SelectItem>
                              <SelectItem value="variable">Variable</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="col-span-3 space-y-1">
                          <Label className="text-xs">Taxable</Label>
                          <Select
                            value={allowance.taxable ? 'yes' : 'no'}
                            onValueChange={(value) => updateAllowance(allowance.id, 'taxable', value === 'yes')}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="yes">Yes</SelectItem>
                              <SelectItem value="no">No</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="col-span-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeAllowance(allowance.id)}
                            className="text-destructive"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* Deductions Tab */}
            <TabsContent value="deductions" className="space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-medium">Deductions</h3>
                  <p className="text-sm text-muted-foreground">
                    {payrollForm.deductions.length > 0 ?
                      `${payrollForm.deductions.length} deductions (PAYE, Pension, NHF auto-added)` :
                      'Nigerian statutory deductions (PAYE, Pension, NHF) are auto-added when you select an employee'}
                  </p>
                </div>
                <Button onClick={addDeduction} size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Deduction
                </Button>
              </div>

              {payrollForm.deductions.length === 0 ? (
                <div className="text-center p-8 border-2 border-dashed rounded-lg">
                  <DollarSign className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                  <p className="text-muted-foreground">No deductions added yet</p>
                  <p className="text-xs text-muted-foreground mt-2">
                    Select an employee first to auto-add tax deductions
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {payrollForm.deductions.map((deduction) => (
                    <Card key={deduction.id} className="p-4">
                      <div className="space-y-3">
                        <div className="grid grid-cols-12 gap-3 items-end">
                          <div className="col-span-5 space-y-1">
                            <Label className="text-xs">Name</Label>
                            <Input
                              value={deduction.name}
                              onChange={(e) => updateDeduction(deduction.id, 'name', e.target.value)}
                              placeholder="Federal Tax / PAYE / etc."
                            />
                          </div>
                          <div className="col-span-2 space-y-1">
                            <Label className="text-xs">Amount (₦)</Label>
                            <Input
                              type="number"
                              value={deduction.amount}
                              onChange={(e) => updateDeduction(deduction.id, 'amount', parseFloat(e.target.value) || 0)}
                              placeholder="0.00"
                            />
                          </div>
                          <div className="col-span-4 space-y-1">
                            <Label className="text-xs">Type</Label>
                            <Select
                              value={deduction.type}
                              onValueChange={(value) => updateDeduction(deduction.id, 'type', value)}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="tax">Tax</SelectItem>
                                <SelectItem value="insurance">Insurance</SelectItem>
                                <SelectItem value="retirement">Retirement/Pension</SelectItem>
                                <SelectItem value="loan">Loan Repayment</SelectItem>
                                <SelectItem value="other">Other</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="col-span-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeDeduction(deduction.id)}
                              className="text-destructive"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">Description (Optional)</Label>
                          <Input
                            value={deduction.description || ''}
                            onChange={(e) => updateDeduction(deduction.id, 'description', e.target.value)}
                            placeholder="e.g., National Housing Fund contribution"
                            className="text-sm"
                          />
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}

              <div className="p-4 bg-red-50 border border-red-200 rounded-lg space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-red-900">Total Deductions</span>
                  <span className="text-xl font-bold text-red-700">
                    -{formatCurrency(calculateFormTotals().totalDeductions, 'NGN')}
                  </span>
                </div>
                <div className="border-t border-red-200 pt-2 flex justify-between items-center">
                  <span className="text-lg font-semibold text-green-900">Net Pay</span>
                  <span className="text-2xl font-bold text-green-700">
                    {formatCurrency(calculateFormTotals().netPay, 'NGN')}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Gross Pay - Total Deductions = Net Pay
                </p>
              </div>
            </TabsContent>
          </Tabs>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => {
              setAddPayrollOpen(false);
              resetForm();
            }}>
              Cancel
            </Button>
            <Button onClick={handleAddPayroll}>
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Create Payroll Record
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Existing dialogs below... */}
      <Dialog open={viewPayrollOpen} onOpenChange={setViewPayrollOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Payroll Record Details</DialogTitle>
          </DialogHeader>
          {selectedPayroll && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs text-muted-foreground">Employee</Label>
                  <p className="font-medium">{selectedPayroll.employeeName}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Department</Label>
                  <p className="font-medium">{selectedPayroll.department}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs text-muted-foreground">Gross Pay</Label>
                  <p className="font-medium text-lg">{formatCurrency(selectedPayroll.grossPay, selectedPayroll.currency)}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Net Pay</Label>
                  <p className="font-medium text-lg text-green-600">{formatCurrency(selectedPayroll.netPay, selectedPayroll.currency)}</p>
                </div>
              </div>
              {selectedPayroll.allowances.length > 0 && (
                <div>
                  <Label className="text-xs text-muted-foreground">Allowances</Label>
                  <div className="mt-2 space-y-1">
                    {selectedPayroll.allowances.map(a => (
                      <div key={a.id} className="flex justify-between text-sm">
                        <span>{a.name}</span>
                        <span className="font-medium">${a.amount.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {selectedPayroll.deductions.length > 0 && (
                <div>
                  <Label className="text-xs text-muted-foreground">Deductions</Label>
                  <div className="mt-2 space-y-1">
                    {selectedPayroll.deductions.map(d => (
                      <div key={d.id} className="flex justify-between text-sm">
                        <span>{d.name}</span>
                        <span className="font-medium text-red-600">-${d.amount.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewPayrollOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Rest of dialogs... */}
      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this payroll record? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirmOpen(false)}>Cancel</Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (payrollToDelete) {
                  handleDeletePayroll(payrollToDelete);
                  setDeleteConfirmOpen(false);
                }
              }}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Financial Request Details Dialog */}
      <Dialog open={showRequestDetails} onOpenChange={setShowRequestDetails}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Financial Request Details</DialogTitle>
            <DialogDescription>
              Review the financial request information
            </DialogDescription>
          </DialogHeader>
          {selectedRequest && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-semibold">Employee ID</Label>
                  <p className="text-sm mt-1">{selectedRequest.employeeId}</p>
                </div>
                <div>
                  <Label className="text-sm font-semibold">Request Type</Label>
                  <p className="text-sm mt-1 capitalize">{selectedRequest.requestType.replace('_', ' ')}</p>
                </div>
                <div>
                  <Label className="text-sm font-semibold">Amount</Label>
                  <p className="text-sm mt-1 font-bold text-green-600">₦{selectedRequest.amount.toLocaleString()}</p>
                </div>
                <div>
                  <Label className="text-sm font-semibold">Status</Label>
                  <Badge className="mt-1" variant={
                    selectedRequest.status === 'approved' ? 'success' :
                      selectedRequest.status === 'pending' ? 'warning' :
                        selectedRequest.status === 'rejected' ? 'destructive' : 'secondary'
                  }>
                    {selectedRequest.status.charAt(0).toUpperCase() + selectedRequest.status.slice(1)}
                  </Badge>
                </div>
                <div>
                  <Label className="text-sm font-semibold">Request Date</Label>
                  <p className="text-sm mt-1">{new Date(selectedRequest.createdAt).toLocaleString()}</p>
                </div>
                {selectedRequest.approvedAt && (
                  <div>
                    <Label className="text-sm font-semibold">Approved Date</Label>
                    <p className="text-sm mt-1">{new Date(selectedRequest.approvedAt).toLocaleString()}</p>
                  </div>
                )}
                {selectedRequest.approvedBy && (
                  <div>
                    <Label className="text-sm font-semibold">Approved By</Label>
                    <p className="text-sm mt-1">{selectedRequest.approvedBy}</p>
                  </div>
                )}
              </div>
              <div>
                <Label className="text-sm font-semibold">Reason</Label>
                <p className="text-sm mt-2 p-3 bg-muted rounded-md">{selectedRequest.reason}</p>
              </div>
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
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRequestDetails(false)}>
              Close
            </Button>
            {selectedRequest && selectedRequest.status === 'pending' && (
              <div className="flex gap-2">
                <Button
                  variant="destructive"
                  onClick={async () => {
                    try {
                      const payrollService = await getPayrollService();
                      await payrollService.updateFinancialRequest(selectedRequest.id, {
                        status: 'rejected'
                      });
                      toast({
                        title: "Request Rejected",
                        description: "Financial request has been rejected.",
                      });
                      setShowRequestDetails(false);
                      // Refresh requests
                      const requestsData = await payrollService.getFinancialRequests();
                      setFinancialRequests(requestsData);
                    } catch (error) {
                      toast({
                        title: "Error",
                        description: "Failed to reject request",
                        variant: "destructive"
                      });
                    }
                  }}
                >
                  <X className="h-4 w-4 mr-2" />
                  Reject
                </Button>
                <Button
                  onClick={async () => {
                    try {
                      const payrollService = await getPayrollService();
                      await payrollService.updateFinancialRequest(selectedRequest.id, {
                        status: 'approved',
                        approvedAt: new Date(),
                        approvedBy: 'HR Manager' // TODO: Get current user
                      });
                      toast({
                        title: "Request Approved",
                        description: `Financial request for ₦${selectedRequest.amount.toLocaleString()} has been approved.`,
                      });
                      setShowRequestDetails(false);
                      // Refresh requests
                      const requestsData = await payrollService.getFinancialRequests();
                      setFinancialRequests(requestsData);
                    } catch (error) {
                      toast({
                        title: "Error",
                        description: "Failed to approve request",
                        variant: "destructive"
                      });
                    }
                  }}
                >
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Approve
                </Button>
              </div>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
