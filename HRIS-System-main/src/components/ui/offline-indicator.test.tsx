import React from 'react';
import { render, screen } from '@testing-library/react';
import { OfflineIndicator } from './offline-indicator';
import { isOffline, setupConnectivityListeners } from '../../config/offline-persistence';

// Mock the offline-persistence module
jest.mock('../../config/offline-persistence', () => ({
  isOffline: jest.fn(),
  setupConnectivityListeners: jest.fn().mockImplementation((onOnline, onOffline) => {
    // Store the callbacks for testing
    (setupConnectivityListeners as jest.Mock).mockOnlineCallback = onOnline;
    (setupConnectivityListeners as jest.Mock).mockOfflineCallback = onOffline;
    return jest.fn(); // Return cleanup function
  }),
}));

describe('OfflineIndicator Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders offline message when offline', () => {
    (isOffline as jest.Mock).mockReturnValue(true);
    
    render(<OfflineIndicator />);
    
    expect(screen.getByText(/You're offline/)).toBeInTheDocument();
  });

  test('does not render when online', () => {
    (isOffline as jest.Mock).mockReturnValue(false);
    
    const { container } = render(<OfflineIndicator />);
    
    expect(container.firstChild).toBeNull();
  });

  test('applies custom className when provided', () => {
    (isOffline as jest.Mock).mockReturnValue(true);
    
    render(<OfflineIndicator className="test-class" />);
    
    const indicator = screen.getByText(/You're offline/).closest('div');
    expect(indicator).toHaveClass('test-class');
  });

  test('updates when online status changes', () => {
    // Start offline
    (isOffline as jest.Mock).mockReturnValue(true);
    
    render(<OfflineIndicator />);
    
    expect(screen.getByText(/You're offline/)).toBeInTheDocument();
    
    // Simulate going online
    const onlineCallback = (setupConnectivityListeners as jest.Mock).mockOnlineCallback;
    onlineCallback();
    
    // Should no longer be visible
    expect(screen.queryByText(/You're offline/)).not.toBeInTheDocument();
    
    // Simulate going offline again
    const offlineCallback = (setupConnectivityListeners as jest.Mock).mockOfflineCallback;
    offlineCallback();
    
    // Should be visible again
    expect(screen.getByText(/You're offline/)).toBeInTheDocument();
  });
});