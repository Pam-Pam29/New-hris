import { collection, doc, getDocs, addDoc, updateDoc, deleteDoc, query, where, orderBy, Timestamp, getDoc } from 'firebase/firestore';
import { db } from '@/config/firebase';
import { AttendanceRecord, TimeAdjustment, TimeOffRequest } from '../types';
import { isFirebaseConfigured } from '@/config/firebase';

export interface ITimeService {
  // Attendance Records
  getAttendanceRecords(): Promise<AttendanceRecord[]>;
  getAttendanceRecordById(id: string): Promise<AttendanceRecord | null>;
  createAttendanceRecord(record: Omit<AttendanceRecord, 'id'>): Promise<AttendanceRecord>;
  updateAttendanceRecord(id: string, record: Partial<AttendanceRecord>): Promise<AttendanceRecord>;
  deleteAttendanceRecord(id: string): Promise<void>;
  
  // Time Adjustments
  getTimeAdjustments(): Promise<TimeAdjustment[]>;
  getTimeAdjustmentById(id: string): Promise<TimeAdjustment | null>;
  createTimeAdjustment(adjustment: Omit<TimeAdjustment, 'id'>): Promise<TimeAdjustment>;
  updateTimeAdjustment(id: string, adjustment: Partial<TimeAdjustment>): Promise<TimeAdjustment>;
  deleteTimeAdjustment(id: string): Promise<void>;
  
  // Time Off Requests
  getTimeOffRequests(): Promise<TimeOffRequest[]>;
  getTimeOffRequestById(id: string): Promise<TimeOffRequest | null>;
  createTimeOffRequest(request: Omit<TimeOffRequest, 'id'>): Promise<TimeOffRequest>;
  updateTimeOffRequest(id: string, request: Partial<TimeOffRequest>): Promise<TimeOffRequest>;
  deleteTimeOffRequest(id: string): Promise<void>;
}

export class FirebaseTimeService implements ITimeService {
  // Attendance Records
  async getAttendanceRecords(): Promise<AttendanceRecord[]> {
    const attendanceRef = collection(db, 'attendance');
    const q = query(attendanceRef, orderBy('date', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as AttendanceRecord));
  }

  async getAttendanceRecordById(id: string): Promise<AttendanceRecord | null> {
    const docRef = doc(db, 'attendance', id);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } as AttendanceRecord : null;
  }

  async createAttendanceRecord(record: Omit<AttendanceRecord, 'id'>): Promise<AttendanceRecord> {
    const attendanceRef = collection(db, 'attendance');
    const docRef = await addDoc(attendanceRef, {
      ...record,
      lastModified: Timestamp.now(),
    });
    return { id: docRef.id, ...record };
  }

  async updateAttendanceRecord(id: string, record: Partial<AttendanceRecord>): Promise<AttendanceRecord> {
    const docRef = doc(db, 'attendance', id);
    await updateDoc(docRef, {
      ...record,
      lastModified: Timestamp.now(),
    });
    const updated = await this.getAttendanceRecordById(id);
    if (!updated) throw new Error('Record not found after update');
    return updated;
  }

  async deleteAttendanceRecord(id: string): Promise<void> {
    await deleteDoc(doc(db, 'attendance', id));
  }

  // Time Adjustments
  async getTimeAdjustments(): Promise<TimeAdjustment[]> {
    const adjustmentsRef = collection(db, 'timeAdjustments');
    const q = query(adjustmentsRef, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as TimeAdjustment));
  }

  async getTimeAdjustmentById(id: string): Promise<TimeAdjustment | null> {
    const docRef = doc(db, 'timeAdjustments', id);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } as TimeAdjustment : null;
  }

  async createTimeAdjustment(adjustment: Omit<TimeAdjustment, 'id'>): Promise<TimeAdjustment> {
    const adjustmentsRef = collection(db, 'timeAdjustments');
    const docRef = await addDoc(adjustmentsRef, {
      ...adjustment,
      createdAt: Timestamp.now(),
    });
    return { id: docRef.id, ...adjustment };
  }

  async updateTimeAdjustment(id: string, adjustment: Partial<TimeAdjustment>): Promise<TimeAdjustment> {
    const docRef = doc(db, 'timeAdjustments', id);
    await updateDoc(docRef, adjustment);
    const updated = await this.getTimeAdjustmentById(id);
    if (!updated) throw new Error('Adjustment not found after update');
    return updated;
  }

  async deleteTimeAdjustment(id: string): Promise<void> {
    await deleteDoc(doc(db, 'timeAdjustments', id));
  }

  // Time Off Requests
  async getTimeOffRequests(): Promise<TimeOffRequest[]> {
    const requestsRef = collection(db, 'timeOffRequests');
    const q = query(requestsRef, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as TimeOffRequest));
  }

  async getTimeOffRequestById(id: string): Promise<TimeOffRequest | null> {
    const docRef = doc(db, 'timeOffRequests', id);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } as TimeOffRequest : null;
  }

  async createTimeOffRequest(request: Omit<TimeOffRequest, 'id'>): Promise<TimeOffRequest> {
    const requestsRef = collection(db, 'timeOffRequests');
    const docRef = await addDoc(requestsRef, {
      ...request,
      createdAt: Timestamp.now(),
    });
    return { id: docRef.id, ...request };
  }

  async updateTimeOffRequest(id: string, request: Partial<TimeOffRequest>): Promise<TimeOffRequest> {
    const docRef = doc(db, 'timeOffRequests', id);
    await updateDoc(docRef, request);
    const updated = await this.getTimeOffRequestById(id);
    if (!updated) throw new Error('Request not found after update');
    return updated;
  }

  async deleteTimeOffRequest(id: string): Promise<void> {
    await deleteDoc(doc(db, 'timeOffRequests', id));
  }
}

export class MockTimeService implements ITimeService {
  private attendanceRecords: AttendanceRecord[] = [];
  private timeAdjustments: TimeAdjustment[] = [];
  private timeOffRequests: TimeOffRequest[] = [];

  // Attendance Records
  async getAttendanceRecords(): Promise<AttendanceRecord[]> {
    return this.attendanceRecords;
  }

  async getAttendanceRecordById(id: string): Promise<AttendanceRecord | null> {
    return this.attendanceRecords.find(record => record.id === id) || null;
  }

  async createAttendanceRecord(record: Omit<AttendanceRecord, 'id'>): Promise<AttendanceRecord> {
    const newRecord = { ...record, id: Date.now().toString() };
    this.attendanceRecords.push(newRecord);
    return newRecord;
  }

  async updateAttendanceRecord(id: string, record: Partial<AttendanceRecord>): Promise<AttendanceRecord> {
    const index = this.attendanceRecords.findIndex(r => r.id === id);
    if (index === -1) throw new Error('Record not found');
    this.attendanceRecords[index] = { ...this.attendanceRecords[index], ...record };
    return this.attendanceRecords[index];
  }

  async deleteAttendanceRecord(id: string): Promise<void> {
    this.attendanceRecords = this.attendanceRecords.filter(record => record.id !== id);
  }

  // Time Adjustments
  async getTimeAdjustments(): Promise<TimeAdjustment[]> {
    return this.timeAdjustments;
  }

  async getTimeAdjustmentById(id: string): Promise<TimeAdjustment | null> {
    return this.timeAdjustments.find(adjustment => adjustment.id === id) || null;
  }

  async createTimeAdjustment(adjustment: Omit<TimeAdjustment, 'id'>): Promise<TimeAdjustment> {
    const newAdjustment = { ...adjustment, id: Date.now().toString() };
    this.timeAdjustments.push(newAdjustment);
    return newAdjustment;
  }

  async updateTimeAdjustment(id: string, adjustment: Partial<TimeAdjustment>): Promise<TimeAdjustment> {
    const index = this.timeAdjustments.findIndex(a => a.id === id);
    if (index === -1) throw new Error('Adjustment not found');
    this.timeAdjustments[index] = { ...this.timeAdjustments[index], ...adjustment };
    return this.timeAdjustments[index];
  }

  async deleteTimeAdjustment(id: string): Promise<void> {
    this.timeAdjustments = this.timeAdjustments.filter(adjustment => adjustment.id !== id);
  }

  // Time Off Requests
  async getTimeOffRequests(): Promise<TimeOffRequest[]> {
    return this.timeOffRequests;
  }

  async getTimeOffRequestById(id: string): Promise<TimeOffRequest | null> {
    return this.timeOffRequests.find(request => request.id === id) || null;
  }

  async createTimeOffRequest(request: Omit<TimeOffRequest, 'id'>): Promise<TimeOffRequest> {
    const newRequest = { ...request, id: Date.now().toString() };
    this.timeOffRequests.push(newRequest);
    return newRequest;
  }

  async updateTimeOffRequest(id: string, request: Partial<TimeOffRequest>): Promise<TimeOffRequest> {
    const index = this.timeOffRequests.findIndex(r => r.id === id);
    if (index === -1) throw new Error('Request not found');
    this.timeOffRequests[index] = { ...this.timeOffRequests[index], ...request };
    return this.timeOffRequests[index];
  }

  async deleteTimeOffRequest(id: string): Promise<void> {
    this.timeOffRequests = this.timeOffRequests.filter(request => request.id !== id);
  }
}

export class TimeServiceFactory {
  static async createTimeService(): Promise<ITimeService> {
    if (await isFirebaseConfigured()) {
      return new FirebaseTimeService();
    }
    return new MockTimeService();
  }
}

let timeServiceInstance: ITimeService | null = null;

export async function getTimeService(): Promise<ITimeService> {
  if (!timeServiceInstance) {
    timeServiceInstance = await TimeServiceFactory.createTimeService();
  }
  return timeServiceInstance;
}