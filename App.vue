<script>
	export default {
		onLaunch: function() {
			console.log('App Launch')
		},
		onShow: function() {
			console.log('App Show')
		},
		onHide: function() {
			console.log('App Hide')
		}
	}
</script>

<style>
	/*每个页面公共css */
	@font-face {
	  font-family: "iconfont"; /* Project id 3370086 */
	  src: url('@/static/font/iconfont.woff2?t=1651753881437') format('woff2'),
	       url('@/static/font/iconfont.woff?t=1651753881437') format('woff'),
	       url('@/static/font/iconfont.ttf?t=1651753881437') format('truetype');
	}
	
	.iconfont {
	  font-family: "iconfont" !important;
	  font-size: 20px;
	  font-style: normal;
	  -webkit-font-smoothing: antialiased;
	  -moz-osx-font-smoothing: grayscale;
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
