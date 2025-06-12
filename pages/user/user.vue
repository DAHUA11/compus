<template>
	<view class="page">
		<!-- 顶部个人信息区域 -->
		<template v-if="isLoggedIn">
			<view class="user-card">
				<view class="user-card-info">
					<view style="display: flex; align-items: center;">
						<text class="user-card-title">{{ userInfo.username || userInfo.nickname || '未设置昵称' }}的任务中心</text>
						<uni-icons  @click="goedituserinfo" type="compose" size="16" color="#4080FF" class="edit-icon" />
					</view>
					<view class="user-card-score" @click="gopointsdetails">积分余额: {{ userInfo.score || 0 }}分</view>
					<view class="user-card-progress">
						<view class="progress-bar-bg">
							<view class="progress-bar" :style="{ width: ((userInfo.score || 0) / 3000 * 100) + '%' }"></view>
						</view>
					</view>
					<view class="user-card-credit" @click="gocreditdetails">信用等级: {{ userInfo.creditLevel || 'A级' }}</view>
				</view>
				<view class="user-card-avatar" @click="goedituserinfo">
					<image class="avatar" :src="userInfo.avatar_file && userInfo.avatar_file.url ? userInfo.avatar_file.url : defaultAvatarUrl" mode="aspectFill"></image>
					<uni-icons type="compose" size="18" color="#4080FF" class="avatar-edit-icon" />
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
		<!-- 功能导航区 -->
		<view class="nav-section" v-if="isLoggedIn">
			<view
				class="nav-item cursor-pointer"
				v-for="(item, index) in navItems"
				:key="index"
				@click="goToUserTask(item.type)"
			>
				<uni-icons :type="item.icon" size="24" color="#4080FF"></uni-icons>
				<text class="nav-text">{{ item.text }}</text>
			</view>
		</view>
		<!-- 任务数据统计 -->
		<view class="data-card">
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
		<view class="data-card">
			<view class="card-header">
				<text class="card-title">圈子贡献</text>
			</view>
			<view class="data-grid">
				<view class="data-item" v-for="(item, index) in circleData" :key="index">
					<text class="data-value">{{ item.value }}</text>
					<text class="data-label">{{ item.label }}</text>
				</view>
			</view>
		</view>
		<!-- 设置项 -->
		<view class="settings-section">
			<view class="setting-item cursor-pointer" v-for="(item, index) in settingItems" :key="index">
				<text class="setting-text">{{ item.text }}</text>
				<uni-icons type="right" size="16" color="#C8C9CC"></uni-icons>
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
				{ icon: 'folder', text: '已领任务', type: 'received' },
				{ icon: 'staff', text: '发布任务', type: 'published' },
				{ icon: 'calendar', text: '任务记录', type: 'history' },
			],
			
			// 任务数据
			taskData: [
				{ label: '发布任务', value: '32' },
				{ label: '完成任务', value: '48' },
				{ label: '累计金额', value: '¥1280' },
				{ label: '任务评分', value: '4.8' }
			],

			// 圈子贡献
			circleData: [
				{ label: '发帖数', value: '56' },
				{ label: '评论数', value: '128' },
				{ label: '获赞数', value: '320' },
				{ label: '活跃度', value: '85%' }
			],

			// 功能项
			featureItems: [
				{
					text: '积分明细',
					imageUrl: 'https://readdy.ai/api/search-image?query=icon%2C%203D%20cartoon%2C%20Points%20or%20coins%20icon%2C%20subject%20fills%2080%20percent%20of%20frame%2C%20vibrant%20colors%20with%20soft%20gradients%2C%20minimalist%20design%2C%20smooth%20rounded%20shapes%2C%20subtle%20shading%2C%20no%20outlines%2C%20centered%20composition%2C%20isolated%20on%20white%20background%2C%20playful%20and%20friendly%20aesthetic%2C%20isometric%20perspective%2C%20high%20detail%20quality%2C%20clean%20and%20modern%20look%2C%20single%20object%20focus&width=100&height=100&seq=feature001&orientation=squarish'
				},
				{
					text: '数据同步',
					imageUrl: 'https://readdy.ai/api/search-image?query=icon%2C%203D%20cartoon%2C%20Cloud%20sync%20icon%2C%20subject%20fills%2080%20percent%20of%20frame%2C%20vibrant%20colors%20with%20soft%20gradients%2C%20minimalist%20design%2C%20smooth%20rounded%20shapes%2C%20subtle%20shading%2C%20no%20outlines%2C%20centered%20composition%2C%20isolated%20on%20white%20background%2C%20playful%20and%20friendly%20aesthetic%2C%20isometric%20perspective%2C%20high%20detail%20quality%2C%20clean%20and%20modern%20look%2C%20single%20object%20focus&width=100&height=100&seq=feature002&orientation=squarish'
				},
				{
					text: '任务管理',
					imageUrl: 'https://readdy.ai/api/search-image?query=icon%2C%203D%20cartoon%2C%20Task%20management%20checklist%2C%20subject%20fills%2080%20percent%20of%20frame%2C%20vibrant%20colors%20with%20soft%20gradients%2C%20minimalist%20design%2C%20smooth%20rounded%20shapes%2C%20subtle%20shading%2C%20no%20outlines%2C%20centered%20composition%2C%20isolated%20on%20white%20background%2C%20playful%20and%20friendly%20aesthetic%2C%20isometric%20perspective%2C%20high%20detail%20quality%2C%20clean%20and%20modern%20look%2C%20single%20object%20focus&width=100&height=100&seq=feature003&orientation=squarish'
				},
				{
					text: '圈子中心',
					imageUrl: 'https://readdy.ai/api/search-image?query=icon%2C%203D%20cartoon%2C%20Community%20or%20social%20network%20icon%2C%20subject%20fills%2080%20percent%20of%20frame%2C%20vibrant%20colors%20with%20soft%20gradients%2C%20minimalist%20design%2C%20smooth%20rounded%20shapes%2C%20subtle%20shading%2C%20no%20outlines%2C%20centered%20composition%2C%20isolated%20on%20white%20background%2C%20playful%20and%20friendly%20aesthetic%2C%20isometric%20perspective%2C%20high%20detail%20quality%2C%20clean%20and%20modern%20look%2C%20single%20object%20focus&width=100&height=100&seq=feature004&orientation=squarish'
				}
			],

			// 设置项
			settingItems: [
				{ text: '设置中心' },
				{ text: '账号与安全' },
				{ text: '通知设置' },
				{ text: '隐私设置' },
				{ text: '帮助反馈' }
			],
			// 登录状态相关
			isLoggedIn: false,
			userInfo: {},
			// defaultAvatarUrl: '/static/default-avatar.png'
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
				this.getUserScore()
			}
		},

		// 获取用户积分明细并计算总积分
		async getUserScore() {
			try {
				const db = uniCloud.database()
				const scoreCollection = db.collection('user-score')
				
				// 检查用户ID
				if (!this.userInfo._id) {
					console.log('用户未登录或ID不存在')
					this.userInfo.score = 0
					return
				}
				
				console.log('正在查询用户积分，用户ID:', this.userInfo._id)
				
				// 获取用户的所有积分记录
				const { result } = await scoreCollection
					.where({
						user_id: this.userInfo._id
					})
					.orderBy('create_time', 'desc')
					.get()
				
				console.log('查询结果:', result)
				
				// 验证数据
				if (!result || !result.data || !Array.isArray(result.data)) {
					console.log('未找到积分记录或数据格式不正确')
					this.userInfo.score = 0
					return
				}
				
				const scoreRecords = result.data
				console.log('积分记录:', scoreRecords)
				
				// 计算总积分
				const totalScore = scoreRecords.reduce((sum, record) => {
					// 确保record.score是数字
					const score = Number(record.score) || 0
					console.log('当前记录积分:', score, '记录类型:', record.type)
					return sum + score
				}, 0)
				
				console.log('计算得到的总积分:', totalScore)
				
				// 更新用户信息中的积分
				this.userInfo.score = totalScore
				
				// 更新本地存储中的用户信息
				const storedUserInfo = uni.getStorageSync('uni-id-pages-userInfo')
				if (storedUserInfo) {
					storedUserInfo.score = totalScore
					uni.setStorageSync('uni-id-pages-userInfo', storedUserInfo)
				}
				
			} catch (error) {
				console.error('获取积分明细失败：', error)
				// 发生错误时设置积分为0
				this.userInfo.score = 0
				uni.showToast({
					title: '获取积分失败',
					icon: 'none'
				})
			}
		}
	},

	// 生命周期钩子
	mounted() {
		this.checkLoginStatus()
		this.getUserInfo()
	},

	// 页面显示时触发（uni-app页面生命周期）
	onShow() {
		this.getUserInfo()
	},

	// 组件卸载时取消事件监听（避免内存泄漏）
	beforeDestroy() {
		if (uni.$off) {
			uni.$off('refreshUserInfo', this.getUserInfo)
		}
	},

	// 组件创建完成时监听全局事件
	created() {
		if (uni.$on) {
			uni.$on('refreshUserInfo', this.getUserInfo)
		}
	}
}
</script>

<style>
	page {
		height: 100%;
		background-color: #F5F6FA;
	}

	.page {
		padding: 20rpx;
		box-sizing: border-box;
	}

	.cursor-pointer {
		cursor: pointer;
	}

	/* 用户信息区域 */
	.user-profile {
		display: flex;
		justify-content: space-between;
		align-items: center;
		background: linear-gradient(to right, rgba(255, 255, 255, 0.9), rgba(255, 255, 255, 0.95));
		backdrop-filter: blur(10px);
		/* border-radius: 24rpx; */
		padding: 40rpx;
		margin-bottom: 40rpx;
		box-shadow: 0 4px 16px rgba(0, 0, 0, 0.03);
	}

	.user-info {
		flex: 1;
		margin-right: 40rpx;
	}

	.user-name-container {
		display: flex;
		align-items: center;
		margin-bottom: 16rpx;
	}

	.user-name {
		font-size: 20px;
		font-weight: 500;
		color: #1A1A1A;
		margin-right: 16rpx;
		letter-spacing: 0.2px;
	}

	.avatar-container {
		position: relative;
		width: 140rpx;
		height: 140rpx;
		flex-shrink: 0;
	}

	.avatar {
		width: 140rpx;
		height: 140rpx;
		border-radius: 50%;
		border: 3rpx solid rgba(64, 128, 255, 0.2);
		transition: transform 0.3s ease;
	}

	.avatar:hover {
		transform: scale(1.02);
	}

	/* 导航区域 */
	.nav-section {
		display: flex;
		justify-content: space-between;
		background-color: #FFFFFF;
		border-radius: 16rpx;
		padding: 30rpx;
		margin-bottom: 30rpx;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
	}

	.nav-item {
		display: flex;
		flex-direction: column;
		align-items: center;
		width: 25%;
	}

	.nav-text {
		font-size: 14px;
		color: #333333;
		margin-top: 10rpx;
	}

	/* 数据卡片 */
	.data-card {
		background-color: #FFFFFF;
		border-radius: 16rpx;
		padding: 30rpx;
		margin-bottom: 30rpx;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
	}

	.card-header {
		margin-bottom: 20rpx;
	}

	.card-title {
		font-size: 16px;
		font-weight: 600;
		color: #333333;
	}

	.data-grid {
		display: flex;
		flex-wrap: wrap;
	}

	.data-item {
		width: 25%;
		display: flex;
		flex-direction: column;
		align-items: center;
		margin-bottom: 10rpx;
	}

	.data-value {
		font-size: 18px;
		font-weight: 600;
		color: #4080FF;
		margin-bottom: 6rpx;
	}

	.data-label {
		font-size: 12px;
		color: #666666;
	}

	/* 设置区域 */
	.settings-section {
		background-color: #FFFFFF;
		border-radius: 16rpx;
		padding: 10rpx 30rpx;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
	}

	.setting-item {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 30rpx 0;
		border-bottom: 1rpx solid #F5F6FA;
	}

	.setting-item:last-child {
		border-bottom: none;
	}

	.setting-text {
		font-size: 16px;
		color: #333333;
	}

	/* 未登录状态样式 */
	.not-login-container {
		display: flex;
		flex-direction: column;
		align-items: center;
		width: 100%;
		padding: 40rpx 0;
	}
	
	.default-avatar {
		width: 140rpx;
		height: 140rpx;
		border-radius: 50%;
		margin-bottom: 30rpx;
		background-color: #F5F6FA;
	}
	
	.login-btn {
		background: linear-gradient(to right, #4080FF, #60A9FF);
		padding: 20rpx 60rpx;
		border-radius: 40rpx;
		box-shadow: 0 4px 12px rgba(64, 128, 255, 0.2);
		transition: transform 0.3s ease;
	}
	
	.login-btn text {
		color: #FFFFFF;
		font-size: 16px;
		font-weight: 500;
	}
	
	.login-btn:active {
		transform: scale(0.98);
	}

	/* 用户卡片 */
	.user-card {
		display: flex;
		justify-content: space-between;
		align-items: center;
		background: #fff;
		border-radius: 16rpx;
		box-shadow: 0 2px 8px rgba(0,0,0,0.06);
		padding: 32rpx;
		margin-bottom: 32rpx;
		position: relative;
	}
	.user-card-info {
		flex: 1;
	}
	.user-card-title {
		font-size: 18px;
		font-weight: 600;
		color: #222;
		margin-bottom: 12rpx;
	}
	.edit-icon {
		margin-left: 8rpx;
		vertical-align: middle;
	}
	.user-card-score {
		font-size: 15px;
		color: #666;
		margin-bottom: 8rpx;
	}
	.user-card-progress {
		margin-bottom: 8rpx;
	}
	.progress-bar-bg {
		width: 200rpx;
		height: 10rpx;
		background: #f0f0f0;
		border-radius: 5rpx;
		overflow: hidden;
	}
	.progress-bar {
		height: 100%;
		background: linear-gradient(90deg, #4080FF, #60A9FF);
		border-radius: 5rpx;
	}
	.user-card-credit {
		font-size: 14px;
		color: #888;
	}
	.user-card-avatar {
		position: relative;
		width: 90rpx;
		height: 90rpx;
		margin-left: 24rpx;
	}
	.user-card-avatar .avatar {
		width: 90rpx;
		height: 90rpx;
		border-radius: 50%;
		border: 2rpx solid #e0e6f6;
	}
	.avatar-edit-icon {
		position: absolute;
		right: 0;
		bottom: 0;
		background: #fff;
		border-radius: 50%;
		box-shadow: 0 2px 6px rgba(64,128,255,0.12);
	}
</style>