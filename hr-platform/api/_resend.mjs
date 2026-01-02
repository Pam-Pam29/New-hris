import { Resend } from 'resend';

let cachedResend;

/**
 * Validate email address format
 */
function validateEmail(email) {
    if (!email || typeof email !== 'string') {
        return false;
    }
    
    // Comprehensive email regex
    const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    
    // Check for common issues
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
    
    // If it's an array, process each
    if (Array.isArray(to)) {
        return to.map(email => email.trim()).filter(email => validateEmail(email));
    }
    
    // If it's a string, split by comma and process
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
    console.log('✅ [Resend] Initialized successfully');
    
    return cachedResend;
}

/**
 * Send email using Resend
 * @param {Object} options - Email options
 * @param {string|string[]} options.to - Recipient email(s)
 * @param {string} options.subject - Email subject
 * @param {string} options.html - HTML content
 * @param {string} options.text - Plain text content (optional)
 * @param {string|Object} options.from - Sender email or {name, email} object
 * @returns {Promise<Object>} Resend response
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
    const defaultFrom = process.env.RESEND_FROM_EMAIL || 
                       process.env.SMTP_FROM_EMAIL || 
                       'onboarding@resend.dev'; // Resend default

    // Handle from address (string or object)
    let fromEmail = defaultFrom;
    let fromName = process.env.RESEND_FROM_NAME || process.env.SMTP_FROM_NAME || 'Your HRIS';
    
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
        // Resend supports multiple recipients by passing an array
        const emailData = {
            from: fromName ? `${fromName} <${fromEmail}>` : fromEmail,
            to: normalizedEmails, // Resend accepts array of emails
            subject: subject.trim(),
            html: html || undefined,
            text: text || undefined
        };

        console.log('📧 [Resend] Sending email:', {
            to: normalizedEmails,
            subject: emailData.subject,
            from: emailData.from
        });

        const { data, error } = await resend.emails.send(emailData);
        
        if (error) {
            console.error('❌ [Resend] Error sending email:', error);
            throw new Error(`Resend API error: ${error.message || JSON.stringify(error)}`);
        }

        console.log('✅ [Resend] Email sent successfully:', {
            id: data?.id,
            to: normalizedEmails
        });

        return {
            messageId: data?.id,
            accepted: normalizedEmails,
            rejected: []
        };
    } catch (error) {
        // Provide more descriptive error messages
        let errorMessage = 'Failed to send email';
        
        if (error.message) {
            errorMessage = error.message;
        } else if (error.response) {
            errorMessage = `Resend API error: ${JSON.stringify(error.response)}`;
        } else {
            errorMessage = error.toString();
        }
        
        console.error('❌ [Resend] Error sending email:', {
            error: errorMessage,
            details: error
        });
        
        throw new Error(errorMessage);
    }
}

