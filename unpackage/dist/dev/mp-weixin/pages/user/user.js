"use strict";
const common_vendor = require("../../common/vendor.js");
const common_assets = require("../../common/assets.js");
const _sfc_main = {
  setup() {
    const navItems = common_vendor.ref([
      { icon: "folder", text: "已领任务", type: "received" },
      { icon: "staff", text: "发布任务", type: "published" },
      { icon: "calendar", text: "任务记录", type: "history" }
      // { icon: 'star', text: '收藏任务' }
    ]);
    const taskData = common_vendor.ref([
      { label: "发布任务", value: "32" },
      { label: "完成任务", value: "48" },
      { label: "累计金额", value: "¥1280" },
      { label: "任务评分", value: "4.8" }
    ]);
    const circleData = common_vendor.ref([
      { label: "发帖数", value: "56" },
      { label: "评论数", value: "128" },
      { label: "获赞数", value: "320" },
      { label: "活跃度", value: "85%" }
    ]);
    const featureItems = common_vendor.ref([
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
    ]);
    const settingItems = common_vendor.ref([
      { text: "设置中心" },
      { text: "账号与安全" },
      { text: "通知设置" },
      { text: "隐私设置" },
      { text: "帮助反馈" }
    ]);
    const isDarkMode = common_vendor.ref(false);
    const toggleDarkMode = (e) => {
      isDarkMode.value = e.detail.value;
    };
    const isLoggedIn = common_vendor.ref(false);
    const userInfo = common_vendor.ref({});
    const defaultAvatarUrl = "/static/default-avatar.png";
    const checkLoginStatus = () => {
      const token = common_vendor.index.getStorageSync("uni_id_token");
      isLoggedIn.value = !!token;
    };
    const goToLogin = () => {
      common_vendor.index.navigateTo({
        url: "/uni_modules/uni-id-pages/pages/login/login-withoutpwd"
      });
    };
    const goedituserinfo = () => {
      common_vendor.index.navigateTo({
        url: "/uni_modules/uni-id-pages/pages/userinfo/userinfo"
      });
    };
    const goToUserTask = (type) => {
      common_vendor.index.navigateTo({
        url: `/pages/user/user-task/user-task?type=${type}`
      });
    };
    const gopointsdetails = () => {
      common_vendor.index.navigateTo({
        url: "/pages/user/user-pointsdetails/user-pointsdetails"
      });
    };
    const gocreditdetails = () => {
      common_vendor.index.navigateTo({
        url: "/pages/user/user-creditdetails/user-creditdetails"
      });
    };
    const getUserInfo = () => {
      const info = common_vendor.index.getStorageSync("uni-id-pages-userInfo");
      userInfo.value = info && info._id ? {
        ...info,
        score: info.score || 2580,
        // mock数据
        creditLevel: info.creditLevel || "A级"
        // mock数据
      } : {};
    };
    common_vendor.onMounted(() => {
      checkLoginStatus();
      getUserInfo();
    });
    common_vendor.index.onShow(() => {
      getUserInfo();
    });
    if (common_vendor.index.$on) {
      common_vendor.index.$on("refreshUserInfo", getUserInfo);
    }
    return {
      navItems,
      taskData,
      circleData,
      featureItems,
      settingItems,
      isDarkMode,
      toggleDarkMode,
      isLoggedIn,
      userInfo,
      defaultAvatarUrl,
      goToLogin,
      goedituserinfo,
      goToUserTask,
      gopointsdetails,
      gocreditdetails
    };
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
    a: $setup.isLoggedIn
  }, $setup.isLoggedIn ? {
    b: common_vendor.t($setup.userInfo.username || $setup.userInfo.nickname || "未设置昵称"),
    c: common_vendor.o($setup.goedituserinfo),
    d: common_vendor.p({
      type: "compose",
      size: "16",
      color: "#4080FF"
    }),
    e: common_vendor.t($setup.userInfo.score || 0),
    f: common_vendor.o((...args) => $setup.gopointsdetails && $setup.gopointsdetails(...args)),
    g: ($setup.userInfo.score || 0) / 3e3 * 100 + "%",
    h: common_vendor.t($setup.userInfo.creditLevel || "A级"),
    i: common_vendor.o((...args) => $setup.gocreditdetails && $setup.gocreditdetails(...args)),
    j: $setup.userInfo.avatar_file && $setup.userInfo.avatar_file.url ? $setup.userInfo.avatar_file.url : $setup.defaultAvatarUrl,
    k: common_vendor.p({
      type: "compose",
      size: "18",
      color: "#4080FF"
    }),
    l: common_vendor.o((...args) => $setup.goedituserinfo && $setup.goedituserinfo(...args))
  } : {
    m: common_assets._imports_0$1,
    n: common_vendor.o((...args) => $setup.goToLogin && $setup.goToLogin(...args))
  }, {
    o: $setup.isLoggedIn
  }, $setup.isLoggedIn ? {
    p: common_vendor.f($setup.navItems, (item, index, i0) => {
      return {
        a: "239efa2b-2-" + i0,
        b: common_vendor.p({
          type: item.icon,
          size: "24",
          color: "#4080FF"
        }),
        c: common_vendor.t(item.text),
        d: index,
        e: common_vendor.o(($event) => $setup.goToUserTask(item.type), index)
      };
    })
  } : {}, {
    q: common_vendor.f($setup.taskData, (item, index, i0) => {
      return {
        a: common_vendor.t(item.value),
        b: common_vendor.t(item.label),
        c: index
      };
    }),
    r: common_vendor.f($setup.circleData, (item, index, i0) => {
      return {
        a: common_vendor.t(item.value),
        b: common_vendor.t(item.label),
        c: index
      };
    }),
    s: common_vendor.f($setup.settingItems, (item, index, i0) => {
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
