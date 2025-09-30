// Employee Policy Management - View and acknowledge company policies
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../components/ui/tabs';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Alert, AlertDescription } from '../../../components/ui/alert';
import {
    FileText,
    CheckCircle,
    Clock,
    Calendar,
    Shield,
    Search,
    Eye,
    Loader,
    AlertCircle
} from 'lucide-react';
import { collection, query, getDocs, addDoc, where, serverTimestamp } from 'firebase/firestore';
import { db } from '../../../config/firebase';

interface Policy {
    id: string;
    title: string;
    content: string;
    category: string;
    version: string;
    effectiveDate: any;
    requiresAcknowledgment: boolean;
    active: boolean;
    createdBy: string;
    createdAt: any;
}

interface PolicyAcknowledgment {
    id?: string;
    policyId: string;
    employeeId: string;
    employeeName: string;
    acknowledgedAt: any;
    ipAddress?: string;
}

export default function EmployeePolicyManagement() {
    const [employeeId] = useState(() => {
        const savedEmployeeId = localStorage.getItem('currentEmployeeId');
        return savedEmployeeId || 'EMP001';
    });
    const [employeeName, setEmployeeName] = useState('Employee User');

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
    
    const [policies, setPolicies] = useState<Policy[]>([]);
    const [acknowledgments, setAcknowledgments] = useState<PolicyAcknowledgment[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedPolicy, setSelectedPolicy] = useState<Policy | null>(null);
    const [showViewModal, setShowViewModal] = useState(false);
    const [acknowledging, setAcknowledging] = useState(false);

    useEffect(() => {
        loadData();
    }, [employeeId]);

    const loadData = async () => {
        setLoading(true);
        try {
            // Load all active policies
            const policiesQuery = query(
                collection(db, 'policies'),
                where('active', '==', true)
            );
            const policiesSnapshot = await getDocs(policiesQuery);
            const policiesData = policiesSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            } as Policy));

            // Load employee's acknowledgments
            const acknowledgementsQuery = query(
                collection(db, 'policyAcknowledgments'),
                where('employeeId', '==', employeeId)
            );
            const acknowledgementsSnapshot = await getDocs(acknowledgementsQuery);
            const acknowledgementsData = acknowledgementsSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            } as PolicyAcknowledgment));

            setPolicies(policiesData);
            setAcknowledgments(acknowledgementsData);
            console.log('📋 Loaded policies:', policiesData.length, 'Acknowledgments:', acknowledgementsData.length);
        } catch (error) {
            console.error('Failed to load policies:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAcknowledge = async (policyId: string) => {
        setAcknowledging(true);
        try {
            const acknowledgment = {
                policyId,
                employeeId,
                employeeName,
                acknowledgedAt: serverTimestamp(),
                ipAddress: 'N/A'
            };

            await addDoc(collection(db, 'policyAcknowledgments'), acknowledgment);
            
            // Reload data to reflect new acknowledgment
            await loadData();
            
            console.log('✅ Policy acknowledged');
        } catch (error) {
            console.error('Failed to acknowledge policy:', error);
            alert('Failed to acknowledge policy');
        } finally {
            setAcknowledging(false);
        }
    };

    const isPolicyAcknowledged = (policyId: string) => {
        return acknowledgments.some(ack => ack.policyId === policyId);
    };

    const formatDate = (date: any) => {
        try {
            if (!date) return 'N/A';
            
            let parsedDate: Date;
            if (date instanceof Date) {
                parsedDate = date;
            } else if (date.toDate && typeof date.toDate === 'function') {
                parsedDate = date.toDate();
            } else if (typeof date === 'string') {
                parsedDate = new Date(date);
            } else if (typeof date === 'object' && Object.keys(date).length === 0) {
                return 'N/A';
            } else {
                parsedDate = new Date(date);
            }
            
            if (isNaN(parsedDate.getTime())) {
                return 'N/A';
            }
            
            return parsedDate.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
        } catch (error) {
            console.warn('Failed to format date:', date, error);
            return 'N/A';
        }
    };

    const filteredPolicies = policies.filter(policy =>
        policy.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        policy.category.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const requiredPolicies = filteredPolicies.filter(p => p.requiresAcknowledgment);
    const acknowledgedPolicies = filteredPolicies.filter(p => isPolicyAcknowledged(p.id));
    const unacknowledgedPolicies = filteredPolicies.filter(p => p.requiresAcknowledgment && !isPolicyAcknowledged(p.id));

    if (loading) {
        return (
            <div className="p-8">
                <div className="flex items-center justify-center h-64">
                    <div className="text-center">
                        <Loader className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
                        <p>Loading policies...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="p-8 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Company Policies</h1>
                    <p className="text-gray-600 mt-1">View and acknowledge company policies</p>
                </div>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                        placeholder="Search policies..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 w-64"
                    />
                </div>
            </div>

            {/* Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center">
                            <FileText className="h-4 w-4 text-blue-600" />
                            <div className="ml-2">
                                <p className="text-sm font-medium text-muted-foreground">Total Policies</p>
                                <p className="text-2xl font-bold">{policies.length}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center">
                            <Shield className="h-4 w-4 text-orange-600" />
                            <div className="ml-2">
                                <p className="text-sm font-medium text-muted-foreground">Required</p>
                                <p className="text-2xl font-bold">{requiredPolicies.length}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center">
                            <CheckCircle className="h-4 w-4 text-green-600" />
                            <div className="ml-2">
                                <p className="text-sm font-medium text-muted-foreground">Acknowledged</p>
                                <p className="text-2xl font-bold">{acknowledgedPolicies.length}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center">
                            <Clock className="h-4 w-4 text-red-600" />
                            <div className="ml-2">
                                <p className="text-sm font-medium text-muted-foreground">Pending</p>
                                <p className="text-2xl font-bold">{unacknowledgedPolicies.length}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Pending Alert */}
            {unacknowledgedPolicies.length > 0 && (
                <Alert className="bg-orange-50 border-orange-200">
                    <AlertCircle className="h-4 w-4 text-orange-600" />
                    <AlertDescription className="text-orange-800">
                        You have {unacknowledgedPolicies.length} policy/policies that require acknowledgment
                    </AlertDescription>
                </Alert>
            )}

            {/* Tabs */}
            <Tabs defaultValue="all" className="space-y-4">
                <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="all">All Policies ({policies.length})</TabsTrigger>
                    <TabsTrigger value="required">Required ({requiredPolicies.length})</TabsTrigger>
                    <TabsTrigger value="acknowledged">Acknowledged ({acknowledgedPolicies.length})</TabsTrigger>
                    <TabsTrigger value="pending">
                        Pending ({unacknowledgedPolicies.length})
                    </TabsTrigger>
                </TabsList>

                {/* All Policies */}
                <TabsContent value="all" className="space-y-4">
                    {filteredPolicies.length === 0 ? (
                        <Card>
                            <CardContent className="pt-12 pb-12">
                                <div className="text-center">
                                    <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                                    <h3 className="text-lg font-semibold mb-2">No Policies Found</h3>
                                    <p className="text-muted-foreground">
                                        {searchTerm ? 'No policies match your search' : 'No policies available yet'}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {filteredPolicies.map(policy => (
                                <Card key={policy.id}>
                                    <CardHeader>
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <CardTitle className="text-lg">{policy.title}</CardTitle>
                                                <CardDescription className="mt-1">
                                                    {policy.category} • Version {policy.version}
                                                </CardDescription>
                                            </div>
                                            {isPolicyAcknowledged(policy.id) ? (
                                                <Badge className="bg-green-100 text-green-600">
                                                    <CheckCircle className="h-3 w-3 mr-1" />
                                                    Acknowledged
                                                </Badge>
                                            ) : policy.requiresAcknowledgment ? (
                                                <Badge className="bg-orange-100 text-orange-600">
                                                    <Clock className="h-3 w-3 mr-1" />
                                                    Pending
                                                </Badge>
                                            ) : (
                                                <Badge className="bg-gray-100 text-gray-600">
                                                    Optional
                                                </Badge>
                                            )}
                                        </div>
                                    </CardHeader>
                                    <CardContent className="space-y-3">
                                        <div className="flex items-center text-sm text-muted-foreground">
                                            <Calendar className="h-4 w-4 mr-2" />
                                            Effective: {formatDate(policy.effectiveDate)}
                                        </div>
                                        <div className="flex space-x-2">
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => {
                                                    setSelectedPolicy(policy);
                                                    setShowViewModal(true);
                                                }}
                                                className="flex-1"
                                            >
                                                <Eye className="h-4 w-4 mr-1" />
                                                View
                                            </Button>
                                            {policy.requiresAcknowledgment && !isPolicyAcknowledged(policy.id) && (
                                                <Button
                                                    size="sm"
                                                    onClick={() => {
                                                        setSelectedPolicy(policy);
                                                        setShowViewModal(true);
                                                    }}
                                                    className="flex-1 bg-green-600 hover:bg-green-700"
                                                >
                                                    <CheckCircle className="h-4 w-4 mr-1" />
                                                    Acknowledge
                                                </Button>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </TabsContent>

                {/* Required Policies */}
                <TabsContent value="required" className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {requiredPolicies.map(policy => (
                            <Card key={policy.id}>
                                <CardHeader>
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <CardTitle className="text-lg">{policy.title}</CardTitle>
                                            <CardDescription className="mt-1">
                                                {policy.category} • Version {policy.version}
                                            </CardDescription>
                                        </div>
                                        {isPolicyAcknowledged(policy.id) ? (
                                            <Badge className="bg-green-100 text-green-600">
                                                <CheckCircle className="h-3 w-3 mr-1" />
                                                Acknowledged
                                            </Badge>
                                        ) : (
                                            <Badge className="bg-orange-100 text-orange-600">
                                                <Clock className="h-3 w-3 mr-1" />
                                                Pending
                                            </Badge>
                                        )}
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <div className="flex items-center text-sm text-muted-foreground">
                                        <Calendar className="h-4 w-4 mr-2" />
                                        Effective: {formatDate(policy.effectiveDate)}
                                    </div>
                                    <div className="flex space-x-2">
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => {
                                                setSelectedPolicy(policy);
                                                setShowViewModal(true);
                                            }}
                                            className="flex-1"
                                        >
                                            <Eye className="h-4 w-4 mr-1" />
                                            View
                                        </Button>
                                        {!isPolicyAcknowledged(policy.id) && (
                                            <Button
                                                size="sm"
                                                onClick={() => {
                                                    setSelectedPolicy(policy);
                                                    setShowViewModal(true);
                                                }}
                                                className="flex-1 bg-green-600 hover:bg-green-700"
                                            >
                                                <CheckCircle className="h-4 w-4 mr-1" />
                                                Acknowledge
                                            </Button>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </TabsContent>

                {/* Acknowledged Policies */}
                <TabsContent value="acknowledged" className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {acknowledgedPolicies.map(policy => {
                            const acknowledgment = acknowledgments.find(ack => ack.policyId === policy.id);
                            return (
                                <Card key={policy.id} className="border-green-200">
                                    <CardHeader>
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <CardTitle className="text-lg">{policy.title}</CardTitle>
                                                <CardDescription className="mt-1">
                                                    {policy.category} • Version {policy.version}
                                                </CardDescription>
                                            </div>
                                            <Badge className="bg-green-100 text-green-600">
                                                <CheckCircle className="h-3 w-3 mr-1" />
                                                Acknowledged
                                            </Badge>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="space-y-3">
                                        <div className="flex items-center text-sm text-muted-foreground">
                                            <Calendar className="h-4 w-4 mr-2" />
                                            Effective: {formatDate(policy.effectiveDate)}
                                        </div>
                                        {acknowledgment && (
                                            <div className="flex items-center text-sm text-green-600">
                                                <CheckCircle className="h-4 w-4 mr-2" />
                                                Acknowledged: {formatDate(acknowledgment.acknowledgedAt)}
                                            </div>
                                        )}
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => {
                                                setSelectedPolicy(policy);
                                                setShowViewModal(true);
                                            }}
                                            className="w-full"
                                        >
                                            <Eye className="h-4 w-4 mr-1" />
                                            View Policy
                                        </Button>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                </TabsContent>

                {/* Pending Acknowledgments */}
                <TabsContent value="pending" className="space-y-4">
                    {unacknowledgedPolicies.length === 0 ? (
                        <Card>
                            <CardContent className="pt-12 pb-12">
                                <div className="text-center">
                                    <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
                                    <h3 className="text-lg font-semibold mb-2">All Caught Up!</h3>
                                    <p className="text-muted-foreground">
                                        You have acknowledged all required policies
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {unacknowledgedPolicies.map(policy => (
                                <Card key={policy.id} className="border-orange-200 bg-orange-50">
                                    <CardHeader>
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <CardTitle className="text-lg">{policy.title}</CardTitle>
                                                <CardDescription className="mt-1">
                                                    {policy.category} • Version {policy.version}
                                                </CardDescription>
                                            </div>
                                            <Badge className="bg-orange-100 text-orange-600">
                                                <Clock className="h-3 w-3 mr-1" />
                                                Action Required
                                            </Badge>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="space-y-3">
                                        <div className="flex items-center text-sm text-muted-foreground">
                                            <Calendar className="h-4 w-4 mr-2" />
                                            Effective: {formatDate(policy.effectiveDate)}
                                        </div>
                                        <div className="p-3 bg-orange-100 border border-orange-300 rounded-lg">
                                            <p className="text-sm font-semibold text-orange-900">
                                                ⚠️ Acknowledgment Required
                                            </p>
                                            <p className="text-xs text-orange-800 mt-1">
                                                Please read and acknowledge this policy
                                            </p>
                                        </div>
                                        <Button
                                            size="sm"
                                            onClick={() => {
                                                setSelectedPolicy(policy);
                                                setShowViewModal(true);
                                            }}
                                            className="w-full bg-green-600 hover:bg-green-700"
                                        >
                                            <Eye className="h-4 w-4 mr-1" />
                                            Read & Acknowledge
                                        </Button>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </TabsContent>
            </Tabs>

            {/* View Policy Modal */}
            {showViewModal && selectedPolicy && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <Card className="w-full max-w-4xl max-h-[90vh] flex flex-col">
                        <CardHeader className="flex-shrink-0">
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle className="text-xl">{selectedPolicy.title}</CardTitle>
                                    <CardDescription>
                                        {selectedPolicy.category} • Version {selectedPolicy.version} • 
                                        Effective: {formatDate(selectedPolicy.effectiveDate)}
                                    </CardDescription>
                                </div>
                                {isPolicyAcknowledged(selectedPolicy.id) ? (
                                    <Badge className="bg-green-100 text-green-600">
                                        <CheckCircle className="h-3 w-3 mr-1" />
                                        Acknowledged
                                    </Badge>
                                ) : selectedPolicy.requiresAcknowledgment && (
                                    <Badge className="bg-orange-100 text-orange-600">
                                        <Clock className="h-3 w-3 mr-1" />
                                        Pending
                                    </Badge>
                                )}
                            </div>
                        </CardHeader>
                        <CardContent className="flex-1 overflow-y-auto">
                            <div
                                className="prose prose-sm max-w-none"
                                dangerouslySetInnerHTML={{ __html: selectedPolicy.content }}
                            />
                        </CardContent>
                        <div className="flex-shrink-0 p-6 border-t bg-gray-50">
                            <div className="flex space-x-3">
                                {selectedPolicy.requiresAcknowledgment && !isPolicyAcknowledged(selectedPolicy.id) && (
                                    <Button
                                        onClick={() => {
                                            handleAcknowledge(selectedPolicy.id);
                                            setShowViewModal(false);
                                        }}
                                        disabled={acknowledging}
                                        className="flex-1 bg-green-600 hover:bg-green-700"
                                    >
                                        {acknowledging ? (
                                            <>
                                                <Loader className="mr-2 h-4 w-4 animate-spin" />
                                                Acknowledging...
                                            </>
                                        ) : (
                                            <>
                                                <CheckCircle className="mr-2 h-4 w-4" />
                                                I Acknowledge This Policy
                                            </>
                                        )}
                                    </Button>
                                )}
                                <Button
                                    variant="outline"
                                    onClick={() => {
                                        setShowViewModal(false);
                                        setSelectedPolicy(null);
                                    }}
                                    className={selectedPolicy.requiresAcknowledgment && !isPolicyAcknowledged(selectedPolicy.id) ? '' : 'flex-1'}
                                >
                                    Close
                                </Button>
                            </div>
                        </div>
                    </Card>
                </div>
            )}
        </div>
    );
}