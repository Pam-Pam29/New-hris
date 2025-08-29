import { enableIndexedDbPersistence, disableNetwork, enableNetwork } from 'firebase/firestore';
import { db } from './firebase';

/**
 * Enables offline persistence for Firestore
 * This allows the app to work offline and sync when back online
 */
export async function enableOfflinePersistence() {
  try {
    await enableIndexedDbPersistence(db);
    console.log('Offline persistence enabled successfully');
    return true;
  } catch (error) {
    if (error instanceof Error) {
      console.error('Error enabling offline persistence:', error.message);
      
      // Handle specific error codes
      if (error.message.includes('already enabled')) {
        console.log('Offline persistence was already enabled');
        return true;
      }
      
      if (error.message.includes('multiple tabs')) {
        console.warn('Offline persistence is only supported in one tab at a time');
        // We can still continue, but offline support will be limited
        return true;
      }
    }
    return false;
  }
}

/**
 * Manually controls network connectivity for testing offline mode
 */
export async function setOfflineMode(offline: boolean) {
  try {
    if (offline) {
      await disableNetwork(db);
      console.log('Network disabled - app is in offline mode');
    } else {
      await enableNetwork(db);
      console.log('Network enabled - app is in online mode');
    }
    return true;
  } catch (error) {
    console.error('Error setting offline mode:', error);
    return false;
  }
}

/**
 * Checks if the app is currently offline
 * This is a simple check based on the browser's navigator.onLine property
 */
export function isOffline(): boolean {
  return !navigator.onLine;
}

/**
 * Sets up listeners for online/offline events
 * @param onOnline Callback for when the app goes online
 * @param onOffline Callback for when the app goes offline
 */
export function setupConnectivityListeners(
  onOnline: () => void,
  onOffline: () => void
) {
  window.addEventListener('online', onOnline);
  window.addEventListener('offline', onOffline);
  
  return () => {
    window.removeEventListener('online', onOnline);
    window.removeEventListener('offline', onOffline);
  };
}