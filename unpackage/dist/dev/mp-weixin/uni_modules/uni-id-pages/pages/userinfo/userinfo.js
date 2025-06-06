"use strict";
const common_vendor = require("../../../../common/vendor.js");
const uni_modules_uniIdPages_common_store = require("../../common/store.js");
const uniIdCo = common_vendor.er.importObject("uni-id-co");
const _sfc_main = {
  computed: {
    userInfo() {
      return uni_modules_uniIdPages_common_store.store.userInfo;
    },
    realNameStatus() {
      if (!this.userInfo.realNameAuth) {
        return 0;
      }
      return this.userInfo.realNameAuth.authStatus;
    }
  },
  data() {
    return {
      univerifyStyle: {
        authButton: {
          "title": "本机号码一键绑定"
          // 授权按钮文案
        },
        otherLoginButton: {
          "title": "其他号码绑定"
        }
      },
      // userInfo: {
      // 	mobile:'',
      // 	nickname:''
      // },
      hasPwd: false,
      showLoginManage: false,
      //通过页面传参隐藏登录&退出登录按钮
      setNicknameIng: false,
      avatar_file: null
    };
  },
  async onShow() {
    this.univerifyStyle.authButton.title = "本机号码一键绑定";
    this.univerifyStyle.otherLoginButton.title = "其他号码绑定";
  },
  async onLoad(e) {
    if (e.showLoginManage) {
      this.showLoginManage = true;
    }
    let res = await uniIdCo.getAccountInfo();
    this.hasPwd = res.isPasswordSet;
  },
  methods: {
    login() {
      common_vendor.index.navigateTo({
        url: "/uni_modules/uni-id-pages/pages/login/login-withoutpwd",
        complete: (e) => {
        }
      });
    },
    logout() {
      uni_modules_uniIdPages_common_store.mutations.logout();
    },
    bindMobileSuccess() {
      uni_modules_uniIdPages_common_store.mutations.updateUserInfo();
    },
    changePassword() {
      common_vendor.index.navigateTo({
        url: "/uni_modules/uni-id-pages/pages/userinfo/change_pwd/change_pwd",
        complete: (e) => {
        }
      });
    },
    bindMobile() {
      this.$refs["bind-mobile-by-sms"].open();
    },
    univerify() {
      common_vendor.index.login({
        "provider": "univerify",
        "univerifyStyle": this.univerifyStyle,
        success: async (e) => {
          uniIdCo.bindMobileByUniverify(e.authResult).then((res) => {
            uni_modules_uniIdPages_common_store.mutations.updateUserInfo();
          }).catch((e2) => {
            common_vendor.index.__f__("log", "at uni_modules/uni-id-pages/pages/userinfo/userinfo.vue:143", e2);
          }).finally((e2) => {
            common_vendor.index.closeAuthView();
          });
        },
        fail: (err) => {
          common_vendor.index.__f__("log", "at uni_modules/uni-id-pages/pages/userinfo/userinfo.vue:150", err);
          if (err.code == "30002" || err.code == "30001") {
            this.bindMobileBySmsCode();
          }
        }
      });
    },
    bindMobileBySmsCode() {
      common_vendor.index.navigateTo({
        url: "./bind-mobile/bind-mobile"
      });
    },
    handleAvatarUpdate(newAvatar) {
      this.avatar_file = newAvatar;
      common_vendor.index.__f__("log", "at uni_modules/uni-id-pages/pages/userinfo/userinfo.vue:165", this.avatar_file);
      common_vendor.index.setStorageSync("uni-id-pages-userInfo", {
        ...this.userInfo,
        avatar_file: newAvatar
      });
      common_vendor.index.$emit && common_vendor.index.$emit("refreshUserInfo");
    },
    setNickname(val) {
      let nickname = typeof val === "object" && val !== null ? val.value : val;
      if (typeof nickname === "string" && nickname.trim()) {
        uni_modules_uniIdPages_common_store.mutations.updateUserInfo({ nickname: nickname.trim() });
        this.$refs.dialog.close();
      }
    },
    deactivate() {
      common_vendor.index.navigateTo({
        url: "/uni_modules/uni-id-pages/pages/userinfo/deactivate/deactivate"
      });
    },
    async bindThirdAccount(provider) {
      const uniIdCo2 = common_vendor.er.importObject("uni-id-co");
      const bindField = {
        weixin: "wx_openid",
        alipay: "ali_openid",
        apple: "apple_openid",
        qq: "qq_openid"
      }[provider.toLowerCase()];
      if (this.userInfo[bindField]) {
        await uniIdCo2["unbind" + provider]();
        await uni_modules_uniIdPages_common_store.mutations.updateUserInfo();
      } else {
        common_vendor.index.login({
          provider: provider.toLowerCase(),
          onlyAuthorize: true,
          success: async (e) => {
            const res = await uniIdCo2["bind" + provider]({
              code: e.code
            });
            if (res.errCode) {
              common_vendor.index.showToast({
                title: res.errMsg || "绑定失败",
                duration: 3e3
              });
            }
            await uni_modules_uniIdPages_common_store.mutations.updateUserInfo();
          },
          fail: async (err) => {
            common_vendor.index.__f__("log", "at uni_modules/uni-id-pages/pages/userinfo/userinfo.vue:215", err);
            common_vendor.index.hideLoading();
          }
        });
      }
    },
    realNameVerify() {
      common_vendor.index.navigateTo({
        url: "/uni_modules/uni-id-pages/pages/userinfo/realname-verify/realname-verify"
      });
    },
    openNicknameDialog() {
      this.$refs.dialog.open();
    }
  }
};
if (!Array) {
  const _easycom_uni_id_pages_avatar2 = common_vendor.resolveComponent("uni-id-pages-avatar");
  const _easycom_uni_icons2 = common_vendor.resolveComponent("uni-icons");
  const _easycom_uni_list_item2 = common_vendor.resolveComponent("uni-list-item");
  const _easycom_uni_list2 = common_vendor.resolveComponent("uni-list");
  const _easycom_uni_popup_dialog2 = common_vendor.resolveComponent("uni-popup-dialog");
  const _easycom_uni_popup2 = common_vendor.resolveComponent("uni-popup");
  const _easycom_uni_id_pages_bind_mobile2 = common_vendor.resolveComponent("uni-id-pages-bind-mobile");
  (_easycom_uni_id_pages_avatar2 + _easycom_uni_icons2 + _easycom_uni_list_item2 + _easycom_uni_list2 + _easycom_uni_popup_dialog2 + _easycom_uni_popup2 + _easycom_uni_id_pages_bind_mobile2)();
}
const _easycom_uni_id_pages_avatar = () => "../../components/uni-id-pages-avatar/uni-id-pages-avatar.js";
const _easycom_uni_icons = () => "../../../uni-icons/components/uni-icons/uni-icons.js";
const _easycom_uni_list_item = () => "../../../uni-list/components/uni-list-item/uni-list-item.js";
const _easycom_uni_list = () => "../../../uni-list/components/uni-list/uni-list.js";
const _easycom_uni_popup_dialog = () => "../../../uni-popup/components/uni-popup-dialog/uni-popup-dialog.js";
const _easycom_uni_popup = () => "../../../uni-popup/components/uni-popup/uni-popup.js";
const _easycom_uni_id_pages_bind_mobile = () => "../../components/uni-id-pages-bind-mobile/uni-id-pages-bind-mobile.js";
if (!Math) {
  (_easycom_uni_id_pages_avatar + _easycom_uni_icons + _easycom_uni_list_item + _easycom_uni_list + _easycom_uni_popup_dialog + _easycom_uni_popup + _easycom_uni_id_pages_bind_mobile)();
}
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: common_vendor.o($options.handleAvatarUpdate),
    b: common_vendor.p({
      width: "120px",
      height: "120px",
      showSync: false
    }),
    c: common_vendor.t($options.userInfo.nickname || "未设置昵称"),
    d: common_vendor.p({
      type: "compose",
      size: "18",
      color: "#4080FF"
    }),
    e: common_vendor.o((...args) => $options.openNicknameDialog && $options.openNicknameDialog(...args)),
    f: common_vendor.o($options.bindMobile),
    g: common_vendor.p({
      title: "手机号",
      rightText: $options.userInfo.mobile || "未绑定",
      link: true
    }),
    h: $options.userInfo.email
  }, $options.userInfo.email ? {
    i: common_vendor.p({
      title: "电子邮箱",
      rightText: $options.userInfo.email
    })
  } : {}, {
    j: $data.hasPwd
  }, $data.hasPwd ? {
    k: common_vendor.o($options.changePassword),
    l: common_vendor.p({
      title: "修改密码",
      link: true
    })
  } : {}, {
    m: common_vendor.o($options.realNameVerify),
    n: common_vendor.p({
      title: "实名认证",
      rightText: $options.realNameStatus !== 2 ? "未认证" : "已认证",
      link: true
    }),
    o: common_vendor.o((...args) => $options.logout && $options.logout(...args)),
    p: common_vendor.o((...args) => $options.deactivate && $options.deactivate(...args)),
    q: common_vendor.o($options.setNickname),
    r: common_vendor.p({
      mode: "input",
      value: $options.userInfo.nickname,
      inputType: "nickname",
      title: "设置昵称",
      placeholder: "请输入要设置的昵称"
    }),
    s: common_vendor.sr("dialog", "0be2f605-7"),
    t: common_vendor.p({
      type: "dialog"
    }),
    v: common_vendor.sr("bind-mobile-by-sms", "0be2f605-9"),
    w: common_vendor.o($options.bindMobileSuccess)
  });
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-0be2f605"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../../../.sourcemap/mp-weixin/uni_modules/uni-id-pages/pages/userinfo/userinfo.js.map
