<template>
	<view class="container">
		<!-- 顶部导航栏 -->
		<view class="header">
			<view class="category-filter cursor-pointer" @click="handleCategoryFilter">
				<view class="filter-text">{{ getTaskTypeName(filterType) }}</view>
				<uni-icons type="bottom" size="14" color="#333"></uni-icons>
			</view>
			<view class="search-box">
				<uni-icons type="search" size="18" color="#999"></uni-icons>
				<input type="text" placeholder="搜索任务" class="search-input" v-model="searchQuery" @confirm="handleSearch" />
				<uni-icons type="mic" size="18" color="#999" class="voice-icon cursor-pointer" @click="handleVoiceSearch"></uni-icons>
			</view>
			<view class="publish-btn cursor-pointer" @click="goTaskRelease">
				<uni-icons type="plusempty" size="22" color="#FFFFFF"></uni-icons>
			</view>
		</view>
		<!-- 内容区域 -->
		<scroll-view scroll-y class="content-area" refresher-enabled @refresherrefresh="onRefresh"
			:refresher-triggered="isRefreshing">
			<!-- 轮播图 -->
			<view class="banner-section">
				<swiper class="banner-swiper" indicator-dots autoplay circular :interval="3000" :duration="500">
					<swiper-item v-for="(item, index) in bannerList" :key="index" class="cursor-pointer">
						<image :src="item.imageUrl" mode="aspectFill" class="banner-image"></image>
					</swiper-item>
				</swiper>
			</view>

			<!-- 智能推荐发布 -->
			<view class="quick-publish">
				<view class="quick-publish-left">
					<uni-icons type="notification" size="18" color="#3B7FF3"></uni-icons>
					<text>是否想要发布任务获得帮助?</text>
				</view>
				<view class="quick-publish-btn cursor-pointer" @click="goTaskRelease">
					<text>快速发布</text>
					<uni-icons type="plusempty" size="14" color="#FFFFFF"></uni-icons>
				</view>
			</view>
			<!-- 任务瀑布流 -->
			<view class="task-flow">
				<view class="flow-header">
					<text class="flow-title">任务大厅</text>
					<view class="flow-filter cursor-pointer" @click="handleSortFilter">
						<uni-icons :type="getSortIcon(sortType)" size="14" color="#333" class="sort-icon"></uni-icons>
						<text class="sort-text">{{ getSortTypeText(sortType) }}</text>
						<uni-icons type="arrowdown" size="14" color="#999"></uni-icons>
						<text class="sort-description" v-if="sortType === 'smart'">距离 +赏金 + 发布时间</text>
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
						v-for="task in searchTasks" 
						:key="task.id"
						:class="{ 'is-top': task.isTop, 'is-urgent': task.isUrgent }"
						@tap="navigateToDetail(task)"
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
								<text v-if="tag !== 'urgent'">{{ tag }}</text>
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
									<text class="publish-time">发布时间: {{ formatPublishTime(task.publishTime) }}</text>
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
						<view class="task-title">{{ getFormattedTitle(task) }}</view>

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
							<!-- 期望送达时间 - 仅在快递或外卖显示 -->
							<view class="info-item" v-if="task.type === 'express' || task.type === 'takeout'">
								<uni-icons type="calendar" size="12" color="#00BFFF" class="bullet" />
								<text class="label">期望送达：</text>
								<text class="value">{{ task.expectedDeliveryTime }}</text>
								</view>
							<!-- 图片显示区域 - 仅在出物和求购任务且有图片时显示 -->
							<view class="task-images" v-if="(task.type === 'buy' || task.type === 'sell') && task.images && task.images.length > 0">
								<image 
									v-for="(image, imgIndex) in task.images"
									:key="imgIndex"
									:src="image"
									mode="aspectFill"
									class="task-image-thumbnail"
								></image>
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
		</scroll-view>
	</view>
</template>

<script lang="ts" setup>
	import { ref, computed, onMounted, onUnmounted } from 'vue';
	import { onLoad, onShow } from '@dcloudio/uni-app';

	// 刷新状态
	const isRefreshing = ref(false);
	const hasMore = ref(true);
	const filteredTasks = ref([]);

	// 分页状态
	const page = ref(1);
	const pageSize = ref(10);

	// 筛选和排序状态
	const filterType = ref('all'); // 分类筛选
	const sortType = ref('smart'); // 排序方式：smart, time, price, distance
	const searchQuery = ref(''); // 搜索查询

	// 轮播图数据
	const bannerList = ref([
		{
			imageUrl: 'https://readdy.ai/api/search-image?query=Modern%20university%20campus%20scene%20with%20students%20walking%20and%20exchanging%20books%20and%20materials%2C%20bright%20daylight%2C%20vibrant%20atmosphere%2C%20school%20buildings%20in%20background%2C%20natural%20colors%2C%20photorealistic%20style%2C%20high%20quality%20details%2C%20showing%20student%20life%20and%20activities&width=686&height=386&seq=banner1&orientation=landscape'
		},
		{
			imageUrl: 'https://readdy.ai/api/search-image?query=Campus%20food%20delivery%20service%20illustration%20showing%20students%20receiving%20food%20packages%2C%20university%20cafeteria%20in%20background%2C%20sunny%20day%2C%20casual%20atmosphere%2C%20photorealistic%20style%2C%20showing%20convenience%20of%20food%20delivery%20on%20campus&width=686&height=386&seq=banner2&orientation=landscape'
		},
		{
			imageUrl: 'https://readdy.ai/api/search-image?query=Students%20exchanging%20study%20materials%20and%20textbooks%20in%20university%20library%2C%20bookshelves%20in%20background%2C%20warm%20lighting%2C%20academic%20atmosphere%2C%20photorealistic%20style%2C%20showing%20educational%20resource%20sharing&width=686&height=386&seq=banner3&orientation=landscape'
		}
	]);

	// 加载任务列表
	const loadTasks = () => {
  try {
    const tasks = uni.getStorageSync('taskList');
  
    if (tasks) {
      const allTasks = JSON.parse(tasks);
      page.value = 1;
      filteredTasks.value = allTasks.slice(0, pageSize.value);
    
      hasMore.value = allTasks.length > pageSize.value;
   
    }
  } catch (error) {
    console.error('本地数据解析失败:', error);
    filteredTasks.value = [];
  }
};

	// 加载更多任务
	const loadMoreTasks = () => {
		if (!hasMore.value) return;
		
		// 显示加载状态
		hasMore.value = false;
		
		// 模拟加载更多数据（实际项目中应调用API）
		setTimeout(() => {
			try {
				const tasks = uni.getStorageSync('taskList');
				if (tasks) {
					const allTasks = JSON.parse(tasks);
					const start = page.value * pageSize.value;
					const end = start + pageSize.value;
					
					// 拼接新任务
					const newTasks = allTasks.slice(start, end);
					if (newTasks.length > 0) {
						filteredTasks.value = [...filteredTasks.value, ...newTasks];
						page.value++;
						hasMore.value = allTasks.length > end;
					} else {
						hasMore.value = false;
					}
				}
			} catch (error) {
				console.error('加载更多任务失败:', error);
				hasMore.value = false;
			}
		}, 1000);
	};

	// 监听新任务发布事件
	const handleNewTask = (taskData: any) => {
		console.log('[index.vue] handleNewTask 接收到新任务数据:', taskData);
		// 检查任务是否已经存在，如果存在则不添加
		const existingTaskIndex = filteredTasks.value.findIndex((task: any) => task.id === taskData.id);
		if (existingTaskIndex !== -1) {
			console.log('任务已存在，跳过添加:', taskData.id);
			return;
		}

		// 将新任务添加到列表开头
		filteredTasks.value.unshift(taskData);
		console.log('[index.vue] handleNewTask 添加后 filteredTasks:', filteredTasks.value);
		
		// 更新本地存储
		try {
			const tasks = uni.getStorageSync('taskList');
			const allTasks = tasks ? JSON.parse(tasks) : [];
			allTasks.unshift(taskData);
			uni.setStorageSync('taskList', JSON.stringify(allTasks));
		} catch (error) {
			console.error('更新任务列表失败:', error);
		}
	};

	// 下拉刷新
	const onRefresh = () => {
		isRefreshing.value = true;
		loadTasks(); // 重新加载任务列表
		setTimeout(() => {
			isRefreshing.value = false;
		}, 1000);
	};

	// 页面加载生命周期
	onLoad(() => {
		
		// 清除任务相关本地缓存
		uni.removeStorageSync('taskList');
		// 如有其他任务相关缓存也可一并删除
		// uni.removeStorageSync('filteredTasks');
		// uni.removeStorageSync('newTask');
		// 这里开始拉取云端数据
		loadTasksFromCloud(1, 10, filterType.value, searchQuery.value);
	});

	// 页面显示时自动刷新任务列表
	onShow(() => {
		loadTasksFromCloud(1, 10, filterType.value, searchQuery.value);
	});

	// 组件挂载时添加事件监听
	onMounted(() => {
		uni.$on('newTaskPublished', handleNewTask);
	});

	// 组件卸载时移除事件监听
	onUnmounted(() => {
		uni.$off('newTaskPublished', handleNewTask);
	});

	// 导航方法
	// const gocircle = () => {
	// 	uni.switchTab({
	// 		url: "/pages/circle/circle"
	// 	});
	// };

	// const gomessage = () => {
	// 	uni.switchTab({
	// 		url: "/pages/message/MessageCenter/MessageCenter"
	// 	});
	// };

	// const gouser = () => {
	// 	uni.switchTab({
	// 		url: "/pages/user/user"
	// 	});
	// };

	const goTaskRelease = () => {
		uni.navigateTo({
			url: "/pages/task/TaskRelease/TaskRelease"
		});
	};

	// 处理接单
	const handleTakeTask = (task: any) => {
		uni.showModal({
			title: '确认接单',
			content: '确定要接这个任务吗？',
			success: async (res) => {
				if (res.confirm) {
					try {
						// 1. 调用云函数更新任务状态
						const result = await uniCloud.callFunction({
							name: 'updateTaskStatus',
							data: {
								taskId: task.id,
								status: 'processing',
								acceptorId: 'user_123', // 当前用户ID，实际项目中应该从用户信息获取
								acceptorName: '当前用户', // 当前用户昵称
								acceptorAvatar: '/static/images/avatar1.png' // 当前用户头像
							}
						});

						if (result.result.code === 200) {
							// 2. 更新本地任务状态
							task.status = 'processing';
							task.acceptor_id = 'user_123';
							task.acceptor_name = '当前用户';
							task.acceptor_avatar = '/static/images/avatar1.png';

							// 3. 本地任务列表同步更新
							// 更新 filteredTasks
							const idx = filteredTasks.value.findIndex((t: any) => t.id === task.id);
							if (idx !== -1) {
								filteredTasks.value[idx] = { ...task };
							}
							// 更新本地存储
							try {
								const tasks = uni.getStorageSync('taskList');
								let allTasks = tasks ? JSON.parse(tasks) : [];
								const allIdx = allTasks.findIndex((t: any) => t.id === task.id);
								if (allIdx !== -1) {
									allTasks[allIdx] = { ...task };
									uni.setStorageSync('taskList', JSON.stringify(allTasks));
								}
							} catch (e) {
								console.error('本地任务同步失败', e);
							}

							// 4. 操作反馈
							uni.showToast({
								title: '接单成功，正在跳转聊天',
								icon: 'success'
							});

							// 5. 跳转到聊天页面，传递任务ID
							setTimeout(() => {
		uni.navigateTo({
									url: `/pages/message/Chat/Chat?taskId=${task.id}`
								});
							}, 800);
						} else {
							throw new Error(result.result.msg || '接单失败');
						}
					} catch (error) {
						console.error('接单失败:', error);
						uni.showToast({
							title: '接单失败，请重试',
							icon: 'none'
						});
					}
				}
			}
		});
	};

	// 跳转到任务详情
	const navigateToDetail = (task: any) => {
		uni.navigateTo({
			url: `/pages/task/TaskDetail/TaskDetail?id=${task.id}`,
			success: (res) => {
				// 通过eventChannel向详情页传递数据
				res.eventChannel.emit('taskData', { task })
			}
		});
	};

	// 获取任务类型颜色
	const getTaskTypeColor = (type: string) => {
		const colorMap: Record<string, string> = {
			'express': '#00BFFF',
			'takeout': '#FF9500',
			'buy': '#4CD964',
			'sell': '#FF3B30',
		
			 'other': '#8E8E93'
		};
		return colorMap[type] || '#8E8E93';
	};

	// 获取任务类型图标
	const getTaskTypeIcon = (type: string) => {
		const iconMap: Record<string, string> = {
			'express': 'paperplane',
			'takeout': 'shop',
			'buy': 'cart',
			'sell': 'gift',
			
		};
		return iconMap[type] || 'info';
	};

	// 获取任务类型名称
	const getTaskTypeName = (type: string) => {
		const nameMap: Record<string, string> = {
			'all': '全部分类',
			'express': '快递',
			'takeout': '外卖',
			'buy': '求购',
			'sell': '出物',
			'other': '其他'
		};
		return nameMap[type] || '其他';
	};

	// 获取任务状态文本
	const getTaskStatusText = (status: string) => {
		const statusMap: Record<string, string> = {
			'pending': '待接单',
			'processing': '进行中',
			'completed': '已完成',
			'cancelled': '已取消'
		};
		return statusMap[status] || '未知状态';
	};

	// 获取标签样式
	const getTagClass = (tag: string) => {
		return `tag-${tag.toLowerCase()}`;
	};

	// 获取标签图标
	const getTagIcon = (tag: string) => {
		const iconMap: Record<string, string> = {
			'urgent': 'fire',
			'new': 'star',
			'hot': 'fire-filled'
		};
		return iconMap[tag.toLowerCase()] || '';
	};

	// 获取标签颜色
	const getTagColor = (tag: string) => {
		const colorMap: Record<string, string> = {
			'urgent': '#FF3B30',
			'new': '#4CD964',
			'hot': '#FF9500'
		};
		return colorMap[tag.toLowerCase()] || '#8E8E93';
	};

	// 获取物品成色文本
	const getConditionText = (condition: string) => {
		const conditionMap: Record<string, string> = {
			'new': '全新',
			'like-new': '九成新',
			'good': '八成新',
			'fair': '七成新'
		};
		return conditionMap[condition] || '';
	};

	// 获取格式化标题
	const getFormattedTitle = (task: any) => {
		if (!task) return '未知任务';
		
		switch (task.type) {
			case 'buy':
				return `求购${task.itemName || ''}${task.selectedCondition ? `(${getConditionText(task.selectedCondition)})` : ''}`;
			case 'express':
				return `${task.pickupAddress || ''}快递代取`;
			case 'sell':
				return `出${task.selectedCondition ? getConditionText(task.selectedCondition) : ''}${task.itemName || ''}`;
			case 'takeout':
				return `${task.pickupAddress || ''}外卖代拿`;
			case 'other':
				return task.title || '其他任务';
			default:
				return task.title;
		}
	};

	// 地址脱敏
	const maskAddress = (address: string) => {
		if (!address) return '';
		return address.replace(/(\d{3})\d+(\d{4})/, '$1****$2');
	};

	// 获取排序类型文本
	const getSortTypeText = (type: string) => {
		const sortMap: Record<string, string> = {
			'smart': '综合排序',
			'time': '最新发布',
			'price': '悬赏最高',
			'distance': '距离最近'
		};
		return sortMap[type] || '综合排序';
	};

	// 获取排序图标
	const getSortIcon = (type: string) => {
		const iconMap: Record<string, string> = {
			'smart': 'star', // 综合排序用星形图标
			'time': 'calendar', // 最新发布用日历图标
			'price': 'wallet', // 悬赏最高用钱包图标
			'distance': 'location-filled' // 距离最近用定位图标
		};
		return iconMap[type] || 'info'; // 默认图标
	};

	// 处理分类筛选
	const handleCategoryFilter = () => {
		const itemList = ['全部', '快递代取', '外卖代拿', '求购', '出物','其他'];
		uni.showActionSheet({
			itemList: itemList,
			success: (res) => {
				const selectedType = itemList[res.tapIndex];
				const typeMap: Record<string, string> = {
					'全部': 'all',
					'快递代取': 'express',
					'外卖代拿': 'takeout',
					'求购': 'buy',
					'出物': 'sell',
					'其他': 'other'
				};
				filterType.value = typeMap[selectedType];
			}
		});
	};

	// 处理排序筛选
	const handleSortFilter = () => {
		const itemList = ['综合排序', '最新发布', '悬赏最高', '距离最近'];
		uni.showActionSheet({
			itemList: itemList,
			success: (res) => {
				const selectedSort = itemList[res.tapIndex];
				const sortMap: Record<string, string> = {
					'综合排序': 'smart',
					'最新发布': 'time',
					'悬赏最高': 'price',
					'距离最近': 'distance'
				};
				sortType.value = sortMap[selectedSort];
			}
		});
	};

	// 处理搜索事件
	const handleSearch = () => {
		console.log('执行搜索:', searchQuery.value);
		// 可以在这里添加实际的搜索逻辑，例如重新加载数据或触发其他操作
	};

	// 处理语音搜索事件
	const handleVoiceSearch = () => {
		uni.showToast({
			title: '语音搜索功能待开发',
			icon: 'none'
		});
		console.log('语音搜索');
	};

	// 根据分类和排序筛选任务
	const filteredAndSortedTasks = computed(() => {
		console.log('[筛选前任务数]', filteredTasks.value.length);
	  let result = [...filteredTasks.value];
	  
	  // 分类筛选
	  if (filterType.value !== 'all') {
	    result = result.filter((task: any) => task.type === filterType.value);
			console.log(`[按类型${filterType.value}筛选后]`, result.length);
	  }
	  
	  // 排序
	  switch (sortType.value) {
	    case 'time': // 按时间排序
	      result.sort((a: any, b: any) => new Date(b.publishTime).getTime() - new Date(a.publishTime).getTime());
	      break;
	    case 'price': // 按价格排序
	      result.sort((a: any, b: any) => b.reward - a.reward);
	      break;
	    case 'distance': // 按距离排序
	      result.sort((a: any, b: any) => (a.distance || Infinity) - (b.distance || Infinity));
	      break;
	    case 'smart': // 综合排序（默认）
	    default:
	      result.sort((a: any, b: any) => {
	        // 智能排序逻辑，可结合距离、浏览量、发布时间等
	        return (b.views || 0) - (a.views || 0) || (new Date(b.publishTime).getTime() - new Date(a.publishTime).getTime());
	      });
	  }
	  
	  return result;
	});

	// 搜索任务
	const searchTasks = computed(() => {
	  if (!searchQuery.value.trim()) return filteredAndSortedTasks.value;
	  
	  const query = searchQuery.value.toLowerCase();
	  return filteredAndSortedTasks.value.filter((task: any) => {
	    const title = getFormattedTitle(task).toLowerCase();
	    const tags = (task.tags || []).join('').toLowerCase();
	    const address = (task.pickupAddress || task.deliveryAddress || '').toLowerCase();
	    
	    return title.includes(query) || tags.includes(query) || address.includes(query);
	  });
	});

	const formatPublishTime = (time: string | Date) => {
		if (!time) return '';
		const date = new Date(time);
		const year = date.getFullYear();
		const month = String(date.getMonth() + 1).padStart(2, '0');
		const day = String(date.getDate()).padStart(2, '0');
		const hours = String(date.getHours()).padStart(2, '0');
		const minutes = String(date.getMinutes()).padStart(2, '0');
		return `${year}-${month}-${day} ${hours}:${minutes}`;
	};

	// 拉取云端任务数据
	const loadTasksFromCloud = async (page = 1, pageSize = 10, type = '', keyword = '') => {
  uni.showLoading({ title: '加载中...' });
  try {
    const res = await uniCloud.callFunction({
      name: 'getTaskList',
      data: { page, pageSize, type, keyword }
    });
    uni.hideLoading();
    
    // 新增：打印云函数返回数据
    console.log('[云函数返回数据]', res);
    
    if (res.result.code === 200) {
      if (page === 1) {
        filteredTasks.value = res.result.data || []; // 避免res.result.data为undefined
      } else {
        filteredTasks.value = [...filteredTasks.value, ...(res.result.data || [])];
      }
      hasMore.value = (filteredTasks.value.length || 0) < (res.result.total || 0);
      console.log('[任务数量]', filteredTasks.value.length);
    } else {
      uni.showToast({ 
        title: res.result.message || '获取任务失败', 
        icon: 'none' 
      });
      // 降级使用本地存储
      loadTasks();
    }
  } catch (e) {
    uni.hideLoading();
    uni.showToast({ title: '网络错误，请重试', icon: 'none' });
    console.error('[云函数调用失败]', e);
    // 降级使用本地存储
    loadTasks();
  }
};
</script>

<style>
	.container {
		min-height: 100vh;
		background-color: #F5F5F5;
		display: flex;
		flex-direction: column;
	}

	.header {
		background-color: #FFFFFF;
		padding: 20rpx 30rpx;
		display: flex;
		align-items: center;
		justify-content: space-between;
		position: sticky;
		top: 0;
		z-index: 100;
	}

	.category-filter {
		display: flex;
		align-items: center;
		gap: 8rpx;
	}

	.filter-text {
		font-size: 28rpx;
		color: #333333;
	}

	.search-box {
		flex: 1;
		margin: 0 20rpx;
		background-color: #F5F5F5;
		border-radius: 32rpx;
		padding: 12rpx 24rpx;
		display: flex;
		align-items: center;
		gap: 12rpx;
	}

	.search-input {
		flex: 1;
		font-size: 28rpx;
		color: #333333;
	}

	.voice-icon {
		padding: 8rpx;
	}

	.publish-btn {
		width: 64rpx;
		height: 64rpx;
		background-color: #3B7FF3;
		border-radius: 32rpx;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.content-area {
		flex: 1;
		height: calc(100vh - 180rpx);
	}

	.banner-section {
		padding: 20rpx 30rpx;
	}

	.banner-swiper {
		height: 300rpx;
		border-radius: 16rpx;
		overflow: hidden;
	}

	.banner-image {
		width: 100%;
		height: 100%;
	}

	.quick-publish {
		margin: 20rpx 30rpx;
		background-color: #FFFFFF;
		border-radius: 16rpx;
		padding: 20rpx;
		display: flex;
		align-items: center;
		justify-content: space-between;
	}

	.quick-publish-left {
		display: flex;
		align-items: center;
		gap: 12rpx;
	}

	.quick-publish-left text {
		font-size: 28rpx;
		color: #333333;
	}

	.quick-publish-btn {
		background-color: #3B7FF3;
		border-radius: 32rpx;
		padding: 12rpx 24rpx;
		display: flex;
		align-items: center;
		gap: 8rpx;
	}

	.quick-publish-btn text {
		font-size: 28rpx;
		color: #FFFFFF;
	}

	.task-flow {
		margin: 20rpx 30rpx;
		background-color: #FFFFFF;
		border-radius: 16rpx;
		padding: 20rpx;
	}

	.flow-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: 20rpx;
	}

	.flow-title {
		font-size: 32rpx;
		font-weight: bold;
		color: #333333;
	}

	.flow-filter {
		display: flex;
		align-items: center;
		gap: 8rpx;
	}

	.flow-filter text {
		font-size: 28rpx;
		color: #999999;
	}

	.flow-filter .sort-icon {
		margin-right: 8rpx;
	}

	.flow-filter .sort-text {
		margin-right: 8rpx;
	}

	.flow-filter .sort-description {
		font-size: 24rpx;
		color: #B0B0B0;
		margin-left: 10rpx;
	}

	.task-list {
		height: calc(100vh - 600rpx);
	}

	.task-card {
		background-color: #FFFFFF;
		border-radius: 16rpx;
		padding: 20rpx;
		margin-bottom: 20rpx;
		box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
	}

	.task-card.is-top {
		border: 2rpx solid #FF9500;
	}

	.task-card.is-urgent {
		border: 2rpx solid #FF3B30; /* 红色边框 */
		background-color: #FFF0F0; /* 浅红色背景 */
		box-shadow: 0 4rpx 16rpx rgba(255, 59, 48, 0.15); /* 更明显的阴影 */
	}

	.task-tags {
		display: flex;
		flex-wrap: wrap;
		gap: 12rpx;
		margin-bottom: 16rpx;
	}

	.tag {
		display: flex;
		align-items: center;
		gap: 4rpx;
		padding: 4rpx 12rpx;
		border-radius: 8rpx;
		font-size: 24rpx;
	}

	.tag-urgent {
		background-color: #FFE5E5;
		color: #FF3B30;
	}

	.tag-new {
		background-color: #E5FFE5;
		color: #4CD964;
	}

	.tag-hot {
		background-color: #FFF0E5;
		color: #FF9500;
	}

	.task-header {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		margin-bottom: 16rpx;
	}

	.user-info {
		display: flex;
		align-items: center;
		gap: 12rpx;
	}

	.avatar-wrapper {
		width: 64rpx;
		height: 64rpx;
		border-radius: 32rpx;
		overflow: hidden;
	}

	.avatar {
		width: 100%;
		height: 100%;
	}

	.sub-title {
		display: flex;
		flex-direction: column;
		gap: 4rpx;
	}

	.nickname {
		font-size: 28rpx;
		color: #333333;
		font-weight: bold;
	}

	.sub-title text:last-child {
		font-size: 24rpx;
		color: #999999;
	}

	.task-type-status {
		display: flex;
		flex-direction: column;
		align-items: flex-end;
		gap: 8rpx;
	}

	.task-type {
		display: flex;
		align-items: center;
		gap: 4rpx;
		padding: 4rpx 12rpx;
		border-radius: 8rpx;
		font-size: 24rpx;
		color: #FFFFFF;
	}

	.task-status {
		font-size: 24rpx;
		padding: 4rpx 12rpx;
		border-radius: 8rpx;
	}

	.task-status.pending {
		background-color: #E5F5FF;
		color: #00BFFF;
	}

	.task-status.processing {
		background-color: #E5FFE5;
		color: #4CD964;
	}

	.task-status.completed {
		background-color: #F5F5F5;
		color: #8E8E93;
	}

	.task-status.cancelled {
		background-color: #FFE5E5;
		color: #FF3B30;
	}

	.task-title {
		font-size: 32rpx;
		color: #333333;
		font-weight: bold;
		margin-bottom: 16rpx;
		text-align: left;
	}

	.task-info {
		display: flex;
		flex-direction: column;
		gap: 12rpx;
		margin-bottom: 16rpx;
	}

	.info-item {
		display: flex;
		align-items: center;
		gap: 8rpx;
	}

	.bullet {
		flex-shrink: 0;
	}

	.label {
		font-size: 28rpx;
		color: #666666;
	}

	.value {
		font-size: 28rpx;
		color: #333333;
	}

	.value.reward {
		color: #FF3B30;
		font-weight: bold;
	}

	.task-actions {
		display: flex;
		justify-content: flex-start;
		align-items: flex-end;
		margin-top: 24rpx;
		position: relative;
		min-height: 60rpx;
	}

	.action-left {
		display: flex;
		align-items: center;
		gap: 16rpx;
	}

	.distance, .views {
		display: flex;
		align-items: center;
		gap: 4rpx;
		font-size: 24rpx;
		color: #999999;
	}

	.action-btn {
		background-color: #0596ef;
		color: #FFFFFF;
		font-size: 28rpx;
		padding: 12rpx 24rpx;
		border-radius: 32rpx;
		border: none;
		position: absolute;
		right: 0;
		bottom: 0;
	}

	.loading-more, .no-more {
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 20rpx;
		gap: 8rpx;
	}

	.loading-more text, .no-more text {
		font-size: 28rpx;
		color: #999999;
	}

	.tab-bar {
		background-color: #FFFFFF;
		padding: 20rpx 30rpx;
		display: flex;
		justify-content: space-around;
		align-items: center;
		position: sticky;
		bottom: 0;
		z-index: 100;
	}

	.tab-item {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 8rpx;
	}

	.tab-item text {
		font-size: 24rpx;
		color: #999999;
	}

	.tab-item.active text {
		color: #3B7FF3;
	}

	.cursor-pointer {
		cursor: pointer;
	}

	.task-images {
		display: flex;
		flex-wrap: wrap;
		gap: 16rpx;
		margin-top: 20rpx;
		padding: 0 20rpx;
	}

	.task-image-thumbnail {
		width: 160rpx;
		height: 160rpx;
		border-radius: 8rpx;
		overflow: hidden;
		object-fit: cover;
		border: 1px solid #eee;
	}
</style>