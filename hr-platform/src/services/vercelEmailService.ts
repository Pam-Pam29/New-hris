interface EmailData {
    to: string;
    subject: string;
    html: string;
    from?: string;
}

interface HREmailData {
    emailType: string;
    recipient: {
        email: string;
        name?: string;
    };
    data: any;
}

class VercelEmailService {
    private baseUrl: string;

    constructor() {
        // Use the current deployed HR platform URL for API calls
        this.baseUrl = window.location.origin;
    }

    async sendEmail(emailData: EmailData): Promise<{ success: boolean; error?: string }> {
        try {
            console.log('📧 [Vercel Email] Sending email:', { to: emailData.to, subject: emailData.subject });

            const response = await fetch(`${this.baseUrl}/api/send-email`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(emailData),
            });

            const result = await response.json();

            if (!response.ok) {
                console.error('❌ [Vercel Email] API error:', result);
                return { success: false, error: result.error || 'Failed to send email' };
            }

            console.log('✅ [Vercel Email] Email sent successfully:', result);
            return { success: true };
        } catch (error) {
            console.error('❌ [Vercel Email] Network error:', error);
            return { success: false, error: 'Network error occurred' };
        }
    }

    async sendHREmail(hrEmailData: HREmailData): Promise<{ success: boolean; error?: string }> {
        try {
            console.log('📧 [Vercel HR Email] Sending HR email:', {
                type: hrEmailData.emailType,
                to: hrEmailData.recipient.email
            });

            const response = await fetch(`${this.baseUrl}/api/send-hr-email`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(hrEmailData),
            });

            const result = await response.json();

            if (!response.ok) {
                console.error('❌ [Vercel HR Email] API error:', result);
                return { success: false, error: result.error || 'Failed to send HR email' };
            }

            console.log('✅ [Vercel HR Email] HR email sent successfully:', result);
            return { success: true };
        } catch (error) {
            console.error('❌ [Vercel HR Email] Network error:', error);
            return { success: false, error: 'Network error occurred' };
        }
    }

    // Employee invitation email
    async sendEmployeeInvitation(data: {
        employeeName: string;
        employeeId: string;
        setupLink: string;
        companyName: string;
        position: string;
        email: string;
    }): Promise<{ success: boolean; error?: string }> {
        return this.sendHREmail({
            emailType: 'employee_invitation',
            recipient: {
                email: data.email,
                name: data.employeeName
            },
            data: {
                employeeName: data.employeeName,
                employeeId: data.employeeId,
                setupLink: data.setupLink,
                companyName: data.companyName,
                position: data.position
            }
        });
    }

    // Leave management emails
    async sendLeaveApproved(data: {
        employeeName: string;
        email: string;
        leaveType: string;
        startDate: string;
        endDate: string;
        companyName: string;
    }): Promise<{ success: boolean; error?: string }> {
        return this.sendHREmail({
            emailType: 'leave_approved',
            recipient: { email: data.email, name: data.employeeName },
            data: {
                employeeName: data.employeeName,
                leaveType: data.leaveType,
                startDate: data.startDate,
                endDate: data.endDate,
                companyName: data.companyName
            }
        });
    }

    async sendLeaveRejected(data: {
        employeeName: string;
        email: string;
        leaveType: string;
        startDate: string;
        endDate: string;
        reason: string;
        companyName: string;
    }): Promise<{ success: boolean; error?: string }> {
        return this.sendHREmail({
            emailType: 'leave_rejected',
            recipient: { email: data.email, name: data.employeeName },
            data: {
                employeeName: data.employeeName,
                leaveType: data.leaveType,
                startDate: data.startDate,
                endDate: data.endDate,
                reason: data.reason,
                companyName: data.companyName
            }
        });
    }

    // Meeting emails
    async sendMeetingScheduled(data: {
        employeeName: string;
        email: string;
        meetingTitle: string;
        meetingDate: string;
        meetingTime: string;
        location: string;
        companyName: string;
    }): Promise<{ success: boolean; error?: string }> {
        return this.sendHREmail({
            emailType: 'meeting_scheduled',
            recipient: { email: data.email, name: data.employeeName },
            data: {
                employeeName: data.employeeName,
                meetingTitle: data.meetingTitle,
                meetingDate: data.meetingDate,
                meetingTime: data.meetingTime,
                location: data.location,
                companyName: data.companyName
            }
        });
    }

    // Recruitment emails
    async sendInterviewInvitation(data: {
        candidateName: string;
        email: string;
        position: string;
        interviewDate: string;
        interviewTime: string;
        location: string;
        companyName: string;
    }): Promise<{ success: boolean; error?: string }> {
        return this.sendHREmail({
            emailType: 'interview_invitation',
            recipient: { email: data.email, name: data.candidateName },
            data: {
                candidateName: data.candidateName,
                position: data.position,
                interviewDate: data.interviewDate,
                interviewTime: data.interviewTime,
                location: data.location,
                companyName: data.companyName
            }
        });
    }

    async sendApplicationReceived(data: {
        candidateName: string;
        email: string;
        position: string;
        companyName: string;
    }): Promise<{ success: boolean; error?: string }> {
        return this.sendHREmail({
            emailType: 'application_received',
            recipient: { email: data.email, name: data.candidateName },
            data: {
                candidateName: data.candidateName,
                position: data.position,
                companyName: data.companyName
            }
        });
    }

    // Payroll emails
    async sendPayslipAvailable(data: {
        employeeName: string;
        email: string;
        payPeriod: string;
        companyName: string;
    }): Promise<{ success: boolean; error?: string }> {
        return this.sendHREmail({
            emailType: 'payslip_available',
            recipient: { email: data.email, name: data.employeeName },
            data: {
                employeeName: data.employeeName,
                payPeriod: data.payPeriod,
                companyName: data.companyName
            }
        });
    }

    async sendPaymentFailed(data: {
        employeeName: string;
        email: string;
        payPeriod: string;
        companyName: string;
    }): Promise<{ success: boolean; error?: string }> {
        return this.sendHREmail({
            emailType: 'payment_failed',
            recipient: { email: data.email, name: data.employeeName },
            data: {
                employeeName: data.employeeName,
                payPeriod: data.payPeriod,
                companyName: data.companyName
            }
        });
    }

    // Time management emails
    async sendTimeAdjustment(data: {
        employeeName: string;
        email: string;
        adjustmentDate: string;
        adjustmentType: string;
        companyName: string;
    }): Promise<{ success: boolean; error?: string }> {
        return this.sendHREmail({
            emailType: 'time_adjustment',
            recipient: { email: data.email, name: data.employeeName },
            data: {
                employeeName: data.employeeName,
                adjustmentDate: data.adjustmentDate,
                adjustmentType: data.adjustmentType,
                companyName: data.companyName
            }
        });
    }

    // Policy emails
    async sendNewPolicy(data: {
        employeeName: string;
        email: string;
        policyTitle: string;
        policyDescription: string;
        companyName: string;
    }): Promise<{ success: boolean; error?: string }> {
        return this.sendHREmail({
            emailType: 'new_policy',
            recipient: { email: data.email, name: data.employeeName },
            data: {
                employeeName: data.employeeName,
                policyTitle: data.policyTitle,
                policyDescription: data.policyDescription,
                companyName: data.companyName
            }
        });
    }

    // Security emails
    async sendAccountLocked(data: {
        employeeName: string;
        email: string;
        companyName: string;
    }): Promise<{ success: boolean; error?: string }> {
        return this.sendHREmail({
            emailType: 'account_locked',
            recipient: { email: data.email, name: data.employeeName },
            data: {
                employeeName: data.employeeName,
                companyName: data.companyName
            }
        });
    }

    // Job offer emails
    async sendJobOffer(data: {
        candidateName: string;
        email: string;
        position: string;
        offerDetails: string;
        companyName: string;
    }): Promise<{ success: boolean; error?: string }> {
        return this.sendHREmail({
            emailType: 'job_offer',
            recipient: { email: data.email, name: data.candidateName },
            data: {
                candidateName: data.candidateName,
                position: data.position,
                offerDetails: data.offerDetails,
                companyName: data.companyName
            }
        });
    }

    // Onboarding emails
    async sendFirstDayInstructions(data: {
        employeeName: string;
        email: string;
        startDate: string;
        startTime: string;
        location: string;
        companyName: string;
    }): Promise<{ success: boolean; error?: string }> {
        return this.sendHREmail({
            emailType: 'first_day_instructions',
            recipient: { email: data.email, name: data.employeeName },
            data: {
                employeeName: data.employeeName,
                startDate: data.startDate,
                startTime: data.startTime,
                location: data.location,
                companyName: data.companyName
            }
        });
    }

    // Contract management emails
    async sendContractStatusChanged(data: {
        employeeName: string;
        email: string;
        contractStatus: string;
        previousStatus: string;
        companyName: string;
        effectiveDate?: string;
    }): Promise<{ success: boolean; error?: string }> {
        return this.sendHREmail({
            emailType: 'contract_status_changed',
            recipient: { email: data.email, name: data.employeeName },
            data: {
                employeeName: data.employeeName,
                contractStatus: data.contractStatus,
                previousStatus: data.previousStatus,
                companyName: data.companyName,
                effectiveDate: data.effectiveDate
            }
        });
    }

    async sendContractSigned(data: {
        employeeName: string;
        email: string;
        contractTitle: string;
        signedDate: string;
        companyName: string;
    }): Promise<{ success: boolean; error?: string }> {
        return this.sendHREmail({
            emailType: 'contract_signed',
            recipient: { email: data.email, name: data.employeeName },
            data: {
                employeeName: data.employeeName,
                contractTitle: data.contractTitle,
                signedDate: data.signedDate,
                companyName: data.companyName
            }
        });
    }

    async sendContractExpiryReminder(data: {
        employeeName: string;
        email: string;
        contractTitle: string;
        expiryDate: string;
        daysUntilExpiry: number;
        companyName: string;
    }): Promise<{ success: boolean; error?: string }> {
        return this.sendHREmail({
            emailType: 'contract_expiry_reminder',
            recipient: { email: data.email, name: data.employeeName },
            data: {
                employeeName: data.employeeName,
                contractTitle: data.contractTitle,
                expiryDate: data.expiryDate,
                daysUntilExpiry: data.daysUntilExpiry,
                companyName: data.companyName
            }
        });
    }

    // Performance management emails
    async sendPerformanceReviewScheduled(data: {
        employeeName: string;
        email: string;
        reviewPeriod: string;
        reviewDate: string;
        reviewerName: string;
        companyName: string;
    }): Promise<{ success: boolean; error?: string }> {
        return this.sendHREmail({
            emailType: 'performance_review_scheduled',
            recipient: { email: data.email, name: data.employeeName },
            data: {
                employeeName: data.employeeName,
                reviewPeriod: data.reviewPeriod,
                reviewDate: data.reviewDate,
                reviewerName: data.reviewerName,
                companyName: data.companyName
            }
        });
    }

    async sendPerformanceReviewReminder(data: {
        employeeName: string;
        email: string;
        reviewPeriod: string;
        reviewDate: string;
        companyName: string;
    }): Promise<{ success: boolean; error?: string }> {
        return this.sendHREmail({
            emailType: 'performance_review_reminder',
            recipient: { email: data.email, name: data.employeeName },
            data: {
                employeeName: data.employeeName,
                reviewPeriod: data.reviewPeriod,
                reviewDate: data.reviewDate,
                companyName: data.companyName
            }
        });
    }

    async sendPerformanceGoalAssigned(data: {
        employeeName: string;
        email: string;
        goalTitle: string;
        goalDescription: string;
        dueDate: string;
        companyName: string;
    }): Promise<{ success: boolean; error?: string }> {
        return this.sendHREmail({
            emailType: 'performance_goal_assigned',
            recipient: { email: data.email, name: data.employeeName },
            data: {
                employeeName: data.employeeName,
                goalTitle: data.goalTitle,
                goalDescription: data.goalDescription,
                dueDate: data.dueDate,
                companyName: data.companyName
            }
        });
    }

    async sendPerformanceImprovementPlan(data: {
        employeeName: string;
        email: string;
        pipTitle: string;
        pipDescription: string;
        startDate: string;
        endDate: string;
        companyName: string;
    }): Promise<{ success: boolean; error?: string }> {
        return this.sendHREmail({
            emailType: 'performance_improvement_plan',
            recipient: { email: data.email, name: data.employeeName },
            data: {
                employeeName: data.employeeName,
                pipTitle: data.pipTitle,
                pipDescription: data.pipDescription,
                startDate: data.startDate,
                endDate: data.endDate,
                companyName: data.companyName
            }
        });
    }

    // Performance meeting reminder email
    async sendPerformanceMeetingReminder(data: {
        employeeName: string;
        email: string;
        meetingTitle: string;
        meetingDate: string;
        meetingTime: string;
        location: string;
        companyName: string;
    }): Promise<{ success: boolean; error?: string }> {
        return this.sendHREmail({
            emailType: 'performance_meeting_reminder',
            recipient: { email: data.email, name: data.employeeName },
            data: {
                employeeName: data.employeeName,
                meetingTitle: data.meetingTitle,
                meetingDate: data.meetingDate,
                meetingTime: data.meetingTime,
                location: data.location,
                companyName: data.companyName
            }
        });
    }

    // Asset management emails
    async sendAssetAssigned(data: {
        employeeName: string;
        email: string;
        assetName: string;
        assetType: string;
        serialNumber: string;
        assignedDate: string;
        companyName: string;
    }): Promise<{ success: boolean; error?: string }> {
        return this.sendHREmail({
            emailType: 'asset_assigned',
            recipient: { email: data.email, name: data.employeeName },
            data: {
                employeeName: data.employeeName,
                assetName: data.assetName,
                assetType: data.assetType,
                serialNumber: data.serialNumber,
                assignedDate: data.assignedDate,
                companyName: data.companyName
            }
        });
    }

    async sendAssetReturnReminder(data: {
        employeeName: string;
        email: string;
        assetName: string;
        returnDate: string;
        daysUntilReturn: number;
        companyName: string;
    }): Promise<{ success: boolean; error?: string }> {
        return this.sendHREmail({
            emailType: 'asset_return_reminder',
            recipient: { email: data.email, name: data.employeeName },
            data: {
                employeeName: data.employeeName,
                assetName: data.assetName,
                returnDate: data.returnDate,
                daysUntilReturn: data.daysUntilReturn,
                companyName: data.companyName
            }
        });
    }

    async sendAssetMaintenanceRequired(data: {
        employeeName: string;
        email: string;
        assetName: string;
        maintenanceType: string;
        dueDate: string;
        companyName: string;
    }): Promise<{ success: boolean; error?: string }> {
        return this.sendHREmail({
            emailType: 'asset_maintenance_required',
            recipient: { email: data.email, name: data.employeeName },
            data: {
                employeeName: data.employeeName,
                assetName: data.assetName,
                maintenanceType: data.maintenanceType,
                dueDate: data.dueDate,
                companyName: data.companyName
            }
        });
    }

    // Security emails
    async sendPasswordReset(data: {
        employeeName: string;
        email: string;
        resetLink: string;
        expiryTime: string;
        companyName: string;
    }): Promise<{ success: boolean; error?: string }> {
        return this.sendHREmail({
            emailType: 'password_reset',
            recipient: { email: data.email, name: data.employeeName },
            data: {
                employeeName: data.employeeName,
                resetLink: data.resetLink,
                expiryTime: data.expiryTime,
                companyName: data.companyName
            }
        });
    }

    async sendLoginAttemptFailed(data: {
        employeeName: string;
        email: string;
        attemptTime: string;
        ipAddress: string;
        companyName: string;
    }): Promise<{ success: boolean; error?: string }> {
        return this.sendHREmail({
            emailType: 'login_attempt_failed',
            recipient: { email: data.email, name: data.employeeName },
            data: {
                employeeName: data.employeeName,
                attemptTime: data.attemptTime,
                ipAddress: data.ipAddress,
                companyName: data.companyName
            }
        });
    }

    async sendAccountSuspended(data: {
        employeeName: string;
        email: string;
        suspensionReason: string;
        suspensionDate: string;
        companyName: string;
    }): Promise<{ success: boolean; error?: string }> {
        return this.sendHREmail({
            emailType: 'account_suspended',
            recipient: { email: data.email, name: data.employeeName },
            data: {
                employeeName: data.employeeName,
                suspensionReason: data.suspensionReason,
                suspensionDate: data.suspensionDate,
                companyName: data.companyName
            }
        });
    }

    // Recruitment emails (connected to primary service)
    async sendInterviewReminder(data: {
        candidateName: string;
        email: string;
        jobTitle: string;
        interviewDate: string;
        interviewTime: string;
        interviewType: string;
        meetingLink?: string;
        companyName: string;
    }): Promise<{ success: boolean; error?: string }> {
        return this.sendHREmail({
            emailType: 'interview_reminder',
            recipient: { email: data.email, name: data.candidateName },
            data: {
                candidateName: data.candidateName,
                jobTitle: data.jobTitle,
                interviewDate: data.interviewDate,
                interviewTime: data.interviewTime,
                interviewType: data.interviewType,
                meetingLink: data.meetingLink,
                companyName: data.companyName
            }
        });
    }

    async sendInterviewFeedback(data: {
        candidateName: string;
        email: string;
        jobTitle: string;
        interviewDate: string;
        feedback: string;
        nextSteps: string;
        companyName: string;
    }): Promise<{ success: boolean; error?: string }> {
        return this.sendHREmail({
            emailType: 'interview_feedback',
            recipient: { email: data.email, name: data.candidateName },
            data: {
                candidateName: data.candidateName,
                jobTitle: data.jobTitle,
                interviewDate: data.interviewDate,
                feedback: data.feedback,
                nextSteps: data.nextSteps,
                companyName: data.companyName
            }
        });
    }

    async sendApplicationRejected(data: {
        candidateName: string;
        email: string;
        jobTitle: string;
        rejectionReason: string;
        companyName: string;
    }): Promise<{ success: boolean; error?: string }> {
        return this.sendHREmail({
            emailType: 'application_rejected',
            recipient: { email: data.email, name: data.candidateName },
            data: {
                candidateName: data.candidateName,
                jobTitle: data.jobTitle,
                rejectionReason: data.rejectionReason,
                companyName: data.companyName
            }
        });
    }

    async sendBackgroundCheckRequired(data: {
        candidateName: string;
        email: string;
        jobTitle: string;
        requiredDocuments: string[];
        submissionDeadline: string;
        companyName: string;
    }): Promise<{ success: boolean; error?: string }> {
        return this.sendHREmail({
            emailType: 'background_check_required',
            recipient: { email: data.email, name: data.candidateName },
            data: {
                candidateName: data.candidateName,
                jobTitle: data.jobTitle,
                requiredDocuments: data.requiredDocuments,
                submissionDeadline: data.submissionDeadline,
                companyName: data.companyName
            }
        });
    }

    // Compliance & training emails
    async sendTrainingRequired(data: {
        employeeName: string;
        email: string;
        trainingTitle: string;
        trainingDescription: string;
        dueDate: string;
        trainingLink: string;
        companyName: string;
    }): Promise<{ success: boolean; error?: string }> {
        return this.sendHREmail({
            emailType: 'training_required',
            recipient: { email: data.email, name: data.employeeName },
            data: {
                employeeName: data.employeeName,
                trainingTitle: data.trainingTitle,
                trainingDescription: data.trainingDescription,
                dueDate: data.dueDate,
                trainingLink: data.trainingLink,
                companyName: data.companyName
            }
        });
    }

    async sendTrainingReminder(data: {
        employeeName: string;
        email: string;
        trainingTitle: string;
        dueDate: string;
        daysUntilDue: number;
        companyName: string;
    }): Promise<{ success: boolean; error?: string }> {
        return this.sendHREmail({
            emailType: 'training_reminder',
            recipient: { email: data.email, name: data.employeeName },
            data: {
                employeeName: data.employeeName,
                trainingTitle: data.trainingTitle,
                dueDate: data.dueDate,
                daysUntilDue: data.daysUntilDue,
                companyName: data.companyName
            }
        });
    }

    async sendComplianceCertificateExpiry(data: {
        employeeName: string;
        email: string;
        certificateName: string;
        expiryDate: string;
        daysUntilExpiry: number;
        renewalLink: string;
        companyName: string;
    }): Promise<{ success: boolean; error?: string }> {
        return this.sendHREmail({
            emailType: 'compliance_certificate_expiry',
            recipient: { email: data.email, name: data.employeeName },
            data: {
                employeeName: data.employeeName,
                certificateName: data.certificateName,
                expiryDate: data.expiryDate,
                daysUntilExpiry: data.daysUntilExpiry,
                renewalLink: data.renewalLink,
                companyName: data.companyName
            }
        });
    }

    // System & maintenance emails
    async sendSystemMaintenanceNotice(data: {
        employeeName: string;
        email: string;
        maintenanceDate: string;
        maintenanceTime: string;
        expectedDowntime: string;
        affectedSystems: string[];
        companyName: string;
    }): Promise<{ success: boolean; error?: string }> {
        return this.sendHREmail({
            emailType: 'system_maintenance_notice',
            recipient: { email: data.email, name: data.employeeName },
            data: {
                employeeName: data.employeeName,
                maintenanceDate: data.maintenanceDate,
                maintenanceTime: data.maintenanceTime,
                expectedDowntime: data.expectedDowntime,
                affectedSystems: data.affectedSystems,
                companyName: data.companyName
            }
        });
    }

    async sendProfileUpdateReminder(data: {
        employeeName: string;
        email: string;
        lastUpdated: string;
        requiredUpdates: string[];
        companyName: string;
    }): Promise<{ success: boolean; error?: string }> {
        return this.sendHREmail({
            emailType: 'profile_update_reminder',
            recipient: { email: data.email, name: data.employeeName },
            data: {
                employeeName: data.employeeName,
                lastUpdated: data.lastUpdated,
                requiredUpdates: data.requiredUpdates,
                companyName: data.companyName
            }
        });
    }
}

// Create and export a singleton instance
export const vercelEmailService = new VercelEmailService();
export default vercelEmailService;
