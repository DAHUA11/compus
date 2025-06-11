<template>
  <view 
    class="activity-card mp-rounded" 
    @tap="$emit('view-detail', activity)"
  >
    <image :src="activity.image" mode="aspectFill" class="activity-image"></image>
    <view class="activity-tag" :class="activity.tagClass">{{activity.tag}}</view>
    <view class="activity-content">
      <text class="activity-title">{{activity.title}}</text>
      <!-- 关键修改：使用过滤方法处理富文本 -->
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
  border-radius: 16rpx;
  background-color: #fff;
  overflow: hidden;
  box-shadow: 0 2rpx 8rpx rgba(0,0,0,0.06);
  transition: all 0.2s;
  position: relative;
  border: 1rpx solid rgba(0, 0, 0, 0.02);
  display: flex;
  flex-direction: column;
}
.activity-card:active {
  transform: scale(0.98);
  opacity: 0.9;
}
.activity-image {
  width: 100%;
  height: 240rpx;
  background-color: #f5f6fa;
  object-fit: cover;
  border-top-left-radius: 16rpx;
  border-top-right-radius: 16rpx;
  border-bottom-left-radius: 0;
  border-bottom-right-radius: 0;
  position: relative;
  z-index: 1;
}
.activity-image::after {
  content: '';
  position: absolute;
  left: 0; right: 0; bottom: 0;
  height: 48rpx;
  background: linear-gradient(to bottom, rgba(255,255,255,0) 0%, #fff 100%);
  z-index: 2;
  pointer-events: none;
}
.activity-tag {
  position: absolute;
  top: 24rpx;
  left: 24rpx;
  padding: 8rpx 28rpx 8rpx 20rpx;
  border-radius: 32rpx;
  font-size: 28rpx;
  color: #fff;
  font-weight: 600;
  letter-spacing: 1rpx;
  box-shadow: 0 2rpx 8rpx rgba(0,0,0,0.08);
  z-index: 2;
  background: linear-gradient(90deg, #ffb347 0%, #ffcc80 100%);
}
.activity-tag.hot,
.activity-tag.official {
  background: linear-gradient(90deg, #ff7e5f 0%, #feb47b 100%);
}
.activity-tag.club {
  background: linear-gradient(90deg, #7ed957 0%, #b6f492 100%);
}
.activity-tag.entertainment {
  background: linear-gradient(90deg, #f857a6 0%, #ff5858 100%);
}
.activity-tag.technology {
  background: linear-gradient(90deg, #43cea2 0%, #185a9d 100%);
}
.activity-tag.sports {
  background: linear-gradient(90deg, #f7971e 0%, #ffd200 100%);
}
.activity-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 12rpx 24rpx 24rpx 24rpx;
  margin-top: -32rpx;
  z-index: 3;
  background: transparent;
}
.activity-title {
  font-size: 32rpx;
  font-weight: bold;
  margin-bottom: 8rpx;
  color: #222;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.activity-desc {
  font-size: 28rpx;
  color: #888;
  margin-bottom: 16rpx;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  line-height: 1.6;
}
.activity-info {
  display: flex;
  align-items: center;
  font-size: 24rpx;
  color: #888;
  margin-bottom: 16rpx;
  flex-wrap: wrap;
}
.activity-info .iconfont {
  margin-right: 6rpx;
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
  width: 40rpx;
  height: 40rpx;
  border-radius: 50%;
  margin-right: -16rpx;
  border: 2rpx solid #fff;
  box-shadow: 0 1rpx 3rpx rgba(0, 0, 0, 0.05);
}
.participant-count {
  font-size: 24rpx;
  color: #888;
  margin-left: 24rpx;
}
.join-btn {
  min-width: 140rpx;
  height: 56rpx;
  padding: 0 32rpx;
  background: linear-gradient(90deg, #4080FF 0%, #60A9FF 100%);
  color: #fff;
  border-radius: 28rpx;
  font-size: 28rpx;
  font-weight: 600;
  border: none;
  box-shadow: 0 2rpx 8rpx rgba(64,128,255,0.10);
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;

  &.joined {
    background: linear-gradient(90deg, #999 0%, #bbb 100%);
    box-shadow: none;
  }
}
.join-btn:active {
  background: linear-gradient(90deg, #2255a4 0%, #4080FF 100%);
  transform: scale(0.97);
}
</style>