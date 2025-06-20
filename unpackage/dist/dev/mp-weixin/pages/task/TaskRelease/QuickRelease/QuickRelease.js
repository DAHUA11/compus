"use strict";
const common_vendor = require("../../../../common/vendor.js");
const _sfc_main = {
  data() {
    return {
      form: {
        title: "",
        reward: "",
        isUrgent: false
      },
      userInfo: null
    };
  },
  onShow() {
    let userInfo = common_vendor.index.getStorageSync("uni-id-pages-userInfo");
    common_vendor.index.__f__("log", "at pages/task/TaskRelease/QuickRelease/QuickRelease.vue:50", "--- Debugging onShow ---");
    common_vendor.index.__f__("log", "at pages/task/TaskRelease/QuickRelease/QuickRelease.vue:51", "1. Raw userInfo from storage:", userInfo);
    common_vendor.index.__f__("log", "at pages/task/TaskRelease/QuickRelease/QuickRelease.vue:52", "2. Type of raw userInfo:", typeof userInfo);
    if (typeof userInfo === "string") {
      try {
        userInfo = JSON.parse(userInfo);
        common_vendor.index.__f__("log", "at pages/task/TaskRelease/QuickRelease/QuickRelease.vue:57", "3. Parsed userInfo:", userInfo);
        common_vendor.index.__f__("log", "at pages/task/TaskRelease/QuickRelease/QuickRelease.vue:58", "4. Type of parsed userInfo:", typeof userInfo);
      } catch (e) {
        common_vendor.index.__f__("error", "at pages/task/TaskRelease/QuickRelease/QuickRelease.vue:60", "5. Error parsing userInfo:", e);
        userInfo = null;
      }
    }
    common_vendor.index.__f__("log", "at pages/task/TaskRelease/QuickRelease/QuickRelease.vue:65", "6. Final userInfo before check:", userInfo);
    if (userInfo && userInfo._id) {
      this.userInfo = {
        _id: userInfo._id,
        username: userInfo.username,
        nickname: userInfo.nickname || userInfo.username || "用户",
        avatar: userInfo.avatar_file && userInfo.avatar_file.url ? userInfo.avatar_file.url : userInfo.avatar || "/static/images/default_avatar.png"
      };
      common_vendor.index.__f__("log", "at pages/task/TaskRelease/QuickRelease/QuickRelease.vue:75", "11. User is logged in. ID:", this.userInfo._id, "Avatar:", this.userInfo.avatar);
    } else {
      common_vendor.index.__f__("log", "at pages/task/TaskRelease/QuickRelease/QuickRelease.vue:77", "10. Condition `!userInfo || !userInfo._id` is TRUE. Redirecting...");
      common_vendor.index.showToast({
        title: "请先登录",
        icon: "none"
      });
      setTimeout(() => {
        common_vendor.index.navigateTo({
          url: "/uni_modules/uni-id-pages/pages/login/login-withoutpwd"
        });
      }, 1500);
      return;
    }
    common_vendor.index.__f__("log", "at pages/task/TaskRelease/QuickRelease/QuickRelease.vue:89", "--- End Debugging onShow ---");
  },
  methods: {
    goBack() {
      common_vendor.index.navigateBack();
    },
    async submitTask() {
      if (!this.form.title) {
        common_vendor.index.showToast({ title: "请填写任务描述", icon: "none" });
        return;
      }
      if (!this.form.reward || Number(this.form.reward) <= 0) {
        common_vendor.index.showToast({ title: "请输入有效金额", icon: "none" });
        return;
      }
      const taskData = {
        type: "other",
        title: this.form.title,
        description: "",
        reward: Number(this.form.reward),
        status: "pending",
        publisher_id: this.userInfo._id,
        publisher_name: this.userInfo.nickname,
        publisher_avatar: this.userInfo.avatar,
        publish_time: /* @__PURE__ */ new Date(),
        is_urgent: this.form.isUrgent || false,
        tags: this.form.isUrgent ? ["urgent"] : []
      };
      common_vendor.index.__f__("log", "at pages/task/TaskRelease/QuickRelease/QuickRelease.vue:122", "[QuickRelease] 发布任务时，发布者头像信息:", taskData.publisher_avatar);
      try {
        common_vendor.index.showLoading({
          title: "发布中..."
        });
        const res = await common_vendor.nr.callFunction({
          name: "addTask",
          data: {
            taskData
          }
        });
        common_vendor.index.hideLoading();
        if (res.result.code === 200) {
          common_vendor.index.showToast({
            title: "发布成功",
            icon: "success"
          });
          setTimeout(() => {
            common_vendor.index.switchTab({
              url: "/pages/index/index"
            });
          }, 1500);
        } else {
          common_vendor.index.showToast({
            title: res.result.msg || "发布失败",
            icon: "none"
          });
        }
      } catch (e) {
        common_vendor.index.hideLoading();
        common_vendor.index.showToast({
          title: "发布失败，请重试",
          icon: "none"
        });
        common_vendor.index.__f__("error", "at pages/task/TaskRelease/QuickRelease/QuickRelease.vue:160", "发布任务失败：", e);
      }
    },
    getCurrentUser() {
      let userInfo = common_vendor.index.getStorageSync("uni-id-pages-userInfo");
      let parsedInfo = {};
      if (userInfo === "[object Object]") {
        common_vendor.index.__f__("warn", "at pages/task/TaskRelease/QuickRelease/QuickRelease.vue:168", "localStorage 'uni-id-pages-userInfo' contained the literal string '[object Object]'. Defaulting to anonymous user.");
        parsedInfo = {};
      } else if (typeof userInfo === "string") {
        try {
          parsedInfo = JSON.parse(userInfo);
        } catch (e) {
          common_vendor.index.__f__("error", "at pages/task/TaskRelease/QuickRelease/QuickRelease.vue:174", "Error parsing userInfo from localStorage as JSON:", e);
          parsedInfo = {};
        }
      } else if (typeof userInfo === "object" && userInfo !== null) {
        parsedInfo = userInfo;
      }
      if (typeof parsedInfo !== "object" || parsedInfo === null) {
        parsedInfo = {};
      }
      return {
        id: parsedInfo.uid || "anonymous",
        nickname: parsedInfo.nickname || parsedInfo.username || "匿名用户",
        avatar: parsedInfo.avatar_file && parsedInfo.avatar_file.url ? parsedInfo.avatar_file.url : "/static/images/avatar1.png"
      };
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return {
    a: $data.form.title,
    b: common_vendor.o(($event) => $data.form.title = $event.detail.value),
    c: $data.form.reward,
    d: common_vendor.o(($event) => $data.form.reward = $event.detail.value),
    e: $data.form.isUrgent,
    f: common_vendor.o(($event) => $data.form.isUrgent = $event.detail.value),
    g: common_vendor.o((...args) => $options.submitTask && $options.submitTask(...args))
  };
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-59f47cdf"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../../../.sourcemap/mp-weixin/pages/task/TaskRelease/QuickRelease/QuickRelease.js.map
