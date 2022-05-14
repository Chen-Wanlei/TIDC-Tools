<template>
	<view>
		<view class="m m1">
			<view class="title red">打卡限制</view>
			<view class="main">
				<view class="sw wifi-switch">
					<text>wifi限制</text>
					<view class="tier" @click="switchFn('wifi')"></view>
					<switch :checked="startup.wifiSwitch" color="#007aff"></switch>
				</view>
				<view class="sw ip-switch">
					<text>ip限制</text>
					<view class="tier" @click="switchFn('ip')"></view>
					<switch :checked="startup.ipSwitch" color="#ffcc33"></switch>
				</view>
			</view>
		</view>
		<view class="m">
			<view class="title">打卡WIFI列表</view>
			<view class="msg" v-if="!toolWifiList.length">{{msg.toolWifiListMsg}}</view>
			<view class="main" @click="delWifiFn($event)">
				<view class="child" v-for="(item,index) in toolWifiList" :key="index">
					<view class="left">
						<view class="ssid">{{item.SSID}}</view>
						<view class="info">
							<view class="bssid">
								<text class="t">MAC：</text>
								<text class="c">{{item.BSSID}}</text>
							</view>
						</view>
					</view>
					<view class="right">
						<text id="del" :data-id="item._id" :data-index="index" class="font-left iconfont icon-shanchu" style="font-size: 50rpx;"></text>
					</view>
				</view>
			</view>
		</view>
		<view class="m">
			<view class="title">打卡IP列表</view>
			<view class="msg" v-if="!toolIPs.length">{{msg.toolWifiListMsg}}</view>
			<view class="main" @click="delIPFn($event)">
				<view class="child" v-for="(item,index) in toolIPs" :key="index">
					<view class="left">
						<view class="ssid">{{item.ip}}</view>
						<view class="info">
							<view class="bssid">
								<text class="t">地区：</text>
								<text class="c">{{item.region}}</text>
							</view>
						</view>
					</view>
					<view class="right">
						<text id="del" :data-id="item._id" :data-index="index" class="font-left iconfont icon-shanchu" style="font-size: 50rpx;"></text>
					</view>
				</view>
			</view>
		</view>
		<view class="m">
			<view class="title blue">本机网络IP</view>
			<view class="msg" v-if="!connectedIP.ip">{{msg.connectedIPMsg}}</view>
			<view class="main" v-else>
				<view class="child">
					<view class="left">
						<view class="ssid">{{connectedIP.ip}}</view>
						<view class="info">
							<view class="bssid">
								<text class="t">地区：</text>
								<text class="c">{{connectedIP.region}}</text>
							</view>
							<view class="signalStrength">
								<text class="t">运营商：</text>
								<text class="c">{{connectedIP.isp}}</text>
							</view>
						</view>
					</view>
					<view class="right text" @click="addIPFn">添加</view>
				</view>
			</view>
		</view>
		<view class="m">
			<view class="title blue">已连接WIFI</view>
			<view class="msg" v-if="!connectedWifi.signalStrength">{{msg.connectedWifiMsg}}</view>
			<view class="main" v-else>
				<view class="child">
					<view class="left">
						<view class="ssid">{{connectedWifi.SSID}}</view>
						<view class="info">
							<view class="bssid">
								<text class="t">MAC：</text>
								<text class="c">{{connectedWifi.BSSID}}</text>
							</view>
							<view class="signalStrength">
								<text class="t">信号：</text>
								<text class="c">{{connectedWifi.signalStrength}}</text>
							</view>
						</view>
					</view>
				</view>
			</view>
		</view>
		<view class="m">
			<view class="title orange">附近WIFI <text class="ps">(信号由小到大：Android 0-100，iPhone 0.0-1.0)</text></view>
			<view class="msg" v-if="!wifiList.length">{{msg.wifiListMsg}}</view>
			<view class="main" @click="addWifiFn($event)">
				<view class="child" v-for="(item,index) in wifiList" :key="index">
					<view class="left">
						<view class="ssid">{{item.SSID}}</view>
						<view class="info">
							<view class="bssid">
								<text class="t">MAC：</text>
								<text class="c">{{item.BSSID}}</text>
							</view>
							<view class="signalStrength">
								<text class="t">信号：</text>
								<text class="c">{{item.signalStrength}}</text>
							</view>
						</view>
					</view>
					<view id="add" :data-index="index" class="right text">添加</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				startup: {
					wifiSwitch: false,
					ipSwitch: false
				},
				wifiList: [],
				toolWifiList: [],
				toolIPs: [],
				connectedWifi: {
					BSSID: '',
					SSID: '',
					signalStrength: 0
				},
				connectedIP: {
					ip: '',
					region: '',
					isp: ''
				},
				msg: {
					toolWifiListMsg: '加载中……',
					wifiListMsg: '加载中……',
					connectedWifiMsg: '加载中……',
					connectedIPMsg: '加载中……'
				}
			}
		},
		created() {
			this.auth()
		},
		methods: {
			auth() {
				let that = this
				uni.getSetting({
					success(res) {
						if (!res.authSetting['scope.userLocation']) {
							uni.authorize({
								scope: 'scope.userLocation',
								success() {
									that.init()
								},
								fail(e) {
									uni.showModal({
										title: '提示',
										content: '请打开位置信息授权',
										confirmText: '前往授权',
										showCancel: false,
										success(res) {
											if (res.confirm) {
												uni.openSetting({
													success(res) {
														if (!res.authSetting['scope.userLocation']) return uni.showModal({
															title: '提示',
															content: '获取权限失败',
															showCancel: false,
															success(res) { if (res.confirm) { uni.navigateBack() } }
														})
														that.init()
													}
												})
											}
										}
									})
								}
							})
						} else {
							that.init()
						}
					},
					fail(e) {
						console.error(e)
						uni.showModal({
							title: '提示',
							content: '出错了，getSetting调用失败',
							showCancel: false,
							success(res) { if (res.confirm) { uni.navigateBack() } }
						})
					}
				})
			},
			init() {
				let that = this
				wx.onGetWifiList(callback => {
					let wifiList = callback.wifiList
					wifiList.sort((a, b) => b.signalStrength - a.signalStrength)
					that.wifiList = wifiList
					that.msg.wifiListMsg = '未查询到附近WIFI'
					wx.getConnectedWifi({
						success(d) {
							if (!d.wifi.signalStrength) return that.msg.connectedWifiMsg = '未连接上WIFI'
							that.connectedWifi = d.wifi
							that.msg.connectedWifi = '未获取到当前WIFI信息'
						},
						fail(e) {
							that.errShowModal(e)
							that.msg.connectedWifi = '加载失败！'
							console.error('connectedWifiError：', e)
						}
					})
					that.IPRequest()
					let token = uni.getStorageSync('token')
					if (!token) {
						that.msg.toolWifiListMsg = '加载失败！'
						return uni.showModal({
							title: '提示',
							content: '登录状态出错',
							showCancel: false,
						})
					}
					uni.request({
						url: that.$domain + '/restrict',
						method: 'POST',
						data: { token: that.$utils.RsaEncryption(token) },
						success(res) {
							if (res.statusCode !== 200) {
								that.msg.toolWifiListMsg = '加载失败！'
								return uni.showModal({
									title: '提示',
									content: '抱歉，服务器崩溃了o(╥﹏╥)o',
									showCancel: false,
								})
							}
							let data = res.data
							if (data.code !== 0) {
								that.msg.toolWifiListMsg = '加载失败！'
								return uni.showModal({
									title: '提示',
									content: data.msg,
									showCancel: false,
								})
							}

							that.startup.wifiSwitch = data.data.startupWifi
							that.startup.ipSwitch = data.data.startupIP
							that.toolWifiList = data.data.wifiList
							that.toolIPs = data.data.ips
							that.msg.toolWifiListMsg = '暂无'
						},
						fail(e) {
							console.error(e)
							that.msg.toolWifiListMsg = '加载失败！'
							uni.showModal({
								title: '提示',
								content: 'Error: Request sending failed',
								showCancel: false,
								success(res) {
									if (res.confirm) { uni.navigateBack() }
								}
							})
						}
					})
				})
				wx.startWifi({
					success(res) {
						uni.showLoading({
							title: '加载中……',
							mask: true,
							success() {
								wx.getWifiList({
									success() { uni.hideLoading() },
									fail(e) {
										that.msg.wifiListMsg = '加载失败！'
										uni.hideLoading()
										that.errShowModal(e)
										console.error('wifiListErr：', e)
									}
								})
							}
						})
					},
					fail(e) {
						console.error(e)
						uni.showModal({
							title: '提示',
							content: 'Wifi模块初始化失败',
							showCancel: false,
							success(res) {
								if (res.confirm) { uni.navigateBack() }
							}
						})
					}
				})

			},
			errShowModal(e) {
				if (e.errCode === 12005) return uni.showModal({
					title: '提示',
					content: '请打开设备Wifi后重试',
					showCancel: false,
					success(res) { if (res.confirm) { uni.navigateBack() } }
				})
				if (e.errCode === 12006) return uni.showModal({
					title: '提示',
					content: '请打开设备GPS定位后重试',
					showCancel: false,
					success(res) { if (res.confirm) { uni.navigateBack() } }
				})
			},
			IPRequest() {
				let that = this
				uni.request({
					url: that.$getIP,
					method: 'GET',
					success(res) {
						if (res.statusCode !== 200) {
							return that.msg.connectedIPMsg = '获取失败！'
						}
						let returnCitySN = res.data
						let ip = returnCitySN.match(/cip":\s?"(\d{1,3}(?:\.\d{1,3}){3})"/)[1]
						let cname = returnCitySN.match(/cname":\s?"(.+)"/)[1]
						uni.request({
							url: 'https://ip.taobao.com/outGetIpInfo?accessKey=alibaba-inc&ip=' + ip,
							method: 'GET',
							success(r) {
								if (r.statusCode !== 200 || r.data.code) return that.connectedIP.region = cname
								let country = r.data.data.country
								let region = r.data.data.region
								let isp = r.data.data.isp
								region = region === 'XX' ? '' : ` ${region}`
								that.connectedIP.region = country === 'XX' ? cname : country + region
								that.connectedIP.isp = isp === 'XX' ? 'unknown' : isp
							},
							fail() {
								console.log(e)
								that.connectedIP.region = cname
							}
						})
						that.connectedIP.ip = ip
						that.msg.connectedIPMsg = '未获取到当前ip信息'
					},
					fail(e) {
						console.log(e)
						that.msg.connectedIPMsg = '获取失败！'
					}
				})
			},
			switchFn(str) {
				let token = uni.getStorageSync('token')
				if (!token) {
					return uni.showModal({
						title: '提示',
						content: '登录状态出错',
						showCancel: false,
					})
				}
				let that = this
				uni.showLoading({
					title: '加载中……',
					mask: true,
					success() {
						let arr = []
						arr.push(str)
						arr.push(!that.startup[str === 'ip' ? 'ipSwitch' : 'wifiSwitch'])
						uni.request({
							url: that.$domain + '/restrict/switch',
							method: 'POST',
							data: {
								token: that.$utils.RsaEncryption(token),
								option: that.$utils.RsaEncryption(JSON.stringify(arr))
							},
							success(res) {
								if (res.statusCode !== 200) {
									uni.hideLoading()
									return uni.showModal({
										title: '提示',
										content: '抱歉，服务器崩溃了o(╥﹏╥)o',
										showCancel: false,
									})
								}
								let data = res.data
								if (data.code !== 0) {
									uni.hideLoading()
									return uni.showModal({
										title: '提示',
										content: data.msg,
										showCancel: false,
									})
								}
								uni.hideLoading()
								let s = str === 'ip' ? 'ipSwitch' : 'wifiSwitch'
								that.startup[s] = !that.startup[s]
							},
							fail(e) {
								uni.hideLoading()
								console.error(e)
								uni.showModal({
									title: '提示',
									content: 'Error: Request sending failed',
									showCancel: false
								})
							}
						})
					}
				})
			},
			addWifiFn(e) {
				let target = e.target
				if (target.id !== 'add') return
				let index = target.dataset.index
				let wifi = this.wifiList[index]
				let that = this
				uni.showModal({
					title: '提示',
					content: `确定将 ${wifi.SSID} 设置为打卡wifi吗？`,
					success(res) {
						if (res.confirm) {
							let token = uni.getStorageSync('token')
							if (!token) {
								return uni.showModal({
									title: '提示',
									content: '登录状态出错',
									showCancel: false,
								})
							}
							uni.showLoading({
								title: '添加中……',
								mask: true,
								success() {
									let option = {
										SSID: wifi.SSID,
										BSSID: wifi.BSSID
									}
									uni.request({
										url: that.$domain + '/restrict/addWifi',
										method: 'POST',
										data: {
											token: that.$utils.RsaEncryption(token),
											option: that.$utils.RsaEncryption(JSON.stringify(option))
										},
										success(res) {
											if (res.statusCode !== 200) {
												uni.hideLoading()
												return uni.showModal({
													title: '提示',
													content: '抱歉，服务器崩溃了o(╥﹏╥)o',
													showCancel: false,
												})
											}
											let data = res.data
											if (data.code !== 0) {
												uni.hideLoading()
												return uni.showModal({
													title: '提示',
													content: data.msg,
													showCancel: false,
												})
											}
											uni.hideLoading()
											// ok
											that.toolWifiList.push(option)
											that.wifiList.splice(index, 1)
										},
										fail(e) {
											uni.hideLoading()
											console.error(e)
											uni.showModal({
												title: '提示',
												content: 'Error: Request sending failed',
												showCancel: false
											})
										}
									})
								}
							})
						}
					}
				})
			},
			delWifiFn(e) {
				let target = e.target
				if (target.id !== 'del') return
				let index = target.dataset.index
				let _id = target.dataset.id
				let wifi = this.toolWifiList[index]
				let that = this
				uni.showModal({
					title: '提示',
					content: `确定将 ${wifi.SSID} 移出打卡wifi吗？`,
					confirmText: '移出',
					confirmColor: 'red',
					success(res) {
						if (res.confirm) {
							let token = uni.getStorageSync('token')
							if (!token) {
								return uni.showModal({
									title: '提示',
									content: '登录状态出错',
									showCancel: false,
								})
							}
							let option = { token: that.$utils.RsaEncryption(token) }
							if(!_id) option['BSSID'] = wifi.BSSID
							else option['_id'] = that.$utils.RsaEncryption(_id)
							uni.showLoading({
								title: '移出中……',
								mask: true,
								success() {
									uni.request({
										url: that.$domain + '/restrict/delWifiOrIP',
										method: 'POST',
										data: option,
										success(res) {
											if (res.statusCode !== 200) {
												uni.hideLoading()
												return uni.showModal({
													title: '提示',
													content: '抱歉，服务器崩溃了o(╥﹏╥)o',
													showCancel: false,
												})
											}
											let data = res.data
											if (data.code !== 0) {
												uni.hideLoading()
												return uni.showModal({
													title: '提示',
													content: data.msg,
													showCancel: false,
												})
											}
											uni.hideLoading()
											// ok
											that.toolWifiList.splice(index, 1)
										},
										fail(e) {
											uni.hideLoading()
											console.error(e)
											uni.showModal({
												title: '提示',
												content: 'Error: Request sending failed',
												showCancel: false
											})
										}
									})
								}
							})
						}
					}
				})
			},
			addIPFn(e) {
				let that = this
				let ip = that.connectedIP.ip.match(/^((?:\d{1,3}\.){3})\d{1,3}$/)[1] + '**'
				let option = {
					ip,
					region: that.connectedIP.region
				}
				uni.showModal({
					title: '提示',
					content: `确定将 ${ip} 设置为打卡ip吗？`,
					success(res) {
						if (res.confirm) {
							let token = uni.getStorageSync('token')
							if (!token) {
								return uni.showModal({
									title: '提示',
									content: '登录状态出错',
									showCancel: false,
								})
							}
							uni.showLoading({
								title: '添加中……',
								mask: true,
								success() {
									uni.request({
										url: that.$domain + '/restrict/addIP',
										method: 'POST',
										data: {
											token: that.$utils.RsaEncryption(token),
											option: that.$utils.RsaEncryption(JSON.stringify(option))
										},
										success(res) {
											if (res.statusCode !== 200) {
												uni.hideLoading()
												return uni.showModal({
													title: '提示',
													content: '抱歉，服务器崩溃了o(╥﹏╥)o',
													showCancel: false,
												})
											}
											let data = res.data
											if (data.code !== 0) {
												uni.hideLoading()
												return uni.showModal({
													title: '提示',
													content: data.msg,
													showCancel: false,
												})
											}
											uni.hideLoading()
											// ok
											that.toolIPs.push(option)
										},
										fail(e) {
											uni.hideLoading()
											console.error(e)
											uni.showModal({
												title: '提示',
												content: 'Error: Request sending failed',
												showCancel: false
											})
										}
									})
								}
							})
						}
					}
				})
			},
			delIPFn(e) {
				let target = e.target
				if (target.id !== 'del') return
				let index = target.dataset.index
				let _id = target.dataset.id
				let that = this
				uni.showModal({
					title: '提示',
					content: `确定将 ${that.toolIPs[index].ip} 移出打卡ip吗？`,
					confirmText: '移出',
					confirmColor: 'red',
					success(res) {
						if (res.confirm) {
							let token = uni.getStorageSync('token')
							if (!token) {
								return uni.showModal({
									title: '提示',
									content: '登录状态出错',
									showCancel: false,
								})
							}
							let option = {
								token: that.$utils.RsaEncryption(token),
								type: 'ip'
							}
							console.log(_id)
							if (!_id) option['ip'] = that.toolIPs[index].ip
							else option['_id'] = that.$utils.RsaEncryption(_id)
							uni.showLoading({
								title: '移出中……',
								mask: true,
								success() {
									uni.request({
										url: that.$domain + '/restrict/delWifiOrIP',
										method: 'POST',
										data: option,
										success(res) {
											if (res.statusCode !== 200) {
												uni.hideLoading()
												return uni.showModal({
													title: '提示',
													content: '抱歉，服务器崩溃了o(╥﹏╥)o',
													showCancel: false,
												})
											}
											let data = res.data
											if (data.code !== 0) {
												uni.hideLoading()
												return uni.showModal({
													title: '提示',
													content: data.msg,
													showCancel: false,
												})
											}
											uni.hideLoading()
											// ok
											that.toolIPs.splice(index, 1)
										},
										fail(e) {
											uni.hideLoading()
											console.error(e)
											uni.showModal({
												title: '提示',
												content: 'Error: Request sending failed',
												showCancel: false
											})
										}
									})
								}
							})
						}
					}
				})
			},
		}
	}
</script>

<style scoped lang="less">
	.title {
		padding: 10rpx 26rpx;
		border-bottom: 1px dotted #ccc;
		font-size: 30rpx;
		line-height: 40rpx;

		&::before {
			content: '';
			display: block;
			float: left;
			margin-top: 6rpx;
			margin-right: 12rpx;
			width: 10rpx;
			height: 28rpx;
			border-radius: 20rpx;
			background-color: #00b26a;
		}

		&.blue::before {
			background-color: #185599;
		}

		&.red::before {
			background-color: red;
		}

		&.orange::before {
			background-color: #ffca45;
		}

		.ps {
			margin-left: 30rpx;
			font-size: 22rpx;
		}
	}

	.m+.m {
		margin-top: 50rpx;
	}

	.msg {
		padding: 20rpx 0;
		height: 50rpx;
		font-size: 30rpx;
		line-height: 50rpx;
		text-align: center;
		color: #999;
	}

	.m1>.main {
		display: flex;
		justify-content: space-around;
		align-items: center;
		background-color: #f6f6f6;

		.sw {
			position: relative;
			padding: 20rpx 50rpx;
			display: flex;
			flex-direction: column;
			justify-content: center;
			align-items: center;
			width: 180rpx;
			font-weight: bolder;
			text-align: center;
		}

		switch {
			width: 61.58px;
			margin-top: 15rpx;
		}

		.tier {
			position: absolute;
			bottom: 20rpx;
			left: 0;
			right: 0;
			z-index: 1;
			margin: auto;
			width: 61.58px;
			height: 32px;
		}
	}

	.child {
		padding: 20rpx 40rpx;
		display: flex;
		justify-content: space-between;
		align-items: center;

		&:nth-child(2n-1) {
			background-color: #f6f6f6;
		}

		.left {
			.ssid {
				font-size: 30rpx;
				font-weight: bolder;
			}

			.info {
				display: flex;
				font-size: 20rpx;

				.t {
					font-size: 25rpx;
				}

				.signalStrength {
					margin-left: 25rpx;
				}
			}
		}

		.right {
			color: #ea8155;
			transition: color .2s;

			&:active {
				color: #999;
			}

			&.text {
				padding: 0 20rpx;
				height: 50rpx;
				border-radius: 10rpx;
				line-height: 50rpx;
				font-size: 25rpx;
				transition: background-color .2s;
				background-color: #00b26a;
				color: #fff;

				&:active {
					background-color: #00834c;
				}
			}
		}
	}
</style>
