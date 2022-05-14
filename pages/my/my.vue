<template>
	<view class="me-info">
		<view class="top-bg"></view>
		<view class="shell">
			<view class="portrait">
				<image :src="imgSrc" mode="aspectFill"></image>
			</view>
			<view class="info">
				<button v-if="!ifLogin" class="btn-login" @click="userOnFn" :disabled='!ifAllowClick'>授权登录</button>
				<text class="name" v-if="ifLogin">{{name}}</text>
			</view>
			<view class="time-info">
				<view class="module">
					<view>
						<text class="text">本月打卡次数:</text>
					</view>
					<text class="highlight">{{monthInfo.monthFrequency}}</text>
				</view>
				<view class="module">
					<view>
						<text class="text">本月打卡时长:</text>
					</view>
					<text class="highlight">{{monthInfo.monthDuration}}</text>
				</view>
			</view>
			<view class="allBtn">
				<button class="btn join" v-if="ifLogin && !member" @click="joinFn">
					<text class="font-left iconfont icon-jiaruwomen" style="color: #ff292c;font-size: 29px"></text>
					<text>加入我们</text>
					<text class="font-right iconfont icon-next"></text>
				</button>
				<button class="btn" v-if="ifLogin && member" @click="monthBtn">
					<text class="font-left iconfont icon-paihangbang1" style="color: #ffcd00;font-size: 25px;"></text>
					<text>月打卡排行榜</text>
					<text class="font-right iconfont icon-next"></text>
				</button>
				<navigator class="btn" url="/pages/about/about">
					<text class="font-left iconfont icon-guanyuwomen" style="color: #3f85ff;font-size: 25px;"></text>
					<text>关于我们</text>
					<text class="font-right iconfont icon-next"></text>
				</navigator>
				<button class="btn admin" v-if="ifSuper" @click="superFn">
					<text class="font-left iconfont icon-guanlizhongxin" style="color: #cc595b;font-size: 18px;"></text>
					<text>管理系统</text>
					<text class="font-right iconfont icon-next"></text>
				</button>
			</view>
		</view>
		<view class="origin">Origin JieS @ TIDC Make</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				ifLogin: false,
				name: 'default',
				imgSrc: '../../static/notLogin.png',
				member: false,
				ifAllowClick: true,
				ifSuper: false,
				monthInfo: {
					monthDuration: '0s',
					monthFrequency: 0
				}
			}
		},
		created() {
			this.init()
			let that = this
			uni.$on('updateMy', function(userInfo) {
				that.userInfoExist(userInfo)
			})
		},
		methods: {
			userInfoExist(info) {
				info = info || {}
				this.name = (info.nickName || 'default')
				this.imgSrc = (info.avatarUrl || '../../static/notLogin.png')
				this.ifLogin = !!info.nickName
				this.ifSuper = !!info.super
				this.member = !!info.member
				if (info['clockList']) {
					let monthDuration = info.clockList.monthDuration
					this.monthInfo.monthFrequency = info.clockList.monthFrequency
					if (monthDuration < 60 * 1000) this.monthInfo.monthDuration = (monthDuration / 1000).toFixed(2) + 's'
					else if (monthDuration < 60 * 60 * 1000) this.monthInfo.monthDuration = (monthDuration / 1000 / 60).toFixed(2) + 'min'
					else this.monthInfo.monthDuration = (monthDuration / 1000 / 60 / 60).toFixed(2) + 'h'
				} else {
					this.monthInfo.monthDuration = '0s'
					this.monthInfo.monthFrequency = 0
				}
			},
			init() {
				let info, token
				try {
					token = uni.getStorageSync('token')
					info = uni.getStorageSync('userInfo')
				} catch (e) {
					console.error(e)
				}

				if (info && token) {
					if (!this.$ifVerifyToken) {
						this.$utils.verifyToken.call(this, token, info).then(bool => {
							if (!bool) {
								this.userInfoExist()
								return uni.showModal({
									title: '提示',
									content: '登录过期，请重新登录！',
									showCancel: false
								})
							}
							info = uni.getStorageSync('userInfo')
							this.userInfoExist(JSON.parse(info))
						}).catch(e => this.userInfoExist())
					} else {
						this.userInfoExist(JSON.parse(info))
					}
				}
			},
			userOnFn() {
				if (!this.ifAllowClick) return
				let that = this
				that.ifAllowClick = false
				uni.getUserProfile({
					desc: '用于完善及展示用户信息',
					success(res) {
						let userInfo = res.userInfo
						uni.showLoading({
							title: '正在登录……',
							mask: true,
							success() {
								uni.login({
									provider: 'weixin',
									success(e) {
										uni.request({
											url: that.$domain + '/users/login',
											method: 'POST',
											data: { code: that.$utils.RsaEncryption(e.code) },
											success(resData) {
												that.ifAllowClick = true
												uni.hideLoading()
												if (resData.statusCode !== 200) {
													uni.showModal({
														title: '提示',
														content: '抱歉，服务器崩溃了o(╥﹏╥)o',
														showCancel: false,
													})
												} else {
													if (resData.data.code !== 0) {
														return uni.showModal({
															title: '提示',
															content: resData.data.msg,
															showCancel: false,
														})
													}
													let data = JSON.parse(that.$utils.AESDecode(resData.data.data))
													let clockList = data.clockList
													that.monthInfo.monthFrequency = clockList.monthFrequency
													if (clockList.monthDuration < 60 * 1000) that.monthInfo.monthDuration = (clockList.monthDuration / 1000).toFixed(2) + 's'
													else if (clockList.monthDuration < 60 * 60 * 1000) that.monthInfo.monthDuration = (clockList.monthDuration / 1000 / 60).toFixed(2) + 'min'
													else that.monthInfo.monthDuration = (clockList.monthDuration / 1000 / 60 / 60).toFixed(2) + 'h'
													if (!data.Certification) {
														that.name = userInfo.nickName
													} else {
														that.name = userInfo.nickName = data.Certification
													}
													that.imgSrc = userInfo.avatarUrl
													that.ifLogin = true
													userInfo['super'] = that.ifSuper = data.super
													userInfo['member'] = that.member = !!data.Certification
													userInfo['clockList'] = clockList
													userInfo['updataTime'] = data.updataTime
													uni.$emit('updateIndex', { userInfo, token: data.token })
													uni.setStorage({
														key: 'userInfo',
														data: JSON.stringify(userInfo)
													})
													uni.setStorage({
														key: 'token',
														data: data.token
													})
												}
											},
											fail() {
												uni.hideLoading()
												that.ifAllowClick = true
												uni.showToast({
													icon: 'error',
													title: '抱歉~ 出错了!'
												})
											}
										})
									},
									fail() {
										uni.hideLoading()
										that.ifAllowClick = true
										uni.showToast({
											icon: 'error',
											title: 'code获取失败'
										})
									}
								})
							},
							fail(e) {
								that.ifAllowClick = true
								console.error(e)
							}
						})
					},
					fail() {
						that.ifAllowClick = true
					}
				})
			},
			superFn() {
				let token = uni.getStorageSync('token')
				let userInfo = uni.getStorageSync('userInfo')
				if (!token || !userInfo) return uni.showModal({
					title: '提示',
					content: '登录状态出错',
					showCancel: false,
				})
				userInfo = JSON.parse(userInfo)
				if (!userInfo.super) return uni.showModal({
					title: '提示',
					content: '抱歉，此功能仅开放给超级用户使用',
					showCancel: false
				})
				uni.navigateTo({ url: '/pages/superuser/superuser' })
			},
			joinFn() {
				let token = uni.getStorageSync('token')
				if (!token) return uni.showModal({
					title: '提示',
					content: '登录状态出错',
					showCancel: false,
				})
				uni.navigateTo({ url: '/pages/join/join', })
			},
			monthBtn() {
				uni.showModal({
					title: '提示',
					content: '此模块正在开发中，敬请期待~',
					showCancel: false,
				})
			}
		}
	}
</script>

<style scoped lang="less">
	.me-info {
		background-color: #fff;
	}

	.top-bg {
		width: 100%;
		height: 200px;
		background-position: bottom center;
		background-size: cover;
		background-color: #c5f0e7;
	}

	.shell {
		width: 100%;
		border-radius: 30px 30px 0 0;
		background-color: #fff;
		margin-top: -25px;
		min-height: calc(100vh - 240px + 25px);

		.portrait {
			width: 150px;
			height: 150px;
			box-shadow: 0 1px 3px #F1F1F1;
			overflow: hidden;
			border-radius: 50%;
			margin: 0 auto;
			transform: translateY(-75px);
			background-color: #fff;

			image {
				width: 100%;
				height: 100%;
			}
		}

		.info {
			display: flex;
			flex-direction: column;
			padding: 0 0 25px;
			margin-top: -60px;
			font-size: 35px;
			font-weight: bolder;
			text-align: center;
		}

		.btn-login {
			border-radius: 20px;
			width: 150px;
			color: #fff;
			outline: none;
			background-color: #07c160;
			transition: background-color .2s;

			&:active {
				background-color: #00a259;
			}
		}

		.time-info {
			width: 90%;
			margin: -2px auto 0;
			display: flex;
			justify-content: space-around;

			.module {
				border-radius: 10px;
				width: 150px;
				height: 100px;
				display: flex;
				flex-direction: column;
				text-align: center;
				justify-content: center;
				box-shadow: 0 0 3px #C8C7CC;

				.i {
					margin-right: 2px;
				}

				.text {
					font-size: 16px;
					font-weight: bolder;
				}

				.highlight {
					padding-top: 10px;
					font-size: 20px;
					font-weight: bolder;
					color: #3bb36c;
				}
			}
		}

		.allBtn {
			margin-top: 20px;

			.btn {
				position: relative;
				display: flex;
				align-items: center;
				width: 90%;
				margin: 10px auto;
				border-radius: 10px;
				padding: 10px 20px;
				background: #fff;
				font-size: 16px;
				box-shadow: 0 0 3px #C8C7CC;
				box-sizing: border-box;
				transition: all .2s;
				color: #555555;
				line-height: 30px;

				&.admin {
					box-shadow: 0 0 3px #cc595b;
					color: #cc595b;

					.font-right {
						color: #cc595b;
					}
				}

				&.join {
					width: 400rpx;
					line-height: 50px;
					margin-bottom: 20px;
					box-shadow: 0 0 3px #3bb36c;

					.font-right {
						color: #3bb36c;
					}
				}

				&::after {
					border: none;
				}

				&:active {
					background-color: #fcfcfc;
					box-shadow: 0 0 3px #fcfcfc;

					.font-right {
						color: #fcfcfc;
					}
				}

				.font-right {
					font-size: 19px;
					position: absolute;
					top: 50%;
					right: 25px;
					transform: translateY(-50%);
					transition: color .2s;
					color: #C8C7CC;
				}

				.font-left {
					display: block;
					width: 26px;
					height: 100%;
					margin-right: 8px;
					font-size: 18px;
				}
			}
		}
	}

	.origin {
		height: 40px;
		line-height: 40px;
		box-sizing: border-box;
		font-size: 14px;
		text-align: center;
		color: #C8C7CC;
		background-color: #fff;
	}
</style>
