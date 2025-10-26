# 📊 HRIS Database Summary - What Has Been Built

## Overview
This is a **multi-tenant HRIS (Human Resources Information System)** built with:
- **Firebase Firestore** for backend database
- **3 Platform applications**: HR Platform, Employee Platform, Careers Platform
- **Multi-company support** with complete data isolation

---

## 🗄️ Database Collections (Firestore)

### **1. Core Company Data**

#### `/companies`
- **Purpose**: Company profiles and settings
- **Fields**: 
  - `displayName`, `domain`, `address`, `phone`, `email`, `website`
  - `primaryColor`, `secondaryColor` (branding)
  - `settings`: industry, companySize, timezone, careersSlug, onboarding status
- **Multi-tenancy**: Each document represents one company
- **Access**: Public read, HR write

#### `/departments`
- **Purpose**: Organizational structure
- **Fields**: `companyId`, `name`, `description`, `isActive`
- **Usage**: Filtered by `companyId` for multi-tenancy
- **Example**: Engineering, Sales, HR, Marketing

---

### **2. Employee Management**

#### `/employees`
- **Purpose**: Basic employee records
- **Fields**: Employee ID, basic info, hire date
- **Used for**: Authentication, login lookups

#### `/employeeProfiles`
- **Purpose**: Detailed employee profiles
- **Fields**:
  - `personalInfo`: firstName, lastName, DOB, gender, nationality
  - `contactInfo`: email, phone, address, emergency contacts
  - `workInfo`: position, department, manager, salary
  - `bankingInfo`: bank details, tax info
  - `skills`, `documents`, `emergencyContacts`
- **Access**: Employee can read own, HR can read all

#### `/onboarding`
- **Purpose**: Employee onboarding progress
- **Fields**: Setup steps completed, setup token, password status
- **Usage**: Track if employee has completed initial setup

#### `/hrUsers`
- **Purpose**: HR admin accounts
- **Fields**: Email, company association, role
- **Usage**: HR platform authentication

---

### **3. Leave Management**

#### `/leaveTypes`
- **Purpose**: Define leave categories
- **Fields**: `name`, `maxDays`, `accrualRate`, `carryForward`, `requiresApproval`, `color`
- **Example**: Annual Leave (20 days), Sick Leave (10 days)
- **Multi-tenancy**: Filtered by `companyId`

#### `/leaveRequests`
- **Purpose**: Employee leave applications
- **Fields**: `employeeId`, `leaveType`, `startDate`, `endDate`, `reason`, `status`
- **Statuses**: `pending`, `approved`, `rejected`
- **Workflow**: Employee submits → HR approves/rejects

#### `/leaveBalances`
- **Purpose**: Track remaining leave days per employee
- **Fields**: `employeeId`, leave type balances, last updated

---

### **4. Recruitment**

#### `/jobPostings` (also `/jobs`, `/jobPosts`, `/job_postings`)
- **Purpose**: Public job listings
- **Fields**: `title`, `department`, `type`, `location`, `description`, `requirements`, `status`
- **Access**: Public read for careers page
- **Multi-tenancy**: Filtered by `companyId`

#### `/candidates` (also `/applications`)
- **Purpose**: Job applications
- **Fields**: `applicantName`, `email`, `position`, `resume`, `status`, `notes`
- **Statuses**: `applied`, `screening`, `interview`, `offer`, `hired`, `rejected`
- **Access**: Public can apply, HR can see all

#### `/interviews`
- **Purpose**: Interview scheduling
- **Fields**: `candidateId`, `jobId`, `date`, `time`, `type`, `interviewers`, `status`
- **Features**: Panel interviews, Google Meet integration, email notifications
- **Access**: Authenticated users can read

---

### **5. Payroll & Financial**

#### `/payroll_records`
- **Purpose**: Employee payslips and salary records
- **Fields**: `employeeId`, `period`, `grossSalary`, `deductions`, `netSalary`, `currency`
- **Access**: Employee can see own, HR manages all

#### `/financial_requests`
- **Purpose**: Salary advances, loans, reimbursements
- **Fields**: `employeeId`, `requestType`, `amount`, `reason`, `status`, `repaymentSchedule`
- **Types**: `advance`, `loan`, `reimbursement`, `allowance`
- **Statuses**: `pending`, `approved`, `rejected`, `paid`, `recovering`, `completed`

---

### **6. Performance Management**

#### `/performanceGoals`
- **Purpose**: Employee performance goals
- **Fields**: `employeeId`, `title`, `description`, `targetDate`, `status`, `progress`
- **Statuses**: `not_started`, `in_progress`, `completed`, `overdue`
- **Features**: Goal tracking, overdue notifications

#### `/performanceReviews`
- **Purpose**: Performance evaluations
- **Fields**: `employeeId`, `reviewPeriod`, `ratings`, `comments`, `reviewer`

#### `/performanceMeetings`
- **Purpose**: Performance discussion meetings
- **Fields**: `employeeId`, `date`, `attendees`, `notes`

---

### **7. Time Tracking**

#### `/timeEntries`
- **Purpose**: Clock in/out records
- **Fields**: `employeeId`, `clockIn`, `clockOut`, `location`, `breakTime`, `notes`
- **Features**: GPS location, photo capture, break tracking

#### `/timeTracking`
- **Purpose**: Time tracking data (subcollection structure)
- **Usage**: Detailed time records per employee

#### `/attendance`
- **Purpose**: Attendance records
- **Fields**: Daily attendance tracking, late arrivals, absences

#### `/timeAdjustmentRequests`
- **Purpose**: Requests to modify time entries
- **Fields**: `timeEntryId`, `reason`, `requestedTime`, `status`

---

### **8. Policies & Documents**

#### `/policies`
- **Purpose**: Company policies and documents
- **Fields**: `title`, `content`, `effectiveDate`, `category`, `version`
- **Features**: Version control, acknowledgement tracking

#### `/policyAcknowledgments`
- **Purpose**: Track employee policy acknowledgments
- **Fields**: `employeeId`, `policyId`, `acknowledgedAt`

#### `/documentMetadata`
- **Purpose**: Document storage metadata (Cloudinary integration)
- **Fields**: `fileUrl`, `fileName`, `category`, `uploadedBy`, `uploadedAt`

---

### **9. Assets Management**

#### `/assets`
- **Purpose**: Company assets (laptops, phones, etc.)
- **Fields**: `name`, `type`, `serialNumber`, `status`, `value`

#### `/asset_assignments`
- **Purpose**: Asset assignments to employees
- **Fields**: `assetId`, `employeeId`, `assignedDate`, `returnDate`

#### `/maintenance_records`
- **Purpose**: Asset maintenance history
- **Fields**: `assetId`, `serviceDate`, `cost`, `notes`

#### `/assetRequests`
- **Purpose**: Employee asset requests
- **Fields**: `employeeId`, `assetType`, `reason`, `status`

#### `/starterKits`
- **Purpose**: New employee starter kit templates
- **Fields**: Asset bundles for new hires

---

### **10. Scheduling**

#### `/schedules`
- **Purpose**: Employee work schedules
- **Fields**: `employeeId`, `startDate`, `endDate`, `workDays`, `shiftTimes`

#### `/workSchedules`
- **Purpose**: Work schedule templates
- **Fields**: Schedule patterns, shift definitions

#### `/shiftTemplates`
- **Purpose**: Reusable shift templates
- **Fields**: `name`, `startTime`, `endTime`, `breakDuration`

#### `/meetingSchedules`
- **Purpose**: Scheduled meetings
- **Fields**: `title`, `date`, `time`, `attendees`, `agenda`

---

### **11. Notifications**

#### `/notifications`
- **Purpose**: User notifications
- **Fields**: `userId`, `title`, `message`, `type`, `read`, `timestamp`
- **Types**: `leave_request`, `payroll`, `performance`, `policy`, `system`

#### `/timeNotifications`
- **Purpose**: Time tracking notifications
- **Fields**: Clock-in reminders, missing entry alerts

---

### **12. Audit & Logging**

#### `/activityLogs`
- **Purpose**: System activity tracking
- **Fields**: `userId`, `action`, `resource`, `timestamp`, `details`
- **Access**: Admin only

---

### **13. HR Specific**

#### `/hrAvailability`
- **Purpose**: HR availability for meetings
- **Fields**: `date`, `timeSlots`, `status`

#### `/hrSettings`
- **Purpose**: HR configuration
- **Fields**: System settings, preferences

#### `/employeeDashboardData`
- **Purpose**: Dashboard analytics cache
- **Fields**: Aggregated data for dashboard display

---

### **14. Contracts**

#### `/contracts`
- **Purpose**: Employment contracts
- **Fields**: `employeeId`, `type`, `startDate`, `endDate`, `terms`, `document`

---

## 🔐 Security Rules

All collections have security rules enforcing:
- **Authentication**: Most operations require login
- **Authorization**: Role-based access (HR vs Employee)
- **Data Isolation**: Company-based filtering via `companyId`
- **Public Access**: Job postings are public read for careers page

---

## 🎯 Multi-Tenancy Implementation

**Every data collection includes `companyId` field:**
- Departments, Leave Types, Job Postings, etc. all filtered by company
- Companies can't see each other's data
- Complete data isolation across all modules

**Query Pattern:**
```typescript
query(
  collection(db, 'leaveRequests'),
  where('companyId', '==', currentCompanyId)
)
```

---

## 📱 Platform Usage

### **HR Platform**
- Creates/manages employees
- Configures leave types and policies
- Reviews leave requests
- Posts jobs and screens candidates
- Manages payroll and assets
- Views analytics and reports

### **Employee Platform**
- Views profile and dashboard
- Submits leave requests
- Tracks time and attendance
- Views payslips
- Submits financial requests
- Acknowledges policies
- Sets performance goals

### **Careers Platform**
- Public job board
- Job application submission
- No authentication required for browsing

---

## 🚀 Production Ready Features

✅ **Multi-company support** with complete isolation
✅ **Real-time synchronization** between platforms
✅ **Authentication & authorization** system
✅ **Leave management** workflow
✅ **Recruitment pipeline** with interview scheduling
✅ **Time tracking** with GPS and photo verification
✅ **Performance management** with goal tracking
✅ **Asset management** system
✅ **Document management** with Cloudinary integration
✅ **Notification system** for all events
✅ **Audit logging** for compliance

---

## 📊 Database Statistics

- **Total Collections**: 35+ collections
- **Companies Supported**: Unlimited (multi-tenant)
- **Real-time Updates**: Firebase Firestore listeners
- **Security**: Firestore Security Rules with role-based access
- **File Storage**: Firebase Storage + Cloudinary integration
- **Authentication**: Firebase Authentication

---

## 🔄 Recent Cleanup

All test and debug files have been removed for production:
- ✅ Test components removed
- ✅ Debug services removed
- ✅ Mock data removed
- ✅ Security vulnerabilities fixed
- ✅ TypeScript errors resolved

---

**Your HRIS is production-ready and fully operational!** 🎉
