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
                Manufacturing ({{ unlockedCookers }}/{{ cookersTotal }})
            </router-link>
            <router-link active-class="active" exact-active-class="" to="/sellers">
                Distribution ({{ unlockedSellers }}/{{ sellersTotal }})
            </router-link>
            <router-link active-class="active" exact-active-class="" to="/upgrades">
                Upgrades ({{ unlockedUpgrades }}/{{ upgradesTotal }})
            </router-link>
            <router-link active-class="active" exact-active-class="" to="/laundering">
                Laundering ({{ unlockedBanks }}/{{ banksTotal }})
            </router-link>
            <router-link active-class="active" exact-active-class="" to="/achievements">
                Achievements ({{ unlockedAchievements }}/{{ achievementsTotal }})
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
            &copy; juhasz.pro, version <strong>{{ getVersion }}</strong>
            updated on <strong>{{ getUpdatedAt }}</strong> &mdash; Clone of <a href="http://clickingbad.nullism.com/" rel="external nofollow" title="Original Clicking Bad by nullism">Clicking Bad</a> written in VueJS.
            [<a href="https://github.com/thor-juhasz/clicking-bad-vue3-clone/issues/new" target="_blank" rel="noopener">Report Bug (GitHub)</a>]
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
import { banksStore } from "@/store/banks"
import { statsStore } from "@/store/stats"
import { achievementsStore } from "@/store/achievements"
import { eventsStore } from "@/store/events"
import { messagesStore } from "@/store/messages"
import {
    formatPrice,
    loadGame,
    saveGame,
} from "@/functions"

export default defineComponent({
    components: { CookAndSell },
    props: {
        buildTime: {
            type: Number,
            required: true,
        },
    },
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
        unlockedCookers(): number {
            return Object.keys(cookersStore.unlockedCookers()).length
        },
        unlockedSellers(): number {
            return Object.keys(sellersStore.unlockedSellers()).length
        },
        unlockedUpgrades(): number {
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
        },
        unlockedBanks(): number {
            return Object.keys(banksStore.unlockedBanks()).length
        },
        unlockedAchievements(): number {
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
        },
        cookersTotal(): number {
            return Object.keys(cookersStore.getState().items).length
        },
        sellersTotal(): number {
            return Object.keys(sellersStore.getState().items).length
        },
        upgradesTotal(): number {
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
        },
        banksTotal(): number {
            return Object.keys(banksStore.getState().items).length
        },
        achievementsTotal(): number {
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
        },
        getVersion(): string {
            return pkg.version
        },
        getUpdatedAt: function(): string {
            return (new Date(this.buildTime)).toString()
        },
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
