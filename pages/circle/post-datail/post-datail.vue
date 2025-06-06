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
        <view class="section-title">
          <text class="font-bold">评论区 ({{ post.comments }})</text>
        </view>
        <view class="comment-list">
          <view class="comment-item" v-for="(comment, index) in comments" :key="comment._id">
            <image class="comment-avatar" :src="comment.author_avatar" mode="aspectFill"></image>
            <view class="comment-content">
              <view class="flex items-center">
                <text class="comment-name font-bold">{{ comment.author_name }}</text>
              </view>
              <text class="comment-text mt-xs">{{ comment.content }}</text>
              <view class="comment-actions-bar flex mt-xs">
                <view class="left-actions flex items-center">
                  <text class="comment-time text-muted text-xs">{{ formatTime(comment.create_time) }}</text>
                  <text class="action-btn ml-base" @tap="replyToComment(comment)">回复</text>
                </view>
                <view class="right-actions flex items-center ml-auto">
                  <view class="like-btn-wrapper flex items-center">
                    <text class="iconfont like-btn"
                      :class="[comment.liked ? 'icon-aixin4 liked' : 'icon-aixin3', comment.likeAnimate ? 'like-animate' : '']"
                      @tap="likeComment(comment, index)"></text>
                    <text class="like-count ml-xs" :class="{'liked': comment.liked}">{{ comment.like_count }}</text>
                  </view>
                </view>
              </view>
              <!-- 子评论展示 -->
              <view v-if="comment.replies && comment.replies.length" class="reply-list">
                <view class="reply-item" v-for="(reply, rIdx) in comment.replies" :key="reply._id">
                  <image class="reply-avatar" :src="reply.author_avatar" mode="aspectFill"></image>
                  <view class="reply-content">
                    <view class="flex items-center">
                      <text class="reply-name">{{ reply.author_name }}</text>
                      <text class="reply-time ml-xs">{{ formatTime(reply.create_time) }}</text>
                    </view>
                    <text class="reply-text mt-xs">{{ reply.content }}</text>
                  </view>
                </view>
              </view>
            </view>
          </view>
        </view>
      </view>
    </view>
    <!-- 评论输入框 -->
    <view class="comment-input-bar">
      <image :src="userInfo.avatar_file && userInfo.avatar_file.url ? userInfo.avatar_file.url : '/static/images/default-avatar.png'" class="input-avatar"></image>
      <input class="comment-input" v-model="commentText" :placeholder="replyPlaceholder" :focus="isInputFocused" @focus="onInputFocus" @blur="onInputBlur" />
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
      isInputFocused: false,
      likeLoading: false,
      userInfo: uni.getStorageSync('uni-id-pages-userInfo') || {},
      replyTo: null, // 当前回复的评论对象
      replyPlaceholder: '说点什么...'
    }
  },
  onLoad(options) {
    const postId = options.id;
    this.loadPostDetail(postId);
    this.fetchComments(postId);
  },
  methods: {
    // 获取帖子详情+用户信息+点赞状态
    async loadPostDetail(postId) {
      try {
        // 1. 获取帖子详情
        const postRes = await uniCloud.database().collection('add-content').doc(postId).get();
        if (!postRes.result.data || postRes.result.data.length === 0) {
          uni.showToast({ title: '未找到该帖子', icon: 'none' });
          return;
        }
        const post = postRes.result.data[0];

        // 2. 获取发帖人信息
        let user = {};
        try {
          const userRes = await uniCloud.database().collection('uni-id-users')
            .doc(post.user_id)
            .field('_id,avatar_file,nickname')
            .get();
          user = userRes.result.data[0] || {};
        } catch (e) {}

        // 3. 获取当前用户是否已点赞
        let isLiked = false;
        if (this.userInfo && this.userInfo._id) {
          const likeRes = await uniCloud.database().collection('user-likes')
            .where({
              user_id: this.userInfo._id,
              post_id: postId
            })
            .get();
          isLiked = likeRes.result.data.length > 0;
        }

        // 4. 组装数据
        this.post = {
          _id: post._id,
          content: post.content,
          images: post.files || [],
          likes: post.like_count || 0,
          comments: post.comment_count || 0,
          time: this.formatTime(post.create_time),
          name: user.nickname || '匿名用户',
          avatar: user.avatar_file && user.avatar_file.url ? user.avatar_file.url : '/static/images/default-avatar.png',
          tag: post.category,
          tagClass: this.getTagClass(post.category),
          isLiked
        };
      } catch (e) {
        uni.showToast({ title: '加载失败', icon: 'none' });
      }
    },
    // 帖子点赞/取消点赞
    async likePost() {
      if (this.likeLoading) return;
      this.likeLoading = true;

      if (!this.userInfo || !this.userInfo._id) {
        uni.showToast({ title: '请先登录', icon: 'none' });
        this.likeLoading = false;
        return;
      }
      const userId = this.userInfo._id;
      const postId = this.post._id;

      if (this.post.isLiked) {
        // 取消点赞
        try {
          // 查找点赞记录
          const likeRes = await uniCloud.database().collection('user-likes')
            .where({ user_id: userId, post_id: postId })
            .get();
          if (likeRes.result.data.length > 0) {
            const likeId = likeRes.result.data[0]._id;
            await uniCloud.database().collection('user-likes').doc(likeId).remove();
            await uniCloud.database().collection('add-content').doc(postId).update({
              like_count: this.post.likes - 1
            });
            this.post.isLiked = false;
            this.post.likes -= 1;
            uni.showToast({ title: '已取消点赞', icon: 'none' });
          }
        } catch (e) {
          uni.showToast({ title: '操作失败', icon: 'none' });
        }
      } else {
        // 点赞
        try {
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
        } catch (e) {
          uni.showToast({ title: '操作失败', icon: 'none' });
        }
      }
      this.likeLoading = false;
    },
    formatTime(ts) {
      const date = new Date(ts);
      const now = Date.now();
      const diff = now - new Date(ts).getTime();
      if (diff < 60000) return '刚刚';
      if (diff < 3600000) return Math.floor(diff / 60000) + '分钟前';
      if (diff < 86400000) return Math.floor(diff / 3600000) + '小时前';
      return `${date.getFullYear()}-${date.getMonth()+1}-${date.getDate()} ${date.getHours()}:${date.getMinutes()}`;
    },
    getTagClass(category) {
      if (category === '讨论') return 'discussion';
      if (category === '失物招领') return 'lost';
      if (category === '问答') return 'question';
      return '';
    },
    async fetchComments(postId) {
      const res = await uniCloud.database().collection('user-comment')
        .where({ target_id: postId })
        .orderBy('create_time', 'asc')
        .get();
      const all = res.result.data;

      // 获取所有评论id
      const commentIds = all.map(item => item._id);
      let likedMap = {};
      if (this.userInfo && this.userInfo._id && commentIds.length) {
        const likeRes = await uniCloud.database().collection('user-commentlikes')
          .where({
            user_id: this.userInfo._id,
            comment_id: uniCloud.database().command.in(commentIds)
          })
          .get();
        likedMap = {};
        likeRes.result.data.forEach(like => {
          likedMap[like.comment_id] = true;
        });
      }

      // 一级评论
      const top = all.filter(c => !c.parent_id).map(item => ({
        ...item,
        liked: likedMap[item._id] || false
      }));
      // 二级评论分组
      top.forEach(parent => {
        parent.replies = all.filter(c => c.parent_id === parent._id).map(item => ({
          ...item,
          liked: likedMap[item._id] || false
        }));
      });
      this.comments = top;
    },
    previewImage(images, index) {
      uni.previewImage({
        urls: images,
        current: images[index]
      });
    },
    //点赞评论
    async likeComment(comment, idx) {
      if (!this.userInfo || !this.userInfo._id) {
        uni.showToast({ title: '请先登录', icon: 'none' });
        return;
      }
      const userId = this.userInfo._id;
      const commentId = comment._id;

      // 先查是否已点赞
      const likeRes = await uniCloud.database().collection('user-commentlikes')
        .where({ user_id: userId, comment_id: commentId })
        .get();

      if (likeRes.result.data.length > 0) {
        // 已点赞，执行取消点赞
        const likeId = likeRes.result.data[0]._id;
        await uniCloud.database().collection('user-commentlikes').doc(likeId).remove();
        await uniCloud.database().collection('user-comment').doc(commentId).update({
          like_count: Math.max(0, comment.like_count - 1)
        });
        this.comments[idx].like_count = Math.max(0, this.comments[idx].like_count - 1);
        this.comments[idx].liked = false;
        uni.showToast({ title: '已取消点赞', icon: 'none' });
      } else {
        // 未点赞，执行点赞
        await uniCloud.database().collection('user-commentlikes').add({
          user_id: userId,
          comment_id: commentId,
          create_time: Date.now()
        });
        await uniCloud.database().collection('user-comment').doc(commentId).update({
          like_count: comment.like_count + 1
        });
        this.comments[idx].like_count += 1;
        this.comments[idx].liked = true;
        uni.showToast({ title: '已点赞', icon: 'none' });
      }
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
    replyToComment(comment) {
      this.replyTo = comment;
      this.replyPlaceholder = `回复 @${comment.author_name}：`;
      this.isInputFocused = true;
    },
    //发送评论
    async sendComment() {
      if (!this.commentText.trim()) return;
      if (!this.userInfo._id) {
        uni.showToast({ title: '请先登录', icon: 'none' });
        return;
      }
      const postId = this.post._id;
      await uniCloud.callFunction({
        name: 'user-comment',
        data: {
          content: this.commentText,
          author_id: this.userInfo._id,
          author_name: this.userInfo.nickname || '匿名用户',
          author_avatar: this.userInfo.avatar_file && this.userInfo.avatar_file.url ? this.userInfo.avatar_file.url : '/static/images/default-avatar.png',
          target_id: postId,
          parent_id: this.replyTo ? this.replyTo._id : ''
        }
      });
      this.commentText = '';
      this.isInputFocused = false;
      this.replyTo = null;
      this.replyPlaceholder = '说点什么...';
      uni.showToast({ title: '评论成功', icon: 'none' });
      this.fetchComments(postId);
      this.post.comments += 1;
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
  padding: 0 24rpx;
  .section-title {
    font-size: 28rpx;
    font-weight: 600;
    color: $primary-color;
    margin-bottom: 18rpx;
    padding: 24rpx 0 0 0;
  }
}
.comment-list {
  margin-top: 0;
}
.comment-item {
  background: #fff;
  border-radius: 18rpx;
  box-shadow: 0 4rpx 16rpx rgba(77,124,191,0.06);
  margin-bottom: 20rpx;
  padding: 24rpx 24rpx 24rpx 104rpx;
  position: relative;
  min-height: 88rpx;
  .comment-avatar {
    position: absolute;
    left: 24rpx;
    top: 24rpx;
    width: 64rpx;
    height: 64rpx;
    border-radius: 50%;
    border: 2rpx solid #e5e7eb;
    background: #f5f6fa;
    object-fit: cover;
  }
  .comment-content {
    width: 100%;
  }
  .comment-name {
    color: #4D7CBF;
    font-size: 30rpx;
    font-weight: 600;
  }
  .comment-text {
    color: #222;
    font-size: 32rpx;
    margin-top: 8rpx;
  }
  .comment-actions-bar {
    margin-top: 12rpx;
    display: flex;
    width: 100%;
    align-items: center;
  }
  .left-actions {
    display: flex;
    align-items: center;
  }
  .comment-time, .action-btn {
    color: #999;
    font-size: 24rpx;
  }
  .action-btn {
    margin-left: 32rpx;
    background: #f2f4f8;
    border-radius: 8rpx;
    padding: 0 12rpx;
  }
  .right-actions {
    display: flex;
    align-items: center;
    margin-left: auto;
  }
  .like-btn-wrapper {
    display: flex;
    align-items: center;
  }
  .like-btn {
    font-size: 36rpx;
    color: #b0b6be;
    transition: color 0.2s, transform 0.2s;
    &.like-animate {
      transform: scale(1.3);
    }
    &.liked {
      color: #FF4D4F;
    }
  }
  .like-count {
    font-size: 24rpx;
    color: #b0b6be;
    font-weight: 600;
    margin-left: 8rpx;
    transition: color 0.2s;
    &.liked {
      color: #FF4D4F;
    }
  }
}
.reply-list {
  margin-top: 8rpx;
  padding-left: 16rpx;
}
.reply-item {
  display: flex;
  align-items: flex-start;
  background: #fafbfc;
  border-radius: 12rpx;
  margin-bottom: 8rpx;
  padding: 12rpx 16rpx 12rpx 12rpx;
  box-shadow: 0 2rpx 8rpx rgba(77,124,191,0.02);
  .reply-avatar {
    width: 48rpx;
    height: 48rpx;
    border-radius: 50%;
    margin-right: 14rpx;
    background: #fff;
  }
  .reply-content {
    flex: 1;
  }
  .reply-name {
    color: #4D7CBF;
    font-size: 26rpx;
    font-weight: 500;
  }
  .reply-time {
    color: #bbb;
    font-size: 22rpx;
    margin-left: 10rpx;
  }
  .reply-text {
    color: #555;
    font-size: 26rpx;
    margin-top: 4rpx;
    line-height: 1.6;
  }
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
.input-avatar {
  width: 48rpx;
  height: 48rpx;
  border-radius: 50%;
  margin-right: 12rpx;
  background: #f5f6fa;
  border: 1rpx solid #e5e7eb;
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