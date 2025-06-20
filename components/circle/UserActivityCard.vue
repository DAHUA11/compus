<template>
	<view class="activity-card-wrapper" @click="goToDetail">
		<!-- 骨架屏 -->
		<view v-if="!activity || !activity._id" class="skeleton-card">
			<view class="skeleton-header">
				<view class="skeleton-avatar"></view>
				<view class="skeleton-info">
					<view class="skeleton-line" style="width: 40%;"></view>
					<view class="skeleton-line" style="width: 60%;"></view>
				</view>
			</view>
			<view class="skeleton-content">
				<view class="skeleton-line"></view>
				<view class="skeleton-line" style="width: 80%;"></view>
			</view>
		</view>

		<!-- 实际内容 -->
		<view v-else class="activity-card">
			<view class="activity-header">
				<image class="avatar" :src="activity.user_info && activity.user_info.avatar_file && activity.user_info.avatar_file.url ? activity.user_info.avatar_file.url : '/static/default-avatar.png'" mode="aspectFill"></image>
				<view class="user-info">
					<text class="username">{{ (activity.user_info && activity.user_info.nickname) || '匿名用户' }}</text>
					<text class="publish-time">{{ formattedTimeAgo(activity.create_time) }}</text>
				</view>
				<view class="status-badge" :class="activityStatus.class">{{ activityStatus.text }}</view>
			</view>
			<view class="activity-title">{{ activity.title || '活动标题未设置' }}</view>
			<view class="activity-content">
				<text class="content-text" v-if="activity.content">{{ stripHtml(activity.content).slice(0, 50) }}{{ stripHtml(activity.content).length > 50 ? '...' : '' }}</text>
			</view>
			<view class="activity-footer">
				<view class="footer-item">
					<uni-icons type="location" size="14" color="#8A8A8A"></uni-icons>
					<text class="footer-text">{{ activity.location || '地点待定' }}</text>
				</view>
				<view class="footer-item">
					<uni-icons type="calendar" size="14" color="#8A8A8A"></uni-icons>
					<text class="footer-text">{{ formattedDate(activity.activity_time) }}</text>
				</view>
				<view class="footer-item">
					<uni-icons type="person" size="14" color="#8A8A8A"></uni-icons>
					<text class="footer-text">{{ activity.attendee_count || 0 }}/{{ activity.max_attendees || '不限' }}</text>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	export default {
		name: "UserActivityCard",
		props: {
			activity: {
				type: Object,
				default: () => ({})
			}
		},
		computed: {
			activityStatus() {
				if (!this.activity || !this.activity.activity_time) {
					return { text: '未知', class: 'status-unknown' };
				}
				const now = Date.now();
				if (now > this.activity.activity_time) {
					return { text: '已结束', class: 'status-ended' };
				}
				if ((this.activity.attendee_count || 0) >= (this.activity.max_attendees || Infinity)) {
					return { text: '已满员', class: 'status-full' };
				}
				return { text: '进行中', class: 'status-ongoing' };
			}
		},
		methods: {
			formattedTimeAgo(timestamp) {
				if (!timestamp) return '';
				const now = new Date();
				const past = new Date(timestamp);
				const diffInSeconds = Math.floor((now - past) / 1000);

				const minute = 60;
				const hour = minute * 60;
				const day = hour * 24;

				if (diffInSeconds < minute) {
					return '刚刚';
				} else if (diffInSeconds < hour) {
					return `${Math.floor(diffInSeconds / minute)}分钟前`;
				} else if (diffInSeconds < day) {
					return `${Math.floor(diffInSeconds / hour)}小时前`;
				} else {
					return `${Math.floor(diffInSeconds / day)}天前`;
				}
			},
			stripHtml(htmlStr) {
				if (!htmlStr) return '';
				return htmlStr.replace(/<[^>]+>/g, '');
			},
			formattedDate(timestamp) {
				if (!timestamp) return '时间待定';
				const date = new Date(timestamp);
				const month = String(date.getMonth() + 1).padStart(2, '0');
				const day = String(date.getDate()).padStart(2, '0');
				const hours = String(date.getHours()).padStart(2, '0');
				const minutes = String(date.getMinutes()).padStart(2, '0');
				return `${month}-${day} ${hours}:${minutes}`;
			},
			goToDetail() {
				if (this.activity && this.activity._id) {
					this.$emit('click');
				}
			}
		}
	}
</script>

<style scoped>
	.activity-card-wrapper {
		background-color: #ffffff;
		border-radius: 16rpx;
		margin-bottom: 24rpx;
		box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.06);
		overflow: hidden;
		transition: transform 0.2s ease-in-out;
	}

	.activity-card-wrapper:active {
		transform: scale(0.98);
	}

	.activity-card {
		padding: 24rpx;
	}

	.activity-header {
		display: flex;
		align-items: center;
		margin-bottom: 20rpx;
	}

	.avatar {
		width: 80rpx;
		height: 80rpx;
		border-radius: 50%;
		margin-right: 20rpx;
	}

	.user-info {
		flex: 1;
		display: flex;
		flex-direction: column;
	}

	.username {
		font-size: 15px;
		font-weight: 500;
		color: #303133;
	}

	.publish-time {
		font-size: 12px;
		color: #909399;
	}

	.status-badge {
		padding: 6rpx 16rpx;
		border-radius: 100rpx;
		font-size: 12px;
		font-weight: 500;
	}
	
	.status-ongoing { background-color: #E6F7FF; color: #1890FF; }
	.status-ended { background-color: #F0F2F5; color: #909399; }
	.status-full { background-color: #FFF0F0; color: #F56C6C; }
	.status-unknown { background-color: #F4F4F5; color: #909399; }

	.activity-title {
		font-size: 16px;
		font-weight: 600;
		color: #303133;
		margin-bottom: 12rpx;
		line-height: 1.4;
	}

	.activity-content {
		margin-bottom: 24rpx;
	}

	.content-text {
		font-size: 14px;
		color: #606266;
		line-height: 1.6;
	}

	.activity-footer {
		display: flex;
		justify-content: space-between;
		align-items: center;
		border-top: 1rpx solid #F0F2F5;
		padding-top: 20rpx;
	}

	.footer-item {
		display: flex;
		align-items: center;
		font-size: 12px;
		color: #8A8A8A;
	}

	.footer-text {
		margin-left: 8rpx;
	}
	
	/* 骨架屏样式 */
	.skeleton-card {
		padding: 24rpx;
	}
	
	.skeleton-header {
		display: flex;
		align-items: center;
		margin-bottom: 20rpx;
	}
	
	.skeleton-avatar {
		width: 80rpx;
		height: 80rpx;
		border-radius: 50%;
		background-color: #f0f2f5;
		margin-right: 20rpx;
	}
	
	.skeleton-info {
		flex: 1;
	}
	
	.skeleton-line {
		height: 24rpx;
		background-color: #f0f2f5;
		border-radius: 8rpx;
		margin-bottom: 12rpx;
	}
	
	.skeleton-content .skeleton-line:last-child {
		margin-bottom: 0;
	}

	@keyframes skeleton-blink {
		0% { opacity: 1; }
		50% { opacity: 0.6; }
		100% { opacity: 1; }
	}

	.skeleton-card .skeleton-avatar,
	.skeleton-card .skeleton-line {
		animation: skeleton-blink 1.5s infinite ease-in-out;
	}

</style> 