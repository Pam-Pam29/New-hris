import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import {
    Briefcase,
    MapPin,
    DollarSign,
    Clock,
    Building,
    ArrowRight,
    Search,
    Mail,
    AlertTriangle
} from 'lucide-react';
import { Company } from '../types/company';
import { getCompanyService } from '../services/companyService';
import { formatSalaryRange } from '../utils/currency';

interface JobPosting {
    id: string;
    companyId: string; // Multi-tenancy
    title: string;
    department: string;
    location: string;
    type: 'full-time' | 'part-time' | 'contract' | 'internship';
    salaryRange: string;
    description: string;
    requirements: string[];
    status: 'draft' | 'published' | 'closed';
    postedDate?: any;
    closingDate?: any;
}

export default function CareersPage() {
    const { companyDomain } = useParams(); // Get company from URL
    const [company, setCompany] = useState<Company | null>(null);
    const [jobs, setJobs] = useState<JobPosting[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedDepartment, setSelectedDepartment] = useState<string>('all');
    const navigate = useNavigate();

    // Step 1: Load company from URL
    useEffect(() => {
        const loadCompany = async () => {
            try {
                setLoading(true);

                const companyService = await getCompanyService();
                let companyData: Company | null = null;

                if (companyDomain) {
                    // Load company by domain from URL (e.g., /careers/acme)
                    companyData = await companyService.getCompanyByDomain(companyDomain);

                    if (!companyData) {
                        setError(`Company "${companyDomain}" not found`);
                        setLoading(false);
                        return;
                    }
                } else {
                    // No company in URL - load first active company (for development)
                    const companies = await companyService.getActiveCompanies();

                    if (companies.length === 0) {
                        setError('No active companies found');
                        setLoading(false);
                        return;
                    }

                    companyData = companies[0];
                    console.log('ℹ️ No company in URL, using first company:', companyData.displayName);
                }

                setCompany(companyData);

                // Apply company branding
                document.title = `Careers - ${companyData.displayName}`;
                if (companyData.primaryColor) {
                    document.documentElement.style.setProperty('--primary-color', companyData.primaryColor);
                }

                console.log('✅ Company loaded:', companyData.displayName, '(ID:', companyData.id, ')');

            } catch (err) {
                console.error('Error loading company:', err);
                setError('Failed to load company information');
                setLoading(false);
            }
        };

        loadCompany();
    }, [companyDomain]);

    // Step 2: Real-time sync with Firebase (filtered by company)
    useEffect(() => {
        if (!company) return; // Wait for company to load first

        let unsubscribe: (() => void) | null = null;

        const setupRealtimeSync = async () => {
            try {
                // Import Firebase for real-time listener
                const { collection, query, where, onSnapshot } = await import('firebase/firestore');
                const { getFirebaseDb } = await import('../config/firebase');
                const db = getFirebaseDb();

                if (!db) {
                    console.error('Firebase not available');
                    setLoading(false);
                    return;
                }

                // Set up real-time listener for THIS COMPANY'S job postings only
                const jobPostingsRef = collection(db, 'job_postings');
                const q = query(
                    jobPostingsRef,
                    where('companyId', '==', company.id)     // ← Company filter!
                    // Temporarily removed status filter until composite index is built
                );

                unsubscribe = onSnapshot(q, (snapshot) => {
                    const allJobs = snapshot.docs.map(doc => ({
                        id: doc.id,
                        ...doc.data()
                    } as JobPosting));

                    // Filter to only published jobs client-side
                    const publishedJobs = allJobs.filter(job => job.status === 'published');
                    
                    setJobs(publishedJobs);
                    setLoading(false);
                    console.log(`✅ ${company.displayName}: Loaded ${publishedJobs.length} published jobs out of ${allJobs.length} total`);
                }, (err) => {
                    console.error('Error in real-time job sync:', err);
                    setError('Failed to load jobs');
                    setLoading(false);
                });

            } catch (err) {
                console.error('Error setting up job sync:', err);
                setError('Failed to load jobs');
                setLoading(false);
            }
        };

        setupRealtimeSync();

        // Cleanup listener on unmount
        return () => {
            if (unsubscribe) {
                unsubscribe();
                console.log(`🔌 ${company.displayName}: Job sync disconnected`);
            }
        };
    }, [company]); // Re-run when company changes

    // Get unique departments
    const departments = ['all', ...Array.from(new Set(jobs.map(job => job.department)))];

    // Filter jobs based on search and department
    const filteredJobs = jobs.filter(job => {
        const search = searchTerm.toLowerCase();
        const matchesSearch =
            job.title.toLowerCase().includes(search) ||
            job.department.toLowerCase().includes(search) ||
            job.location.toLowerCase().includes(search) ||
            job.description.toLowerCase().includes(search);

        const matchesDepartment = selectedDepartment === 'all' || job.department === selectedDepartment;

        return matchesSearch && matchesDepartment;
    });

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-xl text-gray-600">Loading{company ? ` ${company.displayName}` : ''} careers...</p>
                </div>
            </div>
        );
    }

    if (error || !company) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
                <Card className="max-w-md w-full">
                    <CardContent className="text-center py-12">
                        <AlertTriangle className="h-16 w-16 text-red-500 mx-auto mb-4" />
                        <h2 className="text-2xl font-bold mb-2">Oops!</h2>
                        <p className="text-gray-600 mb-6">{error || 'Company not found'}</p>
                        <Button onClick={() => navigate('/')}>
                            Back to Home
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
            {/* Header Hero */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-24">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center">
                        {/* Company Logo (if available) */}
                        {company.logo && (
                            <img
                                src={company.logo}
                                alt={company.displayName}
                                className="h-16 mx-auto mb-6"
                            />
                        )}

                        <h1 className="text-5xl md:text-6xl font-bold mb-6 animate-fade-in">
                            Join {company.displayName}
                        </h1>
                        <p className="text-xl md:text-2xl text-blue-100 mb-10 max-w-3xl mx-auto">
                            Discover exciting career opportunities and grow with us
                        </p>

                        {/* Search Bar */}
                        <div className="max-w-2xl mx-auto">
                            <div className="relative">
                                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                                <Input
                                    type="text"
                                    placeholder="Search jobs by title, department, or location..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-12 py-7 text-lg bg-white shadow-xl border-0 rounded-xl"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Stats Section */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-12">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
                    <Card className="bg-white shadow-2xl border-0 overflow-hidden">
                        <CardContent className="p-8 text-center">
                            <div className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                                {jobs.length}
                            </div>
                            <div className="text-gray-600 font-medium">Open Positions</div>
                        </CardContent>
                    </Card>

                    <Card className="bg-white shadow-2xl border-0 overflow-hidden">
                        <CardContent className="p-8 text-center">
                            <div className="text-5xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
                                {departments.length - 1}
                            </div>
                            <div className="text-gray-600 font-medium">Departments</div>
                        </CardContent>
                    </Card>

                    <Card className="bg-white shadow-2xl border-0 overflow-hidden">
                        <CardContent className="p-8 text-center">
                            <div className="text-5xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-2">
                                {new Set(jobs.map(job => job.location)).size}
                            </div>
                            <div className="text-gray-600 font-medium">Locations</div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Department Filter */}
            {departments.length > 2 && (
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
                    <div className="flex items-center gap-3 overflow-x-auto pb-2">
                        <span className="text-gray-600 font-medium whitespace-nowrap">Filter by:</span>
                        {departments.map(dept => (
                            <Button
                                key={dept}
                                variant={selectedDepartment === dept ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => setSelectedDepartment(dept)}
                                className={selectedDepartment === dept ? 'bg-blue-600' : ''}
                            >
                                {dept === 'all' ? 'All Departments' : dept}
                            </Button>
                        ))}
                    </div>
                </div>
            )}

            {/* Job Listings */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
                {filteredJobs.length === 0 ? (
                    <Card className="bg-white shadow-lg border-0">
                        <CardContent className="text-center py-20">
                            <Briefcase className="h-24 w-24 text-gray-300 mx-auto mb-6" />
                            <h3 className="text-3xl font-semibold text-gray-700 mb-3">
                                {searchTerm || selectedDepartment !== 'all' ? 'No matching positions found' : 'No open positions at the moment'}
                            </h3>
                            <p className="text-gray-500 text-lg mb-6">
                                {searchTerm || selectedDepartment !== 'all' ? 'Try adjusting your search or filters' : 'Check back soon for new opportunities!'}
                            </p>
                            {(searchTerm || selectedDepartment !== 'all') && (
                                <Button
                                    variant="outline"
                                    onClick={() => {
                                        setSearchTerm('');
                                        setSelectedDepartment('all');
                                    }}
                                >
                                    Clear Filters
                                </Button>
                            )}
                        </CardContent>
                    </Card>
                ) : (
                    <>
                        <div className="mb-6 text-gray-600 text-lg">
                            {filteredJobs.length} {filteredJobs.length === 1 ? 'position' : 'positions'} available
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredJobs.map((job) => (
                                <Card
                                    key={job.id}
                                    className="group bg-white hover:shadow-2xl transition-all duration-300 border-0 shadow-lg overflow-hidden"
                                >
                                    <CardHeader className="pb-4">
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="p-3 bg-gradient-to-br from-blue-100 to-purple-100 rounded-xl">
                                                <Building className="h-7 w-7 text-blue-600" />
                                            </div>
                                            <Badge className="bg-green-500 text-white text-xs px-3 py-1">Open</Badge>
                                        </div>

                                        <CardTitle className="text-xl group-hover:text-blue-600 transition-colors line-clamp-2 min-h-[3.5rem]">
                                            {job.title}
                                        </CardTitle>
                                        <p className="text-gray-600 font-medium">{job.department}</p>
                                    </CardHeader>

                                    <CardContent className="space-y-5">
                                        {/* Job Details Grid */}
                                        <div className="space-y-2.5">
                                            <div className="flex items-center gap-2 text-gray-600">
                                                <MapPin className="h-4 w-4 flex-shrink-0" />
                                                <span className="text-sm">{job.location}</span>
                                            </div>

                                            <div className="flex items-center gap-2 text-gray-600">
                                                <Clock className="h-4 w-4 flex-shrink-0" />
                                                <span className="text-sm capitalize">{job.type.replace('-', ' ')}</span>
                                            </div>

                                            <div className="flex items-center gap-2 text-gray-600">
                                                <DollarSign className="h-4 w-4 flex-shrink-0" />
                                                <span className="text-sm font-medium">{formatSalaryRange(job.salaryRange)}</span>
                                            </div>
                                        </div>

                                        {/* Description Preview */}
                                        <p className="text-gray-600 text-sm line-clamp-3 min-h-[4rem]">
                                            {job.description}
                                        </p>

                                        {/* Apply Button */}
                                        <Button
                                            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-md hover:shadow-xl transition-all group-hover:scale-105"
                                            onClick={() => {
                                                // Use company domain from URL or from loaded company
                                                const domain = companyDomain || company?.domain || 'company';
                                                navigate(`/careers/${domain}/apply/${job.id}`);
                                            }}
                                        >
                                            Apply Now
                                            <ArrowRight className="ml-2 h-4 w-4" />
                                        </Button>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </>
                )}
            </div>

            {/* Footer CTA */}
            <div className="bg-gradient-to-r from-gray-900 to-gray-800 text-white py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                        <div>
                            <h2 className="text-3xl md:text-4xl font-bold mb-4">
                                Don't see the right role?
                            </h2>
                            <p className="text-gray-300 text-lg mb-6">
                                We're always looking for talented individuals. Send us your resume and we'll keep you in mind for future opportunities!
                            </p>
                        </div>
                        <div className="text-center md:text-right">
                            <Button
                                size="lg"
                                className="bg-white text-gray-900 hover:bg-gray-100 shadow-xl px-8 py-6 text-lg"
                                onClick={() => {
                                    alert('Email your resume to: careers@company.com');
                                }}
                            >
                                <Mail className="mr-2 h-5 w-5" />
                                Contact Us
                            </Button>
                        </div>
                    </div>

                    {/* Footer Links */}
                    <div className="mt-12 pt-8 border-t border-gray-700 text-center text-gray-400">
                        <p className="text-sm">
                            © 2025 Company Name. All rights reserved.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

