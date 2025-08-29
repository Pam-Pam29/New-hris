import React from 'react';

type LoaderProps = {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
};

export function Loader({ size = 'md', className = '' }: LoaderProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
  };

  return (
    <div className={`flex items-center justify-center ${className}`} data-testid="loader-container">
      <div
        className={`${sizeClasses[size]} border-2 border-t-primary border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin`}
        role="status"
        aria-label="Loading"
      />
    </div>
  );
}