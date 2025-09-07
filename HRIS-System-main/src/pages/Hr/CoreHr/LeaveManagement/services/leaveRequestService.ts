import type { Firestore } from 'firebase/firestore';
import { collection, addDoc, getDocs, doc, getDoc, updateDoc, deleteDoc, orderBy, query } from 'firebase/firestore';
import { getServiceConfig, initializeFirebase } from '@/config/firebase';

export interface LeaveRequest {
  id: string;
  employeeName: string;
  employeeId?: string;
  type: string;
  startDate: string;
  endDate: string;
  status: 'Pending' | 'Approved' | 'Rejected' | 'Cancelled';
  reason?: string;
  submittedDate: string;
  approver?: string;
  approvedDate?: string;
}

export interface ILeaveRequestService {
  listRequests(): Promise<LeaveRequest[]>;
  getRequest(id: string): Promise<LeaveRequest | null>;
  createRequest(req: Omit<LeaveRequest, 'id' | 'status' | 'submittedDate'>): Promise<LeaveRequest>; 
  updateRequest(id: string, data: Partial<LeaveRequest>): Promise<LeaveRequest>;
  deleteRequest(id: string): Promise<boolean>;
}

class FirebaseLeaveRequestService implements ILeaveRequestService {
  private db: Firestore;
  private collectionName = 'leave_requests';

  constructor(db: Firestore) {
    this.db = db;
  }

  async listRequests(): Promise<LeaveRequest[]> {
    const qRef = query(collection(this.db, this.collectionName), orderBy('submittedDate', 'desc'));
    const snap = await getDocs(qRef);
    return snap.docs.map(d => ({ id: d.id, ...(d.data() as any) }));
  }

  async getRequest(id: string): Promise<LeaveRequest | null> {
    const ref = doc(this.db, this.collectionName, id);
    const snap = await getDoc(ref);
    return snap.exists() ? ({ id: snap.id, ...(snap.data() as any) }) : null;
  }

  async createRequest(req: Omit<LeaveRequest, 'id' | 'status' | 'submittedDate'>): Promise<LeaveRequest> {
    const payload = {
      ...req,
      status: 'Pending' as const,
      submittedDate: new Date().toISOString().split('T')[0],
    };
    const ref = await addDoc(collection(this.db, this.collectionName), payload);
    return { id: ref.id, ...(payload as any) };
  }

  async updateRequest(id: string, data: Partial<LeaveRequest>): Promise<LeaveRequest> {
    const ref = doc(this.db, this.collectionName, id);
    await updateDoc(ref, data as any);
    const updated = await this.getRequest(id);
    if (!updated) throw new Error('Leave request not found');
    return updated;
  }

  async deleteRequest(id: string): Promise<boolean> {
    try {
      const ref = doc(this.db, this.collectionName, id);
      await deleteDoc(ref);
      return true;
    } catch {
      return false;
    }
  }
}

class MockLeaveRequestService implements ILeaveRequestService {
  private items: LeaveRequest[] = [];
  async listRequests(): Promise<LeaveRequest[]> { return this.items; }
  async getRequest(id: string): Promise<LeaveRequest | null> { return this.items.find(i => i.id === id) || null; }
  async createRequest(req: Omit<LeaveRequest, 'id' | 'status' | 'submittedDate'>): Promise<LeaveRequest> {
    const newItem: LeaveRequest = { id: Date.now().toString(), status: 'Pending', submittedDate: new Date().toISOString().split('T')[0], ...req } as any;
    this.items.unshift(newItem);
    return newItem;
  }
  async updateRequest(id: string, data: Partial<LeaveRequest>): Promise<LeaveRequest> {
    const idx = this.items.findIndex(i => i.id === id);
    if (idx === -1) throw new Error('Not found');
    this.items[idx] = { ...this.items[idx], ...data };
    return this.items[idx];
  }
  async deleteRequest(id: string): Promise<boolean> {
    this.items = this.items.filter(i => i.id !== id);
    return true;
  }
}

export async function getLeaveRequestService(): Promise<ILeaveRequestService> {
  await initializeFirebase();
  const config = await getServiceConfig();
  if (config.defaultService === 'firebase' && config.firebase.enabled && config.firebase.db) {
    return new FirebaseLeaveRequestService(config.firebase.db as Firestore);
  }
  return new MockLeaveRequestService();
}


