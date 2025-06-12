<template>
  <view class="container">

    <!-- 表单内容 -->
    <scroll-view class="form-content" scroll-y>
      <!-- 任务信息模块 -->
      <view class="form-section card-shadow">
        <view class="section-title">任务信息</view>

        <!-- 取件地址输入框 -->
        <view class="form-item">
          <view class="item-label info-label">
            <view class="icon-wrapper info-icon">
              <uni-icons type="location" size="18" color="#00BFFF" />
            </view>
            <text class="info-text">取件地址</text>
          </view>
          <view class="item-content location-container" @tap="handleSelectPickupAddress">
            <view class="location-input">
              <text class="placeholder" v-if="!pickupAddress">请选择取件地址</text>
              <text v-else>{{ pickupAddress }}</text>
            </view>
            <uni-icons type="right" size="16" color="#999999" />
          </view>
        </view>

        <!-- 快递单号录入 -->
        <view class="form-item">
          <view class="item-label info-label">
            <view class="icon-wrapper info-icon">
              <uni-icons type="list" size="18" color="#00BFFF" />
            </view>
            <text class="info-text">快递单号</text>
          </view>
          <view class="item-content input-container">
            <input
              type="text"
              v-model="trackingNumber"
              placeholder="请输入快递单号"
              placeholder-class="placeholder"
            />
          </view>
        </view>

         <!-- 自动填充按钮 -->
        <view class="form-item">
          <view class="item-content">
            <button 
              class="auto-fill-btn full-width" 
              @tap="handleAutoFillDormitory"
            >
              <uni-icons type="home-filled" size="14" color="#00BFFF" />
              自动填充信息
            </button>
          </view>
        </view>

        <!-- 送达地址输入框 -->
        <view class="form-item">
          <view class="item-label info-label">
            <view class="icon-wrapper info-icon">
              <uni-icons type="location-filled" size="18" color="#00BFFF" />
            </view>
            <text class="info-text">送达地址</text>
          </view>
          <view class="item-content">
            <view class="location-container" @tap="handleSelectDeliveryAddress">
              <view class="location-input">
                <text class="placeholder" v-if="!deliveryAddress">请选择送达地址或地图标注</text>
                <text v-else>{{ deliveryAddress }}</text>
              </view>
              <uni-icons type="right" size="16" color="#999999" />
            </view>
          </view>
        </view>

        <!-- 收件人信息输入框 -->
        <view class="form-item">
          <view class="item-label info-label">
            <view class="icon-wrapper info-icon">
              <uni-icons type="person" size="18" color="#00BFFF" />
            </view>
            <text class="info-text">收件人姓名</text>
          </view>
          <view class="item-content input-container">
            <input
              type="text"
              v-model="recipientName"
              placeholder="请输入收件人姓名"
              placeholder-class="placeholder"
              maxlength="20"
            />
          </view>
        </view>

       

        <!-- 联系电话输入框 -->
        <view class="form-item">
          <view class="item-label info-label">
            <view class="icon-wrapper info-icon">
              <uni-icons type="phone" size="18" color="#00BFFF" />
            </view>
            <text class="info-text">联系电话</text>
          </view>
          <view class="item-content input-container">
            <input
              type="number"
              v-model="contactPhone"
              placeholder="请输入收件人电话"
              placeholder-class="placeholder"
              maxlength="11"
            />
            <!-- 一键复制粘贴按钮 -->

          </view>
        </view>

       

        <!-- 重量输入框 -->
        <view class="form-item">
          <view class="item-label info-label">
            <view class="icon-wrapper info-icon">
              <uni-icons type="info" size="18" color="#00BFFF" />
            </view>
            <text class="info-text">重量估计</text>
          </view>
          <view class="item-content input-container">
            <input
              type="number"
              v-model="weight"
              placeholder="请输入大概重量(kg)"
              placeholder-class="placeholder"
              @input="calculatePrice"
            />
          </view>
        </view>

        <!-- 价格显示区域 -->
        <view class="form-item">
          <view class="item-label trade-label">
            <view class="icon-wrapper trade-icon">
              <uni-icons type="wallet" size="18" color="#FF9F1C" />
            </view>
            <text class="trade-text">建议价格</text>
          </view>
          <view class="item-content price-container">
            <view class="price-display">
              <text v-if="priceRange.length > 0">¥{{ priceRange[0] }} - ¥{{ priceRange[1] }}</text>
              <text v-else>---</text>
            </view>
            <view class="price-explanation">
              <text v-if="priceExplanation" class="explanation-text">{{ priceExplanation }}</text>
            </view>
          </view>
        </view>
      </view>

      <!-- 悬赏与时效模块 -->
      <view class="form-section card-shadow">
        <view class="section-title">悬赏与时效</view>

        <!-- 悬赏金额输入 -->
        <view class="form-item">
          <view class="item-label trade-label">
            <view class="icon-wrapper trade-icon">
              <uni-icons type="wallet" size="18" color="#FF9F1C" />
            </view>
            <text class="trade-text">悬赏金额</text>
          </view>
          <view class="item-content price-container">
            <view class="price-input-wrapper">
              <view class="price-input">
                <input 
                  type="digit" 
                  v-model="manualReward" 
                  placeholder="请输入悬赏金额(元)"
                  placeholder-class="placeholder"
                />
              </view>
            </view>
          </view>
        </view>

        <!-- 期望送达时间段 -->
        <view class="form-item">
          <view class="item-label trade-label">
            <view class="icon-wrapper trade-icon">
              <uni-icons type="calendar" size="18" color="#FF9F1C" />
            </view>
            <text class="trade-text">期望送达时间段</text>
          </view>
          <view class="item-content select-container">
            <!-- 直接使用picker，点击其可见区域即可触发 -->
            <picker
              mode="multiSelector"
              :range="multiPickerRange"
              :value="multiPickerValue"
              @change="onMultiPickerChange"
            >
              <view class="picker-content select-input">
                <!-- 显示已选时间段或placeholder -->
                <text v-if="expectedDeliveryTime">已选：{{ expectedDeliveryTime }}</text>
                <text v-else>请选择期望送达时间段</text>
              </view>
            </picker>
          </view>
        </view>

        <!-- 加急选项 -->
        <view class="form-item">
          <view class="item-label trade-label">
            <view class="icon-wrapper trade-icon">
              <uni-icons type="notification-filled" size="18" color="#FF9F1C" />
            </view>
            <text class="trade-text">加急发布</text>
          </view>
          <view class="item-content">
            <view class="urgent-option" @tap="handleToggleUrgent">
              <switch :checked="isUrgent" @change="handleUrgentChange" active-color="#00BFFF" />
              <text>加急发布</text>
              <text class="urgent-fee">（价格上浮30%）</text>
            </view>
          </view>
        </view>

        <!-- 价格明细 -->
        <view class="price-breakdown" v-if="isUrgent">
          <view class="breakdown-item">
            <text class="item-label">基础赏金</text>
            <text class="item-value">¥{{ manualReward }}</text>
          </view>
          <view class="breakdown-item">
            <text class="item-label">加急费用</text>
            <text class="item-value">+30%</text>
          </view>
          <view class="breakdown-item total">
            <text class="item-label">总赏金</text>
            <text class="item-value">¥{{ calculateTotalReward() }}</text>
          </view>
        </view>
      </view>

      <!-- 补充说明 -->
      <view class="form-section card-shadow">
        <view class="section-title">补充说明</view>

        <!-- 补充说明输入框 -->
        <view class="form-item">
          <view class="item-label setting-label">
            <view class="icon-wrapper setting-icon">
              <uni-icons type="info" size="18" color="#47B960" />
            </view>
            <text class="setting-text">补充说明</text>
          </view>
          <view class="item-content">
            <textarea
              v-model="specialRequirements"
              placeholder="请补充说明（如：是否是易碎品,是否有特殊物件）"
              placeholder-class="placeholder"
              class="description-textarea"
              maxlength="200"
            />
            <view class="word-count">{{ specialRequirements.length }}/200</view>
          </view>
        </view>
      </view>
	</scroll-view>

    <!-- 底部操作栏 -->
    <view class="bottom-bar">
      <button class="submit-btn" @tap="handleSubmit">发布代拿任务</button>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      // 表单数据
      pickupAddress: '', // 取件地址
      deliveryAddress: '', // 送达地址
      recipientName: '', // 收件人姓名
      contactPhone: '', // 联系电话
      trackingNumber: '', // 快递单号
      itemDescription: '', // 快递物品描述
      weight: '', // 大概重量
      expectedDeliveryTime: '', // 期望送达时间
      specialRequirements: '', // 特殊要求
      isInsured: false, // 是否保价
      insuranceAmount: '', // 保价金额
      manualReward: '', // 手动输入的悬赏金额
      isUrgent: false,

      // 价格相关
      priceRange: [], // 价格区间
      priceExplanation: '', // 价格说明

      // 日期选项
      dateOptions: [
        { label: '今天', value: new Date().toISOString().split('T')[0] },
        { label: '明天', value: new Date(Date.now() + 24*60*60*1000).toISOString().split('T')[0] },
        { label: '后天', value: new Date(Date.now() + 2*24*60*60*1000).toISOString().split('T')[0] }
      ],

      // 时间段选项
      timeSlots: Array.from({ length: 11 }, (_, i) => {
        const hour = i + 9;
        const endHour = hour + 1;
        return `${hour.toString().padStart(2, '0')}:00-${endHour.toString().padStart(2, '0')}:00`;
      }),

      selectedDateIndex: -1,
      selectedTimeSlotIndex: -1,

      // 地址选项
      pickupAddressOptions: [
        { value: '校内中邮', label: '校内中邮' },
        { value: '西门菜鸟', label: '西门菜鸟' },
        { value: '校内顺风', label: '校内顺风' },
        { value: '西门小蜜蜂', label: '西门小蜜蜂' }
      ],

      deliveryAddressOptions: [
        { value: '鹿田', label: '鹿田' },
        { value: '龙北', label: '龙北' },
        { value: '龙南', label: '龙南' }
      ]
    }
  },
  computed: {
    multiPickerRange() {
      return [
        this.dateOptions.map(d => d.label),
        this.timeSlots
      ];
    },
    multiPickerValue() {
      return [
        this.selectedDateIndex === -1 ? 0 : this.selectedDateIndex,
        this.selectedTimeSlotIndex === -1 ? 0 : this.selectedTimeSlotIndex
      ];
    }
  },
  watch: {
    weight: {
      handler: 'calculatePrice',
      immediate: true
    }
  },
  methods: {
    onMultiPickerChange(e) {
      const [dateIdx, timeSlotIdx] = e.detail.value;
      this.selectedDateIndex = dateIdx;
      this.selectedTimeSlotIndex = timeSlotIdx;
      this.updateExpectedDeliveryTime();
    },
    updateExpectedDeliveryTime() {
      if (this.selectedDateIndex !== -1 && this.selectedTimeSlotIndex !== -1) {
        this.expectedDeliveryTime = `${this.dateOptions[this.selectedDateIndex].value} ${this.timeSlots[this.selectedTimeSlotIndex]}`;
      }
    },
    handleSelectPickupAddress() {
      uni.showActionSheet({
        itemList: this.pickupAddressOptions.map(option => option.label),
        success: (res) => {
          this.pickupAddress = this.pickupAddressOptions[res.tapIndex].value;
        }
      });
    },
    handleGetCurrentLocation() {
      uni.getLocation({
        type: 'gcj02',
        success: (res) => {
          const { latitude, longitude } = res;
          uni.request({
            url: `https://apis.map.qq.com/ws/geocoder/v1/?location=${latitude},${longitude}&key=YOUR_MAP_KEY`,
            success: (result) => {
              if (result.data.status === 0) {
                const address = result.data.result.address;
                this.deliveryAddress = address;
                uni.showToast({
                  title: '已获取当前位置',
                  icon: 'success'
                });
              } else {
                uni.showToast({
                  title: '获取地址失败',
                  icon: 'none'
                });
              }
            },
            fail: () => {
              uni.showToast({
                title: '获取地址失败',
                icon: 'none'
              });
            }
          });
        },
        fail: () => {
          uni.showToast({
            title: '获取位置失败',
            icon: 'none'
          });
        }
      });
    },
    handleSelectDeliveryAddress() {
      uni.showActionSheet({
        itemList: [...this.deliveryAddressOptions.map(option => option.label), '手动输入'],
        success: (res) => {
          if (res.tapIndex < this.deliveryAddressOptions.length) {
            this.deliveryAddress = this.deliveryAddressOptions[res.tapIndex].value;
          }
        }
      });
    },
    handleAutoFillRecipient() {
      uni.showToast({
        title: '自动填充功能待实现',
        icon: 'none'
      });
    },
    handleCopyPhoneNumber() {
      if (this.contactPhone) {
        uni.setClipboardData({
          data: this.contactPhone,
          success: () => {
            uni.showToast({
              title: '手机号已复制',
              icon: 'success'
            });
          }
        });
      } else {
        uni.showToast({
          title: '手机号为空',
          icon: 'none'
        });
      }
    },
    handleToggleInsurance() {
      this.isInsured = !this.isInsured;
      if (!this.isInsured) {
        this.insuranceAmount = '';
      }
    },
    handleUrgentChange(e) {
      this.isUrgent = e.detail.value;
    },
    calculateTotalReward() {
      const baseReward = parseFloat(this.manualReward) || 0;
      if (this.isUrgent) {
        return (baseReward * 1.3).toFixed(2);
      }
      return baseReward.toFixed(2);
    },
    handleSubmit() {
      if (!this.pickupAddress) {
        uni.showToast({
          title: '请输入取件地址',
          icon: 'none'
        });
        return;
      }
      if (!this.deliveryAddress) {
        uni.showToast({
          title: '请输入送达地址',
          icon: 'none'
        });
        return;
      }
      if (!this.expectedDeliveryTime) {
        uni.showToast({
          title: '请选择期望送达时间',
          icon: 'none'
        });
        return;
      }
      if (!this.manualReward) {
        uni.showToast({
          title: '请输入赏金金额',
          icon: 'none'
        });
        return;
      }
      if (!this.specialRequirements) {
        uni.showToast({
          title: '请填写详细描述',
          icon: 'none'
        });
        return;
      }
      if (!this.recipientName) {
        uni.showToast({
          title: '请输入收件人姓名',
          icon: 'none'
        });
        return;
      }
      if (!this.contactPhone) {
        uni.showToast({
          title: '请输入联系电话',
          icon: 'none'
        });
        return;
      }

      const taskData = {
        type: 'express',
        status: 'pending',
        title: '快递代取',
        description: this.specialRequirements,
        tags: this.isUrgent ? ['加急'] : [],
        reward: parseFloat(this.calculateTotalReward()),
        publishTime: new Date().toLocaleString('zh-CN'),
        expectedDeliveryTime: this.expectedDeliveryTime,
        pickupAddress: this.pickupAddress,
        deliveryAddress: this.deliveryAddress,
        trackingNumber: this.trackingNumber,
        contactName: this.recipientName,
        contactPhone: this.contactPhone,
        latestUpdate: '等待接单中',
        images: [],
        publisher: {
          id: 'currentUserId',
          nickname: '当前用户昵称',
          avatar: '/static/avatar.png',
          creditRating: 5
        }
      };

      console.log('提交的任务数据:', taskData);

      uni.showToast({
        title: '发布成功',
        icon: 'success',
        success: () => {
          const taskInfoString = encodeURIComponent(JSON.stringify(taskData));
          uni.navigateTo({
            url: `/pages/task/TaskDetail/TaskDetail?taskInfo=${taskInfoString}`
          });
        }
      });
    },
    calculatePrice() {
      if (this.weight) {
        const weightValue = parseFloat(this.weight);
        if (weightValue <= 1) {
          this.priceRange = [5, 8];
          this.priceExplanation = '1千克以内（含1千克）：基础价5元 + 重量浮动0-3元';
        } else if (weightValue <= 3) {
          this.priceRange = [8, 12];
          this.priceExplanation = '1-3千克（含3千克）：基础价8元 + 重量浮动0-4元';
        } else if (weightValue <= 5) {
          this.priceRange = [12, 18];
          this.priceExplanation = '3-5千克（含5千克）：基础价12元 + 重量浮动0-6元';
        } else {
          this.priceRange = [18, 25];
          this.priceExplanation = '5千克以上：基础价18元 + 重量浮动0-7元';
        }
      } else {
        this.priceRange = [];
        this.priceExplanation = '';
      }
    },
    handleAutoFillDormitory() {
      uni.showToast({
        title: '自动填充功能待实现',
        icon: 'none'
      });
    }
  }
}
</script>

<style>
:root {
  --primary-color: #00BFFF /* 主色调 - 天蓝色 */
  --secondary-color: #FF9F1C /* 辅助色 - 活力橙 */
  --success-color: #47B960 /* 成功色 - 清新绿 */
  --error-color: #FF4D4F /* 错误色 */
  --bg-color: #F0F8FF /* 背景色 - 淡蓝白 */
  --info-color: #00BFFF /* 任务信息区颜色 */
  --trade-color: #FF9F1C /* 悬赏与时效模块颜色 */
  --setting-color: #47B960 /* 特殊要求模块颜色 */
}

.container {
  min-height: 100vh;
  background-color: var(--bg-color);
  display: flex;
  flex-direction: column
}

.form-content {
  flex: 1;
  padding: 30rpx;
  padding-bottom: calc(30rpx + 120rpx)
}

.form-section {
  background-color: #ffffff;
  border-radius: 16rpx;
  padding: 30rpx;
  margin-bottom: 20rpx
}

.card-shadow {
  box-shadow: 0 8px 24px rgba(0, 191, 255, 0.08)
}

.section-title {
  font-size: 16px;
  font-weight: 500;
  color: #333333;
  margin-bottom: 20rpx
}

.form-item {
  margin-bottom: 30rpx;
  position: relative
}

.form-item:not(:last-child)::after {
  content: "";
  display: block;
  height: 1px;
  background: linear-gradient(to right, transparent, #E0F3FF, transparent);
  margin: 20rpx 0
}

.form-item:last-child {
  margin-bottom: 0
}

.item-label {
  font-size: 14px;
  margin-bottom: 12rpx;
  display: flex;
  align-items: center;
  gap: 12rpx
}

.info-label {
  color: var(--info-color)
}

.info-icon {
  background-color: rgba(0, 191, 255, 0.1)
}

.info-text {
  font-weight: 500
}

.trade-label {
  color: var(--trade-color)
}

.trade-icon {
  background-color: rgba(255, 159, 28, 0.1)
}

.trade-text {
  font-weight: 500
}

.setting-label {
  color: var(--setting-color)
}

.setting-icon {
  background-color: rgba(71, 185, 96, 0.1)
}

.setting-text {
  font-weight: 500
}

.icon-wrapper {
  width: 45rpx;
  height: 45rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center
}

.item-label text {
  font-size: 14px;
  color: #666666
}

.item-content {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  width: 100%
}

.location-container {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #ffffff;
  border: 1px solid #e8e8e8;
  border-radius: 8rpx;
  padding: 20rpx;
  min-height: 80rpx
}

.location-input {
  flex: 1;
  display: flex;
  align-items: center;
  font-size: 14px;
  color: #333333
}

.placeholder {
  color: #999999;
  font-size: 14px
}

.input-container {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 12rpx
}

.input-container input {
  flex: 1;
  font-size: 14px;
  color: #333333;
  border: 1px solid #e8e8e8;
  border-radius: 8rpx;
  padding: 10rpx;
  box-sizing: border-box
}

.auto-fill-btn,
.copy-paste-btn {
  display: flex;
  align-items: center;
  padding: 8rpx 16rpx;
  border: 1px solid var(--primary-color);
  border-radius: 8rpx;
  color: var(--primary-color);
  font-size: 12px;
  gap: 4rpx;
  transition: all 0.2s ease
}

.auto-fill-btn:active,
.copy-paste-btn:active {
  opacity: 0.8
}

.description-textarea {
  width: 100%;
  height: 200rpx;
  font-size: 14px;
  color: #333333;
  line-height: 1.5;
  border: 1px solid #e8e8e8;
  border-radius: 8rpx;
  padding: 10rpx;
  transition: all 0.2s;
  box-sizing: border-box
}

.description-textarea:focus {
  border-color: var(--primary-color);
  box-shadow: 0 2px 8px rgba(0, 191, 255, 0.1)
}

.word-count {
  text-align: right;
  font-size: 12px;
  color: #999999;
  margin-top: 8rpx
}

.price-container {
  display: flex;
  align-items: center;
  gap: 20rpx;
  width: 100%
}

.price-input-wrapper {
  flex: 1
}

.price-input {
  display: flex;
  align-items: center;
  padding: 16rpx 24rpx;
  background: linear-gradient(135deg, #f9f9f9, #ffffff);
  border-radius: 12rpx;
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.05), 0 2px 8px rgba(0, 191, 255, 0.1);
  border: 1px solid #e0e8f0;
  transition: all 0.3s ease
}

.price-input:focus-within {
  border-color: var(--primary-color);
  box-shadow: inset 0 2px 6px rgba(0, 191, 255, 0.1), 0 4px 12px rgba(0, 191, 255, 0.15)
}

.price-input input {
  flex: 1;
  font-size: 14px;
  color: #333;
  border: none;
  background: transparent;
  height: 100%;
  padding: 0;
  box-sizing: content-box
}

.ai-price-btn {
  display: flex;
  align-items: center;
  padding: 16rpx 24rpx;
  background: linear-gradient(135deg, #37e047, #fff);
  border-radius: 12rpx;
  border: 1px solid #37e047;
  color: var(--secondary-color);
  font-size: 14px;
  box-shadow: 0 2px 8px rgba(255, 159, 28, 0.1);
  transition: all 0.3s ease;
  gap: 8rpx
}

.ai-price-btn:active {
  transform: translateY(2px);
  box-shadow: 0 1px 4px rgba(255, 159, 28, 0.1)
}

.bargain-option, .urgent-option {
  display: flex;
  align-items: center
}

.bargain-option text, .urgent-option text {
  font-size: 14px;
  color: #666666;
  margin-left: 8rpx
}

.urgent-fee {
  color: #ff4d4f
}

.bottom-bar-placeholder {
  height: 120rpx;
  padding-bottom: env(safe-area-inset-bottom)
}

.bottom-bar {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #ffffff;
  padding: 20rpx 30rpx;
  padding-bottom: calc(20rpx + env(safe-area-inset-bottom));
  box-shadow: 0 -2px 8px rgba(0,0,0,0.05);
  display: flex;
  gap: 20rpx;
  z-index: 10
}

.submit-btn {
  flex: 1;
  height: 88rpx;
  line-height: 88rpx;
  text-align: center;
  background-color: var(--primary-color);
  color: #ffffff;
  font-size: 16px;
  border-radius: 44rpx;
  box-shadow: 0 8px 24px rgba(0, 191, 255, 0.3);
  transition: all 0.2s
}

.submit-btn:active {
  transform: translateY(2px);
  box-shadow: 0 4px 12px rgba(0, 191, 255, 0.2)
}

.reward-unit {
  color: rgb(255, 159, 28);
  margin-left: 10rpx;
  font-size: 14px
}

.price-range-info {
  font-size: 14px;
  color: #666;
  margin-top: 8rpx
}

.reward-amount {
  font-size: 18px;
  color: #FF9F1C;
  font-weight: bold
}

.price-explanation {
  margin-top: 8rpx
}

.explanation-text {
  font-size: 12px;
  color: #666;
  line-height: 1.4
}

.price-display {
  font-size: 16px;
  color: #FF9F1C;
  font-weight: 500
}

.auto-fill-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16rpx 24rpx;
  background: linear-gradient(135deg, #f9f9f9, #ffffff);
  border-radius: 12rpx;
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.05), 0 2px 8px rgba(0, 191, 255, 0.1);
  border: 1px solid #e0e8f0;
  transition: all 0.3s ease;
  gap: 8rpx
}

.auto-fill-btn:active {
  transform: translateY(2px);
  box-shadow: 0 1px 4px rgba(0, 191, 255, 0.1)
}

.full-width {
  width: 100%
}

.price-breakdown {
  margin-top: 20rpx;
  padding: 20rpx;
  background: #f9f9f9;
  border-radius: 8rpx
}

.breakdown-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12rpx
}

.breakdown-item:last-child {
  margin-bottom: 0
}

.breakdown-item.total {
  margin-top: 12rpx;
  padding-top: 12rpx;
  border-top: 1px solid #e8e8e8;
  font-weight: 500
}

.item-label {
  color: #666;
  font-size: 14px
}

.item-value {
  color: #FF9F1C;
  font-size: 14px
}

.breakdown-item.total .item-value {
  color: #FF4D4F;
  font-size: 16px
}
</style>
