import '@/styles/app.css'

import { createApp } from 'vue'
import VueGtag from 'vue-gtag-next'

import router from '@/plugins/router'
import App from '@/App.vue'

const app = createApp(App)

if (import.meta.env.VITE_APP_GA_ID) {
    app.use(VueGtag, {
        property: {
            id: import.meta.env.VITE_APP_GA_ID
        },
    })
}

app.use(router)
app.mount('#app')
