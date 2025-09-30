// Updated: 2025-09-29 - Fixed db is not defined error - COMPLETELY REWRITTEN
import {
    collection,
    doc,
    getDocs,
    addDoc,
    updateDoc,
    deleteDoc,
    onSnapshot,
    query,
    orderBy,
    Timestamp,
    DocumentData,
    QuerySnapshot
} from 'firebase/firestore';

import { getServiceConfig, initializeFirebase, getFirebaseDb } from '../config/firebase';

// Types
interface LeaveRequest {
    id: string;
    employeeId: string;
    employeeName: string;
    leaveTypeId: string;
    leaveTypeName: string;
    startDate: string | Date;
    endDate: string | Date;
    reason: string;
    status: 'pending' | 'approved' | 'rejected' | 'Pending' | 'Approved' | 'Rejected';
    submittedAt: string;
    reviewedBy?: string;
    reviewedAt?: string;
    comments?: string;
    description?: string;
}

interface LeaveType {
    id: string;
    name: string;
    description?: string;
    maxDays: number;
    accrualRate: number;
    carryForward: boolean;
    requiresApproval: boolean;
    isActive: boolean;
}

interface LeaveBalance {
    id: string;
    employeeId: string;
    leaveTypeId: string;
    balance: number;
    used: number;
    accrued: number;
}

// Service interfaces
interface LeaveRequestService {
    getAll(): Promise<LeaveRequest[]>;
    getByEmployee(employeeId: string): Promise<LeaveRequest[]>;
    getById(id: string): Promise<LeaveRequest | null>;
    add(data: Omit<LeaveRequest, 'id'>): Promise<string>;
    update(id: string, data: Partial<LeaveRequest>): Promise<void>;
    delete(id: string): Promise<void>;
    approve(id: string, approver: string, comments?: string): Promise<void>;
    reject(id: string, approver: string, comments?: string): Promise<void>;
}

interface LeaveTypeService {
    getAll(): Promise<LeaveType[]>;
    getById(id: string): Promise<LeaveType | null>;
    add(data: Omit<LeaveType, 'id'>): Promise<string>;
    update(id: string, data: Partial<LeaveType>): Promise<void>;
    delete(id: string): Promise<void>;
}

interface LeaveBalanceService {
    getByEmployee(employeeId: string): Promise<LeaveBalance[]>;
    updateBalance(employeeId: string, leaveTypeId: string, balance: number): Promise<void>;
}

// Firebase Leave Request Service
class FirebaseLeaveRequestService implements LeaveRequestService {
    private collectionName = 'leaveRequests';

    async getAll(): Promise<LeaveRequest[]> {
        try {
            // Force fresh Firebase initialization
            await initializeFirebase();

            // Get database instance safely
            const database = getFirebaseDb();
            if (!database) {
                throw new Error('Firebase database not initialized');
            }

            const q = query(collection(database, this.collectionName));
            const snapshot = await getDocs(q);

            return snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            } as LeaveRequest));
        } catch (error) {
            console.error('Error fetching leave requests:', error);
            throw error;
        }
    }

    async getByEmployee(employeeId: string): Promise<LeaveRequest[]> {
        try {
            // Force fresh Firebase initialization
            await initializeFirebase();

            // Get database instance safely
            const database = getFirebaseDb();
            if (!database) {
                throw new Error('Firebase database not initialized');
            }

            const q = query(collection(database, this.collectionName));
            const snapshot = await getDocs(q);

            return snapshot.docs
                .map(doc => ({ id: doc.id, ...doc.data() } as LeaveRequest))
                .filter(request => request.employeeId === employeeId);
        } catch (error) {
            console.error('Error fetching employee leave requests:', error);
            throw error;
        }
    }

    async getById(id: string): Promise<LeaveRequest | null> {
        try {
            // Force fresh Firebase initialization
            await initializeFirebase();

            // Get database instance safely
            const database = getFirebaseDb();
            if (!database) {
                throw new Error('Firebase database not initialized');
            }

            const q = query(collection(database, this.collectionName));
            const snapshot = await getDocs(q);

            const doc = snapshot.docs.find(d => d.id === id);
            if (!doc) return null;

            return { id: doc.id, ...doc.data() } as LeaveRequest;
        } catch (error) {
            console.error('Error fetching leave request:', error);
            throw error;
        }
    }

    async add(data: Omit<LeaveRequest, 'id'>): Promise<string> {
        try {
            // Force fresh Firebase initialization
            await initializeFirebase();

            // Get database instance safely
            const database = getFirebaseDb();
            if (!database) {
                throw new Error('Firebase database not initialized');
            }

            // Create document in collection
            const docRef = await addDoc(collection(database, this.collectionName), data);
            return docRef.id;
        } catch (error) {
            console.error('Error adding leave request:', error);
            throw error;
        }
    }

    async update(id: string, data: Partial<LeaveRequest>): Promise<void> {
        try {
            // Force fresh Firebase initialization
            await initializeFirebase();

            // Get database instance safely
            const database = getFirebaseDb();
            if (!database) {
                throw new Error('Firebase database not initialized');
            }

            const docRef = doc(database, this.collectionName, id);
            await updateDoc(docRef, data);
        } catch (error) {
            console.error('Error updating leave request:', error);
            throw error;
        }
    }

    async delete(id: string): Promise<void> {
        try {
            // Force fresh Firebase initialization
            await initializeFirebase();

            // Get database instance safely
            const database = getFirebaseDb();
            if (!database) {
                throw new Error('Firebase database not initialized');
            }

            const docRef = doc(database, this.collectionName, id);
            await deleteDoc(docRef);
        } catch (error) {
            console.error('Error deleting leave request:', error);
            throw error;
        }
    }

    async approve(id: string, approver: string, comments?: string): Promise<void> {
        try {
            await this.update(id, {
                status: 'Approved',
                reviewedBy: approver,
                reviewedAt: new Date().toISOString(),
                comments
            });
            console.log(`✅ Leave request ${id} approved by ${approver}`);
        } catch (error) {
            console.error('Error approving leave request:', error);
            throw error;
        }
    }

    async reject(id: string, approver: string, comments?: string): Promise<void> {
        try {
            await this.update(id, {
                status: 'Rejected',
                reviewedBy: approver,
                reviewedAt: new Date().toISOString(),
                comments
            });
            console.log(`❌ Leave request ${id} rejected by ${approver}`);
        } catch (error) {
            console.error('Error rejecting leave request:', error);
            throw error;
        }
    }
}

// Firebase Leave Type Service
class FirebaseLeaveTypeService implements LeaveTypeService {
    private collectionName = 'leaveTypes';

    async getAll(): Promise<LeaveType[]> {
        try {
            // Force fresh Firebase initialization
            await initializeFirebase();

            // Get database instance safely
            const database = getFirebaseDb();
            if (!database) {
                throw new Error('Firebase database not initialized');
            }

            const q = query(collection(database, this.collectionName));
            const snapshot = await getDocs(q);

            return snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            } as LeaveType));
        } catch (error) {
            console.error('Error fetching leave types:', error);
            throw error;
        }
    }

    async getById(id: string): Promise<LeaveType | null> {
        try {
            // Force fresh Firebase initialization
            await initializeFirebase();

            // Get database instance safely
            const database = getFirebaseDb();
            if (!database) {
                throw new Error('Firebase database not initialized');
            }

            const q = query(collection(database, this.collectionName));
            const snapshot = await getDocs(q);

            const doc = snapshot.docs.find(d => d.id === id);
            if (!doc) return null;

            return { id: doc.id, ...doc.data() } as LeaveType;
        } catch (error) {
            console.error('Error fetching leave type:', error);
            throw error;
        }
    }

    async add(data: Omit<LeaveType, 'id'>): Promise<string> {
        try {
            // Force fresh Firebase initialization
            await initializeFirebase();

            // Get database instance safely
            const database = getFirebaseDb();
            if (!database) {
                throw new Error('Firebase database not initialized');
            }

            // Create document in collection
            const docRef = await addDoc(collection(database, this.collectionName), data);
            return docRef.id;
        } catch (error) {
            console.error('Error adding leave type:', error);
            throw error;
        }
    }

    async update(id: string, data: Partial<LeaveType>): Promise<void> {
        try {
            // Force fresh Firebase initialization
            await initializeFirebase();

            // Get database instance safely
            const database = getFirebaseDb();
            if (!database) {
                throw new Error('Firebase database not initialized');
            }

            const docRef = doc(database, this.collectionName, id);
            await updateDoc(docRef, data);
        } catch (error) {
            console.error('Error updating leave type:', error);
            throw error;
        }
    }

    async delete(id: string): Promise<void> {
        try {
            // Force fresh Firebase initialization
            await initializeFirebase();

            // Get database instance safely
            const database = getFirebaseDb();
            if (!database) {
                throw new Error('Firebase database not initialized');
            }

            const docRef = doc(database, this.collectionName, id);
            await deleteDoc(docRef);
        } catch (error) {
            console.error('Error deleting leave type:', error);
            throw error;
        }
    }
}

// Mock Leave Request Service (for fallback)
class MockLeaveRequestService implements LeaveRequestService {
    async getAll(): Promise<LeaveRequest[]> {
        return [];
    }

    async getByEmployee(employeeId: string): Promise<LeaveRequest[]> {
        return [];
    }

    async getById(id: string): Promise<LeaveRequest | null> {
        return null;
    }

    async add(data: Omit<LeaveRequest, 'id'>): Promise<string> {
        return 'mock-id';
    }

    async update(id: string, data: Partial<LeaveRequest>): Promise<void> {
        // Mock implementation
    }

    async delete(id: string): Promise<void> {
        // Mock implementation
    }

    async approve(id: string, approver: string, comments?: string): Promise<void> {
        // Mock implementation
    }

    async reject(id: string, approver: string, comments?: string): Promise<void> {
        // Mock implementation
    }
}

// Mock Leave Type Service (for fallback)
class MockLeaveTypeService implements LeaveTypeService {
    async getAll(): Promise<LeaveType[]> {
        return [];
    }

    async getById(id: string): Promise<LeaveType | null> {
        return null;
    }

    async add(data: Omit<LeaveType, 'id'>): Promise<string> {
        return 'mock-id';
    }

    async update(id: string, data: Partial<LeaveType>): Promise<void> {
        // Mock implementation
    }

    async delete(id: string): Promise<void> {
        // Mock implementation
    }
}

// Service Factory
class LeaveServiceFactory {
    static async createLeaveRequestService(): Promise<LeaveRequestService> {
        try {
            const config = await getServiceConfig();
            if (config.defaultService === 'firebase') {
                return new FirebaseLeaveRequestService();
            }
        } catch (error) {
            console.error('Error creating Firebase leave request service:', error);
        }
        return new MockLeaveRequestService();
    }

    static async createLeaveTypeService(): Promise<LeaveTypeService> {
        try {
            const config = await getServiceConfig();
            if (config.defaultService === 'firebase') {
                return new FirebaseLeaveTypeService();
            }
        } catch (error) {
            console.error('Error creating Firebase leave type service:', error);
        }
        return new MockLeaveTypeService();
    }
}

// Export services
export const leaveRequestService = await LeaveServiceFactory.createLeaveRequestService();
export const leaveTypeService = await LeaveServiceFactory.createLeaveTypeService();

// Export types
export type { LeaveRequest, LeaveType, LeaveBalance };

// Export factory for dynamic service creation
export { LeaveServiceFactory };

