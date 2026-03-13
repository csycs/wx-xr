<template>
  <view class="test-page">
    <text class="title">测试页面</text>
    <view class="content">
      <text class="text">如果你能看到这个文字，说明基本页面工作正常</text>
      <view class="box">测试方块</view>

      <!-- 测试 NutUI 组件 -->
      <view class="nutui-test">
        <nut-button type="primary" @click="handleClick">
          NutUI 按钮
        </nut-button>
        <nut-tag type="primary">标签</nut-tag>
      </view>

      <view class="info">
        <text>Store 材料数量: {{ materialsStore.totalCount }}</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { onMounted } from 'vue'
import Taro from '@tarojs/taro'
import { useMaterialsStore } from '@/stores/materials'

const materialsStore = useMaterialsStore()

const handleClick = () => {
  Taro.showToast({
    title: 'NutUI 按钮点击成功！',
    icon: 'success'
  })
}

onMounted(() => {
  console.log('测试页面加载了')
  materialsStore.loadFromStorage()
  console.log('素材总数:', materialsStore.totalCount)
  console.log('素材列表:', materialsStore.allMaterials)
})
</script>

<style lang="scss" scoped>
.test-page {
  padding: 20px;
  background-color: #f5f5f5;
  min-height: 100vh;
}

.title {
  display: block;
  font-size: 12px;
  font-weight: bold;
  color: #333;
  margin-bottom: 20px;
}

.content {
  padding: 16px;
  background-color: #fff;
  border-radius: 8px;
}

.text {
  display: block;
  font-size: 16px;
  color: #666;
  margin-bottom: 12px;
}

.box {
  width: 100px;
  height: 100px;
  background-color: #667eea;
  margin: 20px 0;
  border-radius: 8px;
}

.nutui-test {
  padding: 20px 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
  align-items: flex-start;
}

.info {
  margin-top: 20px;
  padding: 12px;
  background-color: #f9f9f9;
  border-radius: 4px;

  text {
    display: block;
    font-size: 14px;
    color: #999;
    margin-bottom: 8px;
  }
}
</style>
