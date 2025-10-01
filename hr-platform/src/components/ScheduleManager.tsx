import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from './ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import {
    Calendar,
    Clock,
    Users,
    Plus,
    Edit,
    Trash2,
    Copy,
    CheckCircle,
    XCircle,
    Sun,
    Moon,
    Sunrise,
    Sunset
} from 'lucide-react';
import { getScheduleService, WorkSchedule, ShiftTemplate, getShortDayName } from '../services/scheduleService';
import { getEmployeeService } from '../services/employeeService';
import { getTimeNotificationService } from '../services/timeNotificationService';

export function ScheduleManager() {
    const [schedules, setSchedules] = useState<WorkSchedule[]>([]);
    const [templates, setTemplates] = useState<ShiftTemplate[]>([]);
    const [employees, setEmployees] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    
    // Dialog states
    const [showCreateDialog, setShowCreateDialog] = useState(false);
    const [showBulkAssignDialog, setShowBulkAssignDialog] = useState(false);
    const [selectedSchedule, setSelectedSchedule] = useState<WorkSchedule | null>(null);
    
    // Form state
    const [scheduleForm, setScheduleForm] = useState({
        employeeId: '',
        shiftType: 'morning' as 'morning' | 'afternoon' | 'night' | 'flexible' | 'custom',
        startDate: new Date().toISOString().split('T')[0],
        endDate: '',
        workDays: [1, 2, 3, 4, 5], // Mon-Fri
        workHours: 8,
        breakDuration: 60,
        location: 'Office',
        shiftStartTime: '09:00',
        shiftEndTime: '17:00',
        notes: ''
    });

    // Bulk assign state
    const [selectedEmployeeIds, setSelectedEmployeeIds] = useState<string[]>([]);
    const [bulkTemplate, setBulkTemplate] = useState('morning');

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const scheduleService = await getScheduleService();
            const employeeService = await getEmployeeService();

            const [allSchedules, shiftTemplates, allEmployees] = await Promise.all([
                scheduleService.getSchedules(),
                scheduleService.getShiftTemplates(),
                employeeService.getEmployees()
            ]);

            setSchedules(allSchedules);
            setTemplates(shiftTemplates);
            setEmployees(allEmployees);

            console.log('📅 Schedule data loaded:', {
                schedules: allSchedules.length,
                templates: shiftTemplates.length,
                employees: allEmployees.length
            });
        } catch (error) {
            console.error('Error loading schedule data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateSchedule = async () => {
        try {
            const scheduleService = await getScheduleService();
            const notifService = await getTimeNotificationService();

            const selectedEmployee = employees.find(e => e.id.toString() === scheduleForm.employeeId);
            if (!selectedEmployee) {
                alert('Please select an employee');
                return;
            }

            const schedule = await scheduleService.createSchedule({
                employeeId: scheduleForm.employeeId,
                employeeName: selectedEmployee.name,
                department: selectedEmployee.department,
                shiftType: scheduleForm.shiftType,
                startDate: new Date(scheduleForm.startDate),
                endDate: scheduleForm.endDate ? new Date(scheduleForm.endDate) : undefined,
                workDays: scheduleForm.workDays,
                workHours: scheduleForm.workHours,
                breakDuration: scheduleForm.breakDuration,
                location: scheduleForm.location,
                shiftStartTime: scheduleForm.shiftStartTime,
                shiftEndTime: scheduleForm.shiftEndTime,
                isActive: true,
                notes: scheduleForm.notes,
                createdAt: new Date(),
                createdBy: 'HR Manager'
            });

            // Notify employee
            await notifService.notifyScheduleUpdate(
                scheduleForm.employeeId,
                selectedEmployee.name,
                schedule.id
            );

            await loadData();
            setShowCreateDialog(false);
            alert('Schedule created successfully!');

            console.log('✅ Schedule created:', schedule.id);
        } catch (error) {
            console.error('Error creating schedule:', error);
            alert('Failed to create schedule. Please try again.');
        }
    };

    const handleBulkAssign = async () => {
        if (selectedEmployeeIds.length === 0) {
            alert('Please select at least one employee');
            return;
        }

        try {
            const scheduleService = await getScheduleService();
            const notifService = await getTimeNotificationService();

            const template = templates.find(t => t.id === bulkTemplate);
            if (!template) return;

            const employeeNames = employees
                .filter(e => selectedEmployeeIds.includes(e.id.toString()))
                .reduce((acc, e) => ({ ...acc, [e.id]: e.name }), {} as Record<string, string>);

            const schedules = await scheduleService.assignScheduleToMultipleEmployees(
                selectedEmployeeIds,
                {
                    shiftType: template.shiftType,
                    workDays: template.workDays,
                    workHours: template.workHours,
                    breakDuration: template.breakDuration,
                    shiftStartTime: template.startTime,
                    shiftEndTime: template.endTime,
                    startDate: new Date(),
                    location: 'Office'
                }
            );

            // Notify all employees
            for (const empId of selectedEmployeeIds) {
                const schedule = schedules.find(s => s.employeeId === empId);
                if (schedule) {
                    await notifService.notifyScheduleUpdate(
                        empId,
                        employeeNames[empId] || '',
                        schedule.id
                    );
                }
            }

            await loadData();
            setShowBulkAssignDialog(false);
            setSelectedEmployeeIds([]);
            alert(`Successfully assigned schedules to ${selectedEmployeeIds.length} employees!`);

            console.log('✅ Bulk schedules created:', schedules.length);
        } catch (error) {
            console.error('Error bulk assigning schedules:', error);
            alert('Failed to assign schedules. Please try again.');
        }
    };

    const getShiftIcon = (shiftType: string) => {
        switch (shiftType) {
            case 'morning': return <Sunrise className="h-4 w-4" />;
            case 'afternoon': return <Sun className="h-4 w-4" />;
            case 'night': return <Moon className="h-4 w-4" />;
            case 'flexible': return <Clock className="h-4 w-4" />;
            default: return <Calendar className="h-4 w-4" />;
        }
    };

    const getShiftColor = (shiftType: string) => {
        switch (shiftType) {
            case 'morning': return 'bg-blue-100 text-blue-800';
            case 'afternoon': return 'bg-orange-100 text-orange-800';
            case 'night': return 'bg-purple-100 text-purple-800';
            case 'flexible': return 'bg-green-100 text-green-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const toggleEmployeeSelection = (employeeId: string) => {
        if (selectedEmployeeIds.includes(employeeId)) {
            setSelectedEmployeeIds(selectedEmployeeIds.filter(id => id !== employeeId));
        } else {
            setSelectedEmployeeIds([...selectedEmployeeIds, employeeId]);
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold">Work Schedule Management</h2>
                    <p className="text-sm text-muted-foreground">
                        Create and manage employee work schedules
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button onClick={() => setShowBulkAssignDialog(true)} variant="outline">
                        <Users className="h-4 w-4 mr-2" />
                        Bulk Assign
                    </Button>
                    <Button onClick={() => setShowCreateDialog(true)}>
                        <Plus className="h-4 w-4 mr-2" />
                        Create Schedule
                    </Button>
                </div>
            </div>

            {/* Shift Templates */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {templates.map(template => (
                    <Card key={template.id} className="cursor-pointer hover:shadow-md transition-shadow">
                        <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    {getShiftIcon(template.shiftType)}
                                    <h3 className="font-semibold">{template.name}</h3>
                                </div>
                                <Badge className={getShiftColor(template.shiftType)}>
                                    {template.shiftType}
                                </Badge>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-2 text-sm">
                            <p className="text-muted-foreground">{template.description}</p>
                            <div className="flex items-center justify-between">
                                <span className="text-muted-foreground">Hours:</span>
                                <span className="font-semibold">{template.workHours}h</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-muted-foreground">Time:</span>
                                <span className="font-mono text-xs">{template.startTime} - {template.endTime}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-muted-foreground">Days:</span>
                                <span className="text-xs">{template.workDays.map(d => getShortDayName(d)).join(', ')}</span>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Active Schedules */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Calendar className="h-5 w-5" />
                        <span>Active Schedules</span>
                        <Badge variant="outline">{schedules.filter(s => s.isActive).length} active</Badge>
                    </CardTitle>
                    <CardDescription>
                        Currently assigned employee work schedules
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {schedules.length === 0 ? (
                        <div className="text-center py-12">
                            <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                            <p className="text-muted-foreground mb-4">No schedules created yet</p>
                            <Button onClick={() => setShowCreateDialog(true)}>
                                <Plus className="h-4 w-4 mr-2" />
                                Create First Schedule
                            </Button>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {schedules.filter(s => s.isActive).map(schedule => (
                                <div key={schedule.id} className="flex items-center justify-between p-4 border rounded-lg">
                                    <div className="flex items-start gap-3 flex-1">
                                        <div className="p-2 bg-blue-50 rounded-lg">
                                            {getShiftIcon(schedule.shiftType)}
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <h3 className="font-semibold">{schedule.employeeName}</h3>
                                                <Badge className={getShiftColor(schedule.shiftType)}>
                                                    {schedule.shiftType}
                                                </Badge>
                                            </div>
                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm text-muted-foreground">
                                                <div>
                                                    <p className="font-medium">Work Days</p>
                                                    <p>{schedule.workDays.map(d => getShortDayName(d)).join(', ')}</p>
                                                </div>
                                                <div>
                                                    <p className="font-medium">Hours</p>
                                                    <p>{schedule.workHours}h/day</p>
                                                </div>
                                                <div>
                                                    <p className="font-medium">Time</p>
                                                    <p className="font-mono text-xs">{schedule.shiftStartTime} - {schedule.shiftEndTime}</p>
                                                </div>
                                                <div>
                                                    <p className="font-medium">Break</p>
                                                    <p>{schedule.breakDuration} min</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button size="sm" variant="outline">
                                            <Edit className="h-4 w-4" />
                                        </Button>
                                        <Button size="sm" variant="outline">
                                            <Copy className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Create Schedule Dialog */}
            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Create Work Schedule</DialogTitle>
                        <DialogDescription>
                            Assign a work schedule to an employee
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        {/* Employee Selection */}
                        <div>
                            <Label>Employee</Label>
                            <Select
                                value={scheduleForm.employeeId}
                                onValueChange={(value) => setScheduleForm({ ...scheduleForm, employeeId: value })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select employee" />
                                </SelectTrigger>
                                <SelectContent>
                                    {employees.map(emp => (
                                        <SelectItem key={emp.id} value={emp.id.toString()}>
                                            {emp.name} - {emp.department}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Shift Type */}
                        <div>
                            <Label>Shift Type</Label>
                            <Select
                                value={scheduleForm.shiftType}
                                onValueChange={(value: any) => {
                                    const template = templates.find(t => t.shiftType === value);
                                    if (template) {
                                        setScheduleForm({
                                            ...scheduleForm,
                                            shiftType: value,
                                            shiftStartTime: template.startTime,
                                            shiftEndTime: template.endTime,
                                            workHours: template.workHours,
                                            breakDuration: template.breakDuration,
                                            workDays: template.workDays
                                        });
                                    }
                                }}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="morning">Morning Shift (9 AM - 5 PM)</SelectItem>
                                    <SelectItem value="afternoon">Afternoon Shift (1 PM - 9 PM)</SelectItem>
                                    <SelectItem value="night">Night Shift (9 PM - 5 AM)</SelectItem>
                                    <SelectItem value="flexible">Flexible Hours</SelectItem>
                                    <SelectItem value="custom">Custom Schedule</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Date Range */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label>Start Date</Label>
                                <Input
                                    type="date"
                                    value={scheduleForm.startDate}
                                    onChange={(e) => setScheduleForm({ ...scheduleForm, startDate: e.target.value })}
                                />
                            </div>
                            <div>
                                <Label>End Date (Optional)</Label>
                                <Input
                                    type="date"
                                    value={scheduleForm.endDate}
                                    onChange={(e) => setScheduleForm({ ...scheduleForm, endDate: e.target.value })}
                                />
                            </div>
                        </div>

                        {/* Shift Times */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label>Shift Start</Label>
                                <Input
                                    type="time"
                                    value={scheduleForm.shiftStartTime}
                                    onChange={(e) => setScheduleForm({ ...scheduleForm, shiftStartTime: e.target.value })}
                                />
                            </div>
                            <div>
                                <Label>Shift End</Label>
                                <Input
                                    type="time"
                                    value={scheduleForm.shiftEndTime}
                                    onChange={(e) => setScheduleForm({ ...scheduleForm, shiftEndTime: e.target.value })}
                                />
                            </div>
                        </div>

                        {/* Work Hours & Break */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label>Work Hours per Day</Label>
                                <Input
                                    type="number"
                                    value={scheduleForm.workHours}
                                    onChange={(e) => setScheduleForm({ ...scheduleForm, workHours: parseInt(e.target.value) })}
                                />
                            </div>
                            <div>
                                <Label>Break Duration (minutes)</Label>
                                <Input
                                    type="number"
                                    value={scheduleForm.breakDuration}
                                    onChange={(e) => setScheduleForm({ ...scheduleForm, breakDuration: parseInt(e.target.value) })}
                                />
                            </div>
                        </div>

                        {/* Work Days */}
                        <div>
                            <Label className="mb-2 block">Work Days</Label>
                            <div className="flex gap-2">
                                {[0, 1, 2, 3, 4, 5, 6].map(day => {
                                    const dayName = getShortDayName(day);
                                    const isSelected = scheduleForm.workDays.includes(day);
                                    return (
                                        <Button
                                            key={day}
                                            type="button"
                                            size="sm"
                                            variant={isSelected ? "default" : "outline"}
                                            onClick={() => {
                                                if (isSelected) {
                                                    setScheduleForm({
                                                        ...scheduleForm,
                                                        workDays: scheduleForm.workDays.filter(d => d !== day)
                                                    });
                                                } else {
                                                    setScheduleForm({
                                                        ...scheduleForm,
                                                        workDays: [...scheduleForm.workDays, day].sort()
                                                    });
                                                }
                                            }}
                                        >
                                            {dayName}
                                        </Button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Location */}
                        <div>
                            <Label>Location</Label>
                            <Input
                                value={scheduleForm.location}
                                onChange={(e) => setScheduleForm({ ...scheduleForm, location: e.target.value })}
                                placeholder="Office, Remote, Hybrid, etc."
                            />
                        </div>

                        {/* Notes */}
                        <div>
                            <Label>Notes (Optional)</Label>
                            <Input
                                value={scheduleForm.notes}
                                onChange={(e) => setScheduleForm({ ...scheduleForm, notes: e.target.value })}
                                placeholder="Any special notes about this schedule"
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleCreateSchedule} disabled={!scheduleForm.employeeId}>
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Create Schedule
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Bulk Assign Dialog */}
            <Dialog open={showBulkAssignDialog} onOpenChange={setShowBulkAssignDialog}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Bulk Assign Schedules</DialogTitle>
                        <DialogDescription>
                            Assign the same schedule to multiple employees at once
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        {/* Template Selection */}
                        <div>
                            <Label>Select Shift Template</Label>
                            <Select value={bulkTemplate} onValueChange={setBulkTemplate}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {templates.map(template => (
                                        <SelectItem key={template.id} value={template.id}>
                                            {template.name} ({template.startTime} - {template.endTime})
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Employee Selection */}
                        <div>
                            <Label className="mb-2 block">
                                Select Employees ({selectedEmployeeIds.length} selected)
                            </Label>
                            <div className="border rounded-lg p-4 max-h-64 overflow-y-auto space-y-2">
                                {employees.map(emp => (
                                    <div
                                        key={emp.id}
                                        className={`p-3 rounded-lg cursor-pointer transition-colors ${
                                            selectedEmployeeIds.includes(emp.id.toString())
                                                ? 'bg-blue-50 border-2 border-blue-200'
                                                : 'bg-gray-50 border border-gray-200 hover:bg-gray-100'
                                        }`}
                                        onClick={() => toggleEmployeeSelection(emp.id.toString())}
                                    >
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="font-semibold">{emp.name}</p>
                                                <p className="text-sm text-muted-foreground">{emp.department} - {emp.role}</p>
                                            </div>
                                            {selectedEmployeeIds.includes(emp.id.toString()) && (
                                                <CheckCircle className="h-5 w-5 text-blue-600" />
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => {
                            setShowBulkAssignDialog(false);
                            setSelectedEmployeeIds([]);
                        }}>
                            Cancel
                        </Button>
                        <Button onClick={handleBulkAssign} disabled={selectedEmployeeIds.length === 0}>
                            <Users className="h-4 w-4 mr-2" />
                            Assign to {selectedEmployeeIds.length} Employee{selectedEmployeeIds.length !== 1 ? 's' : ''}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}


