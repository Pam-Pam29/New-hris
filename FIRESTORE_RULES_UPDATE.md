# Firestore Security Rules Update

## Issue
The HR platform was experiencing "Missing or insufficient permissions" errors when trying to access:
- `recruitment_candidates` collection
- `interviews` collection

## Solution
Updated the root `firestore.rules` file to include:
1. Rules for `recruitment_candidates` collection (with underscore)
2. Fixed `interviews` collection rules to allow create/update/delete operations

## How to Deploy

### Option 1: Firebase Console (Recommended)
1. Go to [Firebase Console](https://console.firebase.google.com/project/hris-system-baa22/firestore/rules)
2. Copy the contents of `firestore.rules`
3. Paste into the Rules editor
4. Click "Publish"

### Option 2: Firebase CLI
```bash
firebase deploy --only firestore:rules
```

## Updated Rules
- `recruitment_candidates`: Authenticated users can read, HR can write
- `interviews`: Authenticated users can read, HR can create/update/delete

## Verification
After deploying, the dashboard should load without permission errors.

