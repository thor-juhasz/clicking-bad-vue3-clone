<template>
    <div :class="getTypeClasses">
        <span v-html="getTypeIcon" />
        <span v-html="getMessage" />
    </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { MessageType } from '@/types/messages'
import { messagesStore } from '@/store/messages'

const props = defineProps<{
    id: string
    type: string
    message: string
    time: number
}>()

const getTimestamp = computed(() => {
    let diff = (Date.now() - props.time) / 1000
    if (diff < 5) {
        return `just now`
    } else if (diff < 60) {
        return `${diff.toFixed(0)} seconds ago`
    }

    diff /= 60
    if (diff < 60) {
        return `${diff.toFixed(0)} minutes ago`
    }

    diff /= 24
    if (diff < 24) {
        return `${diff.toFixed(0)} hours ago`
    }

    const date = new Date(props.time)

    return date.toLocaleString()
})

const getTypeClasses = computed(() => {
    return {
        message: true,
        generic: props.type === MessageType.Generic,
        good: props.type === MessageType.Good,
        bad: props.type === MessageType.Bad,
        error: props.type === MessageType.Error,
    }
})

const getTypeIcon = computed(() => {
    switch (props.type) {
        case MessageType.Generic:
            return '&#9993;'
        case MessageType.Good:
            return '&#9733;'
        case MessageType.Bad:
            return '&#10007;'
        case MessageType.Error:
            return '&#10007;'
    }

    return ''
})

const getMessage = computed(() => {
    return `${props.message} (${getTimestamp.value})`
})

onMounted(() => {
    setInterval(() => {
        const newId = '_' + Math.random().toString(36).substring(2, 9)
        messagesStore.updateMessageId(props.id, newId)
    }, 1000)
})
</script>
