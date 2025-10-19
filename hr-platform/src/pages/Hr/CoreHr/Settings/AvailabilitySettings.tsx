// HR Availability Settings - Manage when HR is available for meetings
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../components/ui/card';
import { Button } from '../../../../components/ui/button';
import { Input } from '../../../../components/ui/input';
import { Label } from '../../../../components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '../../../../components/ui/select';
import { Calendar, Clock, Plus, Trash2, Save, ChevronDown, ChevronUp } from 'lucide-react';
import { hrAvailabilityService, AvailabilitySlot } from '../../../../services/hrAvailabilityService';

const DAYS_OF_WEEK = [
    { value: 0, label: 'Sunday' },
    { value: 1, label: 'Monday' },
    { value: 2, label: 'Tuesday' },
    { value: 3, label: 'Wednesday' },
    { value: 4, label: 'Thursday' },
    { value: 5, label: 'Friday' },
    { value: 6, label: 'Saturday' },
];

export default function AvailabilitySettings() {
    const [availabilitySlots, setAvailabilitySlots] = useState<AvailabilitySlot[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAddForm, setShowAddForm] = useState(false);
    const [showBookingPageSection, setShowBookingPageSection] = useState(false);
    const [bookingPageUrl, setBookingPageUrl] = useState('');
    const [savingUrl, setSavingUrl] = useState(false);
    const [newSlot, setNewSlot] = useState({
        dayOfWeek: 1,
        startTime: '09:00',
        endTime: '17:00',
        hrName: 'HR Manager',
        hrId: 'hr-001'
    });

    useEffect(() => {
        loadAvailability();
        loadBookingPageUrl();
    }, []);

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

    const loadBookingPageUrl = async () => {
        try {
            const { getFirebaseDb } = await import('../../../../config/firebase');
            const { collection, getDocs, query, limit } = await import('firebase/firestore');
            const db = getFirebaseDb();
            const settingsQuery = query(collection(db, 'hrSettings'), limit(1));
            const snapshot = await getDocs(settingsQuery);

            if (!snapshot.empty) {
                const settings = snapshot.docs[0].data();
                if (settings.bookingPageUrl) {
                    setBookingPageUrl(settings.bookingPageUrl);
                    setShowBookingPageSection(true); // Auto-expand if URL exists
                }
            }
        } catch (error) {
            console.log('No booking page URL configured yet');
        }
    };

    const saveBookingPageUrl = async () => {
        setSavingUrl(true);
        try {
            const { getFirebaseDb } = await import('../../../../config/firebase');
            const { doc, setDoc, serverTimestamp } = await import('firebase/firestore');
            const db = getFirebaseDb();

            await setDoc(doc(db, 'hrSettings', 'general'), {
                bookingPageUrl: bookingPageUrl,
                updatedAt: serverTimestamp(),
                updatedBy: 'hr'
            }, { merge: true });

            alert('✅ Booking page URL saved! Employees will now see a button to book meetings on your calendar.');
        } catch (error) {
            console.error('Failed to save booking page URL:', error);
            alert('❌ Failed to save booking page URL');
        } finally {
            setSavingUrl(false);
        }
    };

    const handleAddSlot = async () => {
        try {
            await hrAvailabilityService.addAvailabilitySlot({
                ...newSlot,
                isRecurring: true
            });

            setShowAddForm(false);
            setNewSlot({
                dayOfWeek: 1,
                startTime: '09:00',
                endTime: '17:00',
                hrName: 'HR Manager',
                hrId: 'hr-001'
            });

            await loadAvailability();
        } catch (error) {
            console.error('Failed to add slot:', error);
            alert('Failed to add availability slot');
        }
    };

    const handleDeleteSlot = async (slotId: string) => {
        if (!confirm('Are you sure you want to delete this availability slot?')) {
            return;
        }

        try {
            await hrAvailabilityService.deleteAvailabilitySlot(slotId);
            await loadAvailability();
        } catch (error) {
            console.error('Failed to delete slot:', error);
            alert('Failed to delete availability slot');
        }
    };

    const handleQuickSetup = async () => {
        if (!confirm('This will set up standard business hours (Mon-Fri, 9AM-5PM). Continue?')) {
            return;
        }

        try {
            // Add Monday to Friday, 9AM-5PM
            for (let day = 1; day <= 5; day++) {
                await hrAvailabilityService.addAvailabilitySlot({
                    dayOfWeek: day,
                    startTime: '09:00',
                    endTime: '17:00',
                    isRecurring: true,
                    hrName: 'HR Manager',
                    hrId: 'hr-001'
                });
            }

            await loadAvailability();
        } catch (error) {
            console.error('Failed to set up standard hours:', error);
            alert('Failed to set up standard hours');
        }
    };

    if (loading) {
        return (
            <div className="p-8">
                <p>Loading availability settings...</p>
            </div>
        );
    }

    return (
        <div className="p-8 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">HR Availability Settings</h1>
                    <p className="text-gray-600 mt-1">Set when you're available for employee meetings</p>
                </div>
                <div className="flex space-x-3">
                    <Button onClick={handleQuickSetup} variant="outline">
                        <Clock className="h-4 w-4 mr-2" />
                        Quick Setup (9-5, Mon-Fri)
                    </Button>
                    <Button onClick={() => setShowAddForm(!showAddForm)}>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Availability
                    </Button>
                </div>
            </div>

            {/* Google Calendar Booking Page URL - Collapsible */}
            <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-2 border-green-200">
                <CardHeader
                    className="cursor-pointer hover:bg-green-100/50 transition-colors"
                    onClick={() => setShowBookingPageSection(!showBookingPageSection)}
                >
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Calendar className="h-5 w-5 text-green-900" />
                            <CardTitle className="text-green-900">
                                Google Calendar Booking Page (Optional)
                            </CardTitle>
                        </div>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                                e.stopPropagation();
                                setShowBookingPageSection(!showBookingPageSection);
                            }}
                        >
                            {showBookingPageSection ? (
                                <ChevronUp className="h-5 w-5 text-green-700" />
                            ) : (
                                <ChevronDown className="h-5 w-5 text-green-700" />
                            )}
                        </Button>
                    </div>
                    {!showBookingPageSection && bookingPageUrl && (
                        <p className="text-xs text-green-700 mt-2 font-medium">
                            ✅ Booking page configured - Click to view/edit
                        </p>
                    )}
                    {!showBookingPageSection && !bookingPageUrl && (
                        <p className="text-xs text-gray-600 mt-2">
                            Click to configure Google Calendar booking page URL
                        </p>
                    )}
                </CardHeader>

                {showBookingPageSection && (
                    <CardContent className="space-y-4 animate-in slide-in-from-top-2 duration-200">
                        <div>
                            <Label htmlFor="bookingPageUrl" className="text-gray-700 font-medium">
                                Booking Page URL
                            </Label>
                            <Input
                                id="bookingPageUrl"
                                type="url"
                                value={bookingPageUrl}
                                onChange={(e) => setBookingPageUrl(e.target.value)}
                                placeholder="https://calendar.google.com/calendar/u/0/appointments/schedules/..."
                                className="mt-1"
                            />
                            <p className="text-xs text-gray-500 mt-1">
                                💡 <strong>How to get this:</strong> Create an appointment schedule in Google Calendar → Click "Get shareable link" → Paste the URL here
                            </p>
                        </div>

                        {bookingPageUrl && (
                            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                <p className="text-sm text-blue-800 mb-2">
                                    <strong>Preview:</strong> Employees will see this when scheduling:
                                </p>
                                <div className="p-2 bg-white rounded border border-blue-300 text-xs text-gray-700">
                                    ✨ HR has a booking page! Book there to get your Google Meet link:
                                    <div className="mt-1 p-2 bg-green-100 rounded text-center font-medium">
                                        [Open HR Booking Page] ←  Button
                                    </div>
                                </div>
                            </div>
                        )}

                        <Button
                            onClick={saveBookingPageUrl}
                            disabled={savingUrl || !bookingPageUrl}
                            className="w-full bg-green-600 hover:bg-green-700"
                        >
                            {savingUrl ? (
                                <>Saving...</>
                            ) : (
                                <>
                                    <Save className="h-4 w-4 mr-2" />
                                    Save Booking Page URL
                                </>
                            )}
                        </Button>

                        {!bookingPageUrl && (
                            <p className="text-xs text-gray-500 italic">
                                If you don't have a Google Calendar booking page, leave this blank. Employees can still schedule meetings normally.
                            </p>
                        )}
                    </CardContent>
                )}
            </Card>

            {/* Add New Slot Form */}
            {showAddForm && (
                <Card>
                    <CardHeader>
                        <CardTitle>Add Availability Slot</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-4 gap-4">
                            <div>
                                <Label>Day of Week</Label>
                                <Select
                                    value={newSlot.dayOfWeek.toString()}
                                    onValueChange={(value) => setNewSlot(prev => ({ ...prev, dayOfWeek: parseInt(value) }))}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {DAYS_OF_WEEK.map(day => (
                                            <SelectItem key={day.value} value={day.value.toString()}>
                                                {day.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <Label>Start Time</Label>
                                <Input
                                    type="time"
                                    value={newSlot.startTime}
                                    onChange={(e) => setNewSlot(prev => ({ ...prev, startTime: e.target.value }))}
                                />
                            </div>

                            <div>
                                <Label>End Time</Label>
                                <Input
                                    type="time"
                                    value={newSlot.endTime}
                                    onChange={(e) => setNewSlot(prev => ({ ...prev, endTime: e.target.value }))}
                                />
                            </div>

                            <div className="flex items-end space-x-2">
                                <Button onClick={handleAddSlot} className="flex-1">
                                    <Save className="h-4 w-4 mr-2" />
                                    Save
                                </Button>
                                <Button onClick={() => setShowAddForm(false)} variant="outline">
                                    Cancel
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Current Availability */}
            <Card>
                <CardHeader>
                    <CardTitle>📅 Your Weekly Availability</CardTitle>
                </CardHeader>
                <CardContent>
                    {availabilitySlots.length === 0 ? (
                        <div className="text-center py-12 text-gray-500">
                            <Calendar className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                            <p className="text-lg mb-2">No availability set</p>
                            <p className="text-sm">Add your available hours so employees can schedule meetings</p>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {DAYS_OF_WEEK.map(day => {
                                const daySlots = availabilitySlots.filter(slot => slot.dayOfWeek === day.value);

                                return (
                                    <div key={day.value} className="flex items-center py-3 border-b">
                                        <div className="w-32 font-medium text-gray-700">{day.label}</div>
                                        <div className="flex-1 flex flex-wrap gap-2">
                                            {daySlots.length === 0 ? (
                                                <span className="text-gray-400 text-sm">Not available</span>
                                            ) : (
                                                daySlots.map(slot => (
                                                    <div key={slot.id} className="flex items-center space-x-2 bg-blue-50 px-3 py-1 rounded-lg">
                                                        <Clock className="h-4 w-4 text-blue-600" />
                                                        <span className="text-sm">{slot.startTime} - {slot.endTime}</span>
                                                        <button
                                                            onClick={() => handleDeleteSlot(slot.id!)}
                                                            className="text-red-500 hover:text-red-700"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </button>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </CardContent>
            </Card>

            <Card className="bg-blue-50 border-blue-200">
                <CardContent className="pt-6">
                    <div className="flex items-start space-x-3">
                        <div className="text-blue-600 text-2xl">💡</div>
                        <div>
                            <h3 className="font-semibold text-blue-900 mb-2">How This Works</h3>
                            <ul className="text-sm text-blue-800 space-y-1">
                                <li>• Set your weekly recurring availability (e.g., Mon-Fri 9AM-5PM)</li>
                                <li>• Employees will see available 30-minute time slots when scheduling meetings</li>
                                <li>• Slots are automatically marked unavailable when meetings are scheduled</li>
                                <li>• You can add multiple time blocks per day (e.g., 9-12 and 2-5)</li>
                            </ul>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}


