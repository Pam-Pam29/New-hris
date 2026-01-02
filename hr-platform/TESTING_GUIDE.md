# Testing Guide for New Features

## Features to Test

1. ✅ Asset Assignment Notifications
2. ✅ Location Filtering (Generic Locations Removed)
3. ✅ Date of Birth (DOB) Required Field & Firebase Integration

---

## Pre-Testing Setup

### 1. Start Development Servers

**Terminal 1 - HR Platform:**
```bash
cd hr-platform
npm run dev
```
Should start on `http://localhost:3003` (or your configured port)

**Terminal 2 - Employee Platform:**
```bash
cd employee-platform
npm run dev
```
Should start on `http://localhost:3005` (or your configured port)

### 2. Verify Environment Variables

Make sure you have:
- Firebase credentials configured
- Resend API key set (if testing emails)
- Company ID available

---

## Test 1: Date of Birth (DOB) - Required Field

### Test Steps:

1. **Open HR Platform** → Login as HR Admin
2. **Navigate to:** Employee Management → Employee Directory
3. **Click:** "Add Employee" button
4. **Fill in the form:**
   - Name: `Test Employee`
   - Email: `test@example.com`
   - Role: `Software Engineer`
   - Department: Select any department
   - **Date of Birth:** Select a date (REQUIRED - form should not submit without it)

### Expected Results:

✅ **Form Validation:**
- Form should NOT submit if DOB is empty
- Should show error/alert: "Please fill in all required fields including Date of Birth"
- Date picker should have max date = today (can't select future dates)

✅ **After Submitting:**
- Employee should be created successfully
- DOB should be saved to Firebase in multiple formats:
  - `personalInfo.dateOfBirth` (Timestamp)
  - `dob` (string YYYY-MM-DD)
  - `dateOfBirth` (string YYYY-MM-DD)

### Verify in Firebase Console:

1. Go to Firebase Console → Firestore Database
2. Navigate to `employees` collection
3. Find the newly created employee document
4. Check these fields exist:
   ```json
   {
     "personalInfo": {
       "dateOfBirth": Timestamp(...)
     },
     "dob": "2024-01-15",
     "dateOfBirth": "2024-01-15"
   }
   ```

### Console Logs to Check:

Look for these logs in browser console:
- `📅 [HR] Saving Date of Birth to Firebase:`
- `📅 [DataFlow] Saving DOB to legacy fields:`
- `🔍 [DataFlow] Saving employee profile to Firestore:`

---

## Test 2: Asset Assignment Notifications

### Test Steps:

1. **Prerequisites:**
   - Have at least one employee created (from Test 1)
   - Have at least one asset available in the system

2. **Navigate to:** Asset Management
3. **Find an available asset** (status = "Available")
4. **Click:** "Assign" button on the asset
5. **Select:** The employee you created in Test 1
6. **Click:** "Assign Asset"

### Expected Results:

✅ **Immediate Feedback:**
- Success toast: "Asset assigned successfully. Employee has been notified."
- Asset status changes to "Assigned"
- Asset shows employee name in "Assigned To" column

✅ **Email Notification:**
- Check browser console for: `📧 Asset assignment notification sent to: [email]`
- If Resend is configured, employee should receive email
- Email should contain:
  - Asset name
  - Asset type
  - Serial number
  - Assignment date

✅ **Real-time Update on Employee Dashboard:**
- Open Employee Platform (in another browser/incognito)
- Login as the assigned employee
- Navigate to "My Assets" or Dashboard
- Asset should appear immediately (no page refresh needed)
- Asset should show in "Assigned Assets" section

### Console Logs to Check:

Look for:
- `✅ Asset assigned: [assetId] to employee: [employeeId]`
- `📧 Asset assignment notification sent to: [email]`
- `📡 Real-time update: Assets changed`

---

## Test 3: Location Filtering (Generic Locations Removed)

### Test Steps:

1. **Navigate to:** Time Management
2. **Check Office Locations Section:**
   - Look at the office locations dropdown
   - Check locations in the list

### Expected Results:

✅ **Only Valid Locations Show:**
- Locations must have:
  - Valid name (not "Office", "Location", "Headquarters", etc.)
  - Valid address (not empty)
  - Valid coordinates (latitude & longitude)
- Generic/incomplete locations should NOT appear

✅ **Console Logs:**
- Look for: `⚠️ Filtered out X generic/incomplete office location(s)`
- Should only show locations explicitly created by HR

### How to Test Filtering:

1. **Create a test location** (if you have location management):
   - Name: "Main Office" (valid)
   - Address: "123 Main St" (valid)
   - Coordinates: Valid lat/lng

2. **Check it appears** in the locations list

3. **If you have generic locations** in Firebase:
   - They should be automatically filtered out
   - Check console for filtering messages

---

## Test 4: Employee Self-Onboarding DOB

### Test Steps:

1. **Use the employee created in Test 1**
2. **Get the setup link** from HR (or use the one generated)
3. **Open Employee Platform** → Use setup link
4. **Complete onboarding:**
   - Navigate to Personal Information step
   - **Date of Birth field should be marked as required (*)**
   - Try to proceed without DOB → Should show error
   - Fill in DOB → Should proceed successfully

### Expected Results:

✅ **DOB Required:**
- Field marked with asterisk (*)
- Cannot proceed without DOB
- Validation error if DOB is missing

✅ **Saves to Firebase:**
- DOB saved in all formats (same as HR creation)
- Check Firebase console to verify

---

## Troubleshooting

### Issue: DOB not saving to Firebase

**Check:**
1. Browser console for errors
2. Firebase console → Check document structure
3. Network tab → Check if request succeeded
4. Verify date format is valid

**Solution:**
- Ensure date is valid (not future date)
- Check browser console for validation errors
- Verify Firebase permissions allow writes

### Issue: Asset notification not sending

**Check:**
1. Resend API key is configured
2. Employee email is valid
3. Browser console for email service errors

**Solution:**
- Verify `RESEND_API_KEY` in environment
- Check email service logs
- Test email service separately

### Issue: Locations still showing generic ones

**Check:**
1. Console logs for filtering messages
2. Location data in Firebase
3. Filter logic in code

**Solution:**
- Check if locations have proper name/address
- Verify coordinates are valid numbers
- Check console for filtering logs

---

## Success Criteria

All tests pass if:

✅ **DOB:**
- Required in HR employee creation
- Required in employee onboarding
- Saves to Firebase in all formats
- Appears in employee profile

✅ **Asset Notifications:**
- Email sent when asset assigned
- Real-time update on employee dashboard
- Asset appears immediately

✅ **Locations:**
- Only valid HR-created locations show
- Generic locations filtered out
- Console shows filtering messages

---

## Quick Test Checklist

- [ ] Create employee with DOB → Saves to Firebase
- [ ] Assign asset to employee → Email notification sent
- [ ] Check employee dashboard → Asset appears in real-time
- [ ] Check locations → Only valid locations shown
- [ ] Employee onboarding → DOB required and validated
- [ ] Firebase console → Verify all data structures

---

## Next Steps After Testing

1. **If all tests pass:** Deploy to production
2. **If issues found:** Fix and retest
3. **Document any edge cases** discovered
4. **Update user documentation** if needed

