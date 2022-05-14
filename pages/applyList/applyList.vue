<template>
	<view class="list">
		<view class="title">申请列表</view>
		<view class="none" v-if="!userList.length">{{hintText}}</view>
		<view class="main" @click="passFn($event)">
			<view class="list-child" v-for="(item, index) in userList" :key="item.studentID">
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
					<text id="pass" :data-id="item._id" :data-index='index'>通过</text>
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
				userList: [],
				hintText: '加载中……',
				ifOperation: false
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
				if (target.id !== 'pass') return
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
								_id: that.$utils.RsaEncryption(_id)
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
											if (res.confirm) { uni.preloadPage({ url: 'pages/my/my' }) }
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
									title: '成功',
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
		.list-child {
			display: flex;
			justify-content: space-between;
			align-items: center;
			padding: 20rpx 50rpx;
			border-bottom: 1rpx solid #ccc;

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
				padding: 0 20rpx;
				height: 60rpx;
				border-radius: 10rpx;
				line-height: 60rpx;
				font-size: 30rpx;
				transition: background-color .2s;
				background-color: #00b26a;
				color: #fff;

				&:active {
					background-color: #00834c;
				}
			}
		}

		.none {
			padding: 20rpx 0;
			height: 50rpx;
			font-size: 30rpx;
			line-height: 50rpx;
			text-align: center;
			color: #999;
		}
	}
</style>
