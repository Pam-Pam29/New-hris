// Script to clear all leave types from Firebase
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, deleteDoc, doc } = require('firebase/firestore');

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

async function clearLeaveTypes() {
  try {
    console.log('🔄 Fetching all leave types...');
    const querySnapshot = await getDocs(collection(db, 'leaveTypes'));
    
    console.log(`📊 Found ${querySnapshot.size} leave types`);
    
    if (querySnapshot.size === 0) {
      console.log('✅ No leave types to delete');
      process.exit(0);
    }
    
    // List all leave types
    console.log('\n📋 Current leave types:');
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      console.log(`  - ${doc.id}: ${data.name} (${data.maxDays} days)`);
    });
    
    // Delete all leave types
    console.log('\n🗑️  Deleting all leave types...');
    const deletePromises = querySnapshot.docs.map(docSnapshot => 
      deleteDoc(doc(db, 'leaveTypes', docSnapshot.id))
    );
    
    await Promise.all(deletePromises);
    
    console.log('✅ All leave types deleted successfully!');
    console.log('💡 Now you can create new leave types from the HR dashboard');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error clearing leave types:', error);
    process.exit(1);
  }
}

clearLeaveTypes();


