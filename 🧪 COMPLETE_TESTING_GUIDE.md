# 🧪 COMPLETE TESTING GUIDE - Employee Platform Flow

## 🎯 **TESTING THE FULL EMPLOYEE JOURNEY**

**Your platforms are deployed! Let's test the complete flow:**

---

## ✅ **STEP 1: CREATE EMPLOYEE (HR Platform)**

**URL:** https://hris-system-baa22.web.app

### **Do This:**

1. **Login as HR:**
   - Email: `hr@acme.com`
   - Password: (your password)

2. **Navigate to:** Core HR → Employee Management

3. **Create New Employee:**
   - Click "Add Employee"
   - Fill in details:
     - First Name: Test
     - Last Name: Employee
     - Email: **YOUR_EMAIL@gmail.com** (use real email!)
     - Employee ID: ACM999
     - Department: Engineering
     - Position: Software Developer
     - Hire Date: Today

4. **Create Contract:**
   - After saving employee, click "Create Contract"
   - Fill contract details:
     - Contract Type: Full-time
     - Salary: 50000
     - Start Date: Today
     - Click "Generate Contract"
   
5. **Complete Contract:**
   - Click "Complete Contract" button
   - ✅ This sends invitation email!

---

## 📧 **STEP 2: CHECK EMAIL**

**Check the email you entered (YOUR_EMAIL@gmail.com)**

You should receive:
```
Subject: 🎉 Welcome to Acme Corporation - Set Up Your Account

Hello Test!

Your employee account is ready...
```

**Click the "Set Up My Account" button in email**

---

## 🔐 **STEP 3: PASSWORD SETUP (Employee Platform)**

**The link takes you to:** https://hris-employee-platform.vercel.app/setup?token=...

1. **Set Your Password:**
   - Enter new password
   - Confirm password
   - Click "Set Password & Continue"

2. **You'll be redirected to login automatically**

---

## ✅ **STEP 4: LOGIN (Employee Platform)**

**Now at:** https://hris-employee-platform.vercel.app/login

1. **Login with:**
   - Email: The email you used
   - Password: The password you just created

2. **You should see:**
   - ✅ Dashboard loads
   - ✅ Your profile shows
   - ✅ Company: Acme Corporation
   - ✅ No more "not authenticated" errors!

---

## 🎊 **STEP 5: VERIFY EVERYTHING WORKS**

### **In Employee Platform:**

✅ **Dashboard:** Shows your stats  
✅ **Profile:** Shows your information  
✅ **Leave Management:** Can request leave  
✅ **Time Management:** Clock in/out  
✅ **Payroll:** View payslips  
✅ **Book Meeting:** Schedule with HR  

---

## 🚨 **TROUBLESHOOTING:**

### **"No email received"**

**Check:**
1. Spam/junk folder
2. HR Platform console - any errors?
3. Email address correct in employee profile?
4. Resend API key configured in HR Platform

**Test Email Manually:**
```bash
cd New-hris
node test-resend.js
```

### **"Setup link doesn't work"**

**Verify:**
- URL contains `?token=...`
- Token is not expired
- Employee Platform deployed correctly

### **"Can't login"**

**Check:**
1. Did you complete password setup?
2. Using correct email?
3. Firebase Authentication enabled?

---

## 📝 **EXPECTED CONSOLE LOGS:**

### **Before Login (NORMAL):**
```
ℹ️ [Auth] No existing session found
🔒 [ProtectedRoute] Not authenticated, redirecting to login
```

### **After Login (SUCCESS):**
```
✅ [Auth] User authenticated: test@example.com
✅ [Employee] Company context loaded: Acme Corporation
✅ [Employee] Profile loaded
```

---

## 🎯 **QUICK TEST CHECKLIST:**

- [ ] HR can create employee
- [ ] Contract generates correctly
- [ ] Email sends on contract completion
- [ ] Setup link works
- [ ] Password setup page loads
- [ ] Can set password
- [ ] Redirects to login
- [ ] Can login with new credentials
- [ ] Dashboard loads with data
- [ ] Profile shows correct info
- [ ] All modules accessible

---

## 🔥 **CURRENT ISSUE YOU'RE SEEING:**

**Your logs:**
```
ℹ️ [Auth] No existing session found
🔒 [ProtectedRoute] Not authenticated, redirecting to login
```

**This means:** You tried to access Employee Platform directly without logging in.

**This is CORRECT!** The system is protecting employee data. 🔒

**To fix:** Follow the complete flow above (create employee → receive email → setup password → login)

---

## 💡 **ALTERNATE: Test Without Email**

**If you want to test WITHOUT waiting for email:**

### **Option A: Manual Password Setup**

1. **In HR Platform, note the Employee ID** (e.g., ACM999)
2. **In Firebase Console:**
   - Go to Authentication
   - Find the employee email
   - Get the UID
3. **Create setup token manually** (advanced)

### **Option B: Use Firebase Console**

1. **Firebase Console → Authentication**
2. **Find employee email**
3. **Click "Reset password"**
4. **Use that link to set password**

### **Option C: Direct Firebase Auth**

1. **Go to:** https://hris-employee-platform.vercel.app/login
2. **Click "Forgot Password"** (if available)
3. **Reset via Firebase**

---

## 🎉 **SUCCESS LOOKS LIKE:**

**After completing the flow:**

1. ✅ Employee receives invitation email
2. ✅ Can set up password via link
3. ✅ Can login to Employee Platform
4. ✅ Dashboard shows personalized data
5. ✅ All modules work
6. ✅ Data syncs with HR Platform

**No more authentication errors!**

---

## 📊 **WHAT YOU'VE ACHIEVED:**

✅ **HR Platform:** Live on Firebase  
✅ **Employee Platform:** Live on Vercel  
✅ **Careers Platform:** Live on Vercel  
✅ **Email System:** Working with Resend  
✅ **Authentication:** Protecting routes  
✅ **Multi-tenancy:** Company isolation  
✅ **Real-time Sync:** Firestore working  

**You just need to test the complete flow!** 🚀

---

**Start from Step 1 and let me know which step you're on!**





