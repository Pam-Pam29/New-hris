import {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    sendPasswordResetEmail,
    updatePassword,
    signOut,
    User
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../../../config/firebase';

export interface AuthResult {
    success: boolean;
    user?: User;
    error?: string;
    employeeId?: string;
}

export interface EmployeeAuthData {
    employeeId: string;
    workEmail?: string;
    personalEmail: string;
    authStatus: 'setup_required' | 'onboarding' | 'active' | 'suspended';
    setupToken?: string;
    setupExpiry?: Date;
    onboardingComplete: boolean;
}

export interface LoginCredentials {
    identifier: string; // work email or employee ID
    password: string;
    loginMethod: 'work_email' | 'employee_id';
}

class AuthService {
    // Step 1: Job Offer Acceptance (HR Dashboard action)
    async sendJobOffer(candidateData: any): Promise<{ success: boolean; employeeId: string; setupLink: string }> {
        try {
            const employeeId = this.generateEmployeeId();
            const setupToken = this.generateSecureToken();
            const setupExpiry = new Date();
            setupExpiry.setDate(setupExpiry.getDate() + 7); // 7-day expiry

            const setupLink = `${window.location.origin}/employee/setup?id=${employeeId}&token=${setupToken}`;

            // Store pending employee record
            await setDoc(doc(db, 'pendingEmployees', employeeId), {
                employeeId,
                personalEmail: candidateData.email,
                setupToken,
                setupExpiry,
                authStatus: 'setup_required',
                candidateData,
                createdAt: serverTimestamp()
            });

            // Send acceptance email (implement email service)
            await this.sendEmail({
                to: candidateData.email,
                subject: 'Welcome to [Company] - Complete Your Setup',
                template: 'job_offer_acceptance',
                data: { setupLink, employeeId, expiryDate: setupExpiry }
            });

            return { success: true, employeeId, setupLink };
        } catch (error) {
            console.error('Error sending job offer:', error);
            return { success: false, employeeId: '', setupLink: '' };
        }
    }

    // Step 2: Initial Password Setup
    async setupInitialPassword(employeeId: string, token: string, password: string): Promise<AuthResult> {
        try {
            // Verify token and get pending employee data
            const pendingEmployeeRef = doc(db, 'pendingEmployees', employeeId);
            const pendingEmployeeDoc = await getDoc(pendingEmployeeRef);

            if (!pendingEmployeeDoc.exists()) {
                return { success: false, error: 'Invalid employee ID' };
            }

            const pendingData = pendingEmployeeDoc.data();

            // Check token validity
            if (pendingData.setupToken !== token) {
                return { success: false, error: 'Invalid setup token' };
            }

            // Check expiry
            if (new Date() > pendingData.setupExpiry.toDate()) {
                return { success: false, error: 'Setup link has expired' };
            }

            // Create Firebase Auth user with personal email
            const userCredential = await createUserWithEmailAndPassword(
                auth,
                pendingData.personalEmail,
                password
            );

            // Create employee record
            await setDoc(doc(db, 'employees', employeeId), {
                employeeId,
                personalEmail: pendingData.personalEmail,
                authStatus: 'onboarding',
                onboardingComplete: false,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp()
            });

            // Update auth status
            await updateDoc(pendingEmployeeRef, {
                authStatus: 'onboarding',
                setupToken: null,
                setupExpiry: null
            });

            return {
                success: true,
                user: userCredential.user,
                employeeId
            };
        } catch (error: any) {
            console.error('Error setting up initial password:', error);
            return { success: false, error: error.message };
        }
    }

    // Step 3: Login with Employee ID (during onboarding)
    async loginWithEmployeeId(employeeId: string, password: string): Promise<AuthResult> {
        try {
            // Get employee document to find their temporary email
            const employeeRef = doc(db, 'employees', employeeId);
            const employeeDoc = await getDoc(employeeRef);

            if (!employeeDoc.exists()) {
                return { success: false, error: 'Employee not found' };
            }

            const employeeData = employeeDoc.data();
            const tempEmail = employeeData.tempEmail;

            if (!tempEmail) {
                return { success: false, error: 'Temporary email not found. Please contact HR.' };
            }

            // Sign in with temporary email
            const userCredential = await signInWithEmailAndPassword(auth, tempEmail, password);

            return {
                success: true,
                employeeId,
                user: userCredential.user
            };
        } catch (error: any) {
            console.error('Error logging in with employee ID:', error);
            return { success: false, error: error.message };
        }
    }

    // Step 4: Login with Work Email (after onboarding)
    async loginWithWorkEmail(workEmail: string, password: string): Promise<AuthResult> {
        try {
            // Sign in with work email
            const userCredential = await signInWithEmailAndPassword(auth, workEmail, password);

            // Get employee ID from user document
            const userRef = doc(db, 'users', userCredential.user.uid);
            const userDoc = await getDoc(userRef);

            if (!userDoc.exists()) {
                return { success: false, error: 'User profile not found' };
            }

            const userData = userDoc.data();
            const employeeId = userData.employeeId;

            return {
                success: true,
                employeeId,
                user: userCredential.user
            };
        } catch (error: any) {
            console.error('Error logging in with work email:', error);
            return { success: false, error: error.message };
        }
    }

    // Step 5: Transition to Work Email (after onboarding completion)
    async transitionToWorkEmail(employeeId: string, workEmail: string): Promise<AuthResult> {
        try {
            const currentUser = auth.currentUser;
            if (!currentUser) {
                return { success: false, error: 'No authenticated user' };
            }

            // Update employee record with work email
            const employeeRef = doc(db, 'employees', employeeId);
            await updateDoc(employeeRef, {
                workEmail,
                authStatus: 'active',
                onboardingComplete: true,
                updatedAt: serverTimestamp()
            });

            // Create work email auth account
            await createUserWithEmailAndPassword(auth, workEmail, 'temp_password');

            return { success: true };
        } catch (error: any) {
            console.error('Error transitioning to work email:', error);
            return { success: false, error: error.message };
        }
    }

    // Check onboarding status
    async checkOnboardingStatus(employeeId: string): Promise<{ isComplete: boolean; currentStep?: string }> {
        try {
            const employeeRef = doc(db, 'employees', employeeId);
            const employeeDoc = await getDoc(employeeRef);

            if (!employeeDoc.exists()) {
                return { isComplete: false };
            }

            const employeeData = employeeDoc.data();
            const onboardingProgress = employeeData.onboardingProgress;

            if (onboardingProgress?.isComplete) {
                return { isComplete: true };
            }

            return {
                isComplete: false,
                currentStep: onboardingProgress?.currentStep || 'contract_review'
            };
        } catch (error) {
            console.error('Error checking onboarding status:', error);
            return { isComplete: false };
        }
    }

    // Mark onboarding complete
    async markOnboardingComplete(employeeId: string): Promise<boolean> {
        try {
            const employeeRef = doc(db, 'employees', employeeId);
            await updateDoc(employeeRef, {
                onboardingComplete: true,
                authStatus: 'active',
                updatedAt: serverTimestamp()
            });
            return true;
        } catch (error) {
            console.error('Error marking onboarding complete:', error);
            return false;
        }
    }

    // Password reset
    async resetPassword(email: string): Promise<boolean> {
        try {
            await sendPasswordResetEmail(auth, email);
            return true;
        } catch (error) {
            console.error('Error resetting password:', error);
            return false;
        }
    }

    // Logout
    async logout(): Promise<void> {
        try {
            await signOut(auth);
        } catch (error) {
            console.error('Error logging out:', error);
        }
    }

    // Helper methods
    private generateEmployeeId(): string {
        const prefix = 'EMP';
        const timestamp = Date.now().toString().slice(-6);
        const random = Math.random().toString(36).substring(2, 5).toUpperCase();
        return `${prefix}${timestamp}${random}`;
    }

    private generateSecureToken(): string {
        return Math.random().toString(36).substring(2) + Date.now().toString(36);
    }

    private async getEmployeeIdFromWorkEmail(workEmail: string): Promise<string> {
        // Query employees collection to find employee by work email
        // This would need to be implemented with a proper query
        return 'EMP123456ABC'; // Placeholder
    }

    private async sendEmail(emailData: any): Promise<void> {
        // Implement email service integration
        console.log('Sending email:', emailData);
    }
}

export const authService = new AuthService();
