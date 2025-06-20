"use strict";
const common_vendor = require("../../common/vendor.js");
const common_assets = require("../../common/assets.js");
const _sfc_main = {
  data() {
    return {
      // 导航项
      navItems: [
        { icon: "folder", text: "已领任务", type: "received", color: "#409EFF" },
        { icon: "staff", text: "发布任务", type: "published", color: "#67C23A" },
        { icon: "calendar", text: "任务记录", type: "history", color: "#E6A23C" }
      ],
      // 任务数据
      taskData: [
        { label: "发布任务", value: "..." },
        { label: "完成任务", value: "..." },
        { label: "累计金额", value: "..." },
        { label: "任务评分", value: "..." }
      ],
      // 圈子贡献
      circleData: [
        { label: "发帖数", value: "..." },
        { label: "评论数", value: "..." },
        { label: "获赞数", value: "..." },
        { label: "我的点赞", value: "..." }
      ],
      // 活动数据
      activityData: [
        { label: "发布活动", value: "..." },
        { label: "参与活动", value: "..." }
      ],
      // 登录状态相关
      isLoggedIn: false,
      userInfo: {}
    };
  },
  methods: {
    // 检查登录状态
    checkLoginStatus() {
      const token = common_vendor.index.getStorageSync("uni_id_token");
      this.isLoggedIn = !!token;
    },
    // 跳转到登录页面
    goToLogin() {
      common_vendor.index.navigateTo({
        url: "/uni_modules/uni-id-pages/pages/login/login-withoutpwd"
      });
    },
    // 跳转到个人信息编辑页面
    goedituserinfo() {
      common_vendor.index.navigateTo({
        url: "/uni_modules/uni-id-pages/pages/userinfo/userinfo"
      });
    },
    // 跳转到任务中心页面
    goToUserTask(type) {
      common_vendor.index.navigateTo({
        url: `/pages/user/user-task/user-task?type=${type}`
      });
    },
    // 跳转到积分详情页面
    gopointsdetails() {
      common_vendor.index.navigateTo({
        url: "/pages/user/user-pointsdetails/user-pointsdetails"
      });
    },
    // 跳转到信用等级页面
    gocreditdetails() {
      common_vendor.index.navigateTo({
        url: "/pages/user/user-creditdetails/user-creditdetails"
      });
    },
    // 跳转到圈子贡献页面
    goToUserQuanzi() {
      if (!this.isLoggedIn)
        return;
      common_vendor.index.navigateTo({
        url: "/pages/user/user-quanzi/user-quanzi"
      });
    },
    goToUserActivity() {
      if (!this.isLoggedIn) {
        this.goToLogin();
        return;
      }
      common_vendor.index.navigateTo({
        url: "/pages/user/user-activity/user-activity"
      });
    },
    async getActivityStats() {
      common_vendor.index.__f__("log", "at pages/user/user.vue:208", "开始获取活动数据...");
      if (!this.userInfo || !this.userInfo._id) {
        common_vendor.index.__f__("log", "at pages/user/user.vue:210", "获取活动数据中止：无用户信息。");
        return;
      }
      const db = common_vendor.nr.database();
      const userId = this.userInfo._id;
      try {
        const [publishedRes, participatedRes] = await Promise.all([
          // 1. 发布活动数 (假设活动类型为 'activity')
          db.collection("add-content").where({ user_id: userId, content_type: "activity" }).count(),
          // 2. 参与活动数
          db.collection("activity_participants").where({ user_id: userId }).count()
        ]);
        const publishedCount = publishedRes.result ? publishedRes.result.total : 0;
        const participatedCount = participatedRes.result ? participatedRes.result.total : 0;
        common_vendor.index.__f__("log", "at pages/user/user.vue:227", `活动数据: 发布=${publishedCount}, 参与=${participatedCount}`);
        this.activityData = [
          { label: "发布活动", value: publishedCount },
          { label: "参与活动", value: participatedCount }
        ];
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/user/user.vue:235", "获取活动数据失败：", error);
        this.activityData = [
          { label: "发布活动", value: "N/A" },
          { label: "参与活动", value: "N/A" }
        ];
      }
    },
    async getCircleStats() {
      common_vendor.index.__f__("log", "at pages/user/user.vue:244", "开始获取圈子贡献数据...");
      if (!this.userInfo || !this.userInfo._id) {
        common_vendor.index.__f__("log", "at pages/user/user.vue:246", "获取圈子贡献数据中止：无用户信息。");
        return;
      }
      const db = common_vendor.nr.database();
      const userId = this.userInfo._id;
      try {
        const [postsCountRes, commentsCountRes, userLikesCountRes, receivedLikesRes] = await Promise.all([
          // 1. 发帖数
          db.collection("add-content").where({ user_id: userId, status: "published", content_type: "post" }).count(),
          // 2. 评论数
          db.collection("user-comment").where(`user_id == "${userId}"`).count(),
          // 3. 我的点赞数
          db.collection("user-likes").where({ user_id: userId }).count(),
          // 4. 获赞数
          db.collection("add-content").where({ user_id: userId, status: "published" }).get()
        ]);
        const postsCount = postsCountRes.result ? postsCountRes.result.total : 0;
        const commentsCount = commentsCountRes.result ? commentsCountRes.result.total : 0;
        const userLikesCount = userLikesCountRes.result ? userLikesCountRes.result.total : 0;
        let receivedLikesCount = 0;
        if (receivedLikesRes.result && receivedLikesRes.result.data) {
          receivedLikesCount = receivedLikesRes.result.data.reduce((sum, post) => sum + (post.like_count || 0), 0);
        }
        common_vendor.index.__f__("log", "at pages/user/user.vue:273", `圈子数据: 发帖=${postsCount}, 评论=${commentsCount}, 获赞=${receivedLikesCount}, 点赞=${userLikesCount}`);
        this.circleData = [
          { label: "发帖数", value: postsCount },
          { label: "评论数", value: commentsCount },
          { label: "获赞数", value: receivedLikesCount },
          { label: "我的点赞", value: userLikesCount }
        ];
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/user/user.vue:283", "获取圈子贡献数据失败：", error);
        this.circleData = [
          { label: "发帖数", value: "N/A" },
          { label: "评论数", value: "N/A" },
          { label: "获赞数", value: "N/A" },
          { label: "我的点赞", value: "N/A" }
        ];
      }
    },
    // 获取用户信息
    getUserInfo() {
      const info = common_vendor.index.getStorageSync("uni-id-pages-userInfo");
      this.userInfo = info && info._id ? {
        ...info,
        score: 0,
        // 初始化为0，等待计算
        creditLevel: info.creditLevel || "A级"
      } : {};
      if (this.isLoggedIn && this.userInfo._id) {
        this.getUserScore();
        this.getCircleStats();
        this.getActivityStats();
      }
    },
    // 获取用户积分明细并计算总积分
    async getUserScore() {
      try {
        const db = common_vendor.nr.database();
        const scoreCollection = db.collection("user-score");
        if (!this.userInfo._id) {
          this.userInfo.score = 0;
          return;
        }
        const { result } = await scoreCollection.where({ user_id: this.userInfo._id }).get();
        if (!result || !result.data || !Array.isArray(result.data)) {
          this.userInfo.score = 0;
          return;
        }
        const scoreRecords = result.data;
        const totalScore = scoreRecords.reduce((sum, record) => {
          const score = Number(record.score) || 0;
          return sum + score;
        }, 0);
        this.userInfo.score = totalScore;
        const storedUserInfo = common_vendor.index.getStorageSync("uni-id-pages-userInfo");
        if (storedUserInfo) {
          storedUserInfo.score = totalScore;
          common_vendor.index.setStorageSync("uni-id-pages-userInfo", storedUserInfo);
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/user/user.vue:347", "获取积分明细失败：", error);
        this.userInfo.score = 0;
        common_vendor.index.showToast({
          title: "获取积分失败",
          icon: "none"
        });
      }
    },
    goIndex() {
      common_vendor.index.navigateTo({ url: "/pages/index/index" });
    },
    gocircle() {
      common_vendor.index.navigateTo({ url: "/pages/circle/circle" });
    },
    gomessage() {
      common_vendor.index.navigateTo({ url: "/pages/message/MessageCenter/MessageCenter" });
    }
  },
  onShow() {
    this.checkLoginStatus();
    this.getUserInfo();
  }
};
if (!Array) {
  const _easycom_uni_icons2 = common_vendor.resolveComponent("uni-icons");
  _easycom_uni_icons2();
}
const _easycom_uni_icons = () => "../../uni_modules/uni-icons/components/uni-icons/uni-icons.js";
if (!Math) {
  _easycom_uni_icons();
}
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: common_assets._imports_0$1,
    b: $data.isLoggedIn
  }, $data.isLoggedIn ? {
    c: $data.userInfo.avatar_file && $data.userInfo.avatar_file.url ? $data.userInfo.avatar_file.url : "/static/default-avatar.png",
    d: common_vendor.o((...args) => $options.goedituserinfo && $options.goedituserinfo(...args)),
    e: common_vendor.t($data.userInfo.username || $data.userInfo.nickname || "未设置昵称"),
    f: common_vendor.o($options.goedituserinfo),
    g: common_vendor.p({
      type: "compose",
      size: "18",
      color: "#000000"
    }),
    h: common_vendor.t($data.userInfo.creditLevel || "A级"),
    i: common_vendor.o((...args) => $options.gocreditdetails && $options.gocreditdetails(...args)),
    j: common_vendor.t($data.userInfo.score || 0),
    k: common_vendor.o((...args) => $options.gopointsdetails && $options.gopointsdetails(...args))
  } : {
    l: common_assets._imports_1,
    m: common_vendor.o((...args) => $options.goToLogin && $options.goToLogin(...args))
  }, {
    n: $data.isLoggedIn
  }, $data.isLoggedIn ? {
    o: common_vendor.f($data.navItems, (item, index, i0) => {
      return {
        a: "239efa2b-1-" + i0,
        b: common_vendor.p({
          type: item.icon,
          size: "26",
          color: item.color
        }),
        c: common_vendor.t(item.text),
        d: index,
        e: common_vendor.o(($event) => $options.goToUserTask(item.type), index)
      };
    })
  } : {}, {
    p: common_vendor.f($data.taskData, (item, index, i0) => {
      return {
        a: common_vendor.t(item.value),
        b: common_vendor.t(item.label),
        c: index
      };
    }),
    q: common_vendor.p({
      type: "right",
      size: "14",
      color: "#C0C4CC"
    }),
    r: common_vendor.f($data.circleData, (item, index, i0) => {
      return {
        a: common_vendor.t(item.value),
        b: common_vendor.t(item.label),
        c: index
      };
    }),
    s: common_vendor.o((...args) => $options.goToUserQuanzi && $options.goToUserQuanzi(...args)),
    t: common_vendor.p({
      type: "right",
      size: "14",
      color: "#C0C4CC"
    }),
    v: common_vendor.f($data.activityData, (item, index, i0) => {
      return {
        a: common_vendor.t(item.value),
        b: common_vendor.t(item.label),
        c: index
      };
    }),
    w: common_vendor.o((...args) => $options.goToUserActivity && $options.goToUserActivity(...args)),
    x: !$data.isLoggedIn
  }, !$data.isLoggedIn ? {
    y: common_vendor.o((...args) => $options.goToLogin && $options.goToLogin(...args))
  } : {});
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/user/user.js.map
