<template>
	<view class="page-container">
		<!-- Tabs -->
		<view class="tabs-container">
			<view class="tabs">
				<view 
					v-for="(tab, index) in tabs" 
					:key="index" 
					class="tab-item" 
					:class="{ active: currentTabIndex === index }" 
					@click="switchTab(index)"
				>
					<text class="tab-text">{{ tab.text }}</text>
					<text class="tab-count">{{ tab.count }}</text>
				</view>
			</view>
		</view>

		<!-- Content Swiper -->
		<swiper class="swiper" :current="currentTabIndex" @change="swiperChange">
			<!-- 已领任务 -->
			<swiper-item class="swiper-item">
				<scroll-view scroll-y class="scroll-view">
					<template v-if="!isLoading">
						<view v-if="receivedTasks.length > 0">
							<TaskCard v-for="task in receivedTasks" :key="task._id" :task="task" @click="goToTaskDetail(task._id)" />
						</view>
						<view v-else class="empty-state">
							<uni-icons type="folder-opened" size="60" color="#C8C9CC"></uni-icons>
							<text class="empty-text">您还没有领取任何任务</text>
						</view>
					</template>
					<template v-else>
						<TaskCardSkeleton v-for="i in 4" :key="i" />
					</template>
				</scroll-view>
			</swiper-item>

			<!-- 发布任务 -->
			<swiper-item class="swiper-item">
				<scroll-view scroll-y class="scroll-view">
					<template v-if="!isLoading">
						<view v-if="publishedTasks.length > 0">
							<TaskCard v-for="task in publishedTasks" :key="task._id" :task="task" @click="goToTaskDetail(task._id)" />
						</view>
						<view v-else class="empty-state">
							<uni-icons type="paperplane" size="60" color="#C8C9CC"></uni-icons>
							<text class="empty-text">您还没有发布任何任务</text>
						</view>
					</template>
					<template v-else>
						<TaskCardSkeleton v-for="i in 4" :key="i" />
					</template>
				</scroll-view>
			</swiper-item>

			<!-- 任务记录 -->
			<swiper-item class="swiper-item">
				<scroll-view scroll-y class="scroll-view">
					<template v-if="!isLoading">
						<view v-if="historyTasks.length > 0">
							<TaskCard v-for="task in historyTasks" :key="task._id" :task="task" @click="goToTaskDetail(task._id)" />
						</view>
						<view v-else class="empty-state">
							<uni-icons type="calendar" size="60" color="#C8C9CC"></uni-icons>
							<text class="empty-text">暂无历史任务记录</text>
						</view>
					</template>
					<template v-else>
						<TaskCardSkeleton v-for="i in 4" :key="i" />
					</template>
				</scroll-view>
			</swiper-item>
		</swiper>
	</view>
</template>

<script>
	// 单文件组件内的本地组件
	const TaskCard = {
		props: ['task'],
		template: `
			<view class="task-card" @click="$emit('click')">
				<view class="task-card-header">
					<text class="task-title">{{ task.title }}</text>
					<view class="task-status" :class="statusClass">{{ statusText }}</view>
				</view>
				<view class="task-desc">{{ task.description || '暂无描述' }}</view>
				<view class="task-footer">
					<view class="task-reward">
						<uni-icons type="wallet" color="#f9ae3d" size="16"></uni-icons>
						<text>{{ task.reward || 0 }} 元</text>
					</view>
					<view class="task-time">
						<uni-icons type="calendar" color="#909399" size="16"></uni-icons>
						<text>{{ formatTime(task.create_time) }}</text>
					</view>
				</view>
			</view>
		`,
		computed: {
			statusText() {
				const map = { 'pending': '待接单', 'in_progress': '进行中', 'completed': '已完成', 'cancelled': '已取消' };
				return map[this.task.status] || '未知';
			},
			statusClass() {
				return `status-${this.task.status}`;
			}
		},
		methods: {
			formatTime(timestamp) {
				if (!timestamp) return '未知时间';
				const date = new Date(timestamp);
				const month = String(date.getMonth() + 1).padStart(2, '0');
				const day = String(date.getDate()).padStart(2, '0');
				return `${month}-${day}`;
			}
		}
	};

	const TaskCardSkeleton = {
		template: `
			<view class="task-card skeleton">
				<view class="skeleton-line" style="width: 50%; height: 32rpx; margin-bottom: 24rpx;"></view>
				<view class="skeleton-line" style="width: 100%; height: 28rpx; margin-bottom: 20rpx;"></view>
				<view class="skeleton-line" style="width: 70%; height: 24rpx;"></view>
			</view>
		`
	};

	export default {
		components: { TaskCard, TaskCardSkeleton },
		data() {
			return {
				currentTabIndex: 0,
				tabs: [
					{ text: '已领任务', type: 'received', count: 0 },
					{ text: '发布任务', type: 'published', count: 0 },
					{ text: '任务记录', type: 'history', count: 0 }
				],
				receivedTasks: [],
				publishedTasks: [],
				historyTasks: [],
				isLoading: true,
				userInfo: null
			};
		},
		onLoad(options) {
			const typeMap = { 'received': 0, 'published': 1, 'history': 2 };
			if (options.type && typeMap[options.type] !== undefined) {
				this.currentTabIndex = typeMap[options.type];
			}
			this.loadAllData();
		},
		methods: {
			switchTab(index) {
				if (this.currentTabIndex !== index) {
					this.currentTabIndex = index;
				}
			},
			swiperChange(e) {
				this.currentTabIndex = e.detail.current;
			},
			async loadAllData() {
				this.isLoading = true;
				this.userInfo = uni.getStorageSync('uni-id-pages-userInfo');
				if (!this.userInfo || !this.userInfo._id) {
					uni.showToast({ title: '请先登录', icon: 'none' });
					setTimeout(() => uni.navigateBack(), 1500);
					this.isLoading = false;
					return;
				}
				
				try {
					await Promise.all([
						this.fetchReceivedTasks(),
						this.fetchPublishedTasks(),
						this.fetchHistoryTasks()
					]);
				} catch (error) {
					console.error("加载任务数据失败: ", error);
					uni.showToast({ title: "数据加载失败", icon: 'none' });
				} finally {
					this.isLoading = false;
				}
			},
			async fetchReceivedTasks() {
				const db = uniCloud.database();
				const where = { receiver_id: this.userInfo._id };
				const { result: { total } } = await db.collection('uni-tasks').where(where).count();
				this.$set(this.tabs[0], 'count', total);
				const { result: { data } } = await db.collection('uni-tasks').where(where).orderBy('create_time', 'desc').get();
				this.receivedTasks = data;
			},
			async fetchPublishedTasks() {
				const db = uniCloud.database();
				const where = { user_id: this.userInfo._id };
				const { result: { total } } = await db.collection('uni-tasks').where(where).count();
				this.$set(this.tabs[1], 'count', total);
				const { result: { data } } = await db.collection('uni-tasks').where(where).orderBy('create_time', 'desc').get();
				this.publishedTasks = data;
			},
			async fetchHistoryTasks() {
				const db = uniCloud.database();
				const where = db.command.or([
					{ user_id: this.userInfo._id },
					{ receiver_id: this.userInfo._id }
				]).and({
					status: db.command.in(['completed', 'cancelled'])
				});
				const { result: { total } } = await db.collection('uni-tasks').where(where).count();
				this.$set(this.tabs[2], 'count', total);
				const { result: { data } } = await db.collection('uni-tasks').where(where).orderBy('create_time', 'desc').get();
				this.historyTasks = data;
			},
			goToTaskDetail(taskId) {
				uni.navigateTo({
					url: `/pages/task/TaskDetail/TaskDetail?id=${taskId}`
				});
			}
		}
	};
</script>

<style>
	page {
		background-color: #F5F6FA;
		height: 100%;
	}
	
	.page-container {
		display: flex;
		flex-direction: column;
		height: 100%;
	}
	
	.tabs-container {
		background-color: #FFFFFF;
		padding: 0 20rpx;
		border-bottom: 1rpx solid #EBEEF5;
	}

	.tabs {
		display: flex;
		justify-content: space-around;
	}

	.tab-item {
		flex: 1;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		height: 110rpx;
		font-size: 15px;
		color: #606266;
		position: relative;
		transition: color 0.3s;
	}

	.tab-text {
		font-size: 15px;
		font-weight: 500;
	}

	.tab-count {
		font-size: 13px;
		margin-top: 6rpx;
		font-weight: 600;
		color: #909399;
	}

	.tab-item.active .tab-text {
		color: #409EFF;
		font-weight: 600;
	}
	
	.tab-item.active .tab-count {
		color: #409EFF;
	}

	.tab-item.active::after {
		content: '';
		position: absolute;
		bottom: 10rpx;
		left: 50%;
		transform: translateX(-50%);
		width: 50rpx;
		height: 6rpx;
		background-color: #409EFF;
		border-radius: 3rpx;
	}

	.swiper {
		flex: 1;
	}

	.swiper-item,
	.scroll-view {
		height: 100%;
	}

	.task-card {
		background: #fff;
		border-radius: 16rpx;
		margin: 24rpx;
		padding: 24rpx;
		box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);
	}

	.task-card.skeleton {
		animation: skeleton-blink 1.5s infinite ease-in-out;
	}

	@keyframes skeleton-blink {
		0% { opacity: 1; } 50% { opacity: 0.7; } 100% { opacity: 1; }
	}

	.skeleton-line {
		background-color: #f0f2f5;
		border-radius: 8rpx;
	}
	
	.task-card-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 16rpx;
	}
	
	.task-title {
		font-size: 16px;
		font-weight: 600;
		color: #303133;
	}
	
	.task-status {
		font-size: 12px;
		padding: 6rpx 14rpx;
		border-radius: 100rpx;
	}
	
	.status-pending { color: #409EFF; background-color: #ecf5ff; }
	.status-in_progress { color: #67c23a; background-color: #f0f9eb; }
	.status-completed { color: #909399; background-color: #f4f4f5; }
	.status-cancelled { color: #f56c6c; background-color: #fef0f0; }
	
	.task-desc {
		font-size: 14px;
		color: #606266;
		margin-bottom: 24rpx;
		line-height: 1.5;
	}
	
	.task-footer {
		display: flex;
		justify-content: space-between;
		align-items: center;
		font-size: 13px;
		color: #909399;
	}

	.task-reward, .task-time {
		display: flex;
		align-items: center;
	}

	.task-reward text, .task-time text {
		margin-left: 8rpx;
	}

	.task-reward text {
		color: #f9ae3d;
		font-weight: 500;
	}
	
	.empty-state {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		height: 100%;
		color: #909399;
		padding-top: 200rpx;
		box-sizing: border-box;
	}
	
	.empty-text {
		margin-top: 20rpx;
		font-size: 14px;
	}
</style>
