import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged, signOut } from 'firebase/auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Alert, AlertDescription } from './ui/alert';
import { Lock, LogOut, AlertCircle, Loader } from 'lucide-react';
import { useCompany } from '../context/CompanyContext';

/**
 * HR Authentication Guard
 * Protects HR routes from unauthorized access
 * 
 * Usage in App.tsx:
 * import { HrAuthGuard } from './components/HrAuthGuard';
 * 
 * <Route path="/hr/*" element={<HrAuthGuard><HrApp /></HrAuthGuard>} />
 */

interface HrAuthGuardProps {
    children: React.ReactNode;
}

export const HrAuthGuard: React.FC<HrAuthGuardProps> = ({ children }) => {
    const navigate = useNavigate();
    const { company, loading: companyLoading } = useCompany();
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [error, setError] = useState<string>('');
    const [isLoggingIn, setIsLoggingIn] = useState<boolean>(false);

    const auth = getAuth();

    // Check if current path should bypass authentication
    const isPublicRoute = () => {
        const path = window.location.pathname;
        return path === '/signup' || path === '/hr-signup' || path === '/hr-onboarding-signup' || path === '/hr-onboarding-signin' || path === '/onboarding' || path === '/data-cleanup';
    };

    // Check authentication state on mount
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setIsAuthenticated(!!user);
            setIsLoading(false);

            if (user) {
                console.log('✅ [HR Auth] User authenticated:', user.email);
            }
        });

        return () => unsubscribe();
    }, [auth]);

    // Handle login
    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!email || !password) {
            setError('Please enter both email and password');
            return;
        }

        setIsLoggingIn(true);
        setError('');

        try {
            console.log('🔐 [HR Auth] Attempting login for:', email);
            const userCredential = await signInWithEmailAndPassword(auth, email, password);

            // Success - authentication state will update via onAuthStateChanged
            console.log('✅ [HR Auth] Login successful - Starting company ID fetch');
            console.log('🔍 [HR Auth] User ID:', userCredential.user.uid);

            // Load company ID from hrUsers collection
            const userId = userCredential.user.uid;
            console.log('🔍 [HR Auth] About to fetch company ID...');

            // Fetch hrUsers document to get companyId
            console.log('🔍 [HR Auth] Importing Firebase modules...');
            const { getFirebaseDb } = await import('../config/firebase');
            const { doc, getDoc } = await import('firebase/firestore');
            const db = getFirebaseDb();
            console.log('🔍 [HR Auth] Firebase DB initialized');

            // Try to find company ID from hrUsers document first
            console.log('🔍 [HR Auth] Fetching hrUsers document...');
            const hrUserRef = doc(db, 'hrUsers', userId);
            const hrUserDoc = await getDoc(hrUserRef);
            console.log('🔍 [HR Auth] hrUsers document exists:', hrUserDoc.exists());

            let companyId: string | null = null;

            if (hrUserDoc.exists()) {
                const hrUserData = hrUserDoc.data();
                companyId = hrUserData.companyId;
                console.log('✅ [HR Auth] Found company ID from hrUsers:', companyId);
            }

            // If not in hrUsers, the companyId is the userId itself (based on HrSignup logic)
            if (!companyId) {
                companyId = userId;
                console.log('✅ [HR Auth] Using userId as company ID:', companyId);
            }

            if (companyId) {
                console.log('✅ [HR Auth] Setting company ID in localStorage:', companyId);
                localStorage.setItem('companyId', companyId);

                // Trigger company context reload
                window.dispatchEvent(new CustomEvent('companyIdChanged'));

                // Wait for company data to load
                setTimeout(() => {
                    console.log('🔍 [HR Auth] Company data check:', {
                        hasCompany: !!company,
                        onboardingCompleted: company?.settings?.onboardingCompleted,
                        settings: company?.settings
                    });

                    if (!company?.settings?.onboardingCompleted) {
                        console.log('📋 [HR Auth] Onboarding not completed, redirecting to onboarding');
                        navigate('/onboarding');
                    } else {
                        console.log('✅ [HR Auth] Onboarding completed, showing dashboard');
                    }
                }, 1500);
            } else {
                console.warn('⚠️ [HR Auth] No company ID found');
            }
        } catch (error: any) {
            console.error('❌ [HR Auth] Login error:', error);

            // User-friendly error messages
            let errorMessage = 'Login failed. Please try again.';

            if (error.code === 'auth/invalid-credential' || error.code === 'auth/wrong-password') {
                errorMessage = 'Invalid email or password';
            } else if (error.code === 'auth/user-not-found') {
                errorMessage = 'No account found with this email';
            } else if (error.code === 'auth/too-many-requests') {
                errorMessage = 'Too many failed attempts. Please try again later.';
            } else if (error.code === 'auth/network-request-failed') {
                errorMessage = 'Network error. Please check your connection.';
            }

            setError(errorMessage);
        } finally {
            setIsLoggingIn(false);
        }
    };

    // Handle logout
    const handleLogout = async () => {
        try {
            await signOut(auth);
            console.log('👋 [HR Auth] User logged out');
        } catch (error) {
            console.error('❌ [HR Auth] Logout error:', error);
        }
    };

    // Allow public routes without authentication
    if (isPublicRoute()) {
        return <>{children}</>;
    }

    // Loading state
    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50">
                <Card className="w-full max-w-md">
                    <CardContent className="flex items-center justify-center py-8">
                        <div className="text-center">
                            <Loader className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
                            <p className="text-gray-600">Checking authentication...</p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    // Not authenticated - show login page
    if (!isAuthenticated) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 p-4">
                <Card className="w-full max-w-md">
                    <CardHeader className="space-y-2 text-center">
                        <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                            <Lock className="w-8 h-8 text-blue-600" />
                        </div>
                        <CardTitle className="text-2xl font-bold">HR Platform Login</CardTitle>
                        <CardDescription>
                            Enter your credentials to access the HR management system
                        </CardDescription>
                    </CardHeader>

                    <CardContent>
                        <form onSubmit={handleLogin} className="space-y-4">
                            {error && (
                                <Alert variant="destructive">
                                    <AlertCircle className="h-4 w-4" />
                                    <AlertDescription>{error}</AlertDescription>
                                </Alert>
                            )}

                            <div className="space-y-2">
                                <Label htmlFor="email">Email Address</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="hr@company.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    disabled={isLoggingIn}
                                    required
                                    autoComplete="email"
                                    className="w-full"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="password">Password</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    placeholder="Enter your password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    disabled={isLoggingIn}
                                    required
                                    autoComplete="current-password"
                                    className="w-full"
                                />
                            </div>

                            <Button
                                type="submit"
                                className="w-full"
                                disabled={isLoggingIn}
                            >
                                {isLoggingIn ? (
                                    <>
                                        <Loader className="mr-2 h-4 w-4 animate-spin" />
                                        Logging in...
                                    </>
                                ) : (
                                    'Login to HR Platform'
                                )}
                            </Button>

                            <div className="text-sm text-center text-gray-500 mt-4">
                                <p>
                                    Don't have an account?{' '}
                                    <button
                                        onClick={() => navigate('/hr-onboarding-signup')}
                                        className="text-blue-600 hover:underline font-medium"
                                    >
                                        Sign up here
                                    </button>
                                </p>
                                <p className="mt-2 text-xs">
                                    Need help? Contact your system administrator.
                                </p>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        );
    }

    // Authenticated - show children with logout button
    return (
        <div className="relative">
            {/* Logout button in top-right corner */}
            <div className="fixed top-4 right-4 z-50">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={handleLogout}
                    className="bg-white shadow-md"
                >
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                </Button>
            </div>

            {children}
        </div>
    );
};

// Default export for convenience
export default HrAuthGuard;

