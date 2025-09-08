import { collection, doc, getDocs, addDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../../../../config/firebase';
import type { Firestore } from 'firebase/firestore';
import { LeaveType } from '../types';

export interface ILeaveService {
  getLeaveTypes(): Promise<LeaveType[]>;
  createLeaveType(data: Omit<LeaveType, 'id'>): Promise<LeaveType>;
  updateLeaveType(id: string, data: Partial<LeaveType>): Promise<LeaveType>;
  deleteLeaveType(id: string): Promise<void>;
}

class FirebaseLeaveService implements ILeaveService {
  private db: Firestore;
  private collectionRef;

  constructor(db: Firestore) {
    this.db = db;
    this.collectionRef = collection(this.db, 'leaveTypes');
  }

  async getLeaveTypes(): Promise<LeaveType[]> {
    const snapshot = await getDocs(this.collectionRef);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as LeaveType[];
  }

  async createLeaveType(data: Omit<LeaveType, 'id'>): Promise<LeaveType> {
    const docRef = await addDoc(this.collectionRef, data);
    return {
      id: docRef.id,
      ...data
    };
  }

  async updateLeaveType(id: string, data: Partial<LeaveType>): Promise<LeaveType> {
    const docRef = doc(this.collectionRef, id);
    await updateDoc(docRef, data);
    return {
      id,
      ...data as LeaveType
    };
  }

  async deleteLeaveType(id: string): Promise<void> {
    const docRef = doc(this.collectionRef, id);
    await deleteDoc(docRef);
  }
}


export async function getLeaveService(): Promise<ILeaveService> {
  return new FirebaseLeaveService(db);
}
