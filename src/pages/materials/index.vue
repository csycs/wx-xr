<template>
  <view class="materials-page">
    <!-- 顶部操作栏 -->
    <view class="header">
      <text class="page-title">AR 素材管理</text>
      <nut-button
        type="primary"
        size="small"
        icon="plus"
        @click="showAddDialog = true"
      >
        添加
      </nut-button>
    </view>

    <!-- 分类 Tab -->
    <view class="tabs-wrapper">
      <nut-tabs
        v-model="currentTab"
        type="smile"
        background="#fff"
        color="linear-gradient(to right, #667eea, #764ba2)"
      >
        <nut-tab-pane
          :title="`全部 (${getTabCount('all')})`"
          pane-key="all"
        ></nut-tab-pane>
        <nut-tab-pane
          :title="`3D模型 (${getTabCount('model')})`"
          pane-key="model"
        ></nut-tab-pane>
        <nut-tab-pane
          :title="`视频 (${getTabCount('video')})`"
          pane-key="video"
        ></nut-tab-pane>
      </nut-tabs>
    </view>

    <!-- 素材列表 -->
    <view class="content">
      <nut-cell-group>
        <nut-swipe
          v-for="material in filteredMaterials"
          :key="material.id"
        >
          <nut-cell
            :title="material.name"
            :sub-title="material.type === 'model' ? '3D 模型' : '视频'"
            round
            class="material-cell"
            @click="showMaterialDetail(material)"
          >
            <template #icon>
              <image
                class="cell-icon"
                :src="material.imageUrl"
                mode="aspectFill"
              />
            </template>
            <template #link>
              <nut-space>
                <nut-tag
                  v-if="material.isLocal"
                  type="warning"
                  size="small"
                >
                  本地
                </nut-tag>
                <nut-tag
                  v-else
                  type="success"
                  size="small"
                >
                  云端
                </nut-tag>
              </nut-space>
            </template>
          </nut-cell>
          <template #right>
            <nut-button
              v-if="!material.isLocal"
              type="danger"
              size="small"
              @click="handleDelete(material)"
            >
              删除
            </nut-button>
          </template>
        </nut-swipe>
      </nut-cell-group>

      <!-- 空状态 -->
      <nut-empty
        v-if="filteredMaterials.length === 0"
        description="暂无素材"
        image="empty"
      >
        <template #action>
          <nut-button
            type="primary"
            size="small"
            @click="showAddDialog = true"
          >
            添加素材
          </nut-button>
        </template>
      </nut-empty>
    </view>

    <!-- 添加素材弹窗 -->
    <nut-popup
      v-model:visible="showAddDialog"
      position="bottom"
      :style="{ height: '75%' }"
      round
    >
      <view class="dialog">
        <view class="dialog-header">
          <text class="dialog-title">添加 AR 素材</text>
          <nut-icon
            name="close"
            size="20"
            @click="showAddDialog = false"
          ></nut-icon>
        </view>

        <scroll-view scroll-y class="dialog-body">
          <!-- 素材名称 -->
          <nut-form-item label="素材名称" required>
            <nut-input
              v-model="formData.name"
              placeholder="请输入素材名称"
              maxlength="20"
            />
          </nut-form-item>

          <!-- 素材类型 -->
          <nut-form-item label="素材类型" required>
            <nut-radio-group v-model="formData.type">
              <nut-radio label="model">3D 模型</nut-radio>
              <nut-radio label="video">视频</nut-radio>
            </nut-radio-group>
          </nut-form-item>

          <!-- 识别图片 -->
          <nut-form-item label="识别图片" required>
            <nut-uploader
              v-model="imageFiles"
              :max-file="1"
              accept="image"
              @delete="formData.imageUrl = ''"
              @file-update="onImageChange"
            />
          </nut-form-item>

          <!-- 3D 模型文件 -->
          <nut-form-item
            v-if="formData.type === 'model'"
            label="3D 模型"
            required
          >
            <nut-button
              v-if="!formData.modelUrl"
              size="small"
              type="info"
              @click="chooseModel"
            >
              选择文件
            </nut-button>
            <nut-bar
              v-else
              class="file-bar"
            >
              <text class="file-name">{{ getFileName(formData.modelUrl) }}</text>
              <nut-button
                size="mini"
                type="danger"
                @click="formData.modelUrl = ''"
              >
                删除
              </nut-button>
            </nut-bar>
          </nut-form-item>

          <!-- 视频文件 -->
          <nut-form-item
            v-if="formData.type === 'video'"
            label="视频文件"
            required
          >
            <nut-button
              v-if="!formData.videoUrl"
              size="small"
              type="info"
              @click="chooseVideo"
            >
              选择文件
            </nut-button>
            <nut-bar
              v-else
              class="file-bar"
            >
              <text class="file-name">{{ getFileName(formData.videoUrl) }}</text>
              <nut-button
                size="mini"
                type="danger"
                @click="formData.videoUrl = ''"
              >
                删除
              </nut-button>
            </nut-bar>
          </nut-form-item>
        </scroll-view>

        <view class="dialog-footer">
          <nut-button type="primary" block @click="handleSubmit">
            确定添加
          </nut-button>
        </view>
      </view>
    </nut-popup>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import Taro from '@tarojs/taro'
import { useMaterialsStore } from '@/stores/materials'

const materialsStore = useMaterialsStore()

const currentTab = ref('all')
const showAddDialog = ref(false)
const imageFiles = ref([])

const formData = ref({
  name: '',
  type: 'model',
  imageUrl: '',
  modelUrl: '',
  videoUrl: '',
  isLocal: false
})

// 根据当前标签筛选素材
const filteredMaterials = computed(() => {
  if (currentTab.value === 'all') {
    return materialsStore.allMaterials
  }
  return materialsStore.allMaterials.filter(m => m.type === currentTab.value)
})

// 获取标签数量
const getTabCount = (tab) => {
  if (tab === 'all') {
    return materialsStore.totalCount
  }
  return materialsStore.allMaterials.filter(m => m.type === tab).length
}

// 获取文件名
const getFileName = (path) => {
  const parts = path.split('/')
  return parts[parts.length - 1]
}

// 图片上传回调
const onImageChange = (options) => {
  if (options.file && options.file.path) {
    formData.value.imageUrl = options.file.path
  }
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
const handleSubmit = async () => {
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

  // 添加素材
  materialsStore.addMaterial(formData.value)

  // 重置表单
  formData.value = {
    name: '',
    type: 'model',
    imageUrl: '',
    modelUrl: '',
    videoUrl: '',
    isLocal: false
  }
  imageFiles.value = []

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

<style lang="scss" scoped>
@import '@/styles/design-tokens.scss';

.materials-page {
  min-height: 100vh;
  background-color: $bg-secondary;
  padding-bottom: 40px;
}

// ========== 顶部操作栏 ==========

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: $spacing-lg;
  background: $bg-primary;
  box-shadow: $shadow-sm;
  position: sticky;
  top: 0;
  z-index: $z-index-sticky;
}

.page-title {
  font-size: $font-size-xxl;
  font-weight: $font-weight-bold;
  color: $text-primary;
}

// ========== 标签导航 ==========

.tabs-wrapper {
  position: sticky;
  top: 60px;
  z-index: $z-index-sticky;
  background: $bg-primary;
  box-shadow: $shadow-sm;

  :deep(.nut-tabs__titles) {
    background: $bg-primary;
  }

  :deep(.nut-tabs__titles-item) {
    color: $text-secondary;
    font-size: $font-size-base;
    font-weight: $font-weight-medium;
    padding: $spacing-md 0;

    &.nut-tabs__titles-item--active {
      color: $primary-color;
    }

    .nut-tabs__titles-item__line {
      background: $primary-color;
      height: 3px;
      border-radius: 2px;
    }
  }
}

// ========== 内容区 ==========

.content {
  padding: $spacing-md;
}

.material-cell {
  margin: 0;
  background: $bg-primary;
  border-radius: $radius-md;
  margin-bottom: $spacing-md;
  box-shadow: $shadow-sm;
  overflow: hidden;

  &:last-child {
    margin-bottom: 0;
  }

  :deep(.nut-cell__left) {
    padding: 0;
    margin: 0;
  }

  :deep(.nut-cell) {
    padding: $spacing-md;
    background: transparent;
  }

  :deep(.nut-cell__title) {
    font-size: $font-size-md;
    font-weight: $font-weight-bold;
    color: $text-primary;
    margin-bottom: $spacing-xs;
  }

  :deep(.nut-cell__note) {
    font-size: $font-size-sm;
    color: $text-tertiary;
  }
}

.cell-icon {
  width: 60px;
  height: 60px;
  border-radius: $radius-md;
  margin-right: $spacing-md;
  box-shadow: $shadow-sm;
}

// ========== 添加素材弹窗 ==========

.dialog {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: $bg-primary;
}

.dialog-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: $spacing-lg;
  border-bottom: 1px solid $border-light;
}

.dialog-title {
  font-size: $font-size-xl;
  font-weight: $font-weight-bold;
  color: $text-primary;
}

.dialog-body {
  flex: 1;
  padding: $spacing-lg;
  overflow-y: auto;
}

.dialog-footer {
  padding: $spacing-md $spacing-lg;
  border-top: 1px solid $border-light;
  background: $bg-primary;

  :deep(.nut-button) {
    background: $primary-color;
    border-radius: $radius-md;
    font-weight: $font-weight-medium;
  }
}

// ========== 表单样式 ==========

:deep(.nut-form-item) {
  padding: $spacing-md 0;
  border-bottom: 1px solid $border-light;

  &:last-child {
    border-bottom: none;
  }
}

:deep(.nut-form-item__label) {
  width: 100px;
  font-size: $font-size-base;
  font-weight: $font-weight-medium;
  color: $text-primary;
}

:deep(.nut-input) {
  flex: 1;
  border: 1px solid $border-base;
  border-radius: $radius-md;
  padding: $spacing-sm $spacing-md;
  font-size: $font-size-base;
  background: $bg-secondary;

  &:focus {
    border-color: $primary-color;
    background: $bg-primary;
  }
}

:deep(.nut-radio-group) {
  display: flex;
  gap: $spacing-lg;
}

:deep(.nut-radio) {
  margin-right: 0;

  .nut-radio__label {
    font-size: $font-size-base;
    color: $text-secondary;
  }

  &.nut-radio--checked {
    .nut-radio__label {
      color: $primary-color;
    }
  }
}

.file-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: $spacing-md;
  background: $bg-secondary;
  border-radius: $radius-md;
  border: 1px solid $border-light;
}

.file-name {
  flex: 1;
  font-size: $font-size-sm;
  color: $text-secondary;
  @include text-ellipsis();
  margin-right: $spacing-md;
}

// ========== 标签样式 ==========

:deep(.nut-tag) {
  padding: 2px 8px;
  font-size: $font-size-xs;
  border-radius: $radius-round;
  font-weight: $font-weight-medium;
}

// ========== 空状态 ==========

:deep(.nut-empty) {
  padding: $spacing-xxl 0;

  .nut-empty__description {
    color: $text-secondary;
    font-size: $font-size-base;
  }
}

// ========== 滑动操作 ==========

:deep(.nut-swipe) {
  border-radius: $radius-md;
  overflow: hidden;
  margin-bottom: $spacing-md;
}
</style>
