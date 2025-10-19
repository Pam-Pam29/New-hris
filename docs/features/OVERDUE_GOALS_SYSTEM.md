# ⏰ What Happens When Goals Aren't Completed on Time

## 📋 Current System Behavior

### **Goal Status Types:**
Currently, performance goals can have these statuses:
- ✅ `not_started` - Goal created but work hasn't begun
- 🔄 `in_progress` - Actively working on the goal
- ✅ `completed` - Goal achieved (100% progress)
- ❌ `cancelled` - Goal was abandoned/no longer relevant
- ⏰ `overdue` - **Planned but not implemented yet**

---

## 🎯 Proposed: What SHOULD Happen

### **1. Automatic Overdue Detection**

**When a goal's end date passes and it's not completed:**

#### **Visual Indicators:**
```
┌────────────────────────────────────────┐
│ 📊 Goal: Increase Sales by 20%        │
│                                        │
│ Status: ⏰ OVERDUE                     │ ← Red badge
│ Progress: 75% (15/20)                  │
│ Due: Oct 1, 2025 (8 days ago)         │ ← Red text
│                                        │
│ ⚠️ This goal is past its deadline     │
└────────────────────────────────────────┘
```

#### **Dashboard Alerts:**
```
┌────────────────────────────────────────┐
│ 🔔 Notifications                       │
├────────────────────────────────────────┤
│ ⏰ OVERDUE GOAL                        │
│ "Increase Sales by 20%" is 8 days     │
│ overdue and only 75% complete.         │
│                                        │
│ [Review Goal] [Request Extension]     │
└────────────────────────────────────────┘
```

---

### **2. Automated Actions**

#### **For Employees:**

**Day of Deadline:**
```
📧 Email Notification:
"Your goal 'Increase Sales by 20%' is due today. 
Current progress: 75%"

📱 In-App Alert:
"⏰ Goal deadline today - Review your progress"
```

**1 Day After Deadline:**
```
🔴 Status Change: in_progress → overdue
📊 Dashboard: Goal card highlighted in red
📧 Email: "Goal is now overdue - Contact your manager"
```

**3 Days After:**
```
📧 Reminder Email to Employee
📧 Notification to Manager
📊 Goal appears in "Overdue Goals" section
```

**7 Days After:**
```
📧 Escalation Email to HR
📋 Automatic review meeting scheduled
🔔 "Please schedule review meeting" notification
```

#### **For Managers/HR:**

**Automatic Notifications:**
```
Day 1 After: Email notification
Day 3 After: Dashboard alert
Day 7 After: Escalation notice
Day 14 After: Performance review flag
```

---

### **3. Employee Options When Overdue**

**Option A: Request Extension**
```
┌────────────────────────────────────────┐
│ Request Deadline Extension             │
├────────────────────────────────────────┤
│ Current Deadline: Oct 1, 2025          │
│ Current Progress: 75%                  │
│                                        │
│ New Deadline: [Oct 15, 2025____]      │
│                                        │
│ Reason:                                │
│ [Unexpected delays due to...]          │
│                                        │
│ [Submit Request]                       │
└────────────────────────────────────────┘
```

**Option B: Mark as Partially Completed**
```
┌────────────────────────────────────────┐
│ Close Goal                             │
├────────────────────────────────────────┤
│ Final Progress: 75%                    │
│ Reason for not reaching 100%:          │
│ [Market conditions changed...]         │
│                                        │
│ Achievements:                          │
│ [What was accomplished...]             │
│                                        │
│ [Close Goal]                           │
└────────────────────────────────────────┘
```

**Option C: Continue Working**
```
┌────────────────────────────────────────┐
│ Continue Working on Overdue Goal       │
├────────────────────────────────────────┤
│ This goal will remain marked as        │
│ "overdue" until completed.             │
│                                        │
│ Manager has been notified.             │
│                                        │
│ Update your progress regularly.        │
│                                        │
│ [Continue] [Request Extension]         │
└────────────────────────────────────────┘
```

---

### **4. Manager/HR Actions**

**Manager Dashboard:**
```
┌────────────────────────────────────────┐
│ 📊 Team Overdue Goals                  │
├────────────────────────────────────────┤
│ John Doe                               │
│ • "Increase Sales" - 8 days overdue    │
│   Progress: 75%                        │
│   [Review] [Extend] [Close]            │
│                                        │
│ Jane Smith                             │
│ • "Complete Training" - 3 days overdue │
│   Progress: 90%                        │
│   [Review] [Extend] [Close]            │
└────────────────────────────────────────┘
```

**HR Dashboard:**
```
┌────────────────────────────────────────┐
│ ⚠️ Department Performance Alerts       │
├────────────────────────────────────────┤
│ Sales Department                       │
│ • 5 goals overdue (3 critical)         │
│ • Average delay: 6 days                │
│                                        │
│ Engineering                            │
│ • 2 goals overdue (1 critical)         │
│ • Average delay: 4 days                │
│                                        │
│ [View Report] [Schedule Reviews]       │
└────────────────────────────────────────┘
```

---

### **5. Consequences System**

**Severity Levels:**

#### **🟡 Minor (1-7 days overdue):**
- Yellow "Overdue" badge
- Email reminder to employee
- Notification to manager
- No immediate impact on performance rating

#### **🟠 Moderate (8-14 days overdue):**
- Orange "Overdue" badge
- Daily reminders
- Manager required to review
- May impact quarterly performance review
- Requires explanation in next 1-on-1

#### **🔴 Critical (15+ days overdue):**
- Red "Critically Overdue" badge
- HR notification
- Mandatory review meeting scheduled
- Automatically flagged in performance review
- May trigger Performance Improvement Plan (PIP)
- Manager must provide written explanation

---

### **6. Performance Review Impact**

**Goal Completion Metrics:**
```
┌────────────────────────────────────────┐
│ 📊 Performance Summary - Q4 2025       │
├────────────────────────────────────────┤
│ Goals Set: 8                           │
│ Goals Completed: 5 (62.5%)             │
│ Goals Overdue: 2                       │
│ Goals Cancelled: 1                     │
│                                        │
│ Average Completion Rate: 78%           │
│ On-Time Completion: 4/5 (80%)          │
│                                        │
│ ⚠️ Impact on Rating:                   │
│ 2 overdue goals → -0.5 rating points   │
└────────────────────────────────────────┘
```

**Rating Calculation:**
```
Base Rating: 4.0/5.0

Adjustments:
+ Completed 5 goals: +0.5
- 2 goals overdue: -0.5
+ High quality work: +0.3

Final Rating: 4.3/5.0
```

---

### **7. Reporting & Analytics**

**Employee View:**
```
┌────────────────────────────────────────┐
│ 📈 My Goal Performance                 │
├────────────────────────────────────────┤
│ This Quarter:                          │
│ • Completed on time: 80%               │
│ • Average delay: 3 days                │
│ • Completion rate: 75%                 │
│                                        │
│ Trend:                                 │
│ • Last quarter: 85% on-time            │
│ • Improvement needed: -5%              │
└────────────────────────────────────────┘
```

**Manager View:**
```
┌────────────────────────────────────────┐
│ 📊 Team Goal Performance               │
├────────────────────────────────────────┤
│ Active Goals: 24                       │
│ On Track: 18 (75%)                     │
│ At Risk: 4 (due within 7 days)         │
│ Overdue: 2 (8%)                        │
│                                        │
│ Team Performance: 89%                  │
│ Department Average: 85%                │
└────────────────────────────────────────┘
```

---

## 🔧 Implementation Recommendations

### **Phase 1: Basic Overdue Detection**
1. Add automatic daily check for overdue goals
2. Update goal status to "overdue" when past end date
3. Show red badge on overdue goals
4. Send email notification to employee

### **Phase 2: Manager Notifications**
1. Notify managers of overdue team goals
2. Add "Overdue Goals" section to manager dashboard
3. Enable manager actions (extend, close, review)

### **Phase 3: HR Analytics**
1. Add HR dashboard with overdue metrics
2. Generate weekly overdue reports
3. Flag employees with multiple overdue goals
4. Track trends over time

### **Phase 4: Advanced Features**
1. Extension request workflow
2. Automatic review meeting scheduling
3. Performance impact calculations
4. Predictive alerts for at-risk goals

---

## 💡 Best Practices

### **For Employees:**
✅ **Set realistic deadlines** when creating goals  
✅ **Update progress regularly** (weekly minimum)  
✅ **Request extensions early** if needed  
✅ **Communicate delays** to manager proactively  
✅ **Document challenges** and blockers  

### **For Managers:**
✅ **Review team goals weekly**  
✅ **Check in on at-risk goals** early  
✅ **Approve extensions reasonably**  
✅ **Provide support** for blocked goals  
✅ **Adjust unrealistic deadlines** promptly  

### **For HR:**
✅ **Monitor overdue trends** across departments  
✅ **Identify systemic issues** (too aggressive timelines)  
✅ **Provide goal-setting training**  
✅ **Review performance impact** fairly  
✅ **Support struggling employees** proactively  

---

## 🎯 Goal Lifecycle

```
Goal Created
    ↓
Not Started → In Progress
    ↓
    ↓ (End Date Passes)
    ↓
    ├─→ Completed (100% progress) ✅
    ├─→ Overdue (< 100% progress) ⏰
    │     ↓
    │     ├─→ Extension Requested
    │     ├─→ Continue Working
    │     └─→ Close as Partial
    └─→ Cancelled (No longer relevant) ❌
```

---

## 📊 Proposed UI Changes

### **Goals List - With Overdue Indicators:**
```
Active Goals:
┌────────────────────────────────────────┐
│ ✅ Complete Training Program           │
│ Progress: 100% | Due: Sep 15           │
│ Status: COMPLETED                      │
└────────────────────────────────────────┘

┌────────────────────────────────────────┐
│ 🔄 Improve Customer Satisfaction       │
│ Progress: 65% | Due: Oct 20 (10 days)  │
│ Status: ON TRACK                       │
└────────────────────────────────────────┘

┌────────────────────────────────────────┐
│ ⏰ Increase Sales by 20%               │ ← Red border
│ Progress: 75% | Due: Oct 1 (8 days ago)│
│ Status: OVERDUE                        │
│ [Request Extension] [Review]           │
└────────────────────────────────────────┘
```

---

## 🎊 Summary

**Currently:** Goals don't automatically become "overdue" - they just stay as "in progress"

**Proposed:**
- ✅ Automatic overdue detection
- ✅ Visual red indicators
- ✅ Email notifications
- ✅ Manager alerts
- ✅ Extension request option
- ✅ Performance review impact
- ✅ HR analytics dashboard
- ✅ Escalation system

**Would you like me to implement the overdue goal detection system?** I can add:
1. Automatic status updates when deadlines pass
2. Visual indicators (red badges)
3. Email notifications
4. Manager dashboard alerts
5. Extension request workflow

Let me know what features you'd like prioritized! 🚀


