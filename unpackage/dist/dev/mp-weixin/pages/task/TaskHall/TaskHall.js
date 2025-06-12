"use strict";
const common_vendor = require("../../../common/vendor.js");
const _sfc_main = {
  data() {
    return {
      categories: [
        { name: "全部", value: "all" },
        { name: "快递代取", value: "express" },
        { name: "外卖代拿", value: "takeout" },
        { name: "求购", value: "buy" },
        { name: "出物", value: "sell" },
        { name: "其他", value: "other" }
      ],
      scrollLeft: 0,
      tabWidths: [],
      tabPositions: [],
      searchKeyword: "",
      activeTab: "all",
      isRefreshing: false,
      hasMore: true,
      searchTimer: null,
      currentTabId: "tab-0",
      tasks: []
    };
  },
  computed: {
    filteredTasks() {
      return this.tasks.filter((task) => {
        var _a, _b, _c;
        const keyword = this.searchKeyword.trim().toLowerCase();
        const typeMatch = this.activeTab === "all" || task.type === this.activeTab;
        const keywordMatch = task.title.toLowerCase().includes(keyword) || ((_a = task.pickupAddress) == null ? void 0 : _a.toLowerCase().includes(keyword)) || ((_b = task.deliveryAddress) == null ? void 0 : _b.toLowerCase().includes(keyword)) || ((_c = task.itemName) == null ? void 0 : _c.toLowerCase().includes(keyword));
        return typeMatch && keywordMatch;
      });
    }
  },
  methods: {
    loadStoredTasks() {
      common_vendor.index.__f__("log", "at pages/task/TaskHall/TaskHall.vue:203", "TaskHall - loadStoredTasks: 开始加载本地存储数据");
      try {
        const storedTasks = common_vendor.index.getStorageSync("myTasks");
        common_vendor.index.__f__("log", "at pages/task/TaskHall/TaskHall.vue:206", "TaskHall - loadStoredTasks: 读取到的存储数据:", storedTasks);
        if (storedTasks) {
          const parsedTasks = JSON.parse(storedTasks);
          this.tasks = parsedTasks;
          common_vendor.index.__f__("log", "at pages/task/TaskHall/TaskHall.vue:210", "TaskHall - loadStoredTasks: 加载后的 tasks:", this.tasks);
        } else {
          this.tasks = [];
          common_vendor.index.__f__("log", "at pages/task/TaskHall/TaskHall.vue:213", "TaskHall - loadStoredTasks: 本地存储无数据，tasks 初始化为空数组");
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/task/TaskHall/TaskHall.vue:216", "TaskHall - 加载存储的任务数据失败:", error);
        this.tasks = [];
        common_vendor.index.__f__("log", "at pages/task/TaskHall/TaskHall.vue:218", "TaskHall - loadStoredTasks: 加载失败，tasks 初始化为空数组");
      }
    },
    saveTasks() {
      try {
        common_vendor.index.setStorageSync("myTasks", JSON.stringify(this.tasks));
        common_vendor.index.__f__("log", "at pages/task/TaskHall/TaskHall.vue:224", "TaskHall - saveTasks: 任务数据已保存到本地存储");
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/task/TaskHall/TaskHall.vue:226", "TaskHall - 保存任务数据失败:", error);
      }
    },
    handleSearchInput() {
      if (this.searchTimer) {
        clearTimeout(this.searchTimer);
      }
      this.searchTimer = setTimeout(() => {
        this.handleSearch();
      }, 300);
    },
    handleSearchConfirm() {
      if (this.searchTimer) {
        clearTimeout(this.searchTimer);
      }
      this.handleSearch();
    },
    clearSearch() {
      this.searchKeyword = "";
      this.handleSearch();
    },
    handleSearch() {
      common_vendor.index.__f__("log", "at pages/task/TaskHall/TaskHall.vue:248", "搜索关键词：", this.searchKeyword);
      this.loadTasks();
    },
    handleScroll(e) {
      common_vendor.index.__f__("log", "at pages/task/TaskHall/TaskHall.vue:252", "滚动位置:", e.detail.scrollLeft);
    },
    calculateTabPositions() {
      const query = common_vendor.index.createSelectorQuery().in(this);
      this.categories.forEach((_, index) => {
        query.select(`.tab-item:nth-child(${index + 1})`).boundingClientRect();
      });
      query.exec((res) => {
        let position = 0;
        this.tabPositions = res.map((rect) => {
          const currentPosition = position;
          position += rect.width + 24;
          return currentPosition;
        });
      });
    },
    switchTab(index) {
      this.activeTab = this.categories[index].value;
      this.searchKeyword = "";
      this.loadTasks();
      const query = common_vendor.index.createSelectorQuery();
      query.selectAll(".tab-item").boundingClientRect();
      query.select(".category-tabs").boundingClientRect();
      query.exec((res) => {
        if (res[0] && res[1]) {
          const tabs = res[0];
          const scrollView = res[1];
          let position = 0;
          for (let i = 0; i < index; i++) {
            position += tabs[i].width + 24;
          }
          const tabWidth = tabs[index].width;
          const scrollViewWidth = scrollView.width;
          this.scrollLeft = Math.max(0, position - scrollViewWidth / 2 + tabWidth / 2);
        }
      });
    },
    loadTasks() {
      setTimeout(() => {
        this.hasMore = false;
      }, 1e3);
    },
    loadMoreTasks() {
      if (this.hasMore) {
        this.loadTasks();
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
        express: "快递代取",
        takeout: "外卖代拿",
        buy: "求购",
        sell: "出物"
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
    formatTime(time) {
      if (!time)
        return "";
      const date = new Date(time);
      return date.toLocaleString("zh-CN", {
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit"
      });
    },
    formatExpireTime(time) {
      if (!time)
        return "";
      const now = /* @__PURE__ */ new Date();
      const expire = new Date(time);
      const diff = expire.getTime() - now.getTime();
      const hours = Math.floor(diff / (1e3 * 60 * 60));
      const minutes = Math.floor(diff % (1e3 * 60 * 60) / (1e3 * 60));
      if (hours > 0) {
        return `${hours}小时后过期`;
      } else if (minutes > 0) {
        return `${minutes}分钟后过期`;
      } else {
        return "即将过期";
      }
    },
    maskAddress(address) {
      if (!address)
        return "";
      const length = address.length;
      if (length <= 4)
        return address;
      return address.slice(0, 2) + "****" + address.slice(length - 2);
    },
    showFilterOptions() {
      common_vendor.index.showActionSheet({
        itemList: ["按距离排序", "按悬赏排序", "按时间排序", "只看急单"],
        success: (res) => {
          common_vendor.index.__f__("log", "at pages/task/TaskHall/TaskHall.vue:381", "选择筛选选项：", res.tapIndex);
        }
      });
    },
    handleTakeTask(task) {
      const taskInfo = {
        id: task.id,
        type: task.type,
        title: task.title,
        description: task.description,
        reward: task.reward,
        publishTime: task.publishTime,
        expectedDeliveryTime: task.expectedDeliveryTime,
        pickupAddress: task.pickupAddress,
        deliveryAddress: task.deliveryAddress,
        images: task.images || [],
        publisher: {
          id: task.publisherId,
          nickname: task.publisherName,
          avatar: task.publisherAvatar,
          creditRating: task.publisherRating
        }
      };
      common_vendor.index.navigateTo({
        url: `/pages/TaskDetail/TaskDetail?taskInfo=${encodeURIComponent(JSON.stringify(taskInfo))}`
      });
    },
    navigateToDetail(taskId) {
      common_vendor.index.navigateTo({
        url: `/pages/task-detail/task-detail?id=${taskId}`
      });
    },
    getTagClass(tag) {
      const classMap = {
        "置顶": "tag-top",
        "加急": "tag-urgent"
      };
      return classMap[tag] || "";
    },
    getTagIcon(tag) {
      const iconMap = {
        "置顶": "top",
        "加急": "notification-filled"
      };
      return iconMap[tag] || "";
    },
    getTagColor(tag) {
      const colorMap = {
        "置顶": "#FF9F1C",
        "加急": "#FF4D4F"
      };
      return colorMap[tag] || "#666666";
    }
  },
  onLoad(options) {
    common_vendor.index.__f__("log", "at pages/task/TaskHall/TaskHall.vue:437", "TaskHall - onLoad: 页面加载开始, 参数:", options);
    if (options.taskInfo) {
      try {
        const taskData = JSON.parse(decodeURIComponent(options.taskInfo));
        common_vendor.index.__f__("log", "at pages/task/TaskHall/TaskHall.vue:442", "TaskHall接收到URL传递的任务数据:", taskData);
        if (this.activeTab !== "all") {
          this.activeTab = "all";
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/task/TaskHall/TaskHall.vue:448", "TaskHall - 解析任务数据失败:", error);
        common_vendor.index.showToast({
          title: "加载任务数据失败",
          icon: "none"
        });
      }
    }
    common_vendor.index.__f__("log", "at pages/task/TaskHall/TaskHall.vue:456", "TaskHall - onLoad: 页面加载完成");
  },
  onMounted() {
    common_vendor.index.__f__("log", "at pages/task/TaskHall/TaskHall.vue:459", "TaskHall - onMounted: 页面挂载");
    this.loadStoredTasks();
    common_vendor.index.$on("newTaskPublished", (taskData) => {
      common_vendor.index.__f__("log", "at pages/task/TaskHall/TaskHall.vue:463", "TaskHall接收到新任务数据:", taskData);
      this.tasks.unshift(taskData);
      this.saveTasks();
      if (this.activeTab !== "all") {
        this.activeTab = "all";
      }
    });
  },
  onUnmounted() {
    common_vendor.index.__f__("log", "at pages/task/TaskHall/TaskHall.vue:473", "TaskHall - onUnmounted: 页面卸载");
    common_vendor.index.$off("newTaskPublished");
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
      type: "search",
      size: "18",
      color: "#999999"
    }),
    b: common_vendor.o([($event) => $data.searchKeyword = $event.detail.value, (...args) => $options.handleSearchInput && $options.handleSearchInput(...args)]),
    c: $data.searchKeyword,
    d: common_vendor.p({
      type: "filter",
      size: "18",
      color: "#00BFFF"
    }),
    e: common_vendor.o((...args) => $options.showFilterOptions && $options.showFilterOptions(...args)),
    f: common_vendor.f($data.categories, (item, index, i0) => {
      return {
        a: common_vendor.t(item.name),
        b: $data.activeTab === item.value ? 1 : "",
        c: index,
        d: common_vendor.o(($event) => $options.switchTab(index), index)
      };
    }),
    g: $data.scrollLeft,
    h: common_vendor.o((...args) => $options.handleScroll && $options.handleScroll(...args)),
    i: common_vendor.f($options.filteredTasks, (task, k0, i0) => {
      return common_vendor.e({
        a: task.tags && task.tags.length > 0
      }, task.tags && task.tags.length > 0 ? {
        b: common_vendor.f(task.tags, (tag, index, i1) => {
          return common_vendor.e({
            a: $options.getTagIcon(tag)
          }, $options.getTagIcon(tag) ? {
            b: "44200ff9-2-" + i0 + "-" + i1,
            c: common_vendor.p({
              type: $options.getTagIcon(tag),
              size: "14",
              color: $options.getTagColor(tag)
            })
          } : {}, {
            d: common_vendor.t(tag),
            e: index,
            f: common_vendor.n($options.getTagClass(tag))
          });
        })
      } : {}, {
        c: task.publisher.avatar,
        d: common_vendor.t(task.publisher.nickname),
        e: "44200ff9-3-" + i0,
        f: common_vendor.p({
          type: $options.getTaskTypeIcon(task.type),
          size: "16",
          color: "#FFFFFF"
        }),
        g: common_vendor.t($options.getTaskTypeName(task.type)),
        h: $options.getTaskTypeColor(task.type),
        i: common_vendor.t($options.getTaskStatusText(task.status)),
        j: common_vendor.n(task.status),
        k: common_vendor.t(task.title),
        l: task.type === "express" || task.type === "takeout"
      }, task.type === "express" || task.type === "takeout" ? {
        m: "44200ff9-4-" + i0,
        n: common_vendor.p({
          type: "location",
          size: "12",
          color: "#00BFFF"
        }),
        o: common_vendor.t($options.maskAddress(task.pickupAddress))
      } : {}, {
        p: task.type === "express" || task.type === "takeout"
      }, task.type === "express" || task.type === "takeout" ? {
        q: "44200ff9-5-" + i0,
        r: common_vendor.p({
          type: "location-filled",
          size: "12",
          color: "#00BFFF"
        }),
        s: common_vendor.t($options.maskAddress(task.deliveryAddress))
      } : {}, {
        t: task.type === "buy" || task.type === "sell"
      }, task.type === "buy" || task.type === "sell" ? {
        v: "44200ff9-6-" + i0,
        w: common_vendor.p({
          type: "paperplane",
          size: "12",
          color: "#00BFFF"
        }),
        x: common_vendor.t(task.itemName)
      } : {}, {
        y: "44200ff9-7-" + i0,
        z: common_vendor.t(task.reward),
        A: task.distance
      }, task.distance ? {
        B: "44200ff9-8-" + i0,
        C: common_vendor.p({
          type: "location",
          size: "14",
          color: "#999999"
        }),
        D: common_vendor.t(task.distance)
      } : {}, {
        E: task.views
      }, task.views ? {
        F: "44200ff9-9-" + i0,
        G: common_vendor.p({
          type: "eye",
          size: "14",
          color: "#999999"
        }),
        H: common_vendor.t(task.views)
      } : {}, {
        I: task.status === "pending"
      }, task.status === "pending" ? {
        J: common_vendor.o(($event) => $options.handleTakeTask(task), task.id)
      } : {}, {
        K: task.id,
        L: task.isTop ? 1 : "",
        M: common_vendor.o(($event) => $options.navigateToDetail(task.id), task.id)
      });
    }),
    j: common_vendor.p({
      type: "wallet",
      size: "12",
      color: "#00BFFF"
    }),
    k: $data.hasMore
  }, $data.hasMore ? {
    l: common_vendor.p({
      type: "spinner-cycle",
      size: "20",
      color: "#00BFFF"
    })
  } : {}, {
    m: common_vendor.o((...args) => $options.loadMoreTasks && $options.loadMoreTasks(...args)),
    n: $data.isRefreshing,
    o: common_vendor.o((...args) => $options.onRefresh && $options.onRefresh(...args))
  });
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../../.sourcemap/mp-weixin/pages/task/TaskHall/TaskHall.js.map
