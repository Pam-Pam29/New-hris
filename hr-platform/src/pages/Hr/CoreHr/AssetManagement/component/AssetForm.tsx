import React, { FormEvent } from 'react';
import { Input } from '../../../../../components/ui/input';
import { Select } from '../../../../../components/atoms/Select';
import { Button } from '../../../../../components/ui/button';

interface AssetFormProps {
  form: {
    name: string;
    serialNumber: string;
    type: string;
    category: string;
    status: string;
    assignedTo: string;
    purchaseDate: string;
    purchasePrice: number;
    location: string;
    condition: string;
    nextMaintenance: string;
  };
  setForm: React.Dispatch<React.SetStateAction<{
    name: string;
    serialNumber: string;
    type: string;
    category: string;
    status: string;
    assignedTo: string;
    purchaseDate: string;
    purchasePrice: number;
    location: string;
    condition: string;
    nextMaintenance: string;
  }>>;
  handleSubmit: (e: FormEvent) => void;
  sending: boolean;
  employees: { value: string; label: string }[];
}

const assetTypeOptions = [
  { value: 'Laptop', label: 'Laptop' },
  { value: 'Desktop', label: 'Desktop' },
  { value: 'Monitor', label: 'Monitor' },
  { value: 'Phone', label: 'Phone' },
  { value: 'Tablet', label: 'Tablet' },
  { value: 'Keyboard', label: 'Keyboard' },
  { value: 'Mouse', label: 'Mouse' },
  { value: 'Headset', label: 'Headset' },
  { value: 'Desk', label: 'Desk' },
  { value: 'Chair', label: 'Chair' },
  { value: 'Printer', label: 'Printer' },
  { value: 'Scanner', label: 'Scanner' },
  { value: 'Projector', label: 'Projector' },
  { value: 'Server', label: 'Server' },
  { value: 'Router', label: 'Router' },
  { value: 'Other', label: 'Other' }
];

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
  { value: 'Assigned', label: 'Assigned' },
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
}) => {
  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    console.log('AssetForm onSubmit called with form:', form); // Debug log
    handleSubmit(e);
  };

  return (
    <form className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4" onSubmit={onSubmit}>
      <div className="flex flex-col gap-2">
        <label htmlFor="name" className="text-sm font-medium text-foreground">Asset Name *</label>
        <Input
          id="name"
          type="text"
          placeholder="e.g., MacBook Pro 16"
          value={form.name}
          onChange={e => {
            console.log('Name changed:', e.target.value);
            setForm(f => ({ ...f, name: e.target.value }));
          }}
          required
        />
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="serialNumber" className="text-sm font-medium text-foreground">Serial Number *</label>
        <Input
          id="serialNumber"
          type="text"
          placeholder="e.g., MBP001"
          value={form.serialNumber}
          onChange={e => {
            console.log('Serial number changed:', e.target.value);
            setForm(f => ({ ...f, serialNumber: e.target.value }));
          }}
          required
        />
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="type" className="text-sm font-medium text-foreground">Asset Type *</label>
        <Select
          id="type"
          value={form.type}
          onValueChange={val => {
            console.log('Type changed:', val);
            setForm(f => ({ ...f, type: val }));
          }}
          placeholder="Select Asset Type"
          options={assetTypeOptions}
          className="w-full"
        />
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="category" className="text-sm font-medium text-foreground">Category *</label>
        <Select
          id="category"
          value={form.category}
          onValueChange={val => {
            console.log('Category changed:', val);
            setForm(f => ({ ...f, category: val }));
          }}
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
          onValueChange={val => {
            console.log('Status changed:', val);
            setForm(f => ({ ...f, status: val }));
          }}
          placeholder="Select Status"
          options={statusOptions}
          className="w-full"
        />
      </div>

      {form.status === 'Assigned' && (
        <div className="flex flex-col gap-2 col-span-1 md:col-span-2">
          <label htmlFor="assignedTo" className="text-sm font-medium text-foreground">Assigned To</label>
          <Select
            id="assignedTo"
            value={form.assignedTo}
            onValueChange={val => {
              console.log('Assigned to changed:', val);
              setForm(f => ({ ...f, assignedTo: val }));
            }}
            placeholder="Select Employee"
            options={employees}
            className="w-full"
          />
        </div>
      )}

      <div className="flex flex-col gap-2">
        <label htmlFor="location" className="text-sm font-medium text-foreground">Location *</label>
        <Select
          id="location"
          value={form.location || ''}
          onValueChange={val => {
            console.log('Location changed:', val);
            setForm(f => ({ ...f, location: val }));
          }}
          placeholder="Select Location"
          options={locationOptions}
          className="w-full"
        />
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="purchaseDate" className="text-sm font-medium text-foreground">Purchase Date *</label>
        <Input
          id="purchaseDate"
          type="date"
          value={form.purchaseDate}
          onChange={e => {
            console.log('Purchase date changed:', e.target.value);
            setForm(f => ({ ...f, purchaseDate: e.target.value }));
          }}
          required
        />
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="purchasePrice" className="text-sm font-medium text-foreground">Purchase Price (₦) *</label>
        <Input
          id="purchasePrice"
          type="number"
          placeholder="e.g., 2500"
          value={form.purchasePrice}
          onChange={e => {
            console.log('Purchase price changed:', e.target.value);
            setForm(f => ({ ...f, purchasePrice: parseFloat(e.target.value) || 0 }));
          }}
          required
        />
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="condition" className="text-sm font-medium text-foreground">Condition</label>
        <Select
          id="condition"
          value={form.condition}
          onValueChange={val => {
            console.log('Condition changed:', val);
            setForm(f => ({ ...f, condition: val }));
          }}
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
          onChange={e => {
            console.log('Next maintenance changed:', e.target.value);
            setForm(f => ({ ...f, nextMaintenance: e.target.value }));
          }}
        />
      </div>

      <div className="col-span-1 md:col-span-2">
        <Button
          type="submit"
          className="w-full bg-violet-600 hover:bg-violet-700 text-white mt-2"
          disabled={sending}
        >
          {sending ? 'Adding Asset...' : 'Add Asset'}
        </Button>
      </div>
    </form>
  );
};