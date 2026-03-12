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
            @tap="handleTabChange(tab.key)"
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
        @tap="handleScan(material)"
      >
        <image
          class="material-thumb"
          :src="material.imageUrl"
          mode="aspectFill"
        />
        <view class="material-detail">
          <text class="material-name">{{ material.name }}</text>
          <view class="material-tags">
            <view :class="['tag', material.type === 'model' ? 'tag-primary' : 'tag-success']">
              <text>{{ material.type === 'model' ? '3D' : '视频' }}</text>
            </view>
            <view v-if="material.isLocal" class="tag tag-warning">
              <text>本地</text>
            </view>
          </view>
        </view>
      </view>

      <!-- 空状态 -->
      <view v-if="filteredMaterials.length === 0" class="empty">
        <text class="empty-text">暂无素材</text>
        <view class="empty-btn" @tap="goToMaterials">
          <text>添加素材</text>
        </view>
      </view>
    </view>

    <!-- 使用指南 -->
    <view class="guide">
      <view class="guide-title">💡 使用指南</view>
      <view class="guide-list">
        <view class="guide-item">
          <view class="guide-icon">1</view>
          <view class="guide-content">
            <text class="guide-step">选择素材</text>
            <text class="guide-desc">从列表中选择一个 AR 素材</text>
          </view>
        </view>
        <view class="guide-item">
          <view class="guide-icon">2</view>
          <view class="guide-content">
            <text class="guide-step">扫描图片</text>
            <text class="guide-desc">将摄像头对准识别图片</text>
          </view>
        </view>
        <view class="guide-item">
          <view class="guide-icon">3</view>
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

const tabs = [
  { key: 'all', label: '全部' },
  { key: 'model', label: '3D模型' },
  { key: 'video', label: '视频' }
]

// 根据分类筛选素材
const filteredMaterials = computed(() => {
  if (currentTab.value === 'all') {
    return materialsStore.allMaterials
  }
  return materialsStore.allMaterials.filter(m => m.type === currentTab.value)
})

// 处理标签切换
const handleTabChange = (key) => {
  currentTab.value = key
}

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

<style lang="scss" scoped>
@import '@/styles/design-tokens.scss';

.home-page {
  min-height: 100vh;
  background-color: $bg-secondary;
  padding-bottom: 80px;
}

// ========== 顶部标题区 ==========

.header {
  background: $bg-primary;
  padding: $spacing-xxl $spacing-lg $spacing-lg;
  text-align: center;
  position: relative;
  border-bottom: 1px solid $border-light;
}

.title {
  display: block;
  font-size: $font-size-xl;
  font-weight: $font-weight-bold;
  color: $text-primary;
  margin-bottom: $spacing-xs;
}

.subtitle {
  display: block;
  font-size: $font-size-sm;
  color: $text-secondary;
}

// ========== 标签导航 ==========

.tabs-wrapper {
  position: sticky;
  top: 0;
  z-index: $z-index-sticky;
  background: $bg-primary;
  box-shadow: $shadow-sm;
}

.tabs-scroll {
  white-space: nowrap;
}

.tabs {
  display: flex;
  flex-direction: row;
}

.tab-item {
  padding: $spacing-md $spacing-lg;
  position: relative;
  transition: all 0.3s;
}

.tab-item.active .tab-text {
  color: $primary-color;
  font-weight: $font-weight-bold;
}

.tab-item.active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 20px;
  height: 3px;
  background: $primary-color;
  border-radius: 2px;
}

.tab-text {
  font-size: $font-size-base;
  color: $text-secondary;
}

// ========== 内容区 ==========

.content {
  padding: $spacing-md;
}

// 素材列表
.material-item {
  display: flex;
  align-items: center;
  padding: $spacing-md;
  background: $bg-primary;
  border-radius: $radius-md;
  margin-bottom: $spacing-md;
  box-shadow: $shadow-sm;

  &:last-child {
    margin-bottom: 0;
  }
}

.material-thumb {
  width: 70px;
  height: 70px;
  border-radius: $radius-md;
  overflow: hidden;
  flex-shrink: 0;
  margin-right: $spacing-md;
  background-color: $bg-secondary;
}

.material-detail {
  flex: 1;
  min-width: 0;
}

.material-name {
  display: block;
  font-size: $font-size-md;
  font-weight: $font-weight-bold;
  color: $text-primary;
  margin-bottom: $spacing-sm;
  @include text-ellipsis();
}

.material-tags {
  display: flex;
  gap: $spacing-sm;
  flex-wrap: wrap;
}

.tag {
  display: inline-block;
  padding: 2px 8px;
  border-radius: $radius-round;
  font-size: $font-size-xs;
  font-weight: $font-weight-medium;
  line-height: 1.4;
}

.tag-primary {
  background-color: #E3F2FD;
  color: #2196F3;
}

.tag-success {
  background-color: #E8F5E9;
  color: #4CAF50;
}

.tag-warning {
  background-color: #FFF8E1;
  color: #FFC107;
}

// 空状态
.empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 60px 20px;
}

.empty-text {
  font-size: $font-size-base;
  color: $text-secondary;
  margin-bottom: $spacing-lg;
}

.empty-btn {
  padding: $spacing-sm $spacing-lg;
  background: $primary-color;
  border-radius: 20px;
}

.empty-btn text {
  font-size: $font-size-base;
  color: #fff;
}

// 使用指南
.guide {
  margin: $spacing-md;
  padding: $spacing-xl;
  background: $bg-primary;
  border-radius: $radius-lg;
  box-shadow: $shadow-sm;
}

.guide-title {
  font-size: $font-size-lg;
  font-weight: $font-weight-bold;
  color: $text-primary;
  margin-bottom: $spacing-lg;
}

.guide-list {
  padding: $spacing-sm 0;
}

.guide-item {
  display: flex;
  align-items: flex-start;
  padding: $spacing-md 0;
}

.guide-icon {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: $primary-color;
  color: #fff;
  border-radius: $radius-round;
  font-size: $font-size-xs;
  font-weight: $font-weight-bold;
  margin-right: $spacing-md;
  flex-shrink: 0;
}

.guide-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: $spacing-xs;
}

.guide-step {
  font-size: $font-size-base;
  font-weight: $font-weight-medium;
  color: $text-primary;
}

.guide-desc {
  font-size: $font-size-sm;
  color: $text-secondary;
}
</style>
