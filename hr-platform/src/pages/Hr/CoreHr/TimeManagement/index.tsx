import React, { useState, useEffect } from 'react';
import { Button } from '../../../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../../../components/ui/card';
import { TypographyH2, TypographyH3 } from '../../../../components/ui/typography';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../../components/ui/select';
import { Input } from '../../../../components/ui/input';
import { Badge } from '../../../../components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../../../../components/ui/dialog';
import { Textarea } from '../../../../components/ui/textarea';
import { Label } from '../../../../components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../../components/ui/tabs';
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
  BarChart3,
  Bell,
  MapPin,
  Building2
} from 'lucide-react';

// Import Employee Service
import { getEmployeeService, IEmployeeService } from '../../../../services/employeeService';
import { Employee } from '../EmployeeManagement/types';

import { getTimeService } from './services/timeService';
import { AttendanceRecord } from './types';
import { useToast } from '../../../../hooks/use-toast';

// Import Firebase services for real-time sync
import { getTimeTrackingService, TimeEntry, TimeAdjustmentRequest } from '../../../../services/timeTrackingService';
import { getTimeNotificationService, TimeNotification } from '../../../../services/timeNotificationService';
import { getOfficeLocationService, OfficeLocation, calculateDistance, formatDistance } from '../../../../services/officeLocationService';

// Import Schedule Manager
import { ScheduleManager } from '../../../../components/ScheduleManager';

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

  // Details dialog state
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [selectedDetails, setSelectedDetails] = useState<AttendanceRecord | null>(null);

  // Add Attendance popup state
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newAttendance, setNewAttendance] = useState({
    employee: '',
    date: '',
    status: 'Present',
    clockIn: '',
    clockOut: ''
  });

  // Firebase real-time sync state
  const [adjustmentRequests, setAdjustmentRequests] = useState<TimeAdjustmentRequest[]>([]);
  const [notifications, setNotifications] = useState<TimeNotification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<TimeAdjustmentRequest | null>(null);
  const [showApprovalDialog, setShowApprovalDialog] = useState(false);
  const [approvalNotes, setApprovalNotes] = useState('');
  const [isRejecting, setIsRejecting] = useState(false);

  // Office Location state
  const [officeLocations, setOfficeLocations] = useState<OfficeLocation[]>([]);
  const [defaultOffice, setDefaultOffice] = useState<OfficeLocation | null>(null);
  const [showOfficeDialog, setShowOfficeDialog] = useState(false);
  const [editingOffice, setEditingOffice] = useState<OfficeLocation | null>(null);
  const [officeForm, setOfficeForm] = useState({
    name: '',
    address: '',
    latitude: '',
    longitude: '',
    radius: '100' // 100 meters default
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

  // Load attendance records from backend (real time entries)
  const loadAttendanceRecords = async () => {
    try {
      const timeService = await getTimeService();
      const records = await timeService.getAttendanceRecords();

      console.log('📊 Loaded real time entries:', records.length);
      console.log('📋 First record has location?:', {
        hasLocation: !!records[0]?.location,
        location: records[0]?.location,
        recordId: records[0]?.id
      });

      setAttendanceRecords(records);
      setFilteredAttendanceRecords(records);

      // Check after setting state
      setTimeout(() => {
        console.log('📊 After setState - records in state:', attendanceRecords.length);
        console.log('📋 First record in state has location?:', {
          hasLocation: !!attendanceRecords[0]?.location,
          location: attendanceRecords[0]?.location
        });
      }, 100);
    } catch (error) {
      console.error('Error loading attendance records:', error);
      setAttendanceRecords([]);
      setFilteredAttendanceRecords([]);
    }
  };

  // Load office locations
  const loadOfficeLocations = async () => {
    try {
      console.log('🔄 Loading office locations...');
      const officeService = await getOfficeLocationService();
      console.log('✅ Office service initialized');

      const locations = await officeService.getOfficeLocations();
      const defaultLoc = await officeService.getDefaultOfficeLocation();

      // Remove duplicates based on ID
      const uniqueLocations = locations.filter((location, index, self) =>
        index === self.findIndex((t) => t.id === location.id)
      );

      setOfficeLocations(uniqueLocations);
      setDefaultOffice(defaultLoc);
      console.log('📍 Loaded office locations:', uniqueLocations.length);

      if (defaultLoc) {
        console.log('📍 Default office:', defaultLoc.name);
      }
    } catch (error: any) {
      console.error('❌ Error loading office locations:', error);
      console.error('❌ Error details:', error.message);
      // Don't show error to user - office locations are optional
    }
  };

  const handleEditOffice = (office: OfficeLocation) => {
    setEditingOffice(office);
    setOfficeForm({
      name: office.name,
      address: office.address,
      latitude: office.latitude.toString(),
      longitude: office.longitude.toString(),
      radius: office.radius.toString()
    });
    setShowOfficeDialog(true);
  };

  const handleDeleteOffice = async (officeId: string, officeName: string) => {
    if (!confirm(`Are you sure you want to delete "${officeName}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const officeService = await getOfficeLocationService();
      await officeService.deleteOfficeLocation(officeId);
      await loadOfficeLocations();

      toast({
        title: "Office Location Deleted",
        description: `${officeName} has been removed successfully.`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete office location",
        variant: "destructive",
      });
    }
  };

  const handleSaveOfficeLocation = async () => {
    try {
      const officeService = await getOfficeLocationService();

      if (editingOffice) {
        // Update existing office
        await officeService.updateOfficeLocation(editingOffice.id, {
          name: officeForm.name,
          address: officeForm.address,
          latitude: parseFloat(officeForm.latitude),
          longitude: parseFloat(officeForm.longitude),
          radius: parseInt(officeForm.radius)
        });

        toast({
          title: "Office Location Updated",
          description: "Office location has been updated successfully.",
        });
      } else {
        // Create new office
        const locationData: Omit<OfficeLocation, 'id'> = {
          name: officeForm.name,
          address: officeForm.address,
          latitude: parseFloat(officeForm.latitude),
          longitude: parseFloat(officeForm.longitude),
          radius: parseInt(officeForm.radius),
          isDefault: officeLocations.length === 0, // First office is default
          createdAt: new Date(),
          updatedAt: new Date()
        };

        await officeService.createOfficeLocation(locationData);

        toast({
          title: "Office Location Added",
          description: "Office location has been configured successfully.",
        });
      }

      await loadOfficeLocations();
      setShowOfficeDialog(false);
      setEditingOffice(null);
      setOfficeForm({ name: '', address: '', latitude: '', longitude: '', radius: '100' });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save office location",
        variant: "destructive",
      });
    }
  };

  // Load data when employee service is ready
  useEffect(() => {
    if (employeeService) {
      fetchEmployees();
    }
  }, [employeeService]);

  // Load office locations on mount
  useEffect(() => {
    loadOfficeLocations();
  }, []);

  // Load attendance records on component mount
  useEffect(() => {
    loadAttendanceRecords();
  }, []);

  // Set up Firebase real-time subscriptions
  useEffect(() => {
    let unsubscribeEntries: (() => void) | undefined;
    let unsubscribeRequests: (() => void) | undefined;
    let unsubscribeNotifs: (() => void) | undefined;

    const setupFirebaseSync = async () => {
      try {
        const timeService = await getTimeTrackingService();
        const notifService = await getTimeNotificationService();

        console.log('📡 HR: Setting up Firebase real-time subscriptions...');

        // Subscribe to ALL time entries (all employees)
        unsubscribeEntries = timeService.subscribeToTimeEntries(
          (entries) => {
            console.log('📊 HR: Time entries updated:', entries.length);

            // Convert TimeEntry to AttendanceRecord format
            const records: AttendanceRecord[] = entries.map(entry => {
              const clockInDate = new Date(entry.clockIn);
              const clockInTime = clockInDate.toTimeString().slice(0, 5);

              let clockOutTime = '';
              if (entry.clockOut) {
                const clockOutDate = new Date(entry.clockOut);
                clockOutTime = clockOutDate.toTimeString().slice(0, 5);
              }

              // Determine status based on clock-in time (9:00 AM expected)
              let status: 'Present' | 'Late' | 'Absent' = 'Present';
              const [hours, minutes] = clockInTime.split(':').map(Number);
              const clockInMinutes = hours * 60 + minutes;
              const expectedMinutes = 9 * 60; // 9:00 AM

              if (clockInMinutes > expectedMinutes + 30) {
                status = 'Late';
              }

              // Extract location data from clockInLocation or location field
              const locationData = entry.clockInLocation || entry.location;
              let locationObj: any = undefined;

              if (locationData) {
                locationObj = {
                  latitude: locationData.latitude,
                  longitude: locationData.longitude,
                  address: locationData.address,
                  timestamp: locationData.timestamp,
                  distanceFromOffice: (locationData as any).distanceFromOffice,
                  distanceFormatted: (locationData as any).distanceFormatted,
                  isAtOffice: (locationData as any).isAtOffice,
                  officeName: (locationData as any).officeName
                };
              }

              return {
                id: entry.id,
                employee: entry.employeeName,
                employeeId: entry.employeeId,
                employeeName: entry.employeeName,
                date: clockInDate.toISOString().split('T')[0],
                clockIn: clockInTime,
                clockOut: clockOutTime,
                status: entry.status === 'adjusted' ? 'Present' : status,
                notes: entry.notes,
                reason: entry.status === 'adjusted' ? 'Time adjusted' : '',
                location: locationObj  // ← ADD LOCATION!
              };
            });

            console.log('📡 Real-time: Converted entries with location data');
            setAttendanceRecords(records);
            setFilteredAttendanceRecords(records);
          }
        );

        // Subscribe to pending adjustment requests
        unsubscribeRequests = timeService.subscribeToAdjustmentRequests(
          (requests) => {
            const pending = requests.filter(r => r.status === 'pending');
            setAdjustmentRequests(pending);
            console.log('📝 HR: Pending adjustment requests:', pending.length);
          },
          'pending' // Filter for pending only
        );

        // Subscribe to HR notifications
        unsubscribeNotifs = notifService.subscribeToHrNotifications(
          (notifs) => {
            setNotifications(notifs);
            console.log('🔔 HR: Notifications updated:', notifs.length);
          }
        );

        console.log('✅ HR: Firebase real-time sync initialized successfully');
      } catch (error) {
        console.error('❌ HR: Failed to initialize Firebase sync:', error);
      }
    };

    setupFirebaseSync();

    return () => {
      unsubscribeEntries?.();
      unsubscribeRequests?.();
      unsubscribeNotifs?.();
      console.log('🔌 HR: Firebase subscriptions cleaned up');
    };
  }, []);

  // Summary stats
  const summary = statuses.map(status => ({
    status,
    count: attendanceRecords.filter(row => row.status === status).length,
  }));

  const handleAdjust = (attendance: AttendanceRecord) => {
    if (!attendance.id) {
      toast({
        title: 'Error',
        description: 'Cannot adjust time: Invalid attendance record',
        duration: 3000
      });
      return;
    }

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
      if (!selectedAttendance) {
        toast({
          title: 'Error',
          description: 'No attendance record selected',
          duration: 3000
        });
        return;
      }

      if (!adjustForm.clockIn && !adjustForm.clockOut) {
        toast({
          title: 'Error',
          description: 'Please provide at least one time value',
          duration: 3000
        });
        return;
      }

      const timeService = await getTimeService();

      // Calculate new status based on clock-in time
      const newStatus = calculateStatus(adjustForm.clockIn);

      await timeService.updateAttendanceRecord(selectedAttendance.id, {
        clockIn: adjustForm.clockIn,
        clockOut: adjustForm.clockOut,
        status: newStatus,
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
        description: `Time adjusted for ${selectedAttendance.employee} - Status: ${newStatus}`,
        duration: 3500
      });
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

  // Handle view details
  const handleViewDetails = (attendance: AttendanceRecord) => {
    console.log('👁️ Viewing attendance details for:', attendance.employee || attendance.employeeName);
    console.log('📋 Full attendance record:', JSON.stringify(attendance, null, 2));
    console.log('📍 Location data check:', {
      hasLocation: !!attendance.location,
      locationIsUndefined: attendance.location === undefined,
      locationIsNull: attendance.location === null,
      locationKeys: attendance.location ? Object.keys(attendance.location) : [],
      latitude: attendance.location?.latitude,
      longitude: attendance.location?.longitude,
      address: attendance.location?.address,
      distanceFromOffice: (attendance.location as any)?.distanceFromOffice,
      distanceFormatted: (attendance.location as any)?.distanceFormatted,
      isAtOffice: (attendance.location as any)?.isAtOffice,
      officeName: (attendance.location as any)?.officeName
    });
    setSelectedDetails(attendance);
    setShowDetailsDialog(true);
  };

  const handleDetailsClose = () => {
    setShowDetailsDialog(false);
    setSelectedDetails(null);
  };

  // Helper function to calculate status based on clock-in time
  const calculateStatus = (clockIn: string): 'Present' | 'Late' | 'Absent' => {
    if (!clockIn) return 'Absent';

    const clockInTime = new Date(`2000-01-01 ${clockIn}`);
    const expectedTime = new Date(`2000-01-01 09:00`); // Expected start time

    const timeDifference = clockInTime.getTime() - expectedTime.getTime();
    const minutesLate = Math.floor(timeDifference / (1000 * 60));

    if (minutesLate <= 0) {
      return 'Present';
    } else if (minutesLate <= 30) {
      return 'Late';
    } else {
      return 'Absent';
    }
  };

  const handleAddAttendance = async () => {
    try {
      // Get employee name from the employees list
      const selectedEmployeeData = employees.find(emp => emp.id.toString() === newAttendance.employee);
      const employeeName = selectedEmployeeData ? selectedEmployeeData.name : newAttendance.employee;

      const timeService = await getTimeService();
      const created = await timeService.createAttendanceRecord({
        employee: employeeName,
        date: newAttendance.date,
        status: newAttendance.status as any,
        clockIn: newAttendance.clockIn,
        clockOut: newAttendance.clockOut,
      } as Omit<AttendanceRecord, 'id'>);

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

  // Handle approval of time adjustment request
  const handleApproveAdjustment = async (request: TimeAdjustmentRequest) => {
    try {
      const timeService = await getTimeTrackingService();
      const notifService = await getTimeNotificationService();

      console.log('✅ HR: Approving adjustment request...', request.id);

      // Approve the request (this also updates the time entry automatically)
      await timeService.approveAdjustmentRequest(
        request.id,
        'HR Manager', // TODO: Get from auth context
        approvalNotes || 'Approved'
      );

      // Send notification to employee
      await notifService.notifyAdjustmentApproved(
        request.employeeId,
        request.employeeName,
        request.id,
        'HR Manager'
      );

      toast({
        title: 'Adjustment Approved',
        description: `Time adjustment for ${request.employeeName} has been approved`,
        duration: 3500
      });

      console.log('✅ HR: Adjustment approved successfully');
      setShowApprovalDialog(false);
      setSelectedRequest(null);
      setApprovalNotes('');
      setIsRejecting(false);
    } catch (error) {
      console.error('❌ HR: Approval failed:', error);
      toast({
        title: 'Error',
        description: 'Failed to approve adjustment request',
        variant: 'destructive',
        duration: 5000
      });
    }
  };

  // Handle rejection of time adjustment request
  const handleRejectAdjustment = async (request: TimeAdjustmentRequest, reason: string) => {
    try {
      const timeService = await getTimeTrackingService();
      const notifService = await getTimeNotificationService();

      console.log('❌ HR: Rejecting adjustment request...', request.id);

      await timeService.rejectAdjustmentRequest(
        request.id,
        'HR Manager', // TODO: Get from auth context
        reason
      );

      await notifService.notifyAdjustmentRejected(
        request.employeeId,
        request.employeeName,
        request.id,
        'HR Manager',
        reason
      );

      toast({
        title: 'Adjustment Rejected',
        description: `Time adjustment for ${request.employeeName} has been rejected`,
        duration: 3500
      });

      console.log('✅ HR: Adjustment rejected successfully');
      setShowApprovalDialog(false);
      setSelectedRequest(null);
      setApprovalNotes('');
      setIsRejecting(false);
    } catch (error) {
      console.error('❌ HR: Rejection failed:', error);
      toast({
        title: 'Error',
        description: 'Failed to reject adjustment request',
        variant: 'destructive',
        duration: 5000
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Time Management (HR)</h1>
            <p className="text-muted-foreground mt-2">
              Monitor employee attendance, approve adjustments, track work hours, and manage schedules
            </p>
          </div>
          <div className="flex items-center space-x-2">
            {/* Notifications */}
            <Button
              variant="outline"
              size="sm"
              className="relative"
              onClick={() => setShowNotifications(!showNotifications)}
            >
              <Bell className="h-4 w-4" />
              {notifications.filter(n => !n.read && n.sentToHr).length > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {notifications.filter(n => !n.read && n.sentToHr).length}
                </span>
              )}
            </Button>

            {/* Pending Requests Badge */}
            {adjustmentRequests.length > 0 && (
              <Badge variant="destructive" className="px-3 py-1">
                {adjustmentRequests.length} Pending
              </Badge>
            )}

            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button
              size="sm"
              className="bg-primary hover:bg-primary/90"
              onClick={() => setShowAddDialog(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Attendance
            </Button>
          </div>
        </div>

        {/* Notifications Panel */}
        {showNotifications && notifications.length > 0 && (
          <Card className="mb-8 animate-fade-in">
            <CardHeader>
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Recent Notifications</h3>
                <Badge className="bg-gray-100 text-gray-800">{notifications.filter(n => !n.read).length} unread</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {notifications.slice(0, 10).map((notif) => (
                  <div key={notif.id} className={`p-3 border rounded-lg ${notif.read ? 'opacity-60' : 'bg-blue-50'}`}>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-semibold text-sm">{notif.title}</p>
                          <Badge
                            className={`text-xs ${notif.priority === 'high'
                                ? 'bg-red-100 text-red-800'
                                : notif.priority === 'medium'
                                  ? 'bg-blue-100 text-blue-800'
                                  : 'bg-gray-100 text-gray-800'
                              }`}
                          >
                            {notif.type.replace(/_/g, ' ')}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{notif.message}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(notif.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Pending Adjustment Requests */}
        {adjustmentRequests.length > 0 && (
          <Card className="border-yellow-200 bg-yellow-50 mb-8 animate-fade-in">
            <CardHeader>
              <div className="flex items-center justify-between">
                <h3 className="flex items-center space-x-2 text-yellow-800 font-bold text-lg">
                  <AlertTriangle className="h-5 w-5" />
                  <span>Pending Time Adjustment Requests</span>
                  <Badge variant="destructive" className="ml-2">{adjustmentRequests.length}</Badge>
                </h3>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {adjustmentRequests.map((request) => (
                  <div key={request.id} className="p-4 bg-white border rounded-lg shadow-sm">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <p className="font-semibold">{request.employeeName}</p>
                          <Badge className="bg-gray-100 text-gray-800 text-xs">
                            {request.reason.replace(/_/g, ' ')}
                          </Badge>
                        </div>

                        <div className="grid grid-cols-2 gap-4 text-sm mb-2">
                          <div className="p-2 bg-gray-50 rounded">
                            <p className="text-muted-foreground text-xs font-medium mb-1">Original Times</p>
                            <p className="font-mono text-gray-700">
                              In: {new Date(request.originalClockIn).toLocaleTimeString()}
                            </p>
                            {request.originalClockOut && (
                              <p className="font-mono text-gray-700">
                                Out: {new Date(request.originalClockOut).toLocaleTimeString()}
                              </p>
                            )}
                          </div>
                          <div className="p-2 bg-blue-50 rounded">
                            <p className="text-blue-700 text-xs font-medium mb-1">Requested Times</p>
                            <p className="font-mono text-blue-700 font-semibold">
                              In: {new Date(request.requestedClockIn).toLocaleTimeString()}
                            </p>
                            {request.requestedClockOut && (
                              <p className="font-mono text-blue-700 font-semibold">
                                Out: {new Date(request.requestedClockOut).toLocaleTimeString()}
                              </p>
                            )}
                          </div>
                        </div>

                        {request.reasonText && (
                          <p className="text-sm text-muted-foreground mb-2">
                            <strong>Reason:</strong> {request.reasonText}
                          </p>
                        )}
                        {request.notes && (
                          <p className="text-sm text-muted-foreground">
                            <strong>Notes:</strong> {request.notes}
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground mt-2">
                          Requested: {new Date(request.createdAt).toLocaleString()}
                        </p>
                      </div>

                      <div className="flex flex-col space-y-2 ml-4">
                        <Button
                          size="sm"
                          className="bg-green-600 hover:bg-green-700 text-white"
                          onClick={() => {
                            setSelectedRequest(request);
                            setIsRejecting(false);
                            setShowApprovalDialog(true);
                          }}
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => {
                            setSelectedRequest(request);
                            setIsRejecting(true);
                            setShowApprovalDialog(true);
                          }}
                        >
                          <XCircle className="h-4 w-4 mr-1" />
                          Reject
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tabs for Attendance and Schedules */}
        <Tabs defaultValue="attendance" className="w-full">
          <TabsList className="grid w-full max-w-2xl grid-cols-3">
            <TabsTrigger value="attendance" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Attendance & Time
            </TabsTrigger>
            <TabsTrigger value="schedules" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Schedules
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Office Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="attendance" className="space-y-6 mt-6">
            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <h3 className="text-sm font-medium">Present Today</h3>
                  <CheckCircle className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">{summary.find(s => s.status === 'Present')?.count || 0}</div>
                  <p className="text-xs text-muted-foreground">Employees on time</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <h3 className="text-sm font-medium">Late Arrivals</h3>
                  <AlertTriangle className="h-4 w-4 text-yellow-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-yellow-600">{summary.find(s => s.status === 'Late')?.count || 0}</div>
                  <p className="text-xs text-muted-foreground">Need attention</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <h3 className="text-sm font-medium">Absent Today</h3>
                  <XCircle className="h-4 w-4 text-red-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600">{summary.find(s => s.status === 'Absent')?.count || 0}</div>
                  <p className="text-xs text-muted-foreground">Missing employees</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <h3 className="text-sm font-medium">Total Records</h3>
                  <BarChart3 className="h-4 w-4 text-blue-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{attendanceRecords.length}</div>
                  <p className="text-xs text-muted-foreground">All time entries</p>
                </CardContent>
              </Card>
            </div>

            {/* Search and Filters */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col lg:flex-row gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search employees..."
                      className="pl-10"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Select value={selectedEmployee || 'all_employees'} onValueChange={(value) => setSelectedEmployee(value === 'all_employees' ? null : value)}>
                      <SelectTrigger className="w-40">
                        <SelectValue placeholder="All Employees" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all_employees">All Employees</SelectItem>
                        {attendanceEmployees.filter(employee => employee && employee !== '').map(employee => (
                          <SelectItem key={employee} value={employee!}>{employee}</SelectItem>
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
                    >
                      <Filter className="h-4 w-4 mr-2" />
                      Filter
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Attendance Records */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Clock className="h-5 w-5" />
                  <span>Employee Time Entries</span>
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Real-time view of all employee clock in/out records
                </p>
              </CardHeader>
              <CardContent>
                {filteredAttendanceRecords.length === 0 ? (
                  <div className="text-center py-12">
                    <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-lg font-medium text-muted-foreground mb-2">No time entries found</p>
                    <p className="text-sm text-muted-foreground mb-4">Entries will appear here when employees clock in</p>
                    <Button
                      onClick={() => setShowAddDialog(true)}
                      variant="outline"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Manual Entry
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredAttendanceRecords.map((row, index) => {
                      const config = statusConfig[row.status as keyof typeof statusConfig];
                      const clockInTime = row.clockIn ? new Date(`2000-01-01 ${row.clockIn}`) : null;
                      const clockOutTime = row.clockOut ? new Date(`2000-01-01 ${row.clockOut}`) : null;
                      const workHours = clockInTime && clockOutTime
                        ? ((clockOutTime.getTime() - clockInTime.getTime()) / (1000 * 60 * 60)).toFixed(1)
                        : null;

                      return (
                        <div key={row.id || `row-${index}`} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                          <div className="flex items-start space-x-4 flex-1">
                            <div className="flex-shrink-0 mt-1">
                              <config.icon className={`h-5 w-5 ${row.status === 'Present' ? 'text-green-600' :
                                row.status === 'Late' ? 'text-yellow-600' : 'text-red-600'
                                }`} />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center space-x-3 mb-2">
                                <h3 className="text-lg font-semibold">{row.employee}</h3>
                                <Badge className={`${row.status === 'Present' ? 'bg-green-100 text-green-800' :
                                  row.status === 'Late' ? 'bg-yellow-100 text-yellow-800' :
                                    'bg-red-100 text-red-800'
                                  }`}>
                                  {row.status}
                                </Badge>
                              </div>
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                  <p className="text-sm text-muted-foreground">
                                    <strong>Date:</strong> {row.date}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-sm text-muted-foreground">
                                    <strong>Clock In:</strong> {row.clockIn || 'N/A'}
                                  </p>
                                  {row.clockOut && (
                                    <p className="text-sm text-muted-foreground">
                                      <strong>Clock Out:</strong> {row.clockOut}
                                    </p>
                                  )}
                                </div>
                                <div>
                                  {workHours && (
                                    <p className="text-sm text-muted-foreground">
                                      <strong>Work Hours:</strong> {workHours}h
                                    </p>
                                  )}
                                </div>
                              </div>
                              {row.notes && (
                                <p className="text-sm text-muted-foreground mt-2">
                                  <strong>Notes:</strong> {row.notes}
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleAdjust(row)}
                            >
                              <Edit className="h-4 w-4 mr-1" />
                              Adjust
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleViewDetails(row)}
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              View
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Add Attendance Dialog */}
            <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle>Add Attendance</DialogTitle>
                  <DialogDescription>
                    Add a new attendance record for an employee.
                  </DialogDescription>
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
              <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2 text-xl">
                    <div className="p-2 bg-violet-100 dark:bg-violet-900/30 rounded-lg">
                      <Edit className="h-5 w-5 text-violet-600 dark:text-violet-400" />
                    </div>
                    Adjust Attendance Time
                  </DialogTitle>
                  <DialogDescription>
                    Modify the clock-in and clock-out times for this attendance record.
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                  {/* Employee and Date Info */}
                  <div className="p-3 bg-gradient-to-r from-muted/50 to-muted/30 rounded-lg border">
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
                  <div className="grid grid-cols-2 gap-4 p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-800">
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

                  {/* Status Preview */}
                  {adjustForm.clockIn && (
                    <div className="p-3 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-950/30 dark:to-blue-950/30 rounded-lg border border-green-200 dark:border-green-800">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-sm font-medium text-muted-foreground mb-1">New Status Preview</div>
                          <div className="flex items-center gap-2">
                            {(() => {
                              const newStatus = calculateStatus(adjustForm.clockIn);
                              const config = statusConfig[newStatus];
                              const Icon = config.icon;
                              return (
                                <>
                                  <Icon className="h-4 w-4" />
                                  <span className={`font-semibold px-2 py-1 rounded-full text-xs ${config.color}`}>
                                    {newStatus}
                                  </span>
                                </>
                              );
                            })()}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-xs text-muted-foreground">Expected: 09:00</div>
                          <div className="text-xs text-muted-foreground">
                            {adjustForm.clockIn && (() => {
                              const clockInTime = new Date(`2000-01-01 ${adjustForm.clockIn}`);
                              const expectedTime = new Date(`2000-01-01 09:00`);
                              const timeDifference = clockInTime.getTime() - expectedTime.getTime();
                              const minutesLate = Math.floor(timeDifference / (1000 * 60));

                              if (minutesLate <= 0) {
                                return `${Math.abs(minutesLate)} min early`;
                              } else {
                                return `${minutesLate} min late`;
                              }
                            })()}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

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

            {/* Attendance Details Dialog */}
            <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2 text-xl">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                      <Eye className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    Attendance Details
                  </DialogTitle>
                  <DialogDescription>
                    View detailed information about this attendance record.
                  </DialogDescription>
                </DialogHeader>

                {selectedDetails && (
                  <div className="space-y-4 py-4">
                    {/* Quick Summary Header */}
                    <div className="p-4 bg-gradient-to-r from-slate-50 to-gray-50 dark:from-slate-900/50 dark:to-gray-900/50 rounded-lg border-2 border-slate-200 dark:border-slate-700">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="flex flex-col">
                            <span className="text-2xl font-bold">{selectedDetails.employee || selectedDetails.employeeName}</span>
                            {selectedDetails.employeeId && (
                              <span className="text-sm text-muted-foreground">ID: {selectedDetails.employeeId}</span>
                            )}
                          </div>
                          {(() => {
                            const config = statusConfig[selectedDetails.status];
                            const Icon = config.icon;
                            return (
                              <Badge className={`${config.color} text-sm px-3 py-1`}>
                                <Icon className="h-4 w-4 mr-1" />
                                {selectedDetails.status}
                              </Badge>
                            );
                          })()}
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-muted-foreground">Date</div>
                          <div className="text-lg font-semibold">{selectedDetails.date}</div>
                        </div>
                      </div>
                    </div>

                    {/* Distance Warning - Show if employee is far from office */}
                    {(selectedDetails.location as any)?.distanceFromOffice && !(selectedDetails.location as any)?.isAtOffice && (
                      <div className={`p-4 rounded-lg border-2 ${(selectedDetails.location as any).distanceFromOffice > 1000
                        ? 'bg-orange-50 border-orange-300 dark:bg-orange-950/30 dark:border-orange-800'
                        : 'bg-yellow-50 border-yellow-300 dark:bg-yellow-950/30 dark:border-yellow-800'
                        }`}>
                        <div className="flex items-start gap-3">
                          <div className={`p-2 rounded-full ${(selectedDetails.location as any).distanceFromOffice > 1000
                            ? 'bg-orange-200'
                            : 'bg-yellow-200'
                            }`}>
                            <AlertTriangle className={`h-5 w-5 ${(selectedDetails.location as any).distanceFromOffice > 1000
                              ? 'text-orange-700'
                              : 'text-yellow-700'
                              }`} />
                          </div>
                          <div className="flex-1">
                            <h4 className={`font-semibold text-sm mb-1 ${(selectedDetails.location as any).distanceFromOffice > 1000
                              ? 'text-orange-900 dark:text-orange-100'
                              : 'text-yellow-900 dark:text-yellow-100'
                              }`}>
                              {(selectedDetails.location as any).distanceFromOffice > 1000
                                ? '⚠️ Remote Clock-In Detected'
                                : '⚠️ Off-Site Clock-In'}
                            </h4>
                            <p className={`text-sm ${(selectedDetails.location as any).distanceFromOffice > 1000
                              ? 'text-orange-700 dark:text-orange-200'
                              : 'text-yellow-700 dark:text-yellow-200'
                              }`}>
                              Employee clocked in <strong>{(selectedDetails.location as any).distanceFormatted}</strong>
                              {(selectedDetails.location as any).officeName && ` from ${(selectedDetails.location as any).officeName}`}
                            </p>
                            {(selectedDetails.location as any).distanceFromOffice > 5000 && (
                              <p className="text-xs text-orange-600 dark:text-orange-300 mt-1">
                                💡 This employee may be working from home or another location
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* At Office Confirmation - Show if employee is at office */}
                    {(selectedDetails.location as any)?.isAtOffice && (
                      <div className="p-4 bg-green-50 rounded-lg border-2 border-green-300 dark:bg-green-950/30 dark:border-green-800">
                        <div className="flex items-start gap-3">
                          <div className="p-2 bg-green-200 rounded-full">
                            <CheckCircle className="h-5 w-5 text-green-700" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-sm text-green-900 dark:text-green-100 mb-1">
                              ✅ Clocked In At Office
                            </h4>
                            <p className="text-sm text-green-700 dark:text-green-200">
                              Employee clocked in at <strong>{(selectedDetails.location as any).officeName || 'the office'}</strong>
                              {(selectedDetails.location as any).distanceFromOffice &&
                                ` (within ${(selectedDetails.location as any).distanceFromOffice}m)`}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Times and Hours */}
                    <div className="text-sm font-semibold text-muted-foreground mb-2">⏰ Time Details</div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 rounded-lg border border-amber-200 dark:border-amber-800">
                        <div className="text-center">
                          <div className="text-sm font-medium text-muted-foreground mb-1">Clock In</div>
                          <div className="font-mono text-lg font-bold text-amber-900 dark:text-amber-100">
                            {selectedDetails.clockIn || 'Not set'}
                          </div>
                        </div>
                      </div>
                      <div className="p-3 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30 rounded-lg border border-purple-200 dark:border-purple-800">
                        <div className="text-center">
                          <div className="text-sm font-medium text-muted-foreground mb-1">Clock Out</div>
                          <div className="font-mono text-lg font-bold text-purple-900 dark:text-purple-100">
                            {selectedDetails.clockOut || 'Not set'}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Work Hours */}
                    {selectedDetails.clockIn && selectedDetails.clockOut && (
                      <div className="p-3 bg-gradient-to-r from-teal-50 to-cyan-50 dark:from-teal-950/30 dark:to-cyan-950/30 rounded-lg border border-teal-200 dark:border-teal-800">
                        <div className="text-center">
                          <div className="text-sm font-medium text-muted-foreground mb-1">Total Work Hours</div>
                          <div className="font-mono text-lg font-bold text-teal-900 dark:text-teal-100">
                            {(() => {
                              const start = new Date(`2000-01-01 ${selectedDetails.clockIn}`);
                              const end = new Date(`2000-01-01 ${selectedDetails.clockOut}`);
                              const diffMs = end.getTime() - start.getTime();
                              const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
                              const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
                              return `${diffHours}h ${diffMinutes}m`;
                            })()}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Location Section */}
                    <div className="text-sm font-semibold text-muted-foreground mb-2 mt-4">📍 Location Information</div>
                    {selectedDetails.location ? (
                      <div className="p-4 bg-gradient-to-r from-blue-50 to-sky-50 dark:from-blue-950/30 dark:to-sky-950/30 rounded-lg border-2 border-blue-200 dark:border-blue-800">
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <div className="text-sm font-medium text-blue-900 dark:text-blue-100">Clock In Location</div>
                            {/* Distance Badge */}
                            {(selectedDetails.location as any).distanceFormatted && (
                              <Badge className={
                                (selectedDetails.location as any).isAtOffice
                                  ? 'bg-green-100 text-green-800 border-green-300'
                                  : (selectedDetails.location as any).distanceFromOffice < 1000
                                    ? 'bg-yellow-100 text-yellow-800 border-yellow-300'
                                    : 'bg-orange-100 text-orange-800 border-orange-300'
                              }>
                                {(selectedDetails.location as any).isAtOffice ? '✅ ' : '📍 '}
                                {(selectedDetails.location as any).distanceFormatted}
                              </Badge>
                            )}
                          </div>
                          <div className="text-sm font-medium">
                            {selectedDetails.location.address || 'Location not available'}
                          </div>
                          {selectedDetails.location.latitude && selectedDetails.location.longitude && (
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <MapPin className="h-3 w-3" />
                              <span className="font-mono">
                                GPS: {selectedDetails.location.latitude.toFixed(6)}, {selectedDetails.location.longitude.toFixed(6)}
                              </span>
                            </div>
                          )}
                          {(selectedDetails.location as any).officeName && (
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <Building2 className="h-3 w-3" />
                              <span>Measured from: {(selectedDetails.location as any).officeName}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 text-center">
                        <p className="text-sm text-muted-foreground">No location data available</p>
                        <p className="text-xs text-muted-foreground mt-1">Employee may have clocked in before location tracking was enabled</p>
                      </div>
                    )}

                    {/* Notes and Reason */}
                    {(selectedDetails.notes || selectedDetails.reason) && (
                      <div className="space-y-3">
                        <div className="text-sm font-semibold text-muted-foreground mb-2 mt-4">📝 Additional Information</div>
                        {selectedDetails.notes && (
                          <div className="p-3 bg-gradient-to-r from-gray-50 to-slate-50 dark:from-gray-950/30 dark:to-slate-950/30 rounded-lg border border-gray-200 dark:border-gray-800">
                            <div className="text-sm font-medium text-muted-foreground mb-1">Notes</div>
                            <div className="text-sm">{selectedDetails.notes}</div>
                          </div>
                        )}
                        {selectedDetails.reason && (
                          <div className="p-3 bg-gradient-to-r from-red-50 to-rose-50 dark:from-red-950/30 dark:to-rose-950/30 rounded-lg border border-red-200 dark:border-red-800">
                            <div className="text-sm font-medium text-muted-foreground mb-1">Reason for Adjustment</div>
                            <div className="text-sm capitalize">{selectedDetails.reason.replace(/_/g, ' ')}</div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Close Button */}
                <div className="flex justify-end pt-3 border-t">
                  <Button onClick={handleDetailsClose} variant="outline">
                    <X className="h-4 w-4 mr-2" />
                    Close
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            {/* Adjustment Approval/Rejection Dialog */}
            <Dialog open={showApprovalDialog} onOpenChange={setShowApprovalDialog}>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    {isRejecting ? (
                      <>
                        <XCircle className="h-5 w-5 text-red-600" />
                        <span>Reject Time Adjustment</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-5 w-5 text-green-600" />
                        <span>Approve Time Adjustment</span>
                      </>
                    )}
                  </DialogTitle>
                  <DialogDescription>
                    {isRejecting
                      ? 'Provide a reason for rejecting this time adjustment request'
                      : 'Review and approve the time adjustment request'
                    }
                  </DialogDescription>
                </DialogHeader>

                {selectedRequest && (
                  <div className="space-y-4 py-4">
                    {/* Employee Info */}
                    <div className="p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label className="text-sm font-medium text-muted-foreground">Employee</Label>
                          <p className="font-semibold text-lg">{selectedRequest.employeeName}</p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-muted-foreground">Reason</Label>
                          <p className="text-sm capitalize">{selectedRequest.reason.replace(/_/g, ' ')}</p>
                        </div>
                      </div>
                    </div>

                    {/* Time Comparison */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-3 bg-gray-50 rounded-lg border">
                        <Label className="text-sm font-medium text-muted-foreground mb-2 block">Original Times</Label>
                        <div className="space-y-1">
                          <p className="font-mono text-sm">
                            <strong>In:</strong> {new Date(selectedRequest.originalClockIn).toLocaleTimeString()}
                          </p>
                          {selectedRequest.originalClockOut && (
                            <p className="font-mono text-sm">
                              <strong>Out:</strong> {new Date(selectedRequest.originalClockOut).toLocaleTimeString()}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                        <Label className="text-sm font-medium text-blue-700 mb-2 block">Requested Times</Label>
                        <div className="space-y-1">
                          <p className="font-mono text-sm text-blue-700 font-semibold">
                            <strong>In:</strong> {new Date(selectedRequest.requestedClockIn).toLocaleTimeString()}
                          </p>
                          {selectedRequest.requestedClockOut && (
                            <p className="font-mono text-sm text-blue-700 font-semibold">
                              <strong>Out:</strong> {new Date(selectedRequest.requestedClockOut).toLocaleTimeString()}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Employee's Reason */}
                    {selectedRequest.reasonText && (
                      <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
                        <Label className="text-sm font-medium text-amber-800 mb-1 block">Employee's Explanation</Label>
                        <p className="text-sm">{selectedRequest.reasonText}</p>
                      </div>
                    )}

                    {/* Employee's Notes */}
                    {selectedRequest.notes && (
                      <div className="p-3 bg-slate-50 rounded-lg border">
                        <Label className="text-sm font-medium text-muted-foreground mb-1 block">Additional Notes</Label>
                        <p className="text-sm">{selectedRequest.notes}</p>
                      </div>
                    )}

                    {/* HR Notes/Reason */}
                    <div>
                      <Label>{isRejecting ? 'Rejection Reason (Required)' : 'Approval Notes (Optional)'}</Label>
                      <Textarea
                        value={approvalNotes}
                        onChange={(e) => setApprovalNotes(e.target.value)}
                        placeholder={isRejecting ? 'Explain why this request is being rejected...' : 'Add any notes about this approval...'}
                        rows={3}
                        className="mt-2"
                      />
                    </div>
                  </div>
                )}

                <DialogFooter>
                  <Button variant="outline" onClick={() => {
                    setShowApprovalDialog(false);
                    setSelectedRequest(null);
                    setApprovalNotes('');
                    setIsRejecting(false);
                  }}>
                    Cancel
                  </Button>
                  {isRejecting ? (
                    <Button
                      variant="destructive"
                      onClick={() => selectedRequest && handleRejectAdjustment(selectedRequest, approvalNotes)}
                      disabled={!approvalNotes.trim()}
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Reject Request
                    </Button>
                  ) : (
                    <Button
                      className="bg-green-600 hover:bg-green-700"
                      onClick={() => selectedRequest && handleApproveAdjustment(selectedRequest)}
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Approve Request
                    </Button>
                  )}
                </DialogFooter>
              </DialogContent>
            </Dialog>

          </TabsContent>

          {/* Schedules Tab */}
          <TabsContent value="schedules" className="mt-6">
            <ScheduleManager />
          </TabsContent>

          <TabsContent value="settings" className="space-y-6 mt-6">
            {/* Office Location Configuration */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Building2 className="h-5 w-5" />
                      Office Locations
                    </CardTitle>
                    <CardDescription>
                      Configure office locations to track employee proximity when clocking in
                    </CardDescription>
                  </div>
                  <Button onClick={() => {
                    setEditingOffice(null);
                    setOfficeForm({ name: '', address: '', latitude: '', longitude: '', radius: '100' });
                    setShowOfficeDialog(true);
                  }}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Office
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {officeLocations.length === 0 ? (
                  <div className="text-center py-12">
                    <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground mb-2">No office locations configured</p>
                    <p className="text-sm text-muted-foreground mb-4">
                      Add your office location to track employee proximity during clock-in
                    </p>
                    <Button onClick={() => {
                      setEditingOffice(null);
                      setOfficeForm({ name: '', address: '', latitude: '', longitude: '', radius: '100' });
                      setShowOfficeDialog(true);
                    }}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add First Office Location
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {officeLocations.map(office => (
                      <div key={office.id} className="flex items-start justify-between p-4 border rounded-lg">
                        <div className="flex items-start gap-3 flex-1">
                          <div className="p-2 bg-blue-50 rounded-lg">
                            <Building2 className="h-5 w-5 text-blue-600" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold">{office.name}</h3>
                              {office.isDefault && (
                                <Badge className="bg-green-100 text-green-800">Default</Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">{office.address}</p>
                            <div className="grid grid-cols-3 gap-3 text-xs text-muted-foreground">
                              <div>
                                <p className="font-medium">Latitude</p>
                                <p className="font-mono">{office.latitude.toFixed(6)}</p>
                              </div>
                              <div>
                                <p className="font-medium">Longitude</p>
                                <p className="font-mono">{office.longitude.toFixed(6)}</p>
                              </div>
                              <div>
                                <p className="font-medium">Radius</p>
                                <p>{office.radius}m</p>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEditOffice(office)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          {!office.isDefault && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={async () => {
                                const service = await getOfficeLocationService();
                                await service.setDefaultOffice(office.id);
                                await loadOfficeLocations();
                                toast({ title: "Default office updated" });
                              }}
                            >
                              Set Default
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDeleteOffice(office.id, office.name)}
                          >
                            <X className="h-4 w-4 text-red-600" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Info Box */}
                {defaultOffice && (
                  <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-start gap-3">
                      <MapPin className="h-5 w-5 text-blue-600 mt-0.5" />
                      <div className="flex-1">
                        <h4 className="font-semibold text-sm text-blue-900 mb-1">
                          How It Works
                        </h4>
                        <p className="text-xs text-blue-700">
                          When employees clock in, their GPS location is compared to the office location.
                          The system calculates and displays the distance:
                        </p>
                        <ul className="text-xs text-blue-700 mt-2 space-y-1 ml-4">
                          <li>✅ <strong>Within {defaultOffice.radius}m:</strong> "At Office" (green)</li>
                          <li>⚠️ <strong>100m - 1km:</strong> "XXXm from Office" (yellow)</li>
                          <li>❌ <strong>Over 1km:</strong> "X.Xkm from Office" (orange)</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Add/Edit Office Location Dialog */}
        <Dialog open={showOfficeDialog} onOpenChange={(open) => {
          setShowOfficeDialog(open);
          if (!open) {
            setEditingOffice(null);
            setOfficeForm({ name: '', address: '', latitude: '', longitude: '', radius: '100' });
          }
        }}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingOffice ? 'Edit' : 'Add'} Office Location</DialogTitle>
              <DialogDescription>
                {editingOffice ? 'Update' : 'Configure'} an office location to track employee proximity during clock-in
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div>
                <Label>Office Name</Label>
                <Input
                  value={officeForm.name}
                  onChange={(e) => setOfficeForm({ ...officeForm, name: e.target.value })}
                  placeholder="e.g., Main Office, Kigali Branch"
                />
              </div>

              <div>
                <Label>Address</Label>
                <Textarea
                  value={officeForm.address}
                  onChange={(e) => setOfficeForm({ ...officeForm, address: e.target.value })}
                  placeholder="e.g., KG 11 Ave, Kigali, Rwanda"
                  rows={2}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Latitude</Label>
                  <Input
                    type="number"
                    step="0.000001"
                    value={officeForm.latitude}
                    onChange={(e) => setOfficeForm({ ...officeForm, latitude: e.target.value })}
                    placeholder="-1.9536"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Get from Google Maps: Right-click location → Copy coordinates
                  </p>
                </div>
                <div>
                  <Label>Longitude</Label>
                  <Input
                    type="number"
                    step="0.000001"
                    value={officeForm.longitude}
                    onChange={(e) => setOfficeForm({ ...officeForm, longitude: e.target.value })}
                    placeholder="30.0606"
                  />
                </div>
              </div>

              <div>
                <Label>Proximity Radius (meters)</Label>
                <Input
                  type="number"
                  value={officeForm.radius}
                  onChange={(e) => setOfficeForm({ ...officeForm, radius: e.target.value })}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Employees within this radius are considered "At Office"
                </p>
              </div>

              <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
                <p className="text-sm text-amber-800">
                  💡 <strong>Tip:</strong> To get accurate coordinates:
                </p>
                <ol className="text-xs text-amber-700 mt-2 ml-4 space-y-1">
                  <li>1. Open <a href="https://www.google.com/maps" target="_blank" className="underline">Google Maps</a></li>
                  <li>2. Right-click on your office location</li>
                  <li>3. Click the coordinates at the top to copy them</li>
                  <li>4. Paste here (format: -1.9536, 30.0606)</li>
                </ol>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => {
                setShowOfficeDialog(false);
                setEditingOffice(null);
                setOfficeForm({ name: '', address: '', latitude: '', longitude: '', radius: '100' });
              }}>
                Cancel
              </Button>
              <Button
                onClick={handleSaveOfficeLocation}
                disabled={!officeForm.name || !officeForm.latitude || !officeForm.longitude}
              >
                <Save className="h-4 w-4 mr-2" />
                {editingOffice ? 'Update' : 'Save'} Office Location
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}