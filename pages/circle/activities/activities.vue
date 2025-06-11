<template>
	<view class="activities-container">
		<!-- 日期选择器 -->
		<scroll-view class="date-scroll" scroll-x="true" show-scrollbar="false">
			<view class="date-list">
				<view v-for="(date, index) in dates" :key="index" class="date-item date-ani"
					:class="{ active: activeDate === index }" @tap="switchDate(index)">
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
					<view v-for="(filter, index) in filters" :key="index" class="filter-item filter-ani"
						:class="{ active: activeFilter === index }" @tap="switchFilter(index)">
						<text>{{ filter.name }}</text>
					</view>
				</view>
			</scroll-view>
		</view>

		<!-- 活动列表 -->
		<scroll-view class="content-scroll" scroll-y="true" refresher-enabled="true" :refresher-triggered="refreshing"
			@refresherrefresh="onRefresh" @scrolltolower="onLoadMore">
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
							<button 
								class="action-btn primary clickable-mp" 
								:class="{ 'disabled': item.hasJoined }"
								v-if="canJoin(item)"
								@tap.stop="joinActivity(item)"
							>{{ item.hasJoined ? '已参与' : '立即参与' }}</button>
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
			console.log('data初始化');
			return {
				refreshing: false,
				loading: false,
				noMore: false,
				activeDate: 0,
				activeFilter: 0,
				page: 1,
				dates: this.generateDates(),
				// 新增：存储当前选中的日期对象（精确到天）
				selectedDate: null,
				filters: [{
						name: '全部'
					},
					{
						name: '官方'
					},
					{
						name: '社团'
					},
					{
						name: '学术'
					},
					{
						name: '娱乐'
					},
					{
						name: '体育'
					},
				],
				activities: [],
				dateAniShow: false,
				filterAniShow: false,
				cardAniShow: false
			};
		},
		onLoad(options) {
			console.log('onLoad执行', options);
			// 初始化选中日期为第一个日期
			this.selectedDate = this.dates[0].date;
			// 页面加载时初始化数据
			this.fetchActivities();
		},
		mounted() {
			console.log('mounted执行');
			setTimeout(() => {
				this.dateAniShow = true;
				this.filterAniShow = true;
				this.cardAniShow = true;
			}, 100);
		},
		onShow() {
			this.onRefresh();
		},
		methods: {
			// 生成日期数据
			generateDates() {
				console.log('generateDates执行');
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
				console.log('switchDate执行', index);
				if (this.activeDate === index) return;

				this.activeDate = index;
				// 更新选中日期为当前点击的日期对象
				this.selectedDate = this.dates[index].date;
				this.onRefresh();
			},

			// 切换筛选条件
			switchFilter(index) {
				console.log('switchFilter执行', index);
				if (this.activeFilter === index) return;

				this.activeFilter = index;
				this.onRefresh();
			},

			// 下拉刷新
			onRefresh() {
				console.log('onRefresh执行');
				if (this.refreshing) return;

				this.refreshing = true;
				this.page = 1;
				this.noMore = false;
				this.fetchActivities();
			},

			// 上拉加载更多
			onLoadMore() {
				console.log('onLoadMore执行');
				if (this.loading || this.noMore) return;

				this.page++;
				this.fetchActivities(true);
			},

			// 获取活动数据
			async fetchActivities(isLoadMore = false) {
				console.log('fetchActivities开始执行', {
					isLoadMore,
					page: this.page
				});
				if (isLoadMore) this.loading = true;
				try {
					// 获取当前用户ID
					const userId = uni.getStorageSync('uni-id-pages-userInfo')._id;
					
					// 构建查询条件
					const where = {
						content_type: 'activity'
					};

					// 日期过滤
					const startOfDay = new Date(this.selectedDate);
					startOfDay.setHours(0, 0, 0, 0);
					const endOfDay = new Date(this.selectedDate);
					endOfDay.setHours(23, 59, 59, 999);

					where.activity_time = {
						$gte: startOfDay.getTime(),
						$lte: endOfDay.getTime()
					};

					// 处理分类筛选
					if (this.activeFilter !== 0) {
						where.category = this.filters[this.activeFilter].name;
					}

					// 云数据库查询
					const res = await uniCloud.database()
						.collection('add-content')
						.where(where)
						.orderBy('activity_time', 'desc')
						.skip((this.page - 1) * 5)
						.limit(5)
						.get();

					// 获取用户参与状态
					let userJoins = new Set();
					if (userId) {
						const joinsRes = await uniCloud.database().collection('activity_participants')
							.where({
								user_id: userId,
								activity_id: uniCloud.database().command.in(res.result.data.map(a => a._id))
							})
							.get();
						userJoins = new Set(joinsRes.result.data.map(j => j.activity_id));
					}

					// 处理返回数据
					const rawActivities = res.result.data || [];
					const formattedActivities = rawActivities.map(item => ({
						id: item._id,
						title: item.title,
						image: item.files?.[0] || '/static/images/activity-default.png',
						date: new Date(item.activity_time),
						time: this.formatTime(item.activity_time),
						location: item.location,
						participants: item.attendee_count || 0,
						tag: item.category,
						tagClass: this.getTagClass(item.category),
						status: this.getStatus(item.activity_time),
						hasJoined: userJoins.has(item._id) // 添加参与状态
					}));

					if (!isLoadMore) {
						this.activities = formattedActivities;
					} else {
						this.activities = [...this.activities, ...formattedActivities];
					}

					this.noMore = rawActivities.length < 5;
				} catch (err) {
					console.error('获取活动失败', err);
					uni.showToast({
						title: '加载失败',
						icon: 'none'
					});
				} finally {
					this.refreshing = false;
					this.loading = false;
				}
			},

			// 时间格式化方法（提取时分）
			formatTime(timestamp) {
				const date = new Date(timestamp);
				return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
			},
			//月份格式化方法（输出如"05月"）
			formatMonth(date) {
				const month = (date.getMonth() + 1).toString().padStart(2, '0'); // 月份从0开始，+1后补零
				return `${month}月`;
			},
			// 日期格式化方法（输出如"05"）
			formatDay(date) {
				return date.getDate().toString().padStart(2, '0'); // 日期补零到两位
			},
			getStatusClass(item) {
				return item.status; // 直接返回状态标识（与样式中的.status-tag.upcoming等类名对应）
			},
			// 状态文本转换方法（将状态标识转为中文）
			getStatusText(item) {
				const status = item.status;
				switch (status) {
					case 'upcoming':
						return '未开始';
					case 'ongoing':
						return '进行中';
					case 'ended':
						return '已结束';
					default:
						return '未知状态';
				}
			},
			// 判断活动是否可以参与
			canJoin(item) {
				// 如果活动已结束，不能参与
				if (item.status === 'ended') return false;

				// 如果活动正在进行中或未开始，可以参与
				return true;
			},
			// 查看活动详情
			viewDetail(item) {
				console.log('查看活动详情', item);
				// 跳转到活动详情页
				uni.navigateTo({
					url: `/pages/circle/activity-datail/activity-datail?id=${item.id}`
				});
			},
			// 参与活动
			async joinActivity(item) {
				console.log('参与活动', item);
				try {
					// 检查登录状态
					const token = uni.getStorageSync('uni_id_token');
					if (!token) {
						uni.showModal({
							title: '提示',
							content: '请先登录后再参与活动',
							confirmText: '去登录',
							success: (res) => {
								if (res.confirm) {
									uni.navigateTo({
										url: '/pages/login/login'
									});
								}
							}
						});
						return;
					}

					// 调用云函数
					const res = await uniCloud.callFunction({
						name: 'joinactivity',
						data: {
							activityId: item.id,
							token: token
						}
					});

					if (res.result.success) {
						uni.showToast({ title: '参与成功', icon: 'success' });
						this.onRefresh();
					} else {
						// 处理特定的错误码
						if (res.result.code === 'TOKEN_INVALID') {
							uni.showModal({
								title: '提示',
								content: '登录状态已失效，请重新登录',
								confirmText: '去登录',
								success: (res) => {
									if (res.confirm) {
										uni.navigateTo({
											url: '/pages/login/login'
										});
									}
								}
							});
						} else {
							uni.showToast({ 
								title: res.result.message || '参与失败', 
								icon: 'none' 
							});
						}
					}
				} catch (err) {
					console.error('参与活动失败', err);
					uni.showToast({ title: '参与失败，请稍后重试', icon: 'none' });
				}
			},
			// 标签类名映射（与addactivities.vue保持一致）
			getTagClass(category) {
				const tagMap = {
					'官方': 'official',
					'社团': 'club',
					'学术': 'academic',
					'娱乐': 'entertainment',
					'体育': 'sports'
				};
				return tagMap[category] || '';
			},

			// 状态计算（根据活动时间和当前时间）
			getStatus(activityTime) {
				const now = new Date().getTime();
				if (activityTime > now) return 'upcoming'; // 未开始
				if (activityTime <= now && activityTime + 86400000 > now) return 'ongoing'; // 进行中（假设持续1天）
				return 'ended'; // 已结束
			}
		}
	}
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
		height: 120rpx;
		/* 固定高度 */
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

			.day,
			.weekday {
				color: $white;
			}

			.dot {
				background-color: $white;
			}
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
		height: calc(100vh - 300rpx);
		/* 调整高度以适应顶部区域 */
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
			box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.03);
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

				&:after {
					display: none;
				}

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