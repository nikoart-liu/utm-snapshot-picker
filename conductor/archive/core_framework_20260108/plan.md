# Track Plan: 搭建核心应用框架并实现基础快照列表展示

## Phase 1: 项目初始化与环境搭建 [checkpoint: 86fc154]
- [x] Task: 初始化 Tauri 项目 (React + TypeScript) fb19aa0
- [x] Task: 配置 Tailwind CSS 并设置 macOS 原生风格的基础样式 3303038
- [x] Task: Conductor - User Manual Verification 'Phase 1: 项目初始化与环境搭建' (Protocol in workflow.md)

## Phase 2: 后端逻辑实现 (Rust) [checkpoint: 9f61e2a]
- [x] Task: 实现扫描 `.utm` 虚拟机的 Rust 函数 55653af
- [x] Task: 实现封装 `qemu-img info` 命令以获取快照 JSON 数据 618e77c
- [x] Task: 建立 Tauri 命令 (Command) 供前端调用 618e77c
- [x] Task: Conductor - User Manual Verification 'Phase 2: 后端逻辑实现 (Rust)' (Protocol in workflow.md)

## Phase 3: 前端 UI 与数据绑定 [checkpoint: 9f61e2a]
- [x] Task: 构建虚拟机列表界面 618e77c
- [x] Task: 实现快照分层列表组件 618e77c
- [x] Task: 实现前端调用后端命令获取并展示真实数据 618e77c
- [x] Task: Conductor - User Manual Verification 'Phase 3: 前端 UI 与数据绑定' (Protocol in workflow.md)

## Phase 4: 最终打磨与安全检查 [checkpoint: c1f4c18]
- [x] Task: 添加虚拟机运行状态检测逻辑 (防止在运行时操作快照) fedc6ee
- [x] Task: 完善错误处理与用户提示 fedc6ee
- [x] Task: Conductor - User Manual Verification 'Phase 4: 最终打磨与安全检查' (Protocol in workflow.md)
