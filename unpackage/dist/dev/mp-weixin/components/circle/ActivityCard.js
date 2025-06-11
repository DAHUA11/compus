"use strict";
const common_vendor = require("../../common/vendor.js");
const _sfc_main = {
  name: "ActivityCard",
  props: {
    activity: {
      type: Object,
      required: true
    }
  },
  methods: {
    // 新增：过滤HTML标签的方法
    filterHtmlTags(htmlStr) {
      if (!htmlStr)
        return "";
      return htmlStr.replace(/<[^>]+>/g, "");
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return {
    a: $props.activity.image,
    b: common_vendor.t($props.activity.tag),
    c: common_vendor.n($props.activity.tagClass),
    d: common_vendor.t($props.activity.title),
    e: common_vendor.t($options.filterHtmlTags($props.activity.description)),
    f: common_vendor.t($props.activity.time),
    g: common_vendor.t($props.activity.location),
    h: common_vendor.f($props.activity.avatars.slice(0, 3), (avatar, idx, i0) => {
      return {
        a: idx,
        b: avatar
      };
    }),
    i: common_vendor.t($props.activity.participants),
    j: common_vendor.t($props.activity.hasJoined ? "已参与" : "立即参与"),
    k: $props.activity.hasJoined ? 1 : "",
    l: common_vendor.o(($event) => _ctx.$emit("join", $props.activity)),
    m: common_vendor.o(($event) => _ctx.$emit("view-detail", $props.activity))
  };
}
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render]]);
wx.createComponent(Component);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/components/circle/ActivityCard.js.map
