import { collection, doc, getDocs, addDoc, updateDoc, deleteDoc, query, where, orderBy, Timestamp, getDoc } from 'firebase/firestore';
import { getServiceConfig, initializeFirebase } from '../../../../../config/firebase';
import type { Firestore } from 'firebase/firestore';
import { AttendanceRecord, TimeAdjustment, TimeOffRequest } from '../types';
import { isFirebaseConfigured } from '../../../../../config/firebase';

export interface ITimeService {
  // Attendance Records
  getAttendanceRecords(): Promise<AttendanceRecord[]>;
  getAttendanceRecordById(id: string): Promise<AttendanceRecord | null>;
  createAttendanceRecord(record: Omit<AttendanceRecord, 'id'>): Promise<AttendanceRecord>;
  updateAttendanceRecord(id: string, record: Partial<AttendanceRecord>): Promise<AttendanceRecord>;
  deleteAttendanceRecord(id: string): Promise<void>;
  cleanupMockData?(): Promise<void>;

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
  private db: Firestore;

  constructor(db: Firestore) {
    this.db = db;
  }
  // Attendance Records - Load from real timeEntries collection
  async getAttendanceRecords(): Promise<AttendanceRecord[]> {
    console.log('🔄 Loading real time entries from Firebase...');
    const timeEntriesRef = collection(this.db, 'timeEntries');
    const q = query(timeEntriesRef, orderBy('clockIn', 'desc'));
    const snapshot = await getDocs(q);

    console.log(`📊 Found ${snapshot.docs.length} time entries in Firebase`);

    // Transform timeEntries to AttendanceRecord format
    const records = snapshot.docs.map((doc, index) => {
      const data = doc.data();

      // Debug: Log first entry to see structure
      if (index === 0) {
        console.log('📋 Sample time entry data:', {
          employeeId: data.employeeId,
          employeeName: data.employeeName,
          hasLocation: !!data.location,
          hasClockInLocation: !!data.clockInLocation,
          locationData: data.location || data.clockInLocation,
          clockInLocationFields: data.clockInLocation ? Object.keys(data.clockInLocation) : [],
          locationFields: data.location ? Object.keys(data.location) : [],
          rawLocationData: {
            location: data.location,
            clockInLocation: data.clockInLocation
          }
        });
      }

      const clockIn = data.clockIn?.toDate?.() || new Date(data.clockIn);
      const clockOut = data.clockOut?.toDate?.() || (data.clockOut ? new Date(data.clockOut) : null);

      // Calculate status based on clock in time (if after 9 AM, mark as Late)
      let status: 'Present' | 'Late' | 'Absent' = 'Present';
      if (clockIn) {
        const hours = clockIn.getHours();
        const minutes = clockIn.getMinutes();
        if (hours > 9 || (hours === 9 && minutes > 0)) {
          status = 'Late';
        }
      }
      if (!clockIn) {
        status = 'Absent';
      }

      // Format date and times
      const dateStr = clockIn ? clockIn.toISOString().split('T')[0] : 'Unknown';
      const clockInStr = clockIn ? clockIn.toTimeString().slice(0, 5) : '';
      const clockOutStr = clockOut ? clockOut.toTimeString().slice(0, 5) : '';

      // Get location - prefer clockInLocation, fallback to location field
      const locationData = data.clockInLocation || data.location;

      // Build location object if data exists
      let locationObj: any = undefined;
      if (locationData) {
        locationObj = {
          latitude: locationData.latitude,
          longitude: locationData.longitude,
          address: locationData.address,
          timestamp: locationData.timestamp,
          // Include distance fields if they exist
          distanceFromOffice: locationData.distanceFromOffice,
          distanceFormatted: locationData.distanceFormatted,
          isAtOffice: locationData.isAtOffice,
          officeName: locationData.officeName
        };

        // Debug: Log location transformation
        if (index === 0) {
          console.log('📍 Transformed location:', locationObj);
        }
      } else if (index === 0) {
        console.log('⚠️ No location data found in time entry');
      }

      const record = {
        id: doc.id,
        employeeId: data.employeeId || '',
        employeeName: data.employeeName || 'Unknown',
        employee: data.employeeName || 'Unknown', // For backward compatibility
        date: dateStr,
        clockIn: clockInStr,
        clockOut: clockOutStr,
        status,
        notes: data.notes || '',
        location: locationObj,
        reason: ''
      } as AttendanceRecord;

      // Debug: Check if location is in the record
      if (index === 0) {
        console.log('📋 Created record with location?:', {
          hasLocation: !!record.location,
          locationInRecord: record.location,
          recordKeys: Object.keys(record)
        });
      }

      // Debug: Log if employee name is "John Doe" (mock data)
      if (data.employeeName === 'John Doe') {
        console.warn('⚠️ Found mock data entry:', {
          id: doc.id,
          employeeName: data.employeeName,
          employeeId: data.employeeId,
          date: dateStr
        });
      }

      return record;
    });

    console.log('✅ Transformed time entries:', records.length);
    console.log('📊 Employee names found:', records.map(r => r.employeeName));
    return records;
  }

  async getAttendanceRecordById(id: string): Promise<AttendanceRecord | null> {
    const docRef = doc(this.db, 'attendance', id);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } as AttendanceRecord : null;
  }

  async createAttendanceRecord(record: Omit<AttendanceRecord, 'id'>): Promise<AttendanceRecord> {
    const attendanceRef = collection(this.db, 'attendance');
    const docRef = await addDoc(attendanceRef, {
      ...record,
      lastModified: Timestamp.now(),
    });
    return { id: docRef.id, ...record };
  }

  async updateAttendanceRecord(id: string, record: Partial<AttendanceRecord>): Promise<AttendanceRecord> {
    const docRef = doc(this.db, 'attendance', id);
    await updateDoc(docRef, {
      ...record,
      lastModified: Timestamp.now(),
    });
    const updated = await this.getAttendanceRecordById(id);
    if (!updated) throw new Error('Record not found after update');
    return updated;
  }

  async deleteAttendanceRecord(id: string): Promise<void> {
    await deleteDoc(doc(this.db, 'attendance', id));
  }

  // Cleanup function to remove mock data
  async cleanupMockData(): Promise<void> {
    console.log('🧹 Cleaning up mock data from timeEntries...');
    const timeEntriesRef = collection(this.db, 'timeEntries');
    const snapshot = await getDocs(timeEntriesRef);

    const mockNames = ['John Doe', 'Jane Smith', 'Mike Johnson', 'Unknown'];
    let deletedCount = 0;

    for (const docSnapshot of snapshot.docs) {
      const data = docSnapshot.data();
      if (mockNames.includes(data.employeeName)) {
        console.log(`  🗑️ Deleting mock entry: ${data.employeeName} (${docSnapshot.id})`);
        await deleteDoc(docSnapshot.ref);
        deletedCount++;
      }
    }

    console.log(`✅ Deleted ${deletedCount} mock entries from timeEntries`);
  }

  // Time Adjustments
  async getTimeAdjustments(): Promise<TimeAdjustment[]> {
    const adjustmentsRef = collection(this.db, 'timeAdjustments');
    const q = query(adjustmentsRef, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as TimeAdjustment));
  }

  async getTimeAdjustmentById(id: string): Promise<TimeAdjustment | null> {
    const docRef = doc(this.db, 'timeAdjustments', id);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } as TimeAdjustment : null;
  }

  async createTimeAdjustment(adjustment: Omit<TimeAdjustment, 'id'>): Promise<TimeAdjustment> {
    const adjustmentsRef = collection(this.db, 'timeAdjustments');
    const docRef = await addDoc(adjustmentsRef, {
      ...adjustment,
      createdAt: Timestamp.now(),
    });
    return { id: docRef.id, ...adjustment };
  }

  async updateTimeAdjustment(id: string, adjustment: Partial<TimeAdjustment>): Promise<TimeAdjustment> {
    const docRef = doc(this.db, 'timeAdjustments', id);
    await updateDoc(docRef, adjustment);
    const updated = await this.getTimeAdjustmentById(id);
    if (!updated) throw new Error('Adjustment not found after update');
    return updated;
  }

  async deleteTimeAdjustment(id: string): Promise<void> {
    await deleteDoc(doc(this.db, 'timeAdjustments', id));
  }

  // Time Off Requests
  async getTimeOffRequests(): Promise<TimeOffRequest[]> {
    const requestsRef = collection(this.db, 'timeOffRequests');
    const q = query(requestsRef, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as TimeOffRequest));
  }

  async getTimeOffRequestById(id: string): Promise<TimeOffRequest | null> {
    const docRef = doc(this.db, 'timeOffRequests', id);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } as TimeOffRequest : null;
  }

  async createTimeOffRequest(request: Omit<TimeOffRequest, 'id'>): Promise<TimeOffRequest> {
    const requestsRef = collection(this.db, 'timeOffRequests');
    const docRef = await addDoc(requestsRef, {
      ...request,
      createdAt: Timestamp.now(),
    });
    return { id: docRef.id, ...request };
  }

  async updateTimeOffRequest(id: string, request: Partial<TimeOffRequest>): Promise<TimeOffRequest> {
    const docRef = doc(this.db, 'timeOffRequests', id);
    await updateDoc(docRef, request);
    const updated = await this.getTimeOffRequestById(id);
    if (!updated) throw new Error('Request not found after update');
    return updated;
  }

  async deleteTimeOffRequest(id: string): Promise<void> {
    await deleteDoc(doc(this.db, 'timeOffRequests', id));
  }
}

export class MockTimeService implements ITimeService {
  private attendanceRecords: AttendanceRecord[] = [
    {
      id: '1',
      employee: 'John Doe',
      date: '2024-01-15',
      status: 'Present',
      clockIn: '09:00',
      clockOut: '17:00',
      notes: 'Regular working day',
      reason: ''
    },
    {
      id: '2',
      employee: 'Jane Smith',
      date: '2024-01-15',
      status: 'Late',
      clockIn: '09:30',
      clockOut: '17:30',
      notes: 'Traffic delay',
      reason: 'traffic'
    },
    {
      id: '3',
      employee: 'Mike Johnson',
      date: '2024-01-15',
      status: 'Present',
      clockIn: '08:45',
      clockOut: '16:45',
      notes: 'Early start, early finish',
      reason: ''
    }
  ];
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
    await initializeFirebase();
    const config = await getServiceConfig();

    if (config.defaultService === 'firebase' && config.firebase.enabled && config.firebase.db) {
      console.log('TimeServiceFactory: Using FirebaseTimeService for Time Management');
      return new FirebaseTimeService(config.firebase.db as Firestore);
    }

    console.log('TimeServiceFactory: Using MockTimeService for Time Management');
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