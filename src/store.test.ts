import { vi, test, expect, beforeEach } from 'vitest';
import { getHeadSnapshotId, setHeadSnapshotId } from './store';

// 使用 vi.hoisted 创建可以被 mock 闭包引用的变量
const { getMock, setMock, saveMock } = vi.hoisted(() => {
  return {
    getMock: vi.fn(),
    setMock: vi.fn(),
    saveMock: vi.fn(),
  };
});

// Mock 模块
vi.mock('@tauri-apps/plugin-store', () => {
  return {
    Store: vi.fn().mockImplementation(() => ({
      get: getMock,
      set: setMock,
      save: saveMock,
    }))
  };
});

beforeEach(() => {
  vi.clearAllMocks();
});

test('getHeadSnapshotId returns value from store', async () => {
  getMock.mockResolvedValue('snap-123');
  const result = await getHeadSnapshotId('/path/to/vm');
  expect(result).toBe('snap-123');
  expect(getMock).toHaveBeenCalledWith('/path/to/vm');
});

test('setHeadSnapshotId sets value and saves', async () => {
  await setHeadSnapshotId('/path/to/vm', 'snap-456');
  expect(setMock).toHaveBeenCalledWith('/path/to/vm', 'snap-456');
  expect(saveMock).toHaveBeenCalled();
});
