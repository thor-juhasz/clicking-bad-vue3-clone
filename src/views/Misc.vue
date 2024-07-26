<!--suppress HtmlFormInputWithoutLabel -->
<template>
    <div class="misc">
        <div class="instructions">
            <h3>Instructions</h3>
            <ol>
                <li>Cook batches of meth</li>
                <li>Sell meth</li>
                <li>Buy stuff with your drug money</li>
            </ol>
        </div>

        <div class="options">
            <h3>Options</h3>
            <button @click.exact="reset()">Reset</button>
            <button @click.exact="reset(true)">Reset All</button>
            <button @click.exact="saveGame()">Save</button>
            <button @click.exact="loadGame()">Load</button>
        </div>

        <div class="backup">
            <h3>Backup</h3>
            <textarea ref="gameData" />
            <br>
            <button @click.exact="createBackup()">Create backup</button>
            <button @click.exact="importBackup()">Import backup</button>
        </div>

        <div class="status">
            <h3>Stats</h3>
            <ul>
                <li>Batches cooked: <strong>{{ getCookedBatches }}</strong></li>
                <li>Batches hand-cooked: <strong>{{ getHandCookedBatches }}</strong></li>
                <li>Batches sold: <strong>{{ getSoldBatches }}</strong></li>
                <li>Batches hand-sold: <strong>{{ getHandSoldBatches }}</strong></li>
                <li>Total upgrades purchased: <strong>{{ getTotalUpgrades }}</strong></li>
                <li>Total cash earned: <strong>{{ getTotalCashEarned }}</strong></li>
                <li>Total cash spent: <strong>{{ getTotalCashSpent }}</strong></li>
                <li>Batches made per click: <strong>{{ getCookedPerClick }}</strong></li>
                <li>Batches sold per click: <strong>{{ getSoldPerClick }}</strong></li>
                <li>Seconds spent playing: <strong>{{ getSecondsPlayed }}</strong></li>
                <li>Seconds since first start: <strong>{{ getSecondsSinceStart }}</strong></li>
            </ul>
        </div>

        <div class="credits">
            <h3>Credits</h3>
            <ul>
                <li><strong>Thor Juhasz</strong> &mdash; Development of the [<a href="https://github.com/thor-juhasz/clicking-bad-vue3-clone/" target="_blank" rel="noopener">VueJS clone</a>]</li>
                <li><strong>Aaron Meier</strong> &mdash; Programming and design of the [<a href="http://clickingbad.nullism.com/" rel="external nofollow" title="Original Clicking Bad by nullism">original game</a>]</li>
            </ul>
        </div>

        <div v-if="devMode">
            <h3>Dev Mode</h3>
            <p>Show items in current store</p>
            <button @click="showCookAndSell()">Show cookAndSell</button>
            <button @click="showStats()">Show stats</button>
            <button @click="showCookers()">Show cookers</button>
            <button @click="showSellers()">Show sellers</button>
            <button @click="showUpgrades()">Show upgrades</button>
            <button @click="showBanks()">Show banks</button>
            <button @click="showAchievements()">Show achievements</button>

            <br><br>

            <p>Show items from localStorage</p>
            <button @click="showCookAndSell(true)">Show cookAndSell</button>
            <button @click="showStats(true)">Show stats</button>
            <button @click="showCookers(true)">Show cookers</button>
            <button @click="showSellers(true)">Show sellers</button>
            <button @click="showUpgrades(true)">Show upgrades</button>
            <button @click="showBanks(true)">Show banks</button>
            <button @click="showAchievements(true)">Show achievements</button>

            <br><br>

            <p>Modifiers</p>
            <button @click.exact="giveBatches(1_000_000)">Give 1M batches</button>
            <button @click.exact="giveBatches(1_000_000_000_000_000_000)">Give 1Qi batches</button>
            <button @click.exact="giveCash(1_000_000)">Give $1 M cash</button>
            <button @click.exact="giveCash(1_000_000_000_000_000_000)">Give $1 Qi cash</button>
            <button @click.exact="addPlayTime()">Add 10 minutes playtime</button>
            <button @click.exact="addTotalTime()">Add 10 minutes total playtime</button>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { statsStore } from '@/store/stats'
import {
    formatNumber,
    getFromStorage,
    importGame,
    loadGame,
    resetGame,
    saveGame,
} from '@/functions'
import { cookAndSellStore } from '@/store/cook-and-sell'
import { cookersStore } from '@/store/cookers'
import { sellersStore } from '@/store/sellers'
import { upgradesStore } from '@/store/upgrades'
import { banksStore } from '@/store/banks'
import { achievementsStore } from '@/store/achievements'

export default defineComponent({
    data() {
        return {
            devMode: import.meta.env.DEV,
            secondsSinceStarted: ((Date.now() - statsStore.getState().startTime) / 1000),
        }
    },
    computed: {
        getCookedBatches() {
            return formatNumber(Math.floor(statsStore.getState().totalCooked), 0)
        },
        getHandCookedBatches() {
            return formatNumber(Math.floor(statsStore.getState().cookedByClicks), 0)
        },
        getSoldBatches() {
            return formatNumber(Math.floor(statsStore.getState().totalSold), 0)
        },
        getHandSoldBatches() {
            return formatNumber(Math.floor(statsStore.getState().soldByClicks), 0)
        },
        getTotalUpgrades() {
            return formatNumber(statsStore.getState().boughtUpgrades, 0)
        },
        getTotalCashEarned() {
            return formatNumber(Math.floor(statsStore.getState().totalCash), 0)
        },
        getTotalCashSpent() {
            return formatNumber(Math.floor(statsStore.getState().totalSpent), 0)
        },
        getCookedPerClick() {
            const batches = statsStore.getState().cookerRoi + (statsStore.getState().cookerRps * cookAndSellStore.getState().cookRpsMultiplier)
            return formatNumber(Math.floor(batches), 0)
        },
        getSoldPerClick() {
            const batches = statsStore.getState().sellerRoi + (statsStore.getState().sellerRps * cookAndSellStore.getState().sellRpsMultiplier)
            return formatNumber(Math.floor(batches), 0)
        },
        getSecondsPlayed() {
            return formatNumber(Math.floor(statsStore.getState().timePlayed / 1000), 0)
        },
        getSecondsSinceStart(): string {
            return formatNumber(this.secondsSinceStarted, 0)
        },
    },
    methods: {
        reset(all?: boolean) {
            if (all) {
                const confirmed = confirm('Are you sure? You\'ll lose everything, including all Achievements.')
                if (confirmed) {
                    resetGame(true)
                }
                return
            }

            const confirmed = confirm('Are you sure? You\'ll lose everything except Achievements.')
            if (confirmed) {
                resetGame()
            }
        },
        saveGame() { saveGame() },
        loadGame() { loadGame() },
        createBackup() {
            const data: HTMLInputElement = this.$refs.gameData as HTMLInputElement
            const storage: string|null = localStorage.getItem('cbvc')
            data.value = storage || ''
        },
        importBackup() {
            const data: HTMLInputElement = this.$refs.gameData as HTMLInputElement
            if (data.value === 'THANK YOU!') {
                upgradesStore.applyThankYou()
                return
            }

            importGame(data.value)
        },

        getFromStorage(key: string) {
            const storage: Record<string, unknown> = getFromStorage()

            return storage[key]
        },
        showCookAndSell(fromStorage?: boolean) {
            if (this.devMode) {
                if (fromStorage) {
                    console.log(this.getFromStorage('cookAndSell'))
                    return
                }
                console.log(cookAndSellStore.getState() as object)
            }
        },
        showStats(fromStorage?: boolean) {
            if (this.devMode) {
                if (fromStorage) {
                    console.log(this.getFromStorage('stats'))
                    return
                }
                console.log(statsStore.getState())
            }
        },
        showCookers(fromStorage?: boolean) {
            if (this.devMode) {
                if (fromStorage) {
                    console.log(this.getFromStorage('cookers'))
                    return
                }
                console.log(cookersStore.getState().items)
            }
        },
        showSellers(fromStorage?: boolean) {
            if (this.devMode) {
                if (fromStorage) {
                    console.log(this.getFromStorage('sellers'))
                    return
                }
                console.log(sellersStore.getState().items)
            }
        },
        showUpgrades(fromStorage?: boolean) {
            if (this.devMode) {
                if (fromStorage) {
                    console.log(this.getFromStorage('upgrades'))
                    return
                }
                console.log(upgradesStore.getState().items)
            }
        },
        showBanks(fromStorage?: boolean) {
            if (this.devMode) {
                if (fromStorage) {
                    console.log(this.getFromStorage('banks'))
                    return
                }
                console.log(banksStore.getState().items)
            }
        },
        showAchievements(fromStorage?: boolean) {
            if (this.devMode) {
                if (fromStorage) {
                    console.log(this.getFromStorage('achievements'))
                    return
                }
                console.log(achievementsStore.getState().items)
            }
        },
        giveBatches(amount: number) {
            cookAndSellStore.modifyBatches(amount)
        },
        giveCash(amount: number) {
            cookAndSellStore.modifyCash(amount)
        },
        addPlayTime() {
            statsStore.modifyTimePlayed(10 * 60 * 1000)
        },
        addTotalTime() {
            statsStore.modifyStartTime(-Math.abs(10 * 60 * 1000))
        },
    },
    created() {
        setInterval(() => {
            this.secondsSinceStarted = Math.floor((Date.now() - statsStore.getState().startTime) / 1000)
        }, 1000)
    },
})
</script>
