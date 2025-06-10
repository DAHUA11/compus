"use strict";
const common_vendor = require("../../../common/vendor.js");
const _sfc_main = {
  data() {
    common_vendor.index.__f__("log", "at pages/circle/activities/activities.vue:86", "data初始化");
    return {
      refreshing: false,
      loading: false,
      noMore: false,
      activeDate: 0,
      activeFilter: 0,
      page: 1,
      dates: this.generateDates(),
      // 新增：存储当前选中的日期对象（精确到天）
      selectedDate: null,
      filters: [
        {
          name: "全部"
        },
        {
          name: "官方"
        },
        {
          name: "社团"
        },
        {
          name: "学术"
        },
        {
          name: "娱乐"
        },
        {
          name: "体育"
        }
      ],
      activities: [],
      dateAniShow: false,
      filterAniShow: false,
      cardAniShow: false
    };
  },
  onLoad(options) {
    common_vendor.index.__f__("log", "at pages/circle/activities/activities.vue:123", "onLoad执行", options);
    this.selectedDate = this.dates[0].date;
    this.fetchActivities();
  },
  mounted() {
    common_vendor.index.__f__("log", "at pages/circle/activities/activities.vue:130", "mounted执行");
    setTimeout(() => {
      this.dateAniShow = true;
      this.filterAniShow = true;
      this.cardAniShow = true;
    }, 100);
  },
  methods: {
    // 生成日期数据
    generateDates() {
      common_vendor.index.__f__("log", "at pages/circle/activities/activities.vue:140", "generateDates执行");
      const dates = [];
      const weekdays = ["日", "一", "二", "三", "四", "五", "六"];
      const now = /* @__PURE__ */ new Date();
      for (let i = 0; i < 14; i++) {
        const date = /* @__PURE__ */ new Date();
        date.setDate(now.getDate() + i);
        dates.push({
          day: date.getDate(),
          weekday: weekdays[date.getDay()],
          date,
          hasEvents: Math.random() > 0.5
          // 模拟是否有活动
        });
      }
      return dates;
    },
    // 切换日期
    switchDate(index) {
      common_vendor.index.__f__("log", "at pages/circle/activities/activities.vue:162", "switchDate执行", index);
      if (this.activeDate === index)
        return;
      this.activeDate = index;
      this.selectedDate = this.dates[index].date;
      this.onRefresh();
    },
    // 切换筛选条件
    switchFilter(index) {
      common_vendor.index.__f__("log", "at pages/circle/activities/activities.vue:173", "switchFilter执行", index);
      if (this.activeFilter === index)
        return;
      this.activeFilter = index;
      this.onRefresh();
    },
    // 下拉刷新
    onRefresh() {
      common_vendor.index.__f__("log", "at pages/circle/activities/activities.vue:182", "onRefresh执行");
      if (this.refreshing)
        return;
      this.refreshing = true;
      this.page = 1;
      this.noMore = false;
      this.fetchActivities();
    },
    // 上拉加载更多
    onLoadMore() {
      common_vendor.index.__f__("log", "at pages/circle/activities/activities.vue:193", "onLoadMore执行");
      if (this.loading || this.noMore)
        return;
      this.page++;
      this.fetchActivities(true);
    },
    // 获取活动数据
    async fetchActivities(isLoadMore = false) {
      common_vendor.index.__f__("log", "at pages/circle/activities/activities.vue:202", "fetchActivities开始执行", {
        isLoadMore,
        page: this.page
      });
      if (isLoadMore)
        this.loading = true;
      try {
        const where = {
          content_type: "activity"
        };
        const startOfDay = new Date(this.selectedDate);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(this.selectedDate);
        endOfDay.setHours(23, 59, 59, 999);
        where.activity_time = {
          $gte: startOfDay.getTime(),
          // 大于等于当天0点
          $lte: endOfDay.getTime()
          // 小于等于当天23:59:59.999
        };
        if (this.activeFilter !== 0) {
          where.category = this.filters[this.activeFilter].name;
        }
        common_vendor.index.__f__("log", "at pages/circle/activities/activities.vue:229", "查询条件:", where);
        const res = await common_vendor.nr.database().collection("add-content").where(where).orderBy("activity_time", "desc").skip((this.page - 1) * 5).limit(5).get();
        common_vendor.index.__f__("log", "at pages/circle/activities/activities.vue:240", "数据库返回数据:", res.result.data);
        const rawActivities = res.result.data || [];
        const formattedActivities = rawActivities.map((item) => {
          var _a;
          return {
            id: item._id,
            title: item.title,
            image: ((_a = item.files) == null ? void 0 : _a[0]) || "/static/images/activity-default.png",
            date: new Date(item.activity_time),
            time: this.formatTime(item.activity_time),
            location: item.location,
            participants: item.attendee_count || 0,
            tag: item.category,
            tagClass: this.getTagClass(item.category),
            status: this.getStatus(item.activity_time)
          };
        });
        common_vendor.index.__f__("log", "at pages/circle/activities/activities.vue:257", "格式化后的数据:", formattedActivities);
        if (!isLoadMore) {
          this.activities = formattedActivities;
        } else {
          this.activities = [...this.activities, ...formattedActivities];
        }
        this.noMore = rawActivities.length < 5;
      } catch (err) {
        common_vendor.index.__f__("error", "at pages/circle/activities/activities.vue:268", "获取活动失败", err);
        common_vendor.index.showToast({
          title: "加载失败",
          icon: "none"
        });
      } finally {
        this.refreshing = false;
        this.loading = false;
      }
    },
    // 新增：时间格式化方法（提取时分）
    formatTime(timestamp) {
      const date = new Date(timestamp);
      return `${date.getHours().toString().padStart(2, "0")}:${date.getMinutes().toString().padStart(2, "0")}`;
    },
    //月份格式化方法（输出如"05月"）
    formatMonth(date) {
      const month = (date.getMonth() + 1).toString().padStart(2, "0");
      return `${month}月`;
    },
    // 新增：日期格式化方法（输出如"05"）
    formatDay(date) {
      return date.getDate().toString().padStart(2, "0");
    },
    getStatusClass(item) {
      return item.status;
    },
    // 新增：状态文本转换方法（将状态标识转为中文）
    getStatusText(item) {
      const status = item.status;
      switch (status) {
        case "upcoming":
          return "未开始";
        case "ongoing":
          return "进行中";
        case "ended":
          return "已结束";
        default:
          return "未知状态";
      }
    },
    // 判断活动是否可以参与
    canJoin(item) {
      if (item.status === "ended")
        return false;
      return true;
    },
    // 查看活动详情
    viewDetail(item) {
      common_vendor.index.__f__("log", "at pages/circle/activities/activities.vue:320", "查看活动详情", item);
      common_vendor.index.navigateTo({
        url: `/pages/circle/activity-datail/activity-datail?id=${item.id}`
      });
    },
    // 参与活动（关键修改）
    async joinActivity(item) {
      common_vendor.index.__f__("log", "at pages/circle/activities/activities.vue:328", "参与活动", item);
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
            activityId: item.id,
            token
          }
        });
        if (res.result.success) {
          common_vendor.index.showToast({ title: "参与成功", icon: "success" });
          this.onRefresh();
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
        common_vendor.index.__f__("error", "at pages/circle/activities/activities.vue:383", "参与活动失败", err);
        common_vendor.index.showToast({ title: "参与失败，请稍后重试", icon: "none" });
      }
    },
    // 标签类名映射（与addactivities.vue保持一致）
    getTagClass(category) {
      const tagMap = {
        "官方": "official",
        "社团": "club",
        "学术": "academic",
        "娱乐": "entertainment",
        "体育": "sports"
      };
      return tagMap[category] || "";
    },
    // 状态计算（根据活动时间和当前时间）
    getStatus(activityTime) {
      const now = (/* @__PURE__ */ new Date()).getTime();
      if (activityTime > now)
        return "upcoming";
      if (activityTime <= now && activityTime + 864e5 > now)
        return "ongoing";
      return "ended";
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: common_vendor.f($data.dates, (date, index, i0) => {
      return common_vendor.e({
        a: common_vendor.t(date.day),
        b: common_vendor.t(date.weekday),
        c: date.hasEvents
      }, date.hasEvents ? {} : {}, {
        d: index,
        e: $data.activeDate === index ? 1 : "",
        f: common_vendor.o(($event) => $options.switchDate(index), index)
      });
    }),
    b: common_vendor.f($data.filters, (filter, index, i0) => {
      return {
        a: common_vendor.t(filter.name),
        b: index,
        c: $data.activeFilter === index ? 1 : "",
        d: common_vendor.o(($event) => $options.switchFilter(index), index)
      };
    }),
    c: common_vendor.f($data.activities, (item, index, i0) => {
      return common_vendor.e({
        a: common_vendor.t($options.formatMonth(item.date)),
        b: common_vendor.t($options.formatDay(item.date)),
        c: item.image,
        d: common_vendor.t(item.title),
        e: common_vendor.t(item.time),
        f: common_vendor.t(item.location),
        g: common_vendor.t(item.participants),
        h: common_vendor.t(item.tag),
        i: common_vendor.n(item.tagClass),
        j: common_vendor.t($options.getStatusText(item)),
        k: common_vendor.n($options.getStatusClass(item)),
        l: common_vendor.o(($event) => $options.viewDetail(item), index),
        m: $options.canJoin(item)
      }, $options.canJoin(item) ? {
        n: common_vendor.o(($event) => $options.joinActivity(item), index)
      } : {}, {
        o: index
      });
    }),
    d: $data.loading
  }, $data.loading ? {} : {}, {
    e: $data.activities.length === 0 && !$data.loading
  }, $data.activities.length === 0 && !$data.loading ? {
    f: common_vendor.o((...args) => $options.onRefresh && $options.onRefresh(...args))
  } : {}, {
    g: $data.noMore && $data.activities.length > 0 && !$data.loading
  }, $data.noMore && $data.activities.length > 0 && !$data.loading ? {} : {}, {
    h: $data.refreshing,
    i: common_vendor.o((...args) => $options.onRefresh && $options.onRefresh(...args)),
    j: common_vendor.o((...args) => $options.onLoadMore && $options.onLoadMore(...args))
  });
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../../.sourcemap/mp-weixin/pages/circle/activities/activities.js.map
