<template>
<view class="container">
<!-- 顶部标题 -->
<view class="header">
<view class="title">常用任务</view>
</view>
<!-- 常用任务标签区 -->
<scroll-view class="quick-tasks" scroll-x>
<view class="task-tags">
<view class="tag" v-for="(tag, index) in quickTasks" :key="index" @tap="handleQuickTask(tag.type)">
<view class="icon-circle">
  <uni-icons :type="tag.icon" size="24" :color="tag.color" />
</view>
<text>{{ tag.name }}</text>
</view>
</view>
</scroll-view>
<!-- 主要任务类型区域 -->
<view class="task-types">
<view class="section-title">发布任务</view>
<view
class="task-card"
v-for="(task, index) in taskTypes"
:key="index"
:class="{ active: selectedTask === task.type }"
@tap="handleSelectTask(task.type)"
>
<view class="task-icon" :style="{ backgroundColor: task.color + '45' }">
<uni-icons :type="task.icon" size="32" :color="task.color" />
</view>
<view class="task-info">
<view class="task-name">{{ task.name }}</view>
  <view class="task-desc">{{ task.description }}</view>
</view>
<view class="task-arrow">
  <uni-icons type="right" size="23" color="#999" />
</view>
</view>
</view>
</view>

</template>

<script>
export default {
  data() {
    return {
      selectedTask: '',
      quickTasks: [
        { name: '代拿快递', type: 'express', icon: 'gift', color: '#3498db' },
        { name: '卖闲置书', type: 'book', icon: 'paperplane', color: '#2ecc71' },
      ],
      taskTypes: [
        {
          name: '出物',
          type: 'sell',
          description: '出售你的闲置物品，让它们找到新主人',
          icon: 'shop',
          color: '#3498db'
        },
        {
          name: '求购',
          type: 'buy',
          description: '发布你的需求，快速找到心仪物品',
          icon: 'cart',
          color: '#2ecc71'
        },
        {
          name: '快递代拿',
          type: 'express',
          description: '找人代取快递，省时又省力',
          icon: 'gift',
          color: '#e67e22'
        },
        {
          name: '外卖代拿',
          type: 'takeout',
          description: '找人代取外卖，美食即刻享用',
          icon: 'location',
          color: '#e74c3c'
        },
        {
          name: '其他',
          type: 'other',
          description: '其他你想要发布的任何任务',
          icon: 'more-filled',
          color: '#8E8E93'
        }
      ],
    }
  },
  methods: {
    handleQuickTask(type) {
      this.handleSelectTask(type);
    },

    handleSelectTask(type) {
      this.selectedTask = type;
      
      // 根据任务类型跳转到对应页面
      const taskMap = {
        'sell': '/pages/task/TaskRelease/OutTask/OutTask',
        'buy': '/pages/task/TaskRelease/PurchaseTask/PurchaseTask',
        'express': '/pages/task/TaskRelease/DeliveryTask/DeliveryTask',
        'takeout': '/pages/task/TaskRelease/TakeoutTask/TakeoutTask',
        'book': '/pages/task/TaskRelease/OutTask/OutTask',
        'other': '/pages/task/TaskRelease/QuickRelease/QuickRelease'
      };

      const targetPath = taskMap[type];
      if (targetPath) {
        uni.navigateTo({
          url: targetPath,
          success: () => {
            console.log('跳转成功:', type);
          },
          fail: (err) => {
            console.error('跳转失败:', err);
            uni.showToast({
              title: '页面跳转失败',
              icon: 'none'
            });
          }
        });
      }
    },
  }
}
</script>

<style>
page {
height: 100%;
}
.container {
min-height: 100%;
background-color: #f5f5f5;
display: flex;
flex-direction: column;
}
.header {
padding: 30rpx;
background-color: #ffffff;
}
.title {
font-size: 18px;
font-weight: 600;
color: #333333;
}
.quick-tasks {
background-color: #ffffff;
padding: 20rpx 30rpx;
white-space: nowrap;
}
.task-tags {
display: flex;
flex-direction: row;
padding: 10rpx 0;
white-space: nowrap;
}
.tag {
display: inline-flex;
flex-direction: column;
align-items: center;
padding: 12rpx;
margin-right: 30rpx;
}
.icon-circle {
width: 96rpx;
height: 96rpx;
display: flex;
align-items: center;
justify-content: center;
background-color: #f8f8f8;
border-radius: 50%;
margin-bottom: 8rpx;
}
.tag text {
font-size: 12px;
color: #666666;
}
.task-types {
padding: 30rpx;
}
.section-title {
font-size: 18px;
font-weight: 600;
color: #333333;
margin-bottom: 20rpx;
}
.task-card {
display: flex;
flex-direction: row;
align-items: center;
justify-content: space-between;
padding: 30rpx;
background-color: #ffffff;
border-radius: 16rpx;
margin-bottom: 20rpx;
transition: all 0.3s ease;
}
.task-card.active {
transform: scale(1.02);
}
.task-icon {
width: 72rpx;
height: 72rpx;
display: flex;
align-items: center;
justify-content: center;
border-radius: 16rpx;
margin-right: 24rpx;
flex-shrink: 0;
}
.task-info {
flex: 1;
display: flex;
flex-direction: column;
justify-content: center;
padding-left: 0;
}
.task-name {
font-size: 16px;
font-weight: 500;
color: #333333;
margin-bottom: 4rpx;
}
.task-desc {
font-size: 14px;
color: #999999;
}
.task-arrow {
margin-left: 20rpx;
flex-shrink: 0;
display: flex;
align-items: center;
}
</style>
