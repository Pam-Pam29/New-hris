# Updating Vercel Environment Variables for Resend

## What You Have:
- ✅ `RESEND_API_KEY` - Already in Shared Environment Variables
- ✅ `SMTP_FROM_EMAIL` - Can be reused or updated
- ✅ `EMAIL_API_KEY` - Keep this (for API security)

## What to Do:

### Option 1: Use Existing RESEND_API_KEY (Easiest)
If `RESEND_API_KEY` is already in **Shared Environment Variables**, it should be available to all projects. Just verify:

1. Go to your **hr-platform** project in Vercel
2. Settings → Environment Variables
3. Check if `RESEND_API_KEY` appears (it should if it's shared)
4. If it shows, you're done! ✅
5. If it doesn't show, add it to the hr-platform project specifically

### Option 2: Add RESEND_API_KEY to HR Platform Project
If the shared variable isn't working:

1. Go to **hr-platform** project
2. Settings → Environment Variables
3. Click **Add New**
4. Name: `RESEND_API_KEY`
5. Value: `re_RBuTvW6W_PAUJDVeaaW9xo7qrsGMQAnDK`
6. Environments: ✅ Production ✅ Preview ✅ Development
7. Click **Save**

### Optional: Update SMTP_FROM_EMAIL to RESEND_FROM_EMAIL
You can rename or add a new variable:

1. **Option A:** Keep `SMTP_FROM_EMAIL` (it will still work)
2. **Option B:** Add `RESEND_FROM_EMAIL` with the same value
   - Name: `RESEND_FROM_EMAIL`
   - Value: (same as your `SMTP_FROM_EMAIL`)
   - Environments: All

### What to Keep:
- ✅ `EMAIL_API_KEY` - Keep this! It's for securing your API endpoints
- ✅ `SMTP_FROM_EMAIL` - Can keep or rename to `RESEND_FROM_EMAIL`

### What You DON'T Need Anymore (but can keep):
- `SMTP_HOST` - Not needed with Resend
- `SMTP_PORT` - Not needed with Resend
- `SMTP_USER` - Not needed with Resend
- `SMTP_PASS` - Not needed with Resend
- `SMTP_SECURE` - Not needed with Resend

You can delete these if you want, but keeping them won't hurt.

## Summary:

**Edit/Add:**
- ✅ `RESEND_API_KEY` = `re_RBuTvW6W_PAUJDVeaaW9xo7qrsGMQAnDK` (if not already in project)
- ✅ `RESEND_FROM_EMAIL` = (same value as `SMTP_FROM_EMAIL`) - Optional

**Keep:**
- ✅ `EMAIL_API_KEY` - Don't change
- ✅ `SMTP_FROM_EMAIL` - Can keep or rename

**Can Delete (optional):**
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_SECURE`

## After Updating:

1. **Redeploy** your hr-platform:
   ```bash
   cd hr-platform
   vercel --prod
   ```

2. **Test** the email service:
   - Try sending a test email from your HR platform
   - Check Vercel function logs for any errors

## Quick Checklist:

- [ ] `RESEND_API_KEY` is set in hr-platform project (or shared)
- [ ] `RESEND_FROM_EMAIL` is set (optional, can use SMTP_FROM_EMAIL)
- [ ] Redeployed hr-platform
- [ ] Tested email sending

