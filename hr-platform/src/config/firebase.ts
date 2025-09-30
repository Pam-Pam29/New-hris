// Firebase Configuration - Rewritten 2025-09-29 to fix corruption issues
import { initializeApp, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getAuth, Auth } from 'firebase/auth';
import { getStorage, FirebaseStorage } from 'firebase/storage';
import { Analytics, getAnalytics } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyC6ovwlhX4Mr8WpHoS045wLxHA7t8fRXPI",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "hris-system-baa22.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "hris-system-baa22",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "hris-system-baa22.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "563898942372",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:563898942372:web:8c5ebae1dfaf072858b731",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-1DJP5DJX92"
};

// Firebase instances - will be initialized later
let app: FirebaseApp | null = null;
let db: Firestore | null = null;
let auth: Auth | null = null;
let storage: FirebaseStorage | null = null;
let analytics: Analytics | null = null;
let firebaseInitialized = false;

// Promise to track Firebase initialization
let firebaseInitPromise: Promise<boolean> | null = null;

// Async function to initialize Firebase
const initializeFirebase = async (): Promise<boolean> => {
  if (firebaseInitPromise) {
    return firebaseInitPromise;
  }

  firebaseInitPromise = (async () => {
    try {
      // Initialize Firebase
      app = initializeApp(firebaseConfig);
      db = getFirestore(app);
      auth = getAuth(app);
      storage = getStorage(app);

      // Initialize Analytics only when available and supported (browser + measurementId)
      try {
        if (typeof window !== 'undefined' && !!firebaseConfig.measurementId) {
          const { getAnalytics, isSupported } = await import('firebase/analytics');
          if (await isSupported()) {
            analytics = getAnalytics(app);
          }
        }
      } catch (error) {
        // Safely ignore analytics failures in dev/non-browser environments
        analytics = null;
      }

      firebaseInitialized = true;
      console.log('✅ Firebase initialized successfully', db);
      return true;
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.warn(`⚠️ Firebase initialization failed: ${error.message}`);
      }
      console.warn('⚠️ Falling back to Mock service');
      firebaseInitialized = false;
      return false;
    }
  })();

  return firebaseInitPromise;
};

// Initialize Firebase immediately
initializeFirebase();

// Export functions to get Firebase instances (safer for imports)
export const getFirebaseDb = () => {
  if (!db) {
    throw new Error('Firebase database not initialized. Call initializeFirebase() first.');
  }
  return db;
};

export const getFirebaseAuth = () => {
  if (!auth) {
    throw new Error('Firebase auth not initialized. Call initializeFirebase() first.');
  }
  return auth;
};

export const getFirebaseStorage = () => {
  if (!storage) {
    throw new Error('Firebase storage not initialized. Call initializeFirebase() first.');
  }
  return storage;
};

export const getFirebaseAnalytics = () => analytics;

// Helper function to check if Firebase is properly configured
export const isFirebaseConfigured = () => {
  return firebaseConfig.apiKey &&
    firebaseConfig.projectId &&
    firebaseConfig.apiKey !== "your-api-key" &&
    firebaseConfig.projectId !== "your-project-id" &&
    firebaseInitialized &&
    db !== null &&
    auth !== null &&
    storage !== null;
};

// Function to get service config after Firebase initialization
export const getServiceConfig = async () => {
  // Wait for Firebase to initialize
  await initializeFirebase();

  // Check environment variable for service preference
  const preferredService = import.meta.env.VITE_DEFAULT_SERVICE || 'firebase';
  const useFirebase = (preferredService === 'firebase' && isFirebaseConfigured());

  console.log('Service config check:', {
    preferredService,
    isFirebaseConfigured: isFirebaseConfigured(),
    useFirebase,
    firebaseConfig: {
      apiKey: firebaseConfig.apiKey,
      projectId: firebaseConfig.projectId
    }
  });

  return {
    // Use Firebase for production
    defaultService: useFirebase ? 'firebase' : 'mock',

    // Firebase configuration
    firebase: {
      enabled: useFirebase,
      db: isFirebaseConfigured() ? db : null,
      storage: isFirebaseConfigured() ? storage : null
    },

    // Mock service configuration
    mock: {
      enabled: !useFirebase
    }
  };
};

// For backwards compatibility, export a SERVICE_CONFIG that defaults to Firebase for production
export const SERVICE_CONFIG = {
  defaultService: 'firebase' as 'firebase' | 'mock',
  firebase: {
    enabled: true,
    db: isFirebaseConfigured() ? (() => {
      try { return getFirebaseDb(); } catch { return null; }
    })() : null,
    storage: isFirebaseConfigured() ? (() => {
      try { return getFirebaseStorage(); } catch { return null; }
    })() : null
  },
  mock: {
    enabled: false
  }
};

// Export the initialization promise for other modules to wait for
export { initializeFirebase };