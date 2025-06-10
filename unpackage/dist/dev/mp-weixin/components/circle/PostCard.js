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
            common_vendor.nr.database().collection("user-likes").doc(likeId).remove().then(() => {
              common_vendor.nr.database().collection("add-content").doc(post._id).update({
                like_count: post.likes
              }).then(() => {
                common_vendor.index.showToast({ title: "已取消点赞", icon: "none" });
                post.likeLoading = false;
              }).catch(() => {
                post.isLiked = originLiked;
                post.likes = originLikes;
                post.likeLoading = false;
              });
            }).catch(() => {
              post.isLiked = originLiked;
              post.likes = originLikes;
              post.likeLoading = false;
            });
          } else {
            post.likeLoading = false;
          }
        }).catch(() => {
          post.isLiked = originLiked;
          post.likes = originLikes;
          post.likeLoading = false;
        });
      } else {
        post.isLiked = true;
        post.likes += 1;
        common_vendor.nr.database().collection("user-likes").add({
          user_id: userId,
          post_id: post._id,
          create_time: Date.now()
        }).then(() => {
          common_vendor.nr.database().collection("add-content").doc(post._id).update({
            like_count: post.likes
          }).then(() => {
            common_vendor.index.showToast({ title: "已点赞", icon: "none" });
            post.likeLoading = false;
          }).catch(() => {
            post.isLiked = originLiked;
            post.likes = originLikes;
            post.likeLoading = false;
          });
        }).catch(() => {
          post.isLiked = originLiked;
          post.likes = originLikes;
          post.likeLoading = false;
        });
      }
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
    f: common_vendor.t($props.post.content),
    g: $props.post.images && $props.post.images.length
  }, $props.post.images && $props.post.images.length ? {
    h: common_vendor.f($props.post.images, (img, idx, i0) => {
      return {
        a: idx,
        b: img,
        c: common_vendor.o(($event) => $options.previewImage($props.post.images, idx), idx)
      };
    })
  } : {}, {
    i: common_vendor.t($props.post.likes),
    j: $props.post.isLiked ? 1 : "",
    k: common_vendor.o(($event) => $options.likePost($props.post, _ctx.idx)),
    l: $props.post.likeLoading,
    m: common_vendor.t($props.post.comments),
    n: common_vendor.o(($event) => _ctx.$emit("comment", $props.post)),
    o: common_vendor.o(($event) => _ctx.$emit("share", $props.post)),
    p: common_vendor.o(($event) => _ctx.$emit("view-detail", $props.post))
  });
}
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render]]);
wx.createComponent(Component);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/components/circle/PostCard.js.map
