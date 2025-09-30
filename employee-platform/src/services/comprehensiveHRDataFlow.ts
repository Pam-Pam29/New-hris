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
    limit,
    onSnapshot,
    Timestamp,
    writeBatch,
    serverTimestamp,
    increment,
    arrayUnion,
    arrayRemove
} from 'firebase/firestore';
import { db } from '../config/firebase';

// ===== COMPREHENSIVE INTERFACES =====

export interface ComprehensiveEmployeeProfile {
    id: string;
    employeeId: string;
    personalInfo: {
        firstName: string;
        lastName: string;
        middleName?: string;
        dateOfBirth: Date;
        gender: string;
        maritalStatus: string;
        nationality: string;
        ssn?: string;
        passportNumber?: string;
        profilePhoto?: string;
    };
    contactInfo: {
        personalEmail: string;
        workEmail: string;
        personalPhone: string;
        workPhone?: string;
        address: {
            street: string;
            city: string;
            state: string;
            zipCode: string;
            country: string;
        };
        emergencyContacts: Array<{
            id: string;
            name: string;
            relationship: string;
            phone: string;
            email?: string;
            isPrimary: boolean;
            address?: string;
        }>;
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
    workInfo: {
        position: string;
        department: string;
        managerId?: string;
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
    skills: Array<{
        id: string;
        name: string;
        level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
        category: string;
        certified: boolean;
        certificationDate?: Date;
        expiryDate?: Date;
        certifyingBody?: string;
    }>;
    certifications: Array<{
        id: string;
        name: string;
        issuer: string;
        dateObtained: Date;
        expiryDate?: Date;
        credentialId?: string;
        verificationUrl?: string;
    }>;
    familyInfo: {
        spouse?: {
            name: string;
            occupation: string;
            employer?: string;
            phone?: string;
            email?: string;
        };
        dependents: Array<{
            id: string;
            name: string;
            relationship: string;
            dateOfBirth: Date;
            ssn?: string;
            isDependent: boolean;
        }>;
        beneficiaries: Array<{
            id: string;
            name: string;
            relationship: string;
            percentage: number;
            contactInfo: string;
            address?: string;
        }>;
    };
    documents: Array<{
        id: string;
        type: string;
        name: string;
        url: string;
        uploadDate: Date;
        expiryDate?: Date;
        verified: boolean;
    }>;
    profileStatus: {
        completeness: number;
        lastUpdated: Date;
        updatedBy: string;
        status: 'draft' | 'pending_review' | 'approved' | 'needs_update';
        reviewNotes?: string;
    };
    createdAt: Date;
    updatedAt: Date;
}

export interface LeaveType {
    id: string;
    name: string;
    description: string;
    maxDaysPerYear: number;
    color: string;
    isActive: boolean;
    requiresApproval: boolean;
    requiresDocumentation: boolean;
    carryOverRules: {
        enabled: boolean;
        maxCarryOverDays: number;
        expiryMonths: number;
    };
    accrualRules: {
        enabled: boolean;
        accrualRate: number; // days per month
        maxAccrualDays: number;
        startAccrualAfterMonths: number;
    };
    applicableRoles: string[];
    applicableDepartments: string[];
    createdBy: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface LeaveRequest {
    id: string;
    employeeId: string;
    employeeName: string;
    employeeDepartment: string;
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
    reviewerName?: string;
    comments?: string;
    rejectionReason?: string;
    attachments?: Array<{
        id: string;
        name: string;
        url: string;
        type: string;
    }>;
    urgencyLevel: 'low' | 'medium' | 'high';
    businessImpact?: string;
    coverageArrangements?: string;
}

export interface LeaveBalance {
    id: string;
    employeeId: string;
    leaveTypeId: string;
    leaveTypeName: string;
    year: number;
    totalEntitlement: number;
    usedDays: number;
    pendingDays: number;
    remainingDays: number;
    carryOverDays: number;
    accruedDays: number;
    expiryDate?: Date;
    lastUpdated: Date;
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
    applicableRoles: string[];
    applicableDepartments: string[];
    tags: string[];
    attachments?: Array<{
        id: string;
        name: string;
        url: string;
        type: string;
    }>;
    createdBy: string;
    createdAt: Date;
    lastModified: Date;
    acknowledgmentDeadline?: Date;
    complianceRequired: boolean;
}

export interface PolicyAcknowledgment {
    id: string;
    policyId: string;
    policyTitle: string;
    policyVersion: string;
    employeeId: string;
    employeeName: string;
    acknowledgedAt: Date;
    ipAddress: string;
    userAgent: string;
    deviceInfo: string;
    digitalSignature: string;
    isCompliant: boolean;
    notes?: string;
}

export interface PerformanceGoal {
    id: string;
    employeeId: string;
    employeeName: string;
    managerId: string;
    managerName: string;
    title: string;
    description: string;
    category: 'individual' | 'team' | 'company';
    targetValue: number;
    currentValue: number;
    unit: string;
    startDate: Date;
    endDate: Date;
    status: 'not_started' | 'in_progress' | 'completed' | 'overdue' | 'cancelled';
    priority: 'low' | 'medium' | 'high' | 'critical';
    milestones: Array<{
        id: string;
        title: string;
        description: string;
        targetDate: Date;
        completed: boolean;
        completedDate?: Date;
    }>;
    kpis: Array<{
        id: string;
        name: string;
        target: number;
        current: number;
        unit: string;
    }>;
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
    reviewType: 'annual' | 'quarterly' | 'monthly' | 'probation' | 'project';
    reviewPeriod: string;
    overallRating: number;
    competencyRatings: Array<{
        competency: string;
        rating: number;
        comments: string;
    }>;
    strengths: string[];
    areasForImprovement: string[];
    developmentGoals: string[];
    careerAspirations: string;
    managerComments: string;
    employeeComments?: string;
    status: 'draft' | 'submitted' | 'reviewed' | 'approved' | 'completed';
    createdAt: Date;
    submittedAt?: Date;
    reviewedAt?: Date;
    approvedAt?: Date;
    nextReviewDate?: Date;
}

export interface MeetingSchedule {
    id: string;
    employeeId: string;
    employeeName: string;
    managerId: string;
    managerName: string;
    meetingType: 'performance_review' | 'one_on_one' | 'career_development' | 'goal_setting' | 'disciplinary' | 'training';
    title: string;
    description: string;
    scheduledDate: Date;
    duration: number; // minutes
    location: string;
    isVirtual: boolean;
    meetingLink?: string;
    agenda: string;
    status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'rescheduled';
    attendees: Array<{
        id: string;
        name: string;
        email: string;
        role: string;
        confirmed: boolean;
    }>;
    notes?: string;
    actionItems?: Array<{
        id: string;
        description: string;
        assignedTo: string;
        dueDate: Date;
        completed: boolean;
    }>;
    createdBy: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface TimeEntry {
    id: string;
    employeeId: string;
    employeeName: string;
    date: Date;
    clockInTime?: Date;
    clockOutTime?: Date;
    totalHours: number;
    breakTime: number;
    overtimeHours: number;
    location: {
        latitude: number;
        longitude: number;
        address: string;
        accuracy: number;
    };
    photos: Array<{
        id: string;
        url: string;
        timestamp: Date;
        type: 'clock_in' | 'clock_out' | 'break';
    }>;
    status: 'active' | 'completed' | 'pending_adjustment';
    adjustmentRequests?: Array<{
        id: string;
        requestedTime: Date;
        reason: string;
        status: 'pending' | 'approved' | 'rejected';
        requestedAt: Date;
        reviewedBy?: string;
        reviewedAt?: Date;
    }>;
    notes?: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface Asset {
    id: string;
    assetTag: string;
    name: string;
    category: 'laptop' | 'monitor' | 'phone' | 'furniture' | 'vehicle' | 'equipment' | 'software';
    brand: string;
    model: string;
    serialNumber: string;
    specifications: Record<string, any>;
    purchaseInfo: {
        vendor: string;
        purchaseDate: Date;
        purchasePrice: number;
        warrantyExpiry?: Date;
        invoiceNumber: string;
    };
    condition: 'new' | 'good' | 'fair' | 'poor' | 'damaged';
    status: 'available' | 'assigned' | 'maintenance' | 'retired' | 'lost';
    location: string;
    qrCode: string;
    photos: Array<{
        id: string;
        url: string;
        description: string;
        timestamp: Date;
    }>;
    maintenanceSchedule?: {
        frequency: 'monthly' | 'quarterly' | 'annually';
        lastMaintenance?: Date;
        nextMaintenance?: Date;
        maintenanceNotes?: string;
    };
    createdAt: Date;
    updatedAt: Date;
}

export interface AssetAssignment {
    id: string;
    assetId: string;
    assetName: string;
    employeeId: string;
    employeeName: string;
    assignedDate: Date;
    returnDate?: Date;
    assignmentReason: string;
    condition: {
        atAssignment: string;
        atReturn?: string;
        damageNotes?: string;
    };
    photos: {
        assignment: Array<{
            id: string;
            url: string;
            description: string;
        }>;
        return?: Array<{
            id: string;
            url: string;
            description: string;
        }>;
    };
    terms: string;
    digitalSignature: string;
    status: 'active' | 'returned' | 'lost' | 'damaged';
    returnProcess?: {
        initiatedBy: string;
        initiatedAt: Date;
        returnReason: string;
        conditionAssessment: string;
        refurbishmentRequired: boolean;
        financialImpact?: number;
    };
    createdAt: Date;
    updatedAt: Date;
}

export interface AssetRequest {
    id: string;
    employeeId: string;
    employeeName: string;
    requestType: 'new' | 'replacement' | 'upgrade' | 'additional';
    assetCategory: string;
    requestedItem: string;
    businessJustification: string;
    urgencyLevel: 'low' | 'medium' | 'high' | 'critical';
    estimatedCost?: number;
    preferredSpecs?: Record<string, any>;
    supportingDocuments?: Array<{
        id: string;
        name: string;
        url: string;
        type: string;
    }>;
    status: 'pending' | 'approved' | 'rejected' | 'fulfilled' | 'cancelled';
    reviewedBy?: string;
    reviewedAt?: Date;
    reviewComments?: string;
    approvalWorkflow: Array<{
        step: number;
        approver: string;
        status: 'pending' | 'approved' | 'rejected';
        timestamp?: Date;
        comments?: string;
    }>;
    createdAt: Date;
    updatedAt: Date;
}

export interface SmartNotification {
    id: string;
    employeeId: string;
    title: string;
    message: string;
    type: 'info' | 'warning' | 'success' | 'error' | 'urgent';
    category: 'leave' | 'policy' | 'performance' | 'profile' | 'asset' | 'time' | 'general';
    priority: 'low' | 'medium' | 'high' | 'urgent';
    isRead: boolean;
    actionRequired: boolean;
    actionUrl?: string;
    actionText?: string;
    actionButtons?: Array<{
        id: string;
        text: string;
        action: string;
        style: 'primary' | 'secondary' | 'danger';
    }>;
    metadata: Record<string, any>;
    expiryDate?: Date;
    createdAt: Date;
    readAt?: Date;
    actedAt?: Date;
}

export interface ActivityLog {
    id: string;
    employeeId: string;
    action: string;
    entityType: string;
    entityId: string;
    description: string;
    oldValues?: Record<string, any>;
    newValues?: Record<string, any>;
    ipAddress: string;
    userAgent: string;
    deviceInfo: string;
    location?: {
        latitude: number;
        longitude: number;
        address: string;
    };
    timestamp: Date;
    sessionId: string;
}

// ===== COMPREHENSIVE DATA FLOW SERVICE INTERFACE =====

export interface IComprehensiveHRDataFlowService {
    // Employee Profile Management
    getEmployeeProfile(employeeId: string): Promise<ComprehensiveEmployeeProfile | null>;
    updateEmployeeProfile(employeeId: string, profileData: Partial<ComprehensiveEmployeeProfile>): Promise<ComprehensiveEmployeeProfile>;
    calculateProfileCompleteness(profile: Partial<ComprehensiveEmployeeProfile>): number;
    subscribeToEmployeeUpdates(employeeId: string, callback: (profile: ComprehensiveEmployeeProfile) => void): () => void;

    // Leave Management - Types
    getLeaveTypes(): Promise<LeaveType[]>;
    createLeaveType(leaveType: Omit<LeaveType, 'id' | 'createdAt' | 'updatedAt'>): Promise<LeaveType>;
    updateLeaveType(id: string, updates: Partial<LeaveType>): Promise<void>;
    deactivateLeaveType(id: string): Promise<void>;
    subscribeToLeaveTypes(callback: (types: LeaveType[]) => void): () => void;

    // Leave Management - Requests
    getLeaveRequests(employeeId?: string): Promise<LeaveRequest[]>;
    createLeaveRequest(request: Omit<LeaveRequest, 'id' | 'submittedAt'>): Promise<LeaveRequest>;
    updateLeaveRequest(id: string, updates: Partial<LeaveRequest>): Promise<void>;
    approveLeaveRequest(id: string, reviewedBy: string, comments?: string): Promise<void>;
    rejectLeaveRequest(id: string, reviewedBy: string, reason: string): Promise<void>;
    subscribeToLeaveRequests(employeeId: string, callback: (requests: LeaveRequest[]) => void): () => void;

    // Leave Management - Balances
    getLeaveBalances(employeeId?: string): Promise<LeaveBalance[]>;
    updateLeaveBalance(employeeId: string, leaveTypeId: string, updates: Partial<LeaveBalance>): Promise<void>;
    initializeLeaveBalances(employeeId: string, year: number): Promise<void>;

    // Policy Management
    getPolicies(activeOnly?: boolean): Promise<Policy[]>;
    createPolicy(policy: Omit<Policy, 'id' | 'createdAt' | 'lastModified'>): Promise<Policy>;
    updatePolicy(id: string, updates: Partial<Policy>): Promise<void>;
    deactivatePolicy(id: string): Promise<void>;
    subscribeToPolicies(callback: (policies: Policy[]) => void): () => void;

    // Policy Acknowledgments
    getPolicyAcknowledgments(policyId?: string, employeeId?: string): Promise<PolicyAcknowledgment[]>;
    acknowledgePolicy(acknowledgment: Omit<PolicyAcknowledgment, 'id' | 'acknowledgedAt'>): Promise<PolicyAcknowledgment>;
    getPendingPolicies(employeeId: string): Promise<Policy[]>;

    // Performance Management - Goals
    getPerformanceGoals(employeeId?: string): Promise<PerformanceGoal[]>;
    createPerformanceGoal(goal: Omit<PerformanceGoal, 'id' | 'createdAt' | 'updatedAt'>): Promise<PerformanceGoal>;
    updatePerformanceGoal(id: string, updates: Partial<PerformanceGoal>): Promise<void>;
    deletePerformanceGoal(id: string): Promise<void>;
    subscribeToPerformanceGoals(employeeId: string, callback: (goals: PerformanceGoal[]) => void): () => void;

    // Performance Management - Reviews
    getPerformanceReviews(employeeId?: string): Promise<PerformanceReview[]>;
    createPerformanceReview(review: Omit<PerformanceReview, 'id' | 'createdAt'>): Promise<PerformanceReview>;
    updatePerformanceReview(id: string, updates: Partial<PerformanceReview>): Promise<void>;

    // Performance Management - Meetings
    getMeetingSchedules(employeeId?: string): Promise<MeetingSchedule[]>;
    createMeetingSchedule(meeting: Omit<MeetingSchedule, 'id' | 'createdAt' | 'updatedAt'>): Promise<MeetingSchedule>;
    updateMeetingSchedule(id: string, updates: Partial<MeetingSchedule>): Promise<void>;
    confirmMeeting(meetingId: string, employeeId: string): Promise<void>;
    cancelMeeting(meetingId: string, reason: string): Promise<void>;

    // Time Management
    getTimeEntries(employeeId: string, startDate?: Date, endDate?: Date): Promise<TimeEntry[]>;
    clockIn(employeeId: string, location: TimeEntry['location'], photo?: string): Promise<TimeEntry>;
    clockOut(employeeId: string, location: TimeEntry['location'], photo?: string): Promise<void>;
    requestTimeAdjustment(timeEntryId: string, adjustmentData: any): Promise<void>;
    approveTimeAdjustment(timeEntryId: string, adjustmentId: string, approvedBy: string): Promise<void>;

    // Asset Management
    getAssets(status?: string): Promise<Asset[]>;
    createAsset(asset: Omit<Asset, 'id' | 'createdAt' | 'updatedAt'>): Promise<Asset>;
    updateAsset(id: string, updates: Partial<Asset>): Promise<void>;

    getAssetAssignments(employeeId?: string): Promise<AssetAssignment[]>;
    assignAsset(assignment: Omit<AssetAssignment, 'id' | 'createdAt' | 'updatedAt'>): Promise<AssetAssignment>;
    returnAsset(assignmentId: string, returnData: any): Promise<void>;

    getAssetRequests(employeeId?: string): Promise<AssetRequest[]>;
    createAssetRequest(request: Omit<AssetRequest, 'id' | 'createdAt' | 'updatedAt'>): Promise<AssetRequest>;
    updateAssetRequest(id: string, updates: Partial<AssetRequest>): Promise<void>;

    // Notifications
    getNotifications(employeeId: string): Promise<SmartNotification[]>;
    createNotification(notification: Omit<SmartNotification, 'id' | 'createdAt'>): Promise<SmartNotification>;
    markNotificationAsRead(notificationId: string): Promise<void>;
    performNotificationAction(notificationId: string, actionId: string): Promise<void>;
    subscribeToNotifications(employeeId: string, callback: (notifications: SmartNotification[]) => void): () => void;

    // Activity Logging
    logActivity(activity: Omit<ActivityLog, 'id' | 'timestamp'>): Promise<void>;
    getActivityLogs(employeeId?: string, entityType?: string): Promise<ActivityLog[]>;

    // Analytics and Reporting
    getEmployeeEngagementMetrics(employeeId?: string): Promise<any>;
    getLeaveAnalytics(departmentId?: string): Promise<any>;
    getPolicyComplianceReport(): Promise<any>;
    getPerformanceTrends(employeeId?: string): Promise<any>;
    getAssetUtilizationReport(): Promise<any>;
}

// ===== FIREBASE IMPLEMENTATION =====

export class FirebaseComprehensiveHRDataFlowService implements IComprehensiveHRDataFlowService {
    private subscriptions = new Map<string, () => void>();

    // Employee Profile Management
    async getEmployeeProfile(employeeId: string): Promise<ComprehensiveEmployeeProfile | null> {
        try {
            const docRef = doc(db, 'employeeProfiles', employeeId);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                const data = docSnap.data();
                return this.convertFirestoreToEmployeeProfile(data);
            }
            return null;
        } catch (error) {
            console.error('Error getting employee profile:', error);
            throw error;
        }
    }

    async updateEmployeeProfile(employeeId: string, profileData: Partial<ComprehensiveEmployeeProfile>): Promise<ComprehensiveEmployeeProfile> {
        try {
            const docRef = doc(db, 'employeeProfiles', employeeId);

            // Calculate completeness
            const completeness = this.calculateProfileCompleteness(profileData);

            const updateData = {
                ...profileData,
                profileStatus: {
                    ...profileData.profileStatus,
                    completeness,
                    lastUpdated: serverTimestamp(),
                    updatedBy: employeeId
                },
                updatedAt: serverTimestamp()
            };

            await updateDoc(docRef, this.convertToFirestore(updateData));

            // Log activity
            await this.logActivity({
                employeeId,
                action: 'profile_updated',
                entityType: 'employee_profile',
                entityId: employeeId,
                description: `Profile updated with ${completeness}% completeness`,
                newValues: updateData,
                ipAddress: '192.168.1.1', // In real app, get actual IP
                userAgent: navigator.userAgent,
                deviceInfo: this.getDeviceInfo(),
                sessionId: this.getSessionId()
            });

            // Create notification for HR
            await this.createNotification({
                employeeId: 'hr-system',
                title: 'Employee Profile Updated',
                message: `${profileData.personalInfo?.firstName || 'Employee'} has updated their profile (${completeness}% complete)`,
                type: 'info',
                category: 'profile',
                priority: 'medium',
                isRead: false,
                actionRequired: false,
                actionUrl: `/hr/employees/${employeeId}`,
                actionText: 'View Profile',
                metadata: {
                    employeeId,
                    completeness,
                    updateType: 'profile_update'
                }
            });

            return await this.getEmployeeProfile(employeeId) as ComprehensiveEmployeeProfile;
        } catch (error) {
            console.error('Error updating employee profile:', error);
            throw error;
        }
    }

    calculateProfileCompleteness(profile: Partial<ComprehensiveEmployeeProfile>): number {
        const requiredFields = [
            'personalInfo.firstName',
            'personalInfo.lastName',
            'personalInfo.dateOfBirth',
            'personalInfo.gender',
            'contactInfo.personalEmail',
            'contactInfo.personalPhone',
            'contactInfo.address.street',
            'contactInfo.address.city',
            'contactInfo.address.state',
            'contactInfo.address.zipCode',
            'contactInfo.address.country',
            'bankingInfo.bankName',
            'bankingInfo.accountNumber',
            'workInfo.position',
            'workInfo.department',
            'workInfo.hireDate'
        ];

        let completedFields = 0;

        requiredFields.forEach(field => {
            const value = this.getNestedValue(profile, field);
            if (value !== undefined && value !== null && value !== '') {
                completedFields++;
            }
        });

        // Bonus points for optional but important fields
        const bonusFields = [
            'contactInfo.emergencyContacts',
            'skills',
            'certifications',
            'familyInfo.beneficiaries'
        ];

        bonusFields.forEach(field => {
            const value = this.getNestedValue(profile, field);
            if (value && Array.isArray(value) && value.length > 0) {
                completedFields += 0.5;
            }
        });

        return Math.min(Math.round((completedFields / requiredFields.length) * 100), 100);
    }

    subscribeToEmployeeUpdates(employeeId: string, callback: (profile: ComprehensiveEmployeeProfile) => void): () => void {
        const docRef = doc(db, 'employeeProfiles', employeeId);

        const unsubscribe = onSnapshot(docRef, (doc) => {
            if (doc.exists()) {
                const profile = this.convertFirestoreToEmployeeProfile(doc.data());
                callback(profile);
            }
        });

        this.subscriptions.set(`employee_${employeeId}`, unsubscribe);
        return unsubscribe;
    }

    // Leave Management - Types
    async getLeaveTypes(): Promise<LeaveType[]> {
        try {
            const q = query(
                collection(db, 'leaveTypes'),
                where('isActive', '==', true),
                orderBy('name')
            );
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
                message: `A new leave type "${leaveType.name}" has been added with ${leaveType.maxDaysPerYear} days per year`,
                type: 'info',
                category: 'leave',
                priority: 'medium',
                isRead: false,
                actionRequired: false,
                actionUrl: '/employee/leave',
                actionText: 'View Leave Types',
                metadata: {
                    leaveTypeId: docRef.id,
                    leaveTypeName: leaveType.name,
                    maxDays: leaveType.maxDaysPerYear
                }
            });

            return newLeaveType;
        } catch (error) {
            console.error('Error creating leave type:', error);
            throw error;
        }
    }

    async updateLeaveType(id: string, updates: Partial<LeaveType>): Promise<void> {
        try {
            const docRef = doc(db, 'leaveTypes', id);
            await updateDoc(docRef, {
                ...updates,
                updatedAt: serverTimestamp()
            });
        } catch (error) {
            console.error('Error updating leave type:', error);
            throw error;
        }
    }

    async deactivateLeaveType(id: string): Promise<void> {
        try {
            await this.updateLeaveType(id, { isActive: false });

            // Create notification for HR
            await this.createNotification({
                employeeId: 'hr-system',
                title: 'Leave Type Deactivated',
                message: 'A leave type has been deactivated and is no longer available for new requests',
                type: 'warning',
                category: 'leave',
                priority: 'medium',
                isRead: false,
                actionRequired: false,
                metadata: { leaveTypeId: id }
            });
        } catch (error) {
            console.error('Error deactivating leave type:', error);
            throw error;
        }
    }

    subscribeToLeaveTypes(callback: (types: LeaveType[]) => void): () => void {
        const q = query(
            collection(db, 'leaveTypes'),
            where('isActive', '==', true),
            orderBy('name')
        );

        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const types = querySnapshot.docs.map(doc => this.convertFirestoreToLeaveType(doc.data()));
            callback(types);
        });

        this.subscriptions.set('leave_types', unsubscribe);
        return unsubscribe;
    }

    // Continue with other methods...
    // [The implementation would continue with all other methods from the interface]

    // Utility methods
    private convertToFirestore(data: any): any {
        const converted = { ...data };

        Object.keys(converted).forEach(key => {
            if (converted[key] instanceof Date) {
                converted[key] = Timestamp.fromDate(converted[key]);
            } else if (typeof converted[key] === 'object' && converted[key] !== null) {
                converted[key] = this.convertToFirestore(converted[key]);
            }
        });

        return converted;
    }

    private convertFirestoreToEmployeeProfile(data: any): ComprehensiveEmployeeProfile {
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
            skills: data.skills?.map((skill: any) => ({
                ...skill,
                certificationDate: skill.certificationDate?.toDate(),
                expiryDate: skill.expiryDate?.toDate()
            })) || [],
            certifications: data.certifications?.map((cert: any) => ({
                ...cert,
                dateObtained: cert.dateObtained?.toDate() || new Date(),
                expiryDate: cert.expiryDate?.toDate()
            })) || [],
            familyInfo: {
                ...data.familyInfo,
                dependents: data.familyInfo?.dependents?.map((dependent: any) => ({
                    ...dependent,
                    dateOfBirth: dependent.dateOfBirth?.toDate() || new Date()
                })) || []
            },
            documents: data.documents?.map((doc: any) => ({
                ...doc,
                uploadDate: doc.uploadDate?.toDate() || new Date(),
                expiryDate: doc.expiryDate?.toDate()
            })) || [],
            profileStatus: {
                ...data.profileStatus,
                lastUpdated: data.profileStatus?.lastUpdated?.toDate() || new Date()
            },
            createdAt: data.createdAt?.toDate() || new Date(),
            updatedAt: data.updatedAt?.toDate() || new Date()
        };
    }

    private convertFirestoreToLeaveType(data: any): LeaveType {
        return {
            ...data,
            createdAt: data.createdAt?.toDate() || new Date(),
            updatedAt: data.updatedAt?.toDate() || new Date()
        };
    }

    private getNestedValue(obj: any, path: string): any {
        return path.split('.').reduce((current, key) => current?.[key], obj);
    }

    private getDeviceInfo(): string {
        return `${navigator.platform} - ${navigator.userAgent}`;
    }

    private getSessionId(): string {
        return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    // Placeholder implementations for remaining methods
    async createLeaveRequest(request: Omit<LeaveRequest, 'id' | 'submittedAt'>): Promise<LeaveRequest> {
        // Implementation would go here
        throw new Error('Method not implemented');
    }

    async updateLeaveRequest(id: string, updates: Partial<LeaveRequest>): Promise<void> {
        // Implementation would go here
        throw new Error('Method not implemented');
    }

    async approveLeaveRequest(id: string, reviewedBy: string, comments?: string): Promise<void> {
        // Implementation would go here
        throw new Error('Method not implemented');
    }

    async rejectLeaveRequest(id: string, reviewedBy: string, reason: string): Promise<void> {
        // Implementation would go here
        throw new Error('Method not implemented');
    }

    async getLeaveRequests(employeeId?: string): Promise<LeaveRequest[]> {
        // Implementation would go here
        throw new Error('Method not implemented');
    }

    subscribeToLeaveRequests(employeeId: string, callback: (requests: LeaveRequest[]) => void): () => void {
        // Implementation would go here
        throw new Error('Method not implemented');
    }

    async getLeaveBalances(employeeId?: string): Promise<LeaveBalance[]> {
        // Implementation would go here
        throw new Error('Method not implemented');
    }

    async updateLeaveBalance(employeeId: string, leaveTypeId: string, updates: Partial<LeaveBalance>): Promise<void> {
        // Implementation would go here
        throw new Error('Method not implemented');
    }

    async initializeLeaveBalances(employeeId: string, year: number): Promise<void> {
        // Implementation would go here
        throw new Error('Method not implemented');
    }

    async getPolicies(activeOnly?: boolean): Promise<Policy[]> {
        // Implementation would go here
        throw new Error('Method not implemented');
    }

    async createPolicy(policy: Omit<Policy, 'id' | 'createdAt' | 'lastModified'>): Promise<Policy> {
        // Implementation would go here
        throw new Error('Method not implemented');
    }

    async updatePolicy(id: string, updates: Partial<Policy>): Promise<void> {
        // Implementation would go here
        throw new Error('Method not implemented');
    }

    async deactivatePolicy(id: string): Promise<void> {
        // Implementation would go here
        throw new Error('Method not implemented');
    }

    subscribeToPolicies(callback: (policies: Policy[]) => void): () => void {
        // Implementation would go here
        throw new Error('Method not implemented');
    }

    async getPolicyAcknowledgments(policyId?: string, employeeId?: string): Promise<PolicyAcknowledgment[]> {
        // Implementation would go here
        throw new Error('Method not implemented');
    }

    async acknowledgePolicy(acknowledgment: Omit<PolicyAcknowledgment, 'id' | 'acknowledgedAt'>): Promise<PolicyAcknowledgment> {
        // Implementation would go here
        throw new Error('Method not implemented');
    }

    async getPendingPolicies(employeeId: string): Promise<Policy[]> {
        // Implementation would go here
        throw new Error('Method not implemented');
    }

    async getPerformanceGoals(employeeId?: string): Promise<PerformanceGoal[]> {
        // Implementation would go here
        throw new Error('Method not implemented');
    }

    async createPerformanceGoal(goal: Omit<PerformanceGoal, 'id' | 'createdAt' | 'updatedAt'>): Promise<PerformanceGoal> {
        // Implementation would go here
        throw new Error('Method not implemented');
    }

    async updatePerformanceGoal(id: string, updates: Partial<PerformanceGoal>): Promise<void> {
        // Implementation would go here
        throw new Error('Method not implemented');
    }

    async deletePerformanceGoal(id: string): Promise<void> {
        // Implementation would go here
        throw new Error('Method not implemented');
    }

    subscribeToPerformanceGoals(employeeId: string, callback: (goals: PerformanceGoal[]) => void): () => void {
        // Implementation would go here
        throw new Error('Method not implemented');
    }

    async getPerformanceReviews(employeeId?: string): Promise<PerformanceReview[]> {
        // Implementation would go here
        throw new Error('Method not implemented');
    }

    async createPerformanceReview(review: Omit<PerformanceReview, 'id' | 'createdAt'>): Promise<PerformanceReview> {
        // Implementation would go here
        throw new Error('Method not implemented');
    }

    async updatePerformanceReview(id: string, updates: Partial<PerformanceReview>): Promise<void> {
        // Implementation would go here
        throw new Error('Method not implemented');
    }

    async getMeetingSchedules(employeeId?: string): Promise<MeetingSchedule[]> {
        // Implementation would go here
        throw new Error('Method not implemented');
    }

    async createMeetingSchedule(meeting: Omit<MeetingSchedule, 'id' | 'createdAt' | 'updatedAt'>): Promise<MeetingSchedule> {
        // Implementation would go here
        throw new Error('Method not implemented');
    }

    async updateMeetingSchedule(id: string, updates: Partial<MeetingSchedule>): Promise<void> {
        // Implementation would go here
        throw new Error('Method not implemented');
    }

    async confirmMeeting(meetingId: string, employeeId: string): Promise<void> {
        // Implementation would go here
        throw new Error('Method not implemented');
    }

    async cancelMeeting(meetingId: string, reason: string): Promise<void> {
        // Implementation would go here
        throw new Error('Method not implemented');
    }

    async getTimeEntries(employeeId: string, startDate?: Date, endDate?: Date): Promise<TimeEntry[]> {
        // Implementation would go here
        throw new Error('Method not implemented');
    }

    async clockIn(employeeId: string, location: TimeEntry['location'], photo?: string): Promise<TimeEntry> {
        // Implementation would go here
        throw new Error('Method not implemented');
    }

    async clockOut(employeeId: string, location: TimeEntry['location'], photo?: string): Promise<void> {
        // Implementation would go here
        throw new Error('Method not implemented');
    }

    async requestTimeAdjustment(timeEntryId: string, adjustmentData: any): Promise<void> {
        // Implementation would go here
        throw new Error('Method not implemented');
    }

    async approveTimeAdjustment(timeEntryId: string, adjustmentId: string, approvedBy: string): Promise<void> {
        // Implementation would go here
        throw new Error('Method not implemented');
    }

    async getAssets(status?: string): Promise<Asset[]> {
        // Implementation would go here
        throw new Error('Method not implemented');
    }

    async createAsset(asset: Omit<Asset, 'id' | 'createdAt' | 'updatedAt'>): Promise<Asset> {
        // Implementation would go here
        throw new Error('Method not implemented');
    }

    async updateAsset(id: string, updates: Partial<Asset>): Promise<void> {
        // Implementation would go here
        throw new Error('Method not implemented');
    }

    async getAssetAssignments(employeeId?: string): Promise<AssetAssignment[]> {
        // Implementation would go here
        throw new Error('Method not implemented');
    }

    async assignAsset(assignment: Omit<AssetAssignment, 'id' | 'createdAt' | 'updatedAt'>): Promise<AssetAssignment> {
        // Implementation would go here
        throw new Error('Method not implemented');
    }

    async returnAsset(assignmentId: string, returnData: any): Promise<void> {
        // Implementation would go here
        throw new Error('Method not implemented');
    }

    async getAssetRequests(employeeId?: string): Promise<AssetRequest[]> {
        // Implementation would go here
        throw new Error('Method not implemented');
    }

    async createAssetRequest(request: Omit<AssetRequest, 'id' | 'createdAt' | 'updatedAt'>): Promise<AssetRequest> {
        // Implementation would go here
        throw new Error('Method not implemented');
    }

    async updateAssetRequest(id: string, updates: Partial<AssetRequest>): Promise<void> {
        // Implementation would go here
        throw new Error('Method not implemented');
    }

    async getNotifications(employeeId: string): Promise<SmartNotification[]> {
        // Implementation would go here
        throw new Error('Method not implemented');
    }

    async createNotification(notification: Omit<SmartNotification, 'id' | 'createdAt'>): Promise<SmartNotification> {
        try {
            const docRef = doc(collection(db, 'notifications'));
            const newNotification: SmartNotification = {
                id: docRef.id,
                ...notification,
                createdAt: new Date()
            };

            await setDoc(docRef, this.convertToFirestore(newNotification));
            return newNotification;
        } catch (error) {
            console.error('Error creating notification:', error);
            throw error;
        }
    }

    async markNotificationAsRead(notificationId: string): Promise<void> {
        // Implementation would go here
        throw new Error('Method not implemented');
    }

    async performNotificationAction(notificationId: string, actionId: string): Promise<void> {
        // Implementation would go here
        throw new Error('Method not implemented');
    }

    subscribeToNotifications(employeeId: string, callback: (notifications: SmartNotification[]) => void): () => void {
        // Implementation would go here
        throw new Error('Method not implemented');
    }

    async logActivity(activity: Omit<ActivityLog, 'id' | 'timestamp'>): Promise<void> {
        try {
            const docRef = doc(collection(db, 'activityLogs'));
            const newActivity: ActivityLog = {
                id: docRef.id,
                ...activity,
                timestamp: new Date()
            };

            await setDoc(docRef, this.convertToFirestore(newActivity));
        } catch (error) {
            console.error('Error logging activity:', error);
            // Don't throw here - activity logging shouldn't break the main flow
        }
    }

    async getActivityLogs(employeeId?: string, entityType?: string): Promise<ActivityLog[]> {
        // Implementation would go here
        throw new Error('Method not implemented');
    }

    async getEmployeeEngagementMetrics(employeeId?: string): Promise<any> {
        // Implementation would go here
        throw new Error('Method not implemented');
    }

    async getLeaveAnalytics(departmentId?: string): Promise<any> {
        // Implementation would go here
        throw new Error('Method not implemented');
    }

    async getPolicyComplianceReport(): Promise<any> {
        // Implementation would go here
        throw new Error('Method not implemented');
    }

    async getPerformanceTrends(employeeId?: string): Promise<any> {
        // Implementation would go here
        throw new Error('Method not implemented');
    }

    async getAssetUtilizationReport(): Promise<any> {
        // Implementation would go here
        throw new Error('Method not implemented');
    }
}

// ===== MOCK IMPLEMENTATION =====

export class MockComprehensiveHRDataFlowService implements IComprehensiveHRDataFlowService {
    private static instance: MockComprehensiveHRDataFlowService;
    private profiles = new Map<string, ComprehensiveEmployeeProfile>();
    private notifications = new Map<string, SmartNotification[]>();
    private notificationCallbacks = new Map<string, (notifications: SmartNotification[]) => void>();

    public static getInstance(): MockComprehensiveHRDataFlowService {
        if (!MockComprehensiveHRDataFlowService.instance) {
            MockComprehensiveHRDataFlowService.instance = new MockComprehensiveHRDataFlowService();
        }
        return MockComprehensiveHRDataFlowService.instance;
    }

    private constructor() {
        this.initializeSampleData();
    }

    private initializeSampleData() {
        // Initialize sample employee profile
        const sampleProfile: ComprehensiveEmployeeProfile = {
            id: 'emp-001',
            employeeId: 'EMP001',
            personalInfo: {
                firstName: 'John',
                lastName: 'Doe',
                middleName: 'Michael',
                dateOfBirth: new Date('1990-05-15'),
                gender: 'male',
                maritalStatus: 'single',
                nationality: 'American',
                ssn: '123-45-6789',
                passportNumber: 'A1234567'
            },
            contactInfo: {
                personalEmail: 'john.doe@personal.com',
                workEmail: 'john.doe@company.com',
                personalPhone: '+1-555-0123',
                workPhone: '+1-555-0124',
                address: {
                    street: '123 Main Street',
                    city: 'New York',
                    state: 'NY',
                    zipCode: '10001',
                    country: 'USA'
                },
                emergencyContacts: [
                    {
                        id: 'ec-001',
                        name: 'Jane Doe',
                        relationship: 'Sister',
                        phone: '+1-555-0125',
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
                salaryPaymentMethod: 'direct_deposit',
                taxInformation: {
                    federalTaxId: '12-3456789',
                    stateTaxId: 'NY123456',
                    exemptions: 1
                }
            },
            workInfo: {
                position: 'Senior Software Developer',
                department: 'Engineering',
                managerId: 'mgr-001',
                hireDate: new Date('2022-01-15'),
                employmentType: 'full-time',
                workLocation: 'New York Office',
                workSchedule: 'Monday-Friday 9AM-5PM',
                salary: {
                    baseSalary: 95000,
                    currency: 'USD',
                    payFrequency: 'bi-weekly'
                }
            },
            skills: [
                {
                    id: 'skill-001',
                    name: 'JavaScript',
                    level: 'expert',
                    category: 'Programming',
                    certified: true,
                    certificationDate: new Date('2023-01-15'),
                    expiryDate: new Date('2026-01-15'),
                    certifyingBody: 'JavaScript Institute'
                }
            ],
            certifications: [
                {
                    id: 'cert-001',
                    name: 'AWS Certified Developer',
                    issuer: 'Amazon Web Services',
                    dateObtained: new Date('2023-01-15'),
                    expiryDate: new Date('2026-01-15'),
                    credentialId: 'AWS-123456',
                    verificationUrl: 'https://aws.amazon.com/verification/123456'
                }
            ],
            familyInfo: {
                spouse: undefined,
                dependents: [],
                beneficiaries: [
                    {
                        id: 'ben-001',
                        name: 'Jane Doe',
                        relationship: 'Sister',
                        percentage: 100,
                        contactInfo: 'jane.doe@email.com'
                    }
                ]
            },
            documents: [],
            profileStatus: {
                completeness: 85,
                lastUpdated: new Date(),
                updatedBy: 'emp-001',
                status: 'approved'
            },
            createdAt: new Date(),
            updatedAt: new Date()
        };

        this.profiles.set('emp-001', sampleProfile);

        // Initialize sample notifications
        const sampleNotifications: SmartNotification[] = [
            {
                id: 'notif-001',
                employeeId: 'emp-001',
                title: 'Welcome to the Enhanced HRIS System!',
                message: 'Your comprehensive profile has been created. Complete all sections for full access to benefits.',
                type: 'info',
                category: 'profile',
                priority: 'medium',
                isRead: false,
                actionRequired: true,
                actionUrl: '/employee/profile',
                actionText: 'Complete Profile',
                actionButtons: [
                    {
                        id: 'complete-profile',
                        text: 'Complete Now',
                        action: 'navigate',
                        style: 'primary'
                    },
                    {
                        id: 'remind-later',
                        text: 'Remind Later',
                        action: 'snooze',
                        style: 'secondary'
                    }
                ],
                metadata: {
                    source: 'system',
                    profileCompleteness: 85
                },
                createdAt: new Date()
            }
        ];

        this.notifications.set('emp-001', sampleNotifications);
    }

    // Employee Profile Management
    async getEmployeeProfile(employeeId: string): Promise<ComprehensiveEmployeeProfile | null> {
        console.log('Mock: getEmployeeProfile', employeeId);
        return this.profiles.get(employeeId) || null;
    }

    async updateEmployeeProfile(employeeId: string, profileData: Partial<ComprehensiveEmployeeProfile>): Promise<ComprehensiveEmployeeProfile> {
        console.log('Mock: updateEmployeeProfile', employeeId, profileData);

        const currentProfile = this.profiles.get(employeeId);
        if (!currentProfile) {
            throw new Error('Profile not found');
        }

        const updatedProfile: ComprehensiveEmployeeProfile = {
            ...currentProfile,
            ...profileData,
            profileStatus: {
                ...currentProfile.profileStatus,
                ...profileData.profileStatus,
                completeness: this.calculateProfileCompleteness({ ...currentProfile, ...profileData }),
                lastUpdated: new Date(),
                updatedBy: employeeId
            },
            updatedAt: new Date()
        };

        this.profiles.set(employeeId, updatedProfile);
        return updatedProfile;
    }

    calculateProfileCompleteness(profile: Partial<ComprehensiveEmployeeProfile>): number {
        // Mock calculation - in real implementation, this would be more sophisticated
        let completeness = 0;
        const sections = [
            profile.personalInfo?.firstName ? 20 : 0,
            profile.contactInfo?.personalEmail ? 20 : 0,
            profile.bankingInfo?.bankName ? 20 : 0,
            profile.workInfo?.position ? 20 : 0,
            (profile.skills && profile.skills.length > 0) ? 10 : 0,
            (profile.familyInfo?.beneficiaries && profile.familyInfo.beneficiaries.length > 0) ? 10 : 0
        ];

        return sections.reduce((sum, value) => sum + value, 0);
    }

    subscribeToEmployeeUpdates(employeeId: string, callback: (profile: ComprehensiveEmployeeProfile) => void): () => void {
        console.log('Mock: subscribeToEmployeeUpdates', employeeId);

        // Immediately call with current data
        setTimeout(async () => {
            const profile = await this.getEmployeeProfile(employeeId);
            if (profile) {
                callback(profile);
            }
        }, 100);

        return () => { };
    }

    // Placeholder implementations for all other methods
    async getLeaveTypes(): Promise<LeaveType[]> {
        console.log('Mock: getLeaveTypes');
        return [];
    }

    async createLeaveType(leaveType: Omit<LeaveType, 'id' | 'createdAt' | 'updatedAt'>): Promise<LeaveType> {
        console.log('Mock: createLeaveType', leaveType);
        throw new Error('Mock method not implemented');
    }

    async updateLeaveType(id: string, updates: Partial<LeaveType>): Promise<void> {
        console.log('Mock: updateLeaveType', id, updates);
    }

    async deactivateLeaveType(id: string): Promise<void> {
        console.log('Mock: deactivateLeaveType', id);
    }

    subscribeToLeaveTypes(callback: (types: LeaveType[]) => void): () => void {
        console.log('Mock: subscribeToLeaveTypes');
        return () => { };
    }

    // Continue with all other method implementations...
    // [All other methods would have similar mock implementations]

    async createNotification(notification: Omit<SmartNotification, 'id' | 'createdAt'>): Promise<SmartNotification> {
        console.log('Mock: createNotification', notification);

        const newNotification: SmartNotification = {
            id: `notif-${Date.now()}`,
            ...notification,
            createdAt: new Date()
        };

        const employeeNotifications = this.notifications.get(notification.employeeId) || [];
        employeeNotifications.unshift(newNotification);
        this.notifications.set(notification.employeeId, employeeNotifications);

        // Trigger callback if exists
        const callback = this.notificationCallbacks.get(notification.employeeId);
        if (callback) {
            setTimeout(() => callback([...employeeNotifications]), 10);
        }

        return newNotification;
    }

    subscribeToNotifications(employeeId: string, callback: (notifications: SmartNotification[]) => void): () => void {
        console.log('Mock: subscribeToNotifications', employeeId);

        this.notificationCallbacks.set(employeeId, callback);

        // Immediately call with current data
        setTimeout(() => {
            const notifications = this.notifications.get(employeeId) || [];
            callback([...notifications]);
        }, 100);

        return () => {
            this.notificationCallbacks.delete(employeeId);
        };
    }

    async logActivity(activity: Omit<ActivityLog, 'id' | 'timestamp'>): Promise<void> {
        console.log('Mock: logActivity', activity);
    }

    // Add placeholder implementations for all remaining methods
    async getLeaveRequests(employeeId?: string): Promise<LeaveRequest[]> { return []; }
    async createLeaveRequest(request: Omit<LeaveRequest, 'id' | 'submittedAt'>): Promise<LeaveRequest> { throw new Error('Mock not implemented'); }
    async updateLeaveRequest(id: string, updates: Partial<LeaveRequest>): Promise<void> { }
    async approveLeaveRequest(id: string, reviewedBy: string, comments?: string): Promise<void> { }
    async rejectLeaveRequest(id: string, reviewedBy: string, reason: string): Promise<void> { }
    subscribeToLeaveRequests(employeeId: string, callback: (requests: LeaveRequest[]) => void): () => void { return () => { }; }
    async getLeaveBalances(employeeId?: string): Promise<LeaveBalance[]> { return []; }
    async updateLeaveBalance(employeeId: string, leaveTypeId: string, updates: Partial<LeaveBalance>): Promise<void> { }
    async initializeLeaveBalances(employeeId: string, year: number): Promise<void> { }
    async getPolicies(activeOnly?: boolean): Promise<Policy[]> { return []; }
    async createPolicy(policy: Omit<Policy, 'id' | 'createdAt' | 'lastModified'>): Promise<Policy> { throw new Error('Mock not implemented'); }
    async updatePolicy(id: string, updates: Partial<Policy>): Promise<void> { }
    async deactivatePolicy(id: string): Promise<void> { }
    subscribeToPolicies(callback: (policies: Policy[]) => void): () => void { return () => { }; }
    async getPolicyAcknowledgments(policyId?: string, employeeId?: string): Promise<PolicyAcknowledgment[]> { return []; }
    async acknowledgePolicy(acknowledgment: Omit<PolicyAcknowledgment, 'id' | 'acknowledgedAt'>): Promise<PolicyAcknowledgment> { throw new Error('Mock not implemented'); }
    async getPendingPolicies(employeeId: string): Promise<Policy[]> { return []; }
    async getPerformanceGoals(employeeId?: string): Promise<PerformanceGoal[]> { return []; }
    async createPerformanceGoal(goal: Omit<PerformanceGoal, 'id' | 'createdAt' | 'updatedAt'>): Promise<PerformanceGoal> { throw new Error('Mock not implemented'); }
    async updatePerformanceGoal(id: string, updates: Partial<PerformanceGoal>): Promise<void> { }
    async deletePerformanceGoal(id: string): Promise<void> { }
    subscribeToPerformanceGoals(employeeId: string, callback: (goals: PerformanceGoal[]) => void): () => void { return () => { }; }
    async getPerformanceReviews(employeeId?: string): Promise<PerformanceReview[]> { return []; }
    async createPerformanceReview(review: Omit<PerformanceReview, 'id' | 'createdAt'>): Promise<PerformanceReview> { throw new Error('Mock not implemented'); }
    async updatePerformanceReview(id: string, updates: Partial<PerformanceReview>): Promise<void> { }
    async getMeetingSchedules(employeeId?: string): Promise<MeetingSchedule[]> { return []; }
    async createMeetingSchedule(meeting: Omit<MeetingSchedule, 'id' | 'createdAt' | 'updatedAt'>): Promise<MeetingSchedule> { throw new Error('Mock not implemented'); }
    async updateMeetingSchedule(id: string, updates: Partial<MeetingSchedule>): Promise<void> { }
    async confirmMeeting(meetingId: string, employeeId: string): Promise<void> { }
    async cancelMeeting(meetingId: string, reason: string): Promise<void> { }
    async getTimeEntries(employeeId: string, startDate?: Date, endDate?: Date): Promise<TimeEntry[]> { return []; }
    async clockIn(employeeId: string, location: TimeEntry['location'], photo?: string): Promise<TimeEntry> { throw new Error('Mock not implemented'); }
    async clockOut(employeeId: string, location: TimeEntry['location'], photo?: string): Promise<void> { }
    async requestTimeAdjustment(timeEntryId: string, adjustmentData: any): Promise<void> { }
    async approveTimeAdjustment(timeEntryId: string, adjustmentId: string, approvedBy: string): Promise<void> { }
    async getAssets(status?: string): Promise<Asset[]> { return []; }
    async createAsset(asset: Omit<Asset, 'id' | 'createdAt' | 'updatedAt'>): Promise<Asset> { throw new Error('Mock not implemented'); }
    async updateAsset(id: string, updates: Partial<Asset>): Promise<void> { }
    async getAssetAssignments(employeeId?: string): Promise<AssetAssignment[]> { return []; }
    async assignAsset(assignment: Omit<AssetAssignment, 'id' | 'createdAt' | 'updatedAt'>): Promise<AssetAssignment> { throw new Error('Mock not implemented'); }
    async returnAsset(assignmentId: string, returnData: any): Promise<void> { }
    async getAssetRequests(employeeId?: string): Promise<AssetRequest[]> { return []; }
    async createAssetRequest(request: Omit<AssetRequest, 'id' | 'createdAt' | 'updatedAt'>): Promise<AssetRequest> { throw new Error('Mock not implemented'); }
    async updateAssetRequest(id: string, updates: Partial<AssetRequest>): Promise<void> { }
    async getNotifications(employeeId: string): Promise<SmartNotification[]> { return this.notifications.get(employeeId) || []; }
    async markNotificationAsRead(notificationId: string): Promise<void> { }
    async performNotificationAction(notificationId: string, actionId: string): Promise<void> { }
    async getActivityLogs(employeeId?: string, entityType?: string): Promise<ActivityLog[]> { return []; }
    async getEmployeeEngagementMetrics(employeeId?: string): Promise<any> { return {}; }
    async getLeaveAnalytics(departmentId?: string): Promise<any> { return {}; }
    async getPolicyComplianceReport(): Promise<any> { return {}; }
    async getPerformanceTrends(employeeId?: string): Promise<any> { return {}; }
    async getAssetUtilizationReport(): Promise<any> { return {}; }
}

// ===== SERVICE FACTORY =====

export class ComprehensiveHRDataFlowServiceFactory {
    static async createService(): Promise<IComprehensiveHRDataFlowService> {
        try {
            // For now, always use Mock service for development
            console.log('Using Mock Comprehensive HR Data Flow Service');
            return MockComprehensiveHRDataFlowService.getInstance();
        } catch (error) {
            console.error('Error creating comprehensive HR data flow service:', error);
            console.log('Falling back to Mock service');
            return MockComprehensiveHRDataFlowService.getInstance();
        }
    }
}

// Export the main service getter
export const getComprehensiveHRDataFlowService = ComprehensiveHRDataFlowServiceFactory.createService;


