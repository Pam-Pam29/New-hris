// Google Meet Integration Service
// Note: For full integration, you would need to set up Google Calendar API

export class GoogleMeetService {
    // Generate a Google Meet link
    // Using the "new meeting" approach which creates an instant meeting
    generateMeetLink(): string {
        // Google Meet's "new" endpoint creates an instant meeting when clicked
        // This is a valid approach that works without API setup
        return 'https://meet.google.com/new';
    }

    // Alternative: Generate a placeholder that explains manual setup
    generatePlaceholderLink(): string {
        return 'https://meet.google.com/new';
    }

    // Get instructions for manual Google Meet creation
    getManualInstructions(): string {
        return 'Click this link to create a new Google Meet, then share the generated link with participants.';
    }

    // Create a calendar event description
    createEventDescription(meeting: {
        title: string;
        description: string;
        scheduledDate: Date;
        duration: number;
        employeeName: string;
        managerName?: string;
    }): string {
        const startTime = meeting.scheduledDate.toISOString();
        const endTime = new Date(meeting.scheduledDate.getTime() + meeting.duration * 60000).toISOString();

        return `
Performance Meeting: ${meeting.title}

Description: ${meeting.description}

Participants:
- ${meeting.employeeName} (Employee)
${meeting.managerName ? `- ${meeting.managerName} (Manager)` : '- HR Manager'}

Duration: ${meeting.duration} minutes
Time: ${meeting.scheduledDate.toLocaleString()}

This meeting was scheduled through the HRIS Performance Management system.
        `.trim();
    }

    // Generate Google Calendar link
    generateCalendarLink(meeting: {
        title: string;
        description: string;
        scheduledDate: Date;
        duration: number;
        employeeName: string;
        managerName?: string;
    }): string {
        const startTime = meeting.scheduledDate.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
        const endDate = new Date(meeting.scheduledDate.getTime() + meeting.duration * 60000);
        const endTime = endDate.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';

        const details = encodeURIComponent(this.createEventDescription(meeting));
        const title = encodeURIComponent(meeting.title);

        return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${startTime}/${endTime}&details=${details}`;
    }
}

export const googleMeetService = new GoogleMeetService();
