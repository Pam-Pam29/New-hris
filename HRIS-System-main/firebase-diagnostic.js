// Firebase Diagnostic Script
// Run this in your browser console to diagnose Firebase issues

console.log('🔍 Starting Firebase Diagnostic...');

// Test 1: Check if Firebase is installed
async function testFirebaseInstallation() {
  console.log('\n📦 Test 1: Checking Firebase Installation...');
  
  try {
    const { initializeApp } = await import('firebase/app');
    console.log('✅ Firebase app module available');
    
    const { getFirestore } = await import('firebase/firestore');
    console.log('✅ Firebase Firestore module available');
    
    return true;
  } catch (error) {
    console.error('❌ Firebase modules not available:', error.message);
    console.log('💡 Solution: Run "npm install firebase" in your terminal');
    return false;
  }
}

// Test 2: Check Firebase Configuration
async function testFirebaseConfig() {
  console.log('\n⚙️ Test 2: Checking Firebase Configuration...');
  
  const firebaseConfig = {
    apiKey: "AIzaSyC6ovwlhX4Mr8WpHoS045wLxHA7t8fRXPI",
    authDomain: "hris-system-baa22.firebaseapp.com",
    projectId: "hris-system-baa22",
    storageBucket: "hris-system-baa22.firebasestorage.app",
    messagingSenderId: "563898942372",
    appId: "1:563898942372:web:8c5ebae1dfaf072858b731",
    measurementId: "G-1DJP5DJX92"
  };
  
  // Check if config is valid
  if (!firebaseConfig.apiKey || firebaseConfig.apiKey === "your-api-key") {
    console.error('❌ Invalid API key in configuration');
    return false;
  }
  
  if (!firebaseConfig.projectId || firebaseConfig.projectId === "your-project-id") {
    console.error('❌ Invalid project ID in configuration');
    return false;
  }
  
  console.log('✅ Firebase configuration looks valid');
  return true;
}

// Test 3: Test Firebase Connection
async function testFirebaseConnection() {
  console.log('\n🌐 Test 3: Testing Firebase Connection...');
  
  try {
    const { initializeApp } = await import('firebase/app');
    const { getFirestore, collection, addDoc, getDocs, deleteDoc, doc } = await import('firebase/firestore');
    
    const firebaseConfig = {
      apiKey: "AIzaSyC6ovwlhX4Mr8WpHoS045wLxHA7t8fRXPI",
      authDomain: "hris-system-baa22.firebaseapp.com",
      projectId: "hris-system-baa22",
      storageBucket: "hris-system-baa22.firebasestorage.app",
      messagingSenderId: "563898942372",
      appId: "1:563898942372:web:8c5ebae1dfaf072858b731",
      measurementId: "G-1DJP5DJX92"
    };
    
    // Initialize Firebase
    const app = initializeApp(firebaseConfig);
    console.log('✅ Firebase app initialized');
    
    const db = getFirestore(app);
    console.log('✅ Firestore database connected');
    
    // Test write operation
    const testDoc = await addDoc(collection(db, 'diagnostic-test'), {
      message: 'Firebase diagnostic test',
      timestamp: new Date(),
      testId: Date.now()
    });
    console.log('✅ Write test successful - Document ID:', testDoc.id);
    
    // Test read operation
    const querySnapshot = await getDocs(collection(db, 'diagnostic-test'));
    console.log('✅ Read test successful - Found', querySnapshot.size, 'documents');
    
    // Clean up test document
    await deleteDoc(doc(db, 'diagnostic-test', testDoc.id));
    console.log('✅ Cleanup test successful');
    
    return true;
  } catch (error) {
    console.error('❌ Firebase connection failed:', error.message);
    
    if (error.message.includes('permission-denied')) {
      console.log('💡 Solution: Update Firestore rules to allow read/write');
    } else if (error.message.includes('network')) {
      console.log('💡 Solution: Check your internet connection');
    } else if (error.message.includes('not-found')) {
      console.log('💡 Solution: Check if Firebase project exists and is active');
    }
    
    return false;
  }
}

// Test 4: Check Network Requests
function testNetworkRequests() {
  console.log('\n🌐 Test 4: Checking Network Requests...');
  
  // Check if we can see network requests
  if (typeof window !== 'undefined' && window.performance) {
    const entries = performance.getEntriesByType('resource');
    const firebaseRequests = entries.filter(entry => 
      entry.name.includes('firestore.googleapis.com') || 
      entry.name.includes('firebase')
    );
    
    if (firebaseRequests.length > 0) {
      console.log('✅ Found Firebase network requests:', firebaseRequests.length);
      firebaseRequests.forEach(req => {
        console.log('  -', req.name);
      });
    } else {
      console.log('⚠️ No Firebase network requests found');
      console.log('💡 This might indicate Firebase is not being used');
    }
  } else {
    console.log('⚠️ Cannot check network requests');
  }
}

// Test 5: Check Browser Console Messages
function checkConsoleMessages() {
  console.log('\n📝 Test 5: Checking Console Messages...');
  
  console.log('Look for these messages in your console:');
  console.log('✅ Good: "Firebase initialized successfully"');
  console.log('✅ Good: "Using Firebase Employee Service"');
  console.log('❌ Bad: "Firebase not available"');
  console.log('❌ Bad: "Falling back to Mock service"');
  console.log('❌ Bad: "Using Mock Employee Service"');
}

// Run all tests
async function runDiagnostic() {
  console.log('🚀 Running Firebase Diagnostic...\n');
  
  const results = {
    installation: await testFirebaseInstallation(),
    config: await testFirebaseConfig(),
    connection: await testFirebaseConnection(),
  };
  
  testNetworkRequests();
  checkConsoleMessages();
  
  // Summary
  console.log('\n📊 Diagnostic Summary:');
  console.log('Installation:', results.installation ? '✅ OK' : '❌ FAILED');
  console.log('Configuration:', results.config ? '✅ OK' : '❌ FAILED');
  console.log('Connection:', results.connection ? '✅ OK' : '❌ FAILED');
  
  if (results.installation && results.config && results.connection) {
    console.log('\n🎉 Firebase is working correctly!');
  } else {
    console.log('\n🔧 Firebase needs to be fixed. Follow the solutions above.');
  }
  
  return results;
}

// Auto-run the diagnostic
runDiagnostic().catch(error => {
  console.error('❌ Diagnostic failed:', error);
});

// Export for manual testing
window.firebaseDiagnostic = {
  runDiagnostic,
  testFirebaseInstallation,
  testFirebaseConfig,
  testFirebaseConnection,
  testNetworkRequests,
  checkConsoleMessages
};

console.log('\n💡 You can also run individual tests:');
console.log('window.firebaseDiagnostic.testFirebaseInstallation()');
console.log('window.firebaseDiagnostic.testFirebaseConnection()');

