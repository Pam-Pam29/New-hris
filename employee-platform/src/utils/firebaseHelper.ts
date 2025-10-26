import { db } from '../config/firebase';

// Simple helper to test Firebase connection
export async function testFirebaseConnection(): Promise<boolean> {
    try {
        if (!db) {
            console.log('❌ Firebase db instance is null');
            return false;
        }

        // Try a simple read operation
        const { collection, query, getDocs, limit } = await import('firebase/firestore');
        const testQuery = query(collection(db, 'employees'), limit(1));
        await getDocs(testQuery);

        console.log('✅ Firebase connection test successful');
        return true;
    } catch (error) {
        console.log('❌ Firebase connection test failed:', error);
        return false;
    }
}

// Force Firebase re-initialization
export async function forceFirebaseInit(): Promise<boolean> {
    try {
        console.log('🔄 Forcing Firebase initialization...');

        // Re-import Firebase modules
        const { initializeApp } = await import('firebase/app');
        const { getFirestore } = await import('firebase/firestore');

        const firebaseConfig = {
            apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "",
            authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "",
            projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "",
            storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "",
            messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "",
            appId: import.meta.env.VITE_FIREBASE_APP_ID || "",
            measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || ""
        };

        // Initialize Firebase
        const app = initializeApp(firebaseConfig);
        const newDb = getFirestore(app);

        console.log('✅ Firebase re-initialized successfully');
        return true;
    } catch (error) {
        console.log('❌ Firebase re-initialization failed:', error);
        return false;
    }
}
