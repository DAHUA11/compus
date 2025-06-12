<template>
  <view class="container">
    <!-- 顶部导航栏 -->
    <view class="navbar">
      <view class="navbar-left">
        <text class="navbar-title">消息</text>
        <view class="navbar-action" @click="clearUnread">
          <text class="action-icon">🧹</text>
          <text class="action-text">清除未读</text>
        </view>
      </view>
    </view>

    <!-- 搜索栏 -->
    <view class="search-bar">
      <view class="search-icon">🔍</view>
      <input 
        type="text" 
        v-model="searchQuery" 
        placeholder="搜索聊天记录/联系人" 
        class="search-input"
        @input="handleSearch"
      />
      <view v-if="searchHistory.length > 0" class="search-history">
        <view 
          v-for="(item, index) in searchHistory" 
          :key="index"
          class="history-item"
          @click="searchQuery = item"
        >
          <text>{{ item }}</text>
          <text class="delete-icon" @click.stop="searchHistory.splice(index, 1)">×</text>
        </view>
      </view>
    </view>
    
    <!-- 消息板块 -->
    <scroll-view 
      scroll-y 
      class="message-content" 
      @pulldownrefresh="onPullDownRefresh" 
      @reachbottom="onReachBottom"
      @scroll="onScroll"
    >
      <!-- 通知消息板块 -->
      <view class="section">
        <view class="section-header" @click="toggleNotifications">
          <view class="section-title-wrapper">
            <text class="section-icon notification-icon">📢</text>
            <text class="section-title">通知消息</text>
          </view>
          <text v-if="unreadNotificationCount > 0" class="unread-count">{{ unreadNotificationCount }}</text>
        </view>
        <view v-for="(group, date) in groupMessagesByDate(displayedNotifications)" :key="date" class="message-group">
          <view 
            v-for="(notification, index) in group" 
            :key="index"
            class="message-item notification-item"
            :class="messageItemClass(notification)"
            @click="readNotification(notification)"
            @longpress="showMessageActions(notification, $event)"
          >
            <view class="message-header">
              <text v-if="notification.pinned" class="pin-icon">📌</text>
            </view>
            <text>{{ notification.text }}</text>
          </view>
        </view>
        <view v-if="displayedNotifications.length === 0 && filteredNotifications.length === 0" class="empty-state">
          <text>暂无通知消息</text>
        </view>
      </view>

      <!-- 互动消息板块 -->
      <view class="section">
        <view class="section-header" @click="toggleInteractions">
          <view class="section-title-wrapper">
            <text class="section-icon interaction-icon">💬</text>
            <text class="section-title">互动消息</text>
          </view>
          <text v-if="unreadInteractionCount > 0" class="unread-count">{{ unreadInteractionCount }}</text>
        </view>
        <view v-for="(group, date) in groupMessagesByDate(displayedInteractions)" :key="date" class="message-group">
          <view 
            v-for="(interaction, index) in group" 
            :key="index"
            class="message-item interaction-item"
            :class="messageItemClass(interaction)"
            @click="readInteraction(interaction)"
            @longpress="showMessageActions(interaction, $event)"
          >
            <view class="message-header">
              <text v-if="interaction.pinned" class="pin-icon">📌</text>
            </view>
            <image class="avatar" :src="interaction.avatar || '/static/default-avatar.png'" mode="aspectFill"></image>
            <view class="interaction-details">
              <text class="interaction-content">{{ interaction.content }}</text>
            </view>
          </view>
        </view>
        <view v-if="displayedInteractions.length === 0 && filteredInteractions.length === 0" class="empty-state">
          <text>暂无互动消息</text>
        </view>
      </view>

      <!-- 推荐类消息板块 -->
      <view class="section">
        <view class="section-header" @click="toggleRecommendations">
          <view class="section-title-wrapper">
            <text class="section-icon recommendation-icon">⭐</text>
            <text class="section-title">推荐消息</text>
          </view>
          <text v-if="unreadRecommendationCount > 0" class="unread-count">{{ unreadRecommendationCount }}</text>
        </view>
        <view v-for="(group, date) in groupMessagesByDate(displayedRecommendations)" :key="date" class="message-group">
          <view 
            v-for="(recommendation, index) in group" 
            :key="index"
            class="message-item recommendation-item"
            :class="messageItemClass(recommendation)"
            @click="navigateToRecommendation(recommendation)"
            @longpress="showMessageActions(recommendation, $event)"
          >
            <view class="message-header">
              <text v-if="recommendation.pinned" class="pin-icon">📌</text>
            </view>
            <text>{{ recommendation.text }}</text>
            <text class="message-time">{{ formatTime(recommendation.time) }}</text>
          </view>
        </view>
        <view v-if="displayedRecommendations.length === 0 && filteredRecommendations.length === 0" class="empty-state">
          <text>暂无推荐消息</text>
        </view>
      </view>

      <!-- 交易评价提醒板块 -->
      <view class="section">
        <view class="section-header" @click="toggleReviews">
          <view class="section-title-wrapper">
            <text class="section-icon review-icon">📝</text>
            <text class="section-title">交易评价提醒</text>
          </view>
          <text v-if="unreadReviewCount > 0" class="unread-count">{{ unreadReviewCount }}</text>
        </view>
        <view v-for="(group, date) in groupMessagesByDate(displayedReviews)" :key="date" class="message-group">
          <view 
            v-for="(review, index) in group" 
            :key="index"
            class="message-item review-item"
            :class="messageItemClass(review)"
            @click="navigateToReview(review)"
            @longpress="showMessageActions(review, $event)"
          >
            <view class="message-header">
              <text v-if="review.pinned" class="pin-icon">📌</text>
            </view>
            <text class="transaction-success">交易成功</text>
            <text>{{ review.text }}</text>
            <button class="review-button">去评价</button>
            <text class="message-time">{{ formatTime(review.time) }}</text>
          </view>
        </view>
        <view v-if="displayedReviews.length === 0 && filteredReviews.length === 0" class="empty-state">
          <text>暂无评价提醒</text>
        </view>
      </view>

      <!-- 加载状态提示 -->
      <view v-if="loading" class="loading-state">
        <view class="loading-skeleton">
          <view class="skeleton-item" v-for="i in 3" :key="i"></view>
        </view>
      </view>
      <view v-if="noMore" class="no-more-state">
        <text>没有更多了</text>
      </view>
    </scroll-view>
  </view>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { onShow, onPullDownRefresh, onReachBottom, onLoad, onUnload } from '@dcloudio/uni-app';

// 模拟数据
const notifications = ref([
  // 官方通知
  { text: '官方通知：近期有新的社区活动即将开启，请留意公告。', read: false, time: Date.now() - 1 * 60 * 60 * 1000, category: 'official' },
  { text: '官方通知：平台规则已更新，请查看最新版。', read: false, time: Date.now() - 3 * 60 * 60 * 1000, category: 'official' },
  
  // 发布者消息
  { text: '您的求购水杯任务已被用户TestClaimer领取。', read: false, time: Date.now() - 5 * 60 * 60 * 1000, category: 'publisher', subtype: 'claimed' },
  { text: '您发布的快递代取任务已完成。', read: true, time: Date.now() - 7 * 60 * 60 * 1000, category: 'publisher', subtype: 'completed' },
  
  // 领取者消息
  { text: '您领取的跑腿任务将在5分钟后到期，请尽快完成。', read: false, time: Date.now() - 10 * 60 * 1000, category: 'claimer', subtype: 'nearing_expiry' },
  { text: '您完成的求购书籍任务已被发布者评价。', read: true, time: Date.now() - 9 * 60 * 60 * 1000, category: 'claimer', subtype: 'reviewed' },
]);

const interactions = ref([
  // 评论互动
  { 
    content: '用户TestUser评论了您的任务：这个任务描述很清晰，希望能尽快完成！', 
    read: false, 
    time: Date.now() - 2 * 60 * 60 * 1000, 
    category: 'comment',
    avatar: '/static/avatar1.png'
  },
  { 
    content: '用户TestUser2回复了您的评论：谢谢您的建议，我会尽快处理。', 
    read: true, 
    time: Date.now() - 4 * 60 * 60 * 1000, 
    category: 'reply',
    avatar: '/static/avatar2.png'
  },
  
  // 点赞互动
  { 
    content: '用户TestUser3赞了您的任务发布', 
    read: false, 
    time: Date.now() - 6 * 60 * 60 * 1000, 
    category: 'like',
    avatar: '/static/avatar3.png'
  },
]);

const recommendations = ref([
  { 
    text: '根据您的兴趣，推荐查看"校园跑腿"相关任务', 
    read: false, 
    time: Date.now() - 8 * 60 * 60 * 1000, 
    category: 'task_recommendation'
  },
  { 
    text: '您可能感兴趣的新活动：校园二手交易节', 
    read: true, 
    time: Date.now() - 12 * 60 * 60 * 1000, 
    category: 'activity_recommendation'
  },
]);

const reviews = ref([
  { 
    text: '您的快递代取任务已完成，请对服务进行评价', 
    read: false, 
    time: Date.now() - 15 * 60 * 1000, 
    category: 'delivery_review'
  },
  { 
    text: '您的求购任务已完成，请对商品进行评价', 
    read: true, 
    time: Date.now() - 2 * 60 * 60 * 1000, 
    category: 'purchase_review'
  },
]);

// 状态变量
const searchQuery = ref('');
const searchHistory = ref([]);
const loading = ref(false);
const noMore = ref(false);
const expandedSections = ref({
  notifications: true,
  interactions: true,
  recommendations: true,
  reviews: true
});

// 计算属性
const unreadNotificationCount = computed(() => {
  return notifications.value.filter(n => !n.read).length;
});

const unreadInteractionCount = computed(() => {
  return interactions.value.filter(i => !i.read).length;
});

const unreadRecommendationCount = computed(() => {
  return recommendations.value.filter(r => !r.read).length;
});

const unreadReviewCount = computed(() => {
  return reviews.value.filter(r => !r.read).length;
});

const displayedNotifications = computed(() => {
  if (!expandedSections.value.notifications) return [];
  return notifications.value;
});

const displayedInteractions = computed(() => {
  if (!expandedSections.value.interactions) return [];
  return interactions.value;
});

const displayedRecommendations = computed(() => {
  if (!expandedSections.value.recommendations) return [];
  return recommendations.value;
});

const displayedReviews = computed(() => {
  if (!expandedSections.value.reviews) return [];
  return reviews.value;
});

// 方法
const handleSearch = () => {
  // 实现搜索逻辑
  console.log('搜索:', searchQuery.value);
};

const clearUnread = () => {
  notifications.value.forEach(n => n.read = true);
  interactions.value.forEach(i => i.read = true);
  recommendations.value.forEach(r => r.read = true);
  reviews.value.forEach(r => r.read = true);
};

const toggleNotifications = () => {
  expandedSections.value.notifications = !expandedSections.value.notifications;
};

const toggleInteractions = () => {
  expandedSections.value.interactions = !expandedSections.value.interactions;
};

const toggleRecommendations = () => {
  expandedSections.value.recommendations = !expandedSections.value.recommendations;
};

const toggleReviews = () => {
  expandedSections.value.reviews = !expandedSections.value.reviews;
};

const readNotification = (notification) => {
  notification.read = true;
};

const readInteraction = (interaction) => {
  interaction.read = true;
};

const navigateToRecommendation = (recommendation) => {
  // 实现导航逻辑
  console.log('导航到推荐:', recommendation);
};

const navigateToReview = (review) => {
  // 实现导航逻辑
  console.log('导航到评价:', review);
};

const showMessageActions = (message, event) => {
  // 实现长按菜单逻辑
  console.log('显示消息操作:', message);
};

const messageItemClass = (message) => {
  return {
    'unread': !message.read,
    'pinned': message.pinned
  };
};

const groupMessagesByDate = (messages) => {
  const groups = {};
  messages.forEach(message => {
    const date = new Date(message.time).toLocaleDateString();
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(message);
  });
  return groups;
};

const formatTime = (timestamp) => {
  const date = new Date(timestamp);
  return date.toLocaleTimeString();
};

// 生命周期钩子
onLoad(() => {
  console.log('页面加载');
});

onShow(() => {
  console.log('页面显示');
});

onUnload(() => {
  console.log('页面卸载');
});

onPullDownRefresh(() => {
  console.log('下拉刷新');
  setTimeout(() => {
    uni.stopPullDownRefresh();
  }, 1000);
});

onReachBottom(() => {
  console.log('触底加载更多');
  if (!noMore.value) {
    loading.value = true;
    setTimeout(() => {
      loading.value = false;
      noMore.value = true;
    }, 1000);
  }
});

onScroll((e) => {
  console.log('滚动事件:', e);
});
</script>

<style>
.container {
  flex: 1;
  background-color: #f5f5f5;
}

.navbar {
  padding: 20rpx;
  background-color: #ffffff;
  border-bottom: 1rpx solid #eeeeee;
}

.navbar-left {
  flex-direction: row;
  align-items: center;
}

.navbar-title {
  font-size: 36rpx;
  font-weight: bold;
}

.navbar-action {
  margin-left: 20rpx;
  flex-direction: row;
  align-items: center;
}

.action-icon {
  font-size: 32rpx;
  margin-right: 8rpx;
}

.action-text {
  font-size: 28rpx;
  color: #666666;
}

.search-bar {
  margin: 20rpx;
  padding: 20rpx;
  background-color: #ffffff;
  border-radius: 10rpx;
  flex-direction: row;
  align-items: center;
}

.search-icon {
  font-size: 32rpx;
  margin-right: 10rpx;
}

.search-input {
  flex: 1;
  height: 60rpx;
  font-size: 28rpx;
}

.search-history {
  margin-top: 20rpx;
}

.history-item {
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding: 10rpx 0;
}

.delete-icon {
  color: #999999;
  font-size: 32rpx;
}

.message-content {
  flex: 1;
}

.section {
  margin: 20rpx;
  background-color: #ffffff;
  border-radius: 10rpx;
}

.section-header {
  padding: 20rpx;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1rpx solid #eeeeee;
}

.section-title-wrapper {
  flex-direction: row;
  align-items: center;
}

.section-icon {
  font-size: 32rpx;
  margin-right: 10rpx;
}

.section-title {
  font-size: 32rpx;
  font-weight: bold;
}

.unread-count {
  background-color: #ff4d4f;
  color: #ffffff;
  font-size: 24rpx;
  padding: 4rpx 12rpx;
  border-radius: 20rpx;
}

.message-group {
  padding: 20rpx;
}

.message-item {
  padding: 20rpx;
  margin-bottom: 20rpx;
  background-color: #f9f9f9;
  border-radius: 10rpx;
}

.message-header {
  flex-direction: row;
  align-items: center;
  margin-bottom: 10rpx;
}

.pin-icon {
  font-size: 28rpx;
  margin-right: 10rpx;
}

.avatar {
  width: 80rpx;
  height: 80rpx;
  border-radius: 40rpx;
  margin-right: 20rpx;
}

.interaction-details {
  flex: 1;
}

.interaction-content {
  font-size: 28rpx;
  color: #333333;
}

.message-time {
  font-size: 24rpx;
  color: #999999;
  margin-top: 10rpx;
}

.transaction-success {
  color: #52c41a;
  font-size: 28rpx;
  margin-bottom: 10rpx;
}

.review-button {
  margin-top: 20rpx;
  background-color: #1890ff;
  color: #ffffff;
  font-size: 28rpx;
  padding: 10rpx 30rpx;
  border-radius: 30rpx;
}

.empty-state {
  padding: 40rpx;
  align-items: center;
}

.loading-state {
  padding: 20rpx;
  align-items: center;
}

.loading-skeleton {
  width: 100%;
}

.skeleton-item {
  height: 100rpx;
  background-color: #f0f0f0;
  margin-bottom: 20rpx;
  border-radius: 10rpx;
}

.no-more-state {
  padding: 20rpx;
  align-items: center;
}

.unread {
  background-color: #e6f7ff;
}

.pinned {
  border-left: 4rpx solid #1890ff;
}
</style>