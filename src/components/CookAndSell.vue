<template>
    <div class="cook-and-sell-container">
        <div class="cook-sell">
            <div id="cook">
                <p>
                    {{ cookers.label }} (purity is <em>{{ getBatchQuality }}</em>)<br>
                    <strong>{{ getBatches }}</strong><br>
                    <small>{{ getCookerRpsNet }} per second (net)</small><br>
                    <small>{{ getCookerRps }} per second (gross)</small>
                </p>
                <div class="cook-button" @click.exact="cook">{{ cookers.actionLabel }}</div>
            </div>

            <div id="sell">
                <p>
                    {{ sellers.label }} (${{ getBatchPurity }} ea)<br>
                    $<strong>{{ getCash }}</strong><br>
                    <small>${{ getLaundered }} laundered</small><br>
                    <small>${{ getCashPerSecond }} per second</small>
                </p>
                <div class="sell-button" @click.exact="sell">{{ sellers.actionLabel }}</div>
            </div>
        </div>

        <div class="risk-container">
            You have a <b><span :style="deaRiskStyles">{{ getDeaRiskLevel() }}</span></b> chance of a DEA raid ({{ getDeaRiskPercentage }}%)<br>
            You have a <b><span :style="irsRiskStyles">{{ getIrsRiskLevel() }}</span></b> chance of an IRS audit ({{ getIrsRiskPercentage }}%)
        </div>

        <div class="last-saved">
            Game saved {{ timeSinceLastSave }} ago
        </div>

        <div class="last-message">
            <MessageComponent v-bind="getLastMessage" :key="getLastMessage.id" />
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent } from "vue"

import MessageComponent from "@/components/Message.vue"
import { cookAndSellStore } from "@/store/cook-and-sell"
import { statsStore } from "@/store/stats"
import { cookersStore } from "@/store/cookers"
import { sellersStore } from "@/store/sellers"
import { riskLevelsStore } from "@/store/risk-levels"
import { Message } from "@/types/messages"
import { messagesStore } from "@/store/messages"
import RiskLevels from "@/types/risk-levels"
import { formatNumber, formatPrice } from "@/functions"

export default defineComponent({
    components: { MessageComponent },
    data() {
        return {
            cookAndSell: cookAndSellStore.getState(),

            cookers: {
                label: 'Batches',
                actionLabel: 'COOK!',
                qualities: {
                    1: 'Deadly',
                    2: 'Dangerous',
                    4: 'Unhealthy',
                    6: 'Cloudy',
                    10: 'Poor',
                    13: 'Average',
                    16: 'Good',
                    20: 'Crystal',
                    25: 'Blue Gold',
                    50: 'Blue Platinum',
                    100: 'FDA Approved Additive',
                    159: 'Atomically Perfect',
                    211: 'Holy',
                    300: 'Angelic',
                    1000: 'Nectar of The Gods',
                },
            },

            sellers: {
                label: 'Cash Money',
                actionLabel: 'SELL!'
            },

            deaRiskColor: 'green',
            irsRiskColor: 'green',
            timeSinceLastSave: 0,
            refreshTimeSavedTimer: 0,

            numberFloat: false,
        }
    },
    computed: {
        getBatchQuality(): string {
            const qualities: Record<string, string> = this.cookers.qualities
            const qualityKeys = Object.keys(qualities)
                .sort(function(a: string, b: string): number {
                    return parseInt(a) - parseInt(b)
                })

            for (const key in qualityKeys) {
                if (!Object.prototype.hasOwnProperty.call(qualityKeys, key)) {
                    continue
                }

                const quality = qualityKeys[key]
                if (cookAndSellStore.getState().batchPurity > parseInt(quality)) {
                    continue
                }

                return qualities[quality]
            }

            return 'NA'
        },
        getBatches() {
            const batches = cookAndSellStore.getState().batches

            return formatNumber(batches, 0)
        },
        getCookerRpsNet() {
            const batchesRps = statsStore.getState().cookerRps - statsStore.getState().sellerRps

            return formatNumber(batchesRps, 0)
        },
        getCookerRps() {
            const cookerRps = statsStore.getState().cookerRps

            return formatNumber(cookerRps, 0)
        },
        getBatchPurity(): string {
            const batchPurity = cookAndSellStore.getState().batchPurity

            return formatNumber(batchPurity, 2)
        },
        getCash() {
            const cash = cookAndSellStore.getState().cash

            return formatPrice(cash)
        },
        getLaundered() {
            const bank = cookAndSellStore.getState().bank

            return formatPrice(bank)
        },
        getCashPerSecond(): string {
            let sellerRps = statsStore.getState().sellerRps
            const cookerRps = statsStore.getState().cookerRps
            const batches = cookAndSellStore.getState().batches

            if (sellerRps > cookerRps && sellerRps > batches) {
                sellerRps = cookerRps
            }

            const cash = sellerRps * cookAndSellStore.getState().batchPurity

            return formatPrice(cash)
        },
        deaRiskStyles(): object {
            return {
                color: this.deaRiskColor
            }
        },
        irsRiskStyles(): object {
            return {
                color: this.irsRiskColor
            }
        },
        getDeaRiskPercentage(): string {
            const riskPercentage = cookersStore.getRisks() + sellersStore.getRisks()

            return formatNumber(riskPercentage * 100, 1)
        },
        getIrsRiskPercentage(): string {
            const riskPercentage = cookAndSellStore.getIrsRisk()

            return formatNumber(riskPercentage * 100, 1)
        },
        getLastMessage(): Message {
            return messagesStore.getState().items[messagesStore.getState().items.length - 1]
        }
    },
    methods: {
        getDeaRiskLevel(): string {
            const riskPercentage = cookersStore.getRisks() + sellersStore.getRisks()
            const riskLevels: Record<string, RiskLevels> = riskLevelsStore.getState().items

            let color = riskLevels.r01.color
            let label = riskLevels.r01.label
            for (const key in riskLevels) {
                if (!Object.prototype.hasOwnProperty.call(riskLevels, key)) {
                    continue
                }

                const risk = riskLevels[key]

                if (riskPercentage < risk.level) {
                    this.deaRiskColor = color
                    return risk.label
                }

                color = risk.color
                label = risk.label
            }

            this.deaRiskColor = color
            return label
        },
        getIrsRiskLevel(): string {
            const riskPercentage = cookAndSellStore.getIrsRisk()
            const riskLevels: Record<string, RiskLevels> = riskLevelsStore.getState().items

            let color = riskLevels.r01.color
            let label = riskLevels.r01.label
            for (const key in riskLevels) {
                if (!Object.prototype.hasOwnProperty.call(riskLevels, key)) {
                    continue
                }

                const risk = riskLevels[key]

                if (riskPercentage < risk.level) {
                    this.irsRiskColor = color
                    return risk.label
                }

                color = risk.color
                label = risk.label
            }

            this.irsRiskColor = color
            return label
        },
        cook: function(event: MouseEvent) {
            const batches = statsStore.getState().cookerRoi + (statsStore.getState().cookerRps * cookAndSellStore.getState().cookRpsMultiplier)
            cookAndSellStore.modifyBatches(batches)
            statsStore.modifyCookedByClicks(batches)
            statsStore.modifyTotalCooked(batches)

            const makeUp = document.getElementsByClassName('number-float make')[0].cloneNode() as HTMLElement
            makeUp.innerHTML = `+${formatPrice(batches)}`
            this.animateNumberFloat(event, makeUp)
        },
        sell: function(event: MouseEvent) {
            const { batches, batchPurity } = cookAndSellStore.getState()
            const sellerRoi = statsStore.getState().sellerRoi + (statsStore.getState().sellerRps * cookAndSellStore.getState().sellRpsMultiplier)
            if (batches < sellerRoi) {
                return
            }

            const cash = batchPurity * sellerRoi
            cookAndSellStore.modifyCash(cash)
            cookAndSellStore.modifyBatches(-Math.abs(sellerRoi))
            statsStore.modifySoldByClicks(sellerRoi)
            statsStore.modifyTotalCash(cash)
            statsStore.modifyTotalSold(sellerRoi)

            const sellUp = document.getElementsByClassName('number-float sell')[0].cloneNode() as HTMLElement
            sellUp.innerHTML = `$${formatPrice(cash)}`
            this.animateNumberFloat(event, sellUp)
        },
        animateNumberFloat: function(event: MouseEvent, element: HTMLElement) {
            element.style.display = 'block'
            element.style.left = (event.pageX - 30) + 'px'
            element.style.top = (event.pageY - 50) + 'px'
            document.body.append(element)

            const endY = event.pageY - 150
            let endX = event.pageX

            this.numberFloat = !this.numberFloat
            if (this.numberFloat) {
                endX -= 60
            }

            setTimeout(function() {
                element.style.top = endY.toString() + 'px'
                element.style.left = endX.toString() + 'px'
                element.style.opacity = '0'
                setTimeout(function() {
                    element.remove()
                }, 1000)
            }, 25)
        },
        updateTimeSinceSave(): void {
            this.timeSinceLastSave = Math.floor((Date.now() - statsStore.getState().lastSaveGame) / 1000)
        },
    },
    created() {
        if (this.refreshTimeSavedTimer !== 0) {
            clearInterval(this.refreshTimeSavedTimer)
        }

        this.refreshTimeSavedTimer = setInterval(() => {
            this.updateTimeSinceSave()
        }, 1000)
    },
})
</script>
