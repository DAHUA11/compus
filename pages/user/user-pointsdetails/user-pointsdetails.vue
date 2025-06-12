<template>
	<view class="score-detail-page">
		<view class="score-summary">
			<text class="score-label">当前积分</text>
			<text class="score-value">{{ totalScore }}</text>
			<button class="exchange-btn" @click="goToExchange">积分兑换</button>
		</view>
		<view class="tab-bar">
			<view
				v-for="tab in tabs"
				:key="tab.type"
				:class="['tab-item', {active: currentType === tab.type}]"
				@click="switchTab(tab.type)"
			>
				{{ tab.text }}
			</view>
		</view>
		<view class="score-list">
			<view v-for="item in filteredList" :key="item.id" class="score-item">
				<uni-icons :type="item.icon" size="20" :color="item.amount > 0 ? '#4CAF50' : '#FF5252'" />
				<view class="score-info">
					<text class="score-desc">{{ item.desc }}</text>
					<text class="score-time">{{ item.time }}</text>
				</view>
				<text :class="['score-amount', item.amount > 0 ? 'plus' : 'minus']">
					{{ item.amount > 0 ? '+' : '' }}{{ item.amount }}
				</text>
			</view>
			<view v-if="filteredList.length === 0" class="empty-tip">暂无明细</view>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				totalScore: 0,
				tabs: [
					{ text: '获取明细', type: 'gain' },
					{ text: '扣除明细', type: 'cost' }
				],
				currentType: 'gain',
				scoreList: []
			};
		},
		computed: {
			filteredList() {
				return this.scoreList.filter(item => item.type === this.currentType)
			}
		},
		methods: {
			// 获取积分记录
			async getScoreRecords() {
				try {
					const userInfo = uni.getStorageSync('uni-id-pages-userInfo')
					if (!userInfo || !userInfo._id) {
						uni.showToast({
							title: '请先登录',
							icon: 'none'
						})
						return
					}
					
					const db = uniCloud.database()
					const { result } = await db.collection('user-score')
						.where({
							user_id: userInfo._id
						})
						.orderBy('create_time', 'desc')
						.get()
					
					if (result && result.data) {
						// 处理积分记录
						this.scoreList = result.data.map(record => {
							const isGain = record.score > 0
							return {
								id: record._id,
								type: isGain ? 'gain' : 'cost',
								icon: this.getIconByType(record.type),
								desc: record.description || this.getDescriptionByType(record.type),
								time: this.formatTime(record.create_time),
								amount: record.score
							}
						})
						
						// 计算总积分
						this.totalScore = this.scoreList.reduce((sum, record) => sum + record.amount, 0)
					}
				} catch (error) {
					console.error('获取积分记录失败：', error)
					uni.showToast({
						title: '获取积分记录失败',
						icon: 'none'
					})
				}
			},
			
			// 根据类型获取图标
			getIconByType(type) {
				const iconMap = {
					'post_pin': 'pushpin',
					'post_like': 'heart',
					'comment_like': 'chat',
					'daily_sign': 'calendar',
					'task-review': 'star',
					'activity_create': 'plus',
					'activity_join': 'person',
					'task-finished': 'checkmark'
				}
				return iconMap[type] || 'info'
			},
			
			// 根据类型获取描述
			getDescriptionByType(type) {
				const descMap = {
					'post_pin': '帖子置顶',
					'post_like': '帖子获赞',
					'comment_like': '评论获赞',
					'daily_sign': '每日签到',
					'task-review': '任务评价',
					'activity_create': '创建活动',
					'activity_join': '参与活动',
					'task-finished': '完成任务'
				}
				return descMap[type] || '积分变动'
			},
			
			// 格式化时间
			formatTime(timestamp) {
				const date = new Date(timestamp)
				const year = date.getFullYear()
				const month = String(date.getMonth() + 1).padStart(2, '0')
				const day = String(date.getDate()).padStart(2, '0')
				const hour = String(date.getHours()).padStart(2, '0')
				const minute = String(date.getMinutes()).padStart(2, '0')
				return `${year}-${month}-${day} ${hour}:${minute}`
			},
			
			switchTab(type) {
				this.currentType = type
			},
			
			goToExchange() {
				uni.showToast({ title: '跳转到兑换页面', icon: 'none' })
				// uni.navigateTo({ url: '/pages/user/score-exchange/score-exchange' })
			}
		},
		
		onLoad() {
			this.getScoreRecords()
		},
		
		onShow() {
			this.getScoreRecords()
		}
	}
</script>

<style lang="scss">
	.score-detail-page {
		background: #f5f6fa;
		min-height: 100vh;
		padding-bottom: 40rpx;
	}
	.score-summary {
		background: #fff;
		border-radius: 18rpx;
		box-shadow: 0 4px 16px rgba(64,128,255,0.10);
		margin: 32rpx 24rpx 0 24rpx;
		padding: 32rpx 24rpx 24rpx 24rpx;
		display: flex;
		align-items: center;
		justify-content: space-between;
		position: relative;
	}
	.score-label {
		font-size: 15px;
		color: #888;
	}
	.score-value {
		font-size: 32px;
		font-weight: 700;
		color: #4080FF;
		margin: 0 16rpx;
	}
	.exchange-btn {
		font-size: 14px;
		color: #fff;
		background: linear-gradient(90deg, #4080FF, #60A9FF);
		border-radius: 24rpx;
		padding: 10rpx 28rpx;
		border: none;
	}
	.tab-bar {
		display: flex;
		background: #fff;
		border-radius: 16rpx;
		margin: 32rpx 24rpx 0 24rpx;
		box-shadow: 0 2px 8px rgba(0,0,0,0.04);
		overflow: hidden;
	}
	.tab-item {
		flex: 1;
		text-align: center;
		padding: 28rpx 0;
		font-size: 17px;
		color: #888;
		cursor: pointer;
		transition: color 0.2s;
		letter-spacing: 1px;
	}
	.tab-item.active {
		color: #4080FF;
		font-weight: 700;
		background: linear-gradient(to right, #eaf2ff, #f5faff);
		box-shadow: 0 2px 8px rgba(64,128,255,0.06);
	}
	.score-list {
		margin: 36rpx 24rpx 0 24rpx;
	}
	.score-item {
		background: #fff;
		border-radius: 16rpx;
		box-shadow: 0 2px 8px rgba(64,128,255,0.08);
		padding: 22rpx 20rpx 18rpx 20rpx;
		margin-bottom: 18rpx;
		display: flex;
		align-items: center;
		justify-content: space-between;
	}
	.score-info {
		flex: 1;
		margin-left: 16rpx;
	}
	.score-desc {
		font-size: 15px;
		color: #222;
		font-weight: 600;
	}
	.score-time {
		font-size: 12px;
		color: #aaa;
		margin-top: 4rpx;
		display: block;
	}
	.score-amount {
		font-size: 18px;
		font-weight: 700;
		min-width: 60rpx;
		text-align: right;
	}
	.score-amount.plus {
		color: #4CAF50;
	}
	.score-amount.minus {
		color: #FF5252;
	}
	.empty-tip {
		text-align: center;
		color: #bbb;
		margin-top: 80rpx;
		font-size: 17px;
		letter-spacing: 1px;
	}
</style>
