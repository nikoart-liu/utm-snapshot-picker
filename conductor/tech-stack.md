# 技术栈

本项目将使用以下技术构建，旨在提供 light-weight、高效且具有 macOS 原生感的快照管理工具。

## 核心架构
- **框架**: [Tauri](https://tauri.app/) - 使用 Rust 构建后端，通过系统原生 WebView 渲染前端，确保极小的应用体积和优秀的性能。
- **前端库**: [React](https://reactjs.org/) - 用于构建响应式和组件化的用户界面。
- **编程语言**: [TypeScript](https://www.typescriptlang.org/) - 为前端开发提供类型安全，提高代码质量和可维护性。
- **状态管理**: 基于 Rust 侧 Mutex + HashMap 实现的自定义持久化 KV 存储。

## 后端与系统集成
- **Rust**: 处理底层系统调用、文件系统操作以及执行 `qemu-img` 命令。
- **Shell 执行**: 通过 Tauri 的 `shell` 插件安全地调用外部 `qemu-img` 二进制文件。

## UI 与样式
- **CSS 框架**: [Tailwind CSS v4](https://tailwindcss.com/) - 用于快速实现极简风格的布局。
- **组件库**: 优先使用模拟 macOS 原生风格的 CSS 样式，确保视觉上的一致性。

## 测试与质量
- **前端测试**: [Vitest](https://vitest.dev/) + React Testing Library。
- **后端测试**: Rust 原生测试框架 + `tempfile`。

## 外部依赖
- **qemu-img**: 必须安装在系统中，用于执行实际的快照创建、回滚和管理操作。
