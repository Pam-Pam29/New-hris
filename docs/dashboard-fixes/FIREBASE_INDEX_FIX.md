# 🔧 Firebase Index Fix

## Issue
The Employee Dashboard requires a Firebase index for the `leaveTypes` collection query.

**Error:**
```
The query requires an index. You can create it here: 
https://console.firebase.google.com/v1/r/project/hris-system-baa22/firestore/indexes
```

## Quick Fix (2 options)

### Option 1: Click the Link (Easiest)
1. Click this link (or copy from console): 
   https://console.firebase.google.com/v1/r/project/hris-system-baa22/firestore/indexes?create_composite=ClRwcm9qZWN0cy9ocmlzLXN5c3RlbS1iYWEyMi9kYXRhYmFzZXMvKGRlZmF1bHQpL2NvbGxlY3Rpb25Hcm91cHMvbGVhdmVUeXBlcy9pbmRleGVzL18QARoMCghpc0FjdGl2ZRABGggKBG5hbWUQARoMCghfX25hbWVfXxAB

2. Firebase will auto-configure the index
3. Click "Create Index"
4. Wait 2-3 minutes for indexing to complete
5. Refresh your dashboard

### Option 2: Manual Setup
1. Go to Firebase Console: https://console.firebase.google.com/
2. Select project: `hris-system-baa22`
3. Click "Firestore Database" in left sidebar
4. Click "Indexes" tab
5. Click "Create Index"
6. Set:
   - Collection ID: `leaveTypes`
   - Fields to index:
     - `isActive` (Ascending)
     - `name` (Ascending)
7. Click "Create"
8. Wait for indexing to complete

## Already Fixed
✅ Removed the `notifications` undefined error - notifications now only in header!

## After Creating Index
The Employee Dashboard will load:
- ✅ Real leave balances from Firebase
- ✅ Real leave requests
- ✅ Activity feed
- ✅ No more errors!

**The page will automatically work once the index is created.**

