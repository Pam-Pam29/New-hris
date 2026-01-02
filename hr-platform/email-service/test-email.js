import dotenv from 'dotenv';
import { sendMail } from './services/resendService.js';

// Load environment variables
dotenv.config();

async function testEmail() {
  try {
    console.log('🧪 Testing Resend email service...\n');

    if (!process.env.RESEND_API_KEY) {
      console.error('❌ RESEND_API_KEY not set in .env file');
      process.exit(1);
    }

    // Test email
    const testEmail = process.env.TEST_EMAIL || 'test@example.com';
    
    console.log(`📧 Sending test email to: ${testEmail}\n`);

    const result = await sendMail({
      to: testEmail,
      subject: 'Test Email from HR Email Service',
      html: `
        <h1>Test Email</h1>
        <p>This is a test email from the HR Email Service using Resend.</p>
        <p>If you received this, the service is working correctly! ✅</p>
      `,
      text: `
Test Email

This is a test email from the HR Email Service using Resend.

If you received this, the service is working correctly! ✅
      `
    });

    console.log('✅ Email sent successfully!');
    console.log('📋 Result:', JSON.stringify(result, null, 2));
  } catch (error) {
    console.error('❌ Error sending test email:', error.message);
    process.exit(1);
  }
}

testEmail();

