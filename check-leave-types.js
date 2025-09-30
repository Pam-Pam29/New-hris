// Script to check leave types in Firebase
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs } = require('firebase/firestore');

const firebaseConfig = {
  apiKey: "AIzaSyC6ovwlhX4Mr8WpHoS045wLxHA7t8fRXPI",
  authDomain: "hris-system-baa22.firebaseapp.com",
  projectId: "hris-system-baa22",
  storageBucket: "hris-system-baa22.firebasestorage.app",
  messagingSenderId: "563898942372",
  appId: "1:563898942372:web:8c5ebae1dfaf072858b731"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function checkLeaveTypes() {
  try {
    console.log('🔄 Fetching leave types from Firebase...\n');
    const querySnapshot = await getDocs(collection(db, 'leaveTypes'));
    
    console.log(`📊 Total Leave Types: ${querySnapshot.size}\n`);
    
    if (querySnapshot.size === 0) {
      console.log('⚠️  No leave types found in Firebase');
      console.log('💡 Create leave types from the HR dashboard');
    } else {
      console.log('📋 Current Leave Types:\n');
      querySnapshot.forEach((doc, index) => {
        const data = doc.data();
        console.log(`${index + 1}. ${data.name || 'Unnamed'}`);
        console.log(`   ID: ${doc.id}`);
        console.log(`   Description: ${data.description || 'N/A'}`);
        console.log(`   Max Days: ${data.maxDays || data.daysAllowed || 'N/A'}`);
        console.log(`   Accrual Rate: ${data.accrualRate || 'N/A'}`);
        console.log(`   Color: ${data.color || 'N/A'}`);
        console.log(`   Active: ${data.active !== false ? 'Yes' : 'No'}`);
        console.log(`   Requires Approval: ${data.requiresApproval ? 'Yes' : 'No'}`);
        console.log('');
      });
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error fetching leave types:', error);
    process.exit(1);
  }
}

checkLeaveTypes();


