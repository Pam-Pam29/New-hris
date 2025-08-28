import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AtomicTanstackTable } from '@/components/TanstackTable/TanstackTable';
import { ColumnDef } from '@tanstack/react-table';

export interface LeaveType {
  id: number;
  name: string;
  description?: string;
  days: number;
  active: boolean;
}

export const mockLeaveTypes: LeaveType[] = [
  { id: 1, name: 'Annual', description: 'Paid annual leave', days: 20, active: true },
  { id: 2, name: 'Sick', description: 'Sick leave for illness', days: 10, active: true },
  { id: 3, name: 'Maternity', description: 'Maternity leave', days: 90, active: true },
  { id: 4, name: 'Unpaid', description: 'Unpaid leave', days: 0, active: false },
];

export const LeaveTypeManagement: React.FC = () => {
  const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>(mockLeaveTypes);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editType, setEditType] = useState<LeaveType | null>(null);
  const [form, setForm] = useState({ name: '', description: '', days: 0, active: true });

  const columns = useMemo<ColumnDef<LeaveType>[]>(() => [
    {
      accessorKey: 'name',
      header: 'Name',
      cell: info => info.getValue(),
    },
    {
      accessorKey: 'description',
      header: 'Description',
      cell: info => info.getValue(),
    },
    {
      accessorKey: 'days',
      header: 'Days',
      cell: info => info.getValue(),
    },
    {
      accessorKey: 'active',
      header: 'Active',
      cell: ({ row }) => (
        <span className={`px-2 py-1 rounded text-xs font-medium ${row.original.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>{row.original.active ? 'Yes' : 'No'}</span>
      ),
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={() => handleEdit(row.original)}>Edit</Button>
          <Button size="sm" variant="destructive" onClick={() => handleDelete(row.original.id)}>Delete</Button>
        </div>
      ),
      enableSorting: false,
      enableColumnFilter: false,
    },
  ], []);

  function handleEdit(type: LeaveType) {
    setEditType(type);
    setForm({ name: type.name, description: type.description || '', days: type.days, active: type.active });
    setDialogOpen(true);
  }
  function handleDelete(id: number) {
    setLeaveTypes(prev => prev.filter(t => t.id !== id));
  }
  function handleDialogClose() {
    setDialogOpen(false);
    setEditType(null);
    setForm({ name: '', description: '', days: 0, active: true });
  }
  function handleFormChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  }
  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (editType) {
      setLeaveTypes(prev => prev.map(t => t.id === editType.id ? { ...t, ...form } : t));
    } else {
      setLeaveTypes(prev => [
        ...prev,
        { id: prev.length ? Math.max(...prev.map(t => t.id)) + 1 : 1, ...form }
      ]);
    }
    handleDialogClose();
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Leave Types</h2>
        <Button className="bg-violet-600 text-white" onClick={() => setDialogOpen(true)}>Add Leave Type</Button>
      </div>
      <AtomicTanstackTable
        data={leaveTypes}
        columns={columns}
        showGlobalFilter
        globalFilterPlaceholder="Search leave types..."
        pageSizeOptions={[5, 10, 20]}
        initialPageSize={5}
        tableClassName="min-w-full divide-y divide-border"
        rowClassName={(row: { index: number }) =>
          `transition-colors ${row.index % 2 === 0 ? 'bg-muted/50' : 'bg-background'} hover:bg-violet-50 dark:hover:bg-violet-900`}
        headerClassName="bg-muted text-foreground font-semibold text-sm uppercase tracking-wide"
      />
      <Dialog open={dialogOpen} onOpenChange={open => { if (!open) handleDialogClose(); else setDialogOpen(true); }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editType ? 'Edit Leave Type' : 'Add Leave Type'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block mb-1 font-medium">Name</label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleFormChange}
                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-violet-400"
                required
              />
            </div>
            <div>
              <label className="block mb-1 font-medium">Description</label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleFormChange}
                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-violet-400"
              />
            </div>
            <div>
              <label className="block mb-1 font-medium">Days</label>
              <input
                type="number"
                name="days"
                value={form.days}
                onChange={handleFormChange}
                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-violet-400"
                min={0}
                required
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                name="active"
                checked={form.active}
                onChange={handleFormChange}
                id="active"
              />
              <label htmlFor="active">Active</label>
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={handleDialogClose}>Cancel</Button>
              <Button type="submit" className="bg-violet-600 text-white">{editType ? 'Update' : 'Add'}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};
