import { collection, doc, getDocs, addDoc, updateDoc, deleteDoc, query, where, orderBy, Timestamp, getDoc } from 'firebase/firestore';
import { db } from '@/config/firebase';
import { Asset, AssetAssignment, MaintenanceRecord } from '../types';
import { isFirebaseConfigured } from '@/config/firebase';

export interface IAssetService {
  // Asset Management
  getAssets(): Promise<Asset[]>;
  getAssetById(id: string): Promise<Asset | null>;
  createAsset(asset: Omit<Asset, 'id'>): Promise<Asset>;
  updateAsset(id: string, asset: Partial<Asset>): Promise<Asset>;
  deleteAsset(id: string): Promise<void>;
  searchAssets(query: string): Promise<Asset[]>;
  
  // Asset Assignment
  getAssetAssignments(): Promise<AssetAssignment[]>;
  getAssetAssignmentById(id: string): Promise<AssetAssignment | null>;
  createAssetAssignment(assignment: Omit<AssetAssignment, 'id'>): Promise<AssetAssignment>;
  updateAssetAssignment(id: string, assignment: Partial<AssetAssignment>): Promise<AssetAssignment>;
  deleteAssetAssignment(id: string): Promise<void>;
  getAssignmentsByEmployee(employeeId: string): Promise<AssetAssignment[]>;
  getAssignmentsByAsset(assetId: string): Promise<AssetAssignment[]>;
  
  // Maintenance Records
  getMaintenanceRecords(): Promise<MaintenanceRecord[]>;
  getMaintenanceRecordById(id: string): Promise<MaintenanceRecord | null>;
  createMaintenanceRecord(record: Omit<MaintenanceRecord, 'id'>): Promise<MaintenanceRecord>;
  updateMaintenanceRecord(id: string, record: Partial<MaintenanceRecord>): Promise<MaintenanceRecord>;
  deleteMaintenanceRecord(id: string): Promise<void>;
  getMaintenanceRecordsByAsset(assetId: string): Promise<MaintenanceRecord[]>;
}

export class FirebaseAssetService implements IAssetService {
  // Asset Management
  async getAssets(): Promise<Asset[]> {
    const assetsRef = collection(db, 'assets');
    const q = query(assetsRef, orderBy('name'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Asset));
  }

  async getAssetById(id: string): Promise<Asset | null> {
    const docRef = doc(db, 'assets', id);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } as Asset : null;
  }

  async createAsset(asset: Omit<Asset, 'id'>): Promise<Asset> {
    const assetsRef = collection(db, 'assets');
    const docRef = await addDoc(assetsRef, {
      ...asset,
      createdAt: Timestamp.now(),
    });
    return { id: docRef.id, ...asset };
  }

  async updateAsset(id: string, asset: Partial<Asset>): Promise<Asset> {
    const docRef = doc(db, 'assets', id);
    await updateDoc(docRef, {
      ...asset,
      updatedAt: Timestamp.now(),
    });
    const updated = await this.getAssetById(id);
    if (!updated) throw new Error('Asset not found after update');
    return updated;
  }

  async deleteAsset(id: string): Promise<void> {
    await deleteDoc(doc(db, 'assets', id));
  }

  async searchAssets(searchQuery: string): Promise<Asset[]> {
    const assetsRef = collection(db, 'assets');
    const q = query(assetsRef, orderBy('name'));
    const snapshot = await getDocs(q);
    const assets = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Asset));
    
    return assets.filter(asset =>
      asset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      asset.serialNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      asset.category.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }

  // Asset Assignment
  async getAssetAssignments(): Promise<AssetAssignment[]> {
    const assignmentsRef = collection(db, 'asset_assignments');
    const q = query(assignmentsRef, orderBy('assignedDate', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as AssetAssignment));
  }

  async getAssetAssignmentById(id: string): Promise<AssetAssignment | null> {
    const docRef = doc(db, 'asset_assignments', id);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } as AssetAssignment : null;
  }

  async createAssetAssignment(assignment: Omit<AssetAssignment, 'id'>): Promise<AssetAssignment> {
    const assignmentsRef = collection(db, 'asset_assignments');
    const docRef = await addDoc(assignmentsRef, {
      ...assignment,
      createdAt: Timestamp.now(),
    });
    return { id: docRef.id, ...assignment };
  }

  async updateAssetAssignment(id: string, assignment: Partial<AssetAssignment>): Promise<AssetAssignment> {
    const docRef = doc(db, 'asset_assignments', id);
    await updateDoc(docRef, {
      ...assignment,
      updatedAt: Timestamp.now(),
    });
    const updated = await this.getAssetAssignmentById(id);
    if (!updated) throw new Error('Assignment not found after update');
    return updated;
  }

  async deleteAssetAssignment(id: string): Promise<void> {
    await deleteDoc(doc(db, 'asset_assignments', id));
  }

  async getAssignmentsByEmployee(employeeId: string): Promise<AssetAssignment[]> {
    const assignmentsRef = collection(db, 'asset_assignments');
    const q = query(
      assignmentsRef,
      where('employeeId', '==', employeeId),
      orderBy('assignedDate', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as AssetAssignment));
  }

  async getAssignmentsByAsset(assetId: string): Promise<AssetAssignment[]> {
    const assignmentsRef = collection(db, 'asset_assignments');
    const q = query(
      assignmentsRef,
      where('assetId', '==', assetId),
      orderBy('assignedDate', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as AssetAssignment));
  }

  // Maintenance Records
  async getMaintenanceRecords(): Promise<MaintenanceRecord[]> {
    const maintenanceRef = collection(db, 'maintenance_records');
    const q = query(maintenanceRef, orderBy('date', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as MaintenanceRecord));
  }

  async getMaintenanceRecordById(id: string): Promise<MaintenanceRecord | null> {
    const docRef = doc(db, 'maintenance_records', id);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } as MaintenanceRecord : null;
  }

  async createMaintenanceRecord(record: Omit<MaintenanceRecord, 'id'>): Promise<MaintenanceRecord> {
    const maintenanceRef = collection(db, 'maintenance_records');
    const docRef = await addDoc(maintenanceRef, {
      ...record,
      createdAt: Timestamp.now(),
    });
    return { id: docRef.id, ...record };
  }

  async updateMaintenanceRecord(id: string, record: Partial<MaintenanceRecord>): Promise<MaintenanceRecord> {
    const docRef = doc(db, 'maintenance_records', id);
    await updateDoc(docRef, {
      ...record,
      updatedAt: Timestamp.now(),
    });
    const updated = await this.getMaintenanceRecordById(id);
    if (!updated) throw new Error('Maintenance record not found after update');
    return updated;
  }

  async deleteMaintenanceRecord(id: string): Promise<void> {
    await deleteDoc(doc(db, 'maintenance_records', id));
  }

  async getMaintenanceRecordsByAsset(assetId: string): Promise<MaintenanceRecord[]> {
    const maintenanceRef = collection(db, 'maintenance_records');
    const q = query(
      maintenanceRef,
      where('assetId', '==', assetId),
      orderBy('date', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as MaintenanceRecord));
  }
}

export class MockAssetService implements IAssetService {
  private assets: Asset[] = [];
  private assignments: AssetAssignment[] = [];
  private maintenanceRecords: MaintenanceRecord[] = [];

  // Asset Management
  async getAssets(): Promise<Asset[]> {
    return this.assets;
  }

  async getAssetById(id: string): Promise<Asset | null> {
    return this.assets.find(asset => asset.id === id) || null;
  }

  async createAsset(asset: Omit<Asset, 'id'>): Promise<Asset> {
    const newAsset = { ...asset, id: Date.now().toString() };
    this.assets.push(newAsset);
    return newAsset;
  }

  async updateAsset(id: string, asset: Partial<Asset>): Promise<Asset> {
    const index = this.assets.findIndex(a => a.id === id);
    if (index === -1) throw new Error('Asset not found');
    this.assets[index] = { ...this.assets[index], ...asset };
    return this.assets[index];
  }

  async deleteAsset(id: string): Promise<void> {
    this.assets = this.assets.filter(asset => asset.id !== id);
  }

  async searchAssets(query: string): Promise<Asset[]> {
    return this.assets.filter(asset =>
      asset.name.toLowerCase().includes(query.toLowerCase()) ||
      asset.serialNumber.toLowerCase().includes(query.toLowerCase()) ||
      asset.category.toLowerCase().includes(query.toLowerCase())
    );
  }

  // Asset Assignment
  async getAssetAssignments(): Promise<AssetAssignment[]> {
    return this.assignments;
  }

  async getAssetAssignmentById(id: string): Promise<AssetAssignment | null> {
    return this.assignments.find(assignment => assignment.id === id) || null;
  }

  async createAssetAssignment(assignment: Omit<AssetAssignment, 'id'>): Promise<AssetAssignment> {
    const newAssignment = { ...assignment, id: Date.now().toString() };
    this.assignments.push(newAssignment);
    return newAssignment;
  }

  async updateAssetAssignment(id: string, assignment: Partial<AssetAssignment>): Promise<AssetAssignment> {
    const index = this.assignments.findIndex(a => a.id === id);
    if (index === -1) throw new Error('Assignment not found');
    this.assignments[index] = { ...this.assignments[index], ...assignment };
    return this.assignments[index];
  }

  async deleteAssetAssignment(id: string): Promise<void> {
    this.assignments = this.assignments.filter(assignment => assignment.id !== id);
  }

  async getAssignmentsByEmployee(employeeId: string): Promise<AssetAssignment[]> {
    return this.assignments.filter(assignment => assignment.employeeId === employeeId);
  }

  async getAssignmentsByAsset(assetId: string): Promise<AssetAssignment[]> {
    return this.assignments.filter(assignment => assignment.assetId === assetId);
  }

  // Maintenance Records
  async getMaintenanceRecords(): Promise<MaintenanceRecord[]> {
    return this.maintenanceRecords;
  }

  async getMaintenanceRecordById(id: string): Promise<MaintenanceRecord | null> {
    return this.maintenanceRecords.find(record => record.id === id) || null;
  }

  async createMaintenanceRecord(record: Omit<MaintenanceRecord, 'id'>): Promise<MaintenanceRecord> {
    const newRecord = { ...record, id: Date.now().toString() };
    this.maintenanceRecords.push(newRecord);
    return newRecord;
  }

  async updateMaintenanceRecord(id: string, record: Partial<MaintenanceRecord>): Promise<MaintenanceRecord> {
    const index = this.maintenanceRecords.findIndex(r => r.id === id);
    if (index === -1) throw new Error('Maintenance record not found');
    this.maintenanceRecords[index] = { ...this.maintenanceRecords[index], ...record };
    return this.maintenanceRecords[index];
  }

  async deleteMaintenanceRecord(id: string): Promise<void> {
    this.maintenanceRecords = this.maintenanceRecords.filter(record => record.id !== id);
  }

  async getMaintenanceRecordsByAsset(assetId: string): Promise<MaintenanceRecord[]> {
    return this.maintenanceRecords.filter(record => record.assetId === assetId);
  }
}

export class AssetServiceFactory {
  static async createAssetService(): Promise<IAssetService> {
    if (await isFirebaseConfigured()) {
      return new FirebaseAssetService();
    }
    return new MockAssetService();
  }
}

let assetServiceInstance: IAssetService | null = null;

export async function getAssetService(): Promise<IAssetService> {
  if (!assetServiceInstance) {
    assetServiceInstance = await AssetServiceFactory.createAssetService();
  }
  return assetServiceInstance;
}