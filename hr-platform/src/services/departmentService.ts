import { collection, getDocs, query, where, orderBy } from 'firebase/firestore';
import { getFirebaseDb } from '../config/firebase';

export interface Department {
    id: string;
    companyId: string;
    name: string;
    description?: string;
    managerId?: string;
    budget?: number;
    location?: string;
    createdAt: Date;
    updatedAt: Date;
}

export class DepartmentService {
    private db = getFirebaseDb();

    /**
     * Get all departments for a specific company
     */
    async getDepartmentsByCompany(companyId: string): Promise<Department[]> {
        try {
            console.log('📋 [DepartmentService] Fetching departments for company:', companyId);

            const departmentsRef = collection(this.db, 'departments');

            // First, let's check if there are ANY departments at all
            const allDepartmentsQuery = query(departmentsRef);
            const allSnapshot = await getDocs(allDepartmentsQuery);
            console.log(`🔍 [DepartmentService] Total departments in collection: ${allSnapshot.size}`);

            if (allSnapshot.size > 0) {
                console.log('🔍 [DepartmentService] Sample department data:');
                allSnapshot.forEach((doc, index) => {
                    if (index < 3) { // Show first 3 for debugging
                        const data = doc.data();
                        console.log(`  - Doc ${doc.id}:`, {
                            companyId: data.companyId,
                            name: data.name,
                            description: data.description
                        });
                    }
                });
            }

            // Try without orderBy first (in case of indexing issues)
            let q = query(
                departmentsRef,
                where('companyId', '==', companyId)
            );

            const snapshot = await getDocs(q);
            const departments: Department[] = [];

            snapshot.forEach((doc) => {
                const data = doc.data();
                console.log(`📋 [DepartmentService] Processing department:`, {
                    id: doc.id,
                    companyId: data.companyId,
                    name: data.name
                });
                departments.push({
                    id: doc.id,
                    companyId: data.companyId,
                    name: data.name,
                    description: data.description,
                    managerId: data.managerId,
                    budget: data.budget,
                    location: data.location,
                    createdAt: data.createdAt?.toDate() || new Date(),
                    updatedAt: data.updatedAt?.toDate() || new Date()
                });
            });

            // Sort departments by name manually
            departments.sort((a, b) => a.name.localeCompare(b.name));

            console.log(`✅ [DepartmentService] Found ${departments.length} departments for company ${companyId}`);
            console.log(`📋 [DepartmentService] Department names:`, departments.map(d => d.name));
            return departments;

        } catch (error) {
            console.error('❌ [DepartmentService] Error fetching departments:', error);
            console.error('❌ [DepartmentService] Error details:', error);
            throw new Error(`Failed to fetch departments: ${error}`);
        }
    }

    /**
     * Get department names as a simple array for dropdowns
     */
    async getDepartmentNames(companyId: string): Promise<string[]> {
        try {
            const departments = await this.getDepartmentsByCompany(companyId);
            return departments.map(dept => dept.name);
        } catch (error) {
            console.error('❌ [DepartmentService] Error fetching department names:', error);
            // Return fallback departments if there's an error
            return [
                'Human Resources',
                'Engineering',
                'Marketing',
                'Sales',
                'Finance',
                'Operations',
                'Customer Support',
                'Legal',
                'Administration'
            ];
        }
    }

    /**
     * Get department options for dropdown components
     */
    async getDepartmentOptions(companyId: string): Promise<Array<{ value: string, label: string }>> {
        try {
            const departments = await this.getDepartmentsByCompany(companyId);
            return departments.map(dept => ({
                value: dept.name,
                label: dept.name
            }));
        } catch (error) {
            console.error('❌ [DepartmentService] Error fetching department options:', error);
            // Return fallback options if there's an error
            return [
                { value: 'Human Resources', label: 'Human Resources' },
                { value: 'Engineering', label: 'Engineering' },
                { value: 'Marketing', label: 'Marketing' },
                { value: 'Sales', label: 'Sales' },
                { value: 'Finance', label: 'Finance' },
                { value: 'Operations', label: 'Operations' },
                { value: 'Customer Support', label: 'Customer Support' },
                { value: 'Legal', label: 'Legal' },
                { value: 'Administration', label: 'Administration' }
            ];
        }
    }

    /**
     * Get department by ID
     */
    async getDepartmentById(departmentId: string): Promise<Department | null> {
        try {
            const departmentsRef = collection(this.db, 'departments');
            const q = query(departmentsRef, where('__name__', '==', departmentId));
            const snapshot = await getDocs(q);

            if (snapshot.empty) {
                return null;
            }

            const doc = snapshot.docs[0];
            const data = doc.data();

            return {
                id: doc.id,
                companyId: data.companyId,
                name: data.name,
                description: data.description,
                managerId: data.managerId,
                budget: data.budget,
                location: data.location,
                createdAt: data.createdAt?.toDate() || new Date(),
                updatedAt: data.updatedAt?.toDate() || new Date()
            };

        } catch (error) {
            console.error('❌ [DepartmentService] Error fetching department by ID:', error);
            return null;
        }
    }
}

// Create singleton instance
export const departmentService = new DepartmentService();
