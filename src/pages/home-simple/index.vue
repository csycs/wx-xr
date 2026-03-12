<template>
  <view class="home-page">
    <!-- 顶部标题区 -->
    <view class="header">
      <text class="title">AR 扫描识别</text>
      <text class="subtitle">探索增强现实的无限可能</text>
    </view>

    <!-- 分类 Tab -->
    <view class="tabs-wrapper">
      <scroll-view scroll-x class="tabs-scroll">
        <view class="tabs">
          <view
            v-for="tab in tabs"
            :key="tab.key"
            :class="['tab-item', { active: currentTab === tab.key }]"
            @tap="currentTab = tab.key"
          >
            <text class="tab-text">{{ tab.label }}</text>
          </view>
        </view>
      </scroll-view>
    </view>

    <!-- 素材列表 -->
    <view class="content">
      <view
        v-for="material in filteredMaterials"
        :key="material.id"
        class="material-item"
        hover-class="material-item-hover"
        @tap="handleScan(material)"
      >
        <image
          class="material-thumb"
          :src="material.imageUrl"
          mode="aspectFill"
        />
        <view class="material-info">
          <text class="material-name">{{ material.name }}</text>
          <view class="material-meta">
            <view :class="['tag', material.type === 'model' ? 'tag-primary' : 'tag-success']">
              <text>{{ material.type === 'model' ? '3D' : '视频' }}</text>
            </view>
            <view v-if="material.isLocal" class="tag tag-local">
              <text>本地</text>
            </view>
          </view>
        </view>
        <view class="material-arrow">
          <text class="arrow">›</text>
        </view>
      </view>

      <!-- 空状态 -->
      <view v-if="filteredMaterials.length === 0" class="empty">
        <text class="empty-icon">📦</text>
        <text class="empty-text">暂无素材</text>
        <view class="empty-btn" @tap="goToMaterials">
          <text>添加素材</text>
        </view>
      </view>
    </view>

    <!-- 使用指南 -->
    <view class="guide">
      <view class="guide-header">
        <text class="guide-title">使用指南</text>
      </view>
      <view class="guide-list">
        <view class="guide-item">
          <view class="guide-icon">📱</view>
          <view class="guide-content">
            <text class="guide-step">选择素材</text>
            <text class="guide-desc">从列表中选择一个 AR 素材</text>
          </view>
        </view>
        <view class="guide-item">
          <view class="guide-icon">📷</view>
          <view class="guide-content">
            <text class="guide-step">扫描图片</text>
            <text class="guide-desc">将摄像头对准识别图片</text>
          </view>
        </view>
        <view class="guide-item">
          <view class="guide-icon">✨</view>
          <view class="guide-content">
            <text class="guide-step">查看效果</text>
            <text class="guide-desc">识别成功后查看 AR 内容</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import Taro from '@tarojs/taro'
import { useMaterialsStore } from '@/stores/materials'

const materialsStore = useMaterialsStore()
const currentTab = ref('all')

const tabs = computed(() => [
  { key: 'all', label: '全部' },
  { key: 'model', label: '3D模型' },
  { key: 'video', label: '视频' }
])

// 根据分类筛选素材
const filteredMaterials = computed(() => {
  if (currentTab.value === 'all') {
    return materialsStore.allMaterials
  }
  return materialsStore.allMaterials.filter(m => m.type === currentTab.value)
})

// 处理扫描
const handleScan = (material) => {
  materialsStore.setCurrentScanMaterial(material)
  Taro.navigateTo({
    url: '/pages/scan/index'
  })
}

// 跳转到素材页
const goToMaterials = () => {
  Taro.switchTab({
    url: '/pages/materials-simple/index'
  })
}

onMounted(() => {
  materialsStore.loadFromStorage()
})
</script>

<style lang="scss">
.home-page {
  min-height: 100vh;
  background-color: #f5f5f5;
}

.header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 50px 16px 20px;
}

.title {
  display: block;
  font-size: 22px;
  font-weight: 600;
  color: #fff;
  margin-bottom: 4px;
}

.subtitle {
  display: block;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.8);
}

.tabs-wrapper {
  background: #fff;
  position: sticky;
  top: 0;
  z-index: 100;
  border-bottom: 1px solid #eee;
}

.tabs-scroll {
  white-space: nowrap;
}

.tabs {
  display: flex;
  flex-direction: row;
}

.tab-item {
  padding: 12px 20px;
  position: relative;
  transition: all 0.3s;
}

.tab-item.active .tab-text {
  color: #667eea;
  font-weight: 600;
}

.tab-item.active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 20px;
  height: 2px;
  background: #667eea;
  border-radius: 1px;
}

.tab-text {
  font-size: 14px;
  color: #333;
}

.content {
  padding: 8px 12px;
}

.material-item {
  display: flex;
  align-items: center;
  padding: 12px;
  background: #fff;
  border-radius: 8px;
  margin-bottom: 8px;
}

.material-item-hover {
  background-color: #f8f8f8;
}

.material-thumb {
  width: 48px;
  height: 48px;
  border-radius: 6px;
  overflow: hidden;
  flex-shrink: 0;
  margin-right: 10px;
  background-color: #f0f0f0;
}

.material-info {
  flex: 1;
  min-width: 0;
}

.material-name {
  display: block;
  font-size: 15px;
  font-weight: 500;
  color: #333;
  margin-bottom: 6px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.material-meta {
  display: flex;
  flex-direction: row;
  gap: 6px;
}

.tag {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 11px;
  line-height: 1.4;
}

.tag-primary {
  background-color: #e8f4ff;
  color: #1890ff;
}

.tag-success {
  background-color: #f0f9ff;
  color: #07c160;
}

.tag-local {
  background-color: #fff7e6;
  color: #ff9500;
}

.material-arrow {
  flex-shrink: 0;
  margin-left: 8px;
}

.arrow {
  font-size: 20px;
  color: #ccc;
}

.empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 60px 20px;
}

.empty-icon {
  font-size: 64px;
  margin-bottom: 12px;
  opacity: 0.5;
}

.empty-text {
  font-size: 14px;
  color: #999;
  margin-bottom: 16px;
}

.empty-btn {
  padding: 8px 20px;
  background: #667eea;
  border-radius: 20px;
}

.empty-btn text {
  font-size: 14px;
  color: #fff;
}

.guide {
  margin: 8px 12px 16px;
  background: #fff;
  border-radius: 8px;
  overflow: hidden;
}

.guide-header {
  padding: 12px 16px;
  border-bottom: 1px solid #f0f0f0;
}

.guide-title {
  font-size: 14px;
  font-weight: 600;
  color: #333;
}

.guide-list {
  padding: 8px 0;
}

.guide-item {
  display: flex;
  align-items: center;
  padding: 10px 16px;
}

.guide-icon {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f8f8f8;
  border-radius: 6px;
  font-size: 18px;
  margin-right: 10px;
  flex-shrink: 0;
}

.guide-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.guide-step {
  font-size: 14px;
  font-weight: 500;
  color: #333;
}

.guide-desc {
  font-size: 12px;
  color: #999;
}
</style>
