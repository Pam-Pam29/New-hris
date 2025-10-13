import React from 'react';
import { Button } from '@/components/ui/button';
import type { LeaveType } from './LeaveTypeManagement';

export interface LeaveRequestFormProps {
  leaveTypes: LeaveType[];
  onSubmit: (data: any) => void;
  initialValues?: {
    employeeName: string;
    type: string;
    startDate: string;
    endDate: string;
    reason: string;
  };
  submitting?: boolean;
}

export const LeaveRequestForm: React.FC<LeaveRequestFormProps> = ({ leaveTypes, onSubmit, initialValues, submitting }) => {
  const [form, setForm] = React.useState({
    employeeName: initialValues?.employeeName || '',
    type: initialValues?.type || '',
    startDate: initialValues?.startDate || '',
    endDate: initialValues?.endDate || '',
    reason: initialValues?.reason || '',
  });

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSubmit(form);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block mb-1 font-medium">Employee Name</label>
        <input
          type="text"
          name="employeeName"
          value={form.employeeName}
          onChange={handleChange}
          className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-violet-400"
          required
        />
      </div>
      <div>
        <label className="block mb-1 font-medium">Leave Type</label>
        <select
          name="type"
          value={form.type}
          onChange={handleChange}
          className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-violet-400"
          required
        >
          <option value="">Select leave type</option>
          {leaveTypes.filter(t => t.active).map(type => (
            <option key={type.id} value={type.name}>{type.name}</option>
          ))}
        </select>
      </div>
      <div className="flex gap-4">
        <div className="flex-1">
          <label className="block mb-1 font-medium">Start Date</label>
          <input
            type="date"
            name="startDate"
            value={form.startDate}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-violet-400"
            required
          />
        </div>
        <div className="flex-1">
          <label className="block mb-1 font-medium">End Date</label>
          <input
            type="date"
            name="endDate"
            value={form.endDate}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-violet-400"
            required
          />
        </div>
      </div>
      {/* Calculated Days Field */}
      <div>
        <label className="block mb-1 font-medium">Days</label>
        <input
          type="number"
          value={(() => {
            if (!form.startDate || !form.endDate) return '';
            const start = new Date(form.startDate);
            const end = new Date(form.endDate);
            const diff = Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
            return diff > 0 ? diff : 1;
          })()}
          readOnly
          className="w-full px-3 py-2 border rounded bg-gray-100 text-gray-700"
        />
      </div>
      <div>
        <label className="block mb-1 font-medium">Reason</label>
        <textarea
          name="reason"
          value={form.reason}
          onChange={handleChange}
          className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-violet-400"
          required
        />
      </div>
      <div className="flex justify-end gap-2">
        <Button type="submit" className="bg-violet-600 text-white" disabled={submitting}>{submitting ? 'Submitting...' : 'Submit Request'}</Button>
      </div>
    </form>
  );
};
