import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Textarea } from '../../../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '../../../components/ui/dialog';
import {
    Clock,
    MapPin,
    Camera,
    Play,
    Pause,
    Square,
    Calendar,
    TrendingUp,
    BarChart3,
    PieChart,
    Download,
    Upload,
    Settings,
    AlertCircle,
    CheckCircle,
    XCircle,
    Timer,
    Coffee,
    Home,
    Building,
    Navigation,
    Battery,
    Wifi,
    WifiOff,
    Bell,
    Edit
} from 'lucide-react';
import { TimeEntry as LocalTimeEntry, GeoLocation, TimeAdjustment, Schedule } from '../types';

// Import Firebase services
import { getTimeTrackingService, TimeEntry as FirebaseTimeEntry } from '../../../services/timeTrackingService';
import { getTimeNotificationService, TimeNotification } from '../../../services/timeNotificationService';
import { getScheduleService, WorkSchedule as FirebaseSchedule, getShortDayName } from '../../../services/scheduleService';

export default function TimeManagement() {
    // Employee info - TODO: Get from actual auth context
    const employeeId = 'emp-001';
    const employeeName = 'John Doe';

    const [timeEntries, setTimeEntries] = useState<FirebaseTimeEntry[]>([]);
    const [schedule, setSchedule] = useState<FirebaseSchedule | null>(null);
    const [currentEntry, setCurrentEntry] = useState<FirebaseTimeEntry | null>(null);
    const [loading, setLoading] = useState(false);
    const [location, setLocation] = useState<GeoLocation | null>(null);
    const [isOnline, setIsOnline] = useState(navigator.onLine);
    const [batteryLevel, setBatteryLevel] = useState<number | null>(null);
    const [notifications, setNotifications] = useState<TimeNotification[]>([]);
    const [showNotifications, setShowNotifications] = useState(false);

    // Adjustment request dialog
    const [showAdjustDialog, setShowAdjustDialog] = useState(false);
    const [selectedEntry, setSelectedEntry] = useState<FirebaseTimeEntry | null>(null);
    const [adjustForm, setAdjustForm] = useState({
        requestedClockIn: '',
        requestedClockOut: '',
        reason: 'forgot_clock_in' as 'forgot_clock_in' | 'forgot_clock_out' | 'system_error' | 'wrong_time' | 'other',
        reasonText: '',
        notes: ''
    });

    // Break tracking
    const [onBreak, setOnBreak] = useState(false);
    const [breakStartTime, setBreakStartTime] = useState<Date | null>(null);
    const [totalBreakTime, setTotalBreakTime] = useState(0); // in minutes
    const [todayEntry, setTodayEntry] = useState<FirebaseTimeEntry | null>(null);

    // Set up real-time subscriptions
    useEffect(() => {
        let unsubscribeEntries: (() => void) | undefined;
        let unsubscribeNotifications: (() => void) | undefined;
        let unsubscribeSchedule: (() => void) | undefined;

        const setupServices = async () => {
            try {
                const timeService = await getTimeTrackingService();
                const notifService = await getTimeNotificationService();
                const scheduleService = await getScheduleService();

                console.log('📡 Setting up real-time subscriptions...');

                // Subscribe to time entries
                unsubscribeEntries = timeService.subscribeToTimeEntries(
                    employeeId,
                    (entries) => {
                        console.log('📊 Time entries updated:', entries.length);
                        setTimeEntries(entries);
                        const active = entries.find(e => e.status === 'active');
                        setCurrentEntry(active || null);

                        // Check if already clocked in today
                        const today = new Date().toISOString().split('T')[0];
                        const todaysEntry = entries.find(e => {
                            const entryDate = new Date(e.clockIn).toISOString().split('T')[0];
                            return entryDate === today;
                        });
                        setTodayEntry(todaysEntry || null);

                        // Restore break state if on break
                        if (active && active.breakTime > 0) {
                            setTotalBreakTime(active.breakTime);
                        }
                    }
                );

                // Subscribe to notifications
                unsubscribeNotifications = notifService.subscribeToNotifications(
                    employeeId,
                    (notifs) => {
                        console.log('🔔 Notifications updated:', notifs.length);
                        setNotifications(notifs);
                    }
                );

                // Subscribe to schedule updates (real-time)
                unsubscribeSchedule = scheduleService.subscribeToSchedules(
                    (schedules) => {
                        const activeSchedule = schedules.find(s => s.isActive);
                        if (activeSchedule) {
                            setSchedule(activeSchedule);
                            console.log('📅 Schedule updated:', activeSchedule.shiftType);
                        }
                    },
                    employeeId
                );

                console.log('✅ Real-time sync initialized successfully');
            } catch (error) {
                console.error('❌ Failed to initialize services:', error);
            }
        };

        setupServices();

        // Monitor online status
        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => setIsOnline(false);

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        // Get battery level if available
        if ('getBattery' in navigator) {
            (navigator as any).getBattery().then((battery: any) => {
                setBatteryLevel(Math.round(battery.level * 100));
            });
        }

        return () => {
            unsubscribeEntries?.();
            unsubscribeNotifications?.();
            unsubscribeSchedule?.();
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, [employeeId]);

    const getCurrentLocation = (): Promise<GeoLocation> => {
        return new Promise((resolve, reject) => {
            if (!navigator.geolocation) {
                reject(new Error('Geolocation is not supported'));
                return;
            }

            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const location: GeoLocation = {
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude,
                        accuracy: position.coords.accuracy,
                        timestamp: new Date()
                    };
                    resolve(location);
                },
                (error) => {
                    reject(error);
                },
                {
                    enableHighAccuracy: true,
                    timeout: 10000,
                    maximumAge: 300000 // 5 minutes
                }
            );
        });
    };

    const handleClockIn = async () => {
        // Check if already clocked in today
        if (todayEntry) {
            alert('You have already clocked in today! You can only clock in once per day.');
            return;
        }

        setLoading(true);
        try {
            const timeService = await getTimeTrackingService();
            const notifService = await getTimeNotificationService();

            // Get GPS location
            const currentLocation = await getCurrentLocation();

            // Clock in with Firebase
            console.log('⏰ Clocking in...');
            const entry = await timeService.clockIn(
                employeeId,
                employeeName,
                currentLocation
            );

            // Send notification to HR
            await notifService.notifyClockIn(
                employeeId,
                employeeName,
                entry.id,
                currentLocation.address
            );

            console.log('✅ Clocked in successfully');
            alert('Clocked in successfully!');
        } catch (error) {
            console.error('❌ Clock in failed:', error);
            alert('Unable to clock in. Please check your location services and try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleClockOut = async () => {
        if (!currentEntry) return;

        setLoading(true);
        try {
            const timeService = await getTimeTrackingService();
            const notifService = await getTimeNotificationService();

            // Get GPS location
            const currentLocation = await getCurrentLocation();

            // Clock out with Firebase
            console.log('⏰ Clocking out...');
            const updated = await timeService.clockOut(
                currentEntry.id,
                currentLocation
            );

            // Calculate hours worked
            const clockInTime = new Date(currentEntry.clockIn).getTime();
            const clockOutTime = new Date(updated.clockOut!).getTime();
            const hoursWorked = (clockOutTime - clockInTime) / (1000 * 60 * 60);

            // Send notification to HR
            await notifService.notifyClockOut(
                employeeId,
                employeeName,
                updated.id,
                hoursWorked
            );

            console.log('✅ Clocked out successfully');
            alert('Clocked out successfully!');
        } catch (error) {
            console.error('❌ Clock out failed:', error);
            alert('Unable to clock out. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleRequestAdjustment = (entry: FirebaseTimeEntry) => {
        setSelectedEntry(entry);

        // Pre-fill form with current times
        const clockInDate = new Date(entry.clockIn);
        const clockInTime = clockInDate.toTimeString().slice(0, 5);

        let clockOutTime = '';
        if (entry.clockOut) {
            const clockOutDate = new Date(entry.clockOut);
            clockOutTime = clockOutDate.toTimeString().slice(0, 5);
        }

        setAdjustForm({
            requestedClockIn: clockInTime,
            requestedClockOut: clockOutTime,
            reason: 'forgot_clock_in',
            reasonText: '',
            notes: ''
        });

        setShowAdjustDialog(true);
    };

    const handleSubmitAdjustment = async () => {
        if (!selectedEntry) return;

        try {
            const timeService = await getTimeTrackingService();
            const notifService = await getTimeNotificationService();

            // Convert time strings to dates
            const entryDate = new Date(selectedEntry.clockIn);
            const [inHours, inMinutes] = adjustForm.requestedClockIn.split(':');
            const requestedClockIn = new Date(entryDate);
            requestedClockIn.setHours(parseInt(inHours), parseInt(inMinutes), 0, 0);

            let requestedClockOut = new Date();
            if (adjustForm.requestedClockOut) {
                const [outHours, outMinutes] = adjustForm.requestedClockOut.split(':');
                requestedClockOut = new Date(entryDate);
                requestedClockOut.setHours(parseInt(outHours), parseInt(outMinutes), 0, 0);
            }

            // Create adjustment request
            console.log('📝 Submitting adjustment request...');
            const request = await timeService.createAdjustmentRequest({
                timeEntryId: selectedEntry.id,
                employeeId,
                employeeName,
                originalClockIn: selectedEntry.clockIn,
                originalClockOut: selectedEntry.clockOut || new Date(),
                requestedClockIn,
                requestedClockOut: adjustForm.requestedClockOut ? requestedClockOut : undefined,
                reason: adjustForm.reason,
                reasonText: adjustForm.reasonText,
                notes: adjustForm.notes,
                status: 'pending',
                createdAt: new Date()
            });

            // Send notification to HR
            await notifService.notifyAdjustmentRequest(
                employeeId,
                employeeName,
                request.id
            );

            console.log('✅ Adjustment request submitted');
            alert('Adjustment request submitted successfully! HR will review your request.');

            setShowAdjustDialog(false);
            setSelectedEntry(null);
        } catch (error) {
            console.error('❌ Failed to submit adjustment:', error);
            alert('Failed to submit adjustment request. Please try again.');
        }
    };

    const handleBreakStart = async () => {
        if (!currentEntry) {
            alert('Please clock in first before taking a break.');
            return;
        }

        if (onBreak) {
            alert('You are already on break!');
            return;
        }

        setOnBreak(true);
        setBreakStartTime(new Date());
        console.log('☕ Break started at', new Date().toLocaleTimeString());
        alert('Break started. Don\'t forget to end your break!');
    };

    const handleBreakEnd = async () => {
        if (!currentEntry) return;
        if (!onBreak || !breakStartTime) {
            alert('You are not currently on break.');
            return;
        }

        try {
            const timeService = await getTimeTrackingService();

            // Calculate break duration
            const breakEndTime = new Date();
            const breakDuration = Math.floor((breakEndTime.getTime() - breakStartTime.getTime()) / (1000 * 60)); // in minutes
            const newTotalBreakTime = totalBreakTime + breakDuration;

            // Update the time entry with total break time
            await timeService.updateTimeEntry(currentEntry.id, {
                breakTime: newTotalBreakTime
            });

            setTotalBreakTime(newTotalBreakTime);
            setOnBreak(false);
            setBreakStartTime(null);

            console.log(`✅ Break ended. Duration: ${breakDuration} minutes. Total break time: ${newTotalBreakTime} minutes`);
            alert(`Break ended. You were on break for ${breakDuration} minutes.`);
        } catch (error) {
            console.error('❌ Failed to end break:', error);
            alert('Failed to record break end. Please try again.');
        }
    };

    const formatTime = (date: Date) => {
        return new Intl.DateTimeFormat('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: true
        }).format(date);
    };

    const formatDate = (date: Date) => {
        return new Intl.DateTimeFormat('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        }).format(date);
    };

    const calculateWorkHours = (clockIn: Date, clockOut: Date, breakTime: number) => {
        const diffMs = clockOut.getTime() - clockIn.getTime();
        const diffHours = diffMs / (1000 * 60 * 60);
        return Math.max(0, diffHours - (breakTime / 60));
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active': return 'bg-green-100 text-green-800';
            case 'completed': return 'bg-blue-100 text-blue-800';
            case 'adjusted': return 'bg-yellow-100 text-yellow-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'active': return <Play className="h-4 w-4 text-green-600" />;
            case 'completed': return <CheckCircle className="h-4 w-4 text-blue-600" />;
            case 'adjusted': return <AlertCircle className="h-4 w-4 text-yellow-600" />;
            default: return <Clock className="h-4 w-4 text-gray-600" />;
        }
    };

    const totalWorkHours = timeEntries
        .filter(entry => entry.status === 'completed' && entry.clockOut)
        .reduce((total, entry) => {
            const hours = calculateWorkHours(entry.clockIn, entry.clockOut!, entry.breakTime);
            return total + hours;
        }, 0);

    const averageWorkHours = timeEntries.length > 0 ? totalWorkHours / timeEntries.length : 0;

    return (
        <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 p-6">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-foreground">Time Management</h1>
                        <p className="text-muted-foreground mt-2">
                            Track your work hours and manage your schedule
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
                            {notifications.filter(n => !n.read).length > 0 && (
                                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                                    {notifications.filter(n => !n.read).length}
                                </span>
                            )}
                        </Button>

                        <Badge variant={isOnline ? "default" : "destructive"}>
                            {isOnline ? (
                                <>
                                    <Wifi className="h-3 w-3 mr-1" />
                                    Online
                                </>
                            ) : (
                                <>
                                    <WifiOff className="h-3 w-3 mr-1" />
                                    Offline
                                </>
                            )}
                        </Badge>
                        {batteryLevel && (
                            <Badge variant="outline">
                                <Battery className="h-3 w-3 mr-1" />
                                {batteryLevel}%
                            </Badge>
                        )}
                    </div>
                </div>

                {/* Notifications Panel */}
                {showNotifications && notifications.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Notifications</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                {notifications.slice(0, 5).map((notif) => (
                                    <div key={notif.id} className={`p-3 border rounded-lg ${notif.read ? 'opacity-60' : 'bg-blue-50'}`}>
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <p className="font-semibold text-sm">{notif.title}</p>
                                                <p className="text-sm text-muted-foreground">{notif.message}</p>
                                                <p className="text-xs text-muted-foreground mt-1">
                                                    {new Date(notif.createdAt).toLocaleString()}
                                                </p>
                                            </div>
                                            <Badge variant={notif.priority === 'high' ? 'destructive' : 'default'} className="text-xs">
                                                {notif.type.replace('_', ' ')}
                                            </Badge>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Current Status */}
                {currentEntry && (
                    <Card className={onBreak ? "border-orange-200 bg-orange-50" : "border-green-200 bg-green-50"}>
                        <CardHeader>
                            <CardTitle className={`flex items-center space-x-2 ${onBreak ? 'text-orange-800' : 'text-green-800'}`}>
                                {onBreak ? (
                                    <>
                                        <Coffee className="h-5 w-5" />
                                        <span>On Break</span>
                                    </>
                                ) : (
                                    <>
                                        <Play className="h-5 w-5" />
                                        <span>Currently Working</span>
                                    </>
                                )}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className={`text-lg font-semibold ${onBreak ? 'text-orange-800' : 'text-green-800'}`}>
                                        Clocked in at {formatTime(new Date(currentEntry.clockIn))}
                                    </p>
                                    <p className={`text-sm ${onBreak ? 'text-orange-600' : 'text-green-600'}`}>
                                        {formatDate(new Date(currentEntry.clockIn))}
                                    </p>
                                    {currentEntry.location && (
                                        <p className={`text-sm ${onBreak ? 'text-orange-600' : 'text-green-600'} flex items-center mt-1`}>
                                            <MapPin className="h-3 w-3 mr-1" />
                                            {currentEntry.location.address}
                                        </p>
                                    )}
                                    {totalBreakTime > 0 && (
                                        <p className={`text-sm ${onBreak ? 'text-orange-600' : 'text-green-600'} flex items-center mt-1`}>
                                            <Coffee className="h-3 w-3 mr-1" />
                                            Total break time: {totalBreakTime} minutes
                                        </p>
                                    )}
                                    {onBreak && breakStartTime && (
                                        <p className="text-sm text-orange-600 flex items-center mt-2 font-semibold">
                                            <Timer className="h-3 w-3 mr-1" />
                                            On break for {Math.floor((Date.now() - breakStartTime.getTime()) / (1000 * 60))} minutes
                                        </p>
                                    )}
                                </div>
                                <div className="flex items-center space-x-2">
                                    {!onBreak ? (
                                        <>
                                            <Button variant="outline" size="sm" onClick={handleBreakStart}>
                                                <Coffee className="h-4 w-4 mr-2" />
                                                Start Break
                                            </Button>
                                            <Button onClick={handleClockOut} disabled={loading}>
                                                {loading ? (
                                                    <>
                                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                                        Clocking Out...
                                                    </>
                                                ) : (
                                                    <>
                                                        <Square className="h-4 w-4 mr-2" />
                                                        Clock Out
                                                    </>
                                                )}
                                            </Button>
                                        </>
                                    ) : (
                                        <Button onClick={handleBreakEnd} className="bg-orange-600 hover:bg-orange-700">
                                            <Coffee className="h-4 w-4 mr-2" />
                                            End Break
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Already Clocked In Today Message */}
                {todayEntry && !currentEntry && (
                    <Card className="border-blue-200 bg-blue-50">
                        <CardContent className="py-6">
                            <div className="text-center">
                                <CheckCircle className="h-12 w-12 text-blue-600 mx-auto mb-3" />
                                <h3 className="text-lg font-semibold text-blue-800 mb-2">Already Clocked In Today</h3>
                                <p className="text-sm text-blue-600">
                                    You clocked in at {formatTime(new Date(todayEntry.clockIn))}
                                    {todayEntry.clockOut && ` and clocked out at ${formatTime(new Date(todayEntry.clockOut))}`}
                                </p>
                                <p className="text-xs text-blue-600 mt-2">
                                    You can only clock in once per day. See your entry in the timesheet below.
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Quick Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Today's Hours</CardTitle>
                            <Clock className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {currentEntry ?
                                    `${Math.floor((Date.now() - currentEntry.clockIn.getTime()) / (1000 * 60 * 60))}h ${Math.floor(((Date.now() - currentEntry.clockIn.getTime()) % (1000 * 60 * 60)) / (1000 * 60))}m` :
                                    '0h 0m'
                                }
                            </div>
                            <p className="text-xs text-muted-foreground">Current session</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Hours</CardTitle>
                            <TrendingUp className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{totalWorkHours.toFixed(1)}h</div>
                            <p className="text-xs text-muted-foreground">This month</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Average Hours</CardTitle>
                            <BarChart3 className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{averageWorkHours.toFixed(1)}h</div>
                            <p className="text-xs text-muted-foreground">Per day</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Entries</CardTitle>
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{timeEntries.length}</div>
                            <p className="text-xs text-muted-foreground">This month</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Main Content */}
                <Tabs defaultValue="timesheet" className="space-y-4">
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="timesheet">Timesheet</TabsTrigger>
                        <TabsTrigger value="schedule">Schedule</TabsTrigger>
                        <TabsTrigger value="reports">Reports</TabsTrigger>
                    </TabsList>

                    <TabsContent value="timesheet" className="space-y-4">
                        {/* Clock In/Out Controls */}
                        {!currentEntry && !todayEntry && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center space-x-2">
                                        <Clock className="h-5 w-5" />
                                        <span>Clock In/Out</span>
                                    </CardTitle>
                                    <CardDescription>
                                        Start your work day (You can only clock in once per day)
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex items-center justify-center space-x-4">
                                        <Button
                                            size="lg"
                                            onClick={handleClockIn}
                                            disabled={loading || !!todayEntry}
                                            className="bg-green-600 hover:bg-green-700"
                                        >
                                            {loading ? (
                                                <>
                                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                                                    Clocking In...
                                                </>
                                            ) : (
                                                <>
                                                    <Play className="h-5 w-5 mr-2" />
                                                    Clock In
                                                </>
                                            )}
                                        </Button>
                                    </div>
                                    <div className="mt-4 text-center">
                                        <p className="text-sm text-muted-foreground">
                                            Location services will be used to verify your work location
                                        </p>
                                        <p className="text-xs text-muted-foreground mt-2">
                                            💡 Tip: You can take multiple breaks during the day
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Time Entries */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center space-x-2">
                                    <Calendar className="h-5 w-5" />
                                    <span>Time Entries</span>
                                </CardTitle>
                                <CardDescription>
                                    Your recent clock in/out records
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {timeEntries.map((entry) => (
                                        <div key={entry.id} className="flex items-center justify-between p-4 border rounded-lg">
                                            <div className="flex items-start space-x-4">
                                                <div className="flex-shrink-0 mt-1">
                                                    {getStatusIcon(entry.status)}
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex items-center space-x-3">
                                                        <h3 className="text-lg font-semibold">
                                                            {formatDate(entry.clockIn)}
                                                        </h3>
                                                        <Badge className={getStatusColor(entry.status)}>
                                                            {entry.status}
                                                        </Badge>
                                                    </div>
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                                                        <div>
                                                            <p className="text-sm text-muted-foreground">
                                                                <strong>Clock In:</strong> {formatTime(entry.clockIn)}
                                                            </p>
                                                            {entry.clockOut && (
                                                                <p className="text-sm text-muted-foreground">
                                                                    <strong>Clock Out:</strong> {formatTime(entry.clockOut)}
                                                                </p>
                                                            )}
                                                        </div>
                                                        <div>
                                                            <p className="text-sm text-muted-foreground">
                                                                <strong>Break Time:</strong> {entry.breakTime} minutes
                                                            </p>
                                                            {entry.clockOut && (
                                                                <p className="text-sm text-muted-foreground">
                                                                    <strong>Work Hours:</strong> {calculateWorkHours(entry.clockIn, entry.clockOut, entry.breakTime).toFixed(1)}h
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>
                                                    {entry.location && (
                                                        <p className="text-sm text-muted-foreground mt-2 flex items-center">
                                                            <MapPin className="h-3 w-3 mr-1" />
                                                            {entry.location.address}
                                                        </p>
                                                    )}
                                                    {entry.notes && (
                                                        <p className="text-sm text-muted-foreground mt-2">
                                                            <strong>Notes:</strong> {entry.notes}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <Button size="sm" variant="outline">
                                                    <Download className="h-4 w-4" />
                                                </Button>
                                                {entry.status === 'completed' && (
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => handleRequestAdjustment(entry)}
                                                    >
                                                        <Edit className="h-4 w-4 mr-1" />
                                                        Adjust
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="schedule" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center space-x-2">
                                    <Calendar className="h-5 w-5" />
                                    <span>My Work Schedule</span>
                                </CardTitle>
                                <CardDescription>
                                    Your assigned work schedule and shift details
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {schedule ? (
                                    <div className="space-y-6">
                                        {/* Shift Info Card */}
                                        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                                            <div className="flex items-center justify-between mb-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="p-2 bg-blue-100 rounded-lg">
                                                        <Clock className="h-5 w-5 text-blue-600" />
                                                    </div>
                                                    <div>
                                                        <h3 className="font-semibold text-lg capitalize">{schedule.shiftType} Shift</h3>
                                                        <p className="text-sm text-muted-foreground">
                                                            {schedule.shiftStartTime} - {schedule.shiftEndTime}
                                                        </p>
                                                    </div>
                                                </div>
                                                <Badge className={schedule.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                                                    {schedule.isActive ? 'Active' : 'Inactive'}
                                                </Badge>
                                            </div>

                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                                <div>
                                                    <p className="text-xs text-muted-foreground mb-1">Work Hours</p>
                                                    <p className="text-xl font-bold text-blue-600">{schedule.workHours}h</p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-muted-foreground mb-1">Break Time</p>
                                                    <p className="text-xl font-bold text-blue-600">{schedule.breakDuration} min</p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-muted-foreground mb-1">Location</p>
                                                    <p className="text-lg font-semibold text-blue-800">{schedule.location || 'Office'}</p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-muted-foreground mb-1">Net Work</p>
                                                    <p className="text-xl font-bold text-blue-600">
                                                        {(schedule.workHours - (schedule.breakDuration / 60)).toFixed(1)}h
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Weekly Schedule */}
                                        <div>
                                            <h4 className="font-semibold mb-3 flex items-center gap-2">
                                                <Calendar className="h-4 w-4" />
                                                Weekly Schedule
                                            </h4>
                                            <div className="grid grid-cols-7 gap-2">
                                                {[0, 1, 2, 3, 4, 5, 6].map(day => {
                                                    const isWorkDay = schedule.workDays.includes(day);
                                                    const dayName = getShortDayName(day);
                                                    return (
                                                        <div
                                                            key={day}
                                                            className={`p-3 rounded-lg text-center ${
                                                                isWorkDay
                                                                    ? 'bg-green-100 border-2 border-green-300'
                                                                    : 'bg-gray-100 border border-gray-200'
                                                            }`}
                                                        >
                                                            <p className="text-xs font-medium text-muted-foreground mb-1">
                                                                {dayName}
                                                            </p>
                                                            {isWorkDay ? (
                                                                <>
                                                                    <CheckCircle className="h-5 w-5 text-green-600 mx-auto mb-1" />
                                                                    <p className="text-xs text-green-700 font-semibold">
                                                                        {schedule.workHours}h
                                                                    </p>
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <XCircle className="h-5 w-5 text-gray-400 mx-auto mb-1" />
                                                                    <p className="text-xs text-gray-500">Off</p>
                                                                </>
                                                            )}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>

                                        {/* Additional Details */}
                                        {schedule.notes && (
                                            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                                                <p className="text-sm font-medium text-yellow-800 mb-1">Schedule Notes:</p>
                                                <p className="text-sm text-yellow-700">{schedule.notes}</p>
                                            </div>
                                        )}

                                        {/* Period */}
                                        <div className="text-sm text-muted-foreground">
                                            <p>
                                                <strong>Effective Period:</strong>{' '}
                                                {new Date(schedule.startDate).toLocaleDateString()}
                                                {schedule.endDate && ` - ${new Date(schedule.endDate).toLocaleDateString()}`}
                                            </p>
                                            {schedule.createdBy && (
                                                <p className="mt-1">
                                                    <strong>Assigned by:</strong> {schedule.createdBy}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-center py-12">
                                        <Calendar className="h-16 w-16 mx-auto text-muted-foreground mb-4 opacity-50" />
                                        <h3 className="text-lg font-semibold mb-2">No Schedule Assigned</h3>
                                        <p className="text-sm text-muted-foreground mb-1">
                                            Your work schedule hasn't been set up yet.
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            Please contact HR to get your schedule assigned.
                                        </p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="reports" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center space-x-2">
                                    <BarChart3 className="h-5 w-5" />
                                    <span>Time Reports</span>
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

                {/* Time Adjustment Request Dialog */}
                <Dialog open={showAdjustDialog} onOpenChange={setShowAdjustDialog}>
                    <DialogContent className="max-w-2xl">
                        <DialogHeader>
                            <DialogTitle>Request Time Adjustment</DialogTitle>
                            <DialogDescription>
                                Request a correction to your clock in/out times. HR will review your request.
                            </DialogDescription>
                        </DialogHeader>

                        {selectedEntry && (
                            <div className="space-y-4 py-4">
                                {/* Current Times */}
                                <div className="p-4 bg-blue-50 rounded-lg">
                                    <h4 className="font-semibold mb-2">Current Times</h4>
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                        <div>
                                            <Label className="text-muted-foreground">Clock In</Label>
                                            <p className="font-mono">{formatTime(new Date(selectedEntry.clockIn))}</p>
                                        </div>
                                        <div>
                                            <Label className="text-muted-foreground">Clock Out</Label>
                                            <p className="font-mono">
                                                {selectedEntry.clockOut ? formatTime(new Date(selectedEntry.clockOut)) : 'N/A'}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Requested Times */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label>Requested Clock In</Label>
                                        <Input
                                            type="time"
                                            value={adjustForm.requestedClockIn}
                                            onChange={(e) => setAdjustForm({ ...adjustForm, requestedClockIn: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <Label>Requested Clock Out</Label>
                                        <Input
                                            type="time"
                                            value={adjustForm.requestedClockOut}
                                            onChange={(e) => setAdjustForm({ ...adjustForm, requestedClockOut: e.target.value })}
                                        />
                                    </div>
                                </div>

                                {/* Reason */}
                                <div>
                                    <Label>Reason</Label>
                                    <Select
                                        value={adjustForm.reason}
                                        onValueChange={(value: any) => setAdjustForm({ ...adjustForm, reason: value })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="forgot_clock_in">Forgot to Clock In</SelectItem>
                                            <SelectItem value="forgot_clock_out">Forgot to Clock Out</SelectItem>
                                            <SelectItem value="system_error">System Error</SelectItem>
                                            <SelectItem value="wrong_time">Wrong Time Entry</SelectItem>
                                            <SelectItem value="other">Other</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Reason Text */}
                                <div>
                                    <Label>Explanation</Label>
                                    <Input
                                        placeholder="Brief explanation of why adjustment is needed"
                                        value={adjustForm.reasonText}
                                        onChange={(e) => setAdjustForm({ ...adjustForm, reasonText: e.target.value })}
                                    />
                                </div>

                                {/* Additional Notes */}
                                <div>
                                    <Label>Additional Notes (Optional)</Label>
                                    <Textarea
                                        placeholder="Any additional details..."
                                        value={adjustForm.notes}
                                        onChange={(e) => setAdjustForm({ ...adjustForm, notes: e.target.value })}
                                        rows={3}
                                    />
                                </div>
                            </div>
                        )}

                        <DialogFooter>
                            <Button variant="outline" onClick={() => setShowAdjustDialog(false)}>
                                Cancel
                            </Button>
                            <Button onClick={handleSubmitAdjustment} disabled={!adjustForm.reasonText}>
                                Submit Request
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    );
}

