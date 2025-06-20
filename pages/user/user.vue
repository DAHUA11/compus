<template>
	<view class="user-page-container">
		<!-- 背景元素 -->
		<view class="page-background">
			<image src="/static/campus-ill.png" mode="widthFix" class="bg-image"></image>
		</view>

		<!-- 顶部个人信息区域 -->
		<view class="header-section">
			<template v-if="isLoggedIn">
				<view class="user-card">
					<view class="user-card-avatar" @click="goedituserinfo">
						<image class="avatar" :src="userInfo.avatar_file && userInfo.avatar_file.url ? userInfo.avatar_file.url : '/static/default-avatar.png'" mode="aspectFill"></image>
					</view>
					<view class="user-card-info">
						<view class="user-name-line">
							<text class="user-name">{{ userInfo.username || userInfo.nickname || '未设置昵称' }}</text>
							<uni-icons @click="goedituserinfo" type="compose" size="18" color="#000000" class="edit-icon" />
						</view>
						<view class="user-meta" @click="gocreditdetails">
							<text>信用等级: {{ userInfo.creditLevel || 'A级' }}</text>
						</view>
					</view>
					<view class="user-score-box" @click="gopointsdetails">
						<text class="score-value">{{ userInfo.score || 0 }}</text>
						<text class="score-label">积分</text>
					</view>
				</view>
			</template>
			<template v-else>
				<view class="not-login-container">
					<image class="default-avatar" src="/static/default-avatar.png" mode="aspectFill"></image>
					<view class="login-btn" @click="goToLogin">
						<text>去登录</text>
					</view>
				</view>
			</template>
		</view>

		<!-- 主要内容区域 -->
		<view class="content-wrapper">
			<!-- 功能导航区 -->
			<view class="card-section nav-section" v-if="isLoggedIn">
				<view
					class="nav-item cursor-pointer"
					v-for="(item, index) in navItems"
					:key="index"
					@click="goToUserTask(item.type)"
				>
					<uni-icons :type="item.icon" size="26" :color="item.color"></uni-icons>
					<text class="nav-text">{{ item.text }}</text>
				</view>
			</view>
			
			<!-- 数据统计 -->
			<view class="stats-group">
				<!-- 任务数据 -->
				<view class="card-section data-card">
					<view class="card-header">
						<text class="card-title">任务数据</text>
					</view>
					<view class="data-grid">
						<view class="data-item" v-for="(item, index) in taskData" :key="index">
							<text class="data-value">{{ item.value }}</text>
							<text class="data-label">{{ item.label }}</text>
						</view>
					</view>
				</view>

				<!-- 圈子贡献 -->
				<view class="card-section data-card" @click="goToUserQuanzi">
					<view class="card-header">
						<text class="card-title">圈子贡献</text>
						<uni-icons type="right" size="14" color="#C0C4CC"></uni-icons>
					</view>
					<view class="data-grid">
						<view class="data-item" v-for="(item, index) in circleData" :key="index">
							<text class="data-value">{{ item.value }}</text>
							<text class="data-label">{{ item.label }}</text>
						</view>
					</view>
				</view>
				
				<!-- 活动数据 -->
				<view class="card-section data-card" @click="goToUserActivity">
					<view class="card-header">
						<text class="card-title">活动中心</text>
						<uni-icons type="right" size="14" color="#C0C4CC"></uni-icons>
					</view>
					<view class="data-grid">
						<view class="data-item" v-for="(item, index) in activityData" :key="index">
							<text class="data-value">{{ item.value }}</text>
							<text class="data-label">{{ item.label }}</text>
						</view>
					</view>
				</view>

				<!-- 登录蒙版 -->
				<view v-if="!isLoggedIn" class="login-mask" @click="goToLogin">
					<!-- <text class="mask-text">请先登录后查看</text> -->
				</view>
			</view>
		</view>
	</view>
</template>

<script>
export default {
	data() {
		return {
			// 导航项
			navItems: [
				{ icon: 'folder', text: '已领任务', type: 'received', color: '#409EFF' },
				{ icon: 'staff', text: '发布任务', type: 'published', color: '#67C23A'},
				{ icon: 'calendar', text: '任务记录', type: 'history', color: '#E6A23C' },
			],
			
			// 任务数据
			taskData: [
				{ label: '发布任务', value: '...' },
				{ label: '完成任务', value: '...' },
				{ label: '累计金额', value: '...' },
				{ label: '任务评分', value: '...' }
			],

			// 圈子贡献
			circleData: [
				{ label: '发帖数', value: '...' },
				{ label: '评论数', value: '...' },
				{ label: '获赞数', value: '...' },
				{ label: '我的点赞', value: '...' }
			],
			
			// 活动数据
			activityData: [
				{ label: '发布活动', value: '...' },
				{ label: '参与活动', value: '...' }
			],

			// 登录状态相关
			isLoggedIn: false,
			userInfo: {},
		}
	},

	methods: {
		// 检查登录状态
		checkLoginStatus() {
			const token = uni.getStorageSync('uni_id_token')
			this.isLoggedIn = !!token
		},

		// 跳转到登录页面
		goToLogin() {
			uni.navigateTo({
				url: '/uni_modules/uni-id-pages/pages/login/login-withoutpwd'
			})
		},

		// 跳转到个人信息编辑页面
		goedituserinfo() {
			uni.navigateTo({
				url: "/uni_modules/uni-id-pages/pages/userinfo/userinfo"
			})
		},

		// 跳转到任务中心页面
		goToUserTask(type) {
			uni.navigateTo({
				url: `/pages/user/user-task/user-task?type=${type}`
			})
		},

		// 跳转到积分详情页面
		gopointsdetails() {
			uni.navigateTo({
				url: '/pages/user/user-pointsdetails/user-pointsdetails'
			})
		},

		// 跳转到信用等级页面
		gocreditdetails() {
			uni.navigateTo({
				url: "/pages/user/user-creditdetails/user-creditdetails"
			})
		},

		// 跳转到圈子贡献页面
		goToUserQuanzi() {
			if (!this.isLoggedIn) return; // 蒙版已覆盖，此处增加一层防护
			uni.navigateTo({
				url: '/pages/user/user-quanzi/user-quanzi'
			})
		},

		goToUserActivity() {
			if (!this.isLoggedIn) {
				// 蒙版已覆盖，此处为额外防护
				this.goToLogin();
				return;
			}
			uni.navigateTo({
				url: '/pages/user/user-activity/user-activity'
			});
		},

		async getActivityStats() {
			console.log('开始获取活动数据...');
			if (!this.userInfo || !this.userInfo._id) {
				console.log('获取活动数据中止：无用户信息。');
				return;
			}
			const db = uniCloud.database();
			const userId = this.userInfo._id;
		
			try {
				const [publishedRes, participatedRes] = await Promise.all([
					// 1. 发布活动数 (假设活动类型为 'activity')
					db.collection('add-content').where({ user_id: userId, content_type: 'activity' }).count(),
					// 2. 参与活动数
					db.collection('activity_participants').where({ user_id: userId }).count()
				]);
		
				const publishedCount = publishedRes.result ? publishedRes.result.total : 0;
				const participatedCount = participatedRes.result ? participatedRes.result.total : 0;
		
				console.log(`活动数据: 发布=${publishedCount}, 参与=${participatedCount}`);
		
				this.activityData = [
					{ label: '发布活动', value: publishedCount },
					{ label: '参与活动', value: participatedCount }
				];
		
			} catch (error) {
				console.error('获取活动数据失败：', error);
				this.activityData = [
					{ label: '发布活动', value: 'N/A' },
					{ label: '参与活动', value: 'N/A' }
				];
			}
		},

		async getCircleStats() {
			console.log('开始获取圈子贡献数据...');
			if (!this.userInfo || !this.userInfo._id) {
				console.log('获取圈子贡献数据中止：无用户信息。');
				return;
			}
			const db = uniCloud.database();
			const userId = this.userInfo._id;
		
			try {
				const [postsCountRes, commentsCountRes, userLikesCountRes, receivedLikesRes] = await Promise.all([
					// 1. 发帖数
					db.collection('add-content').where({ user_id: userId, status: 'published', content_type: 'post' }).count(),
					// 2. 评论数
					db.collection('user-comment').where(`user_id == "${userId}"`).count(),
					// 3. 我的点赞数
					db.collection('user-likes').where({ user_id: userId }).count(),
					// 4. 获赞数
					db.collection('add-content').where({ user_id: userId, status: 'published' }).get()
				]);
		
				const postsCount = postsCountRes.result ? postsCountRes.result.total : 0;
				const commentsCount = commentsCountRes.result ? commentsCountRes.result.total : 0;
				const userLikesCount = userLikesCountRes.result ? userLikesCountRes.result.total : 0;
				
				let receivedLikesCount = 0;
				if (receivedLikesRes.result && receivedLikesRes.result.data) {
					receivedLikesCount = receivedLikesRes.result.data.reduce((sum, post) => sum + (post.like_count || 0), 0);
				}
		
				console.log(`圈子数据: 发帖=${postsCount}, 评论=${commentsCount}, 获赞=${receivedLikesCount}, 点赞=${userLikesCount}`);
		
				this.circleData = [
					{ label: '发帖数', value: postsCount },
					{ label: '评论数', value: commentsCount },
					{ label: '获赞数', value: receivedLikesCount },
					{ label: '我的点赞', value: userLikesCount }
				];
		
			} catch (error) {
				console.error('获取圈子贡献数据失败：', error);
				// 保留默认值或显示错误提示
				this.circleData = [
					{ label: '发帖数', value: 'N/A' },
					{ label: '评论数', value: 'N/A' },
					{ label: '获赞数', value: 'N/A' },
					{ label: '我的点赞', value: 'N/A' }
				];
			}
		},

		// 获取用户信息
		getUserInfo() {
			const info = uni.getStorageSync('uni-id-pages-userInfo')
			this.userInfo = info && info._id ? {
				...info,
				score: 0, // 初始化为0，等待计算
				creditLevel: info.creditLevel || 'A级'
			} : {}
			
			// 如果用户已登录，获取积分明细
			if (this.isLoggedIn && this.userInfo._id) {
				this.getUserScore();
				this.getCircleStats();
				this.getActivityStats();
			}
		},

		// 获取用户积分明细并计算总积分
		async getUserScore() {
			try {
				const db = uniCloud.database()
				const scoreCollection = db.collection('user-score')
				
				if (!this.userInfo._id) {
					this.userInfo.score = 0
					return
				}
								
				const { result } = await scoreCollection
					.where({ user_id: this.userInfo._id })
					.get()
				
				if (!result || !result.data || !Array.isArray(result.data)) {
					this.userInfo.score = 0
					return
				}
				
				const scoreRecords = result.data
				
				const totalScore = scoreRecords.reduce((sum, record) => {
					const score = Number(record.score) || 0
					return sum + score
				}, 0)
				
				this.userInfo.score = totalScore
				
				const storedUserInfo = uni.getStorageSync('uni-id-pages-userInfo')
				if (storedUserInfo) {
					storedUserInfo.score = totalScore
					uni.setStorageSync('uni-id-pages-userInfo', storedUserInfo)
				}
				
			} catch (error) {
				console.error('获取积分明细失败：', error)
				this.userInfo.score = 0
				uni.showToast({
					title: '获取积分失败',
					icon: 'none'
				})
			}
		},

		goIndex() {
			uni.navigateTo({ url: '/pages/index/index' })
		},
		gocircle() {
			uni.navigateTo({ url: '/pages/circle/circle' })
		},
		gomessage() {
			uni.navigateTo({ url: '/pages/message/MessageCenter/MessageCenter' })
		},
	},

	onShow() {
		this.checkLoginStatus();
		this.getUserInfo();
	},
}
</script>

<style>
	:root {
		--primary-color: #409EFF;
		--primary-color-light: #79bbff;
		--bg-color: #F5F7FA;
		--card-bg-color: #FFFFFF;
		--text-color-primary: #303133;
		--text-color-regular: #606266;
		--text-color-secondary: #909399;
		--border-color: #E4E7ED;
	}
	
	.cursor-pointer {
		cursor: pointer;
	}

	.user-page-container {
		position: relative;
		min-height: 100vh;
		background-color: var(--bg-color);
		overflow: hidden;
	}

	.page-background {
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		height: 450rpx;
		background: linear-gradient(to bottom, var(--primary-color), var(--primary-color-light));
		border-bottom-left-radius: 50rpx;
		border-bottom-right-radius: 50rpx;
	}

	.bg-image {
		position: absolute;
		bottom: 0;
		width: 100%;
		opacity: 0.1;
	}

	.header-section {
		padding: 40rpx 30rpx;
		position: relative;
		z-index: 1;
	}

	/* 登录状态样式 */
	.user-card {
		display: flex;
		align-items: center;
		padding: 20rpx;
	}

	.user-card-avatar .avatar {
		width: 120rpx;
		height: 120rpx;
		border-radius: 50%;
		border: 4rpx solid rgba(255, 255, 255, 0.5);
	}
	
	.user-card-info {
		flex: 1;
		margin-left: 30rpx;
		color: #000000;
	}

	.user-name-line {
		display: flex;
		align-items: center;
		margin-bottom: 8rpx;
	}

	.user-name {
		font-size: 20px;
		font-weight: 500;
	}

	.edit-icon {
		margin-left: 16rpx;
		opacity: 0.8;
	}
	
	.user-meta {
		font-size: 13px;
		opacity: 0.9;
		background: rgba(0, 0, 0, 0.1);
		padding: 4rpx 12rpx;
		border-radius: 20rpx;
		display: inline-block;
	}
	
	.user-score-box {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		color: #000000;
		background: rgba(255, 255, 255, 0.15);
		border-radius: 20rpx;
		padding: 16rpx 24rpx;
	}
	
	.score-value {
		font-size: 18px;
		font-weight: 600;
	}
	
	.score-label {
		font-size: 12px;
		opacity: 0.9;
	}

	/* 未登录状态样式 */
	.not-login-container {
		display: flex;
		flex-direction: column;
		align-items: center;
		padding: 60rpx 0;
	}
	
	.default-avatar {
		width: 140rpx;
		height: 140rpx;
		border-radius: 50%;
		margin-bottom: 30rpx;
		background-color: #E9EEF3;
	}
	
	.login-btn {
		background: #FFFFFF;
		padding: 18rpx 80rpx;
		border-radius: 40rpx;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
		transition: all 0.2s ease;
	}
	
	.login-btn text {
		color: var(--primary-color);
		font-size: 16px;
		font-weight: 500;
	}
	
	.login-btn:active {
		transform: scale(0.98);
		box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
	}
	
	.content-wrapper {
		position: relative;
		z-index: 2;
		padding: 0 30rpx;
		margin-top: -60rpx; /* 使卡片上移，部分覆盖背景 */
	}

	.card-section {
		background-color: var(--card-bg-color);
		border-radius: 24rpx;
		margin-bottom: 24rpx;
		box-shadow: 0 8rpx 16rpx rgba(0, 0, 0, 0.04);
		overflow: hidden;
	}
	
	/* 导航区域 */
	.nav-section {
		display: flex;
		justify-content: space-around;
		padding: 30rpx 10rpx;
	}

	.nav-item {
		display: flex;
		flex-direction: column;
		align-items: center;
		width: 33.3%;
	}

	.nav-text {
		font-size: 14px;
		color: var(--text-color-regular);
		margin-top: 12rpx;
	}

	/* 数据卡片 */
	.stats-group {
		position: relative;
	}
	
	.data-card {
		padding: 30rpx;
	}

	.card-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 20rpx;
	}

	.card-title {
		font-size: 16px;
		font-weight: 600;
		color: var(--text-color-primary);
	}

	.data-grid {
		display: flex;
		flex-wrap: wrap;
		text-align: center;
	}

	.data-item {
		width: 25%;
		display: flex;
		flex-direction: column;
		align-items: center;
		padding: 20rpx 0;
	}
	
	.data-card.data-grid {
		justify-content: space-between;
	}
	
	.data-card .data-item {
		width: auto;
		flex-grow: 1;
	}
	
	/* 活动中心有两个项目，让它们平分 */
	.card-section:last-child .data-item {
		width: 50%;
	}

	.data-value {
		font-size: 20px;
		font-weight: 600;
		color: var(--text-color-primary);
		margin-bottom: 8rpx;
	}

	.data-label {
		font-size: 12px;
		color: var(--text-color-secondary);
	}

	.login-mask {
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background-color: rgba(255, 255, 255, 0.7);
		backdrop-filter: blur(6rpx);
		-webkit-backdrop-filter: blur(6rpx);
		z-index: 10;
		display: flex;
		justify-content: center;
		align-items: center;
		border-radius: 24rpx;
	}

	.mask-text {
		padding: 12rpx 24rpx;
		background-color: rgba(0, 0, 0, 0.05);
		border-radius: 100rpx;
		color: var(--text-color-regular);
		font-size: 14px;
	}

	.tab-bar {
		position: fixed;
		bottom: 0;
		left: 0;
		right: 0;
		height: 100rpx;
		background-color: #FFFFFF;
		border-top: 1px solid #E4E7ED;
		display: flex;
		justify-content: space-around;
		align-items: center;
	}

	.tab-item {
		display: flex;
		flex-direction: column;
		align-items: center;
		width: 25%;
	}

	.tab-item text {
		font-size: 12px;
		color: var(--text-color-secondary);
		margin-top: 4rpx;
	}

	.tab-item.active {
		color: var(--primary-color);
	}
</style>