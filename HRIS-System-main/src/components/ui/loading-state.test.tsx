import React from 'react';
import { render, screen } from '@testing-library/react';
import { LoadingState } from './loading-state';

describe('LoadingState Component', () => {
  test('renders loading state when isLoading is true', () => {
    const loadingText = 'Custom loading message';
    render(
      <LoadingState isLoading={true} loadingText={loadingText}>
        <div>Content</div>
      </LoadingState>
    );
    
    expect(screen.getByText(loadingText)).toBeInTheDocument();
    expect(screen.queryByText('Content')).not.toBeInTheDocument();
  });

  test('renders error state when error is provided', () => {
    const errorMessage = 'Something went wrong';
    render(
      <LoadingState isLoading={false} error={errorMessage}>
        <div>Content</div>
      </LoadingState>
    );
    
    expect(screen.getByText(errorMessage)).toBeInTheDocument();
    expect(screen.queryByText('Content')).not.toBeInTheDocument();
  });

  test('renders children when not loading and no error', () => {
    render(
      <LoadingState isLoading={false} error={null}>
        <div>Content</div>
      </LoadingState>
    );
    
    expect(screen.getByText('Content')).toBeInTheDocument();
  });

  test('applies custom className', () => {
    const customClass = 'custom-class';
    render(
      <LoadingState isLoading={true} className={customClass}>
        <div>Content</div>
      </LoadingState>
    );
    
    const loadingContainer = screen.getByTestId('loading-container');
    expect(loadingContainer).toHaveClass(customClass);
  });
});