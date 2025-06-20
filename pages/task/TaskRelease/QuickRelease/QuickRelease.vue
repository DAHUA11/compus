<template>
  <view class="quick-release-container">
    

    <view class="form-container">
      <view class="form-item">
        <text class="label">任务描述</text>
        <textarea 
          v-model="form.title" 
          placeholder="例如：帮忙送文件到行政楼"
          auto-height
          maxlength="50"
        />
      </view>

      <view class="form-item">
        <text class="label">悬赏金额(元)</text>
        <input 
          v-model="form.reward" 
          type="number" 
          placeholder="输入金额"
        />
      </view>

      <view class="form-item">
        <text class="label">加急任务</text>
        <switch :checked="form.isUrgent" @change="form.isUrgent = $event.detail.value" />
      </view>

      <button class="submit-btn" @tap="submitTask">立即发布</button>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      form: {
        title: '',
        reward: '',
        isUrgent: false
      },
      userInfo: null,
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
        console.log('3. Parsed userInfo:', userInfo);
        console.log('4. Type of parsed userInfo:', typeof userInfo);
      } catch (e) {
        console.error('5. Error parsing userInfo:', e);
        userInfo = null;
      }
    }

    console.log('6. Final userInfo before check:', userInfo);
    if (userInfo && userInfo._id) {
      this.userInfo = {
        _id: userInfo._id,
        username: userInfo.username,
        nickname: userInfo.nickname || userInfo.username || '用户',
        avatar: (userInfo.avatar_file && userInfo.avatar_file.url) 
                  ? userInfo.avatar_file.url 
                  : (userInfo.avatar || '/static/images/default_avatar.png')
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
    goBack() {
      uni.navigateBack();
    },
    
    async submitTask() {
      if (!this.form.title) {
        uni.showToast({ title: '请填写任务描述', icon: 'none' });
        return;
      }
      
      if (!this.form.reward || Number(this.form.reward) <= 0) {
        uni.showToast({ title: '请输入有效金额', icon: 'none' });
        return;
      }

      const taskData = {
        type: 'other',
        title: this.form.title,
        description: '',
        reward: Number(this.form.reward),
        status: 'pending',
        publisher_id: this.userInfo._id,
        publisher_name: this.userInfo.nickname,
        publisher_avatar: this.userInfo.avatar,
        publish_time: new Date(),
        is_urgent: this.form.isUrgent || false,
        tags: this.form.isUrgent ? ['urgent'] : []
      };

      console.log('[QuickRelease] 发布任务时，发布者头像信息:', taskData.publisher_avatar);

      try {
        uni.showLoading({
          title: '发布中...'
        });

        const res = await uniCloud.callFunction({
          name: 'addTask',
          data: {
            taskData
          }
        });

        uni.hideLoading();
        if (res.result.code === 200) {
          uni.showToast({
            title: '发布成功',
            icon: 'success'
          });
          
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
      } catch (e) {
        uni.hideLoading();
        uni.showToast({
          title: '发布失败，请重试',
          icon: 'none'
        });
        console.error('发布任务失败：', e);
      }
    },
    getCurrentUser() {
      let userInfo = uni.getStorageSync('uni-id-pages-userInfo');
      let parsedInfo = {};

      if (userInfo === '[object Object]') {
        console.warn("localStorage 'uni-id-pages-userInfo' contained the literal string '[object Object]'. Defaulting to anonymous user.");
        parsedInfo = {}; // Treat as empty or invalid data
      } else if (typeof userInfo === 'string') {
        try {
          parsedInfo = JSON.parse(userInfo);
        } catch (e) {
          console.error("Error parsing userInfo from localStorage as JSON:", e);
          parsedInfo = {}; // Fallback if parsing fails
        }
      } else if (typeof userInfo === 'object' && userInfo !== null) {
        // If userInfo is already an object, use it directly
        parsedInfo = userInfo;
      }
      
      // Ensure parsedInfo is always a valid object for property access
      if (typeof parsedInfo !== 'object' || parsedInfo === null) {
        parsedInfo = {};
      }

      return {
        id: parsedInfo.uid || 'anonymous',
        nickname: parsedInfo.nickname || parsedInfo.username || '匿名用户',
        avatar: (parsedInfo.avatar_file && parsedInfo.avatar_file.url) ? parsedInfo.avatar_file.url : '/static/images/avatar1.png'
      };
    }
  }
}
</script>

<style scoped>
.quick-release-container {
  padding: 20rpx;
}

.header {
  display: flex;
  align-items: center;
  padding: 20rpx 0;
  font-size: 18px;
  font-weight: bold;
}

.form-container {
  margin-top: 40rpx;
}

.form-item {
  margin-bottom: 40rpx;
  padding-bottom: 20rpx;
  border-bottom: 1rpx solid #eee;
}

.label {
  display: block;
  margin-bottom: 20rpx;
  font-size: 16px;
  color: #333;
}

textarea, input {
  width: 100%;
  font-size: 16px;
  padding: 10rpx 0;
}

.submit-btn {
  margin-top: 60rpx;
  background: linear-gradient(135deg, #3498db, #9b59b6);
  color: white;
  border-radius: 50rpx;
}
</style>