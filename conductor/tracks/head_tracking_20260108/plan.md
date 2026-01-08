# Track Plan: 标识虚拟机当前快照状态 (HEAD Tracking)

## Phase 1: 基础设施搭建 (Store Plugin)
- [x] Task: 安装并配置 `tauri-plugin-store` (Rust 侧注册)
- [x] Task: 在前端初始化 Store 访问逻辑
- [x] Task: 编写 Store 存取功能的单元测试
- [x] Task: Conductor - User Manual Verification 'Phase 1: 基础设施搭建' (Protocol in workflow.md)

## Phase 2: 追踪逻辑实现
- [x] Task: 修改 `handleRevertSnapshot`，在成功后持久化 HEAD 状态
- [x] Task: 修改 `handleCreateSnapshot`，在成功后获取新快照 ID 并持久化
- [x] Task: 实现进入 VM 详情页时自动恢复 HEAD 状态的逻辑
- [x] Task: Conductor - User Manual Verification 'Phase 2: 追踪逻辑实现' (Protocol in workflow.md)

## Phase 3: UI 指示器展示
- [x] Task: 编写带有 HEAD 指示器的快照行组件测试
- [x] Task: 在快照表格中实现 HEAD 图标指示器的视觉效果
- [x] Task: 优化切换 VM 时的状态更新速度
- [x] Task: Conductor - User Manual Verification 'Phase 3: 最终打磨与安全检查' (Protocol in workflow.md)
