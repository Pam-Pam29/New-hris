import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Alert, AlertDescription } from '../../components/ui/alert';
import {
    Building2,
    MapPin,
    Palette,
    Users,
    Calendar,
    CheckCircle,
    ArrowRight,
    ArrowLeft,
    Sparkles,
    Globe,
    Clock,
    Briefcase,
    AlertTriangle,
    Settings,
    Mail,
    Shield,
    Bell
} from 'lucide-react';
import { useCompany } from '../../context/CompanyContext';
import { getCompanyService } from '../../services/companyService';
import { getFirebaseDb } from '../../config/firebase';
import { collection, addDoc, Timestamp } from 'firebase/firestore';

interface OnboardingData {
    // Step 1: Company Profile
    displayName: string;
    domain: string;
    industry: string;
    companySize: string;
    website: string;

    // Step 2: Business Details
    address: string;
    city: string;
    country: string;
    timezone: string;
    phone: string;
    email: string;

    // Step 3: Branding
    primaryColor: string;
    secondaryColor: string;
    logo: string;

    // Step 4: Departments
    departments: string[];

    // Step 5: Leave Types
    leaveTypes: Array<{
        name: string;
        days: number;
    }>;

    // Step 6: HR Team Setup
    hrTeam: Array<{
        firstName: string;
        lastName: string;
        email: string;
        role: string;
        department: string;
    }>;

    // Step 7: System Configuration
    emailTemplates: {
        welcomeEmail: string;
        onboardingEmail: string;
        reminderEmail: string;
    };
    notifications: {
        emailNotifications: boolean;
        smsNotifications: boolean;
        pushNotifications: boolean;
    };
    security: {
        twoFactorAuth: boolean;
        passwordPolicy: string;
        sessionTimeout: number;
    };
}

const STEPS = [
    { id: 1, title: 'Welcome', icon: Sparkles },
    { id: 2, title: 'Company Profile', icon: Building2 },
    { id: 3, title: 'Business Details', icon: MapPin },
    { id: 4, title: 'Branding', icon: Palette },
    { id: 5, title: 'Departments', icon: Users },
    { id: 6, title: 'Leave Policies', icon: Calendar },
    { id: 7, title: 'HR Team Setup', icon: Briefcase },
    { id: 8, title: 'System Config', icon: Settings },
    { id: 9, title: 'Complete', icon: CheckCircle }
];

const INDUSTRIES = [
    'Technology',
    'Finance',
    'Healthcare',
    'Education',
    'Manufacturing',
    'Retail',
    'Consulting',
    'Other'
];

const COMPANY_SIZES = [
    '1-10',
    '11-50',
    '51-200',
    '201-500',
    '501-1000',
    '1000+'
];

const TIMEZONES = [
    'Africa/Lagos', // Nigerian timezone (default)
    'Africa/Johannesburg',
    'Africa/Cairo',
    'Europe/London',
    'Europe/Paris',
    'America/New_York',
    'America/Chicago',
    'America/Los_Angeles',
    'Asia/Dubai',
    'Asia/Tokyo',
    'Australia/Sydney'
];

export default function CompanyOnboarding() {
    const navigate = useNavigate();
    const { company, setCompany } = useCompany();
    const [currentStep, setCurrentStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const [formData, setFormData] = useState<OnboardingData>({
        displayName: company?.displayName || '',
        domain: company?.domain || '',
        industry: '',
        companySize: '',
        website: '',
        address: '',
        city: '',
        country: '',
        timezone: 'Africa/Lagos',
        phone: '',
        email: '',
        primaryColor: '#3B82F6',
        secondaryColor: '#1E40AF',
        logo: '',
        departments: ['Engineering', 'Sales', 'HR'],
        leaveTypes: [
            { name: 'Annual Leave', days: 20 },
            { name: 'Sick Leave', days: 10 },
            { name: 'Personal Leave', days: 5 }
        ],
        hrTeam: [],
        emailTemplates: {
            welcomeEmail: 'Welcome to {companyName}! We\'re excited to have you on board.',
            onboardingEmail: 'Your onboarding process is ready. Please complete the required steps.',
            reminderEmail: 'Reminder: Please complete your onboarding tasks.'
        },
        notifications: {
            emailNotifications: true,
            smsNotifications: false,
            pushNotifications: true
        },
        security: {
            twoFactorAuth: false,
            passwordPolicy: 'medium',
            sessionTimeout: 8
        }
    });

    const handleNext = () => {
        if (currentStep < STEPS.length) {
            setCurrentStep(currentStep + 1);
        }
    };

    const handleBack = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
        }
    };

    const handleComplete = async () => {
        setLoading(true);
        setError('');

        try {
            // Check if user is authenticated
            const { getAuth } = await import('firebase/auth');
            const auth = getAuth();
            const currentUser = auth.currentUser;

            if (!currentUser) {
                console.log('⚠️ User not authenticated, redirecting to login...');
                alert('Please log in to complete the onboarding process.');
                navigate('/');
                return;
            }

            console.log('✅ User authenticated:', currentUser.email);
            console.log('💾 Starting onboarding save process...');

            const companyService = await getCompanyService();
            const db = getFirebaseDb();

            // Step 0: Create or get company
            let companyId: string;
            if (!company) {
                console.log('📝 No existing company - creating new company...');

                // Create a new company (returns just the ID)
                const newCompanyId = await companyService.createCompany({
                    name: formData.displayName,
                    displayName: formData.displayName,
                    domain: formData.domain,
                    email: formData.email,
                    phone: formData.phone,
                    website: formData.website,
                    address: `${formData.address}, ${formData.city}, ${formData.country}`,
                    primaryColor: formData.primaryColor.trim(),
                    secondaryColor: formData.secondaryColor.trim(),
                    logo: formData.logo,
                    settings: {
                        careersSlug: formData.domain,
                        allowPublicApplications: true,
                        timezone: formData.timezone,
                        industry: formData.industry,
                        companySize: formData.companySize,
                        departments: [],
                        onboardingCompleted: false
                    },
                    plan: 'free',
                    status: 'active'
                });

                companyId = newCompanyId;
                localStorage.setItem('companyId', newCompanyId);
                console.log('✅ New company created with ID:', newCompanyId);

                // Fetch the full company object to update context
                const newCompany = await companyService.getCompany(newCompanyId);
                if (newCompany) {
                    setCompany(newCompany);
                }
            } else {
                companyId = company.id;
                console.log('✅ Using existing company:', companyId);
            }

            // Step 1: Update company with ALL onboarding data
            const cleanDepartments = formData.departments.filter(d => d.trim() !== '');

            try {
                await companyService.updateCompany(companyId, {
                    displayName: formData.displayName,
                    domain: formData.domain,
                    address: `${formData.address}, ${formData.city}, ${formData.country}`,
                    phone: formData.phone,
                    email: formData.email,
                    website: formData.website,
                    primaryColor: formData.primaryColor,
                    secondaryColor: formData.secondaryColor,
                    settings: {
                        industry: formData.industry,
                        companySize: formData.companySize,
                        timezone: formData.timezone,
                        careersSlug: formData.domain,
                        allowPublicApplications: true,
                        departments: cleanDepartments, // ← Save departments in settings
                        onboardingCompleted: true,
                        onboardingCompletedAt: new Date().toISOString()
                    }
                });
                console.log('✅ Company profile updated successfully');
            } catch (updateError) {
                console.warn('⚠️ Company update failed, continuing with other data:', updateError);
                // Continue with other operations even if company update fails
            }
            console.log('✅ Company profile updated with all data:', {
                name: formData.displayName,
                domain: formData.domain,
                industry: formData.industry,
                departments: cleanDepartments.length,
                leaveTypes: formData.leaveTypes.length
            });

            // Step 2: Create leave types for this company
            const leaveTypesRef = collection(db, 'leaveTypes');
            let leaveTypesCreated = 0;

            for (const leaveType of formData.leaveTypes) {
                if (leaveType.name && leaveType.days > 0) {
                    await addDoc(leaveTypesRef, {
                        companyId: companyId,
                        name: leaveType.name,
                        maxDays: leaveType.days,
                        description: `${leaveType.name} - ${leaveType.days} days per year`,
                        accrualRate: leaveType.days / 12, // Monthly accrual
                        carryForward: true,
                        requiresApproval: true,
                        color: '#3B82F6',
                        isActive: true,
                        createdAt: Timestamp.now(),
                        updatedAt: Timestamp.now()
                    });
                    leaveTypesCreated++;
                }
            }
            console.log(`✅ Created ${leaveTypesCreated} leave types`);

            // Step 3: Create HR team members
            const hrTeamRef = collection(db, 'hrTeam');
            let hrTeamCreated = 0;

            for (const member of formData.hrTeam) {
                if (member.firstName && member.lastName && member.email) {
                    await addDoc(hrTeamRef, {
                        companyId: companyId,
                        firstName: member.firstName,
                        lastName: member.lastName,
                        email: member.email,
                        role: member.role,
                        department: member.department,
                        status: 'pending', // Pending invitation
                        invitedAt: Timestamp.now(),
                        createdAt: Timestamp.now(),
                        updatedAt: Timestamp.now()
                    });
                    hrTeamCreated++;
                }
            }
            console.log(`✅ Created ${hrTeamCreated} HR team members`);

            // Step 4: Create system configuration
            const systemConfigRef = collection(db, 'systemConfig');
            await addDoc(systemConfigRef, {
                companyId: companyId,
                emailTemplates: formData.emailTemplates,
                notifications: formData.notifications,
                security: formData.security,
                createdAt: Timestamp.now(),
                updatedAt: Timestamp.now()
            });
            console.log(`✅ Created system configuration`);

            // Step 5: Create department documents for this company
            const departmentsRef = collection(db, 'departments');
            let departmentsCreated = 0;

            for (const deptName of cleanDepartments) {
                await addDoc(departmentsRef, {
                    companyId: companyId,
                    name: deptName,
                    description: `${deptName} department`,
                    isActive: true,
                    createdAt: Timestamp.now(),
                    updatedAt: Timestamp.now()
                });
                departmentsCreated++;
            }
            console.log(`✅ Created ${departmentsCreated} department documents in Firebase`);

            // Refresh company data
            const updatedCompany = await companyService.getCompany(companyId);
            if (updatedCompany) {
                setCompany(updatedCompany);
            }

            console.log('🎉 Onboarding completed successfully!');
            console.log('📊 Summary of saved data:', {
                company: formData.displayName,
                domain: formData.domain,
                address: `${formData.address}, ${formData.city}, ${formData.country}`,
                email: formData.email,
                phone: formData.phone,
                website: formData.website,
                industry: formData.industry,
                companySize: formData.companySize,
                timezone: formData.timezone,
                primaryColor: formData.primaryColor,
                secondaryColor: formData.secondaryColor,
                departmentsCreated: departmentsCreated,
                leaveTypesCreated: leaveTypesCreated,
                hrTeamCreated: hrTeamCreated
            });

            // Show success message briefly before redirect
            alert(`🎉 Company Profile Created!\n\n✅ Company profile saved\n✅ ${leaveTypesCreated} leave types created\n✅ ${departmentsCreated} departments configured\n✅ ${hrTeamCreated} HR team members added\n✅ System configuration saved\n\nNext: Create your HR administrator account`);

            // Navigate to signup page to create HR user
            navigate('/signup');

        } catch (err: any) {
            console.error('Error completing onboarding:', err);
            setError(`Failed to complete onboarding: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    const renderStepContent = () => {
        switch (currentStep) {
            case 1:
                return <WelcomeStep onNext={handleNext} />;

            case 2:
                return (
                    <CompanyProfileStep
                        formData={formData}
                        setFormData={setFormData}
                        onNext={handleNext}
                        onBack={handleBack}
                    />
                );

            case 3:
                return (
                    <BusinessDetailsStep
                        formData={formData}
                        setFormData={setFormData}
                        onNext={handleNext}
                        onBack={handleBack}
                    />
                );

            case 4:
                return (
                    <BrandingStep
                        formData={formData}
                        setFormData={setFormData}
                        onNext={handleNext}
                        onBack={handleBack}
                    />
                );

            case 5:
                return (
                    <DepartmentsStep
                        formData={formData}
                        setFormData={setFormData}
                        onNext={handleNext}
                        onBack={handleBack}
                    />
                );

            case 6:
                return (
                    <LeaveTypesStep
                        formData={formData}
                        setFormData={setFormData}
                        onNext={handleNext}
                        onBack={handleBack}
                    />
                );

            case 7:
                return (
                    <HrTeamStep
                        formData={formData}
                        setFormData={setFormData}
                        onNext={handleNext}
                        onBack={handleBack}
                    />
                );

            case 8:
                return (
                    <SystemConfigStep
                        formData={formData}
                        setFormData={setFormData}
                        onNext={handleNext}
                        onBack={handleBack}
                    />
                );

            case 9:
                return (
                    <CompleteStep
                        formData={formData}
                        onComplete={handleComplete}
                        onBack={handleBack}
                        loading={loading}
                        error={error}
                    />
                );

            default:
                return null;
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
            <div className="w-full max-w-4xl">
                {/* Progress Steps */}
                <div className="mb-8">
                    <div className="flex items-center justify-between">
                        {STEPS.map((step, index) => {
                            const Icon = step.icon;
                            const isActive = currentStep === step.id;
                            const isCompleted = currentStep > step.id;

                            return (
                                <div key={step.id} className="flex items-center flex-1">
                                    <div className="flex flex-col items-center flex-1">
                                        <div
                                            className={`
                        w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300
                        ${isActive ? 'bg-blue-600 text-white scale-110 shadow-lg' : ''}
                        ${isCompleted ? 'bg-green-600 text-white' : ''}
                        ${!isActive && !isCompleted ? 'bg-gray-200 text-gray-400' : ''}
                      `}
                                        >
                                            <Icon className="w-6 h-6" />
                                        </div>
                                        <span className={`text-xs mt-2 font-medium ${isActive ? 'text-blue-600' : 'text-gray-500'}`}>
                                            {step.title}
                                        </span>
                                    </div>
                                    {index < STEPS.length - 1 && (
                                        <div className={`h-1 flex-1 mx-2 rounded ${isCompleted ? 'bg-green-600' : 'bg-gray-200'}`} />
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Step Content */}
                {renderStepContent()}
            </div>
        </div>
    );
}

// Step Components
function WelcomeStep({ onNext }: { onNext: () => void }) {
    return (
        <Card className="border-2 shadow-xl">
            <CardContent className="p-12 text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Sparkles className="w-10 h-10 text-white" />
                </div>
                <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    Welcome to Your HRIS Platform!
                </h1>
                <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
                    Let's get your company set up in just a few minutes. We'll help you configure everything you need to start managing your team effectively.
                </p>
                <div className="grid grid-cols-3 gap-4 mb-8 max-w-2xl mx-auto">
                    <div className="p-4 bg-blue-50 rounded-lg">
                        <Clock className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                        <p className="text-sm font-medium">5 Minutes</p>
                        <p className="text-xs text-gray-500">Quick Setup</p>
                    </div>
                    <div className="p-4 bg-purple-50 rounded-lg">
                        <Users className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                        <p className="text-sm font-medium">Easy Config</p>
                        <p className="text-xs text-gray-500">No Tech Skills</p>
                    </div>
                    <div className="p-4 bg-green-50 rounded-lg">
                        <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
                        <p className="text-sm font-medium">Ready to Use</p>
                        <p className="text-xs text-gray-500">Start Instantly</p>
                    </div>
                </div>
                <Button
                    onClick={onNext}
                    size="lg"
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8"
                >
                    Let's Get Started
                    <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
            </CardContent>
        </Card>
    );
}

function CompanyProfileStep({
    formData,
    setFormData,
    onNext,
    onBack
}: {
    formData: OnboardingData;
    setFormData: (data: OnboardingData) => void;
    onNext: () => void;
    onBack: () => void;
}) {
    const canProceed = formData.displayName && formData.domain && formData.industry && formData.companySize;

    return (
        <Card className="border-2 shadow-xl">
            <CardHeader className="border-b bg-gradient-to-r from-blue-50 to-purple-50">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
                        <Building2 className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <CardTitle className="text-2xl">Company Profile</CardTitle>
                        <CardDescription>Tell us about your company</CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="p-8 space-y-6">
                <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <Label htmlFor="displayName">Company Name *</Label>
                        <Input
                            id="displayName"
                            placeholder="Acme Corporation"
                            value={formData.displayName}
                            onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="domain">Company Domain *</Label>
                        <Input
                            id="domain"
                            placeholder="acme"
                            value={formData.domain}
                            onChange={(e) => setFormData({ ...formData, domain: e.target.value.toLowerCase().replace(/[^a-z0-9]/g, '') })}
                        />
                        <p className="text-xs text-gray-500">Used for careers page: /careers/{formData.domain || 'yourdomain'}</p>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <Label htmlFor="industry">Industry *</Label>
                        <select
                            id="industry"
                            className="w-full p-2 border rounded-md"
                            value={formData.industry}
                            onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                        >
                            <option value="">Select industry...</option>
                            {INDUSTRIES.map((ind) => (
                                <option key={ind} value={ind}>{ind}</option>
                            ))}
                        </select>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="companySize">Company Size *</Label>
                        <select
                            id="companySize"
                            className="w-full p-2 border rounded-md"
                            value={formData.companySize}
                            onChange={(e) => setFormData({ ...formData, companySize: e.target.value })}
                        >
                            <option value="">Select size...</option>
                            {COMPANY_SIZES.map((size) => (
                                <option key={size} value={size}>{size} employees</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="website">Website (optional)</Label>
                    <Input
                        id="website"
                        type="url"
                        placeholder="https://acme.com"
                        value={formData.website}
                        onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                    />
                </div>

                <div className="flex justify-between pt-6 border-t">
                    <Button onClick={onBack} variant="outline">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back
                    </Button>
                    <Button
                        onClick={onNext}
                        disabled={!canProceed}
                        className="bg-blue-600 hover:bg-blue-700"
                    >
                        Continue
                        <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}

function BusinessDetailsStep({
    formData,
    setFormData,
    onNext,
    onBack
}: {
    formData: OnboardingData;
    setFormData: (data: OnboardingData) => void;
    onNext: () => void;
    onBack: () => void;
}) {
    const canProceed = formData.address && formData.city && formData.country && formData.email;

    return (
        <Card className="border-2 shadow-xl">
            <CardHeader className="border-b bg-gradient-to-r from-blue-50 to-purple-50">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center">
                        <MapPin className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <CardTitle className="text-2xl">Business Details</CardTitle>
                        <CardDescription>Where are you located?</CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="p-8 space-y-6">
                <div className="space-y-2">
                    <Label htmlFor="address">Street Address *</Label>
                    <Input
                        id="address"
                        placeholder="123 Business Street"
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    />
                </div>

                <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <Label htmlFor="city">City *</Label>
                        <Input
                            id="city"
                            placeholder="San Francisco"
                            value={formData.city}
                            onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="country">Country *</Label>
                        <Input
                            id="country"
                            placeholder="United States"
                            value={formData.country}
                            onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="timezone">Timezone *</Label>
                    <select
                        id="timezone"
                        className="w-full p-2 border rounded-md"
                        value={formData.timezone}
                        onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
                    >
                        {TIMEZONES.map((tz) => (
                            <option key={tz} value={tz}>{tz}</option>
                        ))}
                    </select>
                </div>

                <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <Label htmlFor="phone">Phone Number (optional)</Label>
                        <Input
                            id="phone"
                            type="tel"
                            placeholder="+1 (555) 123-4567"
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="email">Contact Email *</Label>
                        <Input
                            id="email"
                            type="email"
                            placeholder="hr@acme.com"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        />
                    </div>
                </div>

                <div className="flex justify-between pt-6 border-t">
                    <Button onClick={onBack} variant="outline">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back
                    </Button>
                    <Button
                        onClick={onNext}
                        disabled={!canProceed}
                        className="bg-blue-600 hover:bg-blue-700"
                    >
                        Continue
                        <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}

function BrandingStep({
    formData,
    setFormData,
    onNext,
    onBack
}: {
    formData: OnboardingData;
    setFormData: (data: OnboardingData) => void;
    onNext: () => void;
    onBack: () => void;
}) {
    return (
        <Card className="border-2 shadow-xl">
            <CardHeader className="border-b bg-gradient-to-r from-blue-50 to-purple-50">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-pink-600 rounded-lg flex items-center justify-center">
                        <Palette className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <CardTitle className="text-2xl">Branding</CardTitle>
                        <CardDescription>Customize your company's appearance</CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="p-8 space-y-6">
                <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <Label htmlFor="primaryColor">Primary Color</Label>
                        <div className="flex gap-2">
                            <Input
                                id="primaryColor"
                                type="color"
                                value={formData.primaryColor.trim()}
                                onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value.trim() })}
                                className="w-20 h-12"
                            />
                            <Input
                                value={formData.primaryColor}
                                onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value.trim() })}
                                placeholder="#3B82F6"
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="secondaryColor">Secondary Color</Label>
                        <div className="flex gap-2">
                            <Input
                                id="secondaryColor"
                                type="color"
                                value={formData.secondaryColor.trim()}
                                onChange={(e) => setFormData({ ...formData, secondaryColor: e.target.value.trim() })}
                                className="w-20 h-12"
                            />
                            <Input
                                value={formData.secondaryColor}
                                onChange={(e) => setFormData({ ...formData, secondaryColor: e.target.value.trim() })}
                                placeholder="#1E40AF"
                            />
                        </div>
                    </div>
                </div>

                <div className="p-6 border-2 rounded-lg" style={{ borderColor: formData.primaryColor, background: `${formData.primaryColor}10` }}>
                    <h3 className="text-lg font-bold mb-2" style={{ color: formData.primaryColor }}>Preview</h3>
                    <p className="text-sm text-gray-600 mb-4">This is how your brand colors will appear across the platform.</p>
                    <div className="flex gap-2">
                        <div className="px-4 py-2 rounded" style={{ backgroundColor: formData.primaryColor, color: 'white' }}>
                            Primary Button
                        </div>
                        <div className="px-4 py-2 rounded" style={{ backgroundColor: formData.secondaryColor, color: 'white' }}>
                            Secondary Button
                        </div>
                    </div>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="logo">Logo URL (optional)</Label>
                    <Input
                        id="logo"
                        type="url"
                        placeholder="https://yoursite.com/logo.png"
                        value={formData.logo}
                        onChange={(e) => setFormData({ ...formData, logo: e.target.value })}
                    />
                    <p className="text-xs text-gray-500">You can upload a logo later from settings</p>
                </div>

                <div className="flex justify-between pt-6 border-t">
                    <Button onClick={onBack} variant="outline">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back
                    </Button>
                    <Button onClick={onNext} className="bg-blue-600 hover:bg-blue-700">
                        Continue
                        <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}

function DepartmentsStep({
    formData,
    setFormData,
    onNext,
    onBack
}: {
    formData: OnboardingData;
    setFormData: (data: OnboardingData) => void;
    onNext: () => void;
    onBack: () => void;
}) {
    const addDepartment = () => {
        setFormData({ ...formData, departments: [...formData.departments, ''] });
    };

    const removeDepartment = (index: number) => {
        const newDepts = formData.departments.filter((_, i) => i !== index);
        setFormData({ ...formData, departments: newDepts });
    };

    const updateDepartment = (index: number, value: string) => {
        const newDepts = [...formData.departments];
        newDepts[index] = value;
        setFormData({ ...formData, departments: newDepts });
    };

    return (
        <Card className="border-2 shadow-xl">
            <CardHeader className="border-b bg-gradient-to-r from-blue-50 to-purple-50">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center">
                        <Users className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <CardTitle className="text-2xl">Departments</CardTitle>
                        <CardDescription>Set up your company structure</CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="p-8 space-y-6">
                <p className="text-sm text-gray-600">
                    Add the main departments in your organization. You can always add more later.
                </p>

                <div className="space-y-3">
                    {formData.departments.map((dept, index) => (
                        <div key={index} className="flex gap-2">
                            <Input
                                placeholder={`Department ${index + 1}`}
                                value={dept}
                                onChange={(e) => updateDepartment(index, e.target.value)}
                            />
                            {formData.departments.length > 1 && (
                                <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={() => removeDepartment(index)}
                                    className="hover:bg-red-50 hover:text-red-600"
                                >
                                    ×
                                </Button>
                            )}
                        </div>
                    ))}
                </div>

                <Button onClick={addDepartment} variant="outline" className="w-full">
                    + Add Department
                </Button>

                <div className="flex justify-between pt-6 border-t">
                    <Button onClick={onBack} variant="outline">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back
                    </Button>
                    <Button onClick={onNext} className="bg-blue-600 hover:bg-blue-700">
                        Continue
                        <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}

function LeaveTypesStep({
    formData,
    setFormData,
    onNext,
    onBack
}: {
    formData: OnboardingData;
    setFormData: (data: OnboardingData) => void;
    onNext: () => void;
    onBack: () => void;
}) {
    const addLeaveType = () => {
        setFormData({
            ...formData,
            leaveTypes: [...formData.leaveTypes, { name: '', days: 0 }]
        });
    };

    const removeLeaveType = (index: number) => {
        const newTypes = formData.leaveTypes.filter((_, i) => i !== index);
        setFormData({ ...formData, leaveTypes: newTypes });
    };

    const updateLeaveType = (index: number, field: 'name' | 'days', value: string | number) => {
        const newTypes = [...formData.leaveTypes];
        newTypes[index] = { ...newTypes[index], [field]: value };
        setFormData({ ...formData, leaveTypes: newTypes });
    };

    return (
        <Card className="border-2 shadow-xl">
            <CardHeader className="border-b bg-gradient-to-r from-blue-50 to-purple-50">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-orange-600 rounded-lg flex items-center justify-center">
                        <Calendar className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <CardTitle className="text-2xl">Leave Policies</CardTitle>
                        <CardDescription>Configure your leave types</CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="p-8 space-y-6">
                <p className="text-sm text-gray-600">
                    Set up the types of leave your company offers. You can customize these later.
                </p>

                {/* Labels for the input fields */}
                <div className="grid grid-cols-[1fr_auto_auto] gap-2 items-center">
                    <Label className="text-sm font-semibold text-gray-700">Type of Leave</Label>
                    <Label className="text-sm font-semibold text-gray-700 w-24">Days</Label>
                    <div className="w-10"></div> {/* Spacer for remove button */}
                </div>

                <div className="space-y-3">
                    {formData.leaveTypes.map((type, index) => (
                        <div key={index} className="grid grid-cols-[1fr_auto_auto] gap-2 items-center">
                            <Input
                                placeholder="e.g., Annual Leave, Sick Leave"
                                value={type.name}
                                onChange={(e) => updateLeaveType(index, 'name', e.target.value)}
                            />
                            <Input
                                type="number"
                                placeholder="10"
                                value={type.days || ''}
                                onChange={(e) => updateLeaveType(index, 'days', parseInt(e.target.value) || 0)}
                                className="w-24 text-center"
                                min="0"
                                max="365"
                            />
                            {formData.leaveTypes.length > 1 && (
                                <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={() => removeLeaveType(index)}
                                    className="hover:bg-red-50 hover:text-red-600 w-10 h-10"
                                    title="Remove this leave type"
                                >
                                    ×
                                </Button>
                            )}
                            {formData.leaveTypes.length === 1 && (
                                <div className="w-10"></div> /* Spacer when there's only one leave type */
                            )}
                        </div>
                    ))}
                </div>

                <Button onClick={addLeaveType} variant="outline" className="w-full">
                    + Add Leave Type
                </Button>

                <div className="flex justify-between pt-6 border-t">
                    <Button onClick={onBack} variant="outline">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back
                    </Button>
                    <Button onClick={onNext} className="bg-blue-600 hover:bg-blue-700">
                        Continue
                        <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}

function HrTeamStep({
    formData,
    setFormData,
    onNext,
    onBack
}: {
    formData: OnboardingData;
    setFormData: (data: OnboardingData) => void;
    onNext: () => void;
    onBack: () => void;
}) {
    const addHrMember = () => {
        setFormData({
            ...formData,
            hrTeam: [...formData.hrTeam, { firstName: '', lastName: '', email: '', role: '', department: '' }]
        });
    };

    const removeHrMember = (index: number) => {
        const newTeam = formData.hrTeam.filter((_, i) => i !== index);
        setFormData({ ...formData, hrTeam: newTeam });
    };

    const updateHrMember = (index: number, field: string, value: string) => {
        const newTeam = [...formData.hrTeam];
        newTeam[index] = { ...newTeam[index], [field]: value };
        setFormData({ ...formData, hrTeam: newTeam });
    };

    return (
        <Card className="border-2 shadow-xl">
            <CardHeader className="border-b bg-gradient-to-r from-blue-50 to-purple-50">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-indigo-600 rounded-lg flex items-center justify-center">
                        <Briefcase className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <CardTitle className="text-2xl">HR Team Setup</CardTitle>
                        <CardDescription>Add additional HR team members</CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="p-8 space-y-6">
                <p className="text-sm text-gray-600">
                    Add other HR team members who will have access to the platform. You can add more later.
                </p>

                <div className="space-y-4">
                    {formData.hrTeam.map((member, index) => (
                        <div key={index} className="p-4 border rounded-lg space-y-4">
                            <div className="flex justify-between items-center">
                                <h4 className="font-medium">HR Member {index + 1}</h4>
                                {formData.hrTeam.length > 0 && (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => removeHrMember(index)}
                                        className="hover:bg-red-50 hover:text-red-600"
                                    >
                                        Remove
                                    </Button>
                                )}
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor={`firstName-${index}`}>First Name</Label>
                                    <Input
                                        id={`firstName-${index}`}
                                        value={member.firstName}
                                        onChange={(e) => updateHrMember(index, 'firstName', e.target.value)}
                                        placeholder="John"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor={`lastName-${index}`}>Last Name</Label>
                                    <Input
                                        id={`lastName-${index}`}
                                        value={member.lastName}
                                        onChange={(e) => updateHrMember(index, 'lastName', e.target.value)}
                                        placeholder="Doe"
                                    />
                                </div>
                            </div>
                            <div>
                                <Label htmlFor={`email-${index}`}>Email Address</Label>
                                <Input
                                    id={`email-${index}`}
                                    type="email"
                                    value={member.email}
                                    onChange={(e) => updateHrMember(index, 'email', e.target.value)}
                                    placeholder="john.doe@company.com"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor={`role-${index}`}>Role</Label>
                                    <select
                                        id={`role-${index}`}
                                        className="w-full p-2 border rounded-md"
                                        value={member.role}
                                        onChange={(e) => updateHrMember(index, 'role', e.target.value)}
                                    >
                                        <option value="">Select role...</option>
                                        <option value="HR Manager">HR Manager</option>
                                        <option value="HR Specialist">HR Specialist</option>
                                        <option value="Recruiter">Recruiter</option>
                                        <option value="HR Assistant">HR Assistant</option>
                                    </select>
                                </div>
                                <div>
                                    <Label htmlFor={`department-${index}`}>Department</Label>
                                    <select
                                        id={`department-${index}`}
                                        className="w-full p-2 border rounded-md"
                                        value={member.department}
                                        onChange={(e) => updateHrMember(index, 'department', e.target.value)}
                                    >
                                        <option value="">Select department...</option>
                                        {formData.departments.map((dept) => (
                                            <option key={dept} value={dept}>{dept}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <Button onClick={addHrMember} variant="outline" className="w-full">
                    + Add HR Team Member
                </Button>

                <div className="flex justify-between pt-6 border-t">
                    <Button onClick={onBack} variant="outline">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back
                    </Button>
                    <Button onClick={onNext} className="bg-blue-600 hover:bg-blue-700">
                        Continue
                        <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}

function SystemConfigStep({
    formData,
    setFormData,
    onNext,
    onBack
}: {
    formData: OnboardingData;
    setFormData: (data: OnboardingData) => void;
    onNext: () => void;
    onBack: () => void;
}) {
    return (
        <Card className="border-2 shadow-xl">
            <CardHeader className="border-b bg-gradient-to-r from-blue-50 to-purple-50">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center">
                        <Settings className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <CardTitle className="text-2xl">System Configuration</CardTitle>
                        <CardDescription>Configure your platform settings</CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="p-8 space-y-8">
                {/* Email Templates */}
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                        <Mail className="w-5 h-5 text-blue-600" />
                        Email Templates
                    </h3>
                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="welcomeEmail">Welcome Email Template</Label>
                            <Textarea
                                id="welcomeEmail"
                                value={formData.emailTemplates.welcomeEmail}
                                onChange={(e) => setFormData({
                                    ...formData,
                                    emailTemplates: { ...formData.emailTemplates, welcomeEmail: e.target.value }
                                })}
                                placeholder="Welcome to {companyName}! We're excited to have you on board."
                                rows={3}
                            />
                        </div>
                        <div>
                            <Label htmlFor="onboardingEmail">Onboarding Email Template</Label>
                            <Textarea
                                id="onboardingEmail"
                                value={formData.emailTemplates.onboardingEmail}
                                onChange={(e) => setFormData({
                                    ...formData,
                                    emailTemplates: { ...formData.emailTemplates, onboardingEmail: e.target.value }
                                })}
                                placeholder="Your onboarding process is ready. Please complete the required steps."
                                rows={3}
                            />
                        </div>
                    </div>
                </div>

                {/* Notifications */}
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                        <Bell className="w-5 h-5 text-green-600" />
                        Notification Preferences
                    </h3>
                    <div className="space-y-3">
                        <div className="flex items-center space-x-2">
                            <input
                                type="checkbox"
                                id="emailNotifications"
                                checked={formData.notifications.emailNotifications}
                                onChange={(e) => setFormData({
                                    ...formData,
                                    notifications: { ...formData.notifications, emailNotifications: e.target.checked }
                                })}
                                className="rounded"
                            />
                            <Label htmlFor="emailNotifications">Email Notifications</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <input
                                type="checkbox"
                                id="smsNotifications"
                                checked={formData.notifications.smsNotifications}
                                onChange={(e) => setFormData({
                                    ...formData,
                                    notifications: { ...formData.notifications, smsNotifications: e.target.checked }
                                })}
                                className="rounded"
                            />
                            <Label htmlFor="smsNotifications">SMS Notifications</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <input
                                type="checkbox"
                                id="pushNotifications"
                                checked={formData.notifications.pushNotifications}
                                onChange={(e) => setFormData({
                                    ...formData,
                                    notifications: { ...formData.notifications, pushNotifications: e.target.checked }
                                })}
                                className="rounded"
                            />
                            <Label htmlFor="pushNotifications">Push Notifications</Label>
                        </div>
                    </div>
                </div>

                {/* Security */}
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                        <Shield className="w-5 h-5 text-red-600" />
                        Security Settings
                    </h3>
                    <div className="space-y-4">
                        <div className="flex items-center space-x-2">
                            <input
                                type="checkbox"
                                id="twoFactorAuth"
                                checked={formData.security.twoFactorAuth}
                                onChange={(e) => setFormData({
                                    ...formData,
                                    security: { ...formData.security, twoFactorAuth: e.target.checked }
                                })}
                                className="rounded"
                            />
                            <Label htmlFor="twoFactorAuth">Enable Two-Factor Authentication</Label>
                        </div>
                        <div>
                            <Label htmlFor="passwordPolicy">Password Policy</Label>
                            <select
                                id="passwordPolicy"
                                className="w-full p-2 border rounded-md"
                                value={formData.security.passwordPolicy}
                                onChange={(e) => setFormData({
                                    ...formData,
                                    security: { ...formData.security, passwordPolicy: e.target.value }
                                })}
                            >
                                <option value="low">Low (6+ characters)</option>
                                <option value="medium">Medium (8+ characters, mixed case)</option>
                                <option value="high">High (12+ characters, special chars)</option>
                            </select>
                        </div>
                        <div>
                            <Label htmlFor="sessionTimeout">Session Timeout (hours)</Label>
                            <Input
                                id="sessionTimeout"
                                type="number"
                                value={formData.security.sessionTimeout}
                                onChange={(e) => setFormData({
                                    ...formData,
                                    security: { ...formData.security, sessionTimeout: parseInt(e.target.value) || 8 }
                                })}
                                min="1"
                                max="24"
                            />
                        </div>
                    </div>
                </div>

                <div className="flex justify-between pt-6 border-t">
                    <Button onClick={onBack} variant="outline">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back
                    </Button>
                    <Button onClick={onNext} className="bg-blue-600 hover:bg-blue-700">
                        Continue
                        <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}

function CompleteStep({
    formData,
    onComplete,
    onBack,
    loading,
    error
}: {
    formData: OnboardingData;
    onComplete: () => void;
    onBack: () => void;
    loading: boolean;
    error: string;
}) {
    return (
        <Card className="border-2 shadow-xl">
            <CardHeader className="border-b bg-gradient-to-r from-green-50 to-blue-50">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center">
                        <CheckCircle className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <CardTitle className="text-2xl">Almost Done!</CardTitle>
                        <CardDescription>Review and complete your setup</CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="p-8 space-y-6">
                <div className="bg-gradient-to-br from-blue-50 to-purple-50 p-6 rounded-lg border-2 border-blue-200">
                    <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                        <Building2 className="h-5 w-5 text-blue-600" />
                        What Will Be Saved to Firebase:
                    </h3>

                    {/* Company Profile */}
                    <div className="mb-4">
                        <h4 className="font-semibold text-sm text-blue-800 mb-2">📋 Company Profile Document:</h4>
                        <div className="space-y-1 text-sm bg-white p-3 rounded border">
                            <div className="flex justify-between">
                                <span className="text-gray-600">Name:</span>
                                <span className="font-medium">{formData.displayName}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Domain:</span>
                                <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">{formData.domain}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Industry:</span>
                                <span className="font-medium">{formData.industry}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Size:</span>
                                <span className="font-medium">{formData.companySize} employees</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Address:</span>
                                <span className="font-medium text-right">{formData.address}, {formData.city}, {formData.country}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Email:</span>
                                <span className="font-medium">{formData.email}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Timezone:</span>
                                <span className="font-medium">{formData.timezone}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-gray-600">Colors:</span>
                                <div className="flex gap-2">
                                    <span className="w-6 h-6 rounded border" style={{ backgroundColor: formData.primaryColor }}></span>
                                    <span className="w-6 h-6 rounded border" style={{ backgroundColor: formData.secondaryColor }}></span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Departments */}
                    <div className="mb-4">
                        <h4 className="font-semibold text-sm text-blue-800 mb-2">
                            👥 Departments Collection ({formData.departments.filter(d => d).length} documents):
                        </h4>
                        <div className="flex flex-wrap gap-2">
                            {formData.departments.filter(d => d).map((dept, i) => (
                                <span key={i} className="bg-white border border-blue-200 px-3 py-1 rounded-full text-xs font-medium">
                                    {dept}
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* Leave Types */}
                    <div>
                        <h4 className="font-semibold text-sm text-blue-800 mb-2">
                            📅 Leave Types Collection ({formData.leaveTypes.length} documents):
                        </h4>
                        <div className="space-y-2">
                            {formData.leaveTypes.map((type, i) => (
                                <div key={i} className="bg-white border border-blue-200 px-3 py-2 rounded text-xs flex justify-between items-center">
                                    <span className="font-medium">{type.name}</span>
                                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">{type.days} days/year</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {error && (
                    <Alert className="border-red-200 bg-red-50">
                        <AlertTriangle className="h-4 w-4 text-red-600" />
                        <AlertDescription className="text-red-800">{error}</AlertDescription>
                    </Alert>
                )}

                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <p className="text-sm text-green-900 font-medium">
                        💾 All data will be saved to Firebase Firestore
                    </p>
                    <p className="text-xs text-green-700 mt-1">
                        • Company profile → /companies/{'{companyId}'}
                    </p>
                    <p className="text-xs text-green-700">
                        • Departments → /departments collection (tagged with companyId)
                    </p>
                    <p className="text-xs text-green-700">
                        • Leave types → /leaveTypes collection (tagged with companyId)
                    </p>
                </div>

                <div className="flex justify-between pt-6 border-t">
                    <Button onClick={onBack} variant="outline" disabled={loading}>
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back
                    </Button>
                    <Button
                        onClick={onComplete}
                        disabled={loading}
                        className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white px-8"
                    >
                        {loading ? (
                            <>
                                <span className="animate-spin mr-2">⏳</span>
                                Setting up...
                            </>
                        ) : (
                            <>
                                <CheckCircle className="mr-2 h-5 w-5" />
                                Complete Setup
                            </>
                        )}
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
