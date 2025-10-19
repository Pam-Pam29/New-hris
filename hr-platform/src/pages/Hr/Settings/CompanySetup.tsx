import { useState } from 'react';
import { Button } from '../../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Alert, AlertDescription } from '../../../components/ui/alert';
import { CheckCircle, AlertTriangle, Building, Users, RefreshCw, Sparkles, Calendar } from 'lucide-react';
import { getCompanyService } from '../../../services/companyService';
import { useCompany } from '../../../context/CompanyContext';
import { getFirebaseDb } from '../../../config/firebase';
import { collection, getDocs, doc, updateDoc, addDoc, Timestamp, deleteField, deleteDoc } from 'firebase/firestore';
import { jobBoardService } from '../../../services/jobBoardService';

export default function CompanySetup() {
    const { companyId, company } = useCompany();
    const [loading, setLoading] = useState(false);
    const [updateLoading, setUpdateLoading] = useState(false);
    const [success, setSuccess] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [updateSuccess, setUpdateSuccess] = useState<string | null>(null);
    const [updateError, setUpdateError] = useState<string | null>(null);
    const [seedLoading, setSeedLoading] = useState(false);
    const [seedSuccess, setSeedSuccess] = useState<string | null>(null);
    const [seedError, setSeedError] = useState<string | null>(null);
    const [onboardingLoading, setOnboardingLoading] = useState(false);
    const [markCompleteLoading, setMarkCompleteLoading] = useState(false);

    const markAsOnboarded = async () => {
        if (!companyId || !company) {
            setError('No company selected.');
            return;
        }

        setMarkCompleteLoading(true);
        try {
            const db = getFirebaseDb();
            const companyDoc = doc(db, 'companies', companyId);

            await updateDoc(companyDoc, {
                'settings.onboardingCompleted': true,
                'settings.onboardingCompletedAt': new Date().toISOString()
            });

            setSuccess(`✅ ${company.displayName} marked as onboarded!`);

            // Reload company context
            window.location.reload();
        } catch (err: any) {
            console.error('Error marking as onboarded:', err);
            setError(`Failed to mark as onboarded: ${err.message}`);
        } finally {
            setMarkCompleteLoading(false);
        }
    };

    const resetOnboarding = async () => {
        if (!companyId || !company) {
            setError('No company selected.');
            return;
        }

        if (!confirm('This will mark onboarding as incomplete and redirect you to the onboarding flow. Continue?')) {
            return;
        }

        setOnboardingLoading(true);
        try {
            // Directly update Firebase to avoid issues with deleteField
            const db = getFirebaseDb();
            const companyDoc = doc(db, 'companies', companyId);

            await updateDoc(companyDoc, {
                'settings.onboardingCompleted': false,
                'settings.onboardingCompletedAt': deleteField() // Remove field instead of setting to undefined
            });

            console.log('✅ Onboarding reset successfully');

            // Reload page to trigger onboarding redirect
            window.location.href = '/onboarding';
        } catch (err: any) {
            console.error('Error resetting onboarding:', err);
            setError(`Failed to reset onboarding: ${err.message}`);
        } finally {
            setOnboardingLoading(false);
        }
    };

    const seedSampleData = async () => {
        if (!companyId || !company) {
            setSeedError('No company selected. Please select a company first.');
            return;
        }

        setSeedLoading(true);
        setSeedSuccess(null);
        setSeedError(null);

        try {
            // Create 2-3 sample jobs for the company
            const sampleJobs = [
                {
                    title: `Senior Software Engineer at ${company.displayName}`,
                    department: 'Engineering',
                    location: company.address?.split(',')[1]?.trim() || 'Remote',
                    type: 'Full-time' as const,
                    description: `Join our engineering team at ${company.displayName}! We're looking for experienced developers.`,
                    requirements: ['5+ years experience', 'React & TypeScript', 'Team player'],
                    salary: { min: 3000000, max: 6000000, currency: 'NGN' }, // ₦3M - ₦6M
                    status: 'published' as const,
                    companyId
                },
                {
                    title: `Product Manager at ${company.displayName}`,
                    department: 'Product',
                    location: company.address?.split(',')[1]?.trim() || 'Hybrid',
                    type: 'Full-time' as const,
                    description: `Lead product strategy at ${company.displayName}. Shape the future of our products.`,
                    requirements: ['3+ years PM experience', 'Agile methodology', 'Data-driven'],
                    salary: { min: 4000000, max: 7000000, currency: 'NGN' }, // ₦4M - ₦7M
                    status: 'published' as const,
                    companyId
                }
            ];

            let jobsCreated = 0;
            for (const job of sampleJobs) {
                await jobBoardService.createJobPosting(job);
                jobsCreated++;
            }

            setSeedSuccess(`✅ Created ${jobsCreated} sample jobs for ${company.displayName}!\n\n💡 Go to Job Board or Recruitment to see them.`);

        } catch (err: any) {
            console.error('Error seeding data:', err);
            setSeedError(`Failed to seed data: ${err.message}`);
        } finally {
            setSeedLoading(false);
        }
    };

    const createLeaveTypesForCurrentCompany = async () => {
        if (!companyId || !company) {
            setUpdateError('No company selected. Please select a company first.');
            return;
        }

        setUpdateLoading(true);
        setUpdateSuccess(null);
        setUpdateError(null);

        try {
            const db = getFirebaseDb();

            // Check if leave types already exist for this company
            const leaveTypesRef = collection(db, 'leaveTypes');
            const snapshot = await getDocs(leaveTypesRef);
            const existingLeaveTypes = snapshot.docs.filter(doc => doc.data().companyId === companyId);

            if (existingLeaveTypes.length > 0) {
                setUpdateSuccess(`✅ ${company.displayName} already has ${existingLeaveTypes.length} leave types configured!`);
                setUpdateLoading(false);
                return;
            }

            // Create default leave types
            const defaultLeaveTypes = [
                {
                    companyId: companyId,
                    name: 'Annual Leave',
                    description: 'Standard annual vacation leave',
                    maxDays: 20,
                    color: '#3B82F6', // Blue
                    requiresApproval: true,
                    carryOver: true,
                    paidLeave: true,
                    createdAt: Timestamp.now(),
                    updatedAt: Timestamp.now()
                },
                {
                    companyId: companyId,
                    name: 'Sick Leave',
                    description: 'Medical or health-related leave',
                    maxDays: 10,
                    color: '#EF4444', // Red
                    requiresApproval: false,
                    carryOver: false,
                    paidLeave: true,
                    createdAt: Timestamp.now(),
                    updatedAt: Timestamp.now()
                },
                {
                    companyId: companyId,
                    name: 'Personal Leave',
                    description: 'Personal matters and emergencies',
                    maxDays: 5,
                    color: '#8B5CF6', // Purple
                    requiresApproval: true,
                    carryOver: false,
                    paidLeave: true,
                    createdAt: Timestamp.now(),
                    updatedAt: Timestamp.now()
                }
            ];

            // Add leave types to Firestore
            for (const leaveType of defaultLeaveTypes) {
                await addDoc(leaveTypesRef, leaveType);
            }

            setUpdateSuccess(`✅ Created ${defaultLeaveTypes.length} default leave types for ${company.displayName}!\n\n💡 Employees can now submit leave requests!`);

        } catch (err: any) {
            console.error('Error creating leave types:', err);
            setUpdateError(`Failed to create leave types: ${err.message}`);
        } finally {
            setUpdateLoading(false);
        }
    };

    const updateExistingEmployees = async () => {
        if (!companyId) {
            setUpdateError('No company selected. Please select a company first.');
            return;
        }

        setUpdateLoading(true);
        setUpdateSuccess(null);
        setUpdateError(null);

        try {
            const db = getFirebaseDb();
            const employeesRef = collection(db, 'employees');
            const snapshot = await getDocs(employeesRef);

            console.log(`📋 Found ${snapshot.size} total employees`);

            let updated = 0;
            let alreadyHasCompany = 0;
            let errors = 0;

            for (const docSnap of snapshot.docs) {
                const data = docSnap.data();

                // Check if employee already has a companyId
                if (data.companyId) {
                    alreadyHasCompany++;
                    console.log(`⏭️  ${docSnap.id} - Already has companyId: ${data.companyId}`);
                    continue;
                }

                try {
                    // Update with current companyId
                    await updateDoc(doc(db, 'employees', docSnap.id), {
                        companyId: companyId
                    });

                    updated++;
                    const name = data.personalInfo?.firstName
                        ? `${data.personalInfo.firstName} ${data.personalInfo.lastName || ''}`
                        : data.name || 'Unknown';
                    console.log(`✅ ${docSnap.id} - ${name} → companyId added`);
                } catch (error: any) {
                    errors++;
                    console.error(`❌ ${docSnap.id} - Error:`, error.message);
                }
            }

            const summaryMessage = `📊 Summary:\n✅ Updated: ${updated}\n⏭️  Already had company: ${alreadyHasCompany}\n❌ Errors: ${errors}\n📋 Total: ${snapshot.size}\n\n${updated > 0 ? `🎉 Successfully tagged ${updated} employees with ${company?.displayName || 'company'}!\n\n💡 Refresh Employee Directory to see them!` : '✨ All employees already have company assignments!'}`;

            setUpdateSuccess(summaryMessage);

        } catch (err: any) {
            console.error('Error updating employees:', err);
            setUpdateError(`Failed to update employees: ${err.message}`);
        } finally {
            setUpdateLoading(false);
        }
    };

    const createDemoCompanies = async () => {
        setLoading(true);
        setSuccess(null);
        setError(null);

        try {
            const companyService = await getCompanyService();

            // Demo companies
            const companies = [
                {
                    name: 'acme-corp',
                    domain: 'acme',
                    displayName: 'Acme Corporation',
                    email: 'hr@acmecorp.com',
                    phone: '+1-555-0100',
                    website: 'https://acmecorp.com',
                    address: '123 Tech Street, San Francisco, CA 94105',
                    primaryColor: '#DC2626', // Red
                    secondaryColor: '#991B1B',
                    settings: {
                        careersSlug: 'acme',
                        allowPublicApplications: true,
                        timezone: 'Africa/Lagos',
                        industry: 'Technology',
                        onboardingCompleted: true,
                        onboardingCompletedAt: new Date().toISOString()
                    },
                    plan: 'premium' as const,
                    status: 'active' as const
                },
                {
                    name: 'techcorp-inc',
                    domain: 'techcorp',
                    displayName: 'TechCorp Inc.',
                    email: 'careers@techcorp.com',
                    phone: '+1-555-0200',
                    website: 'https://techcorp.com',
                    address: '456 Innovation Blvd, Austin, TX 78701',
                    primaryColor: '#2563EB', // Blue
                    secondaryColor: '#1E40AF',
                    settings: {
                        careersSlug: 'techcorp',
                        allowPublicApplications: true,
                        timezone: 'Africa/Lagos',
                        industry: 'Software',
                        onboardingCompleted: true,
                        onboardingCompletedAt: new Date().toISOString()
                    },
                    plan: 'enterprise' as const,
                    status: 'active' as const
                },
                {
                    name: 'globex-industries',
                    domain: 'globex',
                    displayName: 'Globex Industries',
                    email: 'jobs@globex.com',
                    phone: '+1-555-0300',
                    website: 'https://globex.com',
                    address: '789 Corporate Ave, New York, NY 10001',
                    primaryColor: '#059669', // Green
                    secondaryColor: '#047857',
                    settings: {
                        careersSlug: 'globex',
                        allowPublicApplications: true,
                        timezone: 'Africa/Lagos',
                        industry: 'Manufacturing',
                        onboardingCompleted: true,
                        onboardingCompletedAt: new Date().toISOString()
                    },
                    plan: 'basic' as const,
                    status: 'active' as const
                }
            ];

            const createdIds: string[] = [];
            const db = getFirebaseDb();

            for (const company of companies) {
                const id = await companyService.createCompany(company);
                createdIds.push(`${company.displayName} (ID: ${id})`);

                // Create default leave types for the company
                const defaultLeaveTypes = [
                    {
                        companyId: id,
                        name: 'Annual Leave',
                        description: 'Standard annual vacation leave',
                        maxDays: 20,
                        color: '#3B82F6', // Blue
                        requiresApproval: true,
                        carryOver: true,
                        paidLeave: true,
                        createdAt: Timestamp.now(),
                        updatedAt: Timestamp.now()
                    },
                    {
                        companyId: id,
                        name: 'Sick Leave',
                        description: 'Medical or health-related leave',
                        maxDays: 10,
                        color: '#EF4444', // Red
                        requiresApproval: false,
                        carryOver: false,
                        paidLeave: true,
                        createdAt: Timestamp.now(),
                        updatedAt: Timestamp.now()
                    },
                    {
                        companyId: id,
                        name: 'Personal Leave',
                        description: 'Personal matters and emergencies',
                        maxDays: 5,
                        color: '#8B5CF6', // Purple
                        requiresApproval: true,
                        carryOver: false,
                        paidLeave: true,
                        createdAt: Timestamp.now(),
                        updatedAt: Timestamp.now()
                    }
                ];

                // Add leave types to Firestore
                const leaveTypesCollection = collection(db, 'leaveTypes');
                for (const leaveType of defaultLeaveTypes) {
                    await addDoc(leaveTypesCollection, leaveType);
                }
            }

            setSuccess(`✅ Created ${companies.length} demo companies with default leave types!\n\n${createdIds.join('\n')}\n\nVisit careers pages at:\n- http://localhost:3004/careers/acme\n- http://localhost:3004/careers/techcorp\n- http://localhost:3004/careers/globex`);

        } catch (err: any) {
            console.error('Error creating companies:', err);
            setError(`Failed to create companies: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-8 max-w-4xl mx-auto">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Building className="h-6 w-6" />
                        Multi-Tenancy Setup
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div>
                        <h3 className="text-lg font-semibold mb-2">Create Demo Companies</h3>
                        <p className="text-gray-600 mb-4">
                            This will create 3 demo companies in Firebase for testing multi-tenancy:
                        </p>
                        <ul className="list-disc list-inside space-y-2 text-gray-700 mb-6">
                            <li><strong>Acme Corporation</strong> - Red theme (domain: acme)</li>
                            <li><strong>TechCorp Inc.</strong> - Blue theme (domain: techcorp)</li>
                            <li><strong>Globex Industries</strong> - Green theme (domain: globex)</li>
                        </ul>

                        <Button
                            onClick={createDemoCompanies}
                            disabled={loading}
                            className="w-full md:w-auto"
                        >
                            {loading ? 'Creating Companies...' : 'Create Demo Companies'}
                        </Button>
                    </div>

                    {success && (
                        <Alert className="border-green-200 bg-green-50">
                            <CheckCircle className="h-4 w-4 text-green-600" />
                            <AlertDescription className="text-green-800 whitespace-pre-wrap">
                                {success}
                            </AlertDescription>
                        </Alert>
                    )}

                    {error && (
                        <Alert className="border-red-200 bg-red-50">
                            <AlertTriangle className="h-4 w-4 text-red-600" />
                            <AlertDescription className="text-red-800">
                                {error}
                            </AlertDescription>
                        </Alert>
                    )}

                    <hr className="my-8" />

                    {/* Update Existing Employees Section */}
                    <div>
                        <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                            <Users className="h-5 w-5" />
                            Assign Existing Employees to Company
                        </h3>
                        <p className="text-gray-600 mb-4">
                            This will tag all employees <strong>without a company assignment</strong> with the currently selected company.
                        </p>

                        {company && (
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                                <p className="text-sm">
                                    <strong>Current Company:</strong> {company.displayName}
                                </p>
                                <p className="text-xs text-gray-600 mt-1">
                                    ID: {companyId}
                                </p>
                            </div>
                        )}

                        {!company && (
                            <Alert className="border-yellow-200 bg-yellow-50 mb-4">
                                <AlertTriangle className="h-4 w-4 text-yellow-600" />
                                <AlertDescription className="text-yellow-800">
                                    Please wait for company to load or select a company first.
                                </AlertDescription>
                            </Alert>
                        )}

                        <Button
                            onClick={updateExistingEmployees}
                            disabled={updateLoading || !companyId}
                            className="w-full md:w-auto"
                            variant="secondary"
                        >
                            {updateLoading ? (
                                <>
                                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                                    Updating Employees...
                                </>
                            ) : (
                                <>
                                    <Users className="h-4 w-4 mr-2" />
                                    Assign Employees to {company?.displayName || 'Company'}
                                </>
                            )}
                        </Button>
                    </div>

                    {updateSuccess && (
                        <Alert className="border-green-200 bg-green-50">
                            <CheckCircle className="h-4 w-4 text-green-600" />
                            <AlertDescription className="text-green-800 whitespace-pre-wrap">
                                {updateSuccess}
                            </AlertDescription>
                        </Alert>
                    )}

                    {updateError && (
                        <Alert className="border-red-200 bg-red-50">
                            <AlertTriangle className="h-4 w-4 text-red-600" />
                            <AlertDescription className="text-red-800">
                                {updateError}
                            </AlertDescription>
                        </Alert>
                    )}

                    <hr className="my-8" />

                    {/* Create Leave Types Section */}
                    <div>
                        <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                            <Calendar className="h-5 w-5" />
                            Create Default Leave Types
                        </h3>
                        <p className="text-gray-600 mb-4">
                            Create standard leave types (Annual, Sick, Personal) for the currently selected company.
                        </p>

                        {company && (
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                                <p className="text-sm">
                                    <strong>Current Company:</strong> {company.displayName}
                                </p>
                                <p className="text-xs text-gray-600 mt-1">
                                    ID: {companyId}
                                </p>
                            </div>
                        )}

                        <Button
                            onClick={createLeaveTypesForCurrentCompany}
                            disabled={updateLoading || !companyId}
                            className="w-full md:w-auto"
                            variant="secondary"
                        >
                            {updateLoading ? (
                                <>
                                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                                    Creating Leave Types...
                                </>
                            ) : (
                                <>
                                    <CheckCircle className="h-4 w-4 mr-2" />
                                    Create Leave Types for {company?.displayName || 'Company'}
                                </>
                            )}
                        </Button>
                    </div>

                    <hr className="my-8" />

                    {/* Seed Sample Data Section */}
                    <div>
                        <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                            <Sparkles className="h-5 w-5" />
                            Create Sample Data for Testing
                        </h3>
                        <p className="text-gray-600 mb-4">
                            Quickly populate the current company with sample jobs to test multi-tenancy.
                        </p>

                        {company && (
                            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-4">
                                <p className="text-sm">
                                    <strong>Will create data for:</strong> {company.displayName}
                                </p>
                                <p className="text-xs text-gray-600 mt-1">
                                    2 sample job postings
                                </p>
                            </div>
                        )}

                        <Button
                            onClick={seedSampleData}
                            disabled={seedLoading || !companyId}
                            className="w-full md:w-auto"
                            variant="default"
                        >
                            {seedLoading ? (
                                <>
                                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                                    Creating Sample Data...
                                </>
                            ) : (
                                <>
                                    <Sparkles className="h-4 w-4 mr-2" />
                                    Create Sample Data
                                </>
                            )}
                        </Button>
                    </div>

                    {seedSuccess && (
                        <Alert className="border-green-200 bg-green-50">
                            <CheckCircle className="h-4 w-4 text-green-600" />
                            <AlertDescription className="text-green-800 whitespace-pre-wrap">
                                {seedSuccess}
                            </AlertDescription>
                        </Alert>
                    )}

                    {seedError && (
                        <Alert className="border-red-200 bg-red-50">
                            <AlertTriangle className="h-4 w-4 text-red-600" />
                            <AlertDescription className="text-red-800">
                                {seedError}
                            </AlertDescription>
                        </Alert>
                    )}

                    <hr className="my-8" />

                    {/* Test Onboarding Section */}
                    <div>
                        <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                            <RefreshCw className="h-5 w-5" />
                            Test Onboarding Flow
                        </h3>
                        <p className="text-gray-600 mb-4">
                            Reset the onboarding status to test the company onboarding wizard.
                        </p>

                        {company?.settings?.onboardingCompleted && (
                            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                                <p className="text-sm text-green-800">
                                    ✅ Onboarding completed on {company.settings.onboardingCompletedAt ? new Date(company.settings.onboardingCompletedAt).toLocaleDateString() : 'unknown date'}
                                </p>
                            </div>
                        )}

                        {!company?.settings?.onboardingCompleted && (
                            <Alert className="border-yellow-200 bg-yellow-50 mb-4">
                                <AlertTriangle className="h-4 w-4 text-yellow-600" />
                                <AlertDescription className="text-yellow-800">
                                    Onboarding not yet completed for this company.
                                </AlertDescription>
                            </Alert>
                        )}

                        <div className="flex gap-3">
                            {!company?.settings?.onboardingCompleted && (
                                <Button
                                    onClick={markAsOnboarded}
                                    disabled={markCompleteLoading || !companyId}
                                    className="bg-green-600 hover:bg-green-700 text-white"
                                >
                                    {markCompleteLoading ? (
                                        <>
                                            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                                            Updating...
                                        </>
                                    ) : (
                                        <>
                                            <CheckCircle className="h-4 w-4 mr-2" />
                                            Skip & Mark Complete
                                        </>
                                    )}
                                </Button>
                            )}

                            <Button
                                onClick={resetOnboarding}
                                disabled={onboardingLoading || !companyId}
                                variant="outline"
                            >
                                {onboardingLoading ? (
                                    <>
                                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                                        Resetting...
                                    </>
                                ) : (
                                    <>
                                        <RefreshCw className="h-4 w-4 mr-2" />
                                        {company?.settings?.onboardingCompleted ? 'Test Onboarding Again' : 'Go to Onboarding'}
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>

                    <hr className="my-8 border-red-200" />

                    {/* DANGER ZONE: Clear All Data */}
                    <div className="border-2 border-red-300 rounded-lg p-6 bg-red-50">
                        <h3 className="text-lg font-semibold mb-2 flex items-center gap-2 text-red-700">
                            <AlertTriangle className="h-5 w-5" />
                            ⚠️ DANGER ZONE: Clear All Data
                        </h3>
                        <p className="text-red-700 mb-4 font-semibold">
                            This will permanently delete ALL data from ALL collections!
                        </p>
                        <Alert className="border-red-300 bg-red-100 mb-4">
                            <AlertTriangle className="h-4 w-4 text-red-700" />
                            <AlertDescription className="text-red-800">
                                <strong>WARNING:</strong> This action will delete:
                                <ul className="list-disc ml-6 mt-2">
                                    <li>All companies (Acme, TechCorp, Globex, etc.)</li>
                                    <li>All employees and their profiles</li>
                                    <li>All job postings and applications</li>
                                    <li>All leave requests and balances</li>
                                    <li>All time tracking data</li>
                                    <li>All interviews and candidates</li>
                                    <li>Everything else!</li>
                                </ul>
                                <p className="mt-3 font-bold">This CANNOT be undone!</p>
                            </AlertDescription>
                        </Alert>

                        <Button
                            onClick={() => {
                                const confirmed = window.confirm(
                                    '⚠️ ARE YOU ABSOLUTELY SURE?\n\n' +
                                    'This will DELETE ALL DATA from Firebase!\n\n' +
                                    '• All companies\n' +
                                    '• All employees\n' +
                                    '• All jobs\n' +
                                    '• All applications\n' +
                                    '• EVERYTHING!\n\n' +
                                    'Type "DELETE" in the next prompt to confirm.'
                                );

                                if (!confirmed) return;

                                const finalConfirm = window.prompt(
                                    'Type DELETE (all caps) to permanently delete all data:'
                                );

                                if (finalConfirm === 'DELETE') {
                                    clearAllData();
                                } else {
                                    alert('Cancelled. Data not deleted.');
                                }
                            }}
                            disabled={loading || updateLoading || seedLoading}
                            variant="destructive"
                            className="bg-red-600 hover:bg-red-700"
                        >
                            <AlertTriangle className="h-4 w-4 mr-2" />
                            Clear All Data (Dangerous!)
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );

    // Clear all data function
    async function clearAllData() {
        setLoading(true);
        setSuccess(null);
        setError(null);

        const collections = [
            // Core Collections
            'companies', 'employees', 'departments',

            // Job & Recruitment
            'jobPostings', 'job_postings', 'jobApplications', 'candidates',
            'recruitment_candidates', 'interviews',

            // Leave Management
            'leaveTypes', 'leaveRequests', 'leave_requests', 'leaveBalances',

            // Time Management
            'timeEntries', 'attendance', 'attendanceRecords', 'timeNotifications',
            'timeAdjustmentRequests', 'schedules', 'shiftTemplates',

            // Payroll & Financial
            'payrollRecords', 'payroll_records', 'financial_requests',

            // Assets
            'assets', 'assetAssignments', 'assetRequests',

            // Performance
            'performanceGoals', 'performanceReviews', 'performance_reviews',
            'performanceMeetings', 'meetingSchedules',

            // Policies & HR
            'policies', 'policyAcknowledgments', 'hrSettings', 'hrAvailability',
            'starterKits',

            // Notifications & General
            'notifications', 'onboarding', 'connection-test', 'officeLocations'
        ];

        try {
            const db = getFirebaseDb();
            let totalDeleted = 0;
            const results = [];

            for (const collectionName of collections) {
                try {
                    const collectionRef = collection(db, collectionName);
                    const snapshot = await getDocs(collectionRef);

                    if (snapshot.empty) {
                        results.push(`📋 ${collectionName}: Already empty`);
                        continue;
                    }

                    // Delete all documents
                    for (const docSnapshot of snapshot.docs) {
                        await deleteDoc(doc(db, collectionName, docSnapshot.id));
                        totalDeleted++;
                    }

                    results.push(`✅ ${collectionName}: Deleted ${snapshot.size} documents`);
                } catch (err: any) {
                    results.push(`❌ ${collectionName}: Error - ${err.message}`);
                }
            }

            setSuccess(
                `🎉 Data Cleanup Complete!\n\n` +
                `Total Deleted: ${totalDeleted} documents\n\n` +
                `${results.join('\n')}\n\n` +
                `✅ All collections preserved\n` +
                `✅ Ready for fresh testing!\n\n` +
                `💡 Refresh the page and start creating new data.`
            );

        } catch (err: any) {
            console.error('Error clearing data:', err);
            setError(`Failed to clear data: ${err.message}`);
        } finally {
            setLoading(false);
        }
    }
}


