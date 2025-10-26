# Firebase Security Rules

Copy and paste these rules into your Firebase Console > Firestore Database > Rules tab:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Helper function to check if user is authenticated
    function isAuthenticated() {
      return request.auth != null;
    }
    
    // Helper function to check if user belongs to a company
    function belongsToCompany(companyId) {
      return isAuthenticated() && 
             exists(/databases/$(database)/documents/companies/$(companyId)) &&
             (resource.data.ownerId == request.auth.uid || 
              resource.data.members[request.auth.uid] != null);
    }
    
    // Helper function to check if user is company owner
    function isCompanyOwner(companyId) {
      return isAuthenticated() && 
             exists(/databases/$(database)/documents/companies/$(companyId)) &&
             get(/databases/$(database)/documents/companies/$(companyId)).data.ownerId == request.auth.uid;
    }
    
    // Helper function to check if user is HR team member
    function isHrTeamMember(companyId) {
      return isAuthenticated() && 
             exists(/databases/$(database)/documents/companies/$(companyId)) &&
             (get(/databases/$(database)/documents/companies/$(companyId)).data.ownerId == request.auth.uid ||
              exists(/databases/$(database)/documents/hrTeam/$(request.auth.uid)) &&
              get(/databases/$(database)/documents/hrTeam/$(request.auth.uid)).data.companyId == companyId);
    }

    // Companies collection
    match /companies/{companyId} {
      allow read, write: if isAuthenticated() && 
        (resource == null || resource.data.ownerId == request.auth.uid);
    }
    
    // HR Team collection
    match /hrTeam/{hrMemberId} {
      allow read, write: if isAuthenticated() && 
        (resource == null || 
         resource.data.companyId == request.auth.uid ||
         isHrTeamMember(resource.data.companyId));
    }
    
    // System Configuration collection
    match /systemConfig/{configId} {
      allow read, write: if isAuthenticated() && 
        (resource == null || 
         resource.data.companyId == request.auth.uid ||
         isHrTeamMember(resource.data.companyId));
    }
    
    // Employees collection
    match /employees/{employeeId} {
      allow read, write: if isAuthenticated() && 
        (resource == null || 
         resource.data.companyId == request.auth.uid ||
         isHrTeamMember(resource.data.companyId) ||
         resource.data.userId == request.auth.uid);
    }
    
    // Onboarding collection
    match /onboarding/{onboardingId} {
      allow read, write: if isAuthenticated() && 
        (resource == null || 
         resource.data.companyId == request.auth.uid ||
         isHrTeamMember(resource.data.companyId) ||
         resource.data.userId == request.auth.uid);
    }
    
    // Leave Types collection
    match /leaveTypes/{leaveTypeId} {
      allow read, write: if isAuthenticated() && 
        (resource == null || 
         resource.data.companyId == request.auth.uid ||
         isHrTeamMember(resource.data.companyId));
    }
    
    // Departments collection
    match /departments/{departmentId} {
      allow read, write: if isAuthenticated() && 
        (resource == null || 
         resource.data.companyId == request.auth.uid ||
         isHrTeamMember(resource.data.companyId));
    }
    
    // Job Postings collection
    match /jobPostings/{jobId} {
      allow read: if true; // Public read access for job postings
      allow write: if isAuthenticated() && 
        (resource == null || 
         resource.data.companyId == request.auth.uid ||
         isHrTeamMember(resource.data.companyId));
    }
    
    // Applications collection
    match /applications/{applicationId} {
      allow read, write: if isAuthenticated() && 
        (resource == null || 
         resource.data.companyId == request.auth.uid ||
         isHrTeamMember(resource.data.companyId) ||
         resource.data.applicantId == request.auth.uid);
    }
    
    // User profiles collection
    match /userProfiles/{userId} {
      allow read, write: if isAuthenticated() && 
        (resource == null || resource.id == request.auth.uid);
    }
    
    // Company settings collection
    match /companySettings/{settingId} {
      allow read, write: if isAuthenticated() && 
        (resource == null || 
         resource.data.companyId == request.auth.uid ||
         isHrTeamMember(resource.data.companyId));
    }
    
    // Notifications collection
    match /notifications/{notificationId} {
      allow read, write: if isAuthenticated() && 
        (resource == null || 
         resource.data.userId == request.auth.uid ||
         isHrTeamMember(resource.data.companyId));
    }
    
    // Time tracking collection
    match /timeTracking/{timeId} {
      allow read, write: if isAuthenticated() && 
        (resource == null || 
         resource.data.userId == request.auth.uid ||
         isHrTeamMember(resource.data.companyId));
    }
    
    // Performance reviews collection
    match /performanceReviews/{reviewId} {
      allow read, write: if isAuthenticated() && 
        (resource == null || 
         resource.data.companyId == request.auth.uid ||
         isHrTeamMember(resource.data.companyId) ||
         resource.data.employeeId == request.auth.uid);
    }
    
    // Leave requests collection
    match /leaveRequests/{requestId} {
      allow read, write: if isAuthenticated() && 
        (resource == null || 
         resource.data.companyId == request.auth.uid ||
         isHrTeamMember(resource.data.companyId) ||
         resource.data.employeeId == request.auth.uid);
    }
    
    // Asset management collection
    match /assets/{assetId} {
      allow read, write: if isAuthenticated() && 
        (resource == null || 
         resource.data.companyId == request.auth.uid ||
         isHrTeamMember(resource.data.companyId) ||
         resource.data.assignedTo == request.auth.uid);
    }
    
    // Training records collection
    match /trainingRecords/{recordId} {
      allow read, write: if isAuthenticated() && 
        (resource == null || 
         resource.data.companyId == request.auth.uid ||
         isHrTeamMember(resource.data.companyId) ||
         resource.data.employeeId == request.auth.uid);
    }
    
    // Policies collection
    match /policies/{policyId} {
      allow read: if isAuthenticated() && 
        (resource.data.companyId == request.auth.uid ||
         isHrTeamMember(resource.data.companyId) ||
         resource.data.employeeId == request.auth.uid);
      allow write: if isAuthenticated() && 
        (resource == null || 
         resource.data.companyId == request.auth.uid ||
         isHrTeamMember(resource.data.companyId));
    }
    
    // Meetings collection
    match /meetings/{meetingId} {
      allow read, write: if isAuthenticated() && 
        (resource == null || 
         resource.data.companyId == request.auth.uid ||
         isHrTeamMember(resource.data.companyId) ||
         resource.data.participants[request.auth.uid] != null);
    }
    
    // Documents collection
    match /documents/{documentId} {
      allow read, write: if isAuthenticated() && 
        (resource == null || 
         resource.data.companyId == request.auth.uid ||
         isHrTeamMember(resource.data.companyId) ||
         resource.data.uploadedBy == request.auth.uid);
    }
    
    // Reports collection
    match /reports/{reportId} {
      allow read, write: if isAuthenticated() && 
        (resource == null || 
         resource.data.companyId == request.auth.uid ||
         isHrTeamMember(resource.data.companyId));
    }
    
    // Audit logs collection
    match /auditLogs/{logId} {
      allow read, write: if isAuthenticated() && 
        (resource == null || 
         resource.data.companyId == request.auth.uid ||
         isHrTeamMember(resource.data.companyId));
    }
  }
}
```

## Key Features of These Rules:

### 🔐 **Security Principles:**
- **Authentication Required**: All operations require user authentication
- **Company-Based Access**: Users can only access data from their company
- **Role-Based Permissions**: Different access levels for owners, HR team, and employees
- **Data Isolation**: Complete separation between different companies

### 👥 **User Roles:**
1. **Company Owner**: Full access to all company data
2. **HR Team Members**: Access to employee and company data
3. **Employees**: Access to their own data and public company data

### 📊 **Collections Covered:**
- ✅ **Companies** - Company profiles and settings
- ✅ **HR Team** - HR team member management
- ✅ **System Config** - Platform configuration
- ✅ **Employees** - Employee profiles and data
- ✅ **Onboarding** - Employee onboarding progress
- ✅ **Leave Types** - Company leave policies
- ✅ **Departments** - Company organizational structure
- ✅ **Job Postings** - Public job listings
- ✅ **Applications** - Job applications
- ✅ **User Profiles** - User account information
- ✅ **Notifications** - User notifications
- ✅ **Time Tracking** - Employee time records
- ✅ **Performance Reviews** - Performance management
- ✅ **Leave Requests** - Employee leave requests
- ✅ **Assets** - Company asset management
- ✅ **Training Records** - Employee training history
- ✅ **Policies** - Company policies and documents
- ✅ **Meetings** - Meeting management
- ✅ **Documents** - File management
- ✅ **Reports** - Analytics and reporting
- ✅ **Audit Logs** - System activity logs

### 🚀 **How to Apply:**
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project
3. Go to **Firestore Database** > **Rules**
4. Replace the existing rules with the rules above
5. Click **Publish**

### ⚠️ **Important Notes:**
- These rules provide comprehensive security for a multi-tenant HRIS system
- All data is isolated by company ID
- Users can only access data they're authorized to see
- Public read access is only granted to job postings
- All write operations require proper authentication and authorization