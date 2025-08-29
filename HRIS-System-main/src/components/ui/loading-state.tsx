import React from 'react';
import { Loader } from './loader';

type LoadingStateProps = {
  isLoading: boolean;
  loadingText?: string;
  error?: string | null;
  children: React.ReactNode;
  className?: string;
};

export function LoadingState({
  isLoading,
  loadingText = 'Loading...',
  error = null,
  children,
  className = '',
}: LoadingStateProps) {
  if (isLoading) {
    return (
      <div className={`flex flex-col items-center justify-center p-4 ${className}`} data-testid="loading-container">
        <Loader size="md" className="mb-2" />
        <p className="text-sm text-muted-foreground">{loadingText}</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`flex flex-col items-center justify-center p-4 text-destructive ${className}`} data-testid="error-container">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="mb-2"
          aria-hidden="true"
        >
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
        <p className="text-sm">{error}</p>
      </div>
    );
  }

  return <>{children}</>;
}