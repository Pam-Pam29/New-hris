// HR Availability Service - View HR availability and book meetings
import { collection, addDoc, updateDoc, deleteDoc, doc, query, where, getDocs, serverTimestamp } from 'firebase/firestore';
import { db } from '../config/firebase';

export interface AvailabilitySlot {
    id?: string;
    dayOfWeek: number; // 0 = Sunday, 1 = Monday, etc.
    startTime: string; // "09:00"
    endTime: string; // "10:00"
    isRecurring: boolean; // If true, applies every week
    specificDate?: Date; // For one-time availability
    hrName: string;
    hrId: string;
    createdAt?: any;
    updatedAt?: any;
}

export interface UnavailableSlot {
    id?: string;
    date: Date;
    startTime: string;
    endTime: string;
    reason?: string; // "Meeting scheduled", "Out of office", etc.
    hrName: string;
    hrId: string;
    createdAt?: any;
    updatedAt?: any;
}

export class HRAvailabilityService {
    private db = db;

    // Get all availability slots (read-only for employees)
    async getAllAvailability(): Promise<AvailabilitySlot[]> {
        try {
            const querySnapshot = await getDocs(collection(this.db, 'hrAvailability'));
            return querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            } as AvailabilitySlot));
        } catch (error) {
            console.error('❌ Failed to get availability:', error);
            return [];
        }
    }

    // Get availability for a specific day
    async getAvailabilityForDay(dayOfWeek: number): Promise<AvailabilitySlot[]> {
        try {
            const q = query(
                collection(this.db, 'hrAvailability'),
                where('dayOfWeek', '==', dayOfWeek),
                where('isRecurring', '==', true)
            );

            const querySnapshot = await getDocs(q);
            return querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            } as AvailabilitySlot));
        } catch (error) {
            console.error('❌ Failed to get availability for day:', error);
            return [];
        }
    }

    // Get availability for a specific HR person
    async getAvailabilityForHR(hrId: string): Promise<AvailabilitySlot[]> {
        try {
            const q = query(
                collection(this.db, 'hrAvailability'),
                where('hrId', '==', hrId)
            );

            const querySnapshot = await getDocs(q);
            return querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            } as AvailabilitySlot));
        } catch (error) {
            console.error('❌ Failed to get availability for HR:', error);
            return [];
        }
    }

    // Check if a specific time slot is available
    async isTimeSlotAvailable(date: Date, startTime: string, endTime: string): Promise<boolean> {
        try {
            // Check if there are any unavailable slots for this time
            const q = query(
                collection(this.db, 'hrUnavailability'),
                where('date', '==', date)
            );

            const querySnapshot = await getDocs(q);
            const unavailableSlots = querySnapshot.docs.map(doc => doc.data() as UnavailableSlot);

            // Check for conflicts
            for (const slot of unavailableSlots) {
                if (this.timeSlotsOverlap(startTime, endTime, slot.startTime, slot.endTime)) {
                    return false;
                }
            }

            return true;
        } catch (error) {
            console.error('❌ Failed to check availability:', error);
            return false;
        }
    }

    // Helper: Check if time slots overlap
    private timeSlotsOverlap(start1: string, end1: string, start2: string, end2: string): boolean {
        const s1 = this.timeToMinutes(start1);
        const e1 = this.timeToMinutes(end1);
        const s2 = this.timeToMinutes(start2);
        const e2 = this.timeToMinutes(end2);

        return (s1 < e2) && (s2 < e1);
    }

    // Helper: Convert time string to minutes since midnight
    private timeToMinutes(time: string): number {
        const [hours, minutes] = time.split(':').map(Number);
        return hours * 60 + minutes;
    }

    // Get available time slots for a specific date
    async getAvailableTimeSlotsForDate(date: Date): Promise<{ startTime: string; endTime: string; }[]> {
        try {
            const dayOfWeek = date.getDay();

            // Get availability for this day of week
            const availabilityBlocks = await this.getAvailabilityForDay(dayOfWeek);

            if (availabilityBlocks.length === 0) {
                return [];
            }

            // Break down each availability block into 30-minute slots
            const allSlots: { startTime: string; endTime: string; }[] = [];

            for (const block of availabilityBlocks) {
                const blockSlots = this.generateThirtyMinuteSlots(block.startTime, block.endTime);
                allSlots.push(...blockSlots);
            }

            // Get booked meetings for this date to filter out unavailable slots
            const bookedSlots = await this.getBookedSlotsForDate(date);

            // Filter out booked slots
            const availableSlots = allSlots.filter(slot => {
                return !this.isSlotBooked(slot, bookedSlots);
            });

            return availableSlots;
        } catch (error) {
            console.error('❌ Failed to get available time slots:', error);
            return [];
        }
    }

    // Helper: Generate 30-minute time slots from a time range
    private generateThirtyMinuteSlots(startTime: string, endTime: string): { startTime: string; endTime: string; }[] {
        const slots: { startTime: string; endTime: string; }[] = [];
        const startMinutes = this.timeToMinutes(startTime);
        const endMinutes = this.timeToMinutes(endTime);

        // Generate 30-minute slots
        for (let minutes = startMinutes; minutes < endMinutes; minutes += 30) {
            const slotStart = this.minutesToTime(minutes);
            const slotEnd = this.minutesToTime(minutes + 30);

            // Only add if the slot end doesn't exceed the block end
            if (minutes + 30 <= endMinutes) {
                slots.push({
                    startTime: slotStart,
                    endTime: slotEnd
                });
            }
        }

        return slots;
    }

    // Helper: Convert minutes to time string (HH:MM)
    private minutesToTime(minutes: number): string {
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
    }

    // Helper: Get booked slots for a specific date
    private async getBookedSlotsForDate(date: Date): Promise<{ startTime: string; endTime: string; duration: number; }[]> {
        try {
            const { collection, query, where, getDocs } = await import('firebase/firestore');

            // Get the date range for the query (start and end of day)
            const startOfDay = new Date(date);
            startOfDay.setHours(0, 0, 0, 0);

            const endOfDay = new Date(date);
            endOfDay.setHours(23, 59, 59, 999);

            // Query meetings for this date
            const meetingsQuery = query(
                collection(this.db, 'performanceMeetings'),
                where('scheduledDate', '>=', startOfDay),
                where('scheduledDate', '<=', endOfDay),
                where('status', 'in', ['pending', 'approved'])
            );

            const snapshot = await getDocs(meetingsQuery);

            return snapshot.docs.map(doc => {
                const data = doc.data();
                const scheduledDate = data.scheduledDate.toDate();
                const hours = scheduledDate.getHours();
                const minutes = scheduledDate.getMinutes();
                const startTime = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;

                const duration = data.duration || 30;
                const endMinutes = hours * 60 + minutes + duration;
                const endTime = this.minutesToTime(endMinutes);

                return { startTime, endTime, duration };
            });
        } catch (error) {
            console.log('Could not fetch booked slots:', error);
            return [];
        }
    }

    // Helper: Check if a slot is booked
    private isSlotBooked(
        slot: { startTime: string; endTime: string; },
        bookedSlots: { startTime: string; endTime: string; }[]
    ): boolean {
        return bookedSlots.some(booked => {
            return this.timeSlotsOverlap(slot.startTime, slot.endTime, booked.startTime, booked.endTime);
        });
    }
}

// Singleton instance
export const hrAvailabilityService = new HRAvailabilityService();
