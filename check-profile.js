// Quick script to check if the profile was created in Firebase
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, doc, getDoc } = require('firebase/firestore');

const firebaseConfig = {
    apiKey: "AIzaSyC6ovwlhX4Mr8WpHoS045wLxHA7t8fRXPI",
    authDomain: "hris-system-baa22.firebaseapp.com",
    projectId: "hris-system-baa22",
    storageBucket: "hris-system-baa22.appspot.com",
    messagingSenderId: "123456789",
    appId: "1:123456789:web:abcdef123456"
};

async function checkProfile() {
    try {
        console.log('🔥 Initializing Firebase...');
        const app = initializeApp(firebaseConfig);
        const db = getFirestore(app);

        console.log('✅ Firebase initialized successfully');

        // Check employees collection
        console.log('\n📁 Checking employees collection...');
        const employeesRef = collection(db, 'employees');
        const employeesSnapshot = await getDocs(employeesRef);

        console.log(`Found ${employeesSnapshot.size} employees:`);
        employeesSnapshot.docs.forEach((doc, index) => {
            const data = doc.data();
            console.log(`${index + 1}. ID: ${doc.id}`);
            console.log(`   Name: ${data.personalInfo?.firstName || data.name || 'N/A'} ${data.personalInfo?.lastName || ''}`);
            console.log(`   Email: ${data.contactInfo?.personalEmail || data.email || 'N/A'}`);
            console.log(`   Position: ${data.workInfo?.position || data.role || 'N/A'}`);
            console.log(`   Department: ${data.workInfo?.department || data.department || 'N/A'}`);
            console.log('   ---');
        });

        // Check specific EMP001 profile
        console.log('\n🔍 Checking EMP001 profile specifically...');
        const emp001Ref = doc(db, 'employees', 'EMP001');
        const emp001Doc = await getDoc(emp001Ref);

        if (emp001Doc.exists()) {
            console.log('✅ EMP001 profile found!');
            const data = emp001Doc.data();
            console.log('Profile data:', JSON.stringify(data, null, 2));
        } else {
            console.log('❌ EMP001 profile not found');
        }

    } catch (error) {
        console.error('❌ Error checking profile:', error);
    }
}

checkProfile();


