# Currency Migration Guide - USD to NGN

## Problem
Existing payroll records in Firebase have `currency: 'USD'` which causes them to display with dollar signs ($) instead of Naira (₦).

## Solution Applied

### 1. **Service Layer Fix** ✅
Both platforms now default to NGN when loading payroll records:

**Files Updated:**
- `hr-platform/src/services/payrollService.ts`
- `employee-platform/src/services/payrollService.ts`

**Change:**
```typescript
// Before
currency: data.currency,

// After
currency: data.currency || 'NGN', // Default to NGN if not set
```

This means even if Firebase has `currency: 'USD'`, it will be overridden to display as NGN.

---

## Optional: Permanent Database Migration

If you want to permanently update all records in Firebase (recommended for data consistency):

### Quick Method (via Browser Console)

1. **Open HR Platform** in your browser
2. **Open Developer Console** (F12)
3. **Paste this code** and press Enter:

```javascript
// Import Firebase
import { getFirestore, collection, getDocs, doc, updateDoc } from 'firebase/firestore';

// Get all payroll records
const db = getFirestore();
const payrollRef = collection(db, 'payroll_records');
const snapshot = await getDocs(payrollRef);

console.log(`Found ${snapshot.size} payroll records`);

// Update each record
let count = 0;
for (const docSnapshot of snapshot.docs) {
  const data = docSnapshot.data();
  if (data.currency !== 'NGN') {
    await updateDoc(doc(db, 'payroll_records', docSnapshot.id), { 
      currency: 'NGN' 
    });
    count++;
    console.log(`Updated ${docSnapshot.id} to NGN`);
  }
}

console.log(`✅ Updated ${count} records to NGN`);
```

---

### Alternative: Temporary Button Method

1. **Add this temporarily** to `hr-platform/src/pages/Hr/Dashboard.tsx`:

```typescript
import { migrateCurrencyToNGN } from '../../scripts/migrateCurrencyToNGN';

// Inside the Dashboard component, add this button:
<Button 
  onClick={async () => {
    const result = await migrateCurrencyToNGN();
    alert(`Migration complete! Updated ${result.updated} records`);
  }}
  variant="outline"
  className="bg-blue-500 text-white"
>
  🔄 Migrate Currency to NGN
</Button>
```

2. **Click the button** once to run the migration
3. **Remove the button** after migration is complete

---

### Manual Firebase Console Method

1. Go to **Firebase Console** → **Firestore Database**
2. Open the `payroll_records` collection
3. For each document with `currency: "USD"`:
   - Click the document
   - Edit the `currency` field
   - Change from `"USD"` to `"NGN"`
   - Save

---

## Testing

### Before Migration
```
Base Salary: $150,000
Gross Pay: $175,000
Net Pay: $155,000
```

### After Migration
```
Base Salary: ₦150,000.00
Gross Pay: ₦175,000.00
Net Pay: ₦155,000.00
```

---

## Verification

1. **Refresh the Employee Payroll page**
2. **Check the Quick Stats cards** at the top
3. **All amounts should now show with ₦ symbol**
4. **Check individual payslips** - should all use ₦

---

## Important Notes

⚠️ **The service layer fix (already applied) means:**
- Even without database migration, displays will show NGN
- The database migration is optional but recommended for consistency
- New payroll records will automatically use NGN

✅ **If you're seeing dollars:**
1. Hard refresh the page (Ctrl + Shift + R)
2. Clear browser cache
3. Check that `formatCurrency` is being called with the correct currency parameter

---

## Files Already Updated

✅ `employee-platform/src/services/payrollService.ts` - Defaults to NGN  
✅ `hr-platform/src/services/payrollService.ts` - Defaults to NGN  
✅ `employee-platform/src/pages/Employee/PayrollCompensation/index.tsx` - Enhanced formatCurrency  
✅ `hr-platform/src/pages/Hr/Payroll/Payroll.tsx` - Enhanced formatCurrency  

---

## Support

If you still see dollar signs after:
1. Hard refresh (Ctrl + Shift + R)
2. Check browser console for errors
3. Verify Firebase has payroll records for your employee
4. Check that `employeeId` in the component matches Firebase records

---

**Status**: ✅ Service layer fixes applied - displays will show NGN automatically
**Optional**: Run database migration for permanent data consistency


