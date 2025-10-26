/**
 * Email Notification Service
 * Handles sending email notifications to candidates
 */

export interface EmailTemplate {
    to: string;
    subject: string;
    body: string;
}

export interface InterviewEmailData {
    candidateName: string;
    candidateEmail: string;
    jobTitle: string;
    interviewDate: Date;
    duration: number;
    interviewType: 'phone' | 'video' | 'onsite';
    meetingLink?: string;
    interviewers?: string[];
    notes?: string;
    companyName?: string;
}

export class EmailNotificationService {
    /**
     * Generate interview confirmation email template
     */
    static generateInterviewEmail(data: InterviewEmailData): EmailTemplate {
        const {
            candidateName,
            candidateEmail,
            jobTitle,
            interviewDate,
            duration,
            interviewType,
            meetingLink,
            interviewers,
            companyName = 'Our Company'
        } = data;

        const dateStr = interviewDate.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });

        const timeStr = interviewDate.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            timeZoneName: 'short'
        });

        let body = `Dear ${candidateName},

We're excited to invite you for an interview for the ${jobTitle} position at ${companyName}!

📅 Interview Details:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• Date: ${dateStr}
• Time: ${timeStr}
• Duration: ${duration} minutes
• Type: ${interviewType.charAt(0).toUpperCase() + interviewType.slice(1)} Interview
`;

        if (interviewers && interviewers.length > 0) {
            body += `• Panel Interviewers: ${interviewers.join(', ')}\n`;
        }

        if (interviewType === 'video' && meetingLink) {
            body += `\n🎥 Join Meeting:
${meetingLink}

Please join the meeting 5 minutes before the scheduled time.
Make sure your camera and microphone are working properly.
`;
        } else if (interviewType === 'phone') {
            body += `\nWe will call you at the phone number you provided.
Please ensure you're available and in a quiet location.
`;
        } else if (interviewType === 'onsite') {
            body += `\nPlease arrive 10 minutes early at our office.
Address details will be shared separately.
`;
        }

        body += `\n💡 Interview Tips:
• Research our company beforehand
• Prepare examples of your past work
• Have questions ready for the interviewers
• Dress appropriately for the interview

If you need to reschedule, please contact us as soon as possible.

We look forward to meeting you!

Best regards,
${companyName} HR Team

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
This is an automated message. Please do not reply to this email.
`;

        return {
            to: candidateEmail,
            subject: `Interview Scheduled: ${jobTitle} at ${companyName}`,
            body
        };
    }

    /**
     * Send email using the primary Vercel email service
     */
    static async sendEmail(email: EmailTemplate): Promise<boolean> {
        try {
            // Import the primary email service
            const { vercelEmailService } = await import('./vercelEmailService');

            // Send email using the primary service
            const result = await vercelEmailService.sendEmail({
                to: email.to,
                subject: email.subject,
                html: email.body // Convert body to HTML
            });

            if (result.success) {
                console.log('✅ [Recruitment Email] Email sent successfully via primary service');
                return true;
            } else {
                console.error('❌ [Recruitment Email] Failed to send email:', result.error);
                return false;
            }
        } catch (error) {
            console.error('❌ [Recruitment Email] Error sending email:', error);
            return false;
        }
    }

    /**
     * Send interview reminder (1 hour before)
     */
    static generateReminderEmail(data: InterviewEmailData): EmailTemplate {
        const {
            candidateName,
            candidateEmail,
            jobTitle,
            interviewDate,
            interviewType,
            meetingLink,
            companyName = 'Our Company'
        } = data;

        const timeStr = interviewDate.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit'
        });

        let body = `Hi ${candidateName},

🔔 Reminder: Your interview is starting in 1 hour!

📅 Interview: ${jobTitle}
⏰ Time: ${timeStr}
📍 Type: ${interviewType.charAt(0).toUpperCase() + interviewType.slice(1)}
`;

        if (interviewType === 'video' && meetingLink) {
            body += `\n🎥 Meeting Link:
${meetingLink}

Please join 5 minutes early and test your audio/video.
`;
        }

        body += `\nGood luck! 🍀

Best regards,
${companyName} HR Team
`;

        return {
            to: candidateEmail,
            subject: `⏰ Reminder: Interview in 1 Hour - ${jobTitle}`,
            body
        };
    }
}












