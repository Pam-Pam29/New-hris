# Google Meet/Calendar API Integration Setup

## Prerequisites
- Google Workspace or Google Cloud account
- Admin access to Google Cloud Console

## Step 1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click **"Select a project"** → **"New Project"**
3. Project name: `HRIS-System`
4. Click **"Create"**

## Step 2: Enable Required APIs

1. In your project, go to **"APIs & Services"** → **"Library"**
2. Search and enable these APIs:
   - **Google Calendar API**
   - **Google Meet API** (if available)
3. Click **"Enable"** for each

## Step 3: Create OAuth 2.0 Credentials

1. Go to **"APIs & Services"** → **"Credentials"**
2. Click **"Create Credentials"** → **"OAuth client ID"**
3. If prompted, configure OAuth consent screen:
   - User Type: **Internal** (if Workspace) or **External**
   - App name: `HRIS Performance Management`
   - User support email: Your email
   - Developer contact: Your email
   - Scopes: Add these scopes:
     - `https://www.googleapis.com/auth/calendar`
     - `https://www.googleapis.com/auth/calendar.events`
   - Save and continue

4. Create OAuth Client ID:
   - Application type: **Web application**
   - Name: `HRIS Web Client`
   - Authorized JavaScript origins:
     - `http://localhost:3003` (Employee platform)
     - `http://localhost:3006` (HR platform)
     - Your production URLs
   - Authorized redirect URIs:
     - `http://localhost:3003/auth/callback`
     - `http://localhost:3006/auth/callback`
     - Your production callback URLs
   - Click **"Create"**

5. **Copy your credentials:**
   - Client ID: `xxxxx.apps.googleusercontent.com`
   - Client Secret: `xxxxx`

## Step 4: Configure Environment Variables

### Employee Platform (.env)
```env
# Existing Firebase config...

# Google Calendar API
VITE_GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
VITE_GOOGLE_API_KEY=your-api-key
VITE_GOOGLE_CALENDAR_ID=primary
```

### HR Platform (.env)
```env
# Existing Firebase config...

# Google Calendar API
VITE_GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
VITE_GOOGLE_API_KEY=your-api-key
VITE_GOOGLE_CALENDAR_ID=primary
```

## Step 5: Install Dependencies

Run in both platforms:

```bash
# Employee Platform
cd employee-platform
npm install @react-oauth/google gapi-script

# HR Platform
cd hr-platform
npm install @react-oauth/google gapi-script
```

## Step 6: Test the Integration

1. Start both platforms
2. Schedule a meeting
3. Google Meet link will be automatically created
4. Unique code like: `https://meet.google.com/abc-defg-hij`

## Troubleshooting

### Error: "Access Not Configured"
- Make sure Google Calendar API is enabled
- Wait 5-10 minutes after enabling

### Error: "Invalid Client"
- Check Client ID in .env file
- Verify authorized origins match your URLs

### Error: "Redirect URI Mismatch"
- Add your exact redirect URI in Google Cloud Console
- Include protocol (http/https)

## Security Notes

- Keep Client Secret secure (don't commit to git)
- Use environment variables
- For production, use HTTPS only
- Consider using service account for server-side operations

## Alternative: Service Account (Backend Integration)

For server-side meeting creation without user authentication:

1. Create Service Account in Google Cloud
2. Download JSON key file
3. Share calendar with service account email
4. Use service account for API calls

This is recommended for production systems.

## Next Steps

After setup, the system will:
- ✅ Create real Google Meet rooms
- ✅ Generate unique meeting codes
- ✅ Add meetings to Google Calendar
- ✅ Send calendar invites
- ✅ Support video calls with screen sharing

