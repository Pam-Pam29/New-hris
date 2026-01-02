import { getServiceConfig } from '../config/firebase';
import { Firestore } from 'firebase/firestore';

// Import unified types
export interface PayrollRecord {
    id: string;
    companyId?: string; // Multi-tenancy: Company ID
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
    companyId?: string; // Multi-tenancy: Company ID
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
    repaymentType?: 'full' | 'installments';
    repaymentMethod?: 'salary_deduction' | 'bank_transfer' | 'cash' | 'mobile_money';
    installmentMonths?: number;
    installmentAmount?: number;
    amountRecovered?: number;
    remainingBalance?: number;
    recoveryStartDate?: Date;
    recoveryCompleteDate?: Date;
    linkedPayrollIds?: string[];

    // Metadata
    createdAt: Date;
    updatedAt: Date;
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
    getPayrollRecords(companyId?: string): Promise<PayrollRecord[]>;
    getPayrollRecord(id: string): Promise<PayrollRecord | null>;
    getPayrollRecordsByEmployee(employeeId: string, companyId?: string): Promise<PayrollRecord[]>;
    createPayrollRecord(record: Omit<PayrollRecord, 'id' | 'createdAt' | 'updatedAt'>): Promise<string>;
    updatePayrollRecord(id: string, record: Partial<PayrollRecord>): Promise<void>;
    deletePayrollRecord(id: string): Promise<void>;
    getPayrollRecordsByDepartment(department: string, companyId?: string): Promise<PayrollRecord[]>;
    getPayrollRecordsByStatus(status: PayrollRecord['paymentStatus'], companyId?: string): Promise<PayrollRecord[]>;

    // Financial Requests
    getFinancialRequests(companyId?: string): Promise<FinancialRequest[]>;
    getFinancialRequestsByEmployee(employeeId: string, companyId?: string): Promise<FinancialRequest[]>;
    createFinancialRequest(request: Omit<FinancialRequest, 'id' | 'createdAt' | 'updatedAt'>): Promise<string>;
    updateFinancialRequest(id: string, request: Partial<FinancialRequest>): Promise<void>;
}

export class FirebasePayrollService implements IPayrollService {
    constructor(private db: Firestore) { }

    async getPayrollRecords(companyId?: string): Promise<PayrollRecord[]> {
        try {
            const { collection, query, where, getDocs } = await import('firebase/firestore');
            const payrollRef = collection(this.db, 'payroll_records');
            
            let q: any = payrollRef;
            if (companyId) {
                q = query(payrollRef, where('companyId', '==', companyId));
                console.log(`🏢 Filtering payroll records by companyId: ${companyId}`);
            }
            
            const snapshot = await getDocs(q);
            let records = snapshot.docs.map(doc => this.docToPayrollRecord(doc));
            
            // Filter by companyId in memory as fallback
            if (companyId) {
                records = records.filter(r => r.companyId === companyId);
            }
            
            console.log(`📊 Loaded ${records.length} payroll records${companyId ? ` for company ${companyId}` : ' (all companies)'}`);
            return records;
        } catch (error) {
            console.error('Error fetching payroll records:', error);
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

    async getPayrollRecordsByEmployee(employeeId: string, companyId?: string): Promise<PayrollRecord[]> {
        try {
            const { collection, query, where, getDocs, orderBy } = await import('firebase/firestore');
            const payrollRef = collection(this.db, 'payroll_records');
            
            let q: any;
            if (companyId) {
                try {
                    q = query(
                        payrollRef,
                        where('companyId', '==', companyId),
                        where('employeeId', '==', employeeId),
                        orderBy('payPeriod.payDate', 'desc')
                    );
                    console.log(`🏢 Filtering employee payroll records by companyId: ${companyId}`);
                } catch (indexError) {
                    // If composite index doesn't exist, filter in memory
                    console.warn('Could not create composite query, filtering in memory');
                    q = query(
                        payrollRef,
                        where('employeeId', '==', employeeId),
                        orderBy('payPeriod.payDate', 'desc')
                    );
                }
            } else {
                q = query(
                    payrollRef,
                    where('employeeId', '==', employeeId),
                    orderBy('payPeriod.payDate', 'desc')
                );
            }
            
            const snapshot = await getDocs(q);
            let records = snapshot.docs.map(doc => this.docToPayrollRecord(doc));
            
            // Filter by companyId in memory if not already filtered (fallback)
            if (companyId) {
                records = records.filter(r => r.companyId === companyId);
            }
            
            console.log(`📊 Loaded ${records.length} payroll records for employee ${employeeId}${companyId ? ` (company ${companyId})` : ''}`);
            return records;
        } catch (error) {
            console.error('Error fetching employee payroll records:', error);
            throw error;
        }
    }

    async createPayrollRecord(record: Omit<PayrollRecord, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
        try {
            const { collection, addDoc, Timestamp } = await import('firebase/firestore');
            const payrollRef = collection(this.db, 'payroll_records');

            const now = Timestamp.now();
            const payrollWithTimestamps = {
                ...record,
                payPeriod: {
                    ...record.payPeriod,
                    startDate: Timestamp.fromDate(record.payPeriod.startDate),
                    endDate: Timestamp.fromDate(record.payPeriod.endDate),
                    payDate: Timestamp.fromDate(record.payPeriod.payDate),
                },
                paymentDate: record.paymentDate ? Timestamp.fromDate(record.paymentDate) : null,
                createdAt: now,
                updatedAt: now
            };

            const docRef = await addDoc(payrollRef, payrollWithTimestamps);
            console.log('✅ Payroll record created:', docRef.id);
            return docRef.id;
        } catch (error) {
            console.error('Error creating payroll record:', error);
            throw error;
        }
    }

    async updatePayrollRecord(id: string, record: Partial<PayrollRecord>): Promise<void> {
        try {
            const { doc, updateDoc, Timestamp } = await import('firebase/firestore');
            const payrollRef = doc(this.db, 'payroll_records', id);

            const dataToUpdate: any = {
                ...record,
                updatedAt: Timestamp.now()
            };

            // Convert Date objects to Firestore Timestamps
            if (record.payPeriod) {
                dataToUpdate.payPeriod = {
                    ...record.payPeriod,
                    startDate: Timestamp.fromDate(record.payPeriod.startDate),
                    endDate: Timestamp.fromDate(record.payPeriod.endDate),
                    payDate: Timestamp.fromDate(record.payPeriod.payDate),
                };
            }

            if (record.paymentDate) {
                dataToUpdate.paymentDate = Timestamp.fromDate(record.paymentDate);
            }

            await updateDoc(payrollRef, dataToUpdate);
            console.log('✅ Payroll record updated:', id);
        } catch (error) {
            console.error(`Error updating payroll record ${id}:`, error);
            throw error;
        }
    }

    async deletePayrollRecord(id: string): Promise<void> {
        try {
            const { doc, deleteDoc } = await import('firebase/firestore');
            const payrollRef = doc(this.db, 'payroll_records', id);
            await deleteDoc(payrollRef);
            console.log('✅ Payroll record deleted:', id);
        } catch (error) {
            console.error(`Error deleting payroll record ${id}:`, error);
            throw error;
        }
    }

    async getPayrollRecordsByDepartment(department: string, companyId?: string): Promise<PayrollRecord[]> {
        try {
            const { collection, query, where, getDocs } = await import('firebase/firestore');
            const payrollRef = collection(this.db, 'payroll_records');
            
            let q: any;
            if (companyId) {
                try {
                    q = query(
                        payrollRef,
                        where('companyId', '==', companyId),
                        where('department', '==', department)
                    );
                    console.log(`🏢 Filtering payroll records by department ${department} and companyId: ${companyId}`);
                } catch (indexError) {
                    // If composite index doesn't exist, filter in memory
                    console.warn('Could not create composite query, filtering in memory');
                    q = query(payrollRef, where('department', '==', department));
                }
            } else {
                q = query(payrollRef, where('department', '==', department));
            }
            
            const snapshot = await getDocs(q);
            let records = snapshot.docs.map(doc => this.docToPayrollRecord(doc));
            
            // Filter by companyId in memory if not already filtered (fallback)
            if (companyId) {
                records = records.filter(r => r.companyId === companyId);
            }
            
            console.log(`📊 Loaded ${records.length} payroll records for department ${department}${companyId ? ` (company ${companyId})` : ''}`);
            return records;
        } catch (error) {
            console.error('Error getting payroll records by department:', error);
            throw error;
        }
    }

    async getPayrollRecordsByStatus(status: PayrollRecord['paymentStatus'], companyId?: string): Promise<PayrollRecord[]> {
        try {
            const { collection, query, where, getDocs } = await import('firebase/firestore');
            const payrollRef = collection(this.db, 'payroll_records');
            
            let q: any;
            if (companyId) {
                try {
                    q = query(
                        payrollRef,
                        where('companyId', '==', companyId),
                        where('paymentStatus', '==', status)
                    );
                    console.log(`🏢 Filtering payroll records by status ${status} and companyId: ${companyId}`);
                } catch (indexError) {
                    // If composite index doesn't exist, filter in memory
                    console.warn('Could not create composite query, filtering in memory');
                    q = query(payrollRef, where('paymentStatus', '==', status));
                }
            } else {
                q = query(payrollRef, where('paymentStatus', '==', status));
            }
            
            const snapshot = await getDocs(q);
            let records = snapshot.docs.map(doc => this.docToPayrollRecord(doc));
            
            // Filter by companyId in memory if not already filtered (fallback)
            if (companyId) {
                records = records.filter(r => r.companyId === companyId);
            }
            
            console.log(`📊 Loaded ${records.length} payroll records with status ${status}${companyId ? ` for company ${companyId}` : ' (all companies)'}`);
            return records;
        } catch (error) {
            console.error('Error getting payroll records by status:', error);
            throw error;
        }
    }

    // Financial Requests
    async getFinancialRequests(companyId?: string): Promise<FinancialRequest[]> {
        try {
            const { collection, query, where, getDocs } = await import('firebase/firestore');
            const requestsRef = collection(this.db, 'financial_requests');
            
            let q: any = requestsRef;
            if (companyId) {
                q = query(requestsRef, where('companyId', '==', companyId));
                console.log(`🏢 Filtering financial requests by companyId: ${companyId}`);
            }
            
            const snapshot = await getDocs(q);
            let requests = snapshot.docs.map(doc => this.docToFinancialRequest(doc));
            
            // Filter by companyId in memory as fallback
            if (companyId) {
                requests = requests.filter(r => r.companyId === companyId);
            }
            
            console.log(`💰 Loaded ${requests.length} financial requests${companyId ? ` for company ${companyId}` : ' (all companies)'}`);
            return requests;
        } catch (error) {
            console.error('Error fetching financial requests:', error);
            throw error;
        }
    }

    async getFinancialRequestsByEmployee(employeeId: string, companyId?: string): Promise<FinancialRequest[]> {
        try {
            const { collection, query, where, getDocs } = await import('firebase/firestore');
            const requestsRef = collection(this.db, 'financial_requests');
            
            let q: any;
            if (companyId) {
                try {
                    q = query(
                        requestsRef,
                        where('companyId', '==', companyId),
                        where('employeeId', '==', employeeId)
                    );
                    console.log(`🏢 Filtering financial requests by employee ${employeeId} and companyId: ${companyId}`);
                } catch (indexError) {
                    // If composite index doesn't exist, filter in memory
                    console.warn('Could not create composite query, filtering in memory');
                    q = query(requestsRef, where('employeeId', '==', employeeId));
                }
            } else {
                q = query(requestsRef, where('employeeId', '==', employeeId));
            }
            
            const snapshot = await getDocs(q);
            // Sort in memory instead of using Firestore orderBy to avoid index requirement
            let requests = snapshot.docs.map(doc => this.docToFinancialRequest(doc));
            
            // Filter by companyId in memory if not already filtered (fallback)
            if (companyId) {
                requests = requests.filter(r => r.companyId === companyId);
            }
            
            requests.sort((a, b) => {
                const dateA = new Date(a.createdAt).getTime();
                const dateB = new Date(b.createdAt).getTime();
                return dateB - dateA; // Descending order (newest first)
            });
            
            console.log(`💰 Loaded ${requests.length} financial requests for employee ${employeeId}${companyId ? ` (company ${companyId})` : ''}`);
            return requests;
        } catch (error) {
            console.error('Error fetching employee financial requests:', error);
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
                approvedAt: request.approvedAt ? Timestamp.fromDate(request.approvedAt) : null,
                paidAt: request.paidAt ? Timestamp.fromDate(request.paidAt) : null,
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

    async updateFinancialRequest(id: string, request: Partial<FinancialRequest>): Promise<void> {
        try {
            const { doc, updateDoc, Timestamp } = await import('firebase/firestore');
            const requestRef = doc(this.db, 'financial_requests', id);

            const dataToUpdate: any = {
                ...request,
                updatedAt: Timestamp.now()
            };

            if (request.approvedAt) {
                dataToUpdate.approvedAt = Timestamp.fromDate(request.approvedAt);
            }
            if (request.paidAt) {
                dataToUpdate.paidAt = Timestamp.fromDate(request.paidAt);
            }

            await updateDoc(requestRef, dataToUpdate);
            console.log('✅ Financial request updated:', id);
        } catch (error) {
            console.error(`Error updating financial request ${id}:`, error);
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
            currency: data.currency || 'NGN', // Default to NGN if not set
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
            // Repayment fields (for loans/advances)
            repaymentType: data.repaymentType,
            repaymentMethod: data.repaymentMethod,
            installmentMonths: data.installmentMonths,
            installmentAmount: data.installmentAmount,
            amountRecovered: data.amountRecovered,
            remainingBalance: data.remainingBalance,
            recoveryStartDate: data.recoveryStartDate ? data.recoveryStartDate.toDate() : undefined,
            recoveryCompleteDate: data.recoveryCompleteDate ? data.recoveryCompleteDate.toDate() : undefined,
            linkedPayrollIds: data.linkedPayrollIds,
            createdAt: data.createdAt.toDate(),
            updatedAt: data.updatedAt.toDate()
        };
    }
}

// Singleton pattern
let payrollService: IPayrollService | null = null;

export const getPayrollService = async (): Promise<IPayrollService> => {
    if (!payrollService) {
        const config = await getServiceConfig();
        if (config.firebase.enabled && config.firebase.db) {
            console.log('🔥 Using Firebase Payroll Service');
            payrollService = new FirebasePayrollService(config.firebase.db);
        } else {
            throw new Error('Firebase not configured for payroll service');
        }
    }
    return payrollService;
};

export { payrollService };
