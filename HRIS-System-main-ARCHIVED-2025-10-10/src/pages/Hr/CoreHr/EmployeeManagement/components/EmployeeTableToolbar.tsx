import React from "react";
import { Input } from '@/components/ui/input';
import { Select } from '@/components/atoms/Select';
import { Button } from '@/components/ui/button';

interface EmployeeTableToolbarProps {
  search: string;
  setSearch: (val: string) => void;
  departmentFilter: string;
  setDepartmentFilter: (val: string) => void;
  employmentTypeFilter: string;
  setEmploymentTypeFilter: (val: string) => void;
  statusFilter: string;
  setStatusFilter: (val: string) => void;
  locationFilter: string;
  setLocationFilter: (val: string) => void;
  departmentOptionsList: { value: string; label: string }[];
  employmentTypeOptionsList: { value: string; label: string }[];
  statusOptionsList: { value: string; label: string }[];
  locationOptionsList: { value: string; label: string }[];
  onExport: () => void;
}

export const EmployeeTableToolbar: React.FC<EmployeeTableToolbarProps> = ({
  search,
  setSearch,
  departmentFilter,
  setDepartmentFilter,
  employmentTypeFilter,
  setEmploymentTypeFilter,
  statusFilter,
  setStatusFilter,
  locationFilter,
  setLocationFilter,
  departmentOptionsList,
  employmentTypeOptionsList,
  statusOptionsList,
  locationOptionsList,
  onExport,
}) => (
  <div className="flex flex-col md:flex-row md:items-center gap-4 mb-6">
    <Input
      placeholder="Search employees..."
      value={search}
      onChange={e => setSearch(e.target.value)}
      className="w-full md:w-64 bg-background"
    />
    <Select
      value={departmentFilter}
      onValueChange={setDepartmentFilter}
      placeholder="Department"
      options={departmentOptionsList}
      className="w-full md:w-40"
    />
    <Select
      value={employmentTypeFilter}
      onValueChange={setEmploymentTypeFilter}
      placeholder="Employee Type"
      options={employmentTypeOptionsList}
      className="w-full md:w-40"
    />
    <Select
      value={statusFilter}
      onValueChange={setStatusFilter}
      placeholder="Status"
      options={statusOptionsList}
      className="w-full md:w-32"
    />
    <Select
      value={locationFilter}
      onValueChange={setLocationFilter}
      placeholder="Location"
      options={locationOptionsList}
      className="w-full md:w-40"
    />
    <Button variant="outline" className="ml-auto" onClick={onExport}>
      Export
    </Button>
  </div>
); 