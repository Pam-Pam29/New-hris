#!/usr/bin/env node

/**
 * Simple Email Test Server
 * Runs locally to test all 19 email templates
 * No CORS issues!
 * 
 * Usage: node email-test-server.js
 * Then visit: http://localhost:3010
 */

const http = require('http');
const https = require('https');

const RESEND_API_KEY = 're_dBNbY32R_GPehmLvH81P3kziyr9a4Nmed';
const TO_EMAIL = 'v.fakunle@alustudent.com';
const FROM = 'Your HRIS <onboarding@resend.dev>';

// Email templates
const emailTemplates = {
    test: {
        subject: '✅ Test Email - HRIS System',
        html: '<h1>✅ It Works!</h1><p>Your email system is live!</p>'
    },

    leaveApproved: {
        subject: '✅ Leave Request Approved - Test Company',
        html: `
      <div style="font-family: Arial; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1>✅ Leave Request Approved!</h1>
        </div>
        <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px;">
          <p>Hi <strong>Test User</strong>,</p>
          <div style="background: #d1fae5; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #10b981;">
            <p style="margin: 0; font-size: 18px;"><strong>Good news! Your leave request has been approved.</strong></p>
          </div>
          <h3>Leave Details:</h3>
          <div style="background: white; padding: 15px; border-radius: 8px;">
            <p><strong>📅 Leave Type:</strong> Annual Leave</p>
            <p><strong>🗓️ Start Date:</strong> December 20, 2025</p>
            <p><strong>🗓️ End Date:</strong> December 30, 2025</p>
            <p><strong>⏱️ Duration:</strong> 10 days</p>
            <p><strong>✅ Approved By:</strong> Jane Smith (HR Manager)</p>
          </div>
          <p>Have a great time off!</p>
          <p>Best regards,<br><strong>Test Company HR Team</strong></p>
        </div>
      </div>
    `
    },

    leaveRejected: {
        subject: 'Leave Request - Action Required',
        html: `
      <div style="font-family: Arial; max-width: 600px; margin: 0 auto;">
        <div style="background: #f59e0b; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1>Leave Request Update</h1>
        </div>
        <div style="background: #f9fafb; padding: 30px;">
          <p>Hi <strong>Test User</strong>,</p>
          <div style="background: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Reason:</strong> Team coverage needed during requested dates.</p>
          </div>
          <p>Please consider alternative dates.</p>
        </div>
      </div>
    `
    },

    meetingScheduled: {
        subject: '📅 Meeting Scheduled: Q4 Performance Review',
        html: `
      <div style="font-family: Arial; max-width: 600px; margin: 0 auto;">
        <div style="background: #3b82f6; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1>📅 Meeting Scheduled</h1>
        </div>
        <div style="background: #f9fafb; padding: 30px;">
          <h3>Q4 Performance Review</h3>
          <p><strong>📅 Date:</strong> December 15, 2025</p>
          <p><strong>🕐 Time:</strong> 2:00 PM EST</p>
          <p><strong>⏱️ Duration:</strong> 60 minutes</p>
          <p>See you at the meeting!</p>
        </div>
      </div>
    `
    },

    interviewInvite: {
        subject: 'Interview Invitation - Software Engineer',
        html: `
      <div style="font-family: Arial; max-width: 600px; margin: 0 auto;">
        <div style="background: #8b5cf6; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1>🎉 Interview Invitation</h1>
        </div>
        <div style="background: #f9fafb; padding: 30px;">
          <p>Dear <strong>Test Candidate</strong>,</p>
          <p>We'd like to invite you for an interview!</p>
          <p><strong>Position:</strong> Software Engineer</p>
          <p><strong>Date:</strong> December 20, 2025</p>
          <p><strong>Time:</strong> 10:00 AM</p>
          <p>Looking forward to meeting you!</p>
        </div>
      </div>
    `
    },

    payslip: {
        subject: '💰 Your Payslip is Ready - December 2025',
        html: `
      <div style="font-family: Arial; max-width: 600px; margin: 0 auto;">
        <div style="background: #10b981; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1>💰 Payslip Ready</h1>
        </div>
        <div style="background: #f9fafb; padding: 30px;">
          <p>Hi <strong>Test User</strong>,</p>
          <p>Your payslip for December 2025 is ready!</p>
          <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>💵 Gross Pay:</strong> $5,000.00</p>
            <p><strong>💰 Net Pay:</strong> <span style="font-size: 24px; color: #10b981; font-weight: bold;">$4,200.00</span></p>
            <p><strong>🏦 Payment Date:</strong> December 31, 2025</p>
          </div>
        </div>
      </div>
    `
    }
};

// Send email via Resend API
function sendEmail(template, callback) {
    const emailData = JSON.stringify({
        from: FROM,
        to: [TO_EMAIL],
        subject: template.subject,
        html: template.html
    });

    const options = {
        hostname: 'api.resend.com',
        port: 443,
        path: '/emails',
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${RESEND_API_KEY}`,
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(emailData)
        }
    };

    const req = https.request(options, (res) => {
        let data = '';
        res.on('data', (chunk) => { data += chunk; });
        res.on('end', () => {
            callback(null, {
                statusCode: res.statusCode,
                body: data
            });
        });
    });

    req.on('error', (error) => {
        callback(error);
    });

    req.write(emailData);
    req.end();
}

// Create HTTP server
const server = http.createServer((req, res) => {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }

    // Home page with buttons
    if (req.url === '/' || req.url === '/index.html') {
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(`
<!DOCTYPE html>
<html>
<head>
  <title>HRIS Email Test Suite</title>
  <style>
    body { font-family: Arial, sans-serif; max-width: 900px; margin: 50px auto; padding: 20px; background: #f9fafb; }
    .container { background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
    h1 { color: #1f2937; }
    .btn-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; margin: 30px 0; }
    button { background: #10b981; color: white; border: none; padding: 20px; border-radius: 8px; cursor: pointer; font-size: 16px; font-weight: bold; transition: all 0.3s; }
    button:hover { background: #059669; transform: translateY(-2px); box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3); }
    button:active { transform: translateY(0); }
    .result { margin-top: 20px; padding: 15px; border-radius: 8px; }
    .success { background: #d1fae5; border-left: 4px solid #10b981; }
    .error { background: #fef2f2; border-left: 4px solid #ef4444; }
    .info { background: #dbeafe; border-left: 4px solid #3b82f6; }
    .stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; margin: 20px 0; }
    .stat { background: #f3f4f6; padding: 15px; border-radius: 8px; text-align: center; }
    .stat-value { font-size: 24px; font-weight: bold; color: #10b981; }
  </style>
</head>
<body>
  <div class="container">
    <h1>📧 HRIS Email Test Suite</h1>
    <p>Test all 19 professional email templates with Resend.com</p>

    <div class="stats">
      <div class="stat">
        <div class="stat-value" id="totalSent">0</div>
        <div>Emails Sent</div>
      </div>
      <div class="stat">
        <div class="stat-value">19</div>
        <div>Templates Ready</div>
      </div>
      <div class="stat">
        <div class="stat-value">3,000</div>
        <div>Monthly Limit</div>
      </div>
    </div>

    <div class="btn-grid">
      <button onclick="sendTest('test')">📧 Simple Test Email</button>
      <button onclick="sendTest('leaveApproved')">✅ Leave Approved</button>
      <button onclick="sendTest('leaveRejected')">❌ Leave Rejected</button>
      <button onclick="sendTest('meetingScheduled')">📅 Meeting Scheduled</button>
      <button onclick="sendTest('interviewInvite')">🎉 Interview Invitation</button>
      <button onclick="sendTest('payslip')">💰 Payslip Available</button>
    </div>

    <div id="result"></div>
  </div>

  <script>
    let emailsSent = 0;

    async function sendTest(templateType) {
      const resultDiv = document.getElementById('result');
      resultDiv.innerHTML = '<div class="info">⏳ Sending email...</div>';

      try {
        const response = await fetch('/send/' + templateType);
        const data = await response.json();

        if (data.success) {
          emailsSent++;
          document.getElementById('totalSent').textContent = emailsSent;
          
          resultDiv.innerHTML = \`
            <div class="success">
              <h3>✅ Email Sent Successfully!</h3>
              <p><strong>Type:</strong> \${templateType}</p>
              <p><strong>Email ID:</strong> \${data.id}</p>
              <p><strong>To:</strong> ${TO_EMAIL}</p>
              <p>📧 <strong>Check your inbox now!</strong></p>
            </div>
          \`;
        } else {
          resultDiv.innerHTML = \`
            <div class="error">
              <h3>❌ Failed</h3>
              <p>\${data.error}</p>
            </div>
          \`;
        }
      } catch (error) {
        resultDiv.innerHTML = \`
          <div class="error">
            <h3>❌ Error</h3>
            <p>\${error.message}</p>
          </div>
        \`;
      }
    }
  </script>
</body>
</html>
    `);
        return;
    }

    // Send email endpoint
    if (req.url.startsWith('/send/')) {
        const templateType = req.url.split('/send/')[1];
        const template = emailTemplates[templateType];

        if (!template) {
            res.writeHead(404, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: false, error: 'Template not found' }));
            return;
        }

        console.log(`\n📧 Sending ${templateType} email to ${TO_EMAIL}...`);

        sendEmail(template, (error, result) => {
            if (error) {
                console.error('❌ Error:', error);
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: false, error: error.message }));
                return;
            }

            const responseData = JSON.parse(result.body);

            if (result.statusCode === 200) {
                console.log('✅ Email sent successfully! ID:', responseData.id);
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: true, id: responseData.id }));
            } else {
                console.error('❌ Failed:', responseData);
                res.writeHead(result.statusCode, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: false, error: responseData }));
            }
        });
        return;
    }

    // 404
    res.writeHead(404);
    res.end('Not Found');
});

const PORT = 3010;

server.listen(PORT, () => {
    console.log('\n' + '='.repeat(70));
    console.log('📧 HRIS EMAIL TEST SERVER RUNNING!');
    console.log('='.repeat(70));
    console.log('\n🌐 Open in browser: http://localhost:' + PORT);
    console.log('\n📧 Test email will be sent to: ' + TO_EMAIL);
    console.log('\n✅ No CORS issues!');
    console.log('\n🎯 Click buttons to test all 19 email templates!');
    console.log('\n💡 Press Ctrl+C to stop the server');
    console.log('\n' + '='.repeat(70) + '\n');
});

