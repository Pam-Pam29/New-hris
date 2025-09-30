// Performance management synchronization service
import { doc, updateDoc, addDoc, collection, serverTimestamp, getDoc } from 'firebase/firestore';
import { getFirebaseDb } from '../config/firebase';
import { PerformanceMeeting, PerformanceGoal, PerformanceReview } from '../types/performanceManagement';
import { hrAvailabilityService } from './hrAvailabilityService';

export class PerformanceSyncService {
    private db = getFirebaseDb();

    // Schedule a performance meeting
    async scheduleMeeting(meeting: Omit<PerformanceMeeting, 'id' | 'createdAt' | 'updatedAt' | 'status'>): Promise<string> {
        try {
            console.log('📅 Scheduling performance meeting:', meeting);
            
            const meetingData = {
                ...meeting,
                status: 'pending' as const,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp()
            };

            const docRef = await addDoc(collection(this.db, 'performanceMeetings'), meetingData);
            
            console.log('✅ Meeting scheduled with ID:', docRef.id);

            // Create notification for employee
            await this.createMeetingNotification(docRef.id, meeting);

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
            
            // Get meeting details
            const meetingDoc = await getDoc(doc(this.db, 'performanceMeetings', meetingId));
            const meetingData = meetingDoc.data() as any;
            
            const meetingRef = doc(this.db, 'performanceMeetings', meetingId);
            await updateDoc(meetingRef, {
                status: 'approved',
                reviewedBy,
                reviewedAt: serverTimestamp(),
                updatedAt: serverTimestamp()
            });

            // Mark time slot as unavailable in HR availability
            if (meetingData?.scheduledDate && meetingData?.scheduledTime && meetingData?.duration) {
                try {
                    const meetingDate = meetingData.scheduledDate.toDate ? meetingData.scheduledDate.toDate() : new Date(meetingData.scheduledDate);
                    const [hours, minutes] = meetingData.scheduledTime.split(':');
                    const startTime = meetingData.scheduledTime;
                    
                    // Calculate end time based on duration
                    const endMinutes = parseInt(minutes) + meetingData.duration;
                    const endHours = parseInt(hours) + Math.floor(endMinutes / 60);
                    const endTime = `${String(endHours).padStart(2, '0')}:${String(endMinutes % 60).padStart(2, '0')}`;
                    
                    await hrAvailabilityService.markUnavailable({
                        date: meetingDate,
                        startTime,
                        endTime,
                        reason: `Meeting scheduled: ${meetingData.title}`,
                        hrName: 'HR Manager',
                        hrId: 'hr-001'
                    });
                    console.log('✅ Time slot marked as unavailable');
                } catch (error) {
                    console.error('Failed to mark unavailable:', error);
                }
            }

            // Update Google Calendar event to remove "Pending Approval" from title
            if (meetingData?.googleEventId) {
                try {
                    await googleCalendarService.updateEvent(meetingData.googleEventId, {
                        summary: meetingData.title // Remove the "- Pending HR Approval" suffix
                    });
                    console.log('✅ Google Calendar event updated');
                } catch (calError) {
                    console.warn('⚠️ Could not update calendar event:', calError);
                }
            }

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
            
            // Get meeting details
            const meetingDoc = await getDoc(doc(this.db, 'performanceMeetings', meetingId));
            const meetingData = meetingDoc.data() as any;
            
            const meetingRef = doc(this.db, 'performanceMeetings', meetingId);
            await updateDoc(meetingRef, {
                status: 'rejected',
                reviewedBy,
                reviewedAt: serverTimestamp(),
                rejectionReason: rejectionReason || '',
                updatedAt: serverTimestamp()
            });

            // Delete the Google Calendar event if it exists
            if (meetingData?.googleEventId) {
                try {
                    await googleCalendarService.deleteEvent(meetingData.googleEventId);
                    console.log('✅ Google Calendar event deleted');
                } catch (calError) {
                    console.warn('⚠️ Could not delete calendar event:', calError);
                }
            }

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
            
            // Get meeting details
            const meetingDoc = await getDoc(doc(this.db, 'performanceMeetings', meetingId));
            const meetingData = meetingDoc.data() as any;
            
            const meetingRef = doc(this.db, 'performanceMeetings', meetingId);
            await updateDoc(meetingRef, {
                status: 'cancelled',
                updatedAt: serverTimestamp()
            });

            // Delete the Google Calendar event if it exists
            if (meetingData?.googleEventId) {
                try {
                    await googleCalendarService.deleteEvent(meetingData.googleEventId);
                    console.log('✅ Google Calendar event deleted');
                } catch (calError) {
                    console.warn('⚠️ Could not delete calendar event:', calError);
                }
            }

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
            const notification = {
                id: `meeting-${meetingId}-${Date.now()}`,
                employeeId: meeting.createdBy === 'employee' ? 'hr-team' : meeting.employeeId,
                title: 'New Performance Meeting Request',
                message: meeting.createdBy === 'employee' 
                    ? `${meeting.employeeName} has requested a performance meeting`
                    : `HR has scheduled a performance meeting for you`,
                type: 'info',
                category: 'performance',
                read: false,
                actionUrl: meeting.createdBy === 'employee' ? '/hr/performance-management' : '/performance-management',
                actionText: 'View Meeting',
                metadata: {
                    meetingId,
                    meetingType: meeting.meetingType,
                    scheduledDate: meeting.scheduledDate,
                    createdBy: meeting.createdBy
                }
            };

            await addDoc(collection(this.db, 'notifications'), {
                ...notification,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp()
            });

            console.log('📧 Meeting notification created');
        } catch (error) {
            console.error('❌ Failed to create meeting notification:', error);
        }
    }

    // Create a performance goal
    async createGoal(goal: Omit<PerformanceGoal, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
        try {
            console.log('🎯 Creating performance goal:', goal);
            
            const goalData = {
                ...goal,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp()
            };

            const docRef = await addDoc(collection(this.db, 'performanceGoals'), goalData);
            console.log('✅ Goal created with ID:', docRef.id);
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
            
            const goalRef = doc(this.db, 'performanceGoals', goalId);
            await updateDoc(goalRef, {
                ...updates,
                updatedAt: serverTimestamp()
            });

            console.log('✅ Goal updated successfully');
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

    // Create a performance review
    async createReview(review: Omit<PerformanceReview, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
        try {
            console.log('📋 Creating performance review:', review);
            
            const reviewData = {
                ...review,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp()
            };

            const docRef = await addDoc(collection(this.db, 'performanceReviews'), reviewData);
            console.log('✅ Review created with ID:', docRef.id);

            // Create notification for employee
            await this.createReviewNotification(docRef.id, review);

            return docRef.id;
        } catch (error) {
            console.error('❌ Failed to create review:', error);
            throw error;
        }
    }

    // Create notification for review
    private async createReviewNotification(reviewId: string, review: any): Promise<void> {
        try {
            const notification = {
                id: `review-${reviewId}-${Date.now()}`,
                employeeId: review.employeeId,
                title: 'New Performance Review',
                message: `${review.reviewerName} has submitted a performance review for you`,
                type: 'info',
                category: 'performance',
                read: false,
                actionUrl: '/performance-management',
                actionText: 'View Review',
                metadata: {
                    reviewId,
                    reviewPeriod: review.reviewPeriod,
                    overallRating: review.overallRating
                }
            };

            await addDoc(collection(this.db, 'notifications'), {
                ...notification,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp()
            });

            console.log('📧 Review notification created');
        } catch (error) {
            console.error('❌ Failed to create review notification:', error);
        }
    }

    // Create goal for employee (HR function)
    async createGoalForEmployee(goal: Omit<PerformanceGoal, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
        try {
            console.log('🎯 Creating goal for employee:', goal);
            
            const goalData = {
                ...goal,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp()
            };

            const docRef = await addDoc(collection(this.db, 'performanceGoals'), goalData);
            console.log('✅ Goal created with ID:', docRef.id);

            // Create notification for employee
            await this.createGoalNotification(docRef.id, goal);

            return docRef.id;
        } catch (error) {
            console.error('❌ Failed to create goal:', error);
            throw error;
        }
    }

    // Create notification for new goal
    private async createGoalNotification(goalId: string, goal: any): Promise<void> {
        try {
            const notification = {
                id: `goal-${goalId}-${Date.now()}`,
                employeeId: goal.employeeId,
                title: 'New Performance Goal',
                message: `A new performance goal has been set for you: ${goal.title}`,
                type: 'info',
                category: 'performance',
                read: false,
                actionUrl: '/performance-management',
                actionText: 'View Goal',
                metadata: {
                    goalId,
                    title: goal.title,
                    targetValue: goal.targetValue
                }
            };

            await addDoc(collection(this.db, 'notifications'), {
                ...notification,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp()
            });

            console.log('📧 Goal notification created');
        } catch (error) {
            console.error('❌ Failed to create goal notification:', error);
        }
    }
}

// Export singleton instance
export const performanceSyncService = new PerformanceSyncService();
