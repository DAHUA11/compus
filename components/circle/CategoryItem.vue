<template>
  <view 
    class="category-item flex items-center clickable-mp mp-animation" 
    :class="{ active: isActive }"
    @tap="$emit('switch')"
  >
    <text class="category-icon iconfont" :class="icon"></text>
    <text class="category-text">{{ name }}</text>
  </view>
</template>

<script>
export default {
  name: 'CategoryItem',
  props: {
    name: {
      type: String,
      required: true
    },
    icon: {
      type: String,
      required: true
    },
    isActive: {
      type: Boolean,
      default: false
    }
  }
}
</script>

<style lang="scss">
@import '@/styles/variables.scss';

.category-item {
  padding: $spacing-sm $spacing-lg;
  margin-right: $spacing-base;
  border-radius: $border-radius-lg;
  background-color: rgba(0, 0, 0, 0.03);
  transition: all $transition-fast;
  /* 确保高度一致 */
  height: 64rpx;
  box-sizing: border-box;
  /* 确保文字和图标垂直居中 */
  display: flex;
  align-items: center;
  justify-content: center;
  /* 确保点击区域足够大 */
  min-width: 120rpx;
}

.category-item.active {
  background-color: $primary-color;
  color: $white;
  transform: scale(1);
  font-weight: 500;
  box-shadow: 0 2rpx 8rpx rgba(77, 124, 191, 0.25);
}

.category-item-active {
  opacity: 0.8;
  transform: scale(0.98);
}

.category-icon {
  margin-right: $spacing-xs;
  font-size: $font-size-base;
  line-height: 1;
}

.category-text {
  line-height: 1;
  font-size: $font-size-base;
  color: $dark-gray;
}

.active .category-text {
  color: $white;
}

/* 适配微信小程序 - MP兼容性 */
.mp-animation.category-item.active {
  animation: none;
  transform: scale(1.02);
}
</style> 