# Clear All Firestore Data

## ⚠️ WARNING: This will delete ALL data in Firestore!

This will permanently delete:
- All employees
- All companies
- All leave requests
- All time entries
- All job postings
- All candidates
- All policies
- **EVERYTHING**

## Option 1: Firebase Console (Easiest)

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select project: `hris-system-baa22`
3. Go to **Firestore Database**
4. Select **Danger Zone** (or **Settings**)
5. Click **Delete collection** or **Delete database**
6. Type `DELETE` to confirm
7. Wait for deletion to complete

## Option 2: Firebase CLI

Run this command:

```bash
firebase firestore:delete --all-collections --project hris-system-baa22
```

## After Clearing:

Once all data is deleted:

1. **Create a new company:**
   - Go to HR Platform signup
   - Create a new account (e.g., `hr@travellife.com`)
   - Complete onboarding
   - This will create a fresh company with correct `companyId`

2. **Add employees:**
   - Use the "Add Employee" button
   - New employees will automatically get the correct `companyId`

3. **Test multi-tenancy:**
   - Create a second company
   - Add employees to that company
   - Verify each company only sees their own data

## Recommendation

I recommend **Option 1 (Firebase Console)** as it's the safest and easiest. Then:

1. Sign up as the first company (Travellife)
2. Add a few test employees
3. Verify everything works
4. Then sign up as the second company (Siro)
5. Add test employees there
6. Verify multi-tenancy works correctly
