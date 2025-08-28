import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { LeaveDetailsDrawer } from './components/LeaveDetailsDrawer';
import { LeaveTypeManagement } from './components/LeaveTypeManagement';
import { LeaveRequestForm } from './components/LeaveRequestForm';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { mockLeaveTypes } from './components/LeaveTypeManagement';
import { mockLeaveEntitlements, getLeaveBalance } from './leaveBalanceUtils';
import { AtomicTanstackTable } from '@/components/TanstackTable/TanstackTable';
import { ColumnDef } from '@tanstack/react-table';

interface LeaveRequest {
  id: number;
  employeeName: string;
  employeeId: number;
  type: string;
  startDate: string;
  endDate: string;
  status: 'Pending' | 'Approved' | 'Rejected' | 'Cancelled';
  reason?: string;
  submittedDate: string;
  approver?: string;
  approvedDate?: string;
}

const mockLeaveRequests: LeaveRequest[] = [
  {
    id: 1,
    employeeName: 'Jane Doe',
    employeeId: 101,
    type: 'Annual',
    startDate: '2025-08-01',
    endDate: '2025-08-10',
    status: 'Pending',
    reason: 'Family vacation',
    submittedDate: '2025-07-10',
  },
  {
    id: 2,
    employeeName: 'John Smith',
    employeeId: 102,
    type: 'Sick',
    startDate: '2025-07-20',
    endDate: '2025-07-22',
    status: 'Approved',
    reason: 'Flu',
    submittedDate: '2025-07-18',
    approver: 'HR Manager',
    approvedDate: '2025-07-19',
  },
];

export default function LeaveManagement() {
  const [selectedRequest, setSelectedRequest] = useState<LeaveRequest | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [requests, setRequests] = useState<LeaveRequest[]>(mockLeaveRequests);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState('');

  // Columns for Tanstack Table
  const columns = useMemo<ColumnDef<LeaveRequest>[]>(() => [
    {
      accessorKey: 'employeeName',
      header: 'Employee',
      cell: info => info.getValue(),
    },
    {
      accessorKey: 'type',
      header: 'Type',
      cell: info => info.getValue(),
    },
    {
      id: 'dates',
      header: 'Dates',
      cell: ({ row }) => `${row.original.startDate} - ${row.original.endDate}`,
    },
    {
      id: 'days',
      header: 'Days',
      cell: ({ row }) => {
        const start = new Date(row.original.startDate);
        const end = new Date(row.original.endDate);
        // Inclusive of both start and end
        const diff = Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
        return <span>{diff > 0 ? diff : 1}</span>;
      },
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const status = row.original.status;
        let color = '';
        switch (status) {
          case 'Pending': color = 'bg-yellow-100 text-yellow-800'; break;
          case 'Approved': color = 'bg-green-100 text-green-800'; break;
          case 'Rejected': color = 'bg-red-100 text-red-800'; break;
          default: color = 'bg-gray-100 text-gray-800';
        }
        return <span className={`px-2 py-1 rounded text-xs font-medium ${color}`}>{status}</span>;
      },
    },
    {
      accessorKey: 'submittedDate',
      header: 'Submitted',
      cell: info => info.getValue(),
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <Button size="sm" variant="outline" onClick={() => { setSelectedRequest(row.original); setDetailsOpen(true); }}>
          View
        </Button>
      ),
      enableSorting: false,
      enableColumnFilter: false,
    },
  ], []);

  // Filtered data for status
  const filteredRequests = useMemo(() => {
    if (!statusFilter) return requests;
    return requests.filter(req => req.status === statusFilter);
  }, [requests, statusFilter]);

  const [leaveTypeDialogOpen, setLeaveTypeDialogOpen] = useState(false);
  const [leaveRequestDialogOpen, setLeaveRequestDialogOpen] = useState(false);
  const [submittingRequest, setSubmittingRequest] = useState(false);

  function handleCreateLeaveRequest(data: any) {
    setSubmittingRequest(true);
    setTimeout(() => {
      setRequests(prev => [
        ...prev,
        {
          id: prev.length ? Math.max(...prev.map(r => r.id)) + 1 : 1,
          employeeName: data.employeeName,
          employeeId: prev.length ? prev[prev.length - 1].employeeId + 1 : 100,
          type: data.type,
          startDate: data.startDate,
          endDate: data.endDate,
          status: 'Pending',
          reason: data.reason,
          submittedDate: new Date().toISOString().split('T')[0],
        }
      ]);
      setSubmittingRequest(false);
      setLeaveRequestDialogOpen(false);
    }, 800);
  }

  // Build summary data for leave balances
  const employeeMap = Object.fromEntries(requests.map(r => [r.employeeId, r.employeeName]));
  const summaryRows = mockLeaveEntitlements.map(ent => {
    const taken = requests
      .filter(r => r.employeeId === ent.employeeId && r.type === ent.type && r.status === 'Approved')
      .reduce((sum, r) => {
        const start = new Date(r.startDate);
        const end = new Date(r.endDate);
        const diff = Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
        return sum + (diff > 0 ? diff : 1);
      }, 0);
    const balance = getLeaveBalance(mockLeaveEntitlements, requests, ent.employeeId, ent.type);
    return {
      employeeId: ent.employeeId,
      employeeName: employeeMap[ent.employeeId] || `ID ${ent.employeeId}`,
      type: ent.type,
      entitled: ent.entitled,
      taken,
      balance: balance ?? '-'
    };
  });

  return (
    <div className="p-8 min-h-screen bg-background text-foreground">

      <h1 className="text-3xl font-bold mb-6">Leave Management</h1>
      <div className="flex justify-between mb-4">

        <Button className="bg-violet-600 text-white" onClick={() => setLeaveTypeDialogOpen(true)}>
          Manage Leave Types
        </Button>
      </div>

      <Dialog open={leaveTypeDialogOpen} onOpenChange={setLeaveTypeDialogOpen}>
        <DialogContent className="max-w-2xl">
          <LeaveTypeManagement />
        </DialogContent>
      </Dialog>
      {/* Leave Requests Table using AtomicTanstackTable */}
      <div className="overflow-x-auto rounded-xl shadow border border-border bg-card">
        <AtomicTanstackTable
          data={filteredRequests}
          columns={columns}
          showGlobalFilter
          globalFilterPlaceholder="Search leave requests..."
          pageSizeOptions={[10, 20, 50]}
          initialPageSize={10}
          tableClassName="min-w-full divide-y divide-border"
          rowClassName={(row: { index: number }) =>
            `transition-colors ${row.index % 2 === 0 ? 'bg-muted/50' : 'bg-background'} hover:bg-violet-50 dark:hover:bg-violet-900`}
          headerClassName="bg-muted text-foreground font-semibold text-sm uppercase tracking-wide"
          filterDropdowns={
            <>
              {/* Example filter: by status */}
              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                className="px-3 py-2 rounded-md border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-violet-400 mr-2"
              >
                <option value="">All Statuses</option>
                <option value="Pending">Pending</option>
                <option value="Approved">Approved</option>
                <option value="Rejected">Rejected</option>
                <option value="Cancelled">Cancelled</option>
              </select>
              {/* Additional filters can be added here */}
            </>
          }
        />
      </div>
      {/* Details Drawer/Modal */}
      <LeaveDetailsDrawer
        open={detailsOpen}
        onClose={() => setDetailsOpen(false)}
        request={selectedRequest}
        onApprove={handleApprove}
        onReject={handleReject}
        loading={loading}
        requests={requests}
        entitlements={mockLeaveEntitlements}
      />
    </div>
  );

  function handleApprove() {
    if (!selectedRequest) return;
    setLoading(true);
    setTimeout(() => {
      setRequests(prev => prev.map(req =>
        req.id === selectedRequest.id ? {
          ...req,
          status: 'Approved',
          approver: 'HR Manager',
          approvedDate: new Date().toISOString().split('T')[0],
        } : req
      ));
      setLoading(false);
      setDetailsOpen(false);
    }, 1000);
  }

  function handleReject() {
    if (!selectedRequest) return;
    setLoading(true);
    setTimeout(() => {
      setRequests(prev => prev.map(req =>
        req.id === selectedRequest.id ? {
          ...req,
          status: 'Rejected',
          approver: 'HR Manager',
          approvedDate: new Date().toISOString().split('T')[0],
        } : req
      ));
      setLoading(false);
      setDetailsOpen(false);
    }, 1000);
  }
}
