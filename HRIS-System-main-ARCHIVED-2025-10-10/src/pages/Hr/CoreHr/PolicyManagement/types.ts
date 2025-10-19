// Policy Management Types

export interface Policy {
  id: string;
  title: string;
  category: string;
  version: string;
  status: 'Draft' | 'Under Review' | 'Approved' | 'Published' | 'Archived';
  description: string;
  content: string;
  createdBy: string;
  createdDate: string;
  lastModified: string;
  approvedBy?: string;
  approvedDate?: string;
  publishedDate?: string;
  effectiveDate?: string;
  expiryDate?: string;
  acknowledgmentRequired: boolean;
  acknowledgmentCount: number;
  totalEmployees: number;
  tags: string[];
  attachments?: string[];
  department?: string[];
  applicableTo?: string[];
}

export interface PolicyAcknowledgment {
  id: string;
  policyId: string;
  employeeId: string;
  employeeName: string;
  acknowledgedDate: string;
  version: string;
  status: 'Acknowledged' | 'Pending' | 'Overdue';
  comments?: string;
}

export interface PolicyRevision {
  id: string;
  policyId: string;
  version: string;
  changes: string;
  changedBy: string;
  changedDate: string;
  approvalStatus: 'Pending' | 'Approved' | 'Rejected';
  approvedBy?: string;
  approvedDate?: string;
  comments?: string;
}

export interface PolicyCategory {
  id: string;
  name: string;
  description?: string;
  parentId?: string;
  order: number;
  isActive: boolean;
}