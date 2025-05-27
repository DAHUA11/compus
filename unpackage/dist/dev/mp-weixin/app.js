"use strict";
Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
const common_vendor = require("./common/vendor.js");
if (!Math) {
  "./pages/circle/circle.js";
  "./pages/index/index.js";
  "./pages/user/user.js";
  "./pages/circle/activities/activities.js";
  "./pages/circle/activity-datail/activity-datail.js";
  "./pages/circle/pinned-datail/pinned-datail.js";
  "./pages/circle/post-datail/post-datail.js";
}
const _sfc_main = {
  onLaunch: function() {
    common_vendor.index.__f__("log", "at App.vue:5", "App Launch");
    common_vendor.index.preloadPage({
      url: "pages/circle/activity-detail"
    });
  },
  onShow: function() {
    common_vendor.index.__f__("log", "at App.vue:15", "App Show");
  },
  onHide: function() {
    common_vendor.index.__f__("log", "at App.vue:18", "App Hide");
  }
};
function createApp() {
  const app = common_vendor.createSSRApp(_sfc_main);
  return {
    app
  };
}
createApp().app.mount("#app");
exports.createApp = createApp;
//# sourceMappingURL=../.sourcemap/mp-weixin/app.js.map
