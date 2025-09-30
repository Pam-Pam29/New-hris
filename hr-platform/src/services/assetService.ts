// Asset Management Service
import { 
  collection, 
  doc, 
  getDocs, 
  getDoc,
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy,
  Timestamp 
} from 'firebase/firestore';
import { getFirebaseDb } from '../config/firebase';
import { Asset, AssetAssignment, AssetMaintenance, AssetStatistics } from '../types/assetManagement';

export class AssetService {
  private db;

  constructor() {
    this.db = getFirebaseDb();
  }

  // ==================== ASSETS ====================
  
  async getAllAssets(): Promise<Asset[]> {
    try {
      const assetsRef = collection(this.db, 'assets');
      const q = query(assetsRef, orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      
      const assets = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Asset));
      
      console.log('📦 Loaded assets:', assets.length);
      return assets;
    } catch (error) {
      console.error('Failed to load assets:', error);
      return [];
    }
  }

  async getAssetById(id: string): Promise<Asset | null> {
    try {
      const docRef = doc(this.db, 'assets', id);
      const docSnap = await getDoc(docRef);
      return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } as Asset : null;
    } catch (error) {
      console.error('Failed to get asset:', error);
      return null;
    }
  }

  async getAssetsByStatus(status: Asset['status']): Promise<Asset[]> {
    try {
      const assetsRef = collection(this.db, 'assets');
      const q = query(assetsRef, where('status', '==', status));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Asset));
    } catch (error) {
      console.error('Failed to get assets by status:', error);
      return [];
    }
  }

  async getAssetsByEmployee(employeeId: string): Promise<Asset[]> {
    try {
      const assetsRef = collection(this.db, 'assets');
      const q = query(assetsRef, where('assignedTo', '==', employeeId), where('status', '==', 'assigned'));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Asset));
    } catch (error) {
      console.error('Failed to get assets by employee:', error);
      return [];
    }
  }

  async createAsset(asset: Omit<Asset, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const assetsRef = collection(this.db, 'assets');
      const docRef = await addDoc(assetsRef, {
        ...asset,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      });
      console.log('✅ Asset created:', docRef.id);
      return docRef.id;
    } catch (error) {
      console.error('Failed to create asset:', error);
      throw error;
    }
  }

  async updateAsset(id: string, asset: Partial<Asset>): Promise<void> {
    try {
      const docRef = doc(this.db, 'assets', id);
      await updateDoc(docRef, {
        ...asset,
        updatedAt: Timestamp.now()
      });
      console.log('✅ Asset updated:', id);
    } catch (error) {
      console.error('Failed to update asset:', error);
      throw error;
    }
  }

  async deleteAsset(id: string): Promise<void> {
    try {
      await deleteDoc(doc(this.db, 'assets', id));
      console.log('✅ Asset deleted:', id);
    } catch (error) {
      console.error('Failed to delete asset:', error);
      throw error;
    }
  }

  // ==================== ASSET ASSIGNMENTS ====================

  async getAllAssignments(): Promise<AssetAssignment[]> {
    try {
      const assignmentsRef = collection(this.db, 'assetAssignments');
      const q = query(assignmentsRef, orderBy('assignedDate', 'desc'));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as AssetAssignment));
    } catch (error) {
      console.error('Failed to load assignments:', error);
      return [];
    }
  }

  async getAssignmentsByEmployee(employeeId: string): Promise<AssetAssignment[]> {
    try {
      const assignmentsRef = collection(this.db, 'assetAssignments');
      const q = query(assignmentsRef, where('employeeId', '==', employeeId), orderBy('assignedDate', 'desc'));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as AssetAssignment));
    } catch (error) {
      console.error('Failed to get assignments by employee:', error);
      return [];
    }
  }

  async getAssignmentsByAsset(assetId: string): Promise<AssetAssignment[]> {
    try {
      const assignmentsRef = collection(this.db, 'assetAssignments');
      const q = query(assignmentsRef, where('assetId', '==', assetId), orderBy('assignedDate', 'desc'));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as AssetAssignment));
    } catch (error) {
      console.error('Failed to get assignments by asset:', error);
      return [];
    }
  }

  async assignAsset(
    assetId: string, 
    assetTag: string,
    assetName: string,
    employeeId: string, 
    employeeName: string,
    assignedBy: string,
    notes?: string
  ): Promise<void> {
    try {
      // Create assignment record
      const assignmentsRef = collection(this.db, 'assetAssignments');
      await addDoc(assignmentsRef, {
        assetId,
        assetTag,
        assetName,
        employeeId,
        employeeName,
        assignedDate: Timestamp.now(),
        status: 'active',
        notes: notes || '',
        assignedBy
      });

      // Update asset status
      await this.updateAsset(assetId, {
        status: 'assigned',
        assignedTo: employeeId,
        assignedToName: employeeName,
        assignmentDate: Timestamp.now()
      });

      console.log('✅ Asset assigned to employee');
    } catch (error) {
      console.error('Failed to assign asset:', error);
      throw error;
    }
  }

  async returnAsset(assetId: string, assignmentId: string): Promise<void> {
    try {
      // Update assignment record
      const assignmentRef = doc(this.db, 'assetAssignments', assignmentId);
      await updateDoc(assignmentRef, {
        returnedDate: Timestamp.now(),
        status: 'returned'
      });

      // Update asset status
      await this.updateAsset(assetId, {
        status: 'available',
        assignedTo: null,
        assignedToName: null,
        assignmentDate: null
      });

      console.log('✅ Asset returned');
    } catch (error) {
      console.error('Failed to return asset:', error);
      throw error;
    }
  }

  // ==================== ASSET MAINTENANCE ====================

  async getMaintenanceRecords(assetId?: string): Promise<AssetMaintenance[]> {
    try {
      const maintenanceRef = collection(this.db, 'assetMaintenance');
      let q;
      if (assetId) {
        q = query(maintenanceRef, where('assetId', '==', assetId), orderBy('performedDate', 'desc'));
      } else {
        q = query(maintenanceRef, orderBy('performedDate', 'desc'));
      }
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as AssetMaintenance));
    } catch (error) {
      console.error('Failed to get maintenance records:', error);
      return [];
    }
  }

  async addMaintenanceRecord(maintenance: Omit<AssetMaintenance, 'id'>): Promise<void> {
    try {
      const maintenanceRef = collection(this.db, 'assetMaintenance');
      await addDoc(maintenanceRef, maintenance);
      console.log('✅ Maintenance record added');
    } catch (error) {
      console.error('Failed to add maintenance record:', error);
      throw error;
    }
  }

  // ==================== STATISTICS ====================

  async getStatistics(): Promise<AssetStatistics> {
    try {
      const assets = await this.getAllAssets();
      
      const totalAssets = assets.length;
      const availableAssets = assets.filter(a => a.status === 'available').length;
      const assignedAssets = assets.filter(a => a.status === 'assigned').length;
      const maintenanceAssets = assets.filter(a => a.status === 'maintenance').length;
      const retiredAssets = assets.filter(a => a.status === 'retired').length;
      
      const totalValue = assets.reduce((sum, asset) => {
        const value = asset.currentValue || asset.purchasePrice || 0;
        return sum + value;
      }, 0);

      // Assets by category
      const categoryMap = new Map<string, number>();
      assets.forEach(asset => {
        categoryMap.set(asset.category, (categoryMap.get(asset.category) || 0) + 1);
      });
      const assetsByCategory = Array.from(categoryMap.entries()).map(([category, count]) => ({
        category: category as any,
        count
      }));

      // Assets by condition
      const conditionMap = new Map<string, number>();
      assets.forEach(asset => {
        conditionMap.set(asset.condition, (conditionMap.get(asset.condition) || 0) + 1);
      });
      const assetsByCondition = Array.from(conditionMap.entries()).map(([condition, count]) => ({
        condition: condition as any,
        count
      }));

      return {
        totalAssets,
        availableAssets,
        assignedAssets,
        maintenanceAssets,
        retiredAssets,
        totalValue,
        assetsByCategory,
        assetsByCondition
      };
    } catch (error) {
      console.error('Failed to get statistics:', error);
      throw error;
    }
  }
}

// Singleton instance
let assetServiceInstance: AssetService | null = null;

export const getAssetService = (): AssetService => {
  if (!assetServiceInstance) {
    assetServiceInstance = new AssetService();
  }
  return assetServiceInstance;
};
