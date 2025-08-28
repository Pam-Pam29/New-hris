import React from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import type { Employee } from "../types";

interface EmployeeProfileDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedEmployee: Employee | null;
  setSelectedEmployee: (emp: Employee) => void;
  employeeList: Employee[];
  employeeSearch: string;
  setEmployeeSearch: (val: string) => void;
  documentsOpen: boolean;
  setDocumentsOpen: (open: boolean) => void;
}

export const EmployeeProfileDrawer: React.FC<EmployeeProfileDrawerProps> = ({
  open,
  onOpenChange,
  selectedEmployee,
  setSelectedEmployee,
  employeeList,
  employeeSearch,
  setEmployeeSearch,
  documentsOpen,
  setDocumentsOpen,
}) => (
  <Sheet open={open} onOpenChange={onOpenChange}>
    <SheetContent side="right" className="w-full !w-1/2 !max-w-none p-0">
      <div className="flex h-full">
        {/* Left panel: Employee list */}
        <div className="hidden md:flex flex-col w-72 border-r bg-muted/40 h-full">
          <div className="flex-1 overflow-y-auto">
            {employeeList.map(emp => (
              <button
                key={emp.id}
                className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-violet-100 dark:hover:bg-violet-900 transition-colors ${selectedEmployee?.id === emp.id ? 'bg-violet-50 dark:bg-violet-900 font-semibold' : ''}`}
                onClick={() => setSelectedEmployee(emp)}
              >
                <Avatar className="w-8 h-8">
                  {emp.avatar ? (
                    <img src={emp.avatar} alt={emp.name} className="w-full h-full object-cover rounded-full" />
                  ) : (
                    <span className="text-xs font-semibold bg-muted rounded-full w-full h-full flex items-center justify-center">
                      {emp.name.split(' ').map(n => n[0]).join('')}
                    </span>
                  )}
                </Avatar>
                <span className="truncate">{emp.name}</span>
              </button>
            ))}
          </div>
        </div>
        {/* Right panel: Profile */}
        <div className="flex-1 min-w-0 p-8 overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Employee Profile</SheetTitle>
          </SheetHeader>
          {selectedEmployee && (
            <div className="flex flex-col gap-6 mt-4">
              <div className="flex items-center gap-4">
                <Avatar className="w-16 h-16">
                  {selectedEmployee.avatar ? (
                    <img src={selectedEmployee.avatar} alt={selectedEmployee.name} className="w-full h-full object-cover rounded-full" />
                  ) : (
                    <span className="text-lg font-semibold bg-muted rounded-full w-full h-full flex items-center justify-center">
                      {selectedEmployee.name.split(' ').map(n => n[0]).join('')}
                    </span>
                  )}
                </Avatar>
                <div>
                  <div className="text-xl font-bold">{selectedEmployee.name}</div>
                  <div className="text-sm text-muted-foreground">{selectedEmployee.role}</div>
                </div>
              </div>
              <div className="grid grid-cols-1 gap-2 text-sm">
                <div><span className="font-medium">Email:</span> {selectedEmployee.email || <span className="italic text-muted-foreground">N/A</span>}</div>
                <div><span className="font-medium">Department:</span> {selectedEmployee.department}</div>
                <div><span className="font-medium">Employee Type:</span> {selectedEmployee.employmentType}</div>
                <div><span className="font-medium">Status:</span> {selectedEmployee.status}</div>
                {selectedEmployee.dateStarted && <div><span className="font-medium">Date Started:</span> {selectedEmployee.dateStarted}</div>}
                {selectedEmployee.phone && <div><span className="font-medium">Phone:</span> {selectedEmployee.phone}</div>}
                {selectedEmployee.address && <div><span className="font-medium">Address:</span> {selectedEmployee.address}</div>}
                {selectedEmployee.location && <div><span className="font-medium">Location:</span> {selectedEmployee.location}</div>}
                {selectedEmployee.gender && <div><span className="font-medium">Gender:</span> {selectedEmployee.gender}</div>}
                {selectedEmployee.dob && <div><span className="font-medium">Date of Birth:</span> {selectedEmployee.dob}</div>}
                {selectedEmployee.nationalId && <div><span className="font-medium">National ID:</span> {selectedEmployee.nationalId}</div>}
                {selectedEmployee.manager && <div><span className="font-medium">Manager:</span> {selectedEmployee.manager}</div>}
              </div>
              {selectedEmployee.documents && selectedEmployee.documents.length > 0 && (
                <div className="bg-card border rounded-lg p-4 mt-2">
                  <button
                    className="flex items-center gap-2 font-medium text-base w-full text-left hover:bg-muted/50 rounded p-2 transition"
                    onClick={() => setDocumentsOpen(!documentsOpen)}
                  >
                    <svg className="w-6 h-6 text-yellow-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 7a2 2 0 0 1 2-2h2.172a2 2 0 0 0 1.414-.586l.828-.828A2 2 0 0 1 10.828 3h2.344a2 2 0 0 1 1.414.586l.828.828A2 2 0 0 0 16.828 5H19a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7z" /></svg>
                    <span>Employee Documents</span>
                    <svg className={`w-4 h-4 ml-auto transition-transform ${documentsOpen ? 'rotate-90' : ''}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
                  </button>
                  {documentsOpen && (
                    <ul className="space-y-2 mt-2 ml-6 border-l border-muted-foreground/20 pl-4">
                      {selectedEmployee.documents.map(doc => (
                        <li key={doc.name} className="flex items-center gap-3 p-2 rounded hover:bg-muted transition">
                          <svg className="w-5 h-5 text-muted-foreground" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M7 7V3a1 1 0 0 1 1-1h8a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1H8a1 1 0 0 1-1-1v-4M7 7h10M7 7v10m0 0H5a1 1 0 0 1-1-1V8a1 1 0 0 1 1-1h2m0 10v2a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1v-2" /></svg>
                          <a href={doc.url} className="text-violet-700 underline font-medium" target="_blank" rel="noopener noreferrer">{doc.name}</a>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
              {selectedEmployee.emergencyContact && (
                <div>
                  <div className="font-medium mb-1">Emergency Contact:</div>
                  <div className="text-sm">{selectedEmployee.emergencyContact.name} ({selectedEmployee.emergencyContact.relationship})<br />{selectedEmployee.emergencyContact.phone}</div>
                </div>
              )}
              {selectedEmployee.notes && (
                <div>
                  <div className="font-medium mb-1">Notes:</div>
                  <div className="text-sm">{selectedEmployee.notes}</div>
                </div>
              )}
              <div className="flex gap-2 mt-4">
                <Button variant="outline" className="border-destructive text-destructive">Deactivate</Button>
                <Button variant="outline">Edit</Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </SheetContent>
  </Sheet>
); 