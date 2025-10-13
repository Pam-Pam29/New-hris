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
    TrendingUp
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
    const [activeTab, setActiveTab] = useState(isHR ? 'overview' : 'policies');

    // Form states
    const [showNewPolicy, setShowNewPolicy] = useState(false);
    const [selectedPolicy, setSelectedPolicy] = useState<Policy | null>(null);
    const [showPolicyContent, setShowPolicyContent] = useState(false);

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

    const handleCreatePolicy = () => {
        const policy: Policy = {
            id: `pol-${Date.now()}`,
            ...newPolicy,
            isActive: true,
            createdAt: new Date(),
            lastModified: new Date(),
            createdBy: 'HR Manager' // In real implementation, get from user context
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
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center space-x-4">
                            <div className="p-2 bg-blue-100 rounded-lg">
                                <FileText className="h-6 w-6 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">{filteredPolicies.length}</p>
                                <p className="text-sm text-muted-foreground">Total Policies</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center space-x-4">
                            <div className="p-2 bg-yellow-100 rounded-lg">
                                <Clock className="h-6 w-6 text-yellow-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">{pendingPolicies.length}</p>
                                <p className="text-sm text-muted-foreground">Pending</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center space-x-4">
                            <div className="p-2 bg-green-100 rounded-lg">
                                <CheckCircle className="h-6 w-6 text-green-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">{acknowledgedPolicies.length}</p>
                                <p className="text-sm text-muted-foreground">Acknowledged</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center space-x-4">
                            <div className="p-2 bg-purple-100 rounded-lg">
                                <TrendingUp className="h-6 w-6 text-purple-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">
                                    {Math.round(acknowledgedPolicies.length / Math.max(filteredPolicies.length, 1) * 100)}%
                                </p>
                                <p className="text-sm text-muted-foreground">Compliance Rate</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="policies">Policies</TabsTrigger>
                    <TabsTrigger value="acknowledgments">Acknowledgments</TabsTrigger>
                    {isHR && <TabsTrigger value="compliance">Compliance</TabsTrigger>}
                </TabsList>

                {/* Overview Tab */}
                <TabsContent value="overview" className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Policy Overview */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Policy Overview</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {filteredPolicies.slice(0, 5).map((policy) => (
                                    <div key={policy.id} className="flex items-center justify-between p-3 border rounded-lg">
                                        <div>
                                            <p className="font-medium">{policy.title}</p>
                                            <p className="text-sm text-muted-foreground">
                                                {policy.category} • v{policy.version}
                                            </p>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <Badge variant={policy.isActive ? "default" : "secondary"}>
                                                {policy.isActive ? "Active" : "Inactive"}
                                            </Badge>
                                            {policy.requiresAcknowledgment && (
                                                <Badge
                                                    variant={getAcknowledgmentStatus(policy.id) === 'acknowledged' ? "default" : "secondary"}
                                                    className={getAcknowledgmentStatus(policy.id) === 'acknowledged' ? "bg-green-600" : "bg-yellow-600"}
                                                >
                                                    {getAcknowledgmentStatus(policy.id)}
                                                </Badge>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>

                        {/* Compliance Overview */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Compliance Status</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium">Overall Compliance</span>
                                        <span className="text-sm text-muted-foreground">
                                            {Math.round(acknowledgedPolicies.length / Math.max(filteredPolicies.length, 1) * 100)}%
                                        </span>
                                    </div>
                                    <Progress
                                        value={acknowledgedPolicies.length / Math.max(filteredPolicies.length, 1) * 100}
                                        className="h-2"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="text-center p-3 bg-green-50 rounded-lg">
                                        <div className="text-lg font-semibold text-green-700">{acknowledgedPolicies.length}</div>
                                        <div className="text-xs text-green-600">Acknowledged</div>
                                    </div>
                                    <div className="text-center p-3 bg-yellow-50 rounded-lg">
                                        <div className="text-lg font-semibold text-yellow-700">{pendingPolicies.length}</div>
                                        <div className="text-xs text-yellow-600">Pending</div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                {/* Policies Tab */}
                <TabsContent value="policies" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Company Policies</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {filteredPolicies.map((policy) => (
                                    <div key={policy.id} className="border rounded-lg p-4 space-y-3">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center space-x-3">
                                                <div className="p-2 bg-blue-100 rounded-lg">
                                                    <FileText className="h-5 w-5 text-blue-600" />
                                                </div>
                                                <div>
                                                    <h4 className="font-medium">{policy.title}</h4>
                                                    <p className="text-sm text-muted-foreground">
                                                        {policy.category} • Version {policy.version}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <Badge variant={policy.isActive ? "default" : "secondary"}>
                                                    {policy.isActive ? "Active" : "Inactive"}
                                                </Badge>
                                                {policy.requiresAcknowledgment && (
                                                    <Badge
                                                        variant={getAcknowledgmentStatus(policy.id) === 'acknowledged' ? "default" : "secondary"}
                                                        className={getAcknowledgmentStatus(policy.id) === 'acknowledged' ? "bg-green-600" : "bg-yellow-600"}
                                                    >
                                                        {getAcknowledgmentStatus(policy.id)}
                                                    </Badge>
                                                )}
                                                <Button size="sm" variant="outline" onClick={() => {
                                                    setSelectedPolicy(policy);
                                                    setShowPolicyContent(true);
                                                }}>
                                                    <Eye className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                        <p className="text-sm text-muted-foreground">{policy.description}</p>
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
                    <Card>
                        <CardHeader>
                            <CardTitle>Acknowledgment History</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {acknowledgments
                                    .filter(ack => ack.employeeId === employeeId)
                                    .map((acknowledgment) => {
                                        const policy = policies.find(p => p.id === acknowledgment.policyId);
                                        return (
                                            <div key={acknowledgment.id} className="border rounded-lg p-4 space-y-3">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center space-x-3">
                                                        <div className="p-2 bg-green-100 rounded-lg">
                                                            <CheckCircle className="h-5 w-5 text-green-600" />
                                                        </div>
                                                        <div>
                                                            <h4 className="font-medium">{policy?.title || 'Unknown Policy'}</h4>
                                                            <p className="text-sm text-muted-foreground">
                                                                Version {acknowledgment.version}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <Badge className="bg-green-100 text-green-800">
                                                        Acknowledged
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

                {/* Compliance Tab (HR Only) */}
                {isHR && (
                    <TabsContent value="compliance" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Compliance Reports</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-6">
                                    {policies.filter(p => p.requiresAcknowledgment).map((policy) => (
                                        <div key={policy.id} className="border rounded-lg p-4 space-y-4">
                                            <div className="flex items-center justify-between">
                                                <h4 className="font-medium">{policy.title}</h4>
                                                <Badge variant="outline">
                                                    {getAcknowledgmentRate(policy.id)}% Compliance
                                                </Badge>
                                            </div>
                                            <div className="space-y-2">
                                                <div className="flex items-center justify-between text-sm">
                                                    <span>Acknowledgment Rate</span>
                                                    <span>{getAcknowledgmentRate(policy.id)}%</span>
                                                </div>
                                                <Progress value={getAcknowledgmentRate(policy.id)} className="h-2" />
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                                                <div>
                                                    <Label>Total Employees</Label>
                                                    <p>100</p>
                                                </div>
                                                <div>
                                                    <Label>Acknowledged</Label>
                                                    <p className="text-green-600">{acknowledgments.filter(ack => ack.policyId === policy.id).length}</p>
                                                </div>
                                                <div>
                                                    <Label>Pending</Label>
                                                    <p className="text-yellow-600">
                                                        {100 - acknowledgments.filter(ack => ack.policyId === policy.id).length}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                )}
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
                                <Button variant="outline" onClick={() => setShowNewPolicy(false)}>Cancel</Button>
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