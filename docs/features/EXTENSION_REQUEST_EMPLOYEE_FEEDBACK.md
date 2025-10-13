# 📬 Extension Request Feedback - Complete Employee Experience

## ✅ How Employees Know About Extension Decisions

---

## 🔄 **Complete Workflow:**

### **1️⃣ Employee Requests Extension**

**What Employee Sees:**
```
┌─────────────────────────────────────┐
│ Complete Training Goal              │
│ [🟠 OVERDUE 8d]                     │
│                                     │
│ ⚠️ This goal is 8 days overdue     │
│                                     │
│ [⏰ Request Extension]  ← Button    │
│                                     │
└─────────────────────────────────────┘
```

**Employee Clicks → Fills Form:**
- Requested New Deadline
- Reason for Extension

---

### **2️⃣ After Submitting Request**

**What Employee Sees:**
```
┌─────────────────────────────────────┐
│ Complete Training Goal              │
│ [🟠 OVERDUE 8d]                     │
│                                     │
│ ⚠️ This goal is 8 days overdue     │
│                                     │
│ ⏳ Extension request pending        │
│    manager approval                 │
│                                     │
└─────────────────────────────────────┘
```

**Status:** Waiting for HR/Manager decision

---

### **3️⃣ HR Approves Extension** ✅

**What Employee Sees (Auto-updates via real-time sync):**
```
┌─────────────────────────────────────┐
│ Complete Training Goal              │
│ [🟠 OVERDUE 8d]                     │
│                                     │
│ ⚠️ This goal is 8 days overdue     │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ ✅ Extension Approved!          │ │
│ │ New deadline: Oct 20, 2025      │ │ ← GREEN BOX!
│ └─────────────────────────────────┘ │
│                                     │
└─────────────────────────────────────┘
```

**Color:** 🟢 GREEN background with green border  
**Message:** Clear new deadline shown  
**Action:** Goal automatically updated with new end date

---

### **4️⃣ HR Rejects Extension** ❌

**What Employee Sees (Auto-updates via real-time sync):**
```
┌─────────────────────────────────────┐
│ Complete Training Goal              │
│ [🟠 OVERDUE 8d]                     │
│                                     │
│ ⚠️ This goal is 8 days overdue     │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ ❌ Extension Request Rejected   │ │
│ │ Reason: Project priorities      │ │ ← ORANGE BOX!
│ │    changed                       │ │
│ │                                  │ │
│ │ [Request Another Extension]     │ │ ← Can try again
│ └─────────────────────────────────┘ │
│                                     │
└─────────────────────────────────────┘
```

**Color:** 🟠 ORANGE background with orange border  
**Message:** Shows HR's rejection reason  
**Action:** Employee can request another extension with different justification

---

## 🎨 **Visual Summary:**

### **3 Distinct States:**

| State | Visual | Color | Message |
|-------|--------|-------|---------|
| **Pending** | ⏳ | Amber text | "Extension request pending manager approval" |
| **Approved** | ✅ | GREEN box | "Extension Approved! New deadline: [date]" |
| **Rejected** | ❌ | ORANGE box | "Extension Request Rejected" + reason |

---

## 📡 **Real-Time Updates:**

**Employee doesn't need to refresh!**

When HR approves/rejects:
1. ✅ Firebase updates the goal document
2. ✅ Real-time sync detects the change
3. ✅ Employee's screen updates **automatically**
4. ✅ Visual feedback appears instantly

**Technology:** Firebase real-time listeners (`onSnapshot`)

---

## 💬 **What Rejection Looks Like:**

### **Example Rejection Reasons HR Might Give:**

```
┌─────────────────────────────────────┐
│ ❌ Extension Request Rejected       │
│ Reason: Project deadline cannot be  │
│         moved. Please prioritize    │
│         this goal immediately.      │
│                                     │
│ [Request Another Extension]         │
└─────────────────────────────────────┘
```

**Or:**

```
┌─────────────────────────────────────┐
│ ❌ Extension Request Rejected       │
│ Reason: This goal has already been  │
│         extended twice. Please      │
│         complete ASAP.              │
│                                     │
│ [Request Another Extension]         │
└─────────────────────────────────────┘
```

---

## 🔄 **Can Employee Request Again?**

**YES!** ✅

If rejected, employee can:
1. Click **"Request Another Extension"**
2. Fill out a new form
3. Provide better/different justification
4. Submit for HR review again

---

## 📊 **Where Employee Sees This:**

**Location:** Performance Management → Goals Tab

**On Each Goal Card:**
- Inside the RED overdue warning box
- Below the "X days overdue" text
- Updates automatically based on HR action

---

## 🎯 **Testing the Flow:**

### **Test Scenario - Rejection:**

**Step 1 (Employee):**
- Go to Performance Management
- Find overdue goal
- Click "Request Extension"
- Fill form: New deadline + reason
- Submit

**Step 2 (HR):**
- Go to HR Performance Management
- Click "Extension Requests" tab
- See pending request
- Click "Reject"
- Enter reason: "Project timeline cannot change"
- Submit

**Step 3 (Employee - Auto!):**
- Screen updates automatically
- See ORANGE box: "❌ Extension Request Rejected"
- See reason: "Project timeline cannot change"
- See button: "Request Another Extension"

---

## ✅ **Key Features:**

1. ✅ **Instant Feedback** - Real-time sync, no refresh needed
2. ✅ **Clear Status** - Color-coded (Pending/Approved/Rejected)
3. ✅ **Transparency** - Shows HR's rejection reason
4. ✅ **Second Chance** - Can request again if rejected
5. ✅ **Professional** - Clear, respectful communication

---

## 🚀 **Status: FULLY IMPLEMENTED!**

**Employees will always know:**
- ⏳ When request is pending
- ✅ When it's approved (with new deadline)
- ❌ When it's rejected (with reason why)
- 🔄 Option to request again

**No more wondering! Complete transparency!** 🎉

---

## 📝 **Code Implementation:**

**File:** `New-hris/employee-platform/src/pages/Employee/PerformanceManagement/MeetingScheduler.tsx`

**Logic:**
```typescript
if (goal.extensionApproved === true) {
    // Show GREEN approval box
} else if (goal.extensionApproved === false) {
    // Show ORANGE rejection box + reason
} else if (goal.extensionRequested) {
    // Show AMBER pending text
} else {
    // Show "Request Extension" button
}
```

**Just refresh the page to see it working!** 🎊


