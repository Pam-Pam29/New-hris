#!/usr/bin/env node

/**
 * SendGrid Email Test Script
 * Tests if SendGrid is properly configured
 * 
 * Usage:
 *   node scripts/test-sendgrid.js your-email@gmail.com
 */

const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function question(query) {
    return new Promise(resolve => rl.question(query, resolve));
}

async function testSendGrid() {
    console.log('\n📧 SendGrid Configuration Test\n');
    console.log('='.repeat(50));

    // Get configuration
    const apiKey = await question('Enter your SendGrid API Key: ');
    const fromEmail = await question('Enter FROM email (verified in SendGrid): ');
    const toEmail = await question('Enter TO email (where to send test): ');

    console.log('\n🚀 Sending test email...\n');

    try {
        // Import fetch for Node.js
        const fetch = (await import('node-fetch')).default;

        const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                personalizations: [{
                    to: [{ email: toEmail }],
                    subject: '✅ SendGrid Test - HRIS System'
                }],
                from: {
                    email: fromEmail,
                    name: 'HRIS Test'
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
                .success { background: #d1fae5; padding: 15px; border-radius: 8px; border-left: 4px solid #10b981; margin: 20px 0; }
                .footer { text-align: center; color: #6b7280; font-size: 12px; margin-top: 20px; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h1>✅ SendGrid Working!</h1>
                </div>
                <div class="content">
                  <p>Congratulations! Your SendGrid configuration is working correctly.</p>
                  
                  <div class="success">
                    <p><strong>✅ Email Service:</strong> Active</p>
                    <p><strong>✅ API Key:</strong> Valid</p>
                    <p><strong>✅ Sender Email:</strong> Verified</p>
                    <p><strong>✅ Delivery:</strong> Successful</p>
                  </div>
                  
                  <h3>Configuration Details:</h3>
                  <ul>
                    <li><strong>From:</strong> ${fromEmail}</li>
                    <li><strong>To:</strong> ${toEmail}</li>
                    <li><strong>Time:</strong> ${new Date().toLocaleString()}</li>
                  </ul>
                  
                  <h3>Next Steps:</h3>
                  <ol>
                    <li>Add SendGrid API key to your .env files</li>
                    <li>Update FROM_EMAIL and FROM_NAME</li>
                    <li>Restart your development servers</li>
                    <li>Test employee invitation flow</li>
                  </ol>
                  
                  <p>Your HRIS is ready to send automated emails! 🎉</p>
                  
                  <div class="footer">
                    <p>This is a test email from your HRIS system</p>
                    <p>Powered by SendGrid</p>
                  </div>
                </div>
              </div>
            </body>
            </html>
          `
                }]
            })
        });

        if (response.ok) {
            console.log('✅ SUCCESS! Test email sent successfully!\n');
            console.log('📬 Check your inbox:', toEmail);
            console.log('\n' + '='.repeat(50));
            console.log('\n🎉 SendGrid is properly configured!\n');
            console.log('Next steps:');
            console.log('1. Add to .env: VITE_SENDGRID_API_KEY=' + apiKey.substring(0, 15) + '...');
            console.log('2. Add to .env: VITE_FROM_EMAIL=' + fromEmail);
            console.log('3. Add to .env: VITE_FROM_NAME=Your Company Name');
            console.log('4. Restart development servers');
            console.log('\n✅ Your HRIS is ready for deployment!\n');
        } else {
            const errorText = await response.text();
            console.error('❌ FAILED! SendGrid returned an error:\n');
            console.error(errorText);
            console.error('\n' + '='.repeat(50));
            console.error('\n🔍 Troubleshooting:');
            console.error('1. Check API key is correct (starts with SG.)');
            console.error('2. Verify sender email in SendGrid dashboard');
            console.error('3. Ensure API key has "Full Access" permissions');
            console.error('4. Check SendGrid dashboard for more details\n');
        }
    } catch (error) {
        console.error('❌ ERROR:', error.message);
        console.error('\n💡 Tip: Run "npm install node-fetch" if you see fetch errors\n');
    }

    rl.close();
}

// Run test
testSendGrid().catch(console.error);

