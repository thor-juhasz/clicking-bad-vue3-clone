<template>
    <div class="sidebar">
        <CookAndSell :last-save-time="lastSaveTime" />
    </div>

    <div class="content">
        <div v-if="gameUpdated()" class="game-updated">
            <span>The game has been updated! It may be wise to create a backup before refreshing.</span>
        </div>

        <nav class="nav-container">
            <router-link v-for="(r, index) in router.getRoutes().filter(r => !r.aliasOf)"
                         :to="r.path"
                         :key="index"
                         active-class="active"
                         exact-active-class="active">
                {{ getRouteName(r.path, r.name) }}
            </router-link>
        </nav>

        <div class="page-container">
            <router-view />
        </div>
    </div>

    <footer>
        <p>
            &copy; juhasz.pro, version <strong>{{ pkg.version }}</strong>
            updated on <strong>{{ (new Date(pkg.updatedAt)).toString() }}</strong>
            &mdash; Clone of <a href="http://clickingbad.nullism.com/" rel="external nofollow" title="Original Clicking Bad by nullism">Clicking Bad</a> written in VueJS.
            [<a href="https://github.com/thor-juhasz/clicking-bad-vue3-clone/issues/new" target="_blank" rel="noopener">Report Bug (GitHub)</a>]
        </p>
    </footer>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter, useRoute, RouteRecordNameGeneric } from 'vue-router'

import CookAndSell from '@/components/CookAndSell.vue'
import { cookAndSellStore } from '@/store/cook-and-sell'
import { cookersStore } from '@/store/cookers'
import { sellersStore } from '@/store/sellers'
import { upgradesStore } from '@/store/upgrades'
import { banksStore } from '@/store/banks'
import { statsStore } from '@/store/stats'
import { achievementsStore } from '@/store/achievements'
import { eventsStore } from '@/store/events'
import { messagesStore } from '@/store/messages'
import {
    formatPrice,
    loadGame,
    saveGame,
} from '@/functions'

import pkg from '@/../package.json'

const router = useRouter()
const route = useRoute()

const gameTimer = ref<number>(0)
const eventTimer = ref<number>(0)
const saveTimer = ref<number>(0)

const tickInterval = ref<number>(250)
const lastTickTime = ref<number>(Date.now())
const lastSaveTime = ref<number>(Date.now() / 1000 - 60)

const unlockedCookers = computed(() => {
    return Object.keys(cookersStore.unlockedCookers()).length
})

const unlockedSellers = computed(() => {
    return Object.keys(sellersStore.unlockedSellers()).length
})

const unlockedUpgrades = computed(() => {
    let count = 0
    for (const key in (upgradesStore.unlockedUpgrades())) {
        if (!Object.prototype.hasOwnProperty.call(upgradesStore.unlockedUpgrades(), key)) {
            continue
        }

        const upgrade = upgradesStore.unlockedUpgrades()[key]
        if (upgrade.purchased) {
            count++
        }
    }

    return count
})

const unlockedBanks = computed(() => {
    return Object.keys(banksStore.unlockedBanks()).length
})

const unlockedAchievements= computed(() => {
    let count = 0
    for (const key in achievementsStore.unlockedAchievements()) {
        if (!Object.prototype.hasOwnProperty.call(achievementsStore.unlockedAchievements(), key)) {
            continue
        }

        const achievement = achievementsStore.unlockedAchievements()[key]
        if (achievement.unlocked) {
            count++
        }
    }

    return count
})

const cookersTotal = computed(() => {
    return Object.keys(cookersStore.getState().items).length
})

const sellersTotal = computed(() => {
    return Object.keys(sellersStore.getState().items).length
})

const upgradesTotal = computed(() => {
    let count = 0
    for (const key in (upgradesStore.getState().items)) {
        if (!Object.prototype.hasOwnProperty.call(upgradesStore.getState().items, key)) {
            continue
        }

        const upgrade = upgradesStore.getState().items[key]
        if (!upgrade.hidden || upgrade.purchased) {
            count++
        }
    }

    return count
})

const banksTotal = computed(() => {
    return Object.keys(banksStore.getState().items).length
})

const achievementsTotal = computed(() => {
    let count = 0
    for (const key in achievementsStore.getState().items) {
        if (!Object.prototype.hasOwnProperty.call(achievementsStore.getState().items, key)) {
            continue
        }

        const achievement = achievementsStore.getState().items[key]
        if (!achievement.hidden || achievement.unlocked) {
            count++
        }
    }

    return count
})

function getRouteName(path: string, name: RouteRecordNameGeneric) {
    let extra = ''
    switch (path) {
        case '/cookers':
            extra = `${unlockedCookers.value}/${cookersTotal.value}`
            break
        case '/sellers':
            extra = `${unlockedSellers.value}/${sellersTotal.value}`
            break
        case '/upgrades':
            extra = `${unlockedUpgrades.value}/${upgradesTotal.value}`
            break
        case '/laundering':
            extra = `${unlockedBanks.value}/${banksTotal.value}`
            break
        case '/achievements':
            extra = `${unlockedAchievements.value}/${achievementsTotal.value}`
            break
    }

    if (extra !== '') {
        return `${String(name)} (${extra})`
    }

    return String(name)
}

// TODO: Implement update-check
function gameUpdated() {
    return false
}

function gameTick(): void {
    const tickTime = Date.now()
    let ticks = Math.round((tickTime - lastTickTime.value) / tickInterval.value)

    if (ticks > 360000) {
        ticks = 360000
    } else if (ticks < 1) {
        return
    }

    const timeSinceLastTick = tickTime - lastTickTime.value
    if (timeSinceLastTick > 0) {
        statsStore.modifyTimePlayed(timeSinceLastTick)
    }

    lastTickTime.value = tickTime

    updateBatches(ticks)
    updateCash(ticks)
    updateBanks(ticks)
    updateAchievements()
    updateTitle()
}

function updateBatches(ticks: number): void {
    const tickSub = 1000 / tickInterval.value
    const cookers = cookersStore.getState().items
    let amount = 0
    for (const cooker of Object.values(cookers)) {
        amount += cooker.amount * cooker.rps
    }

    if (amount === 0) {
        return
    }

    statsStore.setCookerRps(amount)

    amount = amount / tickSub * ticks
    cookAndSellStore.modifyBatches(amount)
    statsStore.modifyTotalCooked(amount)
}

function updateCash(ticks: number): void {
    const tickSub = 1000 / tickInterval.value
    const sellers = sellersStore.getState().items
    let batches = 0
    for (const seller of Object.values(sellers)) {
        batches += seller.amount * seller.rps
    }

    if (batches === 0) {
        return
    }

    statsStore.setSellerRps(batches)

    batches = batches / tickSub
    if (batches > cookAndSellStore.getState().batches) {
        batches = cookAndSellStore.getState().batches
    }

    const batchPurity = cookAndSellStore.getState().batchPurity
    const amount = batches * batchPurity * ticks

    cookAndSellStore.modifyBatches(-Math.abs(batches))
    cookAndSellStore.modifyCash(amount)
    statsStore.modifyTotalCash(amount)
    statsStore.modifyTotalSold(amount)
}

function updateBanks(ticks: number): void {
    const tickSub = 1000 / tickInterval.value
    const banks = banksStore.getState().items
    let amount = 0
    for (const bank of Object.values(banks)) {
        amount += bank.amount * bank.rps
    }

    if (amount === 0) {
        return
    }

    statsStore.setBankRps(amount)

    amount = amount / tickSub * ticks
    const cash = cookAndSellStore.getState().cash
    const launderedCash = cookAndSellStore.getState().bank
    if (amount > (cash - launderedCash)) {
        amount = (cash - launderedCash)
    }

    cookAndSellStore.modifyBank(amount)
    statsStore.modifyTotalBank(amount)
}

function updateAchievements(): void {
    achievementsStore.processAchievements()
}

function updateTitle(initial?: boolean): void {
    let title = `Clicking Bad`
    const routeName = route.name

    if (typeof routeName === 'string') {
        title = `${routeName} | Clicking Bad`
    }
    if (initial) {
        document.title = title
        return
    }

    document.title = `${formatPrice(cookAndSellStore.getState().cash)} | ${title}`
}

function checkEvents(): void {
    for (const key in eventsStore.getState().items) {
        if (!Object.prototype.hasOwnProperty.call(eventsStore.getState().items, key)) {
            continue
        }

        const item = eventsStore.getState().items[key]
        const rng = Math.random()
        if (item.chance > rng) {
            eventsStore.runEvent(item.sid)
        }
    }
}

onMounted(() => {
    if (gameTimer.value !== 0) {
        clearInterval(gameTimer.value)
    }
    if (eventTimer.value !== 0) {
        clearInterval(eventTimer.value)
    }
    if (saveTimer.value !== 0) {
        clearInterval(saveTimer.value)
    }

    loadGame()
    updateTitle(true)
    statsStore.setLastSaveGame(Date.now())

    setTimeout(() => {
        gameTimer.value = window.setInterval(() => gameTick(), tickInterval.value)
        eventTimer.value = window.setInterval(() => checkEvents(), 120_000) // Every 2 minutes
        saveTimer.value = window.setInterval(() => saveGame(), 30_000) // Every 30 seconds
        messagesStore.addMessage(`Welcome to Clicking Bad, bitch.`)
    }, 25)
})
</script>
