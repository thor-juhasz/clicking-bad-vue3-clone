<template>
    <div class="purchasable-item">
        <h3 class="label">
            {{ label }}
            <span class="amount">{{ getAmount }}</span>
        </h3>

        <p><b>${{ getFormattedPrice }}</b> — <em>{{ description }}</em></p>

        <p class="stats">
            Sells <b><span>{{ getRps }}</span></b> per second;
            <b>{{ getRisk }}%</b> risk
        </p>

        <button @click.exact="buySeller" :disabled="isBuyDisabled">Purchase</button>
        <button @click.exact="sellSeller" :disabled="isSellDisabled">Sell</button>
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { cookAndSellStore } from '@/store/cook-and-sell'
import { sellersStore } from '@/store/sellers'
import {
    buyPrice as getBuyPrice,
    formatNumber,
    formatPrice,
    formatRisk,
    formatRps,
} from '@/functions'

const props = withDefaults(
    defineProps<{
        sid: string
        label: string
        description: string
        amount: number
        risk: number
        rps: number
        baseCost: number
        cost: number
        unlockRps: number
        unlocked: boolean
    }>(),
    {
        unlocked: false,
    }
)

const getAmount = computed(() => {
    return formatNumber(props.amount, 0)
})

const getFormattedPrice = computed(() => {
    return formatPrice(buyPrice.value)
})

const getRps = computed(() => {
    return formatRps(props.rps)
})

const getRisk = computed(() => {
    return formatRisk(props.risk)
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

function buySeller() {
    sellersStore.buySeller(props.sid)
}

function sellSeller() {
    sellersStore.sellSeller(props.sid)
}
</script>
