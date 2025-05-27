<template>
  <view 
    class="category-item flex flex-column items-center clickable-mp mp-animation" 
    :class="{ active: isActive }"
    @tap="$emit('switch')"
  >
    <image v-if="iconImg" :src="iconImg" class="category-img-icon" mode="aspectFit" />
    <text v-else class="category-icon iconfont" :class="icon"></text>
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
    iconImg: {
      type: String,
      default: ''
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
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-width: 100rpx;
  padding: 0;
  background: none;
  border: none;
  box-shadow: none;
  margin-right: $spacing-base;
  cursor: pointer;
  &:active {
    transform: scale(0.97);
    opacity: 0.9;
  }
}
.category-item.active {
  background: none;
  border: none;
  box-shadow: none;
  transform: scale(1.08);
}
.category-icon {
  width: 48rpx;
  height: 48rpx;
  margin-bottom: 8rpx;
  display: block;
}
.category-text {
  font-size: 28rpx;
  color: #222;
  font-weight: 700;
  margin-top: 0;
  transition: all $transition-fast;
}

/* 适配微信小程序 - MP兼容性 */
.mp-animation.category-item.active {
  animation: none;
  transform: scale(1.02);
}

@keyframes pulse {
  0% { transform: scale(1);}
  50% { transform: scale(1.12);}
  100% { transform: scale(1);}
}

.category-item.active {
  animation: pulse 0.6s;
}

.category-img-icon {
  width: 96rpx;
  height: 68rpx;
  margin-bottom: 16rpx;
  display: block;
  border-radius: 20rpx;
  object-fit: cover;
  box-shadow: none;
  border: none;
  background: none;
  transition: box-shadow 0.2s, border 0.2s, transform 0.2s;
}
.category-item.active .category-img-icon {
  box-shadow: 0 4rpx 16rpx rgba(77, 124, 191, 0.18);
  border: 2rpx solid $primary-color;
  transform: scale(1.08);
  background: none;
}

.banner-category-wrapper {
  margin-bottom: 32rpx;
}
</style> 