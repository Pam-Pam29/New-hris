import { doc, getDoc, setDoc, updateDoc, serverTimestamp, collection, query, where, getDocs, orderBy, deleteDoc } from 'firebase/firestore';
import { db } from '../../../config/firebase';

export interface Policy {
    id: string;
    title: string;
    content: string;
    category: string;
    version: string;
    effectiveDate: Date;
    requiresAcknowledgment: boolean;
    active: boolean;
    createdAt: Date;
    updatedAt: Date;
    createdBy: string;
}

export interface PolicyAcknowledgment {
    id: string;
    policyId: string;
    employeeId: string;
    employeeName: string;
    acknowledgedAt: Date;
    ipAddress?: string;
    userAgent?: string;
}

export interface PolicyWithAcknowledgment extends Policy {
    acknowledged: boolean;
    acknowledgedAt?: Date;
}

class PolicyService {
    // Get all active policies for employees
    async getActivePolicies(): Promise<Policy[]> {
        // Mock data for testing - replace with Firebase when ready
        return [
            {
                id: 'policy-001',
                title: 'Code of Conduct',
                content: `
                    <h3>Our Commitment to Excellence</h3>
                    <p>At our company, we are committed to maintaining the highest standards of professional conduct. This Code of Conduct outlines the principles and behaviors that guide our interactions with colleagues, clients, and stakeholders.</p>
                    
                    <h4>Core Values</h4>
                    <ul>
                        <li><strong>Integrity:</strong> We act with honesty and transparency in all our dealings.</li>
                        <li><strong>Respect:</strong> We treat everyone with dignity and respect, regardless of their background or position.</li>
                        <li><strong>Excellence:</strong> We strive for the highest quality in everything we do.</li>
                        <li><strong>Collaboration:</strong> We work together to achieve common goals.</li>
                        <li><strong>Innovation:</strong> We embrace new ideas and continuous improvement.</li>
                    </ul>
                    
                    <h4>Professional Standards</h4>
                    <p>All employees are expected to:</p>
                    <ul>
                        <li>Maintain confidentiality of sensitive information</li>
                        <li>Avoid conflicts of interest</li>
                        <li>Report any violations of this code</li>
                        <li>Treat company resources with care and responsibility</li>
                    </ul>
                    
                    <h4>Consequences of Violations</h4>
                    <p>Violations of this Code of Conduct may result in disciplinary action, up to and including termination of employment.</p>
                `,
                category: 'General',
                version: '2.1',
                effectiveDate: new Date('2024-01-01'),
                requiresAcknowledgment: true,
                active: true,
                createdAt: new Date('2024-01-01'),
                updatedAt: new Date('2024-01-01'),
                createdBy: 'HR Manager'
            },
            {
                id: 'policy-002',
                title: 'Data Privacy Policy',
                content: `
                    <h3>Data Protection and Privacy</h3>
                    <p>This policy outlines how we collect, use, store, and protect personal information in compliance with applicable data protection laws.</p>
                    
                    <h4>Information We Collect</h4>
                    <ul>
                        <li>Personal identification information (name, email, phone number)</li>
                        <li>Employment information (position, department, salary)</li>
                        <li>Performance and evaluation data</li>
                        <li>System usage and access logs</li>
                    </ul>
                    
                    <h4>How We Use Information</h4>
                    <p>We use personal information to:</p>
                    <ul>
                        <li>Manage employment relationships</li>
                        <li>Process payroll and benefits</li>
                        <li>Conduct performance evaluations</li>
                        <li>Ensure system security and compliance</li>
                    </ul>
                    
                    <h4>Data Security</h4>
                    <p>We implement appropriate technical and organizational measures to protect personal information against unauthorized access, alteration, disclosure, or destruction.</p>
                    
                    <h4>Your Rights</h4>
                    <p>You have the right to:</p>
                    <ul>
                        <li>Access your personal information</li>
                        <li>Request corrections to inaccurate data</li>
                        <li>Request deletion of personal information (where legally permissible)</li>
                        <li>Object to certain processing activities</li>
                    </ul>
                `,
                category: 'Privacy',
                version: '1.3',
                effectiveDate: new Date('2024-01-15'),
                requiresAcknowledgment: true,
                active: true,
                createdAt: new Date('2024-01-15'),
                updatedAt: new Date('2024-01-15'),
                createdBy: 'Legal Team'
            },
            {
                id: 'policy-003',
                title: 'Remote Work Policy',
                content: `
                    <h3>Remote Work Guidelines</h3>
                    <p>This policy establishes guidelines for employees who work remotely, whether on a full-time or part-time basis.</p>
                    
                    <h4>Eligibility</h4>
                    <p>Remote work arrangements are available to employees whose job functions can be performed effectively outside the office.</p>
                    
                    <h4>Work Environment Requirements</h4>
                    <ul>
                        <li>Dedicated workspace free from distractions</li>
                        <li>Reliable internet connection</li>
                        <li>Appropriate security measures for company data</li>
                        <li>Compliance with health and safety standards</li>
                    </ul>
                    
                    <h4>Communication Expectations</h4>
                    <ul>
                        <li>Regular check-ins with supervisors</li>
                        <li>Participation in virtual meetings</li>
                        <li>Timely response to emails and messages</li>
                        <li>Availability during core business hours</li>
                    </ul>
                    
                    <h4>Performance Standards</h4>
                    <p>Remote employees are held to the same performance standards as office-based employees. Regular performance reviews will be conducted to ensure productivity and engagement.</p>
                `,
                category: 'Workplace',
                version: '1.0',
                effectiveDate: new Date('2024-02-01'),
                requiresAcknowledgment: true,
                active: true,
                createdAt: new Date('2024-02-01'),
                updatedAt: new Date('2024-02-01'),
                createdBy: 'HR Manager'
            }
        ];
    }

    // Get policies with acknowledgment status for employee
    async getPoliciesWithAcknowledgmentStatus(employeeId: string): Promise<PolicyWithAcknowledgment[]> {
        const policies = await this.getActivePolicies();
        const acknowledgments = await this.getEmployeeAcknowledgment(employeeId);

        return policies.map(policy => ({
            ...policy,
            acknowledged: acknowledgments.some(ack => ack.policyId === policy.id),
            acknowledgedAt: acknowledgments.find(ack => ack.policyId === policy.id)?.acknowledgedAt
        }));
    }

    // Acknowledge a policy
    async acknowledgePolicy(policyId: string, employeeId: string, employeeName: string): Promise<boolean> {
        // Mock implementation for testing - replace with Firebase when ready
        console.log('Acknowledging policy:', { policyId, employeeId, employeeName });
        return true;
    }

    // Get employee's policy acknowledgments
    async getEmployeeAcknowledgment(employeeId: string): Promise<PolicyAcknowledgment[]> {
        // Mock data for testing - replace with Firebase when ready
        return [
            {
                id: 'ack-001',
                policyId: 'policy-001',
                employeeId,
                employeeName: 'John Doe',
                acknowledgedAt: new Date('2024-11-01'),
                ipAddress: '192.168.1.100',
                userAgent: 'Mozilla/5.0...'
            },
            {
                id: 'ack-002',
                policyId: 'policy-002',
                employeeId,
                employeeName: 'John Doe',
                acknowledgedAt: new Date('2024-11-05'),
                ipAddress: '192.168.1.100',
                userAgent: 'Mozilla/5.0...'
            }
        ];
    }

    // HR: Get all policies
    async getAllPolicies(): Promise<Policy[]> {
        // Mock data for testing - replace with Firebase when ready
        return [
            {
                id: 'policy-001',
                title: 'Code of Conduct',
                content: 'Code of Conduct content...',
                category: 'General',
                version: '2.1',
                effectiveDate: new Date('2024-01-01'),
                requiresAcknowledgment: true,
                active: true,
                createdAt: new Date('2024-01-01'),
                updatedAt: new Date('2024-01-01'),
                createdBy: 'HR Manager'
            },
            {
                id: 'policy-002',
                title: 'Data Privacy Policy',
                content: 'Data Privacy Policy content...',
                category: 'Privacy',
                version: '1.3',
                effectiveDate: new Date('2024-01-15'),
                requiresAcknowledgment: true,
                active: true,
                createdAt: new Date('2024-01-15'),
                updatedAt: new Date('2024-01-15'),
                createdBy: 'Legal Team'
            },
            {
                id: 'policy-003',
                title: 'Remote Work Policy',
                content: 'Remote Work Policy content...',
                category: 'Workplace',
                version: '1.0',
                effectiveDate: new Date('2024-02-01'),
                requiresAcknowledgment: true,
                active: true,
                createdAt: new Date('2024-02-01'),
                updatedAt: new Date('2024-02-01'),
                createdBy: 'HR Manager'
            },
            {
                id: 'policy-004',
                title: 'Social Media Policy',
                content: 'Social Media Policy content...',
                category: 'Communication',
                version: '1.0',
                effectiveDate: new Date('2024-03-01'),
                requiresAcknowledgment: true,
                active: false,
                createdAt: new Date('2024-03-01'),
                updatedAt: new Date('2024-03-01'),
                createdBy: 'HR Manager'
            }
        ];
    }

    // HR: Create new policy
    async createPolicy(policy: Omit<Policy, 'id' | 'createdAt' | 'updatedAt'>): Promise<boolean> {
        // Mock implementation for testing - replace with Firebase when ready
        console.log('Creating policy:', policy);
        return true;
    }

    // HR: Update policy
    async updatePolicy(policyId: string, updates: Partial<Policy>): Promise<boolean> {
        // Mock implementation for testing - replace with Firebase when ready
        console.log('Updating policy:', { policyId, updates });
        return true;
    }

    // HR: Delete policy
    async deletePolicy(policyId: string): Promise<boolean> {
        // Mock implementation for testing - replace with Firebase when ready
        console.log('Deleting policy:', policyId);
        return true;
    }

    // HR: Get all policy acknowledgments
    async getAllPolicyAcknowledgment(): Promise<PolicyAcknowledgment[]> {
        // Mock data for testing - replace with Firebase when ready
        return [
            {
                id: 'ack-001',
                policyId: 'policy-001',
                employeeId: 'EMP123456ABC',
                employeeName: 'John Doe',
                acknowledgedAt: new Date('2024-11-01'),
                ipAddress: '192.168.1.100',
                userAgent: 'Mozilla/5.0...'
            },
            {
                id: 'ack-002',
                policyId: 'policy-002',
                employeeId: 'EMP123456ABC',
                employeeName: 'John Doe',
                acknowledgedAt: new Date('2024-11-05'),
                ipAddress: '192.168.1.100',
                userAgent: 'Mozilla/5.0...'
            },
            {
                id: 'ack-003',
                policyId: 'policy-001',
                employeeId: 'EMP789012DEF',
                employeeName: 'Jane Smith',
                acknowledgedAt: new Date('2024-11-02'),
                ipAddress: '192.168.1.101',
                userAgent: 'Mozilla/5.0...'
            },
            {
                id: 'ack-004',
                policyId: 'policy-003',
                employeeId: 'EMP123456ABC',
                employeeName: 'John Doe',
                acknowledgedAt: new Date('2024-11-10'),
                ipAddress: '192.168.1.100',
                userAgent: 'Mozilla/5.0...'
            }
        ];
    }

    // HR: Get acknowledgment statistics
    async getAcknowledgmentStatistics(): Promise<{
        totalPolicies: number;
        totalEmployees: number;
        totalAcknowledgment: number;
        acknowledgmentRate: number;
        policyStats: Array<{
            policyId: string;
            policyTitle: string;
            totalAcknowledgment: number;
            acknowledgmentRate: number;
        }>;
    }> {
        const policies = await this.getAllPolicies();
        const acknowledgments = await this.getAllPolicyAcknowledgment();

        const totalPolicies = policies.filter(p => p.active).length;
        const totalEmployees = 2; // Mock data
        const totalAcknowledgment = acknowledgments.length;
        const acknowledgmentRate = totalEmployees > 0 ? (totalAcknowledgment / (totalPolicies * totalEmployees)) * 100 : 0;

        const policyStats = policies.filter(p => p.active).map(policy => {
            const policyAcknowledgment = acknowledgments.filter(ack => ack.policyId === policy.id);
            const policyAcknowledgmentRate = totalEmployees > 0 ? (policyAcknowledgment.length / totalEmployees) * 100 : 0;

            return {
                policyId: policy.id,
                policyTitle: policy.title,
                totalAcknowledgment: policyAcknowledgment.length,
                acknowledgmentRate: policyAcknowledgmentRate
            };
        });

        return {
            totalPolicies,
            totalEmployees,
            totalAcknowledgment,
            acknowledgmentRate,
            policyStats
        };
    }

    // HR: Get employees who haven't acknowledged a specific policy
    async getEmployeesWithoutAcknowledgment(policyId: string): Promise<Array<{
        employeeId: string;
        employeeName: string;
        department: string;
        position: string;
    }>> {
        // Mock data for testing - replace with Firebase when ready
        return [
            {
                employeeId: 'EMP789012DEF',
                employeeName: 'Jane Smith',
                department: 'Engineering',
                position: 'Software Developer'
            },
            {
                employeeId: 'EMP345678GHI',
                employeeName: 'Mike Johnson',
                department: 'Marketing',
                position: 'Marketing Manager'
            }
        ];
    }
}

export const policyService = new PolicyService();





