// Firebase configuration for HRIS System
// This file allows easy switching between Firebase and other backend services

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyC6ovwlhX4Mr8WpHoS045wLxHA7t8fRXPI",
  authDomain: "hris-system-baa22.firebaseapp.com",
  projectId: "hris-system-baa22",
  storageBucket: "hris-system-baa22.firebasestorage.app",
  messagingSenderId: "563898942372",
  appId: "1:563898942372:web:8c5ebae1dfaf072858b731",
  measurementId: "G-1DJP5DJX92"
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
      const { getFirestore } = await import('firebase/firestore');
      const { getAuth } = await import('firebase/auth');
      const { getAnalytics } = await import('firebase/analytics');

      // Initialize Firebase
      app = initializeApp(firebaseConfig);
      db = getFirestore(app);
      auth = getAuth(app);
      analytics = getAnalytics(app);

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

  return {
    // Set to 'firebase' to use Firebase, 'mock' for development
    defaultService: isFirebaseConfigured() ? 'firebase' : 'mock' as 'firebase' | 'mock',

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