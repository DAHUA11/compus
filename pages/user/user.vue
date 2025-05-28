<template>
	<view class="page">
		<!-- 顶部个人信息区域 -->
		<view class="user-profile">
			<view class="user-info">
				<view class="user-name-container">
					<text class="user-name">臭屁王</text>
					<uni-icons type="compose" size="16" color="#4080FF" class="edit-icon cursor-pointer"></uni-icons>
				</view>
				<text class="storage-info">积分余额: 2580分</text>
				<view class="progress-container">
					<view class="progress-bar">
						<view class="progress-inner" style="width: 60%;"></view>
					</view>
					<text class="credit-level">信用等级: 钻石</text>
				</view>
			</view>
			<view class="avatar-container cursor-pointer">
				<image class="avatar" :src="avatarUrl" mode="aspectFill"></image>
				<view class="edit-avatar">
					<uni-icons type="compose" size="16" color="#FFFFFF"></uni-icons>
				</view>
			</view>
		</view>
		<!-- 功能导航区 -->
		<view class="nav-section">
			<view class="nav-item cursor-pointer" v-for="(item, index) in navItems" :key="index">
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
		<!-- 功能区域 -->
		<view class="feature-section">
			<view class="feature-item cursor-pointer" v-for="(item, index) in featureItems" :key="index">
				<view class="feature-icon">
					<image class="feature-image" :src="item.imageUrl" mode="aspectFill"></image>
				</view>
				<text class="feature-text">{{ item.text }}</text>
			</view>
		</view>
		<!-- 设置项 -->
		<view class="settings-section">
			<view class="setting-item cursor-pointer">
				<text class="setting-text">深色模式</text>
				<switch :checked="isDarkMode" @change="toggleDarkMode" color="#4080FF" />
			</view>
			<view class="setting-item cursor-pointer" v-for="(item, index) in settingItems" :key="index">
				<text class="setting-text">{{ item.text }}</text>
				<uni-icons type="right" size="16" color="#C8C9CC"></uni-icons>
			</view>
		</view>
	</view>
</template>
<script lang="ts" setup>
	import { ref } from 'vue';
	// 用户头像
	const avatarUrl = ref('https://readdy.ai/api/search-image?query=Professional%20avatar%20icon%20with%20minimalist%20design%2C%20simple%20circular%20shape%2C%20light%20blue%20accent%20color%2C%20clean%20white%20background%2C%20modern%20aesthetic%2C%20subtle%20gradient%2C%20high%20quality%20digital%20illustration%2C%20centered%20composition%2C%20professional%20look&width=200&height=200&seq=avatar001&orientation=squarish');
	// 导航项
	const navItems = ref([
		{ icon: 'folder', text: '已领任务' },
		{ icon: 'staff', text: '发布任务' },
		{ icon: 'calendar', text: '任务记录' },
		{ icon: 'star', text: '收藏任务' }
	]);
	// 任务数据
	const taskData = ref([
		{ label: '发布任务', value: '32' },
		{ label: '完成任务', value: '48' },
		{ label: '累计金额', value: '¥1280' },
		{ label: '任务评分', value: '4.8' }
	]);
	// 圈子贡献
	const circleData = ref([
		{ label: '发帖数', value: '56' },
		{ label: '评论数', value: '128' },
		{ label: '获赞数', value: '320' },
		{ label: '活跃度', value: '85%' }
	]);
	// 功能项
	const featureItems = ref([
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
	]);
	// 设置项
	const settingItems = ref([
		{ text: '设置中心' },
		{ text: '账号与安全' },
		{ text: '通知设置' },
		{ text: '隐私设置' },
		{ text: '帮助反馈' }
	]);
	// 深色模式
	const isDarkMode = ref(false);
	// 切换深色模式
	const toggleDarkMode = (e : any) => {
		isDarkMode.value = e.detail.value;
	};
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

	.edit-icon {
		width: 16px;
		height: 16px;
		opacity: 0.8;
		transition: opacity 0.3s;
	}

	.edit-icon:hover {
		opacity: 1;
	}

	.storage-info {
		font-size: 15px;
		color: #4080FF;
		margin-bottom: 24rpx;
		display: inline-block;
		padding: 6rpx 16rpx;
		background: rgba(64, 128, 255, 0.1);
		border-radius: 20rpx;
	}

	.progress-container {
		margin-top: 16rpx;
	}

	.progress-bar {
		height: 8rpx;
		background-color: rgba(64, 128, 255, 0.1);
		border-radius: 20rpx;
		overflow: hidden;
		margin-bottom: 12rpx;
	}

	.progress-inner {
		height: 100%;
		background: linear-gradient(to right, #4080FF, #60A9FF);
		border-radius: 20rpx;
		transition: width 0.3s ease;
	}

	.credit-level {
		font-size: 13px;
		color: #666666;
		display: flex;
		align-items: center;
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

	.edit-avatar {
		position: absolute;
		right: 0;
		bottom: 0;
		width: 44rpx;
		height: 44rpx;
		background: linear-gradient(135deg, #4080FF, #60A9FF);
		border-radius: 50%;
		display: flex;
		justify-content: center;
		align-items: center;
		box-shadow: 0 2px 6px rgba(64, 128, 255, 0.3);
		transition: transform 0.3s ease;
	}

	.edit-avatar:hover {
		transform: scale(1.1);
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

	/* 功能区域 */
	.feature-section {
		display: flex;
		flex-wrap: wrap;
		background-color: #FFFFFF;
		border-radius: 16rpx;
		padding: 30rpx;
		margin-bottom: 30rpx;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
	}

	.feature-item {
		width: 25%;
		display: flex;
		flex-direction: column;
		align-items: center;
		margin-bottom: 20rpx;
	}

	.feature-icon {
		width: 80rpx;
		height: 80rpx;
		margin-bottom: 10rpx;
	}

	.feature-image {
		width: 100%;
		height: 100%;
		border-radius: 16rpx;
	}

	.feature-text {
		font-size: 14px;
		color: #333333;
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
</style>