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
  Download,
  Upload,
  Type
} from 'lucide-react';
import { format } from 'date-fns';
import { getPolicyService, Policy, PolicyAcknowledgment } from './services/policyService';
import { collection, onSnapshot } from 'firebase/firestore';
import { getFirebaseDb } from '../../../../config/firebase';
import { vercelEmailService } from '../../../../services/vercelEmailService';

export default function HRPolicyManagement() {
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [acknowledgments, setAcknowledgments] = useState<PolicyAcknowledgment[]>([]);
  const [statistics, setStatistics] = useState<any>(null);
  const [policyService, setPolicyService] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Initialize service
  useEffect(() => {
    const initializeService = async () => {
      try {
        const service = await getPolicyService();
        setPolicyService(service);
      } catch (err) {
        console.error('Failed to initialize policy service:', err);
        setError('Failed to initialize policy service');
      }
    };
    initializeService();
  }, []);

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

  // Upload states
  const [inputMethod, setInputMethod] = useState<'type' | 'upload'>('type');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploadStatus, setUploadStatus] = useState('');

  useEffect(() => {
    loadData();
  }, [policyService]);

  // Real-time sync for policies and acknowledgments
  useEffect(() => {
    if (!policyService) return;

    let db;
    try {
      db = getFirebaseDb();
    } catch (error) {
      console.warn('Firebase not initialized yet, skipping real-time listeners');
      return;
    }

    console.log('🔄 Setting up real-time listeners for policies and acknowledgments...');

    // Listen to policies collection
    const policiesUnsubscribe = onSnapshot(
      collection(db, 'policies'),
      (snapshot) => {
        console.log('📡 Real-time update: policies changed');
        loadData();
      },
      (error) => {
        console.error('Error listening to policies:', error);
      }
    );

    // Listen to policyAcknowledgments collection
    const acknowledgementsUnsubscribe = onSnapshot(
      collection(db, 'policyAcknowledgments'),
      (snapshot) => {
        console.log('📡 Real-time update: acknowledgments changed');
        loadData();
      },
      (error) => {
        console.error('Error listening to acknowledgments:', error);
      }
    );

    // Cleanup listeners on unmount
    return () => {
      console.log('🛑 Cleaning up real-time listeners');
      policiesUnsubscribe();
      acknowledgementsUnsubscribe();
    };
  }, [policyService]);

  const loadData = async () => {
    if (!policyService) return;

    setLoading(true);
    try {
      const policiesData = await policyService.getPolicies();
      const acknowledgmentsData = await policyService.getPolicyAcknowledgments();

      setPolicies(policiesData);
      setAcknowledgments(acknowledgmentsData);

      // Get real employee count from Firebase
      let totalEmployees = 1;
      try {
        const { getComprehensiveDataFlowService } = await import('../../../../services/comprehensiveDataFlowService');
        const dataFlowService = await getComprehensiveDataFlowService();
        const allEmployees = await dataFlowService.getAllEmployees();
        totalEmployees = allEmployees.length || 1;
      } catch (error) {
        console.warn('Could not load employee count, using default:', error);
        totalEmployees = 1;
      }

      // Calculate statistics (only for policies that require acknowledgment)
      const requiredPolicies = policiesData.filter(p => p.requiresAcknowledgment);
      const totalAcknowledgment = acknowledgmentsData.length;
      const maxPossibleAcknowledgments = requiredPolicies.length * totalEmployees;
      const acknowledgmentRate = maxPossibleAcknowledgments > 0
        ? (totalAcknowledgment / maxPossibleAcknowledgments) * 100
        : 0;

      const policyStats = policiesData.map(policy => {
        const policyAcks = acknowledgmentsData.filter(ack => ack.policyId === policy.id);
        return {
          policyId: policy.id,
          policyTitle: policy.title,
          totalAcknowledgment: policyAcks.length,
          acknowledgmentRate: totalEmployees > 0 ? (policyAcks.length / totalEmployees) * 100 : 0,
          requiresAcknowledgment: policy.requiresAcknowledgment
        };
      });

      setStatistics({
        totalPolicies: policiesData.length,
        requiredPolicies: requiredPolicies.length,
        totalEmployees,
        totalAcknowledgment,
        acknowledgmentRate: isNaN(acknowledgmentRate) ? 0 : acknowledgmentRate,
        policyStats
      });

      console.log('📊 Statistics calculated:', {
        totalPolicies: policiesData.length,
        requiredPolicies: requiredPolicies.length,
        totalEmployees,
        totalAcknowledgment,
        maxPossibleAcknowledgments,
        acknowledgmentRate: acknowledgmentRate.toFixed(1) + '%',
        policiesData: policiesData.map(p => ({
          title: p.title,
          requiresAck: p.requiresAcknowledgment
        })),
        acknowledgmentsData: acknowledgmentsData.map(a => ({
          policyId: a.policyId,
          employeeId: a.employeeId
        }))
      });
    } catch (err) {
      setError('Failed to load policy data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePolicy = async () => {
    if (!policyService) return;

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
        // Send new policy email notification to all employees
        const emailResult = await vercelEmailService.sendNewPolicy({
          employeeName: 'All Employees',
          email: 'all-employees@company.com', // This should be a distribution list or sent to all employees
          policyTitle: policyForm.title,
          policyDescription: policyForm.content.substring(0, 200) + '...', // First 200 characters
          companyName: 'Your Company'
        });

        if (emailResult.success) {
          console.log('✅ New policy email sent successfully');
        } else {
          console.warn('⚠️ Failed to send new policy email:', emailResult.error);
          // Don't throw error - email failure shouldn't break the policy creation process
        }

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
    if (!policyService) return;

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
    if (!policyService) return;

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
      effectiveDate: formatDate(policy.effectiveDate, 'yyyy-MM-dd'),
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
    setInputMethod('type');
    setUploadedFile(null);
    setUploadStatus('');
    setSelectedPolicy(null);
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
      'application/msword', // .doc
      'text/plain'
    ];

    if (!validTypes.includes(file.type)) {
      setUploadStatus('❌ Please upload a PDF, DOCX, DOC, or TXT file');
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setUploadStatus('❌ File size must be less than 10MB');
      return;
    }

    setUploadedFile(file);
    setUploadStatus(`✅ Uploaded: ${file.name} (${(file.size / 1024).toFixed(2)} KB)`);

    // For text files, read and populate content
    if (file.type === 'text/plain') {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        setPolicyForm(prev => ({ ...prev, content }));
        setUploadStatus(`✅ Content loaded from ${file.name}`);
      };
      reader.readAsText(file);
    } else {
      // For PDF/DOCX, store reference
      setPolicyForm(prev => ({
        ...prev,
        content: `[Document uploaded: ${file.name}]\n\nPolicy content from uploaded document. Full document available for download.`
      }));
    }
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

  // Safe date formatting
  const formatDate = (date: any, formatString: string = 'MMM dd, yyyy'): string => {
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
        return 'Invalid date';
      }

      return format(parsedDate, formatString);
    } catch (error) {
      console.warn('Failed to format date:', date, error);
      return 'N/A';
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="max-w-7xl mx-auto space-y-6">
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
    <div className="p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Policy Management</h1>
            <p className="text-gray-600 mt-1">
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
              className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700"
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
                        Effective: {formatDate(policy.effectiveDate)}
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
                          Acknowledged: {formatDate(acknowledgment.acknowledgedAt, 'MMM dd, yyyy HH:mm')}
                        </p>
                      </div>
                      <div className="text-right">
                        <Badge variant="default" className="flex items-center space-x-1">
                          <CheckCircle className="h-3 w-3" />
                          <span>Acknowledged</span>
                        </Badge>
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

                {/* Content Input Method Toggle */}
                <div className="flex flex-col gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <Label className="text-sm font-medium">Policy Content Input Method</Label>
                  <div className="flex gap-4">
                    <button
                      type="button"
                      onClick={() => setInputMethod('type')}
                      className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 transition-all ${inputMethod === 'type'
                        ? 'border-blue-600 bg-blue-50 text-blue-700 font-semibold'
                        : 'border-gray-200 bg-white text-gray-600 hover:border-blue-300'
                        }`}
                    >
                      <Type className="h-5 w-5" />
                      <span>Type Content</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setInputMethod('upload')}
                      className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 transition-all ${inputMethod === 'upload'
                        ? 'border-blue-600 bg-blue-50 text-blue-700 font-semibold'
                        : 'border-gray-200 bg-white text-gray-600 hover:border-blue-300'
                        }`}
                    >
                      <Upload className="h-5 w-5" />
                      <span>Upload Document</span>
                    </button>
                  </div>
                </div>

                {/* Type Content Method */}
                {inputMethod === 'type' && (
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
                )}

                {/* Upload Document Method */}
                {inputMethod === 'upload' && (
                  <div className="flex flex-col gap-3">
                    <Label>Upload Policy Document</Label>

                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 bg-gray-50 hover:bg-gray-100 transition-colors">
                      <div className="flex flex-col items-center gap-3">
                        <FileText className="h-12 w-12 text-gray-400" />
                        <div className="text-center">
                          <p className="text-sm font-medium text-gray-700 mb-1">
                            Click to upload or drag and drop
                          </p>
                          <p className="text-xs text-gray-500">
                            PDF, DOCX, DOC, or TXT (max 10MB)
                          </p>
                        </div>
                        <input
                          type="file"
                          accept=".pdf,.docx,.doc,.txt"
                          onChange={handleFileUpload}
                          className="hidden"
                          id="fileUpload"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => document.getElementById('fileUpload')?.click()}
                        >
                          <Upload className="h-4 w-4 mr-2" />
                          Select File
                        </Button>
                      </div>
                    </div>

                    {/* Upload Status */}
                    {uploadStatus && (
                      <Alert className={uploadStatus.startsWith('✅') ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}>
                        <AlertDescription className={uploadStatus.startsWith('✅') ? 'text-green-800' : 'text-red-800'}>
                          {uploadStatus}
                        </AlertDescription>
                      </Alert>
                    )}

                    {/* File Preview */}
                    {uploadedFile && (
                      <div className="p-4 bg-white border border-gray-200 rounded-lg">
                        <div className="flex items-start gap-3">
                          <FileText className="h-5 w-5 text-blue-600 mt-1" />
                          <div className="flex-1">
                            <p className="font-medium text-gray-900">{uploadedFile.name}</p>
                            <p className="text-xs text-gray-500 mt-1">
                              {(uploadedFile.size / 1024).toFixed(2)} KB · {uploadedFile.type}
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setUploadedFile(null);
                              setUploadStatus('');
                              setPolicyForm(prev => ({ ...prev, content: '' }));
                            }}
                            className="text-red-600 hover:text-red-700 text-sm font-medium"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    )}

                    <p className="text-xs text-gray-500">
                      💡 <strong>Tip:</strong> For TXT files, content will be extracted automatically. For PDF/DOCX files, the document will be referenced and stored for employee download.
                    </p>
                  </div>
                )}

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <Label htmlFor="requiresAcknowledgment" className="text-base font-medium cursor-pointer">
                      Requires Employee Acknowledgment
                    </Label>
                    <p className="text-sm text-gray-600 mt-1">
                      If enabled, employees must acknowledge reading this policy
                    </p>
                  </div>
                  <input
                    id="requiresAcknowledgment"
                    type="checkbox"
                    checked={policyForm.requiresAcknowledgment}
                    onChange={(e) => setPolicyForm(prev => ({ ...prev, requiresAcknowledgment: e.target.checked }))}
                    className="h-5 w-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500 cursor-pointer"
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

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <Label htmlFor="edit-requiresAcknowledgment" className="text-base font-medium cursor-pointer">
                      Requires Employee Acknowledgment
                    </Label>
                    <p className="text-sm text-gray-600 mt-1">
                      If enabled, employees must acknowledge reading this policy
                    </p>
                  </div>
                  <input
                    id="edit-requiresAcknowledgment"
                    type="checkbox"
                    checked={policyForm.requiresAcknowledgment}
                    onChange={(e) => setPolicyForm(prev => ({ ...prev, requiresAcknowledgment: e.target.checked }))}
                    className="h-5 w-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500 cursor-pointer"
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
                      Effective: {formatDate(selectedPolicy.effectiveDate)}
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