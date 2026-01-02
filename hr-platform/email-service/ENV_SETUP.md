# Environment Variables Setup

Copy this to your `.env` file:

```env
# Resend API Key (required)
# Get your API key from https://resend.com/api-keys
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxx

# From email address (optional - defaults to onboarding@resend.dev)
# Must be a verified domain in Resend dashboard
RESEND_FROM_EMAIL=noreply@yourdomain.com

# From name (optional)
RESEND_FROM_NAME=Your HRIS

# Server port (optional - defaults to 3001)
PORT=3001

# API key for protecting endpoints (optional)
EMAIL_API_KEY=your-secret-api-key-here

# Node environment
NODE_ENV=development

# Test email for testing (optional)
TEST_EMAIL=test@example.com
```

## Getting Your Resend API Key

1. Go to [resend.com](https://resend.com)
2. Sign up or log in
3. Navigate to **API Keys** in the dashboard
4. Click **Create API Key**
5. Copy the key (starts with `re_`)
6. Paste it in your `.env` file as `RESEND_API_KEY`

## Verifying Your Domain (Recommended)

1. In Resend dashboard, go to **Domains**
2. Click **Add Domain**
3. Enter your domain (e.g., `yourdomain.com`)
4. Add the DNS records provided to your domain registrar
5. Wait for verification (usually a few minutes)
6. Once verified, use `noreply@yourdomain.com` in `RESEND_FROM_EMAIL`

## Free Tier Limits

- 3,000 emails/month
- 100 emails/day
- Perfect for development and small teams

