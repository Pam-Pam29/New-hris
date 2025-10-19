import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import { Alert, AlertDescription } from '../../../components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../components/ui/tabs';
import {
    FileText,
    CheckCircle,
    Clock,
    AlertCircle,
    Loader,
    Shield,
    Calendar,
    User,
    Eye,
    Check
} from 'lucide-react';
import { format } from 'date-fns';
import { policyService, PolicyWithAcknowledgment } from '../services/policyService';

export default function PolicyManagement() {
    const [employeeId] = useState('EMP123456ABC'); // This would come from auth context
    const [employeeName] = useState('John Doe'); // This would come from auth context
    const [policies, setPolicies] = useState<PolicyWithAcknowledgment[]>([]);
    const [loading, setLoading] = useState(true);
    const [acknowledging, setAcknowledging] = useState<string | null>(null);
    const [error, setError] = useState('');
    const [selectedPolicy, setSelectedPolicy] = useState<PolicyWithAcknowledgment | null>(null);
    const [showPolicyModal, setShowPolicyModal] = useState(false);

    useEffect(() => {
        loadPolicies();
    }, [employeeId]);

    const loadPolicies = async () => {
        setLoading(true);
        try {
            const policiesData = await policyService.getPoliciesWithAcknowledgmentStatus(employeeId);
            setPolicies(policiesData);
        } catch (err) {
            setError('Failed to load policies');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleAcknowledgePolicy = async (policyId: string) => {
        setAcknowledging(policyId);
        setError('');

        try {
            const success = await policyService.acknowledgePolicy(policyId, employeeId, employeeName);

            if (success) {
                await loadPolicies(); // Reload policies to update acknowledgment status
            } else {
                setError('Failed to acknowledge policy');
            }
        } catch (err) {
            setError('Failed to acknowledge policy');
            console.error(err);
        } finally {
            setAcknowledging(null);
        }
    };

    const openPolicyModal = (policy: PolicyWithAcknowledgment) => {
        setSelectedPolicy(policy);
        setShowPolicyModal(true);
    };

    const getStatusBadge = (acknowledged: boolean, acknowledgedAt?: Date) => {
        if (acknowledged) {
            return (
                <Badge variant="default" className="flex items-center space-x-1">
                    <CheckCircle className="h-3 w-3" />
                    <span>Acknowledged</span>
                </Badge>
            );
        } else {
            return (
                <Badge variant="secondary" className="flex items-center space-x-1">
                    <Clock className="h-3 w-3" />
                    <span>Pending</span>
                </Badge>
            );
        }
    };

    const getAcknowledgedPolicies = () => policies.filter(p => p.acknowledged);
    const getPendingPolicies = () => policies.filter(p => !p.acknowledged);

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 p-6">
                <div className="max-w-6xl mx-auto space-y-6">
                    <div className="flex items-center justify-center h-64">
                        <div className="text-center">
                            <Loader className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
                            <p>Loading policies...</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 p-6">
            <div className="max-w-6xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-foreground">Policy Management</h1>
                        <p className="text-muted-foreground mt-2">
                            Review and acknowledge company policies
                        </p>
                    </div>
                    <div className="text-right">
                        <p className="text-sm text-muted-foreground">
                            Acknowledged: {getAcknowledgedPolicies().length} of {policies.length}
                        </p>
                        <div className="w-32 bg-gray-200 rounded-full h-2 mt-1">
                            <div
                                className="bg-green-600 h-2 rounded-full"
                                style={{
                                    width: `${policies.length > 0 ? (getAcknowledgedPolicies().length / policies.length) * 100 : 0}%`
                                }}
                            />
                        </div>
                    </div>
                </div>

                {error && (
                    <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}

                <Tabs defaultValue="all" className="w-full">
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="all">All Policies ({policies.length})</TabsTrigger>
                        <TabsTrigger value="pending">Pending ({getPendingPolicies().length})</TabsTrigger>
                        <TabsTrigger value="acknowledged">Acknowledged ({getAcknowledgedPolicies().length})</TabsTrigger>
                    </TabsList>

                    {/* All Policies */}
                    <TabsContent value="all" className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {policies.map(policy => (
                                <Card key={policy.id} className="relative">
                                    <CardHeader className="pb-3">
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <CardTitle className="text-lg">{policy.title}</CardTitle>
                                                <CardDescription className="mt-1">
                                                    {policy.category} • Version {policy.version}
                                                </CardDescription>
                                            </div>
                                            {getStatusBadge(policy.acknowledged, policy.acknowledgedAt)}
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-3">
                                            <div className="flex items-center text-sm text-muted-foreground">
                                                <Calendar className="h-4 w-4 mr-2" />
                                                Effective: {format(policy.effectiveDate, 'MMM dd, yyyy')}
                                            </div>

                                            {policy.acknowledgedAt && (
                                                <div className="flex items-center text-sm text-green-600">
                                                    <CheckCircle className="h-4 w-4 mr-2" />
                                                    Acknowledged: {format(policy.acknowledgedAt, 'MMM dd, yyyy')}
                                                </div>
                                            )}

                                            <div className="flex space-x-2 pt-2">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => openPolicyModal(policy)}
                                                    className="flex-1"
                                                >
                                                    <Eye className="h-4 w-4 mr-1" />
                                                    View
                                                </Button>

                                                {!policy.acknowledged && (
                                                    <Button
                                                        size="sm"
                                                        onClick={() => handleAcknowledgePolicy(policy.id)}
                                                        disabled={acknowledging === policy.id}
                                                        className="flex-1"
                                                    >
                                                        {acknowledging === policy.id ? (
                                                            <>
                                                                <Loader className="h-4 w-4 mr-1 animate-spin" />
                                                                Acknowledging...
                                                            </>
                                                        ) : (
                                                            <>
                                                                <Check className="h-4 w-4 mr-1" />
                                                                Acknowledge
                                                            </>
                                                        )}
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </TabsContent>

                    {/* Pending Policies */}
                    <TabsContent value="pending" className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {getPendingPolicies().map(policy => (
                                <Card key={policy.id} className="relative border-orange-200">
                                    <CardHeader className="pb-3">
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <CardTitle className="text-lg">{policy.title}</CardTitle>
                                                <CardDescription className="mt-1">
                                                    {policy.category} • Version {policy.version}
                                                </CardDescription>
                                            </div>
                                            {getStatusBadge(policy.acknowledged, policy.acknowledgedAt)}
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-3">
                                            <div className="flex items-center text-sm text-muted-foreground">
                                                <Calendar className="h-4 w-4 mr-2" />
                                                Effective: {format(policy.effectiveDate, 'MMM dd, yyyy')}
                                            </div>

                                            <Alert className="border-orange-200 bg-orange-50">
                                                <AlertCircle className="h-4 w-4 text-orange-600" />
                                                <AlertDescription className="text-orange-800">
                                                    This policy requires your acknowledgment.
                                                </AlertDescription>
                                            </Alert>

                                            <div className="flex space-x-2 pt-2">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => openPolicyModal(policy)}
                                                    className="flex-1"
                                                >
                                                    <Eye className="h-4 w-4 mr-1" />
                                                    View
                                                </Button>

                                                <Button
                                                    size="sm"
                                                    onClick={() => handleAcknowledgePolicy(policy.id)}
                                                    disabled={acknowledging === policy.id}
                                                    className="flex-1"
                                                >
                                                    {acknowledging === policy.id ? (
                                                        <>
                                                            <Loader className="h-4 w-4 mr-1 animate-spin" />
                                                            Acknowledging...
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Check className="h-4 w-4 mr-1" />
                                                            Acknowledge
                                                        </>
                                                    )}
                                                </Button>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </TabsContent>

                    {/* Acknowledged Policies */}
                    <TabsContent value="acknowledged" className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {getAcknowledgedPolicies().map(policy => (
                                <Card key={policy.id} className="relative border-green-200">
                                    <CardHeader className="pb-3">
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <CardTitle className="text-lg">{policy.title}</CardTitle>
                                                <CardDescription className="mt-1">
                                                    {policy.category} • Version {policy.version}
                                                </CardDescription>
                                            </div>
                                            {getStatusBadge(policy.acknowledged, policy.acknowledgedAt)}
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-3">
                                            <div className="flex items-center text-sm text-muted-foreground">
                                                <Calendar className="h-4 w-4 mr-2" />
                                                Effective: {format(policy.effectiveDate, 'MMM dd, yyyy')}
                                            </div>

                                            <div className="flex items-center text-sm text-green-600">
                                                <CheckCircle className="h-4 w-4 mr-2" />
                                                Acknowledged: {format(policy.acknowledgedAt!, 'MMM dd, yyyy')}
                                            </div>

                                            <div className="flex space-x-2 pt-2">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => openPolicyModal(policy)}
                                                    className="w-full"
                                                >
                                                    <Eye className="h-4 w-4 mr-1" />
                                                    View Policy
                                                </Button>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </TabsContent>
                </Tabs>

                {/* Policy Modal */}
                {showPolicyModal && selectedPolicy && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <Card className="w-full max-w-4xl max-h-[90vh] overflow-hidden">
                            <CardHeader className="flex-shrink-0">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <CardTitle className="text-xl">{selectedPolicy.title}</CardTitle>
                                        <CardDescription>
                                            {selectedPolicy.category} • Version {selectedPolicy.version} •
                                            Effective: {format(selectedPolicy.effectiveDate, 'MMM dd, yyyy')}
                                        </CardDescription>
                                    </div>
                                    {getStatusBadge(selectedPolicy.acknowledged, selectedPolicy.acknowledgedAt)}
                                </div>
                            </CardHeader>
                            <CardContent className="flex-1 overflow-y-auto">
                                <div
                                    className="prose prose-sm max-w-none"
                                    dangerouslySetInnerHTML={{ __html: selectedPolicy.content }}
                                />
                            </CardContent>
                            <div className="flex-shrink-0 p-6 border-t">
                                <div className="flex space-x-2">
                                    <Button
                                        variant="outline"
                                        onClick={() => setShowPolicyModal(false)}
                                        className="flex-1"
                                    >
                                        Close
                                    </Button>
                                    {!selectedPolicy.acknowledged && (
                                        <Button
                                            onClick={() => {
                                                handleAcknowledgePolicy(selectedPolicy.id);
                                                setShowPolicyModal(false);
                                            }}
                                            disabled={acknowledging === selectedPolicy.id}
                                            className="flex-1"
                                        >
                                            {acknowledging === selectedPolicy.id ? (
                                                <>
                                                    <Loader className="h-4 w-4 mr-1 animate-spin" />
                                                    Acknowledging...
                                                </>
                                            ) : (
                                                <>
                                                    <Check className="h-4 w-4 mr-1" />
                                                    Acknowledge Policy
                                                </>
                                            )}
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </Card>
                    </div>
                )}
            </div>
        </div>
    );
}