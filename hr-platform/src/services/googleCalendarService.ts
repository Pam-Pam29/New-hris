// Google Calendar API Integration with Google Meet
// Requires: npm install @react-oauth/google gapi-script

declare const gapi: any;

export class GoogleCalendarService {
    private CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';
    private API_KEY = import.meta.env.VITE_GOOGLE_API_KEY || '';
    private DISCOVERY_DOCS = ['https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest'];
    private SCOPES = 'https://www.googleapis.com/auth/calendar.events';
    
    private isInitialized = false;
    private isSignedIn = false;

    // Initialize the Google API client
    async initialize(): Promise<void> {
        if (this.isInitialized) return;

        return new Promise((resolve, reject) => {
            // Load the Google API client
            const script = document.createElement('script');
            script.src = 'https://apis.google.com/js/api.js';
            script.onload = () => {
                gapi.load('client:auth2', async () => {
                    try {
                        await gapi.client.init({
                            apiKey: this.API_KEY,
                            clientId: this.CLIENT_ID,
                            discoveryDocs: this.DISCOVERY_DOCS,
                            scope: this.SCOPES
                        });

                        this.isInitialized = true;
                        this.isSignedIn = gapi.auth2.getAuthInstance().isSignedIn.get();
                        
                        console.log('✅ Google Calendar API initialized');
                        resolve();
                    } catch (error) {
                        console.error('❌ Error initializing Google Calendar API:', error);
                        reject(error);
                    }
                });
            };
            script.onerror = reject;
            document.body.appendChild(script);
        });
    }

    // Sign in to Google
    async signIn(): Promise<void> {
        if (!this.isInitialized) {
            await this.initialize();
        }

        try {
            await gapi.auth2.getAuthInstance().signIn();
            this.isSignedIn = true;
            console.log('✅ Signed in to Google');
        } catch (error) {
            console.error('❌ Error signing in to Google:', error);
            throw error;
        }
    }

    // Check if user is signed in
    async checkSignIn(): Promise<boolean> {
        if (!this.isInitialized) {
            await this.initialize();
        }
        return gapi.auth2.getAuthInstance().isSignedIn.get();
    }

    // Create a calendar event with Google Meet
    async createMeetingWithGoogleMeet(meeting: {
        title: string;
        description: string;
        startTime: Date;
        endTime: Date;
        attendees?: string[];
    }): Promise<{ meetingLink: string; eventId: string }> {
        try {
            // Check if signed in, if not, sign in
            const signedIn = await this.checkSignIn();
            if (!signedIn) {
                await this.signIn();
            }

            // Create calendar event with Google Meet
            const event = {
                summary: meeting.title,
                description: meeting.description,
                start: {
                    dateTime: meeting.startTime.toISOString(),
                    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
                },
                end: {
                    dateTime: meeting.endTime.toISOString(),
                    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
                },
                attendees: meeting.attendees?.map(email => ({ email })) || [],
                conferenceData: {
                    createRequest: {
                        requestId: `meet-${Date.now()}`,
                        conferenceSolutionKey: {
                            type: 'hangoutsMeet'
                        }
                    }
                },
                reminders: {
                    useDefault: false,
                    overrides: [
                        { method: 'email', minutes: 24 * 60 },
                        { method: 'popup', minutes: 30 }
                    ]
                }
            };

            const response = await gapi.client.calendar.events.insert({
                calendarId: 'primary',
                resource: event,
                conferenceDataVersion: 1,
                sendUpdates: 'all'
            });

            const meetingLink = response.result.hangoutLink || response.result.conferenceData?.entryPoints?.[0]?.uri || '';
            const eventId = response.result.id;

            console.log('✅ Google Meet created:', meetingLink);
            
            return {
                meetingLink,
                eventId
            };
        } catch (error) {
            console.error('❌ Error creating Google Meet:', error);
            // Fallback to simple link
            return {
                meetingLink: 'https://meet.google.com/new',
                eventId: ''
            };
        }
    }

    // Delete a calendar event
    async deleteEvent(eventId: string): Promise<void> {
        try {
            await gapi.client.calendar.events.delete({
                calendarId: 'primary',
                eventId: eventId
            });
            console.log('✅ Calendar event deleted');
        } catch (error) {
            console.error('❌ Error deleting event:', error);
        }
    }

    // Update a calendar event
    async updateEvent(eventId: string, updates: any): Promise<void> {
        try {
            await gapi.client.calendar.events.patch({
                calendarId: 'primary',
                eventId: eventId,
                resource: updates
            });
            console.log('✅ Calendar event updated');
        } catch (error) {
            console.error('❌ Error updating event:', error);
        }
    }
}

export const googleCalendarService = new GoogleCalendarService();

