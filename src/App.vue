<template>
    <div class="sidebar">
        <CookAndSell :lastSaveTime="lastSaveTime"/>
    </div>

    <div class="content">
        <div v-if="gameUpdated()" class="game-updated">
            <span>The game has been updated! It may be wise to create a backup before refreshing.</span>
        </div>

        <nav class="nav-container">
            <router-link active-class="active" exact-active-class="" to="/cookers">
                Manufacturing ({{ Object.keys(unlockedCookers).length }}/{{ cookersTotal }})
            </router-link>
            <router-link active-class="active" exact-active-class="" to="/sellers">
                Distribution ({{ Object.keys(unlockedSellers).length }}/{{ sellersTotal }})
            </router-link>
            <router-link active-class="active" exact-active-class="" to="/upgrades">
                Upgrades ({{ Object.keys(unlockedUpgrades).length }}/{{ upgradesTotal }})
            </router-link>
            <router-link active-class="active" exact-active-class="" to="/laundering">
                Laundering ({{ Object.keys(unlockedBanks).length }}/{{ banksTotal }})
            </router-link>
            <router-link active-class="active" exact-active-class="" to="/achievements">
                Achievements ({{ Object.keys(unlockedAchievements).length }}/{{ achievementsTotal }})
            </router-link>
            <router-link active-class="active" exact-active-class="" to="/messages">
                All Messages
            </router-link>
            <router-link active-class="active" exact-active-class="" to="/misc">
                Options & Stats
            </router-link>
        </nav>

        <div class="page-container">
            <router-view/>
        </div>
    </div>

    <footer>
        <p>
            ©2013 nullism.com, version <b>{{ getVersion }}</b>
            updated on <b>{{ getUpdatedAt }}</b> &mdash; now with less beta, bitch.
            [<a href="http://clickingbad.tumblr.com" target="_blank">Dev Blog</a>]
            [<a href="https://github.com/nullism/clickingbad/issues/new" target="_blank">Report Bug (GitHub)</a>]
            [<a href="https://play.google.com/store/apps/details?id=com.nullism.clickingbad" target="_blank">Free Android App</a>]
        </p>
    </footer>
</template>

<script lang="ts">
import { defineComponent } from "vue"
import CookAndSell from './components/CookAndSell.vue'

import pkg from '@/../package.json'

import { cookAndSellStore } from "@/store/cook-and-sell"
import { cookersStore } from "@/store/cookers"
import { sellersStore } from "@/store/sellers"
import { upgradesStore } from "@/store/upgrades"
import Cooker from "@/types/cookers"
import Seller from "@/types/sellers"
import Upgrade from "@/types/upgrades"
import { banksStore } from "@/store/banks"
import { statsStore } from "@/store/stats"
import Bank from "@/types/banks"
import { achievementsStore } from "@/store/achievements"
import Achievement from "@/types/achievements"
import { eventsStore } from "@/store/events"
import { messagesStore } from "@/store/messages"
import {
    formatPrice,
    loadGame,
    saveGame,
} from "@/functions"

export default defineComponent({
    components: { CookAndSell },
    data: () => {
        return {
            gameTimer: 0,
            eventTimer: 0,
            saveTimer: 0,

            tickInterval: 250,
            lastTickTime: Date.now(),
            lastSaveTime: (Date.now() / 1000) - 60,
        }
    },
    computed: {
        unlockedCookers: (): Record<string, Cooker> => cookersStore.unlockedCookers(),
        unlockedSellers: (): Record<string, Seller> => sellersStore.unlockedSellers(),
        unlockedUpgrades: (): Record<string, Upgrade> => upgradesStore.unlockedUpgrades(),
        unlockedBanks: (): Record<string, Bank> => banksStore.unlockedBanks(),
        unlockedAchievements: (): Record<string, Achievement> => achievementsStore.unlockedAchievements(),
        cookersTotal: (): number => Object.keys(cookersStore.getState().items).length,
        sellersTotal: (): number => Object.keys(sellersStore.getState().items).length,
        upgradesTotal: (): number => Object.keys(upgradesStore.getState().items).length,
        banksTotal: (): number => Object.keys(banksStore.getState().items).length,
        achievementsTotal: (): number => Object.keys(achievementsStore.getState().items).length,
        getVersion: (): string => pkg.version,
        getUpdatedAt: (): string => (new Date(pkg.updatedAt)).toString(),
    },
    methods: {
        gameUpdated() {
            return false
        },
        gameTick(): void {
            const tickTime = Date.now()
            let ticks = Math.round((tickTime - this.lastTickTime) / this.tickInterval)

            if (ticks > 360000) {
                ticks = 360000
            } else if (ticks < 1) {
                return
            }

            const timeSinceLastTick = tickTime - this.lastTickTime
            if (timeSinceLastTick > 0) {
                statsStore.modifyTimePlayed(timeSinceLastTick)
            }

            this.lastTickTime = tickTime

            this.updateBatches(ticks)
            this.updateCash(ticks)
            this.updateBanks(ticks)
            this.updateAchievements()
            this.updateTitle()
        },
        updateBatches(ticks: number): void {
            const tickSub = 1000 / this.tickInterval
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
        },
        updateCash(ticks: number): void {
            const tickSub = 1000 / this.tickInterval
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
        },
        updateBanks(ticks: number): void {
            const tickSub = 1000 / this.tickInterval
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
        },
        updateAchievements(): void {
            achievementsStore.processAchievements()
        },
        updateTitle(initial?: boolean): void {
            let title = `Clicking Bad`
            const routeName: any = this.$route.name

            if (typeof routeName === "string") {
                title = `${routeName} | Clicking Bad`
            }
            if (initial) {
                document.title = title
                return
            }

            document.title = `${formatPrice(cookAndSellStore.getState().cash)} | ${title}`
        },
        checkEvents(): void {
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
        },
    },
    created() {
        if (this.gameTimer !== 0) {
            clearInterval(this.gameTimer)
        }
        if (this.eventTimer !== 0) {
            clearInterval(this.eventTimer)
        }
        if (this.saveTimer !== 0) {
            clearInterval(this.saveTimer)
        }

        loadGame()
        this.updateTitle(true)
        statsStore.setLastSaveGame(Date.now())

        setTimeout(() => {
            this.gameTimer = setInterval(() => this.gameTick(), this.tickInterval)
            this.eventTimer = setInterval(() => this.checkEvents(), 120_000) // Every 2 minutes
            this.saveTimer = setInterval(() => saveGame(), 30_000) // Every 30 seconds
            messagesStore.addMessage(`Welcome to Clicking Bad, bitch.`)
        }, 25)
    },
})
</script>

<style lang="scss">
@import "styles/app.scss";
</style>
