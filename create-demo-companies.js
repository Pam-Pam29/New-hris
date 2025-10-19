/**
 * Script to create demo companies for multi-tenancy testing
 * Run this ONCE to set up demo companies in Firebase
 */

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, Timestamp } from 'firebase/firestore';

// Firebase configuration (from hr-platform/src/config/firebase.ts)
const firebaseConfig = {
    apiKey: "AIzaSyCHvcIcFr5IbYtx52hB0Yy_GzfiWWz8wTY",
    authDomain: "hris-1c75d.firebaseapp.com",
    projectId: "hris-1c75d",
    storageBucket: "hris-1c75d.firebasestorage.app",
    messagingSenderId: "422308244798",
    appId: "1:422308244798:web:e08f2c60de10e8dda79d66"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Demo companies data
const demoCompanies = [
    {
        name: 'acme-corp',
        domain: 'acme',
        displayName: 'Acme Corporation',
        email: 'hr@acmecorp.com',
        phone: '+1-555-0100',
        website: 'https://acmecorp.com',
        address: '123 Tech Street, San Francisco, CA 94105',
        logo: null,
        primaryColor: '#DC2626', // Red
        secondaryColor: '#991B1B',
        settings: {
            careersSlug: 'acme',
            allowPublicApplications: true,
            timezone: 'America/Los_Angeles',
            industry: 'Technology'
        },
        plan: 'premium',
        status: 'active',
        createdAt: Timestamp.now()
    },
    {
        name: 'techcorp-inc',
        domain: 'techcorp',
        displayName: 'TechCorp Inc.',
        email: 'careers@techcorp.com',
        phone: '+1-555-0200',
        website: 'https://techcorp.com',
        address: '456 Innovation Blvd, Austin, TX 78701',
        logo: null,
        primaryColor: '#2563EB', // Blue
        secondaryColor: '#1E40AF',
        settings: {
            careersSlug: 'techcorp',
            allowPublicApplications: true,
            timezone: 'America/Chicago',
            industry: 'Software'
        },
        plan: 'enterprise',
        status: 'active',
        createdAt: Timestamp.now()
    },
    {
        name: 'globex-industries',
        domain: 'globex',
        displayName: 'Globex Industries',
        email: 'jobs@globex.com',
        phone: '+1-555-0300',
        website: 'https://globex.com',
        address: '789 Corporate Ave, New York, NY 10001',
        logo: null,
        primaryColor: '#059669', // Green
        secondaryColor: '#047857',
        settings: {
            careersSlug: 'globex',
            allowPublicApplications: true,
            timezone: 'America/New_York',
            industry: 'Manufacturing'
        },
        plan: 'basic',
        status: 'active',
        createdAt: Timestamp.now()
    }
];

async function createDemoCompanies() {
    console.log('🚀 Creating demo companies...\n');

    try {
        const companiesRef = collection(db, 'companies');

        for (const company of demoCompanies) {
            const docRef = await addDoc(companiesRef, company);
            console.log(`✅ Created: ${company.displayName}`);
            console.log(`   ID: ${docRef.id}`);
            console.log(`   Domain: ${company.domain}`);
            console.log(`   URL: http://localhost:3004/careers/${company.domain}`);
            console.log(`   Color: ${company.primaryColor}\n`);
        }

        console.log('🎉 SUCCESS! Demo companies created!\n');
        console.log('📝 Next steps:');
        console.log('1. Note the company IDs above');
        console.log('2. When posting jobs in HR platform, use one of these company IDs');
        console.log('3. Visit careers platform with company domain:');
        console.log('   - http://localhost:3004/careers/acme');
        console.log('   - http://localhost:3004/careers/techcorp');
        console.log('   - http://localhost:3004/careers/globex\n');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error creating companies:', error);
        process.exit(1);
    }
}

createDemoCompanies();








