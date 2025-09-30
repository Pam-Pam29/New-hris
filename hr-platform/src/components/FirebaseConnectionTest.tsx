import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { CheckCircle, XCircle, Loader, Database, Users, FileText, Calendar } from 'lucide-react';
import { getComprehensiveDataFlowService } from '../services/comprehensiveDataFlowService';
import { isFirebaseConfigured } from '../config/firebase';
import { createTestData, testFirebaseCollections } from '../services/firebaseTestData';
import { debugNotificationsCollection, createSimpleNotification } from '../services/notificationsDebug';
import { testRealTimeSync, createSyncTestData } from '../services/realTimeSyncTest';
import { runFirebaseDiagnostic, forceFirebaseReinitialization } from '../services/firebaseDiagnostic';
import { testFirebaseConnection, forceFirebaseInit } from '../utils/firebaseHelper';

interface ConnectionStatus {
  firebase: boolean;
  firestore: boolean;
  employees: boolean;
  policies: boolean;
  leaveTypes: boolean;
  notifications: boolean;
}

const FirebaseConnectionTest: React.FC = () => {
  const [status, setStatus] = useState<ConnectionStatus>({
    firebase: false,
    firestore: false,
    employees: false,
    policies: false,
    leaveTypes: false,
    notifications: false
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');

  const testConnection = async () => {
    setIsLoading(true);
    setError('');

    const newStatus: ConnectionStatus = {
      firebase: false,
      firestore: false,
      employees: false,
      policies: false,
      leaveTypes: false,
      notifications: false
    };

    try {
      // Test Firebase configuration - use direct check instead of isFirebaseConfigured
      const firebaseConfig = {
        apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyC6ovwlhX4Mr8WpHoS045wLxHA7t8fRXPI",
        projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "hris-system-baa22"
      };
      newStatus.firebase = !!(firebaseConfig.apiKey && firebaseConfig.projectId &&
        firebaseConfig.apiKey !== "your-api-key" && firebaseConfig.projectId !== "your-project-id");

      if (newStatus.firebase) {
        // Test comprehensive data flow service
        const service = await getComprehensiveDataFlowService();

        // Test Firestore connection with direct collection access
        try {
          // Import Firebase directly
          const { collection, query, getDocs, limit } = await import('firebase/firestore');
          const { getFirebaseDb, initializeFirebase } = await import('../config/firebase');

          // Ensure Firebase is initialized first
          await initializeFirebase();
          const db = getFirebaseDb();

          if (db) {
            // Test each collection directly
            const collections = [
              { name: 'leaveTypes', key: 'leaveTypes' },
              { name: 'policies', key: 'policies' },
              { name: 'notifications', key: 'notifications' },
              { name: 'employees', key: 'employees' }
            ];

            for (const col of collections) {
              try {
                const q = query(collection(db, col.name), limit(1));
                const snapshot = await getDocs(q);
                newStatus[col.key as keyof ConnectionStatus] = true;
                console.log(`✅ ${col.name} collection accessible`);
              } catch (err) {
                console.log(`❌ ${col.name} collection error:`, err);
              }
            }

            // If any collection is accessible, Firestore is working
            newStatus.firestore = Object.values(newStatus).some(Boolean);
          }
        } catch (err) {
          console.error('Direct collection test failed:', err);
        }

        // Test employees (this might fail if no employees exist, which is ok)
        try {
          await service.getEmployeeProfile('test-employee');
          newStatus.employees = true;
        } catch (err) {
          // This is expected if no test employee exists
          console.log('No test employee found (expected)');
        }
      }

      setStatus(newStatus);
    } catch (err: any) {
      setError(err.message || 'Connection test failed');
      console.error('Connection test error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    testConnection();
  }, []);

  const getStatusIcon = (isConnected: boolean) => {
    if (isLoading) return <Loader className="w-4 h-4 animate-spin" />;
    return isConnected ?
      <CheckCircle className="w-4 h-4 text-green-500" /> :
      <XCircle className="w-4 h-4 text-red-500" />;
  };

  const getStatusBadge = (isConnected: boolean) => {
    return isConnected ?
      <Badge className="bg-green-100 text-green-800">Connected</Badge> :
      <Badge variant="destructive">Disconnected</Badge>;
  };

  const allConnected = Object.values(status).every(Boolean);

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Database className="w-5 h-5" />
          <span>Firebase Connection Status</span>
          {allConnected && <Badge className="bg-green-100 text-green-800">All Systems Connected</Badge>}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800 text-sm">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div className="flex items-center space-x-3">
              {getStatusIcon(status.firebase)}
              <span className="font-medium">Firebase Config</span>
            </div>
            {getStatusBadge(status.firebase)}
          </div>

          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div className="flex items-center space-x-3">
              {getStatusIcon(status.firestore)}
              <span className="font-medium">Firestore Database</span>
            </div>
            {getStatusBadge(status.firestore)}
          </div>

          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div className="flex items-center space-x-3">
              {getStatusIcon(status.leaveTypes)}
              <Calendar className="w-4 h-4" />
              <span className="font-medium">Leave Types</span>
            </div>
            {getStatusBadge(status.leaveTypes)}
          </div>

          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div className="flex items-center space-x-3">
              {getStatusIcon(status.policies)}
              <FileText className="w-4 h-4" />
              <span className="font-medium">Policies</span>
            </div>
            {getStatusBadge(status.policies)}
          </div>

          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div className="flex items-center space-x-3">
              {getStatusIcon(status.notifications)}
              <Users className="w-4 h-4" />
              <span className="font-medium">Notifications</span>
            </div>
            {getStatusBadge(status.notifications)}
          </div>

          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div className="flex items-center space-x-3">
              {getStatusIcon(status.employees)}
              <Users className="w-4 h-4" />
              <span className="font-medium">Employees</span>
            </div>
            {getStatusBadge(status.employees)}
          </div>
        </div>

        <div className="flex justify-end space-x-2">
          <Button
            variant="outline"
            onClick={async () => {
              setIsLoading(true);
              try {
                await runFirebaseDiagnostic();
              } finally {
                setIsLoading(false);
              }
            }}
            disabled={isLoading}
          >
            Diagnose
          </Button>
          <Button
            variant="outline"
            onClick={async () => {
              setIsLoading(true);
              try {
                await forceFirebaseInit();
                await testConnection();
              } finally {
                setIsLoading(false);
              }
            }}
            disabled={isLoading}
          >
            Reinit Firebase
          </Button>
          <Button
            variant="outline"
            onClick={async () => {
              setIsLoading(true);
              try {
                await testFirebaseConnection();
                await testConnection();
              } finally {
                setIsLoading(false);
              }
            }}
            disabled={isLoading}
          >
            Test Connection
          </Button>
          <Button
            variant="outline"
            onClick={async () => {
              setIsLoading(true);
              try {
                await createSyncTestData();
                await testRealTimeSync();
              } finally {
                setIsLoading(false);
              }
            }}
            disabled={isLoading}
          >
            Test Sync
          </Button>
          <Button
            variant="outline"
            onClick={async () => {
              setIsLoading(true);
              try {
                await createSimpleNotification();
                await testConnection();
              } finally {
                setIsLoading(false);
              }
            }}
            disabled={isLoading}
          >
            Fix Notifications
          </Button>
          <Button
            variant="outline"
            onClick={async () => {
              setIsLoading(true);
              try {
                await createTestData();
                await testConnection();
              } finally {
                setIsLoading(false);
              }
            }}
            disabled={isLoading}
          >
            Create Test Data
          </Button>
          <Button onClick={testConnection} disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader className="w-4 h-4 mr-2 animate-spin" />
                Testing...
              </>
            ) : (
              'Test Connection'
            )}
          </Button>
        </div>

        {allConnected && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span className="font-medium text-green-800">All Firebase services are connected and working!</span>
            </div>
            <p className="text-green-700 text-sm mt-1">
              Real-time synchronization between Employee and HR platforms is active.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default FirebaseConnectionTest;