import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Textarea } from '../../../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../components/ui/tabs';
import {
    Laptop,
    Smartphone,
    Monitor,
    Headphones,
    Car,
    Building,
    Plus,
    Eye,
    Edit,
    Trash2,
    Download,
    Upload,
    AlertCircle,
    CheckCircle,
    Clock,
    Settings,
    FileText,
    Calendar,
    DollarSign,
    MapPin,
    User,
    Search,
    Filter,
    Package,
    Wrench,
    Shield,
    Battery,
    Wifi,
    Camera
} from 'lucide-react';
import { Asset, AssetDocument, AssetRequest } from '../types';

// Mock data - replace with actual API calls
const mockAssets: Asset[] = [
    {
        id: 'asset-001',
        name: 'MacBook Pro 16"',
        category: 'laptop',
        brand: 'Apple',
        model: 'MacBook Pro 16-inch 2023',
        serialNumber: 'MBP16-2023-001',
        assignedTo: 'emp-001',
        assignedAt: new Date('2024-01-15'),
        status: 'assigned',
        location: 'Office - Desk 15',
        purchaseDate: new Date('2024-01-10'),
        warrantyExpiry: new Date('2027-01-10'),
        value: 2499.00,
        currency: 'USD',
        notes: 'Primary development machine',
        documents: [
            {
                id: 'doc-001',
                name: 'Purchase Invoice',
                type: 'invoice',
                url: '/documents/macbook-invoice.pdf',
                uploadedAt: new Date('2024-01-10')
            },
            {
                id: 'doc-002',
                name: 'Warranty Certificate',
                type: 'warranty',
                url: '/documents/macbook-warranty.pdf',
                uploadedAt: new Date('2024-01-10')
            }
        ]
    },
    {
        id: 'asset-002',
        name: 'iPhone 15 Pro',
        category: 'phone',
        brand: 'Apple',
        model: 'iPhone 15 Pro 256GB',
        serialNumber: 'IP15P-256-002',
        assignedTo: 'emp-001',
        assignedAt: new Date('2024-02-01'),
        status: 'assigned',
        location: 'Office - Desk 15',
        purchaseDate: new Date('2024-01-25'),
        warrantyExpiry: new Date('2025-01-25'),
        value: 999.00,
        currency: 'USD',
        notes: 'Company phone for business use',
        documents: [
            {
                id: 'doc-003',
                name: 'Purchase Invoice',
                type: 'invoice',
                url: '/documents/iphone-invoice.pdf',
                uploadedAt: new Date('2024-01-25')
            }
        ]
    },
    {
        id: 'asset-003',
        name: 'Dell Monitor 27"',
        category: 'desktop',
        brand: 'Dell',
        model: 'UltraSharp 27" 4K',
        serialNumber: 'DELL-27-4K-003',
        assignedTo: 'emp-001',
        assignedAt: new Date('2024-01-15'),
        status: 'assigned',
        location: 'Office - Desk 15',
        purchaseDate: new Date('2024-01-10'),
        warrantyExpiry: new Date('2026-01-10'),
        value: 599.00,
        currency: 'USD',
        notes: 'External monitor for development setup',
        documents: []
    },
    {
        id: 'asset-004',
        name: 'Sony WH-1000XM5',
        category: 'other',
        brand: 'Sony',
        model: 'WH-1000XM5 Wireless Headphones',
        serialNumber: 'SONY-WH1000XM5-004',
        assignedTo: 'emp-001',
        assignedAt: new Date('2024-03-01'),
        status: 'assigned',
        location: 'Office - Desk 15',
        purchaseDate: new Date('2024-02-25'),
        warrantyExpiry: new Date('2025-02-25'),
        value: 399.00,
        currency: 'USD',
        notes: 'Noise-cancelling headphones for focus work',
        documents: []
    }
];

const mockAssetRequests: AssetRequest[] = [
    {
        id: 'ar-001',
        employeeId: 'emp-001',
        assetType: 'Standing Desk',
        reason: 'Need ergonomic workspace setup for better productivity',
        priority: 'medium',
        status: 'approved',
        requestedAt: new Date('2024-11-15'),
        approvedBy: 'manager-001',
        approvedAt: new Date('2024-11-18'),
        fulfilledAt: new Date('2024-11-25'),
        notes: 'Standing desk delivered and installed'
    },
    {
        id: 'ar-002',
        employeeId: 'emp-001',
        assetType: 'External Keyboard',
        reason: 'Current keyboard is worn out and affecting typing speed',
        priority: 'low',
        status: 'pending',
        requestedAt: new Date('2024-12-10'),
        notes: 'Waiting for approval from IT department'
    }
];

export default function AssetManagement() {
    const [assets, setAssets] = useState<Asset[]>(mockAssets);
    const [assetRequests, setAssetRequests] = useState<AssetRequest[]>(mockAssetRequests);
    const [showRequestForm, setShowRequestForm] = useState(false);
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [categoryFilter, setCategoryFilter] = useState<string>('all');
    const [statusFilter, setStatusFilter] = useState<string>('all');

    // Form state
    const [formData, setFormData] = useState({
        assetType: '',
        reason: '',
        priority: '',
        notes: ''
    });

    const getCategoryIcon = (category: string) => {
        switch (category) {
            case 'laptop': return <Laptop className="h-5 w-5" />;
            case 'desktop': return <Monitor className="h-5 w-5" />;
            case 'phone': return <Smartphone className="h-5 w-5" />;
            case 'tablet': return <Monitor className="h-5 w-5" />;
            case 'furniture': return <Building className="h-5 w-5" />;
            case 'vehicle': return <Car className="h-5 w-5" />;
            default: return <Package className="h-5 w-5" />;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'assigned': return 'bg-green-100 text-green-800';
            case 'available': return 'bg-blue-100 text-blue-800';
            case 'maintenance': return 'bg-yellow-100 text-yellow-800';
            case 'retired': return 'bg-gray-100 text-gray-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'assigned': return <CheckCircle className="h-4 w-4 text-green-600" />;
            case 'available': return <Clock className="h-4 w-4 text-blue-600" />;
            case 'maintenance': return <Wrench className="h-4 w-4 text-yellow-600" />;
            case 'retired': return <AlertCircle className="h-4 w-4 text-gray-600" />;
            default: return <AlertCircle className="h-4 w-4 text-gray-600" />;
        }
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'urgent': return 'bg-red-100 text-red-800';
            case 'high': return 'bg-orange-100 text-orange-800';
            case 'medium': return 'bg-yellow-100 text-yellow-800';
            case 'low': return 'bg-green-100 text-green-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getRequestStatusColor = (status: string) => {
        switch (status) {
            case 'approved': return 'bg-green-100 text-green-800';
            case 'pending': return 'bg-yellow-100 text-yellow-800';
            case 'rejected': return 'bg-red-100 text-red-800';
            case 'fulfilled': return 'bg-blue-100 text-blue-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const formatCurrency = (amount: number, currency: string = 'USD') => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currency
        }).format(amount);
    };

    const formatDate = (date: Date) => {
        return new Intl.DateTimeFormat('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        }).format(date);
    };

    const handleSubmitRequest = async () => {
        if (!formData.assetType || !formData.reason || !formData.priority) {
            alert('Please fill in all required fields');
            return;
        }

        setLoading(true);
        try {
            const newRequest: AssetRequest = {
                id: `ar-${Date.now()}`,
                employeeId: 'emp-001',
                assetType: formData.assetType,
                reason: formData.reason,
                priority: formData.priority as any,
                status: 'pending',
                requestedAt: new Date(),
                notes: formData.notes
            };

            setAssetRequests(prev => [newRequest, ...prev]);
            setShowRequestForm(false);
            setFormData({
                assetType: '',
                reason: '',
                priority: '',
                notes: ''
            });
        } catch (error) {
            console.error('Error submitting asset request:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredAssets = assets.filter(asset => {
        const matchesSearch = asset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            asset.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
            asset.model.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = categoryFilter === 'all' || asset.category === categoryFilter;
        const matchesStatus = statusFilter === 'all' || asset.status === statusFilter;
        return matchesSearch && matchesCategory && matchesStatus;
    });

    const totalAssets = assets.length;
    const assignedAssets = assets.filter(asset => asset.status === 'assigned').length;
    const totalValue = assets.reduce((sum, asset) => sum + asset.value, 0);
    const pendingRequests = assetRequests.filter(req => req.status === 'pending').length;

    return (
        <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 p-6">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-foreground">Asset Management</h1>
                        <p className="text-muted-foreground mt-2">
                            Manage your assigned company assets and request new equipment
                        </p>
                    </div>
                    <Button onClick={() => setShowRequestForm(true)}>
                        <Plus className="h-4 w-4 mr-2" />
                        Request Asset
                    </Button>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Assets</CardTitle>
                            <Package className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{totalAssets}</div>
                            <p className="text-xs text-muted-foreground">Assigned to you</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Active Assets</CardTitle>
                            <CheckCircle className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{assignedAssets}</div>
                            <p className="text-xs text-muted-foreground">Currently assigned</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Value</CardTitle>
                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{formatCurrency(totalValue)}</div>
                            <p className="text-xs text-muted-foreground">Asset value</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Pending Requests</CardTitle>
                            <Clock className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{pendingRequests}</div>
                            <p className="text-xs text-muted-foreground">Awaiting approval</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Main Content */}
                <Tabs defaultValue="assets" className="space-y-4">
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="assets">My Assets</TabsTrigger>
                        <TabsTrigger value="requests">Asset Requests</TabsTrigger>
                        <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
                    </TabsList>

                    <TabsContent value="assets" className="space-y-4">
                        {/* Filters */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center space-x-2">
                                    <Filter className="h-5 w-5" />
                                    <span>Filters</span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center space-x-4">
                                    <div className="flex-1">
                                        <div className="relative">
                                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                placeholder="Search assets..."
                                                value={searchQuery}
                                                onChange={(e) => setSearchQuery(e.target.value)}
                                                className="pl-10"
                                            />
                                        </div>
                                    </div>
                                    <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                                        <SelectTrigger className="w-48">
                                            <SelectValue placeholder="Filter by category" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Categories</SelectItem>
                                            <SelectItem value="laptop">Laptop</SelectItem>
                                            <SelectItem value="desktop">Desktop</SelectItem>
                                            <SelectItem value="phone">Phone</SelectItem>
                                            <SelectItem value="tablet">Tablet</SelectItem>
                                            <SelectItem value="furniture">Furniture</SelectItem>
                                            <SelectItem value="vehicle">Vehicle</SelectItem>
                                            <SelectItem value="other">Other</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                                        <SelectTrigger className="w-48">
                                            <SelectValue placeholder="Filter by status" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Status</SelectItem>
                                            <SelectItem value="assigned">Assigned</SelectItem>
                                            <SelectItem value="available">Available</SelectItem>
                                            <SelectItem value="maintenance">Maintenance</SelectItem>
                                            <SelectItem value="retired">Retired</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Assets List */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center space-x-2">
                                    <Package className="h-5 w-5" />
                                    <span>Assigned Assets</span>
                                </CardTitle>
                                <CardDescription>
                                    Your current company assets
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {filteredAssets.map((asset) => (
                                        <div key={asset.id} className="flex items-center justify-between p-4 border rounded-lg">
                                            <div className="flex items-start space-x-4">
                                                <div className="flex-shrink-0 mt-1">
                                                    {getCategoryIcon(asset.category)}
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex items-center space-x-3">
                                                        <h3 className="text-lg font-semibold">{asset.name}</h3>
                                                        <Badge className={getStatusColor(asset.status)}>
                                                            {getStatusIcon(asset.status)}
                                                            <span className="ml-1">{asset.status}</span>
                                                        </Badge>
                                                    </div>
                                                    <p className="text-sm text-muted-foreground mt-1">
                                                        {asset.brand} {asset.model}
                                                    </p>
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                                                        <div>
                                                            <p className="text-sm text-muted-foreground">
                                                                <strong>Serial:</strong> {asset.serialNumber}
                                                            </p>
                                                            <p className="text-sm text-muted-foreground">
                                                                <strong>Assigned:</strong> {formatDate(asset.assignedAt!)}
                                                            </p>
                                                        </div>
                                                        <div>
                                                            <p className="text-sm text-muted-foreground">
                                                                <strong>Value:</strong> {formatCurrency(asset.value, asset.currency)}
                                                            </p>
                                                            <p className="text-sm text-muted-foreground">
                                                                <strong>Warranty:</strong> {asset.warrantyExpiry ? formatDate(asset.warrantyExpiry) : 'N/A'}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center space-x-4 mt-2 text-sm text-muted-foreground">
                                                        <div className="flex items-center space-x-1">
                                                            <MapPin className="h-3 w-3" />
                                                            <span>{asset.location}</span>
                                                        </div>
                                                        <div className="flex items-center space-x-1">
                                                            <Calendar className="h-3 w-3" />
                                                            <span>Purchased: {formatDate(asset.purchaseDate)}</span>
                                                        </div>
                                                    </div>
                                                    {asset.notes && (
                                                        <p className="text-sm text-muted-foreground mt-2">
                                                            <strong>Notes:</strong> {asset.notes}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <Button size="sm" variant="outline">
                                                    <Eye className="h-4 w-4" />
                                                </Button>
                                                <Button size="sm" variant="outline">
                                                    <Download className="h-4 w-4" />
                                                </Button>
                                                <Button size="sm" variant="outline">
                                                    <Wrench className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="requests" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center space-x-2">
                                    <FileText className="h-5 w-5" />
                                    <span>Asset Requests</span>
                                </CardTitle>
                                <CardDescription>
                                    Your asset requests and their status
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {assetRequests.map((request) => (
                                        <div key={request.id} className="flex items-center justify-between p-4 border rounded-lg">
                                            <div className="flex items-start space-x-4">
                                                <div className="flex-shrink-0 mt-1">
                                                    <Package className="h-5 w-5" />
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex items-center space-x-3">
                                                        <h3 className="text-lg font-semibold">{request.assetType}</h3>
                                                        <Badge className={getRequestStatusColor(request.status)}>
                                                            {request.status}
                                                        </Badge>
                                                        <Badge className={getPriorityColor(request.priority)}>
                                                            {request.priority}
                                                        </Badge>
                                                    </div>
                                                    <p className="text-sm text-muted-foreground mt-1">
                                                        {request.reason}
                                                    </p>
                                                    <div className="flex items-center space-x-4 mt-2 text-xs text-muted-foreground">
                                                        <span>Requested: {formatDate(request.requestedAt)}</span>
                                                        {request.approvedAt && (
                                                            <span>Approved: {formatDate(request.approvedAt)}</span>
                                                        )}
                                                        {request.fulfilledAt && (
                                                            <span>Fulfilled: {formatDate(request.fulfilledAt)}</span>
                                                        )}
                                                    </div>
                                                    {request.notes && (
                                                        <p className="text-sm text-muted-foreground mt-2">
                                                            <strong>Notes:</strong> {request.notes}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <Button size="sm" variant="outline">
                                                    <Eye className="h-4 w-4" />
                                                </Button>
                                                {request.status === 'pending' && (
                                                    <Button size="sm" variant="outline">
                                                        Cancel
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="maintenance" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center space-x-2">
                                    <Wrench className="h-5 w-5" />
                                    <span>Maintenance & Support</span>
                                </CardTitle>
                                <CardDescription>
                                    Report issues and request maintenance for your assets
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="text-center py-8">
                                    <Wrench className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                                    <p className="text-muted-foreground">Maintenance features coming soon</p>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>

                {/* Asset Request Form Modal */}
                {showRequestForm && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-background rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-2xl font-bold">Request New Asset</h2>
                                <Button variant="outline" onClick={() => setShowRequestForm(false)}>
                                    <XCircle className="h-4 w-4" />
                                </Button>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <Label htmlFor="assetType">Asset Type *</Label>
                                    <Input
                                        id="assetType"
                                        placeholder="e.g., Laptop, Monitor, Standing Desk"
                                        value={formData.assetType}
                                        onChange={(e) => setFormData(prev => ({ ...prev, assetType: e.target.value }))}
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="priority">Priority *</Label>
                                    <Select
                                        value={formData.priority}
                                        onValueChange={(value) => setFormData(prev => ({ ...prev, priority: value }))}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select priority" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="low">Low</SelectItem>
                                            <SelectItem value="medium">Medium</SelectItem>
                                            <SelectItem value="high">High</SelectItem>
                                            <SelectItem value="urgent">Urgent</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div>
                                    <Label htmlFor="reason">Reason *</Label>
                                    <Textarea
                                        id="reason"
                                        placeholder="Please explain why you need this asset..."
                                        value={formData.reason}
                                        onChange={(e) => setFormData(prev => ({ ...prev, reason: e.target.value }))}
                                        rows={3}
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="notes">Additional Notes</Label>
                                    <Textarea
                                        id="notes"
                                        placeholder="Any additional information or specifications..."
                                        value={formData.notes}
                                        onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                                        rows={2}
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end space-x-2 mt-6">
                                <Button variant="outline" onClick={() => setShowRequestForm(false)}>
                                    Cancel
                                </Button>
                                <Button onClick={handleSubmitRequest} disabled={loading}>
                                    {loading ? (
                                        <>
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                            Submitting...
                                        </>
                                    ) : (
                                        'Submit Request'
                                    )}
                                </Button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

