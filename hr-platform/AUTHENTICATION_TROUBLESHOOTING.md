# 🔐 Authentication Troubleshooting Guide

## Common Issue: "Invalid Credential" Error

### Problem
When trying to login, you see:
```
❌ [HR Auth] Login error: FirebaseError: Firebase: Error (auth/invalid-credential).
```

### Solution

The error means the user account doesn't exist in Firebase yet. You have **two options**:

---

## Option 1: Create Account via Signup Flow (Recommended)

1. **Click "Start onboarding"** on the login page
   - This will guide you through company setup first
   - Then create your HR account

2. **Or click "sign up here"** on the login page
   - This goes directly to the signup form

3. **Fill in the signup form:**
   - Full Name
   - Email (e.g., `hr@yourcompany.com`)
   - Password (at least 6 characters)
   - Confirm Password

4. **Click "Create HR Account"**

5. **You'll be automatically logged in!**

---

## Option 2: Create User in Firebase Console

1. **Go to Firebase Console:**
   - https://console.firebase.google.com/project/hris-system-baa22/authentication/users

2. **Click "Add User"** (top right)

3. **Enter:**
   - **Email:** `hr@yourcompany.com` (or your email)
   - **Password:** (create a secure password)

4. **Click "Add User"**

5. **Return to HR Platform and login** with the credentials you just created

---

## Additional Notes

### About `hr@acme.com`
- This is just a **placeholder** shown in the UI
- It doesn't exist unless you create it
- You should use your own email address

### First-Time Setup
If this is your first time using the platform:
1. Start with **Onboarding** (`/onboarding`)
2. Complete company setup
3. Create your HR account
4. You'll be automatically logged in

### Error Messages Explained

| Error Code | Meaning | Solution |
|------------|---------|----------|
| `auth/invalid-credential` | Wrong email/password or user doesn't exist | Check credentials or sign up |
| `auth/user-not-found` | Email doesn't exist in Firebase | Sign up to create account |
| `auth/wrong-password` | Password is incorrect | Check password or reset it |
| `auth/too-many-requests` | Too many failed login attempts | Wait a few minutes and try again |

---

## Still Having Issues?

1. **Check Firebase Authentication is enabled:**
   - Go to: https://console.firebase.google.com/project/hris-system-baa22/authentication/providers
   - Ensure "Email/Password" is **Enabled**

2. **Check environment variables:**
   - Make sure Firebase config is set in Vercel environment variables
   - Check that `VITE_FIREBASE_*` variables are configured

3. **Clear browser cache:**
   - Hard refresh: `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)

4. **Check browser console:**
   - Open DevTools (F12)
   - Look for any additional error messages

---

## Quick Links

- **Onboarding:** `/onboarding`
- **Signup:** `/hr-onboarding-signup` or `/signup`
- **Firebase Users:** https://console.firebase.google.com/project/hris-system-baa22/authentication/users
- **Firebase Auth Settings:** https://console.firebase.google.com/project/hris-system-baa22/authentication/providers

