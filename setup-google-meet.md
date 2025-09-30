# Quick Google Meet Setup Guide

## ✅ Status: Almost Ready!

### What's Done:
- ✅ Google Calendar API service created
- ✅ npm packages installed
- ✅ Integration code implemented
- ✅ Your credentials collected

### What You Need to Do:

## Step 1: Create .env Files (2 minutes)

### Employee Platform:

1. **Create file:** `employee-platform/.env`
2. **Copy content from:** `EMPLOYEE_PLATFORM_ENV_SETUP.txt`
3. **Paste into the .env file**
4. **Save**

### HR Platform:

1. **Create file:** `hr-platform/.env`
2. **Copy content from:** `HR_PLATFORM_ENV_SETUP.txt`
3. **Paste into the .env file**
4. **Save**

## Step 2: Configure Google Cloud (5 minutes)

1. Go to https://console.cloud.google.com/apis/credentials
2. Find your OAuth 2.0 Client ID
3. Click to edit it
4. Under **"Authorized JavaScript origins"**, add:
   ```
   http://localhost:3003
   http://localhost:3006
   ```
5. Under **"Authorized redirect URIs"**, add:
   ```
   http://localhost:3003
   http://localhost:3006
   ```
6. Click **Save**

## Step 3: Enable Google Calendar API (1 minute)

1. Go to https://console.cloud.google.com/apis/library
2. Search for **"Google Calendar API"**
3. Click on it
4. Click **"Enable"** (if not already enabled)

## Step 4: Restart Servers

```bash
# Stop both servers (Ctrl+C)

# Terminal 1 - Employee Platform
cd employee-platform
npm run dev

# Terminal 2 - HR Platform
cd hr-platform
npm run dev
```

## Step 5: Test Google Meet Integration

### First Test:
1. **Employee Dashboard** → Performance Management
2. Click **"Schedule Meeting"**
3. Fill in:
   - Title: "Test Google Meet"
   - Date: Tomorrow
   - Time: 2:00 PM
   - Leave "Meeting Link" **empty**
4. Click **"Schedule Meeting"**
5. **First time only**: Google sign-in popup appears
6. Grant calendar access
7. **Watch console for:** `✅ Google Meet created: https://meet.google.com/...`

### Verify:
- ✅ Unique Google Meet link created
- ✅ Added to your Google Calendar
- ✅ Can join the meeting room

### If It Doesn't Work:

**Check Console for Errors:**
- "API Key not found" → Add API key to .env
- "Access denied" → Wait 5 min, enable Calendar API
- "Redirect URI mismatch" → Add localhost URLs to Google Cloud

**Fallback Mode:**
- If Google API fails, system uses `meet.google.com/new`
- Still works, just requires manual creation
- No errors, graceful fallback

## What You'll Get:

### Before (Fallback):
- Meeting link: `https://meet.google.com/new`
- Button text: "Create Google Meet"
- User creates meeting manually

### After (Full Integration):
- Meeting link: `https://meet.google.com/abc-defg-hij`
- Button text: "Join Meeting"
- Fully automated, unique codes
- Added to Google Calendar
- Calendar invites sent

## Need Help?

If you encounter issues:
1. Check the console logs
2. Verify .env files are created correctly
3. Confirm Google Cloud settings
4. Wait 5-10 minutes after Google Cloud changes

The system will work either way - with full integration or fallback mode! 🚀

