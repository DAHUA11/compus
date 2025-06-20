"use strict";
const common_vendor = require("../../../common/vendor.js");
const TaskCard = {
  props: ["task"],
  template: `
			<view class="task-card" @click="$emit('click')">
				<view class="task-card-header">
					<text class="task-title">{{ task.title }}</text>
					<view class="task-status" :class="statusClass">{{ statusText }}</view>
				</view>
				<view class="task-desc">{{ task.description || '暂无描述' }}</view>
				<view class="task-footer">
					<view class="task-reward">
						<uni-icons type="wallet" color="#f9ae3d" size="16"></uni-icons>
						<text>{{ task.reward || 0 }} 元</text>
					</view>
					<view class="task-time">
						<uni-icons type="calendar" color="#909399" size="16"></uni-icons>
						<text>{{ formatTime(task.create_time) }}</text>
					</view>
				</view>
			</view>
		`,
  computed: {
    statusText() {
      const map = { "pending": "待接单", "in_progress": "进行中", "completed": "已完成", "cancelled": "已取消" };
      return map[this.task.status] || "未知";
    },
    statusClass() {
      return `status-${this.task.status}`;
    }
  },
  methods: {
    formatTime(timestamp) {
      if (!timestamp)
        return "未知时间";
      const date = new Date(timestamp);
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      return `${month}-${day}`;
    }
  }
};
const TaskCardSkeleton = {
  template: `
			<view class="task-card skeleton">
				<view class="skeleton-line" style="width: 50%; height: 32rpx; margin-bottom: 24rpx;"></view>
				<view class="skeleton-line" style="width: 100%; height: 28rpx; margin-bottom: 20rpx;"></view>
				<view class="skeleton-line" style="width: 70%; height: 24rpx;"></view>
			</view>
		`
};
const _sfc_main = {
  components: { TaskCard, TaskCardSkeleton },
  data() {
    return {
      currentTabIndex: 0,
      tabs: [
        { text: "已领任务", type: "received", count: 0 },
        { text: "发布任务", type: "published", count: 0 },
        { text: "任务记录", type: "history", count: 0 }
      ],
      receivedTasks: [],
      publishedTasks: [],
      historyTasks: [],
      isLoading: true,
      userInfo: null
    };
  },
  onLoad(options) {
    const typeMap = { "received": 0, "published": 1, "history": 2 };
    if (options.type && typeMap[options.type] !== void 0) {
      this.currentTabIndex = typeMap[options.type];
    }
    this.loadAllData();
  },
  methods: {
    switchTab(index) {
      if (this.currentTabIndex !== index) {
        this.currentTabIndex = index;
      }
    },
    swiperChange(e) {
      this.currentTabIndex = e.detail.current;
    },
    async loadAllData() {
      this.isLoading = true;
      this.userInfo = common_vendor.index.getStorageSync("uni-id-pages-userInfo");
      if (!this.userInfo || !this.userInfo._id) {
        common_vendor.index.showToast({ title: "请先登录", icon: "none" });
        setTimeout(() => common_vendor.index.navigateBack(), 1500);
        this.isLoading = false;
        return;
      }
      try {
        await Promise.all([
          this.fetchReceivedTasks(),
          this.fetchPublishedTasks(),
          this.fetchHistoryTasks()
        ]);
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/user/user-task/user-task.vue:181", "加载任务数据失败: ", error);
        common_vendor.index.showToast({ title: "数据加载失败", icon: "none" });
      } finally {
        this.isLoading = false;
      }
    },
    async fetchReceivedTasks() {
      const db = common_vendor.nr.database();
      const where = { receiver_id: this.userInfo._id };
      const { result: { total } } = await db.collection("uni-tasks").where(where).count();
      this.$set(this.tabs[0], "count", total);
      const { result: { data } } = await db.collection("uni-tasks").where(where).orderBy("create_time", "desc").get();
      this.receivedTasks = data;
    },
    async fetchPublishedTasks() {
      const db = common_vendor.nr.database();
      const where = { user_id: this.userInfo._id };
      const { result: { total } } = await db.collection("uni-tasks").where(where).count();
      this.$set(this.tabs[1], "count", total);
      const { result: { data } } = await db.collection("uni-tasks").where(where).orderBy("create_time", "desc").get();
      this.publishedTasks = data;
    },
    async fetchHistoryTasks() {
      const db = common_vendor.nr.database();
      const where = db.command.or([
        { user_id: this.userInfo._id },
        { receiver_id: this.userInfo._id }
      ]).and({
        status: db.command.in(["completed", "cancelled"])
      });
      const { result: { total } } = await db.collection("uni-tasks").where(where).count();
      this.$set(this.tabs[2], "count", total);
      const { result: { data } } = await db.collection("uni-tasks").where(where).orderBy("create_time", "desc").get();
      this.historyTasks = data;
    },
    goToTaskDetail(taskId) {
      common_vendor.index.navigateTo({
        url: `/pages/task/TaskDetail/TaskDetail?id=${taskId}`
      });
    }
  }
};
if (!Array) {
  const _component_TaskCard = common_vendor.resolveComponent("TaskCard");
  const _easycom_uni_icons2 = common_vendor.resolveComponent("uni-icons");
  const _component_TaskCardSkeleton = common_vendor.resolveComponent("TaskCardSkeleton");
  (_component_TaskCard + _easycom_uni_icons2 + _component_TaskCardSkeleton)();
}
const _easycom_uni_icons = () => "../../../uni_modules/uni-icons/components/uni-icons/uni-icons.js";
if (!Math) {
  _easycom_uni_icons();
}
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: common_vendor.f($data.tabs, (tab, index, i0) => {
      return {
        a: common_vendor.t(tab.text),
        b: common_vendor.t(tab.count),
        c: index,
        d: $data.currentTabIndex === index ? 1 : "",
        e: common_vendor.o(($event) => $options.switchTab(index), index)
      };
    }),
    b: !$data.isLoading
  }, !$data.isLoading ? common_vendor.e({
    c: $data.receivedTasks.length > 0
  }, $data.receivedTasks.length > 0 ? {
    d: common_vendor.f($data.receivedTasks, (task, k0, i0) => {
      return {
        a: task._id,
        b: common_vendor.o(($event) => $options.goToTaskDetail(task._id), task._id),
        c: "7044654f-0-" + i0,
        d: common_vendor.p({
          task
        })
      };
    })
  } : {
    e: common_vendor.p({
      type: "folder-opened",
      size: "60",
      color: "#C8C9CC"
    })
  }) : {
    f: common_vendor.f(4, (i, k0, i0) => {
      return {
        a: i,
        b: "7044654f-2-" + i0
      };
    })
  }, {
    g: !$data.isLoading
  }, !$data.isLoading ? common_vendor.e({
    h: $data.publishedTasks.length > 0
  }, $data.publishedTasks.length > 0 ? {
    i: common_vendor.f($data.publishedTasks, (task, k0, i0) => {
      return {
        a: task._id,
        b: common_vendor.o(($event) => $options.goToTaskDetail(task._id), task._id),
        c: "7044654f-3-" + i0,
        d: common_vendor.p({
          task
        })
      };
    })
  } : {
    j: common_vendor.p({
      type: "paperplane",
      size: "60",
      color: "#C8C9CC"
    })
  }) : {
    k: common_vendor.f(4, (i, k0, i0) => {
      return {
        a: i,
        b: "7044654f-5-" + i0
      };
    })
  }, {
    l: !$data.isLoading
  }, !$data.isLoading ? common_vendor.e({
    m: $data.historyTasks.length > 0
  }, $data.historyTasks.length > 0 ? {
    n: common_vendor.f($data.historyTasks, (task, k0, i0) => {
      return {
        a: task._id,
        b: common_vendor.o(($event) => $options.goToTaskDetail(task._id), task._id),
        c: "7044654f-6-" + i0,
        d: common_vendor.p({
          task
        })
      };
    })
  } : {
    o: common_vendor.p({
      type: "calendar",
      size: "60",
      color: "#C8C9CC"
    })
  }) : {
    p: common_vendor.f(4, (i, k0, i0) => {
      return {
        a: i,
        b: "7044654f-8-" + i0
      };
    })
  }, {
    q: $data.currentTabIndex,
    r: common_vendor.o((...args) => $options.swiperChange && $options.swiperChange(...args))
  });
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../../.sourcemap/mp-weixin/pages/user/user-task/user-task.js.map
