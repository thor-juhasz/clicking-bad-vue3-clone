import { createApp } from "vue"
import VueGtag from "vue-gtag-next"

import router from "./router"
import App from "./App.vue"

const vm = createApp(App)

if (process.env.VUE_APP_GA_ID) {
    vm.use(VueGtag, {
        config: { id: process.env.VUE_APP_GA_ID },
    }, router)
}

vm.use(router).mount('#app')
