# 社区安全平台 - Assignment 2

这是一个基于 Vue.js 3 的社区安全平台，专注于诈骗防范和社区安全。

## 🚀 已实现的功能

### 类别 D - 基础功能增强

#### D.1 外部认证 (Firebase Auth)
- ✅ 集成 Firebase 认证系统
- ✅ 支持邮箱/密码登录
- ✅ 用户角色管理（管理员、普通用户、医生）
- ✅ 安全的身份验证流程

#### D.2 邮件功能
- ✅ 集成 EmailJS 服务
- ✅ 支持发送带附件的邮件
- ✅ 诈骗举报邮件功能
- ✅ 邮件模板系统

#### D.3 交互式表格数据
- ✅ 自定义 DataTable 组件
- ✅ 支持排序、搜索、分页
- ✅ 每页显示 10 行数据
- ✅ 支持按列搜索
- ✅ 数据导出功能（CSV/PDF）

#### D.4 云端部署
- ✅ Netlify 部署配置
- ✅ 生产环境优化
- ✅ 安全头部配置
- ✅ CDN 加速支持

### 类别 E - 高级功能

#### E.1 云函数
- ✅ Firebase Cloud Functions 集成
- ✅ 诈骗模式识别
- ✅ 社区安全评分计算
- ✅ 用户行为分析
- ✅ 智能通知系统

#### E.2 地理位置功能
- ✅ 交互式地图组件
- ✅ 兴趣点搜索
- ✅ 路线规划功能
- ✅ 地理位置服务
- ✅ 地图数据导出

#### E.3 无障碍性 (WCAG 2.1 AA)
- ✅ 键盘导航支持
- ✅ 屏幕阅读器兼容
- ✅ 高对比度模式
- ✅ 字体大小调节
- ✅ ARIA 标签支持
- ✅ 焦点指示器

#### E.4 数据导出
- ✅ CSV 格式导出
- ✅ PDF 格式导出
- ✅ 自定义导出模板
- ✅ 批量数据导出

## 🛠️ 技术栈

- **前端框架**: Vue.js 3 (Composition API)
- **构建工具**: Vite
- **UI 框架**: Bootstrap 5
- **图标库**: Font Awesome
- **认证服务**: Firebase Auth
- **云函数**: Firebase Cloud Functions
- **邮件服务**: EmailJS
- **地图服务**: Google Maps API (模拟)
- **PDF 生成**: jsPDF
- **表格组件**: 自定义 DataTable

## 📦 安装和运行

### 环境要求
- Node.js 18+
- npm 或 yarn

### 安装依赖
```bash
npm install
```

### 开发环境运行
```bash
npm run dev
```

### 生产环境构建
```bash
npm run build
```

### 代码检查
```bash
npm run lint
```

## 🔧 配置说明

### Firebase 配置
在 `src/firebase/config.js` 中配置你的 Firebase 项目信息：
```javascript
const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  // ... 其他配置
}
```

### EmailJS 配置
在 `src/services/emailService.js` 中配置 EmailJS 服务：
```javascript
const EMAILJS_PUBLIC_KEY = 'your_public_key'
const EMAILJS_SERVICE_ID = 'your_service_id'
const EMAILJS_TEMPLATE_ID = 'your_template_id'
```

## 🌐 部署

### Netlify 部署
1. 将代码推送到 GitHub
2. 在 Netlify 中连接 GitHub 仓库
3. 构建命令：`npm run build`
4. 发布目录：`dist`
5. 自动部署完成

### 其他平台部署
- **Vercel**: 支持 Vue.js 项目，自动部署
- **GitHub Pages**: 需要配置路由重定向
- **AWS S3 + CloudFront**: 静态网站托管

## 📱 响应式设计

- 移动端优先设计
- 支持各种屏幕尺寸
- 触摸友好的交互
- 自适应布局

## 🔒 安全特性

- 输入数据清理
- XSS 防护
- CSRF 保护
- 安全的认证流程
- 内容安全策略 (CSP)

## ♿ 无障碍特性

- WCAG 2.1 AA 标准兼容
- 键盘导航支持
- 屏幕阅读器优化
- 高对比度模式
- 字体大小调节
- 焦点管理

## 📊 性能优化

- 代码分割
- 懒加载组件
- 图片优化
- 缓存策略
- 压缩和最小化

## 🤝 贡献指南

1. Fork 项目
2. 创建功能分支
3. 提交更改
4. 推送到分支
5. 创建 Pull Request

## 📄 许可证

本项目采用 MIT 许可证。

## 📞 联系方式

如有问题或建议，请通过以下方式联系：
- 提交 Issue
- 发送邮件
- 创建 Pull Request

## 🎯 未来计划

- [ ] 实时聊天功能
- [ ] 移动端应用
- [ ] 多语言支持
- [ ] 高级分析报告
- [ ] 机器学习集成
- [ ] 区块链验证

