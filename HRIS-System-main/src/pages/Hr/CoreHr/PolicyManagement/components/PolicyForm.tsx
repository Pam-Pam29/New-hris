import React from 'react';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/atoms/Select';
import { Button } from '@/components/ui/button';
import { RichTextEditor } from '@/components/ui/rich-text-editor';

interface PolicyFormProps {
  form: any;
  setForm: React.Dispatch<React.SetStateAction<any>>;
  handleSubmit: (e: React.FormEvent) => void;
  sending: boolean;
  submitLabel?: string;
}

const categoryOptions = [
  { value: 'HR', label: 'HR' },
  { value: 'IT', label: 'IT' },
  { value: 'Finance', label: 'Finance' },
  { value: 'Legal', label: 'Legal' },
  { value: 'Ethics', label: 'Ethics' },
  { value: 'Safety', label: 'Safety' },
  { value: 'Operations', label: 'Operations' },
  { value: 'Other', label: 'Other' }
];

const statusOptions = [
  { value: 'Draft', label: 'Draft' },
  { value: 'Under Review', label: 'Under Review' }
];

export const PolicyForm: React.FC<PolicyFormProps> = ({
  form,
  setForm,
  handleSubmit,
  sending,
  submitLabel
}) => (
  <form className="mx-auto max-w-4xl p-8 bg-background rounded-lg shadow-md grid grid-cols-1 md:grid-cols-2 gap-6 mt-8" onSubmit={handleSubmit}>
    <div className="flex flex-col gap-2 md:col-span-2">
      <label htmlFor="title" className="text-sm font-medium text-foreground">Policy Title</label>
      <Input 
        id="title" 
        type="text" 
        placeholder="e.g., Remote Work Policy" 
        value={form.title} 
        onChange={e => setForm(f => ({ ...f, title: e.target.value }))} 
        required 
      />
    </div>
    
    <div className="flex flex-col gap-2">
      <label htmlFor="category" className="text-sm font-medium text-foreground">Category</label>
      <Select 
        id="category" 
        value={form.category} 
        onValueChange={val => setForm(f => ({ ...f, category: val }))} 
        placeholder="Select Category" 
        options={categoryOptions} 
        className="w-full" 
      />
    </div>
    
    <div className="flex flex-col gap-2">
      <label htmlFor="version" className="text-sm font-medium text-foreground">Version</label>
      <Input 
        id="version" 
        type="text" 
        placeholder="e.g., 1.0" 
        value={form.version} 
        onChange={e => setForm(f => ({ ...f, version: e.target.value }))} 
        required 
      />
    </div>
    
    <div className="flex flex-col gap-2">
      <label htmlFor="status" className="text-sm font-medium text-foreground">Initial Status</label>
      <Select 
        id="status" 
        value={form.status} 
        onValueChange={val => setForm(f => ({ ...f, status: val }))} 
        placeholder="Select Status" 
        options={statusOptions} 
        className="w-full" 
      />
    </div>
    
    <div className="flex flex-col gap-2">
      <label htmlFor="effectiveDate" className="text-sm font-medium text-foreground">Effective Date</label>
      <Input 
        id="effectiveDate" 
        type="date" 
        value={form.effectiveDate} 
        onChange={e => setForm(f => ({ ...f, effectiveDate: e.target.value }))} 
      />
    </div>
    
    <div className="flex flex-col gap-2 md:col-span-2">
      <label htmlFor="description" className="text-sm font-medium text-foreground">Description</label>
      <RichTextEditor
        value={form.description}
        onChange={(val: string) => setForm(f => ({ ...f, description: val }))}
        placeholder="Brief description of the policy..."
        minHeight="320px"
        className="w-full border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-violet-400"
      />
    </div>
    
    <div className="flex flex-col gap-2 md:col-span-2">
      <label htmlFor="tags" className="text-sm font-medium text-foreground">Tags (comma-separated)</label>
      <Input 
        id="tags" 
        type="text" 
        placeholder="e.g., remote, work-from-home, equipment" 
        value={form.tags} 
        onChange={e => setForm(f => ({ ...f, tags: e.target.value }))} 
      />
    </div>
    
    <div className="flex items-center gap-2 md:col-span-2">
      <input 
        type="checkbox" 
        id="acknowledgmentRequired" 
        checked={form.acknowledgmentRequired} 
        onChange={e => setForm(f => ({ ...f, acknowledgmentRequired: e.target.checked }))} 
        className="rounded border-input"
      />
      <label htmlFor="acknowledgmentRequired" className="text-sm font-medium text-foreground">
        Require employee acknowledgment
      </label>
    </div>
    
    <div className="col-span-1 md:col-span-2">
      <Button type="submit" className="w-full bg-violet-600 hover:bg-violet-700 text-white mt-2" disabled={sending}>
        {sending
          ? (submitLabel ? submitLabel.replace('Update', 'Updating').replace('Create', 'Creating') + '...' : 'Creating Policy...')
          : (submitLabel || 'Create Policy')}
      </Button>
    </div>
  </form>
);