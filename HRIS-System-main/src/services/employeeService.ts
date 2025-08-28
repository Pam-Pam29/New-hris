import { Employee } from '../pages/Hr/CoreHr/EmployeeManagement/types';
import { SERVICE_CONFIG, db } from '../config/firebase';

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
  private db: any;

  constructor(db: any) {
    this.db = db;
  }

  async getEmployees(): Promise<Employee[]> {
    try {
      const { collection, getDocs, query, orderBy } = await import('firebase/firestore');
      const employeesRef = collection(this.db, 'employees');
      const q = query(employeesRef, orderBy('name'));
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        id: parseInt(doc.id) || 0, // Convert string ID to number for compatibility
        ...doc.data()
      })) as Employee[];
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
        return { id: parseInt(employeeSnap.id) || 0, ...employeeSnap.data() } as Employee;
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
      
      return { id: parseInt(docRef.id) || 0, ...employee } as Employee;
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

// Mock service for development/testing (can easily switch to this)
export class MockEmployeeService implements IEmployeeService {
  private employees: Employee[] = [
    // Comment out existing mock employees as requested
    // {
    //   id: 1,
    //   avatar: 'https://randomuser.me/api/portraits/women/1.jpg',
    //   name: "Jane Doe",
    //   email: "jane.doe@example.com",
    //   role: "Software Engineer",
    //   department: "Engineering",
    //   employmentType: "Full-time",
    //   status: "Active",
    //   dateStarted: "2022-01-15",
    //   phone: "555-123-4567",
    //   address: "123 Main St, Springfield",
    //   location: "Lagos",
    //   gender: "Female",
    //   dob: "1990-05-10",
    //   nationalId: "A123456789",
    //   manager: "John Smith",
    //   documents: [
    //     { name: "Offer Letter.pdf", url: "#" },
    //     { name: "ID Card.jpg", url: "#" }
    //   ],
    //   emergencyContact: {
    //     name: "Mary Doe",
    //     phone: "555-987-6543",
    //     relationship: "Mother"
    //   },
    //   notes: "Excellent performer."
    // }
  ];

  async getEmployees(): Promise<Employee[]> {
    return Promise.resolve(this.employees);
  }

  async getEmployeeById(id: string): Promise<Employee | null> {
    const employee = this.employees.find(emp => emp.id.toString() === id);
    return Promise.resolve(employee || null);
  }

  async createEmployee(employee: Omit<Employee, 'id'>): Promise<Employee> {
    const newEmployee = { ...employee, id: Date.now() } as Employee;
    this.employees.push(newEmployee);
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

// Service factory - easily switch between implementations
export class EmployeeServiceFactory {
  static createService(type: 'firebase' | 'mock', db?: any): IEmployeeService {
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

// Default export - automatically chooses the best service based on configuration
export const employeeService = (() => {
  const config = SERVICE_CONFIG;
  
  if (config.defaultService === 'firebase' && config.firebase.enabled && config.firebase.db) {
    console.log('Using Firebase Employee Service');
    return EmployeeServiceFactory.createService('firebase', config.firebase.db);
  } else {
    console.log('Using Mock Employee Service');
    return EmployeeServiceFactory.createService('mock');
  }
})();
