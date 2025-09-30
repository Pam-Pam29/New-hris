// Asset Management Types

export interface Asset {
  id: string;
  name: string;
  category: string;
  serialNumber: string;
  status: 'Available' | 'Assigned' | 'Under Repair' | 'Retired';
  assignedTo?: string;
  assignedDate?: string;
  purchaseDate: string;
  purchasePrice: number;
  location: string;
  condition: 'Excellent' | 'Good' | 'Fair' | 'Poor';
  lastMaintenance?: string;
  nextMaintenance?: string;
  notes?: string;
  tags?: string[];
  manufacturer?: string;
  model?: string;
  warrantyExpiration?: string;
  priority: 'Critical' | 'High' | 'Medium' | 'Low';
  isEssential?: boolean; // For new employee starter kit
}

export interface AssetAssignment {
  id: string;
  assetId: string;
  employeeId: string;
  assignedDate: string;
  returnDate?: string;
  condition: 'Excellent' | 'Good' | 'Fair' | 'Poor';
  notes?: string;
  status: 'Active' | 'Returned' | 'Lost' | 'Damaged';
}

export interface MaintenanceRecord {
  id: string;
  assetId: string;
  maintenanceType: 'Preventive' | 'Corrective' | 'Upgrade';
  date: string;
  cost: number;
  provider: string;
  description: string;
  status: 'Scheduled' | 'In Progress' | 'Completed' | 'Cancelled';
  notes?: string;
  nextMaintenanceDate?: string;
}

export interface AssetRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  assetType: string; // e.g., "Laptop", "Monitor", "Phone"
  category: string;
  justification: string;
  priority: 'Urgent' | 'High' | 'Medium' | 'Low';
  status: 'Pending' | 'Approved' | 'Rejected' | 'Fulfilled';
  requestedDate: string;
  approvedBy?: string;
  approvedDate?: string;
  rejectedReason?: string;
  fulfilledDate?: string;
  assignedAssetId?: string;
  notes?: string;
}

export interface StarterKit {
  id: string;
  name: string;
  department: string;
  jobTitle: string;
  description: string;
  assets: StarterKitAsset[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface StarterKitAsset {
  assetType: string;
  category: string;
  quantity: number;
  isRequired: boolean;
  specifications?: string;
}