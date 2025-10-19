// types/leave.ts
export interface LeaveType {
  id: string;
  name: string;
  daysAllowed: number;
  color: string;
  description?: string;
  active?: boolean;
}

export interface LeaveRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  department: string;
  type: string;
  startDate: string;
  endDate: string;
  status: 'Pending' | 'Approved' | 'Rejected' | 'Cancelled';
  reason: string;
  submittedDate: string;
  approver: string;
  approvedDate: string;
  totalDays: number;
}

export interface Employee {
  id: string;
  name: string;
  department: string;
  position: string;
  email?: string;
  status: string;
}