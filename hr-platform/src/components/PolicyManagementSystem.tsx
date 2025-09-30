import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Progress } from './ui/progress';
import {
    FileText,
    CheckCircle,
    Clock,
    Plus,
    Download,
    Eye,
    TrendingUp,
    Edit,
    Upload,
    Save,
    Play,
    Pause,
    FileX
} from 'lucide-react';

interface Policy {
    id: string;
    title: string;
    description: string;
    content: string;
    category: string;
    version: string;
    effectiveDate: Date;
    expiryDate?: Date;
    requiresAcknowledgment: boolean;
    isActive: boolean;
    createdBy: string;
    createdAt: Date;
    lastModified: Date;
    tags: string[];
    attachments?: string[];
}

interface PolicyAcknowledgment {
    id: string;
    policyId: string;
    employeeId: string;
    employeeName: string;
    acknowledgedAt: Date;
    ipAddress: string;
    userAgent: string;
    version: string;
}

interface PolicyManagementSystemProps {
    isHR?: boolean;
    employeeId?: string;
}

export function PolicyManagementSystem({ isHR = false, employeeId = 'emp-001' }: PolicyManagementSystemProps) {
    const [policies, setPolicies] = useState<Policy[]>([]);
    const [acknowledgments, setAcknowledgments] = useState<PolicyAcknowledgment[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('policies');

    // Form states
    const [showNewPolicy, setShowNewPolicy] = useState(false);
    const [selectedPolicy, setSelectedPolicy] = useState<Policy | null>(null);
    const [showPolicyContent, setShowPolicyContent] = useState(false);
    const [editingPolicy, setEditingPolicy] = useState<Policy | null>(null);
    const [showEditPolicy, setShowEditPolicy] = useState(false);

    // New policy form
    const [newPolicy, setNewPolicy] = useState({
        title: '',
        description: '',
        content: '',
        category: 'General',
        version: '1.0',
        effectiveDate: new Date(),
        requiresAcknowledgment: true,
        tags: [] as string[],
        attachments: [] as string[]
    });

    // Load data
    useEffect(() => {
        loadPolicyData();
    }, [isHR, employeeId]);

    const loadPolicyData = async () => {
        try {
            // Sample data - in real implementation, this would come from Firebase
            const samplePolicies: Policy[] = [
                {
                    id: 'pol-001',
                    title: 'Code of Conduct',
                    description: 'Company code of conduct and ethical guidelines',
                    content: 'This policy outlines the expected behavior and ethical standards for all employees...',
                    category: 'General',
                    version: '2.1',
                    effectiveDate: new Date('2024-01-01'),
                    requiresAcknowledgment: true,
                    isActive: true,
                    createdBy: 'HR Manager',
                    createdAt: new Date('2023-12-15'),
                    lastModified: new Date('2024-01-01'),
                    profileStatus: {
                        completeness: 100,
                        status: 'approved',
                        lastUpdated: new Date().toISOString()
                    },
                    tags: ['ethics', 'conduct', 'behavior'],
                    attachments: ['code-of-conduct.pdf']
                },
                {
                    id: 'pol-002',
                    title: 'Remote Work Policy',
                    description: 'Guidelines for remote work arrangements',
                    content: 'This policy establishes guidelines for remote work arrangements...',
                    category: 'Workplace',
                    version: '1.3',
                    effectiveDate: new Date('2024-01-15'),
                    requiresAcknowledgment: true,
                    isActive: true,
                    createdBy: 'HR Manager',
                    createdAt: new Date('2023-12-20'),
                    lastModified: new Date('2024-01-15'),
                    profileStatus: {
                        completeness: 100,
                        status: 'approved',
                        lastUpdated: new Date().toISOString()
                    },
                    tags: ['remote', 'workplace', 'flexibility'],
                    attachments: ['remote-work-guide.pdf']
                },
                {
                    id: 'pol-003',
                    title: 'Data Security Policy',
                    description: 'Information security and data protection guidelines',
                    content: 'This policy outlines the company\'s approach to data security...',
                    category: 'Security',
                    version: '1.0',
                    effectiveDate: new Date('2024-02-01'),
                    requiresAcknowledgment: true,
                    isActive: true,
                    createdBy: 'IT Manager',
                    createdAt: new Date('2024-01-25'),
                    lastModified: new Date('2024-02-01'),
                    profileStatus: {
                        completeness: 100,
                        status: 'approved',
                        lastUpdated: new Date().toISOString()
                    },
                    tags: ['security', 'data', 'privacy'],
                    attachments: ['data-security.pdf']
                }
            ];

            const sampleAcknowledgments: PolicyAcknowledgment[] = [
                {
                    id: 'ack-001',
                    policyId: 'pol-001',
                    employeeId: 'emp-001',
                    employeeName: 'John Doe',
                    acknowledgedAt: new Date('2024-01-02'),
                    ipAddress: '192.168.1.100',
                    userAgent: 'Mozilla/5.0...',
                    version: '2.1'
                },
                {
                    id: 'ack-002',
                    policyId: 'pol-002',
                    employeeId: 'emp-001',
                    employeeName: 'John Doe',
                    acknowledgedAt: new Date('2024-01-16'),
                    ipAddress: '192.168.1.100',
                    userAgent: 'Mozilla/5.0...',
                    version: '1.3'
                }
            ];

            setPolicies(samplePolicies);
            setAcknowledgments(sampleAcknowledgments);
            setLoading(false);
        } catch (error) {
            console.error('Error loading policy data:', error);
            setLoading(false);
        }
    };

    const handleCreatePolicy = (customPolicy?: any) => {
        const policyData = customPolicy || newPolicy;
        const policy: Policy = {
            id: `pol-${Date.now()}`,
            ...policyData,
            isActive: customPolicy ? customPolicy.isActive : true,
            createdAt: new Date(),
            lastModified: new Date(),
            createdBy: 'HR Manager', // In real implementation, get from user context
            profileStatus: {
                completeness: 100,
                status: customPolicy && !customPolicy.isActive ? 'draft' : 'approved',
                lastUpdated: new Date().toISOString()
            },
            tags: policyData.tags || [],
            attachments: policyData.attachments || []
        };
        setPolicies(prev => [...prev, policy]);
        setShowNewPolicy(false);
        setNewPolicy({
            title: '',
            description: '',
            content: '',
            category: 'General',
            version: '1.0',
            effectiveDate: new Date(),
            requiresAcknowledgment: true,
            tags: [],
            attachments: []
        });
    };

    const handleAcknowledgePolicy = (policyId: string) => {
        const acknowledgment: PolicyAcknowledgment = {
            id: `ack-${Date.now()}`,
            policyId,
            employeeId,
            employeeName: 'John Doe', // In real implementation, get from user context
            acknowledgedAt: new Date(),
            ipAddress: '192.168.1.100', // In real implementation, get from request
            userAgent: navigator.userAgent,
            version: policies.find(p => p.id === policyId)?.version || '1.0'
        };
        setAcknowledgments(prev => [...prev, acknowledgment]);
    };

    const handleEditPolicy = (policy: Policy) => {
        setEditingPolicy(policy);
        setShowEditPolicy(true);
    };

    const handleUpdatePolicy = () => {
        if (editingPolicy) {
            setPolicies(prev => prev.map(p =>
                p.id === editingPolicy.id
                    ? { ...editingPolicy, lastModified: new Date() }
                    : p
            ));
            setShowEditPolicy(false);
            setEditingPolicy(null);
        }
    };

    const handleSaveAsDraft = (policyId: string) => {
        setPolicies(prev => prev.map(p =>
            p.id === policyId
                ? { ...p, isActive: false, profileStatus: { ...p.profileStatus, status: 'draft' }, lastModified: new Date() }
                : p
        ));
    };

    const handleActivatePolicy = (policyId: string) => {
        setPolicies(prev => prev.map(p =>
            p.id === policyId
                ? { ...p, isActive: true, profileStatus: { ...p.profileStatus, status: 'approved' }, lastModified: new Date() }
                : p
        ));
    };

    const handleDeactivatePolicy = (policyId: string) => {
        setPolicies(prev => prev.map(p =>
            p.id === policyId
                ? { ...p, isActive: false, profileStatus: { ...p.profileStatus, status: 'pending_review' }, lastModified: new Date() }
                : p
        ));
    };

    const getAcknowledgmentStatus = (policyId: string) => {
        const acknowledgment = acknowledgments.find(ack => ack.policyId === policyId && ack.employeeId === employeeId);
        return acknowledgment ? 'acknowledged' : 'pending';
    };

    const getAcknowledgmentRate = (policyId: string) => {
        const totalEmployees = 100; // In real implementation, get actual employee count
        const acknowledgedCount = acknowledgments.filter(ack => ack.policyId === policyId).length;
        return Math.round((acknowledgedCount / totalEmployees) * 100);
    };

    const filteredPolicies = isHR ? policies : policies.filter(p => p.isActive);

    const pendingPolicies = filteredPolicies.filter(p =>
        p.requiresAcknowledgment && getAcknowledgmentStatus(p.id) === 'pending'
    );

    const acknowledgedPolicies = filteredPolicies.filter(p =>
        p.requiresAcknowledgment && getAcknowledgmentStatus(p.id) === 'acknowledged'
    );

    const draftPolicies = filteredPolicies.filter(p =>
        p.profileStatus && p.profileStatus.status === 'draft'
    );

    if (loading) {
        return (
            <div className="space-y-6">
                <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Loading policy data...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold">Policy Management</h2>
                    <p className="text-muted-foreground">
                        {isHR ? 'Manage company policies and track acknowledgments' : 'Review and acknowledge company policies'}
                    </p>
                </div>
                <div className="flex space-x-2">
                    {isHR && (
                        <>
                            <Button variant="outline" onClick={() => setShowNewPolicy(true)}>
                                <Plus className="h-4 w-4 mr-2" />
                                New Policy
                            </Button>
                            <Button variant="outline">
                                <Download className="h-4 w-4 mr-2" />
                                Export
                            </Button>
                        </>
                    )}
                </div>
            </div>

            {/* Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
                <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 hover:shadow-lg transition-all duration-300">
                    <CardContent className="p-8">
                        <div className="flex items-center space-x-6">
                            <div className="p-4 bg-blue-500 rounded-xl shadow-md">
                                <FileText className="h-8 w-8 text-white" />
                            </div>
                            <div>
                                <p className="text-3xl font-bold text-blue-900">{filteredPolicies.length}</p>
                                <p className="text-base text-blue-700 font-medium">Total Policies</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-yellow-50 to-orange-100 border-yellow-200 hover:shadow-lg transition-all duration-300">
                    <CardContent className="p-8">
                        <div className="flex items-center space-x-6">
                            <div className="p-4 bg-yellow-500 rounded-xl shadow-md">
                                <Clock className="h-8 w-8 text-white" />
                            </div>
                            <div>
                                <p className="text-3xl font-bold text-yellow-900">{pendingPolicies.length}</p>
                                <p className="text-base text-yellow-700 font-medium">Pending</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-green-50 to-emerald-100 border-green-200 hover:shadow-lg transition-all duration-300">
                    <CardContent className="p-8">
                        <div className="flex items-center space-x-6">
                            <div className="p-4 bg-green-500 rounded-xl shadow-md">
                                <CheckCircle className="h-8 w-8 text-white" />
                            </div>
                            <div>
                                <p className="text-3xl font-bold text-green-900">{acknowledgedPolicies.length}</p>
                                <p className="text-base text-green-700 font-medium">Acknowledged</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-gray-50 to-slate-100 border-gray-200 hover:shadow-lg transition-all duration-300">
                    <CardContent className="p-8">
                        <div className="flex items-center space-x-6">
                            <div className="p-4 bg-gray-500 rounded-xl shadow-md">
                                <FileX className="h-8 w-8 text-white" />
                            </div>
                            <div>
                                <p className="text-3xl font-bold text-gray-900">{draftPolicies.length}</p>
                                <p className="text-base text-gray-700 font-medium">Draft</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-purple-50 to-indigo-100 border-purple-200 hover:shadow-lg transition-all duration-300">
                    <CardContent className="p-8">
                        <div className="flex items-center space-x-6">
                            <div className="p-4 bg-purple-500 rounded-xl shadow-md">
                                <TrendingUp className="h-8 w-8 text-white" />
                            </div>
                            <div>
                                <p className="text-3xl font-bold text-purple-900">
                                    {Math.round(acknowledgedPolicies.length / Math.max(filteredPolicies.length, 1) * 100)}%
                                </p>
                                <p className="text-base text-purple-700 font-medium">Compliance Rate</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="policies">All Policies</TabsTrigger>
                    <TabsTrigger value="acknowledgments">Acknowledgments</TabsTrigger>
                </TabsList>


                {/* Policies Tab */}
                <TabsContent value="policies" className="space-y-6">
                    <Card className="bg-white shadow-lg border-0">
                        <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
                            <CardTitle className="text-2xl font-bold text-gray-800">Company Policies</CardTitle>
                        </CardHeader>
                        <CardContent className="p-6">
                            <div className="space-y-6">
                                {filteredPolicies.map((policy) => (
                                    <div key={policy.id} className="border-2 border-gray-100 rounded-xl p-6 space-y-4 bg-gradient-to-r from-white to-gray-50 hover:shadow-lg hover:border-blue-200 transition-all duration-300">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center space-x-3">
                                                <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-md">
                                                    <FileText className="h-6 w-6 text-white" />
                                                </div>
                                                <div>
                                                    <h4 className="font-medium">{policy.title}</h4>
                                                    <p className="text-sm text-muted-foreground">
                                                        {policy.category} • Version {policy.version}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <Badge variant={
                                                    policy.isActive ? "default" :
                                                        (policy.profileStatus && policy.profileStatus.status === 'draft') ? "secondary" :
                                                            "outline"
                                                }>
                                                    {policy.isActive ? "Active" :
                                                        (policy.profileStatus && policy.profileStatus.status === 'draft') ? "Draft" :
                                                            "Inactive"}
                                                </Badge>
                                                {policy.requiresAcknowledgment && (
                                                    <div className="flex items-center space-x-2">
                                                        <Badge
                                                            variant={getAcknowledgmentStatus(policy.id) === 'acknowledged' ? "default" : "secondary"}
                                                            className={getAcknowledgmentStatus(policy.id) === 'acknowledged' ? "bg-green-600" : "bg-yellow-600"}
                                                        >
                                                            {getAcknowledgmentStatus(policy.id)}
                                                        </Badge>
                                                        <div className="text-sm text-muted-foreground">
                                                            {getAcknowledgmentRate(policy.id)}%
                                                        </div>
                                                    </div>
                                                )}
                                                <Button size="sm" variant="outline" onClick={() => {
                                                    setSelectedPolicy(policy);
                                                    setShowPolicyContent(true);
                                                }}>
                                                    <Eye className="h-4 w-4" />
                                                </Button>
                                                {isHR && (
                                                    <div className="flex items-center space-x-1">
                                                        <Button size="sm" variant="outline" onClick={() => handleEditPolicy(policy)}>
                                                            <Edit className="h-4 w-4" />
                                                        </Button>
                                                        {!policy.isActive && (!policy.profileStatus || policy.profileStatus.status !== 'draft') && (
                                                            <Button size="sm" variant="outline" onClick={() => handleSaveAsDraft(policy.id)} title="Save as Draft">
                                                                <Save className="h-4 w-4" />
                                                            </Button>
                                                        )}
                                                        {!policy.isActive && (
                                                            <Button size="sm" variant="outline" onClick={() => handleActivatePolicy(policy.id)} title="Activate Policy">
                                                                <Play className="h-4 w-4" />
                                                            </Button>
                                                        )}
                                                        {policy.isActive && (
                                                            <Button size="sm" variant="outline" onClick={() => handleDeactivatePolicy(policy.id)} title="Deactivate Policy">
                                                                <Pause className="h-4 w-4" />
                                                            </Button>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <p className="text-sm text-muted-foreground">{policy.description}</p>
                                        {policy.attachments && policy.attachments.length > 0 && (
                                            <div className="flex items-center space-x-2">
                                                <FileText className="h-4 w-4 text-blue-500" />
                                                <span className="text-xs text-blue-600">
                                                    {policy.attachments.length} file{policy.attachments.length !== 1 ? 's' : ''} attached
                                                </span>
                                            </div>
                                        )}
                                        <div className="flex items-center justify-between text-sm">
                                            <div className="flex items-center space-x-4">
                                                <span>Effective: {policy.effectiveDate.toLocaleDateString()}</span>
                                                <span>Created: {policy.createdAt.toLocaleDateString()}</span>
                                            </div>
                                            {policy.requiresAcknowledgment && getAcknowledgmentStatus(policy.id) === 'pending' && (
                                                <Button
                                                    size="sm"
                                                    onClick={() => handleAcknowledgePolicy(policy.id)}
                                                >
                                                    Acknowledge
                                                </Button>
                                            )}
                                        </div>
                                        {policy.tags.length > 0 && (
                                            <div className="flex flex-wrap gap-1">
                                                {policy.tags.map((tag, index) => (
                                                    <Badge key={index} variant="outline" className="text-xs">
                                                        {tag}
                                                    </Badge>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Acknowledgments Tab */}
                <TabsContent value="acknowledgments" className="space-y-6">
                    <Card className="bg-white shadow-lg border-0">
                        <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 border-b">
                            <CardTitle className="text-2xl font-bold text-gray-800">Acknowledgment History</CardTitle>
                        </CardHeader>
                        <CardContent className="p-6">
                            <div className="space-y-6">
                                {acknowledgments
                                    .filter(ack => ack.employeeId === employeeId)
                                    .map((acknowledgment) => {
                                        const policy = policies.find(p => p.id === acknowledgment.policyId);
                                        return (
                                            <div key={acknowledgment.id} className="border-2 border-green-100 rounded-xl p-6 space-y-4 bg-gradient-to-r from-green-50 to-emerald-50 hover:shadow-lg hover:border-green-200 transition-all duration-300">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center space-x-4">
                                                        <div className="p-3 bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-md">
                                                            <CheckCircle className="h-6 w-6 text-white" />
                                                        </div>
                                                        <div>
                                                            <h4 className="font-medium">{policy?.title || 'Unknown Policy'}</h4>
                                                            <p className="text-sm text-muted-foreground">
                                                                Version {acknowledgment.version}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <Badge className="bg-gradient-to-r from-green-500 to-green-600 text-white px-4 py-2 text-sm font-semibold shadow-md">
                                                        ✓ Acknowledged
                                                    </Badge>
                                                </div>
                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                                                    <div>
                                                        <Label>Acknowledged On</Label>
                                                        <p>{acknowledgment.acknowledgedAt.toLocaleDateString()}</p>
                                                    </div>
                                                    <div>
                                                        <Label>IP Address</Label>
                                                        <p className="font-mono">{acknowledgment.ipAddress}</p>
                                                    </div>
                                                    <div>
                                                        <Label>User Agent</Label>
                                                        <p className="font-mono text-xs truncate">{acknowledgment.userAgent}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

            </Tabs>

            {/* New Policy Modal */}
            {showNewPolicy && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <CardHeader>
                            <CardTitle>Create New Policy</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Title</Label>
                                    <Input
                                        value={newPolicy.title}
                                        onChange={(e) => setNewPolicy(prev => ({ ...prev, title: e.target.value }))}
                                        placeholder="Policy title"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Category</Label>
                                    <Select value={newPolicy.category} onValueChange={(value) => setNewPolicy(prev => ({ ...prev, category: value }))}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="General">General</SelectItem>
                                            <SelectItem value="Workplace">Workplace</SelectItem>
                                            <SelectItem value="Security">Security</SelectItem>
                                            <SelectItem value="HR">HR</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label>Description</Label>
                                <Textarea
                                    value={newPolicy.description}
                                    onChange={(e) => setNewPolicy(prev => ({ ...prev, description: e.target.value }))}
                                    placeholder="Policy description"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Content</Label>
                                <Textarea
                                    value={newPolicy.content}
                                    onChange={(e) => setNewPolicy(prev => ({ ...prev, content: e.target.value }))}
                                    placeholder="Policy content"
                                    rows={8}
                                />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Version</Label>
                                    <Input
                                        value={newPolicy.version}
                                        onChange={(e) => setNewPolicy(prev => ({ ...prev, version: e.target.value }))}
                                        placeholder="1.0"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Effective Date</Label>
                                    <Input
                                        type="date"
                                        value={newPolicy.effectiveDate.toISOString().split('T')[0]}
                                        onChange={(e) => setNewPolicy(prev => ({ ...prev, effectiveDate: new Date(e.target.value) }))}
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label>Policy Files</Label>
                                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                                    <Upload className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                                    <p className="text-sm text-gray-600 mb-2">Upload policy documents (PDF, DOC, DOCX)</p>
                                    <input
                                        type="file"
                                        multiple
                                        accept=".pdf,.doc,.docx"
                                        className="hidden"
                                        id="new-policy-files"
                                        onChange={(e) => {
                                            const files = Array.from(e.target.files || []);
                                            setNewPolicy(prev => ({
                                                ...prev,
                                                attachments: [...prev.attachments, ...files.map(f => f.name)]
                                            }));
                                        }}
                                    />
                                    <Button
                                        variant="outline"
                                        onClick={() => document.getElementById('new-policy-files')?.click()}
                                    >
                                        <Upload className="h-4 w-4 mr-2" />
                                        Choose Files
                                    </Button>
                                </div>
                                {newPolicy.attachments.length > 0 && (
                                    <div className="space-y-2">
                                        <Label>Attached Files</Label>
                                        <div className="space-y-1">
                                            {newPolicy.attachments.map((file, index) => (
                                                <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                                                    <span className="text-sm">{file}</span>
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => setNewPolicy(prev => ({
                                                            ...prev,
                                                            attachments: prev.attachments.filter((_, i) => i !== index)
                                                        }))}
                                                    >
                                                        Remove
                                                    </Button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                            <div className="flex items-center space-x-2">
                                <input
                                    type="checkbox"
                                    checked={newPolicy.requiresAcknowledgment}
                                    onChange={(e) => setNewPolicy(prev => ({ ...prev, requiresAcknowledgment: e.target.checked }))}
                                />
                                <Label>Requires Employee Acknowledgment</Label>
                            </div>
                            <div className="flex space-x-2">
                                <Button onClick={handleCreatePolicy} className="flex-1">Create Policy</Button>
                                <Button variant="outline" onClick={() => {
                                    const draftPolicy = { ...newPolicy, isActive: false };
                                    handleCreatePolicy(draftPolicy);
                                }}>
                                    <Save className="h-4 w-4 mr-2" />
                                    Save as Draft
                                </Button>
                                <Button variant="outline" onClick={() => setShowNewPolicy(false)}>Cancel</Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Edit Policy Modal */}
            {showEditPolicy && editingPolicy && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <CardHeader>
                            <CardTitle>Edit Policy</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Title</Label>
                                    <Input
                                        value={editingPolicy.title}
                                        onChange={(e) => setEditingPolicy(prev => prev ? { ...prev, title: e.target.value } : null)}
                                        placeholder="Policy title"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Category</Label>
                                    <Select value={editingPolicy.category} onValueChange={(value) => setEditingPolicy(prev => prev ? { ...prev, category: value } : null)}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="General">General</SelectItem>
                                            <SelectItem value="Workplace">Workplace</SelectItem>
                                            <SelectItem value="Security">Security</SelectItem>
                                            <SelectItem value="HR">HR</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label>Description</Label>
                                <Textarea
                                    value={editingPolicy.description}
                                    onChange={(e) => setEditingPolicy(prev => prev ? { ...prev, description: e.target.value } : null)}
                                    placeholder="Policy description"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Content</Label>
                                <Textarea
                                    value={editingPolicy.content}
                                    onChange={(e) => setEditingPolicy(prev => prev ? { ...prev, content: e.target.value } : null)}
                                    placeholder="Policy content"
                                    rows={8}
                                />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Version</Label>
                                    <Input
                                        value={editingPolicy.version}
                                        onChange={(e) => setEditingPolicy(prev => prev ? { ...prev, version: e.target.value } : null)}
                                        placeholder="1.0"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Effective Date</Label>
                                    <Input
                                        type="date"
                                        value={editingPolicy.effectiveDate.toISOString().split('T')[0]}
                                        onChange={(e) => setEditingPolicy(prev => prev ? { ...prev, effectiveDate: new Date(e.target.value) } : null)}
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label>Policy Files</Label>
                                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                                    <Upload className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                                    <p className="text-sm text-gray-600 mb-2">Upload policy documents (PDF, DOC, DOCX)</p>
                                    <input
                                        type="file"
                                        multiple
                                        accept=".pdf,.doc,.docx"
                                        className="hidden"
                                        id="policy-files"
                                        onChange={(e) => {
                                            const files = Array.from(e.target.files || []);
                                            setEditingPolicy(prev => prev ? {
                                                ...prev,
                                                attachments: [...(prev.attachments || []), ...files.map(f => f.name)]
                                            } : null);
                                        }}
                                    />
                                    <Button
                                        variant="outline"
                                        onClick={() => document.getElementById('policy-files')?.click()}
                                    >
                                        <Upload className="h-4 w-4 mr-2" />
                                        Choose Files
                                    </Button>
                                </div>
                                {editingPolicy.attachments && editingPolicy.attachments.length > 0 && (
                                    <div className="space-y-2">
                                        <Label>Attached Files</Label>
                                        <div className="space-y-1">
                                            {editingPolicy.attachments.map((file, index) => (
                                                <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                                                    <span className="text-sm">{file}</span>
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => setEditingPolicy(prev => prev ? ({
                                                            ...prev,
                                                            attachments: prev.attachments?.filter((_, i) => i !== index)
                                                        }) : null)}
                                                    >
                                                        Remove
                                                    </Button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                            <div className="flex items-center space-x-2">
                                <input
                                    type="checkbox"
                                    checked={editingPolicy.requiresAcknowledgment}
                                    onChange={(e) => setEditingPolicy(prev => prev ? { ...prev, requiresAcknowledgment: e.target.checked } : null)}
                                />
                                <Label>Requires Employee Acknowledgment</Label>
                            </div>
                            <div className="flex space-x-2">
                                <Button onClick={handleUpdatePolicy} className="flex-1">Update Policy</Button>
                                <Button variant="outline" onClick={() => {
                                    if (editingPolicy) {
                                        const draftPolicy = { ...editingPolicy, isActive: false };
                                        setEditingPolicy(draftPolicy);
                                        handleUpdatePolicy();
                                    }
                                }}>
                                    <Save className="h-4 w-4 mr-2" />
                                    Save as Draft
                                </Button>
                                <Button variant="outline" onClick={() => {
                                    setShowEditPolicy(false);
                                    setEditingPolicy(null);
                                }}>Cancel</Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Policy Content Modal */}
            {showPolicyContent && selectedPolicy && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle>{selectedPolicy.title}</CardTitle>
                                <Button variant="outline" onClick={() => setShowPolicyContent(false)}>
                                    Close
                                </Button>
                            </div>
                            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                                <span>{selectedPolicy.category}</span>
                                <span>Version {selectedPolicy.version}</span>
                                <span>Effective: {selectedPolicy.effectiveDate.toLocaleDateString()}</span>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="prose max-w-none">
                                <p className="text-muted-foreground">{selectedPolicy.description}</p>
                                <div className="whitespace-pre-wrap">{selectedPolicy.content}</div>
                            </div>
                            {selectedPolicy.requiresAcknowledgment && getAcknowledgmentStatus(selectedPolicy.id) === 'pending' && (
                                <div className="flex justify-center pt-4">
                                    <Button onClick={() => {
                                        handleAcknowledgePolicy(selectedPolicy.id);
                                        setShowPolicyContent(false);
                                    }}>
                                        <CheckCircle className="h-4 w-4 mr-2" />
                                        Acknowledge Policy
                                    </Button>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
}

export default PolicyManagementSystem;