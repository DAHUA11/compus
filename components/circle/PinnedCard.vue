<template>
  <view class="pinned-card mp-rounded" >
    <view class="pinned-indicator" v-if="isPin">
      <text class="iconfont icon-zhiding"></text>
    </view>
    <view class="post-header" @tap="$emit('view-detail', post)">
      <view class="post-avatar-bg">
        <image :src="post.avatar" class="post-avatar mp-rounded"></image>
      </view>
      <view class="post-info">
        <text class="post-name">{{post.name}}</text>
        <text class="post-meta">{{post.type}} · {{post.time}}</text>
      </view>
      <view class="tag-container">
        <text class="post-tag pin" v-if="isPin">置顶</text>
        <text class="post-tag" :class="getTagClass(post.type)">{{post.type}}</text>
      </view>
    </view>
    <text class="post-content">{{post.content}}</text>
    <view class="post-images" v-if="post.images && post.images.length">
      <image v-for="(img, idx) in post.images" :key="idx" :src="img" mode="aspectFill" class="post-image mp-rounded"
        @tap.stop="previewImage(post.images, idx)"></image>
    </view>
    <view class="post-actions">
      <view class="action-item like-btn clickable-mp" @tap="handleLike">
        <text class="action-icon iconfont icon-dianzan" :class="{'liked': isLiked}"></text>
        <text class="action-text">{{ post.likes }}</text>
      </view>
      <view class="action-item comment-btn clickable-mp" @tap="$emit('view-detail', post)">
        <text class="action-icon iconfont icon-icon_comment"></text>
        <text class="action-text">{{post.comments}}</text>
      </view>
      <view class="action-item share-btn clickable-mp">
        <text class="action-icon iconfont icon-fasong"></text>
        <text class="action-text">分享</text>
      </view>
      <slot name="actions"></slot>
    </view>
  </view>
</template>

<script>
export default {
  name: 'PinnedCard',
  props: {
    post: {
      type: Object,
      required: true
    },
    isPin: {
      type: Boolean,
      default: true
    },
    hasCustomActions: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      isLiked: false
    }
  },
  methods: {
    handleLike() {
      this.isLiked = !this.isLiked;
      if (this.isLiked) {
        this.post.likes++;
      } else {
        this.post.likes--;
      }
    },
    previewImage(images, index) {
      // 预览图片
      uni.previewImage({
        urls: images,
        current: images[index]
      });
    },
    getTagClass(type) {
      const typeMap = {
        '官方': 'official',
        '商家': 'promotion',
        '活动': 'hot'
      };
      return typeMap[type] || 'official';
    }
  }
}
</script>

<style lang="scss">
@import '@/styles/variables.scss';

.pinned-card {
  margin-bottom: $spacing-base;
  padding: $spacing-base;
  background-color: $white;
  border-radius: $border-radius-base;
  box-shadow: $shadow-base;
  transition: all $transition-base;
  position: relative;
  overflow: hidden;
  border-left: 4rpx solid rgba($warning-color, 0.8);
  border: 1rpx solid rgba(0, 0, 0, 0.02);
  
  &:active {
    transform: scale(0.98);
    opacity: 0.95;
  }
}

.pinned-indicator {
  position: absolute;
  top: -5rpx;
  right: 20rpx;
  color: rgba($warning-color, 0.7);
  font-size: $font-size-lg;
  transform: rotate(45deg);
  opacity: 0.7;
  animation: pinPulse 2s infinite;
}

.post-header {
  display: flex;
  align-items: center;
  padding: 0 0 8rpx 0;
}

.post-avatar {
  width: 64rpx;
  height: 64rpx;
  border-radius: 50%;
  border: 2rpx solid #e5e7eb;
  box-shadow: 0 2rpx 8rpx rgba(77,124,191,0.08);
  background: #f5f6fa;
  margin-right: 18rpx;
}

.post-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.post-name {
  color: #000000;
  font-size: 30rpx;
  font-weight: 600;
  margin-bottom: 2rpx;
}

.post-meta {
  color: #b0b6be;
  font-size: 22rpx;
}

.tag-container {
  display: flex;
  align-items: center;
  margin-left: 12rpx;
}

.post-tag {
  padding: 2rpx 16rpx;
  border-radius: 12rpx;
  font-size: 22rpx;
  font-weight: 500;
  background: #f2f4f8;
  color: #4D7CBF;
  margin-left: 8rpx;
}

.post-tag.pin {
  background: #ffe082;
  color: #b47d00;
  margin-left: 0;
}

.post-content {
  font-size: $font-size-base;
  color: $black;
  margin-bottom: $spacing-sm;
  line-height: $line-height-normal;
}

.post-images {
  display: flex;
  flex-wrap: wrap;
  margin: 0 -6rpx $spacing-sm;
  
  .post-image {
    width: calc(33.33% - 12rpx);
    height: 200rpx;
    margin: 6rpx;
    border-radius: $border-radius-sm;
    background-color: $bg-color;
    transition: all $transition-fast;
    
    &:active {
      transform: scale(0.95);
    }
  }
}

.post-actions {
  display: flex;
  align-items: center;
  border-top: 1rpx solid $extra-light-gray;
  padding-top: $spacing-sm;
  
  .action-item {
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: $spacing-lg;
    padding: 6rpx 16rpx;
    border-radius: $border-radius-lg;
    transition: all $transition-fast;
    
    .action-icon {
      font-size: $font-size-lg;
      color: $gray;
      margin-right: 8rpx;
      transition: all 0.3s ease;
      
      &.liked {
        color: $error-color;
        animation: likeAnimation 0.5s ease;
      }
    }
    
    .action-text {
      font-size: $font-size-sm;
      color: $gray;
    }
    
    &:active {
      background-color: $bg-color-hover;
      transform: scale(0.95);
    }
  }
  
  .like-btn {
    &:active .action-icon {
      color: $error-color;
      transform: scale(1.2);
    }
  }
  
  .comment-btn {
    &:active .action-icon {
      color: $primary-color;
      transform: scale(1.2);
    }
  }
  
  .share-btn {
    &:active .action-icon {
      color: $success-color;
      transform: scale(1.2);
    }
  }
}

.view-detail {
  margin-left: auto;
  color: $primary-color;
  font-size: $font-size-sm;
  padding: 6rpx 16rpx;
  border-radius: $border-radius-lg;
  background-color: $primary-color-light;
  display: flex;
  align-items: center;
  
  &:active {
    opacity: 0.8;
    transform: scale(0.95);
  }
}

.button-group {
  display: flex;
  margin-left: auto;
  
  .detail-btn {
    padding: 8rpx $spacing-lg;
    background-color: $primary-color-light;
    color: $primary-color;
    border-radius: $border-radius-lg;
    font-size: $font-size-sm;
    margin-right: $spacing-xs;
    border: none;
    display: flex;
    align-items: center;
    
    &:active {
      background-color: rgba(22, 93, 255, 0.2);
      transform: scale(0.95);
    }
  }
  
  .action-btn {
    padding: 8rpx $spacing-lg;
    background-color: $primary-color;
    color: $white;
    border-radius: $border-radius-lg;
    font-size: $font-size-sm;
    border: none;
    display: flex;
    align-items: center;
    
    &:active {
      background-color: $primary-color-dark;
      transform: scale(0.95);
    }
  }
}

@keyframes pinPulse {
  0% {
    transform: rotate(45deg) scale(1);
  }
  50% {
    transform: rotate(45deg) scale(1.2);
  }
  100% {
    transform: rotate(45deg) scale(1);
  }
}

@keyframes likeAnimation {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.4);
  }
  100% {
    transform: scale(1);
  }
}
</style> 