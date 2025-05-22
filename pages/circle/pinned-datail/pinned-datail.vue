<template>
	<view class="pinned-detail-container">
		<!-- 内容区域 -->
		<scroll-view class="content-scroll" scroll-y="true">
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
						<text class="count ml-xs">{{post.likes}}</text>
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
					<view class="comment-item" v-for="(comment, index) in comments" :key="index">
						<image class="comment-avatar" :src="comment.avatar" mode="aspectFill"></image>
						<view class="comment-content">
							<view class="flex items-center">
								<text class="comment-name font-bold">{{comment.name}}</text>
							</view>
							<text class="comment-text mt-xs">{{comment.content}}</text>
							<view class="comment-actions-bar flex mt-xs">
								<view class="left-actions flex items-center">
									<text class="comment-time text-muted text-xs">{{comment.time}}</text>
									<text class="action-btn ml-base" @tap="replyComment(index)">回复</text>
								</view>
								<view class="right-actions flex items-center ml-auto">
									<view class="like-btn-wrapper flex items-center">
										<text class="iconfont like-btn"
											:class="[comment.liked ? 'icon-aixin4 liked' : 'icon-aixin3', comment.likeAnimate ? 'like-animate' : '']"
											@tap="likeComment(index)"></text>
										<text class="like-count ml-xs" :class="{'liked': comment.liked}">{{comment.likes}}</text>
									</view>
								</view>
							</view>
							<!-- 子评论展示 -->
							<view v-if="comment.replies && comment.replies.length" class="reply-list">
								<view class="reply-item" v-for="(reply, rIdx) in comment.replies" :key="rIdx">
									<image class="reply-avatar" :src="reply.avatar" mode="aspectFill"></image>
									<view class="reply-content">
										<view class="flex items-center">
											<text class="reply-name">{{reply.name}}</text>
											<text class="reply-time ml-xs">{{reply.time}}</text>
										</view>
										<text class="reply-text mt-xs">{{reply.content}}</text>
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
				:placeholder="replyToIndex !== null ? '回复' + comments[replyToIndex].name + '的评论' : '说点什么...'"
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
		return {
			post: {
				id: 1,
				avatar: 'https://picsum.photos/id/1/48/48',
				name: '校园公告',
				type: '商家',
				time: '2小时前',
				content: '各位同学请注意，学校将于5月25日至5月27日进行教学楼维修改造工程，期间相关教室将暂停使用，请大家合理安排学习时间。',
				images: [
					'https://picsum.photos/id/20/200/200',
					'https://picsum.photos/id/21/200/200',
					'https://picsum.photos/id/22/200/200'
				],
				likes: 128,
				comments: 36,
				isLiked: false
			},
			comments: [
				{
					avatar: 'https://picsum.photos/id/3/48/48',
					name: '张三',
					time: '1小时前',
					content: '收到，谢谢通知！',
					likes: 5,
					replies: []
				},
				{
					avatar: 'https://picsum.photos/id/4/48/48',
					name: '李四',
					time: '30分钟前',
					content: '请问具体是哪些教室会暂停使用呢？',
					likes: 3,
					replies: []
				}
			],
			commentText: '',
			isInputFocused: false,
			replyToIndex: null // 记录当前回复哪条评论
		};
	},
	onLoad(options) {
		// 获取帖子ID并加载数据
		const postId = options.id;
		// 实际项目中应该根据ID请求数据
		console.log('加载帖子ID:', postId);
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
		handleLike() {
			if (!this.post.isLiked) {
				this.post.isLiked = true;
				this.post.likes++;
				this.post.likeAnimate = true;
				setTimeout(() => { this.post.likeAnimate = false; }, 350);
			} else {
				this.post.isLiked = false;
				this.post.likes--;
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
		sendComment() {
			if (!this.commentText.trim()) return;
			if (this.replyToIndex !== null) {
				// 回复子评论
				this.comments[this.replyToIndex].replies = this.comments[this.replyToIndex].replies || [];
				this.comments[this.replyToIndex].replies.push({
					avatar: 'https://picsum.photos/id/5/48/48',
					name: '我',
					time: '刚刚',
					content: this.commentText
				});
				this.replyToIndex = null;
			} else {
				// 一级评论
				this.comments.unshift({
					avatar: 'https://picsum.photos/id/5/48/48',
					name: '我',
					time: '刚刚',
					content: this.commentText,
					likes: 0,
					replies: []
				});
				this.post.comments++;
			}
			this.commentText = '';
		},
		likeComment(index) {
			// 点赞动画和高亮
			const comment = this.comments[index];
			if (!comment.liked) {
				comment.liked = true;
				comment.likes++;
				comment.likeAnimate = true;
				setTimeout(() => { comment.likeAnimate = false; }, 350);
			} else {
				comment.liked = false;
				comment.likes--;
			}
		},
		replyComment(index) {
			this.replyToIndex = index;
			this.commentText = '';
			this.isInputFocused = true;
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
		}
		
		.count {
			font-size: $font-size-sm;
			color: $gray;
		}
	}
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
</style>
