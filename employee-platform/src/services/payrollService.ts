import { getServiceConfig } from '../config/firebase';
import { Firestore } from 'firebase/firestore';

// Import unified types (same as HR platform)
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

    // Calculations
    grossPay: number;
    totalDeductions: number;
    netPay: number;

    // Payment Info
    paymentStatus: 'pending' | 'processing' | 'paid' | 'cancelled' | 'archived';
    paymentDate: Date | null;
    paymentMethod: 'bank_transfer' | 'check' | 'cash';
    currency: string;

    // Metadata
    createdAt: Date;
    updatedAt: Date;
    createdBy?: string;
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
    status: 'pending' | 'approved' | 'rejected' | 'paid';
    attachments?: string[];
    approvedBy?: string;
    approvedAt?: Date;
    rejectionReason?: string;
    paidAt?: Date;
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

// Helper functions
export function calculateGrossPay(record: Partial<PayrollRecord>): number {
    const base = record.baseSalary || 0;
    const overtime = record.overtime || 0;
    const bonuses = record.bonuses || 0;
    const allowancesTotal = record.allowances?.reduce((sum, a) => sum + a.amount, 0) || 0;
    return base + overtime + bonuses + allowancesTotal;
}

export function calculateTotalDeductions(record: Partial<PayrollRecord>): number {
    return record.deductions?.reduce((sum, d) => sum + d.amount, 0) || 0;
}

export function calculateNetPay(record: Partial<PayrollRecord>): number {
    const gross = calculateGrossPay(record);
    const totalDed = calculateTotalDeductions(record);
    return gross - totalDed;
}

export interface IPayrollService {
    // Payroll Records (Employee only sees their own)
    getMyPayrollRecords(employeeId: string): Promise<PayrollRecord[]>;
    getPayrollRecord(id: string): Promise<PayrollRecord | null>;

    // Financial Requests
    getMyFinancialRequests(employeeId: string): Promise<FinancialRequest[]>;
    createFinancialRequest(request: Omit<FinancialRequest, 'id' | 'createdAt' | 'updatedAt'>): Promise<string>;

    // Benefits
    getMyBenefits(employeeId: string): Promise<BenefitsEnrollment[]>;
}

export class FirebasePayrollService implements IPayrollService {
    constructor(private db: Firestore) { }

    async getMyPayrollRecords(employeeId: string): Promise<PayrollRecord[]> {
        try {
            const { collection, query, where, getDocs } = await import('firebase/firestore');
            const payrollRef = collection(this.db, 'payroll_records');
            const q = query(
                payrollRef,
                where('employeeId', '==', employeeId)
            );
            const snapshot = await getDocs(q);
            // Sort in memory instead of using Firestore orderBy to avoid index requirement
            const records = snapshot.docs.map(doc => this.docToPayrollRecord(doc));
            return records.sort((a, b) => {
                const dateA = new Date(a.payPeriod.payDate).getTime();
                const dateB = new Date(b.payPeriod.payDate).getTime();
                return dateB - dateA; // Descending order
            });
        } catch (error) {
            console.error('Error fetching my payroll records:', error);
            throw error;
        }
    }

    async getPayrollRecord(id: string): Promise<PayrollRecord | null> {
        try {
            const { doc, getDoc } = await import('firebase/firestore');
            const payrollRef = doc(this.db, 'payroll_records', id);
            const snapshot = await getDoc(payrollRef);

            if (!snapshot.exists()) {
                return null;
            }

            return this.docToPayrollRecord(snapshot);
        } catch (error) {
            console.error(`Error fetching payroll record ${id}:`, error);
            throw error;
        }
    }

    async getMyFinancialRequests(employeeId: string): Promise<FinancialRequest[]> {
        try {
            const { collection, query, where, getDocs } = await import('firebase/firestore');
            const requestsRef = collection(this.db, 'financial_requests');
            const q = query(
                requestsRef,
                where('employeeId', '==', employeeId)
            );
            const snapshot = await getDocs(q);
            // Sort in memory instead of using Firestore orderBy to avoid index requirement
            const requests = snapshot.docs.map(doc => this.docToFinancialRequest(doc));
            return requests.sort((a, b) => {
                const dateA = new Date(a.createdAt).getTime();
                const dateB = new Date(b.createdAt).getTime();
                return dateB - dateA; // Descending order (newest first)
            });
        } catch (error) {
            console.error('Error fetching my financial requests:', error);
            throw error;
        }
    }

    async createFinancialRequest(request: Omit<FinancialRequest, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
        try {
            const { collection, addDoc, Timestamp } = await import('firebase/firestore');
            const requestsRef = collection(this.db, 'financial_requests');

            const now = Timestamp.now();
            const requestWithTimestamps = {
                ...request,
                status: 'pending', // Always starts as pending
                createdAt: now,
                updatedAt: now
            };

            const docRef = await addDoc(requestsRef, requestWithTimestamps);
            console.log('✅ Financial request created:', docRef.id);
            return docRef.id;
        } catch (error) {
            console.error('Error creating financial request:', error);
            throw error;
        }
    }

    async getMyBenefits(employeeId: string): Promise<BenefitsEnrollment[]> {
        try {
            const { collection, query, where, getDocs } = await import('firebase/firestore');
            const benefitsRef = collection(this.db, 'benefits_enrollments');
            const q = query(
                benefitsRef,
                where('employeeId', '==', employeeId)
            );
            const snapshot = await getDocs(q);
            return snapshot.docs.map(doc => this.docToBenefitsEnrollment(doc));
        } catch (error) {
            console.error('Error fetching my benefits:', error);
            throw error;
        }
    }

    // Helper methods
    private docToPayrollRecord(doc: any): PayrollRecord {
        const data = doc.data();
        return {
            id: doc.id,
            employeeId: data.employeeId,
            employeeName: data.employeeName,
            department: data.department,
            position: data.position,
            payPeriod: {
                id: data.payPeriod.id,
                startDate: data.payPeriod.startDate.toDate(),
                endDate: data.payPeriod.endDate.toDate(),
                payDate: data.payPeriod.payDate.toDate(),
                type: data.payPeriod.type,
                status: data.payPeriod.status
            },
            baseSalary: data.baseSalary,
            overtime: data.overtime || 0,
            bonuses: data.bonuses || 0,
            allowances: data.allowances || [],
            deductions: data.deductions || [],
            grossPay: data.grossPay,
            totalDeductions: data.totalDeductions,
            netPay: data.netPay,
            paymentStatus: data.paymentStatus,
            paymentDate: data.paymentDate ? data.paymentDate.toDate() : null,
            paymentMethod: data.paymentMethod,
            currency: data.currency,
            createdAt: data.createdAt.toDate(),
            updatedAt: data.updatedAt.toDate(),
            createdBy: data.createdBy,
            notes: data.notes
        };
    }

    private docToFinancialRequest(doc: any): FinancialRequest {
        const data = doc.data();
        return {
            id: doc.id,
            employeeId: data.employeeId,
            employeeName: data.employeeName,
            requestType: data.requestType,
            amount: data.amount,
            reason: data.reason,
            status: data.status,
            attachments: data.attachments,
            approvedBy: data.approvedBy,
            approvedAt: data.approvedAt ? data.approvedAt.toDate() : undefined,
            rejectionReason: data.rejectionReason,
            paidAt: data.paidAt ? data.paidAt.toDate() : undefined,
            createdAt: data.createdAt.toDate(),
            updatedAt: data.updatedAt.toDate()
        };
    }

    private docToBenefitsEnrollment(doc: any): BenefitsEnrollment {
        const data = doc.data();
        return {
            id: doc.id,
            employeeId: data.employeeId,
            benefitType: data.benefitType,
            provider: data.provider,
            enrollmentStatus: data.enrollmentStatus,
            contribution: data.contribution,
            employerContribution: data.employerContribution,
            effectiveDate: data.effectiveDate.toDate(),
            coverage: data.coverage,
            beneficiaries: data.beneficiaries
        };
    }
}

// Singleton pattern
let payrollService: IPayrollService | null = null;

export const getPayrollService = async (): Promise<IPayrollService> => {
    if (!payrollService) {
        const config = await getServiceConfig();
        if (config.firebase.enabled && config.firebase.db) {
            console.log('🔥 Using Firebase Payroll Service (Employee)');
            payrollService = new FirebasePayrollService(config.firebase.db);
        } else {
            throw new Error('Firebase not configured for payroll service');
        }
    }
    return payrollService;
};

export { payrollService };
