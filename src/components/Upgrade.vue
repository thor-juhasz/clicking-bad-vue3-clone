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

<script lang="ts">
import { defineComponent } from "vue"
import { cookAndSellStore } from "@/store/cook-and-sell"
import { upgradesStore } from "@/store/upgrades"
import { formatPrice } from "@/functions"

export default defineComponent({
    props: {
        sid: {
            type: String,
            required: true,
        },
        label: {
            type: String,
            required: true,
        },
        description: {
            type: String,
            required: true,
        },
        action: {
            required: true,
            validator: (prop: string | null) => (typeof prop === 'string' || prop === null),
        },
        purchased: {
            type: Boolean,
            required: true,
        },
        mod: {
            type: Number,
            required: true,
        },
        cost: {
            type: Number,
            required: true,
        },
        preReq: {
            default: null,
            validator: (prop: string | null) => (typeof prop === 'string' || prop === null),
        },
    },
    computed: {
        getLabelClasses(): object {
            return {
                label: true,
                purchased: this.purchased,
            }
        },
        getAmount(): string {
            return formatPrice(this.cost)
        },
        isBuyDisabled(): boolean {
            return this.cost > cookAndSellStore.getState().cash
        },
    },
    methods: {
        buyUpgrade(): void {
            upgradesStore.buyUpgrade(this.sid)
        },
    },
})
</script>
