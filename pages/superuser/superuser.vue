<template>
	<view>
		<view>
			<view class="top">
				<view class="title">管理功能</view>
				<view class="main">
					<navigator class="m m1" url="/pages/applyList/applyList">
						<text class="font-left iconfont icon-shenqingliebiao"></text>
						<text class="txt">申请列表</text>
					</navigator>
					<navigator class="m m2" url="/pages/settingIP/settingIP">
						<text class="font-left iconfont icon-IPdizhi"></text>
						<text class="txt">IP设置</text>
					</navigator>
					<view class="m m3">
						<text class="font-left iconfont icon-gengduo"></text>
						<text class="txt">更多</text>
					</view>
				</view>
			</view>
			<view class="list">
				<view class="title red">成员列表</view>
				<view class="none" v-if="!userList.length">{{hintText}}</view>
				<view class="list-child" @click="delFn($event)" v-for="item of userList" :key="item.studentID">
					<view class="left">
						<view class="pot"><img :src="item.image.substr(0,1) === '/' ? $domain + item.image : item.image" alt=""></view>
						<view class="info">
							<view class="user">
								<text :class="[{admin: item.super},'userGrade']">{{item.super?'管理员':'成员'}}</text>
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
						<text id="del" :data-id="item._id" class="font-left iconfont icon-shanchu" style="font-size: 50rpx;"></text>
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
				userList: [],
				hintText: '加载中……'
			}
		},
		created() {
			this.verify()
		},
		beforeDestroy() {
			uni.$off('superuser-updata')
		},
		methods: {
			init(token) {
				let that = this
				uni.request({
					url: that.$domain + '/lists/member',
					method: 'POST',
					data: { token: that.$utils.RsaEncryption(token) },
					success(res) {
						uni.hideLoading()
						uni.$on('superuser-updata', data => that.init(data))
						if (res.statusCode !== 200) {
							that.hintText = '加载失败o(╥﹏╥)o'
							return uni.showModal({
								title: '提示',
								content: '抱歉，服务器崩溃了o(╥﹏╥)o',
								showCancel: false
							})
						}
						let data = res.data
						if (data.code !== 0) {
							that.hintText = '加载失败o(╥﹏╥)o'
							return uni.showModal({
								title: '提示',
								content: data.msg,
								showCancel: false
							})
						}
						that.hintText = '暂时还没有成员哦！'
						that.userList = data.data
					}
				})
			},
			verify() {
				let that = this
				uni.showLoading({
					title: '努力加载中……',
					mask: true,
					success() {
						let token = uni.getStorageSync('token')
						if (!token) {
							uni.hideLoading()
							return uni.showModal({
								title: '提示',
								content: '登录状态出错',
								showCancel: false,
							})
						}
						uni.request({
							url: that.$domain + '/users/super',
							method: 'POST',
							data: { token: that.$utils.RsaEncryption(token) },
							success(res) {
								if (res.statusCode !== 200) {
									uni.hideLoading()
									return uni.showModal({
										title: '提示',
										content: '抱歉，服务器崩溃了o(╥﹏╥)o',
										showCancel: false,
										success(res) { if (res.confirm) { uni.navigateBack() } }
									})
								}
								let data = res.data
								if (data.code !== 0) {
									uni.hideLoading()
									return uni.showModal({
										title: '提示',
										content: data.msg,
										showCancel: false,
										success(res) { if (res.confirm) { uni.navigateBack() } }
									})
								}
								data = JSON.parse(that.$utils.AESDecode(data.data))
								if (!data.super) {
									uni.hideLoading()
									return uni.showModal({
										title: '提示',
										content: '抱歉，此功能仅开放给超级用户使用',
										showCancel: false,
										success(res) { if (res.confirm) { uni.navigateBack() } }
									})
								}
								that.init(token)
							},
							fail(e) {
								console.error(e)
								uni.hideLoading()
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
					}
				})
			},
			delFn(e) {
				let target = e.target
				if (target.id !== 'del') return
				uni.showModal({
					title: '提示',
					confirmText: '删除',
					confirmColor: 'red',
					content: '删除后将不可恢复，是否继续？',
					success(res) {
						if (res.confirm) {
							console.log(target.dataset.id)
						}
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
			background-color: #00b26a;
		}

		&.red::before {
			background-color: red;
		}
	}

	.main {
		display: flex;
		justify-content: space-around;
		padding: 20px 10px;
		margin-bottom: 10px;

		.m {
			display: flex;
			flex-direction: column;
			justify-content: center;
			align-items: center;
			width: 30%;
			height: 150rpx;
			border-radius: 10px;
			background-color: #f6f6f6;

			&:active {
				background-color: #e7e7e9;
			}

			.txt {
				margin-top: 7rpx;
				font-size: 30rpx;
				color: #000;
			}
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

					.userGrade {
						padding: 5rpx 10rpx;
						margin-right: 10rpx;
						font-size: 26rpx;
						background-color: #00b26a;
						color: #fff;

						&.admin {
							background-color: #FB7299;
						}
					}

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
				color: red;
				transition: color .2s;

				&:active {
					color: #999;
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
