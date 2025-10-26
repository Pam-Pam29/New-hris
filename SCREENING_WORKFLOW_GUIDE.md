# 🔍 Candidate Screening Workflow - Complete Guide

## ✅ What's Been Implemented

### **New Screening-First Recruitment Flow**

Instead of jumping straight to interviews, HR can now properly **screen candidates first**, review all their details, and then decide whether to interview or reject them.

---

## 🎯 New Workflow

### **Before (Old):**
```
Candidate List → Click "Interview" → Schedule directly
```

### **After (New):**
```
Candidate List → Click "Screen" → Review ALL details → Decide:
  → Schedule Interview ✅
  → Reject ❌
  → Close (review later)
```

---

## 📋 Step-by-Step Guide

### **Step 1: View Candidates**

Go to: **HR Platform → Recruitment → Candidates Tab**

You'll see all candidates with:
- Name
- Email
- Position
- Status badge
- **"Screen" button** (blue)

---

### **Step 2: Screen a Candidate**

**Click "Screen" button** on any candidate

**Screening Dialog Opens (Full Width):**

#### **📊 What You'll See:**

1. **Status Badge** (top)
   - New (default)
   - Interviewing
   - Hired
   - Rejected

2. **Personal Information**
   - Full Name
   - Email
   - Phone
   - Applied Position

3. **Resume** (if provided)
   - Clickable link: "View Resume"
   - Opens in new tab

4. **Experience**
   - Full text description of their experience

5. **Skills** (as badges)
   - All skills listed
   - Easy to scan

6. **Application Notes**
   - Cover letter
   - Application date
   - Any additional notes
   - Shows in formatted box

7. **Applied Job Details** (highlighted box)
   - Job title
   - Department (with icon)
   - Location (with icon)
   - Salary range (with icon)
   - Job type (with icon)

---

### **Step 3: Make a Decision**

**At the bottom, you have 3 action buttons:**

#### **For New Candidates (status = "new"):**

1. **Close** (outline button)
   - Just close the dialog
   - Review later
   - No status change

2. **Reject** (red button)
   - Mark candidate as rejected
   - Confirmation required
   - Status → "rejected"
   - Removes from active candidates

3. **Schedule Interview** (blue button)
   - Opens interview scheduling popup
   - Fill in:
     - Date/Time
     - Duration (60 min default)
     - Type (Video/Phone/Onsite)
     - Interviewer ID
     - Notes
   - Status → "interviewing"

#### **For Interviewing Candidates:**

- **Hire Candidate** (green button)
  - Mark as hired
  - Status → "hired"
  - Moves to hired list

---

## 🎨 Visual Changes

### **Candidates List:**

**Before:**
```
[Eye icon] [Calendar icon Interview]
```

**After:**
```
[Eye icon Screen]
```

### **Screening Dialog:**

**Before:**
- Basic modal
- Only name, email, phone, position
- Edit and Close buttons

**After:**
- **Full-width modal** (max-w-4xl)
- **Comprehensive view:**
  - ✅ Personal info (2-column grid)
  - ✅ Resume link (clickable)
  - ✅ Experience (full text)
  - ✅ Skills (badges)
  - ✅ Application notes (formatted box)
  - ✅ Job details (highlighted, with icons)
- **Action buttons:**
  - ✅ Close
  - ✅ Reject (for new candidates)
  - ✅ Schedule Interview (for new candidates)
  - ✅ Hire (for interviewing candidates)

---

## 🧪 How to Test

### **Test 1: Screen New Candidate**

1. **Go to:** `http://localhost:3001/hr/recruitment`
2. **Switch to Candidates tab**
3. **Click "Screen"** on victoria fakunle (or any candidate)

**You should see:**
- ✅ "Screen Candidate" title
- ✅ Status badge showing "new"
- ✅ All personal details
- ✅ Resume link (if available)
- ✅ Experience text
- ✅ Skills as badges
- ✅ Application notes
- ✅ Job details in blue box
- ✅ Three buttons: Close | Reject | Schedule Interview

---

### **Test 2: Schedule Interview from Screening**

1. **Click "Screen"** on a new candidate
2. **Review all details** (scroll through)
3. **Click "Schedule Interview"**

**Interview Dialog Opens:**
- Fill in date/time (must be future)
- Select type (Video/Phone/Onsite)
- Duration (default 60 min)
- Interviewer ID
- Notes
- Click "Schedule Interview"

**Result:**
- ✅ Interview scheduled
- ✅ Candidate status → "interviewing"
- ✅ Shows in Interviews tab
- ✅ Success message

---

### **Test 3: Reject Candidate**

1. **Click "Screen"** on a new candidate
2. **Review details**
3. **Click "Reject"** (red button)
4. **Confirm** in popup

**Result:**
- ✅ Candidate status → "rejected"
- ✅ Badge turns red
- ✅ Success message
- ✅ Dialog closes

---

### **Test 4: Hire from Screening**

1. **Find a candidate with status "interviewing"**
2. **Click "Screen"**
3. **Click "Hire Candidate"** (green button, bottom)

**Result:**
- ✅ Candidate status → "hired"
- ✅ Badge turns green
- ✅ Success message
- ✅ Dialog closes

---

## 🔄 Complete Recruitment Flow

### **End-to-End Process:**

```
1. External candidate applies via careers page
   ↓
2. Auto-creates in recruitment_candidates (status: "new")
   ↓
3. HR sees candidate in Recruitment → Candidates
   ↓
4. HR clicks "Screen" to review
   ↓
5. HR reviews:
   - Resume
   - Experience
   - Skills
   - Cover letter
   - Job details
   ↓
6. HR decides:
   
   Option A: Schedule Interview
   ↓
   - Fills interview details
   - Status → "interviewing"
   - Shows in Interviews tab
   ↓
   - After interview, HR screens again
   - Clicks "Hire" → status: "hired" ✅
   
   Option B: Reject
   ↓
   - Confirms rejection
   - Status → "rejected" ❌
   - Removed from active pool
   
   Option C: Close
   ↓
   - No action
   - Review later
```

---

## 📊 Status Flow

```
new → (Screen → Schedule Interview) → interviewing → (Screen → Hire) → hired

new → (Screen → Reject) → rejected
```

---

## 🎯 Benefits

### **1. Better Candidate Evaluation**
- See ALL details before interviewing
- Resume, skills, experience, cover letter
- Make informed decisions

### **2. Streamlined Workflow**
- One place to review everything
- Quick reject or interview from same screen
- No jumping between dialogs

### **3. Professional Process**
- Proper screening before interviews
- Only interview qualified candidates
- Track rejection reasons (in notes)

### **4. Time Savings**
- Quick reject unqualified candidates
- Focus interviews on strong candidates
- All info in one view

---

## 🔍 What's Shown in Screening Dialog

### **Always Visible:**
- ✅ Status badge
- ✅ Full name
- ✅ Email
- ✅ Phone
- ✅ Applied position

### **If Available:**
- ✅ Resume URL (clickable link)
- ✅ Experience text
- ✅ Skills list (as badges)
- ✅ Application notes/cover letter
- ✅ Job details (title, dept, location, salary, type)

### **Action Buttons (contextual):**

**If status = "new":**
- Close
- Reject
- Schedule Interview

**If status = "interviewing":**
- Close
- Hire Candidate

**If status = "hired" or "rejected":**
- Close only

---

## 🎨 UI Features

### **Responsive Design:**
- Full-width dialog (max-w-4xl)
- Scrollable content
- 2-column grid for info
- Icon-based job details

### **Visual Hierarchy:**
- Section headers with borders
- Highlighted job details (blue box)
- Notes in gray box (formatted)
- Color-coded action buttons

### **Accessibility:**
- Clear labels
- Clickable resume link
- Confirmation dialogs for destructive actions
- Status badges for quick scan

---

## ✅ Summary

**🎉 NEW SCREENING WORKFLOW IS LIVE!**

### **Key Changes:**
1. ✅ "Screen" button replaces "Interview" button in candidates list
2. ✅ Comprehensive screening dialog shows ALL candidate details
3. ✅ Interview scheduling moved INSIDE screening (after review)
4. ✅ Reject option added to screening
5. ✅ Hire option available for interviewing candidates

### **Result:**
- ✅ More professional recruitment process
- ✅ Better candidate evaluation
- ✅ Streamlined decision-making
- ✅ All info in one place

**Test it now in your HR platform!** 🚀












