<template>
  <view class="add-activity-container">
    <!-- 顶部渐变提示 -->
    <view class="header-gradient">
      <view class="header-title">清晰标题更容易被推荐哦~</view>
      <view class="header-desc">为了让大家更好地了解活动，请介绍一下活动亮点、行程规划和注意事项等内容……</view>
    </view>

    <!-- 活动封面上传 -->
    <view class="section cover-section">
      <view class="cover-upload" @tap="chooseCover">
        <image v-if="cover" :src="cover" class="cover-img"></image>
        <view v-else class="cover-placeholder">
          <text class="iconfont icon-tianjia"></text>
          <view>上传活动封面</view>
        </view>
      </view>
      <view v-if="isHot" class="hot-badge">活动爆品</view>
    </view>

    <!-- 活动标题/描述 -->
    <view class="section">
      <input class="input-title" v-model="title" maxlength="30" placeholder="请输入活动标题" />
      <!-- 替换原textarea为富文本编辑器 -->
      <editor 
        class="rich-editor"
        :value="contentHtml"
        placeholder="请详细描述活动内容（支持图文混排）"
        :maxlength="500"  
        @ready="onEditorReady"
        @input="onEditorInput"
      ></editor>
      <view class="word-count">已输入{{ currentWordCount }}/500字</view>
    </view>

    <!-- 活动类型 -->
    <view class="section row-section">
      <view class="row-label">活动类型</view>
      <picker :range="typeOptions" @change="onTypeChange">
        <view class="row-value">{{ typeOptions[typeIndex] || '请选择' }}</view>
      </picker>
    </view>

    <!-- 活动时间 -->
    <view class="section row-section">
      <view class="row-label">活动时间</view>
      <picker mode="multiSelector" :range="timeRange" @change="onTimeChange">
        <view class="row-value">{{ timeText || '请选择' }}</view>
      </picker>
    </view>

    <!-- 活动地点 -->
    <view class="section row-section">
      <view class="row-label">活动地点</view>
      <input class="row-value" v-model="place" placeholder="请输入活动地点" />
    </view>

    <!-- 最大参与人数 -->
    <view class="section row-section">
      <view class="row-label">最大参与人数</view>
      <input 
        class="row-value" 
        v-model.number="maxAttendees" 
        type="number" 
        placeholder="请输入最大参与人数"
        min="1"
      />
    </view>

    <!-- 活动标签（多选） -->
    <view class="section tag-section">
      <view class="row-label">活动标签</view>
      <view class="tag-list">
        <view
          v-for="(tag, idx) in tagOptions"
          :key="idx"
          class="tag-chip"
          :class="{ active: selectedTags.includes(tag) }"
          @tap="toggleTag(tag)"
        >{{ tag }}</view>
      </view>
    </view>

    <!-- 发布按钮 -->
    <view class="footer">
      <view
        class="btn-publish"
        :class="{ disabled: !canPublish }"
        @tap="canPublish ? publishActivity() : null"
      >
        发布
      </view>
    </view>
  </view>
</template>

<script>
export default {
  data() {

    // 动态生成未来30天的日期数组（格式MM/DD）
    const generateDateRange = () => {
      const dates = [];
      const currentDate = new Date();
      for (let i = 0; i < 30; i++) { // 生成未来30天
        const date = new Date(currentDate);
        date.setDate(currentDate.getDate() + i);
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');
        dates.push(`${month}/${day}`);
      }
      return dates;
    };

    return {
      cover: '',
      isHot: true,
      title: '',
      typeOptions: ['官方', '社团', '学术', '体育', '娱乐', '其他'],
      typeIndex: -1,
      timeRange: [
        generateDateRange(), // 动态生成的日期数组
        ['10:00', '14:00', '18:00', '20:00'] // 固定时段选项
      ],
      timeText: '',
      place: '',
      tagOptions: ['户外', '运动', '娱乐', '交友', '学习', '比赛', '官方', '自发'],
      selectedTags: [],
      maxAttendees: '', // 新增：最大参与人数
      contentHtml: '',  // 存储富文本内容
      currentWordCount: 0  // 当前输入字数
    };
  },
  computed: {
    canPublish() {
      return this.cover && 
             this.title.trim() && 
             this.contentHtml.trim() && // 使用contentHtml替代desc
             this.typeIndex !== -1 && 
             this.timeText && 
             this.place.trim() && 
             Number(this.maxAttendees) >= 1;
    }
  },
  methods: {
    chooseCover() {
      uni.chooseImage({
        count: 1,
        sizeType: ['compressed'],
        sourceType: ['album', 'camera'],
        success: (res) => {
          this.cover = res.tempFilePaths[0];
        }
      });
    },
    onTypeChange(e) {
      this.typeIndex = e.detail.value;
    },
    onTimeChange(e) {
      const [dateIdx, timeIdx] = e.detail.value;
      this.timeText = `${this.timeRange[0][dateIdx]} ${this.timeRange[1][timeIdx]}`;
    },
    toggleTag(tag) {
      const idx = this.selectedTags.indexOf(tag);
      if (idx > -1) {
        this.selectedTags.splice(idx, 1);
      } else {
        this.selectedTags.push(tag);
      }
    },
    // 编辑器输入事件
    onEditorInput(e) {
      this.contentHtml = e.detail.html;  // 通过事件获取最新内容
      const pureText = e.detail.text.replace(/<[^>]+>/g, '');
      this.currentWordCount = pureText.length;
    },
    publishActivity() {
      if (!this.canPublish) return;
      
      // 显示加载提示
      uni.showLoading({ title: '发布中...' });
      
      // 上传封面图（原有代码不变）
      const uploadCover = new Promise((resolve, reject) => {
        if (!this.cover) {
          resolve([]);
          return;
        }
        uniCloud.uploadFile({
          filePath: this.cover,
          cloudPath: `activities/${Date.now()}-${Math.random().toString(36).slice(-6)}.${this.cover.split('.').pop()}`,
          success: res => resolve([res.fileID]),
          fail: err => reject(err)
        });
      });
      
      // 处理时间格式（关键修改）
      const [dateStr, timeStr] = this.timeText.split(' ');
      const [monthStr, dayStr] = dateStr.split('/');
      const [hour, minute] = timeStr.split(':');
      
      // 动态获取当前年份，并处理跨年逻辑
      const currentDate = new Date();
      const currentYear = currentDate.getFullYear();
      const selectedMonth = parseInt(monthStr) - 1; // 月份从0开始
      const selectedDay = parseInt(dayStr);
      
      // 创建日期对象时自动处理年份（例如当前是2023-12-31，用户选01/05会自动转为2024-01-05）
      const activityDate = new Date(currentYear, selectedMonth, selectedDay, parseInt(hour), parseInt(minute));
      
      // 处理跨年场景：如果生成的月份小于用户选择的月份（说明年份需要+1）
      if (activityDate.getMonth() !== selectedMonth) {
        activityDate.setFullYear(currentYear + 1);
      }
      const activityTime = activityDate.getTime();
      
      // 后续上传逻辑（原有代码不变）
      uploadCover
        .then(fileIDs => {
          // 从本地存储获取用户id
          const userInfo = uni.getStorageSync('uni-id-pages-userInfo')
          console.log('活动页面 userInfo:', userInfo)
          const userId = userInfo && userInfo._id ? userInfo._id : ''
          if (!userId) {
          	uni.hideLoading();
          	uni.showToast({ title: '请先登录', icon: 'none' });
          	return Promise.reject(new Error('请先登录'));
          }
          return uniCloud.callFunction({
            name: 'add-content',
            data: {
              content_type: 'activity',
              title: this.title,
              category: this.typeOptions[this.typeIndex],
              content: this.contentHtml, // 使用contentHtml替代desc
              files: fileIDs,
              activity_time: activityTime,
              location: this.place,
              max_attendees: Number(this.maxAttendees),
              user_id: userId,
              tags: this.selectedTags
            }
          });
        })
        .then(res => {
          if (res && res.result && res.result.code === 200) {
            uni.hideLoading();
            uni.showToast({
              title: '发布成功',
              icon: 'success'
            });
            setTimeout(() => {
              uni.navigateBack();
            }, 800);
          } else {
            throw new Error(res.result.msg);
          }
        })
        .catch(err => {
          uni.hideLoading();
          if (err && err.message !== '请先登录') {
            uni.showToast({
              title: err.message || '发布失败',
              icon: 'none'
            });
          }
        });
    }
  }
}
</script>

<style lang="scss">
.add-activity-container {
  min-height: 100vh;
  background: #f8f9fc;
  padding-bottom: 120rpx;
}
.header-gradient {
  background: linear-gradient(90deg, #eaffd0 0%, #fffbe8 100%);
  padding: 32rpx 24rpx 18rpx 24rpx;
  border-radius: 0 0 32rpx 32rpx;
}
.header-title {
  font-size: 28rpx;
  font-weight: 700;
  color: #a3b800;
  margin-bottom: 8rpx;
}
.header-desc {
  font-size: 24rpx;
  color: #b0b6be;
}
.section {
  background: #fff;
  border-radius: 20rpx;
  margin: 24rpx 24rpx 0 24rpx;
  padding: 24rpx;
  box-shadow: 0 2rpx 8rpx rgba(77,124,191,0.04);
}
.cover-section {
  display: flex;
  align-items: center;
  position: relative;
  padding-bottom: 0;
	padding-bottom: 20rpx;
}
.cover-upload {
  width: 160rpx;
  height: 160rpx;
  border-radius: 16rpx;
  background: #f5f6fa;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 24rpx;
  position: relative;
  overflow: hidden;
  border: 2rpx dashed #e0e0e0;
  cursor: pointer;
}
.cover-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 16rpx;
}
.cover-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  color: #e0c97b;
  font-size: 48rpx;
}
.icon-tianjia {
  font-size: 60rpx;
  color: #e0c97b;
}
.hot-badge {
  position: absolute;
  right: 0;
  top: 0;
  background: #222;
  color: #ffe37c;
  font-size: 22rpx;
  border-radius: 12rpx;
  padding: 4rpx 18rpx;
  font-weight: 700;
  transform: translateY(-50%);
}
.input-title {
  // width: 100%;
  font-size: 30rpx;
  font-weight: 700;
  color: #333;
  background: #f8f9fc;
	// background-color: pink;
  border: none;
  border-radius: 12rpx;
  padding: 18rpx;
  margin-bottom: 12rpx;
}
.input-desc {
  width: 95%;
  min-height: 80rpx;
  font-size: 26rpx;
  color: #666;
  background: #f8f9fc;
	// background-color: pink;
  border: none;
  border-radius: 12rpx;
  padding: 18rpx;
}
.row-section {
  display: flex;
  align-items: center;
  padding: 0 24rpx 0 0;
  margin-bottom: 0;
  margin-top: 0;
  box-shadow: none;
  border-radius: 16rpx;
  background: #fff;
  height: 80rpx;
}
.row-label {
  font-size: 26rpx;
  color: #888;
  width: 160rpx;
  flex-shrink: 0;
}
.row-value {
  font-size: 28rpx;
  color: #333;
  flex: 1;
  padding-left: 12rpx;
}
/* 活动标签 chips */
.tag-section {
  display: flex;
  align-items: flex-start;
  flex-wrap: wrap;
  gap: 12rpx;
  padding-bottom: 8rpx;
}
.tag-list {
  display: flex;
  flex-wrap: wrap;
  gap: 18rpx;
  margin-left: 12rpx;
}
.tag-chip {
  padding: 10rpx 32rpx;
  background: #f5f6fa;
  border-radius: 32rpx;
  color: #888;
  font-size: 26rpx;
  border: 2rpx solid transparent;
  transition: all 0.2s;
  font-weight: 500;
}
.tag-chip.active {
  background: linear-gradient(90deg, #f7c948 0%, #f7e7b7 100%);
  color: #c09853;
  border-color: #f7c948;
  font-weight: 700;
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
  background: linear-gradient(90deg, #b7f36b 0%, #ffe37c 100%);
  color: #222;
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
</style>
