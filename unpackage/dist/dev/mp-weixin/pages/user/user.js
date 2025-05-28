"use strict";
const common_vendor = require("../../common/vendor.js");
if (!Array) {
  const _easycom_uni_icons2 = common_vendor.resolveComponent("uni-icons");
  _easycom_uni_icons2();
}
const _easycom_uni_icons = () => "../../uni_modules/uni-icons/components/uni-icons/uni-icons.js";
if (!Math) {
  _easycom_uni_icons();
}
const _sfc_main = /* @__PURE__ */ common_vendor.defineComponent({
  __name: "user",
  setup(__props) {
    const avatarUrl = common_vendor.ref("https://readdy.ai/api/search-image?query=Professional%20avatar%20icon%20with%20minimalist%20design%2C%20simple%20circular%20shape%2C%20light%20blue%20accent%20color%2C%20clean%20white%20background%2C%20modern%20aesthetic%2C%20subtle%20gradient%2C%20high%20quality%20digital%20illustration%2C%20centered%20composition%2C%20professional%20look&width=200&height=200&seq=avatar001&orientation=squarish");
    const navItems = common_vendor.ref([
      { icon: "folder", text: "已领任务" },
      { icon: "staff", text: "发布任务" },
      { icon: "calendar", text: "任务记录" },
      { icon: "star", text: "收藏任务" }
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
    return (_ctx, _cache) => {
      return {
        a: common_vendor.p({
          type: "compose",
          size: "16",
          color: "#4080FF"
        }),
        b: avatarUrl.value,
        c: common_vendor.p({
          type: "compose",
          size: "16",
          color: "#FFFFFF"
        }),
        d: common_vendor.f(navItems.value, (item, index, i0) => {
          return {
            a: "239efa2b-2-" + i0,
            b: common_vendor.p({
              type: item.icon,
              size: "24",
              color: "#4080FF"
            }),
            c: common_vendor.t(item.text),
            d: index
          };
        }),
        e: common_vendor.f(taskData.value, (item, index, i0) => {
          return {
            a: common_vendor.t(item.value),
            b: common_vendor.t(item.label),
            c: index
          };
        }),
        f: common_vendor.f(circleData.value, (item, index, i0) => {
          return {
            a: common_vendor.t(item.value),
            b: common_vendor.t(item.label),
            c: index
          };
        }),
        g: common_vendor.f(featureItems.value, (item, index, i0) => {
          return {
            a: item.imageUrl,
            b: common_vendor.t(item.text),
            c: index
          };
        }),
        h: isDarkMode.value,
        i: common_vendor.o(toggleDarkMode),
        j: common_vendor.f(settingItems.value, (item, index, i0) => {
          return {
            a: common_vendor.t(item.text),
            b: "239efa2b-3-" + i0,
            c: index
          };
        }),
        k: common_vendor.p({
          type: "right",
          size: "16",
          color: "#C8C9CC"
        })
      };
    };
  }
});
wx.createPage(_sfc_main);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/user/user.js.map
