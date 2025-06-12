<template>
  <view class="message-center-container">
    <!-- 顶部导航栏 -->
    <view class="header">
      <text class="header-title">消息</text>
      <view class="header-settings-icon" @tap="goToSettings">
        <!-- 齿轮图标占位符 -->
        <text>设置</text>
      </view>
    </view>

    <!-- 通知消息 -->
    <view class="message-section notification-messages" @tap="goToNotificationDetails">
      <view class="section-icon">
        <!-- 铃铛图标占位符 -->
        <text>&#x1F514;</text> 
      </view>
      <view class="section-content">
        <text class="section-title">通知消息</text>
        <text class="section-prompt" v-if="notificationMessage.prompt">{{ notificationMessage.prompt }}</text>
      </view>
      <view class="unread-dot" v-if="notificationMessage.hasUnread"></view>
    </view>

    <!-- 互动消息 -->
    <view class="message-section interaction-messages">
       <view class="section-header">
         <text class="section-title">互动消息</text>
         <!-- 未读红点或计数 -->
         <view class="unread-dot" v-if="interactionUnreadCount > 0">{{ interactionUnreadCount }}</view>
       </view>
      <scroll-view class="interaction-list" scroll-y>
        <view v-if="interactionMessages.length === 0 && !interactionLoading" class="empty-state">
          <image src="/static/images/empty_notification.png" mode="aspectFit" class="empty-icon" />
          <text class="empty-text">暂无新的互动通知</text>
        </view>
         <view 
           class="interaction-item" 
           v-for="msg in interactionMessages" 
           :key="msg.id"
           @tap="handleInteractionClick(msg)"
         >
           <view class="item-icon">
             <!-- 互动类型图标占位符 -->
              <text>{{ getInteractionIcon(msg.type) }}</text>
           </view>
           <view class="item-content">
             <text class="item-title" :class="{'is-read': msg.isRead}">{{ getInteractionTitle(msg.type) }}</text>
             <text class="item-snippet">{{ msg.snippet }}</text>
           </view>
            <view class="item-time">{{ formatTime(msg.time) }}</view>
             <view class="unread-dot small" v-if="!msg.isRead"></view>
         </view>
          <!-- 加载更多提示 -->
          <view class="loading-more" v-if="interactionLoading"><text>加载中...</text></view>
          <view class="loading-more" v-else-if="!hasMoreInteractions && interactionMessages.length > 0"><text>没有更多了</text></view>
      </scroll-view>
    </view>
    
    <!-- 闲鱼精选 -->
    <view class="message-section selection-messages" @tap="goToSelectionPage">
      <view class="section-icon">
         <!-- 购物袋图标占位符 -->
        <text>&#x1F6CD;</text>
      </view>
      <view class="section-content">
        <text class="section-title">闲鱼精选</text>
        <text class="section-prompt">{{ selectionMessage.prompt }}</text>
      </view>
       <view class="unread-dot" v-if="selectionMessage.hasUnread"></view>
    </view>

    <!-- 交易成功/评价提醒 -->
     <view class="message-section review-prompts" v-if="reviewPrompts.length > 0">
        <view class="section-header">
            <text class="section-title">订单与评价</text>
        </view>
        <view 
            class="review-item" 
            v-for="prompt in reviewPrompts" 
            :key="prompt.id"
            @tap="goToReview(prompt.orderId)"
        >
             <view class="item-icon">
                 <!-- 星星图标占位符 -->
                 <text>&#x2B50;</text>
             </view>
             <view class="item-content">
                 <text class="item-prompt-text">{{ prompt.text }}</text>
             </view>
             <view class="review-button">去评价</view>
        </view>
     </view>
     
  </view>
</template>

<script>
import { ref, onMounted } from 'vue';
import { onShow, onPullDownRefresh, onReachBottom } from '@dcloudio/uni-app';

export default {
  setup() {
    // 模拟数据
    const notificationMessage = ref({
      prompt: '您有待使用的权益即将到期，点击查看', // 例如优惠券、积分等
      hasUnread: true,
      jumpUrl: '/pages/BenefitsCenter/BenefitsCenter' // 假设有权益中心页面
    });

    const interactionMessages = ref([]); // 互动消息列表
    const interactionUnreadCount = ref(0);
    const interactionLoading = ref(false);
    const hasMoreInteractions = ref(true);
    const interactionPage = ref(1);

    const selectionMessage = ref({
      prompt: '发现更多宝贝，上闲鱼精选！',
      hasUnread: false,
      jumpUrl: '/pages/SelectionPage/SelectionPage' // 假设有精选页面
    });

    const reviewPrompts = ref([]); // 评价提醒列表

    // 模拟获取互动消息列表
    const loadInteractionMessages = async (isRefresh = false) => {
      console.log('loadInteractionMessages called, isRefresh:', isRefresh);
      if (interactionLoading.value) return;

      interactionLoading.value = true;
      if (isRefresh) {
        interactionPage.value = 1;
        hasMoreInteractions.value = true;
      }
      if (!hasMoreInteractions.value && !isRefresh) {
          interactionLoading.value = false;
          return;
      }

      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 800)); 

      const mockMessages = [
        { id: 1, type: 'reply', snippet: '回复了您的评论...', isRead: false, time: Date.now(), jumpUrl: '/pages/TaskDetail/TaskDetail?id=task1#comment' },
        { id: 2, type: 'like', snippet: '点赞了您的商品...', isRead: true, time: Date.now() - 60000, jumpUrl: '/pages/GoodsDetail/GoodsDetail?id=goods1' },
        { id: 3, type: 'follow', snippet: '关注了您...', isRead: false, time: Date.now() - 120000, jumpUrl: '/pages/UserProfile/UserProfile?id=user1' },
         { id: 4, type: 'reply', snippet: '回复了您的评论...', isRead: true, time: Date.now() - 180000, jumpUrl: '/pages/TaskDetail/TaskDetail?id=task2#comment' },
        { id: 5, type: 'like', snippet: '点赞了您的商品...', isRead: true, time: Date.now() - 240000, jumpUrl: '/pages/GoodsDetail/GoodsDetail?id=goods2' },
      ];
      
      const pageSize = 4; // 模拟每页加载数量
      const start = (interactionPage.value - 1) * pageSize;
      const end = start + pageSize;
      const list = mockMessages.slice(start, end);

      if (isRefresh) {
        interactionMessages.value = list;
      } else {
        interactionMessages.value = [...interactionMessages.value, ...list];
      }

      interactionUnreadCount.value = interactionMessages.value.filter(msg => !msg.isRead).length;
      hasMoreInteractions.value = list.length === pageSize;

      if (hasMoreInteractions.value && !isRefresh) {
        interactionPage.value++;
      }

      interactionLoading.value = false;
      uni.stopPullDownRefresh(); // 停止页面下拉刷新动画
    };

    // 模拟获取评价提醒
    const loadReviewPrompts = async () => {
         console.log('loadReviewPrompts called');
          // 模拟API调用
         await new Promise(resolve => setTimeout(resolve, 500)); 
         
         // 模拟数据
         reviewPrompts.value = [
             { id: 101, orderId: 'order_001', text: '您的订单已完成，快去给TA一个评价吧！' },
             { id: 102, orderId: 'order_002', text: '请对本次交易进行评价。' },
         ];
    };

    // 格式化时间
    const formatTime = (time) => {
      const date = new Date(time)
      const now = new Date();
      const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / 60000);
      
      if (diffInMinutes < 1) return '刚刚';
      if (diffInMinutes < 60) return `${diffInMinutes}分钟前`;
      if (diffInMinutes < 24 * 60) return `${Math.floor(diffInMinutes / 60)}小时前`;
      if (diffInMinutes < 7 * 24 * 60) return `${Math.floor(diffInMinutes / (24 * 60))}天前`;
      
      return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
    };

    // 获取互动类型图标 (模拟)
    const getInteractionIcon = (type) => {
        const iconMap = {
            reply: '&#x1F4AC;', // 对话气泡
            like: '&#x2764;', // 红心
            follow: '&#x1F464;' // 人物
        };
        return iconMap[type] || '&#x1F4C3;'; // 默认图标 (文件)
    };

    // 获取互动类型标题 (模拟)
    const getInteractionTitle = (type) => {
        const titleMap = {
            reply: '评论和回复',
            like: '赞和收藏',
            follow: '新增关注'
        };
        return titleMap[type] || '互动通知';
    };

    // 跳转到设置页面
    const goToSettings = () => {
      console.log('Navigate to settings page');
      // uni.navigateTo({ url: '/pages/MessageSettings/MessageSettings' }); // 假设有设置页面
    };

    // 跳转到通知详情页/权益中心
    const goToNotificationDetails = () => {
       console.log('Navigate to notification details/benefits center', notificationMessage.value.jumpUrl);
       if(notificationMessage.value.jumpUrl) {
            // uni.navigateTo({ url: notificationMessage.value.jumpUrl });
       }
    };

    // 处理互动消息点击
    const handleInteractionClick = (msg) => {
      console.log('Handle interaction click', msg);
      // 标记为已读（模拟）
      msg.isRead = true;
       interactionUnreadCount.value = interactionMessages.value.filter(m => !m.isRead).length;
      // 跳转到关联页面
       if(msg.jumpUrl) {
           // uni.navigateTo({ url: msg.jumpUrl });
       }
    };

    // 跳转到评价页面
    const goToReview = (orderId) => {
        console.log('Navigate to review page for order', orderId);
        // uni.navigateTo({ url: `/pages/ReviewPage/ReviewPage?orderId=${orderId}` }); // 假设有评价页面
    };

    // 下拉刷新
    onPullDownRefresh(() => {
       console.log('onPullDownRefresh triggered');
       loadInteractionMessages(true);
    });

    // 上拉加载
    onReachBottom(() => {
       console.log('onReachBottom triggered');
       loadInteractionMessages(false);
    });

    onMounted(() => {
       console.log('MessageCenter onMounted');
       // 页面挂载后不立即加载，等待 onShow
    });

    onShow(() => {
      console.log('MessageCenter onShow');
      // 每次进入页面时加载数据
      loadInteractionMessages(true); // 刷新互动消息
      loadReviewPrompts(); // 加载评价提醒
    });

    return {
      notificationMessage,
      interactionMessages,
      interactionUnreadCount,
      interactionLoading,
      hasMoreInteractions,
      selectionMessage,
      reviewPrompts,
      formatTime,
      getInteractionIcon,
      getInteractionTitle,
      goToSettings,
      goToNotificationDetails,
      handleInteractionClick,
      goToReview
    };
  }
};
</script>

<style scoped>
/* 页面容器 */
.message-center-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh; /* 最小高度为视口高度 */
  background-color: #f8f8f8;
  padding-bottom: 20rpx; /* 底部留白 */
}

/* 顶部导航栏 */
.header {
  height: 100rpx;
  background-color: #ffffff;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 30rpx;
  border-bottom: 1rpx solid #eeeeee;
  position: sticky; /* 吸顶 */
  top: 0;
  z-index: 10;
}

.header-title {
  font-size: 36rpx;
  font-weight: bold;
  color: #333;
}

.header-settings-icon {
  font-size: 36rpx; /* 图标大小 */
  color: #666; /* 图标颜色 */
}

/* 消息区域通用样式 */
.message-section {
  margin: 20rpx 30rpx 0; /* 上左右外边距 */
  padding: 25rpx; /* 内边距 */
  background-color: #ffffff;
  border-radius: 12rpx;
  box-shadow: 0 2rpx 8rpx rgba(0,0,0,0.05);
  display: flex;
  align-items: center;
  position: relative; /* 用于定位红点 */
}

.message-section .section-icon {
  width: 60rpx; /* 图标区域宽度 */
  height: 60rpx;
  margin-right: 25rpx;
  /* background-color: #e0e0e0; /* 图标背景 */
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 36rpx; /* 模拟图标大小 */
}

.message-section .section-content {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.message-section .section-title {
  font-size: 30rpx;
  font-weight: bold;
  color: #333333;
  margin-bottom: 8rpx;
}

.message-section .section-prompt {
  font-size: 26rpx;
  color: #ff7d00; /* 强调色 */
}

/* 未读红点 */
.unread-dot {
  position: absolute;
  top: 15rpx; /* 根据需要调整位置 */
  right: 15rpx; /* 根据需要调整位置 */
  width: 20rpx; 
  height: 20rpx;
  background-color: #ff4d4f; /* 红色 */
  border-radius: 50%;
  /* border: 2rpx solid #ffffff; */
  z-index: 5;
}
/* 未读红点（带数字） */
.unread-dot.small {
   width: 16rpx; 
   height: 16rpx;
}

.section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    margin-bottom: 15rpx;
}

.section-header .unread-dot {
    position: static;
    width: auto;
    height: auto;
    background: none;
    border-radius: 0;
    color: #ff4d4f; /* 红色数字 */
    font-size: 26rpx;
    font-weight: bold;
    margin-left: 10rpx;
}

/* 互动消息列表 */
.interaction-messages {
    flex-direction: column; /* 垂直布局 */
    align-items: flex-start; /* 左对齐 */
}

.interaction-list {
    width: 100%; /* 占据父容器宽度 */
    /* height: 300rpx; /* 示例高度，可根据内容调整或使用flex */ 
}

.interaction-item {
    display: flex;
    align-items: center;
    padding: 15rpx 0;
    border-bottom: 1rpx solid #f5f5f5; /* 列表项分隔线 */
     position: relative;
}

.interaction-item .item-icon {
    width: 50rpx;
    height: 50rpx;
    margin-right: 20rpx;
    /* background-color: #d0d0d0; */
    border-radius: 50%;
     display: flex;
    justify-content: center;
    align-items: center;
    font-size: 30rpx;
}

.interaction-item .item-content {
    flex: 1;
    display: flex;
    flex-direction: column;
}

.interaction-item .item-title {
    font-size: 28rpx;
    color: #333;
    margin-bottom: 5rpx;
}
.interaction-item .item-title.is-read {
    font-weight: normal;
    color: #666;
}

.interaction-item .item-snippet {
    font-size: 24rpx;
    color: #999;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.interaction-item .item-time {
    font-size: 22rpx;
    color: #999;
    margin-left: 20rpx;
    flex-shrink: 0; /* 防止时间被压缩 */
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 50rpx 0;
  color: #999;
  font-size: 28rpx;
}
.empty-icon {
    width: 100rpx;
    height: 100rpx;
     margin-bottom: 15rpx;
}

/* 评价提醒样式 */
.review-prompts {
    flex-direction: column;
     align-items: flex-start;
}

.review-item {
    display: flex;
    align-items: center;
    padding: 15rpx 0;
     border-bottom: 1rpx solid #f5f5f5;
     width: 100%; /* 占据父容器宽度 */
}

.review-item .item-icon {
    width: 50rpx;
    height: 50rpx;
    margin-right: 20rpx;
    /* background-color: #ffcc00; /* 星星颜色 */ 
     border-radius: 50%;
     display: flex;
    justify-content: center;
    align-items: center;
     font-size: 30rpx;
}

.review-item .item-content {
    flex: 1;
    display: flex;
    flex-direction: column;
}

.review-item .item-prompt-text {
    font-size: 28rpx;
    color: #333;
}

.review-button {
    background-color: #00bfff; /* 柔和的蓝色 */
    color: white;
    font-size: 26rpx;
    padding: 8rpx 20rpx;
    border-radius: 30rpx;
    margin-left: 20rpx;
    flex-shrink: 0;
}

/* 加载更多提示 */
.loading-more {
    text-align: center;
    padding: 20rpx;
    font-size: 28rpx;
    color: #999;
}

</style>