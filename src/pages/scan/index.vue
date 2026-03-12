<template>
  <view class="scan-page">
    <!-- AR 场景容器 -->
    <view class="ar-container">
      <!-- 使用 camera 组件获取摄像头画面 -->
      <camera
        v-if="showCamera"
        class="camera"
        device-position="back"
        flash="off"
        @ready="onCameraReady"
        @error="onCameraError"
      >
        <!-- 扫描框动画 -->
        <view class="scan-frame">
          <view class="scan-corner scan-tl"></view>
          <view class="scan-corner scan-tr"></view>
          <view class="scan-corner scan-bl"></view>
          <view class="scan-corner scan-br"></view>
          <view class="scan-line" :class="{ scanning: isScanning }"></view>

          <!-- 扫描中心点 -->
          <view class="scan-center">
            <view class="scan-dot"></view>
          </view>
        </view>

        <!-- AR 提示文字 -->
        <view class="ar-hint">
          <text class="hint-text">对准识别图片以开始 AR 体验</text>
        </view>
      </camera>

      <!-- 视频展示层 -->
      <view v-if="isMarkerFound && currentMaterial && currentMaterial.type === 'video'" class="video-overlay">
        <view class="video-container">
          <!-- 先显示一个占位图 -->
          <image
            v-if="!videoLoaded"
            class="video-placeholder"
            :src="'/' + currentMaterial.imageUrl"
            mode="aspectFit"
          />
          <text v-if="!videoLoaded" class="loading-text">正在加载 AR 内容...</text>

          <!-- 视频组件 -->
          <video
            v-show="videoLoaded"
            id="ar-video"
            :src="videoSrc"
            class="ar-video"
            loop
            :autoplay="false"
            controls
            object-fit="contain"
            playsinline
            @play="onVideoPlay"
            @error="onVideoError"
            @loadstart="onVideoLoadStart"
            @loadedmetadata="onVideoLoaded"
            bindplay="onVideoPlay"
            binderror="onVideoError"
          />
          <view class="video-label">
            <text class="label-text">🎬 AR 视频</text>
          </view>
          <view class="video-debug" @tap="testVideo">
            <text class="debug-text">测试播放</text>
          </view>
        </view>
      </view>

      <!-- 3D 模型展示提示 -->
      <view v-if="isMarkerFound && currentMaterial && currentMaterial.type === 'model'" class="model-overlay">
        <view class="model-success-card">
          <view class="success-icon-wrapper">
            <text class="success-icon">✓</text>
          </view>
          <text class="success-title">识别成功！</text>
          <text class="success-subtitle">3D 模型已加载</text>
          <view class="model-info">
            <view class="info-item">
              <text class="info-icon">📍</text>
              <text class="info-text">{{ currentMaterial.name }}</text>
            </view>
            <view class="info-item">
              <text class="info-icon">✓</text>
              <text class="info-text">标记已定位</text>
            </view>
          </view>
        </view>
      </view>
    </view>

    <!-- 顶部操作栏 -->
    <view class="top-bar">
      <view class="back-btn" @tap="goBack">
        <text class="back-text">← 返回</text>
      </view>
      <view class="material-info">
        <text class="material-name">{{ currentMaterial?.name || '未选择素材' }}</text>
        <view class="material-tags">
          <view v-if="currentMaterial" :class="['tag', currentMaterial.type === 'model' ? 'tag-primary' : 'tag-success']">
            <text>{{ currentMaterial.type === 'model' ? '3D 模型' : '视频' }}</text>
          </view>
          <view v-if="isMarkerFound" class="tag tag-success">
            <text>已识别</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 状态指示器 -->
    <view v-if="statusText" class="status-indicator" :class="{ success: isMarkerFound }">
      <text class="status-icon">{{ isMarkerFound ? '✓' : '⟳' }}</text>
      <text class="status-text">{{ statusText }}</text>
    </view>

    <!-- 底部识别图片预览 -->
    <view v-if="currentMaterial" class="bottom-bar">
      <view class="preview-card">
        <view class="preview-image-wrapper">
          <image
            class="preview-image"
            :src="currentMaterial.imageUrl"
            mode="aspectFit"
          />
          <view class="preview-badge">
            <text class="badge-icon">📷</text>
          </view>
        </view>
        <view class="preview-content">
          <text class="preview-title">目标图片</text>
          <text class="preview-desc">将摄像头对准此图片</text>
        </view>
        <view class="refresh-btn" @tap="restartScan">
          <text class="refresh-text">重新扫描</text>
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
import { ref, computed, onMounted, onUnmounted } from 'vue'
import Taro from '@tarojs/taro'
import { useMaterialsStore } from '@/stores/materials'

const materialsStore = useMaterialsStore()

// 当前扫描的素材
const currentMaterial = ref(null)
// 是否显示摄像头
const showCamera = ref(true)
// AR 是否准备就绪
const arReady = ref(false)
// 是否找到标记
const isMarkerFound = ref(false)
// 是否正在扫描
const isScanning = ref(true)
// 状态文本
const statusText = ref('正在初始化...')
// 视频是否已加载
const videoLoaded = ref(false)

// 计算视频路径
const videoSrc = computed(() => {
  if (currentMaterial.value && currentMaterial.value.videoUrl) {
    console.log('视频路径:', currentMaterial.value.videoUrl)
    // 微信小程序中，本地资源路径处理
    return currentMaterial.value.videoUrl
  }
  console.log('使用默认视频路径')
  return '/assets/videos/video-1.mp4'
})

// 视频事件处理
const onVideoPlay = () => {
  console.log('视频开始播放')
}

const onVideoError = (e) => {
  console.error('视频加载错误:', e)
  Taro.showToast({
    title: '视频加载失败',
    icon: 'none',
    duration: 2000
  })
}

const onVideoLoadStart = () => {
  console.log('视频开始加载')
}

const onVideoLoaded = () => {
  console.log('视频元数据加载完成')
  videoLoaded.value = true
}

// 测试视频播放
const testVideo = () => {
  const videoContext = Taro.createVideoContext('ar-video')
  videoContext.play()
  console.log('手动触发视频播放')
}

// 模拟识别计时器
let recognitionTimer = null

// 初始化 xr-frame
const initXRFrame = () => {
  try {
    console.log('初始化 AR 场景')
    setupARScene()
  } catch (error) {
    console.error('初始化 xr-frame 失败:', error)
  }
}

// 设置 AR 场景
const setupARScene = () => {
  console.log('设置 AR 场景')
  startSimulationMode()
}

// 模拟识别模式（用于演示）
const startSimulationMode = () => {
  statusText.value = '请将摄像头对准识别图片'
  isScanning.value = true

  // 模拟 3 秒后识别成功（演示用）
  recognitionTimer = setTimeout(() => {
    isMarkerFound.value = true
    isScanning.value = false
    statusText.value = '识别成功！AR 内容已加载'

    Taro.showToast({
      title: '识别成功！',
      icon: 'success',
      duration: 1500
    })
  }, 3000)
}

// 摄像头准备就绪
const onCameraReady = () => {
  console.log('摄像头准备就绪')
  statusText.value = '摄像头已启动，请对准识别图片'
  arReady.value = true
}

// 摄像头错误
const onCameraError = (e) => {
  console.error('摄像头错误:', e)
  statusText.value = '摄像头启动失败'
  isScanning.value = false
  Taro.showToast({
    title: '摄像头启动失败',
    icon: 'error'
  })
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

// 重新开始扫描
const restartScan = () => {
  isMarkerFound.value = false
  isScanning.value = true
  statusText.value = '请将摄像头对准识别图片'

  if (recognitionTimer) {
    clearTimeout(recognitionTimer)
  }

  recognitionTimer = setTimeout(() => {
    isMarkerFound.value = true
    isScanning.value = false
    statusText.value = '识别成功！AR 内容已加载'

    Taro.showToast({
      title: '识别成功！',
      icon: 'success',
      duration: 1500
    })
  }, 3000)
}

// 初始化
onMounted(() => {
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
            initXRFrame()
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
        initXRFrame()
      }
    }
  })
})

onUnmounted(() => {
  // 清理当前扫描素材
  materialsStore.setCurrentScanMaterial(null)

  // 清除计时器
  if (recognitionTimer) {
    clearTimeout(recognitionTimer)
    recognitionTimer = null
  }
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

.ar-container {
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;
}

.camera {
  width: 100%;
  height: 100%;
}

.scan-frame {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 240px;
  height: 240px;
  z-index: 10;
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
  top: -2px;
  left: -2px;
  border-right: none;
  border-bottom: none;
  border-radius: 6px 0 0 0;
}

.scan-tr {
  top: -2px;
  right: -2px;
  border-left: none;
  border-bottom: none;
  border-radius: 0 6px 0 0;
}

.scan-bl {
  bottom: -2px;
  left: -2px;
  border-right: none;
  border-top: none;
  border-radius: 0 0 0 6px;
}

.scan-br {
  bottom: -2px;
  right: -2px;
  border-left: none;
  border-top: none;
  border-radius: 0 0 6px 0;
}

.scan-center {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 11;
}

.scan-dot {
  width: 8px;
  height: 8px;
  background: #667eea;
  border-radius: 50%;
  box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.3);
}

.scan-line {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(to right, transparent, #667eea, #764ba2, transparent);
  animation: scan 2s linear infinite;
  box-shadow: 0 0 10px rgba(102, 126, 234, 0.8);
}

.scan-line.scanning {
  animation-play-state: running;
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

.ar-hint {
  position: absolute;
  bottom: -36px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 10;
}

.hint-text {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.9);
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.5);
  white-space: nowrap;
}

.video-overlay {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 20;
  animation: scaleIn 0.3s ease-out;
}

@keyframes scaleIn {
  from {
    transform: translate(-50%, -50%) scale(0.8);
    opacity: 0;
  }
  to {
    transform: translate(-50%, -50%) scale(1);
    opacity: 1;
  }
}

.video-container {
  position: relative;
  width: 280px;
  height: 280px;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
  background: #000;
}

.ar-video {
  width: 100%;
  height: 100%;
}

.video-label {
  position: absolute;
  top: 10px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 2;
  padding: 4px 12px;
  background: rgba(0, 0, 0, 0.6);
  border-radius: 12px;
}

.video-placeholder {
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;
  background: #000;
}

.loading-text {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 14px;
  color: #fff;
  text-align: center;
  z-index: 1;
}

.label-text {
  font-size: 12px;
  color: #fff;
}

.video-debug {
  position: absolute;
  bottom: -40px;
  left: 50%;
  transform: translateX(-50%);
  padding: 6px 12px;
  background: rgba(102, 126, 234, 0.9);
  border-radius: 12px;
}

.debug-text {
  font-size: 12px;
  color: #fff;
}

.model-overlay {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 20;
  animation: scaleIn 0.3s ease-out;
}

.model-success-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 28px 20px;
  background: rgba(255, 255, 255, 0.98);
  border-radius: 16px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
  min-width: 240px;
}

.success-icon-wrapper {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: linear-gradient(135deg, #52c41a 0%, #73d13d 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 14px;
  box-shadow: 0 4px 12px rgba(82, 196, 26, 0.3);
}

.success-icon {
  font-size: 36px;
  color: #fff;
  font-weight: 300;
}

.success-title {
  font-size: 18px;
  font-weight: 600;
  color: #52c41a;
  margin-bottom: 6px;
}

.success-subtitle {
  font-size: 13px;
  color: #666;
  margin-bottom: 18px;
}

.model-info {
  width: 100%;
  padding-top: 14px;
  border-top: 1px solid #f0f0f0;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 10px;
}

.info-item:last-child {
  margin-bottom: 0;
}

.info-icon {
  font-size: 14px;
}

.info-text {
  font-size: 13px;
  color: #666;
}

.top-bar {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  display: flex;
  align-items: center;
  padding: 12px 16px;
  background: linear-gradient(to bottom, rgba(0, 0, 0, 0.8), transparent);
  z-index: 100;
  gap: 10px;
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
  position: absolute;
  top: 70px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 100;
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
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 12px 16px;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.85), transparent);
  z-index: 100;
}

.preview-card {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 12px;
  backdrop-filter: blur(10px);
}

.preview-image-wrapper {
  position: relative;
  flex-shrink: 0;
}

.preview-image {
  width: 48px;
  height: 48px;
  border-radius: 6px;
  border: 2px solid #667eea;
  box-shadow: 0 2px 6px rgba(102, 126, 234, 0.3);
}

.preview-badge {
  position: absolute;
  top: -6px;
  right: -6px;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.badge-icon {
  font-size: 10px;
}

.preview-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.preview-title {
  font-size: 13px;
  font-weight: 600;
  color: #333;
}

.preview-desc {
  font-size: 11px;
  color: #999;
}

.refresh-btn {
  flex-shrink: 0;
  padding: 6px 12px;
  background: #667eea;
  border-radius: 16px;
}

.refresh-text {
  font-size: 12px;
  color: #fff;
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
