"use strict";
const common_vendor = require("../../../common/vendor.js");
const _sfc_main = {
  data() {
    return {
      id: null,
      activity: {
        id: 1,
        image: "/static/images/activity1.png",
        tag: "官方",
        tagClass: "official",
        title: "校园文化节",
        description: "<p>一年一度的校园文化节即将开幕，届时将有各种各样文化活动和表演，欢迎大家参与！</p><p>本次活动内容包括：</p><ul><li>开幕式文艺演出</li><li>各学院特色文化展示</li><li>才艺比赛</li><li>游园会</li><li>闭幕晚会</li></ul><p>活动期间会有精美礼品发放，欢迎全校师生积极参与！</p>",
        date: /* @__PURE__ */ new Date(),
        time: "19:00-21:30",
        location: "学校体育馆",
        avatars: ["/static/images/avatar1.png", "/static/images/avatar2.png", "/static/images/avatar3.png"],
        participants: 128,
        status: "upcoming"
        // upcoming, ongoing, ended
      },
      relatedActivities: [
        {
          id: 2,
          image: "/static/images/activity2.png",
          title: "创新创业大赛",
          date: new Date((/* @__PURE__ */ new Date()).getTime() + 5 * 24 * 60 * 60 * 1e3),
          // 5天后
          status: "upcoming"
        },
        {
          id: 3,
          image: "/static/images/activity1.png",
          title: "校园歌手大赛",
          date: new Date((/* @__PURE__ */ new Date()).getTime() + 2 * 24 * 60 * 60 * 1e3),
          // 2天后
          status: "upcoming"
        },
        {
          id: 4,
          image: "/static/images/activity2.png",
          title: "篮球联赛",
          date: new Date((/* @__PURE__ */ new Date()).getTime() + 7 * 24 * 60 * 60 * 1e3),
          // 7天后
          status: "upcoming"
        }
      ],
      statusBarHeight: 0,
      menuButtonHeight: 0,
      menuButtonLeft: 0,
      menuButtonRight: 0,
      headerHeight: 0,
      coverShow: false
    };
  },
  onLoad(options) {
    const sysInfo = common_vendor.index.getSystemInfoSync();
    const menuButton = common_vendor.index.getMenuButtonBoundingClientRect();
    this.statusBarHeight = sysInfo.statusBarHeight;
    this.menuButtonHeight = menuButton.height;
    this.menuButtonLeft = menuButton.left;
    this.menuButtonRight = menuButton.right;
    this.headerHeight = sysInfo.statusBarHeight + menuButton.height;
    if (options.id) {
      this.id = options.id;
      this.loadActivityDetail();
    }
  },
  mounted() {
    setTimeout(() => {
      this.coverShow = true;
    }, 100);
  },
  methods: {
    // 加载活动详情数据
    loadActivityDetail() {
    },
    // 返回上一页
    goBack() {
      common_vendor.index.navigateBack();
    },
    // 格式化日期
    formatDate(date) {
      const months = ["1月", "2月", "3月", "4月", "5月", "6月", "7月", "8月", "9月", "10月", "11月", "12月"];
      return `${months[date.getMonth()]}${date.getDate()}日`;
    },
    // 获取状态类名
    getStatusClass(item) {
      return item.status;
    },
    // 获取状态文本
    getStatusText(item) {
      const statusMap = {
        "upcoming": "即将开始",
        "ongoing": "进行中",
        "ended": "已结束"
      };
      return statusMap[item.status] || "未知状态";
    },
    // 是否可以参与
    canJoin(item) {
      return item.status === "upcoming" || item.status === "ongoing";
    },
    // 立即参与
    joinActivity() {
      common_vendor.index.showModal({
        title: "确认参与",
        content: "确定要参与该活动吗？",
        success: (res) => {
          if (res.confirm) {
            common_vendor.index.showToast({
              title: "报名成功",
              icon: "success"
            });
          }
        }
      });
    },
    // 分享活动
    shareActivity() {
      common_vendor.index.showToast({
        title: "分享功能开发中",
        icon: "none"
      });
    },
    // 查看主办方
    viewOrganizer() {
      common_vendor.index.showToast({
        title: "主办方信息页面开发中",
        icon: "none"
      });
    },
    // 查看相关活动
    viewRelatedActivity(item) {
      common_vendor.index.navigateTo({
        url: "/pages/circle/activity-detail?id=" + item.id
      });
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: $data.activity.image,
    b: common_vendor.t($options.getStatusText($data.activity)),
    c: common_vendor.n($options.getStatusClass($data.activity)),
    d: $data.coverShow ? 1 : "",
    e: common_vendor.t($data.activity.tag),
    f: common_vendor.n($data.activity.tagClass),
    g: common_vendor.t($data.activity.title),
    h: common_vendor.t($options.formatDate($data.activity.date)),
    i: common_vendor.t($data.activity.time),
    j: common_vendor.t($data.activity.location),
    k: common_vendor.t($data.activity.participants),
    l: $data.activity.description || "暂无详细描述",
    m: $data.activity.avatars && $data.activity.avatars.length > 0
  }, $data.activity.avatars && $data.activity.avatars.length > 0 ? common_vendor.e({
    n: common_vendor.f($data.activity.avatars, (avatar, index, i0) => {
      return {
        a: index,
        b: avatar
      };
    }),
    o: $data.activity.participants > $data.activity.avatars.length
  }, $data.activity.participants > $data.activity.avatars.length ? {
    p: common_vendor.t($data.activity.participants - $data.activity.avatars.length)
  } : {}) : {}, {
    q: common_vendor.f($data.relatedActivities, (item, index, i0) => {
      return {
        a: item.image,
        b: common_vendor.t(item.title),
        c: common_vendor.t($options.formatDate(item.date)),
        d: index,
        e: common_vendor.o(($event) => $options.viewRelatedActivity(item), index)
      };
    }),
    r: common_vendor.o((...args) => $options.viewOrganizer && $options.viewOrganizer(...args)),
    s: $options.canJoin($data.activity)
  }, $options.canJoin($data.activity) ? {
    t: common_vendor.o((...args) => $options.joinActivity && $options.joinActivity(...args))
  } : {
    v: common_vendor.t($data.activity.status === "ended" ? "已结束" : "已参与")
  });
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../../.sourcemap/mp-weixin/pages/circle/activity-datail/activity-datail.js.map
