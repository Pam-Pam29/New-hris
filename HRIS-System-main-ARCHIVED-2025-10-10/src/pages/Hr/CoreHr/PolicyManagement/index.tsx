import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../../components/ui/card';
import { Button } from '../../../../components/ui/button';
import { Badge } from '../../../../components/ui/badge';
import { Input } from '../../../../components/ui/input';
import { Label } from '../../../../components/ui/label';
import { Textarea } from '../../../../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../../components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../../components/ui/tabs';
import { Alert, AlertDescription } from '../../../../components/ui/alert';
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
  Plus,
  Edit,
  Trash2,
  Users,
  BarChart3,
  Download
} from 'lucide-react';
import { format } from 'date-fns';
import { policyService, Policy, PolicyAcknowledgment } from '../../../Employee/services/policyService';

export default function HRPolicyManagement() {
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [acknowledgments, setAcknowledgments] = useState<PolicyAcknowledgment[]>([]);
  const [statistics, setStatistics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedPolicy, setSelectedPolicy] = useState<Policy | null>(null);

  // Form state
  const [policyForm, setPolicyForm] = useState({
    title: '',
    content: '',
    category: '',
    version: '1.0',
    effectiveDate: '',
    requiresAcknowledgment: true,
    active: true
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [policiesData, acknowledgmentsData, statsData] = await Promise.all([
        policyService.getAllPolicies(),
        policyService.getAllPolicyAcknowledgment(),
        policyService.getAcknowledgmentStatistics()
      ]);

      setPolicies(policiesData);
      setAcknowledgments(acknowledgmentsData);
      setStatistics(statsData);
    } catch (err) {
      setError('Failed to load policy data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePolicy = async () => {
    if (!policyForm.title || !policyForm.content || !policyForm.category) {
      setError('Please fill in all required fields');
      return;
    }

    setSubmitting(true);
    try {
      const success = await policyService.createPolicy({
        ...policyForm,
        effectiveDate: new Date(policyForm.effectiveDate),
        createdBy: 'HR Manager' // This would come from auth context
      });

      if (success) {
        setShowCreateModal(false);
        resetForm();
        await loadData();
      } else {
        setError('Failed to create policy');
      }
    } catch (err) {
      setError('Failed to create policy');
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdatePolicy = async () => {
    if (!selectedPolicy || !policyForm.title || !policyForm.content || !policyForm.category) {
      setError('Please fill in all required fields');
      return;
    }

    setSubmitting(true);
    try {
      const success = await policyService.updatePolicy(selectedPolicy.id, {
        ...policyForm,
        effectiveDate: new Date(policyForm.effectiveDate)
      });

      if (success) {
        setShowEditModal(false);
        resetForm();
        await loadData();
      } else {
        setError('Failed to update policy');
      }
    } catch (err) {
      setError('Failed to update policy');
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeletePolicy = async (policyId: string) => {
    if (!confirm('Are you sure you want to delete this policy?')) return;

    try {
      const success = await policyService.deletePolicy(policyId);
      if (success) {
        await loadData();
      } else {
        setError('Failed to delete policy');
      }
    } catch (err) {
      setError('Failed to delete policy');
      console.error(err);
    }
  };

  const openEditModal = (policy: Policy) => {
    setSelectedPolicy(policy);
    setPolicyForm({
      title: policy.title,
      content: policy.content,
      category: policy.category,
      version: policy.version,
      effectiveDate: format(policy.effectiveDate, 'yyyy-MM-dd'),
      requiresAcknowledgment: policy.requiresAcknowledgment,
      active: policy.active
    });
    setShowEditModal(true);
  };

  const openViewModal = (policy: Policy) => {
    setSelectedPolicy(policy);
    setShowViewModal(true);
  };

  const resetForm = () => {
    setPolicyForm({
      title: '',
      content: '',
      category: '',
      version: '1.0',
      effectiveDate: '',
      requiresAcknowledgment: true,
      active: true
    });
    setSelectedPolicy(null);
  };

  const getStatusBadge = (active: boolean) => {
    return active ? (
      <Badge variant="default" className="flex items-center space-x-1">
        <CheckCircle className="h-3 w-3" />
        <span>Active</span>
      </Badge>
    ) : (
      <Badge variant="secondary" className="flex items-center space-x-1">
        <Clock className="h-3 w-3" />
        <span>Inactive</span>
      </Badge>
    );
  };

  const getActivePolicies = () => policies.filter(p => p.active);
  const getInactivePolicies = () => policies.filter(p => !p.active);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 p-6">
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <Loader className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
              <p>Loading policy management...</p>
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
              Create, update, and manage company policies
            </p>
          </div>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              className="flex items-center space-x-2"
            >
              <Download className="h-4 w-4" />
              <span>Export Report</span>
            </Button>
            <Button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center space-x-2"
            >
              <Plus className="h-4 w-4" />
              <span>Create Policy</span>
            </Button>
          </div>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Statistics Cards */}
        {statistics && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <div className="ml-2">
                    <p className="text-sm font-medium text-muted-foreground">Total Policies</p>
                    <p className="text-2xl font-bold">{statistics.totalPolicies}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center">
                  <Users className="h-4 w-4 text-blue-600" />
                  <div className="ml-2">
                    <p className="text-sm font-medium text-muted-foreground">Total Employees</p>
                    <p className="text-2xl font-bold">{statistics.totalEmployees}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <div className="ml-2">
                    <p className="text-sm font-medium text-muted-foreground">Total Acknowledgment</p>
                    <p className="text-2xl font-bold">{statistics.totalAcknowledgment}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center">
                  <BarChart3 className="h-4 w-4 text-purple-600" />
                  <div className="ml-2">
                    <p className="text-sm font-medium text-muted-foreground">Acknowledgment Rate</p>
                    <p className="text-2xl font-bold">{statistics.acknowledgmentRate.toFixed(1)}%</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <Tabs defaultValue="policies" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="policies">Policies ({policies.length})</TabsTrigger>
            <TabsTrigger value="acknowledgments">Acknowledgment ({acknowledgments.length})</TabsTrigger>
            <TabsTrigger value="statistics">Statistics</TabsTrigger>
          </TabsList>

          {/* Policies */}
          <TabsContent value="policies" className="space-y-4">
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
                      {getStatusBadge(policy.active)}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4 mr-2" />
                        Effective: {format(policy.effectiveDate, 'MMM dd, yyyy')}
                      </div>

                      <div className="flex items-center text-sm text-muted-foreground">
                        <User className="h-4 w-4 mr-2" />
                        Created by: {policy.createdBy}
                      </div>

                      <div className="flex items-center text-sm text-muted-foreground">
                        <Shield className="h-4 w-4 mr-2" />
                        Requires Acknowledgment: {policy.requiresAcknowledgment ? 'Yes' : 'No'}
                      </div>

                      <div className="flex space-x-2 pt-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openViewModal(policy)}
                          className="flex-1"
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openEditModal(policy)}
                          className="flex-1"
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Button>

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeletePolicy(policy.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Acknowledgment */}
          <TabsContent value="acknowledgments" className="space-y-4">
            <div className="space-y-4">
              {acknowledgments.map(acknowledgment => (
                <Card key={acknowledgment.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <h3 className="font-semibold">{acknowledgment.employeeName}</h3>
                          <Badge variant="outline">{acknowledgment.employeeId}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Policy: {policies.find(p => p.id === acknowledgment.policyId)?.title || 'Unknown Policy'}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Acknowledged: {format(acknowledgment.acknowledgedAt, 'MMM dd, yyyy HH:mm')}
                        </p>
                      </div>
                      <div className="text-right space-y-2">
                        <Badge variant="default" className="flex items-center space-x-1">
                          <CheckCircle className="h-3 w-3" />
                          <span>Acknowledged</span>
                        </Badge>
                        {acknowledgment.ipAddress && (
                          <p className="text-xs text-muted-foreground">
                            IP: {acknowledgment.ipAddress}
                          </p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Statistics */}
          <TabsContent value="statistics" className="space-y-4">
            {statistics && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {statistics.policyStats.map((stat: any) => (
                  <Card key={stat.policyId}>
                    <CardHeader>
                      <CardTitle className="text-lg">{stat.policyTitle}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Acknowledgment:</span>
                          <span className="font-medium">{stat.totalAcknowledgment}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Rate:</span>
                          <span className="font-medium">{stat.acknowledgmentRate.toFixed(1)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${stat.acknowledgmentRate}%` }}
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Create Policy Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <Card className="w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
              <CardHeader>
                <CardTitle>Create New Policy</CardTitle>
                <CardDescription>
                  Add a new company policy
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    placeholder="Enter policy title"
                    value={policyForm.title}
                    onChange={(e) => setPolicyForm(prev => ({ ...prev, title: e.target.value }))}
                  />
                </div>

                <div>
                  <Label htmlFor="category">Category</Label>
                  <Select value={policyForm.category} onValueChange={(value) => setPolicyForm(prev => ({ ...prev, category: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="General">General</SelectItem>
                      <SelectItem value="Privacy">Privacy</SelectItem>
                      <SelectItem value="Workplace">Workplace</SelectItem>
                      <SelectItem value="Communication">Communication</SelectItem>
                      <SelectItem value="Security">Security</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="version">Version</Label>
                    <Input
                      id="version"
                      placeholder="1.0"
                      value={policyForm.version}
                      onChange={(e) => setPolicyForm(prev => ({ ...prev, version: e.target.value }))}
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
                </div>

                <div>
                  <Label htmlFor="content">Content</Label>
                  <Textarea
                    id="content"
                    placeholder="Enter policy content (HTML supported)"
                    rows={10}
                    value={policyForm.content}
                    onChange={(e) => setPolicyForm(prev => ({ ...prev, content: e.target.value }))}
                  />
                </div>

                <div className="flex space-x-2">
                  <Button
                    onClick={handleCreatePolicy}
                    disabled={submitting}
                    className="flex-1"
                  >
                    {submitting ? (
                      <>
                        <Loader className="mr-2 h-4 w-4 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      'Create Policy'
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setShowCreateModal(false)}
                    disabled={submitting}
                  >
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Edit Policy Modal */}
        {showEditModal && selectedPolicy && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <Card className="w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
              <CardHeader>
                <CardTitle>Edit Policy</CardTitle>
                <CardDescription>
                  Update the policy details
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="edit-title">Title</Label>
                  <Input
                    id="edit-title"
                    placeholder="Enter policy title"
                    value={policyForm.title}
                    onChange={(e) => setPolicyForm(prev => ({ ...prev, title: e.target.value }))}
                  />
                </div>

                <div>
                  <Label htmlFor="edit-category">Category</Label>
                  <Select value={policyForm.category} onValueChange={(value) => setPolicyForm(prev => ({ ...prev, category: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="General">General</SelectItem>
                      <SelectItem value="Privacy">Privacy</SelectItem>
                      <SelectItem value="Workplace">Workplace</SelectItem>
                      <SelectItem value="Communication">Communication</SelectItem>
                      <SelectItem value="Security">Security</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="edit-version">Version</Label>
                    <Input
                      id="edit-version"
                      placeholder="1.0"
                      value={policyForm.version}
                      onChange={(e) => setPolicyForm(prev => ({ ...prev, version: e.target.value }))}
                    />
                  </div>

                  <div>
                    <Label htmlFor="edit-effectiveDate">Effective Date</Label>
                    <Input
                      id="edit-effectiveDate"
                      type="date"
                      value={policyForm.effectiveDate}
                      onChange={(e) => setPolicyForm(prev => ({ ...prev, effectiveDate: e.target.value }))}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="edit-content">Content</Label>
                  <Textarea
                    id="edit-content"
                    placeholder="Enter policy content (HTML supported)"
                    rows={10}
                    value={policyForm.content}
                    onChange={(e) => setPolicyForm(prev => ({ ...prev, content: e.target.value }))}
                  />
                </div>

                <div className="flex space-x-2">
                  <Button
                    onClick={handleUpdatePolicy}
                    disabled={submitting}
                    className="flex-1"
                  >
                    {submitting ? (
                      <>
                        <Loader className="mr-2 h-4 w-4 animate-spin" />
                        Updating...
                      </>
                    ) : (
                      'Update Policy'
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setShowEditModal(false)}
                    disabled={submitting}
                  >
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* View Policy Modal */}
        {showViewModal && selectedPolicy && (
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
                  {getStatusBadge(selectedPolicy.active)}
                </div>
              </CardHeader>
              <CardContent className="flex-1 overflow-y-auto">
                <div
                  className="prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ __html: selectedPolicy.content }}
                />
              </CardContent>
              <div className="flex-shrink-0 p-6 border-t">
                <Button
                  variant="outline"
                  onClick={() => setShowViewModal(false)}
                  className="w-full"
                >
                  Close
                </Button>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}