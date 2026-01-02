New HRIS Platform
=================

This repository contains the multi-tenant HRIS suite split across three React applications:

- `hr-platform/` – HR admin portal for company setup, employee management, and configuration
- `employee-platform/` – employee self-service portal
- `careers-platform/` – public-facing careers site with slugged company routing

## Environments

Production builds are deployed to Vercel:

- HR Admin Portal · https://hr-platform-l54uor6q2-pam-pam29s-projects.vercel.app
- Employee Portal · https://hris-employee-platform-qg05c29xe-pam-pam29s-projects.vercel.app
- Careers Portal · https://hris-careers-platform-jyjykiok4-pam-pam29s-projects.vercel.app

Firebase (project `hris-system-baa22`) powers authentication, Firestore, and storage for all three apps.

## Local Setup

```bash
npm install
npm run bootstrap             # if using a workspace manager such as npm workspaces
npm run dev:hr                # start HR portal
npm run dev:employee          # start employee portal
npm run dev:careers           # start careers portal
```

Each app reads its Firebase configuration from environment variables. Copy the `example.env` in each sub-project to `.env.local` and fill in the keys from Firebase console.

## Email Delivery (Vercel Serverless + Nodemailer)

Transactional emails now flow through a Vercel Serverless Function located at `api/send-email.ts`. The front-end apps call this endpoint, and the function relays messages via Nodemailer/SMTP.

### Vercel environment variables

Add the following secrets to **every** Vercel project that needs to send email (HR, Employee, or a dedicated API project):

```
SMTP_HOST=smtp.yourprovider.com
SMTP_PORT=465
SMTP_SECURE=1                  # set to 0 if you use STARTTLS on port 587
SMTP_USER=apikey-or-user
SMTP_PASS=super-secret
SMTP_FROM_NAME=Your HRIS
SMTP_FROM_EMAIL=notifications@yourdomain.com
EMAIL_API_KEY=super-long-secret   # optional but recommended
```

If `EMAIL_API_KEY` is set, the apps must include the same value in the `x-api-key` header when calling the endpoint.

### Front-end configuration

Each Vite app reads the email API location from:

```
VITE_EMAIL_API_URL=https://your-vercel-app.vercel.app/api/send-email
VITE_EMAIL_API_KEY=super-long-secret           # match EMAIL_API_KEY if used
VITE_FROM_NAME=Your HRIS
VITE_FROM_EMAIL=notifications@yourdomain.com
```

For local development, you can either point to the deployed Vercel URL or run `vercel dev` in the repo root to emulate the serverless function and use `VITE_EMAIL_API_URL=http://localhost:3000/api/send-email`.

### Firebase Cloud Functions

If you later upgrade to Firebase Blaze and redeploy Cloud Functions, mirror the SMTP credentials with:

```bash
firebase functions:config:set \
  mail.host="smtp.yourprovider.com" \
  mail.port="465" \
  mail.secure="true" \
  mail.user="apikey-or-user" \
  mail.pass="super-secret" \
  mail.from_email="notifications@yourdomain.com" \
  mail.from_name="Your HRIS"
```

Until then, invitations can call the Vercel endpoint directly instead of relying on Firebase Functions.

## Backfill Script

`scripts/backfillPlatformConfig.js` keeps Firestore `systemConfig` and `hrSettings` documents aligned with the latest deployment URLs and slugs. Run it after every production deploy:

```powershell
$env:GOOGLE_APPLICATION_CREDENTIALS = "C:\hris-admin.json\hris-system-baa22-firebase-adminsdk-fbsvc-81a3572f70.json"
node scripts\backfillPlatformConfig.js
```

## Testing

Refer to `BETA_TEST_GUIDE.md` for a step-by-step beta checklist covering:

- Creating a fresh company and confirming slugged portal links
- Employee invitation flow and onboarding wizard validation
- Careers portal slug routing and regression spot checks

Automated tests can be executed via:

```bash
npm test              # unit tests per workspace
npm run lint          # lint all packages
```

End-to-end smoke tests are run manually against the deployed environments during the beta cycle.

## Deployment

Deployments rely on Vercel. You can trigger fresh builds with:

```bash
cd hr-platform && vercel deploy --prod --yes
cd ../employee-platform && vercel deploy --prod --yes
cd ../careers-platform && vercel deploy --prod --yes
```

After deploying, re-run the backfill script so all companies reference the new canonical URLs.

---

For additional architectural notes and change logs, see the documents under `/docs/` (e.g., `WHATS_NEXT_COMPREHENSIVE.md`).
