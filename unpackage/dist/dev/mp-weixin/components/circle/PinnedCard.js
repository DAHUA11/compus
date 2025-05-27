"use strict";
const common_vendor = require("../../common/vendor.js");
const _sfc_main = {
  name: "PinnedCard",
  props: {
    post: {
      type: Object,
      required: true
    },
    isPin: {
      type: Boolean,
      default: true
    },
    hasCustomActions: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      isLiked: false
    };
  },
  methods: {
    handleLike() {
      this.isLiked = !this.isLiked;
      if (this.isLiked) {
        this.post.likes++;
      } else {
        this.post.likes--;
      }
    },
    previewImage(images, index) {
      common_vendor.index.previewImage({
        urls: images,
        current: images[index]
      });
    },
    getTagClass(type) {
      const typeMap = {
        "官方": "official",
        "商家": "promotion",
        "活动": "hot"
      };
      return typeMap[type] || "official";
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: $props.isPin
  }, $props.isPin ? {} : {}, {
    b: $props.post.avatar,
    c: common_vendor.t($props.post.name),
    d: common_vendor.t($props.post.type),
    e: common_vendor.t($props.post.time),
    f: $props.isPin
  }, $props.isPin ? {} : {}, {
    g: common_vendor.t($props.post.type),
    h: common_vendor.n($options.getTagClass($props.post.type)),
    i: common_vendor.o(($event) => _ctx.$emit("view-detail", $props.post)),
    j: common_vendor.t($props.post.content),
    k: $props.post.images && $props.post.images.length
  }, $props.post.images && $props.post.images.length ? {
    l: common_vendor.f($props.post.images, (img, idx, i0) => {
      return {
        a: idx,
        b: img,
        c: common_vendor.o(($event) => $options.previewImage($props.post.images, idx), idx)
      };
    })
  } : {}, {
    m: $data.isLiked ? 1 : "",
    n: common_vendor.t($props.post.likes),
    o: common_vendor.o((...args) => $options.handleLike && $options.handleLike(...args)),
    p: common_vendor.t($props.post.comments),
    q: common_vendor.o(($event) => _ctx.$emit("view-detail", $props.post)),
    r: common_vendor.o(() => {
    }),
    s: common_vendor.o(($event) => _ctx.$emit("view-detail", $props.post))
  });
}
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render]]);
wx.createComponent(Component);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/components/circle/PinnedCard.js.map
