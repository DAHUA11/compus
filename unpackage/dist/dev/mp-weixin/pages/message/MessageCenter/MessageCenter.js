"use strict";
const common_vendor = require("../../../common/vendor.js");
const common_assets = require("../../../common/assets.js");
const _sfc_main = {
  setup() {
    const notificationMessage = common_vendor.ref({
      prompt: "您有待使用的权益即将到期，点击查看",
      // 例如优惠券、积分等
      hasUnread: true,
      jumpUrl: "/pages/BenefitsCenter/BenefitsCenter"
      // 假设有权益中心页面
    });
    const interactionMessages = common_vendor.ref([]);
    const interactionUnreadCount = common_vendor.ref(0);
    const interactionLoading = common_vendor.ref(false);
    const hasMoreInteractions = common_vendor.ref(true);
    const interactionPage = common_vendor.ref(1);
    const selectionMessage = common_vendor.ref({
      prompt: "发现更多宝贝，上闲鱼精选！",
      hasUnread: false,
      jumpUrl: "/pages/SelectionPage/SelectionPage"
      // 假设有精选页面
    });
    const reviewPrompts = common_vendor.ref([]);
    const loadInteractionMessages = async (isRefresh = false) => {
      common_vendor.index.__f__("log", "at pages/message/MessageCenter/MessageCenter.vue:127", "loadInteractionMessages called, isRefresh:", isRefresh);
      if (interactionLoading.value)
        return;
      interactionLoading.value = true;
      if (isRefresh) {
        interactionPage.value = 1;
        hasMoreInteractions.value = true;
      }
      if (!hasMoreInteractions.value && !isRefresh) {
        interactionLoading.value = false;
        return;
      }
      await new Promise((resolve) => setTimeout(resolve, 800));
      const mockMessages = [
        { id: 1, type: "reply", snippet: "回复了您的评论...", isRead: false, time: Date.now(), jumpUrl: "/pages/TaskDetail/TaskDetail?id=task1#comment" },
        { id: 2, type: "like", snippet: "点赞了您的商品...", isRead: true, time: Date.now() - 6e4, jumpUrl: "/pages/GoodsDetail/GoodsDetail?id=goods1" },
        { id: 3, type: "follow", snippet: "关注了您...", isRead: false, time: Date.now() - 12e4, jumpUrl: "/pages/UserProfile/UserProfile?id=user1" },
        { id: 4, type: "reply", snippet: "回复了您的评论...", isRead: true, time: Date.now() - 18e4, jumpUrl: "/pages/TaskDetail/TaskDetail?id=task2#comment" },
        { id: 5, type: "like", snippet: "点赞了您的商品...", isRead: true, time: Date.now() - 24e4, jumpUrl: "/pages/GoodsDetail/GoodsDetail?id=goods2" }
      ];
      const pageSize = 4;
      const start = (interactionPage.value - 1) * pageSize;
      const end = start + pageSize;
      const list = mockMessages.slice(start, end);
      if (isRefresh) {
        interactionMessages.value = list;
      } else {
        interactionMessages.value = [...interactionMessages.value, ...list];
      }
      interactionUnreadCount.value = interactionMessages.value.filter((msg) => !msg.isRead).length;
      hasMoreInteractions.value = list.length === pageSize;
      if (hasMoreInteractions.value && !isRefresh) {
        interactionPage.value++;
      }
      interactionLoading.value = false;
      common_vendor.index.stopPullDownRefresh();
    };
    const loadReviewPrompts = async () => {
      common_vendor.index.__f__("log", "at pages/message/MessageCenter/MessageCenter.vue:175", "loadReviewPrompts called");
      await new Promise((resolve) => setTimeout(resolve, 500));
      reviewPrompts.value = [
        { id: 101, orderId: "order_001", text: "您的订单已完成，快去给TA一个评价吧！" },
        { id: 102, orderId: "order_002", text: "请对本次交易进行评价。" }
      ];
    };
    const formatTime = (time) => {
      const date = new Date(time);
      const now = /* @__PURE__ */ new Date();
      const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / 6e4);
      if (diffInMinutes < 1)
        return "刚刚";
      if (diffInMinutes < 60)
        return `${diffInMinutes}分钟前`;
      if (diffInMinutes < 24 * 60)
        return `${Math.floor(diffInMinutes / 60)}小时前`;
      if (diffInMinutes < 7 * 24 * 60)
        return `${Math.floor(diffInMinutes / (24 * 60))}天前`;
      return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, "0")}-${date.getDate().toString().padStart(2, "0")} ${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
    };
    const getInteractionIcon = (type) => {
      const iconMap = {
        reply: "&#x1F4AC;",
        // 对话气泡
        like: "&#x2764;",
        // 红心
        follow: "&#x1F464;"
        // 人物
      };
      return iconMap[type] || "&#x1F4C3;";
    };
    const getInteractionTitle = (type) => {
      const titleMap = {
        reply: "评论和回复",
        like: "赞和收藏",
        follow: "新增关注"
      };
      return titleMap[type] || "互动通知";
    };
    const goToSettings = () => {
      common_vendor.index.__f__("log", "at pages/message/MessageCenter/MessageCenter.vue:222", "Navigate to settings page");
    };
    const goToNotificationDetails = () => {
      common_vendor.index.__f__("log", "at pages/message/MessageCenter/MessageCenter.vue:228", "Navigate to notification details/benefits center", notificationMessage.value.jumpUrl);
      if (notificationMessage.value.jumpUrl)
        ;
    };
    const handleInteractionClick = (msg) => {
      common_vendor.index.__f__("log", "at pages/message/MessageCenter/MessageCenter.vue:236", "Handle interaction click", msg);
      msg.isRead = true;
      interactionUnreadCount.value = interactionMessages.value.filter((m) => !m.isRead).length;
      if (msg.jumpUrl)
        ;
    };
    const goToReview = (orderId) => {
      common_vendor.index.__f__("log", "at pages/message/MessageCenter/MessageCenter.vue:248", "Navigate to review page for order", orderId);
    };
    common_vendor.onPullDownRefresh(() => {
      common_vendor.index.__f__("log", "at pages/message/MessageCenter/MessageCenter.vue:254", "onPullDownRefresh triggered");
      loadInteractionMessages(true);
    });
    common_vendor.onReachBottom(() => {
      common_vendor.index.__f__("log", "at pages/message/MessageCenter/MessageCenter.vue:260", "onReachBottom triggered");
      loadInteractionMessages(false);
    });
    common_vendor.onMounted(() => {
      common_vendor.index.__f__("log", "at pages/message/MessageCenter/MessageCenter.vue:265", "MessageCenter onMounted");
    });
    common_vendor.onShow(() => {
      common_vendor.index.__f__("log", "at pages/message/MessageCenter/MessageCenter.vue:270", "MessageCenter onShow");
      loadInteractionMessages(true);
      loadReviewPrompts();
    });
    return {
      notificationMessage,
      interactionMessages,
      interactionUnreadCount,
      interactionLoading,
      hasMoreInteractions,
      selectionMessage,
      reviewPrompts,
      formatTime,
      getInteractionIcon,
      getInteractionTitle,
      goToSettings,
      goToNotificationDetails,
      handleInteractionClick,
      goToReview
    };
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: common_vendor.o((...args) => $setup.goToSettings && $setup.goToSettings(...args)),
    b: $setup.notificationMessage.prompt
  }, $setup.notificationMessage.prompt ? {
    c: common_vendor.t($setup.notificationMessage.prompt)
  } : {}, {
    d: $setup.notificationMessage.hasUnread
  }, $setup.notificationMessage.hasUnread ? {} : {}, {
    e: common_vendor.o((...args) => $setup.goToNotificationDetails && $setup.goToNotificationDetails(...args)),
    f: $setup.interactionUnreadCount > 0
  }, $setup.interactionUnreadCount > 0 ? {
    g: common_vendor.t($setup.interactionUnreadCount)
  } : {}, {
    h: $setup.interactionMessages.length === 0 && !$setup.interactionLoading
  }, $setup.interactionMessages.length === 0 && !$setup.interactionLoading ? {
    i: common_assets._imports_0$1
  } : {}, {
    j: common_vendor.f($setup.interactionMessages, (msg, k0, i0) => {
      return common_vendor.e({
        a: common_vendor.t($setup.getInteractionIcon(msg.type)),
        b: common_vendor.t($setup.getInteractionTitle(msg.type)),
        c: msg.isRead ? 1 : "",
        d: common_vendor.t(msg.snippet),
        e: common_vendor.t($setup.formatTime(msg.time)),
        f: !msg.isRead
      }, !msg.isRead ? {} : {}, {
        g: msg.id,
        h: common_vendor.o(($event) => $setup.handleInteractionClick(msg), msg.id)
      });
    }),
    k: $setup.interactionLoading
  }, $setup.interactionLoading ? {} : !$setup.hasMoreInteractions && $setup.interactionMessages.length > 0 ? {} : {}, {
    l: !$setup.hasMoreInteractions && $setup.interactionMessages.length > 0,
    m: common_vendor.t($setup.selectionMessage.prompt),
    n: $setup.selectionMessage.hasUnread
  }, $setup.selectionMessage.hasUnread ? {} : {}, {
    o: common_vendor.o((...args) => _ctx.goToSelectionPage && _ctx.goToSelectionPage(...args)),
    p: $setup.reviewPrompts.length > 0
  }, $setup.reviewPrompts.length > 0 ? {
    q: common_vendor.f($setup.reviewPrompts, (prompt, k0, i0) => {
      return {
        a: common_vendor.t(prompt.text),
        b: prompt.id,
        c: common_vendor.o(($event) => $setup.goToReview(prompt.orderId), prompt.id)
      };
    })
  } : {});
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-bad41071"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../../.sourcemap/mp-weixin/pages/message/MessageCenter/MessageCenter.js.map
