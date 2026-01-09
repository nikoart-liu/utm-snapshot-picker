# Track Plan: 虚拟机列表手动刷新功能 (VM List Manual Refresh)

## Phase 1: 行为修改与状态清理
- [x] Task: 修改 `loadVms` 函数逻辑，支持在手动刷新时强制清除 `selectedVm` 状态 d03e2f7
- [x] Task: 编写单元测试验证手动刷新操作后，当前选中的虚拟机及其关联状态（快照列表等）已被正确清空 d03e2f7
- [ ] Task: Conductor - User Manual Verification 'Phase 1: 行为修改与状态清理' (Protocol in workflow.md)
- [ ] Task: Conductor - User Manual Verification 'Phase 1: 行为修改与状态清理' (Protocol in workflow.md)

## Phase 2: UI 视觉反馈与交互优化
- [ ] Task: 为侧边栏刷新按钮添加加载状态动画（当 `loading` 为 true 时旋转图标）
- [ ] Task: 在扫描期间禁用刷新按钮，防止重复触发请求
- [ ] Task: 确保刷新后的列表能正确反映最新的目录结构变化
- [ ] Task: Conductor - User Manual Verification 'Phase 2: UI 视觉反馈与交互优化' (Protocol in workflow.md)