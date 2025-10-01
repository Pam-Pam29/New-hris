import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { AlertTriangle, XCircle, Clock, User, TrendingUp, Calendar } from 'lucide-react';
import { getAttendanceTrackingService, AttendanceStatus } from '../services/attendanceTrackingService';

export function LateAbsenceTracker() {
    const [lateEmployees, setLateEmployees] = useState<AttendanceStatus[]>([]);
    const [absentEmployees, setAbsentEmployees] = useState<AttendanceStatus[]>([]);
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

    useEffect(() => {
        loadAttendanceData();
    }, [selectedDate]);

    const loadAttendanceData = async () => {
        setLoading(true);
        try {
            const service = getAttendanceTrackingService({
                expectedClockInTime: '09:00',
                lateThresholdMinutes: 30,
                absentThresholdMinutes: 120
            });

            const late = await service.getLateEmployees(selectedDate);
            const absent = await service.getAbsentEmployees(selectedDate);
            const statistics = await service.getAttendanceStats(selectedDate);

            setLateEmployees(late);
            setAbsentEmployees(absent);
            setStats(statistics);

            console.log('📊 Attendance tracking updated:', {
                late: late.length,
                absent: absent.length,
                stats: statistics
            });
        } catch (error) {
            console.error('Error loading attendance data:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Date Selector */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold">Attendance Tracking</h2>
                    <p className="text-sm text-muted-foreground">Monitor late arrivals and absences</p>
                </div>
                <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <input
                        type="date"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        className="px-3 py-2 border rounded-lg"
                    />
                    <Button onClick={loadAttendanceData} size="sm">Refresh</Button>
                </div>
            </div>

            {/* Statistics Overview */}
            {stats && (
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                    <Card>
                        <CardContent className="pt-6">
                            <div className="text-center">
                                <p className="text-sm font-medium text-muted-foreground">Total</p>
                                <p className="text-3xl font-bold">{stats.total}</p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-green-200 bg-green-50">
                        <CardContent className="pt-6">
                            <div className="text-center">
                                <p className="text-sm font-medium text-green-700">Present</p>
                                <p className="text-3xl font-bold text-green-600">{stats.present}</p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-yellow-200 bg-yellow-50">
                        <CardContent className="pt-6">
                            <div className="text-center">
                                <p className="text-sm font-medium text-yellow-700">Late</p>
                                <p className="text-3xl font-bold text-yellow-600">{stats.late}</p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-red-200 bg-red-50">
                        <CardContent className="pt-6">
                            <div className="text-center">
                                <p className="text-sm font-medium text-red-700">Absent</p>
                                <p className="text-3xl font-bold text-red-600">{stats.absent}</p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-blue-200 bg-blue-50">
                        <CardContent className="pt-6">
                            <div className="text-center">
                                <p className="text-sm font-medium text-blue-700">Rate</p>
                                <p className="text-3xl font-bold text-blue-600">{stats.attendanceRate.toFixed(0)}%</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Late Arrivals */}
            {lateEmployees.length > 0 && (
                <Card className="border-yellow-200">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-yellow-800">
                            <AlertTriangle className="h-5 w-5" />
                            <span>Late Arrivals</span>
                            <Badge variant="outline" className="bg-yellow-100 text-yellow-800">
                                {lateEmployees.length}
                            </Badge>
                        </CardTitle>
                        <CardDescription>
                            Employees who clocked in after {selectedDate} {lateEmployees[0]?.expectedTime}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {lateEmployees.map((employee) => (
                                <div key={employee.employeeId} className="flex items-center justify-between p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-yellow-100 rounded-lg">
                                            <User className="h-4 w-4 text-yellow-700" />
                                        </div>
                                        <div>
                                            <p className="font-semibold">{employee.employeeName}</p>
                                            <p className="text-sm text-muted-foreground">
                                                Expected: {employee.expectedTime} |
                                                Actual: {employee.clockInTime}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <Badge variant="outline" className="bg-yellow-100 text-yellow-800">
                                            {employee.minutesLate} min late
                                        </Badge>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Absences */}
            {absentEmployees.length > 0 && (
                <Card className="border-red-200">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-red-800">
                            <XCircle className="h-5 w-5" />
                            <span>Absent Employees</span>
                            <Badge variant="destructive">
                                {absentEmployees.length}
                            </Badge>
                        </CardTitle>
                        <CardDescription>
                            Employees who did not clock in today
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {absentEmployees.map((employee) => (
                                <div key={employee.employeeId} className="flex items-center justify-between p-3 bg-red-50 border border-red-200 rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-red-100 rounded-lg">
                                            <User className="h-4 w-4 text-red-700" />
                                        </div>
                                        <div>
                                            <p className="font-semibold">{employee.employeeName}</p>
                                            <p className="text-sm text-muted-foreground">
                                                Expected: {employee.expectedTime} | Status: No clock-in
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs text-red-600">{employee.reason}</p>
                                        <Button size="sm" variant="outline" className="mt-1">
                                            Send Reminder
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Empty State */}
            {!loading && lateEmployees.length === 0 && absentEmployees.length === 0 && stats && stats.total > 0 && (
                <Card className="border-green-200 bg-green-50">
                    <CardContent className="py-12 text-center">
                        <TrendingUp className="h-12 w-12 text-green-600 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-green-800 mb-2">Perfect Attendance!</h3>
                        <p className="text-sm text-green-600">
                            All employees clocked in on time today 🎉
                        </p>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}


