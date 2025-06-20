<template>
  <view class="container">
    <!-- 表单内容 -->
    <scroll-view class="form-content" scroll-y>
      <!-- 商品信息 -->
      <view class="form-section card-shadow">
        <view class="section-title">商品信息</view>
        
        <!-- 出物物品图片参考区 -->
        <view class="form-item">
          <view class="item-label info-label">
            <view class="icon-wrapper info-icon">
              <uni-icons type="image" size="18" color="#00BFFF" />
            </view>
            <text class="info-text">商品展示</text>
          </view>
          <view class="upload-section">
            <view class="image-list">
              <view 
                class="image-item" 
                v-for="(image, index) in images" 
                :key="index"
              >
                <image class="image-container" :src="image" mode="aspectFill"></image>
                <view class="delete-btn" @tap.stop="handleDeleteImage(index)">
                  <uni-icons type="close" size="16" color="#ffffff" />
                </view>
              </view>
              <view 
                class="upload-btn gradient-bg" 
                v-if="images.length < 3"
                @tap.stop="handleChooseImage"
              >
                <uni-icons type="plusempty" size="32" color="#333333" />
                <text class="text-black">{{ images.length }}/3</text>
              </view>
            </view>
            <text class="upload-tip">(上传相关参考图片)</text>
          </view>
        </view>

        <!-- 出物物品名称 -->
        <view class="form-item">
          <view class="item-label info-label">
            <view class="icon-wrapper info-icon">
              <uni-icons type="paperplane" size="18" color="#00BFFF" />
            </view>
            <text class="info-text">物品名称</text>
          </view>
          <view class="item-content input-container">
            <input 
              type="text" 
              v-model="itemName" 
              placeholder="请输入物品名称"
              placeholder-class="placeholder"
              maxlength="30"
            />
          </view>
        </view>

        <!-- 出物物品类别 -->
        <view class="form-item">
          <view class="item-label info-label">
            <view class="icon-wrapper info-icon">
              <uni-icons type="list" size="18" color="#00BFFF" />
            </view>
            <text class="info-text">物品类别</text>
          </view>
          <view class="item-content select-container" @tap="handleSelectCategory">
            <view class="select-input" :class="{ 'has-value': selectedCategory }">
              <text v-if="!selectedCategory">请选择物品类别</text>
              <text v-else>{{ selectedCategory }}</text>
              <uni-icons :type="selectedCategory ? 'checkmark' : 'arrowright'" size="16" color="#00BFFF" />
            </view>
           
          </view>
        </view>

        <!-- 求购物品成色期望 -->
        <view class="form-item">
          <view class="item-label info-label">
            <view class="icon-wrapper info-icon">
              <uni-icons type="star" size="18" color="#00BFFF" />
            </view>
            <text class="info-text">商品成色</text>
          </view>
          <view class="item-content">
            <view class="condition-options">
              <view 
                class="condition-option" 
                v-for="(condition, index) in conditions" 
                :key="index"
                :class="{ active: selectedCondition === condition.value }"
                @tap="handleSelectCondition(condition.value)"
              >
                <uni-icons :type="selectedCondition === condition.value ? 'star-filled' : 'star'" size="20" :color="selectedCondition === condition.value ? '#00BFFF' : '#333333'" />
                <text>{{ condition.label }}</text>
              </view>
            </view>
          </view>
        </view>

        <!-- 联系人姓名输入框 -->
        <view class="form-item">
          <view class="item-label info-label">
            <view class="icon-wrapper info-icon">
              <uni-icons type="person" size="18" color="#00BFFF" />
            </view>
            <text class="info-text">联系人姓名</text>
          </view>
          <view class="item-content input-container">
            <input
              type="text"
              v-model="contactName"
              placeholder="请输入联系人姓名"
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
              placeholder="请输入联系人电话"
              placeholder-class="placeholder"
              maxlength="11"
            />
          </view>
        </view>
      </view>

      <!-- 交易信息 -->
      <view class="form-section card-shadow">
        <view class="section-title">交易信息</view>
        
        <!-- 商品价格输入 -->
        <view class="form-item">
          <view class="item-label trade-label">
            <view class="icon-wrapper trade-icon">
              <uni-icons type="wallet" size="18" color="#FF9F1C" />
            </view>
            <text class="trade-text">商品价格</text>
          </view>
          <view class="item-content price-container">
            <view class="price-input-wrapper">
              <view class="price-input">
                <input 
                  type="digit" 
                  v-model="budgetRange" 
                  placeholder="请输入价格(元)"
                  placeholder-class="placeholder"
                />
              </view>
            </view>
            <view class="ai-price-btn" @tap="handleReferencePrice">
              <text>AI估值参考</text>
            </view>
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
            <view class="urgent-option">
              <switch 
                :checked="isUrgent" 
                active-color="#00BFFF" 
                @change="handleUrgentChange" 
              />
              <text>加急发布</text>
              <text class="urgent-fee">（价格上浮30%）</text>
            </view>
          </view>
        </view>

        <!-- 价格明细 -->
        <view class="price-breakdown" v-if="isUrgent">
          <view class="breakdown-item">
            <text class="item-label">基础价格</text>
            <text class="item-value">¥{{ budgetRange }}</text>
          </view>
          <view class="breakdown-item">
            <text class="item-label">加急费用</text>
            <text class="item-value">+30%</text>
          </view>
          <view class="breakdown-item total">
            <text class="item-label">总价格</text>
            <text class="item-value">¥{{ calculateTotalPrice() }}</text>
          </view>
        </view>
      </view>

      <!-- 商品描述 -->
      <view class="form-section card-shadow">
        <view class="section-title">商品描述</view>
        <view class="form-item">
          <view class="item-label setting-label">
            <view class="icon-wrapper setting-icon">
              <uni-icons type="compose" size="18" color="#47B960" />
            </view>
            <text class="setting-text">出物描述</text>
          </view>
          <view class="item-content">
            <textarea 
            v-model="description" 
  placeholder="请详细描述该商品破损,成色情况"
  placeholder-class="placeholder"
  class="description-textarea"
  maxlength="500"
  auto-height  
            />
            <view class="word-count">{{ description.length }}/500</view>
          </view>
        </view>
      </view>

    
    </scroll-view>
        
    <!-- 底部操作栏 -->
    <view class="bottom-bar">
      <button class="submit-btn" @tap="handleSubmit">发布出物任务</button>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      // 商品成色选项
      conditions: [
        { label: '全新', value: 'new', icon: 'star' },
        { label: '九成新', value: 'like-new', icon: 'star' },
        { label: '八成新', value: 'good', icon: 'star' },
        { label: '七成新', value: 'fair', icon: 'star' }
      ],

      // 表单数据
      images: [], // 图片参考
      itemName: '', // 物品名称
      selectedCategory: '', // 物品类别
      selectedCondition: '', // 成色期望
      budgetRange: '', // 价格范围
      contactName: '', // 联系人姓名
      contactPhone: '', // 联系电话
      description: '', // 商品描述
      duration: '7', // 有效期
      isUrgent: false, // 加急发布
      userInfo: null, // 用户信息
      selectedCondition: '', // 成色期望
      tags: [], // 标签
    }
  },
  onShow() {
    let userInfo = uni.getStorageSync('uni-id-pages-userInfo');
    console.log('--- Debugging onShow ---');
    console.log('1. Raw userInfo from storage:', userInfo);
    console.log('2. Type of raw userInfo:', typeof userInfo);

    if (typeof userInfo === 'string') {
      try {
        userInfo = JSON.parse(userInfo);
      } catch (e) {
        console.error('5. Error parsing userInfo:', e);
        userInfo = null;
      }
    }

    // 用户已登录，将用户信息存储到组件数据中，并确保头像URL正确
    if (userInfo && userInfo._id) {
      this.userInfo = {
        _id: userInfo._id,
        username: userInfo.username,
        nickname: userInfo.nickname || userInfo.username || '用户',
        // 优先使用 avatar_file.url，否则使用 avatar 字段，最后提供默认头像
        avatar: (userInfo.avatar_file && userInfo.avatar_file.url) 
                  ? userInfo.avatar_file.url 
                  : (userInfo.avatar || '/static/images/default_avatar.png') // 确保有一个默认头像
      };
      console.log('11. User is logged in. ID:', this.userInfo._id, 'Avatar:', this.userInfo.avatar);
    } else {
      console.log('10. Condition `!userInfo || !userInfo._id` is TRUE. Redirecting...');
      uni.showToast({
        title: '请先登录',
        icon: 'none'
      });
      setTimeout(() => {
        uni.navigateTo({
          url: '/uni_modules/uni-id-pages/pages/login/login-withoutpwd'
        });
      }, 1500);
      return;
    }
    console.log('--- End Debugging onShow ---');
  },
  methods: {
    // 获取当前用户信息
    getCurrentUser() {
      const userInfo = uni.getStorageSync('uni-id-pages-userInfo');
      if (userInfo) {
        return {
          id: userInfo._id,
          nickname: userInfo.nickname,
          avatar: (userInfo.avatar_file && userInfo.avatar_file.url) ? userInfo.avatar_file.url : '/static/images/avatar1.png'
        };
      } else {
        return null; // 用户未登录
      }
    },

    // 处理选择图片
    handleChooseImage() {
      uni.chooseImage({
        count: 3 - this.images.length, // 最多3张
        success: (res) => {
          this.images = [...this.images, ...res.tempFilePaths]
        }
      })
    },

    // 处理删除图片
    handleDeleteImage(index) {
      this.images.splice(index, 1)
    },

    // 处理选择物品类别
    handleSelectCategory() {
      uni.showActionSheet({
        itemList: ['学习用品', '电子产品', '服饰箱包', '图书教材', '运动器材', '其他'],
        success: (res) => {
          this.selectedCategory = ['学习用品', '电子产品', '服饰箱包', '图书教材', '运动器材', '其他'][res.tapIndex]
        }
      })
    },

    // 处理选择物品成色
    handleSelectCondition(value) {
      this.selectedCondition = value
    },

    // 处理参考价格区间
    handleReferencePrice() {
      uni.showModal({
        title: '参考价格区间',
        content: '根据物品名称和类别，参考价格区间为 ¥XXX - ¥YYY（此为模拟数据）',
        showCancel: false
      })
    },

    // 处理选择有效期
    handleSelectDuration() {
      uni.showActionSheet({
        itemList: ['1天', '3天', '7天', '15天', '30天'],
        success: (res) => {
          this.duration = ['1', '3', '7', '15', '30'][res.tapIndex]
        }
      })
    },

    // 处理加急开关变化
    handleUrgentChange(e) {
      this.isUrgent = e.detail.value;
    },
    
    // 计算总价格（包含加急费用）
    calculateTotalPrice() {
      const basePrice = parseFloat(this.budgetRange) || 0;
      if (this.isUrgent) {
        return (basePrice * 1.3).toFixed(2);
      }
      return basePrice.toFixed(2);
    },

    // 处理提交
    handleSubmit() {
      // 表单验证
      if (this.images.length === 0) {
        uni.showToast({ title: '请上传商品图片', icon: 'none' })    
        return
      }
      if (!this.itemName) {
        uni.showToast({ title: '请输入物品名称', icon: 'none' })
        return
      }
      if (!this.selectedCategory) {
        uni.showToast({ title: '请选择物品类别', icon: 'none' })
        return
      }
      if (!this.selectedCondition) {
        uni.showToast({ title: '请选择商品成色', icon: 'none' })
        return
      }
      if (!this.budgetRange) {
        uni.showToast({ title: '请输入商品价格', icon: 'none' })
        return
      }
      if (!this.contactName) {
        uni.showToast({ title: '请输入联系人姓名', icon: 'none' })
        return
      }
      if (!this.contactPhone) {
        uni.showToast({ title: '请输入联系电话', icon: 'none' })
        return
      }
      if (!this.description) {
        uni.showToast({ title: '请填写商品描述', icon: 'none' })
        return
      }
      if (!this.duration) {
        uni.showToast({ title: '请选择有效期', icon: 'none' })
        return
      }

      // 直接使用 this.userInfo
      const taskData = {
        type: 'sell',
        title: this.getFormattedTitle({
          type: 'sell',
          itemName: this.itemName,
          selectedCondition: this.selectedCondition
        }),
        description: this.description,
        reward: Number(this.calculateTotalPrice()),
        status: 'pending',
        publisher_id: this.userInfo._id,
        publisher_name: this.userInfo.nickname,
        publisher_avatar: this.userInfo.avatar,
        publish_time: new Date(),
        is_urgent: this.isUrgent || false,
        tags: this.isUrgent ? ['urgent'] : [],
        item_name: this.itemName,
        selected_category: this.selectedCategory,
        selected_condition: this.selectedCondition,
        contact_name: this.contactName,
        contact_phone: this.contactPhone,
        images: this.images,
        duration: Number(this.duration)
      };

      // 调用云函数
      try {
        uni.showLoading({
          title: '发布中...'
        });

        uniCloud.callFunction({
          name: 'addTask',
          data: {
            taskData
          }
        }).then(res => {
          uni.hideLoading();
          if (res.result.code === 200) {
            uni.showToast({
              title: '发布成功',
              icon: 'success'
            });
            
            // 发布成功后跳转到首页
            setTimeout(() => {
              uni.switchTab({
                url: '/pages/index/index'
              });
            }, 1500);
          } else {
            uni.showToast({
              title: res.result.msg || '发布失败',
              icon: 'none'
            });
          }
        }).catch(err => {
          uni.hideLoading();
          uni.showToast({
            title: '发布失败，请重试',
            icon: 'none'
          });
          console.error('发布任务失败：', err);
        });
      } catch (e) {
        uni.hideLoading();
        uni.showToast({
          title: '发布失败，请重试',
          icon: 'none'
        });
        console.error('发布任务失败：', e);
      }
    },

    // 获取物品成色文本
    getConditionText(condition) {
      const conditionMap = {
        'new': '全新',
        'like-new': '九成新',
        'good': '八成新',
        'fair': '七成新'
      };
      return conditionMap[condition] || '';
    },
    // 获取格式化标题
    getFormattedTitle(task) {
      if (!task) return '未知任务';

      switch (task.type) {
        case 'buy':
          return `求购${task.itemName || ''}${task.selectedCondition ? `(${this.getConditionText(task.selectedCondition)})` : ''}`;
        case 'express':
          return `${task.pickupAddress || ''}快递代取`;
        case 'sell':
          return `出${task.selectedCondition ? this.getConditionText(task.selectedCondition) : ''}${task.itemName || ''}`;
        case 'takeout':
          return `${task.pickupAddress || ''}外卖代拿`;
        default:
          return task.title || '未知任务';
      }
    },
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
  --info-color: #00BFFF /* 求购信息区颜色 */
  --trade-color: #FF9F1C /* 交易信息区颜色 */
  --setting-color: #47B960 /* 发布设置区颜色 */
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
  display: inline-flex;
  align-items: center;
  width: 100%
}

.upload-section {
  margin-bottom: 30rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%
}

.image-list {
  display: flex;
  flex-wrap: wrap;
  gap: 20rpx;
  justify-content: center;
  align-items: center;
  min-height: 100rpx;
  width: 100%
}

.image-item {
  width: 150rpx;
  height: 150rpx;
  position: relative;
  border-radius: 12rpx;
  overflow: hidden;
  flex-shrink: 0
}

.image-container {
  width: 100%;
  height: 100%;
  background-color: #f5f5f5
}

.upload-btn {
  width: 150rpx;
  height: 150rpx;
  border-radius: 12rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
  background: linear-gradient(135deg, #E0F3FF, #CCE6FF);
  box-shadow: 0 6px 18px rgba(0, 191, 255, 0.15);
  transition: transform 0.2s;
  flex-shrink: 0
}

.upload-btn:active {
  transform: scale(0.98)
}

.delete-btn {
  position: absolute;
  top: 8rpx;
  right: 8rpx;
  width: 40rpx;
  height: 40rpx;
  background-color: rgba(255, 77, 79, 0.8);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2
}

.upload-tip {
  font-size: 14px;
  color: rgb(133, 133, 133);
  border-bottom: 1px solid #e8e8e8;
  padding-bottom: 10rpx;
  margin-top: 20rpx;
  display: block;
  text-align: center;
  width: 100%
}

.condition-options {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-start;
  gap: 20rpx;
  margin-bottom: 20rpx;
  width: 100%;
}

.condition-option {
  min-width: 150rpx;
  max-width: 200rpx;
  height: 90rpx;
  background-color: #f5f5f5;
  border-radius: 12rpx;

  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: 8rpx;

  font-size: 24rpx;
  color: #333333;
  transition: all 0.2s;
  border: 1px solid transparent;
}

.condition-option.active {
  border-color: #00BFFF;
  background-color: rgba(0, 191, 255, 0.1);
  color: #00BFFF;
}

.condition-option text {
  flex-shrink: 0;
}

.condition-option uni-icons {
  flex-shrink: 0;
}

.trade-options {
  display: flex;
  flex-direction: row;
  gap: 20rpx;
  width: 100%
}

.trade-option {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 12rpx 0;
  border-radius: 8rpx;
  background-color: #f8f8f8;
  transition: all 0.3s ease;
  border: 1px solid transparent
}

.trade-option.active {
  background-color: rgba(0, 191, 255, 0.1);
  color: var(--primary-color);
  border: 1px solid var(--primary-color)
}

.location-container {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between
}

.location-input {
  flex: 1;
  display: flex;
  align-items: center;
  padding: 10rpx 0
}

.location-input .uni-icons {
  margin-right: 12rpx
}

.input-container {
  width: 100%
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
.input-container input,
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

.description-textarea {
  width: 100%;
  /* 去掉固定高度，改成最小高度 */
  min-height: 200rpx; 
  font-size: 14px;
  color: #333333;
  line-height: 1.5;
  border: 1px solid #e8e8e8;
  border-radius: 8rpx;
  padding: 10rpx;
  transition: all 0.2s;
  box-sizing: border-box;
}

.description-textarea:focus {
  border-color: var(--primary-color);
  box-shadow: 0 2px 8px rgba(0, 191, 255, 0.1)
}

.placeholder {
  color: #999999;
  font-size: 14px
}

.error-message {
  position: absolute;
  bottom: -20rpx;
  left: 0;
  font-size: 12px;
  color: var(--error-color)
}

.select-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
}

.select-input {
  display: flex;
  align-items: center;
  flex: 1;
  padding: 10rpx 0;
  min-width: 0;
}

.select-input text {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* 选择框的箭头图标 */
.select-container uni-icons {
  font-size: 24rpx;
  margin-left: 10rpx;
  transform: translateY(1rpx);
  flex-shrink: 0;
}
.has-value {
  color: #333333
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

.bargain-range {
  margin-top: 12rpx;
  width: 100%
}

.word-count {
  text-align: right;
  font-size: 12rpx;
  color: #999999;
  margin-top: 8rpx
}

.bottom-bar-placeholder {
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
  width: 100%;
  height: 90rpx;
  background: linear-gradient(135deg, #00BFFF, #0099FF);
  border-radius: 45rpx;
  color: #ffffff;
  font-size: 32rpx;
  font-weight: 500;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8px 16px rgba(0, 191, 255, 0.2);
  transition: all 0.3s;
  border: none;
  line-height: 1;
}

.submit-btn:active {
  transform: scale(0.98);
  box-shadow: 0 4px 8px rgba(0, 191, 255, 0.15);
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

.urgent-option {
  display: flex;
  align-items: center;
  gap: 12rpx;
  padding: 10rpx 0;
}

.urgent-fee {
  color: #FF9F1C;
  font-size: 24rpx;
}
</style>