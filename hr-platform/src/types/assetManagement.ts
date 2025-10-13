// Asset Management Types
export type AssetStatus = 'available' | 'assigned' | 'maintenance' | 'retired' | 'lost';
export type AssetCondition = 'excellent' | 'good' | 'fair' | 'poor' | 'damaged';
export type AssetCategory = 'Electronics' | 'Furniture' | 'Vehicle' | 'Software' | 'Equipment' | 'Other';

export interface Asset {
  id: string;
  companyId: string; // Multi-tenancy: Company ID
  assetTag: string; // Unique identifier like "LAPTOP-001"
  name: string;
  category: AssetCategory;
  description: string;
  serialNumber?: string;
  manufacturer?: string;
  model?: string;
  purchaseDate: Date | any;
  purchasePrice?: number;
  currentValue?: number;
  status: AssetStatus;
  condition: AssetCondition;
  location?: string;
  warrantyExpiry?: Date | any;
  notes?: string;

  // Assignment details
  assignedTo?: string; // Employee ID
  assignedToName?: string;
  assignmentDate?: Date | any;

  // Metadata
  createdAt: Date | any;
  updatedAt: Date | any;
  createdBy: string;
}

export interface AssetAssignment {
  id: string;
  companyId: string; // Multi-tenancy: Company ID
  assetId: string;
  assetTag: string;
  assetName: string;
  employeeId: string;
  employeeName: string;
  assignedDate: Date | any;
  returnedDate?: Date | any;
  status: 'active' | 'returned';
  notes?: string;
  assignedBy: string;
}

export interface AssetMaintenance {
  id: string;
  companyId: string; // Multi-tenancy: Company ID
  assetId: string;
  assetTag: string;
  maintenanceType: 'repair' | 'upgrade' | 'inspection' | 'cleaning';
  description: string;
  cost?: number;
  performedBy?: string;
  performedDate: Date | any;
  notes?: string;
  createdBy: string;
}

export interface AssetStatistics {
  totalAssets: number;
  availableAssets: number;
  assignedAssets: number;
  maintenanceAssets: number;
  retiredAssets: number;
  totalValue: number;
  assetsByCategory: { category: AssetCategory; count: number }[];
  assetsByCondition: { condition: AssetCondition; count: number }[];
}

