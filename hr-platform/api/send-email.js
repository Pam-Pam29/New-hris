import { sendMail } from './_resend.mjs';

async function readRawBody(req) {
    return await new Promise((resolve, reject) => {
        const chunks = [];

        req.on('data', chunk => {
            chunks.push(Buffer.from(chunk));
        });

        req.on('end', () => {
            const buffer = Buffer.concat(chunks);
            resolve(buffer.toString('utf8'));
        });

        req.on('error', reject);
    });
}

export default async function handler(req, res) {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    // Handle preflight requests
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    // Only allow POST requests
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const apiKey = process.env.EMAIL_API_KEY;
        const providedKey = req.headers['x-api-key'];

        if (apiKey && apiKey !== providedKey) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const rawBody = await readRawBody(req);
        console.log('📦 [Vercel Function] Raw body:', rawBody);

        if (!rawBody) {
            return res.status(400).json({
                error: 'Missing request body'
            });
        }

        let payload;
        try {
            payload = JSON.parse(rawBody);
        } catch (error) {
            return res.status(400).json({
                error: 'Invalid JSON'
            });
        }

        const { to, subject, html, text, from } = payload;

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

        console.log('📧 [Vercel Function] Sending email via Resend:', { to, subject, from });

        try {
            const info = await sendMail({ to, subject, html, text, from });

            console.log('✅ [Vercel Function] Email sent successfully:', {
                messageId: info.messageId,
                accepted: info.accepted,
                rejected: info.rejected
            });

            return res.status(200).json({
                success: true,
                messageId: info.messageId,
                accepted: info.accepted,
                rejected: info.rejected || [],
                message: 'Email sent successfully'
            });
        } catch (emailError) {
            // Handle email-specific errors with better messages
            console.error('❌ [Vercel Function] Email error:', emailError.message);
            
            // Determine appropriate status code
            let statusCode = 500;
            if (emailError.message.includes('Invalid email') || emailError.message.includes('Missing required')) {
                statusCode = 400;
            } else if (emailError.message.includes('authentication') || emailError.message.includes('SMTP')) {
                statusCode = 502; // Bad Gateway - SMTP configuration issue
            }
            
            return res.status(statusCode).json({
                error: 'Failed to send email',
                details: emailError.message,
                suggestion: emailError.message.includes('authentication') 
                    ? 'Please check your SMTP credentials (SMTP_USER and SMTP_PASS)'
                    : emailError.message.includes('connection')
                    ? 'Please check your SMTP server settings (SMTP_HOST and SMTP_PORT)'
                    : 'Please verify the email address and try again'
            });
        }

    } catch (error) {
        console.error('❌ [Vercel Function] Unexpected error:', error);
        return res.status(500).json({
            error: 'Internal server error',
            details: error.message,
            type: error.name || 'UnknownError'
        });
    }
}
