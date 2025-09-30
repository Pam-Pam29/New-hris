import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';
import { Separator } from './ui/separator';
import { useToast } from '../hooks/use-toast';
import {
    Bell,
    BellRing,
    Check,
    X,
    Clock,
    AlertTriangle,
    Info,
    CheckCircle,
    XCircle,
    Calendar,
    FileText,
    User,
    Briefcase,
    Settings,
    Eye,
    EyeOff,
    Filter,
    MoreHorizontal,
    ExternalLink,
    Snooze,
    Archive
} from 'lucide-react';
import {
    getComprehensiveHRDataFlowService,
    SmartNotification
} from '../services/comprehensiveHRDataFlow';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from './ui/dropdown-menu';

interface SmartNotificationSystemProps {
    employeeId: string;
    mode: 'employee' | 'hr';
    showUnreadOnly?: boolean;
    maxNotifications?: number;
}

export function SmartNotificationSystem({
    employeeId,
    mode,
    showUnreadOnly = false,
    maxNotifications = 50
}: SmartNotificationSystemProps) {
    const [notifications, setNotifications] = useState<SmartNotification[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'unread' | 'urgent' | 'actionRequired'>('all');
    const [expandedNotifications, setExpandedNotifications] = useState<Set<string>>(new Set());
    const { toast } = useToast();

    useEffect(() => {
        let unsubscribe: (() => void) | null = null;

        const initializeNotifications = async () => {
            try {
                console.log('SmartNotificationSystem: Initializing notifications for employee:', employeeId);
                const dataFlowService = await getComprehensiveHRDataFlowService();

                // Subscribe to real-time notification updates
                unsubscribe = dataFlowService.subscribeToNotifications(employeeId, (updatedNotifications) => {
                    console.log('SmartNotificationSystem: Received notifications:', updatedNotifications.length);

                    // Sort notifications by priority and creation date
                    const sortedNotifications = updatedNotifications.sort((a, b) => {
                        // First sort by priority
                        const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
                        const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
                        if (priorityDiff !== 0) return priorityDiff;

                        // Then by creation date (newest first)
                        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
                    });

                    setNotifications(sortedNotifications.slice(0, maxNotifications));
                    setLoading(false);
                });
            } catch (error) {
                console.error('SmartNotificationSystem: Error initializing notifications:', error);
                setLoading(false);
            }
        };

        initializeNotifications();

        return () => {
            if (unsubscribe) {
                unsubscribe();
            }
        };
    }, [employeeId, maxNotifications]);

    const handleMarkAsRead = async (notificationId: string) => {
        try {
            const dataFlowService = await getComprehensiveHRDataFlowService();
            await dataFlowService.markNotificationAsRead(notificationId);

            toast({
                title: "Notification marked as read",
                description: "The notification has been marked as read",
            });
        } catch (error) {
            console.error('Error marking notification as read:', error);
            toast({
                title: "Error",
                description: "Failed to mark notification as read",
                variant: "destructive"
            });
        }
    };

    const handleNotificationAction = async (notificationId: string, actionId: string, actionType: string) => {
        try {
            const dataFlowService = await getComprehensiveHRDataFlowService();

            if (actionType === 'navigate') {
                // Handle navigation actions
                const notification = notifications.find(n => n.id === notificationId);
                if (notification?.actionUrl) {
                    window.location.href = notification.actionUrl;
                }
            } else if (actionType === 'snooze') {
                // Handle snooze actions
                toast({
                    title: "Notification snoozed",
                    description: "You'll be reminded about this later",
                });
            } else {
                // Handle custom actions
                await dataFlowService.performNotificationAction(notificationId, actionId);
            }

            // Mark as read after action
            await handleMarkAsRead(notificationId);
        } catch (error) {
            console.error('Error performing notification action:', error);
            toast({
                title: "Error",
                description: "Failed to perform action",
                variant: "destructive"
            });
        }
    };

    const toggleNotificationExpansion = (notificationId: string) => {
        const newExpanded = new Set(expandedNotifications);
        if (newExpanded.has(notificationId)) {
            newExpanded.delete(notificationId);
        } else {
            newExpanded.add(notificationId);
        }
        setExpandedNotifications(newExpanded);
    };

    const getNotificationIcon = (type: SmartNotification['type'], priority: SmartNotification['priority']) => {
        const iconClass = `h-5 w-5 ${priority === 'urgent' ? 'animate-pulse' : ''}`;

        switch (type) {
            case 'success':
                return <CheckCircle className={`${iconClass} text-green-500`} />;
            case 'error':
                return <XCircle className={`${iconClass} text-red-500`} />;
            case 'warning':
                return <AlertTriangle className={`${iconClass} text-yellow-500`} />;
            case 'urgent':
                return <AlertTriangle className={`${iconClass} text-red-600`} />;
            default:
                return <Info className={`${iconClass} text-blue-500`} />;
        }
    };

    const getCategoryIcon = (category: SmartNotification['category']) => {
        const iconClass = "h-4 w-4 text-muted-foreground";

        switch (category) {
            case 'leave':
                return <Calendar className={iconClass} />;
            case 'policy':
                return <FileText className={iconClass} />;
            case 'profile':
                return <User className={iconClass} />;
            case 'performance':
                return <Briefcase className={iconClass} />;
            case 'asset':
                return <Settings className={iconClass} />;
            case 'time':
                return <Clock className={iconClass} />;
            default:
                return <Bell className={iconClass} />;
        }
    };

    const getPriorityBadge = (priority: SmartNotification['priority']) => {
        switch (priority) {
            case 'urgent':
                return <Badge variant="destructive" className="animate-pulse">Urgent</Badge>;
            case 'high':
                return <Badge variant="destructive">High</Badge>;
            case 'medium':
                return <Badge variant="secondary">Medium</Badge>;
            case 'low':
                return <Badge variant="outline">Low</Badge>;
            default:
                return null;
        }
    };

    const getFilteredNotifications = () => {
        let filtered = notifications;

        switch (filter) {
            case 'unread':
                filtered = notifications.filter(n => !n.isRead);
                break;
            case 'urgent':
                filtered = notifications.filter(n => n.priority === 'urgent' || n.priority === 'high');
                break;
            case 'actionRequired':
                filtered = notifications.filter(n => n.actionRequired);
                break;
            default:
                filtered = notifications;
        }

        if (showUnreadOnly) {
            filtered = filtered.filter(n => !n.isRead);
        }

        return filtered;
    };

    const filteredNotifications = getFilteredNotifications();
    const unreadCount = notifications.filter(n => !n.isRead).length;
    const urgentCount = notifications.filter(n => (n.priority === 'urgent' || n.priority === 'high') && !n.isRead).length;

    if (loading) {
        return (
            <Card>
                <CardContent className="p-6">
                    <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-4">
            {/* Header with Stats and Filters */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <CardTitle className="flex items-center space-x-2">
                                {unreadCount > 0 ? (
                                    <BellRing className="h-6 w-6 text-primary" />
                                ) : (
                                    <Bell className="h-6 w-6 text-muted-foreground" />
                                )}
                                <span>Notifications</span>
                            </CardTitle>
                            <div className="flex items-center space-x-2">
                                {unreadCount > 0 && (
                                    <Badge variant="default" className="bg-blue-500">
                                        {unreadCount} unread
                                    </Badge>
                                )}
                                {urgentCount > 0 && (
                                    <Badge variant="destructive" className="animate-pulse">
                                        {urgentCount} urgent
                                    </Badge>
                                )}
                            </div>
                        </div>

                        <div className="flex items-center space-x-2">
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline" size="sm">
                                        <Filter className="h-4 w-4 mr-2" />
                                        Filter
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuLabel>Filter Notifications</DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem onClick={() => setFilter('all')}>
                                        All Notifications
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => setFilter('unread')}>
                                        Unread Only
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => setFilter('urgent')}>
                                        Urgent & High Priority
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => setFilter('actionRequired')}>
                                        Action Required
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </div>
                </CardHeader>
            </Card>

            {/* Notifications List */}
            <Card>
                <CardContent className="p-0">
                    <ScrollArea className="h-[600px]">
                        {filteredNotifications.length === 0 ? (
                            <div className="p-8 text-center">
                                <Bell className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                                <h3 className="text-lg font-semibold mb-2">No notifications</h3>
                                <p className="text-muted-foreground">
                                    {filter === 'all'
                                        ? "You're all caught up! No notifications to show."
                                        : `No notifications match the current filter: ${filter}`
                                    }
                                </p>
                            </div>
                        ) : (
                            <div className="divide-y">
                                {filteredNotifications.map((notification, index) => {
                                    const isExpanded = expandedNotifications.has(notification.id);
                                    const isExpired = notification.expiryDate && new Date(notification.expiryDate) < new Date();

                                    return (
                                        <div
                                            key={notification.id}
                                            className={`p-4 hover:bg-muted/50 transition-colors ${!notification.isRead ? 'bg-blue-50/50 border-l-4 border-l-blue-500' : ''
                                                } ${isExpired ? 'opacity-60' : ''}`}
                                        >
                                            <div className="flex items-start space-x-3">
                                                {/* Notification Icon */}
                                                <div className="flex-shrink-0 mt-1">
                                                    {getNotificationIcon(notification.type, notification.priority)}
                                                </div>

                                                {/* Notification Content */}
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-start justify-between">
                                                        <div className="flex-1">
                                                            <div className="flex items-center space-x-2 mb-1">
                                                                {getCategoryIcon(notification.category)}
                                                                <h4 className="text-sm font-semibold text-foreground">
                                                                    {notification.title}
                                                                </h4>
                                                                {getPriorityBadge(notification.priority)}
                                                                {notification.actionRequired && (
                                                                    <Badge variant="outline" className="text-xs">
                                                                        Action Required
                                                                    </Badge>
                                                                )}
                                                            </div>

                                                            <p className={`text-sm text-muted-foreground ${isExpanded ? '' : 'line-clamp-2'
                                                                }`}>
                                                                {notification.message}
                                                            </p>

                                                            {/* Metadata */}
                                                            <div className="flex items-center space-x-4 mt-2 text-xs text-muted-foreground">
                                                                <span className="flex items-center space-x-1">
                                                                    <Clock className="h-3 w-3" />
                                                                    <span>
                                                                        {new Date(notification.createdAt).toLocaleDateString()} at{' '}
                                                                        {new Date(notification.createdAt).toLocaleTimeString([], {
                                                                            hour: '2-digit',
                                                                            minute: '2-digit'
                                                                        })}
                                                                    </span>
                                                                </span>
                                                                {notification.expiryDate && (
                                                                    <span className={`flex items-center space-x-1 ${isExpired ? 'text-red-500' : ''
                                                                        }`}>
                                                                        <AlertTriangle className="h-3 w-3" />
                                                                        <span>
                                                                            Expires: {new Date(notification.expiryDate).toLocaleDateString()}
                                                                        </span>
                                                                    </span>
                                                                )}
                                                            </div>

                                                            {/* Action Buttons */}
                                                            {notification.actionButtons && notification.actionButtons.length > 0 && (
                                                                <div className="flex items-center space-x-2 mt-3">
                                                                    {notification.actionButtons.map((button) => (
                                                                        <Button
                                                                            key={button.id}
                                                                            size="sm"
                                                                            variant={
                                                                                button.style === 'primary' ? 'default' :
                                                                                    button.style === 'danger' ? 'destructive' : 'outline'
                                                                            }
                                                                            onClick={() => handleNotificationAction(
                                                                                notification.id,
                                                                                button.id,
                                                                                button.action
                                                                            )}
                                                                            className="text-xs"
                                                                        >
                                                                            {button.text}
                                                                        </Button>
                                                                    ))}
                                                                </div>
                                                            )}

                                                            {/* Default Action Button */}
                                                            {notification.actionUrl && notification.actionText && (
                                                                <div className="mt-3">
                                                                    <Button
                                                                        size="sm"
                                                                        variant="outline"
                                                                        onClick={() => handleNotificationAction(
                                                                            notification.id,
                                                                            'default',
                                                                            'navigate'
                                                                        )}
                                                                        className="text-xs"
                                                                    >
                                                                        <ExternalLink className="h-3 w-3 mr-1" />
                                                                        {notification.actionText}
                                                                    </Button>
                                                                </div>
                                                            )}
                                                        </div>

                                                        {/* Notification Actions */}
                                                        <div className="flex items-center space-x-1 ml-2">
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => toggleNotificationExpansion(notification.id)}
                                                                className="h-8 w-8 p-0"
                                                            >
                                                                {isExpanded ? (
                                                                    <EyeOff className="h-4 w-4" />
                                                                ) : (
                                                                    <Eye className="h-4 w-4" />
                                                                )}
                                                            </Button>

                                                            {!notification.isRead && (
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    onClick={() => handleMarkAsRead(notification.id)}
                                                                    className="h-8 w-8 p-0"
                                                                >
                                                                    <Check className="h-4 w-4" />
                                                                </Button>
                                                            )}

                                                            <DropdownMenu>
                                                                <DropdownMenuTrigger asChild>
                                                                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                                                        <MoreHorizontal className="h-4 w-4" />
                                                                    </Button>
                                                                </DropdownMenuTrigger>
                                                                <DropdownMenuContent align="end">
                                                                    <DropdownMenuItem
                                                                        onClick={() => handleMarkAsRead(notification.id)}
                                                                    >
                                                                        <Check className="h-4 w-4 mr-2" />
                                                                        Mark as Read
                                                                    </DropdownMenuItem>
                                                                    <DropdownMenuItem
                                                                        onClick={() => handleNotificationAction(
                                                                            notification.id,
                                                                            'snooze',
                                                                            'snooze'
                                                                        )}
                                                                    >
                                                                        <Snooze className="h-4 w-4 mr-2" />
                                                                        Snooze
                                                                    </DropdownMenuItem>
                                                                    <DropdownMenuItem>
                                                                        <Archive className="h-4 w-4 mr-2" />
                                                                        Archive
                                                                    </DropdownMenuItem>
                                                                </DropdownMenuContent>
                                                            </DropdownMenu>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </ScrollArea>
                </CardContent>
            </Card>
        </div>
    );
}

export default SmartNotificationSystem;


