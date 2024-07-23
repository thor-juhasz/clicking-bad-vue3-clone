<template>
    <div :class="getAchievementClasses">
        <h3 :class="getLabelClasses">
            {{ label }}
        </h3>

        <small>
            {{ description }}
        </small>
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
    sid: string
    label: string
    description: string
    property: string
    required: number
    unlocked: boolean
    value: number
    group: number
    minTime: number
    hidden: boolean
}>()

const getAchievementClasses = computed(() => {
    return {
        'purchasable-item': true,
        locked: !props.unlocked,
    }
})

const getLabelClasses = computed(() => {
    return {
        label: true,
        purchased: props.unlocked,
    }
})
</script>
