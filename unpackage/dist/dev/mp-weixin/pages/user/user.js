"use strict";
const common_vendor = require("../../common/vendor.js");
const common_assets = require("../../common/assets.js");
const _sfc_main = {
  data() {
    return {
      // 导航项
      navItems: [
        { icon: "folder", text: "已领任务", type: "received" },
        { icon: "staff", text: "发布任务", type: "published" },
        { icon: "calendar", text: "任务记录", type: "history" }
      ],
      // 任务数据
      taskData: [
        { label: "发布任务", value: "32" },
        { label: "完成任务", value: "48" },
        { label: "累计金额", value: "¥1280" },
        { label: "任务评分", value: "4.8" }
      ],
      // 圈子贡献
      circleData: [
        { label: "发帖数", value: "56" },
        { label: "评论数", value: "128" },
        { label: "获赞数", value: "320" },
        { label: "活跃度", value: "85%" }
      ],
      // 功能项
      featureItems: [
        {
          text: "积分明细",
          imageUrl: "https://readdy.ai/api/search-image?query=icon%2C%203D%20cartoon%2C%20Points%20or%20coins%20icon%2C%20subject%20fills%2080%20percent%20of%20frame%2C%20vibrant%20colors%20with%20soft%20gradients%2C%20minimalist%20design%2C%20smooth%20rounded%20shapes%2C%20subtle%20shading%2C%20no%20outlines%2C%20centered%20composition%2C%20isolated%20on%20white%20background%2C%20playful%20and%20friendly%20aesthetic%2C%20isometric%20perspective%2C%20high%20detail%20quality%2C%20clean%20and%20modern%20look%2C%20single%20object%20focus&width=100&height=100&seq=feature001&orientation=squarish"
        },
        {
          text: "数据同步",
          imageUrl: "https://readdy.ai/api/search-image?query=icon%2C%203D%20cartoon%2C%20Cloud%20sync%20icon%2C%20subject%20fills%2080%20percent%20of%20frame%2C%20vibrant%20colors%20with%20soft%20gradients%2C%20minimalist%20design%2C%20smooth%20rounded%20shapes%2C%20subtle%20shading%2C%20no%20outlines%2C%20centered%20composition%2C%20isolated%20on%20white%20background%2C%20playful%20and%20friendly%20aesthetic%2C%20isometric%20perspective%2C%20high%20detail%20quality%2C%20clean%20and%20modern%20look%2C%20single%20object%20focus&width=100&height=100&seq=feature002&orientation=squarish"
        },
        {
          text: "任务管理",
          imageUrl: "https://readdy.ai/api/search-image?query=icon%2C%203D%20cartoon%2C%20Task%20management%20checklist%2C%20subject%20fills%2080%20percent%20of%20frame%2C%20vibrant%20colors%20with%20soft%20gradients%2C%20minimalist%20design%2C%20smooth%20rounded%20shapes%2C%20subtle%20shading%2C%20no%20outlines%2C%20centered%20composition%2C%20isolated%20on%20white%20background%2C%20playful%20and%20friendly%20aesthetic%2C%20isometric%20perspective%2C%20high%20detail%20quality%2C%20clean%20and%20modern%20look%2C%20single%20object%20focus&width=100&height=100&seq=feature003&orientation=squarish"
        },
        {
          text: "圈子中心",
          imageUrl: "https://readdy.ai/api/search-image?query=icon%2C%203D%20cartoon%2C%20Community%20or%20social%20network%20icon%2C%20subject%20fills%2080%20percent%20of%20frame%2C%20vibrant%20colors%20with%20soft%20gradients%2C%20minimalist%20design%2C%20smooth%20rounded%20shapes%2C%20subtle%20shading%2C%20no%20outlines%2C%20centered%20composition%2C%20isolated%20on%20white%20background%2C%20playful%20and%20friendly%20aesthetic%2C%20isometric%20perspective%2C%20high%20detail%20quality%2C%20clean%20and%20modern%20look%2C%20single%20object%20focus&width=100&height=100&seq=feature004&orientation=squarish"
        }
      ],
      // 设置项
      settingItems: [
        { text: "设置中心" },
        { text: "账号与安全" },
        { text: "通知设置" },
        { text: "隐私设置" },
        { text: "帮助反馈" }
      ],
      // 登录状态相关
      isLoggedIn: false,
      userInfo: {}
      // defaultAvatarUrl: '/static/default-avatar.png'
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
      }
    },
    // 获取用户积分明细并计算总积分
    async getUserScore() {
      try {
        const db = common_vendor.nr.database();
        const scoreCollection = db.collection("user-score");
        if (!this.userInfo._id) {
          common_vendor.index.__f__("log", "at pages/user/user.vue:206", "用户未登录或ID不存在");
          this.userInfo.score = 0;
          return;
        }
        common_vendor.index.__f__("log", "at pages/user/user.vue:211", "正在查询用户积分，用户ID:", this.userInfo._id);
        const { result } = await scoreCollection.where({
          user_id: this.userInfo._id
        }).orderBy("create_time", "desc").get();
        common_vendor.index.__f__("log", "at pages/user/user.vue:221", "查询结果:", result);
        if (!result || !result.data || !Array.isArray(result.data)) {
          common_vendor.index.__f__("log", "at pages/user/user.vue:225", "未找到积分记录或数据格式不正确");
          this.userInfo.score = 0;
          return;
        }
        const scoreRecords = result.data;
        common_vendor.index.__f__("log", "at pages/user/user.vue:231", "积分记录:", scoreRecords);
        const totalScore = scoreRecords.reduce((sum, record) => {
          const score = Number(record.score) || 0;
          common_vendor.index.__f__("log", "at pages/user/user.vue:237", "当前记录积分:", score, "记录类型:", record.type);
          return sum + score;
        }, 0);
        common_vendor.index.__f__("log", "at pages/user/user.vue:241", "计算得到的总积分:", totalScore);
        this.userInfo.score = totalScore;
        const storedUserInfo = common_vendor.index.getStorageSync("uni-id-pages-userInfo");
        if (storedUserInfo) {
          storedUserInfo.score = totalScore;
          common_vendor.index.setStorageSync("uni-id-pages-userInfo", storedUserInfo);
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/user/user.vue:254", "获取积分明细失败：", error);
        this.userInfo.score = 0;
        common_vendor.index.showToast({
          title: "获取积分失败",
          icon: "none"
        });
      }
    }
  },
  // 生命周期钩子
  mounted() {
    this.checkLoginStatus();
    this.getUserInfo();
  },
  // 页面显示时触发（uni-app页面生命周期）
  onShow() {
    this.getUserInfo();
  },
  // 组件卸载时取消事件监听（避免内存泄漏）
  beforeDestroy() {
    if (common_vendor.index.$off) {
      common_vendor.index.$off("refreshUserInfo", this.getUserInfo);
    }
  },
  // 组件创建完成时监听全局事件
  created() {
    if (common_vendor.index.$on) {
      common_vendor.index.$on("refreshUserInfo", this.getUserInfo);
    }
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
    a: $data.isLoggedIn
  }, $data.isLoggedIn ? {
    b: common_vendor.t($data.userInfo.username || $data.userInfo.nickname || "未设置昵称"),
    c: common_vendor.o($options.goedituserinfo),
    d: common_vendor.p({
      type: "compose",
      size: "16",
      color: "#4080FF"
    }),
    e: common_vendor.t($data.userInfo.score || 0),
    f: common_vendor.o((...args) => $options.gopointsdetails && $options.gopointsdetails(...args)),
    g: ($data.userInfo.score || 0) / 3e3 * 100 + "%",
    h: common_vendor.t($data.userInfo.creditLevel || "A级"),
    i: common_vendor.o((...args) => $options.gocreditdetails && $options.gocreditdetails(...args)),
    j: $data.userInfo.avatar_file && $data.userInfo.avatar_file.url ? $data.userInfo.avatar_file.url : _ctx.defaultAvatarUrl,
    k: common_vendor.p({
      type: "compose",
      size: "18",
      color: "#4080FF"
    }),
    l: common_vendor.o((...args) => $options.goedituserinfo && $options.goedituserinfo(...args))
  } : {
    m: common_assets._imports_0$2,
    n: common_vendor.o((...args) => $options.goToLogin && $options.goToLogin(...args))
  }, {
    o: $data.isLoggedIn
  }, $data.isLoggedIn ? {
    p: common_vendor.f($data.navItems, (item, index, i0) => {
      return {
        a: "239efa2b-2-" + i0,
        b: common_vendor.p({
          type: item.icon,
          size: "24",
          color: "#4080FF"
        }),
        c: common_vendor.t(item.text),
        d: index,
        e: common_vendor.o(($event) => $options.goToUserTask(item.type), index)
      };
    })
  } : {}, {
    q: common_vendor.f($data.taskData, (item, index, i0) => {
      return {
        a: common_vendor.t(item.value),
        b: common_vendor.t(item.label),
        c: index
      };
    }),
    r: common_vendor.f($data.circleData, (item, index, i0) => {
      return {
        a: common_vendor.t(item.value),
        b: common_vendor.t(item.label),
        c: index
      };
    }),
    s: common_vendor.f($data.settingItems, (item, index, i0) => {
      return {
        a: common_vendor.t(item.text),
        b: "239efa2b-3-" + i0,
        c: index
      };
    }),
    t: common_vendor.p({
      type: "right",
      size: "16",
      color: "#C8C9CC"
    })
  });
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/user/user.js.map
