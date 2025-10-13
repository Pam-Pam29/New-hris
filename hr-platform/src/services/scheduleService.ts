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

export interface ScheduleAssignment {
    employeeId: string;
    employeeName: string;
    scheduleId: string;
    assignedAt: Date;
    assignedBy: string;
}

// Service Interface
export interface IScheduleService {
    // Schedule CRUD
    getSchedules(employeeId?: string, activeOnly?: boolean): Promise<WorkSchedule[]>;
    getScheduleById(id: string): Promise<WorkSchedule | null>;
    createSchedule(schedule: Omit<WorkSchedule, 'id'>): Promise<WorkSchedule>;
    updateSchedule(id: string, schedule: Partial<WorkSchedule>): Promise<WorkSchedule>;
    deleteSchedule(id: string): Promise<void>;

    // Bulk operations
    createBulkSchedules(schedules: Omit<WorkSchedule, 'id'>[]): Promise<WorkSchedule[]>;
    assignScheduleToMultipleEmployees(employeeIds: string[], template: Partial<WorkSchedule>): Promise<WorkSchedule[]>;

    // Templates
    getShiftTemplates(): Promise<ShiftTemplate[]>;
    createShiftTemplate(template: Omit<ShiftTemplate, 'id'>): Promise<ShiftTemplate>;

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

    async createSchedule(schedule: Omit<WorkSchedule, 'id'>): Promise<WorkSchedule> {
        const schedulesRef = collection(this.db, 'schedules');

        // Prepare data, excluding undefined fields
        const scheduleData: any = {
            ...schedule,
            startDate: schedule.startDate instanceof Date ? Timestamp.fromDate(schedule.startDate) : schedule.startDate,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
        };

        // Only include endDate if it's defined
        if (schedule.endDate) {
            scheduleData.endDate = schedule.endDate instanceof Date ? Timestamp.fromDate(schedule.endDate as Date) : schedule.endDate;
        }

        const docRef = await addDoc(schedulesRef, scheduleData);

        console.log('✅ Schedule document created with ID:', docRef.id);
        return { id: docRef.id, ...schedule };
    }

    async updateSchedule(id: string, schedule: Partial<WorkSchedule>): Promise<WorkSchedule> {
        const docRef = doc(this.db, 'schedules', id);

        // Build updates object, excluding undefined values
        const updates: any = {
            updatedAt: serverTimestamp(),
        };

        // Only include defined fields
        if (schedule.employeeId !== undefined) updates.employeeId = schedule.employeeId;
        if (schedule.employeeName !== undefined) updates.employeeName = schedule.employeeName;
        if (schedule.department !== undefined) updates.department = schedule.department;
        if (schedule.shiftType !== undefined) updates.shiftType = schedule.shiftType;
        if (schedule.workDays !== undefined) updates.workDays = schedule.workDays;
        if (schedule.workHours !== undefined) updates.workHours = schedule.workHours;
        if (schedule.breakDuration !== undefined) updates.breakDuration = schedule.breakDuration;
        if (schedule.location !== undefined) updates.location = schedule.location;
        if (schedule.shiftStartTime !== undefined) updates.shiftStartTime = schedule.shiftStartTime;
        if (schedule.shiftEndTime !== undefined) updates.shiftEndTime = schedule.shiftEndTime;
        if (schedule.isActive !== undefined) updates.isActive = schedule.isActive;
        if (schedule.notes !== undefined) updates.notes = schedule.notes;
        if (schedule.createdBy !== undefined) updates.createdBy = schedule.createdBy;

        // Handle Date fields - convert to Timestamp if defined
        if (schedule.startDate instanceof Date) {
            updates.startDate = Timestamp.fromDate(schedule.startDate);
        }

        // Only include endDate if it's explicitly provided and is a Date
        if (schedule.endDate && schedule.endDate instanceof Date) {
            updates.endDate = Timestamp.fromDate(schedule.endDate);
        }

        console.log('🔄 Updating schedule with data:', updates);

        await updateDoc(docRef, updates);
        const updated = await this.getScheduleById(id);
        if (!updated) throw new Error('Schedule not found after update');
        return updated;
    }

    async deleteSchedule(id: string): Promise<void> {
        await deleteDoc(doc(this.db, 'schedules', id));
    }

    async createBulkSchedules(schedules: Omit<WorkSchedule, 'id'>[]): Promise<WorkSchedule[]> {
        const batch = writeBatch(this.db);
        const schedulesRef = collection(this.db, 'schedules');
        const createdSchedules: WorkSchedule[] = [];

        for (const schedule of schedules) {
            const docRef = doc(schedulesRef);

            // Prepare data, excluding undefined fields
            const scheduleData: any = {
                ...schedule,
                startDate: schedule.startDate instanceof Date ? Timestamp.fromDate(schedule.startDate) : schedule.startDate,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
            };

            // Only include endDate if it's defined
            if (schedule.endDate) {
                scheduleData.endDate = schedule.endDate instanceof Date ? Timestamp.fromDate(schedule.endDate as Date) : schedule.endDate;
            }

            batch.set(docRef, scheduleData);
            createdSchedules.push({ id: docRef.id, ...schedule });
        }

        await batch.commit();
        console.log('✅ Bulk schedules committed to Firebase:', createdSchedules.length);
        return createdSchedules;
    }

    async assignScheduleToMultipleEmployees(
        employeeIds: string[],
        template: Partial<WorkSchedule>
    ): Promise<WorkSchedule[]> {
        const schedules = employeeIds.map(empId => {
            const scheduleData: any = {
                employeeId: empId,
                employeeName: template.employeeName || '',
                shiftType: template.shiftType || 'morning',
                workDays: template.workDays || [1, 2, 3, 4, 5],
                workHours: template.workHours || 8,
                breakDuration: template.breakDuration || 60,
                startDate: template.startDate || new Date(),
                location: template.location,
                shiftStartTime: template.shiftStartTime,
                shiftEndTime: template.shiftEndTime,
                isActive: true,
                createdAt: new Date(),
            };

            // Only include endDate if it's defined
            if (template.endDate) {
                scheduleData.endDate = template.endDate;
            }

            return scheduleData as Omit<WorkSchedule, 'id'>;
        });

        return this.createBulkSchedules(schedules);
    }

    async getShiftTemplates(): Promise<ShiftTemplate[]> {
        try {
            const templatesRef = collection(this.db, 'shiftTemplates');
            const snapshot = await getDocs(templatesRef);
            return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ShiftTemplate));
        } catch (error) {
            console.error('Error fetching shift templates:', error);
            return this.getDefaultTemplates();
        }
    }

    async createShiftTemplate(template: Omit<ShiftTemplate, 'id'>): Promise<ShiftTemplate> {
        const templatesRef = collection(this.db, 'shiftTemplates');
        const docRef = await addDoc(templatesRef, template);
        return { id: docRef.id, ...template };
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

    private getDefaultTemplates(): ShiftTemplate[] {
        return [
            {
                id: 'template-morning',
                name: 'Morning Shift',
                description: 'Standard morning shift 9 AM - 5 PM',
                shiftType: 'morning',
                startTime: '09:00',
                endTime: '17:00',
                workHours: 8,
                breakDuration: 60,
                workDays: [1, 2, 3, 4, 5],
                isDefault: true
            },
            {
                id: 'template-afternoon',
                name: 'Afternoon Shift',
                description: 'Afternoon shift 1 PM - 9 PM',
                shiftType: 'afternoon',
                startTime: '13:00',
                endTime: '21:00',
                workHours: 8,
                breakDuration: 60,
                workDays: [1, 2, 3, 4, 5],
                isDefault: false
            },
            {
                id: 'template-night',
                name: 'Night Shift',
                description: 'Night shift 9 PM - 5 AM',
                shiftType: 'night',
                startTime: '21:00',
                endTime: '05:00',
                workHours: 8,
                breakDuration: 60,
                workDays: [1, 2, 3, 4, 5],
                isDefault: false
            },
            {
                id: 'template-flexible',
                name: 'Flexible Hours',
                description: 'Flexible work schedule',
                shiftType: 'flexible',
                startTime: '08:00',
                endTime: '18:00',
                workHours: 8,
                breakDuration: 60,
                workDays: [1, 2, 3, 4, 5],
                isDefault: false
            }
        ];
    }
}

// Mock Implementation
export class MockScheduleService implements IScheduleService {
    private schedules: WorkSchedule[] = [];
    private templates: ShiftTemplate[] = [
        {
            id: 'template-morning',
            name: 'Morning Shift',
            description: 'Standard morning shift 9 AM - 5 PM',
            shiftType: 'morning',
            startTime: '09:00',
            endTime: '17:00',
            workHours: 8,
            breakDuration: 60,
            workDays: [1, 2, 3, 4, 5],
            isDefault: true
        }
    ];

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

    async createSchedule(schedule: Omit<WorkSchedule, 'id'>): Promise<WorkSchedule> {
        const newSchedule: WorkSchedule = {
            ...schedule,
            id: `sch-${Date.now()}`,
            createdAt: new Date(),
            updatedAt: new Date(),
        };
        this.schedules.unshift(newSchedule);
        return newSchedule;
    }

    async updateSchedule(id: string, schedule: Partial<WorkSchedule>): Promise<WorkSchedule> {
        const index = this.schedules.findIndex(s => s.id === id);
        if (index === -1) throw new Error('Schedule not found');

        this.schedules[index] = {
            ...this.schedules[index],
            ...schedule,
            updatedAt: new Date(),
        };
        return this.schedules[index];
    }

    async deleteSchedule(id: string): Promise<void> {
        this.schedules = this.schedules.filter(s => s.id !== id);
    }

    async createBulkSchedules(schedules: Omit<WorkSchedule, 'id'>[]): Promise<WorkSchedule[]> {
        const created = [];
        for (const schedule of schedules) {
            created.push(await this.createSchedule(schedule));
        }
        return created;
    }

    async assignScheduleToMultipleEmployees(
        employeeIds: string[],
        template: Partial<WorkSchedule>
    ): Promise<WorkSchedule[]> {
        const schedules = employeeIds.map(empId => ({
            employeeId: empId,
            employeeName: template.employeeName || '',
            shiftType: template.shiftType || 'morning',
            workDays: template.workDays || [1, 2, 3, 4, 5],
            workHours: template.workHours || 8,
            breakDuration: template.breakDuration || 60,
            startDate: template.startDate || new Date(),
            endDate: template.endDate,
            location: template.location,
            shiftStartTime: template.shiftStartTime,
            shiftEndTime: template.shiftEndTime,
            isActive: true,
            createdAt: new Date(),
        } as Omit<WorkSchedule, 'id'>));

        return this.createBulkSchedules(schedules);
    }

    async getShiftTemplates(): Promise<ShiftTemplate[]> {
        return this.templates;
    }

    async createShiftTemplate(template: Omit<ShiftTemplate, 'id'>): Promise<ShiftTemplate> {
        const newTemplate: ShiftTemplate = {
            ...template,
            id: `template-${Date.now()}`,
        };
        this.templates.push(newTemplate);
        return newTemplate;
    }

    subscribeToSchedules(callback: (schedules: WorkSchedule[]) => void, employeeId?: string): Unsubscribe {
        const schedules = employeeId
            ? this.schedules.filter(s => s.employeeId === employeeId)
            : this.schedules;
        callback(schedules);
        return () => { };
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
export function getShiftTimeRange(shiftType: string): { start: string; end: string } {
    switch (shiftType) {
        case 'morning':
            return { start: '09:00', end: '17:00' };
        case 'afternoon':
            return { start: '13:00', end: '21:00' };
        case 'night':
            return { start: '21:00', end: '05:00' };
        case 'flexible':
            return { start: '08:00', end: '18:00' };
        default:
            return { start: '09:00', end: '17:00' };
    }
}

export function getDayName(dayNumber: number): string {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[dayNumber] || '';
}

export function getShortDayName(dayNumber: number): string {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return days[dayNumber] || '';
}


