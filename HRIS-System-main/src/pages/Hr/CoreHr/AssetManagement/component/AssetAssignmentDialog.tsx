import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/atoms/Select';
import { TypographyP } from '@/components/ui/typography';
import { Package, User } from 'lucide-react';

interface Asset {
  id: number;
  name: string;
  category: string;
  serialNumber: string;
  status: 'Available' | 'Assigned' | 'Under Repair' | 'Retired';
  assignedTo?: string;
  purchaseDate: string;
  purchasePrice: number;
  location: string;
  condition: 'Excellent' | 'Good' | 'Fair' | 'Poor';
  lastMaintenance?: string;
  nextMaintenance?: string;
}

interface AssetAssignmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  asset: Asset | null;
  employees: { value: string; label: string }[];
  onAssign: (assetId: number, employeeName: string) => void;
  onUnassign: (assetId: number) => void;
  onTransfer: (assetId: number, newEmployeeName: string) => void;
}

export const AssetAssignmentDialog: React.FC<AssetAssignmentDialogProps> = ({
  open,
  onOpenChange,
  asset,
  employees,
  onAssign,
  onUnassign,
  onTransfer
}) => {
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [loading, setLoading] = useState(false);

  if (!asset) return null;

  const isAssigned = asset.status === 'Assigned' && asset.assignedTo;
  const isAvailable = asset.status === 'Available';

  const handleAction = async () => {
    if (!selectedEmployee && isAvailable) return;
    
    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      if (isAvailable) {
        onAssign(asset.id, selectedEmployee);
      } else if (isAssigned) {
        if (selectedEmployee) {
          onTransfer(asset.id, selectedEmployee);
        } else {
          onUnassign(asset.id);
        }
      }
      
      setLoading(false);
      setSelectedEmployee('');
      onOpenChange(false);
    }, 1000);
  };

  const getActionButtonText = () => {
    if (loading) return 'Processing...';
    if (isAvailable) return 'Assign Asset';
    if (isAssigned && selectedEmployee) return 'Transfer Asset';
    if (isAssigned && !selectedEmployee) return 'Unassign Asset';
    return 'Update';
  };

  const getDialogTitle = () => {
    if (isAvailable) return 'Assign Asset to Employee';
    if (isAssigned) return 'Manage Asset Assignment';
    return 'Asset Assignment';
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{getDialogTitle()}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Asset Info */}
          <div className="flex items-center gap-3 p-4 bg-muted rounded-lg">
            <Package className="h-8 w-8 text-violet-600" />
            <div>
              <div className="font-semibold">{asset.name}</div>
              <div className="text-sm text-muted-foreground">{asset.serialNumber}</div>
              <div className="text-xs text-muted-foreground">{asset.category}</div>
            </div>
          </div>

          {/* Current Assignment Status */}
          {isAssigned && (
            <div className="flex items-center gap-3 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <User className="h-6 w-6 text-blue-600" />
              <div>
                <div className="text-sm font-medium">Currently assigned to:</div>
                <div className="font-semibold text-blue-700 dark:text-blue-300">{asset.assignedTo}</div>
              </div>
            </div>
          )}

          {/* Employee Selection */}
          <div className="space-y-3">
            <label className="text-sm font-medium">
              {isAvailable ? 'Assign to Employee:' : 'Transfer to Employee (optional):'}
            </label>
            <Select
              value={selectedEmployee}
              onValueChange={setSelectedEmployee}
              placeholder={isAvailable ? "Select an employee" : "Select new employee or leave empty to unassign"}
              options={employees}
              className="w-full"
            />
          </div>

          {/* Action Description */}
          <div className="text-sm text-muted-foreground p-3 bg-muted/50 rounded">
            {isAvailable && (
              <TypographyP>This will assign the asset to the selected employee and change its status to "Assigned".</TypographyP>
            )}
            {isAssigned && selectedEmployee && (
              <TypographyP>This will transfer the asset from <strong>{asset.assignedTo}</strong> to <strong>{selectedEmployee}</strong>.</TypographyP>
            )}
            {isAssigned && !selectedEmployee && (
              <TypographyP>This will unassign the asset from <strong>{asset.assignedTo}</strong> and make it available for assignment.</TypographyP>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleAction}
              className="flex-1 bg-violet-600 hover:bg-violet-700 text-white"
              disabled={loading || (isAvailable && !selectedEmployee)}
            >
              {getActionButtonText()}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};