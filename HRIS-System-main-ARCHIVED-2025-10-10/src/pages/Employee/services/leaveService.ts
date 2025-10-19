import { doc, getDoc, setDoc, updateDoc, serverTimestamp, collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../../../config/firebase';

export interface LeaveType {
    id: string;
    name: string;
    description: string;
    maxDays: number;
    accrualRate: number; // days per month
    carryForward: boolean;
    requiresApproval: boolean;
    color: string;
    active: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export interface LeaveRequest {
    id: string;
    employeeId: string;
    leaveTypeId: string;
    leaveTypeName: string;
    startDate: Date;
    endDate: Date;
    totalDays: number;
    reason: string;
    status: 'pending' | 'approved' | 'rejected' | 'cancelled';
    submittedAt: Date;
    reviewedAt?: Date;
    reviewedBy?: string;
    comments?: string;
    attachments?: string[];
}

export interface LeaveBalance {
    id: string;
    employeeId: string;
    leaveTypeId: string;
    leaveTypeName: string;
    totalDays: number;
    usedDays: number;
    remainingDays: number;
    accruedDays: number;
    carryForwardDays: number;
    year: number;
    updatedAt: Date;
}

class LeaveService {
    // Get all leave types
    async getLeaveTypes(): Promise<LeaveType[]> {
        // Mock data for testing - replace with Firebase when indexes are ready
        return [
            {
                id: 'lt-001',
                name: 'Annual Leave',
                description: 'Paid time off for vacation and personal time',
                maxDays: 20,
                accrualRate: 1.67,
                carryForward: true,
                requiresApproval: true,
                color: '#3B82F6',
                active: true,
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                id: 'lt-002',
                name: 'Sick Leave',
                description: 'Time off for illness and medical appointments',
                maxDays: 10,
                accrualRate: 0.83,
                carryForward: false,
                requiresApproval: false,
                color: '#EF4444',
                active: true,
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                id: 'lt-003',
                name: 'Personal Leave',
                description: 'Unpaid time off for personal matters',
                maxDays: 5,
                accrualRate: 0,
                carryForward: false,
                requiresApproval: true,
                color: '#10B981',
                active: true,
                createdAt: new Date(),
                updatedAt: new Date()
            }
        ];
    }

    // Get employee leave requests
    async getEmployeeLeaveRequests(employeeId: string): Promise<LeaveRequest[]> {
        // Mock data for testing - replace with Firebase when indexes are ready
        return [
            {
                id: 'lr-001',
                employeeId,
                leaveTypeId: 'lt-001',
                leaveTypeName: 'Annual Leave',
                startDate: new Date('2024-12-15'),
                endDate: new Date('2024-12-20'),
                totalDays: 6,
                reason: 'Family vacation',
                status: 'approved',
                submittedAt: new Date('2024-11-01'),
                reviewedAt: new Date('2024-11-02'),
                reviewedBy: 'HR Manager'
            },
            {
                id: 'lr-002',
                employeeId,
                leaveTypeId: 'lt-002',
                leaveTypeName: 'Sick Leave',
                startDate: new Date('2024-11-10'),
                endDate: new Date('2024-11-12'),
                totalDays: 3,
                reason: 'Flu symptoms',
                status: 'approved',
                submittedAt: new Date('2024-11-09'),
                reviewedAt: new Date('2024-11-09'),
                reviewedBy: 'System'
            },
            {
                id: 'lr-003',
                employeeId,
                leaveTypeId: 'lt-001',
                leaveTypeName: 'Annual Leave',
                startDate: new Date('2024-12-25'),
                endDate: new Date('2024-12-27'),
                totalDays: 3,
                reason: 'Holiday break',
                status: 'pending',
                submittedAt: new Date('2024-11-15')
            }
        ];
    }

    // Get employee leave balances
    async getEmployeeLeaveBalances(employeeId: string): Promise<LeaveBalance[]> {
        // Mock data for testing - replace with Firebase when indexes are ready
        return [
            {
                id: 'lb-001',
                employeeId,
                leaveTypeId: 'lt-001',
                leaveTypeName: 'Annual Leave',
                totalDays: 20,
                usedDays: 9,
                remainingDays: 11,
                accruedDays: 20,
                carryForwardDays: 0,
                year: 2024,
                updatedAt: new Date()
            },
            {
                id: 'lb-002',
                employeeId,
                leaveTypeId: 'lt-002',
                leaveTypeName: 'Sick Leave',
                totalDays: 10,
                usedDays: 3,
                remainingDays: 7,
                accruedDays: 10,
                carryForwardDays: 0,
                year: 2024,
                updatedAt: new Date()
            },
            {
                id: 'lb-003',
                employeeId,
                leaveTypeId: 'lt-003',
                leaveTypeName: 'Personal Leave',
                totalDays: 5,
                usedDays: 0,
                remainingDays: 5,
                accruedDays: 0,
                carryForwardDays: 0,
                year: 2024,
                updatedAt: new Date()
            }
        ];
    }

    // Submit leave request
    async submitLeaveRequest(leaveRequest: Omit<LeaveRequest, 'id' | 'submittedAt' | 'status'>): Promise<boolean> {
        // Mock implementation for testing - replace with Firebase when ready
        console.log('Submitting leave request:', leaveRequest);
        return true;
    }

    // Cancel leave request
    async cancelLeaveRequest(requestId: string): Promise<boolean> {
        // Mock implementation for testing - replace with Firebase when ready
        console.log('Cancelling leave request:', requestId);
        return true;
    }

    // Get all leave requests for HR
    async getAllLeaveRequests(): Promise<LeaveRequest[]> {
        // Mock data for testing - replace with Firebase when indexes are ready
        return [
            {
                id: 'lr-001',
                employeeId: 'EMP123456ABC',
                leaveTypeId: 'lt-001',
                leaveTypeName: 'Annual Leave',
                startDate: new Date('2024-12-15'),
                endDate: new Date('2024-12-20'),
                totalDays: 6,
                reason: 'Family vacation',
                status: 'approved',
                submittedAt: new Date('2024-11-01'),
                reviewedAt: new Date('2024-11-02'),
                reviewedBy: 'HR Manager'
            },
            {
                id: 'lr-002',
                employeeId: 'EMP123456ABC',
                leaveTypeId: 'lt-002',
                leaveTypeName: 'Sick Leave',
                startDate: new Date('2024-11-10'),
                endDate: new Date('2024-11-12'),
                totalDays: 3,
                reason: 'Flu symptoms',
                status: 'approved',
                submittedAt: new Date('2024-11-09'),
                reviewedAt: new Date('2024-11-09'),
                reviewedBy: 'System'
            },
            {
                id: 'lr-003',
                employeeId: 'EMP123456ABC',
                leaveTypeId: 'lt-001',
                leaveTypeName: 'Annual Leave',
                startDate: new Date('2024-12-25'),
                endDate: new Date('2024-12-27'),
                totalDays: 3,
                reason: 'Holiday break',
                status: 'pending',
                submittedAt: new Date('2024-11-15')
            },
            {
                id: 'lr-004',
                employeeId: 'EMP789012DEF',
                leaveTypeId: 'lt-003',
                leaveTypeName: 'Personal Leave',
                startDate: new Date('2024-12-01'),
                endDate: new Date('2024-12-03'),
                totalDays: 3,
                reason: 'Personal matters',
                status: 'pending',
                submittedAt: new Date('2024-11-20')
            }
        ];
    }

    // Approve leave request
    async approveLeaveRequest(requestId: string, reviewedBy: string, comments?: string): Promise<boolean> {
        // Mock implementation for testing - replace with Firebase when ready
        console.log('Approving leave request:', { requestId, reviewedBy, comments });
        return true;
    }

    // Reject leave request
    async rejectLeaveRequest(requestId: string, reviewedBy: string, comments?: string): Promise<boolean> {
        try {
            const leaveRequestRef = doc(db, 'leaveRequests', requestId);
            await updateDoc(leaveRequestRef, {
                status: 'rejected',
                reviewedAt: serverTimestamp(),
                reviewedBy,
                comments
            });

            return true;
        } catch (error) {
            console.error('Error rejecting leave request:', error);
            return false;
        }
    }

    // Update leave balance
    private async updateLeaveBalance(employeeId: string, leaveTypeId: string, usedDays: number): Promise<boolean> {
        try {
            const currentYear = new Date().getFullYear();
            const leaveBalanceRef = doc(db, 'leaveBalances', `${employeeId}_${leaveTypeId}_${currentYear}`);
            const leaveBalanceDoc = await getDoc(leaveBalanceRef);

            if (leaveBalanceDoc.exists()) {
                const currentData = leaveBalanceDoc.data();
                await updateDoc(leaveBalanceRef, {
                    usedDays: currentData.usedDays + usedDays,
                    remainingDays: currentData.remainingDays - usedDays,
                    updatedAt: serverTimestamp()
                });
            }

            return true;
        } catch (error) {
            console.error('Error updating leave balance:', error);
            return false;
        }
    }

    // Create leave type (HR only)
    async createLeaveType(leaveType: Omit<LeaveType, 'id' | 'createdAt' | 'updatedAt'>): Promise<boolean> {
        try {
            const leaveTypesRef = collection(db, 'leaveTypes');
            const docRef = doc(leaveTypesRef);

            await setDoc(docRef, {
                ...leaveType,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp()
            });

            return true;
        } catch (error) {
            console.error('Error creating leave type:', error);
            return false;
        }
    }

    // Update leave type (HR only)
    async updateLeaveType(leaveTypeId: string, updates: Partial<LeaveType>): Promise<boolean> {
        try {
            const leaveTypeRef = doc(db, 'leaveTypes', leaveTypeId);
            await updateDoc(leaveTypeRef, {
                ...updates,
                updatedAt: serverTimestamp()
            });

            return true;
        } catch (error) {
            console.error('Error updating leave type:', error);
            return false;
        }
    }

    // Delete leave type (HR only)
    async deleteLeaveType(leaveTypeId: string): Promise<boolean> {
        try {
            const leaveTypeRef = doc(db, 'leaveTypes', leaveTypeId);
            await updateDoc(leaveTypeRef, {
                active: false,
                updatedAt: serverTimestamp()
            });

            return true;
        } catch (error) {
            console.error('Error deleting leave type:', error);
            return false;
        }
    }

    // Get leave requests by status
    async getLeaveRequestsByStatus(status: string): Promise<LeaveRequest[]> {
        try {
            const leaveRequestsRef = collection(db, 'leaveRequests');
            const q = query(
                leaveRequestsRef,
                where('status', '==', status),
                orderBy('submittedAt', 'desc')
            );
            const querySnapshot = await getDocs(q);

            return querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                startDate: doc.data().startDate?.toDate() || new Date(),
                endDate: doc.data().endDate?.toDate() || new Date(),
                submittedAt: doc.data().submittedAt?.toDate() || new Date(),
                reviewedAt: doc.data().reviewedAt?.toDate() || undefined
            })) as LeaveRequest[];
        } catch (error) {
            console.error('Error getting leave requests by status:', error);
            return [];
        }
    }

    // Get employee leave balance for specific type
    async getEmployeeLeaveBalance(employeeId: string, leaveTypeId: string): Promise<LeaveBalance | null> {
        try {
            const currentYear = new Date().getFullYear();
            const leaveBalanceRef = doc(db, 'leaveBalances', `${employeeId}_${leaveTypeId}_${currentYear}`);
            const leaveBalanceDoc = await getDoc(leaveBalanceRef);

            if (leaveBalanceDoc.exists()) {
                const data = leaveBalanceDoc.data();
                return {
                    id: leaveBalanceDoc.id,
                    ...data,
                    updatedAt: data.updatedAt?.toDate() || new Date()
                } as LeaveBalance;
            }

            return null;
        } catch (error) {
            console.error('Error getting employee leave balance:', error);
            return null;
        }
    }
}

export const leaveService = new LeaveService();
