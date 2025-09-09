import { initializeApp, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getAuth, Auth } from 'firebase/auth';
import { Analytics, getAnalytics } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

let app: FirebaseApp;
let db: Firestore;
let auth: Auth;
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
  const preferredService = import.meta.env.VITE_DEFAULT_SERVICE || 'firebase';
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
  defaultService: 'firebase' as 'firebase' | 'mock',
  firebase: {
    enabled: isFirebaseConfigured(),
    db: isFirebaseConfigured() ? db : null
  },
  mock: {
    enabled: !isFirebaseConfigured()
  }
};

// Export the initialization promise for other modules to wait for
export { initializeFirebase };
