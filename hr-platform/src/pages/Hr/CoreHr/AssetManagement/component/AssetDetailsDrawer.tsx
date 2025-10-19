import React, { useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '../../../../../components/ui/sheet';
import { Button } from '../../../../../components/ui/button';
import { Separator } from '../../../../../components/ui/separator';
import { Package, User, Calendar, DollarSign, MapPin, Settings, History, Edit, UserPlus, ArrowRightLeft } from 'lucide-react';
import { TypographyH3, TypographyP } from '../../../../../components/ui/typography';

interface AssetHistoryEntry {
  id: number;
  action: 'assigned' | 'unassigned' | 'transferred' | 'created' | 'maintenance' | 'status_change';
  date: string;
  fromEmployee?: string;
  toEmployee?: string;
  performedBy: string;
  notes?: string;
}

import { Asset } from '../types';

interface AssetWithHistory extends Asset {
  history?: AssetHistoryEntry[];
}

interface AssetDetailsDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  asset: Asset | null;
  onAssignClick: (asset: Asset) => void;
  onEditClick?: (asset: Asset) => void;
}

export const AssetDetailsDrawer: React.FC<AssetDetailsDrawerProps> = ({
  open,
  onOpenChange,
  asset,
  onAssignClick,
  onEditClick
}) => {
  if (!asset) return null;

  const statusColors = {
    'Available': 'bg-green-100 text-green-800 border-green-200',
    'Assigned': 'bg-blue-100 text-blue-800 border-blue-200',
    'Under Repair': 'bg-yellow-100 text-yellow-800 border-yellow-200',
    'Retired': 'bg-red-100 text-red-800 border-red-200'
  };

  const conditionColors = {
    'Excellent': 'bg-green-100 text-green-800',
    'Good': 'bg-blue-100 text-blue-800',
    'Fair': 'bg-yellow-100 text-yellow-800',
    'Poor': 'bg-red-100 text-red-800'
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'assigned': return <UserPlus className="h-4 w-4 text-blue-600" />;
      case 'unassigned': return <User className="h-4 w-4 text-gray-600" />;
      case 'transferred': return <ArrowRightLeft className="h-4 w-4 text-purple-600" />;
      case 'created': return <Package className="h-4 w-4 text-green-600" />;
      case 'maintenance': return <Settings className="h-4 w-4 text-orange-600" />;
      case 'status_change': return <Calendar className="h-4 w-4 text-gray-600" />;
      default: return <Calendar className="h-4 w-4 text-gray-600" />;
    }
  };

  const getActionText = (entry: AssetHistoryEntry) => {
    switch (entry.action) {
      case 'assigned':
        return `Assigned to ${entry.toEmployee}`;
      case 'unassigned':
        return `Unassigned from ${entry.fromEmployee}`;
      case 'transferred':
        return `Transferred from ${entry.fromEmployee} to ${entry.toEmployee}`;
      case 'created':
        return 'Asset created';
      case 'maintenance':
        return 'Maintenance performed';
      case 'status_change':
        return 'Status updated';
      default:
        return 'Action performed';
    }
  };

  // Mock history data - in real app, this would come from the asset object
  const mockHistory: AssetHistoryEntry[] = [
    {
      id: 1,
      action: 'created',
      date: asset.purchaseDate,
      performedBy: 'HR Admin',
      notes: 'Asset added to inventory'
    },
    {
      id: 2,
      action: 'assigned',
      date: '2023-02-01',
      toEmployee: 'Jane Doe',
      performedBy: 'HR Admin',
      notes: 'Initial assignment for new employee onboarding'
    },
    {
      id: 3,
      action: 'transferred',
      date: '2023-08-15',
      fromEmployee: 'Jane Doe',
      toEmployee: 'John Smith',
      performedBy: 'IT Admin',
      notes: 'Employee role change - transferred to new department'
    }
  ];

  const history = asset.history || mockHistory;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[600px] sm:w-[600px] overflow-y-auto">
        <SheetHeader className="pb-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <Package className="h-8 w-8 text-violet-600" />
              <div>
                <SheetTitle className="text-xl">{asset.name}</SheetTitle>
                <p className="text-sm text-muted-foreground">{asset.serialNumber}</p>
              </div>
            </div>
            <div className="flex gap-2">
              {onEditClick && (
                <Button size="sm" variant="outline" onClick={() => onEditClick(asset)}>
                  <Edit className="h-4 w-4 mr-1" />
                  Edit
                </Button>
              )}
              {(asset.status === 'Available' || asset.status === 'Assigned') && (
                <Button size="sm" onClick={() => onAssignClick(asset)} className="bg-violet-600 hover:bg-violet-700">
                  {asset.status === 'Available' ? (
                    <><UserPlus className="h-4 w-4 mr-1" /> Assign</>
                  ) : (
                    <><ArrowRightLeft className="h-4 w-4 mr-1" /> Manage</>
                  )}
                </Button>
              )}
            </div>
          </div>
        </SheetHeader>

        <div className="space-y-6">
          {/* Status and Basic Info */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Status</label>
                <div className="mt-1">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${statusColors[asset.status]}`}>
                    {asset.status}
                  </span>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Asset Type</label>
                <p className="mt-1 font-medium text-blue-600">{asset.type || 'Not specified'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Category</label>
                <p className="mt-1 font-medium">{asset.category}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Condition</label>
                <div className="mt-1">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${conditionColors[asset.condition]}`}>
                    {asset.condition}
                  </span>
                </div>
              </div>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Location</label>
                <div className="flex items-center gap-1 mt-1">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">{asset.location}</span>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Purchase Price</label>
                <div className="flex items-center gap-1 mt-1">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">₦{asset.purchasePrice.toLocaleString()}</span>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Purchase Date</label>
                <div className="flex items-center gap-1 mt-1">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">{new Date(asset.purchaseDate).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Current Assignment */}
          {asset.assignedTo && (
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <div className="flex items-center gap-2 mb-2">
                <User className="h-5 w-5 text-blue-600" />
                <span className="font-medium text-blue-900 dark:text-blue-100">Currently Assigned To</span>
              </div>
              <p className="text-lg font-semibold text-blue-700 dark:text-blue-300">{asset.assignedTo}</p>
            </div>
          )}

          {/* Maintenance Info */}
          {(asset.lastMaintenance || asset.nextMaintenance) && (
            <>
              <Separator />
              <div>
                <TypographyH3 className="flex items-center gap-2 mb-3">
                  <Settings className="h-5 w-5" />
                  Maintenance
                </TypographyH3>
                <div className="grid grid-cols-2 gap-4">
                  {asset.lastMaintenance && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Last Maintenance</label>
                      <p className="mt-1 font-medium">{new Date(asset.lastMaintenance).toLocaleDateString()}</p>
                    </div>
                  )}
                  {asset.nextMaintenance && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Next Maintenance</label>
                      <p className="mt-1 font-medium">{new Date(asset.nextMaintenance).toLocaleDateString()}</p>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          {/* Assignment History */}
          <Separator />
          <div>
            <TypographyH3 className="flex items-center gap-2 mb-4">
              <History className="h-5 w-5" />
              Assignment History
            </TypographyH3>
            <div className="space-y-4">
              {history.map((entry) => (
                <div key={entry.id} className="flex gap-3 p-3 bg-muted/50 rounded-lg">
                  <div className="flex-shrink-0 mt-1">
                    {getActionIcon(entry.action)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-sm">{getActionText(entry)}</p>
                      <span className="text-xs text-muted-foreground">
                        {new Date(entry.date).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Performed by {entry.performedBy}
                    </p>
                    {entry.notes && (
                      <p className="text-xs text-muted-foreground mt-1 italic">
                        {entry.notes}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};