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