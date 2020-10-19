<template>
    <CookerComponent v-for="item in unlockedCookers" v-bind="item" :key="item.sid"/>
</template>

<script lang="ts">
import { defineComponent } from "vue"
import CookerComponent from '@/components/Cooker.vue'
import CookerType from '@/types/cookers'
import { cookersStore } from "@/store/cookers"

export default defineComponent({
    components: { CookerComponent },
    computed: {
        unlockedCookers: function(): Record<string, CookerType> { return cookersStore.unlockedCookers() },
    },
})
</script>
