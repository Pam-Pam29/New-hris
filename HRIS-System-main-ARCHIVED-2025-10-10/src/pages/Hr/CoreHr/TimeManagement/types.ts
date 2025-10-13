// Time Management Types

export interface AttendanceRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  date: string;
  clockIn: string;
  clockOut: string;
  status: 'Present' | 'Late' | 'Absent';
  notes?: string;
  reason?: string;
  adjustmentReason?: 'forgot_clock_in' | 'forgot_clock_out' | 'system_error' | 'other';
  lastModified?: string;
  modifiedBy?: string;
}

export interface TimeAdjustment {
  id: string;
  attendanceRecordId: string;
  previousClockIn?: string;
  previousClockOut?: string;
  newClockIn: string;
  newClockOut: string;
  reason: string;
  notes?: string;
  createdAt: string;
  createdBy: string;
  status: 'pending' | 'approved' | 'rejected';
  approvedBy?: string;
  approvedAt?: string;
}

export interface TimeOffRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  startDate: string;
  endDate: string;
  type: 'vacation' | 'sick' | 'personal' | 'other';
  status: 'pending' | 'approved' | 'rejected';
  reason: string;
  notes?: string;
  createdAt: string;
  approvedBy?: string;
  approvedAt?: string;
}