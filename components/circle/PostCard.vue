<template>
  <view class="post-card mp-rounded" @tap="$emit('view-detail', post)">
    <view class="post-header">
      <view class="user-info">
        <image :src="post.avatar" class="post-avatar mp-rounded"></image>
        <view class="post-info">
          <text class="post-name">{{post.name}}</text>
          <text class="post-meta">{{post.time}}</text>
        </view>
      </view>
      <text class="post-tag" :class="post.tagClass">{{post.tag}}</text>
    </view>
    <text class="post-content">{{post.content}}</text>
    <view class="post-images" v-if="post.images && post.images.length">
      <image 
        v-for="(img, idx) in post.images" 
        :key="idx" 
        :src="img" 
        mode="aspectFill" 
        class="post-image mp-rounded"
        @tap.stop="previewImage(post.images, idx)"
      ></image>
    </view>
    <view class="post-actions">
      <view class="action-item like-btn clickable-mp" 
        :class="{ 'is-active': post.isLiked }"
        @tap.stop="$emit('like', post)">
        <text class="action-icon iconfont icon-dianzan"></text>
        <text class="action-text">{{post.likes}}</text>
      </view>
      <view class="action-item comment-btn clickable-mp" @tap.stop="$emit('comment', post)">
        <text class="action-icon iconfont icon-icon_comment"></text>
        <text class="action-text">{{post.comments}}</text>
      </view>
      <view class="action-item share-btn clickable-mp" @tap.stop="$emit('share', post)">
        <text class="action-icon iconfont icon-fasong"></text>
        <text class="action-text">分享</text>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  name: 'PostCard',
  props: {
    post: {
      type: Object,
      required: true
    }
  },
  methods: {
    previewImage(images, index) {
      // 预览图片
      uni.previewImage({
        urls: images,
        current: images[index]
      });
    }
  }
}
</script>

<style lang="scss">
@import '@/styles/variables.scss';

.post-card {
  padding: 20rpx;
  margin-bottom: 20rpx;
  background-color: $white;
  border-radius: $border-radius-base;
  box-shadow: $shadow-sm;
  transition: all $transition-base;
  position: relative;
  overflow: hidden;
  // border: 1rpx solid rgba(0, 0, 0, 0.02);
  
  &:active {
    transform: scale(0.98);
    opacity: 0.95;
  }
}

.post-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 0 16rpx 0;
  // margin-bottom: 16rpx;
  // border-bottom: 1rpx solid rgba(0, 0, 0, 0.04);

  .user-info {
    display: flex;
    align-items: center;
    gap: 12rpx;
  }
  
  .post-avatar {
    width: 76rpx;
    height: 76rpx;
    border-radius: $border-radius-circle;
    background-color: $bg-color;
    // border: 2rpx solid $extra-light-gray;
    box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.08);
  }
  
  .post-info {
    display: flex;
    flex-direction: column;
    gap: 4rpx;
    
    .post-name {
      font-size: 30rpx;
      font-weight: 600;
      color: $dark-gray;
      line-height: 1.3;
    }
    
    .post-meta {
      font-size: 22rpx;
      color: $gray;
      line-height: 1.2;
    }
  }

  .post-tag {
    padding: 4rpx 16rpx;
    border-radius: $border-radius-lg;
    font-size: 22rpx;
    font-weight: 500;
    
    &.discussion {
      background: rgba($primary-color, 0.1);
      color: $primary-color;
    }
    
    &.question {
      background: rgba($warning-color, 0.1);
      color: $warning-color;
    }
    
    &.lost {
      background: rgba($error-color, 0.1);
      color: $error-color;
    }
    
    &.pin {
      background: rgba($success-color, 0.1);
      color: $success-color;
    }
    
    &.official {
      background: rgba($info-color, 0.1);
      color: $info-color;
    }
    
    &.promotion {
      background: rgba($purple-color, 0.1);
      color: $purple-color;
    }
  }
}

.post-content {
  font-size: $font-size-base;
  color: $dark-gray;
  margin-bottom: 16rpx;
  line-height: $line-height-normal;
  padding-left: 10rpx;
}

.post-images {
  display: flex;
  flex-wrap: wrap;
  margin: 0 -6rpx 16rpx;
  padding-left: 10rpx;
  
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
  justify-content: space-around;
  border-top: 1rpx solid rgba(0, 0, 0, 0.03);
  padding-top: 16rpx;
  margin-top: 10rpx;
  
  .action-item {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 8rpx 20rpx;
    border-radius: $border-radius-lg;
    transition: all $transition-fast;
    
    .action-icon {
      font-size: $font-size-lg;
      color: $gray;
      margin-right: 10rpx;
      transition: all $transition-fast;
    }
    
    .action-text {
      font-size: $font-size-sm;
      color: $gray;
      transition: all $transition-fast;
    }
    
    &:active {
      background-color: rgba(0, 0, 0, 0.03);
      transform: scale(0.95);
    }
    
    &.is-active {
      .action-icon {
        color: $error-color;
        animation: heartBeat 0.3s ease-in-out;
      }
      
      .action-text {
        color: $error-color;
      }
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

@keyframes heartBeat {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.3);
  }
  100% {
    transform: scale(1);
  }
}
</style>