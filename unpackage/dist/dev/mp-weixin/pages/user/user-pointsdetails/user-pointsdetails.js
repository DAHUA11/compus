"use strict";
const common_vendor = require("../../../common/vendor.js");
const _sfc_main = {
  data() {
    return {
      totalScore: 0,
      tabs: [
        { text: "获取明细", type: "gain" },
        { text: "扣除明细", type: "cost" }
      ],
      currentType: "gain",
      scoreList: []
    };
  },
  computed: {
    filteredList() {
      return this.scoreList.filter((item) => item.type === this.currentType);
    }
  },
  methods: {
    // 获取积分记录
    async getScoreRecords() {
      try {
        const userInfo = common_vendor.index.getStorageSync("uni-id-pages-userInfo");
        if (!userInfo || !userInfo._id) {
          common_vendor.index.showToast({
            title: "请先登录",
            icon: "none"
          });
          return;
        }
        const db = common_vendor.nr.database();
        const { result } = await db.collection("user-score").where({
          user_id: userInfo._id
        }).orderBy("create_time", "desc").get();
        if (result && result.data) {
          this.scoreList = result.data.map((record) => {
            const isGain = record.score > 0;
            return {
              id: record._id,
              type: isGain ? "gain" : "cost",
              icon: this.getIconByType(record.type),
              desc: record.description || this.getDescriptionByType(record.type),
              time: this.formatTime(record.create_time),
              amount: record.score
            };
          });
          this.totalScore = this.scoreList.reduce((sum, record) => sum + record.amount, 0);
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/user/user-pointsdetails/user-pointsdetails.vue:91", "获取积分记录失败：", error);
        common_vendor.index.showToast({
          title: "获取积分记录失败",
          icon: "none"
        });
      }
    },
    // 根据类型获取图标
    getIconByType(type) {
      const iconMap = {
        "post_pin": "pushpin",
        "post_like": "heart",
        "comment_like": "chat",
        "daily_sign": "calendar",
        "task-review": "star",
        "activity_create": "plus",
        "activity_join": "person",
        "task-finished": "checkmark"
      };
      return iconMap[type] || "info";
    },
    // 根据类型获取描述
    getDescriptionByType(type) {
      const descMap = {
        "post_pin": "帖子置顶",
        "post_like": "帖子获赞",
        "comment_like": "评论获赞",
        "daily_sign": "每日签到",
        "task-review": "任务评价",
        "activity_create": "创建活动",
        "activity_join": "参与活动",
        "task-finished": "完成任务"
      };
      return descMap[type] || "积分变动";
    },
    // 格式化时间
    formatTime(timestamp) {
      const date = new Date(timestamp);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      const hour = String(date.getHours()).padStart(2, "0");
      const minute = String(date.getMinutes()).padStart(2, "0");
      return `${year}-${month}-${day} ${hour}:${minute}`;
    },
    switchTab(type) {
      this.currentType = type;
    },
    goToExchange() {
      common_vendor.index.showToast({ title: "跳转到兑换页面", icon: "none" });
    }
  },
  onLoad() {
    this.getScoreRecords();
  },
  onShow() {
    this.getScoreRecords();
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
