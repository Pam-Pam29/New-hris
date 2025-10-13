import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Badge } from '../components/ui/badge';
import {
    ArrowLeft,
    CheckCircle,
    Briefcase,
    MapPin,
    DollarSign,
    Clock,
    Upload,
    Loader2,
    AlertTriangle
} from 'lucide-react';
import { Company } from '../types/company';
import { getCompanyService } from '../services/companyService';
import { formatSalaryRange } from '../utils/currency';

interface JobPosting {
    id: string;
    companyId: string;
    title: string;
    department: string;
    location: string;
    type: string;
    salaryRange: string;
    description: string;
    requirements: string[];
}

export default function ApplyPage() {
    const { companyDomain, jobId } = useParams();
    const navigate = useNavigate();

    const [company, setCompany] = useState<Company | null>(null);
    const [job, setJob] = useState<JobPosting | null>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        resumeUrl: '',
        experience: '',
        skills: '',
        coverLetter: ''
    });

    // Load company and job
    useEffect(() => {
        const loadData = async () => {
            try {
                setLoading(true);

                // Load company
                if (companyDomain) {
                    const companyService = await getCompanyService();
                    const companyData = await companyService.getCompanyByDomain(companyDomain);

                    if (!companyData) {
                        setError(`Company "${companyDomain}" not found`);
                        setLoading(false);
                        return;
                    }

                    setCompany(companyData);

                    // Load job
                    if (jobId) {
                        const { collection, doc, getDoc } = await import('firebase/firestore');
                        const { getFirebaseDb } = await import('../config/firebase');
                        const db = getFirebaseDb();

                        if (!db) {
                            setError('Unable to connect to database');
                            setLoading(false);
                            return;
                        }

                        const jobRef = doc(db, 'job_postings', jobId);
                        const jobSnap = await getDoc(jobRef);

                        if (!jobSnap.exists()) {
                            setError('Job not found');
                            setLoading(false);
                            return;
                        }

                        const jobData = { id: jobSnap.id, ...jobSnap.data() } as JobPosting;

                        // Verify job belongs to this company
                        if (jobData.companyId !== companyData.id) {
                            setError('Job does not belong to this company');
                            setLoading(false);
                            return;
                        }

                        setJob(jobData);
                    }
                } else {
                    setError('Company not specified in URL');
                }

                setLoading(false);
            } catch (err) {
                console.error('Error loading application page:', err);
                setError('Failed to load job information');
                setLoading(false);
            }
        };

        loadData();
    }, [companyDomain, jobId]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!company || !job) {
            setError('Missing company or job information');
            return;
        }

        // Validation
        if (!formData.name || !formData.email || !formData.phone) {
            setError('Please fill in all required fields');
            return;
        }

        setSubmitting(true);
        setError(null);

        try {
            const { collection, addDoc, Timestamp } = await import('firebase/firestore');
            const { getFirebaseDb } = await import('../config/firebase');
            const db = getFirebaseDb();

            if (!db) {
                throw new Error('Database connection failed');
            }

            // Create recruitment candidate directly
            const candidateData = {
                companyId: company.id, // ← Multi-tenancy: Company ID from job
                name: formData.name,
                email: formData.email,
                phone: formData.phone,
                position: job.title,
                jobId: job.id,
                status: 'new',
                resumeUrl: formData.resumeUrl || '',
                skills: formData.skills.split(',').map(s => s.trim()).filter(s => s),
                experience: formData.experience,
                notes: `Applied via careers page on ${new Date().toLocaleDateString()}\n\nCover Letter:\n${formData.coverLetter}`,
                createdAt: Timestamp.now(),
                updatedAt: Timestamp.now()
            };

            const candidatesRef = collection(db, 'recruitment_candidates');
            await addDoc(candidatesRef, candidateData);

            console.log(`✅ Application submitted for ${company.displayName}: ${formData.name}`);
            setSubmitted(true);

        } catch (err: any) {
            console.error('Error submitting application:', err);
            setError(`Failed to submit application: ${err.message}`);
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-xl text-gray-600">Loading application...</p>
                </div>
            </div>
        );
    }

    if (submitted && company && job) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
                <Card className="max-w-2xl w-full">
                    <CardContent className="text-center py-12">
                        <CheckCircle className="h-20 w-20 text-green-500 mx-auto mb-6" />
                        <h1 className="text-3xl font-bold mb-3">Application Submitted!</h1>
                        <p className="text-xl text-gray-600 mb-2">
                            Thank you for applying to <strong>{company.displayName}</strong>
                        </p>
                        <p className="text-gray-600 mb-8">
                            We've received your application for <strong>{job.title}</strong>.
                            Our HR team will review it and get back to you soon.
                        </p>

                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8 text-left">
                            <h3 className="font-semibold text-blue-900 mb-2">What happens next?</h3>
                            <ul className="text-sm text-blue-800 space-y-2">
                                <li>✅ Your application is now in our recruitment system</li>
                                <li>📧 You'll receive a confirmation email shortly</li>
                                <li>👀 Our HR team will review your qualifications</li>
                                <li>📞 If selected, we'll contact you for an interview</li>
                            </ul>
                        </div>

                        <div className="flex gap-3 justify-center">
                            <Button
                                variant="outline"
                                onClick={() => navigate(`/careers/${companyDomain}`)}
                            >
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Back to Careers
                            </Button>
                            <Button
                                onClick={() => navigate(`/careers/${companyDomain}`)}
                                className="bg-blue-600 hover:bg-blue-700"
                            >
                                Browse More Jobs
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (error || !company || !job) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
                <Card className="max-w-md w-full">
                    <CardContent className="text-center py-12">
                        <AlertTriangle className="h-16 w-16 text-red-500 mx-auto mb-4" />
                        <h2 className="text-2xl font-bold mb-2">Oops!</h2>
                        <p className="text-gray-600 mb-6">{error || 'Job not found'}</p>
                        <Button onClick={() => navigate(`/careers/${companyDomain || ''}`)}>
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back to Careers
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12 px-4">
            <div className="max-w-4xl mx-auto">
                {/* Back Button */}
                <Button
                    variant="ghost"
                    onClick={() => navigate(`/careers/${companyDomain}`)}
                    className="mb-6"
                >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Careers
                </Button>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Job Info Sidebar */}
                    <div className="lg:col-span-1">
                        <Card className="sticky top-6">
                            <CardHeader>
                                <CardTitle className="text-lg">You're Applying For</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <h3 className="font-bold text-xl mb-2">{job.title}</h3>
                                    <p className="text-gray-600 mb-4">{company.displayName}</p>
                                </div>

                                <div className="space-y-2 text-sm text-gray-600">
                                    <div className="flex items-center gap-2">
                                        <MapPin className="h-4 w-4" />
                                        <span>{job.location}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Clock className="h-4 w-4" />
                                        <span className="capitalize">{job.type.replace('-', ' ')}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <DollarSign className="h-4 w-4" />
                                        <span>{formatSalaryRange(job.salaryRange)}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Briefcase className="h-4 w-4" />
                                        <span>{job.department}</span>
                                    </div>
                                </div>

                                <div className="pt-4 border-t">
                                    <Badge className="bg-green-500 text-white">Open Position</Badge>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Application Form */}
                    <div className="lg:col-span-2">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-2xl">Submit Your Application</CardTitle>
                                <p className="text-gray-600">Fill in your details below. Fields marked with * are required.</p>
                            </CardHeader>

                            <CardContent>
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    {/* Personal Information */}
                                    <div className="space-y-4">
                                        <h3 className="text-lg font-semibold border-b pb-2">Personal Information</h3>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <Label htmlFor="name">Full Name *</Label>
                                                <Input
                                                    id="name"
                                                    required
                                                    placeholder="John Doe"
                                                    value={formData.name}
                                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                    className="mt-1"
                                                />
                                            </div>

                                            <div>
                                                <Label htmlFor="email">Email Address *</Label>
                                                <Input
                                                    id="email"
                                                    type="email"
                                                    required
                                                    placeholder="john@email.com"
                                                    value={formData.email}
                                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                                    className="mt-1"
                                                />
                                            </div>

                                            <div>
                                                <Label htmlFor="phone">Phone Number *</Label>
                                                <Input
                                                    id="phone"
                                                    type="tel"
                                                    required
                                                    placeholder="+1 (555) 000-0000"
                                                    value={formData.phone}
                                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                                    className="mt-1"
                                                />
                                            </div>

                                            <div>
                                                <Label htmlFor="resumeUrl">Resume URL *</Label>
                                                <Input
                                                    id="resumeUrl"
                                                    type="url"
                                                    required
                                                    placeholder="https://drive.google.com/..."
                                                    value={formData.resumeUrl}
                                                    onChange={(e) => setFormData({ ...formData, resumeUrl: e.target.value })}
                                                    className="mt-1"
                                                />
                                                <p className="text-xs text-gray-500 mt-1">
                                                    Upload your resume to Google Drive, Dropbox, or similar and paste the public link
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Professional Information */}
                                    <div className="space-y-4">
                                        <h3 className="text-lg font-semibold border-b pb-2">Professional Background</h3>

                                        <div>
                                            <Label htmlFor="experience">Years of Experience</Label>
                                            <Input
                                                id="experience"
                                                placeholder="e.g., 5 years in software development"
                                                value={formData.experience}
                                                onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                                                className="mt-1"
                                            />
                                        </div>

                                        <div>
                                            <Label htmlFor="skills">Skills (comma-separated)</Label>
                                            <Input
                                                id="skills"
                                                placeholder="e.g., React, TypeScript, Node.js, Python"
                                                value={formData.skills}
                                                onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                                                className="mt-1"
                                            />
                                        </div>

                                        <div>
                                            <Label htmlFor="coverLetter">Cover Letter / Why You're a Great Fit</Label>
                                            <Textarea
                                                id="coverLetter"
                                                rows={6}
                                                placeholder="Tell us why you're interested in this position and what makes you a great fit..."
                                                value={formData.coverLetter}
                                                onChange={(e) => setFormData({ ...formData, coverLetter: e.target.value })}
                                                className="mt-1"
                                            />
                                        </div>
                                    </div>

                                    {/* Error Message */}
                                    {error && (
                                        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-2">
                                            <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                                            <p className="text-red-800 text-sm">{error}</p>
                                        </div>
                                    )}

                                    {/* Submit Button */}
                                    <div className="flex gap-3 pt-4">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => navigate(`/careers/${companyDomain}`)}
                                            className="flex-1"
                                        >
                                            Cancel
                                        </Button>
                                        <Button
                                            type="submit"
                                            disabled={submitting}
                                            className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                                        >
                                            {submitting ? (
                                                <>
                                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                                    Submitting...
                                                </>
                                            ) : (
                                                <>
                                                    <Upload className="h-4 w-4 mr-2" />
                                                    Submit Application
                                                </>
                                            )}
                                        </Button>
                                    </div>
                                </form>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}



