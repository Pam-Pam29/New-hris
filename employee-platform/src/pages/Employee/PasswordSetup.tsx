import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { Loader, CheckCircle, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { authService } from './services/authService';

const PasswordSetupPage: React.FC = () => {
    const { employeeId, token } = useParams<{ employeeId: string; token: string }>();
    const navigate = useNavigate();

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const validatePassword = (password: string): string[] => {
        const errors: string[] = [];

        if (password.length < 8) {
            errors.push('Password must be at least 8 characters long');
        }

        if (!/[A-Z]/.test(password)) {
            errors.push('Password must contain at least one uppercase letter');
        }

        if (!/[a-z]/.test(password)) {
            errors.push('Password must contain at least one lowercase letter');
        }

        if (!/\d/.test(password)) {
            errors.push('Password must contain at least one number');
        }

        if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
            errors.push('Password must contain at least one special character');
        }

        return errors;
    };

    const handlePasswordSetup = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!employeeId || !token) {
            setError('Invalid setup link');
            return;
        }

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        const passwordErrors = validatePassword(password);
        if (passwordErrors.length > 0) {
            setError(passwordErrors.join('. '));
            return;
        }

        setIsLoading(true);
        setError('');

        try {
            const result = await authService.setupInitialPassword(employeeId, token, password);

            if (result.success) {
                setSuccess(true);

                // Auto-login and redirect to onboarding after 2 seconds
                setTimeout(async () => {
                    const loginResult = await authService.loginWithEmployeeId(employeeId, password);
                    if (loginResult.success) {
                        navigate('/employee/onboarding');
                    }
                }, 2000);
            } else {
                setError(result.error || 'Setup failed');
            }
        } catch (error: any) {
            setError(error.message || 'An unexpected error occurred');
        } finally {
            setIsLoading(false);
        }
    };

    if (success) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50">
                <Card className="w-full max-w-md">
                    <CardHeader className="text-center">
                        <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                            <CheckCircle className="w-8 h-8 text-green-600" />
                        </div>
                        <CardTitle className="text-2xl text-green-800">Password Set Successfully!</CardTitle>
                        <CardDescription>
                            Your account has been created. Redirecting to onboarding...
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="text-center">
                        <Loader className="w-6 h-6 animate-spin mx-auto text-blue-600" />
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
                        <CheckCircle className="w-8 h-8 text-blue-600" />
                    </div>
                    <CardTitle className="text-2xl">Welcome to [Company]!</CardTitle>
                    <CardDescription>
                        Set up your password to complete your account setup
                    </CardDescription>
                </CardHeader>

                <CardContent className="space-y-6">
                    {employeeId && (
                        <div className="bg-blue-50 p-3 rounded-lg">
                            <p className="text-sm text-blue-800">
                                <strong>Employee ID:</strong> {employeeId}
                            </p>
                        </div>
                    )}

                    {error && (
                        <Alert variant="destructive">
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}

                    <form onSubmit={handlePasswordSetup} className="space-y-4">
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
                                    className="pr-10"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="confirmPassword">Confirm Password</Label>
                            <div className="relative">
                                <Input
                                    id="confirmPassword"
                                    type={showConfirmPassword ? 'text' : 'password'}
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder="Confirm your password"
                                    required
                                    className="pr-10"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>

                        <div className="bg-gray-50 p-3 rounded-lg">
                            <p className="text-xs text-gray-600 mb-2">Password requirements:</p>
                            <ul className="text-xs text-gray-600 space-y-1">
                                <li className={password.length >= 8 ? 'text-green-600' : ''}>
                                    • At least 8 characters
                                </li>
                                <li className={/[A-Z]/.test(password) ? 'text-green-600' : ''}>
                                    • One uppercase letter
                                </li>
                                <li className={/[a-z]/.test(password) ? 'text-green-600' : ''}>
                                    • One lowercase letter
                                </li>
                                <li className={/\d/.test(password) ? 'text-green-600' : ''}>
                                    • One number
                                </li>
                                <li className={/[!@#$%^&*(),.?":{}|<>]/.test(password) ? 'text-green-600' : ''}>
                                    • One special character
                                </li>
                            </ul>
                        </div>

                        <Button
                            type="submit"
                            className="w-full"
                            disabled={isLoading || !password || !confirmPassword}
                        >
                            {isLoading ? (
                                <span className="flex items-center">
                                    <Loader className="w-4 h-4 mr-2 animate-spin" />
                                    Setting up account...
                                </span>
                            ) : (
                                'Set Password & Continue'
                            )}
                        </Button>
                    </form>

                    <div className="text-center">
                        <p className="text-xs text-gray-500">
                            By setting up your password, you agree to our Terms of Service and Privacy Policy.
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default PasswordSetupPage;

