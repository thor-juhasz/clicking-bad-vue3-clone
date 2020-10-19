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

<script lang="ts">
import { defineComponent } from "vue"

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
        property: {
            type: String,
            required: true,
        },
        required: {
            type: Number,
            required: true,
        },
        unlocked: {
            type: Boolean,
            required: true,
        },
        value: {
            type: Number,
            required: true,
        },
        group: {
            type: Number,
            required: true,
        },
        minTime: {
            type: Number,
            required: true,
        },
        hidden: {
            type: Boolean,
            required: true,
        },
    },
    computed: {
        getAchievementClasses(): object {
            return {
                'purchasable-item': true,
                locked: !this.unlocked,
            }
        },
        getLabelClasses(): object {
            return {
                label: true,
                purchased: this.unlocked,
            }
        },
    },
})
</script>
