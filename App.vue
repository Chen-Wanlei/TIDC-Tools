<script>
	export default {
		onLaunch: function() {
			console.log('App Launch')
		},
		onShow: function() {
			const updateManager = uni.getUpdateManager()
			
			updateManager.onUpdateReady(function (res) {
			  uni.showModal({
			    title: '更新提示',
			    content: '新版本已经准备好，是否重启应用？',
			    success(res) {
			      if (res.confirm) {
			        // 新的版本已经下载好，调用 applyUpdate 应用新版本并重启
			        updateManager.applyUpdate()
			      }
			    }
			  })
			})
			
			updateManager.onUpdateFailed(function (res) {
			  // 新的版本下载失败
				uni.showModal({
				  title: '更新提示',
				  content: '新版本下载失败，请稍后自行删除小程序后重新打开！'
				})
			})
		},
		onHide: function() {
			console.log('App Hide')
		}
	}
</script>

<style>
	/*每个页面公共css */
	@font-face {
		font-family: "iconfont";
		/* Project id 3370086 */
		src: url('@/static/font/iconfont.woff2?t=1655129265530') format('woff2'),
			url('@/static/font/iconfont.woff?t=1655129265530') format('woff'),
			url('@/static/font/iconfont.ttf?t=1655129265530') format('truetype');
	}

	.iconfont {
		font-family: "iconfont" !important;
		font-size: 20px;
		font-style: normal;
		-webkit-font-smoothing: antialiased;
		-moz-osx-font-smoothing: grayscale;
	}

	.icon-pulldown:before {
		content: "\e79f";
	}

	.icon-shanchu:before {
		content: "\e614";
	}

	.icon-man:before {
		content: "\e7e2";
	}

	.icon-woman:before {
		content: "\e8f1";
	}

	.icon-shenqingliebiao:before {
		content: "\e60a";
	}

	.icon-gengduo:before {
		content: "\e600";
	}

	.icon-guanlizhongxin:before {
		content: "\e62e";
	}

	.icon-IPdizhi:before {
		content: "\e64b";
	}

	.icon-jiaruwomen:before {
		content: "\e61c";
	}

	.icon-next:before {
		content: "\e701";
	}

	.icon-paihangbang1:before {
		content: "\e651";
	}

	.icon-guanyuwomen:before {
		content: "\e655";
	}
</style>
