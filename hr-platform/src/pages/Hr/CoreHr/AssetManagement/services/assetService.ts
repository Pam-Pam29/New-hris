import { collection, doc, getDocs, addDoc, updateDoc, deleteDoc, query, where, orderBy, Timestamp, getDoc } from 'firebase/firestore';
import { getServiceConfig, initializeFirebase } from '@/config/firebase';
import type { Firestore } from 'firebase/firestore';
import { Asset, AssetAssignment, MaintenanceRecord, AssetRequest, StarterKit, AssetHistoryEntry } from '../types';
import { isFirebaseConfigured } from '@/config/firebase';
import { vercelEmailService } from '../../../../../services/vercelEmailService';

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

  // Asset Requests
  getAssetRequests(): Promise<AssetRequest[]>;
  getAssetRequestById(id: string): Promise<AssetRequest | null>;
  createAssetRequest(request: Omit<AssetRequest, 'id'>): Promise<AssetRequest>;
  updateAssetRequest(id: string, request: Partial<AssetRequest>): Promise<AssetRequest>;
  deleteAssetRequest(id: string): Promise<void>;
  getRequestsByEmployee(employeeId: string): Promise<AssetRequest[]>;
  getPendingRequests(): Promise<AssetRequest[]>;

  // Starter Kits
  getStarterKits(): Promise<StarterKit[]>;
  getStarterKitById(id: string): Promise<StarterKit | null>;
  createStarterKit(kit: Omit<StarterKit, 'id'>): Promise<StarterKit>;
  updateStarterKit(id: string, kit: Partial<StarterKit>): Promise<StarterKit>;
  deleteStarterKit(id: string): Promise<void>;
  getStarterKitByJobTitle(jobTitle: string): Promise<StarterKit | null>;
  autoAssignStarterKit(employeeId: string, employeeName: string, jobTitle: string): Promise<{ success: boolean; assignedCount: number; missingAssets: string[]; maintenanceWarning?: string }>;
}

export class FirebaseAssetService implements IAssetService {
  private db: Firestore;
  private companyId?: string;

  constructor(db: Firestore, companyId?: string) {
    this.db = db;
    this.companyId = companyId;
  }
  // Asset Management
  async getAssets(): Promise<Asset[]> {
    const assetsRef = collection(this.db, 'assets');
    
    try {
      let q: any = query(assetsRef);
      
      // Filter by companyId if provided
      if (this.companyId) {
        q = query(assetsRef, where('companyId', '==', this.companyId));
      }
      
      const snapshot = await getDocs(q);
      let assets = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Asset));
      
      // Sort in memory to avoid index requirement
      assets.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
      
      return assets;
    } catch (error: any) {
      // If query fails (e.g., index missing or permission denied), try fetching all and filtering in memory
      if (error?.code === 'failed-precondition' || error?.code === 'permission-denied') {
        console.warn(`⚠️ Query failed (${error?.code}) for assets with companyId filter, trying fallback...`);
        console.warn(`   Error details:`, error.message);
        try {
          // Try fetching without the where clause
          const snapshot = await getDocs(query(assetsRef));
          let assets = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Asset));
          
          console.log(`   ✅ Fallback successful: fetched ${assets.length} assets total`);
          
          // Filter by companyId in memory if needed
          if (this.companyId) {
            const beforeFilter = assets.length;
            assets = assets.filter(asset => asset.companyId === this.companyId);
            console.log(`   ✅ Filtered to ${assets.length} assets for companyId: ${this.companyId} (from ${beforeFilter} total)`);
          }
          
          // Sort in memory
          assets.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
          return assets;
        } catch (fallbackError: any) {
          console.error('❌ Fallback query also failed:', fallbackError);
          console.error(`   Fallback error code: ${fallbackError?.code}`);
          console.error(`   Fallback error message: ${fallbackError?.message}`);
          // If even the fallback fails, return empty array (collection might not exist or have no permissions)
          console.warn('   Returning empty array - collection may not exist or user may not have read permissions');
          return [];
        }
      }
      // For other errors, log and rethrow
      console.error('❌ Unexpected error in getAssets:', error);
      throw error;
    }
  }

  async getAssetById(id: string): Promise<Asset | null> {
    const docRef = doc(this.db, 'assets', id);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } as Asset : null;
  }

  async createAsset(asset: Omit<Asset, 'id'>, performedBy: string = 'System'): Promise<Asset> {
    const assetsRef = collection(this.db, 'assets');
    console.log('FirebaseAssetService.createAsset called with:', asset); // Add logging
    
    // Validate companyId is present
    const finalCompanyId = this.companyId || asset.companyId;
    if (!finalCompanyId) {
      throw new Error('companyId is required for asset creation');
    }
    
    const historyEntry: AssetHistoryEntry = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      action: 'created',
      date: new Date().toISOString(),
      performedBy,
      notes: `Asset ${asset.name} added to inventory`
    };
    
    const docRef = await addDoc(assetsRef, {
      ...asset,
      companyId: finalCompanyId, // Ensure companyId is set
      history: [historyEntry],
      createdAt: Timestamp.now(),
    });
    console.log(`✅ Asset created with companyId: ${finalCompanyId}`);
    return { id: docRef.id, ...asset, companyId: finalCompanyId, history: [historyEntry] };
  }

  async updateAsset(id: string, asset: Partial<Asset>, performedBy: string = 'System', historyNote?: string): Promise<Asset> {
    const docRef = doc(this.db, 'assets', id);
    const currentAsset = await this.getAssetById(id);
    
    if (!currentAsset) throw new Error('Asset not found');
    
    // Determine what changed for history tracking
    let historyEntry: Omit<AssetHistoryEntry, 'id'> | null = null;
    
    if (asset.status && asset.status !== currentAsset.status) {
      historyEntry = {
        action: 'status_change',
        date: new Date().toISOString(),
        performedBy,
        notes: historyNote || `Status changed from ${currentAsset.status} to ${asset.status}`,
        oldValue: currentAsset.status,
        newValue: asset.status
      };
    } else if (asset.assignedTo !== undefined) {
      if (asset.assignedTo && asset.assignedTo !== currentAsset.assignedTo) {
        historyEntry = {
          action: currentAsset.assignedTo ? 'transferred' : 'assigned',
          date: new Date().toISOString(),
          performedBy,
          fromEmployee: currentAsset.assignedTo,
          toEmployee: asset.assignedTo,
          notes: historyNote || `Asset ${currentAsset.assignedTo ? 'transferred' : 'assigned'} to ${asset.assignedTo}`
        };
      } else if (!asset.assignedTo && currentAsset.assignedTo) {
        historyEntry = {
          action: 'unassigned',
          date: new Date().toISOString(),
          performedBy,
          fromEmployee: currentAsset.assignedTo,
          notes: historyNote || `Asset unassigned from ${currentAsset.assignedTo}`
        };
      }
    } else if (Object.keys(asset).length > 0) {
      // Generic update
      historyEntry = {
        action: 'updated',
        date: new Date().toISOString(),
        performedBy,
        notes: historyNote || 'Asset details updated'
      };
    }
    
    // Add history entry if there's a change
    const currentHistory = currentAsset.history || [];
    const updateData: any = {
      ...asset,
      updatedAt: Timestamp.now(),
    };
    
    if (historyEntry) {
      const newEntry: AssetHistoryEntry = {
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        ...historyEntry
      };
      updateData.history = [...currentHistory, newEntry];
    }
    
    await updateDoc(docRef, updateData);
    const updated = await this.getAssetById(id);
    if (!updated) throw new Error('Asset not found after update');
    return updated;
  }

  async deleteAsset(id: string): Promise<void> {
    await deleteDoc(doc(this.db, 'assets', id));
  }

  async searchAssets(searchQuery: string): Promise<Asset[]> {
    const assetsRef = collection(this.db, 'assets');
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
    const assignmentsRef = collection(this.db, 'asset_assignments');
    
    let q;
    if (this.companyId) {
      try {
        q = query(assignmentsRef, where('companyId', '==', this.companyId), orderBy('assignedDate', 'desc'));
      } catch (error) {
        console.warn('⚠️ Could not add companyId filter to getAssetAssignments query, filtering in memory');
        q = query(assignmentsRef, orderBy('assignedDate', 'desc'));
      }
    } else {
      q = query(assignmentsRef, orderBy('assignedDate', 'desc'));
    }
    
    const snapshot = await getDocs(q);
    let assignments = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as AssetAssignment));
    
    // Filter by companyId in memory if query didn't include it
    if (this.companyId && !q.toString().includes('companyId')) {
      assignments = assignments.filter(assignment => assignment.companyId === this.companyId);
    }
    
    return assignments;
  }

  async getAssetAssignmentById(id: string): Promise<AssetAssignment | null> {
    const docRef = doc(this.db, 'asset_assignments', id);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } as AssetAssignment : null;
  }

  async createAssetAssignment(assignment: Omit<AssetAssignment, 'id'>): Promise<AssetAssignment> {
    // Validate companyId is present
    const finalCompanyId = this.companyId || assignment.companyId;
    if (!finalCompanyId) {
      throw new Error('companyId is required for asset assignment creation');
    }
    
    const assignmentsRef = collection(this.db, 'asset_assignments');
    const docRef = await addDoc(assignmentsRef, {
      ...assignment,
      companyId: finalCompanyId, // Ensure companyId is set
      createdAt: Timestamp.now(),
    });
    console.log(`✅ Asset assignment created with companyId: ${finalCompanyId}`);
    return { id: docRef.id, ...assignment, companyId: finalCompanyId };
  }

  async updateAssetAssignment(id: string, assignment: Partial<AssetAssignment>): Promise<AssetAssignment> {
    const docRef = doc(this.db, 'asset_assignments', id);
    await updateDoc(docRef, {
      ...assignment,
      updatedAt: Timestamp.now(),
    });
    const updated = await this.getAssetAssignmentById(id);
    if (!updated) throw new Error('Assignment not found after update');
    return updated;
  }

  async deleteAssetAssignment(id: string): Promise<void> {
    await deleteDoc(doc(this.db, 'asset_assignments', id));
  }

  async getAssignmentsByEmployee(employeeId: string): Promise<AssetAssignment[]> {
    const assignmentsRef = collection(this.db, 'asset_assignments');
    const q = query(
      assignmentsRef,
      where('employeeId', '==', employeeId),
      orderBy('assignedDate', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as AssetAssignment));
  }

  async getAssignmentsByAsset(assetId: string): Promise<AssetAssignment[]> {
    const assignmentsRef = collection(this.db, 'asset_assignments');
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
    const maintenanceRef = collection(this.db, 'maintenance_records');
    
    let q;
    if (this.companyId) {
      try {
        q = query(maintenanceRef, where('companyId', '==', this.companyId), orderBy('date', 'desc'));
      } catch (error) {
        console.warn('⚠️ Could not add companyId filter to getMaintenanceRecords query, filtering in memory');
        q = query(maintenanceRef, orderBy('date', 'desc'));
      }
    } else {
      q = query(maintenanceRef, orderBy('date', 'desc'));
    }
    
    const snapshot = await getDocs(q);
    let records = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as MaintenanceRecord));
    
    // Filter by companyId in memory if query didn't include it
    if (this.companyId && !q.toString().includes('companyId')) {
      records = records.filter(record => record.companyId === this.companyId);
    }
    
    return records;
  }

  async getMaintenanceRecordById(id: string): Promise<MaintenanceRecord | null> {
    const docRef = doc(this.db, 'maintenance_records', id);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } as MaintenanceRecord : null;
  }

  async createMaintenanceRecord(record: Omit<MaintenanceRecord, 'id'>): Promise<MaintenanceRecord> {
    // Validate companyId is present
    const finalCompanyId = this.companyId || record.companyId;
    if (!finalCompanyId) {
      throw new Error('companyId is required for maintenance record creation');
    }
    
    const maintenanceRef = collection(this.db, 'maintenance_records');
    const docRef = await addDoc(maintenanceRef, {
      ...record,
      companyId: finalCompanyId, // Ensure companyId is set
      createdAt: Timestamp.now(),
    });
    console.log(`✅ Maintenance record created with companyId: ${finalCompanyId}`);
    return { id: docRef.id, ...record, companyId: finalCompanyId };
  }

  async updateMaintenanceRecord(id: string, record: Partial<MaintenanceRecord>): Promise<MaintenanceRecord> {
    const docRef = doc(this.db, 'maintenance_records', id);
    await updateDoc(docRef, {
      ...record,
      updatedAt: Timestamp.now(),
    });
    const updated = await this.getMaintenanceRecordById(id);
    if (!updated) throw new Error('Maintenance record not found after update');
    return updated;
  }

  async deleteMaintenanceRecord(id: string): Promise<void> {
    await deleteDoc(doc(this.db, 'maintenance_records', id));
  }

  async getMaintenanceRecordsByAsset(assetId: string): Promise<MaintenanceRecord[]> {
    const maintenanceRef = collection(this.db, 'maintenance_records');
    const q = query(
      maintenanceRef,
      where('assetId', '==', assetId),
      orderBy('date', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as MaintenanceRecord));
  }

  // Helper function to add history entry to asset
  private async addHistoryEntry(assetId: string, entry: Omit<AssetHistoryEntry, 'id'>): Promise<void> {
    const assetRef = doc(this.db, 'assets', assetId);
    const assetSnap = await getDoc(assetRef);
    
    if (!assetSnap.exists()) return;
    
    const assetData = assetSnap.data();
    const currentHistory = assetData.history || [];
    const newEntry: AssetHistoryEntry = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      ...entry
    };
    
    await updateDoc(assetRef, {
      history: [...currentHistory, newEntry]
    });
  }

  // Asset Requests
  async getAssetRequests(): Promise<AssetRequest[]> {
    const requestsRef = collection(this.db, 'assetRequests');
    
    try {
      let q: any = query(requestsRef);
      
      // Filter by companyId if provided
      if (this.companyId) {
        q = query(requestsRef, where('companyId', '==', this.companyId));
        console.log(`📋 [AssetRequests] Querying with companyId filter: ${this.companyId}`);
      } else {
        console.log(`📋 [AssetRequests] Querying without companyId filter`);
      }
      
      const snapshot = await getDocs(q);
      let requests = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as AssetRequest));
      
      console.log(`📋 [AssetRequests] Fetched ${requests.length} requests from Firestore`);
      
      // If no results with companyId filter, try fetching all to diagnose and include requests without companyId
      if (requests.length === 0 && this.companyId) {
        console.log(`⚠️ [AssetRequests] No requests found with companyId filter. Checking if any requests exist...`);
        try {
          const allSnapshot = await getDocs(query(requestsRef));
          const allRequests = allSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));
          console.log(`📋 [AssetRequests] Found ${allRequests.length} total requests in collection`);
          
          if (allRequests.length > 0) {
            console.log(`📋 [AssetRequests] Sample request companyIds:`, 
              allRequests.slice(0, 5).map((r: any) => ({ id: r.id, companyId: r.companyId || 'MISSING' }))
            );
            
            // Include requests without companyId for backward compatibility
            const requestsWithoutCompanyId = allRequests.filter((r: any) => !r.companyId);
            if (requestsWithoutCompanyId.length > 0) {
              console.log(`⚠️ [AssetRequests] Found ${requestsWithoutCompanyId.length} requests without companyId - including them for backward compatibility`);
              requests = requestsWithoutCompanyId.map((r: any) => ({
                ...r,
                companyId: this.companyId // Add companyId to the request object for consistency
              })) as AssetRequest[];
            } else {
              console.log(`⚠️ [AssetRequests] Requests exist but none match companyId: ${this.companyId}`);
              console.log(`💡 [AssetRequests] Possible issues:`);
              console.log(`   1. Requests have different companyId`);
              console.log(`   2. Need to update existing requests with correct companyId`);
            }
          } else {
            console.log(`📋 [AssetRequests] No requests exist in collection at all`);
          }
        } catch (diagnosticError: any) {
          console.warn(`⚠️ [AssetRequests] Could not fetch all requests for diagnosis:`, diagnosticError.message);
        }
      }
      
      // Sort in memory to avoid index requirement
      requests.sort((a, b) => {
        const aDate = a.requestedDate instanceof Date ? a.requestedDate.getTime() : 
                     (a.requestedDate as any)?.seconds ? (a.requestedDate as any).seconds * 1000 : 0;
        const bDate = b.requestedDate instanceof Date ? b.requestedDate.getTime() : 
                     (b.requestedDate as any)?.seconds ? (b.requestedDate as any).seconds * 1000 : 0;
        return bDate - aDate; // Descending order
      });
      
      return requests;
    } catch (error: any) {
      // If query fails (e.g., index missing or permission denied), try fetching all and filtering in memory
      if (error?.code === 'failed-precondition' || error?.code === 'permission-denied') {
        console.warn(`⚠️ Query failed (${error?.code}) for assetRequests with companyId filter, trying fallback...`);
        console.warn(`   Error details:`, error.message);
        try {
          // Try fetching without the where clause
          const snapshot = await getDocs(query(requestsRef));
          let requests = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as AssetRequest));
          
          console.log(`   ✅ Fallback successful: fetched ${requests.length} requests total`);
          
          // Filter by companyId in memory if needed
          if (this.companyId) {
            const beforeFilter = requests.length;
            requests = requests.filter(req => {
              const reqCompanyId = (req as any).companyId;
              const matches = reqCompanyId === this.companyId;
              if (!matches && beforeFilter > 0) {
                console.log(`   ⚠️ Request ${req.id} has companyId: ${reqCompanyId}, expected: ${this.companyId}`);
              }
              return matches;
            });
            console.log(`   ✅ Filtered to ${requests.length} requests for companyId: ${this.companyId} (from ${beforeFilter} total)`);
          }
          
          // Sort in memory
          requests.sort((a, b) => {
            const aDate = a.requestedDate instanceof Date ? a.requestedDate.getTime() : 
                         (a.requestedDate as any)?.seconds ? (a.requestedDate as any).seconds * 1000 : 0;
            const bDate = b.requestedDate instanceof Date ? b.requestedDate.getTime() : 
                         (b.requestedDate as any)?.seconds ? (b.requestedDate as any).seconds * 1000 : 0;
            return bDate - aDate;
          });
          return requests;
        } catch (fallbackError: any) {
          console.error('❌ Fallback query also failed:', fallbackError);
          console.error(`   Fallback error code: ${fallbackError?.code}`);
          console.error(`   Fallback error message: ${fallbackError?.message}`);
          // If even the fallback fails, return empty array (collection might not exist or have no permissions)
          console.warn('   Returning empty array - collection may not exist or user may not have read permissions');
          return [];
        }
      }
      // For other errors, log and rethrow
      console.error('❌ Unexpected error in getAssetRequests:', error);
      throw error;
    }
  }

  async getAssetRequestById(id: string): Promise<AssetRequest | null> {
    const docRef = doc(this.db, 'assetRequests', id);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } as AssetRequest : null;
  }

  async createAssetRequest(request: Omit<AssetRequest, 'id'>): Promise<AssetRequest> {
    // Validate companyId is present
    const finalCompanyId = this.companyId || request.companyId;
    if (!finalCompanyId) {
      throw new Error('companyId is required for asset request creation');
    }
    
    const requestsRef = collection(this.db, 'assetRequests');
    const docRef = await addDoc(requestsRef, {
      ...request,
      companyId: finalCompanyId, // Ensure companyId is set
      requestedDate: Timestamp.now(),
    });
    console.log(`✅ Asset request created with companyId: ${finalCompanyId}`, docRef.id);
    return { id: docRef.id, ...request, companyId: finalCompanyId };
  }

  async updateAssetRequest(id: string, request: Partial<AssetRequest>): Promise<AssetRequest> {
    const docRef = doc(this.db, 'assetRequests', id);
    await updateDoc(docRef, {
      ...request,
      updatedAt: Timestamp.now(),
    });
    const updated = await this.getAssetRequestById(id);
    if (!updated) throw new Error('Asset request not found after update');
    return updated;
  }

  async deleteAssetRequest(id: string): Promise<void> {
    await deleteDoc(doc(this.db, 'assetRequests', id));
  }

  async getRequestsByEmployee(employeeId: string): Promise<AssetRequest[]> {
    const requestsRef = collection(this.db, 'assetRequests');
    const q = query(
      requestsRef,
      where('employeeId', '==', employeeId),
      orderBy('requestedDate', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as AssetRequest));
  }

  async getPendingRequests(): Promise<AssetRequest[]> {
    const requestsRef = collection(this.db, 'assetRequests');
    const q = query(
      requestsRef,
      where('status', '==', 'Pending'),
      orderBy('requestedDate', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as AssetRequest));
  }

  // Starter Kits
  async getStarterKits(): Promise<StarterKit[]> {
    const kitsRef = collection(this.db, 'starterKits');
    
    try {
      let q: any = query(kitsRef);
      
      // Filter by companyId if provided
      if (this.companyId) {
        q = query(kitsRef, where('companyId', '==', this.companyId));
      }
      
      const snapshot = await getDocs(q);
      let kits = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as StarterKit));
      
      // Sort in memory to avoid index requirement
      kits.sort((a, b) => (a.jobTitle || '').localeCompare(b.jobTitle || ''));
      
      return kits;
    } catch (error: any) {
      // If query fails (e.g., index missing or permission denied), try fetching all and filtering in memory
      if (error?.code === 'failed-precondition' || error?.code === 'permission-denied') {
        console.warn(`⚠️ Query failed (${error?.code}) for starterKits with companyId filter, trying fallback...`);
        console.warn(`   Error details:`, error.message);
        try {
          // Try fetching without the where clause
          const snapshot = await getDocs(query(kitsRef));
          let kits = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as StarterKit));
          
          console.log(`   ✅ Fallback successful: fetched ${kits.length} starter kits total`);
          
          // Filter by companyId in memory if needed
          if (this.companyId) {
            const beforeFilter = kits.length;
            kits = kits.filter(kit => kit.companyId === this.companyId);
            console.log(`   ✅ Filtered to ${kits.length} starter kits for companyId: ${this.companyId} (from ${beforeFilter} total)`);
          }
          
          // Sort in memory
          kits.sort((a, b) => (a.jobTitle || '').localeCompare(b.jobTitle || ''));
          return kits;
        } catch (fallbackError: any) {
          console.error('❌ Fallback query also failed:', fallbackError);
          console.error(`   Fallback error code: ${fallbackError?.code}`);
          console.error(`   Fallback error message: ${fallbackError?.message}`);
          // If even the fallback fails, return empty array (collection might not exist or have no permissions)
          console.warn('   Returning empty array - collection may not exist or user may not have read permissions');
          return [];
        }
      }
      // For other errors, log and rethrow
      console.error('❌ Unexpected error in getStarterKits:', error);
      throw error;
    }
  }

  async getStarterKitById(id: string): Promise<StarterKit | null> {
    const docRef = doc(this.db, 'starterKits', id);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } as StarterKit : null;
  }

  async createStarterKit(kit: Omit<StarterKit, 'id'>): Promise<StarterKit> {
    // Validate companyId is present
    const finalCompanyId = this.companyId || kit.companyId;
    if (!finalCompanyId) {
      throw new Error('companyId is required for starter kit creation');
    }
    
    const kitsRef = collection(this.db, 'starterKits');
    const docRef = await addDoc(kitsRef, {
      ...kit,
      companyId: finalCompanyId, // Ensure companyId is set
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });
    console.log(`✅ Starter kit created with companyId: ${finalCompanyId}`, docRef.id);
    return { id: docRef.id, ...kit, companyId: finalCompanyId };
  }

  async updateStarterKit(id: string, kit: Partial<StarterKit>): Promise<StarterKit> {
    const docRef = doc(this.db, 'starterKits', id);
    await updateDoc(docRef, {
      ...kit,
      updatedAt: Timestamp.now(),
    });
    const updated = await this.getStarterKitById(id);
    if (!updated) throw new Error('Starter kit not found after update');
    return updated;
  }

  async deleteStarterKit(id: string): Promise<void> {
    await deleteDoc(doc(this.db, 'starterKits', id));
  }

  async getStarterKitByJobTitle(jobTitle: string): Promise<StarterKit | null> {
    const kitsRef = collection(this.db, 'starterKits');
    const q = query(
      kitsRef,
      where('isActive', '==', true)
    );
    const snapshot = await getDocs(q);

    // Case-insensitive search for job title
    const normalizedJobTitle = jobTitle.toLowerCase().trim();

    for (const doc of snapshot.docs) {
      const kitData = doc.data() as StarterKit;
      const kitJobTitle = (kitData.jobTitle || '').toLowerCase().trim();

      if (kitJobTitle === normalizedJobTitle) {
        console.log(`✅ Found matching starter kit: "${kitData.name}" for job title: "${jobTitle}"`);
        return { id: doc.id, ...kitData } as StarterKit;
      }
    }

    console.log(`⚠️ No starter kit found for job title: "${jobTitle}" (searched case-insensitive)`);
    return null;
  }

  // Auto-assign starter kit to employee
  async autoAssignStarterKit(employeeId: string, employeeName: string, jobTitle: string): Promise<{ success: boolean; assignedCount: number; missingAssets: string[]; maintenanceWarning?: string }> {
    try {
      // Find starter kit for this job title
      const kit = await this.getStarterKitByJobTitle(jobTitle);

      if (!kit || !kit.assets || kit.assets.length === 0) {
        console.log('⚠️ No starter kit found for job title:', jobTitle);
        return { success: false, assignedCount: 0, missingAssets: [] };
      }

      console.log('📦 Found starter kit:', kit.name, 'with', kit.assets.length, 'asset types');
      console.log('📋 Starter kit requires:', kit.assets.map(a => `${a.assetType} (qty: ${a.quantity})`).join(', '));

      let assignedCount = 0;
      const missingAssets: string[] = [];
      let maintenanceWarning: string | undefined;

      // Get all assets directly from Firebase (bypass any caching)
      console.log('📥 Fetching FRESH asset data directly from Firebase...');
      const assetsRef = collection(this.db, 'assets');
      const assetsSnapshot = await getDocs(assetsRef);
      const allAssets = assetsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Asset));

      console.log(`📦 Total assets in database: ${allAssets.length}`);
      console.log(`📦 Available assets: ${allAssets.filter(a => a.status === 'Available').length}`);
      console.log(`📦 Assigned assets: ${allAssets.filter(a => a.status === 'Assigned').length}`);

      // Debug: Show all assets with their assignment status
      console.log('🔍 ALL ASSETS IN DATABASE:');
      allAssets.forEach(asset => {
        const statusMismatch = asset.status === 'Available' && asset.assignedTo && asset.assignedTo.trim() !== '' && asset.assignedTo !== 'none';
        console.log(`   - ${asset.name}: status="${asset.status}", assignedTo="${asset.assignedTo || 'none'}"${statusMismatch ? ' ⚠️ STALE DATA!' : ''}`);
      });

      // Check if employee already has assets assigned (filter out empty/null assignedTo)
      const alreadyAssignedAssets = allAssets.filter(a => {
        const hasAssignedTo = a.assignedTo && a.assignedTo.trim() !== '';
        // Case-insensitive match for employee ID
        const matchesEmployee = a.assignedTo && a.assignedTo.toLowerCase() === employeeId.toLowerCase();
        return hasAssignedTo && matchesEmployee;
      });
      console.log(`🔎 Assets assigned to ${employeeId} (case-insensitive):`, alreadyAssignedAssets.length);
      if (alreadyAssignedAssets.length > 0) {
        console.warn(`⚠️ Employee ${employeeName} already has ${alreadyAssignedAssets.length} assets assigned:`,
          alreadyAssignedAssets.map(a => `${a.name} (${a.type})`).join(', '));
        console.warn('🛑 Skipping auto-assignment to prevent duplicates.');
        console.warn('💡 Tip: Wait 2-3 seconds after unassigning assets before re-assigning, to allow Firebase to update.');
        return { success: false, assignedCount: 0, missingAssets: [] };
      }

      console.log(`✅ Employee ${employeeName} has no assets assigned. Proceeding with kit assignment...`);

      // For each asset type in the kit
      for (const kitAsset of kit.assets) {
        const requiredQuantity = kitAsset.quantity;
        console.log(`\n🔍 Looking for: ${requiredQuantity}x ${kitAsset.assetType} (category: ${kitAsset.category})`);

        // Find available assets matching BOTH type AND category
        const matchingAssets = allAssets.filter(asset => {
          const statusMatch = asset.status === 'Available';
          const notAssigned = !asset.assignedTo || asset.assignedTo.trim() === ''; // Must not be assigned to anyone
          const typeMatch = asset.type === kitAsset.assetType;
          const categoryMatch = asset.category === kitAsset.category;

          // Match by type first (preferred), fallback to category if type not set
          const isMatch = statusMatch && notAssigned && (typeMatch || (!asset.type && categoryMatch));

          if (statusMatch && !notAssigned) {
            console.log(`   ⏭️ Skipped: ${asset.name} (still has assignedTo="${asset.assignedTo}")`);
          } else if (statusMatch && notAssigned && !isMatch) {
            console.log(`   ⏭️ Skipped: ${asset.name} (type: ${asset.type || 'none'}, category: ${asset.category}) - doesn't match requirement`);
          }

          if (isMatch) {
            console.log(`   ✅ Matched: ${asset.name} (type: ${asset.type}, category: ${asset.category})`);
          }

          return isMatch;
        }).slice(0, requiredQuantity);

        // Check if required items are under maintenance
        const underMaintenanceCount = allAssets.filter(a =>
          (a.status === 'Under Repair') &&
          (a.type === kitAsset.assetType || a.category === kitAsset.category)
        ).length;

        if (underMaintenanceCount > 0 && kitAsset.isRequired) {
          const warning = `${underMaintenanceCount} ${kitAsset.assetType}(s) are currently under maintenance/repair and cannot be assigned to starter kits`;
          console.warn(`   ⚠️ ${warning}`);
          if (!maintenanceWarning) {
            maintenanceWarning = warning;
          } else {
            maintenanceWarning += `. ${warning}`;
          }
        }

        if (matchingAssets.length < requiredQuantity) {
          const missing = `${kitAsset.assetType} (need ${requiredQuantity}, found ${matchingAssets.length})`;
          missingAssets.push(missing);

          if (kitAsset.isRequired) {
            console.warn(`⚠️ Missing required asset: ${missing}`);
          }
        }

        // Assign available assets
        for (const asset of matchingAssets) {
          await this.updateAsset(asset.id, {
            ...asset,
            status: 'Assigned',
            assignedTo: employeeId,
            assignedDate: new Date().toISOString(),
            isEssential: kitAsset.isRequired, // Mark as essential if required in the kit
            priority: kitAsset.isRequired ? 'High' : (asset.priority || 'Medium') // Set priority based on requirement
          });

          assignedCount++;
          console.log(`✅ Assigned: ${asset.name} (${asset.type}) to ${employeeName} [Essential: ${kitAsset.isRequired}]`);
        }
      }

      console.log(`📊 Starter kit assignment complete: ${assignedCount} assets assigned, ${missingAssets.length} missing`);

      // Send email notification if assets were assigned
      if (assignedCount > 0) {
        const emailResult = await vercelEmailService.sendAssetAssigned({
          employeeName: employeeName,
          email: 'employee@company.com', // This should come from employee data
          assetName: `${assignedCount} asset${assignedCount > 1 ? 's' : ''} assigned`,
          assetType: 'Starter Kit',
          serialNumber: 'Multiple',
          assignedDate: new Date().toISOString(),
          companyName: 'Your Company'
        });

        if (emailResult.success) {
          console.log('✅ Asset assignment email sent successfully');
        } else {
          console.warn('⚠️ Failed to send asset assignment email:', emailResult.error);
          // Don't throw error - email failure shouldn't break the assignment process
        }
      }

      return {
        success: assignedCount > 0,
        assignedCount,
        missingAssets,
        maintenanceWarning
      };
    } catch (error) {
      console.error('❌ Failed to auto-assign starter kit:', error);
      return { success: false, assignedCount: 0, missingAssets: [], maintenanceWarning: undefined };
    }
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
    console.log('MockAssetService.createAsset called with:', asset); // Add logging
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
  static async createAssetService(companyId?: string): Promise<IAssetService> {
    await initializeFirebase();
    const config = await getServiceConfig();
    if (config.defaultService === 'firebase' && config.firebase.enabled && config.firebase.db) {
      return new FirebaseAssetService(config.firebase.db as Firestore, companyId);
    }
    return new MockAssetService();
  }
}

// Cache instances per companyId
const assetServiceInstances: Map<string, IAssetService> = new Map();

export async function getAssetService(companyId?: string): Promise<IAssetService> {
  const cacheKey = companyId || 'global';
  if (!assetServiceInstances.has(cacheKey)) {
    assetServiceInstances.set(cacheKey, await AssetServiceFactory.createAssetService(companyId));
  }
  return assetServiceInstances.get(cacheKey)!;
}