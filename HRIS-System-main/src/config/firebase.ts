// Firebase configuration for HRIS System
// This file allows easy switching between Firebase and other backend services

// Firebase configuration from environment variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase services (with error handling for missing dependencies)
let app: any = null;
let db: any = null;
let auth: any = null;
let analytics: any = null;
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
      const { initializeApp } = await import('firebase/app');
      const { getFirestore, enableIndexedDbPersistence } = await import('firebase/firestore');
      const { getAuth } = await import('firebase/auth');
      const { getAnalytics } = await import('firebase/analytics');
      const { getStorage } = await import('firebase/storage');

      // Initialize Firebase
      app = initializeApp(firebaseConfig);
      db = getFirestore(app);
      auth = getAuth(app);
      analytics = getAnalytics(app);
      const storage = getStorage(app);
      
      // Enable offline persistence
      try {
        await enableIndexedDbPersistence(db);
        console.log('✅ Offline persistence enabled');
      } catch (err: any) {
        if (err.code === 'failed-precondition') {
          console.warn('⚠️ Multiple tabs open, persistence can only be enabled in one tab at a time');
        } else if (err.code === 'unimplemented') {
          console.warn('⚠️ The current browser does not support offline persistence');
        } else {
          console.error('❌ Error enabling offline persistence:', err);
        }
      }

      firebaseInitialized = true;
      console.log('✅ Firebase initialized successfully', db);
      return true;
    } catch (error) {
      console.warn('⚠️ Firebase not available. Please install Firebase: npm install firebase');
      console.warn('⚠️ Falling back to Mock service');
      firebaseInitialized = false;
      return false;
    }
  })();

  return firebaseInitPromise;
};

// Initialize Firebase immediately
initializeFirebase();

// Export Firebase services
export { db, auth, analytics };
export default app;

// Helper function to check if Firebase is properly configured
export const isFirebaseConfigured = () => {
  return firebaseConfig.apiKey &&
    firebaseConfig.projectId &&
    firebaseConfig.apiKey !== "your-api-key" &&
    firebaseConfig.projectId !== "your-project-id" &&
    firebaseInitialized &&
    db !== null;
};

// Function to get service config after Firebase initialization
export const getServiceConfig = async () => {
  // Wait for Firebase to initialize
  await initializeFirebase();

  // Check environment variable for service preference
  const preferredService = import.meta.env.VITE_DEFAULT_SERVICE || 'mock';
  const useFirebase = (preferredService === 'firebase' && isFirebaseConfigured());

  return {
    // Use environment variable or fallback based on Firebase configuration
    defaultService: useFirebase ? 'firebase' : 'mock' as 'firebase' | 'mock',

    // Firebase configuration
    firebase: {
      enabled: isFirebaseConfigured(),
      db: isFirebaseConfigured() ? db : null
    },

    // Mock service configuration
    mock: {
      enabled: true
    }
  };
};

// For backwards compatibility, export a SERVICE_CONFIG that defaults to mock
// but can be overridden by calling getServiceConfig()
export const SERVICE_CONFIG = {
  defaultService: 'mock' as 'firebase' | 'mock',
  firebase: {
    enabled: false,
    db: null
  },
  mock: {
    enabled: true
  }
};

// Export the initialization promise for other modules to wait for
export { initializeFirebase };