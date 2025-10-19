// HR Availability Service - Manage HR availability for meetings
import { collection, addDoc, updateDoc, deleteDoc, doc, query, where, getDocs, serverTimestamp } from 'firebase/firestore';
import { getFirebaseDb } from '../config/firebase';

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
    private db = getFirebaseDb();

    // Add availability slot
    async addAvailabilitySlot(slot: Omit<AvailabilitySlot, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
        try {
            const slotData = {
                ...slot,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp()
            };

            const docRef = await addDoc(collection(this.db, 'hrAvailability'), slotData);
            console.log('✅ Availability slot added:', docRef.id);
            return docRef.id;
        } catch (error) {
            console.error('❌ Failed to add availability slot:', error);
            throw error;
        }
    }

    // Mark time as unavailable (e.g., when meeting is scheduled)
    async markUnavailable(slot: Omit<UnavailableSlot, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
        try {
            const slotData = {
                ...slot,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp()
            };

            const docRef = await addDoc(collection(this.db, 'hrUnavailability'), slotData);
            console.log('✅ Unavailable slot marked:', docRef.id);
            return docRef.id;
        } catch (error) {
            console.error('❌ Failed to mark unavailable:', error);
            throw error;
        }
    }

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

    // Check if a specific time slot is available
    async isTimeSlotAvailable(date: Date, startTime: string, endTime: string): Promise<boolean> {
        try {
            const dayOfWeek = date.getDay();
            
            // Check if this time is in HR's regular availability
            const availabilitySlots = await this.getAllAvailability();
            const hasAvailability = availabilitySlots.some(slot => {
                if (slot.isRecurring && slot.dayOfWeek === dayOfWeek) {
                    return startTime >= slot.startTime && endTime <= slot.endTime;
                }
                return false;
            });

            if (!hasAvailability) {
                return false;
            }

            // Check if this time is marked as unavailable
            const unavailableSlots = await this.getUnavailableSlots(date, date);
            const isUnavailable = unavailableSlots.some(slot => {
                const slotDate = slot.date instanceof Date ? slot.date : (slot.date as any).toDate();
                return slotDate.toDateString() === date.toDateString() &&
                       ((startTime >= slot.startTime && startTime < slot.endTime) ||
                        (endTime > slot.startTime && endTime <= slot.endTime));
            });

            return !isUnavailable;
        } catch (error) {
            console.error('❌ Failed to check availability:', error);
            return false;
        }
    }

    // Delete availability slot
    async deleteAvailabilitySlot(slotId: string): Promise<void> {
        try {
            await deleteDoc(doc(this.db, 'hrAvailability', slotId));
            console.log('✅ Availability slot deleted');
        } catch (error) {
            console.error('❌ Failed to delete availability slot:', error);
            throw error;
        }
    }

    // Update availability slot
    async updateAvailabilitySlot(slotId: string, updates: Partial<AvailabilitySlot>): Promise<void> {
        try {
            await updateDoc(doc(this.db, 'hrAvailability', slotId), {
                ...updates,
                updatedAt: serverTimestamp()
            });
            console.log('✅ Availability slot updated');
        } catch (error) {
            console.error('❌ Failed to update availability slot:', error);
            throw error;
        }
    }
}

export const hrAvailabilityService = new HRAvailabilityService();


