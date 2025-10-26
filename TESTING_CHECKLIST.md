# Multi-Tenancy Testing Checklist

## ✅ Step 1: Complete Onboarding for Travellife

- [ ] Sign up with `hr@travellife.com`
- [ ] Complete company onboarding (if not already done)
- [ ] Verify you can access the HR dashboard
- [ ] Company ID should be: `mwtCcggGNLgGNUV7SuUt`

## ✅ Step 2: Add Employees to Travellife

- [ ] Click "Add Employee" or "New Employee"
- [ ] Fill in employee details:
  - Name: e.g., "John Doe"
  - Email: e.g., "john@travellife.com"
  - Department: e.g., "Sales"
  - Role: e.g., "Sales Manager"
- [ ] Save the employee
- [ ] Repeat to add 2-3 more employees

## ✅ Step 3: Verify Travellife Dashboard

- [ ] Go to Dashboard
- [ ] Check that you see ONLY Travellife employees
- [ ] Check console logs - should show: `📊 Found X employees in Firebase for company mwtCcggGNLgGNUV7SuUt`
- [ ] Verify no employees from other companies appear

## ✅ Step 4: Create Second Company (Siro)

- [ ] Sign out of Travellife account
- [ ] Go to signup page
- [ ] Create new account with: `hr@siro.com` (or any email)
- [ ] Complete onboarding for "Siro" company
- [ ] Note the new Company ID

## ✅ Step 5: Add Employees to Siro

- [ ] Add 2-3 test employees to Siro
- [ ] Verify they appear in Siro's dashboard

## ✅ Step 6: Test Multi-Tenancy

- [ ] Log out of Siro
- [ ] Log back into Travellife (`hr@travellife.com`)
- [ ] Verify dashboard shows ONLY Travellife employees (not Siro's)
- [ ] Log out of Travellife
- [ ] Log back into Siro
- [ ] Verify dashboard shows ONLY Siro employees (not Travellife's)

## ✅ Step 7: Test Other Pages

Test these pages for each company to ensure they're filtered correctly:

- [ ] Employee Directory - shows only company employees
- [ ] Leave Management - shows only company leave requests
- [ ] Time Management - shows only company time entries
- [ ] Payroll - shows only company employees
- [ ] Policies - shows only company policies
- [ ] Job Board - shows only company job postings

## Expected Results

✅ Each company ONLY sees their own data
✅ No data from other companies appears
✅ Console logs show correct companyId filtering
✅ Multi-tenancy is working correctly!











