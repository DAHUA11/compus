<template>
	<view class="post-create-container">
		<!-- 分类选择（美化，横向滚动，卡片风格） -->
		<view class="category-bar">
			<view class="category-label">选择分类</view>
			<scroll-view scroll-x class="category-scroll">
				<view class="category-list">
					<view
						v-for="(tag, idx) in tags"
						:key="idx"
						class="category-item"
						:class="{ active: selectedTag === tag }"
						@tap="selectTag(tag)"
					>{{ tag }}</view>
				</view>
			</scroll-view>
		</view>

		<!-- 内容输入 -->
		<view class="content-section">
			<textarea
				class="content-input"
				v-model="content"
				maxlength="1000"
				placeholder="写点什么和大家分享…"
				auto-height
				@input="onInput"
			/>
			<view class="input-count">{{ content.length }}/1000</view>
		</view>

		<!-- 图片/视频添加（在内容输入框下方） -->
		<view class="media-section">
			<view class="media-list">
				<view
					v-for="(img, idx) in images"
					:key="idx"
					class="media-item"
				>
					<image :src="img" mode="aspectFill" class="media-img"></image>
					<view class="media-remove" @tap="removeImage(idx)">×</view>
				</view>
				<view
					v-if="images.length < 9"
					class="media-add"
					@tap="chooseImage"
				>
					<view class="media-add-icon">+</view>
					<view class="media-add-text">照片/视频</view>
				</view>
			</view>
		</view>
		<view class="post-type-section">
  <view class="post-type-label">
    <text class="iconfont icon-tixing" style="margin-right: 8rpx;"></text>
    发布类型：
  </view>
  <view class="post-type-choose" @tap="choosePostType">
    <text>{{ postType === 'pinned' ? '置顶帖子（消耗20积分）' : '最新动态' }}</text>
    <text class="choose-arrow">去选择 ></text>
  </view>
</view>
		<!-- 发布按钮 -->
		<view class="footer">
			<view
				class="btn-publish"
				:class="{ disabled: !canPublish }"
				@tap="canPublish ? publishPost() : null"
			>
				确定发布
			</view>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				tags: ['讨论', '失物招领', '表白', '吐槽', '问答', '官方','商家'],
				selectedTag: '',
				content: '',
				images: [],
				postType: 'post'
			};
		},
		computed: {
			canPublish() {
				return  this.content.trim();
			}
		},
		methods: {
			selectTag(tag) {
				this.selectedTag = tag;
			},
			onInput(e) {
				this.content = e.detail.value || this.content;
			},
			chooseImage() {
				uni.chooseImage({
					count: 9 - this.images.length,
					sizeType: ['compressed'],
					sourceType: ['album', 'camera'],
					success: (res) => {
						this.images = this.images.concat(res.tempFilePaths);
					}
				});
			},
			removeImage(idx) {
				this.images.splice(idx, 1);
			},
				//选择类型
				choosePostType() {
				uni.showActionSheet({
					itemList: ['最新动态', '置顶帖子（消耗20积分）'],
					success: (res) => {
						if (res.tapIndex === 0) {
							this.postType = 'post';
						} else if (res.tapIndex === 1) {
							uni.showModal({
								title: '温馨提示',
								content: '发布置顶帖子需要消耗20积分，是否继续？',
								success: (modalRes) => {
									if (modalRes.confirm) {
										this.postType = 'pinned';
									}
								}
							});
						}
					}
				});
			},
			publishPost() {
				if (!this.canPublish) return;

				// 如果是置顶帖子，先校验积分
				if (this.postType === 'pinned') {
					const userInfo = uni.getStorageSync('uni-id-pages-userInfo')
					const userId = userInfo && userInfo._id ? userInfo._id : ''
					if (!userId) {
						uni.showToast({ title: '请先登录', icon: 'none' });
						return;
					}
					uni.showLoading({ title: '积分校验中...' });
					// 查询user-score表，统计积分
					uniCloud.database().collection('user-score')
						.where({ user_id: userId })
						.get()
						.then(res => {
							let totalScore = 0;
							res.result.data.forEach(item => {
								totalScore += item.score;
							});
							if (totalScore < 20) {
								uni.hideLoading();
								uni.showToast({ title: '积分不足，无法发布置顶帖', icon: 'none' });
								return;
							} else {
								uni.hideLoading();
								this._doPublishPost(); // 通过校验，执行真正的发布
							}
						})
						.catch(() => {
							uni.hideLoading();
							uni.showToast({ title: '积分校验失败', icon: 'none' });
						});
				} else {
					this._doPublishPost(); // 普通帖直接发布
				}
			},
			_doPublishPost() {
				// 显示加载提示
				uni.showLoading({
					title: '发布中...'
				});
				
				// 上传图片
				const uploadTasks = this.images.map(filePath => {
					return new Promise((resolve, reject) => {
						uniCloud.uploadFile({
							filePath: filePath,
							cloudPath: `posts/${Date.now()}-${Math.random().toString(36).slice(-6)}.${filePath.split('.').pop()}`,
							success: res => resolve(res.fileID),
							fail: err => reject(err)
						});
					});
				});
				
				Promise.all(uploadTasks)
					.then(fileIDs => {
						// 从本地存储获取用户id
						const userInfo = uni.getStorageSync('uni-id-pages-userInfo')
						const userId = userInfo && userInfo._id ? userInfo._id : ''
						if (!userId) {
							uni.hideLoading();
							uni.showToast({ title: '请先登录', icon: 'none' });
							return Promise.reject(new Error('请先登录'));
						}
						return uniCloud.callFunction({
							name: 'add-content',
							data: {
								content_type: this.postType,
								category: this.selectedTag,
								content: this.content,
								user_id: userId,
								files: fileIDs
							}
						});
					})
					.then(res => {
						if (res && res.result && res.result.code === 200) {
							uni.hideLoading();
							uni.showToast({ title: '发布成功', icon: 'success' });
							setTimeout(() => { uni.navigateBack(); }, 800);
						} else {
							throw new Error(res.result.msg);
						}
					})
					.catch(err => {
						uni.hideLoading();
						if (err && err.message !== '请先登录') {
							uni.showToast({ title: err.message || '发布失败', icon: 'none' });
						}
					});
			},
		
		}
	}
</script>

<style lang="scss">
	.post-create-container {
		min-height: 100vh;
		background: #fff;
		padding-bottom: 120rpx;
	}
	.category-bar {
		display: flex;
		align-items: flex-start;
		padding: 32rpx 24rpx 0 24rpx;
		background: #fff;
		padding-bottom: 20rpx;
	}
	.category-label {
		font-size: 28rpx;
		color: #333;
		font-weight: 600;
		margin-right: 12rpx;
		margin-top: 8rpx;
		flex-shrink: 0;
		line-height: 1.6;
	}
	.category-scroll {
		flex: 1;
		white-space: nowrap;
	}
	.category-list {
		display: flex;
		align-items: center;
		gap: 18rpx;
	}
	.category-item {
		padding: 12rpx 36rpx;
		background: #f5f6fa;
		border-radius: 32rpx;
		color: #888;
		font-size: 26rpx;
		margin-right: 12rpx;
		border: 2rpx solid transparent;
		transition: all 0.2s;
		font-weight: 500;
		box-shadow: 0 2rpx 8rpx rgba(247,201,72,0.04);
	}
	.category-item.active {
		background: linear-gradient(90deg, #f7c948 0%, #f7e7b7 100%);
		color: #c09853;
		border-color: #f7c948;
		font-weight: 700;
		box-shadow: 0 4rpx 16rpx rgba(247,201,72,0.10);
	}
	.content-section {
		background:#fff;
		margin: 0 0 0 0;
		padding: 24rpx 24rpx 0 24rpx;
	}
	.content-input {
		width: 100%;
		min-height: 300rpx;
		background: #fff;

		font-size: 28rpx;
		color: #333;
		border: none;
		margin-bottom: 8rpx;
	}
	.input-count {
		text-align: right;
		color: #caced3;
		font-size: 22rpx;
		margin-bottom: 12rpx;
	}
	.media-section {
		background:#fff;
		// margin: 0 0 0 0;
		
		padding: 0 24rpx 0 24rpx;
		padding-top: 30rpx;
		padding-bottom: 30rpx;
	}
	.media-list {
		display: flex;
		flex-wrap: wrap;
		gap: 18rpx;
		margin-bottom: 12rpx;
	}
	.media-item {
		position: relative;
	}
	.media-img {
		width: 160rpx;
		height: 160rpx;
		border-radius: 16rpx;
		object-fit: cover;
		background: #f5f6fa;
	}
	.media-remove {
		position: absolute;
		top: -12rpx;
		right: -12rpx;
		background: #f56c6c;
		color: #fff;
		border-radius: 50%;
		width: 32rpx;
		height: 32rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 24rpx;
		z-index: 2;
		box-shadow: 0 2rpx 8rpx rgba(0,0,0,0.10);
	}
	.media-add {
		width: 160rpx;
		height: 160rpx;
		border-radius: 16rpx;
		background: #f5f6fa;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		color: #e0c97b;
		border: 2rpx dashed #f7e7b7;
		cursor: pointer;
	}
	.media-add-icon {
		font-size: 60rpx;
		color: #e0c97b;
		line-height: 1;
	}
	.media-add-text {
		font-size: 24rpx;
		color: #b0b6be;
		margin-top: 8rpx;
	}
	.footer {
		position: fixed;
		left: 0;
		right: 0;
		bottom: 0;
		background: #fff;
		padding: 18rpx 32rpx 24rpx 32rpx;
		z-index: 10;
	}
	.btn-publish {
		width: 92%;
		margin: 0 auto;
		height: 88rpx;
		background: linear-gradient(90deg, #ffe37c 0%, #f7c948 100%);
		color: #333;
		font-size: 32rpx;
		font-weight: 700;
		border-radius: 20rpx;
		letter-spacing: 2rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		opacity: 1;
		transition: background 0.2s, opacity 0.2s;
	}
	.btn-publish.disabled {
		background: #b2b2b4 !important;
		color: #dadde3 !important;
		opacity: 0.7;
		pointer-events: none;
	}
	.post-type-section {
		display: flex;
		align-items: center;
		background: #fff;
		padding: 24rpx;
		border-bottom: 1rpx solid #f5f6fa;
	}
	.post-type-label {
		font-size: 28rpx;
		color: #333;
		font-weight: 600;
		margin-right: 12rpx;
		flex-shrink: 0;
		display: flex;
		align-items: center;
	}
	.post-type-choose {
		flex: 1;
		display: flex;
		align-items: center;
		color: #888;
		font-size: 26rpx;
		justify-content: space-between;
	}
	.choose-arrow {
		color: #b0b6be;
		font-size: 24rpx;
		margin-left: 12rpx;
	}
</style>
