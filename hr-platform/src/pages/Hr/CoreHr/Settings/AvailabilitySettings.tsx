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
import { Calendar, Clock, Plus, Trash2, Save } from 'lucide-react';
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
    const [newSlot, setNewSlot] = useState({
        dayOfWeek: 1,
        startTime: '09:00',
        endTime: '17:00',
        hrName: 'HR Manager',
        hrId: 'hr-001'
    });

    useEffect(() => {
        loadAvailability();
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

