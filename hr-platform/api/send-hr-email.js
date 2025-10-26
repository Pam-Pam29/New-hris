import { Resend } from 'resend';

// Initialize Resend with API key from environment variables
const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { emailType, recipient, data } = req.body;

    // Validate required fields
    if (!emailType || !recipient) {
      return res.status(400).json({
        error: 'Missing required fields: emailType, recipient'
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(recipient.email)) {
      return res.status(400).json({
        error: 'Invalid email format'
      });
    }

    console.log('📧 [Vercel Function] Sending HR email:', { emailType, to: recipient.email });

    // Generate email content based on type
    let emailContent;
    switch (emailType) {
      case 'employee_invitation':
        emailContent = generateEmployeeInvitationEmail(data);
        break;
      case 'leave_approved':
        emailContent = generateLeaveApprovedEmail(data);
        break;
      case 'leave_rejected':
        emailContent = generateLeaveRejectedEmail(data);
        break;
      case 'meeting_scheduled':
        emailContent = generateMeetingScheduledEmail(data);
        break;
      case 'interview_invitation':
        emailContent = generateInterviewInvitationEmail(data);
        break;
      case 'application_received':
        emailContent = generateApplicationReceivedEmail(data);
        break;
      case 'payslip_available':
        emailContent = generatePayslipAvailableEmail(data);
        break;
      case 'payment_failed':
        emailContent = generatePaymentFailedEmail(data);
        break;
      case 'time_adjustment':
        emailContent = generateTimeAdjustmentEmail(data);
        break;
      case 'new_policy':
        emailContent = generateNewPolicyEmail(data);
        break;
      case 'account_locked':
        emailContent = generateAccountLockedEmail(data);
        break;
      case 'job_offer':
        emailContent = generateJobOfferEmail(data);
        break;
      case 'first_day_instructions':
        emailContent = generateFirstDayInstructionsEmail(data);
        break;
      // Contract management emails
      case 'contract_status_changed':
        emailContent = generateContractStatusChangedEmail(data);
        break;
      case 'contract_signed':
        emailContent = generateContractSignedEmail(data);
        break;
      case 'contract_expiry_reminder':
        emailContent = generateContractExpiryReminderEmail(data);
        break;
      // Performance management emails
      case 'performance_review_scheduled':
        emailContent = generatePerformanceReviewScheduledEmail(data);
        break;
      case 'performance_review_reminder':
        emailContent = generatePerformanceReviewReminderEmail(data);
        break;
      case 'performance_goal_assigned':
        emailContent = generatePerformanceGoalAssignedEmail(data);
        break;
      case 'performance_improvement_plan':
        emailContent = generatePerformanceImprovementPlanEmail(data);
        break;
      case 'performance_meeting_reminder':
        emailContent = generatePerformanceMeetingReminderEmail(data);
        break;
      // Asset management emails
      case 'asset_assigned':
        emailContent = generateAssetAssignedEmail(data);
        break;
      case 'asset_return_reminder':
        emailContent = generateAssetReturnReminderEmail(data);
        break;
      case 'asset_maintenance_required':
        emailContent = generateAssetMaintenanceRequiredEmail(data);
        break;
      // Security emails
      case 'password_reset':
        emailContent = generatePasswordResetEmail(data);
        break;
      case 'login_attempt_failed':
        emailContent = generateLoginAttemptFailedEmail(data);
        break;
      case 'account_suspended':
        emailContent = generateAccountSuspendedEmail(data);
        break;
      // Recruitment emails (connected to primary service)
      case 'interview_reminder':
        emailContent = generateInterviewReminderEmail(data);
        break;
      case 'interview_feedback':
        emailContent = generateInterviewFeedbackEmail(data);
        break;
      case 'application_rejected':
        emailContent = generateApplicationRejectedEmail(data);
        break;
      case 'background_check_required':
        emailContent = generateBackgroundCheckRequiredEmail(data);
        break;
      // Compliance & training emails
      case 'training_required':
        emailContent = generateTrainingRequiredEmail(data);
        break;
      case 'training_reminder':
        emailContent = generateTrainingReminderEmail(data);
        break;
      case 'compliance_certificate_expiry':
        emailContent = generateComplianceCertificateExpiryEmail(data);
        break;
      // System & maintenance emails
      case 'system_maintenance_notice':
        emailContent = generateSystemMaintenanceNoticeEmail(data);
        break;
      case 'profile_update_reminder':
        emailContent = generateProfileUpdateReminderEmail(data);
        break;
      default:
        return res.status(400).json({
          error: 'Invalid email type'
        });
    }

    // Send email using Resend
    const { data: emailData, error } = await resend.emails.send({
      from: `HRIS System <${process.env.FROM_EMAIL || 'noreply@resend.dev'}>`,
      to: [recipient.email],
      subject: emailContent.subject,
      html: emailContent.html,
    });

    if (error) {
      console.error('❌ [Vercel Function] Resend error:', error);
      return res.status(500).json({
        error: 'Failed to send email',
        details: error.message
      });
    }

    console.log('✅ [Vercel Function] HR email sent successfully:', emailData);

    return res.status(200).json({
      success: true,
      messageId: emailData.id,
      message: 'HR email sent successfully'
    });

  } catch (error) {
    console.error('❌ [Vercel Function] Unexpected error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      details: error.message
    });
  }
}

// Email template functions
function generateEmployeeInvitationEmail(data) {
  const {
    employeeName = 'Employee',
    employeeId = 'N/A',
    setupLink = '#',
    companyName = 'Company',
    position = 'Employee'
  } = data;

  return {
    subject: `Welcome to ${companyName} - Complete Your Account Setup`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Welcome to ${companyName}</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #4f46e5; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
          .button { display: inline-block; background: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Welcome to ${companyName}!</h1>
          </div>
          <div class="content">
            <h2>Hello ${employeeName}!</h2>
            <p>Welcome to ${companyName}! We're excited to have you join our team as a ${position}.</p>
            
            <p><strong>Your Employee ID:</strong> ${employeeId}</p>
            
            <p>To get started, please complete your account setup by clicking the button below:</p>
            
            <a href="${setupLink}" class="button">Complete Account Setup</a>
            
            <p><strong>Important:</strong> This setup link will expire in 7 days. Please complete your account setup as soon as possible.</p>
            
            <p>If you have any questions or need assistance, please don't hesitate to contact HR.</p>
            
            <p>Best regards,<br>
            The HR Team<br>
            ${companyName}</p>
          </div>
          <div class="footer">
            <p>This is an automated message from the HRIS system. Please do not reply to this email.</p>
          </div>
        </div>
      </body>
      </html>
    `
  };
}

function generateLeaveApprovedEmail(data) {
  const {
    employeeName = 'Employee',
    leaveType = 'Leave',
    startDate = 'N/A',
    endDate = 'N/A',
    companyName = 'Company'
  } = data;

  return {
    subject: `Leave Request Approved - ${companyName}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #4f46e5;">Leave Request Approved</h2>
        <p>Hello ${employeeName},</p>
        <p>Your ${leaveType} leave request has been approved.</p>
        <p><strong>Leave Period:</strong> ${startDate} to ${endDate}</p>
        <p>Please ensure all your work is completed before your leave begins.</p>
        <p>Best regards,<br>HR Team</p>
      </div>
    `
  };
}

function generateLeaveRejectedEmail(data) {
  const {
    employeeName = 'Employee',
    leaveType = 'Leave',
    startDate = 'N/A',
    endDate = 'N/A',
    reason = 'No reason provided',
    companyName = 'Company'
  } = data;

  return {
    subject: `Leave Request Update - ${companyName}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #dc2626;">Leave Request Update</h2>
        <p>Hello ${employeeName},</p>
        <p>Unfortunately, your ${leaveType} leave request for ${startDate} to ${endDate} could not be approved at this time.</p>
        <p><strong>Reason:</strong> ${reason}</p>
        <p>Please contact HR if you have any questions or would like to discuss alternative arrangements.</p>
        <p>Best regards,<br>HR Team</p>
      </div>
    `
  };
}

function generateMeetingScheduledEmail(data) {
  const {
    employeeName = 'Employee',
    meetingTitle = 'Meeting',
    meetingDate = 'N/A',
    meetingTime = 'N/A',
    location = 'TBD',
    companyName = 'Company'
  } = data;

  return {
    subject: `Meeting Scheduled: ${meetingTitle}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #4f46e5;">Meeting Scheduled</h2>
        <p>Hello ${employeeName},</p>
        <p>A meeting has been scheduled for you:</p>
        <p><strong>Meeting:</strong> ${meetingTitle}</p>
        <p><strong>Date:</strong> ${meetingDate}</p>
        <p><strong>Time:</strong> ${meetingTime}</p>
        <p><strong>Location:</strong> ${location}</p>
        <p>Please add this to your calendar and let us know if you have any conflicts.</p>
        <p>Best regards,<br>HR Team</p>
      </div>
    `
  };
}

function generateInterviewInvitationEmail(data) {
  const {
    candidateName = 'Candidate',
    position = 'Position',
    interviewDate = 'N/A',
    interviewTime = 'N/A',
    location = 'TBD',
    companyName = 'Company'
  } = data;

  return {
    subject: `Interview Invitation - ${position} at ${companyName}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #4f46e5;">Interview Invitation</h2>
        <p>Hello ${candidateName},</p>
        <p>Thank you for your interest in the ${position} position at ${companyName}.</p>
        <p>We would like to invite you for an interview:</p>
        <p><strong>Position:</strong> ${position}</p>
        <p><strong>Date:</strong> ${interviewDate}</p>
        <p><strong>Time:</strong> ${interviewTime}</p>
        <p><strong>Location:</strong> ${location}</p>
        <p>Please confirm your attendance by replying to this email.</p>
        <p>Best regards,<br>HR Team</p>
      </div>
    `
  };
}

function generateApplicationReceivedEmail(data) {
  const {
    candidateName = 'Candidate',
    position = 'Position',
    companyName = 'Company'
  } = data;

  return {
    subject: `Application Received - ${position} at ${companyName}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #4f46e5;">Application Received</h2>
        <p>Hello ${candidateName},</p>
        <p>Thank you for your application for the ${position} position at ${companyName}.</p>
        <p>We have received your application and will review it carefully. We will contact you within 5-7 business days with an update.</p>
        <p>Best regards,<br>HR Team</p>
      </div>
    `
  };
}

function generatePayslipAvailableEmail(data) {
  const {
    employeeName = 'Employee',
    payPeriod = 'Current Period',
    companyName = 'Company'
  } = data;

  return {
    subject: `Payslip Available - ${payPeriod}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #4f46e5;">Payslip Available</h2>
        <p>Hello ${employeeName},</p>
        <p>Your payslip for ${payPeriod} is now available in your employee portal.</p>
        <p>Please log in to view and download your payslip.</p>
        <p>Best regards,<br>HR Team</p>
      </div>
    `
  };
}

function generatePaymentFailedEmail(data) {
  const {
    employeeName = 'Employee',
    payPeriod = 'Current Period',
    companyName = 'Company'
  } = data;

  return {
    subject: `Payment Issue - ${payPeriod}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #dc2626;">Payment Issue</h2>
        <p>Hello ${employeeName},</p>
        <p>We encountered an issue processing your payment for ${payPeriod}.</p>
        <p>Please contact HR immediately to resolve this matter.</p>
        <p>Best regards,<br>HR Team</p>
      </div>
    `
  };
}

function generateTimeAdjustmentEmail(data) {
  const {
    employeeName = 'Employee',
    adjustmentDate = 'N/A',
    adjustmentType = 'Time Adjustment',
    companyName = 'Company'
  } = data;

  return {
    subject: `Time Adjustment - ${adjustmentDate}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #4f46e5;">Time Adjustment</h2>
        <p>Hello ${employeeName},</p>
        <p>A time adjustment has been made to your timesheet for ${adjustmentDate}.</p>
        <p><strong>Adjustment Type:</strong> ${adjustmentType}</p>
        <p>Please log in to review the changes.</p>
        <p>Best regards,<br>HR Team</p>
      </div>
    `
  };
}

function generateNewPolicyEmail(data) {
  const {
    employeeName = 'Employee',
    policyTitle = 'New Policy',
    policyDescription = 'Please review the new policy.',
    companyName = 'Company'
  } = data;

  return {
    subject: `New Policy: ${policyTitle}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #4f46e5;">New Policy Notification</h2>
        <p>Hello ${employeeName},</p>
        <p>A new policy has been added: <strong>${policyTitle}</strong></p>
        <p>${policyDescription}</p>
        <p>Please review the full policy in your employee portal and acknowledge receipt.</p>
        <p>Best regards,<br>HR Team</p>
      </div>
    `
  };
}

function generateAccountLockedEmail(data) {
  const {
    employeeName = 'Employee',
    companyName = 'Company'
  } = data;

  return {
    subject: `Account Security Alert - ${companyName}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #dc2626;">Account Security Alert</h2>
        <p>Hello ${employeeName},</p>
        <p>Your account has been temporarily locked due to multiple failed login attempts.</p>
        <p>Please contact HR to unlock your account and reset your password.</p>
        <p>Best regards,<br>HR Team</p>
      </div>
    `
  };
}

function generateJobOfferEmail(data) {
  const {
    candidateName = 'Candidate',
    position = 'Position',
    offerDetails = 'Please see attached offer details.',
    companyName = 'Company'
  } = data;

  return {
    subject: `Job Offer - ${position} at ${companyName}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #4f46e5;">Job Offer</h2>
        <p>Hello ${candidateName},</p>
        <p>Congratulations! We are pleased to offer you the position of ${position} at ${companyName}.</p>
        <p>${offerDetails}</p>
        <p>Please review the offer details and respond within 5 business days.</p>
        <p>Best regards,<br>HR Team</p>
      </div>
    `
  };
}

function generateFirstDayInstructionsEmail(data) {
  const {
    employeeName = 'Employee',
    startDate = 'N/A',
    startTime = 'N/A',
    location = 'TBD',
    companyName = 'Company'
  } = data;

  return {
    subject: `First Day Instructions - ${companyName}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #4f46e5;">First Day Instructions</h2>
        <p>Hello ${employeeName},</p>
        <p>Welcome to ${companyName}! We're excited for your first day.</p>
        <p><strong>Start Date:</strong> ${startDate}</p>
        <p><strong>Start Time:</strong> ${startTime}</p>
        <p><strong>Location:</strong> ${location}</p>
        <p>Please bring a valid ID and any required documents mentioned in your offer letter.</p>
        <p>Best regards,<br>HR Team</p>
      </div>
    `
  };
}

// Contract management email templates
function generateContractStatusChangedEmail(data) {
  const {
    employeeName = 'Employee',
    contractStatus = 'Updated',
    previousStatus = 'Previous',
    companyName = 'Company',
    effectiveDate = 'N/A'
  } = data;

  return {
    subject: `Contract Status Update - ${companyName}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #4f46e5;">Contract Status Update</h2>
        <p>Hello ${employeeName},</p>
        <p>Your contract status has been updated.</p>
        <p><strong>Previous Status:</strong> ${previousStatus}</p>
        <p><strong>New Status:</strong> ${contractStatus}</p>
        <p><strong>Effective Date:</strong> ${effectiveDate}</p>
        <p>Please contact HR if you have any questions about this change.</p>
        <p>Best regards,<br>HR Team<br>${companyName}</p>
      </div>
    `
  };
}

function generateContractSignedEmail(data) {
  const {
    employeeName = 'Employee',
    contractTitle = 'Employment Contract',
    signedDate = 'N/A',
    companyName = 'Company'
  } = data;

  return {
    subject: `Contract Signed - ${contractTitle}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #10b981;">Contract Signed Successfully</h2>
        <p>Hello ${employeeName},</p>
        <p>Congratulations! Your contract has been successfully signed.</p>
        <p><strong>Contract:</strong> ${contractTitle}</p>
        <p><strong>Signed Date:</strong> ${signedDate}</p>
        <p>You should receive a copy of the signed contract shortly.</p>
        <p>Best regards,<br>HR Team<br>${companyName}</p>
      </div>
    `
  };
}

function generateContractExpiryReminderEmail(data) {
  const {
    employeeName = 'Employee',
    contractTitle = 'Employment Contract',
    expiryDate = 'N/A',
    daysUntilExpiry = 30,
    companyName = 'Company'
  } = data;

  return {
    subject: `Contract Expiry Reminder - ${daysUntilExpiry} days remaining`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #f59e0b;">Contract Expiry Reminder</h2>
        <p>Hello ${employeeName},</p>
        <p>This is a reminder that your contract will expire soon.</p>
        <p><strong>Contract:</strong> ${contractTitle}</p>
        <p><strong>Expiry Date:</strong> ${expiryDate}</p>
        <p><strong>Days Remaining:</strong> ${daysUntilExpiry}</p>
        <p>Please contact HR to discuss contract renewal or extension.</p>
        <p>Best regards,<br>HR Team<br>${companyName}</p>
      </div>
    `
  };
}

// Performance management email templates
function generatePerformanceReviewScheduledEmail(data) {
  const {
    employeeName = 'Employee',
    reviewPeriod = 'Current Period',
    reviewDate = 'N/A',
    reviewerName = 'Manager',
    companyName = 'Company'
  } = data;

  return {
    subject: `Performance Review Scheduled - ${reviewPeriod}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #4f46e5;">Performance Review Scheduled</h2>
        <p>Hello ${employeeName},</p>
        <p>Your performance review has been scheduled.</p>
        <p><strong>Review Period:</strong> ${reviewPeriod}</p>
        <p><strong>Review Date:</strong> ${reviewDate}</p>
        <p><strong>Reviewer:</strong> ${reviewerName}</p>
        <p>Please prepare by reviewing your goals and achievements for this period.</p>
        <p>Best regards,<br>HR Team<br>${companyName}</p>
      </div>
    `
  };
}

function generatePerformanceReviewReminderEmail(data) {
  const {
    employeeName = 'Employee',
    reviewPeriod = 'Current Period',
    reviewDate = 'N/A',
    companyName = 'Company'
  } = data;

  return {
    subject: `Performance Review Reminder - Tomorrow`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #f59e0b;">Performance Review Reminder</h2>
        <p>Hello ${employeeName},</p>
        <p>This is a reminder that your performance review is scheduled for tomorrow.</p>
        <p><strong>Review Period:</strong> ${reviewPeriod}</p>
        <p><strong>Review Date:</strong> ${reviewDate}</p>
        <p>Please ensure you're prepared and ready for the review.</p>
        <p>Best regards,<br>HR Team<br>${companyName}</p>
      </div>
    `
  };
}

function generatePerformanceGoalAssignedEmail(data) {
  const {
    employeeName = 'Employee',
    goalTitle = 'New Goal',
    goalDescription = 'Goal description',
    dueDate = 'N/A',
    companyName = 'Company'
  } = data;

  return {
    subject: `New Performance Goal Assigned - ${goalTitle}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #4f46e5;">New Performance Goal Assigned</h2>
        <p>Hello ${employeeName},</p>
        <p>A new performance goal has been assigned to you.</p>
        <p><strong>Goal Title:</strong> ${goalTitle}</p>
        <p><strong>Description:</strong> ${goalDescription}</p>
        <p><strong>Due Date:</strong> ${dueDate}</p>
        <p>Please review the goal and contact your manager if you have any questions.</p>
        <p>Best regards,<br>HR Team<br>${companyName}</p>
      </div>
    `
  };
}

function generatePerformanceImprovementPlanEmail(data) {
  const {
    employeeName = 'Employee',
    pipTitle = 'Performance Improvement Plan',
    pipDescription = 'PIP description',
    startDate = 'N/A',
    endDate = 'N/A',
    companyName = 'Company'
  } = data;

  return {
    subject: `Performance Improvement Plan - ${pipTitle}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #dc2626;">Performance Improvement Plan</h2>
        <p>Hello ${employeeName},</p>
        <p>A Performance Improvement Plan has been created for you.</p>
        <p><strong>Plan Title:</strong> ${pipTitle}</p>
        <p><strong>Description:</strong> ${pipDescription}</p>
        <p><strong>Start Date:</strong> ${startDate}</p>
        <p><strong>End Date:</strong> ${endDate}</p>
        <p>Please review the plan and schedule a meeting with your manager to discuss next steps.</p>
        <p>Best regards,<br>HR Team<br>${companyName}</p>
      </div>
    `
  };
}

function generatePerformanceMeetingReminderEmail(data) {
  const {
    employeeName = 'Employee',
    meetingTitle = 'Performance Meeting',
    meetingDate = 'N/A',
    meetingTime = 'N/A',
    location = 'TBD',
    companyName = 'Company'
  } = data;

  return {
    subject: `Reminder: ${meetingTitle} - ${meetingDate}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #2563eb;">Performance Meeting Reminder</h2>
        <p>Hello ${employeeName},</p>
        <p>This is a friendly reminder about your upcoming performance meeting.</p>
        <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Meeting:</strong> ${meetingTitle}</p>
          <p><strong>Date:</strong> ${meetingDate}</p>
          <p><strong>Time:</strong> ${meetingTime}</p>
          <p><strong>Location:</strong> ${location}</p>
        </div>
        <p>Please come prepared with any questions or topics you'd like to discuss.</p>
        <p>If you need to reschedule, please contact HR as soon as possible.</p>
        <p>Best regards,<br>HR Team<br>${companyName}</p>
      </div>
    `
  };
}

// Asset management email templates
function generateAssetAssignedEmail(data) {
  const {
    employeeName = 'Employee',
    assetName = 'Asset',
    assetType = 'Equipment',
    serialNumber = 'N/A',
    assignedDate = 'N/A',
    companyName = 'Company'
  } = data;

  return {
    subject: `Asset Assigned - ${assetName}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #10b981;">Asset Assigned</h2>
        <p>Hello ${employeeName},</p>
        <p>An asset has been assigned to you.</p>
        <p><strong>Asset Name:</strong> ${assetName}</p>
        <p><strong>Asset Type:</strong> ${assetType}</p>
        <p><strong>Serial Number:</strong> ${serialNumber}</p>
        <p><strong>Assigned Date:</strong> ${assignedDate}</p>
        <p>Please ensure proper care and maintenance of this asset.</p>
        <p>Best regards,<br>HR Team<br>${companyName}</p>
      </div>
    `
  };
}

function generateAssetReturnReminderEmail(data) {
  const {
    employeeName = 'Employee',
    assetName = 'Asset',
    returnDate = 'N/A',
    daysUntilReturn = 7,
    companyName = 'Company'
  } = data;

  return {
    subject: `Asset Return Reminder - ${assetName}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #f59e0b;">Asset Return Reminder</h2>
        <p>Hello ${employeeName},</p>
        <p>This is a reminder to return your assigned asset.</p>
        <p><strong>Asset:</strong> ${assetName}</p>
        <p><strong>Return Date:</strong> ${returnDate}</p>
        <p><strong>Days Until Return:</strong> ${daysUntilReturn}</p>
        <p>Please arrange to return the asset to IT department.</p>
        <p>Best regards,<br>HR Team<br>${companyName}</p>
      </div>
    `
  };
}

function generateAssetMaintenanceRequiredEmail(data) {
  const {
    employeeName = 'Employee',
    assetName = 'Asset',
    maintenanceType = 'Routine Maintenance',
    dueDate = 'N/A',
    companyName = 'Company'
  } = data;

  return {
    subject: `Asset Maintenance Required - ${assetName}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #f59e0b;">Asset Maintenance Required</h2>
        <p>Hello ${employeeName},</p>
        <p>Your assigned asset requires maintenance.</p>
        <p><strong>Asset:</strong> ${assetName}</p>
        <p><strong>Maintenance Type:</strong> ${maintenanceType}</p>
        <p><strong>Due Date:</strong> ${dueDate}</p>
        <p>Please contact IT department to schedule maintenance.</p>
        <p>Best regards,<br>HR Team<br>${companyName}</p>
      </div>
    `
  };
}

// Security email templates
function generatePasswordResetEmail(data) {
  const {
    employeeName = 'Employee',
    resetLink = '#',
    expiryTime = '1 hour',
    companyName = 'Company'
  } = data;

  return {
    subject: `Password Reset Request - ${companyName}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #4f46e5;">Password Reset Request</h2>
        <p>Hello ${employeeName},</p>
        <p>You have requested to reset your password.</p>
        <p>Click the link below to reset your password:</p>
        <p><a href="${resetLink}" style="background: #4f46e5; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Reset Password</a></p>
        <p><strong>This link will expire in:</strong> ${expiryTime}</p>
        <p>If you did not request this reset, please contact HR immediately.</p>
        <p>Best regards,<br>HR Team<br>${companyName}</p>
      </div>
    `
  };
}

function generateLoginAttemptFailedEmail(data) {
  const {
    employeeName = 'Employee',
    attemptTime = 'N/A',
    ipAddress = 'Unknown',
    companyName = 'Company'
  } = data;

  return {
    subject: `Security Alert - Failed Login Attempt`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #dc2626;">Security Alert</h2>
        <p>Hello ${employeeName},</p>
        <p>We detected a failed login attempt on your account.</p>
        <p><strong>Attempt Time:</strong> ${attemptTime}</p>
        <p><strong>IP Address:</strong> ${ipAddress}</p>
        <p>If this was not you, please contact HR immediately and change your password.</p>
        <p>Best regards,<br>HR Team<br>${companyName}</p>
      </div>
    `
  };
}

function generateAccountSuspendedEmail(data) {
  const {
    employeeName = 'Employee',
    suspensionReason = 'Policy violation',
    suspensionDate = 'N/A',
    companyName = 'Company'
  } = data;

  return {
    subject: `Account Suspended - ${companyName}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #dc2626;">Account Suspended</h2>
        <p>Hello ${employeeName},</p>
        <p>Your account has been suspended.</p>
        <p><strong>Reason:</strong> ${suspensionReason}</p>
        <p><strong>Suspension Date:</strong> ${suspensionDate}</p>
        <p>Please contact HR to discuss account reinstatement.</p>
        <p>Best regards,<br>HR Team<br>${companyName}</p>
      </div>
    `
  };
}

// Recruitment email templates (connected to primary service)
function generateInterviewReminderEmail(data) {
  const {
    candidateName = 'Candidate',
    jobTitle = 'Position',
    interviewDate = 'N/A',
    interviewTime = 'N/A',
    interviewType = 'Interview',
    meetingLink = '',
    companyName = 'Company'
  } = data;

  return {
    subject: `Interview Reminder - ${jobTitle} at ${companyName}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #f59e0b;">Interview Reminder</h2>
        <p>Hello ${candidateName},</p>
        <p>This is a reminder about your upcoming interview.</p>
        <p><strong>Position:</strong> ${jobTitle}</p>
        <p><strong>Date:</strong> ${interviewDate}</p>
        <p><strong>Time:</strong> ${interviewTime}</p>
        <p><strong>Type:</strong> ${interviewType}</p>
        ${meetingLink ? `<p><strong>Meeting Link:</strong> <a href="${meetingLink}">Join Interview</a></p>` : ''}
        <p>Good luck with your interview!</p>
        <p>Best regards,<br>HR Team<br>${companyName}</p>
      </div>
    `
  };
}

function generateInterviewFeedbackEmail(data) {
  const {
    candidateName = 'Candidate',
    jobTitle = 'Position',
    interviewDate = 'N/A',
    feedback = 'Interview feedback',
    nextSteps = 'Next steps',
    companyName = 'Company'
  } = data;

  return {
    subject: `Interview Feedback - ${jobTitle} at ${companyName}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #4f46e5;">Interview Feedback</h2>
        <p>Hello ${candidateName},</p>
        <p>Thank you for your interview for the ${jobTitle} position.</p>
        <p><strong>Interview Date:</strong> ${interviewDate}</p>
        <p><strong>Feedback:</strong></p>
        <p>${feedback}</p>
        <p><strong>Next Steps:</strong></p>
        <p>${nextSteps}</p>
        <p>Best regards,<br>HR Team<br>${companyName}</p>
      </div>
    `
  };
}

function generateApplicationRejectedEmail(data) {
  const {
    candidateName = 'Candidate',
    jobTitle = 'Position',
    rejectionReason = 'Not selected',
    companyName = 'Company'
  } = data;

  return {
    subject: `Application Update - ${jobTitle} at ${companyName}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #6b7280;">Application Update</h2>
        <p>Hello ${candidateName},</p>
        <p>Thank you for your interest in the ${jobTitle} position at ${companyName}.</p>
        <p>After careful consideration, we have decided not to move forward with your application.</p>
        <p><strong>Reason:</strong> ${rejectionReason}</p>
        <p>We encourage you to apply for other positions that match your qualifications.</p>
        <p>Best regards,<br>HR Team<br>${companyName}</p>
      </div>
    `
  };
}

function generateBackgroundCheckRequiredEmail(data) {
  const {
    candidateName = 'Candidate',
    jobTitle = 'Position',
    requiredDocuments = ['ID Document', 'Passport'],
    submissionDeadline = 'N/A',
    companyName = 'Company'
  } = data;

  return {
    subject: `Background Check Required - ${jobTitle} at ${companyName}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #4f46e5;">Background Check Required</h2>
        <p>Hello ${candidateName},</p>
        <p>Congratulations on your selection for the ${jobTitle} position!</p>
        <p>As part of our hiring process, we need to conduct a background check.</p>
        <p><strong>Required Documents:</strong></p>
        <ul>
          ${requiredDocuments.map(doc => `<li>${doc}</li>`).join('')}
        </ul>
        <p><strong>Submission Deadline:</strong> ${submissionDeadline}</p>
        <p>Please submit these documents as soon as possible.</p>
        <p>Best regards,<br>HR Team<br>${companyName}</p>
      </div>
    `
  };
}

// Compliance & training email templates
function generateTrainingRequiredEmail(data) {
  const {
    employeeName = 'Employee',
    trainingTitle = 'Training Course',
    trainingDescription = 'Training description',
    dueDate = 'N/A',
    trainingLink = '#',
    companyName = 'Company'
  } = data;

  return {
    subject: `Training Required - ${trainingTitle}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #4f46e5;">Training Required</h2>
        <p>Hello ${employeeName},</p>
        <p>You have been assigned a required training course.</p>
        <p><strong>Training:</strong> ${trainingTitle}</p>
        <p><strong>Description:</strong> ${trainingDescription}</p>
        <p><strong>Due Date:</strong> ${dueDate}</p>
        <p><a href="${trainingLink}" style="background: #4f46e5; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Start Training</a></p>
        <p>Please complete this training by the due date.</p>
        <p>Best regards,<br>HR Team<br>${companyName}</p>
      </div>
    `
  };
}

function generateTrainingReminderEmail(data) {
  const {
    employeeName = 'Employee',
    trainingTitle = 'Training Course',
    dueDate = 'N/A',
    daysUntilDue = 3,
    companyName = 'Company'
  } = data;

  return {
    subject: `Training Reminder - ${trainingTitle}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #f59e0b;">Training Reminder</h2>
        <p>Hello ${employeeName},</p>
        <p>This is a reminder about your assigned training.</p>
        <p><strong>Training:</strong> ${trainingTitle}</p>
        <p><strong>Due Date:</strong> ${dueDate}</p>
        <p><strong>Days Until Due:</strong> ${daysUntilDue}</p>
        <p>Please complete the training as soon as possible.</p>
        <p>Best regards,<br>HR Team<br>${companyName}</p>
      </div>
    `
  };
}

function generateComplianceCertificateExpiryEmail(data) {
  const {
    employeeName = 'Employee',
    certificateName = 'Certificate',
    expiryDate = 'N/A',
    daysUntilExpiry = 30,
    renewalLink = '#',
    companyName = 'Company'
  } = data;

  return {
    subject: `Certificate Expiry Reminder - ${certificateName}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #f59e0b;">Certificate Expiry Reminder</h2>
        <p>Hello ${employeeName},</p>
        <p>Your compliance certificate will expire soon.</p>
        <p><strong>Certificate:</strong> ${certificateName}</p>
        <p><strong>Expiry Date:</strong> ${expiryDate}</p>
        <p><strong>Days Until Expiry:</strong> ${daysUntilExpiry}</p>
        <p><a href="${renewalLink}" style="background: #4f46e5; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Renew Certificate</a></p>
        <p>Please renew your certificate before it expires.</p>
        <p>Best regards,<br>HR Team<br>${companyName}</p>
      </div>
    `
  };
}

// System & maintenance email templates
function generateSystemMaintenanceNoticeEmail(data) {
  const {
    employeeName = 'Employee',
    maintenanceDate = 'N/A',
    maintenanceTime = 'N/A',
    expectedDowntime = '2 hours',
    affectedSystems = ['HRIS System'],
    companyName = 'Company'
  } = data;

  return {
    subject: `System Maintenance Notice - ${maintenanceDate}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #f59e0b;">System Maintenance Notice</h2>
        <p>Hello ${employeeName},</p>
        <p>We will be performing scheduled system maintenance.</p>
        <p><strong>Date:</strong> ${maintenanceDate}</p>
        <p><strong>Time:</strong> ${maintenanceTime}</p>
        <p><strong>Expected Downtime:</strong> ${expectedDowntime}</p>
        <p><strong>Affected Systems:</strong></p>
        <ul>
          ${affectedSystems.map(system => `<li>${system}</li>`).join('')}
        </ul>
        <p>Please plan accordingly and save your work before maintenance begins.</p>
        <p>Best regards,<br>IT Team<br>${companyName}</p>
      </div>
    `
  };
}

function generateProfileUpdateReminderEmail(data) {
  const {
    employeeName = 'Employee',
    lastUpdated = 'N/A',
    requiredUpdates = ['Emergency Contact', 'Address'],
    companyName = 'Company'
  } = data;

  return {
    subject: `Profile Update Reminder - ${companyName}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #f59e0b;">Profile Update Reminder</h2>
        <p>Hello ${employeeName},</p>
        <p>Please update your employee profile information.</p>
        <p><strong>Last Updated:</strong> ${lastUpdated}</p>
        <p><strong>Required Updates:</strong></p>
        <ul>
          ${requiredUpdates.map(update => `<li>${update}</li>`).join('')}
        </ul>
        <p>Please log in to your employee portal to update this information.</p>
        <p>Best regards,<br>HR Team<br>${companyName}</p>
      </div>
    `
  };
}
