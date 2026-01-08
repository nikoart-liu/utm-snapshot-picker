# Track Spec: 更新应用名称和图标 (Branding Update)

## 目标
将应用的品牌标识从默认的“tauri-app”更新为正式名称“UTM Snapshot Picker”，并配置好图标加载环境。

## 核心任务
1. **统一更名**:
   - `tauri.conf.json`: 将 `productName` 改为 "UTM Snapshot Picker"，并更新 `identifier`（如 `com.utm.snapshot-picker`）。
   - `package.json`: 更新 `name` 和 `description`。
   - `README.md`: 更新主标题。
   - `index.html`: 更新 `<title>` 标签。

2. **图标准备**:
   - 确认图标存放路径：`src-tauri/icons/`。
   - 由于用户选择手动上传，本轨道将仅负责在配置文件中确认图标路径指向正确。

## 验收标准
- [ ] 运行 `npm run tauri dev` 后，应用窗口标题显示为 "UTM Snapshot Picker"。
- [ ] 编译后的二进制文件名反映了新的应用名称。
- [ ] 配置文件中的包标识符已更新，避免与默认模板冲突。
