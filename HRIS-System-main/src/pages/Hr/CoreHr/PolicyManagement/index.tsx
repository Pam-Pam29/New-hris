import React, { useState, useMemo } from 'react';
import { Button } from '../../../../components/ui/button';
import { TypographyH2 } from '../../../../components/ui/typography';
import { AtomicTanstackTable } from '../../../../components/TanstackTable/TanstackTable';
import { ColumnDef } from "@tanstack/react-table";
import { StatCard } from '../../../../components/molecules/StatCard';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../../../components/ui/dialog';
import { 
  PlusCircle, 
  Eye, 
  Edit, 
  Download, 
  FileText, 
  Shield, 
  CheckCircle, 
  Clock, 
  AlertTriangle,
  Search,
  Filter,
  BookOpen,
  Users,
  TrendingUp,
  Archive,
  Settings
} from 'lucide-react';
import { PolicyForm } from './components/PolicyForm';
import { PolicyDetailsDrawer } from './components/PolicyDetailsDrawer';
import { Policy } from './types'; // Import Policy type from types.ts
import { getPolicyService } from './services/policyService'; // Import getPolicyService
import { useToast } from '@/hooks/use-toast';

// Mock data
const mockPolicies: Policy[] = [
  {
    id: "1",
    title: 'Remote Work Policy',
    category: 'HR',
    version: '2.1',
    status: 'Published',
    description: 'Guidelines for remote work arrangements, equipment, and expectations.',
    content: 'This is the content of the remote work policy.',
    createdBy: 'HR Admin',
    createdDate: '2023-01-15',
    lastModified: '2023-06-10',
    approvedBy: 'CEO',
    approvedDate: '2023-06-08',
    publishedDate: '2023-06-10',
    effectiveDate: '2023-06-15',
    expiryDate: '2024-06-15',
    acknowledgmentRequired: true,
    acknowledgmentCount: 45,
    totalEmployees: 50,
    tags: ['remote', 'work-from-home', 'equipment']
  },
  {
    id: "2",
    title: 'Code of Conduct',
    category: 'Ethics',
    version: '1.0',
    status: 'Published',
    description: 'Company code of conduct and ethical guidelines for all employees.',
    content: 'This is the content of the code of conduct.',
    createdBy: 'Legal Team',
    createdDate: '2022-12-01',
    lastModified: '2022-12-01',
    approvedBy: 'Board',
    approvedDate: '2022-12-05',
    publishedDate: '2022-12-10',
    effectiveDate: '2023-01-01',
    expiryDate: '2023-12-31',
    acknowledgmentRequired: true,
    acknowledgmentCount: 50,
    totalEmployees: 50,
    tags: ['ethics', 'conduct', 'compliance']
  },
  {
    id: "3",
    title: 'Data Security Policy',
    category: 'IT',
    version: '3.0',
    status: 'Under Review',
    description: 'Comprehensive data security and privacy protection guidelines.',
    content: 'This is the content of the data security policy.',
    createdBy: 'IT Security',
    createdDate: '2023-08-01',
    lastModified: '2023-08-15',
    acknowledgmentRequired: true,
    acknowledgmentCount: 0,
    totalEmployees: 50,
    tags: ['security', 'data', 'privacy', 'gdpr']
  },
  {
    id: "4",
    title: 'Leave and Vacation Policy',
    category: 'HR',
    version: '1.5',
    status: 'Published',
    description: 'Annual leave, sick leave, and vacation request procedures.',
    content: 'This is the content of the leave and vacation policy.',
    createdBy: 'HR Admin',
    createdDate: '2023-03-01',
    lastModified: '2023-07-20',
    approvedBy: 'HR Director',
    approvedDate: '2023-07-18',
    publishedDate: '2023-07-20',
    effectiveDate: '2023-08-01',
    expiryDate: '2024-07-31',
    acknowledgmentRequired: false,
    acknowledgmentCount: 0,
    totalEmployees: 50,
    tags: ['leave', 'vacation', 'pto']
  },
  {
    id: "5",
    title: 'Expense Reimbursement Policy',
    category: 'Finance',
    version: '2.0',
    status: 'Draft',
    description: 'Guidelines for business expense reporting and reimbursement procedures.',
    content: 'This is the content of the expense reimbursement policy.',
    createdBy: 'Finance Team',
    createdDate: '2023-09-01',
    lastModified: '2023-09-15',
    acknowledgmentRequired: false,
    acknowledgmentCount: 0,
    totalEmployees: 50,
    tags: ['expenses', 'reimbursement', 'finance']
  }
];

interface FormValues {
  title: string;
  category: string;
  version: string;
  status: 'Draft' | 'Under Review' | 'Approved' | 'Published' | 'Archived';
  description: string;
  content: string;
  effectiveDate?: string;
  tags: string;
  acknowledgmentRequired: boolean;
}

export default function PolicyManagement() {
  const { toast } = useToast();
  const [selectedPolicy, setSelectedPolicy] = useState<Policy | null>(null);
  const [detailsDrawerOpen, setDetailsDrawerOpen] = useState(false);
  const [policies, setPolicies] = useState<Policy[]>(mockPolicies);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editForm, setEditForm] = useState<FormValues | null>(null);
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sending, setSending] = useState(false);
  const [form, setForm] = useState<FormValues>({
    title: '',
    category: '',
    version: '1.0',
    status: 'Draft',
    description: '',
    content: '',
    effectiveDate: '',
    tags: '',
    acknowledgmentRequired: false
  });
  useState<string | null>(null); // Add error state

  // Add handlePublish function
  const handlePublish = async (policyId: string) => {
    setSending(true);
    try {
      const service = await getPolicyService();
      const updatedPolicy = await service.updatePolicy(policyId, {
        status: 'Published',
        publishedDate: new Date().toISOString(),
        lastModified: new Date().toISOString()
      });

      setPolicies(prev => prev.map(p => p.id === policyId ? updatedPolicy : p));
      setDetailsDrawerOpen(false);
      setSelectedPolicy(null);
    } catch (error: unknown) {
      console.error('Error publishing policy:', error);
    } finally {
      setSending(false);
    }
  };

  // Statistics
  const totalPolicies = policies.length;
  const publishedPolicies = policies.filter(p => p.status === 'Published').length;
  const draftPolicies = policies.filter(p => p.status === 'Draft').length;
  const underReviewPolicies = policies.filter(p => p.status === 'Under Review').length;

  // Calculate overall acknowledgment rate
  const policiesRequiringAck = policies.filter(p => p.acknowledgmentRequired && p.status === 'Published');
  const totalAckRequired = policiesRequiringAck.reduce((sum, p) => sum + p.totalEmployees, 0);
  const totalAckReceived = policiesRequiringAck.reduce((sum, p) => sum + p.acknowledgmentCount, 0);
  const acknowledgmentRate = totalAckRequired > 0 ? Math.round((totalAckReceived / totalAckRequired) * 100) : 0;

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);

    try {
      const service = await getPolicyService();
      const newPolicy = await service.createPolicy({
        ...form,
        createdBy: 'Current User',
        createdDate: new Date().toISOString(),
        lastModified: new Date().toISOString(),
        acknowledgmentCount: 0,
        totalEmployees: 50,
        tags: form.tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0)
      });

      setPolicies(prev => [newPolicy, ...prev]);
      setDialogOpen(false);
      setForm({
        title: '',
        category: '',
        version: '1.0',
        status: 'Draft',
        description: '',
        content: '',
        effectiveDate: '',
        tags: '',
        acknowledgmentRequired: false
      });
    } catch (error: unknown) {
      console.error('Error creating policy:', error);
    } finally {
      setSending(false);
    }
  }

  // Filter options
  const categoryOptions = Array.from(new Set(policies.map(p => p.category)));
  const statusOptions = Array.from(new Set(policies.map(p => p.status)));

  // Filtered policies
  const filteredPolicies = policies.filter(policy =>
    (!categoryFilter || policy.category === categoryFilter) &&
    (!statusFilter || policy.status === statusFilter)
  );

  const columns = useMemo<ColumnDef<Policy>[]>(
    () => [
      {
        header: "Policy",
        accessorKey: "title",
        cell: ({ row }) => (
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <FileText className="h-4 w-4 text-primary" />
            </div>
            <div>
              <div className="font-semibold text-foreground">{row.original.title}</div>
              <div className="text-sm text-muted-foreground">Version {row.original.version} • {row.original.category}</div>
            </div>
          </div>
        ),
      },
      {
        header: "Status",
        accessorKey: "status",
        cell: ({ row }) => {
          const status = row.original.status;
          const statusConfig = {
            'Draft': { color: 'text-muted-foreground', bg: 'bg-muted/50', icon: Edit },
            'Under Review': { color: 'text-warning', bg: 'bg-warning/10 border-warning/20', icon: Clock },
            'Approved': { color: 'text-info', bg: 'bg-info/10 border-info/20', icon: Shield },
            'Published': { color: 'text-success', bg: 'bg-success/10 border-success/20', icon: CheckCircle },
            'Archived': { color: 'text-destructive', bg: 'bg-destructive/10 border-destructive/20', icon: Archive }
          };
          const config = statusConfig[status];
          const IconComponent = config.icon;
          
          return (
            <div className="flex items-center gap-2">
              <IconComponent className={`h-4 w-4 ${config.color}`} />
              <span className={`px-3 py-1 rounded-full text-xs font-medium border ${config.bg} ${config.color}`}>
                {status}
              </span>
            </div>
          );
        },
      },
      {
        header: "Compliance",
        accessorKey: "acknowledgmentRequired",
        cell: ({ row }) => {
          const policy = row.original;
          if (!policy.acknowledgmentRequired) {
            return (
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-muted-foreground rounded-full"></div>
                <span className="text-muted-foreground text-sm">Not required</span>
              </div>
            );
          }
          const rate = policy.totalEmployees > 0 ? Math.round((policy.acknowledgmentCount / policy.totalEmployees) * 100) : 0;
          const isCompliant = rate >= 80;
          
          return (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${isCompliant ? 'bg-success' : rate >= 60 ? 'bg-warning' : 'bg-destructive'}`}></div>
                <span className="font-medium text-sm">{policy.acknowledgmentCount}/{policy.totalEmployees}</span>
              </div>
              <div className="w-full bg-muted rounded-full h-1.5">
                <div 
                  className={`h-1.5 rounded-full transition-all duration-300 ${isCompliant ? 'bg-success' : rate >= 60 ? 'bg-warning' : 'bg-destructive'}`}
                  style={{ width: `${rate}%` }}
                ></div>
              </div>
              <div className="text-xs text-muted-foreground">{rate}% acknowledged</div>
            </div>
          );
        },
      },
      {
        header: "Last Modified",
        accessorKey: "lastModified",
        cell: ({ row }) => (
          <div className="text-sm">
            <div className="font-medium">{new Date(row.original.lastModified).toLocaleDateString()}</div>
            <div className="text-xs text-muted-foreground">by {row.original.createdBy}</div>
          </div>
        ),
      },
      {
        header: "Actions",
        id: "actions",
        cell: ({ row }) => (
          <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => {
                setSelectedPolicy(row.original);
                setDetailsDrawerOpen(true);
              }}
              className="p-2 hover:bg-info/10 text-info rounded-lg transition-colors"
              title="View Details"
            >
              <Eye className="h-4 w-4" />
            </button>
            <button
              onClick={() => {
                setEditForm({
                  ...row.original,
                  tags: row.original.tags ? row.original.tags.join(', ') : '',
                });
                setEditDialogOpen(true);
              }}
              className="p-2 hover:bg-primary/10 text-primary rounded-lg transition-colors"
              title="Edit Policy"
            >
              <Edit className="h-4 w-4" />
            </button>
            <button
              onClick={() => toast({ title: 'Export', description: 'Export will be available soon.', duration: 4000 })}
              className="p-2 hover:bg-secondary/10 text-secondary rounded-lg transition-colors"
              title="Export Policy"
            >
              <Download className="h-4 w-4" />
            </button>
          </div>
        ),
      },
    ],
    [toast, setSelectedPolicy, setDetailsDrawerOpen, setEditForm, setEditDialogOpen]
  );

  // Handle edit form submit
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);

    try {
      const service = await getPolicyService();
      if (editForm) {
        const updatedPolicy = await service.updatePolicy(selectedPolicy?.id || "", {
          ...editForm,
          lastModified: new Date().toISOString(),
          tags: editForm.tags.split(',').map((tag: string) => tag.trim()).filter((tag: string) => tag.length > 0)
        });

        setPolicies(prev => prev.map(p => p.id === selectedPolicy?.id ? updatedPolicy : p));
        setEditDialogOpen(false);
        setEditForm(null);
      }
    } catch (error: unknown) {
      console.error('Error updating policy:', error);
    } finally {
      setSending(false);
    }
  }

  return (
    <>
      <div className="p-8 min-h-screen animate-fade-in">
        {/* Header Section */}
        <div className="mb-8 animate-slide-in">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-xl shadow-soft">
                <BookOpen className="h-7 w-7 text-primary" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-gradient mb-1">
                  Policy Management
                </h1>
                <p className="text-muted-foreground">Create, manage, and track company policies and compliance</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" className="shadow-soft hover:shadow-soft-lg transition-all duration-200">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
              <Button 
                className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-soft hover:shadow-soft-lg transition-all duration-200" 
                onClick={() => setDialogOpen(true)}
              >
                <PlusCircle className="mr-2 h-4 w-4" />
                Create Policy
              </Button>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8 animate-fade-in">
          <div className="card-modern group hover:scale-105 bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-primary/10 rounded-xl group-hover:bg-primary/20 transition-colors">
                  <FileText className="h-6 w-6 text-primary" />
                </div>
                <div className="flex items-center gap-1 text-sm text-success">
                  <TrendingUp className="h-4 w-4" />
                  <span className="font-medium">+12%</span>
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Total Policies</p>
                <p className="text-3xl font-bold text-primary">{totalPolicies}</p>
                <p className="text-xs text-muted-foreground">All company policies</p>
              </div>
            </div>
          </div>

          <div className="card-modern group hover:scale-105 bg-gradient-to-br from-success/5 to-success/10 border-success/20">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-success/10 rounded-xl group-hover:bg-success/20 transition-colors">
                  <CheckCircle className="h-6 w-6 text-success" />
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Published</p>
                <p className="text-3xl font-bold text-success">{publishedPolicies}</p>
                <p className="text-xs text-muted-foreground">Active policies</p>
              </div>
            </div>
          </div>

          <div className="card-modern group hover:scale-105 bg-gradient-to-br from-warning/5 to-warning/10 border-warning/20">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-warning/10 rounded-xl group-hover:bg-warning/20 transition-colors">
                  <Clock className="h-6 w-6 text-warning" />
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Under Review</p>
                <p className="text-3xl font-bold text-warning">{underReviewPolicies}</p>
                <p className="text-xs text-muted-foreground">Pending approval</p>
              </div>
            </div>
          </div>

          <div className="card-modern group hover:scale-105 bg-gradient-to-br from-info/5 to-info/10 border-info/20">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-info/10 rounded-xl group-hover:bg-info/20 transition-colors">
                  <Edit className="h-6 w-6 text-info" />
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Drafts</p>
                <p className="text-3xl font-bold text-info">{draftPolicies}</p>
                <p className="text-xs text-muted-foreground">Work in progress</p>
              </div>
            </div>
          </div>

          <div className="card-modern group hover:scale-105 bg-gradient-to-br from-secondary/5 to-secondary/10 border-secondary/20">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-secondary/10 rounded-xl group-hover:bg-secondary/20 transition-colors">
                  <Users className="h-6 w-6 text-secondary" />
                </div>
                <div className={`flex items-center gap-1 text-sm ${acknowledgmentRate >= 80 ? 'text-success' : acknowledgmentRate >= 60 ? 'text-warning' : 'text-destructive'}`}>
                  {acknowledgmentRate >= 80 ? <TrendingUp className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Acknowledgment Rate</p>
                <p className="text-3xl font-bold text-secondary">{acknowledgmentRate}%</p>
                <p className="text-xs text-muted-foreground">Employee compliance</p>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="card-modern mb-8">
          <div className="p-6">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
              <div className="flex items-center gap-4 flex-1">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search policies..."
                    className="w-full pl-10 pr-4 py-2 border border-input rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
                  />
                </div>
                <div className="flex gap-2">
                  <select
                    value={categoryFilter}
                    onChange={e => setCategoryFilter(e.target.value)}
                    className="px-3 py-2 border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    <option value="">All Categories</option>
                    {categoryOptions.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                  <select
                    value={statusFilter}
                    onChange={e => setStatusFilter(e.target.value)}
                    className="px-3 py-2 border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    <option value="">All Statuses</option>
                    {statusOptions.map(status => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" className="shadow-soft hover:shadow-soft-lg transition-all duration-200">
                  <Download className="h-4 w-4 mr-2" />
                  Export All
                </Button>
                <Button variant="outline" className="shadow-soft hover:shadow-soft-lg transition-all duration-200">
                  <Archive className="h-4 w-4 mr-2" />
                  Archive
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Policies Table */}
        <div className="card-modern overflow-hidden">
          <AtomicTanstackTable
            data={filteredPolicies}
            columns={columns}
            showGlobalFilter={false}
            pageSizeOptions={[10, 20, 50]}
            initialPageSize={10}
            className="table-modern"
          />
        </div>

        {/* Create Policy Dialog */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Create New Policy</DialogTitle>
            </DialogHeader>
            <PolicyForm
              form={form}
              setForm={setForm}
              handleSubmit={handleSubmit}
              sending={sending}
            />
          </DialogContent>
        </Dialog>
      </div>
      {/* Edit Policy Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Policy</DialogTitle>
          </DialogHeader>
          {editForm && (
            <PolicyForm
              form={form}
              setForm={setEditForm}
              handleSubmit={handleEditSubmit}
              sending={sending}
              submitLabel="Update Policy"
            />
          )}
        </DialogContent>
      </Dialog>
      <PolicyDetailsDrawer
        open={detailsDrawerOpen}
        onOpenChange={open => setDetailsDrawerOpen(open)}
        policy={selectedPolicy || mockPolicies[0]} // Provide a default value
        onPublish={() => handlePublish(selectedPolicy?.id || "")}
        sending={sending}
      />
    </>
  );
}