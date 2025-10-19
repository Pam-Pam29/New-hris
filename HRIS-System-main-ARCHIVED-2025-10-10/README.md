# HRIS System

A comprehensive Human Resource Information System built with React, TypeScript, and Firebase.

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Install Firebase (Required for full functionality)
```bash
npm install firebase
```

### 3. Run the Application
```bash
npm run dev
```

## Recent Changes Made

### 1. Onboarding Page
- ✅ **Commented out** the onboarding page and its navigation links
- The onboarding functionality is temporarily disabled but can be easily re-enabled

### 2. Payroll Management
- ✅ **Commented out** all payroll pages except the main Payroll page
- The main Payroll page is now accessible and functional
- Other payroll features (Wallet, Benefits, Pension, Tax) are commented out but can be re-enabled

### 3. Employee Management
- ✅ **Enhanced Firebase Integration** with easy backend switching capability
- ✅ **Commented out existing mock employees** from the popup as requested
- ✅ **Improved service architecture** with abstract interfaces for easy backend switching
- The system now supports both Firebase and Mock services with automatic detection

### 4. Time Management
- ✅ **Enhanced clock in/out adjustment popup** with comprehensive features:
  - Clock in/out time inputs
  - Reason selection dropdown
  - Additional notes field
  - Improved UI with better styling and icons

## 🔥 Firebase Integration

Your Firebase project is already configured:
- **Project ID**: `hris-system-baa22`
- **Status**: Ready for use

### Firebase Setup
1. **Install Firebase**: `npm install firebase`
2. **Enable Firestore**: Go to Firebase Console and create a Firestore database
3. **Test Integration**: Add employees through the Employee Management interface

For detailed Firebase setup instructions, see [FIREBASE_SETUP.md](./FIREBASE_SETUP.md)

## Backend Architecture

The system is designed with a flexible backend architecture that allows easy switching between different backend services:

### Service Layer
- **Abstract Interface**: `IEmployeeService` defines the contract for all employee operations
- **Firebase Implementation**: `FirebaseEmployeeService` for production use
- **Mock Implementation**: `MockEmployeeService` for development/testing
- **Service Factory**: `EmployeeServiceFactory` for easy service switching

### Configuration
The system automatically detects and uses the best available service:
- If Firebase is properly configured, it uses Firebase
- Otherwise, it falls back to the Mock service

## Features

### Core HR
- ✅ Employee Management (with Firebase/Mock backend)
- ✅ Policy Management
- ✅ Asset Management
- ✅ Performance Management
- ✅ Time Management (with enhanced adjustment popup)
- ✅ Leave Management

### Hiring & Onboarding
- ✅ Recruitment
- ⏸️ Onboarding (commented out)
- ✅ Job Board

### Payroll
- ✅ Payroll Management
- ⏸️ Wallet (commented out)
- ⏸️ Benefits (commented out)
- ⏸️ Pension (commented out)
- ⏸️ Tax (commented out)

## Switching Backends

To switch between Firebase and Mock services:

1. **For Firebase**: Install Firebase with `npm install firebase`
2. **For Mock**: The system automatically falls back to Mock if Firebase is not available
3. **For Custom Backend**: Implement the `IEmployeeService` interface

## Development Notes

- The system uses TypeScript for type safety
- UI components are built with shadcn/ui
- Styling uses Tailwind CSS
- State management is handled with React hooks
- The architecture supports easy feature toggling and backend switching

## Troubleshooting

### TypeScript Errors
If you encounter TypeScript errors related to missing modules:
1. Ensure all dependencies are installed: `npm install`
2. Install Firebase: `npm install firebase`
3. Check that the TypeScript configuration is correct
4. Restart your development server

### Firebase Issues
If Firebase is not working:
1. Check your Firebase configuration in `src/config/firebase.ts`
2. Ensure Firestore is enabled in your Firebase project
3. Check browser console for Firebase-related errors
4. The system will automatically fall back to Mock service if Firebase fails

### Missing Components
- Ensure all UI components are properly imported
- Check that shadcn/ui components are installed
- Verify component paths are correct

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

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.
