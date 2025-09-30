import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Textarea } from './ui/textarea';
import { Progress } from './ui/progress';
import { Separator } from './ui/separator';
import { useToast } from '../hooks/use-toast';
import {
    FileText,
    Plus,
    Search,
    Filter,
    Download,
    Upload,
    Eye,
    Edit,
    Trash2,
    CheckCircle,
    XCircle,
    Clock,
    AlertTriangle,
    Users,
    Building,
    Calendar,
    MoreHorizontal,
    PenTool,
    Shield,
    BookOpen,
    TrendingUp,
    BarChart3,
    Target
} from 'lucide-react';
import {
    getComprehensiveHRDataFlowService,
    Policy,
    PolicyAcknowledgment
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

interface ComprehensivePolicyManagementProps {
    employeeId: string;
    mode: 'employee' | 'hr';
}

export function ComprehensivePolicyManagement({ employeeId, mode }: ComprehensivePolicyManagementProps) {
    const [policies, setPolicies] = useState<Policy[]>([]);
    const [acknowledgments, setAcknowledgments] = useState<PolicyAcknowledgment[]>([]);
    const [pendingPolicies, setPendingPolicies] = useState<Policy[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'overview' | 'policies' | 'pending' | 'compliance' | 'analytics'>('overview');

    // Policy form state (HR only)
    const [isPolicyDialogOpen, setIsPolicyDialogOpen] = useState(false);
    const [policyForm, setPolicyForm] = useState({
        title: '',
        description: '',
        content: '',
        category: '',
        version: '1.0',
        effectiveDate: '',
        expiryDate: '',
        requiresAcknowledgment: true,
        applicableRoles: [] as string[],
        applicableDepartments: [] as string[],
        tags: [] as string[],
        acknowledgmentDeadline: '',
        complianceRequired: true
    });

    // Acknowledgment form state
    const [isAcknowledgmentDialogOpen, setIsAcknowledgmentDialogOpen] = useState(false);
    const [selectedPolicy, setSelectedPolicy] = useState<Policy | null>(null);
    const [acknowledgmentForm, setAcknowledgmentForm] = useState({
        digitalSignature: '',
        notes: ''
    });

    const [filters, setFilters] = useState({
        category: 'all',
        status: 'all',
        requiresAcknowledgment: 'all'
    });

    const { toast } = useToast();

    useEffect(() => {
        initializePolicyData();
    }, [employeeId, mode]);

    const initializePolicyData = async () => {
        try {
            setLoading(true);
            const dataFlowService = await getComprehensiveHRDataFlowService();

            // Load policies
            const policyData = await dataFlowService.getPolicies(true);
            setPolicies(policyData);

            // Load acknowledgments
            const acknowledgmentData = mode === 'hr'
                ? await dataFlowService.getPolicyAcknowledgments()
                : await dataFlowService.getPolicyAcknowledgments(undefined, employeeId);
            setAcknowledgments(acknowledgmentData);

            // Load pending policies for employee
            if (mode === 'employee') {
                const pendingData = await dataFlowService.getPendingPolicies(employeeId);
                setPendingPolicies(pendingData);
            }

            setLoading(false);
        } catch (error) {
            console.error('Error initializing policy data:', error);
            setLoading(false);
            toast({
                title: "Error",
                description: "Failed to load policy data",
                variant: "destructive"
            });
        }
    };

    const handleCreatePolicy = async () => {
        try {
            if (!policyForm.title || !policyForm.description || !policyForm.content || !policyForm.category) {
                toast({
                    title: "Validation Error",
                    description: "Please fill in all required fields",
                    variant: "destructive"
                });
                return;
            }

            const dataFlowService = await getComprehensiveHRDataFlowService();

            const newPolicy: Omit<Policy, 'id' | 'createdAt' | 'lastModified'> = {
                title: policyForm.title,
                description: policyForm.description,
                content: policyForm.content,
                category: policyForm.category,
                version: policyForm.version,
                effectiveDate: new Date(policyForm.effectiveDate),
                expiryDate: policyForm.expiryDate ? new Date(policyForm.expiryDate) : undefined,
                requiresAcknowledgment: policyForm.requiresAcknowledgment,
                isActive: true,
                applicableRoles: policyForm.applicableRoles,
                applicableDepartments: policyForm.applicableDepartments,
                tags: policyForm.tags,
                acknowledgmentDeadline: policyForm.acknowledgmentDeadline ? new Date(policyForm.acknowledgmentDeadline) : undefined,
                complianceRequired: policyForm.complianceRequired,
                createdBy: employeeId
            };

            await dataFlowService.createPolicy(newPolicy);

            toast({
                title: "Success",
                description: "Policy created successfully",
            });

            setIsPolicyDialogOpen(false);
            resetPolicyForm();
            initializePolicyData();
        } catch (error) {
            console.error('Error creating policy:', error);
            toast({
                title: "Error",
                description: "Failed to create policy",
                variant: "destructive"
            });
        }
    };

    const handleAcknowledgePolicy = async () => {
        try {
            if (!selectedPolicy || !acknowledgmentForm.digitalSignature) {
                toast({
                    title: "Validation Error",
                    description: "Please provide your digital signature",
                    variant: "destructive"
                });
                return;
            }

            const dataFlowService = await getComprehensiveHRDataFlowService();

            const acknowledgment: Omit<PolicyAcknowledgment, 'id' | 'acknowledgedAt'> = {
                policyId: selectedPolicy.id,
                policyTitle: selectedPolicy.title,
                policyVersion: selectedPolicy.version,
                employeeId,
                employeeName: 'Current Employee', // In real app, get from profile
                ipAddress: '192.168.1.1', // In real app, get actual IP
                userAgent: navigator.userAgent,
                deviceInfo: navigator.platform,
                digitalSignature: acknowledgmentForm.digitalSignature,
                isCompliant: true,
                notes: acknowledgmentForm.notes
            };

            await dataFlowService.acknowledgePolicy(acknowledgment);

            toast({
                title: "Success",
                description: "Policy acknowledged successfully",
            });

            setIsAcknowledgmentDialogOpen(false);
            setSelectedPolicy(null);
            resetAcknowledgmentForm();
            initializePolicyData();
        } catch (error) {
            console.error('Error acknowledging policy:', error);
            toast({
                title: "Error",
                description: "Failed to acknowledge policy",
                variant: "destructive"
            });
        }
    };

    const resetPolicyForm = () => {
        setPolicyForm({
            title: '',
            description: '',
            content: '',
            category: '',
            version: '1.0',
            effectiveDate: '',
            expiryDate: '',
            requiresAcknowledgment: true,
            applicableRoles: [],
            applicableDepartments: [],
            tags: [],
            acknowledgmentDeadline: '',
            complianceRequired: true
        });
    };

    const resetAcknowledgmentForm = () => {
        setAcknowledgmentForm({
            digitalSignature: '',
            notes: ''
        });
    };

    const getCategoryIcon = (category: string) => {
        const iconClass = "h-5 w-5";
        switch (category.toLowerCase()) {
            case 'hr':
                return <Users className={iconClass} />;
            case 'safety':
                return <Shield className={iconClass} />;
            case 'compliance':
                return <Target className={iconClass} />;
            case 'it':
                return <Building className={iconClass} />;
            case 'general':
                return <BookOpen className={iconClass} />;
            default:
                return <FileText className={iconClass} />;
        }
    };

    const getStatusBadge = (policy: Policy) => {
        const now = new Date();
        const effectiveDate = new Date(policy.effectiveDate);
        const expiryDate = policy.expiryDate ? new Date(policy.expiryDate) : null;

        if (expiryDate && now > expiryDate) {
            return <Badge variant="destructive">Expired</Badge>;
        }
        if (now < effectiveDate) {
            return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
        }
        if (policy.isActive) {
            return <Badge className="bg-green-100 text-green-800">Active</Badge>;
        }
        return <Badge variant="outline">Inactive</Badge>;
    };

    const getComplianceBadge = (policy: Policy) => {
        if (!policy.requiresAcknowledgment) {
            return <Badge variant="outline">No Action Required</Badge>;
        }

        const policyAcknowledgments = acknowledgments.filter(ack => ack.policyId === policy.id);
        const totalEmployees = 100; // In real app, get actual count
        const acknowledgedCount = policyAcknowledgments.length;
        const complianceRate = (acknowledgedCount / totalEmployees) * 100;

        if (complianceRate >= 95) {
            return <Badge className="bg-green-100 text-green-800">Fully Compliant</Badge>;
        } else if (complianceRate >= 80) {
            return <Badge className="bg-yellow-100 text-yellow-800">Mostly Compliant</Badge>;
        } else {
            return <Badge className="bg-red-100 text-red-800">Non-Compliant</Badge>;
        }
    };

    const getFilteredPolicies = () => {
        let filtered = policies;

        if (filters.category !== 'all') {
            filtered = filtered.filter(policy => policy.category === filters.category);
        }

        if (filters.requiresAcknowledgment !== 'all') {
            const requiresAck = filters.requiresAcknowledgment === 'true';
            filtered = filtered.filter(policy => policy.requiresAcknowledgment === requiresAck);
        }

        return filtered;
    };

    const isAcknowledged = (policyId: string) => {
        return acknowledgments.some(ack => ack.policyId === policyId && ack.employeeId === employeeId);
    };

    const getComplianceStats = () => {
        const totalPolicies = policies.length;
        const acknowledgedPolicies = policies.filter(policy =>
            policy.requiresAcknowledgment && isAcknowledged(policy.id)
        ).length;
        const pendingCount = pendingPolicies.length;
        const complianceRate = totalPolicies > 0 ? (acknowledgedPolicies / totalPolicies) * 100 : 0;

        return {
            totalPolicies,
            acknowledgedPolicies,
            pendingCount,
            complianceRate
        };
    };

    if (loading) {
        return (
            <div className="space-y-6">
                <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Loading policy management data...</p>
                </div>
            </div>
        );
    }

    const complianceStats = getComplianceStats();

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold">Policy Management</h2>
                    <p className="text-muted-foreground">
                        {mode === 'employee'
                            ? 'View company policies and manage your acknowledgments'
                            : 'Create, manage, and track policy compliance across the organization'
                        }
                    </p>
                </div>
                <div className="flex space-x-2">
                    {mode === 'hr' && (
                        <Dialog open={isPolicyDialogOpen} onOpenChange={setIsPolicyDialogOpen}>
                            <DialogTrigger asChild>
                                <Button>
                                    <Plus className="h-4 w-4 mr-2" />
                                    Create Policy
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-4xl">
                                <DialogHeader>
                                    <DialogTitle>Create New Policy</DialogTitle>
                                    <DialogDescription>
                                        Create a new company policy and configure its settings
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="space-y-4 max-h-[600px] overflow-y-auto">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <Label htmlFor="policyTitle">Policy Title</Label>
                                            <Input
                                                id="policyTitle"
                                                value={policyForm.title}
                                                onChange={(e) => setPolicyForm(prev => ({ ...prev, title: e.target.value }))}
                                                placeholder="e.g., Remote Work Policy"
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="category">Category</Label>
                                            <Select
                                                value={policyForm.category}
                                                onValueChange={(value) => setPolicyForm(prev => ({ ...prev, category: value }))}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select category" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="HR">HR Policies</SelectItem>
                                                    <SelectItem value="Safety">Safety & Security</SelectItem>
                                                    <SelectItem value="Compliance">Compliance</SelectItem>
                                                    <SelectItem value="IT">IT Policies</SelectItem>
                                                    <SelectItem value="General">General</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>

                                    <div>
                                        <Label htmlFor="description">Description</Label>
                                        <Textarea
                                            id="description"
                                            value={policyForm.description}
                                            onChange={(e) => setPolicyForm(prev => ({ ...prev, description: e.target.value }))}
                                            placeholder="Brief description of the policy..."
                                            rows={3}
                                        />
                                    </div>

                                    <div>
                                        <Label htmlFor="content">Policy Content</Label>
                                        <Textarea
                                            id="content"
                                            value={policyForm.content}
                                            onChange={(e) => setPolicyForm(prev => ({ ...prev, content: e.target.value }))}
                                            placeholder="Full policy content..."
                                            rows={8}
                                        />
                                    </div>

                                    <div className="grid grid-cols-3 gap-4">
                                        <div>
                                            <Label htmlFor="version">Version</Label>
                                            <Input
                                                id="version"
                                                value={policyForm.version}
                                                onChange={(e) => setPolicyForm(prev => ({ ...prev, version: e.target.value }))}
                                                placeholder="1.0"
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="effectiveDate">Effective Date</Label>
                                            <Input
                                                id="effectiveDate"
                                                type="date"
                                                value={policyForm.effectiveDate}
                                                onChange={(e) => setPolicyForm(prev => ({ ...prev, effectiveDate: e.target.value }))}
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="expiryDate">Expiry Date (Optional)</Label>
                                            <Input
                                                id="expiryDate"
                                                type="date"
                                                value={policyForm.expiryDate}
                                                onChange={(e) => setPolicyForm(prev => ({ ...prev, expiryDate: e.target.value }))}
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <Label htmlFor="acknowledgmentDeadline">Acknowledgment Deadline (Optional)</Label>
                                            <Input
                                                id="acknowledgmentDeadline"
                                                type="date"
                                                value={policyForm.acknowledgmentDeadline}
                                                onChange={(e) => setPolicyForm(prev => ({ ...prev, acknowledgmentDeadline: e.target.value }))}
                                            />
                                        </div>
                                        <div className="space-y-3">
                                            <Label>Policy Settings</Label>
                                            <div className="space-y-2">
                                                <label className="flex items-center space-x-2">
                                                    <input
                                                        type="checkbox"
                                                        checked={policyForm.requiresAcknowledgment}
                                                        onChange={(e) => setPolicyForm(prev => ({ ...prev, requiresAcknowledgment: e.target.checked }))}
                                                    />
                                                    <span className="text-sm">Requires Acknowledgment</span>
                                                </label>
                                                <label className="flex items-center space-x-2">
                                                    <input
                                                        type="checkbox"
                                                        checked={policyForm.complianceRequired}
                                                        onChange={(e) => setPolicyForm(prev => ({ ...prev, complianceRequired: e.target.checked }))}
                                                    />
                                                    <span className="text-sm">Compliance Required</span>
                                                </label>
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <Label htmlFor="tags">Tags (comma-separated)</Label>
                                        <Input
                                            id="tags"
                                            value={policyForm.tags.join(', ')}
                                            onChange={(e) => setPolicyForm(prev => ({
                                                ...prev,
                                                tags: e.target.value.split(',').map(tag => tag.trim()).filter(tag => tag)
                                            }))}
                                            placeholder="remote work, covid-19, flexible hours"
                                        />
                                    </div>

                                    <div className="flex justify-end space-x-2">
                                        <Button variant="outline" onClick={() => setIsPolicyDialogOpen(false)}>
                                            Cancel
                                        </Button>
                                        <Button onClick={handleCreatePolicy}>
                                            Create Policy
                                        </Button>
                                    </div>
                                </div>
                            </DialogContent>
                        </Dialog>
                    )}

                    <Button variant="outline">
                        <Download className="h-4 w-4 mr-2" />
                        Export Policies
                    </Button>
                </div>
            </div>

            {/* Navigation Tabs */}
            <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
                <TabsList className="grid w-full grid-cols-5">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="policies">
                        {mode === 'employee' ? 'All Policies' : 'Manage Policies'}
                    </TabsTrigger>
                    {mode === 'employee' && <TabsTrigger value="pending">Pending ({pendingPolicies.length})</TabsTrigger>}
                    <TabsTrigger value="compliance">Compliance</TabsTrigger>
                    {mode === 'hr' && <TabsTrigger value="analytics">Analytics</TabsTrigger>}
                </TabsList>

                {/* Overview Tab */}
                <TabsContent value="overview" className="space-y-6">
                    {/* Statistics Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <Card>
                            <CardContent className="p-6">
                                <div className="flex items-center space-x-4">
                                    <div className="p-3 bg-blue-100 rounded-lg">
                                        <FileText className="h-6 w-6 text-blue-600" />
                                    </div>
                                    <div>
                                        <p className="text-2xl font-bold">{policies.length}</p>
                                        <p className="text-sm text-muted-foreground">Total Policies</p>
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
                                        <p className="text-2xl font-bold">{complianceStats.acknowledgedPolicies}</p>
                                        <p className="text-sm text-muted-foreground">
                                            {mode === 'employee' ? 'Acknowledged' : 'Compliant'}
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="p-6">
                                <div className="flex items-center space-x-4">
                                    <div className="p-3 bg-yellow-100 rounded-lg">
                                        <Clock className="h-6 w-6 text-yellow-600" />
                                    </div>
                                    <div>
                                        <p className="text-2xl font-bold">{complianceStats.pendingCount}</p>
                                        <p className="text-sm text-muted-foreground">Pending Action</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="p-6">
                                <div className="flex items-center space-x-4">
                                    <div className="p-3 bg-purple-100 rounded-lg">
                                        <TrendingUp className="h-6 w-6 text-purple-600" />
                                    </div>
                                    <div>
                                        <p className="text-2xl font-bold">{Math.round(complianceStats.complianceRate)}%</p>
                                        <p className="text-sm text-muted-foreground">Compliance Rate</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Compliance Progress */}
                    {mode === 'employee' && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center space-x-2">
                                    <Target className="h-5 w-5" />
                                    <span>Your Compliance Progress</span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium">Overall Compliance</span>
                                        <span className="text-sm text-muted-foreground">
                                            {complianceStats.acknowledgedPolicies} of {complianceStats.totalPolicies} policies
                                        </span>
                                    </div>
                                    <Progress value={complianceStats.complianceRate} className="h-3" />
                                    <div className="flex justify-between text-xs text-muted-foreground">
                                        <span>0%</span>
                                        <span>100%</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Recent Policies */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center space-x-2">
                                <Calendar className="h-5 w-5" />
                                <span>Recent Policy Updates</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {policies.slice(0, 5).map((policy) => (
                                    <div key={policy.id} className="flex items-center justify-between p-3 border rounded-lg">
                                        <div className="flex items-center space-x-3">
                                            {getCategoryIcon(policy.category)}
                                            <div>
                                                <p className="font-medium">{policy.title}</p>
                                                <p className="text-sm text-muted-foreground">
                                                    Version {policy.version} • {policy.category}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            {getStatusBadge(policy)}
                                            {mode === 'employee' && policy.requiresAcknowledgment && !isAcknowledged(policy.id) && (
                                                <Badge variant="destructive" className="animate-pulse">
                                                    Action Required
                                                </Badge>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Policies Tab */}
                <TabsContent value="policies" className="space-y-6">
                    {/* Filters */}
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center space-x-4">
                                <div className="flex-1">
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            placeholder="Search policies..."
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
                                        <SelectItem value="HR">HR Policies</SelectItem>
                                        <SelectItem value="Safety">Safety & Security</SelectItem>
                                        <SelectItem value="Compliance">Compliance</SelectItem>
                                        <SelectItem value="IT">IT Policies</SelectItem>
                                        <SelectItem value="General">General</SelectItem>
                                    </SelectContent>
                                </Select>
                                <Select
                                    value={filters.requiresAcknowledgment}
                                    onValueChange={(value) => setFilters(prev => ({ ...prev, requiresAcknowledgment: value }))}
                                >
                                    <SelectTrigger className="w-48">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Policies</SelectItem>
                                        <SelectItem value="true">Requires Acknowledgment</SelectItem>
                                        <SelectItem value="false">No Acknowledgment</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Policies Table */}
                    <Card>
                        <CardContent className="p-0">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Policy</TableHead>
                                        <TableHead>Category</TableHead>
                                        <TableHead>Version</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Effective Date</TableHead>
                                        {mode === 'employee' && <TableHead>Your Status</TableHead>}
                                        {mode === 'hr' && <TableHead>Compliance</TableHead>}
                                        <TableHead>Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {getFilteredPolicies().map((policy) => (
                                        <TableRow key={policy.id}>
                                            <TableCell>
                                                <div className="flex items-center space-x-3">
                                                    {getCategoryIcon(policy.category)}
                                                    <div>
                                                        <p className="font-medium">{policy.title}</p>
                                                        <p className="text-sm text-muted-foreground line-clamp-1">
                                                            {policy.description}
                                                        </p>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline">{policy.category}</Badge>
                                            </TableCell>
                                            <TableCell className="font-mono text-sm">{policy.version}</TableCell>
                                            <TableCell>{getStatusBadge(policy)}</TableCell>
                                            <TableCell>
                                                {new Date(policy.effectiveDate).toLocaleDateString()}
                                            </TableCell>
                                            {mode === 'employee' && (
                                                <TableCell>
                                                    {policy.requiresAcknowledgment ? (
                                                        isAcknowledged(policy.id) ? (
                                                            <Badge className="bg-green-100 text-green-800">
                                                                <CheckCircle className="h-3 w-3 mr-1" />
                                                                Acknowledged
                                                            </Badge>
                                                        ) : (
                                                            <Badge variant="destructive">
                                                                <AlertTriangle className="h-3 w-3 mr-1" />
                                                                Pending
                                                            </Badge>
                                                        )
                                                    ) : (
                                                        <Badge variant="outline">No Action Required</Badge>
                                                    )}
                                                </TableCell>
                                            )}
                                            {mode === 'hr' && (
                                                <TableCell>{getComplianceBadge(policy)}</TableCell>
                                            )}
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
                                                            View Policy
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem>
                                                            <Download className="h-4 w-4 mr-2" />
                                                            Download PDF
                                                        </DropdownMenuItem>
                                                        {mode === 'employee' && policy.requiresAcknowledgment && !isAcknowledged(policy.id) && (
                                                            <DropdownMenuItem
                                                                onClick={() => {
                                                                    setSelectedPolicy(policy);
                                                                    setIsAcknowledgmentDialogOpen(true);
                                                                }}
                                                            >
                                                                <PenTool className="h-4 w-4 mr-2" />
                                                                Acknowledge
                                                            </DropdownMenuItem>
                                                        )}
                                                        {mode === 'hr' && (
                                                            <>
                                                                <DropdownMenuSeparator />
                                                                <DropdownMenuItem>
                                                                    <Edit className="h-4 w-4 mr-2" />
                                                                    Edit Policy
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem>
                                                                    <BarChart3 className="h-4 w-4 mr-2" />
                                                                    View Analytics
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem className="text-red-600">
                                                                    <Trash2 className="h-4 w-4 mr-2" />
                                                                    Deactivate
                                                                </DropdownMenuItem>
                                                            </>
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

                {/* Pending Tab (Employee Only) */}
                {mode === 'employee' && (
                    <TabsContent value="pending" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center space-x-2">
                                    <AlertTriangle className="h-5 w-5 text-yellow-600" />
                                    <span>Policies Requiring Your Acknowledgment</span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {pendingPolicies.length === 0 ? (
                                    <div className="text-center py-8">
                                        <CheckCircle className="h-12 w-12 mx-auto text-green-500 mb-4" />
                                        <h3 className="text-lg font-semibold mb-2">All Caught Up!</h3>
                                        <p className="text-muted-foreground">
                                            You have acknowledged all policies that require your attention.
                                        </p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {pendingPolicies.map((policy) => (
                                            <Card key={policy.id} className="border-l-4 border-l-yellow-500">
                                                <CardContent className="p-4">
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center space-x-4">
                                                            {getCategoryIcon(policy.category)}
                                                            <div>
                                                                <h4 className="font-semibold">{policy.title}</h4>
                                                                <p className="text-sm text-muted-foreground">
                                                                    {policy.description}
                                                                </p>
                                                                <div className="flex items-center space-x-4 mt-2 text-xs text-muted-foreground">
                                                                    <span>Version {policy.version}</span>
                                                                    <span>•</span>
                                                                    <span>Effective: {new Date(policy.effectiveDate).toLocaleDateString()}</span>
                                                                    {policy.acknowledgmentDeadline && (
                                                                        <>
                                                                            <span>•</span>
                                                                            <span className="text-red-600">
                                                                                Deadline: {new Date(policy.acknowledgmentDeadline).toLocaleDateString()}
                                                                            </span>
                                                                        </>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center space-x-2">
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={() => {
                                                                    // View policy logic
                                                                }}
                                                            >
                                                                <Eye className="h-4 w-4 mr-2" />
                                                                View
                                                            </Button>
                                                            <Button
                                                                size="sm"
                                                                onClick={() => {
                                                                    setSelectedPolicy(policy);
                                                                    setIsAcknowledgmentDialogOpen(true);
                                                                }}
                                                            >
                                                                <PenTool className="h-4 w-4 mr-2" />
                                                                Acknowledge
                                                            </Button>
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
                )}

                {/* Compliance Tab */}
                <TabsContent value="compliance" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>
                                {mode === 'employee' ? 'Your Acknowledgment History' : 'Compliance Overview'}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {acknowledgments.map((ack) => {
                                    const policy = policies.find(p => p.id === ack.policyId);
                                    return (
                                        <div key={ack.id} className="flex items-center justify-between p-3 border rounded-lg">
                                            <div className="flex items-center space-x-3">
                                                {policy && getCategoryIcon(policy.category)}
                                                <div>
                                                    <p className="font-medium">{ack.policyTitle}</p>
                                                    <p className="text-sm text-muted-foreground">
                                                        Version {ack.policyVersion} • Acknowledged on {new Date(ack.acknowledgedAt).toLocaleDateString()}
                                                    </p>
                                                    {mode === 'hr' && (
                                                        <p className="text-xs text-muted-foreground">
                                                            By {ack.employeeName} • IP: {ack.ipAddress}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                            <Badge className="bg-green-100 text-green-800">
                                                <CheckCircle className="h-3 w-3 mr-1" />
                                                Compliant
                                            </Badge>
                                        </div>
                                    );
                                })}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            {/* Acknowledgment Dialog */}
            <Dialog open={isAcknowledgmentDialogOpen} onOpenChange={setIsAcknowledgmentDialogOpen}>
                <DialogContent className="max-w-3xl">
                    <DialogHeader>
                        <DialogTitle>Acknowledge Policy</DialogTitle>
                        <DialogDescription>
                            Please review the policy and provide your acknowledgment
                        </DialogDescription>
                    </DialogHeader>
                    {selectedPolicy && (
                        <div className="space-y-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg">{selectedPolicy.title}</CardTitle>
                                    <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                                        <span>Version {selectedPolicy.version}</span>
                                        <span>•</span>
                                        <span>Category: {selectedPolicy.category}</span>
                                        <span>•</span>
                                        <span>Effective: {new Date(selectedPolicy.effectiveDate).toLocaleDateString()}</span>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="max-h-60 overflow-y-auto">
                                        <p className="text-sm whitespace-pre-wrap">{selectedPolicy.content}</p>
                                    </div>
                                </CardContent>
                            </Card>

                            <div className="space-y-4">
                                <div>
                                    <Label htmlFor="digitalSignature">Digital Signature (Type your full name)</Label>
                                    <Input
                                        id="digitalSignature"
                                        value={acknowledgmentForm.digitalSignature}
                                        onChange={(e) => setAcknowledgmentForm(prev => ({ ...prev, digitalSignature: e.target.value }))}
                                        placeholder="Type your full name as digital signature"
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="notes">Additional Notes (Optional)</Label>
                                    <Textarea
                                        id="notes"
                                        value={acknowledgmentForm.notes}
                                        onChange={(e) => setAcknowledgmentForm(prev => ({ ...prev, notes: e.target.value }))}
                                        placeholder="Any additional comments or questions..."
                                        rows={3}
                                    />
                                </div>

                                <div className="p-4 bg-blue-50 rounded-lg">
                                    <div className="flex items-start space-x-3">
                                        <Shield className="h-5 w-5 text-blue-600 mt-0.5" />
                                        <div className="text-sm">
                                            <p className="font-medium text-blue-900">Acknowledgment Declaration</p>
                                            <p className="text-blue-800 mt-1">
                                                By providing your digital signature, you acknowledge that you have read,
                                                understood, and agree to comply with this policy. This acknowledgment is
                                                legally binding and will be recorded with your IP address and timestamp.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end space-x-2">
                                <Button variant="outline" onClick={() => setIsAcknowledgmentDialogOpen(false)}>
                                    Cancel
                                </Button>
                                <Button onClick={handleAcknowledgePolicy}>
                                    <PenTool className="h-4 w-4 mr-2" />
                                    Acknowledge Policy
                                </Button>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}

export default ComprehensivePolicyManagement;


