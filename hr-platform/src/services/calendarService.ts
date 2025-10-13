/**
 * Calendar Service
 * Generates ICS (iCalendar) files for interview invites
 */

export interface CalendarEventData {
    title: string;
    description: string;
    location: string;
    startTime: Date;
    endTime: Date;
    attendees?: string[];
    organizerEmail?: string;
    meetingLink?: string;
}

export class CalendarService {
    /**
     * Format date for ICS file (YYYYMMDDTHHmmssZ)
     */
    private static formatICSDate(date: Date): string {
        const year = date.getUTCFullYear();
        const month = String(date.getUTCMonth() + 1).padStart(2, '0');
        const day = String(date.getUTCDate()).padStart(2, '0');
        const hours = String(date.getUTCHours()).padStart(2, '0');
        const minutes = String(date.getUTCMinutes()).padStart(2, '0');
        const seconds = String(date.getUTCSeconds()).padStart(2, '0');
        return `${year}${month}${day}T${hours}${minutes}${seconds}Z`;
    }

    /**
     * Generate ICS file content
     */
    static generateICS(event: CalendarEventData): string {
        const now = new Date();
        const startTimeStr = this.formatICSDate(event.startTime);
        const endTimeStr = this.formatICSDate(event.endTime);
        const timestamp = this.formatICSDate(now);

        let icsContent = [
            'BEGIN:VCALENDAR',
            'VERSION:2.0',
            'PRODID:-//HR Recruitment System//Interview Scheduler//EN',
            'CALSCALE:GREGORIAN',
            'METHOD:REQUEST',
            'BEGIN:VEVENT',
            `UID:${timestamp}-${Math.random().toString(36).substring(7)}@hrplatform.com`,
            `DTSTAMP:${timestamp}`,
            `DTSTART:${startTimeStr}`,
            `DTEND:${endTimeStr}`,
            `SUMMARY:${event.title}`,
            `DESCRIPTION:${event.description.replace(/\n/g, '\\n')}`,
        ];

        if (event.location) {
            icsContent.push(`LOCATION:${event.location}`);
        }

        if (event.meetingLink) {
            icsContent.push(`URL:${event.meetingLink}`);
            // Add meeting link to description for better visibility
            icsContent.push(`X-MICROSOFT-SKYPETEAMSMEETINGURL:${event.meetingLink}`);
        }

        if (event.organizerEmail) {
            icsContent.push(`ORGANIZER;CN=HR Team:MAILTO:${event.organizerEmail}`);
        }

        if (event.attendees && event.attendees.length > 0) {
            event.attendees.forEach(email => {
                icsContent.push(`ATTENDEE;ROLE=REQ-PARTICIPANT;RSVP=TRUE:MAILTO:${email}`);
            });
        }

        icsContent.push('STATUS:CONFIRMED');
        icsContent.push('SEQUENCE:0');
        icsContent.push('BEGIN:VALARM');
        icsContent.push('TRIGGER:-PT1H'); // 1 hour before
        icsContent.push('ACTION:DISPLAY');
        icsContent.push(`DESCRIPTION:Interview reminder: ${event.title}`);
        icsContent.push('END:VALARM');
        icsContent.push('END:VEVENT');
        icsContent.push('END:VCALENDAR');

        return icsContent.join('\r\n');
    }

    /**
     * Generate interview calendar event
     */
    static generateInterviewEvent(
        candidateName: string,
        jobTitle: string,
        candidateEmail: string,
        startTime: Date,
        duration: number,
        interviewType: 'phone' | 'video' | 'onsite',
        meetingLink?: string,
        interviewers?: string[],
        companyName: string = 'Our Company'
    ): CalendarEventData {
        const endTime = new Date(startTime.getTime() + duration * 60000);

        let description = `Interview for ${jobTitle} position\n\n`;
        description += `Candidate: ${candidateName}\n`;
        description += `Type: ${interviewType.charAt(0).toUpperCase() + interviewType.slice(1)} Interview\n`;
        description += `Duration: ${duration} minutes\n`;

        if (interviewers && interviewers.length > 0) {
            description += `\nPanel Interviewers: ${interviewers.join(', ')}\n`;
        }

        if (meetingLink) {
            description += `\nJoin Meeting:\n${meetingLink}\n`;
            description += `\nPlease join 5 minutes early.`;
        }

        let location = '';
        if (interviewType === 'video' && meetingLink) {
            location = meetingLink;
        } else if (interviewType === 'phone') {
            location = 'Phone Interview';
        } else if (interviewType === 'onsite') {
            location = `${companyName} Office`;
        }

        return {
            title: `Interview: ${jobTitle} - ${candidateName}`,
            description,
            location,
            startTime,
            endTime,
            attendees: [candidateEmail],
            organizerEmail: `hr@${companyName.toLowerCase().replace(/\s+/g, '')}.com`,
            meetingLink
        };
    }

    /**
     * Download ICS file
     */
    static downloadICS(icsContent: string, filename: string = 'interview.ics'): void {
        const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(link.href);
    }

    /**
     * Generate and download interview calendar invite
     */
    static downloadInterviewInvite(
        candidateName: string,
        jobTitle: string,
        candidateEmail: string,
        startTime: Date,
        duration: number,
        interviewType: 'phone' | 'video' | 'onsite',
        meetingLink?: string,
        interviewers?: string[],
        companyName?: string
    ): void {
        const event = this.generateInterviewEvent(
            candidateName,
            jobTitle,
            candidateEmail,
            startTime,
            duration,
            interviewType,
            meetingLink,
            interviewers,
            companyName
        );

        const icsContent = this.generateICS(event);
        const filename = `interview-${candidateName.replace(/\s+/g, '-')}-${startTime.toISOString().split('T')[0]}.ics`;

        this.downloadICS(icsContent, filename);

        console.log('📅 Calendar invite downloaded:', filename);
    }
}





