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
import { db } from '../config/firebase';

// Comprehensive interfaces for all HRIS systems
export interface EmployeeProfile {
    id: string;
    employeeId: string;
    personalInfo: {
        firstName: string;
        lastName: string;
        middleName?: string;
        dateOfBirth: Date;
        gender?: string;
        maritalStatus?: string;
        nationality?: string;
        otherNationality?: string;
        identificationNumber?: string;
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
        hireDate: Date;
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
            const docRef = doc(db, 'employees', employeeId);
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
            const employeesRef = collection(db, 'employees');
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
            console.log('🔄 updateEmployeeProfile called with:', employeeId, profileData);
            console.log('📄 Document reference:', `employees/${employeeId}`);
            const docRef = doc(db, 'employees', employeeId);
            const updateData = {
                ...profileData,
                updatedAt: serverTimestamp(),
                profileStatus: {
                    ...profileData.profileStatus,
                    lastUpdated: serverTimestamp(),
                    completeness: this.calculateProfileCompleteness(profileData as EmployeeProfile)
                }
            };

            console.log('📝 Converting to Firestore format...');
            console.log('📝 Update data before conversion:', updateData);
            console.log('📝 Date of birth before conversion:', updateData.personalInfo?.dateOfBirth, typeof updateData.personalInfo?.dateOfBirth);
            console.log('📝 Hire date before conversion:', updateData.workInfo?.hireDate, typeof updateData.workInfo?.hireDate);
            console.log('📝 Last updated before conversion:', updateData.profileStatus?.lastUpdated, typeof updateData.profileStatus?.lastUpdated);
            console.log('📝 Personal info structure:', updateData.personalInfo);
            console.log('📝 Work info structure:', updateData.workInfo);
            const firestoreData = this.convertToFirestore(updateData);
            console.log('📝 Firestore data:', firestoreData);
            console.log('📝 Date of birth after conversion:', firestoreData.personalInfo?.dateOfBirth, typeof firestoreData.personalInfo?.dateOfBirth);
            console.log('📝 Hire date after conversion:', firestoreData.workInfo?.hireDate, typeof firestoreData.workInfo?.hireDate);
            console.log('📝 Last updated after conversion:', firestoreData.profileStatus?.lastUpdated, typeof firestoreData.profileStatus?.lastUpdated);

            // Use setDoc with merge to create document if it doesn't exist
            console.log('💾 Saving to Firestore...');
            await setDoc(docRef, firestoreData, { merge: true });
            console.log('✅ Successfully saved to Firestore');

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
        const docRef = doc(db, 'employees', employeeId);

        return onSnapshot(docRef, (doc) => {
            if (doc.exists()) {
                const profile = this.convertFirestoreToEmployeeProfile(doc.data(), doc.id);
                callback(profile);
            }
        });
    }

    // Leave Management
    async getLeaveTypes(): Promise<LeaveType[]> {
        try {
            const q = query(collection(db, 'leaveTypes'), where('isActive', '==', true), orderBy('name'));
            const querySnapshot = await getDocs(q);

            return querySnapshot.docs.map(doc => this.convertFirestoreToLeaveType(doc.data()));
        } catch (error) {
            console.error('Error getting leave types:', error);
            throw error;
        }
    }

    async createLeaveType(leaveType: Omit<LeaveType, 'id' | 'createdAt' | 'updatedAt'>): Promise<LeaveType> {
        try {
            const docRef = doc(collection(db, 'leaveTypes'));
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
            const docRef = doc(collection(db, 'leaveRequests'));
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
            const docRef = doc(db, 'leaveRequests', id);
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
            let q = query(collection(db, 'policies'), orderBy('effectiveDate', 'desc'));

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
            const docRef = doc(collection(db, 'policies'));
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
            const docRef = doc(collection(db, 'policyAcknowledgments'));
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
            let q = query(collection(db, 'performanceGoals'), orderBy('createdAt', 'desc'));

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
            const docRef = doc(collection(db, 'performanceGoals'));
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
            const docRef = doc(collection(db, 'meetingSchedules'));
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
                collection(db, 'notifications'),
                where('employeeId', 'in', [employeeId, 'all-employees'])
            );
            const querySnapshot = await getDocs(q);

            return querySnapshot.docs.map(doc => this.convertFirestoreToNotification(doc.data()));
        } catch (error) {
            console.error('Error getting notifications:', error);
            // Fallback to simple query without where clause if the above fails
            try {
                const simpleQuery = query(collection(db, 'notifications'));
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
            const docRef = doc(collection(db, 'notifications'));
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
            const docRef = doc(db, 'notifications', notificationId);
            await updateDoc(docRef, { isRead: true });
        } catch (error) {
            console.error('Error marking notification as read:', error);
            throw error;
        }
    }

    subscribeToNotifications(employeeId: string, callback: (notifications: NotificationData[]) => void): () => void {
        // Simplified query without orderBy to avoid index requirements
        const q = query(
            collection(db, 'notifications'),
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
            collection(db, 'leaveRequests'),
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
            collection(db, 'performanceGoals'),
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
            collection(db, 'policies'),
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
        // Remove undefined values and convert dates
        const removeUndefined = (obj: any): any => {
            if (obj === null || obj === undefined) {
                return null;
            }
            if (obj instanceof Date) {
                console.log('🔍 Preserving Date object in removeUndefined:', obj);
                return obj; // Preserve Date objects
            }
            // Preserve serverTimestamp objects
            if (obj && typeof obj === 'object' && obj._methodName === 'serverTimestamp') {
                console.log('🔍 Preserving serverTimestamp object in removeUndefined:', obj);
                return obj; // Preserve serverTimestamp objects
            }
            if (Array.isArray(obj)) {
                return obj.map(removeUndefined).filter(item => item !== undefined);
            }
            if (typeof obj === 'object') {
                const cleaned: any = {};
                for (const [key, value] of Object.entries(obj)) {
                    if (value !== undefined) {
                        cleaned[key] = removeUndefined(value);
                    }
                }
                return cleaned;
            }
            return obj;
        };

        const cleaned = removeUndefined(data);
        const converted = { ...cleaned };

        console.log('🔍 Before recursive conversion:');
        console.log('🔍 personalInfo.dateOfBirth:', converted.personalInfo?.dateOfBirth, typeof converted.personalInfo?.dateOfBirth, converted.personalInfo?.dateOfBirth instanceof Date);
        console.log('🔍 workInfo.hireDate:', converted.workInfo?.hireDate, typeof converted.workInfo?.hireDate, converted.workInfo?.hireDate instanceof Date);

        // Convert Date objects to Timestamps recursively
        const convertDatesToTimestamps = (obj: any, path: string = ''): any => {
            if (obj === null || obj === undefined) {
                return obj;
            }
            if (obj instanceof Date) {
                console.log(`Converting Date to Timestamp at ${path}:`, obj);
                try {
                    const timestamp = Timestamp.fromDate(obj);
                    console.log(`Converted to Timestamp at ${path}:`, timestamp);
                    return timestamp;
                } catch (error) {
                    console.error(`Error converting Date to Timestamp at ${path}:`, error, obj);
                    return obj; // Return original if conversion fails
                }
            }
            if (Array.isArray(obj)) {
                return obj.map((item, index) => convertDatesToTimestamps(item, `${path}[${index}]`));
            }
            if (typeof obj === 'object') {
                const result: any = {};
                for (const [key, value] of Object.entries(obj)) {
                    const newPath = path ? `${path}.${key}` : key;
                    console.log(`Processing nested object at ${newPath}:`, value, typeof value, value instanceof Date);
                    result[key] = convertDatesToTimestamps(value, newPath);
                }
                return result;
            }
            return obj;
        };

        const finalConverted = convertDatesToTimestamps(converted);

        return finalConverted;
    }

    private convertFirestoreToEmployeeProfile(data: any, docId?: string): EmployeeProfile {
        const profile = {
            ...data,
            id: docId || data.id || 'unknown',
            employeeId: docId || data.employeeId || data.id || 'unknown',
            personalInfo: {
                ...data.personalInfo,
                dateOfBirth: (() => {
                    const dob = data.personalInfo?.dateOfBirth;
                    console.log('Converting dateOfBirth from Firestore:', dob, typeof dob);
                    if (dob?.toDate) {
                        const converted = dob.toDate();
                        console.log('Converted dateOfBirth from Timestamp:', converted);
                        return converted;
                    } else if (dob && typeof dob === 'string' && dob !== '') {
                        const converted = new Date(dob);
                        console.log('Converted dateOfBirth from string:', converted);
                        return converted;
                    } else if (dob && typeof dob === 'object' && Object.keys(dob).length > 0) {
                        const converted = new Date(dob);
                        console.log('Converted dateOfBirth from object:', converted);
                        return converted;
                    } else {
                        console.log('Using default date for dateOfBirth (empty or invalid)');
                        return new Date('1990-01-01'); // Use a valid default date
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
                    console.log('Converting hireDate from Firestore:', hireDate, typeof hireDate);
                    if (hireDate?.toDate) {
                        const converted = hireDate.toDate();
                        console.log('Converted hireDate from Timestamp:', converted);
                        return converted;
                    } else if (hireDate && typeof hireDate === 'string' && hireDate !== '') {
                        const converted = new Date(hireDate);
                        console.log('Converted hireDate from string:', converted);
                        return converted;
                    } else if (hireDate && typeof hireDate === 'object' && Object.keys(hireDate).length > 0) {
                        const converted = new Date(hireDate);
                        console.log('Converted hireDate from object:', converted);
                        return converted;
                    } else {
                        console.log('Using default date for hireDate (empty or invalid)');
                        return new Date('2020-01-01'); // Use a valid default date
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
                lastUpdated: (() => {
                    const lastUpdated = data.profileStatus?.lastUpdated;
                    console.log('Converting lastUpdated from Firestore:', lastUpdated, typeof lastUpdated);
                    if (lastUpdated?.toDate) {
                        const converted = lastUpdated.toDate();
                        console.log('Converted lastUpdated from Timestamp:', converted);
                        return converted;
                    } else if (lastUpdated && typeof lastUpdated === 'string' && lastUpdated !== '') {
                        const converted = new Date(lastUpdated);
                        console.log('Converted lastUpdated from string:', converted);
                        return converted;
                    } else if (lastUpdated && typeof lastUpdated === 'object' && lastUpdated._methodName === 'serverTimestamp') {
                        console.log('Detected serverTimestamp placeholder, using current date for lastUpdated');
                        return new Date();
                    } else if (lastUpdated && typeof lastUpdated === 'object' && Object.keys(lastUpdated).length > 0) {
                        const converted = new Date(lastUpdated);
                        console.log('Converted lastUpdated from object:', converted);
                        return converted;
                    } else {
                        console.log('Using current date for lastUpdated (empty or invalid)');
                        return new Date();
                    }
                })(),
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
        const docRef = doc(db, 'leaveTypes', id);
        await updateDoc(docRef, { ...updates, updatedAt: serverTimestamp() });
    }

    async deleteLeaveType(id: string): Promise<void> {
        const docRef = doc(db, 'leaveTypes', id);
        await updateDoc(docRef, { isActive: false, updatedAt: serverTimestamp() });
    }

    async updateLeaveRequest(id: string, updates: Partial<LeaveRequest>): Promise<void> {
        const docRef = doc(db, 'leaveRequests', id);
        await updateDoc(docRef, updates);
    }

    async rejectLeaveRequest(id: string, reviewedBy: string, comments?: string): Promise<void> {
        const docRef = doc(db, 'leaveRequests', id);
        await updateDoc(docRef, {
            status: 'rejected',
            reviewedAt: serverTimestamp(),
            reviewedBy,
            comments
        });
    }

    async getLeaveRequests(employeeId?: string): Promise<LeaveRequest[]> {
        let q = query(collection(db, 'leaveRequests'), orderBy('submittedAt', 'desc'));
        if (employeeId) {
            q = query(q, where('employeeId', '==', employeeId));
        }
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => this.convertFirestoreToLeaveRequest(doc.data()));
    }

    async getLeaveBalances(employeeId?: string): Promise<LeaveBalance[]> {
        let q = query(collection(db, 'leaveBalances'));
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
        const docRef = doc(db, 'leaveBalances', `${employeeId}_${leaveTypeId}`);
        await setDoc(docRef, updates, { merge: true });
    }

    async getPolicyAcknowledgments(policyId?: string, employeeId?: string): Promise<PolicyAcknowledgment[]> {
        let q = query(collection(db, 'policyAcknowledgments'), orderBy('acknowledgedAt', 'desc'));
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
        const docRef = doc(db, 'policies', id);
        await updateDoc(docRef, { ...updates, lastModified: serverTimestamp() });
    }

    async deletePolicy(id: string): Promise<void> {
        const docRef = doc(db, 'policies', id);
        await updateDoc(docRef, { isActive: false, lastModified: serverTimestamp() });
    }

    async getPerformanceReviews(employeeId?: string): Promise<PerformanceReview[]> {
        let q = query(collection(db, 'performanceReviews'), orderBy('createdAt', 'desc'));
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
        const docRef = doc(collection(db, 'performanceReviews'));
        const newReview: PerformanceReview = {
            id: docRef.id,
            ...review,
            createdAt: new Date()
        };
        await setDoc(docRef, this.convertToFirestore(newReview));
        return newReview;
    }

    async updatePerformanceReview(id: string, updates: Partial<PerformanceReview>): Promise<void> {
        const docRef = doc(db, 'performanceReviews', id);
        await updateDoc(docRef, updates);
    }

    async getMeetingSchedules(employeeId?: string): Promise<MeetingSchedule[]> {
        let q = query(collection(db, 'meetingSchedules'), orderBy('scheduledDate', 'asc'));
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
        const docRef = doc(db, 'meetingSchedules', id);
        await updateDoc(docRef, { ...updates, updatedAt: serverTimestamp() });
    }

    async deleteMeetingSchedule(id: string): Promise<void> {
        const docRef = doc(db, 'meetingSchedules', id);
        await deleteDoc(docRef);
    }

    async updatePerformanceGoal(id: string, updates: Partial<PerformanceGoal>): Promise<void> {
        const docRef = doc(db, 'performanceGoals', id);
        await updateDoc(docRef, { ...updates, updatedAt: serverTimestamp() });
    }

    async deletePerformanceGoal(id: string): Promise<void> {
        const docRef = doc(db, 'performanceGoals', id);
        await deleteDoc(docRef);
    }
}

// Factory function to get the appropriate service
export async function getComprehensiveDataFlowService(): Promise<IComprehensiveDataFlowService> {
    try {
        // Import Firebase initialization function
        const { initializeFirebase, isFirebaseConfigured } = await import('../config/firebase');

        // Wait for Firebase to initialize
        await initializeFirebase();

        // Check if Firebase is properly configured
        if (isFirebaseConfigured()) {
            console.log('✅ Using Firebase service');
            return new FirebaseComprehensiveDataFlowService();
        }

        throw new Error('Firebase not properly configured');
    } catch (error) {
        console.warn('⚠️ Firebase not available, falling back to mock service:', error);
        // Return a mock implementation for development
        return new MockComprehensiveDataFlowService();
    }
}

// Mock implementation for development
class MockComprehensiveDataFlowService implements IComprehensiveDataFlowService {
    private mockData = {
        employees: new Map<string, EmployeeProfile>(),
        leaveTypes: [] as LeaveType[],
        policies: [] as Policy[],
        notifications: [] as NotificationData[]
    };

    async getEmployeeProfile(employeeId: string): Promise<EmployeeProfile | null> {
        console.log('🚫 Mock service: No profile found for', employeeId);
        console.log('💡 Create a new profile in the HR Dashboard or Employee Dashboard');
        return null;
    }

    async getAllEmployees(): Promise<EmployeeProfile[]> {
        console.log('🔧 Mock service: Getting all employees');
        return Array.from(this.mockData.employees.values());
    }

    async updateEmployeeProfile(employeeId: string, profileData: Partial<EmployeeProfile>): Promise<EmployeeProfile> {
        console.log('🔧 Mock service: Creating/updating profile for', employeeId);

        // Create a basic profile structure with the provided data
        const now = new Date();
        const newProfile: EmployeeProfile = {
            id: employeeId,
            employeeId: employeeId,
            personalInfo: {
                firstName: profileData.personalInfo?.firstName || '',
                lastName: profileData.personalInfo?.lastName || '',
                middleName: profileData.personalInfo?.middleName,
                dateOfBirth: profileData.personalInfo?.dateOfBirth || new Date(),
                gender: profileData.personalInfo?.gender,
                maritalStatus: profileData.personalInfo?.maritalStatus,
                nationality: profileData.personalInfo?.nationality,
                ssn: profileData.personalInfo?.ssn,
                passportNumber: profileData.personalInfo?.passportNumber
            },
            contactInfo: {
                personalEmail: profileData.contactInfo?.personalEmail || '',
                workEmail: profileData.contactInfo?.workEmail || '',
                personalPhone: profileData.contactInfo?.personalPhone || '',
                workPhone: profileData.contactInfo?.workPhone || '',
                address: {
                    street: profileData.contactInfo?.address?.street || '',
                    city: profileData.contactInfo?.address?.city || '',
                    state: profileData.contactInfo?.address?.state || '',
                    zipCode: profileData.contactInfo?.address?.zipCode || '',
                    country: profileData.contactInfo?.address?.country || ''
                },
                emergencyContacts: profileData.contactInfo?.emergencyContacts || []
            },
            workInfo: {
                position: profileData.workInfo?.position || '',
                department: profileData.workInfo?.department || '',
                managerId: profileData.workInfo?.managerId,
                hireDate: profileData.workInfo?.hireDate || now,
                employmentType: profileData.workInfo?.employmentType || '',
                workLocation: profileData.workInfo?.workLocation || '',
                workSchedule: profileData.workInfo?.workSchedule || '',
                salary: {
                    baseSalary: profileData.workInfo?.salary?.baseSalary || 0,
                    currency: profileData.workInfo?.salary?.currency || 'NGN',
                    payFrequency: profileData.workInfo?.salary?.payFrequency || 'Monthly'
                }
            },
            bankingInfo: {
                bankName: profileData.bankingInfo?.bankName || '',
                accountNumber: profileData.bankingInfo?.accountNumber || '',
                routingNumber: profileData.bankingInfo?.routingNumber || '',
                accountType: profileData.bankingInfo?.accountType || '',
                salaryPaymentMethod: profileData.bankingInfo?.salaryPaymentMethod || '',
                taxInformation: {
                    federalTaxId: profileData.bankingInfo?.taxInformation?.federalTaxId,
                    stateTaxId: profileData.bankingInfo?.taxInformation?.stateTaxId,
                    exemptions: profileData.bankingInfo?.taxInformation?.exemptions || 0
                }
            },
            skills: profileData.skills || [],
            familyInfo: {
                spouse: profileData.familyInfo?.spouse,
                dependents: profileData.familyInfo?.dependents || [],
                beneficiaries: profileData.familyInfo?.beneficiaries || []
            },
            profileStatus: {
                completeness: 0, // Will be calculated
                lastUpdated: now,
                updatedBy: 'user',
                status: 'draft'
            },
            createdAt: profileData.createdAt || now,
            updatedAt: now
        };

        // Store in mock data
        this.mockData.employees.set(employeeId, newProfile);

        console.log('✅ Mock profile created/updated for', employeeId);
        return newProfile;
    }

    subscribeToEmployeeUpdates(employeeId: string, callback: (profile: EmployeeProfile) => void): () => void {
        console.log('🔧 Mock service: Setting up subscription for', employeeId);

        // Simulate real-time updates by checking for profile changes
        const checkForUpdates = () => {
            const profile = this.mockData.employees.get(employeeId);
            if (profile) {
                callback(profile);
            }
        };

        // Initial call
        setTimeout(checkForUpdates, 100);

        // Return unsubscribe function
        return () => {
            console.log('🔧 Mock service: Unsubscribed from', employeeId);
        };
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
