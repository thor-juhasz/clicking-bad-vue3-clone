<template>
    <SellerComponent v-for="(item) in unlockedSellers" v-bind="item" :key="item.sid" />
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import SellerComponent from '@/components/Seller.vue'
import SellerType from '@/types/sellers'
import { sellersStore } from '@/store/sellers'

export default defineComponent({
    components: { SellerComponent },
    computed: {
        unlockedSellers: function(): Record<string, SellerType> { return sellersStore.unlockedSellers() },
    }
})
</script>
