import React, { useState, useEffect } from 'react';

interface FirebaseTestProps {
  onStatusChange?: (isWorking: boolean) => void;
}

export default function FirebaseTest({ onStatusChange }: FirebaseTestProps) {
  const [firebaseStatus, setFirebaseStatus] = useState<'checking' | 'working' | 'not-working'>('checking');
  const [testMessage, setTestMessage] = useState('');
  const [testResults, setTestResults] = useState<string[]>([]);

  useEffect(() => {
    checkFirebaseStatus();
  }, []);

  const checkFirebaseStatus = async () => {
    try {
      // Check if Firebase is available
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
      const db = getFirestore(app);

      setTestResults(prev => [...prev, '✅ Firebase SDK loaded successfully']);

      // Test write operation
      const testDoc = await addDoc(collection(db, 'firebase-test'), {
        message: 'Firebase test',
        timestamp: new Date(),
        testId: Date.now()
      });

      setTestResults(prev => [...prev, `✅ Write test successful - Document ID: ${testDoc.id}`]);

      // Test read operation
      const querySnapshot = await getDocs(collection(db, 'firebase-test'));
      setTestResults(prev => [...prev, `✅ Read test successful - Found ${querySnapshot.size} documents`]);

      // Clean up test document
      await deleteDoc(doc(db, 'firebase-test', testDoc.id));
      setTestResults(prev => [...prev, '✅ Cleanup test successful']);

      setFirebaseStatus('working');
      setTestMessage('Firebase is working perfectly! 🎉');
      onStatusChange?.(true);

    } catch (error) {
      console.error('Firebase test failed:', error);
      setFirebaseStatus('not-working');
      setTestMessage(`Firebase test failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setTestResults(prev => [...prev, `❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`]);
      onStatusChange?.(false);
    }
  };

  const getStatusColor = () => {
    switch (firebaseStatus) {
      case 'working': return '#10b981'; // green
      case 'not-working': return '#ef4444'; // red
      default: return '#f59e0b'; // yellow
    }
  };

  const getStatusText = () => {
    switch (firebaseStatus) {
      case 'working': return '✅ Firebase Working';
      case 'not-working': return '❌ Firebase Not Working';
      default: return '⏳ Checking Firebase...';
    }
  };

  return (
    <div style={{
      padding: '1rem',
      border: '1px solid #e5e7eb',
      borderRadius: '0.5rem',
      backgroundColor: '#f9fafb',
      margin: '1rem 0'
    }}>
      <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.125rem', fontWeight: '600' }}>
        Firebase Status Test
      </h3>
      
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        marginBottom: '1rem'
      }}>
        <div style={{
          width: '12px',
          height: '12px',
          borderRadius: '50%',
          backgroundColor: getStatusColor(),
          animation: firebaseStatus === 'checking' ? 'pulse 2s infinite' : 'none'
        }} />
        <span style={{ fontWeight: '500' }}>{getStatusText()}</span>
      </div>

      {testMessage && (
        <div style={{
          padding: '0.75rem',
          backgroundColor: firebaseStatus === 'working' ? '#dcfce7' : '#fef2f2',
          border: `1px solid ${firebaseStatus === 'working' ? '#bbf7d0' : '#fecaca'}`,
          borderRadius: '0.375rem',
          marginBottom: '1rem',
          color: firebaseStatus === 'working' ? '#166534' : '#dc2626'
        }}>
          {testMessage}
        </div>
      )}

      {testResults.length > 0 && (
        <div style={{ marginBottom: '1rem' }}>
          <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.875rem', fontWeight: '500' }}>
            Test Results:
          </h4>
          <div style={{ fontSize: '0.75rem', fontFamily: 'monospace' }}>
            {testResults.map((result, index) => (
              <div key={index} style={{ marginBottom: '0.25rem' }}>
                {result}
              </div>
            ))}
          </div>
        </div>
      )}

      <button
        onClick={checkFirebaseStatus}
        disabled={firebaseStatus === 'checking'}
        style={{
          backgroundColor: '#3b82f6',
          color: 'white',
          border: 'none',
          padding: '0.5rem 1rem',
          borderRadius: '0.375rem',
          cursor: firebaseStatus === 'checking' ? 'not-allowed' : 'pointer',
          fontSize: '0.875rem',
          opacity: firebaseStatus === 'checking' ? 0.6 : 1
        }}
      >
        {firebaseStatus === 'checking' ? 'Testing...' : 'Test Firebase Again'}
      </button>

      <style jsx>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
}

