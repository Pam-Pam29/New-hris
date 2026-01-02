# Quick Start Guide

## Option 1: Use with Vercel Functions (Recommended)

The Vercel serverless functions already use Resend. Just:

1. **Install Resend package:**
   ```bash
   cd hr-platform
   npm install resend
   ```

2. **Add environment variable in Vercel:**
   - Go to Vercel dashboard → Your project → Settings → Environment Variables
   - Add: `RESEND_API_KEY` = `re_xxxxxxxxxxxxxxxxxxxxx`
   - Add (optional): `RESEND_FROM_EMAIL` = `noreply@yourdomain.com`
   - Add (optional): `RESEND_FROM_NAME` = `Your HRIS`

3. **Deploy:**
   ```bash
   vercel --prod
   ```

That's it! Your existing Vercel functions now use Resend instead of SMTP.

## Option 2: Standalone Node.js Service

Run the email service as a separate Node.js app:

1. **Navigate to email service:**
   ```bash
   cd hr-platform/email-service
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment:**
   ```bash
   # Create .env file
   echo "RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxx" > .env
   echo "RESEND_FROM_EMAIL=noreply@yourdomain.com" >> .env
   echo "RESEND_FROM_NAME=Your HRIS" >> .env
   ```

4. **Run the service:**
   ```bash
   npm start
   # or for development with auto-reload:
   npm run dev
   ```

5. **Test it:**
   ```bash
   # Health check
   curl http://localhost:3001/health

   # Send test email
   npm test
   ```

6. **Update frontend to use this service:**
   - Update `vercelEmailService.ts` to point to your service URL
   - Or deploy this service and update the base URL

## What Changed?

### Before (Nodemailer + SMTP):
- Required: SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_SECURE
- Complex configuration
- Connection issues
- Provider-specific problems

### After (Resend):
- Required: RESEND_API_KEY
- Simple API-based
- Better reliability
- Works with all email providers

## Files Created/Updated

### New Files:
- `api/_resend.mjs` - Resend service for Vercel functions
- `email-service/` - Standalone Node.js app
  - `server.js` - Express server
  - `routes/emailRoutes.js` - API routes
  - `services/resendService.js` - Resend integration
  - `package.json` - Dependencies
  - `README.md` - Full documentation

### Updated Files:
- `api/send-email.js` - Now uses Resend
- `api/send-hr-email.js` - Now uses Resend
- `package.json` - Added resend dependency

## Next Steps

1. Get Resend API key from [resend.com](https://resend.com)
2. Add `RESEND_API_KEY` to Vercel environment variables
3. Deploy to Vercel
4. Test email sending

No frontend changes needed! Everything works the same way.

