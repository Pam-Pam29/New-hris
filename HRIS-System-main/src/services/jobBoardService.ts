import { getServiceConfig } from '../config/firebase';
import { Firestore } from 'firebase/firestore';

export interface JobPosting {
    id: string;
    title: string;
    department: string;
    location: string;
    type: 'full-time' | 'part-time' | 'contract' | 'internship';
    salaryRange: string;
    description: string;
    requirements: string[];
    status: 'draft' | 'published' | 'closed';
    postedDate?: Date | null;
    closingDate?: Date | null;
}

export interface JobApplication {
    id: string;
    jobId: string;
    candidateId: string;
    applicationDate: Date;
    status: 'submitted' | 'reviewed' | 'interviewing' | 'offered' | 'hired' | 'rejected';
    notes?: string;
}

export interface Candidate {
    id: string;
    name: string;
    email: string;
    phone: string;
    resumeUrl: string;
    skills: string[];
    experience: string;
    appliedJobs: string[];
}

export interface IJobBoardService {
    // Job Postings
    getJobPostings(): Promise<JobPosting[]>;
    getJobPosting(id: string): Promise<JobPosting | null>;
    createJobPosting(posting: Omit<JobPosting, 'id'>): Promise<string>;
    updateJobPosting(id: string, posting: Partial<JobPosting>): Promise<void>;
    closeJobPosting(id: string): Promise<void>;

    // Applications
    getApplicationsForJob(jobId: string): Promise<JobApplication[]>;
    getApplication(id: string): Promise<JobApplication | null>;
    submitApplication(application: Omit<JobApplication, 'id'>): Promise<string>;
    updateApplicationStatus(id: string, status: JobApplication['status']): Promise<void>;

    // Candidates
    getCandidate(id: string): Promise<Candidate | null>;
    createCandidate(candidate: Omit<Candidate, 'id' | 'appliedJobs'>): Promise<string>;
    updateCandidate(id: string, candidate: Partial<Candidate>): Promise<void>;
}

class FirebaseJobBoardService implements IJobBoardService {
    constructor(private db: Firestore) { }

    // Job Posting methods
    async getJobPostings(): Promise<JobPosting[]> {
        const { collection, getDocs } = await import('firebase/firestore');
        const postingsRef = collection(this.db, 'job_postings');
        const snapshot = await getDocs(postingsRef);
        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        } as JobPosting));
    }

    async getJobPosting(id: string): Promise<JobPosting | null> {
        const { doc, getDoc } = await import('firebase/firestore');
        const postingRef = doc(this.db, 'job_postings', id);
        const snapshot = await getDoc(postingRef);
        return snapshot.exists() ? { id: snapshot.id, ...snapshot.data() } as JobPosting : null;
    }

    async createJobPosting(posting: Omit<JobPosting, 'id'>): Promise<string> {
        const { collection, addDoc } = await import('firebase/firestore');
        const postingsRef = collection(this.db, 'job_postings');
        const docRef = await addDoc(postingsRef, posting);
        return docRef.id;
    }

    async updateJobPosting(id: string, posting: Partial<JobPosting>): Promise<void> {
        const { doc, updateDoc } = await import('firebase/firestore');
        const postingRef = doc(this.db, 'job_postings', id);
        await updateDoc(postingRef, posting);
    }

    async closeJobPosting(id: string): Promise<void> {
        await this.updateJobPosting(id, { status: 'closed' });
    }

    // Application methods
    async getApplicationsForJob(jobId: string): Promise<JobApplication[]> {
        const { collection, query, where, getDocs } = await import('firebase/firestore');
        const applicationsRef = collection(this.db, 'job_applications');
        const q = query(applicationsRef, where('jobId', '==', jobId));
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        } as JobApplication));
    }

    async getApplication(id: string): Promise<JobApplication | null> {
        const { doc, getDoc } = await import('firebase/firestore');
        const applicationRef = doc(this.db, 'job_applications', id);
        const snapshot = await getDoc(applicationRef);
        return snapshot.exists() ? { id: snapshot.id, ...snapshot.data() } as JobApplication : null;
    }

    async submitApplication(application: Omit<JobApplication, 'id'>): Promise<string> {
        const { collection, addDoc } = await import('firebase/firestore');
        const applicationsRef = collection(this.db, 'job_applications');
        const docRef = await addDoc(applicationsRef, application);
        return docRef.id;
    }

    async updateApplicationStatus(id: string, status: JobApplication['status']): Promise<void> {
        const { doc, updateDoc } = await import('firebase/firestore');
        const applicationRef = doc(this.db, 'job_applications', id);
        await updateDoc(applicationRef, { status });
    }

    // Candidate methods
    async getCandidate(id: string): Promise<Candidate | null> {
        const { doc, getDoc } = await import('firebase/firestore');
        const candidateRef = doc(this.db, 'candidates', id);
        const snapshot = await getDoc(candidateRef);
        return snapshot.exists() ? { id: snapshot.id, ...snapshot.data() } as Candidate : null;
    }

    async createCandidate(candidate: Omit<Candidate, 'id' | 'appliedJobs'>): Promise<string> {
        const { collection, addDoc } = await import('firebase/firestore');
        const candidatesRef = collection(this.db, 'candidates');
        const docRef = await addDoc(candidatesRef, {
            ...candidate,
            appliedJobs: []
        });
        return docRef.id;
    }

    async updateCandidate(id: string, candidate: Partial<Candidate>): Promise<void> {
        const { doc, updateDoc } = await import('firebase/firestore');
        const candidateRef = doc(this.db, 'candidates', id);
        await updateDoc(candidateRef, candidate);
    }
}

class MockJobBoardService implements IJobBoardService {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async getJobPostings(): Promise<JobPosting[]> {
        return [];
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async getJobPosting(id: string): Promise<JobPosting | null> {
        return null;
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async createJobPosting(posting: Omit<JobPosting, 'id'>): Promise<string> {
        return 'mock-id';
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async updateJobPosting(id: string, posting: Partial<JobPosting>): Promise<void> {
        // No-op
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async closeJobPosting(id: string): Promise<void> {
        // No-op
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async getApplicationsForJob(jobId: string): Promise<JobApplication[]> {
        return [];
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async getApplication(id: string): Promise<JobApplication | null> {
        return null;
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async submitApplication(application: Omit<JobApplication, 'id'>): Promise<string> {
        return 'mock-id';
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async updateApplicationStatus(id: string, status: JobApplication['status']): Promise<void> {
        // No-op
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async getCandidate(id: string): Promise<Candidate | null> {
        return null;
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async createCandidate(candidate: Omit<Candidate, 'id' | 'appliedJobs'>): Promise<string> {
        return 'mock-id';
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async updateCandidate(id: string, candidate: Partial<Candidate>): Promise<void> {
        // No-op
    }
}

export class JobBoardServiceFactory {
    static createService(type: 'firebase' | 'mock', db?: Firestore): IJobBoardService {
        switch (type) {
            case 'firebase':
                if (!db) throw new Error('Firebase DB instance required');
                return new FirebaseJobBoardService(db);
            case 'mock':
                return new MockJobBoardService();
            default:
                throw new Error('Invalid service type');
        }
    }
}

// Initialize the service based on config
let jobBoardService: IJobBoardService = new MockJobBoardService();

getServiceConfig().then((config: { defaultService: 'firebase' | 'mock'; firebase: { enabled: boolean; db: Firestore | null }; mock: { enabled: boolean } }) => {
    if (config.defaultService === 'firebase' && config.firebase.enabled && config.firebase.db) {
        console.log('Using Firebase JobBoard Service');
        jobBoardService = JobBoardServiceFactory.createService('firebase', config.firebase.db);
    } else {
        console.log('Using Mock JobBoard Service');
        jobBoardService = JobBoardServiceFactory.createService('mock');
    }
});

export { jobBoardService };
