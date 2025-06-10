<template>
  <view class="add-activity-container">
    <!-- 自定义渐变导航栏
    <view class="custom-navbar">
      <view class="nav-back" @tap="navigateBack">
        <text class="iconfont icon-arrow-left"></text>
      </view>
      <text class="nav-title">发布活动</text>
    </view> -->

    <!-- 原顶部渐变提示（保持不变） -->
    <view class="header-gradient-overlap">
      <view class="header-gradient-fade"></view>
    </view>
    <!-- 悬浮叠加的输入卡片（标题、内容、上传封面同盒） -->
    <view class="section overlap-card">
      <input class="input-title" v-model="title" maxlength="30" placeholder="清晰标题更容易被推荐哦~" />
      
      <editor 
        id="editor"
        ref="editor"
        class="rich-editor"
        :value="contentHtml"
        placeholder="为了让大家更好地了解活动，请介绍一下活动亮点、行程规划和注意事项等内容……"
        :maxlength="500"  
        @ready="onEditorReady"
        @input="onEditorInput"
      ></editor>
      <view class="word-count">已输入{{ currentWordCount }}/500字</view>
      <!-- 上传活动封面区域放在卡片内，富文本编辑器下方 -->
      <view class="cover-upload-box">
        <view class="cover-upload" @tap="chooseCover">
          <image v-if="cover" :src="cover" class="cover-img"></image>
          <view v-else class="cover-placeholder">
            <text class="iconfont icon-tianjia"></text>
            <view>上传活动封面</view>
          </view>
        </view>
      </view>
    </view>
    <!-- 活动信息区域卡片 -->
    <view class="info-card">
      <!-- 活动类型 -->
      <picker :range="typeOptions" @change="onTypeChange">
        <view class="info-row">
          <text class="iconfont icon-type info-icon"></text>
          <text class="info-label">活动类型</text>
          <view class="info-value">{{ typeOptions[typeIndex] || '请选择' }}</view>
          <text class="iconfont icon-arrow-right info-arrow"></text>
        </view>
      </picker>
      <view class="info-divider"></view>
      <!-- 活动时间 -->
      <picker mode="multiSelector" :range="timeRange" @change="onTimeChange">
        <view class="info-row">
          <text class="iconfont icon-shijian1 info-icon"></text>
          <text class="info-label">活动时间</text>
          <view class="info-value">{{ timeText || '请选择' }}</view>
          <text class="iconfont icon-arrow-right info-arrow"></text>
        </view>
      </picker>
      <view class="info-divider"></view>
      <!-- 活动地点 -->
      <view class="info-row">
        <text class="iconfont icon-didiandingwei_o info-icon"></text>
        <text class="info-label">活动地点</text>
        <input class="info-value input-value" v-model="place" placeholder="请输入活动地点" />
      </view>
      <view class="info-divider"></view>
      <!-- 最大参与人数 -->
      <view class="info-row">
        <text class="iconfont icon-renshu info-icon"></text>
        <text class="info-label">最大参与人数</text>
        <input class="info-value input-value" v-model.number="maxAttendees" type="number" min="1" placeholder="请输入最大参与人数" />
      </view>
      <view class="info-divider"></view>
      <!-- 活动标签 -->
      <view class="info-row tag-row">
        <text class="iconfont icon-biaoqian info-icon"></text>
        <text class="info-label">活动标签</text>
        <view class="tag-list">
          <view
            v-for="(tag, idx) in tagOptions"
            :key="idx"
            class="tag-chip"
            :class="{ active: selectedTags.includes(tag) }"
            @tap.stop="toggleTag(tag)"
          >{{ tag }}</view>
        </view>
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
      currentWordCount: 0 , // 当前输入字数
      isEdit: false, // 是否为编辑状态
      editId: '', // 新增：编辑时的活动ID
    };
  },
  onLoad(options) {
    if (options.activity) {
      const activity = JSON.parse(decodeURIComponent(options.activity));
      this.isEdit = true;
      this.editId = activity._id;
      this.title = activity.title;
      this.contentHtml = activity.content;
      // 处理时间回显
      if (activity.activity_time) {
        this.timeText = `${this.formatDate(activity.activity_time).split(' ')[0]} ${this.formatTime(activity.activity_time)}`;
      }
      this.place = activity.location;
      this.maxAttendees = activity.max_attendees;
      this.selectedTags = Array.isArray(activity.tags) ? activity.tags : [];
      this.cover = activity.files?.[0] || '';
      // 回显类型
      this.typeIndex = this.typeOptions.findIndex(t => t === activity.category);
    }
  },
  computed: {
    canPublish() {
      // 编辑模式下允许部分字段不变（根据需求调整验证逻辑）
      return this.isEdit || (
        this.cover && 
        this.title.trim() && 
        this.contentHtml.trim() && 
        this.typeIndex !== -1 && 
        this.timeText && 
        this.place.trim() && 
        Number(this.maxAttendees) >= 1
      );
    }
  },
  methods: {
    // 时间格式化辅助方法（用于回显时间）
    formatDate(ts) {
      const date = new Date(ts);
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const day = date.getDate().toString().padStart(2, '0');
      return `${month}/${day}`;
    },
    formatTime(ts) {
      const date = new Date(ts);
      const hours = date.getHours().toString().padStart(2, '0');
      const minutes = date.getMinutes().toString().padStart(2, '0');
      return `${hours}:${minutes}`;
    },
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
    onEditorReady() {
      // #ifdef MP-WEIXIN
      uni.createSelectorQuery().in(this).select('#editor').context(res => {
        if (res && res.context && this.contentHtml) {
          console.log('小程序富文本内容回显', this.contentHtml)
          res.context.setContents({ html: this.contentHtml });
        }
      }).exec();
      // #endif
      // #ifdef H5
      if (this.$refs.editor && this.contentHtml) {
        console.log('H5富文本内容回显', this.contentHtml)
        this.$refs.editor.setContents({ html: this.contentHtml });
      }
      // #endif
    },
    publishActivity() {
      if (!this.canPublish) return;
      
      uni.showLoading({ title: this.isEdit ? '更新中...' : '发布中...' });
      
      // 上传封面图（仅本地图片才上传，云端fileID或http图片直接用）
      const uploadCover = new Promise((resolve, reject) => {
        const isLocalFile = this.cover && !/^cloud:\/\//.test(this.cover) && !/^https?:\/\//.test(this.cover);
        if (!this.cover || !isLocalFile) {
          // 已经是云端图片、网络图片或未选择图片
          resolve([this.cover]);
          return;
        }
        uniCloud.uploadFile({
          filePath: this.cover,
          cloudPath: `activities/${Date.now()}-${Math.random().toString(36).slice(-6)}.${this.cover.split('.').pop()}`,
          success: res => resolve([res.fileID]),
          fail: err => reject(err)
        });
      });
      
      // 处理时间格式
      const [dateStr, timeStr] = this.timeText.split(' ');
      const [monthStr, dayStr] = dateStr.split('/');
      const [hour, minute] = timeStr.split(':');
      const currentDate = new Date();
      const currentYear = currentDate.getFullYear();
      const selectedMonth = parseInt(monthStr) - 1;
      const selectedDay = parseInt(dayStr);
      const activityDate = new Date(currentYear, selectedMonth, selectedDay, parseInt(hour), parseInt(minute));
      if (activityDate.getMonth() !== selectedMonth) {
        activityDate.setFullYear(currentYear + 1);
      }
      const activityTime = activityDate.getTime();
      
      uploadCover
        .then(fileIDs => {
          const userInfo = uni.getStorageSync('uni-id-pages-userInfo')
          const userId = userInfo && userInfo._id ? userInfo._id : ''
          if (!userId) {
            uni.hideLoading();
            uni.showToast({ title: '请先登录', icon: 'none' });
            return Promise.reject(new Error('请先登录'));
          }
          // 编辑和新建分开
          if (this.isEdit && this.editId) {
            return uniCloud.callFunction({
              name: 'update-content',
              data: {
                _id: this.editId,
                content_type: 'activity',
                title: this.title,
                category: this.typeOptions[this.typeIndex],
                content: this.contentHtml,
                files: fileIDs,
                activity_time: activityTime,
                location: this.place,
                max_attendees: Number(this.maxAttendees),
                user_id: userId,
                tags: this.selectedTags
              }
            });
          } else {
            return uniCloud.callFunction({
              name: 'add-content',
              data: {
                content_type: 'activity',
                title: this.title,
                category: this.typeOptions[this.typeIndex],
                content: this.contentHtml,
                files: fileIDs,
                activity_time: activityTime,
                location: this.place,
                max_attendees: Number(this.maxAttendees),
                user_id: userId,
                tags: this.selectedTags
              }
            });
          }
        })
        .then(res => {
          uni.hideLoading();
          if (res && res.result && res.result.code === 200) {
            uni.showToast({
              title: this.isEdit ? '更新成功' : '发布成功',
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
              title: err.message || (this.isEdit ? '更新失败' : '发布失败'),
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
/* 自定义导航栏样式 */
.custom-navbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 100rpx; /* 与原生导航栏高度一致 */
  background: linear-gradient(90deg, #eaffd0 0%, #fffbe8 100%); /* 与页面顶部渐变一致 */
  display: flex;
  align-items: center;
  padding: 0 32rpx;
  z-index: 10; /* 确保在顶部 */
}

.nav-back {
  font-size: 40rpx;
  color: #222;
  margin-right: 32rpx;
}

.nav-title {
  font-size: 34rpx;
  font-weight: 700;
  color: #222;
}
// 顶部渐变色区域加高，底部渐变透明过渡
.header-gradient-overlap {
  position: relative;
  background: linear-gradient(90deg, #eaffd0 0%, #fffbe8 100%);
  border-radius: 0 0 48rpx 48rpx;
  padding: 0 0 120rpx 0;
  min-height: 260rpx;
  z-index: 1;
  overflow: hidden;
}
.header-gradient-fade {
  position: absolute;
  left: 0; right: 0; bottom: 0;
  height: 40rpx;
  background: linear-gradient(to bottom, rgba(255,255,255,0) 0%, #f8f9fc 100%);
  z-index: 2;
}
// 悬浮叠加的输入卡片
.overlap-card {
  position: relative;
  z-index: 3;
  margin: -350rpx 24rpx 0 24rpx;
  background: #fff;
  border-radius: 24rpx;
  box-shadow: 0 8rpx 32rpx rgba(77,124,191,0.10);
  padding: 36rpx 28rpx 28rpx 28rpx;
}
.cover-upload-box {
  margin-top: 32rpx;
  display: flex;
  align-items: center;
  position: relative;
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
  left: 180rpx;
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
  font-size: 34rpx;
  font-weight: 800;
  height: 80rpx;
  // color: #333;
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
  color: #cbcdca;
  background: #f8f9fc;
	// background-color: pink;
  border: none;
  border-radius: 12rpx;
  padding: 18rpx;
}
.rich-editor {
  height: 200rpx;
  //字体不倾斜
  font-style: normal;
}
.word-count{
  font-size: 24rpx;
  color: #cbcdca;
  margin-top: 8rpx;
  text-align: right;
}
.info-card {
  background: #fff;
  border-radius: 24rpx;
  margin: 32rpx 24rpx 0 24rpx;
  box-shadow: 0 2rpx 12rpx rgba(77,124,191,0.06);
  padding: 0 0 80rpx 0; //上 左 下 右
}
.info-row {
  display: flex;
  align-items: center;
  padding: 0 32rpx;
  height: 110rpx;
  position: relative;
}
.info-icon {
  font-size: 36rpx;
  color: #b0b6be;
  margin-right: 18rpx;
}
.info-label {
  font-size: 30rpx;
  font-family: 'AlimamaShuHeiTi-Bold' !important;
  font-weight: 700;
  color: #222;
  margin-right: 18rpx;
  min-width: 140rpx;
}
.info-value {
  flex: 1;
  font-size: 28rpx;
  color: #b0b6be;
  text-align: left;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.input-value {
  background: transparent;
  border: none;
  font-size: 28rpx;
  color: #b0b6be;
  flex: 1;
  padding: 0;
  margin: 0;
}
.info-arrow {
  font-size: 32rpx;
  color: #e0e0e0;
  margin-left: 12rpx;
}
.info-divider {
  height: 1rpx;
  background: #f0f1f5;
  margin: 0 32rpx;
}
.tag-row {
  align-items: flex-start;
  min-height: 90rpx;
  padding-top: 18rpx;
  padding-bottom: 18rpx;
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
