<template>
    <div class="purchasable-item">
        <h3 class="label">
            {{ label }}
            <span class="amount">{{ getAmount }}</span>
        </h3>

        <p><b>${{ getFormattedPrice }}</b> — <em>{{ description }}</em></p>

        <p class="stats">
            Launders <b><span>${{ getRps }}</span></b> per second
        </p>

        <button @click.exact="buyBank" :disabled="isBuyDisabled">Purchase</button>
        <button @click.exact="sellBank" :disabled="isSellDisabled">Sell</button>
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { cookAndSellStore } from '@/store/cook-and-sell'
import { banksStore } from '@/store/banks'
import {
    buyPrice as getBuyPrice,
    formatNumber,
    formatPrice,
    formatRps,
} from '@/functions'

const props = withDefaults(
    defineProps<{
        sid: string
        label: string
        description: string
        amount: number
        rps: number
        unlockRps: number
        baseCost: number
        cost: number
        unlocked?: boolean
    }>(),
    {
        unlocked: false,
    }
)

const getAmount= computed(() => {
    return formatNumber(props.amount, 0)
})

const getFormattedPrice = computed(() => {
    return formatPrice(buyPrice.value)
})

const getRps = computed(() => {
    return formatRps(props.rps)
})

const isBuyDisabled = computed(() => {
    return buyPrice.value > cookAndSellStore.getState().cash
})

const isSellDisabled = computed(() => {
    return props.amount === 0
})

const buyPrice = computed(() => {
    return getBuyPrice(props.amount, props.baseCost)
})

function buyBank() {
    banksStore.buyBank(props.sid)
}

function sellBank() {
    banksStore.sellBank(props.sid)
}
</script>
