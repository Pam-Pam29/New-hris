# Why Some Emails Work and Others Don't

## The Issue

**Password Reset Email** ✅ Works
- Uses Firebase's built-in email service
- Works in any environment (local dev, production)
- No API routes needed

**Other Emails** ❌ Don't Work in Local Dev
- Asset assignment notifications
- Employee invitations
- Leave approvals
- Meeting reminders
- etc.

These use **Resend API via Vercel serverless functions** which only work with:
- ✅ `vercel dev` (local with API routes)
- ✅ Production deployment
- ❌ `npm run dev` (Vite - no API routes)

---

## Quick Fix: Use Vercel Dev

### Step 1: Stop Current Dev Server
Press `Ctrl+C` in the terminal running `npm run dev`

### Step 2: Start Vercel Dev
```bash
cd hr-platform
npx vercel dev
```

### Step 3: Set Environment Variables
Vercel dev will ask you to link to a project or use local `.env.local`

Make sure `.env.local` has:
```env
RESEND_API_KEY=re_RBuTvW6W_PAUJDVeaaW9xo7qrsGMQAnDK
RESEND_FROM_EMAIL=onboarding@resend.dev
RESEND_FROM_NAME=Your HRIS
```

### Step 4: Test Again
Now all emails should work:
- ✅ Password reset (already worked)
- ✅ Asset assignment notifications
- ✅ Employee invitations
- ✅ All other HR emails

---

## Alternative: Deploy to Production

If you want to test in production instead:

```bash
cd hr-platform
vercel --prod
```

Then test on the production URL.

---

## Why This Happens

| Email Type | Service | Works With |
|------------|--------|------------|
| Password Reset | Firebase Auth | ✅ `npm run dev`<br>✅ `vercel dev`<br>✅ Production |
| Asset Notifications | Resend API | ❌ `npm run dev`<br>✅ `vercel dev`<br>✅ Production |
| Employee Invitations | Resend API | ❌ `npm run dev`<br>✅ `vercel dev`<br>✅ Production |
| All HR Emails | Resend API | ❌ `npm run dev`<br>✅ `vercel dev`<br>✅ Production |

---

## Summary

**Current Setup:**
- `npm run dev` → Password reset works ✅, Other emails fail ❌

**Solution:**
- `vercel dev` → All emails work ✅✅✅

**Or:**
- Deploy to production → All emails work ✅✅✅

