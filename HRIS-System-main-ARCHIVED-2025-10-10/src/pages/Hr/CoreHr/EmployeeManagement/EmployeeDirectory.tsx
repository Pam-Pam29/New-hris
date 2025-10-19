import { useState, useEffect } from 'react';
import {
  Users,
  UserPlus,
  Search,
  Filter,
  Edit,
  Trash2,
  Mail,
  Phone,
  Building,
  Briefcase,
  CheckCircle,
  Clock,
  Download,
  Upload,
  Eye,
  X
} from 'lucide-react';

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
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [selectedViewEmployee, setSelectedViewEmployee] = useState<Employee | null>(null);
  const [employeeService, setEmployeeService] = useState<IEmployeeService | null>(null);

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: '',
    department: ''
  });

  // Debug form data changes
  useEffect(() => {
    console.log('Form data changed:', formData);
  }, [formData]);

  // Initialize employee service and load employees
  useEffect(() => {
    initializeService();
  }, []);

  const initializeService = async () => {
    try {
      setLoading(true);
      console.log('Initializing employee service...');
      const service = await getEmployeeService();
      console.log('Employee service initialized:', service);
      setEmployeeService(service);
      const data = await service.getEmployees();
      console.log('Employees loaded:', data);
      setEmployees(data);
    } catch (error) {
      console.error('Error initializing service or loading employees:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddEmployee = async () => {
    try {
      console.log('handleAddEmployee called', { formData, employeeService });
      if (formData.name && formData.role && formData.department && employeeService) {
        console.log('Creating employee with data:', formData);
        const newEmployee = await employeeService.createEmployee({
          ...formData,
          employmentType: 'Full-time',
          status: 'Active'
        });
        console.log('Employee created successfully:', newEmployee);
        setEmployees((prev: Employee[]) => [...prev, newEmployee]);
        setShowAddDialog(false);
        setFormData({ name: '', email: '', role: '', department: '' });
      } else {
        console.log('Missing required fields or service not available:', {
          name: formData.name,
          role: formData.role,
          department: formData.department,
          employeeService: !!employeeService
        });
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

  const openViewDialog = (employee: Employee) => {
    setSelectedViewEmployee(employee);
    setShowViewDialog(true);
  };

  if (loading) {
    return (
      <div className="p-8 min-h-screen animate-fade-in flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading employees...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 min-h-screen animate-fade-in">
      {/* Header Section */}
      <div className="mb-8 animate-slide-in">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-xl shadow-soft">
              <Users className="h-7 w-7 text-primary" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gradient mb-1">
                Employee Management
              </h1>
              <p className="text-muted-foreground">Manage your workforce efficiently and effectively</p>
              <div className="mt-2">
                <span className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded-full">
                  Service: {employeeService ? 'Firebase Service' : 'Loading...'}
                </span>
              </div>
            </div>
          </div>
          <div className="flex gap-3">
            <button className="flex items-center gap-2 px-4 py-2 bg-muted/50 hover:bg-muted/80 rounded-lg transition-colors">
              <Download className="h-4 w-4" />
              Export
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-muted/50 hover:bg-muted/80 rounded-lg transition-colors">
              <Upload className="h-4 w-4" />
              Import
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 animate-fade-in">
        <div className="card-modern group hover:scale-105 bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-primary/10 rounded-xl group-hover:bg-primary/20 transition-colors">
                <Users className="h-6 w-6 text-primary" />
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Total Employees</p>
              <p className="text-3xl font-bold text-primary">{employees.length}</p>
              <p className="text-xs text-muted-foreground">Active workforce</p>
            </div>
          </div>
        </div>

        <div className="card-modern group hover:scale-105 bg-gradient-to-br from-success/5 to-success/10 border-success/20">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-success/10 rounded-xl group-hover:bg-success/20 transition-colors">
                <CheckCircle className="h-6 w-6 text-success" />
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Active Employees</p>
              <p className="text-3xl font-bold text-success">{employees.filter(e => e.status === 'Active').length}</p>
              <p className="text-xs text-muted-foreground">Currently working</p>
            </div>
          </div>
        </div>

        <div className="card-modern group hover:scale-105 bg-gradient-to-br from-warning/5 to-warning/10 border-warning/20">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-warning/10 rounded-xl group-hover:bg-warning/20 transition-colors">
                <Clock className="h-6 w-6 text-warning" />
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">On Leave</p>
              <p className="text-3xl font-bold text-warning">{employees.filter(e => e.status === 'On Leave').length}</p>
              <p className="text-xs text-muted-foreground">Temporary absence</p>
            </div>
          </div>
        </div>

        <div className="card-modern group hover:scale-105 bg-gradient-to-br from-info/5 to-info/10 border-info/20">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-info/10 rounded-xl group-hover:bg-info/20 transition-colors">
                <Building className="h-6 w-6 text-info" />
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Departments</p>
              <p className="text-3xl font-bold text-info">{new Set(employees.map(e => e.department)).size}</p>
              <p className="text-xs text-muted-foreground">Active departments</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Actions Bar */}
      <div className="card-modern mb-8">
        <div className="p-6">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div className="flex items-center gap-4 flex-1">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search employees..."
                  className="w-full pl-10 pr-4 py-2 border border-input rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
                />
              </div>
              <button className="flex items-center gap-2 px-4 py-2 bg-muted/50 hover:bg-muted/80 rounded-lg transition-colors">
                <Filter className="h-4 w-4" />
                Filter
              </button>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowAddDialog(true)}
                className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg shadow-soft hover:shadow-soft-lg transition-all duration-200"
              >
                <UserPlus className="h-4 w-4" />
                Add Employee
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Employee Table */}
      <div className="card-modern overflow-hidden">
        <div className="overflow-x-auto">
          <table className="table-modern">
            <thead>
              <tr>
                <th className="text-left">Employee</th>
                <th className="text-left">Role & Department</th>
                <th className="text-left">Contact</th>
                <th className="text-left">Status</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {employees.map((employee, index) => (
                <tr key={`emp-${employee.id}-${index}`} className="group">
                  <td>
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <img
                          src={employee.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(employee.name)}&background=random&color=fff&size=40`}
                          alt={employee.name}
                          className="w-10 h-10 rounded-full border-2 border-border shadow-soft"
                          onError={(e) => {
                            e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(employee.name)}&background=random&color=fff&size=40`;
                          }}
                        />
                        <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-background ${employee.status === 'Active' ? 'bg-success' : 'bg-warning'
                          }`} />
                      </div>
                      <div>
                        <div className="font-semibold text-foreground">{employee.name}</div>
                        <div className="text-sm text-muted-foreground">ID: {employee.id}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Briefcase className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{employee.role}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Building className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">{employee.department}</span>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="space-y-1">
                      {employee.email && (
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{employee.email}</span>
                        </div>
                      )}
                      {employee.phone && (
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{employee.phone}</span>
                        </div>
                      )}
                    </div>
                  </td>
                  <td>
                    <div className="flex items-center gap-2">
                      {employee.status === 'Active' ? (
                        <CheckCircle className="h-4 w-4 text-success" />
                      ) : (
                        <Clock className="h-4 w-4 text-warning" />
                      )}
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${employee.status === 'Active'
                        ? 'bg-success/10 text-success border border-success/20'
                        : 'bg-warning/10 text-warning border border-warning/20'
                        }`}>
                        {employee.status}
                      </span>
                    </div>
                  </td>
                  <td>
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => openViewDialog(employee)}
                        className="flex items-center gap-1 px-3 py-1.5 hover:bg-info/10 text-info rounded-lg transition-colors text-sm"
                        title="View Details"
                      >
                        <Eye className="h-4 w-4" />
                        <span>View</span>
                      </button>
                      <button
                        onClick={() => openEditDialog(employee)}
                        className="flex items-center gap-1 px-3 py-1.5 hover:bg-primary/10 text-primary rounded-lg transition-colors text-sm"
                        title="Edit Employee"
                      >
                        <Edit className="h-4 w-4" />
                        <span>Edit</span>
                      </button>
                      <button
                        onClick={() => handleDeleteEmployee(employee.id.toString())}
                        className="flex items-center gap-1 px-3 py-1.5 hover:bg-destructive/10 text-destructive rounded-lg transition-colors text-sm"
                        title="Delete Employee"
                      >
                        <Trash2 className="h-4 w-4" />
                        <span>Delete</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {employees.length === 0 && (
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-lg font-medium text-muted-foreground mb-2">No employees found</p>
              <p className="text-sm text-muted-foreground mb-4">Get started by adding your first employee</p>
              <button
                onClick={() => setShowAddDialog(true)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg shadow-soft hover:shadow-soft-lg transition-all duration-200"
              >
                <UserPlus className="h-4 w-4" />
                Add First Employee
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Add Employee Dialog */}
      {showAddDialog && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
          <div className="card-modern w-full max-w-md m-4 animate-slide-in">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <UserPlus className="h-5 w-5 text-primary" />
                  </div>
                  <h2 className="text-xl font-semibold">Add New Employee</h2>
                </div>
                <button
                  onClick={() => {
                    setShowAddDialog(false);
                    setFormData({ name: '', email: '', role: '', department: '' });
                  }}
                  className="p-2 hover:bg-muted/50 rounded-lg transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 border border-input rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-colors"
                    placeholder="Enter employee name"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      className="w-full pl-10 pr-3 py-2 border border-input rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-colors"
                      placeholder="Enter email address"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Role *</label>
                  <div className="relative">
                    <Briefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input
                      type="text"
                      value={formData.role}
                      onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value }))}
                      className="w-full pl-10 pr-3 py-2 border border-input rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-colors"
                      placeholder="Enter job role"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Department *</label>
                  <div className="relative">
                    <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input
                      type="text"
                      value={formData.department}
                      onChange={(e) => setFormData(prev => ({ ...prev, department: e.target.value }))}
                      className="w-full pl-10 pr-3 py-2 border border-input rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-colors"
                      placeholder="Enter department"
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-6 pt-4 border-t border-border">
                <button
                  onClick={() => {
                    setShowAddDialog(false);
                    setFormData({ name: '', email: '', role: '', department: '' });
                  }}
                  className="flex-1 px-4 py-2 border border-input rounded-lg hover:bg-muted/50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    console.log('Add Employee button clicked!');
                    handleAddEmployee();
                  }}
                  className="flex-1 px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg shadow-soft hover:shadow-soft-lg transition-all duration-200"
                >
                  Add Employee
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Employee Dialog */}
      {showEditDialog && selectedEmployee && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
          <div className="card-modern w-full max-w-md m-4 animate-slide-in">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Edit className="h-5 w-5 text-primary" />
                  </div>
                  <h2 className="text-xl font-semibold">Edit Employee</h2>
                </div>
                <button
                  onClick={() => {
                    setShowEditDialog(false);
                    setSelectedEmployee(null);
                    setFormData({ name: '', email: '', role: '', department: '' });
                  }}
                  className="p-2 hover:bg-muted/50 rounded-lg transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 border border-input rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-colors"
                    placeholder="Enter employee name"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      className="w-full pl-10 pr-3 py-2 border border-input rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-colors"
                      placeholder="Enter email address"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Role *</label>
                  <div className="relative">
                    <Briefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input
                      type="text"
                      value={formData.role}
                      onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value }))}
                      className="w-full pl-10 pr-3 py-2 border border-input rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-colors"
                      placeholder="Enter job role"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Department *</label>
                  <div className="relative">
                    <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input
                      type="text"
                      value={formData.department}
                      onChange={(e) => setFormData(prev => ({ ...prev, department: e.target.value }))}
                      className="w-full pl-10 pr-3 py-2 border border-input rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-colors"
                      placeholder="Enter department"
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-6 pt-4 border-t border-border">
                <button
                  onClick={() => {
                    setShowEditDialog(false);
                    setSelectedEmployee(null);
                    setFormData({ name: '', email: '', role: '', department: '' });
                  }}
                  className="flex-1 px-4 py-2 border border-input rounded-lg hover:bg-muted/50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdateEmployee}
                  className="flex-1 px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg shadow-soft hover:shadow-soft-lg transition-all duration-200"
                >
                  Update Employee
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View Employee Dialog */}
      {showViewDialog && selectedViewEmployee && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-background rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-border">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-foreground flex items-center gap-3">
                  <div className="p-2 bg-info/10 rounded-lg">
                    <Eye className="h-6 w-6 text-info" />
                  </div>
                  Employee Details
                </h2>
                <button
                  onClick={() => setShowViewDialog(false)}
                  className="p-2 hover:bg-muted rounded-lg transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Full Name</label>
                    <p className="text-lg font-semibold">{selectedViewEmployee.name}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Email</label>
                    <p className="text-lg">{selectedViewEmployee.email || 'Not provided'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Phone</label>
                    <p className="text-lg">{selectedViewEmployee.phone || 'Not provided'}</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Role</label>
                    <p className="text-lg font-semibold">{selectedViewEmployee.role}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Department</label>
                    <p className="text-lg">{selectedViewEmployee.department}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Employment Type</label>
                    <p className="text-lg">{selectedViewEmployee.employmentType}</p>
                  </div>
                </div>
              </div>

              {/* Status */}
              <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 rounded-lg border border-blue-200 dark:border-blue-800">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Status</label>
                    <p className="text-lg font-semibold">{selectedViewEmployee.status}</p>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-sm font-medium ${selectedViewEmployee.status === 'Active'
                    ? 'bg-green-100 text-green-800 border border-green-200'
                    : selectedViewEmployee.status === 'Inactive'
                      ? 'bg-red-100 text-red-800 border border-red-200'
                      : 'bg-yellow-100 text-yellow-800 border border-yellow-200'
                    }`}>
                    {selectedViewEmployee.status}
                  </div>
                </div>
              </div>

              {/* Additional Information */}
              {(selectedViewEmployee.dateStarted || selectedViewEmployee.location || selectedViewEmployee.gender) && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {selectedViewEmployee.dateStarted && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Start Date</label>
                      <p className="text-lg">{selectedViewEmployee.dateStarted}</p>
                    </div>
                  )}
                  {selectedViewEmployee.location && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Location</label>
                      <p className="text-lg">{selectedViewEmployee.location}</p>
                    </div>
                  )}
                  {selectedViewEmployee.gender && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Gender</label>
                      <p className="text-lg">{selectedViewEmployee.gender}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Manager */}
              {selectedViewEmployee.manager && (
                <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30 rounded-lg border border-purple-200 dark:border-purple-800">
                  <label className="text-sm font-medium text-muted-foreground">Reports to</label>
                  <p className="text-lg font-semibold">{selectedViewEmployee.manager}</p>
                </div>
              )}

              {/* Emergency Contact */}
              {selectedViewEmployee.emergencyContact && (
                <div className="p-4 bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-950/30 dark:to-red-950/30 rounded-lg border border-orange-200 dark:border-orange-800">
                  <label className="text-sm font-medium text-muted-foreground">Emergency Contact</label>
                  <div className="mt-2">
                    <p className="text-lg font-semibold">{selectedViewEmployee.emergencyContact.name}</p>
                    <p className="text-sm text-muted-foreground">{selectedViewEmployee.emergencyContact.relationship}</p>
                    <p className="text-sm text-muted-foreground">{selectedViewEmployee.emergencyContact.phone}</p>
                  </div>
                </div>
              )}

              {/* Notes */}
              {selectedViewEmployee.notes && (
                <div className="p-4 bg-gradient-to-r from-gray-50 to-slate-50 dark:from-gray-950/30 dark:to-slate-950/30 rounded-lg border border-gray-200 dark:border-gray-800">
                  <label className="text-sm font-medium text-muted-foreground">Notes</label>
                  <p className="text-lg mt-2">{selectedViewEmployee.notes}</p>
                </div>
              )}
            </div>

            <div className="p-6 border-t border-border">
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowViewDialog(false)}
                  className="px-6 py-2 border border-border hover:bg-muted rounded-lg transition-colors"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    setShowViewDialog(false);
                    openEditDialog(selectedViewEmployee);
                  }}
                  className="px-6 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg transition-colors"
                >
                  Edit Employee
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}