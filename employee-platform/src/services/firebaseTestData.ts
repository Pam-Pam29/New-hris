import {
    collection,
    doc,
    setDoc,
    getDocs,
    query,
    orderBy,
    limit
} from 'firebase/firestore';
import { db } from '../config/firebase';

// Test data for Firebase collections
export const testLeaveTypes = [
    {
        id: 'annual-leave',
        name: 'Annual Leave',
        description: 'Regular vacation days',
        maxDaysPerYear: 25,
        isActive: true,
        color: '#3B82F6',
        requiresApproval: true,
        createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        id: 'sick-leave',
        name: 'Sick Leave',
        description: 'Medical and health-related leave',
        maxDaysPerYear: 10,
        isActive: true,
        color: '#EF4444',
        requiresApproval: false,
        createdAt: new Date(),
        updatedAt: new Date()
    }
];

export const testPolicies = [
    {
        id: 'code-of-conduct',
        title: 'Code of Conduct',
        description: 'Employee behavior and ethics guidelines',
        content: 'This policy outlines the expected standards of behavior for all employees...',
        category: 'HR',
        effectiveDate: new Date(),
        isActive: true,
        requiresAcknowledgment: true,
        version: '1.0',
        createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        id: 'remote-work-policy',
        title: 'Remote Work Policy',
        description: 'Guidelines for remote work arrangements',
        content: 'This policy establishes guidelines for remote work arrangements...',
        category: 'Workplace',
        effectiveDate: new Date(),
        isActive: true,
        requiresAcknowledgment: true,
        version: '1.0',
        createdAt: new Date(),
        updatedAt: new Date()
    }
];

export const testNotifications = [
    {
        id: 'welcome-notification',
        employeeId: 'test-employee',
        title: 'Welcome to HRIS System',
        message: 'Welcome to the new HRIS platform! Please complete your profile.',
        type: 'info',
        category: 'system',
        isRead: false,
        actionUrl: '/profile',
        actionText: 'Complete Profile',
        createdAt: new Date()
    }
];

export const testEmployees = [
    {
        id: 'test-employee',
        employeeId: 'EMP001',
        personalInfo: {
            firstName: 'John',
            lastName: 'Doe',
            dateOfBirth: new Date('1990-01-01'),
            gender: 'Male'
        },
        contactInfo: {
            personalEmail: 'john.doe@example.com',
            workEmail: 'john.doe@company.com',
            personalPhone: '+1234567890'
        },
        workInfo: {
            position: 'Software Developer',
            department: 'IT',
            hireDate: new Date('2023-01-01'),
            employmentType: 'Full-time'
        },
        createdAt: new Date(),
        updatedAt: new Date()
    }
];

// Function to create test data
export async function createTestData() {
    try {
        console.log('🧪 Creating test data for Firebase collections...');

        // Create test leave types
        for (const leaveType of testLeaveTypes) {
            const docRef = doc(collection(db, 'leaveTypes'), leaveType.id);
            await setDoc(docRef, leaveType);
            console.log(`✅ Created leave type: ${leaveType.name}`);
        }

        // Create test policies
        for (const policy of testPolicies) {
            const docRef = doc(collection(db, 'policies'), policy.id);
            await setDoc(docRef, policy);
            console.log(`✅ Created policy: ${policy.title}`);
        }

        // Create test notifications
        for (const notification of testNotifications) {
            const docRef = doc(collection(db, 'notifications'));
            await setDoc(docRef, { ...notification, id: docRef.id });
            console.log(`✅ Created notification: ${notification.title}`);
        }

        // Create test employees
        for (const employee of testEmployees) {
            const docRef = doc(collection(db, 'employees'), employee.id);
            await setDoc(docRef, employee);
            console.log(`✅ Created employee: ${employee.personalInfo.firstName} ${employee.personalInfo.lastName}`);
        }

        console.log('🎉 Test data created successfully!');
        return true;
    } catch (error) {
        console.error('❌ Error creating test data:', error);
        return false;
    }
}

// Function to test reading data
export async function testFirebaseCollections() {
    try {
        console.log('🧪 Testing Firebase collections...');

        // Test leave types (without orderBy to avoid index issues)
        const leaveTypesQuery = query(collection(db, 'leaveTypes'), limit(5));
        const leaveTypesSnapshot = await getDocs(leaveTypesQuery);
        console.log(`✅ Leave Types: ${leaveTypesSnapshot.docs.length} documents found`);

        // Test policies (without orderBy to avoid index issues)
        const policiesQuery = query(collection(db, 'policies'), limit(5));
        const policiesSnapshot = await getDocs(policiesQuery);
        console.log(`✅ Policies: ${policiesSnapshot.docs.length} documents found`);

        // Test notifications (without orderBy to avoid index issues)
        const notificationsQuery = query(collection(db, 'notifications'), limit(5));
        const notificationsSnapshot = await getDocs(notificationsQuery);
        console.log(`✅ Notifications: ${notificationsSnapshot.docs.length} documents found`);

        // Test employees
        const employeesQuery = query(collection(db, 'employees'), limit(5));
        const employeesSnapshot = await getDocs(employeesQuery);
        console.log(`✅ Employees: ${employeesSnapshot.docs.length} documents found`);

        console.log('🎉 All Firebase collections are accessible!');
        return {
            leaveTypes: leaveTypesSnapshot.docs.length,
            policies: policiesSnapshot.docs.length,
            notifications: notificationsSnapshot.docs.length,
            employees: employeesSnapshot.docs.length
        };
    } catch (error) {
        console.error('❌ Error testing Firebase collections:', error);
        return null;
    }
}
