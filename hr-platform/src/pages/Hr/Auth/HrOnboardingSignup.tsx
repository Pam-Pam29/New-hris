import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAuth, createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { getFirebaseDb } from '../../../config/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Alert, AlertDescription } from '../../../components/ui/alert';
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

const HrOnboardingSignup: React.FC = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        confirmPassword: '',
        companyName: '',
        companySize: '',
        jobTitle: ''
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

        // Validate form
        if (!formData.firstName || !formData.lastName || !formData.email || !formData.password) {
            setError('Please fill in all required fields');
            return;
        }

        if (formData.password.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        setIsLoading(true);
        setError('');

        try {
            console.log('🚀 HR Onboarding Signup - Creating Firebase user');
            console.log('Form data:', { email: formData.email, firstName: formData.firstName, lastName: formData.lastName });

            const auth = getAuth();

            // Create user in Firebase Authentication
            const userCredential = await createUserWithEmailAndPassword(
                auth,
                formData.email,
                formData.password
            );

            const user = userCredential.user;
            console.log('✅ Firebase user created:', user.uid);

            // Update user profile with display name
            await updateProfile(user, {
                displayName: `${formData.firstName} ${formData.lastName}`
            });

            // Create HR user document in Firestore
            const db = getFirebaseDb();
            const hrUserData = {
                uid: user.uid,
                email: formData.email,
                firstName: formData.firstName,
                lastName: formData.lastName,
                fullName: `${formData.firstName} ${formData.lastName}`,
                companyName: formData.companyName || '',
                companySize: formData.companySize || '',
                jobTitle: formData.jobTitle || '',
                role: 'hr',
                createdAt: new Date(),
                updatedAt: new Date()
            };

            await setDoc(doc(db, 'hrUsers', user.uid), hrUserData);
            console.log('✅ HR user document created in Firestore');

            // Set company ID to user ID temporarily (will be updated during onboarding)
            localStorage.setItem('companyId', user.uid);

            console.log('✅ HR Signup successful - user authenticated');
            
            // Redirect to onboarding
            navigate('/onboarding', { replace: true });
        } catch (error: any) {
            console.error('❌ HR Signup error:', error);
            
            let errorMessage = 'Signup failed. Please try again.';
            if (error.code === 'auth/email-already-in-use') {
                errorMessage = 'This email is already registered. Please sign in instead.';
            } else if (error.code === 'auth/invalid-email') {
                errorMessage = 'Invalid email address. Please check and try again.';
            } else if (error.code === 'auth/weak-password') {
                errorMessage = 'Password is too weak. Please use a stronger password.';
            } else if (error.message) {
                errorMessage = error.message;
            }
            
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSignIn = () => {
        navigate('/hr-onboarding-signin', { replace: true });
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
            <Card className="w-full max-w-md">
                <CardHeader className="text-center">
                    <div className="flex items-center justify-center mb-4">
                        <Building className="w-12 h-12 text-blue-600" />
                    </div>
                    <CardTitle className="text-2xl font-bold text-gray-900">
                        HR Onboarding Signup
                    </CardTitle>
                    <CardDescription className="text-gray-600">
                        Create your HR account to get started
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
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="firstName">First Name</Label>
                                <Input
                                    id="firstName"
                                    name="firstName"
                                    type="text"
                                    value={formData.firstName}
                                    onChange={handleInputChange}
                                    placeholder="John"
                                />
                            </div>
                            <div>
                                <Label htmlFor="lastName">Last Name</Label>
                                <Input
                                    id="lastName"
                                    name="lastName"
                                    type="text"
                                    value={formData.lastName}
                                    onChange={handleInputChange}
                                    placeholder="Doe"
                                />
                            </div>
                        </div>

                        <div>
                            <Label htmlFor="email">Email Address</Label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
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
                            <Label htmlFor="companyName">Company Name</Label>
                            <Input
                                id="companyName"
                                name="companyName"
                                type="text"
                                value={formData.companyName}
                                onChange={handleInputChange}
                                placeholder="Your Company Inc."
                            />
                        </div>

                        <div>
                            <Label htmlFor="companySize">Company Size</Label>
                            <Input
                                id="companySize"
                                name="companySize"
                                type="text"
                                value={formData.companySize}
                                onChange={handleInputChange}
                                placeholder="e.g., 1-10, 11-50, 51-200, 200+"
                            />
                        </div>

                        <div>
                            <Label htmlFor="jobTitle">Job Title</Label>
                            <Input
                                id="jobTitle"
                                name="jobTitle"
                                type="text"
                                value={formData.jobTitle}
                                onChange={handleInputChange}
                                placeholder="HR Manager"
                            />
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
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <>
                                    <Loader className="w-4 h-4 mr-2 animate-spin" />
                                    Creating Account...
                                </>
                            ) : (
                                <>
                                    Create Account
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
                                className="text-blue-600 hover:text-blue-700 font-medium"
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

export default HrOnboardingSignup;
