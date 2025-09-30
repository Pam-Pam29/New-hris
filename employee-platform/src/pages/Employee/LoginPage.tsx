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
import { authService, LoginCredentials } from './services/authService';

const LoginPage: React.FC = () => {
    const navigate = useNavigate();
    const [loginMethod, setLoginMethod] = useState<'work_email' | 'employee_id'>('work_email');
    const [identifier, setIdentifier] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        // Check if user is already authenticated
        // This would typically check Firebase auth state
        const checkAuthState = async () => {
            // Implementation would check Firebase auth state
            // For now, we'll assume user needs to login
        };

        checkAuthState();
    }, []);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!identifier || !password) {
            setError('Please fill in all fields');
            return;
        }

        setIsLoading(true);
        setError('');

        try {
            const credentials: LoginCredentials = {
                identifier,
                password,
                loginMethod
            };

            let result;

            if (loginMethod === 'work_email') {
                result = await authService.loginWithWorkEmail(identifier, password);
            } else {
                result = await authService.loginWithEmployeeId(identifier, password);
            }

            if (result.success && result.employeeId) {
                setIsAuthenticated(true);

                // Check if onboarding is complete
                const onboardingStatus = await authService.checkOnboardingStatus(result.employeeId);

                if (onboardingStatus.isComplete) {
                    navigate('/dashboard');
                } else {
                    navigate('/onboarding');
                }
            } else {
                setError(result.error || 'Invalid credentials');
            }
        } catch (error: any) {
            setError(error.message || 'An unexpected error occurred');
        } finally {
            setIsLoading(false);
        }
    };

    const handleForgotPassword = async () => {
        if (!identifier) {
            setError('Please enter your email address first');
            return;
        }

        try {
            const success = await authService.resetPassword(identifier);
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
                    {/* Login Method Toggle */}
                    <div className="flex space-x-2 p-1 bg-gray-100 rounded-lg">
                        <button
                            type="button"
                            onClick={() => setLoginMethod('work_email')}
                            className={`flex-1 flex items-center justify-center space-x-2 py-2 px-4 rounded-md text-sm font-medium transition-colors ${loginMethod === 'work_email'
                                ? 'bg-white text-blue-600 shadow-sm'
                                : 'text-gray-600 hover:text-gray-900'
                                }`}
                        >
                            <Mail className="w-4 h-4" />
                            <span>Work Email</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => setLoginMethod('employee_id')}
                            className={`flex-1 flex items-center justify-center space-x-2 py-2 px-4 rounded-md text-sm font-medium transition-colors ${loginMethod === 'employee_id'
                                ? 'bg-white text-blue-600 shadow-sm'
                                : 'text-gray-600 hover:text-gray-900'
                                }`}
                        >
                            <User className="w-4 h-4" />
                            <span>Employee ID</span>
                        </button>
                    </div>

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
                            <Label htmlFor="identifier">
                                {loginMethod === 'work_email' ? 'Work Email' : 'Employee ID'}
                            </Label>
                            <div className="relative">
                                <Input
                                    id="identifier"
                                    type={loginMethod === 'work_email' ? 'email' : 'text'}
                                    value={identifier}
                                    onChange={(e) => setIdentifier(e.target.value)}
                                    placeholder={
                                        loginMethod === 'work_email'
                                            ? 'Enter your work email'
                                            : 'Enter your employee ID'
                                    }
                                    required
                                    className="pl-10"
                                />
                                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                                    {loginMethod === 'work_email' ? (
                                        <Mail className="w-4 h-4" />
                                    ) : (
                                        <User className="w-4 h-4" />
                                    )}
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
                            disabled={isLoading || !identifier || !password}
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

                    {/* Help Text */}
                    <div className="text-center">
                        <p className="text-xs text-gray-500">
                            Need help? Contact HR at{' '}
                            <a href="mailto:hr@company.com" className="text-blue-600 hover:underline">
                                hr@company.com
                            </a>
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default LoginPage;
