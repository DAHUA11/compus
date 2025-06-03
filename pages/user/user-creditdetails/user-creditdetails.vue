<template>
  <view class="credit-detail-page">
    <view class="credit-summary">
      <view class="credit-score-box">
        <uni-icons :type="levelInfo.icon" size="40" :color="levelInfo.color" />
        <view class="credit-score-value">{{ creditScore }}</view>
        <view class="credit-level">{{ levelInfo.label }}</view>
      </view>
      <view class="credit-desc">当前信用分</view>
    </view>
    <view class="tab-bar credit-tab">
      <view
        v-for="tab in tabs"
        :key="tab.type"
        :class="['tab-item', {active: currentType === tab.type}]"
        @click="switchTab(tab.type)"
      >
        {{ tab.text }}
      </view>
    </view>
    <view class="credit-list">
      <view v-for="item in filteredList" :key="item.id" class="credit-item">
        <uni-icons :type="item.icon" size="20" :color="item.amount > 0 ? '#4CAF50' : '#FF5252'" />
        <view class="credit-info">
          <text class="credit-desc-main">{{ item.desc }}</text>
          <text class="credit-time">{{ item.time }}</text>
        </view>
        <text :class="['credit-amount', item.amount > 0 ? 'plus' : 'minus']">
          {{ item.amount > 0 ? '+' : '' }}{{ item.amount }}
        </text>
      </view>
      <view v-if="filteredList.length === 0" class="empty-tip">暂无明细</view>
    </view>
    <view class="credit-formula">
      <view class="formula-title">信用分计算公式</view>
      <view class="formula-content">
        <text>信用分 = 基础分(100) + 完成次数×2 - 违约次数×10 + 好评率×20</text>
      </view>
    </view>
    <view class="credit-rules">
      <view class="rules-title">信用分分级制度</view>
      <view class="level-list">
        <view class="level-item diamond">
          <uni-icons type="medal-filled" size="24" color="#4FC3F7" />
          <text class="level-label">钻石（120分及以上）：</text>
          <text class="level-desc">优先展示任务</text>
        </view>
        <view class="level-item gold">
          <uni-icons type="medal-filled" size="24" color="#FFD700" />
          <text class="level-label">黄金（100-119）：</text>
          <text class="level-desc">正常权限</text>
        </view>
        <view class="level-item silver">
          <uni-icons type="medal-filled" size="24" color="#B0C4DE" />
          <text class="level-label">白银（80-99）：</text>
          <text class="level-desc">需缴纳押金</text>
        </view>
        <view class="level-item blacklist">
          <uni-icons type="closeempty" size="24" color="#FF5252" />
          <text class="level-label">黑名单（80分以下）：</text>
          <text class="level-desc">限制接单</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      creditScore: 108, // 示例分数，实际应从后端获取
      tabs: [
        { text: '加分明细', type: 'gain' },
        { text: '扣分明细', type: 'cost' }
      ],
      currentType: 'gain',
      creditList: [
        // 加分明细
        { id: 1, type: 'gain', icon: 'checkmark', desc: '完成任务', time: '2024-06-01 10:00', amount: 6 },
        { id: 2, type: 'gain', icon: 'star', desc: '好评率提升', time: '2024-05-30 15:00', amount: 8 },
        { id: 3, type: 'gain', icon: 'chat', desc: '无违约月奖励', time: '2024-05-28 12:00', amount: 4 },
        // 扣分明细
        { id: 4, type: 'cost', icon: 'closeempty', desc: '违约一次', time: '2024-05-27 09:00', amount: -10 },
        { id: 5, type: 'cost', icon: 'closeempty', desc: '多次违约', time: '2024-05-25 18:00', amount: -20 }
      ]
    }
  },
  computed: {
    levelInfo() {
      const score = this.creditScore
      if (score >= 120) {
        return { label: '钻石', icon: 'medal-filled', color: '#4FC3F7' }
      } else if (score >= 100) {
        return { label: '黄金', icon: 'medal-filled', color: '#FFD700' }
      } else if (score >= 80) {
        return { label: '白银', icon: 'medal-filled', color: '#B0C4DE' }
      } else {
        return { label: '黑名单', icon: 'closeempty', color: '#FF5252' }
      }
    },
    filteredList() {
      return this.creditList.filter(item => item.type === this.currentType)
    }
  },
  methods: {
    switchTab(type) {
      this.currentType = type
    }
  }
}
</script>

<style lang="scss">
.credit-detail-page {
  background: linear-gradient(180deg, #f5f6fa 60%, #eaf2ff 100%);
  min-height: 100vh;
  padding-bottom: 40rpx;
}
.credit-summary {
  background: #fff;
  border-radius: 22rpx;
  box-shadow: 0 6px 24px rgba(64,128,255,0.10);
  margin: 36rpx 24rpx 0 24rpx;
  padding: 38rpx 24rpx 28rpx 24rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
}
.credit-score-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 8rpx;
}
.credit-score-value {
  font-size: 44px;
  font-weight: 800;
  color: #4080FF;
  margin: 10rpx 0 2rpx 0;
  letter-spacing: 2px;
}
.credit-level {
  font-size: 20px;
  font-weight: 700;
  color: #222;
}
.credit-desc {
  font-size: 16px;
  color: #888;
  margin-top: 10rpx;
}
.credit-formula {
  background: #fff;
  border-radius: 18rpx;
  margin: 32rpx 24rpx 0 24rpx;
  padding: 26rpx 22rpx 20rpx 22rpx;
  box-shadow: 0 2px 8px rgba(64,128,255,0.08);
}
.formula-title {
  font-size: 17px;
  font-weight: 700;
  color: #4080FF;
  margin-bottom: 10rpx;
}
.formula-content {
  font-size: 15px;
  color: #444;
}
.credit-rules {
  background: #fff;
  border-radius: 18rpx;
  margin: 32rpx 24rpx 0 24rpx;
  padding: 26rpx 22rpx 20rpx 22rpx;
  box-shadow: 0 2px 8px rgba(64,128,255,0.08);
}
.rules-title {
  font-size: 17px;
  font-weight: 700;
  color: #4080FF;
  margin-bottom: 14rpx;
}
.level-list {
  display: flex;
  flex-direction: column;
  gap: 14rpx;
}
.level-item {
  display: flex;
  align-items: center;
  font-size: 16px;
  margin-bottom: 2rpx;
}
.level-label {
  font-weight: 700;
  margin: 0 10rpx;
}
.level-desc {
  color: #666;
}
.diamond .level-label { color: #4FC3F7; }
.gold .level-label { color: #FFD700; }
.silver .level-label { color: #B0C4DE; }
.blacklist .level-label { color: #FF5252; }
.credit-tab {
  margin: 36rpx 24rpx 0 24rpx;
}
.tab-bar {
  display: flex;
  background: #fff;
  border-radius: 16rpx;
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
.credit-list {
  margin: 36rpx 24rpx 0 24rpx;
}
.credit-item {
  background: #fff;
  border-radius: 16rpx;
  box-shadow: 0 2px 8px rgba(64,128,255,0.08);
  padding: 22rpx 20rpx 18rpx 20rpx;
  margin-bottom: 18rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.credit-info {
  flex: 1;
  margin-left: 16rpx;
}
.credit-desc-main {
  font-size: 15px;
  color: #222;
  font-weight: 600;
}
.credit-time {
  font-size: 12px;
  color: #aaa;
  margin-top: 4rpx;
  display: block;
}
.credit-amount {
  font-size: 18px;
  font-weight: 700;
  min-width: 60rpx;
  text-align: right;
}
.credit-amount.plus {
  color: #4CAF50;
}
.credit-amount.minus {
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
