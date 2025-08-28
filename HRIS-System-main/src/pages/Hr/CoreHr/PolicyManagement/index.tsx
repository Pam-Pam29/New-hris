import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { TypographyH2 } from '@/components/ui/typography';
import { AtomicTanstackTable } from '@/components/TanstackTable/TanstackTable';
import { ColumnDef } from "@tanstack/react-table";
import { StatCard } from '@/components/molecules/StatCard';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { PlusCircle, FileText, Users, CheckCircle, Clock, Eye, Edit, Download } from 'lucide-react';
import { PolicyForm } from './components/PolicyForm';
import { PolicyDetailsDrawer } from './components/PolicyDetailsDrawer';

// Policy type definition
interface Policy {
  id: number;
  title: string;
  category: string;
  version: string;
  status: 'Draft' | 'Under Review' | 'Approved' | 'Published' | 'Archived';
  description: string;
  createdBy: string;
  createdDate: string;
  lastModified: string;
  approvedBy?: string;
  approvedDate?: string;
  publishedDate?: string;
  effectiveDate?: string;
  expiryDate?: string;
  acknowledgmentRequired: boolean;
  acknowledgmentCount: number;
  totalEmployees: number;
  tags: string[];
}

// Mock data
const mockPolicies: Policy[] = [
  {
    id: 1,
    title: 'Remote Work Policy',
    category: 'HR',
    version: '2.1',
    status: 'Published',
    description: 'Guidelines for remote work arrangements, equipment, and expectations.',
    createdBy: 'HR Admin',
    createdDate: '2023-01-15',
    lastModified: '2023-06-10',
    approvedBy: 'CEO',
    approvedDate: '2023-06-08',
    publishedDate: '2023-06-10',
    effectiveDate: '2023-06-15',
    acknowledgmentRequired: true,
    acknowledgmentCount: 45,
    totalEmployees: 50,
    tags: ['remote', 'work-from-home', 'equipment']
  },
  {
    id: 2,
    title: 'Code of Conduct',
    category: 'Ethics',
    version: '1.0',
    status: 'Published',
    description: 'Company code of conduct and ethical guidelines for all employees.',
    createdBy: 'Legal Team',
    createdDate: '2022-12-01',
    lastModified: '2022-12-01',
    approvedBy: 'Board',
    approvedDate: '2022-12-05',
    publishedDate: '2022-12-10',
    effectiveDate: '2023-01-01',
    acknowledgmentRequired: true,
    acknowledgmentCount: 50,
    totalEmployees: 50,
    tags: ['ethics', 'conduct', 'compliance']
  },
  {
    id: 3,
    title: 'Data Security Policy',
    category: 'IT',
    version: '3.0',
    status: 'Under Review',
    description: 'Comprehensive data security and privacy protection guidelines.',
    createdBy: 'IT Security',
    createdDate: '2023-08-01',
    lastModified: '2023-08-15',
    acknowledgmentRequired: true,
    acknowledgmentCount: 0,
    totalEmployees: 50,
    tags: ['security', 'data', 'privacy', 'gdpr']
  },
  {
    id: 4,
    title: 'Leave and Vacation Policy',
    category: 'HR',
    version: '1.5',
    status: 'Published',
    description: 'Annual leave, sick leave, and vacation request procedures.',
    createdBy: 'HR Admin',
    createdDate: '2023-03-01',
    lastModified: '2023-07-20',
    approvedBy: 'HR Director',
    approvedDate: '2023-07-18',
    publishedDate: '2023-07-20',
    effectiveDate: '2023-08-01',
    acknowledgmentRequired: false,
    acknowledgmentCount: 0,
    totalEmployees: 50,
    tags: ['leave', 'vacation', 'pto']
  },
  {
    id: 5,
    title: 'Expense Reimbursement Policy',
    category: 'Finance',
    version: '2.0',
    status: 'Draft',
    description: 'Guidelines for business expense reporting and reimbursement procedures.',
    createdBy: 'Finance Team',
    createdDate: '2023-09-01',
    lastModified: '2023-09-15',
    acknowledgmentRequired: false,
    acknowledgmentCount: 0,
    totalEmployees: 50,
    tags: ['expenses', 'reimbursement', 'finance']
  }
];

export default function PolicyManagement() {
  const [selectedPolicy, setSelectedPolicy] = useState<Policy | null>(null);
  const [detailsDrawerOpen, setDetailsDrawerOpen] = useState(false);
  const [policies, setPolicies] = useState<Policy[]>(mockPolicies);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editForm, setEditForm] = useState<any | null>(null);
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sending, setSending] = useState(false);
  const [form, setForm] = useState({
    title: '',
    category: '',
    version: '1.0',
    status: 'Draft',
    description: '',
    effectiveDate: '',
    tags: '',
    acknowledgmentRequired: false
  });

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
  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSending(true);

    setTimeout(() => {
      const newPolicy: Policy = {
        id: policies.length + 1,
        title: form.title,
        category: form.category,
        version: form.version,
        status: form.status as Policy['status'],
        description: form.description,
        createdBy: 'Current User',
        createdDate: new Date().toISOString().split('T')[0],
        lastModified: new Date().toISOString().split('T')[0],
        effectiveDate: form.effectiveDate,
        acknowledgmentRequired: form.acknowledgmentRequired,
        acknowledgmentCount: 0,
        totalEmployees: 50,
        tags: form.tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0)
      };

      setPolicies(prev => [...prev, newPolicy]);
      setSending(false);
      setDialogOpen(false);
      
      // Reset form
      setForm({
        title: '',
        category: '',
        version: '1.0',
        status: 'Draft',
        description: '',
        effectiveDate: '',
        tags: '',
        acknowledgmentRequired: false
      });
    }, 1200);
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
            <Button size="sm" variant="outline">
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
  function handleEditSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSending(true);
    setTimeout(() => {
      setPolicies(prev => prev.map(p => p.id === editForm.id ? {
        ...p,
        ...editForm,
        tags: editForm.tags.split(',').map((tag: string) => tag.trim()).filter((tag: string) => tag.length > 0),
        lastModified: new Date().toISOString().split('T')[0],
      } : p));
      setSending(false);
      setEditDialogOpen(false);
      setEditForm(null);
    }, 1200);
  }

  return (
    <>
      <div className="p-8 min-h-screen bg-background text-foreground">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <StatCard
            title="Total Policies"
            value={totalPolicies.toString()}
            icon={<FileText className="h-4 w-4" />}
            description="All company policies"
            color="orange"
          />
          <StatCard
            title="Published"
            value={publishedPolicies.toString()}
            icon={<CheckCircle className="h-4 w-4" />}
            description="Active policies"
            color="orange"
          />
          <StatCard
            title="Under Review"
            value={underReviewPolicies.toString()}
            icon={<Clock className="h-4 w-4" />}
            description="Pending approval"
            color="orange"
          />
          <StatCard
            title="Drafts"
            value={draftPolicies.toString()}
            icon={<Edit className="h-4 w-4" />}
            description="Work in progress"
            color="orange"
          />
          <StatCard
            title="Acknowledgment Rate"
            value={`${acknowledgmentRate}%`}
            icon={<Users className="h-4 w-4" />}
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
            tableClassName="min-w-full divide-y divide-border"
            rowClassName={(row: { index: number }) =>
              `transition-colors ${row.index % 2 === 0 ? 'bg-muted/50' : 'bg-background'} hover:bg-violet-50 dark:hover:bg-violet-900`}
            headerClassName="bg-muted text-foreground font-semibold text-sm uppercase tracking-wide"
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
              form={editForm}
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
        policy={selectedPolicy}
        onPublish={handlePublish}
        sending={sending}
      />
    </>
  );

  // Add handlePublish function
  function handlePublish(policyId: number) {
    setSending(true);
    setTimeout(() => {
      setPolicies(prev => prev.map((p: Policy) =>
        p.id === policyId && (p.status === 'Draft' || p.status === 'Under Review')
          ? { ...p, status: 'Published', publishedDate: new Date().toISOString().split('T')[0], lastModified: new Date().toISOString().split('T')[0] }
          : p
      ));
      setSending(false);
      setDetailsDrawerOpen(false);
      setSelectedPolicy(null);
    }, 1200);
  }
}