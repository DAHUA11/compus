"use strict";
const common_vendor = require("../../common/vendor.js");
if (!Array) {
  const _easycom_uni_icons2 = common_vendor.resolveComponent("uni-icons");
  _easycom_uni_icons2();
}
const _easycom_uni_icons = () => "../../uni_modules/uni-icons/components/uni-icons/uni-icons.js";
if (!Math) {
  _easycom_uni_icons();
}
const _sfc_main = /* @__PURE__ */ common_vendor.defineComponent({
  __name: "index",
  setup(__props) {
    const isRefreshing = common_vendor.ref(false);
    const hasMore = common_vendor.ref(true);
    const filteredTasks = common_vendor.ref([]);
    const page = common_vendor.ref(1);
    const pageSize = common_vendor.ref(10);
    const filterType = common_vendor.ref("all");
    const sortType = common_vendor.ref("smart");
    const searchQuery = common_vendor.ref("");
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
    const loadTasks = () => {
      try {
        const tasks = common_vendor.index.getStorageSync("taskList");
        if (tasks) {
          const allTasks = JSON.parse(tasks);
          page.value = 1;
          filteredTasks.value = allTasks.slice(0, pageSize.value);
          hasMore.value = allTasks.length > pageSize.value;
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/index/index.vue:230", "本地数据解析失败:", error);
        filteredTasks.value = [];
      }
    };
    const loadMoreTasks = () => {
      if (!hasMore.value)
        return;
      hasMore.value = false;
      setTimeout(() => {
        try {
          const tasks = common_vendor.index.getStorageSync("taskList");
          if (tasks) {
            const allTasks = JSON.parse(tasks);
            const start = page.value * pageSize.value;
            const end = start + pageSize.value;
            const newTasks = allTasks.slice(start, end);
            if (newTasks.length > 0) {
              filteredTasks.value = [...filteredTasks.value, ...newTasks];
              page.value++;
              hasMore.value = allTasks.length > end;
            } else {
              hasMore.value = false;
            }
          }
        } catch (error) {
          common_vendor.index.__f__("error", "at pages/index/index.vue:262", "加载更多任务失败:", error);
          hasMore.value = false;
        }
      }, 1e3);
    };
    const handleNewTask = (taskData) => {
      common_vendor.index.__f__("log", "at pages/index/index.vue:270", "[index.vue] handleNewTask 接收到新任务数据:", taskData);
      const existingTaskIndex = filteredTasks.value.findIndex((task) => task.id === taskData.id);
      if (existingTaskIndex !== -1) {
        common_vendor.index.__f__("log", "at pages/index/index.vue:274", "任务已存在，跳过添加:", taskData.id);
        return;
      }
      filteredTasks.value.unshift(taskData);
      common_vendor.index.__f__("log", "at pages/index/index.vue:280", "[index.vue] handleNewTask 添加后 filteredTasks:", filteredTasks.value);
      try {
        const tasks = common_vendor.index.getStorageSync("taskList");
        const allTasks = tasks ? JSON.parse(tasks) : [];
        allTasks.unshift(taskData);
        common_vendor.index.setStorageSync("taskList", JSON.stringify(allTasks));
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/index/index.vue:289", "更新任务列表失败:", error);
      }
    };
    const onRefresh = () => {
      isRefreshing.value = true;
      loadTasks();
      setTimeout(() => {
        isRefreshing.value = false;
      }, 1e3);
    };
    common_vendor.onLoad(() => {
      common_vendor.index.removeStorageSync("taskList");
      loadTasksFromCloud(1, 10, filterType.value, searchQuery.value);
    });
    common_vendor.onShow(() => {
      loadTasksFromCloud(1, 10, filterType.value, searchQuery.value);
    });
    common_vendor.onMounted(() => {
      common_vendor.index.$on("newTaskPublished", handleNewTask);
    });
    common_vendor.onUnmounted(() => {
      common_vendor.index.$off("newTaskPublished", handleNewTask);
    });
    const goTaskRelease = () => {
      common_vendor.index.navigateTo({
        url: "/pages/task/TaskRelease/TaskRelease"
      });
    };
    const handleTakeTask = (task) => {
      common_vendor.index.showModal({
        title: "确认接单",
        content: "确定要接这个任务吗？",
        success: async (res) => {
          if (res.confirm) {
            try {
              const result = await common_vendor.nr.callFunction({
                name: "updateTaskStatus",
                data: {
                  taskId: task.id,
                  status: "processing",
                  acceptorId: "user_123",
                  // 当前用户ID，实际项目中应该从用户信息获取
                  acceptorName: "当前用户",
                  // 当前用户昵称
                  acceptorAvatar: "/static/images/avatar1.png"
                  // 当前用户头像
                }
              });
              if (result.result.code === 200) {
                task.status = "processing";
                task.acceptor_id = "user_123";
                task.acceptor_name = "当前用户";
                task.acceptor_avatar = "/static/images/avatar1.png";
                const idx = filteredTasks.value.findIndex((t) => t.id === task.id);
                if (idx !== -1) {
                  filteredTasks.value[idx] = { ...task };
                }
                try {
                  const tasks = common_vendor.index.getStorageSync("taskList");
                  let allTasks = tasks ? JSON.parse(tasks) : [];
                  const allIdx = allTasks.findIndex((t) => t.id === task.id);
                  if (allIdx !== -1) {
                    allTasks[allIdx] = { ...task };
                    common_vendor.index.setStorageSync("taskList", JSON.stringify(allTasks));
                  }
                } catch (e) {
                  common_vendor.index.__f__("error", "at pages/index/index.vue:397", "本地任务同步失败", e);
                }
                common_vendor.index.showToast({
                  title: "接单成功，正在跳转聊天",
                  icon: "success"
                });
                setTimeout(() => {
                  common_vendor.index.navigateTo({
                    url: `/pages/message/Chat/Chat?taskId=${task.id}`
                  });
                }, 800);
              } else {
                throw new Error(result.result.msg || "接单失败");
              }
            } catch (error) {
              common_vendor.index.__f__("error", "at pages/index/index.vue:416", "接单失败:", error);
              common_vendor.index.showToast({
                title: "接单失败，请重试",
                icon: "none"
              });
            }
          }
        }
      });
    };
    const navigateToDetail = (task) => {
      common_vendor.index.navigateTo({
        url: `/pages/task/TaskDetail/TaskDetail?id=${task.id}`,
        success: (res) => {
          res.eventChannel.emit("taskData", { task });
        }
      });
    };
    const getTaskTypeColor = (type) => {
      const colorMap = {
        "express": "#00BFFF",
        "takeout": "#FF9500",
        "buy": "#4CD964",
        "sell": "#FF3B30",
        "other": "#8E8E93"
      };
      return colorMap[type] || "#8E8E93";
    };
    const getTaskTypeIcon = (type) => {
      const iconMap = {
        "express": "paperplane",
        "takeout": "shop",
        "buy": "cart",
        "sell": "gift"
      };
      return iconMap[type] || "info";
    };
    const getTaskTypeName = (type) => {
      const nameMap = {
        "all": "全部分类",
        "express": "快递",
        "takeout": "外卖",
        "buy": "求购",
        "sell": "出物",
        "other": "其他"
      };
      return nameMap[type] || "其他";
    };
    const getTaskStatusText = (status) => {
      const statusMap = {
        "pending": "待接单",
        "processing": "进行中",
        "completed": "已完成",
        "cancelled": "已取消"
      };
      return statusMap[status] || "未知状态";
    };
    const getTagClass = (tag) => {
      return `tag-${tag.toLowerCase()}`;
    };
    const getTagIcon = (tag) => {
      const iconMap = {
        "urgent": "fire",
        "new": "star",
        "hot": "fire-filled"
      };
      return iconMap[tag.toLowerCase()] || "";
    };
    const getTagColor = (tag) => {
      const colorMap = {
        "urgent": "#FF3B30",
        "new": "#4CD964",
        "hot": "#FF9500"
      };
      return colorMap[tag.toLowerCase()] || "#8E8E93";
    };
    const getConditionText = (condition) => {
      const conditionMap = {
        "new": "全新",
        "like-new": "九成新",
        "good": "八成新",
        "fair": "七成新"
      };
      return conditionMap[condition] || "";
    };
    const getFormattedTitle = (task) => {
      if (!task)
        return "未知任务";
      switch (task.type) {
        case "buy":
          return `求购${task.itemName || ""}${task.selectedCondition ? `(${getConditionText(task.selectedCondition)})` : ""}`;
        case "express":
          return `${task.pickupAddress || ""}快递代取`;
        case "sell":
          return `出${task.selectedCondition ? getConditionText(task.selectedCondition) : ""}${task.itemName || ""}`;
        case "takeout":
          return `${task.pickupAddress || ""}外卖代拿`;
        case "other":
          return task.title || "其他任务";
        default:
          return task.title;
      }
    };
    const maskAddress = (address) => {
      if (!address)
        return "";
      return address.replace(/(\d{3})\d+(\d{4})/, "$1****$2");
    };
    const getSortTypeText = (type) => {
      const sortMap = {
        "smart": "综合排序",
        "time": "最新发布",
        "price": "悬赏最高",
        "distance": "距离最近"
      };
      return sortMap[type] || "综合排序";
    };
    const getSortIcon = (type) => {
      const iconMap = {
        "smart": "star",
        // 综合排序用星形图标
        "time": "calendar",
        // 最新发布用日历图标
        "price": "wallet",
        // 悬赏最高用钱包图标
        "distance": "location-filled"
        // 距离最近用定位图标
      };
      return iconMap[type] || "info";
    };
    const handleCategoryFilter = () => {
      const itemList = ["全部", "快递代取", "外卖代拿", "求购", "出物", "其他"];
      common_vendor.index.showActionSheet({
        itemList,
        success: (res) => {
          const selectedType = itemList[res.tapIndex];
          const typeMap = {
            "全部": "all",
            "快递代取": "express",
            "外卖代拿": "takeout",
            "求购": "buy",
            "出物": "sell",
            "其他": "other"
          };
          filterType.value = typeMap[selectedType];
        }
      });
    };
    const handleSortFilter = () => {
      const itemList = ["综合排序", "最新发布", "悬赏最高", "距离最近"];
      common_vendor.index.showActionSheet({
        itemList,
        success: (res) => {
          const selectedSort = itemList[res.tapIndex];
          const sortMap = {
            "综合排序": "smart",
            "最新发布": "time",
            "悬赏最高": "price",
            "距离最近": "distance"
          };
          sortType.value = sortMap[selectedSort];
        }
      });
    };
    const handleSearch = () => {
      common_vendor.index.__f__("log", "at pages/index/index.vue:611", "执行搜索:", searchQuery.value);
    };
    const handleVoiceSearch = () => {
      common_vendor.index.showToast({
        title: "语音搜索功能待开发",
        icon: "none"
      });
      common_vendor.index.__f__("log", "at pages/index/index.vue:621", "语音搜索");
    };
    const filteredAndSortedTasks = common_vendor.computed(() => {
      common_vendor.index.__f__("log", "at pages/index/index.vue:626", "[筛选前任务数]", filteredTasks.value.length);
      let result = [...filteredTasks.value];
      if (filterType.value !== "all") {
        result = result.filter((task) => task.type === filterType.value);
        common_vendor.index.__f__("log", "at pages/index/index.vue:632", `[按类型${filterType.value}筛选后]`, result.length);
      }
      switch (sortType.value) {
        case "time":
          result.sort((a, b) => new Date(b.publishTime).getTime() - new Date(a.publishTime).getTime());
          break;
        case "price":
          result.sort((a, b) => b.reward - a.reward);
          break;
        case "distance":
          result.sort((a, b) => (a.distance || Infinity) - (b.distance || Infinity));
          break;
        case "smart":
        default:
          result.sort((a, b) => {
            return (b.views || 0) - (a.views || 0) || new Date(b.publishTime).getTime() - new Date(a.publishTime).getTime();
          });
      }
      return result;
    });
    const searchTasks = common_vendor.computed(() => {
      if (!searchQuery.value.trim())
        return filteredAndSortedTasks.value;
      const query = searchQuery.value.toLowerCase();
      return filteredAndSortedTasks.value.filter((task) => {
        const title = getFormattedTitle(task).toLowerCase();
        const tags = (task.tags || []).join("").toLowerCase();
        const address = (task.pickupAddress || task.deliveryAddress || "").toLowerCase();
        return title.includes(query) || tags.includes(query) || address.includes(query);
      });
    });
    const formatPublishTime = (time) => {
      if (!time)
        return "";
      const date = new Date(time);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      const hours = String(date.getHours()).padStart(2, "0");
      const minutes = String(date.getMinutes()).padStart(2, "0");
      return `${year}-${month}-${day} ${hours}:${minutes}`;
    };
    const loadTasksFromCloud = async (page2 = 1, pageSize2 = 10, type = "", keyword = "") => {
      common_vendor.index.showLoading({ title: "加载中..." });
      try {
        const res = await common_vendor.nr.callFunction({
          name: "getTaskList",
          data: { page: page2, pageSize: pageSize2, type, keyword }
        });
        common_vendor.index.hideLoading();
        common_vendor.index.__f__("log", "at pages/index/index.vue:693", "[云函数返回数据]", res);
        if (res.result.code === 200) {
          if (page2 === 1) {
            filteredTasks.value = res.result.data || [];
          } else {
            filteredTasks.value = [...filteredTasks.value, ...res.result.data || []];
          }
          hasMore.value = (filteredTasks.value.length || 0) < (res.result.total || 0);
          common_vendor.index.__f__("log", "at pages/index/index.vue:702", "[任务数量]", filteredTasks.value.length);
        } else {
          common_vendor.index.showToast({
            title: res.result.message || "获取任务失败",
            icon: "none"
          });
          loadTasks();
        }
      } catch (e) {
        common_vendor.index.hideLoading();
        common_vendor.index.showToast({ title: "网络错误，请重试", icon: "none" });
        common_vendor.index.__f__("error", "at pages/index/index.vue:714", "[云函数调用失败]", e);
        loadTasks();
      }
    };
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_vendor.t(getTaskTypeName(filterType.value)),
        b: common_vendor.p({
          type: "bottom",
          size: "14",
          color: "#333"
        }),
        c: common_vendor.o(handleCategoryFilter),
        d: common_vendor.p({
          type: "search",
          size: "18",
          color: "#999"
        }),
        e: common_vendor.o(handleSearch),
        f: searchQuery.value,
        g: common_vendor.o(($event) => searchQuery.value = $event.detail.value),
        h: common_vendor.o(handleVoiceSearch),
        i: common_vendor.p({
          type: "mic",
          size: "18",
          color: "#999"
        }),
        j: common_vendor.p({
          type: "plusempty",
          size: "22",
          color: "#FFFFFF"
        }),
        k: common_vendor.o(goTaskRelease),
        l: common_vendor.f(bannerList.value, (item, index, i0) => {
          return {
            a: item.imageUrl,
            b: index
          };
        }),
        m: common_vendor.p({
          type: "notification",
          size: "18",
          color: "#3B7FF3"
        }),
        n: common_vendor.p({
          type: "plusempty",
          size: "14",
          color: "#FFFFFF"
        }),
        o: common_vendor.o(goTaskRelease),
        p: common_vendor.p({
          type: getSortIcon(sortType.value),
          size: "14",
          color: "#333"
        }),
        q: common_vendor.t(getSortTypeText(sortType.value)),
        r: common_vendor.p({
          type: "arrowdown",
          size: "14",
          color: "#999"
        }),
        s: sortType.value === "smart"
      }, sortType.value === "smart" ? {} : {}, {
        t: common_vendor.o(handleSortFilter),
        v: common_vendor.f(searchTasks.value, (task, k0, i0) => {
          return common_vendor.e({
            a: task.tags && task.tags.length > 0
          }, task.tags && task.tags.length > 0 ? {
            b: common_vendor.f(task.tags, (tag, index, i1) => {
              return common_vendor.e({
                a: getTagIcon(tag)
              }, getTagIcon(tag) ? {
                b: "777ae01e-8-" + i0 + "-" + i1,
                c: common_vendor.p({
                  type: getTagIcon(tag),
                  size: "14",
                  color: getTagColor(tag)
                })
              } : {}, {
                d: tag !== "urgent"
              }, tag !== "urgent" ? {
                e: common_vendor.t(tag)
              } : {}, {
                f: index,
                g: common_vendor.n(getTagClass(tag))
              });
            })
          } : {}, {
            c: task.publisher.avatar,
            d: common_vendor.t(task.publisher.nickname),
            e: common_vendor.t(formatPublishTime(task.publishTime)),
            f: "777ae01e-9-" + i0,
            g: common_vendor.p({
              type: getTaskTypeIcon(task.type),
              size: "16",
              color: "#FFFFFF"
            }),
            h: common_vendor.t(getTaskTypeName(task.type)),
            i: getTaskTypeColor(task.type),
            j: common_vendor.t(getTaskStatusText(task.status)),
            k: common_vendor.n(task.status),
            l: common_vendor.t(getFormattedTitle(task)),
            m: task.type === "express" || task.type === "takeout"
          }, task.type === "express" || task.type === "takeout" ? {
            n: "777ae01e-10-" + i0,
            o: common_vendor.p({
              type: "location",
              size: "12",
              color: "#00BFFF"
            }),
            p: common_vendor.t(maskAddress(task.pickupAddress))
          } : {}, {
            q: task.type === "express" || task.type === "takeout"
          }, task.type === "express" || task.type === "takeout" ? {
            r: "777ae01e-11-" + i0,
            s: common_vendor.p({
              type: "location-filled",
              size: "12",
              color: "#00BFFF"
            }),
            t: common_vendor.t(maskAddress(task.deliveryAddress))
          } : {}, {
            v: task.type === "express" || task.type === "takeout"
          }, task.type === "express" || task.type === "takeout" ? {
            w: "777ae01e-12-" + i0,
            x: common_vendor.p({
              type: "calendar",
              size: "12",
              color: "#00BFFF"
            }),
            y: common_vendor.t(task.expectedDeliveryTime)
          } : {}, {
            z: (task.type === "buy" || task.type === "sell") && task.images && task.images.length > 0
          }, (task.type === "buy" || task.type === "sell") && task.images && task.images.length > 0 ? {
            A: common_vendor.f(task.images, (image, imgIndex, i1) => {
              return {
                a: imgIndex,
                b: image
              };
            })
          } : {}, {
            B: "777ae01e-13-" + i0,
            C: common_vendor.t(task.reward),
            D: task.distance
          }, task.distance ? {
            E: "777ae01e-14-" + i0,
            F: common_vendor.p({
              type: "location",
              size: "14",
              color: "#999999"
            }),
            G: common_vendor.t(task.distance)
          } : {}, {
            H: task.views
          }, task.views ? {
            I: "777ae01e-15-" + i0,
            J: common_vendor.p({
              type: "eye",
              size: "14",
              color: "#999999"
            }),
            K: common_vendor.t(task.views)
          } : {}, {
            L: task.status === "pending"
          }, task.status === "pending" ? {
            M: common_vendor.o(($event) => handleTakeTask(task), task.id)
          } : {}, {
            N: task.id,
            O: task.isTop ? 1 : "",
            P: task.isUrgent ? 1 : "",
            Q: common_vendor.o(($event) => navigateToDetail(task), task.id)
          });
        }),
        w: common_vendor.p({
          type: "wallet",
          size: "12",
          color: "#00BFFF"
        }),
        x: hasMore.value
      }, hasMore.value ? {
        y: common_vendor.p({
          type: "spinner-cycle",
          size: "20",
          color: "#00BFFF"
        })
      } : {}, {
        z: common_vendor.o(loadMoreTasks),
        A: isRefreshing.value,
        B: common_vendor.o(onRefresh),
        C: common_vendor.o(onRefresh),
        D: isRefreshing.value
      });
    };
  }
});
wx.createPage(_sfc_main);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/index/index.js.map
