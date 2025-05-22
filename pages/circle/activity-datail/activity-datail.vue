<template>
	<view class="activity-detail-container">
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
			<view class="activity-tag" :class="activity.tagClass">{{ activity.tag }}</view>
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
				<rich-text :nodes="activity.description || '暂无详细描述'"></rich-text>
			</view>
		</view>
		
		<!-- 参与人员 -->
		<view class="activity-detail-section card-ani" v-if="activity.avatars && activity.avatars.length > 0">
			<view class="section-title">
				<text class="title-text">参与人员</text>
			</view>
			<view class="participants">
				<image 
					v-for="(avatar, index) in activity.avatars" 
					:key="index" 
					:src="avatar" 
					class="participant-avatar"
				></image>
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
				<view 
					v-for="(item, index) in relatedActivities" 
					:key="index" 
					class="related-activity-item animated-scale"
					@tap="viewRelatedActivity(item)"
				>
					<image :src="item.image" mode="aspectFill" class="related-activity-image"></image>
					<view class="related-activity-info">
						<text class="related-activity-title">{{ item.title }}</text>
						<text class="related-activity-time">{{ formatDate(item.date) }}</text>
					</view>
				</view>
			</scroll-view>
		</view>
		
		<!-- 底部操作栏 -->
		<view class="footer-bar card-ani">
			<view class="action-btns">
				<button class="action-btn clickable-mp" @tap="viewOrganizer">主办方介绍</button>
				<button class="action-btn primary clickable-mp" v-if="canJoin(activity)" @tap="joinActivity">立即参与</button>
				<button class="action-btn disabled" v-else>{{ activity.status === 'ended' ? '已结束' : '已参与' }}</button>
			</view>
		</view>
	</view>
</template>

<script>
export default {
	data() {
		return {
			id: null,
			activity: {
				id: 1,
				image: '/static/images/activity1.png',
				tag: '官方',
				tagClass: 'official',
				title: '校园文化节',
				description: '<p>一年一度的校园文化节即将开幕，届时将有各种各样文化活动和表演，欢迎大家参与！</p><p>本次活动内容包括：</p><ul><li>开幕式文艺演出</li><li>各学院特色文化展示</li><li>才艺比赛</li><li>游园会</li><li>闭幕晚会</li></ul><p>活动期间会有精美礼品发放，欢迎全校师生积极参与！</p>',
				date: new Date(),
				time: '19:00-21:30',
				location: '学校体育馆',
				avatars: ['/static/images/avatar1.png', '/static/images/avatar2.png', '/static/images/avatar3.png'],
				participants: 128,
				status: 'upcoming' // upcoming, ongoing, ended
			},
			relatedActivities: [
				{
					id: 2,
					image: '/static/images/activity2.png',
					title: '创新创业大赛',
					date: new Date(new Date().getTime() + 5 * 24 * 60 * 60 * 1000), // 5天后
					status: 'upcoming'
				},
				{
					id: 3,
					image: '/static/images/activity1.png',
					title: '校园歌手大赛',
					date: new Date(new Date().getTime() + 2 * 24 * 60 * 60 * 1000), // 2天后
					status: 'upcoming'
				},
				{
					id: 4,
					image: '/static/images/activity2.png',
					title: '篮球联赛',
					date: new Date(new Date().getTime() + 7 * 24 * 60 * 60 * 1000), // 7天后
					status: 'upcoming'
				}
			],
			statusBarHeight: 0,
			menuButtonHeight: 0,
			menuButtonLeft: 0,
			menuButtonRight: 0,
			headerHeight: 0,
			coverShow: false
		};
	},
	onLoad(options) {
		const sysInfo = uni.getSystemInfoSync();
		const menuButton = uni.getMenuButtonBoundingClientRect();
		this.statusBarHeight = sysInfo.statusBarHeight;
		this.menuButtonHeight = menuButton.height;
		this.menuButtonLeft = menuButton.left;
		this.menuButtonRight = menuButton.right;
		this.headerHeight = sysInfo.statusBarHeight + menuButton.height;
		if (options.id) {
			this.id = options.id;
			this.loadActivityDetail();
		}
	},
	mounted() {
		setTimeout(() => { this.coverShow = true }, 100);
	},
	methods: {
		// 加载活动详情数据
		loadActivityDetail() {
			// 实际项目中这里应该是网络请求获取活动详情
			// 这里使用模拟数据
			// this.activity = ...
		},
		
		// 返回上一页
		goBack() {
			uni.navigateBack();
		},
		
		// 格式化日期
		formatDate(date) {
			const months = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'];
			return `${months[date.getMonth()]}${date.getDate()}日`;
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
		
		// 立即参与
		joinActivity() {
			uni.showModal({
				title: '确认参与',
				content: '确定要参与该活动吗？',
				success: (res) => {
					if (res.confirm) {
						// 实际项目中这里应该发送参与请求
						uni.showToast({
							title: '报名成功',
							icon: 'success'
						});
					}
				}
			});
		},
		
		// 分享活动
		shareActivity() {
			// 实际项目中调用分享API
			uni.showToast({
				title: '分享功能开发中',
				icon: 'none'
			});
		},
		
		// 查看主办方
		viewOrganizer() {
			uni.showToast({
				title: '主办方信息页面开发中',
				icon: 'none'
			});
		},
		
		// 查看相关活动
		viewRelatedActivity(item) {
			uni.navigateTo({
				url: '/pages/circle/activity-detail?id=' + item.id
			});
		}
	}
};
</script>

<style lang="scss">
@import '@/styles/variables.scss';
@import '@/styles/common.scss';
@import '@/styles/platform-mp.scss';

.activity-detail-container {
	display: flex;
	flex-direction: column;
	min-height: 100vh;
	background-color: #F8F9FC;
	padding-top: 0;
}

// 封面淡入动画
.activity-cover {
	position: relative;
	height: 500rpx;
	width: 100%;
	opacity: 0;
	transition: opacity 0.8s cubic-bezier(.4,0,.2,1);
	&.fade-in { opacity: 1; }
	
	.cover-image {
		width: 100%;
		height: 100%;
		border-radius: 0 0 32rpx 32rpx;
		box-shadow: 0 8rpx 32rpx rgba(0,0,0,0.10);
	}
	
	.cover-mask {
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: linear-gradient(to bottom, rgba(0,0,0,0.18), rgba(0,0,0,0.45));
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
		box-shadow: 0 4rpx 16rpx rgba($primary-color, 0.10);
		animation: bounceIn 0.8s;
		
		&.upcoming {
			background: linear-gradient(90deg, $primary-color, lighten($primary-color, 10%));
			color: #fff;
		}
		&.ongoing {
			background: linear-gradient(90deg, $success-color, lighten($success-color, 10%));
			color: #fff;
		}
		&.ended {
			background: linear-gradient(90deg, #999, #bbb);
			color: #fff;
		}
	}
}

@keyframes bounceIn {
	0% { transform: translateY(40rpx) scale(0.8); opacity: 0; }
	60% { transform: translateY(-10rpx) scale(1.05); opacity: 1; }
	80% { transform: translateY(0) scale(0.97);}
	100% { transform: translateY(0) scale(1);}
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
	box-shadow: 0 8rpx 32rpx rgba(0,0,0,0.10);
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
		&:last-child { margin-bottom: 0; }
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
			content: '';
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
		box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.10);
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
		box-shadow: 0 4rpx 16rpx rgba(0,0,0,0.12);
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
				background: linear-gradient(90deg, $primary-color, lighten($primary-color, 10%));
				color: #fff;
				box-shadow: 0 4rpx 12rpx rgba($primary-color, 0.18);
				&:active {
					box-shadow: 0 1rpx 4rpx rgba($primary-color, 0.10);
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