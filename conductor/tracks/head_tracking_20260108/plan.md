# Track Plan: 标识虚拟机当前快照状态 (HEAD Tracking)

## Phase 1: 基础设施搭建 (Store Plugin)
- [ ] Task: 安装并配置 `tauri-plugin-store` (Rust 侧注册)
- [ ] Task: 在前端初始化 Store 访问逻辑
- [ ] Task: 编写 Store 存取功能的单元测试
- [ ] Task: Conductor - User Manual Verification 'Phase 1: 基础设施搭建' (Protocol in workflow.md)

## Phase 2: 追踪逻辑实现
- [ ] Task: 修改 `handleRevertSnapshot`，在成功后持久化 HEAD 状态
- [ ] Task: 修改 `handleCreateSnapshot`，在成功后获取新快照 ID 并持久化
- [ ] Task: 实现进入 VM 详情页时自动恢复 HEAD 状态的逻辑
- [ ] Task: Conductor - User Manual Verification 'Phase 2: 追踪逻辑实现' (Protocol in workflow.md)

## Phase 3: UI 指示器展示
- [ ] Task: 编写带有 HEAD 指示器的快照行组件测试
- [ ] Task: 在快照表格中实现 HEAD 图标指示器的视觉效果
- [ ] Task: 优化切换 VM 时的状态更新速度
- [ ] Task: Conductor - User Manual Verification 'Phase 3: 最终打磨与安全检查' (Protocol in workflow.md)
