<template>
	<view class="user-task-page">
		<view class="tab-bar">
			<view
				v-for="tab in tabs"
				:key="tab.type"
				:class="['tab-item', {active: currentType === tab.type}]"
				@click="switchTab(tab.type)"
			>
				{{ tab.text }}
			</view>
		</view>
		<view class="task-list">
			<view v-for="task in taskList" :key="task.id" class="task-card">
				<view class="task-card-header">
					<uni-icons :type="task.icon" size="20" color="#4080FF" />
					<text class="task-title">{{ task.title }}</text>
				</view>
				<view class="task-desc">{{ task.desc }}</view>
				<view class="task-meta">
					<text>时间：{{ task.time }}</text>
					<text v-if="task.status">状态：{{ task.status }}</text>
				</view>
			</view>
			<view v-if="taskList.length === 0" class="empty-tip">暂无任务</view>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				tabs: [
					{ text: '已领任务', type: 'received' },
					{ text: '发布任务', type: 'published' },
					{ text: '任务记录', type: 'history' }
				],
				currentType: 'received',
				taskList: []
			};
		},
		computed: {},
		onLoad(options) {
			if (options.type) {
				this.currentType = options.type
			}
			this.loadTasks()
		},
		methods: {
			switchTab(type) {
				this.currentType = type
				this.loadTasks()
			},
			loadTasks() {
				// 这里用 mock 数据，实际可请求后端
				if (this.currentType === 'received') {
					this.taskList = [
						{ id: 1, icon: 'folder', title: '跑腿帮买早餐', desc: '帮忙买一份豆浆油条', time: '2024-06-01 08:00', status: '进行中' },
						{ id: 2, icon: 'folder', title: '快递代取', desc: '取快递到宿舍楼下', time: '2024-05-30 15:00', status: '已完成' }
					]
				} else if (this.currentType === 'published') {
					this.taskList = [
						{ id: 3, icon: 'staff', title: '图书馆占座', desc: '帮忙占个座位', time: '2024-05-28 09:00', status: '已完成' }
					]
				} else if (this.currentType === 'history') {
					this.taskList = [
						{ id: 4, icon: 'calendar', title: '校园跑腿', desc: '帮忙送文件', time: '2024-05-20 10:00', status: '已完成' }
					]
				} else {
					this.taskList = []
				}
			}
		}
	}
</script>

<style lang="scss">
	.user-task-page {
		background: #f5f6fa;
		min-height: 100vh;
		padding-bottom: 40rpx;
	}
	.tab-bar {
		display: flex;
		background: #fff;
		border-radius: 16rpx;
		margin: 32rpx 24rpx 0 24rpx;
		box-shadow: 0 2px 8px rgba(0,0,0,0.04);
		overflow: hidden;
	}
	.tab-item {
		flex: 1;
		text-align: center;
		padding: 28rpx 0;
		font-size: 17px;
		color: #888;
		cursor: pointer;
		transition: color 0.2s;
		letter-spacing: 1px;
	}
	.tab-item.active {
		color: #4080FF;
		font-weight: 700;
		background: linear-gradient(to right, #eaf2ff, #f5faff);
		box-shadow: 0 2px 8px rgba(64,128,255,0.06);
	}
	.task-list {
		margin: 36rpx 24rpx 0 24rpx;
	}
	.task-card {
		background: #fff;
		border-radius: 18rpx;
		box-shadow: 0 4px 16px rgba(64,128,255,0.10);
		padding: 28rpx 24rpx 22rpx 24rpx;
		margin-bottom: 28rpx;
		transition: box-shadow 0.2s;
	}
	.task-card-header {
		display: flex;
		align-items: center;
		margin-bottom: 10rpx;
	}
	.task-title {
		font-size: 17px;
		font-weight: 700;
		color: #222;
		margin-left: 12rpx;
	}
	.task-desc {
		font-size: 15px;
		color: #666;
		margin-bottom: 10rpx;
	}
	.task-meta {
		font-size: 13px;
		color: #999;
		display: flex;
		justify-content: space-between;
	}
	.empty-tip {
		text-align: center;
		color: #bbb;
		margin-top: 80rpx;
		font-size: 17px;
		letter-spacing: 1px;
	}
</style>
