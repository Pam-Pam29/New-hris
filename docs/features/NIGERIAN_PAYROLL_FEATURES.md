# 🇳🇬 Nigerian Payroll Features - Complete Guide

## 🎉 **Nigerian Tax System Support Added!**

The payroll system now automatically detects and applies **Nigerian tax deductions**!

---

## 🇳🇬 **Nigerian Deductions**

### **Automatic Detection**:
The system checks employee location:
- If location includes "Nigeria", "Lagos", or "Abuja"
- → Auto-applies Nigerian tax system
- → Otherwise uses International/US tax system

### **Nigerian Tax Deductions** (Auto-Applied):

1. **PAYE (Pay As You Earn)** - 7%
   - Nigerian income tax
   - Mandatory for all employees

2. **Pension Contribution** - 8%
   - Employee's pension fund contribution
   - Mandatory for employees earning ₦30,000+
   - Type: Retirement

3. **NHF (National Housing Fund)** - 2.5%
   - Mandatory housing fund contribution
   - For employees earning ₦3,000+ monthly
   - Type: Other

**Total Nigerian Deductions**: ~17.5% of base salary

---

## 💰 **Example: Nigerian Employee Payroll**

### **Scenario**: Victoria Fakunle (Lagos, Nigeria)

```
Base Salary: ₦500,000
↓
AUTO-ADDED DEDUCTIONS:
✅ PAYE: ₦35,000 (7%)
✅ Pension: ₦40,000 (8%)
✅ NHF: ₦12,500 (2.5%)
----------------------------
Total Deductions: ₦87,500 (17.5%)
Net Pay: ₦412,500
```

---

## 🌍 **International vs Nigerian Comparison**

### **Nigerian System** 🇳🇬:
```
Base Salary: ₦500,000
Deductions:
- PAYE (7%): ₦35,000
- Pension (8%): ₦40,000
- NHF (2.5%): ₦12,500
Total: ₦87,500 (17.5%)
Net Pay: ₦412,500
```

### **US System** 🇺🇸:
```
Base Salary: $5,000
Deductions:
- Federal Tax (12%): $600
- State Tax (5%): $250
- Social Security (6.2%): $310
- Medicare (1.45%): $72.50
Total: $1,232.50 (24.65%)
Net Pay: $3,767.50
```

---

## ⚙️ **How to Use**

### **Method 1: Automatic (Location-Based)**
```
1. Select employee with Nigeria location
2. System auto-detects location
3. Nigerian deductions auto-applied
4. Done! ✨
```

### **Method 2: Manual (Button)**
```
1. Select any employee
2. Go to "Deductions" tab
3. Click "🇳🇬 Add Nigerian Deductions" button
4. PAYE, Pension, NHF added instantly
5. Adjust amounts if needed
```

### **Method 3: Custom Deductions**
```
1. Go to "Deductions" tab
2. Click "+ Add Custom" button
3. Fill in:
   - Name: (e.g., "NSITF", "ITF")
   - Amount: (e.g., ₦5,000)
   - Type: Select from dropdown
   - Description: (Optional note)
4. Add as many as needed
```

---

## 📋 **Deduction Types Available**

When adding custom deductions, you can choose:

1. **Tax** - Income tax, PAYE, etc.
2. **Insurance** - Health, life insurance
3. **Retirement/Pension** - Pension contributions
4. **Loan Repayment** - Salary advance repayment
5. **Other** - NHF, union dues, cooperative, etc.

---

## 🎯 **Common Nigerian Deductions**

### **Statutory Deductions** (Auto):
- ✅ PAYE (7%)
- ✅ Pension (8%)
- ✅ NHF (2.5%)

### **Optional Deductions** (Add Manually):

1. **NSITF (Employees' Compensation)** - ₦1,000-₦5,000
   - Workplace injury insurance
   - Type: Insurance

2. **ITF (Industrial Training Fund)** - 1%
   - Staff training and development
   - Type: Other

3. **Cooperative Society** - Variable
   - Monthly savings contribution
   - Type: Other

4. **Union Dues** - Variable
   - Trade union membership
   - Type: Other

5. **Loan Repayments** - Variable
   - Salary advance, car loan, etc.
   - Type: Loan Repayment

6. **HMO (Health Insurance)** - Variable
   - Private health insurance
   - Type: Insurance

---

## 💡 **Smart Features**

### **Description Field**:
Every deduction now has an optional description field:
```
Name: NHF
Amount: ₦12,500
Type: Other
Description: National Housing Fund contribution (2.5%)
```

Benefits:
- ✅ Clarify what the deduction is for
- ✅ Track deduction details
- ✅ Helpful for payslip generation
- ✅ Audit trail

### **Flexible Amount Entry**:
You can:
- Use auto-calculated amount
- Manually override any amount
- Add percentage in description for reference

---

## 🧮 **Nigerian Payroll Calculation**

### **Full Example**:

```
EMPLOYEE: Victoria Fakunle
LOCATION: Lagos, Nigeria
EMPLOYMENT TYPE: Full-time
BASE SALARY: ₦500,000
↓
EARNINGS:
Base Salary:              ₦500,000
Overtime:                 ₦50,000
Bonuses:                  ₦100,000
Allowances:
  - Transportation:       ₦30,000
  - Meal:                 ₦20,000
  - Housing:              ₦100,000
-----------------------------------
GROSS PAY:                ₦800,000
↓
DEDUCTIONS:
PAYE (7%):                ₦35,000
Pension (8%):             ₦40,000
NHF (2.5%):               ₦12,500
HMO (manual):             ₦15,000
-----------------------------------
TOTAL DEDUCTIONS:         ₦102,500
↓
NET PAY:                  ₦697,500
```

---

## 🔧 **Customization**

### **Adjust Tax Rates**:
File: `hr-platform/src/pages/Hr/Payroll/Payroll.tsx`
Function: `autoAddStandardDeductionsWithSalary()`

```typescript
// Nigerian rates (lines ~541-561)
PAYE:    baseSalary * 0.07   (7%)
Pension: baseSalary * 0.08   (8%)
NHF:     baseSalary * 0.025  (2.5%)
```

### **Add More Standard Deductions**:
```typescript
// In addNigerianDeductions() function
standardDeductions.push({
  id: `deduct-ng-${Date.now()}-4`,
  name: 'ITF (Industrial Training Fund)',
  amount: Math.round(baseSalary * 0.01), // 1%
  type: 'other',
  description: 'Industrial Training Fund'
});
```

---

## 📊 **Tax Rate Reference**

### **Nigeria** 🇳🇬:
| Deduction | Rate | Type |
|-----------|------|------|
| PAYE | 7% | Tax |
| Pension (Employee) | 8% | Retirement |
| Pension (Employer) | 10% | N/A (Not deducted from employee) |
| NHF | 2.5% | Other |
| **TOTAL** | **17.5%** | - |

### **International/US** 🇺🇸:
| Deduction | Rate | Type |
|-----------|------|------|
| Federal Tax | 12% | Tax |
| State Tax | 5% | Tax |
| Social Security | 6.2% | Tax |
| Medicare | 1.45% | Tax |
| **TOTAL** | **24.65%** | - |

---

## 🎯 **Best Practices**

1. **Use Auto-Detection**:
   - Set employee location correctly
   - System will auto-apply correct tax system

2. **Review Auto-Added Deductions**:
   - Always check amounts are correct
   - Adjust if employee has exemptions

3. **Add Company-Specific Deductions**:
   - Health insurance
   - Life insurance
   - Cooperative contributions
   - Loan repayments

4. **Use Descriptions**:
   - Add notes for clarity
   - Helpful for employee payslips
   - Good for audits

---

## 🚀 **Quick Add Nigerian Deductions**

There's a dedicated button for quickly adding all Nigerian statutory deductions:

```
1. Go to "Deductions" tab
2. Click "🇳🇬 Add Nigerian Deductions" button
3. PAYE, Pension, NHF added instantly
4. Amounts calculated based on current base salary
5. Adjust if needed
```

---

## 📝 **Console Debug Output**

When you select a Nigerian-based employee:

```
👤 Selected employee: { ... }
🔍 Full employee profile loaded: { ... }
💰 Full profile salary check: { workInfo.salary, extractedSalary, ... }
📅 Full profile hire date check: { workInfo.hireDate, ... }
💼 Employment Type: full-time | Base Salary: 500000
🇳🇬 Using Nigerian tax system
✅ Auto-added 3 standard deductions based on salary ₦500000
```

---

## 🎊 **Summary**

### **What's New**:
✅ Nigerian tax system support (PAYE, Pension, NHF)  
✅ Auto-detection based on location  
✅ Quick-add button for Nigerian deductions  
✅ Description field for all deductions  
✅ Custom deduction support  
✅ Flexible amounts (auto-calc or manual)  

### **Supported Countries**:
- 🇳🇬 Nigeria (PAYE, Pension, NHF)
- 🇺🇸 United States (Federal, State, FICA)
- 🌍 International (configurable)

---

**Your payroll system now supports both Nigerian and International tax systems! 🎉**

