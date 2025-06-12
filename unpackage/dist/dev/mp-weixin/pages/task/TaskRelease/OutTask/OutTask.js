"use strict";
const common_vendor = require("../../../../common/vendor.js");
const _sfc_main = {
  data() {
    return {
      // 商品成色选项
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
      // 价格范围
      contactName: "",
      // 联系人姓名
      contactPhone: "",
      // 联系电话
      description: "",
      // 商品描述
      duration: "7",
      // 有效期
      isUrgent: false
      // 加急发布
    };
  },
  methods: {
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
    // 处理加急开关
    handleToggleUrgent() {
      this.isUrgent = !this.isUrgent;
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
        status: "pending",
        title: this.itemName,
        description: this.description,
        reward: parseFloat(this.calculateTotalPrice()),
        publishTime: (/* @__PURE__ */ new Date()).toLocaleString("zh-CN"),
        images: this.images,
        latestUpdate: "等待接单中",
        contactName: this.contactName,
        contactPhone: this.contactPhone,
        selectedCondition: this.selectedCondition,
        tags: this.isUrgent ? ["加急"] : [],
        publisher: {
          id: "currentUserId",
          nickname: "当前用户昵称",
          avatar: "/static/avatar.png",
          creditRating: 5
        }
      };
      common_vendor.index.showToast({
        title: "发布成功",
        icon: "success",
        success: () => {
          const taskInfoString = encodeURIComponent(JSON.stringify(taskData));
          common_vendor.index.navigateTo({ url: `/pages/task/TaskDetail/TaskDetail?taskInfo=${taskInfoString}` });
        }
      });
    },
    // 统一处理switch变化
    handleSwitchChange(field, event) {
      const value = event.detail.value;
      if (field === "isUrgent") {
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
        a: "2d314d34-7-" + i0,
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
      type: "notification-filled",
      size: "18",
      color: "#FF9F1C"
    }),
    E: $data.isUrgent,
    F: common_vendor.o(($event) => $options.handleSwitchChange("isUrgent", $event)),
    G: common_vendor.o((...args) => $options.handleToggleUrgent && $options.handleToggleUrgent(...args)),
    H: $data.isUrgent
  }, $data.isUrgent ? {
    I: common_vendor.t($data.budgetRange),
    J: common_vendor.t($options.calculateTotalPrice())
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
    T: common_vendor.o((...args) => $options.handleSubmit && $options.handleSubmit(...args))
  });
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../../../.sourcemap/mp-weixin/pages/task/TaskRelease/OutTask/OutTask.js.map
