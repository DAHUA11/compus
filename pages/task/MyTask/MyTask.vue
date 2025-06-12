<template>
  <view class="container">
    <!-- 测试模式按钮组 -->
    <view class="test-buttons" v-if="TEST_MODE">
      <button class="test-button" @tap="switchTestRole('publisher')">切换为发布者</button>
      <button class="test-button" @tap="switchTestRole('claimer')">切换为接单者</button>
      <button class="test-button" @tap="switchTestRole('user')">切换为普通用户</button>
    </view>

    <!-- 搜索区域 -->
    <view class="search-section">
      <view class="search-box">
        <uni-icons type="search" size="18" color="#999999" />
        <input 
          type="text" 
          v-model="searchKeyword" 
          placeholder="搜索任务类型、状态、关键词" 
          class="search-input"
          @input="handleSearch"
        />
      </view>
      <view class="filter-btn" @tap="showFilterOptions">
        <uni-icons type="filter" size="18" color="#00BFFF" />
        <text>筛选</text>
      </view>
    </view>

    <!-- 任务类型标签页 -->
    <view class="tabs-section">
      <view 
        class="tab-item" 
        :class="{ active: activeTab === 'published' }"
        @tap="switchTab('published')"
      >
        <text>我发布的任务</text>
      </view>
      <view 
        class="tab-item" 
        :class="{ active: activeTab === 'received' }"
        @tap="switchTab('received')"
      >
        <text>我领取的任务</text>
      </view>
    </view>

    <!-- 任务列表 -->
    <scroll-view 
      class="task-list" 
      scroll-y 
      @scrolltolower="loadMoreTasks"
      refresher-enabled
      :refresher-triggered="isRefreshing"
      @refresherrefresh="onRefresh"
    >
      <view 
        class="task-card" 
        :class="{ 'published-card': activeTab === 'published', 'received-card': activeTab === 'received' }"
        v-for="task in filteredTasks" 
        :key="task.id"
        @tap="navigateToDetail(task)"
      >
        <!-- 任务类型和状态 -->
        <view class="task-header">
          <view class="task-type-status">
            <view class="task-type" :style="{ backgroundColor: getTaskTypeColor(task.type) }">
              <uni-icons :type="getTaskTypeIcon(task.type)" size="16" color="#FFFFFF" />
              <text>{{ getTaskTypeName(task.type) }}</text>
            </view>
            <view class="task-status" :class="task.status">
              {{ getTaskStatusText(task.status) }}
            </view>
          </view>
        </view>

        <!-- 任务标题 -->
        <view class="task-title">
          <template v-if="task.type === 'buy'">求购 - {{ task.title }}</template>
          <template v-else-if="task.type === 'sell'">出 - {{ task.title }} - {{ getConditionText(task.selectedCondition) }}</template>
          <template v-else-if="['express', 'takeout'].includes(task.type)">{{ task.title }} - {{ task.pickupAddress }}</template>
          <template v-else>{{ task.title }}</template>
        </view>

        <!-- 任务关键信息 -->
        <view class="task-info">
          <!-- 取件地址和送达地址 - 仅在领取任务时显示 -->
          <template v-if="activeTab === 'received'">
            <view class="info-item" v-if="task.type === 'express' || task.type === 'takeout'">
              <uni-icons type="location" size="12" color="#00BFFF" class="bullet" />
              <text class="label">取件地址：</text>
              <text class="value">{{ maskAddress(task.pickupAddress) }}</text>
            </view>
            <view class="info-item" v-if="task.type === 'express' || task.type === 'takeout'">
              <uni-icons type="location-filled" size="12" color="#00BFFF" class="bullet" />
              <text class="label">送达地址：</text>
              <text class="value">{{ maskAddress(task.deliveryAddress) }}</text>
            </view>
          </template>
          
          <!-- 物品信息 - 根据任务类型和tab显示 -->
          <template v-if="(activeTab === 'published' && (task.type === 'buy' || task.type === 'sell')) || (activeTab === 'received' && (task.type === 'buy' || task.type === 'sell'))">
            <view class="info-item">
              <uni-icons type="paperplane" size="12" color="#00BFFF" class="bullet" />
              <text class="label">物品名称：</text>
              <text class="value">{{ task.itemName }}</text>
            </view>
          </template>

          <!-- 悬赏金额 - 始终显示 -->
          <view class="info-item">
            <uni-icons type="wallet" size="12" color="#00BFFF" class="bullet" />
            <text class="label">悬赏金额：</text>
            <text class="value reward">¥{{ task.reward }}</text>
          </view>

          <!-- 任务时效提醒 - 仅在领取任务时显示 -->
          <view class="info-item" v-if="activeTab === 'received' && (task.type === 'express' || task.type === 'takeout')">
            <uni-icons type="calendar" size="12" color="#FF4D4F" class="bullet" />
            <text class="label">时效提醒：</text>
            <text class="value">{{ getTimeSensitivityReminder(task.expectedDeliveryTime) }}</text>
          </view>
        </view>

        <!-- 最新动态 -->
        <view class="task-update" v-if="task.latestUpdate">
          <uni-icons type="notification" size="14" color="#999999" />
          <text>{{ task.latestUpdate }}</text>
        </view>

        <!-- 操作按钮 -->
        <view class="task-actions">
          <button 
            class="action-btn" 
            v-if="activeTab === 'published'"
            @tap.stop="handlePublishedAction(task)"
          >
            {{ getPublishedActionText(task.status) }}
          </button>
          <button 
            class="action-btn" 
            v-if="activeTab === 'received'"
            @tap.stop="handleReceivedAction(task)"
          >
            {{ getReceivedActionText(task.status) }}
          </button>
        </view>

        <!-- 时间信息 -->
        <view class="task-time">
          <text>{{ activeTab === 'published' ? '发布时间：' : '领取时间：' }}</text>
          <text>{{ formatTime(task[activeTab === 'published' ? 'publishTime' : 'receiveTime']) }}</text>
        </view>
      </view>

      <!-- 加载更多提示 -->
      <view class="loading-more" v-if="hasMore">
        <uni-icons type="spinner-cycle" size="20" color="#00BFFF" />
        <text>加载更多...</text>
      </view>
      <view class="no-more" v-else>
        <text>没有更多任务了</text>
      </view>
    </scroll-view>

    <!-- 底部操作栏 -->
    <view class="bottom-bar" v-if="selectedTasks.length > 0">
      <view class="selected-count">已选择 {{ selectedTasks.length }} 个任务</view>
      <view class="batch-actions">
        <button class="batch-btn" @tap="handleBatchAction('cancel')">批量取消</button>
        <button class="batch-btn" @tap="handleBatchAction('read')">标记已读</button>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      searchKeyword: '',
      activeTab: 'published',
      isRefreshing: false,
      hasMore: true,
      publishedUnread: 0,
      receivedUnread: 0,
      selectedTasks: [],
      tasks: [],
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
      }
    }
  },
  computed: {
    filteredTasks() {
      const keyword = this.searchKeyword.trim().toLowerCase();
      console.log('MyTask - filteredTasks: searchKeyword:', keyword);
      console.log('MyTask - filteredTasks: activeTab:', this.activeTab);
      return this.tasks.filter(task => {
        const matchesKeyword = (
          task.title.toLowerCase().includes(keyword) ||
          task.pickupAddress?.toLowerCase().includes(keyword) ||
          task.deliveryAddress?.toLowerCase().includes(keyword) ||
          task.itemName?.toLowerCase().includes(keyword)
        );
        const matchesTab = (this.activeTab === 'published' && task.ownerType === 'published') ||
                          (this.activeTab === 'received' && task.ownerType === 'received');
        console.log(`MyTask - filteredTasks: Task ID: ${task.id}, OwnerType: ${task.ownerType}, MatchesKeyword: ${matchesKeyword}, MatchesTab: ${matchesTab}, FilteredIn: ${matchesKeyword && matchesTab}`);
        return matchesKeyword && matchesTab;
      });
    }
  },
  methods: {
    loadStoredTasks() {
      try {
        console.log('MyTask - loadStoredTasks: 开始加载本地存储数据');
        const existingTasks = uni.getStorageSync('myTasks') || '[]';
        console.log('MyTask - loadStoredTasks: 从uni.getStorageSync(\'myTasks\')读取到:', existingTasks); 
        const parsedTasks = JSON.parse(existingTasks); 
        this.tasks = parsedTasks; 
        console.log('MyTask - loadStoredTasks: tasks 初始化成功，数据为:', this.tasks); 
      } catch (error) {
        console.error('MyTask - loadStoredTasks: 加载失败:', error);
        this.tasks = []; 
        console.log('MyTask - loadStoredTasks: 加载失败, tasks 初始化为空数组');
      }
    },
    saveTasks() {
      try {
        uni.setStorageSync('myTasks', JSON.stringify(this.tasks));
      } catch (error) {
        console.error('保存任务数据失败:', error);
      }
    },
    removeDuplicates(taskList) {
      const taskMap = new Map();
      for (const task of taskList) {
        taskMap.set(task.id, task);
      }
      return Array.from(taskMap.values());
    },
    switchTab(tab) {
      console.log('MyTask - switchTab: 切换标签页至:', tab);
      this.activeTab = tab;
      console.log('MyTask - switchTab: 当前 activeTab:', this.activeTab);
      console.log('MyTask - switchTab: 过滤后的任务列表 filteredTasks:', this.filteredTasks);
      this.searchKeyword = ''; // 切换标签页时清空搜索
      this.selectedTasks = []; // 清空已选任务
    },
    loadTasks(type) {
      setTimeout(() => {
        if (type === 'received') {
          // 模拟领取任务数据
        } else {
          // 默认加载发布任务数据
        }
        this.hasMore = true;
      }, 1000);
    },
    loadMoreTasks() {
      if (this.hasMore) {
        this.loadTasks(this.activeTab);
      }
    },
    onRefresh() {
      this.isRefreshing = true;
      setTimeout(() => {
        this.isRefreshing = false;
      }, 1500);
    },
    getTaskTypeColor(type) {
      const colorMap = {
        express: '#00BFFF',
        takeout: '#FF9F1C',
        buy: '#47B960',
        sell: '#9C27B0'
      };
      return colorMap[type] || '#999999';
    },
    getTaskTypeIcon(type) {
      const iconMap = {
        express: 'package',
        takeout: 'food',
        buy: 'shopping-cart',
        sell: 'tag'
      };
      return iconMap[type] || 'info';
    },
    getTaskTypeName(type) {
      const nameMap = {
        express: '快递代拿',
        takeout: '外卖代拿',
        buy: '求购',
        sell: '出售'
      };
      return nameMap[type] || '其他';
    },
    getTaskStatusText(status) {
      const statusMap = {
        pending: '待领取',
        processing: '进行中',
        completed: '已完成',
        cancelled: '已取消'
      };
      return statusMap[status] || '未知状态';
    },
    getPublishedActionText(status) {
      const actionMap = {
        pending: '取消任务',
        processing: '提醒领取',
        completed: '查看记录',
        cancelled: '删除任务'
      };
      return actionMap[status] || '查看详情';
    },
    getReceivedActionText(status) {
      const actionMap = {
        pending: '开始执行',
        processing: '上传凭证',
        completed: '查看记录',
        cancelled: '申请取消'
      };
      return actionMap[status] || '查看详情';
    },
    formatTime(time) {
      if (!time) return '';
      const date = new Date(time);
      return date.toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    },
    maskAddress(address) {
      if (!address) return '';
      const length = address.length;
      if (length <= 4) return address;
      return address.slice(0, 2) + '****' + address.slice(length - 2);
    },
    handlePublishedAction(task) {
      switch (task.status) {
        case 'pending':
          // 取消任务逻辑
          break;
        case 'processing':
          // 提醒领取逻辑
          break;
        case 'completed':
          uni.navigateTo({
            url: `/pages/task-record/task-record?id=${task.id}`
          });
          break;
      }
    },
    handleReceivedAction(task) {
      switch (task.status) {
        case 'pending':
          // 开始执行逻辑
          break;
        case 'processing':
          // 上传凭证逻辑
          break;
        case 'completed':
          // 查看记录逻辑
          break;
      }
    },
    handleBatchAction(action) {
      if (this.selectedTasks.length === 0) return;
      switch (action) {
        case 'cancel':
          // 批量取消逻辑
          break;
        case 'read':
          // 标记已读逻辑
          this.selectedTasks = [];
          break;
      }
    },
    showFilterOptions() {
      uni.showModal({
        title: '筛选条件',
        content: '暂未实现，敬请期待',
        confirmText: '知道了'
      });
    },
    navigateToDetail(task) {
      console.log('MyTask - navigateToDetail: 跳转到任务详情，任务ID:', task.id);
      const taskInfoStr = encodeURIComponent(JSON.stringify(task));
      uni.navigateTo({
        url: `/pages/TaskDetail/TaskDetail?taskInfo=${taskInfoStr}`,
        fail: (err) => {
          console.error('跳转任务详情页失败:', err);
          uni.showToast({
            title: '跳转失败',
            icon: 'none'
          });
        }
      });
    },
    handleSearch() {
      this.loadTasks(this.activeTab);
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
    getTimeSensitivityReminder(expectedDeliveryTime) {
      console.log('MyTask - getTimeSensitivityReminder: 传入的 expectedDeliveryTime:', expectedDeliveryTime);

      if (!expectedDeliveryTime) return '暂无时效信息';

      const now = new Date();
      let deadlineDate;

      deadlineDate = new Date(expectedDeliveryTime);

      if (isNaN(deadlineDate.getTime())) {
        const [hours, minutes] = expectedDeliveryTime.split(':').map(Number);
        if (!isNaN(hours) && !isNaN(minutes)) {
          const today = new Date(now);
          today.setHours(hours, minutes, 0, 0);
          deadlineDate = today;
        } else {
           console.error('MyTask - getTimeSensitivityReminder: 无法解析的日期时间格式:', expectedDeliveryTime);
           return '无效时效信息';
        }
      }

      const diffInMilliseconds = deadlineDate.getTime() - now.getTime();
      const diffInMinutes = Math.ceil(diffInMilliseconds / (1000 * 60));

      if (diffInMinutes < 0) {
        const overdueMinutes = Math.abs(diffInMinutes);
        if (overdueMinutes === 0) {
            return '已到截止时间';
        } else if (overdueMinutes < 60) {
            return `已超时 ${overdueMinutes} 分钟`;
        } else if (overdueMinutes < 60 * 24) {
            const overdueHours = Math.floor(overdueMinutes / 60);
            const remainingMinutes = overdueMinutes % 60;
            return `已超时 ${overdueHours} 小时 ${remainingMinutes} 分钟`;
        } else {
            const overdueDays = Math.floor(overdueMinutes / (60 * 24));
            return `已超时 ${overdueDays} 天`;
        }
      } else if (diffInMinutes > 0) {
        if (diffInMinutes < 60) {
          return `剩余 ${diffInMinutes} 分钟`;
        } else if (diffInMinutes < 60 * 24) {
          const hours = Math.floor(diffInMinutes / 60);
          const minutes = diffInMinutes % 60;
          return `剩余 ${hours} 小时 ${minutes} 分钟`;
        } else {
          const days = Math.floor(diffInMinutes / (60 * 24));
          return `剩余 ${days} 天`;
        }
      } else {
          return '已到截止时间';
      }
    },
    switchTestRole(role) {
      uni.setStorageSync('testRole', role);
      const user = this.TEST_USER[role] || this.TEST_USER.user;
      uni.setStorageSync('userToken', 'test_token'); 
      uni.setStorageSync('userId', user.id);
      uni.setStorageSync('userNickname', user.nickname);
      uni.setStorageSync('userAvatar', user.avatar);

      this.loadStoredTasks();

      uni.showToast({ title: `已切换至${role}角色`, icon: 'none' });
    }
  },
  onLoad(options) {
    console.log('MyTask - onLoad: 页面加载开始, 参数:', options);

    if (options.activeTab) {
      this.activeTab = options.activeTab;
      console.log('MyTask - onLoad: 根据参数设置 activeTab:', this.activeTab);
    } else {
      this.activeTab = 'published';
      console.log('MyTask - onLoad: 参数中未指定 activeTab，默认为:', this.activeTab);
    }

    this.loadStoredTasks();

    if (options.acceptedTask) {
      try {
        const acceptedTask = JSON.parse(decodeURIComponent(options.acceptedTask));
        console.log('MyTask - onLoad: 解析 acceptedTask:', acceptedTask);

        const existingIndex = this.tasks.findIndex(task => task.id === acceptedTask.id);
        if (existingIndex !== -1) {
          this.tasks[existingIndex] = acceptedTask;
          console.log('MyTask - onLoad: 任务已存在，更新:', acceptedTask.id);
        } else {
          this.tasks.unshift(acceptedTask);
          console.log('MyTask - onLoad: 添加新任务:', acceptedTask.id);
        }
        this.saveTasks();
      } catch (error) {
        console.error('MyTask - onLoad: 解析 acceptedTask 失败:', error);
      }
    }

    console.log('MyTask - onLoad: 页面加载完成');
  },
  onShow() {
    console.log('MyTask - onShow: 页面显示');
  },
  onReady() {
    console.log('MyTask - onReady: 页面初次渲染完成');
  },
  onHide() {
    console.log('MyTask - onHide: 页面隐藏');
  },
  onUnload() {
    console.log('MyTask - onUnload: 页面卸载');
    uni.$off('newTaskPublished');
  },
  onMounted() {
    console.log('MyTask - onMounted: 页面挂载');
    uni.$on('newTaskPublished', (taskData) => {
      console.log('MyTask - newTaskPublished event: 接收到新任务数据:', taskData);
      taskData.ownerType = 'published';
      const updatedTasks = [taskData, ...this.tasks];
      this.tasks = this.removeDuplicates(updatedTasks);
      this.saveTasks();
      console.log('MyTask - newTaskPublished event: 添加并保存后 tasks:', this.tasks);
    });
  }
}
</script>

<style>
.container {
  min-height: 100vh;
  background-color: #f5f5f5;
  display: flex;
  flex-direction: column;
  padding: 10rpx;
}

/* 搜索区域样式 */
.search-section {
  position: relative;
  padding: 60rpx 50rpx;
  background-color: #ffffff;
  height: 88rpx;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.search-box {
  position: absolute;
  left: 30rpx;
  top: 50%;
  transform: translateY(-50%);
  background-color: #f9f9f9;
  border-radius: 12rpx;
  padding: 16rpx 20rpx;
  width: calc(100% - 180rpx);
  height: 72rpx;
}

.search-box .uni-icons {
  position: absolute;
  left: 20rpx;
  top: 50%;
  transform: translateY(-50%);
  width: 36rpx;
  height: 36rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.search-input {
  position: absolute;
  left: 76rpx; /* 图标宽度(36rpx) + 图标左边距(20rpx) + 图标右边距(20rpx) */
  top: 50%;
  transform: translateY(-50%);
  width: calc(100% - 96rpx); /* 减去左侧空间(76rpx)和右侧padding(20rpx) */
  font-size: 14px;
  color: #333333;
  border: none;
  background-color: transparent;
  height: 40rpx;
  line-height: 40rpx;
}

.filter-btn {
  position: absolute;
  right: 30rpx;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  align-items: center;
  gap: 8rpx;
  padding: 16rpx;
  color: #00BFFF;
  font-size: 14px;
  font-weight: 500;
  white-space: nowrap;
}

/* 标签页样式 */
.tabs-section {
  position: relative;
  background-color: #ffffff;
  border-bottom: 1px solid #f0f0f0;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  height: 88rpx;
  width: 100%;
}

.tab-item {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  padding: 24rpx 30rpx;
  font-size: 16px;
  color: #666666;
  cursor: pointer;
  text-align: center;
  white-space: nowrap;
}

.tab-item:first-child {
  left: 30rpx;
}

.tab-item:last-child {
  right: 30rpx;
}

.tab-item.active {
  color: #00BFFF;
  font-weight: 500;
}

.tab-item.active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 40rpx;
  height: 4rpx;
  background-color: #00BFFF;
  border-radius: 2rpx;
}

.tab-badge {
  position: absolute;
  top: 16rpx;
  right: -20rpx;
  min-width: 32rpx;
  height: 32rpx;
  padding: 0 8rpx;
  background-color: #FF4D4F;
  border-radius: 16rpx;
  color: #ffffff;
  font-size: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 任务列表样式 */
.task-list {
  flex: 1;
  padding: 20rpx 30rpx;
}

.task-card {
  position: relative; /* 确保伪元素定位正确 */
  overflow: hidden; /* 隐藏超出伪元素部分 */
  background-color: #ffffff;
  border-radius: 16rpx;
  padding: 24rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.task-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  width: 10rpx; /* 色条宽度 */
}

.task-card.published-card::before {
  background-color: #00BFFF; /* 蓝色色条 */
}

.task-card.received-card {
  background-color: #e0f2f1; /* 浅绿色背景 */
}

.task-card.received-card::before {
  background-color: #4CAF50; /* 绿色色条 */
}

.task-header {
  position: absolute;
  top: 20rpx;
  right: 20rpx;
  display: flex;
  align-items: center;
  gap: 8rpx;
}

.task-type-status {
  display: flex;
  align-items: center;
  gap: 8rpx;
}

.task-type {
  display: flex;
  align-items: center;
  gap: 4rpx;
  padding: 6rpx 12rpx;
  border-radius: 4rpx;
  font-size: 12px;
  color: #ffffff;
}

.task-status {
  font-size: 12px;
  padding: 4rpx 8rpx;
  border-radius: 4rpx;
}

.task-status.pending {
  color: #FF9F1C;
  background-color: rgba(255, 159, 28, 0.1);
}

.task-status.processing {
  color: #00BFFF;
  background-color: rgba(0, 191, 255, 0.1);
}

.task-status.completed {
  color: #47B960;
  background-color: rgba(71, 185, 96, 0.1);
}

.task-status.cancelled {
  color: #999999;
  background-color: rgba(153, 153, 153, 0.1);
}

.task-title {
  font-size: 16px;
  font-weight: 500;
  color: #333333;
  margin-bottom: 16rpx;
}

.task-info {
  margin-top:30rpx;
  margin-bottom: 16rpx;
  position: relative;
  padding-left: 30rpx;
}

.info-item {
  margin-top:20rpx;
  position: relative;
  margin-bottom: 12rpx;
  height: 40rpx;
  line-height: 40rpx;
}

.info-item .bullet {
  position: absolute;
  left: -4rpx;
  top: 50%;
  transform: translateY(-50%);
  width: 20rpx;
  text-align: center;
  line-height: 1;
}

.info-item .label {
  position: absolute;
  left: 25rpx;
  top: 50%;
  transform: translateY(-50%);
  color: #999999;
  font-size: 14px;
  width: 140rpx;
}

.info-item .value {
  position: absolute;
  left: 160rpx;
  top: 50%;
  transform: translateY(-50%);
  color: #333333;
  font-size: 14px;
  width: calc(100% - 160rpx);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.info-item .reward {
  color: #FF9F1C;
  font-weight: 500;
}

.task-update {
  display: flex;
  align-items: center;
  gap: 8rpx;
  margin-bottom: 16rpx;
  font-size: 12px;
  color: #999999;
}

.task-actions {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 16rpx;
}

.action-btn {
  padding: 12rpx 24rpx;
  border-radius: 6rpx;
  font-size: 14px;
  color: #00BFFF;
  background-color: rgba(0, 191, 255, 0.1);
  border: none;
}

.task-time {
  font-size: 12px;
  color: #999999;
}

/* 加载更多样式 */
.loading-more,
.no-more {
  text-align: center;
  padding: 20rpx 0;
  color: #999999;
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8rpx;
}

/* 底部操作栏样式 */
.bottom-bar {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #ffffff;
  padding: 20rpx 30rpx;
  padding-bottom: calc(20rpx + env(safe-area-inset-bottom));
  box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.05);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.selected-count {
  font-size: 14px;
  color: #666666;
}

.batch-actions {
  display: flex;
  gap: 20rpx;
}

.batch-btn {
  padding: 12rpx 24rpx;
  border-radius: 6rpx;
  font-size: 14px;
  color: #ffffff;
  background-color: #00BFFF;
  border: none;
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
