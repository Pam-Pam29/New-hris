import { getServiceConfig } from '../config/firebase';
import { Firestore } from 'firebase/firestore';

export interface RecruitmentCandidate {
    id: string;
    companyId: string; // Multi-tenancy: Company ID
    name: string;
    email: string;
    phone: string;
    position: string;
    jobId?: string; // Link to specific job posting
    status: 'new' | 'screening' | 'interviewing' | 'offer' | 'hired' | 'rejected';
    resumeUrl: string;
    skills: string[];
    experience: string;
    notes: string;
    createdAt?: Date; // When candidate was added
    updatedAt?: Date; // Last status change
}

export interface Interview {
    id: string;
    companyId: string; // Multi-tenancy: Company ID
    candidateId: string;
    interviewerId: string; // Primary interviewer (for backward compatibility)
    interviewers?: string[]; // Panel interview support (multiple interviewers)
    scheduledTime: Date;
    duration: number;
    type: 'phone' | 'video' | 'onsite';
    meetingLink?: string; // Google Meet or other video call link
    feedback?: string;
    status: 'scheduled' | 'completed' | 'cancelled';
    reminderSent?: boolean; // Track if reminder was sent
    candidateNotified?: boolean; // Track if candidate was notified via email
}

export interface Offer {
    id: string;
    candidateId: string;
    position: string;
    salary: number;
    benefits: string[];
    startDate: Date;
    status: 'pending' | 'accepted' | 'rejected' | 'withdrawn';
}

export interface IRecruitmentService {
    // Candidates
    getCandidates(companyId?: string): Promise<RecruitmentCandidate[]>;
    getCandidate(id: string): Promise<RecruitmentCandidate | null>;
    addCandidate(candidate: Omit<RecruitmentCandidate, 'id'>): Promise<string>;
    updateCandidate(id: string, candidate: Partial<RecruitmentCandidate>): Promise<void>;
    updateCandidateStatus(id: string, status: RecruitmentCandidate['status']): Promise<void>;
    deleteCandidate(id: string): Promise<void>;

    // Interviews
    scheduleInterview(interview: Omit<Interview, 'id'>): Promise<string>;
    getInterviews(companyId?: string): Promise<Interview[]>;
    getInterviewsForCandidate(candidateId: string): Promise<Interview[]>;
    updateInterviewFeedback(id: string, feedback: string): Promise<void>;
    cancelInterview(id: string): Promise<void>;

    // Offers
    createOffer(offer: Omit<Offer, 'id'>): Promise<string>;
    getOffer(id: string): Promise<Offer | null>;
    updateOfferStatus(id: string, status: Offer['status']): Promise<void>;
}

export class FirebaseRecruitmentService implements IRecruitmentService {
    constructor(private db: Firestore) { }

    // Candidate methods
    async getCandidates(companyId?: string): Promise<RecruitmentCandidate[]> {
        const { collection, getDocs, query, where } = await import('firebase/firestore');
        const candidatesRef = collection(this.db, 'recruitment_candidates');
        
        let q = query(candidatesRef);
        if (companyId) {
            q = query(candidatesRef, where('companyId', '==', companyId));
            console.log(`🏢 Filtering candidates by companyId: ${companyId}`);
        }
        
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        } as RecruitmentCandidate));
    }

    async getCandidate(id: string): Promise<RecruitmentCandidate | null> {
        const { doc, getDoc } = await import('firebase/firestore');
        const candidateRef = doc(this.db, 'recruitment_candidates', id);
        const snapshot = await getDoc(candidateRef);
        return snapshot.exists() ? { id: snapshot.id, ...snapshot.data() } as RecruitmentCandidate : null;
    }

    async addCandidate(candidate: Omit<RecruitmentCandidate, 'id'>): Promise<string> {
        const { collection, addDoc, Timestamp } = await import('firebase/firestore');
        const candidatesRef = collection(this.db, 'recruitment_candidates');
        const now = Timestamp.now();
        const docRef = await addDoc(candidatesRef, {
            ...candidate,
            createdAt: now,
            updatedAt: now
        });
        return docRef.id;
    }

    async updateCandidate(id: string, candidate: Partial<RecruitmentCandidate>): Promise<void> {
        const { doc, updateDoc, Timestamp } = await import('firebase/firestore');
        const candidateRef = doc(this.db, 'recruitment_candidates', id);
        await updateDoc(candidateRef, {
            ...candidate,
            updatedAt: Timestamp.now()
        });
    }

    async updateCandidateStatus(id: string, status: RecruitmentCandidate['status']): Promise<void> {
        await this.updateCandidate(id, { status });
    }

    async deleteCandidate(id: string): Promise<void> {
        const { doc, deleteDoc } = await import('firebase/firestore');
        const candidateRef = doc(this.db, 'recruitment_candidates', id);
        await deleteDoc(candidateRef);
    }

    // Interview methods
    async scheduleInterview(interview: Omit<Interview, 'id'>): Promise<string> {
        const { collection, addDoc } = await import('firebase/firestore');
        const interviewsRef = collection(this.db, 'interviews');
        const docRef = await addDoc(interviewsRef, interview);
        return docRef.id;
    }

    async getInterviews(companyId?: string): Promise<Interview[]> {
        const { collection, getDocs, query, where } = await import('firebase/firestore');
        const interviewsRef = collection(this.db, 'interviews');
        
        let q = query(interviewsRef);
        if (companyId) {
            q = query(interviewsRef, where('companyId', '==', companyId));
            console.log(`🏢 Filtering interviews by companyId: ${companyId}`);
        }
        
        try {
            const snapshot = await getDocs(q);
            let interviews = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            } as Interview));
            
            // Sort in memory to avoid index requirement
            interviews.sort((a, b) => {
                const aTime = a.scheduledTime instanceof Date ? a.scheduledTime.getTime() : 
                             (a.scheduledTime as any)?.seconds ? (a.scheduledTime as any).seconds * 1000 : 0;
                const bTime = b.scheduledTime instanceof Date ? b.scheduledTime.getTime() : 
                             (b.scheduledTime as any)?.seconds ? (b.scheduledTime as any).seconds * 1000 : 0;
                return aTime - bTime;
            });
            
            return interviews;
        } catch (error: any) {
            console.error('Error loading interviews:', error);
            // If there's a permission error, return empty array
            if (error?.code === 'permission-denied' || error?.code === 'failed-precondition') {
                console.warn('⚠️ Permission denied or index missing for interviews query');
                return [];
            }
            throw error;
        }
    }

    async getInterviewsForCandidate(candidateId: string): Promise<Interview[]> {
        const { collection, query, where, getDocs } = await import('firebase/firestore');
        const interviewsRef = collection(this.db, 'interviews');
        const q = query(interviewsRef, where('candidateId', '==', candidateId));
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        } as Interview));
    }

    async updateInterviewFeedback(id: string, feedback: string): Promise<void> {
        const { doc, updateDoc } = await import('firebase/firestore');
        const interviewRef = doc(this.db, 'interviews', id);
        await updateDoc(interviewRef, { feedback, status: 'completed' });
    }

    async cancelInterview(id: string): Promise<void> {
        const { doc, updateDoc } = await import('firebase/firestore');
        const interviewRef = doc(this.db, 'interviews', id);
        await updateDoc(interviewRef, { status: 'cancelled' });
    }

    // Offer methods
    async createOffer(offer: Omit<Offer, 'id'>): Promise<string> {
        const { collection, addDoc } = await import('firebase/firestore');
        const offersRef = collection(this.db, 'offers');
        const docRef = await addDoc(offersRef, offer);
        return docRef.id;
    }

    async getOffer(id: string): Promise<Offer | null> {
        const { doc, getDoc } = await import('firebase/firestore');
        const offerRef = doc(this.db, 'offers', id);
        const snapshot = await getDoc(offerRef);
        return snapshot.exists() ? { id: snapshot.id, ...snapshot.data() } as Offer : null;
    }

    async updateOfferStatus(id: string, status: Offer['status']): Promise<void> {
        const { doc, updateDoc } = await import('firebase/firestore');
        const offerRef = doc(this.db, 'offers', id);
        await updateDoc(offerRef, { status });
    }
}

export class MockRecruitmentService implements IRecruitmentService {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async getCandidates(): Promise<RecruitmentCandidate[]> {
        return [];
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async getCandidate(id: string): Promise<RecruitmentCandidate | null> {
        return null;
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async addCandidate(candidate: Omit<RecruitmentCandidate, 'id'>): Promise<string> {
        return 'mock-id';
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async updateCandidate(id: string, candidate: Partial<RecruitmentCandidate>): Promise<void> {
        // No-op
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async updateCandidateStatus(id: string, status: RecruitmentCandidate['status']): Promise<void> {
        // No-op
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async deleteCandidate(id: string): Promise<void> {
        // No-op
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async scheduleInterview(interview: Omit<Interview, 'id'>): Promise<string> {
        return 'mock-id';
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async getInterviews(): Promise<Interview[]> {
        return [];
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async getInterviewsForCandidate(candidateId: string): Promise<Interview[]> {
        return [];
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async updateInterviewFeedback(id: string, feedback: string): Promise<void> {
        // No-op
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async cancelInterview(id: string): Promise<void> {
        // No-op
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async createOffer(offer: Omit<Offer, 'id'>): Promise<string> {
        return 'mock-id';
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async getOffer(id: string): Promise<Offer | null> {
        return null;
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async updateOfferStatus(id: string, status: Offer['status']): Promise<void> {
        // No-op
    }
}

export class RecruitmentServiceFactory {
    static createService(type: 'firebase' | 'mock', db?: Firestore): IRecruitmentService {
        switch (type) {
            case 'firebase':
                if (!db) throw new Error('Firebase DB instance required');
                return new FirebaseRecruitmentService(db);
            case 'mock':
                return new MockRecruitmentService();
            default:
                throw new Error('Invalid service type');
        }
    }
}

// Async function to get the properly configured recruitment service
export const getRecruitmentService = async (): Promise<IRecruitmentService> => {
    try {
        console.log('Getting recruitment service...');
        const { initializeFirebase } = await import('../config/firebase');
        await initializeFirebase(); // Wait for Firebase to be ready
        const config = await getServiceConfig();
        console.log('Service config check:', config);

        if (config.defaultService === 'firebase' && config.firebase.enabled && config.firebase.db) {
            console.log('Using Firebase Recruitment Service');
            return RecruitmentServiceFactory.createService('firebase', config.firebase.db);
        } else {
            console.log('Using Mock Recruitment Service');
            return RecruitmentServiceFactory.createService('mock');
        }
    } catch (error) {
        console.warn('Failed to initialize Firebase Recruitment Service, falling back to Mock:', error);
        return new MockRecruitmentService();
    }
};

// For backwards compatibility - but this will start as mock until Firebase is ready
let recruitmentService: IRecruitmentService = new MockRecruitmentService();

// Initialize the service asynchronously
(async () => {
    try {
        recruitmentService = await getRecruitmentService();
    } catch (error) {
        console.error('Error initializing recruitment service:', error);
    }
})();

export { recruitmentService };
