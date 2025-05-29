<!-- 用户资料页 -->
<template>
	<view class="userinfo-page">
		<!-- 头像和昵称 -->
		<view class="profile-card">
			<view class="avatar-box">
				<uni-id-pages-avatar width="120px" height="120px" :showSync="false" />
			</view>
			<view class="nickname-box" @click="openNicknameDialog">
				<text class="nickname">{{ userInfo.nickname || '未设置昵称' }}</text>
				<uni-icons type="compose" size="18" color="#4080FF" class="edit-icon" />
			</view>
		</view>

		<!-- 信息列表 -->
		<view class="info-card">
			<uni-list>
				<uni-list-item class="item" @click="bindMobile" title="手机号" :rightText="userInfo.mobile || '未绑定'" link />
				<uni-list-item v-if="userInfo.email" class="item" title="电子邮箱" :rightText="userInfo.email" />
				<uni-list-item v-if="hasPwd" class="item" @click="changePassword" title="修改密码" link />
				<uni-list-item class="item" @click="realNameVerify" title="实名认证" :rightText="realNameStatus !== 2 ? '未认证': '已认证'" link />
			</uni-list>
		</view>

		<!-- 账号管理 -->
		<view class="action-card">
			<button class="logout-btn" @click="logout">退出登录</button>
			<button class="deactivate-btn" @click="deactivate">注销账号</button>
		</view>

		<!-- 昵称弹窗 -->
		<uni-popup ref="dialog" type="dialog">
			<uni-popup-dialog mode="input" :value="userInfo.nickname" @confirm="setNickname" inputType="nickname"
				title="设置昵称" placeholder="请输入要设置的昵称" />
		</uni-popup>
		<uni-id-pages-bind-mobile ref="bind-mobile-by-sms" @success="bindMobileSuccess" />
	</view>
</template>
<script>
const uniIdCo = uniCloud.importObject("uni-id-co")
  import {
    store,
    mutations
  } from '@/uni_modules/uni-id-pages/common/store.js'
	export default {
    computed: {
      userInfo() {
        return store.userInfo
      },
	  realNameStatus () {
		  if (!this.userInfo.realNameAuth) {
			  return 0
		  }

		  return this.userInfo.realNameAuth.authStatus
	  }
    },
		data() {
			return {
				univerifyStyle: {
					authButton: {
						"title": "本机号码一键绑定", // 授权按钮文案
					},
					otherLoginButton: {
						"title": "其他号码绑定",
					}
				},
				// userInfo: {
				// 	mobile:'',
				// 	nickname:''
				// },
				hasPwd: false,
				showLoginManage: false ,//通过页面传参隐藏登录&退出登录按钮
				setNicknameIng:false
			}
		},
		async onShow() {
			this.univerifyStyle.authButton.title = "本机号码一键绑定"
			this.univerifyStyle.otherLoginButton.title = "其他号码绑定"
		},
		async onLoad(e) {
			if (e.showLoginManage) {
				this.showLoginManage = true //通过页面传参隐藏登录&退出登录按钮
			}
			//判断当前用户是否有密码，否则就不显示密码修改功能
			let res = await uniIdCo.getAccountInfo()
			this.hasPwd = res.isPasswordSet
		},
		methods: {
			login() {
				uni.navigateTo({
					url: '/uni_modules/uni-id-pages/pages/login/login-withoutpwd',
					complete: (e) => {
						// console.log(e);
					}
				})
			},
			logout() {
				mutations.logout()
			},
			bindMobileSuccess() {
				mutations.updateUserInfo()
			},
			changePassword() {
				uni.navigateTo({
					url: '/uni_modules/uni-id-pages/pages/userinfo/change_pwd/change_pwd',
					complete: (e) => {
						// console.log(e);
					}
				})
			},
			bindMobile() {
				// #ifdef APP-PLUS
				uni.preLogin({
					provider: 'univerify',
					success: this.univerify(), //预登录成功
					fail: (res) => { // 预登录失败
						// 不显示一键登录选项（或置灰）
						console.log(res)
						this.bindMobileBySmsCode()
					}
				})
				// #endif

				// #ifdef MP-WEIXIN
				this.$refs['bind-mobile-by-sms'].open()
				// #endif

				// #ifdef H5
				//...去用验证码绑定
				this.bindMobileBySmsCode()
				// #endif
			},
			univerify() {
				uni.login({
					"provider": 'univerify',
					"univerifyStyle": this.univerifyStyle,
					success: async e => {
						uniIdCo.bindMobileByUniverify(e.authResult).then(res => {
							mutations.updateUserInfo()
						}).catch(e => {
							console.log(e);
						}).finally(e => {
							// console.log(e);
							uni.closeAuthView()
						})
					},
					fail: (err) => {
						console.log(err);
						if (err.code == '30002' || err.code == '30001') {
							this.bindMobileBySmsCode()
						}
					}
				})
			},
			bindMobileBySmsCode() {
				uni.navigateTo({
					url: './bind-mobile/bind-mobile'
				})
			},
			setNickname(val) {
				let nickname = typeof val === 'object' && val !== null ? val.value : val
				if (typeof nickname === 'string' && nickname.trim()) {
					mutations.updateUserInfo({ nickname: nickname.trim() })
					this.$refs.dialog.close()
				}
			},
			deactivate(){
				uni.navigateTo({
					url:"/uni_modules/uni-id-pages/pages/userinfo/deactivate/deactivate"
				})
			},
			async bindThirdAccount(provider) {
				const uniIdCo = uniCloud.importObject("uni-id-co")
				const bindField = {
					weixin: 'wx_openid',
					alipay: 'ali_openid',
					apple: 'apple_openid',
					qq: 'qq_openid'
				}[provider.toLowerCase()]

				if (this.userInfo[bindField]) {
					await uniIdCo['unbind' + provider]()
					await mutations.updateUserInfo()
				} else {
					uni.login({
						provider: provider.toLowerCase(),
						onlyAuthorize: true,
						success: async e => {
							const res = await uniIdCo['bind' + provider]({
								code: e.code
							})
							if (res.errCode) {
								uni.showToast({
									title: res.errMsg || '绑定失败',
									duration: 3000
								})
							}
							await mutations.updateUserInfo()
						},
						fail: async (err) => {
							console.log(err);
							uni.hideLoading()
						}
					})
				}
			},
			realNameVerify () {
				uni.navigateTo({
					url: "/uni_modules/uni-id-pages/pages/userinfo/realname-verify/realname-verify"
				})
			},
			openNicknameDialog() {
				this.$refs.dialog.open()
			}
		}
	}
</script>
<style lang="scss" scoped>
	@import "@/uni_modules/uni-id-pages/common/login-page.scss";

	.userinfo-page {
		padding: 32rpx;
		background: #f5f6fa;
		min-height: 100vh;
	}

	.profile-card {
		background: #fff;
		border-radius: 24rpx;
		box-shadow: 0 4px 16px rgba(0,0,0,0.03);
		display: flex;
		flex-direction: column;
		align-items: center;
		padding: 40rpx 0 24rpx 0;
		margin-bottom: 32rpx;
	}

	.avatar-box {
		margin-bottom: 16rpx;
		border-radius: 50%;
		border: 4rpx solid #4080FF22;
		box-shadow: 0 2px 8px rgba(64,128,255,0.08);
	}

	.nickname-box {
		display: flex;
		align-items: center;
		cursor: pointer;
	}

	.nickname {
		font-size: 20px;
		font-weight: 500;
		color: #1A1A1A;
		margin-right: 8rpx;
	}

	.edit-icon {
		opacity: 0.7;
	}

	.info-card {
		background: #fff;
		border-radius: 16rpx;
		box-shadow: 0 2px 8px rgba(0,0,0,0.05);
		margin-bottom: 32rpx;
	}

	.action-card {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 20rpx;
	}

	.logout-btn, .deactivate-btn {
		width: 60%;
		border-radius: 32rpx;
		font-size: 15px;
		font-weight: 500;
		padding: 14rpx 0;
		margin: 0;
	}

	.logout-btn {
		background: linear-gradient(to right, #4080FF, #60A9FF);
		color: #fff;
		border: none;
	}

	.deactivate-btn {
		background: #fff;
		color: #ff4d4f;
		border: 1rpx solid #ff4d4f;
	}

	/* #ifndef APP-NVUE */
	view {
		display: flex;
		box-sizing: border-box;
		flex-direction: column;
	}

	@media screen and (min-width: 690px) {
		.uni-content {
			padding: 0;
			max-width: 690px;
			margin-left: calc(50% - 345px);
			border: none;
			max-height: none;
			border-radius: 0;
			box-shadow: none;
		}
	}

	/* #endif */
	.avatar {
		align-items: center;
		justify-content: center;
		margin: 22px 0;
		width: 100%;
	}

	.item {
		flex: 1;
		flex-direction: row;
		justify-content: space-between;
		align-items: center;
	}

	button {
		margin: 10%;
		margin-top: 40px;
		border-radius: 0;
		background-color: #FFFFFF;
		width: 80%;
	}

	.mt10 {
		margin-top: 10px;
	}
</style>
