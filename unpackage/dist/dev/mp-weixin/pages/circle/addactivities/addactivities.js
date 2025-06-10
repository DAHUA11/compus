"use strict";
const common_vendor = require("../../../common/vendor.js");
const _sfc_main = {
  data() {
    const generateDateRange = () => {
      const dates = [];
      const currentDate = /* @__PURE__ */ new Date();
      for (let i = 0; i < 30; i++) {
        const date = new Date(currentDate);
        date.setDate(currentDate.getDate() + i);
        const month = (date.getMonth() + 1).toString().padStart(2, "0");
        const day = date.getDate().toString().padStart(2, "0");
        dates.push(`${month}/${day}`);
      }
      return dates;
    };
    return {
      cover: "",
      isHot: true,
      title: "",
      typeOptions: ["官方", "社团", "学术", "体育", "娱乐", "其他"],
      typeIndex: -1,
      timeRange: [
        generateDateRange(),
        // 动态生成的日期数组
        ["10:00", "14:00", "18:00", "20:00"]
        // 固定时段选项
      ],
      timeText: "",
      place: "",
      tagOptions: ["户外", "运动", "娱乐", "交友", "学习", "比赛", "官方", "自发"],
      selectedTags: [],
      maxAttendees: "",
      // 新增：最大参与人数
      contentHtml: "",
      // 存储富文本内容
      currentWordCount: 0
      // 当前输入字数
    };
  },
  computed: {
    canPublish() {
      return this.cover && this.title.trim() && this.contentHtml.trim() && // 使用contentHtml替代desc
      this.typeIndex !== -1 && this.timeText && this.place.trim() && Number(this.maxAttendees) >= 1;
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
    // 编辑器输入事件
    onEditorInput(e) {
      this.contentHtml = e.detail.html;
      const pureText = e.detail.text.replace(/<[^>]+>/g, "");
      this.currentWordCount = pureText.length;
    },
    publishActivity() {
      if (!this.canPublish)
        return;
      common_vendor.index.showLoading({ title: "发布中..." });
      const uploadCover = new Promise((resolve, reject) => {
        if (!this.cover) {
          resolve([]);
          return;
        }
        common_vendor.nr.uploadFile({
          filePath: this.cover,
          cloudPath: `activities/${Date.now()}-${Math.random().toString(36).slice(-6)}.${this.cover.split(".").pop()}`,
          success: (res) => resolve([res.fileID]),
          fail: (err) => reject(err)
        });
      });
      const [dateStr, timeStr] = this.timeText.split(" ");
      const [monthStr, dayStr] = dateStr.split("/");
      const [hour, minute] = timeStr.split(":");
      const currentDate = /* @__PURE__ */ new Date();
      const currentYear = currentDate.getFullYear();
      const selectedMonth = parseInt(monthStr) - 1;
      const selectedDay = parseInt(dayStr);
      const activityDate = new Date(currentYear, selectedMonth, selectedDay, parseInt(hour), parseInt(minute));
      if (activityDate.getMonth() !== selectedMonth) {
        activityDate.setFullYear(currentYear + 1);
      }
      const activityTime = activityDate.getTime();
      uploadCover.then((fileIDs) => {
        const userInfo = common_vendor.index.getStorageSync("uni-id-pages-userInfo");
        common_vendor.index.__f__("log", "at pages/circle/addactivities/addactivities.vue:222", "活动页面 userInfo:", userInfo);
        const userId = userInfo && userInfo._id ? userInfo._id : "";
        if (!userId) {
          common_vendor.index.hideLoading();
          common_vendor.index.showToast({ title: "请先登录", icon: "none" });
          return Promise.reject(new Error("请先登录"));
        }
        return common_vendor.nr.callFunction({
          name: "add-content",
          data: {
            content_type: "activity",
            title: this.title,
            category: this.typeOptions[this.typeIndex],
            content: this.contentHtml,
            // 使用contentHtml替代desc
            files: fileIDs,
            activity_time: activityTime,
            location: this.place,
            max_attendees: Number(this.maxAttendees),
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
    g: $data.contentHtml,
    h: common_vendor.o((...args) => _ctx.onEditorReady && _ctx.onEditorReady(...args)),
    i: common_vendor.o((...args) => $options.onEditorInput && $options.onEditorInput(...args)),
    j: common_vendor.t($data.currentWordCount),
    k: common_vendor.t($data.typeOptions[$data.typeIndex] || "请选择"),
    l: $data.typeOptions,
    m: common_vendor.o((...args) => $options.onTypeChange && $options.onTypeChange(...args)),
    n: common_vendor.t($data.timeText || "请选择"),
    o: $data.timeRange,
    p: common_vendor.o((...args) => $options.onTimeChange && $options.onTimeChange(...args)),
    q: $data.place,
    r: common_vendor.o(($event) => $data.place = $event.detail.value),
    s: $data.maxAttendees,
    t: common_vendor.o(common_vendor.m(($event) => $data.maxAttendees = $event.detail.value, {
      number: true
    })),
    v: common_vendor.f($data.tagOptions, (tag, idx, i0) => {
      return {
        a: common_vendor.t(tag),
        b: idx,
        c: $data.selectedTags.includes(tag) ? 1 : "",
        d: common_vendor.o(($event) => $options.toggleTag(tag), idx)
      };
    }),
    w: !$options.canPublish ? 1 : "",
    x: common_vendor.o(($event) => $options.canPublish ? $options.publishActivity() : null)
  });
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../../.sourcemap/mp-weixin/pages/circle/addactivities/addactivities.js.map
