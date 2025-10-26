# Multi-Tenancy Fix - Manual Update Required

## Problem
The application is showing **all employees from all companies** instead of filtering by `companyId`. This is because some employees in Firestore don't have the `companyId` field set.

## Root Cause
The 7 employees you're seeing (with IDs like `EMP001`) were created **before** the `companyId` field was added to the schema.

## Solution: Manual Update in Firebase Console

### Steps:
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: `hris-system-baa22`
3. Go to **Firestore Database**
4. Open the `employees` collection
5. For each employee document, ensure it has a `companyId` field:

### For Travellife Employees:
Add field:
- **Field Name:** `companyId`
- **Type:** `string`
- **Value:** `PO49cNuA17kKvlAvZm3K`

### For Siro Employees:
Add field:
- **Field Name:** `companyId`  
- **Type:** `string`
- **Value:** `siro` (or find the actual Siro companyId from the `companies` collection)

## After the Update

Once you've added `companyId` to all employees:
1. Refresh the HR platform page
2. The dashboard should now only show employees for the current company
3. Check the console - you should see: `📊 Found X employees in Firebase for company PO49cNuA17kKvlAvZm3K`

## Alternative: Bulk Update Script

If you have access to Firebase CLI and Admin SDK, I can provide a script to bulk update all employees. Let me know if you want that approach.
