<template>
  <view 
    class="activity-card mp-rounded" 
    @tap="$emit('view-detail', activity)"
  >
    <image :src="activity.image" mode="aspectFill" class="activity-image"></image>
    <view class="activity-tag" :class="activity.tagClass">{{activity.tag}}</view>
    <view class="activity-content">
      <text class="activity-title">{{activity.title}}</text>
      <!-- 使用过滤方法处理富文本 -->
      <text class="activity-desc">{{ filterHtmlTags(activity.description) }}</text>
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
        <button 
          class="join-btn clickable-mp" 
          :class="{ 'joined': activity.hasJoined }"
          @tap.stop="$emit('join', activity)"
        >{{ activity.hasJoined ? '已参与' : '立即参与' }}</button>
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
  },
  methods: {
    // 新增：过滤HTML标签的方法
    filterHtmlTags(htmlStr) {
      if (!htmlStr) return ''; // 处理空值
      return htmlStr.replace(/<[^>]+>/g, ''); // 正则移除所有HTML标签
    }
  }
}
</script>

<style lang="scss">

.activity-card {
  width: 500rpx;
  height: 480rpx;
  margin-right: 24rpx;
  border-radius: 24rpx;
  background-color: #fff;
  overflow: hidden;
  box-shadow: 0 8rpx 32rpx rgba(0,0,0,0.08);
  transition: all 0.3s ease;
  position: relative;
  border: 1rpx solid #f0f0f0;
  display: flex;
  flex-direction: column;
}

.activity-card:active {
  transform: scale(0.97) translateY(2rpx);
  box-shadow: 0 4rpx 16rpx rgba(0,0,0,0.1);
}

.activity-image {
  width: 100%;
  height: 280rpx;
  background-color: #f5f6fa;
  object-fit: cover;
}

.activity-tag {
  position: absolute;
  top: 24rpx;
  left: 24rpx;
  padding: 8rpx 24rpx;
  border-radius: 32rpx;
  font-size: 20rpx;
  color: #fff;
  font-weight: bold;
  letter-spacing: 1rpx;
  box-shadow: 0 4rpx 12rpx rgba(0,0,0,0.15);
  z-index: 2;
  background: linear-gradient(135deg, #FFC371, #FF5F6D); 
}

.activity-tag.hot,
.activity-tag.official {
  background: linear-gradient(135deg, #F47B85, #F9B48E);
}

.activity-tag.club {
  background: linear-gradient(135deg, #81FBB8, #28C76F);
}

.activity-tag.entertainment {
  background: linear-gradient(135deg, #A280FF, #F572E1);
}

.activity-tag.technology {
  background: linear-gradient(135deg, #66A6FF, #3E72E5);
}

.activity-tag.sports {
  background: linear-gradient(135deg, #F8C368, #F57D5C);
}

.activity-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 24rpx;
}

.activity-title {
  font-size: 32rpx;
  font-weight: bold;
  margin-bottom: 8rpx;
  color: #333;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.activity-desc {
  font-size: 26rpx;
  color: #666;
  margin-bottom: auto; 
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  line-height: 1.6;
  min-height: 84rpx; 
}

.activity-info {
  display: flex;
  align-items: center;
  font-size: 24rpx;
  color: #999;
  margin-top: 16rpx;
  margin-bottom: 20rpx;
  flex-wrap: wrap;
}

.activity-info .iconfont {
  margin-right: 8rpx;
  font-size: 28rpx;
  vertical-align: middle;
}

.activity-info text {
  margin-right: 24rpx;
}

.activity-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.participants {
  display: flex;
  align-items: center;
}

.participant-avatar {
  width: 48rpx;
  height: 48rpx;
  border-radius: 50%;
  margin-left: -20rpx;
  border: 3rpx solid #fff;
  box-shadow: 0 2rpx 4rpx rgba(0, 0, 0, 0.1);
}

.participant-avatar:first-child {
  margin-left: 0;
}

.participant-count {
  font-size: 24rpx;
  color: #999;
  margin-left: 24rpx;
}

.join-btn {
  height: 64rpx;
  padding: 0 36rpx;
  background: linear-gradient(90deg, #4D7FFF 0%, #76A2FF 100%);
  color: #fff;
  border-radius: 32rpx;
  font-size: 28rpx;
  font-weight: bold;
  border: none;
  box-shadow: 0 4rpx 12rpx rgba(77, 127, 255, 0.3); 
  transition: all 0.2s ease-out;
  display: flex;
  align-items: center;
  justify-content: center;

  &.joined {
    background: #F7F7F7;
    color: #B8B8B8;
    box-shadow: none;
    font-weight: normal;
  }
}

.join-btn:active {
  transform: scale(0.96);
  box-shadow: 0 2rpx 8rpx rgba(77, 127, 255, 0.3);
}

.join-btn.joined:active {
  transform: scale(0.98);
  background: #eee;
}

</style>