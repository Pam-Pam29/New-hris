import { collection, doc, getDocs, addDoc, updateDoc, deleteDoc, query, where, orderBy, Timestamp, getDoc } from 'firebase/firestore';
import { db } from '@/config/firebase';
import { Policy, PolicyAcknowledgment, PolicyRevision, PolicyCategory } from '../types';
import { isFirebaseConfigured } from '@/config/firebase';

export interface IPolicyService {
  // Policy Management
  getPolicies(): Promise<Policy[]>;
  getPolicyById(id: string): Promise<Policy | null>;
  createPolicy(policy: Omit<Policy, 'id'>): Promise<Policy>;
  updatePolicy(id: string, policy: Partial<Policy>): Promise<Policy>;
  deletePolicy(id: string): Promise<void>;
  searchPolicies(query: string): Promise<Policy[]>;
  getPoliciesByCategory(categoryId: string): Promise<Policy[]>;
  getPoliciesByStatus(status: Policy['status']): Promise<Policy[]>;
  
  // Policy Acknowledgments
  getPolicyAcknowledgments(): Promise<PolicyAcknowledgment[]>;
  getPolicyAcknowledgmentById(id: string): Promise<PolicyAcknowledgment | null>;
  createPolicyAcknowledgment(acknowledgment: Omit<PolicyAcknowledgment, 'id'>): Promise<PolicyAcknowledgment>;
  updatePolicyAcknowledgment(id: string, acknowledgment: Partial<PolicyAcknowledgment>): Promise<PolicyAcknowledgment>;
  deletePolicyAcknowledgment(id: string): Promise<void>;
  getAcknowledgmentsByPolicy(policyId: string): Promise<PolicyAcknowledgment[]>;
  getAcknowledgmentsByEmployee(employeeId: string): Promise<PolicyAcknowledgment[]>;
  
  // Policy Revisions
  getPolicyRevisions(): Promise<PolicyRevision[]>;
  getPolicyRevisionById(id: string): Promise<PolicyRevision | null>;
  createPolicyRevision(revision: Omit<PolicyRevision, 'id'>): Promise<PolicyRevision>;
  updatePolicyRevision(id: string, revision: Partial<PolicyRevision>): Promise<PolicyRevision>;
  deletePolicyRevision(id: string): Promise<void>;
  getRevisionsByPolicy(policyId: string): Promise<PolicyRevision[]>;
  
  // Policy Categories
  getPolicyCategories(): Promise<PolicyCategory[]>;
  getPolicyCategoryById(id: string): Promise<PolicyCategory | null>;
  createPolicyCategory(category: Omit<PolicyCategory, 'id'>): Promise<PolicyCategory>;
  updatePolicyCategory(id: string, category: Partial<PolicyCategory>): Promise<PolicyCategory>;
  deletePolicyCategory(id: string): Promise<void>;
}

export class FirebasePolicyService implements IPolicyService {
  // Policy Management
  async getPolicies(): Promise<Policy[]> {
    const policiesRef = collection(db, 'policies');
    const q = query(policiesRef, orderBy('createdDate', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Policy));
  }

  async getPolicyById(id: string): Promise<Policy | null> {
    const docRef = doc(db, 'policies', id);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } as Policy : null;
  }

  async createPolicy(policy: Omit<Policy, 'id'>): Promise<Policy> {
    const policiesRef = collection(db, 'policies');
    const docRef = await addDoc(policiesRef, {
      ...policy,
      createdDate: Timestamp.now(),
      lastModified: Timestamp.now(),
    });
    return { id: docRef.id, ...policy };
  }

  async updatePolicy(id: string, policy: Partial<Policy>): Promise<Policy> {
    const docRef = doc(db, 'policies', id);
    await updateDoc(docRef, {
      ...policy,
      lastModified: Timestamp.now(),
    });
    const updated = await this.getPolicyById(id);
    if (!updated) throw new Error('Policy not found after update');
    return updated;
  }

  async deletePolicy(id: string): Promise<void> {
    await deleteDoc(doc(db, 'policies', id));
  }

  async searchPolicies(searchQuery: string): Promise<Policy[]> {
    const policiesRef = collection(db, 'policies');
    const q = query(policiesRef, orderBy('title'));
    const snapshot = await getDocs(q);
    const policies = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Policy));
    
    return policies.filter(policy =>
      policy.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      policy.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      policy.category.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }

  async getPoliciesByCategory(categoryId: string): Promise<Policy[]> {
    const policiesRef = collection(db, 'policies');
    const q = query(
      policiesRef,
      where('category', '==', categoryId),
      orderBy('createdDate', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Policy));
  }

  async getPoliciesByStatus(status: Policy['status']): Promise<Policy[]> {
    const policiesRef = collection(db, 'policies');
    const q = query(
      policiesRef,
      where('status', '==', status),
      orderBy('createdDate', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Policy));
  }

  // Policy Acknowledgments
  async getPolicyAcknowledgments(): Promise<PolicyAcknowledgment[]> {
    const acknowledgementsRef = collection(db, 'policy_acknowledgments');
    const q = query(acknowledgementsRef, orderBy('acknowledgedDate', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as PolicyAcknowledgment));
  }

  async getPolicyAcknowledgmentById(id: string): Promise<PolicyAcknowledgment | null> {
    const docRef = doc(db, 'policy_acknowledgments', id);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } as PolicyAcknowledgment : null;
  }

  async createPolicyAcknowledgment(acknowledgment: Omit<PolicyAcknowledgment, 'id'>): Promise<PolicyAcknowledgment> {
    const acknowledgementsRef = collection(db, 'policy_acknowledgments');
    const docRef = await addDoc(acknowledgementsRef, {
      ...acknowledgment,
      acknowledgedDate: Timestamp.now(),
    });
    return { id: docRef.id, ...acknowledgment };
  }

  async updatePolicyAcknowledgment(id: string, acknowledgment: Partial<PolicyAcknowledgment>): Promise<PolicyAcknowledgment> {
    const docRef = doc(db, 'policy_acknowledgments', id);
    await updateDoc(docRef, acknowledgment);
    const updated = await this.getPolicyAcknowledgmentById(id);
    if (!updated) throw new Error('Acknowledgment not found after update');
    return updated;
  }

  async deletePolicyAcknowledgment(id: string): Promise<void> {
    await deleteDoc(doc(db, 'policy_acknowledgments', id));
  }

  async getAcknowledgmentsByPolicy(policyId: string): Promise<PolicyAcknowledgment[]> {
    const acknowledgementsRef = collection(db, 'policy_acknowledgments');
    const q = query(
      acknowledgementsRef,
      where('policyId', '==', policyId),
      orderBy('acknowledgedDate', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as PolicyAcknowledgment));
  }

  async getAcknowledgmentsByEmployee(employeeId: string): Promise<PolicyAcknowledgment[]> {
    const acknowledgementsRef = collection(db, 'policy_acknowledgments');
    const q = query(
      acknowledgementsRef,
      where('employeeId', '==', employeeId),
      orderBy('acknowledgedDate', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as PolicyAcknowledgment));
  }

  // Policy Revisions
  async getPolicyRevisions(): Promise<PolicyRevision[]> {
    const revisionsRef = collection(db, 'policy_revisions');
    const q = query(revisionsRef, orderBy('changedDate', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as PolicyRevision));
  }

  async getPolicyRevisionById(id: string): Promise<PolicyRevision | null> {
    const docRef = doc(db, 'policy_revisions', id);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } as PolicyRevision : null;
  }

  async createPolicyRevision(revision: Omit<PolicyRevision, 'id'>): Promise<PolicyRevision> {
    const revisionsRef = collection(db, 'policy_revisions');
    const docRef = await addDoc(revisionsRef, {
      ...revision,
      changedDate: Timestamp.now(),
    });
    return { id: docRef.id, ...revision };
  }

  async updatePolicyRevision(id: string, revision: Partial<PolicyRevision>): Promise<PolicyRevision> {
    const docRef = doc(db, 'policy_revisions', id);
    await updateDoc(docRef, revision);
    const updated = await this.getPolicyRevisionById(id);
    if (!updated) throw new Error('Revision not found after update');
    return updated;
  }

  async deletePolicyRevision(id: string): Promise<void> {
    await deleteDoc(doc(db, 'policy_revisions', id));
  }

  async getRevisionsByPolicy(policyId: string): Promise<PolicyRevision[]> {
    const revisionsRef = collection(db, 'policy_revisions');
    const q = query(
      revisionsRef,
      where('policyId', '==', policyId),
      orderBy('changedDate', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as PolicyRevision));
  }

  // Policy Categories
  async getPolicyCategories(): Promise<PolicyCategory[]> {
    const categoriesRef = collection(db, 'policy_categories');
    const q = query(categoriesRef, orderBy('order'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as PolicyCategory));
  }

  async getPolicyCategoryById(id: string): Promise<PolicyCategory | null> {
    const docRef = doc(db, 'policy_categories', id);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } as PolicyCategory : null;
  }

  async createPolicyCategory(category: Omit<PolicyCategory, 'id'>): Promise<PolicyCategory> {
    const categoriesRef = collection(db, 'policy_categories');
    const docRef = await addDoc(categoriesRef, category);
    return { id: docRef.id, ...category };
  }

  async updatePolicyCategory(id: string, category: Partial<PolicyCategory>): Promise<PolicyCategory> {
    const docRef = doc(db, 'policy_categories', id);
    await updateDoc(docRef, category);
    const updated = await this.getPolicyCategoryById(id);
    if (!updated) throw new Error('Category not found after update');
    return updated;
  }

  async deletePolicyCategory(id: string): Promise<void> {
    await deleteDoc(doc(db, 'policy_categories', id));
  }
}

export class MockPolicyService implements IPolicyService {
  private policies: Policy[] = [];
  private acknowledgments: PolicyAcknowledgment[] = [];
  private revisions: PolicyRevision[] = [];
  private categories: PolicyCategory[] = [];

  // Policy Management
  async getPolicies(): Promise<Policy[]> {
    return this.policies;
  }

  async getPolicyById(id: string): Promise<Policy | null> {
    return this.policies.find(policy => policy.id === id) || null;
  }

  async createPolicy(policy: Omit<Policy, 'id'>): Promise<Policy> {
    const newPolicy = { ...policy, id: Date.now().toString() };
    this.policies.push(newPolicy);
    return newPolicy;
  }

  async updatePolicy(id: string, policy: Partial<Policy>): Promise<Policy> {
    const index = this.policies.findIndex(p => p.id === id);
    if (index === -1) throw new Error('Policy not found');
    this.policies[index] = { ...this.policies[index], ...policy };
    return this.policies[index];
  }

  async deletePolicy(id: string): Promise<void> {
    this.policies = this.policies.filter(policy => policy.id !== id);
  }

  async searchPolicies(query: string): Promise<Policy[]> {
    return this.policies.filter(policy =>
      policy.title.toLowerCase().includes(query.toLowerCase()) ||
      policy.description.toLowerCase().includes(query.toLowerCase()) ||
      policy.category.toLowerCase().includes(query.toLowerCase())
    );
  }

  async getPoliciesByCategory(categoryId: string): Promise<Policy[]> {
    return this.policies.filter(policy => policy.category === categoryId);
  }

  async getPoliciesByStatus(status: Policy['status']): Promise<Policy[]> {
    return this.policies.filter(policy => policy.status === status);
  }

  // Policy Acknowledgments
  async getPolicyAcknowledgments(): Promise<PolicyAcknowledgment[]> {
    return this.acknowledgments;
  }

  async getPolicyAcknowledgmentById(id: string): Promise<PolicyAcknowledgment | null> {
    return this.acknowledgments.find(ack => ack.id === id) || null;
  }

  async createPolicyAcknowledgment(acknowledgment: Omit<PolicyAcknowledgment, 'id'>): Promise<PolicyAcknowledgment> {
    const newAcknowledgment = { ...acknowledgment, id: Date.now().toString() };
    this.acknowledgments.push(newAcknowledgment);
    return newAcknowledgment;
  }

  async updatePolicyAcknowledgment(id: string, acknowledgment: Partial<PolicyAcknowledgment>): Promise<PolicyAcknowledgment> {
    const index = this.acknowledgments.findIndex(a => a.id === id);
    if (index === -1) throw new Error('Acknowledgment not found');
    this.acknowledgments[index] = { ...this.acknowledgments[index], ...acknowledgment };
    return this.acknowledgments[index];
  }

  async deletePolicyAcknowledgment(id: string): Promise<void> {
    this.acknowledgments = this.acknowledgments.filter(ack => ack.id !== id);
  }

  async getAcknowledgmentsByPolicy(policyId: string): Promise<PolicyAcknowledgment[]> {
    return this.acknowledgments.filter(ack => ack.policyId === policyId);
  }

  async getAcknowledgmentsByEmployee(employeeId: string): Promise<PolicyAcknowledgment[]> {
    return this.acknowledgments.filter(ack => ack.employeeId === employeeId);
  }

  // Policy Revisions
  async getPolicyRevisions(): Promise<PolicyRevision[]> {
    return this.revisions;
  }

  async getPolicyRevisionById(id: string): Promise<PolicyRevision | null> {
    return this.revisions.find(rev => rev.id === id) || null;
  }

  async createPolicyRevision(revision: Omit<PolicyRevision, 'id'>): Promise<PolicyRevision> {
    const newRevision = { ...revision, id: Date.now().toString() };
    this.revisions.push(newRevision);
    return newRevision;
  }

  async updatePolicyRevision(id: string, revision: Partial<PolicyRevision>): Promise<PolicyRevision> {
    const index = this.revisions.findIndex(r => r.id === id);
    if (index === -1) throw new Error('Revision not found');
    this.revisions[index] = { ...this.revisions[index], ...revision };
    return this.revisions[index];
  }

  async deletePolicyRevision(id: string): Promise<void> {
    this.revisions = this.revisions.filter(rev => rev.id !== id);
  }

  async getRevisionsByPolicy(policyId: string): Promise<PolicyRevision[]> {
    return this.revisions.filter(rev => rev.policyId === policyId);
  }

  // Policy Categories
  async getPolicyCategories(): Promise<PolicyCategory[]> {
    return this.categories;
  }

  async getPolicyCategoryById(id: string): Promise<PolicyCategory | null> {
    return this.categories.find(cat => cat.id === id) || null;
  }

  async createPolicyCategory(category: Omit<PolicyCategory, 'id'>): Promise<PolicyCategory> {
    const newCategory = { ...category, id: Date.now().toString() };
    this.categories.push(newCategory);
    return newCategory;
  }

  async updatePolicyCategory(id: string, category: Partial<PolicyCategory>): Promise<PolicyCategory> {
    const index = this.categories.findIndex(c => c.id === id);
    if (index === -1) throw new Error('Category not found');
    this.categories[index] = { ...this.categories[index], ...category };
    return this.categories[index];
  }

  async deletePolicyCategory(id: string): Promise<void> {
    this.categories = this.categories.filter(cat => cat.id !== id);
  }
}

export class PolicyServiceFactory {
  static async createPolicyService(): Promise<IPolicyService> {
    if (await isFirebaseConfigured()) {
      return new FirebasePolicyService();
    }
    return new MockPolicyService();
  }
}

let policyServiceInstance: IPolicyService | null = null;

export async function getPolicyService(): Promise<IPolicyService> {
  if (!policyServiceInstance) {
    policyServiceInstance = await PolicyServiceFactory.createPolicyService();
  }
  return policyServiceInstance;
}