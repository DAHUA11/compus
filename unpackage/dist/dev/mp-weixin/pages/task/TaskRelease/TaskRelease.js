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
        },
        {
          name: "其他",
          type: "other",
          description: "其他你想要发布的任何任务",
          icon: "more-filled",
          color: "#8E8E93"
        }
      ]
    };
  },
  methods: {
    handleQuickTask(type) {
      this.handleSelectTask(type);
    },
    handleSelectTask(type) {
      this.selectedTask = type;
      const taskMap = {
        "sell": "/pages/task/TaskRelease/OutTask/OutTask",
        "buy": "/pages/task/TaskRelease/PurchaseTask/PurchaseTask",
        "express": "/pages/task/TaskRelease/DeliveryTask/DeliveryTask",
        "takeout": "/pages/task/TaskRelease/TakeoutTask/TakeoutTask",
        "book": "/pages/task/TaskRelease/OutTask/OutTask",
        "other": "/pages/task/TaskRelease/QuickRelease/QuickRelease"
      };
      const targetPath = taskMap[type];
      if (targetPath) {
        common_vendor.index.navigateTo({
          url: targetPath,
          success: () => {
            common_vendor.index.__f__("log", "at pages/task/TaskRelease/TaskRelease.vue:115", "跳转成功:", type);
          },
          fail: (err) => {
            common_vendor.index.__f__("error", "at pages/task/TaskRelease/TaskRelease.vue:118", "跳转失败:", err);
            common_vendor.index.showToast({
              title: "页面跳转失败",
              icon: "none"
            });
          }
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
