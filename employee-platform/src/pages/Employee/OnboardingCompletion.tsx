import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Alert, AlertDescription } from '../../components/ui/alert';
import {
    PartyPopper,
    CheckCircle,
    Mail,
    Calendar,
    Users,
    Clock,
    FileText,
    Upload,
    BookOpen,
    Play
} from 'lucide-react';
import { useCompany } from '../../context/CompanyContext';
import { useAuth } from '../../context/AuthContext';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { format, addMonths, startOfMonth, addDays } from 'date-fns';

interface OnboardingCompletionProps {
    employeeId: string;
    onComplete: (data: any) => void;
}

const OnboardingCompletion: React.FC<OnboardingCompletionProps> = ({
    employeeId,
    onComplete
}) => {
    const { company } = useCompany();
    const { currentEmployee } = useAuth();
    const [employeeData, setEmployeeData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadEmployeeData = async () => {
            try {
                const employeeRef = doc(db, 'employees', employeeId);
                const employeeDoc = await getDoc(employeeRef);
                
                if (employeeDoc.exists()) {
                    const data = employeeDoc.data();
                    setEmployeeData(data);
                }
            } catch (error) {
                console.error('Error loading employee data:', error);
            } finally {
                setLoading(false);
            }
        };

        if (employeeId) {
            loadEmployeeData();
        }
    }, [employeeId]);

    // Get work email from employee data
    const workEmail = employeeData?.contactInfo?.workEmail || 
                     employeeData?.workEmail || 
                     currentEmployee?.email || 
                     'Not assigned yet';

    // Calculate next payroll date (assuming monthly payroll, starting from hire date)
    const getNextPayrollDate = () => {
        if (!employeeData?.workInfo?.hireDate) {
            return 'Next pay period';
        }

        try {
            const hireDate = employeeData.workInfo.hireDate.toDate 
                ? employeeData.workInfo.hireDate.toDate() 
                : new Date(employeeData.workInfo.hireDate);
            
            const today = new Date();
            const payFrequency = employeeData.workInfo.salary?.payFrequency || 'Monthly';
            
            if (payFrequency === 'Monthly') {
                // Next month's first day
                const nextPayroll = startOfMonth(addMonths(today, 1));
                return format(nextPayroll, 'MMM dd, yyyy');
            } else if (payFrequency === 'Bi-weekly') {
                // Every 2 weeks from hire date
                const weeksSinceHire = Math.floor((today.getTime() - hireDate.getTime()) / (1000 * 60 * 60 * 24 * 7));
                const nextPayroll = addDays(hireDate, (Math.floor(weeksSinceHire / 2) + 1) * 14);
                return format(nextPayroll, 'MMM dd, yyyy');
            } else if (payFrequency === 'Weekly') {
                // Next week
                const nextPayroll = addDays(today, 7);
                return format(nextPayroll, 'MMM dd, yyyy');
            }
            
            return 'Next pay period';
        } catch (error) {
            return 'Next pay period';
        }
    };

    // Get company support information
    const hrEmail = company?.settings?.supportEmail || 
                   company?.contactEmail || 
                   `hr@${company?.domain || 'company.com'}`;
    
    const itSupport = company?.settings?.itSupportEmail || 
                     company?.settings?.itSupportPhone || 
                     null;
    
    const employeePortalUrl = company?.settings?.employeePlatformUrl || 
                              import.meta.env.VITE_EMPLOYEE_PLATFORM_URL || 
                              window.location.origin;

    const completedSteps = [
        { id: 'welcome', title: 'Welcome Video Watched', icon: Play },
        { id: 'contract_review', title: 'Contract Reviewed', icon: FileText },
        { id: 'contract_upload', title: 'Contract Uploaded', icon: Upload },
        { id: 'system_overview', title: 'System Overview Completed', icon: BookOpen }
    ];

    if (loading) {
        return (
            <div className="space-y-6">
                <Card>
                    <CardContent className="flex items-center justify-center py-8">
                        <div className="text-center">
                            <Clock className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
                            <p>Loading completion details...</p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader className="text-center">
                    <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-4">
                        <PartyPopper className="w-10 h-10 text-green-600" />
                    </div>
                    <CardTitle className="text-3xl text-green-800">Welcome Aboard!</CardTitle>
                    <CardDescription className="text-lg">
                        Congratulations! You have successfully completed your onboarding process.
                    </CardDescription>
                </CardHeader>

                <CardContent className="space-y-6">
                    {/* Completion Summary */}
                    <div className="bg-green-50 p-6 rounded-lg border border-green-200">
                        <h3 className="font-semibold text-green-900 mb-4">Onboarding Complete</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm text-green-800 mb-2">
                                    <strong>Employee ID:</strong> {employeeId}
                                </p>
                                <p className="text-sm text-green-800 mb-2">
                                    <strong>Work Email:</strong> {workEmail}
                                </p>
                                <p className="text-sm text-green-800">
                                    <strong>Onboarding Date:</strong> {new Date().toLocaleDateString()}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-green-800 mb-2">
                                    <strong>Status:</strong> Active Employee
                                </p>
                                <p className="text-sm text-green-800 mb-2">
                                    <strong>Access Level:</strong> Full Employee Portal
                                </p>
                                <p className="text-sm text-green-800">
                                    <strong>Next Payroll:</strong> {getNextPayrollDate()}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Completed Steps */}
                    <div className="space-y-4">
                        <h3 className="font-semibold text-gray-900">Completed Steps</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {completedSteps.map((step) => {
                                const Icon = step.icon;
                                return (
                                    <div key={step.id} className="flex items-center space-x-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                                        <CheckCircle className="w-5 h-5 text-green-600" />
                                        <Icon className="w-4 h-4 text-green-600" />
                                        <span className="text-sm font-medium text-green-800">{step.title}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* What's Next */}
                    <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
                        <h3 className="font-semibold text-blue-900 mb-4">What's Next?</h3>
                        <div className="space-y-3">
                            <div className="flex items-start space-x-3">
                                <Mail className="w-5 h-5 text-blue-600 mt-0.5" />
                                <div>
                                    <p className="font-medium text-blue-900">Welcome Email</p>
                                    <p className="text-sm text-blue-800">
                                        You'll receive a welcome email with your work email credentials and next steps.
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start space-x-3">
                                <Calendar className="w-5 h-5 text-blue-600 mt-0.5" />
                                <div>
                                    <p className="font-medium text-blue-900">First Day</p>
                                    <p className="text-sm text-blue-800">
                                        Your manager will contact you to schedule your first day and orientation.
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start space-x-3">
                                <Users className="w-5 h-5 text-blue-600 mt-0.5" />
                                <div>
                                    <p className="font-medium text-blue-900">Team Introduction</p>
                                    <p className="text-sm text-blue-800">
                                        You'll be introduced to your team and given access to necessary systems.
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start space-x-3">
                                <Clock className="w-5 h-5 text-blue-600 mt-0.5" />
                                <div>
                                    <p className="font-medium text-blue-900">Work Schedule</p>
                                    <p className="text-sm text-blue-800">
                                        Your work schedule and reporting structure will be confirmed.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Important Information */}
                    <Alert className="border-yellow-200 bg-yellow-50">
                        <CheckCircle className="h-4 w-4 text-yellow-600" />
                        <AlertDescription className="text-yellow-800">
                            <strong>Important:</strong> Please save your work email address and employee ID.
                            You'll need these to access the employee portal and company systems.
                        </AlertDescription>
                    </Alert>

                    {/* Contact Information */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="font-medium text-gray-900 mb-2">Need Help?</h4>
                        <div className="text-sm text-gray-600 space-y-1">
                            <p>
                                • HR Department:{' '}
                                <a
                                    href={`mailto:${hrEmail}`}
                                    className="text-blue-600 hover:underline"
                                >
                                    {hrEmail}
                                </a>
                            </p>
                            {itSupport && (
                                <p>
                                    • IT Support:{' '}
                                    {company?.settings?.itSupportEmail && (
                                        <a
                                            href={`mailto:${company.settings.itSupportEmail}`}
                                            className="text-blue-600 hover:underline"
                                        >
                                            {company.settings.itSupportEmail}
                                        </a>
                                    )}
                                    {company?.settings?.itSupportPhone && (
                                        <span> | {company.settings.itSupportPhone}</span>
                                    )}
                                </p>
                            )}
                            <p>
                                • Employee Portal:{' '}
                                <a
                                    href={employeePortalUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-600 hover:underline"
                                >
                                    {employeePortalUrl.replace(/^https?:\/\//, '')}
                                </a>
                            </p>
                        </div>
                    </div>

                    {/* Final Action */}
                    <div className="text-center">
                        <Button
                            onClick={() => onComplete({ onboardingComplete: true })}
                            size="lg"
                            className="px-12 py-3"
                        >
                            Access Employee Portal
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default OnboardingCompletion;
