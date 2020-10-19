<template>
    <UpgradeComponent v-for="item in unlockedUpgrades" v-bind="item" :key="item.sid"/>
</template>

<script lang="ts">
import { defineComponent } from "vue"
import UpgradeComponent from '@/components/Upgrade.vue'
import UpgradeType from '@/types/upgrades'
import { upgradesStore } from "@/store/upgrades"

export default defineComponent({
    components: { UpgradeComponent },
    computed: {
        unlockedUpgrades: (): UpgradeType[] => {
            return Object.values(upgradesStore.unlockedUpgrades()).sort((a: UpgradeType, b: UpgradeType) => a.cost - b.cost)
        },
    },
})
</script>
