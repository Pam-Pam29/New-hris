# Quick Deployment Guide

## 🚀 Fast Deployment Commands

### Option 1: Use PowerShell Script (Recommended)
```powershell
.\deploy.ps1
```

### Option 2: Manual Deployment

#### HR Platform
```powershell
cd hr-platform
vercel deploy --prod --yes
cd ..
```

#### Employee Platform
```powershell
cd employee-platform
vercel deploy --prod --yes
cd ..
```

#### Careers Platform (Optional)
```powershell
cd careers-platform
vercel deploy --prod --yes
cd ..
```

### After Deployment - Run Backfill Script
```powershell
$env:GOOGLE_APPLICATION_CREDENTIALS = "C:\hris-admin.json\hris-system-baa22-firebase-adminsdk-fbsvc-81a3572f70.json"
node scripts\backfillPlatformConfig.js
```

---

## ✅ Quick Test Checklist

After deployment, quickly verify:

1. **Employee Platform - Book Meeting**
   - [ ] Page loads with 3 tabs
   - [ ] Stat cards show (Approved/Pending Meetings)
   - [ ] Can create manual meeting request
   - [ ] Meetings appear in "My Meetings" tab

2. **Employee Platform - Performance**
   - [ ] Only 2 tabs (Goals, Reviews)
   - [ ] No Meetings tab
   - [ ] No meeting stat cards

3. **HR Platform - Performance Review**
   - [ ] Employee field is dropdown
   - [ ] Can select employee and create review

4. **HR Platform - Time Management**
   - [ ] Absent count is correct
   - [ ] Can configure late threshold in Office Settings
   - [ ] Late threshold works correctly

5. **Cross-Platform Sync**
   - [ ] Employee-created meeting appears in HR platform
   - [ ] HR can approve meeting
   - [ ] Approved meeting appears in employee platform

---

## 📋 Full Testing Guide

See `DEPLOYMENT_AND_TESTING_GUIDE.md` for comprehensive testing steps.

---

## 🔗 Deployment URLs

- **HR Platform:** https://hr-platform-l54uor6q2-pam-pam29s-projects.vercel.app
- **Employee Platform:** https://hris-employee-platform-qg05c29xe-pam-pam29s-projects.vercel.app
- **Careers Platform:** https://hris-careers-platform-jyjykiok4-pam-pam29s-projects.vercel.app

---

## ⚠️ Important Notes

- Always run backfill script after deployment
- Check Vercel deployment logs for errors
- Clear browser cache if you see old UI
- Test in incognito/private window for clean state

