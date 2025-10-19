// Employee My Assets - View assigned company assets
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../components/ui/tabs';
import { Alert, AlertDescription } from '../../../components/ui/alert';
import { useCompany } from '../../../context/CompanyContext';
import { useAuth } from '../../../context/AuthContext';
import {
    Package,
    Calendar,
    MapPin,
    Wrench,
    AlertCircle,
    CheckCircle,
    Loader,
    Eye,
    Plus,
    Send,
    Star,
    ChevronDown,
    ChevronUp
} from 'lucide-react';
import { collection, query, where, getDocs, addDoc, Timestamp, onSnapshot } from 'firebase/firestore';
import { db } from '../../../config/firebase';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Textarea } from '../../../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select';

interface Asset {
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
    manufacturer?: string;
    model?: string;
    warrantyExpiration?: string;
    isEssential?: boolean;
    priority?: 'Urgent' | 'High' | 'Medium' | 'Low';
    type?: string;
}

interface AssetAssignment {
    id: string;
    assetId: string;
    employeeId: string;
    assignedDate: string;
    returnDate?: string;
    condition: 'Excellent' | 'Good' | 'Fair' | 'Poor';
    notes?: string;
    status: 'Active' | 'Returned' | 'Lost' | 'Damaged';
}

interface AssetRequest {
    id: string;
    employeeId: string;
    employeeName: string;
    assetName?: string;
    assetType: string;
    category: string;
    justification: string;
    priority: 'Urgent' | 'High' | 'Medium' | 'Low';
    status: 'Pending' | 'Approved' | 'Rejected' | 'Fulfilled';
    requestedDate: any;
    approvedBy?: string;
    approvedDate?: any;
    rejectedReason?: string;
    fulfilledDate?: any;
    assignedAssetId?: string;
    notes?: string;
}

export default function MyAssets() {
    const { companyId } = useCompany();
    const { currentEmployee } = useAuth();

    const [employeeId] = useState(() => {
        return currentEmployee?.employeeId || localStorage.getItem('currentEmployeeId') || 'EMP001';
    });

    const [employeeName, setEmployeeName] = useState(currentEmployee?.firstName + ' ' + currentEmployee?.lastName || 'Employee User');

    const [assets, setAssets] = useState<Asset[]>([]);
    const [assignments, setAssignments] = useState<AssetAssignment[]>([]);
    const [requests, setRequests] = useState<AssetRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [showRequestModal, setShowRequestModal] = useState(false);
    const [availableAssets, setAvailableAssets] = useState<Asset[]>([]);
    const [starterKitExpanded, setStarterKitExpanded] = useState(true);

    const [requestForm, setRequestForm] = useState({
        assetName: '',
        assetType: '',
        category: '',
        justification: '',
        priority: 'Medium' as 'Urgent' | 'High' | 'Medium' | 'Low'
    });

    // Real-time sync for assets, assignments, and requests
    useEffect(() => {
        if (!employeeId) return;

        console.log('📡 Setting up real-time asset sync for employee:', employeeId);

        // Real-time listener for assigned assets
        const assetsQuery = query(
            collection(db, 'assets'),
            where('assignedTo', '==', employeeId),
            where('status', '==', 'Assigned')
        );

        const unsubscribeAssets = onSnapshot(
            assetsQuery,
            (snapshot) => {
                const assetsData = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                } as Asset));
                setAssets(assetsData);
                console.log('📡 Real-time update: Assets changed -', assetsData.length, 'assigned to employee');
                setLoading(false);
            },
            (error) => {
                console.error('Error in assets listener:', error);
                setLoading(false);
            }
        );

        // Real-time listener for assignment history
        const assignmentsQuery = query(
            collection(db, 'asset_assignments'),
            where('employeeId', '==', employeeId)
        );

        const unsubscribeAssignments = onSnapshot(
            assignmentsQuery,
            (snapshot) => {
                const assignmentsData = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                } as AssetAssignment));
                setAssignments(assignmentsData);
                console.log('📡 Real-time update: Assignment history changed');
            },
            (error) => {
                console.error('Error in assignments listener:', error);
            }
        );

        // Real-time listener for asset requests
        const requestsQuery = query(
            collection(db, 'assetRequests'),
            where('employeeId', '==', employeeId)
        );

        const unsubscribeRequests = onSnapshot(
            requestsQuery,
            (snapshot) => {
                const requestsData = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                } as AssetRequest));
                setRequests(requestsData);
                console.log('📡 Real-time update: Asset requests changed');
            },
            (error) => {
                console.error('Error in requests listener:', error);
            }
        );

        // Cleanup listeners on unmount
        return () => {
            console.log('🔌 Cleaning up asset listeners');
            unsubscribeAssets();
            unsubscribeAssignments();
            unsubscribeRequests();
        };
    }, [employeeId]);

    // Load employee name
    useEffect(() => {
        const loadEmployeeName = async () => {
            try {
                const { getComprehensiveDataFlowService } = await import('../../../services/comprehensiveDataFlowService');
                const dataFlowService = await getComprehensiveDataFlowService();
                const allEmployees = await dataFlowService.getAllEmployees();
                const profile = allEmployees.find(emp => emp.id === employeeId || emp.employeeId === employeeId);
                if (profile) {
                    const fullName = `${profile.personalInfo.firstName} ${profile.personalInfo.lastName}`;
                    setEmployeeName(fullName);
                }
            } catch (error) {
                console.error('Failed to load employee name:', error);
            }
        };
        loadEmployeeName();
    }, [employeeId]);

    // Real-time sync for available assets (for request form)
    useEffect(() => {
        console.log('📡 Setting up real-time sync for available assets (for requests)');

        const assetsQuery = collection(db, 'assets');

        const unsubscribe = onSnapshot(
            assetsQuery,
            (snapshot) => {
                const allAssets = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                } as Asset));

                // Filter for truly available assets only
                const availableData = allAssets.filter(asset => {
                    const isAvailable = asset.status === 'Available';
                    const notAssigned = !asset.assignedTo || asset.assignedTo.trim() === '';
                    const notUnderRepair = asset.status !== 'Under Repair';

                    return isAvailable && notAssigned && notUnderRepair;
                });

                setAvailableAssets(availableData);
                console.log('📦 Available assets updated:', availableData.length, '(excluding assigned and under maintenance)');
            },
            (error) => {
                console.error('Error in available assets listener:', error);
            }
        );

        return () => {
            console.log('🔌 Cleaning up available assets listener');
            unsubscribe();
        };
    }, []);

    const handleSubmitRequest = async () => {
        if (!requestForm.assetType || !requestForm.assetName || !requestForm.category || !requestForm.justification) {
            alert('Please fill in all required fields');
            return;
        }

        setSubmitting(true);
        try {
            const requestsRef = collection(db, 'assetRequests');
            await addDoc(requestsRef, {
                employeeId,
                employeeName,
                assetName: requestForm.assetName,
                assetType: requestForm.assetType,
                category: requestForm.category,
                justification: requestForm.justification,
                priority: requestForm.priority,
                status: 'Pending',
                requestedDate: Timestamp.now()
            });

            console.log('✅ Asset request submitted:', requestForm.assetName);
            setShowRequestModal(false);
            setRequestForm({
                assetName: '',
                assetType: '',
                category: '',
                justification: '',
                priority: 'Medium'
            });
            // Real-time sync will automatically update the requests list
            alert('Asset request submitted successfully!');
        } catch (error) {
            console.error('Failed to submit request:', error);
            alert('Failed to submit asset request');
        } finally {
            setSubmitting(false);
        }
    };

    const getRequestStatusBadge = (status: AssetRequest['status']) => {
        const colors: Record<AssetRequest['status'], string> = {
            'Pending': 'bg-yellow-100 text-yellow-800',
            'Approved': 'bg-green-100 text-green-800',
            'Rejected': 'bg-red-100 text-red-800',
            'Fulfilled': 'bg-blue-100 text-blue-800'
        };

        return (
            <Badge className={colors[status]}>
                <span className="capitalize">{status}</span>
            </Badge>
        );
    };

    const getPriorityBadge = (priority: AssetRequest['priority']) => {
        const colors: Record<AssetRequest['priority'], string> = {
            'Urgent': 'bg-red-100 text-red-800',
            'High': 'bg-orange-100 text-orange-800',
            'Medium': 'bg-blue-100 text-blue-800',
            'Low': 'bg-gray-100 text-gray-800'
        };

        return (
            <Badge className={colors[priority]}>
                <span className="capitalize">{priority}</span>
            </Badge>
        );
    };

    const formatDate = (date: any): string => {
        if (!date) return 'N/A';
        try {
            const d = date.toDate ? date.toDate() : new Date(date);
            return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
        } catch {
            return 'N/A';
        }
    };

    const getConditionBadge = (condition: Asset['condition']) => {
        const colors: Record<Asset['condition'], string> = {
            'Excellent': 'bg-green-100 text-green-800',
            'Good': 'bg-blue-100 text-blue-800',
            'Fair': 'bg-yellow-100 text-yellow-800',
            'Poor': 'bg-red-100 text-red-800'
        };

        return (
            <Badge className={colors[condition]}>
                <span className="capitalize">{condition}</span>
            </Badge>
        );
    };

    const getStatusBadge = (status: AssetAssignment['status']) => {
        const colors: Record<AssetAssignment['status'], string> = {
            'Active': 'bg-green-100 text-green-800',
            'Returned': 'bg-gray-100 text-gray-800',
            'Lost': 'bg-red-100 text-red-800',
            'Damaged': 'bg-orange-100 text-orange-800'
        };

        return (
            <Badge className={colors[status]}>
                <span className="capitalize">{status}</span>
            </Badge>
        );
    };

    const getCategoryIcon = (category: string) => {
        const icons: Record<string, any> = {
            'Electronics': Package,
            'Laptop': Package,
            'Computer': Package,
            'Phone': Package,
            'default': Package
        };
        const Icon = icons[category] || icons.default;
        return <Icon className="h-5 w-5 text-blue-600" />;
    };

    const activeAssets = assets.filter(a => a.status === 'Assigned');
    const activeAssignments = assignments.filter(a => a.status === 'Active');
    const returnedAssignments = assignments.filter(a => a.status === 'Returned');

    if (loading) {
        return (
            <div className="p-8">
                <div className="flex items-center justify-center h-64">
                    <div className="text-center">
                        <Loader className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
                        <p>Loading your assets...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="p-8 space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-gray-900">My Assets</h1>
                <p className="text-gray-600 mt-1">
                    View and manage your assigned company assets
                </p>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center">
                            <Package className="h-4 w-4 text-blue-600" />
                            <div className="ml-2">
                                <p className="text-sm font-medium text-muted-foreground">Active Assets</p>
                                <p className="text-2xl font-bold">{activeAssets.length}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center">
                            <CheckCircle className="h-4 w-4 text-green-600" />
                            <div className="ml-2">
                                <p className="text-sm font-medium text-muted-foreground">Total Assignments</p>
                                <p className="text-2xl font-bold">{assignments.length}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center">
                            <Star className="h-4 w-4 text-purple-600" />
                            <div className="ml-2">
                                <p className="text-sm font-medium text-muted-foreground">Starter Kit Items</p>
                                <p className="text-2xl font-bold">
                                    {activeAssets.filter(a => a.isEssential).length}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Starter Kit Summary */}
            {activeAssets.some(a => a.isEssential) && (
                <Card className="bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Star className="h-5 w-5 text-purple-600" />
                                <div>
                                    <CardTitle className="text-purple-900">Your Starter Kit</CardTitle>
                                    <CardDescription className="text-purple-700">
                                        Essential equipment for your role
                                    </CardDescription>
                                </div>
                            </div>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setStarterKitExpanded(!starterKitExpanded)}
                                className="text-purple-600 hover:text-purple-800 hover:bg-purple-100"
                            >
                                {starterKitExpanded ? (
                                    <>
                                        <ChevronUp className="h-5 w-5" />
                                        <span className="ml-1 text-sm">Collapse</span>
                                    </>
                                ) : (
                                    <>
                                        <ChevronDown className="h-5 w-5" />
                                        <span className="ml-1 text-sm">Expand</span>
                                    </>
                                )}
                            </Button>
                        </div>
                    </CardHeader>
                    {starterKitExpanded && (
                        <CardContent>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {activeAssets.filter(a => a.isEssential).map(asset => (
                                    <div key={asset.id} className="flex items-center gap-2 bg-white p-3 rounded-lg shadow-sm">
                                        <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-gray-900 truncate">{asset.name}</p>
                                            <p className="text-xs font-semibold text-blue-600">{asset.type || asset.category}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="mt-4 p-3 bg-white rounded-lg">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-gray-600">Kit Completion:</span>
                                    <span className="font-semibold text-purple-900">
                                        {activeAssets.filter(a => a.isEssential).length} / {activeAssets.filter(a => a.isEssential).length} items ✅
                                    </span>
                                </div>
                            </div>
                        </CardContent>
                    )}
                </Card>
            )}

            {/* Main Content */}
            <Tabs defaultValue="active" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="active">Currently Assigned ({activeAssets.length})</TabsTrigger>
                    <TabsTrigger value="history">Assignment History ({assignments.length})</TabsTrigger>
                    <TabsTrigger value="requests">My Requests ({requests.length})</TabsTrigger>
                </TabsList>

                {/* Currently Assigned Assets */}
                <TabsContent value="active" className="space-y-4">
                    {activeAssets.length === 0 ? (
                        <Card>
                            <CardContent className="pt-6">
                                <div className="text-center py-12">
                                    <Package className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No Assets Assigned</h3>
                                    <p className="text-gray-600">
                                        You currently have no assets assigned to you.
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {activeAssets.map(asset => (
                                <Card key={asset.id} className="hover:shadow-lg transition-shadow">
                                    <CardHeader className="pb-3">
                                        <div className="flex items-start justify-between">
                                            <div className="flex items-start space-x-3">
                                                {getCategoryIcon(asset.category)}
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2">
                                                        <CardTitle className="text-lg">{asset.name}</CardTitle>
                                                        {asset.isEssential && (
                                                            <Badge className="bg-purple-100 text-purple-800 text-xs">
                                                                <Star className="h-3 w-3 mr-1" />
                                                                Starter Kit
                                                            </Badge>
                                                        )}
                                                    </div>
                                                    <CardDescription className="mt-1">
                                                        {asset.type && (
                                                            <span className="font-medium text-blue-600">{asset.type}</span>
                                                        )}
                                                        {asset.type && asset.category && ' • '}
                                                        {asset.category}
                                                        {asset.model && ` • ${asset.model}`}
                                                    </CardDescription>
                                                </div>
                                            </div>
                                            <div className="flex flex-col gap-1">
                                                {getConditionBadge(asset.condition)}
                                                {asset.priority && asset.priority !== 'Medium' && (
                                                    <Badge className={
                                                        asset.priority === 'High' ? 'bg-orange-100 text-orange-800 text-xs' :
                                                            asset.priority === 'Urgent' ? 'bg-red-100 text-red-800 text-xs' :
                                                                'bg-gray-100 text-gray-800 text-xs'
                                                    }>
                                                        {asset.priority}
                                                    </Badge>
                                                )}
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-3">
                                            <div className="flex items-center text-sm text-muted-foreground">
                                                <Package className="h-4 w-4 mr-2" />
                                                Serial: {asset.serialNumber}
                                            </div>

                                            {asset.location && (
                                                <div className="flex items-center text-sm text-muted-foreground">
                                                    <MapPin className="h-4 w-4 mr-2" />
                                                    Location: {asset.location}
                                                </div>
                                            )}

                                            {asset.assignedDate && (
                                                <div className="flex items-center text-sm text-muted-foreground">
                                                    <Calendar className="h-4 w-4 mr-2" />
                                                    Assigned: {formatDate(asset.assignedDate)}
                                                </div>
                                            )}

                                            {asset.nextMaintenance && (
                                                <div className={`flex items-center text-sm ${new Date(asset.nextMaintenance) < new Date()
                                                    ? 'text-red-600'
                                                    : 'text-muted-foreground'
                                                    }`}>
                                                    <Wrench className="h-4 w-4 mr-2" />
                                                    Next Maintenance: {formatDate(asset.nextMaintenance)}
                                                    {new Date(asset.nextMaintenance) < new Date() && (
                                                        <span className="ml-2 text-xs font-semibold">(Overdue)</span>
                                                    )}
                                                </div>
                                            )}

                                            {asset.warrantyExpiration && (
                                                <div className="p-2 bg-blue-50 rounded text-sm">
                                                    <span className="text-blue-900 font-medium">Warranty:</span>{' '}
                                                    <span className="text-blue-700">
                                                        Until {formatDate(asset.warrantyExpiration)}
                                                    </span>
                                                </div>
                                            )}

                                            {asset.notes && (
                                                <Alert>
                                                    <AlertCircle className="h-4 w-4" />
                                                    <AlertDescription className="text-xs">
                                                        {asset.notes}
                                                    </AlertDescription>
                                                </Alert>
                                            )}

                                            <Button
                                                variant="outline"
                                                className="w-full mt-2"
                                                onClick={() => {
                                                    setSelectedAsset(asset);
                                                    setShowDetailsModal(true);
                                                }}
                                            >
                                                <Eye className="h-4 w-4 mr-2" />
                                                View Details
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </TabsContent>

                {/* Assignment History */}
                <TabsContent value="history" className="space-y-4">
                    {assignments.length === 0 ? (
                        <Card>
                            <CardContent className="pt-6">
                                <div className="text-center py-12">
                                    <Calendar className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No Assignment History</h3>
                                    <p className="text-gray-600">
                                        You don't have any asset assignment records yet.
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    ) : (
                        assignments.map(assignment => {
                            const asset = assets.find(a => a.id === assignment.assetId);
                            return (
                                <Card key={assignment.id}>
                                    <CardContent className="pt-6">
                                        <div className="flex items-center justify-between">
                                            <div className="space-y-1 flex-1">
                                                <div className="flex items-center space-x-2">
                                                    <h3 className="font-semibold">
                                                        {asset?.name || 'Asset'}
                                                    </h3>
                                                    {asset && (
                                                        <Badge className="bg-gray-100 text-gray-800">{asset.serialNumber}</Badge>
                                                    )}
                                                </div>
                                                <p className="text-sm text-muted-foreground">
                                                    Assigned: {formatDate(assignment.assignedDate)}
                                                    {assignment.returnDate && (
                                                        <span> • Returned: {formatDate(assignment.returnDate)}</span>
                                                    )}
                                                </p>
                                                <div className="flex items-center space-x-2 mt-2">
                                                    <span className="text-sm text-muted-foreground">Condition:</span>
                                                    {getConditionBadge(assignment.condition)}
                                                </div>
                                                {assignment.notes && (
                                                    <p className="text-sm text-muted-foreground mt-2">
                                                        Notes: {assignment.notes}
                                                    </p>
                                                )}
                                            </div>
                                            <div className="ml-4">
                                                {getStatusBadge(assignment.status)}
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })
                    )}
                </TabsContent>

                {/* My Requests Tab */}
                <TabsContent value="requests" className="space-y-4">
                    <div className="flex justify-end mb-4">
                        <Button
                            onClick={() => setShowRequestModal(true)}
                            className="bg-blue-600 hover:bg-blue-700"
                        >
                            <Plus className="h-4 w-4 mr-2" />
                            Request New Asset
                        </Button>
                    </div>

                    {requests.length === 0 ? (
                        <Card>
                            <CardContent className="pt-6">
                                <div className="text-center py-12">
                                    <Send className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No Asset Requests</h3>
                                    <p className="text-gray-600 mb-4">
                                        You haven't requested any assets yet.
                                    </p>
                                    <Button onClick={() => setShowRequestModal(true)}>
                                        <Plus className="h-4 w-4 mr-2" />
                                        Request Your First Asset
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ) : (
                        requests.map(request => (
                            <Card key={request.id}>
                                <CardContent className="pt-6">
                                    <div className="flex items-start justify-between">
                                        <div className="space-y-2 flex-1">
                                            <div className="flex items-center space-x-2">
                                                <h3 className="font-semibold text-lg">
                                                    {request.assetName || request.assetType}
                                                </h3>
                                                <Badge className="text-xs bg-blue-100 text-blue-800">
                                                    {request.assetType}
                                                </Badge>
                                                <Badge className="text-xs bg-gray-100 text-gray-800">
                                                    {request.category}
                                                </Badge>
                                            </div>

                                            <div className="flex items-center space-x-4">
                                                <div className="flex items-center space-x-2">
                                                    <span className="text-sm text-muted-foreground">Status:</span>
                                                    {getRequestStatusBadge(request.status)}
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <span className="text-sm text-muted-foreground">Priority:</span>
                                                    {getPriorityBadge(request.priority)}
                                                </div>
                                            </div>

                                            <div className="p-3 bg-gray-50 rounded-lg mt-2">
                                                <p className="text-sm font-medium text-gray-700 mb-1">Justification:</p>
                                                <p className="text-sm text-gray-600">{request.justification}</p>
                                            </div>

                                            <div className="text-sm text-muted-foreground">
                                                Requested: {formatDate(request.requestedDate)}
                                            </div>

                                            {request.status === 'Approved' && request.approvedBy && (
                                                <div className="p-2 bg-green-50 rounded text-sm text-green-700">
                                                    ✅ Approved by {request.approvedBy} on {formatDate(request.approvedDate)}
                                                </div>
                                            )}

                                            {request.status === 'Rejected' && request.rejectedReason && (
                                                <Alert>
                                                    <AlertCircle className="h-4 w-4" />
                                                    <AlertDescription className="text-sm">
                                                        <strong>Rejected:</strong> {request.rejectedReason}
                                                    </AlertDescription>
                                                </Alert>
                                            )}

                                            {request.status === 'Fulfilled' && (
                                                <div className="p-2 bg-blue-50 rounded text-sm text-blue-700">
                                                    🎉 Fulfilled on {formatDate(request.fulfilledDate)} - Asset has been assigned to you
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))
                    )}
                </TabsContent>
            </Tabs>

            {/* Request Asset Modal */}
            {showRequestModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <Card className="w-full max-w-lg">
                        <CardHeader>
                            <CardTitle>Request New Asset</CardTitle>
                            <CardDescription>
                                Submit a request for an asset you need for your work
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <Label htmlFor="assetType">Asset Type *</Label>
                                <Select
                                    value={requestForm.assetType}
                                    onValueChange={(value) => {
                                        setRequestForm(prev => ({
                                            ...prev,
                                            assetType: value,
                                            assetName: '' // Clear asset name when type changes
                                        }));
                                    }}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select asset type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Laptop">Laptop</SelectItem>
                                        <SelectItem value="Desktop">Desktop</SelectItem>
                                        <SelectItem value="Monitor">Monitor</SelectItem>
                                        <SelectItem value="Phone">Phone</SelectItem>
                                        <SelectItem value="Tablet">Tablet</SelectItem>
                                        <SelectItem value="Keyboard">Keyboard</SelectItem>
                                        <SelectItem value="Mouse">Mouse</SelectItem>
                                        <SelectItem value="Headset">Headset</SelectItem>
                                        <SelectItem value="Desk">Desk</SelectItem>
                                        <SelectItem value="Chair">Chair</SelectItem>
                                        <SelectItem value="Printer">Printer</SelectItem>
                                        <SelectItem value="Scanner">Scanner</SelectItem>
                                        <SelectItem value="Projector">Projector</SelectItem>
                                        <SelectItem value="Server">Server</SelectItem>
                                        <SelectItem value="Router">Router</SelectItem>
                                        <SelectItem value="Other">Other</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <Label htmlFor="assetName">Asset Name *</Label>
                                {requestForm.assetType ? (
                                    <>
                                        <Select
                                            value={requestForm.assetName}
                                            onValueChange={(value) => {
                                                const selectedAsset = availableAssets.find(a => a.id === value);
                                                if (selectedAsset) {
                                                    setRequestForm(prev => ({
                                                        ...prev,
                                                        assetName: selectedAsset.name,
                                                        category: selectedAsset.category
                                                    }));
                                                }
                                            }}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select asset" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {availableAssets
                                                    .filter(a => a.type === requestForm.assetType)
                                                    .map(asset => (
                                                        <SelectItem key={asset.id} value={asset.id}>
                                                            {asset.name} ({asset.serialNumber})
                                                        </SelectItem>
                                                    ))
                                                }
                                                {availableAssets.filter(a => a.type === requestForm.assetType).length === 0 && (
                                                    <SelectItem value="none" disabled>No available {requestForm.assetType}s</SelectItem>
                                                )}
                                            </SelectContent>
                                        </Select>
                                        {availableAssets.filter(a => a.type === requestForm.assetType).length === 0 && (
                                            <Alert className="mt-2 bg-yellow-50 border-yellow-200">
                                                <AlertCircle className="h-4 w-4 text-yellow-600" />
                                                <AlertDescription className="text-sm text-yellow-800">
                                                    No {requestForm.assetType}s currently available. Some may be assigned to employees or under maintenance/repair.
                                                </AlertDescription>
                                            </Alert>
                                        )}
                                    </>
                                ) : (
                                    <div className="p-3 bg-gray-50 rounded-md border border-dashed border-gray-300">
                                        <p className="text-sm text-gray-500">Please select an asset type first</p>
                                    </div>
                                )}
                            </div>

                            <div>
                                <Label htmlFor="category">Category *</Label>
                                <Input
                                    id="category"
                                    value={requestForm.category}
                                    disabled
                                    className="bg-gray-50"
                                    placeholder="Auto-filled from selected asset"
                                />
                            </div>

                            <div>
                                <Label htmlFor="priority">Priority *</Label>
                                <Select
                                    value={requestForm.priority}
                                    onValueChange={(value: any) => setRequestForm(prev => ({ ...prev, priority: value }))}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Urgent">Urgent</SelectItem>
                                        <SelectItem value="High">High</SelectItem>
                                        <SelectItem value="Medium">Medium</SelectItem>
                                        <SelectItem value="Low">Low</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <Label htmlFor="justification">Justification *</Label>
                                <Textarea
                                    id="justification"
                                    placeholder="Explain why you need this asset..."
                                    rows={4}
                                    value={requestForm.justification}
                                    onChange={(e) => setRequestForm(prev => ({ ...prev, justification: e.target.value }))}
                                />
                                <p className="text-xs text-muted-foreground mt-1">
                                    Provide details about how this asset will help you perform your job better
                                </p>
                            </div>

                            <div className="flex space-x-2 pt-4">
                                <Button
                                    onClick={handleSubmitRequest}
                                    disabled={submitting}
                                    className="flex-1"
                                >
                                    {submitting ? (
                                        <>
                                            <Loader className="mr-2 h-4 w-4 animate-spin" />
                                            Submitting...
                                        </>
                                    ) : (
                                        <>
                                            <Send className="mr-2 h-4 w-4" />
                                            Submit Request
                                        </>
                                    )}
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={() => {
                                        setShowRequestModal(false);
                                        setRequestForm({
                                            assetName: '',
                                            assetType: '',
                                            category: '',
                                            justification: '',
                                            priority: 'Medium'
                                        });
                                    }}
                                    disabled={submitting}
                                    className="flex-1"
                                >
                                    Cancel
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Asset Details Modal */}
            {showDetailsModal && selectedAsset && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <CardHeader>
                            <div className="flex items-start justify-between">
                                <div>
                                    <CardTitle>{selectedAsset.name}</CardTitle>
                                    <CardDescription>
                                        {selectedAsset.category}
                                        {selectedAsset.manufacturer && ` • ${selectedAsset.manufacturer}`}
                                        {selectedAsset.model && ` ${selectedAsset.model}`}
                                    </CardDescription>
                                </div>
                                {getConditionBadge(selectedAsset.condition)}
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-muted-foreground">Serial Number</p>
                                    <p className="font-medium">{selectedAsset.serialNumber}</p>
                                </div>

                                <div>
                                    <p className="text-sm text-muted-foreground">Status</p>
                                    <p className="font-medium capitalize">{selectedAsset.status}</p>
                                </div>

                                {selectedAsset.location && (
                                    <div>
                                        <p className="text-sm text-muted-foreground">Location</p>
                                        <p className="font-medium">{selectedAsset.location}</p>
                                    </div>
                                )}

                                <div>
                                    <p className="text-sm text-muted-foreground">Purchase Date</p>
                                    <p className="font-medium">{formatDate(selectedAsset.purchaseDate)}</p>
                                </div>

                                {selectedAsset.assignedDate && (
                                    <div>
                                        <p className="text-sm text-muted-foreground">Assigned Date</p>
                                        <p className="font-medium">{formatDate(selectedAsset.assignedDate)}</p>
                                    </div>
                                )}

                                {selectedAsset.warrantyExpiration && (
                                    <div>
                                        <p className="text-sm text-muted-foreground">Warranty Expiration</p>
                                        <p className="font-medium">{formatDate(selectedAsset.warrantyExpiration)}</p>
                                    </div>
                                )}

                                {selectedAsset.lastMaintenance && (
                                    <div>
                                        <p className="text-sm text-muted-foreground">Last Maintenance</p>
                                        <p className="font-medium">{formatDate(selectedAsset.lastMaintenance)}</p>
                                    </div>
                                )}

                                {selectedAsset.nextMaintenance && (
                                    <div>
                                        <p className="text-sm text-muted-foreground">Next Maintenance</p>
                                        <p className={`font-medium ${new Date(selectedAsset.nextMaintenance) < new Date()
                                            ? 'text-red-600'
                                            : ''
                                            }`}>
                                            {formatDate(selectedAsset.nextMaintenance)}
                                            {new Date(selectedAsset.nextMaintenance) < new Date() && (
                                                <span className="ml-2 text-xs">(Overdue)</span>
                                            )}
                                        </p>
                                    </div>
                                )}
                            </div>

                            {selectedAsset.notes && (
                                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                                    <h4 className="font-semibold text-blue-900 mb-1">Important Notes</h4>
                                    <p className="text-sm text-blue-800">{selectedAsset.notes}</p>
                                </div>
                            )}

                            <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                                <div className="flex items-start space-x-3">
                                    <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                                    <div>
                                        <h4 className="font-semibold text-yellow-900 mb-1">Your Responsibility</h4>
                                        <p className="text-sm text-yellow-800">
                                            You are responsible for maintaining this asset in good condition.
                                            Please report any damage or issues to HR immediately.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex space-x-2 pt-4">
                                <Button
                                    variant="outline"
                                    onClick={() => {
                                        setShowDetailsModal(false);
                                        setSelectedAsset(null);
                                    }}
                                    className="flex-1"
                                >
                                    Close
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
}
