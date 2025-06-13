<template>
	<view class="pinned-detail-container">
		<!-- 加载状态 -->
		<view v-if="loading" class="loading-overlay">
			<view class="loading-spinner"></view>
		</view>

		<!-- 内容区域 -->
		<scroll-view v-else class="content-scroll" scroll-y="true">
			<!-- 发布者信息 -->
			<view class="poster-info poster-card">
				<view class="poster-avatar-bg">
					<image class="avatar" :src="post.avatar" mode="aspectFill"></image>
				</view>
				<view class="poster-meta">
					<view class="meta-row">
						<text class="poster-name">{{post.name}}</text>
						<view class="poster-tag" :class="post.type === '官方' ? 'official' : 'merchant'">{{post.type}}</view>
					</view>
					<text class="poster-time">{{post.time}}</text>
				</view>
			</view>
			
			<!-- 内容主体 -->
			<view class="content-body p-base bg-white mt-sm">
				<text class="content-text">{{post.content}}</text>
				
				<!-- 图片展示 -->
				<view class="image-grid" v-if="post.images && post.images.length">
					<image 
						v-for="(img, index) in post.images" 
						:key="index"
						:src="img"
						mode="aspectFill"
						@tap="previewImage(index)"
					></image>
				</view>
			</view>
			
			<!-- 互动区域 -->
			<view class="interaction-bar p-base bg-white mt-sm flex-between">
				<view class="flex items-center">
					<view class="interaction-item" @tap="handleLike">
						<text class="iconfont icon-dianzan like-btn"
							:class="{'like-animate': post.likeAnimate, 'liked': post.isLiked}"
							@tap="handleLike"></text>
						<text class="count ml-xs" :class="{'liked': post.isLiked}">{{post.likes}}</text>
					</view>
					<view class="interaction-item ml-lg" @tap="focusComment">
						<text class="iconfont icon-icon_comment"></text>
						<text class="count ml-xs">{{post.comments}}</text>
					</view>
				</view>
				<view class="interaction-item" @tap="handleShare">
					<text class="iconfont icon-fenxiang"></text>
				</view>
			</view>
			
			<!-- 评论区 -->
			<view class="comments-section bg-white mt-sm">
				<view class="section-title p-base border-bottom">
					<text class="font-bold">评论 {{post.comments}}</text>
				</view>
				
				<!-- 评论列表 -->
				<view class="comment-list">
					<view class="comment-item" v-for="comment in comments" :key="comment._id">
						<image class="comment-avatar" :src="comment.author_avatar" mode="aspectFill"></image>
						<view class="comment-content">
							<view class="flex items-center">
								<text class="comment-name font-bold">{{ comment.author_name }}</text>
							</view>
							<text class="comment-text mt-xs">{{ comment.content }}</text>
							<view class="comment-actions-bar flex mt-xs">
								<view class="left-actions flex items-center">
									<text class="comment-time text-muted text-xs">{{ formatTime(comment.create_time) }}</text>
									<text class="action-btn ml-base" @tap="replyToComment(comment)">回复</text>
								</view>
								<view class="right-actions flex items-center ml-auto">
									<view class="like-btn-wrapper flex items-center">
										<text class="iconfont like-btn"
											:class="[comment.liked ? 'icon-aixin4 liked' : 'icon-aixin3', comment.likeAnimate ? 'like-animate' : '']"
											@tap="likeComment(comment)"></text>
										<text class="like-count ml-xs" :class="{'liked': comment.liked}">{{ comment.like_count }}</text>
									</view>
								</view>
							</view>
							<!-- 子评论展示 -->
							<view v-if="comment.replies && comment.replies.length" class="reply-list">
								<view class="reply-item" v-for="reply in comment.replies" :key="reply._id">
									<image class="reply-avatar" :src="reply.author_avatar" mode="aspectFill"></image>
									<view class="reply-content">
										<view class="flex items-center">
											<text class="reply-name">{{ reply.author_name }}</text>
											<text class="reply-time ml-xs">{{ formatTime(reply.create_time) }}</text>
										</view>
										<text class="reply-text mt-xs">{{ reply.content }}</text>
									</view>
								</view>
							</view>
						</view>
					</view>
				</view>
			</view>
		</scroll-view>
		
		<!-- 底部评论输入框 -->
		<view class="comment-input-bar p-base bg-white">
			<input 
				class="comment-input"
				type="text"
				v-model="commentText"
				:placeholder="replyTo ? '回复 @' + replyTo.author_name + '：' : '说点什么...'"
				:focus="isInputFocused"
				@focus="onInputFocus"
				@blur="onInputBlur"
			/>
			<button class="send-btn" :disabled="!commentText" @tap="sendComment">发送</button>
		</view>
	</view>
</template>

<script>
export default {
	data() {
		const userInfo = uni.getStorageSync('uni-id-pages-userInfo') || {};
		return {
			post: {
				_id: '',
				content: '',
				images: [],
				likes: 0,
				comments: 0,
				time: '',
				name: '',
				avatar: '/static/images/default-avatar.png',
				type: '官方',
				isLiked: false
			},
			comments: [],
			commentText: '',
			isInputFocused: false,
			likeLoading: false,
			userInfo: userInfo,
			replyTo: null,
			replyPlaceholder: '说点什么...',
			loading: true // 添加loading状态
		};
	},
	async onLoad(options) {
		const postId = options.id;
		// 并行加载数据
		await Promise.all([
			this.loadPostDetail(postId),
			this.fetchComments(postId)
		]);
		this.loading = false;
	},
	// 添加页面返回时的处理
	onUnload() {
		// 获取页面实例
		const pages = getCurrentPages();
		const circlePage = pages.find(page => page.route === 'pages/circle/circle');
		if (circlePage) {
			// 调用圈子页面的刷新方法
			circlePage.$vm.fetchPinnedPosts();
		}
	},
	methods: {
		goBack() {
			uni.navigateBack();
		},
		previewImage(index) {
			uni.previewImage({
				urls: this.post.images,
				current: index
			});
		},
		// 获取帖子详情+用户信息+点赞状态
		async loadPostDetail(postId) {
			try {
				// 并行请求数据
				const [postRes, userLikeRes] = await Promise.all([
					// 1. 获取置顶帖子详情
					uniCloud.database().collection('add-content')
						.where({ _id: postId, content_type: 'pinned' })
						.get(),
					// 2. 获取当前用户点赞状态
					this.userInfo._id ? uniCloud.database().collection('user-likes')
						.where({
							user_id: this.userInfo._id,
							post_id: postId
						})
						.get() : Promise.resolve({ result: { data: [] } })
				]);

				if (!postRes.result.data || postRes.result.data.length === 0) {
					uni.showToast({ title: '未找到该帖子', icon: 'none' });
					return;
				}

				const post = postRes.result.data[0];
				const isLiked = userLikeRes.result.data.length > 0;

				// 3. 获取发帖人信息
				let user = {};
				try {
					const userRes = await uniCloud.database().collection('uni-id-users')
						.doc(post.user_id)
						.field('_id,avatar_file,nickname')
						.get();
					user = userRes.result.data[0] || {};
				} catch (e) {
					console.error('获取发帖人信息失败:', e);
				}

				// 4. 组装数据
				this.post = {
					_id: post._id,
					content: post.content,
					images: post.files || [],
					likes: post.like_count || 0,
					comments: post.comment_count || 0,
					time: this.formatTime(post.create_time),
					name: user.nickname || '匿名用户',
					avatar: user.avatar_file && user.avatar_file.url ? user.avatar_file.url : '/static/images/default-avatar.png',
					type: post.category || '官方',
					isLiked
				};
			} catch (e) {
				console.error('获取帖子详情失败:', e);
				uni.showToast({ title: '加载失败', icon: 'none' });
			}
		},
		// 点赞帖子
		async handleLike() {
			if (this.likeLoading) return;
			this.likeLoading = true;

			if (!this.userInfo || !this.userInfo._id) {
				uni.showToast({ title: '请先登录', icon: 'none' });
				this.likeLoading = false;
				return;
			}
			const userId = this.userInfo._id;
			const postId = this.post._id;

			try {
				// 先检查是否已点赞
				const likeRes = await uniCloud.database().collection('user-likes')
					.where({
						user_id: userId,
						post_id: postId
					})
					.get();

				if (likeRes.result.data.length > 0) {
					// 已点赞，执行取消点赞
					const likeId = likeRes.result.data[0]._id;
					await uniCloud.database().collection('user-likes').doc(likeId).remove();
					await uniCloud.database().collection('add-content').doc(postId).update({
						like_count: this.post.likes - 1
					});
					this.post.isLiked = false;
					this.post.likes -= 1;
					uni.showToast({ title: '已取消点赞', icon: 'none' });
				} else {
					// 未点赞，执行点赞
					await uniCloud.database().collection('user-likes').add({
						user_id: userId,
						post_id: postId,
						create_time: Date.now()
					});
					await uniCloud.database().collection('add-content').doc(postId).update({
						like_count: this.post.likes + 1
					});
					this.post.isLiked = true;
					this.post.likes += 1;
					uni.showToast({ title: '已点赞', icon: 'none' });
				}

				// 更新圈子页面的置顶帖子数据
				const pages = getCurrentPages();
				const circlePage = pages.find(page => page.route === 'pages/circle/circle');
				if (circlePage) {
					const pinnedPosts = circlePage.$vm.pinnedPosts;
					const targetPost = pinnedPosts.find(p => p._id === postId);
					if (targetPost) {
						targetPost.likes = this.post.likes;
						targetPost.isLiked = this.post.isLiked;
					}
				}
			} catch (e) {
				console.error('handleLike - 点赞操作失败:', e);
				uni.showToast({ title: '操作失败', icon: 'none' });
			} finally {
				this.likeLoading = false;
			}
		},
		focusComment() {
			this.isInputFocused = true;
		},
		handleShare() {
			uni.showShareMenu({
				withShareTicket: true
			});
		},
		onInputFocus() {
			this.isInputFocused = true;
		},
		onInputBlur() {
			this.isInputFocused = false;
		},
		// 评论
		async fetchComments(postId) {
			try {
				// 并行获取评论数据和点赞状态
				const [commentsRes, commentLikesRes] = await Promise.all([
					uniCloud.database().collection('user-comment')
						.where({ target_id: postId })
						.orderBy('create_time', 'asc')
						.get(),
					this.userInfo._id ? uniCloud.database().collection('user-commentlikes')
						.where({
							user_id: this.userInfo._id,
							comment_id: uniCloud.database().command.in(
								(await uniCloud.database().collection('user-comment')
									.where({ target_id: postId })
									.get()).result.data.map(c => c._id)
							)
						})
						.get() : Promise.resolve({ result: { data: [] } })
				]);

				const all = commentsRes.result.data;
				const likedMap = {};
				commentLikesRes.result.data.forEach(like => {
					likedMap[like.comment_id] = true;
				});

				// 一级评论
				const top = all.filter(c => !c.parent_id).map(item => ({
					...item,
					user_id: item.author_id,
					liked: likedMap[item._id] || false
				}));

				// 二级评论分组
				top.forEach(parent => {
					parent.replies = all.filter(c => c.parent_id === parent._id).map(item => ({
						...item,
						user_id: item.author_id,
						liked: likedMap[item._id] || false
					}));
				});

				this.comments = top;
			} catch (e) {
				console.error('获取评论失败:', e);
				uni.showToast({ title: '获取评论失败', icon: 'none' });
			}
		},
		// 发送评论
		async sendComment() {
			if (!this.commentText.trim()) return;
			if (!this.userInfo._id) {
				uni.showToast({ title: '请先登录', icon: 'none' });
				return;
			}
			const postId = this.post._id;
			try {
				await uniCloud.callFunction({
					name: 'user-comment',
					data: {
						content: this.commentText,
						author_id: this.userInfo._id,
						author_name: this.userInfo.nickname || '匿名用户',
						author_avatar: this.userInfo.avatar_file && this.userInfo.avatar_file.url ? this.userInfo.avatar_file.url : '/static/images/default-avatar.png',
						target_id: postId,
						parent_id: this.replyTo ? this.replyTo._id : ''
					}
				});
				this.commentText = '';
				this.isInputFocused = false;
				this.replyTo = null;
				this.replyPlaceholder = '说点什么...';
				uni.showToast({ title: '评论成功', icon: 'none' });
				await this.fetchComments(postId);
				this.post.comments += 1;
				
				// 更新帖子评论数
				await uniCloud.database().collection('add-content')
					.doc(postId)
					.update({
						comment_count: this.post.comments
					});
			} catch (e) {
				console.error('发送评论失败:', e);
				uni.showToast({ title: '评论失败', icon: 'none' });
			}
		},
		async likeComment(comment) {
			if (comment.likeLoading) return;
			comment.likeLoading = true;
			const userId = this.userInfo._id;
			if (!userId) {
				uni.showToast({ title: '请先登录', icon: 'none' });
				comment.likeLoading = false;
				return;
			}

			try {
				if (comment.liked) {
					// 取消点赞
					const likeRes = await uniCloud.database().collection('user-commentlikes')
						.where({
							user_id: userId,
							comment_id: comment._id
						})
						.get();

					if (likeRes.result.data.length > 0) {
						const likeId = likeRes.result.data[0]._id;
						await uniCloud.database().collection('user-commentlikes')
							.doc(likeId)
							.remove();

						// 更新评论点赞数
						await uniCloud.database().collection('user-comment')
							.doc(comment._id)
							.update({
								like_count: (comment.like_count || 0) - 1
							});

						// 扣除评论作者积分
						await uniCloud.database().collection('user-score')
							.add({
								user_id: comment.author_id,
								score: -2,
								type: 'comment_like',
								description: '评论被取消点赞',
								related_id: comment._id,
								create_time: Date.now()
							});

						comment.liked = false;
						comment.like_count = (comment.like_count || 0) - 1;
						uni.showToast({ title: '已取消点赞', icon: 'none' });
					}
				} else {
					// 添加点赞
					await uniCloud.database().collection('user-commentlikes')
						.add({
							user_id: userId,
							comment_id: comment._id,
							create_time: Date.now()
						});

					// 更新评论点赞数
					await uniCloud.database().collection('user-comment')
						.doc(comment._id)
						.update({
							like_count: (comment.like_count || 0) + 1
						});

					// 给评论作者增加积分
					await uniCloud.database().collection('user-score')
						.add({
							user_id: comment.author_id,
							score: 2,
							type: 'comment_like',
							description: '评论获赞',
							related_id: comment._id,
							create_time: Date.now()
						});

					comment.liked = true;
					comment.like_count = (comment.like_count || 0) + 1;
					uni.showToast({ title: '已点赞', icon: 'none' });
				}
			} catch (err) {
				console.error('点赞操作失败:', err);
				uni.showToast({ title: '操作失败', icon: 'none' });
			} finally {
				comment.likeLoading = false;
			}
		},
		replyToComment(comment) {
			this.replyTo = comment;
			this.replyPlaceholder = `回复 @${comment.author_name}：`;
			this.isInputFocused = true;1
		},
		formatTime(ts) {
			const date = new Date(ts);
			return `${date.getFullYear()}-${date.getMonth()+1}-${date.getDate()} ${date.getHours()}:${date.getMinutes()}`;
		}
	}
};
</script>

<style lang="scss">
@import '@/styles/variables.scss';
@import '@/styles/common.scss';

.pinned-detail-container {
	min-height: 100vh;
	background: #F8F9FC;
	padding-bottom: 120rpx;
}

.content-scroll {
	flex: 1;
	height: calc(100vh - 180rpx);
	padding-bottom: 160rpx;
}

.poster-info.poster-card {
	display: flex;
	align-items: center;
	background: #fff;
	border-radius: 18rpx;
	box-shadow: 0 4rpx 16rpx rgba(231,215,122,0.06);
	padding: 24rpx 24rpx 24rpx 24rpx;
	margin-bottom: 20rpx;
}

.poster-avatar-bg {
	width: 80rpx;
	height: 80rpx;
	border-radius: 50%;
	background: linear-gradient(135deg, #e7d7a7 0%, #f7e7b7 100%);
	display: flex;
	align-items: center;
	justify-content: center;
	margin-right: 20rpx;
}

.avatar {
	width: 64rpx;
	height: 64rpx;
	border-radius: 50%;
	border: 2rpx solid #e5e7eb;
	background: #f5f6fa;
	object-fit: cover;
}

.poster-meta {
	flex: 1;
	display: flex;
	flex-direction: column;
	justify-content: center;
}

.meta-row {
	display: flex;
	align-items: center;
	margin-bottom: 8rpx;
}

.poster-name {
	color: #bfa94d;
	font-size: 32rpx;
	font-weight: 600;
}

.poster-tag {
	margin-left: 16rpx;
	padding: 2rpx 16rpx;
	border-radius: 12rpx;
	font-size: 22rpx;
	font-weight: 500;
	background: #f7e7b7;
	color: #bfa94d;
	&.official {
		background: #f7e7b7;
		color: #bfa94d;
	}
	&.merchant {
		background: #f7e7b7;
		color: #bfa94d;
	}
}

.poster-time {
	color: #b0b6be;
	font-size: 22rpx;
	margin-top: 2rpx;
}

.content-body {
	.content-text {
		font-size: $font-size-base;
		line-height: 1.6;
		color: $dark-gray;
	}
	
	.image-grid {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: $spacing-xs;
		margin-top: $spacing-base;
		
		image {
			width: 100%;
			height: 200rpx;
			border-radius: $border-radius-base;
		}
	}
}

.interaction-bar {
	border-top: 1rpx solid rgba(0, 0, 0, 0.05);
	border-bottom: 1rpx solid rgba(0, 0, 0, 0.05);
	
	.interaction-item {
		display: flex;
		align-items: center;
		
		.iconfont {
			font-size: $font-size-lg;
			color: $gray;
			transition: all 0.3s ease;
			
			&.liked {
				color: #FF4D4F;
			}
			
			&.like-animate {
				animation: likeAnimation 0.5s ease;
			}
		}
		
		.count {
			font-size: $font-size-sm;
			color: $gray;
			transition: color 0.3s ease;
			
			&.liked {
				color: #FF4D4F;
			}
		}
	}
}

@keyframes likeAnimation {
	0% { transform: scale(1); }
	50% { transform: scale(1.4); }
	100% { transform: scale(1); }
}

.comments-section {
	padding: 0 24rpx;
}

.comment-item {
	background: #fff;
	border-radius: 18rpx;
	box-shadow: 0 4rpx 16rpx rgba(77,124,191,0.06);
	margin-bottom: 20rpx;
	padding: 24rpx 24rpx 24rpx 104rpx;
	position: relative;
	min-height: 88rpx;
	
	.comment-avatar {
		position: absolute;
		left: 24rpx;
		top: 24rpx;
		width: 64rpx;
		height: 64rpx;
		border-radius: 50%;
		border: 2rpx solid #e5e7eb;
		background: #f5f6fa;
		object-fit: cover;
	}
	
	.comment-content {
		width: 100%;
	}
	
	.comment-name {
		color: #4D7CBF;
		font-size: 30rpx;
		font-weight: 600;
	}
	
	.comment-text {
		color: #222;
		font-size: 32rpx;
		margin-top: 8rpx;
	}
	
	.comment-actions-bar {
		margin-top: 12rpx;
		display: flex;
		width: 100%;
		align-items: center;
	}
	
	.left-actions {
		display: flex;
		align-items: center;
	}
	
	.comment-time, .action-btn {
		color: #999;
		font-size: 24rpx;
	}
	
	.action-btn {
		margin-left: 32rpx;
		background: #f2f4f8;
		border-radius: 8rpx;
		padding: 0 12rpx;
	}
	
	.right-actions {
		display: flex;
		align-items: center;
		margin-left: auto;
	}
	
	.like-btn-wrapper {
		display: flex;
		align-items: center;
	}
	
	.like-btn {
		font-size: 36rpx;
		color: #b0b6be;
		transition: color 0.2s, transform 0.2s;
		&.like-animate {
			transform: scale(1.3);
		}
		&.liked {
			color: #FF4D4F;
		}
	}
	
	.like-count {
		font-size: 24rpx;
		color: #b0b6be;
		font-weight: 600;
		margin-left: 8rpx;
		transition: color 0.2s;
		&.liked {
			color: #FF4D4F;
		}
	}
}

.comment-input-bar {
	position: fixed;
	bottom: 0;
	left: 0;
	right: 0;
	display: flex;
	align-items: center;
	box-shadow: 0 -2rpx 10rpx rgba(77,124,191,0.06);
	background: #fff;
	padding: 12rpx 24rpx 12rpx 24rpx;
	z-index: 100;
	border-top: 1rpx solid #f0f1f3;

	.comment-input {
		flex: 1;
		height: 64rpx;
		background-color: #f5f6fa;
		border-radius: 32rpx;
		padding: 0 24rpx;
		font-size: 30rpx;
		color: #222;
		border: 1rpx solid #e5e7eb;
		box-shadow: 0 2rpx 8rpx rgba(77,124,191,0.03);
		outline: none;
		transition: border 0.2s, box-shadow 0.2s;
	}
	.comment-input:focus {
		border: 1rpx solid #4D7CBF;
		box-shadow: 0 2rpx 12rpx rgba(77,124,191,0.08);
	}
	.send-btn {
		margin-left: 16rpx;
		padding: 0 32rpx;
		height: 56rpx;
		line-height: 56rpx;
		background-color: #4D7CBF;
		color: #fff;
		border-radius: 28rpx;
		font-size: 28rpx;
		font-weight: 600;
		border: none;
		box-shadow: 0 2rpx 8rpx rgba(77,124,191,0.08);
		transition: background 0.2s, color 0.2s;
		display: flex;
		align-items: center;
		justify-content: center;
	}
	.send-btn:disabled {
		background-color: #b0b6be;
		color: #fff;
	}
}

.header {
	background-color: #fff;
	position: sticky;
	top: 0;
	z-index: 100;
	box-shadow: 0 2rpx 10rpx rgba(77,124,191,0.06);
	.iconfont {
		font-size: 40rpx;
		color: #4D7CBF;
	}
}

.reply-list {
	margin-top: 8rpx;
	padding-left: 16rpx;
}
.reply-item {
	display: flex;
	align-items: flex-start;
	background: #fafbfc;
	border-radius: 12rpx;
	margin-bottom: 8rpx;
	padding: 12rpx 16rpx 12rpx 12rpx;
	box-shadow: 0 2rpx 8rpx rgba(77,124,191,0.02);
}
.reply-avatar {
	width: 48rpx;
	height: 48rpx;
	border-radius: 50%;
	margin-right: 14rpx;
	background: #fff;
}
.reply-content {
	flex: 1;
}
.reply-name {
	color: #4D7CBF;
	font-size: 26rpx;
	font-weight: 500;
}
.reply-time {
	color: #bbb;
	font-size: 22rpx;
	margin-left: 10rpx;
}
.reply-text {
	color: #555;
	font-size: 26rpx;
	margin-top: 4rpx;
	line-height: 1.6;
}

/* 添加加载状态样式 */
.loading-overlay {
	position: fixed;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	background: rgba(255, 255, 255, 0.9);
	display: flex;
	align-items: center;
	justify-content: center;
	z-index: 999;
}

.loading-spinner {
	width: 60rpx;
	height: 60rpx;
	border: 6rpx solid #f3f3f3;
	border-top: 6rpx solid #4D7CBF;
	border-radius: 50%;
	animation: spin 1s linear infinite;
}

@keyframes spin {
	0% { transform: rotate(0deg); }
	100% { transform: rotate(360deg); }
}

/* 优化列表渲染性能 */
.comment-list {
	will-change: transform;
	transform: translateZ(0);
}

.comment-item {
	will-change: transform;
	transform: translateZ(0);
	contain: layout style paint;
}
</style>
