export interface Employee {
  id: string; // Changed to string to match Employee Dashboard
  employeeId: string; // Add employeeId field for linking
  avatar?: string;
  name: string;
  email?: string;
  workEmail?: string; // Add work email
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
  // Extended fields from Employee Dashboard
  personalInfo?: {
    firstName: string;
    lastName: string;
    middleName?: string;
    dateOfBirth: Date;
    gender: 'male' | 'female' | 'other';
    nationality: string;
    maritalStatus: 'single' | 'married' | 'divorced' | 'widowed';
    profilePhoto?: string;
    nationalId: string;
    passportNumber?: string;
    driverLicense?: string;
  };
  contactInfo?: {
    email: string;
    workEmail: string;
    phone: string;
    workPhone?: string;
    address: {
      street: string;
      city: string;
      state: string;
      postalCode: string;
      country: string;
    };
  };
  bankingInfo?: {
    bankName: string;
    accountNumber: string;
    routingNumber?: string;
    accountType: 'checking' | 'savings';
    swiftCode?: string;
    iban?: string;
  };
  skills?: Array<{
    id: string;
    name: string;
    category: string;
    level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
    certified: boolean;
    certificationDate?: Date;
    expiryDate?: Date;
  }>;
  emergencyContacts?: Array<{
    id: string;
    name: string;
    relationship: string;
    phone: string;
    email?: string;
    address?: string;
    isPrimary: boolean;
  }>;
} 