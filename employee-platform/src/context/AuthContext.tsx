import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { collection, query, where, getDocs, doc, getDoc, updateDoc } from 'firebase/firestore';
import { signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { db, auth } from '../config/firebase';

interface CurrentEmployee {
    id: string;
    employeeId: string;
    email: string;
    companyId: string;
    firstName: string;
    lastName: string;
    role: string;
    department: string;
    onboardingStatus: 'not_started' | 'in_progress' | 'completed';
    profileCompleteness: number;
}

interface AuthContextType {
    isAuthenticated: boolean;
    currentEmployee: CurrentEmployee | null;
    login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
    logout: () => void;
    setCurrentEmployee: (employee: CurrentEmployee | null) => void;
    loading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [currentEmployee, setCurrentEmployee] = useState<CurrentEmployee | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkExistingSession = async () => {
            try {
                const session = localStorage.getItem('employeeSession');

                if (session) {
                    const sessionData = JSON.parse(session);

                    // Check if session expired (24 hours)
                    const expiresAt = new Date(sessionData.expiresAt);
                    if (expiresAt > new Date()) {
                        console.log('✅ [Auth] Found valid session, loading employee:', sessionData.employeeId);

                        // Get company context from URL to verify we're loading the right employee
                        const urlPath = window.location.pathname;
                        const companySlugMatch = urlPath.match(/\/employee\/([^\/]+)/);
                        const companySlug = companySlugMatch ? companySlugMatch[1] : null;
                        
                        // Load employee data
                        const employeeRef = doc(db, 'employees', sessionData.employeeId);
                        const employeeDoc = await getDoc(employeeRef);

                        if (employeeDoc.exists()) {
                            const employeeData = employeeDoc.data();
                            
                            // Verify company context matches
                            if (companySlug) {
                                // Get company ID from slug
                                const companiesRef = collection(db, 'companies');
                                const companyQuery = query(companiesRef, where('slug', '==', companySlug));
                                const companySnapshot = await getDocs(companyQuery);
                                
                                if (!companySnapshot.empty) {
                                    const companyId = companySnapshot.docs[0].id;
                                    
                                    // Check if employee belongs to this company
                                    if (employeeData.companyId !== companyId) {
                                        console.warn(`⚠️ [Auth] Session employee (${sessionData.employeeId}) doesn't match company context (${companySlug}). Clearing session.`);
                                        localStorage.removeItem('employeeSession');
                                        setLoading(false);
                                        return;
                                    }
                                }
                            }
                            
                            // If companyId in session doesn't match employee's companyId, clear session
                            if (sessionData.companyId && employeeData.companyId !== sessionData.companyId) {
                                console.warn(`⚠️ [Auth] Session company mismatch. Clearing session.`);
                                localStorage.removeItem('employeeSession');
                                setLoading(false);
                                return;
                            }
                        }

                        if (employeeDoc.exists()) {
                            const data = employeeDoc.data();
                            setCurrentEmployee({
                                id: employeeDoc.id,
                                employeeId: data.employeeId,
                                email: data.contactInfo?.workEmail || sessionData.email,
                                companyId: data.companyId,
                                firstName: data.personalInfo?.firstName || '',
                                lastName: data.personalInfo?.lastName || '',
                                role: data.workInfo?.position || '',
                                department: data.workInfo?.department || '',
                                onboardingStatus: data.onboardingStatus || data.onboardingProgress?.isComplete ? 'completed' : (data.onboardingProgress?.currentStep ? 'in_progress' : 'not_started'),
                                profileCompleteness: data.profileStatus?.completeness || 0
                            });
                            console.log('✅ [Auth] Employee loaded from session');
                        } else {
                            console.warn('⚠️ [Auth] Employee not found, clearing session');
                            logout();
                        }
                    } else {
                        console.log('⏰ [Auth] Session expired, clearing');
                        logout();
                    }
                } else {
                    console.log('ℹ️ [Auth] No existing session found');
                }
            } catch (error) {
                console.error('❌ [Auth] Error checking session:', error);
                logout();
            } finally {
                setLoading(false);
            }
        };

        checkExistingSession();
    }, []);

    const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
        try {
            console.log('🔐 [Auth] Attempting Firebase Auth login for:', email);

            // Declare variables outside the try-catch block
            let employeeDoc: any;
            let employeeData: any;

            // Try Firebase Authentication first
            try {
                const userCredential = await signInWithEmailAndPassword(auth, email, password);
                console.log('✅ [Auth] Firebase Auth successful:', userCredential.user.uid);

                // Find employee by Firebase UID or email
                // IMPORTANT: Support same email across multiple companies
                const employeesRef = collection(db, 'employees');
                
                // First, try to find by Firebase UID (most reliable)
                let q = query(employeesRef, where('auth.firebaseUid', '==', userCredential.user.uid));
                let snapshot = await getDocs(q);

                // If multiple records found (same email, different companies), filter by companyId if available
                if (snapshot.size > 1) {
                    console.log(`ℹ️ [Auth] Found ${snapshot.size} employee records for this email (multi-company). Filtering by company context...`);
                    
                    // Try to get company context from URL or localStorage
                    const urlPath = window.location.pathname;
                    const companySlugMatch = urlPath.match(/\/employee\/([^\/]+)/);
                    const companySlug = companySlugMatch ? companySlugMatch[1] : null;
                    
                    // If we have company context, prefer that company's employee record
                    if (companySlug) {
                        // Try to find company by slug and filter employees
                        const companiesRef = collection(db, 'companies');
                        const companyQuery = query(companiesRef, where('slug', '==', companySlug));
                        const companySnapshot = await getDocs(companyQuery);
                        
                        if (!companySnapshot.empty) {
                            const companyId = companySnapshot.docs[0].id;
                            const filteredDocs = snapshot.docs.filter(doc => doc.data().companyId === companyId);
                            if (filteredDocs.length > 0) {
                                snapshot = { docs: filteredDocs, empty: false, size: filteredDocs.length } as any;
                                console.log(`✅ [Auth] Found employee record for company: ${companyId}`);
                            }
                        }
                    }
                }

                // If still not found by UID, try by email (but this might return multiple companies)
                if (snapshot.empty) {
                    q = query(employeesRef, where('contactInfo.workEmail', '==', email));
                    snapshot = await getDocs(q);
                    
                    // If multiple found, try to filter by company context
                    if (snapshot.size > 1) {
                        const urlPath = window.location.pathname;
                        const companySlugMatch = urlPath.match(/\/employee\/([^\/]+)/);
                        const companySlug = companySlugMatch ? companySlugMatch[1] : null;
                        
                        if (companySlug) {
                            const companiesRef = collection(db, 'companies');
                            const companyQuery = query(companiesRef, where('slug', '==', companySlug));
                            const companySnapshot = await getDocs(companyQuery);
                            
                            if (!companySnapshot.empty) {
                                const companyId = companySnapshot.docs[0].id;
                                const filteredDocs = snapshot.docs.filter(doc => doc.data().companyId === companyId);
                                if (filteredDocs.length > 0) {
                                    snapshot = { docs: filteredDocs, empty: false, size: filteredDocs.length } as any;
                                }
                            }
                        }
                    }
                }

                if (snapshot.empty) {
                    console.log('❌ [Auth] Employee record not found for Firebase user');
                    return { success: false, error: 'Employee record not found. Please contact HR.' };
                }

                employeeDoc = snapshot.docs[0];
                employeeData = employeeDoc.data();
                
                // Log if this email is used in multiple companies
                if (snapshot.size > 1) {
                    console.log(`ℹ️ [Auth] This email is registered in ${snapshot.size} companies. Using record for company: ${employeeData.companyId}`);
                }

                console.log('✅ [Auth] Employee found:', employeeData.employeeId);

                // Check if account is active
                if (employeeData.auth?.isActive === false) {
                    console.log('❌ [Auth] Account inactive');
                    return { success: false, error: 'Your account is inactive. Please contact HR.' };
                }

                console.log('✅ [Auth] Login successful!');

            } catch (firebaseAuthError: any) {
                console.log('❌ [Auth] Firebase Auth failed:', firebaseAuthError.code);
                console.error('❌ [Auth] Full error:', firebaseAuthError);

                // Handle specific Firebase Auth errors
                if (firebaseAuthError.code === 'auth/user-not-found' || firebaseAuthError.code === 'auth/invalid-credential') {
                    return { success: false, error: 'Email not found or invalid credentials. Please check your details or complete the setup process first.' };
                } else if (firebaseAuthError.code === 'auth/wrong-password') {
                    return { success: false, error: 'Incorrect password. Please try again.' };
                } else if (firebaseAuthError.code === 'auth/user-disabled') {
                    return { success: false, error: 'Your account has been disabled. Please contact HR.' };
                } else if (firebaseAuthError.code === 'auth/too-many-requests') {
                    return { success: false, error: 'Too many failed attempts. Please try again later.' };
                } else if (firebaseAuthError.code === 'auth/invalid-email') {
                    return { success: false, error: 'Invalid email format. Please check your email.' };
                } else {
                    // For undefined or unknown errors
                    const errorMessage = firebaseAuthError.message || 'Authentication failed. Please try again.';
                    return { success: false, error: `Authentication error: ${errorMessage}. Please ensure you've completed the account setup process.` };
                }
            }

            // Create employee object (this will only run if Firebase Auth succeeded)
            const employee: CurrentEmployee = {
                id: employeeDoc.id,
                employeeId: employeeData.employeeId,
                email: email,
                companyId: employeeData.companyId,
                firstName: employeeData.personalInfo?.firstName || '',
                lastName: employeeData.personalInfo?.lastName || '',
                role: employeeData.workInfo?.position || '',
                department: employeeData.workInfo?.department || '',
                onboardingStatus: 'completed', // TEMPORARILY SET TO COMPLETED FOR TESTING
                profileCompleteness: employeeData.profileStatus?.completeness || 0
            };

            // Store session
            const session = {
                employeeId: employee.employeeId,
                email: employee.email,
                companyId: employee.companyId,
                loginTime: new Date().toISOString(),
                expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours
            };

            localStorage.setItem('employeeSession', JSON.stringify(session));
            localStorage.setItem('currentEmployeeId', employee.employeeId);
            localStorage.setItem('employeeCompanyId', employee.companyId);

            setCurrentEmployee(employee);

            // Update last login in Firebase
            await updateDoc(doc(db, 'employees', employeeDoc.id), {
                'auth.lastLogin': new Date(),
                'auth.loginCount': (employeeData.auth?.loginCount || 0) + 1
            });

            console.log('✅ [Auth] Session created for:', employee.employeeId);

            return { success: true };
        } catch (error: any) {
            console.error('❌ [Auth] Login error:', error);
            return { success: false, error: 'Login failed. Please try again.' };
        }
    };

    const logout = async () => {
        console.log('👋 [Auth] Logging out');

        // Sign out from Firebase Auth
        try {
            await signOut(auth);
            console.log('✅ [Auth] Firebase Auth sign out successful');
        } catch (error) {
            console.error('❌ [Auth] Firebase Auth sign out error:', error);
        }

        setCurrentEmployee(null);
        localStorage.removeItem('employeeSession');
        localStorage.removeItem('currentEmployeeId');
        localStorage.removeItem('employeeCompanyId');
    };

    return (
        <AuthContext.Provider
            value={{
                isAuthenticated: !!currentEmployee,
                currentEmployee,
                login,
                logout,
                setCurrentEmployee,
                loading
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};

