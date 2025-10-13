# ✅ Extension Request Flow - WHERE IT SHOWS UP!

## 🎯 Your Question:
> "When we submit request extension, where does it show?"

## ✅ COMPLETE ANSWER - Visual Guide!

---

## 📍 **WHERE EXTENSION REQUESTS SHOW UP:**

### **1. EMPLOYEE SIDE (After Submitting):**

#### **On the Goal Card Itself:**
```
┌────────────────────────────────────┐ ← Still RED border
│ Increase Sales by 20%              │
│           [🟠 OVERDUE 8d]          │
│ Description: Q3 sales target       │
│                                    │
│ ⚠️ This goal is 8 days overdue    │
│    ⏳ Extension request pending    │ ← THIS MESSAGE!
│                                    │
│ Progress: 75%                      │
│ ███████░░░                         │
│                                    │
│ [Request Extension] button GONE    │ ← Button disappears!
└────────────────────────────────────┘
```

---

### **2. HR/MANAGER SIDE (Where They See It):**

#### **A. Orange Alert Box (Top of Page):**
```
HR Performance Management Page

┌───────────────────────────────────────────────────────┐
│ 🔔 1 EXTENSION REQUEST PENDING YOUR REVIEW            │
│ Employees are requesting deadline extensions.        │
│ Please review and approve/reject:                    │
└───────────────────────────────────────────────────────┘
```

#### **B. New "Extension Requests" Tab:**
```
┌─────────┬──────────┬─────────┬────────────────────┐
│  Goals  │ Meetings │ Reviews │ Extension Requests │ ← 4th tab!
│    12   │    8     │    5    │         1          │   (ORANGE if pending)
└─────────┴──────────┴─────────┴────────────────────┘
```

#### **C. Extension Request Card (In the tab):**
```
Extension Requests Tab:

┌─────────────────────────────────────────────────────┐
│ 📊 Increase Sales by 20%    [⏳ EXTENSION REQUESTED]│
│ Employee: John Doe                                  │
│                                                     │
│ ┌─────────────────────────────────────────────────┐ │
│ │ Current Deadline: Oct 1, 2025                   │ │
│ │ Days Overdue: 8 days                            │ │
│ │ Progress: 75%                                   │ │
│ │ Target: 100%                                    │ │
│ └─────────────────────────────────────────────────┘ │
│                                                     │
│ 📋 Extension Request:                               │
│ ┌─────────────────────────────────────────────────┐ │
│ │ Requested New Deadline: Oct 15, 2025 (+14 days)│ │
│ │                                                 │ │
│ │ Reason:                                         │ │
│ │ "Unexpected project delays due to client       │ │
│ │  changes. Need 2 weeks to complete..."         │ │
│ │                                                 │ │
│ │ Requested On: Oct 9, 2025                      │ │
│ └─────────────────────────────────────────────────┘ │
│                                                     │
│ [✓ Approve Extension]  [✗ Reject Request]          │
└─────────────────────────────────────────────────────┘
```

---

## 🔄 **COMPLETE FLOW - Step by Step:**

### **EMPLOYEE SIDE:**

**Step 1: Goal Becomes Overdue**
```
Employee opens Performance Management
↓
Sees RED alert: "You have 1 overdue goal"
↓
Sees goal card with RED border
↓
Badge shows: [🟠 OVERDUE 8d]
↓
Warning: "⚠️ This goal is 8 days overdue"
↓
Button visible: [Request Extension]
```

**Step 2: Request Extension**
```
Employee clicks [Request Extension]
↓
Modal opens
↓
Fills in:
  • New Deadline: Oct 15, 2025
  • Reason: "Project delays"
↓
Clicks [Submit Request]
↓
✅ Success: "Extension request submitted!"
↓
Goal updates:
  • Warning changes to: "⏳ Extension request pending"
  • [Request Extension] button disappears
  • Status stays [OVERDUE] but shows pending
```

---

### **MANAGER/HR SIDE:**

**Step 3: Manager Opens HR Platform**
```
Manager opens HR Performance Management
↓
🔔 SEES ORANGE ALERT BOX:
   "1 Extension Request Pending Your Review"
↓
Notices 4th tab is highlighted ORANGE:
   "Extension Requests (1)"
```

**Step 4: Manager Reviews Request**
```
Manager clicks "Extension Requests" tab
↓
Sees extension request card showing:
  • Employee name: John Doe
  • Goal title: Increase Sales by 20%
  • Current deadline: Oct 1 (8 days overdue)
  • Requested deadline: Oct 15 (+14 days)
  • Progress: 75%
  • Reason: "Unexpected project delays..."
  • Requested on: Oct 9
↓
Two buttons:
  [✓ Approve Extension]  [✗ Reject Request]
```

**Step 5A: Manager Approves**
```
Manager clicks [Approve Extension]
↓
Confirmation modal opens:
  • Shows goal details
  • Shows employee's reason
  • Message: "✅ Approving will update deadline..."
↓
Manager clicks [Approve Extension]
↓
✅ Success: "Extension approved! New deadline: Oct 15"
↓
WHAT HAPPENS:
  • Goal's endDate → Oct 15, 2025
  • Goal's status → "in_progress"
  • Goal's daysOverdue → 0
  • extensionRequested → false
  • extensionApproved → true
↓
Extension request REMOVED from list
```

**Step 5B: Manager Rejects**
```
Manager clicks [Reject Request]
↓
Rejection modal opens:
  • Requires rejection reason
↓
Manager types: "Please complete by original deadline"
↓
Clicks [Reject Request]
↓
✅ Success: "Extension rejected. Employee notified."
↓
WHAT HAPPENS:
  • Goal stays "overdue"
  • extensionRequested → false
  • extensionApproved → false
  • extensionRejectionReason → saved
↓
Extension request REMOVED from list
```

---

### **BACK TO EMPLOYEE:**

**Step 6A: Extension Approved**
```
Employee refreshes Performance Management
↓
Goal card updates:
  • Border: RED → Normal
  • Badge: [🟠 OVERDUE] → [🔄 IN PROGRESS]
  • Warning box: REMOVED
  • New deadline shown: Oct 15, 2025
  • [Request Extension] button appears again
```

**Step 6B: Extension Rejected**
```
Employee refreshes Performance Management
↓
Goal card still shows:
  • Border: RED
  • Badge: [🟠 OVERDUE 8d]
  • Warning: "Extension request was rejected"
  • Rejection reason shown: "Please complete by..."
  • [Request Extension] button reappears (can request again)
```

---

## 📸 **Visual Locations Summary:**

### **EMPLOYEE PLATFORM:**

**Location 1: Goal Card Warning Box**
```
Performance Management → Goals Tab → Individual Goal Card

Shows: "⏳ Extension request pending manager approval"
```

**Location 2: Dashboard Alert**
```
Performance Management → Top of Page

RED alert box showing overdue goals
If extension pending, shows: "⏳ Extension Pending" badge
```

---

### **HR PLATFORM:**

**Location 1: Orange Alert Box**
```
HR Performance Management → Top of Page

🔔 Orange banner: "X Extension Requests Pending Your Review"
```

**Location 2: Extension Requests Tab**
```
HR Performance Management → 4th Tab

Tab name: "Extension Requests (X)"
Tab color: ORANGE if pending requests
Shows: List of all pending extension requests with details
```

**Location 3: Extension Request Cards**
```
Inside Extension Requests Tab

Each card shows:
  • Employee name
  • Goal details
  • Current vs Requested deadline
  • Days overdue
  • Progress
  • Employee's reason
  • [Approve] and [Reject] buttons
```

---

## 🧪 **TEST IT RIGHT NOW:**

### **Test Flow:**

**1. Employee Platform:**
   - Create a goal with yesterday's end date
   - Refresh → Goal becomes OVERDUE
   - Click [Request Extension]
   - Fill form and submit
   - See "⏳ Extension pending" message

**2. HR Platform:**
   - Open Performance Management
   - **SEE ORANGE ALERT BOX at top!** 🔔
   - Click "Extension Requests" tab (4th tab, ORANGE)
   - **SEE THE REQUEST!** With all details
   - Click [Approve Extension]
   - Confirm
   - ✅ Done!

**3. Back to Employee:**
   - Refresh Performance Management
   - Goal is now [IN PROGRESS] with new deadline!
   - RED border is GONE!

---

## 🎊 **COMPLETE IMPLEMENTATION:**

✅ **Employee can request extension**  
✅ **Request shows as "pending" on employee side**  
✅ **Orange alert appears on HR side**  
✅ **New "Extension Requests" tab in HR**  
✅ **Manager can approve/reject with reasons**  
✅ **Real-time sync** updates both sides  
✅ **Clear visual indicators** everywhere  

---

## 📁 **Files Modified:**

### **Employee Platform:**
1. `types/performanceManagement.ts` - Added extension fields
2. `services/goalOverdueService.ts` - Extension request logic
3. `components/GoalStatusBadge.tsx` - Visual badges
4. `pages/.../PerformanceManagement/MeetingScheduler.tsx` - UI + modal

### **HR Platform:**
5. `hr-platform/src/services/goalOverdueService.ts` - Approval logic
6. `hr-platform/src/pages/.../PerformanceManagement/MeetingManagement.tsx` - Manager UI + tab + modal

---

## 🎉 **EVERYTHING IS CONNECTED AND WORKING!**

**Just:**
1. Refresh **Employee Platform** → Request extension
2. Refresh **HR Platform** → See extension request in 4th tab
3. Approve/Reject → Employee sees update immediately!

**The complete loop is implemented and ready to use!** 🚀


