<template>
  <view class="scan-page">
    <!-- AR 场景容器 - 使用 xr-frame 实现真实识别 -->
    <xr-frame
      id="xr-frame"
      class="xr-frame"
      :width="{{width}}"
      :height="{{height}}"
      :ar="true"
      :ignoreMarkerOnly="true"
    >
      <!-- 识别标记 -->
      <xr-assets>
        <xr-asset-load
          type="video"
          :asset-id="'video-' + currentMaterial?.id"
          :src="'/' + currentMaterial?.videoUrl"
        />
      </xr-assets>

      <!-- AR 相机 -->
      <xr-camera
        :id="'camera-' + currentMaterial?.id"
        :background="cameraConfig.background"
      />

      <!-- 识别图像 - 使用 target-1.jpg 作为识别图 -->
      <xr-mesh
        v-if="currentMaterial && currentMaterial.type === 'video'"
        :id="'video-' + currentMaterial?.id"
        node-id="video-plane"
        :scale="markerScale"
      >
        <xr-video-texture
          :video-id="'video-' + currentMaterial?.id"
        />
      </xr-mesh>

      <!-- 识别追踪 -->
      <xr-tracker
        v-if="currentMaterial"
        :id="'tracker-' + currentMaterial.id"
        :mode="'marker'"
        :src="currentMaterial.imageUrl"
      >
        <xr-mesh
          v-if="currentMaterial.type === 'video'"
          node-id="video-display"
          :scale="videoScale"
          :position="videoPosition"
        >
          <xr-video-texture
            :video-id="'video-' + currentMaterial.id"
            :enable="isMarkerFound"
          />
        </xr-mesh>
      </xr-tracker>
    </xr-frame>

    <!-- 扫描状态提示层 -->
    <view class="ui-layer">
      <!-- 扫描中状态 -->
      <view v-if="!isMarkerFound" class="scan-guide">
        <view class="scan-box">
          <view class="scan-corner scan-tl"></view>
          <view class="scan-corner scan-tr"></view>
          <view class="scan-corner scan-bl"></view>
          <view class="scan-corner scan-br"></view>
          <view class="scan-line" :class="{ scanning: isScanning }"></view>
          <view class="scan-center">
            <view class="scan-dot"></view>
          </view>
        </view>
        <view class="scan-hint">
          <text class="hint-text">将摄像头对准识别图片</text>
        </view>
      </view>

      <!-- 顶部状态栏 -->
      <view class="top-bar">
        <view class="back-btn" @tap="goBack">
          <text class="back-text">← 返回</text>
        </view>
        <view class="material-info">
          <text class="material-name">{{ currentMaterial?.name || '未选择素材' }}</text>
          <view class="material-tags">
            <view v-if="currentMaterial" class="tag tag-primary">
              <text>视频</text>
            </view>
            <view v-if="isMarkerFound" class="tag tag-success">
              <text>已识别</text>
            </view>
          </view>
        </view>
      </view>

      <!-- 状态提示 -->
      <view class="status-indicator" :class="{ success: isMarkerFound }">
        <text class="status-icon">{{ isMarkerFound ? '✓' : '⟳' }}</text>
        <text class="status-text">{{ statusText }}</text>
      </view>

      <!-- 底部参考图 -->
      <view v-if="currentMaterial && !isMarkerFound" class="bottom-bar">
        <view class="reference-card">
          <image
            class="reference-image"
            :src="'/' + currentMaterial.imageUrl"
            mode="aspectFit"
          />
          <view class="reference-info">
            <text class="reference-title">识别图片</text>
            <text class="reference-desc">对准此图片以触发 AR 内容</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 未选择素材提示 -->
    <view v-if="!currentMaterial" class="no-material-overlay">
      <view class="no-material-card">
        <text class="no-material-icon">⚠️</text>
        <text class="no-material-title">未选择素材</text>
        <view class="no-material-actions">
          <view class="action-btn primary" @tap="goBack">
            <text>返回首页</text>
          </view>
          <view class="action-btn" @tap="goToMaterials">
            <text>素材管理</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import Taro from '@tarojs/taro'
import { useMaterialsStore } from '@/stores/materials'

const materialsStore = useMaterialsStore()

// 屏幕尺寸
const width = ref(750)
const height = ref(1334)

// 当前扫描的素材
const currentMaterial = ref(null)
// 是否找到标记
const isMarkerFound = ref(false)
// 是否正在扫描
const isScanning = ref(true)
// 状态文本
const statusText = ref('正在初始化...')

// 相机配置
const cameraConfig = {
  background: {
    color: '#000000'
  }
}

// 标记和视频的缩放
const markerScale = [1, 1, 1]
const videoScale = [0.5, 0.5, 0.5]
const videoPosition = [0, 0, 0]

// 初始化 AR
const initAR = () => {
  if (!currentMaterial.value) {
    return
  }

  console.log('初始化 AR 场景')
  console.log('识别图片:', currentMaterial.value.imageUrl)
  console.log('视频路径:', currentMaterial.value.videoUrl)

  statusText.value = '请将摄像头对准识别图片'
  isScanning.value = true

  // 尝试使用微信小程序的 AR API（如果可用）
  if (Taro.onXRMarkerFound) {
    Taro.onXRMarkerFound(() => {
      console.log('标记识别成功')
      isMarkerFound.value = true
      isScanning.value = false
      statusText.value = '识别成功！AR 内容已加载'

      Taro.showToast({
        title: '识别成功！',
        icon: 'success',
        duration: 1500
      })
    })
  }

  // 备用方案：使用图像识别 API（需要后端支持）
  // 这里先使用模拟方式，等待真实的图像识别实现
  setTimeout(() => {
    // 在真实环境中，这里应该等待图像识别 API 返回结果
    // 目前使用模拟方式以便测试
    console.log('AR 初始化完成，等待识别')
  }, 1000)
}

// 返回上一页
const goBack = () => {
  Taro.navigateBack()
}

// 跳转到素材管理页
const goToMaterials = () => {
  Taro.switchTab({
    url: '/pages/materials-simple/index'
  })
}

// 初始化
onMounted(() => {
  // 获取屏幕尺寸
  const systemInfo = Taro.getSystemInfoSync()
  width.value = systemInfo.windowWidth
  height.value = systemInfo.windowHeight

  // 获取当前扫描的素材
  currentMaterial.value = materialsStore.currentScanMaterial

  if (!currentMaterial.value) {
    statusText.value = '未选择素材'
    return
  }

  console.log('当前扫描素材:', currentMaterial.value)

  // 请求摄像头权限
  Taro.getSetting({
    success: (res) => {
      if (!res.authSetting['scope.camera']) {
        Taro.authorize({
          scope: 'scope.camera',
          success: () => {
            console.log('摄像头权限已获取')
            initAR()
          },
          fail: () => {
            Taro.showModal({
              title: '权限提示',
              content: '需要使用摄像头进行 AR 扫描，请在设置中开启摄像头权限',
              showCancel: false,
              success: (modalRes) => {
                if (modalRes.confirm) {
                  Taro.openSetting()
                }
              }
            })
          }
        })
      } else {
        initAR()
      }
    }
  })
})

onUnmounted(() => {
  // 清理当前扫描素材
  materialsStore.setCurrentScanMaterial(null)
})
</script>

<style lang="scss">
.scan-page {
  width: 100vw;
  height: 100vh;
  position: relative;
  overflow: hidden;
  background-color: #000;
}

.xr-frame {
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;
}

.ui-layer {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  z-index: 100;
}

.scan-guide {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 240px;
  height: 240px;
}

.scan-box {
  position: relative;
  width: 100%;
  height: 100%;
}

.scan-corner {
  position: absolute;
  width: 32px;
  height: 32px;
  border-color: #667eea;
  border-style: solid;
  border-width: 3px;
}

.scan-tl {
  top: 0;
  left: 0;
  border-right: none;
  border-bottom: none;
  border-radius: 6px 0 0 0;
}

.scan-tr {
  top: 0;
  right: 0;
  border-left: none;
  border-bottom: none;
  border-radius: 0 6px 0 0;
}

.scan-bl {
  bottom: 0;
  left: 0;
  border-right: none;
  border-top: none;
  border-radius: 0 0 0 6px;
}

.scan-br {
  bottom: 0;
  right: 0;
  border-left: none;
  border-top: none;
  border-radius: 0 0 6px 0;
}

.scan-center {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.scan-dot {
  width: 8px;
  height: 8px;
  background: #667eea;
  border-radius: 50%;
  box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.3);
  animation: pulse 1.5s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% {
    box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.3);
  }
  50% {
    box-shadow: 0 0 0 12px rgba(102, 126, 234, 0.1);
  }
}

.scan-line {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(to right, transparent, #667eea, #764ba2, transparent);
  box-shadow: 0 0 10px rgba(102, 126, 234, 0.8);
}

.scan-line.scanning {
  animation: scan 2s linear infinite;
}

@keyframes scan {
  0% {
    top: 0;
  }
  50% {
    top: calc(100% - 2px);
  }
  100% {
    top: 0;
  }
}

.scan-hint {
  position: absolute;
  bottom: -36px;
  left: 50%;
  transform: translateX(-50%);
  text-align: center;
}

.hint-text {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.9);
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.5);
  white-space: nowrap;
}

.top-bar {
  pointer-events: auto;
  display: flex;
  align-items: center;
  padding: 12px 16px;
  background: linear-gradient(to bottom, rgba(0, 0, 0, 0.8), transparent);
}

.back-btn {
  flex-shrink: 0;
}

.back-text {
  font-size: 14px;
  color: #fff;
}

.material-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 0;
}

.material-name {
  font-size: 15px;
  font-weight: 600;
  color: #fff;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.material-tags {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.tag {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 11px;
}

.tag-primary {
  background-color: rgba(24, 144, 255, 0.9);
  color: #fff;
}

.tag-success {
  background-color: rgba(82, 196, 26, 0.9);
  color: #fff;
}

.status-indicator {
  pointer-events: auto;
  position: absolute;
  top: 70px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.status-indicator.success {
  background: #52c41a;
}

.status-icon {
  font-size: 14px;
  color: #fff;
}

.status-text {
  font-size: 12px;
  color: #fff;
  font-weight: 500;
}

.bottom-bar {
  pointer-events: auto;
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 12px 16px;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.85), transparent);
}

.reference-card {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 12px;
  backdrop-filter: blur(10px);
}

.reference-image {
  width: 48px;
  height: 48px;
  border-radius: 6px;
  border: 2px solid #667eea;
  box-shadow: 0 2px 6px rgba(102, 126, 234, 0.3);
  flex-shrink: 0;
}

.reference-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.reference-title {
  font-size: 13px;
  font-weight: 600;
  color: #333;
}

.reference-desc {
  font-size: 11px;
  color: #999;
}

.no-material-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.85);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.no-material-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 32px 24px;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 16px;
  backdrop-filter: blur(10px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
}

.no-material-icon {
  font-size: 48px;
  margin-bottom: 12px;
}

.no-material-title {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin-bottom: 20px;
}

.no-material-actions {
  display: flex;
  gap: 12px;
}

.action-btn {
  padding: 10px 20px;
  border-radius: 20px;
  border: 1px solid #ddd;
}

.action-btn.primary {
  background: #667eea;
  border-color: #667eea;
}

.action-btn text,
.action-btn.primary text {
  font-size: 14px;
}

.action-btn text {
  color: #333;
}

.action-btn.primary text {
  color: #fff;
}
</style>
