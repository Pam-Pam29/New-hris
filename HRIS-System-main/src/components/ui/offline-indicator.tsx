import React, { useState, useEffect } from 'react';
import { isOffline, setupConnectivityListeners } from '../../config/offline-persistence';

type OfflineIndicatorProps = {
  className?: string;
};

export function OfflineIndicator({ className = '' }: OfflineIndicatorProps) {
  const [offline, setOffline] = useState(isOffline());
  
  useEffect(() => {
    const handleOnline = () => setOffline(false);
    const handleOffline = () => setOffline(true);
    
    // Set up listeners for online/offline events
    const cleanup = setupConnectivityListeners(handleOnline, handleOffline);
    
    // Clean up listeners on unmount
    return cleanup;
  }, []);
  
  if (!offline) return null;
  
  return (
    <div className={`flex items-center gap-2 px-3 py-1.5 bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300 text-sm rounded-md ${className}`}>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <line x1="1" y1="1" x2="23" y2="23" />
        <path d="M16.72 11.06A10.94 10.94 0 0 1 19 12.55" />
        <path d="M5 12.55a10.94 10.94 0 0 1 5.17-2.39" />
        <path d="M10.71 5.05A16 16 0 0 1 22.58 9" />
        <path d="M1.42 9a15.91 15.91 0 0 1 4.7-2.88" />
        <path d="M8.53 16.11a6 6 0 0 1 6.95 0" />
        <line x1="12" y1="20" x2="12.01" y2="20" />
      </svg>
      <span>You're offline. Changes will sync when you reconnect.</span>
    </div>
  );
}