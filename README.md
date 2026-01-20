# UTM Snapshot Picker

`UTM Snapshot Picker` 是一个专为 macOS 设计的实用工具，旨在简化 [UTM](https://getutm.app/) 虚拟机快照的管理。它直接通过 `qemu-img` 与虚拟磁盘交互，提供了比 UTM 原生界面更直观的快照查看和操作体验（尤其是在需要频繁回滚和实验的场景下）。

## 🚀 核心功能

- **自动化扫描**: 自动识别安装在默认路径下的 UTM 虚拟机。
- **快照管理**:
  - 实时查看虚拟机的快照列表。
  - 创建新快照（需关闭虚拟机）。
  - 删除现有快照。
  - 快速回滚（Revert）到指定快照状态。
- **状态感知**: 自动检查虚拟机运行状态，确保操作安全性。
- **原生体验**: 基于 Tauri 构建，运行轻量且与 macOS 环境深度集成。

## 🛠️ 技术栈

- **前端**: React 19 + TypeScript + Vite
- **后端**: Rust (Tauri 2.0框架)
- **样式**: Tailwind CSS
- **核心工具**: `qemu-img` (通过 Rust Command 调用)

## 📋 环境要求

1. **macOS**: 仅支持 macOS 平台。
2. **UTM**: 必须安装 UTM 以加载虚拟机。
3. **QEMU 工具**: 系统需安装有 `qemu-img`（通常随 UTM 或通过 Homebrew `brew install qemu` 安装）。
4. **Rust & Node.js**: 仅开发阶段需要。

## 🏃 快速开始

### 开发环境启动

```bash
# 安装依赖
npm install

# 启动开发服务器和 Tauri 窗口
npm run tauri dev
```

### 构建应用

```bash
# 构建生产版本应用
npm run tauri build
```

## 📂 项目结构

- `src/`: 包含前端 React 应用代码。
- `src-tauri/`: 包含后端 Rust 逻辑，处理磁盘扫描及 QEMU 命令。
  - `src/scanner/`: 虚拟机 bundle 扫描逻辑。
  - `src/qemu/`: `qemu-img` 命令封装与快照解析。
- `conductor/`: 项目协调及自动化辅助工具。

## 📝 推荐 IDE 配置

- [VS Code](https://code.visualstudio.com/) + [Tauri 扩展](https://marketplace.visualstudio.com/items?itemName=tauri-apps.tauri-vscode) + [rust-analyzer](https://marketplace.visualstudio.com/items?itemName=rust-lang.rust-analyzer)
