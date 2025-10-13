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

// Fixed: Correct import path for Firebase configuration
import { getServiceConfig, initializeFirebase } from '../../../../config/firebase';
import { leaveSyncService } from '../../../../../services/leaveSyncService';
import { getFirestore } from 'firebase/firestore';
import { initializeApp, getApp } from 'firebase/app';

// Initialize Firebase and get db instance
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyC6ovwlhX4Mr8WpHoS045wLxHA7t8fRXPI",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "hris-system-baa22.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "hris-system-baa22",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "hris-system-baa22.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "563898942372",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:563898942372:web:8c5ebae1dfaf072858b731"
};

// Get or initialize Firebase db
function getDb() {
  try {
    // Try to get existing app first
    const app = getApp();
    return getFirestore(app);
  } catch {
    // If no app exists, initialize it
    const app = initializeApp(firebaseConfig);
    return getFirestore(app);
  }
}

const db = getDb();

// Types
interface LeaveRequest {
  id: string;
  employeeId: string;
  employeeName?: string;
  department?: string;
  leaveTypeId?: string;
  leaveTypeName?: string;
  type?: string;
  startDate: string | Date;
  endDate: string | Date;
  status: 'Pending' | 'Approved' | 'Rejected' | 'Cancelled' | 'pending' | 'approved' | 'rejected' | 'cancelled';
  reason: string;
  submittedDate?: any;
  submittedAt?: any;
  approver?: string;
  approvedDate?: string;
  totalDays: number;
  reviewedBy?: string;
  reviewedAt?: string;
  comments?: string;
}

interface LeaveType {
  id: string;
  name: string;
  daysAllowed: number;
  color: string;
  description?: string;
  maxDays?: number;
  accrualRate?: number;
  carryForward?: boolean;
  requiresApproval?: boolean;
}

interface Employee {
  id: string;
  name: string;
  department: string;
  position: string;
}

// Firebase service classes
class FirebaseLeaveRequestService {
  private collectionName = 'leaveRequests';

  async getAll(): Promise<LeaveRequest[]> {
    try {
      // Removed orderBy to avoid index requirements (matches real-time hook behavior)
      const q = query(collection(db, this.collectionName));
      const querySnapshot = await getDocs(q);
      const requests = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as LeaveRequest));

      // Sort in memory instead of using Firestore orderBy
      return requests.sort((a, b) => {
        const dateA = new Date(a.submittedDate || a.submittedAt || 0).getTime();
        const dateB = new Date(b.submittedDate || b.submittedAt || 0).getTime();
        return dateB - dateA; // Descending order (newest first)
      });
    } catch (error) {
      console.error('Error fetching leave requests:', error);
      throw error;
    }
  }

  async add(data: Partial<LeaveRequest>): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, this.collectionName), {
        ...data,
        submittedDate: Timestamp.now(),
        status: 'Pending'
      });
      return docRef.id;
    } catch (error) {
      console.error('Error adding leave request:', error);
      throw error;
    }
  }

  async update(id: string, data: Partial<LeaveRequest>): Promise<void> {
    try {
      const docRef = doc(db, this.collectionName, id);
      await updateDoc(docRef, data);
    } catch (error) {
      console.error('Error updating leave request:', error);
      throw error;
    }
  }

  async approve(id: string, approver: string): Promise<void> {
    try {
      console.log('✅ Approving leave request via sync service:', { id, approver });
      await leaveSyncService.approveLeaveRequest(id, approver);
      console.log('✅ Leave request approved successfully');
    } catch (error) {
      console.error('❌ Error approving leave request:', error);
      throw error;
    }
  }

  async reject(id: string, approver: string): Promise<void> {
    try {
      console.log('❌ Rejecting leave request via sync service:', { id, approver });
      await leaveSyncService.rejectLeaveRequest(id, approver);
      console.log('✅ Leave request rejected successfully');
    } catch (error) {
      console.error('❌ Error rejecting leave request:', error);
      throw error;
    }
  }

  async delete(id: string): Promise<void> {
    try {
      const docRef = doc(db, this.collectionName, id);
      await deleteDoc(docRef);
    } catch (error) {
      console.error('Error deleting leave request:', error);
      throw error;
    }
  }

  subscribe(callback: (requests: LeaveRequest[]) => void): () => void {
    // Removed orderBy to avoid index requirements
    const q = query(collection(db, this.collectionName));

    return onSnapshot(q, (snapshot: QuerySnapshot<DocumentData>) => {
      const requests = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as LeaveRequest));

      // Sort in memory
      const sortedRequests = requests.sort((a, b) => {
        const dateA = new Date(a.submittedDate || a.submittedAt || 0).getTime();
        const dateB = new Date(b.submittedDate || b.submittedAt || 0).getTime();
        return dateB - dateA;
      });

      callback(sortedRequests);
    }, (error) => {
      console.error('Error in leave requests subscription:', error);
    });
  }
}

class FirebaseLeaveTypeService {
  private collectionName = 'leaveTypes';

  async getAll(): Promise<LeaveType[]> {
    try {
      const querySnapshot = await getDocs(collection(db, this.collectionName));
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as LeaveType));
    } catch (error) {
      console.error('Error fetching leave types:', error);
      throw error;
    }
  }

  async add(data: Omit<LeaveType, 'id'>): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, this.collectionName), data);
      return docRef.id;
    } catch (error) {
      console.error('Error adding leave type:', error);
      throw error;
    }
  }

  async update(id: string, data: Partial<LeaveType>): Promise<void> {
    try {
      const docRef = doc(db, this.collectionName, id);
      await updateDoc(docRef, data);
    } catch (error) {
      console.error('Error updating leave type:', error);
      throw error;
    }
  }

  async delete(id: string): Promise<void> {
    try {
      const docRef = doc(db, this.collectionName, id);
      await deleteDoc(docRef);
    } catch (error) {
      console.error('Error deleting leave type:', error);
      throw error;
    }
  }

  subscribe(callback: (types: LeaveType[]) => void): () => void {
    return onSnapshot(collection(db, this.collectionName), (snapshot: QuerySnapshot<DocumentData>) => {
      const types = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as LeaveType));
      callback(types);
    }, (error) => {
      console.error('Error in leave types subscription:', error);
    });
  }
}

class FirebaseEmployeeService {
  private collectionName = 'employees';

  async getAll(): Promise<Employee[]> {
    try {
      const querySnapshot = await getDocs(collection(db, this.collectionName));
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Employee));
    } catch (error) {
      console.error('Error fetching employees:', error);
      throw error;
    }
  }

  async add(data: Omit<Employee, 'id'>): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, this.collectionName), data);
      return docRef.id;
    } catch (error) {
      console.error('Error adding employee:', error);
      throw error;
    }
  }

  subscribe(callback: (employees: Employee[]) => void): () => void {
    return onSnapshot(collection(db, this.collectionName), (snapshot: QuerySnapshot<DocumentData>) => {
      const employees = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Employee));
      callback(employees);
    }, (error) => {
      console.error('Error in employees subscription:', error);
    });
  }
}

// Data transformation utilities
export const dataTransforms = {
  calculateDays: (startDate: string, endDate: string): number => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays + 1; // Include both start and end dates
  },

  formatLeaveRequest: (formData: any, employee: Employee | undefined): Partial<LeaveRequest> => {
    if (!employee) {
      throw new Error('Employee not found');
    }

    const totalDays = dataTransforms.calculateDays(formData.startDate, formData.endDate);

    return {
      employeeId: formData.employeeId,
      employeeName: employee.name,
      department: employee.department,
      type: formData.type,
      startDate: formData.startDate,
      endDate: formData.endDate,
      reason: formData.reason,
      totalDays,
      status: 'Pending'
    };
  }
};

// Error handling utility
export const handleFirebaseError = (error: any): string => {
  console.error('Firebase error:', error);

  if (error.code) {
    switch (error.code) {
      case 'permission-denied':
        return 'Permission denied. Please check your access rights.';
      case 'unavailable':
        return 'Service temporarily unavailable. Please try again later.';
      case 'not-found':
        return 'Requested data not found.';
      case 'already-exists':
        return 'Data already exists.';
      default:
        return `Firebase error: ${error.message}`;
    }
  }

  return error.message || 'An unexpected error occurred';
};

// Initialize default data
export const initializeDefaultData = async (): Promise<void> => {
  try {
    // Check if leave types exist
    const leaveTypes = await leaveTypeService.getAll();
    if (leaveTypes.length === 0) {
      // Add default leave types
      const defaultLeaveTypes = [
        { name: 'Annual Leave', daysAllowed: 21, color: '#3B82F6' },
        { name: 'Sick Leave', daysAllowed: 10, color: '#EF4444' },
        { name: 'Personal Leave', daysAllowed: 5, color: '#8B5CF6' },
        { name: 'Maternity Leave', daysAllowed: 90, color: '#EC4899' },
        { name: 'Paternity Leave', daysAllowed: 14, color: '#06B6D4' }
      ];

      for (const leaveType of defaultLeaveTypes) {
        await leaveTypeService.add(leaveType);
      }
    }

    // Check if employees exist
    const employees = await employeeService.getAll();
    if (employees.length === 0) {
      // Add sample employees
      const defaultEmployees = [
        { name: 'John Doe', department: 'Engineering', position: 'Software Developer' },
        { name: 'Jane Smith', department: 'Marketing', position: 'Marketing Manager' },
        { name: 'Mike Johnson', department: 'HR', position: 'HR Specialist' },
        { name: 'Sarah Wilson', department: 'Finance', position: 'Financial Analyst' },
        { name: 'David Brown', department: 'Engineering', position: 'Senior Developer' }
      ];

      for (const employee of defaultEmployees) {
        await employeeService.add(employee);
      }
    }
  } catch (error) {
    console.warn('Error initializing default data:', error);
    // Don't throw here - let the app continue even if default data setup fails
  }
};

// Service instances
export const leaveRequestService = new FirebaseLeaveRequestService();
export const leaveTypeService = new FirebaseLeaveTypeService();
export const employeeService = new FirebaseEmployeeService();

// Export types for use in components
export type { LeaveRequest, LeaveType, Employee };