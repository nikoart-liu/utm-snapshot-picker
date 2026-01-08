# Track Plan: 优化快照操作提示与成功反馈

## Phase 1: 引入 Toast 机制
- [ ] Task: 编写 Toast 组件的 UI 测试
- [ ] Task: 实现基础 `Toast` 组件及其显示/隐藏状态管理
- [ ] Task: 在 `App.tsx` 中建立全局 Toast 触发机制
- [ ] Task: Conductor - User Manual Verification 'Phase 1: 引入 Toast 机制' (Protocol in workflow.md)

## Phase 2: 文案优化与交互集成
- [ ] Task: 更新 `App.tsx` 中关于运行状态的拦截提示文案
- [ ] Task: 在 `create_snapshot` 的操作链中集成成功 Toast
- [ ] Task: 在 `delete_snapshot` 和 `revert_snapshot` 的操作链中集成成功 Toast
- [ ] Task: Conductor - User Manual Verification 'Phase 2: 文案优化与交互集成' (Protocol in workflow.md)

## Phase 3: 最终打磨与视觉优化
- [ ] Task: 优化 Toast 的进入/退出动画
- [ ] Task: 验证在快速多次操作下 Toast 的显示行为
- [ ] Task: Conductor - User Manual Verification 'Phase 3: 最终打磨与安全检查' (Protocol in workflow.md)
