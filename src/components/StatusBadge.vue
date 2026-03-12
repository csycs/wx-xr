<template>
  <view :class="['status-badge', `status-badge--${type}`]">
    <text class="status-badge__text">{{ text }}</text>
  </view>
</template>

<script setup>
import { defineProps } from 'vue'

defineProps({
  type: {
    type: String,
    default: 'generating',
    validator: (value) => ['generating', 'queueing', 'success', 'warning'].includes(value)
  },
  text: {
    type: String,
    required: true
  }
})
</script>

<style lang="scss" scoped>
@import '@/styles/design-tokens.scss';

.status-badge {
  display: inline-flex;
  align-items: center;
  padding: $spacing-xs $spacing-sm;
  border-radius: $radius-round;
  font-size: $font-size-xs;
  font-weight: $font-weight-medium;
  white-space: nowrap;

  &__text {
    line-height: 1;
  }

  // 生成中状态
  &--generating {
    background: $status-generating-bg;
    color: $status-generating-text;
  }

  // 排队中状态
  &--queueing {
    background: $status-queueing-bg;
    color: $status-queueing-text;
  }

  // 成功状态
  &--success {
    background: $status-success-bg;
    color: $status-success-text;
  }

  // 警告状态
  &--warning {
    background: $status-warning-bg;
    color: $status-warning-text;
  }
}
</style>
