import { createApp } from "vue"
import VueGtag from "vue-gtag-next"

import router from "./router"
import App from "./App.vue"
import pkg from "../package.json"

const vm = createApp(App, { buildTime: (new Date(pkg.updatedAt)).valueOf() })

if (process.env.VUE_APP_GA_ID) {
    vm.use(VueGtag, {
        property: {
            id: process.env.VUE_APP_GA_ID
        },
    })
}

vm.use(router).mount('#app')
