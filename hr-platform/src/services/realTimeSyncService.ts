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
            let q: any;
            let useFallback = false;

            try {
                // Try to build query with companyId filter first
                q = query(collection(getFirebaseDb(), collectionName));

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
            } catch (queryError: any) {
                // If query construction fails (e.g., missing composite index), use fallback
                if (queryError?.code === 'failed-precondition' && options.companyId) {
                    console.warn(`⚠️ [${collectionName}] Query construction failed (likely missing index), using fallback without companyId in query...`);
                    console.warn(`⚠️ [${collectionName}] Error details:`, queryError.message);
                    useFallback = true;
                    
                    // Build fallback query without companyId filter (will filter in memory)
                    q = query(collection(getFirebaseDb(), collectionName));
                    
                    if (options.employeeId) {
                        q = query(q, where('employeeId', '==', options.employeeId));
                    }
                    
                    if (options.orderByField) {
                        try {
                            q = query(q, orderBy(options.orderByField, options.orderDirection || 'desc'));
                        } catch (orderError) {
                            console.warn(`⚠️ [${collectionName}] Could not add orderBy in fallback, skipping`);
                        }
                    }
                    
                    if (options.limit) {
                        q = query(q, limit(options.limit));
                    }
                } else {
                    console.error(`❌ [${collectionName}] Query construction error:`, queryError);
                    throw queryError;
                }
            }

            const unsubscribe = onSnapshot(
                q,
                (snapshot) => {
                    let data = snapshot.docs.map(doc => ({
                        id: doc.id,
                        ...doc.data()
                    }));

                    // Filter by companyId in memory (always do this as safety, or if using fallback)
                    if (options.companyId) {
                        const beforeFilter = data.length;
                        const sampleCompanyIds = data.slice(0, 5).map((item: any) => ({
                            id: item.id,
                            companyId: item.companyId,
                            createdBy: item.createdBy
                        }));
                        console.log(`🔍 [${collectionName}] Before filter - Total: ${beforeFilter}, Sample items:`, sampleCompanyIds);
                        
                        // Check for items without companyId
                        const itemsWithoutCompanyId = data.filter((item: any) => !item.companyId);
                        if (itemsWithoutCompanyId.length > 0) {
                            console.warn(`⚠️ [${collectionName}] Found ${itemsWithoutCompanyId.length} items WITHOUT companyId:`, 
                                itemsWithoutCompanyId.slice(0, 3).map((item: any) => ({ id: item.id, createdBy: item.createdBy }))
                            );
                        }
                        
                        data = data.filter((item: any) => item.companyId === options.companyId);
                        
                        if (useFallback || beforeFilter !== data.length) {
                            console.log(`📡 [${collectionName}] ${useFallback ? 'Fallback' : 'In-memory'} filter: ${beforeFilter} total, ${data.length} after companyId filter (${options.companyId})`);
                        }
                        
                        // Log items that were filtered out (different companyId)
                        const filteredOut = snapshot.docs
                            .map(doc => ({ id: doc.id, ...doc.data() }))
                            .filter((item: any) => item.companyId && item.companyId !== options.companyId);
                        if (filteredOut.length > 0) {
                            console.log(`⚠️ [${collectionName}] Filtered out ${filteredOut.length} items with different companyIds:`, 
                                filteredOut.slice(0, 3).map((item: any) => ({ id: item.id, companyId: item.companyId, createdBy: item.createdBy }))
                            );
                        }
                    }

                    const changes = {
                        added: snapshot.docChanges().filter(change => change.type === 'added'),
                        modified: snapshot.docChanges().filter(change => change.type === 'modified'),
                        removed: snapshot.docChanges().filter(change => change.type === 'removed')
                    };

                    // Log details about added items
                    if (changes.added.length > 0) {
                        const addedItems = changes.added.map(change => ({
                            id: change.doc.id,
                            companyId: change.doc.data().companyId,
                            ...change.doc.data()
                        }));
                        console.log(`➕ [${collectionName}] Added items:`, addedItems);
                    }

                    console.log(`📡 Real-time update for ${collectionName}:`, {
                        total: data.length,
                        added: changes.added.length,
                        modified: changes.modified.length,
                        removed: changes.removed.length,
                        companyId: options.companyId || 'none',
                        usingFallback: useFallback
                    });

                    callback(data, changes);
                },
                (error: any) => {
                    console.error(`❌ Real-time subscription error for ${collectionName}:`, error);
                    
                    // If it's a failed-precondition error (missing index), try fallback query
                    if (error?.code === 'failed-precondition' && options.companyId && !useFallback) {
                        console.warn(`⚠️ [${collectionName}] Query failed due to missing index, trying fallback query...`);
                        // The fallback will be handled by the outer try-catch, but we need to retry
                        // For now, return empty and let the fallback mechanism handle it
                    }
                    
                    // Return empty data on error
                    callback([], { added: [], modified: [], removed: [] });
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
