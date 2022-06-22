<template>
	<view class="list" @touchstart="initialization()">
		<view class="title">申请列表</view>
		<view class="none" v-if="!userList.length">{{hintText}}</view>
		<view class="main" @touchend="passFn($event)">
			<view :class="['list-child',{anim: animStyle !== index}]" v-for="(item, index) in userList" :key="item.studentID" :data-index='index'
				:style="changeLeft.i === index? `transform: translateX(-${changeLeft.v}rpx)` : ''" @touchstart.stop="touchstart($event,index)"
				@touchmove="touchmove($event,index)" @touchend="touchend($event)">
				<view class="left">
					<view class="pot"><img :src="item.image.substr(0,1) === '/' ? $domain + item.image : item.image" alt=""></view>
					<view class="info">
						<view class="user">
							<text class="userName">{{item.name}}</text>
							<text class="font-left iconfont icon-man" v-if="!item.sex" style="color: deepskyblue; font-size: 32rpx;"></text>
							<text class="font-left iconfont icon-woman" v-else style="color: hotpink; font-size: 32rpx;"></text>
						</view>
						<view class="userInfo">
							<text>{{item.studentID}}</text>
							<text style="margin-left: 10rpx;">{{item.studentClass}}</text>
						</view>
					</view>
				</view>
				<view class="right">
					<text class="icon iconfont icon-doubleleft"></text>
				</view>
				<view class="beyond">
					<view id="pass" class="block" :data-id="item._id" :data-index='index'>通过</view>
					<view id="fail" class="block fail" :data-id="item._id" :data-index='index'>拒绝</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	let touch = {
		touchX: 0,
		touchY: 0,
		limitMaxX: 270,
		// limitMinY: 30,
		oldV: 0
	}
	export default {
		data() {
			return {
				$domain: this.$domain,
				userList: [],
				hintText: '加载中……',
				ifOperation: false,
				animStyle: -1,
				changeLeft: {
					i: -1,
					v: 0
				}
			}
		},
		created() {
			this.init()
		},
		beforeDestroy() {
			if (this.ifOperation) {
				let token = uni.getStorageSync('token')
				if (typeof token === 'string') uni.$emit('superuser-updata', token)
			}
		},
		methods: {
			init() {
				let token = uni.getStorageSync('token')
				if (!token) {
					uni.hideLoading()
					return uni.showModal({
						title: '提示',
						content: '登录状态出错',
						showCancel: false,
					})
				}
				let that = this
				uni.request({
					url: that.$domain + '/lists/apply',
					method: 'POST',
					data: { token: that.$utils.RsaEncryption(token) },
					success(res) {
						if (res.statusCode !== 200) {
							that.hintText = '加载失败o(╥﹏╥)o'
							return uni.showModal({
								title: '提示',
								content: '抱歉，服务器崩溃了o(╥﹏╥)o',
								showCancel: false
							})
						}
						let data = res.data
						if (data.code === -1) {
							that.hintText = '权限不够哦(。・＿・。)ﾉI’m sorry~'
							return uni.showModal({
								title: '提示',
								content: '抱歉，此功能仅开放给超级用户使用',
								showCancel: false,
								success(res) {
									if (res.confirm) { uni.preloadPage({ url: 'pages/my/my' }) }
								}
							})
						}
						if (data.code !== 0) {
							that.hintText = '加载失败o(╥﹏╥)o'
							return uni.showModal({
								title: '提示',
								content: data.msg,
								showCancel: false
							})
						}
						that.hintText = '暂时还没有申请人员(⊙︿⊙)'
						that.userList = data.data
					},
					fail(e) {
						that.hintText = '服务器错误！'
						console.error(e)
						uni.showModal({
							title: '提示',
							content: 'Error: Request sending failed',
							showCancel: false
						})
					}
				})
			},
			passFn(e) {
				let target = e.target
				if (target.id !== 'pass' && target.id !== 'fail') return
				let token = uni.getStorageSync('token')
				if (!token) {
					uni.hideLoading()
					return uni.showModal({
						title: '提示',
						content: '登录状态出错',
						showCancel: false,
					})
				}
				let that = this
				let _id = target.dataset.id
				let index = target.dataset.index
				uni.showLoading({
					title: '操作中',
					mask: true,
					success() {
						uni.request({
							url: that.$domain + '/users/pass',
							method: 'POST',
							data: {
								token: that.$utils.RsaEncryption(token),
								_id: that.$utils.RsaEncryption(_id),
								ifPass: target.id
							},
							success(res) {
								if (res.statusCode !== 200) {
									uni.hideLoading()
									return uni.showModal({
										title: '提示',
										content: '抱歉，服务器崩溃了o(╥﹏╥)o',
										showCancel: false
									})
								}
								let data = res.data
								if (data.code === -1) {
									uni.hideLoading()
									return uni.showModal({
										title: '提示',
										content: '抱歉，此功能仅开放给超级用户使用',
										showCancel: false,
										success(res) {
											if (res.confirm) {
												uni
													.preloadPage({ url: 'pages/my/my' })
											}
										}
									})
								}
								if (data.code !== 0) {
									uni.hideLoading()
									return uni.showModal({
										title: '提示',
										content: data.msg,
										showCancel: false
									})
								}
								uni.hideLoading()
								uni.showToast({
									icon: 'success',
									title: target.id === 'pass' ? '已通过' : '已拒绝',
									mask: true
								})
								that.userList.splice(index, 1)
								that.ifOperation = true
							},
							fail(e) {
								console.error(e)
								uni.hideLoading()
								uni.showModal({
									title: '提示',
									content: 'Error: Request sending failed',
									showCancel: false,
								})
							}
						})
					}
				})
			},
			touchstart(event, index) {
				let changeLeft = this.changeLeft
				if (changeLeft.i !== -1 && index !== changeLeft.i) {
					this.animStyle = -1
					changeLeft.i = -1
					changeLeft.v = 0
				}
				let changedTouches = event.changedTouches[0]
				touch.touchX = changedTouches.clientX
				touch.touchY = changedTouches.clientY
			},
			touchmove(event, index) {
				if (this.animStyle === -1) this.animStyle = index
				let clientX = event.changedTouches[0].clientX,
					clientY = event.changedTouches[0].clientY
				let _x = touch.touchX - clientX
				if (_x <= 0 && !this.changeLeft.v) return
				this.changeLeft.i = index
				if (_x > 0) {
					console.log()
					if (this.changeLeft.v === touch.limitMaxX) return
					if (_x > touch.limitMaxX) _x = touch.limitMaxX
					this.changeLeft.v = _x
					touch.oldV = _x
				} else {
					let changeX = touch.oldV + _x
					if (changeX < 0) changeX = 0
					this.changeLeft.v = changeX
				}
			},
			touchend(event) {
				let _x = touch.touchX - event.changedTouches[0].clientX
				if (this.animStyle !== -1) this.animStyle = -1
				if (_x > 0) {
					if (_x > 60) _x = touch.limitMaxX
					else _x = 0
				} else if (_x < 0) {
					if (_x < 220) _x = 0
					else _x = touch.limitMaxX
				} else return
				this.changeLeft.v = _x
				touch.oldV = _x
			},
			initialization() {
				if (this.animStyle !== -1) this.animStyle = -1
				this.changeLeft.i = -1
				this.changeLeft.v = 0
			}
		}
	}
</script>

<style scoped lang="less">
	.title {
		padding: 5px 13px;
		border-bottom: 1px dotted #ccc;
		font-size: 14px;
		line-height: 20px;

		&::before {
			content: '';
			display: block;
			float: left;
			margin-top: 3px;
			margin-right: 6px;
			width: 5px;
			height: 14px;
			border-radius: 10px;
			background-color: #f7cda3;
		}
	}

	.list {
		min-height: 100vh;

		.list-child {
			position: relative;
			display: flex;
			justify-content: space-between;
			align-items: center;
			padding: 20rpx 50rpx;
			border-bottom: 1rpx solid #ccc;

			&.anim {
				transition: transform .2s ease-in;
			}

			.left {
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

					.userName {
						font-size: 32rpx;
						margin-right: 10rpx;
					}

					.userInfo {
						color: #a3a3a3;
						font-size: 20rpx;
					}
				}
			}

			.right {
				.icon {
					font-size: 50rpx;
					color: #b6b6b6;
				}
			}

			.beyond {
				position: absolute;
				top: 0;
				right: -270rpx;
				display: flex;
				height: 100%;

				.block {
					display: flex;
					justify-content: center;
					align-items: center;
					width: 135rpx;
					height: 100%;
					font-size: 30rpx;
					color: #fff;
					background-color: #00b26a;

					&.fail {
						background-color: #ea4335;
					}
				}
			}
		}

		.none {
			padding: 20rpx 0;
			height: 80rpx;
			font-size: 30rpx;
			line-height: 50rpx;
			text-align: center;
			color: #999;
		}
	}
</style>
