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
	/* ./static/iconfont/ */
	@import "./static/iconfont/iconfont.css";
</style>
