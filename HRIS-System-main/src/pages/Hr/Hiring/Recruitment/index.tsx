import React, { useState, useEffect, useMemo } from 'react';
import { Button } from '../../../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../components/ui/card';
import { TypographyH2, TypographyH3 } from '../../../../components/ui/typography';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../../components/ui/select';
import { Input } from '../../../../components/ui/input';
import { Badge } from '../../../../components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../../../components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../../components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../../components/ui/table';
import {
  Briefcase,
  Users,
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
  MapPin,
  Calendar,
  DollarSign,
  Building,
  Loader2,
  X,
  FileText,
  Phone
} from 'lucide-react';

// Import Firebase services
import { getServiceConfig } from '../../../../config/firebase';
import { RecruitmentCandidate, Interview, Offer } from '../../../../services/recruitmentService';
import { JobPosting } from '../../../../services/jobBoardService';

// Import UI components
import { Label } from '../../../../components/ui/label';
import { Textarea } from '../../../../components/ui/textarea';
import { Alert, AlertDescription } from '../../../../components/ui/alert';
import { useToast } from '../../../../hooks/use-toast';

// Firebase service instances
const { db } = getServiceConfig();
let recruitmentServiceInstance: any = null;
let jobBoardServiceInstance: any = null;

// Initialize services
const getRecruitmentService = async () => {
  if (!recruitmentServiceInstance) {
    const { FirebaseRecruitmentService } = await import('../../../../services/recruitmentService');
    recruitmentServiceInstance = new FirebaseRecruitmentService(db);
  }
  return recruitmentServiceInstance;
};

const getJobBoardService = async () => {
  if (!jobBoardServiceInstance) {
    const { FirebaseJobBoardService } = await import('../../../../services/jobBoardService');
    jobBoardServiceInstance = new FirebaseJobBoardService(db);
  }
  return jobBoardServiceInstance;
};

  function RecruitmentComponent() {
  const [candidates, setCandidates] = useState<RecruitmentCandidate[]>([]);
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [openPositions, setOpenPositions] = useState<JobPosting[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Dialog states
  const [addCandidateOpen, setAddCandidateOpen] = useState(false);
  const [viewCandidateOpen, setViewCandidateOpen] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState<RecruitmentCandidate | null>(null);
  const [addInterviewOpen, setAddInterviewOpen] = useState(false);
  
  // Form states
  const [newCandidate, setNewCandidate] = useState({
    name: '',
    email: '',
    phone: '',
    position: '',
    status: 'new' as const,
    resumeUrl: '',
    skills: [] as string[],
    experience: '',
    notes: ''
  });
  
  const { toast } = useToast();
  
  // Fetch data on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Get recruitment service
        const recruitmentService = await getRecruitmentService();
        const jobBoardService = await getJobBoardService();
        
        // Fetch candidates
        const candidatesData = await recruitmentService.getCandidates();
        setCandidates(candidatesData);
        
        // Fetch open positions
        const positions = await jobBoardService.getJobPostings();
        setOpenPositions(positions.filter(p => p.status === 'published'));
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching recruitment data:', err);
        setError('Failed to load recruitment data. Please try again.');
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  // Handle adding a new candidate
  const handleAddCandidate = async () => {
    try {
      const recruitmentService = await getRecruitmentService();
      await recruitmentService.addCandidate(newCandidate);
      
      // Refresh candidates list
      const candidatesData = await recruitmentService.getCandidates();
      setCandidates(candidatesData);
      
      // Close dialog and reset form
      setAddCandidateOpen(false);
      setNewCandidate({
        name: '',
        email: '',
        phone: '',
        position: '',
        status: 'new',
        resumeUrl: '',
        skills: [],
        experience: '',
        notes: ''
      });
      
      toast({
        title: 'Success',
        description: 'Candidate added successfully',
      });
    } catch (err) {
      console.error('Error adding candidate:', err);
      toast({
        title: 'Error',
        description: 'Failed to add candidate. Please try again.',
        variant: 'destructive',
      });
    }
  };
  
  // Handle updating candidate status
  const handleUpdateCandidateStatus = async (id: string, status: RecruitmentCandidate['status']) => {
    try {
      const recruitmentService = await getRecruitmentService();
      await recruitmentService.updateCandidateStatus(id, status);
      
      // Update local state
      setCandidates(prev => 
        prev.map(candidate => 
          candidate.id === id ? { ...candidate, status } : candidate
        )
      );
      
      toast({
        title: 'Success',
        description: 'Candidate status updated',
      });
    } catch (err) {
      console.error('Error updating candidate status:', err);
      toast({
        title: 'Error',
        description: 'Failed to update candidate status',
        variant: 'destructive',
      });
    }
  };
  
  // View candidate details
  const viewCandidate = (candidate: RecruitmentCandidate) => {
    setSelectedCandidate(candidate);
    setViewCandidateOpen(true);
  };
  
  // Get status badge color
  const getStatusColor = (status: RecruitmentCandidate['status']) => {
    switch (status) {
      case 'new': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'screening': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400';
      case 'interviewing': return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400';
      case 'offer': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'hired': return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400';
      case 'rejected': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400';
    }
  };


  return (
    <div className="p-8 min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Header Section */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
            <Users className="h-6 w-6 text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <TypographyH2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
              Recruitment
            </TypographyH2>
            <p className="text-muted-foreground text-sm">Manage candidates, interviews, and hiring process</p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card className="border-0 shadow-lg bg-card/50 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <div className="text-2xl font-bold">{candidates.length}</div>
                <div className="text-sm text-muted-foreground">Total Candidates</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-card/50 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
                <Clock className="h-6 w-6 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <div className="text-2xl font-bold">
                  {candidates.filter(c => c.status === 'interviewing').length}
                </div>
                <div className="text-sm text-muted-foreground">In Interview Process</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-card/50 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <div className="text-2xl font-bold">
                  {candidates.filter(c => c.status === 'hired').length}
                </div>
                <div className="text-sm text-muted-foreground">Hired This Month</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-card/50 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
                <Briefcase className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div>
                <div className="text-2xl font-bold">{openPositions.length}</div>
                <div className="text-sm text-muted-foreground">Open Positions</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="mb-8">
        <Tabs defaultValue="candidates" className="w-full">
          <div className="flex items-center justify-between mb-4">
            <TabsList>
              <TabsTrigger value="candidates">Candidates</TabsTrigger>
              <TabsTrigger value="interviews">Interviews</TabsTrigger>
              <TabsTrigger value="offers">Offers</TabsTrigger>
            </TabsList>
            <Button onClick={() => setAddCandidateOpen(true)}>
              <Plus className="mr-2 h-4 w-4" /> Add Candidate
            </Button>
          </div>

          <TabsContent value="candidates" className="space-y-4">
            {loading ? (
              <div className="flex justify-center items-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : error ? (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            ) : (
              <Card>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle>All Candidates</CardTitle>
                    <div className="flex items-center gap-2">
                      <div className="relative">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                          type="search"
                          placeholder="Search candidates..."
                          className="pl-8 w-[200px] md:w-[300px]"
                        />
                      </div>
                      <Button variant="outline" size="icon">
                        <Filter className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Position</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Skills</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {candidates.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                            No candidates found. Add your first candidate to get started.
                          </TableCell>
                        </TableRow>
                      ) : (
                        candidates.map((candidate) => (
                          <TableRow key={candidate.id}>
                            <TableCell>
                              <div className="font-medium">{candidate.name}</div>
                              <div className="text-sm text-muted-foreground">{candidate.email}</div>
                            </TableCell>
                            <TableCell>{candidate.position}</TableCell>
                            <TableCell>
                              <Badge className={`${getStatusColor(candidate.status)}`}>
                                {candidate.status.charAt(0).toUpperCase() + candidate.status.slice(1)}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex flex-wrap gap-1">
                                {candidate.skills.slice(0, 3).map((skill, i) => (
                                  <Badge key={i} variant="outline" className="text-xs">
                                    {skill}
                                  </Badge>
                                ))}
                                {candidate.skills.length > 3 && (
                                  <Badge variant="outline" className="text-xs">
                                    +{candidate.skills.length - 3}
                                  </Badge>
                                )}
                              </div>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => viewCandidate(candidate)}
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="icon">
                                  <Edit className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="interviews">
            <Card>
              <CardHeader>
                <CardTitle>Upcoming Interviews</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Interview scheduling functionality coming soon.</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="offers">
            <Card>
              <CardHeader>
                <CardTitle>Pending Offers</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Offer management functionality coming soon.</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Add Candidate Dialog */}
      <Dialog open={addCandidateOpen} onOpenChange={setAddCandidateOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Add New Candidate</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={newCandidate.name}
                  onChange={(e) => setNewCandidate({ ...newCandidate, name: e.target.value })}
                  placeholder="John Doe"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="position">Position</Label>
                <Select
                  value={newCandidate.position}
                  onValueChange={(value) => setNewCandidate({ ...newCandidate, position: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select position" />
                  </SelectTrigger>
                  <SelectContent>
                    {openPositions.map((position) => (
                      <SelectItem key={position.id} value={position.title}>
                        {position.title}
                      </SelectItem>
                    ))}
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={newCandidate.email}
                  onChange={(e) => setNewCandidate({ ...newCandidate, email: e.target.value })}
                  placeholder="john.doe@example.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={newCandidate.phone}
                  onChange={(e) => setNewCandidate({ ...newCandidate, phone: e.target.value })}
                  placeholder="+1 (555) 123-4567"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="skills">Skills (comma separated)</Label>
              <Input
                id="skills"
                value={newCandidate.skills.join(', ')}
                onChange={(e) =>
                  setNewCandidate({
                    ...newCandidate,
                    skills: e.target.value.split(',').map((skill) => skill.trim())
                  })
                }
                placeholder="React, TypeScript, Node.js"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="experience">Experience</Label>
              <Textarea
                id="experience"
                value={newCandidate.experience}
                onChange={(e) => setNewCandidate({ ...newCandidate, experience: e.target.value })}
                placeholder="Briefly describe the candidate's experience"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={newCandidate.notes}
                onChange={(e) => setNewCandidate({ ...newCandidate, notes: e.target.value })}
                placeholder="Any additional notes about the candidate"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="resumeUrl">Resume URL</Label>
              <Input
                id="resumeUrl"
                value={newCandidate.resumeUrl}
                onChange={(e) => setNewCandidate({ ...newCandidate, resumeUrl: e.target.value })}
                placeholder="https://example.com/resume.pdf"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddCandidateOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddCandidate}>Add Candidate</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Candidate Dialog */}
      {selectedCandidate && (
        <Dialog open={viewCandidateOpen} onOpenChange={setViewCandidateOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Candidate Details</DialogTitle>
            </DialogHeader>
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center">
                  <User className="h-8 w-8 text-muted-foreground" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold">{selectedCandidate.name}</h3>
                  <p className="text-muted-foreground">{selectedCandidate.position}</p>
                </div>
                <Badge className={`ml-auto ${getStatusColor(selectedCandidate.status)}`}>
                  {selectedCandidate.status.charAt(0).toUpperCase() + selectedCandidate.status.slice(1)}
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Mail className="h-4 w-4" />
                    <span>Email</span>
                  </div>
                  <p>{selectedCandidate.email}</p>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Phone className="h-4 w-4" />
                    <span>Phone</span>
                  </div>
                  <p>{selectedCandidate.phone}</p>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium">Skills</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedCandidate.skills.map((skill, i) => (
                    <Badge key={i} variant="secondary">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium">Experience</h4>
                <p className="text-sm">{selectedCandidate.experience}</p>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium">Notes</h4>
                <p className="text-sm">{selectedCandidate.notes}</p>
              </div>

              {selectedCandidate.resumeUrl && (
                <div className="space-y-2">
                  <h4 className="font-medium">Resume</h4>
                  <Button variant="outline" className="w-full" asChild>
                    <a href={selectedCandidate.resumeUrl} target="_blank" rel="noopener noreferrer">
                      <FileText className="mr-2 h-4 w-4" /> View Resume
                    </a>
                  </Button>
                </div>
              )}

              <div className="space-y-2">
                <h4 className="font-medium">Update Status</h4>
                <Select
                  value={selectedCandidate.status}
                  onValueChange={(value: RecruitmentCandidate['status']) =>
                    handleUpdateCandidateStatus(selectedCandidate.id, value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="new">New</SelectItem>
                    <SelectItem value="screening">Screening</SelectItem>
                    <SelectItem value="interviewing">Interviewing</SelectItem>
                    <SelectItem value="offer">Offer</SelectItem>
                    <SelectItem value="hired">Hired</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
const JobDetailsModal = ({
  open,
  onClose,
  job,
  onEdit,
  loading
}: {
  open: boolean;
  onClose: () => void;
  job: JobPosting | null;
  onEdit: () => void;
  loading: boolean;
}) => {
  if (!open || !job) return null;

  const formatDate = (date: Date | string | null | undefined) => {
    if (!date) return '';
    if (typeof date === 'string') return new Date(date).toLocaleDateString();
    if (date instanceof Date) return date.toLocaleDateString();
    return '';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-background rounded-lg shadow-lg max-w-2xl w-full m-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-full">
              <Briefcase className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold">{job.title}</h2>
              <p className="text-sm text-muted-foreground">{job.department}</p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium text-muted-foreground">Location</Label>
              <p className="text-sm mt-1">{job.location}</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-muted-foreground">Job Type</Label>
              <p className="text-sm mt-1 capitalize">{job.type}</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-muted-foreground">Salary Range</Label>
              <p className="text-sm mt-1">{job.salaryRange}</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-muted-foreground">Status</Label>
              <Badge className={
                job.status === 'published' ? 'bg-green-100 text-green-800 border-green-200' :
                  job.status === 'closed' ? 'bg-red-100 text-red-800 border-red-200' :
                    'bg-gray-100 text-gray-800 border-gray-200'
              }>
                {job.status}
              </Badge>
            </div>
          </div>

          <div>
            <Label className="text-sm font-medium text-muted-foreground">Description</Label>
            <div className="mt-1 p-3 bg-muted/50 rounded-lg">
              <p className="text-sm">{job.description}</p>
            </div>
          </div>

          <div>
            <Label className="text-sm font-medium text-muted-foreground">Requirements</Label>
            <div className="mt-1 p-3 bg-muted/50 rounded-lg">
              <ul className="text-sm space-y-1">
                {job.requirements.map((req, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-muted-foreground">•</span>
                    <span>{req}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium text-muted-foreground">Posted Date</Label>
              <p className="text-sm mt-1">{formatDate(job.postedDate)}</p>
            </div>
            {job.closingDate && (
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Closing Date</Label>
                <p className="text-sm mt-1">{formatDate(job.closingDate)}</p>
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 p-6 border-t">
          <Button
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
            onClick={onEdit}
            disabled={loading}
          >
            {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Edit className="h-4 w-4 mr-2" />}
            Edit Job
          </Button>
        </div>
      </div>
    </div>
  );
};

// Candidate Details Modal Component
const CandidateDetailsModal = ({
  open,
  onClose,
  candidate,
  onEdit,
  loading
}: {
  open: boolean;
  onClose: () => void;
  candidate: RecruitmentCandidate | null;
  onEdit: () => void;
  loading: boolean;
}) => {
  if (!open || !candidate) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-background rounded-lg shadow-lg max-w-2xl w-full m-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-full">
              <User className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold">{candidate.name}</h2>
              <p className="text-sm text-muted-foreground">{candidate.position}</p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium text-muted-foreground">Email</Label>
              <p className="text-sm mt-1">{candidate.email}</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-muted-foreground">Phone</Label>
              <p className="text-sm mt-1">{candidate.phone}</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-muted-foreground">Experience</Label>
              <p className="text-sm mt-1">{candidate.experience}</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-muted-foreground">Status</Label>
              <Badge className={
                candidate.status === 'hired' ? 'bg-green-100 text-green-800 border-green-200' :
                  candidate.status === 'interviewing' ? 'bg-blue-100 text-blue-800 border-blue-200' :
                    candidate.status === 'rejected' ? 'bg-red-100 text-red-800 border-red-200' :
                      'bg-orange-100 text-orange-800 border-orange-200'
              }>
                {candidate.status}
              </Badge>
            </div>
          </div>

          <div>
            <Label className="text-sm font-medium text-muted-foreground">Skills</Label>
            <div className="mt-1 flex flex-wrap gap-2">
              {candidate.skills.map((skill, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {skill}
                </Badge>
              ))}
            </div>
          </div>

          {candidate.notes && (
            <div>
              <Label className="text-sm font-medium text-muted-foreground">Notes</Label>
              <div className="mt-1 p-3 bg-muted/50 rounded-lg">
                <p className="text-sm">{candidate.notes}</p>
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-3 p-6 border-t">
          <Button
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
            onClick={onEdit}
            disabled={loading}
          >
            {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Edit className="h-4 w-4 mr-2" />}
            Edit Candidate
          </Button>
        </div>
      </div>
    </div>
  );
};

export default function RecruitmentPage() {
  // State management
  const [jobs, setJobs] = useState<JobPosting[]>([]);
  const [candidates, setCandidates] = useState<RecruitmentCandidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Filter states
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [selectedDepartment, setSelectedDepartment] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Dialog states
  const [jobDialogOpen, setJobDialogOpen] = useState(false);
  const [candidateDialogOpen, setCandidateDialogOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState<JobPosting | null>(null);
  const [selectedCandidate, setSelectedCandidate] = useState<RecruitmentCandidate | null>(null);
  const [jobDetailsOpen, setJobDetailsOpen] = useState(false);
  const [candidateDetailsOpen, setCandidateDetailsOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  // Form states
  const [newJobForm, setNewJobForm] = useState({
    title: '',
    department: '',
    location: '',
    type: 'full-time' as 'full-time' | 'part-time' | 'contract' | 'internship',
    salaryRange: '',
    description: '',
    requirements: ['']
  });

  const [newCandidateForm, setNewCandidateForm] = useState({
    name: '',
    email: '',
    phone: '',
    position: '',
    experience: '',
    skills: [''],
    notes: ''
  });

  // Load data on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [jobsData, candidatesData] = await Promise.all([
          jobBoardService.getJobPostings(),
          recruitmentService.getCandidates()
        ]);
        // Convert Firebase Timestamps to JavaScript Dates
        const jobsWithDates = jobsData.map(job => ({
          ...job,
          postedDate: job.postedDate ? new Date(job.postedDate) : null,
          closingDate: job.closingDate ? new Date(job.closingDate) : null,
        }));
        setJobs(jobsWithDates);
        setCandidates(candidatesData);
      } catch (error) {
        console.error('Error loading recruitment data:', error);
        setError('Failed to load recruitment data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Clear messages after 5 seconds
  useEffect(() => {
    if (success || error) {
      const timer = setTimeout(() => {
        setSuccess('');
        setError('');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [success, error]);

  // Filter logic
  const filteredJobs = useMemo(() => {
    return jobs.filter(job =>
      (!selectedStatus || selectedStatus === 'All Statuses' || job.status === selectedStatus) &&
      (!selectedDepartment || selectedDepartment === 'All Departments' || job.department === selectedDepartment) &&
      (!searchQuery ||
        job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.location.toLowerCase().includes(searchQuery.toLowerCase())
      )
    );
  }, [jobs, selectedStatus, selectedDepartment, searchQuery]);

  // Get unique departments and statuses for filters
  const departments = ['All Departments', ...Array.from(new Set(jobs.map(job => job.department)))];
  const jobStatuses = ['All Statuses', 'draft', 'published', 'closed'];

  // Handle add new job
  const handleAddJob = async () => {
    if (!newJobForm.title || !newJobForm.department || !newJobForm.location) {
      setError('Please fill in all required fields');
      return;
    }

    setActionLoading(true);
    try {
      const jobData = {
        ...newJobForm,
        requirements: newJobForm.requirements.filter(req => req.trim() !== ''),
        status: 'published' as const,
        postedDate: new Date()
      };

      await jobBoardService.createJobPosting(jobData);
      setSuccess(`Job posting created: ${jobData.title}`);
      setJobDialogOpen(false);
      setNewJobForm({
        title: '',
        department: '',
        location: '',
        type: 'full-time',
        salaryRange: '',
        description: '',
        requirements: ['']
      });

      // Reload jobs
      const updatedJobs = await jobBoardService.getJobPostings();
      setJobs(updatedJobs);
    } catch (error) {
      console.error('Error adding job:', error);
      setError('Failed to create job posting. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  // Handle add new candidate
  const handleAddCandidate = async () => {
    if (!newCandidateForm.name || !newCandidateForm.email || !newCandidateForm.position) {
      setError('Please fill in all required fields');
      return;
    }

    setActionLoading(true);
    try {
      const candidateData = {
        ...newCandidateForm,
        skills: newCandidateForm.skills.filter(skill => skill.trim() !== ''),
        status: 'new' as const,
        resumeUrl: '' // This would be handled by file upload in a real implementation
      };

      await recruitmentService.addCandidate(candidateData);
      setSuccess(`Candidate added: ${candidateData.name}`);
      setCandidateDialogOpen(false);
      setNewCandidateForm({
        name: '',
        email: '',
        phone: '',
        position: '',
        experience: '',
        skills: [''],
        notes: ''
      });

      // Reload candidates
      const updatedCandidates = await recruitmentService.getCandidates();
      setCandidates(updatedCandidates);
    } catch (error) {
      console.error('Error adding candidate:', error);
      setError('Failed to add candidate. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  // Summary stats
  const totalJobs = jobs.length;
  const activeJobs = jobs.filter(job => job.status === 'published').length;
  const totalCandidates = candidates.length;
  const hiredCandidates = candidates.filter(candidate => candidate.status === 'hired').length;

  if (loading) {
    return (
      <div className="p-8 min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Loading recruitment data...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Success/Error Messages */}
      {success && (
        <Alert className="mb-6 border-green-200 bg-green-50 text-green-800">
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert className="mb-6 border-red-200 bg-red-50 text-red-800">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

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

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
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
                <p className="text-sm font-medium text-muted-foreground mb-1">Total Candidates</p>
                <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">{totalCandidates}</p>
              </div>
              <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-full">
                <Users className="h-6 w-6 text-purple-600 dark:text-purple-400" />
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
                  placeholder="Search by job title, department, or location..."
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
            <Button className="bg-green-600 hover:bg-green-700 text-white px-6" onClick={() => setJobDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Post Job
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Job Listings */}
      <Card className="mb-8 border-0 shadow-lg bg-card/50 backdrop-blur-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Briefcase className="h-4 w-4 text-muted-foreground" />
              <TypographyH3 className="text-lg font-semibold">Open Positions ({filteredJobs.length})</TypographyH3>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredJobs.length === 0 ? (
            <div className="text-center py-12">
              <Briefcase className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-lg font-medium text-muted-foreground mb-2">No job postings found</p>
              <p className="text-sm text-muted-foreground">
                {jobs.length === 0 ? 'No jobs have been posted yet.' : 'Try adjusting your filters.'}
              </p>
            </div>
          ) : (
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
                            <p className="text-sm text-muted-foreground">{job.department}</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground mb-4">
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4" />
                            <span>{job.location}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            <span className="capitalize">{job.type}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <DollarSign className="h-4 w-4" />
                            <span>{job.salaryRange}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            <span>Posted {new Date(job.postedDate).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                      <Badge
                        className={
                          job.status === 'published' ? 'bg-green-100 text-green-800 border-green-200 px-3 py-1' :
                            job.status === 'closed' ? 'bg-red-100 text-red-800 border-red-200 px-3 py-1' :
                              'bg-gray-100 text-gray-800 border-gray-200 px-3 py-1'
                        }
                      >
                        {job.status}
                      </Badge>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-border/50">
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="text-xs bg-muted px-2 py-1 rounded">{job.department}</span>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="hover:bg-blue-50 hover:border-blue-200 hover:text-blue-700"
                          onClick={() => {
                            setSelectedJob(job);
                            setJobDetailsOpen(true);
                          }}
                        >
                          <Eye className="h-3 w-3 mr-1" />
                          View
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="hover:bg-green-50 hover:border-green-200 hover:text-green-700"
                        >
                          <Edit className="h-3 w-3 mr-1" />
                          Edit
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Top Candidates */}
      <Card className="border-0 shadow-lg bg-card/50 backdrop-blur-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <TypographyH3 className="text-lg font-semibold">Top Candidates ({candidates.length})</TypographyH3>
            </div>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white" onClick={() => setCandidateDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Candidate
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {candidates.length === 0 ? (
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-lg font-medium text-muted-foreground mb-2">No candidates found</p>
              <p className="text-sm text-muted-foreground">No candidates have been added yet.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border/50">
                    <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Candidate</th>
                    <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Position</th>
                    <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Experience</th>
                    <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Status</th>
                    <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {candidates.map((candidate) => (
                    <tr key={candidate.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-muted rounded-full">
                            <User className="h-4 w-4 text-muted-foreground" />
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
                      <td className="px-4 py-3">
                        <Badge
                          className={
                            candidate.status === 'hired' ? 'bg-green-100 text-green-800 border-green-200 px-3 py-1' :
                              candidate.status === 'interviewing' ? 'bg-blue-100 text-blue-800 border-blue-200 px-3 py-1' :
                                candidate.status === 'rejected' ? 'bg-red-100 text-red-800 border-red-200 px-3 py-1' :
                                  'bg-orange-100 text-orange-800 border-orange-200 px-3 py-1'
                          }
                        >
                          {candidate.status}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="hover:bg-blue-50 hover:border-blue-200 hover:text-blue-700"
                            onClick={() => {
                              setSelectedCandidate(candidate);
                              setCandidateDetailsOpen(true);
                            }}
                          >
                            <Eye className="h-3 w-3 mr-1" />
                            View
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="hover:bg-green-50 hover:border-green-200 hover:text-green-700"
                          >
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
          )}
        </CardContent>
      </Card>

      {/* Job Details Modal */}
      <JobDetailsModal
        open={jobDetailsOpen}
        onClose={() => {
          setJobDetailsOpen(false);
          setSelectedJob(null);
        }}
        job={selectedJob}
        onEdit={() => {
          // Handle edit job
          setJobDetailsOpen(false);
        }}
        loading={actionLoading}
      />

      {/* Candidate Details Modal */}
      <CandidateDetailsModal
        open={candidateDetailsOpen}
        onClose={() => {
          setCandidateDetailsOpen(false);
          setSelectedCandidate(null);
        }}
        candidate={selectedCandidate}
        onEdit={() => {
          // Handle edit candidate
          setCandidateDetailsOpen(false);
        }}
        loading={actionLoading}
      />

      {/* Add Job Dialog */}
      <Dialog open={jobDialogOpen} onOpenChange={setJobDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">Post New Job</DialogTitle>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-muted-foreground">Job Title</Label>
                <Input
                  placeholder="e.g., Senior Developer"
                  value={newJobForm.title}
                  onChange={(e) => setNewJobForm(prev => ({ ...prev, title: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium text-muted-foreground">Department</Label>
                <Input
                  placeholder="e.g., Engineering"
                  value={newJobForm.department}
                  onChange={(e) => setNewJobForm(prev => ({ ...prev, department: e.target.value }))}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-muted-foreground">Location</Label>
                <Input
                  placeholder="e.g., San Francisco, CA"
                  value={newJobForm.location}
                  onChange={(e) => setNewJobForm(prev => ({ ...prev, location: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium text-muted-foreground">Job Type</Label>
                <Select
                  value={newJobForm.type}
                  onValueChange={(value: 'full-time' | 'part-time' | 'contract' | 'internship') =>
                    setNewJobForm(prev => ({ ...prev, type: value }))
                  }
                >
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
              <Label className="text-sm font-medium text-muted-foreground">Salary Range</Label>
              <Input
                placeholder="e.g., $80k - $120k"
                value={newJobForm.salaryRange}
                onChange={(e) => setNewJobForm(prev => ({ ...prev, salaryRange: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium text-muted-foreground">Job Description</Label>
              <Textarea
                placeholder="Describe the role, responsibilities, and requirements..."
                value={newJobForm.description}
                onChange={(e) => setNewJobForm(prev => ({ ...prev, description: e.target.value }))}
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium text-muted-foreground">Requirements</Label>
              {newJobForm.requirements.map((req, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    placeholder={`Requirement ${index + 1}`}
                    value={req}
                    onChange={(e) => {
                      const newReqs = [...newJobForm.requirements];
                      newReqs[index] = e.target.value;
                      setNewJobForm(prev => ({ ...prev, requirements: newReqs }));
                    }}
                  />
                  {index === newJobForm.requirements.length - 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setNewJobForm(prev => ({ ...prev, requirements: [...prev.requirements, ''] }))}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button variant="outline" onClick={() => setJobDialogOpen(false)} disabled={actionLoading}>
                Cancel
              </Button>
              <Button
                className="bg-green-600 hover:bg-green-700 text-white"
                onClick={handleAddJob}
                disabled={actionLoading}
              >
                {actionLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Plus className="h-4 w-4 mr-2" />}
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
                <Label className="text-sm font-medium text-muted-foreground">Full Name</Label>
                <Input
                  placeholder="e.g., John Doe"
                  value={newCandidateForm.name}
                  onChange={(e) => setNewCandidateForm(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium text-muted-foreground">Email</Label>
                <Input
                  placeholder="john.doe@email.com"
                  value={newCandidateForm.email}
                  onChange={(e) => setNewCandidateForm(prev => ({ ...prev, email: e.target.value }))}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-muted-foreground">Phone</Label>
                <Input
                  placeholder="+1 (555) 123-4567"
                  value={newCandidateForm.phone}
                  onChange={(e) => setNewCandidateForm(prev => ({ ...prev, phone: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium text-muted-foreground">Position</Label>
                <Input
                  placeholder="e.g., Senior Developer"
                  value={newCandidateForm.position}
                  onChange={(e) => setNewCandidateForm(prev => ({ ...prev, position: e.target.value }))}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium text-muted-foreground">Experience</Label>
              <Input
                placeholder="e.g., 5 years"
                value={newCandidateForm.experience}
                onChange={(e) => setNewCandidateForm(prev => ({ ...prev, experience: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium text-muted-foreground">Skills</Label>
              {newCandidateForm.skills.map((skill, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    placeholder={`Skill ${index + 1}`}
                    value={skill}
                    onChange={(e) => {
                      const newSkills = [...newCandidateForm.skills];
                      newSkills[index] = e.target.value;
                      setNewCandidateForm(prev => ({ ...prev, skills: newSkills }));
                    }}
                  />
                  {index === newCandidateForm.skills.length - 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setNewCandidateForm(prev => ({ ...prev, skills: [...prev.skills, ''] }))}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium text-muted-foreground">Notes</Label>
              <Textarea
                placeholder="Add any additional notes about the candidate..."
                value={newCandidateForm.notes}
                onChange={(e) => setNewCandidateForm(prev => ({ ...prev, notes: e.target.value }))}
                rows={3}
              />
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button variant="outline" onClick={() => setCandidateDialogOpen(false)} disabled={actionLoading}>
                Cancel
              </Button>
              <Button
                className="bg-blue-600 hover:bg-blue-700 text-white"
                onClick={handleAddCandidate}
                disabled={actionLoading}
              >
                {actionLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Plus className="h-4 w-4 mr-2" />}
                Add Candidate
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
