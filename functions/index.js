/**
 * Firebase Cloud Functions for HRIS Email System
 * Using Resend.com (3,000 emails/month FREE)
 */

const functions = require('firebase-functions');
const admin = require('firebase-admin');
const https = require('https');

// Initialize Firebase Admin
admin.initializeApp();

// Resend API Configuration
const RESEND_API_KEY = 're_dBNbY32R_GPehmLvH81P3kziyr9a4Nmed';
const FROM_EMAIL = 'onboarding@resend.dev';
const FROM_NAME = 'Your HRIS';

/**
 * Helper: Send email via Resend API
 */
function sendResendEmail(to, subject, html) {
    return new Promise((resolve, reject) => {
        const data = JSON.stringify({
            from: `${FROM_NAME} <${FROM_EMAIL}>`,
            to: [to],
            subject: subject,
            html: html
        });

        const options = {
            hostname: 'api.resend.com',
            port: 443,
            path: '/emails',
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${RESEND_API_KEY}`,
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(data)
            }
        };

        const req = https.request(options, (res) => {
            let responseData = '';
            res.on('data', (chunk) => { responseData += chunk; });
            res.on('end', () => {
                if (res.statusCode === 200) {
                    console.log('✅ Email sent to:', to);
                    resolve(JSON.parse(responseData));
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

        req.write(data);
        req.end();
    });
}

/**
 * Send Employee Invitation Email
 * Triggered when employee document is created with inviteToken
 */
exports.sendEmployeeInvitation = functions.firestore
    .document('employees/{employeeId}')
    .onCreate(async (snap, context) => {
        const employee = snap.data();
        const employeeId = context.params.employeeId;

        // Only send if invite token exists
        if (!employee.setupToken && !employee.inviteToken) {
            console.log('No invite token, skipping email for:', employeeId);
            return null;
        }

        const token = employee.setupToken || employee.inviteToken;
        const employeePlatformUrl = 'http://localhost:3005'; // Update for production
        const inviteLink = `${employeePlatformUrl}/setup?id=${employeeId}&token=${token}`;

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
    .button { display: inline-block; background: #667eea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; font-weight: bold; text-decoration: none; }
    .footer { text-align: center; color: #6b7280; font-size: 12px; margin-top: 30px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🎉 Welcome to ${employee.companyName || 'the Team'}!</h1>
    </div>
    <div class="content">
      <p>Hi <strong>${employee.firstName} ${employee.lastName}</strong>,</p>
      <p>Your employee account has been created!</p>
      <div class="info-box">
        <p><strong>📧 Email:</strong> ${employee.email}</p>
        <p><strong>🆔 Employee ID:</strong> ${employee.employeeId || employeeId}</p>
      </div>
      <p>Complete your account setup:</p>
      <div style="text-align: center;">
        <a href="${inviteLink}" class="button">Complete Account Setup</a>
      </div>
      <p style="font-size: 12px; color: #6b7280;">Or copy: ${inviteLink}</p>
      <p>Best regards,<br><strong>${employee.companyName || 'Your Company'} HR Team</strong></p>
      <div class="footer">
        <p>Automated message from ${employee.companyName || 'Your Company'} HRIS</p>
      </div>
    </div>
  </div>
</body>
</html>
    `;

        try {
            await sendResendEmail(employee.email, `Welcome to ${employee.companyName}!`, html);

            // Update employee record
            await snap.ref.update({
                invitationSentAt: admin.firestore.FieldValue.serverTimestamp(),
                invitationSent: true
            });

            console.log('✅ Invitation email sent to:', employee.email);
            return null;
        } catch (error) {
            console.error('❌ Error sending invitation:', error);
            return null;
        }
    });

/**
 * Test Email Function (callable from app)
 */
exports.sendTestEmail = functions.https.onCall(async (data, context) => {
    const { toEmail } = data;
    const recipient = toEmail || 'v.fakunle@alustudent.com';

    const html = `
    <h1>✅ Cloud Functions Working!</h1>
    <p>Your Firebase Cloud Functions are deployed and working!</p>
    <p><strong>To:</strong> ${recipient}</p>
    <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
  `;

    try {
        const result = await sendResendEmail(recipient, '✅ Test Email - Cloud Functions', html);
        return { success: true, message: 'Email sent!', id: result.id };
    } catch (error) {
        return { success: false, error: error.message };
    }
});
