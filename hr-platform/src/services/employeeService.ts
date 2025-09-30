import { Employee } from '../pages/Hr/CoreHr/EmployeeManagement/types';
import { getServiceConfig, initializeFirebase } from '../config/firebase';
import { Firestore } from 'firebase/firestore';

// Abstract interface for employee operations
export interface IEmployeeService {
  getEmployees(): Promise<Employee[]>;
  getEmployeeById(id: string): Promise<Employee | null>;
  createEmployee(employee: Omit<Employee, 'id'>): Promise<Employee>;
  updateEmployee(id: string, employee: Partial<Employee>): Promise<Employee>;
  deleteEmployee(id: string): Promise<boolean>;
  searchEmployees(query: string): Promise<Employee[]>;
}

// Firebase implementation
export class FirebaseEmployeeService implements IEmployeeService {
  private db: Firestore;

  constructor(db: Firestore) {
    this.db = db;
  }

  async getEmployees(): Promise<Employee[]> {
    try {
      const { collection, getDocs, query, orderBy } = await import('firebase/firestore');
      const employeesRef = collection(this.db, 'employees');
      const q = query(employeesRef, orderBy('name'));
      const querySnapshot = await getDocs(q);

      return querySnapshot.docs.map((doc, index) => {
        const data = doc.data();
        return {
          id: this.hashStringToNumber(doc.id) + index,
          firebaseId: doc.id, // Keep the original Firebase ID for operations
          name: data.name,
          role: data.role,
          department: data.department,
          employmentType: data.employmentType,
          status: data.status,
          email: data.email || '', // Provide default value if email is undefined
          phone: data.phone || '', // Provide default value if phone is undefined
          address: data.address || '', // Provide default value if address is undefined
          hireDate: data.hireDate || '', // Provide default value if hireDate is undefined
        } as Employee;
      });
    } catch (error) {
      console.error('Error fetching employees:', error);
      return [];
    }
  }

  // Helper function to convert string to unique number
  private hashStringToNumber(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  }

  async getEmployeeById(id: string): Promise<Employee | null> {
    try {
      const { doc, getDoc } = await import('firebase/firestore');
      const employeeRef = doc(this.db, 'employees', id);
      const employeeSnap = await getDoc(employeeRef);

      if (employeeSnap.exists()) {
        return {
          id: employeeSnap.id.length > 10 ? Date.now() + Math.random() : parseInt(employeeSnap.id) || Date.now(),
          ...employeeSnap.data()
        } as Employee;
      }
      return null;
    } catch (error) {
      console.error('Error fetching employee:', error);
      return null;
    }
  }

  async createEmployee(employee: Omit<Employee, 'id'>): Promise<Employee> {
    try {
      const { collection, addDoc } = await import('firebase/firestore');
      const employeesRef = collection(this.db, 'employees');
      const docRef = await addDoc(employeesRef, employee);

      return {
        id: docRef.id.length > 10 ? Date.now() + Math.random() : parseInt(docRef.id) || Date.now(),
        ...employee
      } as Employee;
    } catch (error) {
      console.error('Error creating employee:', error);
      throw new Error('Failed to create employee');
    }
  }

  async updateEmployee(id: string, employee: Partial<Employee>): Promise<Employee> {
    try {
      const { doc, updateDoc } = await import('firebase/firestore');
      const employeeRef = doc(this.db, 'employees', id);
      await updateDoc(employeeRef, employee);

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
        employee.name.toLowerCase().includes(lowercaseQuery) ||
        employee.email?.toLowerCase().includes(lowercaseQuery) ||
        employee.role.toLowerCase().includes(lowercaseQuery) ||
        employee.department.toLowerCase().includes(lowercaseQuery)
      );
    } catch (error) {
      console.error('Error searching employees:', error);
      return [];
    }
  }
}

// Mock service for development/testing
export class MockEmployeeService implements IEmployeeService {
  private employees: Employee[] = [];

  async getEmployees(): Promise<Employee[]> {
    return Promise.resolve(this.employees);
  }

  async getEmployeeById(id: string): Promise<Employee | null> {
    const employee = this.employees.find(emp => emp.id.toString() === id);
    return Promise.resolve(employee || null);
  }

  async createEmployee(employee: Omit<Employee, 'id'>): Promise<Employee> {
    console.log('MockEmployeeService.createEmployee called with:', employee);
    const newEmployee = { ...employee, id: Date.now() } as Employee;
    this.employees.push(newEmployee);
    console.log('MockEmployeeService.createEmployee returning:', newEmployee);
    console.log('Total employees now:', this.employees.length);
    return Promise.resolve(newEmployee);
  }

  async updateEmployee(id: string, employee: Partial<Employee>): Promise<Employee> {
    const index = this.employees.findIndex(emp => emp.id.toString() === id);
    if (index === -1) throw new Error('Employee not found');

    this.employees[index] = { ...this.employees[index], ...employee };
    return Promise.resolve(this.employees[index]);
  }

  async deleteEmployee(id: string): Promise<boolean> {
    const index = this.employees.findIndex(emp => emp.id.toString() === id);
    if (index === -1) return false;

    this.employees.splice(index, 1);
    return Promise.resolve(true);
  }

  async searchEmployees(query: string): Promise<Employee[]> {
    const lowercaseQuery = query.toLowerCase();
    const filtered = this.employees.filter(employee =>
      employee.name.toLowerCase().includes(lowercaseQuery) ||
      employee.email?.toLowerCase().includes(lowercaseQuery) ||
      employee.role.toLowerCase().includes(lowercaseQuery) ||
      employee.department.toLowerCase().includes(lowercaseQuery)
    );
    return Promise.resolve(filtered);
  }
}

// Service factory
export class EmployeeServiceFactory {
  static createService(type: 'firebase' | 'mock', db?: Firestore): IEmployeeService {
    console.log('EmployeeServiceFactory.createService called with:', { type, hasDb: !!db });
    switch (type) {
      case 'firebase':
        if (!db) throw new Error('Firebase DB instance required');
        console.log('Creating FirebaseEmployeeService');
        return new FirebaseEmployeeService(db);
      case 'mock':
        console.log('Creating MockEmployeeService');
        return new MockEmployeeService();
      default:
        console.log('Creating MockEmployeeService (default)');
        return new MockEmployeeService();
    }
  }
}

// Async function to get the properly configured employee service
export const getEmployeeService = async (): Promise<IEmployeeService> => {
  try {
    console.log('Getting employee service...');
    await initializeFirebase(); // Wait for Firebase to be ready
    const config = await getServiceConfig();
    console.log('Service config:', config);

    if (config.defaultService === 'firebase' && config.firebase.enabled && config.firebase.db) {
      console.log('Using Firebase Employee Service');
      return EmployeeServiceFactory.createService('firebase', config.firebase.db);
    } else {
      console.log('Using Mock Employee Service');
      return EmployeeServiceFactory.createService('mock');
    }
  } catch (error) {
    console.warn('Failed to initialize Firebase Employee Service, falling back to Mock:', error);
    return new MockEmployeeService();
  }
};

// For compatibility - but this will start as mock until Firebase is ready
let employeeService: IEmployeeService = new MockEmployeeService();

// Initialize the service asynchronously
(async () => {
  try {
    employeeService = await getEmployeeService();
  } catch (error) {
    console.error('Error initializing employee service:', error);
  }
})();

export { employeeService };