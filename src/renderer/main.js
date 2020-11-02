import Vue from 'vue'
import axios from 'axios'
import App from './App'
import router from './router'
import ElementUI from 'element-ui'
import store from './vuexText/startValus';
import 'element-ui/lib/theme-chalk/index.css'
import './assets/css/base.css'
import './assets/css/public.less'

if (!process.env.IS_WEB) {
    Vue.use(require('vue-electron'));
}

Vue.http = Vue.prototype.$http = axios;
Vue.config.productionTip = false;
Vue.use(ElementUI);

if (!process.env.IS_WEB) {
    Vue.use(require('vue-electron'))
    const logger = require('@/utils/log4js.js')
    Vue.logger = Vue.prototype.$logger = logger
}

// 全局异常捕获
// Vue.config.errorHandler = function (err, vm, info) {
//    vm.$logger.error('----异常捕获---err--：', err)
//    vm.$logger.error('----异常捕获---info--：', info)
// }

/* eslint-disable no-new */
new Vue({
    el: '#app',
    router,
    store,
    render: h => h(App)
}).$mount('#app');
