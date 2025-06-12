"use strict";
const common_vendor = require("../../common/vendor.js");
const _sfc_main = {
  name: "PostCard",
  props: {
    post: {
      type: Object,
      required: true
    }
  },
  computed: {
    isPostOwner() {
      var _a;
      const userId = (_a = common_vendor.index.getStorageSync("uni-id-pages-userInfo")) == null ? void 0 : _a._id;
      return userId && this.post.user_id === userId;
    }
  },
  methods: {
    previewImage(images, index) {
      common_vendor.index.previewImage({
        urls: images,
        current: images[index]
      });
    },
    // 点赞
    likePost(post, index) {
      if (post.likeLoading)
        return;
      post.likeLoading = true;
      const userId = common_vendor.index.getStorageSync("uni-id-pages-userInfo")._id;
      if (!userId) {
        common_vendor.index.showToast({ title: "请先登录", icon: "none" });
        post.likeLoading = false;
        return;
      }
      const originLiked = post.isLiked;
      const originLikes = post.likes;
      if (post.isLiked) {
        post.isLiked = false;
        post.likes -= 1;
        common_vendor.nr.database().collection("user-likes").where({
          user_id: userId,
          post_id: post._id
        }).get().then((res) => {
          if (res.result.data.length > 0) {
            const likeId = res.result.data[0]._id;
            Promise.all([
              // 删除点赞记录
              common_vendor.nr.database().collection("user-likes").doc(likeId).remove(),
              // 更新帖子点赞数
              common_vendor.nr.database().collection("add-content").doc(post._id).update({
                like_count: post.likes
              }),
              // 扣除作者积分
              common_vendor.nr.database().collection("user-score").add({
                user_id: post.user_id,
                score: -5,
                type: "post_like",
                description: "帖子被取消点赞",
                related_id: post._id,
                create_time: Date.now()
              })
            ]).then(() => {
              common_vendor.index.showToast({ title: "已取消点赞", icon: "none" });
              post.likeLoading = false;
            }).catch((err) => {
              common_vendor.index.__f__("error", "at components/circle/PostCard.vue:129", "取消点赞失败:", err);
              post.isLiked = originLiked;
              post.likes = originLikes;
              post.likeLoading = false;
              common_vendor.index.showToast({ title: "操作失败", icon: "none" });
            });
          } else {
            post.likeLoading = false;
          }
        }).catch((err) => {
          common_vendor.index.__f__("error", "at components/circle/PostCard.vue:141", "查询点赞记录失败:", err);
          post.isLiked = originLiked;
          post.likes = originLikes;
          post.likeLoading = false;
          common_vendor.index.showToast({ title: "操作失败", icon: "none" });
        });
      } else {
        post.isLiked = true;
        post.likes += 1;
        Promise.all([
          // 添加点赞记录
          common_vendor.nr.database().collection("user-likes").add({
            user_id: userId,
            post_id: post._id,
            create_time: Date.now()
          }),
          // 更新帖子点赞数
          common_vendor.nr.database().collection("add-content").doc(post._id).update({
            like_count: post.likes
          }),
          // 给作者增加积分
          common_vendor.nr.database().collection("user-score").add({
            user_id: post.user_id,
            score: 5,
            type: "post_like",
            description: "帖子获赞",
            related_id: post._id,
            create_time: Date.now()
          })
        ]).then(() => {
          common_vendor.index.showToast({ title: "已点赞", icon: "none" });
          post.likeLoading = false;
        }).catch((err) => {
          common_vendor.index.__f__("error", "at components/circle/PostCard.vue:182", "点赞失败:", err);
          post.isLiked = originLiked;
          post.likes = originLikes;
          post.likeLoading = false;
          common_vendor.index.showToast({ title: "操作失败", icon: "none" });
        });
      }
    },
    showMoreActions() {
      common_vendor.index.showActionSheet({
        itemList: ["删除帖子", "置顶帖子"],
        success: (res) => {
          switch (res.tapIndex) {
            case 0:
              this.deletePost();
              break;
            case 1:
              this.pinPost();
              break;
          }
        }
      });
    },
    deletePost() {
      common_vendor.index.showModal({
        title: "确认删除",
        content: "确定要删除这条帖子吗？",
        success: (res) => {
          var _a;
          if (res.confirm) {
            common_vendor.index.showLoading({
              title: "删除中..."
            });
            const userId = (_a = common_vendor.index.getStorageSync("uni-id-pages-userInfo")) == null ? void 0 : _a._id;
            if (!userId) {
              common_vendor.index.hideLoading();
              common_vendor.index.showToast({ title: "请先登录", icon: "none" });
              return;
            }
            if (userId !== this.post.user_id) {
              common_vendor.index.hideLoading();
              common_vendor.index.showToast({ title: "无权删除此帖子", icon: "none" });
              return;
            }
            common_vendor.nr.database().collection("add-content").doc(this.post._id).remove().then(() => {
              common_vendor.index.hideLoading();
              common_vendor.index.showToast({ title: "删除成功", icon: "success" });
              this.$emit("post-deleted", this.post._id);
            }).catch((err) => {
              common_vendor.index.hideLoading();
              common_vendor.index.__f__("error", "at components/circle/PostCard.vue:244", "删除帖子失败:", err);
              common_vendor.index.showToast({
                title: err.message || "删除失败",
                icon: "none"
              });
            });
          }
        }
      });
    },
    pinPost() {
      if (this.post.content_type === "pinned") {
        common_vendor.index.showModal({
          title: "取消置顶",
          content: "确定要取消置顶吗？",
          success: (res) => {
            if (res.confirm) {
              this.updatePinStatus(false);
            }
          }
        });
        return;
      }
      common_vendor.index.showModal({
        title: "置顶帖子",
        content: "置顶需要消耗20积分，是否继续？",
        success: (res) => {
          var _a;
          if (res.confirm) {
            const userId = (_a = common_vendor.index.getStorageSync("uni-id-pages-userInfo")) == null ? void 0 : _a._id;
            if (!userId) {
              common_vendor.index.showToast({ title: "请先登录", icon: "none" });
              return;
            }
            common_vendor.index.showLoading({
              title: "处理中..."
            });
            common_vendor.nr.database().collection("user-score").where({
              user_id: userId
            }).get().then((res2) => {
              const totalScore = res2.result.data.reduce((sum, record) => sum + record.score, 0);
              if (totalScore < 20) {
                common_vendor.index.hideLoading();
                common_vendor.index.showToast({
                  title: "积分不足，无法置顶",
                  icon: "none"
                });
                return;
              }
              Promise.all([
                // 记录积分变动
                common_vendor.nr.database().collection("user-score").add({
                  user_id: userId,
                  score: -20,
                  type: "post_pin",
                  description: "帖子置顶消耗",
                  related_id: this.post._id,
                  create_time: Date.now()
                }),
                // 更新帖子状态
                common_vendor.nr.database().collection("add-content").doc(this.post._id).update({
                  content_type: "pinned"
                })
              ]).then(() => {
                common_vendor.index.hideLoading();
                common_vendor.index.showToast({
                  title: "置顶成功",
                  icon: "success"
                });
                this.$emit("post-updated", this.post._id);
              }).catch((err) => {
                common_vendor.index.hideLoading();
                common_vendor.index.__f__("error", "at components/circle/PostCard.vue:337", "置顶失败:", err);
                common_vendor.index.showToast({
                  title: err.message || "置顶失败",
                  icon: "none"
                });
              });
            }).catch((err) => {
              common_vendor.index.hideLoading();
              common_vendor.index.__f__("error", "at components/circle/PostCard.vue:346", "获取积分记录失败:", err);
              common_vendor.index.showToast({
                title: "操作失败",
                icon: "none"
              });
            });
          }
        }
      });
    },
    // 更新置顶状态
    updatePinStatus(isPinned) {
      common_vendor.index.showLoading({
        title: "处理中..."
      });
      common_vendor.nr.database().collection("add-content").doc(this.post._id).update({
        content_type: isPinned ? "pinned" : "post"
      }).then(() => {
        common_vendor.index.hideLoading();
        common_vendor.index.showToast({
          title: isPinned ? "置顶成功" : "已取消置顶",
          icon: "success"
        });
        this.$emit("post-updated", this.post._id);
      }).catch((err) => {
        common_vendor.index.hideLoading();
        common_vendor.index.__f__("error", "at components/circle/PostCard.vue:379", "更新置顶状态失败:", err);
        common_vendor.index.showToast({
          title: err.message || "操作失败",
          icon: "none"
        });
      });
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: $props.post.avatar,
    b: common_vendor.t($props.post.name),
    c: common_vendor.t($props.post.time),
    d: common_vendor.t($props.post.tag),
    e: common_vendor.n($props.post.tagClass),
    f: $options.isPostOwner
  }, $options.isPostOwner ? {
    g: common_vendor.o((...args) => $options.showMoreActions && $options.showMoreActions(...args))
  } : {}, {
    h: common_vendor.t($props.post.content),
    i: $props.post.images && $props.post.images.length
  }, $props.post.images && $props.post.images.length ? {
    j: common_vendor.f($props.post.images, (img, idx, i0) => {
      return {
        a: idx,
        b: img,
        c: common_vendor.o(($event) => $options.previewImage($props.post.images, idx), idx)
      };
    })
  } : {}, {
    k: common_vendor.t($props.post.likes),
    l: $props.post.isLiked ? 1 : "",
    m: common_vendor.o(($event) => $options.likePost($props.post, _ctx.idx)),
    n: $props.post.likeLoading,
    o: common_vendor.t($props.post.comments),
    p: common_vendor.o(($event) => _ctx.$emit("comment", $props.post)),
    q: common_vendor.o(($event) => _ctx.$emit("share", $props.post)),
    r: common_vendor.o(($event) => _ctx.$emit("view-detail", $props.post))
  });
}
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render]]);
wx.createComponent(Component);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/components/circle/PostCard.js.map
