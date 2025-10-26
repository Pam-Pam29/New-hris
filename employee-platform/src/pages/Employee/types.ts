// Employee Dashboard Types

// Extended Employee Profile for Employee Dashboard
export interface EmployeeProfile {
    id: string;
    personalInfo: PersonalInfo;
    contactInfo: ContactInfo;
    bankingInfo: BankingInfo;
    documents: Document[];
    skills: Skill[];
    emergencyContacts: EmergencyContact[];
    createdAt: Date;
    updatedAt: Date;
}

export interface PersonalInfo {
    firstName: string;
    lastName: string;
    middleName?: string;
    dateOfBirth: Date;
    gender: 'male' | 'female' | 'other';
    nationality: string;
    maritalStatus: 'single' | 'married' | 'divorced' | 'widowed';
    profilePhoto?: string;
    nationalId: string;
    passportNumber?: string;
    driverLicense?: string;
}

export interface ContactInfo {
    email: string;
    workEmail: string;
    phone: string;
    workPhone?: string;
    address: Address;
    emergencyContact: EmergencyContact;
}

export interface Address {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
}

export interface BankingInfo {
    bankName: string;
    accountNumber: string;
    routingNumber?: string;
    accountType: 'checking' | 'savings';
    swiftCode?: string;
    iban?: string;
}

export interface Document {
    id: string;
    name: string;
    type: DocumentType;
    category: DocumentCategory;
    url: string;
    uploadedAt: Date;
    status: 'pending' | 'approved' | 'rejected';
    notes?: string;
    required: boolean;
}

export type DocumentType =
    | 'identity'
    | 'education'
    | 'employment'
    | 'tax'
    | 'banking'
    | 'emergency_contact'
    | 'certification'
    | 'contract'
    | 'policy_acknowledgment';

export type DocumentCategory =
    | 'identity_verification'
    | 'educational_certificates'
    | 'previous_employment'
    | 'tax_forms'
    | 'banking_information'
    | 'emergency_contacts'
    | 'professional_certifications'
    | 'contracts'
    | 'policies';

export interface Skill {
    id: string;
    name: string;
    category: string;
    level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
    certified: boolean;
    certificationDate?: Date;
    expiryDate?: Date;
}

export interface EmergencyContact {
    id: string;
    name: string;
    relationship: string;
    phone: string;
    email?: string;
    address?: string;
    isPrimary: boolean;
}

// Contract & Onboarding Types
export interface Contract {
    id: string;
    employeeId: string;
    type: 'employment' | 'consultant' | 'internship';
    status: 'draft' | 'pending' | 'signed' | 'executed' | 'expired';
    startDate: Date;
    endDate?: Date;
    position: string;
    department: string;
    salary: number;
    currency: string;
    benefits: string[];
    terms: string;
    version: number;
    createdAt: Date;
    updatedAt: Date;
    signedAt?: Date;
    signedBy?: string;
    documentUrl?: string;
}

export interface OnboardingChecklist {
    id: string;
    employeeId: string;
    items: OnboardingItem[];
    status: 'pending' | 'in_progress' | 'completed';
    startedAt: Date;
    completedAt?: Date;
}

export interface OnboardingItem {
    id: string;
    title: string;
    description: string;
    category: 'document' | 'system' | 'training' | 'meeting' | 'equipment';
    required: boolean;
    status: 'pending' | 'in_progress' | 'completed';
    dueDate?: Date;
    completedAt?: Date;
    notes?: string;
    assignedTo?: string;
}

// Leave Management Types (Extended)
export interface LeaveRequest {
    id: string;
    employeeId: string;
    leaveType: LeaveType;
    startDate: Date;
    endDate: Date;
    reason: string;
    status: 'pending' | 'approved' | 'rejected' | 'cancelled';
    approvedBy?: string;
    approvedAt?: Date;
    attachments?: string[];
    substituteEmployeeId?: string;
    totalDays: number;
    createdAt: Date;
    updatedAt: Date;
}

export interface LeaveType {
    id: string;
    name: string;
    description: string;
    maxDays: number;
    accrualRate: number;
    carryForward: boolean;
    requiresApproval: boolean;
    color: string;
    active: boolean;
}

export interface LeaveBalance {
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
}

// Time Management Types (Extended)
export interface TimeEntry {
    id: string;
    employeeId: string;
    clockIn: Date;
    clockOut?: Date;
    location: GeoLocation;
    photos?: string[];
    breakTime: number; // in minutes
    notes?: string;
    status: 'active' | 'completed' | 'adjusted';
    adjustments?: TimeAdjustment[];
    createdAt: Date;
    updatedAt: Date;
}

export interface GeoLocation {
    latitude: number;
    longitude: number;
    address?: string;
    accuracy?: number;
    timestamp: Date;
}

export interface TimeAdjustment {
    id: string;
    timeEntryId: string;
    type: 'clock_in' | 'clock_out' | 'break';
    originalTime: Date;
    adjustedTime: Date;
    reason: string;
    approvedBy?: string;
    approvedAt?: Date;
    status: 'pending' | 'approved' | 'rejected';
    createdAt: Date;
}

export interface Schedule {
    id: string;
    employeeId: string;
    startDate: Date;
    endDate: Date;
    shiftType: 'morning' | 'afternoon' | 'night' | 'flexible';
    workDays: number[]; // 0-6 (Sunday-Saturday)
    workHours: number;
    breakDuration: number;
    location?: string;
    isActive: boolean;
}

// Performance Management Types
export interface PerformanceGoal {
    id: string;
    employeeId: string;
    title: string;
    description: string;
    category: 'performance' | 'development' | 'behavioral';
    targetValue: number;
    currentValue: number;
    unit: string;
    startDate: Date;
    endDate: Date;
    status: 'not_started' | 'in_progress' | 'completed' | 'overdue';
    progress: number; // percentage
    milestones: Milestone[];
    createdAt: Date;
    updatedAt: Date;
}

export interface Milestone {
    id: string;
    title: string;
    description: string;
    targetDate: Date;
    completed: boolean;
    completedAt?: Date;
    notes?: string;
}

export interface PerformanceReview {
    id: string;
    employeeId: string;
    reviewPeriod: string;
    reviewType: 'annual' | 'quarterly' | 'probation' | 'project';
    status: 'draft' | 'in_progress' | 'completed';
    selfAssessment?: SelfAssessment;
    managerAssessment?: ManagerAssessment;
    peerReviews?: PeerReview[];
    overallRating: number;
    strengths: string[];
    areasForImprovement: string[];
    developmentPlan: string;
    createdAt: Date;
    updatedAt: Date;
    completedAt?: Date;
}

export interface SelfAssessment {
    id: string;
    employeeId: string;
    reviewId: string;
    achievements: string[];
    challenges: string[];
    goals: string[];
    skills: string[];
    feedback: string;
    submittedAt: Date;
}

export interface ManagerAssessment {
    id: string;
    managerId: string;
    reviewId: string;
    performanceRating: number;
    goalAchievement: number;
    competencies: CompetencyRating[];
    feedback: string;
    recommendations: string[];
    submittedAt: Date;
}

export interface CompetencyRating {
    competency: string;
    rating: number; // 1-5
    comments: string;
}

export interface PeerReview {
    id: string;
    reviewerId: string;
    revieweeId: string;
    reviewId: string;
    rating: number;
    feedback: string;
    submittedAt: Date;
}

// Asset Management Types
export interface Asset {
    id: string;
    name: string;
    category: 'laptop' | 'desktop' | 'phone' | 'tablet' | 'furniture' | 'vehicle' | 'other';
    brand: string;
    model: string;
    serialNumber: string;
    assignedTo?: string;
    assignedAt?: Date;
    status: 'available' | 'assigned' | 'maintenance' | 'retired';
    location: string;
    purchaseDate: Date;
    warrantyExpiry?: Date;
    value: number;
    currency: string;
    notes?: string;
    documents?: AssetDocument[];
}

export interface AssetDocument {
    id: string;
    name: string;
    type: 'manual' | 'warranty' | 'invoice' | 'other';
    url: string;
    uploadedAt: Date;
}

export interface AssetRequest {
    id: string;
    employeeId: string;
    assetType: string;
    reason: string;
    priority: 'low' | 'medium' | 'high' | 'urgent';
    status: 'pending' | 'approved' | 'rejected' | 'fulfilled';
    requestedAt: Date;
    approvedBy?: string;
    approvedAt?: Date;
    fulfilledAt?: Date;
    notes?: string;
}

// Payment & Compensation Types
export interface PayrollRecord {
    id: string;
    employeeId: string;
    employeeName: string;
    department: string;
    position: string;
    payPeriod: PayPeriod;
    baseSalary: number;
    overtime: number;
    bonuses: number;
    allowances: Allowance[];
    deductions: Deduction[];
    grossPay: number;
    totalDeductions: number;
    netPay: number;
    paymentStatus: 'pending' | 'processed' | 'paid';
    paymentDate?: string | Date;
    paymentMethod?: 'bank_transfer' | 'check' | 'cash' | 'mobile_money';
    currency: string;
    createdAt: string | Date;
    updatedAt: string | Date;
}

export interface PayPeriod {
    startDate: string | Date;
    endDate: string | Date;
    payDate: string | Date;
    type: 'weekly' | 'biweekly' | 'monthly' | 'semimonthly';
}

export interface Allowance {
    id: string;
    name: string;
    amount: number;
    type: 'fixed' | 'variable';
    taxable: boolean;
    description?: string;
}

export interface Deduction {
    id: string;
    name: string;
    amount: number;
    type: 'tax' | 'insurance' | 'loan' | 'other' | 'retirement';
    description?: string;
}

export interface FinancialRequest {
    id: string;
    employeeId: string;
    employeeName?: string;
    requestType: 'advance' | 'loan' | 'reimbursement' | 'allowance';
    amount: number;
    reason: string;
    status: 'pending' | 'approved' | 'rejected' | 'paid' | 'recovering' | 'completed';
    attachments?: string[];
    approvedBy?: string;
    approvedAt?: Date;
    rejectionReason?: string;
    paidAt?: Date;
    repaymentSchedule?: RepaymentSchedule[];
    repaymentType?: 'full' | 'installments';
    repaymentMethod?: 'salary_deduction' | 'bank_transfer' | 'cash' | 'mobile_money';
    installmentMonths?: number;
    installmentAmount?: number;
    amountRecovered?: number;
    remainingBalance?: number;
    recoveryStartDate?: Date;
    recoveryCompleteDate?: Date;
    linkedPayrollIds?: string[];
    createdAt: Date;
    updatedAt: Date;
}

export interface RepaymentSchedule {
    id: string;
    dueDate: Date;
    amount: number;
    status: 'pending' | 'paid' | 'overdue';
    paidAt?: Date;
}

export interface BenefitsEnrollment {
    id: string;
    employeeId: string;
    benefitType: string;
    provider: string;
    enrollmentStatus: 'active' | 'pending' | 'inactive';
    contribution: number;
    employerContribution: number;
    effectiveDate: string | Date;
    terminationDate?: string | Date;
    coverage: string;
    beneficiaries?: Beneficiary[];
}

export interface Beneficiary {
    id: string;
    name: string;
    relationship: string;
    percentage: number;
    dateOfBirth?: Date;
    ssn?: string;
}

// Policy Management Types
export interface Policy {
    id: string;
    title: string;
    category: string;
    content: string;
    version: number;
    effectiveDate: Date;
    expiryDate?: Date;
    status: 'draft' | 'active' | 'archived';
    requiresAcknowledgment: boolean;
    createdBy: string;
    createdAt: Date;
    updatedAt: Date;
    attachments?: string[];
}

export interface PolicyAcknowledgment {
    id: string;
    employeeId: string;
    policyId: string;
    acknowledgedAt: Date;
    ipAddress: string;
    userAgent: string;
    signature?: string;
}

// Notification Types
export interface Notification {
    id: string;
    employeeId: string;
    type: 'info' | 'warning' | 'success' | 'error';
    title: string;
    message: string;
    read: boolean;
    createdAt: Date;
    actionUrl?: string;
    actionText?: string;
}

// Meeting Types
export interface Meeting {
    id: string;
    title: string;
    description: string;
    attendees: string[];
    organizer: string;
    startTime: Date;
    endTime: Date;
    location?: string;
    meetingUrl?: string;
    status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
    agenda?: string;
    notes?: string;
    createdAt: Date;
    updatedAt: Date;
}

// Dashboard Types
export interface DashboardStats {
    totalEmployees: number;
    activeEmployees: number;
    pendingRequests: number;
    upcomingEvents: number;
    recentActivities: Activity[];
}

export interface Activity {
    id: string;
    type: 'leave_request' | 'time_entry' | 'document_upload' | 'policy_acknowledgment' | 'performance_review';
    title: string;
    description: string;
    timestamp: Date;
    status: 'pending' | 'completed' | 'failed';
    employeeId: string;
}

// API Response Types
export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
}

export interface PaginatedResponse<T> {
    data: T[];
    total: number;
    page: number;
    limit: number;
    hasNext: boolean;
    hasPrev: boolean;
}

// Form Types
export interface FormField {
    name: string;
    label: string;
    type: 'text' | 'email' | 'password' | 'number' | 'date' | 'select' | 'textarea' | 'file' | 'checkbox';
    required: boolean;
    placeholder?: string;
    options?: { value: string; label: string }[];
    validation?: {
        min?: number;
        max?: number;
        pattern?: string;
        message?: string;
    };
}

export interface FormSection {
    title: string;
    description?: string;
    fields: FormField[];
}

// File Upload Types
export interface FileUpload {
    id: string;
    file: File;
    progress: number;
    status: 'uploading' | 'completed' | 'error';
    url?: string;
    error?: string;
}

// Search and Filter Types
export interface SearchFilters {
    query?: string;
    category?: string;
    status?: string;
    dateFrom?: Date;
    dateTo?: Date;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}

// All types are already exported above with their interface declarations
