"use strict";
const common_vendor = require("../../../common/vendor.js");
const _sfc_main = {
  data() {
    return {
      totalScore: 2580,
      tabs: [
        { text: "获取明细", type: "gain" },
        { text: "扣除明细", type: "cost" }
      ],
      currentType: "gain",
      scoreList: [
        // 获取明细
        { id: 1, type: "gain", icon: "checkmark", desc: "完成任务", time: "2024-06-01 10:00", amount: 50 },
        { id: 2, type: "gain", icon: "chat", desc: "发布优质帖子", time: "2024-05-30 15:00", amount: 30 },
        { id: 3, type: "gain", icon: "star", desc: "获得好评", time: "2024-05-28 12:00", amount: 20 },
        // 扣除明细
        { id: 4, type: "cost", icon: "gift", desc: "兑换头像框", time: "2024-05-27 09:00", amount: -100 },
        { id: 5, type: "cost", icon: "vip", desc: "兑换会员特权", time: "2024-05-25 18:00", amount: -200 },
        { id: 6, type: "cost", icon: "pushpin", desc: "帖子置顶", time: "2024-05-22 14:00", amount: -50 }
      ]
    };
  },
  computed: {
    filteredList() {
      return this.scoreList.filter((item) => item.type === this.currentType);
    }
  },
  methods: {
    switchTab(type) {
      this.currentType = type;
    },
    goToExchange() {
      common_vendor.index.showToast({ title: "跳转到兑换页面", icon: "none" });
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
    a: common_vendor.t($data.totalScore),
    b: common_vendor.o((...args) => $options.goToExchange && $options.goToExchange(...args)),
    c: common_vendor.f($data.tabs, (tab, k0, i0) => {
      return {
        a: common_vendor.t(tab.text),
        b: tab.type,
        c: common_vendor.n({
          active: $data.currentType === tab.type
        }),
        d: common_vendor.o(($event) => $options.switchTab(tab.type), tab.type)
      };
    }),
    d: common_vendor.f($options.filteredList, (item, k0, i0) => {
      return {
        a: "0fb9fbc2-0-" + i0,
        b: common_vendor.p({
          type: item.icon,
          size: "20",
          color: item.amount > 0 ? "#4CAF50" : "#FF5252"
        }),
        c: common_vendor.t(item.desc),
        d: common_vendor.t(item.time),
        e: common_vendor.t(item.amount > 0 ? "+" : ""),
        f: common_vendor.t(item.amount),
        g: common_vendor.n(item.amount > 0 ? "plus" : "minus"),
        h: item.id
      };
    }),
    e: $options.filteredList.length === 0
  }, $options.filteredList.length === 0 ? {} : {});
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../../.sourcemap/mp-weixin/pages/user/user-pointsdetails/user-pointsdetails.js.map
