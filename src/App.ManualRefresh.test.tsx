import { render, screen, act, fireEvent } from '@testing-library/react';
import { vi, test, expect } from 'vitest';
import App from './App';
import { invoke } from '@tauri-apps/api/core';

vi.mock('@tauri-apps/api/core', () => ({
  invoke: vi.fn(),
}));

vi.mock('./store', () => ({
  getHeadSnapshotId: vi.fn().mockResolvedValue(null),
  setHeadSnapshotId: vi.fn().mockResolvedValue(undefined),
}));

test('clears selected VM on manual refresh', async () => {
  const mockVms = [
    { path: '/path/to/vm1.utm', name: 'VM 1', is_running: false },
  ];

  (invoke as any).mockImplementation((cmd: string) => {
    if (cmd === 'scan_vms') return Promise.resolve(mockVms);
    if (cmd === 'get_snapshots') return Promise.resolve({ snapshots: [] });
    return Promise.resolve(null);
  });

  await act(async () => {
    render(<App />);
  });

  // Select the VM
  const vmItem = screen.getByText('VM 1');
  await act(async () => {
    fireEvent.click(vmItem);
  });

  // Verify VM is selected (snapshot area title appears)
  expect(screen.getByRole('heading', { level: 1, name: 'VM 1' })).toBeInTheDocument();

  // Find and click the refresh button in the sidebar
  const refreshButton = screen.getByTitle('Refresh list');
  await act(async () => {
    fireEvent.click(refreshButton);
  });

  // Verify VM selection is cleared (Select message appears)
  expect(screen.getByText('Select a UTM Machine to manage snapshots')).toBeInTheDocument();
  // VM 1 header should no longer be visible
  expect(screen.queryByRole('heading', { level: 1, name: 'VM 1' })).not.toBeInTheDocument();
});

test('refresh button shows loading animation and is disabled during refresh', async () => {
  let resolveScan: (value: any) => void;
  const scanPromise = new Promise((resolve) => {
    resolveScan = resolve;
  });

  (invoke as any).mockImplementation((cmd: string) => {
    if (cmd === 'scan_vms') return scanPromise;
    return Promise.resolve(null);
  });

  await act(async () => {
    render(<App />);
  });

  const refreshButton = screen.getByTitle('Refresh list');
  const svg = refreshButton.querySelector('svg');

  // Trigger refresh
  fireEvent.click(refreshButton);

  // Verify loading state (button disabled, svg has animate-spin)
  // We don't need 'await act' for the immediate state check if the promise is pending
  expect(refreshButton).toBeDisabled();
  expect(svg).toHaveClass('animate-spin');

  // Resolve the promise to finish refresh
  await act(async () => {
    resolveScan!([]);
  });

  // Verify loading state is cleared
  expect(refreshButton).not.toBeDisabled();
  expect(svg).not.toHaveClass('animate-spin');
});

