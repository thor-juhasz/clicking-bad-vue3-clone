<template>
    <AchievementComponent v-for="item in unlockedAchievements" v-bind="item" :key="item.sid" />
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import AchievementComponent from '@/components/Achievement.vue'
import AchievementType from '@/types/achievements'
import { achievementsStore } from '@/store/achievements'

export default defineComponent({
    components: { AchievementComponent },
    computed: {
        unlockedAchievements: function(): Record<string, AchievementType> { return achievementsStore.unlockedAchievements() },
    },
})
</script>
