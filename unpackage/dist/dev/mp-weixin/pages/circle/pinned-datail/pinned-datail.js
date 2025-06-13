"use strict";
const common_vendor = require("../../../common/vendor.js");
const _sfc_main = {
  data() {
    const userInfo = common_vendor.index.getStorageSync("uni-id-pages-userInfo") || {};
    return {
      post: {
        _id: "",
        content: "",
        images: [],
        likes: 0,
        comments: 0,
        time: "",
        name: "",
        avatar: "/static/images/default-avatar.png",
        type: "官方",
        isLiked: false
      },
      comments: [],
      commentText: "",
      isInputFocused: false,
      likeLoading: false,
      userInfo,
      replyTo: null,
      replyPlaceholder: "说点什么...",
      loading: true
      // 添加loading状态
    };
  },
  async onLoad(options) {
    const postId = options.id;
    await Promise.all([
      this.loadPostDetail(postId),
      this.fetchComments(postId)
    ]);
    this.loading = false;
  },
  // 添加页面返回时的处理
  onUnload() {
    const pages = getCurrentPages();
    const circlePage = pages.find((page) => page.route === "pages/circle/circle");
    if (circlePage) {
      circlePage.$vm.fetchPinnedPosts();
    }
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
    // 获取帖子详情+用户信息+点赞状态
    async loadPostDetail(postId) {
      try {
        const [postRes, userLikeRes] = await Promise.all([
          // 1. 获取置顶帖子详情
          common_vendor.nr.database().collection("add-content").where({ _id: postId, content_type: "pinned" }).get(),
          // 2. 获取当前用户点赞状态
          this.userInfo._id ? common_vendor.nr.database().collection("user-likes").where({
            user_id: this.userInfo._id,
            post_id: postId
          }).get() : Promise.resolve({ result: { data: [] } })
        ]);
        if (!postRes.result.data || postRes.result.data.length === 0) {
          common_vendor.index.showToast({ title: "未找到该帖子", icon: "none" });
          return;
        }
        const post = postRes.result.data[0];
        const isLiked = userLikeRes.result.data.length > 0;
        let user = {};
        try {
          const userRes = await common_vendor.nr.database().collection("uni-id-users").doc(post.user_id).field("_id,avatar_file,nickname").get();
          user = userRes.result.data[0] || {};
        } catch (e) {
          common_vendor.index.__f__("error", "at pages/circle/pinned-datail/pinned-datail.vue:214", "获取发帖人信息失败:", e);
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
          type: post.category || "官方",
          isLiked
        };
      } catch (e) {
        common_vendor.index.__f__("error", "at pages/circle/pinned-datail/pinned-datail.vue:231", "获取帖子详情失败:", e);
        common_vendor.index.showToast({ title: "加载失败", icon: "none" });
      }
    },
    // 点赞帖子
    async handleLike() {
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
      try {
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
        const pages = getCurrentPages();
        const circlePage = pages.find((page) => page.route === "pages/circle/circle");
        if (circlePage) {
          const pinnedPosts = circlePage.$vm.pinnedPosts;
          const targetPost = pinnedPosts.find((p) => p._id === postId);
          if (targetPost) {
            targetPost.likes = this.post.likes;
            targetPost.isLiked = this.post.isLiked;
          }
        }
      } catch (e) {
        common_vendor.index.__f__("error", "at pages/circle/pinned-datail/pinned-datail.vue:294", "handleLike - 点赞操作失败:", e);
        common_vendor.index.showToast({ title: "操作失败", icon: "none" });
      } finally {
        this.likeLoading = false;
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
    // 评论
    async fetchComments(postId) {
      try {
        const [commentsRes, commentLikesRes] = await Promise.all([
          common_vendor.nr.database().collection("user-comment").where({ target_id: postId }).orderBy("create_time", "asc").get(),
          this.userInfo._id ? common_vendor.nr.database().collection("user-commentlikes").where({
            user_id: this.userInfo._id,
            comment_id: common_vendor.nr.database().command.in(
              (await common_vendor.nr.database().collection("user-comment").where({ target_id: postId }).get()).result.data.map((c) => c._id)
            )
          }).get() : Promise.resolve({ result: { data: [] } })
        ]);
        const all = commentsRes.result.data;
        const likedMap = {};
        commentLikesRes.result.data.forEach((like) => {
          likedMap[like.comment_id] = true;
        });
        const top = all.filter((c) => !c.parent_id).map((item) => ({
          ...item,
          user_id: item.author_id,
          liked: likedMap[item._id] || false
        }));
        top.forEach((parent) => {
          parent.replies = all.filter((c) => c.parent_id === parent._id).map((item) => ({
            ...item,
            user_id: item.author_id,
            liked: likedMap[item._id] || false
          }));
        });
        this.comments = top;
      } catch (e) {
        common_vendor.index.__f__("error", "at pages/circle/pinned-datail/pinned-datail.vue:359", "获取评论失败:", e);
        common_vendor.index.showToast({ title: "获取评论失败", icon: "none" });
      }
    },
    // 发送评论
    async sendComment() {
      if (!this.commentText.trim())
        return;
      if (!this.userInfo._id) {
        common_vendor.index.showToast({ title: "请先登录", icon: "none" });
        return;
      }
      const postId = this.post._id;
      try {
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
        await this.fetchComments(postId);
        this.post.comments += 1;
        await common_vendor.nr.database().collection("add-content").doc(postId).update({
          comment_count: this.post.comments
        });
      } catch (e) {
        common_vendor.index.__f__("error", "at pages/circle/pinned-datail/pinned-datail.vue:398", "发送评论失败:", e);
        common_vendor.index.showToast({ title: "评论失败", icon: "none" });
      }
    },
    async likeComment(comment) {
      if (comment.likeLoading)
        return;
      comment.likeLoading = true;
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
              user_id: comment.author_id,
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
            user_id: comment.author_id,
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
        common_vendor.index.__f__("error", "at pages/circle/pinned-datail/pinned-datail.vue:482", "点赞操作失败:", err);
        common_vendor.index.showToast({ title: "操作失败", icon: "none" });
      } finally {
        comment.likeLoading = false;
      }
    },
    replyToComment(comment) {
      this.replyTo = comment;
      this.replyPlaceholder = `回复 @${comment.author_name}：`;
      this.isInputFocused = true;
    },
    formatTime(ts) {
      const date = new Date(ts);
      return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()} ${date.getHours()}:${date.getMinutes()}`;
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: $data.loading
  }, $data.loading ? {} : common_vendor.e({
    b: $data.post.avatar,
    c: common_vendor.t($data.post.name),
    d: common_vendor.t($data.post.type),
    e: common_vendor.n($data.post.type === "官方" ? "official" : "merchant"),
    f: common_vendor.t($data.post.time),
    g: common_vendor.t($data.post.content),
    h: $data.post.images && $data.post.images.length
  }, $data.post.images && $data.post.images.length ? {
    i: common_vendor.f($data.post.images, (img, index, i0) => {
      return {
        a: index,
        b: img,
        c: common_vendor.o(($event) => $options.previewImage(index), index)
      };
    })
  } : {}, {
    j: $data.post.likeAnimate ? 1 : "",
    k: $data.post.isLiked ? 1 : "",
    l: common_vendor.o((...args) => $options.handleLike && $options.handleLike(...args)),
    m: common_vendor.t($data.post.likes),
    n: $data.post.isLiked ? 1 : "",
    o: common_vendor.o((...args) => $options.handleLike && $options.handleLike(...args)),
    p: common_vendor.t($data.post.comments),
    q: common_vendor.o((...args) => $options.focusComment && $options.focusComment(...args)),
    r: common_vendor.o((...args) => $options.handleShare && $options.handleShare(...args)),
    s: common_vendor.t($data.post.comments),
    t: common_vendor.f($data.comments, (comment, k0, i0) => {
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
        l: common_vendor.f(comment.replies, (reply, k1, i1) => {
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
    })
  }), {
    v: $data.replyTo ? "回复 @" + $data.replyTo.author_name + "：" : "说点什么...",
    w: $data.isInputFocused,
    x: common_vendor.o((...args) => $options.onInputFocus && $options.onInputFocus(...args)),
    y: common_vendor.o((...args) => $options.onInputBlur && $options.onInputBlur(...args)),
    z: $data.commentText,
    A: common_vendor.o(($event) => $data.commentText = $event.detail.value),
    B: !$data.commentText,
    C: common_vendor.o((...args) => $options.sendComment && $options.sendComment(...args))
  });
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../../.sourcemap/mp-weixin/pages/circle/pinned-datail/pinned-datail.js.map
