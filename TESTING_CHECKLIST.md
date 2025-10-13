# ✅ Quick Testing Checklist

## 📋 **Use this as you go through COMPLETE_ONBOARDING_FLOW_TEST.md**

---

## 🏢 **Part 1: Companies** 

- [ ] Acme Corporation onboarded
- [ ] TechCorp Inc. set up (leave types created)
- [ ] Globex Industries set up (leave types created)
- [ ] Company switcher works

---

## 👥 **Part 2: Employees**

### **Acme:**
- [ ] ACME001 - Sarah Johnson (HR Manager) - ₦5.4M
- [ ] ACME002 - Michael Adebayo (Software Engineer) - ₦4.8M

### **TechCorp:**
- [ ] TECH001 - Chioma Okafor (Product Manager) - ₦6.0M
- [ ] TECH002 - James Okonkwo (DevOps Engineer) - ₦5.2M

### **Globex:**
- [ ] GLOB001 - Fatima Yusuf (Sales Manager) - ₦5.8M
- [ ] GLOB002 - Daniel Eze (Marketing Specialist) - ₦3.9M

---

## 🧪 **Part 3: Employee Platform Tests**

- [ ] Sarah (ACME001) - Dashboard loads correctly
- [ ] Sarah - Profile update works
- [ ] Sarah - Leave request submitted (5 days Annual)
- [ ] Michael (ACME002) - Dashboard loads
- [ ] Michael - Clock in/out works
- [ ] Chioma (TECH001) - Dashboard loads (TechCorp context)
- [ ] Chioma - Leave request (2 days Sick)
- [ ] James (TECH002) - Dashboard loads
- [ ] Fatima (GLOB001) - Dashboard loads (Globex context)
- [ ] Daniel (GLOB002) - Dashboard loads

---

## 🔄 **Part 4: Real-Time Sync Tests**

- [ ] Leave approval syncs to Employee Platform (no refresh)
- [ ] Job posting syncs to Careers Platform (no refresh)
- [ ] Multi-tenancy verified (no cross-company data)
- [ ] No console errors
- [ ] Smooth performance

---

## 🎯 **Quick URLs**

### **HR Platform:**
```
http://localhost:3003
```

### **Employee Platform:**
```
# Acme
http://localhost:3005?employee=ACME001&company=acme
http://localhost:3005?employee=ACME002&company=acme

# TechCorp
http://localhost:3005?employee=TECH001&company=techcorp
http://localhost:3005?employee=TECH002&company=techcorp

# Globex
http://localhost:3005?employee=GLOB001&company=globex
http://localhost:3005?employee=GLOB002&company=globex
```

### **Careers Platform:**
```
http://localhost:3004/careers/acme
http://localhost:3004/careers/techcorp
http://localhost:3004/careers/globex
```

---

## 📊 **Expected Results**

### **HR Dashboard (per company):**
- Employees: `2`
- Leave Types: `3`
- Departments: Multiple

### **Employee Leave Balances:**
- Annual Leave: `20 days`
- Sick Leave: `10 days`
- Personal Leave: `5 days`

---

## 🐛 **Issues Found:**

```
1. _______________________________________
2. _______________________________________
3. _______________________________________
```

---

**Check off items as you complete them! ✅**




