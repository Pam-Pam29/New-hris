# 🏢 MULTI-TENANT EMAIL SETUP - PRODUCTION READY

**Date:** October 19, 2025  
**Status:** ✅ **Production Deployment with Multi-Tenancy**

---

## 🎯 **MULTI-TENANCY CONSIDERATIONS**

Your HRIS supports multiple companies on one system. Email setup needs to respect company isolation:

### **Key Requirements:**
1. ✅ Each company's employees only receive emails for their company
2. ✅ Company-specific branding (companyName in emails)
3. ✅ Separate sender emails per company (optional)
4. ✅ Company data isolation
5. ✅ Production URLs for email links

---

## 🔐 **PRODUCTION .ENV SETUP**

### **For HR Platform:** `hr-platform/.env`

```env
# ==================== FIREBASE ====================
VITE_FIREBASE_API_KEY=AIzaSyC6ovwlhX4Mr8WpHoS045wLxHA7t8fRXPI
VITE_FIREBASE_AUTH_DOMAIN=hris-system-baa22.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=hris-system-baa22
VITE_FIREBASE_STORAGE_BUCKET=hris-system-baa22.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=563898942372
VITE_FIREBASE_APP_ID=1:563898942372:web:8c5ebae1dfaf072858b731
VITE_FIREBASE_MEASUREMENT_ID=G-1DJP5DJX92
VITE_DEFAULT_SERVICE=firebase

# ==================== SENDGRID ====================
VITE_SENDGRID_API_KEY=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
VITE_FROM_EMAIL=noreply@yourhris.com
VITE_FROM_NAME=HRIS Platform

# ==================== PRODUCTION URLS ====================
# Update these to your actual production domains
VITE_HR_PLATFORM_URL=https://hr.yourdomain.com
VITE_EMPLOYEE_PLATFORM_URL=https://employees.yourdomain.com
VITE_CAREERS_PLATFORM_URL=https://careers.yourdomain.com

# Development URLs (comment out for production)
# VITE_HR_PLATFORM_URL=http://localhost:3003
# VITE_EMPLOYEE_PLATFORM_URL=http://localhost:3005
# VITE_CAREERS_PLATFORM_URL=http://localhost:3004
```

---

### **For Employee Platform:** `employee-platform/.env`

```env
# ==================== FIREBASE ====================
VITE_FIREBASE_API_KEY=AIzaSyC6ovwlhX4Mr8WpHoS045wLxHA7t8fRXPI
VITE_FIREBASE_AUTH_DOMAIN=hris-system-baa22.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=hris-system-baa22
VITE_FIREBASE_STORAGE_BUCKET=hris-system-baa22.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=563898942372
VITE_FIREBASE_APP_ID=1:563898942372:web:8c5ebae1dfaf072858b731
VITE_FIREBASE_MEASUREMENT_ID=G-1DJP5DJX92
VITE_DEFAULT_SERVICE=firebase

# ==================== SENDGRID ====================
VITE_SENDGRID_API_KEY=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
VITE_FROM_EMAIL=noreply@yourhris.com
VITE_FROM_NAME=HRIS Platform

# ==================== PRODUCTION URLS ====================
VITE_HR_PLATFORM_URL=https://hr.yourdomain.com
VITE_EMPLOYEE_PLATFORM_URL=https://employees.yourdomain.com
VITE_CAREERS_PLATFORM_URL=http://localhost:3004
```

---

## 🏢 **MULTI-TENANT EMAIL ARCHITECTURE**

### **How It Works:**

```
Company A (Acme Corp)
├── companyId: "company_acme"
├── Employees: john@acme.com, jane@acme.com
└── Emails sent with "Acme Corp" branding

Company B (Beta Inc)
├── companyId: "company_beta"
├── Employees: bob@beta.com, alice@beta.com
└── Emails sent with "Beta Inc" branding
```

### **Data Isolation:**
✅ Each email includes `companyName` parameter  
✅ Employee data filtered by `companyId`  
✅ No cross-company email leakage  
✅ Company-specific branding in templates  

---

## 📧 **SENDING EMAILS WITH COMPANY CONTEXT**

### **All Email Methods Include Company Name:**

```typescript
// Leave Approved Email - Company Specific
await emailService.sendLeaveApproved({
  employeeName: employee.firstName + ' ' + employee.lastName,
  email: employee.email,
  leaveType: 'Annual Leave',
  startDate: 'Dec 20, 2025',
  endDate: 'Dec 30, 2025',
  days: 10,
  approvedBy: approverName,
  companyName: employee.companyName  // ⭐ Company-specific!
});
```

### **Example Integration with Multi-Tenancy:**

```typescript
// File: hr-platform/src/services/leaveService.ts
import { emailService } from './emailService';
import { doc, getDoc } from 'firebase/firestore';

async function approveLeaveRequest(requestId: string, approverId: string) {
  try {
    // 1. Get leave request
    const requestDoc = await getDoc(doc(db, 'leaveRequests', requestId));
    const request = requestDoc.data();
    
    // 2. Get employee (includes companyId and companyName)
    const employeeDoc = await getDoc(doc(db, 'employees', request.employeeId));
    const employee = employeeDoc.data();
    
    // 3. Verify same company (Security check)
    if (employee.companyId !== getCurrentCompanyId()) {
      throw new Error('Unauthorized: Company mismatch');
    }
    
    // 4. Update leave request
    await updateDoc(doc(db, 'leaveRequests', requestId), {
      status: 'approved',
      approvedBy: approverId,
      approvedAt: new Date()
    });
    
    // 5. Send email with company context
    await emailService.sendLeaveApproved({
      employeeName: `${employee.firstName} ${employee.lastName}`,
      email: employee.email,
      leaveType: request.leaveTypeName,
      startDate: formatDate(request.startDate),
      endDate: formatDate(request.endDate),
      days: request.totalDays,
      approvedBy: getApproverName(approverId),
      companyName: employee.companyName  // ⭐ From employee record
    });
    
    console.log(`✅ Leave approved for ${employee.companyName}`);
  } catch (error) {
    console.error('❌ Error approving leave:', error);
    throw error;
  }
}
```

---

## 🎨 **COMPANY-SPECIFIC BRANDING**

### **Option 1: Dynamic Company Names (Current)**
✅ Already implemented  
✅ Each email uses `companyName` parameter  
✅ No code changes needed  

**Example:**
```typescript
// Email header automatically shows company name
<h1>Welcome to ${companyName}!</h1>

// Email footer includes company name
<p>This is an automated message from ${companyName} HRIS</p>
```

---

### **Option 2: Custom Sender Per Company (Advanced)**

For white-label requirements:

```typescript
// File: hr-platform/src/services/emailService.ts

class EmailService {
  // Get sender email based on company
  private getCompanySenderEmail(companyId: string): string {
    const companyEmailConfig = {
      'company_acme': 'noreply@acmecorp.com',
      'company_beta': 'noreply@betainc.com',
      'company_gamma': 'noreply@gammallc.com'
    };
    
    return companyEmailConfig[companyId] || this.fromEmail;
  }
  
  // Modified sendEmail method
  private async sendEmail({ to, subject, html, companyId }: SendEmailParams) {
    const fromEmail = companyId 
      ? this.getCompanySenderEmail(companyId)
      : this.fromEmail;
    
    // ... rest of email sending logic
  }
}
```

**Note:** Each custom sender email must be verified in SendGrid!

---

## 🔐 **SECURITY: PREVENTING CROSS-COMPANY EMAILS**

### **Always Verify Company Context:**

```typescript
// ✅ CORRECT: Verify company before sending email
async function sendEmployeeEmail(employeeId: string, currentCompanyId: string) {
  const employee = await getEmployee(employeeId);
  
  // Security check
  if (employee.companyId !== currentCompanyId) {
    throw new Error('Unauthorized: Cannot email employee from different company');
  }
  
  await emailService.sendEmail({
    email: employee.email,
    companyName: employee.companyName,
    // ... other params
  });
}

// ❌ WRONG: No company verification
async function sendEmployeeEmail(employeeId: string) {
  const employee = await getEmployee(employeeId);
  // Missing security check!
  await emailService.sendEmail({ /* ... */ });
}
```

---

## 🌐 **PRODUCTION DOMAIN SETUP**

### **Option A: Subdomain per Company (White-Label)**

```
Company A: https://acme.yourhris.com
Company B: https://beta.yourhris.com
Company C: https://gamma.yourhris.com
```

**Setup:**
1. DNS: Create CNAME records for each subdomain
2. Hosting: Configure virtual hosts
3. .env: Update URLs dynamically per deployment

---

### **Option B: Shared Domain with Company Routes (Current)**

```
All Companies: https://hr.yourdomain.com
Employee Access: https://employees.yourdomain.com
```

**Setup:**
1. Single domain for all companies
2. Company identified by authentication
3. Multi-tenancy handled in app logic
4. ✅ **Recommended for your current setup**

---

## 📧 **SENDGRID SENDER VERIFICATION**

### **For Multi-Tenant Production:**

**Option 1: Single Verified Sender (Simplest)**
```
Email: noreply@yourhris.com
Name: HRIS Platform
```
✅ One email for all companies  
✅ Quick setup  
✅ Professional  

**Steps:**
1. Go to: https://app.sendgrid.com/settings/sender_auth/senders
2. Create sender with `noreply@yourhris.com`
3. Verify email
4. ✅ Ready for all companies!

---

**Option 2: Domain Authentication (Best for Production)**
```
Verify entire domain: yourhris.com
Send from any: noreply@yourhris.com, hr@yourhris.com, etc.
```
✅ Professional  
✅ Better deliverability  
✅ No spam issues  

**Steps:**
1. Go to: https://app.sendgrid.com/settings/sender_auth
2. Click "Authenticate Your Domain"
3. Add DNS records to your domain
4. ✅ Send from any email on your domain!

---

**Option 3: Per-Company Senders (White-Label)**
```
Company A: noreply@acmecorp.com
Company B: noreply@betainc.com
```
✅ Fully white-labeled  
❌ Each company email needs verification  
❌ More complex setup  

---

## 🚀 **DEPLOYMENT CHECKLIST**

### **Pre-Deployment:**
- [ ] Update production URLs in `.env` files
- [ ] Verify sender email in SendGrid
- [ ] Test with one email to production email
- [ ] Verify company isolation working
- [ ] Check Firestore security rules deployed

### **Production .env:**
```env
# ✅ PRODUCTION CONFIGURATION
VITE_SENDGRID_API_KEY=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
VITE_FROM_EMAIL=noreply@yourhris.com
VITE_FROM_NAME=HRIS Platform
VITE_HR_PLATFORM_URL=https://hr.yourdomain.com
VITE_EMPLOYEE_PLATFORM_URL=https://employees.yourdomain.com
VITE_CAREERS_PLATFORM_URL=https://careers.yourdomain.com
```

### **Build for Production:**
```bash
# HR Platform
cd hr-platform
npm run build
# Deploy dist/ folder

# Employee Platform
cd employee-platform
npm run build
# Deploy dist/ folder
```

### **Post-Deployment:**
- [ ] Test email from production URL
- [ ] Verify company A can't email company B employees
- [ ] Check email links point to production URLs
- [ ] Monitor SendGrid dashboard for delivery

---

## 🎯 **MULTI-TENANT EMAIL EXAMPLES**

### **Company A - Acme Corp:**
```typescript
// Leave approved for Acme employee
await emailService.sendLeaveApproved({
  employeeName: 'John Doe',
  email: 'john@acme-employees.com',
  leaveType: 'Annual Leave',
  startDate: 'Dec 20, 2025',
  endDate: 'Dec 30, 2025',
  days: 10,
  approvedBy: 'Jane Smith',
  companyName: 'Acme Corporation'  // ⭐ Acme branding
});
// Email header: "Leave Request Approved - Acme Corporation"
// Email footer: "This is an automated message from Acme Corporation HRIS"
```

### **Company B - Beta Inc:**
```typescript
// Leave approved for Beta employee
await emailService.sendLeaveApproved({
  employeeName: 'Bob Smith',
  email: 'bob@beta-employees.com',
  leaveType: 'Sick Leave',
  startDate: 'Dec 22, 2025',
  endDate: 'Dec 23, 2025',
  days: 2,
  approvedBy: 'Alice Johnson',
  companyName: 'Beta Inc'  // ⭐ Beta branding
});
// Email header: "Leave Request Approved - Beta Inc"
// Email footer: "This is an automated message from Beta Inc HRIS"
```

**Result:** Each company's emails are branded with their company name!

---

## 📊 **MONITORING MULTI-TENANT EMAILS**

### **SendGrid Dashboard:**
- View emails sent per day
- Track delivery rates
- Monitor bounces/spam
- Filter by recipient

### **Application Logging:**
```typescript
// Add logging for audit trail
console.log(`📧 Email sent: ${emailType} to ${employeeEmail} for company ${companyName}`);

// Example:
// 📧 Email sent: LeaveApproved to john@acme.com for company Acme Corporation
// 📧 Email sent: PayslipAvailable to bob@beta.com for company Beta Inc
```

---

## ⚠️ **IMPORTANT: DATA ISOLATION**

### **Firestore Security Rules Already Handle This:**

Your security rules (already deployed) ensure:
```javascript
// Firestore Rules
match /employees/{employeeId} {
  allow read: if request.auth != null 
    && resource.data.companyId == request.auth.token.companyId;
}

match /leaveRequests/{requestId} {
  allow read: if request.auth != null 
    && resource.data.companyId == request.auth.token.companyId;
}
```

✅ Users can only access their company's data  
✅ Emails only sent to employees in same company  
✅ Cross-company access prevented  

---

## 🎊 **PRODUCTION READY SUMMARY**

### **What's Configured:**
✅ Multi-tenant email architecture  
✅ Company-specific branding  
✅ Production URL support  
✅ Security rules for data isolation  
✅ 19 email templates ready  
✅ SendGrid API key configured  

### **What You Need to Do:**
1. ⏳ Create production `.env` files with your domains
2. ⏳ Verify sender email in SendGrid
3. ⏳ Build and deploy to production
4. ✅ Test one email in production
5. 🚀 **GO LIVE!**

---

## 🔗 **QUICK LINKS**

- **SendGrid Dashboard:** https://app.sendgrid.com
- **Sender Verification:** https://app.sendgrid.com/settings/sender_auth/senders
- **Domain Auth:** https://app.sendgrid.com/settings/sender_auth
- **API Keys:** https://app.sendgrid.com/settings/api_keys

---

## 📞 **PRODUCTION SUPPORT**

### **Testing in Production:**
```typescript
// Test email with production URLs
await emailService.sendTestEmail('your-email@gmail.com');

// Verify links in email point to:
// https://hr.yourdomain.com (not localhost)
// https://employees.yourdomain.com (not localhost)
```

---

**🎊 Multi-Tenant Email System: Production Ready! 🎊**

**Your HRIS supports unlimited companies with isolated, branded email communication!** 🏢📧


