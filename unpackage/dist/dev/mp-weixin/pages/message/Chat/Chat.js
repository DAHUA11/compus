"use strict";
const common_vendor = require("../../../common/vendor.js");
const _sfc_main = {
  data() {
    return {
      // 用户信息
      currentUserId: "",
      currentUserAvatar: "",
      currentUserInfo: null,
      // 聊天对象信息
      chatPartner: {
        id: "",
        nickname: "",
        avatar: "",
        online: false
      },
      // 聊天数据
      chatMessages: [],
      inputMessage: "",
      scrollToId: "",
      // 任务信息
      taskInfo: null,
      taskId: "",
      // 用户角色
      isPublisher: false,
      isAcceptor: false,
      // 界面状态
      showSendCardButton: false,
      sending: false,
      loadingMore: false,
      hasMoreMessages: true,
      // 分页参数
      page: 1,
      pageSize: 20,
      // 定时器
      messageTimer: null,
      statusTimer: null,
      // 新增：接收 role 参数
      role: "",
      // 新增：partnerId
      partnerId: "",
      // 新增：taskList
      taskList: [],
      // 新增：selectedTask
      selectedTask: null
    };
  },
  computed: {
    taskStatusText() {
      var _a;
      const statusMap = {
        pending: "待确认",
        processing: "进行中",
        completed: "已完成",
        cancelled: "已取消"
      };
      return statusMap[(_a = this.taskInfo) == null ? void 0 : _a.status] || "";
    }
  },
  methods: {
    // 获取任务类型文本
    getTaskTypeText(type) {
      const typeMap = {
        "express": "快递代拿",
        "takeout": "外卖代拿",
        "buy": "求购",
        "sell": "出物",
        "other": "其他"
      };
      return typeMap[type] || type;
    },
    // 获取状态文本
    getStatusText(status) {
      const map = {
        pending: "待确认",
        processing: "进行中",
        completed: "已完成",
        cancelled: "已取消"
      };
      return map[status] || status;
    },
    // 返回上一页
    goBack() {
      common_vendor.index.navigateBack();
    },
    // 格式化时间
    formatTime(time) {
      if (!time)
        return "";
      const date = new Date(time);
      const now = /* @__PURE__ */ new Date();
      const diff = now - date;
      if (diff < 24 * 60 * 60 * 1e3 && date.getDate() === now.getDate()) {
        return `${date.getHours()}:${date.getMinutes().toString().padStart(2, "0")}`;
      }
      if (diff < 48 * 60 * 60 * 1e3 && date.getDate() === now.getDate() - 1) {
        return `昨天 ${date.getHours()}:${date.getMinutes().toString().padStart(2, "0")}`;
      }
      return `${date.getMonth() + 1}-${date.getDate()} ${date.getHours()}:${date.getMinutes().toString().padStart(2, "0")}`;
    },
    // 获取用户信息
    async getUserInfo() {
      try {
        const userInfoRaw = common_vendor.index.getStorageSync("uni-id-pages-userInfo");
        let userInfo = userInfoRaw;
        if (typeof userInfoRaw === "string") {
          userInfo = JSON.parse(userInfoRaw);
        }
        if (userInfo && userInfo._id) {
          this.currentUserId = userInfo._id;
          this.currentUserAvatar = userInfo.avatar_file && userInfo.avatar_file.url ? userInfo.avatar_file.url : "/static/images/default-avatar.png";
          this.currentUserInfo = userInfo;
          return userInfo;
        } else {
          throw new Error("Invalid user information in local storage.");
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/message/Chat/Chat.vue:341", "Failed to get user info:", error);
        common_vendor.index.showToast({
          title: "获取用户信息异常，请重新登录",
          icon: "none",
          duration: 2e3
        });
        return null;
      }
    },
    // 获取任务信息
    async getTaskInfo() {
      try {
        const result = await common_vendor.nr.callFunction({
          name: "getTaskDetail",
          data: {
            taskId: this.taskId
          }
        });
        if (result.result.code === 200) {
          this.taskInfo = result.result.data;
          if (this.isPublisher) {
            this.chatPartner = {
              id: this.taskInfo.acceptor_id,
              nickname: this.taskInfo.acceptor_name || "任务领取者",
              avatar: this.taskInfo.acceptor_avatar || "/static/images/avatar2.png",
              online: false
            };
          } else {
            this.chatPartner = {
              id: this.taskInfo.publisher_id,
              nickname: this.taskInfo.publisher_name,
              avatar: this.taskInfo.publisher_avatar,
              online: false
            };
          }
          if (this.isPublisher && this.taskInfo.status === "pending") {
            this.showSendCardButton = true;
          } else if (this.isAcceptor && this.taskInfo.status === "pending") {
            this.showSendCardButton = true;
          } else {
            this.showSendCardButton = false;
          }
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/message/Chat/Chat.vue:394", "获取任务信息失败:", error);
        common_vendor.index.showToast({
          title: "获取任务信息失败",
          icon: "none"
        });
      }
    },
    // 加载更多消息
    async loadMoreMessages() {
      if (this.loadingMore || !this.hasMoreMessages)
        return;
      this.loadingMore = true;
      this.page++;
      try {
        await this.getChatMessages();
      } finally {
        this.loadingMore = false;
      }
    },
    // 发送文本消息
    async sendTextMessage() {
      if (this.inputMessage.trim() === "" || this.sending)
        return;
      const content = this.inputMessage.trim();
      this.inputMessage = "";
      this.sending = true;
      const tempMessage = {
        _id: "temp_" + Date.now(),
        type: "text",
        senderId: this.currentUserId,
        senderAvatar: this.currentUserAvatar,
        content,
        createTime: (/* @__PURE__ */ new Date()).toISOString(),
        status: "sending"
      };
      this.chatMessages.push(tempMessage);
      this.scrollToBottom();
      try {
        const result = await common_vendor.nr.callFunction({
          name: "sendChatMessage",
          data: {
            taskId: this.taskId,
            content,
            type: "text",
            receiverId: this.chatPartner.id
          }
        });
        if (result.result.code === 200) {
          const index = this.chatMessages.findIndex((msg) => msg._id === tempMessage._id);
          if (index !== -1) {
            this.chatMessages[index] = {
              ...result.result.data,
              status: "sent"
            };
          }
        } else {
          throw new Error(result.result.msg || "发送失败");
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/message/Chat/Chat.vue:463", "发送消息失败:", error);
        const index = this.chatMessages.findIndex((msg) => msg._id === tempMessage._id);
        if (index !== -1) {
          this.chatMessages[index].status = "failed";
        }
        common_vendor.index.showToast({
          title: "发送失败",
          icon: "none"
        });
      } finally {
        this.sending = false;
      }
    },
    // 发送交易确认卡片
    async sendTradeCard() {
      let cardTitle = "";
      let cardContent = "";
      if (this.isPublisher) {
        cardTitle = "确认派单";
        cardContent = "我已确认将此任务派发给你，请开始执行任务。";
      } else {
        cardTitle = "任务确认";
        cardContent = "我已准备好执行任务，请确认将此任务派发给我";
      }
      try {
        const result = await common_vendor.nr.callFunction({
          name: "sendChatMessage",
          data: {
            taskId: this.taskId,
            content: cardContent,
            type: "card",
            title: cardTitle,
            status: "pending",
            receiverId: this.chatPartner.id
          }
        });
        if (result.result.code === 200) {
          this.chatMessages.push(result.result.data);
          this.scrollToBottom();
          if (this.isPublisher) {
            this.taskInfo.status = "processing";
            this.showSendCardButton = false;
          }
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/message/Chat/Chat.vue:520", "发送交易卡失败:", error);
        common_vendor.index.showToast({
          title: "发送失败",
          icon: "none"
        });
      }
    },
    // 确认任务（发布者操作）
    async confirmTask(cardMessage) {
      try {
        const result = await common_vendor.nr.callFunction({
          name: "updateTaskStatus",
          data: {
            taskId: this.taskId,
            status: "processing",
            messageId: cardMessage._id
          }
        });
        if (result.result.code === 200) {
          cardMessage.status = "confirmed";
          this.taskInfo.status = "processing";
          this.showSendCardButton = false;
          this.chatMessages.push({
            type: "system",
            content: `${this.chatPartner.nickname} 已确认任务派发`,
            createTime: (/* @__PURE__ */ new Date()).toISOString()
          });
          this.scrollToBottom();
          common_vendor.index.showToast({
            title: "任务已确认派发",
            icon: "success"
          });
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/message/Chat/Chat.vue:562", "确认任务失败:", error);
        common_vendor.index.showToast({
          title: "操作失败",
          icon: "none"
        });
      }
    },
    // 接受任务（领取者操作）
    async acceptTask(cardMessage) {
      try {
        const result = await common_vendor.nr.callFunction({
          name: "updateTaskStatus",
          data: {
            taskId: this.taskId,
            status: "processing",
            messageId: cardMessage._id
          }
        });
        if (result.result.code === 200) {
          cardMessage.status = "confirmed";
          this.taskInfo.status = "processing";
          this.chatMessages.push({
            type: "system",
            content: `你已确认接受任务`,
            createTime: (/* @__PURE__ */ new Date()).toISOString()
          });
          this.scrollToBottom();
          common_vendor.index.showToast({
            title: "任务已确认接受",
            icon: "success"
          });
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/message/Chat/Chat.vue:603", "接受任务失败:", error);
        common_vendor.index.showToast({
          title: "操作失败",
          icon: "none"
        });
      }
    },
    // 滚动到底部
    scrollToBottom() {
      this.$nextTick(() => {
        if (this.chatMessages.length > 0) {
          this.scrollToId = "msg" + (this.chatMessages.length - 1);
        }
      });
    },
    // 显示任务操作菜单
    showTaskMenu() {
      this.$refs.taskMenu.open();
    },
    // 获取卡片状态文本
    getCardStatusText(status) {
      const statusMap = {
        "confirmed": "任务已确认",
        "cancelled": "任务已取消",
        "pending": "等待确认"
      };
      return statusMap[status] || "未知状态";
    },
    // 查看任务详情
    viewTaskDetail() {
      common_vendor.index.navigateTo({
        url: `/pages/task/TaskDetail/TaskDetail?id=${this.taskId}`
      });
    },
    // 取消任务
    async cancelTask() {
      common_vendor.index.showModal({
        title: "确认取消",
        content: "确定要取消这个任务吗？",
        success: async (res) => {
          if (res.confirm) {
            try {
              const result = await common_vendor.nr.callFunction({
                name: "updateTaskStatus",
                data: {
                  taskId: this.taskId,
                  status: "cancelled"
                }
              });
              if (result.result.code === 200) {
                this.taskInfo.status = "cancelled";
                common_vendor.index.showToast({
                  title: "任务已取消",
                  icon: "success"
                });
              }
            } catch (error) {
              common_vendor.index.__f__("error", "at pages/message/Chat/Chat.vue:666", "取消任务失败:", error);
              common_vendor.index.showToast({
                title: "操作失败",
                icon: "none"
              });
            }
          }
        }
      });
    },
    // 完成任务
    async completeTask() {
      common_vendor.index.showModal({
        title: "确认完成",
        content: "确定任务已完成吗？",
        success: async (res) => {
          if (res.confirm) {
            try {
              const result = await common_vendor.nr.callFunction({
                name: "updateTaskStatus",
                data: {
                  taskId: this.taskId,
                  status: "completed"
                }
              });
              if (result.result.code === 200) {
                this.taskInfo.status = "completed";
                common_vendor.index.showToast({
                  title: "任务已完成",
                  icon: "success"
                });
              }
            } catch (error) {
              common_vendor.index.__f__("error", "at pages/message/Chat/Chat.vue:701", "完成任务失败:", error);
              common_vendor.index.showToast({
                title: "操作失败",
                icon: "none"
              });
            }
          }
        }
      });
    },
    // 确认收货
    async confirmReceipt() {
      common_vendor.index.showModal({
        title: "确认收货",
        content: "确认已收到任务成果吗？",
        success: async (res) => {
          if (res.confirm) {
            try {
              const result = await common_vendor.nr.callFunction({
                name: "updateTaskStatus",
                data: {
                  taskId: this.taskId,
                  status: "completed"
                }
              });
              if (result.result.code === 200) {
                this.taskInfo.status = "completed";
                common_vendor.index.showToast({
                  title: "确认成功",
                  icon: "success"
                });
              }
            } catch (error) {
              common_vendor.index.__f__("error", "at pages/message/Chat/Chat.vue:736", "确认收货失败:", error);
              common_vendor.index.showToast({
                title: "操作失败",
                icon: "none"
              });
            }
          }
        }
      });
    },
    // 报告问题
    reportProblem() {
      common_vendor.index.navigateTo({
        url: `/pages/report/report?taskId=${this.taskId}`
      });
    },
    // 发送图片
    sendImage() {
      common_vendor.index.chooseImage({
        count: 1,
        success: (res) => {
          common_vendor.index.showToast({
            title: "图片发送功能开发中",
            icon: "none"
          });
        }
      });
    },
    // 发送位置
    sendLocation() {
      common_vendor.index.chooseLocation({
        success: (res) => {
          common_vendor.index.showToast({
            title: "位置发送功能开发中",
            icon: "none"
          });
        }
      });
    },
    // 定时刷新消息
    startMessageTimer() {
      this.messageTimer = setInterval(async () => {
        await this.getAllMessagesWithPartner();
      }, 5e3);
    },
    // 停止定时器
    stopMessageTimer() {
      if (this.messageTimer) {
        clearInterval(this.messageTimer);
        this.messageTimer = null;
      }
      if (this.statusTimer) {
        clearInterval(this.statusTimer);
        this.statusTimer = null;
      }
    },
    // 如果是领取者且没有聊天记录，自动发送初始消息
    async sendInitialMessage() {
      try {
        let messageContent = "";
        switch (this.taskInfo.type) {
          case "express":
            messageContent = `你好！关于你发布的快递代拿任务，我可以接单。请问有什么需要注意的吗？`;
            break;
          case "takeout":
            messageContent = `你好！关于你发布的外卖代拿任务，我可以接单。请问有什么需要注意的吗？`;
            break;
          case "buy":
            messageContent = `你好！关于你发布的求购任务，我可以帮你寻找。请问有什么具体要求吗？`;
            break;
          case "sell":
            messageContent = `你好！关于你发布的出物任务，我可以帮你处理。请问有什么需要注意的吗？`;
            break;
          default:
            messageContent = `你好！关于你发布的任务，我可以接单。请问有什么需要注意的吗？`;
        }
        const result = await common_vendor.nr.callFunction({
          name: "sendChatMessage",
          data: {
            taskId: this.taskId,
            content: messageContent,
            type: "text",
            receiverId: this.chatPartner.id
          }
        });
        if (result.result.code === 200) {
          const sentMessage = {
            _id: result.result.data._id,
            type: "text",
            senderId: this.currentUserId,
            senderAvatar: this.currentUserAvatar,
            content: messageContent,
            createTime: (/* @__PURE__ */ new Date()).toISOString(),
            status: "sent"
          };
          this.chatMessages.push(sentMessage);
          this.scrollToBottom();
          common_vendor.index.showToast({
            title: "初始消息已发送",
            icon: "success",
            duration: 1500
          });
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/message/Chat/Chat.vue:855", "发送初始消息失败:", error);
        common_vendor.index.showToast({
          title: "发送初始消息失败",
          icon: "none"
        });
      }
    },
    // 获取对方信息
    async getPartnerInfo() {
      var _a;
      const res = await common_vendor.nr.callFunction({
        name: "getUserInfo",
        data: { userId: this.partnerId }
      });
      if (res.result.code === 200) {
        this.chatPartner = {
          id: this.partnerId,
          nickname: res.result.data.nickname,
          avatar: ((_a = res.result.data.avatar_file) == null ? void 0 : _a.url) || "/static/images/default-avatar.png",
          online: false
        };
      }
    },
    // 获取所有任务
    async getAllTasksWithPartner() {
      const res = await common_vendor.nr.callFunction({
        name: "getTaskListWithUser",
        data: {
          userA: this.currentUserId,
          userB: this.partnerId
        }
      });
      if (res.result.code === 200) {
        this.taskList = res.result.data;
        this.selectedTask = this.taskList[0] || null;
      }
    },
    // 获取所有消息
    async getAllMessagesWithPartner() {
      const res = await common_vendor.nr.callFunction({
        name: "getChatMessagesWithUser",
        data: {
          userA: this.currentUserId,
          userB: this.partnerId
        }
      });
      if (res.result.code === 200) {
        this.chatMessages = res.result.data;
        this.$nextTick(() => this.scrollToBottom());
      }
    },
    // 切换任务卡片
    selectTask(task) {
      this.selectedTask = task;
    }
  },
  async onLoad(options) {
    this.taskId = options.taskId || options.id;
    this.role = options.role || "";
    this.partnerId = options.partnerId;
    if (!this.taskId) {
      common_vendor.index.showToast({
        title: "缺少任务ID",
        icon: "none"
      });
      setTimeout(() => {
        common_vendor.index.navigateBack();
      }, 1500);
      return;
    }
    const userInfo = await this.getUserInfo();
    if (!userInfo) {
      setTimeout(() => {
        common_vendor.index.navigateBack();
      }, 2e3);
      return;
    }
    const initialTaskResult = await common_vendor.nr.callFunction({
      name: "getTaskDetail",
      data: { taskId: this.taskId }
    });
    if (initialTaskResult.result.code !== 200) {
      common_vendor.index.showToast({ title: "无法获取任务信息", icon: "none" });
      common_vendor.index.navigateBack();
      return;
    }
    this.taskInfo = initialTaskResult.result.data;
    if (this.role === "acceptor") {
      this.isAcceptor = true;
      this.isPublisher = false;
    } else {
      this.isPublisher = this.currentUserId === this.taskInfo.publisher_id;
      this.isAcceptor = !this.isPublisher;
    }
    if (this.isPublisher) {
      this.chatPartner = {
        id: this.taskInfo.acceptor_id,
        nickname: this.taskInfo.acceptor_name || "任务领取者",
        avatar: this.taskInfo.acceptor_avatar || "/static/images/avatar2.png",
        online: false
      };
    } else {
      this.chatPartner = {
        id: this.taskInfo.publisher_id,
        nickname: this.taskInfo.publisher_name,
        avatar: this.taskInfo.publisher_avatar,
        online: false
      };
    }
    if (this.isPublisher && this.taskInfo.status === "pending") {
      this.showSendCardButton = true;
    } else if (this.isAcceptor && this.taskInfo.status === "pending") {
      this.showSendCardButton = true;
    } else {
      this.showSendCardButton = false;
    }
    await this.getAllMessagesWithPartner();
    if (this.isAcceptor && this.chatMessages.length === 0) {
      await this.sendInitialMessage();
    }
    this.startMessageTimer();
    await this.getPartnerInfo();
    await this.getAllTasksWithPartner();
    await this.getAllMessagesWithPartner();
  },
  onUnload() {
    this.stopMessageTimer();
  },
  onShow() {
    if (this.partnerId) {
      this.getAllMessagesWithPartner();
    }
  }
};
if (!Array) {
  const _easycom_uni_icons2 = common_vendor.resolveComponent("uni-icons");
  const _easycom_uni_popup2 = common_vendor.resolveComponent("uni-popup");
  (_easycom_uni_icons2 + _easycom_uni_popup2)();
}
const _easycom_uni_icons = () => "../../../uni_modules/uni-icons/components/uni-icons/uni-icons.js";
const _easycom_uni_popup = () => "../../../uni_modules/uni-popup/components/uni-popup/uni-popup.js";
if (!Math) {
  (_easycom_uni_icons + _easycom_uni_popup)();
}
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: common_vendor.p({
      type: "arrowleft",
      size: "24",
      color: "#333"
    }),
    b: common_vendor.o((...args) => $options.goBack && $options.goBack(...args)),
    c: $data.chatPartner.avatar,
    d: common_vendor.t($data.chatPartner.nickname),
    e: $data.chatPartner.online
  }, $data.chatPartner.online ? {} : {}, {
    f: common_vendor.o($options.showTaskMenu),
    g: common_vendor.p({
      type: "more",
      size: "24",
      color: "#333"
    }),
    h: $data.taskInfo
  }, $data.taskInfo ? common_vendor.e({
    i: common_vendor.t($data.taskInfo.title),
    j: common_vendor.t($data.taskInfo.reward),
    k: common_vendor.t($options.getTaskTypeText($data.taskInfo.type)),
    l: $data.taskInfo.pickupAddress
  }, $data.taskInfo.pickupAddress ? {
    m: common_vendor.t($data.taskInfo.pickupAddress)
  } : {}, {
    n: $data.taskInfo.deliveryAddress
  }, $data.taskInfo.deliveryAddress ? {
    o: common_vendor.t($data.taskInfo.deliveryAddress)
  } : {}, {
    p: $data.taskInfo.expectedDeliveryTime
  }, $data.taskInfo.expectedDeliveryTime ? {
    q: common_vendor.t($data.taskInfo.expectedDeliveryTime)
  } : {}, {
    r: common_vendor.t($options.getStatusText($data.taskInfo.status)),
    s: common_vendor.n($data.taskInfo.status)
  }) : {}, {
    t: $data.loadingMore
  }, $data.loadingMore ? {
    v: common_vendor.p({
      type: "spinner-cycle",
      size: "20",
      color: "#999"
    })
  } : {}, {
    w: common_vendor.f($data.chatMessages, (message, index, i0) => {
      return common_vendor.e({
        a: message.type === "system"
      }, message.type === "system" ? {
        b: common_vendor.t(message.content)
      } : message.type === "card" ? common_vendor.e({
        d: common_vendor.t(message.title),
        e: common_vendor.t(message.content),
        f: message.status === "pending"
      }, message.status === "pending" ? common_vendor.e({
        g: $data.isPublisher && message.senderId !== $data.currentUserId
      }, $data.isPublisher && message.senderId !== $data.currentUserId ? {
        h: common_vendor.o(($event) => $options.confirmTask(message), message._id || index)
      } : $data.isAcceptor && message.senderId !== $data.currentUserId ? {
        j: common_vendor.o(($event) => $options.acceptTask(message), message._id || index)
      } : {}, {
        i: $data.isAcceptor && message.senderId !== $data.currentUserId
      }) : {
        k: "0e5c5643-3-" + i0,
        l: common_vendor.p({
          type: message.status === "confirmed" ? "checkmark-filled" : "close-filled",
          size: "20",
          color: message.status === "confirmed" ? "#4CAF50" : "#F44336"
        }),
        m: common_vendor.t($options.getCardStatusText(message.status))
      }) : common_vendor.e({
        n: message.senderId !== $data.currentUserId
      }, message.senderId !== $data.currentUserId ? {
        o: message.senderAvatar,
        p: common_vendor.t($data.chatPartner.nickname),
        q: common_vendor.t(message.content),
        r: common_vendor.t($options.formatTime(message.createTime))
      } : common_vendor.e({
        s: common_vendor.t(message.content),
        t: common_vendor.t($options.formatTime(message.createTime)),
        v: message.status === "sending"
      }, message.status === "sending" ? {
        w: "0e5c5643-4-" + i0,
        x: common_vendor.p({
          type: "spinner-cycle",
          size: "14",
          color: "#999"
        })
      } : message.status === "sent" ? {
        z: "0e5c5643-5-" + i0,
        A: common_vendor.p({
          type: "checkmark",
          size: "14",
          color: "#999"
        })
      } : message.status === "read" ? {
        C: "0e5c5643-6-" + i0,
        D: common_vendor.p({
          type: "checkmark-filled",
          size: "14",
          color: "#4CAF50"
        })
      } : {}, {
        y: message.status === "sent",
        B: message.status === "read",
        E: $data.currentUserAvatar
      })), {
        c: message.type === "card",
        F: message._id || index,
        G: "msg" + index,
        H: common_vendor.n(message.senderId === $data.currentUserId ? "self" : "other")
      });
    }),
    x: $data.scrollToId,
    y: common_vendor.o((...args) => $options.loadMoreMessages && $options.loadMoreMessages(...args)),
    z: common_vendor.o($options.sendImage),
    A: common_vendor.p({
      type: "image",
      size: "28",
      color: "#666"
    }),
    B: common_vendor.o($options.sendLocation),
    C: common_vendor.p({
      type: "location-filled",
      size: "28",
      color: "#666"
    }),
    D: common_vendor.o((...args) => $options.sendTextMessage && $options.sendTextMessage(...args)),
    E: $data.inputMessage,
    F: common_vendor.o(($event) => $data.inputMessage = $event.detail.value),
    G: $data.showSendCardButton
  }, $data.showSendCardButton ? {
    H: common_vendor.t($data.isPublisher ? "确认派单" : "确认接单"),
    I: common_vendor.o((...args) => $options.sendTradeCard && $options.sendTradeCard(...args))
  } : {
    J: common_vendor.t($data.sending ? "发送中..." : "发送"),
    K: common_vendor.o((...args) => $options.sendTextMessage && $options.sendTextMessage(...args)),
    L: !$data.inputMessage.trim() || $data.sending
  }, {
    M: common_vendor.p({
      type: "info",
      size: "20",
      color: "#333"
    }),
    N: common_vendor.o((...args) => $options.viewTaskDetail && $options.viewTaskDetail(...args)),
    O: $data.taskInfo && $data.taskInfo.status === "pending"
  }, $data.taskInfo && $data.taskInfo.status === "pending" ? {
    P: common_vendor.p({
      type: "close",
      size: "20",
      color: "#F44336"
    }),
    Q: common_vendor.o((...args) => $options.cancelTask && $options.cancelTask(...args))
  } : {}, {
    R: $data.taskInfo && $data.taskInfo.status === "processing" && $data.isAcceptor
  }, $data.taskInfo && $data.taskInfo.status === "processing" && $data.isAcceptor ? {
    S: common_vendor.p({
      type: "checkmark",
      size: "20",
      color: "#4CAF50"
    }),
    T: common_vendor.o((...args) => $options.completeTask && $options.completeTask(...args))
  } : {}, {
    U: $data.taskInfo && $data.taskInfo.status === "processing" && $data.isPublisher
  }, $data.taskInfo && $data.taskInfo.status === "processing" && $data.isPublisher ? {
    V: common_vendor.p({
      type: "checkmark",
      size: "20",
      color: "#4CAF50"
    }),
    W: common_vendor.o((...args) => $options.confirmReceipt && $options.confirmReceipt(...args))
  } : {}, {
    X: common_vendor.p({
      type: "flag",
      size: "20",
      color: "#FF9800"
    }),
    Y: common_vendor.o((...args) => $options.reportProblem && $options.reportProblem(...args)),
    Z: common_vendor.sr("taskMenu", "0e5c5643-9"),
    aa: common_vendor.p({
      type: "bottom"
    })
  });
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../../.sourcemap/mp-weixin/pages/message/Chat/Chat.js.map
