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
  Star,
  FileText,
  ChevronDown
} from 'lucide-react';

// Use the imported Employee type from types.ts
import type { Employee } from './types';
import { departmentService } from '../../../../services/departmentService';
import { vercelEmailService } from '../../../../services/vercelEmailService';
import DocumentUpload from '../../../../components/DocumentUpload';
import HRDocumentViewer from '../../../../components/HRDocumentViewer';
import { DocumentMetadata } from '../../../../services/documentMetadataService';

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
import { useCompany } from '../../../../context/CompanyContext';

export default function EmployeeDirectory() {
  const navigate = useNavigate();
  const { companyId, company } = useCompany();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [showContractDialog, setShowContractDialog] = useState(false);
  const [pendingEmployeeData, setPendingEmployeeData] = useState<any>(null);
  const [contractData, setContractData] = useState<any>(null);
  const [setupLink, setSetupLink] = useState<string | null>(null);
  const [selectedViewEmployee, setSelectedViewEmployee] = useState<ViewEmployee | null>(null);
  const [dataFlowService, setDataFlowService] = useState<any>(null);

  // Additional data states for comprehensive employee view
  const [employeeLeaveRequests, setEmployeeLeaveRequests] = useState<any[]>([]);
  const [employeePerformanceGoals, setEmployeePerformanceGoals] = useState<any[]>([]);
  const [employeePerformanceReviews, setEmployeePerformanceReviews] = useState<any[]>([]);
  const [employeeAssets, setEmployeeAssets] = useState<any[]>([]);

  // Document management states
  const [employeeDocuments, setEmployeeDocuments] = useState<DocumentMetadata[]>([]);
  const [loadingDocuments, setLoadingDocuments] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'documents'>('overview');

  // Load employee documents
  const loadEmployeeDocuments = async () => {
    if (!selectedViewEmployee?.id || !companyId) return;

    setLoadingDocuments(true);
    try {
      // Note: HR document viewing will be handled by HRDocumentViewer component
      // This function is kept for compatibility but documents are now loaded by the component
      setEmployeeDocuments([]);
    } catch (error) {
      console.error('❌ [Document Storage] Error loading documents:', error);
      setEmployeeDocuments([]);
    } finally {
      setLoadingDocuments(false);
    }
  };

  // Handle document upload completion
  const handleDocumentUpload = (downloadURL: string, metadata: DocumentMetadata) => {
    setEmployeeDocuments(prev => [...prev, metadata]);
    console.log('✅ [Document Storage] Document uploaded:', metadata.fileName);
  };

  // Handle document deletion
  const handleDocumentDelete = (path: string) => {
    setEmployeeDocuments(prev => prev.filter(doc => doc.publicId !== path));
    console.log('✅ [Document Storage] Document deleted:', path);
  };
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

  // Department options state
  const [departmentOptions, setDepartmentOptions] = useState<Array<{ value: string, label: string }>>([]);
  const [loadingDepartments, setLoadingDepartments] = useState(false);

  // Debug form data changes (removed to prevent excessive re-renders)
  // useEffect(() => {
  //   console.log('Form data changed:', formData);
  // }, [formData]);

  // Initialize employee service and load employees
  useEffect(() => {
    if (!companyId) {
      console.log('⏳ Employee Directory waiting for company...');
      return;
    }

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
  }, [companyId]); // Re-run when company changes for multi-tenancy

  // Load department options when company changes
  useEffect(() => {
    if (!companyId) return;

    const loadDepartments = async () => {
      try {
        setLoadingDepartments(true);
        console.log('📋 [EmployeeDirectory] Loading departments for company:', companyId);

        const options = await departmentService.getDepartmentOptions(companyId);
        setDepartmentOptions(options);

        console.log('✅ [EmployeeDirectory] Loaded departments:', options.length);
      } catch (error) {
        console.error('❌ [EmployeeDirectory] Error loading departments:', error);
        // Set fallback departments
        setDepartmentOptions([
          { value: 'Human Resources', label: 'Human Resources' },
          { value: 'Engineering', label: 'Engineering' },
          { value: 'Marketing', label: 'Marketing' },
          { value: 'Sales', label: 'Sales' },
          { value: 'Finance', label: 'Finance' },
          { value: 'Operations', label: 'Operations' }
        ]);
      } finally {
        setLoadingDepartments(false);
      }
    };

    loadDepartments();
  }, [companyId]);

  const initializeService = async () => {
    try {
      setLoading(true);
      console.log(`🏢 Initializing Employee Directory for ${company?.displayName || 'company'}...`);
      const service = await getComprehensiveDataFlowService();
      console.log('Data flow service initialized:', service);
      setDataFlowService(service);

      // Set up real-time subscription to all employees (filtered by company)
      const unsubscribe = service.subscribeToAllEmployees((allEmployees) => {
        console.log(`📋 Real-time employees update for ${company?.displayName}:`, allEmployees.length);

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
            companyId: safeString(profile.companyId || companyId || ''),
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
      }, companyId); // ← Pass companyId for multi-tenancy filtering!

      // Store the unsubscribe function for cleanup
      return unsubscribe;
    } catch (error) {
      console.error('Error initializing service or loading employees:', error);
      setLoading(false);
    }
  };

  // Auto-generate employee ID based on company name + sequential number
  const generateEmployeeId = async (): Promise<string> => {
    try {
      // Get first 3 letters of company name (uppercase)
      const companyPrefix = (company?.displayName || 'EMP')
        .replace(/[^a-zA-Z]/g, '') // Remove non-letters
        .substring(0, 3)
        .toUpperCase();

      // Get existing employee IDs to find the next available number
      const existingIds = employees.map(emp => emp.employeeId).filter(id => id && id.startsWith(companyPrefix));

      // Extract numbers from existing IDs and find the highest
      const existingNumbers = existingIds
        .map(id => {
          const match = id.match(/\d+$/);
          return match ? parseInt(match[0]) : 0;
        })
        .filter(num => !isNaN(num));

      // Find the next available number
      let nextNumber = 1;
      if (existingNumbers.length > 0) {
        const maxNumber = Math.max(...existingNumbers);
        nextNumber = maxNumber + 1;
      }

      // Generate sequential number (001, 002, etc.)
      const sequentialNumber = String(nextNumber).padStart(3, '0');

      const generatedId = `${companyPrefix}${sequentialNumber}`;

      console.log('✅ Generated Employee ID:', generatedId, {
        companyName: company?.displayName,
        prefix: companyPrefix,
        existingIds: existingIds,
        existingNumbers: existingNumbers,
        nextNumber: nextNumber,
        newId: generatedId
      });

      return generatedId;
    } catch (error) {
      console.error('Error generating employee ID:', error);
      return `EMP${String(Date.now()).slice(-3)}`; // Use timestamp as fallback
    }
  };

  // Create employment contract for new employee
  const createEmployeeContract = async (employeeId: string, contractData: {
    position: string;
    department: string;
    salary: number;
    companyId: string;
    status?: string;
  }) => {
    try {
      console.log('📄 [HR] Creating contract for employee:', employeeId);

      // Import Firebase functions
      const { doc, setDoc, serverTimestamp, getFirestore } = await import('firebase/firestore');
      const db = getFirestore();

      const contractRef = doc(db, 'contracts', employeeId);

      const contract = {
        id: employeeId,
        employeeId: employeeId,
        position: contractData.position,
        department: contractData.department,
        effectiveDate: new Date(),
        terms: {
          salary: contractData.salary,
          currency: 'NGN',
          benefits: [
            'Health Insurance',
            'Annual Leave (21 days)',
            'Sick Leave (10 days)',
            'Maternity/Paternity Leave',
            'Professional Development',
            'Remote Work Allowance'
          ],
          workingHours: '40 hours per week, Monday to Friday',
          probationPeriod: 3
        },
        documentUrl: '', // HR can upload actual contract document later
        status: contractData.status || 'pending_review',
        companyId: contractData.companyId,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      await setDoc(contractRef, contract);
      console.log('✅ [HR] Contract created for employee:', employeeId);

    } catch (error) {
      console.error('❌ [HR] Error creating contract:', error);
    }
  };

  const handleAddEmployee = async () => {
    try {
      console.log('handleAddEmployee called', { formData, dataFlowService });
      if (formData.name && formData.role && formData.department && dataFlowService) {
        console.log('Creating employee with data:', formData);

        // Auto-generate employee ID
        let generatedEmployeeId = await generateEmployeeId();

        // Check if employee with this ID already exists
        const existingEmployee = employees.find(emp => emp.employeeId === generatedEmployeeId);
        if (existingEmployee) {
          console.warn('⚠️ Employee ID already exists, regenerating...', generatedEmployeeId);
          // Regenerate ID by adding a suffix
          const newId = `${generatedEmployeeId}_${Date.now().toString(36).slice(-4)}`;
          console.log('🔄 New unique ID generated:', newId);
          generatedEmployeeId = newId;
        }

        // Generate setup token for password setup link
        const setupToken = Math.random().toString(36).substring(2) + Date.now().toString(36);
        const setupExpiry = new Date();
        setupExpiry.setDate(setupExpiry.getDate() + 7); // 7 days to set password

        // Store employee data for contract editing
        const [firstName, ...lastNameParts] = formData.name.split(' ');
        const lastName = lastNameParts.join(' ') || '';

        const employeeData = {
          employeeId: generatedEmployeeId,
          setupToken,
          setupExpiry,
          firstName,
          lastName,
          email: formData.email || '',
          role: formData.role,
          department: formData.department,
          companyId: companyId!
        };

        // Create default contract data for editing
        const defaultContract = {
          employeeId: generatedEmployeeId,
          position: formData.role,
          department: formData.department,
          effectiveDate: new Date(),
          terms: {
            salary: 500000, // Default salary in NGN
            currency: 'NGN',
            benefits: [
              'Health Insurance',
              'Annual Leave (21 days)',
              'Sick Leave (10 days)',
              'Maternity/Paternity Leave',
              'Professional Development',
              'Remote Work Allowance'
            ],
            workingHours: '40 hours per week, Monday to Friday',
            probationPeriod: 3
          },
          status: 'pending_review'
        };

        // Store data and show contract editor
        setPendingEmployeeData(employeeData);
        setContractData(defaultContract);
        setShowAddDialog(false);
        setShowContractDialog(true);

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
        console.log('🗑️ Deleting employee from Firebase:', id);

        // Delete from Firebase
        const { deleteDoc, doc } = await import('firebase/firestore');
        const { getFirebaseDb } = await import('../../../../config/firebase');
        const db = getFirebaseDb();

        await deleteDoc(doc(db, 'employees', id));

        console.log('✅ Employee deleted successfully from Firebase');

        // Real-time sync will automatically update the UI, but we can also update local state
        setEmployees((prev: Employee[]) => prev.filter((emp: Employee) => emp.id.toString() !== id));
      } catch (error) {
        console.error('❌ Error deleting employee:', error);
        alert('Failed to delete employee. Please try again.');
      }
    }
  };

  // Handle contract status update (for existing employees)
  const handleContractStatusUpdate = async (employeeId: string, newStatus: string) => {
    try {
      console.log('📄 [HR] Updating contract status for employee:', employeeId, 'to:', newStatus);

      // Update contract status in Firestore
      const { doc, updateDoc, getFirestore } = await import('firebase/firestore');
      const db = getFirestore();
      const contractRef = doc(db, 'contracts', employeeId);

      await updateDoc(contractRef, {
        status: newStatus,
        updatedAt: new Date()
      });

      // If changing to "ready_to_send", activate employee and send setup link
      if (newStatus === 'ready_to_send') {
        // Update employee status to active
        await dataFlowService.updateEmployeeProfile(employeeId, {
          profileStatus: {
            status: 'active',
            lastUpdated: new Date(),
            updatedBy: 'hr'
          }
        });

        // Generate and send setup link
        const setupToken = Math.random().toString(36).substring(2) + Date.now().toString(36);
        const setupExpiry = new Date();
        setupExpiry.setDate(setupExpiry.getDate() + 7);

        const setupLink = `https://hris-employee-platform-1l6vdan9g-pam-pam29s-projects.vercel.app/setup?id=${employeeId}&token=${setupToken}`;

        // Find employee data for email
        const employee = employees.find(emp => emp.employeeId === employeeId);
        if (employee) {
          // Send email invitation
          const emailResult = await vercelEmailService.sendEmployeeInvitation({
            employeeName: employee.name,
            employeeId: employeeId,
            setupLink: setupLink,
            companyName: company?.displayName || 'Your Company',
            position: employee.role,
            email: employee.email || 'employee@company.com'
          });

          if (emailResult.success) {
            alert(`✅ Contract marked as "Ready to Send"!\n\n👤 Employee Status: Active\n📧 Email sent to: ${employee.email}\n🔗 Setup Link: ${setupLink}`);
          } else {
            alert(`✅ Contract marked as "Ready to Send"!\n\n👤 Employee Status: Active\n⚠️ Email failed: ${emailResult.error}\n🔗 Manual Setup Link: ${setupLink}`);
          }
        }
      } else if (newStatus === 'pending_review') {
        // Deactivate employee if contract goes back to pending
        await dataFlowService.updateEmployeeProfile(employeeId, {
          profileStatus: {
            status: 'inactive',
            lastUpdated: new Date(),
            updatedBy: 'hr'
          }
        });

        alert(`✅ Contract status updated to "${newStatus}"\n\n👤 Employee Status: Inactive\n💡 Employee will be activated when contract is marked as "Ready to Send"`);
      }

      console.log('✅ [HR] Contract status updated successfully');
    } catch (error) {
      console.error('❌ [HR] Error updating contract status:', error);
      alert('Failed to update contract status. Please try again.');
    }
  };

  // Handle contract editing completion
  const handleContractComplete = async () => {
    try {
      if (!pendingEmployeeData || !contractData) return;

      console.log('📄 [HR] Creating employee with edited contract');

      // Create employee profile
      const newProfile = await dataFlowService.updateEmployeeProfile(pendingEmployeeData.employeeId, {
        companyId: pendingEmployeeData.companyId,
        employeeId: pendingEmployeeData.employeeId,
        personalInfo: {
          firstName: pendingEmployeeData.firstName,
          lastName: pendingEmployeeData.lastName,
          dateOfBirth: new Date()
        },
        contactInfo: {
          personalEmail: pendingEmployeeData.email,
          workEmail: pendingEmployeeData.email,
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
          position: pendingEmployeeData.role,
          department: pendingEmployeeData.department,
          hireDate: new Date(),
          employmentType: 'Full-time',
          workLocation: 'Office',
          workSchedule: '9-5',
          salary: {
            baseSalary: contractData.terms.salary,
            currency: contractData.terms.currency,
            payFrequency: 'Monthly'
          }
        },
        auth: {
          email: pendingEmployeeData.email,
          passwordHash: null,
          password: null,
          setupToken: pendingEmployeeData.setupToken,
          setupExpiry: pendingEmployeeData.setupExpiry,
          isActive: true,
          emailVerified: false,
          lastLogin: null,
          loginCount: 0
        },
        onboarding: {
          status: 'not_started',
          currentStep: 0,
          completedSteps: [],
          startedAt: new Date()
        },
        profileStatus: {
          completeness: 0,
          lastUpdated: new Date(),
          updatedBy: 'hr',
          status: contractData.status === 'ready_to_send' ? 'active' : 'inactive'
        }
      });

      // Create contract with edited terms
      await createEmployeeContract(pendingEmployeeData.employeeId, {
        position: contractData.position,
        department: contractData.department,
        salary: contractData.terms.salary,
        companyId: companyId!,
        status: contractData.status
      });

      // Only send setup link and email if contract is ready to send
      if (contractData.status === 'ready_to_send') {
        // Generate setup link
        const setupLink = `https://hris-employee-platform-1l6vdan9g-pam-pam29s-projects.vercel.app/setup?id=${pendingEmployeeData.employeeId}&token=${pendingEmployeeData.setupToken}`;

        // Send automated email invitation
        console.log('📧 [HR] Sending automated employee invitation email...');
        const emailResult = await vercelEmailService.sendEmployeeInvitation({
          employeeName: `${pendingEmployeeData.firstName} ${pendingEmployeeData.lastName}`,
          employeeId: pendingEmployeeData.employeeId,
          setupLink: setupLink,
          companyName: company?.displayName || 'Your Company',
          position: pendingEmployeeData.role,
          email: pendingEmployeeData.email
        });

        if (emailResult.success) {
          console.log('✅ [HR] Employee invitation email sent successfully');
          alert(`✅ Employee created and invitation email sent successfully!\n\n📧 Email sent to: ${pendingEmployeeData.email}\n\n🔗 Setup Link (click to copy): ${setupLink}\n\n💡 The employee will receive an email with setup instructions.`);
        } else {
          console.warn('⚠️ [HR] Email sending failed:', emailResult.error);

          // Save setup link and keep dialog open for user to copy
          setSetupLink(setupLink);

          // Show notification
          alert(`✅ Employee created successfully!\n\n⚠️ Email sending failed: ${emailResult.error}\n\n📋 The setup link is displayed below - you can copy it.\n\n📧 Send to: ${pendingEmployeeData.email}`);

          // Don't close the dialog - let user continue working with the link visible
          return;
        }
      } else {
        console.log('📄 [HR] Contract saved as pending - employee is inactive until contract is ready to send');
        alert(`✅ Employee created successfully!\n\n📄 Contract Status: ${contractData.status}\n\n👤 Employee Status: Inactive\n\n💡 The employee will become active and receive setup instructions when you mark the contract as "Ready to Send".`);
      }

      setFormData({ name: '', email: '', role: '', department: '' });

    } catch (error) {
      console.error('❌ Error completing contract:', error);
    }
  };

  const openContractDialog = (employee: Employee | ViewEmployee) => {
    setSelectedEmployee(employee as Employee);

    // Initialize contract data for existing employee
    setContractData({
      position: employee.role || '',
      department: employee.department || '',
      effectiveDate: new Date(),
      status: 'pending_review',
      terms: {
        salary: 500000,
        currency: 'NGN',
        benefits: [
          'Health Insurance',
          'Annual Leave (21 days)',
          'Sick Leave (10 days)',
          'Maternity/Paternity Leave',
          'Professional Development',
          'Remote Work Allowance'
        ],
        workingHours: '40 hours per week, Monday to Friday',
        probationPeriod: 3
      }
    });

    setShowContractDialog(true);
  };

  const openEditDialog = (employee: Employee | ViewEmployee) => {
    // Convert ViewEmployee to Employee if needed
    const employeeForEdit: Employee = {
      id: employee.id,
      employeeId: employee.employeeId,
      companyId: employee.companyId || companyId || '',
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
        companyId: safeString(employee.companyId || companyId || ''),
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

      // Fetch data from all collections in parallel (use allSettled to handle permission errors gracefully)
      const results = await Promise.allSettled([
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

      // Extract successful results and handle failed ones gracefully
      const [
        leaveRequestsSnapshot,
        performanceGoalsSnapshot,
        performanceReviewsSnapshot,
        assetsSnapshot,
        attendanceSnapshot,
        timeTrackingSnapshot,
        notificationsSnapshot,
        policiesSnapshot
      ] = results.map((result, index) => {
        if (result.status === 'fulfilled') {
          return result.value;
        } else {
          console.warn(`Failed to fetch data for query ${index}:`, result.reason);
          return { docs: [] }; // Return empty result for failed queries
        }
      });

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
                        onClick={() => openContractDialog(employee)}
                        className="flex items-center gap-1 px-3 py-1.5 hover:bg-orange-500/10 text-orange-600 rounded-lg transition-colors text-sm"
                        title="Manage Contract"
                      >
                        <FileText className="h-4 w-4" />
                        <span>Contract</span>
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
                    <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" />
                    <select
                      value={formData.department}
                      onChange={(e) => setFormData(prev => ({ ...prev, department: e.target.value }))}
                      className="w-full pl-10 pr-10 py-2 border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-colors appearance-none cursor-pointer"
                      disabled={loadingDepartments}
                      required
                    >
                      <option value="">
                        {loadingDepartments ? 'Loading departments...' : 'Select department'}
                      </option>
                      {departmentOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
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

      {/* Contract Editor Dialog */}
      {showContractDialog && (pendingEmployeeData || selectedEmployee) && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
          <div className="card-modern w-full max-w-4xl m-4 animate-slide-in max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <FileText className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-foreground">
                      {pendingEmployeeData ? 'Create Employment Contract' : 'Edit Employment Contract'}
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      {pendingEmployeeData
                        ? `Review and customize the contract for ${pendingEmployeeData?.firstName} ${pendingEmployeeData?.lastName}`
                        : `Manage contract for ${selectedEmployee?.name || 'Employee'}`
                      }
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowContractDialog(false);
                    setPendingEmployeeData(null);
                    setContractData(null);
                    setSelectedEmployee(null);
                  }}
                  className="p-2 hover:bg-muted rounded-lg transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="space-y-6">
                {/* Basic Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-blue-50 rounded-lg">
                  <div>
                    <label className="text-sm font-medium text-blue-900">Position</label>
                    <input
                      type="text"
                      value={contractData.position}
                      onChange={(e) => setContractData(prev => ({ ...prev, position: e.target.value }))}
                      className="w-full mt-1 px-3 py-2 border border-blue-200 rounded-lg bg-white text-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-blue-900">Department</label>
                    <input
                      type="text"
                      value={contractData.department}
                      onChange={(e) => setContractData(prev => ({ ...prev, department: e.target.value }))}
                      className="w-full mt-1 px-3 py-2 border border-blue-200 rounded-lg bg-white text-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-blue-900">Effective Date</label>
                    <input
                      type="date"
                      value={contractData.effectiveDate.toISOString().split('T')[0]}
                      onChange={(e) => setContractData(prev => ({ ...prev, effectiveDate: new Date(e.target.value) }))}
                      className="w-full mt-1 px-3 py-2 border border-blue-200 rounded-lg bg-white text-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-blue-900">Status</label>
                    <select
                      value={contractData.status}
                      onChange={(e) => setContractData(prev => ({ ...prev, status: e.target.value }))}
                      className="w-full mt-1 px-3 py-2 border border-blue-200 rounded-lg bg-white text-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="pending_review">Pending Review</option>
                      <option value="draft">Draft</option>
                      <option value="ready_to_send">Ready to Send</option>
                    </select>
                  </div>
                </div>

                {/* Contract Terms */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-foreground">Contract Terms</h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-foreground">Salary (NGN)</label>
                      <input
                        type="number"
                        value={contractData.terms.salary}
                        onChange={(e) => setContractData(prev => ({
                          ...prev,
                          terms: { ...prev.terms, salary: parseInt(e.target.value) || 0 }
                        }))}
                        className="w-full mt-1 px-3 py-2 border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-foreground">Probation Period (months)</label>
                      <input
                        type="number"
                        value={contractData.terms.probationPeriod}
                        onChange={(e) => setContractData(prev => ({
                          ...prev,
                          terms: { ...prev.terms, probationPeriod: parseInt(e.target.value) || 3 }
                        }))}
                        className="w-full mt-1 px-3 py-2 border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-foreground">Working Hours</label>
                    <input
                      type="text"
                      value={contractData.terms.workingHours}
                      onChange={(e) => setContractData(prev => ({
                        ...prev,
                        terms: { ...prev.terms, workingHours: e.target.value }
                      }))}
                      className="w-full mt-1 px-3 py-2 border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                      placeholder="e.g., 40 hours per week, Monday to Friday"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-foreground">Benefits</label>
                    <div className="mt-2 space-y-2">
                      {contractData.terms.benefits.map((benefit: string, index: number) => (
                        <div key={index} className="flex gap-2">
                          <input
                            type="text"
                            value={benefit}
                            onChange={(e) => {
                              const newBenefits = [...contractData.terms.benefits];
                              newBenefits[index] = e.target.value;
                              setContractData(prev => ({
                                ...prev,
                                terms: { ...prev.terms, benefits: newBenefits }
                              }));
                            }}
                            className="flex-1 px-3 py-2 border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                          />
                          <button
                            onClick={() => {
                              const newBenefits = contractData.terms.benefits.filter((_: any, i: number) => i !== index);
                              setContractData(prev => ({
                                ...prev,
                                terms: { ...prev.terms, benefits: newBenefits }
                              }));
                            }}
                            className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                      <button
                        onClick={() => {
                          setContractData(prev => ({
                            ...prev,
                            terms: { ...prev.terms, benefits: [...prev.terms.benefits, ''] }
                          }));
                        }}
                        className="flex items-center gap-2 px-3 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors text-sm"
                      >
                        <UserPlus className="h-4 w-4" />
                        Add Benefit
                      </button>
                    </div>
                  </div>
                </div>

                {/* Contract Preview */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-foreground">Contract Preview</h3>
                  <div className="p-4 border rounded-lg bg-gray-50 max-h-60 overflow-y-auto">
                    <div className="text-sm space-y-2">
                      <p><strong>Employee ID:</strong> {pendingEmployeeData?.employeeId || 'N/A'}</p>
                      <p><strong>Position:</strong> {contractData?.position || 'N/A'}</p>
                      <p><strong>Department:</strong> {contractData?.department || 'N/A'}</p>
                      <p><strong>Effective Date:</strong> {contractData?.effectiveDate?.toLocaleDateString() || 'N/A'}</p>
                      <p><strong>Salary:</strong> NGN {contractData?.terms?.salary?.toLocaleString() || 'N/A'} per month</p>
                      <p><strong>Working Hours:</strong> {contractData?.terms?.workingHours || 'N/A'}</p>
                      <p><strong>Probation Period:</strong> {contractData?.terms?.probationPeriod || 'N/A'} months</p>
                      <p><strong>Benefits:</strong></p>
                      <ul className="list-disc list-inside ml-4">
                        {contractData?.terms?.benefits?.map((benefit: string, index: number) => (
                          <li key={index}>{benefit}</li>
                        )) || <li>No benefits specified</li>}
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Setup Link Display (shown after employee creation) */}
                {setupLink && (
                  <div className="space-y-2 p-4 border border-blue-200 rounded-lg bg-blue-50">
                    <h3 className="text-sm font-semibold text-blue-900">📧 Employee Setup Link</h3>
                    <p className="text-xs text-blue-700">Copy this link and send it to the employee:</p>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={setupLink}
                        readOnly
                        className="flex-1 px-3 py-2 border border-blue-300 rounded bg-white text-sm font-mono"
                        onClick={(e) => (e.target as HTMLInputElement).select()}
                      />
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(setupLink);
                          alert('✅ Link copied to clipboard!');
                        }}
                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                      >
                        Copy
                      </button>
                    </div>
                    <p className="text-xs text-blue-600">Send to: {pendingEmployeeData?.email}</p>
                  </div>
                )}
              </div>

              <div className="flex gap-3 mt-6 pt-4 border-t border-border">
                <button
                  onClick={() => {
                    setShowContractDialog(false);
                    setPendingEmployeeData(null);
                    setContractData(null);
                    setSelectedEmployee(null);
                  }}
                  className="flex-1 px-4 py-2 border border-input rounded-lg hover:bg-muted/50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={pendingEmployeeData ? handleContractComplete : () => handleContractStatusUpdate(selectedEmployee!.employeeId, contractData?.status || 'pending_review')}
                  className="flex-1 px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg shadow-soft hover:shadow-soft-lg transition-all duration-200"
                >
                  {pendingEmployeeData ? 'Create Employee & Send Contract' : 'Update Contract Status'}
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
                    <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" />
                    <select
                      value={formData.department}
                      onChange={(e) => setFormData(prev => ({ ...prev, department: e.target.value }))}
                      className="w-full pl-10 pr-10 py-2 border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-colors appearance-none cursor-pointer"
                      disabled={loadingDepartments}
                      required
                    >
                      <option value="">
                        {loadingDepartments ? 'Loading departments...' : 'Select department'}
                      </option>
                      {departmentOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
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
              <div className="flex items-center justify-between mb-4">
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

              {/* Tabs */}
              <div className="flex space-x-1 bg-muted p-1 rounded-lg">
                <button
                  onClick={() => setActiveTab('overview')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'overview'
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                    }`}
                >
                  Overview
                </button>
                <button
                  onClick={() => {
                    setActiveTab('documents');
                    loadEmployeeDocuments();
                  }}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'documents'
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                    }`}
                >
                  Documents
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Tab Content */}
              {activeTab === 'overview' && (
                <>
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
                      <div className="flex-1">
                        <label className="text-sm font-medium text-muted-foreground">Employee Status</label>
                        <p className="text-lg font-semibold">{selectedViewEmployee.status}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className={`px-3 py-1 rounded-full text-sm font-medium ${selectedViewEmployee.status === 'Active' || selectedViewEmployee.status === 'active'
                          ? 'bg-green-100 text-green-800 border border-green-200'
                          : selectedViewEmployee.status === 'Inactive' || selectedViewEmployee.status === 'inactive'
                            ? 'bg-red-100 text-red-800 border border-red-200'
                            : 'bg-yellow-100 text-yellow-800 border border-yellow-200'
                          }`}>
                          {selectedViewEmployee.status}
                        </div>
                        <button
                          onClick={async () => {
                            const newStatus = (selectedViewEmployee.status === 'Active' || selectedViewEmployee.status === 'active') ? 'Inactive' : 'Active';
                            try {
                              if (dataFlowService) {
                                console.log(`🔄 Changing employee ${selectedViewEmployee.id} status to ${newStatus}`);

                                // Update employee status in Firebase
                                await dataFlowService.updateEmployeeProfile(selectedViewEmployee.id, {
                                  status: newStatus
                                });

                                // Update the popup view state
                                setSelectedViewEmployee({
                                  ...selectedViewEmployee,
                                  status: newStatus
                                });

                                // Update ONLY this employee in the local list (don't refresh all)
                                setEmployees(prevEmployees =>
                                  prevEmployees.map(emp =>
                                    emp.id === selectedViewEmployee.id
                                      ? { ...emp, status: newStatus }
                                      : emp  // Keep other employees unchanged
                                  )
                                );

                                console.log(`✅ Employee ${selectedViewEmployee.name} status updated to ${newStatus}`);
                                alert(`Employee status changed to ${newStatus}`);
                              }
                            } catch (error) {
                              console.error('❌ Error updating status:', error);
                              alert('Failed to update employee status');
                            }
                          }}
                          className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${(selectedViewEmployee.status === 'Active' || selectedViewEmployee.status === 'active')
                            ? 'bg-red-100 text-red-700 hover:bg-red-200 border border-red-300'
                            : 'bg-green-100 text-green-700 hover:bg-green-200 border border-green-300'
                            }`}
                        >
                          {(selectedViewEmployee.status === 'Active' || selectedViewEmployee.status === 'active') ? 'Mark as Inactive' : 'Mark as Active'}
                        </button>
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
                        {(selectedViewEmployee.personalInfo?.firstName || selectedViewEmployee.personalInfo?.lastName) && (
                          <div>
                            <label className="text-sm font-medium text-muted-foreground">Full Name</label>
                            <p className="text-sm">
                              {selectedViewEmployee.personalInfo?.firstName} {selectedViewEmployee.personalInfo?.middleName} {selectedViewEmployee.personalInfo?.lastName}
                            </p>
                          </div>
                        )}
                        {(selectedViewEmployee.gender || selectedViewEmployee.personalInfo?.gender) && (
                          <div>
                            <label className="text-sm font-medium text-muted-foreground">Gender</label>
                            <p className="text-sm capitalize">{selectedViewEmployee.personalInfo?.gender || selectedViewEmployee.gender}</p>
                          </div>
                        )}
                        {(selectedViewEmployee.dob || selectedViewEmployee.personalInfo?.dateOfBirth) && (
                          <div>
                            <label className="text-sm font-medium text-muted-foreground">Date of Birth</label>
                            <p className="text-sm">{selectedViewEmployee.personalInfo?.dateOfBirth || selectedViewEmployee.dob}</p>
                          </div>
                        )}
                        {(selectedViewEmployee.personalInfo?.nationality) && (
                          <div>
                            <label className="text-sm font-medium text-muted-foreground">Nationality</label>
                            <p className="text-sm">{selectedViewEmployee.personalInfo?.nationality}</p>
                          </div>
                        )}
                        {(selectedViewEmployee.personalInfo?.maritalStatus) && (
                          <div>
                            <label className="text-sm font-medium text-muted-foreground">Marital Status</label>
                            <p className="text-sm capitalize">{selectedViewEmployee.personalInfo?.maritalStatus}</p>
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
                </>
              )}

              {/* Documents Tab */}
              {activeTab === 'documents' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-semibold text-foreground">Employee Documents</h3>
                    <div className="text-sm text-muted-foreground">
                      View and manage employee documents
                    </div>
                  </div>

                  <HRDocumentViewer
                    companyId={companyId || ''}
                    employeeId={selectedViewEmployee.id}
                    employeeName={`${selectedViewEmployee.personalInfo?.firstName || ''} ${selectedViewEmployee.personalInfo?.lastName || ''}`.trim()}
                  />
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