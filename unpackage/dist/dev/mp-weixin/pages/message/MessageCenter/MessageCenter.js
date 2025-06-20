"use strict";
const common_vendor = require("../../../common/vendor.js");
if (!Array) {
  const _easycom_uni_icons2 = common_vendor.resolveComponent("uni-icons");
  _easycom_uni_icons2();
}
const _easycom_uni_icons = () => "../../../uni_modules/uni-icons/components/uni-icons/uni-icons.js";
if (!Math) {
  _easycom_uni_icons();
}
const __default__ = {
  data() {
    return {
      activeButton: "private",
      // 默认显示私信模块
      loading: false,
      noMore: false,
      page: 1,
      pageSize: 10,
      functionButtons: [
        { type: "private", icon: "chat", text: "私信", badge: 3 },
        { type: "interaction", icon: "heart", text: "互动", badge: 5 },
        { type: "notification", icon: "notification", text: "通知", badge: 2 },
        { type: "recommend", icon: "star", text: "推荐", badge: 1 }
      ],
      // 互动消息（点赞、评论等）
      interactionMessages: [
        {
          id: "ia1",
          type: "like",
          avatar: "/static/avatars/user4.jpg",
          nickname: "校园同学",
          content: "点赞了您的任务发布",
          time: Date.now() - 1e3 * 60 * 60,
          // 1小时前
          read: false,
          unread: 1,
          postId: "post123"
        },
        {
          id: "ia2",
          type: "comment",
          avatar: "/static/avatars/user5.jpg",
          nickname: "热心校友",
          content: "评论了您的任务：这个任务描述很清晰，希望能尽快完成！",
          time: Date.now() - 1e3 * 60 * 60 * 3,
          // 3小时前
          read: false,
          unread: 1,
          postId: "post456"
        },
        {
          id: "ia3",
          type: "reply",
          avatar: "/static/avatars/user6.jpg",
          nickname: "同校学长",
          content: "回复了您的评论：谢谢您的建议，我会尽快处理",
          time: Date.now() - 1e3 * 60 * 60 * 5,
          // 5小时前
          read: true,
          unread: 0,
          postId: "post789"
        }
      ],
      // 通知消息（任务相关）
      notificationMessages: [
        {
          id: "nt1",
          type: "task",
          avatar: "/static/avatars/system.png",
          title: "任务通知",
          content: '您的"代拿外卖"任务已被用户TestUser领取',
          time: Date.now() - 1e3 * 60 * 10,
          // 10分钟前
          read: false,
          unread: 1,
          taskId: "task111"
        },
        {
          id: "nt2",
          type: "task",
          avatar: "/static/avatars/system.png",
          title: "任务通知",
          content: '您领取的"教材求购"任务将在1小时后到期',
          time: Date.now() - 1e3 * 60 * 60,
          // 1小时前
          read: false,
          unread: 1,
          taskId: "task222"
        },
        {
          id: "nt3",
          type: "system",
          avatar: "/static/avatars/system.png",
          title: "系统通知",
          content: "您的账号信用分已更新，当前信用分：120",
          time: Date.now() - 1e3 * 60 * 60 * 24,
          // 1天前
          read: true,
          unread: 0
        }
      ],
      // 推荐消息
      recommendMessages: [
        {
          id: "rc1",
          type: "task",
          avatar: "/static/avatars/recommend.png",
          title: "任务推荐",
          content: '根据您的兴趣，推荐查看"校园跑腿"相关任务',
          time: Date.now() - 1e3 * 60 * 60 * 2,
          // 2小时前
          read: false,
          unread: 1,
          taskId: "task333"
        },
        {
          id: "rc2",
          type: "activity",
          avatar: "/static/avatars/recommend.png",
          title: "活动推荐",
          content: "您可能感兴趣的新活动：校园二手交易节",
          time: Date.now() - 1e3 * 60 * 60 * 24,
          // 1天前
          read: true,
          unread: 0,
          activityId: "activity123"
        }
      ]
    };
  },
  methods: {
    // 切换功能按钮
    switchFunction(type) {
      this.activeButton = type;
      this.page = 1;
      this.noMore = false;
    },
    // 进入私信聊天
    enterPrivateChat(conversation) {
      common_vendor.index.__f__("log", "at pages/message/MessageCenter/MessageCenter.vue:436", "进入私信:", conversation.id);
      conversation.read = true;
      conversation.unread = 0;
      this.updateUnreadCounts();
      common_vendor.index.navigateTo({
        url: `/pages/message/private-chat?id=${conversation.id}&taskId=${conversation.lastTaskId}`
      });
    },
    // 查看互动消息
    viewInteraction(interaction) {
      common_vendor.index.__f__("log", "at pages/message/MessageCenter/MessageCenter.vue:449", "查看互动:", interaction.id);
      interaction.read = true;
      interaction.unread = 0;
      this.updateUnreadCounts();
      common_vendor.index.navigateTo({
        url: `/pages/community/post?id=${interaction.postId}`
      });
    },
    // 查看通知消息
    viewNotification(notification) {
      common_vendor.index.__f__("log", "at pages/message/MessageCenter/MessageCenter.vue:462", "查看通知:", notification.id);
      notification.read = true;
      notification.unread = 0;
      this.updateUnreadCounts();
      if (notification.type === "task") {
        common_vendor.index.navigateTo({
          url: `/pages/task/detail?id=${notification.taskId}`
        });
      }
    },
    // 查看推荐消息
    viewRecommend(recommend) {
      common_vendor.index.__f__("log", "at pages/message/MessageCenter/MessageCenter.vue:477", "查看推荐:", recommend.id);
      recommend.read = true;
      recommend.unread = 0;
      this.updateUnreadCounts();
      if (recommend.type === "task") {
        common_vendor.index.navigateTo({
          url: `/pages/task/detail?id=${recommend.taskId}`
        });
      } else {
        common_vendor.index.navigateTo({
          url: `/pages/activity/detail?id=${recommend.activityId}`
        });
      }
    },
    // 显示私信操作菜单
    showPrivateActions(conversation) {
      common_vendor.index.showActionSheet({
        itemList: ["置顶聊天", "标记未读", "删除聊天"],
        success: (res) => {
          common_vendor.index.__f__("log", "at pages/message/MessageCenter/MessageCenter.vue:498", "选择了:", res.tapIndex);
        }
      });
    },
    // 清除所有未读
    clearUnread() {
      this.privateMessages.forEach((c) => c.read = true);
      this.interactionMessages.forEach((i) => i.read = true);
      this.notificationMessages.forEach((n) => n.read = true);
      this.recommendMessages.forEach((r) => r.read = true);
      this.updateUnreadCounts();
      common_vendor.index.showToast({
        title: "已清除未读消息",
        icon: "success"
      });
    },
    // 更新功能按钮的未读计数
    updateUnreadCounts() {
      this.functionButtons[0].badge = this.privateMessages.filter((c) => !c.read).length;
      this.functionButtons[1].badge = this.interactionMessages.filter((i) => !i.read).length;
      this.functionButtons[2].badge = this.notificationMessages.filter((n) => !n.read).length;
      this.functionButtons[3].badge = this.recommendMessages.filter((r) => !r.read).length;
    },
    // 加载更多数据
    loadMore() {
      if (this.noMore || this.loading)
        return;
      this.loading = true;
      common_vendor.index.__f__("log", "at pages/message/MessageCenter/MessageCenter.vue:531", "加载更多数据...");
      setTimeout(() => {
        let newData = [];
        if (this.activeButton === "private") {
          newData = [{
            id: "pm" + (this.privateMessages.length + 1),
            type: "private",
            avatar: "/static/avatars/user" + (this.privateMessages.length + 1) + ".jpg",
            nickname: "新用户" + (this.privateMessages.length + 1),
            lastMessage: "你好，我想咨询任务详情",
            time: Date.now() - 1e3 * 60 * 60 * 24 * this.page,
            read: false,
            unread: 1,
            taskType: "咨询",
            taskId: "task" + (this.privateMessages.length + 1)
          }];
          this.privateMessages = [...this.privateMessages, ...newData];
        }
        this.page++;
        this.loading = false;
        if (this.page >= 3) {
          this.noMore = true;
        }
      }, 1e3);
    },
    // 获取互动类型文本
    getInteractionTypeText(type) {
      const typeMap = {
        "like": "点赞",
        "comment": "评论",
        "reply": "回复",
        "follow": "关注"
      };
      return typeMap[type] || type;
    }
  }
};
const _sfc_main = /* @__PURE__ */ Object.assign(__default__, {
  __name: "MessageCenter",
  setup(__props) {
    const activeButton = common_vendor.ref("private");
    const privateMessages = common_vendor.ref([]);
    function formatTime(time) {
      if (!time)
        return "";
      const date = new Date(time);
      const now = /* @__PURE__ */ new Date();
      const diff = now - date;
      if (diff < 60 * 1e3)
        return "刚刚";
      if (diff < 60 * 60 * 1e3)
        return Math.floor(diff / 6e4) + "分钟前";
      if (diff < 24 * 60 * 60 * 1e3 && date.getDate() === now.getDate()) {
        return `${date.getHours()}:${date.getMinutes().toString().padStart(2, "0")}`;
      }
      if (diff < 48 * 60 * 60 * 1e3 && date.getDate() === now.getDate() - 1) {
        return `昨天 ${date.getHours()}:${date.getMinutes().toString().padStart(2, "0")}`;
      }
      return `${date.getMonth() + 1}-${date.getDate()} ${date.getHours()}:${date.getMinutes().toString().padStart(2, "0")}`;
    }
    function getCurrentUserId() {
      try {
        let userInfo = common_vendor.index.getStorageSync("uni-id-pages-userInfo");
        if (!userInfo)
          return "";
        if (typeof userInfo === "string") {
          userInfo = JSON.parse(userInfo);
        }
        return userInfo._id || "";
      } catch (e) {
        return "";
      }
    }
    async function fetchPrivateMessages() {
      const userId = getCurrentUserId();
      common_vendor.index.__f__("log", "at pages/message/MessageCenter/MessageCenter.vue:235", "[调试] 当前userId:", userId);
      if (!userId)
        return;
      try {
        const result = await common_vendor.nr.callFunction({
          name: "getChatList",
          data: { userId }
        });
        common_vendor.index.__f__("log", "at pages/message/MessageCenter/MessageCenter.vue:242", "[调试] getChatList返回:", result);
        if (result.result.code === 200 && Array.isArray(result.result.data)) {
          privateMessages.value = result.result.data.map((conv) => ({
            id: conv.partnerId,
            avatar: conv.partnerAvatar || "/static/images/default-avatar.png",
            nickname: conv.partnerNickname || "对方",
            lastMessage: conv.lastMessage || "",
            time: conv.lastMessageTime || "",
            read: !conv.unread || conv.unread === 0,
            unread: conv.unread || 0,
            lastTaskId: conv.lastTaskId,
            lastMessageType: conv.lastMessageType
          }));
          common_vendor.index.__f__("log", "at pages/message/MessageCenter/MessageCenter.vue:255", "[调试] privateMessages.value:", privateMessages.value);
        }
      } catch (e) {
        common_vendor.index.__f__("error", "at pages/message/MessageCenter/MessageCenter.vue:258", "[fetchPrivateMessages] 获取私信会话失败", e);
      }
    }
    common_vendor.onMounted(() => {
      const userInfo = common_vendor.index.getStorageSync("userInfo");
      common_vendor.index.__f__("log", "at pages/message/MessageCenter/MessageCenter.vue:264", "[onMounted] userInfo:", userInfo);
      const userId = getCurrentUserId();
      common_vendor.index.__f__("log", "at pages/message/MessageCenter/MessageCenter.vue:266", "[onMounted] 当前userId:", userId);
      common_vendor.index.__f__("log", "at pages/message/MessageCenter/MessageCenter.vue:267", "[onMounted] 当前activeButton:", activeButton.value);
      if (activeButton.value === "private")
        fetchPrivateMessages();
    });
    function switchFunction(type) {
      common_vendor.index.__f__("log", "at pages/message/MessageCenter/MessageCenter.vue:273", "[switchFunction] 切换tab:", type);
      activeButton.value = type;
      if (type === "private")
        fetchPrivateMessages();
    }
    function enterPrivateChat(conversation) {
      common_vendor.index.navigateTo({
        url: `/pages/message/Chat/Chat?partnerId=${conversation.id}&taskId=${conversation.lastTaskId}`
      });
    }
    function viewInteraction() {
    }
    function viewNotification() {
    }
    function viewRecommend() {
    }
    function showPrivateActions() {
    }
    function clearUnread() {
    }
    function loadMore() {
    }
    function getInteractionTypeText(type) {
      const typeMap = {
        "like": "点赞",
        "comment": "评论",
        "reply": "回复",
        "follow": "关注"
      };
      return typeMap[type] || type;
    }
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_vendor.p({
          type: "trash",
          size: "20",
          color: "#666"
        }),
        b: common_vendor.o(clearUnread),
        c: common_vendor.f(_ctx.functionButtons, (button, k0, i0) => {
          return common_vendor.e({
            a: "bad41071-1-" + i0,
            b: common_vendor.p({
              type: button.icon,
              size: "28",
              color: activeButton.value === button.type ? "#1890ff" : "#666"
            }),
            c: common_vendor.t(button.text),
            d: button.badge > 0
          }, button.badge > 0 ? {
            e: common_vendor.t(button.badge)
          } : {}, {
            f: button.type,
            g: activeButton.value === button.type ? 1 : "",
            h: common_vendor.o(($event) => switchFunction(button.type), button.type)
          });
        }),
        d: activeButton.value === "private"
      }, activeButton.value === "private" ? common_vendor.e({
        e: common_vendor.f(privateMessages.value, (conversation, index, i0) => {
          return common_vendor.e({
            a: conversation.avatar,
            b: common_vendor.o((e) => e.target.src = "/static/images/default-avatar.png", index),
            c: common_vendor.t(conversation.nickname),
            d: common_vendor.t(formatTime(conversation.time)),
            e: common_vendor.t(conversation.lastMessage),
            f: conversation.unread > 0
          }, conversation.unread > 0 ? {
            g: common_vendor.t(conversation.unread > 99 ? "99+" : conversation.unread)
          } : {}, {
            h: index,
            i: !conversation.read ? 1 : "",
            j: common_vendor.o(($event) => enterPrivateChat(conversation), index),
            k: common_vendor.o(($event) => showPrivateActions(), index)
          });
        }),
        f: privateMessages.value.length === 0
      }, privateMessages.value.length === 0 ? {} : {}) : {}, {
        g: activeButton.value === "interaction"
      }, activeButton.value === "interaction" ? common_vendor.e({
        h: common_vendor.f(_ctx.interactionMessages, (interaction, index, i0) => {
          return common_vendor.e({
            a: interaction.avatar,
            b: common_vendor.t(interaction.nickname),
            c: common_vendor.t(formatTime(interaction.time)),
            d: common_vendor.t(interaction.content),
            e: interaction.unread > 0
          }, interaction.unread > 0 ? {
            f: common_vendor.t(interaction.unread > 99 ? "99+" : interaction.unread)
          } : {}, {
            g: common_vendor.t(getInteractionTypeText(interaction.type)),
            h: index,
            i: !interaction.read ? 1 : "",
            j: common_vendor.o(($event) => viewInteraction(), index)
          });
        }),
        i: _ctx.interactionMessages.length === 0
      }, _ctx.interactionMessages.length === 0 ? {} : {}) : {}, {
        j: activeButton.value === "notification"
      }, activeButton.value === "notification" ? common_vendor.e({
        k: common_vendor.f(_ctx.notificationMessages, (notification, index, i0) => {
          return common_vendor.e({
            a: notification.avatar,
            b: common_vendor.t(notification.title),
            c: common_vendor.t(formatTime(notification.time)),
            d: common_vendor.t(notification.content),
            e: notification.unread > 0
          }, notification.unread > 0 ? {
            f: common_vendor.t(notification.unread > 99 ? "99+" : notification.unread)
          } : {}, {
            g: common_vendor.t(notification.type === "task" ? "任务通知" : "系统通知"),
            h: index,
            i: !notification.read ? 1 : "",
            j: common_vendor.o(($event) => viewNotification(), index)
          });
        }),
        l: _ctx.notificationMessages.length === 0
      }, _ctx.notificationMessages.length === 0 ? {} : {}) : {}, {
        m: activeButton.value === "recommend"
      }, activeButton.value === "recommend" ? common_vendor.e({
        n: common_vendor.f(_ctx.recommendMessages, (recommend, index, i0) => {
          return common_vendor.e({
            a: recommend.avatar,
            b: common_vendor.t(recommend.title),
            c: common_vendor.t(formatTime(recommend.time)),
            d: common_vendor.t(recommend.content),
            e: recommend.unread > 0
          }, recommend.unread > 0 ? {
            f: common_vendor.t(recommend.unread > 99 ? "99+" : recommend.unread)
          } : {}, {
            g: common_vendor.t(recommend.type === "task" ? "任务推荐" : "活动推荐"),
            h: index,
            i: !recommend.read ? 1 : "",
            j: common_vendor.o(($event) => viewRecommend(), index)
          });
        }),
        o: _ctx.recommendMessages.length === 0
      }, _ctx.recommendMessages.length === 0 ? {} : {}) : {}, {
        p: _ctx.loading
      }, _ctx.loading ? {
        q: common_vendor.p({
          type: "spinner-cycle",
          size: "24",
          color: "#999"
        })
      } : {}, {
        r: _ctx.noMore
      }, _ctx.noMore ? {} : {}, {
        s: common_vendor.o(loadMore)
      });
    };
  }
});
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-bad41071"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../../.sourcemap/mp-weixin/pages/message/MessageCenter/MessageCenter.js.map
