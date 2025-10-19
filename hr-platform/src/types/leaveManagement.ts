// Shared types for leave management across employee and HR platforms

export interface LeaveType {
    id: string;
    companyId: string; // Multi-tenancy: Company ID
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
    companyId: string; // Multi-tenancy: Company ID
    employeeId: string;
    employeeName?: string;
    department?: string;
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
    companyId: string; // Multi-tenancy: Company ID
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

// Status normalization helper
export function normalizeLeaveStatus(status: string | undefined): 'pending' | 'approved' | 'rejected' | 'cancelled' {
    if (!status) return 'pending';
    const normalized = status.toString().toLowerCase().trim();
    switch (normalized) {
        case 'approved':
        case 'approve':
            return 'approved';
        case 'rejected':
        case 'reject':
            return 'rejected';
        case 'pending':
            return 'pending';
        case 'cancelled':
        case 'cancel':
            return 'cancelled';
        default:
            console.warn('Unknown leave status:', status, 'defaulting to pending');
            return 'pending';
    }
}

// Status display helper
export function getStatusDisplayInfo(status: string) {
    const normalizedStatus = normalizeLeaveStatus(status);
    const statusConfig = {
        pending: {
            variant: 'secondary' as const,
            text: 'Pending',
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
        cancelled: {
            variant: 'outline' as const,
            text: 'Cancelled',
            color: 'text-gray-600',
            bgColor: 'bg-gray-100'
        }
    };
    return statusConfig[normalizedStatus];
}

// Date formatting helpers
export function formatLeaveDateRange(startDate: any, endDate: any): string {
    try {
        // Handle Firebase Timestamp objects
        let start: Date;
        let end: Date;

        if (startDate?.toDate && typeof startDate.toDate === 'function') {
            start = startDate.toDate();
        } else if (startDate instanceof Date) {
            start = startDate;
        } else if (startDate?.seconds) {
            // Handle Firestore Timestamp object (plain object with seconds)
            start = new Date(startDate.seconds * 1000);
        } else {
            start = new Date(startDate);
        }

        if (endDate?.toDate && typeof endDate.toDate === 'function') {
            end = endDate.toDate();
        } else if (endDate instanceof Date) {
            end = endDate;
        } else if (endDate?.seconds) {
            // Handle Firestore Timestamp object (plain object with seconds)
            end = new Date(endDate.seconds * 1000);
        } else {
            end = new Date(endDate);
        }

        if (isNaN(start.getTime()) || isNaN(end.getTime())) {
            console.warn('Invalid date after conversion:', { startDate, endDate, start, end });
            return 'Invalid date';
        }

        const formatOptions: Intl.DateTimeFormatOptions = {
            month: 'short',
            day: '2-digit',
            year: 'numeric'
        };

        if (start.getFullYear() === end.getFullYear()) {
            if (start.getMonth() === end.getMonth()) {
                return `${start.toLocaleDateString('en-US', { month: 'short', day: '2-digit' })} - ${end.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })}`;
            } else {
                return `${start.toLocaleDateString('en-US', { month: 'short', day: '2-digit' })} - ${end.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })}`;
            }
        } else {
            return `${start.toLocaleDateString('en-US', formatOptions)} - ${end.toLocaleDateString('en-US', formatOptions)}`;
        }
    } catch (error) {
        console.error('Date formatting error:', error, { startDate, endDate });
        return 'Invalid date';
    }
}

export function formatLeaveDate(date: any, formatString: string = 'MMM dd, yyyy'): string {
    try {
        if (!date) return 'N/A';

        // Handle Firebase Timestamp objects
        let parsedDate: Date;

        if (date?.toDate && typeof date.toDate === 'function') {
            parsedDate = date.toDate();
        } else if (date instanceof Date) {
            parsedDate = date;
        } else if (date?.seconds) {
            // Handle Firestore Timestamp object (plain object with seconds)
            parsedDate = new Date(date.seconds * 1000);
        } else if (typeof date === 'string') {
            parsedDate = new Date(date);
        } else if (typeof date === 'object' && Object.keys(date).length === 0) {
            // Empty object
            return 'N/A';
        } else {
            parsedDate = new Date(date);
        }

        if (isNaN(parsedDate.getTime())) {
            console.warn('Invalid date after conversion:', date);
            return 'N/A';
        }

        return parsedDate.toLocaleDateString('en-US', {
            month: 'short',
            day: '2-digit',
            year: 'numeric'
        });
    } catch (error) {
        console.error('Date formatting error:', error, { date });
        return 'N/A';
    }
}
