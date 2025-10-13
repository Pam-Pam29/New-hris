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
    Timestamp,
    writeBatch,
    increment,
    serverTimestamp
} from 'firebase/firestore';
import { getServiceConfig, initializeFirebase, db } from '../config/firebase';

// Enhanced types for comprehensive data flow
export interface EmployeeProfileData {
    id: string;
    personalInfo: {
        firstName: string;
        lastName: string;
        dateOfBirth: Date;
        gender: string;
        nationality: string;
        maritalStatus: string;
        nationalId: string;
        profilePhoto?: string;
    };
    contactInfo: {
        email: string;
        workEmail: string;
        phone: string;
        address: {
            street: string;
            city: string;
            state: string;
            postalCode: string;
            country: string;
        };
        emergencyContact: {
            id: string;
            name: string;
            relationship: string;
            phone: string;
            isPrimary: boolean;
        };
    };
    bankingInfo: {
        bankName: string;
        accountNumber: string;
        accountType: string;
    };
    workInfo: {
        employeeId: string;
        department: string;
        position: string;
        managerId: string;
        hireDate: Date;
        employmentType: string;
    };
    profileCompleteness: number;
    lastUpdated: Date;
    updatedBy: string;
    documents: any[];
    skills: any[];
    emergencyContacts: any[];
    createdAt: Date;
    updatedAt: Date;
}

export interface LeaveRequestData {
    id: string;
    employeeId: string;
    employeeName: string;
    department: string;
    leaveTypeId: string;
    leaveTypeName: string;
    startDate: Date;
    endDate: Date;
    totalDays: number;
    reason: string;
    status: 'Pending' | 'Approved' | 'Rejected' | 'Cancelled';
    submittedDate: Date;
    approver?: string;
    approvedDate?: Date;
    rejectionReason?: string;
    attachments?: string[];
    comments?: string;
}

export interface LeaveBalanceData {
    id: string;
    employeeId: string;
    leaveTypeId: string;
    leaveTypeName: string;
    totalEntitlement: number;
    used: number;
    remaining: number;
    pending: number;
    accrued: number;
    year: number;
    carryOver?: number;
    expiryDate?: Date;
}

export interface LeaveTypeData {
    id: string;
    name: string;
    description: string;
    daysAllowed: number;
    color: string;
    isActive: boolean;
    requiresApproval: boolean;
    requiresDocumentation: boolean;
    carryOverRules: {
        enabled: boolean;
        maxCarryOver: number;
        expiryMonths: number;
    };
    accrualRules: {
        enabled: boolean;
        rate: number; // days per month
        maxAccrual: number;
    };
    createdAt: Date;
    updatedAt: Date;
}

export interface PolicyData {
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
    applicableRoles: string[];
    applicableDepartments: string[];
    attachments?: string[];
    createdBy: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface PolicyAcknowledgmentData {
    id: string;
    employeeId: string;
    employeeName: string;
    policyId: string;
    policyTitle: string;
    policyVersion: string;
    acknowledgedAt: Date;
    ipAddress: string;
    userAgent: string;
    signature: string;
    isAcknowledged: boolean;
}

export interface PerformanceMeetingData {
    id: string;
    employeeId: string;
    employeeName: string;
    managerId: string;
    managerName: string;
    meetingType: 'performance_review' | 'one_on_one' | 'career_development' | 'disciplinary' | 'training';
    scheduledDate: Date;
    duration: number; // minutes
    location: string;
    agenda: string;
    status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled';
    notes?: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface NotificationData {
    id: string;
    employeeId: string;
    type: 'info' | 'warning' | 'success' | 'error';
    title: string;
    message: string;
    actionUrl?: string;
    actionText?: string;
    read: boolean;
    createdAt: Date;
    priority: 'low' | 'medium' | 'high' | 'urgent';
    metadata?: any;
}

export interface ActivityLogData {
    id: string;
    employeeId: string;
    action: string;
    entityType: string;
    entityId: string;
    oldValues?: any;
    newValues?: any;
    ipAddress: string;
    userAgent: string;
    timestamp: Date;
}

// Abstract interface for data flow operations
export interface IDataFlowService {
    // Employee Profile Management
    updateEmployeeProfile(employeeId: string, profileData: Partial<EmployeeProfileData>): Promise<EmployeeProfileData>;
    getEmployeeProfile(employeeId: string): Promise<EmployeeProfileData | null>;
    calculateProfileCompleteness(profileData: Partial<EmployeeProfileData>): number;

    // Leave Management
    createLeaveRequest(requestData: Omit<LeaveRequestData, 'id' | 'submittedDate'>): Promise<LeaveRequestData>;
    approveLeaveRequest(requestId: string, approverId: string, comments?: string): Promise<void>;
    rejectLeaveRequest(requestId: string, approverId: string, reason: string): Promise<void>;
    updateLeaveBalance(employeeId: string, leaveTypeId: string, daysUsed: number, action: 'add' | 'subtract'): Promise<void>;

    // Leave Type Management
    createLeaveType(leaveTypeData: Omit<LeaveTypeData, 'id' | 'createdAt' | 'updatedAt'>): Promise<LeaveTypeData>;
    updateLeaveType(leaveTypeId: string, updates: Partial<LeaveTypeData>): Promise<void>;
    deactivateLeaveType(leaveTypeId: string): Promise<void>;

    // Policy Management
    createPolicy(policyData: Omit<PolicyData, 'id' | 'createdAt' | 'updatedAt'>): Promise<PolicyData>;
    acknowledgePolicy(employeeId: string, policyId: string, signature: string): Promise<PolicyAcknowledgmentData>;
    getPendingPolicies(employeeId: string): Promise<PolicyData[]>;

    // Performance Management
    scheduleMeeting(meetingData: Omit<PerformanceMeetingData, 'id' | 'createdAt' | 'updatedAt'>): Promise<PerformanceMeetingData>;
    confirmMeeting(meetingId: string, employeeId: string): Promise<void>;
    updateMeetingStatus(meetingId: string, status: PerformanceMeetingData['status'], notes?: string): Promise<void>;

    // Notifications
    createNotification(notificationData: Omit<NotificationData, 'id' | 'createdAt'>): Promise<NotificationData>;
    markNotificationAsRead(notificationId: string): Promise<void>;
    getUnreadNotifications(employeeId: string): Promise<NotificationData[]>;

    // Activity Logging
    logActivity(activityData: Omit<ActivityLogData, 'id' | 'timestamp'>): Promise<void>;

    // Real-time subscriptions
    subscribeToEmployeeUpdates(employeeId: string, callback: (profile: EmployeeProfileData) => void): () => void;
    subscribeToLeaveRequests(employeeId: string, callback: (requests: LeaveRequestData[]) => void): () => void;
    subscribeToNotifications(employeeId: string, callback: (notifications: NotificationData[]) => void): () => void;
    subscribeToPolicies(callback: (policies: PolicyData[]) => void): () => void;
}

// Firebase implementation
export class FirebaseDataFlowService implements IDataFlowService {
    private db: any;

    constructor(db: any) {
        this.db = db;
    }

    // Employee Profile Management
    async updateEmployeeProfile(employeeId: string, profileData: Partial<EmployeeProfileData>): Promise<EmployeeProfileData> {
        try {
            const docRef = doc(this.db, 'employeeProfiles', employeeId);

            // Calculate profile completeness
            const completeness = this.calculateProfileCompleteness(profileData);

            const updateData = {
                ...profileData,
                profileCompleteness: completeness,
                lastUpdated: Timestamp.now(),
                updatedAt: Timestamp.now()
            };

            await updateDoc(docRef, updateData);

            // Log the activity
            await this.logActivity({
                employeeId,
                action: 'profile_updated',
                entityType: 'employee_profile',
                entityId: employeeId,
                newValues: updateData,
                ipAddress: '192.168.1.100', // In real app, get actual IP
                userAgent: navigator.userAgent
            });

            // Create notification for HR
            await this.createNotification({
                employeeId: 'hr-system', // Special ID for HR notifications
                type: 'info',
                title: 'Employee Profile Updated',
                message: `Employee ${profileData.personalInfo?.firstName || 'Unknown'} has updated their profile. Completeness: ${completeness}%`,
                actionUrl: `/hr/core-hr/employee-management/${employeeId}`,
                actionText: 'View Profile',
                read: false,
                priority: 'medium',
                metadata: { employeeId, completeness }
            });

            const updatedDoc = await getDoc(docRef);
            return updatedDoc.data() as EmployeeProfileData;
        } catch (error) {
            console.error('Error updating employee profile:', error);
            throw error;
        }
    }

    async getEmployeeProfile(employeeId: string): Promise<EmployeeProfileData | null> {
        try {
            const docRef = doc(this.db, 'employeeProfiles', employeeId);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                const data = docSnap.data();
                return {
                    ...data,
                    personalInfo: {
                        ...data.personalInfo,
                        dateOfBirth: data.personalInfo?.dateOfBirth?.toDate() || new Date()
                    },
                    workInfo: {
                        ...data.workInfo,
                        hireDate: data.workInfo?.hireDate?.toDate() || new Date()
                    },
                    lastUpdated: data.lastUpdated?.toDate() || new Date(),
                    createdAt: data.createdAt?.toDate() || new Date(),
                    updatedAt: data.updatedAt?.toDate() || new Date()
                } as EmployeeProfileData;
            }
            return null;
        } catch (error) {
            console.error('Error getting employee profile:', error);
            throw error;
        }
    }

    calculateProfileCompleteness(profileData: Partial<EmployeeProfileData>): number {
        const fields = [
            'firstName', 'lastName', 'dateOfBirth', 'gender', 'nationality',
            'email', 'phone', 'address', 'bankName', 'accountNumber',
            'department', 'position', 'hireDate'
        ];

        let completedFields = 0;
        fields.forEach(field => {
            if (profileData.personalInfo?.[field] ||
                profileData.contactInfo?.[field] ||
                profileData.bankingInfo?.[field] ||
                profileData.workInfo?.[field]) {
                completedFields++;
            }
        });

        return Math.round((completedFields / fields.length) * 100);
    }

    // Leave Management
    async createLeaveRequest(requestData: Omit<LeaveRequestData, 'id' | 'submittedDate'>): Promise<LeaveRequestData> {
        try {
            const docRef = await addDoc(collection(this.db, 'leaveRequests'), {
                ...requestData,
                startDate: Timestamp.fromDate(requestData.startDate),
                endDate: Timestamp.fromDate(requestData.endDate),
                submittedDate: Timestamp.now()
            });

            // Update leave balance (move from remaining to pending)
            await this.updateLeaveBalance(requestData.employeeId, requestData.leaveTypeId, requestData.totalDays, 'subtract');

            // Create notification for HR
            await this.createNotification({
                employeeId: 'hr-system',
                type: 'warning',
                title: 'New Leave Request',
                message: `${requestData.employeeName} has submitted a ${requestData.leaveTypeName} request for ${requestData.totalDays} days`,
                actionUrl: `/hr/core-hr/leave-management`,
                actionText: 'Review Request',
                read: false,
                priority: 'high',
                metadata: { requestId: docRef.id, employeeId: requestData.employeeId }
            });

            // Create notification for employee
            await this.createNotification({
                employeeId: requestData.employeeId,
                type: 'success',
                title: 'Leave Request Submitted',
                message: `Your ${requestData.leaveTypeName} request has been submitted and is pending approval`,
                actionUrl: `/employee/leave`,
                actionText: 'View Request',
                read: false,
                priority: 'medium'
            });

            const newDoc = await getDoc(docRef);
            const data = newDoc.data()!;
            return {
                id: docRef.id,
                ...data,
                startDate: data.startDate?.toDate() || new Date(),
                endDate: data.endDate?.toDate() || new Date(),
                submittedDate: data.submittedDate?.toDate() || new Date()
            } as LeaveRequestData;
        } catch (error) {
            console.error('Error creating leave request:', error);
            throw error;
        }
    }

    async approveLeaveRequest(requestId: string, approverId: string, comments?: string): Promise<void> {
        try {
            const docRef = doc(this.db, 'leaveRequests', requestId);
            const requestDoc = await getDoc(docRef);

            if (!requestDoc.exists()) {
                throw new Error('Leave request not found');
            }

            const requestData = requestDoc.data() as LeaveRequestData;

            // Update request status
            await updateDoc(docRef, {
                status: 'Approved',
                approver: approverId,
                approvedDate: Timestamp.now(),
                comments: comments || ''
            });

            // Update leave balance (move from pending to used)
            await this.updateLeaveBalance(requestData.employeeId, requestData.leaveTypeId, requestData.totalDays, 'add');

            // Create notification for employee
            await this.createNotification({
                employeeId: requestData.employeeId,
                type: 'success',
                title: 'Leave Request Approved',
                message: `Your ${requestData.leaveTypeName} request for ${requestData.totalDays} days has been approved`,
                actionUrl: `/employee/leave`,
                actionText: 'View Details',
                read: false,
                priority: 'medium'
            });

            // Log activity
            await this.logActivity({
                employeeId: requestData.employeeId,
                action: 'leave_approved',
                entityType: 'leave_request',
                entityId: requestId,
                newValues: { status: 'Approved', approver: approverId },
                ipAddress: '192.168.1.100',
                userAgent: navigator.userAgent
            });
        } catch (error) {
            console.error('Error approving leave request:', error);
            throw error;
        }
    }

    async rejectLeaveRequest(requestId: string, approverId: string, reason: string): Promise<void> {
        try {
            const docRef = doc(this.db, 'leaveRequests', requestId);
            const requestDoc = await getDoc(docRef);

            if (!requestDoc.exists()) {
                throw new Error('Leave request not found');
            }

            const requestData = requestDoc.data() as LeaveRequestData;

            // Update request status
            await updateDoc(docRef, {
                status: 'Rejected',
                approver: approverId,
                approvedDate: Timestamp.now(),
                rejectionReason: reason
            });

            // Return leave balance (move from pending back to remaining)
            await this.updateLeaveBalance(requestData.employeeId, requestData.leaveTypeId, requestData.totalDays, 'add');

            // Create notification for employee
            await this.createNotification({
                employeeId: requestData.employeeId,
                type: 'error',
                title: 'Leave Request Rejected',
                message: `Your ${requestData.leaveTypeName} request has been rejected. Reason: ${reason}`,
                actionUrl: `/employee/leave`,
                actionText: 'View Details',
                read: false,
                priority: 'high'
            });
        } catch (error) {
            console.error('Error rejecting leave request:', error);
            throw error;
        }
    }

    async updateLeaveBalance(employeeId: string, leaveTypeId: string, days: number, action: 'add' | 'subtract'): Promise<void> {
        try {
            const batch = writeBatch(this.db);

            // Get current balance
            const balanceQuery = query(
                collection(this.db, 'leaveBalances'),
                where('employeeId', '==', employeeId),
                where('leaveTypeId', '==', leaveTypeId)
            );

            const balanceSnapshot = await getDocs(balanceQuery);

            if (!balanceSnapshot.empty) {
                const balanceDoc = balanceSnapshot.docs[0];
                const balanceData = balanceDoc.data();

                const updates = action === 'add'
                    ? {
                        remaining: increment(days),
                        pending: increment(-days),
                        used: increment(days)
                    }
                    : {
                        remaining: increment(-days),
                        pending: increment(days)
                    };

                batch.update(balanceDoc.ref, updates);
            }

            await batch.commit();
        } catch (error) {
            console.error('Error updating leave balance:', error);
            throw error;
        }
    }

    // Leave Type Management
    async createLeaveType(leaveTypeData: Omit<LeaveTypeData, 'id' | 'createdAt' | 'updatedAt'>): Promise<LeaveTypeData> {
        try {
            const docRef = await addDoc(collection(this.db, 'leaveTypes'), {
                ...leaveTypeData,
                isActive: true,
                createdAt: Timestamp.now(),
                updatedAt: Timestamp.now()
            });

            // Create notification for all employees about new leave type
            await this.createNotification({
                employeeId: 'all-employees',
                type: 'info',
                title: 'New Leave Type Available',
                message: `A new leave type "${leaveTypeData.name}" has been added to your available leave options`,
                actionUrl: `/employee/leave`,
                actionText: 'View Leave Types',
                read: false,
                priority: 'medium',
                metadata: { leaveTypeId: docRef.id, leaveTypeName: leaveTypeData.name }
            });

            const newDoc = await getDoc(docRef);
            const data = newDoc.data()!;
            return {
                id: docRef.id,
                ...data,
                createdAt: data.createdAt?.toDate() || new Date(),
                updatedAt: data.updatedAt?.toDate() || new Date()
            } as LeaveTypeData;
        } catch (error) {
            console.error('Error creating leave type:', error);
            throw error;
        }
    }

    async updateLeaveType(leaveTypeId: string, updates: Partial<LeaveTypeData>): Promise<void> {
        try {
            const docRef = doc(this.db, 'leaveTypes', leaveTypeId);
            await updateDoc(docRef, {
                ...updates,
                updatedAt: Timestamp.now()
            });
        } catch (error) {
            console.error('Error updating leave type:', error);
            throw error;
        }
    }

    async deactivateLeaveType(leaveTypeId: string): Promise<void> {
        try {
            await this.updateLeaveType(leaveTypeId, { isActive: false });
        } catch (error) {
            console.error('Error deactivating leave type:', error);
            throw error;
        }
    }

    // Policy Management
    async createPolicy(policyData: Omit<PolicyData, 'id' | 'createdAt' | 'updatedAt'>): Promise<PolicyData> {
        try {
            const docRef = await addDoc(collection(this.db, 'policies'), {
                ...policyData,
                effectiveDate: Timestamp.fromDate(policyData.effectiveDate),
                expiryDate: policyData.expiryDate ? Timestamp.fromDate(policyData.expiryDate) : null,
                createdAt: Timestamp.now(),
                updatedAt: Timestamp.now()
            });

            // Create acknowledgment requirement for applicable employees
            if (policyData.requiresAcknowledgment) {
                await this.createNotification({
                    employeeId: 'applicable-employees',
                    type: 'warning',
                    title: 'New Policy Requires Acknowledgment',
                    message: `Please review and acknowledge the new policy: "${policyData.title}"`,
                    actionUrl: `/employee/policies`,
                    actionText: 'Review Policy',
                    read: false,
                    priority: 'high',
                    metadata: { policyId: docRef.id, policyTitle: policyData.title }
                });
            }

            const newDoc = await getDoc(docRef);
            const data = newDoc.data()!;
            return {
                id: docRef.id,
                ...data,
                effectiveDate: data.effectiveDate?.toDate() || new Date(),
                expiryDate: data.expiryDate?.toDate(),
                createdAt: data.createdAt?.toDate() || new Date(),
                updatedAt: data.updatedAt?.toDate() || new Date()
            } as PolicyData;
        } catch (error) {
            console.error('Error creating policy:', error);
            throw error;
        }
    }

    async acknowledgePolicy(employeeId: string, policyId: string, signature: string): Promise<PolicyAcknowledgmentData> {
        try {
            const docRef = await addDoc(collection(this.db, 'policyAcknowledgments'), {
                employeeId,
                policyId,
                acknowledgedAt: Timestamp.now(),
                ipAddress: '192.168.1.100', // In real app, get actual IP
                userAgent: navigator.userAgent,
                signature,
                isAcknowledged: true
            });

            // Get policy details for notification
            const policyDoc = await getDoc(doc(this.db, 'policies', policyId));
            const policyData = policyDoc.data();

            // Create notification for HR
            await this.createNotification({
                employeeId: 'hr-system',
                type: 'success',
                title: 'Policy Acknowledged',
                message: `Employee has acknowledged policy: "${policyData?.title || 'Unknown Policy'}"`,
                actionUrl: `/hr/core-hr/policy-management`,
                actionText: 'View Acknowledgment',
                read: false,
                priority: 'medium',
                metadata: { employeeId, policyId }
            });

            const newDoc = await getDoc(docRef);
            const data = newDoc.data()!;
            return {
                id: docRef.id,
                ...data,
                acknowledgedAt: data.acknowledgedAt?.toDate() || new Date()
            } as PolicyAcknowledgmentData;
        } catch (error) {
            console.error('Error acknowledging policy:', error);
            throw error;
        }
    }

    async getPendingPolicies(employeeId: string): Promise<PolicyData[]> {
        try {
            // Get all active policies that require acknowledgment
            const policiesQuery = query(
                collection(this.db, 'policies'),
                where('requiresAcknowledgment', '==', true),
                where('isActive', '==', true)
            );

            const policiesSnapshot = await getDocs(policiesQuery);
            const policies = policiesSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                effectiveDate: doc.data().effectiveDate?.toDate() || new Date(),
                expiryDate: doc.data().expiryDate?.toDate(),
                createdAt: doc.data().createdAt?.toDate() || new Date(),
                updatedAt: doc.data().updatedAt?.toDate() || new Date()
            })) as PolicyData[];

            // Get acknowledged policies for this employee
            const acknowledgmentsQuery = query(
                collection(this.db, 'policyAcknowledgments'),
                where('employeeId', '==', employeeId)
            );

            const acknowledgmentsSnapshot = await getDocs(acknowledgmentsQuery);
            const acknowledgedPolicyIds = acknowledgmentsSnapshot.docs.map(doc => doc.data().policyId);

            // Return only unacknowledged policies
            return policies.filter(policy => !acknowledgedPolicyIds.includes(policy.id));
        } catch (error) {
            console.error('Error getting pending policies:', error);
            throw error;
        }
    }

    // Performance Management
    async scheduleMeeting(meetingData: Omit<PerformanceMeetingData, 'id' | 'createdAt' | 'updatedAt'>): Promise<PerformanceMeetingData> {
        try {
            const docRef = await addDoc(collection(this.db, 'performanceMeetings'), {
                ...meetingData,
                scheduledDate: Timestamp.fromDate(meetingData.scheduledDate),
                createdAt: Timestamp.now(),
                updatedAt: Timestamp.now()
            });

            // Create notification for employee
            await this.createNotification({
                employeeId: meetingData.employeeId,
                type: 'info',
                title: 'Meeting Scheduled',
                message: `A ${meetingData.meetingType.replace('_', ' ')} meeting has been scheduled for ${meetingData.scheduledDate.toLocaleDateString()}`,
                actionUrl: `/employee/performance`,
                actionText: 'View Meeting',
                read: false,
                priority: 'medium',
                metadata: { meetingId: docRef.id, meetingType: meetingData.meetingType }
            });

            const newDoc = await getDoc(docRef);
            const data = newDoc.data()!;
            return {
                id: docRef.id,
                ...data,
                scheduledDate: data.scheduledDate?.toDate() || new Date(),
                createdAt: data.createdAt?.toDate() || new Date(),
                updatedAt: data.updatedAt?.toDate() || new Date()
            } as PerformanceMeetingData;
        } catch (error) {
            console.error('Error scheduling meeting:', error);
            throw error;
        }
    }

    async confirmMeeting(meetingId: string, employeeId: string): Promise<void> {
        try {
            const docRef = doc(this.db, 'performanceMeetings', meetingId);
            await updateDoc(docRef, {
                status: 'confirmed',
                updatedAt: Timestamp.now()
            });

            // Create notification for manager
            await this.createNotification({
                employeeId: 'hr-system', // Manager notifications go to HR system
                type: 'success',
                title: 'Meeting Confirmed',
                message: `Employee has confirmed the scheduled meeting`,
                actionUrl: `/hr/core-hr/performance-management`,
                actionText: 'View Meeting',
                read: false,
                priority: 'medium',
                metadata: { meetingId, employeeId }
            });
        } catch (error) {
            console.error('Error confirming meeting:', error);
            throw error;
        }
    }

    async updateMeetingStatus(meetingId: string, status: PerformanceMeetingData['status'], notes?: string): Promise<void> {
        try {
            const docRef = doc(this.db, 'performanceMeetings', meetingId);
            await updateDoc(docRef, {
                status,
                notes: notes || '',
                updatedAt: Timestamp.now()
            });
        } catch (error) {
            console.error('Error updating meeting status:', error);
            throw error;
        }
    }

    // Notifications
    async createNotification(notificationData: Omit<NotificationData, 'id' | 'createdAt'>): Promise<NotificationData> {
        try {
            const docRef = await addDoc(collection(this.db, 'notifications'), {
                ...notificationData,
                createdAt: Timestamp.now()
            });

            const newDoc = await getDoc(docRef);
            const data = newDoc.data()!;
            return {
                id: docRef.id,
                ...data,
                createdAt: data.createdAt?.toDate() || new Date()
            } as NotificationData;
        } catch (error) {
            console.error('Error creating notification:', error);
            throw error;
        }
    }

    async markNotificationAsRead(notificationId: string): Promise<void> {
        try {
            const docRef = doc(this.db, 'notifications', notificationId);
            await updateDoc(docRef, {
                read: true
            });
        } catch (error) {
            console.error('Error marking notification as read:', error);
            throw error;
        }
    }

    async getUnreadNotifications(employeeId: string): Promise<NotificationData[]> {
        try {
            const q = query(
                collection(this.db, 'notifications'),
                where('employeeId', '==', employeeId),
                where('read', '==', false),
                orderBy('createdAt', 'desc')
            );

            const querySnapshot = await getDocs(q);
            return querySnapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    id: doc.id,
                    ...data,
                    createdAt: data.createdAt?.toDate() || new Date()
                } as NotificationData;
            });
        } catch (error) {
            console.error('Error getting unread notifications:', error);
            throw error;
        }
    }

    // Activity Logging
    async logActivity(activityData: Omit<ActivityLogData, 'id' | 'timestamp'>): Promise<void> {
        try {
            await addDoc(collection(this.db, 'activityLogs'), {
                ...activityData,
                timestamp: Timestamp.now()
            });
        } catch (error) {
            console.error('Error logging activity:', error);
            // Don't throw here - activity logging shouldn't break the main flow
        }
    }

    // Real-time subscriptions
    subscribeToEmployeeUpdates(employeeId: string, callback: (profile: EmployeeProfileData) => void): () => void {
        const docRef = doc(this.db, 'employeeProfiles', employeeId);

        return onSnapshot(docRef, (doc) => {
            if (doc.exists()) {
                const data = doc.data();
                callback({
                    ...data,
                    personalInfo: {
                        ...data.personalInfo,
                        dateOfBirth: data.personalInfo?.dateOfBirth?.toDate() || new Date()
                    },
                    workInfo: {
                        ...data.workInfo,
                        hireDate: data.workInfo?.hireDate?.toDate() || new Date()
                    },
                    lastUpdated: data.lastUpdated?.toDate() || new Date(),
                    createdAt: data.createdAt?.toDate() || new Date(),
                    updatedAt: data.updatedAt?.toDate() || new Date()
                } as EmployeeProfileData);
            }
        });
    }

    subscribeToLeaveRequests(employeeId: string, callback: (requests: LeaveRequestData[]) => void): () => void {
        const q = query(
            collection(this.db, 'leaveRequests'),
            where('employeeId', '==', employeeId),
            orderBy('submittedDate', 'desc')
        );

        return onSnapshot(q, (querySnapshot) => {
            const requests = querySnapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    id: doc.id,
                    ...data,
                    startDate: data.startDate?.toDate() || new Date(),
                    endDate: data.endDate?.toDate() || new Date(),
                    submittedDate: data.submittedDate?.toDate() || new Date(),
                    approvedDate: data.approvedDate?.toDate()
                } as LeaveRequestData;
            });
            callback(requests);
        });
    }

    subscribeToNotifications(employeeId: string, callback: (notifications: NotificationData[]) => void): () => void {
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
                } as NotificationData;
            });
            callback(notifications);
        });
    }

    subscribeToPolicies(callback: (policies: PolicyData[]) => void): () => void {
        const q = query(
            collection(this.db, 'policies'),
            where('isActive', '==', true),
            orderBy('createdAt', 'desc')
        );

        return onSnapshot(q, (querySnapshot) => {
            const policies = querySnapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    id: doc.id,
                    ...data,
                    effectiveDate: data.effectiveDate?.toDate() || new Date(),
                    expiryDate: data.expiryDate?.toDate(),
                    createdAt: data.createdAt?.toDate() || new Date(),
                    updatedAt: data.updatedAt?.toDate() || new Date()
                } as PolicyData;
            });
            callback(policies);
        });
    }
}

// Mock implementation for development/testing
export class MockDataFlowService implements IDataFlowService {
    private static instance: MockDataFlowService;
    private notifications: Map<string, NotificationData[]> = new Map();
    private notificationCallbacks: Map<string, (notifications: NotificationData[]) => void> = new Map();

    // Singleton pattern to maintain state across re-renders
    public static getInstance(): MockDataFlowService {
        if (!MockDataFlowService.instance) {
            MockDataFlowService.instance = new MockDataFlowService();
        }
        return MockDataFlowService.instance;
    }

    private constructor() {
        // Private constructor for singleton
    }
    async updateEmployeeProfile(employeeId: string, profileData: Partial<EmployeeProfileData>): Promise<EmployeeProfileData> {
        console.log('Mock: updateEmployeeProfile', employeeId, profileData);

        // Get current profile and merge with updates
        const currentProfile = await this.getEmployeeProfile(employeeId);
        if (!currentProfile) {
            throw new Error('Profile not found');
        }

        // Merge the updates
        const updatedProfile: EmployeeProfileData = {
            ...currentProfile,
            ...profileData,
            updatedAt: new Date(),
            completeness: this.calculateProfileCompleteness({ ...currentProfile, ...profileData })
        };

        console.log('Mock: Profile updated with completeness:', updatedProfile.completeness);
        return updatedProfile;
    }

    async getEmployeeProfile(employeeId: string): Promise<EmployeeProfileData | null> {
        console.log('Mock: getEmployeeProfile', employeeId);

        // Return sample profile data
        const sampleProfile: EmployeeProfileData = {
            id: employeeId,
            employeeId: employeeId,
            personalInfo: {
                firstName: 'John',
                lastName: 'Doe',
                middleName: 'Michael',
                dateOfBirth: new Date('1990-05-15'),
                gender: 'male',
                maritalStatus: 'single',
                nationality: 'American',
                ssn: '123-45-6789',
                passportNumber: 'A1234567',
                emergencyContact: {
                    name: 'Jane Doe',
                    relationship: 'Sister',
                    phone: '+1-555-0123',
                    email: 'jane.doe@email.com'
                }
            },
            contactInfo: {
                personalEmail: 'john.doe@personal.com',
                phone: '+1-555-0123',
                address: {
                    street: '123 Main Street',
                    city: 'New York',
                    state: 'NY',
                    zipCode: '10001',
                    country: 'USA'
                },
                emergencyContacts: [
                    {
                        name: 'Jane Doe',
                        relationship: 'Sister',
                        phone: '+1-555-0123',
                        email: 'jane.doe@email.com',
                        isPrimary: true
                    }
                ]
            },
            bankingInfo: {
                bankName: 'First National Bank',
                accountNumber: '1234567890',
                routingNumber: '021000021',
                accountType: 'checking',
                salaryPaymentMethod: 'direct_deposit'
            },
            skills: [
                { name: 'JavaScript', level: 'expert', category: 'Programming' },
                { name: 'React', level: 'advanced', category: 'Framework' },
                { name: 'TypeScript', level: 'intermediate', category: 'Programming' }
            ],
            certifications: [
                { name: 'AWS Certified Developer', issuer: 'Amazon', dateObtained: new Date('2023-01-15'), expiryDate: new Date('2026-01-15') },
                { name: 'React Developer Certification', issuer: 'Meta', dateObtained: new Date('2022-08-20'), expiryDate: null }
            ],
            familyInfo: {
                spouse: null,
                children: [],
                beneficiaries: [
                    { name: 'Jane Doe', relationship: 'Sister', percentage: 100 }
                ]
            },
            completeness: 75,
            createdAt: new Date(),
            updatedAt: new Date()
        };

        return sampleProfile;
    }

    calculateProfileCompleteness(profileData: Partial<EmployeeProfileData>): number {
        return 85; // Mock completeness
    }

    async createLeaveRequest(requestData: Omit<LeaveRequestData, 'id' | 'submittedDate'>): Promise<LeaveRequestData> {
        console.log('Mock: createLeaveRequest', requestData);
        return {} as LeaveRequestData;
    }

    async approveLeaveRequest(requestId: string, approverId: string, comments?: string): Promise<void> {
        console.log('Mock: approveLeaveRequest', requestId, approverId, comments);
    }

    async rejectLeaveRequest(requestId: string, approverId: string, reason: string): Promise<void> {
        console.log('Mock: rejectLeaveRequest', requestId, approverId, reason);
    }

    async updateLeaveBalance(employeeId: string, leaveTypeId: string, days: number, action: 'add' | 'subtract'): Promise<void> {
        console.log('Mock: updateLeaveBalance', employeeId, leaveTypeId, days, action);
    }

    async createLeaveType(leaveTypeData: Omit<LeaveTypeData, 'id' | 'createdAt' | 'updatedAt'>): Promise<LeaveTypeData> {
        console.log('Mock: createLeaveType', leaveTypeData);
        return {} as LeaveTypeData;
    }

    async updateLeaveType(leaveTypeId: string, updates: Partial<LeaveTypeData>): Promise<void> {
        console.log('Mock: updateLeaveType', leaveTypeId, updates);
    }

    async deactivateLeaveType(leaveTypeId: string): Promise<void> {
        console.log('Mock: deactivateLeaveType', leaveTypeId);
    }

    async createPolicy(policyData: Omit<PolicyData, 'id' | 'createdAt' | 'updatedAt'>): Promise<PolicyData> {
        console.log('Mock: createPolicy', policyData);
        return {} as PolicyData;
    }

    async acknowledgePolicy(employeeId: string, policyId: string, signature: string): Promise<PolicyAcknowledgmentData> {
        console.log('Mock: acknowledgePolicy', employeeId, policyId, signature);
        return {} as PolicyAcknowledgmentData;
    }

    async getPendingPolicies(employeeId: string): Promise<PolicyData[]> {
        console.log('Mock: getPendingPolicies', employeeId);
        return [];
    }

    async scheduleMeeting(meetingData: Omit<PerformanceMeetingData, 'id' | 'createdAt' | 'updatedAt'>): Promise<PerformanceMeetingData> {
        console.log('Mock: scheduleMeeting', meetingData);
        return {} as PerformanceMeetingData;
    }

    async confirmMeeting(meetingId: string, employeeId: string): Promise<void> {
        console.log('Mock: confirmMeeting', meetingId, employeeId);
    }

    async updateMeetingStatus(meetingId: string, status: PerformanceMeetingData['status'], notes?: string): Promise<void> {
        console.log('Mock: updateMeetingStatus', meetingId, status, notes);
    }

    async createNotification(notificationData: Omit<NotificationData, 'id' | 'createdAt'>): Promise<NotificationData> {
        console.log('Mock: createNotification', notificationData);
        return {} as NotificationData;
    }

    async markNotificationAsRead(notificationId: string): Promise<void> {
        console.log('Mock: markNotificationAsRead', notificationId);
        console.log('Mock: Total employees with notifications:', this.notifications.size);

        // Find and update the notification in all employee notification lists
        for (const [employeeId, notifications] of this.notifications.entries()) {
            console.log('Mock: Checking employee', employeeId, 'with', notifications.length, 'notifications');
            const notification = notifications.find(n => n.id === notificationId);
            console.log('Mock: Found notification?', !!notification, 'for ID', notificationId);
            if (notification) {
                notification.read = true;
                notification.updatedAt = new Date();
                console.log('Mock: Updated notification as read', notificationId, 'for employee', employeeId);

                // Trigger callback to update UI
                const callback = this.notificationCallbacks.get(employeeId);
                console.log('Mock: Looking for callback for employee', employeeId, 'Found:', !!callback, 'Total callbacks:', this.notificationCallbacks.size);
                if (callback) {
                    console.log('Mock: Triggering callback for employee', employeeId, 'with', notifications.length, 'notifications');
                    setTimeout(() => {
                        callback([...notifications]);
                    }, 10);
                } else {
                    console.log('Mock: No callback found for employee', employeeId);
                }
                break;
            }
        }
    }

    async getUnreadNotifications(employeeId: string): Promise<NotificationData[]> {
        console.log('Mock: getUnreadNotifications', employeeId);
        return [];
    }

    async logActivity(activityData: Omit<ActivityLogData, 'id' | 'timestamp'>): Promise<void> {
        console.log('Mock: logActivity', activityData);
    }

    subscribeToEmployeeUpdates(employeeId: string, callback: (profile: EmployeeProfileData) => void): () => void {
        console.log('Mock: subscribeToEmployeeUpdates', employeeId);

        // Get and return profile data immediately
        setTimeout(async () => {
            try {
                const profile = await this.getEmployeeProfile(employeeId);
                if (profile) {
                    console.log('Mock: Sending profile data to callback', profile);
                    callback(profile);
                }
            } catch (error) {
                console.error('Mock: Error getting profile for subscription:', error);
            }
        }, 100);

        return () => { };
    }

    subscribeToLeaveRequests(employeeId: string, callback: (requests: LeaveRequestData[]) => void): () => void {
        console.log('Mock: subscribeToLeaveRequests', employeeId);
        return () => { };
    }

    subscribeToNotifications(employeeId: string, callback: (notifications: NotificationData[]) => void): () => void {
        console.log('Mock: subscribeToNotifications', employeeId);

        // Initialize sample notifications if not already done
        if (!this.notifications.has(employeeId)) {
            const sampleNotifications: NotificationData[] = [
                {
                    id: 'notif-1',
                    employeeId: employeeId,
                    title: 'Welcome to the new HRIS system!',
                    message: 'Your profile has been successfully created. Please complete your profile information.',
                    type: 'info',
                    priority: 'medium',
                    read: false,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    metadata: { source: 'system' }
                },
                {
                    id: 'notif-2',
                    employeeId: employeeId,
                    title: 'Leave Request Approved',
                    message: 'Your annual leave request for Dec 25-30 has been approved.',
                    type: 'success',
                    priority: 'high',
                    read: false,
                    createdAt: new Date(Date.now() - 3600000), // 1 hour ago
                    updatedAt: new Date(Date.now() - 3600000),
                    metadata: { source: 'hr', leaveRequestId: 'leave-123' }
                },
                {
                    id: 'notif-3',
                    employeeId: employeeId,
                    title: 'Policy Update Required',
                    message: 'Please review and acknowledge the updated Employee Handbook.',
                    type: 'warning',
                    priority: 'medium',
                    read: true,
                    createdAt: new Date(Date.now() - 86400000), // 1 day ago
                    updatedAt: new Date(Date.now() - 86400000),
                    metadata: { source: 'hr', policyId: 'policy-456' }
                }
            ];
            this.notifications.set(employeeId, sampleNotifications);
        }

        // Store the callback for future updates
        this.notificationCallbacks.set(employeeId, callback);
        console.log('Mock: Stored callback for employee', employeeId, 'Total callbacks:', this.notificationCallbacks.size);

        // Call the callback immediately with stored data
        setTimeout(() => {
            const employeeNotifications = this.notifications.get(employeeId) || [];
            callback([...employeeNotifications]); // Return a copy to avoid mutations
        }, 100);

        return () => {
            this.notificationCallbacks.delete(employeeId);
        };
    }

    subscribeToPolicies(callback: (policies: PolicyData[]) => void): () => void {
        console.log('Mock: subscribeToPolicies');
        return () => { };
    }
}

// Service factory
export class DataFlowServiceFactory {
    static async createService(): Promise<IDataFlowService> {
        try {
            const serviceConfig = await getServiceConfig();

            // Always use Mock for testing - ignore Firebase even if available
            console.log('Using Mock Data Flow Service');
            return MockDataFlowService.getInstance();
        } catch (error) {
            console.error('Error creating data flow service:', error);
            console.log('Falling back to Mock Data Flow Service');
            return MockDataFlowService.getInstance();
        }
    }
}

// Export the main service getter
export const getDataFlowService = DataFlowServiceFactory.createService;

// Export types for use in components
export type {
    EmployeeProfileData,
    LeaveRequestData,
    LeaveBalanceData,
    LeaveTypeData,
    PolicyData,
    PolicyAcknowledgmentData,
    PerformanceMeetingData,
    NotificationData,
    ActivityLogData,
    IDataFlowService
};
