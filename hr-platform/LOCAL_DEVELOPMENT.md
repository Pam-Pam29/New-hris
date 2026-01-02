# Local Development Setup

## Running the HR Platform Locally

### Option 1: Vite Dev Server (Frontend Only) ⚠️

```bash
cd hr-platform
npm run dev
```

**Limitations:**
- ✅ Frontend works perfectly
- ✅ Firebase integration works
- ❌ Email API routes (`/api/send-email`, `/api/send-hr-email`) **WON'T WORK**
- ❌ Other API routes won't work

**Use this when:**
- Testing UI/UX changes
- Testing Firebase features
- Not testing email functionality

---

### Option 2: Vercel Dev (Full Stack) ✅ **Recommended for Testing**

```bash
cd hr-platform
npx vercel dev
```

**Benefits:**
- ✅ Frontend works
- ✅ Firebase integration works
- ✅ **Email API routes work** (`/api/send-email`, `/api/send-hr-email`)
- ✅ All serverless functions work
- ✅ Closest to production environment

**Use this when:**
- Testing email functionality
- Testing complete features
- Testing before deployment

---

## Environment Variables for Local Development

Create `.env.local` file in `hr-platform/`:

```env
# Firebase (required)
VITE_FIREBASE_API_KEY=your-key
VITE_FIREBASE_AUTH_DOMAIN=your-domain
VITE_FIREBASE_PROJECT_ID=your-project
VITE_FIREBASE_STORAGE_BUCKET=your-bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id

# Resend (for email - required when testing emails)
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxx
RESEND_FROM_EMAIL=noreply@yourdomain.com
RESEND_FROM_NAME=Your HRIS

# Optional
EMAIL_API_KEY=your-api-key
```

---

## Testing Email Functionality

### With `vercel dev`:

1. **Start Vercel dev server:**
   ```bash
   cd hr-platform
   npx vercel dev
   ```

2. **Set environment variables:**
   - Vercel dev will prompt you to link to a project or use local `.env.local`
   - Make sure `RESEND_API_KEY` is set

3. **Test email:**
   - Create an employee
   - Assign an asset
   - Emails should send successfully

### With `npm run dev`:

- Email API routes will return 404
- You'll see a warning in console
- Other features work fine
- Use this for UI testing only

---

## Quick Commands

```bash
# Frontend only (no API routes)
npm run dev

# Full stack (with API routes)
npx vercel dev

# Build for production
npm run build

# Preview production build
npm run preview
```

---

## Troubleshooting

### Issue: Email API returns 404

**Solution:** Use `vercel dev` instead of `npm run dev`

### Issue: Resend API key not found

**Solution:** 
1. Add `RESEND_API_KEY` to `.env.local`
2. Or set it in Vercel project settings
3. Restart dev server

### Issue: Port already in use

**Solution:**
- Vite default: port 3001 (change in `vite.config.ts`)
- Vercel dev: port 3000 (change with `--port` flag)

---

## Current Status

✅ **DOB Feature:** Working (saves to Firebase correctly)
✅ **Asset Notifications:** Code ready (needs `vercel dev` to test emails)
✅ **Location Filtering:** Working
⚠️ **Email Testing:** Requires `vercel dev` or production deployment

