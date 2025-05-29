"use strict";
const common_vendor = require("../../../common/vendor.js");
const _sfc_main = {
  data() {
    return {
      tabs: [
        { text: "已领任务", type: "received" },
        { text: "发布任务", type: "published" },
        { text: "任务记录", type: "history" }
      ],
      currentType: "received",
      taskList: []
    };
  },
  computed: {},
  onLoad(options) {
    if (options.type) {
      this.currentType = options.type;
    }
    this.loadTasks();
  },
  methods: {
    switchTab(type) {
      this.currentType = type;
      this.loadTasks();
    },
    loadTasks() {
      if (this.currentType === "received") {
        this.taskList = [
          { id: 1, icon: "folder", title: "跑腿帮买早餐", desc: "帮忙买一份豆浆油条", time: "2024-06-01 08:00", status: "进行中" },
          { id: 2, icon: "folder", title: "快递代取", desc: "取快递到宿舍楼下", time: "2024-05-30 15:00", status: "已完成" }
        ];
      } else if (this.currentType === "published") {
        this.taskList = [
          { id: 3, icon: "staff", title: "图书馆占座", desc: "帮忙占个座位", time: "2024-05-28 09:00", status: "已完成" }
        ];
      } else if (this.currentType === "history") {
        this.taskList = [
          { id: 4, icon: "calendar", title: "校园跑腿", desc: "帮忙送文件", time: "2024-05-20 10:00", status: "已完成" }
        ];
      } else {
        this.taskList = [];
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
  return common_vendor.e({
    a: common_vendor.f($data.tabs, (tab, k0, i0) => {
      return {
        a: common_vendor.t(tab.text),
        b: tab.type,
        c: common_vendor.n({
          active: $data.currentType === tab.type
        }),
        d: common_vendor.o(($event) => $options.switchTab(tab.type), tab.type)
      };
    }),
    b: common_vendor.f($data.taskList, (task, k0, i0) => {
      return common_vendor.e({
        a: "7044654f-0-" + i0,
        b: common_vendor.p({
          type: task.icon,
          size: "20",
          color: "#4080FF"
        }),
        c: common_vendor.t(task.title),
        d: common_vendor.t(task.desc),
        e: common_vendor.t(task.time),
        f: task.status
      }, task.status ? {
        g: common_vendor.t(task.status)
      } : {}, {
        h: task.id
      });
    }),
    c: $data.taskList.length === 0
  }, $data.taskList.length === 0 ? {} : {});
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../../.sourcemap/mp-weixin/pages/user/user-task/user-task.js.map
