import type { VercelRequest, VercelResponse } from '@vercel/node';
import nodemailer from 'nodemailer';

function getBoolean(value: string | undefined, fallback = false): boolean {
    if (value === undefined) return fallback;
    return ['1', 'true', 'yes', 'on'].includes(value.toLowerCase());
}

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT ?? 465),
    secure: getBoolean(process.env.SMTP_SECURE ?? (process.env.SMTP_PORT === '465' ? 'true' : 'false')),
    auth: process.env.SMTP_USER && process.env.SMTP_PASS ? {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    } : undefined
});

export default async function handler(request: VercelRequest, response: VercelResponse) {
    if (request.method !== 'POST') {
        response.setHeader('Allow', 'POST');
        return response.status(405).json({ error: 'Method not allowed' });
    }

    const apiKey = process.env.EMAIL_API_KEY;
    const providedKey = request.headers['x-api-key'];

    if (apiKey && apiKey !== providedKey) {
        return response.status(401).json({ error: 'Unauthorized' });
    }

    const payload = typeof request.body === 'string' ? JSON.parse(request.body || '{}') : (request.body ?? {});
    const { to, subject, html, text } = payload;

    if (!to || !subject || !html) {
        return response.status(400).json({
            error: 'Missing required fields: to, subject, html'
        });
    }

    try {
        const info = await transporter.sendMail({
            from: {
                name: process.env.SMTP_FROM_NAME || 'Your HRIS',
                address: process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER || 'noreply@example.com'
            },
            to,
            subject,
            html,
            text
        });

        return response.status(200).json({ success: true, messageId: info.messageId });
    } catch (error: any) {
        console.error('Error sending email via serverless function:', error);
        return response.status(500).json({
            error: error?.message || 'Failed to send email'
        });
    }
}

