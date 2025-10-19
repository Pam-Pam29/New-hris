import { useState, useEffect, useCallback, useMemo } from 'react';
import { getRealTimeSyncService } from '../services/realTimeSyncService';

// Custom hook for real-time synchronization
export function useRealTimeSync<T>(
    collectionName: string,
    options: {
        employeeId?: string;
        companyId?: string; // ← Add companyId for multi-tenancy
        limit?: number;
        orderByField?: string;
        orderDirection?: 'asc' | 'desc';
    } = {}
) {
    const [data, setData] = useState<T[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [changes, setChanges] = useState<any>(null);
    const [subscriptionId, setSubscriptionId] = useState<string | null>(null);

    const syncService = getRealTimeSyncService();

    // Memoize options to prevent unnecessary re-renders
    const memoizedOptions = useMemo(() => options, [
        options.employeeId,
        options.companyId,
        options.limit,
        options.orderByField,
        options.orderDirection
    ]);

    // Remove subscriptionId from dependencies to avoid unnecessary recreations
    const startSync = useCallback(() => {
        // Check current subscription state before subscribing
        if (subscriptionId) {
            // Already subscribed
            return;
        }

        try {
            setLoading(true);
            setError(null);

            const id = syncService.subscribeToCollection(
                collectionName,
                (newData, newChanges) => {
                    setData(newData as T[]);
                    setChanges(newChanges);
                    setLoading(false);
                    setError(null);
                },
                memoizedOptions
            );

            setSubscriptionId(id);
            console.log(`📡 Started real-time sync for ${collectionName}`);
        } catch (err: any) {
            setError(err.message);
            setLoading(false);
            console.error(`❌ Failed to start sync for ${collectionName}:`, err);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [collectionName, syncService, memoizedOptions]);

    const stopSync = useCallback(() => {
        // Use ref to check current subscription state
        if (subscriptionId) {
            syncService.unsubscribe(subscriptionId);
            setSubscriptionId(null);
            console.log(`📡 Stopped real-time sync for ${collectionName}`);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [syncService, collectionName]);

    // Auto-start sync on mount
    useEffect(() => {
        startSync();

        // Cleanup on unmount
        return () => {
            stopSync();
        };
    }, [startSync, stopSync]);

    // Restart sync when options change (with proper dependency checking)
    useEffect(() => {
        if (subscriptionId) {
            stopSync();
            startSync();
        }
    }, [memoizedOptions]);

    return {
        data,
        loading,
        error,
        changes,
        isSubscribed: !!subscriptionId,
        startSync,
        stopSync,
        restartSync: () => {
            stopSync();
            startSync();
        }
    };
}

// Specialized hooks for common collections
export function useLeaveRequests(employeeId?: string, companyId?: string) {
    return useRealTimeSync('leaveRequests', {
        employeeId,
        companyId, // ← Add company filter for multi-tenancy
        limit: 50
        // Removed orderBy to avoid index requirements
    });
}

export function useNotifications(employeeId?: string) {
    return useRealTimeSync('notifications', {
        employeeId,
        limit: 20
        // Removed orderBy to avoid index requirements
    });
}

export function useEmployees() {
    return useRealTimeSync('employees', {
        limit: 100
    });
}

export function useLeaveTypes(companyId?: string) {
    return useRealTimeSync('leaveTypes', {
        companyId, // ← Add company filter for multi-tenancy
        limit: 50
    });
}

export function usePolicies() {
    return useRealTimeSync('policies', {
        limit: 50
        // Removed orderBy to avoid index requirements
    });
}

export function usePerformanceGoals(employeeId?: string) {
    return useRealTimeSync('performanceGoals', {
        employeeId,
        limit: 30
        // Removed orderBy to avoid index requirements
    });
}

export function useAttendance(employeeId?: string) {
    return useRealTimeSync('attendance', {
        employeeId,
        limit: 30
        // Removed orderBy to avoid index requirements
    });
}

export function usePerformanceMeetings(employeeId?: string) {
    return useRealTimeSync('performanceMeetings', {
        employeeId,
        limit: 50
        // Removed orderBy to avoid index requirements
    });
}

export function usePerformanceReviews(employeeId?: string) {
    return useRealTimeSync('performanceReviews', {
        employeeId,
        limit: 50
        // Removed orderBy to avoid index requirements
    });
}