"use strict";
const common_vendor = require("../../../../common/vendor.js");
const _sfc_main = {
  data() {
    return {
      // 求购物品成色期望选项
      conditions: [
        { label: "全新", value: "new", icon: "star-filled" },
        { label: "九成新", value: "like-new", icon: "star" },
        { label: "八成新", value: "good", icon: "star-half" },
        { label: "七成新", value: "fair", icon: "star-outline" }
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
      // 预算范围
      contactName: "",
      // 联系人姓名
      contactPhone: "",
      // 联系电话
      acceptRecommend: false,
      // 接受类似物品推荐
      recommendRange: "",
      // 类似物品差异范围
      description: "",
      // 求购描述
      duration: "7",
      // 有效期
      isUrgent: false,
      // 加急发布
      // 测试模式配置
      TEST_MODE: true,
      // 测试模式开关
      TEST_USER: {
        publisher: {
          id: "test_publisher_id",
          nickname: "测试发布者",
          avatar: "/static/avatar/default.png"
        },
        claimer: {
          id: "test_claimer_id",
          nickname: "测试接单者",
          avatar: "/static/avatar/default.png"
        },
        user: {
          id: "test_user_id",
          nickname: "测试用户",
          avatar: "/static/avatar/default.png"
        }
      }
    };
  },
  methods: {
    // 获取当前用户信息
    getCurrentUser() {
      if (this.TEST_MODE) {
        const testRole = common_vendor.index.getStorageSync("testRole") || "user";
        return this.TEST_USER[testRole] || this.TEST_USER.user;
      } else {
        return {
          id: common_vendor.index.getStorageSync("userId"),
          nickname: common_vendor.index.getStorageSync("userNickname"),
          avatar: common_vendor.index.getStorageSync("userAvatar")
        };
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
    // 处理选择物品成色期望
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
    // 处理接受类似物品推荐开关
    handleToggleRecommend() {
      this.acceptRecommend = !this.acceptRecommend;
      if (!this.acceptRecommend) {
        this.recommendRange = "";
      }
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
    // 处理加急开关
    handleToggleUrgent() {
      this.isUrgent = !this.isUrgent;
    },
    // 处理返回
    handleBack() {
      common_vendor.index.navigateBack();
    },
    // 处理帮助
    handleHelp() {
      common_vendor.index.showModal({
        title: "求购发布指南",
        content: "1. 请如实填写求购信息\n2. 上传相关参考图片\n3. 详细描述求购需求\n4. 填写合理的预算范围",
        showCancel: false
      });
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
      if (!this.itemName) {
        common_vendor.index.showToast({
          title: "请输入求购物品名称",
          icon: "none"
        });
        return;
      }
      if (!this.selectedCategory) {
        common_vendor.index.showToast({
          title: "请选择物品类别",
          icon: "none"
        });
        return;
      }
      if (!this.selectedCondition) {
        common_vendor.index.showToast({
          title: "请选择成色期望",
          icon: "none"
        });
        return;
      }
      if (!this.budgetRange) {
        common_vendor.index.showToast({
          title: "请输入预算范围",
          icon: "none"
        });
        return;
      }
      if (!this.contactName) {
        common_vendor.index.showToast({
          title: "请输入联系人姓名",
          icon: "none"
        });
        return;
      }
      if (!this.contactPhone) {
        common_vendor.index.showToast({
          title: "请输入联系电话",
          icon: "none"
        });
        return;
      }
      if (!this.description) {
        common_vendor.index.showToast({
          title: "请填写详细描述",
          icon: "none"
        });
        return;
      }
      if (!this.duration) {
        common_vendor.index.showToast({
          title: "请选择有效期",
          icon: "none"
        });
        return;
      }
      const taskData = {
        type: "buy",
        // 求购任务类型
        status: "pending",
        // 初始状态为待接单
        title: this.itemName,
        // 物品名称作为标题
        description: this.description,
        // 详细描述
        reward: parseFloat(this.calculateTotalPrice()),
        // 使用计算后的总价格
        publishTime: (/* @__PURE__ */ new Date()).toLocaleString("zh-CN"),
        // 发布时间
        images: this.images,
        // 图片参考
        latestUpdate: "等待卖家联系",
        // 添加初始最新动态
        selectedCondition: this.selectedCondition,
        // 成色期望
        contactName: this.contactName,
        // 联系人姓名
        contactPhone: this.contactPhone,
        // 联系电话
        acceptRecommend: this.acceptRecommend,
        // 接受类似物品推荐
        recommendRange: this.recommendRange,
        // 类似物品差异范围
        duration: parseInt(this.duration),
        // 有效期，转换为数字
        isUrgent: this.isUrgent,
        // 加急发布
        tags: this.isUrgent ? ["加急"] : [],
        // 添加加急标签
        ownerType: "published",
        // 添加ownerType字段，表示这是发布的任务
        publisher: this.getCurrentUser()
        // 使用测试用户或真实用户信息
      };
      common_vendor.index.showToast({
        title: "发布成功",
        icon: "success",
        success: () => {
          const taskInfoString = encodeURIComponent(JSON.stringify(taskData));
          common_vendor.index.navigateTo({
            url: `/pages/task/TaskDetail/TaskDetail?taskInfo=${taskInfoString}`
          });
        }
      });
    },
    // 处理switch开关变化
    handleSwitchChange(field, event) {
      const value = event.detail.value;
      if (field === "acceptRecommend") {
        this.acceptRecommend = value;
        if (!value) {
          this.recommendRange = "";
        }
      } else if (field === "isUrgent") {
        this.isUrgent = value;
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
        b: "3cb424cc-1-" + i0,
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
    n: $data.selectedCategory ? 1 : "",
    o: common_vendor.p({
      type: $data.selectedCategory ? "checkmark" : "arrowright",
      size: "16",
      color: "#00BFFF"
    }),
    p: common_vendor.o((...args) => $options.handleSelectCategory && $options.handleSelectCategory(...args)),
    q: common_vendor.p({
      type: "star",
      size: "18",
      color: "#00BFFF"
    }),
    r: common_vendor.f($data.conditions, (condition, index, i0) => {
      return {
        a: "3cb424cc-7-" + i0,
        b: common_vendor.p({
          type: condition.icon,
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
      type: "heart",
      size: "18",
      color: "#FF9F1C"
    }),
    E: $data.acceptRecommend,
    F: common_vendor.o(($event) => $options.handleSwitchChange("acceptRecommend", $event)),
    G: common_vendor.o((...args) => $options.handleToggleRecommend && $options.handleToggleRecommend(...args)),
    H: $data.acceptRecommend
  }, $data.acceptRecommend ? {
    I: $data.recommendRange,
    J: common_vendor.o(($event) => $data.recommendRange = $event.detail.value)
  } : {}, {
    K: common_vendor.p({
      type: "compose",
      size: "18",
      color: "#47B960"
    }),
    L: $data.description,
    M: common_vendor.o(($event) => $data.description = $event.detail.value),
    N: common_vendor.t($data.description.length),
    O: common_vendor.p({
      type: "calendar",
      size: "18",
      color: "#47B960"
    }),
    P: !$data.duration
  }, !$data.duration ? {} : {
    Q: common_vendor.t($data.duration)
  }, {
    R: common_vendor.p({
      type: "right",
      size: "16",
      color: "#999999"
    }),
    S: common_vendor.o((...args) => $options.handleSelectDuration && $options.handleSelectDuration(...args)),
    T: common_vendor.p({
      type: "notification-filled",
      size: "18",
      color: "#47B960"
    }),
    U: $data.isUrgent,
    V: common_vendor.o(($event) => $options.handleSwitchChange("isUrgent", $event)),
    W: common_vendor.o((...args) => $options.handleToggleUrgent && $options.handleToggleUrgent(...args)),
    X: $data.isUrgent
  }, $data.isUrgent ? {
    Y: common_vendor.t($data.budgetRange),
    Z: common_vendor.t($options.calculateTotalPrice())
  } : {}, {
    aa: common_vendor.o((...args) => $options.handleSubmit && $options.handleSubmit(...args))
  });
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../../../.sourcemap/mp-weixin/pages/task/TaskRelease/PurchaseTask/PurchaseTask.js.map
