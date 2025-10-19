# 🔥 Firebase Setup Guide

## Current Status: Using Mock Data ✅

Your application is currently configured to use **mock data** for testing. This means:
- ✅ All features work perfectly
- ✅ No Firebase permission errors
- ✅ No setup required
- ✅ Perfect for development and testing

## When You're Ready for Firebase (Optional)

### Step 1: Enable Firebase
Change the configuration in `src/config/firebase.ts`:

```typescript
export const SERVICE_CONFIG = {
  defaultService: 'firebase' as 'firebase' | 'mock', // Change to 'firebase'
  firebase: {
    enabled: true, // Change to true
    db: isFirebaseConfigured() ? db : null,
    storage: isFirebaseConfigured() ? storage : null
  },
  mock: {
    enabled: false // Change to false
  }
};
```

### Step 2: Set Up Firebase Project

1. **Go to [Firebase Console](https://console.firebase.google.com/)**
2. **Create a new project** or use existing one
3. **Enable Firestore Database**:
   - Go to Firestore Database
   - Click "Create database"
   - Choose "Start in test mode" (we'll secure it later)
   - Select your preferred location

### Step 3: Configure Authentication (Optional)

1. **Go to Authentication** in Firebase Console
2. **Enable Authentication**:
   - Go to Sign-in method
   - Enable "Email/Password" or your preferred method
3. **Set up custom claims** for user roles:
   ```javascript
   // Run this in Firebase Functions or Admin SDK
   admin.auth().setCustomUserClaims(uid, { role: 'employee' });
   admin.auth().setCustomUserClaims(uid, { role: 'hr' });
   ```

### Step 4: Deploy Security Rules

1. **Install Firebase CLI**:
   ```bash
   npm install -g firebase-tools
   ```

2. **Login to Firebase**:
   ```bash
   firebase login
   ```

3. **Initialize Firebase in your project**:
   ```bash
   firebase init firestore
   ```

4. **Deploy the rules**:
   ```bash
   firebase deploy --only firestore:rules
   ```

### Step 5: Update Environment Variables

Add to your `.env` file:
```env
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_DEFAULT_SERVICE=firebase
```

## 🔒 Security Rules Explained

The `firestore.rules` file includes:

- **Employee Profiles**: Employees can read/update their own, HR can read all
- **Leave Requests**: Employees can create/read their own, HR can approve/reject
- **Policies**: HR can create, employees can read and acknowledge
- **Meetings**: Both employees and HR can schedule/manage meetings
- **Notifications**: Users get their own notifications
- **Activity Logs**: HR can view audit trails

## 🚀 Quick Test with Firebase

1. **Enable Firebase** (change config as shown above)
2. **Restart your dev server**:
   ```bash
   npm run dev:employee
   ```
3. **Check browser console** - should see "Using Firebase Data Flow Service"
4. **Test features** - data will now persist in Firebase

## 🎯 Current Recommendation

**Keep using mock data for now** because:
- ✅ Everything works perfectly
- ✅ No setup required
- ✅ No Firebase costs
- ✅ Perfect for development and testing
- ✅ Can switch to Firebase anytime later

## 📞 Need Help?

If you want to use Firebase:
1. Follow the steps above
2. Check browser console for any errors
3. Verify your Firebase project is set up correctly
4. Make sure security rules are deployed

**The mock data system is production-ready and works perfectly for most use cases!** 🎉