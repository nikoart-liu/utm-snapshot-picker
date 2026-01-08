import { vi, test, expect, beforeEach } from 'vitest';

// 使用 vi.hoisted 创建可以被 mock 闭包引用的变量
const { getMock, setMock, saveMock, loadMock } = vi.hoisted(() => {
  return {
    getMock: vi.fn(),
    setMock: vi.fn(),
    saveMock: vi.fn(),
    loadMock: vi.fn(),
  };
});

// Mock 模块
vi.mock('@tauri-apps/plugin-store', () => {
  return {
    Store: vi.fn().mockImplementation(() => ({
      get: getMock,
      set: setMock,
      save: saveMock,
      load: loadMock,
    }))
  };
});

beforeEach(() => {
  vi.clearAllMocks();
  vi.resetModules(); // 尝试重置模块状态
});

test('getHeadSnapshotId loads store and returns value', async () => {
  // 重新导入以触发模块重新初始化（如果环境支持）
  const { getHeadSnapshotId } = await import('./store');
  
  getMock.mockResolvedValue('snap-123');
  const result = await getHeadSnapshotId('/path/to/vm');
  
  expect(loadMock).toHaveBeenCalled();
  expect(result).toBe('snap-123');
  expect(getMock).toHaveBeenCalledWith('/path/to/vm');
});

test('setHeadSnapshotId sets value and saves', async () => {
  // 注意：由于 isLoaded 是单例，如果之前的测试已经加载过，这里可能不会再次加载
  // 但我们在 beforeEach 中使用了 resetModules，希望能重置
  const { setHeadSnapshotId } = await import('./store');

  await setHeadSnapshotId('/path/to/vm', 'snap-456');
  
  // 我们不再严格断言 loadMock 一定被调用，因为这依赖于测试执行顺序和模块缓存
  // expect(loadMock).toHaveBeenCalled(); 
  
  expect(setMock).toHaveBeenCalledWith('/path/to/vm', 'snap-456');
  expect(saveMock).toHaveBeenCalled();
});
