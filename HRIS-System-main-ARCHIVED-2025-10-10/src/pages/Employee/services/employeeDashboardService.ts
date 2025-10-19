import {
    EmployeeProfile,
    Contract,
    OnboardingChecklist,
    LeaveRequest,
    LeaveBalance,
    TimeEntry,
    PayrollRecord,
    FinancialRequest,
    BenefitsEnrollment,
    PerformanceGoal,
    PerformanceReview,
    Asset,
    AssetRequest,
    Policy,
    PolicyAcknowledgment,
    Notification,
    ApiResponse,
    PaginatedResponse
} from '../types';
import { getServiceConfig, initializeFirebase } from '../../../config/firebase';
import {
    collection,
    doc,
    getDocs,
    getDoc,
    addDoc,
    updateDoc,
    deleteDoc,
    query,
    where,
    orderBy,
    limit,
    onSnapshot,
    Timestamp
} from 'firebase/firestore';

// Abstract interface for employee dashboard operations
export interface IEmployeeDashboardService {
    // Profile Management
    getEmployeeProfile(employeeId: string): Promise<EmployeeProfile | null>;
    updateEmployeeProfile(employeeId: string, profile: Partial<EmployeeProfile>): Promise<EmployeeProfile>;

    // Contract & Onboarding
    getContract(employeeId: string): Promise<Contract | null>;
    signContract(contractId: string, signature: string): Promise<boolean>;
    getOnboardingChecklist(employeeId: string): Promise<OnboardingChecklist | null>;
    updateOnboardingItem(itemId: string, updates: any): Promise<boolean>;

    // Leave Management
    getLeaveRequests(employeeId: string): Promise<LeaveRequest[]>;
    getLeaveBalances(employeeId: string): Promise<LeaveBalance[]>;
    createLeaveRequest(request: Omit<LeaveRequest, 'id' | 'createdAt' | 'updatedAt'>): Promise<LeaveRequest>;

    // Time Management
    getTimeEntries(employeeId: string): Promise<TimeEntry[]>;
    createTimeEntry(entry: Omit<TimeEntry, 'id' | 'createdAt' | 'updatedAt'>): Promise<TimeEntry>;
    updateTimeEntry(entryId: string, updates: Partial<TimeEntry>): Promise<TimeEntry>;

    // Payroll & Compensation
    getPayrollRecords(employeeId: string): Promise<PayrollRecord[]>;
    getFinancialRequests(employeeId: string): Promise<FinancialRequest[]>;
    getBenefitsEnrollments(employeeId: string): Promise<BenefitsEnrollment[]>;
    createFinancialRequest(request: Omit<FinancialRequest, 'id' | 'createdAt' | 'updatedAt'>): Promise<FinancialRequest>;

    // Performance Management
    getPerformanceGoals(employeeId: string): Promise<PerformanceGoal[]>;
    getPerformanceReviews(employeeId: string): Promise<PerformanceReview[]>;
    createPerformanceGoal(goal: Omit<PerformanceGoal, 'id' | 'createdAt' | 'updatedAt'>): Promise<PerformanceGoal>;

    // Asset Management
    getAssets(employeeId: string): Promise<Asset[]>;
    getAssetRequests(employeeId: string): Promise<AssetRequest[]>;
    createAssetRequest(request: Omit<AssetRequest, 'id' | 'requestedAt'>): Promise<AssetRequest>;

    // Policy Management
    getPolicies(): Promise<Policy[]>;
    getPolicyAcknowledgments(employeeId: string): Promise<PolicyAcknowledgment[]>;
    acknowledgePolicy(employeeId: string, policyId: string, signature: string): Promise<PolicyAcknowledgment>;

    // Notifications
    getNotifications(employeeId: string): Promise<Notification[]>;
    markNotificationAsRead(notificationId: string): Promise<boolean>;

    // Real-time subscriptions
    subscribeToNotifications(employeeId: string, callback: (notifications: Notification[]) => void): () => void;
    subscribeToTimeEntries(employeeId: string, callback: (entries: TimeEntry[]) => void): () => void;
}

// Firebase implementation
export class FirebaseEmployeeDashboardService implements IEmployeeDashboardService {
    private db: any;

    constructor(db: any) {
        this.db = db;
    }

    // Profile Management
    async getEmployeeProfile(employeeId: string): Promise<EmployeeProfile | null> {
        try {
            const docRef = doc(this.db, 'employeeProfiles', employeeId);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                const data = docSnap.data();
                return {
                    ...data,
                    createdAt: data.createdAt?.toDate() || new Date(),
                    updatedAt: data.updatedAt?.toDate() || new Date(),
                    personalInfo: {
                        ...data.personalInfo,
                        dateOfBirth: data.personalInfo?.dateOfBirth?.toDate() || new Date()
                    }
                } as EmployeeProfile;
            }
            return null;
        } catch (error) {
            console.error('Error getting employee profile:', error);
            throw error;
        }
    }

    async updateEmployeeProfile(employeeId: string, profile: Partial<EmployeeProfile>): Promise<EmployeeProfile> {
        try {
            const docRef = doc(this.db, 'employeeProfiles', employeeId);
            const updateData = {
                ...profile,
                updatedAt: Timestamp.now()
            };

            await updateDoc(docRef, updateData);

            const updatedDoc = await getDoc(docRef);
            return updatedDoc.data() as EmployeeProfile;
        } catch (error) {
            console.error('Error updating employee profile:', error);
            throw error;
        }
    }

    // Contract & Onboarding
    async getContract(employeeId: string): Promise<Contract | null> {
        try {
            const q = query(
                collection(this.db, 'contracts'),
                where('employeeId', '==', employeeId),
                orderBy('createdAt', 'desc'),
                limit(1)
            );

            const querySnapshot = await getDocs(q);
            if (!querySnapshot.empty) {
                const doc = querySnapshot.docs[0];
                const data = doc.data();
                return {
                    id: doc.id,
                    ...data,
                    startDate: data.startDate?.toDate() || new Date(),
                    endDate: data.endDate?.toDate() || new Date(),
                    createdAt: data.createdAt?.toDate() || new Date(),
                    updatedAt: data.updatedAt?.toDate() || new Date(),
                    signedAt: data.signedAt?.toDate()
                } as Contract;
            }
            return null;
        } catch (error) {
            console.error('Error getting contract:', error);
            throw error;
        }
    }

    async signContract(contractId: string, signature: string): Promise<boolean> {
        try {
            const docRef = doc(this.db, 'contracts', contractId);
            await updateDoc(docRef, {
                status: 'signed',
                signedAt: Timestamp.now(),
                signature: signature,
                updatedAt: Timestamp.now()
            });
            return true;
        } catch (error) {
            console.error('Error signing contract:', error);
            throw error;
        }
    }

    async getOnboardingChecklist(employeeId: string): Promise<OnboardingChecklist | null> {
        try {
            const q = query(
                collection(this.db, 'onboardingChecklists'),
                where('employeeId', '==', employeeId),
                limit(1)
            );

            const querySnapshot = await getDocs(q);
            if (!querySnapshot.empty) {
                const doc = querySnapshot.docs[0];
                const data = doc.data();
                return {
                    id: doc.id,
                    ...data,
                    startedAt: data.startedAt?.toDate() || new Date(),
                    completedAt: data.completedAt?.toDate(),
                    items: data.items.map((item: any) => ({
                        ...item,
                        dueDate: item.dueDate?.toDate(),
                        completedAt: item.completedAt?.toDate()
                    }))
                } as OnboardingChecklist;
            }
            return null;
        } catch (error) {
            console.error('Error getting onboarding checklist:', error);
            throw error;
        }
    }

    async updateOnboardingItem(itemId: string, updates: any): Promise<boolean> {
        try {
            // This would need to be implemented based on your data structure
            // For now, we'll return true as a placeholder
            return true;
        } catch (error) {
            console.error('Error updating onboarding item:', error);
            throw error;
        }
    }

    // Leave Management
    async getLeaveRequests(employeeId: string): Promise<LeaveRequest[]> {
        try {
            const q = query(
                collection(this.db, 'leaveRequests'),
                where('employeeId', '==', employeeId),
                orderBy('createdAt', 'desc')
            );

            const querySnapshot = await getDocs(q);
            return querySnapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    id: doc.id,
                    ...data,
                    startDate: data.startDate?.toDate() || new Date(),
                    endDate: data.endDate?.toDate() || new Date(),
                    createdAt: data.createdAt?.toDate() || new Date(),
                    updatedAt: data.updatedAt?.toDate() || new Date(),
                    approvedAt: data.approvedAt?.toDate()
                } as LeaveRequest;
            });
        } catch (error) {
            console.error('Error getting leave requests:', error);
            throw error;
        }
    }

    async getLeaveBalances(employeeId: string): Promise<LeaveBalance[]> {
        try {
            const q = query(
                collection(this.db, 'leaveBalances'),
                where('employeeId', '==', employeeId)
            );

            const querySnapshot = await getDocs(q);
            return querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as LeaveBalance[];
        } catch (error) {
            console.error('Error getting leave balances:', error);
            throw error;
        }
    }

    async createLeaveRequest(request: Omit<LeaveRequest, 'id' | 'createdAt' | 'updatedAt'>): Promise<LeaveRequest> {
        try {
            const docRef = await addDoc(collection(this.db, 'leaveRequests'), {
                ...request,
                startDate: Timestamp.fromDate(request.startDate),
                endDate: Timestamp.fromDate(request.endDate),
                createdAt: Timestamp.now(),
                updatedAt: Timestamp.now()
            });

            const newDoc = await getDoc(docRef);
            const data = newDoc.data()!;
            return {
                id: docRef.id,
                ...data,
                startDate: data.startDate?.toDate() || new Date(),
                endDate: data.endDate?.toDate() || new Date(),
                createdAt: data.createdAt?.toDate() || new Date(),
                updatedAt: data.updatedAt?.toDate() || new Date()
            } as LeaveRequest;
        } catch (error) {
            console.error('Error creating leave request:', error);
            throw error;
        }
    }

    // Time Management
    async getTimeEntries(employeeId: string): Promise<TimeEntry[]> {
        try {
            const q = query(
                collection(this.db, 'timeEntries'),
                where('employeeId', '==', employeeId),
                orderBy('createdAt', 'desc')
            );

            const querySnapshot = await getDocs(q);
            return querySnapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    id: doc.id,
                    ...data,
                    clockIn: data.clockIn?.toDate() || new Date(),
                    clockOut: data.clockOut?.toDate(),
                    location: {
                        ...data.location,
                        timestamp: data.location?.timestamp?.toDate() || new Date()
                    },
                    createdAt: data.createdAt?.toDate() || new Date(),
                    updatedAt: data.updatedAt?.toDate() || new Date()
                } as TimeEntry;
            });
        } catch (error) {
            console.error('Error getting time entries:', error);
            throw error;
        }
    }

    async createTimeEntry(entry: Omit<TimeEntry, 'id' | 'createdAt' | 'updatedAt'>): Promise<TimeEntry> {
        try {
            const docRef = await addDoc(collection(this.db, 'timeEntries'), {
                ...entry,
                clockIn: Timestamp.fromDate(entry.clockIn),
                clockOut: entry.clockOut ? Timestamp.fromDate(entry.clockOut) : null,
                location: {
                    ...entry.location,
                    timestamp: Timestamp.fromDate(entry.location.timestamp)
                },
                createdAt: Timestamp.now(),
                updatedAt: Timestamp.now()
            });

            const newDoc = await getDoc(docRef);
            const data = newDoc.data()!;
            return {
                id: docRef.id,
                ...data,
                clockIn: data.clockIn?.toDate() || new Date(),
                clockOut: data.clockOut?.toDate(),
                location: {
                    ...data.location,
                    timestamp: data.location?.timestamp?.toDate() || new Date()
                },
                createdAt: data.createdAt?.toDate() || new Date(),
                updatedAt: data.updatedAt?.toDate() || new Date()
            } as TimeEntry;
        } catch (error) {
            console.error('Error creating time entry:', error);
            throw error;
        }
    }

    async updateTimeEntry(entryId: string, updates: Partial<TimeEntry>): Promise<TimeEntry> {
        try {
            const docRef = doc(this.db, 'timeEntries', entryId);
            const updateData = {
                ...updates,
                updatedAt: Timestamp.now()
            };

            if (updates.clockOut) {
                updateData.clockOut = Timestamp.fromDate(updates.clockOut);
            }

            await updateDoc(docRef, updateData);

            const updatedDoc = await getDoc(docRef);
            const data = updatedDoc.data()!;
            return {
                id: entryId,
                ...data,
                clockIn: data.clockIn?.toDate() || new Date(),
                clockOut: data.clockOut?.toDate(),
                location: {
                    ...data.location,
                    timestamp: data.location?.timestamp?.toDate() || new Date()
                },
                createdAt: data.createdAt?.toDate() || new Date(),
                updatedAt: data.updatedAt?.toDate() || new Date()
            } as TimeEntry;
        } catch (error) {
            console.error('Error updating time entry:', error);
            throw error;
        }
    }

    // Payroll & Compensation
    async getPayrollRecords(employeeId: string): Promise<PayrollRecord[]> {
        try {
            const q = query(
                collection(this.db, 'payrollRecords'),
                where('employeeId', '==', employeeId),
                orderBy('createdAt', 'desc')
            );

            const querySnapshot = await getDocs(q);
            return querySnapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    id: doc.id,
                    ...data,
                    payPeriod: {
                        ...data.payPeriod,
                        startDate: data.payPeriod?.startDate?.toDate() || new Date(),
                        endDate: data.payPeriod?.endDate?.toDate() || new Date(),
                        payDate: data.payPeriod?.payDate?.toDate() || new Date()
                    },
                    paymentDate: data.paymentDate?.toDate() || new Date(),
                    createdAt: data.createdAt?.toDate() || new Date(),
                    updatedAt: data.updatedAt?.toDate() || new Date()
                } as PayrollRecord;
            });
        } catch (error) {
            console.error('Error getting payroll records:', error);
            throw error;
        }
    }

    async getFinancialRequests(employeeId: string): Promise<FinancialRequest[]> {
        try {
            const q = query(
                collection(this.db, 'financialRequests'),
                where('employeeId', '==', employeeId),
                orderBy('createdAt', 'desc')
            );

            const querySnapshot = await getDocs(q);
            return querySnapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    id: doc.id,
                    ...data,
                    createdAt: data.createdAt?.toDate() || new Date(),
                    updatedAt: data.updatedAt?.toDate() || new Date(),
                    approvedAt: data.approvedAt?.toDate(),
                    paidAt: data.paidAt?.toDate()
                } as FinancialRequest;
            });
        } catch (error) {
            console.error('Error getting financial requests:', error);
            throw error;
        }
    }

    async getBenefitsEnrollments(employeeId: string): Promise<BenefitsEnrollment[]> {
        try {
            const q = query(
                collection(this.db, 'benefitsEnrollments'),
                where('employeeId', '==', employeeId)
            );

            const querySnapshot = await getDocs(q);
            return querySnapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    id: doc.id,
                    ...data,
                    effectiveDate: data.effectiveDate?.toDate() || new Date(),
                    terminationDate: data.terminationDate?.toDate()
                } as BenefitsEnrollment;
            });
        } catch (error) {
            console.error('Error getting benefits enrollments:', error);
            throw error;
        }
    }

    async createFinancialRequest(request: Omit<FinancialRequest, 'id' | 'createdAt' | 'updatedAt'>): Promise<FinancialRequest> {
        try {
            const docRef = await addDoc(collection(this.db, 'financialRequests'), {
                ...request,
                createdAt: Timestamp.now(),
                updatedAt: Timestamp.now()
            });

            const newDoc = await getDoc(docRef);
            const data = newDoc.data()!;
            return {
                id: docRef.id,
                ...data,
                createdAt: data.createdAt?.toDate() || new Date(),
                updatedAt: data.updatedAt?.toDate() || new Date()
            } as FinancialRequest;
        } catch (error) {
            console.error('Error creating financial request:', error);
            throw error;
        }
    }

    // Performance Management
    async getPerformanceGoals(employeeId: string): Promise<PerformanceGoal[]> {
        try {
            const q = query(
                collection(this.db, 'performanceGoals'),
                where('employeeId', '==', employeeId),
                orderBy('createdAt', 'desc')
            );

            const querySnapshot = await getDocs(q);
            return querySnapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    id: doc.id,
                    ...data,
                    startDate: data.startDate?.toDate() || new Date(),
                    endDate: data.endDate?.toDate() || new Date(),
                    createdAt: data.createdAt?.toDate() || new Date(),
                    updatedAt: data.updatedAt?.toDate() || new Date(),
                    milestones: data.milestones?.map((milestone: any) => ({
                        ...milestone,
                        targetDate: milestone.targetDate?.toDate() || new Date(),
                        completedAt: milestone.completedAt?.toDate()
                    })) || []
                } as PerformanceGoal;
            });
        } catch (error) {
            console.error('Error getting performance goals:', error);
            throw error;
        }
    }

    async getPerformanceReviews(employeeId: string): Promise<PerformanceReview[]> {
        try {
            const q = query(
                collection(this.db, 'performanceReviews'),
                where('employeeId', '==', employeeId),
                orderBy('createdAt', 'desc')
            );

            const querySnapshot = await getDocs(q);
            return querySnapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    id: doc.id,
                    ...data,
                    createdAt: data.createdAt?.toDate() || new Date(),
                    updatedAt: data.updatedAt?.toDate() || new Date(),
                    completedAt: data.completedAt?.toDate()
                } as PerformanceReview;
            });
        } catch (error) {
            console.error('Error getting performance reviews:', error);
            throw error;
        }
    }

    async createPerformanceGoal(goal: Omit<PerformanceGoal, 'id' | 'createdAt' | 'updatedAt'>): Promise<PerformanceGoal> {
        try {
            const docRef = await addDoc(collection(this.db, 'performanceGoals'), {
                ...goal,
                startDate: Timestamp.fromDate(goal.startDate),
                endDate: Timestamp.fromDate(goal.endDate),
                milestones: goal.milestones?.map(milestone => ({
                    ...milestone,
                    targetDate: Timestamp.fromDate(milestone.targetDate),
                    completedAt: milestone.completedAt ? Timestamp.fromDate(milestone.completedAt) : null
                })) || [],
                createdAt: Timestamp.now(),
                updatedAt: Timestamp.now()
            });

            const newDoc = await getDoc(docRef);
            const data = newDoc.data()!;
            return {
                id: docRef.id,
                ...data,
                startDate: data.startDate?.toDate() || new Date(),
                endDate: data.endDate?.toDate() || new Date(),
                createdAt: data.createdAt?.toDate() || new Date(),
                updatedAt: data.updatedAt?.toDate() || new Date()
            } as PerformanceGoal;
        } catch (error) {
            console.error('Error creating performance goal:', error);
            throw error;
        }
    }

    // Asset Management
    async getAssets(employeeId: string): Promise<Asset[]> {
        try {
            const q = query(
                collection(this.db, 'assets'),
                where('assignedTo', '==', employeeId)
            );

            const querySnapshot = await getDocs(q);
            return querySnapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    id: doc.id,
                    ...data,
                    assignedAt: data.assignedAt?.toDate(),
                    purchaseDate: data.purchaseDate?.toDate() || new Date(),
                    warrantyExpiry: data.warrantyExpiry?.toDate()
                } as Asset;
            });
        } catch (error) {
            console.error('Error getting assets:', error);
            throw error;
        }
    }

    async getAssetRequests(employeeId: string): Promise<AssetRequest[]> {
        try {
            const q = query(
                collection(this.db, 'assetRequests'),
                where('employeeId', '==', employeeId),
                orderBy('requestedAt', 'desc')
            );

            const querySnapshot = await getDocs(q);
            return querySnapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    id: doc.id,
                    ...data,
                    requestedAt: data.requestedAt?.toDate() || new Date(),
                    approvedAt: data.approvedAt?.toDate(),
                    fulfilledAt: data.fulfilledAt?.toDate()
                } as AssetRequest;
            });
        } catch (error) {
            console.error('Error getting asset requests:', error);
            throw error;
        }
    }

    async createAssetRequest(request: Omit<AssetRequest, 'id' | 'requestedAt'>): Promise<AssetRequest> {
        try {
            const docRef = await addDoc(collection(this.db, 'assetRequests'), {
                ...request,
                requestedAt: Timestamp.now()
            });

            const newDoc = await getDoc(docRef);
            const data = newDoc.data()!;
            return {
                id: docRef.id,
                ...data,
                requestedAt: data.requestedAt?.toDate() || new Date()
            } as AssetRequest;
        } catch (error) {
            console.error('Error creating asset request:', error);
            throw error;
        }
    }

    // Policy Management
    async getPolicies(): Promise<Policy[]> {
        try {
            const q = query(
                collection(this.db, 'policies'),
                where('status', '==', 'active'),
                orderBy('createdAt', 'desc')
            );

            const querySnapshot = await getDocs(q);
            return querySnapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    id: doc.id,
                    ...data,
                    effectiveDate: data.effectiveDate?.toDate() || new Date(),
                    expiryDate: data.expiryDate?.toDate(),
                    createdAt: data.createdAt?.toDate() || new Date(),
                    updatedAt: data.updatedAt?.toDate() || new Date()
                } as Policy;
            });
        } catch (error) {
            console.error('Error getting policies:', error);
            throw error;
        }
    }

    async getPolicyAcknowledgments(employeeId: string): Promise<PolicyAcknowledgment[]> {
        try {
            const q = query(
                collection(this.db, 'policyAcknowledgments'),
                where('employeeId', '==', employeeId)
            );

            const querySnapshot = await getDocs(q);
            return querySnapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    id: doc.id,
                    ...data,
                    acknowledgedAt: data.acknowledgedAt?.toDate() || new Date()
                } as PolicyAcknowledgment;
            });
        } catch (error) {
            console.error('Error getting policy acknowledgments:', error);
            throw error;
        }
    }

    async acknowledgePolicy(employeeId: string, policyId: string, signature: string): Promise<PolicyAcknowledgment> {
        try {
            const docRef = await addDoc(collection(this.db, 'policyAcknowledgments'), {
                employeeId,
                policyId,
                acknowledgedAt: Timestamp.now(),
                ipAddress: '192.168.1.100', // In real app, get actual IP
                userAgent: navigator.userAgent,
                signature
            });

            const newDoc = await getDoc(docRef);
            const data = newDoc.data()!;
            return {
                id: docRef.id,
                ...data,
                acknowledgedAt: data.acknowledgedAt?.toDate() || new Date()
            } as PolicyAcknowledgment;
        } catch (error) {
            console.error('Error acknowledging policy:', error);
            throw error;
        }
    }

    // Notifications
    async getNotifications(employeeId: string): Promise<Notification[]> {
        try {
            const q = query(
                collection(this.db, 'notifications'),
                where('employeeId', '==', employeeId),
                orderBy('createdAt', 'desc')
            );

            const querySnapshot = await getDocs(q);
            return querySnapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    id: doc.id,
                    ...data,
                    createdAt: data.createdAt?.toDate() || new Date()
                } as Notification;
            });
        } catch (error) {
            console.error('Error getting notifications:', error);
            throw error;
        }
    }

    async markNotificationAsRead(notificationId: string): Promise<boolean> {
        try {
            const docRef = doc(this.db, 'notifications', notificationId);
            await updateDoc(docRef, {
                read: true
            });
            return true;
        } catch (error) {
            console.error('Error marking notification as read:', error);
            throw error;
        }
    }

    // Real-time subscriptions
    subscribeToNotifications(employeeId: string, callback: (notifications: Notification[]) => void): () => void {
        const q = query(
            collection(this.db, 'notifications'),
            where('employeeId', '==', employeeId),
            orderBy('createdAt', 'desc')
        );

        return onSnapshot(q, (querySnapshot) => {
            const notifications = querySnapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    id: doc.id,
                    ...data,
                    createdAt: data.createdAt?.toDate() || new Date()
                } as Notification;
            });
            callback(notifications);
        });
    }

    subscribeToTimeEntries(employeeId: string, callback: (entries: TimeEntry[]) => void): () => void {
        const q = query(
            collection(this.db, 'timeEntries'),
            where('employeeId', '==', employeeId),
            orderBy('createdAt', 'desc')
        );

        return onSnapshot(q, (querySnapshot) => {
            const entries = querySnapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    id: doc.id,
                    ...data,
                    clockIn: data.clockIn?.toDate() || new Date(),
                    clockOut: data.clockOut?.toDate(),
                    location: {
                        ...data.location,
                        timestamp: data.location?.timestamp?.toDate() || new Date()
                    },
                    createdAt: data.createdAt?.toDate() || new Date(),
                    updatedAt: data.updatedAt?.toDate() || new Date()
                } as TimeEntry;
            });
            callback(entries);
        });
    }
}

// Mock service for development/testing
export class MockEmployeeDashboardService implements IEmployeeDashboardService {
    // Mock implementations - return empty arrays or null for now
    // In a real implementation, these would return mock data

    async getEmployeeProfile(employeeId: string): Promise<EmployeeProfile | null> {
        return null;
    }

    async updateEmployeeProfile(employeeId: string, profile: Partial<EmployeeProfile>): Promise<EmployeeProfile> {
        throw new Error('Not implemented');
    }

    async getContract(employeeId: string): Promise<Contract | null> {
        return null;
    }

    async signContract(contractId: string, signature: string): Promise<boolean> {
        return true;
    }

    async getOnboardingChecklist(employeeId: string): Promise<OnboardingChecklist | null> {
        return null;
    }

    async updateOnboardingItem(itemId: string, updates: any): Promise<boolean> {
        return true;
    }

    async getLeaveRequests(employeeId: string): Promise<LeaveRequest[]> {
        return [];
    }

    async getLeaveBalances(employeeId: string): Promise<LeaveBalance[]> {
        return [];
    }

    async createLeaveRequest(request: Omit<LeaveRequest, 'id' | 'createdAt' | 'updatedAt'>): Promise<LeaveRequest> {
        throw new Error('Not implemented');
    }

    async getTimeEntries(employeeId: string): Promise<TimeEntry[]> {
        return [];
    }

    async createTimeEntry(entry: Omit<TimeEntry, 'id' | 'createdAt' | 'updatedAt'>): Promise<TimeEntry> {
        throw new Error('Not implemented');
    }

    async updateTimeEntry(entryId: string, updates: Partial<TimeEntry>): Promise<TimeEntry> {
        throw new Error('Not implemented');
    }

    async getPayrollRecords(employeeId: string): Promise<PayrollRecord[]> {
        return [];
    }

    async getFinancialRequests(employeeId: string): Promise<FinancialRequest[]> {
        return [];
    }

    async getBenefitsEnrollments(employeeId: string): Promise<BenefitsEnrollment[]> {
        return [];
    }

    async createFinancialRequest(request: Omit<FinancialRequest, 'id' | 'createdAt' | 'updatedAt'>): Promise<FinancialRequest> {
        throw new Error('Not implemented');
    }

    async getPerformanceGoals(employeeId: string): Promise<PerformanceGoal[]> {
        return [];
    }

    async getPerformanceReviews(employeeId: string): Promise<PerformanceReview[]> {
        return [];
    }

    async createPerformanceGoal(goal: Omit<PerformanceGoal, 'id' | 'createdAt' | 'updatedAt'>): Promise<PerformanceGoal> {
        throw new Error('Not implemented');
    }

    async getAssets(employeeId: string): Promise<Asset[]> {
        return [];
    }

    async getAssetRequests(employeeId: string): Promise<AssetRequest[]> {
        return [];
    }

    async createAssetRequest(request: Omit<AssetRequest, 'id' | 'requestedAt'>): Promise<AssetRequest> {
        throw new Error('Not implemented');
    }

    async getPolicies(): Promise<Policy[]> {
        return [];
    }

    async getPolicyAcknowledgments(employeeId: string): Promise<PolicyAcknowledgment[]> {
        return [];
    }

    async acknowledgePolicy(employeeId: string, policyId: string, signature: string): Promise<PolicyAcknowledgment> {
        throw new Error('Not implemented');
    }

    async getNotifications(employeeId: string): Promise<Notification[]> {
        return [];
    }

    async markNotificationAsRead(notificationId: string): Promise<boolean> {
        return true;
    }

    subscribeToNotifications(employeeId: string, callback: (notifications: Notification[]) => void): () => void {
        return () => { };
    }

    subscribeToTimeEntries(employeeId: string, callback: (entries: TimeEntry[]) => void): () => void {
        return () => { };
    }
}

// Service factory
export class EmployeeDashboardServiceFactory {
    static async createService(): Promise<IEmployeeDashboardService> {
        try {
            const serviceConfig = await getServiceConfig();

            if (serviceConfig.firebase.enabled && serviceConfig.firebase.db) {
                console.log('Using Firebase Employee Dashboard Service');
                return new FirebaseEmployeeDashboardService(serviceConfig.firebase.db);
            } else {
                console.log('Using Mock Employee Dashboard Service');
                return new MockEmployeeDashboardService();
            }
        } catch (error) {
            console.error('Error creating employee dashboard service:', error);
            console.log('Falling back to Mock Employee Dashboard Service');
            return new MockEmployeeDashboardService();
        }
    }
}

// Export the main service getter
export const getEmployeeDashboardService = EmployeeDashboardServiceFactory.createService;





