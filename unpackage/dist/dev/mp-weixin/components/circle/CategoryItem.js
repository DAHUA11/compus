"use strict";
const common_vendor = require("../../common/vendor.js");
const _sfc_main = {
  name: "CategoryItem",
  props: {
    name: {
      type: String,
      required: true
    },
    icon: {
      type: String,
      required: true
    },
    isActive: {
      type: Boolean,
      default: false
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return {
    a: common_vendor.n($props.icon),
    b: common_vendor.t($props.name),
    c: $props.isActive ? 1 : "",
    d: common_vendor.o(($event) => _ctx.$emit("switch"))
  };
}
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render]]);
wx.createComponent(Component);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/components/circle/CategoryItem.js.map
