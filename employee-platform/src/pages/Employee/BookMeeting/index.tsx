import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Textarea } from '../../../components/ui/textarea';
import { useCompany } from '../../../context/CompanyContext';
import { useAuth } from '../../../context/AuthContext';
import {
    Calendar,
    Clock,
    Video,
    CheckCircle,
    Loader,
    User,
    MapPin
} from 'lucide-react';
import { hrAvailabilityService, AvailabilitySlot } from '../../../services/hrAvailabilityService';
import { performanceSyncService } from '../../../services/performanceSyncService';

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
    const [success, setSuccess] = useState(false);

    // Booking form
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

    useEffect(() => {
        loadEmployeeName();
        loadAvailability();
    }, []);

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
            // Create Google Meet link (if available)
            let meetingLink = '';
            try {
                const { googleMeetService } = await import('../../../services/googleMeetService');
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

            // Schedule the meeting
            const scheduledDateTime = new Date(`${bookingForm.date}T${bookingForm.startTime}`);

            await performanceSyncService.scheduleMeeting({
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
                hrManagerName: selectedSlot?.hrName || 'HR Manager'
            });

            console.log('✅ Meeting booked successfully');
            setSuccess(true);

            // Reset form after 2 seconds and close
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

    if (loading) {
        return (
            <div className="p-6">
                <div className="max-w-5xl mx-auto">
                    <div className="flex items-center justify-center h-64">
                        <Loader className="h-8 w-8 animate-spin text-blue-600" />
                        <span className="ml-2">Loading available time slots...</span>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6">
            <div className="max-w-5xl mx-auto space-y-6">
                {/* Header */}
                <div>
                    <h1 className="text-3xl font-bold text-foreground">Book a Meeting with HR</h1>
                    <p className="text-muted-foreground mt-2">
                        Select an available time slot to schedule a meeting with HR
                    </p>
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

                {/* Availability Calendar */}
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
                                    HR hasn't set up their availability yet. Please check back later.
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

                {/* Booking Form Modal */}
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
                                {/* Meeting Title */}
                                <div>
                                    <Label htmlFor="title">Meeting Title *</Label>
                                    <Input
                                        id="title"
                                        placeholder="e.g., Performance Review, One-on-One"
                                        value={bookingForm.title}
                                        onChange={(e) => setBookingForm(prev => ({ ...prev, title: e.target.value }))}
                                    />
                                </div>

                                {/* Description */}
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

                                {/* Date and Time */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="date">Date *</Label>
                                        <Input
                                            id="date"
                                            type="date"
                                            value={bookingForm.date}
                                            onChange={(e) => setBookingForm(prev => ({ ...prev, date: e.target.value }))}
                                        />
                                        <p className="text-xs text-gray-500 mt-1">
                                            Next {getDayName(selectedSlot.dayOfWeek)}
                                        </p>
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

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="startTime">Start Time</Label>
                                        <Input
                                            id="startTime"
                                            type="time"
                                            value={bookingForm.startTime}
                                            onChange={(e) => setBookingForm(prev => ({ ...prev, startTime: e.target.value }))}
                                        />
                                    </div>

                                    <div>
                                        <Label htmlFor="endTime">End Time (auto-calculated)</Label>
                                        <Input
                                            id="endTime"
                                            type="time"
                                            value={bookingForm.endTime}
                                            readOnly
                                            className="bg-gray-50"
                                        />
                                    </div>
                                </div>

                                {/* Meeting Details */}
                                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                                        <User className="h-4 w-4" />
                                        Meeting Details
                                    </h4>
                                    <div className="space-y-1 text-sm">
                                        <p><span className="font-medium">With:</span> {selectedSlot.hrName}</p>
                                        <p><span className="font-medium">Day:</span> {getDayName(selectedSlot.dayOfWeek)}</p>
                                        <p><span className="font-medium">Slot:</span> {selectedSlot.startTime} - {selectedSlot.endTime}</p>
                                        <p className="flex items-center gap-1">
                                            <Video className="h-3 w-3" />
                                            <span className="font-medium">Meeting Link:</span> Will be generated
                                        </p>
                                    </div>
                                </div>

                                {/* Action Buttons */}
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

                {/* Instructions */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">How to Book</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700">
                            <li>Select an available time slot from the calendar above</li>
                            <li>Fill in your meeting title and description</li>
                            <li>Confirm the date and time</li>
                            <li>Click "Confirm Booking"</li>
                            <li>You'll receive a meeting link via notification</li>
                            <li>The meeting will appear in your Performance Management page</li>
                        </ol>
                        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                            <p className="text-sm text-yellow-800">
                                <strong>Note:</strong> Your meeting will be sent to HR for approval. You'll be notified once approved.
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

