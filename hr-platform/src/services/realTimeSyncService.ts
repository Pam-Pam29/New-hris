import {
    collection,
    doc,
    onSnapshot,
    query,
    where,
    orderBy,
    limit,
    Unsubscribe
} from 'firebase/firestore';
import { getFirebaseDb } from '../config/firebase';

// Real-time synchronization service for HRIS platforms
export class RealTimeSyncService {
    private subscriptions: Map<string, Unsubscribe> = new Map();
    private listeners: Map<string, Function[]> = new Map();

    constructor() {
        console.log('🔄 RealTimeSyncService initialized');
    }

    // Subscribe to real-time updates for a specific collection
    subscribeToCollection(
        collectionName: string,
        callback: (data: any[], changes: any) => void,
        options: {
            employeeId?: string;
            companyId?: string; // ← Add companyId for multi-tenancy
            limit?: number;
            orderByField?: string;
            orderDirection?: 'asc' | 'desc';
        } = {}
    ): string {
        const subscriptionId = `${collectionName}_${Date.now()}`;

        try {
            let q = query(collection(getFirebaseDb(), collectionName));

            // Add filters if specified
            if (options.companyId) {
                q = query(q, where('companyId', '==', options.companyId));
                console.log(`🏢 Filtering ${collectionName} by companyId: ${options.companyId}`);
            }

            if (options.employeeId) {
                q = query(q, where('employeeId', '==', options.employeeId));
            }

            // Add ordering if specified
            if (options.orderByField) {
                q = query(q, orderBy(options.orderByField, options.orderDirection || 'desc'));
            }

            // Add limit if specified
            if (options.limit) {
                q = query(q, limit(options.limit));
            }

            const unsubscribe = onSnapshot(
                q,
                (snapshot) => {
                    const data = snapshot.docs.map(doc => ({
                        id: doc.id,
                        ...doc.data()
                    }));

                    const changes = {
                        added: snapshot.docChanges().filter(change => change.type === 'added'),
                        modified: snapshot.docChanges().filter(change => change.type === 'modified'),
                        removed: snapshot.docChanges().filter(change => change.type === 'removed')
                    };

                    console.log(`📡 Real-time update for ${collectionName}:`, {
                        total: data.length,
                        added: changes.added.length,
                        modified: changes.modified.length,
                        removed: changes.removed.length
                    });

                    callback(data, changes);
                },
                (error) => {
                    console.error(`❌ Real-time subscription error for ${collectionName}:`, error);
                }
            );

            this.subscriptions.set(subscriptionId, unsubscribe);
            return subscriptionId;
        } catch (error) {
            console.error(`❌ Failed to subscribe to ${collectionName}:`, error);
            throw error;
        }
    }

    // Subscribe to leave requests with real-time updates
    subscribeToLeaveRequests(
        callback: (leaveRequests: any[], changes: any) => void,
        employeeId?: string
    ): string {
        return this.subscribeToCollection('leaveRequests', callback, {
            employeeId,
            limit: 50
            // Removed orderByField to avoid index requirements
        });
    }

    // Subscribe to notifications with real-time updates
    subscribeToNotifications(
        callback: (notifications: any[], changes: any) => void,
        employeeId?: string
    ): string {
        return this.subscribeToCollection('notifications', callback, {
            employeeId,
            limit: 20
            // Removed orderByField to avoid index requirements
        });
    }

    // Subscribe to employee updates
    subscribeToEmployees(
        callback: (employees: any[], changes: any) => void
    ): string {
        return this.subscribeToCollection('employees', callback, {
            limit: 100
        });
    }

    // Subscribe to policy updates
    subscribeToPolicies(
        callback: (policies: any[], changes: any) => void
    ): string {
        return this.subscribeToCollection('policies', callback, {
            limit: 50
            // Removed orderByField to avoid index requirements
        });
    }

    // Subscribe to performance goals
    subscribeToPerformanceGoals(
        callback: (goals: any[], changes: any) => void,
        employeeId?: string
    ): string {
        return this.subscribeToCollection('performanceGoals', callback, {
            employeeId,
            orderByField: 'createdAt',
            orderDirection: 'desc',
            limit: 30
        });
    }

    // Subscribe to attendance records
    subscribeToAttendance(
        callback: (attendance: any[], changes: any) => void,
        employeeId?: string
    ): string {
        return this.subscribeToCollection('attendance', callback, {
            employeeId,
            orderByField: 'date',
            orderDirection: 'desc',
            limit: 30
        });
    }

    // Unsubscribe from a specific subscription
    unsubscribe(subscriptionId: string): void {
        const unsubscribe = this.subscriptions.get(subscriptionId);
        if (unsubscribe) {
            unsubscribe();
            this.subscriptions.delete(subscriptionId);
            console.log(`📡 Unsubscribed from: ${subscriptionId}`);
        }
    }

    // Unsubscribe from all subscriptions
    unsubscribeAll(): void {
        this.subscriptions.forEach((unsubscribe, subscriptionId) => {
            unsubscribe();
            console.log(`📡 Unsubscribed from: ${subscriptionId}`);
        });
        this.subscriptions.clear();
    }

    // Get active subscriptions count
    getActiveSubscriptionsCount(): number {
        return this.subscriptions.size;
    }

    // Get list of active subscriptions
    getActiveSubscriptions(): string[] {
        return Array.from(this.subscriptions.keys());
    }
}

// Global instance
let syncService: RealTimeSyncService | null = null;

export function getRealTimeSyncService(): RealTimeSyncService {
    if (!syncService) {
        syncService = new RealTimeSyncService();
    }
    return syncService;
}

// Helper function to test real-time sync
export async function testRealTimeSync(): Promise<boolean> {
    console.log('🧪 Testing Real-Time Synchronization...');

    const service = getRealTimeSyncService();
    let testPassed = false;

    try {
        // Subscribe to leave requests
        const subscriptionId = service.subscribeToLeaveRequests((data, changes) => {
            console.log('📡 Leave requests real-time update received:', {
                count: data.length,
                changes: changes
            });
            testPassed = true;
        });

        // Wait a moment for the subscription to establish
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Clean up
        service.unsubscribe(subscriptionId);

        console.log('✅ Real-time sync test completed');
        return testPassed;
    } catch (error) {
        console.error('❌ Real-time sync test failed:', error);
        return false;
    }
}
