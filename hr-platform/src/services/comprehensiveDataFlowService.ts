import {
    collection,
    doc,
    getDocs,
    getDoc,
    setDoc,
    updateDoc,
    deleteDoc,
    query,
    where,
    orderBy,
    onSnapshot,
    Timestamp,
    writeBatch,
    serverTimestamp
} from 'firebase/firestore';
import { getFirebaseDb } from '../config/firebase';

// Comprehensive interfaces for all HRIS systems
export interface EmployeeProfile {
    id: string;
    employeeId: string;
    personalInfo: {
        firstName: string;
        lastName: string;
        middleName?: string;
        dateOfBirth: Date | null;
        gender?: string;
        maritalStatus?: string;
        nationality?: string;
        ssn?: string;
        passportNumber?: string;
    };
    contactInfo: {
        personalEmail: string;
        workEmail: string;
        personalPhone: string;
        workPhone: string;
        address: {
            street: string;
            city: string;
            state: string;
            zipCode: string;
            country: string;
        };
        emergencyContacts: Array<{
            name: string;
            relationship: string;
            phone: string;
            email: string;
            isPrimary: boolean;
            address?: string;
        }>;
    };
    workInfo: {
        position: string;
        department: string;
        managerId?: string;
        hireDate: Date | null;
        employmentType: string;
        workLocation: string;
        workSchedule: string;
        salary: {
            baseSalary: number;
            currency: string;
            payFrequency: string;
        };
    };
    bankingInfo: {
        bankName: string;
        accountNumber: string;
        routingNumber: string;
        accountType: string;
        salaryPaymentMethod: string;
        taxInformation: {
            federalTaxId?: string;
            stateTaxId?: string;
            exemptions: number;
        };
    };
    skills: Array<{
        name: string;
        level: string;
        certified: boolean;
        certificationDate?: Date;
        expiryDate?: Date;
    }>;
    familyInfo: {
        spouse?: {
            name: string;
            occupation: string;
            phone?: string;
            email?: string;
        };
        dependents: Array<{
            name: string;
            relationship: string;
            dateOfBirth: Date;
            ssn?: string;
        }>;
        beneficiaries: Array<{
            name: string;
            relationship: string;
            percentage: number;
            contactInfo: string;
        }>;
    };
    profileStatus: {
        completeness: number;
        lastUpdated: Date;
        updatedBy: string;
        status: 'draft' | 'pending_review' | 'approved' | 'needs_update';
    };
    createdAt: Date;
    updatedAt: Date;
}

export interface LeaveType {
    id: string;
    name: string;
    maxDays: number;
    carryOver: boolean;
    requiresApproval: boolean;
    requiresDocumentation: boolean;
    color: string;
    isActive: boolean;
    description: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface LeaveRequest {
    id: string;
    employeeId: string;
    employeeName: string;
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
    pendingDays: number;
    remainingDays: number;
    carryOverDays: number;
    expiryDate?: Date;
    year: number;
}

export interface Policy {
    id: string;
    title: string;
    description: string;
    content: string;
    category: string;
    version: string;
    effectiveDate: Date;
    expiryDate?: Date;
    requiresAcknowledgment: boolean;
    isActive: boolean;
    createdBy: string;
    createdAt: Date;
    lastModified: Date;
    tags: string[];
    attachments?: string[];
}

export interface PolicyAcknowledgment {
    id: string;
    policyId: string;
    employeeId: string;
    employeeName: string;
    acknowledgedAt: Date;
    ipAddress: string;
    userAgent: string;
    version: string;
}

export interface PerformanceGoal {
    id: string;
    employeeId: string;
    title: string;
    description: string;
    category: string;
    targetValue: number;
    currentValue: number;
    unit: string;
    startDate: Date;
    endDate: Date;
    status: 'not_started' | 'in_progress' | 'completed' | 'overdue';
    priority: 'low' | 'medium' | 'high';
    createdBy: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface PerformanceReview {
    id: string;
    employeeId: string;
    employeeName: string;
    reviewerId: string;
    reviewerName: string;
    reviewType: 'annual' | 'quarterly' | 'monthly' | 'probation';
    reviewPeriod: string;
    overallRating: number;
    strengths: string[];
    areasForImprovement: string[];
    goals: string[];
    comments: string;
    status: 'draft' | 'submitted' | 'approved' | 'completed';
    createdAt: Date;
    submittedAt?: Date;
    approvedAt?: Date;
}

export interface MeetingSchedule {
    id: string;
    employeeId: string;
    employeeName: string;
    managerId: string;
    managerName: string;
    meetingType: 'performance_review' | 'one_on_one' | 'career_development' | 'goal_setting';
    title: string;
    description: string;
    scheduledDate: Date;
    duration: number;
    location: string;
    status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled';
    agenda?: string;
    notes?: string;
    createdBy: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface NotificationData {
    id: string;
    employeeId: string;
    title: string;
    message: string;
    type: 'info' | 'warning' | 'success' | 'error';
    category: 'leave' | 'policy' | 'performance' | 'profile' | 'general';
    isRead: boolean;
    createdAt: Date;
    actionUrl?: string;
    actionText?: string;
    metadata?: Record<string, any>;
}

// Comprehensive Data Flow Service Interface
export interface IComprehensiveDataFlowService {
    // Employee Profile Management
    getEmployeeProfile(employeeId: string): Promise<EmployeeProfile | null>;
    getAllEmployees(): Promise<EmployeeProfile[]>;
    updateEmployeeProfile(employeeId: string, profileData: Partial<EmployeeProfile>): Promise<EmployeeProfile>;
    subscribeToEmployeeUpdates(employeeId: string, callback: (profile: EmployeeProfile) => void): () => void;
    subscribeToAllEmployees(callback: (employees: EmployeeProfile[]) => void): () => void;

    // Leave Management
    getLeaveTypes(): Promise<LeaveType[]>;
    createLeaveType(leaveType: Omit<LeaveType, 'id' | 'createdAt' | 'updatedAt'>): Promise<LeaveType>;
    updateLeaveType(id: string, updates: Partial<LeaveType>): Promise<void>;
    deleteLeaveType(id: string): Promise<void>;

    getLeaveRequests(employeeId?: string): Promise<LeaveRequest[]>;
    createLeaveRequest(request: Omit<LeaveRequest, 'id' | 'submittedAt'>): Promise<LeaveRequest>;
    updateLeaveRequest(id: string, updates: Partial<LeaveRequest>): Promise<void>;
    approveLeaveRequest(id: string, reviewedBy: string, comments?: string): Promise<void>;
    rejectLeaveRequest(id: string, reviewedBy: string, comments?: string): Promise<void>;

    getLeaveBalances(employeeId?: string): Promise<LeaveBalance[]>;
    updateLeaveBalance(employeeId: string, leaveTypeId: string, updates: Partial<LeaveBalance>): Promise<void>;

    // Policy Management
    getPolicies(activeOnly?: boolean): Promise<Policy[]>;
    createPolicy(policy: Omit<Policy, 'id' | 'createdAt' | 'lastModified'>): Promise<Policy>;
    updatePolicy(id: string, updates: Partial<Policy>): Promise<void>;
    deletePolicy(id: string): Promise<void>;

    getPolicyAcknowledgments(policyId?: string, employeeId?: string): Promise<PolicyAcknowledgment[]>;
    acknowledgePolicy(policyId: string, employeeId: string, acknowledgment: Omit<PolicyAcknowledgment, 'id' | 'acknowledgedAt'>): Promise<void>;

    // Performance Management
    getPerformanceGoals(employeeId?: string): Promise<PerformanceGoal[]>;
    createPerformanceGoal(goal: Omit<PerformanceGoal, 'id' | 'createdAt' | 'updatedAt'>): Promise<PerformanceGoal>;
    updatePerformanceGoal(id: string, updates: Partial<PerformanceGoal>): Promise<void>;
    deletePerformanceGoal(id: string): Promise<void>;

    getPerformanceReviews(employeeId?: string): Promise<PerformanceReview[]>;
    createPerformanceReview(review: Omit<PerformanceReview, 'id' | 'createdAt'>): Promise<PerformanceReview>;
    updatePerformanceReview(id: string, updates: Partial<PerformanceReview>): Promise<void>;

    getMeetingSchedules(employeeId?: string): Promise<MeetingSchedule[]>;
    createMeetingSchedule(meeting: Omit<MeetingSchedule, 'id' | 'createdAt' | 'updatedAt'>): Promise<MeetingSchedule>;
    updateMeetingSchedule(id: string, updates: Partial<MeetingSchedule>): Promise<void>;
    deleteMeetingSchedule(id: string): Promise<void>;

    // Notifications
    getNotifications(employeeId: string): Promise<NotificationData[]>;
    createNotification(notification: Omit<NotificationData, 'id' | 'createdAt'>): Promise<void>;
    markNotificationAsRead(notificationId: string): Promise<void>;
    subscribeToNotifications(employeeId: string, callback: (notifications: NotificationData[]) => void): () => void;

    // Real-time subscriptions
    subscribeToLeaveRequests(employeeId: string, callback: (requests: LeaveRequest[]) => void): () => void;
    subscribeToPerformanceGoals(employeeId: string, callback: (goals: PerformanceGoal[]) => void): () => void;
    subscribeToPolicies(callback: (policies: Policy[]) => void): () => void;
}

// Firebase Comprehensive Data Flow Service Implementation
export class FirebaseComprehensiveDataFlowService implements IComprehensiveDataFlowService {
    private notificationCallbacks = new Map<string, (notifications: NotificationData[]) => void>();

    // Employee Profile Management
    async getEmployeeProfile(employeeId: string): Promise<EmployeeProfile | null> {
        try {
            const docRef = doc(getFirebaseDb(), 'employees', employeeId);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                const data = docSnap.data();
                return this.convertFirestoreToEmployeeProfile(data, docSnap.id);
            }
            return null;
        } catch (error) {
            console.error('Error getting employee profile:', error);
            throw error;
        }
    }

    async getAllEmployees(): Promise<EmployeeProfile[]> {
        try {
            const employeesRef = collection(getFirebaseDb(), 'employees');
            const querySnapshot = await getDocs(employeesRef);

            return querySnapshot.docs.map(doc => {
                const data = doc.data();
                return this.convertFirestoreToEmployeeProfile(data, doc.id);
            });
        } catch (error) {
            console.error('Error getting all employees:', error);
            throw error;
        }
    }

    async updateEmployeeProfile(employeeId: string, profileData: Partial<EmployeeProfile>): Promise<EmployeeProfile> {
        try {
            const docRef = doc(getFirebaseDb(), 'employees', employeeId);
            const updateData = {
                ...profileData,
                updatedAt: serverTimestamp(),
                profileStatus: {
                    ...profileData.profileStatus,
                    lastUpdated: serverTimestamp(),
                    completeness: this.calculateProfileCompleteness(profileData as EmployeeProfile)
                }
            };

            await setDoc(docRef, this.convertToFirestore(updateData), { merge: true });

            // Create notification for HR
            await this.createNotification({
                employeeId: 'hr-system',
                title: 'Profile Updated',
                message: `Employee ${employeeId} has updated their profile`,
                type: 'info',
                category: 'profile',
                isRead: false,
                actionUrl: `/hr/employee/${employeeId}`,
                actionText: 'View Profile',
                metadata: { employeeId, updateType: 'profile_update' }
            });

            return await this.getEmployeeProfile(employeeId) as EmployeeProfile;
        } catch (error) {
            console.error('Error updating employee profile:', error);
            throw error;
        }
    }

    subscribeToEmployeeUpdates(employeeId: string, callback: (profile: EmployeeProfile) => void): () => void {
        const docRef = doc(getFirebaseDb(), 'employees', employeeId);

        return onSnapshot(docRef, (doc) => {
            if (doc.exists()) {
                const profile = this.convertFirestoreToEmployeeProfile(doc.data(), doc.id);
                callback(profile);
            }
        });
    }

    subscribeToAllEmployees(callback: (employees: EmployeeProfile[]) => void): () => void {
        const employeesRef = collection(getFirebaseDb(), 'employees');

        return onSnapshot(employeesRef, (querySnapshot) => {
            const employees = querySnapshot.docs.map(doc => {
                const data = doc.data();
                return this.convertFirestoreToEmployeeProfile(data, doc.id);
            });
            callback(employees);
        });
    }

    // Leave Management
    async getLeaveTypes(): Promise<LeaveType[]> {
        try {
            const q = query(collection(getFirebaseDb(), 'leaveTypes'), where('isActive', '==', true), orderBy('name'));
            const querySnapshot = await getDocs(q);

            return querySnapshot.docs.map(doc => this.convertFirestoreToLeaveType(doc.data()));
        } catch (error) {
            console.error('Error getting leave types:', error);
            throw error;
        }
    }

    async createLeaveType(leaveType: Omit<LeaveType, 'id' | 'createdAt' | 'updatedAt'>): Promise<LeaveType> {
        try {
            const docRef = doc(collection(getFirebaseDb(), 'leaveTypes'));
            const newLeaveType: LeaveType = {
                id: docRef.id,
                ...leaveType,
                createdAt: new Date(),
                updatedAt: new Date()
            };

            await setDoc(docRef, this.convertToFirestore(newLeaveType));

            // Create notification for all employees
            await this.createNotification({
                employeeId: 'all-employees',
                title: 'New Leave Type Available',
                message: `A new leave type "${leaveType.name}" has been added`,
                type: 'info',
                category: 'leave',
                isRead: false,
                actionUrl: '/employee/leave',
                actionText: 'View Leave Types'
            });

            return newLeaveType;
        } catch (error) {
            console.error('Error creating leave type:', error);
            throw error;
        }
    }

    async createLeaveRequest(request: Omit<LeaveRequest, 'id' | 'submittedAt'>): Promise<LeaveRequest> {
        try {
            const docRef = doc(collection(getFirebaseDb(), 'leaveRequests'));
            const newRequest: LeaveRequest = {
                id: docRef.id,
                ...request,
                submittedAt: new Date()
            };

            await setDoc(docRef, this.convertToFirestore(newRequest));

            // Create notification for HR
            await this.createNotification({
                employeeId: 'hr-system',
                title: 'New Leave Request',
                message: `${request.employeeName} has submitted a leave request for ${request.totalDays} days`,
                type: 'info',
                category: 'leave',
                isRead: false,
                actionUrl: `/hr/leave-requests/${docRef.id}`,
                actionText: 'Review Request',
                metadata: {
                    requestId: docRef.id,
                    employeeId: request.employeeId,
                    leaveType: request.leaveTypeName,
                    days: request.totalDays
                }
            });

            return newRequest;
        } catch (error) {
            console.error('Error creating leave request:', error);
            throw error;
        }
    }

    async approveLeaveRequest(id: string, reviewedBy: string, comments?: string): Promise<void> {
        try {
            const docRef = doc(getFirebaseDb(), 'leaveRequests', id);
            await updateDoc(docRef, {
                status: 'approved',
                reviewedAt: serverTimestamp(),
                reviewedBy,
                comments
            });

            // Get the request details for notification
            const requestDoc = await getDoc(docRef);
            if (requestDoc.exists()) {
                const request = requestDoc.data();

                // Create notification for employee
                await this.createNotification({
                    employeeId: request.employeeId,
                    title: 'Leave Request Approved',
                    message: `Your leave request for ${request.totalDays} days has been approved`,
                    type: 'success',
                    category: 'leave',
                    isRead: false,
                    actionUrl: '/employee/leave',
                    actionText: 'View Leave Balance'
                });
            }
        } catch (error) {
            console.error('Error approving leave request:', error);
            throw error;
        }
    }

    // Policy Management
    async getPolicies(activeOnly: boolean = true): Promise<Policy[]> {
        try {
            let q = query(collection(getFirebaseDb(), 'policies'), orderBy('effectiveDate', 'desc'));

            if (activeOnly) {
                q = query(q, where('isActive', '==', true));
            }

            const querySnapshot = await getDocs(q);
            return querySnapshot.docs.map(doc => this.convertFirestoreToPolicy(doc.data()));
        } catch (error) {
            console.error('Error getting policies:', error);
            throw error;
        }
    }

    async createPolicy(policy: Omit<Policy, 'id' | 'createdAt' | 'lastModified'>): Promise<Policy> {
        try {
            const docRef = doc(collection(getFirebaseDb(), 'policies'));
            const newPolicy: Policy = {
                id: docRef.id,
                ...policy,
                createdAt: new Date(),
                lastModified: new Date()
            };

            await setDoc(docRef, this.convertToFirestore(newPolicy));

            // Create notification for all employees if acknowledgment required
            if (policy.requiresAcknowledgment) {
                await this.createNotification({
                    employeeId: 'all-employees',
                    title: 'New Policy Requires Acknowledgment',
                    message: `A new policy "${policy.title}" requires your acknowledgment`,
                    type: 'warning',
                    category: 'policy',
                    isRead: false,
                    actionUrl: `/employee/policies/${docRef.id}`,
                    actionText: 'Review Policy'
                });
            }

            return newPolicy;
        } catch (error) {
            console.error('Error creating policy:', error);
            throw error;
        }
    }

    async acknowledgePolicy(policyId: string, employeeId: string, acknowledgment: Omit<PolicyAcknowledgment, 'id' | 'acknowledgedAt'>): Promise<void> {
        try {
            const docRef = doc(collection(getFirebaseDb(), 'policyAcknowledgments'));
            const newAcknowledgment: PolicyAcknowledgment = {
                id: docRef.id,
                ...acknowledgment,
                policyId,
                employeeId,
                acknowledgedAt: new Date()
            };

            await setDoc(docRef, this.convertToFirestore(newAcknowledgment));

            // Create notification for HR
            await this.createNotification({
                employeeId: 'hr-system',
                title: 'Policy Acknowledged',
                message: `Employee ${acknowledgment.employeeName} has acknowledged policy`,
                type: 'success',
                category: 'policy',
                isRead: false,
                actionUrl: `/hr/policies/${policyId}`,
                actionText: 'View Compliance'
            });
        } catch (error) {
            console.error('Error acknowledging policy:', error);
            throw error;
        }
    }

    // Performance Management
    async getPerformanceGoals(employeeId?: string): Promise<PerformanceGoal[]> {
        try {
            let q = query(collection(getFirebaseDb(), 'performanceGoals'), orderBy('createdAt', 'desc'));

            if (employeeId) {
                q = query(q, where('employeeId', '==', employeeId));
            }

            const querySnapshot = await getDocs(q);
            return querySnapshot.docs.map(doc => this.convertFirestoreToPerformanceGoal(doc.data()));
        } catch (error) {
            console.error('Error getting performance goals:', error);
            throw error;
        }
    }

    async createPerformanceGoal(goal: Omit<PerformanceGoal, 'id' | 'createdAt' | 'updatedAt'>): Promise<PerformanceGoal> {
        try {
            const docRef = doc(collection(getFirebaseDb(), 'performanceGoals'));
            const newGoal: PerformanceGoal = {
                id: docRef.id,
                ...goal,
                createdAt: new Date(),
                updatedAt: new Date()
            };

            await setDoc(docRef, this.convertToFirestore(newGoal));

            // Create notification for manager if created by employee
            if (goal.createdBy === 'Employee') {
                await this.createNotification({
                    employeeId: goal.employeeId, // Assuming manager ID is stored
                    title: 'New Performance Goal',
                    message: `Employee has created a new performance goal: ${goal.title}`,
                    type: 'info',
                    category: 'performance',
                    isRead: false,
                    actionUrl: `/hr/performance/goals/${docRef.id}`,
                    actionText: 'Review Goal'
                });
            }

            return newGoal;
        } catch (error) {
            console.error('Error creating performance goal:', error);
            throw error;
        }
    }

    async createMeetingSchedule(meeting: Omit<MeetingSchedule, 'id' | 'createdAt' | 'updatedAt'>): Promise<MeetingSchedule> {
        try {
            const docRef = doc(collection(getFirebaseDb(), 'meetingSchedules'));
            const newMeeting: MeetingSchedule = {
                id: docRef.id,
                ...meeting,
                createdAt: new Date(),
                updatedAt: new Date()
            };

            await setDoc(docRef, this.convertToFirestore(newMeeting));

            // Create notifications for both participants
            const participants = [meeting.employeeId, meeting.managerId];
            for (const participantId of participants) {
                await this.createNotification({
                    employeeId: participantId,
                    title: 'Meeting Scheduled',
                    message: `A ${meeting.meetingType.replace('_', ' ')} meeting has been scheduled`,
                    type: 'info',
                    category: 'performance',
                    isRead: false,
                    actionUrl: `/employee/performance/meetings/${docRef.id}`,
                    actionText: 'View Meeting'
                });
            }

            return newMeeting;
        } catch (error) {
            console.error('Error creating meeting schedule:', error);
            throw error;
        }
    }

    // Notifications
    async getNotifications(employeeId: string): Promise<NotificationData[]> {
        try {
            // Simplified query without orderBy to avoid index requirements
            const q = query(
                collection(getFirebaseDb(), 'notifications'),
                where('employeeId', 'in', [employeeId, 'all-employees'])
            );
            const querySnapshot = await getDocs(q);

            return querySnapshot.docs.map(doc => this.convertFirestoreToNotification(doc.data()));
        } catch (error) {
            console.error('Error getting notifications:', error);
            // Fallback to simple query without where clause if the above fails
            try {
                const simpleQuery = query(collection(getFirebaseDb(), 'notifications'));
                const simpleSnapshot = await getDocs(simpleQuery);
                return simpleSnapshot.docs.map(doc => this.convertFirestoreToNotification(doc.data()));
            } catch (fallbackError) {
                console.error('Fallback query also failed:', fallbackError);
                throw error;
            }
        }
    }

    async createNotification(notification: Omit<NotificationData, 'id' | 'createdAt'>): Promise<void> {
        try {
            const docRef = doc(collection(getFirebaseDb(), 'notifications'));
            const newNotification: NotificationData = {
                id: docRef.id,
                ...notification,
                createdAt: new Date()
            };

            await setDoc(docRef, this.convertToFirestore(newNotification));
        } catch (error) {
            console.error('Error creating notification:', error);
            throw error;
        }
    }

    async markNotificationAsRead(notificationId: string): Promise<void> {
        try {
            const docRef = doc(getFirebaseDb(), 'notifications', notificationId);
            await updateDoc(docRef, { isRead: true });
        } catch (error) {
            console.error('Error marking notification as read:', error);
            throw error;
        }
    }

    subscribeToNotifications(employeeId: string, callback: (notifications: NotificationData[]) => void): () => void {
        // Simplified query without orderBy to avoid index requirements
        const q = query(
            collection(getFirebaseDb(), 'notifications'),
            where('employeeId', 'in', [employeeId, 'all-employees'])
        );

        return onSnapshot(q, (querySnapshot) => {
            const notifications = querySnapshot.docs.map(doc =>
                this.convertFirestoreToNotification(doc.data())
            );
            callback(notifications);
        });
    }

    // Real-time subscriptions
    subscribeToLeaveRequests(employeeId: string, callback: (requests: LeaveRequest[]) => void): () => void {
        const q = query(
            collection(getFirebaseDb(), 'leaveRequests'),
            where('employeeId', '==', employeeId),
            orderBy('submittedAt', 'desc')
        );

        return onSnapshot(q, (querySnapshot) => {
            const requests = querySnapshot.docs.map(doc =>
                this.convertFirestoreToLeaveRequest(doc.data())
            );
            callback(requests);
        });
    }

    subscribeToPerformanceGoals(employeeId: string, callback: (goals: PerformanceGoal[]) => void): () => void {
        const q = query(
            collection(getFirebaseDb(), 'performanceGoals'),
            where('employeeId', '==', employeeId),
            orderBy('createdAt', 'desc')
        );

        return onSnapshot(q, (querySnapshot) => {
            const goals = querySnapshot.docs.map(doc =>
                this.convertFirestoreToPerformanceGoal(doc.data())
            );
            callback(goals);
        });
    }

    subscribeToPolicies(callback: (policies: Policy[]) => void): () => void {
        const q = query(
            collection(getFirebaseDb(), 'policies'),
            where('isActive', '==', true),
            orderBy('effectiveDate', 'desc')
        );

        return onSnapshot(q, (querySnapshot) => {
            const policies = querySnapshot.docs.map(doc =>
                this.convertFirestoreToPolicy(doc.data())
            );
            callback(policies);
        });
    }

    // Utility methods
    private calculateProfileCompleteness(profile: Partial<EmployeeProfile>): number {
        let completeness = 0;
        const totalFields = 10;

        if (profile.personalInfo?.firstName) completeness++;
        if (profile.personalInfo?.lastName) completeness++;
        if (profile.contactInfo?.personalEmail) completeness++;
        if (profile.contactInfo?.personalPhone) completeness++;
        if (profile.contactInfo?.address?.street) completeness++;
        if (profile.workInfo?.position) completeness++;
        if (profile.workInfo?.department) completeness++;
        if (profile.bankingInfo?.bankName) completeness++;
        if (profile.skills && profile.skills.length > 0) completeness++;
        if (profile.familyInfo?.dependents && profile.familyInfo.dependents.length > 0) completeness++;

        return Math.round((completeness / totalFields) * 100);
    }

    // Firestore conversion methods
    private convertToFirestore(data: any): any {
        const converted = { ...data };

        // Convert Date objects to Timestamps
        Object.keys(converted).forEach(key => {
            if (converted[key] instanceof Date) {
                converted[key] = Timestamp.fromDate(converted[key]);
            } else if (typeof converted[key] === 'object' && converted[key] !== null) {
                converted[key] = this.convertToFirestore(converted[key]);
            }
        });

        return converted;
    }

    private convertFirestoreToEmployeeProfile(data: any, docId?: string): EmployeeProfile {
        const profile = {
            ...data,
            employeeId: docId || data.employeeId || data.id,
            id: docId || data.employeeId || data.id,
            personalInfo: {
                ...data.personalInfo,
                dateOfBirth: (() => {
                    const dob = data.personalInfo?.dateOfBirth;
                    console.log('Converting dateOfBirth:', dob, 'type:', typeof dob);

                    // Handle empty objects or serverTimestamp placeholders
                    if (!dob || (typeof dob === 'object' && Object.keys(dob).length === 0)) {
                        console.log('Empty dateOfBirth, using null');
                        return null;
                    }

                    // Handle serverTimestamp placeholders
                    if (dob && typeof dob === 'object' && dob._methodName === 'serverTimestamp') {
                        console.log('ServerTimestamp placeholder for dateOfBirth, using null');
                        return null;
                    }

                    if (dob?.toDate && typeof dob.toDate === 'function') {
                        console.log('Using toDate() for dateOfBirth');
                        return dob.toDate();
                    } else if (dob instanceof Date) {
                        console.log('DateOfBirth is already a Date object');
                        return dob;
                    } else if (dob && typeof dob === 'string' && dob.trim() !== '') {
                        console.log('Converting dateOfBirth string to Date:', dob);
                        const date = new Date(dob);
                        return isNaN(date.getTime()) ? null : date;
                    } else {
                        console.log('Invalid dateOfBirth, using null');
                        return null;
                    }
                })()
            },
            contactInfo: {
                ...data.contactInfo,
                emergencyContacts: Array.isArray(data.contactInfo?.emergencyContacts)
                    ? data.contactInfo.emergencyContacts.map((contact: any) => ({
                        ...contact
                    }))
                    : []
            },
            workInfo: {
                ...data.workInfo,
                hireDate: (() => {
                    const hireDate = data.workInfo?.hireDate;
                    console.log('Converting hireDate:', hireDate, 'type:', typeof hireDate);

                    // Handle empty objects or serverTimestamp placeholders
                    if (!hireDate || (typeof hireDate === 'object' && Object.keys(hireDate).length === 0)) {
                        console.log('Empty hireDate, using null');
                        return null;
                    }

                    // Handle serverTimestamp placeholders
                    if (hireDate && typeof hireDate === 'object' && hireDate._methodName === 'serverTimestamp') {
                        console.log('ServerTimestamp placeholder for hireDate, using null');
                        return null;
                    }

                    if (hireDate?.toDate && typeof hireDate.toDate === 'function') {
                        console.log('Using toDate() for hireDate');
                        return hireDate.toDate();
                    } else if (hireDate instanceof Date) {
                        console.log('HireDate is already a Date object');
                        return hireDate;
                    } else if (hireDate && typeof hireDate === 'string' && hireDate.trim() !== '') {
                        console.log('Converting hireDate string to Date:', hireDate);
                        const date = new Date(hireDate);
                        return isNaN(date.getTime()) ? null : date;
                    } else {
                        console.log('Invalid hireDate, using null');
                        return null;
                    }
                })()
            },
            skills: Array.isArray(data.skills)
                ? data.skills.map((skill: any) => ({
                    ...skill,
                    certificationDate: skill.certificationDate?.toDate ?
                        skill.certificationDate.toDate() :
                        skill.certificationDate,
                    expiryDate: skill.expiryDate?.toDate ?
                        skill.expiryDate.toDate() :
                        skill.expiryDate
                }))
                : [],
            familyInfo: {
                ...data.familyInfo,
                dependents: Array.isArray(data.familyInfo?.dependents)
                    ? data.familyInfo.dependents.map((dependent: any) => ({
                        ...dependent,
                        dateOfBirth: dependent.dateOfBirth?.toDate ?
                            dependent.dateOfBirth.toDate() :
                            (dependent.dateOfBirth || new Date())
                    }))
                    : []
            },
            profileStatus: {
                ...data.profileStatus,
                lastUpdated: data.profileStatus?.lastUpdated?.toDate ?
                    data.profileStatus.lastUpdated.toDate() :
                    (data.profileStatus?.lastUpdated || new Date()),
                completeness: data.profileStatus?.completeness || 0
            },
            createdAt: data.createdAt?.toDate ?
                data.createdAt.toDate() :
                (data.createdAt || new Date()),
            updatedAt: data.updatedAt?.toDate ?
                data.updatedAt.toDate() :
                (data.updatedAt || new Date())
        };

        // Recalculate completeness to ensure consistency
        profile.profileStatus.completeness = this.calculateProfileCompleteness(profile);

        return profile;
    }

    private convertFirestoreToLeaveType(data: any): LeaveType {
        return {
            ...data,
            createdAt: data.createdAt?.toDate() || new Date(),
            updatedAt: data.updatedAt?.toDate() || new Date()
        };
    }

    private convertFirestoreToLeaveRequest(data: any): LeaveRequest {
        return {
            ...data,
            startDate: data.startDate?.toDate() || new Date(),
            endDate: data.endDate?.toDate() || new Date(),
            submittedAt: data.submittedAt?.toDate() || new Date(),
            reviewedAt: data.reviewedAt?.toDate()
        };
    }

    private convertFirestoreToPolicy(data: any): Policy {
        return {
            ...data,
            effectiveDate: data.effectiveDate?.toDate() || new Date(),
            expiryDate: data.expiryDate?.toDate(),
            createdAt: data.createdAt?.toDate() || new Date(),
            lastModified: data.lastModified?.toDate() || new Date()
        };
    }

    private convertFirestoreToPerformanceGoal(data: any): PerformanceGoal {
        return {
            ...data,
            startDate: data.startDate?.toDate() || new Date(),
            endDate: data.endDate?.toDate() || new Date(),
            createdAt: data.createdAt?.toDate() || new Date(),
            updatedAt: data.updatedAt?.toDate() || new Date()
        };
    }

    private convertFirestoreToNotification(data: any): NotificationData {
        return {
            ...data,
            createdAt: data.createdAt?.toDate() || new Date()
        };
    }

    // Additional methods for other interfaces
    async updateLeaveType(id: string, updates: Partial<LeaveType>): Promise<void> {
        const docRef = doc(getFirebaseDb(), 'leaveTypes', id);
        await updateDoc(docRef, { ...updates, updatedAt: serverTimestamp() });
    }

    async deleteLeaveType(id: string): Promise<void> {
        const docRef = doc(getFirebaseDb(), 'leaveTypes', id);
        await updateDoc(docRef, { isActive: false, updatedAt: serverTimestamp() });
    }

    async updateLeaveRequest(id: string, updates: Partial<LeaveRequest>): Promise<void> {
        const docRef = doc(getFirebaseDb(), 'leaveRequests', id);
        await updateDoc(docRef, updates);
    }

    async rejectLeaveRequest(id: string, reviewedBy: string, comments?: string): Promise<void> {
        const docRef = doc(getFirebaseDb(), 'leaveRequests', id);
        await updateDoc(docRef, {
            status: 'rejected',
            reviewedAt: serverTimestamp(),
            reviewedBy,
            comments
        });
    }

    async getLeaveRequests(employeeId?: string): Promise<LeaveRequest[]> {
        let q = query(collection(getFirebaseDb(), 'leaveRequests'), orderBy('submittedAt', 'desc'));
        if (employeeId) {
            q = query(q, where('employeeId', '==', employeeId));
        }
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => this.convertFirestoreToLeaveRequest(doc.data()));
    }

    async getLeaveBalances(employeeId?: string): Promise<LeaveBalance[]> {
        let q = query(collection(getFirebaseDb(), 'leaveBalances'));
        if (employeeId) {
            q = query(q, where('employeeId', '==', employeeId));
        }
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({
            ...doc.data(),
            expiryDate: doc.data().expiryDate?.toDate()
        }));
    }

    async updateLeaveBalance(employeeId: string, leaveTypeId: string, updates: Partial<LeaveBalance>): Promise<void> {
        const docRef = doc(getFirebaseDb(), 'leaveBalances', `${employeeId}_${leaveTypeId}`);
        await setDoc(docRef, updates, { merge: true });
    }

    async getPolicyAcknowledgments(policyId?: string, employeeId?: string): Promise<PolicyAcknowledgment[]> {
        let q = query(collection(getFirebaseDb(), 'policyAcknowledgments'), orderBy('acknowledgedAt', 'desc'));
        if (policyId) {
            q = query(q, where('policyId', '==', policyId));
        }
        if (employeeId) {
            q = query(q, where('employeeId', '==', employeeId));
        }
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({
            ...doc.data(),
            acknowledgedAt: doc.data().acknowledgedAt?.toDate() || new Date()
        }));
    }

    async updatePolicy(id: string, updates: Partial<Policy>): Promise<void> {
        const docRef = doc(getFirebaseDb(), 'policies', id);
        await updateDoc(docRef, { ...updates, lastModified: serverTimestamp() });
    }

    async deletePolicy(id: string): Promise<void> {
        const docRef = doc(getFirebaseDb(), 'policies', id);
        await updateDoc(docRef, { isActive: false, lastModified: serverTimestamp() });
    }

    async getPerformanceReviews(employeeId?: string): Promise<PerformanceReview[]> {
        let q = query(collection(getFirebaseDb(), 'performanceReviews'), orderBy('createdAt', 'desc'));
        if (employeeId) {
            q = query(q, where('employeeId', '==', employeeId));
        }
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate() || new Date(),
            submittedAt: doc.data().submittedAt?.toDate(),
            approvedAt: doc.data().approvedAt?.toDate()
        }));
    }

    async createPerformanceReview(review: Omit<PerformanceReview, 'id' | 'createdAt'>): Promise<PerformanceReview> {
        const docRef = doc(collection(getFirebaseDb(), 'performanceReviews'));
        const newReview: PerformanceReview = {
            id: docRef.id,
            ...review,
            createdAt: new Date()
        };
        await setDoc(docRef, this.convertToFirestore(newReview));
        return newReview;
    }

    async updatePerformanceReview(id: string, updates: Partial<PerformanceReview>): Promise<void> {
        const docRef = doc(getFirebaseDb(), 'performanceReviews', id);
        await updateDoc(docRef, updates);
    }

    async getMeetingSchedules(employeeId?: string): Promise<MeetingSchedule[]> {
        let q = query(collection(getFirebaseDb(), 'meetingSchedules'), orderBy('scheduledDate', 'asc'));
        if (employeeId) {
            q = query(q, where('employeeId', '==', employeeId));
        }
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({
            ...doc.data(),
            scheduledDate: doc.data().scheduledDate?.toDate() || new Date(),
            createdAt: doc.data().createdAt?.toDate() || new Date(),
            updatedAt: doc.data().updatedAt?.toDate() || new Date()
        }));
    }

    async updateMeetingSchedule(id: string, updates: Partial<MeetingSchedule>): Promise<void> {
        const docRef = doc(getFirebaseDb(), 'meetingSchedules', id);
        await updateDoc(docRef, { ...updates, updatedAt: serverTimestamp() });
    }

    async deleteMeetingSchedule(id: string): Promise<void> {
        const docRef = doc(getFirebaseDb(), 'meetingSchedules', id);
        await deleteDoc(docRef);
    }

    async updatePerformanceGoal(id: string, updates: Partial<PerformanceGoal>): Promise<void> {
        const docRef = doc(getFirebaseDb(), 'performanceGoals', id);
        await updateDoc(docRef, { ...updates, updatedAt: serverTimestamp() });
    }

    async deletePerformanceGoal(id: string): Promise<void> {
        const docRef = doc(getFirebaseDb(), 'performanceGoals', id);
        await deleteDoc(docRef);
    }
}

// Factory function to get the appropriate service
export async function getComprehensiveDataFlowService(): Promise<IComprehensiveDataFlowService> {
    try {
        // Check if Firebase is available and configured
        if (typeof window !== 'undefined' && getFirebaseDb()) {
            return new FirebaseComprehensiveDataFlowService();
        }
        throw new Error('Firebase not available');
    } catch (error) {
        console.warn('Firebase not available, falling back to mock service');
        // Return a mock implementation for development
        return new MockComprehensiveDataFlowService();
    }
}

// Mock implementation for development
class MockComprehensiveDataFlowService implements IComprehensiveDataFlowService {
    // Mock implementations would go here
    // For now, just throw errors to indicate Firebase is required
    async getEmployeeProfile(employeeId: string): Promise<EmployeeProfile | null> {
        throw new Error('Mock service not implemented - use Firebase');
    }

    async getAllEmployees(): Promise<EmployeeProfile[]> {
        throw new Error('Mock service not implemented - use Firebase');
    }

    async updateEmployeeProfile(employeeId: string, profileData: Partial<EmployeeProfile>): Promise<EmployeeProfile> {
        throw new Error('Mock service not implemented - use Firebase');
    }

    subscribeToEmployeeUpdates(employeeId: string, callback: (profile: EmployeeProfile) => void): () => void {
        throw new Error('Mock service not implemented - use Firebase');
    }

    subscribeToAllEmployees(callback: (employees: EmployeeProfile[]) => void): () => void {
        throw new Error('Mock service not implemented - use Firebase');
    }

    // Add all other required methods with similar error throwing
    async getLeaveTypes(): Promise<LeaveType[]> { throw new Error('Mock service not implemented - use Firebase'); }
    async createLeaveType(leaveType: Omit<LeaveType, 'id' | 'createdAt' | 'updatedAt'>): Promise<LeaveType> { throw new Error('Mock service not implemented - use Firebase'); }
    async updateLeaveType(id: string, updates: Partial<LeaveType>): Promise<void> { throw new Error('Mock service not implemented - use Firebase'); }
    async deleteLeaveType(id: string): Promise<void> { throw new Error('Mock service not implemented - use Firebase'); }
    async getLeaveRequests(employeeId?: string): Promise<LeaveRequest[]> { throw new Error('Mock service not implemented - use Firebase'); }
    async createLeaveRequest(request: Omit<LeaveRequest, 'id' | 'submittedAt'>): Promise<LeaveRequest> { throw new Error('Mock service not implemented - use Firebase'); }
    async updateLeaveRequest(id: string, updates: Partial<LeaveRequest>): Promise<void> { throw new Error('Mock service not implemented - use Firebase'); }
    async approveLeaveRequest(id: string, reviewedBy: string, comments?: string): Promise<void> { throw new Error('Mock service not implemented - use Firebase'); }
    async rejectLeaveRequest(id: string, reviewedBy: string, comments?: string): Promise<void> { throw new Error('Mock service not implemented - use Firebase'); }
    async getLeaveBalances(employeeId?: string): Promise<LeaveBalance[]> { throw new Error('Mock service not implemented - use Firebase'); }
    async updateLeaveBalance(employeeId: string, leaveTypeId: string, updates: Partial<LeaveBalance>): Promise<void> { throw new Error('Mock service not implemented - use Firebase'); }
    async getPolicies(activeOnly?: boolean): Promise<Policy[]> { throw new Error('Mock service not implemented - use Firebase'); }
    async createPolicy(policy: Omit<Policy, 'id' | 'createdAt' | 'lastModified'>): Promise<Policy> { throw new Error('Mock service not implemented - use Firebase'); }
    async updatePolicy(id: string, updates: Partial<Policy>): Promise<void> { throw new Error('Mock service not implemented - use Firebase'); }
    async deletePolicy(id: string): Promise<void> { throw new Error('Mock service not implemented - use Firebase'); }
    async getPolicyAcknowledgments(policyId?: string, employeeId?: string): Promise<PolicyAcknowledgment[]> { throw new Error('Mock service not implemented - use Firebase'); }
    async acknowledgePolicy(policyId: string, employeeId: string, acknowledgment: Omit<PolicyAcknowledgment, 'id' | 'acknowledgedAt'>): Promise<void> { throw new Error('Mock service not implemented - use Firebase'); }
    async getPerformanceGoals(employeeId?: string): Promise<PerformanceGoal[]> { throw new Error('Mock service not implemented - use Firebase'); }
    async createPerformanceGoal(goal: Omit<PerformanceGoal, 'id' | 'createdAt' | 'updatedAt'>): Promise<PerformanceGoal> { throw new Error('Mock service not implemented - use Firebase'); }
    async updatePerformanceGoal(id: string, updates: Partial<PerformanceGoal>): Promise<void> { throw new Error('Mock service not implemented - use Firebase'); }
    async deletePerformanceGoal(id: string): Promise<void> { throw new Error('Mock service not implemented - use Firebase'); }
    async getPerformanceReviews(employeeId?: string): Promise<PerformanceReview[]> { throw new Error('Mock service not implemented - use Firebase'); }
    async createPerformanceReview(review: Omit<PerformanceReview, 'id' | 'createdAt'>): Promise<PerformanceReview> { throw new Error('Mock service not implemented - use Firebase'); }
    async updatePerformanceReview(id: string, updates: Partial<PerformanceReview>): Promise<void> { throw new Error('Mock service not implemented - use Firebase'); }
    async getMeetingSchedules(employeeId?: string): Promise<MeetingSchedule[]> { throw new Error('Mock service not implemented - use Firebase'); }
    async createMeetingSchedule(meeting: Omit<MeetingSchedule, 'id' | 'createdAt' | 'updatedAt'>): Promise<MeetingSchedule> { throw new Error('Mock service not implemented - use Firebase'); }
    async updateMeetingSchedule(id: string, updates: Partial<MeetingSchedule>): Promise<void> { throw new Error('Mock service not implemented - use Firebase'); }
    async deleteMeetingSchedule(id: string): Promise<void> { throw new Error('Mock service not implemented - use Firebase'); }
    async getNotifications(employeeId: string): Promise<NotificationData[]> { throw new Error('Mock service not implemented - use Firebase'); }
    async createNotification(notification: Omit<NotificationData, 'id' | 'createdAt'>): Promise<void> { throw new Error('Mock service not implemented - use Firebase'); }
    async markNotificationAsRead(notificationId: string): Promise<void> { throw new Error('Mock service not implemented - use Firebase'); }
    subscribeToNotifications(employeeId: string, callback: (notifications: NotificationData[]) => void): () => void { throw new Error('Mock service not implemented - use Firebase'); }
    subscribeToLeaveRequests(employeeId: string, callback: (requests: LeaveRequest[]) => void): () => void { throw new Error('Mock service not implemented - use Firebase'); }
    subscribeToPerformanceGoals(employeeId: string, callback: (goals: PerformanceGoal[]) => void): () => void { throw new Error('Mock service not implemented - use Firebase'); }
    subscribeToPolicies(callback: (policies: Policy[]) => void): () => void { throw new Error('Mock service not implemented - use Firebase'); }
}
