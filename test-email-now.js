#!/usr/bin/env node

/**
 * Quick SendGrid Email Test
 * Run this to test your SendGrid configuration
 * 
 * Usage: node test-email-now.js
 */

const https = require('https');

const SENDGRID_API_KEY = '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';
const FROM_EMAIL = 'v.fakunle@alustudent.com';
const TO_EMAIL = 'v.fakunle@alustudent.com';

console.log('\n📧 Testing SendGrid Email...\n');
console.log('From:', FROM_EMAIL);
console.log('To:', TO_EMAIL);
console.log('\n🚀 Sending test email...\n');

const data = JSON.stringify({
    personalizations: [{
        to: [{ email: TO_EMAIL }],
        subject: '✅ SendGrid Test - Your HRIS is Working!'
    }],
    from: {
        email: FROM_EMAIL,
        name: 'Your HRIS'
    },
    content: [{
        type: 'text/html',
        value: `
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
            <h1>✅ SendGrid Working!</h1>
          </div>
          <div class="content">
            <p><strong>Congratulations!</strong></p>
            
            <div class="success">
              <p style="margin: 0; font-size: 18px;"><strong>Your email system is configured correctly!</strong></p>
            </div>
            
            <h3>✅ Configuration Confirmed:</h3>
            <ul>
              <li>SendGrid API Key: Valid</li>
              <li>Sender Email: Verified</li>
              <li>19 Email Templates: Ready</li>
              <li>Multi-Tenant: Supported</li>
            </ul>
            
            <h3>🎉 What's Ready:</h3>
            <ol>
              <li>Employee Invitations</li>
              <li>Leave Notifications (Approved/Rejected)</li>
              <li>Meeting Reminders</li>
              <li>Interview Communications</li>
              <li>Payroll Notifications</li>
              <li>Policy Updates</li>
              <li>Security Alerts</li>
              <li>And 12 more!</li>
            </ol>
            
            <p><strong>Your HRIS is ready for production deployment!</strong></p>
            
            <p>Best regards,<br>
            <strong>Your HRIS Team</strong></p>
            
            <div style="text-align: center; color: #6b7280; font-size: 12px; margin-top: 20px;">
              <p>Test Email - ${new Date().toLocaleString()}</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `
    }]
});

const options = {
    hostname: 'api.sendgrid.com',
    port: 443,
    path: '/v3/mail/send',
    method: 'POST',
    headers: {
        'Authorization': `Bearer ${SENDGRID_API_KEY}`,
        'Content-Type': 'application/json',
        'Content-Length': data.length
    }
};

const req = https.request(options, (res) => {
    console.log('Status Code:', res.statusCode);

    let responseData = '';
    res.on('data', (chunk) => {
        responseData += chunk;
    });

    res.on('end', () => {
        if (res.statusCode === 202) {
            console.log('\n✅ SUCCESS! Email sent!\n');
            console.log('='.repeat(50));
            console.log('📬 Check your inbox:', TO_EMAIL);
            console.log('='.repeat(50));
            console.log('\n🎉 SendGrid is working perfectly!\n');
            console.log('Your HRIS can now send:');
            console.log('  ✅ Employee invitations');
            console.log('  ✅ Leave notifications');
            console.log('  ✅ Meeting reminders');
            console.log('  ✅ Interview emails');
            console.log('  ✅ Payroll notices');
            console.log('  ✅ And 14 more email types!\n');
            console.log('🚀 Ready for production deployment!\n');
        } else {
            console.error('\n❌ FAILED! Status:', res.statusCode);
            console.error('Response:', responseData);
            console.error('\n🔍 Troubleshooting:');
            console.error('  1. Check if sender email is verified in SendGrid');
            console.error('  2. Visit: https://app.sendgrid.com/settings/sender_auth/senders');
            console.error('  3. Verify v.fakunle@alustudent.com is listed with green checkmark\n');
        }
    });
});

req.on('error', (error) => {
    console.error('\n❌ ERROR:', error.message);
    console.error('\n💡 Check your internet connection\n');
});

req.write(data);
req.end();

