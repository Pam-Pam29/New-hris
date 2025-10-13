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
    PartyPopper
} from 'lucide-react';
import {
    onboardingService,
    OnboardingStep,
    OnboardingProgress
} from './services/onboardingService';
import { authService } from './services/authService';
import ContractReview from './ContractReview';
import ContractUpload from './ContractUpload';
import PersonalInfoForm from './PersonalInfoForm';
import EmergencyContactsForm from './EmergencyContactsForm';
import BankingInfoForm from './BankingInfoForm';
import DocumentUploadForm from './DocumentUploadForm';
import WorkEmailSetup from './WorkEmailSetup';
import PolicyAcknowledgment from './PolicyAcknowledgment';
import SystemTraining from './SystemTraining';
import OnboardingCompletion from './OnboardingCompletion';

interface OnboardingWizardProps {
    employeeId: string;
}

const OnboardingWizard: React.FC<OnboardingWizardProps> = ({ employeeId }) => {
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
        work_email_setup: {
            title: 'Work Email Setup',
            description: 'Your company email address',
            icon: Mail,
            component: WorkEmailSetup
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

    const loadProgress = async () => {
        try {
            const onboardingProgress = await onboardingService.getOnboardingProgress(employeeId);
            if (onboardingProgress) {
                setProgress(onboardingProgress);
            } else {
                setError('Unable to load onboarding progress');
            }
        } catch (error) {
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
        if (!progress) return;

        setIsCompleting(true);
        try {
            // Transition to work email login
            if (progress.workEmail) {
                await authService.transitionToWorkEmail(employeeId, progress.workEmail);
            }

            // Mark onboarding complete
            await onboardingService.completeOnboarding(employeeId);
            await authService.markOnboardingComplete(employeeId);

            // Send welcome email with work email credentials
            if (progress.workEmail) {
                await onboardingService.sendWelcomePackage(employeeId, progress.workEmail);
            }

            // Redirect to main dashboard
            navigate('/dashboard');
        } catch (error) {
            setError('Failed to complete onboarding');
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
                        Welcome to [Company]!
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
