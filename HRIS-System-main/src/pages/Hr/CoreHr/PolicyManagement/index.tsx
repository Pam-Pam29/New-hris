import React, { useState, useMemo } from 'react';
import { Button } from '../../../../components/ui/button';
import { TypographyH2 } from '../../../../components/ui/typography';
import { AtomicTanstackTable } from '../../../../components/TanstackTable/TanstackTable';
import { ColumnDef } from "@tanstack/react-table";
import { StatCard } from '../../../../components/molecules/StatCard';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../../../components/ui/dialog';
import { PlusCircle, Eye, Edit, Download } from 'lucide-react';
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
          <div>
            <div className="font-medium">{row.original.title}</div>
            <div className="text-xs text-muted-foreground">v{row.original.version}</div>
          </div>
        ),
      },
      {
        header: "Category",
        accessorKey: "category",
      },
      {
        header: "Status",
        accessorKey: "status",
        cell: ({ row }) => {
          const status = row.original.status;
          const statusColors = {
            'Draft': 'bg-gray-100 text-gray-800',
            'Under Review': 'bg-yellow-100 text-yellow-800',
            'Approved': 'bg-blue-100 text-blue-800',
            'Published': 'bg-green-100 text-green-800',
            'Archived': 'bg-red-100 text-red-800'
          };
          return (
            <span className={`px-2 py-1 rounded text-xs font-medium ${statusColors[status]}`}>
              {status}
            </span>
          );
        },
      },
      {
        header: "Acknowledgment",
        accessorKey: "acknowledgmentRequired",
        cell: ({ row }) => {
          const policy = row.original;
          if (!policy.acknowledgmentRequired) {
            return <span className="text-muted-foreground text-sm">Not required</span>;
          }
          const rate = policy.totalEmployees > 0 ? Math.round((policy.acknowledgmentCount / policy.totalEmployees) * 100) : 0;
          return (
            <div className="text-sm">
              <div className="font-medium">{policy.acknowledgmentCount}/{policy.totalEmployees}</div>
              <div className="text-xs text-muted-foreground">{rate}% acknowledged</div>
            </div>
          );
        },
      },
      {
        header: "Last Modified",
        accessorKey: "lastModified",
        cell: ({ row }) => new Date(row.original.lastModified).toLocaleDateString(),
      },
      {
        header: "Actions",
        id: "actions",
        cell: ({ row }) => (
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={() => {
              setSelectedPolicy(row.original);
              setDetailsDrawerOpen(true);
            }}>
              <Eye className="h-3 w-3 mr-1" />
              View
            </Button>
            <Button size="sm" variant="outline" onClick={() => {
              setEditForm({
                ...row.original,
                tags: row.original.tags ? row.original.tags.join(', ') : '',
              });
              setEditDialogOpen(true);
            }}>
              <Edit className="h-3 w-3 mr-1" />
              Edit
            </Button>
            <Button size="sm" variant="outline" onClick={() => toast({ title: 'Export', description: 'Export will be available soon.', duration: 4000 })}>
              <Download className="h-3 w-3 mr-1" />
              Export
            </Button>
          </div>
        ),
      },
    ],
    []
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
      <div className="p-8 min-h-screen bg-background text-foreground">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <StatCard
            label="Total Policies"
            value={totalPolicies.toString()}
            description="All company policies"
            color="orange"
          />
          <StatCard
            label="Published"
            value={publishedPolicies.toString()}
            description="Active policies"
            color="orange"
          />
          <StatCard
            label="Under Review"
            value={underReviewPolicies.toString()}
            description="Pending approval"
            color="orange"
          />
          <StatCard
            label="Drafts"
            value={draftPolicies.toString()}
            description="Work in progress"
            color="orange"
          />
          <StatCard
            label="Acknowledgment Rate"
            value={`${acknowledgmentRate}%`}
            description="Employee compliance"
            color="orange"
          />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <TypographyH2>Policy Management</TypographyH2>
          <Button className="bg-violet-600 hover:bg-violet-700 text-white" onClick={() => setDialogOpen(true)}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Create Policy
          </Button>
        </div>

        {/* Policies Table */}
        <div className="overflow-x-auto rounded-xl shadow border border-border bg-card">
          <AtomicTanstackTable
            data={filteredPolicies}
            columns={columns}
            showGlobalFilter
            globalFilterPlaceholder="Search policies..."
            pageSizeOptions={[10, 20, 50]}
            initialPageSize={10}
            className="min-w-full divide-y divide-border bg-muted text-foreground font-semibold text-sm uppercase tracking-wide"
            filterDropdowns={
              <>
                <select
                  value={categoryFilter}
                  onChange={e => setCategoryFilter(e.target.value)}
                  className="px-3 py-2 rounded-md border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-violet-400"
                >
                  <option value="">All Categories</option>
                  {categoryOptions.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
                <select
                  value={statusFilter}
                  onChange={e => setStatusFilter(e.target.value)}
                  className="px-3 py-2 rounded-md border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-violet-400"
                >
                  <option value="">All Statuses</option>
                  {statusOptions.map(status => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
              </>
            }
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