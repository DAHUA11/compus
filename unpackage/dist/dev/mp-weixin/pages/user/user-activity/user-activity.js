"use strict";
const common_vendor = require("../../../common/vendor.js");
const UserActivityCard = () => "../../../components/circle/UserActivityCard.js";
const _sfc_main = {
  components: {
    UserActivityCard
  },
  data() {
    return {
      currentTab: 0,
      publishedActivities: [],
      participatedActivities: [],
      isLoading: true,
      userInfo: null
    };
  },
  onLoad() {
    this.userInfo = common_vendor.index.getStorageSync("uni-id-pages-userInfo");
    if (this.userInfo && this.userInfo._id) {
      this.loadData();
    } else {
      common_vendor.index.showToast({
        title: "请先登录",
        icon: "none"
      });
      setTimeout(() => common_vendor.index.navigateBack(), 1500);
    }
  },
  methods: {
    switchTab(index) {
      if (this.currentTab !== index) {
        this.currentTab = index;
      }
    },
    swiperChange(e) {
      this.currentTab = e.detail.current;
    },
    async loadData() {
      this.isLoading = true;
      try {
        await Promise.all([
          this.fetchPublishedActivities(),
          this.fetchParticipatedActivities()
        ]);
      } catch (e) {
        common_vendor.index.__f__("error", "at pages/user/user-activity/user-activity.vue:100", "加载数据失败", e);
        common_vendor.index.showToast({
          title: "数据加载失败",
          icon: "none"
        });
      } finally {
        this.isLoading = false;
      }
    },
    async fetchPublishedActivities() {
      const db = common_vendor.nr.database();
      try {
        const res = await db.collection("add-content").where({
          user_id: this.userInfo._id,
          content_type: "activity"
        }).orderBy("create_time", "desc").get();
        this.publishedActivities = res.result.data.map((activity) => {
          return { ...activity, user_info: this.userInfo };
        });
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/user/user-activity/user-activity.vue:124", "获取已发布活动失败:", error);
      }
    },
    async fetchParticipatedActivities() {
      const db = common_vendor.nr.database();
      try {
        const participantsRes = await db.collection("activity_participants").where({ user_id: this.userInfo._id }).field("activity_id").get();
        if (participantsRes.result.data.length === 0) {
          this.participatedActivities = [];
          return;
        }
        const activityIds = participantsRes.result.data.map((item) => item.activity_id);
        const activitiesRes = await db.collection("add-content").where({
          _id: db.command.in(activityIds)
        }).orderBy("create_time", "desc").get();
        let activities = activitiesRes.result.data;
        if (activities.length === 0) {
          this.participatedActivities = activities;
          return;
        }
        const publisherIds = [...new Set(activities.map((act) => act.user_id))];
        const usersRes = await db.collection("uni-id-users").where({ _id: db.command.in(publisherIds) }).field("_id, nickname, avatar_file").get();
        const usersMap = new Map(usersRes.result.data.map((user) => [user._id, user]));
        this.participatedActivities = activities.map((activity) => {
          return {
            ...activity,
            user_info: usersMap.get(activity.user_id) || null
          };
        });
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/user/user-activity/user-activity.vue:178", "获取已参与活动失败:", error);
        this.participatedActivities = [];
      }
    },
    goToDetail(id) {
      common_vendor.index.navigateTo({
        url: `/pages/circle/activity-datail/activity-datail?id=${id}`
      });
    }
  }
};
if (!Array) {
  const _component_UserActivityCard = common_vendor.resolveComponent("UserActivityCard");
  const _easycom_uni_icons2 = common_vendor.resolveComponent("uni-icons");
  (_component_UserActivityCard + _easycom_uni_icons2)();
}
const _easycom_uni_icons = () => "../../../uni_modules/uni-icons/components/uni-icons/uni-icons.js";
if (!Math) {
  _easycom_uni_icons();
}
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: $data.currentTab === 0 ? 1 : "",
    b: common_vendor.o(($event) => $options.switchTab(0)),
    c: $data.currentTab === 1 ? 1 : "",
    d: common_vendor.o(($event) => $options.switchTab(1)),
    e: $data.publishedActivities.length > 0
  }, $data.publishedActivities.length > 0 ? {
    f: common_vendor.f($data.publishedActivities, (activity, k0, i0) => {
      return {
        a: activity._id,
        b: common_vendor.o(($event) => $options.goToDetail(activity._id), activity._id),
        c: "01e0c6e3-0-" + i0,
        d: common_vendor.p({
          activity
        })
      };
    })
  } : !$data.isLoading ? {
    h: common_vendor.p({
      type: "folder",
      size: "60",
      color: "#C8C9CC"
    })
  } : {
    i: common_vendor.f(3, (i, k0, i0) => {
      return {
        a: i,
        b: "01e0c6e3-2-" + i0
      };
    })
  }, {
    g: !$data.isLoading,
    j: $data.participatedActivities.length > 0
  }, $data.participatedActivities.length > 0 ? {
    k: common_vendor.f($data.participatedActivities, (activity, k0, i0) => {
      return {
        a: activity._id,
        b: common_vendor.o(($event) => $options.goToDetail(activity._id), activity._id),
        c: "01e0c6e3-3-" + i0,
        d: common_vendor.p({
          activity
        })
      };
    })
  } : !$data.isLoading ? {
    m: common_vendor.p({
      type: "paperplane",
      size: "60",
      color: "#C8C9CC"
    })
  } : {
    n: common_vendor.f(3, (i, k0, i0) => {
      return {
        a: i,
        b: "01e0c6e3-5-" + i0
      };
    })
  }, {
    l: !$data.isLoading,
    o: $data.currentTab,
    p: common_vendor.o((...args) => $options.swiperChange && $options.swiperChange(...args))
  });
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../../.sourcemap/mp-weixin/pages/user/user-activity/user-activity.js.map
