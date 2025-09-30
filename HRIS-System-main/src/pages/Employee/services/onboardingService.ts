import { doc, getDoc, setDoc, updateDoc, serverTimestamp, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../../config/firebase';

export type OnboardingStep =
    | 'contract_review'
    | 'contract_upload'
    | 'personal_info'
    | 'emergency_contacts'
    | 'banking_info'
    | 'document_upload'
    | 'work_email_setup'
    | 'policy_acknowledgment'
    | 'system_training'
    | 'completion';

export interface OnboardingProgress {
    employeeId: string;
    currentStep: OnboardingStep;
    completedSteps: OnboardingStep[];
    workEmail?: string;
    personalInfo?: any;
    emergencyContacts?: any;
    bankingInfo?: any;
    documents?: any[];
    policiesAcknowledged?: string[];
    trainingCompleted?: boolean;
    isComplete: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export interface PersonalInfo {
    firstName: string;
    lastName: string;
    middleName?: string;
    dateOfBirth: Date;
    gender: string;
    maritalStatus: string;
    nationality: string;
    phoneNumber: string;
    personalEmail: string;
    address: {
        street: string;
        city: string;
        state: string;
        zipCode: string;
        country: string;
    };
}

export interface EmergencyContact {
    name: string;
    relationship: string;
    phoneNumber: string;
    email?: string;
    address: string;
    isPrimary: boolean;
}

export interface BankingInfo {
    bankName: string;
    accountNumber: string;
    routingNumber: string;
    accountType: 'checking' | 'savings';
    accountHolderName: string;
    isPrimary: boolean;
}

class OnboardingService {
    // Get onboarding progress
    async getOnboardingProgress(employeeId: string): Promise<OnboardingProgress | null> {
        try {
            const onboardingRef = doc(db, 'onboarding', employeeId);
            const onboardingDoc = await getDoc(onboardingRef);

            if (!onboardingDoc.exists()) {
                // Create initial onboarding progress
                const initialProgress: OnboardingProgress = {
                    employeeId,
                    currentStep: 'contract_review',
                    completedSteps: [],
                    isComplete: false,
                    createdAt: new Date(),
                    updatedAt: new Date()
                };

                await setDoc(onboardingRef, initialProgress);
                return initialProgress;
            }

            const data = onboardingDoc.data();
            return {
                ...data,
                createdAt: data.createdAt?.toDate() || new Date(),
                updatedAt: data.updatedAt?.toDate() || new Date()
            } as OnboardingProgress;
        } catch (error) {
            console.error('Error getting onboarding progress:', error);
            return null;
        }
    }

    // Complete onboarding step
    async completeOnboardingStep(
        employeeId: string,
        step: OnboardingStep,
        stepData: any
    ): Promise<boolean> {
        try {
            const onboardingRef = doc(db, 'onboarding', employeeId);
            const onboardingDoc = await getDoc(onboardingRef);

            if (!onboardingDoc.exists()) {
                return false;
            }

            const currentData = onboardingDoc.data();
            const completedSteps = [...(currentData.completedSteps || [])];

            if (!completedSteps.includes(step)) {
                completedSteps.push(step);
            }

            // Update step data
            const stepDataField = `${step}Data`;
            const updateData: any = {
                completedSteps,
                updatedAt: serverTimestamp(),
                [stepDataField]: stepData
            };

            // Get next step
            const nextStep = this.getNextOnboardingStep(step);
            if (nextStep) {
                updateData.currentStep = nextStep;
            } else {
                updateData.isComplete = true;
                updateData.currentStep = 'completion';
            }

            await updateDoc(onboardingRef, updateData);
            return true;
        } catch (error) {
            console.error('Error completing onboarding step:', error);
            return false;
        }
    }

    // Generate work email
    async generateWorkEmail(personalInfo: PersonalInfo): Promise<string> {
        const { firstName, lastName } = personalInfo;

        // Company email naming conventions
        const emailFormats = [
            `${firstName.toLowerCase()}.${lastName.toLowerCase()}@company.com`,
            `${firstName.toLowerCase()}${lastName.toLowerCase()}@company.com`,
            `${firstName.toLowerCase()}.${lastName.toLowerCase()}${Math.floor(Math.random() * 100)}@company.com`
        ];

        // Check availability against existing employees
        for (const email of emailFormats) {
            const employeesRef = collection(db, 'employees');
            const q = query(employeesRef, where('workEmail', '==', email));
            const querySnapshot = await getDocs(q);

            if (querySnapshot.empty) {
                return email;
            }
        }

        // Fallback with random number
        return `${firstName.toLowerCase()}.${lastName.toLowerCase()}${Math.floor(Math.random() * 1000)}@company.com`;
    }

    // Complete onboarding
    async completeOnboarding(employeeId: string): Promise<boolean> {
        try {
            const onboardingRef = doc(db, 'onboarding', employeeId);
            const employeeRef = doc(db, 'employees', employeeId);

            // Mark onboarding as complete
            await updateDoc(onboardingRef, {
                isComplete: true,
                completedAt: serverTimestamp(),
                updatedAt: serverTimestamp()
            });

            // Update employee record
            await updateDoc(employeeRef, {
                onboardingComplete: true,
                status: 'active',
                updatedAt: serverTimestamp()
            });

            return true;
        } catch (error) {
            console.error('Error completing onboarding:', error);
            return false;
        }
    }

    // Send welcome package
    async sendWelcomePackage(employeeId: string, workEmail: string): Promise<boolean> {
        try {
            // Get employee data
            const employeeRef = doc(db, 'employees', employeeId);
            const employeeDoc = await getDoc(employeeRef);

            if (!employeeDoc.exists()) {
                return false;
            }

            const employeeData = employeeDoc.data();

            // Send welcome email
            await this.sendEmail({
                to: workEmail,
                subject: 'Welcome to [Company] - Your Onboarding is Complete!',
                template: 'welcome',
                data: {
                    firstName: employeeData.firstName,
                    lastName: employeeData.lastName,
                    employeeId,
                    workEmail,
                    loginUrl: `${window.location.origin}/login`
                }
            });

            return true;
        } catch (error) {
            console.error('Error sending welcome package:', error);
            return false;
        }
    }

    // Get next onboarding step
    getNextOnboardingStep(currentStep: OnboardingStep): OnboardingStep | null {
        const stepOrder: OnboardingStep[] = [
            'contract_review',
            'contract_upload',
            'personal_info',
            'emergency_contacts',
            'banking_info',
            'document_upload',
            'work_email_setup',
            'policy_acknowledgment',
            'system_training',
            'completion'
        ];

        const currentIndex = stepOrder.indexOf(currentStep);
        return currentIndex < stepOrder.length - 1 ? stepOrder[currentIndex + 1] : null;
    }

    // Send email (placeholder for email service integration)
    private async sendEmail(emailData: any): Promise<void> {
        // Implement email service integration
        console.log('Sending email:', emailData);
    }

    // Get required documents for employee
    async getRequiredDocuments(employeeId: string): Promise<string[]> {
        try {
            // Get employee data to determine required documents
            const employeeRef = doc(db, 'employees', employeeId);
            const employeeDoc = await getDoc(employeeRef);

            if (!employeeDoc.exists()) {
                return [];
            }

            const employeeData = employeeDoc.data();
            const position = employeeData.position;
            const location = employeeData.location;

            // Base required documents
            const baseDocuments = [
                'Government-issued ID (Driver\'s License, Passport)',
                'Social Security Card',
                'Educational Certificates',
                'Previous Employment Records',
                'Tax Forms (W-4, I-9)',
                'Emergency Contact Information',
                'Banking Information for Direct Deposit'
            ];

            // Add position-specific documents
            if (position?.toLowerCase().includes('manager') || position?.toLowerCase().includes('director')) {
                baseDocuments.push('Management Certification', 'Leadership Training Records');
            }

            if (position?.toLowerCase().includes('developer') || position?.toLowerCase().includes('engineer')) {
                baseDocuments.push('Technical Certifications', 'Portfolio/Code Samples');
            }

            return baseDocuments;
        } catch (error) {
            console.error('Error getting required documents:', error);
            return [];
        }
    }

    // Get company policies
    async getCompanyPolicies(): Promise<any[]> {
        // In a real implementation, this would fetch from database
        return [
            {
                id: 'policy-001',
                title: 'Code of Conduct',
                description: 'Company code of conduct and ethical guidelines',
                required: true,
                version: '1.2'
            },
            {
                id: 'policy-002',
                title: 'Data Protection Policy',
                description: 'Guidelines for handling company and customer data',
                required: true,
                version: '2.1'
            },
            {
                id: 'policy-003',
                title: 'Remote Work Policy',
                description: 'Guidelines for remote work arrangements',
                required: false,
                version: '1.0'
            }
        ];
    }
}

export const onboardingService = new OnboardingService();
