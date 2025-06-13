<template>
  <view class="pinned-card mp-rounded" @tap="handleViewDetail">
    <view class="pinned-indicator" v-if="isPin">
      <text class="iconfont icon-zhiding"></text>
    </view>
    <view class="post-header" @tap.stop="handleViewDetail">
      <view class="post-avatar-bg">
        <image :src="post.avatar || '/static/images/default-avatar.png'" class="post-avatar mp-rounded"></image>
      </view>
      <view class="post-info">
        <text class="post-name">{{post.name || '匿名用户'}}</text>
        <text class="post-meta">{{post.type || '官方'}} · {{post.time || '刚刚'}}</text>
      </view>
      <view class="tag-container">
        <text class="post-tag pin" v-if="isPin">置顶</text>
        <text class="post-tag" :class="getTagClass(post.type)">{{post.type || '官方'}}</text>
      </view>
    </view>
    <text class="post-content">{{post.content || ''}}</text>
    <view class="post-images" v-if="post.images && post.images.length">
      <image v-for="(img, idx) in post.images" :key="idx" :src="img" mode="aspectFill" class="post-image mp-rounded"
        @tap.stop="previewImage(post.images, idx)"></image>
    </view>
    <view class="post-actions">
      <view class="action-item like-btn clickable-mp" @tap.stop="handleLike">
        <text class="action-icon iconfont icon-dianzan" :class="{'liked': isLiked, 'like-animate': post.likeAnimate}"></text>
        <text class="action-text" :class="{'liked': isLiked}">{{ post.likes || 0 }}</text>
      </view>
      <view class="action-item comment-btn clickable-mp" @tap.stop="handleViewDetail">
        <text class="action-icon iconfont icon-icon_comment"></text>
        <text class="action-text">{{post.comments || 0}}</text>
      </view>
      <view class="action-item share-btn clickable-mp" @tap.stop>
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
      required: true,
      default: () => ({
        avatar: '/static/images/default-avatar.png',
        name: '匿名用户',
        type: '官方',
        time: '刚刚',
        content: '',
        images: [],
        likes: 0,
        comments: 0,
        isLiked: false,
        likeAnimate: false
      })
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
      likeLoading: false
    }
  },
  computed: {
    isLiked() {
      return this.post.isLiked || false;
    }
  },
  async created() {
    // 组件创建时检查用户点赞状态
    await this.checkUserLikeStatus();
  },
  methods: {
    async checkUserLikeStatus() {
      const userInfo = uni.getStorageSync('uni-id-pages-userInfo');
      if (!userInfo || !userInfo._id || !this.post._id) return;

      try {
        const likeRes = await uniCloud.database().collection('user-likes')
          .where({
            user_id: userInfo._id,
            post_id: this.post._id
          })
          .get();

        // 更新点赞状态
        this.post.isLiked = likeRes.result.data.length > 0;
      } catch (e) {
        console.error('检查点赞状态失败:', e);
      }
    },
    async handleViewDetail() {
      try {
        // 确保数据已更新
        await this.$nextTick();
        
        // 使用 Promise 包装导航操作
        await new Promise((resolve, reject) => {
          uni.navigateTo({
            url: `/pages/circle/pinned-datail/pinned-datail?id=${this.post._id}`,
            success: resolve,
            fail: (err) => {
              console.error('导航失败:', err);
              // 如果导航失败，尝试使用 redirectTo
              uni.redirectTo({
                url: `/pages/circle/pinned-datail/pinned-datail?id=${this.post._id}`,
                success: resolve,
                fail: reject
              });
            }
          });
        });
      } catch (error) {
        console.error('页面跳转失败:', error);
        uni.showToast({
          title: '页面跳转失败，请重试',
          icon: 'none',
          duration: 2000
        });
      }
    },
    async handleLike() {
      if (this.likeLoading) return;
      this.likeLoading = true;

      const userInfo = uni.getStorageSync('uni-id-pages-userInfo');
      if (!userInfo || !userInfo._id) {
        uni.showToast({ title: '请先登录', icon: 'none' });
        this.likeLoading = false;
        return;
      }

      const userId = userInfo._id;
      const postId = this.post._id;

      try {
        // 添加点赞动画
        this.post.likeAnimate = true;
        setTimeout(() => {
          this.post.likeAnimate = false;
        }, 500);

        // 先检查是否已点赞
        const likeRes = await uniCloud.database().collection('user-likes')
          .where({
            user_id: userId,
            post_id: postId
          })
          .get();

        if (likeRes.result.data.length > 0) {
          // 已点赞，执行取消点赞
          const likeId = likeRes.result.data[0]._id;
          await uniCloud.database().collection('user-likes').doc(likeId).remove();
          await uniCloud.database().collection('add-content').doc(postId).update({
            like_count: this.post.likes - 1
          });
          this.post.isLiked = false;
          this.post.likes -= 1;
          uni.showToast({ title: '已取消点赞', icon: 'none' });
        } else {
          // 未点赞，执行点赞
          await uniCloud.database().collection('user-likes').add({
            user_id: userId,
            post_id: postId,
            create_time: Date.now()
          });
          await uniCloud.database().collection('add-content').doc(postId).update({
            like_count: this.post.likes + 1
          });
          this.post.isLiked = true;
          this.post.likes += 1;
          uni.showToast({ title: '已点赞', icon: 'none' });
        }

        // 触发父组件的更新
        this.$emit('post-updated', this.post);
      } catch (e) {
        console.error('点赞操作失败:', e);
        uni.showToast({ title: '操作失败', icon: 'none' });
      } finally {
        this.likeLoading = false;
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
      }
      
      &.like-animate {
        animation: likeAnimation 0.5s ease;
      }
    }
    
    .action-text {
      font-size: $font-size-sm;
      color: $gray;
      transition: color 0.3s ease;
      
      &.liked {
        color: $error-color;
      }
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
  0% { transform: scale(1); }
  50% { transform: scale(1.4); }
  100% { transform: scale(1); }
}
</style> 