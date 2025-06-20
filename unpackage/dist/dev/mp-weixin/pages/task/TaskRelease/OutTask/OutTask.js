"use strict";
const common_vendor = require("../../../../common/vendor.js");
const _sfc_main = {
  data() {
    return {
      // 商品成色选项
      conditions: [
        { label: "全新", value: "new", icon: "star" },
        { label: "九成新", value: "like-new", icon: "star" },
        { label: "八成新", value: "good", icon: "star" },
        { label: "七成新", value: "fair", icon: "star" }
      ],
      // 表单数据
      images: [],
      // 图片参考
      itemName: "",
      // 物品名称
      selectedCategory: "",
      // 物品类别
      selectedCondition: "",
      // 成色期望
      budgetRange: "",
      // 价格范围
      contactName: "",
      // 联系人姓名
      contactPhone: "",
      // 联系电话
      description: "",
      // 商品描述
      duration: "7",
      // 有效期
      isUrgent: false,
      // 加急发布
      userInfo: null,
      // 用户信息
      selectedCondition: "",
      // 成色期望
      tags: []
      // 标签
    };
  },
  onShow() {
    let userInfo = common_vendor.index.getStorageSync("uni-id-pages-userInfo");
    common_vendor.index.__f__("log", "at pages/task/TaskRelease/OutTask/OutTask.vue:273", "--- Debugging onShow ---");
    common_vendor.index.__f__("log", "at pages/task/TaskRelease/OutTask/OutTask.vue:274", "1. Raw userInfo from storage:", userInfo);
    common_vendor.index.__f__("log", "at pages/task/TaskRelease/OutTask/OutTask.vue:275", "2. Type of raw userInfo:", typeof userInfo);
    if (typeof userInfo === "string") {
      try {
        userInfo = JSON.parse(userInfo);
      } catch (e) {
        common_vendor.index.__f__("error", "at pages/task/TaskRelease/OutTask/OutTask.vue:281", "5. Error parsing userInfo:", e);
        userInfo = null;
      }
    }
    if (userInfo && userInfo._id) {
      this.userInfo = {
        _id: userInfo._id,
        username: userInfo.username,
        nickname: userInfo.nickname || userInfo.username || "用户",
        // 优先使用 avatar_file.url，否则使用 avatar 字段，最后提供默认头像
        avatar: userInfo.avatar_file && userInfo.avatar_file.url ? userInfo.avatar_file.url : userInfo.avatar || "/static/images/default_avatar.png"
        // 确保有一个默认头像
      };
      common_vendor.index.__f__("log", "at pages/task/TaskRelease/OutTask/OutTask.vue:297", "11. User is logged in. ID:", this.userInfo._id, "Avatar:", this.userInfo.avatar);
    } else {
      common_vendor.index.__f__("log", "at pages/task/TaskRelease/OutTask/OutTask.vue:299", "10. Condition `!userInfo || !userInfo._id` is TRUE. Redirecting...");
      common_vendor.index.showToast({
        title: "请先登录",
        icon: "none"
      });
      setTimeout(() => {
        common_vendor.index.navigateTo({
          url: "/uni_modules/uni-id-pages/pages/login/login-withoutpwd"
        });
      }, 1500);
      return;
    }
    common_vendor.index.__f__("log", "at pages/task/TaskRelease/OutTask/OutTask.vue:311", "--- End Debugging onShow ---");
  },
  methods: {
    // 获取当前用户信息
    getCurrentUser() {
      const userInfo = common_vendor.index.getStorageSync("uni-id-pages-userInfo");
      if (userInfo) {
        return {
          id: userInfo._id,
          nickname: userInfo.nickname,
          avatar: userInfo.avatar_file && userInfo.avatar_file.url ? userInfo.avatar_file.url : "/static/images/avatar1.png"
        };
      } else {
        return null;
      }
    },
    // 处理选择图片
    handleChooseImage() {
      common_vendor.index.chooseImage({
        count: 3 - this.images.length,
        // 最多3张
        success: (res) => {
          this.images = [...this.images, ...res.tempFilePaths];
        }
      });
    },
    // 处理删除图片
    handleDeleteImage(index) {
      this.images.splice(index, 1);
    },
    // 处理选择物品类别
    handleSelectCategory() {
      common_vendor.index.showActionSheet({
        itemList: ["学习用品", "电子产品", "服饰箱包", "图书教材", "运动器材", "其他"],
        success: (res) => {
          this.selectedCategory = ["学习用品", "电子产品", "服饰箱包", "图书教材", "运动器材", "其他"][res.tapIndex];
        }
      });
    },
    // 处理选择物品成色
    handleSelectCondition(value) {
      this.selectedCondition = value;
    },
    // 处理参考价格区间
    handleReferencePrice() {
      common_vendor.index.showModal({
        title: "参考价格区间",
        content: "根据物品名称和类别，参考价格区间为 ¥XXX - ¥YYY（此为模拟数据）",
        showCancel: false
      });
    },
    // 处理选择有效期
    handleSelectDuration() {
      common_vendor.index.showActionSheet({
        itemList: ["1天", "3天", "7天", "15天", "30天"],
        success: (res) => {
          this.duration = ["1", "3", "7", "15", "30"][res.tapIndex];
        }
      });
    },
    // 处理加急开关变化
    handleUrgentChange(e) {
      this.isUrgent = e.detail.value;
    },
    // 计算总价格（包含加急费用）
    calculateTotalPrice() {
      const basePrice = parseFloat(this.budgetRange) || 0;
      if (this.isUrgent) {
        return (basePrice * 1.3).toFixed(2);
      }
      return basePrice.toFixed(2);
    },
    // 处理提交
    handleSubmit() {
      if (this.images.length === 0) {
        common_vendor.index.showToast({ title: "请上传商品图片", icon: "none" });
        return;
      }
      if (!this.itemName) {
        common_vendor.index.showToast({ title: "请输入物品名称", icon: "none" });
        return;
      }
      if (!this.selectedCategory) {
        common_vendor.index.showToast({ title: "请选择物品类别", icon: "none" });
        return;
      }
      if (!this.selectedCondition) {
        common_vendor.index.showToast({ title: "请选择商品成色", icon: "none" });
        return;
      }
      if (!this.budgetRange) {
        common_vendor.index.showToast({ title: "请输入商品价格", icon: "none" });
        return;
      }
      if (!this.contactName) {
        common_vendor.index.showToast({ title: "请输入联系人姓名", icon: "none" });
        return;
      }
      if (!this.contactPhone) {
        common_vendor.index.showToast({ title: "请输入联系电话", icon: "none" });
        return;
      }
      if (!this.description) {
        common_vendor.index.showToast({ title: "请填写商品描述", icon: "none" });
        return;
      }
      if (!this.duration) {
        common_vendor.index.showToast({ title: "请选择有效期", icon: "none" });
        return;
      }
      const taskData = {
        type: "sell",
        title: this.getFormattedTitle({
          type: "sell",
          itemName: this.itemName,
          selectedCondition: this.selectedCondition
        }),
        description: this.description,
        reward: Number(this.calculateTotalPrice()),
        status: "pending",
        publisher_id: this.userInfo._id,
        publisher_name: this.userInfo.nickname,
        publisher_avatar: this.userInfo.avatar,
        publish_time: /* @__PURE__ */ new Date(),
        is_urgent: this.isUrgent || false,
        tags: this.isUrgent ? ["urgent"] : [],
        item_name: this.itemName,
        selected_category: this.selectedCategory,
        selected_condition: this.selectedCondition,
        contact_name: this.contactName,
        contact_phone: this.contactPhone,
        images: this.images,
        duration: Number(this.duration)
      };
      try {
        common_vendor.index.showLoading({
          title: "发布中..."
        });
        common_vendor.nr.callFunction({
          name: "addTask",
          data: {
            taskData
          }
        }).then((res) => {
          common_vendor.index.hideLoading();
          if (res.result.code === 200) {
            common_vendor.index.showToast({
              title: "发布成功",
              icon: "success"
            });
            setTimeout(() => {
              common_vendor.index.switchTab({
                url: "/pages/index/index"
              });
            }, 1500);
          } else {
            common_vendor.index.showToast({
              title: res.result.msg || "发布失败",
              icon: "none"
            });
          }
        }).catch((err) => {
          common_vendor.index.hideLoading();
          common_vendor.index.showToast({
            title: "发布失败，请重试",
            icon: "none"
          });
          common_vendor.index.__f__("error", "at pages/task/TaskRelease/OutTask/OutTask.vue:494", "发布任务失败：", err);
        });
      } catch (e) {
        common_vendor.index.hideLoading();
        common_vendor.index.showToast({
          title: "发布失败，请重试",
          icon: "none"
        });
        common_vendor.index.__f__("error", "at pages/task/TaskRelease/OutTask/OutTask.vue:502", "发布任务失败：", e);
      }
    },
    // 获取物品成色文本
    getConditionText(condition) {
      const conditionMap = {
        "new": "全新",
        "like-new": "九成新",
        "good": "八成新",
        "fair": "七成新"
      };
      return conditionMap[condition] || "";
    },
    // 获取格式化标题
    getFormattedTitle(task) {
      if (!task)
        return "未知任务";
      switch (task.type) {
        case "buy":
          return `求购${task.itemName || ""}${task.selectedCondition ? `(${this.getConditionText(task.selectedCondition)})` : ""}`;
        case "express":
          return `${task.pickupAddress || ""}快递代取`;
        case "sell":
          return `出${task.selectedCondition ? this.getConditionText(task.selectedCondition) : ""}${task.itemName || ""}`;
        case "takeout":
          return `${task.pickupAddress || ""}外卖代拿`;
        default:
          return task.title || "未知任务";
      }
    }
  }
};
if (!Array) {
  const _easycom_uni_icons2 = common_vendor.resolveComponent("uni-icons");
  _easycom_uni_icons2();
}
const _easycom_uni_icons = () => "../../../../uni_modules/uni-icons/components/uni-icons/uni-icons.js";
if (!Math) {
  _easycom_uni_icons();
}
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: common_vendor.p({
      type: "image",
      size: "18",
      color: "#00BFFF"
    }),
    b: common_vendor.f($data.images, (image, index, i0) => {
      return {
        a: image,
        b: "2d314d34-1-" + i0,
        c: common_vendor.o(($event) => $options.handleDeleteImage(index), index),
        d: index
      };
    }),
    c: common_vendor.p({
      type: "close",
      size: "16",
      color: "#ffffff"
    }),
    d: $data.images.length < 3
  }, $data.images.length < 3 ? {
    e: common_vendor.p({
      type: "plusempty",
      size: "32",
      color: "#333333"
    }),
    f: common_vendor.t($data.images.length),
    g: common_vendor.o((...args) => $options.handleChooseImage && $options.handleChooseImage(...args))
  } : {}, {
    h: common_vendor.p({
      type: "paperplane",
      size: "18",
      color: "#00BFFF"
    }),
    i: $data.itemName,
    j: common_vendor.o(($event) => $data.itemName = $event.detail.value),
    k: common_vendor.p({
      type: "list",
      size: "18",
      color: "#00BFFF"
    }),
    l: !$data.selectedCategory
  }, !$data.selectedCategory ? {} : {
    m: common_vendor.t($data.selectedCategory)
  }, {
    n: common_vendor.p({
      type: $data.selectedCategory ? "checkmark" : "arrowright",
      size: "16",
      color: "#00BFFF"
    }),
    o: $data.selectedCategory ? 1 : "",
    p: common_vendor.o((...args) => $options.handleSelectCategory && $options.handleSelectCategory(...args)),
    q: common_vendor.p({
      type: "star",
      size: "18",
      color: "#00BFFF"
    }),
    r: common_vendor.f($data.conditions, (condition, index, i0) => {
      return {
        a: "2d314d34-7-" + i0,
        b: common_vendor.p({
          type: $data.selectedCondition === condition.value ? "star-filled" : "star",
          size: "20",
          color: $data.selectedCondition === condition.value ? "#00BFFF" : "#333333"
        }),
        c: common_vendor.t(condition.label),
        d: index,
        e: $data.selectedCondition === condition.value ? 1 : "",
        f: common_vendor.o(($event) => $options.handleSelectCondition(condition.value), index)
      };
    }),
    s: common_vendor.p({
      type: "person",
      size: "18",
      color: "#00BFFF"
    }),
    t: $data.contactName,
    v: common_vendor.o(($event) => $data.contactName = $event.detail.value),
    w: common_vendor.p({
      type: "phone",
      size: "18",
      color: "#00BFFF"
    }),
    x: $data.contactPhone,
    y: common_vendor.o(($event) => $data.contactPhone = $event.detail.value),
    z: common_vendor.p({
      type: "wallet",
      size: "18",
      color: "#FF9F1C"
    }),
    A: $data.budgetRange,
    B: common_vendor.o(($event) => $data.budgetRange = $event.detail.value),
    C: common_vendor.o((...args) => $options.handleReferencePrice && $options.handleReferencePrice(...args)),
    D: common_vendor.p({
      type: "notification-filled",
      size: "18",
      color: "#FF9F1C"
    }),
    E: $data.isUrgent,
    F: common_vendor.o((...args) => $options.handleUrgentChange && $options.handleUrgentChange(...args)),
    G: $data.isUrgent
  }, $data.isUrgent ? {
    H: common_vendor.t($data.budgetRange),
    I: common_vendor.t($options.calculateTotalPrice())
  } : {}, {
    J: common_vendor.p({
      type: "compose",
      size: "18",
      color: "#47B960"
    }),
    K: $data.description,
    L: common_vendor.o(($event) => $data.description = $event.detail.value),
    M: common_vendor.t($data.description.length),
    N: common_vendor.o((...args) => $options.handleSubmit && $options.handleSubmit(...args))
  });
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../../../.sourcemap/mp-weixin/pages/task/TaskRelease/OutTask/OutTask.js.map
