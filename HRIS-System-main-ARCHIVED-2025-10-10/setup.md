# HRIS System Setup Guide

## Quick Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Setup
```bash
# Copy the example environment file
cp env.example .env

# Edit .env with your Firebase configuration (optional)
```

### 3. Run the Application
```bash
npm run dev
```

## Changes Made

### ✅ Onboarding Page
- **Status**: Commented out
- **Location**: `src/pages/Hr/Hiring/Onboarding/`
- **Navigation**: Removed from sidebar
- **To Re-enable**: Uncomment the routes in `App.tsx` and sidebar links

### ✅ Payroll Management
- **Status**: Only main Payroll page is active
- **Commented Out**: Wallet, Benefits, Pension, Tax pages
- **Location**: `src/pages/Hr/Payroll/`
- **To Re-enable**: Uncomment the routes in `App.tsx` and sidebar links

### ✅ Employee Management
- **Status**: Enhanced with Firebase integration
- **Mock Employees**: Commented out as requested
- **Backend**: Supports Firebase and Mock services
- **Location**: `src/pages/Hr/CoreHr/EmployeeManagement/`

### ✅ Time Management
- **Status**: Enhanced adjustment popup
- **New Features**: 
  - Clock in/out time inputs
  - Reason selection dropdown
  - Additional notes field
  - Improved UI
- **Location**: `src/pages/Hr/CoreHr/TimeManagement/`

## Backend Configuration

### Using Mock Service (Default)
The system uses Mock service by default. No additional setup required.

### Using Firebase Service
1. Create a Firebase project
2. Enable Firestore Database
3. Update `.env` with your Firebase config
4. Change `VITE_DEFAULT_SERVICE=firebase` in `.env`
5. Update `src/config/firebase.ts` if needed

## File Structure

```
src/
├── config/
│   └── firebase.ts          # Firebase configuration
├── services/
│   └── employeeService.ts   # Employee service with Firebase/Mock support
├── pages/Hr/
│   ├── CoreHr/
│   │   ├── EmployeeManagement/  # Enhanced with Firebase
│   │   └── TimeManagement/      # Enhanced adjustment popup
│   ├── Hiring/
│   │   └── Onboarding/          # Commented out
│   └── Payroll/
│       └── Payroll.tsx          # Only active payroll page
└── components/
    └── organisms/
        └── Sidebar.tsx          # Updated navigation
```

## Troubleshooting

### TypeScript Errors
- Run `npm install` to ensure all dependencies are installed
- Check that TypeScript configuration is correct
- Restart the development server

### Firebase Issues
- Verify Firebase configuration in `.env`
- Check browser console for errors
- System will automatically fall back to Mock service

### Missing Components
- Ensure all UI components are properly imported
- Check that shadcn/ui components are installed
- Verify component paths are correct

## Development Notes

- The system uses a service factory pattern for easy backend switching
- All employee operations go through the `employeeService` interface
- Firebase integration is optional and can be easily disabled
- The UI is built with shadcn/ui components and Tailwind CSS
- TypeScript is used throughout for type safety

## Next Steps

1. **Test the application** to ensure all features work correctly
2. **Configure Firebase** if you want to use it as the backend
3. **Add more employees** through the Employee Management interface
4. **Test the Time Management** adjustment popup functionality
5. **Re-enable features** as needed by uncommenting the relevant code

