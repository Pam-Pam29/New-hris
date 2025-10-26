# 📦 Cloudinary Document Storage Setup

Your HRIS now uses **Cloudinary** for document storage! No more CORS issues! 🎉

## 🚀 Quick Setup (5 minutes)

### Step 1: Create Cloudinary Account
1. Go to: https://cloudinary.com/users/register_free
2. Sign up with your email
3. Verify your email

### Step 2: Get Your Credentials
1. Login to Cloudinary Dashboard
2. You'll see your credentials at the top:
   - **Cloud Name** (e.g., `dxxxxx`)
   - **API Key** (e.g., `123456789012345`)
   - **API Secret** (keep this secret!)

### Step 3: Create Upload Preset
1. Click on the ⚙️ **Settings** icon (top right)
2. Go to **Upload** tab
3. Scroll to **Upload presets**
4. Click **Add upload preset**
5. Configure:
   - **Upload preset name**: `hris-documents`
   - **Signing Mode**: Select **Unsigned** ⚠️ (very important!)
   - **Folder**: Leave empty
   - **Use filename**: Yes
   - Click **Save**

### Step 4: Add Environment Variables to Vercel

#### For Employee Platform:
1. Go to: https://vercel.com/pam-pam29s-projects/hris-employee-platform/settings/environment-variables
2. Add these variables:
   - **Name**: `VITE_CLOUDINARY_CLOUD_NAME`
   - **Value**: Your cloud name from Step 2
   - Click **Save**

   - **Name**: `VITE_CLOUDINARY_UPLOAD_PRESET`
   - **Value**: `hris-documents`
   - Click **Save**

#### For HR Platform:
1. Go to: https://vercel.com/pam-pam29s-projects/hr-platform/settings/environment-variables
2. Add the same variables as above

### Step 5: Deploy Firestore Rules
Run this command to deploy the security rules:
```bash
firebase deploy --only firestore:rules
```

### Step 6: Redeploy Both Platforms
The platforms will automatically redeploy after you add the environment variables!

---

## ✅ What You Get

- **No CORS issues** - Direct browser uploads to Cloudinary
- **25 GB free storage** + 25 GB bandwidth per month
- **Fast CDN delivery** - Documents load super fast
- **Secure** - Unsigned presets are safe for uploads
- **Document tracking** - Metadata stored in Firestore
- **Multi-format support** - PDFs, images, Office documents

---

## 🎯 How It Works

1. **Employee/HR uploads document** → Browser sends directly to Cloudinary
2. **Cloudinary returns secure URL** → No backend needed!
3. **Metadata saved to Firestore** → For listing and tracking
4. **View/Download** → Direct from Cloudinary CDN

No servers, no CORS, no headaches! 🚀

---

## 📝 After Setup

Once you've added the environment variables to Vercel:
1. Employee Platform will auto-redeploy
2. HR Platform will auto-redeploy
3. Test document upload - it should work instantly!
4. Documents will appear in your Cloudinary Media Library

**Need help?** Let me know your Cloudinary credentials and I'll add them for you!

