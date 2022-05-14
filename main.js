import App from './App'
import utils from './utils'

// #ifndef VUE3
import Vue from 'vue'
Vue.config.productionTip = false
Vue.prototype.$utils = utils // 工具集
Vue.prototype.$domain = 'https://28248b043t.oicp.vip' // 请求地址
Vue.prototype.$getIP = 'https://pv.sohu.com/cityjson' // 搜狐IP接口
Vue.prototype.$ifVerifyToken = false // 是否进行登录验证
App.mpType = 'app'
const app = new Vue({ ...App })
app.$mount()
// #endif

// #ifdef VUE3
import { createSSRApp } from 'vue'
export function createApp() {
  const app = createSSRApp(App)
  return { app }
}
// #endif