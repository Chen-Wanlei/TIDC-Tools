<template>
	<view class="content">
		<view class="tool-title">
			<text>周打卡总时长：</text>
			<text>今日打卡时长：</text>
		</view>
		<view class="tool-main">
			<view class="left">
				<view class="time weekTime">
					<text class="hour">{{weekTime.h}}</text>
					<text class="t">:</text>
					<text class="minute">{{weekTime.m}}</text>
					<text class="t">:</text>
					<text class="second">{{weekTime.s}}</text>
				</view>
			</view>
			<view class="right">
				<view class="time endtart">
					<text class="hour">{{dayTime.h}}</text>
					<text class="t">:</text>
					<text class="minute">{{dayTime.m}}</text>
					<text class="t">:</text>
					<text class="second">{{dayTime.s}}</text>
				</view>
			</view>
		</view>
		<view class="lastTime">
			<view class="tool-title">
				<text>最后打卡时间：</text>
			</view>
			<view class="none" v-if="!lastClock.year">{{lastClockMsg}}</view>
			<view class="shell" v-else>
				<view class="day">
					<text class="year">{{lastClock.year}}年</text>
					<text class="month">{{lastClock.month}}月</text>
					<text class="day">{{lastClock.day}}日</text>
				</view>
				<view class="time">
					<text class="hour">{{lastClock.h}}</text>
					<text class="t">:</text>
					<text class="minute">{{lastClock.m}}</text>
					<text class="t">:</text>
					<text class="second">{{lastClock.s}}</text>
				</view>
			</view>
		</view>
		<button class="btn" @click="startTool" v-if="!ifclock">开始打卡</button>
		<button class="btn" @click="endTool" v-else>结束打卡</button>
		<view class="tool-list">
			<view class="title">
				<text>今日打卡成员表：</text>
			</view>
			<view class="none" v-if="!listArr.length">{{listMsg}}</view>
			<view class="l" v-for="(item,index) in listArr" :key="index">
				<view class="left">
					<view class="pot">
						<img :src="item.clockID.image.substr(0,1) === '/' ? $domain + item.clockID.image : item.clockID.image" alt="">
					</view>
					<view class="info">
						<view class="user">
							<text class="userGrade" v-if="item.clockID.super">管理员</text>
							<text class="userName">{{item.clockID.name}}</text>
							<text class="font-left iconfont icon-man" v-if="!item.clockID.sex" style="color: deepskyblue; font-size: 32rpx;"></text>
							<text class="font-left iconfont icon-woman" v-else style="color: hotpink; font-size: 32rpx;"></text>
						</view>
						<view class="userInfo">
							<text>{{item.clockID.studentID}}</text>
							<text style="margin-left: 10rpx;">{{item.clockID.studentClass}}</text>
						</view>
					</view>
				</view>
				<view class="right">
					<view class="right-title">
						<text>状态：</text>
						<text>时间：</text>
					</view>
					<view class="right-info">
						<text :class="[{'red':item.sCode !== 2},'green']">{{item.sCode === 2?'打卡中':'已结束'}}</text>
						<text class="blue">{{getDateFn(item.reqDate)}}</text>
					</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				$domain: this.$domain,
				weekTime: {
					h: '00',
					m: '00',
					s: '00',
				},
				lastClock: {
					year: '',
					month: '',
					day: '',
					h: '',
					m: '',
					s: '',
				},
				dayTime: {
					h: '00',
					m: '00',
					s: '00',
					timestamp: 0
				},
				ifclock: false,
				listArr: [],
				listMsg: '加载中……',
				lastClockMsg: '未登录'
			}
		},
		created() {
			this.init()
			let that = this
			uni.$on('updateIndex', function(obj) {
				that.userInfoExist(obj.userInfo)
				that.getClockUserFn(obj.token)
				that.getDayTime(obj.token)
			})
		},
		methods: {
			userInfoExist(info) {
				info = info || {}
				if (info['clockList']) {
					let clockList = info.clockList
					let weekDuration = clockList.weekDuration
					let h = parseInt(weekDuration / 1000 / 60 / 60),
						m = parseInt(weekDuration / 1000 / 60 - h * 60),
						s = parseInt(weekDuration / 1000 - h * 3600 - m * 60)
					this.weekTime.h = h < 10 ? `0${h}` : h
					this.weekTime.m = m < 10 ? `0${m}` : m
					this.weekTime.s = s < 10 ? `0${s}` : s
					if (clockList.lastClock) {
						let lastClock = new Date(clockList.lastClock)
						let month = lastClock.getMonth() + 1,
							day = lastClock.getDate()
						h = lastClock.getHours()
						m = lastClock.getMinutes()
						s = lastClock.getSeconds()
						this.lastClock.year = lastClock.getFullYear()
						this.lastClock.month = month < 10 ? `0${month}` : month
						this.lastClock.day = day < 10 ? `0${day}` : day
						this.lastClock.h = h < 10 ? `0${h}` : h
						this.lastClock.m = m < 10 ? `0${m}` : m
						this.lastClock.s = s < 10 ? `0${s}` : s
					} else this.lastClockMsg = '您还未进行过打卡哦~'
					this.ifclock = clockList.ifclock
				} else {
					this.listMsg = '登录后才可查看'
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
							token = uni.getStorageSync('token')
							info = uni.getStorageSync('userInfo')
							this.userInfoExist(JSON.parse(info))
							this.getClockUserFn(token)
							this.getDayTime(token)
						}).catch(e => this.userInfoExist())
					} else {
						this.userInfoExist(JSON.parse(info))
						this.getClockUserFn(token)
						this.getDayTime(token)
					}
				} else {
					this.listMsg = '登录后才可查看'
				}
			},
			getClockUserFn(token) {
				let that = this
				uni.request({
					url: that.$domain + '/lists/clock',
					method: 'POST',
					data: { token: that.$utils.RsaEncryption(token) },
					success(resData) {
						if (resData.statusCode !== 200) return that.listMsg = '抱歉，服务器崩溃了o(╥﹏╥)o'
						if (resData.data.code !== 0) return that.listMsg = resData.data.msg
						that.listArr = resData.data.data
						that.listMsg = '暂无人打卡o(╥﹏╥)o'
					},
					fail(e) {
						that.listMsg = 'Error: Request sending failed'
						console.error(e)
					}
				})
			},
			getDateFn(time) {
				let date = new Date(time)
				let h = date.getHours()
				let m = date.getMinutes()
				let s = date.getSeconds()
				h = h < 10 ? `0${h}` : h
				m = m < 10 ? `0${m}` : m
				s = s < 10 ? `0${s}` : s
				return `${h}:${m}:${s}`
			},
			getDayTime(token) {
				let that = this
				uni.request({
					url: that.$domain + '/clocking/getDayDuration',
					method: 'POST',
					data: { token: that.$utils.RsaEncryption(token) },
					success(resData) {
						if (resData.statusCode !== 200) return uni.showModal({
							title: '提示',
							content: '抱歉，服务器崩溃了o(╥﹏╥)o',
							showCancel: false
						})
						if (resData.data.code !== 0) return uni.showModal({
							title: '提示',
							content: resData.data.msg,
							showCancel: false
						})
						let data = JSON.parse(that.$utils.AESDecode(resData.data.data))
						let time = that.dayTime.timestamp = data.time
						let h = parseInt(time / 1000 / 60 / 60),
							m = parseInt(time / 1000 / 60 - h * 60),
							s = parseInt(time / 1000 - h * 3600 - m * 60)
						that.dayTime.h = h < 10 ? `0${h}` : h
						that.dayTime.m = m < 10 ? `0${m}` : m
						that.dayTime.s = s < 10 ? `0${s}` : s
					},
					fail(e) {
						console.error(e)
						uni.showModal({
							title: '提示',
							content: 'Error: Request sending failed',
							showCancel: false
						})
					}
				})
			},
			async auth() {
				let that = this
				let result = await uni.getSetting()
				let [err, res] = result
				if (err) {
					console.error(err)
					return 4
				}
				if (!res.authSetting['scope.userLocation']) {
					let authResult = await uni.authorize({ scope: 'scope.userLocation' })
					let [err, res] = authResult
					return err ? 1 : 0
				} else return 0
			},
			async getWifi() {
				let result
				try {
					result = await wx.startWifi()
					let { errCode, errMsg } = result
					if (errCode) {
						console.error(errMsg)
						return {
							code: 4,
							msg: 'Wifi模块初始化失败'
						}
					}
				} catch (e) {
					console.error(e)
					return {
						code: 4,
						msg: 'Wifi模块初始化失败'
					}
				}

				let wifiResult
				try {
					wifiResult = await wx.getConnectedWifi()
					let { wifi, errCode, errMsg } = wifiResult
					if (errCode) return {
						code: 3,
						msg: errMsg
					}
					if (!wifi['signalStrength']) return {
						code: 1,
						msg: '未连接上wifi'
					}
					return {
						code: 0,
						msg: 'ok',
						wifi
					}
				} catch (e) {
					let { errCode, errMsg } = e
					if (errCode === 12005) return {
						code: 1,
						msg: '请打开设备Wifi'
					}
					return {
						code: 2,
						errMsg,
						msg: '获取本机wifi信息失败'
					}
				}
			},
			startTool() {
				let that = this
				let token = uni.getStorageSync('token')
				let userInfo = uni.getStorageSync('userInfo')
				if (!token && !userInfo) return uni.showModal({
					title: '提示',
					content: '请先登录',
					showCancel: false,
				})
				userInfo = JSON.parse(userInfo)
				if (!userInfo.member) return uni.showModal({
					title: '提示',
					content: '加入团体后才可打卡哦~',
					showCancel: false,
				})
				uni.showLoading({
					title: '加载中……',
					mask: true,
					async success() {
						let option = {}
						let verifyResult = await uni.request({
							url: that.$domain + '/clocking/getVerify',
							method: 'GET',
						})
						let [verifyErr, verifyRes] = verifyResult
						if (verifyRes.statusCode !== 200) {
							uni.hideLoading()
							return uni.showModal({
								title: '提示',
								content: '服务器错误',
								showCancel: false
							})
						}
						let verifyResData = verifyRes.data.data
						if (verifyResData['startupWifi']) {
							let code = await that.auth()
							if (code === 4) {
								uni.hideLoading()
								return uni.showModal({
									title: '提示',
									content: '出错了，getSetting调用失败',
									showCancel: false
								})
							} else if (code === 1) {
								await uni.showModal({
									title: '提示',
									content: '请打开位置信息权限',
									showCancel: false
								})
								let setResult = await uni.openSetting()
								let [err, res] = setResult
								if (err) {
									uni.hideLoading()
									return uni.showModal({
										title: '提示',
										content: '请前往设置页面，打开位置信息权限',
										showCancel: false
									})
								}
								if (!res.authSetting['scope.userLocation']) {
									uni.hideLoading()
									return uni.showModal({
										title: '提示',
										content: '获取位置信息权限失败',
										showCancel: false
									})
								}
							}
							let wifiInfoObj = await that.getWifi()
							if (wifiInfoObj.code) {
								(wifiInfoObj.code === 2) && console.log(wifiInfoObj.errMsg)
								uni.hideLoading()
								return uni.showModal({
									title: '提示',
									content: wifiInfoObj.msg,
									showCancel: false
								})
							}
							option['wifiInfo'] = {
								SSID: wifiInfoObj['wifi']['SSID'],
								BSSID: wifiInfoObj['wifi']['BSSID'],
							}
						}
						if (verifyResData['startupIP']) {
							let result = await uni.request({
								url: that.$getIP,
								method: 'GET',
							})
							let [err, res] = result
							if (res.statusCode !== 200) {
								uni.hideLoading()
								return uni.showModal({
									title: '提示',
									content: 'IP获取失败，IP接口错误',
									showCancel: false
								})
							}
							try {
								let ip = res.data.match(/cip":\s?"(\d{1,3}(?:\.\d{1,3}){3})"/)[1]
								ip = ip.match(/^((?:\d{1,3}\.){3})\d{1,3}$/)[1] + '**'
								option['ipInfo'] = { ip }
							} catch (e) {
								console.error(e)
								console.log(res.data)
								uni.hideLoading()
								return uni.showModal({
									title: '提示',
									content: 'IP获取失败，IP接口错误',
									showCancel: false
								})
							}
						}
						let result = await uni.request({
							url: that.$domain + '/clocking/clock',
							method: 'POST',
							data: {
								token: that.$utils.RsaEncryption(token),
								wifiInfo: option['wifiInfo'] && that.$utils.RsaEncryption(JSON.stringify(option['wifiInfo'])),
								ipInfo: option['ipInfo'] && that.$utils.RsaEncryption(JSON.stringify(option['ipInfo']))
							}
						})
						let [err, res] = result
						if (err) {
							uni.hideLoading()
							return uni.showModal({
								title: '提示',
								content: 'Error: Request sending failed',
								showCancel: false,
							})
						}
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
						let studentInfo = JSON.parse(that.$utils.AESDecode(data.data.info))
						let time = data.data.time
						let _id = studentInfo._id
						userInfo.clockList.ifclock = that.ifclock = true
						userInfo.clockList.lastClock = time
						uni.setStorageSync('token', that.$utils.AESDecode(data.data.token))
						uni.setStorageSync('userInfo', JSON.stringify(userInfo))
						uni.showToast({
							icon: 'success',
							title: '打卡成功'
						})
						let lastClock = new Date(time)
						let month = lastClock.getMonth() + 1,
							day = lastClock.getDate(),
							h = lastClock.getHours(),
							m = lastClock.getMinutes(),
							s = lastClock.getSeconds()
						that.lastClock = {
							year: lastClock.getFullYear(),
							month: month < 10 ? `0${month}` : month,
							day: day < 10 ? `0${day}` : day,
							h: h < 10 ? `0${h}` : h,
							m: m < 10 ? `0${m}` : m,
							s: s < 10 ? `0${s}` : s
						}
						let splice = null
						for (let index in that.listArr) {
							if (that.listArr[index].clockID._id === _id) {
								that.listArr[index].sCode = 2
								that.listArr[index].reqDate = time
								splice = that.listArr.splice(index, 1)
								break
							}
						}
						if (splice) return that.listArr.unshift(splice[0])
						that.listArr.unshift({
							sCode: 2,
							reqDate: new Date(time).getTime(),
							clockID: {
								image: userInfo.avatarUrl,
								super: userInfo.super,
								name: userInfo.nickName,
								sex: userInfo.gender,
								...studentInfo
							}
						})
					}
				})
			},
			endTool() {
				let that = this
				let token = uni.getStorageSync('token')
				let userInfo = uni.getStorageSync('userInfo')
				if (!token && !userInfo) {
					return uni.showModal({
						title: '提示',
						content: '登录状态出错',
						showCancel: false,
					})
				}
				userInfo = JSON.parse(userInfo)
				if (!userInfo.member) return uni.showModal({
					title: '提示',
					content: '加入团体后才可打卡哦~',
					showCancel: false,
				})
				uni.showLoading({
					title: '加载中……',
					mask: true,
					async success() {
						let option = {}
						let verifyResult = await uni.request({
							url: that.$domain + '/clocking/getVerify',
							method: 'GET',
						})
						let [verifyErr, verifyRes] = verifyResult
						if (verifyRes.statusCode !== 200) {
							uni.hideLoading()
							return uni.showModal({
								title: '提示',
								content: '服务器错误',
								showCancel: false
							})
						}
						let verifyResData = verifyRes.data.data
						if (verifyResData['startupWifi']) {
							let code = await that.auth()
							if (code === 4) {
								uni.hideLoading()
								return uni.showModal({
									title: '提示',
									content: '出错了，getSetting调用失败',
									showCancel: false
								})
							} else if (code === 1) {
								await uni.showModal({
									title: '提示',
									content: '请打开位置信息权限',
									showCancel: false
								})
								let setResult = await uni.openSetting()
								let [err, res] = setResult
								if (err) {
									uni.hideLoading()
									return uni.showModal({
										title: '提示',
										content: '请前往设置页面，打开位置信息权限',
										showCancel: false
									})
								}
								if (!res.authSetting['scope.userLocation']) {
									uni.hideLoading()
									return uni.showModal({
										title: '提示',
										content: '获取位置信息权限失败',
										showCancel: false
									})
								}
							}
							let wifiInfoObj = await that.getWifi()
							if (wifiInfoObj.code) {
								(wifiInfoObj.code === 2) && console.log(wifiInfoObj.errMsg)
								uni.hideLoading()
								return uni.showModal({
									title: '提示',
									content: wifiInfoObj.msg,
									showCancel: false
								})
							}
							option['wifiInfo'] = {
								SSID: wifiInfoObj['wifi']['SSID'],
								BSSID: wifiInfoObj['wifi']['BSSID'],
							}
						}
						if (verifyResData['startupIP']) {
							let result = await uni.request({
								url: that.$getIP,
								method: 'GET',
							})
							let [err, res] = result
							if (res.statusCode !== 200) {
								uni.hideLoading()
								return uni.showModal({
									title: '提示',
									content: 'IP获取失败，IP接口错误',
									showCancel: false
								})
							}
							try {
								let ip = res.data.match(/cip":\s?"(\d{1,3}(?:\.\d{1,3}){3})"/)[1]
								ip = ip.match(/^((?:\d{1,3}\.){3})\d{1,3}$/)[1] + '**'
								option['ipInfo'] = { ip }
							} catch (e) {
								console.error(e)
								console.log(res.data)
								uni.hideLoading()
								return uni.showModal({
									title: '提示',
									content: 'IP获取失败，IP接口错误',
									showCancel: false
								})
							}
						}
						let result = await uni.request({
							url: that.$domain + '/clocking/quitClock',
							method: 'POST',
							data: {
								token: that.$utils.RsaEncryption(token),
								wifiInfo: option['wifiInfo'] && that.$utils.RsaEncryption(JSON.stringify(option['wifiInfo'])),
								ipInfo: option['ipInfo'] && that.$utils.RsaEncryption(JSON.stringify(option['ipInfo']))
							}
						})
						let [err, res] = result
						if (err) {
							uni.hideLoading()
							return uni.showModal({
								title: '提示',
								content: 'Error: Request sending failed',
								showCancel: false,
							})
						}
						if (res.statusCode !== 200) {
							uni.hideLoading()
							return uni.showModal({
								title: '提示',
								content: '抱歉，服务器崩溃了o(╥﹏╥)o',
								showCancel: false,
							})
						}
						let data = res.data
						if (data.code !== 0 && data.code !== -2) {
							uni.hideLoading()
							return uni.showModal({
								title: '提示',
								content: data.msg,
								showCancel: false,
							})
						}

						let _id = that.$utils.AESDecode(data.data._id)
						let newToken = that.$utils.AESDecode(data.data.token)
						userInfo.clockList.ifclock = that.ifclock = false
						userInfo.clockList.monthFrequency += 1
						if (data.code !== -2) {
							let duration = parseInt(that.$utils.AESDecode(data.data.duration))
							userInfo.clockList.monthDuration += duration
							let weekDuration = userInfo.clockList.weekDuration += duration
							let h = parseInt(weekDuration / 1000 / 60 / 60),
								m = parseInt(weekDuration / 1000 / 60 - h * 60),
								s = parseInt(weekDuration / 1000 - h * 3600 - m * 60)
							that.weekTime.h = h < 10 ? `0${h}` : h
							that.weekTime.m = m < 10 ? `0${m}` : m
							that.weekTime.s = s < 10 ? `0${s}` : s
							let dayDuration = that.dayTime.timestamp += duration
							h = parseInt(dayDuration / 1000 / 60 / 60)
							m = parseInt(dayDuration / 1000 / 60 - h * 60)
							s = parseInt(dayDuration / 1000 - h * 3600 - m * 60)
							that.dayTime.h = h < 10 ? `0${h}` : h
							that.dayTime.m = m < 10 ? `0${m}` : m
							that.dayTime.s = s < 10 ? `0${s}` : s
						}
						uni.setStorageSync('token', newToken)
						uni.setStorageSync('userInfo', JSON.stringify(userInfo))
						uni.hideLoading()
						if(!data.code){
							uni.showToast({
								icon: 'success',
								title: '退卡成功'
							})
						}else{
							uni.showModal({
								title: '提示',
								content: data.msg,
								showCancel: false,
							})
						}
						uni.$emit('updateMy', userInfo)
						for (let item of that.listArr) {
							if (item.clockID._id === _id) {
								item.sCode = data.code ? 0 : 1
								break
							}
						}
					}
				})
			}
		}
	}
</script>

<style scoped lang="less">
	.content {
		display: flex;
		flex-direction: column;
		align-items: center;
		background-color: #e7e7e7;
		min-height: 100vh;
	}

	.tool-title {
		display: flex;
		justify-content: center;
		align-items: center;
		justify-content: space-around;
		width: 100%;
		background-color: #fff;
		padding: 30rpx 0 20rpx 0;

		>text {
			color: #476582;
			padding: 0.25rem 0.5rem;
			margin: 0;
			font-size: .85em;
			font-weight: bolder;
			border-radius: 3px;
		}
	}

	.tool-main {
		padding-bottom: 40rpx;
		display: flex;
		justify-content: center;
		align-items: center;
		justify-content: space-around;
		width: 100%;
		font-size: 40rpx;
		background-color: #fff;


		>view {
			height: 180rpx;
			padding: 20rpx 40rpx;
			border: 1rpx solid #ccc;
			border-radius: 10px;
			box-shadow: 0px 0px 10px 2px #ddd;
			background-color: #fff;
			box-sizing: border-box;
			display: flex;
			flex-direction: column;
			flex-wrap: wrap;
			justify-content: space-around;
			align-items: center;
		}

		.right {
			color: #26a0da;
		}

		.time .t {
			margin: 0 10rpx;
		}
	}

	.lastTime {
		padding-bottom: 50rpx;
		margin-bottom: 50rpx;
		width: 100%;
		background-color: #fff;
		box-shadow: 0 4px 5px #ccc;
		text-align: center;

		.tool-title {
			padding-top: 0;
		}
	}

	.btn {
		margin: 0 auto;
		border: 1px solid #26a0da;
		border-radius: 10px;
		width: 400rpx;
		height: 80rpx;
		color: #26a0da;
		background-color: #fff;
		text-align: center;
		line-height: 80rpx;
		transition: all .3s;
		box-shadow: 2px 2px 5px 3px #ccc;

		&:active {
			color: #fff;
			background-color: #26a0da;
		}
	}

	.tool-list {
		flex: 1;
		margin-top: 60rpx;
		width: 100%;
		margin-bottom: 0;
		background-color: #fff;
		box-shadow: 0 -2px 5px #ccc;

		.title {
			color: #476582;
			margin: 0;
			font-size: .85em;
			font-weight: bolder;
			border-radius: 3px;
		}

		>view {
			padding: 20rpx 40rpx;
			border-bottom: 1rpx solid #ccc;

			&.l {
				display: flex;
				justify-content: space-between;
				align-items: center;
			}

			>.left {
				display: flex;

				.pot {
					overflow: hidden;
					width: 90rpx;
					height: 90rpx;
					border-radius: 50%;

					img {
						width: 100%;
						height: 100%;
					}
				}

				.info {
					margin-left: 20rpx;
					display: flex;
					flex-direction: column;
					justify-content: space-evenly;

					.userGrade {
						padding: 5rpx 10rpx;
						margin-right: 10rpx;
						font-size: 26rpx;
						background-color: #FB7299;
						color: #fff;
					}

					.userName {
						font-size: 32rpx;
						margin-right: 10rpx;
					}

					.userInfo {
						color: #a3a3a3;
						font-size: 20rpx;
					}

					.userStartToolTime {
						line-height: 50rpx;
						font-size: 28rpx;
						font-weight: 600;
						color: #6d757a;

						text {
							padding: 0.25rem 0.5rem;
							font-size: .85em;
							color: #01aaed;
							background-color: rgba(27, 31, 35, .05);
						}
					}
				}
			}

			>.right {
				padding: 10rpx 20rpx;
				display: flex;
				border-radius: 10rpx;
				align-items: center;
				justify-content: center;
				font-size: 25rpx;
				color: #333;
				background-color: #f5f5f5;

				>view {
					display: flex;
					flex-direction: column;
					font-size: .95em;
					font-weight: bolder;
					border-radius: 3px;
					text-align: center;

				}

				.right-info .green {
					color: #00b26a;
				}

				.right-info .red {
					color: #e21918;
				}

				.right-info .blue {
					color: #3e83fb;
				}
			}
		}
	}

	.none {
		padding: 20rpx 0;
		height: 50rpx;
		border: none !important;
		font-size: 30rpx;
		line-height: 50rpx;
		text-align: center;
		color: #999;
	}
</style>
