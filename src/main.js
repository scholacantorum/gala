import Vue from 'vue'
import Vuetify from 'vuetify/lib'
import VuetifyConfirm from 'vuetify-confirm'
import 'vuetify/src/stylus/app.styl'

import App from './App.vue'
import store from './store'

Vue.config.productionTip = false
Vue.use(Vuetify, {
  iconfont: 'md',
})
Vue.use(VuetifyConfirm)

new Vue({
  store,
  render: h => h(App),
}).$mount('#app')
