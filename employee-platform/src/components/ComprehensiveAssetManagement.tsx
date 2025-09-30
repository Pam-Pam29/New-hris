import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Textarea } from './ui/textarea';
import { Progress } from './ui/progress';
import { useToast } from '../hooks/use-toast';
import {
    Package,
    Plus,
    Search,
    Filter,
    QrCode,
    Camera,
    FileText,
    Download,
    Upload,
    Settings,
    Laptop,
    Monitor,
    Smartphone,
    Car,
    Wrench,
    AlertTriangle,
    CheckCircle,
    Clock,
    Eye,
    Edit,
    Trash2,
    MoreHorizontal,
    MapPin,
    Calendar,
    DollarSign,
    TrendingUp,
    Users,
    BarChart3
} from 'lucide-react';
import {
    getComprehensiveHRDataFlowService,
    Asset,
    AssetAssignment,
    AssetRequest
} from '../services/comprehensiveHRDataFlow';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from './ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from './ui/select';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from './ui/table';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from './ui/dropdown-menu';
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from './ui/tabs';

interface ComprehensiveAssetManagementProps {
    employeeId: string;
    mode: 'employee' | 'hr';
}

export function ComprehensiveAssetManagement({ employeeId, mode }: ComprehensiveAssetManagementProps) {
    const [assets, setAssets] = useState<Asset[]>([]);
    const [assignments, setAssignments] = useState<AssetAssignment[]>([]);
    const [requests, setRequests] = useState<AssetRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'overview' | 'inventory' | 'assignments' | 'requests' | 'maintenance'>('overview');

    // Asset form state (HR only)
    const [isAssetDialogOpen, setIsAssetDialogOpen] = useState(false);
    const [assetForm, setAssetForm] = useState({
        name: '',
        category: 'laptop' as Asset['category'],
        brand: '',
        model: '',
        serialNumber: '',
        specifications: {} as Record<string, any>,
        purchaseInfo: {
            vendor: '',
            purchaseDate: '',
            purchasePrice: 0,
            warrantyExpiry: '',
            invoiceNumber: ''
        },
        condition: 'new' as Asset['condition'],
        location: '',
        photos: [] as File[]
    });

    // Request form state
    const [isRequestDialogOpen, setIsRequestDialogOpen] = useState(false);
    const [requestForm, setRequestForm] = useState({
        requestType: 'new' as AssetRequest['requestType'],
        assetCategory: '',
        requestedItem: '',
        businessJustification: '',
        urgencyLevel: 'medium' as AssetRequest['urgencyLevel'],
        estimatedCost: 0,
        preferredSpecs: {} as Record<string, any>
    });

    // Assignment form state (HR only)
    const [isAssignmentDialogOpen, setIsAssignmentDialogOpen] = useState(false);
    const [assignmentForm, setAssignmentForm] = useState({
        assetId: '',
        employeeId: '',
        assignmentReason: '',
        terms: '',
        condition: 'good',
        photos: [] as File[]
    });

    const [filters, setFilters] = useState({
        category: 'all',
        status: 'all',
        condition: 'all',
        location: 'all'
    });

    const { toast } = useToast();

    useEffect(() => {
        initializeAssetData();
    }, [employeeId, mode]);

    const initializeAssetData = async () => {
        try {
            setLoading(true);
            const dataFlowService = await getComprehensiveHRDataFlowService();

            // Load assets (HR sees all, employees see assigned)
            const assetData = await dataFlowService.getAssets();
            setAssets(assetData);

            // Load assignments
            const assignmentData = mode === 'hr'
                ? await dataFlowService.getAssetAssignments()
                : await dataFlowService.getAssetAssignments(employeeId);
            setAssignments(assignmentData);

            // Load requests
            const requestData = mode === 'hr'
                ? await dataFlowService.getAssetRequests()
                : await dataFlowService.getAssetRequests(employeeId);
            setRequests(requestData);

            setLoading(false);
        } catch (error) {
            console.error('Error initializing asset data:', error);
            setLoading(false);
            toast({
                title: "Error",
                description: "Failed to load asset data",
                variant: "destructive"
            });
        }
    };

    const handleCreateAsset = async () => {
        try {
            if (!assetForm.name || !assetForm.brand || !assetForm.model || !assetForm.serialNumber) {
                toast({
                    title: "Validation Error",
                    description: "Please fill in all required fields",
                    variant: "destructive"
                });
                return;
            }

            const dataFlowService = await getComprehensiveHRDataFlowService();

            const newAsset: Omit<Asset, 'id' | 'createdAt' | 'updatedAt'> = {
                assetTag: `AST-${Date.now()}`,
                name: assetForm.name,
                category: assetForm.category,
                brand: assetForm.brand,
                model: assetForm.model,
                serialNumber: assetForm.serialNumber,
                specifications: assetForm.specifications,
                purchaseInfo: {
                    ...assetForm.purchaseInfo,
                    purchaseDate: new Date(assetForm.purchaseInfo.purchaseDate),
                    warrantyExpiry: assetForm.purchaseInfo.warrantyExpiry ? new Date(assetForm.purchaseInfo.warrantyExpiry) : undefined
                },
                condition: assetForm.condition,
                status: 'available',
                location: assetForm.location,
                qrCode: `QR-${Date.now()}`,
                photos: []
            };

            await dataFlowService.createAsset(newAsset);

            toast({
                title: "Success",
                description: "Asset created successfully",
            });

            setIsAssetDialogOpen(false);
            resetAssetForm();
            initializeAssetData();
        } catch (error) {
            console.error('Error creating asset:', error);
            toast({
                title: "Error",
                description: "Failed to create asset",
                variant: "destructive"
            });
        }
    };

    const handleCreateRequest = async () => {
        try {
            if (!requestForm.assetCategory || !requestForm.requestedItem || !requestForm.businessJustification) {
                toast({
                    title: "Validation Error",
                    description: "Please fill in all required fields",
                    variant: "destructive"
                });
                return;
            }

            const dataFlowService = await getComprehensiveHRDataFlowService();

            const newRequest: Omit<AssetRequest, 'id' | 'createdAt' | 'updatedAt'> = {
                employeeId,
                employeeName: 'Current Employee', // In real app, get from profile
                requestType: requestForm.requestType,
                assetCategory: requestForm.assetCategory,
                requestedItem: requestForm.requestedItem,
                businessJustification: requestForm.businessJustification,
                urgencyLevel: requestForm.urgencyLevel,
                estimatedCost: requestForm.estimatedCost,
                preferredSpecs: requestForm.preferredSpecs,
                status: 'pending',
                approvalWorkflow: [
                    {
                        step: 1,
                        approver: 'Manager',
                        status: 'pending'
                    }
                ]
            };

            await dataFlowService.createAssetRequest(newRequest);

            toast({
                title: "Success",
                description: "Asset request submitted successfully",
            });

            setIsRequestDialogOpen(false);
            resetRequestForm();
            initializeAssetData();
        } catch (error) {
            console.error('Error creating asset request:', error);
            toast({
                title: "Error",
                description: "Failed to submit asset request",
                variant: "destructive"
            });
        }
    };

    const handleAssignAsset = async () => {
        try {
            if (!assignmentForm.assetId || !assignmentForm.employeeId || !assignmentForm.assignmentReason) {
                toast({
                    title: "Validation Error",
                    description: "Please fill in all required fields",
                    variant: "destructive"
                });
                return;
            }

            const dataFlowService = await getComprehensiveHRDataFlowService();
            const selectedAsset = assets.find(a => a.id === assignmentForm.assetId);

            if (!selectedAsset) {
                toast({
                    title: "Error",
                    description: "Selected asset not found",
                    variant: "destructive"
                });
                return;
            }

            const newAssignment: Omit<AssetAssignment, 'id' | 'createdAt' | 'updatedAt'> = {
                assetId: assignmentForm.assetId,
                assetName: selectedAsset.name,
                employeeId: assignmentForm.employeeId,
                employeeName: 'Employee Name', // In real app, get from employee data
                assignedDate: new Date(),
                assignmentReason: assignmentForm.assignmentReason,
                condition: {
                    atAssignment: assignmentForm.condition
                },
                photos: {
                    assignment: []
                },
                terms: assignmentForm.terms,
                digitalSignature: `SIG-${Date.now()}`,
                status: 'active'
            };

            await dataFlowService.assignAsset(newAssignment);

            toast({
                title: "Success",
                description: "Asset assigned successfully",
            });

            setIsAssignmentDialogOpen(false);
            resetAssignmentForm();
            initializeAssetData();
        } catch (error) {
            console.error('Error assigning asset:', error);
            toast({
                title: "Error",
                description: "Failed to assign asset",
                variant: "destructive"
            });
        }
    };

    const resetAssetForm = () => {
        setAssetForm({
            name: '',
            category: 'laptop',
            brand: '',
            model: '',
            serialNumber: '',
            specifications: {},
            purchaseInfo: {
                vendor: '',
                purchaseDate: '',
                purchasePrice: 0,
                warrantyExpiry: '',
                invoiceNumber: ''
            },
            condition: 'new',
            location: '',
            photos: []
        });
    };

    const resetRequestForm = () => {
        setRequestForm({
            requestType: 'new',
            assetCategory: '',
            requestedItem: '',
            businessJustification: '',
            urgencyLevel: 'medium',
            estimatedCost: 0,
            preferredSpecs: {}
        });
    };

    const resetAssignmentForm = () => {
        setAssignmentForm({
            assetId: '',
            employeeId: '',
            assignmentReason: '',
            terms: '',
            condition: 'good',
            photos: []
        });
    };

    const getCategoryIcon = (category: Asset['category']) => {
        const iconClass = "h-5 w-5";
        switch (category) {
            case 'laptop':
                return <Laptop className={iconClass} />;
            case 'monitor':
                return <Monitor className={iconClass} />;
            case 'phone':
                return <Smartphone className={iconClass} />;
            case 'vehicle':
                return <Car className={iconClass} />;
            case 'equipment':
                return <Settings className={iconClass} />;
            default:
                return <Package className={iconClass} />;
        }
    };

    const getStatusBadge = (status: Asset['status']) => {
        switch (status) {
            case 'available':
                return <Badge className="bg-green-100 text-green-800">Available</Badge>;
            case 'assigned':
                return <Badge className="bg-blue-100 text-blue-800">Assigned</Badge>;
            case 'maintenance':
                return <Badge className="bg-yellow-100 text-yellow-800">Maintenance</Badge>;
            case 'retired':
                return <Badge className="bg-gray-100 text-gray-800">Retired</Badge>;
            case 'lost':
                return <Badge className="bg-red-100 text-red-800">Lost</Badge>;
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };

    const getConditionBadge = (condition: Asset['condition']) => {
        switch (condition) {
            case 'new':
                return <Badge className="bg-green-100 text-green-800">New</Badge>;
            case 'good':
                return <Badge className="bg-blue-100 text-blue-800">Good</Badge>;
            case 'fair':
                return <Badge className="bg-yellow-100 text-yellow-800">Fair</Badge>;
            case 'poor':
                return <Badge className="bg-orange-100 text-orange-800">Poor</Badge>;
            case 'damaged':
                return <Badge className="bg-red-100 text-red-800">Damaged</Badge>;
            default:
                return <Badge variant="outline">{condition}</Badge>;
        }
    };

    const getRequestStatusBadge = (status: AssetRequest['status']) => {
        switch (status) {
            case 'approved':
                return <Badge className="bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 mr-1" />Approved</Badge>;
            case 'rejected':
                return <Badge className="bg-red-100 text-red-800">Rejected</Badge>;
            case 'fulfilled':
                return <Badge className="bg-blue-100 text-blue-800">Fulfilled</Badge>;
            case 'cancelled':
                return <Badge variant="outline">Cancelled</Badge>;
            default:
                return <Badge className="bg-yellow-100 text-yellow-800"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
        }
    };

    const getUrgencyBadge = (urgency: AssetRequest['urgencyLevel']) => {
        switch (urgency) {
            case 'critical':
                return <Badge variant="destructive" className="animate-pulse">Critical</Badge>;
            case 'high':
                return <Badge variant="destructive">High</Badge>;
            case 'medium':
                return <Badge variant="secondary">Medium</Badge>;
            case 'low':
                return <Badge variant="outline">Low</Badge>;
        }
    };

    const getFilteredAssets = () => {
        let filtered = assets;

        if (filters.category !== 'all') {
            filtered = filtered.filter(asset => asset.category === filters.category);
        }

        if (filters.status !== 'all') {
            filtered = filtered.filter(asset => asset.status === filters.status);
        }

        if (filters.condition !== 'all') {
            filtered = filtered.filter(asset => asset.condition === filters.condition);
        }

        return filtered;
    };

    const getMyAssignedAssets = () => {
        return assignments.filter(assignment =>
            assignment.employeeId === employeeId && assignment.status === 'active'
        );
    };

    if (loading) {
        return (
            <div className="space-y-6">
                <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Loading asset management data...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold">Asset Management</h2>
                    <p className="text-muted-foreground">
                        {mode === 'employee'
                            ? 'View your assigned assets and submit requests'
                            : 'Manage company assets, assignments, and requests'
                        }
                    </p>
                </div>
                <div className="flex space-x-2">
                    {mode === 'hr' && (
                        <>
                            <Dialog open={isAssetDialogOpen} onOpenChange={setIsAssetDialogOpen}>
                                <DialogTrigger asChild>
                                    <Button variant="outline">
                                        <Plus className="h-4 w-4 mr-2" />
                                        Add Asset
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-3xl">
                                    <DialogHeader>
                                        <DialogTitle>Add New Asset</DialogTitle>
                                        <DialogDescription>
                                            Register a new asset in the inventory
                                        </DialogDescription>
                                    </DialogHeader>
                                    <div className="space-y-4 max-h-[600px] overflow-y-auto">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <Label htmlFor="assetName">Asset Name</Label>
                                                <Input
                                                    id="assetName"
                                                    value={assetForm.name}
                                                    onChange={(e) => setAssetForm(prev => ({ ...prev, name: e.target.value }))}
                                                    placeholder="e.g., MacBook Pro 16-inch"
                                                />
                                            </div>
                                            <div>
                                                <Label htmlFor="category">Category</Label>
                                                <Select
                                                    value={assetForm.category}
                                                    onValueChange={(value: Asset['category']) =>
                                                        setAssetForm(prev => ({ ...prev, category: value }))
                                                    }
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="laptop">Laptop</SelectItem>
                                                        <SelectItem value="monitor">Monitor</SelectItem>
                                                        <SelectItem value="phone">Phone</SelectItem>
                                                        <SelectItem value="furniture">Furniture</SelectItem>
                                                        <SelectItem value="vehicle">Vehicle</SelectItem>
                                                        <SelectItem value="equipment">Equipment</SelectItem>
                                                        <SelectItem value="software">Software</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <Label htmlFor="brand">Brand</Label>
                                                <Input
                                                    id="brand"
                                                    value={assetForm.brand}
                                                    onChange={(e) => setAssetForm(prev => ({ ...prev, brand: e.target.value }))}
                                                    placeholder="e.g., Apple"
                                                />
                                            </div>
                                            <div>
                                                <Label htmlFor="model">Model</Label>
                                                <Input
                                                    id="model"
                                                    value={assetForm.model}
                                                    onChange={(e) => setAssetForm(prev => ({ ...prev, model: e.target.value }))}
                                                    placeholder="e.g., MacBook Pro 2023"
                                                />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <Label htmlFor="serialNumber">Serial Number</Label>
                                                <Input
                                                    id="serialNumber"
                                                    value={assetForm.serialNumber}
                                                    onChange={(e) => setAssetForm(prev => ({ ...prev, serialNumber: e.target.value }))}
                                                    placeholder="e.g., ABC123456789"
                                                />
                                            </div>
                                            <div>
                                                <Label htmlFor="location">Location</Label>
                                                <Input
                                                    id="location"
                                                    value={assetForm.location}
                                                    onChange={(e) => setAssetForm(prev => ({ ...prev, location: e.target.value }))}
                                                    placeholder="e.g., New York Office"
                                                />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-3 gap-4">
                                            <div>
                                                <Label htmlFor="vendor">Vendor</Label>
                                                <Input
                                                    id="vendor"
                                                    value={assetForm.purchaseInfo.vendor}
                                                    onChange={(e) => setAssetForm(prev => ({
                                                        ...prev,
                                                        purchaseInfo: { ...prev.purchaseInfo, vendor: e.target.value }
                                                    }))}
                                                    placeholder="e.g., Apple Store"
                                                />
                                            </div>
                                            <div>
                                                <Label htmlFor="purchaseDate">Purchase Date</Label>
                                                <Input
                                                    id="purchaseDate"
                                                    type="date"
                                                    value={assetForm.purchaseInfo.purchaseDate}
                                                    onChange={(e) => setAssetForm(prev => ({
                                                        ...prev,
                                                        purchaseInfo: { ...prev.purchaseInfo, purchaseDate: e.target.value }
                                                    }))}
                                                />
                                            </div>
                                            <div>
                                                <Label htmlFor="purchasePrice">Purchase Price</Label>
                                                <Input
                                                    id="purchasePrice"
                                                    type="number"
                                                    value={assetForm.purchaseInfo.purchasePrice}
                                                    onChange={(e) => setAssetForm(prev => ({
                                                        ...prev,
                                                        purchaseInfo: { ...prev.purchaseInfo, purchasePrice: parseFloat(e.target.value) }
                                                    }))}
                                                    placeholder="0.00"
                                                />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <Label htmlFor="warrantyExpiry">Warranty Expiry</Label>
                                                <Input
                                                    id="warrantyExpiry"
                                                    type="date"
                                                    value={assetForm.purchaseInfo.warrantyExpiry}
                                                    onChange={(e) => setAssetForm(prev => ({
                                                        ...prev,
                                                        purchaseInfo: { ...prev.purchaseInfo, warrantyExpiry: e.target.value }
                                                    }))}
                                                />
                                            </div>
                                            <div>
                                                <Label htmlFor="condition">Condition</Label>
                                                <Select
                                                    value={assetForm.condition}
                                                    onValueChange={(value: Asset['condition']) =>
                                                        setAssetForm(prev => ({ ...prev, condition: value }))
                                                    }
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="new">New</SelectItem>
                                                        <SelectItem value="good">Good</SelectItem>
                                                        <SelectItem value="fair">Fair</SelectItem>
                                                        <SelectItem value="poor">Poor</SelectItem>
                                                        <SelectItem value="damaged">Damaged</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>

                                        <div className="flex justify-end space-x-2">
                                            <Button variant="outline" onClick={() => setIsAssetDialogOpen(false)}>
                                                Cancel
                                            </Button>
                                            <Button onClick={handleCreateAsset}>
                                                Create Asset
                                            </Button>
                                        </div>
                                    </div>
                                </DialogContent>
                            </Dialog>

                            <Dialog open={isAssignmentDialogOpen} onOpenChange={setIsAssignmentDialogOpen}>
                                <DialogTrigger asChild>
                                    <Button variant="outline">
                                        <Users className="h-4 w-4 mr-2" />
                                        Assign Asset
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-2xl">
                                    <DialogHeader>
                                        <DialogTitle>Assign Asset to Employee</DialogTitle>
                                        <DialogDescription>
                                            Assign an available asset to an employee
                                        </DialogDescription>
                                    </DialogHeader>
                                    <div className="space-y-4">
                                        <div>
                                            <Label htmlFor="assetSelect">Select Asset</Label>
                                            <Select
                                                value={assignmentForm.assetId}
                                                onValueChange={(value) => setAssignmentForm(prev => ({ ...prev, assetId: value }))}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Choose an available asset" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {assets.filter(asset => asset.status === 'available').map((asset) => (
                                                        <SelectItem key={asset.id} value={asset.id}>
                                                            {asset.name} - {asset.assetTag}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div>
                                            <Label htmlFor="employeeSelect">Employee ID</Label>
                                            <Input
                                                id="employeeSelect"
                                                value={assignmentForm.employeeId}
                                                onChange={(e) => setAssignmentForm(prev => ({ ...prev, employeeId: e.target.value }))}
                                                placeholder="Enter employee ID"
                                            />
                                        </div>

                                        <div>
                                            <Label htmlFor="assignmentReason">Assignment Reason</Label>
                                            <Textarea
                                                id="assignmentReason"
                                                value={assignmentForm.assignmentReason}
                                                onChange={(e) => setAssignmentForm(prev => ({ ...prev, assignmentReason: e.target.value }))}
                                                placeholder="Reason for this assignment..."
                                            />
                                        </div>

                                        <div>
                                            <Label htmlFor="terms">Terms and Conditions</Label>
                                            <Textarea
                                                id="terms"
                                                value={assignmentForm.terms}
                                                onChange={(e) => setAssignmentForm(prev => ({ ...prev, terms: e.target.value }))}
                                                placeholder="Terms and conditions for asset usage..."
                                            />
                                        </div>

                                        <div className="flex justify-end space-x-2">
                                            <Button variant="outline" onClick={() => setIsAssignmentDialogOpen(false)}>
                                                Cancel
                                            </Button>
                                            <Button onClick={handleAssignAsset}>
                                                Assign Asset
                                            </Button>
                                        </div>
                                    </div>
                                </DialogContent>
                            </Dialog>
                        </>
                    )}

                    <Dialog open={isRequestDialogOpen} onOpenChange={setIsRequestDialogOpen}>
                        <DialogTrigger asChild>
                            <Button>
                                <Plus className="h-4 w-4 mr-2" />
                                Request Asset
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                            <DialogHeader>
                                <DialogTitle>Submit Asset Request</DialogTitle>
                                <DialogDescription>
                                    Request new equipment or replacement for existing assets
                                </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="requestType">Request Type</Label>
                                        <Select
                                            value={requestForm.requestType}
                                            onValueChange={(value: AssetRequest['requestType']) =>
                                                setRequestForm(prev => ({ ...prev, requestType: value }))
                                            }
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="new">New Equipment</SelectItem>
                                                <SelectItem value="replacement">Replacement</SelectItem>
                                                <SelectItem value="upgrade">Upgrade</SelectItem>
                                                <SelectItem value="additional">Additional</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div>
                                        <Label htmlFor="assetCategory">Asset Category</Label>
                                        <Input
                                            id="assetCategory"
                                            value={requestForm.assetCategory}
                                            onChange={(e) => setRequestForm(prev => ({ ...prev, assetCategory: e.target.value }))}
                                            placeholder="e.g., Laptop, Monitor"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <Label htmlFor="requestedItem">Requested Item</Label>
                                    <Input
                                        id="requestedItem"
                                        value={requestForm.requestedItem}
                                        onChange={(e) => setRequestForm(prev => ({ ...prev, requestedItem: e.target.value }))}
                                        placeholder="e.g., MacBook Pro 16-inch M3"
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="businessJustification">Business Justification</Label>
                                    <Textarea
                                        id="businessJustification"
                                        value={requestForm.businessJustification}
                                        onChange={(e) => setRequestForm(prev => ({ ...prev, businessJustification: e.target.value }))}
                                        placeholder="Explain why this asset is needed for your work..."
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="urgencyLevel">Urgency Level</Label>
                                        <Select
                                            value={requestForm.urgencyLevel}
                                            onValueChange={(value: AssetRequest['urgencyLevel']) =>
                                                setRequestForm(prev => ({ ...prev, urgencyLevel: value }))
                                            }
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="low">Low</SelectItem>
                                                <SelectItem value="medium">Medium</SelectItem>
                                                <SelectItem value="high">High</SelectItem>
                                                <SelectItem value="critical">Critical</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div>
                                        <Label htmlFor="estimatedCost">Estimated Cost</Label>
                                        <Input
                                            id="estimatedCost"
                                            type="number"
                                            value={requestForm.estimatedCost}
                                            onChange={(e) => setRequestForm(prev => ({ ...prev, estimatedCost: parseFloat(e.target.value) }))}
                                            placeholder="0.00"
                                        />
                                    </div>
                                </div>

                                <div className="flex justify-end space-x-2">
                                    <Button variant="outline" onClick={() => setIsRequestDialogOpen(false)}>
                                        Cancel
                                    </Button>
                                    <Button onClick={handleCreateRequest}>
                                        Submit Request
                                    </Button>
                                </div>
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            {/* Navigation Tabs */}
            <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
                <TabsList className="grid w-full grid-cols-5">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    {mode === 'hr' && <TabsTrigger value="inventory">Inventory</TabsTrigger>}
                    <TabsTrigger value="assignments">
                        {mode === 'employee' ? 'My Assets' : 'Assignments'}
                    </TabsTrigger>
                    <TabsTrigger value="requests">Requests</TabsTrigger>
                    {mode === 'hr' && <TabsTrigger value="maintenance">Maintenance</TabsTrigger>}
                </TabsList>

                {/* Overview Tab */}
                <TabsContent value="overview" className="space-y-6">
                    {/* Statistics Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <Card>
                            <CardContent className="p-6">
                                <div className="flex items-center space-x-4">
                                    <div className="p-3 bg-blue-100 rounded-lg">
                                        <Package className="h-6 w-6 text-blue-600" />
                                    </div>
                                    <div>
                                        <p className="text-2xl font-bold">{assets.length}</p>
                                        <p className="text-sm text-muted-foreground">Total Assets</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="p-6">
                                <div className="flex items-center space-x-4">
                                    <div className="p-3 bg-green-100 rounded-lg">
                                        <CheckCircle className="h-6 w-6 text-green-600" />
                                    </div>
                                    <div>
                                        <p className="text-2xl font-bold">
                                            {assets.filter(a => a.status === 'available').length}
                                        </p>
                                        <p className="text-sm text-muted-foreground">Available</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="p-6">
                                <div className="flex items-center space-x-4">
                                    <div className="p-3 bg-yellow-100 rounded-lg">
                                        <Users className="h-6 w-6 text-yellow-600" />
                                    </div>
                                    <div>
                                        <p className="text-2xl font-bold">
                                            {assets.filter(a => a.status === 'assigned').length}
                                        </p>
                                        <p className="text-sm text-muted-foreground">Assigned</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="p-6">
                                <div className="flex items-center space-x-4">
                                    <div className="p-3 bg-red-100 rounded-lg">
                                        <AlertTriangle className="h-6 w-6 text-red-600" />
                                    </div>
                                    <div>
                                        <p className="text-2xl font-bold">
                                            {assets.filter(a => a.status === 'maintenance').length}
                                        </p>
                                        <p className="text-sm text-muted-foreground">Maintenance</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Recent Activity */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Recent Asset Activity</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {assignments.slice(0, 5).map((assignment) => (
                                    <div key={assignment.id} className="flex items-center justify-between p-3 border rounded-lg">
                                        <div className="flex items-center space-x-3">
                                            {getCategoryIcon(assets.find(a => a.id === assignment.assetId)?.category || 'equipment')}
                                            <div>
                                                <p className="font-medium">{assignment.assetName}</p>
                                                <p className="text-sm text-muted-foreground">
                                                    Assigned to {assignment.employeeName}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-sm text-muted-foreground">
                                            {new Date(assignment.assignedDate).toLocaleDateString()}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Inventory Tab (HR Only) */}
                {mode === 'hr' && (
                    <TabsContent value="inventory" className="space-y-6">
                        {/* Filters */}
                        <Card>
                            <CardContent className="p-4">
                                <div className="flex items-center space-x-4">
                                    <div className="flex-1">
                                        <div className="relative">
                                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                placeholder="Search assets..."
                                                className="pl-10"
                                            />
                                        </div>
                                    </div>
                                    <Select
                                        value={filters.category}
                                        onValueChange={(value) => setFilters(prev => ({ ...prev, category: value }))}
                                    >
                                        <SelectTrigger className="w-40">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Categories</SelectItem>
                                            <SelectItem value="laptop">Laptop</SelectItem>
                                            <SelectItem value="monitor">Monitor</SelectItem>
                                            <SelectItem value="phone">Phone</SelectItem>
                                            <SelectItem value="furniture">Furniture</SelectItem>
                                            <SelectItem value="vehicle">Vehicle</SelectItem>
                                            <SelectItem value="equipment">Equipment</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <Select
                                        value={filters.status}
                                        onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}
                                    >
                                        <SelectTrigger className="w-40">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Status</SelectItem>
                                            <SelectItem value="available">Available</SelectItem>
                                            <SelectItem value="assigned">Assigned</SelectItem>
                                            <SelectItem value="maintenance">Maintenance</SelectItem>
                                            <SelectItem value="retired">Retired</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Assets Table */}
                        <Card>
                            <CardContent className="p-0">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Asset</TableHead>
                                            <TableHead>Category</TableHead>
                                            <TableHead>Serial Number</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead>Condition</TableHead>
                                            <TableHead>Location</TableHead>
                                            <TableHead>Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {getFilteredAssets().map((asset) => (
                                            <TableRow key={asset.id}>
                                                <TableCell>
                                                    <div className="flex items-center space-x-3">
                                                        {getCategoryIcon(asset.category)}
                                                        <div>
                                                            <p className="font-medium">{asset.name}</p>
                                                            <p className="text-sm text-muted-foreground">
                                                                {asset.brand} {asset.model}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="capitalize">{asset.category}</TableCell>
                                                <TableCell className="font-mono text-sm">{asset.serialNumber}</TableCell>
                                                <TableCell>{getStatusBadge(asset.status)}</TableCell>
                                                <TableCell>{getConditionBadge(asset.condition)}</TableCell>
                                                <TableCell>
                                                    <div className="flex items-center space-x-1">
                                                        <MapPin className="h-3 w-3 text-muted-foreground" />
                                                        <span className="text-sm">{asset.location}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="ghost" size="sm">
                                                                <MoreHorizontal className="h-4 w-4" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end">
                                                            <DropdownMenuItem>
                                                                <Eye className="h-4 w-4 mr-2" />
                                                                View Details
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem>
                                                                <Edit className="h-4 w-4 mr-2" />
                                                                Edit Asset
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem>
                                                                <QrCode className="h-4 w-4 mr-2" />
                                                                Generate QR Code
                                                            </DropdownMenuItem>
                                                            {asset.status === 'available' && (
                                                                <DropdownMenuItem>
                                                                    <Users className="h-4 w-4 mr-2" />
                                                                    Assign Asset
                                                                </DropdownMenuItem>
                                                            )}
                                                            <DropdownMenuSeparator />
                                                            <DropdownMenuItem className="text-red-600">
                                                                <Trash2 className="h-4 w-4 mr-2" />
                                                                Retire Asset
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    </TabsContent>
                )}

                {/* Assignments Tab */}
                <TabsContent value="assignments" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>
                                {mode === 'employee' ? 'My Assigned Assets' : 'Asset Assignments'}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {(mode === 'employee' ? getMyAssignedAssets() : assignments).map((assignment) => {
                                    const asset = assets.find(a => a.id === assignment.assetId);
                                    return (
                                        <Card key={assignment.id} className="p-4">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center space-x-4">
                                                    {asset && getCategoryIcon(asset.category)}
                                                    <div>
                                                        <h4 className="font-semibold">{assignment.assetName}</h4>
                                                        <p className="text-sm text-muted-foreground">
                                                            {mode === 'hr' ? `Assigned to ${assignment.employeeName}` : `Asset Tag: ${asset?.assetTag}`}
                                                        </p>
                                                        <p className="text-xs text-muted-foreground">
                                                            Assigned on {new Date(assignment.assignedDate).toLocaleDateString()}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <Badge variant={assignment.status === 'active' ? 'default' : 'secondary'}>
                                                        {assignment.status}
                                                    </Badge>
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="ghost" size="sm">
                                                                <MoreHorizontal className="h-4 w-4" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end">
                                                            <DropdownMenuItem>
                                                                <Eye className="h-4 w-4 mr-2" />
                                                                View Details
                                                            </DropdownMenuItem>
                                                            {mode === 'employee' && (
                                                                <DropdownMenuItem>
                                                                    <AlertTriangle className="h-4 w-4 mr-2" />
                                                                    Report Issue
                                                                </DropdownMenuItem>
                                                            )}
                                                            {mode === 'hr' && assignment.status === 'active' && (
                                                                <DropdownMenuItem>
                                                                    <Package className="h-4 w-4 mr-2" />
                                                                    Initiate Return
                                                                </DropdownMenuItem>
                                                            )}
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </div>
                                            </div>
                                        </Card>
                                    );
                                })}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Requests Tab */}
                <TabsContent value="requests" className="space-y-6">
                    <Card>
                        <CardContent className="p-0">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        {mode === 'hr' && <TableHead>Employee</TableHead>}
                                        <TableHead>Request Type</TableHead>
                                        <TableHead>Item</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Urgency</TableHead>
                                        <TableHead>Estimated Cost</TableHead>
                                        <TableHead>Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {requests.map((request) => (
                                        <TableRow key={request.id}>
                                            {mode === 'hr' && (
                                                <TableCell>
                                                    <div>
                                                        <p className="font-medium">{request.employeeName}</p>
                                                        <p className="text-sm text-muted-foreground">{request.employeeId}</p>
                                                    </div>
                                                </TableCell>
                                            )}
                                            <TableCell className="capitalize">{request.requestType}</TableCell>
                                            <TableCell>
                                                <div>
                                                    <p className="font-medium">{request.requestedItem}</p>
                                                    <p className="text-sm text-muted-foreground">{request.assetCategory}</p>
                                                </div>
                                            </TableCell>
                                            <TableCell>{getRequestStatusBadge(request.status)}</TableCell>
                                            <TableCell>{getUrgencyBadge(request.urgencyLevel)}</TableCell>
                                            <TableCell>
                                                {request.estimatedCost ? (
                                                    <div className="flex items-center space-x-1">
                                                        <DollarSign className="h-3 w-3 text-muted-foreground" />
                                                        <span>${request.estimatedCost.toLocaleString()}</span>
                                                    </div>
                                                ) : (
                                                    <span className="text-muted-foreground">-</span>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="sm">
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem>
                                                            <Eye className="h-4 w-4 mr-2" />
                                                            View Details
                                                        </DropdownMenuItem>
                                                        {mode === 'hr' && request.status === 'pending' && (
                                                            <>
                                                                <DropdownMenuItem>
                                                                    <CheckCircle className="h-4 w-4 mr-2" />
                                                                    Approve
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem>
                                                                    <XCircle className="h-4 w-4 mr-2" />
                                                                    Reject
                                                                </DropdownMenuItem>
                                                            </>
                                                        )}
                                                        {mode === 'employee' && request.status === 'pending' && (
                                                            <DropdownMenuItem>
                                                                <Edit className="h-4 w-4 mr-2" />
                                                                Edit Request
                                                            </DropdownMenuItem>
                                                        )}
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}

export default ComprehensiveAssetManagement;


