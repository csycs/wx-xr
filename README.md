# 微信小程序 AR 扫描识别应用

基于 Taro + Vue3 开发的微信小程序，使用微信官方 xr-frame 实现 AR 扫描图片识别功能。

## 功能特性

- 两个 Tab 页面：首页、素材
- 素材管理：支持上传 AR 素材（图片+3D模型 或 图片+视频）
- 本地素材模式：支持从项目文件夹读取素材
- AR 扫描：使用 xr-frame 进行图像识别和 AR 内容展示
- 3D 模型展示：支持 glb/gltf 格式的 3D 模型
- 视频播放：支持视频形式的 AR 内容

## 项目结构

```
wx-xr-app/
├── src/
│   ├── pages/           # 页面
│   │   ├── home/        # 首页
│   │   ├── materials/   # 素材管理页
│   │   └── scan/        # AR 扫描页
│   ├── stores/          # Pinia 状态管理
│   ├── services/        # API 服务
│   ├── config/          # 配置文件
│   │   └── local-materials.ts  # 本地素材配置
│   └── assets/          # 资源文件
│       ├── images/      # 识别图片
│       ├── models/      # 3D 模型文件
│       ├── videos/      # 视频文件
│       └── icons/       # 图标
├── config/              # Taro 配置
└── package.json
```

## 本地素材配置

1. 将识别图片放在 `src/assets/images/` 目录下
2. 将 3D 模型文件放在 `src/assets/models/` 目录下（支持 .glb, .gltf 格式）
3. 将视频文件放在 `src/assets/videos/` 目录下（支持 .mp4 格式）
4. 在 `src/config/local-materials.ts` 中配置素材信息

示例配置：

```typescript
{
  id: 'local-model-1',
  name: '我的 3D 模型',
  type: 'model',
  imageUrl: '/assets/images/my-target.jpg',
  modelUrl: '/assets/models/my-model.glb',
  isLocal: true,
  createdAt: Date.now()
}
```

## 云服务器接口

素材上传和删除的接口已在 `src/services/materials.ts` 中预留，等待后端提供实际的接口信息后实现。

### 需要的接口

1. **上传素材** - `POST /materials`
2. **删除素材** - `DELETE /materials/:id`
3. **获取素材列表** - `GET /materials`
4. **上传文件** - `POST /upload`

## 安装依赖

```bash
npm install
```

## 开发模式

```bash
# 微信小程序
npm run dev:weapp

# H5
npm run dev:h5
```

## 构建

```bash
# 微信小程序
npm run build:weapp

# H5
npm run build:h5
```

## 微信开发者工具

1. 打开微信开发者工具
2. 导入项目，选择 `dist` 目录
3. AppID 使用测试号或自己的 AppID
4. 开启本地设置：ES6 转 ES5、增强编译、使用 npm 模块

## xr-frame 配置

在 `app.config.ts` 中需要配置 xr-frame 相关权限：

```json
{
  "permission": {
    "scope.camera": {
      "desc": "需要使用摄像头进行AR扫描识别"
    }
  }
}
```

## 注意事项

1. xr-frame 需要微信版本 7.0.10 及以上
2. 3D 模型建议使用 glb 格式，体积更小
3. 视频文件建议使用 mp4 格式，H.264 编码
4. 识别图片建议使用清晰、特征明显的图片
5. 首次使用需要授权摄像头权限

## 后续开发

- [ ] 实现云服务器接口对接
- [ ] 添加更多 3D 模型交互功能
- [ ] 优化 AR 识别效果
- [ ] 添加用户反馈功能
- [ ] 添加素材分享功能
