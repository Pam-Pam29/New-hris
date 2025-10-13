# Google API Credentials Configuration

## ✅ Your Complete Credentials

**Client ID:** `834186928439-hefqcon4htpnvoothipfcdoukk1792m4.apps.googleusercontent.com`
**Client Secret:** `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`
**API Key:** `AIzaSyDx4YYHUSYli0ix7oRu9j2zmTVztOpn3Cw`

## Step 2: Add to .env Files

### Employee Platform (.env)

Add these lines to `employee-platform/.env`:

```env
# Google Calendar API
VITE_GOOGLE_CLIENT_ID=834186928439-hefqcon4htpnvoothipfcdoukk1792m4.apps.googleusercontent.com
VITE_GOOGLE_CLIENT_SECRET=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
VITE_GOOGLE_API_KEY=AIzaSyDx4YYHUSYli0ix7oRu9j2zmTVztOpn3Cw
```

### HR Platform (.env)

Add these lines to `hr-platform/.env`:

```env
# Google Calendar API
VITE_GOOGLE_CLIENT_ID=834186928439-hefqcon4htpnvoothipfcdoukk1792m4.apps.googleusercontent.com
VITE_GOOGLE_CLIENT_SECRET=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
VITE_GOOGLE_API_KEY=AIzaSyDx4YYHUSYli0ix7oRu9j2zmTVztOpn3Cw
```

## Step 3: Configure Authorized Origins

In Google Cloud Console, make sure these are added to your OAuth client:

**Authorized JavaScript origins:**
- `http://localhost:3003`
- `http://localhost:3006`
- `http://localhost:5173`

**Authorized redirect URIs:**
- `http://localhost:3003`
- `http://localhost:3006`
- `http://localhost:5173`

## Step 4: Restart Servers

After adding the credentials:

```bash
# Stop both servers (Ctrl+C)

# Restart employee platform
cd employee-platform
npm run dev

# Restart HR platform (new terminal)
cd hr-platform
npm run dev
```

## Step 5: Test

1. Schedule a meeting (leave meeting link empty)
2. First time: Google will ask you to sign in and grant calendar access
3. System creates Google Calendar event with Meet link
4. Unique code like: `https://meet.google.com/abc-defg-hij`

## How It Works

### Without API Key (Current):
- Uses fallback: `https://meet.google.com/new`
- User creates meeting manually

### With API Key (After Setup):
- Auto-creates real Google Calendar events
- Generates unique Google Meet codes
- Adds to your calendar
- Sends calendar invites
- **Fully automated!**

## Troubleshooting

### "API Key not found"
- Make sure you created an API Key in Google Cloud Console
- Add it to VITE_GOOGLE_API_KEY in .env files
- Restart servers

### "Sign-in popup blocked"
- Allow popups for localhost
- Try again

### "Access denied"
- Make sure Google Calendar API is enabled
- Check OAuth consent screen is configured
- Wait 5-10 minutes after setup

## Security Note

⚠️ **Never commit .env files to git!**

The .env files should already be in .gitignore. Keep your credentials secure.
