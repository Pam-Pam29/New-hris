import React, { useState, useEffect } from 'react';
import { Bell, X, Check, AlertCircle, Info, CheckCircle, XCircle } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';
import { Separator } from './ui/separator';
import { useToast } from '../hooks/use-toast';
import { getDataFlowService, NotificationData } from '../services/dataFlowService';

interface NotificationSystemProps {
    employeeId: string;
    className?: string;
}

export function NotificationSystem({ employeeId, className = '' }: NotificationSystemProps) {
    const [notifications, setNotifications] = useState<NotificationData[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();

    useEffect(() => {
        let unsubscribe: (() => void) | null = null;

        const initializeNotifications = async () => {
            try {
                console.log('Initializing notifications for employee:', employeeId);
                const dataFlowService = await getDataFlowService();

                // Subscribe to real-time notifications
                unsubscribe = dataFlowService.subscribeToNotifications(employeeId, (newNotifications) => {
                    console.log('Received notifications:', newNotifications);
                    console.log('Unread count:', newNotifications.filter(n => !n.read).length);
                    setNotifications(newNotifications);
                    const unread = newNotifications.filter(n => !n.read).length;
                    setUnreadCount(unread);
                    setLoading(false);
                });
            } catch (error) {
                console.error('Error initializing notifications:', error);
                setLoading(false);
            }
        };

        initializeNotifications();

        return () => {
            if (unsubscribe) {
                unsubscribe();
            }
        };
    }, [employeeId]);

    const markAsRead = async (notificationId: string) => {
        try {
            const dataFlowService = await getDataFlowService();
            await dataFlowService.markNotificationAsRead(notificationId);
        } catch (error) {
            console.error('Error marking notification as read:', error);
            toast({
                title: "Error",
                description: "Failed to mark notification as read",
                variant: "destructive"
            });
        }
    };

    const markAllAsRead = async () => {
        try {
            const dataFlowService = await getDataFlowService();
            const unreadNotifications = notifications.filter(n => !n.read);

            for (const notification of unreadNotifications) {
                await dataFlowService.markNotificationAsRead(notification.id);
            }

            toast({
                title: "Success",
                description: "All notifications marked as read",
            });
        } catch (error) {
            console.error('Error marking all notifications as read:', error);
            toast({
                title: "Error",
                description: "Failed to mark all notifications as read",
                variant: "destructive"
            });
        }
    };

    const getNotificationIcon = (type: NotificationData['type']) => {
        switch (type) {
            case 'success':
                return <CheckCircle className="h-4 w-4 text-green-500" />;
            case 'error':
                return <XCircle className="h-4 w-4 text-red-500" />;
            case 'warning':
                return <AlertCircle className="h-4 w-4 text-yellow-500" />;
            case 'info':
            default:
                return <Info className="h-4 w-4 text-blue-500" />;
        }
    };

    const getPriorityColor = (priority: NotificationData['priority']) => {
        switch (priority) {
            case 'urgent':
                return 'border-l-red-500 bg-red-50 dark:bg-red-950';
            case 'high':
                return 'border-l-orange-500 bg-orange-50 dark:bg-orange-950';
            case 'medium':
                return 'border-l-blue-500 bg-blue-50 dark:bg-blue-950';
            case 'low':
            default:
                return 'border-l-gray-500 bg-gray-50 dark:bg-gray-950';
        }
    };

    const formatTimeAgo = (date: Date) => {
        const now = new Date();
        const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

        if (diffInSeconds < 60) return 'Just now';
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
        if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}d ago`;
        return date.toLocaleDateString();
    };

    if (loading) {
        return (
            <div className={`relative ${className}`}>
                <Button variant="ghost" size="icon" disabled>
                    <Bell className="h-4 w-4" />
                </Button>
            </div>
        );
    }

    return (
        <div className={`relative ${className}`}>
            <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                    console.log('Notification button clicked!', isOpen);
                    setIsOpen(!isOpen);
                }}
                className="relative"
            >
                <Bell className="h-4 w-4" />
                {unreadCount > 0 && (
                    <Badge
                        variant="destructive"
                        className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs flex items-center justify-center"
                    >
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </Badge>
                )}
            </Button>

            {isOpen && (
                <>
                    {/* Backdrop */}
                    <div
                        className="fixed inset-0 z-40"
                        onClick={() => setIsOpen(false)}
                    />

                    {/* Notification Panel */}
                    <Card className="absolute right-0 top-12 w-80 z-50 shadow-lg">
                        <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-lg">Notifications</CardTitle>
                                <div className="flex items-center gap-2">
                                    {unreadCount > 0 && (
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={markAllAsRead}
                                            className="text-xs"
                                        >
                                            Mark all read
                                        </Button>
                                    )}
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => setIsOpen(false)}
                                    >
                                        <X className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        </CardHeader>

                        <CardContent className="p-0">
                            <ScrollArea className="h-96">
                                {notifications.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                                        <Bell className="h-8 w-8 mb-2 opacity-50" />
                                        <p className="text-sm">No notifications</p>
                                    </div>
                                ) : (
                                    <div className="space-y-1">
                                        {notifications.map((notification, index) => (
                                            <div key={notification.id}>
                                                <div
                                                    className={`p-4 border-l-4 hover:bg-muted/50 transition-colors cursor-pointer ${!notification.read ? getPriorityColor(notification.priority) : 'border-l-gray-200'
                                                        }`}
                                                    onClick={() => {
                                                        if (!notification.read) {
                                                            markAsRead(notification.id);
                                                        }
                                                        if (notification.actionUrl) {
                                                            window.location.href = notification.actionUrl;
                                                        }
                                                    }}
                                                >
                                                    <div className="flex items-start gap-3">
                                                        <div className="flex-shrink-0 mt-0.5">
                                                            {getNotificationIcon(notification.type)}
                                                        </div>

                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-start justify-between gap-2">
                                                                <h4 className={`text-sm font-medium ${!notification.read ? 'text-foreground' : 'text-muted-foreground'
                                                                    }`}>
                                                                    {notification.title}
                                                                </h4>
                                                                {!notification.read && (
                                                                    <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0 mt-1.5" />
                                                                )}
                                                            </div>

                                                            <p className="text-xs text-muted-foreground mt-1">
                                                                {notification.message}
                                                            </p>

                                                            <div className="flex items-center justify-between mt-2">
                                                                <span className="text-xs text-muted-foreground">
                                                                    {formatTimeAgo(notification.createdAt)}
                                                                </span>

                                                                {notification.actionUrl && (
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="sm"
                                                                        className="h-6 px-2 text-xs"
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            window.location.href = notification.actionUrl!;
                                                                        }}
                                                                    >
                                                                        {notification.actionText || 'View'}
                                                                    </Button>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                                {index < notifications.length - 1 && <Separator />}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </ScrollArea>
                        </CardContent>
                    </Card>
                </>
            )}
        </div>
    );
}

// Real-time notification hook for components
export function useNotifications(employeeId: string) {
    const [notifications, setNotifications] = useState<NotificationData[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let unsubscribe: (() => void) | null = null;

        const initializeNotifications = async () => {
            try {
                const dataFlowService = await getDataFlowService();

                unsubscribe = dataFlowService.subscribeToNotifications(employeeId, (newNotifications) => {
                    setNotifications(newNotifications);
                    const unread = newNotifications.filter(n => !n.read).length;
                    setUnreadCount(unread);
                    setLoading(false);
                });
            } catch (error) {
                console.error('Error initializing notifications:', error);
                setLoading(false);
            }
        };

        initializeNotifications();

        return () => {
            if (unsubscribe) {
                unsubscribe();
            }
        };
    }, [employeeId]);

    const markAsRead = async (notificationId: string) => {
        try {
            const dataFlowService = await getDataFlowService();
            await dataFlowService.markNotificationAsRead(notificationId);
        } catch (error) {
            console.error('Error marking notification as read:', error);
        }
    };

    return {
        notifications,
        unreadCount,
        loading,
        markAsRead
    };
}

export default NotificationSystem;
