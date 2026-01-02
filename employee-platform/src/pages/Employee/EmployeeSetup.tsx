import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { UserPlus, AlertCircle, Loader, CheckCircle, Eye, EyeOff } from 'lucide-react';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { doc, getDoc, updateDoc, getFirestore } from 'firebase/firestore';

/**
 * Employee Setup Component
 * First-time setup for new employees after HR creates their profile
 * 
 * Flow:
 * 1. HR creates employee in HR Platform
 * 2. Employee receives invitation link with employeeId
 * 3. Employee visits this page
 * 4. Employee sets password
 * 5. Redirected to onboarding/dashboard
 */

export const EmployeeSetup: React.FC = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const auth = getAuth();
    const db = getFirestore();

    const employeeId = searchParams.get('id');
    const inviteToken = searchParams.get('token');

    const [loading, setLoading] = useState(true);
    const [employee, setEmployee] = useState<any>(null);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const [formData, setFormData] = useState({
        password: '',
        confirmPassword: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Load employee data
    useEffect(() => {
        const loadEmployee = async () => {
            if (!employeeId) {
                setError('Invalid invitation link. Missing employee ID.');
                setLoading(false);
                return;
            }

            try {
                // Try to find employee in employees collection first (by employeeId as document ID)
                let employeeRef = doc(db, 'employees', employeeId);
                let employeeDoc = await getDoc(employeeRef);
                
                // If not found, try to find by employeeId field in employees collection
                if (!employeeDoc.exists()) {
                    const { collection, query, where, getDocs } = await import('firebase/firestore');
                    const employeesRef = collection(db, 'employees');
                    const q = query(employeesRef, where('employeeId', '==', employeeId));
                    const querySnapshot = await getDocs(q);
                    
                    if (!querySnapshot.empty) {
                        employeeDoc = querySnapshot.docs[0];
                        employeeRef = doc(db, 'employees', employeeDoc.id);
                    } else {
                        // Try employeeProfiles collection
                        const profilesRef = collection(db, 'employeeProfiles');
                        const profileQuery = query(profilesRef, where('employeeId', '==', employeeId));
                        const profileSnapshot = await getDocs(profileQuery);
                        
                        if (!profileSnapshot.empty) {
                            employeeDoc = profileSnapshot.docs[0];
                            employeeRef = doc(db, 'employeeProfiles', employeeDoc.id);
                        }
                    }
                }

                if (!employeeDoc.exists()) {
                    setError('Employee not found. Please contact your HR department.');
                    setLoading(false);
                    return;
                }

                const employeeData = employeeDoc.data();

                const resolvedEmail =
                    employeeData.auth?.email ||
                    employeeData.contactInfo?.workEmail ||
                    employeeData.contactInfo?.personalEmail ||
                    employeeData.personalEmail ||
                    employeeData.email ||
                    '';

                // Check if already set up - but only block if Firebase Auth account actually exists
                const hasFirebaseAuth = employeeData.auth?.firebaseUid;
                const isAccountSetup = employeeData.accountSetup === 'completed' || employeeData.auth?.isActive === true;
                
                // Only block setup if account is marked as completed AND Firebase Auth account exists
                // If no Firebase Auth account, allow password setup to proceed
                if (isAccountSetup && hasFirebaseAuth) {
                    setError('Your account is already set up. Please use the login page to access your account.');
                    setLoading(false);
                    
                    // Auto-redirect to login after 5 seconds
                    setTimeout(() => navigate('/login'), 5000);
                    return;
                }
                
                // If account is marked as setup but no Firebase Auth exists, allow password creation
                // This handles the case where HR created the profile but employee hasn't set password yet
                if (isAccountSetup && !hasFirebaseAuth) {
                    console.log('⚠️ [Employee Setup] Account marked as setup but no Firebase Auth exists - allowing password setup');
                }

                // Verify invite token (if required)
                if (inviteToken && employeeData.auth?.setupToken !== inviteToken) {
                    setError('Invalid invitation token. Please contact your HR department.');
                    setLoading(false);
                    return;
                }

                console.log('✅ [Employee Setup] Employee data loaded:', employeeData);
                setEmployee({
                    ...employeeData,
                    resolvedEmail
                });
                setLoading(false);
            } catch (err: any) {
                console.error('Error loading employee:', err);
                setError('Failed to load employee data. Please try again.');
                setLoading(false);
            }
        };

        loadEmployee();
    }, [employeeId, inviteToken, db, navigate]);

    const validateForm = () => {
        if (!formData.password) {
            setError('Please enter a password');
            return false;
        }

        if (formData.password.length < 6) {
            setError('Password must be at least 6 characters long');
            return false;
        }

        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return false;
        }

        return true;
    };

    const handleSetup = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        if (!employee || !employeeId) {
            setError('Employee data not loaded');
            return;
        }

        setIsSubmitting(true);
        setError('');

        try {
            const employeeEmail =
                employee.auth?.email ||
                employee.contactInfo?.workEmail ||
                employee.contactInfo?.personalEmail ||
                employee.personalEmail ||
                employee.email;
            console.log('🔐 [Employee Setup] Creating Firebase Auth account for:', employeeEmail);

            let userCredential;
            let existingAccount = false;
            
            try {
                // Try to create new Firebase Auth account
                userCredential = await createUserWithEmailAndPassword(
                    auth,
                    employeeEmail,
                    formData.password
                );
                console.log('✅ [Employee Setup] New Firebase Auth account created');
            } catch (error: any) {
                if (error.code === 'auth/email-already-in-use') {
                    console.log('⚠️ [Employee Setup] Account exists, attempting to link to employee record');
                    existingAccount = true;
                    
                    // Try to sign in with the provided password to verify it's the correct account
                    try {
                        userCredential = await signInWithEmailAndPassword(
                            auth,
                            employeeEmail,
                            formData.password
                        );
                        console.log('✅ [Employee Setup] Successfully signed in with existing account');
                    } catch (signInError: any) {
                        // Password is wrong - offer password reset
                        if (signInError.code === 'auth/invalid-credential' || signInError.code === 'auth/wrong-password') {
                            console.log('⚠️ [Employee Setup] Wrong password for existing account');
                            
                            // Try to send password reset email
                            try {
                                await sendPasswordResetEmail(auth, employeeEmail);
                                throw new Error('This email is already registered with a different password. A password reset link has been sent to your email. Please check your inbox and use the reset link, or contact HR for assistance.');
                            } catch (resetError: any) {
                                if (resetError.message.includes('password reset link')) {
                                    throw resetError; // Re-throw our custom message
                                }
                                throw new Error('This email is already registered. Please use the login page if you know your password, or contact HR to reset it.');
                            }
                        } else {
                            throw signInError;
                        }
                    }
                } else {
                    throw error;
                }
            }

            // Update employee document
            const employeeRef = doc(db, 'employees', employeeId);
            const updateData: any = {
                accountSetup: 'completed',
                setupCompletedAt: new Date().toISOString(),
                'auth.isActive': true,
                'auth.lastLogin': null,
                'auth.loginCount': 0
            };

            // Store Firebase UID (for both new and existing accounts)
            // IMPORTANT: Same email can be used for multiple companies
            // We link the Firebase Auth account to THIS company's employee record
            if (userCredential) {
                updateData['auth.firebaseUid'] = userCredential.user.uid;
                updateData['auth.emailVerified'] = userCredential.user.emailVerified;
                updateData['auth.email'] = employeeEmail;
                
                if (existingAccount) {
                    console.log('✅ [Employee Setup] Linked existing Firebase Auth account to employee record');
                    console.log('ℹ️ [Employee Setup] Same email can be used for multiple companies - this is normal');
                }
            }

            await updateDoc(employeeRef, updateData);

            console.log('✅ [Employee Setup] Employee profile updated');

            setSuccess(true);

            // Wait 2 seconds then redirect to onboarding or dashboard
            setTimeout(() => {
                if (employee.onboardingStatus === 'completed') {
                    navigate('/dashboard');
                } else {
                    navigate('/onboarding');
                }
            }, 2000);

        } catch (err: any) {
            console.error('❌ [Employee Setup] Error:', err);

            let errorMessage = 'Setup failed. Please try again.';

            if (err.code === 'auth/email-already-in-use') {
                errorMessage = 'This email is already registered. Please use the login page.';
            } else if (err.code === 'auth/invalid-email') {
                errorMessage = 'Invalid email format. Please contact HR.';
            } else if (err.code === 'auth/weak-password') {
                errorMessage = 'Password is too weak. Use at least 6 characters.';
            } else if (err.code === 'auth/network-request-failed') {
                errorMessage = 'Network error. Please check your connection.';
            }

            setError(errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    };

    // Loading state
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50">
                <Card className="w-full max-w-md">
                    <CardContent className="flex items-center justify-center py-8">
                        <div className="text-center">
                            <Loader className="w-8 h-8 animate-spin mx-auto mb-4 text-green-600" />
                            <p className="text-gray-600">Loading your invitation...</p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    // Success state
    if (success) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50 p-4">
                <Card className="w-full max-w-md">
                    <CardContent className="pt-8">
                        <div className="text-center">
                            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                                <CheckCircle className="w-8 h-8 text-green-600" />
                            </div>
                            <h2 className="text-2xl font-bold mb-2">Account Created!</h2>
                            <p className="text-gray-600 mb-2">
                                Welcome, {employee?.firstName} {employee?.lastName}!
                            </p>
                            <p className="text-sm text-gray-500 mb-4">
                                Your employee account has been set up successfully.
                            </p>
                            <p className="text-sm text-gray-500">
                                {employee?.onboardingStatus === 'completed'
                                    ? 'Redirecting to dashboard...'
                                    : 'Let\'s complete your profile...'}
                            </p>
                            <Loader className="w-6 h-6 animate-spin mx-auto mt-4 text-green-600" />
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    // Error state (invalid link, already setup, etc.)
    if (error && !employee) {
        const isAlreadySetup = error.includes('already set up') || error.includes('already completed');
        
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 p-4">
                <Card className="w-full max-w-md">
                    <CardContent className="pt-8">
                        <div className="text-center">
                            <div className={`mx-auto w-16 h-16 ${isAlreadySetup ? 'bg-blue-100' : 'bg-red-100'} rounded-full flex items-center justify-center mb-4`}>
                                {isAlreadySetup ? (
                                    <CheckCircle className="w-8 h-8 text-blue-600" />
                                ) : (
                                <AlertCircle className="w-8 h-8 text-red-600" />
                                )}
                            </div>
                            <h2 className="text-2xl font-bold mb-2">
                                {isAlreadySetup ? 'Account Already Set Up' : 'Invalid Invitation'}
                            </h2>
                            <p className="text-gray-600 mb-6">{error}</p>
                            
                            {isAlreadySetup && (
                                <div className="mb-6 p-4 bg-blue-50 rounded-lg text-left">
                                    <p className="text-sm text-blue-800 mb-2">
                                        <strong>What to do next:</strong>
                                    </p>
                                    <ul className="text-sm text-blue-700 space-y-1 list-disc list-inside">
                                        <li>If you remember your password, click "Go to Login" below</li>
                                        <li>If you forgot your password, contact your HR department</li>
                                        <li>They can reset your password or generate a new setup link</li>
                                    </ul>
                                </div>
                            )}
                            
                            <div className="space-y-3">
                                <Button 
                                    onClick={() => navigate('/login')} 
                                    className="w-full"
                                    size="lg"
                                >
                                Go to Login
                            </Button>
                                {isAlreadySetup && (
                                    <p className="text-xs text-gray-500">
                                        Redirecting to login page in 5 seconds...
                                    </p>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    // Setup form
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50 p-4">
            <Card className="w-full max-w-md">
                <CardHeader className="space-y-2 text-center">
                    <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                        <UserPlus className="w-8 h-8 text-green-600" />
                    </div>
                    <CardTitle className="text-2xl font-bold">Welcome to the Team!</CardTitle>
                    <CardDescription>
                        Hi {employee?.firstName}! Set up your account to get started.
                    </CardDescription>
                </CardHeader>

                <CardContent>
                    <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                        <p className="text-sm text-blue-800">
                            <strong>Your Email:</strong> {employee?.resolvedEmail || 'Not available'}
                        </p>
                        <p className="text-sm text-blue-800 mt-1">
                            <strong>Employee ID:</strong> {employee?.employeeId}
                        </p>
                    </div>

                    <form onSubmit={handleSetup} className="space-y-4">
                        {error && (
                            <Alert variant="destructive">
                                <AlertCircle className="h-4 w-4" />
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                        )}

                        <div className="space-y-2">
                            <Label htmlFor="password">Create Password</Label>
                            <div className="relative">
                                <Input
                                    id="password"
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="Create a secure password"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    disabled={isSubmitting}
                                    required
                                    autoComplete="new-password"
                                    className="w-full pr-10"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                >
                                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                            </div>
                            <p className="text-xs text-gray-500">
                                At least 6 characters
                            </p>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="confirmPassword">Confirm Password</Label>
                            <div className="relative">
                                <Input
                                    id="confirmPassword"
                                    type={showConfirmPassword ? 'text' : 'password'}
                                    placeholder="Confirm your password"
                                    value={formData.confirmPassword}
                                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                    disabled={isSubmitting}
                                    required
                                    autoComplete="new-password"
                                    className="w-full pr-10"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                >
                                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                            </div>
                        </div>

                        <Button
                            type="submit"
                            className="w-full"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader className="mr-2 h-4 w-4 animate-spin" />
                                    Setting up your account...
                                </>
                            ) : (
                                'Complete Setup'
                            )}
                        </Button>

                        <div className="text-center mt-4">
                            <p className="text-sm text-gray-500">
                                Already have an account?{' '}
                                <button
                                    type="button"
                                    onClick={() => navigate('/login')}
                                    className="text-green-600 hover:underline"
                                    disabled={isSubmitting}
                                >
                                    Login here
                                </button>
                            </p>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
};

export default EmployeeSetup;


