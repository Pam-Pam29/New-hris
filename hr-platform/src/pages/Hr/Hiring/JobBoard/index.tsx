import React, { useState, useEffect } from 'react';
import { TypographyH2 } from '../../../../components/ui/typography';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../../../components/ui/card';
import { Button } from '../../../../components/ui/button';
import { Input } from '../../../../components/ui/input';
import { Badge } from '../../../../components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../../../../components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../../components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../../components/ui/table';
import { Label } from '../../../../components/ui/label';
import { Textarea } from '../../../../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../../components/ui/select';
import { Alert, AlertDescription } from '../../../../components/ui/alert';
import { useToast } from '../../../../hooks/use-toast';
import {
    BookOpen,
    Plus,
    Search,
    Filter,
    Briefcase,
    MapPin,
    Calendar,
    Clock,
    Eye,
    Edit,
    Loader2,
    AlertTriangle,
    Users,
    Building,
    FileText
} from 'lucide-react';

// Import Firebase services
import { getServiceConfig } from '../../../../config/firebase';
import { JobPosting, JobApplication } from '../../../../services/jobBoardService';

// Firebase service instances
const { db } = getServiceConfig();
let jobBoardServiceInstance: any = null;

// Initialize services
const getJobBoardService = async () => {
    if (!jobBoardServiceInstance) {
        const { FirebaseJobBoardService } = await import('../../../../services/jobBoardService');
        jobBoardServiceInstance = new FirebaseJobBoardService(db);
    }
    return jobBoardServiceInstance;
};

export default function JobBoard() {
    const [jobPostings, setJobPostings] = useState<JobPosting[]>([]);
    const [applications, setApplications] = useState<JobApplication[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Dialog states
    const [addJobOpen, setAddJobOpen] = useState(false);
    const [viewJobOpen, setViewJobOpen] = useState(false);
    const [selectedJob, setSelectedJob] = useState<JobPosting | null>(null);

    // Form states
    const [newJob, setNewJob] = useState({
        title: '',
        department: '',
        location: '',
        type: 'full-time' as const,
        salaryRange: '',
        description: '',
        requirements: [] as string[],
        status: 'draft' as const,
        postedDate: null,
        closingDate: null
    });

    const { toast } = useToast();

    // Fetch data on component mount with REAL-TIME sync
    useEffect(() => {
        let unsubscribe: (() => void) | null = null;

        const setupRealtimeSync = async () => {
            try {
                setLoading(true);

                // Import Firebase for real-time listener
                const { collection, onSnapshot } = await import('firebase/firestore');
                const { getFirebaseDb } = await import('../../../../config/firebase');
                const db = getFirebaseDb();

                if (!db) {
                    throw new Error('Firebase not available');
                }

                // Set up real-time listener for job postings
                const jobPostingsRef = collection(db, 'job_postings');

                unsubscribe = onSnapshot(jobPostingsRef, (snapshot) => {
                    const jobs = snapshot.docs.map(doc => ({
                        id: doc.id,
                        ...doc.data()
                    } as JobPosting));

                    setJobPostings(jobs);
                    setLoading(false);
                    console.log('✅ Job Board synced: Jobs updated in real-time');
                }, (err) => {
                    console.error('Error in real-time job sync:', err);
                    setError('Failed to sync job postings. Please refresh.');
                    setLoading(false);
                });

            } catch (err) {
                console.error('Error setting up job board sync:', err);
                setError('Failed to load job board data. Please try again.');
                setLoading(false);
            }
        };

        setupRealtimeSync();

        // Cleanup listener on unmount
        return () => {
            if (unsubscribe) {
                unsubscribe();
                console.log('🔌 Job Board real-time sync disconnected');
            }
        };
    }, []);

    // Handle adding a new job posting
    const handleAddJob = async () => {
        try {
            const jobBoardService = await getJobBoardService();

            // Set posted date if status is published
            const jobToAdd = {
                ...newJob,
                postedDate: newJob.status === 'published' ? new Date() : null
            };

            await jobBoardService.createJobPosting(jobToAdd);

            // Refresh job postings list
            const jobsData = await jobBoardService.getJobPostings();
            setJobPostings(jobsData);

            // Close dialog and reset form
            setAddJobOpen(false);
            setNewJob({
                title: '',
                department: '',
                location: '',
                type: 'full-time',
                salaryRange: '',
                description: '',
                requirements: [],
                status: 'draft',
                postedDate: null,
                closingDate: null
            });

            toast({
                title: 'Success',
                description: 'Job posting added successfully',
            });
        } catch (err) {
            console.error('Error adding job posting:', err);
            toast({
                title: 'Error',
                description: 'Failed to add job posting. Please try again.',
                variant: 'destructive',
            });
        }
    };

    // View job details
    const viewJob = (job: JobPosting) => {
        setSelectedJob(job);
        setViewJobOpen(true);
    };

    // Update job status
    const handleUpdateJobStatus = async (id: string, status: JobPosting['status']) => {
        try {
            const jobBoardService = await getJobBoardService();

            // If changing to published, set posted date
            const updates: Partial<JobPosting> = {
                status,
                postedDate: status === 'published' ? new Date() : null
            };

            await jobBoardService.updateJobPosting(id, updates);

            // Update local state
            setJobPostings(prev =>
                prev.map(job =>
                    job.id === id ? { ...job, ...updates } : job
                )
            );

            // If we're viewing this job, update the selected job too
            if (selectedJob && selectedJob.id === id) {
                setSelectedJob({ ...selectedJob, ...updates });
            }

            toast({
                title: 'Success',
                description: `Job posting ${status === 'published' ? 'published' : status === 'closed' ? 'closed' : 'updated'}`,
            });
        } catch (err) {
            console.error('Error updating job status:', err);
            toast({
                title: 'Error',
                description: 'Failed to update job status',
                variant: 'destructive',
            });
        }
    };

    return (
        <div className="p-8 min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
            {/* Header Section */}
            <div className="mb-8">
                <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                        <BookOpen className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                        <TypographyH2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                            Job Board
                        </TypographyH2>
                        <p className="text-muted-foreground text-sm">Manage job postings and applications</p>
                    </div>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <Card className="border-0 shadow-lg bg-card/50 backdrop-blur-sm">
                    <CardContent className="p-6">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                                <Briefcase className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div>
                                <div className="text-2xl font-bold">
                                    {jobPostings.filter(job => job.status === 'published').length}
                                </div>
                                <div className="text-sm text-muted-foreground">Active Jobs</div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-0 shadow-lg bg-card/50 backdrop-blur-sm">
                    <CardContent className="p-6">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
                                <Users className="h-6 w-6 text-green-600 dark:text-green-400" />
                            </div>
                            <div>
                                <div className="text-2xl font-bold">{applications.length}</div>
                                <div className="text-sm text-muted-foreground">Applications</div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-0 shadow-lg bg-card/50 backdrop-blur-sm">
                    <CardContent className="p-6">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
                                <Building className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                            </div>
                            <div>
                                <div className="text-2xl font-bold">
                                    {new Set(jobPostings.map(job => job.department)).size}
                                </div>
                                <div className="text-sm text-muted-foreground">Departments</div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-0 shadow-lg bg-card/50 backdrop-blur-sm">
                    <CardContent className="p-6">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                                <Calendar className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                            </div>
                            <div>
                                <div className="text-2xl font-bold">
                                    {jobPostings.filter(job => job.status === 'published' && job.closingDate && new Date(job.closingDate) > new Date()).length}
                                </div>
                                <div className="text-sm text-muted-foreground">Closing Soon</div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Job Listings Section */}
                <div className="lg:col-span-2">
                    <Card className="border-0 shadow-lg bg-card/50 backdrop-blur-sm">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle>Job Listings</CardTitle>
                                <CardDescription>Manage your active and draft job postings</CardDescription>
                            </div>
                            <Button onClick={() => setAddJobOpen(true)} className="bg-blue-600 hover:bg-blue-700">
                                <Plus className="h-4 w-4 mr-2" /> Add Job
                            </Button>
                        </CardHeader>
                        <CardContent>
                            {loading ? (
                                <div className="flex justify-center items-center py-8">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                                </div>
                            ) : error ? (
                                <Alert variant="destructive">
                                    <AlertCircle className="h-4 w-4" />
                                    <AlertTitle>Error</AlertTitle>
                                    <AlertDescription>{error}</AlertDescription>
                                </Alert>
                            ) : jobPostings.length === 0 ? (
                                <div className="text-center py-8">
                                    <Briefcase className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                                    <p className="text-muted-foreground">No job postings yet</p>
                                    <Button onClick={() => setAddJobOpen(true)} variant="outline" className="mt-4">
                                        <Plus className="h-4 w-4 mr-2" /> Create your first job posting
                                    </Button>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2 mb-4">
                                        <Input
                                            placeholder="Search jobs..."
                                            className="max-w-sm"
                                            prefix={<Search className="h-4 w-4 text-muted-foreground" />}
                                        />
                                        <Select>
                                            <SelectTrigger className="w-[180px]">
                                                <SelectValue placeholder="All Statuses" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">All Statuses</SelectItem>
                                                <SelectItem value="draft">Draft</SelectItem>
                                                <SelectItem value="published">Published</SelectItem>
                                                <SelectItem value="closed">Closed</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-4">
                                        {jobPostings.map((job) => (
                                            <div
                                                key={job.id}
                                                className="flex flex-col md:flex-row md:items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors cursor-pointer"
                                                onClick={() => viewJob(job)}
                                            >
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <h3 className="font-medium">{job.title}</h3>
                                                        <Badge variant={job.status === 'published' ? 'default' : job.status === 'draft' ? 'outline' : 'secondary'}>
                                                            {job.status === 'published' ? 'Active' : job.status === 'draft' ? 'Draft' : 'Closed'}
                                                        </Badge>
                                                    </div>
                                                    <div className="text-sm text-muted-foreground mt-1">
                                                        <span className="inline-flex items-center mr-3">
                                                            <Building className="h-3 w-3 mr-1" /> {job.department}
                                                        </span>
                                                        <span className="inline-flex items-center mr-3">
                                                            <MapPin className="h-3 w-3 mr-1" /> {job.location}
                                                        </span>
                                                        <span className="inline-flex items-center">
                                                            <Clock className="h-3 w-3 mr-1" /> {job.type}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2 mt-2 md:mt-0">
                                                    {job.status === 'draft' && (
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleUpdateJobStatus(job.id, 'published');
                                                            }}
                                                        >
                                                            Publish
                                                        </Button>
                                                    )}
                                                    {job.status === 'published' && (
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleUpdateJobStatus(job.id, 'closed');
                                                            }}
                                                        >
                                                            Close
                                                        </Button>
                                                    )}
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            viewJob(job);
                                                        }}
                                                    >
                                                        <Eye className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Applications Overview */}
                <div>
                    <Card className="border-0 shadow-lg bg-card/50 backdrop-blur-sm">
                        <CardHeader>
                            <CardTitle>Recent Applications</CardTitle>
                            <CardDescription>Latest job applications received</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {applications.length === 0 ? (
                                <div className="text-center py-8">
                                    <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                                    <p className="text-muted-foreground">No applications yet</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {/* Application items would go here */}
                                    <div className="text-center py-4">
                                        <p className="text-muted-foreground">Applications will appear here</p>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Add Job Dialog */}
            <Dialog open={addJobOpen} onOpenChange={setAddJobOpen}>
                <DialogContent className="sm:max-w-[600px]">
                    <DialogHeader>
                        <DialogTitle>Add New Job Posting</DialogTitle>
                        <DialogDescription>
                            Create a new job posting to attract candidates.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="title">Job Title</Label>
                                <Input
                                    id="title"
                                    value={newJob.title}
                                    onChange={(e) => setNewJob({ ...newJob, title: e.target.value })}
                                    placeholder="e.g. Frontend Developer"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="department">Department</Label>
                                <Input
                                    id="department"
                                    value={newJob.department}
                                    onChange={(e) => setNewJob({ ...newJob, department: e.target.value })}
                                    placeholder="e.g. Engineering"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="location">Location</Label>
                                <Input
                                    id="location"
                                    value={newJob.location}
                                    onChange={(e) => setNewJob({ ...newJob, location: e.target.value })}
                                    placeholder="e.g. Remote, New York"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="type">Job Type</Label>
                                <Select
                                    value={newJob.type}
                                    onValueChange={(value) => setNewJob({ ...newJob, type: value as any })}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select job type" />
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
                            <Label htmlFor="salaryRange">Salary Range</Label>
                            <Input
                                id="salaryRange"
                                value={newJob.salaryRange}
                                onChange={(e) => setNewJob({ ...newJob, salaryRange: e.target.value })}
                                placeholder="e.g. $80,000 - $100,000"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description">Job Description</Label>
                            <Textarea
                                id="description"
                                value={newJob.description}
                                onChange={(e) => setNewJob({ ...newJob, description: e.target.value })}
                                placeholder="Describe the job role, responsibilities, and requirements"
                                className="min-h-[100px]"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="status">Posting Status</Label>
                            <Select
                                value={newJob.status}
                                onValueChange={(value) => setNewJob({ ...newJob, status: value as any })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="draft">Save as Draft</SelectItem>
                                    <SelectItem value="published">Publish Immediately</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="closingDate">Closing Date (Optional)</Label>
                            <Input
                                id="closingDate"
                                type="date"
                                onChange={(e) => setNewJob({ ...newJob, closingDate: e.target.value ? new Date(e.target.value) : null })}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setAddJobOpen(false)}>Cancel</Button>
                        <Button onClick={handleAddJob} disabled={!newJob.title || !newJob.department}>Add Job</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* View Job Dialog */}
            <Dialog open={viewJobOpen} onOpenChange={setViewJobOpen}>
                <DialogContent className="sm:max-w-[600px]">
                    {selectedJob && (
                        <>
                            <DialogHeader>
                                <div className="flex items-center justify-between">
                                    <DialogTitle>{selectedJob.title}</DialogTitle>
                                    <Badge variant={selectedJob.status === 'published' ? 'default' : selectedJob.status === 'draft' ? 'outline' : 'secondary'}>
                                        {selectedJob.status === 'published' ? 'Active' : selectedJob.status === 'draft' ? 'Draft' : 'Closed'}
                                    </Badge>
                                </div>
                                <DialogDescription>
                                    <div className="flex items-center gap-3 mt-2">
                                        <span className="inline-flex items-center">
                                            <Building className="h-3 w-3 mr-1" /> {selectedJob.department}
                                        </span>
                                        <span className="inline-flex items-center">
                                            <MapPin className="h-3 w-3 mr-1" /> {selectedJob.location}
                                        </span>
                                        <span className="inline-flex items-center">
                                            <Clock className="h-3 w-3 mr-1" /> {selectedJob.type}
                                        </span>
                                    </div>
                                </DialogDescription>
                            </DialogHeader>
                            <div className="py-4">
                                {selectedJob.salaryRange && (
                                    <div className="mb-4">
                                        <h4 className="text-sm font-medium mb-1">Salary Range</h4>
                                        <p>{selectedJob.salaryRange}</p>
                                    </div>
                                )}

                                <div className="mb-4">
                                    <h4 className="text-sm font-medium mb-1">Job Description</h4>
                                    <p className="whitespace-pre-line">{selectedJob.description}</p>
                                </div>

                                {selectedJob.requirements && selectedJob.requirements.length > 0 && (
                                    <div className="mb-4">
                                        <h4 className="text-sm font-medium mb-1">Requirements</h4>
                                        <ul className="list-disc pl-5 space-y-1">
                                            {selectedJob.requirements.map((req, index) => (
                                                <li key={index}>{req}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mt-4">
                                    {selectedJob.postedDate && (
                                        <div>
                                            <span className="font-medium">Posted:</span> {new Date(selectedJob.postedDate).toLocaleDateString()}
                                        </div>
                                    )}
                                    {selectedJob.closingDate && (
                                        <div>
                                            <span className="font-medium">Closing:</span> {new Date(selectedJob.closingDate).toLocaleDateString()}
                                        </div>
                                    )}
                                </div>
                            </div>
                            <DialogFooter>
                                {selectedJob.status === 'draft' && (
                                    <Button
                                        variant="outline"
                                        onClick={() => handleUpdateJobStatus(selectedJob.id, 'published')}
                                    >
                                        Publish
                                    </Button>
                                )}
                                {selectedJob.status === 'published' && (
                                    <Button
                                        variant="outline"
                                        onClick={() => handleUpdateJobStatus(selectedJob.id, 'closed')}
                                    >
                                        Close Job
                                    </Button>
                                )}
                                <Button onClick={() => setViewJobOpen(false)}>Close</Button>
                            </DialogFooter>
                        </>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
