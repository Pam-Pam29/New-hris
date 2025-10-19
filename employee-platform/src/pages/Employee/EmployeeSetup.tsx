import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { UserPlus, AlertCircle, Loader, CheckCircle, Eye, EyeOff } from 'lucide-react';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
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
                const employeeRef = doc(db, 'employees', employeeId);
                const employeeDoc = await getDoc(employeeRef);

                if (!employeeDoc.exists()) {
                    setError('Employee not found. Please contact your HR department.');
                    setLoading(false);
                    return;
                }

                const employeeData = employeeDoc.data();

                // Check if already set up
                if (employeeData.accountSetup === 'completed') {
                    setError('Account already set up. Please use the login page.');
                    setTimeout(() => navigate('/login'), 3000);
                    setLoading(false);
                    return;
                }

                // Verify invite token (if required)
                if (inviteToken && employeeData.inviteToken !== inviteToken) {
                    setError('Invalid invitation token. Please contact your HR department.');
                    setLoading(false);
                    return;
                }

                setEmployee(employeeData);
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
            console.log('🔐 [Employee Setup] Creating account for:', employee.email);

            // Create Firebase Authentication account
            const userCredential = await createUserWithEmailAndPassword(
                auth,
                employee.email,
                formData.password
            );

            console.log('✅ [Employee Setup] Firebase account created');

            // Update employee document
            const employeeRef = doc(db, 'employees', employeeId);
            await updateDoc(employeeRef, {
                accountSetup: 'completed',
                setupCompletedAt: new Date().toISOString(),
                firebaseUid: userCredential.user.uid,
                inviteToken: null // Clear invite token
            });

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
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-50 p-4">
                <Card className="w-full max-w-md">
                    <CardContent className="pt-8">
                        <div className="text-center">
                            <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                                <AlertCircle className="w-8 h-8 text-red-600" />
                            </div>
                            <h2 className="text-2xl font-bold mb-2">Invalid Invitation</h2>
                            <p className="text-gray-600 mb-4">{error}</p>
                            <Button onClick={() => navigate('/login')} variant="outline">
                                Go to Login
                            </Button>
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
                            <strong>Your Email:</strong> {employee?.email}
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

