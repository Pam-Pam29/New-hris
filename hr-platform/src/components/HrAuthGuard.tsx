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
            console.log('⏳ [HR Auth] Calling signInWithEmailAndPassword...');
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            console.log('✅ [HR Auth] signInWithEmailAndPassword completed');
            console.log('✅ [HR Auth] Login successful - Starting company ID fetch');
            console.log('🔍 [HR Auth] User ID:', userCredential.user.uid);

            // Load company ID from hrUsers collection
            const userId = userCredential.user.uid;
            console.log('🔍 [HR Auth] About to fetch company ID...');

            // Fetch hrUsers document to get companyId
            console.log('🔍 [HR Auth] Importing Firebase modules...');
            const { getFirebaseDb } = await import('../config/firebase');
            const { doc, getDoc, collection, query, where, getDocs } = await import('firebase/firestore');
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

            // If not in hrUsers or invalid, try to find an existing company by email
            if (!companyId || companyId === 'default' || companyId === userId) {
                console.warn('⚠️ [HR Auth] Invalid or missing companyId, searching for existing company...');

                try {
                    // Get user email
                    const userEmail = userCredential.user.email;
                    console.log('🔍 [HR Auth] Searching for company with email:', userEmail);

                    // Try to find company by owner email
                    const companiesRef = collection(db, 'companies');
                    let q = query(companiesRef, where('email', '==', userEmail));
                    let companySnapshot = await getDocs(q);

                    console.log('🔍 [HR Auth] Found', companySnapshot.docs.length, 'companies by exact email match');

                    // If not found by exact email, try to match by email domain
                    if (companySnapshot.empty && userEmail) {
                        const emailDomain = userEmail.split('@')[1];
                        console.log('🔍 [HR Auth] Trying to match by email domain:', emailDomain);
                        
                        // Get all companies and check if any have similar email domain
                        const allCompaniesSnapshot = await getDocs(collection(db, 'companies'));
                        console.log('🔍 [HR Auth] Total companies in database:', allCompaniesSnapshot.docs.length);
                        
                        allCompaniesSnapshot.docs.forEach((doc) => {
                            const companyData = doc.data();
                            console.log('  - Company ID:', doc.id, 'Email:', companyData.email);
                        });

                        // Try to find company with matching email domain
                        const matchingCompany = allCompaniesSnapshot.docs.find((doc) => {
                            const companyData = doc.data();
                            const companyEmail = companyData.email || '';
                            return companyEmail.includes(emailDomain) || emailDomain.includes(companyEmail.split('@')[1] || '');
                        });

                        if (matchingCompany) {
                            companyId = matchingCompany.id;
                            console.log('✅ [HR Auth] Found company by email domain match:', companyId);
                            
                            // Update hrUsers document with the found companyId
                            try {
                                const { updateDoc } = await import('firebase/firestore');
                                await updateDoc(doc(db, 'hrUsers', userId), {
                                    companyId: companyId,
                                    updatedAt: new Date()
                                });
                                console.log('✅ [HR Auth] Updated hrUsers with companyId');
                            } catch (updateError) {
                                console.warn('⚠️ [HR Auth] Could not update hrUsers:', updateError);
                            }
                        } else if (allCompaniesSnapshot.docs.length === 1) {
                            // If there's only one company, use it
                            companyId = allCompaniesSnapshot.docs[0].id;
                            console.log('✅ [HR Auth] Found single company in database, using it:', companyId);
                            
                            // Update hrUsers document
                            try {
                                const { updateDoc } = await import('firebase/firestore');
                                await updateDoc(doc(db, 'hrUsers', userId), {
                                    companyId: companyId,
                                    updatedAt: new Date()
                                });
                                console.log('✅ [HR Auth] Updated hrUsers with companyId');
                            } catch (updateError) {
                                console.warn('⚠️ [HR Auth] Could not update hrUsers:', updateError);
                            }
                        } else {
                            // Check if a company exists with this userId as ID (legacy case)
                            const userCompanyDoc = await getDoc(doc(db, 'companies', userId));
                            if (userCompanyDoc.exists()) {
                                companyId = userId;
                                console.log('✅ [HR Auth] Found company with userId as ID:', companyId);
                            } else {
                                // Last resort: use the first company (if any exist)
                                if (allCompaniesSnapshot.docs.length > 0) {
                                    companyId = allCompaniesSnapshot.docs[0].id;
                                    console.log('⚠️ [HR Auth] Using first available company:', companyId);
                                    
                                    // Update hrUsers document
                                    try {
                                        const { updateDoc } = await import('firebase/firestore');
                                        await updateDoc(doc(db, 'hrUsers', userId), {
                                            companyId: companyId,
                                            updatedAt: new Date()
                                        });
                                        console.log('✅ [HR Auth] Updated hrUsers with companyId');
                                    } catch (updateError) {
                                        console.warn('⚠️ [HR Auth] Could not update hrUsers:', updateError);
                                    }
                                } else {
                                    // No companies exist, use userId
                                    companyId = userId;
                                    console.log('⚠️ [HR Auth] No companies found, using userId as company ID:', companyId);
                                }
                            }
                        }
                    } else if (!companySnapshot.empty) {
                        companyId = companySnapshot.docs[0].id;
                        console.log('✅ [HR Auth] Found existing company by email:', companyId);
                        
                        // Update hrUsers document
                        try {
                            const { updateDoc } = await import('firebase/firestore');
                            await updateDoc(doc(db, 'hrUsers', userId), {
                                companyId: companyId,
                                updatedAt: new Date()
                            });
                            console.log('✅ [HR Auth] Updated hrUsers with companyId');
                        } catch (updateError) {
                            console.warn('⚠️ [HR Auth] Could not update hrUsers:', updateError);
                        }
                    }
                } catch (searchError) {
                    console.error('❌ [HR Auth] Error searching for company:', searchError);
                    companyId = userId;
                }
            }

            if (companyId) {
                console.log('✅ [HR Auth] Setting company ID in localStorage:', companyId);
                localStorage.setItem('companyId', companyId);

                // Trigger company context reload
                window.dispatchEvent(new CustomEvent('companyIdChanged'));
                console.log('✅ [HR Auth] Company context change event dispatched');

                // Wait a bit for context to update, then check onboarding status
                setTimeout(async () => {
                    console.log('✅ [HR Auth] setTimeout callback executing after 1 second');
                    // Try to load company data directly from Firestore to check onboarding
                    try {
                        const companyDoc = await getDoc(doc(db, 'companies', companyId));
                        if (companyDoc.exists()) {
                            const companyData = companyDoc.data();
                            console.log('🔍 [HR Auth] Company data loaded directly:', {
                                companyId: companyId,
                                onboardingCompleted: companyData.settings?.onboardingCompleted,
                                displayName: companyData.displayName
                            });

                            // Check if onboarding is marked as completed
                            const onboardingCompleted = companyData.settings?.onboardingCompleted;
                            
                            // If not explicitly marked, check for indicators that onboarding was done
                            // (departments, leave types, etc. suggest onboarding was completed)
                            const hasOnboardingIndicators = companyData.settings?.departments?.length > 0 || 
                                                           companyData.displayName || 
                                                           companyData.settings?.industry;

                            if (onboardingCompleted || hasOnboardingIndicators) {
                                // If onboarding indicators exist but flag is not set, update it
                                if (!onboardingCompleted && hasOnboardingIndicators) {
                                    console.log('⚠️ [HR Auth] Company has onboarding indicators but flag not set, updating...');
                                    try {
                                        const { updateDoc } = await import('firebase/firestore');
                                        await updateDoc(doc(db, 'companies', companyId), {
                                            'settings.onboardingCompleted': true,
                                            'settings.onboardingCompletedAt': new Date().toISOString()
                                        });
                                        console.log('✅ [HR Auth] Onboarding flag updated');
                                    } catch (updateError) {
                                        console.warn('⚠️ [HR Auth] Could not update onboarding flag:', updateError);
                                    }
                                }
                                
                                console.log('✅ [HR Auth] Onboarding completed, showing dashboard');
                                // Redirect to dashboard to ensure we show the right page
                                navigate('/dashboard');
                            } else {
                                console.log('📋 [HR Auth] Onboarding not completed, redirecting to onboarding');
                                navigate('/onboarding');
                            }
                        } else {
                            console.error('❌ [HR Auth] Company document not found');
                            navigate('/onboarding');
                        }
                    } catch (error) {
                        console.error('❌ [HR Auth] Error loading company data:', error);
                        navigate('/onboarding');
                    }
                }, 3000); // Increased to 3 seconds for better reliability
            } else {
                console.warn('⚠️ [HR Auth] No company ID found');
            }
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

                            <div className="text-sm text-center text-gray-500 mt-4 space-y-2">
                                <p>
                                    Don't have an account?{' '}
                                    <button
                                        type="button"
                                        onClick={() => navigate('/onboarding')}
                                        className="text-blue-600 hover:underline font-medium"
                                    >
                                        Start onboarding
                                    </button>
                                    {' or '}
                                    <button
                                        type="button"
                                        onClick={() => navigate('/hr-onboarding-signup')}
                                        className="text-blue-600 hover:underline font-medium"
                                    >
                                        sign up here
                                    </button>
                                </p>
                                <p className="mt-2 text-xs text-gray-400">
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

