<template>
	<view>
		<view class="top-bg">
			<image style="width: 80%" src="../../static/logo.png" mode="widthFix"></image>
		</view>
		<view class="title">
			<text>欢迎加入科创</text>
		</view>
		<view class="text-area">
			<view class="studentID area">
				<text>学号：</text>
				<text class="err" v-show="!!err['s1']">*学号格式输入有误</text>
				<input id="s1" :class="{'on':focus === 's1'}" :focus="focus1 === 's1'" type="text" v-model="details.studentID" @blur="blurFn($event,'studentID')" @focus="focusFn" @confirm="confirmFn" maxlength="11" cursor-spacing="15" placeholder="eg: c1901050303" confirm-type="next">
			</view>
			<view class="name area">
				<text>姓名：</text>
				<text class="err" v-show="!!err['s2']">*姓名格式输入有误</text>
				<input id="s2" :class="{'on':focus === 's2'}" :focus="focus1 === 's2'" type="text" v-model="details.name" @blur="blurFn($event,'name')" @focus="focusFn" @confirm="confirmFn" maxlength="20" cursor-spacing="15" placeholder="eg: 李华" confirm-type="next">
			</view>
			<view class="cl area">
				<text>班级：</text>
				<text class="err" v-show="!!err['s3']">*班级格式输入错误</text>
				<input id="s3" :class="{'on':focus === 's3'}" :focus="focus1 === 's3'" type="text" v-model="details._class" @blur="blurFn($event,'_class')" @focus="focusFn" @confirm="confirmFn" maxlength="15" cursor-spacing="15" placeholder="eg: 19计应卓越班" confirm-type="next">
			</view>
			<view class="phone area">
				<text>手机：</text>
				<text class="err" v-show="!!err['s4']">*请输入正确的手机号码</text>
				<input id="s4" :class="{'on':focus === 's4'}" :focus="focus1 === 's4'" type="number" v-model="details.phone" @blur="blurFn($event,'phone')" @focus="focusFn" maxlength="11" cursor-spacing="15" placeholder="eg: 15988888888">
			</view>
		</view>
		<view>
			<button class="btn" @click="joinFn">Join</button>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				details: {
					studentID: '',
					name: '',
					_class: '',
					phone: '',
					clickState: false
				},
				Reg: {
					studentID: /^[c|C]?[2-5]\d{9}$/,
					name: /^[\u4e00-\u9fa5]{2,20}(\·[\u4e00-\u9fa5]+)*$/,
					_class: /^[2-5]\d[\u4e00-\u9fa5]{2}(\d{1,2}|[\u4e00-\u9fa5]{2}\d?)班$/,
					phone: /^(?:(?:\+|00)86)?1(?:(?:3[\d])|(?:4[5-7|9])|(?:5[0-3|5-9])|(?:6[5-7])|(?:7[0-8])|(?:8[\d])|(?:9[1|8|9]))\d{8}$/
				},
				err: {},
				focus: 's0',
				focus1: 's0',
			}
		},
		methods: {
			focusFn(e) {
				this.focus = e.target.id
				this.err[e.target.id] = false
			},
			blurFn(e, t) {
				let value = e.detail.value
				this.focus = ''
				if (!value) return
				if (!this.Reg[t].test(value)) {
					this.err[e.target.id] = true
				}
			},
			confirmFn(e) {
				this.focus1 = `s${parseInt(e.target.id.substr(1,1)) + 1}`
			},
			joinFn() {
				if (this.clickState) return
				this.clickState = true
				let text = ''
				let details = this.details
				let Reg = this.Reg
				if (!details.studentID) text = '请填写学号'
				else if (!details.name) text = '请填写姓名'
				else if (!details._class) text = '请填写班级'
				else if (!details.phone) text = '请填写手机号'

				if (text) {
					this.clickState = false
					return uni.showToast({
						title: text,
						icon: 'error',
						mask: true,
					})
				}

				if (!Reg.studentID.test(details.studentID)) text = '学号输入有误'
				else if (!Reg.name.test(details.name)) text = '姓名输入有误'
				else if (!Reg._class.test(details._class)) text = '班级输入有误'
				else if (!Reg.phone.test(details.phone)) text = '手机号输入有误'

				if (text) {
					this.clickState = false
					return uni.showToast({
						title: text,
						icon: 'error',
						mask: true,
					})
				}

				let token = uni.getStorageSync('token')
				let userInfo = uni.getStorageSync('userInfo')
				if (!token || !userInfo) {
					this.clickState = false
					return uni.showModal({
						title: '提示',
						content: '登录状态出错,请清除小程序缓存后重试',
						showCancel: false,
					})
				}

				userInfo = JSON.parse(userInfo)
				let option = {
					...this.details,
					sex: userInfo.gender,
					image: userInfo.avatarUrl
				}
				let that = this
				uni.request({
					url: that.$domain + '/users/join',
					method: 'POST',
					data: {
						token: that.$utils.RsaEncryption(token),
						details: that.$utils.RsaEncryption(JSON.stringify(option))
					},
					success(res) {
						if (res.statusCode !== 200) return uni.showModal({
							title: '提示',
							content: '抱歉，服务器崩溃了o(╥﹏╥)o',
							showCancel: false,
							complete() { that.clickState = false }
						})
						if (res.data.code) return uni.showModal({
							title: '提示',
							content: res.data.msg,
							showCancel: false,
							complete() { that.clickState = false }
						})
						uni.showModal({
							title: '提示',
							content: '提交成功，请等待管理员通过',
							showCancel: false,
							success(res) {
								if (res.confirm) { uni.navigateBack() }
							}
						})
					},
					fail() {
						uni.showToast({
							icon: 'error',
							title: '抱歉~ 出错了!',
							complete() {
								that.clickState = false
							}
						})
					}
				})
			}
		}
	}
</script>

<style scoped lang="less">
	.top-bg {
		display: flex;
		justify-content: center;
	}

	.title {
		margin-top: 20px;
		font-size: 20px;
		font-weight: bolder;
		text-align: center;
		color: #3b8fcb;
	}

	.text-area {
		padding: 0 10px 10px;
		margin: 0 auto;
		display: flex;
		flex-direction: column;
		width: 80%;
		box-sizing: border-box;

		.area {
			padding-top: 10px;

			text {
				padding-left: 5px;
				font-size: 16px;
				color: #666;

				&.err {
					margin-left: 20px;
					font-size: 12px;
					color: #dd3e16;
				}
			}

			input {
				padding: 0 15px;
				margin-top: 3px;
				height: 30px;
				border: 1px solid #aaa;
				border-radius: 10px;
				box-sizing: border-box;
				font-size: 14px;
				line-height: 14px;
				transition: box-shadow .2s, border .2s;

				&.on {
					border: 1px solid #fff;
					box-shadow: 0 0 5px #1e80ff;
				}
			}

			/deep/.input-placeholder {
				color: #ccc;
				font-style: oblique;
			}
		}
	}

	.btn {
		margin: 15px auto;
		border: 1px solid #26a0da;
		border-radius: 10px;
		width: 450rpx;
		height: 80rpx;
		color: #26a0da;
		background-color: #fff;
		text-align: center;
		line-height: 80rpx;
		transition: all .3s;

		&:active {
			color: #fff;
			background-color: #26a0da;
		}
	}
</style>
