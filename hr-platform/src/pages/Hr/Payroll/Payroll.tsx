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
  Briefcase
} from 'lucide-react';

// Import Firebase services
import { getServiceConfig, initializeFirebase } from '../../../config/firebase';
import { PayrollRecord } from '../../../services/payrollService';

// Firebase service instances
let payrollServiceInstance: any = null;

// Initialize services
const getPayrollService = async () => {
  if (!payrollServiceInstance) {
    const { FirebasePayrollService } = await import('../../../services/payrollService');
    const config = await getServiceConfig();
    if (config.firebase.enabled && config.firebase.db) {
      payrollServiceInstance = new FirebasePayrollService(config.firebase.db);
    }
  }
  return payrollServiceInstance;
};

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

  // Form states
  const [newPayroll, setNewPayroll] = useState({
    employeeId: '',
    employeeName: '',
    department: '',
    position: '',
    baseSalary: 0,
    bonus: 0,
    deductions: 0,
    netPay: 0,
    payPeriod: '',
    paymentDate: null,
    status: 'pending' as const
  });

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

        // Get active payroll records (not archived)
        const activeRecords = await payrollService.getPayrollRecordsByStatus('paid');
        const pendingRecords = await payrollService.getPayrollRecordsByStatus('pending');
        const processingRecords = await payrollService.getPayrollRecordsByStatus('processing');

        // Set status counts
        setStatusCounts({
          paid: activeRecords.length,
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
          deptData[record.department].total += record.baseSalary + (record.bonus || 0);
        });

        // Calculate averages
        Object.keys(deptData).forEach(dept => {
          deptData[dept].average = deptData[dept].total / deptData[dept].count;
        });

        setDepartmentData(deptData);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching payroll data:', err);
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
        deptData[record.department].total += record.baseSalary + (record.bonus || 0);
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

  // Handle adding a new payroll record
  const handleAddPayroll = async () => {
    try {
      const payrollService = await getPayrollService();

      // Calculate net pay
      const netPay = newPayroll.baseSalary + newPayroll.bonus - newPayroll.deductions;

      // Create payroll record
      const payrollToAdd = {
        ...newPayroll,
        netPay,
        paymentDate: newPayroll.paymentDate || new Date(),
      };

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
        deptData[record.department].total += record.baseSalary + (record.bonus || 0);
      });

      // Calculate averages
      Object.keys(deptData).forEach(dept => {
        deptData[dept].average = deptData[dept].total / deptData[dept].count;
      });

      setDepartmentData(deptData);

      // Close dialog and reset form
      setAddPayrollOpen(false);
      setNewPayroll({
        employeeId: '',
        employeeName: '',
        department: '',
        position: '',
        baseSalary: 0,
        bonus: 0,
        deductions: 0,
        netPay: 0,
        payPeriod: '',
        paymentDate: null,
        status: 'pending'
      });

      toast({
        title: 'Success',
        description: 'Payroll record added successfully',
      });
    } catch (err) {
      console.error('Error adding payroll record:', err);
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
  const handleUpdatePayrollStatus = async (id: string, status: PayrollRecord['status']) => {
    try {
      const payrollService = await getPayrollService();

      await payrollService.updatePayrollRecord(id, { status });

      // Update local state
      setPayrollRecords(prev =>
        prev.map(record =>
          record.id === id ? { ...record, status } : record
        )
      );

      // If we're viewing this record, update the selected record too
      if (selectedPayroll && selectedPayroll.id === id) {
        setSelectedPayroll({ ...selectedPayroll, status });
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
        title: 'Success',
        description: `Payroll status updated to ${status}`,
      });
    } catch (err) {
      console.error('Error updating payroll status:', err);
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
                <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-100">
                  Paid: {statusCounts.paid || 0}
                </Badge>
                <Badge variant="outline" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
                  Pending: {statusCounts.pending || 0}
                </Badge>
                <Badge variant="outline" className="bg-blue-100 text-blue-800 hover:bg-blue-100">
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
                          <TableHead>Position</TableHead>
                          <TableHead>Pay Period</TableHead>
                          <TableHead>Base Salary</TableHead>
                          <TableHead>Net Pay</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {payrollRecords.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={8} className="text-center py-4">
                              No payroll records found
                            </TableCell>
                          </TableRow>
                        ) : (
                          payrollRecords.map((record) => (
                            <TableRow key={record.id}>
                              <TableCell>
                                <div className="font-medium">{record.employeeName}</div>
                                <div className="text-sm text-muted-foreground">{record.employeeId}</div>
                              </TableCell>
                              <TableCell>{record.department}</TableCell>
                              <TableCell>{record.position}</TableCell>
                              <TableCell>{record.payPeriod}</TableCell>
                              <TableCell>${record.baseSalary.toLocaleString()}</TableCell>
                              <TableCell>${record.netPay.toLocaleString()}</TableCell>
                              <TableCell>
                                <Badge
                                  variant={record.status === 'paid' ? 'default' :
                                    record.status === 'pending' ? 'outline' :
                                      record.status === 'processing' ? 'secondary' : 'destructive'}
                                >
                                  {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
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

        {/* Add Payroll Dialog */}
        <Dialog open={addPayrollOpen} onOpenChange={setAddPayrollOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Add New Payroll Record</DialogTitle>
              <DialogDescription>
                Create a new payroll record for an employee. Fill in all the required fields below.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="employeeId">Employee ID</Label>
                  <Input
                    id="employeeId"
                    value={newPayroll.employeeId}
                    onChange={(e) => setNewPayroll({ ...newPayroll, employeeId: e.target.value })}
                    placeholder="EMP-001"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="employeeName">Employee Name</Label>
                  <Input
                    id="employeeName"
                    value={newPayroll.employeeName}
                    onChange={(e) => setNewPayroll({ ...newPayroll, employeeName: e.target.value })}
                    placeholder="John Doe"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="department">Department</Label>
                  <Select
                    onValueChange={(value) => setNewPayroll({ ...newPayroll, department: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="engineering">Engineering</SelectItem>
                      <SelectItem value="marketing">Marketing</SelectItem>
                      <SelectItem value="sales">Sales</SelectItem>
                      <SelectItem value="hr">Human Resources</SelectItem>
                      <SelectItem value="finance">Finance</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="position">Position</Label>
                  <Input
                    id="position"
                    value={newPayroll.position}
                    onChange={(e) => setNewPayroll({ ...newPayroll, position: e.target.value })}
                    placeholder="Software Engineer"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="baseSalary">Base Salary</Label>
                  <Input
                    id="baseSalary"
                    type="number"
                    value={newPayroll.baseSalary}
                    onChange={(e) => setNewPayroll({ ...newPayroll, baseSalary: parseFloat(e.target.value) || 0 })}
                    placeholder="0.00"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bonus">Bonus</Label>
                  <Input
                    id="bonus"
                    type="number"
                    value={newPayroll.bonus}
                    onChange={(e) => setNewPayroll({ ...newPayroll, bonus: parseFloat(e.target.value) || 0 })}
                    placeholder="0.00"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="deductions">Deductions</Label>
                  <Input
                    id="deductions"
                    type="number"
                    value={newPayroll.deductions}
                    onChange={(e) => setNewPayroll({ ...newPayroll, deductions: parseFloat(e.target.value) || 0 })}
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="payPeriod">Pay Period</Label>
                  <Select
                    onValueChange={(value) => setNewPayroll({ ...newPayroll, payPeriod: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select pay period" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="January 2023">January 2023</SelectItem>
                      <SelectItem value="February 2023">February 2023</SelectItem>
                      <SelectItem value="March 2023">March 2023</SelectItem>
                      <SelectItem value="April 2023">April 2023</SelectItem>
                      <SelectItem value="May 2023">May 2023</SelectItem>
                      <SelectItem value="June 2023">June 2023</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select
                    onValueChange={(value: PayrollRecord['status']) => setNewPayroll({ ...newPayroll, status: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="processing">Processing</SelectItem>
                      <SelectItem value="paid">Paid</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setAddPayrollOpen(false)}>Cancel</Button>
              <Button onClick={handleAddPayroll}>Add Payroll Record</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
          <DialogContent className="sm:max-w-[425px]">
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
                    setPayrollToDelete(null);
                  }
                }}
              >
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* View Payroll Dialog */}
        <Dialog open={viewPayrollOpen} onOpenChange={setViewPayrollOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Payroll Details</DialogTitle>
              <DialogDescription>
                Detailed information about the payroll record.
              </DialogDescription>
            </DialogHeader>
            {selectedPayroll && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium">Employee</h4>
                    <p className="text-sm">{selectedPayroll.employeeName}</p>
                    <p className="text-xs text-muted-foreground">{selectedPayroll.employeeId}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium">Department & Position</h4>
                    <p className="text-sm">{selectedPayroll.department}</p>
                    <p className="text-xs text-muted-foreground">{selectedPayroll.position}</p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <h4 className="text-sm font-medium">Base Salary</h4>
                    <p className="text-sm">${selectedPayroll.baseSalary.toLocaleString()}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium">Bonus</h4>
                    <p className="text-sm">${selectedPayroll.bonus.toLocaleString()}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium">Deductions</h4>
                    <p className="text-sm">${selectedPayroll.deductions.toLocaleString()}</p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <h4 className="text-sm font-medium">Net Pay</h4>
                    <p className="text-lg font-bold">${selectedPayroll.netPay.toLocaleString()}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium">Pay Period</h4>
                    <p className="text-sm">{selectedPayroll.payPeriod}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium">Status</h4>
                    <Badge
                      variant={selectedPayroll.status === 'paid' ? 'default' :
                        selectedPayroll.status === 'pending' ? 'outline' :
                          selectedPayroll.status === 'processing' ? 'secondary' : 'destructive'}
                    >
                      {selectedPayroll.status.charAt(0).toUpperCase() + selectedPayroll.status.slice(1)}
                    </Badge>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h4 className="text-sm font-medium mb-2">Payment Actions</h4>
                  <div className="flex gap-2">
                    {selectedPayroll.status === 'pending' && (
                      <Button
                        size="sm"
                        onClick={() => handleUpdatePayrollStatus(selectedPayroll.id, 'processing')}
                      >
                        Start Processing
                      </Button>
                    )}
                    {selectedPayroll.status === 'processing' && (
                      <Button
                        size="sm"
                        onClick={() => handleUpdatePayrollStatus(selectedPayroll.id, 'paid')}
                      >
                        Mark as Paid
                      </Button>
                    )}
                    {selectedPayroll.status !== 'cancelled' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleUpdatePayrollStatus(selectedPayroll.id, 'cancelled')}
                      >
                        Cancel Payment
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setViewPayrollOpen(false)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Quick Actions */}
        <div>
          <Card className="border-0 shadow-lg bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full justify-start" variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Process Payroll
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Export Reports
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <Users className="h-4 w-4 mr-2" />
                Manage Benefits
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <Calendar className="h-4 w-4 mr-2" />
                Set Pay Cycles
              </Button>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-card/50 backdrop-blur-sm mt-6">
            <CardHeader>
              <CardTitle>Upcoming</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <div>
                    <div className="text-sm font-medium">Payroll Processing</div>
                    <div className="text-xs text-muted-foreground">Due in 3 days</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <div>
                    <div className="text-sm font-medium">Tax Filing</div>
                    <div className="text-xs text-muted-foreground">Due in 1 week</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-orange-50 dark:bg-orange-950/20 rounded-lg">
                  <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                  <div>
                    <div className="text-sm font-medium">Benefits Review</div>
                    <div className="text-xs text-muted-foreground">Due in 2 weeks</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Coming Soon Notice */}
      <Card className="mt-8 border-0 shadow-lg bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800">
        <CardContent className="p-6">
          <div className="text-center">
            <DollarSign className="h-12 w-12 text-amber-600 dark:text-amber-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-amber-800 dark:text-amber-200 mb-2">
              Payroll System Coming Soon
            </h3>
            <p className="text-amber-700 dark:text-amber-300">
              We're working on a comprehensive payroll system that will include salary management,
              benefits administration, tax calculations, and more. Stay tuned for updates!
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
