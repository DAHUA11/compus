<template>
	<view class="container">
		<!-- 顶部导航栏 -->
		<view class="header">
			<view class="category-filter cursor-pointer">
				<view class="filter-text">全部分类</view>
				<uni-icons type="bottom" size="14" color="#333"></uni-icons>
			</view>
			<view class="search-box">
				<uni-icons type="search" size="18" color="#999"></uni-icons>
				<input type="text" placeholder="搜索任务" class="search-input" />
				<uni-icons type="mic" size="18" color="#999" class="voice-icon cursor-pointer"></uni-icons>
			</view>
			<view class="publish-btn cursor-pointer">
				<uni-icons type="plusempty" size="22" color="#FFFFFF"></uni-icons>
			</view>
		</view>
		<!-- 内容区域 -->
		<scroll-view scroll-y class="content-area" refresher-enabled @refresherrefresh="onRefresh"
			:refresher-triggered="isRefreshing">
			<!-- 轮播图 -->
			<view class="banner-section">
				<swiper class="banner-swiper" indicator-dots autoplay circular :interval="3000" :duration="500">
					<swiper-item v-for="(item, index) in bannerList" :key="index" class="cursor-pointer">
						<image :src="item.imageUrl" mode="aspectFill" class="banner-image"></image>
					</swiper-item>
				</swiper>
			</view>

			<!-- 智能推荐发布 -->
			<view class="quick-publish">
				<view class="quick-publish-left">
					<uni-icons type="notification" size="18" color="#3B7FF3"></uni-icons>
					<text>当前位置附近最热门: 外卖代拿</text>
				</view>
				<view class="quick-publish-btn cursor-pointer">
					<text>快速发布</text>
					<uni-icons type="plusempty" size="14" color="#FFFFFF"></uni-icons>
				</view>
			</view>
			<!-- 任务瀑布流 -->
			<view class="task-flow">
				<view class="flow-header">
					<text class="flow-title">任务大厅</text>
					<view class="flow-filter cursor-pointer">
						<text>智能排序</text>
						<uni-icons type="arrowdown" size="14" color="#999"></uni-icons>
					</view>
				</view>
				<view class="task-list">
					<view v-for="(item, index) in taskList" :key="index" class="task-card cursor-pointer">
						<view class="task-tag" :class="'task-tag-' + item.type">{{ item.typeText }}</view>
						<view class="task-content">
							<view class="task-header">
								<text class="task-title">{{ item.title }}</text>
								<view class="user-credit">
									<uni-icons :type="getCreditIcon(item.creditLevel)" size="14"
										:color="getCreditColor(item.creditLevel)"></uni-icons>
									<text
										:style="{ color: getCreditColor(item.creditLevel) }">{{ item.creditLevel }}</text>
								</view>
							</view>
							<view class="task-info">
								<text class="task-desc">{{ item.description }}</text>
								<view class="task-meta">
									<view class="task-time">
										<uni-icons type="calendar" size="14" color="#999"></uni-icons>
										<text>{{ item.timeLimit }}</text>
									</view>
									<view class="task-location" v-if="item.location">
										<uni-icons type="location" size="14" color="#999"></uni-icons>
										<text>{{ item.location }}</text>
									</view>
								</view>
							</view>
							<view class="task-footer">
								<view class="task-price">¥ {{ item.price }}</view>
								<view class="task-hint" v-if="item.hint">
									<text>{{ item.hint }}</text>
								</view>
							</view>
						</view>
					</view>
				</view>
			</view>
		</scroll-view>
		<!-- 底部导航栏 -->
		<view class="tab-bar">
			<view class="tab-item active cursor-pointer">
				<uni-icons type="home" size="24" color="#3B7FF3"></uni-icons>
				<text>任务大厅</text>
			</view>
			<view class="tab-item cursor-pointer" @click="gocircle">
				<uni-icons type="chat" size="24" color="#999"></uni-icons>
				<text>校园圈子</text>
			</view>
			<view class="tab-item cursor-pointer" @click="gomessage">
				<uni-icons type="notification" size="24" color="#999"></uni-icons>
				<text>消息</text>
			</view>
			<view class="tab-item cursor-pointer" @click="gouser">
				<uni-icons type="person" size="24" color="#999"></uni-icons>
				<text>我的</text>
			</view>
		</view>
	</view>
</template>
<script lang="ts" setup>
	import { ref } from 'vue';
	// 刷新状态
	const isRefreshing = ref(false);
	// 轮播图数据
	const bannerList = ref([
		{
			imageUrl: 'https://readdy.ai/api/search-image?query=Modern%20university%20campus%20scene%20with%20students%20walking%20and%20exchanging%20books%20and%20materials%2C%20bright%20daylight%2C%20vibrant%20atmosphere%2C%20school%20buildings%20in%20background%2C%20natural%20colors%2C%20photorealistic%20style%2C%20high%20quality%20details%2C%20showing%20student%20life%20and%20activities&width=686&height=386&seq=banner1&orientation=landscape'
		},
		{
			imageUrl: 'https://readdy.ai/api/search-image?query=Campus%20food%20delivery%20service%20illustration%20showing%20students%20receiving%20food%20packages%2C%20university%20cafeteria%20in%20background%2C%20sunny%20day%2C%20casual%20atmosphere%2C%20photorealistic%20style%2C%20showing%20convenience%20of%20food%20delivery%20on%20campus&width=686&height=386&seq=banner2&orientation=landscape'
		},
		{
			imageUrl: 'https://readdy.ai/api/search-image?query=Students%20exchanging%20study%20materials%20and%20textbooks%20in%20university%20library%2C%20bookshelves%20in%20background%2C%20warm%20lighting%2C%20academic%20atmosphere%2C%20photorealistic%20style%2C%20showing%20educational%20resource%20sharing&width=686&height=386&seq=banner3&orientation=landscape'
		}
	]);

	// 任务列表数据
	const taskList = ref([
		{
			type: 'delivery',
			typeText: '外卖代拿',
			title: '帮拿麦当劳早餐',
			description: '麦满分+热豆浆，送至9号宿舍楼，顺路即可',
			timeLimit: '今日 8:30前',
			location: '距离500m',
			price: '5.00',
			creditLevel: '钻石用户',
			hint: '3个顺路任务'
		},
		{
			type: 'buy',
			typeText: '求购',
			title: '收二手自行车',
			description: '需要一辆二手自行车代步，有变速最好，价格好商量',
			timeLimit: '3天内',
			price: '200.00',
			creditLevel: '金牌用户',
			hint: '比市场低30元'
		},
		{
			type: 'express',
			typeText: '快递代取',
			title: '帮取快递',
			description: '菜鸟驿站3个快递，不是很重，送至6号楼',
			timeLimit: '今日 18:00前',
			location: '距离300m',
			price: '8.00',
			creditLevel: '钻石用户'
		},
		{
			type: 'sell',
			typeText: '出物',
			title: '出闲置iPad 2020',
			description: '9成新iPad 2020款，128G，带笔和键盘，无磕碰',
			timeLimit: '长期有效',
			price: '2300.00',
			creditLevel: '银牌用户',
			hint: '比市场低500元'
		},
		{
			type: 'exchange',
			typeText: '交换',
			title: '考研资料交换',
			description: '有23考研数学全套资料，想换英语或专业课资料',
			timeLimit: '5天内',
			price: '0.00',
			creditLevel: '金牌用户'
		},
		{
			type: 'delivery',
			typeText: '外卖代拿',
			title: '食堂打包晚餐',
			description: '一食堂二楼的红烧肉饭+番茄蛋汤，送至4号楼',
			timeLimit: '今日 18:00前',
			location: '距离800m',
			price: '6.00',
			creditLevel: '银牌用户',
			hint: '2个顺路任务'
		}
	]);
	// 获取信用等级图标
	const getCreditIcon = (level : string) => {
		if (level.includes('钻石')) return 'star-filled';
		if (level.includes('金牌')) return 'medal';
		if (level.includes('银牌')) return 'medal-filled';
		return 'person-filled';
	};
	// 获取信用等级颜色
	const getCreditColor = (level : string) => {
		if (level.includes('钻石')) return '#3B7FF3';
		if (level.includes('金牌')) return '#FF9500';
		if (level.includes('银牌')) return '#8E8E93';
		return '#999999';
	};
	// 下拉刷新
	const onRefresh = () => {
		isRefreshing.value = true;
		setTimeout(() => {
			isRefreshing.value = false;
		}, 1000);
	}
	const gocircle = () =>{
		uni.navigateTo({
			url:"/pages/circle/circle"
		})
	}
	const gomessage = () =>{
		uni.navigateTo({
			url:"/pages/message/MessageCenter/MessageCenter"
		})
	}
	const gouser = () =>{
		uni.navigateTo({
			url:"/pages/user/user"
		})
	}
</script>
<style>
	page {
		height: 100%;
	}

	.cursor-pointer {
		cursor: pointer;
	}

	.container {
		display: flex;
		flex-direction: column;
		height: 100%;
		background-color: #F6F6F6;
	}

	/* 顶部导航栏 */
	.header {
		display: flex;
		align-items: center;
		padding: 20rpx 30rpx;
		background-color: #FFFFFF;
		box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
		position: relative;
		z-index: 10;
	}

	.category-filter {
		display: flex;
		align-items: center;
		margin-right: 20rpx;
	}

	.filter-text {
		font-size: 14px;
		font-weight: 500;
		margin-right: 6rpx;
	}

	.search-box {
		flex: 1;
		display: flex;
		align-items: center;
		background-color: #F5F5F5;
		border-radius: 36rpx;
		padding: 12rpx 24rpx;
		margin: 0 20rpx;
	}

	.search-input {
		flex: 1;
		height: 36rpx;
		font-size: 14px;
		margin: 0 16rpx;
		color: #333;
	}

	.voice-icon {
		margin-left: 10rpx;
	}

	.publish-btn {
		display: flex;
		justify-content: center;
		align-items: center;
		width: 70rpx;
		height: 70rpx;
		border-radius: 50%;
		background-color: #3B7FF3;
		box-shadow: 0 4px 8px rgba(59, 127, 243, 0.3);
	}

	/* 内容区域 */
	.content-area {
		flex: 1;
		overflow: auto;
	}

	/* 轮播图 */
	.banner-section {
		padding: 20rpx 30rpx;
		background-color: #FFFFFF;
	}

	.banner-swiper {
		height: 300rpx;
		border-radius: 16rpx;
		overflow: hidden;
	}

	.banner-image {
		width: 100%;
		height: 100%;
		border-radius: 16rpx;
	}

	/* 智能推荐发布 */
	.quick-publish {
		display: flex;
		justify-content: space-between;
		align-items: center;
		background-color: #EEF5FF;
		margin: 0 30rpx 20rpx;
		padding: 20rpx 24rpx;
		border-radius: 12rpx;
	}

	.quick-publish-left {
		display: flex;
		align-items: center;
	}

	.quick-publish-left text {
		font-size: 14px;
		color: #333;
		margin-left: 10rpx;
	}

	.quick-publish-btn {
		display: flex;
		align-items: center;
		background-color: #3B7FF3;
		border-radius: 30rpx;
		padding: 10rpx 20rpx;
	}

	.quick-publish-btn text {
		font-size: 12px;
		color: #FFFFFF;
		margin-right: 6rpx;
	}

	/* 任务瀑布流 */
	.task-flow {
		background-color: #FFFFFF;
		padding: 30rpx 30rpx 100rpx;
	}

	.flow-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 20rpx;
	}

	.flow-title {
		font-size: 16px;
		font-weight: bold;
		color: #333;
	}

	.flow-filter {
		display: flex;
		align-items: center;
		font-size: 12px;
		color: #999;
	}

	.task-list {
		display: flex;
		flex-direction: column;
		gap: 20rpx;
	}

	.task-card {
		position: relative;
		background-color: #FFFFFF;
		border-radius: 12rpx;
		padding: 24rpx;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
		border: 1px solid #EEEEEE;
	}

	.task-tag {
		position: absolute;
		top: 0;
		left: 24rpx;
		padding: 6rpx 16rpx;
		border-bottom-left-radius: 8rpx;
		border-bottom-right-radius: 8rpx;
		font-size: 12px;
		color: #FFFFFF;
		font-weight: 500;
	}

	.task-tag-delivery {
		background-color: #3B7FF3;
	}

	.task-tag-buy {
		background-color: #FF3B30;
	}

	.task-tag-express {
		background-color: #34C759;
	}

	.task-tag-sell {
		background-color: #FF9500;
	}

	.task-tag-exchange {
		background-color: #5856D6;
	}

	.task-content {
		margin-top: 30rpx;
	}

	.task-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 16rpx;
	}

	.task-title {
		font-size: 16px;
		font-weight: bold;
		color: #333;
	}

	.user-credit {
		display: flex;
		align-items: center;
		font-size: 12px;
	}

	.user-credit text {
		margin-left: 4rpx;
	}

	.task-info {
		margin-bottom: 20rpx;
	}

	.task-desc {
		font-size: 14px;
		color: #666;
		display: block;
		margin-bottom: 12rpx;
		line-height: 1.4;
	}

	.task-meta {
		display: flex;
		gap: 20rpx;
	}

	.task-time,
	.task-location {
		display: flex;
		align-items: center;
		font-size: 12px;
		color: #999;
	}

	.task-time text,
	.task-location text {
		margin-left: 6rpx;
	}

	.task-footer {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-top: 16rpx;
	}

	.task-price {
		font-size: 18px;
		font-weight: bold;
		color: #FF3B30;
	}

	.task-hint {
		background-color: #FFF2F2;
		border-radius: 6rpx;
		padding: 4rpx 10rpx;
	}

	.task-hint text {
		font-size: 12px;
		color: #FF3B30;
	}

	/* 底部导航栏 */
	.tab-bar {
		display: flex;
		justify-content: space-around;
		align-items: center;
		height: 100rpx;
		background-color: #FFFFFF;
		border-top: 1px solid #EEEEEE;
		padding-bottom: env(safe-area-inset-bottom);
	}

	.tab-item {
		display: flex;
		flex-direction: column;
		align-items: center;
		padding: 10rpx 0;
	}

	.tab-item text {
		font-size: 12px;
		color: #999;
		margin-top: 6rpx;
	}

	.tab-item.active text {
		color: #3B7FF3;
	}
</style>