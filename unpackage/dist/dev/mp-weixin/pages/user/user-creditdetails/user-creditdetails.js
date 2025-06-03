"use strict";
const common_vendor = require("../../../common/vendor.js");
const _sfc_main = {
  data() {
    return {
      creditScore: 108,
      // 示例分数，实际应从后端获取
      tabs: [
        { text: "加分明细", type: "gain" },
        { text: "扣分明细", type: "cost" }
      ],
      currentType: "gain",
      creditList: [
        // 加分明细
        { id: 1, type: "gain", icon: "checkmark", desc: "完成任务", time: "2024-06-01 10:00", amount: 6 },
        { id: 2, type: "gain", icon: "star", desc: "好评率提升", time: "2024-05-30 15:00", amount: 8 },
        { id: 3, type: "gain", icon: "chat", desc: "无违约月奖励", time: "2024-05-28 12:00", amount: 4 },
        // 扣分明细
        { id: 4, type: "cost", icon: "closeempty", desc: "违约一次", time: "2024-05-27 09:00", amount: -10 },
        { id: 5, type: "cost", icon: "closeempty", desc: "多次违约", time: "2024-05-25 18:00", amount: -20 }
      ]
    };
  },
  computed: {
    levelInfo() {
      const score = this.creditScore;
      if (score >= 120) {
        return { label: "钻石", icon: "medal-filled", color: "#4FC3F7" };
      } else if (score >= 100) {
        return { label: "黄金", icon: "medal-filled", color: "#FFD700" };
      } else if (score >= 80) {
        return { label: "白银", icon: "medal-filled", color: "#B0C4DE" };
      } else {
        return { label: "黑名单", icon: "closeempty", color: "#FF5252" };
      }
    },
    filteredList() {
      return this.creditList.filter((item) => item.type === this.currentType);
    }
  },
  methods: {
    switchTab(type) {
      this.currentType = type;
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
      type: $options.levelInfo.icon,
      size: "40",
      color: $options.levelInfo.color
    }),
    b: common_vendor.t($data.creditScore),
    c: common_vendor.t($options.levelInfo.label),
    d: common_vendor.f($data.tabs, (tab, k0, i0) => {
      return {
        a: common_vendor.t(tab.text),
        b: tab.type,
        c: common_vendor.n({
          active: $data.currentType === tab.type
        }),
        d: common_vendor.o(($event) => $options.switchTab(tab.type), tab.type)
      };
    }),
    e: common_vendor.f($options.filteredList, (item, k0, i0) => {
      return {
        a: "8921a442-1-" + i0,
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
    f: $options.filteredList.length === 0
  }, $options.filteredList.length === 0 ? {} : {}, {
    g: common_vendor.p({
      type: "medal-filled",
      size: "24",
      color: "#4FC3F7"
    }),
    h: common_vendor.p({
      type: "medal-filled",
      size: "24",
      color: "#FFD700"
    }),
    i: common_vendor.p({
      type: "medal-filled",
      size: "24",
      color: "#B0C4DE"
    }),
    j: common_vendor.p({
      type: "closeempty",
      size: "24",
      color: "#FF5252"
    })
  });
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../../.sourcemap/mp-weixin/pages/user/user-creditdetails/user-creditdetails.js.map
