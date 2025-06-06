"use strict";
const common_vendor = require("../../common/vendor.js");
const _sfc_main = {
  name: "ActivityCard",
  props: {
    activity: {
      type: Object,
      required: true
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return {
    a: $props.activity.image,
    b: common_vendor.t($props.activity.tag),
    c: common_vendor.n($props.activity.tagClass),
    d: common_vendor.t($props.activity.title),
    e: common_vendor.t($props.activity.description),
    f: common_vendor.t($props.activity.time),
    g: common_vendor.t($props.activity.location),
    h: common_vendor.f($props.activity.avatars.slice(0, 3), (avatar, idx, i0) => {
      return {
        a: idx,
        b: avatar
      };
    }),
    i: common_vendor.t($props.activity.participants),
    j: common_vendor.o(($event) => _ctx.$emit("join", $props.activity)),
    k: common_vendor.o(($event) => _ctx.$emit("view-detail", $props.activity))
  };
}
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render]]);
wx.createComponent(Component);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/components/circle/ActivityCard.js.map
