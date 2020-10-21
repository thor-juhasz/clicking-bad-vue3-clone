import { createApp } from "vue"
import VueGtag from "vue-gtag-next"

import router from "./router"
import App from "./App.vue"

const vm = createApp(App, { buildTime: Date.now() })

if (process.env.VUE_APP_GA_ID) {
    vm.use(VueGtag, {
        property: {
            id: process.env.VUE_APP_GA_ID
        },
    })
}

vm.use(router).mount('#app')
