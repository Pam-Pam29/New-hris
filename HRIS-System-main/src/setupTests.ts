// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
import '@testing-library/jest-dom';

// Mock the Firebase modules
jest.mock('./config/firebase', () => ({
  initializeFirebase: jest.fn(),
  isFirebaseConfigured: jest.fn().mockReturnValue(true),
  db: {},
  auth: {},
  storage: {},
  getServiceConfig: jest.fn().mockReturnValue('mock'),
}));

// Mock the offline-persistence module
jest.mock('./config/offline-persistence', () => ({
  enableOfflinePersistence: jest.fn().mockResolvedValue(true),
  setOfflineMode: jest.fn().mockResolvedValue(true),
  isOffline: jest.fn().mockReturnValue(false),
  setupConnectivityListeners: jest.fn().mockReturnValue(jest.fn()),
}));

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // Deprecated
    removeListener: jest.fn(), // Deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock IntersectionObserver
class MockIntersectionObserver {
  constructor(callback) {
    this.callback = callback;
  }
  observe = jest.fn();
  unobserve = jest.fn();
  disconnect = jest.fn();
}

Object.defineProperty(window, 'IntersectionObserver', {
  writable: true,
  value: MockIntersectionObserver,
});