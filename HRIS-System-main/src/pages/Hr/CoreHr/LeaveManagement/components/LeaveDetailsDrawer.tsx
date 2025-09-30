import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { LeaveEntitlement, getLeaveBalance } from '../leaveBalanceUtils';

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

interface LeaveDetailsDrawerProps {
  open: boolean;
  onClose: () => void;
  request: LeaveRequest | null;
  onApprove?: () => void;
  onReject?: () => void;
  loading?: boolean;
  requests: LeaveRequest[];
  entitlements: LeaveEntitlement[];
}

export const LeaveDetailsDrawer: React.FC<LeaveDetailsDrawerProps> = ({ open, onClose, request, onApprove, onReject, loading, requests, entitlements }) => {
  if (!request) return null;

  // All leave requests for this employee
  const userRequests = requests.filter(r => r.employeeId === request.employeeId);
  // All leave entitlements for this employee
  const userEnts = entitlements.filter(e => e.employeeId === request.employeeId);

  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="max-w-2xl w-full p-8 bg-background rounded-2xl shadow-2xl border border-border flex flex-col">
        <DialogHeader>
          <DialogTitle>Leave Request Details</DialogTitle>
          <DialogDescription>
            View and manage leave request details.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div><span className="font-semibold">Employee:</span> {request.employeeName}</div>
          <div><span className="font-semibold">Type:</span> {request.type}</div>
          <div><span className="font-semibold">Dates:</span> {request.startDate} - {request.endDate}</div>
          <div><span className="font-semibold">Status:</span> {request.status}</div>
          <div><span className="font-semibold">Submitted:</span> {request.submittedDate}</div>
          {request.reason && <div><span className="font-semibold">Reason:</span> {request.reason}</div>}
          {request.approver && <div><span className="font-semibold">Approver:</span> {request.approver}</div>}
          {request.approvedDate && <div><span className="font-semibold">Approved Date:</span> {request.approvedDate}</div>}
        </div>

        {/* Leave Balance Summary for this employee */}
        <div className="mt-8">
          <h3 className="font-semibold mb-2">Leave Balances</h3>
          <table className="min-w-full border rounded bg-card divide-y divide-border text-sm mb-4">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-1 text-left">Leave Type</th>
                <th className="px-3 py-1 text-right">Entitled</th>
                <th className="px-3 py-1 text-right">Taken</th>
                <th className="px-3 py-1 text-right">Balance</th>
              </tr>
            </thead>
            <tbody>
              {userEnts.map(ent => {
                const taken = userRequests.filter(r => r.type === ent.type && r.status === 'Approved')
                  .reduce((sum, r) => {
                    const start = new Date(r.startDate);
                    const end = new Date(r.endDate);
                    const diff = Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
                    return sum + (diff > 0 ? diff : 1);
                  }, 0);
                const balance = getLeaveBalance(entitlements, requests, request.employeeId, ent.type);
                return (
                  <tr key={ent.type}>
                    <td className="px-3 py-1">{ent.type}</td>
                    <td className="px-3 py-1 text-right">{ent.entitled}</td>
                    <td className="px-3 py-1 text-right">{taken}</td>
                    <td className="px-3 py-1 text-right font-semibold">{balance}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Leave History for this employee */}
        <div className="mt-4">
          <h3 className="font-semibold mb-2">Leave History</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full border rounded bg-card divide-y divide-border text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 py-1 text-left">Type</th>
                  <th className="px-3 py-1 text-left">Dates</th>
                  <th className="px-3 py-1 text-right">Days</th>
                  <th className="px-3 py-1 text-left">Status</th>
                  <th className="px-3 py-1 text-left">Reason</th>
                </tr>
              </thead>
              <tbody>
                {userRequests.map(r => {
                  const start = new Date(r.startDate);
                  const end = new Date(r.endDate);
                  const days = Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
                  return (
                    <tr key={r.id}>
                      <td className="px-3 py-1">{r.type}</td>
                      <td className="px-3 py-1">{r.startDate} - {r.endDate}</td>
                      <td className="px-3 py-1 text-right">{days > 0 ? days : 1}</td>
                      <td className="px-3 py-1">{r.status}</td>
                      <td className="px-3 py-1">{r.reason || '-'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        <div className="flex justify-end gap-4 mt-8">
          {request.status === 'Pending' && (
            <>
              <Button onClick={onApprove} disabled={loading} className="bg-green-600 hover:bg-green-700 text-white px-6 py-2">
                {loading ? 'Approving...' : 'Approve'}
              </Button>
              <Button onClick={onReject} disabled={loading} className="bg-red-600 hover:bg-red-700 text-white px-6 py-2">
                {loading ? 'Rejecting...' : 'Reject'}
              </Button>
            </>
          )}
          <DialogClose asChild>
            <Button variant="outline" className="px-6 py-2">Close</Button>
          </DialogClose>
        </div>
      </DialogContent>
    </Dialog>
  );
}

