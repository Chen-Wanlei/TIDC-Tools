<template>
	<view>
		<canvas id="canvas" height="260" type="2d" :style="{width:width+'px',height:height+'rpx'}"></canvas>
		<view class="image">
			<image :src="api + '/logo.png'" mode="aspectFit"></image>
		</view>
		<view class="info">
			<view class="part" v-for="item in dataArr" :key="item._id">
				<view class="title">{{item.title}}</view>
				<view class="main">
					<view class="con" v-for="t in item.content" :key="t._id">{{t.text}}</view>
				</view>
				<view :class="[{col2:item.image.length === 2, col3:item.image.length === 3, col4:item.image.length > 3},'img']">
					<image v-for="u in item.image" :key="u._id" :src="api + u.url" mode="aspectFill"></image>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	class Bubble {
		constructor(x, y) {
			this.x = x
			this.y = y
			this.vx = Math.random() * 3 - 1.5
			this.vy = Math.random() * 3 - 1.5
			this.r = Math.random() * 3 + 3
			this.dead = false
			// '#' + Math.random().toString(16).slice(2, 8)
			this.color = `rgba(${Math.floor(Math.random()*(255+1))},${Math.floor(Math.random()*(255+1))},${Math.floor(Math.random()*(255+1))},${Math.floor(3 + Math.random()*(7+1))/10})`
		}
		render(ctx) {
			ctx.beginPath()
			ctx.fillStyle = this.color
			ctx.globalCompositeOperation = 'lighter'
			ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2)
			ctx.fill()
		}
		update() {
			this.r *= 0.96
			this.x += this.vx
			this.y += this.vy
			if (this.r < 0.01) {
				this.dead = true
			}
		}
	}
	export default {
		data() {
			return {
				api: this.$domain,
				width: '',
				height: 320,
				canvas: null,
				bubbles: [],
				timer: null,
				animateState: true,
				ctx: null,
				dataArr: []
			}
		},
		mounted() {
			this.init()
		},
		beforeDestroy() {
			clearInterval(this.timer)
			this.animateState = false
		},
		methods: {
			init() {
				let that = this
				const query = wx.createSelectorQuery()
				query.select('#canvas')
					.fields({ node: true, size: true })
					.exec(res => {
						const canvas = that.canvas = res[0].node
						const dpr = wx.getSystemInfoSync().pixelRatio
						that.width = canvas.width = wx.getSystemInfoSync().windowWidth
						canvas.height = 320 / 750 * that.width
						that.ctx = that.canvas.getContext('2d')
						console.log(canvas.width, canvas.height)
						that.render()
						that.auto()
					})
				uni.request({
					url: this.api + '/TIDC/about',
					method: 'GET',
					success(res) {
						if (res.statusCode !== 200) {
							return uni.showModal({
								title: '提示',
								content: '抱歉，服务器崩溃了o(╥﹏╥)o',
								showCancel: false,
							})
						}
						if (res.data.code !== 0) {
							return uni.showModal({
								title: '提示',
								content: '未知错误，未获取到数据',
								showCancel: false,
							})
						}
						that.dataArr = res.data.data
					}
				})
			},
			auto() {
				clearInterval(this.timer)
				this.timer = setInterval(() => {
					this.bubbles.push(new Bubble(this.canvas.width * Math.random(), this.canvas.height * Math.random()))
				}, 30)
			},
			render() {
				this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
				this.bubbles.forEach(bubble => {
					bubble.render(this.ctx)
					bubble.update()
				})
				this.bubbles = this.bubbles.filter(bubble => {
					return !bubble.dead
				})
				this.animateState && this.canvas.requestAnimationFrame(() => this.render())
			}
		}
	}
</script>

<style lang="less">
	#canvas {
		background-color: #f1f1f2;
	}

	.about-title {
		position: absolute;
		top: 160rpx;
		width: 100%;
		font-size: 100rpx;
		text-align: center;
		transform: translateY(-50%);
		color: #fff;
		z-index: 1;
	}

	.image {
		margin: 0 auto;
		position: absolute;
		top: 0;
		display: flex;
		justify-content: center;
		align-items: center;
		width: 100%;
		height: 320rpx;

		image {
			margin: 0 auto;
			height: 280rpx;
		}
	}

	.info {
		margin: 20rpx 0 40rpx;
		width: 100%;

		.part {
			padding: 30rpx 0;
			margin: auto;
			width: 90%;
			border-radius: 20rpx;
			box-shadow: 0 0 10rpx #ccc;
			box-sizing: border-box;

			.title {
				padding: 0 28rpx;
				margin-bottom: 20rpx;
				font-family: '黑体';
				font-size: 30rpx;
				font-weight: bolder;
				box-sizing: border-box;

				&::before {
					content: '';
					display: block;
					float: left;
					margin-top: 5rpx;
					margin-right: 13rpx;
					width: 10rpx;
					height: 28rpx;
					border-radius: 20rpx;
					background-color: #fd9605;
				}
			}

			.main {
				padding: 0 40rpx;

				.con {
					font-family: '宋体';
					font-size: 25rpx;
					line-height: 50rpx;
					text-indent: 2em;
				}
			}

			.img {
				padding: 25rpx 40rpx 10rpx;
				display: flex;
				justify-content: space-between;
				align-items: center;
				overflow: hidden;

				image {
					flex: 1;
					flex-shrink: .8;
					border-radius: 20rpx;
					height: 355rpx;
				}

				&.col2 {
					padding: 25rpx 20rpx 10rpx;

					image {
						margin: 0 8rpx;
						height: 235rpx;
					}
				}

				&.col3 {
					padding: 25rpx 18rpx 10rpx;

					image {
						margin: 0 5rpx;
						height: 150rpx;
					}
				}

				&.col4 {
					padding: 25rpx 15rpx 10rpx;
					flex-wrap: wrap;
					box-sizing: border-box;

					image {
						margin: 10rpx 5rpx;
						flex: auto;
						display: block;
						width: calc(25% - 6.25rpx);
						height: 150rpx;
					}
				}
			}
		}

		.part+.part {
			margin-top: 25rpx;
		}
	}
</style>
