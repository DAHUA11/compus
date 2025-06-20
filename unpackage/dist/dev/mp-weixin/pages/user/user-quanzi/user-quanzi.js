"use strict";
const common_vendor = require("../../../common/vendor.js");
const _sfc_main = {
  data() {
    return {
      tabs: [
        { text: "发帖数", type: "post", count: 0 },
        { text: "评论数", type: "comment", count: 0 },
        { text: "获赞数", type: "like", count: 0 },
        { text: "我的点赞", type: "user_likes", count: 0 }
      ],
      currentType: "post",
      postList: [],
      commentList: [],
      likeList: [],
      userLikesList: [],
      userInfo: null,
      touchStartX: 0,
      initialOffsetX: 0,
      isDragging: false,
      currentSwipeIndex: -1
    };
  },
  computed: {
    currentList() {
      switch (this.currentType) {
        case "post":
          return this.postList;
        case "comment":
          return this.commentList;
        case "like":
          return this.likeList;
        case "user_likes":
          return this.userLikesList;
        default:
          return [];
      }
    }
  },
  methods: {
    switchTab(type) {
      this.currentType = type;
      this.closeAllSwipe();
    },
    getTypeLabel(type) {
      const typeMap = {
        "post": "发布帖子",
        "comment": "发表评论",
        "like": "获得点赞",
        "user_likes": "点赞了帖子"
      };
      return typeMap[type] || "贡献";
    },
    getDeleteButtonText(type) {
      const map = {
        post: "删除帖子",
        comment: "删除评论",
        user_likes: "取消点赞"
      };
      return map[type] || "删除";
    },
    // 处理卡片点击
    handleCardClick(item) {
      if (this.isDragging) {
        return;
      }
      common_vendor.index.__f__("log", "at pages/user/user-quanzi/user-quanzi.vue:123", "卡片点击:", item);
    },
    // 触摸开始
    touchStart(e) {
      const index = e.currentTarget.dataset.index;
      if (typeof index === "undefined")
        return;
      const item = this.currentList[index];
      if (!item)
        return;
      this.currentList.forEach((it, i) => {
        if (i !== index && it.offsetX !== 0) {
          this.$set(it, "offsetX", 0);
        }
      });
      this.isDragging = false;
      this.touchStartX = e.touches[0].clientX;
      this.initialOffsetX = item.offsetX || 0;
      this.currentSwipeIndex = index;
    },
    // 触摸移动
    touchMove(e) {
      const index = e.currentTarget.dataset.index;
      if (index !== this.currentSwipeIndex)
        return;
      const currentX = e.touches[0].clientX;
      const deltaX = currentX - this.touchStartX;
      if (Math.abs(deltaX) > 5) {
        this.isDragging = true;
      }
      const item = this.currentList[index];
      if (!item)
        return;
      let newOffsetX = this.initialOffsetX + deltaX;
      const maxOffset = -80;
      if (newOffsetX > 0) {
        newOffsetX = 0;
      }
      if (newOffsetX < maxOffset) {
        newOffsetX = maxOffset;
      }
      this.$set(item, "offsetX", newOffsetX);
    },
    // 触摸结束
    touchEnd(e) {
      const index = e.currentTarget.dataset.index;
      if (index !== this.currentSwipeIndex)
        return;
      const item = this.currentList[index];
      if (!item)
        return;
      if (this.isDragging) {
        const offsetX = item.offsetX || 0;
        const maxOffset = -80;
        if (offsetX < maxOffset / 2) {
          this.$set(item, "offsetX", -80);
        } else {
          this.$set(item, "offsetX", 0);
        }
      }
      this.currentSwipeIndex = -1;
    },
    // 关闭所有左滑
    closeAllSwipe() {
      this.currentList.forEach((item) => {
        this.$set(item, "offsetX", 0);
      });
    },
    // 处理删除
    handleDelete(item) {
      common_vendor.index.__f__("log", "at pages/user/user-quanzi/user-quanzi.vue:205", "删除项目:", item);
      common_vendor.index.showModal({
        title: "确认删除",
        content: `确定要删除这条${this.getTypeLabel(item.type)}记录吗？`,
        success: (res) => {
          if (res.confirm) {
            this.deleteItem(item);
          }
        }
      });
    },
    // 删除项目
    async deleteItem(item) {
      try {
        common_vendor.index.showLoading({
          title: "删除中..."
        });
        const db = common_vendor.nr.database();
        let success = false;
        switch (item.type) {
          case "post":
            await db.collection("add-content").doc(item.id).remove();
            success = true;
            break;
          case "comment":
            await db.collection("user-comment").doc(item.id).remove();
            success = true;
            break;
          case "user_likes":
            await db.collection("user-likes").doc(item.id).remove();
            success = true;
            break;
          case "like":
            common_vendor.index.showToast({
              title: "获赞记录不能删除",
              icon: "none"
            });
            return;
        }
        if (success) {
          common_vendor.index.showToast({
            title: "删除成功",
            icon: "success"
          });
          this.loadAllData();
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/user/user-quanzi/user-quanzi.vue:264", "删除失败：", error);
        common_vendor.index.showToast({
          title: "删除失败",
          icon: "none"
        });
      } finally {
        common_vendor.index.hideLoading();
      }
    },
    // 格式化时间
    formatTime(timestamp) {
      if (!timestamp)
        return "";
      const date = new Date(timestamp);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      const hour = String(date.getHours()).padStart(2, "0");
      const minute = String(date.getMinutes()).padStart(2, "0");
      return `${year}-${month}-${day} ${hour}:${minute}`;
    },
    // 获取用户信息
    getUserInfo() {
      const info = common_vendor.index.getStorageSync("uni-id-pages-userInfo");
      this.userInfo = info && info._id ? info : null;
    },
    // 获取用户发帖数据
    async getUserPosts() {
      common_vendor.index.__f__("log", "at pages/user/user-quanzi/user-quanzi.vue:294", "尝试获取发帖数据...");
      if (!this.userInfo || !this.userInfo._id) {
        common_vendor.index.__f__("log", "at pages/user/user-quanzi/user-quanzi.vue:296", "获取发帖数据中止：无用户信息。");
        return;
      }
      const db = common_vendor.nr.database();
      const whereCondition = { user_id: this.userInfo._id, status: "published", content_type: "post" };
      try {
        const [postsResult, countResult] = await Promise.all([
          db.collection("add-content").where(whereCondition).orderBy("create_time", "desc").limit(20).get(),
          db.collection("add-content").where(whereCondition).count()
        ]);
        if (postsResult.result && postsResult.result.data) {
          this.postList = postsResult.result.data.map((post) => ({
            id: post._id,
            type: "post",
            icon: "compose",
            content: post.content,
            create_time: post.create_time,
            stats: {
              likes: post.likes || post.like_count || 0,
              comments: post.comments || post.comment_count || 0
            }
          }));
        }
        if (countResult.result) {
          const tab = this.tabs.find((t) => t.type === "post");
          if (tab)
            this.$set(tab, "count", countResult.result.total);
        }
        common_vendor.index.__f__("log", "at pages/user/user-quanzi/user-quanzi.vue:323", "发帖数据获取结果:", { list: this.postList, count: countResult.result.total });
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/user/user-quanzi/user-quanzi.vue:325", "获取用户发帖失败：", error);
        common_vendor.index.showToast({ title: "获取发帖数据失败", icon: "none" });
      }
    },
    // 获取用户评论数据
    async getUserComments() {
      common_vendor.index.__f__("log", "at pages/user/user-quanzi/user-quanzi.vue:332", "尝试获取评论数据...");
      if (!this.userInfo || !this.userInfo._id) {
        common_vendor.index.__f__("log", "at pages/user/user-quanzi/user-quanzi.vue:334", "获取评论数据中止：无用户信息。");
        return;
      }
      const db = common_vendor.nr.database();
      const whereCondition = `"user_id" == "${this.userInfo._id}" || "author_id" == "${this.userInfo._id}"`;
      try {
        const [commentsResult, countResult] = await Promise.all([
          db.collection("user-comment").where(whereCondition).orderBy("create_time", "desc").limit(20).get(),
          db.collection("user-comment").where(whereCondition).count()
        ]);
        if (commentsResult.result && commentsResult.result.data) {
          this.commentList = commentsResult.result.data.map((comment) => ({
            id: comment._id,
            type: "comment",
            icon: "chat",
            content: comment.content,
            create_time: comment.create_time,
            extra: `评论了帖子`,
            stats: {
              likes: comment.likes || comment.like_count || 0,
              comments: comment.replies || comment.reply_count || 0
            }
          }));
        }
        if (countResult.result) {
          const tab = this.tabs.find((t) => t.type === "comment");
          if (tab)
            this.$set(tab, "count", countResult.result.total);
        }
        common_vendor.index.__f__("log", "at pages/user/user-quanzi/user-quanzi.vue:362", "评论数据获取结果:", { list: this.commentList, count: countResult.result.total });
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/user/user-quanzi/user-quanzi.vue:364", "获取用户评论失败：", error);
        common_vendor.index.showToast({ title: "获取评论数据失败", icon: "none" });
      }
    },
    // 获取用户获赞数据
    async getUserReceivedLikes() {
      common_vendor.index.__f__("log", "at pages/user/user-quanzi/user-quanzi.vue:371", "尝试获取获赞数据...");
      if (!this.userInfo || !this.userInfo._id) {
        common_vendor.index.__f__("log", "at pages/user/user-quanzi/user-quanzi.vue:373", "获取获赞数据中止：无用户信息。");
        return;
      }
      const db = common_vendor.nr.database();
      const whereCondition = `user_id == "${this.userInfo._id}" && status == "published" && content_type == "post"`;
      try {
        const listResult = await db.collection("add-content").where(`${whereCondition} && (likes > 0 || like_count > 0)`).orderBy("create_time", "desc").limit(10).get();
        if (listResult.result && listResult.result.data) {
          this.likeList = listResult.result.data.map((post) => ({
            id: post._id,
            type: "like",
            icon: "heart",
            content: post.content,
            create_time: post.create_time,
            extra: `获得了 ${post.likes || post.like_count || 0} 个赞`,
            stats: { likes: post.likes || post.like_count || 0 }
          }));
        }
        const allPostsResult = await db.collection("add-content").where(whereCondition).get();
        let totalLikes = 0;
        if (allPostsResult.result && allPostsResult.result.data) {
          totalLikes = allPostsResult.result.data.reduce((sum, post) => sum + (post.likes || post.like_count || 0), 0);
        }
        const tab = this.tabs.find((t) => t.type === "like");
        if (tab)
          this.$set(tab, "count", totalLikes);
        common_vendor.index.__f__("log", "at pages/user/user-quanzi/user-quanzi.vue:402", "获赞数据获取结果:", { list: this.likeList, count: totalLikes });
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/user/user-quanzi/user-quanzi.vue:404", "获取用户获赞失败：", error);
        common_vendor.index.showToast({ title: "获取获赞数据失败", icon: "none" });
      }
    },
    // 获取用户点赞的帖子数据
    async getUserLikes() {
      common_vendor.index.__f__("log", "at pages/user/user-quanzi/user-quanzi.vue:411", '尝试获取"我的点赞"数据...');
      if (!this.userInfo || !this.userInfo._id) {
        common_vendor.index.__f__("log", "at pages/user/user-quanzi/user-quanzi.vue:413", '获取"我的点赞"数据中止：无用户信息。');
        return;
      }
      const db = common_vendor.nr.database();
      const whereCondition = { user_id: this.userInfo._id };
      try {
        const [likesResult, countResult] = await Promise.all([
          db.collection("user-likes").where(whereCondition).orderBy("create_time", "desc").limit(20).get(),
          db.collection("user-likes").where(whereCondition).count()
        ]);
        if (countResult.result) {
          const tab = this.tabs.find((t) => t.type === "user_likes");
          if (tab)
            this.$set(tab, "count", countResult.result.total);
        }
        common_vendor.index.__f__("log", "at pages/user/user-quanzi/user-quanzi.vue:428", '"我的点赞"数量:', countResult.result ? countResult.result.total : 0);
        if (likesResult.result && likesResult.result.data && likesResult.result.data.length > 0) {
          const postIds = likesResult.result.data.map((like) => like.post_id);
          const postsResult = await db.collection("add-content").where({ _id: db.command.in(postIds), status: "published" }).get();
          if (postsResult.result && postsResult.result.data) {
            const postMap = {};
            postsResult.result.data.forEach((post) => {
              postMap[post._id] = post;
            });
            this.userLikesList = likesResult.result.data.map((like) => {
              const post = postMap[like.post_id];
              if (!post)
                return null;
              return {
                id: like._id,
                type: "user_likes",
                icon: "heart",
                content: post.content,
                create_time: like.create_time,
                extra: `点赞了帖子`,
                stats: {
                  likes: post.likes || post.like_count || 0,
                  comments: post.comments || post.comment_count || 0
                }
              };
            }).filter((item) => item !== null);
          }
        } else {
          this.userLikesList = [];
        }
        common_vendor.index.__f__("log", "at pages/user/user-quanzi/user-quanzi.vue:456", '"我的点赞"列表:', this.userLikesList);
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/user/user-quanzi/user-quanzi.vue:458", "获取用户点赞失败：", error);
        common_vendor.index.showToast({ title: "获取点赞数据失败", icon: "none" });
      }
    },
    // 加载所有数据
    async loadAllData() {
      common_vendor.index.__f__("log", "at pages/user/user-quanzi/user-quanzi.vue:465", "--- 开始加载所有数据 ---");
      if (!this.userInfo) {
        common_vendor.index.__f__("log", "at pages/user/user-quanzi/user-quanzi.vue:467", "加载中止：未找到用户信息");
        common_vendor.index.showToast({
          title: "请先登录",
          icon: "none"
        });
        return;
      }
      common_vendor.index.__f__("log", "at pages/user/user-quanzi/user-quanzi.vue:475", "用户信息ID:", this.userInfo._id);
      common_vendor.index.showLoading({
        title: "加载中..."
      });
      try {
        common_vendor.index.__f__("log", "at pages/user/user-quanzi/user-quanzi.vue:483", "并行加载...");
        await Promise.all([
          this.getUserPosts(),
          this.getUserComments(),
          this.getUserReceivedLikes(),
          this.getUserLikes()
        ]);
        common_vendor.index.__f__("log", "at pages/user/user-quanzi/user-quanzi.vue:491", "所有数据加载完成");
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/user/user-quanzi/user-quanzi.vue:493", "加载数据失败：", error);
      } finally {
        common_vendor.index.__f__("log", "at pages/user/user-quanzi/user-quanzi.vue:495", "--- 结束加载所有数据 ---");
        common_vendor.index.hideLoading();
      }
    }
  },
  onLoad() {
    this.getUserInfo();
  },
  onShow() {
    this.getUserInfo();
    this.loadAllData();
  }
};
if (!Array) {
  const _easycom_uni_icons2 = common_vendor.resolveComponent("uni-icons");
  _easycom_uni_icons2();
}
const _easycom_uni_icons = () => "../../../uni_modules/uni-icons/components/uni-icons/uni-icons.js";
if (!Math) {
  _easycom_uni_icons();
}
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: common_vendor.f($data.tabs, (tab, k0, i0) => {
      return {
        a: common_vendor.t(tab.text),
        b: common_vendor.t(tab.count),
        c: tab.type,
        d: common_vendor.n({
          active: $data.currentType === tab.type
        }),
        e: common_vendor.o(($event) => $options.switchTab(tab.type), tab.type)
      };
    }),
    b: common_vendor.f($options.currentList, (item, index, i0) => {
      return common_vendor.e({
        a: "01ec3445-0-" + i0,
        b: common_vendor.p({
          type: item.icon,
          size: "20",
          color: "#4080FF"
        }),
        c: common_vendor.t($options.getTypeLabel(item.type)),
        d: common_vendor.t($options.formatTime(item.create_time)),
        e: common_vendor.t(item.content),
        f: item.extra || item.stats
      }, item.extra || item.stats ? common_vendor.e({
        g: item.stats
      }, item.stats ? common_vendor.e({
        h: common_vendor.t(item.stats.likes),
        i: common_vendor.t(item.stats.comments),
        j: item.stats.shares
      }, item.stats.shares ? {
        k: common_vendor.t(item.stats.shares)
      } : {}) : {}, {
        l: item.extra
      }, item.extra ? {
        m: common_vendor.t(item.extra)
      } : {}) : {}, {
        n: `translateX(${item.offsetX || 0}px)`,
        o: common_vendor.o(($event) => $options.handleCardClick(item), item.id),
        p: item.type !== "like"
      }, item.type !== "like" ? {
        q: "01ec3445-1-" + i0,
        r: common_vendor.p({
          type: "trash",
          size: "20",
          color: "#fff"
        }),
        s: common_vendor.t($options.getDeleteButtonText(item.type)),
        t: common_vendor.o(($event) => $options.handleDelete(item), item.id)
      } : {}, {
        v: item.id,
        w: common_vendor.o((...args) => $options.touchStart && $options.touchStart(...args), item.id),
        x: common_vendor.o((...args) => $options.touchMove && $options.touchMove(...args), item.id),
        y: common_vendor.o((...args) => $options.touchEnd && $options.touchEnd(...args), item.id),
        z: index
      });
    }),
    c: $options.currentList.length === 0
  }, $options.currentList.length === 0 ? {
    d: common_vendor.p({
      type: "info",
      size: "40",
      color: "#C8C9CC"
    })
  } : {});
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../../.sourcemap/mp-weixin/pages/user/user-quanzi/user-quanzi.js.map
