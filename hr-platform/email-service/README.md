# HR Email Service

A standalone Node.js email service using Resend for the HR Platform.

## Features

- ✅ Resend API integration
- ✅ Express.js REST API
- ✅ Email validation
- ✅ Multiple recipient support
- ✅ HTML and plain text emails
- ✅ HR email templates
- ✅ CORS enabled
- ✅ Error handling

## Setup

1. **Install dependencies:**
   ```bash
   cd email-service
   npm install
   ```

2. **Configure environment variables:**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and add your Resend API key:
   ```
   RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxx
   RESEND_FROM_EMAIL=noreply@yourdomain.com
   RESEND_FROM_NAME=Your HRIS
   ```

3. **Get Resend API Key:**
   - Sign up at [resend.com](https://resend.com)
   - Go to API Keys section
   - Create a new API key
   - Copy it to your `.env` file

4. **Verify your domain (optional but recommended):**
   - In Resend dashboard, go to Domains
   - Add your domain
   - Follow DNS verification steps
   - Use verified domain in `RESEND_FROM_EMAIL`

## Running

**Development mode:**
```bash
npm run dev
```

**Production mode:**
```bash
npm start
```

The service will start on `http://localhost:3001` (or PORT from .env)

## API Endpoints

### Health Check
```
GET /health
```

### Send General Email
```
POST /api/send-email
Content-Type: application/json

{
  "to": "user@example.com",
  "subject": "Test Email",
  "html": "<h1>Hello</h1><p>This is a test email.</p>",
  "text": "Hello\n\nThis is a test email.",
  "from": "noreply@yourdomain.com" // optional
}
```

### Send HR Templated Email
```
POST /api/send-hr-email
Content-Type: application/json

{
  "emailType": "employee_invitation",
  "recipient": {
    "email": "employee@example.com",
    "name": "John Doe"
  },
  "data": {
    "employeeName": "John Doe",
    "employeeId": "EMP001",
    "setupLink": "https://app.example.com/setup",
    "companyName": "Acme Corp",
    "position": "Software Engineer"
  }
}
```

## Supported Email Types

- `employee_invitation`
- `leave_approved`
- `leave_rejected`
- `meeting_scheduled`
- `interview_invitation`
- `application_received`
- `payslip_available`
- `payment_failed`
- `time_adjustment`
- `new_policy`
- `account_locked`
- `job_offer`
- `first_day_instructions`

## Testing

Test the service with curl:

```bash
# Health check
curl http://localhost:3001/health

# Send test email
curl -X POST http://localhost:3001/api/send-email \
  -H "Content-Type: application/json" \
  -d '{
    "to": "test@example.com",
    "subject": "Test Email",
    "html": "<h1>Test</h1>",
    "text": "Test"
  }'
```

## Deployment

### Deploy to Vercel

The Vercel functions in `/api` already use Resend. This standalone service can be deployed separately if needed.

### Deploy to Railway/Render/Heroku

1. Set environment variables in your hosting platform
2. Deploy the `email-service` directory
3. Update your frontend to point to the new service URL

## Integration with HR Platform

The Vercel serverless functions (`/api/send-email.js` and `/api/send-hr-email.js`) already use Resend. This standalone service is an alternative deployment option.

To use this service instead:
1. Deploy this service
2. Update `vercelEmailService.ts` to point to your service URL
3. Or keep using Vercel functions (they already use Resend)

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `RESEND_API_KEY` | Yes | Your Resend API key |
| `RESEND_FROM_EMAIL` | No | Default from email (must be verified domain) |
| `RESEND_FROM_NAME` | No | Default from name |
| `PORT` | No | Server port (default: 3001) |
| `EMAIL_API_KEY` | No | API key for protecting endpoints |
| `NODE_ENV` | No | Environment (development/production) |

## License

ISC

