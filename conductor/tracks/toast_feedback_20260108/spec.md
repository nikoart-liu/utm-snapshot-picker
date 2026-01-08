# Track Spec: 优化快照操作提示与成功反馈

## 目标
提升快照管理功能的交互体验，通过更具指导性的拦截文案和即时的成功反馈（Toast），增强用户操作的确定感和安全性。

## 核心功能
1. **优化拦截提示 (Tooltip Enhancement)**:
   - 场景：当虚拟机处于“正在运行”状态时。
   - 修改点：更新“创建快照”和“回滚快照”按钮的 `title` 属性。
   - 新文案："Please shut down the virtual machine before managing snapshots."（更具指导性）。

2. **添加成功反馈 (Success Feedback)**:
   - 形式：引入 Toast 组件，在操作成功后于界面顶部/底部短暂显示。
   - 触发时机：
     - 创建快照成功。
     - 删除快照成功。
     - 回滚快照成功。
   - 反馈文案示例：
     - "Snapshot '[Name]' created successfully."
     - "Snapshot deleted successfully."
     - "Reverted to snapshot successfully."
   - 持续时间：2秒后自动消失。

3. **Toast 组件设计**:
   - 视觉：符合 macOS 原生风格（轻量、半透明背景、SF Symbols 成功图标）。
   - 交互：非模态，不阻塞用户操作。

## 验收标准
- [ ] 当虚拟机运行时，悬停在禁用按钮上，显示新的指导性提示。
- [ ] 创建快照完成后，界面显示绿色的成功 Toast 并自动消失。
- [ ] 删除和回滚快照完成后，界面显示相应的成功 Toast。
- [ ] Toast 组件应能在不同主题（深色/浅色）下保持良好的可读性。
