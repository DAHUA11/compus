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
          name: '以物换物',
          type: 'exchange',
          description: '用闲置物品交换你需要的东西，各取所需',
          icon: 'refresh',
          color: '#9b59b6'
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
        }
      ],
      taskList: [
        {
          id: 1,
          name: '外卖代拿',
          description: '代取外卖，快速送达',
          icon: 'shop',
          color: '#FF9F1C',
          path: '/pages/task/TaskRelease/TakeoutTask/TakeoutTask'
        },
        {
          id: 2,
          name: '快递代取',
          description: '代取快递，安全可靠',
          icon: 'car',
          color: '#00BFFF',
          path: '/pages/task/TaskRelease/DeliveryTask/DeliveryTask'
        },
        {
          id: 3,
          name: '物品交换',
          description: '物品交换，互惠互利',
          icon: 'refresh',
          color: '#47B960',
          path: '/pages/task/TaskRelease/ExchangeTask/ExchangeTask'
        },
        {
          id: 4,
          name: '求购服务',
          description: '代购商品，方便快捷',
          icon: 'cart',
          color: '#FF6B6B',
          path: '/pages/task/TaskRelease/PurchaseTask/PurchaseTask'
        },
        {
          id: 5,
          name: '出物服务',
          description: '外出代办，省时省力',
          icon: 'location',
          color: '#9C27B0',
          path: '/pages/task/TaskRelease/OutTask/OutTask'
        }
      ]
    }
  },
  methods: {
    handleQuickTask(type) {
      this.selectedTask = type;
      // 这里可以直接跳转到对应的发布页面
    },

    handleSelectTask(type) {
      this.selectedTask = type;
      
      // 根据任务类型跳转到对应页面
      const taskMap = {
        'sell': '/pages/task/TaskRelease/OutTask/OutTask',
        'buy': '/pages/task/TaskRelease/PurchaseTask/PurchaseTask',
        'exchange': '/pages/task/TaskRelease/ExchangeTask/ExchangeTask',
        'express': '/pages/task/TaskRelease/DeliveryTask/DeliveryTask',
        'takeout': '/pages/task/TaskRelease/TakeoutTask/TakeoutTask'
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

    handleTaskClick(task) {
      uni.navigateTo({
        url: task.path,
        success: () => {
          console.log('跳转成功:', task.name);
        },
        fail: (err) => {
          console.error('跳转失败:', err);
          uni.showToast({
            title: '页面跳转失败',
            icon: 'none'
          });
        }
      });
    },

    getCurrentUser() {
      const TEST_MODE = true; // 确保这里的TEST_MODE也为true
      const TEST_USER = {
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
      };
      
      if (TEST_MODE) {
        const testRole = uni.getStorageSync('testRole') || 'user';
        return TEST_USER[testRole] || TEST_USER.user;
      } else {
        return {
          id: uni.getStorageSync('userId'),
          nickname: uni.getStorageSync('userNickname'),
          avatar: uni.getStorageSync('userAvatar')
        };
      }
    },

    async submitTask() {
      try {
        // 表单验证
        if (!this.validateForm()) {
          return;
        }

        // 构建任务数据
        const taskData = {
          id: Date.now(), // 临时ID，实际应该由后端生成
          type: this.taskType,
          title: this.title,
          description: this.description,
          reward: Number(this.reward),
          publishTime: new Date().toLocaleString(),
          status: 'pending',
          tags: this.isUrgent ? ['加急'] : [],
          // 根据任务类型添加特定字段
          ...(this.taskType === 'express' || this.taskType === 'takeout' ? {
            pickupAddress: this.pickupAddress,
            deliveryAddress: this.deliveryAddress,
            expectedDeliveryTime: this.expectedDeliveryTime
          } : {}),
          ...(this.taskType === 'buy' || this.taskType === 'sell' ? {
            itemName: this.itemName,
            selectedCondition: this.selectedCondition,
            price: Number(this.price)
          } : {}),
          // 添加发布者信息，使用getCurrentUser()获取
          publisher: this.getCurrentUser()
        };

        console.log('发布任务:', taskData);

        // 将任务数据传递给TaskHall和MyTask页面
        const taskInfo = encodeURIComponent(JSON.stringify(taskData));
        
        // 使用事件总线发送任务数据
        uni.$emit('newTaskPublished', taskData);

        // 显示成功提示
        uni.showToast({
          title: '发布成功',
          icon: 'success',
          duration: 2000
        });

        // 延迟跳转，让用户看到成功提示
        setTimeout(() => {
          // 跳转到任务大厅，并传递任务数据
          uni.switchTab({
            url: '/pages/task/TaskHall/TaskHall',
            success: () => {
              console.log('跳转到任务大厅成功');
              // 在跳转成功后，通过事件总线传递任务数据
              uni.$emit('newTaskPublished', taskData);
            },
            fail: (err) => {
              console.error('跳转失败:', err);
              uni.showToast({
                title: '页面跳转失败',
                icon: 'none'
              });
            }
          });
        }, 1500);

      } catch (error) {
        console.error('发布任务失败:', error);
        uni.showToast({
          title: '发布失败，请重试',
          icon: 'error'
        });
      }
    }
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
