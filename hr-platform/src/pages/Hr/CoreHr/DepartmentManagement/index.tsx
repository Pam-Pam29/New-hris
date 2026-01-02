import React, { useState, useEffect } from 'react';
import { Building, UserPlus, X, Edit, Trash2, Search, AlertCircle, CheckCircle } from 'lucide-react';
import { departmentService, Department } from '../../../../services/departmentService';
import { useCompany } from '../../../../context/CompanyContext';

export default function DepartmentManagement() {
  const { companyId } = useCompany();
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFormData, setDepartmentFormData] = useState({
    name: '',
    description: '',
    location: ''
  });
  const [addingDepartment, setAddingDepartment] = useState(false);
  const [departmentError, setDepartmentError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Load departments
  useEffect(() => {
    if (!companyId) return;

    const loadDepartments = async () => {
      try {
        setLoading(true);
        const depts = await departmentService.getDepartmentsByCompany(companyId);
        setDepartments(depts);
      } catch (error) {
        console.error('Error loading departments:', error);
        setDepartmentError('Failed to load departments');
      } finally {
        setLoading(false);
      }
    };

    loadDepartments();
  }, [companyId]);

  // Handle adding a new department
  const handleAddDepartment = async () => {
    if (!companyId) {
      setDepartmentError('Company ID is required');
      return;
    }

    if (!departmentFormData.name.trim()) {
      setDepartmentError('Department name is required');
      return;
    }

    setAddingDepartment(true);
    setDepartmentError(null);
    setSuccessMessage(null);

    try {
      await departmentService.createDepartment({
        companyId,
        name: departmentFormData.name,
        description: departmentFormData.description || undefined,
        location: departmentFormData.location || undefined
      });

      // Refresh department list
      const depts = await departmentService.getDepartmentsByCompany(companyId);
      setDepartments(depts);

      // Reset form and close dialog
      setDepartmentFormData({ name: '', description: '', location: '' });
      setShowAddDialog(false);
      setSuccessMessage(`Department "${departmentFormData.name}" added successfully!`);
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(null), 3000);

      console.log('✅ Department added successfully');
    } catch (error: any) {
      console.error('❌ Error adding department:', error);
      setDepartmentError(error.message || 'Failed to add department. Please try again.');
    } finally {
      setAddingDepartment(false);
    }
  };

  // Filter departments based on search term
  const filteredDepartments = departments.filter(dept =>
    dept.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    dept.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    dept.location?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="p-8 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading departments...</p>
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
            <div className="p-3 bg-gradient-to-br from-info/20 to-info/10 rounded-xl shadow-soft">
              <Building className="h-7 w-7 text-info" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Department Management</h1>
              <p className="text-muted-foreground mt-2">
                Create and manage company departments
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowAddDialog(true)}
            className="flex items-center gap-2 px-4 py-2 bg-info hover:bg-info/90 text-white rounded-lg shadow-soft hover:shadow-soft-lg transition-all duration-200"
          >
            <UserPlus className="h-4 w-4" />
            Add Department
          </button>
        </div>
      </div>

      {/* Success Message */}
      {successMessage && (
        <div className="mb-6 p-4 bg-success/10 border border-success/20 rounded-lg flex items-center gap-3 animate-fade-in">
          <CheckCircle className="h-5 w-5 text-success" />
          <p className="text-success font-medium">{successMessage}</p>
        </div>
      )}

      {/* Error Message */}
      {departmentError && !showAddDialog && (
        <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-lg flex items-center gap-3 animate-fade-in">
          <AlertCircle className="h-5 w-5 text-destructive" />
          <p className="text-destructive">{departmentError}</p>
          <button
            onClick={() => setDepartmentError(null)}
            className="ml-auto text-destructive hover:text-destructive/80"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Search Bar */}
      <div className="card-modern mb-8">
        <div className="p-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search departments by name, description, or location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-input rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Departments Grid */}
      {filteredDepartments.length === 0 ? (
        <div className="card-modern">
          <div className="p-12 text-center">
            <Building className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
            <h3 className="text-xl font-semibold text-foreground mb-2">
              {searchTerm ? 'No departments found' : 'No departments yet'}
            </h3>
            <p className="text-muted-foreground mb-6">
              {searchTerm
                ? 'Try adjusting your search terms'
                : 'Get started by adding your first department'}
            </p>
            {!searchTerm && (
              <button
                onClick={() => setShowAddDialog(true)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-info hover:bg-info/90 text-white rounded-lg shadow-soft hover:shadow-soft-lg transition-all duration-200"
              >
                <UserPlus className="h-4 w-4" />
                Add First Department
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDepartments.map((dept) => (
            <div
              key={dept.id}
              className="card-modern group hover:scale-105 transition-transform duration-200"
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-info/10 rounded-lg group-hover:bg-info/20 transition-colors">
                      <Building className="h-5 w-5 text-info" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-foreground">{dept.name}</h3>
                      {dept.location && (
                        <p className="text-sm text-muted-foreground mt-1">{dept.location}</p>
                      )}
                    </div>
                  </div>
                </div>
                {dept.description && (
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                    {dept.description}
                  </p>
                )}
                <div className="flex items-center justify-between pt-4 border-t border-border">
                  <div className="text-xs text-muted-foreground">
                    Created {dept.createdAt.toLocaleDateString()}
                  </div>
                  <div className="flex gap-2">
                    <button
                      className="p-2 hover:bg-primary/10 text-primary rounded-lg transition-colors"
                      title="Edit Department"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      className="p-2 hover:bg-destructive/10 text-destructive rounded-lg transition-colors"
                      title="Delete Department"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Department Dialog */}
      {showAddDialog && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[9999] animate-fade-in" style={{ position: 'fixed' }}>
          <div className="card-modern w-full max-w-md m-4 animate-slide-in">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-info/10 rounded-lg">
                    <Building className="h-5 w-5 text-info" />
                  </div>
                  <h2 className="text-xl font-semibold">Add New Department</h2>
                </div>
                <button
                  onClick={() => {
                    setShowAddDialog(false);
                    setDepartmentFormData({ name: '', description: '', location: '' });
                    setDepartmentError(null);
                  }}
                  className="p-2 hover:bg-muted/50 rounded-lg transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="space-y-4">
                {departmentError && (
                  <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                    <p className="text-sm text-destructive">{departmentError}</p>
                  </div>
                )}

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Department Name *</label>
                  <input
                    type="text"
                    value={departmentFormData.name}
                    onChange={(e) => {
                      setDepartmentFormData(prev => ({ ...prev, name: e.target.value }));
                      setDepartmentError(null);
                    }}
                    className="w-full px-3 py-2 border border-input rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-colors"
                    placeholder="e.g., Engineering, Marketing, Sales"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Description (Optional)</label>
                  <textarea
                    value={departmentFormData.description}
                    onChange={(e) => setDepartmentFormData(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full px-3 py-2 border border-input rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-colors resize-none"
                    placeholder="Brief description of the department"
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Location (Optional)</label>
                  <input
                    type="text"
                    value={departmentFormData.location}
                    onChange={(e) => setDepartmentFormData(prev => ({ ...prev, location: e.target.value }))}
                    className="w-full px-3 py-2 border border-input rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-colors"
                    placeholder="e.g., New York, Remote, London"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-border">
                <button
                  onClick={() => {
                    setShowAddDialog(false);
                    setDepartmentFormData({ name: '', description: '', location: '' });
                    setDepartmentError(null);
                  }}
                  className="px-4 py-2 border border-border hover:bg-muted rounded-lg transition-colors"
                  disabled={addingDepartment}
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddDepartment}
                  disabled={addingDepartment || !departmentFormData.name.trim()}
                  className="px-4 py-2 bg-info hover:bg-info/90 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {addingDepartment ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Adding...
                    </>
                  ) : (
                    <>
                      <UserPlus className="h-4 w-4" />
                      Add Department
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}





