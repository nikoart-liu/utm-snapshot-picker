import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, test, expect } from 'vitest';
import { CreateSnapshotModal } from './CreateSnapshotModal';

test('renders nothing when not open', () => {
  render(<CreateSnapshotModal isOpen={false} onClose={() => {}} onCreate={async () => {}} />);
  expect(screen.queryByText('New Snapshot')).not.toBeInTheDocument();
});

test('renders dialog when open', () => {
  render(<CreateSnapshotModal isOpen={true} onClose={() => {}} onCreate={async () => {}} />);
  expect(screen.getByText('New Snapshot')).toBeInTheDocument();
});

test('calls onCreate with input value', async () => {
  const handleCreate = vi.fn().mockResolvedValue(undefined);
  render(<CreateSnapshotModal isOpen={true} onClose={() => {}} onCreate={handleCreate} />);

  const input = screen.getByPlaceholderText('Enter snapshot name');
  fireEvent.change(input, { target: { value: 'my-snap' } });
  
  const button = screen.getByText('Create');
  fireEvent.click(button);

  await waitFor(() => {
    expect(handleCreate).toHaveBeenCalledWith('my-snap');
  });
});
