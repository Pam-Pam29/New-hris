import {
    collection,
    doc,
    getDocs,
    getDoc,
    setDoc,
    updateDoc,
    deleteDoc,
    query,
    limit,
    Firestore
} from 'firebase/firestore';
import { getServiceConfig, initializeFirebase } from '../config/firebase';

export interface OfficeLocation {
    id: string;
    name: string;
    address: string;
    latitude: number;
    longitude: number;
    radius: number; // meters - distance considered "at office"
    isDefault: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export interface IOfficeLocationService {
    getOfficeLocations(): Promise<OfficeLocation[]>;
    getDefaultOfficeLocation(): Promise<OfficeLocation | null>;
    getOfficeLocationById(id: string): Promise<OfficeLocation | null>;
    createOfficeLocation(location: Omit<OfficeLocation, 'id'>): Promise<OfficeLocation>;
    updateOfficeLocation(id: string, location: Partial<OfficeLocation>): Promise<OfficeLocation>;
    deleteOfficeLocation(id: string): Promise<void>;
    setDefaultOffice(id: string): Promise<void>;
}

export class FirebaseOfficeLocationService implements IOfficeLocationService {
    private db: Firestore;

    constructor(db: Firestore) {
        this.db = db;
    }

    async getOfficeLocations(): Promise<OfficeLocation[]> {
        const locationsRef = collection(this.db, 'officeLocations');
        const snapshot = await getDocs(locationsRef);
        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        } as OfficeLocation));
    }

    async getDefaultOfficeLocation(): Promise<OfficeLocation | null> {
        const locationsRef = collection(this.db, 'officeLocations');
        const q = query(locationsRef, limit(1));
        const snapshot = await getDocs(q);

        // Find the default office
        const defaultOffice = snapshot.docs.find(doc => doc.data().isDefault);
        if (defaultOffice) {
            return {
                id: defaultOffice.id,
                ...defaultOffice.data()
            } as OfficeLocation;
        }

        // If no default set, return the first one
        if (snapshot.docs.length > 0) {
            return {
                id: snapshot.docs[0].id,
                ...snapshot.docs[0].data()
            } as OfficeLocation;
        }

        return null;
    }

    async getOfficeLocationById(id: string): Promise<OfficeLocation | null> {
        const docRef = doc(this.db, 'officeLocations', id);
        const docSnap = await getDoc(docRef);
        return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } as OfficeLocation : null;
    }

    async createOfficeLocation(location: Omit<OfficeLocation, 'id'>): Promise<OfficeLocation> {
        const locationsRef = collection(this.db, 'officeLocations');
        const docRef = doc(locationsRef);

        await setDoc(docRef, {
            ...location,
            createdAt: new Date(),
            updatedAt: new Date()
        });

        return { id: docRef.id, ...location };
    }

    async updateOfficeLocation(id: string, location: Partial<OfficeLocation>): Promise<OfficeLocation> {
        const docRef = doc(this.db, 'officeLocations', id);
        await updateDoc(docRef, {
            ...location,
            updatedAt: new Date()
        });

        const updated = await this.getOfficeLocationById(id);
        if (!updated) throw new Error('Office location not found after update');
        return updated;
    }

    async deleteOfficeLocation(id: string): Promise<void> {
        const docRef = doc(this.db, 'officeLocations', id);
        await deleteDoc(docRef);
    }

    async setDefaultOffice(id: string): Promise<void> {
        // First, unset all defaults
        const locations = await this.getOfficeLocations();
        for (const loc of locations) {
            if (loc.isDefault) {
                await updateDoc(doc(this.db, 'officeLocations', loc.id), {
                    isDefault: false,
                    updatedAt: new Date()
                });
            }
        }

        // Set the new default
        await updateDoc(doc(this.db, 'officeLocations', id), {
            isDefault: true,
            updatedAt: new Date()
        });
    }
}

// Service factory
let serviceInstance: IOfficeLocationService | null = null;

export async function getOfficeLocationService(): Promise<IOfficeLocationService> {
    if (serviceInstance) {
        return serviceInstance;
    }

    try {
        await initializeFirebase();
        const config = await getServiceConfig();

        if (config.firebase && config.firebase.enabled && config.firebase.db) {
            serviceInstance = new FirebaseOfficeLocationService(config.firebase.db as Firestore);
            console.log('✅ Using Firebase Office Location Service (HR)');
            return serviceInstance;
        }

        throw new Error('Firebase not properly configured');
    } catch (error) {
        console.error('❌ Error initializing Office Location Service:', error);
        throw error;
    }
}

// Distance calculation helper (Haversine formula)
export function calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
): number {
    const R = 6371; // Radius of the Earth in kilometers
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);

    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c; // Distance in kilometers

    return distance;
}

function toRad(degrees: number): number {
    return degrees * (Math.PI / 180);
}

export function formatDistance(distanceKm: number): string {
    if (distanceKm < 0.1) {
        return 'At Office';
    } else if (distanceKm < 1) {
        return `${Math.round(distanceKm * 1000)}m from Office`;
    } else {
        return `${distanceKm.toFixed(1)}km from Office`;
    }
}

