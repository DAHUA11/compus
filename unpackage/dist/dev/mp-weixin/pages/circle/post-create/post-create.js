"use strict";
const common_vendor = require("../../../common/vendor.js");
const _sfc_main = {
  data() {
    return {
      tags: ["讨论", "失物招领", "表白", "吐槽", "问答", "其他"],
      selectedTag: "",
      content: "",
      images: []
    };
  },
  computed: {
    canPublish() {
      return this.content.trim();
    }
  },
  methods: {
    selectTag(tag) {
      this.selectedTag = tag;
    },
    onInput(e) {
      this.content = e.detail.value || this.content;
    },
    chooseImage() {
      common_vendor.index.chooseImage({
        count: 9 - this.images.length,
        sizeType: ["compressed"],
        sourceType: ["album", "camera"],
        success: (res) => {
          this.images = this.images.concat(res.tempFilePaths);
        }
      });
    },
    removeImage(idx) {
      this.images.splice(idx, 1);
    },
    publishPost() {
      if (!this.canPublish)
        return;
      common_vendor.index.showLoading({
        title: "发布中..."
      });
      const uploadTasks = this.images.map((filePath) => {
        return new Promise((resolve, reject) => {
          common_vendor.er.uploadFile({
            filePath,
            cloudPath: `posts/${Date.now()}-${Math.random().toString(36).slice(-6)}.${filePath.split(".").pop()}`,
            success: (res) => resolve(res.fileID),
            fail: (err) => reject(err)
          });
        });
      });
      Promise.all(uploadTasks).then((fileIDs) => {
        const userInfo = common_vendor.index.getStorageSync("uni-id-pages-userInfo");
        const userId = userInfo && userInfo._id ? userInfo._id : "";
        if (!userId) {
          common_vendor.index.hideLoading();
          common_vendor.index.showToast({ title: "请先登录", icon: "none" });
          return Promise.reject(new Error("请先登录"));
        }
        return common_vendor.er.callFunction({
          name: "add-content",
          data: {
            content_type: "post",
            category: this.selectedTag,
            content: this.content,
            user_id: userId,
            files: fileIDs
          }
        });
      }).then((res) => {
        if (res && res.result && res.result.code === 200) {
          common_vendor.index.hideLoading();
          common_vendor.index.showToast({ title: "发布成功", icon: "success" });
          setTimeout(() => {
            common_vendor.index.navigateBack();
          }, 800);
        } else {
          throw new Error(res.result.msg);
        }
      }).catch((err) => {
        common_vendor.index.hideLoading();
        if (err && err.message !== "请先登录") {
          common_vendor.index.showToast({ title: err.message || "发布失败", icon: "none" });
        }
      });
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: common_vendor.f($data.tags, (tag, idx, i0) => {
      return {
        a: common_vendor.t(tag),
        b: idx,
        c: $data.selectedTag === tag ? 1 : "",
        d: common_vendor.o(($event) => $options.selectTag(tag), idx)
      };
    }),
    b: common_vendor.o([($event) => $data.content = $event.detail.value, (...args) => $options.onInput && $options.onInput(...args)]),
    c: $data.content,
    d: common_vendor.t($data.content.length),
    e: common_vendor.f($data.images, (img, idx, i0) => {
      return {
        a: img,
        b: common_vendor.o(($event) => $options.removeImage(idx), idx),
        c: idx
      };
    }),
    f: $data.images.length < 9
  }, $data.images.length < 9 ? {
    g: common_vendor.o((...args) => $options.chooseImage && $options.chooseImage(...args))
  } : {}, {
    h: !$options.canPublish ? 1 : "",
    i: common_vendor.o(($event) => $options.canPublish ? $options.publishPost() : null)
  });
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../../.sourcemap/mp-weixin/pages/circle/post-create/post-create.js.map
