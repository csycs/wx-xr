<template>
  <view class="materials-page">
    <!-- 顶部操作栏 -->
    <view class="header">
      <text class="page-title">AR 素材管理</text>
      <view class="add-btn" @tap="showAddDialog = true">
        <text>添加</text>
      </view>
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
            <text class="tab-count">({{ tab.count }})</text>
          </view>
        </view>
      </scroll-view>
    </view>

    <!-- 素材列表 -->
    <view class="content">
      <view
        v-for="material in filteredMaterials"
        :key="material.id"
        class="material-card"
      >
        <view class="material-main" @tap="showMaterialDetail(material)">
          <image
            class="material-thumb"
            :src="material.imageUrl"
            mode="aspectFill"
          />
          <view class="material-info">
            <text class="material-name">{{ material.name }}</text>
            <text class="material-type">{{ material.type === 'model' ? '3D 模型' : '视频' }}</text>
          </view>
          <view class="material-tag" :class="material.isLocal ? 'tag-local' : 'tag-cloud'">
            <text>{{ material.isLocal ? '本地' : '云端' }}</text>
          </view>
        </view>
        <view v-if="!material.isLocal" class="material-action" @tap="handleDelete(material)">
          <text class="delete-text">删除</text>
        </view>
      </view>

      <!-- 空状态 -->
      <view v-if="filteredMaterials.length === 0" class="empty">
        <text class="empty-icon">📦</text>
        <text class="empty-text">暂无素材</text>
        <view class="empty-btn" @tap="showAddDialog = true">
          <text>添加素材</text>
        </view>
      </view>
    </view>

    <!-- 添加素材弹窗 -->
    <view v-if="showAddDialog" class="dialog-mask" @tap="showAddDialog = false">
      <view class="dialog" @tap.stop>
        <view class="dialog-header">
          <text class="dialog-title">添加 AR 素材</text>
          <view class="close-btn" @tap="showAddDialog = false">
            <text>×</text>
          </view>
        </view>

        <scroll-view scroll-y class="dialog-body">
          <!-- 素材名称 -->
          <view class="form-group">
            <text class="form-label">素材名称</text>
            <input
              v-model="formData.name"
              class="form-input"
              placeholder="请输入素材名称"
              maxlength="20"
            />
          </view>

          <!-- 素材类型 -->
          <view class="form-group">
            <text class="form-label">素材类型</text>
            <view class="radio-group">
              <view
                :class="['radio-item', { active: formData.type === 'model' }]"
                @tap="formData.type = 'model'"
              >
                <view class="radio-icon">
                  <view v-if="formData.type === 'model'" class="radio-dot"></view>
                </view>
                <text>3D 模型</text>
              </view>
              <view
                :class="['radio-item', { active: formData.type === 'video' }]"
                @tap="formData.type = 'video'"
              >
                <view class="radio-icon">
                  <view v-if="formData.type === 'video'" class="radio-dot"></view>
                </view>
                <text>视频</text>
              </view>
            </view>
          </view>

          <!-- 识别图片 -->
          <view class="form-group">
            <text class="form-label required">识别图片</text>
            <view class="upload-area" @tap="chooseImage">
              <image
                v-if="formData.imageUrl"
                class="preview-img"
                :src="formData.imageUrl"
                mode="aspectFill"
              />
              <view v-else class="upload-placeholder">
                <text class="upload-icon">+</text>
                <text class="upload-text">选择图片</text>
              </view>
            </view>
          </view>

          <!-- 3D 模型文件 -->
          <view v-if="formData.type === 'model'" class="form-group">
            <text class="form-label required">3D 模型</text>
            <view v-if="!formData.modelUrl" class="file-btn" @tap="chooseModel">
              <text>选择文件</text>
            </view>
            <view v-else class="file-info">
              <text class="file-name">{{ getFileName(formData.modelUrl) }}</text>
              <view class="file-delete" @tap="formData.modelUrl = ''">
                <text>删除</text>
              </view>
            </view>
          </view>

          <!-- 视频文件 -->
          <view v-if="formData.type === 'video'" class="form-group">
            <text class="form-label required">视频文件</text>
            <view v-if="!formData.videoUrl" class="file-btn" @tap="chooseVideo">
              <text>选择文件</text>
            </view>
            <view v-else class="file-info">
              <text class="file-name">{{ getFileName(formData.videoUrl) }}</text>
              <view class="file-delete" @tap="formData.videoUrl = ''">
                <text>删除</text>
              </view>
            </view>
          </view>
        </scroll-view>

        <view class="dialog-footer">
          <view class="submit-btn" @tap="handleSubmit">
            <text>确定添加</text>
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
const showAddDialog = ref(false)

const formData = ref({
  name: '',
  type: 'model',
  imageUrl: '',
  modelUrl: '',
  videoUrl: '',
  isLocal: false
})

const tabs = computed(() => [
  { key: 'all', label: '全部', count: materialsStore.totalCount },
  { key: 'model', label: '3D模型', count: materialsStore.allMaterials.filter(m => m.type === 'model').length },
  { key: 'video', label: '视频', count: materialsStore.allMaterials.filter(m => m.type === 'video').length }
])

// 根据当前标签筛选素材
const filteredMaterials = computed(() => {
  if (currentTab.value === 'all') {
    return materialsStore.allMaterials
  }
  return materialsStore.allMaterials.filter(m => m.type === currentTab.value)
})

// 获取文件名
const getFileName = (path) => {
  const parts = path.split('/')
  return parts[parts.length - 1]
}

// 选择图片
const chooseImage = () => {
  Taro.chooseImage({
    count: 1,
    sizeType: ['compressed'],
    sourceType: ['album', 'camera'],
    success: (res) => {
      formData.value.imageUrl = res.tempFilePaths[0]
    }
  })
}

// 选择 3D 模型文件
const chooseModel = () => {
  Taro.chooseMessageFile({
    count: 1,
    type: 'file',
    extension: ['glb', 'gltf'],
    success: (res) => {
      formData.value.modelUrl = res.tempFiles[0].path
    }
  })
}

// 选择视频文件
const chooseVideo = () => {
  Taro.chooseVideo({
    sourceType: ['album', 'camera'],
    maxDuration: 60,
    camera: 'back',
    success: (res) => {
      formData.value.videoUrl = res.tempFilePath
    }
  })
}

// 显示素材详情
const showMaterialDetail = (material) => {
  Taro.showModal({
    title: material.name,
    content: `类型: ${material.type === 'model' ? '3D 模型' : '视频'}\n来源: ${material.isLocal ? '本地' : '云端'}`,
    showCancel: false
  })
}

// 处理表单提交
const handleSubmit = () => {
  if (!formData.value.name) {
    Taro.showToast({
      title: '请输入素材名称',
      icon: 'none'
    })
    return
  }

  if (!formData.value.imageUrl) {
    Taro.showToast({
      title: '请选择识别图片',
      icon: 'none'
    })
    return
  }

  if (formData.value.type === 'model' && !formData.value.modelUrl) {
    Taro.showToast({
      title: '请选择 3D 模型文件',
      icon: 'none'
    })
    return
  }

  if (formData.value.type === 'video' && !formData.value.videoUrl) {
    Taro.showToast({
      title: '请选择视频文件',
      icon: 'none'
    })
    return
  }

  materialsStore.addMaterial(formData.value)

  formData.value = {
    name: '',
    type: 'model',
    imageUrl: '',
    modelUrl: '',
    videoUrl: '',
    isLocal: false
  }

  showAddDialog.value = false

  Taro.showToast({
    title: '添加成功',
    icon: 'success'
  })
}

// 处理删除
const handleDelete = (material) => {
  Taro.showModal({
    title: '确认删除',
    content: `确定要删除 "${material.name}" 吗？`,
    success: (res) => {
      if (res.confirm && material.id) {
        materialsStore.deleteMaterial(material.id)
        Taro.showToast({
          title: '删除成功',
          icon: 'success'
        })
      }
    }
  })
}

onMounted(() => {
  materialsStore.loadFromStorage()
})
</script>

<style lang="scss">
.materials-page {
  min-height: 100vh;
  background-color: #f5f5f5;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: #fff;
  border-bottom: 1px solid #eee;
}

.page-title {
  font-size: 17px;
  font-weight: 600;
  color: #333;
}

.add-btn {
  padding: 6px 16px;
  background: #667eea;
  border-radius: 16px;
}

.add-btn text {
  font-size: 14px;
  color: #fff;
}

.tabs-wrapper {
  background: #fff;
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
  padding: 12px 16px;
  position: relative;
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
  width: 16px;
  height: 2px;
  background: #667eea;
  border-radius: 1px;
}

.tab-text {
  font-size: 14px;
  color: #333;
}

.tab-count {
  font-size: 12px;
  color: #999;
  margin-left: 2px;
}

.content {
  padding: 8px 12px;
}

.material-card {
  background: #fff;
  border-radius: 8px;
  margin-bottom: 8px;
  overflow: hidden;
}

.material-main {
  display: flex;
  align-items: center;
  padding: 12px;
}

.material-thumb {
  width: 48px;
  height: 48px;
  border-radius: 6px;
  margin-right: 10px;
  background-color: #f0f0f0;
}

.material-info {
  flex: 1;
}

.material-name {
  display: block;
  font-size: 15px;
  font-weight: 500;
  color: #333;
  margin-bottom: 4px;
}

.material-type {
  display: block;
  font-size: 12px;
  color: #999;
}

.material-tag {
  padding: 3px 8px;
  border-radius: 4px;
  font-size: 11px;
}

.material-tag text {
  font-size: 11px;
}

.tag-local {
  background-color: #fff7e6;
  color: #ff9500;
}

.tag-cloud {
  background-color: #e8f4ff;
  color: #1890ff;
}

.material-action {
  padding: 10px 12px;
  border-top: 1px solid #f0f0f0;
  text-align: center;
}

.delete-text {
  font-size: 14px;
  color: #ff4d4f;
}

.empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 60px 20px;
}

.empty-icon {
  font-size: 32px;
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

.dialog-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1000;
  display: flex;
  align-items: flex-end;
}

.dialog {
  width: 100%;
  max-height: 75%;
  background: #fff;
  border-radius: 16px 16px 0 0;
  display: flex;
  flex-direction: column;
}

.dialog-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid #f0f0f0;
}

.dialog-title {
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.close-btn {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-btn text {
  font-size: 14px;
  color: #999;
  line-height: 1;
}

.dialog-body {
  flex: 1;
  padding: 16px;
  overflow-y: auto;
}

.form-group {
  margin-bottom: 20px;
}

.form-label {
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: #333;
  margin-bottom: 8px;
}

.form-label.required::after {
  content: ' *';
  color: #ff4d4f;
}

.form-input {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  background: #fff;
}

.radio-group {
  display: flex;
  flex-direction: row;
  gap: 24px;
}

.radio-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.radio-icon {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  border: 2px solid #ddd;
  display: flex;
  align-items: center;
  justify-content: center;
}

.radio-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #667eea;
}

.radio-item text {
  font-size: 14px;
  color: #333;
}

.upload-area {
  width: 80px;
  height: 80px;
  border-radius: 6px;
  overflow: hidden;
}

.preview-img {
  width: 100%;
  height: 100%;
}

.upload-placeholder {
  width: 100%;
  height: 100%;
  border: 1px dashed #ddd;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: #f8f8f8;
}

.upload-icon {
  font-size: 14px;
  color: #ccc;
}

.upload-text {
  font-size: 11px;
  color: #999;
  margin-top: 4px;
}

.file-btn {
  display: inline-block;
  padding: 8px 16px;
  background: #f0f0f0;
  border-radius: 6px;
}

.file-btn text {
  font-size: 14px;
  color: #333;
}

.file-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 12px;
  background: #f8f8f8;
  border-radius: 6px;
}

.file-name {
  flex: 1;
  font-size: 13px;
  color: #666;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  margin-right: 12px;
}

.file-delete text {
  font-size: 13px;
  color: #ff4d4f;
}

.dialog-footer {
  padding: 12px 16px;
  border-top: 1px solid #f0f0f0;
}

.submit-btn {
  width: 100%;
  padding: 12px;
  background: #667eea;
  border-radius: 8px;
  text-align: center;
}

.submit-btn text {
  font-size: 16px;
  font-weight: 600;
  color: #fff;
}
</style>
