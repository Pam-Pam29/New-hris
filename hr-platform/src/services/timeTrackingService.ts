import {
    collection,
    doc,
    getDocs,
    getDoc,
    addDoc,
    updateDoc,
    deleteDoc,
    query,
    where,
    orderBy,
    Timestamp,
    onSnapshot,
    Unsubscribe,
    serverTimestamp
} from 'firebase/firestore';
import { isFirebaseConfigured, getServiceConfig, initializeFirebase } from '../config/firebase';
import type { Firestore } from 'firebase/firestore';

// Time Entry Types
export interface TimeEntry {
    id: string;
    employeeId: string;
    employeeName: string;
    clockIn: Date | string;
    clockOut?: Date | string;
    location?: GeoLocation;
    clockInLocation?: GeoLocation;
    clockOutLocation?: GeoLocation;
    photos?: string[];
    breakTime: number; // in minutes
    notes?: string;
    status: 'active' | 'completed' | 'adjusted';
    adjustmentRequestId?: string;
    createdAt: Date | string;
    updatedAt: Date | string;
    lastModified?: any;
}

export interface GeoLocation {
    latitude: number;
    longitude: number;
    address?: string;
    accuracy?: number;
    timestamp: Date | string;
}

export interface TimeAdjustmentRequest {
    id: string;
    timeEntryId: string;
    employeeId: string;
    employeeName: string;
    originalClockIn: Date | string;
    originalClockOut?: Date | string;
    requestedClockIn: Date | string;
    requestedClockOut?: Date | string;
    reason: 'forgot_clock_in' | 'forgot_clock_out' | 'system_error' | 'wrong_time' | 'other';
    reasonText: string;
    notes?: string;
    status: 'pending' | 'approved' | 'rejected';
    reviewedBy?: string;
    reviewedAt?: Date | string;
    reviewNotes?: string;
    createdAt: Date | string;
    updatedAt?: Date | string;
}

export interface Schedule {
    id: string;
    employeeId: string;
    startDate: Date | string;
    endDate?: Date | string;
    shiftType: 'morning' | 'afternoon' | 'night' | 'flexible';
    workDays: number[]; // 0-6 (Sunday-Saturday)
    workHours: number;
    breakDuration: number;
    location?: string;
    isActive: boolean;
}

// Time Tracking Service Interface
export interface ITimeTrackingService {
    // Time Entries
    getTimeEntries(employeeId?: string): Promise<TimeEntry[]>;
    getTimeEntryById(id: string): Promise<TimeEntry | null>;
    createTimeEntry(entry: Omit<TimeEntry, 'id'>): Promise<TimeEntry>;
    updateTimeEntry(id: string, entry: Partial<TimeEntry>): Promise<TimeEntry>;
    deleteTimeEntry(id: string): Promise<void>;
    clockIn(employeeId: string, employeeName: string, location?: GeoLocation, photo?: string): Promise<TimeEntry>;
    clockOut(timeEntryId: string, location?: GeoLocation, photo?: string): Promise<TimeEntry>;

    // Time Adjustment Requests
    getAdjustmentRequests(employeeId?: string, status?: string): Promise<TimeAdjustmentRequest[]>;
    getAdjustmentRequestById(id: string): Promise<TimeAdjustmentRequest | null>;
    createAdjustmentRequest(request: Omit<TimeAdjustmentRequest, 'id'>): Promise<TimeAdjustmentRequest>;
    updateAdjustmentRequest(id: string, request: Partial<TimeAdjustmentRequest>): Promise<TimeAdjustmentRequest>;
    approveAdjustmentRequest(id: string, reviewedBy: string, notes?: string): Promise<TimeAdjustmentRequest>;
    rejectAdjustmentRequest(id: string, reviewedBy: string, notes?: string): Promise<TimeAdjustmentRequest>;

    // Schedule
    getSchedule(employeeId: string): Promise<Schedule | null>;
    createSchedule(schedule: Omit<Schedule, 'id'>): Promise<Schedule>;
    updateSchedule(id: string, schedule: Partial<Schedule>): Promise<Schedule>;

    // Real-time subscriptions
    subscribeToTimeEntries(callback: (entries: TimeEntry[]) => void, employeeId?: string): Unsubscribe;
    subscribeToAdjustmentRequests(callback: (requests: TimeAdjustmentRequest[]) => void, status?: string): Unsubscribe;
}

// Firebase Implementation
export class FirebaseTimeTrackingService implements ITimeTrackingService {
    private db: Firestore;

    constructor(db: Firestore) {
        this.db = db;
    }

    // Time Entries
    async getTimeEntries(employeeId?: string): Promise<TimeEntry[]> {
        try {
            const entriesRef = collection(this.db, 'timeEntries');
            let q = query(entriesRef, orderBy('clockIn', 'desc'));

            if (employeeId) {
                q = query(entriesRef, where('employeeId', '==', employeeId), orderBy('clockIn', 'desc'));
            }

            const snapshot = await getDocs(q);
            return snapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    id: doc.id,
                    ...data,
                    clockIn: data.clockIn?.toDate?.() || data.clockIn,
                    clockOut: data.clockOut?.toDate?.() || data.clockOut,
                    createdAt: data.createdAt?.toDate?.() || data.createdAt,
                    updatedAt: data.updatedAt?.toDate?.() || data.updatedAt,
                } as TimeEntry;
            });
        } catch (error) {
            console.error('Error fetching time entries:', error);
            return [];
        }
    }

    async getTimeEntryById(id: string): Promise<TimeEntry | null> {
        try {
            const docRef = doc(this.db, 'timeEntries', id);
            const docSnap = await getDoc(docRef);

            if (!docSnap.exists()) return null;

            const data = docSnap.data();
            return {
                id: docSnap.id,
                ...data,
                clockIn: data.clockIn?.toDate?.() || data.clockIn,
                clockOut: data.clockOut?.toDate?.() || data.clockOut,
                createdAt: data.createdAt?.toDate?.() || data.createdAt,
                updatedAt: data.updatedAt?.toDate?.() || data.updatedAt,
            } as TimeEntry;
        } catch (error) {
            console.error('Error fetching time entry:', error);
            return null;
        }
    }

    async createTimeEntry(entry: Omit<TimeEntry, 'id'>): Promise<TimeEntry> {
        const entriesRef = collection(this.db, 'timeEntries');
        const docRef = await addDoc(entriesRef, {
            ...entry,
            clockIn: entry.clockIn instanceof Date ? Timestamp.fromDate(entry.clockIn) : Timestamp.now(),
            clockOut: entry.clockOut instanceof Date ? Timestamp.fromDate(entry.clockOut as Date) : null,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
        });

        return { id: docRef.id, ...entry };
    }

    async updateTimeEntry(id: string, entry: Partial<TimeEntry>): Promise<TimeEntry> {
        const docRef = doc(this.db, 'timeEntries', id);
        const updates: any = {
            ...entry,
            updatedAt: serverTimestamp(),
        };

        if (entry.clockIn instanceof Date) {
            updates.clockIn = Timestamp.fromDate(entry.clockIn);
        }
        if (entry.clockOut instanceof Date) {
            updates.clockOut = Timestamp.fromDate(entry.clockOut);
        }

        await updateDoc(docRef, updates);
        const updated = await this.getTimeEntryById(id);
        if (!updated) throw new Error('Time entry not found after update');
        return updated;
    }

    async deleteTimeEntry(id: string): Promise<void> {
        await deleteDoc(doc(this.db, 'timeEntries', id));
    }

    async clockIn(employeeId: string, employeeName: string, location?: GeoLocation, photo?: string): Promise<TimeEntry> {
        const entry: Omit<TimeEntry, 'id'> = {
            employeeId,
            employeeName,
            clockIn: new Date(),
            clockInLocation: location,
            location,
            photos: photo ? [photo] : [],
            breakTime: 0,
            status: 'active',
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        return this.createTimeEntry(entry);
    }

    async clockOut(timeEntryId: string, location?: GeoLocation, photo?: string): Promise<TimeEntry> {
        const entry = await this.getTimeEntryById(timeEntryId);
        if (!entry) throw new Error('Time entry not found');

        const updates: Partial<TimeEntry> = {
            clockOut: new Date(),
            clockOutLocation: location,
            status: 'completed',
        };

        if (photo && entry.photos) {
            updates.photos = [...entry.photos, photo];
        }

        return this.updateTimeEntry(timeEntryId, updates);
    }

    // Time Adjustment Requests
    async getAdjustmentRequests(employeeId?: string, status?: string): Promise<TimeAdjustmentRequest[]> {
        try {
            const requestsRef = collection(this.db, 'timeAdjustmentRequests');
            let q = query(requestsRef, orderBy('createdAt', 'desc'));

            if (employeeId && status) {
                q = query(
                    requestsRef,
                    where('employeeId', '==', employeeId),
                    where('status', '==', status),
                    orderBy('createdAt', 'desc')
                );
            } else if (employeeId) {
                q = query(requestsRef, where('employeeId', '==', employeeId), orderBy('createdAt', 'desc'));
            } else if (status) {
                q = query(requestsRef, where('status', '==', status), orderBy('createdAt', 'desc'));
            }

            const snapshot = await getDocs(q);
            return snapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    id: doc.id,
                    ...data,
                    originalClockIn: data.originalClockIn?.toDate?.() || data.originalClockIn,
                    originalClockOut: data.originalClockOut?.toDate?.() || data.originalClockOut,
                    requestedClockIn: data.requestedClockIn?.toDate?.() || data.requestedClockIn,
                    requestedClockOut: data.requestedClockOut?.toDate?.() || data.requestedClockOut,
                    createdAt: data.createdAt?.toDate?.() || data.createdAt,
                    reviewedAt: data.reviewedAt?.toDate?.() || data.reviewedAt,
                } as TimeAdjustmentRequest;
            });
        } catch (error) {
            console.error('Error fetching adjustment requests:', error);
            return [];
        }
    }

    async getAdjustmentRequestById(id: string): Promise<TimeAdjustmentRequest | null> {
        try {
            const docRef = doc(this.db, 'timeAdjustmentRequests', id);
            const docSnap = await getDoc(docRef);

            if (!docSnap.exists()) return null;

            const data = docSnap.data();
            return {
                id: docSnap.id,
                ...data,
                originalClockIn: data.originalClockIn?.toDate?.() || data.originalClockIn,
                originalClockOut: data.originalClockOut?.toDate?.() || data.originalClockOut,
                requestedClockIn: data.requestedClockIn?.toDate?.() || data.requestedClockIn,
                requestedClockOut: data.requestedClockOut?.toDate?.() || data.requestedClockOut,
                createdAt: data.createdAt?.toDate?.() || data.createdAt,
                reviewedAt: data.reviewedAt?.toDate?.() || data.reviewedAt,
            } as TimeAdjustmentRequest;
        } catch (error) {
            console.error('Error fetching adjustment request:', error);
            return null;
        }
    }

    async createAdjustmentRequest(request: Omit<TimeAdjustmentRequest, 'id'>): Promise<TimeAdjustmentRequest> {
        const requestsRef = collection(this.db, 'timeAdjustmentRequests');
        const docRef = await addDoc(requestsRef, {
            ...request,
            status: 'pending',
            createdAt: serverTimestamp(),
        });

        return { id: docRef.id, ...request, status: 'pending', createdAt: new Date() };
    }

    async updateAdjustmentRequest(id: string, request: Partial<TimeAdjustmentRequest>): Promise<TimeAdjustmentRequest> {
        const docRef = doc(this.db, 'timeAdjustmentRequests', id);
        await updateDoc(docRef, {
            ...request,
            updatedAt: serverTimestamp(),
        });

        const updated = await this.getAdjustmentRequestById(id);
        if (!updated) throw new Error('Adjustment request not found after update');
        return updated;
    }

    async approveAdjustmentRequest(id: string, reviewedBy: string, notes?: string): Promise<TimeAdjustmentRequest> {
        const request = await this.getAdjustmentRequestById(id);
        if (!request) throw new Error('Adjustment request not found');

        // Update the original time entry
        if (request.timeEntryId) {
            await this.updateTimeEntry(request.timeEntryId, {
                clockIn: request.requestedClockIn,
                clockOut: request.requestedClockOut,
                status: 'adjusted',
                adjustmentRequestId: id,
            });
        }

        // Update the request status
        return this.updateAdjustmentRequest(id, {
            status: 'approved',
            reviewedBy,
            reviewedAt: new Date(),
            reviewNotes: notes,
        });
    }

    async rejectAdjustmentRequest(id: string, reviewedBy: string, notes?: string): Promise<TimeAdjustmentRequest> {
        return this.updateAdjustmentRequest(id, {
            status: 'rejected',
            reviewedBy,
            reviewedAt: new Date(),
            reviewNotes: notes,
        });
    }

    // Schedule
    async getSchedule(employeeId: string): Promise<Schedule | null> {
        try {
            const schedulesRef = collection(this.db, 'schedules');
            const q = query(
                schedulesRef,
                where('employeeId', '==', employeeId),
                where('isActive', '==', true)
            );

            const snapshot = await getDocs(q);
            if (snapshot.empty) return null;

            const doc = snapshot.docs[0];
            const data = doc.data();
            return {
                id: doc.id,
                ...data,
                startDate: data.startDate?.toDate?.() || data.startDate,
                endDate: data.endDate?.toDate?.() || data.endDate,
            } as Schedule;
        } catch (error) {
            console.error('Error fetching schedule:', error);
            return null;
        }
    }

    async createSchedule(schedule: Omit<Schedule, 'id'>): Promise<Schedule> {
        const schedulesRef = collection(this.db, 'schedules');
        const docRef = await addDoc(schedulesRef, schedule);
        return { id: docRef.id, ...schedule };
    }

    async updateSchedule(id: string, schedule: Partial<Schedule>): Promise<Schedule> {
        const docRef = doc(this.db, 'schedules', id);
        await updateDoc(docRef, schedule);

        const updated = await getDoc(docRef);
        if (!updated.exists()) throw new Error('Schedule not found after update');

        const data = updated.data();
        return {
            id: updated.id,
            ...data,
            startDate: data.startDate?.toDate?.() || data.startDate,
            endDate: data.endDate?.toDate?.() || data.endDate,
        } as Schedule;
    }

    // Real-time subscriptions
    subscribeToTimeEntries(callback: (entries: TimeEntry[]) => void, employeeId?: string): Unsubscribe {
        const entriesRef = collection(this.db, 'timeEntries');
        let q = query(entriesRef, orderBy('clockIn', 'desc'));

        if (employeeId) {
            q = query(entriesRef, where('employeeId', '==', employeeId), orderBy('clockIn', 'desc'));
        }

        return onSnapshot(q, (snapshot) => {
            const entries = snapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    id: doc.id,
                    ...data,
                    clockIn: data.clockIn?.toDate?.() || data.clockIn,
                    clockOut: data.clockOut?.toDate?.() || data.clockOut,
                    createdAt: data.createdAt?.toDate?.() || data.createdAt,
                    updatedAt: data.updatedAt?.toDate?.() || data.updatedAt,
                } as TimeEntry;
            });
            callback(entries);
        });
    }

    subscribeToAdjustmentRequests(callback: (requests: TimeAdjustmentRequest[]) => void, status?: string): Unsubscribe {
        const requestsRef = collection(this.db, 'timeAdjustmentRequests');
        let q = query(requestsRef, orderBy('createdAt', 'desc'));

        if (status) {
            q = query(requestsRef, where('status', '==', status), orderBy('createdAt', 'desc'));
        }

        return onSnapshot(q, (snapshot) => {
            const requests = snapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    id: doc.id,
                    ...data,
                    originalClockIn: data.originalClockIn?.toDate?.() || data.originalClockIn,
                    originalClockOut: data.originalClockOut?.toDate?.() || data.originalClockOut,
                    requestedClockIn: data.requestedClockIn?.toDate?.() || data.requestedClockIn,
                    requestedClockOut: data.requestedClockOut?.toDate?.() || data.requestedClockOut,
                    createdAt: data.createdAt?.toDate?.() || data.createdAt,
                    reviewedAt: data.reviewedAt?.toDate?.() || data.reviewedAt,
                } as TimeAdjustmentRequest;
            });
            callback(requests);
        });
    }
}

// Mock Implementation for Development
export class MockTimeTrackingService implements ITimeTrackingService {
    private timeEntries: TimeEntry[] = [];
    private adjustmentRequests: TimeAdjustmentRequest[] = [];
    private schedules: Schedule[] = [];

    async getTimeEntries(employeeId?: string): Promise<TimeEntry[]> {
        if (employeeId) {
            return this.timeEntries.filter(e => e.employeeId === employeeId);
        }
        return this.timeEntries;
    }

    async getTimeEntryById(id: string): Promise<TimeEntry | null> {
        return this.timeEntries.find(e => e.id === id) || null;
    }

    async createTimeEntry(entry: Omit<TimeEntry, 'id'>): Promise<TimeEntry> {
        const newEntry: TimeEntry = {
            ...entry,
            id: `te-${Date.now()}`,
            createdAt: new Date(),
            updatedAt: new Date(),
        };
        this.timeEntries.unshift(newEntry);
        return newEntry;
    }

    async updateTimeEntry(id: string, entry: Partial<TimeEntry>): Promise<TimeEntry> {
        const index = this.timeEntries.findIndex(e => e.id === id);
        if (index === -1) throw new Error('Time entry not found');

        this.timeEntries[index] = {
            ...this.timeEntries[index],
            ...entry,
            updatedAt: new Date(),
        };
        return this.timeEntries[index];
    }

    async deleteTimeEntry(id: string): Promise<void> {
        this.timeEntries = this.timeEntries.filter(e => e.id !== id);
    }

    async clockIn(employeeId: string, employeeName: string, location?: GeoLocation, photo?: string): Promise<TimeEntry> {
        return this.createTimeEntry({
            employeeId,
            employeeName,
            clockIn: new Date(),
            clockInLocation: location,
            location,
            photos: photo ? [photo] : [],
            breakTime: 0,
            status: 'active',
            createdAt: new Date(),
            updatedAt: new Date(),
        });
    }

    async clockOut(timeEntryId: string, location?: GeoLocation, photo?: string): Promise<TimeEntry> {
        const entry = await this.getTimeEntryById(timeEntryId);
        if (!entry) throw new Error('Time entry not found');

        return this.updateTimeEntry(timeEntryId, {
            clockOut: new Date(),
            clockOutLocation: location,
            status: 'completed',
            photos: photo ? [...(entry.photos || []), photo] : entry.photos,
        });
    }

    async getAdjustmentRequests(employeeId?: string, status?: string): Promise<TimeAdjustmentRequest[]> {
        let filtered = this.adjustmentRequests;

        if (employeeId) {
            filtered = filtered.filter(r => r.employeeId === employeeId);
        }
        if (status) {
            filtered = filtered.filter(r => r.status === status);
        }

        return filtered;
    }

    async getAdjustmentRequestById(id: string): Promise<TimeAdjustmentRequest | null> {
        return this.adjustmentRequests.find(r => r.id === id) || null;
    }

    async createAdjustmentRequest(request: Omit<TimeAdjustmentRequest, 'id'>): Promise<TimeAdjustmentRequest> {
        const newRequest: TimeAdjustmentRequest = {
            ...request,
            id: `ar-${Date.now()}`,
            status: 'pending',
            createdAt: new Date(),
        };
        this.adjustmentRequests.unshift(newRequest);
        return newRequest;
    }

    async updateAdjustmentRequest(id: string, request: Partial<TimeAdjustmentRequest>): Promise<TimeAdjustmentRequest> {
        const index = this.adjustmentRequests.findIndex(r => r.id === id);
        if (index === -1) throw new Error('Adjustment request not found');

        this.adjustmentRequests[index] = {
            ...this.adjustmentRequests[index],
            ...request,
            updatedAt: new Date(),
        };
        return this.adjustmentRequests[index];
    }

    async approveAdjustmentRequest(id: string, reviewedBy: string, notes?: string): Promise<TimeAdjustmentRequest> {
        const request = await this.getAdjustmentRequestById(id);
        if (!request) throw new Error('Adjustment request not found');

        if (request.timeEntryId) {
            await this.updateTimeEntry(request.timeEntryId, {
                clockIn: request.requestedClockIn,
                clockOut: request.requestedClockOut,
                status: 'adjusted',
                adjustmentRequestId: id,
            });
        }

        return this.updateAdjustmentRequest(id, {
            status: 'approved',
            reviewedBy,
            reviewedAt: new Date(),
            reviewNotes: notes,
        });
    }

    async rejectAdjustmentRequest(id: string, reviewedBy: string, notes?: string): Promise<TimeAdjustmentRequest> {
        return this.updateAdjustmentRequest(id, {
            status: 'rejected',
            reviewedBy,
            reviewedAt: new Date(),
            reviewNotes: notes,
        });
    }

    async getSchedule(employeeId: string): Promise<Schedule | null> {
        return this.schedules.find(s => s.employeeId === employeeId && s.isActive) || null;
    }

    async createSchedule(schedule: Omit<Schedule, 'id'>): Promise<Schedule> {
        const newSchedule: Schedule = {
            ...schedule,
            id: `sch-${Date.now()}`,
        };
        this.schedules.push(newSchedule);
        return newSchedule;
    }

    async updateSchedule(id: string, schedule: Partial<Schedule>): Promise<Schedule> {
        const index = this.schedules.findIndex(s => s.id === id);
        if (index === -1) throw new Error('Schedule not found');

        this.schedules[index] = {
            ...this.schedules[index],
            ...schedule,
        };
        return this.schedules[index];
    }

    subscribeToTimeEntries(callback: (entries: TimeEntry[]) => void, employeeId?: string): Unsubscribe {
        const entries = employeeId
            ? this.timeEntries.filter(e => e.employeeId === employeeId)
            : this.timeEntries;
        callback(entries);
        return () => { };
    }

    subscribeToAdjustmentRequests(callback: (requests: TimeAdjustmentRequest[]) => void, status?: string): Unsubscribe {
        const requests = status
            ? this.adjustmentRequests.filter(r => r.status === status)
            : this.adjustmentRequests;
        callback(requests);
        return () => { };
    }
}

// Service Factory
export class TimeTrackingServiceFactory {
    static async createService(): Promise<ITimeTrackingService> {
        await initializeFirebase();
        const config = await getServiceConfig();

        if (config.defaultService === 'firebase' && config.firebase.enabled && config.firebase.db) {
            console.log('✅ Using Firebase Time Tracking Service (HR)');
            return new FirebaseTimeTrackingService(config.firebase.db as Firestore);
        }

        console.log('⚠️ Using Mock Time Tracking Service (HR)');
        return new MockTimeTrackingService();
    }
}

// Singleton instance
let timeTrackingServiceInstance: ITimeTrackingService | null = null;

export async function getTimeTrackingService(): Promise<ITimeTrackingService> {
    if (!timeTrackingServiceInstance) {
        timeTrackingServiceInstance = await TimeTrackingServiceFactory.createService();
    }
    return timeTrackingServiceInstance;
}

