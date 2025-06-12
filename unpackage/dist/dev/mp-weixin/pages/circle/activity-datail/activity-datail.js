"use strict";
const common_vendor = require("../../../common/vendor.js");
const _sfc_main = {
  data() {
    return {
      id: null,
      activity: {},
      // 初始化为空对象避免渲染错误
      relatedActivities: [
        {
          id: 2,
          image: "/static/images/activity2.png",
          title: "创新创业大赛",
          date: new Date((/* @__PURE__ */ new Date()).getTime() + 5 * 24 * 60 * 60 * 1e3),
          // 5天后
          status: "upcoming"
        },
        {
          id: 3,
          image: "/static/images/activity1.png",
          title: "校园歌手大赛",
          date: new Date((/* @__PURE__ */ new Date()).getTime() + 2 * 24 * 60 * 60 * 1e3),
          // 2天后
          status: "upcoming"
        },
        {
          id: 4,
          image: "/static/images/activity2.png",
          title: "篮球联赛",
          date: new Date((/* @__PURE__ */ new Date()).getTime() + 7 * 24 * 60 * 60 * 1e3),
          // 7天后
          status: "upcoming"
        }
      ],
      statusBarHeight: 0,
      menuButtonHeight: 0,
      menuButtonLeft: 0,
      menuButtonRight: 0,
      headerHeight: 0,
      coverShow: false,
      currentUserId: null,
      // 新增：当前登录用户ID
      isCurrentUser: false
      // 新增：是否是活动发布者标识
    };
  },
  onLoad(options) {
    const windowInfo = common_vendor.index.getWindowInfo();
    const menuButton = common_vendor.index.getMenuButtonBoundingClientRect();
    this.statusBarHeight = windowInfo.statusBarHeight;
    this.menuButtonHeight = menuButton.height;
    this.menuButtonLeft = menuButton.left;
    this.menuButtonRight = menuButton.right;
    this.headerHeight = windowInfo.statusBarHeight + menuButton.height;
    if (options.id) {
      this.id = options.id;
      this.loadActivityDetail();
    }
  },
  mounted() {
    setTimeout(() => {
      this.coverShow = true;
    }, 100);
  },
  methods: {
    //编辑活动跳转方法
    editActivity() {
      common_vendor.index.__f__("log", "at pages/circle/activity-datail/activity-datail.vue:170", "编辑活动");
      const activity = encodeURIComponent(JSON.stringify({
        _id: this.activity._id,
        title: this.activity.title,
        content: this.activity.content,
        activity_time: this.activity.activity_time || this.activity.date && this.activity.date.getTime(),
        location: this.activity.location,
        max_attendees: this.activity.max_attendees,
        tags: this.activity.tags,
        files: this.activity.files || (this.activity.image ? [this.activity.image] : []),
        category: this.activity.category
      }));
      common_vendor.index.navigateTo({
        url: `/pages/circle/addactivities/addactivities?activity=${activity}`
      });
    },
    //主办方介绍提示
    viewOrganizer() {
      common_vendor.index.showModal({
        title: "提示",
        content: "主办方介绍功能暂未开通，敬请期待~",
        showCancel: false
      });
    },
    // 加载活动详情数据
    async loadActivityDetail() {
      var _a, _b, _c, _d;
      try {
        const token = common_vendor.index.getStorageSync("uni_id_token");
        let currentUserId = null;
        if (token) {
          const decodedToken = JSON.parse(atob(token.split(".")[1]));
          currentUserId = decodedToken.uid;
        }
        const res = await common_vendor.nr.database().collection("add-content").doc(this.id).get();
        if (res.result.data && res.result.data.length > 0) {
          const rawActivity = res.result.data[0];
          this.isCurrentUser = currentUserId === rawActivity.user_id;
          common_vendor.index.__f__("log", "at pages/circle/activity-datail/activity-datail.vue:215", "当前用户发布的活动", rawActivity);
          common_vendor.index.__f__("log", "at pages/circle/activity-datail/activity-datail.vue:216", "当前用户ID", currentUserId);
          const userRes = await common_vendor.nr.database().collection("uni-id-users").doc(rawActivity.user_id).field("avatar_file,nickname").get();
          let hasJoined = false;
          if (currentUserId) {
            const joinRes = await common_vendor.nr.database().collection("activity_participants").where({
              user_id: currentUserId,
              activity_id: rawActivity._id
            }).get();
            common_vendor.index.__f__("log", "at pages/circle/activity-datail/activity-datail.vue:230", "参与记录", joinRes);
            hasJoined = joinRes.result.data.length > 0;
            common_vendor.index.__f__("log", "at pages/circle/activity-datail/activity-datail.vue:232", "参与状态", hasJoined);
          }
          this.activity = {
            ...rawActivity,
            date: new Date(rawActivity.activity_time),
            participants: rawActivity.attendee_count || 0,
            tagClass: this.getTagClass(rawActivity.category),
            avatar: ((_b = (_a = userRes.result.data[0]) == null ? void 0 : _a.avatar_file) == null ? void 0 : _b.url) || "/static/images/default-avatar.png",
            image: ((_c = rawActivity.files) == null ? void 0 : _c[0]) || "/static/images/activity-default.png",
            publisher: ((_d = userRes.result.data[0]) == null ? void 0 : _d.nickname) || "匿名发布者",
            formattedDate: this.formatDate(rawActivity.create_time),
            hasJoined
            // 添加参与状态
          };
        } else {
          common_vendor.index.showToast({
            title: "活动不存在",
            icon: "none"
          });
          common_vendor.index.navigateBack();
        }
      } catch (err) {
        common_vendor.index.__f__("error", "at pages/circle/activity-datail/activity-datail.vue:254", "加载活动详情失败", err);
        common_vendor.index.showToast({
          title: "加载失败，请重试",
          icon: "none"
        });
      }
    },
    //标签类名映射方法
    getTagClass(category) {
      const tagMap = {
        官方: "official",
        社团: "club",
        学术: "academic",
        娱乐: "entertainment",
        体育: "sports"
      };
      return tagMap[category] || "";
    },
    // 状态判断方法
    // 状态文本映射方法（修改核心逻辑）
    getStatusText(item) {
      const currentTime = (/* @__PURE__ */ new Date()).getTime();
      const activityTime = item.date.getTime();
      if (currentTime < activityTime) {
        return "即将开始";
      } else {
        return "已结束";
      }
    },
    // 参与权限判断
    canJoin(item) {
      const currentTime = (/* @__PURE__ */ new Date()).getTime();
      const activityTime = item.date.getTime();
      return currentTime < activityTime;
    },
    // 参与活动（关键修改）
    async joinActivity(item) {
      common_vendor.index.__f__("log", "at pages/circle/activity-datail/activity-datail.vue:293", "参与活动", item);
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
            activityId: this.activity._id,
            token
          }
        });
        if (res.result.success) {
          const userInfo = common_vendor.index.getStorageSync("uni-id-pages-userInfo");
          await common_vendor.nr.database().collection("user-score").add({
            user_id: userInfo._id,
            score: 10,
            type: "activity_join",
            description: "参与活动奖励",
            related_id: this.activity._id,
            create_time: Date.now()
          });
          common_vendor.index.showToast({
            title: "参与成功 +10分",
            icon: "success",
            duration: 2e3
          });
          await this.loadActivityDetail();
          const pages = getCurrentPages();
          if (pages.length > 1) {
            const prevPage = pages[pages.length - 2];
            if (prevPage.onRefresh)
              prevPage.onRefresh();
          }
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
        common_vendor.index.__f__("error", "at pages/circle/activity-datail/activity-datail.vue:370", "参与活动失败", err);
        common_vendor.index.showToast({
          title: "参与失败，请稍后重试",
          icon: "none"
        });
      }
    },
    getStatusClass(item) {
      const currentTime = (/* @__PURE__ */ new Date()).getTime();
      const activityTime = item.date.getTime();
      return currentTime < activityTime ? "status-upcoming" : "status-ended";
    },
    // 日期格式化优化
    formatDate(ts) {
      const date = new Date(ts);
      const year = date.getFullYear();
      const month = (date.getMonth() + 1).toString().padStart(2, "0");
      const day = date.getDate().toString().padStart(2, "0");
      const hours = date.getHours().toString().padStart(2, "0");
      const minutes = date.getMinutes().toString().padStart(2, "0");
      return `${year}-${month}-${day} ${hours}:${minutes}`;
    },
    // 详情页支持外部刷新
    onRefresh() {
      this.loadActivityDetail();
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: $data.activity._id
  }, $data.activity._id ? common_vendor.e({
    b: $data.activity.image,
    c: common_vendor.t($options.getStatusText($data.activity)),
    d: common_vendor.n($options.getStatusClass($data.activity)),
    e: $data.coverShow ? 1 : "",
    f: common_vendor.t($data.activity.tag),
    g: common_vendor.n($data.activity.tagClass),
    h: common_vendor.t($data.activity.title),
    i: common_vendor.t($options.formatDate($data.activity.date)),
    j: common_vendor.t($data.activity.time),
    k: common_vendor.t($data.activity.location),
    l: common_vendor.t($data.activity.participants),
    m: $data.activity.content || "暂无详细描述",
    n: $data.activity.avatars && $data.activity.avatars.length > 0
  }, $data.activity.avatars && $data.activity.avatars.length > 0 ? common_vendor.e({
    o: common_vendor.f($data.activity.avatars, (avatar, index, i0) => {
      return {
        a: index,
        b: avatar
      };
    }),
    p: $data.activity.participants > $data.activity.avatars.length
  }, $data.activity.participants > $data.activity.avatars.length ? {
    q: common_vendor.t($data.activity.participants - $data.activity.avatars.length)
  } : {}) : {}, {
    r: common_vendor.f($data.relatedActivities, (item, index, i0) => {
      return {
        a: item.image,
        b: common_vendor.t(item.title),
        c: common_vendor.t($options.formatDate(item.date)),
        d: index,
        e: common_vendor.o(($event) => _ctx.viewRelatedActivity(item), index)
      };
    }),
    s: $data.isCurrentUser
  }, $data.isCurrentUser ? {
    t: common_vendor.o((...args) => $options.editActivity && $options.editActivity(...args))
  } : {
    v: common_vendor.o((...args) => $options.viewOrganizer && $options.viewOrganizer(...args))
  }, {
    w: $options.canJoin($data.activity)
  }, $options.canJoin($data.activity) ? {
    x: common_vendor.t($data.activity.hasJoined ? "已参与" : "立即参与"),
    y: $data.activity.hasJoined ? 1 : "",
    z: common_vendor.o((...args) => $options.joinActivity && $options.joinActivity(...args))
  } : {
    A: common_vendor.t($data.activity.status === "ended" ? "已结束" : "已参与")
  }) : {});
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../../.sourcemap/mp-weixin/pages/circle/activity-datail/activity-datail.js.map
