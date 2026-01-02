import { Resend } from 'resend';

let cachedResend;

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
 * Normalize email addresses (handle arrays, comma-separated, etc.)
 */
function normalizeEmails(to) {
  if (!to) return [];
  
  if (Array.isArray(to)) {
    return to.map(email => email.trim()).filter(email => validateEmail(email));
  }
  
  if (typeof to === 'string') {
    return to.split(',').map(email => email.trim()).filter(email => validateEmail(email));
  }
  
  return [];
}

/**
 * Get or create Resend instance
 */
function getResend() {
  if (cachedResend) {
    return cachedResend;
  }

  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    throw new Error('RESEND_API_KEY environment variable is not set');
  }

  cachedResend = new Resend(apiKey);
  console.log('✅ [Resend Service] Initialized successfully');
  
  return cachedResend;
}

/**
 * Send email using Resend
 */
export async function sendMail({ to, subject, html, text, from }) {
  // Validate required fields
  if (!to || !subject || (!html && !text)) {
    throw new Error('Missing required fields: to, subject, and either html or text');
  }

  // Normalize and validate email addresses
  const normalizedEmails = normalizeEmails(to);
  
  if (normalizedEmails.length === 0) {
    throw new Error(`Invalid email address(es): ${to}. Please check the email format.`);
  }

  const resend = getResend();

  // Get default from address
  const defaultFrom = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';

  // Handle from address (string or object)
  let fromEmail = defaultFrom;
  let fromName = process.env.RESEND_FROM_NAME || 'Your HRIS';
  
  if (from) {
    if (typeof from === 'string') {
      fromEmail = from;
    } else if (from.address) {
      fromEmail = from.address;
      fromName = from.name || fromName;
    }
  }

  // Validate from email
  if (!validateEmail(fromEmail)) {
    throw new Error(`Invalid from email address: ${fromEmail}`);
  }

  try {
    const emailData = {
      from: fromName ? `${fromName} <${fromEmail}>` : fromEmail,
      to: normalizedEmails,
      subject: subject.trim(),
      html: html || undefined,
      text: text || undefined
    };

    console.log('📧 [Resend Service] Sending email:', {
      to: normalizedEmails,
      subject: emailData.subject,
      from: emailData.from
    });

    const { data, error } = await resend.emails.send(emailData);
    
    if (error) {
      console.error('❌ [Resend Service] Error sending email:', error);
      throw new Error(`Resend API error: ${error.message || JSON.stringify(error)}`);
    }

    console.log('✅ [Resend Service] Email sent successfully:', {
      id: data?.id,
      to: normalizedEmails
    });

    return {
      messageId: data?.id,
      accepted: normalizedEmails,
      rejected: []
    };
  } catch (error) {
    let errorMessage = 'Failed to send email';
    
    if (error.message) {
      errorMessage = error.message;
    } else if (error.response) {
      errorMessage = `Resend API error: ${JSON.stringify(error.response)}`;
    } else {
      errorMessage = error.toString();
    }
    
    console.error('❌ [Resend Service] Error sending email:', {
      error: errorMessage,
      details: error
    });
    
    throw new Error(errorMessage);
  }
}

