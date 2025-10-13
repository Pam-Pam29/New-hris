import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../../../../config/firebase';
import type { Employee } from '../types';

export interface EmployeeSyncData {
    employeeId: string;
    personalInfo?: any;
    contactInfo?: any;
    bankingInfo?: any;
    skills?: any[];
    emergencyContacts?: any[];
    documents?: any[];
    updatedAt: Date;
}

class EmployeeSyncService {
    // Sync employee data from Employee Dashboard to HR Employee Management
    async syncEmployeeData(employeeId: string, syncData: Partial<EmployeeSyncData>): Promise<boolean> {
        try {
            const employeeRef = doc(db, 'employees', employeeId);
            const employeeDoc = await getDoc(employeeRef);

            if (!employeeDoc.exists()) {
                // Create new employee record
                await setDoc(employeeRef, {
                    employeeId,
                    ...syncData,
                    createdAt: serverTimestamp(),
                    updatedAt: serverTimestamp()
                });
            } else {
                // Update existing employee record
                await updateDoc(employeeRef, {
                    ...syncData,
                    updatedAt: serverTimestamp()
                });
            }

            return true;
        } catch (error) {
            console.error('Error syncing employee data:', error);
            return false;
        }
    }

    // Get employee data for HR Employee Management
    async getEmployeeForHR(employeeId: string): Promise<Employee | null> {
        try {
            const employeeRef = doc(db, 'employees', employeeId);
            const employeeDoc = await getDoc(employeeRef);

            if (!employeeDoc.exists()) {
                return null;
            }

            const data = employeeDoc.data();
            return {
                id: data.employeeId || employeeId,
                employeeId: data.employeeId || employeeId,
                name: data.personalInfo ?
                    `${data.personalInfo.firstName} ${data.personalInfo.lastName}` :
                    data.name || 'Unknown',
                email: data.contactInfo?.email || data.email,
                workEmail: data.contactInfo?.workEmail || data.workEmail,
                role: data.role || 'Employee',
                department: data.department || 'General',
                employmentType: data.employmentType || 'Full-time',
                status: data.status || 'active',
                dateStarted: data.dateStarted,
                phone: data.contactInfo?.phone || data.phone,
                address: data.contactInfo?.address ?
                    `${data.contactInfo.address.street}, ${data.contactInfo.address.city}` :
                    data.address,
                location: data.location,
                gender: data.personalInfo?.gender || data.gender,
                dob: data.personalInfo?.dateOfBirth?.toDate?.()?.toLocaleDateString() || data.dob,
                nationalId: data.personalInfo?.nationalId || data.nationalId,
                manager: data.manager,
                avatar: data.personalInfo?.profilePhoto || data.avatar,
                personalInfo: data.personalInfo,
                contactInfo: data.contactInfo,
                bankingInfo: data.bankingInfo,
                skills: data.skills,
                emergencyContacts: data.emergencyContacts,
                documents: data.documents,
                notes: data.notes
            } as Employee;
        } catch (error) {
            console.error('Error getting employee for HR:', error);
            return null;
        }
    }

    // Get all employees for HR Employee Management
    async getAllEmployeesForHR(): Promise<Employee[]> {
        try {
            // This would typically use a collection query
            // For now, we'll return an empty array and let the existing service handle it
            return [];
        } catch (error) {
            console.error('Error getting all employees for HR:', error);
            return [];
        }
    }

    // Update employee status from HR
    async updateEmployeeStatus(employeeId: string, status: string): Promise<boolean> {
        try {
            const employeeRef = doc(db, 'employees', employeeId);
            await updateDoc(employeeRef, {
                status,
                updatedAt: serverTimestamp()
            });
            return true;
        } catch (error) {
            console.error('Error updating employee status:', error);
            return false;
        }
    }

    // Update employee role/department from HR
    async updateEmployeeRole(employeeId: string, role: string, department: string): Promise<boolean> {
        try {
            const employeeRef = doc(db, 'employees', employeeId);
            await updateDoc(employeeRef, {
                role,
                department,
                updatedAt: serverTimestamp()
            });
            return true;
        } catch (error) {
            console.error('Error updating employee role:', error);
            return false;
        }
    }

    // Link employee to Employee Dashboard
    async linkEmployeeToDashboard(employeeId: string, dashboardData: any): Promise<boolean> {
        try {
            const employeeRef = doc(db, 'employees', employeeId);
            await updateDoc(employeeRef, {
                dashboardLinked: true,
                dashboardData,
                updatedAt: serverTimestamp()
            });
            return true;
        } catch (error) {
            console.error('Error linking employee to dashboard:', error);
            return false;
        }
    }
}

export const employeeSyncService = new EmployeeSyncService();





