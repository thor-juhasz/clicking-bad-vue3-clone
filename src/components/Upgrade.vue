<template>
    <div class="purchasable-item">
        <h3 :class="getLabelClasses">
            {{ label }}
            <span class="amount" v-if="!purchased">${{ getAmount }}</span>
            <span class="amount" v-else>✔</span>
        </h3>

        <p><em>{{ description }}</em></p>

        <button v-if="!purchased" @click="buyUpgrade" :disabled="isBuyDisabled">Purchase</button>
    </div>
</template>

<script setup lang="ts">
import { UpgradeAction } from '@/types/upgrades'
import { computed } from 'vue'
import { cookAndSellStore } from '@/store/cook-and-sell'
import { upgradesStore } from '@/store/upgrades'
import { formatPrice } from '@/functions'

const props = withDefaults(
    defineProps<{
        sid: string
        label: string
        description: string
        action: UpgradeAction | string | null
        purchased: boolean
        mod: number
        cost: number
        preReq: string | null
        hidden?: boolean
    }>(),
    {
        preReq: null,
    }
)

const getLabelClasses = computed(() => {
    return {
        label: true,
        purchased: props.purchased
    }
})

const getAmount = computed(() => {
    return formatPrice(props.cost)
})

const isBuyDisabled = computed(() => {
    return props.cost > cookAndSellStore.getState().cash
})

function buyUpgrade() {
    upgradesStore.buyUpgrade(props.sid)
}
</script>
