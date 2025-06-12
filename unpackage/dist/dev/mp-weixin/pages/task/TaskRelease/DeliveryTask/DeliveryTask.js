"use strict";
const common_vendor = require("../../../../common/vendor.js");
const _sfc_main = {
  data() {
    return {
      // 表单数据
      pickupAddress: "",
      // 取件地址
      deliveryAddress: "",
      // 送达地址
      recipientName: "",
      // 收件人姓名
      contactPhone: "",
      // 联系电话
      trackingNumber: "",
      // 快递单号
      itemDescription: "",
      // 快递物品描述
      weight: "",
      // 大概重量
      expectedDeliveryTime: "",
      // 期望送达时间
      specialRequirements: "",
      // 特殊要求
      isInsured: false,
      // 是否保价
      insuranceAmount: "",
      // 保价金额
      manualReward: "",
      // 手动输入的悬赏金额
      isUrgent: false,
      // 价格相关
      priceRange: [],
      // 价格区间
      priceExplanation: "",
      // 价格说明
      // 日期选项
      dateOptions: [
        { label: "今天", value: (/* @__PURE__ */ new Date()).toISOString().split("T")[0] },
        { label: "明天", value: new Date(Date.now() + 24 * 60 * 60 * 1e3).toISOString().split("T")[0] },
        { label: "后天", value: new Date(Date.now() + 2 * 24 * 60 * 60 * 1e3).toISOString().split("T")[0] }
      ],
      // 时间段选项
      timeSlots: Array.from({ length: 11 }, (_, i) => {
        const hour = i + 9;
        const endHour = hour + 1;
        return `${hour.toString().padStart(2, "0")}:00-${endHour.toString().padStart(2, "0")}:00`;
      }),
      selectedDateIndex: -1,
      selectedTimeSlotIndex: -1,
      // 地址选项
      pickupAddressOptions: [
        { value: "校内中邮", label: "校内中邮" },
        { value: "西门菜鸟", label: "西门菜鸟" },
        { value: "校内顺风", label: "校内顺风" },
        { value: "西门小蜜蜂", label: "西门小蜜蜂" }
      ],
      deliveryAddressOptions: [
        { value: "鹿田", label: "鹿田" },
        { value: "龙北", label: "龙北" },
        { value: "龙南", label: "龙南" }
      ]
    };
  },
  computed: {
    multiPickerRange() {
      return [
        this.dateOptions.map((d) => d.label),
        this.timeSlots
      ];
    },
    multiPickerValue() {
      return [
        this.selectedDateIndex === -1 ? 0 : this.selectedDateIndex,
        this.selectedTimeSlotIndex === -1 ? 0 : this.selectedTimeSlotIndex
      ];
    }
  },
  watch: {
    weight: {
      handler: "calculatePrice",
      immediate: true
    }
  },
  methods: {
    onMultiPickerChange(e) {
      const [dateIdx, timeSlotIdx] = e.detail.value;
      this.selectedDateIndex = dateIdx;
      this.selectedTimeSlotIndex = timeSlotIdx;
      this.updateExpectedDeliveryTime();
    },
    updateExpectedDeliveryTime() {
      if (this.selectedDateIndex !== -1 && this.selectedTimeSlotIndex !== -1) {
        this.expectedDeliveryTime = `${this.dateOptions[this.selectedDateIndex].value} ${this.timeSlots[this.selectedTimeSlotIndex]}`;
      }
    },
    handleSelectPickupAddress() {
      common_vendor.index.showActionSheet({
        itemList: this.pickupAddressOptions.map((option) => option.label),
        success: (res) => {
          this.pickupAddress = this.pickupAddressOptions[res.tapIndex].value;
        }
      });
    },
    handleGetCurrentLocation() {
      common_vendor.index.getLocation({
        type: "gcj02",
        success: (res) => {
          const { latitude, longitude } = res;
          common_vendor.index.request({
            url: `https://apis.map.qq.com/ws/geocoder/v1/?location=${latitude},${longitude}&key=YOUR_MAP_KEY`,
            success: (result) => {
              if (result.data.status === 0) {
                const address = result.data.result.address;
                this.deliveryAddress = address;
                common_vendor.index.showToast({
                  title: "已获取当前位置",
                  icon: "success"
                });
              } else {
                common_vendor.index.showToast({
                  title: "获取地址失败",
                  icon: "none"
                });
              }
            },
            fail: () => {
              common_vendor.index.showToast({
                title: "获取地址失败",
                icon: "none"
              });
            }
          });
        },
        fail: () => {
          common_vendor.index.showToast({
            title: "获取位置失败",
            icon: "none"
          });
        }
      });
    },
    handleSelectDeliveryAddress() {
      common_vendor.index.showActionSheet({
        itemList: [...this.deliveryAddressOptions.map((option) => option.label), "手动输入"],
        success: (res) => {
          if (res.tapIndex < this.deliveryAddressOptions.length) {
            this.deliveryAddress = this.deliveryAddressOptions[res.tapIndex].value;
          }
        }
      });
    },
    handleAutoFillRecipient() {
      common_vendor.index.showToast({
        title: "自动填充功能待实现",
        icon: "none"
      });
    },
    handleCopyPhoneNumber() {
      if (this.contactPhone) {
        common_vendor.index.setClipboardData({
          data: this.contactPhone,
          success: () => {
            common_vendor.index.showToast({
              title: "手机号已复制",
              icon: "success"
            });
          }
        });
      } else {
        common_vendor.index.showToast({
          title: "手机号为空",
          icon: "none"
        });
      }
    },
    handleToggleInsurance() {
      this.isInsured = !this.isInsured;
      if (!this.isInsured) {
        this.insuranceAmount = "";
      }
    },
    handleUrgentChange(e) {
      this.isUrgent = e.detail.value;
    },
    calculateTotalReward() {
      const baseReward = parseFloat(this.manualReward) || 0;
      if (this.isUrgent) {
        return (baseReward * 1.3).toFixed(2);
      }
      return baseReward.toFixed(2);
    },
    handleSubmit() {
      if (!this.pickupAddress) {
        common_vendor.index.showToast({
          title: "请输入取件地址",
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
      if (!this.expectedDeliveryTime) {
        common_vendor.index.showToast({
          title: "请选择期望送达时间",
          icon: "none"
        });
        return;
      }
      if (!this.manualReward) {
        common_vendor.index.showToast({
          title: "请输入赏金金额",
          icon: "none"
        });
        return;
      }
      if (!this.specialRequirements) {
        common_vendor.index.showToast({
          title: "请填写详细描述",
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
      if (!this.contactPhone) {
        common_vendor.index.showToast({
          title: "请输入联系电话",
          icon: "none"
        });
        return;
      }
      const taskData = {
        type: "express",
        status: "pending",
        title: "快递代取",
        description: this.specialRequirements,
        tags: this.isUrgent ? ["加急"] : [],
        reward: parseFloat(this.calculateTotalReward()),
        publishTime: (/* @__PURE__ */ new Date()).toLocaleString("zh-CN"),
        expectedDeliveryTime: this.expectedDeliveryTime,
        pickupAddress: this.pickupAddress,
        deliveryAddress: this.deliveryAddress,
        trackingNumber: this.trackingNumber,
        contactName: this.recipientName,
        contactPhone: this.contactPhone,
        latestUpdate: "等待接单中",
        images: [],
        publisher: {
          id: "currentUserId",
          nickname: "当前用户昵称",
          avatar: "/static/avatar.png",
          creditRating: 5
        }
      };
      common_vendor.index.__f__("log", "at pages/task/TaskRelease/DeliveryTask/DeliveryTask.vue:536", "提交的任务数据:", taskData);
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
    calculatePrice() {
      if (this.weight) {
        const weightValue = parseFloat(this.weight);
        if (weightValue <= 1) {
          this.priceRange = [5, 8];
          this.priceExplanation = "1千克以内（含1千克）：基础价5元 + 重量浮动0-3元";
        } else if (weightValue <= 3) {
          this.priceRange = [8, 12];
          this.priceExplanation = "1-3千克（含3千克）：基础价8元 + 重量浮动0-4元";
        } else if (weightValue <= 5) {
          this.priceRange = [12, 18];
          this.priceExplanation = "3-5千克（含5千克）：基础价12元 + 重量浮动0-6元";
        } else {
          this.priceRange = [18, 25];
          this.priceExplanation = "5千克以上：基础价18元 + 重量浮动0-7元";
        }
      } else {
        this.priceRange = [];
        this.priceExplanation = "";
      }
    },
    handleAutoFillDormitory() {
      common_vendor.index.showToast({
        title: "自动填充功能待实现",
        icon: "none"
      });
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
      type: "location",
      size: "18",
      color: "#00BFFF"
    }),
    b: !$data.pickupAddress
  }, !$data.pickupAddress ? {} : {
    c: common_vendor.t($data.pickupAddress)
  }, {
    d: common_vendor.p({
      type: "right",
      size: "16",
      color: "#999999"
    }),
    e: common_vendor.o((...args) => $options.handleSelectPickupAddress && $options.handleSelectPickupAddress(...args)),
    f: common_vendor.p({
      type: "list",
      size: "18",
      color: "#00BFFF"
    }),
    g: $data.trackingNumber,
    h: common_vendor.o(($event) => $data.trackingNumber = $event.detail.value),
    i: common_vendor.p({
      type: "home-filled",
      size: "14",
      color: "#00BFFF"
    }),
    j: common_vendor.o((...args) => $options.handleAutoFillDormitory && $options.handleAutoFillDormitory(...args)),
    k: common_vendor.p({
      type: "location-filled",
      size: "18",
      color: "#00BFFF"
    }),
    l: !$data.deliveryAddress
  }, !$data.deliveryAddress ? {} : {
    m: common_vendor.t($data.deliveryAddress)
  }, {
    n: common_vendor.p({
      type: "right",
      size: "16",
      color: "#999999"
    }),
    o: common_vendor.o((...args) => $options.handleSelectDeliveryAddress && $options.handleSelectDeliveryAddress(...args)),
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
    t: $data.contactPhone,
    v: common_vendor.o(($event) => $data.contactPhone = $event.detail.value),
    w: common_vendor.p({
      type: "info",
      size: "18",
      color: "#00BFFF"
    }),
    x: common_vendor.o([($event) => $data.weight = $event.detail.value, (...args) => $options.calculatePrice && $options.calculatePrice(...args)]),
    y: $data.weight,
    z: common_vendor.p({
      type: "wallet",
      size: "18",
      color: "#FF9F1C"
    }),
    A: $data.priceRange.length > 0
  }, $data.priceRange.length > 0 ? {
    B: common_vendor.t($data.priceRange[0]),
    C: common_vendor.t($data.priceRange[1])
  } : {}, {
    D: $data.priceExplanation
  }, $data.priceExplanation ? {
    E: common_vendor.t($data.priceExplanation)
  } : {}, {
    F: common_vendor.p({
      type: "wallet",
      size: "18",
      color: "#FF9F1C"
    }),
    G: $data.manualReward,
    H: common_vendor.o(($event) => $data.manualReward = $event.detail.value),
    I: common_vendor.p({
      type: "calendar",
      size: "18",
      color: "#FF9F1C"
    }),
    J: $data.expectedDeliveryTime
  }, $data.expectedDeliveryTime ? {
    K: common_vendor.t($data.expectedDeliveryTime)
  } : {}, {
    L: $options.multiPickerRange,
    M: $options.multiPickerValue,
    N: common_vendor.o((...args) => $options.onMultiPickerChange && $options.onMultiPickerChange(...args)),
    O: common_vendor.p({
      type: "notification-filled",
      size: "18",
      color: "#FF9F1C"
    }),
    P: $data.isUrgent,
    Q: common_vendor.o((...args) => $options.handleUrgentChange && $options.handleUrgentChange(...args)),
    R: common_vendor.o((...args) => _ctx.handleToggleUrgent && _ctx.handleToggleUrgent(...args)),
    S: $data.isUrgent
  }, $data.isUrgent ? {
    T: common_vendor.t($data.manualReward),
    U: common_vendor.t($options.calculateTotalReward())
  } : {}, {
    V: common_vendor.p({
      type: "info",
      size: "18",
      color: "#47B960"
    }),
    W: $data.specialRequirements,
    X: common_vendor.o(($event) => $data.specialRequirements = $event.detail.value),
    Y: common_vendor.t($data.specialRequirements.length),
    Z: common_vendor.o((...args) => $options.handleSubmit && $options.handleSubmit(...args))
  });
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../../../.sourcemap/mp-weixin/pages/task/TaskRelease/DeliveryTask/DeliveryTask.js.map
