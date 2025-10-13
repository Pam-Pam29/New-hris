import { useState, useEffect, useMemo, useCallback } from 'react';
import { Button } from '../../../../components/ui/button';
import { Card, CardContent, CardHeader } from '../../../../components/ui/card';
import { TypographyH2, TypographyH3 } from '../../../../components/ui/typography';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../../components/ui/select';
import { Input } from '../../../../components/ui/input';
import { Badge } from '../../../../components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../../../../components/ui/dialog';
import {
  Briefcase,
  Users,
  Clock,
  CheckCircle,
  AlertTriangle,
  Plus,
  Search,
  Eye,
  Calendar,
  Edit,
  User,
  MapPin,
  DollarSign,
  Building,
  Loader2,
  X
} from 'lucide-react';

// Import Firebase services
import { getServiceConfig } from '../../../../config/firebase';
import { RecruitmentCandidate, Interview } from '../../../../services/recruitmentService';
import { JobPosting } from '../../../../services/jobBoardService';

// Import UI components
import { Label } from '../../../../components/ui/label';
import { Textarea } from '../../../../components/ui/textarea';
import { Alert, AlertDescription } from '../../../../components/ui/alert';

// Firebase service instances
let recruitmentServiceInstance: any = null;
let jobBoardServiceInstance: any = null;

// Initialize services
const getRecruitmentService = async () => {
  if (!recruitmentServiceInstance) {
    const { FirebaseRecruitmentService } = await import('../../../../services/recruitmentService');
    const config = await getServiceConfig();
    if (!config.firebase.enabled || !config.firebase.db) {
      throw new Error('Firebase not available');
    }
    recruitmentServiceInstance = new FirebaseRecruitmentService(config.firebase.db);
  }
  return recruitmentServiceInstance;
};

const getJobBoardService = async () => {
  if (!jobBoardServiceInstance) {
    const { FirebaseJobBoardService } = await import('../../../../services/jobBoardService');
    const config = await getServiceConfig();
    if (!config.firebase.enabled || !config.firebase.db) {
      throw new Error('Firebase not available');
    }
    jobBoardServiceInstance = new FirebaseJobBoardService(config.firebase.db);
  }
  return jobBoardServiceInstance;
};

// Removed unused RecruitmentComponent function

export default function RecruitmentPage() {
  // State management
  const [jobs, setJobs] = useState<JobPosting[]>([]);
  const [candidates, setCandidates] = useState<RecruitmentCandidate[]>([]);
  const [interviews, setInterviews] = useState<Interview[]>([]);
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
  const [jobDetailsOpen, setJobDetailsOpen] = useState(false);
  const [candidateDetailsOpen, setCandidateDetailsOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState<JobPosting | null>(null);
  const [selectedCandidate, setSelectedCandidate] = useState<RecruitmentCandidate | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Edit states
  const [isEditingJob, setIsEditingJob] = useState(false);
  const [isEditingCandidate, setIsEditingCandidate] = useState(false);

  // Interview states
  const [interviewDialogOpen, setInterviewDialogOpen] = useState(false);
  const [selectedCandidateForInterview, setSelectedCandidateForInterview] = useState<RecruitmentCandidate | null>(null);
  const [interviewForm, setInterviewForm] = useState({
    scheduledTime: '',
    duration: 60,
    type: 'video' as 'phone' | 'video' | 'onsite',
    interviewerId: '',
    notes: ''
  });

  // Form states
  const [newJobForm, setNewJobForm] = useState({
    title: '',
    department: '',
    location: '',
    type: 'full-time',
    salaryRange: '',
    description: '',
    requirements: [''],
    postedDate: new Date().toISOString().split('T')[0] // Default to today's date
  });

  const [newCandidateForm, setNewCandidateForm] = useState({
    name: '',
    email: '',
    phone: '',
    position: '',
    jobId: '', // Link to specific job posting
    experience: '',
    skills: [''],
    notes: ''
  });

  // Load data on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const jobBoardService = await getJobBoardService();
        const recruitmentService = await getRecruitmentService();
        const [jobsData, candidatesData, interviewsData] = await Promise.all([
          jobBoardService.getJobPostings(),
          recruitmentService.getCandidates(),
          recruitmentService.getInterviews()
        ]);
        // Convert Firebase Timestamps to JavaScript Dates
        const jobsWithDates = jobsData.map((job: any) => ({
          ...job,
          postedDate: job.postedDate ? new Date(job.postedDate) : null,
          closingDate: job.closingDate ? new Date(job.closingDate) : null,
        }));

        // Convert Firebase Timestamps to JavaScript Dates for interviews
        const interviewsWithDates = interviewsData.map((interview: any) => {
          let scheduledTime = null;

          // Handle different Firebase Timestamp formats
          if (interview.scheduledTime) {
            if (interview.scheduledTime.toDate && typeof interview.scheduledTime.toDate === 'function') {
              // Firebase Timestamp object
              scheduledTime = interview.scheduledTime.toDate();
            } else if (interview.scheduledTime._seconds) {
              // Firebase Timestamp with seconds
              scheduledTime = new Date(interview.scheduledTime._seconds * 1000);
            } else if (typeof interview.scheduledTime === 'string' || typeof interview.scheduledTime === 'number') {
              // String or number timestamp
              scheduledTime = new Date(interview.scheduledTime);
            } else if (interview.scheduledTime instanceof Date) {
              // Already a Date object
              scheduledTime = interview.scheduledTime;
            }
          }

          return {
            ...interview,
            scheduledTime: scheduledTime
          };
        });

        setJobs(jobsWithDates);
        setCandidates(candidatesData);
        setInterviews(interviewsWithDates);

        console.log('Loaded interviews:', interviewsWithDates);
      } catch (error) {
        console.error('Error loading recruitment data:', error);
        setError('Failed to load recruitment data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Clean up orphaned interviews when candidates change
  useEffect(() => {
    const cleanupOrphanedInterviews = async () => {
      if (interviews.length > 0 && candidates.length > 0) {
        const orphanedInterviews = interviews.filter(interview =>
          !candidates.some(candidate => candidate.id === interview.candidateId)
        );

        if (orphanedInterviews.length > 0) {
          console.log(`Found ${orphanedInterviews.length} orphaned interviews, cleaning up...`);

          try {
            const recruitmentService = await getRecruitmentService();

            // Cancel orphaned interviews
            for (const interview of orphanedInterviews) {
              try {
                await recruitmentService.cancelInterview(interview.id);
                console.log(`Cancelled orphaned interview: ${interview.id}`);
              } catch (error) {
                console.warn(`Could not cancel orphaned interview ${interview.id}:`, error);
              }
            }

            // Reload interviews after cleanup
            const updatedInterviews = await recruitmentService.getInterviews();
            const interviewsWithDates = updatedInterviews.map((interview: any) => {
              let scheduledTime = null;
              if (interview.scheduledTime) {
                if (interview.scheduledTime.toDate && typeof interview.scheduledTime.toDate === 'function') {
                  scheduledTime = interview.scheduledTime.toDate();
                } else if (interview.scheduledTime._seconds) {
                  scheduledTime = new Date(interview.scheduledTime._seconds * 1000);
                } else if (typeof interview.scheduledTime === 'string' || typeof interview.scheduledTime === 'number') {
                  scheduledTime = new Date(interview.scheduledTime);
                } else if (interview.scheduledTime instanceof Date) {
                  scheduledTime = interview.scheduledTime;
                }
              }
              return {
                ...interview,
                scheduledTime: scheduledTime
              };
            });

            setInterviews(interviewsWithDates);
            console.log('Orphaned interviews cleaned up successfully');
          } catch (error) {
            console.error('Error cleaning up orphaned interviews:', error);
          }
        }
      }
    };

    cleanupOrphanedInterviews();
  }, [candidates, interviews]);

  // Handle add job
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
        postedDate: new Date(newJobForm.postedDate),
        closingDate: null
      };

      const jobBoardService = await getJobBoardService();
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
        requirements: [''],
        postedDate: new Date().toISOString().split('T')[0]
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

  // Handle add candidate
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

      const recruitmentService = await getRecruitmentService();
      await recruitmentService.addCandidate(candidateData);
      setSuccess(`Candidate added: ${candidateData.name}`);
      setCandidateDialogOpen(false);
      setNewCandidateForm({
        name: '',
        email: '',
        phone: '',
        position: '',
        jobId: '',
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

  // Handle edit job
  const handleEditJob = (job: JobPosting) => {
    console.log('Editing job:', job);
    setSelectedJob(job);
    setIsEditingJob(true);

    const formData = {
      title: job.title,
      department: job.department,
      location: job.location,
      type: job.type,
      salaryRange: job.salaryRange,
      description: job.description,
      requirements: job.requirements.length > 0 ? job.requirements : [''],
      postedDate: (() => {
        try {
          if (job.postedDate instanceof Date && !isNaN(job.postedDate.getTime())) {
            return job.postedDate.toISOString().split('T')[0];
          } else if (job.postedDate) {
            const date = new Date(job.postedDate);
            if (!isNaN(date.getTime())) {
              return date.toISOString().split('T')[0];
            }
          }
          return new Date().toISOString().split('T')[0];
        } catch (error) {
          console.error('Error processing postedDate:', error);
          return new Date().toISOString().split('T')[0];
        }
      })()
    };

    console.log('Setting form data:', formData);
    setNewJobForm(formData);
    setJobDialogOpen(true);
    setJobDetailsOpen(false);
  };

  // Handle update job
  const handleUpdateJob = async () => {
    console.log('Updating job:', selectedJob);
    console.log('Form data:', newJobForm);

    if (!selectedJob || !newJobForm.title || !newJobForm.department || !newJobForm.location) {
      setError('Please fill in all required fields');
      return;
    }

    setActionLoading(true);
    try {
      // Ensure valid dates
      const postedDate = selectedJob.postedDate instanceof Date ? selectedJob.postedDate :
        selectedJob.postedDate ? new Date(selectedJob.postedDate) : new Date();
      const closingDate = selectedJob.closingDate instanceof Date ? selectedJob.closingDate :
        selectedJob.closingDate ? new Date(selectedJob.closingDate) : new Date();

      // Validate dates
      if (isNaN(postedDate.getTime()) || isNaN(closingDate.getTime())) {
        setError('Invalid date values found. Please try again.');
        setActionLoading(false);
        return;
      }

      const jobData = {
        ...newJobForm,
        requirements: newJobForm.requirements.filter(req => req.trim() !== ''),
        status: selectedJob.status, // Keep existing status
        postedDate: postedDate,
        closingDate: closingDate
      };

      const jobBoardService = await getJobBoardService();
      await jobBoardService.updateJobPosting(selectedJob.id, jobData);
      setSuccess(`Job posting updated: ${jobData.title}`);
      setJobDialogOpen(false);
      setIsEditingJob(false);
      setSelectedJob(null);

      // Reload jobs
      const updatedJobs = await jobBoardService.getJobPostings();
      const jobsWithDates = updatedJobs.map((job: any) => ({
        ...job,
        postedDate: job.postedDate ? new Date(job.postedDate) : null,
        closingDate: job.closingDate ? new Date(job.closingDate) : null,
      }));
      setJobs(jobsWithDates);

      console.log('Job updated successfully');
    } catch (error) {
      console.error('Error updating job:', error);
      setError('Failed to update job posting. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  // Handle edit candidate
  const handleEditCandidate = (candidate: RecruitmentCandidate) => {
    setSelectedCandidate(candidate);
    setIsEditingCandidate(true);
    setNewCandidateForm({
      name: candidate.name,
      email: candidate.email,
      phone: candidate.phone,
      position: candidate.position,
      jobId: candidate.jobId || '',
      experience: candidate.experience,
      skills: candidate.skills.length > 0 ? candidate.skills : [''],
      notes: candidate.notes
    });
    setCandidateDialogOpen(true);
    setCandidateDetailsOpen(false);
  };

  // Handle update candidate
  const handleUpdateCandidate = async () => {
    if (!selectedCandidate || !newCandidateForm.name || !newCandidateForm.email || !newCandidateForm.position) {
      setError('Please fill in all required fields');
      return;
    }

    setActionLoading(true);
    try {
      const candidateData = {
        ...newCandidateForm,
        skills: newCandidateForm.skills.filter(skill => skill.trim() !== ''),
        status: selectedCandidate.status, // Keep existing status
        resumeUrl: selectedCandidate.resumeUrl // Keep existing resume URL
      };

      const recruitmentService = await getRecruitmentService();
      await recruitmentService.updateCandidate(selectedCandidate.id, candidateData);
      setSuccess(`Candidate updated: ${candidateData.name}`);
      setCandidateDialogOpen(false);
      setIsEditingCandidate(false);
      setSelectedCandidate(null);

      // Reload candidates
      const updatedCandidates = await recruitmentService.getCandidates();
      setCandidates(updatedCandidates);
    } catch (error) {
      console.error('Error updating candidate:', error);
      setError('Failed to update candidate. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  // Handle unpublish job
  const handleUnpublishJob = async (jobId: string, jobTitle: string) => {
    if (!confirm(`Are you sure you want to unpublish the job posting "${jobTitle}"?`)) {
      return;
    }

    setActionLoading(true);
    try {
      const jobBoardService = await getJobBoardService();
      await jobBoardService.updateJobPosting(jobId, { status: 'draft' });
      setSuccess(`Job posting "${jobTitle}" has been unpublished successfully`);

      // Reload jobs
      const updatedJobs = await jobBoardService.getJobPostings();
      setJobs(updatedJobs);
    } catch (error) {
      console.error('Error unpublishing job:', error);
      setError('Failed to unpublish job posting. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  // Handle delete job
  const handleDeleteJob = async (jobId: string, jobTitle: string) => {
    if (!confirm(`Are you sure you want to delete the job posting "${jobTitle}"? This action cannot be undone.`)) {
      return;
    }

    setActionLoading(true);
    try {
      const jobBoardService = await getJobBoardService();
      await jobBoardService.closeJobPosting(jobId); // Using closeJobPosting as delete functionality
      setSuccess(`Job posting "${jobTitle}" has been deleted successfully`);

      // Reload jobs
      const updatedJobs = await jobBoardService.getJobPostings();
      setJobs(updatedJobs);
    } catch (error) {
      console.error('Error deleting job:', error);
      setError('Failed to delete job posting. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  // Handle delete candidate
  const handleDeleteCandidate = async (candidateId: string, candidateName: string) => {
    if (!confirm(`Are you sure you want to delete the candidate "${candidateName}"? This action cannot be undone.`)) {
      return;
    }

    setActionLoading(true);
    try {
      const recruitmentService = await getRecruitmentService();

      // Delete candidate
      await recruitmentService.deleteCandidate(candidateId);

      // Clean up any orphaned interviews for this candidate
      const allInterviews = await recruitmentService.getInterviews();
      const orphanedInterviews = allInterviews.filter(interview => interview.candidateId === candidateId);

      // Delete orphaned interviews
      for (const interview of orphanedInterviews) {
        try {
          await recruitmentService.cancelInterview(interview.id);
        } catch (error) {
          console.warn('Could not cancel interview:', interview.id, error);
        }
      }

      setSuccess(`Candidate "${candidateName}" has been deleted successfully`);

      // Reload candidates and interviews
      const [updatedCandidates, updatedInterviews] = await Promise.all([
        recruitmentService.getCandidates(),
        recruitmentService.getInterviews()
      ]);

      // Convert Firebase Timestamps to JavaScript Dates for interviews
      const interviewsWithDates = updatedInterviews.map((interview: any) => {
        let scheduledTime = null;

        // Handle different Firebase Timestamp formats
        if (interview.scheduledTime) {
          if (interview.scheduledTime.toDate && typeof interview.scheduledTime.toDate === 'function') {
            // Firebase Timestamp object
            scheduledTime = interview.scheduledTime.toDate();
          } else if (interview.scheduledTime._seconds) {
            // Firebase Timestamp with seconds
            scheduledTime = new Date(interview.scheduledTime._seconds * 1000);
          } else if (typeof interview.scheduledTime === 'string' || typeof interview.scheduledTime === 'number') {
            // String or number timestamp
            scheduledTime = new Date(interview.scheduledTime);
          } else if (interview.scheduledTime instanceof Date) {
            // Already a Date object
            scheduledTime = interview.scheduledTime;
          }
        }

        return {
          ...interview,
          scheduledTime: scheduledTime
        };
      });

      setCandidates(updatedCandidates);
      setInterviews(interviewsWithDates);

      console.log('Candidate and related interviews deleted successfully');
    } catch (error) {
      console.error('Error deleting candidate:', error);
      setError('Failed to delete candidate. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  // Handle schedule interview
  const handleScheduleInterview = (candidate: RecruitmentCandidate) => {
    setSelectedCandidateForInterview(candidate);
    setInterviewForm({
      scheduledTime: '',
      duration: 60,
      type: 'video',
      interviewerId: '',
      notes: ''
    });
    setInterviewDialogOpen(true);
  };

  // Handle submit interview
  const handleSubmitInterview = async () => {
    if (!selectedCandidateForInterview || !interviewForm.scheduledTime || !interviewForm.interviewerId) {
      setError('Please fill in all required fields for the interview');
      return;
    }

    // Check if scheduled time is in the future
    const scheduledTime = new Date(interviewForm.scheduledTime);
    const now = new Date();
    if (scheduledTime <= now) {
      setError('Interview must be scheduled for a future date and time');
      return;
    }

    setActionLoading(true);
    try {
      const recruitmentService = await getRecruitmentService();
      const interviewData = {
        candidateId: selectedCandidateForInterview.id,
        interviewerId: interviewForm.interviewerId,
        scheduledTime: new Date(interviewForm.scheduledTime),
        duration: interviewForm.duration,
        type: interviewForm.type,
        status: 'scheduled' as const,
        feedback: interviewForm.notes
      };

      await recruitmentService.scheduleInterview(interviewData);

      // Update candidate status to 'interviewing'
      await recruitmentService.updateCandidateStatus(selectedCandidateForInterview.id, 'interviewing');

      setSuccess(`Interview scheduled successfully for ${selectedCandidateForInterview.name}`);
      setInterviewDialogOpen(false);
      setSelectedCandidateForInterview(null);

      // Reset interview form
      setInterviewForm({
        scheduledTime: '',
        duration: 60,
        type: 'video' as 'phone' | 'video' | 'onsite',
        interviewerId: '',
        notes: ''
      });

      // Reload candidates and interviews
      const [updatedCandidates, updatedInterviews] = await Promise.all([
        recruitmentService.getCandidates(),
        recruitmentService.getInterviews()
      ]);

      // Convert Firebase Timestamps to JavaScript Dates for interviews
      const interviewsWithDates = updatedInterviews.map((interview: any) => {
        let scheduledTime = null;

        // Handle different Firebase Timestamp formats
        if (interview.scheduledTime) {
          if (interview.scheduledTime.toDate && typeof interview.scheduledTime.toDate === 'function') {
            // Firebase Timestamp object
            scheduledTime = interview.scheduledTime.toDate();
          } else if (interview.scheduledTime._seconds) {
            // Firebase Timestamp with seconds
            scheduledTime = new Date(interview.scheduledTime._seconds * 1000);
          } else if (typeof interview.scheduledTime === 'string' || typeof interview.scheduledTime === 'number') {
            // String or number timestamp
            scheduledTime = new Date(interview.scheduledTime);
          } else if (interview.scheduledTime instanceof Date) {
            // Already a Date object
            scheduledTime = interview.scheduledTime;
          }
        }

        return {
          ...interview,
          scheduledTime: scheduledTime
        };
      });

      setCandidates(updatedCandidates);
      setInterviews(interviewsWithDates);

      console.log('Interview scheduled, updated interviews:', interviewsWithDates);
    } catch (error) {
      console.error('Error scheduling interview:', error);
      setError('Failed to schedule interview. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  // Handle hire candidate
  const handleHireCandidate = async (candidateId: string, candidateName: string) => {
    if (!confirm(`Are you sure you want to hire "${candidateName}"?`)) {
      return;
    }

    setActionLoading(true);
    try {
      const recruitmentService = await getRecruitmentService();
      await recruitmentService.updateCandidateStatus(candidateId, 'hired');
      setSuccess(`Candidate "${candidateName}" has been hired successfully!`);

      // Reload candidates
      const updatedCandidates = await recruitmentService.getCandidates();
      setCandidates(updatedCandidates);
    } catch (error) {
      console.error('Error hiring candidate:', error);
      setError('Failed to hire candidate. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  // Helper function to get upcoming interviews (memoized to prevent infinite re-renders)
  const getUpcomingInterviews = useMemo(() => {
    const now = new Date();

    const upcoming = interviews
      .filter(interview => {
        const isScheduled = interview.status === 'scheduled';
        const isFuture = interview.scheduledTime ? new Date(interview.scheduledTime) > now : false;
        // Only include interviews where the candidate still exists
        const candidateExists = candidates.some(candidate => candidate.id === interview.candidateId);
        return isScheduled && isFuture && candidateExists;
      })
      .sort((a, b) => new Date(a.scheduledTime).getTime() - new Date(b.scheduledTime).getTime())
      .slice(0, 5); // Show next 5 interviews

    return upcoming;
  }, [interviews, candidates]);

  // Summary stats
  const totalJobs = jobs.length;
  const activeJobs = jobs.filter(job => job.status === 'published').length;
  const totalCandidates = candidates.length;
  const hiredCandidates = candidates.filter(candidate => candidate.status === 'hired').length;

  if (loading) {
    return (
      <div className="p-8 min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-muted-foreground">Loading recruitment data...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <TypographyH2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Recruitment Management
          </TypographyH2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Manage job postings, track candidates, and streamline your hiring process
          </p>
        </div>

        {/* Error and Success Messages */}
        {error && (
          <Alert className="border-red-200 bg-red-50">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">{error}</AlertDescription>
          </Alert>
        )}
        {success && (
          <Alert className="border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">{success}</AlertDescription>
          </Alert>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="border-0 shadow-lg bg-card/50 backdrop-blur-sm">
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

          <Card className="border-0 shadow-lg bg-card/50 backdrop-blur-sm">
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

          <Card className="border-0 shadow-lg bg-card/50 backdrop-blur-sm">
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

          <Card className="border-0 shadow-lg bg-card/50 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Hired Candidates</p>
                  <p className="text-3xl font-bold text-orange-600 dark:text-orange-400">{hiredCandidates}</p>
                </div>
                <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-full">
                  <CheckCircle className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="border-0 shadow-lg bg-card/50 backdrop-blur-sm">
          <CardContent className="p-6">
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
              <div className="flex gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Status</label>
                  <Select value={selectedStatus || 'all'} onValueChange={(value) => setSelectedStatus(value === 'all' ? null : value)}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="All Statuses" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="published">Published</SelectItem>
                      <SelectItem value="closed">Closed</SelectItem>
                      <SelectItem value="draft">Draft</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Department</label>
                  <Select value={selectedDepartment || 'all'} onValueChange={(value) => setSelectedDepartment(value === 'all' ? null : value)}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="All Departments" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Departments</SelectItem>
                      <SelectItem value="Engineering">Engineering</SelectItem>
                      <SelectItem value="Marketing">Marketing</SelectItem>
                      <SelectItem value="Sales">Sales</SelectItem>
                      <SelectItem value="HR">HR</SelectItem>
                      <SelectItem value="Finance">Finance</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button className="bg-blue-600 hover:bg-blue-700 text-white" onClick={() => setJobDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Post Job
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Jobs Section */}
        <Card className="border-0 shadow-lg bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Briefcase className="h-4 w-4 text-muted-foreground" />
                <TypographyH3 className="text-lg font-semibold">Open Positions ({jobs.length})</TypographyH3>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {jobs.length === 0 ? (
              <div className="text-center py-12">
                <Briefcase className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-lg font-medium text-muted-foreground mb-2">No job postings found</p>
                <p className="text-sm text-muted-foreground">
                  No jobs have been posted yet.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {jobs.map((job) => (
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
                              <span>Posted {(() => {
                                if (!job.postedDate) return 'Date not available';
                                const date = new Date(job.postedDate);
                                return isNaN(date.getTime()) ? 'Date not available' : date.toLocaleDateString();
                              })()}</span>
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
                            onClick={() => handleEditJob(job)}
                          >
                            <Edit className="h-3 w-3 mr-1" />
                            Edit
                          </Button>
                          {job.status === 'published' && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="hover:bg-yellow-50 hover:border-yellow-200 hover:text-yellow-700"
                              onClick={() => handleUnpublishJob(job.id, job.title)}
                              disabled={actionLoading}
                            >
                              <AlertTriangle className="h-3 w-3 mr-1" />
                              Unpublish
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="outline"
                            className="hover:bg-red-50 hover:border-red-200 hover:text-red-700"
                            onClick={() => handleDeleteJob(job.id, job.title)}
                            disabled={actionLoading}
                          >
                            <X className="h-3 w-3 mr-1" />
                            Delete
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

        {/* Upcoming Interviews */}
        <Card className="border-0 shadow-lg bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <TypographyH3 className="text-lg font-semibold">Upcoming Interviews ({getUpcomingInterviews.length})</TypographyH3>
              </div>
              <Button
                variant="outline"
                onClick={async () => {
                  try {
                    const recruitmentService = await getRecruitmentService();
                    const updatedInterviews = await recruitmentService.getInterviews();
                    const interviewsWithDates = updatedInterviews.map((interview: any) => {
                      let scheduledTime = null;

                      // Handle different Firebase Timestamp formats
                      if (interview.scheduledTime) {
                        if (interview.scheduledTime.toDate && typeof interview.scheduledTime.toDate === 'function') {
                          // Firebase Timestamp object
                          scheduledTime = interview.scheduledTime.toDate();
                        } else if (interview.scheduledTime._seconds) {
                          // Firebase Timestamp with seconds
                          scheduledTime = new Date(interview.scheduledTime._seconds * 1000);
                        } else if (typeof interview.scheduledTime === 'string' || typeof interview.scheduledTime === 'number') {
                          // String or number timestamp
                          scheduledTime = new Date(interview.scheduledTime);
                        } else if (interview.scheduledTime instanceof Date) {
                          // Already a Date object
                          scheduledTime = interview.scheduledTime;
                        }
                      }

                      return {
                        ...interview,
                        scheduledTime: scheduledTime
                      };
                    });
                    setInterviews(interviewsWithDates);
                  } catch (error) {
                    console.error('Error refreshing interviews:', error);
                  }
                }}
              >
                <Clock className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {getUpcomingInterviews.length === 0 ? (
              <div className="text-center py-12">
                <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-lg font-medium text-muted-foreground mb-2">No upcoming interviews</p>
                <p className="text-sm text-muted-foreground">No interviews are scheduled yet.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {getUpcomingInterviews.map((interview) => {
                  const candidate = candidates.find(c => c.id === interview.candidateId);
                  const job = candidate?.jobId ? jobs.find(j => j.id === candidate.jobId) : null;
                  return (
                    <div key={interview.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/30 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="p-2 bg-blue-100 rounded-full">
                          <User className="h-4 w-4 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium">{candidate?.name || 'Unknown Candidate'}</p>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span>{job?.title || candidate?.position || 'No position'}</span>
                            <span>•</span>
                            <span className="capitalize">{interview.type}</span>
                            <span>•</span>
                            <span>{interview.duration} min</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">
                          {new Date(interview.scheduledTime).toLocaleDateString()}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(interview.scheduledTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* All Candidates Table */}
        <Card className="border-0 shadow-lg bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <TypographyH3 className="text-lg font-semibold">All Candidates ({candidates.length})</TypographyH3>
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
                <p className="text-lg font-medium text-muted-foreground mb-2">No candidates yet</p>
                <p className="text-sm text-muted-foreground">Start by adding your first candidate.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {candidates.map((candidate) => {
                  const job = candidate.jobId ? jobs.find(j => j.id === candidate.jobId) : null;
                  return (
                    <div key={candidate.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/30 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="p-2 bg-blue-100 rounded-full">
                          <User className="h-4 w-4 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium">{candidate.name}</p>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span>{candidate.email}</span>
                            <span>•</span>
                            <span>{candidate.phone}</span>
                            {job && (
                              <>
                                <span>•</span>
                                <span>Applied for: {job.title}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge
                          className={
                            candidate.status === 'hired' ? 'bg-green-100 text-green-800 border-green-200' :
                              candidate.status === 'interviewing' ? 'bg-blue-100 text-blue-800 border-blue-200' :
                                candidate.status === 'rejected' ? 'bg-red-100 text-red-800 border-red-200' :
                                  'bg-orange-100 text-orange-800 border-orange-200'
                          }
                        >
                          {candidate.status}
                        </Badge>
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
                            onClick={() => handleEditCandidate(candidate)}
                          >
                            <Edit className="h-3 w-3 mr-1" />
                            Edit
                          </Button>
                          {candidate.status !== 'hired' && candidate.status !== 'interviewing' && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="hover:bg-purple-50 hover:border-purple-200 hover:text-purple-700"
                              onClick={() => handleScheduleInterview(candidate)}
                              disabled={actionLoading}
                            >
                              <Calendar className="h-3 w-3 mr-1" />
                              Interview
                            </Button>
                          )}
                          {candidate.status === 'interviewing' && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="hover:bg-green-50 hover:border-green-200 hover:text-green-700"
                              onClick={() => handleHireCandidate(candidate.id, candidate.name)}
                              disabled={actionLoading}
                            >
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Hire
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="outline"
                            className="hover:bg-red-50 hover:border-red-200 hover:text-red-700"
                            onClick={() => handleDeleteCandidate(candidate.id, candidate.name)}
                            disabled={actionLoading}
                          >
                            <X className="h-3 w-3 mr-1" />
                            Delete
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Job Details Modal */}
        <Dialog open={jobDetailsOpen} onOpenChange={() => setJobDetailsOpen(false)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Job Details</DialogTitle>
              <DialogDescription>
                View details for {selectedJob?.title}
              </DialogDescription>
            </DialogHeader>
            {selectedJob && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Title</Label>
                    <p className="text-sm mt-1">{selectedJob.title}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Department</Label>
                    <p className="text-sm mt-1">{selectedJob.department}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Location</Label>
                    <p className="text-sm mt-1">{selectedJob.location}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Type</Label>
                    <p className="text-sm mt-1 capitalize">{selectedJob.type}</p>
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Description</Label>
                  <p className="text-sm mt-1">{selectedJob.description}</p>
                </div>

                {/* Candidates who applied for this job */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <Label className="text-sm font-medium text-muted-foreground">
                      Candidates who applied ({candidates.filter(c => c.jobId === selectedJob.id).length})
                    </Label>
                  </div>

                  {candidates.filter(c => c.jobId === selectedJob.id).length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">No candidates have applied for this position yet.</p>
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                      {candidates.filter(c => c.jobId === selectedJob.id).map((candidate) => (
                        <div key={candidate.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                              <User className="h-4 w-4 text-blue-600" />
                            </div>
                            <div>
                              <p className="font-medium text-sm">{candidate.name}</p>
                              <p className="text-xs text-muted-foreground">{candidate.email}</p>
                            </div>
                          </div>
                          <Badge
                            className={
                              candidate.status === 'hired' ? 'bg-green-100 text-green-800 border-green-200' :
                                candidate.status === 'interviewing' ? 'bg-blue-100 text-blue-800 border-blue-200' :
                                  candidate.status === 'rejected' ? 'bg-red-100 text-red-800 border-red-200' :
                                    'bg-orange-100 text-orange-800 border-orange-200'
                            }
                          >
                            {candidate.status}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex gap-3 pt-4">
                  <Button variant="outline" onClick={() => setJobDetailsOpen(false)} className="flex-1">
                    Close
                  </Button>
                  <Button onClick={() => handleEditJob(selectedJob)} className="flex-1">
                    Edit Job
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Candidate Details Modal */}
        <Dialog open={candidateDetailsOpen} onOpenChange={() => setCandidateDetailsOpen(false)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Candidate Details</DialogTitle>
              <DialogDescription>
                View details for {selectedCandidate?.name}
              </DialogDescription>
            </DialogHeader>
            {selectedCandidate && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Name</Label>
                    <p className="text-sm mt-1">{selectedCandidate.name}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Email</Label>
                    <p className="text-sm mt-1">{selectedCandidate.email}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Phone</Label>
                    <p className="text-sm mt-1">{selectedCandidate.phone}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Position</Label>
                    <p className="text-sm mt-1">{selectedCandidate.position}</p>
                  </div>
                </div>
                <div className="flex gap-3 pt-4">
                  <Button variant="outline" onClick={() => setCandidateDetailsOpen(false)} className="flex-1">
                    Close
                  </Button>
                  <Button onClick={() => handleEditCandidate(selectedCandidate)} className="flex-1">
                    Edit Candidate
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Job Dialog */}
        <Dialog open={jobDialogOpen} onOpenChange={(open) => {
          setJobDialogOpen(open);
          if (!open) {
            setIsEditingJob(false);
            setSelectedJob(null);
            // Reset form when dialog closes
            setNewJobForm({
              title: '',
              department: '',
              location: '',
              type: 'full-time',
              salaryRange: '',
              description: '',
              requirements: [''],
              postedDate: new Date().toISOString().split('T')[0]
            });
          }
        }}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-xl font-semibold">
                {isEditingJob ? 'Edit Job Posting' : 'Post New Job'}
              </DialogTitle>
              <DialogDescription>
                {isEditingJob ? 'Update the job posting information.' : 'Fill in the details to create a new job posting.'}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Job Title *</Label>
                  <Input
                    id="title"
                    placeholder="e.g., Senior Software Engineer"
                    value={newJobForm.title}
                    onChange={(e) => setNewJobForm(prev => ({ ...prev, title: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="department">Department *</Label>
                  <Input
                    id="department"
                    placeholder="e.g., Engineering"
                    value={newJobForm.department}
                    onChange={(e) => setNewJobForm(prev => ({ ...prev, department: e.target.value }))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="location">Location *</Label>
                  <Input
                    id="location"
                    placeholder="e.g., San Francisco, CA"
                    value={newJobForm.location}
                    onChange={(e) => setNewJobForm(prev => ({ ...prev, location: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="type">Job Type</Label>
                  <select
                    id="type"
                    className="w-full p-2 border rounded-md"
                    value={newJobForm.type}
                    onChange={(e) => setNewJobForm(prev => ({ ...prev, type: e.target.value }))}
                  >
                    <option value="full-time">Full-time</option>
                    <option value="part-time">Part-time</option>
                    <option value="contract">Contract</option>
                    <option value="internship">Internship</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="salaryRange">Salary Range</Label>
                <Input
                  id="salaryRange"
                  placeholder="e.g., $80,000 - $120,000"
                  value={newJobForm.salaryRange}
                  onChange={(e) => setNewJobForm(prev => ({ ...prev, salaryRange: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="postedDate">Posted Date</Label>
                <Input
                  id="postedDate"
                  type="date"
                  value={newJobForm.postedDate}
                  onChange={(e) => setNewJobForm(prev => ({ ...prev, postedDate: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Job Description</Label>
                <Textarea
                  id="description"
                  placeholder="Describe the role, responsibilities, and what makes this position unique..."
                  value={newJobForm.description}
                  onChange={(e) => setNewJobForm(prev => ({ ...prev, description: e.target.value }))}
                  className="min-h-32"
                />
              </div>

              <div className="space-y-2">
                <Label>Requirements</Label>
                {newJobForm.requirements.map((req, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      placeholder={`Requirement ${index + 1}`}
                      value={req}
                      onChange={(e) => {
                        const newRequirements = [...newJobForm.requirements];
                        newRequirements[index] = e.target.value;
                        setNewJobForm(prev => ({ ...prev, requirements: newRequirements }));
                      }}
                    />
                    {newJobForm.requirements.length > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const newRequirements = newJobForm.requirements.filter((_, i) => i !== index);
                          setNewJobForm(prev => ({ ...prev, requirements: newRequirements }));
                        }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setNewJobForm(prev => ({ ...prev, requirements: [...prev.requirements, ''] }))}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Requirement
                </Button>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                onClick={() => setJobDialogOpen(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={isEditingJob ? handleUpdateJob : handleAddJob}
                disabled={actionLoading}
                className="flex-1"
              >
                {actionLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Plus className="h-4 w-4 mr-2" />}
                {isEditingJob ? 'Update Job' : 'Post Job'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Candidate Dialog */}
        <Dialog open={candidateDialogOpen} onOpenChange={(open) => {
          setCandidateDialogOpen(open);
          if (!open) {
            setIsEditingCandidate(false);
            setSelectedCandidate(null);
          }
        }}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-xl font-semibold">
                {isEditingCandidate ? 'Edit Candidate' : 'Add New Candidate'}
              </DialogTitle>
              <DialogDescription>
                {isEditingCandidate ? 'Update the candidate information.' : 'Add a new candidate to the recruitment system.'}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="candidate-name">Name *</Label>
                  <Input
                    id="candidate-name"
                    placeholder="John Doe"
                    value={newCandidateForm.name}
                    onChange={(e) => setNewCandidateForm(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="candidate-email">Email *</Label>
                  <Input
                    id="candidate-email"
                    type="email"
                    placeholder="john@example.com"
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
                <Label className="text-sm font-medium text-muted-foreground">Applied for Job</Label>
                <select
                  className="w-full p-2 border rounded-md"
                  value={newCandidateForm.jobId || 'none'}
                  onChange={(e) => setNewCandidateForm(prev => ({ ...prev, jobId: e.target.value === 'none' ? '' : e.target.value }))}
                >
                  <option value="none">Select a job posting...</option>
                  {jobs.map((job) => (
                    <option key={job.id} value={job.id}>
                      {job.title} - {job.department}
                    </option>
                  ))}
                </select>
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
                    {newCandidateForm.skills.length > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const newSkills = newCandidateForm.skills.filter((_, i) => i !== index);
                          setNewCandidateForm(prev => ({ ...prev, skills: newSkills }));
                        }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setNewCandidateForm(prev => ({ ...prev, skills: [...prev.skills, ''] }))}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Skill
                </Button>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-muted-foreground">Notes</Label>
                <Textarea
                  placeholder="Additional notes about the candidate..."
                  value={newCandidateForm.notes}
                  onChange={(e) => setNewCandidateForm(prev => ({ ...prev, notes: e.target.value }))}
                  className="min-h-20"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                onClick={() => setCandidateDialogOpen(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={isEditingCandidate ? handleUpdateCandidate : handleAddCandidate}
                disabled={actionLoading}
                className="flex-1"
              >
                {actionLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : (isEditingCandidate ? <Edit className="h-4 w-4 mr-2" /> : <Plus className="h-4 w-4 mr-2" />)}
                {isEditingCandidate ? 'Update Candidate' : 'Add Candidate'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Interview Scheduling Dialog */}
        <Dialog open={interviewDialogOpen} onOpenChange={setInterviewDialogOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Schedule Interview</DialogTitle>
              <DialogDescription>
                Schedule an interview for {selectedCandidateForInterview?.name}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="scheduledTime">Date & Time *</Label>
                  <Input
                    id="scheduledTime"
                    type="datetime-local"
                    value={interviewForm.scheduledTime}
                    onChange={(e) => setInterviewForm(prev => ({ ...prev, scheduledTime: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="duration">Duration (minutes)</Label>
                  <Input
                    id="duration"
                    type="number"
                    value={interviewForm.duration}
                    onChange={(e) => setInterviewForm(prev => ({ ...prev, duration: parseInt(e.target.value) || 60 }))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="type">Interview Type</Label>
                  <select
                    id="type"
                    className="w-full p-2 border rounded-md"
                    value={interviewForm.type}
                    onChange={(e) => setInterviewForm(prev => ({ ...prev, type: e.target.value as 'phone' | 'video' | 'onsite' }))}
                  >
                    <option value="phone">Phone</option>
                    <option value="video">Video</option>
                    <option value="onsite">On-site</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="interviewerId">Interviewer ID *</Label>
                  <Input
                    id="interviewerId"
                    placeholder="Enter interviewer ID"
                    value={interviewForm.interviewerId}
                    onChange={(e) => setInterviewForm(prev => ({ ...prev, interviewerId: e.target.value }))}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <textarea
                  id="notes"
                  className="w-full p-2 border rounded-md h-20"
                  placeholder="Additional notes for the interview..."
                  value={interviewForm.notes}
                  onChange={(e) => setInterviewForm(prev => ({ ...prev, notes: e.target.value }))}
                />
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                onClick={() => setInterviewDialogOpen(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmitInterview}
                disabled={actionLoading || !interviewForm.scheduledTime || !interviewForm.interviewerId}
                className="flex-1"
              >
                {actionLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Calendar className="h-4 w-4 mr-2" />}
                Schedule Interview
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
