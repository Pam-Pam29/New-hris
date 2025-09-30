# 🚀 Step-by-Step Integration Guide

## ✅ Step 1: Components Already Integrated!

I've already integrated the new components into your Employee Dashboard. Here's what was done:

### Employee Dashboard Updates:
- ✅ Added real-time notification system
- ✅ Added Profile Management tab
- ✅ Added Leave Management tab  
- ✅ Added Policy Management tab
- ✅ Added Performance Management tab
- ✅ Updated tab navigation

## 🔧 Step 2: Install Missing Dependencies

Run this command to install the required dependencies:

```bash
npm install @radix-ui/react-scroll-area
```

## 🧪 Step 3: Test the Integration

### Start Both Dashboards:

```bash
# Terminal 1: Start HR Dashboard (Port 5173)
npm run dev:hr

# Terminal 2: Start Employee Dashboard (Port 5174)  
npm run dev:employee
```

### Test the Features:

1. **Open Employee Dashboard** (http://localhost:5174)
   - Click on the notification bell icon (top right)
   - Navigate through the new tabs: Profile, Leave, Policies, Performance
   - Try updating your profile information
   - Submit a leave request
   - Check for pending policies

2. **Open HR Dashboard** (http://localhost:5173)
   - View employee profiles
   - Approve/reject leave requests
   - Create new policies
   - Schedule performance meetings

## 🔥 Step 4: Configure Firebase (Optional)

If you want to use Firebase instead of mock data:

### 4.1 Create Firebase Project:
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project
3. Enable Firestore Database
4. Get your project configuration

### 4.2 Update Environment Variables:
Create/update `.env` file:

```env
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_DEFAULT_SERVICE=firebase
```

### 4.3 Set Up Firestore Collections:
The system will automatically create these collections when you start using the features:

- `employeeProfiles/`
- `leaveRequests/`
- `leaveBalances/`
- `policies/`
- `policyAcknowledgments/`
- `performanceMeetings/`
- `notifications/`
- `activityLogs/`

## 🎯 Step 5: Customize for Your Needs

### 5.1 Update Employee ID:
In the dashboard files, replace `"emp-001"` with your actual employee ID system:

```typescript
// In src/pages/Employee/Dashboard.tsx
<NotificationSystem employeeId={actualEmployeeId} />
<EmployeeProfileManager employeeId={actualEmployeeId} mode="employee" />
```

### 5.2 Add Authentication:
Integrate with your authentication system to get real employee IDs:

```typescript
// Example with auth context
const { user } = useAuth();
const employeeId = user?.id || "emp-001";
```

### 5.3 Customize Styling:
The components use your existing Tailwind CSS classes and will automatically match your theme.

## 🐛 Step 6: Troubleshooting

### Common Issues:

1. **Missing ScrollArea Component**:
   ```bash
   npm install @radix-ui/react-scroll-area
   ```

2. **Firebase Connection Issues**:
   - Check your environment variables
   - Ensure Firebase project is set up correctly
   - Check browser console for errors

3. **Components Not Loading**:
   - Check browser console for import errors
   - Ensure all dependencies are installed
   - Verify file paths are correct

### Debug Mode:
Add this to see what's happening:

```typescript
// In any component
console.log('Data Flow Service:', await getDataFlowService());
```

## 📱 Step 7: Mobile Testing

Test on mobile devices:
1. Open developer tools
2. Switch to mobile view
3. Test all components and interactions
4. Verify responsive design

## 🚀 Step 8: Production Deployment

### 8.1 Build for Production:
```bash
# Build HR Dashboard
npm run build

# Build Employee Dashboard  
npm run build:employee
```

### 8.2 Deploy:
- Deploy HR dashboard to your main domain
- Deploy Employee dashboard to employee subdomain
- Configure Firebase security rules
- Set up monitoring and analytics

## 🎉 You're Done!

Your HRIS system now has:
- ✅ Real-time data synchronization
- ✅ Comprehensive employee management
- ✅ Leave request workflows
- ✅ Policy acknowledgment system
- ✅ Performance meeting scheduling
- ✅ Live notifications
- ✅ Activity tracking and audit logs

## 📞 Need Help?

If you encounter any issues:
1. Check the browser console for errors
2. Verify all dependencies are installed
3. Test with mock data first (default mode)
4. Check the `DATA_FLOW_IMPLEMENTATION.md` for detailed documentation

The system is designed to work with or without Firebase, so you can start testing immediately with mock data!
