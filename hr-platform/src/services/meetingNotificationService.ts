// Meeting notification service for real-time meeting reminders
import { collection, addDoc, serverTimestamp, query, where, getDocs } from 'firebase/firestore';
import { getFirebaseDb } from '../config/firebase';

export class MeetingNotificationService {
    private db = getFirebaseDb();
    private checkInterval: NodeJS.Timeout | null = null;
    private notifiedMeetings = new Set<string>();

    // Start checking for upcoming meetings (for HR to see all meetings)
    startMeetingChecker(callback: (meeting: any) => void) {
        // Check every minute for meetings starting soon
        this.checkInterval = setInterval(async () => {
            await this.checkUpcomingMeetings(callback);
        }, 60000); // Check every 1 minute

        // Also check immediately
        this.checkUpcomingMeetings(callback);

        console.log('✅ Meeting notification checker started');
    }

    // Stop checking
    stopMeetingChecker() {
        if (this.checkInterval) {
            clearInterval(this.checkInterval);
            this.checkInterval = null;
            console.log('🛑 Meeting notification checker stopped');
        }
    }

    // Check for meetings starting in the next 10 minutes
    private async checkUpcomingMeetings(callback: (meeting: any) => void) {
        try {
            const now = new Date();
            const tenMinutesFromNow = new Date(now.getTime() + 10 * 60000);

            // Query for approved meetings
            const q = query(
                collection(this.db, 'performanceMeetings'),
                where('status', '==', 'approved')
            );

            const querySnapshot = await getDocs(q);
            
            querySnapshot.forEach((doc) => {
                const meeting = { id: doc.id, ...doc.data() };
                const meetingDate = meeting.scheduledDate?.toDate ? meeting.scheduledDate.toDate() : new Date(meeting.scheduledDate);

                // Check if meeting is within the next 10 minutes
                if (meetingDate >= now && meetingDate <= tenMinutesFromNow) {
                    // Only notify once per meeting
                    if (!this.notifiedMeetings.has(meeting.id)) {
                        this.notifiedMeetings.add(meeting.id);
                        callback(meeting);
                        
                        // Send notifications to both employee and HR
                        this.sendMeetingStartNotification(meeting.employeeId, meeting);
                        this.sendMeetingStartNotification('hr-team', meeting);
                    }
                }
            });
        } catch (error) {
            console.error('Error checking upcoming meetings:', error);
        }
    }

    // Send notification that meeting is starting soon
    private async sendMeetingStartNotification(recipientId: string, meeting: any) {
        try {
            const notification = {
                employeeId: recipientId,
                title: '🔔 Meeting Starting Soon!',
                message: `Meeting "${meeting.title}" with ${meeting.employeeName} starts in a few minutes`,
                type: 'info',
                category: 'performance',
                read: false,
                actionUrl: meeting.meetingLink || '/hr/performance-management',
                actionText: 'Join Meeting',
                metadata: {
                    meetingId: meeting.id,
                    meetingLink: meeting.meetingLink,
                    scheduledDate: meeting.scheduledDate,
                    isUrgent: true
                },
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp()
            };

            await addDoc(collection(this.db, 'notifications'), notification);
            console.log('📧 Meeting start notification sent to:', recipientId);

            // Also send browser notification if permission granted
            if ('Notification' in window && Notification.permission === 'granted') {
                new Notification('Meeting Starting Soon!', {
                    body: `Meeting "${meeting.title}" starts in a few minutes`,
                    icon: '/favicon.ico',
                    tag: meeting.id,
                    requireInteraction: true
                });
            }
        } catch (error) {
            console.error('Failed to send meeting notification:', error);
        }
    }

    // Request browser notification permission
    async requestNotificationPermission() {
        if ('Notification' in window && Notification.permission === 'default') {
            const permission = await Notification.requestPermission();
            console.log('Notification permission:', permission);
            return permission === 'granted';
        }
        return Notification.permission === 'granted';
    }

    // Clear notified meetings cache (useful for testing)
    clearNotifiedCache() {
        this.notifiedMeetings.clear();
    }
}

export const meetingNotificationService = new MeetingNotificationService();


