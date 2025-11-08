import { useState, useEffect } from 'react';
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
import { collection, addDoc, Timestamp, doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { applyBrandingColors } from '../../utils/brandingUtils';
import { getCareersPlatformUrl, getEmployeePlatformUrl } from '../../services/platformConfigService';
import { useTheme } from '../../components/atoms/ThemeProvider';

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
    supportEmail: string;

    // Step 3: Branding
    primaryColor: string;
    secondaryColor: string;
    logo: string;

    // Step 4: Departments
    departments: string[];

    // Step 5: Leave Types
    leaveTypes: Array<{
        name: string;
        days: number | string; // Allow string for empty state
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
    profileCompletionThreshold: number;
}

const STEPS = [
    { id: 1, title: 'Welcome', icon: Sparkles },
    { id: 2, title: 'Company Profile', icon: Building2 },
    { id: 3, title: 'Business Details', icon: MapPin },
    { id: 4, title: 'Branding', icon: Palette },
    { id: 5, title: 'Departments', icon: Users },
    { id: 6, title: 'Leave Policies', icon: Calendar },
    { id: 7, title: 'HR Team Setup', icon: Briefcase },
    { id: 8, title: 'Complete', icon: CheckCircle }
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
    'Africa/Nairobi',
    'Africa/Casablanca',
    'Europe/London',
    'Europe/Paris',
    'Europe/Berlin',
    'Europe/Madrid',
    'Europe/Rome',
    'America/New_York',
    'America/Chicago',
    'America/Denver',
    'America/Los_Angeles',
    'America/Toronto',
    'America/Sao_Paulo',
    'America/Mexico_City',
    'Asia/Dubai',
    'Asia/Tokyo',
    'Asia/Shanghai',
    'Asia/Kolkata',
    'Asia/Singapore',
    'Australia/Sydney',
    'Australia/Melbourne',
    'Pacific/Auckland'
];

// Country to timezone mapping for auto-detection
const COUNTRY_TIMEZONE_MAP: Record<string, string> = {
    'Nigeria': 'Africa/Lagos',
    'South Africa': 'Africa/Johannesburg',
    'Egypt': 'Africa/Cairo',
    'Kenya': 'Africa/Nairobi',
    'Morocco': 'Africa/Casablanca',
    'United Kingdom': 'Europe/London',
    'UK': 'Europe/London',
    'France': 'Europe/Paris',
    'Germany': 'Europe/Berlin',
    'Spain': 'Europe/Madrid',
    'Italy': 'Europe/Rome',
    'United States': 'America/New_York',
    'USA': 'America/New_York',
    'US': 'America/New_York',
    'Canada': 'America/Toronto',
    'Brazil': 'America/Sao_Paulo',
    'Mexico': 'America/Mexico_City',
    'UAE': 'Asia/Dubai',
    'United Arab Emirates': 'Asia/Dubai',
    'Japan': 'Asia/Tokyo',
    'China': 'Asia/Shanghai',
    'India': 'Asia/Kolkata',
    'Singapore': 'Asia/Singapore',
    'Australia': 'Australia/Sydney',
    'New Zealand': 'Pacific/Auckland'
};

// City to timezone mapping (for major cities)
const CITY_TIMEZONE_MAP: Record<string, string> = {
    'Lagos': 'Africa/Lagos',
    'Johannesburg': 'Africa/Johannesburg',
    'Cairo': 'Africa/Cairo',
    'London': 'Europe/London',
    'Paris': 'Europe/Paris',
    'Berlin': 'Europe/Berlin',
    'New York': 'America/New_York',
    'Chicago': 'America/Chicago',
    'Los Angeles': 'America/Los_Angeles',
    'Toronto': 'America/Toronto',
    'Dubai': 'Asia/Dubai',
    'Tokyo': 'Asia/Tokyo',
    'Shanghai': 'Asia/Shanghai',
    'Mumbai': 'Asia/Kolkata',
    'Singapore': 'Asia/Singapore',
    'Sydney': 'Australia/Sydney'
};

/**
 * Detect timezone based on country and city
 * Falls back to browser timezone if location doesn't match
 */
function detectTimezone(country: string, city: string): string {
    // Try city first (more specific)
    if (city && CITY_TIMEZONE_MAP[city]) {
        return CITY_TIMEZONE_MAP[city];
    }
    
    // Try country
    if (country && COUNTRY_TIMEZONE_MAP[country]) {
        return COUNTRY_TIMEZONE_MAP[country];
    }
    
    // Fallback to browser timezone
    try {
        const browserTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        if (TIMEZONES.includes(browserTimezone)) {
            return browserTimezone;
        }
    } catch (e) {
        console.warn('Could not detect browser timezone:', e);
    }
    
    // Default fallback
    return 'Africa/Lagos';
}

export default function CompanyOnboarding() {
    const navigate = useNavigate();
    const { company, companyId, setCompany } = useCompany();
    const { theme } = useTheme();
    const [currentStep, setCurrentStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [skipLoading, setSkipLoading] = useState(false);

    // Function to skip onboarding and mark as complete
    const handleSkipOnboarding = async () => {
        if (!companyId) {
            alert('Company ID not found. Please contact support.');
            return;
        }

        if (!confirm('Are you sure you want to skip onboarding? You can always complete it later from Settings.')) {
            return;
        }

        setSkipLoading(true);
        try {
            const { doc, updateDoc } = await import('firebase/firestore');
            const db = getFirebaseDb();
            const companyRef = doc(db, 'companies', companyId);
            
            await updateDoc(companyRef, {
                'settings.onboardingCompleted': true,
                'settings.onboardingCompletedAt': new Date().toISOString()
            });

            console.log('✅ Onboarding marked as completed');
            alert('✅ Onboarding skipped. Redirecting to dashboard...');
            navigate('/dashboard', { replace: true });
        } catch (error) {
            console.error('Error skipping onboarding:', error);
            alert('Failed to skip onboarding. Please try again.');
        } finally {
            setSkipLoading(false);
        }
    };

    // Initialize timezone from browser on mount
    const getInitialTimezone = (): string => {
        try {
            const browserTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
            if (TIMEZONES.includes(browserTimezone)) {
                return browserTimezone;
            }
        } catch (e) {
            console.warn('Could not detect browser timezone:', e);
        }
        return 'Africa/Lagos';
    };

    const [formData, setFormData] = useState<OnboardingData>({
        displayName: company?.displayName || '',
        domain: company?.domain || '',
        industry: '',
        companySize: '',
        website: '',
        address: '',
        city: '',
        country: '',
        timezone: getInitialTimezone(),
        phone: '',
        email: '',
        supportEmail: company?.settings?.supportEmail || company?.email || '',
        primaryColor: '#3B82F6',
        secondaryColor: '#8B5CF6',
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
        },
        profileCompletionThreshold: company?.settings?.profileCompletionThreshold ?? 75
    });
    const [isPrefilled, setIsPrefilled] = useState(false);

    useEffect(() => {
        if (!company || isPrefilled) {
            return;
        }

        const resolvedAddressParts = company.address?.split(',').map((part) => part.trim()) ?? [];
        const streetAddress = resolvedAddressParts[0] ?? '';
        const cityFromAddress = resolvedAddressParts[1] ?? '';
        const countryFromAddress = resolvedAddressParts[resolvedAddressParts.length - 1] ?? '';

        setFormData((prev) => ({
            ...prev,
            displayName: company.displayName ?? company.name ?? prev.displayName,
            domain: company.domain ?? prev.domain,
            website: company.website ?? prev.website,
            phone: company.phone ?? prev.phone,
            email: company.email ?? prev.email,
            supportEmail: company.settings?.supportEmail ?? company.email ?? prev.supportEmail,
            address: streetAddress || prev.address,
            city: cityFromAddress || prev.city,
            country: countryFromAddress || prev.country,
            primaryColor: company.primaryColor ?? prev.primaryColor,
            secondaryColor: company.secondaryColor ?? prev.secondaryColor,
            logo: company.logo ?? prev.logo,
            industry: company.settings?.industry ?? prev.industry,
            companySize: company.settings?.companySize ?? prev.companySize,
            timezone: company.settings?.timezone ?? prev.timezone,
            departments:
                company.settings?.departments?.length
                    ? [...company.settings.departments]
                    : prev.departments,
            profileCompletionThreshold: company.settings?.profileCompletionThreshold ?? prev.profileCompletionThreshold ?? 75
        }));

        setIsPrefilled(true);
    }, [company, isPrefilled]);

    const linkHrUserToCompany = async (companyId: string, userId: string, userEmail: string | null | undefined, displayName: string) => {
        try {
            const db = getFirebaseDb();
            const hrUserRef = doc(db, 'hrUsers', userId);
            const existingHrUser = await getDoc(hrUserRef);
            const payload = {
                companyId,
                email: userEmail ?? '',
                displayName,
                onboardingCompleted: true,
                onboardingCompletedAt: new Date().toISOString(),
                updatedAt: Timestamp.now(),
            };

            if (existingHrUser.exists()) {
                await updateDoc(hrUserRef, payload);
                console.log('✅ Linked existing HR user to company:', companyId);
            } else {
                await setDoc(hrUserRef, {
                    ...payload,
                    createdAt: Timestamp.now(),
                });
                console.log('✅ Created HR user record linked to company:', companyId);
            }
        } catch (error) {
            console.error('❌ Failed to link HR user to company:', error);
        }
    };
    
    // Apply initial branding colors when component mounts or theme changes
    useEffect(() => {
        const isDark = theme === 'dark';
        applyBrandingColors(formData.primaryColor, formData.secondaryColor, isDark);
    }, [theme]); // Re-apply when theme changes

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
                        onboardingCompleted: false,
                        supportEmail: formData.supportEmail || formData.email,
                        profileCompletionThreshold: Number(formData.profileCompletionThreshold) || 75
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

        await linkHrUserToCompany(newCompanyId, currentUser.uid, currentUser.email, formData.displayName);
            } else {
                companyId = company.id;
                console.log('✅ Using existing company:', companyId);

                await linkHrUserToCompany(companyId, currentUser.uid, currentUser.email, formData.displayName || company.displayName || company.name || '');
            }

            const rawDomain = (formData.domain || company?.domain || '').trim();
            const normalizedCareersSlug = rawDomain
                ? rawDomain
                    .toLowerCase()
                    .replace(/\s+/g, '-')
                    .replace(/[^a-z0-9-]/g, '-')
                    .replace(/-+/g, '-')
                    .replace(/^-|-$/g, '')
                : '';

            const normalizedEmployeeSlug = normalizedCareersSlug;

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
                        ...company?.settings,
                        industry: formData.industry,
                        companySize: formData.companySize,
                        timezone: formData.timezone,
                        careersSlug: formData.domain,
                        allowPublicApplications: true,
                        departments: cleanDepartments, // ← Save departments in settings
                        onboardingCompleted: true,
                        onboardingCompletedAt: new Date().toISOString(),
                        supportEmail: formData.supportEmail || formData.email,
                        profileCompletionThreshold: Number(formData.profileCompletionThreshold) || 75,
                        employeeSlug: normalizedEmployeeSlug || undefined
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

            // Step 1b: Save company-specific careers portal link in hrSettings
            try {
                const baseCareersUrl = (await getCareersPlatformUrl(companyId)) || 'https://hris-careers-platform.vercel.app';
                const normalizedBaseCareersUrl = baseCareersUrl.replace(/\/$/, '');
                const careersPortalUrl = normalizedCareersSlug
                    ? `${normalizedBaseCareersUrl}/careers/${normalizedCareersSlug}`
                    : normalizedBaseCareersUrl;

                const baseEmployeeUrl = (await getEmployeePlatformUrl(companyId)) || 'https://hris-employee-platform.vercel.app';
                const normalizedBaseEmployeeUrl = baseEmployeeUrl.replace(/\/$/, '');
                const employeePortalUrl = normalizedEmployeeSlug
                    ? `${normalizedBaseEmployeeUrl}/employee/${normalizedEmployeeSlug}`
                    : normalizedBaseEmployeeUrl;

                await setDoc(doc(db, 'hrSettings', companyId), {
                    companyId,
                    careersPortalUrl,
                    careersSlug: normalizedCareersSlug || null,
                    employeePortalUrl,
                    employeeSlug: normalizedEmployeeSlug || null,
                    updatedAt: serverTimestamp(),
                    updatedBy: currentUser.email || currentUser.uid || 'system'
                }, { merge: true });

                console.log('✅ Careers portal URL stored in hrSettings:', careersPortalUrl);
                console.log('✅ Employee portal URL stored in hrSettings:', employeePortalUrl);
            } catch (settingsError) {
                console.warn('⚠️ Failed to store careers portal link in hrSettings:', settingsError);
            }

            // Step 2: Create leave types for this company
            const leaveTypesRef = collection(db, 'leaveTypes');
            let leaveTypesCreated = 0;

            for (const leaveType of formData.leaveTypes) {
                // Convert days to number, defaulting to 0 if empty string
                const daysValue = typeof leaveType.days === 'string' && leaveType.days === '' 
                    ? 0 
                    : (typeof leaveType.days === 'number' ? leaveType.days : parseInt(String(leaveType.days)) || 0);
                
                if (leaveType.name && daysValue > 0) {
                    await addDoc(leaveTypesRef, {
                        companyId: companyId,
                        name: leaveType.name,
                        maxDays: daysValue,
                        description: `${leaveType.name} - ${daysValue} days per year`,
                        accrualRate: daysValue / 12, // Monthly accrual
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

            // System configuration removed - can be configured later in Settings

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

            // Check if user is already authenticated (currentUser was checked at the start of handleComplete)
            if (currentUser) {
                // User is already authenticated (signed up before onboarding)
                // Show success message and redirect to dashboard
                alert(`🎉 Company Profile Created!\n\n✅ Company profile saved\n✅ ${leaveTypesCreated} leave types created\n✅ ${departmentsCreated} departments configured\n✅ ${hrTeamCreated} HR team members added\n✅ System configuration saved\n\nRedirecting to dashboard...`);
                
                // Redirect to dashboard
                navigate('/dashboard', { replace: true });
            } else {
                // User is not authenticated, redirect to signup
                alert(`🎉 Company Profile Created!\n\n✅ Company profile saved\n✅ ${leaveTypesCreated} leave types created\n✅ ${departmentsCreated} departments configured\n✅ ${hrTeamCreated} HR team members added\n✅ System configuration saved\n\nNext: Create your HR administrator account`);
                
                // Navigate to signup page to create HR user
                navigate('/signup');
            }

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
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
            <div className="w-full max-w-4xl">
                {/* Skip Button - Only show if company exists */}
                {companyId && (
                    <div className="mb-4 flex justify-end">
                        <Button
                            variant="outline"
                            onClick={handleSkipOnboarding}
                            disabled={skipLoading}
                            className="text-sm"
                        >
                            {skipLoading ? (
                                <>
                                    <span className="animate-spin mr-2">⏳</span>
                                    Skipping...
                                </>
                            ) : (
                                <>
                                    Skip Onboarding →
                                </>
                            )}
                        </Button>
                    </div>
                )}
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
                        ${!isActive && !isCompleted ? 'bg-muted text-muted-foreground' : ''}
                      `}
                                        >
                                            <Icon className="w-6 h-6" />
                                        </div>
                                        <span className={`text-xs mt-2 font-medium ${isActive ? 'text-primary' : 'text-muted-foreground'}`}>
                                            {step.title}
                                        </span>
                                    </div>
                                    {index < STEPS.length - 1 && (
                                        <div className={`h-1 flex-1 mx-2 rounded ${isCompleted ? 'bg-green-600' : 'bg-muted'}`} />
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
                <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                    Let's get your company set up in just a few minutes. We'll help you configure everything you need to start managing your team effectively.
                </p>
                <div className="grid grid-cols-3 gap-4 mb-8 max-w-2xl mx-auto">
                    <div className="p-4 bg-primary/10 rounded-lg">
                        <Clock className="w-8 h-8 text-primary mx-auto mb-2" />
                        <p className="text-sm font-medium">5 Minutes</p>
                        <p className="text-xs text-muted-foreground">Quick Setup</p>
                    </div>
                    <div className="p-4 bg-purple-50 rounded-lg">
                        <Users className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                        <p className="text-sm font-medium">Easy Config</p>
                        <p className="text-xs text-muted-foreground">No Tech Skills</p>
                    </div>
                    <div className="p-4 bg-green-50 rounded-lg">
                        <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
                        <p className="text-sm font-medium">Ready to Use</p>
                        <p className="text-xs text-muted-foreground">Start Instantly</p>
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
                        <p className="text-xs text-muted-foreground">Used for careers page: /careers/{formData.domain || 'yourdomain'}</p>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <Label htmlFor="industry">Industry *</Label>
                        <select
                            id="industry"
                            className="w-full p-2 border border-input rounded-md bg-background text-foreground"
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
                            className="w-full p-2 border border-input rounded-md bg-background text-foreground"
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

    // Auto-detect timezone when country or city changes
    const handleCountryChange = (country: string) => {
        const detectedTimezone = detectTimezone(country, formData.city);
        setFormData({ ...formData, country, timezone: detectedTimezone });
    };

    const handleCityChange = (city: string) => {
        const detectedTimezone = detectTimezone(formData.country, city);
        setFormData({ ...formData, city, timezone: detectedTimezone });
    };

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
                            onChange={(e) => handleCityChange(e.target.value)}
                        />
                        <p className="text-xs text-muted-foreground">Timezone will auto-detect based on your location</p>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="country">Country *</Label>
                        <Input
                            id="country"
                            placeholder="United States"
                            value={formData.country}
                            onChange={(e) => handleCountryChange(e.target.value)}
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="timezone">Timezone *</Label>
                    <div className="flex gap-2 items-center">
                        <select
                            id="timezone"
                            className="flex-1 p-2 border border-input rounded-md bg-background text-foreground"
                            value={formData.timezone}
                            onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
                        >
                            {TIMEZONES.map((tz) => (
                                <option key={tz} value={tz}>{tz}</option>
                            ))}
                        </select>
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                                const detected = detectTimezone(formData.country, formData.city);
                                setFormData({ ...formData, timezone: detected });
                            }}
                            title="Auto-detect timezone from location"
                        >
                            <Globe className="w-4 h-4" />
                        </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                        {formData.country || formData.city 
                            ? `Detected from ${formData.city ? formData.city : ''}${formData.city && formData.country ? ', ' : ''}${formData.country || ''}`
                            : 'Enter your city or country to auto-detect timezone'}
                    </p>
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
    const { theme } = useTheme();
    
    // Apply colors in real-time as user changes them
    const handleColorChange = (primary: string, secondary: string) => {
        const isDark = theme === 'dark';
        applyBrandingColors(primary, secondary, isDark);
    };
    
    // Calculate text color for contrast (white or black based on background brightness)
    const getContrastColor = (hex: string): string => {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        const brightness = (r * 299 + g * 587 + b * 114) / 1000;
        return brightness > 128 ? '#000000' : '#FFFFFF';
    };
    
    return (
        <Card className="border-2 shadow-xl">
            <CardHeader className="border-b bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950">
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
                                onChange={(e) => {
                                    const newColor = e.target.value.trim();
                                    setFormData({ ...formData, primaryColor: newColor });
                                    handleColorChange(newColor, formData.secondaryColor);
                                }}
                                className="w-20 h-12 cursor-pointer"
                            />
                            <Input
                                value={formData.primaryColor}
                                onChange={(e) => {
                                    const newColor = e.target.value.trim();
                                    setFormData({ ...formData, primaryColor: newColor });
                                    if (/^#[0-9A-F]{6}$/i.test(newColor)) {
                                        handleColorChange(newColor, formData.secondaryColor);
                                    }
                                }}
                                placeholder="#3B82F6"
                                className="font-mono"
                            />
                        </div>
                        <p className="text-xs text-muted-foreground">Main brand color for buttons and accents</p>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="secondaryColor">Secondary Color</Label>
                        <div className="flex gap-2">
                            <Input
                                id="secondaryColor"
                                type="color"
                                value={formData.secondaryColor.trim()}
                                onChange={(e) => {
                                    const newColor = e.target.value.trim();
                                    setFormData({ ...formData, secondaryColor: newColor });
                                    handleColorChange(formData.primaryColor, newColor);
                                }}
                                className="w-20 h-12 cursor-pointer"
                            />
                            <Input
                                value={formData.secondaryColor}
                                onChange={(e) => {
                                    const newColor = e.target.value.trim();
                                    setFormData({ ...formData, secondaryColor: newColor });
                                    if (/^#[0-9A-F]{6}$/i.test(newColor)) {
                                        handleColorChange(formData.primaryColor, newColor);
                                    }
                                }}
                                placeholder="#8B5CF6"
                                className="font-mono"
                            />
                        </div>
                        <p className="text-xs text-muted-foreground">Secondary brand color for highlights</p>
                    </div>
                </div>

                <div className="p-6 border-2 rounded-lg bg-muted/30 dark:bg-muted/20" style={{ borderColor: formData.primaryColor }}>
                    <h3 className="text-lg font-bold mb-2" style={{ color: formData.primaryColor }}>Live Preview</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                        This is how your brand colors will appear across the platform in {theme} mode.
                    </p>
                    <div className="flex gap-2 flex-wrap">
                        <button
                            className="px-4 py-2 rounded-md font-medium transition-all hover:opacity-90"
                            style={{ 
                                backgroundColor: formData.primaryColor, 
                                color: getContrastColor(formData.primaryColor)
                            }}
                        >
                            Primary Button
                        </button>
                        <button
                            className="px-4 py-2 rounded-md font-medium transition-all hover:opacity-90"
                            style={{ 
                                backgroundColor: formData.secondaryColor, 
                                color: getContrastColor(formData.secondaryColor)
                            }}
                        >
                            Secondary Button
                        </button>
                        <button
                            className="px-4 py-2 rounded-md border-2 font-medium transition-all hover:bg-muted"
                            style={{ 
                                borderColor: formData.primaryColor,
                                color: formData.primaryColor
                            }}
                        >
                            Outlined Button
                        </button>
                    </div>
                    <div className="mt-4 p-3 rounded bg-card border" style={{ borderColor: formData.secondaryColor + '40' }}>
                        <p className="text-sm" style={{ color: formData.secondaryColor }}>
                            Sample text using secondary color
                        </p>
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
        // For days field, allow empty string and 0
        if (field === 'days') {
            // Allow empty string to be stored as empty string
            if (typeof value === 'string' && value === '') {
                newTypes[index] = { ...newTypes[index], [field]: '' };
            } else {
                const numValue = typeof value === 'string' ? parseInt(value) : value;
                newTypes[index] = { ...newTypes[index], [field]: isNaN(numValue) ? '' : numValue };
            }
        } else {
            newTypes[index] = { ...newTypes[index], [field]: value };
        }
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
                                value={type.days ?? ''}
                                onChange={(e) => {
                                    const val = e.target.value;
                                    // Allow empty string or valid number (including 0)
                                    if (val === '') {
                                        updateLeaveType(index, 'days', '');
                                    } else {
                                        const num = parseInt(val);
                                        if (!isNaN(num)) {
                                            updateLeaveType(index, 'days', num);
                                        }
                                    }
                                }}
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
                                        className="w-full p-2 border border-input rounded-md bg-background text-foreground"
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
                                        className="w-full p-2 border border-input rounded-md bg-background text-foreground"
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

                {/* Employee Experience */}
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                        <Users className="w-5 h-5 text-purple-600" />
                        Employee Experience
                    </h3>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="supportEmail">HR Support Email</Label>
                            <Input
                                id="supportEmail"
                                type="email"
                                placeholder="support@company.com"
                                value={formData.supportEmail}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        supportEmail: e.target.value,
                                    })
                                }
                            />
                            <p className="text-xs text-muted-foreground">
                                This email address shows up on the employee login page and help screens.
                            </p>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="profileThreshold">Minimum Profile Completion (%)</Label>
                            <Input
                                id="profileThreshold"
                                type="number"
                                min={0}
                                max={100}
                                value={formData.profileCompletionThreshold}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        profileCompletionThreshold: Math.max(
                                            0,
                                            Math.min(100, parseInt(e.target.value || '0', 10))
                                        ),
                                    })
                                }
                            />
                            <p className="text-xs text-muted-foreground">
                                Employees must reach at least this percentage before accessing other modules (default 75%).
                            </p>
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
                                className="w-full p-2 border border-input rounded-md bg-background text-foreground"
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
                        <div className="space-y-1 text-sm bg-card p-3 rounded border border-border">
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
                                <span className="text-gray-600">Support Email:</span>
                                <span className="font-medium">{formData.supportEmail || formData.email}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Timezone:</span>
                                <span className="font-medium">{formData.timezone}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Profile Threshold:</span>
                                <span className="font-medium">{formData.profileCompletionThreshold || 75}%</span>
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
                                <div key={i} className="bg-card border border-border px-3 py-2 rounded text-xs flex justify-between items-center text-foreground">
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
