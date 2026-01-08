# Track Spec: 搭建核心应用框架并实现基础快照列表展示

## 目标
初始化项目结构，建立 Tauri + React + TypeScript 的基础架构，并实现扫描本地 UTM 虚拟机并展示其主磁盘快照列表的功能。

## 核心功能
1. **项目初始化**: 使用 Tauri 模板创建项目，配置 Tailwind CSS。
2. **虚拟机扫描**: 
   - 默认扫描 `~/Library/Containers/com.utmapp.UTM/Data/Documents/`。
   - 实现 Rust 函数列出该目录下所有的 `.utm` 包。
3. **快照信息提取**:
   - 解析 `.utm` 包，定位主磁盘文件（通常是 `Data/Images/disk-0.qcow2`）。
   - 调用 `qemu-img info --output=json <disk_path>` 获取快照信息。
4. **UI 展示**:
   - 展示虚拟机列表。
   - 点击虚拟机后，以分层列表形式展示其快照树（使用 macOS 标准的树状展示风格）。

## 技术细节
- **Tauri**: 负责 Rust 后端与前端 WebView 的安全通信。
- **Rust**: 使用 `std::fs` 扫描目录，使用 `std::process::Command` 异步调用系统中的 `qemu-img` 二进制文件。
- **React**: 构建响应式 UI，通过 TypeScript 确保类型安全。
- **Tailwind CSS**: 实现极简、原生感的 UI 布局。

## 验收标准
- [ ] 能够成功启动应用并显示空的虚拟机列表（如果没有安装 UTM）。
- [ ] 能够识别并列出用户 `Documents` 目录下的所有 UTM 虚拟机。
- [ ] 选中虚拟机后，能够正确解析其 `.qcow2` 镜像并列出已存在的快照。
- [ ] 快照列表应反映出快照的父子继承关系。
