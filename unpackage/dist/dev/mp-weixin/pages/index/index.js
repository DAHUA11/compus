"use strict";
const common_vendor = require("../../common/vendor.js");
if (!Array) {
  const _component_uni_icons = common_vendor.resolveComponent("uni-icons");
  _component_uni_icons();
}
const _sfc_main = /* @__PURE__ */ common_vendor.defineComponent({
  __name: "index",
  setup(__props) {
    const isRefreshing = common_vendor.ref(false);
    const bannerList = common_vendor.ref([
      {
        imageUrl: "https://readdy.ai/api/search-image?query=Modern%20university%20campus%20scene%20with%20students%20walking%20and%20exchanging%20books%20and%20materials%2C%20bright%20daylight%2C%20vibrant%20atmosphere%2C%20school%20buildings%20in%20background%2C%20natural%20colors%2C%20photorealistic%20style%2C%20high%20quality%20details%2C%20showing%20student%20life%20and%20activities&width=686&height=386&seq=banner1&orientation=landscape"
      },
      {
        imageUrl: "https://readdy.ai/api/search-image?query=Campus%20food%20delivery%20service%20illustration%20showing%20students%20receiving%20food%20packages%2C%20university%20cafeteria%20in%20background%2C%20sunny%20day%2C%20casual%20atmosphere%2C%20photorealistic%20style%2C%20showing%20convenience%20of%20food%20delivery%20on%20campus&width=686&height=386&seq=banner2&orientation=landscape"
      },
      {
        imageUrl: "https://readdy.ai/api/search-image?query=Students%20exchanging%20study%20materials%20and%20textbooks%20in%20university%20library%2C%20bookshelves%20in%20background%2C%20warm%20lighting%2C%20academic%20atmosphere%2C%20photorealistic%20style%2C%20showing%20educational%20resource%20sharing&width=686&height=386&seq=banner3&orientation=landscape"
      }
    ]);
    const taskList = common_vendor.ref([
      {
        type: "delivery",
        typeText: "外卖代拿",
        title: "帮拿麦当劳早餐",
        description: "麦满分+热豆浆，送至9号宿舍楼，顺路即可",
        timeLimit: "今日 8:30前",
        location: "距离500m",
        price: "5.00",
        creditLevel: "钻石用户",
        hint: "3个顺路任务"
      },
      {
        type: "buy",
        typeText: "求购",
        title: "收二手自行车",
        description: "需要一辆二手自行车代步，有变速最好，价格好商量",
        timeLimit: "3天内",
        price: "200.00",
        creditLevel: "金牌用户",
        hint: "比市场低30元"
      },
      {
        type: "express",
        typeText: "快递代取",
        title: "帮取快递",
        description: "菜鸟驿站3个快递，不是很重，送至6号楼",
        timeLimit: "今日 18:00前",
        location: "距离300m",
        price: "8.00",
        creditLevel: "钻石用户"
      },
      {
        type: "sell",
        typeText: "出物",
        title: "出闲置iPad 2020",
        description: "9成新iPad 2020款，128G，带笔和键盘，无磕碰",
        timeLimit: "长期有效",
        price: "2300.00",
        creditLevel: "银牌用户",
        hint: "比市场低500元"
      },
      {
        type: "exchange",
        typeText: "交换",
        title: "考研资料交换",
        description: "有23考研数学全套资料，想换英语或专业课资料",
        timeLimit: "5天内",
        price: "0.00",
        creditLevel: "金牌用户"
      },
      {
        type: "delivery",
        typeText: "外卖代拿",
        title: "食堂打包晚餐",
        description: "一食堂二楼的红烧肉饭+番茄蛋汤，送至4号楼",
        timeLimit: "今日 18:00前",
        location: "距离800m",
        price: "6.00",
        creditLevel: "银牌用户",
        hint: "2个顺路任务"
      }
    ]);
    const getCreditIcon = (level) => {
      if (level.includes("钻石"))
        return "star-filled";
      if (level.includes("金牌"))
        return "medal";
      if (level.includes("银牌"))
        return "medal-filled";
      return "person-filled";
    };
    const getCreditColor = (level) => {
      if (level.includes("钻石"))
        return "#3B7FF3";
      if (level.includes("金牌"))
        return "#FF9500";
      if (level.includes("银牌"))
        return "#8E8E93";
      return "#999999";
    };
    const onRefresh = () => {
      isRefreshing.value = true;
      setTimeout(() => {
        isRefreshing.value = false;
      }, 1e3);
    };
    return (_ctx, _cache) => {
      return {
        a: common_vendor.p({
          type: "bottom",
          size: "14",
          color: "#333"
        }),
        b: common_vendor.p({
          type: "search",
          size: "18",
          color: "#999"
        }),
        c: common_vendor.p({
          type: "mic",
          size: "18",
          color: "#999"
        }),
        d: common_vendor.p({
          type: "plusempty",
          size: "22",
          color: "#FFFFFF"
        }),
        e: common_vendor.f(bannerList.value, (item, index, i0) => {
          return {
            a: item.imageUrl,
            b: index
          };
        }),
        f: common_vendor.p({
          type: "notification",
          size: "18",
          color: "#3B7FF3"
        }),
        g: common_vendor.p({
          type: "plusempty",
          size: "14",
          color: "#FFFFFF"
        }),
        h: common_vendor.p({
          type: "arrowdown",
          size: "14",
          color: "#999"
        }),
        i: common_vendor.f(taskList.value, (item, index, i0) => {
          return common_vendor.e({
            a: common_vendor.t(item.typeText),
            b: common_vendor.n("task-tag-" + item.type),
            c: common_vendor.t(item.title),
            d: "777ae01e-7-" + i0,
            e: common_vendor.p({
              type: getCreditIcon(item.creditLevel),
              size: "14",
              color: getCreditColor(item.creditLevel)
            }),
            f: common_vendor.t(item.creditLevel),
            g: getCreditColor(item.creditLevel),
            h: common_vendor.t(item.description),
            i: "777ae01e-8-" + i0,
            j: common_vendor.t(item.timeLimit),
            k: item.location
          }, item.location ? {
            l: "777ae01e-9-" + i0,
            m: common_vendor.p({
              type: "location",
              size: "14",
              color: "#999"
            }),
            n: common_vendor.t(item.location)
          } : {}, {
            o: common_vendor.t(item.price),
            p: item.hint
          }, item.hint ? {
            q: common_vendor.t(item.hint)
          } : {}, {
            r: index
          });
        }),
        j: common_vendor.p({
          type: "calendar",
          size: "14",
          color: "#999"
        }),
        k: common_vendor.o(onRefresh),
        l: isRefreshing.value,
        m: common_vendor.p({
          type: "home",
          size: "24",
          color: "#3B7FF3"
        }),
        n: common_vendor.p({
          type: "chat",
          size: "24",
          color: "#999"
        }),
        o: common_vendor.p({
          type: "notification",
          size: "24",
          color: "#999"
        }),
        p: common_vendor.p({
          type: "person",
          size: "24",
          color: "#999"
        })
      };
    };
  }
});
wx.createPage(_sfc_main);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/index/index.js.map
