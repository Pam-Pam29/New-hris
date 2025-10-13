# 🧪 Comprehensive Testing Guide - From Scratch

## 📋 **Testing Strategy**

This guide will walk you through testing the entire HRIS system from a clean slate, ensuring all features work perfectly before adding new functionality.

---

## 🗑️ **Step 1: Clean All Data**

### **Run the Cleanup Script:**

```bash
cd New-hris
node scripts/clean-all-data.js
```

**Expected Output:**
```
🧹 STARTING DATA CLEANUP...
✅ companies: Deleted X documents
✅ employees: Deleted X documents
✅ jobPostings: Deleted X documents
...
🎉 TOTAL DELETED: X documents
✅ All collections preserved (structure intact)
```

---

## 🏢 **Step 2: Set Up Demo Companies**

### **2.1 Create Demo Companies**

1. **Start HR Platform:** `http://localhost:3003`
2. **Navigate to:** Settings → Company Setup
3. **Click:** "Create Demo Companies"
4. **Wait for:** Success message with 3 company IDs

**Expected Result:**
- ✅ Acme Corporation created
- ✅ TechCorp Inc. created
- ✅ Globex Industries created

### **2.2 Create Leave Types for Acme**

1. **Stay on Company Setup page**
2. **Ensure:** Acme is selected company (top of page)
3. **Scroll to:** "Create Default Leave Types"
4. **Click:** "Create Leave Types for Acme Corporation"

**Expected Result:**
- ✅ 3 leave types created (Annual, Sick, Personal)

---

## 👥 **Step 3: Create Test Employees**

### **3.1 HR Platform - Add Employees**

**Go to:** HR → Core HR → Employee Management

**Create Employee 1 (Manager):**
- **Personal Info:**
  - First Name: `Sarah`
  - Last Name: `Johnson`
  - Email: `sarah.johnson@acme.com`
  - Phone: `+234 803 123 4567`
  - Date of Birth: `1985-06-15`
  - Gender: `Female`

- **Employment:**
  - Employee ID: `EMP001`
  - Department: `Human Resources`
  - Job Title: `HR Manager`
  - Employment Type: `Full-time`
  - Hire Date: `2020-01-15`
  - Work Location: `Lagos Office`
  - Reporting Manager: `CEO`

- **Compensation:**
  - Basic Salary: `₦5,000,000` (annually)
  - Currency: `NGN`
  - Payment Frequency: `Monthly`

**Save and verify:** Employee appears in directory

**Create Employee 2 (Developer):**
- First Name: `John`
- Last Name: `Adebayo`
- Email: `john.adebayo@acme.com`
- Phone: `+234 803 234 5678`
- Date of Birth: `1990-03-20`
- Gender: `Male`
- Employee ID: `EMP002`
- Department: `Engineering`
- Job Title: `Senior Developer`
- Employment Type: `Full-time`
- Hire Date: `2021-06-01`
- Basic Salary: `₦4,200,000` (annually)

**Create Employee 3 (Sales):**
- First Name: `Chioma`
- Last Name: `Okafor`
- Email: `chioma.okafor@acme.com`
- Phone: `+234 803 345 6789`
- Employee ID: `EMP003`
- Department: `Sales`
- Job Title: `Sales Representative`
- Hire Date: `2022-03-15`
- Basic Salary: `₦3,600,000` (annually)

---

## 📊 **Step 4: Test HR Platform Features**

### **4.1 Dashboard**

**Go to:** HR → Dashboard

**Verify:**
- [ ] Total Employees: `3`
- [ ] Active Employees: `3`
- [ ] Recent activity shows employee creations
- [ ] Leave requests: `0`
- [ ] All stats load without errors

### **4.2 Job Posting**

**Go to:** HR → Hiring → Recruitment

**Create Job 1:**
- Title: `Full Stack Developer`
- Department: `Engineering`
- Location: `Lagos, Nigeria`
- Type: `Full-time`
- Salary Range: `₦3,000,000 - ₦5,000,000`
- Description: `We're looking for an experienced Full Stack Developer...`
- Requirements: `3+ years experience, React, Node.js, TypeScript`
- Status: `open`

**Click:** "Add Job"

**Verify:**
- [ ] Job appears in jobs list
- [ ] Job shows on Job Board page (HR → Hiring → Job Board)
- [ ] Job is visible on Careers Platform: `http://localhost:3004/careers/acme`

### **4.3 Candidate Application (External)**

**Go to:** `http://localhost:3004/careers/acme`

**Apply for Full Stack Developer:**
- Full Name: `Michael Eze`
- Email: `michael.eze@example.com`
- Phone: `+234 803 456 7890`
- Resume URL: `https://example.com/resume.pdf`
- Cover Letter: `I am excited to apply for this position...`
- Years of Experience: `5`
- Skills: `React, Node.js, TypeScript, MongoDB`
- Education: `Bachelor's in Computer Science`

**Submit Application**

**Verify:**
- [ ] Success message appears
- [ ] Application auto-creates candidate in HR → Recruitment
- [ ] Candidate status is "New"

### **4.4 Candidate Screening**

**Go to:** HR → Hiring → Recruitment

**Find:** Michael Eze in candidates list

**Click:** "Screen" button

**Verify:**
- [ ] All candidate details displayed
- [ ] Resume link clickable
- [ ] Skills shown as badges
- [ ] Applied job details shown

**Action:** Click "Schedule Interview"

**Fill Interview Form:**
- Interview Type: `Technical Interview`
- Scheduled Date: `Tomorrow's date`
- Scheduled Time: `10:00`
- Duration: `60 minutes`
- Location: `Zoom Meeting`
- Interview Type: `video`
- Meeting Link: `https://meet.google.com/xyz-abc-def`
- Interviewers: `Sarah Johnson, John Adebayo`
- Notes: `Focus on React and Node.js experience`
- ✅ Send email notification
- ✅ Send calendar invite

**Submit**

**Verify:**
- [ ] Interview appears in "Upcoming Interviews" section
- [ ] Interview shows scheduled date/time
- [ ] Panel members listed (2 interviewers)
- [ ] "Join Meeting" button visible
- [ ] Candidate status changed to "Interviewing"

### **4.5 Leave Management**

**Go to:** HR → Core HR → Leave Management

**Verify:**
- [ ] All 3 leave types visible (Annual, Sick, Personal)
- [ ] No leave requests yet

---

## 👤 **Step 5: Test Employee Platform**

### **5.1 Employee Dashboard**

**Go to:** `http://localhost:3005?employee=EMP001&company=acme`

**Verify:**
- [ ] Welcome message: "Welcome back, Sarah!"
- [ ] Company: "Acme Corporation"
- [ ] Profile completeness shows percentage
- [ ] Leave balances displayed:
  - Annual Leave: 20 days remaining
  - Sick Leave: 10 days remaining
  - Personal Leave: 5 days remaining
- [ ] No pending requests
- [ ] Recent activities shown
- [ ] Stats cards load without errors

### **5.2 Submit Leave Request**

**Click:** "Leave Management" in sidebar

**Submit New Leave Request:**
- Leave Type: `Annual Leave`
- Start Date: `Next Monday`
- End Date: `Next Friday` (5 days)
- Reason: `Family vacation`

**Submit**

**Verify:**
- [ ] Success message
- [ ] Request appears in "My Leave Requests"
- [ ] Status: "Pending"
- [ ] Annual Leave balance updates: `15 days remaining` (20 - 5 pending)

### **5.3 Time Tracking**

**Go to:** Employee → Time Management

**Clock In:**
- **Click:** "Clock In" button
- **Allow:** Location access (if prompted)

**Verify:**
- [ ] "Currently Clocked In" badge appears
- [ ] Clock-in time displayed
- [ ] Timer running
- [ ] "Clock Out" button enabled

**Clock Out:**
- **Click:** "Clock Out" button

**Verify:**
- [ ] Success message
- [ ] Hours worked calculated
- [ ] Entry appears in history
- [ ] Status changed to "Clocked Out"

### **5.4 Profile Management**

**Go to:** Employee → Profile Management

**Update Profile:**
- **Edit:** Emergency Contact
  - Name: `Jane Johnson`
  - Relationship: `Spouse`
  - Phone: `+234 803 999 8888`

**Save**

**Verify:**
- [ ] Success message
- [ ] Profile completeness percentage updates
- [ ] Changes reflected immediately

---

## 🏢 **Step 6: Test HR Review & Approval**

### **6.1 Review Leave Request**

**Go to:** HR Platform → Core HR → Leave Management

**Verify:**
- [ ] Sarah's leave request appears
- [ ] Shows "Pending" status
- [ ] All details correct (dates, type, reason)

**Action:** Click "Approve"

**Verify:**
- [ ] Status changes to "Approved"
- [ ] Leave balance updates on employee side

### **6.2 Switch to Employee View**

**Go to:** `http://localhost:3005?employee=EMP001&company=acme`

**Navigate to:** Leave Management

**Verify:**
- [ ] Request status: "Approved" ✅
- [ ] Annual Leave balance: `15 days remaining` (20 - 5 approved)
- [ ] Pending days: `0`

---

## 🌐 **Step 7: Test Multi-Tenancy**

### **7.1 Create TechCorp Data**

**Switch Company in HR Platform:**
- **Use:** Company switcher dropdown (top right)
- **Select:** "TechCorp Inc."

**Verify:**
- [ ] Company name changes
- [ ] Dashboard stats reset to 0
- [ ] No employees shown
- [ ] No jobs shown

**Create Job for TechCorp:**
- Title: `DevOps Engineer`
- Department: `Operations`
- Location: `Abuja, Nigeria`
- Salary: `₦4,000,000 - ₦6,000,000`

**Save**

### **7.2 Verify Data Isolation**

**Go to:** `http://localhost:3004/careers/techcorp`

**Verify:**
- [ ] Only TechCorp jobs shown
- [ ] DevOps Engineer visible
- [ ] Acme jobs NOT visible

**Go to:** `http://localhost:3004/careers/acme`

**Verify:**
- [ ] Only Acme jobs shown
- [ ] Full Stack Developer visible
- [ ] TechCorp jobs NOT visible

---

## ✅ **Step 8: Final Verification Checklist**

### **HR Platform:**
- [ ] Dashboard loads with correct stats
- [ ] Employee directory shows all employees
- [ ] Jobs posted are visible
- [ ] Candidates auto-created from applications
- [ ] Interview scheduling works
- [ ] Leave requests appear
- [ ] Leave approval works
- [ ] Company switcher works
- [ ] No console errors

### **Employee Platform:**
- [ ] Dashboard loads for each employee
- [ ] Leave balances correct
- [ ] Leave requests submit successfully
- [ ] Time tracking works (clock in/out)
- [ ] Profile updates save
- [ ] Company-specific data shown
- [ ] No console errors

### **Careers Platform:**
- [ ] Jobs display for each company
- [ ] Application form works
- [ ] Multi-tenancy working (domain-based routing)
- [ ] Applications sync to HR platform
- [ ] No console errors

---

## 🐛 **Step 9: Document Any Issues**

**If you find bugs, note:**
1. Platform (HR/Employee/Careers)
2. Feature/Page
3. Steps to reproduce
4. Expected vs Actual behavior
5. Console errors (if any)

---

## 🎉 **Step 10: Ready for New Features!**

Once all tests pass:
- ✅ System verified working
- ✅ Clean baseline established
- ✅ Multi-tenancy confirmed
- ✅ Real-time sync validated

**Now you can confidently add new features knowing the foundation is solid!**

---

## 📝 **Testing Notes Template**

```markdown
## Test Session: [Date]

### Platform: HR / Employee / Careers
### Tester: [Your Name]

#### Tests Passed:
- ✅ Feature 1
- ✅ Feature 2

#### Tests Failed:
- ❌ Feature 3
  - Issue: [Description]
  - Steps: [How to reproduce]
  - Error: [Console output]

#### Performance Notes:
- Load times
- Responsiveness
- Any lag or delays

#### Suggestions:
- UI improvements
- Feature requests
- Bug fixes needed
```

---

## 🚀 **Next Steps After Testing:**

1. **Fix any bugs found**
2. **Add new features** (authentication, notifications, etc.)
3. **Polish UI/UX**
4. **Prepare for production**

**Good luck testing! 🎯**




