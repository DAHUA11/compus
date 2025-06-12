<template>
  <view class="container">
    <!-- 自定义导航栏 -->
    <view class="custom-navbar">
      <view class="navbar-back" @tap="goBack">
        <uni-icons type="left" size="24" color="#000000"></uni-icons>
      </view>
      <view class="navbar-title">任务详情</view>
    </view>
    
    <!-- 任务状态标签 -->
    <view class="task-status-tag" :class="task.status">
      {{ getTaskStatusText(task.status) }}
    </view>

    <!-- 图片轮播区域 -->
    <view class="image-slider" v-if="task.images && task.images.length > 0 && ['buy', 'sell', 'takeout'].includes(task.type)">
      <swiper :indicator-dots="true" :autoplay="false" :interval="3000" :duration="500">
        <swiper-item v-for="(image, index) in task.images" :key="index">
          <image :src="image" mode="aspectFill" class="slider-image" @error="handleImageError" />
        </swiper-item>
      </swiper>
    </view>

    <!-- 任务信息区域 -->
    <view class="task-info">
      <!-- 标题和类型容器 -->
      <view class="task-header-flex">
        <view class="task-title">
          <template v-if="task.type === 'buy'">求购 - {{ task.title }}</template>
          <template v-else-if="task.type === 'sell'">出 {{ task.title }} - {{ getConditionText(task.selectedCondition) }}</template>
          <template v-else-if="['express', 'takeout'].includes(task.type)">{{ task.title }} - {{ task.pickupAddress }}</template>
          <template v-else>{{ task.title }}</template>
        </view>
        <view class="task-type">
          <text class="type-tag" :class="task.type">{{ getTaskTypeText(task.type) }}</text>
          <text v-if="task.tags && task.tags.includes('加急')" class="urgent-tag">加急</text>
        </view>
      </view>
      <view class="task-time">
        <text class="time-label">发布时间：</text>
        <text class="time-value">{{ task.publishTime }}</text>
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

    <!-- 任务描述区域 -->
    <view class="description-section">
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
        <view class="publisher-details" v-if="['express', 'sell', 'buy', 'takeout'].includes(task.type)">
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

    <!-- 测试模式按钮组 -->
    <view class="test-buttons" v-if="showTestButtons">
      <button class="test-button" @tap="switchTestRole('publisher')">切换为发布者</button>
      <button class="test-button" @tap="switchTestRole('claimer')">切换为接单者</button>
      <button class="test-button" @tap="switchTestRole('user')">切换为普通用户</button>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      currentUserRole: 'user',
      TEST_MODE: true,
      TEST_USER: {
        publisher: {
          id: 'test_publisher_id',
          nickname: '测试发布者',
          avatar: '/static/avatar/default.png'
        },
        claimer: {
          id: 'test_claimer_id',
          nickname: '测试接单者',
          avatar: '/static/avatar/default.png'
        },
        user: {
          id: 'test_user_id',
          nickname: '测试用户',
          avatar: '/static/avatar/default.png'
        }
      },
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
    },
    showTestButtons() {
      return this.TEST_MODE;
    }
  },
  methods: {
    getCurrentUser() {
      if (this.TEST_MODE) {
        const testRole = uni.getStorageSync('testRole') || 'user';
        const user = this.TEST_USER[testRole] || this.TEST_USER.user;
        uni.setStorageSync('userToken', 'test_token');
        uni.setStorageSync('userId', user.id);
        uni.setStorageSync('userNickname', user.nickname);
        uni.setStorageSync('userAvatar', user.avatar);
        return user;
      } else {
        return {
          id: uni.getStorageSync('userId'),
          nickname: uni.getStorageSync('userNickname'),
          avatar: uni.getStorageSync('userAvatar')
        };
      }
    },
    getRole(task, user) {
      if (!task || !user.id) return 'user';
      if (task.publisher?.id === user.id) return 'publisher';
      if (task.accepter?.id === user.id) return 'claimer';
      return 'user';
    },
    determineUserRole() {
      const user = this.getCurrentUser();
      const role = this.getRole(this.task, user);
      console.log('[角色判断] 当前用户:', user.nickname, '任务状态:', this.task.status, '角色:', role);
      this.currentUserRole = role;
    },
    getTaskTypeText(type) {
      const typeMap = {
        'express': '快递代取',
        'takeout': '外卖代拿',
        'buy': '求购',
        'sell': '出物'
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
      return conditionMap[condition] || condition;
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
    switchTestRole(role) {
      console.log('[切换角色] 目标角色:', role);
      uni.setStorageSync('testRole', role);
      const user = this.TEST_USER[role] || this.TEST_USER.user;
      uni.setStorageSync('userId', user.id);
      uni.setStorageSync('userNickname', user.nickname);
      uni.setStorageSync('userAvatar', user.avatar);
      this.determineUserRole();
      uni.showToast({ title: `已切换至${role}角色`, icon: 'none' });
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
    startTask() {
      if (this.task) {
        const taskId = Date.now().toString();
        const currentUser = this.getCurrentUser();
        
        const taskData = {
          ...this.task,
          id: taskId,
          status: 'pending',
          publishTime: new Date().toLocaleString(),
          publisher: {
            id: currentUser.id,
            nickname: currentUser.nickname,
            avatar: currentUser.avatar,
            level: 1,
            credit: 100
          },
          ownerType: 'published'
        };

        console.log('发布任务:', taskData);
        uni.$emit('newTaskPublished', taskData);
        uni.showToast({
          title: '发布成功',
          icon: 'success',
          duration: 2000
        });

        setTimeout(() => {
          uni.redirectTo({
            url: '/pages/TaskHall/TaskHall',
            success: () => {
              console.log('跳转到任务大厅成功');
              try {
                const existingTasks = uni.getStorageSync('myTasks') || '[]';
                const tasks = JSON.parse(existingTasks);
                tasks.unshift(taskData);
                uni.setStorageSync('myTasks', JSON.stringify(tasks));
                console.log('任务已保存到本地存储');
              } catch (error) {
                console.error('保存任务到本地存储失败:', error);
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
      
      if (!uni.getStorageSync('userToken')) {
        uni.showToast({ title: '请先登录', icon: 'none' });
        return;
      }
      if (this.task.status !== 'pending') {
        uni.showToast({ title: '任务状态已变更', icon: 'none' });
        return;
      }
      if (!this.canClaimTask) {
        uni.showToast({ title: '您不能接此任务', icon: 'none' });
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
    }
  },
  onLoad(options) {
    console.log('[页面加载] 参数:', options);
    
    const currentTestRole = this.TEST_MODE ? (uni.getStorageSync('testRole') || 'user') : null;
    console.log('[页面加载] 当前测试角色:', currentTestRole);
    
    if (this.TEST_MODE) {
      this.getCurrentUser();
    }
    const currentUser = this.getCurrentUser();

    if (options.taskInfo) {
      try {
        const taskInfo = JSON.parse(decodeURIComponent(options.taskInfo));
        console.log('[页面加载] 解析后的任务信息:', taskInfo);
        
        const modifiedTask = JSON.parse(JSON.stringify(taskInfo));
        
        if (this.TEST_MODE) {
          const user = this.getCurrentUser();
          if (currentTestRole === 'publisher') {
            modifiedTask.publisher = user;
            modifiedTask.accepter = null;
            modifiedTask.status = modifiedTask.status === 'in_progress' ? 'in_progress' : 'pending';
          } else if (currentTestRole === 'claimer') {
            modifiedTask.accepter = user;
            if (modifiedTask.status === 'pending') modifiedTask.status = 'in_progress';
          } else {
            modifiedTask.publisher = this.TEST_USER.publisher;
            modifiedTask.accepter = null;
            modifiedTask.status = 'pending';
            if(modifiedTask.publisher.id === currentUser.id) {
              modifiedTask.publisher = this.TEST_USER.user;
            }
          }
        }
        
        this.task = modifiedTask;
        this.determineUserRole();
        
      } catch (error) {
        console.error('[页面加载] 解析任务信息失败:', error);
        uni.showToast({
          title: '获取任务信息失败',
          icon: 'error'
        });
      }
    } else if (options.id) {
      this.getTaskDetail(options.id).then(taskData => {
        if (taskData) {
          if (this.TEST_MODE) {
            const user = this.getCurrentUser();
            const modifiedTask = JSON.parse(JSON.stringify(taskData));
            
            if (currentTestRole === 'publisher') {
              modifiedTask.publisher = user;
              modifiedTask.accepter = null;
              modifiedTask.status = 'pending';
            } else if (currentTestRole === 'claimer') {
              modifiedTask.accepter = user;
              modifiedTask.status = 'in_progress';
            } else {
              modifiedTask.accepter = null;
              modifiedTask.status = 'pending';
            }
            
            this.task = modifiedTask;
          } else {
            this.task = taskData;
          }
          
          this.determineUserRole();
        } else {
          console.error('[页面加载] 获取任务详情返回空数据:', options.id);
          uni.showToast({
            title: '任务不存在',
            icon: 'none'
          });
        }
      }).catch(error => {
        console.error('[页面加载] 获取任务详情失败:', error);
        uni.showToast({
          title: '获取任务详情失败',
          icon: 'error'
        });
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

      if (this.TEST_MODE) {
        if (currentTestRole === 'publisher') {
          defaultTask.publisher = currentUser;
          defaultTask.status = 'pending';
        } else if (currentTestRole === 'claimer') {
          defaultTask.accepter = currentUser;
          defaultTask.status = 'in_progress';
        } else {
          defaultTask.publisher = { id: 'other_publisher', nickname: '其他发布者', avatar: '/static/avatar/default.png' };
          defaultTask.status = 'pending';
        }
      } else {
        defaultTask.publisher = { id: 'default_publisher', nickname: '默认发布者', avatar: '/static/avatar/default.png', creditRating: 4.5 };
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
.container {
  min-height: 100vh;
  background-color: #f5f5f5;
  padding-bottom: 120rpx;
}

/* 自定义导航栏样式 */
.custom-navbar {
  padding-top:20rpx;
  position: relative;
  top: 0;
  left: 0;
  right: 0;
  height: 44px;
  display: flex;
  align-items: center;
  background-color: #ffffff;
  z-index: 1000;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
}

.navbar-back {
  position: absolute;
  left: 0;
  top: 70%;
  transform: translateY(-50%);
  padding: 0 15px;
  height: 100%;
}

.navbar-title {
  flex: 1;
  text-align: center;
  font-size: 17px;
  font-weight: bold;
}

.navbar-placeholder {
  height: 44px;
}

/* 任务状态标签样式 */
.task-status-tag {
  position: absolute;
  top: 20rpx;
  right: 20rpx;
  padding: 6rpx 12rpx;
  border-radius: 4rpx;
  font-size: 24rpx;
  z-index: 10;
}

.task-status-tag.pending { background-color: #FF9F1C; color: white; }
.task-status-tag.in_progress { background-color: #00BFFF; color: white; }
.task-status-tag.completed { background-color: #47B960; color: white; }
.task-status-tag.cancelled { background-color: #999999; color: white; }

/* 图片轮播区域样式 */
.image-slider {
  width: 100%;
  height: 400rpx;
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
  background-color: #fff;
  padding: 30rpx;
  margin-bottom: 20rpx;
  display: flex;
  flex-direction: column;
}

.task-header-flex {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20rpx;
  background-color: #ffffff;
  border-radius: 16rpx;
  margin-bottom: 20rpx;
}

.task-title {
  font-size: 36rpx;
  font-weight: bold;
  color: #333333;
  text-align: center;
  margin-bottom: 16rpx;
}

.task-type {
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  gap: 12rpx;
}

.type-tag {
  padding: 10rpx 16rpx;
  border-radius: 4rpx;
  font-size: 24rpx;
}

.type-tag.express { background-color: #e6f7ff; color: #1890ff; }
.type-tag.takeout { background-color: #f6ffed; color: #52c41a; }
.type-tag.buy { background-color: #fff7e6; color: #fa8c16; }
.type-tag.sell { background-color: #f9f0ff; color:rgb(63, 9, 139); }

.task-time, .task-reward {
  font-size: 28rpx;
  color: #666;
  margin-bottom: 10rpx;
}

.reward-value {
  color: #f5222d;
  font-weight: bold;
}

/* 描述区域样式 */
.description-section {
  background-color: #fff;
  padding: 30rpx;
  margin-bottom: 20rpx;
}

.section-title {
  font-size: 30rpx;
  font-weight: bold;
  margin-bottom: 20rpx;
}

.description-text {
  font-size: 28rpx;
  color: #333;
  line-height: 1.6;
}

/* 地址信息区域样式 */
.address-section {
  background-color: #fff;
  padding: 30rpx;
  margin-bottom: 20rpx;
}

.address-item {
  margin-bottom: 20rpx;
  display: flex;
  flex-direction: row;
  align-items: flex-start;
}

.address-label {
  font-size: 28rpx;
  color: #666;
  flex-basis: 140rpx;
  flex-shrink: 0;
  margin-right: 20rpx;
}

.address-content {
  flex: 1;
  display: flex;
  align-items: center;
}

.address-text {
  flex: 1;
  font-size: 28rpx;
  color: #333;
}

/* 发布者信息区域样式 */
.publisher-section {
  background-color: #fff;
  padding: 30rpx;
  margin-bottom: 20rpx;
}

.publisher-info {
  margin-bottom: 20rpx;
  display: flex;
  flex-direction: row;
  align-items: flex-start;
}

.publisher-avatar {
  width: 80rpx;
  height: 80rpx;
  border-radius: 50%;
  margin-right: 20rpx;
}

.publisher-details {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 20rpx;
  background-color: #f8f8f8;
  border-radius: 8rpx;
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
  margin-bottom: 10rpx;
  display: block;
}

/* 底部操作栏样式 */
.bottom-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: #fff;
  padding: 20rpx 30rpx;
  display: flex;
  align-items: center;
  box-shadow: 0 -2rpx 10rpx rgba(0, 0, 0, 0.05);
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
  padding: 10rpx 20rpx;
  border-radius: 8rpx;
  font-size: 28rpx;
  font-weight: bold;
}


.action-button.confirm {
  background-color: #00BFFF;
  color: #fff;
}

.action-button.ignore {
  background-color: #999999;
  color: #fff;
}

.action-button.start {
  background-color:rgba(37, 149, 255, 0.71);
  color: #fff;
}

.action-button.cancel {
  background-color:rgb(252, 109, 111);
  color: #fff;
}

.urgent-tag {
  background-color: #FF4D4F;
  color: #ffffff;
  font-size: 24rpx;
  padding: 10rpx 16rpx;
  border-radius: 4rpx;
  font-weight: 500;
}

/* 添加隐私提示样式 */
.privacy-tip {
  font-size: 24rpx;
  color: #999;
  margin-top: 10rpx;
  font-style: italic;
}

/* 测试按钮样式 */
.test-buttons {
  position: fixed;
  top: 100rpx;
  right: 20rpx;
  display: flex;
  flex-direction: column;
  gap: 10rpx;
  z-index: 1000;
}

.test-button {
  font-size: 24rpx;
  padding: 10rpx 20rpx;
  background-color: rgba(0, 0, 0, 0.6);
  color: white;
  border-radius: 8rpx;
  border: none;
}
</style>