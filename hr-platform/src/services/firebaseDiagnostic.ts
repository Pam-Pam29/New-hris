import {
    collection,
    doc,
    getDocs,
    query,
    limit,
    connectFirestoreEmulator,
    getFirestore,
    initializeApp
} from 'firebase/firestore';
import { getFirebaseDb } from '../config/firebase';

// Comprehensive Firebase diagnostic function
export async function runFirebaseDiagnostic() {
    console.log('🔍 Running comprehensive Firebase diagnostic...');

    const results = {
        firebaseConfig: false,
        firestoreInstance: false,
        firestoreConnection: false,
        collectionsAccess: false,
        errors: [] as string[]
    };

    try {
        // Test 1: Check Firebase configuration
        console.log('Test 1: Firebase Configuration');
        const firebaseConfig = {
            apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyC6ovwlhX4Mr8WpHoS045wLxHA7t8fRXPI",
            authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "hris-system-baa22.firebaseapp.com",
            projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "hris-system-baa22",
            storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "hris-system-baa22.firebasestorage.app",
            messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "563898942372",
            appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:563898942372:web:8c5ebae1dfaf072858b731",
            measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-1DJP5DJX92"
        };

        console.log('Firebase Config:', {
            apiKey: firebaseConfig.apiKey ? 'Present' : 'Missing',
            projectId: firebaseConfig.projectId,
            authDomain: firebaseConfig.authDomain
        });

        if (firebaseConfig.apiKey && firebaseConfig.projectId) {
            results.firebaseConfig = true;
            console.log('✅ Firebase configuration is valid');
        } else {
            results.errors.push('Invalid Firebase configuration');
            console.log('❌ Firebase configuration is invalid');
        }

        // Test 2: Check Firestore instance
        console.log('Test 2: Firestore Instance');
        if (getFirebaseDb()) {
            results.firestoreInstance = true;
            console.log('✅ Firestore instance exists');
            console.log('Firestore instance:', {
                type: typeof getFirebaseDb(),
                app: getFirebaseDb().app?.name || 'unknown'
            });
        } else {
            results.errors.push('Firestore instance is null or undefined');
            console.log('❌ Firestore instance is null or undefined');
        }

        // Test 3: Test Firestore connection
        console.log('Test 3: Firestore Connection');
        if (getFirebaseDb()) {
            try {
                // Try to access a simple collection
                const testQuery = query(collection(getFirebaseDb(), 'test'), limit(1));
                await getDocs(testQuery);
                results.firestoreConnection = true;
                console.log('✅ Firestore connection successful');
            } catch (error: any) {
                results.errors.push(`Firestore connection failed: ${error.message}`);
                console.log('❌ Firestore connection failed:', error.message);

                // If it's a permissions error, that's actually expected for the test collection
                if (error.message.includes('permissions') || error.message.includes('Missing or insufficient')) {
                    console.log('⚠️ Permissions error is expected for test collection, trying known collections...');

                    // Try known collections
                    const knownCollections = ['employees', 'leaveTypes', 'policies'];
                    let collectionSuccess = false;

                    for (const collectionName of knownCollections) {
                        try {
                            const knownQuery = query(collection(getFirebaseDb(), collectionName), limit(1));
                            await getDocs(knownQuery);
                            collectionSuccess = true;
                            console.log(`✅ Successfully accessed ${collectionName} collection`);
                            break;
                        } catch (collectionError: any) {
                            console.log(`❌ Failed to access ${collectionName}:`, collectionError.message);
                        }
                    }

                    if (collectionSuccess) {
                        results.firestoreConnection = true;
                        results.collectionsAccess = true;
                    }
                }
            }
        }

        // Test 4: Test specific collections
        console.log('Test 4: Collection Access');
        const collections = ['employees', 'leaveTypes', 'policies', 'notifications', 'leaveRequests'];
        let accessibleCollections = 0;

        for (const collectionName of collections) {
            try {
                const queryRef = query(collection(getFirebaseDb(), collectionName), limit(1));
                await getDocs(queryRef);
                accessibleCollections++;
                console.log(`✅ ${collectionName} collection accessible`);
            } catch (error: any) {
                console.log(`❌ ${collectionName} collection error:`, error.message);
                results.errors.push(`${collectionName}: ${error.message}`);
            }
        }

        if (accessibleCollections > 0) {
            results.collectionsAccess = true;
            console.log(`✅ ${accessibleCollections}/${collections.length} collections accessible`);
        } else {
            console.log('❌ No collections accessible');
        }

        // Summary
        console.log('🎯 Diagnostic Summary:');
        console.log('Results:', results);

        const successCount = Object.values(results).filter(v => v === true).length;
        const totalTests = 4;

        console.log(`Success Rate: ${successCount}/${totalTests} tests passed`);

        return {
            success: successCount >= 3, // At least 3 out of 4 tests should pass
            results,
            summary: `${successCount}/${totalTests} tests passed`
        };

    } catch (error: any) {
        console.error('❌ Diagnostic failed:', error);
        results.errors.push(`Diagnostic error: ${error.message}`);

        return {
            success: false,
            results,
            error: error.message,
            summary: 'Diagnostic failed'
        };
    }
}

// Function to force Firebase re-initialization
export async function forceFirebaseReinitialization() {
    console.log('🔄 Forcing Firebase re-initialization...');

    try {
        // Clear any existing Firebase instances
        if (typeof window !== 'undefined') {
            // Clear any cached Firebase instances
            delete (window as any).__FIREBASE_DEFAULTS__;
        }

        // Re-import and re-initialize Firebase
        const { initializeApp, getFirestore } = await import('firebase/app');
        const { getFirestore: getFirestoreDB } = await import('firebase/firestore');

        const firebaseConfig = {
            apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyC6ovwlhX4Mr8WpHoS045wLxHA7t8fRXPI",
            authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "hris-system-baa22.firebaseapp.com",
            projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "hris-system-baa22",
            storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "hris-system-baa22.firebasestorage.app",
            messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "563898942372",
            appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:563898942372:web:8c5ebae1dfaf072858b731",
            measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-1DJP5DJX92"
        };

        const app = initializeApp(firebaseConfig);
        const newDb = getFirestoreDB(app);

        console.log('✅ Firebase re-initialized successfully');
        console.log('New Firestore instance:', newDb);

        return {
            success: true,
            db: newDb,
            app: app
        };

    } catch (error: any) {
        console.error('❌ Firebase re-initialization failed:', error);
        return {
            success: false,
            error: error.message
        };
    }
}
