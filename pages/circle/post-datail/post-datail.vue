<template>
  <view class="post-detail-bg">
    <view class="post-detail-container">
      <!-- 头部卡片 -->
      <view class="post-header-card">
        <image :src="post.avatar" class="post-avatar"></image>
        <view class="post-info">
          <view class="post-name-row">
            <text class="post-name">{{ post.name }}</text>
            <text class="post-tag" :class="post.tagClass">{{ post.tag }}</text>
          </view>
          <text class="post-meta">{{ post.time }}</text>
        </view>
      </view>

      <!-- 正文内容 -->
      <view class="post-content-block">
        <text class="post-content">{{ post.content }}</text>
        <view class="post-images" v-if="post.images && post.images.length">
          <image
            v-for="(img, idx) in post.images"
            :key="idx"
            :src="img"
            mode="aspectFill"
            class="post-image"
            @tap="previewImage(post.images, idx)"
          ></image>
        </view>
      </view>

      <!-- 操作区 -->
      <view class="post-actions">
        <view class="action-item like-btn" :class="{ 'is-active': post.isLiked }" @tap="likePost">
          <text class="action-icon iconfont icon-dianzan"></text>
          <text class="action-text">{{ post.likes }}</text>
        </view>
        <view class="action-item comment-btn" @tap="focusCommentInput">
          <text class="action-icon iconfont icon-icon_comment"></text>
          <text class="action-text">{{ comments.length }}</text>
        </view>
        <view class="action-item share-btn">
          <text class="action-icon iconfont icon-fasong"></text>
          <text class="action-text">分享</text>
        </view>
      </view>

      <!-- 评论区 -->
      <view class="comment-section">
        <view class="comment-title">评论区 ({{ comments.length }})</view>
        <view v-if="comments.length === 0" class="comment-empty">暂无评论，快来抢沙发吧~</view>
        <view v-else class="comment-list">
          <view class="comment-item" v-for="(comment, idx) in comments" :key="idx">
            <image :src="comment.avatar" class="comment-avatar"></image>
            <view class="comment-content-block">
              <view class="comment-header">
                <text class="comment-name">{{ comment.name }}</text>
                <text class="comment-time">{{ comment.time }}</text>
              </view>
              <text class="comment-text">{{ comment.content }}</text>
              <view class="comment-actions">
                <view class="comment-like-btn" :class="{ liked: comment.liked }" @tap="likeComment(idx)">
                  <text class="iconfont" :class="comment.liked ? 'icon-dianzan' : 'icon-dianzan'" ></text>
                  <text class="like-count">{{ comment.likes }}</text>
                </view>
              </view>
            </view>
          </view>
        </view>
      </view>
    </view>
    <!-- 评论输入框 -->
    <view class="comment-input-bar">
      <input class="comment-input" v-model="commentText" :placeholder="'说点什么...'" :focus="isInputFocused" @focus="onInputFocus" @blur="onInputBlur" />
      <button class="send-btn" :disabled="!commentText.trim()" @tap="sendComment">发送</button>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      post: {},
      comments: [],
      commentText: '',
      isInputFocused: false
    }
  },
  onLoad(options) {
    const postId = options.id;
    const posts = uni.getStorageSync('posts') || [];
    const post = posts.find(item => item.id == postId);
    if (post) {
      this.post = post;
    } else {
      uni.showToast({ title: '未找到该帖子', icon: 'none' });
    }
    // 模拟评论数据
    this.comments = [
      {
        avatar: '/static/images/avatar1.png',
        name: '小明',
        time: '1小时前',
        content: '写得真好，支持一下！',
        likes: 2,
        liked: false
      },
      {
        avatar: '/static/images/avatar2.png',
        name: '小红',
        time: '30分钟前',
        content: '有用的信息，感谢分享~',
        likes: 1,
        liked: false
      }
    ];
  },
  methods: {
    previewImage(images, index) {
      uni.previewImage({
        urls: images,
        current: images[index]
      });
    },
    likePost() {
      this.post.isLiked = !this.post.isLiked;
      this.post.likes += this.post.isLiked ? 1 : -1;
    },
    likeComment(idx) {
      const comment = this.comments[idx];
      comment.liked = !comment.liked;
      comment.likes += comment.liked ? 1 : -1;
    },
    focusCommentInput() {
      this.isInputFocused = true;
    },
    onInputFocus() {
      this.isInputFocused = true;
    },
    onInputBlur() {
      this.isInputFocused = false;
    },
    sendComment() {
      if (!this.commentText.trim()) return;
      this.comments.unshift({
        avatar: '/static/images/avatar3.png',
        name: '我',
        time: '刚刚',
        content: this.commentText,
        likes: 0,
        liked: false
      });
      this.commentText = '';
      this.isInputFocused = false;
    }
  }
}
</script>

<style lang="scss">
@import '@/styles/variables.scss';

.post-detail-bg {
  min-height: 100vh;
  background: #f8f9fc;
  padding-bottom: 120rpx;
}
.post-detail-container {
  margin: 32rpx 0;
  padding: 0 24rpx 24rpx 24rpx;
}
.post-header-card {
  display: flex;
  align-items: center;
  background: $white;
  border-radius: 18rpx;
  box-shadow: 0 4rpx 16rpx rgba(77,124,191,0.08);
  padding: 24rpx;
  margin-bottom: 24rpx;
}
.post-avatar {
  width: 80rpx;
  height: 80rpx;
  border-radius: 50%;
  border: 2rpx solid #e5e7eb;
  background: #f5f6fa;
  margin-right: 20rpx;
}
.post-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
}
.post-name-row {
  display: flex;
  align-items: center;
  margin-bottom: 8rpx;
}
.post-name {
  font-size: 32rpx;
  font-weight: 600;
  color: $dark-gray;
  margin-right: 16rpx;
}
.post-tag {
  padding: 4rpx 16rpx;
  border-radius: 12rpx;
  font-size: 22rpx;
  font-weight: 500;
  background: rgba($primary-color, 0.1);
  color: $primary-color;
  &.discussion { background: rgba($primary-color, 0.1); color: $primary-color; }
  &.question { background: rgba($warning-color, 0.1); color: $warning-color; }
  &.lost { background: rgba($error-color, 0.1); color: $error-color; }
  &.pin { background: rgba($success-color, 0.1); color: $success-color; }
  &.official { background: rgba($info-color, 0.1); color: $info-color; }
  &.promotion { background: rgba($purple-color, 0.1); color: $purple-color; }
}
.post-meta {
  font-size: 22rpx;
  color: $gray;
}
.post-content-block {
  background: $white;
  border-radius: 16rpx;
  padding: 32rpx 24rpx 24rpx 24rpx;
  margin-bottom: 24rpx;
  box-shadow: 0 2rpx 8rpx rgba(77,124,191,0.04);
}
.post-content {
  font-size: 30rpx;
  color: $dark-gray;
  line-height: 1.8;
  margin-bottom: 24rpx;
  display: block;
}
.post-images {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
  .post-image {
    width: calc(33.33% - 8rpx);
    height: 200rpx;
    border-radius: 12rpx;
    background-color: $bg-color;
    object-fit: cover;
  }
}
.post-actions {
  display: flex;
  align-items: center;
  justify-content: space-around;
  background: $white;
  border-radius: 16rpx;
  box-shadow: 0 2rpx 8rpx rgba(77,124,191,0.04);
  padding: 18rpx 0;
  margin-bottom: 24rpx;
  .action-item {
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 32rpx;
    padding: 8rpx 32rpx;
    font-size: 28rpx;
    transition: all $transition-fast;
    .action-icon {
      font-size: 36rpx;
      margin-right: 10rpx;
      color: $gray;
      transition: all $transition-fast;
    }
    .action-text {
      font-size: 26rpx;
      color: $gray;
    }
    &.like-btn.is-active .action-icon {
      color: $error-color;
      animation: likeAnimation 0.5s ease;
    }
    &:active {
      background: $bg-color-hover;
      transform: scale(0.96);
    }
  }
}
.comment-section {
  background: $white;
  border-radius: 16rpx;
  box-shadow: 0 2rpx 8rpx rgba(77,124,191,0.04);
  padding: 24rpx;
  margin-bottom: 24rpx;
}
.comment-title {
  font-size: 28rpx;
  font-weight: 600;
  color: $primary-color;
  margin-bottom: 18rpx;
}
.comment-empty {
  color: $gray;
  font-size: 24rpx;
  text-align: center;
  padding: 32rpx 0;
}
.comment-list {
  display: flex;
  flex-direction: column;
  gap: 24rpx;
}
.comment-item {
  display: flex;
  align-items: flex-start;
}
.comment-avatar {
  width: 56rpx;
  height: 56rpx;
  border-radius: 50%;
  margin-right: 16rpx;
  background: #f5f6fa;
  border: 1rpx solid #e5e7eb;
}
.comment-content-block {
  flex: 1;
  display: flex;
  flex-direction: column;
}
.comment-header {
  display: flex;
  align-items: center;
  gap: 12rpx;
  margin-bottom: 4rpx;
}
.comment-name {
  font-size: 26rpx;
  font-weight: 500;
  color: $dark-gray;
}
.comment-time {
  font-size: 20rpx;
  color: $gray;
}
.comment-text {
  font-size: 26rpx;
  color: $black;
  margin-bottom: 8rpx;
}
.comment-actions {
  display: flex;
  align-items: center;
  gap: 18rpx;
}
.comment-like-btn {
  display: flex;
  align-items: center;
  color: $gray;
  font-size: 24rpx;
  border-radius: 24rpx;
  padding: 4rpx 12rpx;
  transition: all $transition-fast;
  &:active {
    background: $bg-color-hover;
    color: $error-color;
  }
  &.liked {
    color: $error-color;
    .iconfont {
      color: $error-color;
      animation: likeAnimation 0.5s ease;
    }
    .like-count {
      color: $error-color;
    }
  }
}
.like-count {
  margin-left: 6rpx;
  font-size: 24rpx;
  color: $gray;
}
.comment-input-bar {
  position: fixed;
  left: 0;
  bottom: 0;
  width: 100vw;
  background: $white;
  box-shadow: 0 -2rpx 8rpx rgba(77,124,191,0.06);
  display: flex;
  align-items: center;
  padding: 16rpx 24rpx;
  z-index: 99;
}
.comment-input {
  flex: 1;
  height: 64rpx;
  border-radius: 32rpx;
  background: #f5f6fa;
  border: none;
  padding: 0 24rpx;
  font-size: 26rpx;
  margin-right: 16rpx;
}
.send-btn {
  background: $primary-color;
  color: $white;
  border: none;
  border-radius: 32rpx;
  font-size: 26rpx;
  padding: 0 32rpx;
  height: 64rpx;
  line-height: 64rpx;
  transition: all $transition-fast;
  &:disabled {
    background: $gray;
    color: #fff;
    opacity: 0.5;
  }
}
@keyframes likeAnimation {
  0% { transform: scale(1);}
  50% { transform: scale(1.4);}
  100% { transform: scale(1);}
}
</style>