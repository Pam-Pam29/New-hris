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
      <div style={{ padding: '2rem', minHeight: '100vh', background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)' }}>
        <div style={{ textAlign: 'center' }}>Loading employees...</div>
      </div>
    );
  }

  return (
    <div style={{ padding: '2rem', minHeight: '100vh', background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)' }}>
      {/* Header Section */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
          <div style={{ padding: '0.5rem', backgroundColor: '#dbeafe', borderRadius: '0.5rem' }}>
            <span style={{ fontSize: '1.5rem' }}>👥</span>
          </div>
          <div>
            <h1 style={{
              fontSize: '1.875rem',
              fontWeight: 'bold',
              background: 'linear-gradient(135deg, #3b82f6, #06b6d4)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              margin: 0
            }}>
              Employee Management
            </h1>
            <p style={{ color: '#6b7280', fontSize: '0.875rem', margin: 0 }}>Manage your workforce efficiently</p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1.5rem',
        marginBottom: '2rem'
      }}>
        <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '0.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{employees.length}</div>
          <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>Total Employees</div>
        </div>
        <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '0.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{employees.filter(e => e.status === 'Active').length}</div>
          <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>Active Employees</div>
        </div>
        <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '0.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{employees.filter(e => e.status === 'On Leave').length}</div>
          <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>On Leave</div>
        </div>
        <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '0.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{new Set(employees.map(e => e.department)).size}</div>
          <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>Departments</div>
        </div>
      </div>

      {/* Actions Bar */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '2rem'
      }}>
        <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
          Showing {employees.length} employees
        </div>
        <button
          onClick={() => setShowAddDialog(true)}
          style={{
            backgroundColor: '#3b82f6',
            color: 'white',
            border: 'none',
            padding: '0.5rem 1rem',
            borderRadius: '0.375rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontSize: '0.875rem'
          }}
        >
          ➕ Add Employee
        </button>
      </div>

      {/* Employee Table */}
      <div style={{ backgroundColor: 'white', borderRadius: '0.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead style={{ backgroundColor: '#f9fafb' }}>
              <tr>
                <th style={{ padding: '0.75rem 1.5rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '500', color: '#6b7280', textTransform: 'uppercase' }}>
                  Employee
                </th>
                <th style={{ padding: '0.75rem 1.5rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '500', color: '#6b7280', textTransform: 'uppercase' }}>
                  Role
                </th>
                <th style={{ padding: '0.75rem 1.5rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '500', color: '#6b7280', textTransform: 'uppercase' }}>
                  Department
                </th>
                <th style={{ padding: '0.75rem 1.5rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '500', color: '#6b7280', textTransform: 'uppercase' }}>
                  Status
                </th>
                <th style={{ padding: '0.75rem 1.5rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '500', color: '#6b7280', textTransform: 'uppercase' }}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {employees.map((employee, index) => (
                <tr key={`emp-${employee.id}-${index}`} style={{ borderTop: '1px solid #e5e7eb' }}>
                  <td style={{ padding: '1rem 1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <img
                        src={employee.avatar || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMjAiIGZpbGw9IiNFNUU3RUIiLz4KPHBhdGggZD0iTTIwIDEwQzIyLjIwOTEgMTAgMjQgMTEuNzkwOSAyNCAxNEMyNCAxNi4yMDkxIDIyLjIwOTEgMTggMjAgMThDMTcuNzkwOSAxOCAxNiAxNi4yMDkxIDE2IDE0QzE2IDExLjc5MDkgMTcuNzkwOSAxMCAyMCAxMFoiIGZpbGw9IiM5Q0EzQUYiLz4KPHBhdGggZD0iTTI4IDMwQzI4IDI2LjY4NjMgMjQuNDE4MyAyNCAyMCAyNEMxNS41ODE3IDI0IDEyIDI2LjY4NjMgMTIgMzBIMjhaIiBmaWxsPSIjOUNBM0FGIi8+Cjwvc3ZnPgo='}
                        alt={employee.name}
                        style={{ width: '2.5rem', height: '2.5rem', borderRadius: '50%', marginRight: '0.75rem' }}
                        onError={(e) => {
                          e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMjAiIGZpbGw9IiNFNUU3RUIiLz4KPHBhdGggZD0iTTIwIDEwQzIyLjIwOTEgMTAgMjQgMTEuNzkwOSAyNCAxNEMyNCAxNi4yMDkxIDIyLjIwOTEgMTggMjAgMThDMTcuNzkwOSAxOCAxNiAxNi4yMDkxIDE2IDE0QzE2IDExLjc5MDkgMTcuNzkwOSAxMCAyMCAxMFoiIGZpbGw9IiM5Q0EzQUYiLz4KPHBhdGggZD0iTTI4IDMwQzI4IDI2LjY4NjMgMjQuNDE4MyAyNCAyMCAyNEMxNS41ODE3IDI0IDEyIDI2LjY4NjMgMTIgMzBIMjhaIiBmaWxsPSIjOUNBM0FGIi8+Cjwvc3ZnPgo=';
                        }}
                      />
                      <div>
                        <div style={{ fontSize: '0.875rem', fontWeight: '500' }}>{employee.name}</div>
                        <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>{employee.email}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '1rem 1.5rem', fontSize: '0.875rem' }}>
                    {employee.role}
                  </td>
                  <td style={{ padding: '1rem 1.5rem', fontSize: '0.875rem' }}>
                    {employee.department}
                  </td>
                  <td style={{ padding: '1rem 1.5rem' }}>
                    <span style={{
                      padding: '0.25rem 0.5rem',
                      borderRadius: '9999px',
                      fontSize: '0.75rem',
                      fontWeight: '500',
                      backgroundColor: employee.status === 'Active' ? '#dcfce7' : '#fef3c7',
                      color: employee.status === 'Active' ? '#166534' : '#92400e'
                    }}>
                      {employee.status}
                    </span>
                  </td>
                  <td style={{ padding: '1rem 1.5rem' }}>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button
                        onClick={() => openEditDialog(employee)}
                        style={{
                          backgroundColor: 'transparent',
                          border: '1px solid #d1d5db',
                          padding: '0.25rem 0.5rem',
                          borderRadius: '0.375rem',
                          cursor: 'pointer',
                          fontSize: '0.75rem',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.25rem'
                        }}
                      >
                        ✏️ Edit
                      </button>
                      <button
                        onClick={() => handleDeleteEmployee(employee.id.toString())}
                        style={{
                          backgroundColor: 'transparent',
                          border: '1px solid #d1d5db',
                          padding: '0.25rem 0.5rem',
                          borderRadius: '0.375rem',
                          cursor: 'pointer',
                          fontSize: '0.75rem',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.25rem'
                        }}
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
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '1.5rem',
            borderRadius: '0.5rem',
            width: '100%',
            maxWidth: '400px',
            margin: '1rem'
          }}>
            <h2 style={{ margin: '0 0 1rem 0', fontSize: '1.25rem', fontWeight: '600' }}>Add New Employee</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.25rem' }}>Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '0.375rem',
                    fontSize: '0.875rem'
                  }}
                  placeholder="Enter employee name"
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.25rem' }}>Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '0.375rem',
                    fontSize: '0.875rem'
                  }}
                  placeholder="Enter email"
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.25rem' }}>Role</label>
                <input
                  type="text"
                  value={formData.role}
                  onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value }))}
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '0.375rem',
                    fontSize: '0.875rem'
                  }}
                  placeholder="Enter role"
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.25rem' }}>Department</label>
                <input
                  type="text"
                  value={formData.department}
                  onChange={(e) => setFormData(prev => ({ ...prev, department: e.target.value }))}
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '0.375rem',
                    fontSize: '0.875rem'
                  }}
                  placeholder="Enter department"
                />
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                <button
                  onClick={handleAddEmployee}
                  style={{
                    flex: 1,
                    backgroundColor: '#3b82f6',
                    color: 'white',
                    border: 'none',
                    padding: '0.5rem',
                    borderRadius: '0.375rem',
                    cursor: 'pointer',
                    fontSize: '0.875rem'
                  }}
                >
                  Add Employee
                </button>
                <button
                  onClick={() => {
                    setShowAddDialog(false);
                    setFormData({ name: '', email: '', role: '', department: '' });
                  }}
                  style={{
                    flex: 1,
                    backgroundColor: 'transparent',
                    border: '1px solid #d1d5db',
                    padding: '0.5rem',
                    borderRadius: '0.375rem',
                    cursor: 'pointer',
                    fontSize: '0.875rem'
                  }}
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
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '1.5rem',
            borderRadius: '0.5rem',
            width: '100%',
            maxWidth: '400px',
            margin: '1rem'
          }}>
            <h2 style={{ margin: '0 0 1rem 0', fontSize: '1.25rem', fontWeight: '600' }}>Edit Employee</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.25rem' }}>Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '0.375rem',
                    fontSize: '0.875rem'
                  }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.25rem' }}>Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '0.375rem',
                    fontSize: '0.875rem'
                  }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.25rem' }}>Role</label>
                <input
                  type="text"
                  value={formData.role}
                  onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value }))}
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '0.375rem',
                    fontSize: '0.875rem'
                  }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.25rem' }}>Department</label>
                <input
                  type="text"
                  value={formData.department}
                  onChange={(e) => setFormData(prev => ({ ...prev, department: e.target.value }))}
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '0.375rem',
                    fontSize: '0.875rem'
                  }}
                />
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                <button
                  onClick={handleUpdateEmployee}
                  style={{
                    flex: 1,
                    backgroundColor: '#3b82f6',
                    color: 'white',
                    border: 'none',
                    padding: '0.5rem',
                    borderRadius: '0.375rem',
                    cursor: 'pointer',
                    fontSize: '0.875rem'
                  }}
                >
                  Update Employee
                </button>
                <button
                  onClick={() => {
                    setShowEditDialog(false);
                    setSelectedEmployee(null);
                    setFormData({ name: '', email: '', role: '', department: '' });
                  }}
                  style={{
                    flex: 1,
                    backgroundColor: 'transparent',
                    border: '1px solid #d1d5db',
                    padding: '0.5rem',
                    borderRadius: '0.375rem',
                    cursor: 'pointer',
                    fontSize: '0.875rem'
                  }}
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