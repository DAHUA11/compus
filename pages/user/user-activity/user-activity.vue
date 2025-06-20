<template>
	<view class="page-container">
		<!-- Tabs -->
		<view class="tabs-container">
			<view class="tabs">
				<view class="tab-item" :class="{ active: currentTab === 0 }" @click="switchTab(0)">
					我发布的
				</view>
				<view class="tab-item" :class="{ active: currentTab === 1 }" @click="switchTab(1)">
					我参与的
				</view>
			</view>
		</view>

		<!-- Content -->
		<swiper class="swiper" :current="currentTab" @change="swiperChange">
			<!-- 我发布的 -->
			<swiper-item class="swiper-item">
				<scroll-view scroll-y class="scroll-view">
					<view v-if="publishedActivities.length > 0" class="activity-list">
						<UserActivityCard v-for="activity in publishedActivities" :key="activity._id" :activity="activity" @click="goToDetail(activity._id)" />
					</view>
					<view v-else-if="!isLoading" class="empty-state">
						<uni-icons type="folder" size="60" color="#C8C9CC"></uni-icons>
						<text class="empty-text">您还没有发布任何活动哦</text>
					</view>
					<view v-else class="activity-list">
						<!-- 骨架屏占位 -->
						<UserActivityCard v-for="i in 3" :key="i" />
					</view>
				</scroll-view>
			</swiper-item>
			
			<!-- 我参与的 -->
			<swiper-item class="swiper-item">
				<scroll-view scroll-y class="scroll-view">
					<view v-if="participatedActivities.length > 0" class="activity-list">
						<UserActivityCard v-for="activity in participatedActivities" :key="activity._id" :activity="activity" @click="goToDetail(activity._id)" />
					</view>
					<view v-else-if="!isLoading" class="empty-state">
						<uni-icons type="paperplane" size="60" color="#C8C9CC"></uni-icons>
						<text class="empty-text">您还没有参与任何活动哦</text>
					</view>
					<view v-else class="activity-list">
						<!-- 骨架屏占位 -->
						<UserActivityCard v-for="i in 3" :key="i" />
					</view>
				</scroll-view>
			</swiper-item>
		</swiper>
	</view>
</template>

<script>
	import UserActivityCard from '@/components/circle/UserActivityCard.vue';

	export default {
		components: {
			UserActivityCard
		},
		data() {
			return {
				currentTab: 0,
				publishedActivities: [],
				participatedActivities: [],
				isLoading: true,
				userInfo: null,
			};
		},
		onLoad() {
			this.userInfo = uni.getStorageSync('uni-id-pages-userInfo');
			if (this.userInfo && this.userInfo._id) {
				this.loadData();
			} else {
				uni.showToast({
					title: '请先登录',
					icon: 'none'
				});
				// 自动返回上一页
				setTimeout(() => uni.navigateBack(), 1500);
			}
		},
		methods: {
			switchTab(index) {
				if (this.currentTab !== index) {
					this.currentTab = index;
				}
			},
			swiperChange(e) {
				this.currentTab = e.detail.current;
			},
			async loadData() {
				this.isLoading = true;
				try {
					await Promise.all([
						this.fetchPublishedActivities(),
						this.fetchParticipatedActivities()
					]);
				} catch(e) {
					console.error("加载数据失败", e)
					uni.showToast({
						title:"数据加载失败",
						icon: 'none'
					})
				} finally {
					this.isLoading = false;
				}
			},
			async fetchPublishedActivities() {
				const db = uniCloud.database();
				try {
					const res = await db.collection('add-content')
						.where({
							user_id: this.userInfo._id,
							content_type: 'activity'
						})
						.orderBy('create_time', 'desc')
						.get();
					// 手动将当前用户信息附加到每个活动上
					this.publishedActivities = res.result.data.map(activity => {
						return { ...activity, user_info: this.userInfo };
					});
				} catch (error) {
					console.error("获取已发布活动失败:", error)
				}
			},
			async fetchParticipatedActivities() {
				const db = uniCloud.database();
				try {
					// 1. 获取当前用户参与的所有活动的ID
					const participantsRes = await db.collection('activity_participants')
						.where({ user_id: this.userInfo._id })
						.field('activity_id')
						.get()
			
					if (participantsRes.result.data.length === 0) {
						this.participatedActivities = [];
						return
					}
			
					const activityIds = participantsRes.result.data.map(item => item.activity_id);
			
					// 2. 根据活动ID查询所有活动详情
					const activitiesRes = await db.collection('add-content')
						.where({
							_id: db.command.in(activityIds)
						})
						.orderBy('create_time', 'desc')
						.get()
						
					let activities = activitiesRes.result.data;
					
					if (activities.length === 0) {
						this.participatedActivities = activities;
						return;
					}
					
					// 3. 提取所有发布者的ID
					const publisherIds = [...new Set(activities.map(act => act.user_id))];
					
					// 4. 一次性查询所有发布者的信息
					const usersRes = await db.collection('uni-id-users')
						.where({ _id: db.command.in(publisherIds) })
						.field('_id, nickname, avatar_file')
						.get();
						
					const usersMap = new Map(usersRes.result.data.map(user => [user._id, user]));
					
					// 5. 将用户信息映射回活动列表
					this.participatedActivities = activities.map(activity => {
						return {
							...activity,
							user_info: usersMap.get(activity.user_id) || null
						}
					})

				} catch (error) {
					console.error("获取已参与活动失败:", error);
					this.participatedActivities = []; // 出错时清空
				}
			},
			goToDetail(id) {
				uni.navigateTo({
					url: `/pages/circle/activity-datail/activity-datail?id=${id}`
				})
			}
		}
	};
</script>

<style>
	page {
		background-color: #F5F6FA;
		height: 100%;
	}
	
	.page-container {
		display: flex;
		flex-direction: column;
		height: 100%;
	}
	
	.tabs-container {
		background-color: #FFFFFF;
		padding: 0 20rpx;
		border-bottom: 1rpx solid #EBEEF5;
	}

	.tabs {
		display: flex;
		justify-content: space-around;
		height: 88rpx;
	}

	.tab-item {
		display: flex;
		align-items: center;
		justify-content: center;
		height: 100%;
		font-size: 15px;
		color: #606266;
		position: relative;
		transition: color 0.3s;
	}

	.tab-item.active {
		color: #409EFF;
		font-weight: 500;
	}

	.tab-item.active::after {
		content: '';
		position: absolute;
		bottom: 0;
		left: 50%;
		transform: translateX(-50%);
		width: 60rpx;
		height: 6rpx;
		background-color: #409EFF;
		border-radius: 3rpx;
	}

	.swiper {
		flex: 1;
	}

	.swiper-item,
	.scroll-view {
		height: 100%;
	}

	.activity-list {
		padding: 20rpx;
	}
	
	.empty-state {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		height: 100%;
		color: #909399;
	}
	
	.empty-text {
		margin-top: 20rpx;
		font-size: 14px;
	}
</style>
