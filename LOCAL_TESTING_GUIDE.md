# Local Testing Guide

This guide will help you set up and test all three platforms locally.

## 📋 Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Firebase project access (`hris-system-baa22`)
- Vercel CLI (optional, for full-stack testing with API routes)

## 🚀 Quick Start

### 1. Install Dependencies

```bash
# Install root dependencies
npm install

# Install dependencies for each platform
cd hr-platform && npm install && cd ..
cd employee-platform && npm install && cd ..
cd careers-platform && npm install && cd ..
```

### 2. Set Up Environment Variables

Each platform needs Firebase configuration. Create `.env.local` files in each platform directory:

#### HR Platform (`hr-platform/.env.local`)

```env
# Firebase Configuration
VITE_FIREBASE_API_KEY=AIzaSyC6ovwlhX4Mr8WpHoS045wLxHA7t8fRXPI
VITE_FIREBASE_AUTH_DOMAIN=hris-system-baa22.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=hris-system-baa22
VITE_FIREBASE_STORAGE_BUCKET=hris-system-baa22.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=563898942372
VITE_FIREBASE_APP_ID=1:563898942372:web:8c5ebae1dfaf072858b731
VITE_FIREBASE_MEASUREMENT_ID=G-1DJP5DJX92

# Google Calendar API (optional)
VITE_GOOGLE_CLIENT_ID=834186928439-hefqcon4htpnvoothipfcdoukk1792m4.apps.googleusercontent.com
VITE_GOOGLE_CLIENT_SECRET=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
VITE_GOOGLE_API_KEY=AIzaSyDx4YYHUSYli0ix7oRu9j2zmTVztOpn3Cw

# Email Service (optional - for testing emails)
RESEND_API_KEY=your-resend-api-key
RESEND_FROM_EMAIL=noreply@yourdomain.com
RESEND_FROM_NAME=Your HRIS
EMAIL_API_KEY=your-api-key
```

#### Employee Platform (`employee-platform/.env.local`)

```env
# Firebase Configuration
VITE_FIREBASE_API_KEY=AIzaSyC6ovwlhX4Mr8WpHoS045wLxHA7t8fRXPI
VITE_FIREBASE_AUTH_DOMAIN=hris-system-baa22.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=hris-system-baa22
VITE_FIREBASE_STORAGE_BUCKET=hris-system-baa22.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=563898942372
VITE_FIREBASE_APP_ID=1:563898942372:web:8c5ebae1dfaf072858b731
VITE_FIREBASE_MEASUREMENT_ID=G-1DJP5DJX92

# Google Calendar API (optional)
VITE_GOOGLE_CLIENT_ID=834186928439-hefqcon4htpnvoothipfcdoukk1792m4.apps.googleusercontent.com
VITE_GOOGLE_CLIENT_SECRET=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
VITE_GOOGLE_API_KEY=AIzaSyDx4YYHUSYli0ix7oRu9j2zmTVztOpn3Cw
```

#### Careers Platform (`careers-platform/.env.local`)

```env
# Firebase Configuration
VITE_FIREBASE_API_KEY=AIzaSyC6ovwlhX4Mr8WpHoS045wLxHA7t8fRXPI
VITE_FIREBASE_AUTH_DOMAIN=hris-system-baa22.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=hris-system-baa22
VITE_FIREBASE_STORAGE_BUCKET=hris-system-baa22.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=563898942372
VITE_FIREBASE_APP_ID=1:563898942372:web:8c5ebae1dfaf072858b731
VITE_FIREBASE_MEASUREMENT_ID=G-1DJP5DJX92
```

### 3. Start Development Servers

You have two options for running the platforms:

#### Option A: Vite Dev Server (Frontend Only) ⚡ Fast

**Pros:**
- ✅ Fast hot reload
- ✅ Firebase integration works
- ✅ Good for UI/UX testing

**Cons:**
- ❌ API routes won't work (email sending, etc.)

**Commands:**

Open **3 separate terminal windows**:

**Terminal 1 - HR Platform:**
```bash
cd hr-platform
npm run dev
# Runs on http://localhost:3001
```

**Terminal 2 - Employee Platform:**
```bash
cd employee-platform
npm run dev
# Runs on http://localhost:3002
```

**Terminal 3 - Careers Platform:**
```bash
cd careers-platform
npm run dev
# Runs on http://localhost:3004
```

#### Option B: Vercel Dev (Full Stack) ✅ Recommended for Complete Testing

**Pros:**
- ✅ All API routes work (email sending, document upload, etc.)
- ✅ Closest to production environment
- ✅ Full feature testing

**Cons:**
- ⚠️ Slightly slower startup

**Commands:**

**Terminal 1 - HR Platform:**
```bash
cd hr-platform
npx vercel dev
# Runs on http://localhost:3000 (or next available port)
```

**Terminal 2 - Employee Platform:**
```bash
cd employee-platform
npx vercel dev
# Runs on http://localhost:3000 (or next available port)
```

**Terminal 3 - Careers Platform:**
```bash
cd careers-platform
npm run dev
# Runs on http://localhost:3004
```

> **Note:** For HR Platform, use `vercel dev` if you need to test email functionality. For Employee and Careers platforms, `npm run dev` is usually sufficient.

## 🧪 Testing Checklist

Based on the `COMPANYID_SYNC_AUDIT.md`, here's what to test:

### Cross-Platform Real-Time Synchronization

#### Asset Management
- [ ] **Create asset in HR platform** → Verify immediate appearance in Employee platform (< 1 second)
- [ ] **Assign asset to employee in HR** → Verify immediate update in Employee MyAssets page
- [ ] **Create asset request in Employee platform** → Verify immediate appearance in HR Asset Requests
- [ ] **Update asset status in HR** → Verify immediate sync in Employee platform

#### Performance Management
- [ ] **Schedule performance meeting in HR** → Verify immediate sync across platforms
- [ ] **Create performance goal in HR** → Verify immediate sync
- [ ] **Update goal status** → Verify immediate sync

#### Payroll
- [ ] **Update payroll record in HR** → Verify immediate sync in Employee platform
- [ ] **Create payroll entry** → Verify immediate visibility

#### Leave Management
- [ ] **Create leave request in Employee platform** → Verify immediate sync in HR platform
- [ ] **Approve/reject leave in HR** → Verify immediate sync in Employee platform
- [ ] **Update leave balance** → Verify immediate sync

#### Policy Management
- [ ] **Create policy in HR** → Verify immediate sync in Employee platform
- [ ] **Acknowledge policy in Employee** → Verify immediate sync in HR

#### Time Management
- [ ] **Clock in/out in Employee platform** → Verify immediate sync in HR
- [ ] **Update time entry in HR** → Verify immediate sync

### Company Isolation Testing

- [ ] **Switch between companies** → Verify data isolation (only current company's data shown)
- [ ] **Create data in Company A** → Verify it doesn't appear in Company B
- [ ] **Verify all queries filter by companyId** (check browser console for proper filtering)
- [ ] **Test with multiple browser windows** (different companies) → Verify no data leakage

### Real-Time Performance

- [ ] **Verify updates appear within 1-2 seconds** across platforms
- [ ] **Verify no duplicate data** from other companies
- [ ] **Check console logs** for proper companyId filtering (no "filtering in memory" warnings if possible)
- [ ] **Test with slow network** (throttle in DevTools) → Verify sync still works

### UI/UX Testing

- [ ] **HR Platform Dashboard** → All widgets load correctly
- [ ] **Employee Platform Dashboard** → All widgets load correctly
- [ ] **Navigation** → All routes work without errors
- [ ] **Forms** → All forms submit correctly
- [ ] **Real-time updates** → UI updates smoothly without flickering

### Authentication & Authorization

- [ ] **HR Login** → Works correctly
- [ ] **Employee Login** → Works correctly
- [ ] **Company context** → Correct company loaded after login
- [ ] **Protected routes** → Redirect to login if not authenticated
- [ ] **Role-based access** → Correct permissions applied

## 🔍 Debugging Tips

### Check Browser Console

Look for:
- ✅ `✅ Firebase initialized successfully`
- ✅ `✅ Real-time listener attached for [collection]`
- ⚠️ `⚠️ Filtering in memory` (indicates missing composite index - not critical but should be addressed)
- ❌ `❌ Missing required Firebase environment variables` (fix immediately)

### Check Network Tab

- Verify Firebase requests are being made
- Check for 404 errors on API routes (if using `npm run dev` instead of `vercel dev`)
- Verify WebSocket connections for real-time updates

### Check Firebase Console

- Go to [Firebase Console](https://console.firebase.google.com/project/hris-system-baa22)
- Monitor Firestore collections for real-time updates
- Check that `companyId` is present in all documents

## 🐛 Common Issues & Solutions

### Issue: "Missing required Firebase environment variables"

**Solution:**
1. Create `.env.local` file in the platform directory
2. Copy environment variables from setup docs
3. Restart the dev server

### Issue: Email API returns 404

**Solution:** Use `npx vercel dev` instead of `npm run dev` for HR platform

### Issue: Port already in use

**Solution:**
- HR Platform: Change port in `hr-platform/vite.config.ts` (default: 3001)
- Employee Platform: Change port in `employee-platform/vite.config.ts` (default: 3002)
- Careers Platform: Change port in `careers-platform/vite.config.ts` (default: 3004)

### Issue: Real-time updates not working

**Solution:**
1. Check browser console for errors
2. Verify Firebase connection
3. Check that `companyId` is being passed correctly
4. Verify Firestore rules allow read access

### Issue: Data from wrong company showing

**Solution:**
1. Check that `companyId` is set correctly in CompanyContext
2. Verify all queries include `companyId` filter
3. Check browser console for filtering warnings

## 📊 Testing Real-Time Sync

To test real-time synchronization:

1. **Open HR Platform** in one browser window/tab
2. **Open Employee Platform** in another browser window/tab (or different browser)
3. **Make a change in HR Platform** (e.g., assign an asset)
4. **Watch Employee Platform** - it should update within 1-2 seconds automatically
5. **Make a change in Employee Platform** (e.g., create leave request)
6. **Watch HR Platform** - it should update within 1-2 seconds automatically

## 🎯 Focus Areas (Based on Recent Changes)

Based on `COMPANYID_SYNC_AUDIT.md`, pay special attention to:

1. **Asset Management** - Recently fixed with companyId filtering
2. **Performance Management** - Recently fixed with companyId validation
3. **Real-time listeners** - All should filter by companyId
4. **Cross-platform sync** - Should be immediate (< 1 second)

## 📝 Notes

- All platforms share the same Firebase project (`hris-system-baa22`)
- Changes in one platform should immediately reflect in others
- Company isolation is critical - always verify data is filtered by companyId
- Use browser DevTools to monitor network requests and console logs

## 🚀 Next Steps After Local Testing

1. Test on staging/production environments
2. Create composite indexes in Firebase Console if needed
3. Monitor console logs for any "filtering in memory" warnings
4. Verify all features work as expected
5. Document any issues found

---

**Happy Testing! 🎉**

