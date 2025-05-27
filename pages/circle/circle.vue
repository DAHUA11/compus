<template>
	<view class="circle-container">
		<!-- 搜索框 -->
		<view class="search-bar">
			<view class="search-input-wrapper">
				<text class="iconfont icon-icon_search search-icon"></text>
				<input class="search-input" placeholder="请输入搜索内容" />
			</view>
		</view>
		<!-- 顶部大图+分类叠加 -->
		<view class="banner-wrapper">
			<image class="banner-image" src="/static/images/circlebanner.png" mode="aspectFill"></image>
			<view class="banner-bottom-gradient"></view>
			<view class="category-nav-abs">
				<scroll-view scroll-x="true" show-scrollbar="false" class="category-scroll">
					<view class="category-list">
						<view 
							v-for="(item, index) in categories" 
							:key="index" 
							:id="'category-' + index"
							class="category-container"
						>
							<category-item
								:name="item.name"
								:icon-img="item.iconImg"
								:is-active="activeCategory === index"
								@switch="switchCategory(index)"
							/>
						</view>
					</view>
				</scroll-view>
			</view>
		</view>
		<view class="main-content">
			<!-- 专题活动 -->
			<view class="section bg-white mt-base p-base rounded">
				<view class="section-header flex-between mb-sm">
					<view class="section-title flex items-center font-bold text-lg">
						<view class="icon-wrapper bg-gradient-warning">
							<text class="iconfont icon-huodong text-white"></text>
						</view>
						<text class="text-dark">专题活动</text>
					</view>
					<view class="more text-primary text-sm flex items-center" @tap="viewAllActivities">
						<text>查看全部</text>
						<text class="iconfont icon-gengduo ml-xs"></text>
					</view>
				</view>
				<scroll-view class="activity-scroll" scroll-x="true" show-scrollbar="false">
					<view class="activity-list">
						<activity-card 
							v-for="(item, index) in activities" 
							:key="index"
							:activity="item"
							@view-detail="viewActivityDetail"
							@join="joinActivity"
						></activity-card>
					</view>
				</scroll-view>
			</view>
			
			<!-- 置顶与推广内容 -->
			<view class="pinned-section bg-white mt-base p-base rounded">
				<view class="section-header flex-between mb-sm pinned-header">
					<view class="section-title flex items-center font-bold text-lg">
						<view class="icon-wrapper pinned-gradient">
							<text class="iconfont icon-zhiding text-white"></text>
						</view>
						<text class="pinned-title">置顶与推广</text>
						<view class="pinned-badge ml-xs">2</view>
					</view>
				</view>
				
				<!-- 置顶内容1 -->
				<pinned-card 
					:post="pinnedPosts[0]" 
					@view-detail="viewPinnedDetail"
				></pinned-card>
				
				<!-- 置顶内容2 -->
				<pinned-card 
					:post="pinnedPosts[1]" 
					@view-detail="viewPinnedDetail"
				></pinned-card>
			</view>
			
			<!-- 动态列表 -->
			<view class="post-section bg-white mt-base p-base rounded">
				<view class="section-header flex-between mb-sm">
					<view class="section-title flex items-center font-bold text-lg">
						<view class="icon-wrapper bg-gradient-primary">
							<text class="iconfont icon-wenda text-white"></text>
						</view>
						<text class="text-dark">最新动态</text>
					</view>
					<view class="filter-tabs">
						<text 
							v-for="(tab, index) in filterTabs" 
							:key="index" 
							class="filter-tab" 
							:class="{ active: activeTab === index }"
							@tap="switchTab(index)"
						>{{ tab }}</text>
					</view>
				</view>
				
				<!-- 空状态显示 -->
				<view class="empty-state" v-if="posts.length === 0 && !loading">
					<text class="iconfont icon-empty empty-icon"></text>
					<view class="empty-text">暂无内容</view>
					<button class="btn btn-outline mt-base clickable-mp" @tap="onRefresh">
						<text class="iconfont icon-shijian mr-xs"></text>刷新试试
					</button>
				</view>
				
				<view class="post-list" v-else>
					<post-card 
						v-for="(post, index) in posts" 
						:key="index"
						:post="post"
						@view-detail="viewPostDetail"
						@like="likePost($event, index)"
						@comment="commentPost"
						@share="sharePost"
					></post-card>
				</view>
				
				<!-- 加载状态 -->
				<view class="loading" v-if="loading">
					<text class="iconfont icon-loading loading-icon"></text>
					<text class="text-sm text-gray">加载中...</text>
				</view>
				<view class="empty-state" v-if="noMore && posts.length > 0">
					<text class="text-sm text-gray">没有更多内容了</text>
				</view>
			</view>
		</view>
		
		<!-- 悬浮按钮 -->
		<view class="float-btn flex-center" @tap="createPost">
			<text class="iconfont icon-bianji"></text>
		</view>
	</view>
</template>

<script>
import ActivityCard from '@/components/circle/ActivityCard.vue';
import PostCard from '@/components/circle/PostCard.vue';
import PinnedCard from '@/components/circle/PinnedCard.vue';
import CategoryItem from '@/components/circle/CategoryItem.vue';

export default {
	components: {
		ActivityCard,
		PostCard,
		PinnedCard,
		CategoryItem
	},
	data() {
		return {
			refreshing: false,
			loading: false,
			noMore: false,
			page: 1,
			activeCategory: 0,
			activeTab: 0,
			categories: [
				{ name: '推荐', iconImg: '/static/images/cat1.jpg' },
				{ name: '热门活动', iconImg: '/static/images/cat2.jpg' },
				{ name: '校园问答', iconImg: '/static/images/cat3.jpg' },
				{ name: '校园吐槽', iconImg: '/static/images/cat4.jpg' },
				{ name: '以物换物', iconImg: '/static/images/cat5.jpg' }
			],
			filterTabs: ['最新', '热门', '关注'],
			activities: [
				{
					image: '/static/images/activity1.png',
					tag: '热门',
					tagClass: 'hot',
					title: '校园文化节',
					description: '一年一度的校园文化节即将开幕，届时将有各种各样文化活动和表演，欢迎大家参与！',
					time: '5月20日-22日',
					location: '学校体育馆',
					avatars: ['/static/images/avatar1.png', '/static/images/avatar2.png', '/static/images/avatar3.png'],
					participants: 128
				},
				{
					image: '/static/images/activity2.png',
					tag: '官方',
					tagClass: 'official',
					title: '创新创业大赛',
					description: '展示你的创新想法和创业计划，与来自各个学院的同学一起交流和竞争！',
					time: '6月5日-15日',
					location: '学校科技楼',
					avatars: ['/static/images/avatar4.png', '/static/images/avatar5.png', '/static/images/avatar6.png'],
					participants: 86
				}
			],
			pinnedPosts: [
				{
					id: 1,
					avatar: 'https://picsum.photos/id/1/48/48',
					name: '校园公告',
					type: '官方',
					time: '2小时前',
					content: '各位同学请注意，学校将于5月25日至5月27日进行教学楼维修改造工程，期间相关教室将暂停使用，请大家合理安排学习时间。',
					likes: 128,
					comments: 36
				},
				{
					id: 2,
					avatar: 'https://picsum.photos/id/2/48/48',
					name: '校园超市',
					type: '商家',
					time: '昨天',
					content: '校园超市将于本周进行夏季大促销活动，各类饮料、零食、生活用品均有优惠，欢迎同学们前来选购！',
					images: [
						'https://picsum.photos/id/20/200/200',
						'https://picsum.photos/id/21/200/200',
						'https://picsum.photos/id/22/200/200'
					],
					likes: 86,
					comments: 24
				}
			],
			posts: [
				{
					id: 1,
					avatar: '/static/images/avatar1.png',
					name: '李明',
					college: '计算机科学与技术学院',
					time: '1小时前',
					tag: '讨论',
					tagClass: 'discussion',
					content: '有没有同学知道学校图书馆新到的那批计算机专业书籍放在哪个区域？找了半天都没找到。',
					likes: 24,
					comments: 12,
					isLiked: false
				},
				{
					id: 2,
					avatar: '/static/images/avatar2.png',
					name: '张小红',
					college: '电子信息工程学院',
					time: '3小时前',
					tag: '失物招领',
					tagClass: 'lost',
					content: '今天在教学楼A栋302教室捡到一个黑色钱包，里面有身份证和几张银行卡，失主请联系我。',
					images: ['/static/images/lost1.jpg'],
					likes: 36,
					comments: 8,
					isLiked: false
				}
			]
		};
	},
	onLoad() {
		// 页面加载时初始化数据
		this.initData();
		uni.setStorageSync('posts', this.posts);
	},
	methods: {
		// 初始化数据
		initData() {
			// 模拟网络请求获取数据
			this.fetchData();
		},
		
		// 获取数据
		fetchData(isLoadMore = false) {
			// 实际项目中这里应该是网络请求
			if (isLoadMore) {
				this.loading = true;
			}
			
			// 模拟网络请求延迟
			setTimeout(() => {
				if (!isLoadMore) {
					// 刷新数据
					// 实际项目中应该用返回数据替换
				} else {
					// 加载更多
					if (this.page > 3) {
						this.noMore = true;
					} else {
						// 模拟添加更多数据
						this.posts.push({
							id: this.posts.length + 1,
							avatar: '/static/images/avatar3.png',
							name: '王大力',
							college: '机械工程学院',
							time: '5小时前',
							tag: '问答',
							tagClass: 'question',
							content: '有人知道学校食堂什么时候开始供应冷饮吗？天气越来越热了。',
							likes: 18,
							comments: 7,
							isLiked: false
						});
					}
				}
				
				// 重置加载状态
				this.refreshing = false;
				this.loading = false;
			}, 1000);
		},
		
		// 下拉刷新
		onRefresh() {
			if (this.refreshing) return;
			
			this.refreshing = true;
			this.page = 1;
			this.noMore = false;
			this.fetchData();
		},
		
		// 上拉加载更多
		onLoadMore() {
			if (this.loading || this.noMore) return;
			
			this.page++;
			this.fetchData(true);
		},
		
		// 切换分类
		switchCategory(index) {
			if (this.activeCategory === index) return;
			
			this.activeCategory = index;
			// 切换分类后刷新数据
			this.onRefresh();
		},
		
		// 切换标签
		switchTab(index) {
			if (this.activeTab === index) return;
			
			this.activeTab = index;
			// 切换标签后刷新数据
			this.onRefresh();
		},
		
		// 查看活动详情
		viewActivityDetail(activity) {
			console.log('查看活动详情', activity);
			uni.navigateTo({
				url: '/pages/circle/activity-datail/activity-datail?id=' + activity.id
			});
		},
		
		// 参与活动
		joinActivity(activity) {
			console.log('参与活动', activity);
			// 实际项目中应处理活动参与逻辑
			uni.showToast({
				title: '已报名参与：' + activity.title,
				icon: 'success'
			});
		},
		
		// 查看置顶帖子详情
		viewPinnedDetail(post) {
			uni.navigateTo({
				url: `/pages/circle/pinned-datail/pinned-datail?id=${post.id}`
			});
		},
		
		// 查看帖子详情
		viewPostDetail(post) {
			uni.navigateTo({
				url: `/pages/circle/post-datail/post-datail?id=${post.id}`
			});
		},
		
		// 点赞帖子
		likePost(post, index) {
			// 点赞帖子
			post.isLiked = !post.isLiked;
			post.likes += post.isLiked ? 1 : -1;
			
			// 提示
			uni.showToast({
				title: post.isLiked ? '已点赞' : '已取消点赞',
				icon: 'none'
			});
		},
		
		// 评论帖子
		commentPost(post) {
			console.log('评论帖子', post);
			// 实际项目中应弹出评论输入框或跳转到评论页面
			uni.showToast({
				title: '评论功能开发中',
				icon: 'none'
			});
		},
		
		// 分享帖子
		sharePost(post) {
			console.log('分享帖子', post);
			// 实际项目中应调用分享API
			uni.showToast({
				title: '分享功能开发中',
				icon: 'none'
			});
		},
		
		// 发布新帖子
		createPost() {
			console.log('发布新帖子');
			// 实际项目中应跳转到发帖页面
			uni.showToast({
				title: '发帖功能开发中',
				icon: 'none'
			});
		},
		
		// 查看全部活动
		viewAllActivities() {
			console.log('查看全部活动');
			uni.navigateTo({
				url: '/pages/circle/activities/activities'
			});
		}
	}
};
</script>

<style lang="scss">
@import '@/styles/variables.scss';
@import '@/styles/common.scss';
/* 导入微信小程序兼容样式 */
@import '@/styles/platform-mp.scss';

.circle-container {
	display: flex;
	flex-direction: column;
	min-height: 100vh;
	background-color: #F8F9FC; /* 更淡的背景色 */
}

.search-bar {
	padding: 32rpx 24rpx 0 24rpx;
	background: #f8f9fc;
}

.search-input-wrapper {
	display: flex;
	align-items: center;
	background: #f5f6fa;
	border-radius: 32rpx;
	padding: 0 24rpx;
	height: 64rpx;
}

.search-icon {
	font-size: 32rpx;
	color: #b0b6be;
	margin-right: 12rpx;
}

.search-input {
	flex: 1;
	border: none;
	background: transparent;
	font-size: 28rpx;
	color: #333;
}

.banner-wrapper {
	position: relative;
	width: 100%;
	height: 320rpx;
}

.banner-image {
	width: 100%;
	height: 320rpx;
	object-fit: cover;
	display: block;
}

.banner-bottom-gradient {
	position: absolute;
	left: 0;
	right: 0;
	bottom: 0;
	height: 120rpx;
	background: linear-gradient(to bottom, rgba(255,255,255,0) 0%, rgba(255,255,255,0.92) 100%);
	z-index: 1;
	pointer-events: none;
}

.category-nav-abs {
	position: absolute;
	left: 0;
	right: 0;
	bottom: -60rpx;
	z-index: 2;
	display: flex;
	justify-content: center;
	padding: 0 24rpx;
}

.category-scroll {
	width: 100%;
	overflow: visible;
}

.category-list {
	display: flex;
	align-items: flex-end;
}

.category-container {
	width: 28vw;
	min-width: 28vw;
	display: flex;
	justify-content: center;
}

.category-item {
	width: 92%;
	margin: 0 auto;
	background: rgba(255,255,255,0.68);
	border-radius: 32rpx;
	box-shadow: 0 2rpx 10rpx rgba(77,124,191,0.06);
	border: 1.5rpx solid rgba(77,124,191,0.08);
	transition: all $transition-fast;
	padding: 16rpx 0 8rpx 0;
}

.category-item.active {
	background: rgba($primary-color, 0.12);
	border: 2rpx solid $primary-color;
	box-shadow: 0 6rpx 24rpx rgba(77,124,191,0.13);
	transform: scale(1.08);
}

.main-content {
	margin-top: 56rpx;
	flex: 1;
	/* 这里放原有的内容区 */
}

.header {
	background-color: $white;
	position: sticky;
	top: 0;
	z-index: 100;
	box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.03);
	border-bottom: 1rpx solid rgba(0, 0, 0, 0.02);
}

.header-left .iconfont {
	font-size: $font-size-xl;
	color: $primary-color;
}

.header-left .title {
	font-size: $font-size-lg;
}

.header-right .iconfont {
	font-size: $font-size-lg;
	color: $gray;
	margin-left: $spacing-lg;
	transition: all $transition-fast;
	
	&:active {
		color: $primary-color;
		transform: scale(1.05);
	}
}

.header-right .avatar {
	width: 60rpx;
	height: 60rpx;
	margin-left: $spacing-lg;
	border: 2rpx solid $extra-light-gray;
	box-shadow: 0 2rpx 6rpx rgba(0, 0, 0, 0.05);
}

.content-scroll {
	flex: 1;
	height: calc(100vh - 170rpx);
	padding-bottom: 20rpx; 
}

.section {
	position: relative;
	border-radius: $border-radius-base;
	overflow: hidden;
	box-shadow: 0 2rpx 16rpx rgba(0, 0, 0, 0.04);
	border: 1rpx solid rgba(0, 0, 0, 0.02);
}

/* 标题图标样式 */
.icon-wrapper {
	width: 64rpx;
	height: 64rpx;
	border-radius: $border-radius-circle;
	display: flex;
	align-items: center;
	justify-content: center;
	margin-right: $spacing-xs;
	
	&.bg-gradient-primary {
		background: linear-gradient(135deg, $primary-color, lighten($primary-color, 15%));
	}
	
	&.bg-gradient-warning {
		background: linear-gradient(135deg, $warning-color, lighten($warning-color, 15%));
	}
	
	&.bg-gradient-muted {
		background: linear-gradient(135deg, #7E8B9A, #A9B4C0);
	}
	
	.iconfont {
		font-size: $font-size-lg;
	}
}

.section-title .iconfont {
	font-size: $font-size-lg;
}

.more {
	position: relative;
	padding: $spacing-xs $spacing-sm;
	border-radius: $border-radius-lg;
	transition: all $transition-fast;
	
	&:active {
		background-color: $bg-color-hover;
	}
}

.badge {
	font-size: $font-size-xs;
	background-color: $error-color;
	color: $white;
	border-radius: $border-radius-circle;
	width: 32rpx;
	height: 32rpx;
	display: flex;
	align-items: center;
	justify-content: center;
}

.filter-tabs {
	display: flex;
	background-color: rgba(0, 0, 0, 0.03);
	border-radius: $border-radius-lg;
	padding: 4rpx;
}

.filter-tab {
	padding: $spacing-xs $spacing-base;
	margin-left: 0;
	border-radius: $border-radius-lg;
	font-size: $font-size-sm;
	color: $dark-gray;
	transition: all $transition-fast;
}

.filter-tab.active {
	background-color: $primary-color;
	color: $white;
	box-shadow: 0 2rpx 8rpx rgba(77, 124, 191, 0.25);
}

.filter-tab-active {
	opacity: 0.8;
}

.activity-scroll {
	white-space: nowrap;
	margin: 0 -$spacing-xs;
}

.activity-list {
	display: inline-flex;
	padding: $spacing-xs $spacing-xs;
}

.float-btn {
	position: fixed;
	right: $spacing-lg;
	bottom: 100rpx;
	width: 100rpx;
	height: 100rpx;
	border-radius: $border-radius-circle;
	background: linear-gradient(135deg, $primary-color, lighten($primary-color, 10%));
	color: $white;
	box-shadow: 0 4rpx 16rpx rgba(77, 124, 191, 0.3);
	z-index: 99;
	transition: all $transition-base;
}

.float-btn .iconfont {
	font-size: $font-size-xl;
}

.float-btn:active {
	transform: scale(0.95);
	box-shadow: 0 2rpx 8rpx rgba(77, 124, 191, 0.2);
}

/* 加载和空状态 */
.loading {
	padding: $spacing-lg 0;
	text-align: center;
	
	.loading-icon {
		display: inline-block;
		animation: rotate 1s linear infinite;
		margin-right: $spacing-xs;
	}
}

.empty-state {
	padding: $spacing-xl 0;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	
	.empty-icon {
		font-size: 80rpx;
		color: $light-gray;
		margin-bottom: $spacing-base;
	}
	
	.empty-text {
		color: $gray;
		font-size: $font-size-base;
		margin-bottom: $spacing-base;
	}
}

.text-muted {
	color: $gray;
}

.text-dark {
	color: $dark-gray;
}

@keyframes rotate {
	from {
		transform: rotate(0deg);
	}
	to {
		transform: rotate(360deg);
	}
}

.pinned-header {
  align-items: center;
  margin-bottom: 18rpx;
}
.pinned-gradient {
  width: 56rpx;
  height: 56rpx;
  border-radius: 50%;
  background: linear-gradient(135deg, #e7d7a7 0%, #f7e7b7 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 12rpx;
  box-shadow: 0 2rpx 8rpx rgba(231, 215, 122, 0.18);
}
.pinned-title {
  color: #000000;
  font-size: 32rpx;
  font-weight: 700;
  margin-right: 8rpx;
}
.pinned-badge {
  background: #e7d77a;
  color: #4a4a4a;
  border-radius: 16rpx;
  font-size: 22rpx;
  font-weight: 600;
  padding: 0 14rpx;
  min-width: 32rpx;
  height: 32rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-left: 4rpx;
  box-shadow: 0 2rpx 8rpx rgba(231, 215, 122, 0.10);
}
</style>
