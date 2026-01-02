# Simple Resend Setup for Vercel

## You DON'T need a separate Node.js app!

Your Vercel serverless functions in `api/` folder already use Resend. Just follow these steps:

## Step 1: Install Resend Package

```bash
cd hr-platform
npm install resend
```

## Step 2: Add API Key to Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your `hr-platform` project
3. Go to **Settings** → **Environment Variables**
4. Click **Add New**
5. Add:
   - **Name:** `RESEND_API_KEY`
   - **Value:** `re_RBuTvW6W_PAUJDVeaaW9xo7qrsGMQAnDK`
   - **Environments:** ✅ Production ✅ Preview ✅ Development
6. Click **Save**

## Step 3: Deploy

```bash
cd hr-platform
vercel --prod
```

Or just push to your git repository (if auto-deploy is enabled).

## That's it! ✅

Your email service will now work with Resend. The Vercel functions at:
- `/api/send-email`
- `/api/send-hr-email`

...will automatically use Resend instead of SMTP.

## Testing

After deployment, test it:

```bash
curl -X POST https://your-app.vercel.app/api/send-email \
  -H "Content-Type: application/json" \
  -d '{
    "to": "your-email@example.com",
    "subject": "Test Email",
    "html": "<h1>Test</h1>",
    "text": "Test"
  }'
```

## About the `email-service/` folder

The `email-service/` folder is **optional**. It's a standalone Node.js app that you can use if you want to:
- Run email service on a different platform (Railway, Render, etc.)
- Have more control over the email service
- Run it separately from your main app

**You don't need it if you're using Vercel functions!** Just ignore that folder.

## What Changed?

- ✅ `api/send-email.js` - Now uses Resend
- ✅ `api/send-hr-email.js` - Now uses Resend  
- ✅ `api/_resend.mjs` - New Resend service module
- ❌ No frontend changes needed
- ❌ No separate deployment needed

Your existing code will work exactly the same way!

