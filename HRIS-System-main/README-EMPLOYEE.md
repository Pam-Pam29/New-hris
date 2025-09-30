# Employee Portal - Standalone Application

This is the standalone Employee Portal application that provides employees with self-service capabilities for managing their HR-related tasks.

## 🚀 Quick Start

### Development
```bash
# Start Employee Portal development server
npm run dev:employee

# Start HR Platform development server  
npm run dev:hr

# Start both (default)
npm run dev
```

### Production Build
```bash
# Build Employee Portal
npm run build:employee

# Build HR Platform
npm run build

# Preview Employee Portal
npm run preview:employee
```

## 📱 Access URLs

- **Employee Portal**: `http://localhost:5173/index-employee.html`
- **HR Platform**: `http://localhost:5173/`

## 🏗️ Architecture

### Standalone Structure
```
src/
├── pages/Employee/
│   ├── EmployeeApp.tsx          # Main Employee App with Router
│   ├── Sidebar.tsx              # Employee-specific sidebar
│   ├── Dashboard.tsx            # Employee dashboard
│   ├── ContractOnboarding/      # Contract & onboarding module
│   ├── ProfileManagement/       # Profile management
│   ├── LeaveManagement/         # Leave requests & tracking
│   ├── TimeManagement/          # Time tracking & timesheets
│   ├── PayrollCompensation/     # Payroll & compensation
│   ├── PerformanceManagement/   # Performance reviews
│   ├── AssetManagement/         # Asset requests & tracking
│   └── PolicyManagement/        # Policy library & acknowledgments
├── main-employee.tsx            # Employee app entry point
└── components/ui/               # Shared UI components
```

### Key Features

#### 🔐 Contract & Onboarding
- Digital contract generation and signing
- Document upload and validation
- Onboarding checklist tracking
- Email automation for credentials

#### 👤 Profile Management
- Personal information editing
- Contact details and emergency contacts
- Banking information management
- Skills and certifications tracking

#### 📅 Leave Management
- Calendar-based leave requests
- Leave balance tracking
- Approval status monitoring
- Leave history and reports

#### ⏰ Time Management
- GPS-based clock in/out
- Live location tracking
- Timesheet management
- Break time and overtime tracking

#### 💰 Payroll & Compensation
- Salary information display
- Pay history and pay slips
- Benefits and deductions overview
- Financial request submissions

#### 📈 Performance Management
- Goal tracking and progress
- Performance review access
- 360-degree feedback
- Development plan tracking

#### 📦 Asset Management
- Personal asset inventory
- Asset request submissions
- Maintenance reporting
- Return process workflow

#### 📋 Policy Management
- Company policy library
- Policy acknowledgment system
- Search and version control
- Compliance tracking

## 🔗 Integration with HR Platform

The Employee Portal includes a direct link to the HR Platform in the sidebar, allowing seamless navigation between the two applications while maintaining independence.

### Navigation
- **HR Platform Link**: Opens in new tab at `/hr-platform`
- **Independent Routing**: All employee routes are self-contained
- **Shared Components**: Uses same UI component library for consistency

## 🛠️ Development

### Adding New Features
1. Create new components in `src/pages/Employee/`
2. Add routes to `EmployeeApp.tsx`
3. Update sidebar navigation in `Sidebar.tsx`
4. Add types to `types.ts`

### Styling
- Uses Tailwind CSS with shadcn/ui components
- Consistent design system with HR Platform
- Responsive design for mobile and desktop

### State Management
- React hooks with context for local state
- Firebase integration for real-time data
- Local storage for user preferences

## 📦 Deployment

### Standalone Deployment
The Employee Portal can be deployed independently:
- Build: `npm run build:employee`
- Output: `dist-employee/` directory
- Serve: Static files with any web server

### Integrated Deployment
Both applications can be deployed together:
- Build: `npm run build`
- Output: `dist/` directory with both apps
- Serve: Static files with routing configuration

## 🔧 Configuration

### Environment Variables
```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

### Firebase Setup
- Real-time database for live updates
- Authentication for secure access
- Storage for document uploads
- Cloud Messaging for notifications

## 📱 Mobile Support

- Responsive design for all screen sizes
- Touch-friendly interface
- Offline capability for time tracking
- GPS integration for location services

## 🔒 Security

- JWT-based authentication
- Role-based access control
- Data encryption for sensitive information
- Audit trails for compliance
- GDPR compliance features

## 📊 Analytics

- User activity tracking
- Performance metrics
- Usage analytics
- Error monitoring

## 🆘 Support

For technical support or feature requests, contact the development team or refer to the main HRIS documentation.


