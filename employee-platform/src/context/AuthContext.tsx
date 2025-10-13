import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { collection, query, where, getDocs, doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../config/firebase';

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

                        // Load employee data
                        const employeeRef = doc(db, 'employees', sessionData.employeeId);
                        const employeeDoc = await getDoc(employeeRef);

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
                                onboardingStatus: 'completed', // TEMPORARILY SET TO COMPLETED FOR TESTING
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
            console.log('🔐 [Auth] Attempting login for:', email);

            // Find employee by email
            const employeesRef = collection(db, 'employees');
            const q = query(employeesRef, where('contactInfo.workEmail', '==', email));
            const snapshot = await getDocs(q);

            if (snapshot.empty) {
                console.log('❌ [Auth] Email not found:', email);
                return { success: false, error: 'Email not found. Please check your email or contact HR.' };
            }

            const employeeDoc = snapshot.docs[0];
            const employeeData = employeeDoc.data();

            console.log('✅ [Auth] Employee found:', employeeData.employeeId);

            // Check if password has been set
            if (!employeeData.auth?.passwordHash) {
                console.log('⚠️ [Auth] Password not set yet');
                return {
                    success: false,
                    error: 'Password not set. Please check your email for the setup link or contact HR.'
                };
            }

            // For now, we'll do a simple password comparison
            // In production, use bcrypt.compare(password, employeeData.auth.passwordHash)
            // For MVP, we'll store password directly (NOT SECURE - TEMPORARY!)
            if (password !== employeeData.auth.password) {
                console.log('❌ [Auth] Incorrect password');
                return { success: false, error: 'Incorrect password. Please try again.' };
            }

            // Check if account is active
            if (employeeData.auth?.isActive === false) {
                console.log('❌ [Auth] Account inactive');
                return { success: false, error: 'Your account is inactive. Please contact HR.' };
            }

            console.log('✅ [Auth] Login successful!');

            // Create employee object
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

    const logout = () => {
        console.log('👋 [Auth] Logging out');
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

