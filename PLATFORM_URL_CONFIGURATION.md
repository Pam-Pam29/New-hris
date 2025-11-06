# 🔗 Platform URL Configuration System

## Overview

This system allows the HR platform to dynamically update employee platform URLs when they change after redeployment, without requiring a redeploy of the HR platform itself.

## How It Works

### 1. **Platform Config Service** (`hr-platform/src/services/platformConfigService.ts`)

This service manages platform URLs in Firebase:
- **Stores URLs in Firebase**: `systemConfig/platform_config` collection
- **Caches for 5 minutes**: Reduces Firebase reads
- **Falls back to environment variables**: If Firebase config doesn't exist

### 2. **Dynamic Setup Link Generation**

The `getEmployeeSetupLink()` function in `EmployeeDirectory.tsx`:
1. **First tries Firebase config** (can be updated without redeploy)
2. **Falls back to environment variable** (`VITE_EMPLOYEE_PLATFORM_URL`)
3. **Falls back to hardcoded default** (last resort)

### 3. **Settings Page UI** (`hr-platform/src/pages/Hr/Settings/Settings.tsx`)

HR administrators can:
- View current platform URLs
- Update employee platform URL
- Update careers platform URL (optional)
- Update HR platform URL (optional)
- Changes take effect immediately (no redeploy needed)

## Usage

### For HR Administrators

1. **Go to Settings**: Navigate to `/hr/settings` in the HR platform
2. **Find "Platform URLs Configuration"**: In the General tab
3. **Update Employee Platform URL**: 
   - When employee platform is redeployed, copy the new Vercel URL
   - Paste it into the "Employee Platform URL" field
   - Click "Save Platform URLs"
4. **Done!**: All new setup links will use the updated URL

### Initial Setup

When the HR platform first loads, it will:
1. Check Firebase for platform config
2. If not found, use environment variables from `.env`
3. If environment variables are missing, use hardcoded defaults

### Recommended Workflow

1. **After deploying employee platform**:
   - Copy the new Vercel deployment URL
   - Go to HR platform Settings
   - Update the Employee Platform URL
   - Save

2. **All subsequent setup links** will automatically use the new URL

## Firebase Structure

```
systemConfig/
  └── platform_config/
      ├── employeePlatformUrl: "https://..."
      ├── careersPlatformUrl: "https://..." (optional)
      ├── hrPlatformUrl: "https://..." (optional)
      ├── updatedAt: Timestamp
      └── updatedBy: "Company Name"
```

## Security

- **Read access**: All authenticated users can read platform config
- **Write access**: Only HR/Admin users can update platform config
- **Firestore rules**: Updated in `firestore.rules`

## Benefits

✅ **No redeployment needed**: Update URLs without redeploying HR platform  
✅ **Immediate effect**: Changes apply to all new setup links instantly  
✅ **Fallback system**: Multiple layers of fallback ensure setup links always work  
✅ **User-friendly**: Simple UI for HR administrators  
✅ **Cached**: Reduces Firebase reads with 5-minute cache

## Troubleshooting

### Setup links still using old URL?

1. **Check Firebase config**: Go to Firebase Console → Firestore → `systemConfig` collection
2. **Verify HR user has admin role**: Check `hrUsers/{userId}` document
3. **Clear cache**: Wait 5 minutes or restart the HR platform

### URL not updating?

1. **Check Firestore rules**: Ensure HR/Admin can write to `systemConfig`
2. **Check browser console**: Look for errors when saving
3. **Verify user role**: User must be HR or Admin

### Want to reset to environment variable?

1. Go to Settings
2. Clear the Employee Platform URL field
3. Save (will use environment variable as fallback)

