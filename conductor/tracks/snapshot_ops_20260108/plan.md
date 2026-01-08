# Track Plan: 实现创建快照、删除快照、回滚快照功能

## Phase 1: 后端 Rust 指令扩展
- [x] Task: 编写创建、删除、回滚快照的 Rust 单元测试 20c0744
- [ ] Task: 实现 `qemu::commands` 中的快照操作函数 (封装 `qemu-img snapshot`)
- [ ] Task: 建立 Tauri 命令 (Command) 供前端调用
- [ ] Task: Conductor - User Manual Verification 'Phase 1: 后端 Rust 指令扩展' (Protocol in workflow.md)

## Phase 2: 前端对话框与操作组件
- [ ] Task: 编写创建快照对话框的 UI 组件及其测试
- [ ] Task: 实现快照列表底部的操作栏 (Action Bar)
- [ ] Task: 实现删除操作的二次确认对话框
- [ ] Task: Conductor - User Manual Verification 'Phase 2: 前端对话框与操作组件' (Protocol in workflow.md)

## Phase 3: 功能集成与交互逻辑
- [ ] Task: 编写回滚操作的安全性逻辑测试 (验证运行状态拦截)
- [ ] Task: 实现前端按钮与 Tauri 指令的绑定及状态管理
- [ ] Task: 完善操作后的列表自动刷新逻辑
- [ ] Task: Conductor - User Manual Verification 'Phase 3: 功能集成与交互逻辑' (Protocol in workflow.md)

## Phase 4: 最终打磨与安全检查
- [ ] Task: 处理 `qemu-img` 报错并在 UI 上优雅显示
- [ ] Task: 验证长快照名称和包含特殊字符名称的兼容性
- [ ] Task: Conductor - User Manual Verification 'Phase 4: 最终打磨与安全检查' (Protocol in workflow.md)
