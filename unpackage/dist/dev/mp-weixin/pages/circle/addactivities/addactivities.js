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
      currentWordCount: 0,
      // 当前输入字数
      isEdit: false,
      // 是否为编辑状态
      editId: ""
      // 新增：编辑时的活动ID
    };
  },
  onLoad(options) {
    var _a;
    if (options.activity) {
      const activity = JSON.parse(decodeURIComponent(options.activity));
      this.isEdit = true;
      this.editId = activity._id;
      this.title = activity.title;
      this.contentHtml = activity.content;
      if (activity.activity_time) {
        this.timeText = `${this.formatDate(activity.activity_time).split(" ")[0]} ${this.formatTime(activity.activity_time)}`;
      }
      this.place = activity.location;
      this.maxAttendees = activity.max_attendees;
      this.selectedTags = Array.isArray(activity.tags) ? activity.tags : [];
      this.cover = ((_a = activity.files) == null ? void 0 : _a[0]) || "";
      this.typeIndex = this.typeOptions.findIndex((t) => t === activity.category);
    }
  },
  computed: {
    canPublish() {
      return this.isEdit || this.cover && this.title.trim() && this.contentHtml.trim() && this.typeIndex !== -1 && this.timeText && this.place.trim() && Number(this.maxAttendees) >= 1;
    }
  },
  methods: {
    // 时间格式化辅助方法（用于回显时间）
    formatDate(ts) {
      const date = new Date(ts);
      const month = (date.getMonth() + 1).toString().padStart(2, "0");
      const day = date.getDate().toString().padStart(2, "0");
      return `${month}/${day}`;
    },
    formatTime(ts) {
      const date = new Date(ts);
      const hours = date.getHours().toString().padStart(2, "0");
      const minutes = date.getMinutes().toString().padStart(2, "0");
      return `${hours}:${minutes}`;
    },
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
    onEditorReady() {
      common_vendor.index.createSelectorQuery().in(this).select("#editor").context((res) => {
        if (res && res.context && this.contentHtml) {
          common_vendor.index.__f__("log", "at pages/circle/addactivities/addactivities.vue:226", "小程序富文本内容回显", this.contentHtml);
          res.context.setContents({ html: this.contentHtml });
        }
      }).exec();
    },
    publishActivity() {
      if (!this.canPublish)
        return;
      common_vendor.index.showLoading({ title: this.isEdit ? "更新中..." : "发布中..." });
      const uploadCover = new Promise((resolve, reject) => {
        const isLocalFile = this.cover && !/^cloud:\/\//.test(this.cover) && !/^https?:\/\//.test(this.cover);
        if (!this.cover || !isLocalFile) {
          resolve([this.cover]);
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
        const userId = userInfo && userInfo._id ? userInfo._id : "";
        if (!userId) {
          common_vendor.index.hideLoading();
          common_vendor.index.showToast({ title: "请先登录", icon: "none" });
          return Promise.reject(new Error("请先登录"));
        }
        if (this.isEdit && this.editId) {
          return common_vendor.nr.callFunction({
            name: "update-content",
            data: {
              _id: this.editId,
              content_type: "activity",
              title: this.title,
              category: this.typeOptions[this.typeIndex],
              content: this.contentHtml,
              files: fileIDs,
              activity_time: activityTime,
              location: this.place,
              max_attendees: Number(this.maxAttendees),
              user_id: userId,
              tags: this.selectedTags
            }
          });
        } else {
          return common_vendor.nr.callFunction({
            name: "add-content",
            data: {
              content_type: "activity",
              title: this.title,
              category: this.typeOptions[this.typeIndex],
              content: this.contentHtml,
              files: fileIDs,
              activity_time: activityTime,
              location: this.place,
              max_attendees: Number(this.maxAttendees),
              user_id: userId,
              tags: this.selectedTags
            }
          });
        }
      }).then((res) => {
        common_vendor.index.hideLoading();
        if (res && res.result && res.result.code === 200) {
          common_vendor.index.showToast({
            title: this.isEdit ? "更新成功" : "发布成功",
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
            title: err.message || (this.isEdit ? "更新失败" : "发布失败"),
            icon: "none"
          });
        }
      });
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: $data.title,
    b: common_vendor.o(($event) => $data.title = $event.detail.value),
    c: $data.contentHtml,
    d: common_vendor.o((...args) => $options.onEditorReady && $options.onEditorReady(...args)),
    e: common_vendor.o((...args) => $options.onEditorInput && $options.onEditorInput(...args)),
    f: common_vendor.t($data.currentWordCount),
    g: $data.cover
  }, $data.cover ? {
    h: $data.cover
  } : {}, {
    i: common_vendor.o((...args) => $options.chooseCover && $options.chooseCover(...args)),
    j: common_vendor.t($data.typeOptions[$data.typeIndex] || "请选择"),
    k: $data.typeOptions,
    l: common_vendor.o((...args) => $options.onTypeChange && $options.onTypeChange(...args)),
    m: common_vendor.t($data.timeText || "请选择"),
    n: $data.timeRange,
    o: common_vendor.o((...args) => $options.onTimeChange && $options.onTimeChange(...args)),
    p: $data.place,
    q: common_vendor.o(($event) => $data.place = $event.detail.value),
    r: $data.maxAttendees,
    s: common_vendor.o(common_vendor.m(($event) => $data.maxAttendees = $event.detail.value, {
      number: true
    })),
    t: common_vendor.f($data.tagOptions, (tag, idx, i0) => {
      return {
        a: common_vendor.t(tag),
        b: idx,
        c: $data.selectedTags.includes(tag) ? 1 : "",
        d: common_vendor.o(($event) => $options.toggleTag(tag), idx)
      };
    }),
    v: !$options.canPublish ? 1 : "",
    w: common_vendor.o(($event) => $options.canPublish ? $options.publishActivity() : null)
  });
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../../.sourcemap/mp-weixin/pages/circle/addactivities/addactivities.js.map
