import { LeaveType, LeaveRequest, LeaveBalance } from '../pages/Hr/CoreHr/LeaveManagement/types';
import { getServiceConfig, initializeFirebase } from '../config/firebase';
import { Firestore } from 'firebase/firestore';

// Abstract interface for leave management operations
export interface ILeaveService {
  // Leave Types
  getLeaveTypes(): Promise<LeaveType[]>;
  getLeaveTypeById(id: string): Promise<LeaveType | null>;
  createLeaveType(leaveType: Omit<LeaveType, 'id'>): Promise<LeaveType>;
  updateLeaveType(id: string, leaveType: Partial<LeaveType>): Promise<LeaveType>;
  deleteLeaveType(id: string): Promise<boolean>;

  // Leave Requests
  getLeaveRequests(): Promise<LeaveRequest[]>;
  getLeaveRequestById(id: string): Promise<LeaveRequest | null>;
  createLeaveRequest(leaveRequest: Omit<LeaveRequest, 'id' | 'status' | 'createdAt' | 'updatedAt'>): Promise<LeaveRequest>;
  updateLeaveRequest(id: string, leaveRequest: Partial<LeaveRequest>): Promise<LeaveRequest>;
  deleteLeaveRequest(id: string): Promise<boolean>;
  approveLeaveRequest(id: string, approverNotes?: string): Promise<LeaveRequest>;
  rejectLeaveRequest(id: string, approverNotes?: string): Promise<LeaveRequest>;

  // Leave Balances
  getLeaveBalances(employeeId: string): Promise<LeaveBalance[]>;
  updateLeaveBalance(employeeId: string, leaveTypeId: string, changes: Partial<LeaveBalance>): Promise<LeaveBalance>;
}

// Firebase implementation
export class FirebaseLeaveService implements ILeaveService {
  private db: Firestore;

  constructor(db: Firestore) {
    this.db = db;
  }

  // Leave Types
  async getLeaveTypes(): Promise<LeaveType[]> {
    try {
      const { collection, getDocs, query, orderBy } = await import('firebase/firestore');
      const leaveTypesRef = collection(this.db, 'leaveTypes');
      const q = query(leaveTypesRef, orderBy('name'));
      const querySnapshot = await getDocs(q);

      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as LeaveType[];
    } catch (error) {
      console.error('Error fetching leave types:', error);
      return [];
    }
  }

  async getLeaveTypeById(id: string): Promise<LeaveType | null> {
    try {
      const { doc, getDoc } = await import('firebase/firestore');
      const leaveTypeRef = doc(this.db, 'leaveTypes', id);
      const leaveTypeDoc = await getDoc(leaveTypeRef);

      if (!leaveTypeDoc.exists()) return null;

      return {
        id: leaveTypeDoc.id,
        ...leaveTypeDoc.data()
      } as LeaveType;
    } catch (error) {
      console.error('Error fetching leave type:', error);
      return null;
    }
  }

  async createLeaveType(leaveType: Omit<LeaveType, 'id'>): Promise<LeaveType> {
    try {
      const { collection, addDoc } = await import('firebase/firestore');
      const leaveTypesRef = collection(this.db, 'leaveTypes');
      const docRef = await addDoc(leaveTypesRef, leaveType);

      return {
        id: docRef.id,
        ...leaveType
      } as LeaveType;
    } catch (error) {
      console.error('Error creating leave type:', error);
      throw error;
    }
  }

  async updateLeaveType(id: string, leaveType: Partial<LeaveType>): Promise<LeaveType> {
    try {
      const { doc, updateDoc, getDoc } = await import('firebase/firestore');
      const leaveTypeRef = doc(this.db, 'leaveTypes', id);
      await updateDoc(leaveTypeRef, leaveType);

      const updatedDoc = await getDoc(leaveTypeRef);
      return {
        id: updatedDoc.id,
        ...updatedDoc.data()
      } as LeaveType;
    } catch (error) {
      console.error('Error updating leave type:', error);
      throw error;
    }
  }

  async deleteLeaveType(id: string): Promise<boolean> {
    try {
      const { doc, deleteDoc } = await import('firebase/firestore');
      const leaveTypeRef = doc(this.db, 'leaveTypes', id);
      await deleteDoc(leaveTypeRef);
      return true;
    } catch (error) {
      console.error('Error deleting leave type:', error);
      return false;
    }
  }

  // Leave Requests
  async getLeaveRequests(): Promise<LeaveRequest[]> {
    try {
      const { collection, getDocs, query, orderBy } = await import('firebase/firestore');
      const leaveRequestsRef = collection(this.db, 'leaveRequests');
      const q = query(leaveRequestsRef, orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);

      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as LeaveRequest[];
    } catch (error) {
      console.error('Error fetching leave requests:', error);
      return [];
    }
  }

  async getLeaveRequestById(id: string): Promise<LeaveRequest | null> {
    try {
      const { doc, getDoc } = await import('firebase/firestore');
      const leaveRequestRef = doc(this.db, 'leaveRequests', id);
      const leaveRequestDoc = await getDoc(leaveRequestRef);

      if (!leaveRequestDoc.exists()) return null;

      return {
        id: leaveRequestDoc.id,
        ...leaveRequestDoc.data()
      } as LeaveRequest;
    } catch (error) {
      console.error('Error fetching leave request:', error);
      return null;
    }
  }

  async createLeaveRequest(leaveRequest: Omit<LeaveRequest, 'id' | 'status' | 'createdAt' | 'updatedAt'>): Promise<LeaveRequest> {
    try {
      const { collection, addDoc, serverTimestamp } = await import('firebase/firestore');
      const leaveRequestsRef = collection(this.db, 'leaveRequests');
      const timestamp = serverTimestamp();

      const newLeaveRequest = {
        ...leaveRequest,
        status: 'pending',
        createdAt: timestamp,
        updatedAt: timestamp
      };

      const docRef = await addDoc(leaveRequestsRef, newLeaveRequest);
      return {
        id: docRef.id,
        ...newLeaveRequest,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      } as LeaveRequest;
    } catch (error) {
      console.error('Error creating leave request:', error);
      throw error;
    }
  }

  async updateLeaveRequest(id: string, leaveRequest: Partial<LeaveRequest>): Promise<LeaveRequest> {
    try {
      const { doc, updateDoc, getDoc, serverTimestamp } = await import('firebase/firestore');
      const leaveRequestRef = doc(this.db, 'leaveRequests', id);
      
      const updates = {
        ...leaveRequest,
        updatedAt: serverTimestamp()
      };

      await updateDoc(leaveRequestRef, updates);

      const updatedDoc = await getDoc(leaveRequestRef);
      return {
        id: updatedDoc.id,
        ...updatedDoc.data(),
        updatedAt: new Date().toISOString()
      } as LeaveRequest;
    } catch (error) {
      console.error('Error updating leave request:', error);
      throw error;
    }
  }

  async deleteLeaveRequest(id: string): Promise<boolean> {
    try {
      const { doc, deleteDoc } = await import('firebase/firestore');
      const leaveRequestRef = doc(this.db, 'leaveRequests', id);
      await deleteDoc(leaveRequestRef);
      return true;
    } catch (error) {
      console.error('Error deleting leave request:', error);
      return false;
    }
  }

  async approveLeaveRequest(id: string, approverNotes?: string): Promise<LeaveRequest> {
    return this.updateLeaveRequest(id, {
      status: 'approved',
      approverNotes
    });
  }

  async rejectLeaveRequest(id: string, approverNotes?: string): Promise<LeaveRequest> {
    return this.updateLeaveRequest(id, {
      status: 'rejected',
      approverNotes
    });
  }

  // Leave Balances
  async getLeaveBalances(employeeId: string): Promise<LeaveBalance[]> {
    try {
      const { collection, getDocs, query, where } = await import('firebase/firestore');
      const leaveBalancesRef = collection(this.db, 'leaveBalances');
      const q = query(leaveBalancesRef, where('employeeId', '==', employeeId));
      const querySnapshot = await getDocs(q);

      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as LeaveBalance[];
    } catch (error) {
      console.error('Error fetching leave balances:', error);
      return [];
    }
  }

  async updateLeaveBalance(employeeId: string, leaveTypeId: string, changes: Partial<LeaveBalance>): Promise<LeaveBalance> {
    try {
      const { collection, query, where, getDocs, updateDoc, doc } = await import('firebase/firestore');
      const leaveBalancesRef = collection(this.db, 'leaveBalances');
      const q = query(
        leaveBalancesRef,
        where('employeeId', '==', employeeId),
        where('leaveTypeId', '==', leaveTypeId)
      );

      const querySnapshot = await getDocs(q);
      if (querySnapshot.empty) {
        throw new Error('Leave balance not found');
      }

      const balanceDoc = querySnapshot.docs[0];
      const balanceRef = doc(this.db, 'leaveBalances', balanceDoc.id);
      
      await updateDoc(balanceRef, changes);

      return {
        id: balanceDoc.id,
        ...balanceDoc.data(),
        ...changes
      } as LeaveBalance;
    } catch (error) {
      console.error('Error updating leave balance:', error);
      throw error;
    }
  }
}

// Mock implementation for development/testing
export class MockLeaveService implements ILeaveService {
  // Implement mock methods here...
  // This is a placeholder that should be implemented with mock data
  async getLeaveTypes(): Promise<LeaveType[]> { return []; }
  async getLeaveTypeById(): Promise<LeaveType | null> { return null; }
  async createLeaveType(leaveType: Omit<LeaveType, 'id'>): Promise<LeaveType> { return { id: '1', ...leaveType }; }
  async updateLeaveType(id: string, leaveType: Partial<LeaveType>): Promise<LeaveType> { return { id, ...leaveType } as LeaveType; }
  async deleteLeaveType(): Promise<boolean> { return true; }
  async getLeaveRequests(): Promise<LeaveRequest[]> { return []; }
  async getLeaveRequestById(): Promise<LeaveRequest | null> { return null; }
  async createLeaveRequest(leaveRequest: Omit<LeaveRequest, 'id' | 'status' | 'createdAt' | 'updatedAt'>): Promise<LeaveRequest> {
    return {
      id: '1',
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...leaveRequest
    };
  }
  async updateLeaveRequest(id: string, leaveRequest: Partial<LeaveRequest>): Promise<LeaveRequest> {
    return { id, ...leaveRequest } as LeaveRequest;
  }
  async deleteLeaveRequest(): Promise<boolean> { return true; }
  async approveLeaveRequest(id: string): Promise<LeaveRequest> {
    return this.updateLeaveRequest(id, { status: 'approved' });
  }
  async rejectLeaveRequest(id: string): Promise<LeaveRequest> {
    return this.updateLeaveRequest(id, { status: 'rejected' });
  }
  async getLeaveBalances(): Promise<LeaveBalance[]> { return []; }
  async updateLeaveBalance(): Promise<LeaveBalance> { return {} as LeaveBalance; }
}

// Service factory
export class LeaveServiceFactory {
  static createService(type: 'firebase' | 'mock', db?: Firestore): ILeaveService {
    switch (type) {
      case 'firebase':
        if (!db) throw new Error('Firebase DB instance required');
        return new FirebaseLeaveService(db);
      case 'mock':
        return new MockLeaveService();
      default:
        return new MockLeaveService();
    }
  }
}

// Async function to get the properly configured leave service
export const getLeaveService = async (): Promise<ILeaveService> => {
  try {
    await initializeFirebase(); // Wait for Firebase to be ready
    const config = await getServiceConfig();

    if (config.defaultService === 'firebase' && config.firebase.enabled && config.firebase.db) {
      console.log('Using Firebase Leave Service');
      return LeaveServiceFactory.createService('firebase', config.firebase.db);
    } else {
      console.log('Using Mock Leave Service');
      return LeaveServiceFactory.createService('mock');
    }
  } catch (error) {
    console.warn('Failed to initialize Firebase Leave Service, falling back to Mock');
    return new MockLeaveService();
  }
};

// For compatibility - but this will start as mock until Firebase is ready
let leaveService: ILeaveService = new MockLeaveService();

// Initialize the service asynchronously
(async () => {
  try {
    leaveService = await getLeaveService();
  } catch (error) {
    console.error('Error initializing leave service:', error);
  }
})();

export { leaveService };