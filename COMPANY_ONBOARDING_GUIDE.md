# 🎯 Company Onboarding System

## Overview

New companies must complete a **7-step onboarding wizard** before accessing the HR platform. This ensures proper setup and configuration.

---

## 🚀 How It Works

### **Automatic Redirect:**
- When a company **hasn't completed onboarding**, they're automatically redirected to `/onboarding`
- All protected routes check `company.settings.onboardingCompleted`
- No access to HR features until onboarding is done

---

## 📋 Onboarding Steps

### **Step 1: Welcome** ✨
- Introduction to the platform
- Quick overview of setup time (~5 minutes)
- Benefits highlighted

### **Step 2: Company Profile** 🏢
**Required Fields:**
- Company Name (e.g., "Acme Corporation")
- Company Domain (e.g., "acme" for careers page)
- Industry (dropdown)
- Company Size (dropdown)
- Website (optional)

### **Step 3: Business Details** 📍
**Required Fields:**
- Street Address
- City
- Country
- Timezone (dropdown)
- Contact Email

**Optional:**
- Phone Number

### **Step 4: Branding** 🎨
**Customization:**
- Primary Color (color picker + hex input)
- Secondary Color (color picker + hex input)
- Live preview of buttons
- Logo URL (optional, can upload later)

### **Step 5: Departments** 👥
**Setup:**
- Add/remove departments
- Default: Engineering, Sales, HR
- Can add more or customize

### **Step 6: Leave Policies** 📅
**Configure:**
- Leave type names
- Number of days per type
- Default: Annual (20), Sick (10), Personal (5)
- Add/remove types

### **Step 7: Complete** ✅
**Review:**
- Summary of all settings
- Confirm and save
- Redirects to Dashboard

---

## 🧪 Testing the Onboarding Flow

### **Method 1: Reset Existing Company**
1. Go to **Settings → Company Setup**
2. Scroll to **"Test Onboarding Flow"**
3. Click **"Reset Onboarding (Test)"**
4. Confirm the dialog
5. You'll be redirected to `/onboarding`

### **Method 2: Create New Company**
1. Create a new company (without `onboardingCompleted` flag)
2. Switch to that company
3. Automatic redirect to onboarding

---

## 🔒 Protected Routes

All routes require onboarding completion:
- ✅ Dashboard
- ✅ Employee Management
- ✅ Leave Management
- ✅ Recruitment
- ✅ Job Board
- ✅ Payroll
- ✅ Settings
- ✅ All other HR modules

**Exception:** `/onboarding` route (public access)

---

## 💾 Data Storage

When onboarding is completed:

```typescript
{
  settings: {
    ...existingSettings,
    onboardingCompleted: true,
    onboardingCompletedAt: "2025-10-10T18:45:00.000Z"
  }
}
```

Saved to Firebase company document.

---

## 🎨 UI Features

### **Progress Indicator:**
- 7 steps shown at top
- Current step highlighted in blue
- Completed steps shown in green
- Connected progress line

### **Navigation:**
- "Back" button (disabled on step 1)
- "Continue" button (disabled if required fields empty)
- "Complete Setup" on final step

### **Validation:**
- Step 2: Requires name, domain, industry, size
- Step 3: Requires address, city, country, email
- Domain auto-formats (lowercase, alphanumeric only)

### **Visual Design:**
- Gradient backgrounds
- Color-coded step headers
- Icons for each step
- Responsive layout
- Loading states

---

## 🔄 Onboarding Status Check

The `ProtectedRoute` component checks:

```typescript
const onboardingCompleted = company?.settings?.onboardingCompleted;

if (!onboardingCompleted) {
  return <Navigate to="/onboarding" replace />;
}
```

**Loading State:**
- Shows spinner while company data loads
- Prevents flash of wrong content

---

## 📊 What Gets Created

After completing onboarding:

### **Company Record Updated:**
- Display name
- Domain/slug
- Contact info
- Branding colors
- Timezone & industry
- Onboarding timestamp

### **Ready for Use:**
- All HR modules unlocked
- Can add employees
- Can post jobs
- Can configure policies
- Multi-tenancy active

---

## 🎯 Testing Checklist

- [ ] Reset onboarding for Acme
- [ ] Complete all 7 steps
- [ ] Verify data saved
- [ ] Check redirect to dashboard
- [ ] Verify can't access protected routes before completion
- [ ] Test with multiple companies
- [ ] Verify branding preview works
- [ ] Test validation on required fields
- [ ] Test back/next navigation

---

## 🚀 Next Steps After Onboarding

Once onboarded, companies can:
1. Add employees
2. Create departments
3. Set up leave types (from onboarding defaults)
4. Post jobs to careers page
5. Configure policies
6. Start recruitment

---

## 💡 Tips

**For Testing:**
- Use "Reset Onboarding" button in Company Setup
- Each company can have different onboarding status
- Onboarding data persists in Firebase

**For Production:**
- New companies start with `onboardingCompleted: false`
- Must complete wizard before using platform
- Can't bypass using direct URLs (protected routes)

---

## 🔗 Routes

- **Onboarding:** `http://localhost:3003/onboarding`
- **Company Setup (to reset):** `http://localhost:3003/hr/settings/company-setup`
- **Dashboard (after completion):** `http://localhost:3003/dashboard`

---

**Onboarding system is now live!** 🎉




