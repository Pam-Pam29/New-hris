// Backend Service Layer - Easy switching between Firebase and other backends
// This service layer abstracts the backend implementation details

import { getServiceConfig } from '../config/firebase';
import { Firestore } from 'firebase/firestore';

interface Employee {
  id: string;
  name?: string;
  email?: string;
  role?: string;
  department?: string;
  // Add other employee properties here
}

interface AttendanceRecord {
  id: string;
  date?: string;
  // Add other attendance record properties here
}

interface PayrollRecord {
  id: string;
  date?: string;
  // Add other payroll record properties here
}

// Generic interface for any backend service
export interface IBackendService {
  // Employee operations
  getEmployees(): Promise<Employee[]>;
  getEmployeeById(id: string): Promise<Employee | null>;
  createEmployee(employee: Employee): Promise<Employee>;
  updateEmployee(id: string, employee: Employee): Promise<Employee>;
  deleteEmployee(id: string): Promise<boolean>;
  searchEmployees(query: string): Promise<Employee[]>;

  // Time management operations
  getAttendanceRecords(): Promise<AttendanceRecord[]>;
  createAttendanceRecord(record: AttendanceRecord): Promise<AttendanceRecord>;
  updateAttendanceRecord(id: string, record: AttendanceRecord): Promise<AttendanceRecord>;
  deleteAttendanceRecord(id: string): Promise<boolean>;

  // Payroll operations
  getPayrollRecords(): Promise<PayrollRecord[]>;
  createPayrollRecord(record: PayrollRecord): Promise<PayrollRecord>;
  updatePayrollRecord(id: string, record: PayrollRecord): Promise<PayrollRecord>;
  deletePayrollRecord(id: string): Promise<boolean>;
}

// Firebase implementation
export class FirebaseBackendService implements IBackendService {
  private db: Firestore;

  constructor(db: Firestore) {
    this.db = db;
  }

  // Employee operations
  async getEmployees(): Promise<Employee[]> {
    try {
      const { collection, getDocs, query, orderBy } = await import('firebase/firestore');
      const employeesRef = collection(this.db, 'employees');
      const q = query(employeesRef, orderBy('name'));
      const querySnapshot = await getDocs(q);

      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error fetching employees:', error);
      return [];
    }
  }

  async getEmployeeById(id: string): Promise<Employee | null> {
    try {
      const { doc, getDoc } = await import('firebase/firestore');
      const employeeRef = doc(this.db, 'employees', id);
      const employeeSnap = await getDoc(employeeRef);

      if (employeeSnap.exists()) {
        return { id: employeeSnap.id, ...employeeSnap.data() };
      }
      return null;
    } catch (error) {
      console.error('Error fetching employee:', error);
      return null;
    }
  }

  async createEmployee(employee: Employee): Promise<Employee> {
    try {
      const { collection, addDoc } = await import('firebase/firestore');
      const employeesRef = collection(this.db, 'employees');
      const docRef = await addDoc(employeesRef, employee);

      return { id: docRef.id, ...employee };
    } catch (error) {
      console.error('Error creating employee:', error);
      throw new Error('Failed to create employee');
    }
  }

  async updateEmployee(id: string, employee: Employee): Promise<Employee> {
    try {
      const { doc, updateDoc } = await import('firebase/firestore');
      const employeeRef = doc(this.db, 'employees', id);
      await updateDoc(employeeRef, employee as any);

      const updatedEmployee = await this.getEmployeeById(id);
      if (!updatedEmployee) throw new Error('Employee not found');

      return updatedEmployee;
    } catch (error) {
      console.error('Error updating employee:', error);
      throw new Error('Failed to update employee');
    }
  }

  async deleteEmployee(id: string): Promise<boolean> {
    try {
      const { doc, deleteDoc } = await import('firebase/firestore');
      const employeeRef = doc(this.db, 'employees', id);
      await deleteDoc(employeeRef);
      return true;
    } catch (error) {
      console.error('Error deleting employee:', error);
      return false;
    }
  }

  async searchEmployees(query: string): Promise<Employee[]> {
    try {
      const employees = await this.getEmployees();
      const lowercaseQuery = query.toLowerCase();

      return employees.filter(employee =>
        employee.name?.toLowerCase().includes(lowercaseQuery) ||
        employee.email?.toLowerCase().includes(lowercaseQuery) ||
        employee.role?.toLowerCase().includes(lowercaseQuery) ||
        employee.department?.toLowerCase().includes(lowercaseQuery)
      );
    } catch (error) {
      console.error('Error searching employees:', error);
      return [];
    }
  }

  // Time management operations
  async getAttendanceRecords(): Promise<AttendanceRecord[]> {
    try {
      const { collection, getDocs, query, orderBy } = await import('firebase/firestore');
      const attendanceRef = collection(this.db, 'attendance');
      const q = query(attendanceRef, orderBy('date', 'desc'));
      const querySnapshot = await getDocs(q);

      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error fetching attendance records:', error);
      return [];
    }
  }

  async createAttendanceRecord(record: AttendanceRecord): Promise<AttendanceRecord> {
    try {
      const { collection, addDoc } = await import('firebase/firestore');
      const attendanceRef = collection(this.db, 'attendance');
      const docRef = await addDoc(attendanceRef, record);

      return { id: docRef.id, ...record };
    } catch (error) {
      console.error('Error creating attendance record:', error);
      throw new Error('Failed to create attendance record');
    }
  }

  async updateAttendanceRecord(id: string, record: AttendanceRecord): Promise<AttendanceRecord> {
    try {
      const { doc, updateDoc } = await import('firebase/firestore');
      const attendanceRef = doc(this.db, 'attendance', id);
      await updateDoc(attendanceRef, record as any);

      return { id, ...record };
    } catch (error) {
      console.error('Error updating attendance record:', error);
      throw new Error('Failed to update attendance record');
    }
  }

  async deleteAttendanceRecord(id: string): Promise<boolean> {
    try {
      const { doc, deleteDoc } = await import('firebase/firestore');
      const attendanceRef = doc(this.db, 'attendance', id);
      await deleteDoc(attendanceRef);
      return true;
    } catch (error) {
      console.error('Error deleting attendance record:', error);
      return false;
    }
  }

  // Payroll operations
  async getPayrollRecords(): Promise<PayrollRecord[]> {
    try {
      const { collection, getDocs, query, orderBy } = await import('firebase/firestore');
      const payrollRef = collection(this.db, 'payroll');
      const q = query(payrollRef, orderBy('date', 'desc'));
      const querySnapshot = await getDocs(q);

      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error fetching payroll records:', error);
      return [];
    }
  }

  async createPayrollRecord(record: PayrollRecord): Promise<PayrollRecord> {
    try {
      const { collection, addDoc } = await import('firebase/firestore');
      const payrollRef = collection(this.db, 'payroll');
      const docRef = await addDoc(payrollRef, record);

      return { id: docRef.id, ...record };
    } catch (error) {
      console.error('Error creating payroll record:', error);
      throw new Error('Failed to create payroll record');
    }
  }

  async updatePayrollRecord(id: string, record: PayrollRecord): Promise<PayrollRecord> {
    try {
      const { doc, updateDoc } = await import('firebase/firestore');
      const payrollRef = doc(this.db, 'payroll', id);
      await updateDoc(payrollRef, record as any);

      return { id, ...record };
    } catch (error) {
      console.error('Error updating payroll record:', error);
      throw new Error('Failed to update payroll record');
    }
  }

  async deletePayrollRecord(id: string): Promise<boolean> {
    try {
      const { doc, deleteDoc } = await import('firebase/firestore');
      const payrollRef = doc(this.db, 'payroll', id);
      await deleteDoc(payrollRef);
      return true;
    } catch (error) {
      console.error('Error deleting payroll record:', error);
      return false;
    }
  }
}

// Mock implementation for development/testing
export class MockBackendService implements IBackendService {
  private employees: Employee[] = [];
  private attendanceRecords: AttendanceRecord[] = [];
  private payrollRecords: PayrollRecord[] = [];

  // Employee operations
  async getEmployees(): Promise<Employee[]> {
    return Promise.resolve(this.employees);
  }

  async getEmployeeById(id: string): Promise<Employee | null> {
    const employee = this.employees.find(emp => emp.id === id);
    return Promise.resolve(employee || null);
  }

  async createEmployee(employee: Employee): Promise<Employee> {
    const newEmployee = { ...employee, id: Date.now().toString() };
    this.employees.push(newEmployee);
    return Promise.resolve(newEmployee);
  }

  async updateEmployee(id: string, employee: Employee): Promise<Employee> {
    const index = this.employees.findIndex(emp => emp.id === id);
    if (index === -1) throw new Error('Employee not found');

    this.employees[index] = { ...this.employees[index], ...employee };
    return Promise.resolve(this.employees[index]);
  }

  async deleteEmployee(id: string): Promise<boolean> {
    const index = this.employees.findIndex(emp => emp.id === id);
    if (index === -1) return false;

    this.employees.splice(index, 1);
    return Promise.resolve(true);
  }

  async searchEmployees(query: string): Promise<Employee[]> {
    const lowercaseQuery = query.toLowerCase();
    const filtered = this.employees.filter(employee =>
      employee.name?.toLowerCase().includes(lowercaseQuery) ||
      employee.email?.toLowerCase().includes(lowercaseQuery) ||
      employee.role?.toLowerCase().includes(lowercaseQuery) ||
      employee.department?.toLowerCase().includes(lowercaseQuery)
    );
    return Promise.resolve(filtered);
  }

  // Time management operations
  async getAttendanceRecords(): Promise<AttendanceRecord[]> {
    return Promise.resolve(this.attendanceRecords);
  }

  async createAttendanceRecord(record: AttendanceRecord): Promise<AttendanceRecord> {
    const newRecord = { ...record, id: Date.now().toString() };
    this.attendanceRecords.push(newRecord);
    return Promise.resolve(newRecord);
  }

  async updateAttendanceRecord(id: string, record: AttendanceRecord): Promise<AttendanceRecord> {
    const index = this.attendanceRecords.findIndex(rec => rec.id === id);
    if (index === -1) throw new Error('Attendance record not found');

    this.attendanceRecords[index] = { ...this.attendanceRecords[index], ...record };
    return Promise.resolve(this.attendanceRecords[index]);
  }

  async deleteAttendanceRecord(id: string): Promise<boolean> {
    const index = this.attendanceRecords.findIndex(rec => rec.id === id);
    if (index === -1) return false;

    this.attendanceRecords.splice(index, 1);
    return Promise.resolve(true);
  }

  // Payroll operations
  async getPayrollRecords(): Promise<PayrollRecord[]> {
    return Promise.resolve(this.payrollRecords);
  }

  async createPayrollRecord(record: PayrollRecord): Promise<PayrollRecord> {
    const newRecord = { ...record, id: Date.now().toString() };
    this.payrollRecords.push(newRecord);
    return Promise.resolve(newRecord);
  }

  async updatePayrollRecord(id: string, record: PayrollRecord): Promise<PayrollRecord> {
    const index = this.payrollRecords.findIndex(rec => rec.id === id);
    if (index === -1) throw new Error('Payroll record not found');

    this.payrollRecords[index] = { ...this.payrollRecords[index], ...record };
    return Promise.resolve(this.payrollRecords[index]);
  }

  async deletePayrollRecord(id: string): Promise<boolean> {
    const index = this.payrollRecords.findIndex(rec => rec.id === id);
    if (index === -1) return false;

    this.payrollRecords.splice(index, 1);
    return Promise.resolve(true);
  }
}

// Service factory - easily switch between implementations
export class BackendServiceFactory {
  static createService(type: 'firebase' | 'mock', db?: Firestore): IBackendService {
    switch (type) {
      case 'firebase':
        if (!db) throw new Error('Firebase DB instance required');
        return new FirebaseBackendService(db);
      case 'mock':
        return new MockBackendService();
      default:
        return new MockBackendService();
    }
  }
}

// Async function to get the properly configured backend service
export const getBackendService = async (): Promise<IBackendService> => {
  const config = await getServiceConfig();

  if (config.defaultService === 'firebase' && config.firebase.enabled && config.firebase.db) {
    console.log('Using Firebase Backend Service');
    return BackendServiceFactory.createService('firebase', config.firebase.db);
  } else {
    console.log('Using Mock Backend Service');
    return BackendServiceFactory.createService('mock');
  }
};

// For immediate use (but will be mock initially)
let backendService: IBackendService = new MockBackendService();

// Initialize the service asynchronously
(async () => {
  backendService = await getBackendService();
})();

export { backendService };

// Easy switching function
export const switchBackend = (type: 'firebase' | 'mock', db?: Firestore): IBackendService => {
  return BackendServiceFactory.createService(type, db);
};