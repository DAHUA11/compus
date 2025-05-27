"use strict";
const common_vendor = require("../../../common/vendor.js");
const _sfc_main = {
  data() {
    return {
      post: {},
      comments: [],
      commentText: "",
      isInputFocused: false
    };
  },
  onLoad(options) {
    const postId = options.id;
    const posts = common_vendor.index.getStorageSync("posts") || [];
    const post = posts.find((item) => item.id == postId);
    if (post) {
      this.post = post;
    } else {
      common_vendor.index.showToast({ title: "未找到该帖子", icon: "none" });
    }
    this.comments = [
      {
        avatar: "/static/images/avatar1.png",
        name: "小明",
        time: "1小时前",
        content: "写得真好，支持一下！",
        likes: 2,
        liked: false
      },
      {
        avatar: "/static/images/avatar2.png",
        name: "小红",
        time: "30分钟前",
        content: "有用的信息，感谢分享~",
        likes: 1,
        liked: false
      }
    ];
  },
  methods: {
    previewImage(images, index) {
      common_vendor.index.previewImage({
        urls: images,
        current: images[index]
      });
    },
    likePost() {
      this.post.isLiked = !this.post.isLiked;
      this.post.likes += this.post.isLiked ? 1 : -1;
    },
    likeComment(idx) {
      const comment = this.comments[idx];
      comment.liked = !comment.liked;
      comment.likes += comment.liked ? 1 : -1;
    },
    focusCommentInput() {
      this.isInputFocused = true;
    },
    onInputFocus() {
      this.isInputFocused = true;
    },
    onInputBlur() {
      this.isInputFocused = false;
    },
    sendComment() {
      if (!this.commentText.trim())
        return;
      this.comments.unshift({
        avatar: "/static/images/avatar3.png",
        name: "我",
        time: "刚刚",
        content: this.commentText,
        likes: 0,
        liked: false
      });
      this.commentText = "";
      this.isInputFocused = false;
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: $data.post.avatar,
    b: common_vendor.t($data.post.name),
    c: common_vendor.t($data.post.tag),
    d: common_vendor.n($data.post.tagClass),
    e: common_vendor.t($data.post.time),
    f: common_vendor.t($data.post.content),
    g: $data.post.images && $data.post.images.length
  }, $data.post.images && $data.post.images.length ? {
    h: common_vendor.f($data.post.images, (img, idx, i0) => {
      return {
        a: idx,
        b: img,
        c: common_vendor.o(($event) => $options.previewImage($data.post.images, idx), idx)
      };
    })
  } : {}, {
    i: common_vendor.t($data.post.likes),
    j: $data.post.isLiked ? 1 : "",
    k: common_vendor.o((...args) => $options.likePost && $options.likePost(...args)),
    l: common_vendor.t($data.comments.length),
    m: common_vendor.o((...args) => $options.focusCommentInput && $options.focusCommentInput(...args)),
    n: common_vendor.t($data.comments.length),
    o: $data.comments.length === 0
  }, $data.comments.length === 0 ? {} : {
    p: common_vendor.f($data.comments, (comment, idx, i0) => {
      return {
        a: comment.avatar,
        b: common_vendor.t(comment.name),
        c: common_vendor.t(comment.time),
        d: common_vendor.t(comment.content),
        e: common_vendor.n(comment.liked ? "icon-dianzan" : "icon-dianzan"),
        f: common_vendor.t(comment.likes),
        g: comment.liked ? 1 : "",
        h: common_vendor.o(($event) => $options.likeComment(idx), idx),
        i: idx
      };
    })
  }, {
    q: $data.isInputFocused,
    r: common_vendor.o((...args) => $options.onInputFocus && $options.onInputFocus(...args)),
    s: common_vendor.o((...args) => $options.onInputBlur && $options.onInputBlur(...args)),
    t: $data.commentText,
    v: common_vendor.o(($event) => $data.commentText = $event.detail.value),
    w: !$data.commentText.trim(),
    x: common_vendor.o((...args) => $options.sendComment && $options.sendComment(...args))
  });
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../../.sourcemap/mp-weixin/pages/circle/post-datail/post-datail.js.map
