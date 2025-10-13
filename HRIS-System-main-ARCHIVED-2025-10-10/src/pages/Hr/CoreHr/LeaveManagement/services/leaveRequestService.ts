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
  QuerySnapshot,
  Firestore
} from 'firebase/firestore';

// Import following the same pattern as employeeService
import { getServiceConfig, initializeFirebase } from '../../../../../config/firebase';

// Types
interface LeaveRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  department: string;
  type: string;
  startDate: string;
  endDate: string;
  status: 'Pending' | 'Approved' | 'Rejected' | 'Cancelled';
  reason: string;
  submittedDate: any;
  approver: string;
  approvedDate: string;
  totalDays: number;
}

interface LeaveType {
  id: string;
  name: string;
  daysAllowed: number;
  color: string;
}

interface Employee {
  id: string;
  name: string;
  department: string;
  position: string;
}

// Abstract interfaces
export interface ILeaveRequestService {
  getAll(): Promise<LeaveRequest[]>;
  add(data: Partial<LeaveRequest>): Promise<string>;
  update(id: string, data: Partial<LeaveRequest>): Promise<void>;
  approve(id: string, approver: string): Promise<void>;
  reject(id: string, approver: string): Promise<void>;
  delete(id: string): Promise<void>;
  subscribe(callback: (requests: LeaveRequest[]) => void): () => void;
}

export interface ILeaveTypeService {
  getAll(): Promise<LeaveType[]>;
  add(data: Omit<LeaveType, 'id'>): Promise<string>;
  update(id: string, data: Partial<LeaveType>): Promise<void>;
  delete(id: string): Promise<void>;
  subscribe(callback: (types: LeaveType[]) => void): () => void;
}

export interface IEmployeeService {
  getAll(): Promise<Employee[]>;
  add(data: Omit<Employee, 'id'>): Promise<string>;
  subscribe(callback: (employees: Employee[]) => void): () => void;
}

// Firebase implementations
class FirebaseLeaveRequestService implements ILeaveRequestService {
  private collectionName = 'leaveRequests';
  private db: Firestore;

  constructor(db: Firestore) {
    this.db = db;
  }

  async getAll(): Promise<LeaveRequest[]> {
    try {
      const q = query(collection(this.db, this.collectionName), orderBy('submittedDate', 'desc'));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as LeaveRequest));
    } catch (error) {
      console.error('Error fetching leave requests:', error);
      throw error;
    }
  }

  async add(data: Partial<LeaveRequest>): Promise<string> {
    try {
      const docRef = await addDoc(collection(this.db, this.collectionName), {
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
      const docRef = doc(this.db, this.collectionName, id);
      await updateDoc(docRef, data);
    } catch (error) {
      console.error('Error updating leave request:', error);
      throw error;
    }
  }

  async approve(id: string, approver: string): Promise<void> {
    try {
      const docRef = doc(this.db, this.collectionName, id);
      await updateDoc(docRef, {
        status: 'Approved',
        approver,
        approvedDate: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error approving leave request:', error);
      throw error;
    }
  }

  async reject(id: string, approver: string): Promise<void> {
    try {
      const docRef = doc(this.db, this.collectionName, id);
      await updateDoc(docRef, {
        status: 'Rejected',
        approver,
        approvedDate: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error rejecting leave request:', error);
      throw error;
    }
  }

  async delete(id: string): Promise<void> {
    try {
      const docRef = doc(this.db, this.collectionName, id);
      await deleteDoc(docRef);
    } catch (error) {
      console.error('Error deleting leave request:', error);
      throw error;
    }
  }

  subscribe(callback: (requests: LeaveRequest[]) => void): () => void {
    const q = query(collection(this.db, this.collectionName), orderBy('submittedDate', 'desc'));

    return onSnapshot(q, (snapshot: QuerySnapshot<DocumentData>) => {
      const requests = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as LeaveRequest));
      callback(requests);
    }, (error) => {
      console.error('Error in leave requests subscription:', error);
    });
  }
}

class FirebaseLeaveTypeService implements ILeaveTypeService {
  private collectionName = 'leaveTypes';
  private db: Firestore;

  constructor(db: Firestore) {
    this.db = db;
  }

  async getAll(): Promise<LeaveType[]> {
    try {
      const querySnapshot = await getDocs(collection(this.db, this.collectionName));
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
      const docRef = await addDoc(collection(this.db, this.collectionName), data);
      return docRef.id;
    } catch (error) {
      console.error('Error adding leave type:', error);
      throw error;
    }
  }

  async update(id: string, data: Partial<LeaveType>): Promise<void> {
    try {
      const docRef = doc(this.db, this.collectionName, id);
      await updateDoc(docRef, data);
    } catch (error) {
      console.error('Error updating leave type:', error);
      throw error;
    }
  }

  async delete(id: string): Promise<void> {
    try {
      const docRef = doc(this.db, this.collectionName, id);
      await deleteDoc(docRef);
    } catch (error) {
      console.error('Error deleting leave type:', error);
      throw error;
    }
  }

  subscribe(callback: (types: LeaveType[]) => void): () => void {
    return onSnapshot(collection(this.db, this.collectionName), (snapshot: QuerySnapshot<DocumentData>) => {
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

class FirebaseEmployeeService implements IEmployeeService {
  private collectionName = 'employees';
  private db: Firestore;

  constructor(db: Firestore) {
    this.db = db;
  }

  async getAll(): Promise<Employee[]> {
    try {
      const querySnapshot = await getDocs(collection(this.db, this.collectionName));
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
      const docRef = await addDoc(collection(this.db, this.collectionName), data);
      return docRef.id;
    } catch (error) {
      console.error('Error adding employee:', error);
      throw error;
    }
  }

  subscribe(callback: (employees: Employee[]) => void): () => void {
    return onSnapshot(collection(this.db, this.collectionName), (snapshot: QuerySnapshot<DocumentData>) => {
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

// Mock implementations
class MockLeaveRequestService implements ILeaveRequestService {
  private requests: LeaveRequest[] = [];

  async getAll(): Promise<LeaveRequest[]> {
    return Promise.resolve([...this.requests]);
  }

  async add(data: Partial<LeaveRequest>): Promise<string> {
    const id = Date.now().toString();
    const request = {
      ...data,
      id,
      submittedDate: new Date(),
      status: 'Pending' as const
    } as LeaveRequest;
    this.requests.push(request);
    return Promise.resolve(id);
  }

  async update(id: string, data: Partial<LeaveRequest>): Promise<void> {
    const index = this.requests.findIndex(r => r.id === id);
    if (index !== -1) {
      this.requests[index] = { ...this.requests[index], ...data };
    }
    return Promise.resolve();
  }

  async approve(id: string, approver: string): Promise<void> {
    return this.update(id, {
      status: 'Approved',
      approver,
      approvedDate: new Date().toISOString()
    });
  }

  async reject(id: string, approver: string): Promise<void> {
    return this.update(id, {
      status: 'Rejected',
      approver,
      approvedDate: new Date().toISOString()
    });
  }

  async delete(id: string): Promise<void> {
    const index = this.requests.findIndex(r => r.id === id);
    if (index !== -1) {
      this.requests.splice(index, 1);
    }
    return Promise.resolve();
  }

  subscribe(callback: (requests: LeaveRequest[]) => void): () => void {
    callback([...this.requests]);
    return () => { }; // Return empty unsubscribe function
  }
}

class MockLeaveTypeService implements ILeaveTypeService {
  private types: LeaveType[] = [
    { id: '1', name: 'Annual Leave', daysAllowed: 21, color: '#3B82F6' },
    { id: '2', name: 'Sick Leave', daysAllowed: 10, color: '#EF4444' },
    { id: '3', name: 'Personal Leave', daysAllowed: 5, color: '#8B5CF6' }
  ];

  async getAll(): Promise<LeaveType[]> {
    return Promise.resolve([...this.types]);
  }

  async add(data: Omit<LeaveType, 'id'>): Promise<string> {
    const id = Date.now().toString();
    const type = { ...data, id };
    this.types.push(type);
    return Promise.resolve(id);
  }

  async update(id: string, data: Partial<LeaveType>): Promise<void> {
    const index = this.types.findIndex(t => t.id === id);
    if (index !== -1) {
      this.types[index] = { ...this.types[index], ...data };
    }
    return Promise.resolve();
  }

  async delete(id: string): Promise<void> {
    const index = this.types.findIndex(t => t.id === id);
    if (index !== -1) {
      this.types.splice(index, 1);
    }
    return Promise.resolve();
  }

  subscribe(callback: (types: LeaveType[]) => void): () => void {
    callback([...this.types]);
    return () => { };
  }
}

class MockEmployeeService implements IEmployeeService {
  private employees: Employee[] = [
    { id: '1', name: 'John Doe', department: 'Engineering', position: 'Developer' },
    { id: '2', name: 'Jane Smith', department: 'HR', position: 'HR Manager' }
  ];

  async getAll(): Promise<Employee[]> {
    return Promise.resolve([...this.employees]);
  }

  async add(data: Omit<Employee, 'id'>): Promise<string> {
    const id = Date.now().toString();
    const employee = { ...data, id };
    this.employees.push(employee);
    return Promise.resolve(id);
  }

  subscribe(callback: (employees: Employee[]) => void): () => void {
    callback([...this.employees]);
    return () => { };
  }
}

// Service factories
export class LeaveServiceFactory {
  static createLeaveRequestService(type: 'firebase' | 'mock', db?: Firestore): ILeaveRequestService {
    switch (type) {
      case 'firebase':
        if (!db) throw new Error('Firebase DB instance required');
        return new FirebaseLeaveRequestService(db);
      case 'mock':
        return new MockLeaveRequestService();
      default:
        return new MockLeaveRequestService();
    }
  }

  static createLeaveTypeService(type: 'firebase' | 'mock', db?: Firestore): ILeaveTypeService {
    switch (type) {
      case 'firebase':
        if (!db) throw new Error('Firebase DB instance required');
        return new FirebaseLeaveTypeService(db);
      case 'mock':
        return new MockLeaveTypeService();
      default:
        return new MockLeaveTypeService();
    }
  }

  static createEmployeeService(type: 'firebase' | 'mock', db?: Firestore): IEmployeeService {
    switch (type) {
      case 'firebase':
        if (!db) throw new Error('Firebase DB instance required');
        return new FirebaseEmployeeService(db);
      case 'mock':
        return new MockEmployeeService();
      default:
        return new MockEmployeeService();
    }
  }
}

// Async functions to get properly configured services
export const getLeaveRequestService = async (): Promise<ILeaveRequestService> => {
  try {
    await initializeFirebase();
    const config = await getServiceConfig();

    if (config.defaultService === 'firebase' && config.firebase.enabled && config.firebase.db) {
      console.log('Using Firebase Leave Request Service');
      return LeaveServiceFactory.createLeaveRequestService('firebase', config.firebase.db);
    } else {
      console.log('Using Mock Leave Request Service');
      return LeaveServiceFactory.createLeaveRequestService('mock');
    }
  } catch (error) {
    console.warn('Failed to initialize Firebase Leave Request Service, falling back to Mock');
    return new MockLeaveRequestService();
  }
};

export const getLeaveTypeService = async (): Promise<ILeaveTypeService> => {
  try {
    await initializeFirebase();
    const config = await getServiceConfig();

    if (config.defaultService === 'firebase' && config.firebase.enabled && config.firebase.db) {
      console.log('Using Firebase Leave Type Service');
      return LeaveServiceFactory.createLeaveTypeService('firebase', config.firebase.db);
    } else {
      console.log('Using Mock Leave Type Service');
      return LeaveServiceFactory.createLeaveTypeService('mock');
    }
  } catch (error) {
    console.warn('Failed to initialize Firebase Leave Type Service, falling back to Mock');
    return new MockLeaveTypeService();
  }
};

export const getEmployeeService = async (): Promise<IEmployeeService> => {
  try {
    await initializeFirebase();
    const config = await getServiceConfig();

    if (config.defaultService === 'firebase' && config.firebase.enabled && config.firebase.db) {
      console.log('Using Firebase Employee Service');
      return LeaveServiceFactory.createEmployeeService('firebase', config.firebase.db);
    } else {
      console.log('Using Mock Employee Service');
      return LeaveServiceFactory.createEmployeeService('mock');
    }
  } catch (error) {
    console.warn('Failed to initialize Firebase Employee Service, falling back to Mock');
    return new MockEmployeeService();
  }
};

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
    const leaveTypeService = await getLeaveTypeService();
    const employeeService = await getEmployeeService();

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

// For compatibility - these will start as mock services until Firebase is ready
let leaveRequestService: ILeaveRequestService = new MockLeaveRequestService();
let leaveTypeService: ILeaveTypeService = new MockLeaveTypeService();
let employeeService: IEmployeeService = new MockEmployeeService();

// Initialize services asynchronously
(async () => {
  try {
    leaveRequestService = await getLeaveRequestService();
    leaveTypeService = await getLeaveTypeService();
    employeeService = await getEmployeeService();
  } catch (error) {
    console.error('Error initializing leave services:', error);
  }
})();

// Export service instances
export { leaveRequestService, leaveTypeService, employeeService };

// Export types for use in components
export type { LeaveRequest, LeaveType, Employee };