/**
 * Email Service using SendGrid
 * Handles all email communications for the HR Platform
 */

interface EmailTemplate {
    subject: string;
    html: string;
    text: string;
}

interface SendEmailParams {
    to: string;
    subject: string;
    html: string;
    text?: string;
}

interface EmployeeInviteData {
    firstName: string;
    lastName: string;
    email: string;
    employeeId: string;
    inviteToken: string;
    companyName: string;
    inviteLink: string;
}

interface PasswordResetData {
    firstName: string;
    email: string;
    resetLink: string;
    companyName: string;
}

interface WelcomeEmailData {
    firstName: string;
    lastName: string;
    email: string;
    companyName: string;
    hrEmail: string;
}

// Phase 1 Critical Email Interfaces
interface LeaveApprovedData {
    employeeName: string;
    email: string;
    leaveType: string;
    startDate: string;
    endDate: string;
    days: number;
    approvedBy: string;
    comments?: string;
    companyName: string;
}

interface LeaveRejectedData {
    employeeName: string;
    email: string;
    leaveType: string;
    startDate: string;
    endDate: string;
    days: number;
    rejectedBy: string;
    reason: string;
    companyName: string;
}

interface MeetingScheduledData {
    employeeName: string;
    email: string;
    meetingTitle: string;
    meetingType: string;
    scheduledDate: string;
    scheduledTime: string;
    duration: number;
    location?: string;
    meetingLink?: string;
    organizer: string;
    agenda?: string;
    companyName: string;
}

interface InterviewInvitationData {
    candidateName: string;
    email: string;
    position: string;
    interviewDate: string;
    interviewTime: string;
    interviewType: 'phone' | 'video' | 'onsite';
    duration: number;
    interviewers: string;
    location?: string;
    meetingLink?: string;
    companyName: string;
}

interface ApplicationReceivedData {
    candidateName: string;
    email: string;
    position: string;
    applicationDate: string;
    companyName: string;
}

interface PayslipAvailableData {
    employeeName: string;
    email: string;
    payPeriod: string;
    payDate: string;
    grossPay: number;
    netPay: number;
    downloadLink: string;
    companyName: string;
}

interface PaymentFailedData {
    employeeName: string;
    email: string;
    amount: number;
    payPeriod: string;
    reason: string;
    actionRequired: string;
    companyName: string;
}

interface TimeAdjustmentData {
    employeeName: string;
    email: string;
    approved: boolean;
    adjustmentDate: string;
    originalTime: string;
    adjustedTime: string;
    reason: string;
    reviewedBy: string;
    comments?: string;
    companyName: string;
}

interface NewPolicyData {
    employeeName: string;
    email: string;
    policyTitle: string;
    policyCategory: string;
    effectiveDate: string;
    acknowledgmentRequired: boolean;
    acknowledgmentDeadline?: string;
    policyLink: string;
    companyName: string;
}

interface AccountLockedData {
    userName: string;
    email: string;
    lockReason: string;
    unlockInstructions: string;
    supportEmail: string;
    companyName: string;
}

interface JobOfferData {
    candidateName: string;
    email: string;
    position: string;
    department: string;
    salary: number;
    startDate: string;
    benefits: string[];
    offerExpiryDate: string;
    companyName: string;
}

interface FirstDayInstructionsData {
    employeeName: string;
    email: string;
    startDate: string;
    startTime: string;
    reportingLocation: string;
    reportingTo: string;
    documentsNeeded: string[];
    parkingInfo?: string;
    dressCode: string;
    companyName: string;
}

class EmailService {
    private sendGridApiKey: string;
    private fromEmail: string;
    private fromName: string;
    private employeePlatformUrl: string;
    private hrPlatformUrl: string;

    constructor() {
        this.sendGridApiKey = import.meta.env.VITE_SENDGRID_API_KEY || '';
        this.fromEmail = import.meta.env.VITE_FROM_EMAIL || 'noreply@yourhris.com';
        this.fromName = import.meta.env.VITE_FROM_NAME || 'Your HRIS';
        this.employeePlatformUrl = import.meta.env.VITE_EMPLOYEE_PLATFORM_URL || 'http://localhost:3005';
        this.hrPlatformUrl = import.meta.env.VITE_HR_PLATFORM_URL || 'http://localhost:3003';
    }

    /**
     * Check if SendGrid is configured
     */
    isConfigured(): boolean {
        return !!this.sendGridApiKey && !!this.fromEmail;
    }

    /**
     * Send email using SendGrid API
     */
    private async sendEmail({ to, subject, html, text }: SendEmailParams): Promise<boolean> {
        if (!this.isConfigured()) {
            console.warn('⚠️ [Email] SendGrid not configured. Email not sent:', { to, subject });
            console.log('📧 [Email] Would have sent:', { to, subject });
            return false;
        }

        try {
            const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.sendGridApiKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    personalizations: [
                        {
                            to: [{ email: to }],
                            subject: subject
                        }
                    ],
                    from: {
                        email: this.fromEmail,
                        name: this.fromName
                    },
                    content: [
                        {
                            type: 'text/plain',
                            value: text || this.stripHtml(html)
                        },
                        {
                            type: 'text/html',
                            value: html
                        }
                    ]
                })
            });

            if (response.ok) {
                console.log('✅ [Email] Email sent successfully to:', to);
                return true;
            } else {
                const error = await response.text();
                console.error('❌ [Email] Failed to send email:', error);
                return false;
            }
        } catch (error) {
            console.error('❌ [Email] Error sending email:', error);
            return false;
        }
    }

    /**
     * Strip HTML tags for plain text version
     */
    private stripHtml(html: string): string {
        return html
            .replace(/<[^>]*>/g, '')
            .replace(/&nbsp;/g, ' ')
            .replace(/&amp;/g, '&')
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
            .trim();
    }

    /**
     * Send employee invitation email
     */
    async sendEmployeeInvite(data: EmployeeInviteData): Promise<boolean> {
        const { firstName, lastName, email, employeeId, inviteLink, companyName } = data;

        const subject = `Welcome to ${companyName} - Complete Your Account Setup`;

        const html = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
    .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
    .info-box { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea; }
    .button { display: inline-block; background: #667eea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; font-weight: bold; }
    .footer { text-align: center; color: #6b7280; font-size: 12px; margin-top: 30px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🎉 Welcome to ${companyName}!</h1>
    </div>
    <div class="content">
      <p>Hi <strong>${firstName} ${lastName}</strong>,</p>
      
      <p>Your employee account has been created! We're excited to have you on the team.</p>
      
      <div class="info-box">
        <p><strong>📧 Your Email:</strong> ${email}</p>
        <p><strong>🆔 Employee ID:</strong> ${employeeId}</p>
      </div>
      
      <p>To get started, please complete your account setup by clicking the button below:</p>
      
      <div style="text-align: center;">
        <a href="${inviteLink}" class="button">Complete Account Setup</a>
      </div>
      
      <p style="font-size: 12px; color: #6b7280;">
        Or copy and paste this link into your browser:<br>
        <span style="word-break: break-all;">${inviteLink}</span>
      </p>
      
      <div class="info-box">
        <p><strong>Next Steps:</strong></p>
        <ol>
          <li>Click the setup link above</li>
          <li>Create a secure password</li>
          <li>Complete your profile information</li>
          <li>Start exploring your employee dashboard</li>
        </ol>
      </div>
      
      <p><strong>Note:</strong> This invitation link is unique to you and will expire after first use.</p>
      
      <p>If you have any questions, please don't hesitate to contact our HR team.</p>
      
      <p>Best regards,<br>
      <strong>${companyName} HR Team</strong></p>
      
      <div class="footer">
        <p>This is an automated message from ${companyName} HRIS</p>
        <p>Please do not reply to this email</p>
      </div>
    </div>
  </div>
</body>
</html>
    `;

        return this.sendEmail({ to: email, subject, html });
    }

    /**
     * Send password reset email
     */
    async sendPasswordReset(data: PasswordResetData): Promise<boolean> {
        const { firstName, email, resetLink, companyName } = data;

        const subject = `Password Reset Request - ${companyName}`;

        const html = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #ef4444; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
    .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
    .warning-box { background: #fef2f2; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ef4444; }
    .button { display: inline-block; background: #ef4444; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; font-weight: bold; }
    .footer { text-align: center; color: #6b7280; font-size: 12px; margin-top: 30px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🔐 Password Reset Request</h1>
    </div>
    <div class="content">
      <p>Hi <strong>${firstName}</strong>,</p>
      
      <p>We received a request to reset your password for your ${companyName} account.</p>
      
      <div style="text-align: center;">
        <a href="${resetLink}" class="button">Reset Password</a>
      </div>
      
      <p style="font-size: 12px; color: #6b7280;">
        Or copy and paste this link into your browser:<br>
        <span style="word-break: break-all;">${resetLink}</span>
      </p>
      
      <div class="warning-box">
        <p><strong>⚠️ Security Notice:</strong></p>
        <ul>
          <li>This link will expire in 1 hour</li>
          <li>If you didn't request this reset, please ignore this email</li>
          <li>Your password will remain unchanged</li>
          <li>Contact HR immediately if you suspect unauthorized access</li>
        </ul>
      </div>
      
      <p>Best regards,<br>
      <strong>${companyName} Security Team</strong></p>
      
      <div class="footer">
        <p>This is an automated message from ${companyName} HRIS</p>
        <p>Please do not reply to this email</p>
      </div>
    </div>
  </div>
</body>
</html>
    `;

        return this.sendEmail({ to: email, subject, html });
    }

    /**
     * Send welcome email after successful setup
     */
    async sendWelcomeEmail(data: WelcomeEmailData): Promise<boolean> {
        const { firstName, lastName, email, companyName, hrEmail } = data;

        const subject = `Welcome to ${companyName}! 🎉`;

        const html = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
    .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
    .feature-box { background: white; padding: 15px; border-radius: 8px; margin: 10px 0; border-left: 4px solid #10b981; }
    .button { display: inline-block; background: #10b981; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; font-weight: bold; }
    .footer { text-align: center; color: #6b7280; font-size: 12px; margin-top: 30px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🎊 You're All Set!</h1>
    </div>
    <div class="content">
      <p>Hi <strong>${firstName}</strong>,</p>
      
      <p>Congratulations! Your ${companyName} employee account is now active and ready to use.</p>
      
      <h3>What You Can Do Now:</h3>
      
      <div class="feature-box">
        <p><strong>📋 Request Leave</strong><br>
        Submit and track your time-off requests</p>
      </div>
      
      <div class="feature-box">
        <p><strong>💰 View Payslips</strong><br>
        Access your salary information and payment history</p>
      </div>
      
      <div class="feature-box">
        <p><strong>⏰ Track Time</strong><br>
        Clock in/out and manage your work hours</p>
      </div>
      
      <div class="feature-box">
        <p><strong>👤 Update Profile</strong><br>
        Keep your personal information up to date</p>
      </div>
      
      <div class="feature-box">
        <p><strong>📊 Performance Reviews</strong><br>
        View goals and track your progress</p>
      </div>
      
      <div style="text-align: center;">
        <a href="${this.employeePlatformUrl}" class="button">Go to Employee Portal</a>
      </div>
      
      <h3>Need Help?</h3>
      <p>If you have any questions or need assistance, please contact our HR team at <a href="mailto:${hrEmail}">${hrEmail}</a></p>
      
      <p>We're here to support you every step of the way!</p>
      
      <p>Best regards,<br>
      <strong>${companyName} Team</strong></p>
      
      <div class="footer">
        <p>This is an automated message from ${companyName} HRIS</p>
        <p>Please do not reply to this email</p>
      </div>
    </div>
  </div>
</body>
</html>
    `;

        return this.sendEmail({ to: email, subject, html });
    }

    /**
     * Send HR account created notification
     */
    async sendHrAccountCreated(data: { firstName: string; lastName: string; email: string; companyName: string }): Promise<boolean> {
        const { firstName, lastName, email, companyName } = data;

        const subject = `HR Account Created - ${companyName}`;

        const html = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
    .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
    .info-box { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #3b82f6; }
    .button { display: inline-block; background: #3b82f6; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; font-weight: bold; }
    .footer { text-align: center; color: #6b7280; font-size: 12px; margin-top: 30px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🎉 HR Account Created!</h1>
    </div>
    <div class="content">
      <p>Hi <strong>${firstName} ${lastName}</strong>,</p>
      
      <p>Your HR administrator account for <strong>${companyName}</strong> has been successfully created!</p>
      
      <div class="info-box">
        <p><strong>📧 Your Login Email:</strong> ${email}</p>
        <p><strong>🔐 Access Level:</strong> HR Administrator</p>
      </div>
      
      <h3>You Can Now:</h3>
      <ul>
        <li>✅ Manage employee profiles</li>
        <li>✅ Approve leave requests</li>
        <li>✅ Post job openings</li>
        <li>✅ Process payroll</li>
        <li>✅ Generate reports</li>
        <li>✅ Configure company settings</li>
      </ul>
      
      <div style="text-align: center;">
        <a href="${this.hrPlatformUrl}" class="button">Access HR Dashboard</a>
      </div>
      
      <p>If you have any questions about using the HR platform, please refer to our documentation or contact support.</p>
      
      <p>Best regards,<br>
      <strong>Your HRIS Team</strong></p>
      
      <div class="footer">
        <p>This is an automated message from ${companyName} HRIS</p>
        <p>Please do not reply to this email</p>
      </div>
    </div>
  </div>
</body>
</html>
    `;

        return this.sendEmail({ to: email, subject, html });
    }

    /**
     * ==================== PHASE 1: CRITICAL EMAILS ====================
     */

    /**
     * 1. Send leave approved notification
     */
    async sendLeaveApproved(data: LeaveApprovedData): Promise<boolean> {
        const { employeeName, email, leaveType, startDate, endDate, days, approvedBy, comments, companyName } = data;

        const subject = `✅ Leave Request Approved - ${companyName}`;

        const html = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
    .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
    .success-box { background: #d1fae5; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #10b981; }
    .info-box { background: white; padding: 15px; border-radius: 8px; margin: 10px 0; }
    .button { display: inline-block; background: #10b981; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; font-weight: bold; }
    .footer { text-align: center; color: #6b7280; font-size: 12px; margin-top: 30px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>✅ Leave Request Approved!</h1>
    </div>
    <div class="content">
      <p>Hi <strong>${employeeName}</strong>,</p>
      
      <div class="success-box">
        <p style="margin: 0; font-size: 18px;"><strong>Good news! Your leave request has been approved.</strong></p>
      </div>
      
      <h3>Leave Details:</h3>
      <div class="info-box">
        <p><strong>📅 Leave Type:</strong> ${leaveType}</p>
        <p><strong>🗓️ Start Date:</strong> ${startDate}</p>
        <p><strong>🗓️ End Date:</strong> ${endDate}</p>
        <p><strong>⏱️ Duration:</strong> ${days} day${days > 1 ? 's' : ''}</p>
        <p><strong>✅ Approved By:</strong> ${approvedBy}</p>
        ${comments ? `<p><strong>💬 Comments:</strong> ${comments}</p>` : ''}
      </div>
      
      <h3>What's Next:</h3>
      <ul>
        <li>Your leave has been added to the team calendar</li>
        <li>Your manager and team have been notified</li>
        <li>Please complete any pending handover tasks</li>
        <li>Enjoy your time off!</li>
      </ul>
      
      <div style="text-align: center;">
        <a href="${this.employeePlatformUrl}/leave" class="button">View Leave Details</a>
      </div>
      
      <p>Have a great time off!</p>
      
      <p>Best regards,<br>
      <strong>${companyName} HR Team</strong></p>
      
      <div class="footer">
        <p>This is an automated message from ${companyName} HRIS</p>
        <p>Please do not reply to this email</p>
      </div>
    </div>
  </div>
</body>
</html>
    `;

        return this.sendEmail({ to: email, subject, html });
    }

    /**
     * 2. Send leave rejected notification
     */
    async sendLeaveRejected(data: LeaveRejectedData): Promise<boolean> {
        const { employeeName, email, leaveType, startDate, endDate, days, rejectedBy, reason, companyName } = data;

        const subject = `❌ Leave Request - Action Required`;

        const html = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
    .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
    .warning-box { background: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b; }
    .info-box { background: white; padding: 15px; border-radius: 8px; margin: 10px 0; }
    .button { display: inline-block; background: #f59e0b; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; font-weight: bold; }
    .footer { text-align: center; color: #6b7280; font-size: 12px; margin-top: 30px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Leave Request Update</h1>
    </div>
    <div class="content">
      <p>Hi <strong>${employeeName}</strong>,</p>
      
      <p>We've reviewed your leave request and unfortunately we cannot approve it at this time.</p>
      
      <h3>Request Details:</h3>
      <div class="info-box">
        <p><strong>📅 Leave Type:</strong> ${leaveType}</p>
        <p><strong>🗓️ Start Date:</strong> ${startDate}</p>
        <p><strong>🗓️ End Date:</strong> ${endDate}</p>
        <p><strong>⏱️ Duration:</strong> ${days} day${days > 1 ? 's' : ''}</p>
        <p><strong>👤 Reviewed By:</strong> ${rejectedBy}</p>
      </div>
      
      <div class="warning-box">
        <p><strong>Reason for Denial:</strong></p>
        <p>${reason}</p>
      </div>
      
      <h3>What You Can Do:</h3>
      <ul>
        <li>Consider submitting a request for different dates</li>
        <li>Discuss alternative arrangements with your manager</li>
        <li>Contact HR if you have questions about this decision</li>
      </ul>
      
      <div style="text-align: center;">
        <a href="${this.employeePlatformUrl}/leave" class="button">Submit New Request</a>
      </div>
      
      <p>We appreciate your understanding.</p>
      
      <p>Best regards,<br>
      <strong>${companyName} HR Team</strong></p>
      
      <div class="footer">
        <p>This is an automated message from ${companyName} HRIS</p>
        <p>Please do not reply to this email</p>
      </div>
    </div>
  </div>
</body>
</html>
    `;

        return this.sendEmail({ to: email, subject, html });
    }

    /**
     * 3. Send meeting scheduled notification
     */
    async sendMeetingScheduled(data: MeetingScheduledData): Promise<boolean> {
        const { employeeName, email, meetingTitle, meetingType, scheduledDate, scheduledTime, duration, location, meetingLink, organizer, agenda, companyName } = data;

        const subject = `📅 Meeting Scheduled: ${meetingTitle}`;

        const html = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
    .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
    .meeting-box { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #3b82f6; }
    .button { display: inline-block; background: #3b82f6; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; font-weight: bold; }
    .footer { text-align: center; color: #6b7280; font-size: 12px; margin-top: 30px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>📅 Meeting Scheduled</h1>
    </div>
    <div class="content">
      <p>Hi <strong>${employeeName}</strong>,</p>
      
      <p>A ${meetingType} meeting has been scheduled with you.</p>
      
      <div class="meeting-box">
        <h3 style="margin-top: 0;">${meetingTitle}</h3>
        <p><strong>📅 Date:</strong> ${scheduledDate}</p>
        <p><strong>🕐 Time:</strong> ${scheduledTime}</p>
        <p><strong>⏱️ Duration:</strong> ${duration} minutes</p>
        <p><strong>👤 Organizer:</strong> ${organizer}</p>
        ${location ? `<p><strong>📍 Location:</strong> ${location}</p>` : ''}
        ${meetingLink ? `<p><strong>🔗 Meeting Link:</strong> <a href="${meetingLink}">${meetingLink}</a></p>` : ''}
        ${agenda ? `<p><strong>📋 Agenda:</strong><br>${agenda}</p>` : ''}
      </div>
      
      <h3>Preparation:</h3>
      <ul>
        <li>Add this meeting to your calendar</li>
        <li>Review any relevant documents</li>
        <li>Prepare questions or topics to discuss</li>
        <li>Join on time</li>
      </ul>
      
      ${meetingLink ? `
      <div style="text-align: center;">
        <a href="${meetingLink}" class="button">Join Meeting</a>
      </div>
      ` : ''}
      
      <p>See you at the meeting!</p>
      
      <p>Best regards,<br>
      <strong>${companyName}</strong></p>
      
      <div class="footer">
        <p>This is an automated message from ${companyName} HRIS</p>
      </div>
    </div>
  </div>
</body>
</html>
    `;

        return this.sendEmail({ to: email, subject, html });
    }

    /**
     * 4. Send meeting reminder (1 hour before)
     */
    async sendMeetingReminder(data: MeetingScheduledData): Promise<boolean> {
        const { employeeName, email, meetingTitle, scheduledTime, meetingLink, location, companyName } = data;

        const subject = `⏰ Reminder: ${meetingTitle} in 1 Hour`;

        const html = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
    .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
    .reminder-box { background: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b; text-align: center; }
    .button { display: inline-block; background: #f59e0b; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; font-weight: bold; }
    .footer { text-align: center; color: #6b7280; font-size: 12px; margin-top: 30px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>⏰ Meeting Reminder</h1>
    </div>
    <div class="content">
      <p>Hi <strong>${employeeName}</strong>,</p>
      
      <div class="reminder-box">
        <h2 style="margin-top: 0; color: #d97706;">${meetingTitle}</h2>
        <p style="font-size: 18px;"><strong>Starting in 1 hour at ${scheduledTime}</strong></p>
      </div>
      
      ${location ? `<p><strong>📍 Location:</strong> ${location}</p>` : ''}
      ${meetingLink ? `<p><strong>🔗 Join Link:</strong> <a href="${meetingLink}">${meetingLink}</a></p>` : ''}
      
      ${meetingLink ? `
      <div style="text-align: center;">
        <a href="${meetingLink}" class="button">Join Now</a>
      </div>
      ` : ''}
      
      <p>See you soon!</p>
      
      <div class="footer">
        <p>This is an automated reminder from ${companyName} HRIS</p>
      </div>
    </div>
  </div>
</body>
</html>
    `;

        return this.sendEmail({ to: email, subject, html });
    }

    /**
     * 5. Send interview invitation to candidate
     */
    async sendInterviewInvitation(data: InterviewInvitationData): Promise<boolean> {
        const { candidateName, email, position, interviewDate, interviewTime, interviewType, duration, interviewers, location, meetingLink, companyName } = data;

        const subject = `Interview Invitation - ${position} at ${companyName}`;

        const html = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
    .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
    .interview-box { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #8b5cf6; }
    .button { display: inline-block; background: #8b5cf6; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; font-weight: bold; }
    .footer { text-align: center; color: #6b7280; font-size: 12px; margin-top: 30px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🎉 Interview Invitation</h1>
    </div>
    <div class="content">
      <p>Dear <strong>${candidateName}</strong>,</p>
      
      <p>Thank you for your interest in the <strong>${position}</strong> position at ${companyName}!</p>
      
      <p>We were impressed with your application and would like to invite you for an interview.</p>
      
      <div class="interview-box">
        <h3 style="margin-top: 0;">Interview Details</h3>
        <p><strong>📅 Date:</strong> ${interviewDate}</p>
        <p><strong>🕐 Time:</strong> ${interviewTime}</p>
        <p><strong>⏱️ Duration:</strong> ${duration} minutes</p>
        <p><strong>📞 Type:</strong> ${interviewType === 'phone' ? 'Phone Interview' : interviewType === 'video' ? 'Video Interview' : 'On-site Interview'}</p>
        <p><strong>👥 Interviewers:</strong> ${interviewers}</p>
        ${location ? `<p><strong>📍 Location:</strong> ${location}</p>` : ''}
        ${meetingLink ? `<p><strong>🔗 Meeting Link:</strong> <a href="${meetingLink}">${meetingLink}</a></p>` : ''}
      </div>
      
      <h3>What to Prepare:</h3>
      <ul>
        <li>Review the job description and company information</li>
        <li>Prepare examples of your relevant experience</li>
        <li>Have questions ready for the interviewers</li>
        <li>${interviewType === 'video' ? 'Test your camera and microphone' : 'Arrive 10 minutes early'}</li>
        <li>Bring a copy of your resume</li>
      </ul>
      
      ${meetingLink ? `
      <div style="text-align: center;">
        <a href="${meetingLink}" class="button">Confirm Attendance</a>
      </div>
      ` : ''}
      
      <p>If you need to reschedule or have any questions, please contact us as soon as possible.</p>
      
      <p>We look forward to meeting you!</p>
      
      <p>Best regards,<br>
      <strong>${companyName} Recruitment Team</strong></p>
      
      <div class="footer">
        <p>This is an automated message from ${companyName}</p>
      </div>
    </div>
  </div>
</body>
</html>
    `;

        return this.sendEmail({ to: email, subject, html });
    }

    /**
     * 6. Send interview reminder (1 day before)
     */
    async sendInterviewReminder(data: InterviewInvitationData): Promise<boolean> {
        const { candidateName, email, position, interviewDate, interviewTime, meetingLink, location, companyName } = data;

        const subject = `Reminder: Interview Tomorrow for ${position}`;

        const html = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
    .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
    .reminder-box { background: #ede9fe; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #8b5cf6; text-align: center; }
    .button { display: inline-block; background: #8b5cf6; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; font-weight: bold; }
    .footer { text-align: center; color: #6b7280; font-size: 12px; margin-top: 30px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>⏰ Interview Tomorrow!</h1>
    </div>
    <div class="content">
      <p>Dear <strong>${candidateName}</strong>,</p>
      
      <div class="reminder-box">
        <h2 style="margin-top: 0; color: #7c3aed;">Your interview is tomorrow!</h2>
        <p style="font-size: 18px;"><strong>${position}</strong></p>
        <p><strong>📅 ${interviewDate} at ${interviewTime}</strong></p>
      </div>
      
      ${location ? `<p><strong>📍 Location:</strong> ${location}</p>` : ''}
      ${meetingLink ? `<p><strong>🔗 Meeting Link:</strong> <a href="${meetingLink}">${meetingLink}</a></p>` : ''}
      
      <h3>Final Checklist:</h3>
      <ul>
        <li>✓ Review company and role information</li>
        <li>✓ Prepare your questions</li>
        <li>✓ Test technology (if virtual interview)</li>
        <li>✓ Choose professional attire</li>
        <li>✓ Get a good night's sleep</li>
      </ul>
      
      ${meetingLink ? `
      <div style="text-align: center;">
        <a href="${meetingLink}" class="button">Join Interview</a>
      </div>
      ` : ''}
      
      <p>Good luck! We're looking forward to meeting you.</p>
      
      <p>Best regards,<br>
      <strong>${companyName} Recruitment Team</strong></p>
      
      <div class="footer">
        <p>This is an automated reminder from ${companyName}</p>
      </div>
    </div>
  </div>
</body>
</html>
    `;

        return this.sendEmail({ to: email, subject, html });
    }

    /**
     * 7. Send application received confirmation
     */
    async sendApplicationReceived(data: ApplicationReceivedData): Promise<boolean> {
        const { candidateName, email, position, applicationDate, companyName } = data;

        const subject = `Application Received - ${position} at ${companyName}`;

        const html = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
    .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
    .success-box { background: #d1fae5; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #10b981; }
    .footer { text-align: center; color: #6b7280; font-size: 12px; margin-top: 30px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>✅ Application Received!</h1>
    </div>
    <div class="content">
      <p>Dear <strong>${candidateName}</strong>,</p>
      
      <div class="success-box">
        <p style="margin: 0; font-size: 16px;">Thank you for your interest in the <strong>${position}</strong> position at ${companyName}!</p>
      </div>
      
      <p>We've successfully received your application on ${applicationDate}.</p>
      
      <h3>What Happens Next:</h3>
      <ol>
        <li><strong>Review:</strong> Our recruitment team will carefully review your application</li>
        <li><strong>Screening:</strong> If you meet our criteria, we'll contact you for next steps</li>
        <li><strong>Timeline:</strong> You can expect to hear from us within 5-7 business days</li>
      </ol>
      
      <p>We appreciate your patience during the review process.</p>
      
      <h3>In the Meantime:</h3>
      <ul>
        <li>Learn more about us on our website</li>
        <li>Connect with us on social media</li>
        <li>Explore other open positions</li>
      </ul>
      
      <p>Thank you for considering ${companyName} for your career!</p>
      
      <p>Best regards,<br>
      <strong>${companyName} Recruitment Team</strong></p>
      
      <div class="footer">
        <p>This is an automated confirmation from ${companyName}</p>
        <p>Please do not reply to this email</p>
      </div>
    </div>
  </div>
</body>
</html>
    `;

        return this.sendEmail({ to: email, subject, html });
    }

    /**
     * 8. Send payslip available notification
     */
    async sendPayslipAvailable(data: PayslipAvailableData): Promise<boolean> {
        const { employeeName, email, payPeriod, payDate, grossPay, netPay, downloadLink, companyName } = data;

        const subject = `💰 Your Payslip is Ready - ${payPeriod}`;

        const html = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
    .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
    .payslip-box { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #10b981; }
    .amount { font-size: 24px; color: #10b981; font-weight: bold; }
    .button { display: inline-block; background: #10b981; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; font-weight: bold; }
    .footer { text-align: center; color: #6b7280; font-size: 12px; margin-top: 30px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>💰 Payslip Ready</h1>
    </div>
    <div class="content">
      <p>Hi <strong>${employeeName}</strong>,</p>
      
      <p>Your payslip for <strong>${payPeriod}</strong> is now available for download.</p>
      
      <div class="payslip-box">
        <h3 style="margin-top: 0;">Payment Summary</h3>
        <p><strong>📅 Pay Period:</strong> ${payPeriod}</p>
        <p><strong>💵 Gross Pay:</strong> $${grossPay.toLocaleString()}</p>
        <p><strong>💰 Net Pay:</strong> <span class="amount">$${netPay.toLocaleString()}</span></p>
        <p><strong>🏦 Payment Date:</strong> ${payDate}</p>
      </div>
      
      <div style="text-align: center;">
        <a href="${downloadLink}" class="button">Download Payslip</a>
      </div>
      
      <p><strong>Important:</strong> Please review your payslip and contact HR if you notice any discrepancies.</p>
      
      <h3>Need Help?</h3>
      <ul>
        <li>Questions about deductions? Contact HR</li>
        <li>Tax-related queries? Consult with accounting</li>
        <li>Payment issues? Reach out to payroll team</li>
      </ul>
      
      <p>Best regards,<br>
      <strong>${companyName} Payroll Team</strong></p>
      
      <div class="footer">
        <p>This is an automated message from ${companyName} HRIS</p>
        <p>Keep your payslips confidential and secure</p>
      </div>
    </div>
  </div>
</body>
</html>
    `;

        return this.sendEmail({ to: email, subject, html });
    }

    /**
     * 9. Send payment failed alert
     */
    async sendPaymentFailed(data: PaymentFailedData): Promise<boolean> {
        const { employeeName, email, amount, payPeriod, reason, actionRequired, companyName } = data;

        const subject = `⚠️ URGENT: Payment Issue - Action Required`;

        const html = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #ef4444; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
    .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
    .alert-box { background: #fef2f2; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ef4444; }
    .action-box { background: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b; }
    .button { display: inline-block; background: #ef4444; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; font-weight: bold; }
    .footer { text-align: center; color: #6b7280; font-size: 12px; margin-top: 30px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>⚠️ Payment Issue</h1>
    </div>
    <div class="content">
      <p>Hi <strong>${employeeName}</strong>,</p>
      
      <div class="alert-box">
        <p style="margin: 0; font-size: 16px; font-weight: bold;">We encountered an issue processing your payment for ${payPeriod}.</p>
      </div>
      
      <h3>Payment Details:</h3>
      <p><strong>💰 Amount:</strong> $${amount.toLocaleString()}</p>
      <p><strong>📅 Pay Period:</strong> ${payPeriod}</p>
      <p><strong>❌ Issue:</strong> ${reason}</p>
      
      <div class="action-box">
        <h3 style="margin-top: 0;">⚡ Immediate Action Required:</h3>
        <p>${actionRequired}</p>
      </div>
      
      <h3>What to Do Now:</h3>
      <ol>
        <li>Verify your bank account details in the system</li>
        <li>Contact HR or Payroll immediately</li>
        <li>Update any incorrect information</li>
        <li>We'll reprocess your payment once resolved</li>
      </ol>
      
      <div style="text-align: center;">
        <a href="${this.employeePlatformUrl}/profile" class="button">Update Bank Details</a>
      </div>
      
      <p><strong>We apologize for any inconvenience and will resolve this as quickly as possible.</strong></p>
      
      <p>For immediate assistance, contact:<br>
      <strong>Payroll Team: payroll@${companyName.toLowerCase().replace(/\s+/g, '')}.com</strong></p>
      
      <p>Best regards,<br>
      <strong>${companyName} Payroll Team</strong></p>
      
      <div class="footer">
        <p>This is an urgent notification from ${companyName} HRIS</p>
      </div>
    </div>
  </div>
</body>
</html>
    `;

        return this.sendEmail({ to: email, subject, html });
    }

    /**
     * 10. Send time adjustment approved/rejected notification
     */
    async sendTimeAdjustment(data: TimeAdjustmentData): Promise<boolean> {
        const { employeeName, email, approved, adjustmentDate, originalTime, adjustedTime, reason, reviewedBy, comments, companyName } = data;

        const subject = approved
            ? `✅ Time Adjustment Approved`
            : `❌ Time Adjustment Not Approved`;

        const headerColor = approved ? '#10b981' : '#f59e0b';
        const boxColor = approved ? '#d1fae5' : '#fef3c7';

        const html = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, ${headerColor} 0%, ${headerColor}dd 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
    .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
    .status-box { background: ${boxColor}; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid ${headerColor}; }
    .info-box { background: white; padding: 15px; border-radius: 8px; margin: 10px 0; }
    .button { display: inline-block; background: ${headerColor}; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; font-weight: bold; }
    .footer { text-align: center; color: #6b7280; font-size: 12px; margin-top: 30px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>${approved ? '✅' : '❌'} Time Adjustment ${approved ? 'Approved' : 'Update'}</h1>
    </div>
    <div class="content">
      <p>Hi <strong>${employeeName}</strong>,</p>
      
      <div class="status-box">
        <p style="margin: 0; font-size: 16px;">
          Your time adjustment request has been <strong>${approved ? 'approved' : 'reviewed'}</strong>.
        </p>
      </div>
      
      <h3>Adjustment Details:</h3>
      <div class="info-box">
        <p><strong>📅 Date:</strong> ${adjustmentDate}</p>
        <p><strong>⏰ Original Time:</strong> ${originalTime}</p>
        <p><strong>⏰ ${approved ? 'New' : 'Requested'} Time:</strong> ${adjustedTime}</p>
        <p><strong>📝 Reason:</strong> ${reason}</p>
        <p><strong>👤 Reviewed By:</strong> ${reviewedBy}</p>
        ${comments ? `<p><strong>💬 Comments:</strong> ${comments}</p>` : ''}
      </div>
      
      ${approved ? `
        <p>Your timesheet has been updated with the approved adjustment.</p>
      ` : `
        <p>If you have questions about this decision, please contact your manager or HR.</p>
      `}
      
      <div style="text-align: center;">
        <a href="${this.employeePlatformUrl}/time" class="button">View Timesheet</a>
      </div>
      
      <p>Best regards,<br>
      <strong>${companyName} HR Team</strong></p>
      
      <div class="footer">
        <p>This is an automated message from ${companyName} HRIS</p>
      </div>
    </div>
  </div>
</body>
</html>
    `;

        return this.sendEmail({ to: email, subject, html });
    }

    /**
     * 11. Send new policy notification with acknowledgment requirement
     */
    async sendNewPolicy(data: NewPolicyData): Promise<boolean> {
        const { employeeName, email, policyTitle, policyCategory, effectiveDate, acknowledgmentRequired, acknowledgmentDeadline, policyLink, companyName } = data;

        const subject = `📋 New Policy: ${policyTitle}`;

        const html = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
    .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
    .policy-box { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #6366f1; }
    .important-box { background: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b; }
    .button { display: inline-block; background: #6366f1; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; font-weight: bold; }
    .footer { text-align: center; color: #6b7280; font-size: 12px; margin-top: 30px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>📋 New Company Policy</h1>
    </div>
    <div class="content">
      <p>Hi <strong>${employeeName}</strong>,</p>
      
      <p>A new company policy has been published and requires your attention.</p>
      
      <div class="policy-box">
        <h3 style="margin-top: 0;">${policyTitle}</h3>
        <p><strong>📂 Category:</strong> ${policyCategory}</p>
        <p><strong>📅 Effective Date:</strong> ${effectiveDate}</p>
      </div>
      
      ${acknowledgmentRequired ? `
      <div class="important-box">
        <p style="margin: 0; font-weight: bold;">⚠️ Action Required</p>
        <p style="margin: 10px 0 0 0;">You must read and acknowledge this policy ${acknowledgmentDeadline ? `by ${acknowledgmentDeadline}` : 'as soon as possible'}.</p>
      </div>
      ` : ''}
      
      <h3>What You Need to Do:</h3>
      <ol>
        <li>Click the button below to read the policy</li>
        <li>Review the policy carefully</li>
        ${acknowledgmentRequired ? '<li>Acknowledge that you have read and understood it</li>' : ''}
        <li>Contact HR if you have any questions</li>
      </ol>
      
      <div style="text-align: center;">
        <a href="${policyLink}" class="button">${acknowledgmentRequired ? 'Read & Acknowledge Policy' : 'Read Policy'}</a>
      </div>
      
      <p><strong>Why This Matters:</strong></p>
      <p>Our policies help create a fair, safe, and productive workplace for everyone. Please take time to understand how this policy affects you.</p>
      
      <p>Questions? Contact HR at hr@${companyName.toLowerCase().replace(/\s+/g, '')}.com</p>
      
      <p>Best regards,<br>
      <strong>${companyName} HR Team</strong></p>
      
      <div class="footer">
        <p>This is an official notice from ${companyName}</p>
      </div>
    </div>
  </div>
</body>
</html>
    `;

        return this.sendEmail({ to: email, subject, html });
    }

    /**
     * 12. Send account locked notification
     */
    async sendAccountLocked(data: AccountLockedData): Promise<boolean> {
        const { userName, email, lockReason, unlockInstructions, supportEmail, companyName } = data;

        const subject = `🔒 Account Locked - Immediate Action Required`;

        const html = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #ef4444; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
    .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
    .alert-box { background: #fef2f2; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ef4444; }
    .action-box { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #3b82f6; }
    .button { display: inline-block; background: #3b82f6; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; font-weight: bold; }
    .footer { text-align: center; color: #6b7280; font-size: 12px; margin-top: 30px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🔒 Account Locked</h1>
    </div>
    <div class="content">
      <p>Hi <strong>${userName}</strong>,</p>
      
      <div class="alert-box">
        <p style="margin: 0; font-size: 16px; font-weight: bold;">Your account has been temporarily locked.</p>
      </div>
      
      <h3>Reason:</h3>
      <p>${lockReason}</p>
      
      <div class="action-box">
        <h3 style="margin-top: 0;">How to Unlock Your Account:</h3>
        <p>${unlockInstructions}</p>
      </div>
      
      <h3>Security Tips:</h3>
      <ul>
        <li>Never share your password with anyone</li>
        <li>Use a strong, unique password</li>
        <li>Enable two-factor authentication if available</li>
        <li>Be cautious of phishing attempts</li>
      </ul>
      
      <p><strong>Need Help?</strong></p>
      <p>Contact IT Support immediately:<br>
      📧 <a href="mailto:${supportEmail}">${supportEmail}</a></p>
      
      <p><strong>Didn't request this?</strong> If you didn't attempt to login or suspect unauthorized access, contact IT Support immediately.</p>
      
      <p>Best regards,<br>
      <strong>${companyName} IT Security Team</strong></p>
      
      <div class="footer">
        <p>This is a security notification from ${companyName}</p>
      </div>
    </div>
  </div>
</body>
</html>
    `;

        return this.sendEmail({ to: email, subject, html });
    }

    /**
     * 13. Send job offer letter
     */
    async sendJobOffer(data: JobOfferData): Promise<boolean> {
        const { candidateName, email, position, department, salary, startDate, benefits, offerExpiryDate, companyName } = data;

        const subject = `🎉 Job Offer - ${position} at ${companyName}`;

        const html = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
    .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
    .offer-box { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #10b981; }
    .highlight { font-size: 24px; color: #10b981; font-weight: bold; }
    .button { display: inline-block; background: #10b981; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; font-weight: bold; }
    .footer { text-align: center; color: #6b7280; font-size: 12px; margin-top: 30px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🎉 Congratulations!</h1>
    </div>
    <div class="content">
      <p>Dear <strong>${candidateName}</strong>,</p>
      
      <p>We are delighted to offer you the position of <strong>${position}</strong> at ${companyName}!</p>
      
      <div class="offer-box">
        <h3 style="margin-top: 0;">Position Details</h3>
        <p><strong>📋 Position:</strong> ${position}</p>
        <p><strong>🏢 Department:</strong> ${department}</p>
        <p><strong>💰 Annual Salary:</strong> <span class="highlight">$${salary.toLocaleString()}</span></p>
        <p><strong>📅 Start Date:</strong> ${startDate}</p>
      </div>
      
      <h3>Benefits Package:</h3>
      <ul>
        ${benefits.map(benefit => `<li>${benefit}</li>`).join('')}
      </ul>
      
      <div style="background: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0;">
        <p style="margin: 0;"><strong>⏰ This offer expires on ${offerExpiryDate}</strong></p>
        <p style="margin: 10px 0 0 0;">Please respond by this date to accept the position.</p>
      </div>
      
      <h3>Next Steps:</h3>
      <ol>
        <li>Review the formal offer letter attached</li>
        <li>Sign and return the offer letter</li>
        <li>Complete pre-employment requirements</li>
        <li>Prepare for your first day!</li>
      </ol>
      
      <div style="text-align: center;">
        <a href="${this.hrPlatformUrl}/recruitment/offers" class="button">View & Accept Offer</a>
      </div>
      
      <p>We're excited to have you join our team! If you have any questions, please don't hesitate to reach out.</p>
      
      <p>Welcome to ${companyName}!</p>
      
      <p>Best regards,<br>
      <strong>${companyName} Recruitment Team</strong></p>
      
      <div class="footer">
        <p>This is an official offer from ${companyName}</p>
      </div>
    </div>
  </div>
</body>
</html>
    `;

        return this.sendEmail({ to: email, subject, html });
    }

    /**
     * 14. Send first day instructions
     */
    async sendFirstDayInstructions(data: FirstDayInstructionsData): Promise<boolean> {
        const { employeeName, email, startDate, startTime, reportingLocation, reportingTo, documentsNeeded, parkingInfo, dressCode, companyName } = data;

        const subject = `👋 Welcome! Your First Day at ${companyName} - ${startDate}`;

        const html = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
    .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
    .info-box { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #3b82f6; }
    .checklist { background: #dbeafe; padding: 15px; border-radius: 8px; margin: 10px 0; }
    .footer { text-align: center; color: #6b7280; font-size: 12px; margin-top: 30px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>👋 Welcome to ${companyName}!</h1>
    </div>
    <div class="content">
      <p>Hi <strong>${employeeName}</strong>,</p>
      
      <p>We're excited to have you join our team! Here's everything you need to know for your first day.</p>
      
      <div class="info-box">
        <h3 style="margin-top: 0;">📅 First Day Details</h3>
        <p><strong>Date:</strong> ${startDate}</p>
        <p><strong>Time:</strong> ${startTime}</p>
        <p><strong>Location:</strong> ${reportingLocation}</p>
        <p><strong>Report to:</strong> ${reportingTo}</p>
        ${parkingInfo ? `<p><strong>Parking:</strong> ${parkingInfo}</p>` : ''}
        <p><strong>Dress Code:</strong> ${dressCode}</p>
      </div>
      
      <h3>📋 What to Bring:</h3>
      <div class="checklist">
        <ul style="margin: 0;">
          ${documentsNeeded.map(doc => `<li>${doc}</li>`).join('')}
        </ul>
      </div>
      
      <h3>⏰ Your First Day Schedule:</h3>
      <ul>
        <li><strong>9:00 AM:</strong> Arrive and check-in at reception</li>
        <li><strong>9:15 AM:</strong> Meet with ${reportingTo}</li>
        <li><strong>10:00 AM:</strong> Office tour and introductions</li>
        <li><strong>11:00 AM:</strong> HR orientation session</li>
        <li><strong>12:30 PM:</strong> Lunch with the team</li>
        <li><strong>2:00 PM:</strong> IT setup and system access</li>
        <li><strong>4:00 PM:</strong> Department overview</li>
        <li><strong>5:00 PM:</strong> Q&A and wrap-up</li>
      </ul>
      
      <h3>💡 Pro Tips:</h3>
      <ul>
        <li>Arrive 15 minutes early</li>
        <li>Bring a notebook and pen</li>
        <li>Don't hesitate to ask questions</li>
        <li>Be yourself and have fun!</li>
      </ul>
      
      <div style="background: #d1fae5; padding: 15px; border-radius: 8px; margin: 20px 0;">
        <p style="margin: 0;"><strong>Questions?</strong> Contact HR at hr@${companyName.toLowerCase().replace(/\s+/g, '')}.com or call us at [phone]</p>
      </div>
      
      <p>We're looking forward to seeing you!</p>
      
      <p>Best regards,<br>
      <strong>${companyName} Team</strong></p>
      
      <div class="footer">
        <p>This is an automated message from ${companyName}</p>
      </div>
    </div>
  </div>
</body>
</html>
    `;

        return this.sendEmail({ to: email, subject, html });
    }

    /**
     * Send test email to verify configuration
     */
    async sendTestEmail(toEmail: string): Promise<boolean> {
        const subject = 'Test Email - HRIS Configuration';
        const html = `
      <h1>✅ SendGrid Configuration Successful!</h1>
      <p>This is a test email from your HRIS system.</p>
      <p>If you received this, your email integration is working correctly.</p>
      <p><strong>From:</strong> ${this.fromEmail}</p>
      <p><strong>To:</strong> ${toEmail}</p>
      <p><strong>SendGrid:</strong> Configured ✅</p>
    `;

        return this.sendEmail({ to: toEmail, subject, html });
    }
}

// Export singleton instance
export const emailService = new EmailService();

// Export types
export type {
    EmployeeInviteData,
    PasswordResetData,
    WelcomeEmailData,
    SendEmailParams,
    // Phase 1 Critical Email Types
    LeaveApprovedData,
    LeaveRejectedData,
    MeetingScheduledData,
    InterviewInvitationData,
    ApplicationReceivedData,
    PayslipAvailableData,
    PaymentFailedData,
    TimeAdjustmentData,
    NewPolicyData,
    AccountLockedData,
    JobOfferData,
    FirstDayInstructionsData
};

