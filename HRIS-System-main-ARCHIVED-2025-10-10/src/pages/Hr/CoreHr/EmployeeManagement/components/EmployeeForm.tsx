import React from "react";
import { Input } from '@/components/ui/input';
import { Select } from '@/components/atoms/Select';
import { Button } from '@/components/ui/button';
import type { Employee } from "../types";

interface EmployeeFormProps {
  mode: 'new' | 'existing';
  form: any;
  setForm: React.Dispatch<React.SetStateAction<any>>;
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>, type: 'offerLetter' | 'contractLetter') => void;
  handleSubmit: (e: React.FormEvent) => void;
  departmentOptionsList: { value: string; label: string }[];
  employmentTypeOptionsList: { value: string; label: string }[];
  locationOptionsList: { value: string; label: string }[];
  sending: boolean;
}

export const EmployeeForm: React.FC<EmployeeFormProps> = ({
  mode,
  form,
  setForm,
  handleFileChange,
  handleSubmit,
  departmentOptionsList,
  employmentTypeOptionsList,
  locationOptionsList,
  sending,
}) => (
  <form className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4" onSubmit={handleSubmit}>
    <div className="flex flex-col gap-2">
      <label htmlFor="email" className="text-sm font-medium text-foreground">Email</label>
      <Input id="email" type="email" placeholder="Email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required />
    </div>
    <div className="flex flex-col gap-2">
      <label htmlFor="name" className="text-sm font-medium text-foreground">Full Name</label>
      <Input id="name" type="text" placeholder="Full Name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
    </div>
    <div className="flex flex-col gap-2">
      <label htmlFor="role" className="text-sm font-medium text-foreground">Role</label>
      <Input id="role" type="text" placeholder="Role" value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))} required />
    </div>
    <div className="flex flex-col gap-2">
      <label htmlFor="department" className="text-sm font-medium text-foreground">Department</label>
      <Select id="department" value={form.department} onValueChange={val => setForm(f => ({ ...f, department: val }))} placeholder="Select Department" options={departmentOptionsList} className="w-full" />
    </div>
    <div className="flex flex-col gap-2">
      <label htmlFor="employmentType" className="text-sm font-medium text-foreground">{mode === 'new' ? 'Employee Type' : 'Employment Type'}</label>
      <Select id="employmentType" value={form.employmentType} onValueChange={val => setForm(f => ({ ...f, employmentType: val }))} placeholder={mode === 'new' ? "Select Employee Type" : "Select Employment Type"} options={employmentTypeOptionsList} className="w-full" />
    </div>
    <div className="flex flex-col gap-2">
      <label htmlFor="location" className="text-sm font-medium text-foreground">Location</label>
      <Select
        id="location"
        value={form.location || ''}
        onValueChange={val => setForm(f => ({ ...f, location: val }))}
        placeholder="Select Location"
        options={locationOptionsList}
        className="w-full"
      />
    </div>
    {mode === 'existing' && (
      <div className="flex flex-col gap-2">
        <label htmlFor="dateStarted" className="text-sm font-medium text-foreground">Date Started</label>
        <Input id="dateStarted" type="date" placeholder="YYYY-MM-DD" value={form.dateStarted} onChange={e => setForm(f => ({ ...f, dateStarted: e.target.value }))} required />
      </div>
    )}
    <div className="flex flex-col gap-2">
      {form.employmentType === 'Contract' ? (
        <>
          <label htmlFor="contractLetter" className="text-sm font-medium text-foreground">Contract Letter</label>
          <Input id="contractLetter" type="file" accept=".pdf,.doc,.docx" onChange={e => handleFileChange(e, 'contractLetter')} required />
        </>
      ) : (
        <>
          <label htmlFor="offerLetter" className="text-sm font-medium text-foreground">Offer Letter</label>
          <Input id="offerLetter" type="file" accept=".pdf,.doc,.docx" onChange={e => handleFileChange(e, 'offerLetter')} required />
        </>
      )}
    </div>
    <div className="col-span-1 md:col-span-2">
      <Button type="submit" className="w-full bg-violet-600 hover:bg-violet-700 text-white mt-2" disabled={sending}>
        {sending ? 'Sending...' : 'Send Invite'}
      </Button>
    </div>
  </form>
); 