import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'
import { trackRouter } from 'vue-gtag-next'
/**
 * Vue components of actual routes
 */
import Cookers from '@/views/Cookers.vue'
import Sellers from '@/views/Sellers.vue'
import Upgrades from '@/views/Upgrades.vue'
import Banks from '@/views/Banks.vue'
import Achievements from '@/views/Achievements.vue'
import Messages from '@/views/Messages.vue'
import Misc from '@/views/Misc.vue'

export const routes: Array<RouteRecordRaw> = [
    { path: '/cookers', name: 'Manufacturing', component: Cookers, alias: '/' },
    { path: '/sellers', name: 'Distribution', component: Sellers },
    { path: '/upgrades', name: 'Upgrades', component: Upgrades },
    { path: '/laundering', name: 'Laundering', component: Banks },
    { path: '/achievements', name: 'Achievements', component: Achievements },
    { path: '/messages', name: 'All Messages', component: Messages },
    { path: '/misc', name: 'Options & Stats', component: Misc },
]

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes,
})

if (import.meta.env.VITE_APP_GA_ID) {
    trackRouter(router)
}

export default router
