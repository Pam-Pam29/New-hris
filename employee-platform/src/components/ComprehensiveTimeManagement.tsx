import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Textarea } from './ui/textarea';
import { useToast } from '../hooks/use-toast';
import {
    Clock,
    MapPin,
    Camera,
    Play,
    Square,
    Pause,
    Calendar,
    BarChart3,
    AlertTriangle,
    CheckCircle,
    Edit,
    Eye,
    MoreHorizontal,
    Navigation,
    Timer,
    Coffee,
    TrendingUp,
    Users,
    FileText,
    Download
} from 'lucide-react';
import {
    getComprehensiveHRDataFlowService,
    TimeEntry
} from '../services/comprehensiveHRDataFlow';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from './ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from './ui/select';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from './ui/table';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from './ui/dropdown-menu';
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from './ui/tabs';

interface ComprehensiveTimeManagementProps {
    employeeId: string;
    mode: 'employee' | 'hr';
}

interface LocationData {
    latitude: number;
    longitude: number;
    address: string;
    accuracy: number;
}

export function ComprehensiveTimeManagement({ employeeId, mode }: ComprehensiveTimeManagementProps) {
    const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);
    const [currentEntry, setCurrentEntry] = useState<TimeEntry | null>(null);
    const [loading, setLoading] = useState(true);
    const [isClockingIn, setIsClockingIn] = useState(false);
    const [activeTab, setActiveTab] = useState<'overview' | 'timesheet' | 'adjustments' | 'analytics'>('overview');

    // Location and photo states
    const [currentLocation, setCurrentLocation] = useState<LocationData | null>(null);
    const [locationLoading, setLocationLoading] = useState(false);
    const [photoFile, setPhotoFile] = useState<File | null>(null);
    const [photoPreview, setPhotoPreview] = useState<string | null>(null);

    // Adjustment request state
    const [isAdjustmentDialogOpen, setIsAdjustmentDialogOpen] = useState(false);
    const [selectedTimeEntry, setSelectedTimeEntry] = useState<TimeEntry | null>(null);
    const [adjustmentForm, setAdjustmentForm] = useState({
        requestedTime: '',
        reason: '',
        explanation: ''
    });

    // Break tracking
    const [isOnBreak, setIsOnBreak] = useState(false);
    const [breakStartTime, setBreakStartTime] = useState<Date | null>(null);

    const { toast } = useToast();

    useEffect(() => {
        initializeTimeData();
        getCurrentLocation();
    }, [employeeId, mode]);

    const initializeTimeData = async () => {
        try {
            setLoading(true);
            const dataFlowService = await getComprehensiveHRDataFlowService();

            // Load time entries for the current month
            const startDate = new Date();
            startDate.setDate(1);
            const endDate = new Date();
            endDate.setMonth(endDate.getMonth() + 1);
            endDate.setDate(0);

            const entries = mode === 'hr'
                ? await dataFlowService.getTimeEntries('all', startDate, endDate)
                : await dataFlowService.getTimeEntries(employeeId, startDate, endDate);

            setTimeEntries(entries);

            // Check if there's an active entry (clocked in but not out)
            const activeEntry = entries.find(entry =>
                entry.employeeId === employeeId &&
                entry.clockInTime &&
                !entry.clockOutTime &&
                entry.status === 'active'
            );
            setCurrentEntry(activeEntry || null);

            setLoading(false);
        } catch (error) {
            console.error('Error initializing time data:', error);
            setLoading(false);
            toast({
                title: "Error",
                description: "Failed to load time tracking data",
                variant: "destructive"
            });
        }
    };

    const getCurrentLocation = async () => {
        if (!navigator.geolocation) {
            toast({
                title: "Location Not Supported",
                description: "Your browser doesn't support location services",
                variant: "destructive"
            });
            return;
        }

        setLocationLoading(true);

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude, accuracy } = position.coords;

                try {
                    // In a real app, you'd use a geocoding service to get the address
                    const address = `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;

                    setCurrentLocation({
                        latitude,
                        longitude,
                        address,
                        accuracy
                    });
                } catch (error) {
                    console.error('Error getting address:', error);
                    setCurrentLocation({
                        latitude,
                        longitude,
                        address: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
                        accuracy
                    });
                }
                setLocationLoading(false);
            },
            (error) => {
                console.error('Error getting location:', error);
                setLocationLoading(false);
                toast({
                    title: "Location Error",
                    description: "Unable to get your current location",
                    variant: "destructive"
                });
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 300000 // 5 minutes
            }
        );
    };

    const handlePhotoCapture = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setPhotoFile(file);
            const reader = new FileReader();
            reader.onload = (e) => {
                setPhotoPreview(e.target?.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleClockIn = async () => {
        try {
            if (!currentLocation) {
                toast({
                    title: "Location Required",
                    description: "Please allow location access to clock in",
                    variant: "destructive"
                });
                return;
            }

            setIsClockingIn(true);
            const dataFlowService = await getComprehensiveHRDataFlowService();

            const photoUrl = photoFile ? URL.createObjectURL(photoFile) : undefined;

            const newEntry = await dataFlowService.clockIn(employeeId, currentLocation, photoUrl);
            setCurrentEntry(newEntry);

            toast({
                title: "Clocked In Successfully",
                description: `Clocked in at ${new Date().toLocaleTimeString()}`,
            });

            // Reset photo
            setPhotoFile(null);
            setPhotoPreview(null);

            // Refresh data
            initializeTimeData();
        } catch (error) {
            console.error('Error clocking in:', error);
            toast({
                title: "Clock In Failed",
                description: "Failed to clock in. Please try again.",
                variant: "destructive"
            });
        } finally {
            setIsClockingIn(false);
        }
    };

    const handleClockOut = async () => {
        try {
            if (!currentLocation) {
                toast({
                    title: "Location Required",
                    description: "Please allow location access to clock out",
                    variant: "destructive"
                });
                return;
            }

            setIsClockingIn(true);
            const dataFlowService = await getComprehensiveHRDataFlowService();

            const photoUrl = photoFile ? URL.createObjectURL(photoFile) : undefined;

            await dataFlowService.clockOut(employeeId, currentLocation, photoUrl);
            setCurrentEntry(null);

            toast({
                title: "Clocked Out Successfully",
                description: `Clocked out at ${new Date().toLocaleTimeString()}`,
            });

            // Reset photo
            setPhotoFile(null);
            setPhotoPreview(null);

            // Refresh data
            initializeTimeData();
        } catch (error) {
            console.error('Error clocking out:', error);
            toast({
                title: "Clock Out Failed",
                description: "Failed to clock out. Please try again.",
                variant: "destructive"
            });
        } finally {
            setIsClockingIn(false);
        }
    };

    const handleStartBreak = () => {
        setIsOnBreak(true);
        setBreakStartTime(new Date());
        toast({
            title: "Break Started",
            description: "Your break time is now being tracked",
        });
    };

    const handleEndBreak = () => {
        if (breakStartTime) {
            const breakDuration = (new Date().getTime() - breakStartTime.getTime()) / (1000 * 60); // minutes
            setIsOnBreak(false);
            setBreakStartTime(null);
            toast({
                title: "Break Ended",
                description: `Break duration: ${Math.round(breakDuration)} minutes`,
            });
        }
    };

    const handleRequestAdjustment = async () => {
        try {
            if (!selectedTimeEntry || !adjustmentForm.requestedTime || !adjustmentForm.reason) {
                toast({
                    title: "Validation Error",
                    description: "Please fill in all required fields",
                    variant: "destructive"
                });
                return;
            }

            const dataFlowService = await getComprehensiveHRDataFlowService();

            const adjustmentData = {
                requestedTime: new Date(adjustmentForm.requestedTime),
                reason: adjustmentForm.reason,
                explanation: adjustmentForm.explanation,
                status: 'pending' as const,
                requestedAt: new Date()
            };

            await dataFlowService.requestTimeAdjustment(selectedTimeEntry.id, adjustmentData);

            toast({
                title: "Adjustment Requested",
                description: "Your time adjustment request has been submitted for approval",
            });

            setIsAdjustmentDialogOpen(false);
            setSelectedTimeEntry(null);
            resetAdjustmentForm();
            initializeTimeData();
        } catch (error) {
            console.error('Error requesting time adjustment:', error);
            toast({
                title: "Request Failed",
                description: "Failed to submit time adjustment request",
                variant: "destructive"
            });
        }
    };

    const resetAdjustmentForm = () => {
        setAdjustmentForm({
            requestedTime: '',
            reason: '',
            explanation: ''
        });
    };

    const formatDuration = (minutes: number) => {
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return `${hours}h ${mins}m`;
    };

    const calculateTotalHours = (entries: TimeEntry[]) => {
        return entries.reduce((total, entry) => total + entry.totalHours, 0);
    };

    const getStatusBadge = (status: TimeEntry['status']) => {
        switch (status) {
            case 'active':
                return <Badge className="bg-green-100 text-green-800 animate-pulse">Active</Badge>;
            case 'completed':
                return <Badge className="bg-blue-100 text-blue-800">Completed</Badge>;
            case 'pending_adjustment':
                return <Badge className="bg-yellow-100 text-yellow-800">Pending Adjustment</Badge>;
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };

    const getCurrentShift = () => {
        if (!currentEntry || !currentEntry.clockInTime) return null;

        const now = new Date();
        const clockInTime = new Date(currentEntry.clockInTime);
        const duration = (now.getTime() - clockInTime.getTime()) / (1000 * 60 * 60); // hours

        return {
            clockInTime,
            duration,
            location: currentEntry.location
        };
    };

    if (loading) {
        return (
            <div className="space-y-6">
                <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Loading time tracking data...</p>
                </div>
            </div>
        );
    }

    const currentShift = getCurrentShift();
    const todayEntries = timeEntries.filter(entry =>
        new Date(entry.date).toDateString() === new Date().toDateString()
    );
    const weekEntries = timeEntries.filter(entry => {
        const entryDate = new Date(entry.date);
        const weekStart = new Date();
        weekStart.setDate(weekStart.getDate() - weekStart.getDay());
        return entryDate >= weekStart;
    });

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold">Time Management</h2>
                    <p className="text-muted-foreground">
                        {mode === 'employee'
                            ? 'Track your work hours with GPS and photo verification'
                            : 'Monitor employee time tracking and approve adjustments'
                        }
                    </p>
                </div>
                <div className="flex space-x-2">
                    <Button variant="outline" onClick={getCurrentLocation} disabled={locationLoading}>
                        <Navigation className="h-4 w-4 mr-2" />
                        {locationLoading ? 'Getting Location...' : 'Refresh Location'}
                    </Button>
                    <Button variant="outline">
                        <Download className="h-4 w-4 mr-2" />
                        Export Timesheet
                    </Button>
                </div>
            </div>

            {/* Clock In/Out Section (Employee Only) */}
            {mode === 'employee' && (
                <Card className="border-2 border-primary/20">
                    <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                            <Clock className="h-6 w-6" />
                            <span>Time Clock</span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {/* Current Status */}
                        <div className="text-center">
                            <div className="text-4xl font-bold mb-2">
                                {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                            <div className="text-lg text-muted-foreground">
                                {new Date().toLocaleDateString([], {
                                    weekday: 'long',
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                })}
                            </div>
                        </div>

                        {/* Current Shift Info */}
                        {currentShift && (
                            <Card className="bg-green-50 border-green-200">
                                <CardContent className="p-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="font-semibold text-green-800">Currently Clocked In</p>
                                            <p className="text-sm text-green-600">
                                                Since {currentShift.clockInTime.toLocaleTimeString()} •
                                                {formatDuration(Math.round(currentShift.duration * 60))}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-2xl font-bold text-green-800">
                                                {formatDuration(Math.round(currentShift.duration * 60))}
                                            </div>
                                            <p className="text-xs text-green-600">Hours worked</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Location Status */}
                        <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                            <div className="flex items-center space-x-2">
                                <MapPin className="h-4 w-4 text-muted-foreground" />
                                <div>
                                    <p className="text-sm font-medium">Current Location</p>
                                    <p className="text-xs text-muted-foreground">
                                        {currentLocation ? currentLocation.address : 'Location not available'}
                                    </p>
                                </div>
                            </div>
                            {currentLocation && (
                                <Badge variant="outline" className="text-xs">
                                    ±{Math.round(currentLocation.accuracy)}m
                                </Badge>
                            )}
                        </div>

                        {/* Photo Capture */}
                        <div className="space-y-3">
                            <Label htmlFor="photo-capture">Verification Photo (Optional)</Label>
                            <div className="flex items-center space-x-4">
                                <input
                                    id="photo-capture"
                                    type="file"
                                    accept="image/*"
                                    capture="user"
                                    onChange={handlePhotoCapture}
                                    className="hidden"
                                />
                                <Button
                                    variant="outline"
                                    onClick={() => document.getElementById('photo-capture')?.click()}
                                    className="flex items-center space-x-2"
                                >
                                    <Camera className="h-4 w-4" />
                                    <span>Take Photo</span>
                                </Button>
                                {photoPreview && (
                                    <div className="relative">
                                        <img
                                            src={photoPreview}
                                            alt="Verification"
                                            className="w-16 h-16 object-cover rounded-lg border"
                                        />
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => {
                                                setPhotoFile(null);
                                                setPhotoPreview(null);
                                            }}
                                            className="absolute -top-2 -right-2 h-6 w-6 p-0 bg-red-500 text-white rounded-full"
                                        >
                                            ×
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Clock In/Out Buttons */}
                        <div className="flex space-x-4">
                            {!currentEntry ? (
                                <Button
                                    onClick={handleClockIn}
                                    disabled={isClockingIn || !currentLocation}
                                    className="flex-1 h-12 text-lg"
                                >
                                    <Play className="h-5 w-5 mr-2" />
                                    {isClockingIn ? 'Clocking In...' : 'Clock In'}
                                </Button>
                            ) : (
                                <>
                                    <Button
                                        onClick={handleClockOut}
                                        disabled={isClockingIn || !currentLocation}
                                        variant="destructive"
                                        className="flex-1 h-12 text-lg"
                                    >
                                        <Square className="h-5 w-5 mr-2" />
                                        {isClockingIn ? 'Clocking Out...' : 'Clock Out'}
                                    </Button>

                                    {!isOnBreak ? (
                                        <Button
                                            onClick={handleStartBreak}
                                            variant="outline"
                                            className="h-12"
                                        >
                                            <Coffee className="h-5 w-5 mr-2" />
                                            Start Break
                                        </Button>
                                    ) : (
                                        <Button
                                            onClick={handleEndBreak}
                                            variant="outline"
                                            className="h-12 bg-yellow-50 border-yellow-300"
                                        >
                                            <Pause className="h-5 w-5 mr-2" />
                                            End Break
                                        </Button>
                                    )}
                                </>
                            )}
                        </div>

                        {/* Break Status */}
                        {isOnBreak && breakStartTime && (
                            <Card className="bg-yellow-50 border-yellow-200">
                                <CardContent className="p-3">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-2">
                                            <Coffee className="h-4 w-4 text-yellow-600" />
                                            <span className="text-sm font-medium text-yellow-800">On Break</span>
                                        </div>
                                        <div className="text-sm text-yellow-600">
                                            Started at {breakStartTime.toLocaleTimeString()}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </CardContent>
                </Card>
            )}

            {/* Navigation Tabs */}
            <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
                <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="timesheet">Timesheet</TabsTrigger>
                    <TabsTrigger value="adjustments">Adjustments</TabsTrigger>
                    {mode === 'hr' && <TabsTrigger value="analytics">Analytics</TabsTrigger>}
                </TabsList>

                {/* Overview Tab */}
                <TabsContent value="overview" className="space-y-6">
                    {/* Statistics Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <Card>
                            <CardContent className="p-6">
                                <div className="flex items-center space-x-4">
                                    <div className="p-3 bg-blue-100 rounded-lg">
                                        <Clock className="h-6 w-6 text-blue-600" />
                                    </div>
                                    <div>
                                        <p className="text-2xl font-bold">
                                            {formatDuration(Math.round(calculateTotalHours(todayEntries) * 60))}
                                        </p>
                                        <p className="text-sm text-muted-foreground">Today</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="p-6">
                                <div className="flex items-center space-x-4">
                                    <div className="p-3 bg-green-100 rounded-lg">
                                        <Calendar className="h-6 w-6 text-green-600" />
                                    </div>
                                    <div>
                                        <p className="text-2xl font-bold">
                                            {formatDuration(Math.round(calculateTotalHours(weekEntries) * 60))}
                                        </p>
                                        <p className="text-sm text-muted-foreground">This Week</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="p-6">
                                <div className="flex items-center space-x-4">
                                    <div className="p-3 bg-yellow-100 rounded-lg">
                                        <Timer className="h-6 w-6 text-yellow-600" />
                                    </div>
                                    <div>
                                        <p className="text-2xl font-bold">
                                            {timeEntries.filter(e => e.overtimeHours > 0).length}
                                        </p>
                                        <p className="text-sm text-muted-foreground">Overtime Days</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="p-6">
                                <div className="flex items-center space-x-4">
                                    <div className="p-3 bg-purple-100 rounded-lg">
                                        <TrendingUp className="h-6 w-6 text-purple-600" />
                                    </div>
                                    <div>
                                        <p className="text-2xl font-bold">
                                            {Math.round((calculateTotalHours(timeEntries) / timeEntries.length) * 60) || 0}m
                                        </p>
                                        <p className="text-sm text-muted-foreground">Avg/Day</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Recent Time Entries */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center space-x-2">
                                <FileText className="h-5 w-5" />
                                <span>Recent Time Entries</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {timeEntries.slice(0, 7).map((entry) => (
                                    <div key={entry.id} className="flex items-center justify-between p-3 border rounded-lg">
                                        <div className="flex items-center space-x-3">
                                            <div className="flex flex-col items-center">
                                                <div className="text-sm font-medium">
                                                    {new Date(entry.date).toLocaleDateString([], {
                                                        month: 'short',
                                                        day: 'numeric'
                                                    })}
                                                </div>
                                                <div className="text-xs text-muted-foreground">
                                                    {new Date(entry.date).toLocaleDateString([], { weekday: 'short' })}
                                                </div>
                                            </div>
                                            <div>
                                                <p className="font-medium">
                                                    {formatDuration(Math.round(entry.totalHours * 60))}
                                                </p>
                                                <p className="text-sm text-muted-foreground">
                                                    {entry.clockInTime && new Date(entry.clockInTime).toLocaleTimeString([], {
                                                        hour: '2-digit',
                                                        minute: '2-digit'
                                                    })} - {entry.clockOutTime && new Date(entry.clockOutTime).toLocaleTimeString([], {
                                                        hour: '2-digit',
                                                        minute: '2-digit'
                                                    })}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            {entry.overtimeHours > 0 && (
                                                <Badge variant="outline" className="text-xs">
                                                    +{formatDuration(Math.round(entry.overtimeHours * 60))} OT
                                                </Badge>
                                            )}
                                            {getStatusBadge(entry.status)}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Timesheet Tab */}
                <TabsContent value="timesheet" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle>Timesheet</CardTitle>
                                <div className="flex items-center space-x-2">
                                    <Select defaultValue="current-month">
                                        <SelectTrigger className="w-40">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="current-month">Current Month</SelectItem>
                                            <SelectItem value="last-month">Last Month</SelectItem>
                                            <SelectItem value="current-week">Current Week</SelectItem>
                                            <SelectItem value="last-week">Last Week</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="p-0">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Date</TableHead>
                                        {mode === 'hr' && <TableHead>Employee</TableHead>}
                                        <TableHead>Clock In</TableHead>
                                        <TableHead>Clock Out</TableHead>
                                        <TableHead>Total Hours</TableHead>
                                        <TableHead>Break Time</TableHead>
                                        <TableHead>Overtime</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {timeEntries.map((entry) => (
                                        <TableRow key={entry.id}>
                                            <TableCell>
                                                <div>
                                                    <p className="font-medium">
                                                        {new Date(entry.date).toLocaleDateString()}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {new Date(entry.date).toLocaleDateString([], { weekday: 'long' })}
                                                    </p>
                                                </div>
                                            </TableCell>
                                            {mode === 'hr' && (
                                                <TableCell>
                                                    <div>
                                                        <p className="font-medium">{entry.employeeName}</p>
                                                        <p className="text-xs text-muted-foreground">{entry.employeeId}</p>
                                                    </div>
                                                </TableCell>
                                            )}
                                            <TableCell>
                                                <div className="flex items-center space-x-2">
                                                    <span>
                                                        {entry.clockInTime ?
                                                            new Date(entry.clockInTime).toLocaleTimeString([], {
                                                                hour: '2-digit',
                                                                minute: '2-digit'
                                                            }) : '-'
                                                        }
                                                    </span>
                                                    {entry.photos.some(p => p.type === 'clock_in') && (
                                                        <Camera className="h-3 w-3 text-green-500" />
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center space-x-2">
                                                    <span>
                                                        {entry.clockOutTime ?
                                                            new Date(entry.clockOutTime).toLocaleTimeString([], {
                                                                hour: '2-digit',
                                                                minute: '2-digit'
                                                            }) : '-'
                                                        }
                                                    </span>
                                                    {entry.photos.some(p => p.type === 'clock_out') && (
                                                        <Camera className="h-3 w-3 text-red-500" />
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell className="font-medium">
                                                {formatDuration(Math.round(entry.totalHours * 60))}
                                            </TableCell>
                                            <TableCell>
                                                {formatDuration(entry.breakTime)}
                                            </TableCell>
                                            <TableCell>
                                                {entry.overtimeHours > 0 ? (
                                                    <Badge variant="outline" className="text-orange-600">
                                                        {formatDuration(Math.round(entry.overtimeHours * 60))}
                                                    </Badge>
                                                ) : (
                                                    <span className="text-muted-foreground">-</span>
                                                )}
                                            </TableCell>
                                            <TableCell>{getStatusBadge(entry.status)}</TableCell>
                                            <TableCell>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="sm">
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem>
                                                            <Eye className="h-4 w-4 mr-2" />
                                                            View Details
                                                        </DropdownMenuItem>
                                                        {mode === 'employee' && entry.status === 'completed' && (
                                                            <DropdownMenuItem
                                                                onClick={() => {
                                                                    setSelectedTimeEntry(entry);
                                                                    setIsAdjustmentDialogOpen(true);
                                                                }}
                                                            >
                                                                <Edit className="h-4 w-4 mr-2" />
                                                                Request Adjustment
                                                            </DropdownMenuItem>
                                                        )}
                                                        {entry.location && (
                                                            <DropdownMenuItem>
                                                                <MapPin className="h-4 w-4 mr-2" />
                                                                View Location
                                                            </DropdownMenuItem>
                                                        )}
                                                        {entry.photos.length > 0 && (
                                                            <DropdownMenuItem>
                                                                <Camera className="h-4 w-4 mr-2" />
                                                                View Photos
                                                            </DropdownMenuItem>
                                                        )}
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Adjustments Tab */}
                <TabsContent value="adjustments" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Time Adjustment Requests</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {timeEntries
                                    .filter(entry => entry.adjustmentRequests && entry.adjustmentRequests.length > 0)
                                    .map((entry) => (
                                        <Card key={entry.id} className="p-4">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="font-medium">
                                                        {new Date(entry.date).toLocaleDateString()} - {entry.employeeName}
                                                    </p>
                                                    <p className="text-sm text-muted-foreground">
                                                        Original: {entry.clockInTime && new Date(entry.clockInTime).toLocaleTimeString()} -
                                                        {entry.clockOutTime && new Date(entry.clockOutTime).toLocaleTimeString()}
                                                    </p>
                                                    {entry.adjustmentRequests?.map((adj, index) => (
                                                        <div key={index} className="mt-2 p-2 bg-muted rounded">
                                                            <p className="text-sm">
                                                                <strong>Requested:</strong> {new Date(adj.requestedTime).toLocaleTimeString()}
                                                            </p>
                                                            <p className="text-sm">
                                                                <strong>Reason:</strong> {adj.reason}
                                                            </p>
                                                            <p className="text-xs text-muted-foreground">
                                                                Requested on {new Date(adj.requestedAt).toLocaleDateString()}
                                                            </p>
                                                        </div>
                                                    ))}
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <Badge className="bg-yellow-100 text-yellow-800">
                                                        Pending Review
                                                    </Badge>
                                                    {mode === 'hr' && (
                                                        <div className="flex space-x-1">
                                                            <Button size="sm" variant="outline">
                                                                <CheckCircle className="h-4 w-4 mr-1" />
                                                                Approve
                                                            </Button>
                                                            <Button size="sm" variant="outline">
                                                                <XCircle className="h-4 w-4 mr-1" />
                                                                Reject
                                                            </Button>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </Card>
                                    ))}

                                {timeEntries.filter(entry => entry.adjustmentRequests && entry.adjustmentRequests.length > 0).length === 0 && (
                                    <div className="text-center py-8">
                                        <CheckCircle className="h-12 w-12 mx-auto text-green-500 mb-4" />
                                        <h3 className="text-lg font-semibold mb-2">No Adjustment Requests</h3>
                                        <p className="text-muted-foreground">
                                            {mode === 'employee'
                                                ? "You haven't submitted any time adjustment requests."
                                                : "There are no pending time adjustment requests to review."
                                            }
                                        </p>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            {/* Time Adjustment Dialog */}
            <Dialog open={isAdjustmentDialogOpen} onOpenChange={setIsAdjustmentDialogOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Request Time Adjustment</DialogTitle>
                        <DialogDescription>
                            Submit a request to adjust your recorded time entry
                        </DialogDescription>
                    </DialogHeader>
                    {selectedTimeEntry && (
                        <div className="space-y-4">
                            <Card className="bg-muted/50">
                                <CardContent className="p-4">
                                    <h4 className="font-semibold mb-2">Original Time Entry</h4>
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                        <div>
                                            <p><strong>Date:</strong> {new Date(selectedTimeEntry.date).toLocaleDateString()}</p>
                                            <p><strong>Clock In:</strong> {selectedTimeEntry.clockInTime && new Date(selectedTimeEntry.clockInTime).toLocaleTimeString()}</p>
                                        </div>
                                        <div>
                                            <p><strong>Total Hours:</strong> {formatDuration(Math.round(selectedTimeEntry.totalHours * 60))}</p>
                                            <p><strong>Clock Out:</strong> {selectedTimeEntry.clockOutTime && new Date(selectedTimeEntry.clockOutTime).toLocaleTimeString()}</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <div className="space-y-4">
                                <div>
                                    <Label htmlFor="requestedTime">Requested Time</Label>
                                    <Input
                                        id="requestedTime"
                                        type="datetime-local"
                                        value={adjustmentForm.requestedTime}
                                        onChange={(e) => setAdjustmentForm(prev => ({ ...prev, requestedTime: e.target.value }))}
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="reason">Reason for Adjustment</Label>
                                    <Select
                                        value={adjustmentForm.reason}
                                        onValueChange={(value) => setAdjustmentForm(prev => ({ ...prev, reason: value }))}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select a reason" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="forgot_clock_in">Forgot to clock in</SelectItem>
                                            <SelectItem value="forgot_clock_out">Forgot to clock out</SelectItem>
                                            <SelectItem value="system_error">System error</SelectItem>
                                            <SelectItem value="incorrect_time">Incorrect time recorded</SelectItem>
                                            <SelectItem value="other">Other</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div>
                                    <Label htmlFor="explanation">Detailed Explanation</Label>
                                    <Textarea
                                        id="explanation"
                                        value={adjustmentForm.explanation}
                                        onChange={(e) => setAdjustmentForm(prev => ({ ...prev, explanation: e.target.value }))}
                                        placeholder="Please provide additional details about why this adjustment is needed..."
                                        rows={4}
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end space-x-2">
                                <Button variant="outline" onClick={() => setIsAdjustmentDialogOpen(false)}>
                                    Cancel
                                </Button>
                                <Button onClick={handleRequestAdjustment}>
                                    Submit Request
                                </Button>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}

export default ComprehensiveTimeManagement;

