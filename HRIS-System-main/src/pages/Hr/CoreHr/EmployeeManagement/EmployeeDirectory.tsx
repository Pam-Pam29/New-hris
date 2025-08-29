import React, { useState, useEffect } from 'react';

interface Employee {
  id: number;
  avatar?: string;
  name: string;
  email?: string;
  role: string;
  department: string;
  employmentType: string;
  status: string;
  dateStarted?: string;
  phone?: string;
  address?: string;
  location?: string;
  gender?: string;
  dob?: string;
  nationalId?: string;
  manager?: string;
  documents?: { name: string; url: string }[];
  emergencyContact?: {
    name: string;
    phone: string;
    relationship: string;
  };
  notes?: string;
}

// Import the async employee service function
import { getEmployeeService, IEmployeeService } from '../../../../services/employeeService';

export default function EmployeeDirectory() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [employeeService, setEmployeeService] = useState<IEmployeeService | null>(null);

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: '',
    department: ''
  });

  // Initialize employee service and load employees
  useEffect(() => {
    initializeService();
  }, []);

  const initializeService = async () => {
    try {
      setLoading(true);
      const service = await getEmployeeService();
      setEmployeeService(service);
      const data = await service.getEmployees();
      setEmployees(data);
    } catch (error) {
      console.error('Error initializing service or loading employees:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddEmployee = async () => {
    try {
      if (formData.name && formData.role && formData.department && employeeService) {
        const newEmployee = await employeeService.createEmployee({
          ...formData,
          employmentType: 'Full-time',
          status: 'Active'
        });
        setEmployees((prev: Employee[]) => [...prev, newEmployee]);
        setShowAddDialog(false);
        setFormData({ name: '', email: '', role: '', department: '' });
      }
    } catch (error) {
      console.error('Error adding employee:', error);
    }
  };

  const handleUpdateEmployee = async () => {
    try {
      if (selectedEmployee && formData.name && formData.role && formData.department && employeeService) {
        const updatedEmployee = await employeeService.updateEmployee(selectedEmployee.id.toString(), formData);
        setEmployees((prev: Employee[]) => prev.map((emp: Employee) => emp.id === selectedEmployee.id ? updatedEmployee : emp));
        setShowEditDialog(false);
        setSelectedEmployee(null);
        setFormData({ name: '', email: '', role: '', department: '' });
      }
    } catch (error) {
      console.error('Error updating employee:', error);
    }
  };

  const handleDeleteEmployee = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this employee?') && employeeService) {
      try {
        const success = await employeeService.deleteEmployee(id);
        if (success) {
          setEmployees((prev: Employee[]) => prev.filter((emp: Employee) => emp.id.toString() !== id));
        }
      } catch (error) {
        console.error('Error deleting employee:', error);
      }
    }
  };

  const openEditDialog = (employee: Employee) => {
    setSelectedEmployee(employee);
    setFormData({
      name: employee.name,
      email: employee.email || '',
      role: employee.role,
      department: employee.department
    });
    setShowEditDialog(true);
  };

  if (loading) {
    return (
      <div className="p-8 min-h-screen bg-gradient-to-br from-background to-muted/70 dark:from-background dark:to-accent/10 transition-colors duration-300">
        <div className="text-center text-foreground dark:text-foreground/90">Loading employees...</div>
      </div>
    );
  }

  return (
    <div className="p-8 min-h-screen bg-gradient-to-br from-background to-muted/70 dark:from-background dark:to-accent/10 transition-colors duration-300">
      {/* Header Section */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg transition-colors duration-300">
            <span className="text-2xl">👥</span>
          </div>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-500 to-cyan-500 dark:from-blue-400 dark:to-cyan-400 bg-clip-text text-transparent m-0 transition-colors duration-300">
              Employee Management
            </h1>
            <p className="text-muted-foreground dark:text-muted-foreground/90 text-sm m-0 transition-colors duration-300">Manage your workforce efficiently</p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-card dark:bg-card/90 p-6 rounded-lg shadow-sm dark:shadow-accent/5 border border-border dark:border-accent/20 transition-all duration-300">
          <div className="text-2xl font-bold text-foreground dark:text-foreground/90">{employees.length}</div>
          <div className="text-sm text-muted-foreground dark:text-muted-foreground/80">Total Employees</div>
        </div>
        <div className="bg-card dark:bg-card/90 p-6 rounded-lg shadow-sm dark:shadow-accent/5 border border-border dark:border-accent/20 transition-all duration-300">
          <div className="text-2xl font-bold text-foreground dark:text-foreground/90">{employees.filter(e => e.status === 'Active').length}</div>
          <div className="text-sm text-muted-foreground dark:text-muted-foreground/80">Active Employees</div>
        </div>
        <div className="bg-card dark:bg-card/90 p-6 rounded-lg shadow-sm dark:shadow-accent/5 border border-border dark:border-accent/20 transition-all duration-300">
          <div className="text-2xl font-bold text-foreground dark:text-foreground/90">{employees.filter(e => e.status === 'On Leave').length}</div>
          <div className="text-sm text-muted-foreground dark:text-muted-foreground/80">On Leave</div>
        </div>
        <div className="bg-card dark:bg-card/90 p-6 rounded-lg shadow-sm dark:shadow-accent/5 border border-border dark:border-accent/20 transition-all duration-300">
          <div className="text-2xl font-bold text-foreground dark:text-foreground/90">{new Set(employees.map(e => e.department)).size}</div>
          <div className="text-sm text-muted-foreground dark:text-muted-foreground/80">Departments</div>
        </div>
      </div>

      {/* Actions Bar */}
      <div className="flex justify-between items-center mb-8">
        <div className="text-sm text-muted-foreground dark:text-muted-foreground/80">
          Showing {employees.length} employees
        </div>
        <button
          onClick={() => setShowAddDialog(true)}
          className="bg-primary hover:bg-primary/90 dark:bg-primary/90 dark:hover:bg-primary/80 text-primary-foreground dark:text-primary-foreground/90 border-none py-2 px-4 rounded-md cursor-pointer flex items-center gap-2 text-sm transition-colors duration-300"
        >
          ➕ Add Employee
        </button>
      </div>

      {/* Employee Table */}
      <div className="bg-card dark:bg-card/90 rounded-lg shadow-sm dark:shadow-accent/5 border border-border dark:border-accent/20 overflow-hidden transition-all duration-300">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead className="bg-muted dark:bg-muted/50 transition-colors duration-300">
              <tr>
                <th className="p-4 text-left text-xs font-medium text-muted-foreground dark:text-muted-foreground/80 uppercase tracking-wider">
                  Employee
                </th>
                <th className="p-4 text-left text-xs font-medium text-muted-foreground dark:text-muted-foreground/80 uppercase tracking-wider">
                  Role
                </th>
                <th className="p-4 text-left text-xs font-medium text-muted-foreground dark:text-muted-foreground/80 uppercase tracking-wider">
                  Department
                </th>
                <th className="p-4 text-left text-xs font-medium text-muted-foreground dark:text-muted-foreground/80 uppercase tracking-wider">
                  Status
                </th>
                <th className="p-4 text-left text-xs font-medium text-muted-foreground dark:text-muted-foreground/80 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border dark:divide-accent/20">
              {employees.map((employee, index) => (
                <tr key={`emp-${employee.id}-${index}`} className="hover:bg-muted/50 dark:hover:bg-muted/20 transition-colors duration-200">
                  <td className="p-4">
                    <div className="flex items-center">
                      <img
                        src={employee.avatar || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMjAiIGZpbGw9IiNFNUU3RUIiLz4KPHBhdGggZD0iTTIwIDEwQzIyLjIwOTEgMTAgMjQgMTEuNzkwOSAyNCAxNEMyNCAxNi4yMDkxIDIyLjIwOTEgMTggMjAgMThDMTcuNzkwOSAxOCAxNiAxNi4yMDkxIDE2IDE0QzE2IDExLjc5MDkgMTcuNzkwOSAxMCAyMCAxMFoiIGZpbGw9IiM5Q0EzQUYiLz4KPHBhdGggZD0iTTI4IDMwQzI4IDI2LjY4NjMgMjQuNDE4MyAyNCAyMCAyNEMxNS41ODE3IDI0IDEyIDI2LjY4NjMgMTIgMzBIMjhaIiBmaWxsPSIjOUNBM0FGIi8+Cjwvc3ZnPgo='}
                        alt={employee.name}
                        className="w-10 h-10 rounded-full mr-3 border border-border dark:border-accent/30"
                        onError={(e) => {
                          e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMjAiIGZpbGw9IiNFNUU3RUIiLz4KPHBhdGggZD0iTTIwIDEwQzIyLjIwOTEgMTAgMjQgMTEuNzkwOSAyNCAxNEMyNCAxNi4yMDkxIDIyLjIwOTEgMTggMjAgMThDMTcuNzkwOSAxOCAxNiAxNi4yMDkxIDE2IDE0QzE2IDExLjc5MDkgMTcuNzkwOSAxMCAyMCAxMFoiIGZpbGw9IiM5Q0EzQUYiLz4KPHBhdGggZD0iTTI4IDMwQzI4IDI2LjY4NjMgMjQuNDE4MyAyNCAyMCAyNEMxNS41ODE3IDI0IDEyIDI2LjY4NjMgMTIgMzBIMjhaIiBmaWxsPSIjOUNBM0FGIi8+Cjwvc3ZnPgo=';
                        }}
                      />
                      <div>
                        <div className="text-sm font-medium text-foreground dark:text-foreground/90">{employee.name}</div>
                        <div className="text-sm text-muted-foreground dark:text-muted-foreground/80">{employee.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-sm text-foreground dark:text-foreground/90">
                    {employee.role}
                  </td>
                  <td className="p-4 text-sm text-foreground dark:text-foreground/90">
                    {employee.department}
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${employee.status === 'Active' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400'} transition-colors duration-300`}>
                      {employee.status}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => openEditDialog(employee)}
                        className="bg-transparent hover:bg-muted dark:hover:bg-muted/30 border border-border dark:border-accent/30 px-2 py-1 rounded-md cursor-pointer text-xs flex items-center gap-1 transition-colors duration-300"
                      >
                        ✏️ Edit
                      </button>
                      <button
                        onClick={() => handleDeleteEmployee(employee.id.toString())}
                        className="bg-transparent hover:bg-destructive/10 dark:hover:bg-destructive/20 border border-border dark:border-accent/30 px-2 py-1 rounded-md cursor-pointer text-xs flex items-center gap-1 transition-colors duration-300"
                      >
                        🗑️ Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Employee Dialog */}
      {showAddDialog && (
        <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50">
          <div className="bg-card dark:bg-card/95 p-6 rounded-lg w-full max-w-md m-4 shadow-lg dark:shadow-accent/10 border border-border dark:border-accent/20 transition-all duration-300">
            <h2 className="m-0 mb-4 text-xl font-semibold text-foreground dark:text-foreground/90">Add New Employee</h2>
            <div className="flex flex-col gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground dark:text-foreground/90 mb-1">Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full p-2 border border-border dark:border-accent/30 rounded-md text-sm bg-background dark:bg-muted/50 text-foreground dark:text-foreground/90 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-colors duration-300"
                  placeholder="Enter employee name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground dark:text-foreground/90 mb-1">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full p-2 border border-border dark:border-accent/30 rounded-md text-sm bg-background dark:bg-muted/50 text-foreground dark:text-foreground/90 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-colors duration-300"
                  placeholder="Enter email"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground dark:text-foreground/90 mb-1">Role</label>
                <input
                  type="text"
                  value={formData.role}
                  onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value }))}
                  className="w-full p-2 border border-border dark:border-accent/30 rounded-md text-sm bg-background dark:bg-muted/50 text-foreground dark:text-foreground/90 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-colors duration-300"
                  placeholder="Enter role"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground dark:text-foreground/90 mb-1">Department</label>
                <input
                  type="text"
                  value={formData.department}
                  onChange={(e) => setFormData(prev => ({ ...prev, department: e.target.value }))}
                  className="w-full p-2 border border-border dark:border-accent/30 rounded-md text-sm bg-background dark:bg-muted/50 text-foreground dark:text-foreground/90 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-colors duration-300"
                  placeholder="Enter department"
                />
              </div>
              <div className="flex gap-2 mt-4">
                <button
                  onClick={handleAddEmployee}
                  className="flex-1 bg-primary hover:bg-primary/90 dark:bg-primary/90 dark:hover:bg-primary/80 text-primary-foreground dark:text-primary-foreground/90 border-none py-2 rounded-md cursor-pointer text-sm transition-colors duration-300"
                >
                  Add Employee
                </button>
                <button
                  onClick={() => {
                    setShowAddDialog(false);
                    setFormData({ name: '', email: '', role: '', department: '' });
                  }}
                  className="flex-1 bg-transparent hover:bg-muted dark:hover:bg-muted/30 border border-border dark:border-accent/30 py-2 rounded-md cursor-pointer text-sm text-foreground dark:text-foreground/90 transition-colors duration-300"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Employee Dialog */}
      {showEditDialog && selectedEmployee && (
        <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50">
          <div className="bg-card dark:bg-card/95 p-6 rounded-lg w-full max-w-md m-4 shadow-lg dark:shadow-accent/10 border border-border dark:border-accent/20 transition-all duration-300">
            <h2 className="m-0 mb-4 text-xl font-semibold text-foreground dark:text-foreground/90">Edit Employee</h2>
            <div className="flex flex-col gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground dark:text-foreground/90 mb-1">Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full p-2 border border-border dark:border-accent/30 rounded-md text-sm bg-background dark:bg-muted/50 text-foreground dark:text-foreground/90 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-colors duration-300"
                  placeholder="Enter employee name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground dark:text-foreground/90 mb-1">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full p-2 border border-border dark:border-accent/30 rounded-md text-sm bg-background dark:bg-muted/50 text-foreground dark:text-foreground/90 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-colors duration-300"
                  placeholder="Enter email"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground dark:text-foreground/90 mb-1">Role</label>
                <input
                  type="text"
                  value={formData.role}
                  onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value }))}
                  className="w-full p-2 border border-border dark:border-accent/30 rounded-md text-sm bg-background dark:bg-muted/50 text-foreground dark:text-foreground/90 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-colors duration-300"
                  placeholder="Enter role"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground dark:text-foreground/90 mb-1">Department</label>
                <input
                  type="text"
                  value={formData.department}
                  onChange={(e) => setFormData(prev => ({ ...prev, department: e.target.value }))}
                  className="w-full p-2 border border-border dark:border-accent/30 rounded-md text-sm bg-background dark:bg-muted/50 text-foreground dark:text-foreground/90 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-colors duration-300"
                  placeholder="Enter department"
                />
              </div>
              <div className="flex gap-2 mt-4">
                <button
                  onClick={handleUpdateEmployee}
                  className="flex-1 bg-primary hover:bg-primary/90 dark:bg-primary/90 dark:hover:bg-primary/80 text-primary-foreground dark:text-primary-foreground/90 border-none py-2 rounded-md cursor-pointer text-sm transition-colors duration-300"
                >
                  Update Employee
                </button>
                <button
                  onClick={() => {
                    setShowEditDialog(false);
                    setSelectedEmployee(null);
                    setFormData({ name: '', email: '', role: '', department: '' });
                  }}
                  className="flex-1 bg-transparent hover:bg-muted dark:hover:bg-muted/30 border border-border dark:border-accent/30 py-2 rounded-md cursor-pointer text-sm text-foreground dark:text-foreground/90 transition-colors duration-300"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}