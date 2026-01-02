import nodemailer from 'nodemailer';

function getBoolean(value, fallback = false) {
    if (value === undefined) return fallback;
    return ['1', 'true', 'yes', 'on'].includes(String(value).toLowerCase());
}

let cachedTransporter;

/**
 * Validate email address format (supports various formats)
 */
function validateEmail(email) {
    if (!email || typeof email !== 'string') {
        return false;
    }
    
    // More comprehensive email regex
    const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    
    // Also check for common issues
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

function getTransporter() {
    if (cachedTransporter) {
        return cachedTransporter;
    }

    const host = process.env.SMTP_HOST;
    const port = Number(process.env.SMTP_PORT ?? 587);
    const secure = getBoolean(process.env.SMTP_SECURE ?? (port === 465 ? 'true' : 'false'));

    if (!host) {
        throw new Error('SMTP_HOST environment variable is not set');
    }

    // Enhanced transporter configuration with better error handling
    cachedTransporter = nodemailer.createTransport({
        host,
        port,
        secure,
        auth: process.env.SMTP_USER && process.env.SMTP_PASS
            ? {
                  user: process.env.SMTP_USER,
                  pass: process.env.SMTP_PASS
              }
            : undefined,
        // Add connection timeout and retry settings
        connectionTimeout: 10000, // 10 seconds
        greetingTimeout: 5000, // 5 seconds
        socketTimeout: 10000, // 10 seconds
        // Enable debug logging in development
        debug: process.env.NODE_ENV === 'development',
        logger: process.env.NODE_ENV === 'development'
    });

    // Verify connection on first use
    cachedTransporter.verify((error, success) => {
        if (error) {
            console.error('❌ [Nodemailer] SMTP connection verification failed:', error);
            // Don't throw here, let individual sends handle errors
        } else {
            console.log('✅ [Nodemailer] SMTP connection verified successfully');
        }
    });

    return cachedTransporter;
}

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

    const transporter = getTransporter();

    const defaultFrom = {
        name: process.env.SMTP_FROM_NAME || 'Your HRIS',
        address: process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER || 'noreply@example.com'
    };

    const fromValue = from || defaultFrom;
    
    // Validate from email
    const fromEmail = typeof fromValue === 'string' ? fromValue : fromValue.address;
    if (!validateEmail(fromEmail)) {
        throw new Error(`Invalid from email address: ${fromEmail}`);
    }

    try {
        const mailOptions = {
            from: typeof fromValue === 'string' ? fromValue : `${fromValue.name} <${fromValue.address}>`,
            to: normalizedEmails.join(', '), // Join multiple emails with comma
            subject: subject.trim(),
            html: html || undefined,
            text: text || undefined
        };

        console.log('📧 [Nodemailer] Sending email:', {
            to: normalizedEmails,
            subject: mailOptions.subject,
            from: mailOptions.from
        });

        const info = await transporter.sendMail(mailOptions);
        
        console.log('✅ [Nodemailer] Email sent successfully:', {
            messageId: info.messageId,
            accepted: info.accepted,
            rejected: info.rejected
        });

        // Check if any emails were rejected
        if (info.rejected && info.rejected.length > 0) {
            console.warn('⚠️ [Nodemailer] Some emails were rejected:', info.rejected);
        }

        return info;
    } catch (error) {
        // Provide more descriptive error messages
        let errorMessage = 'Failed to send email';
        
        if (error.code === 'EAUTH') {
            errorMessage = 'SMTP authentication failed. Please check your SMTP_USER and SMTP_PASS credentials.';
        } else if (error.code === 'ECONNECTION') {
            errorMessage = `Cannot connect to SMTP server (${process.env.SMTP_HOST}:${process.env.SMTP_PORT}). Please check your SMTP_HOST and SMTP_PORT settings.`;
        } else if (error.code === 'ETIMEDOUT') {
            errorMessage = 'SMTP connection timed out. Please check your network connection and SMTP settings.';
        } else if (error.responseCode) {
            errorMessage = `SMTP server error (${error.responseCode}): ${error.response || error.message}`;
        } else {
            errorMessage = error.message || 'Unknown error occurred while sending email';
        }
        
        console.error('❌ [Nodemailer] Error sending email:', {
            error: errorMessage,
            code: error.code,
            command: error.command,
            response: error.response
        });
        
        throw new Error(errorMessage);
    }
}






