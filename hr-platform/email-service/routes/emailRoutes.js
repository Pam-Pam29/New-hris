import { sendMail } from '../services/resendService.js';

/**
 * Validate email address format
 */
function validateEmail(email) {
  if (!email || typeof email !== 'string') {
    return false;
  }
  
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  
  if (email.includes('..') || email.startsWith('.') || email.endsWith('.')) {
    return false;
  }
  
  return emailRegex.test(email.trim());
}

/**
 * Send general email endpoint
 */
export async function sendEmail(req, res, next) {
  try {
    const apiKey = process.env.EMAIL_API_KEY;
    const providedKey = req.headers['x-api-key'];

    if (apiKey && apiKey !== providedKey) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { to, subject, html, text, from } = req.body;

    // Validate required fields
    if (!to || !subject || (!html && !text)) {
      return res.status(400).json({
        error: 'Missing required fields: to, subject, and either html or text',
        details: {
          hasTo: !!to,
          hasSubject: !!subject,
          hasHtml: !!html,
          hasText: !!text
        }
      });
    }

    console.log('📧 [Email Service] Sending email via Resend:', { to, subject, from });

    const result = await sendMail({ to, subject, html, text, from });

    console.log('✅ [Email Service] Email sent successfully:', {
      messageId: result.messageId,
      accepted: result.accepted,
      rejected: result.rejected
    });

    return res.status(200).json({
      success: true,
      messageId: result.messageId,
      accepted: result.accepted,
      rejected: result.rejected || [],
      message: 'Email sent successfully'
    });
  } catch (error) {
    console.error('❌ [Email Service] Error:', error.message);
    
    let statusCode = 500;
    if (error.message.includes('Invalid email') || error.message.includes('Missing required')) {
      statusCode = 400;
    } else if (error.message.includes('RESEND_API_KEY')) {
      statusCode = 502;
    }
    
    return res.status(statusCode).json({
      error: 'Failed to send email',
      details: error.message,
      suggestion: error.message.includes('RESEND_API_KEY')
        ? 'Please check your RESEND_API_KEY environment variable'
        : 'Please verify the email address and try again'
    });
  }
}

/**
 * Send HR templated email endpoint
 */
export async function sendHREmail(req, res, next) {
  try {
    const { emailType, recipient, data } = req.body;

    // Validate required fields
    if (!emailType || !recipient) {
      return res.status(400).json({
        error: 'Missing required fields: emailType, recipient'
      });
    }

    // Validate recipient object
    if (!recipient || !recipient.email) {
      return res.status(400).json({
        error: 'Missing recipient email address'
      });
    }

    // Validate email format
    const emailToTest = recipient.email.trim();
    
    if (!validateEmail(emailToTest)) {
      return res.status(400).json({
        error: 'Invalid email format',
        provided: recipient.email,
        suggestion: 'Please provide a valid email address (e.g., user@example.com)'
      });
    }

    console.log('📧 [Email Service] Sending HR email:', { emailType, to: emailToTest });

    // Generate email content based on type
    const emailContent = generateEmailContent(emailType, data);

    if (!emailContent) {
      return res.status(400).json({
        error: 'Invalid email type',
        supportedTypes: [
          'employee_invitation',
          'leave_approved',
          'leave_rejected',
          'meeting_scheduled',
          'interview_invitation',
          'application_received',
          'payslip_available',
          'payment_failed',
          'time_adjustment',
          'new_policy',
          'account_locked',
          'job_offer',
          'first_day_instructions'
        ]
      });
    }

    const result = await sendMail({
      to: emailToTest,
      subject: emailContent.subject,
      html: emailContent.html,
      text: emailContent.text
    });

    console.log('✅ [Email Service] HR email sent successfully:', {
      messageId: result.messageId,
      accepted: result.accepted,
      rejected: result.rejected
    });

    return res.status(200).json({
      success: true,
      messageId: result.messageId,
      accepted: result.accepted,
      rejected: result.rejected || [],
      message: 'HR email sent successfully'
    });
  } catch (error) {
    console.error('❌ [Email Service] HR email error:', error.message);
    
    let statusCode = 500;
    if (error.message.includes('Invalid email') || error.message.includes('Missing required')) {
      statusCode = 400;
    } else if (error.message.includes('RESEND_API_KEY')) {
      statusCode = 502;
    }
    
    return res.status(statusCode).json({
      error: 'Failed to send HR email',
      emailType: req.body.emailType,
      details: error.message,
      suggestion: error.message.includes('RESEND_API_KEY')
        ? 'Please check your RESEND_API_KEY environment variable'
        : 'Please verify the email address and configuration'
    });
  }
}

/**
 * Generate email content based on type
 * This is a simplified version - you can expand it with all your email templates
 */
function generateEmailContent(emailType, data) {
  const templates = {
    employee_invitation: {
      subject: `Welcome to ${data.companyName || 'Company'} - Complete Your Account Setup`,
      html: generateEmployeeInvitationHTML(data),
      text: generateEmployeeInvitationText(data)
    },
    leave_approved: {
      subject: `Leave Request Approved - ${data.companyName || 'Company'}`,
      html: generateLeaveApprovedHTML(data),
      text: generateLeaveApprovedText(data)
    },
    leave_rejected: {
      subject: `Leave Request Update - ${data.companyName || 'Company'}`,
      html: generateLeaveRejectedHTML(data),
      text: generateLeaveRejectedText(data)
    }
    // Add more templates as needed
  };

  return templates[emailType] || null;
}

// Email template generators (simplified versions)
function generateEmployeeInvitationHTML(data) {
  const { employeeName = 'Employee', employeeId = 'N/A', setupLink = '#', companyName = 'Company', position = 'Employee' } = data;
  return `
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
          <p>To get started, please complete your account setup:</p>
          <a href="${setupLink}" class="button">Complete Account Setup</a>
          <p>Best regards,<br>The HR Team</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

function generateEmployeeInvitationText(data) {
  const { employeeName = 'Employee', employeeId = 'N/A', setupLink = '#', companyName = 'Company', position = 'Employee' } = data;
  return `
Welcome to ${companyName}!

Hello ${employeeName}!

Welcome to ${companyName}! We're excited to have you join our team as a ${position}.

Your Employee ID: ${employeeId}

To get started, please complete your account setup by visiting:
${setupLink}

Best regards,
The HR Team
${companyName}
  `;
}

function generateLeaveApprovedHTML(data) {
  const { employeeName = 'Employee', leaveType = 'Leave', startDate = 'N/A', endDate = 'N/A', companyName = 'Company' } = data;
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h2 style="color: #4f46e5;">Leave Request Approved</h2>
      <p>Hello ${employeeName},</p>
      <p>Your ${leaveType} leave request has been approved.</p>
      <p><strong>Leave Period:</strong> ${startDate} to ${endDate}</p>
      <p>Best regards,<br>HR Team</p>
    </div>
  `;
}

function generateLeaveApprovedText(data) {
  const { employeeName = 'Employee', leaveType = 'Leave', startDate = 'N/A', endDate = 'N/A', companyName = 'Company' } = data;
  return `
Leave Request Approved

Hello ${employeeName},

Your ${leaveType} leave request has been approved.

Leave Period: ${startDate} to ${endDate}

Best regards,
HR Team
${companyName}
  `;
}

function generateLeaveRejectedHTML(data) {
  const { employeeName = 'Employee', leaveType = 'Leave', startDate = 'N/A', endDate = 'N/A', reason = 'No reason provided', companyName = 'Company' } = data;
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h2 style="color: #dc2626;">Leave Request Update</h2>
      <p>Hello ${employeeName},</p>
      <p>Unfortunately, your ${leaveType} leave request for ${startDate} to ${endDate} could not be approved at this time.</p>
      <p><strong>Reason:</strong> ${reason}</p>
      <p>Best regards,<br>HR Team</p>
    </div>
  `;
}

function generateLeaveRejectedText(data) {
  const { employeeName = 'Employee', leaveType = 'Leave', startDate = 'N/A', endDate = 'N/A', reason = 'No reason provided', companyName = 'Company' } = data;
  return `
Leave Request Update

Hello ${employeeName},

Unfortunately, your ${leaveType} leave request for ${startDate} to ${endDate} could not be approved at this time.

Reason: ${reason}

Best regards,
HR Team
${companyName}
  `;
}

