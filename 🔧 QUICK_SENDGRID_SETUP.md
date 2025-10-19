# 🔧 QUICK SENDGRID SETUP - READY TO GO!

**Your SendGrid API Key:** ✅ Received!

---

## ⚡ **INSTANT SETUP (2 MINUTES)**

### **Step 1: Create .env Files**

**For HR Platform:**

Create file: `hr-platform/.env`

```env
# Firebase Configuration
VITE_FIREBASE_API_KEY=AIzaSyC6ovwlhX4Mr8WpHoS045wLxHA7t8fRXPI
VITE_FIREBASE_AUTH_DOMAIN=hris-system-baa22.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=hris-system-baa22
VITE_FIREBASE_STORAGE_BUCKET=hris-system-baa22.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=563898942372
VITE_FIREBASE_APP_ID=1:563898942372:web:8c5ebae1dfaf072858b731
VITE_FIREBASE_MEASUREMENT_ID=G-1DJP5DJX92
VITE_DEFAULT_SERVICE=firebase

# SendGrid Email Configuration
VITE_SENDGRID_API_KEY=YOUR_SENDGRID_API_KEY_HERE
VITE_FROM_EMAIL=noreply@yourcompany.com
VITE_FROM_NAME=Your Company HRIS

# Platform URLs
VITE_HR_PLATFORM_URL=http://localhost:3003
VITE_EMPLOYEE_PLATFORM_URL=http://localhost:3005
VITE_CAREERS_PLATFORM_URL=http://localhost:3004
```

---

**For Employee Platform:**

Create file: `employee-platform/.env`

```env
# Firebase Configuration
VITE_FIREBASE_API_KEY=AIzaSyC6ovwlhX4Mr8WpHoS045wLxHA7t8fRXPI
VITE_FIREBASE_AUTH_DOMAIN=hris-system-baa22.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=hris-system-baa22
VITE_FIREBASE_STORAGE_BUCKET=hris-system-baa22.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=563898942372
VITE_FIREBASE_APP_ID=1:563898942372:web:8c5ebae1dfaf072858b731
VITE_FIREBASE_MEASUREMENT_ID=G-1DJP5DJX92
VITE_DEFAULT_SERVICE=firebase

# SendGrid Email Configuration
VITE_SENDGRID_API_KEY=YOUR_SENDGRID_API_KEY_HERE
VITE_FROM_EMAIL=noreply@yourcompany.com
VITE_FROM_NAME=Your Company HRIS

# Platform URLs
VITE_HR_PLATFORM_URL=http://localhost:3003
VITE_EMPLOYEE_PLATFORM_URL=http://localhost:3005
VITE_CAREERS_PLATFORM_URL=http://localhost:3004
```

---

### **Step 2: Verify Sender Email in SendGrid**

⚠️ **IMPORTANT:** Before emails will send, verify your sender email in SendGrid:

1. Go to: https://app.sendgrid.com/settings/sender_auth/senders
2. Click "Create New Sender"
3. Fill in:
   - **From Name:** Your Company HRIS
   - **From Email:** noreply@yourcompany.com (or your actual email)
   - **Reply To:** hr@yourcompany.com
   - **Address:** Your company address
4. Click "Create"
5. **Check your email** and click the verification link
6. ✅ Once verified, emails will send!

**Alternative (Quick Test):**
Use a verified email you already have (like your personal email) in the `.env` files for testing.

---

### **Step 3: Restart Servers**

```bash
# Terminal 1: HR Platform
cd hr-platform
npm run dev

# Terminal 2: Employee Platform
cd employee-platform
npm run dev
```

---

### **Step 4: Test Email! 🧪**

Create file: `hr-platform/test-email.html`

```html
<!DOCTYPE html>
<html>
<head>
  <title>Test SendGrid</title>
  <script type="module">
    import { emailService } from './src/services/emailService.ts';

    async function testEmail() {
      const result = await emailService.sendTestEmail('YOUR-EMAIL@gmail.com');
      console.log('Email sent:', result);
      alert(result ? '✅ Email sent! Check your inbox!' : '❌ Failed - check console');
    }

    window.testEmail = testEmail;
  </script>
</head>
<body>
  <h1>SendGrid Test</h1>
  <button onclick="testEmail()">Send Test Email</button>
</body>
</html>
```

**Or test via console in browser:**

1. Open http://localhost:3003
2. Open browser console (F12)
3. Run:
```javascript
// Import the service
const { emailService } = await import('./src/services/emailService.ts');

// Send test email to yourself
await emailService.sendTestEmail('your-email@gmail.com');

// Check console for success message
// Check your email inbox!
```

---

## 🎯 **QUICK TEST COMMANDS**

### **Test Leave Approved Email:**
```javascript
const { emailService } = await import('./src/services/emailService.ts');

await emailService.sendLeaveApproved({
  employeeName: 'Test User',
  email: 'your-email@gmail.com', // YOUR EMAIL HERE
  leaveType: 'Annual Leave',
  startDate: 'December 20, 2025',
  endDate: 'December 30, 2025',
  days: 10,
  approvedBy: 'Jane Smith (Manager)',
  comments: 'Approved! Enjoy your vacation.',
  companyName: 'Test Company'
});
```

### **Test Interview Invitation:**
```javascript
await emailService.sendInterviewInvitation({
  candidateName: 'Test Candidate',
  email: 'your-email@gmail.com',
  position: 'Software Engineer',
  interviewDate: 'December 20, 2025',
  interviewTime: '2:00 PM',
  interviewType: 'video',
  duration: 45,
  interviewers: 'John Smith (CTO)',
  meetingLink: 'https://meet.google.com/test-link',
  companyName: 'Test Company'
});
```

### **Test Payslip Available:**
```javascript
await emailService.sendPayslipAvailable({
  employeeName: 'Test User',
  email: 'your-email@gmail.com',
  payPeriod: 'December 2025',
  payDate: 'December 31, 2025',
  grossPay: 5000,
  netPay: 4200,
  downloadLink: 'http://localhost:3003/payslips/test.pdf',
  companyName: 'Test Company'
});
```

---

## 🎨 **CUSTOMIZE SENDER EMAIL**

Edit both `.env` files:

```env
# Change these to your actual email
VITE_FROM_EMAIL=hr@yourcompany.com
VITE_FROM_NAME=Your Company Name HR Team
```

**Important:** The email must be verified in SendGrid first!

---

## ⚠️ **TROUBLESHOOTING**

### **"Email not sending"**
✅ Check sender email is verified in SendGrid  
✅ Check API key is correct in .env  
✅ Check console for error messages  
✅ Restart development servers  

### **"Permission denied" or "API key invalid"**
✅ Regenerate API key in SendGrid  
✅ Make sure it has "Full Access" permissions  
✅ Copy entire key (starts with SG.)  
✅ Update .env files  

### **Emails going to spam**
✅ Verify your domain in SendGrid (not just sender)  
✅ Add SPF/DKIM records to DNS  
✅ Use your actual company domain  

---

## ✅ **VERIFICATION CHECKLIST**

Before testing:
- [ ] Created `hr-platform/.env` file
- [ ] Created `employee-platform/.env` file
- [ ] Verified sender email in SendGrid
- [ ] Restarted both development servers
- [ ] Opened browser console (F12)

Test:
- [ ] Send test email to yourself
- [ ] Check inbox (and spam folder)
- [ ] Verify email looks good
- [ ] ✅ Success!

---

## 🎉 **YOU'RE READY!**

Once verified:
- ✅ All 19 emails work immediately
- ✅ No additional setup needed
- ✅ Just call email methods with data
- ✅ Automated email communication live!

---

## 📚 **NEXT STEPS**

1. ✅ **Create .env files** (copy from above)
2. ✅ **Verify sender email** in SendGrid
3. ✅ **Restart servers**
4. 🧪 **Test one email**
5. 🎊 **Go live!**

---

## 🚀 **INTEGRATION EXAMPLES**

See: `🎯 PHASE_1_IMPLEMENTATION_GUIDE.md` for:
- Complete integration examples
- How to trigger emails from your code
- Customization guide
- All 19 email examples

---

**🎊 SendGrid configured! Email system ready! 🎊**

**Test now:** Send yourself a test email and see the magic! ✨

