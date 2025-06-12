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
      <view class="post-header-right">
        <text class="post-tag" :class="post.tagClass">{{post.tag}}</text>
        <view v-if="isPostOwner" class="more-btn clickable-mp" @tap.stop="showMoreActions">
          <text class="iconfont icon-gengduo"></text>
        </view>
      </view>
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
        @tap.stop="likePost(post, idx)" :disabled="post.likeLoading">
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
  computed: {
    isPostOwner() {
      const userId = uni.getStorageSync('uni-id-pages-userInfo')?._id;
      return userId && this.post.user_id === userId;
    }
  },
  methods: {
    previewImage(images, index) {
      // 预览图片
      uni.previewImage({
        urls: images,
        current: images[index]
      });
    },
    // 点赞
    likePost(post, index) {
      if (post.likeLoading) return;
      post.likeLoading = true;

      const userId = uni.getStorageSync('uni-id-pages-userInfo')._id;
      if (!userId) {
        uni.showToast({ title: '请先登录', icon: 'none' });
        post.likeLoading = false;
        return;
      }

      // 本地先行
      const originLiked = post.isLiked;
      const originLikes = post.likes;

      if (post.isLiked) {
        // 先本地取消
        post.isLiked = false;
        post.likes -= 1;
        // 查找点赞记录
        uniCloud.database().collection('user-likes')
          .where({
            user_id: userId,
            post_id: post._id
          })
          .get()
          .then(res => {
            if (res.result.data.length > 0) {
              const likeId = res.result.data[0]._id;
              // 使用Promise
              Promise.all([
                // 删除点赞记录
                uniCloud.database().collection('user-likes')
                  .doc(likeId)
                  .remove(),
                // 更新帖子点赞数
                uniCloud.database().collection('add-content')
                  .doc(post._id)
                  .update({
                    like_count: post.likes
                  }),
                // 扣除作者积分
                uniCloud.database().collection('user-score')
                  .add({
                    user_id: post.user_id,
                    score: -5,
                    type: 'post_like',
                    description: '帖子被取消点赞',
                    related_id: post._id,
                    create_time: Date.now()
                  })
              ])
              .then(() => {
                uni.showToast({ title: '已取消点赞', icon: 'none' });
                post.likeLoading = false;
              })
              .catch(err => {
                console.error('取消点赞失败:', err);
                // 回滚
                post.isLiked = originLiked;
                post.likes = originLikes;
                post.likeLoading = false;
                uni.showToast({ title: '操作失败', icon: 'none' });
              });
            } else {
              post.likeLoading = false;
            }
          })
          .catch(err => {
            console.error('查询点赞记录失败:', err);
            post.isLiked = originLiked;
            post.likes = originLikes;
            post.likeLoading = false;
            uni.showToast({ title: '操作失败', icon: 'none' });
          });
      } else {
        // 先本地加
        post.isLiked = true;
        post.likes += 1;
        // 使用Promise.all确保所有操作都成功
        Promise.all([
          // 添加点赞记录
          uniCloud.database().collection('user-likes')
            .add({
              user_id: userId,
              post_id: post._id,
              create_time: Date.now()
            }),
          // 更新帖子点赞数
          uniCloud.database().collection('add-content')
            .doc(post._id)
            .update({
              like_count: post.likes
            }),
          // 给作者增加积分
          uniCloud.database().collection('user-score')
            .add({
              user_id: post.user_id,
              score: 5,
              type: 'post_like',
              description: '帖子获赞',
              related_id: post._id,
              create_time: Date.now()
            })
        ])
        .then(() => {
          uni.showToast({ title: '已点赞', icon: 'none' });
          post.likeLoading = false;
        })
        .catch(err => {
          console.error('点赞失败:', err);
          // 回滚
          post.isLiked = originLiked;
          post.likes = originLikes;
          post.likeLoading = false;
          uni.showToast({ title: '操作失败', icon: 'none' });
        });
      }
    },
    showMoreActions() {
      uni.showActionSheet({
        itemList: ['删除帖子', '置顶帖子'],
        success: (res) => {
          switch (res.tapIndex) {
            case 0:
              this.deletePost();
              break;
            case 1:
              this.pinPost();
              break;
          }
        }
      });
    },
    deletePost() {
      uni.showModal({
        title: '确认删除',
        content: '确定要删除这条帖子吗？',
        success: (res) => {
          if (res.confirm) {
            // 显示加载提示
            uni.showLoading({
              title: '删除中...'
            });
            
            // 获取当前用户ID
            const userId = uni.getStorageSync('uni-id-pages-userInfo')?._id;
            if (!userId) {
              uni.hideLoading();
              uni.showToast({ title: '请先登录', icon: 'none' });
              return;
            }

            // 验证是否是帖子作者
            if (userId !== this.post.user_id) {
              uni.hideLoading();
              uni.showToast({ title: '无权删除此帖子', icon: 'none' });
              return;
            }

            // 删除帖子
            uniCloud.database().collection('add-content')
              .doc(this.post._id)
              .remove()
              .then(() => {
                uni.hideLoading();
                uni.showToast({ title: '删除成功', icon: 'success' });
                // 通知父组件帖子已删除
                this.$emit('post-deleted', this.post._id);
              })
              .catch((err) => {
                uni.hideLoading();
                console.error('删除帖子失败:', err);
                uni.showToast({ 
                  title: err.message || '删除失败', 
                  icon: 'none' 
                });
              });
          }
        }
      });
    },
    pinPost() {
      // 先检查是否是置顶帖子
      if (this.post.content_type === 'pinned') {
        uni.showModal({
          title: '取消置顶',
          content: '确定要取消置顶吗？',
          success: (res) => {
            if (res.confirm) {
              this.updatePinStatus(false);
            }
          }
        });
        return;
      }

      // 显示置顶确认对话框
      uni.showModal({
        title: '置顶帖子',
        content: '置顶需要消耗20积分，是否继续？',
        success: (res) => {
          if (res.confirm) {
            // 获取用户ID
            const userId = uni.getStorageSync('uni-id-pages-userInfo')?._id;
            if (!userId) {
              uni.showToast({ title: '请先登录', icon: 'none' });
              return;
            }

            // 显示加载提示
            uni.showLoading({
              title: '处理中...'
            });

            // 获取用户当前积分
            uniCloud.database().collection('user-score')
              .where({
                user_id: userId
              })
              .get()
              .then(res => {
                // 计算当前总积分
                const totalScore = res.result.data.reduce((sum, record) => sum + record.score, 0);
                
                if (totalScore < 20) {
                  
                  uni.hideLoading();
                  uni.showToast({ 
                    title: '积分不足，无法置顶', 
                    icon: 'none' 
                  });
                  return;
                }

                // 扣除积分并置顶帖子
                Promise.all([
                  // 记录积分变动
                  uniCloud.database().collection('user-score')
                    .add({
                      user_id: userId,
                      score: -20,
                      type: 'post_pin',
                      description: '帖子置顶消耗',
                      related_id: this.post._id,
                      create_time: Date.now()
                    }),
                  // 更新帖子状态
                  uniCloud.database().collection('add-content')
                    .doc(this.post._id)
                    .update({
                      content_type: 'pinned'
                    })
                ])
                .then(() => {
                  uni.hideLoading();
                  uni.showToast({ 
                    title: '置顶成功', 
                    icon: 'success' 
                  });
                  // 通知父组件帖子已更新
                  this.$emit('post-updated', this.post._id);
                })
                .catch(err => {
                  uni.hideLoading();
                  console.error('置顶失败:', err);
                  uni.showToast({ 
                    title: err.message || '置顶失败', 
                    icon: 'none' 
                  });
                });
              })
              .catch(err => {
                uni.hideLoading();
                console.error('获取积分记录失败:', err);
                uni.showToast({ 
                  title: '操作失败', 
                  icon: 'none' 
                });
              });
          }
        }
      });
    },

    // 更新置顶状态
    updatePinStatus(isPinned) {
      uni.showLoading({
        title: '处理中...'
      });

      uniCloud.database().collection('add-content')
        .doc(this.post._id)
        .update({
          content_type: isPinned ? 'pinned' : 'post'
        })
        .then(() => {
          uni.hideLoading();
          uni.showToast({ 
            title: isPinned ? '置顶成功' : '已取消置顶', 
            icon: 'success' 
          });
          // 通知父组件帖子已更新
          this.$emit('post-updated', this.post._id);
        })
        .catch(err => {
          uni.hideLoading();
          console.error('更新置顶状态失败:', err);
          uni.showToast({ 
            title: err.message || '操作失败', 
            icon: 'none' 
          });
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

  .post-header-right {
    display: flex;
    align-items: center;
    gap: 16rpx;
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

  .more-btn {
    padding: 8rpx;
    border-radius: $border-radius-circle;
    transition: all $transition-fast;
    
    .iconfont {
      font-size: 36rpx;
      color: $gray;
    }
    
    &:active {
      background-color: rgba(0, 0, 0, 0.05);
      transform: scale(0.95);
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