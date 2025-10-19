import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Button } from '../../../../components/ui/button';
import { Card, CardContent, CardHeader } from '../../../../components/ui/card';
import { TypographyH2, TypographyH3 } from '../../../../components/ui/typography';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../../components/ui/select';
import { Input } from '../../../../components/ui/input';
import { Badge } from '../../../../components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../../../../components/ui/dialog';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../../../components/ui/tabs';
import { useCompany } from '../../../../context/CompanyContext';
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
  X,
  Bell,
  Zap,
  UserCheck
} from 'lucide-react';

// Import Firebase services
import { getServiceConfig } from '../../../../config/firebase';
import { RecruitmentCandidate, Interview } from '../../../../services/recruitmentService';
import { JobPosting } from '../../../../services/jobBoardService';

// Import UI components
import { Label } from '../../../../components/ui/label';
import { Textarea } from '../../../../components/ui/textarea';
import { Alert, AlertDescription } from '../../../../components/ui/alert';
import { formatSalaryRange } from '../../../../utils/currency';

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
  // Get current company context
  const { companyId, company } = useCompany();

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
    interviewers: [''], // Panel interview support
    meetingLink: '',
    sendEmailNotification: true, // Auto-send email to candidate
    addToCalendar: true, // Generate calendar invite
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

  // Load data on component mount with REAL-TIME sync for jobs, candidates, and interviews
  useEffect(() => {
    if (!companyId) {
      console.log('⏳ Waiting for company to be loaded...');
      return; // Wait for company to load
    }

    let jobsUnsubscribe: (() => void) | null = null;
    let candidatesUnsubscribe: (() => void) | null = null;
    let interviewsUnsubscribe: (() => void) | null = null;

    const loadData = async () => {
      try {
        setLoading(true);

        // Set up REAL-TIME listeners for jobs, candidates, and interviews (all filtered by company)
        const { collection, query, where, onSnapshot } = await import('firebase/firestore');
        const { getFirebaseDb } = await import('../../../../config/firebase');
        const db = getFirebaseDb();

        if (!db) {
          throw new Error('Firebase not available');
        }

        // 1. Set up REAL-TIME listener for JOBS
        const jobPostingsRef = collection(db, 'job_postings');
        const jobsQuery = query(jobPostingsRef, where('companyId', '==', companyId));

        jobsUnsubscribe = onSnapshot(jobsQuery, (snapshot) => {
          const jobsData = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));

          // Convert Firebase Timestamps to JavaScript Dates
          const jobsWithDates = jobsData.map((job: any) => ({
            ...job,
            postedDate: job.postedDate ? new Date(job.postedDate) : null,
            closingDate: job.closingDate ? new Date(job.closingDate) : null,
          }));

          setJobs(jobsWithDates);
          console.log(`✅ ${company?.displayName || 'Company'}: Jobs synced (${jobsWithDates.length})`);
        });

        // 2. Set up REAL-TIME listener for CANDIDATES
        const candidatesRef = collection(db, 'recruitment_candidates');
        const candidatesQuery = query(candidatesRef, where('companyId', '==', companyId));

        candidatesUnsubscribe = onSnapshot(candidatesQuery, (snapshot) => {
          const candidatesData = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          setCandidates(candidatesData as any);
          console.log(`✅ ${company?.displayName || 'Company'}: Candidates synced (${candidatesData.length})`);
        });

        // 3. Set up REAL-TIME listener for INTERVIEWS
        const interviewsRef = collection(db, 'interviews');
        const interviewsQuery = query(interviewsRef, where('companyId', '==', companyId));

        interviewsUnsubscribe = onSnapshot(interviewsQuery, (snapshot) => {
          const interviewsData = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));

          // Convert Firebase Timestamps to JavaScript Dates for interviews
          const interviewsWithDates = interviewsData.map((interview: any) => {
            let scheduledTime: Date | null = null;

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
          console.log(`✅ ${company?.displayName || 'Company'}: Interviews synced (${interviewsWithDates.length})`);
        });

        setLoading(false);
      } catch (error) {
        console.error('Error loading recruitment data:', error);
        setError('Failed to load recruitment data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    loadData();

    // Cleanup all real-time listeners on unmount or company change
    return () => {
      if (jobsUnsubscribe) {
        jobsUnsubscribe();
        console.log('🔌 Jobs sync disconnected');
      }
      if (candidatesUnsubscribe) {
        candidatesUnsubscribe();
        console.log('🔌 Candidates sync disconnected');
      }
      if (interviewsUnsubscribe) {
        interviewsUnsubscribe();
        console.log('🔌 Interviews sync disconnected');
      }
    };
  }, [companyId]); // Re-run when company changes

  // REMOVED: Automatic orphaned interview cleanup caused infinite loop
  // Orphaned interviews (interviews linked to deleted candidates) should be 
  // cleaned up manually or through a scheduled maintenance task, not automatically
  // on every state change. The previous implementation had `interviews` in the 
  // dependency array which triggered the effect every time interviews were updated,
  // creating an infinite loop.

  // Handle add job
  const handleAddJob = async () => {
    if (!newJobForm.title || !newJobForm.department || !newJobForm.location) {
      setError('Please fill in all required fields');
      return;
    }

    if (!companyId) {
      setError('No company selected. Please set your company in settings.');
      return;
    }

    setActionLoading(true);
    try {
      const jobData = {
        ...newJobForm,
        companyId: companyId, // ← Add company ID for multi-tenancy!
        requirements: newJobForm.requirements.filter(req => req.trim() !== ''),
        status: 'published' as const,
        postedDate: new Date(newJobForm.postedDate),
        closingDate: null
      };

      const jobBoardService = await getJobBoardService();
      await jobBoardService.createJobPosting(jobData);
      setSuccess(`Job posting created for ${company?.displayName || 'company'}: ${jobData.title}`);
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

    if (!companyId) {
      setError('No company selected. Please set your company in settings.');
      return;
    }

    setActionLoading(true);
    try {
      const candidateData = {
        ...newCandidateForm,
        companyId: companyId, // ← Add company ID for multi-tenancy!
        skills: newCandidateForm.skills.filter(skill => skill.trim() !== ''),
        status: 'new' as const,
        resumeUrl: '' // This would be handled by file upload in a real implementation
      };

      const recruitmentService = await getRecruitmentService();
      await recruitmentService.addCandidate(candidateData);
      setSuccess(`Candidate added for ${company?.displayName || 'company'}: ${candidateData.name}`);
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
        let scheduledTime: Date | null = null;

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
      interviewers: [''],
      meetingLink: '',
      sendEmailNotification: true,
      addToCalendar: true,
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

      // Filter out empty interviewers
      const panelInterviewers = interviewForm.interviewers.filter(id => id.trim() !== '');

      // Build interview data (conditionally include optional fields to avoid Firebase undefined errors)
      const interviewData: any = {
        companyId: companyId!, // ← Add company ID for multi-tenancy!
        candidateId: selectedCandidateForInterview.id,
        interviewerId: interviewForm.interviewerId,
        scheduledTime: new Date(interviewForm.scheduledTime),
        duration: interviewForm.duration,
        type: interviewForm.type,
        status: 'scheduled' as const,
        reminderSent: false,
        candidateNotified: false
      };

      // Only add optional fields if they have values (Firebase doesn't accept undefined)
      if (panelInterviewers.length > 0) {
        interviewData.interviewers = panelInterviewers;
      }

      if (interviewForm.meetingLink && interviewForm.meetingLink.trim()) {
        interviewData.meetingLink = interviewForm.meetingLink.trim();
      }

      if (interviewForm.notes && interviewForm.notes.trim()) {
        interviewData.feedback = interviewForm.notes.trim();
      }

      await recruitmentService.scheduleInterview(interviewData);

      // Update candidate status to 'interviewing'
      await recruitmentService.updateCandidateStatus(selectedCandidateForInterview.id, 'interviewing');

      // Send email notification if enabled
      if (interviewForm.sendEmailNotification && selectedCandidateForInterview.email) {
        try {
          const { EmailNotificationService } = await import('../../../../services/emailNotificationService');
          const emailData = {
            candidateName: selectedCandidateForInterview.name,
            candidateEmail: selectedCandidateForInterview.email,
            jobTitle: selectedCandidateForInterview.position,
            interviewDate: new Date(interviewForm.scheduledTime),
            duration: interviewForm.duration,
            interviewType: interviewForm.type,
            meetingLink: interviewForm.meetingLink,
            interviewers: panelInterviewers.length > 0 ? panelInterviewers : undefined,
            notes: interviewForm.notes,
            companyName: company?.displayName || 'Our Company'
          };

          const email = EmailNotificationService.generateInterviewEmail(emailData);
          await EmailNotificationService.sendEmail(email);
          console.log('✅ Email notification sent to candidate');
        } catch (error) {
          console.error('Failed to send email:', error);
        }
      }

      // Generate calendar invite if enabled
      if (interviewForm.addToCalendar) {
        try {
          const { CalendarService } = await import('../../../../services/calendarService');
          CalendarService.downloadInterviewInvite(
            selectedCandidateForInterview.name,
            selectedCandidateForInterview.position,
            selectedCandidateForInterview.email,
            new Date(interviewForm.scheduledTime),
            interviewForm.duration,
            interviewForm.type,
            interviewForm.meetingLink,
            panelInterviewers.length > 0 ? panelInterviewers : undefined,
            company?.displayName || 'Our Company'
          );
          console.log('✅ Calendar invite generated');
        } catch (error) {
          console.error('Failed to generate calendar invite:', error);
        }
      }

      setSuccess(`Interview scheduled successfully for ${selectedCandidateForInterview.name}${interviewForm.sendEmailNotification ? ' (Email sent)' : ''}`);
      setInterviewDialogOpen(false);
      setSelectedCandidateForInterview(null);

      // Reset interview form
      setInterviewForm({
        scheduledTime: '',
        duration: 60,
        type: 'video' as 'phone' | 'video' | 'onsite',
        interviewerId: '',
        interviewers: [''],
        meetingLink: '',
        sendEmailNotification: true,
        addToCalendar: true,
        notes: ''
      });

      // Reload candidates and interviews
      const [updatedCandidates, updatedInterviews] = await Promise.all([
        recruitmentService.getCandidates(),
        recruitmentService.getInterviews()
      ]);

      // Convert Firebase Timestamps to JavaScript Dates for interviews
      const interviewsWithDates = updatedInterviews.map((interview: any) => {
        let scheduledTime: Date | null = null;

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

  // Calculate applicants per job
  const jobApplicantCount = useMemo(() => {
    const counts: Record<string, number> = {};
    candidates.forEach(candidate => {
      if (candidate.jobId) {
        counts[candidate.jobId] = (counts[candidate.jobId] || 0) + 1;
      }
    });
    return counts;
  }, [candidates]);

  // Calculate urgent items for "Needs Attention" section
  const urgentItems = useMemo(() => {
    const now = new Date();
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const urgent: Array<{ type: string; message: string; priority: 'high' | 'medium' | 'low'; action?: () => void }> = [];

    // Interviews happening today or tomorrow
    getUpcomingInterviews.forEach(interview => {
      if (interview.scheduledTime) {
        const interviewDate = new Date(interview.scheduledTime);
        const candidate = candidates.find(c => c.id === interview.candidateId);
        const hoursDiff = (interviewDate.getTime() - now.getTime()) / (1000 * 60 * 60);

        if (hoursDiff < 24 && hoursDiff > 0) {
          urgent.push({
            type: 'interview-today',
            message: `Interview ${hoursDiff < 3 ? 'in ' + Math.floor(hoursDiff) + 'h' : 'today'}: ${candidate?.name || 'Candidate'} @ ${interviewDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`,
            priority: 'high'
          });
        } else if (hoursDiff < 48 && hoursDiff >= 24) {
          urgent.push({
            type: 'interview-tomorrow',
            message: `Interview tomorrow: ${candidate?.name || 'Candidate'} @ ${interviewDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`,
            priority: 'medium'
          });
        }
      }
    });

    // Candidates pending review for > 7 days
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const pendingCandidates = candidates.filter(c => {
      const candidateWithDate = c as any;
      return (c.status === 'new' || c.status === 'screening') &&
        candidateWithDate.createdAt && new Date(candidateWithDate.createdAt) < sevenDaysAgo;
    });
    if (pendingCandidates.length > 0) {
      urgent.push({
        type: 'pending-candidates',
        message: `${pendingCandidates.length} candidate${pendingCandidates.length > 1 ? 's' : ''} waiting > 7 days for review`,
        priority: 'medium'
      });
    }

    // New candidates (< 24 hours old)
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const newCandidates = candidates.filter(c => {
      const candidateWithDate = c as any;
      return c.status === 'new' && candidateWithDate.createdAt && new Date(candidateWithDate.createdAt) > oneDayAgo;
    });
    if (newCandidates.length > 0) {
      urgent.push({
        type: 'new-candidates',
        message: `${newCandidates.length} new applicant${newCandidates.length > 1 ? 's' : ''} in last 24 hours`,
        priority: 'low'
      });
    }

    return urgent.sort((a, b) => {
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });
  }, [interviews, candidates, getUpcomingInterviews, jobs]);

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
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-3">
          <TypographyH2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Recruitment Management
          </TypographyH2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Streamlined hiring workflow - focus on what matters most
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

        {/* Needs Attention Section */}
        {urgentItems.length > 0 && (
          <Card className="border-l-4 border-l-orange-500 shadow-lg bg-gradient-to-r from-orange-50 to-background">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-orange-600" />
                <TypographyH3 className="text-lg font-semibold text-orange-900 dark:text-orange-400">
                  Needs Attention ({urgentItems.length})
                </TypographyH3>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              {urgentItems.map((item, index) => (
                <div
                  key={index}
                  className={`flex items-start gap-3 p-3 rounded-lg ${item.priority === 'high' ? 'bg-red-100 dark:bg-red-900/20 border-l-4 border-l-red-500' :
                    item.priority === 'medium' ? 'bg-yellow-100 dark:bg-yellow-900/20 border-l-4 border-l-yellow-500' :
                      'bg-blue-100 dark:bg-blue-900/20 border-l-4 border-l-blue-500'
                    }`}
                >
                  <Bell className={`h-4 w-4 mt-0.5 ${item.priority === 'high' ? 'text-red-600' :
                    item.priority === 'medium' ? 'text-yellow-600' :
                      'text-blue-600'
                    }`} />
                  <p className="text-sm font-medium flex-1">{item.message}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="border-0 shadow-md bg-card hover:shadow-lg transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1">Total Jobs</p>
                  <p className="text-2xl font-bold text-foreground">{totalJobs}</p>
                </div>
                <Briefcase className="h-8 w-8 text-blue-500 opacity-70" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md bg-card hover:shadow-lg transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1">Active Jobs</p>
                  <p className="text-2xl font-bold text-foreground">{activeJobs}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-500 opacity-70" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md bg-card hover:shadow-lg transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1">Candidates</p>
                  <p className="text-2xl font-bold text-foreground">{totalCandidates}</p>
                </div>
                <Users className="h-8 w-8 text-purple-500 opacity-70" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md bg-card hover:shadow-lg transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1">Hired</p>
                  <p className="text-2xl font-bold text-foreground">{hiredCandidates}</p>
                </div>
                <UserCheck className="h-8 w-8 text-emerald-500 opacity-70" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tab Navigation */}
        <Tabs defaultValue="jobs" className="w-full">
          <TabsList className="grid w-full grid-cols-3 max-w-md mx-auto">
            <TabsTrigger value="jobs" className="flex items-center gap-2">
              <Briefcase className="h-4 w-4" />
              Jobs ({totalJobs})
            </TabsTrigger>
            <TabsTrigger value="candidates" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Candidates ({totalCandidates})
            </TabsTrigger>
            <TabsTrigger value="interviews" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Interviews ({getUpcomingInterviews.length})
            </TabsTrigger>
          </TabsList>

          {/* Jobs Tab */}
          <TabsContent value="jobs" className="space-y-6 mt-6">
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
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {jobs.map((job) => {
                      const applicantCount = jobApplicantCount[job.id] || 0;
                      return (
                        <Card
                          key={job.id}
                          className="group border hover:border-primary/50 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer"
                          onClick={() => {
                            setSelectedJob(job);
                            setJobDetailsOpen(true);
                          }}
                        >
                          <CardContent className="p-5">
                            {/* Job Title & Department */}
                            <div className="mb-3">
                              <h4 className="font-semibold text-base text-foreground mb-1 group-hover:text-primary transition-colors">
                                {job.title}
                              </h4>
                              <p className="text-sm text-muted-foreground">{job.department} • {job.location}</p>
                            </div>

                            {/* Key Info */}
                            <div className="flex items-center gap-3 text-sm text-muted-foreground mb-3">
                              <div className="flex items-center gap-1">
                                <DollarSign className="h-3 w-3" />
                                <span className="text-xs">{formatSalaryRange(job.salaryRange)}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Users className="h-3 w-3" />
                                <span className="text-xs font-medium">{applicantCount} applicant{applicantCount !== 1 ? 's' : ''}</span>
                              </div>
                            </div>

                            {/* Status & Type */}
                            <div className="flex items-center justify-between gap-2">
                              <Badge
                                variant={job.status === 'published' ? 'success' : job.status === 'closed' ? 'destructive' : 'secondary'}
                                className="text-xs"
                              >
                                {job.status}
                              </Badge>
                              <span className="text-xs text-muted-foreground capitalize">{job.type}</span>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Candidates Tab */}
          <TabsContent value="candidates" className="space-y-6 mt-6">
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
                      const candidateWithDate = candidate as any;

                      // Calculate if candidate is urgent (waiting > 7 days)
                      const isUrgent = candidateWithDate.createdAt &&
                        (new Date().getTime() - new Date(candidateWithDate.createdAt).getTime()) > (7 * 24 * 60 * 60 * 1000) &&
                        (candidate.status === 'new' || candidate.status === 'screening');

                      const isNew = candidateWithDate.createdAt &&
                        (new Date().getTime() - new Date(candidateWithDate.createdAt).getTime()) < (24 * 60 * 60 * 1000);

                      return (
                        <div
                          key={candidate.id}
                          className={`flex items-center justify-between p-4 border rounded-lg hover:bg-muted/30 transition-colors ${isUrgent ? 'border-l-4 border-l-yellow-500 bg-yellow-50/30' :
                            isNew ? 'border-l-4 border-l-blue-500 bg-blue-50/30' :
                              ''
                            }`}
                        >
                          <div className="flex items-center gap-4 flex-1">
                            <div className={`p-2 rounded-full ${candidate.status === 'hired' ? 'bg-green-100' :
                              candidate.status === 'interviewing' ? 'bg-blue-100' :
                                candidate.status === 'rejected' ? 'bg-red-100' :
                                  'bg-purple-100'
                              }`}>
                              <User className={`h-4 w-4 ${candidate.status === 'hired' ? 'text-green-600' :
                                candidate.status === 'interviewing' ? 'text-blue-600' :
                                  candidate.status === 'rejected' ? 'text-red-600' :
                                    'text-purple-600'
                                }`} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <p className="font-medium truncate">{candidate.name}</p>
                                {isUrgent && <Badge variant="warning" className="text-xs">Pending 7d+</Badge>}
                                {isNew && <Badge className="text-xs bg-blue-100 text-blue-700">New</Badge>}
                              </div>
                              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                <span className="truncate">{candidate.email}</span>
                                {job && (
                                  <>
                                    <span>•</span>
                                    <span className="truncate">{job.title}</span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 flex-shrink-0">
                            <Badge
                              variant={
                                candidate.status === 'hired' ? 'success' :
                                  candidate.status === 'interviewing' ? 'default' :
                                    candidate.status === 'rejected' ? 'destructive' :
                                      'secondary'
                              }
                              className="text-xs"
                            >
                              {candidate.status}
                            </Badge>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="default"
                                className="bg-blue-600 hover:bg-blue-700"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedCandidate(candidate);
                                  setCandidateDetailsOpen(true);
                                }}
                              >
                                <Eye className="h-3 w-3 mr-1" />
                                Screen
                              </Button>
                              {candidate.status === 'interviewing' && (
                                <Button
                                  size="sm"
                                  variant="default"
                                  className="bg-green-600 hover:bg-green-700"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleHireCandidate(candidate.id, candidate.name);
                                  }}
                                  disabled={actionLoading}
                                >
                                  <UserCheck className="h-3 w-3 mr-1" />
                                  Hire
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Interviews Tab */}
          <TabsContent value="interviews" className="space-y-6 mt-6">
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
                          let scheduledTime: Date | null = null;

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
                          <div className="flex items-center gap-4 flex-1">
                            <div className="p-2 bg-blue-100 rounded-full">
                              <User className="h-4 w-4 text-blue-600" />
                            </div>
                            <div className="flex-1">
                              <p className="font-medium">{candidate?.name || 'Unknown Candidate'}</p>
                              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                <span>{job?.title || candidate?.position || 'No position'}</span>
                                <span>•</span>
                                <span className="capitalize">{interview.type}</span>
                                <span>•</span>
                                <span>{interview.duration} min</span>
                              </div>
                              {interview.interviewers && interview.interviewers.length > 0 && (
                                <div className="mt-1 text-xs text-muted-foreground">
                                  👥 Panel: {interview.interviewers.join(', ')}
                                </div>
                              )}
                              {interview.meetingLink && (
                                <a
                                  href={interview.meetingLink}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-xs text-blue-600 hover:text-blue-700 hover:underline flex items-center gap-1 mt-1"
                                >
                                  🎥 Google Meet Link
                                </a>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="text-right">
                              <p className="text-sm font-medium">
                                {new Date(interview.scheduledTime).toLocaleDateString()}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {new Date(interview.scheduledTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </p>
                            </div>
                            {interview.meetingLink && interview.type === 'video' && (
                              <Button
                                size="sm"
                                onClick={() => window.open(interview.meetingLink, '_blank')}
                                className="bg-green-600 hover:bg-green-700"
                              >
                                Join Meeting
                              </Button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>

          </TabsContent>
        </Tabs>

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

        {/* Screen Candidate Modal */}
        <Dialog open={candidateDetailsOpen} onOpenChange={() => setCandidateDetailsOpen(false)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl">Screen Candidate</DialogTitle>
              <DialogDescription>
                Review all details for {selectedCandidate?.name} and decide next steps
              </DialogDescription>
            </DialogHeader>
            {selectedCandidate && (
              <div className="space-y-6">
                {/* Status Badge */}
                <div className="flex items-center gap-3">
                  <Badge
                    variant={
                      selectedCandidate.status === 'hired' ? 'success' :
                        selectedCandidate.status === 'interviewing' ? 'default' :
                          selectedCandidate.status === 'rejected' ? 'destructive' :
                            'secondary'
                    }
                    className="text-sm px-3 py-1"
                  >
                    {selectedCandidate.status}
                  </Badge>
                </div>

                {/* Personal Information */}
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold border-b pb-2">Personal Information</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Full Name</Label>
                      <p className="text-sm mt-1 font-medium">{selectedCandidate.name}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Email</Label>
                      <p className="text-sm mt-1">{selectedCandidate.email}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Phone</Label>
                      <p className="text-sm mt-1">{selectedCandidate.phone}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Applied Position</Label>
                      <p className="text-sm mt-1 font-medium">{selectedCandidate.position}</p>
                    </div>
                  </div>
                </div>

                {/* Resume */}
                {selectedCandidate.resumeUrl && (
                  <div className="space-y-3">
                    <h3 className="text-lg font-semibold border-b pb-2">Resume</h3>
                    <a
                      href={selectedCandidate.resumeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 hover:underline"
                    >
                      <Eye className="h-4 w-4" />
                      View Resume
                    </a>
                  </div>
                )}

                {/* Experience */}
                {selectedCandidate.experience && (
                  <div className="space-y-3">
                    <h3 className="text-lg font-semibold border-b pb-2">Experience</h3>
                    <p className="text-sm text-gray-700">{selectedCandidate.experience}</p>
                  </div>
                )}

                {/* Skills */}
                {selectedCandidate.skills && selectedCandidate.skills.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="text-lg font-semibold border-b pb-2">Skills</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedCandidate.skills.map((skill, index) => (
                        <Badge key={index} variant="secondary" className="text-sm">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Notes */}
                {selectedCandidate.notes && (
                  <div className="space-y-3">
                    <h3 className="text-lg font-semibold border-b pb-2">Application Notes</h3>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-sm text-gray-700 whitespace-pre-wrap">{selectedCandidate.notes}</p>
                    </div>
                  </div>
                )}

                {/* Applied Job Details */}
                {selectedCandidate.jobId && (
                  <div className="space-y-3">
                    <h3 className="text-lg font-semibold border-b pb-2">Applied Job</h3>
                    {(() => {
                      const job = jobs.find(j => j.id === selectedCandidate.jobId);
                      return job ? (
                        <div className="bg-blue-50 rounded-lg p-4 space-y-2">
                          <p className="font-semibold text-blue-900">{job.title}</p>
                          <div className="grid grid-cols-2 gap-2 text-sm text-blue-800">
                            <div className="flex items-center gap-2">
                              <Building className="h-4 w-4" />
                              {job.department}
                            </div>
                            <div className="flex items-center gap-2">
                              <MapPin className="h-4 w-4" />
                              {job.location}
                            </div>
                            <div className="flex items-center gap-2">
                              <DollarSign className="h-4 w-4" />
                              {formatSalaryRange(job.salaryRange)}
                            </div>
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4" />
                              {job.type}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <p className="text-sm text-gray-500">Job details not available</p>
                      );
                    })()}
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4 border-t">
                  <Button
                    variant="outline"
                    onClick={() => setCandidateDetailsOpen(false)}
                    className="flex-1"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Close
                  </Button>

                  {selectedCandidate.status !== 'hired' && selectedCandidate.status !== 'interviewing' && selectedCandidate.status !== 'rejected' && (
                    <>
                      <Button
                        variant="destructive"
                        onClick={async () => {
                          if (confirm(`Are you sure you want to reject ${selectedCandidate.name}?`)) {
                            try {
                              const recruitmentService = await getRecruitmentService();
                              await recruitmentService.updateCandidateStatus(selectedCandidate.id, 'rejected');
                              setSuccess(`${selectedCandidate.name} has been rejected`);
                              setCandidateDetailsOpen(false);
                            } catch (error) {
                              setError('Failed to reject candidate');
                            }
                          }
                        }}
                        className="flex-1"
                      >
                        <AlertTriangle className="h-4 w-4 mr-2" />
                        Reject
                      </Button>
                      <Button
                        onClick={() => {
                          setCandidateDetailsOpen(false);
                          handleScheduleInterview(selectedCandidate);
                        }}
                        className="flex-1 bg-blue-600 hover:bg-blue-700"
                      >
                        <Calendar className="h-4 w-4 mr-2" />
                        Schedule Interview
                      </Button>
                    </>
                  )}

                  {selectedCandidate.status === 'interviewing' && (
                    <Button
                      onClick={() => {
                        setCandidateDetailsOpen(false);
                        handleHireCandidate(selectedCandidate.id, selectedCandidate.name);
                      }}
                      className="flex-1 bg-green-600 hover:bg-green-700"
                    >
                      <UserCheck className="h-4 w-4 mr-2" />
                      Hire Candidate
                    </Button>
                  )}
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

        {/* Interview Scheduling Dialog - REDESIGNED */}
        <Dialog open={interviewDialogOpen} onOpenChange={setInterviewDialogOpen}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader className="border-b pb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
                  <Calendar className="h-6 w-6 text-white" />
                </div>
                <div>
                  <DialogTitle className="text-2xl font-bold">Schedule Interview</DialogTitle>
                  <DialogDescription className="text-base">
                    {selectedCandidateForInterview && (
                      <span className="flex items-center gap-2 mt-1">
                        <User className="h-4 w-4" />
                        <strong className="text-foreground">{selectedCandidateForInterview.name}</strong>
                        <span className="text-muted-foreground">•</span>
                        <span>{selectedCandidateForInterview.position}</span>
                      </span>
                    )}
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>

            <div className="space-y-6 py-4">
              {/* Section 1: Basic Details */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                  <Clock className="h-4 w-4 text-blue-600" />
                  <span>Interview Details</span>
                </div>
                <div className="bg-blue-50/50 border border-blue-100 rounded-lg p-4 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="scheduledTime" className="flex items-center gap-2">
                        <Calendar className="h-3 w-3" />
                        Date & Time *
                      </Label>
                      <Input
                        id="scheduledTime"
                        type="datetime-local"
                        value={interviewForm.scheduledTime}
                        onChange={(e) => setInterviewForm(prev => ({ ...prev, scheduledTime: e.target.value }))}
                        className="bg-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="duration" className="flex items-center gap-2">
                        <Clock className="h-3 w-3" />
                        Duration
                      </Label>
                      <div className="flex gap-2">
                        <Input
                          id="duration"
                          type="number"
                          value={interviewForm.duration}
                          onChange={(e) => setInterviewForm(prev => ({ ...prev, duration: parseInt(e.target.value) || 60 }))}
                          className="bg-white"
                        />
                        <span className="flex items-center text-sm text-muted-foreground px-2">min</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="type" className="flex items-center gap-2">
                      <Briefcase className="h-3 w-3" />
                      Interview Type
                    </Label>
                    <select
                      id="type"
                      className="w-full p-2.5 border rounded-md bg-white hover:border-blue-400 transition-colors"
                      value={interviewForm.type}
                      onChange={(e) => setInterviewForm(prev => ({ ...prev, type: e.target.value as 'phone' | 'video' | 'onsite' }))}
                    >
                      <option value="phone">📞 Phone Interview</option>
                      <option value="video">🎥 Video (Google Meet)</option>
                      <option value="onsite">🏢 On-site Interview</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Section 2: Interviewers */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                  <Users className="h-4 w-4 text-purple-600" />
                  <span>Interviewers</span>
                </div>
                <div className="bg-purple-50/50 border border-purple-100 rounded-lg p-4 space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="interviewerId" className="flex items-center gap-2">
                      <UserCheck className="h-3 w-3" />
                      Primary Interviewer ID *
                    </Label>
                    <Input
                      id="interviewerId"
                      placeholder="e.g., INT-001"
                      value={interviewForm.interviewerId}
                      onChange={(e) => setInterviewForm(prev => ({ ...prev, interviewerId: e.target.value }))}
                      className="bg-white"
                    />
                  </div>
                </div>
              </div>

              {/* Panel Interviewers (Optional) */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="flex items-center gap-2 text-sm">
                    <Users className="h-3 w-3" />
                    Panel Interviewers (Optional)
                  </Label>
                  <Badge variant="secondary" className="text-xs">
                    👥 {interviewForm.interviewers.filter(i => i.trim()).length} Panel Members
                  </Badge>
                </div>
                <div className="space-y-2">
                  {interviewForm.interviewers.map((interviewer, index) => (
                    <div key={index} className="flex gap-2 items-center bg-white border rounded-lg p-2">
                      <UserCheck className="h-4 w-4 text-purple-500 ml-2" />
                      <Input
                        placeholder={`Panel Member ${index + 1} ID`}
                        value={interviewer}
                        onChange={(e) => {
                          const newInterviewers = [...interviewForm.interviewers];
                          newInterviewers[index] = e.target.value;
                          setInterviewForm(prev => ({ ...prev, interviewers: newInterviewers }));
                        }}
                        className="border-0 focus-visible:ring-0"
                      />
                      {index === interviewForm.interviewers.length - 1 ? (
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() => setInterviewForm(prev => ({
                            ...prev,
                            interviewers: [...prev.interviewers, '']
                          }))}
                          className="bg-purple-50 border-purple-200 text-purple-700 hover:bg-purple-100"
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      ) : (
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            const newInterviewers = interviewForm.interviewers.filter((_, i) => i !== index);
                            setInterviewForm(prev => ({ ...prev, interviewers: newInterviewers }));
                          }}
                          className="hover:bg-red-50 hover:border-red-200 hover:text-red-600"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                  <p className="text-xs text-muted-foreground flex items-center gap-1 mt-2">
                    <AlertTriangle className="h-3 w-3" />
                    Add multiple interviewers for panel interviews
                  </p>
                </div>
              </div>

              {/* Meeting Link (for video interviews) */}
              {interviewForm.type === 'video' && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                    <Zap className="h-4 w-4 text-green-600" />
                    <span>Video Conference</span>
                  </div>
                  <div className="bg-green-50/50 border border-green-100 rounded-lg p-4 space-y-3">
                    <div className="space-y-2">
                      <Label htmlFor="meetingLink" className="flex items-center gap-2">
                        <Bell className="h-3 w-3" />
                        Google Meet Link
                      </Label>
                      <Input
                        id="meetingLink"
                        type="url"
                        placeholder="https://meet.google.com/xxx-xxxx-xxx"
                        value={interviewForm.meetingLink}
                        onChange={(e) => setInterviewForm(prev => ({ ...prev, meetingLink: e.target.value }))}
                        className="bg-white"
                      />
                    </div>
                    <div className="bg-white border border-green-200 rounded-md p-3 flex items-start gap-2">
                      <Zap className="h-4 w-4 text-green-600 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-xs font-medium text-foreground">Quick Create Meeting</p>
                        <a
                          href="https://meet.google.com/new"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-green-600 hover:text-green-700 hover:underline font-medium"
                        >
                          → Click to create instant Google Meet
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Notification Options */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                  <Bell className="h-4 w-4 text-orange-600" />
                  <span>Notifications & Calendar</span>
                </div>
                <div className="bg-orange-50/50 border border-orange-100 rounded-lg p-4 space-y-3">
                  <div className="flex items-start gap-3 p-3 bg-white border border-orange-100 rounded-lg hover:border-orange-200 transition-colors cursor-pointer"
                    onClick={() => setInterviewForm(prev => ({ ...prev, sendEmailNotification: !prev.sendEmailNotification }))}>
                    <input
                      type="checkbox"
                      id="sendEmailNotification"
                      checked={interviewForm.sendEmailNotification}
                      onChange={(e) => setInterviewForm(prev => ({ ...prev, sendEmailNotification: e.target.checked }))}
                      className="w-5 h-5 mt-0.5"
                      onClick={(e) => e.stopPropagation()}
                    />
                    <div className="flex-1">
                      <Label htmlFor="sendEmailNotification" className="text-sm font-medium cursor-pointer flex items-center gap-2">
                        <span className="text-lg">📧</span>
                        Send Email Notification
                      </Label>
                      {selectedCandidateForInterview && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Will send to: <strong>{selectedCandidateForInterview.email}</strong>
                        </p>
                      )}
                    </div>
                    {interviewForm.sendEmailNotification && (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    )}
                  </div>

                  <div className="flex items-start gap-3 p-3 bg-white border border-orange-100 rounded-lg hover:border-orange-200 transition-colors cursor-pointer"
                    onClick={() => setInterviewForm(prev => ({ ...prev, addToCalendar: !prev.addToCalendar }))}>
                    <input
                      type="checkbox"
                      id="addToCalendar"
                      checked={interviewForm.addToCalendar}
                      onChange={(e) => setInterviewForm(prev => ({ ...prev, addToCalendar: e.target.checked }))}
                      className="w-5 h-5 mt-0.5"
                      onClick={(e) => e.stopPropagation()}
                    />
                    <div className="flex-1">
                      <Label htmlFor="addToCalendar" className="text-sm font-medium cursor-pointer flex items-center gap-2">
                        <span className="text-lg">📅</span>
                        Generate Calendar Invite
                      </Label>
                      <p className="text-xs text-muted-foreground mt-1">
                        Downloads ICS file (works with all calendars)
                      </p>
                    </div>
                    {interviewForm.addToCalendar && (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    )}
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                  <Edit className="h-4 w-4 text-gray-600" />
                  <span>Additional Notes</span>
                </div>
                <Textarea
                  id="notes"
                  placeholder="Add any additional notes or special instructions for the interview..."
                  value={interviewForm.notes}
                  onChange={(e) => setInterviewForm(prev => ({ ...prev, notes: e.target.value }))}
                  className="min-h-24 bg-white"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-6 border-t">
              <Button
                variant="outline"
                onClick={() => setInterviewDialogOpen(false)}
                className="flex-1 h-12"
                type="button"
              >
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
              <Button
                onClick={handleSubmitInterview}
                disabled={actionLoading || !interviewForm.scheduledTime || !interviewForm.interviewerId}
                className="flex-1 h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all"
                type="button"
              >
                {actionLoading ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    Scheduling...
                  </>
                ) : (
                  <>
                    <Calendar className="h-5 w-5 mr-2" />
                    Schedule Interview
                  </>
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
