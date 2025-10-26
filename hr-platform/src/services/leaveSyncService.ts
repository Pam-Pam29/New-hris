// Comprehensive leave management synchronization service
import { doc, updateDoc, addDoc, collection, serverTimestamp, getDoc } from 'firebase/firestore';
import { getFirebaseDb } from '../config/firebase';
import { LeaveRequest } from '../types/leaveManagement';
import { vercelEmailService } from './vercelEmailService';

export class LeaveSyncService {
    private db = getFirebaseDb();

    // Approve a leave request with real-time sync
    async approveLeaveRequest(
        requestId: string,
        reviewedBy: string,
        comments?: string
    ): Promise<void> {
        try {
            console.log('✅ Approving leave request:', requestId);

            const requestRef = doc(this.db, 'leaveRequests', requestId);
            await updateDoc(requestRef, {
                status: 'approved',
                reviewedBy,
                reviewedAt: serverTimestamp(),
                comments: comments || '',
                updatedAt: serverTimestamp()
            });

            // Get the request details for notification
            const request = await this.getLeaveRequest(requestId);
            if (request) {
                await this.createEmployeeNotification(request, 'approved');

                // Send email notification
                const emailResult = await vercelEmailService.sendLeaveApproved({
                    employeeName: request.employeeName || 'Employee',
                    email: request.employeeEmail || 'employee@company.com',
                    leaveType: request.type || 'Leave',
                    startDate: request.startDate || 'N/A',
                    endDate: request.endDate || 'N/A',
                    companyName: 'Your Company'
                });

                if (emailResult.success) {
                    console.log('✅ Leave approval email sent successfully');
                } else {
                    console.warn('⚠️ Failed to send leave approval email:', emailResult.error);
                    // Don't throw error - email failure shouldn't break the approval process
                }
            }

            console.log('✅ Leave request approved successfully');
        } catch (error) {
            console.error('❌ Failed to approve leave request:', error);
            throw error;
        }
    }

    // Reject a leave request with real-time sync
    async rejectLeaveRequest(
        requestId: string,
        reviewedBy: string,
        comments?: string
    ): Promise<void> {
        try {
            console.log('❌ Rejecting leave request:', requestId);

            const requestRef = doc(this.db, 'leaveRequests', requestId);
            await updateDoc(requestRef, {
                status: 'rejected',
                reviewedBy,
                reviewedAt: serverTimestamp(),
                comments: comments || '',
                updatedAt: serverTimestamp()
            });

            // Get the request details for notification
            const request = await this.getLeaveRequest(requestId);
            if (request) {
                await this.createEmployeeNotification(request, 'rejected');

                // Send email notification
                const emailResult = await vercelEmailService.sendLeaveRejected({
                    employeeName: request.employeeName || 'Employee',
                    email: request.employeeEmail || 'employee@company.com',
                    leaveType: request.type || 'Leave',
                    startDate: request.startDate || 'N/A',
                    endDate: request.endDate || 'N/A',
                    reason: comments || 'Not specified',
                    companyName: 'Your Company'
                });

                if (emailResult.success) {
                    console.log('✅ Leave rejection email sent successfully');
                } else {
                    console.warn('⚠️ Failed to send leave rejection email:', emailResult.error);
                    // Don't throw error - email failure shouldn't break the rejection process
                }
            }

            console.log('✅ Leave request rejected successfully');
        } catch (error) {
            console.error('❌ Failed to reject leave request:', error);
            throw error;
        }
    }

    // Get a specific leave request
    private async getLeaveRequest(requestId: string): Promise<LeaveRequest | null> {
        try {
            const requestRef = doc(this.db, 'leaveRequests', requestId);
            const requestSnap = await getDoc(requestRef);

            if (requestSnap.exists()) {
                return {
                    id: requestSnap.id,
                    ...requestSnap.data()
                } as LeaveRequest;
            }
            return null;
        } catch (error) {
            console.error('❌ Failed to get leave request:', error);
            return null;
        }
    }

    // Create notification for employee
    private async createEmployeeNotification(
        request: LeaveRequest,
        status: 'approved' | 'rejected' | 'cancelled'
    ): Promise<void> {
        try {
            const statusMessages = {
                approved: 'Your leave request has been approved',
                rejected: 'Your leave request has been rejected',
                cancelled: 'Your leave request has been cancelled'
            };

            const statusTypes = {
                approved: 'success' as const,
                rejected: 'error' as const,
                cancelled: 'warning' as const
            };

            const notification = {
                id: `leave-${request.id}-${Date.now()}`,
                employeeId: request.employeeId,
                title: `Leave Request ${status.charAt(0).toUpperCase() + status.slice(1)}`,
                message: statusMessages[status],
                type: statusTypes[status],
                category: 'leave',
                read: false,
                createdAt: new Date(),
                actionUrl: '/leave-management',
                actionText: 'View Details',
                metadata: {
                    leaveRequestId: request.id,
                    leaveTypeName: request.leaveTypeName,
                    status: status,
                    startDate: request.startDate,
                    endDate: request.endDate,
                    totalDays: request.totalDays
                }
            };

            await addDoc(collection(this.db, 'notifications'), {
                ...notification,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp()
            });

            console.log('📧 Notification created for employee:', request.employeeId);
        } catch (error) {
            console.error('❌ Failed to create employee notification:', error);
        }
    }
}

// Export singleton instance
export const leaveSyncService = new LeaveSyncService();


