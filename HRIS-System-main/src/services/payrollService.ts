import { getServiceConfig } from '../config/firebase';
import { Firestore } from 'firebase/firestore';

export interface PayrollRecord {
    id: string;
    employeeId: string;
    employeeName: string;
    periodStart: Date;
    periodEnd: Date;
    grossPay: number;
    deductions: number;
    netPay: number;
    status: 'pending' | 'processed' | 'paid';
    paymentDate?: Date;
}

export interface IPayrollService {
    getPayrollRecords(): Promise<PayrollRecord[]>;
    getPayrollRecord(id: string): Promise<PayrollRecord | null>;
    createPayrollRecord(record: Omit<PayrollRecord, 'id'>): Promise<string>;
    updatePayrollRecord(id: string, record: Partial<PayrollRecord>): Promise<void>;
    deletePayrollRecord(id: string): Promise<void>;
}

class FirebasePayrollService implements IPayrollService {
    constructor(private db: Firestore) { }

    async getPayrollRecords(): Promise<PayrollRecord[]> {
        try {
            const { collection, getDocs } = await import('firebase/firestore');
            const payrollRef = collection(this.db, 'payroll_records');
            const snapshot = await getDocs(payrollRef);
            return snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            } as PayrollRecord));
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
            return snapshot.exists() ? { id: snapshot.id, ...snapshot.data() } as PayrollRecord : null;
        } catch (error) {
            console.error(`Error fetching payroll record ${id}:`, error);
            throw error;
        }
    }

    async createPayrollRecord(record: Omit<PayrollRecord, 'id'>): Promise<string> {
        try {
            const { collection, addDoc } = await import('firebase/firestore');
            const payrollRef = collection(this.db, 'payroll_records');
            const docRef = await addDoc(payrollRef, record);
            return docRef.id;
        } catch (error) {
            console.error('Error creating payroll record:', error);
            throw error;
        }
    }

    async updatePayrollRecord(id: string, record: Partial<PayrollRecord>): Promise<void> {
        try {
            const { doc, updateDoc } = await import('firebase/firestore');
            const payrollRef = doc(this.db, 'payroll_records', id);
            await updateDoc(payrollRef, record);
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
}

class MockPayrollService implements IPayrollService {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async getPayrollRecords(): Promise<PayrollRecord[]> {
        return [];
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async getPayrollRecord(_id: string): Promise<PayrollRecord | null> {
        return null;
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async createPayrollRecord(_record: Omit<PayrollRecord, 'id'>): Promise<string> {
        return 'mock-id';
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async updatePayrollRecord(_id: string, _record: Partial<PayrollRecord>): Promise<void> {
        // No-op
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async deletePayrollRecord(_id: string): Promise<void> {
        // No-op
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
