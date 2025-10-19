# 🧪 Test Extension Request Flow - Step by Step

## ✅ Verify Extensions Are NOT Auto-Approved

---

## 🎯 **Quick Test (5 minutes):**

### **Step 1: Employee Requests Extension**

**On EMPLOYEE Platform (Port 3002):**
1. Open Performance Management
2. Find or create an overdue goal
3. Click "⏰ Request Extension" button
4. Fill form:
   - New Deadline: (Pick a date 7 days from now)
   - Reason: "Testing extension request flow"
5. Click "Submit Request"

**✅ Expected Result:**
- Success message appears
- Button disappears
- Text shows: "⏳ Extension request pending manager approval"
- **NO green approval box** (would mean auto-approved)

**❌ If You See:**
- "✅ Extension Approved!" immediately = BUG! Extension was auto-approved

---

### **Step 2: Check Firebase (Verify Pending)**

**Open Firebase Console:**
1. Go to Firestore Database
2. Open `performanceGoals` collection
3. Find your goal document
4. Look at the fields

**✅ Expected Fields:**
```javascript
{
    extensionRequested: true,
    extensionRequestDate: Timestamp(...),
    extensionRequestReason: "Testing extension request flow",
    requestedNewDeadline: Timestamp(...),
    extensionApproved: undefined,  // ← KEY: Should be undefined!
    extensionApprovedBy: undefined,
    extensionApprovedDate: undefined
}
```

**❌ If You See:**
```javascript
{
    extensionApproved: true  // ← BUG! Was auto-approved
}
```

---

### **Step 3: HR Sees Pending Request**

**On HR Platform (Port 3001):**
1. Open HR Performance Management
2. Look at alert at top
3. Should see: "🔔 2 Extension Requests Pending" (ORANGE box)
4. Click "Extension Requests" tab (should have ORANGE indicator)
5. See your request listed

**✅ Expected Result:**
- Request is visible
- Shows employee name
- Shows reason
- Has "View Details" button

**❌ If You Don't See Request:**
- Check you're looking at correct HR account
- Refresh page
- Check Firebase Console (should still be `extensionApproved: undefined`)

---

### **Step 4: HR Approves**

**On HR Platform:**
1. Click "View Details" on the extension request
2. Modal opens
3. Select "○ Approve" (radio button)
4. Click "👍 Approve Extension" (GREEN button)

**✅ Expected Result:**
- Success message: "✅ Extension request approved. Employee has been notified."
- Modal closes
- Request disappears from "Extension Requests" tab
- Alert count decreases

---

### **Step 5: Employee Gets Notification**

**On EMPLOYEE Platform (Auto-updates, no refresh needed!):**

**✅ Expected Result:**
- **GREEN modal pops up automatically!** 🎉
- Title: "Extension Request Approved!"
- Shows: "🎉 Good news! Your extension has been approved."
- Shows: "New Deadline: [date]"
- Shows: "Current Progress: X%"
- Big button: "✔️ Okay, I Understand"

**Employee must click "Okay":**
1. Click "Okay, I Understand"
2. Modal closes
3. Goal card now shows green approval box

---

### **Step 6: Verify in Firebase**

**Open Firebase Console Again:**

**✅ Expected Fields NOW:**
```javascript
{
    extensionRequested: true,
    extensionApproved: true,           // ← NOW true!
    extensionApprovedBy: "HR001",
    extensionApprovedDate: Timestamp(...),
    endDate: Timestamp(...),           // ← Updated to new deadline!
    status: "in_progress",             // ← Reset from overdue
    daysOverdue: 0,
    extensionDecisionAcknowledged: true  // ← After clicking "Okay"
}
```

---

## 🔴 **Test Rejection Flow:**

### **Step 1: Employee Requests Another Extension**

Same as above - submit extension request for a different goal.

---

### **Step 2: HR Rejects**

**On HR Platform:**
1. Open extension request
2. Select "● Reject" (radio button)
3. Enter reason: "Project deadline cannot be moved. Please prioritize completion."
4. Click "👎 Reject Request" (RED button)

**✅ Expected Result:**
- Success message
- Request disappears from list

---

### **Step 3: Employee Gets Rejection Notification**

**On EMPLOYEE Platform (Auto-updates!):**

**✅ Expected Result:**
- **ORANGE modal pops up automatically!** 🟠
- Title: "Extension Request Rejected"
- Shows: "Your extension request was not approved."
- Shows: "Manager's Feedback: [rejection reason]"
- Shows: "Days Overdue: X"
- Shows: "💡 Next Steps: Please prioritize this goal..."
- Big button: "✔️ Okay, I Understand"

---

## 📊 **Summary Checklist:**

- [ ] Employee requests extension
- [ ] Employee UI shows "⏳ pending" (NOT "✅ approved")
- [ ] Firebase shows `extensionApproved: undefined`
- [ ] HR sees request in pending state
- [ ] HR approves
- [ ] Firebase updates to `extensionApproved: true`
- [ ] Employee gets GREEN modal automatically
- [ ] Employee clicks "Okay"
- [ ] Goal deadline is updated

**If ALL boxes checked:** ✅ Extension flow works correctly!  
**If ANY box unchecked:** ❌ There's an issue - check `EXTENSION_NOT_AUTO_APPROVED_FIX.md`

---

## 🚨 **Common Issues:**

### **Issue 1: Extension shows as approved immediately**
**Cause:** Old cached data or Firebase rules issue  
**Fix:** 
1. Hard refresh (Ctrl + Shift + R)
2. Check Firebase Console to confirm actual state
3. Clear browser cache

### **Issue 2: HR doesn't see the request**
**Cause:** Wrong employee ID or data sync issue  
**Fix:**
1. Check Firebase Console - is `extensionRequested: true`?
2. Refresh HR platform
3. Check console for errors

### **Issue 3: Employee modal doesn't pop up**
**Cause:** Modal was already shown and acknowledged  
**Fix:**
1. Check Firebase: Is `extensionDecisionAcknowledged: true`?
2. Delete that field in Firebase Console
3. Refresh employee platform - modal should appear

---

## 🎉 **Expected Timeline:**

| Action | Time | Result |
|--------|------|--------|
| Employee submits | 0s | "⏳ pending" shown |
| HR sees request | ~1s | Real-time sync |
| HR approves | +5s | Clicks button |
| Employee modal | ~1s | Auto-pops up |
| Employee clicks Okay | +3s | Modal closes |
| **Total** | **~10s** | **Complete!** |

---

## 💡 **Remember:**

**Extension requests are NEVER auto-approved!**

They ONLY get approved when:
1. HR manually clicks "Approve Extension" button
2. After reviewing the request details
3. Making a conscious decision

**The system is designed for proper approval workflow!** ✅


