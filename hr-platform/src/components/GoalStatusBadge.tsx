// Goal Status Badge with Overdue Indicators
import React from 'react';
import { Badge } from './ui/badge';
import { Clock, CheckCircle, XCircle, AlertTriangle, Pause } from 'lucide-react';
import { PerformanceGoal } from '../types/performanceManagement';
import { goalOverdueService } from '../services/goalOverdueService';

interface GoalStatusBadgeProps {
    goal: PerformanceGoal;
    showDetails?: boolean;
}

export function GoalStatusBadge({ goal, showDetails = false }: GoalStatusBadgeProps) {
    const getStatusDisplay = () => {
        if (goal.status === 'overdue') {
            const daysOverdue = goal.daysOverdue || 0;
            const severity = goalOverdueService.getOverdueSeverity(daysOverdue);

            let bgColor, textColor, icon;

            switch (severity) {
                case 'minor':
                    bgColor = 'bg-yellow-100';
                    textColor = 'text-yellow-800';
                    icon = <Clock className="h-3 w-3" />;
                    break;
                case 'moderate':
                    bgColor = 'bg-orange-100';
                    textColor = 'text-orange-800';
                    icon = <AlertTriangle className="h-3 w-3" />;
                    break;
                case 'critical':
                    bgColor = 'bg-red-100';
                    textColor = 'text-red-800';
                    icon = <AlertTriangle className="h-3 w-3 animate-pulse" />;
                    break;
            }

            return {
                label: `OVERDUE ${daysOverdue}d`,
                bgColor,
                textColor,
                icon,
                details: severity === 'critical'
                    ? 'Critically Overdue - Immediate Action Required'
                    : severity === 'moderate'
                        ? 'Moderately Overdue - Review Needed'
                        : 'Recently Overdue'
            };
        }

        switch (goal.status) {
            case 'completed':
                const daysEarly = goal.daysEarlyOrLate || 0;
                const completionText = daysEarly > 0
                    ? `Completed ${daysEarly} day${daysEarly !== 1 ? 's' : ''} early! 🎉`
                    : daysEarly < 0
                        ? `Completed ${Math.abs(daysEarly)} day${Math.abs(daysEarly) !== 1 ? 's' : ''} late`
                        : 'Completed on time!';

                return {
                    label: 'COMPLETED 🎉',
                    bgColor: 'bg-green-100',
                    textColor: 'text-green-800',
                    icon: <CheckCircle className="h-3 w-3" />,
                    details: completionText
                };
            case 'in_progress':
                return {
                    label: 'IN PROGRESS',
                    bgColor: 'bg-blue-100',
                    textColor: 'text-blue-800',
                    icon: <Clock className="h-3 w-3" />,
                    details: 'Actively working on this goal'
                };
            case 'not_started':
                return {
                    label: 'NOT STARTED',
                    bgColor: 'bg-gray-100',
                    textColor: 'text-gray-800',
                    icon: <Pause className="h-3 w-3" />,
                    details: 'Goal not yet started'
                };
            case 'cancelled':
                return {
                    label: 'CANCELLED',
                    bgColor: 'bg-gray-100',
                    textColor: 'text-gray-600',
                    icon: <XCircle className="h-3 w-3" />,
                    details: 'Goal was cancelled'
                };
            default:
                return {
                    label: goal.status.toUpperCase(),
                    bgColor: 'bg-gray-100',
                    textColor: 'text-gray-800',
                    icon: null,
                    details: ''
                };
        }
    };

    const { label, bgColor, textColor, icon, details } = getStatusDisplay();

    return (
        <div className="flex flex-col gap-1">
            <Badge className={`${bgColor} ${textColor} border-0 flex items-center gap-1`}>
                {icon}
                <span className="font-semibold">{label}</span>
            </Badge>
            {showDetails && details && (
                <span className={`text-xs ${textColor}`}>{details}</span>
            )}
        </div>
    );
}

// Helper component for at-risk goals
export function AtRiskBadge({ daysUntilDue }: { daysUntilDue: number }) {
    if (daysUntilDue > 7) return null;

    return (
        <Badge className="bg-amber-100 text-amber-800 border-amber-300 flex items-center gap-1">
            <AlertTriangle className="h-3 w-3" />
            <span>At Risk - {daysUntilDue}d left</span>
        </Badge>
    );
}











