<template>
  <view class="container">

    <!-- 表单内容 -->
    <scroll-view class="form-content" scroll-y>
      <!-- 任务信息模块 -->
      <view class="form-section card-shadow">
        <view class="section-title">任务信息</view>

        <!-- 外卖订单号录入 -->
        <view class="form-item">
          <view class="item-label info-label">
            <view class="icon-wrapper info-icon">
              <uni-icons type="image" size="18" color="#00BFFF" />
            </view>
            <text class="info-text">外卖订单</text>
          </view>
          <view class="item-content">
            <view class="upload-container">
              <!-- 上传按钮，当图片数量小于9时显示 -->
              <view class="upload-box" v-if="orderImages.length < 9" @tap="handleUploadOrder">
                <uni-icons type="camera" size="24" color="#999999" />
                <text class="upload-text">上传订单截图</text>
            </view>
              <!-- 图片预览区域 -->
              <view v-if="orderImages.length > 0" class="images-preview">
                 <view class="image-preview-item" v-for="(image, index) in orderImages" :key="index">
                   <image :src="image" mode="aspectFill" class="preview-image" @tap="previewImage(image)" />
                   <view class="delete-btn" @tap.stop="deleteImage(index)">
                     <uni-icons type="clear" size="16" color="#fff" />
                   </view>
                 </view>
              </view>
            </view>
          </view>
        </view>

        <!-- 取餐地址输入框 -->
        <view class="form-item">
          <view class="item-label info-label">
            <view class="icon-wrapper info-icon">
              <uni-icons type="location" size="18" color="#00BFFF" />
            </view>
            <text class="info-text">取餐地址</text>
          </view>
          <view class="item-content input-container">
            <input
              type="text"
              v-model="pickupAddress"
              placeholder="请输入取餐地址"
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
            <view class="address-input-container">
              <view class="address-input-wrapper">
                <input
                  type="text"
                  v-model="deliveryAddress"
                  placeholder="请输入或选择送达地址"
                  placeholder-class="placeholder"
                  class="address-input"
                />
            </view>
            </view>
          </view>
        </view>

        <!-- 收件人姓名输入框 -->
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
              v-model="realPhone"
              placeholder="请输入收件人电话"
              placeholder-class="placeholder"
              maxlength="11"
            />
          </view>
          <view class="phone-tip">
            <text class="tip-text">系统将自动生成虚拟号码保护您的隐私，接单人接单后可见真实号码</text>
          </view>
        </view>

        <!-- 期望送达时间 -->
        <view class="form-item">
          <view class="item-label trade-label">
            <view class="icon-wrapper trade-icon">
              <uni-icons type="calendar" size="18" color="#FF9F1C" />
            </view>
            <text class="trade-text">期望送达时间</text>
          </view>
          <view class="item-content select-container" @tap="handleSelectDeliveryTime">
            <view class="select-input" :class="{ 'has-value': expectedDeliveryTime }">
              <text v-if="!expectedDeliveryTime">请选择送达时间段</text>
              <text v-else>{{ expectedDeliveryTime }}</text>
            </view>
            <uni-icons type="right" size="16" color="#999999" />
          </view>
        </view>

        <!-- 特殊要求 -->
        <view class="form-item">
          <view class="item-label setting-label">
            <view class="icon-wrapper setting-icon">
              <uni-icons type="info" size="18" color="#47B960" />
            </view>
            <text class="setting-text">特殊要求</text>
          </view>
          <view class="item-content">
            <textarea
              v-model="specialRequirements"
              placeholder="请填写特殊要求（如：优先取餐、需保温/冷藏）"
              placeholder-class="placeholder"
              class="description-textarea"
              maxlength="200"
            />
            <view class="word-count">{{ specialRequirements.length }}/200</view>
          </view>
        </view>

        <!-- 外卖份数输入框 -->
        <view class="form-item">
          <view class="item-label trade-label">
            <view class="icon-wrapper trade-icon">
              <uni-icons type="list" size="18" color="#FF9F1C" />
            </view>
            <text class="trade-text">外卖份数</text>
          </view>
          <view class="item-content input-container">
            <input
              type="number"
              :value="foodQuantity"
              @input="handleQuantityChange($event.detail.value)"
              placeholder="请输入外卖份数"
              placeholder-class="placeholder"
              class="quantity-input"
              min="1"
              max="10"
            />
          </view>
        </view>

        <!-- 价格计算器 -->
        <view class="form-item price-calculator" v-if="foodQuantity && foodQuantity !== ''">
          <view class="calculator-header">
            <text class="calculator-title">平台预估价格</text>
            <text class="calculator-price">¥{{ calculatePrice }}</text>
            </view>
          
          <view class="price-breakdown">
            <view class="breakdown-item">
              <text class="item-label">基础价</text>
              <text class="item-value">¥{{ basePrice }}</text>
          </view>
            <view class="breakdown-item">
              <text class="item-label">份数加价</text>
              <text class="item-value">¥{{ (parseInt(foodQuantity) - 1) * perUnitPrice }}</text>
            </view>
            <view class="breakdown-item" v-if="deliveryAddress.includes('留学生公寓')">
              <text class="item-label">远距离加价</text>
              <text class="item-value">¥{{ distanceSurcharge }}</text>
            </view>
            <view class="breakdown-item" v-if="isRush">
              <text class="item-label">加急小费</text>
              <text class="item-value">+30%</text>
        </view>
      </view>

          <!-- 加急选项 -->
          <view class="rush-option">
            <view class="rush-header">
              <view class="rush-title-wrapper">
                <text class="rush-title">加急配送</text>
            </view>
              <switch :checked="isRush" @change="(e) => isRush = e.detail.value" color="#FF9F1C" class="rush-switch" />
          </view>
            <view class="rush-details" v-if="isRush">
              <view class="rush-benefits">
                <view class="benefit-item">
                  <view class="benefit-icon">
                    <uni-icons type="checkmarkempty" size="14" color="#47B960" />
            </view>
                  <text class="benefit-text">优先推送给代拿员</text>
                </view>
                <view class="benefit-item">
                  <view class="benefit-icon">
                    <uni-icons type="checkmarkempty" size="14" color="#47B960" />
                  </view>
                  <text class="benefit-text">价格上浮30%</text>
                </view>
              </view>
            </view>
          </view>
        </view>

        <!-- 悬赏金额输入框 -->
        <view class="form-item">
          <view class="item-label trade-label">
            <view class="icon-wrapper trade-icon">
              <uni-icons type="wallet" size="18" color="#FF9F1C" />
            </view>
            <text class="trade-text">悬赏金额</text>
          </view>
          <view class="item-content input-container">
            <input
              type="digit"
              v-model="rewardAmount"
              placeholder="请输入悬赏金额(元)"
              placeholder-class="placeholder"
              class="reward-input"
            />
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
      pickupAddress: '', // 取货地址
      deliveryAddress: '', // 送达地址
      recipientName: '', // 收件人姓名
      realPhone: '', // 真实电话号码
      virtualPhone: '', // 虚拟电话号码
      orderImages: [], // 订单截图 (多张，使用数组)
      expectedDeliveryTime: '', // 期望送达时间段
      specialRequirements: '', // 特殊要求
      hidePhoneNumber: true, // 默认隐藏真实号码
      rewardAmount: '', // 悬赏金额
      foodQuantity: '1', // 外卖份数
      isRush: false, // 是否加急

      // 价格计算相关
      basePrice: 5, // 基础价格
      perUnitPrice: 2, // 每份加价
      distanceSurcharge: 3, // 远距离加价
      rushFeeRate: 0.3 // 加急费率
    }
  },
  computed: {
    // 计算预估价格
    calculatePrice() {
      const quantity = parseInt(this.foodQuantity) || 1;
      const isLongDistance = this.deliveryAddress.includes('留学生公寓');

      // 基础计算
      let totalPrice = this.basePrice + (quantity - 1) * this.perUnitPrice;
      if (isLongDistance) {
        totalPrice += this.distanceSurcharge;
      }
      
      // 加急费用
      if (this.isRush) {
        totalPrice = Math.ceil(totalPrice * (1 + this.rushFeeRate));
      }
      
      return totalPrice;
    }
  },
  watch: {
    // 监听价格变化，自动填充悬赏金额
    calculatePrice(newPrice) {
      this.rewardAmount = newPrice.toString();
    },
    // 监听地址变化，重新计算价格
    deliveryAddress() {
      const price = this.calculatePrice;
      this.rewardAmount = price.toString();
    },
    foodQuantity() {
      const price = this.calculatePrice;
      this.rewardAmount = price.toString();
    },
    isRush() {
      const price = this.calculatePrice;
      this.rewardAmount = price.toString();
    },
    // 监听真实号码变化，自动生成虚拟号码
    realPhone(newVal) {
      if (newVal) {
        this.virtualPhone = this.generateVirtualPhone();
      }
    }
  },
  methods: {
    // 处理返回按钮点击
    handleBack() {
      // 返回上一页
      uni.navigateBack({
        delta: 1,
        fail: () => {
          // 如果返回失败（没有上一页），则跳转到首页
          uni.switchTab({
            url: '/pages/index/index'
          });
        }
      });
    },

    // 处理帮助按钮点击
    handleHelp() {
      uni.showModal({
        title: '使用帮助',
        content: '1. 请上传清晰的外卖订单截图\n2. 填写准确的取餐和送达地址\n3. 选择合适的外卖份数\n4. 可选择是否加急配送\n5. 确认悬赏金额后发布',
        showCancel: false,
        confirmText: '我知道了'
      });
    },

    // 处理份数变化
    handleQuantityChange(value) {
      this.foodQuantity = value;
    },

    // 生成虚拟号码
    generateVirtualPhone() {
      // 生成一个以1开头的11位随机号码
      const prefix = '1';
      const middle = Math.floor(Math.random() * 1000000000).toString().padStart(9, '0');
      return prefix + middle;
    },

    // 处理上传订单截图
    handleUploadOrder() {
      uni.chooseImage({
        count: 9, // 最多可选择的图片数量
        sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
        sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
        success: (res) => {
          // tempFilePath可以作为img标签的src属性显示图片
          // 如果是多选，res.tempFilePaths 是一个数组
          this.orderImages = [...this.orderImages, ...res.tempFilePaths];
          console.log('选择图片成功', this.orderImages);
        },
        fail: (err) => {
          console.error('选择图片失败:', err);
          uni.showToast({
            title: '选择图片失败',
            icon: 'none'
          });
        }
      });
    },

    // 处理图片预览
    previewImage(current) {
      uni.previewImage({
        current: current, // 当前显示图片的链接
        urls: this.orderImages // 需要预览的图片链接列表
      });
    },

    // 处理删除图片
    deleteImage(index) {
      this.orderImages.splice(index, 1);
    },

    // 自动填充宿舍信息
    handleAutoFillDormitory() {
      // 模拟从本地存储或用户信息中获取数据
      const userInfo = {
        name: '张三',
        dormitory: '3栋502室',
        phone: '13812345678'
      };
      
      // 自动填充信息
      this.recipientName = userInfo.name;
      this.deliveryAddress = userInfo.dormitory;
      this.realPhone = userInfo.phone;
      this.virtualPhone = this.generateVirtualPhone();
      
      uni.showToast({ 
        title: '信息已自动填充', 
        icon: 'success',
        duration: 2000
      });
    },

    // 处理选择送达时间
    handleSelectDeliveryTime() {
      const timeOptions = [];
      // 从10:30开始到20:30，每15分钟一档
      const startHour = 10;
      const startMinute = 30;
      const endHour = 20;
      const endMinute = 30;
      
      let currentHour = startHour;
      let currentMinute = startMinute;
      
      while (currentHour < endHour || (currentHour === endHour && currentMinute <= endMinute)) {
        timeOptions.push(`${currentHour.toString().padStart(2, '0')}:${currentMinute.toString().padStart(2, '0')}`);
        
        // 增加15分钟
        currentMinute += 15;
        if (currentMinute >= 60) {
          currentMinute = 0;
          currentHour++;
        }
      }

      uni.showActionSheet({
        itemList: timeOptions,
        success: (res) => {
          this.expectedDeliveryTime = timeOptions[res.tapIndex];
        }
      });
    },

    // 处理提交
    handleSubmit() {
      // 表单验证
      if (!this.pickupAddress) {
        uni.showToast({
          title: '请输入取餐地址',
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
      if (!this.recipientName) {
        uni.showToast({
          title: '请输入收件人姓名',
          icon: 'none'
        });
        return;
      }
      if (!this.realPhone) {
        uni.showToast({
          title: '请输入联系电话',
          icon: 'none'
        });
        return;
      }
      if (!this.foodQuantity) {
        uni.showToast({
          title: '请输入外卖份数',
          icon: 'none'
        });
        return;
      }
      if (!this.rewardAmount) {
        uni.showToast({
          title: '请输入悬赏金额',
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

      // 收集数据
      const taskData = {
        type: 'takeout', // 外卖代拿任务类型
        status: 'pending', // 初始状态为待接单
        title: '外卖代拿', // 固定标题
        description: this.specialRequirements || '无特殊要求', // 特殊要求，如果没有则显示"无特殊要求"
        reward: parseFloat(this.rewardAmount) || 0, // 赏金金额
        publishTime: new Date().toLocaleString('zh-CN'), // 发布时间
        expectedDeliveryTime: this.expectedDeliveryTime, // 期望送达时间段
        pickupAddress: this.pickupAddress, // 取货地址
        deliveryAddress: this.deliveryAddress, // 送达地址
        latestUpdate: '等待接单中', // 添加初始最新动态
        images: this.orderImages, // 添加订单截图数组
        contactName: this.recipientName, // 添加收件人姓名
        contactPhone: this.realPhone, // 添加联系电话
        publisher: { // 发布者信息
          id: 'currentUserId',
          nickname: '当前用户昵称',
          avatar: '/static/avatar.png',
          creditRating: 5
        }
      };

      // 模拟提交成功
      uni.showLoading({
        title: '发布中...'
      });

      setTimeout(() => {
        uni.hideLoading();
        uni.showToast({
          title: '发布成功',
          icon: 'success',
          success: () => {
            // 跳转并传递数据
            const taskInfoString = encodeURIComponent(JSON.stringify(taskData));
            uni.navigateTo({
              url: `/pages/task/TaskDetail/TaskDetail?taskInfo=${taskInfoString}`
            });
          }
        });
      }, 1500);
    }
  }
}
</script>

<style>
/* 继承快递代拿页的CSS样式，仅调整部分图标和提示文字 */
.info-icon[uni-icons-type="restaurant"] { background-color: rgba(255, 159, 28, 0.1) } /* 餐厅图标背景色改为橙色 */
.info-icon[uni-icons-type="home"] { background-color: rgba(0, 191, 255, 0.08) } /* 家图标背景色改为淡蓝 */
.info-icon[uni-icons-type="food"] { background-color: rgba(71, 185, 96, 0.1) } /* 食物图标背景色改为绿色 */
.trade-icon[uni-icons-type="clock"] { background-color: rgba(255, 159, 28, 0.08) } /* 时钟图标背景色改为淡橙 */
.setting-icon[uni-icons-type="thermometer"] { background-color: rgba(71, 185, 96, 0.08) } /* 温度计图标背景色改为淡绿 */

.hide-number-checkbox {
  margin-left: 16rpx;
  font-size: 12px;
  color: #666
}

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
  gap: 12rpx;
  pointer-events: none
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
  justify-content: center;
  pointer-events: none
}

.item-label text {
  font-size: 14px;
  color: #666666;
  pointer-events: none
}

.item-content {
  position: relative;
  z-index: 2;
  display: inline-flex;
  align-items: center;
  width: 100%
}

.location-container,
.select-container {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: relative;
  z-index: 2
}

.location-input,
.select-input {
  flex: 1;
  display: flex;
  align-items: center;
  padding: 10rpx 0;
  position: relative;
  z-index: 2
}

.location-input .uni-icons {
  margin-right: 12rpx
}

.input-container {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 12rpx;
  position: relative;
  z-index: 2
}

.input-container input {
  flex: 1;
  font-size: 14px;
  color: #333333;
  border: 1px solid #e8e8e8;
  border-radius: 8rpx;
  padding: 10rpx;
  box-sizing: border-box;
  position: relative;
  z-index: 2
}

.auto-fill-btn {
  display: flex;
  align-items: center;
  padding: 8rpx 16rpx;
  border: 1px solid var(--primary-color);
  border-radius: 8rpx;
  color: var(--primary-color);
  font-size: 12px;
  gap: 4rpx;
  transition: all 0.2s ease;
  position: relative;
  z-index: 2;
  cursor: pointer;
  background: none;
  line-height: 1
}

.auto-fill-btn:active {
  opacity: 0.8;
  transform: scale(0.98)
}

.auto-fill-btn.full-width {
  width: 100%;
  justify-content: center;
  padding: 20rpx;
  margin: 10rpx 0;
  background: linear-gradient(135deg, #f0f8ff, #ffffff);
  border: 1px solid #e0e8f0;
  box-shadow: 0 2px 8px rgba(0, 191, 255, 0.1)
}

.auto-fill-btn.full-width:active {
  transform: scale(0.98);
  box-shadow: 0 1px 4px rgba(0, 191, 255, 0.1)
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

.placeholder {
  color: #999999;
  font-size: 14px
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
  transition: all 0.2s;
  position: relative;
  z-index: 2;
  cursor: pointer;
  border: none
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

.upload-container {
  width: 100%;
  margin-top: 10rpx;
  position: relative;
  z-index: 2;
  display: flex;
  justify-content: center;
  align-items: center
}

.upload-box {
  width: 200rpx;
  height: 200rpx;
  border: 2rpx dashed #e0e0e0;
  border-radius: 8rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: #fafafa;
  transition: all 0.3s ease;
  position: relative;
  z-index: 2;
  cursor: pointer
}

.upload-box:active {
  background-color: #f0f0f0
}

.upload-text {
  font-size: 12px;
  color: #999999;
  margin-top: 8rpx
}

.image-preview-container {
  position: relative;
  width: 200rpx;
  height: 200rpx;
  z-index: 2
}

.preview-image {
  width: 100%;
  height: 100%;
  border-radius: 8rpx;
  border: 1px solid #e0e0e0;
  position: relative;
  z-index: 2
}

.delete-btn {
  position: absolute;
  top: -10rpx;
  right: -10rpx;
  width: 40rpx;
  height: 40rpx;
  background-color: #ffffff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  z-index: 3;
  cursor: pointer
}

.delete-btn:active {
  transform: scale(0.95)
}

.hide-number-checkbox {
  display: block;
  margin-top: 16rpx;
  font-size: 12px;
  color: #666;
  position: relative;
  z-index: 2
}

[class*="-btn"],
[class*="-container"],
input,
textarea {
  cursor: pointer
}

input:focus,
textarea:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 2px rgba(0, 191, 255, 0.1)
}

.reward-input {
  flex: 1;
  font-size: 16px;
  color: #FF9F1C;
  font-weight: 500;
  border: 1px solid #e8e8e8;
  border-radius: 8rpx;
  padding: 10rpx;
  box-sizing: border-box
}

.reward-unit {
  color: #FF9F1C;
  margin-left: 10rpx;
  font-size: 14px;
  font-weight: 500
}

.reward-input:focus {
  border-color: #FF9F1C;
  box-shadow: 0 0 0 2px rgba(255, 159, 28, 0.1)
}

.quantity-input {
  flex: 1;
  font-size: 16px;
  color: #333333;
  border: 1px solid #e8e8e8;
  border-radius: 8rpx;
  padding: 10rpx;
  box-sizing: border-box
}

.quantity-unit {
  color: #666666;
  margin-left: 10rpx;
  font-size: 14px
}

.quantity-input:focus {
  border-color: var(--primary-color);
  box-shadow: 0 0 0 2px rgba(0, 191, 255, 0.1)
}

.phone-tip {
  margin-top: 8rpx;
  padding: 0 16rpx
}

.tip-text {
  font-size: 12px;
  color: #999999;
  line-height: 1.4
}

.price-calculator {
  background: linear-gradient(135deg, #fff9f0, #fff);
  border: 1px solid #ffe4b5;
  border-radius: 12rpx;
  padding: 20rpx;
  margin: 20rpx 0
}

.calculator-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16rpx
}

.calculator-title {
  font-size: 14px;
  color: #666
}

.calculator-price {
  font-size: 20px;
  color: #FF9F1C;
  font-weight: bold
}

.price-breakdown {
  background: rgba(255, 159, 28, 0.05);
  border-radius: 8rpx;
  padding: 16rpx;
  margin-bottom: 16rpx
}

.breakdown-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8rpx;
  font-size: 12px
}

.breakdown-item:last-child {
  margin-bottom: 0
}

.item-label {
  color: #666
}

.item-value {
  color: #FF9F1C
}

.rush-option {
  margin-top: 16rpx;
  background: #fff;
  border-radius: 12rpx;
  overflow: hidden
}

.rush-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20rpx;
  background: linear-gradient(135deg, #fff9f0, #fff);
  border-radius: 12rpx
}

.rush-title-wrapper {
  display: flex;
  flex-direction: column;
  gap: 4rpx
}

.rush-title {
  font-size: 16px;
  color: #333;
  font-weight: 500
}

.rush-subtitle {
  font-size: 12px;
  color: #999
}

.rush-switch {
  transform: scale(0.9)
}

.rush-details {
  background: rgba(255, 159, 28, 0.05);
  border-radius: 8rpx;
  padding: 16rpx;
  margin: 12rpx;
  animation: slideDown 0.3s ease-out
}

.rush-benefits {
  display: flex;
  flex-direction: column;
  gap: 12rpx;
  margin-bottom: 12rpx
}

.benefit-item {
  display: flex;
  align-items: center;
  gap: 12rpx
}

.benefit-icon {
  width: 32rpx;
  height: 32rpx;
  background: rgba(71, 185, 96, 0.1);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center
}

.benefit-text {
  font-size: 14px;
  color: #666
}

.rush-tip {
  display: block;
  font-size: 12px;
  color: #999;
  margin-top: 12rpx;
  padding-left: 44rpx
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10rpx)
  }
  to {
    opacity: 1;
    transform: translateY(0)
  }
}

:deep(.uni-switch-input) {
  width: 80rpx !important;
  height: 40rpx !important;
  border-radius: 20rpx !important;
  background-color: #e0e0e0 !important;
  border: none !important;
  transition: all 0.3s ease !important
}

:deep(.uni-switch-input::before) {
  width: 36rpx !important;
  height: 36rpx !important;
  border-radius: 50% !important;
  background-color: #fff !important;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1) !important;
  transition: all 0.3s ease !important
}

:deep(.uni-switch-input.uni-switch-input-checked) {
  background-color: #FF9F1C !important;
  border-color: #FF9F1C !important
}

:deep(.uni-switch-input.uni-switch-input-checked::before) {
  transform: translateX(40rpx) !important
}

.address-actions {
  margin-top: 20px;
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 12rpx;
  margin-left: 12rpx;
  white-space: nowrap
}

.action-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 8rpx 20rpx;
  border-radius: 6rpx;
  background: rgba(0, 191, 255, 0.1);
  transition: all 0.3s ease;
  flex-shrink: 0;
  gap: 4rpx;
  white-space: nowrap
}

.action-text {
  font-size: 12px;
  color: #00BFFF;
  white-space: nowrap
}

.action-btn:active {
  transform: scale(0.95);
  background: rgba(0, 191, 255, 0.2)
}

.images-preview {
  display: flex;
  flex-wrap: wrap;
  gap: 20rpx;
  margin-top: 10rpx
}

.image-preview-item {
  position: relative;
  width: 180rpx;
  height: 180rpx;
  border-radius: 8rpx;
  overflow: hidden;
  border: 1px solid #e0e0e0;
  z-index: 2
}

.preview-image {
  width: 100%;
  height: 100%;
  object-fit: cover
}

.delete-btn {
  position: absolute;
  top: -10rpx;
  right: -10rpx;
  width: 40rpx;
  height: 40rpx;
  background-color: #ff4d4f;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  z-index: 3;
  cursor: pointer
}

.delete-btn:active {
  transform: scale(0.95)
}
</style>