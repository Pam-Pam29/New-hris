import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAuth, signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { getFirebaseDb } from '../../../config/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Alert, AlertDescription } from '../../../components/ui/alert';
import {
    Mail,
    Lock,
    Eye,
    EyeOff,
    AlertCircle,
    Loader,
    Building,
    ArrowRight,
    CheckCircle
} from 'lucide-react';

const HrOnboardingSignin: React.FC = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isResettingPassword, setIsResettingPassword] = useState(false);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.email || !formData.password) {
            setError('Please enter both email and password');
            return;
        }

        setIsLoading(true);
        setError('');

        try {
            console.log('🚀 HR Onboarding Signin - Authenticating with Firebase');
            console.log('Form data:', { email: formData.email });

            const auth = getAuth();

            // Sign in with Firebase
            const userCredential = await signInWithEmailAndPassword(
                auth,
                formData.email,
                formData.password
            );

            const user = userCredential.user;
            console.log('✅ Firebase authentication successful:', user.uid);

            // Load company ID from hrUsers collection
            const db = getFirebaseDb();
            const hrUserDoc = await getDoc(doc(db, 'hrUsers', user.uid));
            
            let companyId = user.uid; // Default to user ID if no company found
            
            if (hrUserDoc.exists()) {
                const hrUserData = hrUserDoc.data();
                // Try to find company ID from hrUser document or use user ID
                if (hrUserData.companyId) {
                    companyId = hrUserData.companyId;
                }
            }

            // Set company ID in localStorage
            localStorage.setItem('companyId', companyId);
            console.log('✅ Company ID set:', companyId);

            // Trigger company context reload
            window.dispatchEvent(new CustomEvent('companyIdChanged'));

            console.log('✅ HR Signin successful - redirecting to onboarding');
            
            // Redirect to onboarding
            navigate('/onboarding', { replace: true });
        } catch (error: any) {
            console.error('❌ HR Signin error:', error);
            
            let errorMessage = 'Signin failed. Please try again.';
            if (error.code === 'auth/invalid-credential' || error.code === 'auth/wrong-password') {
                errorMessage = 'Invalid email or password. Please check your credentials.';
            } else if (error.code === 'auth/user-not-found') {
                errorMessage = 'No account found with this email. Please sign up first.';
            } else if (error.code === 'auth/too-many-requests') {
                errorMessage = 'Too many failed attempts. Please try again later.';
            } else if (error.code === 'auth/network-request-failed') {
                errorMessage = 'Network error. Please check your connection.';
            } else if (error.message) {
                errorMessage = error.message;
            }
            
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSignUp = () => {
        navigate('/hr-onboarding-signup', { replace: true });
    };

    const handleForgotPassword = async () => {
        if (!formData.email) {
            setError('Please enter your email address first');
            setSuccess('');
            return;
        }

        setIsResettingPassword(true);
        setError('');
        setSuccess('');

        try {
            console.log('🔐 [Password Reset] Sending reset email to:', formData.email);
            const auth = getAuth();
            await sendPasswordResetEmail(auth, formData.email);
            
            setSuccess('Password reset email sent! Please check your inbox and follow the instructions to reset your password.');
            console.log('✅ [Password Reset] Email sent successfully');
        } catch (error: any) {
            console.error('❌ [Password Reset] Error:', error);
            let errorMessage = 'Failed to send password reset email. Please try again.';
            
            if (error.code === 'auth/user-not-found') {
                errorMessage = 'No account found with this email address.';
            } else if (error.code === 'auth/invalid-email') {
                errorMessage = 'Invalid email address. Please check and try again.';
            } else if (error.code === 'auth/too-many-requests') {
                errorMessage = 'Too many requests. Please try again later.';
            } else if (error.message) {
                errorMessage = error.message;
            }
            
            setError(errorMessage);
        } finally {
            setIsResettingPassword(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-background">
            <Card className="w-full max-w-md">
                <CardHeader className="text-center">
                    <div className="flex items-center justify-center mb-4">
                        <Building className="w-12 h-12 text-primary" />
                    </div>
                    <CardTitle className="text-2xl font-bold text-foreground">
                        HR Onboarding Signin
                    </CardTitle>
                    <CardDescription className="text-muted-foreground">
                        Welcome back! Sign in to continue
                    </CardDescription>
                </CardHeader>

                <CardContent>
                    {error && (
                        <Alert className="mb-4" variant="destructive">
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}

                    {success && (
                        <Alert className="mb-4" variant="default" style={{ backgroundColor: 'hsl(142 76% 36% / 0.1)', borderColor: 'hsl(142 76% 36%)' }}>
                            <CheckCircle className="h-4 w-4" style={{ color: 'hsl(142 76% 36%)' }} />
                            <AlertDescription style={{ color: 'hsl(142 76% 36%)' }}>{success}</AlertDescription>
                        </Alert>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <Label htmlFor="email">Email Address</Label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="email"
                                    name="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    placeholder="john.doe@company.com"
                                    className="pl-10"
                                />
                            </div>
                        </div>

                        <div>
                            <Label htmlFor="password">Password</Label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="password"
                                    name="password"
                                    type={showPassword ? 'text' : 'password'}
                                    value={formData.password}
                                    onChange={handleInputChange}
                                    placeholder="Enter your password"
                                    className="pl-10 pr-10"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                                >
                                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                            </div>
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <input
                                    id="remember-me"
                                    name="remember-me"
                                    type="checkbox"
                                    className="h-4 w-4 text-primary focus:ring-primary border-border rounded"
                                />
                                <label htmlFor="remember-me" className="ml-2 block text-sm text-foreground">
                                    Remember me
                                </label>
                            </div>
                            <button
                                type="button"
                                onClick={handleForgotPassword}
                                disabled={isResettingPassword}
                                className="text-sm text-primary hover:text-primary/80 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isResettingPassword ? (
                                    <span className="flex items-center">
                                        <Loader className="w-3 h-3 mr-1 animate-spin" />
                                        Sending...
                                    </span>
                                ) : (
                                    'Forgot password?'
                                )}
                            </button>
                        </div>

                        <Button
                            type="submit"
                            className="w-full"
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <>
                                    <Loader className="w-4 h-4 mr-2 animate-spin" />
                                    Signing In...
                                </>
                            ) : (
                                <>
                                    Sign In
                                    <ArrowRight className="w-4 h-4 ml-2" />
                                </>
                            )}
                        </Button>
                    </form>

                    <div className="mt-6 text-center">
                        <p className="text-sm text-muted-foreground">
                            Don't have an account?{' '}
                            <button
                                onClick={handleSignUp}
                                className="text-primary hover:text-primary/80 font-medium"
                            >
                                Sign Up
                            </button>
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default HrOnboardingSignin;
