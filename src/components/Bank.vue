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

<script lang="ts">
import { defineComponent } from "vue"
import { cookAndSellStore } from "@/store/cook-and-sell"
import { banksStore } from "@/store/banks"
import {
    buyPrice,
    formatNumber,
    formatPrice,
    formatRps,
    sellPrice
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
        rps: {
            type: Number,
            required: true,
        },
        unlockRps: {
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
        unlocked: {
            type: Boolean,
            default: false,
        },
    },
    data() {
        return {
            cookAndSell: cookAndSellStore.getState(),

            itemCost: this.cost,
        }
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
        buyBank(): void {
            banksStore.buyBank(this.sid)
        },
        sellBank(): void {
            banksStore.sellBank(this.sid)
        }
    },
})
</script>
