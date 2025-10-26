import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import {
    User,
    Calendar,
    Clock,
    FileText,
    DollarSign,
    Settings,
    LogOut,
    CheckCircle,
    ArrowRight
} from 'lucide-react';

const EmployeeDashboardPage: React.FC = () => {
    const navigate = useNavigate();

    const handleLogout = () => {
        navigate('/employee/login');
    };

    const quickActions = [
        {
            title: 'View Profile',
            description: 'Update your personal information',
            icon: User,
            color: 'bg-blue-500',
            href: '#'
        },
        {
            title: 'Leave Management',
            description: 'Request and track your leave',
            icon: Calendar,
            color: 'bg-green-500',
            href: '#'
        },
        {
            title: 'Time Tracking',
            description: 'Log your work hours',
            icon: Clock,
            color: 'bg-purple-500',
            href: '#'
        },
        {
            title: 'Policies',
            description: 'View company policies',
            icon: FileText,
            color: 'bg-orange-500',
            href: '#'
        },
        {
            title: 'Payroll',
            description: 'View your salary details',
            icon: DollarSign,
            color: 'bg-emerald-500',
            href: '#'
        },
        {
            title: 'Settings',
            description: 'Account and preferences',
            icon: Settings,
            color: 'bg-gray-500',
            href: '#'
        }
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
            {/* Header */}
            <header className="bg-white shadow-sm border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <h1 className="text-xl font-bold text-green-800">Employee Portal</h1>
                            </div>
                        </div>
                        <div className="flex items-center space-x-4">
                            <Button
                                variant="outline"
                                onClick={handleLogout}
                                className="flex items-center space-x-2"
                            >
                                <LogOut className="h-4 w-4" />
                                <span>Logout</span>
                            </Button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Welcome Section */}
                <div className="mb-8">
                    <div className="flex items-center space-x-3 mb-4">
                        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                            <User className="w-6 h-6 text-green-600" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Welcome back!</h1>
                            <p className="text-gray-600">Here's what's happening with your account today.</p>
                        </div>
                    </div>

                    <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center space-x-3">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                        <div>
                            <p className="text-green-800 font-medium">Account Successfully Set Up!</p>
                            <p className="text-green-600 text-sm">Your employee account is now active and ready to use.</p>
                        </div>
                    </div>
                </div>

                {/* Quick Actions Grid */}
                <div className="mb-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Quick Actions</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {quickActions.map((action, index) => (
                            <Card key={index} className="hover:shadow-lg transition-shadow duration-200 cursor-pointer group">
                                <CardHeader className="pb-3">
                                    <div className="flex items-center space-x-3">
                                        <div className={`w-10 h-10 ${action.color} rounded-lg flex items-center justify-center`}>
                                            <action.icon className="w-5 h-5 text-white" />
                                        </div>
                                        <div className="flex-1">
                                            <CardTitle className="text-lg group-hover:text-green-600 transition-colors">
                                                {action.title}
                                            </CardTitle>
                                        </div>
                                        <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-green-600 transition-colors" />
                                    </div>
                                </CardHeader>
                                <CardContent className="pt-0">
                                    <CardDescription className="text-gray-600">
                                        {action.description}
                                    </CardDescription>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>

                {/* Recent Activity */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Recent Activity</CardTitle>
                            <CardDescription>Your latest account activities</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                                    <CheckCircle className="w-5 h-5 text-green-600" />
                                    <div>
                                        <p className="text-sm font-medium text-green-800">Account Created</p>
                                        <p className="text-xs text-green-600">Your employee account was successfully set up</p>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                                    <User className="w-5 h-5 text-blue-600" />
                                    <div>
                                        <p className="text-sm font-medium text-blue-800">Profile Setup</p>
                                        <p className="text-xs text-blue-600">Complete your profile to get started</p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Getting Started</CardTitle>
                            <CardDescription>Next steps for your account</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                <div className="flex items-center space-x-3">
                                    <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                                        <CheckCircle className="w-4 h-4 text-green-600" />
                                    </div>
                                    <span className="text-sm text-gray-600">Set up your password</span>
                                </div>
                                <div className="flex items-center space-x-3">
                                    <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center">
                                        <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                                    </div>
                                    <span className="text-sm text-gray-600">Complete your profile</span>
                                </div>
                                <div className="flex items-center space-x-3">
                                    <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center">
                                        <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                                    </div>
                                    <span className="text-sm text-gray-600">Review company policies</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </main>
        </div>
    );
};

export default EmployeeDashboardPage;
