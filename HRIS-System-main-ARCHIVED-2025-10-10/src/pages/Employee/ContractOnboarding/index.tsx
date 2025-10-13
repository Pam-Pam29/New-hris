import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../components/ui/tabs';
import {
    FileText,
    CheckCircle,
    Clock,
    Upload,
    AlertCircle,
    Download,
    Eye,
    Send,
    Calendar,
    Building,
    Users,
    Settings
} from 'lucide-react';
import { Contract, OnboardingChecklist, Document } from '../types';

// Mock data - replace with actual API calls
const mockContract: Contract = {
    id: 'contract-001',
    employeeId: 'emp-001',
    type: 'employment',
    status: 'pending',
    startDate: new Date('2024-12-15'),
    endDate: new Date('2025-12-14'),
    position: 'Software Engineer',
    department: 'Engineering',
    salary: 75000,
    currency: 'USD',
    benefits: ['Health Insurance', 'Dental Insurance', '401k', 'PTO'],
    terms: 'Full-time employment with standard benefits package...',
    version: 1,
    createdAt: new Date('2024-12-10'),
    updatedAt: new Date('2024-12-10')
};

const mockOnboardingChecklist: OnboardingChecklist = {
    id: 'checklist-001',
    employeeId: 'emp-001',
    status: 'in_progress',
    startedAt: new Date('2024-12-10'),
    items: [
        {
            id: 'item-001',
            title: 'Sign Employment Contract',
            description: 'Review and sign your employment contract',
            category: 'document',
            required: true,
            status: 'pending',
            dueDate: new Date('2024-12-12')
        },
        {
            id: 'item-002',
            title: 'Upload Identity Documents',
            description: 'Upload driver\'s license, passport, or state ID',
            category: 'document',
            required: true,
            status: 'completed',
            completedAt: new Date('2024-12-10')
        },
        {
            id: 'item-003',
            title: 'Complete Tax Forms',
            description: 'Fill out W-4 and state tax forms',
            category: 'document',
            required: true,
            status: 'in_progress',
            dueDate: new Date('2024-12-15')
        },
        {
            id: 'item-004',
            title: 'Banking Information',
            description: 'Provide direct deposit information',
            category: 'document',
            required: true,
            status: 'pending',
            dueDate: new Date('2024-12-15')
        },
        {
            id: 'item-005',
            title: 'Emergency Contact Form',
            description: 'Provide emergency contact information',
            category: 'document',
            required: true,
            status: 'pending',
            dueDate: new Date('2024-12-15')
        },
        {
            id: 'item-006',
            title: 'IT Equipment Setup',
            description: 'Receive and configure company laptop',
            category: 'equipment',
            required: true,
            status: 'pending',
            dueDate: new Date('2024-12-16')
        },
        {
            id: 'item-007',
            title: 'Company Orientation',
            description: 'Attend company orientation session',
            category: 'meeting',
            required: true,
            status: 'pending',
            dueDate: new Date('2024-12-17')
        },
        {
            id: 'item-008',
            title: 'Safety Training',
            description: 'Complete workplace safety training',
            category: 'training',
            required: true,
            status: 'pending',
            dueDate: new Date('2024-12-18')
        }
    ]
};

const mockDocuments: Document[] = [
    {
        id: 'doc-001',
        name: 'Driver\'s License',
        type: 'identity',
        category: 'identity_verification',
        url: '/documents/drivers-license.pdf',
        uploadedAt: new Date('2024-12-10'),
        status: 'approved',
        required: true
    },
    {
        id: 'doc-002',
        name: 'W-4 Tax Form',
        type: 'tax',
        category: 'tax_forms',
        url: '/documents/w4-form.pdf',
        uploadedAt: new Date('2024-12-11'),
        status: 'pending',
        required: true
    }
];

export default function ContractOnboarding() {
    const [contract, setContract] = useState<Contract>(mockContract);
    const [checklist, setChecklist] = useState<OnboardingChecklist>(mockOnboardingChecklist);
    const [documents] = useState<Document[]>(mockDocuments);
    const [loading, setLoading] = useState(false);

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'completed': return <CheckCircle className="h-5 w-5 text-green-500" />;
            case 'in_progress': return <Clock className="h-5 w-5 text-yellow-500" />;
            case 'pending': return <AlertCircle className="h-5 w-5 text-gray-400" />;
            default: return <AlertCircle className="h-5 w-5 text-gray-400" />;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'completed': return 'bg-green-100 text-green-800';
            case 'in_progress': return 'bg-yellow-100 text-yellow-800';
            case 'pending': return 'bg-gray-100 text-gray-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getCategoryIcon = (category: string) => {
        switch (category) {
            case 'document': return <FileText className="h-4 w-4" />;
            case 'system': return <Settings className="h-4 w-4" />;
            case 'training': return <Users className="h-4 w-4" />;
            case 'meeting': return <Calendar className="h-4 w-4" />;
            case 'equipment': return <Building className="h-4 w-4" />;
            default: return <FileText className="h-4 w-4" />;
        }
    };

    const getDocumentStatusColor = (status: string) => {
        switch (status) {
            case 'approved': return 'bg-green-100 text-green-800';
            case 'pending': return 'bg-yellow-100 text-yellow-800';
            case 'rejected': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const formatDate = (date: Date) => {
        return new Intl.DateTimeFormat('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        }).format(date);
    };

    const formatCurrency = (amount: number, currency: string) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currency
        }).format(amount);
    };

    const completedItems = checklist.items.filter(item => item.status === 'completed').length;
    const totalItems = checklist.items.length;
    const progressPercentage = (completedItems / totalItems) * 100;

    const handleSignContract = async () => {
        setLoading(true);
        try {
            // Simulate contract signing
            await new Promise(resolve => setTimeout(resolve, 2000));
            setContract(prev => ({ ...prev, status: 'signed', signedAt: new Date() }));
        } catch (error) {
            console.error('Error signing contract:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleUploadDocument = (itemId: string) => {
        // Implement document upload logic
        console.log('Upload document for item:', itemId);
    };

    const handleMarkComplete = (itemId: string) => {
        setChecklist(prev => ({
            ...prev,
            items: prev.items.map(item =>
                item.id === itemId
                    ? { ...item, status: 'completed', completedAt: new Date() }
                    : item
            )
        }));
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 p-6">
            <div className="max-w-6xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-foreground">Contract & Onboarding</h1>
                        <p className="text-muted-foreground mt-2">
                            Complete your employment contract and onboarding checklist
                        </p>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Badge className={getStatusColor(checklist.status)}>
                            {checklist.status.replace('_', ' ').toUpperCase()}
                        </Badge>
                    </div>
                </div>

                {/* Progress Overview */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                            <CheckCircle className="h-5 w-5" />
                            <span>Onboarding Progress</span>
                        </CardTitle>
                        <CardDescription>
                            Complete all required items to finish your onboarding
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span>Progress</span>
                                <span>{completedItems} of {totalItems} completed</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                    className="bg-primary h-2 rounded-full"
                                    style={{ width: `${progressPercentage}%` }}
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="text-center">
                                <div className="text-2xl font-bold text-green-600">{completedItems}</div>
                                <div className="text-sm text-muted-foreground">Completed</div>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-bold text-yellow-600">
                                    {checklist.items.filter(item => item.status === 'in_progress').length}
                                </div>
                                <div className="text-sm text-muted-foreground">In Progress</div>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-bold text-gray-600">
                                    {checklist.items.filter(item => item.status === 'pending').length}
                                </div>
                                <div className="text-sm text-muted-foreground">Pending</div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Main Content */}
                <Tabs defaultValue="contract" className="space-y-4">
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="contract">Employment Contract</TabsTrigger>
                        <TabsTrigger value="checklist">Onboarding Checklist</TabsTrigger>
                        <TabsTrigger value="documents">Documents</TabsTrigger>
                    </TabsList>

                    <TabsContent value="contract" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center space-x-2">
                                    <FileText className="h-5 w-5" />
                                    <span>Employment Contract</span>
                                </CardTitle>
                                <CardDescription>
                                    Review and sign your employment contract
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {/* Contract Details */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-4">
                                        <div>
                                            <label className="text-sm font-medium text-muted-foreground">Position</label>
                                            <p className="text-lg font-semibold">{contract.position}</p>
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-muted-foreground">Department</label>
                                            <p className="text-lg font-semibold">{contract.department}</p>
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-muted-foreground">Start Date</label>
                                            <p className="text-lg font-semibold">{formatDate(contract.startDate)}</p>
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-muted-foreground">End Date</label>
                                            <p className="text-lg font-semibold">{formatDate(contract.endDate!)}</p>
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="text-sm font-medium text-muted-foreground">Salary</label>
                                            <p className="text-lg font-semibold">{formatCurrency(contract.salary, contract.currency)}</p>
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-muted-foreground">Contract Type</label>
                                            <p className="text-lg font-semibold capitalize">{contract.type}</p>
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-muted-foreground">Status</label>
                                            <Badge className={getStatusColor(contract.status)}>
                                                {contract.status.toUpperCase()}
                                            </Badge>
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-muted-foreground">Version</label>
                                            <p className="text-lg font-semibold">v{contract.version}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Benefits */}
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">Benefits Package</label>
                                    <div className="mt-2 grid grid-cols-2 md:grid-cols-4 gap-2">
                                        {contract.benefits.map((benefit, index) => (
                                            <Badge key={index} variant="secondary" className="justify-center">
                                                {benefit}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>

                                {/* Contract Terms */}
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">Terms & Conditions</label>
                                    <div className="mt-2 p-4 border rounded-lg bg-muted/50">
                                        <p className="text-sm">{contract.terms}</p>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex items-center space-x-4 pt-4 border-t">
                                    <Button variant="outline" size="sm">
                                        <Eye className="h-4 w-4 mr-2" />
                                        View Full Contract
                                    </Button>
                                    <Button variant="outline" size="sm">
                                        <Download className="h-4 w-4 mr-2" />
                                        Download PDF
                                    </Button>
                                    {contract.status === 'pending' && (
                                        <Button
                                            onClick={handleSignContract}
                                            disabled={loading}
                                            className="ml-auto"
                                        >
                                            {loading ? (
                                                <>
                                                    <Clock className="h-4 w-4 mr-2 animate-spin" />
                                                    Signing...
                                                </>
                                            ) : (
                                                <>
                                                    <Send className="h-4 w-4 mr-2" />
                                                    Sign Contract
                                                </>
                                            )}
                                        </Button>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="checklist" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center space-x-2">
                                    <CheckCircle className="h-5 w-5" />
                                    <span>Onboarding Checklist</span>
                                </CardTitle>
                                <CardDescription>
                                    Complete all required items to finish your onboarding
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {checklist.items.map((item) => (
                                        <div key={item.id} className="flex items-start space-x-4 p-4 border rounded-lg">
                                            <div className="flex-shrink-0 mt-1">
                                                {getStatusIcon(item.status)}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between">
                                                    <h3 className="text-sm font-medium text-foreground">
                                                        {item.title}
                                                    </h3>
                                                    <div className="flex items-center space-x-2">
                                                        <Badge className={getStatusColor(item.status)}>
                                                            {item.status.replace('_', ' ')}
                                                        </Badge>
                                                        {item.required && (
                                                            <Badge variant="destructive" className="text-xs">
                                                                Required
                                                            </Badge>
                                                        )}
                                                    </div>
                                                </div>
                                                <p className="text-sm text-muted-foreground mt-1">
                                                    {item.description}
                                                </p>
                                                <div className="flex items-center space-x-4 mt-2">
                                                    <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                                                        {getCategoryIcon(item.category)}
                                                        <span className="capitalize">{item.category}</span>
                                                    </div>
                                                    {item.dueDate && (
                                                        <div className="text-xs text-muted-foreground">
                                                            Due: {formatDate(item.dueDate)}
                                                        </div>
                                                    )}
                                                    {item.completedAt && (
                                                        <div className="text-xs text-green-600">
                                                            Completed: {formatDate(item.completedAt)}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex-shrink-0 space-x-2">
                                                {item.status === 'pending' && item.category === 'document' && (
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => handleUploadDocument(item.id)}
                                                    >
                                                        <Upload className="h-4 w-4 mr-1" />
                                                        Upload
                                                    </Button>
                                                )}
                                                {item.status === 'in_progress' && (
                                                    <Button
                                                        size="sm"
                                                        onClick={() => handleMarkComplete(item.id)}
                                                    >
                                                        <CheckCircle className="h-4 w-4 mr-1" />
                                                        Complete
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="documents" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center space-x-2">
                                    <FileText className="h-5 w-5" />
                                    <span>Document Management</span>
                                </CardTitle>
                                <CardDescription>
                                    Upload and manage your required documents
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {documents.map((doc) => (
                                        <div key={doc.id} className="flex items-center justify-between p-4 border rounded-lg">
                                            <div className="flex items-center space-x-4">
                                                <div className="flex-shrink-0">
                                                    <FileText className="h-8 w-8 text-muted-foreground" />
                                                </div>
                                                <div>
                                                    <h3 className="text-sm font-medium text-foreground">
                                                        {doc.name}
                                                    </h3>
                                                    <p className="text-xs text-muted-foreground">
                                                        {doc.category.replace('_', ' ').toUpperCase()} •
                                                        Uploaded {formatDate(doc.uploadedAt)}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <Badge className={getDocumentStatusColor(doc.status)}>
                                                    {doc.status}
                                                </Badge>
                                                {doc.required && (
                                                    <Badge variant="destructive" className="text-xs">
                                                        Required
                                                    </Badge>
                                                )}
                                                <Button size="sm" variant="outline">
                                                    <Eye className="h-4 w-4" />
                                                </Button>
                                                <Button size="sm" variant="outline">
                                                    <Download className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="mt-6 p-4 border-2 border-dashed border-muted-foreground/25 rounded-lg text-center">
                                    <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                                    <p className="text-sm text-muted-foreground mb-2">
                                        Upload new document
                                    </p>
                                    <Button variant="outline" size="sm">
                                        <Upload className="h-4 w-4 mr-2" />
                                        Choose File
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}
