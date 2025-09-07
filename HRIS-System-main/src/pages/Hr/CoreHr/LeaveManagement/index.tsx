import { useState, useEffect, useMemo } from 'react';
import { Button } from '../../../../components/ui/button';
import { LeaveDetailsDrawer } from './components/LeaveDetailsDrawer';
import { LeaveTypeManagement } from './components/LeaveTypeManagement';
import { Dialog, DialogContent } from '../../../../components/ui/dialog';
import { AtomicTanstackTable } from '../../../../components/TanstackTable/TanstackTable';
import { ColumnDef } from '@tanstack/react-table';
import { useToast } from '../../../../hooks/use-toast';
import { getLeaveRequestService } from './services/leaveRequestService';
import { Input } from '../../../../components/ui/input';
import { Label } from '../../../../components/ui/label';

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

// const mockLeaveEntitlements: any[] = [];

export default function LeaveManagement() {
  const { toast } = useToast();
  const [selectedRequest, setSelectedRequest] = useState<LeaveRequest | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [requests, setRequests] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const svc = await getLeaveRequestService();
        const list = await svc.listRequests();
        setRequests(list as any);
      } catch (error) {
        console.error('Error loading leave requests:', error);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

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
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={() => { setSelectedRequest(row.original); setDetailsOpen(true); }}>
            View
          </Button>
          <Button size="sm" variant="outline" onClick={() => toast({ title: 'Download', description: 'Download will be available soon.', duration: 4000 })}>
            Download
          </Button>
        </div>
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
  const [addLeaveDialogOpen, setAddLeaveDialogOpen] = useState(false);
  const [newLeave, setNewLeave] = useState({
    employeeName: '',
    type: '',
    startDate: '',
    endDate: ''
  });

  async function handleApprove() {
    if (!selectedRequest) return;
    setLoading(true);
    try {
      const svc = await getLeaveRequestService();
      const updated = await svc.updateRequest(String(selectedRequest.id), {
        status: 'Approved',
        approver: 'HR Manager',
        approvedDate: new Date().toISOString().split('T')[0],
      } as any);
      setRequests(prev => prev.map(r => r.id === selectedRequest.id ? (updated as any) : r));
      setDetailsOpen(false);
    } catch (e) {
      console.error('Error approving leave:', e);
      (toast && toast({ title: 'Failed to approve leave', description: e instanceof Error ? e.message : 'Unknown error' }));
    } finally {
      setLoading(false);
    }
  }

  async function handleReject() {
    if (!selectedRequest) return;
    setLoading(true);
    try {
      const svc = await getLeaveRequestService();
      const updated = await svc.updateRequest(String(selectedRequest.id), {
        status: 'Rejected',
        approver: 'HR Manager',
        approvedDate: new Date().toISOString().split('T')[0],
      } as any);
      setRequests(prev => prev.map(r => r.id === selectedRequest.id ? (updated as any) : r));
      setDetailsOpen(false);
    } catch (e) {
      console.error('Error rejecting leave:', e);
      (toast && toast({ title: 'Failed to reject leave', description: e instanceof Error ? e.message : 'Unknown error' }));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-8 min-h-screen bg-background text-foreground">

      <h1 className="text-3xl font-bold mb-6">Leave Management</h1>
      <div className="flex justify-between mb-4">

        <div className="flex gap-2">
          <Button className="bg-violet-600 text-white" onClick={() => setAddLeaveDialogOpen(true)}>
            Add Leave
          </Button>
          <Button className="bg-violet-600 text-white" onClick={() => setLeaveTypeDialogOpen(true)}>
            Manage Leave Types
          </Button>
        </div>
      </div>

      <Dialog open={leaveTypeDialogOpen} onOpenChange={setLeaveTypeDialogOpen}>
        <DialogContent className="max-w-2xl">
          <LeaveTypeManagement />
        </DialogContent>
      </Dialog>

      {/* Add Leave Dialog */}
      <Dialog open={addLeaveDialogOpen} onOpenChange={setAddLeaveDialogOpen}>
        <DialogContent className="max-w-lg">
          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium mb-1">Employee</Label>
              <Input value={newLeave.employeeName} onChange={(e) => setNewLeave(prev => ({ ...prev, employeeName: e.target.value }))} placeholder="Employee name" />
            </div>
            <div>
              <Label className="text-sm font-medium mb-1">Type</Label>
              <Input value={newLeave.type} onChange={(e) => setNewLeave(prev => ({ ...prev, type: e.target.value }))} placeholder="Leave type" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium mb-1">Start Date</Label>
                <Input type="date" value={newLeave.startDate} onChange={(e) => setNewLeave(prev => ({ ...prev, startDate: e.target.value }))} />
              </div>
              <div>
                <Label className="text-sm font-medium mb-1">End Date</Label>
                <Input type="date" value={newLeave.endDate} onChange={(e) => setNewLeave(prev => ({ ...prev, endDate: e.target.value }))} />
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <Button className="bg-violet-600 hover:bg-violet-700" onClick={async () => {
                try {
                  const svc = await getLeaveRequestService();
                  const created = await svc.createRequest({
                    employeeName: newLeave.employeeName || 'Employee',
                    type: newLeave.type || 'General Leave',
                    startDate: newLeave.startDate || new Date().toISOString().split('T')[0],
                    endDate: newLeave.endDate || new Date().toISOString().split('T')[0],
                  } as any);
                  setRequests(prev => [created as any, ...prev]);
                  toast({ title: 'Leave request submitted', description: `${created.employeeName} - ${created.type}`, duration: 3500 });
                } catch (e) {
                  toast({ title: 'Failed to submit leave', description: e instanceof Error ? e.message : 'Unknown error', duration: 5000 });
                } finally {
                  setAddLeaveDialogOpen(false);
                  setNewLeave({ employeeName: '', type: '', startDate: '', endDate: '' });
                }
              }}>Save</Button>
              <Button variant="outline" onClick={() => setAddLeaveDialogOpen(false)}>Cancel</Button>
            </div>
          </div>
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
          className="min-w-full divide-y divide-border"
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
        requests={filteredRequests}
        entitlements={[]}
      />
    </div>
  );
}
