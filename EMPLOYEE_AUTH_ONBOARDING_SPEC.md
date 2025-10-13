# 🔐 Employee Authentication & Onboarding Specification

## 📊 **Complete Employee Journey**

---

## **JOURNEY 1: New Employee (First Time)**

```
HR adds employee in HR Platform
        ↓
System generates employee ID: ACM001
System sends email: "Welcome to Acme Corporation!"
        ↓
Employee clicks email link
        ↓
STEP 1: Password Setup Page
- Enter Email: sarah@acme.com
- Create Password: ********
- Confirm Password: ********
- Click "Create Account"
        ↓
STEP 2: Employee Onboarding Wizard (7 pages)
1. Welcome to Acme Corporation
2. Complete Personal Information
3. Add Contact Details & Emergency Contact
4. Upload Documents (ID, certificates, etc.)
5. Banking Information (for payroll)
6. Review Company Policies (acknowledge)
7. Complete - Welcome to the team!
        ↓
STEP 3: Employee Dashboard
- Logged in automatically
- Sees personalized dashboard
- Can request leave, view payroll, etc.
```

---

## **JOURNEY 2: Returning Employee**

```
Employee goes to: http://localhost:3002
        ↓
STEP 1: Login Page
- Enter Email: sarah@acme.com
- Enter Password: ********
- Click "Login"
        ↓
System checks:
✓ Email exists in database?
✓ Password correct?
✓ Employee status = active?
✓ Onboarding completed?
        ↓
If onboarding NOT complete:
    → Redirect to Onboarding Wizard (resume where left off)
        ↓
If onboarding complete:
    → Redirect to Dashboard
        ↓
STEP 2: Employee Dashboard
- Logged in
- Session stored
- Can use all features
```

---

## 🗄️ **Firebase Data Structure**

### **Collection: `employees`**

```typescript
{
  id: "ACM001",  // Auto-generated employee ID
  companyId: "o4uIIHQJq18x5sEn87XD",
  
  // Basic Info (from HR)
  personalInfo: {
    firstName: "Sarah",
    lastName: "Johnson",
    dateOfBirth: Timestamp,
  },
  
  contactInfo: {
    workEmail: "sarah@acme.com",
    personalEmail: "",  // Employee adds during onboarding
    personalPhone: "",  // Employee adds during onboarding
    workPhone: "",
    address: {
      street: "",
      city: "",
      state: "",
      zipCode: "",
      country: ""
    },
    emergencyContacts: []  // Employee adds during onboarding
  },
  
  workInfo: {
    position: "HR Manager",
    department: "Human Resources",
    hireDate: Timestamp,
    employmentType: "Full-time",
    workLocation: "Office",
    salary: {
      baseSalary: 5400000,
      currency: "NGN",
      payFrequency: "Monthly"
    }
  },
  
  bankingInfo: {  // Employee adds during onboarding
    bankName: "",
    accountNumber: "",
    accountType: "",
    routingNumber: ""
  },
  
  // Authentication
  auth: {
    email: "sarah@acme.com",
    passwordHash: "hashed_password_here",  // bcrypt hash
    passwordSetAt: Timestamp,
    lastLogin: Timestamp,
    loginCount: 0,
    isActive: true,
    emailVerified: false,
    verificationToken: "abc123xyz",
    tokenExpiry: Timestamp
  },
  
  // Onboarding Status
  onboarding: {
    status: "not_started" | "in_progress" | "completed",
    currentStep: 0,  // 0-7
    completedSteps: [1, 2],  // Which steps completed
    startedAt: Timestamp,
    completedAt: Timestamp,
    lastUpdated: Timestamp
  },
  
  // Profile Status
  profileStatus: {
    completeness: 75,  // Percentage
    lastUpdated: Timestamp,
    updatedBy: "self" | "hr",
    status: "active"
  },
  
  // Documents uploaded during onboarding
  documents: [
    {
      id: "doc-001",
      type: "national_id",
      name: "National ID.pdf",
      url: "https://storage.../national_id.pdf",
      uploadedAt: Timestamp,
      uploadedBy: "ACM001"
    }
  ],
  
  // Policy Acknowledgments
  policyAcknowledgments: [
    {
      policyId: "policy-001",
      policyName: "Code of Conduct",
      acknowledgedAt: Timestamp,
      version: "1.0"
    }
  ],
  
  createdAt: Timestamp,
  updatedAt: Timestamp,
  createdBy: "HR"
}
```

---

## 🔐 **Authentication Implementation**

### **1. Password Setup (New Employee)**

**File:** `PasswordSetup.tsx`

**URL:** `http://localhost:3002/setup?token=abc123xyz`

**Flow:**
1. HR creates employee
2. System generates verification token
3. Email sent with link: `/setup?token=abc123xyz`
4. Employee opens link
5. Token validated (not expired, employee exists)
6. Employee sets password
7. Password hashed and saved
8. Redirect to onboarding

**Form Fields:**
```typescript
- Email (readonly, from token)
- New Password (min 8 chars, 1 uppercase, 1 number)
- Confirm Password
- Terms & Conditions checkbox
```

---

### **2. Login Page (Returning Employee)**

**File:** `LoginPage.tsx`

**URL:** `http://localhost:3002/login` or `http://localhost:3002`

**Flow:**
1. Employee enters email + password
2. System validates credentials
3. Check onboarding status
4. If not complete → Redirect to `/onboarding`
5. If complete → Redirect to `/dashboard`
6. Store session (localStorage + context)

**Form Fields:**
```typescript
- Email
- Password
- Remember Me (checkbox)
- Forgot Password? (link)
```

**Session Storage:**
```typescript
localStorage.setItem('employeeSession', JSON.stringify({
  employeeId: 'ACM001',
  email: 'sarah@acme.com',
  companyId: 'o4uIIHQJq18x5sEn87XD',
  loginTime: new Date(),
  expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
}));
```

---

### **3. Employee Onboarding Wizard**

**File:** `OnboardingWizard.tsx`

**URL:** `http://localhost:3002/onboarding`

**7 Steps:**

#### **Step 1: Welcome**
```
Welcome to Acme Corporation, Sarah!

Before you start, we need to collect some information.

This will take about 10 minutes.

[Get Started]
```

#### **Step 2: Personal Information**
```
Complete Your Personal Information

First Name: [Sarah] (readonly)
Last Name: [Johnson] (readonly)
Middle Name: [         ]
Date of Birth: [1988-05-15]
Gender: [Female ▼]
Marital Status: [Single ▼]
Nationality: [Nigerian ▼]
National ID: [12345678901]
Passport Number: [N12345678] (optional)

[Back] [Continue]
```

#### **Step 3: Contact Information**
```
Contact Details

Personal Email: [sarah.personal@gmail.com]
Personal Phone: [+234 803 200 1001]

Home Address:
Street: [123 Residential Street]
City: [Lagos]
State: [Lagos State]
Postal Code: [100001]
Country: [Nigeria ▼]

Emergency Contact:
Name: [Jane Johnson]
Relationship: [Sister ▼]
Phone: [+234 803 200 1002]
Email: [jane@email.com]

[Back] [Continue]
```

#### **Step 4: Upload Documents**
```
Upload Required Documents

National ID *
[📁 Drop file here or click to upload]
✅ National_ID.pdf uploaded

Professional Certificates (optional)
[📁 Drop files here or click to upload]

Resume/CV (optional)
[📁 Drop file here or click to upload]

[Back] [Continue]
```

#### **Step 5: Banking Information**
```
Banking Information (for Payroll)

Bank Name: [First Bank of Nigeria ▼]
Account Number: [1234567890]
Account Type: [Savings ▼]
Account Holder Name: [Sarah Johnson]

[Back] [Continue]
```

#### **Step 6: Company Policies**
```
Review Company Policies

Please read and acknowledge these policies:

☐ Code of Conduct
  [View Policy] [Download PDF]
  
☐ Data Protection & Privacy Policy
  [View Policy] [Download PDF]
  
☐ Leave & Attendance Policy
  [View Policy] [Download PDF]
  
☐ Health & Safety Policy
  [View Policy] [Download PDF]

[Back] [Complete Onboarding]
```

#### **Step 7: Complete**
```
🎉 Welcome to the Team!

Your profile is complete!

Next Steps:
✅ Explore your dashboard
✅ Set up your first goal
✅ Review your leave balance
✅ Meet your team

[Go to Dashboard]
```

---

## 🔒 **Auth Context (Global State)**

**File:** `context/AuthContext.tsx`

```typescript
interface AuthContextType {
  isAuthenticated: boolean;
  currentEmployee: {
    id: string;
    email: string;
    companyId: string;
    firstName: string;
    lastName: string;
    role: string;
    department: string;
  } | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  loading: boolean;
}

export const AuthProvider = ({ children }) => {
  const [currentEmployee, setCurrentEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // Check for existing session on mount
    const session = localStorage.getItem('employeeSession');
    if (session) {
      const sessionData = JSON.parse(session);
      
      // Check if session expired
      if (new Date(sessionData.expiresAt) > new Date()) {
        loadEmployeeData(sessionData.employeeId);
      } else {
        logout();
      }
    }
    setLoading(false);
  }, []);
  
  const login = async (email, password) => {
    // Validate credentials
    const employee = await validateLogin(email, password);
    if (employee) {
      setCurrentEmployee(employee);
      localStorage.setItem('employeeSession', JSON.stringify({
        employeeId: employee.id,
        email: employee.email,
        companyId: employee.companyId,
        loginTime: new Date(),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
      }));
      return true;
    }
    return false;
  };
  
  const logout = () => {
    setCurrentEmployee(null);
    localStorage.removeItem('employeeSession');
    localStorage.removeItem('currentEmployeeId');
    localStorage.removeItem('employeeCompanyId');
  };
  
  return (
    <AuthContext.Provider value={{ isAuthenticated: !!currentEmployee, currentEmployee, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
```

---

## 🛡️ **Protected Routes**

**File:** `App.tsx` (updated)

```typescript
// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading, currentEmployee } = useAuth();
  
  if (loading) {
    return <LoadingSpinner />;
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  // Check if onboarding completed
  if (currentEmployee.onboarding.status !== 'completed') {
    return <Navigate to="/onboarding" replace />;
  }
  
  return <>{children}</>;
};

// Updated Routes
<Routes>
  {/* Public Routes */}
  <Route path="/login" element={<LoginPage />} />
  <Route path="/setup" element={<PasswordSetup />} />
  
  {/* Onboarding (requires auth but not completion) */}
  <Route path="/onboarding" element={
    <RequireAuth>
      <OnboardingWizard />
    </RequireAuth>
  } />
  
  {/* Protected Routes (requires auth + onboarding complete) */}
  <Route path="/" element={
    <ProtectedRoute>
      <EmployeeLayout>
        <Dashboard />
      </EmployeeLayout>
    </ProtectedRoute>
  } />
  
  <Route path="/dashboard" element={<ProtectedRoute>...</ProtectedRoute>} />
  <Route path="/profile" element={<ProtectedRoute>...</ProtectedRoute>} />
  {/* ... all other routes ... */}
</Routes>
```

---

## 🎨 **UI/UX Design**

### **Login Page Design:**

```
┌────────────────────────────────────────────────┐
│                                                 │
│         🏢 Acme Corporation                    │
│         Employee Portal                         │
│                                                 │
│    ┌──────────────────────────────────┐       │
│    │  Login to Your Account           │       │
│    │                                  │       │
│    │  Email                           │       │
│    │  [sarah@acme.com           ]    │       │
│    │                                  │       │
│    │  Password                        │       │
│    │  [********************  ] 👁️   │       │
│    │                                  │       │
│    │  ☐ Remember me for 30 days      │       │
│    │                                  │       │
│    │  [Login →]                      │       │
│    │                                  │       │
│    │  Forgot password? Reset here    │       │
│    └──────────────────────────────────┘       │
│                                                 │
│    First time? Check your email for setup      │
│    link sent by HR                             │
└────────────────────────────────────────────────┘
```

### **Password Setup Design:**

```
┌────────────────────────────────────────────────┐
│                                                 │
│    Welcome to Acme Corporation!                │
│    Set Up Your Account                         │
│                                                 │
│    ┌──────────────────────────────────┐       │
│    │  Your Email                      │       │
│    │  sarah@acme.com (verified)      │       │
│    │                                  │       │
│    │  Create Password *               │       │
│    │  [********************  ] 👁️   │       │
│    │  Must be at least 8 characters   │       │
│    │                                  │       │
│    │  Confirm Password *              │       │
│    │  [********************  ] 👁️   │       │
│    │                                  │       │
│    │  Password Strength: Strong 💪   │       │
│    │  ▓▓▓▓▓▓▓▓░░ 80%                │       │
│    │                                  │       │
│    │  ☐ I agree to Terms & Conditions│       │
│    │                                  │       │
│    │  [Create Account & Continue →] │       │
│    └──────────────────────────────────┘       │
└────────────────────────────────────────────────┘
```

---

## 🔧 **Technical Implementation**

### **1. Authentication Service**

**File:** `services/authService.ts`

```typescript
import { getFirebaseDb } from '../config/firebase';
import { doc, getDoc, updateDoc, collection, query, where, getDocs } from 'firebase/firestore';
import bcrypt from 'bcryptjs'; // For password hashing

export class AuthService {
  private db = getFirebaseDb();
  
  // Validate login credentials
  async login(email: string, password: string): Promise<{
    success: boolean;
    employee?: any;
    error?: string;
  }> {
    try {
      // Find employee by email
      const employeesRef = collection(this.db, 'employees');
      const q = query(employeesRef, where('contactInfo.workEmail', '==', email));
      const snapshot = await getDocs(q);
      
      if (snapshot.empty) {
        return { success: false, error: 'Email not found' };
      }
      
      const employeeDoc = snapshot.docs[0];
      const employeeData = employeeDoc.data();
      
      // Check if password set
      if (!employeeData.auth?.passwordHash) {
        return { success: false, error: 'Please set up your password first' };
      }
      
      // Verify password
      const passwordMatch = await bcrypt.compare(password, employeeData.auth.passwordHash);
      
      if (!passwordMatch) {
        return { success: false, error: 'Incorrect password' };
      }
      
      // Check if account active
      if (employeeData.auth?.isActive === false) {
        return { success: false, error: 'Account is inactive. Contact HR.' };
      }
      
      // Update last login
      await updateDoc(doc(this.db, 'employees', employeeDoc.id), {
        'auth.lastLogin': new Date(),
        'auth.loginCount': (employeeData.auth?.loginCount || 0) + 1
      });
      
      return {
        success: true,
        employee: {
          id: employeeDoc.id,
          employeeId: employeeData.employeeId,
          email: email,
          companyId: employeeData.companyId,
          firstName: employeeData.personalInfo?.firstName,
          lastName: employeeData.personalInfo?.lastName,
          role: employeeData.workInfo?.position,
          department: employeeData.workInfo?.department,
          onboarding: employeeData.onboarding || { status: 'not_started' }
        }
      };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'Login failed. Please try again.' };
    }
  }
  
  // Set up password for new employee
  async setupPassword(token: string, password: string): Promise<{
    success: boolean;
    employeeId?: string;
    error?: string;
  }> {
    try {
      // Find employee by verification token
      const employeesRef = collection(this.db, 'employees');
      const q = query(employeesRef, where('auth.verificationToken', '==', token));
      const snapshot = await getDocs(q);
      
      if (snapshot.empty) {
        return { success: false, error: 'Invalid or expired link' };
      }
      
      const employeeDoc = snapshot.docs[0];
      const employeeData = employeeDoc.data();
      
      // Check token expiry
      if (employeeData.auth?.tokenExpiry && new Date(employeeData.auth.tokenExpiry.toDate()) < new Date()) {
        return { success: false, error: 'Link has expired. Contact HR.' };
      }
      
      // Hash password
      const passwordHash = await bcrypt.hash(password, 10);
      
      // Save password and mark as active
      await updateDoc(doc(this.db, 'employees', employeeDoc.id), {
        'auth.passwordHash': passwordHash,
        'auth.passwordSetAt': new Date(),
        'auth.isActive': true,
        'auth.emailVerified': true,
        'auth.verificationToken': null, // Clear token
        'auth.tokenExpiry': null
      });
      
      return {
        success: true,
        employeeId: employeeDoc.id
      };
    } catch (error) {
      console.error('Password setup error:', error);
      return { success: false, error: 'Failed to set password. Please try again.' };
    }
  }
  
  // Validate session
  isSessionValid(session: any): boolean {
    if (!session) return false;
    
    const expiresAt = new Date(session.expiresAt);
    return expiresAt > new Date();
  }
}

export const authService = new AuthService();
```

---

## 📝 **Onboarding Wizard Data Collection**

**File:** `OnboardingWizard.tsx`

```typescript
interface OnboardingData {
  // Step 2: Personal Info
  middleName: string;
  dateOfBirth: Date;
  gender: string;
  maritalStatus: string;
  nationality: string;
  nationalId: string;
  passportNumber: string;
  
  // Step 3: Contact Info
  personalEmail: string;
  personalPhone: string;
  address: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  emergencyContact: {
    name: string;
    relationship: string;
    phone: string;
    email: string;
  };
  
  // Step 4: Documents
  uploadedDocuments: Array<{
    type: string;
    file: File;
    name: string;
  }>;
  
  // Step 5: Banking
  bankName: string;
  accountNumber: string;
  accountType: string;
  accountHolderName: string;
  
  // Step 6: Policy Acknowledgments
  acknowledgedPolicies: string[]; // Policy IDs
}
```

---

## 🚀 **Implementation Steps**

### **Step 1: Create Auth Context** (30 min)
- Create `context/AuthContext.tsx`
- Add authentication state management
- Implement login/logout functions

### **Step 2: Create Auth Service** (45 min)
- Create `services/authService.ts`
- Implement login validation
- Implement password setup
- Add password hashing (bcryptjs)

### **Step 3: Update Login Page** (30 min)
- Enhance existing `LoginPage.tsx`
- Connect to auth service
- Add form validation
- Add error handling

### **Step 4: Update Password Setup** (30 min)
- Enhance existing `PasswordSetup.tsx`
- Add token validation
- Add password strength indicator
- Connect to auth service

### **Step 5: Build Onboarding Wizard** (2 hours)
- Enhance existing `OnboardingWizard.tsx`
- Create 7-step wizard
- Add file upload capability
- Save all data to Firebase

### **Step 6: Add Protected Routes** (30 min)
- Update `App.tsx`
- Create `ProtectedRoute` component
- Add redirect logic

### **Step 7: Update All Components** (1 hour)
- Remove URL parameter dependency
- Use Auth context instead
- Update Dashboard, Profile, etc.

---

## ⏱️ **Total Implementation Time:**

**Estimated:** 5-6 hours

**Breakdown:**
- Auth Context & Service: 1.5 hours
- Login & Password Setup: 1 hour
- Onboarding Wizard: 2 hours
- Protected Routes & Updates: 1.5 hours

---

## 🎯 **Ready to Start?**

I'll implement this complete authentication and onboarding system!

Should I proceed? 🚀



