<template>
    <div class="purchasable-item">
        <h3 class="label">
            {{ label }}
            <span class="amount">{{ getAmount }}</span>
        </h3>

        <p><b>${{ getFormattedPrice }}</b> — <em>{{ description }}</em></p>

        <p class="stats">
            Cooks <b><span>{{ getRps }}</span></b> per second;
            <b>{{ getRisk }}%</b> risk
        </p>

        <button @click.exact="buyCooker" :disabled="isBuyDisabled">Purchase</button>
        <button @click.exact="sellCooker" :disabled="isSellDisabled">Sell</button>
    </div>
</template>

<script lang="ts">
import { defineComponent } from "vue"
import { cookAndSellStore } from "@/store/cook-and-sell"
import { cookersStore } from "@/store/cookers"
import {
    buyPrice,
    formatNumber,
    formatPrice,
    formatRisk,
    formatRps,
    sellPrice,
} from "@/functions"

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
        amount: {
            type: Number,
            required: true,
        },
        risk: {
            type: Number,
            required: true,
        },
        rps: {
            type: Number,
            required: true,
        },
        baseCost: {
            type: Number,
            required: true,
        },
        cost: {
            type: Number,
            required: true,
        },
        unlockRps: {
            type: Number,
            required: true,
        },
        unlocked: {
            type: Boolean,
            default: false,
        },
    },
    computed: {
        getAmount(): string {
            return formatNumber(this.amount, 0)
        },
        getFormattedPrice(): string {
            return formatPrice(this.buyPrice)
        },
        getRps(): string {
            return formatRps(this.rps)
        },
        getRisk(): string {
            return formatRisk(this.risk)
        },
        isBuyDisabled(): boolean {
            return this.buyPrice > cookAndSellStore.getState().cash
        },
        isSellDisabled(): boolean {
            return this.amount === 0
        },
        buyPrice(): number {
            return buyPrice(this.amount, this.baseCost)
        },
        sellPrice(): number {
            return sellPrice(this.amount, this.baseCost)
        },
    },
    methods: {
        buyCooker(): void {
            cookersStore.buyCooker(this.sid)
        },
        sellCooker(): void {
            cookersStore.sellCooker(this.sid)
        },
    },
})
</script>
