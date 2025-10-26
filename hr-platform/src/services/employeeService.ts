import { Employee } from '../pages/Hr/CoreHr/EmployeeManagement/types';
import { getServiceConfig, initializeFirebase } from '../config/firebase';
import { Firestore } from 'firebase/firestore';

// Abstract interface for employee operations
export interface IEmployeeService {
  getEmployees(companyId?: string): Promise<Employee[]>;
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

  async getEmployees(companyId?: string): Promise<Employee[]> {
    try {
      const { collection, getDocs, query, where } = await import('firebase/firestore');
      const employeesRef = collection(this.db, 'employees');
      
      // Build query with optional company filter for multi-tenancy
      let q = query(employeesRef);
      if (companyId) {
        q = query(employeesRef, where('companyId', '==', companyId));
        console.log(`🏢 Filtering employees by companyId: ${companyId}`);
      }
      
      const querySnapshot = await getDocs(q);

      console.log(`📊 Found ${querySnapshot.docs.length} employees in Firebase${companyId ? ` for company ${companyId}` : ' (all companies)'}`);
      
      // DEBUG: Log sample of companyIds
      if (querySnapshot.docs.length > 0) {
        const sampleCompanyIds = querySnapshot.docs.slice(0, 3).map(doc => doc.data().companyId);
        console.log(`🔍 Sample companyIds:`, sampleCompanyIds);
      }

      return querySnapshot.docs.map((doc, index) => {
        const data = doc.data();

        // Handle both old format (flat) and new format (nested personalInfo)
        const name = data.name || `${data.personalInfo?.firstName || ''} ${data.personalInfo?.lastName || ''}`.trim();
        const email = data.email || data.contactInfo?.workEmail || data.contactInfo?.personalEmail || '';
        const phone = data.phone || data.contactInfo?.workPhone || data.contactInfo?.personalPhone || '';
        const department = data.department || data.workInfo?.department || '';
        const hireDate = data.hireDate || data.workInfo?.hireDate || '';
        const position = data.role || data.workInfo?.position || '';
        const employmentType = data.employmentType || data.workInfo?.employmentType || '';

        const dateOfBirth = data.dateOfBirth || data.personalInfo?.dateOfBirth || data.dob;

        // Normalize hire date to string format
        let normalizedHireDate = '';
        if (hireDate) {
          if (typeof hireDate === 'object' && hireDate.toDate) {
            normalizedHireDate = hireDate.toDate().toISOString();
          } else if (typeof hireDate === 'object' && hireDate.seconds) {
            normalizedHireDate = new Date(hireDate.seconds * 1000).toISOString();
          } else if (typeof hireDate === 'string') {
            normalizedHireDate = hireDate;
          }
        }

        return {
          id: this.hashStringToNumber(doc.id) + index,
          firebaseId: doc.id, // Keep the original Firebase ID for operations
          employeeId: data.employeeId || doc.id,
          companyId: data.companyId, // ← Multi-tenancy: Company ID
          name: name || 'Unknown',
          role: position,
          department: department,
          employmentType: employmentType,
          status: data.status || data.profileStatus?.status || 'active',
          email: email,
          phone: phone,
          address: data.address || data.contactInfo?.address?.street || '',
          hireDate: normalizedHireDate,
          dob: dateOfBirth ? (typeof dateOfBirth === 'string' ? dateOfBirth : dateOfBirth.toISOString?.() || '') : '',
          dateStarted: normalizedHireDate,
          personalInfo: data.personalInfo,
          contactInfo: data.contactInfo,
          bankingInfo: data.bankingInfo,
          skills: data.skills,
          emergencyContacts: data.emergencyContacts || (data.contactInfo?.emergencyContacts ? [data.contactInfo.emergencyContacts] : []),
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

  async getEmployees(companyId?: string): Promise<Employee[]> {
    if (companyId) {
      return Promise.resolve(this.employees.filter(emp => emp.companyId === companyId));
    }
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