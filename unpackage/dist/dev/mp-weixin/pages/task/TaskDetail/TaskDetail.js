"use strict";
const common_vendor = require("../../../common/vendor.js");
const _sfc_main = {
  data() {
    return {
      currentUserRole: "user",
      taskId: "",
      taskData: null,
      task: {
        id: "",
        type: "",
        status: "",
        title: "",
        description: "",
        reward: 0,
        publishTime: "",
        expectedDeliveryTime: "",
        pickupAddress: "",
        deliveryAddress: "",
        trackingNumber: "",
        recipientName: "",
        contactName: "",
        contactPhone: "",
        selectedCondition: "",
        images: [],
        publisher: {
          id: "",
          nickname: "",
          avatar: "",
          creditRating: 0
        },
        accepter: null
      }
    };
  },
  computed: {
    isPublisher() {
      return this.currentUserRole === "publisher";
    },
    isClaimer() {
      return this.currentUserRole === "claimer";
    },
    canClaimTask() {
      return !this.isPublisher && !this.isClaimer && this.task.status === "pending";
    },
    showClaimButton() {
      return this.canClaimTask;
    },
    showStartButton() {
      return this.isPublisher && this.task.status === "pending";
    },
    showSubmitButton() {
      return this.isPublisher && this.task.status === "in_progress";
    },
    showCancelButton() {
      return this.isPublisher && ["pending", "in_progress"].includes(this.task.status);
    }
  },
  methods: {
    getCurrentUser() {
      const userInfo = common_vendor.index.getStorageSync("uni-id-pages-userInfo");
      if (userInfo) {
        return {
          id: userInfo._id,
          nickname: userInfo.nickname,
          avatar: userInfo.avatar_file && userInfo.avatar_file.url ? userInfo.avatar_file.url : "/static/images/avatar1.png"
          // 使用默认头像
        };
      } else {
        return null;
      }
    },
    getRole(task, user) {
      var _a, _b;
      if (!task || !user || !user.id)
        return "user";
      if (((_a = task.publisher) == null ? void 0 : _a.id) === user.id)
        return "publisher";
      if (((_b = task.accepter) == null ? void 0 : _b.id) === user.id)
        return "claimer";
      return "user";
    },
    determineUserRole() {
      var _a;
      const user = this.getCurrentUser();
      const role = this.getRole(this.task, user);
      common_vendor.index.__f__("log", "at pages/task/TaskDetail/TaskDetail.vue:236", "[角色判断] 当前用户ID:", user ? user.id : "未登录");
      common_vendor.index.__f__("log", "at pages/task/TaskDetail/TaskDetail.vue:237", "[角色判断] 任务发布者ID:", (_a = this.task.publisher) == null ? void 0 : _a.id);
      common_vendor.index.__f__("log", "at pages/task/TaskDetail/TaskDetail.vue:238", "[角色判断] 任务状态:", this.task.status);
      common_vendor.index.__f__("log", "at pages/task/TaskDetail/TaskDetail.vue:239", "[角色判断] 最终角色:", role);
      this.currentUserRole = role;
    },
    getTaskTypeText(type) {
      const typeMap = {
        "express": "快递代取",
        "takeout": "外卖代拿",
        "buy": "求购",
        "sell": "出物",
        "other": "其他"
      };
      return typeMap[type] || type;
    },
    getConditionText(condition) {
      const conditionMap = {
        "new": "全新",
        "like-new": "九成新",
        "good": "八成新",
        "fair": "七成新"
      };
      return conditionMap[condition] || "";
    },
    getTaskStatusText(status) {
      const statusMap = {
        "pending": "待接单",
        "in_progress": "进行中",
        "completed": "已完成",
        "cancelled": "已取消"
      };
      return statusMap[status] || status;
    },
    navigateToPickup() {
      common_vendor.index.__f__("log", "at pages/task/TaskDetail/TaskDetail.vue:271", "导航到取件地址");
    },
    navigateToDelivery() {
      common_vendor.index.__f__("log", "at pages/task/TaskDetail/TaskDetail.vue:274", "导航到送达地址");
    },
    copyPickupAddress() {
      common_vendor.index.setClipboardData({
        data: this.task.pickupAddress,
        success: () => {
          common_vendor.index.showToast({
            title: "取件地址已复制",
            icon: "success"
          });
        }
      });
    },
    copyDeliveryAddress() {
      common_vendor.index.setClipboardData({
        data: this.task.deliveryAddress,
        success: () => {
          common_vendor.index.showToast({
            title: "送达地址已复制",
            icon: "success"
          });
        }
      });
    },
    handleImageError(e) {
      common_vendor.index.__f__("error", "at pages/task/TaskDetail/TaskDetail.vue:299", "图片加载失败:", e);
      common_vendor.index.showToast({
        title: "图片加载失败",
        icon: "none"
      });
    },
    getFormattedTitle(task) {
      if (!task)
        return "未知任务";
      switch (task.type) {
        case "buy":
          return `求购${task.itemName || ""}${task.selectedCondition ? `(${this.getConditionText(task.selectedCondition)})` : ""}`;
        case "express":
          return `${task.pickupAddress || ""}快递代取`;
        case "sell":
          return `出${task.selectedCondition ? this.getConditionText(task.selectedCondition) : ""}${task.itemName || ""}`;
        case "takeout":
          return `${task.pickupAddress || ""}外卖代拿`;
        default:
          return task.title || "未知任务";
      }
    },
    startTask() {
      if (this.task) {
        const taskId = this.task.id || "task_" + Date.now().toString();
        const currentUser = this.getCurrentUser();
        if (!currentUser) {
          common_vendor.index.showToast({
            title: "请先登录",
            icon: "none"
          });
          return;
        }
        if (!this.task.itemName && this.task.type === "buy") {
          common_vendor.index.showToast({
            title: "物品名称不能为空",
            icon: "none"
          });
          return;
        }
        if (!this.task.pickupAddress && (this.task.type === "express" || this.task.type === "takeout")) {
          common_vendor.index.showToast({
            title: "取件地址不能为空",
            icon: "none"
          });
          return;
        }
        const taskData = {
          id: taskId,
          type: this.task.type || "unknown",
          title: this.getFormattedTitle(this.task),
          // 使用格式化后的标题
          itemName: this.task.itemName || "",
          selectedCondition: this.task.selectedCondition || "",
          pickupAddress: this.task.pickupAddress || "",
          deliveryAddress: this.task.deliveryAddress || "",
          price: this.task.price || 0,
          description: this.task.description || "",
          images: this.task.images || [],
          status: "pending",
          createTime: (/* @__PURE__ */ new Date()).toISOString(),
          publisher: {
            id: currentUser._id,
            nickname: currentUser.nickname || "匿名用户",
            avatar: currentUser.avatar_file && currentUser.avatar_file.url || "/static/images/avatar1.png"
          }
        };
        common_vendor.index.__f__("log", "at pages/task/TaskDetail/TaskDetail.vue:373", "[TaskDetail.vue] 即将发布任务数据:", taskData);
        common_vendor.index.$emit("newTaskPublished", taskData);
        common_vendor.index.showToast({
          title: "发布成功",
          icon: "success",
          duration: 2e3
        });
        setTimeout(() => {
          common_vendor.index.redirectTo({
            url: "/pages/index/index",
            success: () => {
              common_vendor.index.__f__("log", "at pages/task/TaskDetail/TaskDetail.vue:385", "跳转到首页成功");
              try {
                const existingTasks = common_vendor.index.getStorageSync("myTasks") || "[]";
                const tasks = JSON.parse(existingTasks);
                const myTasksExistingIndex = tasks.findIndex((t) => t.id === taskData.id);
                if (myTasksExistingIndex === -1) {
                  tasks.unshift(taskData);
                  common_vendor.index.setStorageSync("myTasks", JSON.stringify(tasks));
                  common_vendor.index.__f__("log", "at pages/task/TaskDetail/TaskDetail.vue:393", "任务已保存到本地存储 myTasks");
                } else {
                  common_vendor.index.__f__("log", "at pages/task/TaskDetail/TaskDetail.vue:395", "任务已存在于 myTasks，跳过添加");
                }
              } catch (error) {
                common_vendor.index.__f__("error", "at pages/task/TaskDetail/TaskDetail.vue:398", "保存任务到本地存储 myTasks 失败:", error);
              }
            },
            fail: (err) => {
              common_vendor.index.__f__("error", "at pages/task/TaskDetail/TaskDetail.vue:402", "跳转失败:", err);
              common_vendor.index.showToast({
                title: "页面跳转失败",
                icon: "none"
              });
            }
          });
        }, 1500);
      } else {
        common_vendor.index.__f__("warn", "at pages/task/TaskDetail/TaskDetail.vue:411", "任务数据为空");
        common_vendor.index.showToast({
          title: "任务数据获取失败",
          icon: "none"
        });
      }
    },
    submitTask() {
      common_vendor.index.__f__("log", "at pages/task/TaskDetail/TaskDetail.vue:419", "提交任务");
    },
    cancelTask() {
      let releasePagePath = "";
      switch (this.task.type) {
        case "express":
          releasePagePath = "/pages/TaskRelease/DeliveryTask/DeliveryTask";
          break;
        case "takeout":
          releasePagePath = "/pages/TaskRelease/TakeoutTask/TakeoutTask";
          break;
        case "buy":
          releasePagePath = "/pages/TaskRelease/PurchaseTask/PurchaseTask";
          break;
        case "sell":
          releasePagePath = "/pages/TaskRelease/OutTask/OutTask";
          break;
        default:
          common_vendor.index.__f__("warn", "at pages/task/TaskDetail/TaskDetail.vue:437", "未知任务类型，无法跳转到修改页面:", this.task.type);
          common_vendor.index.showToast({
            title: "该任务类型不支持修改",
            icon: "none"
          });
          return;
      }
      common_vendor.index.navigateTo({
        url: `${releasePagePath}?taskInfo=${encodeURIComponent(JSON.stringify(this.task))}`
      });
    },
    confirmClaimTask() {
      const currentUser = this.getCurrentUser();
      if (!currentUser || !currentUser.id) {
        common_vendor.index.showToast({
          title: "请先登录",
          icon: "none"
        });
        return;
      }
      if (this.task.status !== "pending") {
        common_vendor.index.showToast({
          title: "任务状态已变更",
          icon: "none"
        });
        return;
      }
      if (!this.canClaimTask) {
        common_vendor.index.showToast({
          title: "您不能接此任务",
          icon: "none"
        });
        return;
      }
      common_vendor.index.showModal({
        title: "确认接单",
        content: "接单后即可查看发布者联系方式，确认接单后将无法取消，是否继续？",
        confirmText: "确认",
        cancelText: "取消",
        success: (res) => {
          if (res.confirm) {
            common_vendor.index.__f__("log", "at pages/task/TaskDetail/TaskDetail.vue:481", "调用接单API:", { taskId: this.task.id, userId: currentUser.id });
            const newTask = JSON.parse(JSON.stringify(this.task));
            newTask.status = "in_progress";
            newTask.accepter = currentUser;
            newTask.ownerType = "received";
            this.task = newTask;
            common_vendor.index.showToast({
              title: "接单成功",
              icon: "success",
              duration: 2e3
            });
            try {
              const existingTasks = common_vendor.index.getStorageSync("myTasks") || "[]";
              const tasks = JSON.parse(existingTasks);
              const taskIndex = tasks.findIndex((t) => t.id === this.task.id);
              if (taskIndex !== -1) {
                tasks[taskIndex] = newTask;
                common_vendor.index.setStorageSync("myTasks", JSON.stringify(tasks));
              }
            } catch (error) {
              common_vendor.index.__f__("error", "at pages/task/TaskDetail/TaskDetail.vue:505", "更新本地任务状态失败:", error);
            }
            setTimeout(() => {
              const navUrl = "/pages/MyTask/MyTask?acceptedTask=" + encodeURIComponent(JSON.stringify(newTask)) + "&activeTab=received";
              common_vendor.index.navigateTo({
                url: navUrl
              });
            }, 1500);
          }
        }
      });
    },
    goBack() {
      common_vendor.index.navigateBack();
    },
    async getTaskDetail(taskId) {
      try {
        common_vendor.index.__f__("log", "at pages/task/TaskDetail/TaskDetail.vue:523", "获取任务详情 (模拟):", taskId);
        const mockTask = {
          id: taskId,
          type: "express",
          status: "pending",
          title: "代取快递",
          description: "帮忙取一个快递，在学校快递站",
          reward: 5,
          publishTime: "2024-03-20 14:30",
          expectedDeliveryTime: "2024-03-20 18:00",
          pickupAddress: "学校快递站",
          deliveryAddress: "宿舍区",
          trackingNumber: "1234567890",
          recipientName: "李四",
          contactName: "李四",
          contactPhone: "13900139000",
          publisher: {
            id: "original_publisher_id",
            nickname: "原始发布者",
            avatar: "/static/avatar/default.png",
            creditRating: 4.8
          },
          accepter: null
        };
        return mockTask;
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/task/TaskDetail/TaskDetail.vue:551", "获取任务详情失败:", error);
        common_vendor.index.showToast({
          title: "获取任务详情失败",
          icon: "error"
        });
        return null;
      }
    },
    formatPublishTime(time) {
      if (!time)
        return "";
      const date = new Date(time);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    }
  },
  onLoad(options) {
    common_vendor.index.__f__("log", "at pages/task/TaskDetail/TaskDetail.vue:570", "[页面加载] 参数:", options);
    const currentUser = this.getCurrentUser();
    common_vendor.index.__f__("log", "at pages/task/TaskDetail/TaskDetail.vue:573", "[页面加载] 获取到的当前用户:", currentUser);
    if (options.taskInfo) {
      try {
        const taskInfo = JSON.parse(decodeURIComponent(options.taskInfo));
        common_vendor.index.__f__("log", "at pages/task/TaskDetail/TaskDetail.vue:578", "[页面加载] 解析后的任务信息:", taskInfo);
        this.task = taskInfo;
        this.determineUserRole();
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/task/TaskDetail/TaskDetail.vue:584", "[页面加载] 解析任务信息失败:", error);
        common_vendor.index.showToast({
          title: "获取任务信息失败",
          icon: "error"
        });
      }
    } else if (options.id) {
      this.taskId = options.id;
      const eventChannel = this.getOpenerEventChannel();
      eventChannel.on("taskData", (data) => {
        this.taskData = data.task;
        common_vendor.index.__f__("log", "at pages/task/TaskDetail/TaskDetail.vue:597", "[页面加载] 从index页面接收到的任务数据:", this.taskData);
        if (this.taskData) {
          this.task = this.taskData;
          this.determineUserRole();
        }
      });
    } else {
      common_vendor.index.__f__("log", "at pages/task/TaskDetail/TaskDetail.vue:605", "[页面加载] 没有任务信息，创建默认任务");
      const currentUser2 = this.getCurrentUser();
      let defaultTask = {
        id: "default_task_id",
        type: "express",
        status: "pending",
        title: "默认代取快递任务",
        description: "这是一个默认的测试任务",
        reward: 5,
        publishTime: (/* @__PURE__ */ new Date()).toLocaleString(),
        expectedDeliveryTime: "18:00",
        pickupAddress: "学校快递站",
        deliveryAddress: "宿舍区",
        trackingNumber: "1234567890",
        contactName: "张三",
        contactPhone: "13800138000",
        publisher: null,
        accepter: null
      };
      if (currentUser2 && currentUser2.id) {
        defaultTask.publisher = {
          id: currentUser2.id,
          nickname: currentUser2.nickname,
          avatar: currentUser2.avatar,
          creditRating: 4.5
        };
      } else {
        defaultTask.publisher = { id: "default_publisher", nickname: "默认发布者", avatar: "/static/images/avatar1.png", creditRating: 4.5 };
      }
      this.task = defaultTask;
      this.determineUserRole();
    }
  },
  watch: {
    task: {
      handler(newTask) {
        if (newTask) {
          common_vendor.index.__f__("log", "at pages/task/TaskDetail/TaskDetail.vue:645", "[任务数据变化] 重新判断角色");
          this.determineUserRole();
        }
      },
      deep: true
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: $data.task.type === "buy"
  }, $data.task.type === "buy" ? {
    b: common_vendor.t($data.task.title)
  } : $data.task.type === "sell" ? {
    d: common_vendor.t($data.task.title)
  } : ["express", "takeout"].includes($data.task.type) ? {
    f: common_vendor.t($data.task.title),
    g: common_vendor.t($data.task.pickupAddress)
  } : {
    h: common_vendor.t($data.task.title)
  }, {
    c: $data.task.type === "sell",
    e: ["express", "takeout"].includes($data.task.type),
    i: common_vendor.t($options.getTaskTypeText($data.task.type)),
    j: common_vendor.n($data.task.type),
    k: $data.task.tags && $data.task.tags.includes("加急")
  }, $data.task.tags && $data.task.tags.includes("加急") ? {} : {}, {
    l: common_vendor.t($options.getTaskStatusText($data.task.status)),
    m: common_vendor.n($data.task.status),
    n: common_vendor.t($options.formatPublishTime($data.task.publishTime)),
    o: ["express", "takeout"].includes($data.task.type)
  }, ["express", "takeout"].includes($data.task.type) ? {
    p: common_vendor.t($data.task.expectedDeliveryTime)
  } : {}, {
    q: common_vendor.t($data.task.reward),
    r: ["sell", "buy"].includes($data.task.type)
  }, ["sell", "buy"].includes($data.task.type) ? {
    s: common_vendor.t($options.getConditionText($data.task.selectedCondition))
  } : {}, {
    t: $data.task.images && $data.task.images.length > 0 && ["buy", "sell", "takeout"].includes($data.task.type)
  }, $data.task.images && $data.task.images.length > 0 && ["buy", "sell", "takeout"].includes($data.task.type) ? {
    v: common_vendor.f($data.task.images, (image, index, i0) => {
      return {
        a: image,
        b: common_vendor.o((...args) => $options.handleImageError && $options.handleImageError(...args), index),
        c: index
      };
    })
  } : {}, {
    w: $data.task.type !== "other"
  }, $data.task.type !== "other" ? {
    x: common_vendor.t($data.task.description)
  } : {}, {
    y: ["express", "takeout"].includes($data.task.type)
  }, ["express", "takeout"].includes($data.task.type) ? common_vendor.e({
    z: common_vendor.t($data.task.pickupAddress),
    A: $data.task.type === "express"
  }, $data.task.type === "express" ? {
    B: common_vendor.t($data.task.trackingNumber)
  } : {}, {
    C: common_vendor.t($data.task.deliveryAddress)
  }) : {}, {
    D: common_vendor.t($data.task.type === "express" ? "收件人信息" : "联系信息"),
    E: ["express", "sell", "buy", "takeout", "other"].includes($data.task.type)
  }, ["express", "sell", "buy", "takeout", "other"].includes($data.task.type) ? common_vendor.e({
    F: $options.isPublisher
  }, $options.isPublisher ? {
    G: common_vendor.t(["express", "takeout"].includes($data.task.type) ? "收件人姓名" : "联系人姓名"),
    H: common_vendor.t($data.task.contactName),
    I: common_vendor.t($data.task.contactPhone)
  } : $options.isClaimer ? {
    K: common_vendor.t(["express", "takeout"].includes($data.task.type) ? "收件人姓名" : "联系人姓名"),
    L: common_vendor.t($data.task.contactName),
    M: common_vendor.t($data.task.contactPhone)
  } : {
    N: common_vendor.t(["express", "takeout"].includes($data.task.type) ? "收件人姓名" : "联系人姓名"),
    O: common_vendor.t($data.task.contactName)
  }, {
    J: $options.isClaimer
  }) : {
    P: $data.task.publisher.avatar,
    Q: common_vendor.t($data.task.publisher.nickname),
    R: common_vendor.t($data.task.publisher.creditRating)
  }, {
    S: $options.showClaimButton
  }, $options.showClaimButton ? {
    T: common_vendor.o((...args) => $options.confirmClaimTask && $options.confirmClaimTask(...args))
  } : {}, {
    U: $options.showClaimButton
  }, $options.showClaimButton ? {
    V: common_vendor.o((...args) => $options.goBack && $options.goBack(...args))
  } : {}, {
    W: $options.isPublisher && $options.showStartButton
  }, $options.isPublisher && $options.showStartButton ? {
    X: common_vendor.o((...args) => $options.startTask && $options.startTask(...args))
  } : {}, {
    Y: $options.isPublisher && $options.showCancelButton
  }, $options.isPublisher && $options.showCancelButton ? {
    Z: common_vendor.o((...args) => $options.cancelTask && $options.cancelTask(...args))
  } : {});
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../../.sourcemap/mp-weixin/pages/task/TaskDetail/TaskDetail.js.map
