# xr-frame 配置指南

## 概述

微信官方 xr-frame 是用于构建 AR/3D 场景的组件，支持图像识别、3D 模型展示、视频播放等功能。

## 官方文档

详细文档请参考：https://developers.weixin.qq.com/miniprogram/dev/platform-capabilities/extended/plus/xr-frame/

## 基础配置

### 1. app.json 配置

在小程序的 app.json 中需要配置：

```json
{
  "permission": {
    "scope.camera": {
      "desc": "需要使用摄像头进行AR扫描识别"
    }
  },
  "requiredPrivateInfos": ["getLocation", "chooseImage"]
}
```

### 2. 引入 xr-frame 组件

在页面配置中声明使用 xr-frame：

```json
{
  "usingComponents": {
    "xr-frame": "xr-frame/index"
  }
}
```

## 图像识别配置

### Marker 模式

用于识别特定图片并显示 AR 内容：

```html
<xr-frame
  id="my-xr"
  width="{{width}}"
  height="{{height}}"
  ar-mode="marker"
  ar-sys-markers="{{markers}}"
>
  <xr-assets>
    <xr-asset-load type="gltf" asset-id="model" src="model.glb" />
  </xr-assets>

  <xr-node>
    <xr-ar-tracker id="tracker" mode="marker" marker-src="target.jpg">
      <xr-gltf model="model" scale="0.1 0.1 0.1" />
    </xr-ar-tracker>
  </xr-node>

  <xr-camera id="camera" position="0 0 0" clear-color="0 0 0 0" />
</xr-frame>
```

## 资源准备

### 识别图片（Marker）

- 使用清晰、特征明显的图片
- 建议分辨率：至少 512x512
- 格式：JPG 或 PNG
- 文件大小：建议不超过 1MB

### 3D 模型

- 支持格式：.glb（推荐）、.gltf
- 模型面数：建议不超过 10 万面
- 文件大小：建议不超过 10MB
- 使用单一模型文件，避免外部依赖

### 视频文件

- 支持格式：.mp4
- 编码：H.264
- 分辨率：建议 720p 或以下
- 文件大小：建议不超过 20MB

## 事件处理

```javascript
// 页面逻辑
Page({
  data: {
    width: 375,
    height: 667,
    markers: {
      type: 'marker',
      markerSrc: '/assets/images/target.jpg'
    }
  },

  onXRReady(e) {
    console.log('xr-frame 准备就绪', e.detail)
  },

  onMarkerFound(e) {
    console.log('识别成功', e.detail)
  },

  onMarkerLost(e) {
    console.log('识别丢失', e.detail)
  },

  onError(e) {
    console.error('xr-frame 错误', e.detail)
  }
})
```

## 常见问题

### 1. xr-frame 组件不显示

- 确认微信版本 >= 7.0.10
- 检查是否正确配置组件路径
- 确认摄像头权限已授权

### 2. 图像识别不成功

- 确保识别图片清晰、特征明显
- 检查 markerSrc 路径是否正确
- 确保光照条件良好

### 3. 3D 模型不显示

- 检查模型文件格式是否正确
- 确认模型缩放比例是否合适
- 检查模型文件路径是否正确

## 本项目实现

当前项目提供了简化的 AR 扫描框架，包含：

1. **模拟模式**：用于演示 AR 识别流程
2. **摄像头集成**：使用 camera 组件获取实时画面
3. **素材管理**：支持本地和云端素材
4. **状态管理**：使用 Pinia 管理素材数据

要实现完整的 xr-frame 图像识别，需要：

1. 准备实际的识别图片和 3D 模型/视频文件
2. 配置 xr-frame 的 marker 和资源
3. 实现真实图像识别算法或使用微信提供的识别能力
4. 测试和优化识别效果

## 下一步

1. 参考微信官方文档了解 xr-frame 详细用法
2. 准备测试素材（识别图片 + 3D模型/视频）
3. 根据实际需求配置 AR 场景
4. 在真机上测试识别效果
