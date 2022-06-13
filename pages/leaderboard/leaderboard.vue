<template>
	<view>
		<!-- 本月暂时还没有人打卡~ -->
		<view class="ps" v-if="!listData.length">{{hintText}}</view>
		<view class="list" v-else>
			<view class="child" v-for="(item,index) of listData" :key="item.clockID._id">
				<view class="left">
					<view class="serial">{{index+1}}</view>
					<view class="pot"><img :src="item.clockID.image.substr(0,1) === '/' ? $domain + item.clockID.image : item.clockID.image" alt=""></view>
					<view class="info">
						<view class="user">
							<text v-if="item.clockID.super" class="userGrade">管理员</text>
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
				<view class="right">{{millisToTime(item.duration)}}</view>
			</view>
		</view>
		<view :class="[{'down': down},'bot']" @click="downFn">
			<view class="openBtn" data-down>
				<text :class="['iconfont','icon-pulldown',{'down': down}]" data-down></text>
			</view>
			<view class="ps" v-if="!userP">{{hintText}}</view>
			<view class="child" v-else>
				<view class="left">
					<view class="ser" v-if="userP.ranking === -1">无排名</view>
					<view :class="['serial',{one:userP.ranking === 1},{tow:userP.ranking === 2},{three:userP.ranking === 3}]" v-else>{{userP.ranking}}</view>
					<view class="pot"><img :src="userP.clockID.image.substr(0,1) === '/' ? $domain + userP.clockID.image : userP.clockID.image" alt=""></view>
					<view class="info">
						<view class="user">
							<text class="userName">{{userP.clockID.name}}</text>
							<text class="font-left iconfont icon-man" v-if="!userP.clockID.sex" style="color: deepskyblue; font-size: 32rpx;"></text>
							<text class="font-left iconfont icon-woman" v-else style="color: hotpink; font-size: 32rpx;"></text>
						</view>
						<view class="userInfo">
							<text>{{userP.clockID.studentID}}</text>
							<text style="margin-left: 10rpx;">{{userP.clockID.studentClass}}</text>
						</view>
					</view>
				</view>
				<view class="right">{{millisToTime(userP.duration)}}</view>
			</view>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				$domain: this.$domain,
				listData: [],
				userP: null,
				hintText: '加载中……',
				down: false
			}
		},
		created() {
			this.init()
		},
		methods: {
			millisToTime(duration) {
				if (duration < 60 * 1000) return (duration / 1000).toFixed(2) + 's'
				else if (duration < 60 * 60 * 1000) return (duration / 1000 / 60).toFixed(2) + 'min'
				else return (duration / 1000 / 60 / 60).toFixed(2) + 'h'
			},
			init() {
				let that = this
				let token = uni.getStorageSync('token')
				let userInfo = uni.getStorageSync('userInfo')
				if (!token && !userInfo) return uni.showModal({
					title: '提示',
					content: '请先登录',
					showCancel: false,
					success(res) {
						if (res.confirm) uni.navigateBack()
					}
				})
				userInfo = JSON.parse(userInfo)
				uni.showLoading({
					title: '加载中……',
					mask: true,
					success() {
						uni.request({
							url: that.$domain + '/lists/monthTop',
							method: 'POST',
							data: { token: that.$utils.RsaEncryption(token) },
							success(res) {
								if (res.statusCode !== 200) {
									uni.hideLoading()
									that.hintText = '抱歉，服务器崩溃了o(╥﹏╥)o'
									return uni.showModal({
										title: '提示',
										content: '抱歉，服务器崩溃了o(╥﹏╥)o',
										showCancel: false,
										success(res) {
											if (res.confirm) uni.navigateBack()
										}
									})
								}
								let data = res.data
								if (data.code === -1) {
									that.hintText = '虚位以待，本月暂时无人打卡！'
									let userObj = data.data[1]
									if(!userObj) {
										that.userP = {
											clockID: {
												name: userInfo.nickName,
												image: userInfo.avatarUrl,
												sex: userInfo.gender
											},
											duration: 0,
											ranking: -1
										}
									}else that.userP = userObj
									return 
								}
								if (data.code !== 0) {
									uni.hideLoading()
									that.hintText = data.msg
									return uni.showModal({
										title: '提示',
										content: data.msg,
										showCancel: false,
										success(res) {
											if (res.confirm) uni.navigateBack()
										}
									})
								}
								
								uni.hideLoading()
								if (!data.data[1]){
									that.userP = {
										clockID: {
											name: userInfo.nickName,
											image: userInfo.avatarUrl,
											sex: userInfo.gender
										},
										duration: 0,
										ranking: -1
									}
								}else that.userP = data.data[1]
								that.listData = data.data[0]
							},
							fail(e) {
								console.error(e)
								uni.hideLoading()
								return uni.showModal({
									title: '提示',
									content: 'Error: Request sending failed',
									showCancel: false,
									success(res) {
										if (res.confirm) uni.navigateBack()
									}
								})
							}
						})
					},
					fail(e) {
						console.error(e)
						that.hintText = '抱歉，小程序出错了o(╥﹏╥)o'
						uni.showModal({
							title: '提示',
							content: '抱歉，小程序出现错误',
							showCancel: false,
							success(res) {
								if (res.confirm) uni.navigateBack()
							}
						})
					}
				})
			},
			downFn(e) {
				let target = e.target
				if (!target.dataset['down']) return
				this.down = !this.down
			}
		}
	}
</script>

<style scoped lang="less">
	.ps {
		padding: 20rpx 0;
		height: 50rpx;
		font-size: 30rpx;
		line-height: 50rpx;
		text-align: center;
		color: #999;
	}

	.list {
		padding-bottom: 35rpx;
	}

	.child {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 20rpx 20rpx 20rpx 40rpx;
		border-bottom: 1rpx solid #ccc;

		&:nth-child(1) .left .serial {
			font-weight: bolder;
			color: #fff;
			background-color: #e24d46;
		}

		&:nth-child(2) .left .serial {
			font-weight: bolder;
			color: #fff;
			background-color: #2ea7e0;
		}

		&:nth-child(3) .left .serial {
			font-weight: bolder;
			color: #fff;
			background-color: #6bc30d;
		}

		.left {
			display: flex;
			justify-items: center;
			align-items: center;

			.serial {
				margin-right: 30rpx;
				width: 60rpx;
				height: 60rpx;
				border-radius: 50%;
				line-height: 60rpx;
				font-size: 32rpx;
				text-align: center;
				color: #515250;
				background-color: #edefee;
			}

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
					margin-top: 6rpx;
					color: #a3a3a3;
					font-size: 20rpx;
				}
			}
		}

		.right {
			padding: 0 20rpx;
			line-height: 60rpx;
			font-size: 30rpx;
		}
	}

	.bot {
		position: fixed;
		bottom: 0;
		width: 100%;
		box-shadow: -2rpx 0 20rpx 2rpx #d2d3d0;
		background-color: #fff;
		transition: transform .3s;
		
		.serial{
			background-color: #edefee !important;
			&.one{
				background-color: #e24d46 !important;
			}
			&.tow{
				background-color: #2ea7e0 !important;
			}
			&.three{
				background-color: #6bc30d !important;
			}
		}

		&.down {
			transform: translateY(calc(100% - 35rpx));
		}

		.child {
			border: none;

			.ser {
				margin-right: 30rpx;
				font-style: italic;
				font-size: 25rpx;
			}
		}

		.openBtn {
			width: 100%;
			height: 35rpx;
			line-height: 35rpx;
			text-align: center;
			background-color: #f4f4f4;

			.iconfont {
				display: inline-block;
				font-size: 50rpx;
				color: #ccc;
				transition: transform .3s;

				&.down {
					transform: rotate(180deg);
				}
			}
		}
	}
</style>
