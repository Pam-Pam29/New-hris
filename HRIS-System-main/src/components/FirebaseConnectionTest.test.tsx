import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import FirebaseConnectionTest from './FirebaseConnectionTest';
import { initializeFirebase, isFirebaseConfigured } from '../config/firebase';

// Mock the firebase module
jest.mock('../config/firebase', () => ({
  initializeFirebase: jest.fn(),
  isFirebaseConfigured: jest.fn(),
  db: {
    collection: jest.fn(() => ({
      doc: jest.fn(() => ({
        set: jest.fn().mockResolvedValue({}),
        get: jest.fn().mockResolvedValue({
          exists: jest.fn().mockReturnValue(true),
          data: jest.fn().mockReturnValue({ test: 'data' }),
        }),
        delete: jest.fn().mockResolvedValue({}),
      })),
    })),
  },
}));

describe('FirebaseConnectionTest Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (isFirebaseConfigured as jest.Mock).mockReturnValue(true);
    (initializeFirebase as jest.Mock).mockResolvedValue(true);
  });

  test('renders and shows checking status initially', () => {
    render(<FirebaseConnectionTest />);
    expect(screen.getByText('Testing Firebase connection...')).toBeInTheDocument();
  });

  test('shows connected status after successful connection', async () => {
    render(<FirebaseConnectionTest />);
    
    await waitFor(() => {
      expect(screen.getByText('Connected')).toBeInTheDocument();
    });
    
    expect(initializeFirebase).toHaveBeenCalled();
  });

  test('shows error status when Firebase is not configured', async () => {
    (isFirebaseConfigured as jest.Mock).mockReturnValue(false);
    
    render(<FirebaseConnectionTest />);
    
    await waitFor(() => {
      expect(screen.getByText('Firebase is not properly configured')).toBeInTheDocument();
    });
  });

  test('retests connection when button is clicked', async () => {
    render(<FirebaseConnectionTest />);
    
    await waitFor(() => {
      expect(screen.getByText('Connected')).toBeInTheDocument();
    });
    
    const retestButton = screen.getByText('Test Connection Again');
    fireEvent.click(retestButton);
    
    expect(screen.getByText('Testing Firebase connection...')).toBeInTheDocument();
    
    await waitFor(() => {
      expect(screen.getByText('Connected')).toBeInTheDocument();
    });
    
    expect(initializeFirebase).toHaveBeenCalledTimes(2);
  });
});