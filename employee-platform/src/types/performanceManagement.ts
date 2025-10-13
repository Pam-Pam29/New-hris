// Shared types for performance management

export interface PerformanceMeeting {
    id: string;
    employeeId: string;
    employeeName: string;
    managerId?: string;
    managerName?: string;
    title: string;
    description: string;
    meetingType: 'one-on-one' | 'performance-review' | 'goal-setting' | 'feedback' | 'development';
    scheduledDate: Date;
    duration: number; // in minutes
    location?: string;
    meetingLink?: string;
    googleEventId?: string; // Google Calendar event ID for managing the event
    status: 'pending' | 'approved' | 'rejected' | 'completed' | 'cancelled';
    agenda?: string[];
    notes?: string;
    createdBy: 'employee' | 'hr';
    createdAt: Date;
    updatedAt: Date;
    reviewedBy?: string;
    reviewedAt?: Date;
    rejectionReason?: string;
}

export interface PerformanceGoal {
    id: string;
    employeeId: string;
    employeeName?: string;
    title: string;
    description: string;
    category: 'performance' | 'development' | 'behavioral' | 'technical';
    targetValue: number;
    currentValue: number;
    unit: 'percentage' | 'number' | 'hours';
    startDate: Date;
    endDate: Date;
    status: 'not_started' | 'in_progress' | 'completed' | 'cancelled' | 'overdue';
    progress: number;
    priority: 'low' | 'medium' | 'high';
    createdAt: Date;
    updatedAt: Date;

    // Overdue tracking
    daysOverdue?: number;
    overdueNotificationSent?: boolean;
    managerNotificationSent?: boolean;
    hrNotificationSent?: boolean;

    // Extension request
    extensionRequested?: boolean;
    extensionRequestDate?: Date;
    extensionRequestReason?: string;
    requestedNewDeadline?: Date;
    extensionApproved?: boolean;
    extensionApprovedBy?: string;
    extensionApprovedDate?: Date;
    extensionRejectionReason?: string;
    extensionDecisionAcknowledged?: boolean; // Employee clicked "Okay" on decision

    // Completion tracking
    completedDate?: Date;
    daysToComplete?: number;
    completedEarly?: boolean;
    daysEarlyOrLate?: number; // Positive = early, Negative = late
    completionCelebrationShown?: boolean;
}

export interface PerformanceReview {
    id: string;
    employeeId: string;
    employeeName: string;
    reviewerId: string;
    reviewerName: string;
    reviewPeriod: string;
    overallRating: number; // 1-5
    strengths: string[];
    areasForImprovement: string[];
    goals: string[];
    comments: string;
    status: 'draft' | 'submitted' | 'acknowledged';
    createdAt: Date;
    updatedAt: Date;
    acknowledgedAt?: Date;
}

// Status helpers
export function normalizeMeetingStatus(status: string | undefined): 'pending' | 'approved' | 'rejected' | 'completed' | 'cancelled' {
    if (!status) return 'pending';
    const normalized = status.toString().toLowerCase().trim();
    switch (normalized) {
        case 'approved':
            return 'approved';
        case 'rejected':
            return 'rejected';
        case 'completed':
            return 'completed';
        case 'cancelled':
            return 'cancelled';
        case 'pending':
        default:
            return 'pending';
    }
}

export function getMeetingStatusInfo(status: string) {
    const normalizedStatus = normalizeMeetingStatus(status);
    const statusConfig = {
        pending: {
            variant: 'secondary' as const,
            text: 'Pending Approval',
            color: 'text-yellow-600',
            bgColor: 'bg-yellow-100'
        },
        approved: {
            variant: 'default' as const,
            text: 'Approved',
            color: 'text-green-600',
            bgColor: 'bg-green-100'
        },
        rejected: {
            variant: 'destructive' as const,
            text: 'Rejected',
            color: 'text-red-600',
            bgColor: 'bg-red-100'
        },
        completed: {
            variant: 'outline' as const,
            text: 'Completed',
            color: 'text-blue-600',
            bgColor: 'bg-blue-100'
        },
        cancelled: {
            variant: 'outline' as const,
            text: 'Cancelled',
            color: 'text-gray-600',
            bgColor: 'bg-gray-100'
        }
    };
    return statusConfig[normalizedStatus];
}

// Date formatting
export function formatMeetingDate(date: any): string {
    try {
        if (!date) return 'N/A';

        let parsedDate: Date;

        if (date?.toDate && typeof date.toDate === 'function') {
            parsedDate = date.toDate();
        } else if (date instanceof Date) {
            parsedDate = date;
        } else if (date?.seconds) {
            parsedDate = new Date(date.seconds * 1000);
        } else {
            parsedDate = new Date(date);
        }

        if (isNaN(parsedDate.getTime())) {
            return 'N/A';
        }

        return parsedDate.toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    } catch (error) {
        console.error('Date formatting error:', error);
        return 'N/A';
    }
}
