"use strict";
const common_vendor = require("../../../common/vendor.js");
const _sfc_main = {
  __name: "TaskChat",
  setup(__props) {
    const notifications = common_vendor.ref([
      // 官方通知
      { text: "官方通知：近期有新的社区活动即将开启，请留意公告。", read: false, time: Date.now() - 1 * 60 * 60 * 1e3, category: "official" },
      { text: "官方通知：平台规则已更新，请查看最新版。", read: false, time: Date.now() - 3 * 60 * 60 * 1e3, category: "official" },
      // 发布者消息
      { text: "您的求购水杯任务已被用户TestClaimer领取。", read: false, time: Date.now() - 5 * 60 * 60 * 1e3, category: "publisher", subtype: "claimed" },
      { text: "您发布的快递代取任务已完成。", read: true, time: Date.now() - 7 * 60 * 60 * 1e3, category: "publisher", subtype: "completed" },
      // 领取者消息
      { text: "您领取的跑腿任务将在5分钟后到期，请尽快完成。", read: false, time: Date.now() - 10 * 60 * 1e3, category: "claimer", subtype: "nearing_expiry" },
      { text: "您完成的求购书籍任务已被发布者评价。", read: true, time: Date.now() - 9 * 60 * 60 * 1e3, category: "claimer", subtype: "reviewed" }
    ]);
    const interactions = common_vendor.ref([
      // 评论互动
      {
        content: "用户TestUser评论了您的任务：这个任务描述很清晰，希望能尽快完成！",
        read: false,
        time: Date.now() - 2 * 60 * 60 * 1e3,
        category: "comment",
        avatar: "/static/avatar1.png"
      },
      {
        content: "用户TestUser2回复了您的评论：谢谢您的建议，我会尽快处理。",
        read: true,
        time: Date.now() - 4 * 60 * 60 * 1e3,
        category: "reply",
        avatar: "/static/avatar2.png"
      },
      // 点赞互动
      {
        content: "用户TestUser3赞了您的任务发布",
        read: false,
        time: Date.now() - 6 * 60 * 60 * 1e3,
        category: "like",
        avatar: "/static/avatar3.png"
      }
    ]);
    const recommendations = common_vendor.ref([
      {
        text: '根据您的兴趣，推荐查看"校园跑腿"相关任务',
        read: false,
        time: Date.now() - 8 * 60 * 60 * 1e3,
        category: "task_recommendation"
      },
      {
        text: "您可能感兴趣的新活动：校园二手交易节",
        read: true,
        time: Date.now() - 12 * 60 * 60 * 1e3,
        category: "activity_recommendation"
      }
    ]);
    const reviews = common_vendor.ref([
      {
        text: "您的快递代取任务已完成，请对服务进行评价",
        read: false,
        time: Date.now() - 15 * 60 * 1e3,
        category: "delivery_review"
      },
      {
        text: "您的求购任务已完成，请对商品进行评价",
        read: true,
        time: Date.now() - 2 * 60 * 60 * 1e3,
        category: "purchase_review"
      }
    ]);
    const searchQuery = common_vendor.ref("");
    const searchHistory = common_vendor.ref([]);
    const loading = common_vendor.ref(false);
    const noMore = common_vendor.ref(false);
    const expandedSections = common_vendor.ref({
      notifications: true,
      interactions: true,
      recommendations: true,
      reviews: true
    });
    const unreadNotificationCount = common_vendor.computed(() => {
      return notifications.value.filter((n) => !n.read).length;
    });
    const unreadInteractionCount = common_vendor.computed(() => {
      return interactions.value.filter((i) => !i.read).length;
    });
    const unreadRecommendationCount = common_vendor.computed(() => {
      return recommendations.value.filter((r) => !r.read).length;
    });
    const unreadReviewCount = common_vendor.computed(() => {
      return reviews.value.filter((r) => !r.read).length;
    });
    const displayedNotifications = common_vendor.computed(() => {
      if (!expandedSections.value.notifications)
        return [];
      return notifications.value;
    });
    const displayedInteractions = common_vendor.computed(() => {
      if (!expandedSections.value.interactions)
        return [];
      return interactions.value;
    });
    const displayedRecommendations = common_vendor.computed(() => {
      if (!expandedSections.value.recommendations)
        return [];
      return recommendations.value;
    });
    const displayedReviews = common_vendor.computed(() => {
      if (!expandedSections.value.reviews)
        return [];
      return reviews.value;
    });
    const handleSearch = () => {
      common_vendor.index.__f__("log", "at pages/task/TaskChat/TaskChat.vue:309", "搜索:", searchQuery.value);
    };
    const clearUnread = () => {
      notifications.value.forEach((n) => n.read = true);
      interactions.value.forEach((i) => i.read = true);
      recommendations.value.forEach((r) => r.read = true);
      reviews.value.forEach((r) => r.read = true);
    };
    const toggleNotifications = () => {
      expandedSections.value.notifications = !expandedSections.value.notifications;
    };
    const toggleInteractions = () => {
      expandedSections.value.interactions = !expandedSections.value.interactions;
    };
    const toggleRecommendations = () => {
      expandedSections.value.recommendations = !expandedSections.value.recommendations;
    };
    const toggleReviews = () => {
      expandedSections.value.reviews = !expandedSections.value.reviews;
    };
    const readNotification = (notification) => {
      notification.read = true;
    };
    const readInteraction = (interaction) => {
      interaction.read = true;
    };
    const navigateToRecommendation = (recommendation) => {
      common_vendor.index.__f__("log", "at pages/task/TaskChat/TaskChat.vue:345", "导航到推荐:", recommendation);
    };
    const navigateToReview = (review) => {
      common_vendor.index.__f__("log", "at pages/task/TaskChat/TaskChat.vue:350", "导航到评价:", review);
    };
    const showMessageActions = (message, event) => {
      common_vendor.index.__f__("log", "at pages/task/TaskChat/TaskChat.vue:355", "显示消息操作:", message);
    };
    const messageItemClass = (message) => {
      return {
        "unread": !message.read,
        "pinned": message.pinned
      };
    };
    const groupMessagesByDate = (messages) => {
      const groups = {};
      messages.forEach((message) => {
        const date = new Date(message.time).toLocaleDateString();
        if (!groups[date]) {
          groups[date] = [];
        }
        groups[date].push(message);
      });
      return groups;
    };
    const formatTime = (timestamp) => {
      const date = new Date(timestamp);
      return date.toLocaleTimeString();
    };
    common_vendor.onLoad(() => {
      common_vendor.index.__f__("log", "at pages/task/TaskChat/TaskChat.vue:384", "页面加载");
    });
    common_vendor.onShow(() => {
      common_vendor.index.__f__("log", "at pages/task/TaskChat/TaskChat.vue:388", "页面显示");
    });
    common_vendor.onUnload(() => {
      common_vendor.index.__f__("log", "at pages/task/TaskChat/TaskChat.vue:392", "页面卸载");
    });
    common_vendor.onPullDownRefresh(() => {
      common_vendor.index.__f__("log", "at pages/task/TaskChat/TaskChat.vue:396", "下拉刷新");
      setTimeout(() => {
        common_vendor.index.stopPullDownRefresh();
      }, 1e3);
    });
    common_vendor.onReachBottom(() => {
      common_vendor.index.__f__("log", "at pages/task/TaskChat/TaskChat.vue:403", "触底加载更多");
      if (!noMore.value) {
        loading.value = true;
        setTimeout(() => {
          loading.value = false;
          noMore.value = true;
        }, 1e3);
      }
    });
    onScroll((e) => {
      common_vendor.index.__f__("log", "at pages/task/TaskChat/TaskChat.vue:414", "滚动事件:", e);
    });
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_vendor.o(clearUnread),
        b: common_vendor.o([($event) => searchQuery.value = $event.detail.value, handleSearch]),
        c: searchQuery.value,
        d: searchHistory.value.length > 0
      }, searchHistory.value.length > 0 ? {
        e: common_vendor.f(searchHistory.value, (item, index, i0) => {
          return {
            a: common_vendor.t(item),
            b: common_vendor.o(($event) => searchHistory.value.splice(index, 1), index),
            c: index,
            d: common_vendor.o(($event) => searchQuery.value = item, index)
          };
        })
      } : {}, {
        f: unreadNotificationCount.value > 0
      }, unreadNotificationCount.value > 0 ? {
        g: common_vendor.t(unreadNotificationCount.value)
      } : {}, {
        h: common_vendor.o(toggleNotifications),
        i: common_vendor.f(groupMessagesByDate(displayedNotifications.value), (group, date, i0) => {
          return {
            a: common_vendor.f(group, (notification, index, i1) => {
              return common_vendor.e({
                a: notification.pinned
              }, notification.pinned ? {} : {}, {
                b: common_vendor.t(notification.text),
                c: index,
                d: common_vendor.n(messageItemClass(notification)),
                e: common_vendor.o(($event) => readNotification(notification), index),
                f: common_vendor.o(($event) => showMessageActions(notification), index)
              });
            }),
            b: date
          };
        }),
        j: displayedNotifications.value.length === 0 && _ctx.filteredNotifications.length === 0
      }, displayedNotifications.value.length === 0 && _ctx.filteredNotifications.length === 0 ? {} : {}, {
        k: unreadInteractionCount.value > 0
      }, unreadInteractionCount.value > 0 ? {
        l: common_vendor.t(unreadInteractionCount.value)
      } : {}, {
        m: common_vendor.o(toggleInteractions),
        n: common_vendor.f(groupMessagesByDate(displayedInteractions.value), (group, date, i0) => {
          return {
            a: common_vendor.f(group, (interaction, index, i1) => {
              return common_vendor.e({
                a: interaction.pinned
              }, interaction.pinned ? {} : {}, {
                b: interaction.avatar || "/static/default-avatar.png",
                c: common_vendor.t(interaction.content),
                d: index,
                e: common_vendor.n(messageItemClass(interaction)),
                f: common_vendor.o(($event) => readInteraction(interaction), index),
                g: common_vendor.o(($event) => showMessageActions(interaction), index)
              });
            }),
            b: date
          };
        }),
        o: displayedInteractions.value.length === 0 && _ctx.filteredInteractions.length === 0
      }, displayedInteractions.value.length === 0 && _ctx.filteredInteractions.length === 0 ? {} : {}, {
        p: unreadRecommendationCount.value > 0
      }, unreadRecommendationCount.value > 0 ? {
        q: common_vendor.t(unreadRecommendationCount.value)
      } : {}, {
        r: common_vendor.o(toggleRecommendations),
        s: common_vendor.f(groupMessagesByDate(displayedRecommendations.value), (group, date, i0) => {
          return {
            a: common_vendor.f(group, (recommendation, index, i1) => {
              return common_vendor.e({
                a: recommendation.pinned
              }, recommendation.pinned ? {} : {}, {
                b: common_vendor.t(recommendation.text),
                c: common_vendor.t(formatTime(recommendation.time)),
                d: index,
                e: common_vendor.n(messageItemClass(recommendation)),
                f: common_vendor.o(($event) => navigateToRecommendation(recommendation), index),
                g: common_vendor.o(($event) => showMessageActions(recommendation), index)
              });
            }),
            b: date
          };
        }),
        t: displayedRecommendations.value.length === 0 && _ctx.filteredRecommendations.length === 0
      }, displayedRecommendations.value.length === 0 && _ctx.filteredRecommendations.length === 0 ? {} : {}, {
        v: unreadReviewCount.value > 0
      }, unreadReviewCount.value > 0 ? {
        w: common_vendor.t(unreadReviewCount.value)
      } : {}, {
        x: common_vendor.o(toggleReviews),
        y: common_vendor.f(groupMessagesByDate(displayedReviews.value), (group, date, i0) => {
          return {
            a: common_vendor.f(group, (review, index, i1) => {
              return common_vendor.e({
                a: review.pinned
              }, review.pinned ? {} : {}, {
                b: common_vendor.t(review.text),
                c: common_vendor.t(formatTime(review.time)),
                d: index,
                e: common_vendor.n(messageItemClass(review)),
                f: common_vendor.o(($event) => navigateToReview(review), index),
                g: common_vendor.o(($event) => showMessageActions(review), index)
              });
            }),
            b: date
          };
        }),
        z: displayedReviews.value.length === 0 && _ctx.filteredReviews.length === 0
      }, displayedReviews.value.length === 0 && _ctx.filteredReviews.length === 0 ? {} : {}, {
        A: loading.value
      }, loading.value ? {
        B: common_vendor.f(3, (i, k0, i0) => {
          return {
            a: i
          };
        })
      } : {}, {
        C: noMore.value
      }, noMore.value ? {} : {}, {
        D: common_vendor.o((...args) => common_vendor.unref(common_vendor.onPullDownRefresh) && common_vendor.unref(common_vendor.onPullDownRefresh)(...args)),
        E: common_vendor.o((...args) => common_vendor.unref(common_vendor.onReachBottom) && common_vendor.unref(common_vendor.onReachBottom)(...args)),
        F: common_vendor.o((...args) => _ctx.onScroll && _ctx.onScroll(...args))
      });
    };
  }
};
wx.createPage(_sfc_main);
//# sourceMappingURL=../../../../.sourcemap/mp-weixin/pages/task/TaskChat/TaskChat.js.map
