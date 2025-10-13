import React, { useState, useEffect, useMemo, FormEvent } from 'react';
import { Button } from '../../../../components/ui/button';
import { TypographyH2 } from '../../../../components/ui/typography';
import { AtomicTanstackTable } from '../../../../components/TanstackTable/TanstackTable';
import { ColumnDef } from "@tanstack/react-table";
import { StatCard } from '../../../../components/molecules/StatCard';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../../../../components/ui/dialog';
import {
  PlusCircle,
  Package,
  Users,
  AlertTriangle,
  CheckCircle,
  UserPlus,
  ArrowRightLeft,
  Search,
  Filter,
  Download,
  Upload,
  Settings,
  Eye,
  Edit,
  Trash2,
  DollarSign,
  TrendingUp,
  Wrench,
  MapPin,
  Calendar,
  Laptop,
  Monitor,
  Smartphone
} from 'lucide-react';
import { AssetForm } from './component/AssetForm';
import { AssetAssignmentDialog } from './component/AssetAssignmentDialog';
import { AssetDetailsDrawer } from './component/AssetDetailsDrawer';
import { employeeService } from '../../../../services/employeeService';
import { Employee } from '../EmployeeManagement/types';
import { Asset } from './types';
import { getAssetService } from './services/assetService';
import { useToast } from "../../../../hooks/use-toast";

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
  const { toast } = useToast();
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
    console.log('Form submitted!', form); // Debug log
    setSending(true);

    try {
      // Add validation
      if (!form.name.trim()) {
        toast({
          title: 'Validation Error',
          description: 'Asset name is required.',
          variant: 'destructive',
        });
        setSending(false);
        return;
      }

      if (!form.category.trim()) {
        toast({
          title: 'Validation Error',
          description: 'Asset category is required.',
          variant: 'destructive',
        });
        setSending(false);
        return;
      }

      const service = await getAssetService();
      console.log('Calling createAsset with:', form); // Add logging

      const assetData: Omit<Asset, 'id'> = {
        name: form.name,
        category: form.category,
        serialNumber: form.serialNumber,
        status: form.status as Asset['status'],
        purchaseDate: form.purchaseDate,
        purchasePrice: form.purchasePrice,
        location: form.location,
        condition: form.condition as Asset['condition']
      };

      // Only add nextMaintenance if it has a value (Firebase doesn't accept undefined)
      if (form.nextMaintenance && form.nextMaintenance.trim() !== '') {
        assetData.nextMaintenance = form.nextMaintenance;
      }

      if (form.status === 'Assigned') {
        assetData.assignedTo = form.assignedTo;
      }

      console.log('Asset data to be created:', assetData); // Debug log

      const newAsset = await service.createAsset(assetData);
      console.log('New asset created:', newAsset); // Debug log

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
        description: `Failed to create asset: ${error instanceof Error ? error.message : 'Unknown error'}`,
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
        header: "Asset",
        accessorKey: "name",
        cell: ({ row }) => {
          const asset = row.original;
          const getCategoryIcon = (category: string) => {
            switch (category.toLowerCase()) {
              case 'laptop':
              case 'computer':
                return <Laptop className="h-4 w-4 text-primary" />;
              case 'monitor':
              case 'display':
                return <Monitor className="h-4 w-4 text-primary" />;
              case 'phone':
              case 'mobile':
                return <Smartphone className="h-4 w-4 text-primary" />;
              default:
                return <Package className="h-4 w-4 text-primary" />;
            }
          };

          return (
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                {getCategoryIcon(asset.category)}
              </div>
              <div>
                <div className="font-semibold text-foreground">{asset.name}</div>
                <div className="text-sm text-muted-foreground">
                  {asset.serialNumber && `SN: ${asset.serialNumber}`}
                  {asset.serialNumber && asset.category && ' • '}
                  {asset.category}
                </div>
              </div>
            </div>
          );
        },
      },
      {
        header: "Status & Assignment",
        accessorKey: "status",
        cell: ({ row }) => {
          const asset = row.original;
          const statusConfig = {
            'Available': { color: 'text-success', bg: 'bg-success/10 border-success/20', icon: CheckCircle },
            'Assigned': { color: 'text-info', bg: 'bg-info/10 border-info/20', icon: Users },
            'Under Repair': { color: 'text-warning', bg: 'bg-warning/10 border-warning/20', icon: Wrench },
            'Retired': { color: 'text-destructive', bg: 'bg-destructive/10 border-destructive/20', icon: AlertTriangle }
          };
          const config = statusConfig[asset.status];
          const IconComponent = config.icon;

          return (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <IconComponent className={`h-4 w-4 ${config.color}`} />
                <span className={`px-3 py-1 rounded-full text-xs font-medium border ${config.bg} ${config.color}`}>
                  {asset.status}
                </span>
              </div>
              {asset.assignedTo && (
                <div className="flex items-center gap-2 text-sm">
                  <Users className="h-3 w-3 text-muted-foreground" />
                  <span className="text-muted-foreground">{asset.assignedTo}</span>
                </div>
              )}
            </div>
          );
        },
      },
      {
        header: "Location & Value",
        accessorKey: "location",
        cell: ({ row }) => {
          const asset = row.original;
          return (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">{asset.location || 'Not specified'}</span>
              </div>
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium text-success">${asset.purchasePrice.toLocaleString()}</span>
              </div>
            </div>
          );
        },
      },
      {
        header: "Purchase Info",
        accessorKey: "purchaseDate",
        cell: ({ row }) => {
          const asset = row.original;
          return (
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">
                  {asset.purchaseDate ? new Date(asset.purchaseDate).toLocaleDateString() : 'Not specified'}
                </span>
              </div>
              <div className="text-xs text-muted-foreground">
                Condition: {asset.condition || 'Unknown'}
              </div>
            </div>
          );
        },
      },
      {
        header: "Actions",
        id: "actions",
        cell: ({ row }) => {
          const asset = row.original;
          const isAvailable = asset.status === 'Available';
          const isAssigned = asset.status === 'Assigned';

          return (
            <div className="flex items-center gap-2">
              <button
                onClick={() => openDetailsDrawer(asset)}
                className="flex items-center gap-1 px-3 py-1.5 hover:bg-info/10 text-info rounded-lg transition-colors text-sm"
                title="View Details"
              >
                <Eye className="h-4 w-4" />
                <span>View</span>
              </button>
              {(isAvailable || isAssigned) && (
                <button
                  onClick={() => openAssignmentDialog(asset)}
                  className="flex items-center gap-1 px-3 py-1.5 hover:bg-primary/10 text-primary rounded-lg transition-colors text-sm"
                  title={isAvailable ? "Assign Asset" : "Manage Assignment"}
                >
                  {isAvailable ? <UserPlus className="h-4 w-4" /> : <ArrowRightLeft className="h-4 w-4" />}
                  <span>{isAvailable ? "Assign" : "Manage"}</span>
                </button>
              )}
              <button
                onClick={() => {/* Edit asset */ }}
                className="flex items-center gap-1 px-3 py-1.5 hover:bg-secondary/10 text-secondary rounded-lg transition-colors text-sm"
                title="Edit Asset"
              >
                <Edit className="h-4 w-4" />
                <span>Edit</span>
              </button>
            </div>
          );
        },
      },
    ],
    [openDetailsDrawer, openAssignmentDialog]
  );

  if (loading) {
    return (
      <div className="p-8 min-h-screen animate-fade-in flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading assets...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 min-h-screen animate-fade-in flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <p className="text-lg font-medium text-foreground mb-2">Something went wrong</p>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button
            variant="outline"
            onClick={() => window.location.reload()}
            className="shadow-soft hover:shadow-soft-lg transition-all duration-200"
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 min-h-screen animate-fade-in">
      {/* Header Section */}
      <div className="mb-8 animate-slide-in">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-xl shadow-soft">
              <Package className="h-7 w-7 text-primary" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gradient mb-1">
                Asset Management
              </h1>
              <p className="text-muted-foreground">Track, manage, and optimize your company assets</p>
            </div>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" className="shadow-soft hover:shadow-soft-lg transition-all duration-200">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button variant="outline" className="shadow-soft hover:shadow-soft-lg transition-all duration-200">
              <Upload className="h-4 w-4 mr-2" />
              Import
            </Button>
            <Button variant="outline" className="shadow-soft hover:shadow-soft-lg transition-all duration-200">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
            <Button
              className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-soft hover:shadow-soft-lg transition-all duration-200"
              onClick={() => setDialogOpen(true)}
            >
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Asset
            </Button>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8 animate-fade-in">
        <div className="card-modern group hover:scale-105 bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-primary/10 rounded-xl group-hover:bg-primary/20 transition-colors">
                <Package className="h-6 w-6 text-primary" />
              </div>
              <div className="flex items-center gap-1 text-sm text-success">
                <TrendingUp className="h-4 w-4" />
                <span className="font-medium">+8%</span>
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Total Assets</p>
              <p className="text-3xl font-bold text-primary">{totalAssets}</p>
              <p className="text-xs text-muted-foreground">All company assets</p>
            </div>
          </div>
        </div>

        <div className="card-modern group hover:scale-105 bg-gradient-to-br from-info/5 to-info/10 border-info/20">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-info/10 rounded-xl group-hover:bg-info/20 transition-colors">
                <Users className="h-6 w-6 text-info" />
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Assigned</p>
              <p className="text-3xl font-bold text-info">{assignedAssets}</p>
              <p className="text-xs text-muted-foreground">Currently in use</p>
            </div>
          </div>
        </div>

        <div className="card-modern group hover:scale-105 bg-gradient-to-br from-success/5 to-success/10 border-success/20">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-success/10 rounded-xl group-hover:bg-success/20 transition-colors">
                <CheckCircle className="h-6 w-6 text-success" />
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Available</p>
              <p className="text-3xl font-bold text-success">{availableAssets}</p>
              <p className="text-xs text-muted-foreground">Ready for assignment</p>
            </div>
          </div>
        </div>

        <div className="card-modern group hover:scale-105 bg-gradient-to-br from-warning/5 to-warning/10 border-warning/20">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-warning/10 rounded-xl group-hover:bg-warning/20 transition-colors">
                <Wrench className="h-6 w-6 text-warning" />
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Under Repair</p>
              <p className="text-3xl font-bold text-warning">{underRepairAssets}</p>
              <p className="text-xs text-muted-foreground">Being serviced</p>
            </div>
          </div>
        </div>

        <div className="card-modern group hover:scale-105 bg-gradient-to-br from-secondary/5 to-secondary/10 border-secondary/20">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-secondary/10 rounded-xl group-hover:bg-secondary/20 transition-colors">
                <DollarSign className="h-6 w-6 text-secondary" />
              </div>
              <div className="flex items-center gap-1 text-sm text-success">
                <TrendingUp className="h-4 w-4" />
                <span className="font-medium">+15%</span>
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Total Value</p>
              <p className="text-3xl font-bold text-secondary">${totalValue.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">Asset portfolio value</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="card-modern mb-8">
        <div className="p-6">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div className="flex items-center gap-4 flex-1">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search assets..."
                  className="w-full pl-10 pr-4 py-2 border border-input rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
                />
              </div>
              <div className="flex gap-2">
                <select
                  value={categoryFilter}
                  onChange={e => setCategoryFilter(e.target.value)}
                  className="px-3 py-2 border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="">All Categories</option>
                  {categoryOptions.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
                <select
                  value={statusFilter}
                  onChange={e => setStatusFilter(e.target.value)}
                  className="px-3 py-2 border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="">All Statuses</option>
                  {statusOptions.map(status => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
                <select
                  value={locationFilter}
                  onChange={e => setLocationFilter(e.target.value)}
                  className="px-3 py-2 border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="">All Locations</option>
                  {locationOptions.map(location => (
                    <option key={location} value={location}>{location}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Assets Table */}
      <div className="card-modern overflow-hidden">
        <AtomicTanstackTable
          data={filteredAssets}
          columns={columns}
          showGlobalFilter={false}
          pageSizeOptions={[10, 20, 50]}
          initialPageSize={10}
          className="table-modern"
        />
      </div>

      {/* Add Asset Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Add New Asset</DialogTitle>
            <DialogDescription>
              Fill in the details below to add a new asset to the system.
            </DialogDescription>
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