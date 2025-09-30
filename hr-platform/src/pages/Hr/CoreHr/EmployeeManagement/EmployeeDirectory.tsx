import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  X,
  ExternalLink,
  User,
  MapPin,
  Calendar,
  CreditCard,
  Award,
  Heart,
  Shield,
  Star
} from 'lucide-react';

// Use the imported Employee type from types.ts
import type { Employee } from './types';

// Interface for view employee with string dates for safe rendering
interface ViewEmployee extends Omit<Employee, 'personalInfo' | 'skills'> {
  personalInfo?: {
    firstName: string;
    lastName: string;
    middleName?: string;
    dateOfBirth: string; // String instead of Date
    gender?: string;
    nationality?: string;
    maritalStatus?: string;
    profilePhoto?: string;
    identificationNumber?: string;
    otherNationality?: string;
  };
  skills?: Array<{
    id?: string;
    name: string;
    category?: string;
    level: string;
    certified: boolean;
    certificationDate?: string; // String instead of Date
    expiryDate?: string; // String instead of Date
    issuer?: string;
  }>;
}

// Import the comprehensive data flow service
import { getComprehensiveDataFlowService } from '../../../../services/comprehensiveDataFlowService';

export default function EmployeeDirectory() {
  const navigate = useNavigate();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [selectedViewEmployee, setSelectedViewEmployee] = useState<ViewEmployee | null>(null);
  const [dataFlowService, setDataFlowService] = useState<any>(null);

  // Additional data states for comprehensive employee view
  const [employeeLeaveRequests, setEmployeeLeaveRequests] = useState<any[]>([]);
  const [employeePerformanceGoals, setEmployeePerformanceGoals] = useState<any[]>([]);
  const [employeePerformanceReviews, setEmployeePerformanceReviews] = useState<any[]>([]);
  const [employeeAssets, setEmployeeAssets] = useState<any[]>([]);
  const [employeeAttendance, setEmployeeAttendance] = useState<any[]>([]);
  const [employeeTimeTracking, setEmployeeTimeTracking] = useState<any[]>([]);
  const [employeeNotifications, setEmployeeNotifications] = useState<any[]>([]);
  const [employeePolicies, setEmployeePolicies] = useState<any[]>([]);
  const [isLoadingEmployeeData, setIsLoadingEmployeeData] = useState(false);

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: '',
    department: ''
  });

  // Debug form data changes (removed to prevent excessive re-renders)
  // useEffect(() => {
  //   console.log('Form data changed:', formData);
  // }, [formData]);

  // Initialize employee service and load employees
  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    const setupService = async () => {
      unsubscribe = await initializeService();
    };

    setupService();

    // Cleanup function
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []); // Empty dependency array to run only once

  const initializeService = async () => {
    try {
      setLoading(true);
      console.log('Initializing comprehensive data flow service...');
      const service = await getComprehensiveDataFlowService();
      console.log('Data flow service initialized:', service);
      setDataFlowService(service);

      // Set up real-time subscription to all employees
      const unsubscribe = service.subscribeToAllEmployees((allEmployees) => {
        console.log('Real-time employees update received:', allEmployees);

        // Convert comprehensive profiles to simple Employee format for display
        const simpleEmployees = allEmployees.map((profile: any) => {
          console.log('Processing profile:', profile);
          console.log('Profile ID fields:', {
            employeeId: profile.employeeId,
            id: profile.id,
            docId: profile.docId
          });

          // Helper function to safely convert any value to string
          const safeString = (value: any): string => {
            if (value === null || value === undefined) return '';
            if (typeof value === 'string') return value;
            if (typeof value === 'number') return String(value);
            if (value instanceof Date) return value.toLocaleDateString();
            if (typeof value === 'object') return JSON.stringify(value);
            return String(value);
          };

          // Helper function to safely convert objects
          const safeObject = (obj: any): any => {
            if (!obj || typeof obj !== 'object') return obj;
            const safe: any = {};
            for (const key in obj) {
              if (obj.hasOwnProperty(key)) {
                const value = obj[key];
                if (value instanceof Date) {
                  safe[key] = value.toLocaleDateString();
                } else if (Array.isArray(value)) {
                  safe[key] = value.map(item =>
                    typeof item === 'object' && item !== null ? safeObject(item) : safeString(item)
                  );
                } else if (typeof value === 'object' && value !== null) {
                  safe[key] = safeObject(value);
                } else {
                  safe[key] = safeString(value);
                }
              }
            }
            return safe;
          };

          return {
            id: safeString(profile.employeeId || profile.id || profile.docId || `emp-${Date.now()}`),
            employeeId: safeString(profile.employeeId || profile.id || profile.docId || `emp-${Date.now()}`),
            name: safeString(`${profile.personalInfo?.firstName || ''} ${profile.personalInfo?.lastName || ''}`.trim() || 'Unknown'),
            email: safeString(profile.contactInfo?.personalEmail || profile.contactInfo?.workEmail || ''),
            role: safeString(profile.workInfo?.position || 'Unknown'),
            department: safeString(profile.workInfo?.department || 'Unknown'),
            employmentType: safeString(profile.workInfo?.employmentType || 'Full-time'),
            status: safeString(profile.profileStatus?.status === 'active' ? 'Active' : 'Inactive'),
            phone: safeString(profile.contactInfo?.personalPhone || profile.contactInfo?.workPhone || ''),
            address: profile.contactInfo?.address ?
              safeString(`${profile.contactInfo.address.street || ''}, ${profile.contactInfo.address.city || ''}, ${profile.contactInfo.address.state || ''}`) : '',
            dateStarted: profile.workInfo?.hireDate ?
              (profile.workInfo.hireDate instanceof Date ?
                profile.workInfo.hireDate.toLocaleDateString() :
                safeString(profile.workInfo.hireDate)) : '',
            // Convert all nested objects to safe format
            personalInfo: profile.personalInfo ? safeObject(profile.personalInfo) : undefined,
            contactInfo: profile.contactInfo ? safeObject(profile.contactInfo) : undefined,
            workInfo: profile.workInfo ? safeObject(profile.workInfo) : undefined,
            bankingInfo: profile.bankingInfo ? safeObject(profile.bankingInfo) : undefined,
            skills: Array.isArray(profile.skills) ? profile.skills.map(skill => safeObject(skill)) : [],
            emergencyContacts: Array.isArray(profile.contactInfo?.emergencyContacts)
              ? profile.contactInfo.emergencyContacts.map(contact => safeObject(contact))
              : [],
            familyInfo: profile.familyInfo ? safeObject(profile.familyInfo) : undefined,
            profileStatus: profile.profileStatus ? safeObject(profile.profileStatus) : undefined
          };
        });

        setEmployees(simpleEmployees);
        console.log('Employees updated:', simpleEmployees.length, 'employees');
        setLoading(false);
      });

      // Store the unsubscribe function for cleanup
      return unsubscribe;
    } catch (error) {
      console.error('Error initializing service or loading employees:', error);
      setLoading(false);
    }
  };

  const handleAddEmployee = async () => {
    try {
      console.log('handleAddEmployee called', { formData, dataFlowService });
      if (formData.name && formData.role && formData.department && dataFlowService) {
        console.log('Creating employee with data:', formData);

        // Create a comprehensive profile using the data flow service
        const [firstName, ...lastNameParts] = formData.name.split(' ');
        const lastName = lastNameParts.join(' ') || '';

        const newProfile = await dataFlowService.updateEmployeeProfile(formData.email || `emp-${Date.now()}`, {
          employeeId: formData.email || `emp-${Date.now()}`,
          personalInfo: {
            firstName: firstName,
            lastName: lastName,
            dateOfBirth: new Date()
          },
          contactInfo: {
            personalEmail: formData.email || '',
            workEmail: formData.email || '',
            personalPhone: '',
            workPhone: '',
            address: {
              street: '',
              city: '',
              state: '',
              zipCode: '',
              country: ''
            },
            emergencyContacts: []
          },
          workInfo: {
            position: formData.role,
            department: formData.department,
            hireDate: new Date(),
            employmentType: 'Full-time',
            workLocation: 'Office',
            workSchedule: '9-5',
            salary: {
              baseSalary: 0,
              currency: 'USD',
              payFrequency: 'Monthly'
            }
          },
          profileStatus: {
            completeness: 0,
            lastUpdated: new Date(),
            updatedBy: 'hr',
            status: 'active'
          }
        });

        console.log('Employee profile created successfully:', newProfile);

        // No need to refresh - real-time updates will handle this
        setShowAddDialog(false);
        setFormData({ name: '', email: '', role: '', department: '' });
      } else {
        console.log('Missing required fields or service not available:', {
          name: formData.name,
          role: formData.role,
          department: formData.department,
          dataFlowService: !!dataFlowService
        });
      }
    } catch (error) {
      console.error('Error adding employee:', error);
    }
  };

  const handleUpdateEmployee = async () => {
    try {
      if (selectedEmployee && formData.name && formData.role && formData.department && dataFlowService) {
        // Update using the comprehensive data flow service
        const [firstName, ...lastNameParts] = formData.name.split(' ');
        const lastName = lastNameParts.join(' ') || '';

        await dataFlowService.updateEmployeeProfile(selectedEmployee.id.toString(), {
          personalInfo: {
            firstName: firstName,
            lastName: lastName
          },
          workInfo: {
            position: formData.role,
            department: formData.department
          },
          contactInfo: {
            personalEmail: formData.email || '',
            workEmail: formData.email || ''
          }
        });

        // No need to refresh - real-time updates will handle this
        setShowEditDialog(false);
        setSelectedEmployee(null);
        setFormData({ name: '', email: '', role: '', department: '' });
      }
    } catch (error) {
      console.error('Error updating employee:', error);
    }
  };

  const handleDeleteEmployee = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this employee?') && dataFlowService) {
      try {
        // For now, we'll just remove from the local state
        // In a real implementation, you'd call a delete method on the service
        setEmployees((prev: Employee[]) => prev.filter((emp: Employee) => emp.id.toString() !== id));
        console.log('Employee deleted (local state only)');
      } catch (error) {
        console.error('Error deleting employee:', error);
      }
    }
  };

  const openEditDialog = (employee: Employee | ViewEmployee) => {
    // Convert ViewEmployee to Employee if needed
    const employeeForEdit: Employee = {
      id: employee.id,
      employeeId: employee.employeeId,
      name: employee.name,
      email: employee.email,
      workEmail: employee.workEmail,
      role: employee.role,
      department: employee.department,
      employmentType: employee.employmentType,
      status: employee.status,
      dateStarted: employee.dateStarted,
      phone: employee.phone,
      address: employee.address,
      location: employee.location,
      gender: employee.gender,
      dob: employee.dob,
      nationalId: employee.nationalId,
      manager: employee.manager,
      documents: employee.documents,
      emergencyContact: employee.emergencyContact,
      notes: employee.notes,
      personalInfo: employee.personalInfo ? {
        firstName: employee.personalInfo.firstName,
        lastName: employee.personalInfo.lastName,
        middleName: employee.personalInfo.middleName,
        dateOfBirth: employee.personalInfo.dateOfBirth instanceof Date
          ? employee.personalInfo.dateOfBirth
          : new Date(employee.personalInfo.dateOfBirth || ''),
        nationalId: (employee.personalInfo as any).identificationNumber || '',
        gender: employee.personalInfo.gender as 'male' | 'female' | 'other' || 'other',
        nationality: employee.personalInfo.nationality || '',
        maritalStatus: employee.personalInfo.maritalStatus as 'single' | 'married' | 'divorced' | 'widowed' || 'single',
        profilePhoto: employee.personalInfo.profilePhoto,
        passportNumber: (employee.personalInfo as any).passportNumber,
        driverLicense: (employee.personalInfo as any).driverLicense
      } : undefined,
      contactInfo: employee.contactInfo ? {
        ...employee.contactInfo,
        emergencyContacts: Array.isArray((employee.contactInfo as any).emergencyContacts)
          ? (employee.contactInfo as any).emergencyContacts
          : []
      } as any : undefined,
      bankingInfo: employee.bankingInfo ? {
        ...employee.bankingInfo
      } : undefined,
      skills: employee.skills ? employee.skills.map(skill => ({
        id: skill.id || '',
        name: skill.name,
        category: skill.category || '',
        level: skill.level as 'beginner' | 'intermediate' | 'advanced' | 'expert',
        certified: skill.certified,
        certificationDate: skill.certificationDate ? new Date(skill.certificationDate) : undefined,
        expiryDate: skill.expiryDate ? new Date(skill.expiryDate) : undefined
      })) : [],
      emergencyContacts: Array.isArray(employee.emergencyContacts)
        ? employee.emergencyContacts
        : []
    };

    setSelectedEmployee(employeeForEdit);
    setFormData({
      name: employee.name,
      email: employee.email || '',
      role: employee.role,
      department: employee.department
    });
    setShowEditDialog(true);
  };

  const openViewDialog = (employee: Employee) => {
    if (employee && (employee.id || employee.employeeId)) {
      // Helper function to safely convert any value to string
      const safeString = (value: any): string => {
        if (value === null || value === undefined) return '';
        if (typeof value === 'string') return value;
        if (typeof value === 'number') return String(value);
        if (value instanceof Date) return value.toLocaleDateString();
        if (typeof value === 'object') return JSON.stringify(value);
        return String(value);
      };

      // Convert Date objects to strings to prevent React rendering errors
      const safeEmployee: ViewEmployee = {
        id: safeString(employee.id),
        employeeId: safeString(employee.employeeId),
        name: safeString(employee.name),
        email: safeString(employee.email),
        workEmail: safeString(employee.workEmail),
        role: safeString(employee.role),
        department: safeString(employee.department),
        employmentType: safeString(employee.employmentType),
        status: safeString(employee.status),
        dateStarted: safeString(employee.dateStarted),
        phone: safeString(employee.phone),
        address: safeString(employee.address),
        location: safeString(employee.location),
        gender: safeString(employee.gender),
        dob: safeString(employee.dob),
        nationalId: safeString(employee.nationalId),
        manager: safeString(employee.manager),
        documents: employee.documents,
        emergencyContact: employee.emergencyContact ? {
          name: safeString(employee.emergencyContact.name),
          relationship: safeString(employee.emergencyContact.relationship),
          phone: safeString(employee.emergencyContact.phone)
        } : undefined,
        notes: safeString(employee.notes),
        personalInfo: employee.personalInfo ? {
          ...employee.personalInfo,
          dateOfBirth: employee.personalInfo.dateOfBirth instanceof Date
            ? employee.personalInfo.dateOfBirth.toLocaleDateString()
            : String(employee.personalInfo.dateOfBirth || ''),
          gender: safeString(employee.personalInfo.gender),
          nationality: safeString(employee.personalInfo.nationality),
          maritalStatus: safeString(employee.personalInfo.maritalStatus),
          profilePhoto: safeString(employee.personalInfo.profilePhoto),
          identificationNumber: safeString(employee.personalInfo.nationalId),
          otherNationality: safeString((employee.personalInfo as any).otherNationality)
        } : undefined,
        skills: employee.skills ? employee.skills.map(skill => ({
          ...skill,
          certificationDate: skill.certificationDate instanceof Date
            ? skill.certificationDate.toLocaleDateString()
            : (skill.certificationDate ? String(skill.certificationDate) : undefined),
          expiryDate: skill.expiryDate instanceof Date
            ? skill.expiryDate.toLocaleDateString()
            : (skill.expiryDate ? String(skill.expiryDate) : undefined)
        })) : []
      };

      setSelectedViewEmployee(safeEmployee);
      setShowViewDialog(true);
      // Fetch comprehensive employee data from all Firebase collections
      const employeeId = employee.id || employee.employeeId;
      if (employeeId) {
        fetchEmployeeComprehensiveData(employeeId.toString());
      }
    } else {
      console.error('Employee or employee.id is undefined:', employee);
    }
  };

  const viewFullProfile = (employee: Employee | ViewEmployee) => {
    // Navigate to HR profile view page
    const employeeId = employee.id || employee.employeeId;
    if (employeeId) {
      navigate(`/hr/employee/${employeeId}`);
    }
  };

  // Helper function to safely format Firestore timestamps
  const formatFirestoreTimestamp = (timestamp: any): string => {
    if (!timestamp) return 'N/A';
    if (typeof timestamp === 'string') return timestamp;
    if (timestamp.toDate && typeof timestamp.toDate === 'function') {
      return timestamp.toDate().toLocaleDateString();
    }
    if (timestamp.seconds) {
      return new Date(timestamp.seconds * 1000).toLocaleDateString();
    }
    return 'Invalid Date';
  };

  // Function to fetch comprehensive employee data from all Firebase collections
  const fetchEmployeeComprehensiveData = async (employeeId: string) => {
    setIsLoadingEmployeeData(true);
    try {
      const { collection, query, getDocs, where, limit, orderBy } = await import('firebase/firestore');
      const { getFirebaseDb } = await import('../../../../config/firebase');

      const db = getFirebaseDb();

      // Fetch data from all collections in parallel
      const [
        leaveRequestsSnapshot,
        performanceGoalsSnapshot,
        performanceReviewsSnapshot,
        assetsSnapshot,
        attendanceSnapshot,
        timeTrackingSnapshot,
        notificationsSnapshot,
        policiesSnapshot
      ] = await Promise.all([
        // Leave Requests
        getDocs(query(
          collection(db, 'leaveRequests'),
          where('employeeId', '==', employeeId),
          limit(10)
        )),

        // Performance Goals
        getDocs(query(
          collection(db, 'performanceGoals'),
          where('employeeId', '==', employeeId),
          limit(10)
        )),

        // Performance Reviews
        getDocs(query(
          collection(db, 'performanceReviews'),
          where('employeeId', '==', employeeId),
          limit(5)
        )),

        // Asset Assignments
        getDocs(query(
          collection(db, 'assetAssignments'),
          where('employeeId', '==', employeeId),
          limit(10)
        )),

        // Attendance Records
        getDocs(query(
          collection(db, 'attendance'),
          where('employeeId', '==', employeeId),
          limit(20)
        )),

        // Time Tracking
        getDocs(query(
          collection(db, 'timeTracking'),
          where('employeeId', '==', employeeId),
          limit(20)
        )),

        // Notifications
        getDocs(query(
          collection(db, 'notifications'),
          where('employeeId', '==', employeeId),
          limit(10)
        )),

        // Policies (recent ones)
        getDocs(query(
          collection(db, 'policies'),
          limit(5)
        ))
      ]);

      // Process the data with timestamp formatting
      setEmployeeLeaveRequests(leaveRequestsSnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          startDate: formatFirestoreTimestamp(data.startDate),
          endDate: formatFirestoreTimestamp(data.endDate),
          submittedAt: formatFirestoreTimestamp(data.submittedAt),
          createdAt: formatFirestoreTimestamp(data.createdAt)
        };
      }));

      setEmployeePerformanceGoals(performanceGoalsSnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: formatFirestoreTimestamp(data.createdAt),
          updatedAt: formatFirestoreTimestamp(data.updatedAt),
          targetDate: formatFirestoreTimestamp(data.targetDate),
          dueDate: formatFirestoreTimestamp(data.dueDate)
        };
      }));

      setEmployeePerformanceReviews(performanceReviewsSnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          reviewDate: formatFirestoreTimestamp(data.reviewDate),
          createdAt: formatFirestoreTimestamp(data.createdAt)
        };
      }));

      setEmployeeAssets(assetsSnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          assignmentDate: formatFirestoreTimestamp(data.assignmentDate),
          assignedDate: formatFirestoreTimestamp(data.assignedDate || data.assignmentDate),
          createdAt: formatFirestoreTimestamp(data.createdAt)
        };
      }));

      setEmployeeAttendance(attendanceSnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          date: formatFirestoreTimestamp(data.date),
          checkIn: formatFirestoreTimestamp(data.checkIn),
          checkOut: formatFirestoreTimestamp(data.checkOut),
          createdAt: formatFirestoreTimestamp(data.createdAt)
        };
      }));

      setEmployeeTimeTracking(timeTrackingSnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          date: formatFirestoreTimestamp(data.date),
          startTime: formatFirestoreTimestamp(data.startTime),
          endTime: formatFirestoreTimestamp(data.endTime),
          createdAt: formatFirestoreTimestamp(data.createdAt)
        };
      }));

      setEmployeeNotifications(notificationsSnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: formatFirestoreTimestamp(data.createdAt)
        };
      }));

      setEmployeePolicies(policiesSnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          effectiveDate: formatFirestoreTimestamp(data.effectiveDate),
          createdAt: formatFirestoreTimestamp(data.createdAt)
        };
      }));

    } catch (error) {
      console.error('Error fetching comprehensive employee data:', error);
    } finally {
      setIsLoadingEmployeeData(false);
    }
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
                  Service: {dataFlowService ? 'Comprehensive Data Flow' : 'Loading...'}
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
                        title="View Employee Details"
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
          <div className="bg-background rounded-lg shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
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

              {/* Additional Information Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Personal Details */}
                <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/30 dark:to-blue-900/30 rounded-lg border border-blue-200 dark:border-blue-800">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Personal Details
                  </h3>
                  <div className="space-y-3">
                    {selectedViewEmployee.gender && (
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Gender</label>
                        <p className="text-sm capitalize">{selectedViewEmployee.gender}</p>
                      </div>
                    )}
                    {selectedViewEmployee.dob && (
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Date of Birth</label>
                        <p className="text-sm">{selectedViewEmployee.dob}</p>
                      </div>
                    )}
                    {selectedViewEmployee.nationalId && (
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">National ID</label>
                        <p className="text-sm font-mono">{selectedViewEmployee.nationalId}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Work Details */}
                <div className="p-4 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/30 dark:to-green-900/30 rounded-lg border border-green-200 dark:border-green-800">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Briefcase className="h-5 w-5" />
                    Work Details
                  </h3>
                  <div className="space-y-3">
                    {selectedViewEmployee.manager && (
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Manager</label>
                        <p className="text-sm">{selectedViewEmployee.manager}</p>
                      </div>
                    )}
                    {selectedViewEmployee.location && (
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">Location</label>
                          <p className="text-sm">{selectedViewEmployee.location}</p>
                        </div>
                      </div>
                    )}
                    {selectedViewEmployee.dateStarted && (
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">Start Date</label>
                          <p className="text-sm">{selectedViewEmployee.dateStarted}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/30 dark:to-purple-900/30 rounded-lg border border-purple-200 dark:border-purple-800">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Mail className="h-5 w-5" />
                  Contact Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {selectedViewEmployee.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Email</label>
                        <p className="text-sm">{selectedViewEmployee.email}</p>
                      </div>
                    </div>
                  )}
                  {selectedViewEmployee.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Phone</label>
                        <p className="text-sm">{selectedViewEmployee.phone}</p>
                      </div>
                    </div>
                  )}
                  {selectedViewEmployee.address && (
                    <div className="flex items-center gap-2 md:col-span-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Address</label>
                        <p className="text-sm">{selectedViewEmployee.address}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Skills & Certifications */}
              {selectedViewEmployee.skills && selectedViewEmployee.skills.length > 0 && (
                <div className="p-4 bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-950/30 dark:to-yellow-900/30 rounded-lg border border-yellow-200 dark:border-yellow-800">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Award className="h-5 w-5" />
                    Skills & Certifications
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {selectedViewEmployee.skills.slice(0, 4).map((skill) => (
                      <div key={skill.id} className="p-3 bg-white/50 dark:bg-black/20 rounded-lg">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="font-medium text-sm">{skill.name}</h4>
                          {skill.certified && <Shield className="h-4 w-4 text-green-600" />}
                        </div>
                        <p className="text-xs text-muted-foreground">{skill.category}</p>
                        <p className="text-xs font-medium capitalize text-purple-600">{skill.level}</p>
                      </div>
                    ))}
                  </div>
                  {selectedViewEmployee.skills.length > 4 && (
                    <p className="text-sm text-muted-foreground mt-2">
                      +{selectedViewEmployee.skills.length - 4} more skills
                    </p>
                  )}
                </div>
              )}

              {/* Banking Information */}
              {selectedViewEmployee.bankingInfo && (
                <div className="p-4 bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-950/30 dark:to-indigo-900/30 rounded-lg border border-indigo-200 dark:border-indigo-800">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    Banking Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Bank</label>
                      <p className="text-sm font-semibold">{selectedViewEmployee.bankingInfo.bankName}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Account Type</label>
                      <p className="text-sm capitalize">{selectedViewEmployee.bankingInfo.accountType}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Account Number</label>
                      <p className="text-sm font-mono">****{selectedViewEmployee.bankingInfo.accountNumber.slice(-4)}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Notes */}
              {selectedViewEmployee.notes && (
                <div className="p-4 bg-gradient-to-r from-gray-50 to-slate-50 dark:from-gray-950/30 dark:to-slate-950/30 rounded-lg border border-gray-200 dark:border-gray-800">
                  <h3 className="text-lg font-semibold mb-4">Notes</h3>
                  <p className="text-sm">{selectedViewEmployee.notes}</p>
                </div>
              )}

              {/* Comprehensive Data Loading Indicator */}
              {isLoadingEmployeeData && (
                <div className="p-4 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-950/30 dark:to-blue-900/30 rounded-lg border border-blue-200 dark:border-blue-800">
                  <div className="flex items-center justify-center gap-2">
                    <Clock className="h-5 w-5 animate-spin text-blue-600" />
                    <span className="text-sm font-medium">Loading comprehensive employee data...</span>
                  </div>
                </div>
              )}

              {/* Leave Requests */}
              {employeeLeaveRequests.length > 0 && (
                <div className="p-4 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/30 dark:to-green-900/30 rounded-lg border border-green-200 dark:border-green-800">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Recent Leave Requests ({employeeLeaveRequests.length})
                  </h3>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {employeeLeaveRequests.slice(0, 5).map((request) => (
                      <div key={request.id} className="p-2 bg-white/50 dark:bg-black/20 rounded text-xs">
                        <div className="flex justify-between items-center">
                          <span className="font-medium">{request.leaveTypeName || 'Leave'}</span>
                          <span className={`px-2 py-1 rounded text-xs ${request.status === 'Approved' ? 'bg-green-100 text-green-800' :
                            request.status === 'Rejected' ? 'bg-red-100 text-red-800' :
                              'bg-yellow-100 text-yellow-800'
                            }`}>
                            {request.status}
                          </span>
                        </div>
                        <p className="text-gray-600 dark:text-gray-400">
                          {request.startDate} - {request.endDate}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Performance Goals */}
              {employeePerformanceGoals.length > 0 && (
                <div className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/30 dark:to-purple-900/30 rounded-lg border border-purple-200 dark:border-purple-800">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Award className="h-5 w-5" />
                    Performance Goals ({employeePerformanceGoals.length})
                  </h3>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {employeePerformanceGoals.slice(0, 5).map((goal) => (
                      <div key={goal.id} className="p-2 bg-white/50 dark:bg-black/20 rounded text-xs">
                        <div className="flex justify-between items-center">
                          <span className="font-medium">{goal.title}</span>
                          <span className={`px-2 py-1 rounded text-xs ${goal.status === 'completed' ? 'bg-green-100 text-green-800' :
                            goal.status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                            {goal.status}
                          </span>
                        </div>
                        <p className="text-gray-600 dark:text-gray-400">
                          Target: {goal.targetValue} | Progress: {goal.currentValue || 0}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Assigned Assets */}
              {employeeAssets.length > 0 && (
                <div className="p-4 bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950/30 dark:to-orange-900/30 rounded-lg border border-orange-200 dark:border-orange-800">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Building className="h-5 w-5" />
                    Assigned Assets ({employeeAssets.length})
                  </h3>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {employeeAssets.slice(0, 5).map((asset) => (
                      <div key={asset.id} className="p-2 bg-white/50 dark:bg-black/20 rounded text-xs">
                        <div className="flex justify-between items-center">
                          <span className="font-medium">{asset.assetName || asset.name}</span>
                          <span className={`px-2 py-1 rounded text-xs ${asset.status === 'assigned' ? 'bg-green-100 text-green-800' :
                            asset.status === 'returned' ? 'bg-gray-100 text-gray-800' :
                              'bg-yellow-100 text-yellow-800'
                            }`}>
                            {asset.status}
                          </span>
                        </div>
                        <p className="text-gray-600 dark:text-gray-400">
                          Assigned: {asset.assignedDate || 'N/A'}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Recent Attendance */}
              {employeeAttendance.length > 0 && (
                <div className="p-4 bg-gradient-to-br from-teal-50 to-teal-100 dark:from-teal-950/30 dark:to-teal-900/30 rounded-lg border border-teal-200 dark:border-teal-800">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Recent Attendance ({employeeAttendance.length} records)
                  </h3>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {employeeAttendance.slice(0, 5).map((record) => (
                      <div key={record.id} className="p-2 bg-white/50 dark:bg-black/20 rounded text-xs">
                        <div className="flex justify-between items-center">
                          <span className="font-medium">{record.date}</span>
                          <span className={`px-2 py-1 rounded text-xs ${record.status === 'present' ? 'bg-green-100 text-green-800' :
                            record.status === 'absent' ? 'bg-red-100 text-red-800' :
                              'bg-yellow-100 text-yellow-800'
                            }`}>
                            {record.status}
                          </span>
                        </div>
                        <p className="text-gray-600 dark:text-gray-400">
                          {record.checkIn} - {record.checkOut || 'Not checked out'}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Recent Notifications */}
              {employeeNotifications.length > 0 && (
                <div className="p-4 bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-950/30 dark:to-indigo-900/30 rounded-lg border border-indigo-200 dark:border-indigo-800">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Mail className="h-5 w-5" />
                    Recent Notifications ({employeeNotifications.length})
                  </h3>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {employeeNotifications.slice(0, 5).map((notification) => (
                      <div key={notification.id} className="p-2 bg-white/50 dark:bg-black/20 rounded text-xs">
                        <div className="flex justify-between items-center">
                          <span className="font-medium">{notification.title}</span>
                          <span className={`px-2 py-1 rounded text-xs ${notification.type === 'urgent' ? 'bg-red-100 text-red-800' :
                            notification.type === 'info' ? 'bg-blue-100 text-blue-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                            {notification.type}
                          </span>
                        </div>
                        <p className="text-gray-600 dark:text-gray-400">
                          {notification.message}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Performance Reviews */}
              {employeePerformanceReviews.length > 0 && (
                <div className="p-4 bg-gradient-to-br from-pink-50 to-pink-100 dark:from-pink-950/30 dark:to-pink-900/30 rounded-lg border border-pink-200 dark:border-pink-800">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Star className="h-5 w-5" />
                    Performance Reviews ({employeePerformanceReviews.length})
                  </h3>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {employeePerformanceReviews.slice(0, 3).map((review) => (
                      <div key={review.id} className="p-2 bg-white/50 dark:bg-black/20 rounded text-xs">
                        <div className="flex justify-between items-center">
                          <span className="font-medium">Review Period: {review.period || 'N/A'}</span>
                          <span className="px-2 py-1 rounded text-xs bg-purple-100 text-purple-800">
                            Rating: {review.overallRating || 'N/A'}
                          </span>
                        </div>
                        <p className="text-gray-600 dark:text-gray-400">
                          Reviewer: {review.reviewerName || 'N/A'}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Recent Policies */}
              {employeePolicies.length > 0 && (
                <div className="p-4 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950/30 dark:to-slate-900/30 rounded-lg border border-slate-200 dark:border-slate-800">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Recent Company Policies ({employeePolicies.length})
                  </h3>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {employeePolicies.slice(0, 3).map((policy) => (
                      <div key={policy.id} className="p-2 bg-white/50 dark:bg-black/20 rounded text-xs">
                        <div className="flex justify-between items-center">
                          <span className="font-medium">{policy.title}</span>
                          <span className={`px-2 py-1 rounded text-xs ${policy.status === 'active' ? 'bg-green-100 text-green-800' :
                            'bg-gray-100 text-gray-800'
                            }`}>
                            {policy.status}
                          </span>
                        </div>
                        <p className="text-gray-600 dark:text-gray-400">
                          Effective: {policy.effectiveDate || 'N/A'}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="p-6 border-t border-border">
              <div className="flex justify-between items-center">
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowViewDialog(false)}
                    className="px-6 py-2 border border-border hover:bg-muted rounded-lg transition-colors"
                  >
                    Close
                  </button>
                  <button
                    onClick={() => {
                      setShowViewDialog(false);
                      navigate(`/hr/employee/${selectedViewEmployee?.id}`);
                    }}
                    className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                  >
                    View Full Profile
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
        </div>
      )}
    </div>
  );
}