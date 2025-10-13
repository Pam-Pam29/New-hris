# 🔍 Time Management Debug Guide

## 🎯 **Issues to Fix:**

1. Can't create schedules
2. Can't assign bulk schedules
3. Need to use Victoria Fakunle (EMP001) for testing

---

## 🧪 **Debug Steps:**

### **Step 1: Check Employees Loaded**

Open HR Platform console (F12) and look for:
```
📅 Schedule data loaded: {
    schedules: X,
    templates: X,
    employees: X  ← Check this number!
}
```

**If employees: 0** → Employee data not loading!
**If employees: 2+** → Victoria should be there!

---

### **Step 2: Expand the Console Log**

In console, click on the `Object` next to:
```
📅 Schedule data loaded: Object
```

This will show:
```
{
    schedules: 0,
    templates: 4,
    employees: 2  ← Expand this too!
}
```

Click on `employees: 2` to see which employees are loaded.

**Look for:**
- Victoria Fakunle
- Employee ID: EMP001 or emp-001

---

### **Step 3: Try Creating Schedule**

1. Click "Create Schedule" button
2. Click "Employee" dropdown
3. Check if you see Victoria Fakunle

**If dropdown is empty:**
→ Employees not loading from Firebase

**If Victoria is there:**
→ Try selecting her and creating schedule

---

### **Step 4: Check Console for Errors**

After clicking "Create Schedule" button in the dialog:

**Look for:**
- ✅ Schedule created successfully
- ❌ Error messages
- ❌ Validation failures

---

## 🔧 **Common Issues & Fixes:**

### **Issue 1: Employee Dropdown Empty**

**Problem:** `employees: 0` in console log

**Fix:**
```javascript
// Check if employees collection has data
// In Firebase Console → Firestore → employees collection
// Should see Victoria Fakunle (EMP001) and others
```

**Quick Test:**
Open browser console and type:
```javascript
employees
```

If it shows `[]` (empty array), employees aren't loading!

---

### **Issue 2: Create Button Disabled**

**Problem:** "Create Schedule" button is grayed out

**Reason:** No employee selected (button has `disabled={!scheduleForm.employeeId}`)

**Fix:**
1. Select an employee from dropdown first
2. Button will enable
3. Then click to create

---

### **Issue 3: Bulk Assign No Employees**

**Problem:** No employees to select for bulk assignment

**Fix:**
Check if checkboxes appear beside employee names in bulk dialog.

---

## 🎯 **For Victoria Fakunle (EMP001):**

### **Check Employee Record:**

The system should load Victoria from:
- Firebase collection: `employees`
- Document ID: `EMP001` or `emp-001`
- Name: `victoria fakunle` or `Victoria Fakunle`

### **Employee Service Loading:**

Your console shows:
```
Using Firebase Employee Service
Creating FirebaseEmployeeService
```

This is good! Employee service is working.

---

## 📊 **What to Send Me:**

Please expand this console log and send me the output:
```
📅 Schedule data loaded: Object  ← Click this
```

I need to see:
```
{
    schedules: ?,
    templates: ?,
    employees: ?  ← Expand this too!
}
```

And the employees array should show:
```
employees: [
    { id: "EMP001", name: "Victoria Fakunle", ... },
    { id: "emp-001", name: "John Doe", ... }
]
```

---

## 🚀 **Quick Test:**

### **In Browser Console, Type:**

```javascript
// Check employees
employees

// Check schedule form
scheduleForm

// Check if Victoria is there
employees.find(e => e.name.toLowerCase().includes('victoria'))
```

**Send me the results!** This will help me identify the exact issue.

---

## 💡 **Expected Behavior:**

### **Create Schedule Should:**
1. Show employee dropdown with all employees
2. Allow selecting Victoria Fakunle (EMP001)
3. Auto-fill shift times when selecting shift type
4. Enable "Create Schedule" button when employee selected
5. Submit and create schedule successfully

### **Bulk Assign Should:**
1. Show list of all employees with checkboxes
2. Allow selecting multiple employees
3. Show template dropdown
4. Enable "Assign to Selected" button
5. Assign schedule to all selected employees

---

## 🔍 **Next Steps:**

Please:
1. Open F12 console on HR Platform
2. Click on `📅 Schedule data loaded: Object`
3. Expand to see the data
4. Take a screenshot or copy the output
5. Send it to me

**Then I can fix the exact issue!** 🎯


