<template>
  <view class="container">
  
    
  
   

    <!-- 任务信息区域 -->
    <view class="task-info">
      <!-- 标题和类型容器 -->
      <view class="task-header-flex">
        <view class="task-title">
          <template v-if="task.type === 'buy'">求购 - {{ task.title }}</template>
          <template v-else-if="task.type === 'sell'">{{ task.title }}</template>
          <template v-else-if="['express', 'takeout'].includes(task.type)">{{ task.title }} - {{ task.pickupAddress }}</template>
          <template v-else>{{ task.title }}</template>
        </view>
        <view class="task-type-container">
          <view class="task-type">
            <text class="type-tag" :class="task.type">{{ getTaskTypeText(task.type) }}</text>
            <text v-if="task.tags && task.tags.includes('加急')" class="urgent-tag">加急</text>
            <text class="task-status-tag" :class="task.status">
              {{ getTaskStatusText(task.status) }}
            </text>
          </view>
        </view>
      </view>
      <view class="task-time">
        <text class="time-label">发布时间：</text>
        <text class="time-value">{{  formatPublishTime(task.publishTime) }}</text>
      </view>
      <!-- 期望送达时间 - 仅在快递或外卖显示 -->
      <view class="task-time" v-if="['express', 'takeout'].includes(task.type)">
        <text class="time-label">期望送达时间：</text>
        <text class="time-value">{{ task.expectedDeliveryTime }}</text>
      </view>
      <view class="task-reward">
        <text class="reward-label">赏金：</text>
        <text class="reward-value">¥{{ task.reward }}</text>
      </view>
       <!-- 商品成色 - 在出物和求购任务显示 -->
      <view class="task-time" v-if="['sell', 'buy'].includes(task.type)">
        <text class="time-label">商品成色：</text>
        <text class="time-value">{{ getConditionText(task.selectedCondition) }}</text>
      </view>
    </view>
 <!-- 图片轮播区域 -->
 <view class="image-slider" v-if="task.images && task.images.length > 0 && ['buy', 'sell', 'takeout'].includes(task.type)">
      <swiper :indicator-dots="true" :autoplay="false" :interval="3000" :duration="500">
        <swiper-item v-for="(image, index) in task.images" :key="index">
          <image :src="image" mode="aspectFill" class="slider-image" @error="handleImageError" />
        </swiper-item>
      </swiper>
    </view>
    <!-- 任务描述区域 -->
    <view class="description-section" v-if="task.type !== 'other'">
      <view class="section-title">具体说明</view>
      <view class="description-text">{{ task.description }}</view>
    </view>

    <!-- 具体信息区域 - 快递和外卖显示地址信息，出物不显示 -->
    <view class="address-section" v-if="['express', 'takeout'].includes(task.type)">
      <view class="section-title">地址信息</view>
      <view class="address-item">
        <view class="address-label">取件地址：</view>
        <view class="address-content">
          <text class="address-text">{{ task.pickupAddress }}</text>
        </view>
      </view>
      <!-- 快递单号，仅在快递代取任务显示 -->
      <view class="address-item" v-if="task.type === 'express'">
        <view class="address-label">快递单号：</view>
        <view class="address-content">
          <text class="address-text">{{ task.trackingNumber }}</text>
        </view>
      </view>
      <view class="address-item">
        <view class="address-label">送达地址：</view>
        <view class="address-content">
          <text class="address-text">{{ task.deliveryAddress }}</text>
        </view>
      </view>
    </view>

    <!-- 联系人信息区域 -->
    <view class="publisher-section">
      <view class="section-title">{{ task.type === 'express' ? '收件人信息' : '联系信息' }}</view>
      <view class="publisher-info">
        <!-- 仅在快递代取或出物或求购或外卖代拿任务显示联系人姓名和电话 -->
        <view class="publisher-details" v-if="['express', 'sell', 'buy', 'takeout', 'other'].includes(task.type)">
          <!-- 发布者可以看到完整信息 -->
          <template v-if="isPublisher">
            <text class="contact-info">{{ ['express', 'takeout'].includes(task.type) ? '收件人姓名' : '联系人姓名' }}：{{ task.contactName }}</text>
            <text class="contact-info">联系电话：{{ task.contactPhone }}</text>
          </template>
          <!-- 接单者可以看到完整信息 -->
          <template v-else-if="isClaimer">
            <text class="contact-info">{{ ['express', 'takeout'].includes(task.type) ? '收件人姓名' : '联系人姓名' }}：{{ task.contactName }}</text>
            <text class="contact-info">联系电话：{{ task.contactPhone }}</text>
          </template>
          <!-- 普通用户只能看到部分信息 -->
          <template v-else>
            <text class="contact-info">{{ ['express', 'takeout'].includes(task.type) ? '收件人姓名' : '联系人姓名' }}：{{ task.contactName }}</text>
            <text class="contact-info">联系电话：接单后可见</text>
            <text class="privacy-tip">* 为保护发布者隐私，接单后可见完整联系方式</text>
          </template>
        </view>
        <!-- 其他任务类型显示发布者信息 -->
        <view class="publisher-details" v-else>
          <image :src="task.publisher.avatar" class="publisher-avatar" />
          <text class="publisher-name">{{ task.publisher.nickname }}</text>
          <text class="publisher-rating">信用等级：{{ task.publisher.creditRating }}</text>
        </view>
      </view>
    </view>

    <!-- 底部操作栏 -->
    <view class="bottom-bar">
      <view class="action-buttons">
        <!-- 接单按钮：仅任务状态为pending且不是发布者和接单者时显示 -->
        <button 
          v-if="showClaimButton" 
          class="action-button confirm" 
          @tap="confirmClaimTask"
        >
          确认接单
        </button>
        <button 
          v-if="showClaimButton" 
          class="action-button ignore" 
          @tap="goBack"
        >
          暂不考虑
        </button>

        <!-- 发布者视角：沿用原有逻辑 -->
        <button 
          v-if="isPublisher && showStartButton" 
          class="action-button start" 
          @tap="startTask"
        >
          发布任务
        </button>
        <button 
          v-if="isPublisher && showCancelButton" 
          class="action-button cancel" 
          @tap="cancelTask"
        >
          取消任务
        </button>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      currentUserRole: 'user',
      taskId: '',
      taskData: null,
      task: {
        id: '',
        type: '',
        status: '',
        title: '',
        description: '',
        reward: 0,
        publishTime: '',
        expectedDeliveryTime: '',
        pickupAddress: '',
        deliveryAddress: '',
        trackingNumber: '',
        recipientName: '',
        contactName: '',
        contactPhone: '',
        selectedCondition: '',
        images: [],
        publisher: {
          id: '',
          nickname: '',
          avatar: '',
          creditRating: 0
        },
        accepter: null
      }
    }
  },

  computed: {
    isPublisher() {
      return this.currentUserRole === 'publisher';
    },
    isClaimer() {
      return this.currentUserRole === 'claimer';
    },
    canClaimTask() {
      return !this.isPublisher && !this.isClaimer && this.task.status === 'pending';
    },
    showClaimButton() {
      return this.canClaimTask;
    },
    showStartButton() {
      return this.isPublisher && this.task.status === 'pending';
    },
    showSubmitButton() {
      return this.isPublisher && this.task.status === 'in_progress';
    },
    showCancelButton() {
      return this.isPublisher && ['pending', 'in_progress'].includes(this.task.status);
    }
  },
  methods: {
    getCurrentUser() {
      const userInfo = uni.getStorageSync('uni-id-pages-userInfo');
      if (userInfo) {
        return {
          id: userInfo._id,
          nickname: userInfo.nickname,
          avatar: (userInfo.avatar_file && userInfo.avatar_file.url) ? userInfo.avatar_file.url : '/static/images/avatar1.png' // 使用默认头像
        };
      } else {
        return null; // 用户未登录
      }
    },
    getRole(task, user) {
      if (!task || !user || !user.id) return 'user';
      if (task.publisher?.id === user.id) return 'publisher';
      if (task.accepter?.id === user.id) return 'claimer';
      return 'user';
    },
    determineUserRole() {
      const user = this.getCurrentUser();
      const role = this.getRole(this.task, user);
      console.log('[角色判断] 当前用户ID:', user ? user.id : '未登录');
      console.log('[角色判断] 任务发布者ID:', this.task.publisher?.id);
      console.log('[角色判断] 任务状态:', this.task.status);
      console.log('[角色判断] 最终角色:', role);
      this.currentUserRole = role;
    },
    getTaskTypeText(type) {
      const typeMap = {
        'express': '快递代取',
        'takeout': '外卖代拿',
        'buy': '求购',
        'sell': '出物',
        'other':'其他'
      };
      return typeMap[type] || type;
    },
    getConditionText(condition) {
      const conditionMap = {
        'new': '全新',
        'like-new': '九成新',
        'good': '八成新',
        'fair': '七成新'
      };
      return conditionMap[condition] || '';
    },
    getTaskStatusText(status) {
      const statusMap = {
        'pending': '待接单',
        'in_progress': '进行中',
        'completed': '已完成',
        'cancelled': '已取消'
      };
      return statusMap[status] || status;
    },
    navigateToPickup() {
      console.log('导航到取件地址');
    },
    navigateToDelivery() {
      console.log('导航到送达地址');
    },
    copyPickupAddress() {
      uni.setClipboardData({
        data: this.task.pickupAddress,
        success: () => {
          uni.showToast({
            title: '取件地址已复制',
            icon: 'success'
          });
        }
      });
    },
    copyDeliveryAddress() {
      uni.setClipboardData({
        data: this.task.deliveryAddress,
        success: () => {
          uni.showToast({
            title: '送达地址已复制',
            icon: 'success'
          });
        }
      });
    },
    handleImageError(e) {
      console.error('图片加载失败:', e);
      uni.showToast({
        title: '图片加载失败',
        icon: 'none'
      });
    },
    getFormattedTitle(task) {
      if (!task) return '未知任务';
      
      switch (task.type) {
        case 'buy':
          return `求购${task.itemName || ''}${task.selectedCondition ? `(${this.getConditionText(task.selectedCondition)})` : ''}`;
        case 'express':
          return `${task.pickupAddress || ''}快递代取`;
        case 'sell':
          return `出${task.selectedCondition ? this.getConditionText(task.selectedCondition) : ''}${task.itemName || ''}`;
        case 'takeout':
          return `${task.pickupAddress || ''}外卖代拿`;
        default:
          return task.title || '未知任务';
      }
    },
    startTask() {
      if (this.task) {
        // 使用传入的task.id，如果不存在则生成一个新的（作为备用，正常情况不应该发生）
        const taskId = this.task.id || 'task_' + Date.now().toString();
        const currentUser = this.getCurrentUser();
        
        if (!currentUser) {
          uni.showToast({
            title: '请先登录',
            icon: 'none'
          });
          return;
        }

        // 验证必要字段
        if (!this.task.itemName && this.task.type === 'buy') {
          uni.showToast({
            title: '物品名称不能为空',
            icon: 'none'
          });
          return;
        }

        if (!this.task.pickupAddress && (this.task.type === 'express' || this.task.type === 'takeout')) {
          uni.showToast({
            title: '取件地址不能为空',
            icon: 'none'
          });
          return;
        }

        // 构建任务数据，添加默认值和数据验证
        const taskData = {
          id: taskId,
          type: this.task.type || 'unknown',
          title: this.getFormattedTitle(this.task), // 使用格式化后的标题
          itemName: this.task.itemName || '',
          selectedCondition: this.task.selectedCondition || '',
          pickupAddress: this.task.pickupAddress || '',
          deliveryAddress: this.task.deliveryAddress || '',
          price: this.task.price || 0,
          description: this.task.description || '',
          images: this.task.images || [],
          status: 'pending',
          createTime: new Date().toISOString(),
          publisher: {
            id: currentUser._id,
            nickname: currentUser.nickname || '匿名用户',
            avatar: (currentUser.avatar_file && currentUser.avatar_file.url) || '/static/images/avatar1.png'
          }
        };

        console.log('[TaskDetail.vue] 即将发布任务数据:', taskData);
        uni.$emit('newTaskPublished', taskData);
        uni.showToast({
          title: '发布成功',
          icon: 'success',
          duration: 2000
        });

        setTimeout(() => {
          uni.redirectTo({
            url: '/pages/index/index',
            success: () => {
              console.log('跳转到首页成功');
              try {
                const existingTasks = uni.getStorageSync('myTasks') || '[]';
                const tasks = JSON.parse(existingTasks);
                const myTasksExistingIndex = tasks.findIndex(t => t.id === taskData.id);
                if (myTasksExistingIndex === -1) {
                tasks.unshift(taskData);
                uni.setStorageSync('myTasks', JSON.stringify(tasks));
                    console.log('任务已保存到本地存储 myTasks');
                } else {
                    console.log('任务已存在于 myTasks，跳过添加');
                }
              } catch (error) {
                console.error('保存任务到本地存储 myTasks 失败:', error);
              }
            },
            fail: (err) => {
              console.error('跳转失败:', err);
              uni.showToast({
                title: '页面跳转失败',
                icon: 'none'
              });
            }
          });
        }, 1500);
      } else {
        console.warn('任务数据为空');
        uni.showToast({
          title: '任务数据获取失败',
          icon: 'none'
        });
      }
    },
    submitTask() {
      console.log('提交任务');
    },
    cancelTask() {
      let releasePagePath = '';
      switch (this.task.type) {
        case 'express':
          releasePagePath = '/pages/TaskRelease/DeliveryTask/DeliveryTask';
          break;
        case 'takeout':
          releasePagePath = '/pages/TaskRelease/TakeoutTask/TakeoutTask';
          break;
        case 'buy':
          releasePagePath = '/pages/TaskRelease/PurchaseTask/PurchaseTask';
          break;
        case 'sell':
          releasePagePath = '/pages/TaskRelease/OutTask/OutTask';
          break;
        default:
          console.warn('未知任务类型，无法跳转到修改页面:', this.task.type);
          uni.showToast({
            title: '该任务类型不支持修改',
            icon: 'none'
          });
          return;
      }

      uni.navigateTo({
        url: `${releasePagePath}?taskInfo=${encodeURIComponent(JSON.stringify(this.task))}`
      });
    },
    confirmClaimTask() {
      const currentUser = this.getCurrentUser();
      
      if (!currentUser || !currentUser.id) {
        uni.showToast({
          title: '请先登录',
          icon: 'none'
        });
        return;
      }
      if (this.task.status !== 'pending') {
        uni.showToast({
          title: '任务状态已变更',
          icon: 'none'
        });
        return;
      }
      if (!this.canClaimTask) {
        uni.showToast({
          title: '您不能接此任务',
          icon: 'none'
        });
        return;
      }

      uni.showModal({
        title: '确认接单',
        content: '接单后即可查看发布者联系方式，确认接单后将无法取消，是否继续？',
        confirmText: '确认',
        cancelText: '取消',
        success: (res) => {
          if (res.confirm) {
            console.log('调用接单API:', { taskId: this.task.id, userId: currentUser.id });
            
            const newTask = JSON.parse(JSON.stringify(this.task));
            newTask.status = 'in_progress';
            newTask.accepter = currentUser;
            newTask.ownerType = 'received';

            this.task = newTask;
            
            uni.showToast({
              title: '接单成功',
              icon: 'success',
              duration: 2000
            });
            
            try {
              const existingTasks = uni.getStorageSync('myTasks') || '[]';
              const tasks = JSON.parse(existingTasks);
              const taskIndex = tasks.findIndex(t => t.id === this.task.id);
              if (taskIndex !== -1) {
                tasks[taskIndex] = newTask;
                uni.setStorageSync('myTasks', JSON.stringify(tasks));
              }
            } catch (error) {
              console.error('更新本地任务状态失败:', error);
            }
            
            setTimeout(() => {
              const navUrl = '/pages/MyTask/MyTask?acceptedTask=' + encodeURIComponent(JSON.stringify(newTask)) + '&activeTab=received';
              uni.navigateTo({
                url: navUrl
              });
            }, 1500);
          }
        }
      });
    },
    goBack() {
      uni.navigateBack();
    },
    async getTaskDetail(taskId) {
      try {
        console.log('获取任务详情 (模拟):', taskId);
        
        const mockTask = {
          id: taskId,
          type: 'express',
          status: 'pending',
          title: '代取快递',
          description: '帮忙取一个快递，在学校快递站',
          reward: 5,
          publishTime: '2024-03-20 14:30',
          expectedDeliveryTime: '2024-03-20 18:00',
          pickupAddress: '学校快递站',
          deliveryAddress: '宿舍区',
          trackingNumber: '1234567890',
          recipientName: '李四',
          contactName: '李四',
          contactPhone: '13900139000',
          publisher: {
            id: 'original_publisher_id',
            nickname: '原始发布者',
            avatar: '/static/avatar/default.png',
            creditRating: 4.8
          },
          accepter: null
        };
        
        return mockTask;
      } catch (error) {
        console.error('获取任务详情失败:', error);
        uni.showToast({
          title: '获取任务详情失败',
          icon: 'error'
        });
        return null;
      }
    },
    formatPublishTime(time) {
      if (!time) return '';
      const date = new Date(time);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    }
  },
  onLoad(options) {
    
    console.log('[页面加载] 参数:', options);
    
    const currentUser = this.getCurrentUser();
    console.log('[页面加载] 获取到的当前用户:', currentUser);

    if (options.taskInfo) {
      try {
        const taskInfo = JSON.parse(decodeURIComponent(options.taskInfo));
        console.log('[页面加载] 解析后的任务信息:', taskInfo);
        
        this.task = taskInfo;
        this.determineUserRole();
        
      } catch (error) {
        console.error('[页面加载] 解析任务信息失败:', error);
        uni.showToast({
          title: '获取任务信息失败',
          icon: 'error'
        });
      }
    } else if (options.id) {
      this.taskId = options.id;
      
      // 获取通过eventChannel传递的数据
      const eventChannel = this.getOpenerEventChannel();
      eventChannel.on('taskData', (data) => {
        this.taskData = data.task;
        console.log('[页面加载] 从index页面接收到的任务数据:', this.taskData);
        // 将接收到的数据赋值给task
        if (this.taskData) {
          this.task = this.taskData;
          this.determineUserRole();
        }
      });
    } else {
      console.log('[页面加载] 没有任务信息，创建默认任务');
      const currentUser = this.getCurrentUser();
      
      let defaultTask = {
        id: 'default_task_id',
        type: 'express',
        status: 'pending',
        title: '默认代取快递任务',
        description: '这是一个默认的测试任务',
        reward: 5,
        publishTime: new Date().toLocaleString(),
        expectedDeliveryTime: '18:00',
        pickupAddress: '学校快递站',
        deliveryAddress: '宿舍区',
        trackingNumber: '1234567890',
        contactName: '张三',
        contactPhone: '13800138000',
        publisher: null,
        accepter: null
      };

      if (currentUser && currentUser.id) {
        defaultTask.publisher = {
          id: currentUser.id,
          nickname: currentUser.nickname,
          avatar: currentUser.avatar,
          creditRating: 4.5
        };
        } else {
        defaultTask.publisher = { id: 'default_publisher', nickname: '默认发布者', avatar: '/static/images/avatar1.png', creditRating: 4.5 };
      }
      
      this.task = defaultTask;
      this.determineUserRole();
    }
  },
  watch: {
    task: {
      handler(newTask) {
        if (newTask) {
          console.log('[任务数据变化] 重新判断角色');
          this.determineUserRole();
        }
      },
      deep: true
    }
  }
}
</script>

<style>
/* 调整后的完整样式代码 */
.container {
  min-height: 100vh;
  background-color: #f5f5f5;
  padding-top: 20rpx; /* 为导航栏和状态标签预留空间 */
  padding-bottom: calc(120rpx + env(safe-area-inset-bottom));
  box-sizing: border-box;
}

/* 自定义导航栏样式 - 优化定位 */
.custom-navbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 88rpx; /* 增加高度使导航更美观 */
  display: flex;
  align-items: center;
  background-color: #ffffff;
  z-index: 1000;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
  padding-top: env(safe-area-inset-top);
}

.navbar-back {
  position: absolute;
  left: 30rpx;
  top: 50%;
  transform: translateY(-50%);
  height: 44rpx;
  display: flex;
  align-items: center;
}

.navbar-title {
  flex: 1;
  text-align: center;
  font-size: 32rpx;
  font-weight: bold;
}

/* 任务状态标签样式 - 优化定位和样式 */
.task-status-tag {
  position: fixed;
  top: calc(88rpx + env(safe-area-inset-top) + 20rpx);
  right: 30rpx;
  padding: 8rpx 16rpx;
  border-radius: 32rpx;
  font-size: 24rpx;
  z-index: 9;
  display: flex;
  align-items: center;
  gap: 8rpx;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.1);
}

.task-status-tag.pending { 
  background-color: #FF9F1C; 
  color: white; 
}
.task-status-tag.in_progress { 
  background-color: #00BFFF; 
  color: white; 
}
.task-status-tag.completed { 
  background-color: #47B960; 
  color: white; 
}
.task-status-tag.cancelled { 
  background-color: #999999; 
  color: white; 
}

/* 优化内容区域内边距 */
.task-info, .description-section, .address-section, .publisher-section {
  border-radius: 20rpx;
  margin: 0 30rpx 30rpx;
  overflow: hidden;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.05);
}

/* 优化图片轮播区域 */
.image-slider {
  width: 100%;
  height: 500rpx;
  margin: 0 30rpx 30rpx;
  border-radius: 20rpx;
  overflow: hidden;
}

.image-slider swiper {
  width: 100%;
  height: 100%;
}

.image-slider swiper-item {
  width: 100%;
  height: 100%;
}

.slider-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* 任务信息区域样式 */
.task-info {
 padding: 40rpx;
  background: linear-gradient(145deg, #ffffff, #f5f7fa);
}

.task-header-flex {
  padding: 0 0 30rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.task-title {
  font-size: 36rpx;
  font-weight: bold;
  line-height: 1.5;
  color: #1a1a1a;
  width: 100%;
  text-align: center;
  margin-bottom: 20rpx;
}

/* 任务类型和状态标签容器 */
.task-type-container {
  display: flex;
  justify-content: center;
  width: 100%;
  margin-top: 10rpx;
}

.task-type {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 16rpx;
  align-items: center;
}

/* 类型标签基础样式 */
.type-tag {
  padding: 8rpx 20rpx;
  border-radius: 32rpx;
  font-size: 26rpx;
  display: inline-flex;
  align-items: center;
  gap: 6rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.1);
}

/* 加急标签样式 */
.urgent-tag {
  padding: 6rpx 16rpx;
  border-radius: 32rpx;
  font-size: 24rpx;
  background: linear-gradient(135deg, #FF4D4F 0%, #FF7875 100%);
  color: #ffffff;
  display: inline-flex;
  align-items: center;
  box-shadow: 0 2rpx 8rpx rgba(255, 77, 79, 0.2);
}

/* 任务状态标签样式 */
.task-status-tag {
  padding: 8rpx 20rpx;
  border-radius: 32rpx;
  font-size: 24rpx;
  display: inline-flex;
  align-items: center;
  gap: 6rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.1);
}

/* 状态标签颜色 */
.task-status-tag.pending {
  background-color: #E6F7FF;
  color: #1890FF;
}

.task-status-tag.processing {
  background-color: #FFF7E6;
  color: #FA8C16;
}

.task-status-tag.completed {
  background-color: #F6FFED;
  color: #52C41A;
}

.task-status-tag.cancelled {
  background-color: #FFF1F0;
  color: #F5222D;
}

/* 类型标签颜色 */
.type-tag.buy {
  background-color: #E6F7FF;
  color: #1890FF;
}

.type-tag.sell {
  background-color: #F6FFED;
  color: #52C41A;
}

.type-tag.takeout {
  background-color: #FFF7E6;
  color: #FA8C16;
}

.type-tag.express {
  background-color: #F9F0FF;
  color: #722ED1;
}

.type-tag.other {
  background-color: #F5F5F5;
  color: #666666;
}

.task-time, .task-reward {
  display: flex;
  align-items: center;
  gap: 12rpx;
  font-size: 28rpx;
  margin-bottom: 20rpx;
}

.task-time .time-label, 
.task-reward .reward-label,
.address-label {
  color: #999;  /* 标签颜色改为灰色 */
  font-weight: normal;
  min-width: 140rpx;  /* 固定标签宽度 */
}
.time-value, 
.reward-value,
.address-text {
  color: #333;  /* 值颜色改为深灰色 */
  flex: 1;
}
.reward-value {
  color: #ff3b30;
    font-weight: bold;
    font-size: 32rpx;
}

/* 描述区域样式 */
.description-section {
  padding: 40rpx;
   background-color: #ffffff;
}

.section-title {
  font-size: 28rpx;
  font-weight: bold;
  margin-bottom: 20rpx;
  color: #333;
}

.description-text {
  font-size: 28rpx;
  color: #666;
  line-height: 1.6;
}

/* 地址信息区域样式 */
.address-section {
  background-color: #fff;
  padding: 30rpx;
  margin: 20rpx;
  border-radius: 12rpx;
}

.address-item {
  margin-bottom: 30rpx;
  padding-bottom: 30rpx;
  border-bottom: 1rpx solid #f0f0f0;  /* 添加底部边框 */
  display: flex;
  flex-direction: column;  /* 改为垂直布局 */
}

.address-label {
  margin-bottom: 10rpx;  /* 标签与值之间添加间距 */
  font-size: 28rpx;
  color: #999;
  flex-basis: auto;
}

.address-content {
  flex: 1;
  display: block;  /* 取消flex布局 */
}

.address-text {
  font-size: 28rpx;
  color: #333;
  line-height: 1.6;
}

/* 发布者信息区域样式 */
.publisher-section {
  background-color: #fff;
  padding: 30rpx;
  margin: 20rpx;
  border-radius: 12rpx;
}

.publisher-info {
  margin-bottom: 20rpx;
}

.publisher-details {
  padding: 30rpx;
  background-color: #f9fafc;
  border-radius: 16rpx;
}

.publisher-avatar {
  width: 80rpx;
  height: 80rpx;
  border-radius: 50%;
  margin-right: 20rpx;
}

.publisher-name {
  font-size: 28rpx;
  font-weight: bold;
  margin-bottom: 20rpx;
}

.publisher-rating {
  font-size: 24rpx;
  color: #666;
  margin-bottom: 10rpx;
}

.contact-info {
  font-size: 28rpx;
  color: #333;
  margin-bottom: 20rpx;  /* 信息之间增加间距 */
  display: block;  /* 强制独占一行 */
}

/* 底部操作栏样式 */
.bottom-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: #fff;
  padding: 20rpx 30rpx;
  padding-bottom: calc(20rpx + env(safe-area-inset-bottom));
  display: flex;
  align-items: center;
  box-shadow: 0 -2rpx 10rpx rgba(0, 0, 0, 0.05);
  z-index: 100;
}

.action-buttons {
  flex: 1;
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
  gap: 20rpx;
  align-items: center;
}

.action-button {
  min-width: 180rpx;
  height: 80rpx;
  line-height: 80rpx;
  text-align: center;
  border-radius: 40rpx;
  font-size: 28rpx;
  font-weight: bold;
  padding: 0 30rpx;
}

.action-button.confirm {
  background: linear-gradient(135deg, #00BFFF, #0099FF);
  color: #fff;
}

.action-button.ignore {
  background-color: #f5f5f5;
  color: #666;
}

.action-button.start {
  background: linear-gradient(135deg, #00BFFF, #0099FF);
  color: #fff;
}

.action-button.cancel {
  background: linear-gradient(135deg, #FF4D4F, #FF7875);
  color: #fff;
}

.urgent-tag {
 font-size: 22rpx;
  padding: 6rpx 12rpx;
}

.privacy-tip {
  font-size: 24rpx;
  color: #999;
  margin-top: 20rpx;
  line-height: 1.5;
  display: block;
}

/* 适配 iPhone 安全区域 */
@supports (padding-bottom: env(safe-area-inset-bottom)) {
  .container {
    padding-bottom: calc(120rpx + env(safe-area-inset-bottom));
  }
  
  .bottom-bar {
    padding-bottom: calc(20rpx + env(safe-area-inset-bottom));
  }
}
</style>