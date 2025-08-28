import React from 'react';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/atoms/Select';
import { Button } from '@/components/ui/button';

interface AssetFormProps {
  form: any;
  setForm: React.Dispatch<React.SetStateAction<any>>;
  handleSubmit: (e: React.FormEvent) => void;
  sending: boolean;
  employees: { value: string; label: string }[];
}

const categoryOptions = [
  { value: 'IT Equipment', label: 'IT Equipment' },
  { value: 'Furniture', label: 'Furniture' },
  { value: 'Mobile Device', label: 'Mobile Device' },
  { value: 'Vehicle', label: 'Vehicle' },
  { value: 'Office Equipment', label: 'Office Equipment' },
  { value: 'Other', label: 'Other' }
];

const statusOptions = [
  { value: 'Available', label: 'Available' },
  { value: 'Under Repair', label: 'Under Repair' },
  { value: 'Retired', label: 'Retired' }
];

const conditionOptions = [
  { value: 'Excellent', label: 'Excellent' },
  { value: 'Good', label: 'Good' },
  { value: 'Fair', label: 'Fair' },
  { value: 'Poor', label: 'Poor' }
];

const locationOptions = [
  { value: 'Lagos Office', label: 'Lagos Office' },
  { value: 'Abuja Office', label: 'Abuja Office' },
  { value: 'Port Harcourt Office', label: 'Port Harcourt Office' },
  { value: 'Remote', label: 'Remote' }
];

export const AssetForm: React.FC<AssetFormProps> = ({
  form,
  setForm,
  handleSubmit,
  sending,
  employees
}) => (
  <form className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4" onSubmit={handleSubmit}>
    <div className="flex flex-col gap-2">
      <label htmlFor="name" className="text-sm font-medium text-foreground">Asset Name</label>
      <Input 
        id="name" 
        type="text" 
        placeholder="e.g., MacBook Pro 16" 
        value={form.name} 
        onChange={e => setForm(f => ({ ...f, name: e.target.value }))} 
        required 
      />
    </div>
    
    <div className="flex flex-col gap-2">
      <label htmlFor="serialNumber" className="text-sm font-medium text-foreground">Serial Number</label>
      <Input 
        id="serialNumber" 
        type="text" 
        placeholder="e.g., MBP001" 
        value={form.serialNumber} 
        onChange={e => setForm(f => ({ ...f, serialNumber: e.target.value }))} 
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
      <label htmlFor="status" className="text-sm font-medium text-foreground">Status</label>
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
      <label htmlFor="location" className="text-sm font-medium text-foreground">Location</label>
      <Select 
        id="location" 
        value={form.location || ''} 
        onValueChange={val => setForm(f => ({ ...f, location: val }))} 
        placeholder="Select Location" 
        options={locationOptions} 
        className="w-full" 
      />
    </div>
    
    <div className="flex flex-col gap-2">
      <label htmlFor="purchaseDate" className="text-sm font-medium text-foreground">Purchase Date</label>
      <Input 
        id="purchaseDate" 
        type="date" 
        value={form.purchaseDate} 
        onChange={e => setForm(f => ({ ...f, purchaseDate: e.target.value }))} 
        required 
      />
    </div>
    
    <div className="flex flex-col gap-2">
      <label htmlFor="purchasePrice" className="text-sm font-medium text-foreground">Purchase Price ($)</label>
      <Input 
        id="purchasePrice" 
        type="number" 
        placeholder="e.g., 2500" 
        value={form.purchasePrice} 
        onChange={e => setForm(f => ({ ...f, purchasePrice: parseFloat(e.target.value) || 0 }))} 
        required 
      />
    </div>
    
    <div className="flex flex-col gap-2">
      <label htmlFor="condition" className="text-sm font-medium text-foreground">Condition</label>
      <Select 
        id="condition" 
        value={form.condition} 
        onValueChange={val => setForm(f => ({ ...f, condition: val }))} 
        placeholder="Select Condition" 
        options={conditionOptions} 
        className="w-full" 
      />
    </div>
    
    <div className="flex flex-col gap-2">
      <label htmlFor="nextMaintenance" className="text-sm font-medium text-foreground">Next Maintenance (Optional)</label>
      <Input 
        id="nextMaintenance" 
        type="date" 
        value={form.nextMaintenance || ''} 
        onChange={e => setForm(f => ({ ...f, nextMaintenance: e.target.value }))} 
      />
    </div>
    
    <div className="col-span-1 md:col-span-2">
      <Button type="submit" className="w-full bg-violet-600 hover:bg-violet-700 text-white mt-2" disabled={sending}>
        {sending ? 'Adding Asset...' : 'Add Asset'}
      </Button>
    </div>
  </form>
);