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

        <div v-if="getLastMessage" class="last-message">
            <MessageComponent v-bind="getLastMessage" :key="getLastMessage.id" />
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

import MessageComponent from '@/components/Message.vue'
import { cookAndSellStore } from '@/store/cook-and-sell'
import { statsStore } from '@/store/stats'
import { cookersStore } from '@/store/cookers'
import { sellersStore } from '@/store/sellers'
import { riskLevelsStore } from '@/store/risk-levels'
import { messagesStore } from '@/store/messages'
import RiskLevels from '@/types/risk-levels'
import { formatNumber, formatPrice } from '@/functions'

const cookers = ref({
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
})

const sellers = ref({
    label: 'Cash Money',
    actionLabel: 'SELL!'
})

const deaRiskColor = ref('green')
const irsRiskColor = ref('green')
const timeSinceLastSave = ref(0)
const refreshTimeSavedTimer = ref(0)

const numberFloat = ref(false)

const getBatchQuality = computed(() => {
    const qualities: Record<string, string> = cookers.value.qualities
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
})

const getBatches = computed(() => {
    const batches = cookAndSellStore.getState().batches

    return formatNumber(batches, 0)
})

const getCookerRpsNet = computed(() => {
    const batchesRps = statsStore.getState().cookerRps - statsStore.getState().sellerRps

    return formatNumber(batchesRps, 0)
})

const getCookerRps = computed(() => {
    const cookerRps = statsStore.getState().cookerRps

    return formatNumber(cookerRps, 0)
})

const getBatchPurity = computed(() => {
    const batchPurity = cookAndSellStore.getState().batchPurity

    return formatNumber(batchPurity, 2)
})

const getCash = computed(() => {
    const cash = cookAndSellStore.getState().cash

    return formatPrice(cash)
})

const getLaundered = computed(() => {
    const bank = cookAndSellStore.getState().bank

    return formatPrice(bank)
})

const getCashPerSecond = computed(() => {
    let sellerRps = statsStore.getState().sellerRps
    const cookerRps = statsStore.getState().cookerRps
    const batches = cookAndSellStore.getState().batches

    if (sellerRps > cookerRps && sellerRps > batches) {
        sellerRps = cookerRps
    }

    const cash = sellerRps * cookAndSellStore.getState().batchPurity

    return formatPrice(cash)
})

const deaRiskStyles = computed(() => {
    return {
        color: deaRiskColor.value
    }
})

const irsRiskStyles = computed(() => {
    return {
        color: irsRiskColor.value
    }
})

const getDeaRiskPercentage = computed(() => {
    const riskPercentage = cookersStore.getRisks() + sellersStore.getRisks()

    return formatNumber(riskPercentage * 100, 0)
})

const getIrsRiskPercentage = computed(() => {
    const riskPercentage = cookAndSellStore.getIrsRisk()

    return formatNumber(riskPercentage * 100, 0)
})

const getLastMessage = computed(() => {
    if (messagesStore.getState().items.length === 0) {
        return null
    }

    return messagesStore.getState().items[messagesStore.getState().items.length - 1]
})

function getDeaRiskLevel(): string {
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
            deaRiskColor.value = color
            return risk.label
        }

        color = risk.color
        label = risk.label
    }

    deaRiskColor.value = color
    return label
}

function getIrsRiskLevel(): string {
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
            irsRiskColor.value = color
            return risk.label
        }

        color = risk.color
        label = risk.label
    }

    irsRiskColor.value = color
    return label
}

function cook(event: MouseEvent) {
    const batches = statsStore.getState().cookerRoi + (statsStore.getState().cookerRps * cookAndSellStore.getState().cookRpsMultiplier)
    cookAndSellStore.modifyBatches(batches)
    statsStore.modifyCookedByClicks(batches)
    statsStore.modifyTotalCooked(batches)

    const makeUp = document.getElementsByClassName('number-float make')[0].cloneNode() as HTMLElement
    makeUp.innerHTML = `+${formatPrice(batches)}`
    animateNumberFloat(event, makeUp)
}

function sell(event: MouseEvent) {
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
    animateNumberFloat(event, sellUp)
}

function animateNumberFloat(event: MouseEvent, element: HTMLElement) {
    element.style.display = 'block'
    element.style.left = (event.pageX - 30) + 'px'
    element.style.top = (event.pageY - 50) + 'px'
    document.body.append(element)

    const endY = event.pageY - 150
    let endX = event.pageX

    numberFloat.value = !numberFloat.value
    if (numberFloat.value) {
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
}

function updateTimeSinceSave(): void {
    timeSinceLastSave.value = Math.floor((Date.now() - statsStore.getState().lastSaveGame) / 1000)
}

if (refreshTimeSavedTimer.value) {
    window.clearInterval(refreshTimeSavedTimer.value)
}

refreshTimeSavedTimer.value = window.setInterval(() => {
    updateTimeSinceSave()
}, 1000)
</script>
