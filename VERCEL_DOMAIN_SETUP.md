# 🌐 Adding Vercel Domains to Firebase

## Required Action

You need to add your Vercel domains to Firebase Authentication to resolve the OAuth error.

## Steps:

### 1. Go to Firebase Console
Visit: https://console.firebase.google.com/project/hris-system-baa22/authentication/settings/authorized-domains

### 2. Add Your Vercel Domains

Add the following domains to the authorized domains list:

```
hr-platform-ghvstzds9-pam-pam29s-projects.vercel.app
hris-employee-platform-r27soltjn-pam-pam29s-projects.vercel.app
hris-careers-platform-41asxcdo2-pam-pam29s-projects.vercel.app
*.vercel.app
```

**Note:** Adding `*.vercel.app` will authorize all Vercel preview deployments automatically.

### 3. Save Changes

Click "Add" for each domain, then click "Save".

## Current Production Domains:

- **HR Platform:** hr-platform-ghvstzds9-pam-pam29s-projects.vercel.app
- **Employee Platform:** hris-employee-platform-r27soltjn-pam-pam29s-projects.vercel.app
- **Careers Platform:** hris-careers-platform-41asxcdo2-pam-pam29s-projects.vercel.app

## Why This is Needed:

Firebase requires explicit authorization for OAuth operations (signInWithPopup, signInWithRedirect, etc.) to prevent unauthorized redirects.

## After Adding Domains:

The Careers platform should work without permission errors!

## Multi-Company URLs

Yes! The careers platform supports different URLs for different companies:

### Current Setup:
- Each company has a unique `domain` field (e.g., "acme", "techcorp")
- Each company has a unique `careersSlug` in settings
- URLs follow the pattern: `/careers/{slug}`

### Example URLs:
- `/careers/acme` → Shows Acme Corporation jobs
- `/careers/techcorp` → Shows TechCorp jobs
- `/careers/globex` → Shows Globex jobs

### How It Works:

1. HR creates a company with a domain (e.g., "acme")
2. Company gets a `careersSlug` (e.g., "acme")
3. Jobs are filtered by `companyId`
4. Careers platform shows only that company's jobs

### Current Example:
```
https://hris-careers-platform-41asxcdo2-pam-pam29s-projects.vercel.app/careers/siro
```

This would show only Siro company's jobs!
