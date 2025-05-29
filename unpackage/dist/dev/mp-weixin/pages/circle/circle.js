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
      activities: [
        {
          image: "/static/images/activity1.png",
          tag: "热门",
          tagClass: "hot",
          title: "校园文化节",
          description: "一年一度的校园文化节即将开幕，届时将有各种各样文化活动和表演，欢迎大家参与！",
          time: "5月20日-22日",
          location: "学校体育馆",
          avatars: ["/static/images/avatar1.png", "/static/images/avatar2.png", "/static/images/avatar3.png"],
          participants: 128
        },
        {
          image: "/static/images/activity2.png",
          tag: "官方",
          tagClass: "official",
          title: "创新创业大赛",
          description: "展示你的创新想法和创业计划，与来自各个学院的同学一起交流和竞争！",
          time: "6月5日-15日",
          location: "学校科技楼",
          avatars: ["/static/images/avatar4.png", "/static/images/avatar5.png", "/static/images/avatar6.png"],
          participants: 86
        }
      ],
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
      posts: [
        {
          id: 1,
          avatar: "/static/images/avatar1.png",
          name: "李明",
          college: "计算机科学与技术学院",
          time: "1小时前",
          tag: "讨论",
          tagClass: "discussion",
          content: "有没有同学知道学校图书馆新到的那批计算机专业书籍放在哪个区域？找了半天都没找到。",
          likes: 24,
          comments: 12,
          isLiked: false
        },
        {
          id: 2,
          avatar: "/static/images/avatar2.png",
          name: "张小红",
          college: "电子信息工程学院",
          time: "3小时前",
          tag: "失物招领",
          tagClass: "lost",
          content: "今天在教学楼A栋302教室捡到一个黑色钱包，里面有身份证和几张银行卡，失主请联系我。",
          images: ["/static/images/lost1.jpg"],
          likes: 36,
          comments: 8,
          isLiked: false
        }
      ]
    };
  },
  onLoad() {
    this.initData();
    common_vendor.index.setStorageSync("posts", this.posts);
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
      common_vendor.index.__f__("log", "at pages/circle/circle.vue:347", "查看活动详情", activity);
      common_vendor.index.navigateTo({
        url: "/pages/circle/activity-datail/activity-datail?id=" + activity.id
      });
    },
    // 参与活动
    joinActivity(activity) {
      common_vendor.index.__f__("log", "at pages/circle/circle.vue:355", "参与活动", activity);
      common_vendor.index.showToast({
        title: "已报名参与：" + activity.title,
        icon: "success"
      });
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
        url: `/pages/circle/post-datail/post-datail?id=${post.id}`
      });
    },
    // 点赞帖子
    likePost(post, index) {
      post.isLiked = !post.isLiked;
      post.likes += post.isLiked ? 1 : -1;
      common_vendor.index.showToast({
        title: post.isLiked ? "已点赞" : "已取消点赞",
        icon: "none"
      });
    },
    // 评论帖子
    commentPost(post) {
      common_vendor.index.__f__("log", "at pages/circle/circle.vue:392", "评论帖子", post);
      common_vendor.index.showToast({
        title: "评论功能开发中",
        icon: "none"
      });
    },
    // 分享帖子
    sharePost(post) {
      common_vendor.index.__f__("log", "at pages/circle/circle.vue:402", "分享帖子", post);
      common_vendor.index.showToast({
        title: "分享功能开发中",
        icon: "none"
      });
    },
    // 发布新帖子
    createPost() {
      common_vendor.index.__f__("log", "at pages/circle/circle.vue:412", "发布新帖子");
      common_vendor.index.showToast({
        title: "发帖功能开发中",
        icon: "none"
      });
    },
    // 查看全部活动
    viewAllActivities() {
      common_vendor.index.__f__("log", "at pages/circle/circle.vue:422", "查看全部活动");
      common_vendor.index.navigateTo({
        url: "/pages/circle/activities/activities"
      });
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
    o: common_vendor.o((...args) => $options.createPost && $options.createPost(...args))
  });
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/circle/circle.js.map
