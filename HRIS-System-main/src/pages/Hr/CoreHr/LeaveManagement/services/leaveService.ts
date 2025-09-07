import { collection, doc, getDocs, addDoc, updateDoc, deleteDoc, query, where } from 'firebase/firestore';
import { db } from '@/config/firebase';
import { LeaveType } from '../types';

export interface ILeaveService {
  getLeaveTypes(): Promise<LeaveType[]>;
  createLeaveType(data: Omit<LeaveType, 'id'>): Promise<LeaveType>;
  updateLeaveType(id: string, data: Partial<LeaveType>): Promise<LeaveType>;
  deleteLeaveType(id: string): Promise<void>;
}

class FirebaseLeaveService implements ILeaveService {
  private collection = collection(db, 'leaveTypes');

  async getLeaveTypes(): Promise<LeaveType[]> {
    const snapshot = await getDocs(this.collection);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as LeaveType[];
  }

  async createLeaveType(data: Omit<LeaveType, 'id'>): Promise<LeaveType> {
    const docRef = await addDoc(this.collection, data);
    return {
      id: docRef.id,
      ...data
    };
  }

  async updateLeaveType(id: string, data: Partial<LeaveType>): Promise<LeaveType> {
    const docRef = doc(this.collection, id);
    await updateDoc(docRef, data);
    return {
      id,
      ...data as LeaveType
    };
  }

  async deleteLeaveType(id: string): Promise<void> {
    const docRef = doc(this.collection, id);
    await deleteDoc(docRef);
  }
}

class MockLeaveService implements ILeaveService {
  private leaveTypes: LeaveType[] = [
    { id: '1', name: 'Annual Leave', description: 'Regular vacation days', days: 14, active: true },
    { id: '2', name: 'Sick Leave', description: 'For medical reasons', days: 10, active: true },
    { id: '3', name: 'Parental Leave', description: 'For new parents', days: 90, active: true }
  ];

  async getLeaveTypes(): Promise<LeaveType[]> {
    return Promise.resolve([...this.leaveTypes]);
  }

  async createLeaveType(data: Omit<LeaveType, 'id'>): Promise<LeaveType> {
    const newType = {
      id: String(this.leaveTypes.length + 1),
      ...data
    };
    this.leaveTypes.push(newType);
    return Promise.resolve(newType);
  }

  async updateLeaveType(id: string, data: Partial<LeaveType>): Promise<LeaveType> {
    const index = this.leaveTypes.findIndex(t => t.id === id);
    if (index === -1) throw new Error('Leave type not found');
    
    const updatedType = {
      ...this.leaveTypes[index],
      ...data
    };
    this.leaveTypes[index] = updatedType;
    return Promise.resolve(updatedType);
  }

  async deleteLeaveType(id: string): Promise<void> {
    const index = this.leaveTypes.findIndex(t => t.id === id);
    if (index === -1) throw new Error('Leave type not found');
    this.leaveTypes.splice(index, 1);
    return Promise.resolve();
  }
}

export async function getLeaveService(): Promise<ILeaveService> {
  // You can add logic here to determine which service to use based on environment or configuration
  return new FirebaseLeaveService();
}