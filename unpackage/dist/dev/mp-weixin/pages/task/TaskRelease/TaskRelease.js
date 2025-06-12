"use strict";
const common_vendor = require("../../../common/vendor.js");
const _sfc_main = {
  data() {
    return {
      selectedTask: "",
      quickTasks: [
        { name: "代拿快递", type: "express", icon: "gift", color: "#3498db" },
        { name: "卖闲置书", type: "book", icon: "paperplane", color: "#2ecc71" }
      ],
      taskTypes: [
        {
          name: "出物",
          type: "sell",
          description: "出售你的闲置物品，让它们找到新主人",
          icon: "shop",
          color: "#3498db"
        },
        {
          name: "求购",
          type: "buy",
          description: "发布你的需求，快速找到心仪物品",
          icon: "cart",
          color: "#2ecc71"
        },
        {
          name: "以物换物",
          type: "exchange",
          description: "用闲置物品交换你需要的东西，各取所需",
          icon: "refresh",
          color: "#9b59b6"
        },
        {
          name: "快递代拿",
          type: "express",
          description: "找人代取快递，省时又省力",
          icon: "gift",
          color: "#e67e22"
        },
        {
          name: "外卖代拿",
          type: "takeout",
          description: "找人代取外卖，美食即刻享用",
          icon: "location",
          color: "#e74c3c"
        }
      ],
      taskList: [
        {
          id: 1,
          name: "外卖代拿",
          description: "代取外卖，快速送达",
          icon: "shop",
          color: "#FF9F1C",
          path: "/pages/task/TaskRelease/TakeoutTask/TakeoutTask"
        },
        {
          id: 2,
          name: "快递代取",
          description: "代取快递，安全可靠",
          icon: "car",
          color: "#00BFFF",
          path: "/pages/task/TaskRelease/DeliveryTask/DeliveryTask"
        },
        {
          id: 3,
          name: "物品交换",
          description: "物品交换，互惠互利",
          icon: "refresh",
          color: "#47B960",
          path: "/pages/task/TaskRelease/ExchangeTask/ExchangeTask"
        },
        {
          id: 4,
          name: "求购服务",
          description: "代购商品，方便快捷",
          icon: "cart",
          color: "#FF6B6B",
          path: "/pages/task/TaskRelease/PurchaseTask/PurchaseTask"
        },
        {
          id: 5,
          name: "出物服务",
          description: "外出代办，省时省力",
          icon: "location",
          color: "#9C27B0",
          path: "/pages/task/TaskRelease/OutTask/OutTask"
        }
      ]
    };
  },
  methods: {
    handleQuickTask(type) {
      this.selectedTask = type;
    },
    handleSelectTask(type) {
      this.selectedTask = type;
      const taskMap = {
        "sell": "/pages/task/TaskRelease/OutTask/OutTask",
        "buy": "/pages/task/TaskRelease/PurchaseTask/PurchaseTask",
        "exchange": "/pages/task/TaskRelease/ExchangeTask/ExchangeTask",
        "express": "/pages/task/TaskRelease/DeliveryTask/DeliveryTask",
        "takeout": "/pages/task/TaskRelease/TakeoutTask/TakeoutTask"
      };
      const targetPath = taskMap[type];
      if (targetPath) {
        common_vendor.index.navigateTo({
          url: targetPath,
          success: () => {
            common_vendor.index.__f__("log", "at pages/task/TaskRelease/TaskRelease.vue:157", "跳转成功:", type);
          },
          fail: (err) => {
            common_vendor.index.__f__("error", "at pages/task/TaskRelease/TaskRelease.vue:160", "跳转失败:", err);
            common_vendor.index.showToast({
              title: "页面跳转失败",
              icon: "none"
            });
          }
        });
      }
    },
    handleTaskClick(task) {
      common_vendor.index.navigateTo({
        url: task.path,
        success: () => {
          common_vendor.index.__f__("log", "at pages/task/TaskRelease/TaskRelease.vue:174", "跳转成功:", task.name);
        },
        fail: (err) => {
          common_vendor.index.__f__("error", "at pages/task/TaskRelease/TaskRelease.vue:177", "跳转失败:", err);
          common_vendor.index.showToast({
            title: "页面跳转失败",
            icon: "none"
          });
        }
      });
    },
    getCurrentUser() {
      const TEST_USER = {
        publisher: {
          id: "test_publisher_id",
          nickname: "测试发布者",
          avatar: "/static/avatar/default.png"
        },
        claimer: {
          id: "test_claimer_id",
          nickname: "测试接单者",
          avatar: "/static/avatar/default.png"
        },
        user: {
          id: "test_user_id",
          nickname: "测试用户",
          avatar: "/static/avatar/default.png"
        }
      };
      {
        const testRole = common_vendor.index.getStorageSync("testRole") || "user";
        return TEST_USER[testRole] || TEST_USER.user;
      }
    },
    async submitTask() {
      try {
        if (!this.validateForm()) {
          return;
        }
        const taskData = {
          id: Date.now(),
          // 临时ID，实际应该由后端生成
          type: this.taskType,
          title: this.title,
          description: this.description,
          reward: Number(this.reward),
          publishTime: (/* @__PURE__ */ new Date()).toLocaleString(),
          status: "pending",
          tags: this.isUrgent ? ["加急"] : [],
          // 根据任务类型添加特定字段
          ...this.taskType === "express" || this.taskType === "takeout" ? {
            pickupAddress: this.pickupAddress,
            deliveryAddress: this.deliveryAddress,
            expectedDeliveryTime: this.expectedDeliveryTime
          } : {},
          ...this.taskType === "buy" || this.taskType === "sell" ? {
            itemName: this.itemName,
            selectedCondition: this.selectedCondition,
            price: Number(this.price)
          } : {},
          // 添加发布者信息，使用getCurrentUser()获取
          publisher: this.getCurrentUser()
        };
        common_vendor.index.__f__("log", "at pages/task/TaskRelease/TaskRelease.vue:250", "发布任务:", taskData);
        const taskInfo = encodeURIComponent(JSON.stringify(taskData));
        common_vendor.index.$emit("newTaskPublished", taskData);
        common_vendor.index.showToast({
          title: "发布成功",
          icon: "success",
          duration: 2e3
        });
        setTimeout(() => {
          common_vendor.index.switchTab({
            url: "/pages/task/TaskHall/TaskHall",
            success: () => {
              common_vendor.index.__f__("log", "at pages/task/TaskRelease/TaskRelease.vue:271", "跳转到任务大厅成功");
              common_vendor.index.$emit("newTaskPublished", taskData);
            },
            fail: (err) => {
              common_vendor.index.__f__("error", "at pages/task/TaskRelease/TaskRelease.vue:276", "跳转失败:", err);
              common_vendor.index.showToast({
                title: "页面跳转失败",
                icon: "none"
              });
            }
          });
        }, 1500);
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/task/TaskRelease/TaskRelease.vue:286", "发布任务失败:", error);
        common_vendor.index.showToast({
          title: "发布失败，请重试",
          icon: "error"
        });
      }
    }
  }
};
if (!Array) {
  const _easycom_uni_icons2 = common_vendor.resolveComponent("uni-icons");
  _easycom_uni_icons2();
}
const _easycom_uni_icons = () => "../../../uni_modules/uni-icons/components/uni-icons/uni-icons.js";
if (!Math) {
  _easycom_uni_icons();
}
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return {
    a: common_vendor.f($data.quickTasks, (tag, index, i0) => {
      return {
        a: "5c8bcf3f-0-" + i0,
        b: common_vendor.p({
          type: tag.icon,
          size: "24",
          color: tag.color
        }),
        c: common_vendor.t(tag.name),
        d: index,
        e: common_vendor.o(($event) => $options.handleQuickTask(tag.type), index)
      };
    }),
    b: common_vendor.f($data.taskTypes, (task, index, i0) => {
      return {
        a: "5c8bcf3f-1-" + i0,
        b: common_vendor.p({
          type: task.icon,
          size: "32",
          color: task.color
        }),
        c: task.color + "45",
        d: common_vendor.t(task.name),
        e: common_vendor.t(task.description),
        f: "5c8bcf3f-2-" + i0,
        g: index,
        h: $data.selectedTask === task.type ? 1 : "",
        i: common_vendor.o(($event) => $options.handleSelectTask(task.type), index)
      };
    }),
    c: common_vendor.p({
      type: "right",
      size: "23",
      color: "#999"
    })
  };
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../../.sourcemap/mp-weixin/pages/task/TaskRelease/TaskRelease.js.map
