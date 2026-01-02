// Performance management synchronization service
import { doc, updateDoc, addDoc, collection, serverTimestamp, getDoc, getDocs, query, where } from 'firebase/firestore';
import { db } from '../config/firebase';
import { PerformanceMeeting, PerformanceGoal } from '../types/performanceManagement';
import { hrAvailabilityService } from './hrAvailabilityService';

export class PerformanceSyncService {
    private db = db;

    // Schedule a performance meeting
    async scheduleMeeting(meeting: Omit<PerformanceMeeting, 'id' | 'createdAt' | 'updatedAt' | 'status'>): Promise<string> {
        try {
            console.log('📅 Scheduling performance meeting:', meeting);

            // Validate companyId is present
            if (!meeting.companyId) {
                throw new Error('companyId is required for performance meetings');
            }

            const meetingData = {
                ...meeting,
                companyId: meeting.companyId, // Ensure companyId is explicitly set
                createdBy: meeting.createdBy || 'employee', // Ensure createdBy is always set (default to 'employee')
                status: 'pending' as const,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp()
            };

            // Log the meeting data being saved (for debugging)
            console.log('📦 Meeting data being saved:', {
                companyId: meetingData.companyId,
                employeeId: meetingData.employeeId,
                title: meetingData.title,
                createdBy: meetingData.createdBy || 'not set'
            });

            const docRef = await addDoc(collection(this.db, 'performanceMeetings'), meetingData);

            console.log('✅ Meeting scheduled with ID:', docRef.id, 'CompanyId:', meetingData.companyId);

            // Create notification for HR if employee scheduled it, or for employee if HR scheduled it
            // Pass meetingData instead of meeting to ensure all fields (including createdBy) are included
            await this.createMeetingNotification(docRef.id, meetingData);

            return docRef.id;
        } catch (error) {
            console.error('❌ Failed to schedule meeting:', error);
            throw error;
        }
    }

    // Approve a meeting (HR only)
    async approveMeeting(meetingId: string, reviewedBy: string): Promise<void> {
        try {
            console.log('✅ Approving meeting:', meetingId);

            const meetingRef = doc(this.db, 'performanceMeetings', meetingId);
            await updateDoc(meetingRef, {
                status: 'approved',
                reviewedBy,
                reviewedAt: serverTimestamp(),
                updatedAt: serverTimestamp()
            });

            console.log('✅ Meeting approved successfully');
        } catch (error) {
            console.error('❌ Failed to approve meeting:', error);
            throw error;
        }
    }

    // Reject a meeting (HR only)
    async rejectMeeting(meetingId: string, reviewedBy: string, rejectionReason?: string): Promise<void> {
        try {
            console.log('❌ Rejecting meeting:', meetingId);

            const meetingRef = doc(this.db, 'performanceMeetings', meetingId);
            await updateDoc(meetingRef, {
                status: 'rejected',
                reviewedBy,
                reviewedAt: serverTimestamp(),
                rejectionReason: rejectionReason || '',
                updatedAt: serverTimestamp()
            });

            console.log('✅ Meeting rejected successfully');
        } catch (error) {
            console.error('❌ Failed to reject meeting:', error);
            throw error;
        }
    }

    // Cancel a meeting
    async cancelMeeting(meetingId: string): Promise<void> {
        try {
            console.log('🚫 Cancelling meeting:', meetingId);

            const meetingRef = doc(this.db, 'performanceMeetings', meetingId);
            await updateDoc(meetingRef, {
                status: 'cancelled',
                updatedAt: serverTimestamp()
            });

            console.log('✅ Meeting cancelled successfully');
        } catch (error) {
            console.error('❌ Failed to cancel meeting:', error);
            throw error;
        }
    }

    // Mark meeting as completed
    async completeMeeting(meetingId: string, notes?: string): Promise<void> {
        try {
            console.log('✅ Marking meeting as completed:', meetingId);

            const meetingRef = doc(this.db, 'performanceMeetings', meetingId);
            await updateDoc(meetingRef, {
                status: 'completed',
                notes: notes || '',
                updatedAt: serverTimestamp()
            });

            console.log('✅ Meeting marked as completed');
        } catch (error) {
            console.error('❌ Failed to complete meeting:', error);
            throw error;
        }
    }

    // Create notification for meeting
    private async createMeetingNotification(meetingId: string, meeting: any): Promise<void> {
        try {
            // Ensure createdBy is set (default to 'employee' if not provided)
            const createdBy = meeting.createdBy || 'employee';
            const companyId = meeting.companyId;
            
            if (!companyId) {
                console.warn('⚠️ Warning: companyId missing in meeting notification');
            }

            const notification = {
                id: `meeting-${meetingId}-${Date.now()}`,
                companyId: companyId || undefined, // Include companyId for multi-tenancy (can be undefined if missing)
                employeeId: createdBy === 'employee' ? 'hr-team' : (meeting.employeeId || 'unknown'),
                title: 'New Performance Meeting Request',
                message: createdBy === 'employee'
                    ? `${meeting.employeeName || 'An employee'} has requested a performance meeting`
                    : `HR has scheduled a performance meeting for you`,
                type: 'info',
                category: 'performance',
                read: false,
                actionUrl: createdBy === 'employee' ? '/hr/performance-management' : '/performance-management',
                actionText: 'View Meeting',
                metadata: {
                    meetingId,
                    meetingType: meeting.meetingType || 'one-on-one',
                    scheduledDate: meeting.scheduledDate || null,
                    createdBy: createdBy // Ensure this is never undefined
                }
            };

            // Remove any undefined values from metadata to prevent Firestore errors
            if (notification.metadata.scheduledDate === null) {
                delete notification.metadata.scheduledDate;
            }

            // Remove undefined values to prevent Firestore errors
            const notificationData: any = {
                ...notification,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp()
            };
            
            // Remove any undefined values
            Object.keys(notificationData).forEach(key => {
                if (notificationData[key] === undefined) {
                    delete notificationData[key];
                }
            });
            
            // Also clean metadata
            if (notificationData.metadata) {
                Object.keys(notificationData.metadata).forEach(key => {
                    if (notificationData.metadata[key] === undefined) {
                        delete notificationData.metadata[key];
                    }
                });
            }

            await addDoc(collection(this.db, 'notifications'), notificationData);

            console.log('📧 Meeting notification created');
        } catch (error) {
            console.error('❌ Failed to create meeting notification:', error);
        }
    }

    // Create a performance goal
    async createGoal(goal: Omit<PerformanceGoal, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
        try {
            console.log('🎯 Creating performance goal:', goal);
            console.log('🔍 Goal companyId check:', goal.companyId);

            // Validate companyId is present
            if (!goal.companyId) {
                console.error('❌ companyId is missing from goal:', goal);
                throw new Error('companyId is required for performance goal creation');
            }

            const goalData = {
                ...goal,
                companyId: goal.companyId, // Ensure companyId is explicitly set
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp()
            };

            console.log('📦 Goal data being saved:', { 
                companyId: goalData.companyId, 
                employeeId: goalData.employeeId, 
                title: goalData.title 
            });

            const docRef = await addDoc(collection(this.db, 'performanceGoals'), goalData);
            console.log(`✅ Goal created with ID: ${docRef.id}, companyId: ${goal.companyId}`);
            
            // Verify the saved document
            const savedDoc = await getDoc(docRef);
            const savedData = savedDoc.data();
            console.log('🔍 Saved goal data verification:', { 
                id: docRef.id, 
                companyId: savedData?.companyId, 
                employeeId: savedData?.employeeId 
            });
            
            return docRef.id;
        } catch (error) {
            console.error('❌ Failed to create goal:', error);
            throw error;
        }
    }

    // Update a performance goal
    async updateGoal(goalId: string, updates: Partial<PerformanceGoal>): Promise<void> {
        try {
            console.log('📝 Updating performance goal:', goalId);

            // Get current goal data to check for completion
            const goalDoc = await getDocs(query(collection(this.db, 'performanceGoals'), where('__name__', '==', goalId)));
            const currentGoal = goalDoc.empty ? null : goalDoc.docs[0].data() as PerformanceGoal;

            // Calculate new progress if values are being updated
            let progress = updates.progress;
            if (updates.currentValue !== undefined && updates.targetValue !== undefined) {
                progress = (updates.currentValue / updates.targetValue) * 100;
            } else if (updates.currentValue !== undefined && currentGoal) {
                progress = (updates.currentValue / (updates.targetValue || currentGoal.targetValue)) * 100;
            }

            const finalUpdates: any = { ...updates, updatedAt: serverTimestamp() };

            // Auto-detect completion when progress reaches 100%
            if (progress !== undefined && progress >= 100 && currentGoal?.status !== 'completed') {
                const now = new Date();
                const endDate = currentGoal?.endDate instanceof Date
                    ? currentGoal.endDate
                    : (currentGoal?.endDate as any)?.toDate?.() || now;

                // Calculate completion metrics
                const daysEarlyOrLate = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
                const startDate = currentGoal?.startDate instanceof Date
                    ? currentGoal.startDate
                    : (currentGoal?.startDate as any)?.toDate?.() || now;
                const daysToComplete = Math.ceil((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));

                finalUpdates.status = 'completed';
                finalUpdates.completedDate = serverTimestamp();
                finalUpdates.daysToComplete = daysToComplete;
                finalUpdates.completedEarly = daysEarlyOrLate > 0;
                finalUpdates.daysEarlyOrLate = daysEarlyOrLate;
                finalUpdates.progress = 100; // Ensure it's exactly 100

                console.log('🎉 Goal automatically marked as COMPLETED!');
                console.log(`📊 Completed ${daysEarlyOrLate > 0 ? daysEarlyOrLate + ' days early' : Math.abs(daysEarlyOrLate) + ' days late'}!`);
            }

            if (progress !== undefined) {
                finalUpdates.progress = progress;
            }

            const goalRef = doc(this.db, 'performanceGoals', goalId);
            await updateDoc(goalRef, finalUpdates);

            console.log('✅ Goal updated successfully');

            // Return completion status for UI to show celebration
            if (finalUpdates.status === 'completed') {
                return { completed: true, daysEarly: finalUpdates.daysEarlyOrLate } as any;
            }
        } catch (error) {
            console.error('❌ Failed to update goal:', error);
            throw error;
        }
    }

    // Delete a performance goal
    async deleteGoal(goalId: string): Promise<void> {
        try {
            console.log('🗑️ Deleting performance goal:', goalId);

            const goalRef = doc(this.db, 'performanceGoals', goalId);
            await updateDoc(goalRef, {
                status: 'cancelled',
                updatedAt: serverTimestamp()
            });

            console.log('✅ Goal deleted successfully');
        } catch (error) {
            console.error('❌ Failed to delete goal:', error);
            throw error;
        }
    }
}

// Export singleton instance
export const performanceSyncService = new PerformanceSyncService();
