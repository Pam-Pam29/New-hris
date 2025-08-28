import React, { useState, useEffect } from 'react';
import { backendService } from '../../../../services/backendService';
import { Button } from '../../../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../components/ui/card';
import { TypographyH2, TypographyH3 } from '../../../../components/ui/typography';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../../components/ui/select';
import { Input } from '../../../../components/ui/input';
import { Badge } from '../../../../components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../../../components/ui/dialog';
import { Textarea } from '../../../../components/ui/textarea';
import { Label } from '../../../../components/ui/label';
import { Clock, Users, CheckCircle, AlertTriangle, XCircle, Download, Filter, Calendar, User, Edit, Save, X } from 'lucide-react';

const mockAttendance = [
  // Commented out existing employees as requested
  // { id: 1, employee: 'Jane Doe', date: '2025-07-21', clockIn: '09:00', clockOut: '17:00', status: 'Present' },
  // { id: 2, employee: 'John Smith', date: '2025-07-21', clockIn: '09:10', clockOut: '17:05', status: 'Late' },
  // { id: 3, employee: 'Mary Johnson', date: '2025-07-21', clockIn: '', clockOut: '', status: 'Absent' },
  // { id: 4, employee: 'Jane Doe', date: '2025-07-20', clockIn: '09:01', clockOut: '17:00', status: 'Present' },
  // { id: 5, employee: 'John Smith', date: '2025-07-20', clockIn: '', clockOut: '', status: 'Absent' },
];

const employees = [
  // Commented out existing employees as requested
  // 'Jane Doe', 'John Smith', 'Mary Johnson'
];
const statuses = ['Present', 'Late', 'Absent'];

const statusConfig = {
  Present: { color: 'bg-green-100 text-green-800 border-green-200', icon: CheckCircle },
  Late: { color: 'bg-yellow-100 text-yellow-800 border-yellow-200', icon: AlertTriangle },
  Absent: { color: 'bg-red-100 text-red-800 border-red-200', icon: XCircle },
};

export default function TimeManagement() {
  // State for attendance records from backend
  const [attendanceRecords, setAttendanceRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter state
  const [selectedEmployee, setSelectedEmployee] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState('');

  // Adjust popup state
  const [showAdjustDialog, setShowAdjustDialog] = useState(false);
  const [selectedAttendance, setSelectedAttendance] = useState<any>(null);
  const [adjustForm, setAdjustForm] = useState({
    clockIn: '',
    clockOut: '',
    notes: '',
    reason: ''
  });

  // Load attendance records from backend
  useEffect(() => {
    loadAttendanceRecords();
  }, []);

  const loadAttendanceRecords = async () => {
    try {
      setLoading(true);
      const records = await backendService.getAttendanceRecords();
      setAttendanceRecords(records);
    } catch (error) {
      console.error('Error loading attendance records:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filter logic
  const filtered = attendanceRecords.filter(row =>
    (!selectedEmployee || row.employee === selectedEmployee) &&
    (!selectedStatus || row.status === selectedStatus) &&
    (!selectedDate || row.date === selectedDate)
  );

  // Summary stats
  const summary = statuses.map(status => ({
    status,
    count: attendanceRecords.filter(row => row.status === status).length,
  }));

  const handleAdjust = (attendance: any) => {
    setSelectedAttendance(attendance);
    setAdjustForm({
      clockIn: attendance.clockIn || '',
      clockOut: attendance.clockOut || '',
      notes: '',
      reason: ''
    });
    setShowAdjustDialog(true);
  };

  const handleAdjustSubmit = async () => {
    try {
      if (selectedAttendance) {
        const updatedAttendance = {
          ...selectedAttendance,
          clockIn: adjustForm.clockIn,
          clockOut: adjustForm.clockOut,
          notes: adjustForm.notes,
          reason: adjustForm.reason
        };
        
        // Update in backend
        await backendService.updateAttendanceRecord(selectedAttendance.id, updatedAttendance);
        
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
        </div>
      </div>

      {/* Filters Section */}
      <Card className="mb-8 border-0 shadow-lg bg-card/50 backdrop-blur-sm">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground mb-2 block">Employee</label>
              <Select value={selectedEmployee || ''} onValueChange={setSelectedEmployee}>
                <SelectTrigger>
                  <SelectValue placeholder="All Employees" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Employees</SelectItem>
                  {employees.map(employee => (
                    <SelectItem key={employee} value={employee}>{employee}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground mb-2 block">Status</label>
              <Select value={selectedStatus || ''} onValueChange={setSelectedStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Statuses</SelectItem>
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
              <Button variant="outline" className="w-full">
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
                {filtered.map((row) => {
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

      {/* Enhanced Adjust Time Dialog */}
      <Dialog open={showAdjustDialog} onOpenChange={setShowAdjustDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit className="h-5 w-5" />
              Adjust Attendance Time
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {/* Employee and Date Info */}
            <div className="p-3 bg-muted/50 rounded-lg">
              <div className="text-sm font-medium text-muted-foreground mb-1">Employee</div>
              <div className="font-semibold">{selectedAttendance?.employee}</div>
              <div className="text-sm font-medium text-muted-foreground mb-1 mt-2">Date</div>
              <div className="font-semibold">{selectedAttendance?.date}</div>
            </div>

            {/* Clock In Time */}
            <div className="space-y-2">
              <Label htmlFor="clockIn">Clock In Time</Label>
              <Input
                id="clockIn"
                type="time"
                value={adjustForm.clockIn}
                onChange={(e) => setAdjustForm(prev => ({ ...prev, clockIn: e.target.value }))}
                placeholder="09:00"
              />
            </div>

            {/* Clock Out Time */}
            <div className="space-y-2">
              <Label htmlFor="clockOut">Clock Out Time</Label>
              <Input
                id="clockOut"
                type="time"
                value={adjustForm.clockOut}
                onChange={(e) => setAdjustForm(prev => ({ ...prev, clockOut: e.target.value }))}
                placeholder="17:00"
              />
            </div>

            {/* Reason for Adjustment */}
            <div className="space-y-2">
              <Label htmlFor="reason">Reason for Adjustment</Label>
              <Select 
                value={adjustForm.reason} 
                onValueChange={(value) => setAdjustForm(prev => ({ ...prev, reason: value }))}
              >
                <SelectTrigger>
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
              <Label htmlFor="notes">Additional Notes (Optional)</Label>
              <Textarea
                id="notes"
                value={adjustForm.notes}
                onChange={(e) => setAdjustForm(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Provide additional details about the adjustment..."
                rows={3}
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 pt-4">
              <Button onClick={handleAdjustSubmit} className="flex-1">
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
