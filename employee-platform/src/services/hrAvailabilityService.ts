// HR Availability Service - View HR availability for meetings
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../config/firebase';

export interface AvailabilitySlot {
    id?: string;
    dayOfWeek: number; // 0 = Sunday, 1 = Monday, etc.
    startTime: string; // "09:00"
    endTime: string; // "10:00"
    isRecurring: boolean;
    specificDate?: Date;
    hrName: string;
    hrId: string;
}

export interface UnavailableSlot {
    id?: string;
    date: Date;
    startTime: string;
    endTime: string;
    reason?: string;
    hrName: string;
    hrId: string;
}

export class HRAvailabilityService {
    private db = db;

    // Get all availability slots
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

    // Get unavailable slots for a specific date range
    async getUnavailableSlots(startDate: Date, endDate: Date): Promise<UnavailableSlot[]> {
        try {
            const q = query(
                collection(this.db, 'hrUnavailability'),
                where('date', '>=', startDate),
                where('date', '<=', endDate)
            );
            
            const querySnapshot = await getDocs(q);
            return querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            } as UnavailableSlot));
        } catch (error) {
            console.error('❌ Failed to get unavailable slots:', error);
            return [];
        }
    }

    // Get available time slots for a specific date
    async getAvailableTimeSlotsForDate(date: Date): Promise<{ startTime: string; endTime: string; }[]> {
        try {
            const dayOfWeek = date.getDay();
            
            // Get recurring availability for this day
            const allAvailability = await this.getAllAvailability();
            const dayAvailability = allAvailability.filter(slot => 
                slot.isRecurring && slot.dayOfWeek === dayOfWeek
            );

            if (dayAvailability.length === 0) {
                return [];
            }

            // Get unavailable slots for this date
            const unavailableSlots = await this.getUnavailableSlots(date, date);
            
            // Generate available time slots (30-minute intervals)
            const availableSlots: { startTime: string; endTime: string; }[] = [];
            
            for (const availability of dayAvailability) {
                const slots = this.generateTimeSlots(availability.startTime, availability.endTime);
                
                // Filter out unavailable times
                for (const slot of slots) {
                    const isAvailable = !unavailableSlots.some(unavailable => {
                        const unavailableDate = unavailable.date instanceof Date ? unavailable.date : (unavailable.date as any).toDate();
                        return unavailableDate.toDateString() === date.toDateString() &&
                               this.timeSlotsOverlap(slot.startTime, slot.endTime, unavailable.startTime, unavailable.endTime);
                    });
                    
                    if (isAvailable) {
                        availableSlots.push(slot);
                    }
                }
            }

            return availableSlots;
        } catch (error) {
            console.error('❌ Failed to get available time slots:', error);
            return [];
        }
    }

    // Generate 30-minute time slots
    private generateTimeSlots(startTime: string, endTime: string): { startTime: string; endTime: string; }[] {
        const slots: { startTime: string; endTime: string; }[] = [];
        const [startHour, startMinute] = startTime.split(':').map(Number);
        const [endHour, endMinute] = endTime.split(':').map(Number);
        
        let currentHour = startHour;
        let currentMinute = startMinute;
        
        while (currentHour < endHour || (currentHour === endHour && currentMinute < endMinute)) {
            const slotStart = `${String(currentHour).padStart(2, '0')}:${String(currentMinute).padStart(2, '0')}`;
            
            // Add 30 minutes
            currentMinute += 30;
            if (currentMinute >= 60) {
                currentHour++;
                currentMinute -= 60;
            }
            
            const slotEnd = `${String(currentHour).padStart(2, '0')}:${String(currentMinute).padStart(2, '0')}`;
            
            // Only add if slot end is within availability range
            if (currentHour < endHour || (currentHour === endHour && currentMinute <= endMinute)) {
                slots.push({ startTime: slotStart, endTime: slotEnd });
            }
        }
        
        return slots;
    }

    // Check if two time slots overlap
    private timeSlotsOverlap(start1: string, end1: string, start2: string, end2: string): boolean {
        return (start1 < end2 && end1 > start2);
    }
}

export const hrAvailabilityService = new HRAvailabilityService();

