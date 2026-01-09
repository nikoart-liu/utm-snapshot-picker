import { vi, test, expect, beforeEach } from 'vitest';
import { getHeadSnapshotId, setHeadSnapshotId } from './store';
import { invoke } from "@tauri-apps/api/core";

// Mock @tauri-apps/api/core
vi.mock('@tauri-apps/api/core', () => ({
  invoke: vi.fn(),
}));

beforeEach(() => {
  vi.clearAllMocks();
});

test('getHeadSnapshotId returns value from rust store', async () => {
  (invoke as any).mockResolvedValue('snap-123');
  const result = await getHeadSnapshotId('/path/to/vm');
  
  expect(invoke).toHaveBeenCalledWith('get_head_id', { vmPath: '/path/to/vm' });
  expect(result).toBe('snap-123');
});

test('setHeadSnapshotId calls rust set command', async () => {
  (invoke as any).mockResolvedValue(undefined);
  await setHeadSnapshotId('/path/to/vm', 'snap-456');
  
  expect(invoke).toHaveBeenCalledWith('set_head_id', { vmPath: '/path/to/vm', snapshotId: 'snap-456' });
});