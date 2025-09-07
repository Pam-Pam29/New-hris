import { initializeFirebase, isFirebaseConfigured } from '../config/firebase';
import { payrollService } from '../services/payrollService';
import { onboardingService } from '../services/onboardingService';
import type { Firestore } from 'firebase/firestore';

// Test suite for Firebase integration
describe('Firebase Integration Tests', () => {
    beforeAll(async () => {
        // Initialize Firebase before running tests
        await initializeFirebase();
    });

    // Test Firebase initialization
    describe('Firebase Configuration', () => {
        it('should initialize Firebase successfully', () => {
            expect(isFirebaseConfigured()).toBe(true);
        });
    });

    // Test Payroll Service
    describe('Payroll Service', () => {
        let testRecordId: string;

        it('should create a payroll record', async () => {
            const record = {
                employeeId: 'test-emp-1',
                employeeName: 'Test Employee',
                periodStart: new Date(),
                periodEnd: new Date(),
                grossPay: 5000,
                deductions: 500,
                netPay: 4500,
                status: 'pending' as const
            };

            testRecordId = await payrollService.createPayrollRecord(record);
            expect(testRecordId).toBeDefined();
        });

        it('should retrieve the created payroll record', async () => {
            const record = await payrollService.getPayrollRecord(testRecordId);
            expect(record).toBeDefined();
            expect(record?.employeeId).toBe('test-emp-1');
        });

        it('should update the payroll record', async () => {
            await payrollService.updatePayrollRecord(testRecordId, { status: 'processed' });
            const updatedRecord = await payrollService.getPayrollRecord(testRecordId);
            expect(updatedRecord?.status).toBe('processed');
        });

        it('should delete the payroll record', async () => {
            await payrollService.deletePayrollRecord(testRecordId);
            const deletedRecord = await payrollService.getPayrollRecord(testRecordId);
            expect(deletedRecord).toBeNull();
        });
    });

    // Test Onboarding Service
    describe('Onboarding Service', () => {
        let testTaskId: string;
        let testDocumentId: string;
        let testChecklistId: string;

        it('should create an onboarding task', async () => {
            const task = {
                employeeId: 'test-emp-1',
                title: 'Complete paperwork',
                description: 'Fill out all required forms',
                dueDate: new Date(),
                status: 'pending' as const,
                assignedTo: 'hr-manager',
                category: 'paperwork' as const
            };

            testTaskId = await onboardingService.createTask(task);
            expect(testTaskId).toBeDefined();
        });

        it('should update task status', async () => {
            await onboardingService.updateTaskStatus(testTaskId, 'in-progress');
            const tasks = await onboardingService.getOnboardingTasks('test-emp-1');
            const updatedTask = tasks.find(t => t.id === testTaskId);
            expect(updatedTask?.status).toBe('in-progress');
        });

        it('should upload and verify a document', async () => {
            const document = {
                employeeId: 'test-emp-1',
                name: 'ID Document',
                type: 'identification',
                status: 'received' as const
            };

            testDocumentId = await onboardingService.uploadDocument(document);
            await onboardingService.verifyDocument(testDocumentId);
            const documents = await onboardingService.getRequiredDocuments('test-emp-1');
            const verifiedDoc = documents.find(d => d.id === testDocumentId);
            expect(verifiedDoc?.status).toBe('verified');
        });

        it('should create and complete a checklist', async () => {
            const checklist = {
                employeeId: 'test-emp-1',
                tasks: [testTaskId],
                documents: [testDocumentId],
                completed: false
            };

            testChecklistId = await onboardingService.createChecklist(checklist);
            await onboardingService.completeChecklist(testChecklistId);
            const completedChecklist = await onboardingService.getChecklist('test-emp-1');
            expect(completedChecklist?.completed).toBe(true);
        });

        // Cleanup
        afterAll(async () => {
            try {
                await onboardingService.updateTaskStatus(testTaskId, 'completed');
            } catch (error) {
                console.error('Cleanup error:', error);
            }
        });
    });

    // Test Error Handling
    describe('Error Handling', () => {
        it('should handle Firebase errors gracefully', async () => {
            // Mock a failing Firebase operation
            const originalDb = (payrollService as unknown as { db: Firestore | null }).db;
            (payrollService as unknown as { db: Firestore | null }).db = null;

            try {
                await payrollService.getPayrollRecords();
                fail('Expected error but none was thrown');
            } catch (error) {
                expect(error).toBeDefined();
            } finally {
                // Restore original db
                (payrollService as unknown as { db: Firestore | null }).db = originalDb;
            }
        });
    });
});
