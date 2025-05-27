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
    iconImg: {
      type: String,
      default: ""
    },
    isActive: {
      type: Boolean,
      default: false
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: $props.iconImg
  }, $props.iconImg ? {
    b: $props.iconImg
  } : {
    c: common_vendor.n($props.icon)
  }, {
    d: common_vendor.t($props.name),
    e: $props.isActive ? 1 : "",
    f: common_vendor.o(($event) => _ctx.$emit("switch"))
  });
}
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render]]);
wx.createComponent(Component);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/components/circle/CategoryItem.js.map
