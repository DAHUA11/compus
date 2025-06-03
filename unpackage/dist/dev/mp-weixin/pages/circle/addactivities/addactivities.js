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
      common_vendor.index.showLoading({
        title: "发布中..."
      });
      const uploadCover = new Promise((resolve, reject) => {
        if (!this.cover) {
          resolve([]);
          return;
        }
        common_vendor.er.uploadFile({
          filePath: this.cover,
          cloudPath: `activities/${Date.now()}-${Math.random().toString(36).slice(-6)}.${this.cover.split(".").pop()}`,
          success: (res) => resolve([res.fileID]),
          fail: (err) => reject(err)
        });
      });
      const [date, time] = this.timeText.split(" ");
      const [month, day] = date.split("/");
      const [hour, minute] = time.split(":");
      const activityTime = new Date(2024, parseInt(month) - 1, parseInt(day), parseInt(hour), parseInt(minute)).getTime();
      uploadCover.then((fileIDs) => {
        const userInfo = common_vendor.index.getStorageSync("uni-id-pages-userInfo");
        common_vendor.index.__f__("log", "at pages/circle/addactivities/addactivities.vue:160", "活动页面 userInfo:", userInfo);
        const userId = userInfo && userInfo._id ? userInfo._id : "";
        if (!userId) {
          common_vendor.index.hideLoading();
          common_vendor.index.showToast({ title: "请先登录", icon: "none" });
          return Promise.reject(new Error("请先登录"));
        }
        return common_vendor.er.callFunction({
          name: "add-content",
          data: {
            content_type: "activity",
            title: this.title,
            category: this.typeOptions[this.typeIndex],
            content: this.desc,
            files: fileIDs,
            activity_time: activityTime,
            location: this.place,
            max_attendees: 0,
            user_id: userId,
            tags: this.selectedTags
          }
        });
      }).then((res) => {
        if (res && res.result && res.result.code === 200) {
          common_vendor.index.hideLoading();
          common_vendor.index.showToast({
            title: "发布成功",
            icon: "success"
          });
          setTimeout(() => {
            common_vendor.index.navigateBack();
          }, 800);
        } else {
          throw new Error(res.result.msg);
        }
      }).catch((err) => {
        common_vendor.index.hideLoading();
        if (err && err.message !== "请先登录") {
          common_vendor.index.showToast({
            title: err.message || "发布失败",
            icon: "none"
          });
        }
      });
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
