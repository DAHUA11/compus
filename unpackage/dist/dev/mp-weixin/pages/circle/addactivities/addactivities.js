"use strict";
const common_vendor = require("../../../common/vendor.js");
const _sfc_main = {
  data() {
    return {
      cover: "",
      isHot: true,
      title: "",
      desc: "",
      typeOptions: ["官方", "社团", "学术", "体育", "娱乐", "其他"],
      typeIndex: -1,
      timeRange: [
        ["05/01", "05/02", "05/03", "05/04", "05/05", "05/06", "05/07"],
        ["10:00", "14:00", "18:00", "20:00"]
      ],
      timeText: "",
      place: "",
      tagOptions: ["户外", "运动", "娱乐", "交友", "学习", "比赛", "官方", "自发"],
      selectedTags: []
    };
  },
  computed: {
    canPublish() {
      return this.cover && this.title.trim() && this.desc.trim() && this.typeIndex !== -1 && this.timeText && this.place.trim();
    }
  },
  methods: {
    chooseCover() {
      common_vendor.index.chooseImage({
        count: 1,
        sizeType: ["compressed"],
        sourceType: ["album", "camera"],
        success: (res) => {
          this.cover = res.tempFilePaths[0];
        }
      });
    },
    onTypeChange(e) {
      this.typeIndex = e.detail.value;
    },
    onTimeChange(e) {
      const [dateIdx, timeIdx] = e.detail.value;
      this.timeText = `${this.timeRange[0][dateIdx]} ${this.timeRange[1][timeIdx]}`;
    },
    toggleTag(tag) {
      const idx = this.selectedTags.indexOf(tag);
      if (idx > -1) {
        this.selectedTags.splice(idx, 1);
      } else {
        this.selectedTags.push(tag);
      }
    },
    publishActivity() {
      if (!this.canPublish)
        return;
      common_vendor.index.showToast({ title: "发布成功", icon: "success" });
      setTimeout(() => {
        common_vendor.index.navigateBack();
      }, 800);
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: $data.cover
  }, $data.cover ? {
    b: $data.cover
  } : {}, {
    c: common_vendor.o((...args) => $options.chooseCover && $options.chooseCover(...args)),
    d: $data.isHot
  }, $data.isHot ? {} : {}, {
    e: $data.title,
    f: common_vendor.o(($event) => $data.title = $event.detail.value),
    g: $data.desc,
    h: common_vendor.o(($event) => $data.desc = $event.detail.value),
    i: common_vendor.t($data.typeOptions[$data.typeIndex] || "请选择"),
    j: $data.typeOptions,
    k: common_vendor.o((...args) => $options.onTypeChange && $options.onTypeChange(...args)),
    l: common_vendor.t($data.timeText || "请选择"),
    m: $data.timeRange,
    n: common_vendor.o((...args) => $options.onTimeChange && $options.onTimeChange(...args)),
    o: $data.place,
    p: common_vendor.o(($event) => $data.place = $event.detail.value),
    q: common_vendor.f($data.tagOptions, (tag, idx, i0) => {
      return {
        a: common_vendor.t(tag),
        b: idx,
        c: $data.selectedTags.includes(tag) ? 1 : "",
        d: common_vendor.o(($event) => $options.toggleTag(tag), idx)
      };
    }),
    r: !$options.canPublish ? 1 : "",
    s: common_vendor.o(($event) => $options.canPublish ? $options.publishActivity() : null)
  });
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../../.sourcemap/mp-weixin/pages/circle/addactivities/addactivities.js.map
