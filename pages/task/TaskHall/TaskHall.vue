<template>
	<view class="container">
		 <!-- 搜索区域 -->
    <view class="search-section">
      <view class="search-box">
        <uni-icons type="search" size="18" color="#999999" />
        <input 
          type="text" 
          v-model="searchKeyword" 
          placeholder="搜索任务类型、状态、关键词" 
          class="search-input"
          @input="handleSearchInput"
        />
      </view>
      <view class="filter-btn" @tap="showFilterOptions">
        <uni-icons type="filter" size="18" color="#00BFFF" />
        <text>筛选</text>
      </view>
    </view>

		<!-- 分类标签 -->
	<scroll-view 
  class="category-tabs" 
  scroll-x="true"
  :scroll-with-animation="true"
  :scroll-left="scrollLeft"
  :enhanced="true"
  :show-scrollbar="false"
  @scroll="handleScroll"
>
  <view class="tabs-container">
    <view 
      class="tab-item"
      :class="{ 'tab-active': activeTab === item.value }"
      v-for="(item, index) in categories" 
      :key="index"
      @tap="switchTab(index)"
    >
      {{item.name}}
    </view>
  </view>
</scroll-view>
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
				v-for="task in filteredTasks" 
				:key="task.id"
				:class="{ 'is-top': task.isTop }"
				@tap="navigateToDetail(task.id)"
			>
				<!-- 任务标签 -->
				<view class="task-tags" v-if="task.tags && task.tags.length > 0">
					<view 
						class="tag" 
						v-for="(tag, index) in task.tags" 
						:key="index"
						:class="getTagClass(tag)"
					>
						<uni-icons 
							v-if="getTagIcon(tag)" 
							:type="getTagIcon(tag)" 
							size="14" 
							:color="getTagColor(tag)" 
						/>
						<text>{{ tag }}</text>
					</view>
				</view>

				<!-- 任务类型和状态 -->
				<view class="task-header">
					<!-- 左侧用户信息 -->
					<view class="user-info">
						<view class="avatar-wrapper">
							<image class="avatar" :src="task.publisher.avatar" mode="aspectFill" />
						</view>
						<view class="sub-title">
						<text class="nickname">{{ task.publisher.nickname }}</text>
						<text>发布时间:</text>
						</view>
					</view>
					
					<!-- 右侧任务类型和状态 -->
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
				<view class="task-title">{{ task.title }}</view>

				<!-- 任务关键信息 -->
				<view class="task-info">
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
					<view class="info-item" v-if="task.type === 'buy' || task.type === 'sell'">
						<uni-icons type="paperplane" size="12" color="#00BFFF" class="bullet" />
						<text class="label">物品名称：</text>
						<text class="value">{{ task.itemName }}</text>
					</view>
					<view class="info-item">
						<uni-icons type="wallet" size="12" color="#00BFFF" class="bullet" />
						<text class="label">悬赏金额：</text>
						<text class="value reward">¥{{ task.reward }}</text>
					</view>
				</view>
		
				<!-- 任务操作区 -->
				<view class="task-actions">
					<view class="action-left">
						<view class="distance" v-if="task.distance">
							<uni-icons type="location" size="14" color="#999999" />
							<text>{{ task.distance }}km</text>
						</view>
						<view class="views" v-if="task.views">
							<uni-icons type="eye" size="14" color="#999999" />
							<text>{{ task.views }}次浏览</text>
						</view>
					</view>
					<button 
						v-if="task.status === 'pending'"
						class="action-btn" 
						@tap.stop="handleTakeTask(task)"
					>
						立即接单
					</button>
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
	</view>
</template>

<script>
export default {
  data() {
    return {
      categories: [
        { name: '全部', value: 'all' },
        { name: '快递代取', value: 'express' },
        { name: '外卖代拿', value: 'takeout' },
        { name: '求购', value: 'buy' },
        { name: '出物', value: 'sell' },
        { name: '其他', value: 'other' }
      ],
      scrollLeft: 0,
      tabWidths: [],
      tabPositions: [],
      searchKeyword: '',
      activeTab: 'all',
      isRefreshing: false,
      hasMore: true,
      searchTimer: null,
      currentTabId: 'tab-0',
      tasks: []
    }
  },
  computed: {
    filteredTasks() {
      return this.tasks.filter(task => {
        const keyword = this.searchKeyword.trim().toLowerCase();
        const typeMatch = this.activeTab === 'all' || task.type === this.activeTab;
        const keywordMatch = 
          task.title.toLowerCase().includes(keyword) ||
          task.pickupAddress?.toLowerCase().includes(keyword) ||
          task.deliveryAddress?.toLowerCase().includes(keyword) ||
          task.itemName?.toLowerCase().includes(keyword);
        return typeMatch && keywordMatch;
      });
    }
  },
  methods: {
    loadStoredTasks() {
      console.log('TaskHall - loadStoredTasks: 开始加载本地存储数据');
      try {
        const storedTasks = uni.getStorageSync('myTasks');
        console.log('TaskHall - loadStoredTasks: 读取到的存储数据:', storedTasks);
        if (storedTasks) {
          const parsedTasks = JSON.parse(storedTasks);
          this.tasks = parsedTasks;
          console.log('TaskHall - loadStoredTasks: 加载后的 tasks:', this.tasks);
        } else {
          this.tasks = [];
          console.log('TaskHall - loadStoredTasks: 本地存储无数据，tasks 初始化为空数组');
        }
      } catch (error) {
        console.error('TaskHall - 加载存储的任务数据失败:', error);
        this.tasks = [];
        console.log('TaskHall - loadStoredTasks: 加载失败，tasks 初始化为空数组');
      }
    },
    saveTasks() {
      try {
        uni.setStorageSync('myTasks', JSON.stringify(this.tasks));
        console.log('TaskHall - saveTasks: 任务数据已保存到本地存储');
      } catch (error) {
        console.error('TaskHall - 保存任务数据失败:', error);
      }
    },
    handleSearchInput() {
      if (this.searchTimer) {
        clearTimeout(this.searchTimer);
      }
      this.searchTimer = setTimeout(() => {
        this.handleSearch();
      }, 300);
    },
    handleSearchConfirm() {
      if (this.searchTimer) {
        clearTimeout(this.searchTimer);
      }
      this.handleSearch();
    },
    clearSearch() {
      this.searchKeyword = '';
      this.handleSearch();
    },
    handleSearch() {
      console.log('搜索关键词：', this.searchKeyword);
      this.loadTasks();
    },
    handleScroll(e) {
      console.log('滚动位置:', e.detail.scrollLeft);
    },
    calculateTabPositions() {
      const query = uni.createSelectorQuery().in(this);
      this.categories.forEach((_, index) => {
        query.select(`.tab-item:nth-child(${index + 1})`).boundingClientRect();
      });
      
      query.exec((res) => {
        let position = 0;
        this.tabPositions = res.map(rect => {
          const currentPosition = position;
          position += rect.width + 24;
          return currentPosition;
        });
      });
    },
    switchTab(index) {
      this.activeTab = this.categories[index].value;
      this.searchKeyword = '';
      this.loadTasks();
      
      const query = uni.createSelectorQuery();
      query.selectAll('.tab-item').boundingClientRect();
      query.select('.category-tabs').boundingClientRect();
      query.exec((res) => {
        if (res[0] && res[1]) {
          const tabs = res[0];
          const scrollView = res[1];
          let position = 0;
          
          for (let i = 0; i < index; i++) {
            position += tabs[i].width + 24;
          }
          
          const tabWidth = tabs[index].width;
          const scrollViewWidth = scrollView.width;
          this.scrollLeft = Math.max(0, position - (scrollViewWidth / 2) + (tabWidth / 2));
        }
      });
    },
    loadTasks() {
      setTimeout(() => {
        this.hasMore = false;
      }, 1000);
    },
    loadMoreTasks() {
      if (this.hasMore) {
        this.loadTasks();
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
        express: '快递代取',
        takeout: '外卖代拿',
        buy: '求购',
        sell: '出物'
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
    formatTime(time) {
      if (!time) return '';
      const date = new Date(time);
      return date.toLocaleString('zh-CN', {
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    },
    formatExpireTime(time) {
      if (!time) return '';
      const now = new Date();
      const expire = new Date(time);
      const diff = expire.getTime() - now.getTime();
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      
      if (hours > 0) {
        return `${hours}小时后过期`;
      } else if (minutes > 0) {
        return `${minutes}分钟后过期`;
      } else {
        return '即将过期';
      }
    },
    maskAddress(address) {
      if (!address) return '';
      const length = address.length;
      if (length <= 4) return address;
      return address.slice(0, 2) + '****' + address.slice(length - 2);
    },
    showFilterOptions() {
      uni.showActionSheet({
        itemList: ['按距离排序', '按悬赏排序', '按时间排序', '只看急单'],
        success: (res) => {
          console.log('选择筛选选项：', res.tapIndex);
        }
      });
    },
    handleTakeTask(task) {
      const taskInfo = {
        id: task.id,
        type: task.type,
        title: task.title,
        description: task.description,
        reward: task.reward,
        publishTime: task.publishTime,
        expectedDeliveryTime: task.expectedDeliveryTime,
        pickupAddress: task.pickupAddress,
        deliveryAddress: task.deliveryAddress,
        images: task.images || [],
        publisher: {
          id: task.publisherId,
          nickname: task.publisherName,
          avatar: task.publisherAvatar,
          creditRating: task.publisherRating
        }
      };

      uni.navigateTo({
        url: `/pages/TaskDetail/TaskDetail?taskInfo=${encodeURIComponent(JSON.stringify(taskInfo))}`
      });
    },
    navigateToDetail(taskId) {
      uni.navigateTo({
        url: `/pages/task-detail/task-detail?id=${taskId}`
      });
    },
    getTagClass(tag) {
      const classMap = {
        '置顶': 'tag-top',
        '加急': 'tag-urgent'
      };
      return classMap[tag] || '';
    },
    getTagIcon(tag) {
      const iconMap = {
        '置顶': 'top',
        '加急': 'notification-filled'
      };
      return iconMap[tag] || '';
    },
    getTagColor(tag) {
      const colorMap = {
        '置顶': '#FF9F1C',
        '加急': '#FF4D4F'
      };
      return colorMap[tag] || '#666666';
    }
  },
  onLoad(options) {
    console.log('TaskHall - onLoad: 页面加载开始, 参数:', options);
    
    if (options.taskInfo) {
      try {
        const taskData = JSON.parse(decodeURIComponent(options.taskInfo));
        console.log('TaskHall接收到URL传递的任务数据:', taskData);
        
        if (this.activeTab !== 'all') {
          this.activeTab = 'all';
        }
      } catch (error) {
        console.error('TaskHall - 解析任务数据失败:', error);
        uni.showToast({
          title: '加载任务数据失败',
          icon: 'none'
        });
      }
    }
    
    console.log('TaskHall - onLoad: 页面加载完成');
  },
  onMounted() {
    console.log('TaskHall - onMounted: 页面挂载');
    this.loadStoredTasks();
    
    uni.$on('newTaskPublished', (taskData) => {
      console.log('TaskHall接收到新任务数据:', taskData);
      this.tasks.unshift(taskData);
      this.saveTasks();
      
      if (this.activeTab !== 'all') {
        this.activeTab = 'all';
      }
    });
  },
  onUnmounted() {
    console.log('TaskHall - onUnmounted: 页面卸载');
    uni.$off('newTaskPublished');
  }
}
</script>

<style>
.container {
	min-height: 100vh;
	background-color: #f5f5f5;
	display: flex;
	flex-direction: column;
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
  left: 76rpx;
  top: 50%;
  transform: translateY(-50%);
  width: calc(100% - 96rpx);
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
/* 分类标签 */
.category-tabs {
  width: 100%;
  height: 80rpx;
  background-color: #FFFFFF;
  white-space: nowrap;
  -webkit-overflow-scrolling: touch;
  overflow: hidden;
}

.tabs-container {
  display: flex;
  flex-direction: row;
  height: 100%;
  padding: 0 30rpx;
  min-width: 100%;
}

.tab-item {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 32rpx;
  margin-right: 24rpx;
  font-size: 28rpx;
  font-weight: 400;
  color: #666666;
  background-color: #F5F5F5;
  border-radius: 40rpx;
  height: 60rpx;
  flex-shrink: 0;
  transition: all 0.3s ease;
  min-width: 120rpx;
}

.tab-active {
  background-color: #00BFFF;
  color: #FFFFFF;
  font-weight: 500;
  box-shadow: 0 4rpx 12rpx rgba(0, 191, 255, 0.2);
}

/* 添加渐变遮罩效果 */
.category-tabs::before,
.category-tabs::after {
  content: '';
  position: absolute;
  top: 0;
  bottom: 0;
  width: 60rpx;
  pointer-events: none;
  z-index: 1;
}

.category-tabs::before {
  left: 0;
  background: linear-gradient(to right, #FFFFFF, transparent);
}

.category-tabs::after {
  right: 0;
  background: linear-gradient(to left, #FFFFFF, transparent);
}

/* 任务列表样式 */
.task-list {
	flex: 1;
	padding: 20rpx 30rpx;
}

.task-card {
	background-color: #ffffff;
	border-radius: 16rpx;
	padding: 24rpx;
	margin-bottom: 20rpx;
	box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
	position: relative;
	transition: all 0.3s ease;
}

.task-card.is-top {
	border: 2px solid #FF9F1C;
}

.task-card:active {
	transform: scale(0.98);
}

.task-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 16rpx;
	height: 150rpx;
	margin-top: 80rpx;
}

/* 用户信息样式 */
.user-info {
  display: flex;
  flex-direction: row;
  align-items: center;
  position: absolute;
  left: 24rpx;
  top: 50%;
  transform: translateY(-50%);
  height: 100%;
}
.sub-title{
	display:flex;
}
.avatar-wrapper {
  width: 150rpx;
  height: 150rpx;
  margin-right: 16rpx;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.avatar {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  border: 2rpx solid #f0f0f0;
}

.nickname {
  font-size: 14px;
  color: #333333;
  font-weight: 500;
  white-space: nowrap;
  line-height: 64rpx;
  display: inline-block;
}

/* 任务类型和状态样式 */
.task-type-status {
	position: absolute;
	right: 24rpx;
	top: 50%;
	transform: translateY(-50%);
	display: flex;
	flex-direction: column;
	align-items: flex-end;
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

.task-time {
	display: flex;
	align-items: center;
	gap: 4rpx;
	font-size: 12px;
	color: #999999;
}

.task-title {
	padding-left: 30rpx;
	font-size: 16px;
	font-weight: 500;
	color: #333333;
	margin-bottom: 16rpx;
}

.task-info {
  margin-bottom: 16rpx;
  position: relative;
  padding-left: 30rpx;
  border-left: 4rpx solid #00BFFF;
  margin-left: 20rpx;
}

.info-item {
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

.info-item .value.reward {
  color: #FF9F1C;
  font-weight: 500;
}

/* 任务操作区样式 */
.task-actions {
  position: relative;
  margin-top: 20rpx;
  padding-top: 20rpx;
  border-top: 1px solid #f0f0f0;
  min-height: 100rpx;
}

.action-left {
  position: absolute;
  left: 24rpx;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 24rpx;
}

.distance, .views {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 4rpx;
  font-size: 12px;
  color: #999999;
  white-space: nowrap;
}

.distance {
  position: relative;
  left: 0;
}

.views {
  position: relative;
  left: 0;
}

.action-btn {
  position: absolute;
  right: 24rpx;
  bottom: 0;
  padding: 12rpx 32rpx;
  border-radius: 32rpx;
  font-size: 14px;
  color: #ffffff;
  background-color: #00BFFF;
  border: none;
  box-shadow: 0 4px 12px rgba(0, 191, 255, 0.2);
  transition: all 0.3s ease;
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

/* 任务标签样式 */
.task-tags {
	margin-bottom:20rpx;
  position: absolute;
  top: 24rpx;
  left: 24rpx;
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
  gap: 12rpx;
  z-index: 1;
  max-width: calc(100% - 48rpx);
}

.tag {
  display: flex;
  align-items: center;
  gap: 6rpx;
  padding: 6rpx 16rpx;
  border-radius: 24rpx;
  font-size: 12px;
  white-space: nowrap;
  flex-shrink: 0;
  backdrop-filter: blur(4px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.tag-top {
  background: linear-gradient(135deg, rgba(255, 159, 28, 0.1), rgba(255, 159, 28, 0.2));
  color: #FF9F1C;
  border: 1px solid rgba(255, 159, 28, 0.3);
}

.tag-urgent {
  background: linear-gradient(135deg, rgba(255, 77, 79, 0.1), rgba(255, 77, 79, 0.2));
  color: #FF4D4F;
  border: 1px solid rgba(255, 77, 79, 0.3);
}

.tag:active {
  transform: scale(0.95);
  opacity: 0.9;
}
</style>