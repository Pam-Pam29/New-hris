import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import {
    Activity,
    Clock,
    Users,
    FileText,
    Calendar,
    Plus,
    RefreshCw,
    CheckCircle,
    XCircle
} from 'lucide-react';
import { useRealTimeSync, useLeaveRequests, useNotifications, useEmployees } from '../hooks/useRealTimeSync';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '../config/firebase';

const RealTimeSyncDemo: React.FC = () => {
    const [isCreatingData, setIsCreatingData] = useState(false);
    const [testEmployeeId] = useState('sync-test-employee-001');

    // Real-time hooks with stable options
    const leaveRequests = useLeaveRequests(testEmployeeId);
    const notifications = useNotifications(testEmployeeId);
    const employees = useEmployees();

    // Create test leave request
    const createTestLeaveRequest = async () => {
        setIsCreatingData(true);
        try {
            await addDoc(collection(db, 'leaveRequests'), {
                employeeId: testEmployeeId,
                employeeName: 'Test Employee',
                leaveType: 'annual-leave',
                startDate: new Date(),
                endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                reason: 'Real-time sync test leave request',
                status: 'pending',
                submittedAt: serverTimestamp(),
                createdAt: serverTimestamp()
            });
            console.log('✅ Test leave request created');
        } catch (error) {
            console.error('❌ Failed to create leave request:', error);
        } finally {
            setIsCreatingData(false);
        }
    };

    // Create test notification
    const createTestNotification = async () => {
        setIsCreatingData(true);
        try {
            await addDoc(collection(db, 'notifications'), {
                employeeId: testEmployeeId,
                title: 'Real-time Sync Test',
                message: 'This notification was created to test real-time synchronization between platforms.',
                type: 'info',
                isRead: false,
                createdAt: serverTimestamp(),
                expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours from now
            });
            console.log('✅ Test notification created');
        } catch (error) {
            console.error('❌ Failed to create notification:', error);
        } finally {
            setIsCreatingData(false);
        }
    };

    // Create test employee
    const createTestEmployee = async () => {
        setIsCreatingData(true);
        try {
            await addDoc(collection(db, 'employees'), {
                employeeId: testEmployeeId,
                firstName: 'Sync',
                lastName: 'Test',
                email: 'sync.test@company.com',
                department: 'IT',
                position: 'Software Engineer',
                status: 'active',
                hireDate: new Date(),
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp()
            });
            console.log('✅ Test employee created');
        } catch (error) {
            console.error('❌ Failed to create employee:', error);
        } finally {
            setIsCreatingData(false);
        }
    };

    const getStatusBadge = (isConnected: boolean, count: number) => (
        <Badge variant={isConnected ? 'default' : 'destructive'}>
            {isConnected ? `Connected (${count})` : 'Disconnected'}
        </Badge>
    );

    const getChangesBadge = (changes: any) => {
        if (!changes) return null;
        const totalChanges = changes.added?.length + changes.modified?.length + changes.removed?.length || 0;
        if (totalChanges === 0) return null;

        return (
            <Badge variant="outline" className="ml-2">
                {totalChanges} updates
            </Badge>
        );
    };

    return (
        <Card className="shadow-lg border-0 bg-gradient-to-br from-white to-gray-50">
            <CardHeader>
                <CardTitle className="text-xl font-semibold text-primary-foreground bg-gradient-to-r from-green-600 to-blue-600 p-4 rounded-t-lg -mx-6 -mt-6 mb-4">
                    <div className="flex items-center space-x-2">
                        <Activity className="w-6 h-6" />
                        <span>Real-Time Synchronization Demo</span>
                    </div>
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Connection Status */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                        <div className="flex items-center space-x-2">
                            <Calendar className="w-5 h-5 text-blue-500" />
                            <span className="font-medium">Leave Requests</span>
                        </div>
                        <div className="flex items-center">
                            {getStatusBadge(!leaveRequests.loading && !leaveRequests.error, leaveRequests.data.length)}
                            {getChangesBadge(leaveRequests.changes)}
                        </div>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                        <div className="flex items-center space-x-2">
                            <FileText className="w-5 h-5 text-purple-500" />
                            <span className="font-medium">Notifications</span>
                        </div>
                        <div className="flex items-center">
                            {getStatusBadge(!notifications.loading && !notifications.error, notifications.data.length)}
                            {getChangesBadge(notifications.changes)}
                        </div>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                        <div className="flex items-center space-x-2">
                            <Users className="w-5 h-5 text-green-500" />
                            <span className="font-medium">Employees</span>
                        </div>
                        <div className="flex items-center">
                            {getStatusBadge(!employees.loading && !employees.error, employees.data.length)}
                            {getChangesBadge(employees.changes)}
                        </div>
                    </div>
                </div>

                {/* Test Controls */}
                <div className="border-t pt-4">
                    <h3 className="text-lg font-semibold mb-3">Test Real-Time Sync</h3>
                    <p className="text-sm text-gray-600 mb-4">
                        Create test data in one platform and watch it appear in real-time on the other platform.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Button
                            onClick={createTestLeaveRequest}
                            disabled={isCreatingData}
                            className="flex items-center space-x-2"
                        >
                            <Plus className="w-4 h-4" />
                            <span>Create Leave Request</span>
                        </Button>

                        <Button
                            onClick={createTestNotification}
                            disabled={isCreatingData}
                            className="flex items-center space-x-2"
                            variant="outline"
                        >
                            <Plus className="w-4 h-4" />
                            <span>Create Notification</span>
                        </Button>

                        <Button
                            onClick={createTestEmployee}
                            disabled={isCreatingData}
                            className="flex items-center space-x-2"
                            variant="outline"
                        >
                            <Plus className="w-4 h-4" />
                            <span>Create Employee</span>
                        </Button>
                    </div>
                </div>

                {/* Recent Data */}
                <div className="border-t pt-4">
                    <h3 className="text-lg font-semibold mb-3">Recent Data (Live Updates)</h3>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Leave Requests */}
                        <div className="bg-blue-50 p-4 rounded-lg">
                            <h4 className="font-medium text-blue-800 mb-2">Latest Leave Requests</h4>
                            {leaveRequests.loading ? (
                                <div className="flex items-center space-x-2">
                                    <RefreshCw className="w-4 h-4 animate-spin" />
                                    <span className="text-sm">Loading...</span>
                                </div>
                            ) : leaveRequests.error ? (
                                <div className="flex items-center space-x-2 text-red-600">
                                    <XCircle className="w-4 h-4" />
                                    <span className="text-sm">Error: {leaveRequests.error}</span>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    {leaveRequests.data.slice(0, 3).map((request: any) => (
                                        <div key={request.id} className="text-sm bg-white p-2 rounded border">
                                            <div className="font-medium">{request.employeeName || 'Unknown'}</div>
                                            <div className="text-gray-600">{request.leaveType}</div>
                                            <div className="text-xs text-gray-500">{request.status}</div>
                                        </div>
                                    ))}
                                    {leaveRequests.data.length === 0 && (
                                        <div className="text-sm text-gray-500">No leave requests found</div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Notifications */}
                        <div className="bg-purple-50 p-4 rounded-lg">
                            <h4 className="font-medium text-purple-800 mb-2">Latest Notifications</h4>
                            {notifications.loading ? (
                                <div className="flex items-center space-x-2">
                                    <RefreshCw className="w-4 h-4 animate-spin" />
                                    <span className="text-sm">Loading...</span>
                                </div>
                            ) : notifications.error ? (
                                <div className="flex items-center space-x-2 text-red-600">
                                    <XCircle className="w-4 h-4" />
                                    <span className="text-sm">Error: {notifications.error}</span>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    {notifications.data.slice(0, 3).map((notification: any) => (
                                        <div key={notification.id} className="text-sm bg-white p-2 rounded border">
                                            <div className="font-medium">{notification.title}</div>
                                            <div className="text-gray-600 text-xs">{notification.message}</div>
                                            <div className="text-xs text-gray-500">{notification.type}</div>
                                        </div>
                                    ))}
                                    {notifications.data.length === 0 && (
                                        <div className="text-sm text-gray-500">No notifications found</div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Employees */}
                        <div className="bg-green-50 p-4 rounded-lg">
                            <h4 className="font-medium text-green-800 mb-2">Latest Employees</h4>
                            {employees.loading ? (
                                <div className="flex items-center space-x-2">
                                    <RefreshCw className="w-4 h-4 animate-spin" />
                                    <span className="text-sm">Loading...</span>
                                </div>
                            ) : employees.error ? (
                                <div className="flex items-center space-x-2 text-red-600">
                                    <XCircle className="w-4 h-4" />
                                    <span className="text-sm">Error: {employees.error}</span>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    {employees.data.slice(0, 3).map((employee: any) => (
                                        <div key={employee.id} className="text-sm bg-white p-2 rounded border">
                                            <div className="font-medium">{employee.firstName} {employee.lastName}</div>
                                            <div className="text-gray-600">{employee.position}</div>
                                            <div className="text-xs text-gray-500">{employee.department}</div>
                                        </div>
                                    ))}
                                    {employees.data.length === 0 && (
                                        <div className="text-sm text-gray-500">No employees found</div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Instructions */}
                <div className="border-t pt-4 bg-yellow-50 p-4 rounded-lg">
                    <h4 className="font-medium text-yellow-800 mb-2">How to Test Real-Time Sync:</h4>
                    <ol className="text-sm text-yellow-700 space-y-1">
                        <li>1. Open both HR and Employee platforms in separate browser tabs</li>
                        <li>2. Click "Create" buttons on either platform</li>
                        <li>3. Watch the data appear instantly on the other platform</li>
                        <li>4. The counters and "updates" badges will show real-time changes</li>
                    </ol>
                </div>
            </CardContent>
        </Card>
    );
};

export default RealTimeSyncDemo;
