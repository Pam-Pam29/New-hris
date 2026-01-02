# Resend Setup Instructions

## Your Resend API Key
Your API key has been configured. Add it to your environment variables:

## For Vercel Deployment:

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your `hr-platform` project
3. Go to **Settings** → **Environment Variables**
4. Add the following variables:

### Required:
- **Name:** `RESEND_API_KEY`
- **Value:** `re_RBuTvW6W_PAUJDVeaaW9xo7qrsGMQAnDK`
- **Environment:** Production, Preview, Development (select all)

### Optional (but recommended):
- **Name:** `RESEND_FROM_EMAIL`
- **Value:** `noreply@yourdomain.com` (or your verified domain email)
- **Environment:** Production, Preview, Development

- **Name:** `RESEND_FROM_NAME`
- **Value:** `Your HRIS` (or your company name)
- **Environment:** Production, Preview, Development

5. **Redeploy** your application after adding the variables

## For Local Development:

Create a `.env.local` file in `hr-platform/` directory:

```env
RESEND_API_KEY=re_RBuTvW6W_PAUJDVeaaW9xo7qrsGMQAnDK
RESEND_FROM_EMAIL=noreply@yourdomain.com
RESEND_FROM_NAME=Your HRIS
```

## For Standalone Email Service:

If using the standalone service in `email-service/`:

1. Navigate to `hr-platform/email-service/`
2. Create `.env` file:
```env
RESEND_API_KEY=re_RBuTvW6W_PAUJDVeaaW9xo7qrsGMQAnDK
RESEND_FROM_EMAIL=noreply@yourdomain.com
RESEND_FROM_NAME=Your HRIS
PORT=3001
```

## Testing:

After setting up, test the email service:

### Test Vercel Function:
```bash
curl -X POST https://your-app.vercel.app/api/send-email \
  -H "Content-Type: application/json" \
  -d '{
    "to": "test@example.com",
    "subject": "Test Email",
    "html": "<h1>Test</h1>",
    "text": "Test"
  }'
```

### Test Standalone Service:
```bash
cd hr-platform/email-service
npm test
```

## Important Notes:

⚠️ **Security:**
- Never commit API keys to git
- The `.env` file is already in `.gitignore`
- Keep your API key secret

✅ **Next Steps:**
1. Add the key to Vercel environment variables
2. Redeploy your application
3. Test email sending
4. (Optional) Verify your domain in Resend dashboard for custom "from" addresses

## Domain Verification (Optional):

To use custom email addresses like `noreply@yourdomain.com`:

1. Go to [Resend Dashboard](https://resend.com/domains)
2. Click **Add Domain**
3. Enter your domain
4. Add the DNS records to your domain registrar
5. Wait for verification
6. Use the verified email in `RESEND_FROM_EMAIL`

