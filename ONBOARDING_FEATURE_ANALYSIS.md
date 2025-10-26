# 📋 Onboarding Feature Analysis

## ✅ **Currently IN Onboarding:**

### Step 1: Welcome
- Welcome message

### Step 2: Company Profile
- ✅ Company Name
- ✅ Display Name
- ✅ Domain (unique identifier)
- ✅ Industry
- ✅ Company Size
- ✅ Website

### Step 3: Business Details
- ✅ Street Address
- ✅ City
- ✅ Country
- ✅ Timezone
- ✅ Phone Number
- ✅ Contact Email

### Step 4: Branding
- ✅ Primary Color
- ✅ Secondary Color
- ✅ Logo Upload

### Step 5: Departments
- ✅ Department Names (multiple)

### Step 6: Leave Policies
- ✅ Leave Type Name
- ✅ Number of Days

### Step 7: Complete
- Summary & Save

---

## ❌ **What's MISSING from Onboarding:**

### 🕐 **1. Work Hours & Attendance Settings**
**Collection:** `attendanceSettings` (or in company settings)

**Why needed:** Every company has different work hours

**Fields:**
```typescript
- Expected Clock-In Time: "09:00 AM"
- Expected Clock-Out Time: "05:00 PM"
- Late Threshold: 30 minutes
- Absent Threshold: 120 minutes
- Work Days: [Monday, Tuesday, Wednesday, Thursday, Friday]
- Track Weekends: No
- Lunch Break Duration: 1 hour
```

**Example UI:**
```
Work Schedule
Configure your company's work hours

⏰ Start Time:     [09:00 AM ▼]
⏰ End Time:       [05:00 PM ▼]
☕ Lunch Break:    [1 hour ▼]

📅 Work Days:
  ☑ Monday
  ☑ Tuesday
  ☑ Wednesday
  ☑ Thursday
  ☑ Friday
  ☐ Saturday
  ☐ Sunday

⚠️ Late After:     [30] minutes
⚠️ Absent After:   [120] minutes
```

---

### 📍 **2. Office Locations (Geofencing)**
**Collection:** `officeLocations`

**Why needed:** For time tracking with location verification

**Fields:**
```typescript
- Office Name: "Lagos HQ"
- Address: "123 Victoria Island, Lagos"
- Latitude: 6.4281
- Longitude: 3.4219
- Radius: 100 meters (for geofencing)
- Is Default: Yes
```

**Example UI:**
```
Office Locations
Add your office locations for attendance tracking

Office Name:    [Lagos Headquarters         ]
Full Address:   [123 Victoria Island, Lagos ]

📍 Location (for geofencing):
  Latitude:     [6.4281    ]
  Longitude:    [3.4219    ]
  Radius:       [100] meters

+ Add Another Office Location
```

---

### 💼 **3. Job Posting Defaults**
**Collection:** Part of `company.settings`

**Why needed:** Makes it faster to create job postings later

**Fields:**
```typescript
- Default Job Location: "Lagos, Nigeria"
- Default Employment Type: "Full-time"
- Careers Page Slug: "acme" (already exists)
- Allow Public Applications: true (already exists)
```

**Example UI:**
```
Job Posting Defaults
Set defaults for your job postings

Default Location:       [Lagos, Nigeria       ]
Default Employment Type: 
  ◉ Full-time
  ○ Part-time
  ○ Contract
  ○ Internship

☑ Allow public job applications
```

---

### 💰 **4. Payroll Settings**
**Collection:** `payrollSettings` (or in company settings)

**Why needed:** Different companies pay employees differently

**Fields:**
```typescript
- Pay Frequency: "Monthly"
- Pay Day: 25th of month
- Currency: NGN (already default)
- Tax ID: Company tax number
- Payroll Email: payroll@acme.com
```

**Example UI:**
```
Payroll Configuration
Set up your payroll schedule

Pay Frequency:
  ○ Weekly
  ○ Bi-weekly
  ◉ Monthly

Pay Day:        [25th ▼] of the month

💰 Currency:    [NGN - Nigerian Naira ▼]

📧 Payroll Email: [payroll@acme.com        ]
🏦 Company Tax ID: [123456789              ]
```

---

### 📜 **5. Company Policies**
**Collection:** `policies`

**Why needed:** New employees need to acknowledge policies

**Fields:**
```typescript
- Policy Title: "Code of Conduct"
- Description: "Our company values and ethics"
- Policy Content: (Full text or PDF)
- Requires Acknowledgment: true
- Effective Date: 2025-01-01
```

**Example UI:**
```
Company Policies
Add policies that employees must acknowledge

Policy #1
Title:          [Code of Conduct                  ]
Description:    [Our company values and ethics    ]

☑ Requires employee acknowledgment

+ Add Another Policy
□ Skip - I'll add policies later
```

---

### 🎁 **6. Starter Kits (Onboarding Packages)**
**Collection:** `starterKits`

**Why needed:** Define what new employees receive on day 1

**Fields:**
```typescript
- Kit Name: "Software Engineer Kit"
- Department: "Engineering"
- Items: ["Laptop", "Mouse", "Headphones", "Monitor"]
- Notes: "Include laptop charger"
```

**Example UI:**
```
Employee Starter Kits
Define what new hires receive on their first day

Kit for: Engineering Department
Items:
  + [Laptop (MacBook Pro 16")]
  + [Mouse (Wireless)         ]
  + [Headphones               ]
  + [Monitor (27")            ]

Notes: [Include laptop charger and HDMI cable]

+ Add Kit for Another Department
□ Skip - I'll configure this later
```

---

### 🏥 **7. Benefits & Compensation**
**Collection:** Part of company settings

**Why needed:** Track what benefits your company offers

**Fields:**
```typescript
- Health Insurance: Yes/No
- Dental Coverage: Yes/No
- Life Insurance: Yes/No
- Retirement Plan (Pension): Yes/No
- Transportation Allowance: Yes/No
- Housing Allowance: Yes/No
- Meal Allowance: Yes/No
```

**Example UI:**
```
Benefits Package
What benefits does your company offer?

Insurance:
  ☑ Health Insurance
  ☑ Dental Coverage
  ☑ Life Insurance

Retirement:
  ☑ Pension Plan

Allowances (Common in Nigeria):
  ☑ Transportation Allowance
  ☑ Housing Allowance
  ☑ Meal Allowance
  ☐ Phone/Data Allowance
  ☐ Clothing Allowance
```

---

### 📊 **8. Performance Review Cycle**
**Collection:** Part of company settings

**Why needed:** Define when reviews happen

**Fields:**
```typescript
- Review Frequency: "Quarterly"
- Review Months: [March, June, September, December]
- Self-Review Enabled: true
- 360 Feedback Enabled: false
```

**Example UI:**
```
Performance Reviews
How often do you conduct performance reviews?

Review Frequency:
  ○ Monthly
  ◉ Quarterly
  ○ Semi-annually
  ○ Annually

Review Periods:
  ☑ Q1 (Jan-Mar) → Review in March
  ☑ Q2 (Apr-Jun) → Review in June
  ☑ Q3 (Jul-Sep) → Review in September
  ☑ Q4 (Oct-Dec) → Review in December

Options:
  ☑ Enable employee self-reviews
  ☐ Enable 360-degree feedback
```

---

### 🎯 **9. Probation Period**
**Collection:** Part of company settings

**Why needed:** Most companies have a probation period for new hires

**Fields:**
```typescript
- Probation Duration: 3 months
- Notice Period (During Probation): 1 week
- Notice Period (After Probation): 1 month
- Extend Probation Allowed: true
```

**Example UI:**
```
Employment Terms
Set standard employment terms

Probation Period:     [3] months

Notice Periods:
  During Probation:   [1 week  ▼]
  After Probation:    [1 month ▼]

☑ Allow probation extension if needed
```

---

## 🎯 **Recommended Onboarding Flow:**

### **Option A: Comprehensive (All Features)**
```
1. Welcome
2. Company Profile
3. Business Details
4. Work Hours & Attendance
5. Office Locations
6. Branding
7. Departments
8. Leave Policies
9. Payroll Settings
10. Benefits Package
11. Employment Terms
12. Performance Reviews
13. Company Policies (optional)
14. Starter Kits (optional)
15. Complete
```

### **Option B: Essential + Optional (Recommended)**
```
1. Welcome
2. Company Profile (Essential)
3. Business Details (Essential)
4. Work Hours & Attendance (Essential)
5. Office Location (Essential)
6. Branding (Essential)
7. Departments (Essential)
8. Leave Policies (Essential)
9. Payroll Settings (Essential)
10. Benefits & Employment Terms (Essential)
11. Optional Features:
    □ Performance Review Cycle
    □ Company Policies
    □ Starter Kits
    Can be configured later in Settings
12. Complete
```

### **Option C: Minimal + Quick Start (Fastest)**
```
1. Welcome
2. Company Essentials (Combined):
   - Company Name
   - Domain
   - Industry
   - Email
   - Timezone
3. Work Schedule:
   - Work hours
   - Work days
4. Departments (at least 1)
5. Leave Policies (at least 1)
6. Complete
   "✅ You can customize everything else later in Settings!"
```

---

## 📊 **Priority Rating:**

| Feature | Priority | Why |
|---------|----------|-----|
| **Work Hours & Attendance** | 🔴 **HIGH** | Needed for time tracking immediately |
| **Office Location** | 🔴 **HIGH** | Needed for geofenced attendance |
| **Payroll Settings** | 🟡 **MEDIUM** | Can be set later, but good to have upfront |
| **Benefits Package** | 🟡 **MEDIUM** | Helps HR track what they offer |
| **Employment Terms (Probation)** | 🟡 **MEDIUM** | Standardizes employee contracts |
| **Performance Review Cycle** | 🟢 **LOW** | Can be configured anytime |
| **Company Policies** | 🟢 **LOW** | Optional, can upload later |
| **Starter Kits** | 🟢 **LOW** | Optional, can configure later |
| **Job Posting Defaults** | 🟢 **LOW** | Saves time but not critical |

---

## 💡 **Recommendation:**

**Start with Option B (Essential + Optional)**

1. Add 2 new onboarding steps:
   - **Work Hours & Attendance** (after Business Details)
   - **Office Location** (after Work Hours)

2. Enhance existing steps:
   - **Leave Policies**: Already good! ✅
   - **Departments**: Already good! ✅

3. Add at the end:
   - **Payroll & Benefits** (combined step)
   - **Employment Terms** (probation, notice periods)

4. Add a "Skip for Now" option for:
   - Performance Review Cycle
   - Company Policies
   - Starter Kits

**Total Steps: 11 (instead of 7)**

This covers the **essential** features that companies need immediately while allowing them to skip optional features.

---

## 🚀 **Next Steps:**

Would you like me to:
1. ✅ Add **Work Hours & Attendance** step
2. ✅ Add **Office Location** step
3. ✅ Add **Payroll & Benefits** step
4. ✅ Add **Employment Terms** step

Or should we keep it minimal for now and focus on testing the current flow first?

---

**Current Onboarding:** 7 steps
**Recommended:** 11 steps (+ 4 new essential steps)
**Comprehensive:** 15 steps (+ 8 new steps including optional)










