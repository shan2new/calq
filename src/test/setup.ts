import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Set up a mock IntersectionObserver
class MockIntersectionObserver {
  observe = vi.fn();
  disconnect = vi.fn();
  unobserve = vi.fn();
}

Object.defineProperty(window, 'IntersectionObserver', {
  writable: true,
  configurable: true,
  value: MockIntersectionObserver,
});

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock URL parameters
const mockSearchParams = new URLSearchParams();
vi.mock('react-router-dom', () => ({
  ...vi.importActual('react-router-dom'),
  useSearchParams: () => [mockSearchParams, vi.fn()],
  useNavigate: () => vi.fn(),
  useLocation: () => ({ pathname: '/' }),
}));

// Mock IndexedDB
let mockIndexedDB = {
  open: vi.fn().mockReturnValue({
    onupgradeneeded: null,
    onsuccess: null,
    onerror: null,
  }),
};

Object.defineProperty(window, 'indexedDB', {
  writable: true,
  value: mockIndexedDB,
}); 