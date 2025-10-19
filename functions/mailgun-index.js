/**
 * Firebase Cloud Functions for HRIS Email System
 * Using Mailgun (5,000 emails/month FREE - No credit card!)
 */

const functions = require('firebase-functions');
const admin = require('firebase-admin');
const FormData = require('form-data');
const https = require('https');

// Initialize Firebase Admin
admin.initializeApp();

// Mailgun Configuration
const MAILGUN_API_KEY = functions.config().mailgun?.key || process.env.MAILGUN_API_KEY;
const MAILGUN_DOMAIN = functions.config().mailgun?.domain || process.env.MAILGUN_DOMAIN;
const FROM_EMAIL = functions.config().mailgun?.from_email || 'noreply@yourcompany.com';
const FROM_NAME = functions.config().mailgun?.from_name || 'Your HRIS';

/**
 * Helper: Send email via Mailgun
 */
async function sendMailgunEmail(to, subject, html) {
    return new Promise((resolve, reject) => {
        const formData = new FormData();
        formData.append('from', `${FROM_NAME} <${FROM_EMAIL}>`);
        formData.append('to', to);
        formData.append('subject', subject);
        formData.append('html', html);

        const auth = 'Basic ' + Buffer.from(`api:${MAILGUN_API_KEY}`).toString('base64');

        const options = {
            hostname: 'api.mailgun.net',
            port: 443,
            path: `/v3/${MAILGUN_DOMAIN}/messages`,
            method: 'POST',
            headers: {
                'Authorization': auth,
                ...formData.getHeaders()
            }
        };

        const req = https.request(options, (res) => {
            let responseData = '';
            res.on('data', (chunk) => {
                responseData += chunk;
            });

            res.on('end', () => {
                if (res.statusCode === 200) {
                    console.log('✅ Email sent to:', to);
                    resolve(true);
                } else {
                    console.error('❌ Failed to send email:', responseData);
                    reject(new Error(`Failed to send email: ${responseData}`));
                }
            });
        });

        req.on('error', (error) => {
            console.error('❌ Request error:', error);
            reject(error);
        });

        formData.pipe(req);
    });
}

/**
 * Test Email Function
 */
exports.sendTestEmail = functions.https.onCall(async (data, context) => {
    const { toEmail } = data;
    const recipient = toEmail || 'v.fakunle@alustudent.com';

    const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
        .success { background: #d1fae5; padding: 20px; border-radius: 8px; border-left: 4px solid #10b981; margin: 20px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>✅ Mailgun Working!</h1>
        </div>
        <div class="content">
          <div class="success">
            <p style="margin: 0; font-size: 18px;"><strong>Your email system is configured correctly!</strong></p>
          </div>
          <h3>✅ Configuration Confirmed:</h3>
          <ul>
            <li>Mailgun API: Connected</li>
            <li>19 Email Templates: Ready</li>
            <li>5,000 emails/month: Available</li>
            <li>Multi-Tenant: Supported</li>
          </ul>
          <p><strong>Your HRIS is ready for production!</strong></p>
          <p>Best regards,<br><strong>Your HRIS Team</strong></p>
          <div style="text-align: center; color: #6b7280; font-size: 12px; margin-top: 20px;">
            <p>Test Email - ${new Date().toLocaleString()}</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;

    try {
        await sendMailgunEmail(recipient, '✅ Test Email - HRIS System', html);
        return { success: true, message: 'Test email sent successfully!' };
    } catch (error) {
        console.error('❌ Error:', error);
        return { success: false, error: error.message };
    }
});

/**
 * Send Leave Approved Email
 */
exports.sendLeaveApprovedEmail = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
    }

    const { employeeName, email, leaveType, startDate, endDate, days, approvedBy, comments, companyName } = data;

    const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
        <h1>✅ Leave Request Approved!</h1>
      </div>
      <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px;">
        <p>Hi <strong>${employeeName}</strong>,</p>
        <div style="background: #d1fae5; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #10b981;">
          <p style="margin: 0; font-size: 18px;"><strong>Good news! Your leave request has been approved.</strong></p>
        </div>
        <h3>Leave Details:</h3>
        <div style="background: white; padding: 15px; border-radius: 8px; margin: 10px 0;">
          <p><strong>📅 Leave Type:</strong> ${leaveType}</p>
          <p><strong>🗓️ Start Date:</strong> ${startDate}</p>
          <p><strong>🗓️ End Date:</strong> ${endDate}</p>
          <p><strong>⏱️ Duration:</strong> ${days} day${days > 1 ? 's' : ''}</p>
          <p><strong>✅ Approved By:</strong> ${approvedBy}</p>
          ${comments ? `<p><strong>💬 Comments:</strong> ${comments}</p>` : ''}
        </div>
        <p>Have a great time off!</p>
        <p>Best regards,<br><strong>${companyName} HR Team</strong></p>
      </div>
    </div>
  `;

    try {
        await sendMailgunEmail(email, `✅ Leave Request Approved - ${companyName}`, html);
        return { success: true };
    } catch (error) {
        throw new functions.https.HttpsError('internal', error.message);
    }
});

/**
 * Send Employee Invitation Email
 * Triggered when new employee created
 */
exports.sendEmployeeInvitation = functions.firestore
    .document('employees/{employeeId}')
    .onCreate(async (snap, context) => {
        const employee = snap.data();
        const employeeId = context.params.employeeId;

        if (!employee.inviteToken) {
            return null;
        }

        const inviteLink = `${functions.config().urls?.employee || 'http://localhost:3005'}/setup?id=${employeeId}&token=${employee.inviteToken}`;

        const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1>🎉 Welcome to ${employee.companyName}!</h1>
        </div>
        <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px;">
          <p>Hi <strong>${employee.firstName} ${employee.lastName}</strong>,</p>
          <p>Your employee account has been created!</p>
          <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea;">
            <p><strong>📧 Your Email:</strong> ${employee.email}</p>
            <p><strong>🆔 Employee ID:</strong> ${employee.employeeId}</p>
          </div>
          <p>Click below to complete your account setup:</p>
          <div style="text-align: center;">
            <a href="${inviteLink}" style="display: inline-block; background: #667eea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; margin: 20px 0;">Complete Account Setup</a>
          </div>
          <p>Best regards,<br><strong>${employee.companyName} HR Team</strong></p>
        </div>
      </div>
    `;

        try {
            await sendMailgunEmail(employee.email, `Welcome to ${employee.companyName}!`, html);
            await snap.ref.update({
                invitationSentAt: admin.firestore.FieldValue.serverTimestamp()
            });
            return null;
        } catch (error) {
            console.error('❌ Error sending invitation:', error);
            return null;
        }
    });

// Add more email functions here (same as SendGrid version)

