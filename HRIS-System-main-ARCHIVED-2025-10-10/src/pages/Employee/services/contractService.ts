import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage } from '../../../config/firebase';

export interface ContractData {
    id: string;
    employeeId: string;
    position: string;
    department: string;
    effectiveDate: Date;
    terms: {
        salary: number;
        currency: string;
        benefits: string[];
        workingHours: string;
        probationPeriod: number;
    };
    documentUrl: string;
    status: 'draft' | 'pending_review' | 'signed' | 'executed';
    signedDocumentUrl?: string;
    signedAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}

export interface ContractUploadValidation {
    allowedFormats: string[];
    maxFileSize: number; // in MB
    requiredPages: string[];
}

export interface ContractUploadResult {
    success: boolean;
    documentId?: string;
    message?: string;
}

class ContractService {
    // Get employee contract
    async getEmployeeContract(employeeId: string): Promise<ContractData | null> {
        try {
            const contractRef = doc(db, 'contracts', employeeId);
            const contractDoc = await getDoc(contractRef);

            if (!contractDoc.exists()) {
                return null;
            }

            const data = contractDoc.data();
            return {
                ...data,
                effectiveDate: data.effectiveDate?.toDate() || new Date(),
                createdAt: data.createdAt?.toDate() || new Date(),
                updatedAt: data.updatedAt?.toDate() || new Date(),
                signedAt: data.signedAt?.toDate() || undefined
            } as ContractData;
        } catch (error) {
            console.error('Error getting employee contract:', error);
            return null;
        }
    }

    // Download contract document
    async downloadContract(employeeId: string): Promise<Blob> {
        try {
            const contract = await this.getEmployeeContract(employeeId);
            if (!contract || !contract.documentUrl) {
                throw new Error('Contract document not found');
            }

            // If it's a Firebase Storage URL, download from Storage
            if (contract.documentUrl.startsWith('gs://')) {
                const storageRef = ref(storage, contract.documentUrl);
                const url = await getDownloadURL(storageRef);
                const response = await fetch(url);
                return await response.blob();
            }

            // If it's a regular URL, fetch it
            const response = await fetch(contract.documentUrl);
            if (!response.ok) {
                throw new Error('Failed to download contract document');
            }
            return await response.blob();
        } catch (error) {
            console.error('Error downloading contract:', error);
            throw error;
        }
    }

    // Get upload validation rules
    async getUploadValidationRules(): Promise<ContractUploadValidation> {
        // In a real implementation, this would come from the database
        return {
            allowedFormats: ['pdf', 'jpg', 'jpeg', 'png'],
            maxFileSize: 10, // 10MB
            requiredPages: ['signature_page', 'terms_page']
        };
    }

    // Upload signed contract
    async uploadSignedContract(employeeId: string, file: File): Promise<ContractUploadResult> {
        try {
            // Validate file
            const validationRules = await this.getUploadValidationRules();
            const fileExtension = file.name.split('.').pop()?.toLowerCase();

            if (!fileExtension || !validationRules.allowedFormats.includes(fileExtension)) {
                return {
                    success: false,
                    message: `File must be one of: ${validationRules.allowedFormats.join(', ')}`
                };
            }

            const fileSizeMB = file.size / (1024 * 1024);
            if (fileSizeMB > validationRules.maxFileSize) {
                return {
                    success: false,
                    message: `File size must be less than ${validationRules.maxFileSize}MB`
                };
            }

            // Upload to Firebase Storage
            const fileName = `signed_contracts/${employeeId}_${Date.now()}.${fileExtension}`;
            const storageRef = ref(storage, fileName);
            const uploadResult = await uploadBytes(storageRef, file);
            const downloadURL = await getDownloadURL(uploadResult.ref);

            // Update contract record
            const contractRef = doc(db, 'contracts', employeeId);
            await updateDoc(contractRef, {
                signedDocumentUrl: downloadURL,
                signedAt: serverTimestamp(),
                status: 'signed',
                updatedAt: serverTimestamp()
            });

            return {
                success: true,
                documentId: fileName
            };
        } catch (error) {
            console.error('Error uploading signed contract:', error);
            return {
                success: false,
                message: 'Failed to upload contract. Please try again.'
            };
        }
    }

    // Mark contract as reviewed
    async markContractReviewed(employeeId: string): Promise<boolean> {
        try {
            const contractRef = doc(db, 'contracts', employeeId);
            await updateDoc(contractRef, {
                reviewedAt: serverTimestamp(),
                status: 'reviewed',
                updatedAt: serverTimestamp()
            });
            return true;
        } catch (error) {
            console.error('Error marking contract as reviewed:', error);
            return false;
        }
    }

    // Create initial contract (HR action)
    async createContract(contractData: Omit<ContractData, 'id' | 'createdAt' | 'updatedAt'>): Promise<boolean> {
        try {
            const contractRef = doc(db, 'contracts', contractData.employeeId);
            await setDoc(contractRef, {
                ...contractData,
                status: 'draft',
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp()
            });
            return true;
        } catch (error) {
            console.error('Error creating contract:', error);
            return false;
        }
    }

    // Delete signed contract
    async deleteSignedContract(employeeId: string): Promise<boolean> {
        try {
            const contract = await this.getEmployeeContract(employeeId);
            if (!contract?.signedDocumentUrl) {
                return false;
            }

            // Delete from Storage
            const storageRef = ref(storage, contract.signedDocumentUrl);
            await deleteObject(storageRef);

            // Update contract record
            const contractRef = doc(db, 'contracts', employeeId);
            await updateDoc(contractRef, {
                signedDocumentUrl: null,
                signedAt: null,
                status: 'pending_review',
                updatedAt: serverTimestamp()
            });

            return true;
        } catch (error) {
            console.error('Error deleting signed contract:', error);
            return false;
        }
    }

    // Get contract status
    async getContractStatus(employeeId: string): Promise<string> {
        try {
            const contract = await this.getEmployeeContract(employeeId);
            return contract?.status || 'not_found';
        } catch (error) {
            console.error('Error getting contract status:', error);
            return 'error';
        }
    }
}

export const contractService = new ContractService();
