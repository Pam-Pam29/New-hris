import React, { useState, useEffect, useMemo, FormEvent } from 'react';
import { Button } from '../../../../components/ui/button';
import { TypographyH2 } from '../../../../components/ui/typography';
import { AtomicTanstackTable } from '../../../../components/TanstackTable/TanstackTable';
import { ColumnDef } from "@tanstack/react-table";
import { StatCard } from '../../../../components/molecules/StatCard';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../../../components/ui/dialog';
import { PlusCircle, Package, Users, AlertTriangle, CheckCircle, UserPlus, ArrowRightLeft } from 'lucide-react';
import { AssetForm } from './component/AssetForm';
import { AssetAssignmentDialog } from './component/AssetAssignmentDialog';
import { AssetDetailsDrawer } from './component/AssetDetailsDrawer';
import { employeeService } from '../../../../services/employeeService';
import { Employee } from '../EmployeeManagement/types';
import { Asset } from './types';
import { getAssetService } from './services/assetService';
import { toast } from "@/hooks/use-toast";

interface StatCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  description: string;
}

interface AssetFormProps {
  form: {
    name: string;
    serialNumber: string;
    category: string;
    status: string;
    assignedTo: string;
    purchaseDate: string;
    purchasePrice: number;
    location: string;
    condition: string;
    nextMaintenance: string;
  };
  setForm: (form: any) => void;
  handleSubmit: (e: FormEvent) => void;
  sending: boolean;
  employees: { value: string; label: string }[];
}

interface AssetDetailsDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  asset: Asset | null;
  onAssignClick: (asset: Asset) => void;
}

export default function AssetManagement() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [sending, setSending] = useState(false);
  const [assignmentDialogOpen, setAssignmentDialogOpen] = useState(false);
  const [selectedAssetForAssignment, setSelectedAssetForAssignment] = useState<Asset | null>(null);
  const [detailsDrawerOpen, setDetailsDrawerOpen] = useState(false);
  const [selectedAssetForDetails, setSelectedAssetForDetails] = useState<Asset | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: '',
    serialNumber: '',
    category: '',
    status: 'Available',
    assignedTo: '',
    purchaseDate: '',
    purchasePrice: 0,
    location: '',
    condition: 'Excellent',
    nextMaintenance: ''
  });
  const [employees, setEmployees] = useState<Employee[]>([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [service, employeeData] = await Promise.all([
          getAssetService(),
          employeeService.getEmployees()
        ]);
        
        const assetData = await service.getAssets();
        setAssets(assetData);
        setEmployees(employeeData);
        setLoading(false);
      } catch (error) {
        console.error('Error loading data:', error);
        setError('Failed to load data. Please try again later.');
        setLoading(false);
      }
    };
    loadData();
  }, []);

  // Mock employee data for assignment dropdown
  const mockEmployees = employees.map(employee => ({ value: employee.name, label: employee.name }));

  // Handle form submission
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSending(true);

    try {
      const service = await getAssetService();
      const newAsset = await service.createAsset({
        name: form.name,
        category: form.category,
        serialNumber: form.serialNumber,
        status: form.status as Asset['status'],
        assignedTo: form.status === 'Assigned' ? form.assignedTo : undefined,
        purchaseDate: form.purchaseDate,
        purchasePrice: form.purchasePrice,
        location: form.location,
        condition: form.condition as Asset['condition'],
        nextMaintenance: form.nextMaintenance || undefined
      });

      setAssets(prev => [...prev, newAsset]);
      setDialogOpen(false);
      toast({
        title: 'Success',
        description: 'Asset created successfully',
      });

      // Reset form
      setForm({
        name: '',
        serialNumber: '',
        category: '',
        status: 'Available',
        assignedTo: '',
        purchaseDate: '',
        purchasePrice: 0,
        location: '',
        condition: 'Excellent',
        nextMaintenance: ''
      });
    } catch (error) {
      console.error('Error creating asset:', error);
      toast({
        title: 'Error',
        description: 'Failed to create asset. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setSending(false);
    }
  }

  // Asset assignment handlers
  async function handleAssignAsset(assetId: string, employeeName: string) {
    try {
      const service = await getAssetService();
      await service.updateAsset(assetId, {
        status: 'Assigned',
        assignedTo: employeeName
      });
      
      setAssets(prev => prev.map(asset =>
        asset.id === assetId
          ? { ...asset, status: 'Assigned', assignedTo: employeeName }
          : asset
      ));
      
      toast({
        title: 'Success',
        description: 'Asset assigned successfully',
      });
    } catch (error) {
      console.error('Error assigning asset:', error);
      toast({
        title: 'Error',
        description: 'Failed to assign asset. Please try again.',
        variant: 'destructive',
      });
    }
  }

  async function handleUnassignAsset(assetId: string) {
    try {
      const service = await getAssetService();
      await service.updateAsset(assetId, {
        status: 'Available',
        assignedTo: undefined
      });
      
      setAssets(prev => prev.map(asset =>
        asset.id === assetId
          ? { ...asset, status: 'Available', assignedTo: undefined }
          : asset
      ));
      
      toast({
        title: 'Success',
        description: 'Asset unassigned successfully',
      });
    } catch (error) {
      console.error('Error unassigning asset:', error);
      toast({
        title: 'Error',
        description: 'Failed to unassign asset. Please try again.',
        variant: 'destructive',
      });
    }
  }

  async function handleTransferAsset(assetId: string, newEmployeeName: string) {
    try {
      const service = await getAssetService();
      await service.updateAsset(assetId, {
        assignedTo: newEmployeeName
      });
      
      setAssets(prev => prev.map(asset =>
        asset.id === assetId
          ? { ...asset, assignedTo: newEmployeeName }
          : asset
      ));
      
      toast({
        title: 'Success',
        description: 'Asset transferred successfully',
      });
    } catch (error) {
      console.error('Error transferring asset:', error);
      toast({
        title: 'Error',
        description: 'Failed to transfer asset. Please try again.',
        variant: 'destructive',
      });
    }
  }

  function openAssignmentDialog(asset: Asset) {
    setSelectedAssetForAssignment(asset);
    setAssignmentDialogOpen(true);
  }

  function openDetailsDrawer(asset: Asset) {
    setSelectedAssetForDetails(asset);
    setDetailsDrawerOpen(true);
  }

  // Statistics
  const totalAssets = assets.length;
  const assignedAssets = assets.filter(a => a.status === 'Assigned').length;
  const availableAssets = assets.filter(a => a.status === 'Available').length;
  const underRepairAssets = assets.filter(a => a.status === 'Under Repair').length;
  const totalValue = assets.reduce((sum, asset) => sum + asset.purchasePrice, 0);

  // Filter options
  const categoryOptions = Array.from(new Set(assets.map(a => a.category)));
  const statusOptions = Array.from(new Set(assets.map(a => a.status)));
  const locationOptions = Array.from(new Set(assets.map(a => a.location)));

  // Filtered assets
  const filteredAssets = assets.filter(asset =>
    (!categoryFilter || asset.category === categoryFilter) &&
    (!statusFilter || asset.status === statusFilter) &&
    (!locationFilter || asset.location === locationFilter)
  );

  const columns = useMemo<ColumnDef<Asset>[]>(
    () => [
      {
        header: "Asset ID",
        accessorKey: "id",
        cell: ({ row }) => <span className="font-mono text-xs">{row.original.id}</span>,
      },
      {
        header: "Name",
        accessorKey: "name",
        cell: ({ row }) => (
          <div>
            <div className="font-medium">{row.original.name}</div>
            <div className="text-xs text-muted-foreground">{row.original.serialNumber}</div>
          </div>
        ),
      },
      {
        header: "Category",
        accessorKey: "category",
      },
      {
        header: "Status",
        accessorKey: "status",
        cell: ({ row }) => {
          const status = row.original.status;
          const statusColors = {
            'Available': 'bg-green-100 text-green-800',
            'Assigned': 'bg-blue-100 text-blue-800',
            'Under Repair': 'bg-yellow-100 text-yellow-800',
            'Retired': 'bg-red-100 text-red-800'
          };
          return (
            <span className={`px-2 py-1 rounded text-xs font-medium ${statusColors[status]}`}>
              {status}
            </span>
          );
        },
      },
      {
        header: "Assigned To",
        accessorKey: "assignedTo",
        cell: ({ row }) => row.original.assignedTo || '-',
      },
      {
        header: "Location",
        accessorKey: "location",
      },
      {
        header: "Value",
        accessorKey: "purchasePrice",
        cell: ({ row }) => `$${row.original.purchasePrice.toLocaleString()}`,
      },
      {
        header: "Actions",
        id: "actions",
        cell: ({ row }) => {
          const asset = row.original;
          const isAvailable = asset.status === 'Available';
          const isAssigned = asset.status === 'Assigned';

          return (
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => openDetailsDrawer(asset)}
              >
                View Details
              </Button>
              {(isAvailable || isAssigned) && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => openAssignmentDialog(asset)}
                  className="text-violet-600 border-violet-200 hover:bg-violet-50"
                >
                  {isAvailable ? (
                    <><UserPlus className="h-3 w-3 mr-1" /> Assign</>
                  ) : (
                    <><ArrowRightLeft className="h-3 w-3 mr-1" /> Manage</>
                  )}
                </Button>
              )}
            </div>
          );
        },
      },
    ],
    []
  );

  if (loading) {
    return (
      <div className="p-8 min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600"></div>
          <p className="text-sm text-muted-foreground">Loading assets...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="flex flex-col items-center gap-2 text-center">
          <AlertTriangle className="h-8 w-8 text-red-500" />
          <p className="text-sm text-muted-foreground">{error}</p>
          <Button
            variant="outline"
            onClick={() => window.location.reload()}
            className="mt-4"
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 min-h-screen bg-background text-foreground">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
        <StatCard
          title="Total Assets"
          value={totalAssets.toString()}
          icon={<Package className="h-4 w-4" />}
          description="All company assets"
        />
        <StatCard
          title="Assigned"
          value={assignedAssets.toString()}
          icon={<Users className="h-4 w-4" />}
          description="Currently in use"
        />
        <StatCard
          title="Available"
          value={availableAssets.toString()}
          icon={<CheckCircle className="h-4 w-4" />}
          description="Ready for assignment"
        />
        <StatCard
          title="Under Repair"
          value={underRepairAssets.toString()}
          icon={<AlertTriangle className="h-4 w-4" />}
          description="Being serviced"
        />
        <StatCard
          title="Total Value"
          value={`$${totalValue.toLocaleString()}`}
          icon={<Package className="h-4 w-4" />}
          description="Asset portfolio value"
        />
      </div>

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <TypographyH2>Asset Management</TypographyH2>
        <Button className="bg-violet-600 hover:bg-violet-700 text-white" onClick={() => setDialogOpen(true)}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Asset
        </Button>
      </div>

      {/* Assets Table */}
      <div className="overflow-x-auto rounded-xl shadow border border-border bg-card">
        <AtomicTanstackTable
          data={filteredAssets}
          columns={columns}
          showGlobalFilter
          globalFilterPlaceholder="Search assets..."
          pageSizeOptions={[10, 20, 50]}
          initialPageSize={10}
          className="min-w-full divide-y divide-border"
          rowClassName={(row: { index: number }) =>
            `transition-colors ${row.index % 2 === 0 ? 'bg-muted/50' : 'bg-background'} hover:bg-violet-50 dark:hover:bg-violet-900`
          }
          headerClassName="bg-muted text-foreground font-semibold text-sm uppercase tracking-wide"
          filterDropdowns={
            <>
              <select
                value={categoryFilter}
                onChange={e => setCategoryFilter(e.target.value)}
                className="px-3 py-2 rounded-md border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-violet-400"
              >
                <option value="">All Categories</option>
                {categoryOptions.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                className="px-3 py-2 rounded-md border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-violet-400"
              >
                <option value="">All Statuses</option>
                {statusOptions.map(status => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
              <select
                value={locationFilter}
                onChange={e => setLocationFilter(e.target.value)}
                className="px-3 py-2 rounded-md border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-violet-400"
              >
                <option value="">All Locations</option>
                {locationOptions.map(location => (
                  <option key={location} value={location}>{location}</option>
                ))}
              </select>
            </>
          }
        />
      </div>

      {/* Add Asset Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Add New Asset</DialogTitle>
          </DialogHeader>
          <AssetForm
            form={form}
            setForm={setForm}
            handleSubmit={handleSubmit}
            sending={sending}
            employees={mockEmployees}
          />
        </DialogContent>
      </Dialog>

      {/* Asset Assignment Dialog */}
      <AssetAssignmentDialog
        open={assignmentDialogOpen}
        onOpenChange={setAssignmentDialogOpen}
        asset={selectedAssetForAssignment}
        employees={mockEmployees}
        onAssign={handleAssignAsset}
        onUnassign={handleUnassignAsset}
        onTransfer={handleTransferAsset}
      />

      {/* Asset Details Drawer */}
      <AssetDetailsDrawer
        open={detailsDrawerOpen}
        onOpenChange={setDetailsDrawerOpen}
        asset={selectedAssetForDetails}
        onAssignClick={(asset) => {
          setDetailsDrawerOpen(false);
          openAssignmentDialog(asset);
        }}
      />
    </div>
  );
}