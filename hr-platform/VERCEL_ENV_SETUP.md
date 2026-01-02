# Where to Add RESEND_API_KEY in Vercel

## Quick Answer:

**Only add `RESEND_API_KEY` to the HR Platform project** because that's where the email API functions are located.

## Detailed Breakdown:

### ✅ HR Platform (`hr-platform`)
**ADD RESEND_API_KEY HERE** ✅

- Has email API functions in `api/` folder:
  - `api/send-email.js`
  - `api/send-hr-email.js`
- These functions use Resend
- **This is where you MUST add the API key**

**Steps:**
1. Go to Vercel Dashboard
2. Select **hr-platform** project
3. Settings → Environment Variables
4. Add: `RESEND_API_KEY` = `re_RBuTvW6W_PAUJDVeaaW9xo7qrsGMQAnDK`
5. Select all environments (Production, Preview, Development)

---

### ❓ Employee Platform (`employee-platform`)
**MAYBE - Depends on setup**

- Has `emailService.ts` that calls `/api/send-email`
- **Does NOT have its own `api/` folder**
- Uses relative URL: `/api/send-email` (calls its own domain)

**Two scenarios:**

#### Scenario A: Employee platform calls HR platform's API
- If `VITE_EMAIL_API_URL` is set to HR platform URL
- Example: `VITE_EMAIL_API_URL=https://hr-platform.vercel.app/api/send-email`
- **Then NO, don't add API key here** (it uses HR platform's API)

#### Scenario B: Employee platform has its own API (unlikely)
- If employee platform has `api/` folder with email functions
- **Then YES, add API key here too**

**To check:**
- Look for `api/` folder in `employee-platform/`
- If it doesn't exist, it's probably calling HR platform's API
- **Most likely: You DON'T need to add it here**

---

### ❌ Careers Platform (`careers-platform`)
**DON'T ADD** ❌

- No email sending functionality
- No `api/` folder
- Doesn't send emails
- **Skip this one**

---

## Recommended Setup:

### Option 1: Centralized (Recommended)
- Add `RESEND_API_KEY` **only to HR Platform**
- Configure employee-platform to call HR platform's API:
  - Set `VITE_EMAIL_API_URL` in employee-platform to HR platform URL
  - Example: `VITE_EMAIL_API_URL=https://hr-platform.vercel.app/api/send-email`

### Option 2: Separate (If needed)
- Add `RESEND_API_KEY` to both HR Platform and Employee Platform
- Only if employee-platform has its own `api/` folder with email functions

---

## How to Check:

1. **Check if employee-platform has API functions:**
   ```bash
   ls employee-platform/api/
   ```
   - If folder doesn't exist or is empty → Don't add API key
   - If it has `send-email.js` → Add API key

2. **Check environment variables:**
   - Look for `VITE_EMAIL_API_URL` in employee-platform
   - If it points to HR platform URL → Don't add API key
   - If it's `/api/send-email` (relative) → Check if api folder exists

---

## Summary:

| Platform | Has API Functions? | Needs RESEND_API_KEY? |
|----------|-------------------|----------------------|
| **hr-platform** | ✅ Yes | ✅ **YES - Required** |
| **employee-platform** | ❌ No (probably) | ❌ No (unless it has api/ folder) |
| **careers-platform** | ❌ No | ❌ No |

**Most likely: Only add to HR Platform!** ✅

