// Comprehensive leave management synchronization service
import { doc, updateDoc, addDoc, collection, serverTimestamp, getDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { LeaveRequest } from '../types/leaveManagement';

export class LeaveSyncService {
    private db = db;

    // Submit a new leave request with real-time sync
    async submitLeaveRequest(request: Omit<LeaveRequest, 'id' | 'submittedAt' | 'status'>): Promise<string> {
        try {
            console.log('📝 Submitting leave request:', request);
            
            const leaveRequestData = {
                ...request,
                status: 'pending' as const,
                submittedAt: serverTimestamp(),
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp()
            };

            // Add to leaveRequests collection
            const docRef = await addDoc(collection(this.db, 'leaveRequests'), leaveRequestData);
            
            console.log('✅ Leave request submitted with ID:', docRef.id);

            // Create notification for HR team
            await this.createHRNotification(docRef.id, request);

            return docRef.id;
        } catch (error) {
            console.error('❌ Failed to submit leave request:', error);
            throw error;
        }
    }

    // Cancel a leave request with real-time sync
    async cancelLeaveRequest(requestId: string): Promise<void> {
        try {
            console.log('🚫 Cancelling leave request:', requestId);
            
            const requestRef = doc(this.db, 'leaveRequests', requestId);
            await updateDoc(requestRef, {
                status: 'cancelled',
                updatedAt: serverTimestamp()
            });

            console.log('✅ Leave request cancelled successfully');
        } catch (error) {
            console.error('❌ Failed to cancel leave request:', error);
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

    // Create notification for HR team
    private async createHRNotification(requestId: string, request: any): Promise<void> {
        try {
            const notification = {
                id: `hr-leave-${requestId}-${Date.now()}`,
                employeeId: 'hr-team', // Special ID for HR team
                title: 'New Leave Request',
                message: `New leave request from ${request.employeeId}`,
                type: 'info',
                category: 'leave',
                read: false,
                createdAt: new Date(),
                actionUrl: '/hr/leave-management',
                actionText: 'Review Request',
                metadata: {
                    leaveRequestId: requestId,
                    employeeId: request.employeeId,
                    leaveTypeName: request.leaveTypeName,
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

            console.log('📧 HR notification created for new leave request');
        } catch (error) {
            console.error('❌ Failed to create HR notification:', error);
        }
    }
}

// Export singleton instance
export const leaveSyncService = new LeaveSyncService();

