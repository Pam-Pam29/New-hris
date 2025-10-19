import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, getFirestore } from 'firebase/firestore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Alert, AlertDescription } from './ui/alert';
import { UserPlus, AlertCircle, Loader, CheckCircle } from 'lucide-react';

/**
 * HR Sign Up Component
 * Allows creating the first HR user account after company onboarding
 */

interface HrSignUpProps {
    companyId?: string;
    companyName?: string;
    onSignUpComplete?: () => void;
}

export const HrSignUp: React.FC<HrSignUpProps> = ({
    companyId,
    companyName,
    onSignUpComplete
}) => {
    const navigate = useNavigate();
    const auth = getAuth();
    const db = getFirestore();

    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
        setError(''); // Clear error when user types
    };

    const validateForm = () => {
        if (!formData.fullName.trim()) {
            setError('Please enter your full name');
            return false;
        }

        if (!formData.email.trim()) {
            setError('Please enter your email address');
            return false;
        }

        // Basic email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
            setError('Please enter a valid email address');
            return false;
        }

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

    const handleSignUp = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setIsLoading(true);
        setError('');

        try {
            console.log('🔐 [HR Sign Up] Creating user account...');

            // Create Firebase Authentication user
            const userCredential = await createUserWithEmailAndPassword(
                auth,
                formData.email,
                formData.password
            );

            const user = userCredential.user;
            console.log('✅ [HR Sign Up] User created:', user.uid);

            // Create HR user profile in Firestore
            const hrUserData = {
                uid: user.uid,
                email: formData.email,
                fullName: formData.fullName,
                role: 'hr',
                companyId: companyId || 'default',
                createdAt: new Date().toISOString(),
                isActive: true,
                permissions: ['all'] // Full access for HR
            };

            await setDoc(doc(db, 'hrUsers', user.uid), hrUserData);
            console.log('✅ [HR Sign Up] HR profile created');

            setSuccess(true);

            // Wait 2 seconds to show success message, then redirect
            setTimeout(() => {
                if (onSignUpComplete) {
                    onSignUpComplete();
                } else {
                    navigate('/dashboard');
                }
            }, 2000);

        } catch (error: any) {
            console.error('❌ [HR Sign Up] Error:', error);

            // User-friendly error messages
            let errorMessage = 'Sign up failed. Please try again.';

            if (error.code === 'auth/email-already-in-use') {
                errorMessage = 'This email is already registered. Please use the login page instead.';
            } else if (error.code === 'auth/invalid-email') {
                errorMessage = 'Invalid email address format';
            } else if (error.code === 'auth/weak-password') {
                errorMessage = 'Password is too weak. Use at least 6 characters.';
            } else if (error.code === 'auth/network-request-failed') {
                errorMessage = 'Network error. Please check your connection.';
            }

            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    // Success screen
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
                            <p className="text-gray-600 mb-4">
                                Welcome to {companyName || 'your company'}'s HR Platform!
                            </p>
                            <p className="text-sm text-gray-500">
                                Redirecting to dashboard...
                            </p>
                            <Loader className="w-6 h-6 animate-spin mx-auto mt-4 text-blue-600" />
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    // Sign up form
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 p-4">
            <Card className="w-full max-w-md">
                <CardHeader className="space-y-2 text-center">
                    <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                        <UserPlus className="w-8 h-8 text-blue-600" />
                    </div>
                    <CardTitle className="text-2xl font-bold">Create HR Account</CardTitle>
                    <CardDescription>
                        {companyName ? (
                            <>Set up your administrator account for <strong>{companyName}</strong></>
                        ) : (
                            'Set up your HR administrator account'
                        )}
                    </CardDescription>
                </CardHeader>

                <CardContent>
                    <form onSubmit={handleSignUp} className="space-y-4">
                        {error && (
                            <Alert variant="destructive">
                                <AlertCircle className="h-4 w-4" />
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                        )}

                        <div className="space-y-2">
                            <Label htmlFor="fullName">Full Name</Label>
                            <Input
                                id="fullName"
                                name="fullName"
                                type="text"
                                placeholder="John Doe"
                                value={formData.fullName}
                                onChange={handleInputChange}
                                disabled={isLoading}
                                required
                                autoComplete="name"
                                className="w-full"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="email">Email Address</Label>
                            <Input
                                id="email"
                                name="email"
                                type="email"
                                placeholder="hr@company.com"
                                value={formData.email}
                                onChange={handleInputChange}
                                disabled={isLoading}
                                required
                                autoComplete="email"
                                className="w-full"
                            />
                            <p className="text-xs text-gray-500">
                                This will be your login email
                            </p>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <Input
                                id="password"
                                name="password"
                                type="password"
                                placeholder="Create a secure password"
                                value={formData.password}
                                onChange={handleInputChange}
                                disabled={isLoading}
                                required
                                autoComplete="new-password"
                                className="w-full"
                            />
                            <p className="text-xs text-gray-500">
                                At least 6 characters
                            </p>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="confirmPassword">Confirm Password</Label>
                            <Input
                                id="confirmPassword"
                                name="confirmPassword"
                                type="password"
                                placeholder="Confirm your password"
                                value={formData.confirmPassword}
                                onChange={handleInputChange}
                                disabled={isLoading}
                                required
                                autoComplete="new-password"
                                className="w-full"
                            />
                        </div>

                        <Button
                            type="submit"
                            className="w-full"
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <>
                                    <Loader className="mr-2 h-4 w-4 animate-spin" />
                                    Creating Account...
                                </>
                            ) : (
                                'Create HR Account'
                            )}
                        </Button>

                        <div className="text-center mt-4">
                            <p className="text-sm text-gray-500">
                                Already have an account?{' '}
                                <button
                                    type="button"
                                    onClick={() => navigate('/login')}
                                    className="text-blue-600 hover:underline"
                                    disabled={isLoading}
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

export default HrSignUp;

