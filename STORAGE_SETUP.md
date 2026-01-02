# Firebase Storage Setup

## Issue
Contract uploads are failing with CORS errors because Firebase Storage rules don't have a rule for `signed_contracts/` path.

## Solution

### Option 1: Deploy Storage Rules via Firebase Console (Recommended)

1. Go to [Firebase Console](https://console.firebase.google.com/project/hris-system-baa22/storage)
2. Click on "Rules" tab
3. Copy the contents of `storage.rules` file
4. Paste into the rules editor
5. Click "Publish"

### Option 2: Enable Storage via Firebase Console

If Storage isn't enabled yet:

1. Go to [Firebase Console - Storage](https://console.firebase.google.com/project/hris-system-baa22/storage)
2. Click "Get Started"
3. Choose "Start in test mode" (we'll update rules after)
4. Select a location (choose closest to your users)
5. Click "Done"

Then deploy the rules using Option 1 above.

## Updated Rules

The `storage.rules` file now includes rules for:
- ✅ `signed_contracts/` - Allows authenticated employees to upload signed contracts
- ✅ File size validation (max 10MB)
- ✅ File type validation (PDF, images, documents)

## After Setup

Once Storage is enabled and rules are deployed:
- Contract uploads will work
- Employees can upload their signed contracts
- HR can read and delete all contracts
- All authenticated users can read contracts


