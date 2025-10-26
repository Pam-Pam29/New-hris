import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
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
    Building,
    ArrowRight
} from 'lucide-react';

const EmployeeSignup: React.FC = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    // Check if this is a setup link (has employeeId and token)
    const employeeId = searchParams.get('id');
    const setupToken = searchParams.get('token');
    const isSetupLink = !!(employeeId && setupToken);

    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Basic validation
        if (!formData.password || !formData.confirmPassword) {
            setError('Please fill in all password fields');
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (formData.password.length < 6) {
            setError('Password must be at least 6 characters long');
            return;
        }

        console.log('🚀 Employee Signup - Processing signup');
        console.log('Form data:', formData);
        console.log('Is setup link:', isSetupLink);
        console.log('Employee ID:', employeeId);
        console.log('Setup token:', setupToken);

        setIsLoading(true);
        setError('');

        try {
            if (isSetupLink) {
                // This is a setup link from HR - process the password setup
                console.log('🔗 Processing password setup for employee:', employeeId);
                // TODO: Implement actual password setup logic with employeeId and token
                // For now, simulate the setup process
                await new Promise(resolve => setTimeout(resolve, 2000));
                console.log('✅ Password setup successful - redirecting to login');
                navigate('/login', { replace: true });
            } else {
                // This should not happen - no regular signup allowed
                console.log('❌ Regular signup not allowed - redirecting to login');
                navigate('/login', { replace: true });
            }
        } catch (error) {
            console.error('❌ Employee Signup error:', error);
            setError('Setup failed. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSignIn = () => {
        navigate('/login', { replace: true });
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50">
            <Card className="w-full max-w-md">
                <CardHeader className="text-center">
                    <div className="flex items-center justify-center mb-4">
                        <Building className="w-12 h-12 text-green-600" />
                    </div>
                    <CardTitle className="text-2xl font-bold text-gray-900">
                        Create Your Password
                    </CardTitle>
                    <CardDescription className="text-gray-600">
                        Your employee profile has been created. Please set up your password to access your account.
                    </CardDescription>
                </CardHeader>

                <CardContent>
                    {error && (
                        <Alert className="mb-4" variant="destructive">
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="text-center mb-6 p-4 bg-green-50 rounded-lg">
                            <p className="text-sm text-green-800">
                                <strong>Welcome to the team!</strong> Your employee profile has been created by HR.
                                Please create a secure password to access your account.
                            </p>
                            {employeeId && (
                                <p className="text-xs text-green-600 mt-2">
                                    Employee ID: {employeeId}
                                </p>
                            )}
                        </div>

                        <div>
                            <Label htmlFor="password">Password</Label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
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
                                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                                >
                                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                            </div>
                        </div>

                        <div>
                            <Label htmlFor="confirmPassword">Confirm Password</Label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                <Input
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    type={showConfirmPassword ? 'text' : 'password'}
                                    value={formData.confirmPassword}
                                    onChange={handleInputChange}
                                    placeholder="Confirm your password"
                                    className="pl-10 pr-10"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                                >
                                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                            </div>
                        </div>

                        <Button
                            type="submit"
                            className="w-full bg-green-600 hover:bg-green-700 text-white"
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <>
                                    <Loader className="w-4 h-4 mr-2 animate-spin" />
                                    Creating Password...
                                </>
                            ) : (
                                <>
                                    Create Password
                                    <ArrowRight className="w-4 h-4 ml-2" />
                                </>
                            )}
                        </Button>
                    </form>

                    <div className="mt-6 text-center">
                        <p className="text-sm text-gray-600">
                            Already have an account?{' '}
                            <button
                                onClick={handleSignIn}
                                className="text-green-600 hover:text-green-700 font-medium"
                            >
                                Sign In
                            </button>
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default EmployeeSignup;
