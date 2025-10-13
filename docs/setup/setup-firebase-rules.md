# Firebase Security Rules Setup

## Current Issue
You're getting "Missing or insufficient permissions" errors because Firebase security rules are blocking write/delete operations.

## Solution
You need to update your Firebase security rules to allow read/write access for testing.

### Option 1: Temporary Open Rules (FOR TESTING ONLY)
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: `hris-system-baa22`
3. Go to **Firestore Database** → **Rules**
4. Replace the existing rules with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

### Option 2: Use Firebase CLI (Recommended)
1. Install Firebase CLI if you haven't:
   ```bash
   npm install -g firebase-tools
   ```

2. Login to Firebase:
   ```bash
   firebase login
   ```

3. Initialize Firebase in your project:
   ```bash
   firebase init firestore
   ```

4. Deploy the rules:
   ```bash
   firebase deploy --only firestore:rules
   ```

### Option 3: Manual Upload
1. Copy the contents of `firebase-security-rules.json` (created in your project root)
2. Go to Firebase Console → Firestore Database → Rules
3. Paste the rules and click "Publish"

## Security Warning
⚠️ **IMPORTANT**: The rules above allow anyone to read/write your database. This is ONLY for testing. For production, you should implement proper authentication and role-based access control.

## After Setting Rules
Once you've updated the rules, you can:
1. Clear all mock data using the "Clear All Data" button in the test interface
2. Create test profiles using the "Create Profile" button
3. Test real-time synchronization between platforms

## Production Security Rules
For production, use rules like:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow authenticated users to read/write their own data
    match /employees/{employeeId} {
      allow read, write: if request.auth != null && request.auth.uid == employeeId;
    }
    
    // Allow HR/Admin users to read/write all data
    match /{document=**} {
      allow read, write: if request.auth != null && 
        request.auth.token.role in ['admin', 'hr'];
    }
  }
}
```


