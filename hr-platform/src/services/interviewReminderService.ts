/**
 * Interview Reminder Service
 * Checks for upcoming interviews and sends reminders
 */

import { Interview } from './recruitmentService';
import { EmailNotificationService, InterviewEmailData } from './emailNotificationService';

export class InterviewReminderService {
    private static checkInterval: NodeJS.Timeout | null = null;
    private static isRunning: boolean = false;

    /**
     * Check if interview is within 1 hour
     */
    static isWithinOneHour(interviewTime: Date): boolean {
        const now = new Date();
        const diffMs = interviewTime.getTime() - now.getTime();
        const diffMinutes = Math.floor(diffMs / 60000);

        // Between 55 and 65 minutes (to account for check interval)
        return diffMinutes >= 55 && diffMinutes <= 65;
    }

    /**
     * Check for upcoming interviews and send reminders
     */
    static async checkAndSendReminders(
        interviews: Interview[],
        candidates: any[],
        updateInterview: (id: string, data: Partial<Interview>) => Promise<void>,
        companyName?: string
    ): Promise<number> {
        let remindersSent = 0;

        for (const interview of interviews) {
            // Skip if reminder already sent
            if (interview.reminderSent || interview.status !== 'scheduled') {
                continue;
            }

            // Check if interview is within 1 hour
            if (this.isWithinOneHour(interview.scheduledTime)) {
                const candidate = candidates.find(c => c.id === interview.candidateId);

                if (!candidate || !candidate.email) {
                    continue;
                }

                try {
                    // Generate and send reminder email
                    const emailData: InterviewEmailData = {
                        candidateName: candidate.name,
                        candidateEmail: candidate.email,
                        jobTitle: candidate.position,
                        interviewDate: interview.scheduledTime,
                        duration: interview.duration,
                        interviewType: interview.type,
                        meetingLink: interview.meetingLink,
                        interviewers: interview.interviewers,
                        companyName
                    };

                    const reminderEmail = EmailNotificationService.generateReminderEmail(emailData);
                    await EmailNotificationService.sendEmail(reminderEmail);

                    // Mark reminder as sent
                    await updateInterview(interview.id, { reminderSent: true });

                    remindersSent++;
                    console.log(`✅ Reminder sent to ${candidate.name} for interview at ${interview.scheduledTime.toLocaleTimeString()}`);
                } catch (error) {
                    console.error(`Failed to send reminder for interview ${interview.id}:`, error);
                }
            }
        }

        return remindersSent;
    }

    /**
     * Start reminder checker (runs every 5 minutes)
     */
    static start(
        getInterviews: () => Interview[],
        getCandidates: () => any[],
        updateInterview: (id: string, data: Partial<Interview>) => Promise<void>,
        companyName?: string
    ): void {
        if (this.isRunning) {
            console.log('⚠️ Interview reminder service is already running');
            return;
        }

        console.log('🔔 Starting interview reminder service...');
        this.isRunning = true;

        // Run check every 5 minutes
        this.checkInterval = setInterval(async () => {
            try {
                const interviews = getInterviews();
                const candidates = getCandidates();
                const sent = await this.checkAndSendReminders(interviews, candidates, updateInterview, companyName);

                if (sent > 0) {
                    console.log(`🔔 Sent ${sent} interview reminder(s)`);
                }
            } catch (error) {
                console.error('Error in reminder service:', error);
            }
        }, 5 * 60 * 1000); // 5 minutes

        // Run initial check
        setTimeout(async () => {
            const interviews = getInterviews();
            const candidates = getCandidates();
            await this.checkAndSendReminders(interviews, candidates, updateInterview, companyName);
        }, 1000);

        console.log('✅ Interview reminder service started');
    }

    /**
     * Stop reminder checker
     */
    static stop(): void {
        if (this.checkInterval) {
            clearInterval(this.checkInterval);
            this.checkInterval = null;
            this.isRunning = false;
            console.log('🛑 Interview reminder service stopped');
        }
    }

    /**
     * Get service status
     */
    static getStatus(): { isRunning: boolean } {
        return { isRunning: this.isRunning };
    }
}








