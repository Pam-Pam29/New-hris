# Employee Dashboard

A comprehensive employee-facing dashboard that integrates seamlessly with the existing HR platform. This dashboard handles the complete employee lifecycle from contract phase to daily operations.

## 🎯 Overview

The Employee Dashboard provides employees with self-service capabilities while maintaining real-time synchronization with the HR management system. It serves as the employee-facing counterpart to the HR dashboard.

## 📋 Features

### Phase 1: Contract & Onboarding System

#### Contract Phase
- **Contract Generation**: Automatically generate employment contracts based on HR input
- **Digital Signing**: Implement e-signature functionality for contract acceptance
- **Contract Status Tracking**: Track contract status (pending, signed, executed)
- **Document Storage**: Securely store signed contracts with version control

#### Email Automation System
- **Welcome Email**: Automatically send welcome email upon contract signing
- **Credentials Email**: Send temporary login credentials and setup instructions
- **Work Email Creation**: Generate company email addresses following naming conventions
- **Password Reset Flow**: Secure password change process with email verification

#### Document Upload System
- **Required Documents Checklist**: Dynamic list based on position/location
- **Document Categories**:
  - Identity verification (ID, passport, driver's license)
  - Educational certificates
  - Previous employment records
  - Tax forms and declarations
  - Banking information
  - Emergency contact forms
  - Professional certifications
- **Document Validation**: File type, size, and format validation
- **Progress Tracking**: Visual progress indicator for document submission
- **Automated Notifications**: Remind employees of missing documents

### Phase 2: Employee Dashboard Features

#### 1. Profile Management
- **Personal Information**: Editable profile with photo upload
- **Contact Details**: Address, phone, emergency contacts
- **Banking Information**: Salary account details
- **Family Information**: Dependents, beneficiaries
- **Skills & Certifications**: Self-reported skills matrix
- **Real-time Sync**: All changes reflect immediately on HR dashboard

#### 2. Leave Management System
- **Leave Request Interface**:
  - Calendar-based leave selection
  - Leave type dropdown (annual, sick, maternity, etc.)
  - Reason for leave (required/optional based on type)
  - Attachment support for medical certificates
  - Substitute assignment selection
- **Leave Balance Display**:
  - Visual dashboard showing remaining days per leave type
  - Accrual tracking and projections
  - Leave history with status indicators
- **Real-time Approval Status**:
  - Pending, approved, rejected status updates
  - Push notifications for status changes
  - Integration with HR dashboard for instant approval workflow

#### 3. Policy Management
- **Policy Library**: Categorized company policies and procedures
- **New Policy Notifications**: Alert system for policy updates
- **Acknowledgment System**:
  - Required reading tracking with progress indicators
  - Digital signature for policy acknowledgment
  - Automatic compliance reporting to HR
- **Policy Search**: Full-text search across all policies
- **Version Control**: Access to policy history and changes

#### 4. Performance Management
- **Performance Dashboard**:
  - Goal tracking with progress visualization
  - Key performance indicators (KPIs)
  - Achievement badges and milestones
- **Meeting Scheduler**:
  - Book meetings with HR/managers
  - Calendar integration with availability checking
  - Meeting history and notes access
- **360-Degree Feedback**:
  - Peer review submissions
  - Self-assessment forms
  - Development plan tracking
- **Performance Reviews**: Access to review history and feedback

#### 5. Asset Management
- **Asset Inventory**: Personal view of assigned company assets
- **Asset Requests**: Request new equipment or replacements
- **Maintenance Reporting**: Report asset issues or damage
- **Return Process**: Asset return workflow for departing employees
- **Asset Documentation**: User manuals, warranty information

#### 6. Time Management with Live Location
- **Clock In/Out System**:
  - GPS-based location verification
  - Geofencing for office premises
  - Photo verification for remote work
  - Offline capability with sync when connected
- **Live Location Tracking**:
  - Real-time location sharing during work hours
  - Privacy controls and consent management
  - Location history for time verification
  - Battery optimization considerations
- **Timesheet Management**:
  - Weekly/monthly timesheet view
  - Break time tracking
  - Overtime calculation and approval requests
  - Time adjustment requests with justification
- **Schedule Management**:
  - Shift scheduling and swapping
  - Availability management
  - Schedule notifications and reminders

#### 7. Payment & Compensation Management
- **Payroll Dashboard**:
  - Current salary information and pay grade
  - Monthly/annual compensation breakdown
  - Pay history with detailed pay slips
  - Tax deduction summaries and year-end statements
- **Payment Tracking**:
  - Real-time payment status updates
  - Payment method management (bank account, mobile money)
  - Payment notifications and confirmations
  - Direct deposit setup and modifications
- **Earnings Overview**:
  - Base salary, overtime, bonuses, and allowances
  - Commission tracking for sales roles
  - Performance-based incentive calculations
  - Holiday and overtime pay calculations
- **Benefits & Deductions**:
  - Health insurance, pension contributions
  - Loan deductions and repayment schedules
  - Tax withholdings and social security contributions
  - Flexible benefits enrollment and modifications
- **Financial Requests**:
  - Salary advance requests with approval workflow
  - Loan applications and status tracking
  - Expense reimbursement submissions
  - Travel allowance and per diem requests
- **Payroll Calendar**:
  - Pay dates and payroll cycle information
  - Holiday pay schedules
  - End-of-year bonus timelines
  - Tax document availability notifications

## 🔧 Technical Implementation

### Architecture Requirements
- **Frontend**: React with TypeScript
- **Styling**: Tailwind CSS with shadcn/ui components
- **State Management**: React hooks with context
- **Backend Integration**: Firebase (matching HR system)
- **Real-time Updates**: Firebase Realtime Database
- **Authentication**: JWT with multi-factor authentication
- **File Storage**: Firebase Storage
- **Push Notifications**: Firebase Cloud Messaging

### Database Schema Extensions

The Employee Dashboard extends the existing HRIS database with the following collections:

#### Employee Profile
```typescript
interface EmployeeProfile {
  id: string;
  personalInfo: PersonalInfo;
  contactInfo: ContactInfo;
  bankingInfo: BankingInfo;
  documents: Document[];
  skills: Skill[];
  emergencyContacts: EmergencyContact[];
  createdAt: Date;
  updatedAt: Date;
}
```

#### Leave Management
```typescript
interface LeaveRequest {
  id: string;
  employeeId: string;
  leaveType: LeaveType;
  startDate: Date;
  endDate: Date;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  approvedBy?: string;
  attachments?: string[];
  totalDays: number;
  createdAt: Date;
  updatedAt: Date;
}
```

#### Time Tracking
```typescript
interface TimeEntry {
  id: string;
  employeeId: string;
  clockIn: Date;
  clockOut?: Date;
  location: GeoLocation;
  photos?: string[];
  breakTime: number;
  notes?: string;
  status: 'active' | 'completed' | 'adjusted';
  createdAt: Date;
  updatedAt: Date;
}
```

#### Payment & Compensation
```typescript
interface PayrollRecord {
  id: string;
  employeeId: string;
  payPeriod: PayPeriod;
  baseSalary: number;
  overtime: number;
  bonuses: number;
  deductions: Deduction[];
  netPay: number;
  paymentStatus: 'pending' | 'processed' | 'paid';
  paymentDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

interface FinancialRequest {
  id: string;
  employeeId: string;
  requestType: 'advance' | 'loan' | 'reimbursement' | 'allowance';
  amount: number;
  reason: string;
  status: 'pending' | 'approved' | 'rejected' | 'paid';
  attachments?: string[];
  approvedBy?: string;
  createdAt: Date;
  updatedAt: Date;
}
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Firebase project setup
- Existing HRIS system

### Installation

1. **Navigate to the Employee Dashboard directory**:
   ```bash
   cd src/pages/Employee
   ```

2. **Install dependencies** (if not already installed):
   ```bash
   npm install
   ```

3. **Configure Firebase**:
   - Ensure Firebase is properly configured in `../../../config/firebase.ts`
   - Set up Firestore collections as per the schema above

4. **Start the development server**:
   ```bash
   npm run dev
   ```

### Usage

The Employee Dashboard is accessible at `/employee` route and includes the following main sections:

- **Dashboard**: Overview of employee data and quick actions
- **Contract & Onboarding**: Contract signing and onboarding checklist
- **Profile Management**: Personal information and skills management
- **Leave Management**: Leave requests and balance tracking
- **Time Management**: Clock in/out and timesheet management
- **Payroll & Compensation**: Salary, benefits, and financial requests
- **Performance Management**: Goals, reviews, and development tracking
- **Asset Management**: Company assets and equipment requests
- **Policy Management**: Company policies and acknowledgments

## 🔒 Security & Privacy Considerations

- **Data Encryption**: End-to-end encryption for sensitive data
- **Location Privacy**: Explicit consent and granular location controls
- **Document Security**: Secure document storage with access logs
- **Audit Trails**: Complete activity logging for compliance
- **GDPR Compliance**: Data protection and right to deletion
- **Role-based Access**: Different access levels based on employee type

## 🔗 Integration Points with HR Dashboard

- **Real-time Synchronization**: Bidirectional data sync
- **Approval Workflows**: Seamless approval processes for leave, financial requests, and time adjustments
- **Notification System**: Cross-platform notifications for payments, approvals, and updates
- **Reporting Integration**: Employee data feeds into HR analytics and payroll processing
- **Single Sign-On**: Unified authentication system
- **Payroll Integration**: Automatic timesheet data feeding into payroll calculations

## 📁 File Structure

```
src/pages/Employee/
├── App.tsx                          # Main Employee Dashboard app
├── Sidebar.tsx                      # Navigation sidebar
├── Dashboard.tsx                    # Main dashboard overview
├── types.ts                         # TypeScript type definitions
├── services/
│   └── employeeDashboardService.ts  # Service layer for data operations
├── ContractOnboarding/
│   └── index.tsx                    # Contract and onboarding management
├── ProfileManagement/
│   └── index.tsx                    # Employee profile management
├── LeaveManagement/
│   └── index.tsx                    # Leave requests and tracking
├── TimeManagement/
│   └── index.tsx                    # Time tracking and management
├── PayrollCompensation/
│   └── index.tsx                    # Payroll and compensation
├── PerformanceManagement/
│   └── index.tsx                    # Performance goals and reviews
├── AssetManagement/
│   └── index.tsx                    # Company assets management
├── PolicyManagement/
│   └── index.tsx                    # Company policies and compliance
└── README.md                        # This documentation
```

## 🧪 Testing

The Employee Dashboard includes comprehensive testing for:

- **Unit Tests**: Individual component testing
- **Integration Tests**: Service layer and API testing
- **E2E Tests**: Full user workflow testing
- **Performance Tests**: Load and stress testing

## 📈 Performance Optimization

- **Code Splitting**: Lazy loading of components
- **Caching**: Intelligent data caching strategies
- **Offline Support**: Progressive Web App capabilities
- **Image Optimization**: Compressed and optimized assets
- **Bundle Optimization**: Minimized JavaScript bundles

## 🔄 Future Enhancements

- **Mobile App**: Native iOS and Android applications
- **AI Integration**: Smart recommendations and insights
- **Advanced Analytics**: Predictive analytics and reporting
- **Multi-language Support**: Internationalization
- **Accessibility**: Enhanced accessibility features
- **Voice Commands**: Voice-activated features
- **AR/VR Integration**: Augmented reality for training and onboarding

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation wiki
- Join the team Slack channel

---

**Note**: This Employee Dashboard is designed to work seamlessly with the existing HRIS system. Ensure proper integration testing before deploying to production.



