# Deployment and Testing Guide

## 🚀 Deployment to Vercel

### Prerequisites
- Vercel CLI installed: `npm install -g vercel`
- Logged into Vercel: `vercel login`
- Git repository committed with all changes

### Deployment Steps

#### 1. Deploy HR Platform
```bash
cd hr-platform
vercel deploy --prod --yes
```

#### 2. Deploy Employee Platform
```bash
cd ../employee-platform
vercel deploy --prod --yes
```

#### 3. Deploy Careers Platform (if needed)
```bash
cd ../careers-platform
vercel deploy --prod --yes
```

#### 4. Run Backfill Script (Important!)
After deployment, update Firestore with new URLs:
```powershell
# Windows PowerShell
$env:GOOGLE_APPLICATION_CREDENTIALS = "C:\hris-admin.json\hris-system-baa22-firebase-adminsdk-fbsvc-81a3572f70.json"
node scripts\backfillPlatformConfig.js
```

---

## ✅ Comprehensive Testing Guide

This guide covers all the changes made in this update:

### 📋 Test Checklist Overview

1. ✅ **Book Meeting with HR** - Merged meeting features
2. ✅ **Performance Review** - Employee dropdown selection
3. ✅ **Meeting Stat Cards** - Moved to Book Meeting page
4. ✅ **Absent Employee Calculation** - Proper counting
5. ✅ **Configurable Late Threshold** - Office Settings

---

## Test 1: Book Meeting with HR (Employee Platform)

### Objective
Verify that the merged Book Meeting page works correctly with all features.

### Steps

1. **Access Book Meeting Page**
   - Log in to Employee Platform
   - Navigate to "Book Meeting with HR" from sidebar
   - ✅ Verify page loads with 3 tabs: "Book Meeting", "My Meetings", "HR Availability"

2. **Test Stat Cards**
   - ✅ Verify "Approved Meetings" card shows correct count (purple)
   - ✅ Verify "Pending Meetings" card shows correct count (yellow)
   - ✅ Verify cards are positioned above the tabs

3. **Test Book Meeting Tab**
   - Click "Book Meeting" tab
   - ✅ Verify "HR Booking Page" option appears (if configured)
   - ✅ Verify "Manual Request" button is visible
   - Click "Manual Request"
   - ✅ Verify form opens with all fields

4. **Test Manual Meeting Request**
   - Fill in meeting form:
     - Title: "Test Meeting"
     - Description: "Testing manual request"
     - Meeting Type: Select any type
     - Date: Select today or future date
     - Time: Select a time
     - Duration: 30 minutes
     - Meeting Link: "https://meet.google.com/test-123"
   - Click "Schedule Meeting"
   - ✅ Verify meeting is created
   - ✅ Verify success message appears
   - ✅ Verify meeting appears in "My Meetings" tab

5. **Test My Meetings Tab**
   - Click "My Meetings" tab
   - ✅ Verify 3 sub-tabs: "Upcoming", "Pending", "All"
   - ✅ Verify meetings are displayed correctly
   - ✅ Verify status badges are correct (Pending = yellow, Approved = green)
   - ✅ Verify "Cancel Request" button works for pending meetings
   - ✅ Verify "Join Meeting" button appears for approved meetings (when time is right)

6. **Test HR Availability Tab**
   - Click "HR Availability" tab
   - ✅ Verify HR availability slots are displayed (if configured)
   - ✅ Verify slots are grouped by day
   - Click on an available slot
   - ✅ Verify booking form opens
   - ✅ Verify form is pre-filled with slot time
   - ✅ Verify "End Time" field is NOT visible (removed)
   - Fill in title and description
   - Click "Confirm Booking"
   - ✅ Verify meeting is created
   - ✅ Verify meeting appears in "My Meetings"

---

## Test 2: Performance Management (Employee Platform)

### Objective
Verify that Performance Management no longer has meetings tab and only shows Goals and Reviews.

### Steps

1. **Access Performance Management**
   - Log in to Employee Platform
   - Navigate to "Performance" from sidebar
   - ✅ Verify only 2 tabs: "Goals" and "Reviews"
   - ✅ Verify "Meetings" tab is NOT present

2. **Verify Stat Cards**
   - ✅ Verify stat cards show: Active Goals, Completed Goals, Overdue Goals, At Risk Goals
   - ✅ Verify "Approved Meetings" and "Pending Meetings" cards are NOT present

3. **Test Goals Tab**
   - Click "Goals" tab
   - ✅ Verify goals are displayed
   - ✅ Verify all goal features work (create, edit, view, delete)

4. **Test Reviews Tab**
   - Click "Reviews" tab
   - ✅ Verify reviews are displayed
   - ✅ Verify review details are shown correctly

---

## Test 3: Performance Review Form (HR Platform)

### Objective
Verify that the Performance Review form uses a dropdown for employee selection.

### Steps

1. **Access Performance Management (HR)**
   - Log in to HR Platform
   - Navigate to "Core HR" → "Performance Management"
   - Click "Write Performance Review" button
   - ✅ Verify form opens

2. **Test Employee Dropdown**
   - ✅ Verify "Employee" field is a dropdown (not text input)
   - ✅ Verify dropdown shows format: "Employee Name (EmployeeID)"
   - ✅ Verify all employees in company are listed
   - Select an employee from dropdown
   - ✅ Verify both Employee ID and Employee Name are auto-filled
   - ✅ Verify confirmation message shows selected employee

3. **Test Review Creation**
   - Fill in review form:
     - Employee: Select from dropdown
     - Review Period: "Q1 2025"
     - Overall Rating: 4
     - Strengths: "Test strength 1\nTest strength 2"
     - Areas for Improvement: "Test improvement 1"
     - Goals: "Test goal 1"
     - Comments: "Test comments"
   - Click "Submit Review"
   - ✅ Verify review is created successfully
   - ✅ Verify review appears in reviews list

---

## Test 4: Time Management - Absent Employees (HR Platform)

### Objective
Verify that absent employees are correctly calculated and displayed.

### Steps

1. **Access Time Management**
   - Log in to HR Platform
   - Navigate to "Core HR" → "Time Management"
   - ✅ Verify "Absent Today" stat card is visible

2. **Verify Absent Calculation**
   - Note the total number of employees in your company
   - Note the number of employees who have clocked in today
   - ✅ Verify "Absent Today" = Total Employees - Employees with Records Today
   - ✅ Verify calculation is correct

3. **Test with Real Data**
   - Have some employees clock in
   - ✅ Verify "Present Today" count increases
   - ✅ Verify "Absent Today" count decreases accordingly
   - ✅ Verify "Late Arrivals" count is correct

4. **Test Date Filtering**
   - Change the date filter to today
   - ✅ Verify only today's records are shown
   - ✅ Verify absent count is based on today only

---

## Test 5: Configurable Late Threshold (HR Platform)

### Objective
Verify that HR can configure the late arrival threshold time.

### Steps

1. **Access Office Settings**
   - Log in to HR Platform
   - Navigate to "Core HR" → "Time Management"
   - Click "Office Settings" tab
   - ✅ Verify "Late Arrival Threshold" card is visible

2. **Configure Late Threshold**
   - Find "Expected Start Time" input
   - ✅ Verify default value is "09:00" (if not previously set)
   - Change time to "08:30"
   - Click "Save"
   - ✅ Verify success toast appears
   - ✅ Verify message shows: "Employees clocking in after 08:30 will be marked as late"

3. **Test Late Calculation**
   - Go to "Attendance & Time" tab
   - Create or adjust an attendance record:
     - Clock In Time: "08:31"
     - ✅ Verify status shows "Late" (yellow badge)
   - Adjust to "08:29"
   - ✅ Verify status shows "Present" (green badge)

4. **Test Different Thresholds**
   - Go back to Office Settings
   - Change threshold to "10:00"
   - Save
   - ✅ Verify new threshold is saved
   - Test with clock-in times:
     - "09:59" → ✅ Should be "Present"
     - "10:01" → ✅ Should be "Late"
     - "10:31" → ✅ Should be "Late" (not Absent)

5. **Verify Company Isolation**
   - Log in as different company
   - ✅ Verify late threshold is independent (can be different)
   - ✅ Verify changes don't affect other companies

---

## Test 6: Cross-Platform Meeting Sync

### Objective
Verify that meetings created by employees appear in HR platform.

### Steps

1. **Create Meeting from Employee Platform**
   - Log in to Employee Platform
   - Go to "Book Meeting with HR"
   - Create a meeting (manual or via slot)
   - ✅ Verify meeting is created
   - ✅ Verify meeting appears in "My Meetings" → "Pending"

2. **Verify in HR Platform**
   - Log in to HR Platform (same company)
   - Navigate to "Core HR" → "Performance Management"
   - Go to "Meetings" tab
   - ✅ Verify employee-created meeting appears
   - ✅ Verify meeting shows correct employee name
   - ✅ Verify meeting status is "Pending"
   - ✅ Verify meeting has correct details (title, date, time, etc.)

3. **Approve Meeting from HR**
   - Click on the meeting
   - Approve the meeting
   - ✅ Verify meeting status changes to "Approved"

4. **Verify in Employee Platform**
   - Go back to Employee Platform
   - Check "My Meetings" → "Upcoming"
   - ✅ Verify meeting now appears in "Upcoming" tab
   - ✅ Verify status badge shows "Approved" (green)

---

## Test 7: Data Integrity

### Objective
Verify that all data is properly associated with companyId.

### Steps

1. **Multi-Tenancy Check**
   - Create meetings/goals/reviews in Company A
   - Log in as Company B
   - ✅ Verify Company B cannot see Company A's data
   - ✅ Verify stat counts are correct for each company

2. **Real-Time Sync**
   - Open Employee Platform and HR Platform side by side
   - Create a meeting from Employee Platform
   - ✅ Verify meeting appears in HR Platform within a few seconds
   - ✅ Verify no page refresh needed

---

## 🐛 Common Issues & Troubleshooting

### Issue: Meetings not appearing in HR platform
**Solution:**
- Check browser console for errors
- Verify `companyId` is set correctly
- Check Firestore console for `performanceMeetings` collection
- Verify meeting has `companyId` field

### Issue: Late threshold not saving
**Solution:**
- Check browser console for errors
- Verify you're logged in as HR
- Check Firestore `hrSettings` collection
- Verify `companyId` is present

### Issue: Absent count is wrong
**Solution:**
- Verify employees are loaded correctly
- Check that attendance records have correct `date` field
- Verify date format is YYYY-MM-DD
- Check browser console for calculation logs

### Issue: Employee dropdown is empty
**Solution:**
- Verify employees exist in the company
- Check that `companyId` is set
- Verify employee service is initialized
- Check browser console for errors

---

## 📊 Success Criteria

All tests should pass with:
- ✅ No console errors
- ✅ Data persists correctly
- ✅ Real-time sync works
- ✅ Multi-tenancy is maintained
- ✅ UI is responsive and user-friendly
- ✅ All features are accessible

---

## 📝 Notes

- **Deployment URLs:**
  - HR Platform: https://hr-platform-l54uor6q2-pam-pam29s-projects.vercel.app
  - Employee Platform: https://hris-employee-platform-qg05c29xe-pam-pam29s-projects.vercel.app
  - Careers Platform: https://hris-careers-platform-jyjykiok4-pam-pam29s-projects.vercel.app

- **After Deployment:**
  - Always run the backfill script
  - Clear browser cache if issues occur
  - Check Vercel deployment logs for errors
  - Verify environment variables are set

---

## 🎯 Quick Test Summary

**Must Test:**
1. ✅ Book Meeting page has all 3 tabs
2. ✅ Meeting stat cards are on Book Meeting page (not Performance)
3. ✅ Performance Management only has Goals and Reviews tabs
4. ✅ Performance Review form uses employee dropdown
5. ✅ Absent employees are calculated correctly
6. ✅ Late threshold can be configured and works
7. ✅ Employee-created meetings appear in HR platform

**Time Estimate:** 30-45 minutes for full testing

---

Good luck with your deployment! 🚀

