"use strict";
const common_vendor = require("../../common/vendor.js");
const _sfc_main = {
  name: "PinnedCard",
  props: {
    post: {
      type: Object,
      required: true,
      default: () => ({
        avatar: "/static/images/default-avatar.png",
        name: "匿名用户",
        type: "官方",
        time: "刚刚",
        content: "",
        images: [],
        likes: 0,
        comments: 0,
        isLiked: false,
        likeAnimate: false
      })
    },
    isPin: {
      type: Boolean,
      default: true
    },
    hasCustomActions: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      likeLoading: false
    };
  },
  computed: {
    isLiked() {
      return this.post.isLiked || false;
    }
  },
  async created() {
    await this.checkUserLikeStatus();
  },
  methods: {
    async checkUserLikeStatus() {
      const userInfo = common_vendor.index.getStorageSync("uni-id-pages-userInfo");
      if (!userInfo || !userInfo._id || !this.post._id)
        return;
      try {
        const likeRes = await common_vendor.nr.database().collection("user-likes").where({
          user_id: userInfo._id,
          post_id: this.post._id
        }).get();
        this.post.isLiked = likeRes.result.data.length > 0;
      } catch (e) {
        common_vendor.index.__f__("error", "at components/circle/PinnedCard.vue:101", "检查点赞状态失败:", e);
      }
    },
    async handleViewDetail() {
      try {
        await this.$nextTick();
        await new Promise((resolve, reject) => {
          common_vendor.index.navigateTo({
            url: `/pages/circle/pinned-datail/pinned-datail?id=${this.post._id}`,
            success: resolve,
            fail: (err) => {
              common_vendor.index.__f__("error", "at components/circle/PinnedCard.vue:115", "导航失败:", err);
              common_vendor.index.redirectTo({
                url: `/pages/circle/pinned-datail/pinned-datail?id=${this.post._id}`,
                success: resolve,
                fail: reject
              });
            }
          });
        });
      } catch (error) {
        common_vendor.index.__f__("error", "at components/circle/PinnedCard.vue:126", "页面跳转失败:", error);
        common_vendor.index.showToast({
          title: "页面跳转失败，请重试",
          icon: "none",
          duration: 2e3
        });
      }
    },
    async handleLike() {
      if (this.likeLoading)
        return;
      this.likeLoading = true;
      const userInfo = common_vendor.index.getStorageSync("uni-id-pages-userInfo");
      if (!userInfo || !userInfo._id) {
        common_vendor.index.showToast({ title: "请先登录", icon: "none" });
        this.likeLoading = false;
        return;
      }
      const userId = userInfo._id;
      const postId = this.post._id;
      try {
        this.post.likeAnimate = true;
        setTimeout(() => {
          this.post.likeAnimate = false;
        }, 500);
        const likeRes = await common_vendor.nr.database().collection("user-likes").where({
          user_id: userId,
          post_id: postId
        }).get();
        if (likeRes.result.data.length > 0) {
          const likeId = likeRes.result.data[0]._id;
          await common_vendor.nr.database().collection("user-likes").doc(likeId).remove();
          await common_vendor.nr.database().collection("add-content").doc(postId).update({
            like_count: this.post.likes - 1
          });
          this.post.isLiked = false;
          this.post.likes -= 1;
          common_vendor.index.showToast({ title: "已取消点赞", icon: "none" });
        } else {
          await common_vendor.nr.database().collection("user-likes").add({
            user_id: userId,
            post_id: postId,
            create_time: Date.now()
          });
          await common_vendor.nr.database().collection("add-content").doc(postId).update({
            like_count: this.post.likes + 1
          });
          this.post.isLiked = true;
          this.post.likes += 1;
          common_vendor.index.showToast({ title: "已点赞", icon: "none" });
        }
        this.$emit("post-updated", this.post);
      } catch (e) {
        common_vendor.index.__f__("error", "at components/circle/PinnedCard.vue:191", "点赞操作失败:", e);
        common_vendor.index.showToast({ title: "操作失败", icon: "none" });
      } finally {
        this.likeLoading = false;
      }
    },
    previewImage(images, index) {
      common_vendor.index.previewImage({
        urls: images,
        current: images[index]
      });
    },
    getTagClass(type) {
      const typeMap = {
        "官方": "official",
        "商家": "promotion",
        "活动": "hot"
      };
      return typeMap[type] || "official";
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: $props.isPin
  }, $props.isPin ? {} : {}, {
    b: $props.post.avatar || "/static/images/default-avatar.png",
    c: common_vendor.t($props.post.name || "匿名用户"),
    d: common_vendor.t($props.post.type || "官方"),
    e: common_vendor.t($props.post.time || "刚刚"),
    f: $props.isPin
  }, $props.isPin ? {} : {}, {
    g: common_vendor.t($props.post.type || "官方"),
    h: common_vendor.n($options.getTagClass($props.post.type)),
    i: common_vendor.o((...args) => $options.handleViewDetail && $options.handleViewDetail(...args)),
    j: common_vendor.t($props.post.content || ""),
    k: $props.post.images && $props.post.images.length
  }, $props.post.images && $props.post.images.length ? {
    l: common_vendor.f($props.post.images, (img, idx, i0) => {
      return {
        a: idx,
        b: img,
        c: common_vendor.o(($event) => $options.previewImage($props.post.images, idx), idx)
      };
    })
  } : {}, {
    m: $options.isLiked ? 1 : "",
    n: $props.post.likeAnimate ? 1 : "",
    o: common_vendor.t($props.post.likes || 0),
    p: $options.isLiked ? 1 : "",
    q: common_vendor.o((...args) => $options.handleLike && $options.handleLike(...args)),
    r: common_vendor.t($props.post.comments || 0),
    s: common_vendor.o((...args) => $options.handleViewDetail && $options.handleViewDetail(...args)),
    t: common_vendor.o(() => {
    }),
    v: common_vendor.o((...args) => $options.handleViewDetail && $options.handleViewDetail(...args))
  });
}
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render]]);
wx.createComponent(Component);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/components/circle/PinnedCard.js.map
