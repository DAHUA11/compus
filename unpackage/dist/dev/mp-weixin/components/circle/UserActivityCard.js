"use strict";
const common_vendor = require("../../common/vendor.js");
const _sfc_main = {
  name: "UserActivityCard",
  props: {
    activity: {
      type: Object,
      default: () => ({})
    }
  },
  computed: {
    activityStatus() {
      if (!this.activity || !this.activity.activity_time) {
        return { text: "未知", class: "status-unknown" };
      }
      const now = Date.now();
      if (now > this.activity.activity_time) {
        return { text: "已结束", class: "status-ended" };
      }
      if ((this.activity.attendee_count || 0) >= (this.activity.max_attendees || Infinity)) {
        return { text: "已满员", class: "status-full" };
      }
      return { text: "进行中", class: "status-ongoing" };
    }
  },
  methods: {
    formattedTimeAgo(timestamp) {
      if (!timestamp)
        return "";
      const now = /* @__PURE__ */ new Date();
      const past = new Date(timestamp);
      const diffInSeconds = Math.floor((now - past) / 1e3);
      const minute = 60;
      const hour = minute * 60;
      const day = hour * 24;
      if (diffInSeconds < minute) {
        return "刚刚";
      } else if (diffInSeconds < hour) {
        return `${Math.floor(diffInSeconds / minute)}分钟前`;
      } else if (diffInSeconds < day) {
        return `${Math.floor(diffInSeconds / hour)}小时前`;
      } else {
        return `${Math.floor(diffInSeconds / day)}天前`;
      }
    },
    stripHtml(htmlStr) {
      if (!htmlStr)
        return "";
      return htmlStr.replace(/<[^>]+>/g, "");
    },
    formattedDate(timestamp) {
      if (!timestamp)
        return "时间待定";
      const date = new Date(timestamp);
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      const hours = String(date.getHours()).padStart(2, "0");
      const minutes = String(date.getMinutes()).padStart(2, "0");
      return `${month}-${day} ${hours}:${minutes}`;
    },
    goToDetail() {
      if (this.activity && this.activity._id) {
        this.$emit("click");
      }
    }
  }
};
if (!Array) {
  const _easycom_uni_icons2 = common_vendor.resolveComponent("uni-icons");
  _easycom_uni_icons2();
}
const _easycom_uni_icons = () => "../../uni_modules/uni-icons/components/uni-icons/uni-icons.js";
if (!Math) {
  _easycom_uni_icons();
}
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: !$props.activity || !$props.activity._id
  }, !$props.activity || !$props.activity._id ? {} : common_vendor.e({
    b: $props.activity.user_info && $props.activity.user_info.avatar_file && $props.activity.user_info.avatar_file.url ? $props.activity.user_info.avatar_file.url : "/static/default-avatar.png",
    c: common_vendor.t($props.activity.user_info && $props.activity.user_info.nickname || "匿名用户"),
    d: common_vendor.t($options.formattedTimeAgo($props.activity.create_time)),
    e: common_vendor.t($options.activityStatus.text),
    f: common_vendor.n($options.activityStatus.class),
    g: common_vendor.t($props.activity.title || "活动标题未设置"),
    h: $props.activity.content
  }, $props.activity.content ? {
    i: common_vendor.t($options.stripHtml($props.activity.content).slice(0, 50)),
    j: common_vendor.t($options.stripHtml($props.activity.content).length > 50 ? "..." : "")
  } : {}, {
    k: common_vendor.p({
      type: "location",
      size: "14",
      color: "#8A8A8A"
    }),
    l: common_vendor.t($props.activity.location || "地点待定"),
    m: common_vendor.p({
      type: "calendar",
      size: "14",
      color: "#8A8A8A"
    }),
    n: common_vendor.t($options.formattedDate($props.activity.activity_time)),
    o: common_vendor.p({
      type: "person",
      size: "14",
      color: "#8A8A8A"
    }),
    p: common_vendor.t($props.activity.attendee_count || 0),
    q: common_vendor.t($props.activity.max_attendees || "不限")
  }), {
    r: common_vendor.o((...args) => $options.goToDetail && $options.goToDetail(...args))
  });
}
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-6a122881"]]);
wx.createComponent(Component);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/components/circle/UserActivityCard.js.map
