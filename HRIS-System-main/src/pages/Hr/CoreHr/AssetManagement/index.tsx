import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { TypographyH2 } from '@/components/ui/typography';
import { AtomicTanstackTable } from '@/components/TanstackTable/TanstackTable';
import { ColumnDef } from "@tanstack/react-table";
import { StatCard } from '@/components/molecules/StatCard';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { PlusCircle, Package, Users, AlertTriangle, CheckCircle, UserPlus, ArrowRightLeft } from 'lucide-react';
import { AssetForm } from './component/AssetForm';
import { AssetAssignmentDialog } from './component/AssetAssignmentDialog';
import { AssetDetailsDrawer } from './component/AssetDetailsDrawer';

// Asset type definition
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

// Mock data
const mockAssets: Asset[] = [
  {
    id: 1,
    name: 'MacBook Pro 16"',
    category: 'IT Equipment',
    serialNumber: 'MBP001',
    status: 'Assigned',
    assignedTo: 'Jane Doe',
    purchaseDate: '2023-01-15',
    purchasePrice: 2500,
    location: 'Lagos Office',
    condition: 'Excellent',
    lastMaintenance: '2023-06-15',
    nextMaintenance: '2024-06-15'
  },
  {
    id: 2,
    name: 'Dell Monitor 27"',
    category: 'IT Equipment',
    serialNumber: 'MON001',
    status: 'Available',
    purchaseDate: '2023-02-10',
    purchasePrice: 400,
    location: 'Lagos Office',
    condition: 'Good'
  },
  {
    id: 3,
    name: 'Office Chair - Ergonomic',
    category: 'Furniture',
    serialNumber: 'CHR001',
    status: 'Assigned',
    assignedTo: 'John Smith',
    purchaseDate: '2022-11-20',
    purchasePrice: 350,
    location: 'Abuja Office',
    condition: 'Good'
  },
  {
    id: 4,
    name: 'iPhone 14 Pro',
    category: 'Mobile Device',
    serialNumber: 'IPH001',
    status: 'Under Repair',
    assignedTo: 'Sarah Lee',
    purchaseDate: '2023-03-05',
    purchasePrice: 1200,
    location: 'Lagos Office',
    condition: 'Fair',
    lastMaintenance: '2023-12-01'
  }
];

export default function AssetManagement() {
  const [assets, setAssets] = useState<Asset[]>(mockAssets);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [sending, setSending] = useState(false);
  const [assignmentDialogOpen, setAssignmentDialogOpen] = useState(false);
  const [selectedAssetForAssignment, setSelectedAssetForAssignment] = useState<Asset | null>(null);
  const [detailsDrawerOpen, setDetailsDrawerOpen] = useState(false);
  const [selectedAssetForDetails, setSelectedAssetForDetails] = useState<Asset | null>(null);
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

  // Mock employee data for assignment dropdown
  const mockEmployees = [
    { value: 'Jane Doe', label: 'Jane Doe' },
    { value: 'John Smith', label: 'John Smith' },
    { value: 'Sarah Lee', label: 'Sarah Lee' },
    { value: 'Michael Brown', label: 'Michael Brown' }
  ];

  // Handle form submission
  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSending(true);

    setTimeout(() => {
      const newAsset: Asset = {
        id: assets.length + 1,
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
      };

      setAssets(prev => [...prev, newAsset]);
      setSending(false);
      setDialogOpen(false);
      
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
    }, 1200);
  }

  // Asset assignment handlers
  function handleAssignAsset(assetId: number, employeeName: string) {
    setAssets(prev => prev.map(asset => 
      asset.id === assetId 
        ? { ...asset, status: 'Assigned' as const, assignedTo: employeeName }
        : asset
    ));
  }

  function handleUnassignAsset(assetId: number) {
    setAssets(prev => prev.map(asset => 
      asset.id === assetId 
        ? { ...asset, status: 'Available' as const, assignedTo: undefined }
        : asset
    ));
  }

  function handleTransferAsset(assetId: number, newEmployeeName: string) {
    setAssets(prev => prev.map(asset => 
      asset.id === assetId 
        ? { ...asset, assignedTo: newEmployeeName }
        : asset
    ));
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
          tableClassName="min-w-full divide-y divide-border"
          rowClassName={(row: { index: number }) =>
            `transition-colors ${row.index % 2 === 0 ? 'bg-muted/50' : 'bg-background'} hover:bg-violet-50 dark:hover:bg-violet-900`}
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