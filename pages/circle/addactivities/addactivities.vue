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
      <textarea class="input-desc" v-model="desc" maxlength="100" placeholder="请简单介绍活动内容..." auto-height />
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
    return {
      cover: '',
      isHot: true,
      title: '',
      desc: '',
      typeOptions: ['官方', '社团', '学术', '体育', '娱乐', '其他'],
      typeIndex: -1,
      timeRange: [
        ['05/01', '05/02', '05/03', '05/04', '05/05', '05/06', '05/07'],
        ['10:00', '14:00', '18:00', '20:00']
      ],
      timeText: '',
      place: '',
      tagOptions: ['户外', '运动', '娱乐', '交友', '学习', '比赛', '官方', '自发'],
      selectedTags: [],
    };
  },
  computed: {
    canPublish() {
      return this.cover && this.title.trim() && this.desc.trim() && this.typeIndex !== -1 && this.timeText && this.place.trim();
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
    publishActivity() {
      if (!this.canPublish) return;
      uni.showToast({ title: '发布成功', icon: 'success' });
      setTimeout(() => {
        uni.navigateBack();
      }, 800);
    }
  }
};
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
