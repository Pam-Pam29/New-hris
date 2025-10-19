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
    serverTimestamp,
    writeBatch
} from 'firebase/firestore';
import { getServiceConfig, initializeFirebase } from '../config/firebase';
import type { Firestore } from 'firebase/firestore';

// Schedule Types
export interface WorkSchedule {
    id: string;
    employeeId: string;
    employeeName: string;
    department?: string;
    startDate: Date | string;
    endDate?: Date | string;
    shiftType: 'morning' | 'afternoon' | 'night' | 'flexible' | 'custom';
    workDays: number[]; // 0-6 (Sunday-Saturday)
    workHours: number; // Hours per day
    breakDuration: number; // Minutes
    location?: string;
    shiftStartTime?: string; // e.g., "09:00"
    shiftEndTime?: string; // e.g., "17:00"
    isActive: boolean;
    notes?: string;
    createdAt: Date | string;
    updatedAt?: Date | string;
    createdBy?: string;
}

export interface ShiftTemplate {
    id: string;
    name: string;
    description: string;
    shiftType: 'morning' | 'afternoon' | 'night' | 'flexible' | 'custom';
    startTime: string;
    endTime: string;
    workHours: number;
    breakDuration: number;
    workDays: number[];
    isDefault: boolean;
}

// Service Interface
export interface IScheduleService {
    // Schedule CRUD
    getSchedules(employeeId?: string, activeOnly?: boolean): Promise<WorkSchedule[]>;
    getScheduleById(id: string): Promise<WorkSchedule | null>;
    
    // Real-time
    subscribeToSchedules(callback: (schedules: WorkSchedule[]) => void, employeeId?: string): Unsubscribe;
}

// Firebase Implementation
export class FirebaseScheduleService implements IScheduleService {
    private db: Firestore;

    constructor(db: Firestore) {
        this.db = db;
    }

    async getSchedules(employeeId?: string, activeOnly: boolean = false): Promise<WorkSchedule[]> {
        try {
            const schedulesRef = collection(this.db, 'schedules');
            let q = query(schedulesRef, orderBy('createdAt', 'desc'));
            
            if (employeeId && activeOnly) {
                q = query(
                    schedulesRef,
                    where('employeeId', '==', employeeId),
                    where('isActive', '==', true)
                );
            } else if (employeeId) {
                q = query(schedulesRef, where('employeeId', '==', employeeId));
            } else if (activeOnly) {
                q = query(schedulesRef, where('isActive', '==', true));
            }
            
            const snapshot = await getDocs(q);
            return snapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    id: doc.id,
                    ...data,
                    startDate: data.startDate?.toDate?.() || data.startDate,
                    endDate: data.endDate?.toDate?.() || data.endDate,
                    createdAt: data.createdAt?.toDate?.() || data.createdAt,
                    updatedAt: data.updatedAt?.toDate?.() || data.updatedAt,
                } as WorkSchedule;
            });
        } catch (error) {
            console.error('Error fetching schedules:', error);
            return [];
        }
    }

    async getScheduleById(id: string): Promise<WorkSchedule | null> {
        try {
            const docRef = doc(this.db, 'schedules', id);
            const docSnap = await getDoc(docRef);
            
            if (!docSnap.exists()) return null;
            
            const data = docSnap.data();
            return {
                id: docSnap.id,
                ...data,
                startDate: data.startDate?.toDate?.() || data.startDate,
                endDate: data.endDate?.toDate?.() || data.endDate,
                createdAt: data.createdAt?.toDate?.() || data.createdAt,
                updatedAt: data.updatedAt?.toDate?.() || data.updatedAt,
            } as WorkSchedule;
        } catch (error) {
            console.error('Error fetching schedule:', error);
            return null;
        }
    }

    subscribeToSchedules(callback: (schedules: WorkSchedule[]) => void, employeeId?: string): Unsubscribe {
        const schedulesRef = collection(this.db, 'schedules');
        let q = query(schedulesRef, orderBy('createdAt', 'desc'));
        
        if (employeeId) {
            q = query(
                schedulesRef,
                where('employeeId', '==', employeeId),
                orderBy('createdAt', 'desc')
            );
        }
        
        return onSnapshot(q, (snapshot) => {
            const schedules = snapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    id: doc.id,
                    ...data,
                    startDate: data.startDate?.toDate?.() || data.startDate,
                    endDate: data.endDate?.toDate?.() || data.endDate,
                    createdAt: data.createdAt?.toDate?.() || data.createdAt,
                    updatedAt: data.updatedAt?.toDate?.() || data.updatedAt,
                } as WorkSchedule;
            });
            callback(schedules);
        });
    }
}

// Mock Implementation
export class MockScheduleService implements IScheduleService {
    private schedules: WorkSchedule[] = [];

    async getSchedules(employeeId?: string, activeOnly: boolean = false): Promise<WorkSchedule[]> {
        let filtered = this.schedules;
        
        if (employeeId) {
            filtered = filtered.filter(s => s.employeeId === employeeId);
        }
        if (activeOnly) {
            filtered = filtered.filter(s => s.isActive);
        }
        
        return filtered;
    }

    async getScheduleById(id: string): Promise<WorkSchedule | null> {
        return this.schedules.find(s => s.id === id) || null;
    }

    subscribeToSchedules(callback: (schedules: WorkSchedule[]) => void, employeeId?: string): Unsubscribe {
        const schedules = employeeId
            ? this.schedules.filter(s => s.employeeId === employeeId)
            : this.schedules;
        callback(schedules);
        return () => {};
    }
}

// Service Factory
export class ScheduleServiceFactory {
    static async createService(): Promise<IScheduleService> {
        await initializeFirebase();
        const config = await getServiceConfig();

        if (config.defaultService === 'firebase' && config.firebase.enabled && config.firebase.db) {
            console.log('✅ Using Firebase Schedule Service');
            return new FirebaseScheduleService(config.firebase.db as Firestore);
        }

        console.log('⚠️ Using Mock Schedule Service');
        return new MockScheduleService();
    }
}

// Singleton instance
let scheduleServiceInstance: IScheduleService | null = null;

export async function getScheduleService(): Promise<IScheduleService> {
    if (!scheduleServiceInstance) {
        scheduleServiceInstance = await ScheduleServiceFactory.createService();
    }
    return scheduleServiceInstance;
}

// Helper functions
export function getShortDayName(dayNumber: number): string {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return days[dayNumber] || '';
}

export function getDayName(dayNumber: number): string {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[dayNumber] || '';
}


