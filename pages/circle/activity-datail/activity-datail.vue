<template>
	<view v-if="activity._id" class="activity-detail-container">
		<!-- 活动封面 -->
		<view class="activity-cover" :class="{ 'fade-in': coverShow }">
			<image :src="activity.image" mode="aspectFill" class="cover-image"></image>
			<view class="cover-mask"></view>
			<view class="activity-status animated-bounce" :class="getStatusClass(activity)">
				<text>{{ getStatusText(activity) }}</text>
			</view>
		</view>

		<!-- 活动基本信息 -->
		<view class="activity-basic-info card-ani">
			<view class="activity-tag" :class="activity.tagClass">{{
        activity.tag
      }}</view>
			<view class="activity-title">{{ activity.title }}</view>

			<view class="info-item">
				<text class="iconfont icon-shijian"></text>
				<text class="info-text">{{ formatDate(activity.date) }} {{ activity.time }}</text>
			</view>

			<view class="info-item">
				<text class="iconfont icon-location"></text>
				<text class="info-text">{{ activity.location }}</text>
			</view>

			<view class="info-item">
				<text class="iconfont icon-huodong"></text>
				<text class="info-text">已有 {{ activity.participants }} 人参与</text>
			</view>
		</view>

		<!-- 活动详情 -->
		<view class="activity-detail-section card-ani">
			<view class="section-title">
				<text class="title-text">活动详情</text>
			</view>
			<view class="activity-description">
				<rich-text :nodes="activity.content || '暂无详细描述'"></rich-text>
			</view>
		</view>

		<!-- 参与人员 -->
		<view class="activity-detail-section card-ani" v-if="activity.avatars && activity.avatars.length > 0">
			<view class="section-title">
				<text class="title-text">参与人员</text>
			</view>
			<view class="participants">
				<image v-for="(avatar, index) in activity.avatars" :key="index" :src="avatar"
					class="participant-avatar"></image>
				<view class="more-participants" v-if="activity.participants > activity.avatars.length">
					<text>+{{ activity.participants - activity.avatars.length }}</text>
				</view>
			</view>
		</view>

		<!-- 相关活动推荐 -->
		<view class="activity-detail-section card-ani">
			<view class="section-title">
				<text class="title-text">相关活动</text>
			</view>
			<scroll-view class="related-activities" scroll-x="true" show-scrollbar="false">
				<view v-for="(item, index) in relatedActivities" :key="index"
					class="related-activity-item animated-scale" @tap="viewRelatedActivity(item)">
					<image :src="item.image" mode="aspectFill" class="related-activity-image"></image>
					<view class="related-activity-info">
						<text class="related-activity-title">{{ item.title }}</text>
						<text class="related-activity-time">{{
              formatDate(item.date)
            }}</text>
					</view>
				</view>
			</scroll-view>
		</view>

		<!-- 底部操作栏 -->
		<view class="footer-bar card-ani">
			<view class="action-btns">
				<button 
					class="action-btn clickable-mp" 
					@tap="isCurrentUser ? editActivity : viewOrganizer"
				>
					{{ isCurrentUser ? '编辑活动' : '主办方介绍' }}
				</button>
				<!-- 参与按钮保持不变 -->
				<button
					class="action-btn primary clickable-mp"
					v-if="canJoin(activity)"
					@tap="joinActivity"
				>
					立即参与
				</button>
				<button class="action-btn disabled" v-else>
					{{ activity.status === "ended" ? "已结束" : "已参与" }}
				</button>
			</view>
		</view>
	</view>
	<view v-else class="loading">
		<text class="iconfont icon-loading loading-icon"></text>
		<text class="text-sm text-gray">加载活动详情...</text>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				id: null,
				activity: {}, // 初始化为空对象避免渲染错误
				relatedActivities: [{
						id: 2,
						image: "/static/images/activity2.png",
						title: "创新创业大赛",
						date: new Date(new Date().getTime() + 5 * 24 * 60 * 60 * 1000), // 5天后
						status: "upcoming",
					},
					{
						id: 3,
						image: "/static/images/activity1.png",
						title: "校园歌手大赛",
						date: new Date(new Date().getTime() + 2 * 24 * 60 * 60 * 1000), // 2天后
						status: "upcoming",
					},
					{
						id: 4,
						image: "/static/images/activity2.png",
						title: "篮球联赛",
						date: new Date(new Date().getTime() + 7 * 24 * 60 * 60 * 1000), // 7天后
						status: "upcoming",
					},
				],
				statusBarHeight: 0,
				menuButtonHeight: 0,
				menuButtonLeft: 0,
				menuButtonRight: 0,
				headerHeight: 0,
				coverShow: false,
				currentUserId: null, // 新增：当前登录用户ID
				isCurrentUser: false, // 新增：是否是活动发布者标识
			};
		},
		onLoad(options) {
			// 替换为微信推荐的uni.getWindowInfo获取窗口信息
			const windowInfo = uni.getWindowInfo(); // 替代原uni.getSystemInfoSync()
			const menuButton = uni.getMenuButtonBoundingClientRect();
			this.statusBarHeight = windowInfo.statusBarHeight; // 从windowInfo中获取状态栏高度
			this.menuButtonHeight = menuButton.height;
			this.menuButtonLeft = menuButton.left;
			this.menuButtonRight = menuButton.right;
			this.headerHeight = windowInfo.statusBarHeight + menuButton.height; // 使用windowInfo的statusBarHeight
			if (options.id) {
				this.id = options.id;
				this.loadActivityDetail(); // 加载详情数据
			}
		},
		mounted() {
			setTimeout(() => {
				this.coverShow = true;
			}, 100);
		},
		methods: {
			// 加载活动详情数据
			async loadActivityDetail() {
				try {
					// 1. 获取当前用户ID（通过解析uni_id_token）
					const token = uni.getStorageSync('uni_id_token');
					if (token) {
						const decodedToken = JSON.parse(atob(token.split('.')[1])); // 解析JWT payload
						this.currentUserId = decodedToken.uid; // uni-id的用户ID存储在uid字段
					}

					// 2. 查询活动详情（原有逻辑）
					const res = await uniCloud.database().collection("add-content").doc(this.id).get();
					if (res.result.data && res.result.data.length > 0) {
						const rawActivity = res.result.data[0];
            // 3. 判断是否是当前用户发布的活动
          this.isCurrentUser = this.currentUserId === rawActivity.user_id;
						// 4.获取发布者信息
						const userRes = await uniCloud.database().collection("uni-id-users").doc(rawActivity.user_id).field("avatar_file,nickname").get();
						this.activity = {
							...rawActivity,
							date: new Date(rawActivity.activity_time), // 完整日期对象
							// time: this.formatTime(rawActivity.activity_time),  // 单独时间部分
							participants: rawActivity.attendee_count || 0, // 从数据库字段映射
							tagClass: this.getTagClass(rawActivity.category), // 新增tagClass映射
							avatar: userRes.result.data[0]?.avatar_file?.url ||
								"/static/images/default-avatar.png",
							image: rawActivity.files?.[0] || "/static/images/activity-default.png", // 取files第一张图
							publisher: userRes.result.data[0]?.nickname || "匿名发布者",
							formattedDate: this.formatDate(rawActivity.create_time), // 使用统一日期格式化
						};
					} else {
						uni.showToast({
							title: "活动不存在",
							icon: "none"
						});
						uni.navigateBack();
					}
				} catch (err) {
					console.error("加载活动详情失败", err);
					uni.showToast({
						title: "加载失败，请重试",
						icon: "none"
					});
				}
			},
			//标签类名映射方法
			getTagClass(category) {
				const tagMap = {
					官方: "official",
					社团: "club",
					学术: "academic",
					娱乐: "entertainment",
					体育: "sports",
				};
				return tagMap[category] || "";
			},
			// 新增：状态判断方法
			// 状态文本映射方法（修改核心逻辑）
			getStatusText(item) {
				const currentTime = new Date().getTime(); // 当前时间戳
				const activityTime = item.date.getTime(); // 活动开始时间戳

				if (currentTime < activityTime) {
					return "即将开始";
				} else {
					return "已结束";
				}
			},

			// 参与权限判断（同步调整）
			canJoin(item) {
				const currentTime = new Date().getTime();
				const activityTime = item.date.getTime();
				return currentTime < activityTime; // 活动开始前允许参与
			},
			// 参与活动（关键修改）
			async joinActivity(item) {
				console.log('参与活动', item);
				console.log("活动信息",this.activity)
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
							activityId: this.activity._id,
							token: token
						}
					});

					if (res.result.success) {
						uni.showToast({
							title: '参与成功',
							icon: 'success'
						});
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
					uni.showToast({
						title: '参与失败，请稍后重试',
						icon: 'none'
					});
				}
			},
			getStatusClass(item) {
				const currentTime = new Date().getTime();
				const activityTime = item.date.getTime();
				return currentTime < activityTime ? "status-upcoming" : "status-ended"; // 匹配CSS中的类名
			},
			// 日期格式化优化（原有方法增强）
			formatDate(ts) {
				const date = new Date(ts);
				const year = date.getFullYear();
				const month = (date.getMonth() + 1).toString().padStart(2, "0"); // 月份从0开始，+1后补零
				const day = date.getDate().toString().padStart(2, "0");
				const hours = date.getHours().toString().padStart(2, "0");
				const minutes = date.getMinutes().toString().padStart(2, "0");
				// 返回完整格式：年-月-日 时:分（如2024-06-15 14:30）
				return `${year}-${month}-${day} ${hours}:${minutes}`;
			}
		},
	};
</script>

<style lang="scss">
	@import "@/styles/variables.scss";
	@import "@/styles/common.scss";
	@import "@/styles/platform-mp.scss";

	.activity-detail-container {
		display: flex;
		flex-direction: column;
		min-height: 100vh;
		background-color: #f8f9fc;
		padding-top: 0;
	}

	// 封面淡入动画
	.activity-cover {
		position: relative;
		height: 500rpx;
		width: 100%;
		opacity: 0;
		transition: opacity 0.8s cubic-bezier(0.4, 0, 0.2, 1);

		&.fade-in {
			opacity: 1;
		}

		.cover-image {
			width: 100%;
			height: 100%;
			border-radius: 0 0 32rpx 32rpx;
			box-shadow: 0 8rpx 32rpx rgba(0, 0, 0, 0.1);
		}

		.cover-mask {
			position: absolute;
			top: 0;
			left: 0;
			right: 0;
			bottom: 0;
			background: linear-gradient(to bottom,
					rgba(0, 0, 0, 0.18),
					rgba(0, 0, 0, 0.45));
			border-radius: 0 0 32rpx 32rpx;
		}

		.activity-status {
			position: absolute;
			right: 30rpx;
			bottom: 80rpx;
			padding: 10rpx 30rpx;
			border-radius: 30rpx;
			font-size: 24rpx;
			font-weight: bold;
			box-shadow: 0 4rpx 16rpx rgba($primary-color, 0.1);
			animation: bounceIn 0.8s;

			&.upcoming {
				background: linear-gradient(90deg,
						$primary-color,
						lighten($primary-color, 10%));
				color: #fff;
			}

			&.ongoing {
				background: linear-gradient(90deg,
						$success-color,
						lighten($success-color, 10%));
				color: #fff;
			}

			&.ended {
				background: linear-gradient(90deg, #999, #bbb);
				color: #fff;
			}

			&.status-upcoming {
				background: linear-gradient(90deg,
						$primary-color,
						lighten($primary-color, 10%));
				color: #fff;
			}

			&.status-ongoing {
				background: linear-gradient(90deg,
						$success-color,
						lighten($success-color, 10%));
				color: #fff;
			}

			&.status-ended {
				background: linear-gradient(90deg, #999, #bbb);
				color: #fff;
			}
		}
	}

	@keyframes bounceIn {
		0% {
			transform: translateY(40rpx) scale(0.8);
			opacity: 0;
		}

		60% {
			transform: translateY(-10rpx) scale(1.05);
			opacity: 1;
		}

		80% {
			transform: translateY(0) scale(0.97);
		}

		100% {
			transform: translateY(0) scale(1);
		}
	}

	// 卡片内容淡入动画
	.card-ani {
		opacity: 0;
		transform: translateY(40rpx);
		animation: cardFadeIn 0.7s 0.2s forwards;
	}

	@keyframes cardFadeIn {
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	.activity-basic-info {
		margin-top: -60rpx;
		margin-horizontal: 30rpx;
		padding: 30rpx;
		background: #fff;
		border-radius: 24rpx;
		box-shadow: 0 8rpx 32rpx rgba(0, 0, 0, 0.1);
		position: relative;
		z-index: 10;
		transition: box-shadow 0.3s;

		.activity-tag {
			display: inline-block;
			padding: 6rpx 20rpx;
			border-radius: 20rpx;
			font-size: 24rpx;
			margin-bottom: 16rpx;
			font-weight: 500;
			letter-spacing: 2rpx;
			box-shadow: 0 2rpx 8rpx rgba($primary-color, 0.08);

			&.official {
				background-color: rgba($primary-color, 0.1);
				color: $primary-color;
			}

			&.club {
				background-color: rgba(#5b2ee6, 0.1);
				color: #5b2ee6;
			}

			&.academic {
				background-color: rgba(#06a788, 0.1);
				color: #06a788;
			}

			&.entertainment {
				background-color: rgba($warning-color, 0.1);
				color: $warning-color;
			}

			&.sports {
				background-color: rgba(#ff3366, 0.1);
				color: #ff3366;
			}
		}

		.activity-title {
			font-size: 40rpx;
			font-weight: bold;
			color: $primary-color;
			margin-bottom: 24rpx;
			line-height: 1.3;
			letter-spacing: 2rpx;
		}

		.info-item {
			display: flex;
			align-items: center;
			margin-bottom: 16rpx;

			&:last-child {
				margin-bottom: 0;
			}

			.iconfont {
				font-size: 28rpx;
				color: $primary-color;
				margin-right: 12rpx;
			}

			.info-text {
				font-size: 28rpx;
				color: #666;
			}
		}
	}

	.activity-detail-section {
		margin: 30rpx;
		padding: 30rpx;
		background: #fff;
		border-radius: 24rpx;
		box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.06);
		animation: cardFadeIn 0.7s 0.3s both;

		.section-title {
			margin-bottom: 20rpx;
			position: relative;

			&:after {
				content: "";
				position: absolute;
				left: 0;
				bottom: -10rpx;
				width: 60rpx;
				height: 4rpx;
				background: $primary-color;
				border-radius: 2rpx;
			}

			.title-text {
				font-size: 32rpx;
				font-weight: bold;
				color: #333;
			}
		}

		.activity-description {
			font-size: 28rpx;
			color: #666;
			line-height: 1.6;
		}
	}

	.participants {
		display: flex;
		flex-wrap: wrap;
		align-items: center;

		.participant-avatar {
			width: 80rpx;
			height: 80rpx;
			border-radius: 50%;
			margin-right: 16rpx;
			margin-bottom: 16rpx;
			border: 2rpx solid #fff;
			box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.1);
			transition: box-shadow 0.3s;
		}

		.more-participants {
			width: 80rpx;
			height: 80rpx;
			border-radius: 50%;
			display: flex;
			align-items: center;
			justify-content: center;
			background: #f5f5f5;
			color: #666;
			font-size: 24rpx;
			margin-right: 16rpx;
			margin-bottom: 16rpx;
		}
	}

	.related-activities {
		white-space: nowrap;
		margin: 0 -10rpx;
	}

	.related-activity-item {
		display: inline-block;
		width: 300rpx;
		margin: 0 10rpx;
		border-radius: 16rpx;
		overflow: hidden;
		background: #fff;
		box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.08);
		transition: transform 0.2s, box-shadow 0.2s;

		&:active {
			transform: scale(1.04);
			box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.12);
		}

		.related-activity-image {
			width: 100%;
			height: 160rpx;
			transition: box-shadow 0.2s;
		}

		.related-activity-info {
			padding: 16rpx;

			.related-activity-title {
				font-size: 26rpx;
				color: #333;
				font-weight: 500;
				margin-bottom: 8rpx;
				white-space: normal;
				display: -webkit-box;
				-webkit-line-clamp: 2;
				-webkit-box-orient: vertical;
				overflow: hidden;
				line-height: 1.3;
			}

			.related-activity-time {
				font-size: 22rpx;
				color: #999;
			}
		}
	}

	.footer-bar {
		padding: 20rpx 30rpx;
		background: #fff;
		border-top: 1rpx solid rgba(0, 0, 0, 0.05);
		position: fixed;
		bottom: 0;
		left: 0;
		right: 0;
		z-index: 90;
		box-shadow: 0 -2rpx 10rpx rgba(0, 0, 0, 0.03);
		animation: cardFadeIn 0.7s 0.4s both;

		.action-btns {
			display: flex;
			justify-content: space-between;

			.action-btn {
				flex: 1;
				margin: 0 10rpx;
				height: 80rpx;
				line-height: 80rpx;
				border-radius: 40rpx;
				font-size: 28rpx;
				font-weight: 500;
				text-align: center;
				background: #f5f5f5;
				color: #666;
				border: none;
				transition: transform 0.2s, box-shadow 0.2s;

				&:active {
					transform: scale(0.96);
					box-shadow: 0 2rpx 8rpx rgba($primary-color, 0.18);
				}

				&.primary {
					background: linear-gradient(90deg,
							$primary-color,
							lighten($primary-color, 10%));
					color: #fff;
					box-shadow: 0 4rpx 12rpx rgba($primary-color, 0.18);

					&:active {
						box-shadow: 0 1rpx 4rpx rgba($primary-color, 0.1);
					}
				}

				&.disabled {
					background: #eee;
					color: #999;
				}
			}
		}
	}
</style>