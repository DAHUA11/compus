<template>
  <view class="container">
    <!-- 表单内容 -->
    <scroll-view class="form-content" scroll-y>
      <!-- 求购信息 -->
      <view class="form-section card-shadow">
        <view class="section-title">求购信息</view>
        
        <!-- 求购物品图片参考区 -->
        <view class="form-item">
          <view class="item-label info-label">
            <view class="icon-wrapper info-icon">
              <uni-icons type="image" size="18" color="#00BFFF" />
            </view>
            <text class="info-text">图片参考 (可选)</text>
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

        <!-- 求购物品名称 -->
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
              placeholder="请输入求购物品名称"
              placeholder-class="placeholder"
              maxlength="30"
            />
          </view>
        </view>

        <!-- 求购物品类别 -->
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
            </view>
            <uni-icons :type="selectedCategory ? 'checkmark' : 'arrowright'" size="16" color="#00BFFF" />
          </view>
        </view>

        <!-- 求购物品成色期望 -->
        <view class="form-item">
          <view class="item-label info-label">
            <view class="icon-wrapper info-icon">
              <uni-icons type="star" size="18" color="#00BFFF" />
            </view>
            <text class="info-text">成色期望</text>
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
                <uni-icons :type="condition.icon" size="20" :color="selectedCondition === condition.value ? '#00BFFF' : '#333333'" />
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
              placeholder="请输入联系电话"
              placeholder-class="placeholder"
              maxlength="11"
            />
          </view>
        </view>
      </view>

      <!-- 交易信息 -->
      <view class="form-section card-shadow">
        <view class="section-title">交易信息</view>
        
        <!-- 预算范围输入 -->
        <view class="form-item">
          <view class="item-label trade-label">
            <view class="icon-wrapper trade-icon">
              <uni-icons type="wallet" size="18" color="#FF9F1C" />
            </view>
            <text class="trade-text">预算范围 (元)</text>
          </view>
          <view class="item-content price-container">
            <view class="price-input-wrapper">
              <view class="price-input">
                <input 
                  type="digit" 
                  v-model="budgetRange" 
                  placeholder="请输入预算范围"
                  placeholder-class="placeholder"
                />
              </view>
            </view>
            <view class="ai-price-btn" @tap="handleReferencePrice">
              <text>参考价格区间</text>
            </view>
          </view>
        </view>

        <!-- 是否接受类似物品推荐 -->
        <view class="form-item">
          <view class="item-label trade-label">
            <view class="icon-wrapper trade-icon">
              <uni-icons type="heart" size="18" color="#FF9F1C" />
            </view>
            <text class="trade-text">类似物品推荐</text>
          </view>
          <view class="item-content">
            <view class="bargain-option" @tap="handleToggleRecommend">
              <!-- 修改：switch组件使用 :checked 和 @change 替代 v-model -->
              <switch 
                :checked="acceptRecommend" 
                active-color="#00BFFF" 
                @change="handleSwitchChange('acceptRecommend', $event)" 
              />
              <text>接受类似物品推荐</text>
            </view>
            <view class="bargain-range" v-if="acceptRecommend">
              <input 
                type="text" 
                v-model="recommendRange" 
                placeholder="期望类似物品差异范围（选填，如：颜色不限，品牌可替代）"
                placeholder-class="placeholder"
              />
            </view>
          </view>
        </view>
      </view>

      <!-- 求购描述 -->
      <view class="form-section card-shadow">
        <view class="section-title">求购描述</view>
        <view class="form-item">
          <view class="item-label setting-label">
            <view class="icon-wrapper setting-icon">
              <uni-icons type="compose" size="18" color="#47B960" />
            </view>
            <text class="setting-text">详细描述</text>
          </view>
          <view class="item-content">
            <textarea 
              v-model="description" 
              placeholder="请详细描述求购需求（如特殊要求、使用场景等）"
              placeholder-class="placeholder"
              class="description-textarea"
              maxlength="500"
            />
            <view class="word-count">{{ description.length }}/500</view>
          </view>
        </view>
      </view>

      <!-- 发布设置 -->
      <view class="form-section card-shadow">
        <view class="section-title">发布设置</view>
        
        <!-- 有效期 -->
        <view class="form-item">
          <view class="item-label setting-label">
            <view class="icon-wrapper setting-icon">
              <uni-icons type="calendar" size="18" color="#47B960" />
            </view>
            <text class="setting-text">有效期</text>
          </view>
          <view class="item-content" @tap="handleSelectDuration">
            <view class="select-input">
              <text v-if="!duration">请选择有效期</text>
              <text v-else>{{ duration }}天</text>
            </view>
            <uni-icons type="right" size="16" color="#999999" />
          </view>
        </view>

        <!-- 加急发布 -->
        <view class="form-item">
          <view class="item-label setting-label">
            <view class="icon-wrapper setting-icon">
              <uni-icons type="notification-filled" size="18" color="#47B960" />
            </view>
            <text class="setting-text">加急发布</text>
          </view>
          <view class="item-content">
            <view class="urgent-option" @tap="handleToggleUrgent">
              <!-- 修改：switch组件使用 :checked 和 @change 替代 v-model -->
              <switch 
                :checked="isUrgent" 
                active-color="#00BFFF" 
                @change="handleSwitchChange('isUrgent', $event)" 
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

      <!-- 底部操作栏的占位符，确保滚动区域底部有足够空间 -->
      <view class="bottom-bar-placeholder"></view>

    </scroll-view>
        
    <!-- 底部操作栏 -->
    <view class="bottom-bar">
      <button class="submit-btn" @tap="handleSubmit">发布求购</button>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      // 求购物品成色期望选项
      conditions: [
        { label: '全新', value: 'new', icon: 'star-filled' },
        { label: '九成新', value: 'like-new', icon: 'star' },
        { label: '八成新', value: 'good', icon: 'star-half' },
        { label: '七成新', value: 'fair', icon: 'star-outline' }
      ],

      // 表单数据
      images: [], // 图片参考
      itemName: '', // 物品名称
      selectedCategory: '', // 物品类别
      selectedCondition: '', // 成色期望
      budgetRange: '', // 预算范围
      contactName: '', // 联系人姓名
      contactPhone: '', // 联系电话
      acceptRecommend: false, // 接受类似物品推荐
      recommendRange: '', // 类似物品差异范围
      description: '', // 求购描述
      duration: '7', // 有效期
      isUrgent: false, // 加急发布

      // 测试模式配置
      TEST_MODE: true, // 测试模式开关
      TEST_USER: {
        publisher: {
          id: 'test_publisher_id',
          nickname: '测试发布者',
          avatar: '/static/avatar/default.png'
        },
        claimer: {
          id: 'test_claimer_id',
          nickname: '测试接单者',
          avatar: '/static/avatar/default.png'
        },
        user: {
          id: 'test_user_id',
          nickname: '测试用户',
          avatar: '/static/avatar/default.png'
        }
      }
    }
  },
  methods: {
    // 获取当前用户信息
    getCurrentUser() {
      if (this.TEST_MODE) {
        const testRole = uni.getStorageSync('testRole') || 'user';
        return this.TEST_USER[testRole] || this.TEST_USER.user;
      } else {
        return {
          id: uni.getStorageSync('userId'),
          nickname: uni.getStorageSync('userNickname'),
          avatar: uni.getStorageSync('userAvatar')
        };
      }
    },

    // 处理选择图片
    handleChooseImage() {
      uni.chooseImage({
        count: 3 - this.images.length, // 最多3张
        success: (res) => {
          // 直接使用临时文件路径
          this.images = [...this.images, ...res.tempFilePaths];
        }
      });
    },

    // 处理删除图片
    handleDeleteImage(index) {
      this.images.splice(index, 1);
    },

    // 处理选择物品类别
    handleSelectCategory() {
      uni.showActionSheet({
        itemList: ['学习用品', '电子产品', '服饰箱包', '图书教材', '运动器材', '其他'],
        success: (res) => {
          this.selectedCategory = ['学习用品', '电子产品', '服饰箱包', '图书教材', '运动器材', '其他'][res.tapIndex];
        }
      });
    },

    // 处理选择物品成色期望
    handleSelectCondition(value) {
      this.selectedCondition = value;
    },

    // 处理参考价格区间
    handleReferencePrice() {
      uni.showModal({
        title: '参考价格区间',
        content: '根据物品名称和类别，参考价格区间为 ¥XXX - ¥YYY（此为模拟数据）',
        showCancel: false
      });
    },

    // 处理接受类似物品推荐开关
    handleToggleRecommend() {
      this.acceptRecommend = !this.acceptRecommend;
      if (!this.acceptRecommend) {
        this.recommendRange = ''; // 不接受推荐清空差异范围
      }
    },

    // 处理选择有效期
    handleSelectDuration() {
      uni.showActionSheet({
        itemList: ['1天', '3天', '7天', '15天', '30天'],
        success: (res) => {
          this.duration = ['1', '3', '7', '15', '30'][res.tapIndex];
        }
      });
    },

    // 处理加急开关
    handleToggleUrgent() {
      this.isUrgent = !this.isUrgent;
    },

    // 处理返回
    handleBack() {
      uni.navigateBack();
    },

    // 处理帮助
    handleHelp() {
      uni.showModal({
        title: '求购发布指南',
        content: '1. 请如实填写求购信息\n2. 上传相关参考图片\n3. 详细描述求购需求\n4. 填写合理的预算范围',
        showCancel: false
      });
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
      if (!this.itemName) {
        uni.showToast({
          title: '请输入求购物品名称',
          icon: 'none'
        });
        return;
      }
      if (!this.selectedCategory) {
        uni.showToast({
          title: '请选择物品类别',
          icon: 'none'
        });
        return;
      }
      if (!this.selectedCondition) {
        uni.showToast({
          title: '请选择成色期望',
          icon: 'none'
        });
        return;
      }
      if (!this.budgetRange) {
        uni.showToast({
          title: '请输入预算范围',
          icon: 'none'
        });
        return;
      }
      if (!this.contactName) {
        uni.showToast({
          title: '请输入联系人姓名',
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
      if (!this.description) {
        uni.showToast({
          title: '请填写详细描述',
          icon: 'none'
        });        
        return;
      }
      if (!this.duration) {
        uni.showToast({
          title: '请选择有效期',
          icon: 'none'
        });
        return;
      }

      // 收集数据
      const taskData = {
        type: 'buy', // 求购任务类型
        status: 'pending', // 初始状态为待接单
        title: this.itemName, // 物品名称作为标题
        description: this.description, // 详细描述
        reward: parseFloat(this.calculateTotalPrice()), // 使用计算后的总价格
        publishTime: new Date().toLocaleString('zh-CN'), // 发布时间
        images: this.images, // 图片参考
        latestUpdate: '等待卖家联系', // 添加初始最新动态
        selectedCondition: this.selectedCondition, // 成色期望
        contactName: this.contactName, // 联系人姓名
        contactPhone: this.contactPhone, // 联系电话
        acceptRecommend: this.acceptRecommend, // 接受类似物品推荐
        recommendRange: this.recommendRange, // 类似物品差异范围
        duration: parseInt(this.duration), // 有效期，转换为数字
        isUrgent: this.isUrgent, // 加急发布
        tags: this.isUrgent ? ['加急'] : [], // 添加加急标签
        ownerType: 'published', // 添加ownerType字段，表示这是发布的任务
        publisher: this.getCurrentUser() // 使用测试用户或真实用户信息
      };

      // 模拟提交成功后跳转到任务详情页
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
    },

    // 处理switch开关变化
    handleSwitchChange(field, event) {
      // 获取switch组件的值
      const value = event.detail.value;
      
      // 根据字段名更新对应的值
      if (field === 'acceptRecommend') {
        this.acceptRecommend = value;
        if (!value) {
          this.recommendRange = '';
        }
      } else if (field === 'isUrgent') {
        this.isUrgent = value;
      }
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
  flex-direction: row;
  gap: 20rpx;
  width: 100%
}

.condition-option {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 12rpx 0;
  border-radius: 8rpx;
  background-color: #f8f8f8;
  transition: all 0.3s ease;
  border: 1px solid transparent;
  gap: 8rpx
}

.condition-option.active {
  background-color: rgba(0, 191, 255, 0.1);
  color: var(--primary-color);
  border: 1px solid var(--primary-color)
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

.input-container input,
.bargain-range input {
  width: 100%;
  font-size: 14px;
  color: #333333;
  border: 1px solid #e8e8e8;
  border-radius: 8rpx;
  padding: 10rpx;
  box-sizing: border-box
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

.description-textarea {
  width: 100%;
  height: 240rpx;
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

.error-message {
  position: absolute;
  bottom: -20rpx;
  left: 0;
  font-size: 12px;
  color: var(--error-color)
}

.select-container {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between
}

.select-input {
  flex: 1;
  padding: 10rpx 0
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