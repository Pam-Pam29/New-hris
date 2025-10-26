# Quick Fix: Employee Setup Token Issue

## Problem
Employee TRA001 setup link shows "Invalid Invitation" because the `auth.setupToken` in Firestore doesn't match the token in the URL.

## Quick Fix in Firebase Console

1. **Go to Firebase Console:**
   - https://console.firebase.google.com/
   - Project: `hris-system-baa22`
   - Firestore Database

2. **Open Employee Document:**
   - Collection: `employees`
   - Document ID: `TRA001`

3. **Update `auth` Object:**
   - Add or update field: `setupToken`
   - Value: `9jorq6t1vnimh81b13x` (must match URL)
   - Type: `string`

   - Add or update field: `setupExpiry`
   - Value: `2026-01-26` (any future date)
   - Type: `timestamp`

4. **Save the document**

5. **Try the setup link again:**
   ```
   https://hris-employee-platform-1l6vdan9g-pam-pam29s-projects.vercel.app/setup?id=TRA001&token=9jorq6t1vnimh81b13x
   ```

## Alternative: Skip Setup Token Check

If you can't update Firestore right now, the employee can still login directly:

1. Go to Employee Platform login page
2. Email: (the employee's email)
3. Password: (set manually in Firebase Auth or use forgot password)

## Future Employees

New employees created from the HR Platform should automatically have the correct `setupToken` set. The issue with TRA001 is because the employee was created before we had the complete setup flow.
