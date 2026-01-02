import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Textarea } from '../../../components/ui/textarea';
import { Badge } from '../../../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select';
import { useCompany } from '../../../context/CompanyContext';
import { useAuth } from '../../../context/AuthContext';
import {
    Calendar,
    Clock,
    Video,
    CheckCircle,
    Loader,
    User,
    MapPin,
    Plus,
    XCircle
} from 'lucide-react';
import { hrAvailabilityService, AvailabilitySlot } from '../../../services/hrAvailabilityService';
import { performanceSyncService } from '../../../services/performanceSyncService';
import { usePerformanceMeetings } from '../../../hooks/useRealTimeSync';
import { PerformanceMeeting, normalizeMeetingStatus, getMeetingStatusInfo, formatMeetingDate } from '../../../types/performanceManagement';
import { googleMeetService } from '../../../services/googleMeetService';
import { meetingNotificationService } from '../../../services/meetingNotificationService';

const DAYS_OF_WEEK = [
    { value: 0, label: 'Sunday' },
    { value: 1, label: 'Monday' },
    { value: 2, label: 'Tuesday' },
    { value: 3, label: 'Wednesday' },
    { value: 4, label: 'Thursday' },
    { value: 5, label: 'Friday' },
    { value: 6, label: 'Saturday' },
];

export default function BookMeeting() {
    const { companyId } = useCompany();
    const { currentEmployee } = useAuth();

    const [employeeId] = useState(() => {
        return currentEmployee?.employeeId || localStorage.getItem('currentEmployeeId') || 'EMP123456ABC';
    });
    const [employeeName, setEmployeeName] = useState<string>(currentEmployee?.firstName + ' ' + currentEmployee?.lastName || '');
    const [availabilitySlots, setAvailabilitySlots] = useState<AvailabilitySlot[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [selectedSlot, setSelectedSlot] = useState<AvailabilitySlot | null>(null);
    const [showBookingForm, setShowBookingForm] = useState(false);
    const [showManualForm, setShowManualForm] = useState(false);
    const [success, setSuccess] = useState(false);
    const [availableTimeSlots, setAvailableTimeSlots] = useState<{ startTime: string; endTime: string; }[]>([]);
    const [loadingSlots, setLoadingSlots] = useState(false);
    const [hrBookingPageUrl, setHrBookingPageUrl] = useState<string>('');

    // Load meetings
    const { data: allMeetings, loading: meetingsLoading } = usePerformanceMeetings(employeeId, companyId);
    const meetings = ((allMeetings as PerformanceMeeting[]) || []).filter(
        meeting => meeting.employeeId === employeeId
    );

    // Booking form (for slot-based booking)
    const [bookingForm, setBookingForm] = useState({
        date: '',
        startTime: '',
        endTime: '',
        title: '',
        description: '',
        meetingType: 'one-on-one' as const,
        duration: 60,
        location: 'Online'
    });

    // Manual meeting form
    const [manualForm, setManualForm] = useState({
        title: '',
        description: '',
        meetingType: 'one-on-one' as const,
        scheduledDate: '',
        scheduledTime: '',
        duration: 30,
        location: '',
        meetingLink: ''
    });

    useEffect(() => {
        loadEmployeeName();
        loadAvailability();
        loadHrBookingPage();
        
        // Start meeting notification checker
        meetingNotificationService.requestNotificationPermission();
        meetingNotificationService.startMeetingChecker(employeeId, (meeting) => {
            console.log('⏰ Meeting starting soon:', meeting);
        });

        return () => {
            meetingNotificationService.stopMeetingChecker();
        };
    }, [employeeId]);

    // Load available time slots when date changes in manual form
    useEffect(() => {
        const loadAvailableSlots = async () => {
            if (!manualForm.scheduledDate) {
                setAvailableTimeSlots([]);
                return;
            }

            setLoadingSlots(true);
            try {
                const selectedDate = new Date(manualForm.scheduledDate);
                const slots = await hrAvailabilityService.getAvailableTimeSlotsForDate(selectedDate);
                setAvailableTimeSlots(slots);
            } catch (error) {
                console.error('Failed to load available slots:', error);
                setAvailableTimeSlots([]);
            } finally {
                setLoadingSlots(false);
            }
        };

        loadAvailableSlots();
    }, [manualForm.scheduledDate]);

    const loadEmployeeName = async () => {
        try {
            const { getComprehensiveDataFlowService } = await import('../../../services/comprehensiveDataFlowService');
            const dataFlowService = await getComprehensiveDataFlowService();
            const profile = await dataFlowService.getEmployeeProfile(employeeId);
            if (profile) {
                const fullName = `${profile.personalInfo.firstName} ${profile.personalInfo.lastName}`;
                setEmployeeName(fullName);
            }
        } catch (error) {
            console.error('Failed to load employee name:', error);
            setEmployeeName('Employee');
        }
    };

    const loadHrBookingPage = async () => {
        if (!companyId) {
            setHrBookingPageUrl('');
            return;
        }
        try {
            const { db } = await import('../../../config/firebase');
            const { doc, getDoc, collection, getDocs, query, limit } = await import('firebase/firestore');

            let bookingUrl = '';
            const settingsRef = doc(db, 'hrSettings', companyId);
            const settingsSnapshot = await getDoc(settingsRef);

            if (settingsSnapshot.exists()) {
                const settings = settingsSnapshot.data();
                bookingUrl = settings.bookingPageUrl || '';
            } else {
                const legacyQuery = query(collection(db, 'hrSettings'), limit(1));
                const legacySnapshot = await getDocs(legacyQuery);
                if (!legacySnapshot.empty) {
                    const legacySettings = legacySnapshot.docs[0].data();
                    bookingUrl = legacySettings.bookingPageUrl || '';
                }
            }

            if (bookingUrl) {
                setHrBookingPageUrl(bookingUrl);
            } else {
                setHrBookingPageUrl('');
            }
        } catch (error) {
            console.log('No HR booking page configured (this is optional)');
            setHrBookingPageUrl('');
        }
    };

    const loadAvailability = async () => {
        setLoading(true);
        try {
            const slots = await hrAvailabilityService.getAllAvailability();
            setAvailabilitySlots(slots);
        } catch (error) {
            console.error('Failed to load availability:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSlotClick = (slot: AvailabilitySlot) => {
        setSelectedSlot(slot);
        const now = new Date();
        const dayOfWeek = now.getDay();
        const daysUntilTarget = (slot.dayOfWeek - dayOfWeek + 7) % 7 || 7;
        const targetDate = new Date(now);
        targetDate.setDate(targetDate.getDate() + daysUntilTarget);

        setBookingForm({
            ...bookingForm,
            date: targetDate.toISOString().split('T')[0],
            startTime: slot.startTime,
            endTime: slot.endTime,
            duration: calculateDuration(slot.startTime, slot.endTime)
        });
        setShowBookingForm(true);
    };

    const calculateDuration = (start: string, end: string): number => {
        const [startHour, startMin] = start.split(':').map(Number);
        const [endHour, endMin] = end.split(':').map(Number);
        return (endHour * 60 + endMin) - (startHour * 60 + startMin);
    };

    const handleBookMeeting = async () => {
        if (!bookingForm.title || !bookingForm.date || !bookingForm.startTime) {
            alert('Please fill in all required fields');
            return;
        }

        setSubmitting(true);
        try {
            let meetingLink = '';
            try {
                meetingLink = await googleMeetService.createMeetingLink(
                    bookingForm.title,
                    bookingForm.description || '',
                    new Date(`${bookingForm.date}T${bookingForm.startTime}`),
                    bookingForm.duration
                );
            } catch (error) {
                console.warn('Google Meet service not available, using fallback link');
                meetingLink = `https://meet.google.com/${Math.random().toString(36).substring(7)}`;
            }

            const scheduledDateTime = new Date(`${bookingForm.date}T${bookingForm.startTime}`);

            if (!companyId) {
                alert('Company ID is required. Please refresh the page.');
                return;
            }

            await performanceSyncService.scheduleMeeting({
                companyId: companyId!,
                employeeId,
                employeeName: employeeName || 'Unknown Employee',
                title: bookingForm.title,
                description: bookingForm.description || '',
                meetingType: bookingForm.meetingType,
                scheduledDate: scheduledDateTime,
                duration: bookingForm.duration,
                location: bookingForm.location,
                meetingLink: meetingLink,
                hrManagerId: selectedSlot?.hrId || 'hr-001',
                hrManagerName: selectedSlot?.hrName || 'HR Manager',
                createdBy: 'employee'
            });

            console.log('✅ Meeting booked successfully');
            setSuccess(true);

            setTimeout(() => {
                setShowBookingForm(false);
                setSuccess(false);
                setBookingForm({
                    date: '',
                    startTime: '',
                    endTime: '',
                    title: '',
                    description: '',
                    meetingType: 'one-on-one',
                    duration: 60,
                    location: 'Online'
                });
            }, 2000);
        } catch (error) {
            console.error('❌ Failed to book meeting:', error);
            alert('Failed to book meeting. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    const handleManualMeeting = async () => {
        if (!manualForm.title || !manualForm.scheduledDate || !manualForm.scheduledTime) {
            alert('Please fill in all required fields');
            return;
        }

        if (!manualForm.meetingLink) {
            alert('Please provide a meeting link (Google Meet, Zoom, Teams, etc.)');
            return;
        }

        if (!companyId) {
            alert('Company ID is required. Please refresh the page.');
            return;
        }

        setSubmitting(true);
        try {
            const scheduledDateTime = new Date(`${manualForm.scheduledDate}T${manualForm.scheduledTime}`);

            await performanceSyncService.scheduleMeeting({
                companyId: companyId!,
                employeeId,
                employeeName: employeeName || 'Unknown Employee',
                title: manualForm.title,
                description: manualForm.description,
                meetingType: manualForm.meetingType,
                scheduledDate: scheduledDateTime,
                duration: manualForm.duration,
                location: manualForm.location,
                meetingLink: manualForm.meetingLink,
                createdBy: 'employee'
            });

            setShowManualForm(false);
            setManualForm({
                title: '',
                description: '',
                meetingType: 'one-on-one',
                scheduledDate: '',
                scheduledTime: '',
                duration: 30,
                location: '',
                meetingLink: ''
            });
            setSuccess(true);
            setTimeout(() => setSuccess(false), 3000);
        } catch (error) {
            console.error('Failed to schedule meeting:', error);
            alert('Failed to schedule meeting');
        } finally {
            setSubmitting(false);
        }
    };

    const handleCancelMeeting = async (meetingId: string) => {
        if (!confirm('Are you sure you want to cancel this meeting?')) return;
        try {
            await performanceSyncService.cancelMeeting(meetingId);
        } catch (error) {
            console.error('Failed to cancel meeting:', error);
            alert('Failed to cancel meeting');
        }
    };

    const getStatusBadge = (status: string) => {
        const statusInfo = getMeetingStatusInfo(status);
        return (
            <Badge className={`${statusInfo.bgColor} ${statusInfo.color} border-0`}>
                {statusInfo.text}
            </Badge>
        );
    };

    const getDayName = (dayNum: number) => {
        return DAYS_OF_WEEK.find(d => d.value === dayNum)?.label || 'Unknown';
    };

    // Group slots by day
    const slotsByDay = availabilitySlots.reduce((acc, slot) => {
        if (!acc[slot.dayOfWeek]) {
            acc[slot.dayOfWeek] = [];
        }
        acc[slot.dayOfWeek].push(slot);
        return acc;
    }, {} as Record<number, AvailabilitySlot[]>);

    const pendingMeetings = meetings.filter(m => normalizeMeetingStatus(m.status) === 'pending');
    const approvedMeetings = meetings.filter(m => normalizeMeetingStatus(m.status) === 'approved');

    if (loading && meetingsLoading) {
        return (
            <div className="p-6">
                <div className="max-w-7xl mx-auto">
                    <div className="flex items-center justify-center h-64">
                        <Loader className="h-8 w-8 animate-spin text-blue-600" />
                        <span className="ml-2">Loading...</span>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-foreground">Book Meeting with HR</h1>
                        <p className="text-muted-foreground mt-2">
                            Schedule meetings, view your bookings, and manage your appointments
                        </p>
                    </div>
                    <div className="flex gap-3">
                        {hrBookingPageUrl ? (
                            <Button
                                onClick={() => window.open(hrBookingPageUrl, '_blank', 'noopener')}
                                className="bg-green-600 hover:bg-green-700"
                            >
                                <Calendar className="h-4 w-4 mr-2" />
                                Book with HR
                            </Button>
                        ) : null}
                        <Button
                            variant="outline"
                            onClick={() => setShowManualForm(true)}
                            className="border-blue-300 text-blue-700 hover:bg-blue-50"
                        >
                            <Plus className="h-4 w-4 mr-2" />
                            Manual Request
                        </Button>
                    </div>
                </div>

                {/* Success Message */}
                {success && (
                    <Card className="border-green-200 bg-green-50">
                        <CardContent className="pt-6">
                            <div className="flex items-center gap-3">
                                <CheckCircle className="h-6 w-6 text-green-600" />
                                <div>
                                    <h3 className="font-semibold text-green-900">Meeting Booked Successfully!</h3>
                                    <p className="text-sm text-green-700">
                                        Your meeting has been scheduled. You'll receive a confirmation notification.
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Meeting Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card className={approvedMeetings.length > 0 ? 'border-l-4 border-l-purple-500' : ''}>
                        <CardContent className="pt-6">
                            <div className="flex flex-col">
                                <div className="flex items-center mb-2">
                                    <Calendar className="h-5 w-5 text-purple-600 mr-2" />
                                    <p className="text-2xl font-bold text-purple-600">{approvedMeetings.length}</p>
                                </div>
                                <p className="text-sm font-medium text-gray-700">
                                    Approved Meeting{approvedMeetings.length !== 1 ? 's' : ''}
                                </p>
                                <p className="text-xs text-muted-foreground mt-1">Upcoming</p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className={pendingMeetings.length > 0 ? 'border-l-4 border-l-yellow-500' : ''}>
                        <CardContent className="pt-6">
                            <div className="flex flex-col">
                                <div className="flex items-center mb-2">
                                    <Clock className="h-5 w-5 text-yellow-600 mr-2" />
                                    <p className="text-2xl font-bold text-yellow-600">{pendingMeetings.length}</p>
                                </div>
                                <p className="text-sm font-medium text-gray-700">
                                    Pending Meeting{pendingMeetings.length !== 1 ? 's' : ''}
                                </p>
                                <p className="text-xs text-muted-foreground mt-1">Awaiting approval</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <Tabs defaultValue="book" className="space-y-6">
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="book">Book Meeting</TabsTrigger>
                        <TabsTrigger value="meetings">My Meetings ({meetings.length})</TabsTrigger>
                        <TabsTrigger value="availability">HR Availability</TabsTrigger>
                    </TabsList>

                    {/* Book Meeting Tab */}
                    <TabsContent value="book" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>Quick Booking Options</CardTitle>
                                <CardDescription>
                                    Choose how you'd like to schedule your meeting
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {hrBookingPageUrl && (
                                    <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                                        <h3 className="font-semibold mb-2 flex items-center gap-2">
                                            <Calendar className="h-5 w-5 text-green-600" />
                                            HR Booking Page Available
                                        </h3>
                                        <p className="text-sm text-gray-700 mb-3">
                                            Use the HR booking page to schedule meetings with automatic Google Meet link generation.
                                        </p>
                                        <Button
                                            onClick={() => window.open(hrBookingPageUrl, '_blank', 'noopener')}
                                            className="bg-green-600 hover:bg-green-700"
                                        >
                                            <Calendar className="h-4 w-4 mr-2" />
                                            Open HR Booking Page
                                        </Button>
                                    </div>
                                )}
                                
                                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                                    <h3 className="font-semibold mb-2 flex items-center gap-2">
                                        <Plus className="h-5 w-5 text-blue-600" />
                                        Manual Meeting Request
                                    </h3>
                                    <p className="text-sm text-gray-700 mb-3">
                                        Request a meeting by providing all the details manually.
                                    </p>
                                    <Button
                                        variant="outline"
                                        onClick={() => setShowManualForm(true)}
                                        className="border-blue-300 text-blue-700 hover:bg-blue-50"
                                    >
                                        <Plus className="h-4 w-4 mr-2" />
                                        Create Manual Request
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* My Meetings Tab */}
                    <TabsContent value="meetings" className="space-y-4">
                        <Tabs defaultValue="upcoming" className="space-y-4">
                            <TabsList className="grid w-full grid-cols-3">
                                <TabsTrigger value="upcoming">Upcoming ({approvedMeetings.length})</TabsTrigger>
                                <TabsTrigger value="pending">Pending ({pendingMeetings.length})</TabsTrigger>
                                <TabsTrigger value="all">All ({meetings.length})</TabsTrigger>
                            </TabsList>

                            <TabsContent value="upcoming" className="space-y-4">
                                {approvedMeetings.length === 0 ? (
                                    <Card>
                                        <CardContent className="pt-12 pb-12">
                                            <div className="text-center">
                                                <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                                <h3 className="text-lg font-semibold mb-2">No Upcoming Meetings</h3>
                                                <p className="text-muted-foreground">Schedule a meeting with HR</p>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {approvedMeetings.map(meeting => (
                                            <Card key={meeting.id}>
                                                <CardHeader>
                                                    <div className="flex items-center justify-between">
                                                        <CardTitle className="text-lg">{meeting.title}</CardTitle>
                                                        {getStatusBadge(meeting.status)}
                                                    </div>
                                                    <CardDescription>{meeting.description}</CardDescription>
                                                </CardHeader>
                                                <CardContent className="space-y-2">
                                                    <div className="flex items-center text-sm text-muted-foreground">
                                                        <Calendar className="h-4 w-4 mr-2" />
                                                        {formatMeetingDate(meeting.scheduledDate)}
                                                    </div>
                                                    <div className="flex items-center text-sm text-muted-foreground">
                                                        <Clock className="h-4 w-4 mr-2" />
                                                        {meeting.duration} minutes
                                                    </div>
                                                    {meeting.location && (
                                                        <div className="flex items-center text-sm text-muted-foreground">
                                                            <MapPin className="h-4 w-4 mr-2" />
                                                            {meeting.location}
                                                        </div>
                                                    )}
                                                    {meeting.meetingLink && (() => {
                                                        const meetingDate = meeting.scheduledDate instanceof Date
                                                            ? meeting.scheduledDate
                                                            : (meeting.scheduledDate as any).toDate
                                                                ? (meeting.scheduledDate as any).toDate()
                                                                : new Date(meeting.scheduledDate);
                                                        const now = new Date();
                                                        const fifteenMinutesBefore = new Date(meetingDate.getTime() - 15 * 60000);
                                                        const meetingEndTime = new Date(meetingDate.getTime() + (meeting.duration || 60) * 60000);

                                                        const canJoin = now >= fifteenMinutesBefore && now <= meetingEndTime;
                                                        const meetingEnded = now > meetingEndTime;

                                                        if (meetingEnded) {
                                                            return (
                                                                <div className="mt-2 p-3 bg-red-50 rounded-lg text-center border border-red-200">
                                                                    <p className="text-xs text-red-600 font-medium">
                                                                        ⏰ Meeting ended
                                                                    </p>
                                                                </div>
                                                            );
                                                        } else if (canJoin) {
                                                            return (
                                                                <a href={meeting.meetingLink} target="_blank" rel="noopener noreferrer" className="block">
                                                                    <Button size="sm" variant="outline" className="w-full mt-2">
                                                                        <Video className="h-4 w-4 mr-2" />
                                                                        Join Meeting
                                                                    </Button>
                                                                </a>
                                                            );
                                                        } else {
                                                            const timeUntil = Math.ceil((fifteenMinutesBefore.getTime() - now.getTime()) / 60000);
                                                            return (
                                                                <div className="mt-2 p-3 bg-gray-100 rounded-lg text-center">
                                                                    <p className="text-xs text-gray-600">
                                                                        🔒 Meeting link available {timeUntil} minutes before meeting
                                                                    </p>
                                                                </div>
                                                            );
                                                        }
                                                    })()}
                                                </CardContent>
                                            </Card>
                                        ))}
                                    </div>
                                )}
                            </TabsContent>

                            <TabsContent value="pending" className="space-y-4">
                                {pendingMeetings.length === 0 ? (
                                    <Card>
                                        <CardContent className="pt-12 pb-12">
                                            <div className="text-center">
                                                <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
                                                <h3 className="text-lg font-semibold mb-2">No Pending Meetings</h3>
                                                <p className="text-muted-foreground">All requests have been reviewed</p>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {pendingMeetings.map(meeting => (
                                            <Card key={meeting.id}>
                                                <CardHeader>
                                                    <div className="flex items-center justify-between">
                                                        <CardTitle className="text-lg">{meeting.title}</CardTitle>
                                                        {getStatusBadge(meeting.status)}
                                                    </div>
                                                    <CardDescription>{meeting.description}</CardDescription>
                                                </CardHeader>
                                                <CardContent className="space-y-2">
                                                    <div className="flex items-center text-sm text-muted-foreground">
                                                        <Calendar className="h-4 w-4 mr-2" />
                                                        {formatMeetingDate(meeting.scheduledDate)}
                                                    </div>
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => handleCancelMeeting(meeting.id)}
                                                        className="w-full"
                                                    >
                                                        <XCircle className="h-4 w-4 mr-2" />
                                                        Cancel Request
                                                    </Button>
                                                </CardContent>
                                            </Card>
                                        ))}
                                    </div>
                                )}
                            </TabsContent>

                            <TabsContent value="all" className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {meetings.map(meeting => {
                                        const status = normalizeMeetingStatus(meeting.status);
                                        const isRejected = status === 'rejected';

                                        return (
                                            <Card key={meeting.id} className={isRejected ? 'border-red-300 bg-red-50' : ''}>
                                                <CardHeader>
                                                    <div className="flex items-center justify-between">
                                                        <CardTitle className="text-lg">{meeting.title}</CardTitle>
                                                        {getStatusBadge(meeting.status)}
                                                    </div>
                                                    {meeting.description && (
                                                        <CardDescription>{meeting.description}</CardDescription>
                                                    )}
                                                </CardHeader>
                                                <CardContent className="space-y-2">
                                                    <div className="flex items-center text-sm text-muted-foreground">
                                                        <Calendar className="h-4 w-4 mr-2" />
                                                        {formatMeetingDate(meeting.scheduledDate)}
                                                    </div>
                                                    <div className="flex items-center text-sm text-muted-foreground">
                                                        <Clock className="h-4 w-4 mr-2" />
                                                        {meeting.duration} minutes
                                                    </div>
                                                    {status === 'pending' && (
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            onClick={() => handleCancelMeeting(meeting.id)}
                                                            className="w-full mt-2"
                                                        >
                                                            <XCircle className="h-4 w-4 mr-2" />
                                                            Cancel Request
                                                        </Button>
                                                    )}
                                                </CardContent>
                                            </Card>
                                        );
                                    })}
                                </div>
                            </TabsContent>
                        </Tabs>
                    </TabsContent>

                    {/* HR Availability Tab */}
                    <TabsContent value="availability" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Calendar className="h-5 w-5" />
                                    HR Availability
                                </CardTitle>
                                <CardDescription>
                                    Click on an available time slot to book a meeting
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {availabilitySlots.length === 0 ? (
                                    <div className="text-center py-12">
                                        <Calendar className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                                        <h3 className="text-lg font-semibold text-gray-700 mb-2">No Availability Set</h3>
                                        <p className="text-gray-500">
                                            HR hasn't set up their availability yet. Please check back later or use the manual request option.
                                        </p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {[1, 2, 3, 4, 5].map(day => {
                                            const daySlots = slotsByDay[day] || [];
                                            if (daySlots.length === 0) return null;

                                            return (
                                                <div key={day} className="border rounded-lg p-4">
                                                    <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                                                        <Calendar className="h-4 w-4" />
                                                        {getDayName(day)}
                                                    </h3>
                                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                                        {daySlots.map((slot) => (
                                                            <Button
                                                                key={slot.id}
                                                                variant="outline"
                                                                onClick={() => handleSlotClick(slot)}
                                                                className="flex items-center gap-2 justify-start hover:bg-blue-50 hover:border-blue-300"
                                                            >
                                                                <Clock className="h-4 w-4" />
                                                                <span>{slot.startTime} - {slot.endTime}</span>
                                                            </Button>
                                                        ))}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>

                {/* Slot-based Booking Form Modal */}
                {showBookingForm && selectedSlot && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                        <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                            <CardHeader>
                                <CardTitle>Book Meeting with {selectedSlot.hrName}</CardTitle>
                                <CardDescription>
                                    Fill in the meeting details to confirm your booking
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <Label htmlFor="title">Meeting Title *</Label>
                                    <Input
                                        id="title"
                                        placeholder="e.g., Performance Review, One-on-One"
                                        value={bookingForm.title}
                                        onChange={(e) => setBookingForm(prev => ({ ...prev, title: e.target.value }))}
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="description">Meeting Description</Label>
                                    <Textarea
                                        id="description"
                                        placeholder="What would you like to discuss?"
                                        value={bookingForm.description}
                                        onChange={(e) => setBookingForm(prev => ({ ...prev, description: e.target.value }))}
                                        rows={3}
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="date">Date *</Label>
                                        <Input
                                            id="date"
                                            type="date"
                                            value={bookingForm.date}
                                            onChange={(e) => setBookingForm(prev => ({ ...prev, date: e.target.value }))}
                                        />
                                    </div>

                                    <div>
                                        <Label htmlFor="duration">Duration (minutes)</Label>
                                        <Input
                                            id="duration"
                                            type="number"
                                            value={bookingForm.duration}
                                            onChange={(e) => setBookingForm(prev => ({ ...prev, duration: parseInt(e.target.value) || 60 }))}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <Label htmlFor="startTime">Start Time</Label>
                                    <Input
                                        id="startTime"
                                        type="time"
                                        value={bookingForm.startTime}
                                        onChange={(e) => setBookingForm(prev => ({ ...prev, startTime: e.target.value }))}
                                    />
                                </div>

                                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                                        <User className="h-4 w-4" />
                                        Meeting Details
                                    </h4>
                                    <div className="space-y-1 text-sm">
                                        <p><span className="font-medium">With:</span> {selectedSlot.hrName}</p>
                                        <p><span className="font-medium">Day:</span> {getDayName(selectedSlot.dayOfWeek)}</p>
                                        <p><span className="font-medium">Slot:</span> {selectedSlot.startTime} - {selectedSlot.endTime}</p>
                                    </div>
                                </div>

                                <div className="flex space-x-3 pt-4">
                                    <Button
                                        onClick={handleBookMeeting}
                                        disabled={submitting}
                                        className="flex-1 bg-blue-600 hover:bg-blue-700"
                                    >
                                        {submitting ? (
                                            <>
                                                <Loader className="mr-2 h-4 w-4 animate-spin" />
                                                Booking...
                                            </>
                                        ) : (
                                            <>
                                                <CheckCircle className="mr-2 h-4 w-4" />
                                                Confirm Booking
                                            </>
                                        )}
                                    </Button>
                                    <Button
                                        variant="outline"
                                        onClick={() => {
                                            setShowBookingForm(false);
                                            setSelectedSlot(null);
                                        }}
                                        disabled={submitting}
                                        className="flex-1"
                                    >
                                        Cancel
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}

                {/* Manual Meeting Form Modal */}
                {showManualForm && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                        <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                            <CardHeader>
                                <CardTitle>Schedule Performance Meeting</CardTitle>
                                <CardDescription>Request a meeting with your manager</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <Label htmlFor="manualTitle">Meeting Title *</Label>
                                    <Input
                                        id="manualTitle"
                                        value={manualForm.title}
                                        onChange={(e) => setManualForm(prev => ({ ...prev, title: e.target.value }))}
                                        placeholder="e.g., Quarterly Performance Review"
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="manualDescription">Description</Label>
                                    <Textarea
                                        id="manualDescription"
                                        value={manualForm.description}
                                        onChange={(e) => setManualForm(prev => ({ ...prev, description: e.target.value }))}
                                        placeholder="What would you like to discuss?"
                                        rows={3}
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="manualMeetingType">Meeting Type</Label>
                                    <Select
                                        value={manualForm.meetingType}
                                        onValueChange={(value: any) => setManualForm(prev => ({ ...prev, meetingType: value }))}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="one-on-one">One-on-One</SelectItem>
                                            <SelectItem value="performance-review">Performance Review</SelectItem>
                                            <SelectItem value="goal-setting">Goal Setting</SelectItem>
                                            <SelectItem value="feedback">Feedback Session</SelectItem>
                                            <SelectItem value="development">Development Discussion</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="manualScheduledDate">Date *</Label>
                                        <Input
                                            id="manualScheduledDate"
                                            type="date"
                                            value={manualForm.scheduledDate}
                                            onChange={(e) => setManualForm(prev => ({ ...prev, scheduledDate: e.target.value }))}
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="manualScheduledTime">Time *</Label>
                                        <Input
                                            id="manualScheduledTime"
                                            type="time"
                                            value={manualForm.scheduledTime}
                                            onChange={(e) => setManualForm(prev => ({ ...prev, scheduledTime: e.target.value }))}
                                        />
                                    </div>
                                </div>

                                {manualForm.scheduledDate && (
                                    <div>
                                        <Label>✅ HR Available Time Slots for {new Date(manualForm.scheduledDate).toLocaleDateString()}</Label>
                                        {loadingSlots ? (
                                            <p className="text-sm text-gray-500 mt-2">Loading available slots...</p>
                                        ) : availableTimeSlots.length > 0 ? (
                                            <div className="grid grid-cols-4 gap-2 mt-2">
                                                {availableTimeSlots.map((slot, idx) => {
                                                    const isSelected = manualForm.scheduledTime === slot.startTime;
                                                    return (
                                                        <button
                                                            key={idx}
                                                            type="button"
                                                            onClick={() => setManualForm(prev => ({ ...prev, scheduledTime: slot.startTime }))}
                                                            className={`px-3 py-2 text-sm rounded-lg border transition-all ${isSelected
                                                                ? 'bg-blue-600 text-white border-blue-600'
                                                                : 'bg-white text-gray-700 border-gray-300 hover:border-blue-400 hover:bg-blue-50'
                                                                }`}
                                                        >
                                                            {slot.startTime} - {slot.endTime}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        ) : (
                                            <p className="text-sm text-orange-600 mt-2">
                                                ⚠️ No available slots for this date. HR may be unavailable or fully booked. Please choose another date.
                                            </p>
                                        )}
                                    </div>
                                )}

                                <div>
                                    <Label htmlFor="manualDuration">Duration</Label>
                                    <Select
                                        value={manualForm.duration.toString()}
                                        onValueChange={(value) => setManualForm(prev => ({ ...prev, duration: parseInt(value) }))}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="30">30 minutes</SelectItem>
                                            <SelectItem value="60">1 hour</SelectItem>
                                            <SelectItem value="90">1.5 hours</SelectItem>
                                            <SelectItem value="120">2 hours</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div>
                                    <Label htmlFor="manualLocation">Location (optional)</Label>
                                    <Input
                                        id="manualLocation"
                                        value={manualForm.location}
                                        onChange={(e) => setManualForm(prev => ({ ...prev, location: e.target.value }))}
                                        placeholder="e.g., Conference Room A"
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="manualMeetingLink">Meeting Link *</Label>
                                    {hrBookingPageUrl && (
                                        <div className="mb-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                                            <p className="text-sm text-green-800 font-medium mb-2">
                                                ✨ HR has a booking page! Book there to get your Google Meet link:
                                            </p>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                onClick={() => window.open(hrBookingPageUrl, '_blank')}
                                                className="w-full bg-green-600 text-white hover:bg-green-700 border-green-600"
                                            >
                                                <Calendar className="h-4 w-4 mr-2" />
                                                Open HR Booking Page
                                            </Button>
                                        </div>
                                    )}
                                    <Input
                                        id="manualMeetingLink"
                                        value={manualForm.meetingLink}
                                        onChange={(e) => setManualForm(prev => ({ ...prev, meetingLink: e.target.value }))}
                                        placeholder="https://meet.google.com/xxx-xxxx-xxx"
                                        required
                                    />
                                    {!hrBookingPageUrl && (
                                        <p className="text-xs text-gray-500 mt-1">
                                            💡 <a href="https://meet.google.com/new" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline font-medium">
                                                Click to create Google Meet
                                            </a>
                                        </p>
                                    )}
                                </div>

                                <div className="flex space-x-3 pt-4">
                                    <Button
                                        onClick={handleManualMeeting}
                                        disabled={submitting}
                                        className="flex-1 bg-blue-600 hover:bg-blue-700"
                                    >
                                        {submitting ? <Loader className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
                                        {submitting ? 'Scheduling...' : 'Schedule Meeting'}
                                    </Button>
                                    <Button
                                        variant="outline"
                                        onClick={() => setShowManualForm(false)}
                                        className="flex-1"
                                    >
                                        Cancel
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}
            </div>
        </div>
    );
}
