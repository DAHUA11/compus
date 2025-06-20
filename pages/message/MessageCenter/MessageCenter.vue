<template>
  <view>
    <view class="message-center-container">
      <!-- 顶部导航栏 -->
      <view class="navbar">
        <text class="navbar-title">消息中心</text>
        <view class="navbar-action" @click="clearUnread">
          <uni-icons type="trash" size="20" color="#666"></uni-icons>
          <text class="action-text">清除未读</text>
        </view>
      </view>

      <!-- 功能按钮区 -->
      <scroll-view scroll-x class="function-buttons">
        <view 
          v-for="button in functionButtons" 
          :key="button.type"
          class="function-button"
          :class="{ active: activeButton === button.type }"
          @click="switchFunction(button.type)"
        >
          <view class="button-icon">
            <uni-icons :type="button.icon" size="28" :color="activeButton === button.type ? '#1890ff' : '#666'"></uni-icons>
          </view>
          <text class="button-text">{{ button.text }}</text>
          <view v-if="button.badge > 0" class="button-badge">{{ button.badge }}</view>
        </view>
      </scroll-view>

      <!-- 对话列表 -->
      <scroll-view 
        scroll-y 
        class="conversation-list"
        @scrolltolower="loadMore"
      >
        <!-- 私信模块 -->
        <view v-if="activeButton === 'private'" class="message-group">
          <view class="group-date">私信列表</view>
          <view 
            v-for="(conversation, index) in privateMessages" 
            :key="index"
            class="conversation-item"
            :class="{ unread: !conversation.read }"
            @click="enterPrivateChat(conversation)"
            @longpress="showPrivateActions(conversation)"
          >
            <image :src="conversation.avatar" class="avatar" @error="e => e.target.src='/static/images/default-avatar.png'"></image>
            
            <view class="conversation-content">
              <view class="conversation-header">
                <text class="nickname">{{ conversation.nickname }}</text>
                <text class="time">{{ formatTime(conversation.time) }}</text>
              </view>
              
              <view class="message-preview">
                <text class="message-text">{{ conversation.lastMessage }}</text>
                <view v-if="conversation.unread > 0" class="unread-badge">
                  {{ conversation.unread > 99 ? '99+' : conversation.unread }}
                </view>
              </view>
            </view>
          </view>
          
          <view v-if="privateMessages.length === 0" class="empty-state">
            <text>暂无私信消息</text>
        </view>
      </view>

        <!-- 互动消息模块 -->
        <view v-if="activeButton === 'interaction'" class="message-group">
          <view class="group-date">互动消息</view>
          <view 
            v-for="(interaction, index) in interactionMessages" 
            :key="index"
            class="conversation-item"
            :class="{ unread: !interaction.read }"
            @click="viewInteraction(interaction)"
          >
            <image :src="interaction.avatar" class="avatar"></image>
            
            <view class="conversation-content">
              <view class="conversation-header">
                <text class="nickname">{{ interaction.nickname }}</text>
                <text class="time">{{ formatTime(interaction.time) }}</text>
              </view>
              
              <view class="message-preview">
                <text class="message-text">{{ interaction.content }}</text>
                <view v-if="interaction.unread > 0" class="unread-badge">
                  {{ interaction.unread > 99 ? '99+' : interaction.unread }}
                </view>
              </view>
              
              <view class="interaction-type">
                <text>{{ getInteractionTypeText(interaction.type) }}</text>
              </view>
            </view>
          </view>
          
          <view v-if="interactionMessages.length === 0" class="empty-state">
            <text>暂无互动消息</text>
          </view>
        </view>
        
        <!-- 通知消息模块 -->
        <view v-if="activeButton === 'notification'" class="message-group">
          <view class="group-date">系统通知</view>
          <view 
            v-for="(notification, index) in notificationMessages" 
            :key="index"
            class="conversation-item"
            :class="{ unread: !notification.read }"
            @click="viewNotification(notification)"
          >
            <image :src="notification.avatar" class="avatar"></image>
            
            <view class="conversation-content">
              <view class="conversation-header">
                <text class="nickname">{{ notification.title }}</text>
                <text class="time">{{ formatTime(notification.time) }}</text>
              </view>
              
              <view class="message-preview">
                <text class="message-text">{{ notification.content }}</text>
                <view v-if="notification.unread > 0" class="unread-badge">
                  {{ notification.unread > 99 ? '99+' : notification.unread }}
                </view>
              </view>
              
              <view class="notification-type">
                <text>{{ notification.type === 'task' ? '任务通知' : '系统通知' }}</text>
              </view>
            </view>
          </view>
          
          <view v-if="notificationMessages.length === 0" class="empty-state">
            <text>暂无通知消息</text>
          </view>
        </view>
        
        <!-- 推荐消息模块 -->
        <view v-if="activeButton === 'recommend'" class="message-group">
          <view class="group-date">推荐消息</view>
          <view 
            v-for="(recommend, index) in recommendMessages" 
            :key="index"
            class="conversation-item"
            :class="{ unread: !recommend.read }"
            @click="viewRecommend(recommend)"
          >
            <image :src="recommend.avatar" class="avatar"></image>
            
            <view class="conversation-content">
              <view class="conversation-header">
                <text class="nickname">{{ recommend.title }}</text>
                <text class="time">{{ formatTime(recommend.time) }}</text>
              </view>
              
              <view class="message-preview">
                <text class="message-text">{{ recommend.content }}</text>
                <view v-if="recommend.unread > 0" class="unread-badge">
                  {{ recommend.unread > 99 ? '99+' : recommend.unread }}
                </view>
              </view>

              <view class="recommend-type">
                <text>{{ recommend.type === 'task' ? '任务推荐' : '活动推荐' }}</text>
              </view>
            </view>
          </view>
          
          <view v-if="recommendMessages.length === 0" class="empty-state">
            <text>暂无推荐消息</text>
          </view>
        </view>
        
        <!-- 加载状态 -->
        <view v-if="loading" class="loading-state">
          <uni-icons type="spinner-cycle" size="24" color="#999" class="rotating"></uni-icons>
          <text>加载中...</text>
      </view>

        <view v-if="noMore" class="no-more">
          <text>没有更多消息了</text>
      </view>
      </scroll-view>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue'

// 当前激活tab
const activeButton = ref('private')

// 私信会话列表（动态获取）
const privateMessages = ref([])

// 时间格式化
function formatTime(time) {
  if (!time) return ''
  const date = new Date(time)
  const now = new Date()
  const diff = now - date
  if (diff < 60 * 1000) return '刚刚'
  if (diff < 60 * 60 * 1000) return Math.floor(diff / 60000) + '分钟前'
  if (diff < 24 * 60 * 60 * 1000 && date.getDate() === now.getDate()) {
    return `${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`
  }
  if (diff < 48 * 60 * 60 * 1000 && date.getDate() === now.getDate() - 1) {
    return `昨天 ${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`
  }
  return `${date.getMonth() + 1}-${date.getDate()} ${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`
}

// 获取当前用户ID
function getCurrentUserId() {
  try {
    let userInfo = uni.getStorageSync('uni-id-pages-userInfo')
    if (!userInfo) return ''
    // 兼容字符串和对象
    if (typeof userInfo === 'string') {
      userInfo = JSON.parse(userInfo)
    }
    return userInfo._id || ''
  } catch (e) {
    return ''
  }
}

// 获取私信会话列表（每个用户一条最新消息）
async function fetchPrivateMessages() {
  const userId = getCurrentUserId()
  console.log('[调试] 当前userId:', userId)
  if (!userId) return
  try {
    const result = await uniCloud.callFunction({
      name: 'getChatList',
      data: { userId }
    })
    console.log('[调试] getChatList返回:', result)
    if (result.result.code === 200 && Array.isArray(result.result.data)) {
      privateMessages.value = result.result.data.map(conv => ({
        id: conv.partnerId,
        avatar: conv.partnerAvatar || '/static/images/default-avatar.png',
        nickname: conv.partnerNickname || '对方',
        lastMessage: conv.lastMessage || '',
        time: conv.lastMessageTime || '',
        read: !conv.unread || conv.unread === 0,
        unread: conv.unread || 0,
        lastTaskId: conv.lastTaskId,
        lastMessageType: conv.lastMessageType
      }))
      console.log('[调试] privateMessages.value:', privateMessages.value)
    }
  } catch (e) {
    console.error('[fetchPrivateMessages] 获取私信会话失败', e)
  }
}

onMounted(() => {
  const userInfo = uni.getStorageSync('userInfo')
  console.log('[onMounted] userInfo:', userInfo)
  const userId = getCurrentUserId()
  console.log('[onMounted] 当前userId:', userId)
  console.log('[onMounted] 当前activeButton:', activeButton.value)
  if (activeButton.value === 'private') fetchPrivateMessages()
})

// 切换功能按钮
function switchFunction(type) {
  console.log('[switchFunction] 切换tab:', type)
  activeButton.value = type
  if (type === 'private') fetchPrivateMessages()
}

// 跳转到聊天页
function enterPrivateChat(conversation) {
  uni.navigateTo({
    url: `/pages/message/Chat/Chat?partnerId=${conversation.id}&taskId=${conversation.lastTaskId}`
  })
}

// 互动、通知、推荐等模块的响应式数据和方法可根据后端接口后续补充
function viewInteraction() {}
function viewNotification() {}
function viewRecommend() {}
function showPrivateActions() {}
function clearUnread() {}
function updateUnreadCounts() {}
function loadMore() {}
function getInteractionTypeText(type) {
  const typeMap = {
    'like': '点赞',
    'comment': '评论',
    'reply': '回复',
    'follow': '关注'
  }
  return typeMap[type] || type
}
function goIndex() {
  uni.navigateTo({ url: '/pages/index/index' })
}
function gocircle() {
  uni.navigateTo({ url: '/pages/circle/circle' })
}
function gouser() {
  uni.navigateTo({ url: '/pages/user/user' })
}
</script>

<script>
export default {
  data() {
    return {
      activeButton: 'private', // 默认显示私信模块
      loading: false,
      noMore: false,
      page: 1,
      pageSize: 10,
      functionButtons: [
        { type: 'private', icon: 'chat', text: '私信', badge: 3 },
        { type: 'interaction', icon: 'heart', text: '互动', badge: 5 },
        { type: 'notification', icon: 'notification', text: '通知', badge: 2 },
        { type: 'recommend', icon: 'star', text: '推荐', badge: 1 }
      ],
      // 互动消息（点赞、评论等）
      interactionMessages: [
        {
          id: 'ia1',
          type: 'like',
          avatar: '/static/avatars/user4.jpg',
          nickname: '校园同学',
          content: '点赞了您的任务发布',
          time: Date.now() - 1000 * 60 * 60, // 1小时前
          read: false,
          unread: 1,
          postId: 'post123'
        },
        {
          id: 'ia2',
          type: 'comment',
          avatar: '/static/avatars/user5.jpg',
          nickname: '热心校友',
          content: '评论了您的任务：这个任务描述很清晰，希望能尽快完成！',
          time: Date.now() - 1000 * 60 * 60 * 3, // 3小时前
          read: false,
          unread: 1,
          postId: 'post456'
        },
        {
          id: 'ia3',
          type: 'reply',
          avatar: '/static/avatars/user6.jpg',
          nickname: '同校学长',
          content: '回复了您的评论：谢谢您的建议，我会尽快处理',
          time: Date.now() - 1000 * 60 * 60 * 5, // 5小时前
          read: true,
          unread: 0,
          postId: 'post789'
        }
      ],
      // 通知消息（任务相关）
      notificationMessages: [
        {
          id: 'nt1',
          type: 'task',
          avatar: '/static/avatars/system.png',
          title: '任务通知',
          content: '您的"代拿外卖"任务已被用户TestUser领取',
          time: Date.now() - 1000 * 60 * 10, // 10分钟前
          read: false,
          unread: 1,
          taskId: 'task111'
        },
        {
          id: 'nt2',
          type: 'task',
          avatar: '/static/avatars/system.png',
          title: '任务通知',
          content: '您领取的"教材求购"任务将在1小时后到期',
          time: Date.now() - 1000 * 60 * 60, // 1小时前
          read: false,
          unread: 1,
          taskId: 'task222'
        },
        {
          id: 'nt3',
          type: 'system',
          avatar: '/static/avatars/system.png',
          title: '系统通知',
          content: '您的账号信用分已更新，当前信用分：120',
          time: Date.now() - 1000 * 60 * 60 * 24, // 1天前
          read: true,
          unread: 0
        }
      ],
      // 推荐消息
      recommendMessages: [
        {
          id: 'rc1',
          type: 'task',
          avatar: '/static/avatars/recommend.png',
          title: '任务推荐',
          content: '根据您的兴趣，推荐查看"校园跑腿"相关任务',
          time: Date.now() - 1000 * 60 * 60 * 2, // 2小时前
          read: false,
          unread: 1,
          taskId: 'task333'
        },
        {
          id: 'rc2',
          type: 'activity',
          avatar: '/static/avatars/recommend.png',
          title: '活动推荐',
          content: '您可能感兴趣的新活动：校园二手交易节',
          time: Date.now() - 1000 * 60 * 60 * 24, // 1天前
          read: true,
          unread: 0,
          activityId: 'activity123'
        }
      ]
    }
  },
  methods: {
    // 切换功能按钮
    switchFunction(type) {
      this.activeButton = type
      this.page = 1
      this.noMore = false
    },
    
    // 进入私信聊天
    enterPrivateChat(conversation) {
      console.log('进入私信:', conversation.id)
      // 标记为已读
      conversation.read = true
      conversation.unread = 0
      this.updateUnreadCounts()
      
      uni.navigateTo({
        url: `/pages/message/private-chat?id=${conversation.id}&taskId=${conversation.lastTaskId}`
      })
    },

    // 查看互动消息
    viewInteraction(interaction) {
      console.log('查看互动:', interaction.id)
      interaction.read = true
      interaction.unread = 0
      this.updateUnreadCounts()
      
      // 跳转到对应的帖子
      uni.navigateTo({
        url: `/pages/community/post?id=${interaction.postId}`
      })
    },
    
    // 查看通知消息
    viewNotification(notification) {
      console.log('查看通知:', notification.id)
      notification.read = true
      notification.unread = 0
      this.updateUnreadCounts()
      
      if (notification.type === 'task') {
        // 跳转到任务详情
        uni.navigateTo({
          url: `/pages/task/detail?id=${notification.taskId}`
        })
      }
    },
    
    // 查看推荐消息
    viewRecommend(recommend) {
      console.log('查看推荐:', recommend.id)
      recommend.read = true
      recommend.unread = 0
      this.updateUnreadCounts()
      
      if (recommend.type === 'task') {
        uni.navigateTo({
          url: `/pages/task/detail?id=${recommend.taskId}`
        })
      } else {
        uni.navigateTo({
          url: `/pages/activity/detail?id=${recommend.activityId}`
        })
      }
    },

    // 显示私信操作菜单
    showPrivateActions(conversation) {
      uni.showActionSheet({
        itemList: ['置顶聊天', '标记未读', '删除聊天'],
        success: (res) => {
          console.log('选择了:', res.tapIndex)
          // 处理操作
        }
      })
    },

    // 清除所有未读
    clearUnread() {
      this.privateMessages.forEach(c => c.read = true)
      this.interactionMessages.forEach(i => i.read = true)
      this.notificationMessages.forEach(n => n.read = true)
      this.recommendMessages.forEach(r => r.read = true)
      
      this.updateUnreadCounts()
      uni.showToast({
        title: '已清除未读消息',
        icon: 'success'
      })
    },

    // 更新功能按钮的未读计数
    updateUnreadCounts() {
      this.functionButtons[0].badge = this.privateMessages.filter(c => !c.read).length
      this.functionButtons[1].badge = this.interactionMessages.filter(i => !i.read).length
      this.functionButtons[2].badge = this.notificationMessages.filter(n => !n.read).length
      this.functionButtons[3].badge = this.recommendMessages.filter(r => !r.read).length
    },
    
    // 加载更多数据
    loadMore() {
      if (this.noMore || this.loading) return
      
      this.loading = true
      console.log('加载更多数据...')
      
      // 模拟加载更多数据
        setTimeout(() => {
        let newData = []
        
        if (this.activeButton === 'private') {
          newData = [{
            id: 'pm' + (this.privateMessages.length + 1),
            type: 'private',
            avatar: '/static/avatars/user' + (this.privateMessages.length + 1) + '.jpg',
            nickname: '新用户' + (this.privateMessages.length + 1),
            lastMessage: '你好，我想咨询任务详情',
            time: Date.now() - 1000 * 60 * 60 * 24 * this.page,
            read: false,
            unread: 1,
            taskType: '咨询',
            taskId: 'task' + (this.privateMessages.length + 1)
          }]
          this.privateMessages = [...this.privateMessages, ...newData]
        } 
        // 其他模块的加载逻辑类似...
        
        this.page++
        this.loading = false
        
        // 模拟没有更多数据
        if (this.page >= 3) {
          this.noMore = true
        }
      }, 1000)
    },
    
    // 获取互动类型文本
    getInteractionTypeText(type) {
      const typeMap = {
        'like': '点赞',
        'comment': '评论',
        'reply': '回复',
        'follow': '关注'
      }
      return typeMap[type] || type
    }
  }
}
</script>

<style scoped>
.message-center-container {
  min-height: 100vh;
  background: #f6f8fc;
  display: flex;
  flex-direction: column;
}

.navbar {
  height: 110rpx;
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 32rpx;
  border-bottom: 1rpx solid #e0e6f1;
  box-shadow: 0 2rpx 8rpx rgba(160,180,220,0.08);
}
.navbar-title {
  font-size: 38rpx;
  font-weight: bold;
  color: #333;
  letter-spacing: 2rpx;
}
.navbar-action {
  display: flex;
  align-items: center;
  gap: 16rpx;
  font-size: 28rpx;
  color: #666;
}
.action-text {
  margin-left: 6rpx;
  font-size: 28rpx;
  color: #666;
}

/* 顶部功能按钮横向滚动区 */
.function-buttons {
  width: 100%;
  background: #fff;
  padding: 18rpx 0 8rpx 0;
  box-shadow: 0 2rpx 8rpx rgba(160,180,220,0.04);
  white-space: nowrap;
  overflow-x: auto;
}
.function-button {
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 120rpx;
  margin: 0 18rpx;
  position: relative;
  cursor: pointer;
  border-radius: 20rpx;
  transition: background 0.2s;
}
.function-button.active {
  background: linear-gradient(135deg, #e6f7ff 0%, #bae7ff 100%);
}
.button-icon {
  width: 60rpx;
  height: 60rpx;
  border-radius: 50%;
  background: #f6f8fc;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 8rpx;
  box-shadow: 0 2rpx 8rpx #e6f7ff80;
}
.button-text {
  font-size: 26rpx;
  color: #333;
  margin-top: 2rpx;
}
.button-badge {
  position: absolute;
  top: 10rpx;
  right: 22rpx;
  min-width: 28rpx;
  height: 28rpx;
  background: #ff3b30;
  color: #fff;
  font-size: 20rpx;
  border-radius: 28rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 8rpx;
  box-shadow: 0 2rpx 8rpx #ff3b30a0;
  font-weight: bold;
  z-index: 2;
}

/* 对话/消息列表区 */
.conversation-list {
  flex: 1;
  background: #f6f8fc;
  padding: 0 0 20rpx 0;
}
.message-group {
  margin: 24rpx 0 0 0;
}
.group-date {
  font-size: 26rpx;
  color: #8a99b3;
  margin: 0 0 12rpx 32rpx;
  font-weight: 500;
}
.conversation-item {
  display: flex;
  flex-direction: row;
  align-items: center;
  margin: 0 24rpx 18rpx 24rpx;
  background: #fff;
  border-radius: 24rpx;
  box-shadow: 0 4rpx 24rpx rgba(160,180,220,0.10);
  min-height: 110rpx;
  padding: 0 24rpx;
  position: relative;
  transition: box-shadow 0.2s, background 0.2s;
}
.conversation-item:active {
  box-shadow: 0 2rpx 8rpx rgba(58,141,255,0.10);
  background: #e6f7ff;
}
.conversation-item.unread {
  background: #e6f7ff;
}
.avatar {
  width: 80rpx;
  height: 80rpx;
  border-radius: 50%;
  background: #e9f0fb;
  border: 2rpx solid #e0e6f1;
  object-fit: cover;
  margin-right: 20rpx;
}
.conversation-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
}
.conversation-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.nickname {
  font-size: 32rpx;
  color: #222;
  font-weight: 500;
  margin-right: 12rpx;
  display: flex;
  align-items: center;
}
.time {
  font-size: 24rpx;
  color: #bbb;
  margin-left: 12rpx;
}
.message-preview {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 8rpx;
}
.message-text {
  font-size: 26rpx;
  color: #8a99b3;
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.unread-badge {
  min-width: 36rpx;
  height: 36rpx;
  background: #ff3b30;
  color: #fff;
  font-size: 22rpx;
  border-radius: 36rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 10rpx;
  margin-left: 12rpx;
  box-shadow: 0 2rpx 8rpx #ff3b30a0;
  font-weight: bold;
}
.interaction-type, .notification-type, .recommend-type {
  margin-top: 6rpx;
  font-size: 22rpx;
  color: #1890ff;
  background: #e6f7ff;
  border-radius: 8rpx;
  padding: 2rpx 12rpx;
  display: inline-block;
}

.empty-state {
  height: 300rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #bbb;
  font-size: 30rpx;
}
.loading-state {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 30rpx 0 10rpx 0;
  color: #999;
  font-size: 28rpx;
}
.rotating {
  animation: rotating 1s linear infinite;
}
@keyframes rotating {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
.no-more {
  text-align: center;
  color: #bbb;
  font-size: 26rpx;
  padding: 20rpx 0 10rpx 0;
}
</style>