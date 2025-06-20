<template>
	<view class="user-quanzi-page">
		<view class="tab-bar">
			<view
				v-for="tab in tabs"
				:key="tab.type"
				:class="['tab-item', {active: currentType === tab.type}]"
				@click="switchTab(tab.type)"
			>
				<text class="tab-text">{{ tab.text }}</text>
				<text class="tab-count">{{ tab.count }}</text>
			</view>
		</view>
		<view class="contribution-list">
			<view 
				v-for="(item, index) in currentList" 
				:key="item.id" 
				class="swipe-item"
				@touchstart="touchStart"
				@touchmove="touchMove"
				@touchend="touchEnd"
				:data-index="index"
			>
				<view 
					class="contribution-card" 
					:style="{ transform: `translateX(${item.offsetX || 0}px)` }"
					@click="handleCardClick(item)"
				>
					<view class="contribution-header">
						<uni-icons :type="item.icon" size="20" color="#4080FF" />
						<text class="contribution-type">{{ getTypeLabel(item.type) }}</text>
						<text class="contribution-time">{{ formatTime(item.create_time) }}</text>
					</view>
					<view class="contribution-content">
						<text class="contribution-text">{{ item.content }}</text>
					</view>
					<view class="contribution-footer" v-if="item.extra || item.stats">
						<view class="contribution-stats" v-if="item.stats">
							<text class="stat-item">{{ item.stats.likes }} 赞</text>
							<text class="stat-item">{{ item.stats.comments }} 评论</text>
							<text class="stat-item" v-if="item.stats.shares">{{ item.stats.shares }} 分享</text>
						</view>
						<text class="contribution-extra" v-if="item.extra">{{ item.extra }}</text>
					</view>
				</view>
				<view class="swipe-actions" v-if="item.type !== 'like'">
					<view class="swipe-action-btn delete-btn" @click.stop="handleDelete(item)">
						<uni-icons type="trash" size="20" color="#fff"></uni-icons>
						<text class="action-text">{{ getDeleteButtonText(item.type) }}</text>
					</view>
				</view>
			</view>
			<view v-if="currentList.length === 0" class="empty-tip">
				<uni-icons type="info" size="40" color="#C8C9CC" />
				<text>暂无数据</text>
			</view>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				tabs: [
					{ text: '发帖数', type: 'post', count: 0 },
					{ text: '评论数', type: 'comment', count: 0 },
					{ text: '获赞数', type: 'like', count: 0 },
					{ text: '我的点赞', type: 'user_likes', count: 0 }
				],
				currentType: 'post',
				postList: [],
				commentList: [],
				likeList: [],
				userLikesList: [],
				userInfo: null,
				touchStartX: 0,
				initialOffsetX: 0,
				isDragging: false,
				currentSwipeIndex: -1
			};
		},
		computed: {
			currentList() {
				switch (this.currentType) {
					case 'post': return this.postList
					case 'comment': return this.commentList
					case 'like': return this.likeList
					case 'user_likes': return this.userLikesList
					default: return []
				}
			}
		},
		methods: {
			switchTab(type) {
				this.currentType = type
				// 切换tab时关闭所有左滑
				this.closeAllSwipe()
			},
			getTypeLabel(type) {
				const typeMap = {
					'post': '发布帖子',
					'comment': '发表评论',
					'like': '获得点赞',
					'user_likes': '点赞了帖子'
				}
				return typeMap[type] || '贡献'
			},
			getDeleteButtonText(type) {
				const map = {
					post: '删除帖子',
					comment: '删除评论',
					user_likes: '取消点赞'
				};
				return map[type] || '删除';
			},
			
			// 处理卡片点击
			handleCardClick(item) {
				if (this.isDragging) {
					return;
				}
				console.log('卡片点击:', item);
			},
			
			// 触摸开始
			touchStart(e) {
				const index = e.currentTarget.dataset.index;
				if (typeof index === 'undefined') return;
				const item = this.currentList[index];
				if (!item) return;
			
				// 关闭所有其他的滑动项
				this.currentList.forEach((it, i) => {
					if (i !== index && it.offsetX !== 0) {
						this.$set(it, 'offsetX', 0);
					}
				});
			
				this.isDragging = false;
				this.touchStartX = e.touches[0].clientX;
				this.initialOffsetX = item.offsetX || 0;
				this.currentSwipeIndex = index;
			},
			
			// 触摸移动
			touchMove(e) {
				const index = e.currentTarget.dataset.index;
				if (index !== this.currentSwipeIndex) return;
			
				const currentX = e.touches[0].clientX;
				const deltaX = currentX - this.touchStartX;
			
				if (Math.abs(deltaX) > 5) {
					this.isDragging = true;
				}
			
				const item = this.currentList[index];
				if (!item) return;
			
				let newOffsetX = this.initialOffsetX + deltaX;
			
				const maxOffset = -80;
				if (newOffsetX > 0) {
					newOffsetX = 0;
				}
				if (newOffsetX < maxOffset) {
					newOffsetX = maxOffset;
				}
			
				this.$set(item, 'offsetX', newOffsetX);
			},
			
			// 触摸结束
			touchEnd(e) {
				const index = e.currentTarget.dataset.index;
				if (index !== this.currentSwipeIndex) return;
			
				const item = this.currentList[index];
				if (!item) return;
			
				if (this.isDragging) {
					const offsetX = item.offsetX || 0;
					const maxOffset = -80;
			
					if (offsetX < maxOffset / 2) {
						this.$set(item, 'offsetX', -80);
					} else {
						this.$set(item, 'offsetX', 0);
					}
				}
			
				this.currentSwipeIndex = -1;
			},
			
			// 关闭所有左滑
			closeAllSwipe() {
				this.currentList.forEach(item => {
					this.$set(item, 'offsetX', 0)
				})
			},
			
			// 处理删除
			handleDelete(item) {
				console.log('删除项目:', item)
				
				// 显示确认对话框
				uni.showModal({
					title: '确认删除',
					content: `确定要删除这条${this.getTypeLabel(item.type)}记录吗？`,
					success: (res) => {
						if (res.confirm) {
							this.deleteItem(item)
						}
					}
				})
			},
			
			// 删除项目
			async deleteItem(item) {
				try {
					uni.showLoading({
						title: '删除中...'
					})
					
					const db = uniCloud.database()
					let success = false
					
					switch (item.type) {
						case 'post':
							// 删除帖子
							await db.collection('add-content').doc(item.id).remove()
							success = true
							break
						case 'comment':
							// 删除评论
							await db.collection('user-comment').doc(item.id).remove()
							success = true
							break
						case 'user_likes':
							// 取消点赞
							await db.collection('user-likes').doc(item.id).remove()
							success = true
							break
						case 'like':
							// 获赞记录不能删除，只能隐藏
							uni.showToast({
								title: '获赞记录不能删除',
								icon: 'none'
							})
							return
					}
					
					if (success) {
						uni.showToast({
							title: '删除成功',
							icon: 'success'
						})
						
						// 重新加载数据
						this.loadAllData()
					}
				} catch (error) {
					console.error('删除失败：', error)
					uni.showToast({
						title: '删除失败',
						icon: 'none'
					})
				} finally {
					uni.hideLoading()
				}
			},
			
			// 格式化时间
			formatTime(timestamp) {
				if (!timestamp) return ''
				const date = new Date(timestamp)
				const year = date.getFullYear()
				const month = String(date.getMonth() + 1).padStart(2, '0')
				const day = String(date.getDate()).padStart(2, '0')
				const hour = String(date.getHours()).padStart(2, '0')
				const minute = String(date.getMinutes()).padStart(2, '0')
				return `${year}-${month}-${day} ${hour}:${minute}`
			},
			
			// 获取用户信息
			getUserInfo() {
				const info = uni.getStorageSync('uni-id-pages-userInfo')
				this.userInfo = info && info._id ? info : null
			},
			
			// 获取用户发帖数据
			async getUserPosts() {
				console.log('尝试获取发帖数据...');
				if (!this.userInfo || !this.userInfo._id) {
					console.log('获取发帖数据中止：无用户信息。');
					return;
				}
				const db = uniCloud.database();
				const whereCondition = { user_id: this.userInfo._id, status: 'published', content_type: 'post' };
				try {
					const [postsResult, countResult] = await Promise.all([
						db.collection('add-content').where(whereCondition).orderBy('create_time', 'desc').limit(20).get(),
						db.collection('add-content').where(whereCondition).count()
					]);
					if (postsResult.result && postsResult.result.data) {
						this.postList = postsResult.result.data.map(post => ({
							id: post._id,
							type: 'post',
							icon: 'compose',
							content: post.content,
							create_time: post.create_time,
							stats: {
								likes: post.likes || post.like_count || 0,
								comments: post.comments || post.comment_count || 0
							}
						}));
					}
					if (countResult.result) {
						const tab = this.tabs.find(t => t.type === 'post');
						if (tab) this.$set(tab, 'count', countResult.result.total);
					}
					console.log('发帖数据获取结果:', { list: this.postList, count: countResult.result.total });
				} catch (error) {
					console.error('获取用户发帖失败：', error);
					uni.showToast({ title: '获取发帖数据失败', icon: 'none' });
				}
			},
			
			// 获取用户评论数据
			async getUserComments() {
				console.log('尝试获取评论数据...');
				if (!this.userInfo || !this.userInfo._id) {
					console.log('获取评论数据中止：无用户信息。');
					return;
				}
				const db = uniCloud.database();
				const whereCondition = `"user_id" == "${this.userInfo._id}" || "author_id" == "${this.userInfo._id}"`;
				try {
					const [commentsResult, countResult] = await Promise.all([
						db.collection('user-comment').where(whereCondition).orderBy('create_time', 'desc').limit(20).get(),
						db.collection('user-comment').where(whereCondition).count()
					]);
					if (commentsResult.result && commentsResult.result.data) {
						this.commentList = commentsResult.result.data.map(comment => ({
							id: comment._id,
							type: 'comment',
							icon: 'chat',
							content: comment.content,
							create_time: comment.create_time,
							extra: `评论了帖子`,
							stats: {
								likes: comment.likes || comment.like_count || 0,
								comments: comment.replies || comment.reply_count || 0
							}
						}));
					}
					if (countResult.result) {
						const tab = this.tabs.find(t => t.type === 'comment');
						if (tab) this.$set(tab, 'count', countResult.result.total);
					}
					console.log('评论数据获取结果:', { list: this.commentList, count: countResult.result.total });
				} catch (error) {
					console.error('获取用户评论失败：', error);
					uni.showToast({ title: '获取评论数据失败', icon: 'none' });
				}
			},
			
			// 获取用户获赞数据
			async getUserReceivedLikes() {
				console.log('尝试获取获赞数据...');
				if (!this.userInfo || !this.userInfo._id) {
					console.log('获取获赞数据中止：无用户信息。');
					return;
				}
				const db = uniCloud.database();
				const whereCondition = `user_id == "${this.userInfo._id}" && status == "published" && content_type == "post"`;
				try {
					const listResult = await db.collection('add-content').where(`${whereCondition} && (likes > 0 || like_count > 0)`).orderBy('create_time', 'desc').limit(10).get();
					if (listResult.result && listResult.result.data) {
						this.likeList = listResult.result.data.map(post => ({
							id: post._id,
							type: 'like',
							icon: 'heart',
							content: post.content,
							create_time: post.create_time,
							extra: `获得了 ${post.likes || post.like_count || 0} 个赞`,
							stats: { likes: post.likes || post.like_count || 0 }
						}));
					}
			
					// 注意：为计算总获赞数，需获取所有帖子。若帖子数量巨大，此操作可能影响性能。
					// 生产环境下建议使用云函数进行聚合运算。
					// 移除 .field() 以避免与 'like_count' 字段冲突的报错
					const allPostsResult = await db.collection('add-content').where(whereCondition).get();
					let totalLikes = 0;
					if (allPostsResult.result && allPostsResult.result.data) {
						totalLikes = allPostsResult.result.data.reduce((sum, post) => sum + (post.likes || post.like_count || 0), 0);
					}
					const tab = this.tabs.find(t => t.type === 'like');
					if (tab) this.$set(tab, 'count', totalLikes);
					console.log('获赞数据获取结果:', { list: this.likeList, count: totalLikes });
				} catch (error) {
					console.error('获取用户获赞失败：', error);
					uni.showToast({ title: '获取获赞数据失败', icon: 'none' });
				}
			},
			
			// 获取用户点赞的帖子数据
			async getUserLikes() {
				console.log('尝试获取"我的点赞"数据...');
				if (!this.userInfo || !this.userInfo._id) {
					console.log('获取"我的点赞"数据中止：无用户信息。');
					return;
				}
				const db = uniCloud.database();
				const whereCondition = { user_id: this.userInfo._id };
				try {
					const [likesResult, countResult] = await Promise.all([
						db.collection('user-likes').where(whereCondition).orderBy('create_time', 'desc').limit(20).get(),
						db.collection('user-likes').where(whereCondition).count()
					]);
			
					if (countResult.result) {
						const tab = this.tabs.find(t => t.type === 'user_likes');
						if (tab) this.$set(tab, 'count', countResult.result.total);
					}
					console.log('"我的点赞"数量:', countResult.result ? countResult.result.total : 0);
			
					if (likesResult.result && likesResult.result.data && likesResult.result.data.length > 0) {
						const postIds = likesResult.result.data.map(like => like.post_id);
						const postsResult = await db.collection('add-content').where({ _id: db.command.in(postIds), status: 'published' }).get();
						if (postsResult.result && postsResult.result.data) {
							const postMap = {};
							postsResult.result.data.forEach(post => { postMap[post._id] = post; });
							this.userLikesList = likesResult.result.data.map(like => {
								const post = postMap[like.post_id];
								if (!post) return null;
								return {
									id: like._id,
									type: 'user_likes',
									icon: 'heart',
									content: post.content,
									create_time: like.create_time,
									extra: `点赞了帖子`,
									stats: {
										likes: post.likes || post.like_count || 0,
										comments: post.comments || post.comment_count || 0
									}
								};
							}).filter(item => item !== null);
						}
					} else {
						this.userLikesList = [];
					}
					console.log('"我的点赞"列表:', this.userLikesList);
				} catch (error) {
					console.error('获取用户点赞失败：', error);
					uni.showToast({ title: '获取点赞数据失败', icon: 'none' });
				}
			},
			
			// 加载所有数据
			async loadAllData() {
				console.log('--- 开始加载所有数据 ---');
				if (!this.userInfo) {
					console.log('加载中止：未找到用户信息');
					uni.showToast({
						title: '请先登录',
						icon: 'none'
					})
					return
				}
				
				console.log('用户信息ID:', this.userInfo._id);
				
				// 显示加载提示
				uni.showLoading({
					title: '加载中...'
				})
				
				try {
					console.log('并行加载...');
					// 并行加载所有数据
					await Promise.all([
						this.getUserPosts(),
						this.getUserComments(),
						this.getUserReceivedLikes(),
						this.getUserLikes()
					])
					console.log('所有数据加载完成');
				} catch (error) {
					console.error('加载数据失败：', error)
				} finally {
					console.log('--- 结束加载所有数据 ---');
					uni.hideLoading()
				}
			}
		},
		
		onLoad() {
			this.getUserInfo()
		},
		
		onShow() {
			this.getUserInfo()
			this.loadAllData()
		}
	};
</script>

<style lang="scss">
	.user-quanzi-page {
		background: linear-gradient(180deg, #f5f6fa 0%, #eaf2ff 100%);
		min-height: 100vh;
		padding-bottom: 40rpx;
	}
	.tab-bar {
		display: flex;
		background: #fff;
		border-radius: 20rpx;
		margin: 0 24rpx 0 24rpx;
		box-shadow: 0 4px 16px rgba(64,128,255,0.08);
		overflow: hidden;
	}
	.tab-item {
		flex: 1;
		text-align: center;
		padding: 24rpx 0;
		font-size: 16px;
		color: #666;
		cursor: pointer;
		transition: all 0.3s ease;
		letter-spacing: 1px;
		position: relative;
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
	}
	.tab-text {
		font-size: 30rpx;
		font-weight: 500;
	}
	.tab-count {
		font-size: 26rpx;
		font-weight: 700;
		margin-top: 6rpx;
	}
	.tab-item:not(.active) .tab-count {
		color: #999;
	}
	.tab-item.active .tab-text {
		font-weight: 600;
	}
	.tab-item.active .tab-count {
		color: #4080FF;
	}
	.contribution-list {
		margin: 32rpx 24rpx 0 24rpx;
	}
	
	/* 自定义左滑样式 */
	.swipe-item {
		position: relative;
		margin-bottom: 24rpx;
		overflow: hidden;
		border-radius: 24rpx;
	}
	
	.contribution-card {
		background: #fff;
		border-radius: 20rpx;
		box-shadow: 0 6px 20px rgba(64,128,255,0.08);
		padding: 32rpx 28rpx 28rpx 28rpx;
		transition: all 0.3s ease;
		border: 1rpx solid rgba(64,128,255,0.05);
		position: relative;
		z-index: 2;
	}
	
	.contribution-card:active {
		background-color: #f8f9fa;
	}
	
	.swipe-actions {
		position: absolute;
		right: 0;
		top: 0;
		bottom: 0;
		display: flex;
		align-items: center;
		z-index: 1;
	}
	
	.swipe-action-btn {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		width: 160rpx;
		height: 98%;
		color: #fff;
		transition: background-color 0.2s ease;
	}
	
	.delete-btn {
		background-color: #ff5252;
	}

	.delete-btn:active {
		background-color: #e64a4a;
	}

	.swipe-action-btn .action-text {
		font-size: 26rpx;
		margin-top: 4rpx;
	}
	
	.contribution-header {
		display: flex;
		align-items: center;
		margin-bottom: 20rpx;
		justify-content: space-between;
	}
	.contribution-type {
		font-size: 16px;
		font-weight: 600;
		color: #333;
		margin-left: 12rpx;
		flex: 1;
	}
	.contribution-time {
		font-size: 12px;
		color: #999;
	}
	.contribution-content {
		margin-bottom: 20rpx;
	}
	.contribution-text {
		font-size: 15px;
		color: #444;
		line-height: 1.6;
		display: -webkit-box;
		-webkit-line-clamp: 1;
		-webkit-box-orient: vertical;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
	.contribution-footer {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding-top: 16rpx;
		border-top: 1rpx solid #f0f0f0;
	}
	.contribution-stats {
		display: flex;
		gap: 20rpx;
	}
	.stat-item {
		font-size: 12px;
		color: #666;
		background: #f8f9fa;
		padding: 6rpx 12rpx;
		border-radius: 12rpx;
	}
	.contribution-extra {
		font-size: 12px;
		color: #4080FF;
		background: rgba(64,128,255,0.1);
		padding: 6rpx 12rpx;
		border-radius: 12rpx;
		font-weight: 500;
	}
	.empty-tip {
		text-align: center;
		color: #999;
		margin-top: 120rpx;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 16rpx;
	}
	.empty-tip text {
		font-size: 16px;
		letter-spacing: 1px;
	}
</style>
