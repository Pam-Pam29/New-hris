import React, { useState, useEffect, useMemo, FormEvent } from 'react';
import { Button } from '../../../../components/ui/button';
import { Badge } from '../../../../components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../components/ui/card';
import { Input } from '../../../../components/ui/input';
import { Label } from '../../../../components/ui/label';
import { Textarea } from '../../../../components/ui/textarea';
import { Alert, AlertDescription } from '../../../../components/ui/alert';
import { TypographyH2 } from '../../../../components/ui/typography';
import { AtomicTanstackTable } from '../../../../components/TanstackTable';
import { ColumnDef } from "@tanstack/react-table";
import { StatCard } from '../../../../components/molecules/StatCard';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../../../../components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../../components/ui/tabs';
import {
  PlusCircle,
  Plus,
  Package,
  Users,
  User,
  AlertTriangle,
  AlertCircle,
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
  Smartphone,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { AssetForm } from './component/AssetForm';
import { AssetAssignmentDialog } from './component/AssetAssignmentDialog';
import { AssetDetailsDrawer } from './component/AssetDetailsDrawer';
import EmployeeAssetAssignments from './EmployeeAssetAssignments';
import { employeeService } from '../../../../services/employeeService';
import { Employee } from '../EmployeeManagement/types';
import { Asset } from './types';
import { getAssetService } from './services/assetService';
import { useToast } from "../../../../hooks/use-toast";
import { useCompany } from '../../../../context/CompanyContext';

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
    type: string;
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
  const { companyId } = useCompany();
  const [assets, setAssets] = useState<Asset[]>([]);
  const [requests, setRequests] = useState<any[]>([]);
  const [starterKits, setStarterKits] = useState<any[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
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
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [showStarterKitDialog, setShowStarterKitDialog] = useState(false);
  const [showFulfillDialog, setShowFulfillDialog] = useState(false);
  const [selectedAssetForFulfillment, setSelectedAssetForFulfillment] = useState('');
  const [starterKitForm, setStarterKitForm] = useState({
    name: '',
    department: '',
    jobTitle: '',
    description: '',
    assetTypes: [] as { assetType: string; category: string; quantity: number; isRequired: boolean; specifications: string }[]
  });
  const [filtersExpanded, setFiltersExpanded] = useState(false);
  const [editingKit, setEditingKit] = useState<any>(null);
  const [form, setForm] = useState({
    name: '',
    serialNumber: '',
    type: '',
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
  const [activeTab, setActiveTab] = useState('assets');

  useEffect(() => {
    const loadData = async () => {
      try {
        const service = await getAssetService();

        // Load employees from comprehensive data flow service instead (filtered by company)
        const { getComprehensiveDataFlowService } = await import('../../../../services/comprehensiveDataFlowService');
        const dataFlowService = await getComprehensiveDataFlowService();
        
        // Use subscribeToAllEmployees with companyId filter
        let allEmployees: any[] = [];
        if (companyId) {
          await new Promise<void>((resolve) => {
            const unsubscribe = dataFlowService.subscribeToAllEmployees((employees) => {
              allEmployees = employees;
              unsubscribe();
              resolve();
            }, companyId);
          });
          console.log(`👥 AssetManagement: Loaded ${allEmployees.length} employees for company`);
        } else {
          allEmployees = await dataFlowService.getAllEmployees();
        }

        // Convert to Employee format for this component
        const employeeData = allEmployees.map(emp => {
          // Check ALL possible locations for job title
          const empAny = emp as any;
          const jobTitle = empAny.role ||
            empAny.jobInfo?.jobTitle ||
            empAny.jobInfo?.position ||
            empAny.jobInfo?.role ||
            empAny.position ||
            empAny.workInfo?.jobTitle ||
            empAny.workInfo?.position ||
            empAny.workInfo?.role ||
            empAny.employmentInfo?.jobTitle ||
            empAny.employmentInfo?.position ||
            'Employee';

          const dept = empAny.department ||
            empAny.jobInfo?.department ||
            empAny.workInfo?.department ||
            empAny.employmentInfo?.department ||
            'General';

          const empData = {
            id: emp.id || emp.employeeId,
            name: `${emp.personalInfo.firstName} ${emp.personalInfo.lastName}`,
            position: jobTitle,
            department: dept,
            employeeId: emp.employeeId || emp.id,
            role: jobTitle,
            employmentType: 'full-time',
            status: 'active',
            companyId: companyId || ''
          };

          // Comprehensive debug log for Victoria
          if (emp.employeeId === 'EMP001') {
            console.log('🔍 Victoria\'s FULL employee object:', emp);
            console.log('🔍 Checking all fields:', {
              'emp.role': empAny.role,
              'emp.position': empAny.position,
              'emp.department': empAny.department,
              'emp.jobInfo': empAny.jobInfo,
              'emp.workInfo': empAny.workInfo,
              'emp.employmentInfo': empAny.employmentInfo,
              'EXTRACTED jobTitle': jobTitle,
              'EXTRACTED dept': dept
            });
          }

          return empData;
        }) as Employee[];

        const [assetData, requestsData, starterKitsData] = await Promise.all([
          service.getAssets(),
          service.getAssetRequests(),
          service.getStarterKits()
        ]);

        setAssets(assetData);
        setRequests(requestsData);
        setStarterKits(starterKitsData);
        setEmployees(employeeData);
        setLoading(false);

        console.log('📦 Loaded:', assetData.length, 'assets,', requestsData.length, 'requests,', starterKitsData.length, 'kits,', employeeData.length, 'employees');
        console.log('👥 Employees:', employeeData);
        console.log('📦 Assets:', assetData);
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

  // Handle asset assignment
  const handleAssignAsset = async (assetId: string, employeeId: string) => {
    try {
      const service = await getAssetService();
      const asset = assets.find(a => a.id === assetId);

      if (!asset) {
        toast({
          title: 'Error',
          description: 'Asset not found',
          variant: 'destructive',
        });
        return;
      }

      // If employeeId is empty, unassign the asset
      if (!employeeId || employeeId.trim() === '') {
        const updatedAsset = {
          ...asset,
          status: 'Available' as const,
          assignedTo: '', // Explicitly clear assignedTo
          assignedDate: '' // Explicitly clear assignedDate
        };
        console.log('🔄 Unassigning asset:', assetId, 'Clearing assignedTo field');
        await service.updateAsset(assetId, updatedAsset);
        setAssets(prev => prev.map(a => a.id === assetId ? updatedAsset : a));
        toast({
          title: 'Success',
          description: 'Asset unassigned successfully',
        });
      } else {
        // Assign asset to employee
        const updatedAsset = {
          ...asset,
          assignedTo: employeeId,
          status: 'Assigned' as const,
          assignedDate: new Date().toISOString()
        };
        await service.updateAsset(assetId, updatedAsset);
        setAssets(prev => prev.map(a => a.id === assetId ? updatedAsset : a));

        console.log('✅ Asset assigned:', assetId, 'to employee:', employeeId);

        toast({
          title: 'Success',
          description: 'Asset assigned successfully',
        });
      }
    } catch (error) {
      console.error('Error in handleAssignAsset:', error);
      toast({
        title: 'Error',
        description: 'Failed to assign asset',
        variant: 'destructive',
      });
    }
  };

  // Handle new employee kit creation - Auto-assign based on job title
  const handleCreateNewEmployeeKit = async (employeeId: string) => {
    if (!employeeId) {
      toast({
        title: 'Error',
        description: 'Employee ID is required',
        variant: 'destructive',
      });
      return;
    }

    try {
      // Find the employee
      const employee = employees.find(e => e.id === employeeId || (e as any).employeeId === employeeId);

      if (!employee) {
        toast({
          title: 'Error',
          description: 'Employee not found',
          variant: 'destructive',
        });
        return;
      }

      const service = await getAssetService();

      // Auto-assign starter kit based on job title
      // Try multiple possible fields for job title
      const jobTitle = (employee as any).position ||
        (employee as any).role ||
        employee.name;

      console.log(`🎯 Auto-assigning kit for ${employee.name} with job title: "${jobTitle}"`);

      const result = await service.autoAssignStarterKit(
        employeeId,
        employee.name,
        jobTitle
      );

      if (result.success) {
        // Reload assets to reflect changes
        const updatedAssets = await service.getAssets();
        setAssets(updatedAssets);

        let message = `Successfully assigned ${result.assignedCount} asset(s) to ${employee.name}`;

        if (result.missingAssets.length > 0) {
          message += `\n\nSome assets were unavailable:\n${result.missingAssets.join('\n')}`;
        }

        if (result.maintenanceWarning) {
          message += `\n\n⚠️ Note: ${result.maintenanceWarning}`;
        }

        toast({
          title: 'Starter Kit Assigned',
          description: message,
        });
      } else {
        toast({
          title: 'No Starter Kit Found',
          description: `No active starter kit configured for job title: ${jobTitle}. Create one in the "Starter Kits" tab first.`,
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Failed to assign starter kit:', error);
      toast({
        title: 'Error',
        description: 'Failed to assign starter kit',
        variant: 'destructive',
      });
    }
  };

  // Handle approve request - opens fulfillment dialog
  const handleApproveRequest = async (request: any) => {
    setSelectedRequest(request);
    setShowFulfillDialog(true);
  };

  // Handle fulfill request - assign asset to employee
  const handleFulfillRequest = async () => {
    if (!selectedRequest || !selectedAssetForFulfillment) {
      toast({
        title: 'Error',
        description: 'Please select an asset to assign',
        variant: 'destructive',
      });
      return;
    }

    try {
      const service = await getAssetService();

      // Check if selected asset is available
      const selectedAsset = assets.find(a => a.id === selectedAssetForFulfillment);
      if (!selectedAsset) {
        toast({
          title: 'Error',
          description: 'Selected asset not found',
          variant: 'destructive',
        });
        return;
      }

      if (selectedAsset.status !== 'Available') {
        toast({
          title: 'Asset Already Assigned',
          description: `This asset is currently assigned to ${selectedAsset.assignedTo || 'someone else'}. Please pick a different asset.`,
          variant: 'destructive',
        });
        return;
      }

      // Assign the asset to the employee
      const updatedAsset = {
        ...selectedAsset,
        assignedTo: selectedRequest.employeeId,
        status: 'Assigned' as const,
        assignedDate: new Date().toISOString()
      };
      await service.updateAsset(selectedAsset.id, updatedAsset);

      // Update request to Fulfilled
      await service.updateAssetRequest(selectedRequest.id, {
        status: 'Fulfilled',
        fulfilledDate: new Date().toISOString(),
        assignedAssetId: selectedAsset.id
      });

      // Reload data
      const [assetData, requestsData] = await Promise.all([
        service.getAssets(),
        service.getAssetRequests()
      ]);
      setAssets(assetData);
      setRequests(requestsData);

      setShowFulfillDialog(false);
      setSelectedRequest(null);
      setSelectedAssetForFulfillment('');

      toast({
        title: 'Success',
        description: 'Asset request fulfilled and assigned to employee',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fulfill request',
        variant: 'destructive',
      });
    }
  };

  // Handle reject request
  const handleRejectRequest = async () => {
    if (!selectedRequest || !rejectReason.trim()) {
      toast({
        title: 'Error',
        description: 'Please provide a rejection reason',
        variant: 'destructive',
      });
      return;
    }

    try {
      const service = await getAssetService();
      await service.updateAssetRequest(selectedRequest.id, {
        status: 'Rejected',
        rejectedReason: rejectReason
      });

      // Reload requests
      const updatedRequests = await service.getAssetRequests();
      setRequests(updatedRequests);

      setShowRejectDialog(false);
      setSelectedRequest(null);
      setRejectReason('');

      toast({
        title: 'Success',
        description: 'Asset request rejected',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to reject request',
        variant: 'destructive',
      });
    }
  };

  // Handle create/edit starter kit
  const handleSaveStarterKit = async () => {
    if (!starterKitForm.name || !starterKitForm.jobTitle) {
      toast({
        title: 'Error',
        description: 'Name and Job Title are required',
        variant: 'destructive',
      });
      return;
    }

    try {
      const service = await getAssetService();

      const kitData = {
        name: starterKitForm.name,
        department: starterKitForm.department,
        jobTitle: starterKitForm.jobTitle,
        description: starterKitForm.description,
        assets: starterKitForm.assetTypes, // Rename assetTypes to assets for StarterKit interface
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      if (editingKit) {
        await service.updateStarterKit(editingKit.id, kitData);
        const updatedKits = await service.getStarterKits();
        setStarterKits(updatedKits);
        toast({
          title: 'Success',
          description: 'Starter kit updated successfully',
        });
      } else {
        await service.createStarterKit(kitData);
        const updatedKits = await service.getStarterKits();
        setStarterKits(updatedKits);
        toast({
          title: 'Success',
          description: 'Starter kit created successfully',
        });
      }

      setShowStarterKitDialog(false);
      setEditingKit(null);
      setStarterKitForm({
        name: '',
        department: '',
        jobTitle: '',
        description: '',
        assetTypes: []
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save starter kit',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteStarterKit = async (kitId: string) => {
    if (!confirm('Are you sure you want to delete this starter kit?')) return;

    try {
      const service = await getAssetService();
      await service.deleteStarterKit(kitId);
      const updatedKits = await service.getStarterKits();
      setStarterKits(updatedKits);
      toast({
        title: 'Success',
        description: 'Starter kit deleted successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete starter kit',
        variant: 'destructive',
      });
    }
  };

  const addAssetTypeToKit = () => {
    setStarterKitForm(prev => ({
      ...prev,
      assetTypes: [...prev.assetTypes, {
        assetType: '',
        category: '',
        quantity: 1,
        isRequired: true,
        specifications: ''
      }]
    }));
  };

  const removeAssetTypeFromKit = (index: number) => {
    setStarterKitForm(prev => ({
      ...prev,
      assetTypes: prev.assetTypes.filter((_, i) => i !== index)
    }));
  };

  const updateAssetType = (index: number, field: string, value: any) => {
    setStarterKitForm(prev => ({
      ...prev,
      assetTypes: prev.assetTypes.map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      )
    }));
  };

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

      if (!form.type.trim()) {
        toast({
          title: 'Validation Error',
          description: 'Asset type is required.',
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
        type: form.type,
        category: form.category,
        serialNumber: form.serialNumber,
        status: form.status as Asset['status'],
        purchaseDate: form.purchaseDate,
        purchasePrice: form.purchasePrice,
        location: form.location,
        condition: form.condition as Asset['condition'],
        priority: 'Medium' as Asset['priority']
      };

      // Only add nextMaintenance if it has a value (Firebase doesn't accept undefined)
      if (form.nextMaintenance && form.nextMaintenance.trim() !== '') {
        assetData.nextMaintenance = form.nextMaintenance;
      }

      if (form.status === 'Assigned') {
        assetData.assignedTo = form.assignedTo;
      }

      console.log('Asset data to be saved:', assetData); // Debug log

      // Check if we're editing or creating
      if (selectedAssetForDetails) {
        // Update existing asset
        const updatedAsset = await service.updateAsset(selectedAssetForDetails.id, assetData);
        console.log('Asset updated:', updatedAsset);

        // Update local state
        setAssets(prev => prev.map(a => a.id === selectedAssetForDetails.id ? updatedAsset : a));

        toast({
          title: 'Success',
          description: 'Asset updated successfully',
        });
      } else {
        // Create new asset
        const newAsset = await service.createAsset(assetData);
        console.log('New asset created:', newAsset);

        setAssets(prev => [...prev, newAsset]);

        toast({
          title: 'Success',
          description: 'Asset created successfully',
        });
      }

      handleCloseDialog();
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


  // Handle edit asset
  function handleEditAsset(asset: Asset) {
    // Populate form with asset data
    setForm({
      name: asset.name,
      serialNumber: asset.serialNumber,
      category: asset.category,
      status: asset.status,
      assignedTo: asset.assignedTo || '',
      purchaseDate: asset.purchaseDate || '',
      purchasePrice: asset.purchasePrice || 0,
      location: asset.location || '',
      condition: asset.condition,
      nextMaintenance: asset.nextMaintenance || ''
    });
    setSelectedAssetForDetails(asset); // Store asset being edited
    setDialogOpen(true);
  }

  // Close dialog and reset
  function handleCloseDialog() {
    setDialogOpen(false);
    setSelectedAssetForDetails(null);
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
  }

  // Handle delete asset
  async function handleDeleteAsset(assetId: string) {
    if (!confirm('Are you sure you want to delete this asset? This action cannot be undone.')) {
      return;
    }

    try {
      const service = await getAssetService();
      await service.deleteAsset(assetId);

      setAssets(prev => prev.filter(a => a.id !== assetId));

      toast({
        title: 'Success',
        description: 'Asset deleted successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete asset',
        variant: 'destructive',
      });
    }
  }

  async function handleUnassignAsset(assetId: string) {
    if (!confirm('Are you sure you want to unassign this asset? It will be returned to available inventory.')) {
      return;
    }

    try {
      const service = await getAssetService();
      const asset = assets.find(a => a.id === assetId);

      if (!asset) return;

      // Create updated asset without assignedTo and assignedDate
      const { assignedTo, assignedDate, ...assetWithoutAssignment } = asset;
      const updatedAsset = {
        ...assetWithoutAssignment,
        status: 'Available' as const
      };

      await service.updateAsset(assetId, updatedAsset);

      setAssets(prev => prev.map(a =>
        a.id === assetId ? updatedAsset : a
      ));

      toast({
        title: 'Success',
        description: 'Asset unassigned successfully and returned to inventory',
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
    (!searchTerm ||
      asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      asset.serialNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      asset.category.toLowerCase().includes(searchTerm.toLowerCase())
    ) &&
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
                  {asset.type && <span className="font-medium text-blue-600">{asset.type}</span>}
                  {asset.type && asset.serialNumber && ' • '}
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
                <span className="text-sm font-medium text-success">₦{asset.purchasePrice.toLocaleString()}</span>
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
              {isAvailable && (
                <button
                  onClick={() => openAssignmentDialog(asset)}
                  className="flex items-center gap-1 px-3 py-1.5 hover:bg-primary/10 text-primary rounded-lg transition-colors text-sm"
                  title="Assign Asset"
                >
                  <UserPlus className="h-4 w-4" />
                  <span>Assign</span>
                </button>
              )}
              {isAssigned && (
                <button
                  onClick={() => handleUnassignAsset(asset.id)}
                  className="flex items-center gap-1 px-3 py-1.5 hover:bg-orange-100 text-orange-700 rounded-lg transition-colors text-sm"
                  title="Unassign Asset"
                >
                  <ArrowRightLeft className="h-4 w-4" />
                  <span>Unassign</span>
                </button>
              )}
              <button
                onClick={() => handleEditAsset(asset)}
                className="flex items-center gap-1 px-3 py-1.5 hover:bg-secondary/10 text-secondary rounded-lg transition-colors text-sm"
                title="Edit Asset"
              >
                <Edit className="h-4 w-4" />
                <span>Edit</span>
              </button>
              <button
                onClick={() => handleDeleteAsset(asset.id)}
                className="flex items-center gap-1 px-3 py-1.5 hover:bg-destructive/10 text-destructive rounded-lg transition-colors text-sm"
                title="Delete Asset"
              >
                <Trash2 className="h-4 w-4" />
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
            <Button
              className="bg-blue-600 hover:bg-blue-700"
              onClick={() => setDialogOpen(true)}
            >
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Asset
            </Button>
          </div>
        </div>
      </div>

      {/* Pending Asset Requests Alert */}
      {requests.filter(r => r.status === 'Pending').length > 0 && (
        <Alert className="mb-6 bg-orange-50 border-orange-200 animate-pulse-slow">
          <AlertCircle className="h-5 w-5 text-orange-600" />
          <AlertDescription>
            <div className="flex items-center justify-between">
              <div>
                <span className="font-semibold text-orange-900">
                  {requests.filter(r => r.status === 'Pending').length} Pending Asset Request{requests.filter(r => r.status === 'Pending').length > 1 ? 's' : ''}
                </span>
                <p className="text-sm text-orange-700 mt-1">
                  Employees are waiting for asset assignments. Click on a request below to review and fulfill.
                </p>
              </div>
              <Button
                variant="outline"
                className="bg-orange-100 hover:bg-orange-200 text-orange-900 border-orange-300"
                onClick={() => {
                  // Switch to Asset Requests tab
                  setActiveTab('requests');
                }}
              >
                View Requests
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Package className="h-4 w-4 text-blue-600" />
              <div className="ml-2">
                <p className="text-sm font-medium text-muted-foreground">Total Assets</p>
                <p className="text-2xl font-bold">{totalAssets}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Users className="h-4 w-4 text-green-600" />
              <div className="ml-2">
                <p className="text-sm font-medium text-muted-foreground">Assigned</p>
                <p className="text-2xl font-bold">{assignedAssets}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <CheckCircle className="h-4 w-4 text-yellow-600" />
              <div className="ml-2">
                <p className="text-sm font-medium text-muted-foreground">Available</p>
                <p className="text-2xl font-bold">{availableAssets}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Wrench className="h-4 w-4 text-red-600" />
              <div className="ml-2">
                <p className="text-sm font-medium text-muted-foreground">Under Repair</p>
                <p className="text-2xl font-bold">{underRepairAssets}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <DollarSign className="h-4 w-4 text-purple-600" />
              <div className="ml-2">
                <p className="text-sm font-medium text-muted-foreground">Total Value</p>
                <p className="text-2xl font-bold">${totalValue.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="assets">Asset Inventory</TabsTrigger>
          <TabsTrigger value="assignments">Employee Assignments</TabsTrigger>
          <TabsTrigger value="requests">Asset Requests</TabsTrigger>
          <TabsTrigger value="starterkits">
            <span className="flex items-center gap-2">
              Starter Kits
              {(() => {
                const newEmployeesCount = employees.filter(employee =>
                  !assets.some(asset =>
                    asset.assignedTo === employee.id ||
                    asset.assignedTo === employee.name ||
                    asset.assignedTo === (employee as any).employeeId
                  )
                ).length;

                return newEmployeesCount > 0 ? (
                  <Badge className="bg-orange-500 text-white ml-1">{newEmployeesCount}</Badge>
                ) : null;
              })()}
            </span>
          </TabsTrigger>
        </TabsList>

        {/* Asset Inventory Tab */}
        <TabsContent value="assets" className="space-y-6">
          <Card className="bg-white shadow-lg border-0 overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
              <div className="flex items-center justify-between gap-4">
                <CardTitle className="text-2xl font-bold text-gray-800">Asset Inventory</CardTitle>

                {/* Search and Collapsible Filters */}
                <div className="flex flex-col gap-2 flex-1 max-w-2xl">
                  <div className="flex items-center gap-3">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <input
                        type="text"
                        placeholder="Search assets..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-input rounded-lg bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                      />
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setFiltersExpanded(!filtersExpanded)}
                      className="flex items-center gap-2"
                    >
                      <Filter className="h-4 w-4" />
                      Filters
                      {filtersExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </Button>
                  </div>

                  {/* Collapsible Filters */}
                  {filtersExpanded && (
                    <div className="flex gap-2">
                      <select
                        value={categoryFilter}
                        onChange={e => setCategoryFilter(e.target.value)}
                        className="px-3 py-1.5 border border-input rounded-lg bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                      >
                        <option value="">All Categories</option>
                        {categoryOptions.map(category => (
                          <option key={category} value={category}>{category}</option>
                        ))}
                      </select>
                      <select
                        value={statusFilter}
                        onChange={e => setStatusFilter(e.target.value)}
                        className="px-3 py-1.5 border border-input rounded-lg bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                      >
                        <option value="">All Statuses</option>
                        {statusOptions.map(status => (
                          <option key={status} value={status}>{status}</option>
                        ))}
                      </select>
                      <select
                        value={locationFilter}
                        onChange={e => setLocationFilter(e.target.value)}
                        className="px-3 py-1.5 border border-input rounded-lg bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                      >
                        <option value="">All Locations</option>
                        {locationOptions.map(location => (
                          <option key={location} value={location}>{location}</option>
                        ))}
                      </select>
                      {(categoryFilter || statusFilter || locationFilter) && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setCategoryFilter('');
                            setStatusFilter('');
                            setLocationFilter('');
                          }}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50 text-xs"
                        >
                          Clear
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <AtomicTanstackTable
                data={filteredAssets}
                columns={columns}
                showGlobalFilter={false}
                pageSizeOptions={[10, 20, 50]}
                initialPageSize={10}
                className="table-modern"
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Employee Assignments Tab */}
        <TabsContent value="assignments" className="space-y-6">
          <EmployeeAssetAssignments
            assets={assets}
            employees={employees}
            onAssignAsset={handleAssignAsset}
            onCreateNewEmployeeKit={handleCreateNewEmployeeKit}
          />
        </TabsContent>

        {/* Asset Requests Tab */}
        <TabsContent value="requests" className="space-y-6" id="asset-requests-section">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Asset Requests</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    Review and approve employee asset requests
                  </p>
                </div>
                <Badge className="text-lg px-4 py-2 bg-yellow-100 text-yellow-800">
                  Pending: {requests.filter(r => r.status === 'Pending').length}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              {requests.length === 0 ? (
                <div className="text-center py-12">
                  <Package className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No Asset Requests</h3>
                  <p className="text-gray-600">
                    There are no asset requests at the moment.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {requests.map(request => (
                    <Card key={request.id} className="border-2">
                      <CardContent className="pt-6">
                        <div className="flex items-start justify-between">
                          <div className="space-y-3 flex-1">
                            <div className="flex items-center space-x-3">
                              <h3 className="font-bold text-lg">{request.assetType}</h3>
                              <Badge className="bg-gray-100 text-gray-800">{request.category}</Badge>
                              <Badge className={
                                request.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                                  request.status === 'Approved' ? 'bg-green-100 text-green-800' :
                                    request.status === 'Rejected' ? 'bg-red-100 text-red-800' :
                                      'bg-blue-100 text-blue-800'
                              }>
                                {request.status}
                              </Badge>
                              <Badge className={
                                request.priority === 'Urgent' ? 'bg-red-100 text-red-800' :
                                  request.priority === 'High' ? 'bg-orange-100 text-orange-800' :
                                    request.priority === 'Medium' ? 'bg-blue-100 text-blue-800' :
                                      'bg-gray-100 text-gray-800'
                              }>
                                {request.priority}
                              </Badge>
                            </div>

                            <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
                              <div>
                                <span className="font-medium">Employee:</span> {request.employeeName} ({request.employeeId})
                              </div>
                              <div>
                                <span className="font-medium">Requested:</span> {new Date(request.requestedDate?.toDate ? request.requestedDate.toDate() : request.requestedDate).toLocaleDateString()}
                              </div>
                            </div>

                            <div className="p-3 bg-gray-50 rounded-lg">
                              <p className="text-sm font-medium text-gray-700 mb-1">Justification:</p>
                              <p className="text-sm text-gray-600">{request.justification}</p>
                            </div>

                            {request.status === 'Approved' && (
                              <div className="space-y-2">
                                <div className="p-2 bg-green-50 rounded text-sm text-green-700">
                                  ✅ Approved{request.approvedBy && ` by ${request.approvedBy}`}
                                </div>
                                <Button
                                  onClick={() => {
                                    setSelectedRequest(request);
                                    setShowFulfillDialog(true);
                                  }}
                                  className="w-full bg-blue-600 hover:bg-blue-700"
                                  variant="default"
                                >
                                  <Package className="h-4 w-4 mr-2" />
                                  Assign Asset to Fulfill Request
                                </Button>
                              </div>
                            )}

                            {request.status === 'Rejected' && request.rejectedReason && (
                              <div className="p-2 bg-red-50 rounded text-sm text-red-700">
                                ❌ Rejected: {request.rejectedReason}
                              </div>
                            )}

                            {request.status === 'Pending' && (
                              <div className="flex space-x-2 pt-2">
                                <Button
                                  onClick={() => handleApproveRequest(request)}
                                  className="bg-green-600 hover:bg-green-700"
                                  variant="default"
                                >
                                  <CheckCircle className="h-4 w-4 mr-2" />
                                  Approve & Assign Asset
                                </Button>
                                <Button
                                  variant="destructive"
                                  onClick={() => {
                                    setSelectedRequest(request);
                                    setShowRejectDialog(true);
                                  }}
                                >
                                  <AlertTriangle className="h-4 w-4 mr-2" />
                                  Reject
                                </Button>
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Starter Kits Tab */}
        <TabsContent value="starterkits" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Starter Kit Templates</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    Configure asset packages for new employees by role
                  </p>
                </div>
                <Button
                  className="bg-blue-600 hover:bg-blue-700"
                  onClick={() => {
                    setEditingKit(null);
                    setStarterKitForm({
                      name: '',
                      department: '',
                      jobTitle: '',
                      description: '',
                      assetTypes: []
                    });
                    setShowStarterKitDialog(true);
                  }}
                >
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Create Starter Kit
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {starterKits.length === 0 ? (
                <div className="text-center py-12">
                  <Package className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No Starter Kits Configured</h3>
                  <p className="text-gray-600 mb-4">
                    Create starter kit templates to automatically assign assets to new employees based on their role.
                  </p>
                  <Button onClick={() => setShowStarterKitDialog(true)}>
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Create Your First Starter Kit
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {starterKits.map(kit => (
                    <Card key={kit.id} className="border-2">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <CardTitle className="text-lg">{kit.name}</CardTitle>
                            <p className="text-sm text-muted-foreground mt-1">
                              {kit.jobTitle} • {kit.department}
                            </p>
                          </div>
                          <Badge className={kit.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                            {kit.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-gray-600 mb-3">{kit.description}</p>
                        <div className="space-y-2 mb-4">
                          <p className="text-sm font-medium">Assets in Kit:</p>
                          {kit.assets && kit.assets.length > 0 ? (
                            <div className="space-y-1">
                              {kit.assets.map((asset: any, idx: number) => (
                                <div key={idx} className="flex items-center justify-between text-sm p-2 bg-gray-50 rounded">
                                  <span>
                                    {asset.quantity}x {asset.assetType} ({asset.category})
                                    {asset.isRequired && <Badge className="ml-2 bg-red-100 text-red-800 text-xs">Required</Badge>}
                                  </span>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-xs text-muted-foreground">No assets defined</p>
                          )}
                        </div>
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            variant="default"
                            onClick={() => {
                              setEditingKit(kit);
                              setStarterKitForm({
                                name: kit.name,
                                department: kit.department,
                                jobTitle: kit.jobTitle,
                                description: kit.description,
                                assetTypes: kit.assets || []
                              });
                              setShowStarterKitDialog(true);
                            }}
                            className="flex-1"
                          >
                            <Edit className="h-4 w-4 mr-1" />
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDeleteStarterKit(kit.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Employees Needing Starter Kits */}
          <Card className="border-2 border-orange-200">
            <CardHeader className="bg-orange-50">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-orange-900 flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Employees Needing Starter Kits
                  </CardTitle>
                  <p className="text-sm text-orange-700 mt-1">
                    New employees who haven't been assigned their starter kit yet
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              {(() => {
                // Get employees without any assigned assets (new employees)
                const newEmployees = employees.filter(employee =>
                  !assets.some(asset =>
                    asset.assignedTo === employee.id ||
                    asset.assignedTo === employee.name ||
                    asset.assignedTo === (employee as any).employeeId
                  )
                );

                if (newEmployees.length === 0) {
                  return (
                    <div className="text-center py-8">
                      <CheckCircle className="h-12 w-12 mx-auto text-green-500 mb-3" />
                      <p className="text-gray-600">All employees have been assigned their starter kits! 🎉</p>
                    </div>
                  );
                }

                return (
                  <div className="space-y-3">
                    <Alert className="bg-orange-50 border-orange-200">
                      <AlertCircle className="h-4 w-4 text-orange-600" />
                      <AlertDescription className="text-orange-800">
                        <strong>{newEmployees.length}</strong> employee{newEmployees.length !== 1 ? 's' : ''} waiting for starter kit assignment
                      </AlertDescription>
                    </Alert>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {newEmployees.map(employee => {
                        const jobTitle = (employee as any).position || (employee as any).role || 'No job title';
                        const matchingKit = starterKits.find(kit =>
                          kit.jobTitle.toLowerCase() === jobTitle.toLowerCase() && kit.isActive
                        );

                        return (
                          <Card key={employee.id || (employee as any).employeeId || employee.name} className="border-l-4 border-l-orange-500">
                            <CardHeader className="pb-3">
                              <div className="flex items-start justify-between">
                                <div className="flex items-center gap-2">
                                  <User className="h-5 w-5 text-blue-600" />
                                  <div>
                                    <CardTitle className="text-base">{employee.name}</CardTitle>
                                    <p className="text-xs text-muted-foreground mt-0.5">{jobTitle}</p>
                                  </div>
                                </div>
                                <Badge className="bg-orange-100 text-orange-800">New</Badge>
                              </div>
                            </CardHeader>
                            <CardContent>
                              {matchingKit ? (
                                <div className="space-y-3">
                                  <div className="p-2 bg-blue-50 border border-blue-200 rounded">
                                    <p className="text-xs font-medium text-blue-900">
                                      ✅ Kit Available: {matchingKit.name}
                                    </p>
                                    <p className="text-xs text-blue-700 mt-1">
                                      {matchingKit.assets?.length || 0} asset type{(matchingKit.assets?.length || 0) !== 1 ? 's' : ''}
                                    </p>
                                  </div>
                                  <Button
                                    size="sm"
                                    onClick={() => handleCreateNewEmployeeKit(employee.id || (employee as any).employeeId)}
                                    className="w-full bg-green-600 hover:bg-green-700"
                                  >
                                    <Package className="h-4 w-4 mr-2" />
                                    Auto-Assign Kit
                                  </Button>
                                </div>
                              ) : (
                                <div className="space-y-3">
                                  <div className="p-2 bg-yellow-50 border border-yellow-200 rounded">
                                    <p className="text-xs font-medium text-yellow-900">
                                      ⚠️ No Kit for "{jobTitle}"
                                    </p>
                                    <p className="text-xs text-yellow-700 mt-1">
                                      Create a kit for this role first
                                    </p>
                                  </div>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => {
                                      setStarterKitForm({
                                        name: `${jobTitle} Kit`,
                                        department: (employee as any).department || '',
                                        jobTitle: jobTitle,
                                        description: `Starter kit for ${jobTitle} role`,
                                        assetTypes: []
                                      });
                                      setShowStarterKitDialog(true);
                                    }}
                                    className="w-full border-blue-300 text-blue-700 hover:bg-blue-50"
                                  >
                                    <Plus className="h-4 w-4 mr-2" />
                                    Create Kit
                                  </Button>
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                  </div>
                );
              })()}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Add/Edit Asset Dialog */}
      <Dialog open={dialogOpen} onOpenChange={handleCloseDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{selectedAssetForDetails ? 'Edit Asset' : 'Add New Asset'}</DialogTitle>
            <DialogDescription>
              {selectedAssetForDetails
                ? 'Update the asset details below.'
                : 'Fill in the details below to add a new asset to the system.'}
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

      {/* Fulfill Request Dialog - Select Asset */}
      <Dialog open={showFulfillDialog} onOpenChange={setShowFulfillDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Fulfill Asset Request</DialogTitle>
            <DialogDescription>
              Select an available asset to assign to {selectedRequest?.employeeName}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {selectedRequest && (
              <div className="p-3 bg-blue-50 rounded-lg">
                <p className="text-sm font-medium">Request Details:</p>
                {selectedRequest.assetName && (
                  <p className="text-sm font-semibold text-blue-900 mt-1">
                    Requested Asset: {selectedRequest.assetName}
                  </p>
                )}
                <p className="text-xs text-muted-foreground mt-1">
                  Type: {selectedRequest.assetType} • Category: {selectedRequest.category} • Priority: {selectedRequest.priority}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Justification: {selectedRequest.justification}
                </p>
              </div>
            )}

            <div>
              <Label htmlFor="assetSelect">Select Asset to Assign *</Label>
              <select
                id="assetSelect"
                value={selectedAssetForFulfillment}
                onChange={(e) => setSelectedAssetForFulfillment(e.target.value)}
                className="w-full p-2 border rounded-md"
              >
                <option value="">-- Select an available asset --</option>
                {assets
                  .filter(a => {
                    // Must be available and not assigned
                    const isAvailable = a.status === 'Available';
                    const notAssigned = !a.assignedTo || a.assignedTo.trim() === '';
                    return isAvailable && notAssigned;
                  })
                  .filter(a => {
                    // Priority 1: Match by specific asset name if provided
                    if (selectedRequest?.assetName) {
                      return a.name.toLowerCase() === selectedRequest.assetName.toLowerCase();
                    }

                    // Priority 2: Match by asset type if provided
                    if (selectedRequest?.assetType) {
                      const typeMatch = a.type && a.type.toLowerCase() === selectedRequest.assetType.toLowerCase();
                      if (typeMatch) return true;
                    }

                    // Priority 3: Match by category
                    if (selectedRequest?.category) {
                      return a.category.toLowerCase().includes(selectedRequest.category.toLowerCase());
                    }

                    return true;
                  })
                  .map(asset => (
                    <option key={asset.id} value={asset.id}>
                      {asset.name} ({asset.serialNumber}) - {asset.type || asset.category} - {asset.condition}
                    </option>
                  ))
                }
              </select>
              <p className="text-xs text-muted-foreground mt-1">
                {selectedRequest?.assetName && `Showing: ${selectedRequest.assetName}`}
                {!selectedRequest?.assetName && selectedRequest?.assetType && `Showing: ${selectedRequest.assetType} assets`}
                {!selectedRequest?.assetName && !selectedRequest?.assetType && selectedRequest?.category && `Showing: ${selectedRequest.category} assets`}
                {!selectedRequest?.assetName && !selectedRequest?.assetType && !selectedRequest?.category && 'Showing all available assets'}
              </p>
            </div>

            {/* Show asset details if selected */}
            {selectedAssetForFulfillment && (() => {
              const asset = assets.find(a => a.id === selectedAssetForFulfillment);
              return asset ? (
                <div className="p-3 bg-gray-50 rounded-lg border">
                  <p className="text-sm font-semibold mb-2">Selected Asset Details:</p>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div><span className="font-medium">Name:</span> {asset.name}</div>
                    <div><span className="font-medium">Serial:</span> {asset.serialNumber}</div>
                    <div><span className="font-medium">Category:</span> {asset.category}</div>
                    <div><span className="font-medium">Condition:</span> {asset.condition}</div>
                    <div><span className="font-medium">Location:</span> {asset.location || 'N/A'}</div>
                    <div><span className="font-medium">Status:</span>
                      <Badge className="ml-1 bg-green-100 text-green-800">{asset.status}</Badge>
                    </div>
                  </div>
                </div>
              ) : null;
            })()}

            <div className="flex space-x-2">
              <Button
                onClick={handleFulfillRequest}
                className="flex-1 bg-green-600 hover:bg-green-700"
                disabled={!selectedAssetForFulfillment}
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Assign Asset & Fulfill Request
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setShowFulfillDialog(false);
                  setSelectedRequest(null);
                  setSelectedAssetForFulfillment('');
                }}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Reject Request Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Reject Asset Request</DialogTitle>
            <DialogDescription>
              Provide a reason for rejecting this request
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {selectedRequest && (
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-sm font-medium">Request: {selectedRequest.assetType}</p>
                <p className="text-xs text-muted-foreground">From: {selectedRequest.employeeName}</p>
              </div>
            )}
            <div>
              <Label htmlFor="rejectReason">Rejection Reason *</Label>
              <Textarea
                id="rejectReason"
                placeholder="Explain why this request is being rejected..."
                rows={4}
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
              />
            </div>
            <div className="flex space-x-2">
              <Button
                onClick={handleRejectRequest}
                variant="destructive"
                className="flex-1"
              >
                Reject Request
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setShowRejectDialog(false);
                  setSelectedRequest(null);
                  setRejectReason('');
                }}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Starter Kit Dialog */}
      <Dialog open={showStarterKitDialog} onOpenChange={(open) => {
        setShowStarterKitDialog(open);
        if (!open) {
          setEditingKit(null);
          setStarterKitForm({
            name: '',
            department: '',
            jobTitle: '',
            description: '',
            assetTypes: []
          });
        }
      }}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingKit ? 'Edit' : 'Create'} Starter Kit</DialogTitle>
            <DialogDescription>
              Configure assets that should be automatically assigned to new employees in specific roles
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="kitName">Kit Name *</Label>
                <Input
                  id="kitName"
                  placeholder="e.g., Software Developer Kit"
                  value={starterKitForm.name}
                  onChange={(e) => setStarterKitForm(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="jobTitle">Job Title *</Label>
                <Input
                  id="jobTitle"
                  placeholder="e.g., Software Developer"
                  value={starterKitForm.jobTitle}
                  onChange={(e) => setStarterKitForm(prev => ({ ...prev, jobTitle: e.target.value }))}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="department">Department</Label>
              <Input
                id="department"
                placeholder="e.g., Engineering"
                value={starterKitForm.department}
                onChange={(e) => setStarterKitForm(prev => ({ ...prev, department: e.target.value }))}
              />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Brief description of this starter kit"
                rows={2}
                value={starterKitForm.description}
                onChange={(e) => setStarterKitForm(prev => ({ ...prev, description: e.target.value }))}
              />
            </div>

            <div className="border-t pt-4">
              <div className="flex items-center justify-between mb-3">
                <Label className="text-base">Assets in Kit</Label>
                <Button size="sm" onClick={addAssetTypeToKit} variant="default">
                  <Plus className="h-4 w-4 mr-1" />
                  Add Asset Type
                </Button>
              </div>

              {starterKitForm.assetTypes.length === 0 ? (
                <div className="text-center py-8 bg-gray-50 rounded-lg">
                  <Package className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                  <p className="text-sm text-muted-foreground">No assets added yet. Click "Add Asset Type" to start.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {starterKitForm.assetTypes.map((assetType, index) => (
                    <div key={index} className="p-4 border rounded-lg bg-gray-50 space-y-3">
                      <div className="grid grid-cols-3 gap-3">
                        <div>
                          <Label className="text-xs">Asset Type *</Label>
                          <select
                            value={assetType.assetType}
                            onChange={(e) => updateAssetType(index, 'assetType', e.target.value)}
                            className="w-full h-9 px-3 border rounded-md text-sm"
                          >
                            <option value="">Select Type</option>
                            <option value="Laptop">Laptop</option>
                            <option value="Desktop">Desktop</option>
                            <option value="Monitor">Monitor</option>
                            <option value="Phone">Phone</option>
                            <option value="Tablet">Tablet</option>
                            <option value="Keyboard">Keyboard</option>
                            <option value="Mouse">Mouse</option>
                            <option value="Headset">Headset</option>
                            <option value="Desk">Desk</option>
                            <option value="Chair">Chair</option>
                            <option value="Printer">Printer</option>
                            <option value="Scanner">Scanner</option>
                            <option value="Projector">Projector</option>
                            <option value="Server">Server</option>
                            <option value="Router">Router</option>
                            <option value="Other">Other</option>
                          </select>
                        </div>
                        <div>
                          <Label className="text-xs">Category *</Label>
                          <select
                            value={assetType.category}
                            onChange={(e) => updateAssetType(index, 'category', e.target.value)}
                            className="w-full h-9 px-3 border rounded-md text-sm"
                          >
                            <option value="">Select</option>
                            <option value="IT Equipment">IT Equipment</option>
                            <option value="Furniture">Furniture</option>
                            <option value="Mobile Device">Mobile Device</option>
                            <option value="Vehicle">Vehicle</option>
                            <option value="Office Equipment">Office Equipment</option>
                            <option value="Other">Other</option>
                          </select>
                        </div>
                        <div>
                          <Label className="text-xs">Quantity *</Label>
                          <Input
                            type="number"
                            min="1"
                            value={assetType.quantity}
                            onChange={(e) => updateAssetType(index, 'quantity', parseInt(e.target.value) || 1)}
                            className="h-9"
                          />
                        </div>
                      </div>
                      <div>
                        <Label className="text-xs">Specifications (Optional)</Label>
                        <Input
                          placeholder="e.g., MacBook Pro 16-inch, M1 Pro or better"
                          value={assetType.specifications}
                          onChange={(e) => updateAssetType(index, 'specifications', e.target.value)}
                          className="h-9"
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id={`required-${index}`}
                            checked={assetType.isRequired}
                            onChange={(e) => updateAssetType(index, 'isRequired', e.target.checked)}
                            className="h-4 w-4"
                          />
                          <Label htmlFor={`required-${index}`} className="text-sm cursor-pointer">
                            Required (must be assigned)
                          </Label>
                        </div>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => removeAssetTypeFromKit(index)}
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Remove
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex space-x-2 pt-4 border-t">
              <Button
                onClick={handleSaveStarterKit}
                className="flex-1 bg-blue-600 hover:bg-blue-700"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                {editingKit ? 'Update' : 'Create'} Starter Kit
              </Button>
              <Button
                variant="secondary"
                onClick={() => {
                  setShowStarterKitDialog(false);
                  setEditingKit(null);
                  setStarterKitForm({
                    name: '',
                    department: '',
                    jobTitle: '',
                    description: '',
                    assetTypes: []
                  });
                }}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}