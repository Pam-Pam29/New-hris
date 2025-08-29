import React, { useState, useEffect } from 'react';
import { initializeFirebase, isFirebaseConfigured } from '../config/firebase';
import { LoadingState } from './ui/loading-state';

const FirebaseConnectionTest = () => {
  const [status, setStatus] = useState<'checking' | 'connected' | 'error'>('checking');
  const [message, setMessage] = useState('Checking Firebase connection...');
  const [details, setDetails] = useState<string[]>([]);

  useEffect(() => {
    testFirebaseConnection();
  }, []);

  const testFirebaseConnection = async () => {
    try {
      setStatus('checking');
      setMessage('Testing Firebase connection...');
      setDetails(['Initializing Firebase...']);

      // Initialize Firebase
      const initialized = await initializeFirebase();
      setDetails(prev => [...prev, initialized ? '✅ Firebase initialized' : '❌ Firebase initialization failed']);

      if (!initialized) {
        setStatus('error');
        setMessage('Firebase initialization failed. Check console for details.');
        return;
      }

      // Check if Firebase is configured properly
      const configured = isFirebaseConfigured();
      setDetails(prev => [...prev, configured ? '✅ Firebase properly configured' : '❌ Firebase configuration invalid']);

      if (!configured) {
        setStatus('error');
        setMessage('Firebase configuration is invalid. Check your .env file.');
        return;
      }

      // Test Firestore connection
      try {
        const { getFirestore, collection, addDoc, getDocs, deleteDoc, doc } = await import('firebase/firestore');
        const { db } = await import('../config/firebase');
        
        setDetails(prev => [...prev, '✅ Firestore modules loaded']);

        // Test write operation
        const testCollection = collection(db, 'connection-test');
        const testDoc = await addDoc(testCollection, {
          message: 'Connection test',
          timestamp: new Date().toISOString()
        });
        
        setDetails(prev => [...prev, `✅ Write test successful - Document ID: ${testDoc.id}`]);

        // Test read operation
        const querySnapshot = await getDocs(testCollection);
        setDetails(prev => [...prev, `✅ Read test successful - Found ${querySnapshot.size} documents`]);

        // Clean up test document
        await deleteDoc(doc(db, 'connection-test', testDoc.id));
        setDetails(prev => [...prev, '✅ Cleanup test successful']);

        setStatus('connected');
        setMessage('Firebase connection successful! 🎉');
      } catch (error) {
        console.error('Firestore test failed:', error);
        setStatus('error');
        setMessage(`Firestore test failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        setDetails(prev => [...prev, `❌ Firestore error: ${error instanceof Error ? error.message : 'Unknown error'}`]);
      }
    } catch (error) {
      console.error('Firebase test failed:', error);
      setStatus('error');
      setMessage(`Firebase test failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setDetails(prev => [...prev, `❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`]);
    }
  };

  return (
    <div className="p-3 md:p-4 border rounded-lg shadow-md bg-card dark:bg-card/95 max-w-full md:max-w-md mx-auto my-2 md:my-4">
      <h2 className="text-lg md:text-xl font-semibold mb-2 md:mb-4 text-foreground dark:text-foreground/90">
        Firebase Connection Status
      </h2>
      
      <LoadingState 
        isLoading={status === 'checking'}
        loadingText="Testing Firebase connection..."
        error={status === 'error' ? message : null}
        className="py-2"
      >
        <div className="mb-3 md:mb-4">
          <div className="flex items-center gap-2">
            <div className="w-2.5 md:w-3 h-2.5 md:h-3 rounded-full bg-green-500" />
            <span className="font-medium text-sm md:text-base text-foreground dark:text-foreground/90">Connected</span>
          </div>
          <p className="mt-1 md:mt-2 text-xs md:text-sm text-muted-foreground dark:text-muted-foreground/90">{message}</p>
        </div>
      </LoadingState>

      <div className="mt-3 md:mt-4 border-t pt-3 md:pt-4 dark:border-accent/20">
        <h3 className="text-xs md:text-sm font-medium mb-1 md:mb-2 text-foreground dark:text-foreground/90">Connection Details:</h3>
        <ul className="text-xs space-y-1 text-muted-foreground dark:text-muted-foreground/80 max-h-24 md:max-h-32 overflow-y-auto">
          {details.map((detail, index) => (
            <li key={index} className="font-mono">{detail}</li>
          ))}
        </ul>
      </div>

      <button
        onClick={testFirebaseConnection}
        disabled={status === 'checking'}
        className={`mt-3 md:mt-4 px-3 md:px-4 py-1.5 md:py-2 text-xs md:text-sm rounded-md font-medium transition-colors
          ${status === 'checking' ? 
            'bg-muted text-muted-foreground cursor-not-allowed' : 
            'bg-primary hover:bg-primary/90 dark:bg-primary/90 dark:hover:bg-primary/80 text-primary-foreground'}`}
      >
        {status === 'checking' ? 'Testing...' : 'Test Connection Again'}
      </button>
    </div>
  );
};

export default FirebaseConnectionTest;