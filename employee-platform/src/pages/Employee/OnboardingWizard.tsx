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
    FileText,
    Upload,
    BookOpen,
    PartyPopper,
    Play
} from 'lucide-react';
import {
    onboardingService,
    OnboardingStep,
    OnboardingProgress
} from './services/onboardingService';
import WelcomeVideo from './WelcomeVideo';
import ContractReview from './ContractReview';
import ContractUpload from './ContractUpload';
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

            // Import contract service and Firestore
            const { contractService } = await import('./services/contractService');
            const { doc, getDoc } = await import('firebase/firestore');
            const { db } = await import('../../config/firebase');

            // Check if contract already exists
            const existingContract = await contractService.getEmployeeContract(employeeId);
            
            // If contract exists but has default/wrong data, we'll update it below
            // Only skip if contract exists AND has correct data (not default values)
            if (existingContract && 
                existingContract.position !== 'Software Developer' && 
                existingContract.department !== 'Engineering' &&
                existingContract.terms.salary !== 500000) {
                console.log('✅ [Onboarding] Contract already exists with correct data');
                return;
            }
            
            if (existingContract) {
                console.log('⚠️ [Onboarding] Contract exists but has default/wrong data. Will update with correct employee data.');
            }

            // Fetch actual employee data to use in contract
            const employeeRef = doc(db, 'employees', employeeId);
            const employeeDoc = await getDoc(employeeRef);
            
            let position = 'Employee';
            let department = 'General';
            let salary = 0;
            let currency = 'NGN';
            let hireDate = new Date();
            let workingHours = '40 hours per week, Monday to Friday';
            let probationPeriod = 3;

            if (employeeDoc.exists()) {
                const employeeData = employeeDoc.data();
                
                // Get position from workInfo or role
                position = employeeData.workInfo?.position || 
                          employeeData.role || 
                          employeeData.position || 
                          'Employee';
                
                // Get department from workInfo or department field
                department = employeeData.workInfo?.department || 
                            employeeData.department || 
                            'General';
                
                // Get salary from workInfo.salary
                if (employeeData.workInfo?.salary) {
                    salary = employeeData.workInfo.salary.baseSalary || 
                            employeeData.workInfo.salary || 
                            0;
                    currency = employeeData.workInfo.salary.currency || 'NGN';
                }
                
                // Get hire date
                if (employeeData.workInfo?.hireDate) {
                    hireDate = employeeData.workInfo.hireDate.toDate 
                        ? employeeData.workInfo.hireDate.toDate() 
                        : new Date(employeeData.workInfo.hireDate);
                } else if (employeeData.dateStarted) {
                    hireDate = new Date(employeeData.dateStarted);
                }
                
                // Get working hours and schedule
                if (employeeData.workInfo?.workSchedule) {
                    workingHours = employeeData.workInfo.workSchedule;
                }
            }

            // Create contract with actual employee data
            if (!companyId) {
                console.error('❌ [Onboarding] Company ID is required for contract creation');
                return;
            }

            const defaultContract = {
                id: employeeId,
                employeeId: employeeId,
                companyId: companyId, // Ensure companyId is included
                position: position,
                department: department,
                effectiveDate: hireDate,
                terms: {
                    salary: salary || 0,
                    currency: currency,
                    benefits: [
                        'Health Insurance',
                        'Annual Leave (21 days)',
                        'Sick Leave (10 days)',
                        'Maternity/Paternity Leave',
                        'Professional Development',
                        'Remote Work Allowance'
                    ],
                    workingHours: workingHours,
                    probationPeriod: probationPeriod
                },
                documentUrl: '', // Will be populated when HR uploads actual contract
                status: 'draft' as const,
                createdAt: new Date(),
                updatedAt: new Date()
            };

            // If contract exists with wrong data, update it; otherwise create new
            if (existingContract) {
                const { updateDoc, serverTimestamp } = await import('firebase/firestore');
                const { doc: docFn } = await import('firebase/firestore');
                const contractRef = docFn(db, 'contracts', employeeId);
                await updateDoc(contractRef, {
                    position: position,
                    department: department,
                    effectiveDate: hireDate,
                    'terms.salary': salary || 0,
                    'terms.currency': currency,
                    'terms.workingHours': workingHours,
                    status: 'draft',
                    updatedAt: serverTimestamp()
                });
                console.log('✅ [Onboarding] Contract updated with correct employee data:', {
                    position,
                    department,
                    salary,
                    currency
                });
            } else {
                await contractService.createContract(defaultContract);
                console.log('✅ [Onboarding] Default contract created with employee data:', {
                    position,
                    department,
                    salary,
                    currency
                });
            }

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
                    currentStep: 'welcome_video' as OnboardingStep,
                    completedSteps: [],
                    welcomeVideoWatched: false,
                    contractReviewed: false,
                    contractUploaded: false,
                    systemTrainingCompleted: false
                };

                // Save the initial progress
                await onboardingService.saveOnboardingProgress(onboardingProgress);

                // Create default contract if none exists
                await createDefaultContract(employeeId);
            }

            const availableSteps = Object.keys(onboardingSteps) as OnboardingStep[];
            onboardingProgress.completedSteps = (onboardingProgress.completedSteps || []).filter(step =>
                availableSteps.includes(step)
            );

            if (!availableSteps.includes(onboardingProgress.currentStep)) {
                const nextUncompleted = availableSteps.find(step => !onboardingProgress!.completedSteps.includes(step));
                onboardingProgress.currentStep = nextUncompleted || availableSteps[availableSteps.length - 1];
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
