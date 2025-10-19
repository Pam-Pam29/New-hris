# 🚨 IMMEDIATE ACTION PLAN - Critical Security Fixes

**Date:** October 10, 2025  
**Priority:** URGENT - Execute within 24 hours

---

## ⚠️ CRITICAL SECURITY ISSUE DISCOVERED

Your Firebase and Google API credentials are **exposed in source code**. This is a severe security vulnerability that must be fixed immediately.

---

## 🔥 STEP 1: Rotate API Keys (Do First!)

### Firebase Console:
1. Go to: https://console.firebase.google.com/project/hris-system-baa22/settings/general
2. **Delete** the current Web App
3. **Create new** Web App with new credentials
4. **Copy** the new config (keep it private!)

### Google Cloud Console:
1. Go to: https://console.cloud.google.com/apis/credentials
2. **Delete** OAuth 2.0 Client ID: `834186928439-hefqcon4htpnvoothipfcdoukk1792m4`
3. **Create new** OAuth 2.0 Client ID
4. **Delete** API Key: `AIzaSyDx4YYHUSYli0ix7oRu9j2zmTVztOpn3Cw`
5. **Create new** API Key with proper restrictions

---

## 🛡️ STEP 2: Create .gitignore Files

### Root .gitignore
Create: `c:\Users\pampam\New folder (21)\New-hris\.gitignore`

```gitignore
# Environment variables - NEVER COMMIT THESE!
.env
.env.local
.env.production
.env.development
*.env

# Dependencies
node_modules/
package-lock.json

# Build outputs
dist/
build/
.vite/
*.tsbuildinfo

# IDE
.vscode/
.idea/
*.swp
*.swo
.DS_Store

# Logs
*.log
pglite-debug.log
npm-debug.log*
yarn-debug.log*

# Firebase
.firebase/
firebase-debug.log
firestore-debug.log

# OS
Thumbs.db
.DS_Store
```

### HR Platform .gitignore
Create: `c:\Users\pampam\New folder (21)\New-hris\hr-platform\.gitignore`

```gitignore
# Environment variables
.env
.env.local
.env.production

# Build
dist/
node_modules/
.vite/

# Logs
*.log
```

### Employee Platform .gitignore
Create: `c:\Users\pampam\New folder (21)\New-hris\employee-platform\.gitignore`

```gitignore
# Environment variables
.env
.env.local
.env.production

# Build
dist/
node_modules/
.vite/

# Logs
*.log
```

---

## 🔐 STEP 3: Remove Hardcoded Credentials

### Files to Update:

#### 1. HR Platform Firebase Config
**File:** `hr-platform/src/config/firebase.ts`

**Replace lines 8-16 with:**
```typescript
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Validate required config
if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
  throw new Error('Firebase configuration is missing. Please check your .env file.');
}
```

#### 2. Employee Platform Firebase Config
**File:** `employee-platform/src/config/firebase.ts`

**Replace lines 7-15 with the same code as above**

---

## 📝 STEP 4: Create .env Files (with NEW credentials from Step 1)

### HR Platform .env
Create: `hr-platform/.env`

```env
# Firebase Configuration (USE NEW KEYS FROM STEP 1!)
VITE_FIREBASE_API_KEY=your_new_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_new_auth_domain
VITE_FIREBASE_PROJECT_ID=your_new_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_new_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_new_sender_id
VITE_FIREBASE_APP_ID=your_new_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_new_measurement_id

# Google API (USE NEW KEYS FROM STEP 1!)
VITE_GOOGLE_CLIENT_ID=your_new_client_id
VITE_GOOGLE_CLIENT_SECRET=your_new_client_secret
VITE_GOOGLE_API_KEY=your_new_google_api_key

# Service Config
VITE_DEFAULT_SERVICE=firebase
VITE_PLATFORM_TYPE=hr
```

### Employee Platform .env
Create: `employee-platform/.env`

```env
# Firebase Configuration (SAME NEW KEYS AS HR PLATFORM)
VITE_FIREBASE_API_KEY=your_new_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_new_auth_domain
VITE_FIREBASE_PROJECT_ID=your_new_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_new_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_new_sender_id
VITE_FIREBASE_APP_ID=your_new_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_new_measurement_id

# Google API (SAME NEW KEYS AS HR PLATFORM)
VITE_GOOGLE_CLIENT_ID=your_new_client_id
VITE_GOOGLE_CLIENT_SECRET=your_new_client_secret
VITE_GOOGLE_API_KEY=your_new_google_api_key

# Service Config
VITE_DEFAULT_SERVICE=firebase
VITE_PLATFORM_TYPE=employee
```

---

## 📚 STEP 5: Delete Exposed Credentials from Documentation

**Delete or move to archive folder:**

These files contain exposed credentials:
- `HR_PLATFORM_ENV_SETUP.txt` ❌
- `EMPLOYEE_PLATFORM_ENV_SETUP.txt` ❌
- `GOOGLE_API_CREDENTIALS.md` ❌
- `ENVIRONMENT_SETUP.md` ❌ (update with placeholders)

**Or update them with:**
```
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_GOOGLE_CLIENT_SECRET=your_client_secret_here
```

---

## 🔍 STEP 6: Check Git History

If you've already committed these credentials to a git repository:

```bash
# Check if credentials are in git history
git log --all --full-history --source --pretty=format:"%H" -- "*firebase.ts" | head -5

# If found, you MUST:
# 1. Rotate ALL credentials immediately
# 2. Consider using git-filter-repo to remove from history
# 3. Force push to remote (if applicable)
# 4. Notify team members to re-clone
```

⚠️ **Warning:** If credentials are in git history, they are compromised even after deletion!

---

## ✅ STEP 7: Verify & Test

### Verification Checklist:
- [ ] New Firebase credentials created
- [ ] Old credentials deleted/disabled
- [ ] New Google API credentials created  
- [ ] Old Google credentials deleted
- [ ] `.gitignore` files created
- [ ] `.env` files created with NEW credentials
- [ ] Hardcoded credentials removed from code
- [ ] Documentation files updated/deleted
- [ ] Git history checked
- [ ] Both platforms restart successfully

### Test Commands:
```bash
# HR Platform
cd hr-platform
npm run dev
# Should see: ✅ Firebase initialized successfully

# Employee Platform (new terminal)
cd employee-platform  
npm run dev
# Should see: ✅ Firebase initialized successfully
```

---

## 🚫 NEVER DO THIS AGAIN!

### Best Practices Going Forward:

1. ✅ **ALWAYS** use `.env` files for secrets
2. ✅ **ALWAYS** add `.env` to `.gitignore` FIRST
3. ✅ **NEVER** commit API keys, passwords, or secrets
4. ✅ **NEVER** hardcode credentials in source code
5. ✅ **ALWAYS** use environment variables
6. ✅ **ALWAYS** use `.env.example` with placeholder values
7. ✅ **ROTATE** credentials if accidentally exposed

### Create .env.example files:

**hr-platform/.env.example:**
```env
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
# ... etc
```

This file CAN be committed - it shows required variables without exposing values.

---

## 📞 If Credentials Already Exploited

**Signs of compromise:**
- Unexpected Firebase usage/costs
- Unknown data in database
- Unauthorized Google API calls
- Strange authentication attempts

**Immediate actions:**
1. Disable ALL old credentials
2. Review Firebase/Google Cloud audit logs
3. Check for unauthorized data access
4. Consider notifying users if data was accessed
5. Implement Firebase Security Rules
6. Enable 2FA on admin accounts
7. Review and restrict API key permissions

---

## 🎯 Priority Summary

**TODAY (Next 2 hours):**
1. Rotate all API keys ⚠️
2. Create .gitignore files ⚠️
3. Remove hardcoded credentials ⚠️
4. Create .env files ⚠️

**THIS WEEK:**
1. Fix code duplication issues
2. Consolidate shared services
3. Organize documentation

**Read the full analysis:**
- See `CODEBASE_ISSUES_REPORT.md` for complete list of issues

---

**⏰ Time to Complete:** 1-2 hours  
**⚠️ Risk Level:** CRITICAL  
**💰 Cost of Not Fixing:** Potential data breach, API abuse, financial loss

**START NOW!**










