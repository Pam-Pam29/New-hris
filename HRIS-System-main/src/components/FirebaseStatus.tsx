import React, { useState, useEffect } from 'react';

export default function FirebaseStatus() {
  const [status, setStatus] = useState<'checking' | 'working' | 'not-working'>('checking');
  const [message, setMessage] = useState('');

  useEffect(() => {
    checkFirebaseStatus();
  }, []);

  const checkFirebaseStatus = async () => {
    try {
      // Check if Firebase is available
      const { initializeApp } = await import('firebase/app');
      const { getFirestore, collection, addDoc, deleteDoc, doc } = await import('firebase/firestore');

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

      // Test write operation
      const testDoc = await addDoc(collection(db, 'status-test'), {
        message: 'Firebase status test',
        timestamp: new Date()
      });

      // Clean up test document
      await deleteDoc(doc(db, 'status-test', testDoc.id));

      setStatus('working');
      setMessage('Firebase is working! 🎉');
    } catch (error) {
      console.error('Firebase test failed:', error);
      setStatus('not-working');
      setMessage(`Firebase not working: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'working': return '#10b981';
      case 'not-working': return '#ef4444';
      default: return '#f59e0b';
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'working': return '✅ Firebase Working';
      case 'not-working': return '❌ Firebase Not Working';
      default: return '⏳ Checking Firebase...';
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: '1rem',
      right: '1rem',
      padding: '0.75rem',
      backgroundColor: 'white',
      border: '1px solid #e5e7eb',
      borderRadius: '0.5rem',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      zIndex: 1000,
      minWidth: '200px'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
        <div style={{
          width: '8px',
          height: '8px',
          borderRadius: '50%',
          backgroundColor: getStatusColor(),
          animation: status === 'checking' ? 'pulse 2s infinite' : 'none'
        }} />
        <span style={{ fontSize: '0.875rem', fontWeight: '500' }}>{getStatusText()}</span>
      </div>
      {message && (
        <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>
          {message}
        </div>
      )}
      <button
        onClick={checkFirebaseStatus}
        disabled={status === 'checking'}
        style={{
          marginTop: '0.5rem',
          padding: '0.25rem 0.5rem',
          fontSize: '0.75rem',
          backgroundColor: '#3b82f6',
          color: 'white',
          border: 'none',
          borderRadius: '0.25rem',
          cursor: status === 'checking' ? 'not-allowed' : 'pointer',
          opacity: status === 'checking' ? 0.6 : 1
        }}
      >
        {status === 'checking' ? 'Testing...' : 'Test Again'}
      </button>
    </div>
  );
}

