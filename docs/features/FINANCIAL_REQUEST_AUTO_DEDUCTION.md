# Financial Request Auto-Deduction System

## ✅ Implementation Complete!

### 🎯 Overview
The system now automatically deducts approved financial requests (salary advances & loans) from employees' monthly payroll. This eliminates manual tracking and ensures timely recovery of loans and advances.

---

## 🔄 Complete Workflow

### **Step 1: Employee Submits Request**
Employee goes to their payroll page and submits a financial request:

1. **Select Request Type**:
   - Salary Advance
   - Loan  
   - Reimbursement
   - Allowance Request

2. **Enter Amount**: e.g., ₦100,000

3. **Provide Reason**: Detailed explanation

4. **Choose Repayment Plan** (for Loans & Advances):
   - **Full Amount (Next Salary)**: Entire amount deducted next month
   - **Monthly Installments**: Spread over multiple months (1-12)
   
5. **Specify Installment Months** (if installments selected):
   - Enter number of months (1-12)
   - System calculates: ₦100,000 ÷ 4 months = ₦25,000/month

6. **Submit** → Status: **Pending**

---

### **Step 2: HR Reviews & Approves**
HR Manager reviews the request in HR Payroll → Financial Requests section:

1. **View Request Details**:
   - Employee name & ID
   - Request type & amount
   - Reason & attachments
   - Repayment plan

2. **Make Decision**:
   - Click **"Approve"** → Status: **Approved**
   - Click **"Reject"** → Status: **Rejected**

3. **Process Payment**:
   - Mark as **"Paid"** → Status: **Paid**
   - Money is given to employee
   - System tracks: `paidAt` date

---

### **Step 3: Auto-Deduction When Creating Payroll**
When HR creates next month's payroll for the employee:

1. **HR Selects Employee**: Choose employee from dropdown

2. **System Auto-Fetches**:
   - Employee base salary
   - Department, position
   - Currency (NGN)
   - **Approved financial requests needing recovery**

3. **Auto-Adds Deductions**:
   ```
   DEDUCTION ADDED:
   Name: "Loan Repayment"
   Amount: ₦25,000 (installment) or ₦100,000 (full)
   Type: loan
   Description: "Installment 1/4 - Medical emergency expenses..."
   ```

4. **Toast Notification**:
   > "Auto-added Deductions: 1 financial request deduction(s) added automatically."

5. **HR Reviews** deductions in the Deductions tab:
   - Can see all auto-added loan/advance deductions
   - Can add/remove custom deductions
   - System calculates new net pay automatically

6. **HR Creates Payroll**:
   - Gross Pay: ₦150,000
   - Tax (PAYE 7%): -₦10,500
   - Pension (8%): -₦12,000
   - NHF (2.5%): -₦3,750
   - **Loan Repayment**: -₦25,000 ⬅️ **AUTO-ADDED**
   - **Net Pay**: ₦98,750

---

### **Step 4: System Updates Request Status**
After payroll is created, the system automatically:

1. **Updates Financial Request**:
   - `amountRecovered`: ₦0 → ₦25,000
   - `remainingBalance`: ₦100,000 → ₦75,000
   - `status`: 'paid' → **'recovering'**
   - `linkedPayrollIds`: [payroll-001]
   - `recoveryStartDate`: 2025-10-01

2. **Console Log**:
   ```
   ✅ Updated financial request abc123: 
      ₦25,000 recovered, ₦75,000 remaining
   ```

3. **Employee Sees**:
   - Payslip shows deduction
   - Financial request status: **Recovering**
   - Progress: "₦25,000 / ₦100,000 recovered"

---

### **Step 5: Subsequent Months**
Next 3 months, the process repeats:

**Month 2:**
- HR creates payroll → System auto-adds ₦25,000 deduction
- `amountRecovered`: ₦50,000
- `remainingBalance`: ₦50,000
- Status: **Recovering**

**Month 3:**
- Auto-adds ₦25,000
- `amountRecovered`: ₦75,000
- `remainingBalance`: ₦25,000
- Status: **Recovering**

**Month 4 (Final):**
- Auto-adds ₦25,000
- `amountRecovered`: ₦100,000
- `remainingBalance`: ₦0
- Status: **'Completed'** ✅
- `recoveryCompleteDate`: 2026-01-01

---

## 📊 Data Structure

### FinancialRequest Interface (Enhanced)
```typescript
{
  id: string;
  employeeId: string;
  employeeName: string;
  requestType: 'advance' | 'loan' | 'reimbursement' | 'allowance';
  amount: number;
  reason: string;
  status: 'pending' | 'approved' | 'rejected' | 'paid' | 'recovering' | 'completed';
  
  // Approval Info
  approvedBy?: string;
  approvedAt?: Date;
  
  // Payment Info
  paidAt?: Date;
  
  // 🆕 Repayment Info
  repaymentType?: 'full' | 'installments';
  installmentMonths?: number;           // e.g., 4
  installmentAmount?: number;           // e.g., ₦25,000
  amountRecovered?: number;             // e.g., ₦50,000
  remainingBalance?: number;            // e.g., ₦50,000
  recoveryStartDate?: Date;
  recoveryCompleteDate?: Date;
  linkedPayrollIds?: string[];          // ['payroll-001', 'payroll-002']
}
```

---

## 🎨 UI Features

### Employee Form (Request Submission)
```
┌─────────────────────────────────────────────┐
│ New Financial Request                       │
├─────────────────────────────────────────────┤
│ Request Type: [Loan ▼]                      │
│ Amount (₦): [100,000]                       │
│ Reason: [Medical emergency expenses...]     │
│                                             │
│ ┌──────────────────────────────────────┐   │
│ │ 📅 Repayment Plan                    │   │
│ ├──────────────────────────────────────┤   │
│ │ How would you like to repay?         │   │
│ │ ○ Full Amount (Next Salary)          │   │
│ │ ● Monthly Installments               │   │
│ │                                       │   │
│ │ Number of Months: [4]                │   │
│ │ ℹ️ ₦25,000/month for 4 months        │   │
│ └──────────────────────────────────────┘   │
│                                             │
│ [Cancel]  [Submit Request]                  │
└─────────────────────────────────────────────┘
```

### HR Payroll Form (Auto-Deduction)
```
┌─────────────────────────────────────────────┐
│ Create Payroll Record - John Doe            │
├─────────────────────────────────────────────┤
│ Tabs: [Basic] [Earnings] [Allowances] [Deductions] │
│                                             │
│ Deductions Tab:                             │
│ ┌──────────────────────────────────────┐   │
│ │ ✅ Auto-added 1 financial request    │   │
│ │    deduction(s)                      │   │
│ └──────────────────────────────────────┘   │
│                                             │
│ 1. PAYE (Pay As You Earn)                   │
│    ₦10,500 (7% of salary)                   │
│                                             │
│ 2. Pension (Employee)                       │
│    ₦12,000 (8% of salary)                   │
│                                             │
│ 3. 🆕 Loan Repayment                        │
│    ₦25,000                                  │
│    Installment 1/4 - Medical emergency...   │
│    [Remove]                                 │
│                                             │
│ Total Deductions: ₦51,250                   │
│ Net Pay: ₦98,750                            │
└─────────────────────────────────────────────┘
```

### Financial Requests Table (HR View)
```
┌─────────────────────────────────────────────────────┐
│ Employee    │ Type │ Amount     │ Status     │ Progress│
├─────────────┼──────┼────────────┼────────────┼─────────┤
│ John Doe    │ Loan │ ₦100,000   │ Recovering │ 50%     │
│             │      │            │ (₦50k/₦100k)│         │
│ Jane Smith  │ Adv  │ ₦50,000    │ Completed  │ 100%    │
│ Bob Johnson │ Loan │ ₦200,000   │ Paid       │ 0%      │
└─────────────────────────────────────────────────────┘
```

---

## 🔧 Technical Implementation

### Auto-Deduction Function
```typescript
const autoAddFinancialDeductions = async (employeeId: string) => {
  // 1. Fetch all financial requests for employee
  const requests = await payrollService.getFinancialRequestsByEmployee(employeeId);
  
  // 2. Filter for loans/advances that need recovery
  const pendingRecovery = requests.filter(req => 
    (req.requestType === 'loan' || req.requestType === 'advance') &&
    (req.status === 'paid' || req.status === 'recovering') &&
    req.remainingBalance > 0
  );
  
  // 3. Create deductions
  for (const request of pendingRecovery) {
    const deductAmount = request.installmentAmount || request.remainingBalance;
    
    autoDeductions.push({
      id: `fin-req-${request.id}`,
      name: `${request.requestType === 'loan' ? 'Loan' : 'Advance'} Repayment`,
      amount: Math.min(deductAmount, request.remainingBalance),
      type: 'loan',
      description: `Installment X/Y - ${request.reason}...`
    });
  }
  
  // 4. Add to payroll form
  setPayrollForm(prev => ({
    ...prev,
    deductions: [...prev.deductions, ...autoDeductions]
  }));
};
```

### Update Request After Payroll Creation
```typescript
// After creating payroll
for (const deduction of financialDeductions) {
  const request = findRequest(deduction.id);
  
  await payrollService.updateFinancialRequest(request.id, {
    amountRecovered: request.amountRecovered + deduction.amount,
    remainingBalance: request.remainingBalance - deduction.amount,
    linkedPayrollIds: [...request.linkedPayrollIds, newPayrollId],
    status: remainingBalance <= 0 ? 'completed' : 'recovering',
    recoveryStartDate: request.recoveryStartDate || new Date(),
    recoveryCompleteDate: remainingBalance <= 0 ? new Date() : undefined
  });
}
```

---

## 🎬 Example Scenarios

### Scenario 1: Salary Advance (Full Repayment)
```
Employee requests ₦30,000 salary advance for rent
→ Chooses "Full Amount (Next Salary)"
→ HR approves & pays ₦30,000
→ Next payroll: ₦30,000 auto-deducted
→ Status: Completed ✅
```

### Scenario 2: Loan (6-Month Installments)
```
Employee requests ₦120,000 loan for car repair
→ Chooses "Monthly Installments" - 6 months
→ System calculates: ₦20,000/month
→ HR approves & pays ₦120,000
→ Month 1: ₦20,000 deducted → ₦100,000 remaining
→ Month 2: ₦20,000 deducted → ₦80,000 remaining
→ ...
→ Month 6: ₦20,000 deducted → ₦0 remaining
→ Status: Completed ✅
```

### Scenario 3: Multiple Active Loans
```
Employee has:
- Loan A: ₦50,000 (₦25k/month x 2) → ₦25,000 remaining
- Advance B: ₦20,000 (full repayment)
  
Next payroll deductions:
- Loan A Repayment: -₦25,000
- Advance B Repayment: -₦20,000
Total deductions from loans: -₦45,000
```

---

## ✨ Benefits

### For HR:
- ✅ **No Manual Tracking**: System remembers all loans/advances
- ✅ **Automatic Calculations**: No need to remember installment amounts
- ✅ **Clear Visibility**: See all pending recoveries in one place
- ✅ **Audit Trail**: `linkedPayrollIds` track every deduction
- ✅ **Progress Monitoring**: Know exactly how much recovered/remaining

### For Employees:
- ✅ **Transparent**: See repayment plan upfront
- ✅ **Flexible**: Choose full or installment repayment
- ✅ **Trackable**: Know progress on loan recovery
- ✅ **Automated**: Don't worry about missing payments
- ✅ **Fair**: Deductions happen consistently

### For Company:
- ✅ **Financial Control**: Ensure all advances/loans are recovered
- ✅ **Reduced Errors**: No manual calculation mistakes
- ✅ **Compliance**: Proper documentation of all transactions
- ✅ **Reports**: Easy to generate loan recovery reports

---

## 🧪 Testing Checklist

- [ ] Submit loan request with full repayment
- [ ] Submit loan request with installments
- [ ] HR approves request
- [ ] HR marks request as paid
- [ ] Create payroll for employee with active loan
- [ ] Verify loan deduction auto-added
- [ ] Check toast notification appears
- [ ] Create payroll and verify request status updates
- [ ] Verify amountRecovered and remainingBalance calculations
- [ ] Complete all installments and verify status = 'completed'
- [ ] Test with multiple active loans
- [ ] Test removing auto-added deduction before submitting payroll

---

## 🚀 Future Enhancements

1. **Email Notifications**: Notify employee when deduction happens
2. **Early Payoff**: Allow employee to pay off loan early
3. **Deduction Limits**: Set maximum % of salary that can be deducted
4. **Grace Period**: Skip 1 month deduction if employee requests
5. **Reports**: Generate loan recovery reports for finance team
6. **Interest Calculation**: Add interest for long-term loans
7. **Partial Payments**: Allow varying installment amounts
8. **Payment Schedule Adjustment**: Let employee change repayment plan

---

## 📝 Summary

The auto-deduction system creates a seamless, automated loop:
1. Employee requests → 2. HR approves → 3. Money paid → 4. Auto-deducted from salary → 5. Request status updated → Repeat until completed

**Zero manual tracking required!** 🎉


