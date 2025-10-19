import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import {
    User,
    Mail,
    Phone,
    MapPin,
    Calendar,
    Briefcase,
    TrendingUp,
    AlertCircle,
    CheckCircle,
    Clock,
    ExternalLink
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface EmployeeProfileSummaryProps {
    employeeId: string;
    profile: {
        personalInfo: {
            firstName: string;
            lastName: string;
            dateOfBirth?: string;
        };
        contactInfo: {
            personalEmail: string;
            workEmail: string;
            phone: string;
        };
        workInfo: {
            position: string;
            department: string;
            hireDate: string;
        };
        profileStatus: {
            completeness: number;
            status: 'draft' | 'pending_review' | 'approved' | 'needs_update';
            lastUpdated: string;
        };
    };
    leaveBalance?: {
        total: number;
        used: number;
        remaining: number;
    };
    performanceScore?: number;
    recentActivity?: Array<{
        type: string;
        description: string;
        timestamp: string;
    }>;
}

export function EmployeeProfileSummary({
    employeeId,
    profile,
    leaveBalance,
    performanceScore,
    recentActivity
}: EmployeeProfileSummaryProps) {
    const getStatusColor = (status: string) => {
        switch (status) {
            case 'approved':
                return 'bg-green-100 text-green-800 border-green-200';
            case 'pending_review':
                return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'needs_update':
                return 'bg-red-100 text-red-800 border-red-200';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const getCompletenessColor = (completeness: number) => {
        if (completeness >= 90) return 'bg-green-500';
        if (completeness >= 70) return 'bg-yellow-500';
        return 'bg-red-500';
    };

    return (
        <Card className="hover:shadow-lg transition-shadow duration-200">
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <Avatar className="h-12 w-12">
                            <AvatarImage src={`/avatars/${employeeId}.jpg`} />
                            <AvatarFallback>
                                {profile.personalInfo.firstName[0]}{profile.personalInfo.lastName[0]}
                            </AvatarFallback>
                        </Avatar>
                        <div>
                            <CardTitle className="text-lg">
                                {profile.personalInfo.firstName} {profile.personalInfo.lastName}
                            </CardTitle>
                            <p className="text-sm text-muted-foreground">
                                {profile.workInfo.position} • {profile.workInfo.department}
                            </p>
                        </div>
                    </div>
                    <Badge className={`${getStatusColor(profile.profileStatus.status)} capitalize`}>
                        {profile.profileStatus.status.replace('_', ' ')}
                    </Badge>
                </div>
            </CardHeader>

            <CardContent className="space-y-4">
                {/* Profile Completeness */}
                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Profile Completeness</span>
                        <span className="text-sm text-muted-foreground">{profile.profileStatus.completeness}%</span>
                    </div>
                    <Progress
                        value={profile.profileStatus.completeness}
                        className="h-2"
                    />
                    <div className="flex justify-center">
                        <Badge
                            variant="outline"
                            className={`text-xs ${getStatusColor(profile.profileStatus.completeness >= 80 ? 'approved' : profile.profileStatus.completeness >= 50 ? 'pending_review' : 'needs_update')}`}
                        >
                            {profile.profileStatus.completeness >= 80 ? 'Complete' :
                                profile.profileStatus.completeness >= 50 ? 'Needs Attention' : 'Incomplete'}
                        </Badge>
                    </div>
                </div>

                {/* Key Information Grid */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center space-x-2">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <span className="truncate">{profile.contactInfo.workEmail}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <span>{profile.contactInfo.phone}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span>Hired: {new Date(profile.workInfo.hireDate).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span>Updated: {new Date(profile.profileStatus.lastUpdated).toLocaleDateString()}</span>
                    </div>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-2 gap-4">
                    {leaveBalance && (
                        <div className="text-center p-3 bg-blue-50 rounded-lg">
                            <div className="text-lg font-semibold text-blue-700">
                                {leaveBalance.remaining}
                            </div>
                            <div className="text-xs text-blue-600">Leave Days Left</div>
                        </div>
                    )}
                    {performanceScore !== undefined && (
                        <div className="text-center p-3 bg-green-50 rounded-lg">
                            <div className="text-lg font-semibold text-green-700">
                                {performanceScore}%
                            </div>
                            <div className="text-xs text-green-600">Performance Score</div>
                        </div>
                    )}
                </div>

                {/* Recent Activity */}
                {recentActivity && recentActivity.length > 0 && (
                    <div className="space-y-2">
                        <h4 className="text-sm font-medium">Recent Activity</h4>
                        <div className="space-y-1">
                            {recentActivity.slice(0, 2).map((activity, index) => (
                                <div key={index} className="flex items-center space-x-2 text-xs">
                                    <div className={`w-2 h-2 rounded-full ${activity.type === 'profile_update' ? 'bg-blue-500' :
                                            activity.type === 'leave_request' ? 'bg-green-500' :
                                                activity.type === 'policy_acknowledgment' ? 'bg-purple-500' :
                                                    'bg-gray-500'
                                        }`} />
                                    <span className="text-muted-foreground truncate">{activity.description}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Action Buttons */}
                <div className="flex space-x-2 pt-2">
                    <Button
                        size="sm"
                        className="flex-1"
                        asChild
                    >
                        <Link to={`/hr/employee/${employeeId}`}>
                            <User className="h-4 w-4 mr-2" />
                            View Full Profile
                        </Link>
                    </Button>
                    <Button
                        size="sm"
                        variant="outline"
                        asChild
                    >
                        <Link to={`/hr/employee/${employeeId}/edit`}>
                            <ExternalLink className="h-4 w-4" />
                        </Link>
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}

export default EmployeeProfileSummary;
