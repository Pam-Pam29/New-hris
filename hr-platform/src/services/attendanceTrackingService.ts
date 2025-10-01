import { getTimeTrackingService, TimeEntry } from './timeTrackingService';
import { getEmployeeService } from './employeeService';

/**
 * Attendance Tracking Service
 * Automatically tracks late arrivals and absences
 */

export interface AttendanceStatus {
    employeeId: string;
    employeeName: string;
    status: 'present' | 'late' | 'absent' | 'on_leave';
    clockInTime?: string;
    expectedTime: string;
    minutesLate?: number;
    reason?: string;
    date: string;
}

export interface AttendanceSettings {
    expectedClockInTime: string; // e.g., "09:00"
    lateThresholdMinutes: number; // e.g., 30 - after 30 min late = late status
    absentThresholdMinutes: number; // e.g., 120 - after 2 hours = absent
    trackWeekends: boolean;
    workDays: number[]; // 0-6 (Sunday-Saturday), e.g., [1,2,3,4,5] for Mon-Fri
}

export class AttendanceTrackingService {
    private settings: AttendanceSettings = {
        expectedClockInTime: '09:00',
        lateThresholdMinutes: 30,
        absentThresholdMinutes: 120,
        trackWeekends: false,
        workDays: [1, 2, 3, 4, 5] // Monday to Friday
    };

    constructor(settings?: Partial<AttendanceSettings>) {
        if (settings) {
            this.settings = { ...this.settings, ...settings };
        }
    }

    /**
     * Calculate if an employee is late based on clock-in time
     */
    calculateLateStatus(clockInTime: string): {
        isLate: boolean;
        minutesLate: number;
        status: 'on_time' | 'late' | 'very_late';
    } {
        const [expectedHours, expectedMinutes] = this.settings.expectedClockInTime.split(':').map(Number);
        const [actualHours, actualMinutes] = clockInTime.split(':').map(Number);

        const expectedTotalMinutes = expectedHours * 60 + expectedMinutes;
        const actualTotalMinutes = actualHours * 60 + actualMinutes;

        const minutesLate = actualTotalMinutes - expectedTotalMinutes;

        if (minutesLate <= 0) {
            return { isLate: false, minutesLate: 0, status: 'on_time' };
        } else if (minutesLate <= this.settings.lateThresholdMinutes) {
            return { isLate: true, minutesLate, status: 'late' };
        } else {
            return { isLate: true, minutesLate, status: 'very_late' };
        }
    }

    /**
     * Get attendance status for a specific date
     * Compares all employees vs who actually clocked in
     */
    async getAttendanceStatusForDate(date: string): Promise<AttendanceStatus[]> {
        try {
            const timeService = await getTimeTrackingService();
            const employeeService = await getEmployeeService();

            // Get all employees
            const allEmployees = await employeeService.getEmployees();

            // Get time entries for this date
            const allTimeEntries = await timeService.getTimeEntries();
            const todaysEntries = allTimeEntries.filter(entry => {
                const entryDate = new Date(entry.clockIn).toISOString().split('T')[0];
                return entryDate === date;
            });

            // Check if today is a work day
            const dayOfWeek = new Date(date).getDay();
            const isWorkDay = this.settings.workDays.includes(dayOfWeek);

            if (!isWorkDay && !this.settings.trackWeekends) {
                return []; // Don't track non-work days
            }

            // Create attendance status for each employee
            const attendanceStatuses: AttendanceStatus[] = allEmployees.map(employee => {
                const employeeEntry = todaysEntries.find(e => e.employeeId === employee.id.toString());

                if (employeeEntry) {
                    // Employee clocked in
                    const clockInDate = new Date(employeeEntry.clockIn);
                    const clockInTime = clockInDate.toTimeString().slice(0, 5);
                    const lateStatus = this.calculateLateStatus(clockInTime);

                    return {
                        employeeId: employee.id.toString(),
                        employeeName: employee.name,
                        status: lateStatus.status === 'on_time' ? 'present' : 'late',
                        clockInTime,
                        expectedTime: this.settings.expectedClockInTime,
                        minutesLate: lateStatus.minutesLate,
                        date
                    };
                } else {
                    // Employee did NOT clock in
                    // Check current time to determine if absent or just not started yet
                    const now = new Date();
                    const todayDate = now.toISOString().split('T')[0];

                    if (date === todayDate) {
                        // Today - check current time
                        const currentMinutes = now.getHours() * 60 + now.getMinutes();
                        const [expectedHours, expectedMinutes] = this.settings.expectedClockInTime.split(':').map(Number);
                        const expectedTotalMinutes = expectedHours * 60 + expectedMinutes;
                        const minutesPassed = currentMinutes - expectedTotalMinutes;

                        if (minutesPassed > this.settings.absentThresholdMinutes) {
                            // More than 2 hours late = Absent
                            return {
                                employeeId: employee.id.toString(),
                                employeeName: employee.name,
                                status: 'absent',
                                expectedTime: this.settings.expectedClockInTime,
                                minutesLate: minutesPassed,
                                reason: 'No clock-in recorded',
                                date
                            };
                        }
                    } else if (date < todayDate) {
                        // Past date - definitely absent
                        return {
                            employeeId: employee.id.toString(),
                            employeeName: employee.name,
                            status: 'absent',
                            expectedTime: this.settings.expectedClockInTime,
                            reason: 'No clock-in recorded',
                            date
                        };
                    }

                    // Future date or too early today - not absent yet
                    return null;
                }
            }).filter(Boolean) as AttendanceStatus[];

            return attendanceStatuses;
        } catch (error) {
            console.error('Error getting attendance status:', error);
            return [];
        }
    }

    /**
     * Get list of absent employees for a date
     */
    async getAbsentEmployees(date: string): Promise<AttendanceStatus[]> {
        const allStatuses = await this.getAttendanceStatusForDate(date);
        return allStatuses.filter(s => s.status === 'absent');
    }

    /**
     * Get list of late employees for a date
     */
    async getLateEmployees(date: string): Promise<AttendanceStatus[]> {
        const allStatuses = await this.getAttendanceStatusForDate(date);
        return allStatuses.filter(s => s.status === 'late');
    }

    /**
     * Get attendance statistics for a date
     */
    async getAttendanceStats(date: string): Promise<{
        total: number;
        present: number;
        late: number;
        absent: number;
        onLeave: number;
        attendanceRate: number;
    }> {
        const allStatuses = await this.getAttendanceStatusForDate(date);

        const stats = {
            total: allStatuses.length,
            present: allStatuses.filter(s => s.status === 'present').length,
            late: allStatuses.filter(s => s.status === 'late').length,
            absent: allStatuses.filter(s => s.status === 'absent').length,
            onLeave: allStatuses.filter(s => s.status === 'on_leave').length,
            attendanceRate: 0
        };

        stats.attendanceRate = stats.total > 0
            ? ((stats.present + stats.late) / stats.total) * 100
            : 0;

        return stats;
    }

    /**
     * Get weekly attendance report
     */
    async getWeeklyAttendanceReport(startDate: string): Promise<{
        date: string;
        stats: Awaited<ReturnType<typeof this.getAttendanceStats>>;
    }[]> {
        const reports = [];
        const start = new Date(startDate);

        for (let i = 0; i < 7; i++) {
            const date = new Date(start);
            date.setDate(start.getDate() + i);
            const dateStr = date.toISOString().split('T')[0];

            const stats = await this.getAttendanceStats(dateStr);
            reports.push({ date: dateStr, stats });
        }

        return reports;
    }

    /**
     * Update attendance settings
     */
    updateSettings(newSettings: Partial<AttendanceSettings>) {
        this.settings = { ...this.settings, ...newSettings };
    }

    /**
     * Get current settings
     */
    getSettings(): AttendanceSettings {
        return { ...this.settings };
    }
}

// Singleton instance
let attendanceTrackingService: AttendanceTrackingService | null = null;

export function getAttendanceTrackingService(settings?: Partial<AttendanceSettings>): AttendanceTrackingService {
    if (!attendanceTrackingService) {
        attendanceTrackingService = new AttendanceTrackingService(settings);
    } else if (settings) {
        attendanceTrackingService.updateSettings(settings);
    }
    return attendanceTrackingService;
}


