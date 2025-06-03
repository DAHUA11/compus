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
				totalScore: 2580,
				tabs: [
					{ text: '获取明细', type: 'gain' },
					{ text: '扣除明细', type: 'cost' }
				],
				currentType: 'gain',
				scoreList: [
					// 获取明细
					{ id: 1, type: 'gain', icon: 'checkmark', desc: '完成任务', time: '2024-06-01 10:00', amount: 50 },
					{ id: 2, type: 'gain', icon: 'chat', desc: '发布优质帖子', time: '2024-05-30 15:00', amount: 30 },
					{ id: 3, type: 'gain', icon: 'star', desc: '获得好评', time: '2024-05-28 12:00', amount: 20 },
					// 扣除明细
					{ id: 4, type: 'cost', icon: 'gift', desc: '兑换头像框', time: '2024-05-27 09:00', amount: -100 },
					{ id: 5, type: 'cost', icon: 'vip', desc: '兑换会员特权', time: '2024-05-25 18:00', amount: -200 },
					{ id: 6, type: 'cost', icon: 'pushpin', desc: '帖子置顶', time: '2024-05-22 14:00', amount: -50 }
				]
			};
		},
		computed: {
			filteredList() {
				return this.scoreList.filter(item => item.type === this.currentType)
			}
		},
		methods: {
			switchTab(type) {
				this.currentType = type
			},
			goToExchange() {
				uni.showToast({ title: '跳转到兑换页面', icon: 'none' })
				// uni.navigateTo({ url: '/pages/user/score-exchange/score-exchange' })
			}
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
