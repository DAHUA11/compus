"use strict";
const common_vendor = require("../../../../common/vendor.js");
const _sfc_main = {
  data() {
    return {
      // 表单数据
      pickupAddress: "",
      // 取货地址
      deliveryAddress: "",
      // 送达地址
      recipientName: "",
      // 收件人姓名
      realPhone: "",
      // 真实电话号码
      virtualPhone: "",
      // 虚拟电话号码
      orderImages: [],
      // 订单截图 (多张，使用数组)
      expectedDeliveryTime: "",
      // 期望送达时间段
      specialRequirements: "",
      // 特殊要求
      hidePhoneNumber: true,
      // 默认隐藏真实号码
      rewardAmount: "",
      // 悬赏金额
      foodQuantity: "1",
      // 外卖份数
      isRush: false,
      // 是否加急
      // 价格计算相关
      basePrice: 5,
      // 基础价格
      perUnitPrice: 2,
      // 每份加价
      distanceSurcharge: 3,
      // 远距离加价
      rushFeeRate: 0.3
      // 加急费率
    };
  },
  computed: {
    // 计算预估价格
    calculatePrice() {
      const quantity = parseInt(this.foodQuantity) || 1;
      const isLongDistance = this.deliveryAddress.includes("留学生公寓");
      let totalPrice = this.basePrice + (quantity - 1) * this.perUnitPrice;
      if (isLongDistance) {
        totalPrice += this.distanceSurcharge;
      }
      if (this.isRush) {
        totalPrice = Math.ceil(totalPrice * (1 + this.rushFeeRate));
      }
      return totalPrice;
    }
  },
  watch: {
    // 监听价格变化，自动填充悬赏金额
    calculatePrice(newPrice) {
      this.rewardAmount = newPrice.toString();
    },
    // 监听地址变化，重新计算价格
    deliveryAddress() {
      const price = this.calculatePrice;
      this.rewardAmount = price.toString();
    },
    foodQuantity() {
      const price = this.calculatePrice;
      this.rewardAmount = price.toString();
    },
    isRush() {
      const price = this.calculatePrice;
      this.rewardAmount = price.toString();
    },
    // 监听真实号码变化，自动生成虚拟号码
    realPhone(newVal) {
      if (newVal) {
        this.virtualPhone = this.generateVirtualPhone();
      }
    }
  },
  methods: {
    // 处理返回按钮点击
    handleBack() {
      common_vendor.index.navigateBack({
        delta: 1,
        fail: () => {
          common_vendor.index.switchTab({
            url: "/pages/index/index"
          });
        }
      });
    },
    // 处理帮助按钮点击
    handleHelp() {
      common_vendor.index.showModal({
        title: "使用帮助",
        content: "1. 请上传清晰的外卖订单截图\n2. 填写准确的取餐和送达地址\n3. 选择合适的外卖份数\n4. 可选择是否加急配送\n5. 确认悬赏金额后发布",
        showCancel: false,
        confirmText: "我知道了"
      });
    },
    // 处理份数变化
    handleQuantityChange(value) {
      this.foodQuantity = value;
    },
    // 生成虚拟号码
    generateVirtualPhone() {
      const prefix = "1";
      const middle = Math.floor(Math.random() * 1e9).toString().padStart(9, "0");
      return prefix + middle;
    },
    // 处理上传订单截图
    handleUploadOrder() {
      common_vendor.index.chooseImage({
        count: 9,
        // 最多可选择的图片数量
        sizeType: ["original", "compressed"],
        // 可以指定是原图还是压缩图，默认二者都有
        sourceType: ["album", "camera"],
        // 可以指定来源是相册还是相机，默认二者都有
        success: (res) => {
          this.orderImages = [...this.orderImages, ...res.tempFilePaths];
          common_vendor.index.__f__("log", "at pages/task/TaskRelease/TakeoutTask/TakeoutTask.vue:391", "选择图片成功", this.orderImages);
        },
        fail: (err) => {
          common_vendor.index.__f__("error", "at pages/task/TaskRelease/TakeoutTask/TakeoutTask.vue:394", "选择图片失败:", err);
          common_vendor.index.showToast({
            title: "选择图片失败",
            icon: "none"
          });
        }
      });
    },
    // 处理图片预览
    previewImage(current) {
      common_vendor.index.previewImage({
        current,
        // 当前显示图片的链接
        urls: this.orderImages
        // 需要预览的图片链接列表
      });
    },
    // 处理删除图片
    deleteImage(index) {
      this.orderImages.splice(index, 1);
    },
    // 自动填充宿舍信息
    handleAutoFillDormitory() {
      const userInfo = {
        name: "张三",
        dormitory: "3栋502室",
        phone: "13812345678"
      };
      this.recipientName = userInfo.name;
      this.deliveryAddress = userInfo.dormitory;
      this.realPhone = userInfo.phone;
      this.virtualPhone = this.generateVirtualPhone();
      common_vendor.index.showToast({
        title: "信息已自动填充",
        icon: "success",
        duration: 2e3
      });
    },
    // 处理选择送达时间
    handleSelectDeliveryTime() {
      const timeOptions = [];
      const startHour = 10;
      const startMinute = 30;
      const endHour = 20;
      const endMinute = 30;
      let currentHour = startHour;
      let currentMinute = startMinute;
      while (currentHour < endHour || currentHour === endHour && currentMinute <= endMinute) {
        timeOptions.push(`${currentHour.toString().padStart(2, "0")}:${currentMinute.toString().padStart(2, "0")}`);
        currentMinute += 15;
        if (currentMinute >= 60) {
          currentMinute = 0;
          currentHour++;
        }
      }
      common_vendor.index.showActionSheet({
        itemList: timeOptions,
        success: (res) => {
          this.expectedDeliveryTime = timeOptions[res.tapIndex];
        }
      });
    },
    // 处理提交
    handleSubmit() {
      if (!this.pickupAddress) {
        common_vendor.index.showToast({
          title: "请输入取餐地址",
          icon: "none"
        });
        return;
      }
      if (!this.deliveryAddress) {
        common_vendor.index.showToast({
          title: "请输入送达地址",
          icon: "none"
        });
        return;
      }
      if (!this.recipientName) {
        common_vendor.index.showToast({
          title: "请输入收件人姓名",
          icon: "none"
        });
        return;
      }
      if (!this.realPhone) {
        common_vendor.index.showToast({
          title: "请输入联系电话",
          icon: "none"
        });
        return;
      }
      if (!this.foodQuantity) {
        common_vendor.index.showToast({
          title: "请输入外卖份数",
          icon: "none"
        });
        return;
      }
      if (!this.rewardAmount) {
        common_vendor.index.showToast({
          title: "请输入悬赏金额",
          icon: "none"
        });
        return;
      }
      if (!this.expectedDeliveryTime) {
        common_vendor.index.showToast({
          title: "请选择期望送达时间",
          icon: "none"
        });
        return;
      }
      const taskData = {
        type: "takeout",
        // 外卖代拿任务类型
        status: "pending",
        // 初始状态为待接单
        title: "外卖代拿",
        // 固定标题
        description: this.specialRequirements || "无特殊要求",
        // 特殊要求，如果没有则显示"无特殊要求"
        reward: parseFloat(this.rewardAmount) || 0,
        // 赏金金额
        publishTime: (/* @__PURE__ */ new Date()).toLocaleString("zh-CN"),
        // 发布时间
        expectedDeliveryTime: this.expectedDeliveryTime,
        // 期望送达时间段
        pickupAddress: this.pickupAddress,
        // 取货地址
        deliveryAddress: this.deliveryAddress,
        // 送达地址
        latestUpdate: "等待接单中",
        // 添加初始最新动态
        images: this.orderImages,
        // 添加订单截图数组
        contactName: this.recipientName,
        // 添加收件人姓名
        contactPhone: this.realPhone,
        // 添加联系电话
        publisher: {
          // 发布者信息
          id: "currentUserId",
          nickname: "当前用户昵称",
          avatar: "/static/avatar.png",
          creditRating: 5
        }
      };
      common_vendor.index.showLoading({
        title: "发布中..."
      });
      setTimeout(() => {
        common_vendor.index.hideLoading();
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
      }, 1500);
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
    b: $data.orderImages.length < 9
  }, $data.orderImages.length < 9 ? {
    c: common_vendor.p({
      type: "camera",
      size: "24",
      color: "#999999"
    }),
    d: common_vendor.o((...args) => $options.handleUploadOrder && $options.handleUploadOrder(...args))
  } : {}, {
    e: $data.orderImages.length > 0
  }, $data.orderImages.length > 0 ? {
    f: common_vendor.f($data.orderImages, (image, index, i0) => {
      return {
        a: image,
        b: common_vendor.o(($event) => $options.previewImage(image), index),
        c: "7253bae6-2-" + i0,
        d: common_vendor.o(($event) => $options.deleteImage(index), index),
        e: index
      };
    }),
    g: common_vendor.p({
      type: "clear",
      size: "16",
      color: "#fff"
    })
  } : {}, {
    h: common_vendor.p({
      type: "location",
      size: "18",
      color: "#00BFFF"
    }),
    i: $data.pickupAddress,
    j: common_vendor.o(($event) => $data.pickupAddress = $event.detail.value),
    k: common_vendor.p({
      type: "home-filled",
      size: "14",
      color: "#00BFFF"
    }),
    l: common_vendor.o((...args) => $options.handleAutoFillDormitory && $options.handleAutoFillDormitory(...args)),
    m: common_vendor.p({
      type: "location-filled",
      size: "18",
      color: "#00BFFF"
    }),
    n: $data.deliveryAddress,
    o: common_vendor.o(($event) => $data.deliveryAddress = $event.detail.value),
    p: common_vendor.p({
      type: "person",
      size: "18",
      color: "#00BFFF"
    }),
    q: $data.recipientName,
    r: common_vendor.o(($event) => $data.recipientName = $event.detail.value),
    s: common_vendor.p({
      type: "phone",
      size: "18",
      color: "#00BFFF"
    }),
    t: $data.realPhone,
    v: common_vendor.o(($event) => $data.realPhone = $event.detail.value),
    w: common_vendor.p({
      type: "calendar",
      size: "18",
      color: "#FF9F1C"
    }),
    x: !$data.expectedDeliveryTime
  }, !$data.expectedDeliveryTime ? {} : {
    y: common_vendor.t($data.expectedDeliveryTime)
  }, {
    z: $data.expectedDeliveryTime ? 1 : "",
    A: common_vendor.p({
      type: "right",
      size: "16",
      color: "#999999"
    }),
    B: common_vendor.o((...args) => $options.handleSelectDeliveryTime && $options.handleSelectDeliveryTime(...args)),
    C: common_vendor.p({
      type: "info",
      size: "18",
      color: "#47B960"
    }),
    D: $data.specialRequirements,
    E: common_vendor.o(($event) => $data.specialRequirements = $event.detail.value),
    F: common_vendor.t($data.specialRequirements.length),
    G: common_vendor.p({
      type: "list",
      size: "18",
      color: "#FF9F1C"
    }),
    H: $data.foodQuantity,
    I: common_vendor.o(($event) => $options.handleQuantityChange($event.detail.value)),
    J: $data.foodQuantity && $data.foodQuantity !== ""
  }, $data.foodQuantity && $data.foodQuantity !== "" ? common_vendor.e({
    K: common_vendor.t($options.calculatePrice),
    L: common_vendor.t($data.basePrice),
    M: common_vendor.t((parseInt($data.foodQuantity) - 1) * $data.perUnitPrice),
    N: $data.deliveryAddress.includes("留学生公寓")
  }, $data.deliveryAddress.includes("留学生公寓") ? {
    O: common_vendor.t($data.distanceSurcharge)
  } : {}, {
    P: $data.isRush
  }, $data.isRush ? {} : {}, {
    Q: $data.isRush,
    R: common_vendor.o((e) => $data.isRush = e.detail.value),
    S: $data.isRush
  }, $data.isRush ? {
    T: common_vendor.p({
      type: "checkmarkempty",
      size: "14",
      color: "#47B960"
    }),
    U: common_vendor.p({
      type: "checkmarkempty",
      size: "14",
      color: "#47B960"
    })
  } : {}) : {}, {
    V: common_vendor.p({
      type: "wallet",
      size: "18",
      color: "#FF9F1C"
    }),
    W: $data.rewardAmount,
    X: common_vendor.o(($event) => $data.rewardAmount = $event.detail.value),
    Y: common_vendor.o((...args) => $options.handleSubmit && $options.handleSubmit(...args))
  });
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../../../.sourcemap/mp-weixin/pages/task/TaskRelease/TakeoutTask/TakeoutTask.js.map
