"use strict";
const common_vendor = require("../../../common/vendor.js");
const _sfc_main = {
  data() {
    return {
      post: {},
      comments: [],
      commentText: "",
      isInputFocused: false,
      likeLoading: false,
      userInfo: common_vendor.index.getStorageSync("uni-id-pages-userInfo") || {},
      replyTo: null,
      // 当前回复的评论对象
      replyPlaceholder: "说点什么..."
    };
  },
  onLoad(options) {
    const postId = options.id;
    this.loadPostDetail(postId);
    this.fetchComments(postId);
  },
  methods: {
    // 获取帖子详情+用户信息+点赞状态
    async loadPostDetail(postId) {
      try {
        const postRes = await common_vendor.nr.database().collection("add-content").doc(postId).get();
        if (!postRes.result.data || postRes.result.data.length === 0) {
          common_vendor.index.showToast({ title: "未找到该帖子", icon: "none" });
          return;
        }
        const post = postRes.result.data[0];
        let user = {};
        try {
          const userRes = await common_vendor.nr.database().collection("uni-id-users").doc(post.user_id).field("_id,avatar_file,nickname").get();
          user = userRes.result.data[0] || {};
        } catch (e) {
        }
        let isLiked = false;
        if (this.userInfo && this.userInfo._id) {
          const likeRes = await common_vendor.nr.database().collection("user-likes").where({
            user_id: this.userInfo._id,
            post_id: postId
          }).get();
          isLiked = likeRes.result.data.length > 0;
        }
        this.post = {
          _id: post._id,
          content: post.content,
          images: post.files || [],
          likes: post.like_count || 0,
          comments: post.comment_count || 0,
          time: this.formatTime(post.create_time),
          name: user.nickname || "匿名用户",
          avatar: user.avatar_file && user.avatar_file.url ? user.avatar_file.url : "/static/images/default-avatar.png",
          tag: post.category,
          tagClass: this.getTagClass(post.category),
          isLiked
        };
      } catch (e) {
        common_vendor.index.showToast({ title: "加载失败", icon: "none" });
      }
    },
    // 帖子点赞/取消点赞
    async likePost() {
      if (this.likeLoading)
        return;
      this.likeLoading = true;
      if (!this.userInfo || !this.userInfo._id) {
        common_vendor.index.showToast({ title: "请先登录", icon: "none" });
        this.likeLoading = false;
        return;
      }
      const userId = this.userInfo._id;
      const postId = this.post._id;
      if (this.post.isLiked) {
        try {
          const likeRes = await common_vendor.nr.database().collection("user-likes").where({ user_id: userId, post_id: postId }).get();
          if (likeRes.result.data.length > 0) {
            const likeId = likeRes.result.data[0]._id;
            await common_vendor.nr.database().collection("user-likes").doc(likeId).remove();
            await common_vendor.nr.database().collection("add-content").doc(postId).update({
              like_count: this.post.likes - 1
            });
            this.post.isLiked = false;
            this.post.likes -= 1;
            common_vendor.index.showToast({ title: "已取消点赞", icon: "none" });
          }
        } catch (e) {
          common_vendor.index.showToast({ title: "操作失败", icon: "none" });
        }
      } else {
        try {
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
        } catch (e) {
          common_vendor.index.showToast({ title: "操作失败", icon: "none" });
        }
      }
      this.likeLoading = false;
    },
    formatTime(ts) {
      const date = new Date(ts);
      const now = Date.now();
      const diff = now - new Date(ts).getTime();
      if (diff < 6e4)
        return "刚刚";
      if (diff < 36e5)
        return Math.floor(diff / 6e4) + "分钟前";
      if (diff < 864e5)
        return Math.floor(diff / 36e5) + "小时前";
      return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()} ${date.getHours()}:${date.getMinutes()}`;
    },
    getTagClass(category) {
      if (category === "讨论")
        return "discussion";
      if (category === "失物招领")
        return "lost";
      if (category === "问答")
        return "question";
      return "";
    },
    // 评论
    async fetchComments(postId) {
      const res = await common_vendor.nr.database().collection("user-comment").where({ target_id: postId }).orderBy("create_time", "asc").get();
      const all = res.result.data;
      const commentIds = all.map((item) => item._id);
      let likedMap = {};
      if (this.userInfo && this.userInfo._id && commentIds.length) {
        const likeRes = await common_vendor.nr.database().collection("user-commentlikes").where({
          user_id: this.userInfo._id,
          comment_id: common_vendor.nr.database().command.in(commentIds)
        }).get();
        likedMap = {};
        likeRes.result.data.forEach((like) => {
          likedMap[like.comment_id] = true;
        });
      }
      const top = all.filter((c) => !c.parent_id).map((item) => ({
        ...item,
        user_id: item.author_id,
        // 确保user_id字段存在
        liked: likedMap[item._id] || false
      }));
      top.forEach((parent) => {
        parent.replies = all.filter((c) => c.parent_id === parent._id).map((item) => ({
          ...item,
          user_id: item.author_id,
          // 确保user_id字段存在
          liked: likedMap[item._id] || false
        }));
      });
      this.comments = top;
    },
    previewImage(images, index) {
      common_vendor.index.previewImage({
        urls: images,
        current: images[index]
      });
    },
    // 点赞评论
    async likeComment(comment) {
      if (comment.likeLoading)
        return;
      comment.likeLoading = true;
      common_vendor.index.__f__("log", "at pages/circle/post-datail/post-datail.vue:290", this.userInfo);
      const userId = this.userInfo._id;
      if (!userId) {
        common_vendor.index.showToast({ title: "请先登录", icon: "none" });
        comment.likeLoading = false;
        return;
      }
      try {
        if (comment.liked) {
          const likeRes = await common_vendor.nr.database().collection("user-commentlikes").where({
            user_id: userId,
            comment_id: comment._id
          }).get();
          if (likeRes.result.data.length > 0) {
            const likeId = likeRes.result.data[0]._id;
            await common_vendor.nr.database().collection("user-commentlikes").doc(likeId).remove();
            await common_vendor.nr.database().collection("user-comment").doc(comment._id).update({
              like_count: (comment.like_count || 0) - 1
            });
            await common_vendor.nr.database().collection("user-score").add({
              user_id: comment.user_id || comment.userId,
              score: -2,
              type: "comment_like",
              description: "评论被取消点赞",
              related_id: comment._id,
              create_time: Date.now()
            });
            comment.liked = false;
            comment.like_count = (comment.like_count || 0) - 1;
            common_vendor.index.showToast({ title: "已取消点赞", icon: "none" });
          }
        } else {
          await common_vendor.nr.database().collection("user-commentlikes").add({
            user_id: userId,
            comment_id: comment._id,
            create_time: Date.now()
          });
          await common_vendor.nr.database().collection("user-comment").doc(comment._id).update({
            like_count: (comment.like_count || 0) + 1
          });
          await common_vendor.nr.database().collection("user-score").add({
            user_id: comment.user_id || comment.userId,
            score: 2,
            type: "comment_like",
            description: "评论获赞",
            related_id: comment._id,
            create_time: Date.now()
          });
          comment.liked = true;
          comment.like_count = (comment.like_count || 0) + 1;
          common_vendor.index.showToast({ title: "已点赞", icon: "none" });
        }
      } catch (err) {
        common_vendor.index.__f__("error", "at pages/circle/post-datail/post-datail.vue:368", "点赞操作失败:", err);
        common_vendor.index.showToast({ title: "操作失败", icon: "none" });
      } finally {
        comment.likeLoading = false;
      }
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
    replyToComment(comment) {
      this.replyTo = comment;
      this.replyPlaceholder = `回复 @${comment.author_name}：`;
      this.isInputFocused = true;
    },
    //发送评论
    async sendComment() {
      if (!this.commentText.trim())
        return;
      if (!this.userInfo._id) {
        common_vendor.index.showToast({ title: "请先登录", icon: "none" });
        return;
      }
      const postId = this.post._id;
      await common_vendor.nr.callFunction({
        name: "user-comment",
        data: {
          content: this.commentText,
          author_id: this.userInfo._id,
          author_name: this.userInfo.nickname || "匿名用户",
          author_avatar: this.userInfo.avatar_file && this.userInfo.avatar_file.url ? this.userInfo.avatar_file.url : "/static/images/default-avatar.png",
          target_id: postId,
          parent_id: this.replyTo ? this.replyTo._id : ""
        }
      });
      this.commentText = "";
      this.isInputFocused = false;
      this.replyTo = null;
      this.replyPlaceholder = "说点什么...";
      common_vendor.index.showToast({ title: "评论成功", icon: "none" });
      this.fetchComments(postId);
      this.post.comments += 1;
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
    n: common_vendor.t($data.post.comments),
    o: common_vendor.f($data.comments, (comment, index, i0) => {
      return common_vendor.e({
        a: comment.author_avatar,
        b: common_vendor.t(comment.author_name),
        c: common_vendor.t(comment.content),
        d: common_vendor.t($options.formatTime(comment.create_time)),
        e: common_vendor.o(($event) => $options.replyToComment(comment), comment._id),
        f: common_vendor.n(comment.liked ? "icon-aixin4 liked" : "icon-aixin3"),
        g: common_vendor.n(comment.likeAnimate ? "like-animate" : ""),
        h: common_vendor.o(($event) => $options.likeComment(comment), comment._id),
        i: common_vendor.t(comment.like_count),
        j: comment.liked ? 1 : "",
        k: comment.replies && comment.replies.length
      }, comment.replies && comment.replies.length ? {
        l: common_vendor.f(comment.replies, (reply, rIdx, i1) => {
          return {
            a: reply.author_avatar,
            b: common_vendor.t(reply.author_name),
            c: common_vendor.t($options.formatTime(reply.create_time)),
            d: common_vendor.t(reply.content),
            e: reply._id
          };
        })
      } : {}, {
        m: comment._id
      });
    }),
    p: $data.userInfo.avatar_file && $data.userInfo.avatar_file.url ? $data.userInfo.avatar_file.url : "/static/images/default-avatar.png",
    q: $data.replyPlaceholder,
    r: $data.isInputFocused,
    s: common_vendor.o((...args) => $options.onInputFocus && $options.onInputFocus(...args)),
    t: common_vendor.o((...args) => $options.onInputBlur && $options.onInputBlur(...args)),
    v: $data.commentText,
    w: common_vendor.o(($event) => $data.commentText = $event.detail.value),
    x: !$data.commentText.trim(),
    y: common_vendor.o((...args) => $options.sendComment && $options.sendComment(...args))
  });
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../../.sourcemap/mp-weixin/pages/circle/post-datail/post-datail.js.map
