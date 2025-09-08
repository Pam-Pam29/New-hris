// services/leaveService.ts
import {
  collection,
  doc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  where,
  Timestamp,
  getFirestore
} from 'firebase/firestore';

// Firebase config - replace with your actual config
import { initializeApp } from 'firebase/app';

const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-auth-domain",
  projectId: "your-project-id",
  storageBucket: "your-storage-bucket",
  messagingSenderId: "your-messaging-sender-id",
  appId: "your-app-id"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Types
export interface LeaveRequest {
  id?: string;
  employeeId: string;
  employeeName: string;
  department: string;
  type: string;
  startDate: string;
  endDate: string;
  status: 'Pending' | 'Approved' | 'Rejected' | 'Cancelled';
  reason: string;
  submittedDate: string;
  approver: string;
  approvedDate: string;
  totalDays: number;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

export interface LeaveType {
  id?: string;
  name: string;
  daysAllowed: number;
  color: string;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

export interface Employee {
  id?: string;
  name: string;
  department: string;
  position: string;
  email?: string;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

// Firebase Collections
const COLLECTIONS = {
  LEAVE_REQUESTS: 'leaveRequests',
  LEAVE_TYPES: 'leaveTypes',
  EMPLOYEES: 'employees'
} as const;

export class LeaveFirebaseService {

  // Leave Requests Methods
  async getLeaveRequests(): Promise<LeaveRequest[]> {
    try {
      const q = query(
        collection(db, COLLECTIONS.LEAVE_REQUESTS),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);

      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate?.() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate?.() || new Date()
      })) as LeaveRequest[];
    } catch (error) {
      console.error('Error fetching leave requests:', error);
      throw new Error('Failed to fetch leave requests');
    }
  }

  async createLeaveRequest(request: Omit<LeaveRequest, 'id' | 'createdAt' | 'updatedAt'>): Promise<LeaveRequest> {
    try {
      const now = Timestamp.now();
      const docRef = await addDoc(collection(db, COLLECTIONS.LEAVE_REQUESTS), {
        ...request,
        createdAt: now,
        updatedAt: now
      });

      return {
        id: docRef.id,
        ...request,
        createdAt: now,
        updatedAt: now
      };
    } catch (error) {
      console.error('Error creating leave request:', error);
      throw new Error('Failed to create leave request');
    }
  }

  async updateLeaveRequest(id: string, updates: Partial<LeaveRequest>): Promise<LeaveRequest> {
    try {
      const docRef = doc(db, COLLECTIONS.LEAVE_REQUESTS, id);
      const updateData = {
        ...updates,
        updatedAt: Timestamp.now()
      };

      await updateDoc(docRef, updateData);

      // Return the updated request (in a real app, you might want to fetch it)
      return {
        id,
        ...updates,
        updatedAt: Timestamp.now()
      } as LeaveRequest;
    } catch (error) {
      console.error('Error updating leave request:', error);
      throw new Error('Failed to update leave request');
    }
  }

  async deleteLeaveRequest(id: string): Promise<boolean> {
    try {
      await deleteDoc(doc(db, COLLECTIONS.LEAVE_REQUESTS, id));
      return true;
    } catch (error) {
      console.error('Error deleting leave request:', error);
      throw new Error('Failed to delete leave request');
    }
  }

  async approveLeaveRequest(id: string, approver: string): Promise<LeaveRequest> {
    return this.updateLeaveRequest(id, {
      status: 'Approved',
      approver,
      approvedDate: new Date().toISOString().split('T')[0]
    });
  }

  async rejectLeaveRequest(id: string, approver: string): Promise<LeaveRequest> {
    return this.updateLeaveRequest(id, {
      status: 'Rejected',
      approver,
      approvedDate: new Date().toISOString().split('T')[0]
    });
  }

  // Leave Types Methods
  async getLeaveTypes(): Promise<LeaveType[]> {
    try {
      const q = query(
        collection(db, COLLECTIONS.LEAVE_TYPES),
        orderBy('name', 'asc')
      );
      const querySnapshot = await getDocs(q);

      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as LeaveType[];
    } catch (error) {
      console.error('Error fetching leave types:', error);
      throw new Error('Failed to fetch leave types');
    }
  }

  async createLeaveType(leaveType: Omit<LeaveType, 'id' | 'createdAt' | 'updatedAt'>): Promise<LeaveType> {
    try {
      const now = Timestamp.now();
      const docRef = await addDoc(collection(db, COLLECTIONS.LEAVE_TYPES), {
        ...leaveType,
        createdAt: now,
        updatedAt: now
      });

      return {
        id: docRef.id,
        ...leaveType,
        createdAt: now,
        updatedAt: now
      };
    } catch (error) {
      console.error('Error creating leave type:', error);
      throw new Error('Failed to create leave type');
    }
  }

  async updateLeaveType(id: string, updates: Partial<LeaveType>): Promise<LeaveType> {
    try {
      const docRef = doc(db, COLLECTIONS.LEAVE_TYPES, id);
      const updateData = {
        ...updates,
        updatedAt: Timestamp.now()
      };

      await updateDoc(docRef, updateData);

      return {
        id,
        ...updates,
        updatedAt: Timestamp.now()
      } as LeaveType;
    } catch (error) {
      console.error('Error updating leave type:', error);
      throw new Error('Failed to update leave type');
    }
  }

  async deleteLeaveType(id: string): Promise<boolean> {
    try {
      await deleteDoc(doc(db, COLLECTIONS.LEAVE_TYPES, id));
      return true;
    } catch (error) {
      console.error('Error deleting leave type:', error);
      throw new Error('Failed to delete leave type');
    }
  }

  // Employee Methods (for the dropdown)
  async getEmployees(): Promise<Employee[]> {
    try {
      const q = query(
        collection(db, COLLECTIONS.EMPLOYEES),
        orderBy('name', 'asc')
      );
      const querySnapshot = await getDocs(q);

      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Employee[];
    } catch (error) {
      console.error('Error fetching employees:', error);
      throw new Error('Failed to fetch employees');
    }
  }

  // Utility Methods
  async getLeaveRequestsByEmployee(employeeId: string): Promise<LeaveRequest[]> {
    try {
      const q = query(
        collection(db, COLLECTIONS.LEAVE_REQUESTS),
        where('employeeId', '==', employeeId),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);

      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as LeaveRequest[];
    } catch (error) {
      console.error('Error fetching employee leave requests:', error);
      throw new Error('Failed to fetch employee leave requests');
    }
  }

  async getLeaveRequestsByStatus(status: LeaveRequest['status']): Promise<LeaveRequest[]> {
    try {
      const q = query(
        collection(db, COLLECTIONS.LEAVE_REQUESTS),
        where('status', '==', status),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);

      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as LeaveRequest[];
    } catch (error) {
      console.error('Error fetching leave requests by status:', error);
      throw new Error('Failed to fetch leave requests by status');
    }
  }

  async getLeaveRequestsByDateRange(startDate: string, endDate: string): Promise<LeaveRequest[]> {
    try {
      const q = query(
        collection(db, COLLECTIONS.LEAVE_REQUESTS),
        where('startDate', '>=', startDate),
        where('startDate', '<=', endDate),
        orderBy('startDate', 'asc')
      );
      const querySnapshot = await getDocs(q);

      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as LeaveRequest[];
    } catch (error) {
      console.error('Error fetching leave requests by date range:', error);
      throw new Error('Failed to fetch leave requests by date range');
    }
  }
}

// Export service instance
export const leaveService = new LeaveFirebaseService();

// Service factory for dependency injection (similar to your employee service)
export const getLeaveService = async (): Promise<LeaveFirebaseService> => {
  return leaveService;
};