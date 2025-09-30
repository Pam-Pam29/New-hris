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

// Use the singleton from service
const getPayrollService = getPayrollServiceImport;

export default function Payroll() {
  const [payrollRecords, setPayrollRecords] = useState<PayrollRecord[]>([]);
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
    currency: 'USD',
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
      currency: 'USD',
      notes: ''
    });
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
      await payrollService.createPayrollRecord(payrollToAdd);

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
    <div className="p-8 min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="flex justify-between items-center mb-8">
        <TypographyH2>Payroll Management</TypographyH2>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button size="sm" onClick={() => setAddPayrollOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Payroll
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card className="p-4">
          <div className="flex items-center gap-4">
            <div className="bg-primary/10 p-3 rounded-full">
              <Users className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium">Active Employees</p>
              <h3 className="text-2xl font-bold">{payrollRecords.length}</h3>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-4">
            <div className="bg-primary/10 p-3 rounded-full">
              <DollarSign className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium">Total Payroll</p>
              <h3 className="text-2xl font-bold">${totalPayroll.toLocaleString()}</h3>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-4">
            <div className="bg-primary/10 p-3 rounded-full">
              <TrendingUp className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium">Average Salary</p>
              <h3 className="text-2xl font-bold">${averageSalary.toLocaleString()}</h3>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-4">
            <div className="bg-primary/10 p-3 rounded-full">
              <CheckCircle2 className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium">Payment Status</p>
              <div className="flex gap-2 mt-1">
                <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                  Paid: {statusCounts.paid || 0}
                </Badge>
                <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
                  Pending: {statusCounts.pending || 0}
                </Badge>
                <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">
                  Processing: {statusCounts.processing || 0}
                </Badge>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Payroll Overview */}
        <div className="lg:col-span-2">
          <Card className="border-0 shadow-lg bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-green-600" />
                Payroll Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center items-center p-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : error ? (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              ) : (
                <div className="space-y-4">
                  {Object.keys(departmentData).length === 0 ? (
                    <div className="text-center p-4 text-muted-foreground">
                      No department data available
                    </div>
                  ) : (
                    Object.entries(departmentData).map(([dept, data]) => (
                      <div key={dept} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                        <div>
                          <div className="font-medium">{dept.charAt(0).toUpperCase() + dept.slice(1)} Department</div>
                          <div className="text-sm text-muted-foreground">{data.count} employees</div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold">${data.total.toLocaleString()}</div>
                          <div className="text-sm text-muted-foreground">Avg: ${Math.round(data.average).toLocaleString()}</div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Payroll Records */}
          <div className="mt-8">
            <Card className="border-0 shadow-lg bg-card/50 backdrop-blur-sm">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Payroll Records</CardTitle>
                <div className="flex gap-2">
                  <Input
                    placeholder="Search employees..."
                    className="max-w-xs"
                  />
                  <Button variant="outline" size="icon">
                    <Filter className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex justify-center items-center p-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
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
                        <TableRow>
                          <TableHead>Employee</TableHead>
                          <TableHead>Department</TableHead>
                          <TableHead>Pay Period</TableHead>
                          <TableHead>Gross Pay</TableHead>
                          <TableHead>Deductions</TableHead>
                          <TableHead>Net Pay</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {payrollRecords.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={8} className="text-center py-4">
                              No payroll records found. Click "Add Payroll" to create one.
                            </TableCell>
                          </TableRow>
                        ) : (
                          payrollRecords.map((record) => (
                            <TableRow key={record.id}>
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
                                <div className="font-medium">${record.grossPay.toLocaleString()}</div>
                                {record.allowances.length > 0 && (
                                  <div className="text-xs text-green-600">
                                    +${record.allowances.reduce((sum, a) => sum + a.amount, 0).toLocaleString()} allowances
                                  </div>
                                )}
                              </TableCell>
                              <TableCell>
                                <div className="font-medium text-red-600">-${record.totalDeductions.toLocaleString()}</div>
                                {record.deductions.length > 0 && (
                                  <div className="text-xs text-muted-foreground">
                                    {record.deductions.length} items
                                  </div>
                                )}
                              </TableCell>
                              <TableCell>
                                <div className="font-bold text-green-600">${record.netPay.toLocaleString()}</div>
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
                              <TableCell>
                                <div className="flex space-x-2">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => viewPayroll(record)}
                                  >
                                    <Eye className="h-4 w-4 mr-1" />
                                    View
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
                                    <Trash2 className="h-4 w-4 mr-1" />
                                    Delete
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
          </div>
        </div>

        {/* Enhanced Add Payroll Dialog */}
        <Dialog open={addPayrollOpen} onOpenChange={setAddPayrollOpen}>
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
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="employeeId">Employee ID *</Label>
                    <Input
                      id="employeeId"
                      value={payrollForm.employeeId}
                      onChange={(e) => setPayrollForm({ ...payrollForm, employeeId: e.target.value })}
                      placeholder="EMP-001"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="employeeName">Employee Name *</Label>
                    <Input
                      id="employeeName"
                      value={payrollForm.employeeName}
                      onChange={(e) => setPayrollForm({ ...payrollForm, employeeName: e.target.value })}
                      placeholder="John Doe"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="department">Department</Label>
                    <Select
                      value={payrollForm.department}
                      onValueChange={(value) => setPayrollForm({ ...payrollForm, department: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select department" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Engineering">Engineering</SelectItem>
                        <SelectItem value="Marketing">Marketing</SelectItem>
                        <SelectItem value="Sales">Sales</SelectItem>
                        <SelectItem value="Human Resources">Human Resources</SelectItem>
                        <SelectItem value="Finance">Finance</SelectItem>
                        <SelectItem value="Operations">Operations</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="position">Position</Label>
                    <Input
                      id="position"
                      value={payrollForm.position}
                      onChange={(e) => setPayrollForm({ ...payrollForm, position: e.target.value })}
                      placeholder="Software Engineer"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Pay Period *</Label>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="startDate" className="text-xs">Start Date</Label>
                      <Input
                        id="startDate"
                        type="date"
                        value={payrollForm.payPeriod.startDate}
                        onChange={(e) => setPayrollForm({
                          ...payrollForm,
                          payPeriod: { ...payrollForm.payPeriod, startDate: e.target.value }
                        })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="endDate" className="text-xs">End Date</Label>
                      <Input
                        id="endDate"
                        type="date"
                        value={payrollForm.payPeriod.endDate}
                        onChange={(e) => setPayrollForm({
                          ...payrollForm,
                          payPeriod: { ...payrollForm.payPeriod, endDate: e.target.value }
                        })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="payDate" className="text-xs">Pay Date</Label>
                      <Input
                        id="payDate"
                        type="date"
                        value={payrollForm.payPeriod.payDate}
                        onChange={(e) => setPayrollForm({
                          ...payrollForm,
                          payPeriod: { ...payrollForm.payPeriod, payDate: e.target.value }
                        })}
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="payPeriodType">Pay Period Type</Label>
                    <Select
                      value={payrollForm.payPeriod.type}
                      onValueChange={(value: any) => setPayrollForm({
                        ...payrollForm,
                        payPeriod: { ...payrollForm.payPeriod, type: value }
                      })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="biweekly">Bi-weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                        <SelectItem value="semimonthly">Semi-monthly</SelectItem>
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
              </TabsContent>

              {/* Earnings Tab */}
              <TabsContent value="earnings" className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="baseSalary">Base Salary</Label>
                    <Input
                      id="baseSalary"
                      type="number"
                      value={payrollForm.baseSalary}
                      onChange={(e) => setPayrollForm({ ...payrollForm, baseSalary: parseFloat(e.target.value) || 0 })}
                      placeholder="0.00"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="overtime">Overtime</Label>
                    <Input
                      id="overtime"
                      type="number"
                      value={payrollForm.overtime}
                      onChange={(e) => setPayrollForm({ ...payrollForm, overtime: parseFloat(e.target.value) || 0 })}
                      placeholder="0.00"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bonuses">Bonuses</Label>
                    <Input
                      id="bonuses"
                      type="number"
                      value={payrollForm.bonuses}
                      onChange={(e) => setPayrollForm({ ...payrollForm, bonuses: parseFloat(e.target.value) || 0 })}
                      placeholder="0.00"
                    />
                  </div>
                </div>

                <div className="p-4 bg-muted rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">Gross Pay (Calculated)</span>
                    <span className="text-2xl font-bold text-green-600">
                      ${calculateFormTotals().grossPay.toLocaleString()}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
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
                            <Label className="text-xs">Amount</Label>
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
                    <p className="text-sm text-muted-foreground">Add taxes, insurance, and other deductions</p>
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
                  </div>
                ) : (
                  <div className="space-y-3">
                    {payrollForm.deductions.map((deduction) => (
                      <Card key={deduction.id} className="p-4">
                        <div className="grid grid-cols-12 gap-3 items-end">
                          <div className="col-span-5 space-y-1">
                            <Label className="text-xs">Name</Label>
                            <Input
                              value={deduction.name}
                              onChange={(e) => updateDeduction(deduction.id, 'name', e.target.value)}
                              placeholder="Federal Tax"
                            />
                          </div>
                          <div className="col-span-3 space-y-1">
                            <Label className="text-xs">Amount</Label>
                            <Input
                              type="number"
                              value={deduction.amount}
                              onChange={(e) => updateDeduction(deduction.id, 'amount', parseFloat(e.target.value) || 0)}
                              placeholder="0.00"
                            />
                          </div>
                          <div className="col-span-3 space-y-1">
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
                                <SelectItem value="retirement">Retirement</SelectItem>
                                <SelectItem value="loan">Loan</SelectItem>
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
                      </Card>
                    ))}
                  </div>
                )}

                <div className="p-4 bg-muted rounded-lg space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Total Deductions</span>
                    <span className="text-xl font-bold text-red-600">
                      -${calculateFormTotals().totalDeductions.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold">Net Pay</span>
                    <span className="text-2xl font-bold text-green-600">
                      ${calculateFormTotals().netPay.toLocaleString()}
                    </span>
                  </div>
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
                    <p className="font-medium text-lg">${selectedPayroll.grossPay.toLocaleString()}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Net Pay</Label>
                    <p className="font-medium text-lg text-green-600">${selectedPayroll.netPay.toLocaleString()}</p>
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
      </div>
    </div>
  );
}
