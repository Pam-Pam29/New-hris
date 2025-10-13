import { getServiceConfig } from '../config/firebase';
import { Firestore } from 'firebase/firestore';

export interface PayrollRecord {
    id: string;
    employeeId: string;
    employeeName: string;
    department: string;
    position: string;
    baseSalary: number;
    bonus: number;
    deductions: number;
    netPay: number;
    payPeriod: string;
    paymentDate: Date | null;
    status: 'pending' | 'processing' | 'paid' | 'cancelled' | 'archived';
    createdAt?: Date;
    updatedAt?: Date;
}

export interface IPayrollService {
    getPayrollRecords(): Promise<PayrollRecord[]>;
    getPayrollRecord(id: string): Promise<PayrollRecord | null>;
    createPayrollRecord(record: Omit<PayrollRecord, 'id'>): Promise<string>;
    updatePayrollRecord(id: string, record: Partial<PayrollRecord>): Promise<void>;
    deletePayrollRecord(id: string): Promise<void>;
    getPayrollRecordsByDepartment(department: string): Promise<PayrollRecord[]>;
    getPayrollRecordsByStatus(status: PayrollRecord['status']): Promise<PayrollRecord[]>;
}

export class FirebasePayrollService implements IPayrollService {
    constructor(private db: Firestore) { }

    async getPayrollRecords(): Promise<PayrollRecord[]> {
        try {
            const { collection, getDocs, Timestamp } = await import('firebase/firestore');
            const payrollRef = collection(this.db, 'payroll_records');
            const snapshot = await getDocs(payrollRef);
            return snapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    id: doc.id,
                    employeeId: data.employeeId,
                    employeeName: data.employeeName,
                    department: data.department,
                    position: data.position,
                    baseSalary: data.baseSalary,
                    bonus: data.bonus,
                    deductions: data.deductions,
                    netPay: data.netPay,
                    payPeriod: data.payPeriod,
                    paymentDate: data.paymentDate ? data.paymentDate.toDate() : null,
                    status: data.status,
                    createdAt: data.createdAt ? data.createdAt.toDate() : new Date(),
                    updatedAt: data.updatedAt ? data.updatedAt.toDate() : new Date()
                } as PayrollRecord;
            });
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
            
            const data = snapshot.data();
            return {
                id: snapshot.id,
                employeeId: data.employeeId,
                employeeName: data.employeeName,
                department: data.department,
                position: data.position,
                baseSalary: data.baseSalary,
                bonus: data.bonus,
                deductions: data.deductions,
                netPay: data.netPay,
                payPeriod: data.payPeriod,
                paymentDate: data.paymentDate ? data.paymentDate.toDate() : null,
                status: data.status,
                createdAt: data.createdAt ? data.createdAt.toDate() : new Date(),
                updatedAt: data.updatedAt ? data.updatedAt.toDate() : new Date()
            } as PayrollRecord;
        } catch (error) {
            console.error(`Error fetching payroll record ${id}:`, error);
            throw error;
        }
    }

    async createPayrollRecord(record: Omit<PayrollRecord, 'id'>): Promise<string> {
        try {
            const { collection, addDoc, Timestamp } = await import('firebase/firestore');
            const payrollRef = collection(this.db, 'payroll_records');
            
            // Add timestamps
            const now = Timestamp.now();
            const payrollWithTimestamps = {
                ...record,
                paymentDate: record.paymentDate ? Timestamp.fromDate(record.paymentDate) : null,
                createdAt: now,
                updatedAt: now
            };
            
            const docRef = await addDoc(payrollRef, payrollWithTimestamps);
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
            
            // Add updated timestamp
            const dataToUpdate = {
                ...record,
                updatedAt: Timestamp.now()
            };
            
            // Convert Date objects to Firestore Timestamps
            if (record.paymentDate) {
                dataToUpdate.paymentDate = Timestamp.fromDate(record.paymentDate);
            }
            
            await updateDoc(payrollRef, dataToUpdate);
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
        } catch (error) {
            console.error(`Error deleting payroll record ${id}:`, error);
            throw error;
        }
    }
    
    // Get payroll records by department
    async getPayrollRecordsByDepartment(department: string): Promise<PayrollRecord[]> {
        try {
            const { collection, query, where, getDocs } = await import('firebase/firestore');
            const payrollRef = collection(this.db, 'payroll_records');
            const q = query(payrollRef, where('department', '==', department));
            const snapshot = await getDocs(q);
            
            return snapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    id: doc.id,
                    employeeId: data.employeeId,
                    employeeName: data.employeeName,
                    department: data.department,
                    position: data.position,
                    baseSalary: data.baseSalary,
                    bonus: data.bonus,
                    deductions: data.deductions,
                    netPay: data.netPay,
                    payPeriod: data.payPeriod,
                    paymentDate: data.paymentDate ? data.paymentDate.toDate() : null,
                    status: data.status,
                    createdAt: data.createdAt ? data.createdAt.toDate() : new Date(),
                    updatedAt: data.updatedAt ? data.updatedAt.toDate() : new Date()
                } as PayrollRecord;
            });
        } catch (error) {
            console.error('Error getting payroll records by department:', error);
            throw error;
        }
    }
    
    // Get payroll records by status
    async getPayrollRecordsByStatus(status: PayrollRecord['status']): Promise<PayrollRecord[]> {
        try {
            const { collection, query, where, getDocs } = await import('firebase/firestore');
            const payrollRef = collection(this.db, 'payroll_records');
            const q = query(payrollRef, where('status', '==', status));
            const snapshot = await getDocs(q);
            
            return snapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    id: doc.id,
                    employeeId: data.employeeId,
                    employeeName: data.employeeName,
                    department: data.department,
                    position: data.position,
                    baseSalary: data.baseSalary,
                    bonus: data.bonus,
                    deductions: data.deductions,
                    netPay: data.netPay,
                    payPeriod: data.payPeriod,
                    paymentDate: data.paymentDate ? data.paymentDate.toDate() : null,
                    status: data.status,
                    createdAt: data.createdAt ? data.createdAt.toDate() : new Date(),
                    updatedAt: data.updatedAt ? data.updatedAt.toDate() : new Date()
                } as PayrollRecord;
            });
        } catch (error) {
            console.error('Error getting payroll records by status:', error);
            throw error;
        }
    }
}

export class MockPayrollService implements IPayrollService {
    private mockRecords: PayrollRecord[] = [
        {
            id: 'mock-id-1',
            employeeId: 'emp-001',
            employeeName: 'John Doe',
            department: 'Engineering',
            position: 'Software Engineer',
            baseSalary: 5000,
            bonus: 500,
            deductions: 1000,
            netPay: 4500,
            payPeriod: 'January 2023',
            paymentDate: new Date('2023-01-31'),
            status: 'paid',
            createdAt: new Date('2023-01-15'),
            updatedAt: new Date('2023-01-15')
        },
        {
            id: 'mock-id-2',
            employeeId: 'emp-002',
            employeeName: 'Jane Smith',
            department: 'Marketing',
            position: 'Marketing Manager',
            baseSalary: 6000,
            bonus: 1000,
            deductions: 1500,
            netPay: 5500,
            payPeriod: 'January 2023',
            paymentDate: new Date('2023-01-31'),
            status: 'paid',
            createdAt: new Date('2023-01-15'),
            updatedAt: new Date('2023-01-15')
        },
        {
            id: 'mock-id-3',
            employeeId: 'emp-003',
            employeeName: 'Bob Johnson',
            department: 'Finance',
            position: 'Financial Analyst',
            baseSalary: 5500,
            bonus: 800,
            deductions: 1200,
            netPay: 5100,
            payPeriod: 'February 2023',
            paymentDate: null,
            status: 'pending',
            createdAt: new Date('2023-02-01'),
            updatedAt: new Date('2023-02-01')
        }
    ];
    
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async getPayrollRecords(): Promise<PayrollRecord[]> {
        return [...this.mockRecords];
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async getPayrollRecord(id: string): Promise<PayrollRecord | null> {
        const record = this.mockRecords.find(r => r.id === id);
        return record ? {...record} : null;
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async createPayrollRecord(record: Omit<PayrollRecord, 'id'>): Promise<string> {
        const id = `mock-id-${this.mockRecords.length + 1}`;
        const now = new Date();
        const newRecord = {
            ...record,
            id,
            createdAt: now,
            updatedAt: now
        } as PayrollRecord;
        
        this.mockRecords.push(newRecord);
        return id;
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async updatePayrollRecord(id: string, record: Partial<PayrollRecord>): Promise<void> {
        const index = this.mockRecords.findIndex(r => r.id === id);
        if (index !== -1) {
            this.mockRecords[index] = {
                ...this.mockRecords[index],
                ...record,
                updatedAt: new Date()
            };
        }
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async deletePayrollRecord(id: string): Promise<void> {
        const index = this.mockRecords.findIndex(r => r.id === id);
        if (index !== -1) {
            this.mockRecords.splice(index, 1);
        }
    }
    
    // Get payroll records by department
    async getPayrollRecordsByDepartment(department: string): Promise<PayrollRecord[]> {
        return this.mockRecords.filter(record => record.department === department);
    }
    
    // Get payroll records by status
    async getPayrollRecordsByStatus(status: PayrollRecord['status']): Promise<PayrollRecord[]> {
        return this.mockRecords.filter(record => record.status === status);
    }
}

export class PayrollServiceFactory {
    static createService(type: 'firebase' | 'mock', db?: Firestore): IPayrollService {
        switch (type) {
            case 'firebase':
                if (!db) throw new Error('Firebase DB instance required');
                return new FirebasePayrollService(db);
            case 'mock':
                return new MockPayrollService();
            default:
                throw new Error('Invalid service type');
        }
    }
}

// Initialize the service based on config
let payrollService: IPayrollService = new MockPayrollService();

getServiceConfig().then((config: { defaultService: 'firebase' | 'mock'; firebase: { enabled: boolean; db: Firestore | null }; mock: { enabled: boolean } }) => {
    if (config.defaultService === 'firebase' && config.firebase.enabled && config.firebase.db) {
        console.log('Using Firebase Payroll Service');
        payrollService = PayrollServiceFactory.createService('firebase', config.firebase.db);
    } else {
        console.log('Using Mock Payroll Service');
        payrollService = PayrollServiceFactory.createService('mock');
    }
});

export { payrollService };
