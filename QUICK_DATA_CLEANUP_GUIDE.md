so i want to test the flow h# 🧹 Quick Data Cleanup Guide

## ✅ **Data Cleanup Feature Added!**

I've added a "Clear All Data" button directly in the HR Platform for easy data cleanup.

---

## 🚀 **How to Clean Data:**

### **Step 1: Open HR Platform**
```
http://localhost:3003
```

### **Step 2: Navigate to Company Setup**
```
HR Platform → Settings → Company Setup
```

### **Step 3: Scroll to Bottom**
Look for the **red "DANGER ZONE"** section

### **Step 4: Click "Clear All Data" Button**

### **Step 5: Confirm Deletion**
- You'll see 2 confirmation dialogs
- Type `DELETE` (all caps) in the second prompt
- Data will be deleted

---

## ⚠️ **What Gets Deleted:**

- ✅ All companies (Acme, TechCorp, Globex)
- ✅ All employees
- ✅ All job postings & applications
- ✅ All candidates & interviews
- ✅ All leave types & requests
- ✅ All time tracking data
- ✅ All payroll records
- ✅ All performance data
- ✅ Everything else!

**Note:** Collections are preserved (only documents deleted)

---

## 📊 **After Cleanup:**

You'll see a success message showing:
- Total documents deleted
- Status for each collection
- Ready for fresh data!

---

## 🔄 **Start Fresh Testing:**

After cleanup, follow these steps:

### **1. Create Demo Companies**
- Stay on Company Setup page
- Click "Create Demo Companies"
- Wait for success message

### **2. Create Leave Types**
- Scroll to "Create Default Leave Types"
- Click "Create Leave Types for Acme Corporation"

### **3. Add Test Employees**
- Go to: HR → Core HR → Employee Management
- Click "Add Employee"
- Create 2-3 test employees

### **4. Start Testing!**
- Follow `COMPREHENSIVE_TESTING_GUIDE.md` (Steps 4-8)
- Test all features systematically
- Document any issues

---

## 💡 **Tips:**

1. **Backup Important Data:** If you have real data, export it first!
2. **Start Fresh:** Best done at the beginning of a testing session
3. **Use Carefully:** This is a destructive operation
4. **Refresh After:** Reload the page after cleanup

---

## 🎯 **When to Clean Data:**

✅ **Good Times:**
- Starting comprehensive testing
- After major bugs fixed
- Before demo/presentation
- Resetting to known state

❌ **Bad Times:**
- Production environment (NEVER!)
- When others are testing
- Without backing up important data

---

## 🚀 **Ready to Clean?**

1. Open `http://localhost:3003`
2. Go to Settings → Company Setup
3. Scroll to bottom (Danger Zone)
4. Click button and confirm
5. Start fresh!

**Happy Testing! 🧪**








