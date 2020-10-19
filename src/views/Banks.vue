<template>
    <BankComponent v-for="item in unlockedBanks" v-bind="item" :key="item.sid"/>

    <div class="bank-info">
        <h3 class="label">
            <a @click="toggleFinanceInfo">Laundering</a>
            <small class="amount">$ {{ getLaunderRps }} / sec</small>
        </h3>

        <div class="finance-info" :style="financeInfoStyles">
            <small>
                Total laundered <b>$ {{ getTotalLaundered }}</b>
                <br><br>

                Laundered cash is the amount of <em>your total cash</em> that is
                safe from being stolen or seized by the DEA or IRS. The more
                laundered to total cash you have, the lower the likelihood that
                you'll be audited. Laundered cash is not a separate resource,
                so it can never be higher than your total cash.
            </small>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent } from "vue"
import BankComponent from '@/components/Bank.vue'
import BankType from '@/types/banks'
import { banksStore } from '@/store/banks'
import { formatCurrency, formatNumber } from '@/functions'
import { statsStore } from "@/store/stats"

export default defineComponent({
    components: { BankComponent },
    data() {
        return {
            showFinanceInfo: true,
        }
    },
    computed: {
        unlockedBanks: function(): Record<string, BankType> { return banksStore.unlockedBanks() },
        getLaunderRps: function() {
            const amount = statsStore.getState().bankRps
            if (amount > 1_000) {
                return formatCurrency(amount, 2)
            } else {
                return formatCurrency(amount, 0)
            }
        },
        getTotalLaundered() {
            const totalLaundered = statsStore.getState().totalBank
            if (totalLaundered <= 1_000_000) {
                return formatNumber(totalLaundered, 2)
            }

            return formatCurrency(totalLaundered, 2)
        },
        financeInfoStyles() {
            if (this.showFinanceInfo) {
                return {
                    maxHeight: '300px',
                }
            }

            return {
                maxHeight: 0,
            }
        },
    },
    methods: {
        toggleFinanceInfo() {
            this.showFinanceInfo = !this.showFinanceInfo
        },
        formatCurrency: (amount: number, decimals?: number): string => formatCurrency(amount, decimals),
        formatNumber: (amount: number, decimals?: number): string => formatNumber(amount, decimals),
    },
})
</script>
