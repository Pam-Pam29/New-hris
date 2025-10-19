// Goal Overdue Detection and Management Service
import { db } from '../config/firebase';
import { collection, query, where, getDocs, updateDoc, doc, Timestamp, writeBatch, getDoc } from 'firebase/firestore';
import { PerformanceGoal } from '../types/performanceManagement';

export class GoalOverdueService {
    private lastCheckTime: number = 0;
    private checkCooldown: number = 60000; // 1 minute cooldown

    // Check employee's goals only (optimized for single employee)
    async checkAndUpdateOverdueGoals(employeeId?: string): Promise<void> {
        try {
            // Debounce: Don't check more than once per minute
            const now = Date.now();
            if (now - this.lastCheckTime < this.checkCooldown) {
                console.log('⏭️ Skipping overdue check (cooldown active)');
                return;
            }
            this.lastCheckTime = now;

            const currentDate = new Date();
            const batch = writeBatch(db);
            let updateCount = 0;

            // Query only specific employee's goals if provided, otherwise all
            let goalsQuery;
            if (employeeId) {
                goalsQuery = query(
                    collection(db, 'performanceGoals'),
                    where('employeeId', '==', employeeId),
                    where('status', 'in', ['not_started', 'in_progress'])
                );
            } else {
                goalsQuery = query(
                    collection(db, 'performanceGoals'),
                    where('status', 'in', ['not_started', 'in_progress'])
                );
            }

            const snapshot = await getDocs(goalsQuery);

            for (const goalDoc of snapshot.docs) {
                const goal = goalDoc.data() as PerformanceGoal;
                const endDate = goal.endDate instanceof Date
                    ? goal.endDate
                    : (goal.endDate as any).toDate();

                // Check if goal is overdue
                if (currentDate > endDate) {
                    const daysOverdue = this.calculateDaysOverdue(endDate, currentDate);

                    // Use batch update for better performance
                    batch.update(doc(db, 'performanceGoals', goalDoc.id), {
                        status: 'overdue',
                        daysOverdue: daysOverdue,
                        updatedAt: Timestamp.now()
                    });

                    updateCount++;
                }
            }

            // Commit all updates in a single batch
            if (updateCount > 0) {
                await batch.commit();
                console.log(`✅ Updated ${updateCount} overdue goal(s)`);
            }
        } catch (error) {
            console.error('❌ Failed to check overdue goals:', error);
        }
    }

    // Calculate days overdue
    calculateDaysOverdue(endDate: Date, now: Date = new Date()): number {
        const diffTime = Math.abs(now.getTime() - endDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    }

    // Get overdue severity level
    getOverdueSeverity(daysOverdue: number): 'minor' | 'moderate' | 'critical' {
        if (daysOverdue >= 15) return 'critical';
        if (daysOverdue >= 8) return 'moderate';
        return 'minor';
    }

    // Get severity color
    getSeverityColor(severity: 'minor' | 'moderate' | 'critical'): string {
        switch (severity) {
            case 'minor': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
            case 'moderate': return 'text-orange-600 bg-orange-50 border-orange-200';
            case 'critical': return 'text-red-600 bg-red-50 border-red-200';
        }
    }

    // Get overdue goals for an employee
    async getEmployeeOverdueGoals(employeeId: string): Promise<PerformanceGoal[]> {
        try {
            const goalsQuery = query(
                collection(db, 'performanceGoals'),
                where('employeeId', '==', employeeId),
                where('status', '==', 'overdue')
            );

            const snapshot = await getDocs(goalsQuery);
            return snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            } as PerformanceGoal));
        } catch (error) {
            console.error('❌ Failed to get overdue goals:', error);
            return [];
        }
    }

    // Request deadline extension
    async requestExtension(
        goalId: string,
        newDeadline: Date,
        reason: string,
        employeeId: string
    ): Promise<void> {
        try {
            await updateDoc(doc(db, 'performanceGoals', goalId), {
                extensionRequested: true,
                extensionRequestDate: Timestamp.now(),
                extensionRequestReason: reason,
                requestedNewDeadline: Timestamp.fromDate(newDeadline),
                // Reset previous decision fields for new request
                extensionApproved: null,  // Clear previous approval/rejection
                extensionDecisionAcknowledged: false,  // Reset acknowledgment flag
                extensionRejectionReason: null,  // Clear old rejection reason
                extensionApprovedBy: null,  // Clear old approver
                extensionApprovedDate: null,  // Clear old approval date
                updatedAt: Timestamp.now()
            });

            console.log('✅ Extension request submitted for goal:', goalId);

            // TODO: Send notification to manager
        } catch (error) {
            console.error('❌ Failed to request extension:', error);
            throw error;
        }
    }

    // Approve extension (Manager action)
    async approveExtension(goalId: string, approvedBy: string): Promise<void> {
        try {
            const goalRef = doc(db, 'performanceGoals', goalId);
            const goalSnapshot = await getDoc(goalRef);

            if (goalSnapshot.exists()) {
                const goal = goalSnapshot.data() as PerformanceGoal;

                await updateDoc(goalRef, {
                    extensionApproved: true,
                    extensionApprovedBy: approvedBy,
                    extensionApprovedDate: Timestamp.now(),
                    endDate: goal.requestedNewDeadline,
                    status: 'in_progress', // Reset to in progress
                    daysOverdue: 0,
                    updatedAt: Timestamp.now()
                    // Keep extensionRequested: true so employee can see it was approved
                });

                console.log('✅ Extension approved for goal:', goalId);

                // TODO: Send notification to employee
            }
        } catch (error) {
            console.error('❌ Failed to approve extension:', error);
            throw error;
        }
    }

    // Reject extension (Manager action)
    async rejectExtension(goalId: string, reason: string): Promise<void> {
        try {
            await updateDoc(doc(db, 'performanceGoals', goalId), {
                extensionApproved: false,
                extensionRejectionReason: reason,
                updatedAt: Timestamp.now()
                // Keep extensionRequested: true so employee can see it was rejected
            });

            console.log('✅ Extension rejected for goal:', goalId);

            // TODO: Send notification to employee
        } catch (error) {
            console.error('❌ Failed to reject extension:', error);
            throw error;
        }
    }

    // Get goals needing attention (at risk of being overdue)
    async getAtRiskGoals(employeeId: string, daysThreshold: number = 7): Promise<PerformanceGoal[]> {
        try {
            const now = new Date();
            const futureDate = new Date(now.getTime() + (daysThreshold * 24 * 60 * 60 * 1000));

            const goalsQuery = query(
                collection(db, 'performanceGoals'),
                where('employeeId', '==', employeeId),
                where('status', 'in', ['not_started', 'in_progress'])
            );

            const snapshot = await getDocs(goalsQuery);

            return snapshot.docs
                .map(doc => ({
                    id: doc.id,
                    ...doc.data()
                } as PerformanceGoal))
                .filter(goal => {
                    const endDate = goal.endDate instanceof Date
                        ? goal.endDate
                        : (goal.endDate as any).toDate();
                    return endDate <= futureDate && endDate > now && goal.progress < 80;
                });
        } catch (error) {
            console.error('❌ Failed to get at-risk goals:', error);
            return [];
        }
    }
}

export const goalOverdueService = new GoalOverdueService();

