"use strict";
const common_vendor = require("../../../common/vendor.js");
const _sfc_main = {
  data() {
    return {
      currentUserRole: "user",
      TEST_MODE: true,
      TEST_USER: {
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
      },
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
    },
    showTestButtons() {
      return this.TEST_MODE;
    }
  },
  methods: {
    getCurrentUser() {
      if (this.TEST_MODE) {
        const testRole = common_vendor.index.getStorageSync("testRole") || "user";
        const user = this.TEST_USER[testRole] || this.TEST_USER.user;
        common_vendor.index.setStorageSync("userToken", "test_token");
        common_vendor.index.setStorageSync("userId", user.id);
        common_vendor.index.setStorageSync("userNickname", user.nickname);
        common_vendor.index.setStorageSync("userAvatar", user.avatar);
        return user;
      } else {
        return {
          id: common_vendor.index.getStorageSync("userId"),
          nickname: common_vendor.index.getStorageSync("userNickname"),
          avatar: common_vendor.index.getStorageSync("userAvatar")
        };
      }
    },
    getRole(task, user) {
      var _a, _b;
      if (!task || !user.id)
        return "user";
      if (((_a = task.publisher) == null ? void 0 : _a.id) === user.id)
        return "publisher";
      if (((_b = task.accepter) == null ? void 0 : _b.id) === user.id)
        return "claimer";
      return "user";
    },
    determineUserRole() {
      const user = this.getCurrentUser();
      const role = this.getRole(this.task, user);
      common_vendor.index.__f__("log", "at pages/task/TaskDetail/TaskDetail.vue:271", "[角色判断] 当前用户:", user.nickname, "任务状态:", this.task.status, "角色:", role);
      this.currentUserRole = role;
    },
    getTaskTypeText(type) {
      const typeMap = {
        "express": "快递代取",
        "takeout": "外卖代拿",
        "buy": "求购",
        "sell": "出物"
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
      return conditionMap[condition] || condition;
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
    switchTestRole(role) {
      common_vendor.index.__f__("log", "at pages/task/TaskDetail/TaskDetail.vue:302", "[切换角色] 目标角色:", role);
      common_vendor.index.setStorageSync("testRole", role);
      const user = this.TEST_USER[role] || this.TEST_USER.user;
      common_vendor.index.setStorageSync("userId", user.id);
      common_vendor.index.setStorageSync("userNickname", user.nickname);
      common_vendor.index.setStorageSync("userAvatar", user.avatar);
      this.determineUserRole();
      common_vendor.index.showToast({ title: `已切换至${role}角色`, icon: "none" });
    },
    navigateToPickup() {
      common_vendor.index.__f__("log", "at pages/task/TaskDetail/TaskDetail.vue:312", "导航到取件地址");
    },
    navigateToDelivery() {
      common_vendor.index.__f__("log", "at pages/task/TaskDetail/TaskDetail.vue:315", "导航到送达地址");
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
      common_vendor.index.__f__("error", "at pages/task/TaskDetail/TaskDetail.vue:340", "图片加载失败:", e);
      common_vendor.index.showToast({
        title: "图片加载失败",
        icon: "none"
      });
    },
    startTask() {
      if (this.task) {
        const taskId = Date.now().toString();
        const currentUser = this.getCurrentUser();
        const taskData = {
          ...this.task,
          id: taskId,
          status: "pending",
          publishTime: (/* @__PURE__ */ new Date()).toLocaleString(),
          publisher: {
            id: currentUser.id,
            nickname: currentUser.nickname,
            avatar: currentUser.avatar,
            level: 1,
            credit: 100
          },
          ownerType: "published"
        };
        common_vendor.index.__f__("log", "at pages/task/TaskDetail/TaskDetail.vue:366", "发布任务:", taskData);
        common_vendor.index.$emit("newTaskPublished", taskData);
        common_vendor.index.showToast({
          title: "发布成功",
          icon: "success",
          duration: 2e3
        });
        setTimeout(() => {
          common_vendor.index.redirectTo({
            url: "/pages/TaskHall/TaskHall",
            success: () => {
              common_vendor.index.__f__("log", "at pages/task/TaskDetail/TaskDetail.vue:378", "跳转到任务大厅成功");
              try {
                const existingTasks = common_vendor.index.getStorageSync("myTasks") || "[]";
                const tasks = JSON.parse(existingTasks);
                tasks.unshift(taskData);
                common_vendor.index.setStorageSync("myTasks", JSON.stringify(tasks));
                common_vendor.index.__f__("log", "at pages/task/TaskDetail/TaskDetail.vue:384", "任务已保存到本地存储");
              } catch (error) {
                common_vendor.index.__f__("error", "at pages/task/TaskDetail/TaskDetail.vue:386", "保存任务到本地存储失败:", error);
              }
            },
            fail: (err) => {
              common_vendor.index.__f__("error", "at pages/task/TaskDetail/TaskDetail.vue:390", "跳转失败:", err);
              common_vendor.index.showToast({
                title: "页面跳转失败",
                icon: "none"
              });
            }
          });
        }, 1500);
      } else {
        common_vendor.index.__f__("warn", "at pages/task/TaskDetail/TaskDetail.vue:399", "任务数据为空");
        common_vendor.index.showToast({
          title: "任务数据获取失败",
          icon: "none"
        });
      }
    },
    submitTask() {
      common_vendor.index.__f__("log", "at pages/task/TaskDetail/TaskDetail.vue:407", "提交任务");
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
          common_vendor.index.__f__("warn", "at pages/task/TaskDetail/TaskDetail.vue:425", "未知任务类型，无法跳转到修改页面:", this.task.type);
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
      if (!common_vendor.index.getStorageSync("userToken")) {
        common_vendor.index.showToast({ title: "请先登录", icon: "none" });
        return;
      }
      if (this.task.status !== "pending") {
        common_vendor.index.showToast({ title: "任务状态已变更", icon: "none" });
        return;
      }
      if (!this.canClaimTask) {
        common_vendor.index.showToast({ title: "您不能接此任务", icon: "none" });
        return;
      }
      common_vendor.index.showModal({
        title: "确认接单",
        content: "接单后即可查看发布者联系方式，确认接单后将无法取消，是否继续？",
        confirmText: "确认",
        cancelText: "取消",
        success: (res) => {
          if (res.confirm) {
            common_vendor.index.__f__("log", "at pages/task/TaskDetail/TaskDetail.vue:460", "调用接单API:", { taskId: this.task.id, userId: currentUser.id });
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
              common_vendor.index.__f__("error", "at pages/task/TaskDetail/TaskDetail.vue:484", "更新本地任务状态失败:", error);
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
        common_vendor.index.__f__("log", "at pages/task/TaskDetail/TaskDetail.vue:502", "获取任务详情 (模拟):", taskId);
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
        common_vendor.index.__f__("error", "at pages/task/TaskDetail/TaskDetail.vue:530", "获取任务详情失败:", error);
        common_vendor.index.showToast({
          title: "获取任务详情失败",
          icon: "error"
        });
        return null;
      }
    }
  },
  onLoad(options) {
    common_vendor.index.__f__("log", "at pages/task/TaskDetail/TaskDetail.vue:540", "[页面加载] 参数:", options);
    const currentTestRole = this.TEST_MODE ? common_vendor.index.getStorageSync("testRole") || "user" : null;
    common_vendor.index.__f__("log", "at pages/task/TaskDetail/TaskDetail.vue:543", "[页面加载] 当前测试角色:", currentTestRole);
    if (this.TEST_MODE) {
      this.getCurrentUser();
    }
    const currentUser = this.getCurrentUser();
    if (options.taskInfo) {
      try {
        const taskInfo = JSON.parse(decodeURIComponent(options.taskInfo));
        common_vendor.index.__f__("log", "at pages/task/TaskDetail/TaskDetail.vue:553", "[页面加载] 解析后的任务信息:", taskInfo);
        const modifiedTask = JSON.parse(JSON.stringify(taskInfo));
        if (this.TEST_MODE) {
          const user = this.getCurrentUser();
          if (currentTestRole === "publisher") {
            modifiedTask.publisher = user;
            modifiedTask.accepter = null;
            modifiedTask.status = modifiedTask.status === "in_progress" ? "in_progress" : "pending";
          } else if (currentTestRole === "claimer") {
            modifiedTask.accepter = user;
            if (modifiedTask.status === "pending")
              modifiedTask.status = "in_progress";
          } else {
            modifiedTask.publisher = this.TEST_USER.publisher;
            modifiedTask.accepter = null;
            modifiedTask.status = "pending";
            if (modifiedTask.publisher.id === currentUser.id) {
              modifiedTask.publisher = this.TEST_USER.user;
            }
          }
        }
        this.task = modifiedTask;
        this.determineUserRole();
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/task/TaskDetail/TaskDetail.vue:580", "[页面加载] 解析任务信息失败:", error);
        common_vendor.index.showToast({
          title: "获取任务信息失败",
          icon: "error"
        });
      }
    } else if (options.id) {
      this.getTaskDetail(options.id).then((taskData) => {
        if (taskData) {
          if (this.TEST_MODE) {
            const user = this.getCurrentUser();
            const modifiedTask = JSON.parse(JSON.stringify(taskData));
            if (currentTestRole === "publisher") {
              modifiedTask.publisher = user;
              modifiedTask.accepter = null;
              modifiedTask.status = "pending";
            } else if (currentTestRole === "claimer") {
              modifiedTask.accepter = user;
              modifiedTask.status = "in_progress";
            } else {
              modifiedTask.accepter = null;
              modifiedTask.status = "pending";
            }
            this.task = modifiedTask;
          } else {
            this.task = taskData;
          }
          this.determineUserRole();
        } else {
          common_vendor.index.__f__("error", "at pages/task/TaskDetail/TaskDetail.vue:612", "[页面加载] 获取任务详情返回空数据:", options.id);
          common_vendor.index.showToast({
            title: "任务不存在",
            icon: "none"
          });
        }
      }).catch((error) => {
        common_vendor.index.__f__("error", "at pages/task/TaskDetail/TaskDetail.vue:619", "[页面加载] 获取任务详情失败:", error);
        common_vendor.index.showToast({
          title: "获取任务详情失败",
          icon: "error"
        });
      });
    } else {
      common_vendor.index.__f__("log", "at pages/task/TaskDetail/TaskDetail.vue:626", "[页面加载] 没有任务信息，创建默认任务");
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
      if (this.TEST_MODE) {
        if (currentTestRole === "publisher") {
          defaultTask.publisher = currentUser2;
          defaultTask.status = "pending";
        } else if (currentTestRole === "claimer") {
          defaultTask.accepter = currentUser2;
          defaultTask.status = "in_progress";
        } else {
          defaultTask.publisher = { id: "other_publisher", nickname: "其他发布者", avatar: "/static/avatar/default.png" };
          defaultTask.status = "pending";
        }
      } else {
        defaultTask.publisher = { id: "default_publisher", nickname: "默认发布者", avatar: "/static/avatar/default.png", creditRating: 4.5 };
      }
      this.task = defaultTask;
      this.determineUserRole();
    }
  },
  watch: {
    task: {
      handler(newTask) {
        if (newTask) {
          common_vendor.index.__f__("log", "at pages/task/TaskDetail/TaskDetail.vue:670", "[任务数据变化] 重新判断角色");
          this.determineUserRole();
        }
      },
      deep: true
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
  return common_vendor.e({
    a: common_vendor.p({
      type: "left",
      size: "24",
      color: "#000000"
    }),
    b: common_vendor.o((...args) => $options.goBack && $options.goBack(...args)),
    c: common_vendor.t($options.getTaskStatusText($data.task.status)),
    d: common_vendor.n($data.task.status),
    e: $data.task.images && $data.task.images.length > 0 && ["buy", "sell", "takeout"].includes($data.task.type)
  }, $data.task.images && $data.task.images.length > 0 && ["buy", "sell", "takeout"].includes($data.task.type) ? {
    f: common_vendor.f($data.task.images, (image, index, i0) => {
      return {
        a: image,
        b: common_vendor.o((...args) => $options.handleImageError && $options.handleImageError(...args), index),
        c: index
      };
    })
  } : {}, {
    g: $data.task.type === "buy"
  }, $data.task.type === "buy" ? {
    h: common_vendor.t($data.task.title)
  } : $data.task.type === "sell" ? {
    j: common_vendor.t($data.task.title),
    k: common_vendor.t($options.getConditionText($data.task.selectedCondition))
  } : ["express", "takeout"].includes($data.task.type) ? {
    m: common_vendor.t($data.task.title),
    n: common_vendor.t($data.task.pickupAddress)
  } : {
    o: common_vendor.t($data.task.title)
  }, {
    i: $data.task.type === "sell",
    l: ["express", "takeout"].includes($data.task.type),
    p: common_vendor.t($options.getTaskTypeText($data.task.type)),
    q: common_vendor.n($data.task.type),
    r: $data.task.tags && $data.task.tags.includes("加急")
  }, $data.task.tags && $data.task.tags.includes("加急") ? {} : {}, {
    s: common_vendor.t($data.task.publishTime),
    t: ["express", "takeout"].includes($data.task.type)
  }, ["express", "takeout"].includes($data.task.type) ? {
    v: common_vendor.t($data.task.expectedDeliveryTime)
  } : {}, {
    w: common_vendor.t($data.task.reward),
    x: ["sell", "buy"].includes($data.task.type)
  }, ["sell", "buy"].includes($data.task.type) ? {
    y: common_vendor.t($options.getConditionText($data.task.selectedCondition))
  } : {}, {
    z: common_vendor.t($data.task.description),
    A: ["express", "takeout"].includes($data.task.type)
  }, ["express", "takeout"].includes($data.task.type) ? common_vendor.e({
    B: common_vendor.t($data.task.pickupAddress),
    C: $data.task.type === "express"
  }, $data.task.type === "express" ? {
    D: common_vendor.t($data.task.trackingNumber)
  } : {}, {
    E: common_vendor.t($data.task.deliveryAddress)
  }) : {}, {
    F: common_vendor.t($data.task.type === "express" ? "收件人信息" : "联系信息"),
    G: ["express", "sell", "buy", "takeout"].includes($data.task.type)
  }, ["express", "sell", "buy", "takeout"].includes($data.task.type) ? common_vendor.e({
    H: $options.isPublisher
  }, $options.isPublisher ? {
    I: common_vendor.t(["express", "takeout"].includes($data.task.type) ? "收件人姓名" : "联系人姓名"),
    J: common_vendor.t($data.task.contactName),
    K: common_vendor.t($data.task.contactPhone)
  } : $options.isClaimer ? {
    M: common_vendor.t(["express", "takeout"].includes($data.task.type) ? "收件人姓名" : "联系人姓名"),
    N: common_vendor.t($data.task.contactName),
    O: common_vendor.t($data.task.contactPhone)
  } : {
    P: common_vendor.t(["express", "takeout"].includes($data.task.type) ? "收件人姓名" : "联系人姓名"),
    Q: common_vendor.t($data.task.contactName)
  }, {
    L: $options.isClaimer
  }) : {
    R: $data.task.publisher.avatar,
    S: common_vendor.t($data.task.publisher.nickname),
    T: common_vendor.t($data.task.publisher.creditRating)
  }, {
    U: $options.showClaimButton
  }, $options.showClaimButton ? {
    V: common_vendor.o((...args) => $options.confirmClaimTask && $options.confirmClaimTask(...args))
  } : {}, {
    W: $options.showClaimButton
  }, $options.showClaimButton ? {
    X: common_vendor.o((...args) => $options.goBack && $options.goBack(...args))
  } : {}, {
    Y: $options.isPublisher && $options.showStartButton
  }, $options.isPublisher && $options.showStartButton ? {
    Z: common_vendor.o((...args) => $options.startTask && $options.startTask(...args))
  } : {}, {
    aa: $options.isPublisher && $options.showCancelButton
  }, $options.isPublisher && $options.showCancelButton ? {
    ab: common_vendor.o((...args) => $options.cancelTask && $options.cancelTask(...args))
  } : {}, {
    ac: $options.showTestButtons
  }, $options.showTestButtons ? {
    ad: common_vendor.o(($event) => $options.switchTestRole("publisher")),
    ae: common_vendor.o(($event) => $options.switchTestRole("claimer")),
    af: common_vendor.o(($event) => $options.switchTestRole("user"))
  } : {});
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../../.sourcemap/mp-weixin/pages/task/TaskDetail/TaskDetail.js.map
