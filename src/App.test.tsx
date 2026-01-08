import { render, screen } from '@testing-library/react';
import { vi, test, expect } from 'vitest';
import App from './App';

vi.mock('@tauri-apps/api/core', () => ({
  invoke: vi.fn(),
}));

test('renders welcome message', () => {
  render(<App />);
  const linkElement = screen.getByText(/Welcome to Tauri \+ React/i);
  expect(linkElement).toBeInTheDocument();
});
