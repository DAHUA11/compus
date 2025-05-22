"use strict";
const common_vendor = require("../../../common/vendor.js");
const _sfc_main = {
  data() {
    return {
      refreshing: false,
      loading: false,
      noMore: false,
      activeDate: 0,
      activeFilter: 0,
      page: 1,
      dates: this.generateDates(),
      filters: [
        { name: "全部" },
        { name: "官方" },
        { name: "社团" },
        { name: "学术" },
        { name: "娱乐" },
        { name: "体育" }
      ],
      activities: [],
      dateAniShow: false,
      filterAniShow: false,
      cardAniShow: false
    };
  },
  onLoad(options) {
    if (options.filter) {
      const index = this.filters.findIndex((f) => f.name === options.filter);
      if (index !== -1) {
        this.activeFilter = index;
      }
    }
    this.fetchActivities();
  },
  mounted() {
    setTimeout(() => {
      this.dateAniShow = true;
      this.filterAniShow = true;
      this.cardAniShow = true;
    }, 100);
  },
  methods: {
    // 生成日期数据
    generateDates() {
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
      if (this.activeDate === index)
        return;
      this.activeDate = index;
      this.onRefresh();
    },
    // 切换筛选条件
    switchFilter(index) {
      if (this.activeFilter === index)
        return;
      this.activeFilter = index;
      this.onRefresh();
    },
    // 下拉刷新
    onRefresh() {
      if (this.refreshing)
        return;
      this.refreshing = true;
      this.page = 1;
      this.noMore = false;
      this.fetchActivities();
    },
    // 上拉加载更多
    onLoadMore() {
      if (this.loading || this.noMore)
        return;
      this.page++;
      this.fetchActivities(true);
    },
    // 获取活动数据
    fetchActivities(isLoadMore = false) {
      if (isLoadMore) {
        this.loading = true;
      }
      setTimeout(() => {
        if (!isLoadMore) {
          this.activities = this.generateMockActivities();
        } else {
          if (this.page >= 3) {
            this.noMore = true;
          } else {
            this.activities = [...this.activities, ...this.generateMockActivities(this.page)];
          }
        }
        this.refreshing = false;
        this.loading = false;
      }, 800);
    },
    // 生成模拟活动数据
    generateMockActivities(page = 1) {
      const mockActivities = [];
      const tags = ["官方", "社团", "学术", "娱乐", "体育"];
      const tagClasses = ["official", "club", "academic", "entertainment", "sports"];
      const locations = ["学校体育馆", "图书馆", "学生活动中心", "教学楼A区", "校园广场"];
      const statuses = ["upcoming", "ongoing", "ended"];
      const selectedDate = new Date(this.dates[this.activeDate].date);
      for (let i = 0; i < 5; i++) {
        const date = new Date(selectedDate);
        date.setHours(date.getHours() + Math.floor(Math.random() * 8));
        const tagIndex = Math.floor(Math.random() * tags.length);
        const filterName = this.filters[this.activeFilter].name;
        const useTagIndex = filterName === "全部" ? tagIndex : tags.indexOf(filterName);
        mockActivities.push({
          id: (page - 1) * 5 + i + 1,
          title: `${tags[useTagIndex === -1 ? tagIndex : useTagIndex]}活动${(page - 1) * 5 + i + 1}`,
          image: `/static/images/activity${i % 2 + 1}.png`,
          date,
          time: `${date.getHours()}:${date.getMinutes().toString().padStart(2, "0")}`,
          location: locations[Math.floor(Math.random() * locations.length)],
          participants: Math.floor(Math.random() * 200) + 10,
          tag: tags[useTagIndex === -1 ? tagIndex : useTagIndex],
          tagClass: tagClasses[useTagIndex === -1 ? tagIndex : useTagIndex],
          status: statuses[Math.floor(Math.random() * statuses.length)]
        });
      }
      return mockActivities;
    },
    // 格式化月份
    formatMonth(date) {
      const months = ["一月", "二月", "三月", "四月", "五月", "六月", "七月", "八月", "九月", "十月", "十一月", "十二月"];
      return months[date.getMonth()];
    },
    // 格式化日期
    formatDay(date) {
      return date.getDate().toString().padStart(2, "0");
    },
    // 获取状态类名
    getStatusClass(item) {
      return item.status;
    },
    // 获取状态文本
    getStatusText(item) {
      const statusMap = {
        "upcoming": "即将开始",
        "ongoing": "进行中",
        "ended": "已结束"
      };
      return statusMap[item.status] || "未知状态";
    },
    // 是否可以参与
    canJoin(item) {
      return item.status === "upcoming" || item.status === "ongoing";
    },
    // 查看活动详情
    viewDetail(item) {
      common_vendor.index.__f__("log", "at pages/circle/activities/activities.vue:292", "查看活动详情:", item);
      common_vendor.index.navigateTo({
        url: "/pages/circle/activity-datail/activity-datail?id=" + item.id
      });
    },
    // 参与活动
    joinActivity(item) {
      common_vendor.index.__f__("log", "at pages/circle/activities/activities.vue:300", "参与活动:", item);
      common_vendor.index.showToast({
        title: "已报名参与：" + item.title,
        icon: "success"
      });
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
