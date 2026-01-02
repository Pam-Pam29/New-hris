/// <reference types="vite/client" />

/**
 * Email Service using external email transport (Vercel serverless API)
 * Handles all email communications for the Employee Platform
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

interface PasswordResetData {
  firstName: string;
  email: string;
  resetLink: string;
  companyName: string;
}

interface LeaveRequestData {
  employeeName: string;
  leaveType: string;
  startDate: string;
  endDate: string;
  days: number;
  reason?: string;
  hrEmail: string;
  companyName: string;
}

class EmailService {
  private emailApiUrl: string;
  private emailApiKey?: string;
  private fromEmail: string;
  private fromName: string;

  constructor() {
    this.emailApiUrl = import.meta.env.VITE_EMAIL_API_URL || '/api/send-email';
    this.emailApiKey = import.meta.env.VITE_EMAIL_API_KEY;
    this.fromEmail = import.meta.env.VITE_FROM_EMAIL || 'noreply@yourhris.com';
    this.fromName = import.meta.env.VITE_FROM_NAME || 'Your HRIS';
  }

  /**
   * Check if Email API is configured
   */
  isConfigured(): boolean {
    return !!this.emailApiUrl;
  }

  /**
   * Send email using external API
   */
  private async sendEmail({ to, subject, html, text }: SendEmailParams): Promise<boolean> {
    if (!this.isConfigured()) {
      console.warn('⚠️ [Email] Email API not configured. Email not sent:', { to, subject });
      console.log('📧 [Email] Would have sent:', { to, subject });
      return false;
    }

    try {
      const response = await fetch(this.emailApiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(this.emailApiKey ? { 'x-api-key': this.emailApiKey } : {})
        },
        body: JSON.stringify({
          to,
          subject,
          html,
          text: text || this.stripHtml(html)
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ [Email] API responded with error:', errorText);
        return false;
      }

      console.log('✅ [Email] Email sent successfully to:', to);
      return true;
    } catch (error) {
      console.error('❌ [Email] Error calling email API:', error);
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
   * Send leave request notification to HR
   */
  async sendLeaveRequestNotification(data: LeaveRequestData): Promise<boolean> {
    const { employeeName, leaveType, startDate, endDate, days, reason, hrEmail, companyName } = data;

    const subject = `Leave Request - ${employeeName}`;

    const html = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
    .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
    .info-box { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b; }
    .button { display: inline-block; background: #f59e0b; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; font-weight: bold; }
    .footer { text-align: center; color: #6b7280; font-size: 12px; margin-top: 30px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>📋 New Leave Request</h1>
    </div>
    <div class="content">
      <p>Hi HR Team,</p>
      
      <p><strong>${employeeName}</strong> has submitted a new leave request that requires your review.</p>
      
      <div class="info-box">
        <p><strong>👤 Employee:</strong> ${employeeName}</p>
        <p><strong>📅 Leave Type:</strong> ${leaveType}</p>
        <p><strong>🗓️ Start Date:</strong> ${startDate}</p>
        <p><strong>🗓️ End Date:</strong> ${endDate}</p>
        <p><strong>⏱️ Duration:</strong> ${days} day${days > 1 ? 's' : ''}</p>
        ${reason ? `<p><strong>📝 Reason:</strong> ${reason}</p>` : ''}
      </div>
      
      <div style="text-align: center;">
        <a href="${import.meta.env.VITE_HR_PLATFORM_URL || 'http://localhost:3003'}/leave-management" class="button">Review Request</a>
      </div>
      
      <p>Please review and approve or reject this request at your earliest convenience.</p>
      
      <p>Best regards,<br>
      <strong>${companyName} HRIS</strong></p>
      
      <div class="footer">
        <p>This is an automated notification from ${companyName} HRIS</p>
        <p>Please do not reply to this email</p>
      </div>
    </div>
  </div>
</body>
</html>
    `;

    return this.sendEmail({ to: hrEmail, subject, html });
  }

  /**
   * Send test email to verify configuration
   */
  async sendTestEmail(toEmail: string): Promise<boolean> {
    const subject = 'Test Email - Employee Platform Configuration';
    const html = `
      <h1>✅ Email API Configuration Successful!</h1>
      <p>This is a test email from your Employee Platform.</p>
      <p>If you received this, your email integration is working correctly.</p>
      <p><strong>API Endpoint:</strong> ${this.emailApiUrl}</p>
      <p><strong>From:</strong> ${this.fromEmail}</p>
      <p><strong>To:</strong> ${toEmail}</p>
    `;

    return this.sendEmail({ to: toEmail, subject, html });
  }
}

// Export singleton instance
export const emailService = new EmailService();

// Export types
export type {
  PasswordResetData,
  LeaveRequestData,
  SendEmailParams
};





