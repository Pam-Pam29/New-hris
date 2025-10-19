import {
    collection,
    addDoc,
    getDocs,
    query,
    where,
    orderBy,
    limit,
    Timestamp,
    onSnapshot,
    Unsubscribe,
    updateDoc,
    doc
} from 'firebase/firestore';
import { getServiceConfig, initializeFirebase } from '../config/firebase';
import type { Firestore } from 'firebase/firestore';

export interface TimeNotification {
    id: string;
    type: 'clock_in' | 'clock_out' | 'adjustment_request' | 'adjustment_approved' | 'adjustment_rejected' | 'schedule_update';
    title: string;
    message: string;
    employeeId: string;
    employeeName: string;
    relatedId?: string; // timeEntryId or adjustmentRequestId
    metadata?: Record<string, any>;
    read: boolean;
    sentToHr: boolean;
    sentToEmployee: boolean;
    createdAt: Date | string;
    actionUrl?: string;
    priority: 'low' | 'medium' | 'high';
}

export interface ITimeNotificationService {
    // Create notifications
    notifyClockIn(employeeId: string, employeeName: string, timeEntryId: string, location?: string): Promise<TimeNotification>;
    notifyClockOut(employeeId: string, employeeName: string, timeEntryId: string, hoursWorked: number): Promise<TimeNotification>;
    notifyAdjustmentRequest(employeeId: string, employeeName: string, requestId: string): Promise<TimeNotification>;
    notifyAdjustmentApproved(employeeId: string, employeeName: string, requestId: string, reviewedBy: string): Promise<TimeNotification>;
    notifyAdjustmentRejected(employeeId: string, employeeName: string, requestId: string, reviewedBy: string, reason?: string): Promise<TimeNotification>;
    notifyScheduleUpdate(employeeId: string, employeeName: string, scheduleId: string): Promise<TimeNotification>;

    // Get notifications
    getNotifications(employeeId?: string, sentToHr?: boolean): Promise<TimeNotification[]>;
    getUnreadCount(employeeId?: string, sentToHr?: boolean): Promise<number>;
    markAsRead(notificationId: string): Promise<void>;
    markAllAsRead(employeeId?: string, sentToHr?: boolean): Promise<void>;

    // Real-time subscriptions
    subscribeToNotifications(employeeId: string, callback: (notifications: TimeNotification[]) => void): Unsubscribe;
    subscribeToHrNotifications(callback: (notifications: TimeNotification[]) => void): Unsubscribe;
}

export class FirebaseTimeNotificationService implements ITimeNotificationService {
    private db: Firestore;

    constructor(db: Firestore) {
        this.db = db;
    }

    private async createNotification(notification: Omit<TimeNotification, 'id'>): Promise<TimeNotification> {
        const notificationsRef = collection(this.db, 'timeNotifications');

        // Clean metadata to remove undefined values
        const cleanMetadata = notification.metadata ?
            Object.fromEntries(Object.entries(notification.metadata).filter(([_, v]) => v !== undefined)) :
            {};

        const docRef = await addDoc(notificationsRef, {
            ...notification,
            metadata: Object.keys(cleanMetadata).length > 0 ? cleanMetadata : {},
            createdAt: Timestamp.now(),
        });

        return {
            id: docRef.id,
            ...notification,
            createdAt: new Date(),
        };
    }

    async notifyClockIn(employeeId: string, employeeName: string, timeEntryId: string, location?: string): Promise<TimeNotification> {
        return this.createNotification({
            type: 'clock_in',
            title: 'Clock In Recorded',
            message: `${employeeName} has clocked in${location ? ` at ${location}` : ''}`,
            employeeId,
            employeeName,
            relatedId: timeEntryId,
            metadata: location ? { location } : {},
            read: false,
            sentToHr: true,
            sentToEmployee: true,
            priority: 'low',
            actionUrl: `/time-management`,
        });
    }

    async notifyClockOut(employeeId: string, employeeName: string, timeEntryId: string, hoursWorked: number): Promise<TimeNotification> {
        return this.createNotification({
            type: 'clock_out',
            title: 'Clock Out Recorded',
            message: `${employeeName} has clocked out. Total hours: ${hoursWorked.toFixed(2)}`,
            employeeId,
            employeeName,
            relatedId: timeEntryId,
            metadata: { hoursWorked },
            read: false,
            sentToHr: true,
            sentToEmployee: true,
            priority: 'low',
            actionUrl: `/time-management`,
        });
    }

    async notifyAdjustmentRequest(employeeId: string, employeeName: string, requestId: string): Promise<TimeNotification> {
        return this.createNotification({
            type: 'adjustment_request',
            title: 'New Time Adjustment Request',
            message: `${employeeName} has submitted a time adjustment request`,
            employeeId,
            employeeName,
            relatedId: requestId,
            read: false,
            sentToHr: true,
            sentToEmployee: false,
            priority: 'high',
            actionUrl: `/time-management`,
        });
    }

    async notifyAdjustmentApproved(employeeId: string, employeeName: string, requestId: string, reviewedBy: string): Promise<TimeNotification> {
        return this.createNotification({
            type: 'adjustment_approved',
            title: 'Time Adjustment Approved',
            message: `Your time adjustment request has been approved by ${reviewedBy}`,
            employeeId,
            employeeName,
            relatedId: requestId,
            metadata: { reviewedBy },
            read: false,
            sentToHr: false,
            sentToEmployee: true,
            priority: 'medium',
            actionUrl: `/time-management`,
        });
    }

    async notifyAdjustmentRejected(employeeId: string, employeeName: string, requestId: string, reviewedBy: string, reason?: string): Promise<TimeNotification> {
        return this.createNotification({
            type: 'adjustment_rejected',
            title: 'Time Adjustment Rejected',
            message: `Your time adjustment request has been rejected by ${reviewedBy}${reason ? `: ${reason}` : ''}`,
            employeeId,
            employeeName,
            relatedId: requestId,
            metadata: { reviewedBy, reason },
            read: false,
            sentToHr: false,
            sentToEmployee: true,
            priority: 'high',
            actionUrl: `/time-management`,
        });
    }

    async notifyScheduleUpdate(employeeId: string, employeeName: string, scheduleId: string): Promise<TimeNotification> {
        return this.createNotification({
            type: 'schedule_update',
            title: 'Schedule Updated',
            message: `Your work schedule has been updated`,
            employeeId,
            employeeName,
            relatedId: scheduleId,
            read: false,
            sentToHr: false,
            sentToEmployee: true,
            priority: 'medium',
            actionUrl: `/time-management`,
        });
    }

    async getNotifications(employeeId?: string, sentToHr?: boolean): Promise<TimeNotification[]> {
        try {
            const notificationsRef = collection(this.db, 'timeNotifications');
            let q = query(notificationsRef, orderBy('createdAt', 'desc'), limit(50));

            if (employeeId && sentToHr === undefined) {
                q = query(
                    notificationsRef,
                    where('employeeId', '==', employeeId),
                    where('sentToEmployee', '==', true),
                    orderBy('createdAt', 'desc'),
                    limit(50)
                );
            } else if (sentToHr) {
                q = query(
                    notificationsRef,
                    where('sentToHr', '==', true),
                    orderBy('createdAt', 'desc'),
                    limit(100)
                );
            }

            const snapshot = await getDocs(q);
            return snapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    id: doc.id,
                    ...data,
                    createdAt: data.createdAt?.toDate?.() || data.createdAt,
                } as TimeNotification;
            });
        } catch (error) {
            console.error('Error fetching notifications:', error);
            return [];
        }
    }

    async getUnreadCount(employeeId?: string, sentToHr?: boolean): Promise<number> {
        try {
            const notificationsRef = collection(this.db, 'timeNotifications');
            let q;

            if (employeeId) {
                q = query(
                    notificationsRef,
                    where('employeeId', '==', employeeId),
                    where('sentToEmployee', '==', true),
                    where('read', '==', false)
                );
            } else if (sentToHr) {
                q = query(
                    notificationsRef,
                    where('sentToHr', '==', true),
                    where('read', '==', false)
                );
            } else {
                q = query(
                    notificationsRef,
                    where('read', '==', false)
                );
            }

            const snapshot = await getDocs(q);
            return snapshot.size;
        } catch (error) {
            console.error('Error getting unread count:', error);
            return 0;
        }
    }

    async markAsRead(notificationId: string): Promise<void> {
        const docRef = doc(this.db, 'timeNotifications', notificationId);
        await updateDoc(docRef, { read: true });
    }

    async markAllAsRead(employeeId?: string, sentToHr?: boolean): Promise<void> {
        const notifications = await this.getNotifications(employeeId, sentToHr);
        const unreadNotifications = notifications.filter(n => !n.read);

        const promises = unreadNotifications.map(n => this.markAsRead(n.id));
        await Promise.all(promises);
    }

    subscribeToNotifications(employeeId: string, callback: (notifications: TimeNotification[]) => void): Unsubscribe {
        const notificationsRef = collection(this.db, 'timeNotifications');
        const q = query(
            notificationsRef,
            where('employeeId', '==', employeeId),
            where('sentToEmployee', '==', true),
            orderBy('createdAt', 'desc'),
            limit(20)
        );

        return onSnapshot(q, (snapshot) => {
            const notifications = snapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    id: doc.id,
                    ...data,
                    createdAt: data.createdAt?.toDate?.() || data.createdAt,
                } as TimeNotification;
            });
            callback(notifications);
        });
    }

    subscribeToHrNotifications(callback: (notifications: TimeNotification[]) => void): Unsubscribe {
        const notificationsRef = collection(this.db, 'timeNotifications');
        const q = query(
            notificationsRef,
            where('sentToHr', '==', true),
            orderBy('createdAt', 'desc'),
            limit(100)
        );

        return onSnapshot(q, (snapshot) => {
            const notifications = snapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    id: doc.id,
                    ...data,
                    createdAt: data.createdAt?.toDate?.() || data.createdAt,
                } as TimeNotification;
            });
            callback(notifications);
        });
    }
}

export class MockTimeNotificationService implements ITimeNotificationService {
    private notifications: TimeNotification[] = [];

    private createNotification(notification: Omit<TimeNotification, 'id'>): TimeNotification {
        const newNotification: TimeNotification = {
            ...notification,
            id: `notif-${Date.now()}`,
            createdAt: new Date(),
        };
        this.notifications.unshift(newNotification);
        return newNotification;
    }

    async notifyClockIn(employeeId: string, employeeName: string, timeEntryId: string, location?: string): Promise<TimeNotification> {
        return this.createNotification({
            type: 'clock_in',
            title: 'Clock In Recorded',
            message: `${employeeName} has clocked in${location ? ` at ${location}` : ''}`,
            employeeId,
            employeeName,
            relatedId: timeEntryId,
            metadata: { location },
            read: false,
            sentToHr: true,
            sentToEmployee: true,
            priority: 'low',
            actionUrl: `/time-management`,
        });
    }

    async notifyClockOut(employeeId: string, employeeName: string, timeEntryId: string, hoursWorked: number): Promise<TimeNotification> {
        return this.createNotification({
            type: 'clock_out',
            title: 'Clock Out Recorded',
            message: `${employeeName} has clocked out. Total hours: ${hoursWorked.toFixed(2)}`,
            employeeId,
            employeeName,
            relatedId: timeEntryId,
            metadata: { hoursWorked },
            read: false,
            sentToHr: true,
            sentToEmployee: true,
            priority: 'low',
            actionUrl: `/time-management`,
        });
    }

    async notifyAdjustmentRequest(employeeId: string, employeeName: string, requestId: string): Promise<TimeNotification> {
        return this.createNotification({
            type: 'adjustment_request',
            title: 'New Time Adjustment Request',
            message: `${employeeName} has submitted a time adjustment request`,
            employeeId,
            employeeName,
            relatedId: requestId,
            read: false,
            sentToHr: true,
            sentToEmployee: false,
            priority: 'high',
            actionUrl: `/time-management`,
        });
    }

    async notifyAdjustmentApproved(employeeId: string, employeeName: string, requestId: string, reviewedBy: string): Promise<TimeNotification> {
        return this.createNotification({
            type: 'adjustment_approved',
            title: 'Time Adjustment Approved',
            message: `Your time adjustment request has been approved by ${reviewedBy}`,
            employeeId,
            employeeName,
            relatedId: requestId,
            metadata: { reviewedBy },
            read: false,
            sentToHr: false,
            sentToEmployee: true,
            priority: 'medium',
            actionUrl: `/time-management`,
        });
    }

    async notifyAdjustmentRejected(employeeId: string, employeeName: string, requestId: string, reviewedBy: string, reason?: string): Promise<TimeNotification> {
        return this.createNotification({
            type: 'adjustment_rejected',
            title: 'Time Adjustment Rejected',
            message: `Your time adjustment request has been rejected by ${reviewedBy}${reason ? `: ${reason}` : ''}`,
            employeeId,
            employeeName,
            relatedId: requestId,
            metadata: { reviewedBy, reason },
            read: false,
            sentToHr: false,
            sentToEmployee: true,
            priority: 'high',
            actionUrl: `/time-management`,
        });
    }

    async notifyScheduleUpdate(employeeId: string, employeeName: string, scheduleId: string): Promise<TimeNotification> {
        return this.createNotification({
            type: 'schedule_update',
            title: 'Schedule Updated',
            message: `Your work schedule has been updated`,
            employeeId,
            employeeName,
            relatedId: scheduleId,
            read: false,
            sentToHr: false,
            sentToEmployee: true,
            priority: 'medium',
            actionUrl: `/time-management`,
        });
    }

    async getNotifications(employeeId?: string, sentToHr?: boolean): Promise<TimeNotification[]> {
        let filtered = this.notifications;

        if (employeeId && sentToHr === undefined) {
            filtered = filtered.filter(n => n.employeeId === employeeId && n.sentToEmployee);
        } else if (sentToHr) {
            filtered = filtered.filter(n => n.sentToHr);
        }

        return filtered.slice(0, 50);
    }

    async getUnreadCount(employeeId?: string, sentToHr?: boolean): Promise<number> {
        let filtered = this.notifications;

        if (employeeId) {
            filtered = filtered.filter(n => n.employeeId === employeeId && n.sentToEmployee && !n.read);
        } else if (sentToHr) {
            filtered = filtered.filter(n => n.sentToHr && !n.read);
        } else {
            filtered = filtered.filter(n => !n.read);
        }

        return filtered.length;
    }

    async markAsRead(notificationId: string): Promise<void> {
        const notification = this.notifications.find(n => n.id === notificationId);
        if (notification) {
            notification.read = true;
        }
    }

    async markAllAsRead(employeeId?: string, sentToHr?: boolean): Promise<void> {
        this.notifications
            .filter(n => {
                if (employeeId) {
                    return n.employeeId === employeeId && !n.read;
                } else if (sentToHr) {
                    return n.sentToHr && !n.read;
                }
                return !n.read;
            })
            .forEach(n => n.read = true);
    }

    subscribeToNotifications(employeeId: string, callback: (notifications: TimeNotification[]) => void): Unsubscribe {
        const notifications = this.notifications
            .filter(n => n.employeeId === employeeId && n.sentToEmployee)
            .slice(0, 20);
        callback(notifications);
        return () => { };
    }

    subscribeToHrNotifications(callback: (notifications: TimeNotification[]) => void): Unsubscribe {
        const notifications = this.notifications
            .filter(n => n.sentToHr)
            .slice(0, 100);
        callback(notifications);
        return () => { };
    }
}

// Service Factory
export class TimeNotificationServiceFactory {
    static async createService(): Promise<ITimeNotificationService> {
        await initializeFirebase();
        const config = await getServiceConfig();

        if (config.defaultService === 'firebase' && config.firebase.enabled && config.firebase.db) {
            console.log('✅ Using Firebase Time Notification Service (HR)');
            return new FirebaseTimeNotificationService(config.firebase.db as Firestore);
        }

        console.log('⚠️ Using Mock Time Notification Service (HR)');
        return new MockTimeNotificationService();
    }
}

// Singleton instance
let timeNotificationServiceInstance: ITimeNotificationService | null = null;

export async function getTimeNotificationService(): Promise<ITimeNotificationService> {
    if (!timeNotificationServiceInstance) {
        timeNotificationServiceInstance = await TimeNotificationServiceFactory.createService();
    }
    return timeNotificationServiceInstance;
}

