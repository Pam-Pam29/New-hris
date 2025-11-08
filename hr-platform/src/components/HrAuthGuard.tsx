import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged, signOut, User } from 'firebase/auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Alert, AlertDescription } from './ui/alert';
import { Lock, LogOut, AlertCircle, Loader } from 'lucide-react';

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
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [error, setError] = useState<string>('');
    const [isLoggingIn, setIsLoggingIn] = useState<boolean>(false);
    const [isCompanyReady, setIsCompanyReady] = useState<boolean>(true);

    const auth = getAuth();

    const resolveCompanyForUser = useCallback(async (user: User) => {
        try {
            setIsCompanyReady(false);

            const { getFirebaseDb } = await import('../config/firebase');
            const { doc, getDoc, setDoc, updateDoc } = await import('firebase/firestore');
            const db = getFirebaseDb();

            const userId = user.uid;
            const hrUserRef = doc(db, 'hrUsers', userId);
            const hrUserDoc = await getDoc(hrUserRef);

            let companyId: string | null = null;

            if (hrUserDoc.exists()) {
                const hrUserData = hrUserDoc.data() as { companyId?: string | null };
                companyId = hrUserData?.companyId ?? null;
                console.log('✅ [HR Auth] Found company ID from hrUsers:', companyId);
            }

            if (!companyId) {
                const storedCompanyId = localStorage.getItem('companyId');
                if (storedCompanyId) {
                    companyId = storedCompanyId;
                    console.log('✅ [HR Auth] Using company ID from localStorage:', companyId);
                }
            }

            if (!companyId || companyId === 'default' || companyId === userId) {
                await setDoc(
                    hrUserRef,
                    {
                        email: user.email ?? '',
                        companyId: null,
                        onboardingCompleted: false,
                        updatedAt: new Date(),
                    },
                    { merge: true }
                );
                console.warn('⚠️ [HR Auth] No company linked to this user. Redirecting to onboarding.');
                setIsCompanyReady(true);
                navigate('/onboarding', { replace: true });
                return;
            }

            console.log('✅ [HR Auth] Setting company ID in localStorage:', companyId);
            localStorage.setItem('companyId', companyId);

            window.dispatchEvent(new CustomEvent('companyIdChanged'));

            const companyRef = doc(db, 'companies', companyId);
            const companyDoc = await getDoc(companyRef);

            if (!companyDoc.exists()) {
                console.error('❌ [HR Auth] Company document not found');
                setIsCompanyReady(true);
                navigate('/onboarding', { replace: true });
                return;
            }

            const companyData = companyDoc.data() as any;
            const onboardingCompleted = companyData?.settings?.onboardingCompleted;
            const hasOnboardingIndicators =
                (Array.isArray(companyData?.settings?.departments) && companyData.settings.departments.length > 0) ||
                !!companyData?.displayName ||
                !!companyData?.settings?.industry;

            if (!onboardingCompleted && hasOnboardingIndicators) {
                try {
                    await updateDoc(companyRef, {
                        'settings.onboardingCompleted': true,
                        'settings.onboardingCompletedAt': new Date().toISOString(),
                    });
                    console.log('✅ [HR Auth] Onboarding flag updated');
                } catch (updateError) {
                    console.warn('⚠️ [HR Auth] Could not update onboarding flag:', updateError);
                }
            }

            setIsCompanyReady(true);

            const currentPath = window.location.pathname;
            const shouldRedirectToDashboard =
                currentPath === '/' ||
                currentPath === '/login' ||
                currentPath === '/onboarding' ||
                currentPath.startsWith('/hr-onboarding');

            if (onboardingCompleted || hasOnboardingIndicators) {
                console.log('✅ [HR Auth] Onboarding completed, continuing to requested route');
                if (shouldRedirectToDashboard) {
                    navigate('/dashboard', { replace: true });
                }
            } else {
                console.log('📋 [HR Auth] Onboarding not completed, redirecting to onboarding');
                if (!currentPath.startsWith('/onboarding') && !currentPath.startsWith('/hr-onboarding')) {
                    navigate('/onboarding', { replace: true });
                }
            }
        } catch (error) {
            console.error('❌ [HR Auth] Error resolving company context:', error);
            setIsCompanyReady(true);
            const currentPath = window.location.pathname;
            if (!currentPath.startsWith('/onboarding') && !currentPath.startsWith('/hr-onboarding')) {
                navigate('/onboarding', { replace: true });
            }
        }
    }, [navigate]);

    // Log initialization only once
    useEffect(() => {
        console.log('🚀 [HR Auth] HrAuthGuard component mounted');
    }, []);

    // Check if current path should bypass authentication
    const isPublicRoute = () => {
        const path = window.location.pathname;
        return path === '/signup' || path === '/hr-signup' || path === '/hr-onboarding-signup' || path === '/hr-onboarding-signin' || path === '/onboarding' || path === '/data-cleanup';
    };

    // Check authentication state on mount
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            const authenticated = !!user;
            setIsAuthenticated(authenticated);
            setIsLoading(false);

            if (user) {
                console.log('✅ [HR Auth] User authenticated:', user.email);
                resolveCompanyForUser(user);
            } else {
                setIsCompanyReady(true);
            }
        });

        return () => unsubscribe();
    }, [auth, resolveCompanyForUser]);

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
            console.log('⏳ [HR Auth] Calling signInWithEmailAndPassword...');
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            console.log('✅ [HR Auth] signInWithEmailAndPassword completed');
            console.log('✅ [HR Auth] Login successful - Starting company ID fetch');
            console.log('🔍 [HR Auth] User ID:', userCredential.user.uid);
            setIsCompanyReady(false);

            await resolveCompanyForUser(userCredential.user);
        } catch (error: any) {
            console.error('❌ [HR Auth] Login error:', error);

            // User-friendly error messages
            let errorMessage = 'Login failed. Please try again.';

            if (error.code === 'auth/invalid-credential' || error.code === 'auth/wrong-password') {
                errorMessage = 'Invalid email or password. Please check your credentials or sign up for a new account.';
            } else if (error.code === 'auth/user-not-found') {
                errorMessage = 'No account found with this email. Please sign up to create an account.';
            } else if (error.code === 'auth/too-many-requests') {
                errorMessage = 'Too many failed attempts. Please try again later.';
            } else if (error.code === 'auth/network-request-failed') {
                errorMessage = 'Network error. Please check your connection.';
            }

            setError(errorMessage);
            setIsCompanyReady(true);
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
            <div className="min-h-screen flex items-center justify-center bg-background">
                <Card className="w-full max-w-md">
                    <CardContent className="flex items-center justify-center py-8">
                        <div className="text-center">
                            <Loader className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
                            <p className="text-muted-foreground">Checking authentication...</p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    // Not authenticated - show login page
    if (!isAuthenticated) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background p-4">
                <Card className="w-full max-w-md">
                    <CardHeader className="space-y-2 text-center">
                        <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                            <Lock className="w-8 h-8 text-primary" />
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
                                onClick={() => console.log('🔘 [HR Auth] Login button clicked!')}
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

                            <div className="text-sm text-center text-muted-foreground mt-4 space-y-2">
                                <p>
                                    Don't have an account?{' '}
                                    <button
                                        type="button"
                                        onClick={() => navigate('/onboarding')}
                                        className="text-primary hover:underline font-medium"
                                    >
                                        Start onboarding
                                    </button>
                                    {' or '}
                                    <button
                                        type="button"
                                        onClick={() => navigate('/hr-onboarding-signup')}
                                        className="text-primary hover:underline font-medium"
                                    >
                                        sign up here
                                    </button>
                                </p>
                                <p className="mt-2 text-xs text-muted-foreground/70">
                                    Need help? Contact your system administrator.
                                </p>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (!isCompanyReady) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <Card className="w-full max-w-md">
                    <CardContent className="flex items-center justify-center py-8">
                        <div className="text-center">
                            <Loader className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
                            <p className="text-muted-foreground">Preparing your workspace...</p>
                        </div>
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
                    className="bg-card shadow-md"
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

