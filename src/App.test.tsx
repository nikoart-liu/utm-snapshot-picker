import { render, screen, act } from '@testing-library/react';
import { vi, test, expect } from 'vitest';
import App from './App';
import { invoke } from '@tauri-apps/api/core';

vi.mock('@tauri-apps/api/core', () => ({
  invoke: vi.fn(),
}));

test('renders virtual machines title', async () => {
  (invoke as any).mockResolvedValue([]);
  await act(async () => {
    render(<App />);
  });
  const titleElement = screen.getByText(/Virtual Machines/i);
  expect(titleElement).toBeInTheDocument();
});

test('renders select vm message', async () => {
  (invoke as any).mockResolvedValue([]);
  await act(async () => {
    render(<App />);
  });
  const messageElement = screen.getByText(/Select a Virtual Machine to view details/i);
  expect(messageElement).toBeInTheDocument();
});
