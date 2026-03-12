<template>
  <view class="product-card" @click="handleClick">
    <image
      class="product-card__image"
      :src="image"
      mode="aspectFill"
    />

    <view class="product-card__content">
      <text class="product-card__title">{{ title }}</text>

      <view class="product-card__meta">
        <StatusBadge
          v-if="status"
          :type="statusType"
          :text="status"
        />
        <text v-if="time" class="product-card__time">{{ time }}</text>
      </view>

      <view v-if="description" class="product-card__description">
        <text class="product-card__description-text">{{ description }}</text>
      </view>

      <view v-if="price" class="product-card__footer">
        <text class="product-card__price">{{ price }}</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue'
import StatusBadge from './StatusBadge.vue'

defineProps({
  image: {
    type: String,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  status: {
    type: String,
    default: ''
  },
  statusType: {
    type: String,
    default: 'generating'
  },
  time: {
    type: String,
    default: ''
  },
  description: {
    type: String,
    default: ''
  },
  price: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['click'])

const handleClick = () => {
  emit('click')
}
</script>

<style lang="scss" scoped>
@import '@/styles/design-tokens.scss';

.product-card {
  @include card-style();
  overflow: hidden;
  background: $bg-primary;
  cursor: pointer;

  &__image {
    width: 100%;
    height: 160px;
    background: $bg-secondary;
  }

  &__content {
    padding: $spacing-md;
  }

  &__title {
    display: block;
    font-size: $font-size-md;
    font-weight: $font-weight-bold;
    color: $text-primary;
    margin-bottom: $spacing-sm;
    @include text-ellipsis();
  }

  &__meta {
    display: flex;
    align-items: center;
    gap: $spacing-sm;
    margin-bottom: $spacing-sm;
  }

  &__time {
    font-size: $font-size-xs;
    color: $text-tertiary;
  }

  &__description {
    margin-top: $spacing-sm;
    padding-top: $spacing-sm;
    border-top: 1px solid $border-light;
  }

  &__description-text {
    font-size: $font-size-sm;
    color: $text-secondary;
    @include text-ellipsis-multiline(2);
  }

  &__footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: $spacing-sm;
  }

  &__price {
    font-size: $font-size-lg;
    font-weight: $font-weight-bold;
    color: $accent-orange;
  }
}
</style>
