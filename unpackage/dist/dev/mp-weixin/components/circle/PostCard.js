"use strict";
const common_vendor = require("../../common/vendor.js");
const _sfc_main = {
  name: "PostCard",
  props: {
    post: {
      type: Object,
      required: true
    }
  },
  methods: {
    previewImage(images, index) {
      common_vendor.index.previewImage({
        urls: images,
        current: images[index]
      });
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: $props.post.avatar,
    b: common_vendor.t($props.post.name),
    c: common_vendor.t($props.post.time),
    d: common_vendor.t($props.post.tag),
    e: common_vendor.n($props.post.tagClass),
    f: common_vendor.t($props.post.content),
    g: $props.post.images && $props.post.images.length
  }, $props.post.images && $props.post.images.length ? {
    h: common_vendor.f($props.post.images, (img, idx, i0) => {
      return {
        a: idx,
        b: img,
        c: common_vendor.o(($event) => $options.previewImage($props.post.images, idx), idx)
      };
    })
  } : {}, {
    i: common_vendor.t($props.post.likes),
    j: $props.post.isLiked ? 1 : "",
    k: common_vendor.o(($event) => _ctx.$emit("like", $props.post)),
    l: common_vendor.t($props.post.comments),
    m: common_vendor.o(($event) => _ctx.$emit("comment", $props.post)),
    n: common_vendor.o(($event) => _ctx.$emit("share", $props.post)),
    o: common_vendor.o(($event) => _ctx.$emit("view-detail", $props.post))
  });
}
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render]]);
wx.createComponent(Component);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/components/circle/PostCard.js.map
