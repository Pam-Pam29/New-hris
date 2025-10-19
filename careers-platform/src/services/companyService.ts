import { Firestore, collection, doc, getDoc, getDocs, addDoc, updateDoc, query, where, Timestamp } from 'firebase/firestore';
import { Company } from '../types/company';

export class CompanyService {
  constructor(private db: Firestore) {}

  // Get company by ID
  async getCompany(id: string): Promise<Company | null> {
    const companyRef = doc(this.db, 'companies', id);
    const snapshot = await getDoc(companyRef);
    
    if (!snapshot.exists()) return null;
    
    return {
      id: snapshot.id,
      ...snapshot.data()
    } as Company;
  }

  // Get company by domain/slug
  async getCompanyByDomain(domain: string): Promise<Company | null> {
    const companiesRef = collection(this.db, 'companies');
    const q = query(companiesRef, where('domain', '==', domain));
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) return null;
    
    return {
      id: snapshot.docs[0].id,
      ...snapshot.docs[0].data()
    } as Company;
  }

  // Get all active companies
  async getActiveCompanies(): Promise<Company[]> {
    const companiesRef = collection(this.db, 'companies');
    const q = query(companiesRef, where('status', '==', 'active'));
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Company));
  }

  // Create new company
  async createCompany(company: Omit<Company, 'id' | 'createdAt'>): Promise<string> {
    const companiesRef = collection(this.db, 'companies');
    const docRef = await addDoc(companiesRef, {
      ...company,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    });
    
    console.log('✅ Created company:', company.displayName, '(ID:', docRef.id, ')');
    return docRef.id;
  }

  // Update company
  async updateCompany(id: string, data: Partial<Company>): Promise<void> {
    const companyRef = doc(this.db, 'companies', id);
    await updateDoc(companyRef, {
      ...data,
      updatedAt: Timestamp.now()
    });
  }
}

// Singleton instance
let companyServiceInstance: CompanyService | null = null;

export async function getCompanyService(): Promise<CompanyService> {
  if (!companyServiceInstance) {
    const { getFirebaseDb } = await import('../config/firebase');
    const db = getFirebaseDb();
    
    if (!db) {
      throw new Error('Firebase not available');
    }
    
    companyServiceInstance = new CompanyService(db);
  }
  
  return companyServiceInstance;
}

