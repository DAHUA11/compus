"use strict";
const common_vendor = require("../../common/vendor.js");
const common_assets = require("../../common/assets.js");
const ActivityCard = () => "../../components/circle/ActivityCard.js";
const PostCard = () => "../../components/circle/PostCard.js";
const PinnedCard = () => "../../components/circle/PinnedCard.js";
const CategoryItem = () => "../../components/circle/CategoryItem.js";
const _sfc_main = {
  components: {
    ActivityCard,
    PostCard,
    PinnedCard,
    CategoryItem
  },
  data() {
    return {
      refreshing: false,
      loading: false,
      noMore: false,
      page: 1,
      activeCategory: 0,
      activeTab: 0,
      categories: [
        { name: "推荐", iconImg: "/static/images/cat1.jpg" },
        { name: "热门活动", iconImg: "/static/images/cat2.jpg" },
        { name: "校园问答", iconImg: "/static/images/cat3.jpg" },
        { name: "校园吐槽", iconImg: "/static/images/cat4.jpg" },
        { name: "以物换物", iconImg: "/static/images/cat5.jpg" }
      ],
      filterTabs: ["最新", "热门", "关注"],
      activities: [],
      pinnedPosts: [
        {
          id: 1,
          avatar: "https://picsum.photos/id/1/48/48",
          name: "校园公告",
          type: "官方",
          time: "2小时前",
          content: "各位同学请注意，学校将于5月25日至5月27日进行教学楼维修改造工程，期间相关教室将暂停使用，请大家合理安排学习时间。",
          likes: 128,
          comments: 36
        },
        {
          id: 2,
          avatar: "https://picsum.photos/id/2/48/48",
          name: "校园超市",
          type: "商家",
          time: "昨天",
          content: "校园超市将于本周进行夏季大促销活动，各类饮料、零食、生活用品均有优惠，欢迎同学们前来选购！",
          images: [
            "https://picsum.photos/id/20/200/200",
            "https://picsum.photos/id/21/200/200",
            "https://picsum.photos/id/22/200/200"
          ],
          likes: 86,
          comments: 24
        }
      ],
      posts: [],
      showFabMenu: false
    };
  },
  async onLoad() {
    this.initData();
    this.fetchPostsFromCloud();
    common_vendor.index.setStorageSync("posts", this.posts);
    await this.fetchActivitiesFromCloud();
  },
  onShow() {
    this.fetchPostsFromCloud();
  },
  methods: {
    // 初始化数据
    initData() {
      this.fetchData();
    },
    // 获取数据
    fetchData(isLoadMore = false) {
      if (isLoadMore) {
        this.loading = true;
      }
      setTimeout(() => {
        if (!isLoadMore)
          ;
        else {
          if (this.page > 3) {
            this.noMore = true;
          } else {
            this.posts.push({
              id: this.posts.length + 1,
              avatar: "/static/images/avatar3.png",
              name: "王大力",
              college: "机械工程学院",
              time: "5小时前",
              tag: "问答",
              tagClass: "question",
              content: "有人知道学校食堂什么时候开始供应冷饮吗？天气越来越热了。",
              likes: 18,
              comments: 7,
              isLiked: false
            });
          }
        }
        this.refreshing = false;
        this.loading = false;
      }, 1e3);
    },
    // 下拉刷新
    onRefresh() {
      if (this.refreshing)
        return;
      this.refreshing = true;
      this.page = 1;
      this.noMore = false;
      this.fetchData();
    },
    // 上拉加载更多
    onLoadMore() {
      if (this.loading || this.noMore)
        return;
      this.page++;
      this.fetchData(true);
    },
    // 切换分类
    switchCategory(index) {
      if (this.activeCategory === index)
        return;
      this.activeCategory = index;
      this.onRefresh();
    },
    // 切换标签
    switchTab(index) {
      if (this.activeTab === index)
        return;
      this.activeTab = index;
      this.onRefresh();
    },
    // 查看活动详情
    viewActivityDetail(activity) {
      common_vendor.index.__f__("log", "at pages/circle/circle.vue:319", "查看活动详情", activity);
      common_vendor.index.navigateTo({
        url: `/pages/circle/activity-datail/activity-datail?id=${activity._id}`
      });
    },
    // 参与活动（关键修改）
    async joinActivity(item) {
      common_vendor.index.__f__("log", "at pages/circle/circle.vue:327", "参与活动", item);
      try {
        const token = common_vendor.index.getStorageSync("uni_id_token");
        if (!token) {
          common_vendor.index.showModal({
            title: "提示",
            content: "请先登录后再参与活动",
            confirmText: "去登录",
            success: (res2) => {
              if (res2.confirm) {
                common_vendor.index.navigateTo({
                  url: "/pages/login/login"
                });
              }
            }
          });
          return;
        }
        const res = await common_vendor.nr.callFunction({
          name: "joinactivity",
          data: {
            activityId: item._id,
            token
          }
        });
        if (res.result.success) {
          common_vendor.index.showToast({ title: "参与成功", icon: "success" });
          await this.fetchActivitiesFromCloud();
          await this.fetchPostsFromCloud();
        } else {
          if (res.result.code === "TOKEN_INVALID") {
            common_vendor.index.showModal({
              title: "提示",
              content: "登录状态已失效，请重新登录",
              confirmText: "去登录",
              success: (res2) => {
                if (res2.confirm) {
                  common_vendor.index.navigateTo({
                    url: "/pages/login/login"
                  });
                }
              }
            });
          } else {
            common_vendor.index.showToast({
              title: res.result.message || "参与失败",
              icon: "none"
            });
          }
        }
      } catch (err) {
        common_vendor.index.__f__("error", "at pages/circle/circle.vue:385", "参与活动失败", err);
        common_vendor.index.showToast({ title: "参与失败，请稍后重试", icon: "none" });
      }
    },
    // 查看置顶帖子详情
    viewPinnedDetail(post) {
      common_vendor.index.navigateTo({
        url: `/pages/circle/pinned-datail/pinned-datail?id=${post.id}`
      });
    },
    // 查看帖子详情
    viewPostDetail(post) {
      common_vendor.index.navigateTo({
        url: `/pages/circle/post-datail/post-datail?id=${post._id}`
      });
    },
    // 点赞帖子
    likePost(post, index) {
      if (post.likeLoading)
        return;
      post.likeLoading = true;
      if (!post._id || typeof post._id !== "string") {
        common_vendor.index.showToast({ title: "帖子ID异常", icon: "none" });
        post.likeLoading = false;
        return;
      }
      if (typeof post.likes !== "number")
        post.likes = 0;
      const userId = common_vendor.index.getStorageSync("uni-id-pages-userInfo")._id;
      if (!userId) {
        common_vendor.index.showToast({ title: "请先登录", icon: "none" });
        post.likeLoading = false;
        return;
      }
      common_vendor.nr.database().collection("user-likes").where({
        user_id: userId,
        post_id: post._id
      }).get().then((res) => {
        if (res.result.data.length > 0) {
          const likeId = res.result.data[0]._id;
          common_vendor.nr.database().collection("user-likes").doc(likeId).remove().then(() => {
            common_vendor.nr.database().collection("add-content").doc(post._id).update({
              like_count: post.likes - 1
            }).then(() => {
              post.isLiked = false;
              post.likes -= 1;
              common_vendor.index.showToast({
                title: "已取消点赞",
                icon: "none"
              });
              post.likeLoading = false;
            }).catch(() => {
              post.likeLoading = false;
            });
          }).catch(() => {
            post.likeLoading = false;
          });
        } else {
          common_vendor.nr.database().collection("user-likes").add({
            user_id: userId,
            post_id: post._id,
            create_time: Date.now()
          }).then(() => {
            common_vendor.nr.database().collection("add-content").doc(post._id).update({
              like_count: post.likes + 1
            }).then(() => {
              post.isLiked = true;
              post.likes += 1;
              common_vendor.index.showToast({
                title: "已点赞",
                icon: "none"
              });
              post.likeLoading = false;
            }).catch(() => {
              post.likeLoading = false;
            });
          }).catch(() => {
            post.likeLoading = false;
          });
        }
      }).catch((err) => {
        common_vendor.index.showToast({ title: "操作失败", icon: "none" });
        common_vendor.index.__f__("error", "at pages/circle/circle.vue:488", "点赞操作失败", err);
        post.likeLoading = false;
      });
    },
    // 评论帖子
    commentPost(post) {
      common_vendor.index.__f__("log", "at pages/circle/circle.vue:495", "评论帖子", post);
      common_vendor.index.showToast({
        title: "评论功能开发中",
        icon: "none"
      });
    },
    // 分享帖子
    sharePost(post) {
      common_vendor.index.__f__("log", "at pages/circle/circle.vue:505", "分享帖子", post);
      common_vendor.index.showToast({
        title: "分享功能开发中",
        icon: "none"
      });
    },
    // 发布新帖子
    publishPost() {
      this.showFabMenu = false;
      common_vendor.index.navigateTo({
        url: "/pages/circle/post-create/post-create"
      });
    },
    // 查看全部活动
    viewAllActivities() {
      common_vendor.index.__f__("log", "at pages/circle/circle.vue:525", "查看全部活动");
      common_vendor.index.navigateTo({
        url: "/pages/circle/activities/activities"
      });
    },
    toggleFabMenu() {
      this.showFabMenu = !this.showFabMenu;
    },
    closeFabMenu() {
      this.showFabMenu = false;
    },
    publishActivity() {
      this.showFabMenu = false;
      common_vendor.index.showToast({ title: "发活动功能开发中", icon: "none" });
      common_vendor.index.navigateTo({
        url: "/pages/circle/addactivities/addactivities"
      });
    },
    // 获取帖子数据
    fetchPostsFromCloud() {
      this.loading = true;
      const userId = common_vendor.index.getStorageSync("uni-id-pages-userInfo")._id;
      common_vendor.nr.database().collection("add-content").where({
        content_type: "post",
        status: "published"
      }).orderBy("create_time", "desc").get().then((res) => {
        const posts = res.result.data;
        const userIds = [...new Set(posts.map((item) => item.user_id).filter(Boolean))];
        if (userIds.length === 0) {
          this.posts = [];
          this.loading = false;
          return;
        }
        const getLikesPromise = userId ? common_vendor.nr.database().collection("user-likes").where({
          user_id: userId,
          post_id: common_vendor.nr.database().command.in(posts.map((p) => p._id))
        }).get().then((likesRes) => {
          const likedPostIds = new Set(likesRes.result.data.map((like) => like.post_id));
          return likedPostIds;
        }) : Promise.resolve(/* @__PURE__ */ new Set());
        const getUserInfoPromise = common_vendor.nr.database().collection("uni-id-users").where({
          _id: common_vendor.nr.database().command.in(userIds)
        }).field("_id,avatar_file,nickname").get().then((userRes) => {
          const userMap = {};
          userRes.result.data.forEach((u) => {
            userMap[u._id] = u;
          });
          return userMap;
        });
        Promise.all([getLikesPromise, getUserInfoPromise]).then(([likedPostIds, userMap]) => {
          this.posts = posts.map((item) => {
            const user = userMap[item.user_id] || {};
            return {
              _id: item._id,
              avatar: user.avatar_file && user.avatar_file.url ? user.avatar_file.url : "/static/images/default-avatar.png",
              name: user.nickname || "匿名用户",
              time: this.formatTime(item.create_time),
              tag: item.category,
              tagClass: this.getTagClass(item.category),
              content: item.content,
              images: item.files || [],
              likes: item.like_count || 0,
              comments: item.comment_count || 0,
              isLiked: likedPostIds.has(item._id)
            };
          });
          this.loading = false;
        }).catch((err) => {
          common_vendor.index.__f__("error", "at pages/circle/circle.vue:620", "帖子加载失败", err);
          this.loading = false;
          common_vendor.index.showToast({ title: "数据加载失败", icon: "none" });
        });
      }).catch((err) => {
        this.loading = false;
        common_vendor.index.__f__("error", "at pages/circle/circle.vue:627", "帖子加载失败", err);
        common_vendor.index.showToast({ title: "帖子加载失败", icon: "none" });
      });
    },
    // 辅助方法
    formatTime(ts) {
      const date = new Date(ts);
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
    // 获取活动数据
    async fetchActivitiesFromCloud() {
      this.loading = true;
      try {
        const userId = common_vendor.index.getStorageSync("uni-id-pages-userInfo")._id;
        const res = await common_vendor.nr.database().collection("add-content").where({ content_type: "activity", status: "published" }).orderBy("create_time", "desc").get();
        const activities = res.result.data;
        const userIds = [...new Set(activities.map((item) => item.user_id).filter(Boolean))];
        let userMap = {};
        if (userIds.length) {
          const userRes = await common_vendor.nr.database().collection("uni-id-users").where({ _id: common_vendor.nr.database().command.in(userIds) }).field("_id,avatar_file,nickname").get();
          userRes.result.data.forEach((u) => {
            userMap[u._id] = u;
          });
        }
        let userJoins = /* @__PURE__ */ new Set();
        if (userId) {
          const joinsRes = await common_vendor.nr.database().collection("activity_participants").where({
            user_id: userId,
            activity_id: common_vendor.nr.database().command.in(activities.map((a) => a._id))
          }).get();
          userJoins = new Set(joinsRes.result.data.map((j) => j.activity_id));
        }
        this.activities = activities.map((item) => {
          const user = userMap[item.user_id] || {};
          return {
            _id: item._id,
            image: item.files && item.files.length ? item.files[0] : "/static/images/activity-default.png",
            tag: item.category || "",
            tagClass: item.category === "官方" ? "official" : item.category === "热门" ? "hot" : "",
            title: item.title,
            description: item.content,
            time: this.formatActivityTime(item.activity_time),
            location: item.location || "",
            avatars: user.avatar_file && user.avatar_file.url ? [user.avatar_file.url] : [],
            participants: item.attendee_count || 0,
            hasJoined: userJoins.has(item._id)
            // 添加参与状态
          };
        });
      } catch (err) {
        common_vendor.index.__f__("error", "at pages/circle/circle.vue:702", "获取活动数据失败", err);
        common_vendor.index.showToast({ title: "获取活动数据失败", icon: "none" });
      } finally {
        this.loading = false;
      }
    },
    // 活动时间格式化
    formatActivityTime(ts) {
      if (!ts)
        return "";
      const date = new Date(ts);
      return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
    }
  }
};
if (!Array) {
  const _component_category_item = common_vendor.resolveComponent("category-item");
  const _component_ActivityCard = common_vendor.resolveComponent("ActivityCard");
  const _component_pinned_card = common_vendor.resolveComponent("pinned-card");
  const _component_post_card = common_vendor.resolveComponent("post-card");
  (_component_category_item + _component_ActivityCard + _component_pinned_card + _component_post_card)();
}
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: common_assets._imports_0,
    b: common_vendor.f($data.categories, (item, index, i0) => {
      return {
        a: common_vendor.o(($event) => $options.switchCategory(index), index),
        b: "0c49c78b-0-" + i0,
        c: common_vendor.p({
          name: item.name,
          ["icon-img"]: item.iconImg,
          ["is-active"]: $data.activeCategory === index
        }),
        d: index,
        e: "category-" + index
      };
    }),
    c: common_vendor.o((...args) => $options.viewAllActivities && $options.viewAllActivities(...args)),
    d: common_vendor.f($data.activities, (item, index, i0) => {
      return {
        a: index,
        b: common_vendor.o($options.viewActivityDetail, index),
        c: common_vendor.o($options.joinActivity, index),
        d: "0c49c78b-1-" + i0,
        e: common_vendor.p({
          activity: item
        })
      };
    }),
    e: common_vendor.o($options.viewPinnedDetail),
    f: common_vendor.p({
      post: $data.pinnedPosts[0]
    }),
    g: common_vendor.o($options.viewPinnedDetail),
    h: common_vendor.p({
      post: $data.pinnedPosts[1]
    }),
    i: common_vendor.f($data.filterTabs, (tab, index, i0) => {
      return {
        a: common_vendor.t(tab),
        b: index,
        c: $data.activeTab === index ? 1 : "",
        d: common_vendor.o(($event) => $options.switchTab(index), index)
      };
    }),
    j: $data.posts.length === 0 && !$data.loading
  }, $data.posts.length === 0 && !$data.loading ? {
    k: common_vendor.o((...args) => $options.onRefresh && $options.onRefresh(...args))
  } : {
    l: common_vendor.f($data.posts, (post, index, i0) => {
      return {
        a: index,
        b: common_vendor.o($options.viewPostDetail, index),
        c: common_vendor.o(($event) => $options.likePost($event, index), index),
        d: common_vendor.o($options.commentPost, index),
        e: common_vendor.o($options.sharePost, index),
        f: "0c49c78b-4-" + i0,
        g: common_vendor.p({
          post
        })
      };
    })
  }, {
    m: $data.loading
  }, $data.loading ? {} : {}, {
    n: $data.noMore && $data.posts.length > 0
  }, $data.noMore && $data.posts.length > 0 ? {} : {}, {
    o: $data.showFabMenu
  }, $data.showFabMenu ? {
    p: common_vendor.o((...args) => $options.closeFabMenu && $options.closeFabMenu(...args))
  } : {}, {
    q: $data.showFabMenu
  }, $data.showFabMenu ? {
    r: common_vendor.o((...args) => $options.publishPost && $options.publishPost(...args)),
    s: common_vendor.o((...args) => $options.publishActivity && $options.publishActivity(...args))
  } : {}, {
    t: common_vendor.n($data.showFabMenu ? "icon-jianshao" : "icon-a-chuangjiantianjiapiliangtianjia"),
    v: common_vendor.o((...args) => $options.toggleFabMenu && $options.toggleFabMenu(...args))
  });
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/circle/circle.js.map
