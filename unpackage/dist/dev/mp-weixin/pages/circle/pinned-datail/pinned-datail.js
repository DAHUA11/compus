"use strict";
const common_vendor = require("../../../common/vendor.js");
const _sfc_main = {
  data() {
    return {
      post: {
        id: 1,
        avatar: "https://picsum.photos/id/1/48/48",
        name: "校园公告",
        type: "商家",
        time: "2小时前",
        content: "各位同学请注意，学校将于5月25日至5月27日进行教学楼维修改造工程，期间相关教室将暂停使用，请大家合理安排学习时间。",
        images: [
          "https://picsum.photos/id/20/200/200",
          "https://picsum.photos/id/21/200/200",
          "https://picsum.photos/id/22/200/200"
        ],
        likes: 128,
        comments: 36,
        isLiked: false
      },
      comments: [
        {
          avatar: "https://picsum.photos/id/3/48/48",
          name: "张三",
          time: "1小时前",
          content: "收到，谢谢通知！",
          likes: 5,
          replies: []
        },
        {
          avatar: "https://picsum.photos/id/4/48/48",
          name: "李四",
          time: "30分钟前",
          content: "请问具体是哪些教室会暂停使用呢？",
          likes: 3,
          replies: []
        }
      ],
      commentText: "",
      isInputFocused: false,
      replyToIndex: null
      // 记录当前回复哪条评论
    };
  },
  onLoad(options) {
    const postId = options.id;
    common_vendor.index.__f__("log", "at pages/circle/pinned-datail/pinned-datail.vue:165", "加载帖子ID:", postId);
  },
  methods: {
    goBack() {
      common_vendor.index.navigateBack();
    },
    previewImage(index) {
      common_vendor.index.previewImage({
        urls: this.post.images,
        current: index
      });
    },
    handleLike() {
      if (!this.post.isLiked) {
        this.post.isLiked = true;
        this.post.likes++;
        this.post.likeAnimate = true;
        setTimeout(() => {
          this.post.likeAnimate = false;
        }, 350);
      } else {
        this.post.isLiked = false;
        this.post.likes--;
      }
    },
    focusComment() {
      this.isInputFocused = true;
    },
    handleShare() {
      common_vendor.index.showShareMenu({
        withShareTicket: true
      });
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
      if (this.replyToIndex !== null) {
        this.comments[this.replyToIndex].replies = this.comments[this.replyToIndex].replies || [];
        this.comments[this.replyToIndex].replies.push({
          avatar: "https://picsum.photos/id/5/48/48",
          name: "我",
          time: "刚刚",
          content: this.commentText
        });
        this.replyToIndex = null;
      } else {
        this.comments.unshift({
          avatar: "https://picsum.photos/id/5/48/48",
          name: "我",
          time: "刚刚",
          content: this.commentText,
          likes: 0,
          replies: []
        });
        this.post.comments++;
      }
      this.commentText = "";
    },
    likeComment(index) {
      const comment = this.comments[index];
      if (!comment.liked) {
        comment.liked = true;
        comment.likes++;
        comment.likeAnimate = true;
        setTimeout(() => {
          comment.likeAnimate = false;
        }, 350);
      } else {
        comment.liked = false;
        comment.likes--;
      }
    },
    replyComment(index) {
      this.replyToIndex = index;
      this.commentText = "";
      this.isInputFocused = true;
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: $data.post.avatar,
    b: common_vendor.t($data.post.name),
    c: common_vendor.t($data.post.type),
    d: common_vendor.n($data.post.type === "官方" ? "official" : "merchant"),
    e: common_vendor.t($data.post.time),
    f: common_vendor.t($data.post.content),
    g: $data.post.images && $data.post.images.length
  }, $data.post.images && $data.post.images.length ? {
    h: common_vendor.f($data.post.images, (img, index, i0) => {
      return {
        a: index,
        b: img,
        c: common_vendor.o(($event) => $options.previewImage(index), index)
      };
    })
  } : {}, {
    i: $data.post.likeAnimate ? 1 : "",
    j: $data.post.isLiked ? 1 : "",
    k: common_vendor.o((...args) => $options.handleLike && $options.handleLike(...args)),
    l: common_vendor.t($data.post.likes),
    m: common_vendor.o((...args) => $options.handleLike && $options.handleLike(...args)),
    n: common_vendor.t($data.post.comments),
    o: common_vendor.o((...args) => $options.focusComment && $options.focusComment(...args)),
    p: common_vendor.o((...args) => $options.handleShare && $options.handleShare(...args)),
    q: common_vendor.t($data.post.comments),
    r: common_vendor.f($data.comments, (comment, index, i0) => {
      return common_vendor.e({
        a: comment.avatar,
        b: common_vendor.t(comment.name),
        c: common_vendor.t(comment.content),
        d: common_vendor.t(comment.time),
        e: common_vendor.o(($event) => $options.replyComment(index), index),
        f: common_vendor.n(comment.liked ? "icon-aixin4 liked" : "icon-aixin3"),
        g: common_vendor.n(comment.likeAnimate ? "like-animate" : ""),
        h: common_vendor.o(($event) => $options.likeComment(index), index),
        i: common_vendor.t(comment.likes),
        j: comment.liked ? 1 : "",
        k: comment.replies && comment.replies.length
      }, comment.replies && comment.replies.length ? {
        l: common_vendor.f(comment.replies, (reply, rIdx, i1) => {
          return {
            a: reply.avatar,
            b: common_vendor.t(reply.name),
            c: common_vendor.t(reply.time),
            d: common_vendor.t(reply.content),
            e: rIdx
          };
        })
      } : {}, {
        m: index
      });
    }),
    s: $data.replyToIndex !== null ? "回复" + $data.comments[$data.replyToIndex].name + "的评论" : "说点什么...",
    t: $data.isInputFocused,
    v: common_vendor.o((...args) => $options.onInputFocus && $options.onInputFocus(...args)),
    w: common_vendor.o((...args) => $options.onInputBlur && $options.onInputBlur(...args)),
    x: $data.commentText,
    y: common_vendor.o(($event) => $data.commentText = $event.detail.value),
    z: !$data.commentText,
    A: common_vendor.o((...args) => $options.sendComment && $options.sendComment(...args))
  });
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../../.sourcemap/mp-weixin/pages/circle/pinned-datail/pinned-datail.js.map
