<template>
  <view class="chat-container">
    <!-- 聊天头部 -->
    <view class="chat-header">
      <view class="chat-header-left" @tap="goBack">
        <uni-icons type="arrowleft" size="24" color="#333"></uni-icons>
      </view>
      <view class="chat-header-middle">
        <image :src="chatPartner.avatar" class="chat-avatar"></image>
        <text class="chat-username">{{ chatPartner.nickname }}</text>
        <text v-if="chatPartner.online" class="chat-status">在线</text>
      </view>
      <view class="chat-header-right">
        <uni-icons type="more" size="24" color="#333" @click="showTaskMenu"></uni-icons>
      </view>
    </view>

    <!-- 任务信息卡片 -->
    <view class="task-card" v-if="taskInfo">
      <view class="task-header">
        <text class="task-title">{{ taskInfo.title }}</text>
        <text class="task-reward">赏金: {{ taskInfo.reward }}元</text>
      </view>
      <view class="task-details">
        <text class="task-type">任务类型: {{ getTaskTypeText(taskInfo.type) }}</text>
        <text v-if="taskInfo.pickupAddress" class="task-location">取件地址: {{ taskInfo.pickupAddress }}</text>
        <text v-if="taskInfo.deliveryAddress" class="task-location">送达地址: {{ taskInfo.deliveryAddress }}</text>
        <text v-if="taskInfo.expectedDeliveryTime" class="task-time">期望时间: {{ taskInfo.expectedDeliveryTime }}</text>
      </view>
      <view class="task-status" :class="taskInfo.status">
        状态: {{ getStatusText(taskInfo.status) }}
      </view>
    </view>

    <!-- 聊天消息区域 -->
    <scroll-view 
      class="chat-messages" 
      scroll-y="true"
      :scroll-into-view="scrollToId"
      scroll-with-animation
      @scrolltoupper="loadMoreMessages"
    >
      <!-- 加载更多提示 -->
      <view v-if="loadingMore" class="loading-more">
        <uni-icons type="spinner-cycle" size="20" color="#999" class="rotating"></uni-icons>
        <text>加载中...</text>
      </view>
      
      <view 
        v-for="(message, index) in chatMessages" 
        :key="message._id || index" 
        :id="'msg' + index"
        :class="['message-container', message.senderId === currentUserId? 'self' : 'other']"
      >
        <!-- 系统消息 -->
        <view v-if="message.type === 'system'" class="system-message">
          <text>{{ message.content }}</text>
        </view>
        
        <!-- 交易卡片 -->
        <view v-else-if="message.type === 'card'" class="trade-card">
          <text class="card-title">{{ message.title }}</text>
          <text class="card-content">{{ message.content }}</text>
          
          <!-- 未确认状态显示按钮 -->
          <view v-if="message.status === 'pending'" class="card-actions">
            <!-- 发布者可以确认派单 -->
            <button v-if="isPublisher && message.senderId !== currentUserId" class="card-button confirm" @click="confirmTask(message)">
              确认派单
            </button>
            <!-- 领取者可以确认接单 -->
            <button v-else-if="isAcceptor && message.senderId !== currentUserId" class="card-button confirm" @click="acceptTask(message)">
              确认接单
            </button>
            <!-- 发送者等待对方确认 -->
            <button v-else class="card-button" disabled>等待对方确认</button>
          </view>
          
          <!-- 已确认状态 -->
          <view v-else class="card-result">
            <uni-icons 
              :type="message.status === 'confirmed' ? 'checkmark-filled' : 'close-filled'" 
              size="20" 
              :color="message.status === 'confirmed' ? '#4CAF50' : '#F44336'"
            ></uni-icons>
            <text>{{ getCardStatusText(message.status) }}</text>
          </view>
        </view>
        
        <!-- 普通消息 -->
        <template v-else>
          <!-- 对方消息 -->
          <view v-if="message.senderId !== currentUserId" class="other-message">
            <image :src="message.senderAvatar" class="message-avatar"></image>
            <view class="message-content">
              <text class="sender-name">{{ chatPartner.nickname }}</text>
              <view class="message-bubble">
                <text class="message-text">{{ message.content }}</text>
                <text class="message-time">{{ formatTime(message.createTime) }}</text>
              </view>
            </view>
          </view>
          
          <!-- 自己消息 -->
          <view v-else class="self-message">
            <view class="message-content">
              <text class="sender-name">我</text>
              <view class="message-bubble">
                <text class="message-text">{{ message.content }}</text>
                <text class="message-time">{{ formatTime(message.createTime) }}</text>
                <view class="message-status">
                  <uni-icons 
                    v-if="message.status === 'sending'" 
                    type="spinner-cycle" 
                    size="14" 
                    color="#999"
                    class="rotating"
                  ></uni-icons>
                  <uni-icons 
                    v-else-if="message.status === 'sent'" 
                    type="checkmark" 
                    size="14" 
                    color="#999"
                  ></uni-icons>
                  <uni-icons 
                    v-else-if="message.status === 'read'" 
                    type="checkmark-filled" 
                    size="14" 
                    color="#4CAF50"
                  ></uni-icons>
                </view>
              </view>
            </view>
            <image :src="currentUserAvatar" class="message-avatar"></image>
          </view>
        </template>
      </view>
    </scroll-view>

    <!-- 消息输入区域 -->
    <view class="chat-input-area">
      <view class="input-left">
        <uni-icons type="image" size="28" color="#666" @click="sendImage"></uni-icons>
        <uni-icons type="location-filled" size="28" color="#666" @click="sendLocation"></uni-icons>
      </view>
      <view class="input-center">
        <input 
          v-model="inputMessage" 
          type="text" 
        placeholder="输入消息..."
          class="input-text"
          @confirm="sendTextMessage"
          confirm-type="send"
        />
      </view>
      <view class="input-right">
        <button 
          v-if="showSendCardButton"
          @click="sendTradeCard" 
          class="card-button"
        >
          {{ isPublisher ? '确认派单' : '确认接单' }}
        </button>
        <button 
          v-else
          @click="sendTextMessage" 
          :disabled="!inputMessage.trim() || sending"
          class="send-button"
        >
          {{ sending ? '发送中...' : '发送' }}
      </button>
      </view>
    </view>
    
    <!-- 任务操作菜单 -->
    <uni-popup ref="taskMenu" type="bottom">
      <view class="task-menu">
        <view class="menu-item" @click="viewTaskDetail">
          <uni-icons type="info" size="20" color="#333"></uni-icons>
          <text>查看任务详情</text>
        </view>
        <view class="menu-item" @click="cancelTask" v-if="taskInfo && taskInfo.status === 'pending'">
          <uni-icons type="close" size="20" color="#F44336"></uni-icons>
          <text>取消任务</text>
        </view>
        <view class="menu-item" @click="completeTask" v-if="taskInfo && taskInfo.status === 'processing' && isAcceptor">
          <uni-icons type="checkmark" size="20" color="#4CAF50"></uni-icons>
          <text>完成任务</text>
        </view>
        <view class="menu-item" @click="confirmReceipt" v-if="taskInfo && taskInfo.status === 'processing' && isPublisher">
          <uni-icons type="checkmark" size="20" color="#4CAF50"></uni-icons>
          <text>确认收货</text>
        </view>
        <view class="menu-item" @click="reportProblem">
          <uni-icons type="flag" size="20" color="#FF9800"></uni-icons>
          <text>报告问题</text>
        </view>
      </view>
    </uni-popup>
  </view>
</template>

<script>
export default {
  data() {
    return {
      // 用户信息
      currentUserId: '',
      currentUserAvatar: '',
      currentUserInfo: null,
      
      // 聊天对象信息
      chatPartner: {
        id: '',
        nickname: '',
        avatar: '',
        online: false
      },
      
      // 聊天数据
      chatMessages: [],
      inputMessage: '',
      scrollToId: '',
      
      // 任务信息
      taskInfo: null,
      taskId: '',
      
      // 用户角色
      isPublisher: false,
      isAcceptor: false,
      
      // 界面状态
      showSendCardButton: false,
      sending: false,
      loadingMore: false,
      hasMoreMessages: true,
      
      // 分页参数
      page: 1,
      pageSize: 20,
      
      // 定时器
      messageTimer: null,
      statusTimer: null,
      
      // 新增：接收 role 参数
      role: '',
      
      // 新增：partnerId
      partnerId: '',
      
      // 新增：taskList
      taskList: [],
      
      // 新增：selectedTask
      selectedTask: null,
    };
  },
  
  computed: {
    taskStatusText() {
      const statusMap = {
        pending: '待确认',
        processing: '进行中',
        completed: '已完成',
        cancelled: '已取消'
      };
      return statusMap[this.taskInfo?.status] || '';
    }
  },
  
  methods: {
    // 获取任务类型文本
    getTaskTypeText(type) {
      const typeMap = {
        'express': '快递代拿',
        'takeout': '外卖代拿',
        'buy': '求购',
        'sell': '出物',
        'other': '其他'
      };
      return typeMap[type] || type;
    },
    
    // 获取状态文本
    getStatusText(status) {
      const map = {
        pending: '待确认',
        processing: '进行中',
        completed: '已完成',
        cancelled: '已取消'
      };
      return map[status] || status;
    },
    
    // 返回上一页
    goBack() {
      uni.navigateBack();
    },
    
    // 格式化时间
    formatTime(time) {
      if (!time) return '';
      const date = new Date(time);
      const now = new Date();
      const diff = now - date;
      
      // 今天的消息只显示时间
      if (diff < 24 * 60 * 60 * 1000 && date.getDate() === now.getDate()) {
        return `${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`;
      }
      
      // 昨天的消息显示"昨天"
      if (diff < 48 * 60 * 60 * 1000 && date.getDate() === now.getDate() - 1) {
        return `昨天 ${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`;
      }
      
      // 其他显示完整日期
      return `${date.getMonth() + 1}-${date.getDate()} ${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`;
    },
    
    // 获取用户信息
    async getUserInfo() {
      try {
        const userInfoRaw = uni.getStorageSync('uni-id-pages-userInfo');
        let userInfo = userInfoRaw;
        if (typeof userInfoRaw === 'string') {
          userInfo = JSON.parse(userInfoRaw);
        }

        if (userInfo && userInfo._id) {
          this.currentUserId = userInfo._id;
          this.currentUserAvatar = (userInfo.avatar_file && userInfo.avatar_file.url) ? userInfo.avatar_file.url : '/static/images/default-avatar.png';
          this.currentUserInfo = userInfo;
          return userInfo;
        } else {
          throw new Error('Invalid user information in local storage.');
        }
      } catch (error) {
        console.error('Failed to get user info:', error);
        uni.showToast({
          title: '获取用户信息异常，请重新登录',
          icon: 'none',
          duration: 2000
        });
        return null;
      }
    },
    
    // 获取任务信息
    async getTaskInfo() {
      try {
        const result = await uniCloud.callFunction({
          name: 'getTaskDetail',
          data: {
            taskId: this.taskId
          }
        });
        
        if (result.result.code === 200) {
          this.taskInfo = result.result.data;
          
          // 这部分逻辑依然需要，但它不再重新判断和设置 isPublisher/isAcceptor
          // 而是基于已经固定的身份，来更新聊天对象的信息
          if (this.isPublisher) {
            // 发布者，聊天对象是领取者
            this.chatPartner = {
              id: this.taskInfo.acceptor_id,
              nickname: this.taskInfo.acceptor_name || '任务领取者',
              avatar: this.taskInfo.acceptor_avatar || '/static/images/avatar2.png',
              online: false
            };
          } else {
            // 领取者，聊天对象是发布者
            this.chatPartner = {
              id: this.taskInfo.publisher_id,
              nickname: this.taskInfo.publisher_name,
              avatar: this.taskInfo.publisher_avatar,
              online: false
            };
          }
          
          // 根据最新的任务状态和固定的身份，更新按钮的可见性
          if (this.isPublisher && this.taskInfo.status === 'pending') {
            this.showSendCardButton = true;
          } else if (this.isAcceptor && this.taskInfo.status === 'pending') {
            this.showSendCardButton = true;
          } else {
            this.showSendCardButton = false;
          }
        }
      } catch (error) {
        console.error('获取任务信息失败:', error);
        uni.showToast({
          title: '获取任务信息失败',
          icon: 'none'
        });
      }
    },

    // 加载更多消息
    async loadMoreMessages() {
      if (this.loadingMore || !this.hasMoreMessages) return;
      
      this.loadingMore = true;
      this.page++;
      
      try {
        await this.getChatMessages();
      } finally {
        this.loadingMore = false;
      }
    },
    
    // 发送文本消息
    async sendTextMessage() {
      if (this.inputMessage.trim() === '' || this.sending) return;
      
      const content = this.inputMessage.trim();
      this.inputMessage = '';
      this.sending = true;
      
      // 先添加到本地显示
      const tempMessage = {
        _id: 'temp_' + Date.now(),
    type: 'text',
        senderId: this.currentUserId,
        senderAvatar: this.currentUserAvatar,
        content: content,
        createTime: new Date().toISOString(),
        status: 'sending'
      };
      
      this.chatMessages.push(tempMessage);
      this.scrollToBottom();
      
      try {
        // 调用云函数发送消息
        const result = await uniCloud.callFunction({
          name: 'sendChatMessage',
          data: {
            taskId: this.taskId,
            content: content,
            type: 'text',
            receiverId: this.chatPartner.id
          }
        });
        
        if (result.result.code === 200) {
          // 更新消息状态
          const index = this.chatMessages.findIndex(msg => msg._id === tempMessage._id);
          if (index !== -1) {
            this.chatMessages[index] = {
              ...result.result.data,
              status: 'sent'
            };
          }
        } else {
          throw new Error(result.result.msg || '发送失败');
        }
      } catch (error) {
        console.error('发送消息失败:', error);
        
        // 更新消息状态为失败
        const index = this.chatMessages.findIndex(msg => msg._id === tempMessage._id);
        if (index !== -1) {
          this.chatMessages[index].status = 'failed';
        }
        
        uni.showToast({
          title: '发送失败',
          icon: 'none'
        });
      } finally {
        this.sending = false;
      }
    },
    
    // 发送交易确认卡片
    async sendTradeCard() {
      // 根据用户角色和任务状态生成不同的卡片内容
      let cardTitle = '';
      let cardContent = '';
      
      if (this.isPublisher) {
        // 发布者发送确认派单卡片
        cardTitle = '确认派单';
        cardContent = '我已确认将此任务派发给你，请开始执行任务。';
      } else {
        // 领取者发送接单确认卡片
        cardTitle = '任务确认';
        cardContent = '我已准备好执行任务，请确认将此任务派发给我';
      }
      
      try {
        const result = await uniCloud.callFunction({
          name: 'sendChatMessage',
          data: {
            taskId: this.taskId,
            content: cardContent,
            type: 'card',
            title: cardTitle,
            status: 'pending',
            receiverId: this.chatPartner.id
          }
        });
        
        if (result.result.code === 200) {
          this.chatMessages.push(result.result.data);
          this.scrollToBottom();
          
          // 如果是发布者发送的确认卡片，更新任务状态
          if (this.isPublisher) {
            this.taskInfo.status = 'processing';
            this.showSendCardButton = false;
          }
        }
      } catch (error) {
        console.error('发送交易卡失败:', error);
        uni.showToast({
          title: '发送失败',
          icon: 'none'
        });
      }
    },
    
    // 确认任务（发布者操作）
    async confirmTask(cardMessage) {
      try {
        // 更新卡片状态
        const result = await uniCloud.callFunction({
          name: 'updateTaskStatus',
          data: {
            taskId: this.taskId,
            status: 'processing',
            messageId: cardMessage._id
          }
        });
        
        if (result.result.code === 200) {
          // 更新本地状态
          cardMessage.status = 'confirmed';
          this.taskInfo.status = 'processing';
          this.showSendCardButton = false;
          
          // 添加系统消息
          this.chatMessages.push({
            type: 'system',
            content: `${this.chatPartner.nickname} 已确认任务派发`,
            createTime: new Date().toISOString()
          });
          
          this.scrollToBottom();
          
          uni.showToast({
            title: '任务已确认派发',
            icon: 'success'
          });
        }
      } catch (error) {
        console.error('确认任务失败:', error);
        uni.showToast({
          title: '操作失败',
          icon: 'none'
        });
      }
    },
    
    // 接受任务（领取者操作）
    async acceptTask(cardMessage) {
      try {
        // 更新卡片状态
        const result = await uniCloud.callFunction({
          name: 'updateTaskStatus',
          data: {
            taskId: this.taskId,
            status: 'processing',
            messageId: cardMessage._id
          }
        });
        
        if (result.result.code === 200) {
          // 更新本地状态
          cardMessage.status = 'confirmed';
          this.taskInfo.status = 'processing';
          
          // 添加系统消息
          this.chatMessages.push({
            type: 'system',
            content: `你已确认接受任务`,
            createTime: new Date().toISOString()
          });
          
          this.scrollToBottom();
          
          uni.showToast({
            title: '任务已确认接受',
            icon: 'success'
          });
        }
      } catch (error) {
        console.error('接受任务失败:', error);
        uni.showToast({
          title: '操作失败',
          icon: 'none'
        });
      }
    },
    
    // 滚动到底部
    scrollToBottom() {
      this.$nextTick(() => {
        if (this.chatMessages.length > 0) {
          this.scrollToId = 'msg' + (this.chatMessages.length - 1);
        }
      });
    },
    
    // 显示任务操作菜单
    showTaskMenu() {
      this.$refs.taskMenu.open();
    },
    
    // 获取卡片状态文本
    getCardStatusText(status) {
      const statusMap = {
        'confirmed': '任务已确认',
        'cancelled': '任务已取消',
        'pending': '等待确认'
      };
      return statusMap[status] || '未知状态';
    },
    
    // 查看任务详情
    viewTaskDetail() {
      uni.navigateTo({
        url: `/pages/task/TaskDetail/TaskDetail?id=${this.taskId}`
      });
    },
    
    // 取消任务
    async cancelTask() {
      uni.showModal({
        title: '确认取消',
        content: '确定要取消这个任务吗？',
        success: async (res) => {
          if (res.confirm) {
            try {
              const result = await uniCloud.callFunction({
                name: 'updateTaskStatus',
                data: {
                  taskId: this.taskId,
                  status: 'cancelled'
                }
              });
              
              if (result.result.code === 200) {
                this.taskInfo.status = 'cancelled';
                uni.showToast({
                  title: '任务已取消',
                  icon: 'success'
                });
              }
            } catch (error) {
              console.error('取消任务失败:', error);
              uni.showToast({
                title: '操作失败',
                icon: 'none'
              });
            }
          }
        }
      });
    },
    
    // 完成任务
    async completeTask() {
      uni.showModal({
        title: '确认完成',
        content: '确定任务已完成吗？',
        success: async (res) => {
          if (res.confirm) {
            try {
              const result = await uniCloud.callFunction({
                name: 'updateTaskStatus',
                data: {
                  taskId: this.taskId,
                  status: 'completed'
                }
              });
              
              if (result.result.code === 200) {
                this.taskInfo.status = 'completed';
                uni.showToast({
                  title: '任务已完成',
                  icon: 'success'
                });
              }
            } catch (error) {
              console.error('完成任务失败:', error);
              uni.showToast({
                title: '操作失败',
                icon: 'none'
              });
            }
          }
        }
      });
    },
    
    // 确认收货
    async confirmReceipt() {
      uni.showModal({
        title: '确认收货',
        content: '确认已收到任务成果吗？',
        success: async (res) => {
          if (res.confirm) {
            try {
              const result = await uniCloud.callFunction({
                name: 'updateTaskStatus',
                data: {
                  taskId: this.taskId,
                  status: 'completed'
                }
              });
              
              if (result.result.code === 200) {
                this.taskInfo.status = 'completed';
                uni.showToast({
                  title: '确认成功',
                  icon: 'success'
                });
              }
            } catch (error) {
              console.error('确认收货失败:', error);
              uni.showToast({
                title: '操作失败',
                icon: 'none'
              });
            }
          }
        }
      });
    },
    
    // 报告问题
    reportProblem() {
      uni.navigateTo({
        url: `/pages/report/report?taskId=${this.taskId}`
      });
    },
    
    // 发送图片
    sendImage() {
      uni.chooseImage({
        count: 1,
        success: (res) => {
          // 这里可以调用云函数上传图片
          uni.showToast({
            title: '图片发送功能开发中',
            icon: 'none'
          });
        }
      });
    },
    
    // 发送位置
    sendLocation() {
      uni.chooseLocation({
        success: (res) => {
          // 这里可以调用云函数发送位置信息
          uni.showToast({
            title: '位置发送功能开发中',
            icon: 'none'
          });
        }
      });
    },
    
    // 定时刷新消息
    startMessageTimer() {
      this.messageTimer = setInterval(async () => {
        await this.getAllMessagesWithPartner();
      }, 5000); // 每5秒刷新一次
    },
    
    // 停止定时器
    stopMessageTimer() {
      if (this.messageTimer) {
        clearInterval(this.messageTimer);
        this.messageTimer = null;
      }
      if (this.statusTimer) {
        clearInterval(this.statusTimer);
        this.statusTimer = null;
      }
    },
    
    // 如果是领取者且没有聊天记录，自动发送初始消息
    async sendInitialMessage() {
      try {
        // 根据任务类型生成不同的初始消息
        let messageContent = '';
        switch (this.taskInfo.type) {
          case 'express':
            messageContent = `你好！关于你发布的快递代拿任务，我可以接单。请问有什么需要注意的吗？`;
            break;
          case 'takeout':
            messageContent = `你好！关于你发布的外卖代拿任务，我可以接单。请问有什么需要注意的吗？`;
            break;
          case 'buy':
            messageContent = `你好！关于你发布的求购任务，我可以帮你寻找。请问有什么具体要求吗？`;
            break;
          case 'sell':
            messageContent = `你好！关于你发布的出物任务，我可以帮你处理。请问有什么需要注意的吗？`;
            break;
          default:
            messageContent = `你好！关于你发布的任务，我可以接单。请问有什么需要注意的吗？`;
        }
        
        const result = await uniCloud.callFunction({
          name: 'sendChatMessage',
          data: {
            taskId: this.taskId,
            content: messageContent,
            type: 'text',
            receiverId: this.chatPartner.id
          }
        });
        
        if (result.result.code === 200) {
          // 将发送的消息添加到本地聊天记录
          const sentMessage = {
            _id: result.result.data._id,
            type: 'text',
            senderId: this.currentUserId,
            senderAvatar: this.currentUserAvatar,
            content: messageContent,
            createTime: new Date().toISOString(),
            status: 'sent'
          };
          
          this.chatMessages.push(sentMessage);
          this.scrollToBottom();
          
          // 显示发送成功提示
          uni.showToast({
            title: '初始消息已发送',
            icon: 'success',
            duration: 1500
          });
        }
      } catch (error) {
        console.error('发送初始消息失败:', error);
        uni.showToast({
          title: '发送初始消息失败',
          icon: 'none'
        });
      }
    },
    
    // 获取对方信息
    async getPartnerInfo() {
      const res = await uniCloud.callFunction({
        name: 'getUserInfo',
        data: { userId: this.partnerId }
      });
      if (res.result.code === 200) {
        this.chatPartner = {
          id: this.partnerId,
          nickname: res.result.data.nickname,
          avatar: res.result.data.avatar_file?.url || '/static/images/default-avatar.png',
          online: false
        };
      }
    },
    
    // 获取所有任务
    async getAllTasksWithPartner() {
      const res = await uniCloud.callFunction({
        name: 'getTaskListWithUser',
        data: {
          userA: this.currentUserId,
          userB: this.partnerId
        }
      });
      if (res.result.code === 200) {
        this.taskList = res.result.data;
        this.selectedTask = this.taskList[0] || null;
      }
    },
    
    // 获取所有消息
    async getAllMessagesWithPartner() {
      const res = await uniCloud.callFunction({
        name: 'getChatMessagesWithUser',
        data: {
          userA: this.currentUserId,
          userB: this.partnerId
        }
      });
      if (res.result.code === 200) {
        this.chatMessages = res.result.data;
        this.$nextTick(() => this.scrollToBottom());
      }
    },
    
    // 切换任务卡片
    selectTask(task) {
      this.selectedTask = task;
    },
  },
  
  async onLoad(options) {
    // 获取路由参数
    this.taskId = options.taskId || options.id;
    this.role = options.role || ''; // 从跳转中获取预设的角色
    this.partnerId = options.partnerId;
    
    if (!this.taskId) {
      uni.showToast({
        title: '缺少任务ID',
        icon: 'none'
      });
      setTimeout(() => {
        uni.navigateBack();
      }, 1500);
      return;
    }
    
    // 1. 首先，可靠地获取当前用户信息
    const userInfo = await this.getUserInfo();
    if (!userInfo) {
      // 如果获取用户信息失败，则中断后续操作并返回上一页
      setTimeout(() => { uni.navigateBack(); }, 2000);
      return;
    }

    // 2. 获取任务的初始信息，这将用于身份判断
    const initialTaskResult = await uniCloud.callFunction({
      name: 'getTaskDetail',
      data: { taskId: this.taskId }
    });

    if (initialTaskResult.result.code !== 200) {
      uni.showToast({ title: '无法获取任务信息', icon: 'none' });
  uni.navigateBack();
      return;
    }
    this.taskInfo = initialTaskResult.result.data;

    // 3. 【核心】进行一次性的、最终的身份判断
    if (this.role === 'acceptor') {
      // 如果URL中明确指定了是领取者，则直接采纳
      this.isAcceptor = true;
      this.isPublisher = false;
    } else {
      // 否则，根据获取到的初始任务信息和稳定的 currentUserId 进行判断
      this.isPublisher = this.currentUserId === this.taskInfo.publisher_id;
      this.isAcceptor = !this.isPublisher;
    }

    // 4. 根据已确定的身份，初始化一次UI（聊天伙伴信息、按钮状态）
    // 后续的刷新将由 getTaskInfo 内部的定时器负责
    if (this.isPublisher) {
      this.chatPartner = {
        id: this.taskInfo.acceptor_id,
        nickname: this.taskInfo.acceptor_name || '任务领取者',
        avatar: this.taskInfo.acceptor_avatar || '/static/images/avatar2.png',
        online: false
      };
    } else {
      this.chatPartner = {
        id: this.taskInfo.publisher_id,
        nickname: this.taskInfo.publisher_name,
        avatar: this.taskInfo.publisher_avatar,
        online: false
      };
    }
    if (this.isPublisher && this.taskInfo.status === 'pending') {
      this.showSendCardButton = true;
    } else if (this.isAcceptor && this.taskInfo.status === 'pending') {
      this.showSendCardButton = true;
    } else {
      this.showSendCardButton = false;
    }

    // 5. 获取历史聊天消息
    await this.getAllMessagesWithPartner();

    // 6. 如果是领取者且没有聊天记录，自动发送初始消息
    if (this.isAcceptor && this.chatMessages.length === 0) {
      await this.sendInitialMessage();
    }

    // 7. 启动定时刷新
    this.startMessageTimer();

    // 8. 获取对方信息
    await this.getPartnerInfo();

    // 9. 获取所有任务
    await this.getAllTasksWithPartner();

    // 10. 获取所有消息
    await this.getAllMessagesWithPartner();
  },
  
  onUnload() {
    // 停止定时器
    this.stopMessageTimer();
  },
  
  onShow() {
    if (this.partnerId) {
      this.getAllMessagesWithPartner();
    }
  }
};
</script>

<style lang="scss">
.chat-container {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #f0f0f0;
}

.chat-header {
  height: 120rpx;
  background-color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20rpx;
  border-bottom: 1rpx solid #eee;
  
  .chat-header-left, .chat-header-right {
    width: 80rpx;
    display: flex;
    justify-content: center;
  }
  
  .chat-header-middle {
    flex: 1;
  display: flex;
    flex-direction: column;
  align-items: center;
  justify-content: center;
}

  .chat-avatar {
    width: 60rpx;
    height: 60rpx;
    border-radius: 50%;
    margin-bottom: 5rpx;
  }
  
  .chat-username {
    font-size: 30rpx;
    font-weight: 500;
    color: #333;
  }
  
  .chat-status {
    font-size: 24rpx;
    color: #4CAF50;
  }
}

.task-card {
  background: #ffffff;
  border-radius: 16rpx;
  padding: 20rpx;
  margin: 20rpx;
  box-shadow: 0 4rpx 12rpx rgba(0,0,0,0.05);
  
  .task-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 15rpx;
  }
  
  .task-title {
  font-size: 32rpx;
  font-weight: bold;
    color: #333;
  }
  
  .task-reward {
    font-size: 28rpx;
    color: #FF5722;
    font-weight: bold;
  }
  
  .task-details {
    display: flex;
    flex-direction: column;
    margin-bottom: 15rpx;
    
    text {
      font-size: 26rpx;
      color: #666;
      margin-bottom: 8rpx;
    }
  }
  
  .task-status {
    font-size: 26rpx;
    padding: 8rpx 15rpx;
    border-radius: 20rpx;
    background: #f5f5f5;
    text-align: center;
    
    &.pending {
      color: #FF9800;
      background: #FFF8E1;
    }
    
    &.processing {
      color: #2196F3;
      background: #E3F2FD;
    }
    
    &.completed {
      color: #4CAF50;
      background: #E8F5E9;
    }
    
    &.cancelled {
      color: #F44336;
      background: #FFEBEE;
    }
  }
}

.chat-messages {
  flex: 1;
  overflow: hidden;
  padding: 20rpx;
  box-sizing: border-box;
  background-color: #f0f0f0;
}

.loading-more {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20rpx;
  color: #999;
  font-size: 26rpx;
  
  text {
    margin-left: 10rpx;
  }
}

.message-container {
  margin-bottom: 30rpx;
  
  .system-message {
    text-align: center;
    padding: 10rpx 20rpx;
    
    text {
      font-size: 24rpx;
      color: #999;
      background: rgba(0,0,0,0.05);
      padding: 5rpx 15rpx;
      border-radius: 20rpx;
    }
  }
  
  .trade-card {
    background: #ffffff;
    border-radius: 16rpx;
    padding: 25rpx;
    box-shadow: 0 4rpx 12rpx rgba(0,0,0,0.08);
    
    .card-title {
      font-size: 32rpx;
      font-weight: bold;
      color: #333;
      display: block;
      margin-bottom: 15rpx;
    }
    
    .card-content {
      font-size: 28rpx;
      color: #666;
      display: block;
  margin-bottom: 20rpx;
}

    .card-actions {
      display: flex;
      justify-content: center;
    }
    
    .card-result {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 10rpx;
      font-size: 28rpx;
      color: #4CAF50;
      
      text {
  margin-left: 10rpx;
      }
    }
  }
  
  .card-button {
    background: #07C160;
    color: white;
    border: none;
    border-radius: 40rpx;
    padding: 0 40rpx;
    height: 70rpx;
    line-height: 70rpx;
    font-size: 28rpx;
    
    &.confirm {
      background: #2196F3;
    }
  }
  
  .other-message {
    display: flex;
    align-items: flex-start;
    
    .message-avatar {
      width: 80rpx;
      height: 80rpx;
      border-radius: 10rpx;
      margin-right: 20rpx;
    }
    
    .message-content {
      max-width: 70%;
    }
    
    .sender-name {
      font-size: 26rpx;
      color: #666;
      margin-bottom: 10rpx;
      display: block;
    }
  }
  
  .self-message {
    display: flex;
    justify-content: flex-end;
    align-items: flex-start;
    
    .message-avatar {
      width: 80rpx;
      height: 80rpx;
      border-radius: 10rpx;
      margin-left: 20rpx;
    }
    
    .message-content {
      max-width: 70%;
      display: flex;
      flex-direction: column;
      align-items: flex-end;
    }
    
    .sender-name {
      font-size: 26rpx;
      color: #666;
      margin-bottom: 10rpx;
      display: block;
    }
  }
  
  .message-bubble {
  position: relative;
    padding: 20rpx 25rpx;
    border-radius: 12rpx;
    min-height: 80rpx;
    box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
}

  .other-message .message-bubble {
    background-color: #fff;
  border-top-left-radius: 0;
}

  .self-message .message-bubble {
    background-color: #95ec69;
  border-top-right-radius: 0;
}

  .message-text {
    font-size: 32rpx;
    color: #333;
    line-height: 1.5;
  }
  
  .message-time {
  font-size: 24rpx;
    color: #999;
    margin-top: 10rpx;
    display: block;
  text-align: right;
}

  .message-status {
    position: absolute;
    bottom: 15rpx;
    right: 15rpx;
    display: flex;
    align-items: center;
  }
}

.chat-input-area {
  height: 110rpx;
  background-color: #fff;
  display: flex;
  align-items: center;
  padding: 15rpx 20rpx;
  border-top: 1rpx solid #eee;
  
  .input-left {
    display: flex;
    align-items: center;
    margin-right: 20rpx;
    
    uni-icons {
      margin-right: 25rpx;
    }
  }
  
  .input-center {
    flex: 1;
    
    .input-text {
      height: 80rpx;
      background-color: #f5f5f5;
      border-radius: 40rpx;
      padding: 0 30rpx;
      font-size: 30rpx;
    }
  }
  
  .input-right {
    margin-left: 20rpx;
    
    .send-button {
      height: 80rpx;
      min-width: 120rpx;
      line-height: 80rpx;
      background-color: #07C160;
      color: #fff;
      border-radius: 40rpx;
      font-size: 30rpx;
      padding: 0 30rpx;
      
      &[disabled] {
        background-color: #ccc;
      }
    }
    
    .card-button {
      height: 80rpx;
      line-height: 80rpx;
      background-color: #2196F3;
      color: #fff;
      border-radius: 40rpx;
      font-size: 28rpx;
      padding: 0 25rpx;
    }
  }
}

.task-menu {
  background: #fff;
  border-radius: 30rpx 30rpx 0 0;
  padding: 30rpx;
  
  .menu-item {
  display: flex;
  align-items: center;
    padding: 25rpx 0;
    border-bottom: 1rpx solid #eee;
    
    &:last-child {
      border-bottom: none;
    }
    
    uni-icons {
      margin-right: 20rpx;
    }
    
    text {
      font-size: 30rpx;
      color: #333;
    }
  }
}

.rotating {
  animation: rotating 1s linear infinite;
}

@keyframes rotating {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style>