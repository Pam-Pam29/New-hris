export interface Employee {
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