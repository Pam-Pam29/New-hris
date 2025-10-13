# 🎯 Complete Onboarding Flow Test

## 📋 **Test Objectives:**
1. ✅ HR onboarding for 3 companies
2. ✅ Set up HR features (leave types, departments)
3. ✅ Employee onboarding (2 employees per company = 6 total)
4. ✅ Employee platform setup and testing
5. ✅ Verify real-time sync between platforms

---

## 🧹 **Step 0: Clean Start (Optional)**

If you want to start completely fresh:

1. Open: `http://localhost:3003`
2. Go to: **Settings → Company Setup**
3. Scroll to **"DANGER ZONE"**
4. Click **"Clear All Data"**
5. Type **"DELETE"** to confirm
6. Wait for success message

---

## 🏢 **PART 1: Company Onboarding (3 Companies)**

### **Company 1: Acme Corporation**

#### **Step 1.1: Start Onboarding**
1. Open: `http://localhost:3003`
2. You should see: **"Complete your company onboarding"** message
3. Click: **"Start Onboarding"** or go to `/onboarding`

#### **Step 1.2: Company Profile (Step 1/7)**
- **Company Name:** `Acme Corporation`
- **Display Name:** `Acme Corporation`
- **Domain:** `acme` (unique identifier)
- **Email:** `hr@acmecorp.com`
- **Phone:** `+234 803 100 0001`
- **Website:** `https://acmecorp.com`

**Click: Next**

#### **Step 1.3: Business Details (Step 2/7)**
- **Address:** `123 Tech Avenue, Victoria Island, Lagos, Nigeria`
- **Industry:** `Technology`
- **Company Size:** `50-200 employees`
- **Timezone:** `Africa/Lagos` (default)

**Click: Next**

#### **Step 1.4: Branding (Step 3/7)**
- **Primary Color:** `#DC2626` (Red)
- **Secondary Color:** `#991B1B` (Dark Red)
- **Logo URL:** (Skip for now or use a placeholder)

**Click: Next**

#### **Step 1.5: Departments (Step 4/7)**
Add these departments:
1. `Human Resources`
2. `Engineering`
3. `Sales`
4. `Marketing`
5. `Finance`

**Click: Next**

#### **Step 1.6: Leave Policies (Step 5/7)**
Configure leave types:

**Annual Leave:**
- Max Days: `20`
- Carry Over: ✅ Yes
- Paid Leave: ✅ Yes

**Sick Leave:**
- Max Days: `10`
- Carry Over: ❌ No
- Paid Leave: ✅ Yes

**Personal Leave:**
- Max Days: `5`
- Carry Over: ❌ No
- Paid Leave: ✅ Yes

**Click: Next**

#### **Step 1.7: Review & Complete (Step 6/7)**
- Review all information
- **Click: Complete Onboarding**
- Wait for success message
- **Click: Go to Dashboard**

✅ **Acme Corporation onboarding complete!**

---

### **Company 2: TechCorp Inc.**

#### **Step 2.1: Create Company**
Since we can only onboard one company at a time through the UI:

1. Go to: **Settings → Company Setup**
2. Scroll to: **"Create Demo Companies"** section
3. Click: **"Create Demo Companies"**
4. Wait for success message (this creates Acme, TechCorp, Globex)

**Note:** Since Acme is already onboarded, TechCorp and Globex will be created with `onboardingCompleted: true` automatically.

#### **Step 2.2: Switch to TechCorp**
1. Click: **Company Switcher** (top right dropdown)
2. Select: **"TechCorp Inc."**
3. Dashboard should show TechCorp data (empty for now)

#### **Step 2.3: Create Leave Types**
1. Go to: **Settings → Company Setup**
2. Scroll to: **"Create Default Leave Types"**
3. Click: **"Create Leave Types for TechCorp Inc."**
4. Wait for success message

✅ **TechCorp Inc. setup complete!**

---

### **Company 3: Globex Industries**

#### **Step 3.1: Switch to Globex**
1. Click: **Company Switcher** (top right)
2. Select: **"Globex Industries"**

#### **Step 3.2: Create Leave Types**
1. Go to: **Settings → Company Setup**
2. Scroll to: **"Create Default Leave Types"**
3. Click: **"Create Leave Types for Globex Industries"**
4. Wait for success message

✅ **Globex Industries setup complete!**

---

## 👥 **PART 2: Employee Onboarding (6 Employees)**

### **Company 1: Acme Corporation (2 Employees)**

#### **Switch to Acme:**
1. Company Switcher → Select **"Acme Corporation"**

#### **Employee 1: Sarah Johnson (HR Manager)**

**Go to:** HR → Core HR → Employee Management → **Add Employee**

**Personal Information:**
- First Name: `Sarah`
- Last Name: `Johnson`
- Email: `sarah.johnson@acmecorp.com`
- Phone: `+234 803 100 1001`
- Date of Birth: `1988-05-15`
- Gender: `Female`
- Address: `45 Allen Avenue, Ikeja, Lagos`

**Employment Details:**
- Employee ID: `ACME001`
- Department: `Human Resources`
- Job Title: `HR Manager`
- Employment Type: `Full-time`
- Status: `Active`
- Hire Date: `2022-01-15`
- Work Location: `Lagos Office`
- Reporting Manager: `CEO`

**Compensation:**
- Basic Salary: `₦5,400,000` (annually)
- Currency: `NGN`
- Payment Frequency: `Monthly`

**Click: Save Employee**

✅ **Sarah Johnson created!**

#### **Employee 2: Michael Adebayo (Software Engineer)**

**Click: Add Employee**

**Personal Information:**
- First Name: `Michael`
- Last Name: `Adebayo`
- Email: `michael.adebayo@acmecorp.com`
- Phone: `+234 803 100 1002`
- Date of Birth: `1992-08-22`
- Gender: `Male`
- Address: `12 Admiralty Way, Lekki, Lagos`

**Employment Details:**
- Employee ID: `ACME002`
- Department: `Engineering`
- Job Title: `Senior Software Engineer`
- Employment Type: `Full-time`
- Status: `Active`
- Hire Date: `2023-03-10`
- Work Location: `Lagos Office`
- Reporting Manager: `Sarah Johnson`

**Compensation:**
- Basic Salary: `₦4,800,000` (annually)
- Currency: `NGN`
- Payment Frequency: `Monthly`

**Click: Save Employee**

✅ **Michael Adebayo created!**

---

### **Company 2: TechCorp Inc. (2 Employees)**

#### **Switch to TechCorp:**
1. Company Switcher → Select **"TechCorp Inc."**

#### **Employee 3: Chioma Okafor (Product Manager)**

**Go to:** HR → Core HR → Employee Management → **Add Employee**

**Personal Information:**
- First Name: `Chioma`
- Last Name: `Okafor`
- Email: `chioma.okafor@techcorp.com`
- Phone: `+234 803 200 2001`
- Date of Birth: `1990-11-08`
- Gender: `Female`
- Address: `78 Adeola Odeku, Victoria Island, Lagos`

**Employment Details:**
- Employee ID: `TECH001`
- Department: `Product`
- Job Title: `Product Manager`
- Employment Type: `Full-time`
- Status: `Active`
- Hire Date: `2021-06-20`
- Work Location: `Lagos Office`

**Compensation:**
- Basic Salary: `₦6,000,000` (annually)
- Currency: `NGN`

**Click: Save Employee**

✅ **Chioma Okafor created!**

#### **Employee 4: James Okonkwo (DevOps Engineer)**

**Click: Add Employee**

**Personal Information:**
- First Name: `James`
- Last Name: `Okonkwo`
- Email: `james.okonkwo@techcorp.com`
- Phone: `+234 803 200 2002`
- Date of Birth: `1994-02-14`
- Gender: `Male`
- Address: `34 Isaac John Street, Ikeja, Lagos`

**Employment Details:**
- Employee ID: `TECH002`
- Department: `Operations`
- Job Title: `DevOps Engineer`
- Employment Type: `Full-time`
- Status: `Active`
- Hire Date: `2022-09-05`
- Work Location: `Lagos Office`

**Compensation:**
- Basic Salary: `₦5,200,000` (annually)
- Currency: `NGN`

**Click: Save Employee**

✅ **James Okonkwo created!**

---

### **Company 3: Globex Industries (2 Employees)**

#### **Switch to Globex:**
1. Company Switcher → Select **"Globex Industries"**

#### **Employee 5: Fatima Yusuf (Sales Manager)**

**Go to:** HR → Core HR → Employee Management → **Add Employee**

**Personal Information:**
- First Name: `Fatima`
- Last Name: `Yusuf`
- Email: `fatima.yusuf@globex.com`
- Phone: `+234 803 300 3001`
- Date of Birth: `1987-07-30`
- Gender: `Female`
- Address: `56 Awolowo Road, Ikoyi, Lagos`

**Employment Details:**
- Employee ID: `GLOB001`
- Department: `Sales`
- Job Title: `Sales Manager`
- Employment Type: `Full-time`
- Status: `Active`
- Hire Date: `2020-04-12`
- Work Location: `Lagos Office`

**Compensation:**
- Basic Salary: `₦5,800,000` (annually)
- Currency: `NGN`

**Click: Save Employee**

✅ **Fatima Yusuf created!**

#### **Employee 6: Daniel Eze (Marketing Specialist)**

**Click: Add Employee**

**Personal Information:**
- First Name: `Daniel`
- Last Name: `Eze`
- Email: `daniel.eze@globex.com`
- Phone: `+234 803 300 3002`
- Date of Birth: `1995-12-18`
- Gender: `Male`
- Address: `23 Herbert Macaulay Way, Yaba, Lagos`

**Employment Details:**
- Employee ID: `GLOB002`
- Department: `Marketing`
- Job Title: `Marketing Specialist`
- Employment Type: `Full-time`
- Status: `Active`
- Hire Date: `2023-01-08`
- Work Location: `Lagos Office`

**Compensation:**
- Basic Salary: `₦3,900,000` (annually)
- Currency: `NGN`

**Click: Save Employee**

✅ **Daniel Eze created!**

---

## 📊 **Verification Checkpoint:**

### **Check HR Dashboard for Each Company:**

#### **Acme Corporation:**
- Total Employees: `2`
- Departments: `5` (HR, Engineering, Sales, Marketing, Finance)
- Leave Types: `3` (Annual, Sick, Personal)

#### **TechCorp Inc.:**
- Total Employees: `2`
- Leave Types: `3`

#### **Globex Industries:**
- Total Employees: `2`
- Leave Types: `3`

✅ **All companies and employees set up!**

---

## 👤 **PART 3: Employee Platform Testing**

### **Test 1: Acme Employee (Sarah Johnson)**

#### **Step 3.1: Open Employee Platform**
```
http://localhost:3005?employee=ACME001&company=acme
```

**Verify:**
- [ ] Dashboard loads
- [ ] Welcome message: "Welcome back, Sarah!"
- [ ] Company: "Acme Corporation"
- [ ] Profile shows correct details
- [ ] Leave balances shown:
  - Annual Leave: 20 days
  - Sick Leave: 10 days
  - Personal Leave: 5 days

#### **Step 3.2: Update Profile**
1. Go to: **Profile Management**
2. Click: **Edit Profile**
3. Add Emergency Contact:
   - Name: `John Johnson`
   - Relationship: `Spouse`
   - Phone: `+234 803 100 9999`
4. **Save Changes**

**Verify:**
- [ ] Success message
- [ ] Profile completeness updates
- [ ] Changes reflected immediately

#### **Step 3.3: Submit Leave Request**
1. Go to: **Leave Management**
2. Click: **"Request Leave"**
3. Fill form:
   - Leave Type: `Annual Leave`
   - Start Date: `Next Monday`
   - End Date: `Next Friday` (5 days)
   - Reason: `Family vacation`
4. **Submit**

**Verify:**
- [ ] Success message
- [ ] Request appears with "Pending" status
- [ ] Leave balance updates (20 → 15 remaining, 5 pending)

---

### **Test 2: Acme Employee (Michael Adebayo)**

#### **Step 3.4: Switch Employee**
```
http://localhost:3005?employee=ACME002&company=acme
```

**Verify:**
- [ ] Dashboard shows Michael's data
- [ ] Welcome message: "Welcome back, Michael!"
- [ ] Leave balances: 20/10/5 (all available)

#### **Step 3.5: Clock In/Out**
1. Go to: **Time Management**
2. Click: **"Clock In"**
3. Allow location access (if prompted)
4. Wait 1 minute
5. Click: **"Clock Out"**

**Verify:**
- [ ] Clock-in time recorded
- [ ] Clock-out time recorded
- [ ] Hours worked calculated
- [ ] Entry appears in history

---

### **Test 3: TechCorp Employee (Chioma Okafor)**

#### **Step 3.6: Switch Company & Employee**
```
http://localhost:3005?employee=TECH001&company=techcorp
```

**Verify:**
- [ ] Dashboard shows Chioma's data
- [ ] Company: "TechCorp Inc."
- [ ] Leave balances available
- [ ] NO Acme data visible (multi-tenancy check!)

#### **Step 3.7: Submit Leave Request**
1. Go to: **Leave Management**
2. Request: `Sick Leave` for 2 days
3. Reason: `Medical appointment`
4. **Submit**

**Verify:**
- [ ] Request submitted successfully
- [ ] Sick Leave balance: 8 remaining, 2 pending

---

### **Test 4: TechCorp Employee (James Okonkwo)**

```
http://localhost:3005?employee=TECH002&company=techcorp
```

**Verify:**
- [ ] Correct employee loaded
- [ ] TechCorp company context
- [ ] Independent leave balances

---

### **Test 5: Globex Employee (Fatima Yusuf)**

```
http://localhost:3005?employee=GLOB001&company=globex
```

**Verify:**
- [ ] Dashboard loads for Globex
- [ ] Company: "Globex Industries"
- [ ] NO Acme or TechCorp data visible

---

### **Test 6: Globex Employee (Daniel Eze)**

```
http://localhost:3005?employee=GLOB002&company=globex
```

**Verify:**
- [ ] Correct employee context
- [ ] Globex company data only

---

## 🔄 **PART 4: Real-Time Sync Testing**

### **Test 7: HR Approves Leave (Real-time Sync)**

#### **Setup:**
- **Tab 1:** Employee Platform - Sarah Johnson
  - URL: `http://localhost:3005?employee=ACME001&company=acme`
  - Navigate to: **Leave Management**
  - Leave her leave request visible

- **Tab 2:** HR Platform - Acme
  - URL: `http://localhost:3003`
  - Switch to: **Acme Corporation**
  - Navigate to: **HR → Core HR → Leave Management**

#### **Test Sync:**
1. In **Tab 2 (HR):**
   - Find Sarah's leave request (5 days, Annual Leave)
   - Click: **"Approve"**

2. Watch **Tab 1 (Employee):**
   - **Request status should update to "Approved" ✅ IN REAL-TIME**
   - Leave balance should update: 15 remaining, 0 pending
   - **NO PAGE REFRESH NEEDED!**

**Verify:**
- [ ] Status updates instantly on Employee Platform
- [ ] Leave balance recalculates automatically
- [ ] No console errors
- [ ] Smooth real-time sync! 🎉

---

### **Test 8: HR Creates Job (Careers Sync)**

#### **Setup:**
- **Tab 1:** Careers Platform - Acme
  - URL: `http://localhost:3004/careers/acme`

- **Tab 2:** HR Platform - Acme
  - URL: `http://localhost:3003`
  - Navigate to: **HR → Hiring → Recruitment**

#### **Test Sync:**
1. In **Tab 2 (HR):**
   - Click: **"Add Job"**
   - Title: `Full Stack Developer`
   - Department: `Engineering`
   - Location: `Lagos, Nigeria`
   - Salary: `₦3,600,000 - ₦6,000,000`
   - Status: `open`
   - **Save**

2. Watch **Tab 1 (Careers):**
   - **New job should appear instantly!** 🎉
   - All details should be correct
   - **NO PAGE REFRESH!**

**Verify:**
- [ ] Job appears in real-time
- [ ] Correct company (Acme only)
- [ ] All details accurate
- [ ] Can apply for the job

---

### **Test 9: Cross-Company Isolation**

#### **Setup:**
- **Tab 1:** `http://localhost:3004/careers/acme`
- **Tab 2:** `http://localhost:3004/careers/techcorp`
- **Tab 3:** `http://localhost:3004/careers/globex`

#### **Verify Multi-Tenancy:**
- [ ] Acme shows only Acme jobs
- [ ] TechCorp shows only TechCorp jobs
- [ ] Globex shows only Globex jobs
- [ ] NO cross-contamination!

---

## ✅ **Final Verification Checklist:**

### **Companies:**
- [ ] Acme Corporation onboarded and configured
- [ ] TechCorp Inc. set up with leave types
- [ ] Globex Industries set up with leave types
- [ ] Company switcher works in HR Platform

### **Employees:**
- [ ] 2 employees in Acme (Sarah, Michael)
- [ ] 2 employees in TechCorp (Chioma, James)
- [ ] 2 employees in Globex (Fatima, Daniel)
- [ ] All employees have correct company assignment

### **Employee Platform:**
- [ ] Dashboard loads for all 6 employees
- [ ] Profile updates work
- [ ] Leave requests submit successfully
- [ ] Time tracking works
- [ ] Data isolation (no cross-company data)

### **Real-Time Sync:**
- [ ] Leave approval syncs instantly to Employee Platform
- [ ] Job postings sync to Careers Platform
- [ ] No page refresh needed
- [ ] No console errors
- [ ] Multi-tenancy preserved in sync

### **Performance:**
- [ ] All pages load quickly
- [ ] No lag in real-time updates
- [ ] Smooth user experience

---

## 🎉 **Success Criteria:**

✅ **All 3 companies onboarded**
✅ **6 employees created (2 per company)**
✅ **Employee Platform works for all**
✅ **Real-time sync working perfectly**
✅ **Multi-tenancy verified**
✅ **No data leaks between companies**

---

## 📝 **Issue Tracking Template:**

If you find any issues:

```markdown
### Issue #X: [Title]

**Platform:** HR / Employee / Careers
**Company:** Acme / TechCorp / Globex
**Employee:** [Name] / [ID]

**Steps to Reproduce:**
1. 
2. 
3. 

**Expected:** 
**Actual:** 
**Console Error:** 
**Screenshot:** 

**Priority:** High / Medium / Low
```

---

## 🚀 **Ready to Start Testing!**

1. Clear all data (optional)
2. Follow this guide step-by-step
3. Check off each item as you go
4. Document any issues
5. Enjoy the real-time sync! 🎯

**Happy Testing! 🧪**




