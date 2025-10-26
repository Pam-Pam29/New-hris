import { Resend } from 'resend';

// Initialize Resend with API key from environment variables
const resend = new Resend(process.env.RESEND_API_KEY);

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
        const { to, subject, html, from } = req.body;

        // Validate required fields
        if (!to || !subject || !html) {
            return res.status(400).json({
                error: 'Missing required fields: to, subject, html'
            });
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(to)) {
            return res.status(400).json({
                error: 'Invalid email format'
            });
        }

        console.log('📧 [Vercel Function] Sending email:', { to, subject });

        // Send email using Resend
        const { data, error } = await resend.emails.send({
            from: from || 'HRIS System <noreply@resend.dev>',
            to: [to],
            subject: subject,
            html: html,
        });

        if (error) {
            console.error('❌ [Vercel Function] Resend error:', error);
            return res.status(500).json({
                error: 'Failed to send email',
                details: error.message
            });
        }

        console.log('✅ [Vercel Function] Email sent successfully:', data);

        return res.status(200).json({
            success: true,
            messageId: data.id,
            message: 'Email sent successfully'
        });

    } catch (error) {
        console.error('❌ [Vercel Function] Unexpected error:', error);
        return res.status(500).json({
            error: 'Internal server error',
            details: error.message
        });
    }
}
