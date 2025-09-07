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
import { Clock, Users, CheckCircle, AlertTriangle, XCircle, Filter, Calendar, User, Edit, Save, X } from 'lucide-react';

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

  // Get unique employees from attendance records
  const employees = Array.from(new Set(attendanceRecords.map(record => record.employee)));

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

  // Load attendance records from backend
  useEffect(() => {
    loadAttendanceRecords();
  }, []);

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

  // Filter logic - This is now handled in the button click
  //const filtered = filteredAttendanceRecords;
  //attendanceRecords.filter(row =>
  //  (!selectedEmployee || row.employee === selectedEmployee) &&
  //  (!selectedStatus || row.status === selectedStatus) &&
  //  (!selectedDate || row.date === selectedDate)
  //);

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
      }
    } catch (error) {
      console.error('Error updating attendance record:', error);
    }
  };

  const handleAdjustCancel = () => {
    setShowAdjustDialog(false);
    setSelectedAttendance(null);
    setAdjustForm({ clockIn: '', clockOut: '', notes: '', reason: '' });
  };

  return (
    <div className="p-8 min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Header Section */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-violet-100 dark:bg-violet-900/30 rounded-lg">
            <Clock className="h-6 w-6 text-violet-600 dark:text-violet-400" />
          </div>
          <div>
            <TypographyH2 className="text-3xl font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
              Time Management
            </TypographyH2>
            <p className="text-muted-foreground text-sm">HR/Admin Dashboard</p>
          </div>
          <div className="ml-auto">
            <Button className="bg-violet-600 hover:bg-violet-700 text-white" onClick={() => setShowAddDialog(true)}>
              Add Attendance
            </Button>
          </div>
        </div>
      </div>

      {/* Filters Section */}
      <Card className="mb-8 border-0 shadow-lg bg-card/50 backdrop-blur-sm">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground mb-2 block">Employee</label>
              <Select value={selectedEmployee || 'all_employees'} onValueChange={(value) => setSelectedEmployee(value === 'all_employees' ? null : value)}>
                <SelectTrigger>
                  <SelectValue placeholder="All Employees" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all_employees">All Employees</SelectItem>
                  {employees.filter(employee => employee !== '').map(employee => (
                    <SelectItem key={employee} value={employee}>{employee}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground mb-2 block">Status</label>
              <Select value={selectedStatus || 'all_statuses'} onValueChange={(value) => setSelectedStatus(value === 'all_statuses' ? null : value)}>
                <SelectTrigger>
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all_statuses">All Statuses</SelectItem>
                  {statuses.map(status => (
                    <SelectItem key={status} value={status}>{status}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground mb-2 block">Date</label>
              <Input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                placeholder="Select date"
              />
            </div>
            <div className="flex items-end">
              <Button variant="outline" className="w-full" onClick={() => {
                // Trigger the filter logic
                const filteredRecords = attendanceRecords.filter(row =>
                  (!selectedEmployee || row.employee === selectedEmployee) &&
                  (!selectedStatus || row.status === selectedStatus) &&
                  (!selectedDate || row.date === selectedDate)
                );
                setFilteredAttendanceRecords(filteredRecords);
              }}>
                <Filter className="h-4 w-4 mr-2" />
                Apply Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {summary.map(({ status, count }) => {
          const config = statusConfig[status as keyof typeof statusConfig];
          return (
            <Card key={status} className="border-0 shadow-lg bg-card/50 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className={`p-3 rounded-lg ${config.color}`}>
                    <config.icon className="h-6 w-6" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{count}</div>
                    <div className="text-sm text-muted-foreground">{status}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Attendance Table */}
      <Card className="border-0 shadow-lg bg-card/50 backdrop-blur-sm">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            <TypographyH3 className="text-lg font-semibold">Attendance Records</TypographyH3>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border/50">
                  <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Employee</th>
                  <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Date</th>
                  <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Clock In</th>
                  <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Clock Out</th>
                  <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Status</th>
                  <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {filteredAttendanceRecords.map((row) => {
                  const config = statusConfig[row.status as keyof typeof statusConfig];
                  return (
                    <tr key={row.id} className="hover:bg-muted/50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
                            <User className="h-4 w-4 text-muted-foreground" />
                          </div>
                          <span className="font-medium">{row.employee}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          {row.date}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          {row.clockIn || 'N/A'}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          {row.clockOut || 'N/A'}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <Badge className={config.color}>
                          <config.icon className="h-3 w-3 mr-1" />
                          {row.status}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleAdjust(row)}
                          >
                            <Edit className="h-3 w-3 mr-1" />
                            Adjust
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Add Attendance Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Add Attendance</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium">Employee</Label>
              <Input value={newAttendance.employee} onChange={(e) => setNewAttendance(prev => ({ ...prev, employee: e.target.value }))} placeholder="Employee name" />
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
                onClick={async () => {
                  try {
                    const timeService = await getTimeService();
                    const created = await timeService.createAttendanceRecord({
                      id: '',
                      employee: newAttendance.employee,
                      date: newAttendance.date,
                      status: newAttendance.status as any,
                      clockIn: newAttendance.clockIn,
                      clockOut: newAttendance.clockOut,
                    } as any);
                    await loadAttendanceRecords();
                    setShowAddDialog(false);
                    setNewAttendance({ employee: '', date: '', status: 'Present', clockIn: '', clockOut: '' });
                    toast({ title: 'Attendance added', description: `${created.employee} on ${created.date}`, duration: 3500 });
                  } catch (e) {
                    toast({ title: 'Failed to add attendance', description: e instanceof Error ? e.message : 'Unknown error', duration: 5000 });
                  }
                }}
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