# 快速启动指南

## 项目结构

```
wx-xr-app/
├── config/                     # Taro 配置
│   ├── index.js               # 主配置文件
│   ├── dev.js                 # 开发环境配置
│   └── prod.js                # 生产环境配置
├── docs/                       # 文档
│   └── XR-FRAME-GUIDE.md     # xr-frame 使用指南
├── src/                        # 源代码
│   ├── assets/                # 资源文件
│   │   ├── icons/            # TabBar 图标（需要添加）
│   │   ├── images/           # 识别图片
│   │   ├── models/           # 3D 模型文件
│   │   └── videos/           # 视频文件
│   ├── config/               # 项目配置
│   │   └── local-materials.ts # 本地素材配置
│   ├── pages/                # 页面
│   │   ├── home/            # 首页
│   │   ├── materials/       # 素材管理页
│   │   └── scan/            # AR 扫描页
│   ├── services/            # API 服务
│   │   └── materials.ts     # 素材服务（接口预留）
│   ├── stores/              # Pinia 状态管理
│   │   └── materials.ts     # 素材 Store
│   ├── app.config.ts        # App 配置
│   ├── app.scss             # 全局样式
│   └── app.ts               # App 入口
├── package.json             # 项目依赖
├── tsconfig.json            # TypeScript 配置
└── README.md                # 项目说明
```

## 安装与运行

### 1. 安装依赖

```bash
npm install
```

### 2. 开发模式

```bash
npm run dev:weapp
```

### 3. 微信开发者工具

1. 打开微信开发者工具
2. 导入项目，选择 `dist` 目录
3. AppID 使用测试号或自己的 AppID
4. 开启本地设置：
   - ES6 转 ES5
   - 增强编译
   - 使用 npm 模块
   - 不校验合法域名

## 准备素材

### 本地素材模式

1. 将识别图片放到 `src/assets/images/` 目录
2. 将 3D 模型放到 `src/assets/models/` 目录（.glb 或 .gltf 格式）
3. 将视频放到 `src/assets/videos/` 目录（.mp4 格式）
4. 在 `src/config/local-materials.ts` 中配置素材信息

### TabBar 图标

需要在 `src/assets/icons/` 目录添加以下图标文件：

- `home.png` - 首页图标（未选中）
- `home-active.png` - 首页图标（选中）
- `materials.png` - 素材图标（未选中）
- `materials-active.png` - 素材图标（选中）

建议尺寸：81x81 像素（@3x）

## 功能说明

### 首页

- 展示所有 AR 素材（包括本地和云端）
- 按类型筛选（全部 / 3D 模型 / 视频）
- 点击素材进入 AR 扫描页面

### 素材页

- 查看所有素材列表
- 添加新素材（图片 + 3D模型 / 图片 + 视频）
- 删除云端素材
- 本地素材标记保护（不可删除）

### AR 扫描页

- 使用摄像头进行图像识别
- 识别成功后显示 3D 模型或播放视频
- 实时状态提示
- 预览识别图片

## 云服务器接口

接口已在 `src/services/materials.ts` 中预留，包括：

1. `uploadMaterial()` - 上传素材
2. `deleteMaterial()` - 删除素材
3. `getMaterials()` - 获取素材列表
4. `uploadFile()` - 上传文件

等后端提供接口信息后，在这些方法中实现实际的接口调用。

## xr-frame 配置

详细的 xr-frame 使用说明请参考 `docs/XR-FRAME-GUIDE.md`。

注意：当前实现提供了简化的演示模式（3秒后自动识别成功），用于展示 AR 扫描流程。要实现真实的图像识别，需要：

1. 准备实际的识别图片和 AR 内容
2. 配置 xr-frame 的 marker 和资源
3. 根据微信官方文档实现图像识别

## 注意事项

1. **微信版本要求**：xr-frame 需要微信版本 7.0.10 及以上
2. **摄像头权限**：首次使用需要授权摄像头权限
3. **真机调试**：AR 功能需要在真机上测试
4. **资源大小**：注意控制 3D 模型和视频文件大小
5. **识别图片**：使用清晰、特征明显的图片

## 故障排查

### 小程序无法运行

- 检查是否正确安装依赖
- 确认微信开发者工具配置正确
- 查看控制台错误信息

### 摄像头无法启动

- 检查摄像头权限是否授权
- 确认设备支持摄像头功能

### 素材无法显示

- 检查素材文件路径是否正确
- 确认文件格式是否支持
- 查看控制台是否有错误信息

## 下一步

1. 准备实际的 AR 素材文件
2. 添加 TabBar 图标
3. 配置云服务器接口（如有）
4. 在真机上测试 AR 功能
5. 根据需求优化界面和交互
