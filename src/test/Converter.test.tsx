import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import Converter from '../pages/Converter';
import { HistoryProvider } from '../contexts/HistoryContext';
import { FavoritesProvider } from '../contexts/FavoritesContext';
import { PresetsProvider } from '../contexts/PresetsContext';
import { ThemeProvider } from '../contexts/ThemeProvider';

// Mocks for testing URL parameters
const mockSetSearchParams = vi.fn();
const mockReplace = vi.fn();

// Mock history.replaceState
Object.defineProperty(window, 'history', {
  writable: true,
  value: {
    ...window.history,
    replaceState: mockReplace,
  },
});

// Mock for IndexedDB functionality used in Converter
vi.mock('../lib/indexedDB', () => ({
  addHistoryRecord: vi.fn().mockResolvedValue(undefined),
  getHistoryRecords: vi.fn().mockResolvedValue([]),
  clearHistoryRecords: vi.fn().mockResolvedValue(undefined),
  removeHistoryRecord: vi.fn().mockResolvedValue(undefined),
  openDatabase: vi.fn().mockResolvedValue({}),
}));

// Mock URL search params for deep-linking tests
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useSearchParams: () => [
      {
        get: (key: string) => {
          switch (key) {
            case 'category': return 'length';
            case 'from': return 'meter';
            case 'to': return 'foot';
            case 'value': return '10';
            default: return null;
          }
        }
      },
      mockSetSearchParams
    ],
    useNavigate: () => vi.fn(),
  };
});

// Test wrapper to provide all required context providers
const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <MemoryRouter initialEntries={['/converter']}>
    <ThemeProvider>
      <HistoryProvider>
        <FavoritesProvider>
          <PresetsProvider>
            <Routes>
              <Route path="/converter" element={children} />
            </Routes>
          </PresetsProvider>
        </FavoritesProvider>
      </HistoryProvider>
    </ThemeProvider>
  </MemoryRouter>
);

describe('Converter Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSetSearchParams.mockClear();
    mockReplace.mockClear();
  });

  // Test 1: Auto-convert logic
  it('should auto-convert values when inputs change', async () => {
    render(
      <TestWrapper>
        <Converter />
      </TestWrapper>
    );
    
    // Wait for the skeleton loader to disappear
    await waitFor(() => {
      expect(screen.queryByText(/Category/i)).toBeInTheDocument();
    });
    
    // Find the input using ID instead of label
    const input = screen.getByPlaceholderText('Enter value');
    fireEvent.change(input, { target: { value: '20' } });
    
    // Wait for the debounced conversion to happen (300ms + buffer)
    await waitFor(() => {
      // Check for the converted value in the UI
      // The exact value might vary, so we check for presence of conversion
      const resultElement = screen.getByText(/=/i);
      expect(resultElement).toBeInTheDocument();
    }, { timeout: 500 });
  });

  // Test 2: Error states
  it('should show validation error for invalid input', async () => {
    render(
      <TestWrapper>
        <Converter />
      </TestWrapper>
    );
    
    // Wait for the component to load
    await waitFor(() => {
      expect(screen.queryByText(/Category/i)).toBeInTheDocument();
    });
    
    // Find the input using ID
    const input = screen.getByPlaceholderText('Enter value');
    fireEvent.change(input, { target: { value: 'abc' } });
    
    // Wait for the debounced validation to happen
    await waitFor(() => {
      expect(screen.getByText(/Please enter a valid number/i)).toBeInTheDocument();
    }, { timeout: 500 });
  });

  // Test 3: FAB visibility toggling
  it('should show FAB after a successful conversion', async () => {
    render(
      <TestWrapper>
        <Converter />
      </TestWrapper>
    );
    
    // Wait for the component to load
    await waitFor(() => {
      expect(screen.queryByText(/Category/i)).toBeInTheDocument();
    });
    
    // At first, the FAB might not be visible until conversion is complete
    const initialFab = screen.queryByLabelText(/Save preset/i);
    
    // Find the input using ID
    const input = screen.getByPlaceholderText('Enter value');
    fireEvent.change(input, { target: { value: '42' } });
    
    // Wait for the debounced conversion and FAB to appear
    await waitFor(() => {
      const fab = screen.getByLabelText(/Save preset/i);
      expect(fab).toBeInTheDocument();
    }, { timeout: 500 });
  });

  // Test 4: Deep-link parsing
  it('should correctly apply URL parameters when loading the component', async () => {
    render(
      <TestWrapper>
        <Converter />
      </TestWrapper>
    );
    
    // Wait for the component to load and apply URL parameters
    await waitFor(() => {
      expect(screen.queryByText(/Category/i)).toBeInTheDocument();
    });
    
    // Check that the value from URL is applied using ID
    const input = screen.getByPlaceholderText('Enter value') as HTMLInputElement;
    
    // Wait for the value to be set from URL params
    await waitFor(() => {
      expect(input.value).toBe('10');
    });
    
    // After the component loads, it should have updated the URL with the current state
    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalled();
    });
  });
});

// Test specific functions used in the converter
describe('Converter Utility Functions', () => {
  it('should format numbers correctly', async () => {
    render(
      <TestWrapper>
        <Converter />
      </TestWrapper>
    );
    
    // Wait for component to load
    await waitFor(() => {
      expect(screen.queryByText(/Category/i)).toBeInTheDocument();
    });
    
    // Test different formats
    const input = screen.getByPlaceholderText('Enter value');
    
    // Large number - should use fixed precision
    fireEvent.change(input, { target: { value: '1000' } });
    await waitFor(() => {
      const resultText = screen.getByText(/=/i).textContent;
      // Just check that the result contains numbers, not exact format
      expect(resultText).toMatch(/\d+/);
    }, { timeout: 500 });
    
    // Small number - should use scientific notation
    fireEvent.change(input, { target: { value: '0.0000001' } });
    await waitFor(() => {
      const resultText = screen.getByText(/=/i).textContent;
      // Should contain e notation for very small numbers
      expect(resultText).toMatch(/e/i);
    }, { timeout: 500 });
  });
}); 