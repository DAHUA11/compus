"use strict";
const common_vendor = require("../../../common/vendor.js");
const _sfc_main = {
  data() {
    return {
      searchKeyword: "",
      activeTab: "published",
      isRefreshing: false,
      hasMore: true,
      publishedUnread: 0,
      receivedUnread: 0,
      selectedTasks: [],
      tasks: [],
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
      }
    };
  },
  computed: {
    filteredTasks() {
      const keyword = this.searchKeyword.trim().toLowerCase();
      common_vendor.index.__f__("log", "at pages/task/MyTask/MyTask.vue:210", "MyTask - filteredTasks: searchKeyword:", keyword);
      common_vendor.index.__f__("log", "at pages/task/MyTask/MyTask.vue:211", "MyTask - filteredTasks: activeTab:", this.activeTab);
      return this.tasks.filter((task) => {
        var _a, _b, _c;
        const matchesKeyword = task.title.toLowerCase().includes(keyword) || ((_a = task.pickupAddress) == null ? void 0 : _a.toLowerCase().includes(keyword)) || ((_b = task.deliveryAddress) == null ? void 0 : _b.toLowerCase().includes(keyword)) || ((_c = task.itemName) == null ? void 0 : _c.toLowerCase().includes(keyword));
        const matchesTab = this.activeTab === "published" && task.ownerType === "published" || this.activeTab === "received" && task.ownerType === "received";
        common_vendor.index.__f__("log", "at pages/task/MyTask/MyTask.vue:221", `MyTask - filteredTasks: Task ID: ${task.id}, OwnerType: ${task.ownerType}, MatchesKeyword: ${matchesKeyword}, MatchesTab: ${matchesTab}, FilteredIn: ${matchesKeyword && matchesTab}`);
        return matchesKeyword && matchesTab;
      });
    }
  },
  methods: {
    loadStoredTasks() {
      try {
        common_vendor.index.__f__("log", "at pages/task/MyTask/MyTask.vue:229", "MyTask - loadStoredTasks: 开始加载本地存储数据");
        const existingTasks = common_vendor.index.getStorageSync("myTasks") || "[]";
        common_vendor.index.__f__("log", "at pages/task/MyTask/MyTask.vue:231", "MyTask - loadStoredTasks: 从uni.getStorageSync('myTasks')读取到:", existingTasks);
        const parsedTasks = JSON.parse(existingTasks);
        this.tasks = parsedTasks;
        common_vendor.index.__f__("log", "at pages/task/MyTask/MyTask.vue:234", "MyTask - loadStoredTasks: tasks 初始化成功，数据为:", this.tasks);
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/task/MyTask/MyTask.vue:236", "MyTask - loadStoredTasks: 加载失败:", error);
        this.tasks = [];
        common_vendor.index.__f__("log", "at pages/task/MyTask/MyTask.vue:238", "MyTask - loadStoredTasks: 加载失败, tasks 初始化为空数组");
      }
    },
    saveTasks() {
      try {
        common_vendor.index.setStorageSync("myTasks", JSON.stringify(this.tasks));
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/task/MyTask/MyTask.vue:245", "保存任务数据失败:", error);
      }
    },
    removeDuplicates(taskList) {
      const taskMap = /* @__PURE__ */ new Map();
      for (const task of taskList) {
        taskMap.set(task.id, task);
      }
      return Array.from(taskMap.values());
    },
    switchTab(tab) {
      common_vendor.index.__f__("log", "at pages/task/MyTask/MyTask.vue:256", "MyTask - switchTab: 切换标签页至:", tab);
      this.activeTab = tab;
      common_vendor.index.__f__("log", "at pages/task/MyTask/MyTask.vue:258", "MyTask - switchTab: 当前 activeTab:", this.activeTab);
      common_vendor.index.__f__("log", "at pages/task/MyTask/MyTask.vue:259", "MyTask - switchTab: 过滤后的任务列表 filteredTasks:", this.filteredTasks);
      this.searchKeyword = "";
      this.selectedTasks = [];
    },
    loadTasks(type) {
      setTimeout(() => {
        this.hasMore = true;
      }, 1e3);
    },
    loadMoreTasks() {
      if (this.hasMore) {
        this.loadTasks(this.activeTab);
      }
    },
    onRefresh() {
      this.isRefreshing = true;
      setTimeout(() => {
        this.isRefreshing = false;
      }, 1500);
    },
    getTaskTypeColor(type) {
      const colorMap = {
        express: "#00BFFF",
        takeout: "#FF9F1C",
        buy: "#47B960",
        sell: "#9C27B0"
      };
      return colorMap[type] || "#999999";
    },
    getTaskTypeIcon(type) {
      const iconMap = {
        express: "package",
        takeout: "food",
        buy: "shopping-cart",
        sell: "tag"
      };
      return iconMap[type] || "info";
    },
    getTaskTypeName(type) {
      const nameMap = {
        express: "快递代拿",
        takeout: "外卖代拿",
        buy: "求购",
        sell: "出售"
      };
      return nameMap[type] || "其他";
    },
    getTaskStatusText(status) {
      const statusMap = {
        pending: "待领取",
        processing: "进行中",
        completed: "已完成",
        cancelled: "已取消"
      };
      return statusMap[status] || "未知状态";
    },
    getPublishedActionText(status) {
      const actionMap = {
        pending: "取消任务",
        processing: "提醒领取",
        completed: "查看记录",
        cancelled: "删除任务"
      };
      return actionMap[status] || "查看详情";
    },
    getReceivedActionText(status) {
      const actionMap = {
        pending: "开始执行",
        processing: "上传凭证",
        completed: "查看记录",
        cancelled: "申请取消"
      };
      return actionMap[status] || "查看详情";
    },
    formatTime(time) {
      if (!time)
        return "";
      const date = new Date(time);
      return date.toLocaleString("zh-CN", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit"
      });
    },
    maskAddress(address) {
      if (!address)
        return "";
      const length = address.length;
      if (length <= 4)
        return address;
      return address.slice(0, 2) + "****" + address.slice(length - 2);
    },
    handlePublishedAction(task) {
      switch (task.status) {
        case "pending":
          break;
        case "processing":
          break;
        case "completed":
          common_vendor.index.navigateTo({
            url: `/pages/task-record/task-record?id=${task.id}`
          });
          break;
      }
    },
    handleReceivedAction(task) {
      switch (task.status) {
      }
    },
    handleBatchAction(action) {
      if (this.selectedTasks.length === 0)
        return;
      switch (action) {
        case "cancel":
          break;
        case "read":
          this.selectedTasks = [];
          break;
      }
    },
    showFilterOptions() {
      common_vendor.index.showModal({
        title: "筛选条件",
        content: "暂未实现，敬请期待",
        confirmText: "知道了"
      });
    },
    navigateToDetail(task) {
      common_vendor.index.__f__("log", "at pages/task/MyTask/MyTask.vue:403", "MyTask - navigateToDetail: 跳转到任务详情，任务ID:", task.id);
      const taskInfoStr = encodeURIComponent(JSON.stringify(task));
      common_vendor.index.navigateTo({
        url: `/pages/TaskDetail/TaskDetail?taskInfo=${taskInfoStr}`,
        fail: (err) => {
          common_vendor.index.__f__("error", "at pages/task/MyTask/MyTask.vue:408", "跳转任务详情页失败:", err);
          common_vendor.index.showToast({
            title: "跳转失败",
            icon: "none"
          });
        }
      });
    },
    handleSearch() {
      this.loadTasks(this.activeTab);
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
    getTimeSensitivityReminder(expectedDeliveryTime) {
      common_vendor.index.__f__("log", "at pages/task/MyTask/MyTask.vue:429", "MyTask - getTimeSensitivityReminder: 传入的 expectedDeliveryTime:", expectedDeliveryTime);
      if (!expectedDeliveryTime)
        return "暂无时效信息";
      const now = /* @__PURE__ */ new Date();
      let deadlineDate;
      deadlineDate = new Date(expectedDeliveryTime);
      if (isNaN(deadlineDate.getTime())) {
        const [hours, minutes] = expectedDeliveryTime.split(":").map(Number);
        if (!isNaN(hours) && !isNaN(minutes)) {
          const today = new Date(now);
          today.setHours(hours, minutes, 0, 0);
          deadlineDate = today;
        } else {
          common_vendor.index.__f__("error", "at pages/task/MyTask/MyTask.vue:445", "MyTask - getTimeSensitivityReminder: 无法解析的日期时间格式:", expectedDeliveryTime);
          return "无效时效信息";
        }
      }
      const diffInMilliseconds = deadlineDate.getTime() - now.getTime();
      const diffInMinutes = Math.ceil(diffInMilliseconds / (1e3 * 60));
      if (diffInMinutes < 0) {
        const overdueMinutes = Math.abs(diffInMinutes);
        if (overdueMinutes === 0) {
          return "已到截止时间";
        } else if (overdueMinutes < 60) {
          return `已超时 ${overdueMinutes} 分钟`;
        } else if (overdueMinutes < 60 * 24) {
          const overdueHours = Math.floor(overdueMinutes / 60);
          const remainingMinutes = overdueMinutes % 60;
          return `已超时 ${overdueHours} 小时 ${remainingMinutes} 分钟`;
        } else {
          const overdueDays = Math.floor(overdueMinutes / (60 * 24));
          return `已超时 ${overdueDays} 天`;
        }
      } else if (diffInMinutes > 0) {
        if (diffInMinutes < 60) {
          return `剩余 ${diffInMinutes} 分钟`;
        } else if (diffInMinutes < 60 * 24) {
          const hours = Math.floor(diffInMinutes / 60);
          const minutes = diffInMinutes % 60;
          return `剩余 ${hours} 小时 ${minutes} 分钟`;
        } else {
          const days = Math.floor(diffInMinutes / (60 * 24));
          return `剩余 ${days} 天`;
        }
      } else {
        return "已到截止时间";
      }
    },
    switchTestRole(role) {
      common_vendor.index.setStorageSync("testRole", role);
      const user = this.TEST_USER[role] || this.TEST_USER.user;
      common_vendor.index.setStorageSync("userToken", "test_token");
      common_vendor.index.setStorageSync("userId", user.id);
      common_vendor.index.setStorageSync("userNickname", user.nickname);
      common_vendor.index.setStorageSync("userAvatar", user.avatar);
      this.loadStoredTasks();
      common_vendor.index.showToast({ title: `已切换至${role}角色`, icon: "none" });
    }
  },
  onLoad(options) {
    common_vendor.index.__f__("log", "at pages/task/MyTask/MyTask.vue:496", "MyTask - onLoad: 页面加载开始, 参数:", options);
    if (options.activeTab) {
      this.activeTab = options.activeTab;
      common_vendor.index.__f__("log", "at pages/task/MyTask/MyTask.vue:500", "MyTask - onLoad: 根据参数设置 activeTab:", this.activeTab);
    } else {
      this.activeTab = "published";
      common_vendor.index.__f__("log", "at pages/task/MyTask/MyTask.vue:503", "MyTask - onLoad: 参数中未指定 activeTab，默认为:", this.activeTab);
    }
    this.loadStoredTasks();
    if (options.acceptedTask) {
      try {
        const acceptedTask = JSON.parse(decodeURIComponent(options.acceptedTask));
        common_vendor.index.__f__("log", "at pages/task/MyTask/MyTask.vue:511", "MyTask - onLoad: 解析 acceptedTask:", acceptedTask);
        const existingIndex = this.tasks.findIndex((task) => task.id === acceptedTask.id);
        if (existingIndex !== -1) {
          this.tasks[existingIndex] = acceptedTask;
          common_vendor.index.__f__("log", "at pages/task/MyTask/MyTask.vue:516", "MyTask - onLoad: 任务已存在，更新:", acceptedTask.id);
        } else {
          this.tasks.unshift(acceptedTask);
          common_vendor.index.__f__("log", "at pages/task/MyTask/MyTask.vue:519", "MyTask - onLoad: 添加新任务:", acceptedTask.id);
        }
        this.saveTasks();
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/task/MyTask/MyTask.vue:523", "MyTask - onLoad: 解析 acceptedTask 失败:", error);
      }
    }
    common_vendor.index.__f__("log", "at pages/task/MyTask/MyTask.vue:527", "MyTask - onLoad: 页面加载完成");
  },
  onShow() {
    common_vendor.index.__f__("log", "at pages/task/MyTask/MyTask.vue:530", "MyTask - onShow: 页面显示");
  },
  onReady() {
    common_vendor.index.__f__("log", "at pages/task/MyTask/MyTask.vue:533", "MyTask - onReady: 页面初次渲染完成");
  },
  onHide() {
    common_vendor.index.__f__("log", "at pages/task/MyTask/MyTask.vue:536", "MyTask - onHide: 页面隐藏");
  },
  onUnload() {
    common_vendor.index.__f__("log", "at pages/task/MyTask/MyTask.vue:539", "MyTask - onUnload: 页面卸载");
    common_vendor.index.$off("newTaskPublished");
  },
  onMounted() {
    common_vendor.index.__f__("log", "at pages/task/MyTask/MyTask.vue:543", "MyTask - onMounted: 页面挂载");
    common_vendor.index.$on("newTaskPublished", (taskData) => {
      common_vendor.index.__f__("log", "at pages/task/MyTask/MyTask.vue:545", "MyTask - newTaskPublished event: 接收到新任务数据:", taskData);
      taskData.ownerType = "published";
      const updatedTasks = [taskData, ...this.tasks];
      this.tasks = this.removeDuplicates(updatedTasks);
      this.saveTasks();
      common_vendor.index.__f__("log", "at pages/task/MyTask/MyTask.vue:550", "MyTask - newTaskPublished event: 添加并保存后 tasks:", this.tasks);
    });
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
    a: $data.TEST_MODE
  }, $data.TEST_MODE ? {
    b: common_vendor.o(($event) => $options.switchTestRole("publisher")),
    c: common_vendor.o(($event) => $options.switchTestRole("claimer")),
    d: common_vendor.o(($event) => $options.switchTestRole("user"))
  } : {}, {
    e: common_vendor.p({
      type: "search",
      size: "18",
      color: "#999999"
    }),
    f: common_vendor.o([($event) => $data.searchKeyword = $event.detail.value, (...args) => $options.handleSearch && $options.handleSearch(...args)]),
    g: $data.searchKeyword,
    h: common_vendor.p({
      type: "filter",
      size: "18",
      color: "#00BFFF"
    }),
    i: common_vendor.o((...args) => $options.showFilterOptions && $options.showFilterOptions(...args)),
    j: $data.activeTab === "published" ? 1 : "",
    k: common_vendor.o(($event) => $options.switchTab("published")),
    l: $data.activeTab === "received" ? 1 : "",
    m: common_vendor.o(($event) => $options.switchTab("received")),
    n: common_vendor.f($options.filteredTasks, (task, k0, i0) => {
      return common_vendor.e({
        a: "7f6109d9-2-" + i0,
        b: common_vendor.p({
          type: $options.getTaskTypeIcon(task.type),
          size: "16",
          color: "#FFFFFF"
        }),
        c: common_vendor.t($options.getTaskTypeName(task.type)),
        d: $options.getTaskTypeColor(task.type),
        e: common_vendor.t($options.getTaskStatusText(task.status)),
        f: common_vendor.n(task.status),
        g: task.type === "buy"
      }, task.type === "buy" ? {
        h: common_vendor.t(task.title)
      } : task.type === "sell" ? {
        j: common_vendor.t(task.title),
        k: common_vendor.t($options.getConditionText(task.selectedCondition))
      } : ["express", "takeout"].includes(task.type) ? {
        m: common_vendor.t(task.title),
        n: common_vendor.t(task.pickupAddress)
      } : {
        o: common_vendor.t(task.title)
      }, {
        i: task.type === "sell",
        l: ["express", "takeout"].includes(task.type)
      }, $data.activeTab === "received" ? common_vendor.e({
        p: task.type === "express" || task.type === "takeout"
      }, task.type === "express" || task.type === "takeout" ? {
        q: "7f6109d9-3-" + i0,
        r: common_vendor.p({
          type: "location",
          size: "12",
          color: "#00BFFF"
        }),
        s: common_vendor.t($options.maskAddress(task.pickupAddress))
      } : {}, {
        t: task.type === "express" || task.type === "takeout"
      }, task.type === "express" || task.type === "takeout" ? {
        v: "7f6109d9-4-" + i0,
        w: common_vendor.p({
          type: "location-filled",
          size: "12",
          color: "#00BFFF"
        }),
        x: common_vendor.t($options.maskAddress(task.deliveryAddress))
      } : {}) : {}, {
        y: $data.activeTab === "published" && (task.type === "buy" || task.type === "sell") || $data.activeTab === "received" && (task.type === "buy" || task.type === "sell")
      }, $data.activeTab === "published" && (task.type === "buy" || task.type === "sell") || $data.activeTab === "received" && (task.type === "buy" || task.type === "sell") ? {
        z: "7f6109d9-5-" + i0,
        A: common_vendor.p({
          type: "paperplane",
          size: "12",
          color: "#00BFFF"
        }),
        B: common_vendor.t(task.itemName)
      } : {}, {
        C: "7f6109d9-6-" + i0,
        D: common_vendor.t(task.reward),
        E: $data.activeTab === "received" && (task.type === "express" || task.type === "takeout")
      }, $data.activeTab === "received" && (task.type === "express" || task.type === "takeout") ? {
        F: "7f6109d9-7-" + i0,
        G: common_vendor.p({
          type: "calendar",
          size: "12",
          color: "#FF4D4F"
        }),
        H: common_vendor.t($options.getTimeSensitivityReminder(task.expectedDeliveryTime))
      } : {}, {
        I: task.latestUpdate
      }, task.latestUpdate ? {
        J: "7f6109d9-8-" + i0,
        K: common_vendor.p({
          type: "notification",
          size: "14",
          color: "#999999"
        }),
        L: common_vendor.t(task.latestUpdate)
      } : {}, $data.activeTab === "published" ? {
        M: common_vendor.t($options.getPublishedActionText(task.status)),
        N: common_vendor.o(($event) => $options.handlePublishedAction(task), task.id)
      } : {}, $data.activeTab === "received" ? {
        O: common_vendor.t($options.getReceivedActionText(task.status)),
        P: common_vendor.o(($event) => $options.handleReceivedAction(task), task.id)
      } : {}, {
        Q: common_vendor.t($options.formatTime(task[$data.activeTab === "published" ? "publishTime" : "receiveTime"])),
        R: task.id,
        S: common_vendor.o(($event) => $options.navigateToDetail(task), task.id)
      });
    }),
    o: $data.activeTab === "received",
    p: common_vendor.p({
      type: "wallet",
      size: "12",
      color: "#00BFFF"
    }),
    q: $data.activeTab === "published",
    r: $data.activeTab === "received",
    s: common_vendor.t($data.activeTab === "published" ? "发布时间：" : "领取时间："),
    t: $data.activeTab === "published" ? 1 : "",
    v: $data.activeTab === "received" ? 1 : "",
    w: $data.hasMore
  }, $data.hasMore ? {
    x: common_vendor.p({
      type: "spinner-cycle",
      size: "20",
      color: "#00BFFF"
    })
  } : {}, {
    y: common_vendor.o((...args) => $options.loadMoreTasks && $options.loadMoreTasks(...args)),
    z: $data.isRefreshing,
    A: common_vendor.o((...args) => $options.onRefresh && $options.onRefresh(...args)),
    B: $data.selectedTasks.length > 0
  }, $data.selectedTasks.length > 0 ? {
    C: common_vendor.t($data.selectedTasks.length),
    D: common_vendor.o(($event) => $options.handleBatchAction("cancel")),
    E: common_vendor.o(($event) => $options.handleBatchAction("read"))
  } : {});
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../../.sourcemap/mp-weixin/pages/task/MyTask/MyTask.js.map
