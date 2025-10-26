# 💾 Onboarding Data Storage - Complete Guide

## 📊 What Gets Saved to Firebase

When a company completes onboarding, **ALL data is saved** to Firebase Firestore across multiple collections.

---

## 🗄️ Firebase Collections & Documents

### **1. Company Profile → `/companies/{companyId}` Document**

**Updated Fields:**
```json
{
  "displayName": "Acme Corporation",
  "domain": "acme",
  "address": "123 Tech Street, San Francisco, CA 94105",
  "phone": "+1-555-0100",
  "email": "hr@acme.com",
  "website": "https://acme.com",
  "primaryColor": "#3B82F6",
  "secondaryColor": "#1E40AF",
  "settings": {
    "industry": "Technology",
    "companySize": "51-200",
    "timezone": "America/Los_Angeles",
    "careersSlug": "acme",
    "allowPublicApplications": true,
    "departments": ["Engineering", "Sales", "HR"],
    "onboardingCompleted": true,
    "onboardingCompletedAt": "2025-10-10T18:45:00.000Z"
  }
}
```

---

### **2. Departments → `/departments` Collection**

**Creates N documents (one per department):**

```json
{
  "companyId": "QZDV70m6tV7VZExQlwlK",
  "name": "Engineering",
  "description": "Engineering department",
  "isActive": true,
  "createdAt": Timestamp,
  "updatedAt": Timestamp
}
```

```json
{
  "companyId": "QZDV70m6tV7VZExQlwlK",
  "name": "Sales",
  "description": "Sales department",
  "isActive": true,
  "createdAt": Timestamp,
  "updatedAt": Timestamp
}
```

```json
{
  "companyId": "QZDV70m6tV7VZExQlwlK",
  "name": "HR",
  "description": "HR department",
  "isActive": true,
  "createdAt": Timestamp,
  "updatedAt": Timestamp
}
```

---

### **3. Leave Types → `/leaveTypes` Collection**

**Creates N documents (one per leave type):**

```json
{
  "companyId": "QZDV70m6tV7VZExQlwlK",
  "name": "Annual Leave",
  "maxDays": 20,
  "description": "Annual Leave - 20 days per year",
  "accrualRate": 1.67,
  "carryForward": true,
  "requiresApproval": true,
  "color": "#3B82F6",
  "isActive": true,
  "createdAt": Timestamp,
  "updatedAt": Timestamp
}
```

```json
{
  "companyId": "QZDV70m6tV7VZExQlwlK",
  "name": "Sick Leave",
  "maxDays": 10,
  "description": "Sick Leave - 10 days per year",
  "accrualRate": 0.83,
  "carryForward": true,
  "requiresApproval": true,
  "color": "#3B82F6",
  "isActive": true,
  "createdAt": Timestamp,
  "updatedAt": Timestamp
}
```

```json
{
  "companyId": "QZDV70m6tV7VZExQlwlK",
  "name": "Personal Leave",
  "maxDays": 5,
  "description": "Personal Leave - 5 days per year",
  "accrualRate": 0.42,
  "carryForward": true,
  "requiresApproval": true,
  "color": "#3B82F6",
  "isActive": true,
  "createdAt": Timestamp,
  "updatedAt": Timestamp
}
```

---

## 🔍 Data Flow

### **When User Completes Onboarding:**

```
1. Click "Complete Setup"
   ↓
2. Save to Firebase:
   ├─ Update company document
   ├─ Create department documents (3)
   └─ Create leave type documents (3)
   ↓
3. Console logs:
   ✅ Company profile updated
   ✅ Created 3 leave types
   ✅ Created 3 department documents
   🎉 Onboarding completed successfully!
   ↓
4. Show success alert
   ↓
5. Redirect to Dashboard
```

---

## 🎯 Multi-Tenancy

**All data is tagged with `companyId`:**

- ✅ Departments filtered by company
- ✅ Leave types filtered by company
- ✅ Other companies can't see this data

---

## 📝 Console Logs

When onboarding completes, you'll see:

```
💾 Starting onboarding save process...
✅ Company profile updated with all data: {
  name: "Acme Corporation",
  domain: "acme",
  industry: "Technology",
  departments: 3,
  leaveTypes: 3
}
✅ Created 3 leave types
✅ Created 3 department documents in Firebase
🎉 Onboarding completed successfully!
📊 Summary of saved data: {...}
```

---

## 🧪 Verify Data in Firebase Console

After completing onboarding, check Firebase:

### **Companies Collection:**
```
companies/
  └─ QZDV70m6tV7VZExQlwlK/
      ├─ displayName: "Acme Corporation"
      ├─ domain: "acme"
      ├─ address: "..."
      ├─ email: "hr@acme.com"
      ├─ primaryColor: "#3B82F6"
      └─ settings:
          ├─ industry: "Technology"
          ├─ onboardingCompleted: true
          └─ departments: ["Engineering", "Sales", "HR"]
```

### **Departments Collection:**
```
departments/
  ├─ doc1: { companyId: "QZDV70m6tV7VZExQlwlK", name: "Engineering" }
  ├─ doc2: { companyId: "QZDV70m6tV7VZExQlwlK", name: "Sales" }
  └─ doc3: { companyId: "QZDV70m6tV7VZExQlwlK", name: "HR" }
```

### **Leave Types Collection:**
```
leaveTypes/
  ├─ doc1: { companyId: "QZDV70m6tV7VZExQlwlK", name: "Annual Leave", maxDays: 20 }
  ├─ doc2: { companyId: "QZDV70m6tV7VZExQlwlK", name: "Sick Leave", maxDays: 10 }
  └─ doc3: { companyId: "QZDV70m6tV7VZExQlwlK", name: "Personal Leave", maxDays: 5 }
```

---

## ✅ Data Validation

Before saving, the system ensures:

- ✅ Empty departments are filtered out
- ✅ Only leave types with name AND days > 0 are created
- ✅ All data tagged with correct `companyId`
- ✅ Timestamps added automatically
- ✅ Company settings include all onboarding flags

---

## 🚀 After Data Is Saved

Once saved to Firebase:

1. **Leave Management** can access leave types
2. **Employee Management** can use departments
3. **Company switcher** shows updated company info
4. **Careers page** reflects branding colors
5. **Multi-tenancy** ensures data isolation

---

## 🎨 Complete Data Structure

```typescript
// Company Document
{
  id: "QZDV70m6tV7VZExQlwlK",
  displayName: "Acme Corporation",
  domain: "acme",
  address: "123 Tech Street, San Francisco, CA 94105",
  email: "hr@acme.com",
  phone: "+1-555-0100",
  website: "https://acme.com",
  primaryColor: "#3B82F6",
  secondaryColor: "#1E40AF",
  settings: {
    industry: "Technology",
    companySize: "51-200",
    timezone: "America/Los_Angeles",
    careersSlug: "acme",
    allowPublicApplications: true,
    departments: ["Engineering", "Sales", "HR"],
    onboardingCompleted: true,
    onboardingCompletedAt: "2025-10-10T18:45:00.000Z"
  },
  plan: "premium",
  status: "active",
  createdAt: Timestamp,
  updatedAt: Timestamp
}

// Department Document (x3)
{
  companyId: "QZDV70m6tV7VZExQlwlK",
  name: "Engineering",
  description: "Engineering department",
  isActive: true,
  createdAt: Timestamp,
  updatedAt: Timestamp
}

// Leave Type Document (x3)
{
  companyId: "QZDV70m6tV7VZExQlwlK",
  name: "Annual Leave",
  maxDays: 20,
  description: "Annual Leave - 20 days per year",
  accrualRate: 1.67,
  carryForward: true,
  requiresApproval: true,
  color: "#3B82F6",
  isActive: true,
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

---

## 💡 Testing

1. Go to Company Setup
2. Click "Test Onboarding Again"
3. Complete all 7 steps
4. Watch console logs for save confirmation
5. Check Firebase Console for new data
6. Verify multi-tenancy (data tagged with companyId)

---

**All onboarding data is permanently saved to Firebase!** 🎉











