import { getServiceConfig } from '../config/firebase';
import { Firestore } from 'firebase/firestore';

export interface OnboardingTask {
    id: string;
    employeeId: string;
    title: string;
    description: string;
    dueDate: Date;
    status: 'pending' | 'in-progress' | 'completed' | 'overdue';
    assignedTo: string;
    category: 'paperwork' | 'training' | 'orientation' | 'equipment';
}

export interface OnboardingDocument {
    id: string;
    employeeId: string;
    name: string;
    type: string;
    status: 'required' | 'received' | 'verified' | 'missing';
    url?: string;
}

export interface OnboardingChecklist {
    id: string;
    employeeId: string;
    tasks: string[];
    documents: string[];
    completed: boolean;
    completionDate?: Date;
}

export interface IOnboardingService {
    // Tasks
    getOnboardingTasks(employeeId: string): Promise<OnboardingTask[]>;
    createTask(task: Omit<OnboardingTask, 'id'>): Promise<string>;
    updateTaskStatus(id: string, status: OnboardingTask['status']): Promise<void>;
    completeTask(id: string): Promise<void>;

    // Documents
    getRequiredDocuments(employeeId: string): Promise<OnboardingDocument[]>;
    uploadDocument(document: Omit<OnboardingDocument, 'id'>): Promise<string>;
    verifyDocument(id: string): Promise<void>;

    // Checklists
    getChecklist(employeeId: string): Promise<OnboardingChecklist | null>;
    createChecklist(checklist: Omit<OnboardingChecklist, 'id'>): Promise<string>;
    completeChecklist(id: string): Promise<void>;
}

class FirebaseOnboardingService implements IOnboardingService {
    constructor(private db: Firestore) { }

    // Task methods
    async getOnboardingTasks(employeeId: string): Promise<OnboardingTask[]> {
        const { collection, query, where, getDocs } = await import('firebase/firestore');
        const tasksRef = collection(this.db, 'onboarding_tasks');
        const q = query(tasksRef, where('employeeId', '==', employeeId));
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        } as OnboardingTask));
    }

    async createTask(task: Omit<OnboardingTask, 'id'>): Promise<string> {
        const { collection, addDoc } = await import('firebase/firestore');
        const tasksRef = collection(this.db, 'onboarding_tasks');
        const docRef = await addDoc(tasksRef, task);
        return docRef.id;
    }

    async updateTaskStatus(id: string, status: OnboardingTask['status']): Promise<void> {
        const { doc, updateDoc } = await import('firebase/firestore');
        const taskRef = doc(this.db, 'onboarding_tasks', id);
        await updateDoc(taskRef, { status });
    }

    async completeTask(id: string): Promise<void> {
        await this.updateTaskStatus(id, 'completed');
    }

    // Document methods
    async getRequiredDocuments(employeeId: string): Promise<OnboardingDocument[]> {
        const { collection, query, where, getDocs } = await import('firebase/firestore');
        const docsRef = collection(this.db, 'onboarding_documents');
        const q = query(docsRef, where('employeeId', '==', employeeId));
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        } as OnboardingDocument));
    }

    async uploadDocument(document: Omit<OnboardingDocument, 'id'>): Promise<string> {
        const { collection, addDoc } = await import('firebase/firestore');
        const docsRef = collection(this.db, 'onboarding_documents');
        const docRef = await addDoc(docsRef, document);
        return docRef.id;
    }

    async verifyDocument(id: string): Promise<void> {
        const { doc, updateDoc } = await import('firebase/firestore');
        const docRef = doc(this.db, 'onboarding_documents', id);
        await updateDoc(docRef, { status: 'verified' });
    }

    // Checklist methods
    async getChecklist(employeeId: string): Promise<OnboardingChecklist | null> {
        const { collection, query, where, getDocs } = await import('firebase/firestore');
        const checklistsRef = collection(this.db, 'onboarding_checklists');
        const q = query(checklistsRef, where('employeeId', '==', employeeId));
        const snapshot = await getDocs(q);

        if (snapshot.empty) return null;

        return {
            id: snapshot.docs[0].id,
            ...snapshot.docs[0].data()
        } as OnboardingChecklist;
    }

    async createChecklist(checklist: Omit<OnboardingChecklist, 'id'>): Promise<string> {
        const { collection, addDoc } = await import('firebase/firestore');
        const checklistsRef = collection(this.db, 'onboarding_checklists');
        const docRef = await addDoc(checklistsRef, checklist);
        return docRef.id;
    }

    async completeChecklist(id: string): Promise<void> {
        const { doc, updateDoc } = await import('firebase/firestore');
        const checklistRef = doc(this.db, 'onboarding_checklists', id);
        await updateDoc(checklistRef, {
            completed: true,
            completionDate: new Date()
        });
    }
}

class MockOnboardingService implements IOnboardingService {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async getOnboardingTasks(employeeId: string): Promise<OnboardingTask[]> {
        return [];
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async createTask(task: Omit<OnboardingTask, 'id'>): Promise<string> {
        return 'mock-id';
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async updateTaskStatus(id: string, status: OnboardingTask['status']): Promise<void> {
        // No-op
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async completeTask(id: string): Promise<void> {
        // No-op
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async getRequiredDocuments(employeeId: string): Promise<OnboardingDocument[]> {
        return [];
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async uploadDocument(document: Omit<OnboardingDocument, 'id'>): Promise<string> {
        return 'mock-id';
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async verifyDocument(id: string): Promise<void> {
        // No-op
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async getChecklist(employeeId: string): Promise<OnboardingChecklist | null> {
        return null;
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async createChecklist(checklist: Omit<OnboardingChecklist, 'id'>): Promise<string> {
        return 'mock-id';
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async completeChecklist(id: string): Promise<void> {
        // No-op
    }
}

export class OnboardingServiceFactory {
    static createService(type: 'firebase' | 'mock', db?: Firestore): IOnboardingService {
        switch (type) {
            case 'firebase':
                if (!db) throw new Error('Firebase DB instance required');
                return new FirebaseOnboardingService(db);
            case 'mock':
                return new MockOnboardingService();
            default:
                throw new Error('Invalid service type');
        }
    }
}

// Initialize the service based on config
let onboardingService: IOnboardingService = new MockOnboardingService();

getServiceConfig().then((config: { defaultService: 'firebase' | 'mock'; firebase: { enabled: boolean; db: Firestore | null }; mock: { enabled: boolean } }) => {
    if (config.defaultService === 'firebase' && config.firebase.enabled && config.firebase.db) {
        console.log('Using Firebase Onboarding Service');
        onboardingService = OnboardingServiceFactory.createService('firebase', config.firebase.db);
    } else {
        console.log('Using Mock Onboarding Service');
        onboardingService = OnboardingServiceFactory.createService('mock');
    }
});

export { onboardingService };
