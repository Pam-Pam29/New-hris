import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Alert, AlertDescription } from '../../components/ui/alert';
import {
    Mail,
    User,
    Lock,
    Eye,
    EyeOff,
    AlertCircle,
    Loader,
    Building
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCompany } from '../../context/CompanyContext';

const LoginPage: React.FC = () => {
    const navigate = useNavigate();
    const { login, isAuthenticated, currentEmployee, loading: authLoading } = useAuth();
    const { company } = useCompany();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        // If already logged in, redirect based on onboarding status
        if (isAuthenticated && currentEmployee) {
            console.log('✅ [Login] Already authenticated, redirecting...');

            if (currentEmployee.onboardingStatus === 'completed') {
                navigate('/dashboard', { replace: true });
            } else {
                navigate('/onboarding', { replace: true });
            }
        }
    }, [isAuthenticated, currentEmployee, navigate]);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!email || !password) {
            setError('Please enter both email and password');
            return;
        }

        setIsLoading(true);
        setError('');

        try {
            console.log('🔐 [Login] Attempting login for:', email);

            const result = await login(email, password);

            if (result.success) {
                console.log('✅ [Login] Login successful!');
                // Redirect will happen automatically via useEffect above
            } else {
                setError(result.error || 'Invalid email or password');
            }
        } catch (error: any) {
            console.error('❌ [Login] Error:', error);
            setError('Login failed. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleForgotPassword = async () => {
        if (!email) {
            setError('Please enter your email address first');
            return;
        }

        try {
            // TODO: Implement password reset
            const success = false; // await authService.resetPassword(email);
            if (success) {
                setError('Password reset email sent. Please check your inbox.');
            } else {
                setError('Failed to send password reset email');
            }
        } catch (error) {
            setError('Failed to send password reset email');
        }
    };

    if (isAuthenticated) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50">
                <Card className="w-full max-w-md">
                    <CardContent className="flex items-center justify-center py-8">
                        <div className="text-center">
                            <Loader className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
                            <p>Redirecting to your dashboard...</p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
            <Card className="w-full max-w-md">
                <CardHeader className="text-center">
                    <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                        <Building className="w-8 h-8 text-blue-600" />
                    </div>
                    <CardTitle className="text-2xl">Employee Portal</CardTitle>
                    <CardDescription>
                        Sign in to access your employee dashboard
                    </CardDescription>
                </CardHeader>

                <CardContent className="space-y-6">
                    {/* Error Display */}
                    {error && (
                        <Alert variant="destructive">
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}

                    {/* Login Form */}
                    <form onSubmit={handleLogin} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email">
                                Work Email
                            </Label>
                            <div className="relative">
                                <Input
                                    id="email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="Enter your work email"
                                    required
                                    className="pl-10"
                                />
                                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                                    <Mail className="w-4 h-4" />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <div className="relative">
                                <Input
                                    id="password"
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Enter your password"
                                    required
                                    className="pl-10 pr-10"
                                />
                                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                                    <Lock className="w-4 h-4" />
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>

                        <Button
                            type="submit"
                            className="w-full"
                            disabled={isLoading || !email || !password}
                        >
                            {isLoading ? (
                                <span className="flex items-center">
                                    <Loader className="w-4 h-4 mr-2 animate-spin" />
                                    Signing in...
                                </span>
                            ) : (
                                'Sign In'
                            )}
                        </Button>
                    </form>

                    {/* Forgot Password */}
                    <div className="text-center">
                        <button
                            type="button"
                            onClick={handleForgotPassword}
                            className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
                        >
                            Forgot your password?
                        </button>
                    </div>

                    {/* Setup Link Info */}
                    <div className="text-center">
                        <p className="text-sm text-gray-600">
                            Need to set up your account?{' '}
                            <span className="text-gray-500">
                                Contact HR for your setup link
                            </span>
                        </p>
                    </div>

                    {/* Help Text */}
                    <div className="text-center">
                        <p className="text-xs text-gray-500">
                            Need help? Contact HR at{' '}
                            <a href={`mailto:hr@${company?.domain || 'company.com'}`} className="text-blue-600 hover:underline">
                                hr@{company?.domain || 'company.com'}
                            </a>
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default LoginPage;
