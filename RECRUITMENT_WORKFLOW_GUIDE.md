# 🎯 Complete Recruitment Workflow Guide

## Current Process: Application → Interview → Hire

---

## 📊 Step-by-Step Recruitment Process

### **Step 1: Job Posting** 📝
```
HR Manager posts a job
↓
Job appears on "Jobs" tab
↓
Status: Published (visible to applicants)
```

**What HR does:**
- Create job posting with title, description, requirements
- Set salary range, location, type (full-time/part-time)
- Click "Post Job" → Job goes live

---

### **Step 2: Candidate Application** 👤
```
Candidate applies (from job board or external)
↓
HR adds candidate to system
↓
Candidate status: "New"
↓
Appears in "Candidates" tab with 🔵 New badge
```

**What HR does:**
1. Click "Add Candidate" button
2. Fill in candidate details:
   - Name, email, phone
   - Link to job posting
   - Upload resume (URL)
   - Add skills & experience
   - Add notes
3. Click "Add Candidate"

**System automatically:**
- Sets `createdAt` timestamp (for urgency tracking)
- Sets status to "new"
- Links candidate to job posting
- Shows candidate with "New" badge (<24h)

---

### **Step 3: Initial Screening** 🔍
```
HR reviews candidate
↓
Updates status: "Screening"
↓
Reviews resume, skills, experience
↓
Decision: Schedule Interview OR Reject
```

**What HR does:**
- Click "View" on candidate card
- Review all details in modal
- Update status if needed
- Add notes about screening

**If qualified:**
- Proceed to Step 4 (Schedule Interview)

**If not qualified:**
- Update status to "Rejected"
- Add rejection reason in notes

---

### **Step 4: Schedule Interview** 📅

**Current Process:**

```
HR clicks "Interview" button on candidate
↓
Opens "Schedule Interview" dialog
↓
Fills in interview details:
  • Date & Time
  • Duration (default: 60 min)
  • Interview Type: Phone/Video/On-site
  • Interviewer (select from employees)
  • Notes/Instructions
↓
Clicks "Schedule Interview"
↓
System creates interview record
↓
Candidate status → "Interviewing"
```

**What happens:**
1. **Interview is created** in Firebase
2. **Candidate status updates** to "interviewing"
3. **Interview appears** in "Interviews" tab
4. **Interview shows in dashboard** "Upcoming Events" (if within next 7 days)
5. **"Needs Attention" alert** shows if interview is within 24 hours

**Interview Details Stored:**
```javascript
{
  candidateId: "abc123",
  candidateName: "Sarah Lee", // looked up from candidate
  interviewerId: "emp456",
  scheduledTime: "2025-10-11T14:00:00", // Date & time
  duration: 60, // minutes
  type: "video", // phone, video, or onsite
  status: "scheduled", // scheduled, completed, cancelled
  feedback: "" // Notes from HR or interviewer
}
```

---

### **Step 5: Conduct Interview** 🎤

**Current Process (Manual):**

```
Interview day arrives
↓
HR/Interviewer sees it in:
  • Dashboard "Upcoming Events"
  • "Needs Attention" (if today)
  • Recruitment page "Interviews" tab
↓
Interviewer conducts interview manually
  (HR must arrange video link separately)
↓
After interview, HR updates:
  • Interview status → "Completed"
  • Add feedback/notes
↓
Decision: Hire OR Reject
```

**Current Limitations:**
- ❌ No automatic video link generation
- ❌ Manual Google Meet/Zoom setup required
- ❌ No email invitations sent automatically
- ❌ No calendar integration
- ❌ No reminders

**What should happen (see improvements below)** ⬇️

---

### **Step 6: Make Hiring Decision** ✅

**If Candidate Passes Interview:**

```
HR clicks "Hire" button on candidate
↓
Confirmation dialog appears
↓
HR confirms
↓
Candidate status → "Hired"
↓
Candidate removed from active pipeline
↓
Shows in stats as "Hired Candidate"
```

**If Candidate Fails Interview:**

```
HR updates candidate status → "Rejected"
↓
Interview marked as completed
↓
Candidate removed from active pipeline
↓
Can view in "All Candidates" with filter
```

---

## 🚀 PROPOSED: Video Interview Integration

### **How It SHOULD Work (with Google Meet/Zoom)**

Here's what we can add to make it seamless:

---

### **Enhanced Interview Scheduling Flow:**

```
HR clicks "Interview" button
↓
Opens enhanced dialog with:
  ✅ Date & Time picker
  ✅ Duration
  ✅ Interview Type selector
  ✅ Interviewer selector
  ✅ VIDEO PLATFORM selector (NEW!)
     → Google Meet
     → Zoom
     → Microsoft Teams
     → Phone (no video link)
     → On-site (no video link)
  ✅ Auto-generate meeting link checkbox (NEW!)
  ✅ Send email invites checkbox (NEW!)
  ✅ Notes/Instructions
↓
Clicks "Schedule Interview"
↓
System does the following:
  1. Creates interview record ✅
  2. Generates video meeting link 🆕
  3. Sends email to candidate with:
     • Interview date/time
     • Video link
     • Interviewer name
     • Instructions
  4. Sends email to interviewer with:
     • Candidate details
     • Video link
     • Resume link
  5. Updates candidate status → "Interviewing" ✅
  6. Creates calendar events (optional) 🆕
```

---

### **Video Link Generation (Technical Implementation)**

#### **Option 1: Google Meet Integration** (Recommended for Google Workspace)

```typescript
// When scheduling interview
async function scheduleVideoInterview(interviewData) {
  // 1. Create Google Calendar event with Meet link
  const event = await googleCalendar.events.insert({
    calendarId: 'primary',
    conferenceData: {
      createRequest: {
        requestId: generateUniqueId(),
        conferenceSolutionKey: { type: 'hangoutsMeet' }
      }
    },
    summary: `Interview: ${candidate.name} - ${job.title}`,
    description: `
      Interview for: ${job.title}
      Candidate: ${candidate.name}
      Resume: ${candidate.resumeUrl}
    `,
    start: {
      dateTime: interviewData.scheduledTime,
      timeZone: 'Africa/Johannesburg'
    },
    end: {
      dateTime: calculateEndTime(interviewData.scheduledTime, interviewData.duration),
      timeZone: 'Africa/Johannesburg'
    },
    attendees: [
      { email: candidate.email },
      { email: interviewer.email }
    ]
  });

  // 2. Extract Meet link
  const meetLink = event.conferenceData.entryPoints[0].uri;
  
  // 3. Save to Firebase
  await saveInterview({
    ...interviewData,
    videoLink: meetLink,
    calendarEventId: event.id
  });

  // 4. Send email notifications
  await sendInterviewEmails(candidate, interviewer, meetLink);
}
```

#### **Option 2: Zoom Integration**

```typescript
// Using Zoom API
async function createZoomMeeting(interviewData) {
  const meeting = await zoomAPI.meetings.create({
    topic: `Interview: ${candidate.name}`,
    type: 2, // Scheduled meeting
    start_time: interviewData.scheduledTime,
    duration: interviewData.duration,
    timezone: 'Africa/Johannesburg',
    settings: {
      host_video: true,
      participant_video: true,
      join_before_host: false,
      waiting_room: true,
      audio: 'both'
    }
  });

  return {
    meetingId: meeting.id,
    joinUrl: meeting.join_url,
    startUrl: meeting.start_url, // For interviewer
    password: meeting.password
  };
}
```

#### **Option 3: Static Links (Simplest - No Integration Needed)**

```typescript
// HR manually adds video link
// Just add a field in the interview form
interviewForm = {
  scheduledTime: '',
  duration: 60,
  type: 'video',
  interviewerId: '',
  videoLink: '', // <-- NEW FIELD (HR pastes Meet/Zoom link)
  notes: ''
}
```

---

### **Email Notifications**

**To Candidate:**
```
Subject: Interview Scheduled - [Job Title]

Hi [Candidate Name],

Great news! Your interview for [Job Title] has been scheduled.

📅 Date & Time: [Date] at [Time] (GMT+2)
⏱️ Duration: [60] minutes
🎥 Interview Type: Video Call
👤 Interviewer: [Interviewer Name]

📹 Join Video Call:
[Google Meet/Zoom Link]

📋 What to Prepare:
- Review the job description
- Prepare examples of your work
- Have your questions ready
- Test your camera and microphone

We look forward to speaking with you!

Best regards,
[Company Name] HR Team
```

**To Interviewer:**
```
Subject: Interview Reminder - [Candidate Name]

Hi [Interviewer Name],

You have an interview scheduled:

👤 Candidate: [Candidate Name]
📧 Email: [candidate@email.com]
📞 Phone: [+27...]
💼 Position: [Job Title]
📅 Date & Time: [Date] at [Time] (GMT+2)

📹 Video Link: [Google Meet/Zoom Link]
📄 Resume: [Resume URL]
📝 Notes: [Any screening notes]

Interview Details:
⏱️ Duration: 60 minutes
🎯 Focus Areas: [Technical skills, culture fit, etc.]

Good luck!
```

---

### **Updated Interview Schema (with Video Integration)**

```typescript
export interface Interview {
  id: string;
  candidateId: string;
  candidateName: string;
  interviewerId: string;
  interviewerName: string;
  scheduledTime: Date;
  duration: number; // minutes
  type: 'phone' | 'video' | 'onsite';
  status: 'scheduled' | 'completed' | 'cancelled';
  
  // NEW FIELDS for video integration
  videoPlatform?: 'google-meet' | 'zoom' | 'teams'; // Which platform
  videoLink?: string; // Meeting link
  meetingId?: string; // Zoom meeting ID
  meetingPassword?: string; // Zoom password
  calendarEventId?: string; // Google Calendar event ID
  
  // Email tracking
  candidateNotified?: boolean;
  interviewerNotified?: boolean;
  reminderSent?: boolean;
  
  feedback?: string;
  rating?: number; // 1-5 stars
  notes?: string;
}
```

---

## 📧 Email Service Integration

### **Setup Required:**

1. **Add Email Service** (e.g., SendGrid, Resend, or Nodemailer)

```bash
npm install @sendgrid/mail
# or
npm install resend
```

2. **Environment Variables:**
```env
SENDGRID_API_KEY=your_key_here
COMPANY_EMAIL=hr@company.com
GOOGLE_CALENDAR_API_KEY=your_key
GOOGLE_OAUTH_CLIENT_ID=your_client_id
ZOOM_API_KEY=your_key
ZOOM_API_SECRET=your_secret
```

3. **Create Email Templates:**
```typescript
// email-templates/interview-scheduled.ts
export const candidateInterviewEmail = (data) => `
<!DOCTYPE html>
<html>
<head>
  <style>
    .button { 
      background: #4F46E5; 
      color: white; 
      padding: 12px 24px; 
      text-decoration: none;
      border-radius: 6px;
      display: inline-block;
    }
  </style>
</head>
<body>
  <h2>Interview Scheduled!</h2>
  <p>Hi ${data.candidateName},</p>
  <p>Your interview for <strong>${data.jobTitle}</strong> has been scheduled.</p>
  
  <div style="background: #F3F4F6; padding: 20px; border-radius: 8px; margin: 20px 0;">
    <p><strong>📅 Date & Time:</strong> ${data.scheduledTime}</p>
    <p><strong>⏱️ Duration:</strong> ${data.duration} minutes</p>
    <p><strong>👤 Interviewer:</strong> ${data.interviewerName}</p>
  </div>

  ${data.videoLink ? `
    <a href="${data.videoLink}" class="button">Join Video Interview</a>
    <p><small>Link: ${data.videoLink}</small></p>
  ` : ''}

  <p>Good luck!</p>
  <p>Best regards,<br>${data.companyName} HR Team</p>
</body>
</html>
`;
```

---

## 🔧 Implementation Steps

### **Phase 1: Basic Video Links (Easiest - No API needed)**

1. Add `videoLink` field to interview form
2. HR manually creates Google Meet link and pastes it
3. Save link with interview
4. Display link in interview list
5. Send basic email with link (using Resend/SendGrid)

**Estimated Time:** 2-3 hours  
**Complexity:** Low  
**Cost:** $0 (except email service ~$10/month)

---

### **Phase 2: Google Meet Auto-Generation (Recommended)**

1. Set up Google Calendar API integration
2. Create OAuth flow for HR manager
3. Auto-generate Meet links when scheduling
4. Auto-create calendar events
5. Send email invites via Calendar API

**Estimated Time:** 1-2 days  
**Complexity:** Medium  
**Cost:** Free (Google Workspace required)

---

### **Phase 3: Multi-Platform Support (Advanced)**

1. Add platform selector in interview form
2. Integrate Zoom API
3. Integrate Microsoft Teams API
4. Allow HR to choose preferred platform
5. Handle different meeting platforms

**Estimated Time:** 3-5 days  
**Complexity:** High  
**Cost:** Varies (Zoom Pro ~$15/month per host)

---

## 📱 Interview Day Experience

### **For HR Manager:**

**Morning of Interview:**
```
1. Opens Dashboard
2. Sees in "Needs Attention":
   🔴 Interview in 2h: Sarah Lee @ 2:00 PM
3. Clicks to see details
4. Sends reminder to interviewer (optional)
5. Prepares interviewer notes
```

**During Interview:**
```
1. Interviewer joins video call (link from email/calendar)
2. Conducts interview
3. Takes notes in system (optional real-time)
```

**After Interview:**
```
1. HR/Interviewer updates interview:
   • Status → "Completed"
   • Add feedback
   • Add rating (1-5 stars)
2. Makes decision:
   → "Hire" button (if passed)
   → "Reject" button (if failed)
3. System updates candidate status
```

---

### **For Candidate:**

**Before Interview:**
```
1. Receives email with:
   • Interview date/time
   • Video link
   • What to prepare
2. Gets calendar invite (if integrated)
3. Gets reminder 1 hour before (optional)
```

**During Interview:**
```
1. Clicks video link from email
2. Joins meeting
3. Conducts interview
```

**After Interview:**
```
1. Receives follow-up email:
   • Thank you message
   • Next steps
   • Timeline for decision
```

---

## 🎯 Complete Workflow Diagram

```
┌─────────────────────────────────────────────────┐
│  1. POST JOB                                     │
│     HR creates job → Status: Published           │
└──────────────────┬──────────────────────────────┘
                   ↓
┌─────────────────────────────────────────────────┐
│  2. CANDIDATE APPLIES                            │
│     HR adds candidate → Status: New              │
│     🔵 New badge appears (<24h)                  │
└──────────────────┬──────────────────────────────┘
                   ↓
┌─────────────────────────────────────────────────┐
│  3. SCREENING                                    │
│     HR reviews → Status: Screening               │
│     Decision: Interview or Reject                │
└──────────────────┬──────────────────────────────┘
                   ↓
┌─────────────────────────────────────────────────┐
│  4. SCHEDULE INTERVIEW                           │
│     ✅ Select date/time                          │
│     ✅ Select interviewer                        │
│     ✅ Choose video platform (Meet/Zoom)         │
│     ✅ Auto-generate meeting link [NEW!]         │
│     ✅ Send email invites [NEW!]                 │
│     → Status: Interviewing                       │
└──────────────────┬──────────────────────────────┘
                   ↓
┌─────────────────────────────────────────────────┐
│  5. INTERVIEW REMINDERS [NEW!]                   │
│     📧 24h before → Reminder to candidate        │
│     📧 1h before → Reminder to both              │
│     🚨 Shows in "Needs Attention" if today       │
└──────────────────┬──────────────────────────────┘
                   ↓
┌─────────────────────────────────────────────────┐
│  6. CONDUCT INTERVIEW                            │
│     🎥 Candidate joins video link                │
│     🎥 Interviewer joins video link              │
│     📝 Interview happens                         │
│     → Update status: Completed                   │
└──────────────────┬──────────────────────────────┘
                   ↓
┌─────────────────────────────────────────────────┐
│  7. POST-INTERVIEW                               │
│     HR/Interviewer adds:                         │
│     • Feedback/notes                             │
│     • Rating (1-5 stars)                         │
│     Decision time! ↓                             │
└──────────────────┬──────────────────────────────┘
                   ↓
            ┌──────┴──────┐
            ↓             ↓
    ┌──────────────┐  ┌──────────────┐
    │   8a. HIRE   │  │  8b. REJECT  │
    │  Status:     │  │  Status:     │
    │   Hired ✅   │  │  Rejected ❌  │
    └──────────────┘  └──────────────┘
            ↓             ↓
    ┌──────────────┐  ┌──────────────┐
    │ Welcome      │  │ Rejection    │
    │ email sent   │  │ email sent   │
    └──────────────┘  └──────────────┘
```

---

## 💡 Quick Start Guide for HR Managers

### **To Schedule a Video Interview:**

**Current Process (Manual):**
1. Go to Recruitment page → Candidates tab
2. Find candidate → Click "Interview" button
3. Fill in form:
   - Date/Time: Select from calendar
   - Duration: 60 minutes (default)
   - Type: Select "Video"
   - Interviewer: Select from dropdown
   - Notes: Add any instructions
4. Click "Schedule Interview"
5. **Manually:**
   - Create Google Meet link (meet.new)
   - Email candidate with link
   - Email interviewer with link
   - Add to calendar

**With Integration (Automatic):**
1. Same steps 1-3 above
2. Select "Auto-generate Google Meet link" ✅
3. Select "Send email invites" ✅
4. Click "Schedule Interview"
5. **System automatically:**
   - Creates Google Meet link ✅
   - Emails candidate with link ✅
   - Emails interviewer with link ✅
   - Creates calendar events ✅
   - Sets reminders ✅

**Time saved: ~5-10 minutes per interview!**

---

## 🚀 Recommended Implementation

### **Best Approach for Your System:**

**Option A: Quick Win (1-2 hours)**
- Add "Video Link" text field to interview form
- HR pastes Google Meet link manually
- Display link in interview details
- No API integration needed
- **Cost:** $0

**Option B: Semi-Automatic (4-6 hours)**
- Use Resend/SendGrid for email
- Auto-send emails with video link
- HR still creates Meet link manually
- **Cost:** ~$10/month for emails

**Option C: Fully Automatic (2-3 days)** ⭐ **RECOMMENDED**
- Google Calendar API integration
- Auto-generate Meet links
- Auto-send email invites
- Calendar integration
- **Cost:** Free (if you have Google Workspace)

---

## 📋 Files to Modify

### **1. Interview Interface** (`recruitmentService.ts`)
```typescript
export interface Interview {
  // ... existing fields ...
  videoLink?: string;
  videoPlatform?: 'google-meet' | 'zoom' | 'teams';
  // ... other new fields ...
}
```

### **2. Interview Form** (`Recruitment/index.tsx`)
```typescript
const [interviewForm, setInterviewForm] = useState({
  scheduledTime: '',
  duration: 60,
  type: 'video',
  interviewerId: '',
  videoLink: '', // NEW
  videoPlatform: 'google-meet', // NEW
  autoGenerateLink: true, // NEW
  sendEmails: true, // NEW
  notes: ''
});
```

### **3. Email Service** (New file: `emailService.ts`)
```typescript
export async function sendInterviewInvite(
  candidate: Candidate,
  interviewer: Employee,
  interview: Interview
) {
  // Send email logic
}
```

### **4. Calendar Integration** (New file: `calendarService.ts`)
```typescript
export async function createGoogleMeetEvent(
  interviewData: Interview
): Promise<string> {
  // Returns Meet link
}
```

---

## ✅ Summary

**Current State:**
- ✅ Can schedule interviews
- ✅ Can track interview status
- ✅ Shows in dashboard/needs attention
- ❌ No auto video links
- ❌ No email automation
- ❌ No calendar integration

**Recommended Next Steps:**
1. **Phase 1** (Quick): Add video link field (HR pastes manually)
2. **Phase 2** (Better): Auto-email with links
3. **Phase 3** (Best): Google Meet auto-generation

**Time to Implement Phase 3:** ~2-3 days  
**Impact:** Save 5-10 min per interview + better candidate experience!

Would you like me to implement any of these phases? 🚀





