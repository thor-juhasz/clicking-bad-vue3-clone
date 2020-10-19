import { createRouter, createWebHistory, RouteRecordRaw } from "vue-router"

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

const routes: Array<RouteRecordRaw> = [
    { path: '/cookers', name: 'Manufacturing', component: Cookers },
    { path: '/sellers', name: 'Distribution', component: Sellers },
    { path: '/upgrades', name: 'Upgrades', component: Upgrades },
    { path: '/laundering', name: 'Laundering', component: Banks },
    { path: '/achievements', name: 'Achievements', component: Achievements },
    { path: '/messages', name: 'All Messages', component: Messages },
    { path: '/misc', name: 'Options & Stats', component: Misc },
]

export default createRouter({
    history: createWebHistory(process.env.BASE_URL),
    routes,
})
