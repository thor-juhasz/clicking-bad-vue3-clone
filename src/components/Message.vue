<template>
    <div :class="getTypeClasses">
        <span v-html="getTypeIcon"></span>
        <span v-html="getMessage"></span>
    </div>
</template>

<script lang="ts">
import { defineComponent } from "vue"
import { messagesStore, MessageType } from "@/store/messages"

export default defineComponent({
    props: {
        id: {
            type: String,
            required: true,
        },
        type: {
            type: String,
            required: true,
        },
        message: {
            type: String,
            required: true,
        },
        time: {
            type: Number,
            required: true,
        }
    },
    computed: {
        getTimestamp(): string {
            let diff = (Date.now() - this.time) / 1000
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

            const date = new Date(this.time)

            return date.toLocaleString()
        },
        getTypeClasses(): object {
            return {
                message: true,
                generic: this.type === MessageType.Generic,
                good: this.type === MessageType.Good,
                bad: this.type === MessageType.Bad,
                error: this.type === MessageType.Error,
            }
        },
        getTypeIcon(): string {
            switch (this.type) {
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
        },
        getMessage(): string {
            return `${this.message} (${this.getTimestamp})`
        },
    },
    mounted() {
        setInterval(() => {
            const newId = '_' + Math.random().toString(36).substr(2, 9)
            messagesStore.updateMessageId(this.id, newId)
            // this.$forceUpdate()
        }, 1000)
    },
})
</script>
