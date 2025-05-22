<template>
	<view class="activities-container">
		<!-- 日期选择器 -->
		<scroll-view class="date-scroll" scroll-x="true" show-scrollbar="false">
			<view class="date-list">
				<view 
					v-for="(date, index) in dates" 
					:key="index" 
					class="date-item date-ani"
					:class="{ active: activeDate === index }" 
					@tap="switchDate(index)"
				>
					<text class="day">{{ date.day }}</text>
					<text class="weekday">{{ date.weekday }}</text>
					<view class="dot" v-if="date.hasEvents"></view>
				</view>
			</view>
		</scroll-view>
		
		<!-- 筛选标签 -->
		<view class="filter-wrapper">
			<scroll-view class="filter-scroll" scroll-x="true" show-scrollbar="false">
				<view class="filter-list">
					<view 
						v-for="(filter, index) in filters" 
						:key="index" 
						class="filter-item filter-ani"
						:class="{ active: activeFilter === index }" 
						@tap="switchFilter(index)"
					>
						<text>{{ filter.name }}</text>
					</view>
				</view>
			</scroll-view>
		</view>
		
		<!-- 活动列表 -->
		<scroll-view 
			class="content-scroll" 
			scroll-y="true" 
			refresher-enabled="true"
			:refresher-triggered="refreshing"
			@refresherrefresh="onRefresh"
			@scrolltolower="onLoadMore"
		>
			<view class="activity-fullview">
				<view class="activity-item card-ani" v-for="(item, index) in activities" :key="index">
					<view class="activity-date-block">
						<text class="month">{{ formatMonth(item.date) }}</text>
						<text class="day">{{ formatDay(item.date) }}</text>
					</view>
					<view class="activity-content">
						<image class="activity-image" :src="item.image" mode="aspectFill"></image>
						<view class="activity-info">
							<text class="activity-title">{{ item.title }}</text>
							<view class="activity-meta">
								<text class="iconfont icon-shijian"></text>
								<text class="time-text">{{ item.time }}</text>
								<text class="iconfont icon-location ml-lg"></text>
								<text class="location-text">{{ item.location }}</text>
							</view>
							<view class="activity-meta">
								<text class="iconfont icon-huodong"></text>
								<text class="participant-text">{{ item.participants }}人参与</text>
							</view>
							<view class="activity-tags">
								<text class="tag" :class="item.tagClass">{{ item.tag }}</text>
								<text class="status-tag" :class="getStatusClass(item)">{{ getStatusText(item) }}</text>
							</view>
						</view>
						<view class="action-btn-group">
							<button class="action-btn secondary clickable-mp" @tap.stop="viewDetail(item)">查看详情</button>
							<button class="action-btn primary clickable-mp" v-if="canJoin(item)" @tap.stop="joinActivity(item)">立即参与</button>
						</view>
					</view>
				</view>
				
				<!-- 加载和空状态 -->
				<view class="loading loading-ani" v-if="loading">
					<text class="iconfont icon-loading loading-icon"></text>
					<text class="text-sm text-gray">加载中...</text>
				</view>
				<view class="empty-state empty-ani" v-if="activities.length === 0 && !loading">
					<text class="iconfont icon-empty empty-icon"></text>
					<text class="empty-text">暂无活动</text>
					<button class="btn btn-outline mt-base clickable-mp" @tap="onRefresh">
						<text class="iconfont icon-shijian mr-xs"></text>刷新试试
					</button>
				</view>
				<view class="end-text" v-if="noMore && activities.length > 0 && !loading">
					<text class="text-sm text-gray">没有更多活动了</text>
				</view>
			</view>
		</scroll-view>
	</view>
</template>

<script>
export default {
	data() {
		return {
			refreshing: false,
			loading: false,
			noMore: false,
			activeDate: 0,
			activeFilter: 0,
			page: 1,
			dates: this.generateDates(),
			filters: [
				{ name: '全部' },
				{ name: '官方' },
				{ name: '社团' },
				{ name: '学术' },
				{ name: '娱乐' },
				{ name: '体育' },
			],
			activities: [],
			dateAniShow: false,
			filterAniShow: false,
			cardAniShow: false
		};
	},
	onLoad(options) {
		// 接收传递的参数
		if (options.filter) {
			const index = this.filters.findIndex(f => f.name === options.filter);
			if (index !== -1) {
				this.activeFilter = index;
			}
		}
		// 页面加载时初始化数据
		this.fetchActivities();
	},
	mounted() {
		setTimeout(() => { this.dateAniShow = true; this.filterAniShow = true; this.cardAniShow = true; }, 100);
	},
	methods: {
		// 生成日期数据
		generateDates() {
			const dates = [];
			const weekdays = ['日', '一', '二', '三', '四', '五', '六'];
			const now = new Date();
			
			for (let i = 0; i < 14; i++) {
				const date = new Date();
				date.setDate(now.getDate() + i);
				
				dates.push({
					day: date.getDate(),
					weekday: weekdays[date.getDay()],
					date: date,
					hasEvents: Math.random() > 0.5, // 模拟是否有活动
				});
			}
			
			return dates;
		},
		
		// 切换日期
		switchDate(index) {
			if (this.activeDate === index) return;
			
			this.activeDate = index;
			this.onRefresh();
		},
		
		// 切换筛选条件
		switchFilter(index) {
			if (this.activeFilter === index) return;
			
			this.activeFilter = index;
			this.onRefresh();
		},
		
		// 下拉刷新
		onRefresh() {
			if (this.refreshing) return;
			
			this.refreshing = true;
			this.page = 1;
			this.noMore = false;
			this.fetchActivities();
		},
		
		// 上拉加载更多
		onLoadMore() {
			if (this.loading || this.noMore) return;
			
			this.page++;
			this.fetchActivities(true);
		},
		
		// 获取活动数据
		fetchActivities(isLoadMore = false) {
			// 实际项目中应该是网络请求获取数据
			if (isLoadMore) {
				this.loading = true;
			}
			
			// 模拟网络请求延迟
			setTimeout(() => {
				if (!isLoadMore) {
					// 刷新数据 - 模拟数据
					this.activities = this.generateMockActivities();
				} else {
					// 加载更多
					if (this.page >= 3) {
						this.noMore = true;
					} else {
						// 模拟添加更多数据
						this.activities = [...this.activities, ...this.generateMockActivities(this.page)];
					}
				}
				
				// 重置加载状态
				this.refreshing = false;
				this.loading = false;
			}, 800);
		},
		
		// 生成模拟活动数据
		generateMockActivities(page = 1) {
			const mockActivities = [];
			const tags = ['官方', '社团', '学术', '娱乐', '体育'];
			const tagClasses = ['official', 'club', 'academic', 'entertainment', 'sports'];
			const locations = ['学校体育馆', '图书馆', '学生活动中心', '教学楼A区', '校园广场'];
			const statuses = ['upcoming', 'ongoing', 'ended'];
			
			// 根据当前选中的日期生成对应的日期
			const selectedDate = new Date(this.dates[this.activeDate].date);
			
			for (let i = 0; i < 5; i++) {
				const date = new Date(selectedDate);
				// 随机增加几个小时，以便在同一天有不同时间的活动
				date.setHours(date.getHours() + Math.floor(Math.random() * 8));
				
				const tagIndex = Math.floor(Math.random() * tags.length);
				// 如果有筛选，则按筛选条件生成
				const filterName = this.filters[this.activeFilter].name;
				const useTagIndex = filterName === '全部' ? tagIndex : tags.indexOf(filterName);
				
				mockActivities.push({
					id: (page - 1) * 5 + i + 1,
					title: `${tags[useTagIndex === -1 ? tagIndex : useTagIndex]}活动${(page - 1) * 5 + i + 1}`,
					image: `/static/images/activity${(i % 2) + 1}.png`,
					date: date,
					time: `${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`,
					location: locations[Math.floor(Math.random() * locations.length)],
					participants: Math.floor(Math.random() * 200) + 10,
					tag: tags[useTagIndex === -1 ? tagIndex : useTagIndex],
					tagClass: tagClasses[useTagIndex === -1 ? tagIndex : useTagIndex],
					status: statuses[Math.floor(Math.random() * statuses.length)]
				});
			}
			
			return mockActivities;
		},
		
		// 格式化月份
		formatMonth(date) {
			const months = ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'];
			return months[date.getMonth()];
		},
		
		// 格式化日期
		formatDay(date) {
			return date.getDate().toString().padStart(2, '0');
		},
		
		// 获取状态类名
		getStatusClass(item) {
			return item.status;
		},
		
		// 获取状态文本
		getStatusText(item) {
			const statusMap = {
				'upcoming': '即将开始',
				'ongoing': '进行中',
				'ended': '已结束'
			};
			return statusMap[item.status] || '未知状态';
		},
		
		// 是否可以参与
		canJoin(item) {
			return item.status === 'upcoming' || item.status === 'ongoing';
		},
		
		// 查看活动详情
		viewDetail(item) {
			console.log('查看活动详情:', item);
			uni.navigateTo({
				url: '/pages/circle/activity-datail/activity-datail?id=' + item.id
			});
		},
		
		// 参与活动
		joinActivity(item) {
			console.log('参与活动:', item);
			uni.showToast({
				title: '已报名参与：' + item.title,
				icon: 'success'
			});
		}
	}
};
</script>

<style lang="scss">
@import '@/styles/variables.scss';
@import '@/styles/common.scss';
@import '@/styles/platform-mp.scss';

.activities-container {
	display: flex;
	flex-direction: column;
	min-height: 100vh;
	background-color: #F8F9FC;
}

/* 日期选择器 */
.date-scroll {
	background-color: $white;
	padding: $spacing-sm 0;
	white-space: nowrap;
	width: 100%;
	-webkit-overflow-scrolling: touch;
	overflow-x: auto;
	box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.02);
}

.date-list {
	display: inline-flex;
	padding: 0 $spacing-base;
	align-items: center;
	height: 120rpx; /* 固定高度 */
}

.date-item {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	width: 80rpx;
	height: 100rpx;
	margin-right: $spacing-lg;
	border-radius: $border-radius-lg;
	transition: all $transition-fast, transform 0.2s;
	position: relative;
	background: #fff;
	box-shadow: 0 2rpx 8rpx rgba($primary-color, 0.06);
	&:active {
		transform: scale(1.08);
		box-shadow: 0 4rpx 16rpx rgba($primary-color, 0.12);
	}
	&.active {
		background-color: $primary-color;
		transform: scale(1.05);
		box-shadow: 0 2rpx 8rpx rgba($primary-color, 0.25);
		.day, .weekday { color: $white; }
		.dot { background-color: $white; }
	}
	.day {
		font-size: $font-size-lg;
		font-weight: bold;
		color: $dark-gray;
		margin-bottom: 4rpx;
	}
	.weekday {
		font-size: $font-size-sm;
		color: $gray;
	}
	.dot {
		position: absolute;
		bottom: -2rpx;
		width: 10rpx;
		height: 10rpx;
		border-radius: 50%;
		background-color: $primary-color;
	}
}

.date-ani {
	opacity: 0;
	transform: translateY(-30rpx);
	animation: fadeInUp 0.7s 0.1s forwards;
}

/* 筛选区域 */
.filter-wrapper {
	background-color: $white;
	padding: 0 0 $spacing-sm;
	display: flex;
	justify-content: center;
	align-items: center;
	border-bottom: 1rpx solid rgba(0, 0, 0, 0.02);
}

.filter-scroll {
	width: 100%;
	white-space: nowrap;
	-webkit-overflow-scrolling: touch;
	overflow-x: auto;
}

.filter-list {
	display: inline-flex;
	padding: 0 $spacing-base;
	align-items: center;
	height: 80rpx;
}

.filter-item {
	padding: $spacing-xs $spacing-lg;
	margin-right: $spacing-sm;
	border-radius: $border-radius-lg;
	font-size: $font-size-sm;
	color: $dark-gray;
	background-color: rgba(0, 0, 0, 0.03);
	transition: all $transition-fast, transform 0.2s;
	&:active {
		transform: scale(1.08);
		box-shadow: 0 2rpx 8rpx rgba($primary-color, 0.10);
	}
	&.active {
		background-color: $primary-color;
		color: $white;
		box-shadow: 0 2rpx 8rpx rgba($primary-color, 0.25);
	}
}

.filter-ani {
	opacity: 0;
	transform: translateY(-20rpx);
	animation: fadeInUp 0.7s 0.2s forwards;
}

@keyframes fadeInUp {
	to {
		opacity: 1;
		transform: translateY(0);
	}
}

/* 内容区域 */
.content-scroll {
	flex: 1;
	height: calc(100vh - 300rpx); /* 调整高度以适应顶部区域 */
}

.activity-fullview {
	padding: $spacing-base;
}

.activity-item {
	display: flex;
	margin-bottom: 30rpx;
	background: $white;
	border-radius: 20rpx;
	box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.08);
	overflow: hidden;
	border: 1rpx solid rgba(0, 0, 0, 0.02);
	position: relative;
	padding: 0;
	height: auto;
	transition: transform 0.2s, box-shadow 0.2s;
	&:active {
		transform: scale(1.03);
		box-shadow: 0 8rpx 32rpx rgba($primary-color, 0.12);
	}
	.activity-date-block {
		width: 100rpx;
		padding: 24rpx 0;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		background: #f6f8fa;
		border-radius: 20rpx 0 0 20rpx;
		box-shadow: 0 2rpx 8rpx rgba(0,0,0,0.03);
		border-right: 1rpx solid #f0f0f0;
		.month {
			font-size: 24rpx;
			color: $gray;
		}
		.day {
			font-size: 40rpx;
			font-weight: bold;
			color: $primary-color;
			margin-top: 8rpx;
		}
	}
	.activity-content {
		flex: 1;
		padding: 20rpx;
		display: flex;
		flex-direction: column;
	}
	.activity-image {
		height: 180rpx;
		border-radius: 12rpx;
		margin-bottom: 16rpx;
		background-color: $bg-color;
		box-shadow: 0 2rpx 6rpx rgba(0, 0, 0, 0.05);
		transition: box-shadow 0.2s;
	}
	.activity-info {
		margin-bottom: 16rpx;
	}
	.activity-title {
		font-size: 36rpx;
		font-weight: bold;
		color: $primary-color;
		margin-bottom: 12rpx;
		line-height: 1.3;
		letter-spacing: 2rpx;
	}
	.activity-meta {
		display: flex;
		align-items: center;
		font-size: 24rpx;
		color: #666;
		margin-bottom: 10rpx;
		.iconfont {
			margin-right: 6rpx;
			font-size: 24rpx;
		}
	}
	.activity-tags {
		display: flex;
		margin-top: 12rpx;
		flex-wrap: wrap;
		.tag {
			padding: 4rpx 16rpx;
			border-radius: 20rpx;
			font-size: 20rpx;
			margin-right: 12rpx;
			margin-bottom: 10rpx;
			font-weight: 500;
			&.official {
				background-color: rgba($primary-color, 0.1);
				color: $primary-color;
			}
			&.club {
				background-color: rgba(#5B2EE6, 0.1);
				color: #5B2EE6;
			}
			&.academic {
				background-color: rgba(#06A788, 0.1);
				color: #06A788;
			}
			&.entertainment {
				background-color: rgba($warning-color, 0.1);
				color: $warning-color;
			}
			&.sports {
				background-color: rgba(#FF3366, 0.1);
				color: #FF3366;
			}
		}
		.status-tag {
			border-radius: 20rpx;
			padding: 4rpx 16rpx;
			font-size: 20rpx;
			margin-right: 12rpx;
			margin-bottom: 10rpx;
			font-weight: 500;
			&.upcoming {
				background: rgba($primary-color, 0.1);
				color: $primary-color;
			}
			&.ongoing {
				background: rgba($success-color, 0.1);
				color: $success-color;
			}
			&.ended {
				background: rgba($gray, 0.1);
				color: $gray;
			}
		}
	}
	.action-btn-group {
		display: flex;
		justify-content: flex-end;
		margin-top: 12rpx;
		padding-top: 12rpx;
		.action-btn {
			padding: 8rpx 24rpx;
			font-size: 24rpx;
			border-radius: 24rpx;
			margin-left: 12rpx;
			background: linear-gradient(90deg, $primary-color, lighten($primary-color, 10%));
			color: #fff;
			border: none;
			transition: all 0.2s;
			line-height: 1.5;
			height: auto;
			min-height: 0;
			font-weight: 500;
			&:after { display: none; }
			&:active {
				transform: scale(0.96);
				box-shadow: 0 2rpx 8rpx rgba($primary-color, 0.18);
			}
		}
		.secondary {
			background: #fff;
			color: #2d5af1;
			border: 3rpx solid #2d5af1;
			box-shadow: none;
			font-weight: 500;
			transition: background 0.2s, color 0.2s, border 0.2s;
		}
		.secondary:active {
			background: #f5f7fa;
			color: #1741a7;
			border-color: #1741a7;
		}
		.primary {
			background: linear-gradient(90deg, #2d5af1, lighten(#2d5af1, 10%));
			color: #fff;
			border: none;
			box-shadow: 0 2rpx 6rpx rgba(#2d5af1, 0.18);
			font-weight: 500;
		}
		.primary:active {
			background: linear-gradient(90deg, #1741a7, #2d5af1);
			box-shadow: 0 1rpx 4rpx rgba(#2d5af1, 0.10);
		}
	}
}

.card-ani {
	opacity: 0;
	transform: translateY(40rpx);
	animation: cardFadeIn 0.7s 0.3s forwards;
}
@keyframes cardFadeIn {
	to {
		opacity: 1;
		transform: translateY(0);
	}
}

/* 加载和空状态 */
.loading-ani {
	opacity: 0;
	animation: fadeInUp 0.7s 0.4s forwards;
}
.empty-ani {
	opacity: 0;
	animation: fadeInUp 0.7s 0.5s forwards;
}

@keyframes rotate {
	from {
		transform: rotate(0deg);
	}
	to {
		transform: rotate(360deg);
	}
}


</style> 