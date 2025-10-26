import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Progress } from '../../components/ui/progress';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { Badge } from '../../components/ui/badge';
import {
    CheckCircle,
    Clock,
    AlertCircle,
    ArrowRight,
    ArrowLeft,
    User,
    FileText,
    Upload,
    Phone,
    CreditCard,
    Mail,
    Shield,
    BookOpen,
    PartyPopper,
    Play,
    Laptop,
    Users,
    Camera,
    GraduationCap,
    Briefcase
} from 'lucide-react';
import {
    onboardingService,
    OnboardingStep,
    OnboardingProgress
} from './services/onboardingService';
import WelcomeVideo from './WelcomeVideo';
import ContractReview from './ContractReview';
import ContractUpload from './ContractUpload';
import PersonalInfoForm from './PersonalInfoForm';
import PersonalInfoExtended from './PersonalInfoExtended';
import EmergencyContactsForm from './EmergencyContactsForm';
import BankingInfoForm from './BankingInfoForm';
import DocumentUploadForm from './DocumentUploadForm';
import EquipmentAccess from './EquipmentAccess';
import WorkEmailSetup from './WorkEmailSetup';
import TeamIntroduction from './TeamIntroduction';
import PolicyAcknowledgment from './PolicyAcknowledgment';
import SystemTraining from './SystemTraining';
import OnboardingCompletion from './OnboardingCompletion';
import { useAuth } from '../../context/AuthContext';
import { useCompany } from '../../context/CompanyContext';

const OnboardingWizard: React.FC = () => {
    const { currentEmployee } = useAuth();
    const { company } = useCompany();
    const employeeId = currentEmployee?.employeeId || '';
    const navigate = useNavigate();
    const [progress, setProgress] = useState<OnboardingProgress | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [isCompleting, setIsCompleting] = useState(false);

    const onboardingSteps: Record<OnboardingStep, {
        title: string;
        description: string;
        icon: React.ComponentType<any>;
        component: React.ComponentType<any>;
    }> = {
        welcome_video: {
            title: 'Welcome Video',
            description: 'Watch our company introduction',
            icon: Play,
            component: WelcomeVideo
        },
        contract_review: {
            title: 'Review Your Contract',
            description: 'Review your employment contract terms',
            icon: FileText,
            component: ContractReview
        },
        contract_upload: {
            title: 'Upload Signed Contract',
            description: 'Upload your signed employment contract',
            icon: Upload,
            component: ContractUpload
        },
        personal_info: {
            title: 'Personal Information',
            description: 'Provide your personal details',
            icon: User,
            component: PersonalInfoForm
        },
        personal_info_extended: {
            title: 'Extended Profile',
            description: 'Complete your professional profile',
            icon: Camera,
            component: PersonalInfoExtended
        },
        emergency_contacts: {
            title: 'Emergency Contacts',
            description: 'Add emergency contact information',
            icon: Phone,
            component: EmergencyContactsForm
        },
        banking_info: {
            title: 'Banking Information',
            description: 'Set up direct deposit information',
            icon: CreditCard,
            component: BankingInfoForm
        },
        document_upload: {
            title: 'Document Upload',
            description: 'Upload required documents',
            icon: Upload,
            component: DocumentUploadForm
        },
        equipment_access: {
            title: 'Equipment & Access',
            description: 'Set up your workspace and access',
            icon: Laptop,
            component: EquipmentAccess
        },
        work_email_setup: {
            title: 'Work Email Setup',
            description: 'Your company email address',
            icon: Mail,
            component: WorkEmailSetup
        },
        team_introduction: {
            title: 'Meet Your Team',
            description: 'Get to know your colleagues and schedule',
            icon: Users,
            component: TeamIntroduction
        },
        policy_acknowledgment: {
            title: 'Company Policies',
            description: 'Review and acknowledge company policies',
            icon: Shield,
            component: PolicyAcknowledgment
        },
        system_training: {
            title: 'System Overview',
            description: 'Learn about the employee portal',
            icon: BookOpen,
            component: SystemTraining
        },
        completion: {
            title: 'Welcome Aboard!',
            description: 'Onboarding complete',
            icon: PartyPopper,
            component: OnboardingCompletion
        }
    };

    useEffect(() => {
        loadProgress();
    }, [employeeId]);

    const createDefaultContract = async (employeeId: string) => {
        try {
            console.log('📄 [Onboarding] Creating default contract for:', employeeId);

            // Import contract service
            const { contractService } = await import('./services/contractService');

            // Check if contract already exists
            const existingContract = await contractService.getEmployeeContract(employeeId);
            if (existingContract) {
                console.log('✅ [Onboarding] Contract already exists');
                return;
            }

            // Create default contract
            const defaultContract = {
                id: employeeId,
                employeeId: employeeId,
                position: 'Software Developer', // Default position
                department: 'Engineering',
                effectiveDate: new Date(),
                terms: {
                    salary: 500000, // Default salary in NGN
                    currency: 'NGN',
                    benefits: [
                        'Health Insurance',
                        'Annual Leave (21 days)',
                        'Sick Leave (10 days)',
                        'Maternity/Paternity Leave',
                        'Professional Development',
                        'Remote Work Allowance'
                    ],
                    workingHours: '40 hours per week, Monday to Friday',
                    probationPeriod: 3
                },
                documentUrl: '', // Will be populated when HR uploads actual contract
                status: 'pending_review' as const,
                createdAt: new Date(),
                updatedAt: new Date()
            };

            await contractService.createContract(defaultContract);
            console.log('✅ [Onboarding] Default contract created');

        } catch (error) {
            console.error('❌ [Onboarding] Error creating default contract:', error);
        }
    };

    const loadProgress = async () => {
        try {
            let onboardingProgress = await onboardingService.getOnboardingProgress(employeeId);

            if (!onboardingProgress) {
                // Initialize onboarding progress if none exists
                onboardingProgress = {
                    employeeId,
                    currentStep: 'contract_review' as OnboardingStep, // Start with contract review
                    completedSteps: [],
                    workEmail: '',
                    contractReviewed: false,
                    contractUploaded: false,
                    personalInfoCompleted: false,
                    emergencyContactsCompleted: false,
                    bankingInfoCompleted: false,
                    documentsUploaded: false,
                    workEmailSetup: false,
                    policiesAcknowledged: false,
                    systemTrainingCompleted: false
                };

                // Save the initial progress
                await onboardingService.saveOnboardingProgress(onboardingProgress);

                // Create default contract if none exists
                await createDefaultContract(employeeId);
            }

            setProgress(onboardingProgress);
        } catch (error) {
            console.error('Error loading onboarding progress:', error);
            setError('Unable to load onboarding progress');
        } finally {
            setIsLoading(false);
        }
    };

    const completeStep = async (stepData: any) => {
        if (!progress) return;

        try {
            const success = await onboardingService.completeOnboardingStep(
                employeeId,
                progress.currentStep,
                stepData
            );

            if (success) {
                // Special handling for personal info -> work email generation
                if (progress.currentStep === 'personal_info' && stepData.firstName && stepData.lastName) {
                    const workEmail = await onboardingService.generateWorkEmail(stepData);
                    // Update progress state with generated work email
                    setProgress(prev => prev ? { ...prev, workEmail } : null);
                }

                const nextStep = onboardingService.getNextOnboardingStep(progress.currentStep);
                if (nextStep) {
                    setProgress(prev => prev ? {
                        ...prev,
                        currentStep: nextStep,
                        completedSteps: [...prev.completedSteps, prev.currentStep]
                    } : null);
                } else {
                    await completeOnboarding();
                }
            } else {
                setError('Failed to complete step. Please try again.');
            }
        } catch (error) {
            setError('Failed to complete step');
        }
    };

    const completeOnboarding = async () => {
        if (!progress || !employeeId) return;

        setIsCompleting(true);
        try {
            console.log('🎉 [Onboarding] Completing onboarding for:', employeeId);

            // Mark onboarding as complete in Firebase
            const { doc, updateDoc } = await import('firebase/firestore');
            const { db } = await import('../../config/firebase');

            await updateDoc(doc(db, 'employees', employeeId), {
                'onboarding.status': 'completed',
                'onboarding.completedAt': new Date(),
                'onboarding.currentStep': Object.keys(onboardingSteps).length,
                'profileStatus.completeness': 100 // Mark profile as complete
            });

            console.log('✅ [Onboarding] Onboarding marked as complete!');

            // Update current employee in auth context
            if (currentEmployee) {
                currentEmployee.onboardingStatus = 'completed';
                currentEmployee.profileCompleteness = 100;
            }

            // Redirect to main dashboard
            navigate('/dashboard');
        } catch (error) {
            console.error('❌ [Onboarding] Error completing onboarding:', error);
            setError('Failed to complete onboarding. Please try again.');
        } finally {
            setIsCompleting(false);
        }
    };

    const getProgressPercentage = (): number => {
        if (!progress) return 0;
        const totalSteps = Object.keys(onboardingSteps).length;
        const completedSteps = progress.completedSteps.length;
        return Math.round((completedSteps / totalSteps) * 100);
    };

    const getStepStatus = (step: OnboardingStep): 'completed' | 'current' | 'pending' => {
        if (!progress) return 'pending';

        if (progress.completedSteps.includes(step)) {
            return 'completed';
        } else if (step === progress.currentStep) {
            return 'current';
        } else {
            return 'pending';
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <Clock className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
                    <p>Loading onboarding...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Alert variant="destructive" className="max-w-md">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            </div>
        );
    }

    if (!progress) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Alert variant="destructive" className="max-w-md">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>No onboarding progress found</AlertDescription>
                </Alert>
            </div>
        );
    }

    const currentStepConfig = onboardingSteps[progress.currentStep];
    const CurrentStepComponent = currentStepConfig.component;
    const progressPercentage = getProgressPercentage();

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
            <div className="container mx-auto px-4 py-8">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        Welcome to {company?.displayName || 'Our Company'}!
                    </h1>
                    <p className="text-gray-600">
                        Let's get you set up. This will only take a few minutes.
                    </p>
                </div>

                {/* Progress Bar */}
                <div className="max-w-2xl mx-auto mb-8">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">
                            Progress: {progressPercentage}%
                        </span>
                        <span className="text-sm text-gray-500">
                            Step {progress.completedSteps.length + 1} of {Object.keys(onboardingSteps).length}
                        </span>
                    </div>
                    <Progress value={progressPercentage} className="h-2" />
                </div>

                {/* Step Navigation */}
                <div className="max-w-4xl mx-auto mb-8">
                    <div className="flex flex-wrap justify-center gap-2">
                        {Object.entries(onboardingSteps).map(([step, config]) => {
                            const status = getStepStatus(step as OnboardingStep);
                            const Icon = config.icon;

                            return (
                                <div
                                    key={step}
                                    className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm ${status === 'completed'
                                        ? 'bg-green-100 text-green-800'
                                        : status === 'current'
                                            ? 'bg-blue-100 text-blue-800'
                                            : 'bg-gray-100 text-gray-500'
                                        }`}
                                >
                                    {status === 'completed' ? (
                                        <CheckCircle className="w-4 h-4" />
                                    ) : (
                                        <Icon className="w-4 h-4" />
                                    )}
                                    <span>{config.title}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Current Step */}
                <div className="max-w-4xl mx-auto">
                    <Card>
                        <CardHeader>
                            <div className="flex items-center space-x-3">
                                <div className={`p-2 rounded-lg ${progress.currentStep === 'completion'
                                    ? 'bg-green-100'
                                    : 'bg-blue-100'
                                    }`}>
                                    <currentStepConfig.icon className={`w-6 h-6 ${progress.currentStep === 'completion'
                                        ? 'text-green-600'
                                        : 'text-blue-600'
                                        }`} />
                                </div>
                                <div>
                                    <CardTitle>{currentStepConfig.title}</CardTitle>
                                    <CardDescription>{currentStepConfig.description}</CardDescription>
                                </div>
                            </div>
                        </CardHeader>

                        <CardContent>
                            <CurrentStepComponent
                                employeeId={employeeId}
                                onComplete={completeStep}
                                onError={setError}
                            />
                        </CardContent>
                    </Card>
                </div>

                {/* Error Display */}
                {error && (
                    <div className="max-w-4xl mx-auto mt-4">
                        <Alert variant="destructive">
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    </div>
                )}
            </div>
        </div>
    );
};

export default OnboardingWizard;
