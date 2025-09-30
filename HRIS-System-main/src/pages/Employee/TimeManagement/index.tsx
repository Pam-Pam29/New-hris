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
    WifiOff
} from 'lucide-react';
import { TimeEntry, GeoLocation, TimeAdjustment, Schedule } from '../types';

// Mock data - replace with actual API calls
const mockTimeEntries: TimeEntry[] = [
    {
        id: 'te-001',
        employeeId: 'emp-001',
        clockIn: new Date('2024-12-10T09:00:00'),
        clockOut: new Date('2024-12-10T17:30:00'),
        location: {
            latitude: 40.7128,
            longitude: -74.0060,
            address: '123 Main St, New York, NY 10001',
            accuracy: 5,
            timestamp: new Date('2024-12-10T09:00:00')
        },
        photos: ['/photos/clock-in-001.jpg'],
        breakTime: 60, // 1 hour
        notes: 'Regular work day',
        status: 'completed',
        createdAt: new Date('2024-12-10T09:00:00'),
        updatedAt: new Date('2024-12-10T17:30:00')
    },
    {
        id: 'te-002',
        employeeId: 'emp-001',
        clockIn: new Date('2024-12-09T08:45:00'),
        clockOut: new Date('2024-12-09T18:15:00'),
        location: {
            latitude: 40.7128,
            longitude: -74.0060,
            address: '123 Main St, New York, NY 10001',
            accuracy: 3,
            timestamp: new Date('2024-12-09T08:45:00')
        },
        photos: ['/photos/clock-in-002.jpg'],
        breakTime: 45,
        notes: 'Stayed late for project deadline',
        status: 'completed',
        createdAt: new Date('2024-12-09T08:45:00'),
        updatedAt: new Date('2024-12-09T18:15:00')
    },
    {
        id: 'te-003',
        employeeId: 'emp-001',
        clockIn: new Date('2024-12-11T09:15:00'),
        location: {
            latitude: 40.7128,
            longitude: -74.0060,
            address: '123 Main St, New York, NY 10001',
            accuracy: 4,
            timestamp: new Date('2024-12-11T09:15:00')
        },
        photos: ['/photos/clock-in-003.jpg'],
        breakTime: 0,
        notes: 'Currently working',
        status: 'active',
        createdAt: new Date('2024-12-11T09:15:00'),
        updatedAt: new Date('2024-12-11T09:15:00')
    }
];

const mockSchedule: Schedule = {
    id: 'schedule-001',
    employeeId: 'emp-001',
    startDate: new Date('2024-01-01'),
    endDate: new Date('2024-12-31'),
    shiftType: 'morning',
    workDays: [1, 2, 3, 4, 5], // Monday to Friday
    workHours: 8,
    breakDuration: 60,
    location: 'Office',
    isActive: true
};

export default function TimeManagement() {
    const [timeEntries, setTimeEntries] = useState<TimeEntry[]>(mockTimeEntries);
    const [schedule, setSchedule] = useState<Schedule>(mockSchedule);
    const [currentEntry, setCurrentEntry] = useState<TimeEntry | null>(null);
    const [loading, setLoading] = useState(false);
    const [location, setLocation] = useState<GeoLocation | null>(null);
    const [isOnline, setIsOnline] = useState(navigator.onLine);
    const [batteryLevel, setBatteryLevel] = useState<number | null>(null);

    useEffect(() => {
        // Get current active time entry
        const activeEntry = timeEntries.find(entry => entry.status === 'active');
        setCurrentEntry(activeEntry || null);

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
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, [timeEntries]);

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
        setLoading(true);
        try {
            const currentLocation = await getCurrentLocation();

            const newEntry: TimeEntry = {
                id: `te-${Date.now()}`,
                employeeId: 'emp-001',
                clockIn: new Date(),
                location: currentLocation,
                photos: [],
                breakTime: 0,
                notes: '',
                status: 'active',
                createdAt: new Date(),
                updatedAt: new Date()
            };

            setTimeEntries(prev => [newEntry, ...prev]);
            setCurrentEntry(newEntry);
        } catch (error) {
            console.error('Error getting location:', error);
            alert('Unable to get your location. Please enable location services.');
        } finally {
            setLoading(false);
        }
    };

    const handleClockOut = async () => {
        if (!currentEntry) return;

        setLoading(true);
        try {
            const currentLocation = await getCurrentLocation();

            const updatedEntry: TimeEntry = {
                ...currentEntry,
                clockOut: new Date(),
                location: currentLocation,
                status: 'completed',
                updatedAt: new Date()
            };

            setTimeEntries(prev =>
                prev.map(entry =>
                    entry.id === currentEntry.id ? updatedEntry : entry
                )
            );
            setCurrentEntry(null);
        } catch (error) {
            console.error('Error getting location:', error);
            alert('Unable to get your location. Please enable location services.');
        } finally {
            setLoading(false);
        }
    };

    const handleBreakStart = () => {
        if (!currentEntry) return;

        // Add break time logic here
        console.log('Break started');
    };

    const handleBreakEnd = () => {
        if (!currentEntry) return;

        // Add break time logic here
        console.log('Break ended');
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

                {/* Current Status */}
                {currentEntry && (
                    <Card className="border-green-200 bg-green-50">
                        <CardHeader>
                            <CardTitle className="flex items-center space-x-2 text-green-800">
                                <Play className="h-5 w-5" />
                                <span>Currently Working</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-lg font-semibold text-green-800">
                                        Clocked in at {formatTime(currentEntry.clockIn)}
                                    </p>
                                    <p className="text-sm text-green-600">
                                        {formatDate(currentEntry.clockIn)}
                                    </p>
                                    {currentEntry.location && (
                                        <p className="text-sm text-green-600 flex items-center mt-1">
                                            <MapPin className="h-3 w-3 mr-1" />
                                            {currentEntry.location.address}
                                        </p>
                                    )}
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Button variant="outline" size="sm" onClick={handleBreakStart}>
                                        <Coffee className="h-4 w-4 mr-2" />
                                        Break
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
                                </div>
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
                        {!currentEntry && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center space-x-2">
                                        <Clock className="h-5 w-5" />
                                        <span>Clock In/Out</span>
                                    </CardTitle>
                                    <CardDescription>
                                        Start or end your work day
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex items-center justify-center space-x-4">
                                        <Button
                                            size="lg"
                                            onClick={handleClockIn}
                                            disabled={loading}
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
                                                    <Button size="sm" variant="outline">
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
                                    <span>Work Schedule</span>
                                </CardTitle>
                                <CardDescription>
                                    Your current work schedule and availability
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-4">
                                            <div>
                                                <Label className="text-sm font-medium text-muted-foreground">Shift Type</Label>
                                                <p className="text-lg font-semibold capitalize">{schedule.shiftType}</p>
                                            </div>
                                            <div>
                                                <Label className="text-sm font-medium text-muted-foreground">Work Days</Label>
                                                <p className="text-lg font-semibold">
                                                    {schedule.workDays.map(day => {
                                                        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
                                                        return days[day];
                                                    }).join(', ')}
                                                </p>
                                            </div>
                                            <div>
                                                <Label className="text-sm font-medium text-muted-foreground">Work Hours</Label>
                                                <p className="text-lg font-semibold">{schedule.workHours} hours per day</p>
                                            </div>
                                        </div>
                                        <div className="space-y-4">
                                            <div>
                                                <Label className="text-sm font-medium text-muted-foreground">Break Duration</Label>
                                                <p className="text-lg font-semibold">{schedule.breakDuration} minutes</p>
                                            </div>
                                            <div>
                                                <Label className="text-sm font-medium text-muted-foreground">Location</Label>
                                                <p className="text-lg font-semibold">{schedule.location}</p>
                                            </div>
                                            <div>
                                                <Label className="text-sm font-medium text-muted-foreground">Status</Label>
                                                <Badge className={schedule.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                                                    {schedule.isActive ? 'Active' : 'Inactive'}
                                                </Badge>
                                            </div>
                                        </div>
                                    </div>
                                </div>
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
            </div>
        </div>
    );
}



