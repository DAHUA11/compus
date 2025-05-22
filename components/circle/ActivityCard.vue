<template>
  <view 
    class="activity-card mp-rounded" 
    @tap="$emit('view-detail', activity)"
  >
    <image :src="activity.image" mode="aspectFill" class="activity-image"></image>
    <view class="activity-tag" :class="activity.tagClass">{{activity.tag}}</view>
    <view class="activity-content">
      <text class="activity-title">{{activity.title}}</text>
      <text class="activity-desc">{{activity.description}}</text>
      <view class="activity-info">
        <text class="iconfont icon-time"></text>
        <text>{{activity.time}}</text>
        <text class="iconfont icon-location"></text>
        <text>{{activity.location}}</text>
      </view>
      <view class="activity-footer">
        <view class="participants">
          <image 
            v-for="(avatar, idx) in activity.avatars.slice(0, 3)" 
            :key="idx" 
            :src="avatar" 
            class="participant-avatar mp-rounded"
          ></image>
          <text class="participant-count">{{activity.participants}}人已参与</text>
        </view>
        <button class="join-btn clickable-mp" @tap.stop="$emit('join', activity)">立即参与</button>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  name: 'ActivityCard',
  props: {
    activity: {
      type: Object,
      required: true
    }
  }
}
</script>

<style lang="scss">
@import '@/styles/variables.scss';

.activity-card {
  width: 500rpx;
  margin-right: $spacing-base;
  border-radius: $border-radius-base;
  background-color: $white;
  overflow: hidden;
  box-shadow: $shadow-sm;
  transition: all $transition-base;
  position: relative;
  border: 1rpx solid rgba(0, 0, 0, 0.02);
  
  &:active {
    transform: scale(0.98);
    opacity: 0.9;
  }
  
  .activity-image {
    width: 100%;
    height: 240rpx;
    background-color: $bg-color;
  }
  
  .activity-tag {
    position: absolute;
    top: $spacing-base;
    left: $spacing-base;
    padding: 6rpx $spacing-base;
    border-radius: $border-radius-lg;
    font-size: $font-size-sm;
    color: $white;
    
    &.hot {
      background-color: rgba($warning-color, 0.9);
    }
    
    &.official {
      background-color: rgba($primary-color, 0.9);
    }
  }
  
  .activity-content {
    padding: $spacing-base;
    
    .activity-title {
      font-size: $font-size-lg;
      font-weight: bold;
      margin-bottom: $spacing-xs;
      white-space: normal;
      color: $dark-gray;
    }
    
    .activity-desc {
      font-size: $font-size-base;
      color: $gray;
      margin-bottom: $spacing-sm;
      display: -webkit-box;
      -webkit-box-orient: vertical;
      -webkit-line-clamp: 2;
      overflow: hidden;
      white-space: normal;
      line-height: $line-height-normal;
    }
    
    .activity-info {
      display: flex;
      align-items: center;
      font-size: $font-size-sm;
      color: $gray;
      margin-bottom: $spacing-sm;
      flex-wrap: wrap;
      
      .iconfont {
        margin-right: 6rpx;
      }
      
      text {
        margin-right: $spacing-base;
      }
    }
    
    .activity-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      
      .participants {
        display: flex;
        align-items: center;
        
        .participant-avatar {
          width: 40rpx;
          height: 40rpx;
          border-radius: $border-radius-circle;
          margin-right: -16rpx;
          border: 2rpx solid $white;
          box-shadow: 0 1rpx 3rpx rgba(0, 0, 0, 0.05);
        }
        
        .participant-count {
          font-size: $font-size-sm;
          color: $gray;
          margin-left: $spacing-base;
        }
      }
      
      .join-btn {
        padding: 8rpx $spacing-lg;
        background-color: rgba($primary-color, 0.9);
        color: $white;
        border-radius: $border-radius-lg;
        font-size: $font-size-sm;
        border: none;
        
        &:active {
          background-color: $primary-color-dark;
          transform: scale(0.95);
        }
      }
    }
  }
}
</style> 