import { useState, useEffect } from 'react';
import { Button } from '../../../../components/ui/button';
import { Card, CardContent, CardHeader } from '../../../../components/ui/card';
import { TypographyH2, TypographyH3 } from '../../../../components/ui/typography';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../../components/ui/select';
import { Input } from '../../../../components/ui/input';
import { Badge } from '../../../../components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../../../components/ui/dialog';
import { Textarea } from '../../../../components/ui/textarea';
import { Label } from '../../../../components/ui/label';
import { 
  Clock, 
  Users, 
  CheckCircle, 
  AlertTriangle, 
  XCircle, 
  Filter, 
  Calendar, 
  User, 
  Edit, 
  Save, 
  X,
  Plus,
  Download,
  Upload,
  Settings,
  Search,
  TrendingUp,
  Activity,
  Timer,
  CalendarDays,
  Eye,
  BarChart3
} from 'lucide-react';

// Import Employee Service
import { getEmployeeService, IEmployeeService } from '../../../../services/employeeService';
import { Employee } from '../CoreHr/EmployeeManagement/types';

import { getTimeService } from './services/timeService';
import { AttendanceRecord } from './types';
import { useToast } from '@/hooks/use-toast';

const statusConfig = {
  Present: { color: 'bg-green-100 text-green-800 border-green-200', icon: CheckCircle },
  Late: { color: 'bg-yellow-100 text-yellow-800 border-yellow-200', icon: AlertTriangle },
  Absent: { color: 'bg-red-100 text-red-800 border-red-200', icon: XCircle },
};

const statuses = Object.keys(statusConfig);

export default function TimeManagement() {
  const { toast } = useToast();

  // State for attendance records from backend
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [filteredAttendanceRecords, setFilteredAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState('');

  // Employee service and employees state
  const [employeeService, setEmployeeService] = useState<IEmployeeService | null>(null);
  const [employees, setEmployees] = useState<Employee[]>([]);

  // Get unique employees from attendance records (for filtering)
  const attendanceEmployees = Array.from(new Set(attendanceRecords.map(record => record.employee)));

  // Adjust popup state
  const [showAdjustDialog, setShowAdjustDialog] = useState(false);
  const [selectedAttendance, setSelectedAttendance] = useState<AttendanceRecord | null>(null);
  const [adjustForm, setAdjustForm] = useState({
    clockIn: '',
    clockOut: '',
    notes: '',
    reason: 'forgot_clock_in'
  });

  // Add Attendance popup state
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newAttendance, setNewAttendance] = useState({
    employee: '',
    date: '',
    status: 'Present',
    clockIn: '',
    clockOut: ''
  });

  // Initialize Employee Service
  useEffect(() => {
    const initializeService = async () => {
      try {
        const service = await getEmployeeService();
        setEmployeeService(service);
      } catch (error) {
        console.error('Failed to initialize employee service:', error);
      }
    };

    initializeService();
  }, []);

  // Load employees using Employee Service
  const fetchEmployees = async () => {
    if (!employeeService) return;

    try {
      const employeesList = await employeeService.getEmployees();
      setEmployees(employeesList);
    } catch (err) {
      console.error('Error fetching employees:', err);
    }
  };

  // Load attendance records from backend
  const loadAttendanceRecords = async () => {
    try {
      const timeService = await getTimeService();
      const records = await timeService.getAttendanceRecords();
      setAttendanceRecords(records);
      setFilteredAttendanceRecords(records);
    } catch (error) {
      console.error('Error loading attendance records:', error);
      setAttendanceRecords([]);
      setFilteredAttendanceRecords([]);
    }
  };

  // Load data when employee service is ready
  useEffect(() => {
    if (employeeService) {
      fetchEmployees();
    }
  }, [employeeService]);

  // Load attendance records on component mount
  useEffect(() => {
    loadAttendanceRecords();
  }, []);

  // Summary stats
  const summary = statuses.map(status => ({
    status,
    count: attendanceRecords.filter(row => row.status === status).length,
  }));

  const handleAdjust = (attendance: AttendanceRecord) => {
    setSelectedAttendance(attendance);
    setAdjustForm({
      clockIn: attendance.clockIn || '',
      clockOut: attendance.clockOut || '',
      notes: attendance.notes || '',
      reason: attendance.reason || ''
    });
    setShowAdjustDialog(true);
  };

  const handleAdjustSubmit = async () => {
    try {
      if (selectedAttendance) {
        const timeService = await getTimeService();
        await timeService.updateAttendanceRecord(selectedAttendance.id, {
          clockIn: adjustForm.clockIn,
          clockOut: adjustForm.clockOut,
          notes: adjustForm.notes,
          reason: adjustForm.reason
        });

        // Refresh the records
        await loadAttendanceRecords();

        setShowAdjustDialog(false);
        setSelectedAttendance(null);
        setAdjustForm({ clockIn: '', clockOut: '', notes: '', reason: '' });

        toast({
          title: 'Attendance updated',
          description: `Time adjusted for ${selectedAttendance.employee}`,
          duration: 3500
        });
      }
    } catch (error) {
      console.error('Error updating attendance record:', error);
      toast({
        title: 'Failed to update attendance',
        description: error instanceof Error ? error.message : 'Unknown error',
        duration: 5000
      });
    }
  };

  const handleAdjustCancel = () => {
    setShowAdjustDialog(false);
    setSelectedAttendance(null);
    setAdjustForm({ clockIn: '', clockOut: '', notes: '', reason: '' });
  };

  const handleAddAttendance = async () => {
    try {
      // Get employee name from the employees list
      const selectedEmployeeData = employees.find(emp => emp.id.toString() === newAttendance.employee);
      const employeeName = selectedEmployeeData ? selectedEmployeeData.name : newAttendance.employee;

      const timeService = await getTimeService();
      const created = await timeService.createAttendanceRecord({
        id: '',
        employee: employeeName,
        date: newAttendance.date,
        status: newAttendance.status as any,
        clockIn: newAttendance.clockIn,
        clockOut: newAttendance.clockOut,
      } as any);

      await loadAttendanceRecords();
      setShowAddDialog(false);
      setNewAttendance({ employee: '', date: '', status: 'Present', clockIn: '', clockOut: '' });

      toast({
        title: 'Attendance added',
        description: `${created.employee} on ${created.date}`,
        duration: 3500
      });
    } catch (e) {
      toast({
        title: 'Failed to add attendance',
        description: e instanceof Error ? e.message : 'Unknown error',
        duration: 5000
      });
    }
  };

  return (
    <div className="p-8 min-h-screen animate-fade-in">
      {/* Header Section */}
      <div className="mb-8 animate-slide-in">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-xl shadow-soft">
              <Clock className="h-7 w-7 text-primary" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gradient mb-1">
                Time Management
              </h1>
              <p className="text-muted-foreground">Track attendance, manage schedules, and monitor work hours</p>
            </div>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" className="shadow-soft hover:shadow-soft-lg transition-all duration-200">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button variant="outline" className="shadow-soft hover:shadow-soft-lg transition-all duration-200">
              <Upload className="h-4 w-4 mr-2" />
              Import
            </Button>
            <Button variant="outline" className="shadow-soft hover:shadow-soft-lg transition-all duration-200">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
            <Button 
              className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-soft hover:shadow-soft-lg transition-all duration-200" 
              onClick={() => setShowAddDialog(true)}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Attendance
            </Button>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 animate-fade-in">
        <div className="card-modern group hover:scale-105 bg-gradient-to-br from-success/5 to-success/10 border-success/20">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-success/10 rounded-xl group-hover:bg-success/20 transition-colors">
                <CheckCircle className="h-6 w-6 text-success" />
              </div>
              <div className="flex items-center gap-1 text-sm text-success">
                <TrendingUp className="h-4 w-4" />
                <span className="font-medium">+5%</span>
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Present Today</p>
              <p className="text-3xl font-bold text-success">{summary.find(s => s.status === 'Present')?.count || 0}</p>
              <p className="text-xs text-muted-foreground">Employees on time</p>
            </div>
          </div>
        </div>

        <div className="card-modern group hover:scale-105 bg-gradient-to-br from-warning/5 to-warning/10 border-warning/20">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-warning/10 rounded-xl group-hover:bg-warning/20 transition-colors">
                <AlertTriangle className="h-6 w-6 text-warning" />
              </div>
              <div className="flex items-center gap-1 text-sm text-warning">
                <Timer className="h-4 w-4" />
                <span className="font-medium">Late</span>
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Late Arrivals</p>
              <p className="text-3xl font-bold text-warning">{summary.find(s => s.status === 'Late')?.count || 0}</p>
              <p className="text-xs text-muted-foreground">Need attention</p>
            </div>
          </div>
        </div>

        <div className="card-modern group hover:scale-105 bg-gradient-to-br from-destructive/5 to-destructive/10 border-destructive/20">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-destructive/10 rounded-xl group-hover:bg-destructive/20 transition-colors">
                <XCircle className="h-6 w-6 text-destructive" />
              </div>
              <div className="flex items-center gap-1 text-sm text-destructive">
                <Activity className="h-4 w-4" />
                <span className="font-medium">Track</span>
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Absent Today</p>
              <p className="text-3xl font-bold text-destructive">{summary.find(s => s.status === 'Absent')?.count || 0}</p>
              <p className="text-xs text-muted-foreground">Missing employees</p>
            </div>
          </div>
        </div>

        <div className="card-modern group hover:scale-105 bg-gradient-to-br from-info/5 to-info/10 border-info/20">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-info/10 rounded-xl group-hover:bg-info/20 transition-colors">
                <BarChart3 className="h-6 w-6 text-info" />
              </div>
              <div className="flex items-center gap-1 text-sm text-success">
                <TrendingUp className="h-4 w-4" />
                <span className="font-medium">95%</span>
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Attendance Rate</p>
              <p className="text-3xl font-bold text-info">{attendanceRecords.length}</p>
              <p className="text-xs text-muted-foreground">Total records</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="card-modern mb-8">
        <div className="p-6">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div className="flex items-center gap-4 flex-1">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search employees..."
                  className="w-full pl-10 pr-4 py-2 border border-input rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
                />
              </div>
              <div className="flex gap-2">
                <Select value={selectedEmployee || 'all_employees'} onValueChange={(value) => setSelectedEmployee(value === 'all_employees' ? null : value)}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="All Employees" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all_employees">All Employees</SelectItem>
                    {attendanceEmployees.filter(employee => employee !== '').map(employee => (
                      <SelectItem key={employee} value={employee}>{employee}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={selectedStatus || 'all_statuses'} onValueChange={(value) => setSelectedStatus(value === 'all_statuses' ? null : value)}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="All Statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all_statuses">All Statuses</SelectItem>
                    {statuses.map(status => (
                      <SelectItem key={status} value={status}>{status}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-40"
                />
              </div>
            </div>
            <Button 
              variant="outline" 
              onClick={() => {
                const filteredRecords = attendanceRecords.filter(row =>
                  (!selectedEmployee || row.employee === selectedEmployee) &&
                  (!selectedStatus || row.status === selectedStatus) &&
                  (!selectedDate || row.date === selectedDate)
                );
                setFilteredAttendanceRecords(filteredRecords);
              }}
              className="shadow-soft hover:shadow-soft-lg transition-all duration-200"
            >
              <Filter className="h-4 w-4 mr-2" />
              Apply Filters
            </Button>
          </div>
        </div>
      </div>

      {/* Attendance Table */}
      <div className="card-modern overflow-hidden">
        {filteredAttendanceRecords.length === 0 ? (
          <div className="text-center py-12">
            <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-lg font-medium text-muted-foreground mb-2">No attendance records found</p>
            <p className="text-sm text-muted-foreground mb-4">Start tracking attendance by adding records</p>
            <Button
              onClick={() => setShowAddDialog(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg shadow-soft hover:shadow-soft-lg transition-all duration-200"
            >
              <Plus className="h-4 w-4" />
              Add First Record
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="table-modern">
              <thead>
                <tr>
                  <th className="text-left">Employee</th>
                  <th className="text-left">Date & Time</th>
                  <th className="text-left">Work Hours</th>
                  <th className="text-left">Status</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredAttendanceRecords.map((row) => {
                  const config = statusConfig[row.status as keyof typeof statusConfig];
                  const clockInTime = row.clockIn ? new Date(`2000-01-01 ${row.clockIn}`) : null;
                  const clockOutTime = row.clockOut ? new Date(`2000-01-01 ${row.clockOut}`) : null;
                  const workHours = clockInTime && clockOutTime 
                    ? ((clockOutTime.getTime() - clockInTime.getTime()) / (1000 * 60 * 60)).toFixed(1)
                    : null;

                  return (
                    <tr key={row.id} className="group">
                      <td>
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-primary/10 rounded-lg">
                            <User className="h-4 w-4 text-primary" />
                          </div>
                          <div>
                            <div className="font-semibold text-foreground">{row.employee}</div>
                            <div className="text-sm text-muted-foreground">Employee</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <CalendarDays className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">{row.date}</span>
                          </div>
                          <div className="flex items-center gap-4 text-sm">
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3 text-success" />
                              <span className="text-success font-mono">{row.clockIn || 'N/A'}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3 text-destructive" />
                              <span className="text-destructive font-mono">{row.clockOut || 'N/A'}</span>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="space-y-1">
                          <div className="text-lg font-bold text-foreground">
                            {workHours ? `${workHours}h` : 'N/A'}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {workHours && parseFloat(workHours) >= 8 ? 'Full day' : 'Partial'}
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="flex items-center gap-2">
                          <config.icon className={`h-4 w-4 ${
                            row.status === 'Present' ? 'text-success' :
                            row.status === 'Late' ? 'text-warning' : 'text-destructive'
                          }`} />
                          <span className={`px-3 py-1 rounded-full text-xs font-medium border ${
                            row.status === 'Present' ? 'bg-success/10 text-success border-success/20' :
                            row.status === 'Late' ? 'bg-warning/10 text-warning border-warning/20' :
                            'bg-destructive/10 text-destructive border-destructive/20'
                          }`}>
                            {row.status}
                          </span>
                        </div>
                      </td>
                      <td>
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => handleAdjust(row)}
                            className="p-2 hover:bg-primary/10 text-primary rounded-lg transition-colors"
                            title="Adjust Time"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            className="p-2 hover:bg-info/10 text-info rounded-lg transition-colors"
                            title="View Details"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Attendance Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Add Attendance</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium">Employee</Label>
              {employees.length > 0 ? (
                <Select value={newAttendance.employee} onValueChange={(value) => setNewAttendance(prev => ({ ...prev, employee: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select employee" />
                  </SelectTrigger>
                  <SelectContent>
                    {employees.map(employee => (
                      <SelectItem key={employee.id} value={employee.id.toString()}>
                        {employee.name} - {employee.department} ({employee.role})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Input
                  value={newAttendance.employee}
                  onChange={(e) => setNewAttendance(prev => ({ ...prev, employee: e.target.value }))}
                  placeholder="Employee name"
                />
              )}
              {employees.length === 0 && (
                <p className="text-xs text-amber-600 mt-1">
                  No employees found. Please add employees in Employee Management first.
                </p>
              )}
            </div>
            <div>
              <Label className="text-sm font-medium">Date</Label>
              <Input type="date" value={newAttendance.date} onChange={(e) => setNewAttendance(prev => ({ ...prev, date: e.target.value }))} />
            </div>
            <div>
              <Label className="text-sm font-medium">Status</Label>
              <Select value={newAttendance.status} onValueChange={(value) => setNewAttendance(prev => ({ ...prev, status: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {statuses.map(status => (
                    <SelectItem key={status} value={status}>{status}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium">Clock In</Label>
                <Input type="time" value={newAttendance.clockIn} onChange={(e) => setNewAttendance(prev => ({ ...prev, clockIn: e.target.value }))} />
              </div>
              <div>
                <Label className="text-sm font-medium">Clock Out</Label>
                <Input type="time" value={newAttendance.clockOut} onChange={(e) => setNewAttendance(prev => ({ ...prev, clockOut: e.target.value }))} />
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <Button
                className="bg-violet-600 hover:bg-violet-700"
                onClick={handleAddAttendance}
              >
                Save
              </Button>
              <Button variant="outline" onClick={() => setShowAddDialog(false)}>Cancel</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Enhanced Adjust Time Dialog */}
      <Dialog open={showAdjustDialog} onOpenChange={setShowAdjustDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <div className="p-2 bg-violet-100 dark:bg-violet-900/30 rounded-lg">
                <Edit className="h-5 w-5 text-violet-600 dark:text-violet-400" />
              </div>
              Adjust Attendance Time
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Employee and Date Info */}
            <div className="p-4 bg-gradient-to-r from-muted/50 to-muted/30 rounded-lg border">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm font-medium text-muted-foreground mb-1">Employee</div>
                  <div className="font-semibold text-lg">{selectedAttendance?.employee}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground mb-1">Date</div>
                  <div className="font-semibold text-lg">{selectedAttendance?.date}</div>
                </div>
              </div>
            </div>

            {/* Current Times Display */}
            <div className="grid grid-cols-2 gap-4 p-4 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-800">
              <div className="text-center">
                <div className="text-sm font-medium text-blue-700 dark:text-blue-300 mb-1">Current Clock In</div>
                <div className="font-mono text-lg font-semibold text-blue-900 dark:text-blue-100">
                  {selectedAttendance?.clockIn || 'Not set'}
                </div>
              </div>
              <div className="text-center">
                <div className="text-sm font-medium text-blue-700 dark:text-blue-300 mb-1">Current Clock Out</div>
                <div className="font-mono text-lg font-semibold text-blue-900 dark:text-blue-100">
                  {selectedAttendance?.clockOut || 'Not set'}
                </div>
              </div>
            </div>

            {/* Time Adjustment Inputs */}
            <div className="grid grid-cols-2 gap-4">
              {/* Clock In Time */}
              <div className="space-y-2">
                <Label htmlFor="clockIn" className="text-sm font-medium flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  New Clock In Time
                </Label>
                <Input
                  id="clockIn"
                  type="time"
                  value={adjustForm.clockIn}
                  onChange={(e) => setAdjustForm(prev => ({ ...prev, clockIn: e.target.value }))}
                  className="font-mono text-lg"
                  placeholder="09:00"
                />
              </div>

              {/* Clock Out Time */}
              <div className="space-y-2">
                <Label htmlFor="clockOut" className="text-sm font-medium flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  New Clock Out Time
                </Label>
                <Input
                  id="clockOut"
                  type="time"
                  value={adjustForm.clockOut}
                  onChange={(e) => setAdjustForm(prev => ({ ...prev, clockOut: e.target.value }))}
                  className="font-mono text-lg"
                  placeholder="17:00"
                />
              </div>
            </div>

            {/* Reason for Adjustment */}
            <div className="space-y-2">
              <Label htmlFor="reason" className="text-sm font-medium flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                Reason for Adjustment
              </Label>
              <Select
                value={adjustForm.reason}
                onValueChange={(value) => setAdjustForm(prev => ({ ...prev, reason: value }))}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a reason" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="forgot_clock_in">Forgot to Clock In</SelectItem>
                  <SelectItem value="forgot_clock_out">Forgot to Clock Out</SelectItem>
                  <SelectItem value="system_error">System Error</SelectItem>
                  <SelectItem value="manual_correction">Manual Correction</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Additional Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes" className="text-sm font-medium">Additional Notes (Optional)</Label>
              <Textarea
                id="notes"
                value={adjustForm.notes}
                onChange={(e) => setAdjustForm(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Provide additional details about the adjustment..."
                rows={3}
                className="resize-none"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-6 border-t">
              <Button onClick={handleAdjustSubmit} className="flex-1 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700">
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </Button>
              <Button
                variant="outline"
                onClick={handleAdjustCancel}
                className="flex-1"
              >
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}