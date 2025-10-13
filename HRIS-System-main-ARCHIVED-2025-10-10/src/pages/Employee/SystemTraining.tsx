import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Alert, AlertDescription } from '../../components/ui/alert';
import {
    BookOpen,
    CheckCircle,
    AlertCircle,
    Loader,
    Play,
    Users,
    Clock,
    Shield,
    Mail,
    Calendar,
    FileText,
    User
} from 'lucide-react';

interface SystemTrainingProps {
    employeeId: string;
    onComplete: (data: any) => void;
}

interface TrainingModule {
    id: string;
    title: string;
    description: string;
    duration: string;
    completed: boolean;
    icon: React.ComponentType<any>;
}

const SystemTraining: React.FC<SystemTrainingProps> = ({
    employeeId,
    onComplete
}) => {
    const [trainingModules, setTrainingModules] = useState<TrainingModule[]>([
        {
            id: 'overview',
            title: 'Employee Portal Overview',
            description: 'Learn about the main features and navigation of the employee portal',
            duration: '5 minutes',
            completed: false,
            icon: Users
        },
        {
            id: 'profile',
            title: 'Profile Management',
            description: 'How to update your personal information and manage your profile',
            duration: '3 minutes',
            completed: false,
            icon: User
        },
        {
            id: 'leave',
            title: 'Leave Management',
            description: 'Request time off, view leave balances, and track approval status',
            duration: '4 minutes',
            completed: false,
            icon: Calendar
        },
        {
            id: 'time',
            title: 'Time Tracking',
            description: 'Clock in/out, manage timesheets, and track work hours',
            duration: '4 minutes',
            completed: false,
            icon: Clock
        },
        {
            id: 'payroll',
            title: 'Payroll & Compensation',
            description: 'View pay slips, manage benefits, and submit financial requests',
            duration: '5 minutes',
            completed: false,
            icon: FileText
        },
        {
            id: 'security',
            title: 'Security & Privacy',
            description: 'Best practices for keeping your account secure and data private',
            duration: '3 minutes',
            completed: false,
            icon: Shield
        }
    ]);

    const [currentModule, setCurrentModule] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const completeModule = (moduleId: string) => {
        setTrainingModules(prev => prev.map(module => {
            if (module.id === moduleId) {
                return { ...module, completed: true };
            }
            return module;
        }));
        setCurrentModule(null);
    };

    const handleComplete = async () => {
        const allCompleted = trainingModules.every(module => module.completed);

        if (!allCompleted) {
            onError('Please complete all training modules before continuing');
            return;
        }

        setIsLoading(true);

        try {
            onComplete({ trainingCompleted: true });
        } catch (error) {
            onError('Failed to save training completion');
        } finally {
            setIsLoading(false);
        }
    };

    const handleFinish = () => {
        onComplete({ trainingCompleted: true });
    };

    const completedCount = trainingModules.filter(module => module.completed).length;
    const totalCount = trainingModules.length;

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                        <BookOpen className="h-5 w-5" />
                        <span>System Training</span>
                    </CardTitle>
                    <CardDescription>
                        Complete the training modules to learn about the employee portal features and functionality.
                    </CardDescription>
                </CardHeader>

                <CardContent className="space-y-6">
                    {/* Progress Overview */}
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                        <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium text-blue-900">Training Progress</h4>
                            <span className="text-sm text-blue-700">
                                {completedCount} of {totalCount} modules completed
                            </span>
                        </div>
                        <div className="w-full bg-blue-200 rounded-full h-2">
                            <div
                                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${(completedCount / totalCount) * 100}%` }}
                            />
                        </div>
                    </div>

                    {/* Training Modules */}
                    <div className="space-y-4">
                        {trainingModules.map((module) => {
                            const Icon = module.icon;
                            return (
                                <div key={module.id} className="border rounded-lg p-4">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-3">
                                            <div className={`p-2 rounded-lg ${module.completed ? 'bg-green-100' : 'bg-gray-100'
                                                }`}>
                                                <Icon className={`w-5 h-5 ${module.completed ? 'text-green-600' : 'text-gray-600'
                                                    }`} />
                                            </div>
                                            <div>
                                                <h4 className="font-medium text-gray-900">{module.title}</h4>
                                                <p className="text-sm text-gray-600">{module.description}</p>
                                                <p className="text-xs text-gray-500 mt-1">
                                                    Duration: {module.duration}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-center space-x-2">
                                            {module.completed ? (
                                                <div className="flex items-center space-x-1 text-green-600">
                                                    <CheckCircle className="w-5 h-5" />
                                                    <span className="text-sm font-medium">Completed</span>
                                                </div>
                                            ) : (
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => setCurrentModule(module.id)}
                                                >
                                                    <Play className="w-4 h-4 mr-1" />
                                                    Start
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Training Module Content */}
                    {currentModule && (
                        <div className="border rounded-lg p-6 bg-gray-50">
                            <div className="text-center space-y-4">
                                <h3 className="text-lg font-semibold">
                                    {trainingModules.find(m => m.id === currentModule)?.title}
                                </h3>
                                <p className="text-gray-600">
                                    {trainingModules.find(m => m.id === currentModule)?.description}
                                </p>

                                <div className="bg-white p-4 rounded-lg border">
                                    <p className="text-sm text-gray-700 mb-4">
                                        This is a placeholder for the training content. In a real implementation,
                                        this would contain interactive training materials, videos, or documentation.
                                    </p>

                                    <div className="space-y-2 text-sm text-gray-600">
                                        <p>• Interactive tutorials and guides</p>
                                        <p>• Video demonstrations</p>
                                        <p>• Step-by-step instructions</p>
                                        <p>• Practice exercises</p>
                                    </div>
                                </div>

                                <div className="flex justify-center space-x-3">
                                    <Button
                                        variant="outline"
                                        onClick={() => setCurrentModule(null)}
                                    >
                                        Back to Modules
                                    </Button>
                                    <Button
                                        onClick={() => completeModule(currentModule)}
                                    >
                                        Mark as Complete
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Completion Notice */}
                    {completedCount === totalCount && (
                        <Alert className="border-green-200 bg-green-50">
                            <CheckCircle className="h-4 w-4 text-green-600" />
                            <AlertDescription className="text-green-800">
                                <strong>Congratulations!</strong> You have completed all training modules.
                                You're now ready to use the employee portal.
                            </AlertDescription>
                        </Alert>
                    )}

                    {/* Action Buttons */}
                    <div className="flex justify-end space-x-3">
                        {completedCount === totalCount ? (
                            <Button
                                onClick={handleFinish}
                                className="px-8"
                            >
                                Complete Onboarding
                            </Button>
                        ) : (
                            <Button
                                onClick={handleComplete}
                                disabled={isLoading || completedCount < totalCount}
                                className="px-8"
                            >
                                {isLoading ? (
                                    <span className="flex items-center">
                                        <Loader className="w-4 h-4 mr-2 animate-spin" />
                                        Saving...
                                    </span>
                                ) : (
                                    'Continue to Next Step'
                                )}
                            </Button>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default SystemTraining;
