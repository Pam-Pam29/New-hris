import React, { useState } from 'react';
import { Button } from '../../../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../components/ui/card';
import { TypographyH2, TypographyH3 } from '../../../../components/ui/typography';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../../components/ui/select';
import { Input } from '../../../../components/ui/input';
import { Badge } from '../../../../components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../../../components/ui/dialog';
import { 
  Briefcase, 
  Users, 
  TrendingUp, 
  Clock, 
  CheckCircle, 
  AlertTriangle,
  Plus,
  Filter,
  Search,
  Eye,
  Edit,
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  DollarSign,
  Building
} from 'lucide-react';

// Mock data
const mockJobs = [
  { 
    id: 1, 
    title: 'Senior Frontend Developer', 
    company: 'TechCorp', 
    location: 'San Francisco, CA', 
    type: 'Full-time', 
    salary: '$120k - $150k', 
    status: 'Active', 
    applications: 24, 
    posted: '2025-01-15',
    department: 'Engineering'
  },
  { 
    id: 2, 
    title: 'Marketing Manager', 
    company: 'Growth Inc', 
    location: 'New York, NY', 
    type: 'Full-time', 
    salary: '$90k - $110k', 
    status: 'Active', 
    applications: 18, 
    posted: '2025-01-10',
    department: 'Marketing'
  },
  { 
    id: 3, 
    title: 'UX Designer', 
    company: 'Design Studio', 
    location: 'Remote', 
    type: 'Contract', 
    salary: '$80k - $100k', 
    status: 'Active', 
    applications: 31, 
    posted: '2025-01-08',
    department: 'Design'
  },
  { 
    id: 4, 
    title: 'Data Scientist', 
    company: 'Analytics Pro', 
    location: 'Austin, TX', 
    type: 'Full-time', 
    salary: '$130k - $160k', 
    status: 'Closed', 
    applications: 42, 
    posted: '2024-12-20',
    department: 'Data Science'
  },
];

const mockCandidates = [
  { 
    id: 1, 
    name: 'Sarah Chen', 
    email: 'sarah.chen@email.com', 
    phone: '+1 (555) 123-4567', 
    position: 'Senior Frontend Developer', 
    status: 'Interview Scheduled', 
    experience: '5 years', 
    location: 'San Francisco, CA',
    avatar: 'SC'
  },
  { 
    id: 2, 
    name: 'Michael Rodriguez', 
    email: 'm.rodriguez@email.com', 
    phone: '+1 (555) 987-6543', 
    position: 'Marketing Manager', 
    status: 'Under Review', 
    experience: '7 years', 
    location: 'New York, NY',
    avatar: 'MR'
  },
  { 
    id: 3, 
    name: 'Emily Watson', 
    email: 'emily.w@email.com', 
    phone: '+1 (555) 456-7890', 
    position: 'UX Designer', 
    status: 'Hired', 
    experience: '4 years', 
    location: 'Remote',
    avatar: 'EW'
  },
];

const jobStatuses = ['All Statuses', 'Active', 'Closed', 'Draft'];
const departments = ['All Departments', 'Engineering', 'Marketing', 'Design', 'Data Science', 'Sales', 'HR'];

export default function Recruitment() {
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [selectedDepartment, setSelectedDepartment] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [jobDialogOpen, setJobDialogOpen] = useState(false);
  const [candidateDialogOpen, setCandidateDialogOpen] = useState(false);

  // Filter logic
  const filteredJobs = mockJobs.filter(job =>
    (!selectedStatus || selectedStatus === 'All Statuses' || job.status === selectedStatus) &&
    (!selectedDepartment || selectedDepartment === 'All Departments' || job.department === selectedDepartment) &&
    (!searchQuery || job.title.toLowerCase().includes(searchQuery.toLowerCase()) || job.company.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Summary stats
  const totalJobs = mockJobs.length;
  const activeJobs = mockJobs.filter(job => job.status === 'Active').length;
  const totalApplications = mockJobs.reduce((sum, job) => sum + job.applications, 0);
  const averageApplications = Math.round(totalApplications / totalJobs);
  const hiredCandidates = mockCandidates.filter(candidate => candidate.status === 'Hired').length;

  return (
    <div className="p-8 min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Header Section */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
            <Briefcase className="h-6 w-6 text-green-600 dark:text-green-400" />
          </div>
          <div>
            <TypographyH2 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
              Recruitment
            </TypographyH2>
            <p className="text-muted-foreground text-sm">Find and hire the best talent for your organization</p>
          </div>
        </div>
      </div>

      {/* Filters Section */}
      <Card className="mb-8 border-0 shadow-lg bg-card/50 backdrop-blur-sm">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <TypographyH3 className="text-lg font-semibold">Search & Filters</TypographyH3>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 items-end">
            <div className="flex-1 space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Search Jobs</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Search by job title or company..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex-1 space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Job Status</label>
              <Select value={selectedStatus || "all"} onValueChange={(value) => setSelectedStatus(value === "all" ? null : value)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  {jobStatuses.slice(1).map(status => <SelectItem key={status} value={status}>{status}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1 space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Department</label>
              <Select value={selectedDepartment || "all"} onValueChange={(value) => setSelectedDepartment(value === "all" ? null : value)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="All Departments" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Departments</SelectItem>
                  {departments.slice(1).map(dept => <SelectItem key={dept} value={dept}>{dept}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <Button className="bg-green-600 hover:bg-green-700 text-white px-6">
              <Plus className="h-4 w-4 mr-2" />
              Post Job
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
        <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/20 dark:to-green-900/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Total Jobs</p>
                <p className="text-3xl font-bold text-green-600 dark:text-green-400">{totalJobs}</p>
              </div>
              <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-full">
                <Briefcase className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/20 dark:to-blue-900/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Active Jobs</p>
                <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{activeJobs}</p>
              </div>
              <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                <CheckCircle className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/20 dark:to-purple-900/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Total Applications</p>
                <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">{totalApplications}</p>
              </div>
              <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-full">
                <Users className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950/20 dark:to-orange-900/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Avg Applications</p>
                <p className="text-3xl font-bold text-orange-600 dark:text-orange-400">{averageApplications}</p>
              </div>
              <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-full">
                <TrendingUp className="h-6 w-6 text-orange-600 dark:text-orange-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-950/20 dark:to-indigo-900/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Hired This Month</p>
                <p className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">{hiredCandidates}</p>
              </div>
              <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-full">
                <CheckCircle className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Job Listings */}
      <Card className="mb-8 border-0 shadow-lg bg-card/50 backdrop-blur-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Briefcase className="h-4 w-4 text-muted-foreground" />
              <TypographyH3 className="text-lg font-semibold">Open Positions</TypographyH3>
            </div>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white" onClick={() => setJobDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Job
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredJobs.map((job) => (
              <Card key={job.id} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-card to-card/80">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1 pr-4">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-full">
                          <Building className="h-4 w-4 text-green-600 dark:text-green-400" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-lg text-foreground">{job.title}</h4>
                          <p className="text-sm text-muted-foreground">{job.company}</p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground mb-4">
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4" />
                          <span>{job.location}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          <span>{job.type}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-4 w-4" />
                          <span>{job.salary}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          <span>Posted {job.posted}</span>
                        </div>
                      </div>
                    </div>
                    <Badge 
                      className={
                        job.status === 'Active' ? 'bg-green-100 text-green-800 border-green-200 px-3 py-1' :
                        job.status === 'Closed' ? 'bg-red-100 text-red-800 border-red-200 px-3 py-1' :
                        'bg-gray-100 text-gray-800 border-gray-200 px-3 py-1'
                      }
                    >
                      {job.status}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between pt-4 border-t border-border/50">
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        {job.applications} applications
                      </span>
                      <span className="text-xs bg-muted px-2 py-1 rounded">{job.department}</span>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" className="hover:bg-blue-50 hover:border-blue-200 hover:text-blue-700">
                        <Eye className="h-3 w-3 mr-1" />
                        View
                      </Button>
                      <Button size="sm" variant="outline" className="hover:bg-green-50 hover:border-green-200 hover:text-green-700">
                        <Edit className="h-3 w-3 mr-1" />
                        Edit
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Top Candidates */}
      <Card className="border-0 shadow-lg bg-card/50 backdrop-blur-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <TypographyH3 className="text-lg font-semibold">Top Candidates</TypographyH3>
            </div>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white" onClick={() => setCandidateDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Candidate
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border/50">
                  <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Candidate</th>
                  <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Position</th>
                  <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Experience</th>
                  <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Location</th>
                  <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Status</th>
                  <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {mockCandidates.map((candidate) => (
                  <tr key={candidate.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-muted rounded-full">
                          <span className="text-sm font-semibold text-muted-foreground">{candidate.avatar}</span>
                        </div>
                        <div>
                          <p className="font-medium">{candidate.name}</p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Mail className="h-3 w-3" />
                            <span>{candidate.email}</span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">{candidate.position}</td>
                    <td className="px-4 py-3">{candidate.experience}</td>
                    <td className="px-4 py-3">{candidate.location}</td>
                    <td className="px-4 py-3">
                      <Badge 
                        className={
                          candidate.status === 'Hired' ? 'bg-green-100 text-green-800 border-green-200 px-3 py-1' :
                          candidate.status === 'Interview Scheduled' ? 'bg-blue-100 text-blue-800 border-blue-200 px-3 py-1' :
                          'bg-orange-100 text-orange-800 border-orange-200 px-3 py-1'
                        }
                      >
                        {candidate.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" className="hover:bg-blue-50 hover:border-blue-200 hover:text-blue-700">
                          <Eye className="h-3 w-3 mr-1" />
                          View
                        </Button>
                        <Button size="sm" variant="outline" className="hover:bg-green-50 hover:border-green-200 hover:text-green-700">
                          <Edit className="h-3 w-3 mr-1" />
                          Edit
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Add Job Dialog */}
      <Dialog open={jobDialogOpen} onOpenChange={setJobDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">Post New Job</DialogTitle>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Job Title</label>
                <Input placeholder="e.g., Senior Developer" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Department</label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.slice(1).map(dept => <SelectItem key={dept} value={dept}>{dept}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Location</label>
                <Input placeholder="e.g., San Francisco, CA" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Job Type</label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="full-time">Full-time</SelectItem>
                    <SelectItem value="part-time">Part-time</SelectItem>
                    <SelectItem value="contract">Contract</SelectItem>
                    <SelectItem value="internship">Internship</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Salary Range</label>
              <Input placeholder="e.g., $80k - $120k" />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Job Description</label>
              <textarea 
                className="w-full p-3 border border-border rounded-md resize-none h-32 focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Describe the role, responsibilities, and requirements..."
              />
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button variant="outline" onClick={() => setJobDialogOpen(false)}>
                Cancel
              </Button>
              <Button className="bg-green-600 hover:bg-green-700 text-white">
                Post Job
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Candidate Dialog */}
      <Dialog open={candidateDialogOpen} onOpenChange={setCandidateDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">Add New Candidate</DialogTitle>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Full Name</label>
                <Input placeholder="e.g., John Doe" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Email</label>
                <Input placeholder="john.doe@email.com" />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Phone</label>
                <Input placeholder="+1 (555) 123-4567" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Position</label>
                <Input placeholder="e.g., Senior Developer" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Experience</label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select experience" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="entry">Entry Level (0-2 years)</SelectItem>
                    <SelectItem value="mid">Mid Level (3-5 years)</SelectItem>
                    <SelectItem value="senior">Senior Level (6+ years)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Location</label>
                <Input placeholder="e.g., San Francisco, CA" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Notes</label>
              <textarea 
                className="w-full p-3 border border-border rounded-md resize-none h-24 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Add any additional notes about the candidate..."
              />
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button variant="outline" onClick={() => setCandidateDialogOpen(false)}>
                Cancel
              </Button>
              <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                Add Candidate
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
