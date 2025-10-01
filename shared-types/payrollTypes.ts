/**
 * Shared Payroll Types for HR and Employee Platforms
 * This ensures both platforms use the same data structure
 */

export interface PayrollRecord {
    id: string;
    employeeId: string;
    employeeName: string;
    department: string;
    position: string;

    // Pay Period
    payPeriod: PayPeriod;

    // Earnings
    baseSalary: number;
    overtime: number;
    bonuses: number;
    allowances: Allowance[];

    // Deductions
    deductions: Deduction[];

    // Calculations (auto-calculated)
    grossPay: number;  // baseSalary + overtime + bonuses + sum(allowances)
    totalDeductions: number;  // sum(deductions)
    netPay: number;  // grossPay - totalDeductions

    // Payment Info
    paymentStatus: 'pending' | 'processing' | 'paid' | 'cancelled' | 'archived';
    paymentDate: Date | null;
    paymentMethod: 'bank_transfer' | 'check' | 'cash';
    currency: string;

    // Metadata
    createdAt: Date;
    updatedAt: Date;
    createdBy?: string;  // HR user who created it
    notes?: string;
}

export interface PayPeriod {
    id: string;
    startDate: Date;
    endDate: Date;
    payDate: Date;
    type: 'weekly' | 'biweekly' | 'monthly' | 'semimonthly';
    status: 'open' | 'closed' | 'paid';
}

export interface Allowance {
    id: string;
    name: string;
    amount: number;
    type: 'fixed' | 'variable';
    taxable: boolean;
    description?: string;
}

export interface Deduction {
    id: string;
    name: string;
    amount: number;
    type: 'tax' | 'insurance' | 'retirement' | 'loan' | 'other';
    description?: string;
}

export interface FinancialRequest {
    id: string;
    employeeId: string;
    employeeName: string;
    requestType: 'advance' | 'loan' | 'reimbursement' | 'allowance';
    amount: number;
    reason: string;
    status: 'pending' | 'approved' | 'rejected' | 'paid' | 'recovering' | 'completed';
    attachments?: string[];

    // Approval Info
    approvedBy?: string;
    approvedAt?: Date;
    rejectionReason?: string;

    // Payment Info
    paidAt?: Date;

    // Repayment Info (for loans and advances)
    repaymentType?: 'full' | 'installments'; // Pay back in full next month or over time
    repaymentMethod?: 'salary_deduction' | 'bank_transfer' | 'cash' | 'mobile_money'; // How to repay
    installmentMonths?: number; // Number of months to repay (for loans)
    installmentAmount?: number; // Amount per month
    amountRecovered?: number; // How much has been deducted so far
    remainingBalance?: number; // How much is left to recover
    recoveryStartDate?: Date; // When deductions started
    recoveryCompleteDate?: Date; // When fully recovered
    linkedPayrollIds?: string[]; // IDs of payroll records where deductions were made

    // Metadata
    createdAt: Date;
    updatedAt: Date;
}

export interface BenefitsEnrollment {
    id: string;
    employeeId: string;
    benefitType: string;
    provider: string;
    enrollmentStatus: 'active' | 'inactive' | 'pending';
    contribution: number;
    employerContribution: number;
    effectiveDate: Date;
    coverage: string;
    beneficiaries?: Beneficiary[];
}

export interface Beneficiary {
    id: string;
    name: string;
    relationship: string;
    percentage: number;
}

// Helper function to calculate gross pay
export function calculateGrossPay(record: Partial<PayrollRecord>): number {
    const base = record.baseSalary || 0;
    const overtime = record.overtime || 0;
    const bonuses = record.bonuses || 0;
    const allowancesTotal = record.allowances?.reduce((sum, a) => sum + a.amount, 0) || 0;

    return base + overtime + bonuses + allowancesTotal;
}

// Helper function to calculate total deductions
export function calculateTotalDeductions(record: Partial<PayrollRecord>): number {
    return record.deductions?.reduce((sum, d) => sum + d.amount, 0) || 0;
}

// Helper function to calculate net pay
export function calculateNetPay(record: Partial<PayrollRecord>): number {
    const gross = calculateGrossPay(record);
    const deductions = calculateTotalDeductions(record);

    return gross - deductions;
}

// Default allowance templates
export const DEFAULT_ALLOWANCES = [
    { name: 'Transportation Allowance', type: 'fixed' as const, taxable: true },
    { name: 'Meal Allowance', type: 'fixed' as const, taxable: false },
    { name: 'Housing Allowance', type: 'fixed' as const, taxable: true },
    { name: 'Phone Allowance', type: 'fixed' as const, taxable: false },
    { name: 'Internet Allowance', type: 'fixed' as const, taxable: false },
    { name: 'Education Allowance', type: 'variable' as const, taxable: false },
];

// Default deduction templates
export const DEFAULT_DEDUCTIONS = [
    { name: 'Federal Tax', type: 'tax' as const },
    { name: 'State Tax', type: 'tax' as const },
    { name: 'Social Security', type: 'tax' as const },
    { name: 'Medicare', type: 'tax' as const },
    { name: 'Health Insurance', type: 'insurance' as const },
    { name: 'Dental Insurance', type: 'insurance' as const },
    { name: '401k Contribution', type: 'retirement' as const },
];

