// types/leave.ts
export interface LeaveType {
  id: string;
  name: string;
  daysAllowed: number;
  color: string;
  description?: string;
  active?: boolean;
  maxDays?: number;
  accrualRate?: number;
  carryForward?: boolean;
  requiresApproval?: boolean;
}

export interface LeaveRequest {
  id: string;
  employeeId: string;
  employeeName?: string;
  department?: string;
  leaveTypeId?: string;
  leaveTypeName?: string;
  type?: string;
  startDate: string | Date;
  endDate: string | Date;
  status: 'Pending' | 'Approved' | 'Rejected' | 'Cancelled' | 'pending' | 'approved' | 'rejected' | 'cancelled';
  reason: string;
  submittedDate?: string;
  submittedAt?: any;
  approver?: string;
  approvedDate?: string;
  totalDays: number;
  reviewedBy?: string;
  reviewedAt?: string;
  comments?: string;
}

export interface Employee {
  id: string;
  name: string;
  department: string;
  position: string;
  email?: string;
  status: string;
}